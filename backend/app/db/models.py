"""
Database models for Marko
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum

class ContentType(str, enum.Enum):
    POST = "post"
    STORY = "story"
    REEL = "reel"
    CAROUSEL = "carousel"
    AD = "ad"

class ContentStatus(str, enum.Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    FAILED = "failed"

class Platform(str, enum.Enum):
    INSTAGRAM = "instagram"
    FACEBOOK = "facebook"
    TIKTOK = "tiktok"

# ============== Users ==============

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(255))
    company_name = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    meta_accounts = relationship("MetaAccount", back_populates="user")
    conversations = relationship("Conversation", back_populates="user")
    contents = relationship("Content", back_populates="user")
    campaigns = relationship("Campaign", back_populates="user")

# ============== Meta Integration ==============

class MetaAccount(Base):
    __tablename__ = "meta_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Meta identifiers
    meta_user_id = Column(String(255))
    access_token = Column(Text)  # Encrypted in production
    token_expires_at = Column(DateTime(timezone=True))
    
    # Business accounts
    facebook_page_id = Column(String(255))
    facebook_page_name = Column(String(255))
    instagram_account_id = Column(String(255))
    instagram_username = Column(String(255))
    ad_account_id = Column(String(255))
    
    # Status
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="meta_accounts")

# ============== Chat / Conversations ==============

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), default="New Chat")
    context = Column(JSON, default=dict)  # Store conversation context
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", order_by="Message.created_at")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    role = Column(String(50), nullable=False)  # user, assistant
    content = Column(Text, nullable=False)
    extra_data = Column(JSON, default=dict)  # Store any additional data
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")

# ============== Content ==============

class Content(Base):
    __tablename__ = "contents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=True)
    
    # Content details
    title = Column(String(255))
    content_type = Column(String(50), default="post")  # post, story, reel, carousel, ad
    platform = Column(String(50), default="instagram")  # instagram, facebook
    
    # Content body
    caption = Column(Text)
    media_urls = Column(JSON, default=list)  # List of media URLs
    hashtags = Column(JSON, default=list)
    
    # For ads
    headline = Column(String(255))
    cta_text = Column(String(50))  # Call to action
    link_url = Column(String(500))
    
    # Status
    status = Column(String(50), default="draft")  # draft, scheduled, published, failed
    scheduled_for = Column(DateTime(timezone=True))
    published_at = Column(DateTime(timezone=True))
    
    # Meta IDs after publishing
    meta_post_id = Column(String(255))
    meta_ad_id = Column(String(255))
    
    # AI generation metadata
    ai_prompt = Column(Text)
    ai_model = Column(String(100))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="contents")
    campaign = relationship("Campaign", back_populates="contents")
    analytics = relationship("ContentAnalytics", back_populates="content", uselist=False)

class ContentAnalytics(Base):
    __tablename__ = "content_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    content_id = Column(Integer, ForeignKey("contents.id"), nullable=False)
    
    # Metrics
    impressions = Column(Integer, default=0)
    reach = Column(Integer, default=0)
    engagement = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    saves = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    
    # For ads
    spend = Column(Integer, default=0)  # In cents
    conversions = Column(Integer, default=0)
    cpc = Column(Integer, default=0)  # Cost per click in cents
    cpm = Column(Integer, default=0)  # Cost per mille in cents
    roas = Column(Integer, default=0)  # Return on ad spend * 100
    
    last_updated = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    content = relationship("Content", back_populates="analytics")

# ============== Campaigns ==============

class Campaign(Base):
    __tablename__ = "campaigns"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Campaign settings
    objective = Column(String(100))  # awareness, engagement, conversions
    budget_cents = Column(Integer, default=0)  # Total budget in cents
    daily_budget_cents = Column(Integer, default=0)
    
    # Targeting (for ads)
    target_audience = Column(JSON, default=dict)
    
    # Schedule
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # AI strategy
    vibe = Column(Text)  # The marketing "vibe" / tone
    strategy = Column(JSON, default=dict)  # AI-generated strategy
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="campaigns")
    contents = relationship("Content", back_populates="campaign")
