"""
Campaigns API routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

from app.db.database import get_db
from app.db.models import User, Campaign, Content
from app.core.security import get_current_user
from app.services.ai_service import ai_service

router = APIRouter()

# ============== Schemas ==============

class CampaignCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    objective: Optional[str] = None  # awareness, engagement, conversions
    budget_cents: Optional[int] = None
    daily_budget_cents: Optional[int] = None
    target_audience: Optional[Dict] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class CampaignResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    objective: Optional[str]
    budget_cents: Optional[int]
    daily_budget_cents: Optional[int]
    vibe: Optional[str]
    strategy: Optional[Dict]
    is_active: bool
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    created_at: datetime
    content_count: int = 0
    
    class Config:
        from_attributes = True

class StrategyRequest(BaseModel):
    business_description: str
    goals: str
    budget: Optional[int] = None  # In euros
    duration_days: int = 30

class CampaignUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    objective: Optional[str] = None
    budget_cents: Optional[int] = None
    daily_budget_cents: Optional[int] = None
    target_audience: Optional[Dict] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None
    vibe: Optional[str] = None

# ============== Routes ==============

@router.post("/", response_model=CampaignResponse)
async def create_campaign(
    request: CampaignCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new campaign"""
    campaign = Campaign(
        user_id=current_user.id,
        name=request.name,
        description=request.description,
        objective=request.objective,
        budget_cents=request.budget_cents,
        daily_budget_cents=request.daily_budget_cents,
        target_audience=request.target_audience or {},
        start_date=request.start_date,
        end_date=request.end_date
    )
    
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    
    # Add content count
    campaign.content_count = 0
    
    return campaign

@router.get("/", response_model=List[CampaignResponse])
async def list_campaigns(
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all campaigns"""
    query = db.query(Campaign).filter(Campaign.user_id == current_user.id)
    
    if is_active is not None:
        query = query.filter(Campaign.is_active == is_active)
    
    campaigns = query.order_by(Campaign.created_at.desc()).all()
    
    # Add content counts
    for campaign in campaigns:
        campaign.content_count = db.query(Content).filter(
            Content.campaign_id == campaign.id
        ).count()
    
    return campaigns

@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific campaign"""
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.user_id == current_user.id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    campaign.content_count = db.query(Content).filter(
        Content.campaign_id == campaign.id
    ).count()
    
    return campaign

@router.put("/{campaign_id}", response_model=CampaignResponse)
async def update_campaign(
    campaign_id: int,
    request: CampaignUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update campaign"""
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.user_id == current_user.id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(campaign, field, value)
    
    db.commit()
    db.refresh(campaign)
    
    campaign.content_count = db.query(Content).filter(
        Content.campaign_id == campaign.id
    ).count()
    
    return campaign

@router.post("/{campaign_id}/generate-strategy")
async def generate_strategy(
    campaign_id: int,
    request: StrategyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate AI strategy for campaign"""
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.user_id == current_user.id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Generate strategy
    strategy = await ai_service.generate_strategy(
        business_description=request.business_description,
        goals=request.goals,
        budget=request.budget,
        duration_days=request.duration_days
    )
    
    # Save to campaign
    if "error" not in strategy:
        campaign.strategy = strategy
        campaign.vibe = strategy.get("vibe", "")
        db.commit()
    
    return strategy

@router.get("/{campaign_id}/content", response_model=List[dict])
async def get_campaign_content(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all content for a campaign"""
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.user_id == current_user.id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    contents = db.query(Content).filter(
        Content.campaign_id == campaign_id
    ).order_by(Content.created_at.desc()).all()
    
    return [
        {
            "id": c.id,
            "title": c.title,
            "content_type": c.content_type,
            "platform": c.platform,
            "status": c.status,
            "scheduled_for": c.scheduled_for,
            "published_at": c.published_at
        }
        for c in contents
    ]

@router.delete("/{campaign_id}")
async def delete_campaign(
    campaign_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete campaign (and unlink content)"""
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.user_id == current_user.id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Unlink content (don't delete)
    db.query(Content).filter(Content.campaign_id == campaign_id).update(
        {"campaign_id": None}
    )
    
    db.delete(campaign)
    db.commit()
    
    return {"status": "deleted"}
