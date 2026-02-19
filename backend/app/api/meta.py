"""
Meta Integration API routes
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import secrets

from app.db.database import get_db
from app.db.models import User, MetaAccount, OAuthState
from app.core.security import get_current_user
from app.services.meta_service import meta_service

router = APIRouter()

# ============== Schemas ==============

class MetaAccountResponse(BaseModel):
    id: int
    facebook_page_id: Optional[str]
    facebook_page_name: Optional[str]
    instagram_account_id: Optional[str]
    instagram_username: Optional[str]
    ad_account_id: Optional[str]
    is_active: bool
    
    class Config:
        from_attributes = True

class OAuthCallbackRequest(BaseModel):
    code: str
    state: str

class PageSelection(BaseModel):
    page_id: str
    page_name: str
    page_token: str
    instagram_account_id: Optional[str] = None
    instagram_username: Optional[str] = None

class PublishRequest(BaseModel):
    platform: str  # instagram, facebook
    content_type: str  # post, story, reel
    caption: str
    media_url: Optional[str] = None
    link: Optional[str] = None

# ============== Routes ==============

@router.get("/status")
async def get_meta_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if Meta account is connected"""
    account = db.query(MetaAccount).filter(
        MetaAccount.user_id == current_user.id,
        MetaAccount.is_active == True
    ).first()
    
    if not account:
        return {"connected": False}
    
    return {
        "connected": True,
        "facebook_page": account.facebook_page_name,
        "instagram_username": account.instagram_username,
        "ad_account": account.ad_account_id
    }

@router.get("/connect")
async def get_connect_url(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get OAuth URL to connect Meta account"""
    state = secrets.token_urlsafe(32)
    
    # Clean up old unused states for this user (older than 30 minutes)
    old_threshold = datetime.utcnow() - timedelta(minutes=30)
    db.query(OAuthState).filter(
        OAuthState.user_id == current_user.id,
        OAuthState.created_at < old_threshold
    ).delete()
    
    # Store state in database
    oauth_state = OAuthState(
        state=state,
        user_id=current_user.id
    )
    db.add(oauth_state)
    db.commit()
    
    oauth_url = meta_service.get_oauth_url(state)
    return {"oauth_url": oauth_url}

@router.post("/callback")
async def handle_callback(
    request: OAuthCallbackRequest,
    db: Session = Depends(get_db)
):
    """Handle OAuth callback from Meta"""
    # Verify state from database
    oauth_state = db.query(OAuthState).filter(
        OAuthState.state == request.state,
        OAuthState.used == False
    ).first()
    
    if not oauth_state:
        raise HTTPException(status_code=400, detail="Invalid state")
    
    # Check state age (max 10 minutes)
    if datetime.utcnow() - oauth_state.created_at > timedelta(minutes=10):
        db.delete(oauth_state)
        db.commit()
        raise HTTPException(status_code=400, detail="State expired")
    
    # Mark state as used
    oauth_state.used = True
    db.commit()
    
    user_id = oauth_state.user_id
    
    # Exchange code for token
    token_response = await meta_service.exchange_code(request.code)
    
    if "error" in token_response:
        raise HTTPException(status_code=400, detail=token_response["error"]["message"])
    
    short_token = token_response["access_token"]
    
    # Get long-lived token
    long_token_response = await meta_service.get_long_lived_token(short_token)
    access_token = long_token_response.get("access_token", short_token)
    expires_in = long_token_response.get("expires_in", 3600)
    
    # Get user info
    user_info = await meta_service.get_user_info(access_token)
    
    # Get pages
    pages = await meta_service.get_pages(access_token)
    
    # Get ad accounts
    ad_accounts = await meta_service.get_ad_accounts(access_token)
    
    # Store basic connection (user will select page later)
    # Remove any existing account first
    db.query(MetaAccount).filter(MetaAccount.user_id == user_id).delete()
    
    account = MetaAccount(
        user_id=user_id,
        meta_user_id=user_info.get("id"),
        access_token=access_token,
        token_expires_at=datetime.utcnow() + timedelta(seconds=expires_in),
        is_active=False  # Will be activated when page is selected
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    
    # Build pages response with Instagram info
    pages_response = []
    for p in pages:
        page_data = {
            "id": p["id"],
            "name": p["name"],
            "has_instagram": "instagram_business_account" in p,
            "access_token": p.get("access_token")  # Page-level access token
        }
        
        # If page has Instagram, fetch the account details
        if "instagram_business_account" in p:
            ig_account = p["instagram_business_account"]
            page_data["instagram_account"] = {
                "id": ig_account.get("id"),
                "username": ig_account.get("username", "")
            }
            # If we didn't get username, try to fetch it
            if not ig_account.get("username") and p.get("access_token"):
                ig_info = await meta_service.get_instagram_account(p["id"], p["access_token"])
                if ig_info:
                    page_data["instagram_account"] = {
                        "id": ig_info.get("id"),
                        "username": ig_info.get("username", "")
                    }
        
        pages_response.append(page_data)
    
    return {
        "status": "connected",
        "account_id": account.id,
        "pages": pages_response,
        "ad_accounts": [
            {
                "id": a["id"],
                "name": a["name"]
            }
            for a in ad_accounts
        ]
    }

@router.post("/select-page")
async def select_page(
    selection: PageSelection,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Select Facebook Page and Instagram account to use"""
    account = db.query(MetaAccount).filter(
        MetaAccount.user_id == current_user.id
    ).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="No Meta connection found. Please connect first.")
    
    account.facebook_page_id = selection.page_id
    account.facebook_page_name = selection.page_name
    account.page_access_token = selection.page_token  # Store page-level token for publishing
    
    if selection.instagram_account_id:
        account.instagram_account_id = selection.instagram_account_id
        account.instagram_username = selection.instagram_username
    
    account.is_active = True
    db.commit()
    
    return {"status": "configured", "account": MetaAccountResponse.model_validate(account)}

@router.post("/publish")
async def publish_content(
    request: PublishRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Publish content to Meta platform"""
    account = db.query(MetaAccount).filter(
        MetaAccount.user_id == current_user.id,
        MetaAccount.is_active == True
    ).first()
    
    if not account:
        raise HTTPException(status_code=400, detail="No active Meta account. Please connect first.")
    
    # Use page token for publishing, fallback to user token
    publish_token = account.page_access_token or account.access_token
    
    if request.platform == "instagram":
        if not account.instagram_account_id:
            raise HTTPException(status_code=400, detail="No Instagram account connected")
        
        result = await meta_service.publish_to_instagram(
            ig_user_id=account.instagram_account_id,
            access_token=publish_token,
            caption=request.caption,
            image_url=request.media_url if request.content_type != "reel" else None,
            video_url=request.media_url if request.content_type in ["reel", "video"] else None,
            media_type="REELS" if request.content_type == "reel" else "IMAGE"
        )
    
    elif request.platform == "facebook":
        if not account.facebook_page_id:
            raise HTTPException(status_code=400, detail="No Facebook page connected")
        
        result = await meta_service.publish_to_facebook(
            page_id=account.facebook_page_id,
            page_token=publish_token,  # Now correctly using page token
            message=request.caption,
            link=request.link,
            photo_url=request.media_url
        )
    
    else:
        raise HTTPException(status_code=400, detail="Invalid platform")
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"]["message"])
    
    return {"status": "published", "post_id": result.get("id")}

@router.get("/accounts", response_model=List[MetaAccountResponse])
async def get_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all Meta accounts for current user"""
    accounts = db.query(MetaAccount).filter(
        MetaAccount.user_id == current_user.id
    ).all()
    return accounts

@router.delete("/disconnect")
async def disconnect(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Disconnect Meta account"""
    db.query(MetaAccount).filter(MetaAccount.user_id == current_user.id).delete()
    db.commit()
    return {"status": "disconnected"}
