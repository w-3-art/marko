"""
Meta (Facebook/Instagram) API Service
"""
import httpx
from typing import Optional, Dict, List
from datetime import datetime, timedelta
from app.core.config import settings

class MetaService:
    BASE_URL = "https://graph.facebook.com/v19.0"
    
    def __init__(self):
        self.app_id = settings.meta_app_id
        self.app_secret = settings.meta_app_secret
        self.redirect_uri = settings.meta_redirect_uri
    
    def get_oauth_url(self, state: str) -> str:
        """Get the OAuth URL for Meta login"""
        scopes = [
            "pages_show_list",
            "pages_read_engagement",
            "pages_manage_posts",
            "instagram_basic",
            "instagram_content_publish",
            "instagram_manage_insights",
            "ads_management",
            "ads_read",
            "business_management"
        ]
        
        return (
            f"https://www.facebook.com/v19.0/dialog/oauth?"
            f"client_id={self.app_id}"
            f"&redirect_uri={self.redirect_uri}"
            f"&scope={','.join(scopes)}"
            f"&state={state}"
            f"&response_type=code"
        )
    
    async def exchange_code(self, code: str) -> Dict:
        """Exchange auth code for access token"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/oauth/access_token",
                params={
                    "client_id": self.app_id,
                    "client_secret": self.app_secret,
                    "redirect_uri": self.redirect_uri,
                    "code": code
                }
            )
            return response.json()
    
    async def get_long_lived_token(self, short_token: str) -> Dict:
        """Exchange short-lived token for long-lived token (60 days)"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/oauth/access_token",
                params={
                    "grant_type": "fb_exchange_token",
                    "client_id": self.app_id,
                    "client_secret": self.app_secret,
                    "fb_exchange_token": short_token
                }
            )
            return response.json()
    
    async def get_user_info(self, access_token: str) -> Dict:
        """Get basic user info"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/me",
                params={
                    "fields": "id,name,email",
                    "access_token": access_token
                }
            )
            return response.json()
    
    async def get_pages(self, access_token: str) -> List[Dict]:
        """Get user's Facebook pages"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/me/accounts",
                params={
                    "fields": "id,name,access_token,instagram_business_account",
                    "access_token": access_token
                }
            )
            data = response.json()
            return data.get("data", [])
    
    async def get_instagram_account(self, page_id: str, page_token: str) -> Optional[Dict]:
        """Get Instagram Business Account linked to a Facebook Page"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/{page_id}",
                params={
                    "fields": "instagram_business_account{id,username,profile_picture_url,followers_count}",
                    "access_token": page_token
                }
            )
            data = response.json()
            return data.get("instagram_business_account")
    
    async def get_ad_accounts(self, access_token: str) -> List[Dict]:
        """Get user's ad accounts"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/me/adaccounts",
                params={
                    "fields": "id,name,account_status,currency,timezone_name",
                    "access_token": access_token
                }
            )
            data = response.json()
            return data.get("data", [])
    
    # ============== Publishing ==============
    
    async def publish_to_instagram(
        self,
        ig_user_id: str,
        access_token: str,
        caption: str,
        image_url: Optional[str] = None,
        video_url: Optional[str] = None,
        media_type: str = "IMAGE"  # IMAGE, VIDEO, CAROUSEL, REELS, STORIES
    ) -> Dict:
        """
        Publish content to Instagram
        
        For images/videos, we need to:
        1. Create a media container
        2. Publish the container
        """
        async with httpx.AsyncClient() as client:
            # Step 1: Create media container
            container_params = {
                "access_token": access_token,
                "caption": caption
            }
            
            if media_type == "IMAGE" and image_url:
                container_params["image_url"] = image_url
            elif media_type == "VIDEO" and video_url:
                container_params["video_url"] = video_url
                container_params["media_type"] = "VIDEO"
            elif media_type == "REELS" and video_url:
                container_params["video_url"] = video_url
                container_params["media_type"] = "REELS"
            
            response = await client.post(
                f"{self.BASE_URL}/{ig_user_id}/media",
                data=container_params
            )
            container_data = response.json()
            
            if "error" in container_data:
                return container_data
            
            container_id = container_data.get("id")
            
            # Step 2: Publish the container
            response = await client.post(
                f"{self.BASE_URL}/{ig_user_id}/media_publish",
                data={
                    "creation_id": container_id,
                    "access_token": access_token
                }
            )
            return response.json()
    
    async def publish_to_facebook(
        self,
        page_id: str,
        page_token: str,
        message: str,
        link: Optional[str] = None,
        photo_url: Optional[str] = None
    ) -> Dict:
        """Publish a post to Facebook Page"""
        async with httpx.AsyncClient() as client:
            data = {
                "message": message,
                "access_token": page_token
            }
            
            if link:
                data["link"] = link
            
            endpoint = f"{self.BASE_URL}/{page_id}/feed"
            
            if photo_url:
                endpoint = f"{self.BASE_URL}/{page_id}/photos"
                data["url"] = photo_url
            
            response = await client.post(endpoint, data=data)
            return response.json()
    
    # ============== Analytics ==============
    
    async def get_instagram_insights(
        self,
        ig_user_id: str,
        access_token: str,
        metrics: List[str] = None,
        period: str = "day"
    ) -> Dict:
        """Get Instagram account insights"""
        if metrics is None:
            metrics = ["impressions", "reach", "profile_views", "follower_count"]
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/{ig_user_id}/insights",
                params={
                    "metric": ",".join(metrics),
                    "period": period,
                    "access_token": access_token
                }
            )
            return response.json()
    
    async def get_post_insights(
        self,
        media_id: str,
        access_token: str
    ) -> Dict:
        """Get insights for a specific Instagram post"""
        metrics = ["impressions", "reach", "engagement", "saved", "likes", "comments", "shares"]
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/{media_id}/insights",
                params={
                    "metric": ",".join(metrics),
                    "access_token": access_token
                }
            )
            return response.json()
    
    async def get_page_insights(
        self,
        page_id: str,
        page_token: str,
        metrics: List[str] = None,
        period: str = "day"
    ) -> Dict:
        """Get Facebook Page insights"""
        if metrics is None:
            metrics = ["page_impressions", "page_engaged_users", "page_fans"]
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/{page_id}/insights",
                params={
                    "metric": ",".join(metrics),
                    "period": period,
                    "access_token": page_token
                }
            )
            return response.json()

# Singleton instance
meta_service = MetaService()
