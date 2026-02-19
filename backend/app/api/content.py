"""
Content API routes - Create and manage content
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.db.database import get_db
from app.db.models import User, Content, ContentAnalytics, MetaAccount
from app.core.security import get_current_user
from app.services.ai_service import ai_service
from app.services.meta_service import meta_service

router = APIRouter()

# ============== Schemas ==============

class ContentGenerateRequest(BaseModel):
    content_type: str  # post, story, reel, carousel, ad
    platform: str  # instagram, facebook
    brief: str
    brand_voice: Optional[str] = None
    target_audience: Optional[str] = None
    objective: Optional[str] = None

class ContentCreateRequest(BaseModel):
    title: Optional[str] = None
    content_type: str = "post"
    platform: str = "instagram"
    caption: str
    media_urls: List[str] = []
    hashtags: List[str] = []
    headline: Optional[str] = None
    cta_text: Optional[str] = None
    link_url: Optional[str] = None
    scheduled_for: Optional[datetime] = None
    campaign_id: Optional[int] = None

class ContentResponse(BaseModel):
    id: int
    title: Optional[str]
    content_type: str
    platform: str
    caption: Optional[str]
    media_urls: List[str]
    hashtags: List[str]
    headline: Optional[str]
    cta_text: Optional[str]
    link_url: Optional[str]
    status: str
    scheduled_for: Optional[datetime]
    published_at: Optional[datetime]
    meta_post_id: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class ContentUpdateRequest(BaseModel):
    title: Optional[str] = None
    caption: Optional[str] = None
    media_urls: Optional[List[str]] = None
    hashtags: Optional[List[str]] = None
    headline: Optional[str] = None
    cta_text: Optional[str] = None
    link_url: Optional[str] = None
    scheduled_for: Optional[datetime] = None
    status: Optional[str] = None

# ============== Routes ==============

@router.post("/generate")
async def generate_content(
    request: ContentGenerateRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate content using AI"""
    result = await ai_service.generate_content(
        content_type=request.content_type,
        platform=request.platform,
        brief=request.brief,
        brand_voice=request.brand_voice,
        target_audience=request.target_audience,
        objective=request.objective
    )
    
    return result

@router.post("/", response_model=ContentResponse)
async def create_content(
    request: ContentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new content"""
    content = Content(
        user_id=current_user.id,
        campaign_id=request.campaign_id,
        title=request.title,
        content_type=request.content_type,
        platform=request.platform,
        caption=request.caption,
        media_urls=request.media_urls,
        hashtags=request.hashtags,
        headline=request.headline,
        cta_text=request.cta_text,
        link_url=request.link_url,
        scheduled_for=request.scheduled_for,
        status="scheduled" if request.scheduled_for else "draft"
    )
    
    db.add(content)
    db.commit()
    db.refresh(content)
    
    return content

@router.get("/", response_model=List[ContentResponse])
async def list_content(
    status: Optional[str] = None,
    content_type: Optional[str] = None,
    platform: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all content"""
    query = db.query(Content).filter(Content.user_id == current_user.id)
    
    if status:
        query = query.filter(Content.status == status)
    if content_type:
        query = query.filter(Content.content_type == content_type)
    if platform:
        query = query.filter(Content.platform == platform)
    
    contents = query.order_by(Content.created_at.desc()).limit(limit).all()
    return contents

@router.get("/{content_id}", response_model=ContentResponse)
async def get_content(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific content"""
    content = db.query(Content).filter(
        Content.id == content_id,
        Content.user_id == current_user.id
    ).first()
    
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    return content

@router.put("/{content_id}", response_model=ContentResponse)
async def update_content(
    content_id: int,
    request: ContentUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update content"""
    content = db.query(Content).filter(
        Content.id == content_id,
        Content.user_id == current_user.id
    ).first()
    
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    if content.status == "published":
        raise HTTPException(status_code=400, detail="Cannot edit published content")
    
    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(content, field, value)
    
    db.commit()
    db.refresh(content)
    
    return content

@router.post("/{content_id}/publish")
async def publish_content(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Publish content to Meta"""
    content = db.query(Content).filter(
        Content.id == content_id,
        Content.user_id == current_user.id
    ).first()
    
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    if content.status == "published":
        raise HTTPException(status_code=400, detail="Content already published")
    
    # Get Meta account
    account = db.query(MetaAccount).filter(
        MetaAccount.user_id == current_user.id,
        MetaAccount.is_active == True
    ).first()
    
    if not account:
        raise HTTPException(status_code=400, detail="No active Meta account")
    
    # Build caption with hashtags
    full_caption = content.caption or ""
    if content.hashtags:
        full_caption += "\n\n" + " ".join([f"#{h}" for h in content.hashtags])
    
    # Use page token for publishing, fallback to user token
    publish_token = account.page_access_token or account.access_token
    
    # Publish based on platform
    if content.platform == "instagram":
        if not account.instagram_account_id:
            raise HTTPException(status_code=400, detail="No Instagram account connected")
        
        media_url = content.media_urls[0] if content.media_urls else None
        
        result = await meta_service.publish_to_instagram(
            ig_user_id=account.instagram_account_id,
            access_token=publish_token,
            caption=full_caption,
            image_url=media_url if content.content_type != "reel" else None,
            video_url=media_url if content.content_type in ["reel", "video"] else None,
            media_type="REELS" if content.content_type == "reel" else "IMAGE"
        )
    
    elif content.platform == "facebook":
        if not account.facebook_page_id:
            raise HTTPException(status_code=400, detail="No Facebook page connected")
        
        media_url = content.media_urls[0] if content.media_urls else None
        
        result = await meta_service.publish_to_facebook(
            page_id=account.facebook_page_id,
            page_token=publish_token,  # Now correctly using page token
            message=full_caption,
            link=content.link_url,
            photo_url=media_url
        )
    
    else:
        raise HTTPException(status_code=400, detail="Invalid platform")
    
    if "error" in result:
        content.status = "failed"
        db.commit()
        raise HTTPException(status_code=400, detail=result["error"]["message"])
    
    # Update content status
    content.status = "published"
    content.published_at = datetime.utcnow()
    content.meta_post_id = result.get("id")
    
    # Create analytics entry
    analytics = ContentAnalytics(content_id=content.id)
    db.add(analytics)
    
    db.commit()
    
    return {
        "status": "published",
        "post_id": content.meta_post_id,
        "platform": content.platform
    }

@router.delete("/{content_id}")
async def delete_content(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete content"""
    content = db.query(Content).filter(
        Content.id == content_id,
        Content.user_id == current_user.id
    ).first()
    
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Delete analytics if exists
    db.query(ContentAnalytics).filter(ContentAnalytics.content_id == content_id).delete()
    db.delete(content)
    db.commit()
    
    return {"status": "deleted"}
