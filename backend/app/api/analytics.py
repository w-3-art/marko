"""
Analytics API routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime, timedelta

from app.db.database import get_db
from app.db.models import User, Content, ContentAnalytics, Campaign, MetaAccount
from app.core.security import get_current_user
from app.services.ai_service import ai_service
from app.services.meta_service import meta_service

router = APIRouter()

# ============== Schemas ==============

class AnalyticsOverview(BaseModel):
    total_content: int
    published_content: int
    total_impressions: int
    total_reach: int
    total_engagement: int
    total_spend_cents: int
    average_engagement_rate: float
    best_performing_type: Optional[str]

class ContentAnalyticsResponse(BaseModel):
    content_id: int
    impressions: int
    reach: int
    engagement: int
    likes: int
    comments: int
    shares: int
    saves: int
    clicks: int
    spend: int
    conversions: int
    cpc: int
    roas: int
    
    class Config:
        from_attributes = True

# ============== Routes ==============

@router.get("/overview")
async def get_analytics_overview(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> AnalyticsOverview:
    """Get analytics overview for the user"""
    since = datetime.utcnow() - timedelta(days=days)
    
    # Get content counts
    total_content = db.query(Content).filter(
        Content.user_id == current_user.id,
        Content.created_at >= since
    ).count()
    
    published_content = db.query(Content).filter(
        Content.user_id == current_user.id,
        Content.status == "published",
        Content.published_at >= since
    ).count()
    
    # Get aggregated analytics
    analytics = db.query(
        func.sum(ContentAnalytics.impressions).label("impressions"),
        func.sum(ContentAnalytics.reach).label("reach"),
        func.sum(ContentAnalytics.engagement).label("engagement"),
        func.sum(ContentAnalytics.spend).label("spend")
    ).join(Content).filter(
        Content.user_id == current_user.id,
        Content.published_at >= since
    ).first()
    
    # Calculate engagement rate
    total_impressions = analytics.impressions or 0
    total_engagement = analytics.engagement or 0
    engagement_rate = (total_engagement / total_impressions * 100) if total_impressions > 0 else 0
    
    # Find best performing content type
    best_type = db.query(
        Content.content_type,
        func.avg(ContentAnalytics.engagement).label("avg_engagement")
    ).join(ContentAnalytics).filter(
        Content.user_id == current_user.id
    ).group_by(Content.content_type).order_by(
        func.avg(ContentAnalytics.engagement).desc()
    ).first()
    
    return AnalyticsOverview(
        total_content=total_content,
        published_content=published_content,
        total_impressions=total_impressions,
        total_reach=analytics.reach or 0,
        total_engagement=total_engagement,
        total_spend_cents=analytics.spend or 0,
        average_engagement_rate=round(engagement_rate, 2),
        best_performing_type=best_type.content_type if best_type else None
    )

@router.get("/content/{content_id}")
async def get_content_analytics(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analytics for specific content"""
    content = db.query(Content).filter(
        Content.id == content_id,
        Content.user_id == current_user.id
    ).first()
    
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    analytics = db.query(ContentAnalytics).filter(
        ContentAnalytics.content_id == content_id
    ).first()
    
    if not analytics:
        return {
            "content_id": content_id,
            "status": content.status,
            "message": "No analytics available yet"
        }
    
    return {
        "content_id": content_id,
        "content_type": content.content_type,
        "platform": content.platform,
        "published_at": content.published_at,
        "metrics": {
            "impressions": analytics.impressions,
            "reach": analytics.reach,
            "engagement": analytics.engagement,
            "likes": analytics.likes,
            "comments": analytics.comments,
            "shares": analytics.shares,
            "saves": analytics.saves,
            "clicks": analytics.clicks
        },
        "ad_metrics": {
            "spend_cents": analytics.spend,
            "conversions": analytics.conversions,
            "cpc_cents": analytics.cpc,
            "cpm_cents": analytics.cpm,
            "roas_x100": analytics.roas
        } if analytics.spend > 0 else None
    }

@router.post("/content/{content_id}/refresh")
async def refresh_content_analytics(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Refresh analytics from Meta API"""
    content = db.query(Content).filter(
        Content.id == content_id,
        Content.user_id == current_user.id,
        Content.status == "published"
    ).first()
    
    if not content:
        raise HTTPException(status_code=404, detail="Published content not found")
    
    if not content.meta_post_id:
        raise HTTPException(status_code=400, detail="No Meta post ID")
    
    # Get Meta account
    account = db.query(MetaAccount).filter(
        MetaAccount.user_id == current_user.id,
        MetaAccount.is_active == True
    ).first()
    
    if not account:
        raise HTTPException(status_code=400, detail="No active Meta account")
    
    # Fetch insights from Meta
    try:
        insights = await meta_service.get_post_insights(
            media_id=content.meta_post_id,
            access_token=account.access_token
        )
        
        if "error" in insights:
            raise HTTPException(status_code=400, detail=insights["error"]["message"])
        
        # Update analytics
        analytics = db.query(ContentAnalytics).filter(
            ContentAnalytics.content_id == content_id
        ).first()
        
        if not analytics:
            analytics = ContentAnalytics(content_id=content_id)
            db.add(analytics)
        
        # Parse insights data
        for metric in insights.get("data", []):
            name = metric.get("name")
            value = metric.get("values", [{}])[0].get("value", 0)
            
            if name == "impressions":
                analytics.impressions = value
            elif name == "reach":
                analytics.reach = value
            elif name == "engagement":
                analytics.engagement = value
            elif name == "likes":
                analytics.likes = value
            elif name == "comments":
                analytics.comments = value
            elif name == "shares":
                analytics.shares = value
            elif name == "saved":
                analytics.saves = value
        
        analytics.last_updated = datetime.utcnow()
        db.commit()
        
        return {"status": "refreshed", "content_id": content_id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/content/{content_id}/analyze")
async def analyze_content_performance(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI analysis of content performance"""
    content = db.query(Content).filter(
        Content.id == content_id,
        Content.user_id == current_user.id
    ).first()
    
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    analytics = db.query(ContentAnalytics).filter(
        ContentAnalytics.content_id == content_id
    ).first()
    
    if not analytics:
        raise HTTPException(status_code=400, detail="No analytics available")
    
    metrics = {
        "impressions": analytics.impressions,
        "reach": analytics.reach,
        "engagement": analytics.engagement,
        "likes": analytics.likes,
        "comments": analytics.comments,
        "shares": analytics.shares,
        "clicks": analytics.clicks,
        "spend": analytics.spend,
        "cpc": analytics.cpc,
        "roas": analytics.roas
    }
    
    analysis = await ai_service.analyze_performance(
        metrics=metrics,
        content_type=content.content_type,
        industry=current_user.company_name
    )
    
    return {
        "content_id": content_id,
        "metrics": metrics,
        "analysis": analysis
    }

@router.get("/campaign/{campaign_id}")
async def get_campaign_analytics(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analytics for a campaign"""
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.user_id == current_user.id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Get aggregated analytics for campaign content
    analytics = db.query(
        func.count(Content.id).label("content_count"),
        func.sum(ContentAnalytics.impressions).label("impressions"),
        func.sum(ContentAnalytics.reach).label("reach"),
        func.sum(ContentAnalytics.engagement).label("engagement"),
        func.sum(ContentAnalytics.spend).label("spend"),
        func.sum(ContentAnalytics.conversions).label("conversions")
    ).join(ContentAnalytics, Content.id == ContentAnalytics.content_id).filter(
        Content.campaign_id == campaign_id
    ).first()
    
    # Get content breakdown
    content_stats = db.query(
        Content.content_type,
        Content.status,
        func.count(Content.id).label("count")
    ).filter(
        Content.campaign_id == campaign_id
    ).group_by(Content.content_type, Content.status).all()
    
    return {
        "campaign_id": campaign_id,
        "campaign_name": campaign.name,
        "budget_cents": campaign.budget_cents,
        "spent_cents": analytics.spend or 0,
        "metrics": {
            "content_count": analytics.content_count or 0,
            "impressions": analytics.impressions or 0,
            "reach": analytics.reach or 0,
            "engagement": analytics.engagement or 0,
            "conversions": analytics.conversions or 0
        },
        "content_breakdown": [
            {
                "type": s.content_type,
                "status": s.status,
                "count": s.count
            }
            for s in content_stats
        ]
    }

@router.get("/top-content")
async def get_top_content(
    limit: int = 10,
    metric: str = "engagement",  # engagement, impressions, reach
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get top performing content"""
    order_column = {
        "engagement": ContentAnalytics.engagement,
        "impressions": ContentAnalytics.impressions,
        "reach": ContentAnalytics.reach
    }.get(metric, ContentAnalytics.engagement)
    
    results = db.query(Content, ContentAnalytics).join(
        ContentAnalytics, Content.id == ContentAnalytics.content_id
    ).filter(
        Content.user_id == current_user.id
    ).order_by(order_column.desc()).limit(limit).all()
    
    return [
        {
            "id": content.id,
            "title": content.title,
            "content_type": content.content_type,
            "platform": content.platform,
            "caption": content.caption[:100] + "..." if content.caption and len(content.caption) > 100 else content.caption,
            "published_at": content.published_at,
            "metrics": {
                "impressions": analytics.impressions,
                "reach": analytics.reach,
                "engagement": analytics.engagement,
                "likes": analytics.likes,
                "comments": analytics.comments
            }
        }
        for content, analytics in results
    ]
