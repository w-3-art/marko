"""
Marko Backend - AI CMO API
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

load_dotenv()

from app.api import auth, chat, meta, content, campaigns, analytics
from app.db.database import engine, Base
from app.core.config import settings

# Create static/images directory for generated images at module load time
# This ensures directory exists before StaticFiles mount
os.makedirs("static/images", exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    pass

app = FastAPI(
    title="Marko API",
    description="Your AI CMO - Marketing automation made simple",
    version="0.1.0",
    lifespan=lifespan
)

# CORS - parse allowed origins from env variable
allowed_origins = [origin.strip() for origin in settings.allowed_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for serving generated images
# NOTE: Railway has EPHEMERAL filesystem - images will be lost on redeploy.
# For production V2: use Cloudinary, S3, or similar persistent storage.
app.mount("/static", StaticFiles(directory="static"), name="static")

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(meta.router, prefix="/api/meta", tags=["Meta Integration"])
app.include_router(content.router, prefix="/api/content", tags=["Content"])
app.include_router(campaigns.router, prefix="/api/campaigns", tags=["Campaigns"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
async def root():
    return {
        "name": "Marko API",
        "version": "0.1.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
