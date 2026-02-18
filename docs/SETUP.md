# 🚀 Marko Setup Guide

## Prerequisites

- Python 3.11+
- Node.js 18+
- pnpm or npm

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy env file and configure
cp .env.example .env
# Edit .env with your keys
```

### 2. Configure Environment Variables

Edit `backend/.env`:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-xxx  # Get from console.anthropic.com

# Optional for Meta integration
META_APP_ID=your-app-id
META_APP_SECRET=your-app-secret
META_REDIRECT_URI=http://localhost:3000/callback/meta

# JWT Secret (generate with: openssl rand -hex 32)
JWT_SECRET=your-secret-key
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install  # or pnpm install

# Copy env file
cp .env.local.example .env.local
```

### 4. Run Development Servers

**Option A: Using the script**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

**Option B: Manually**

Terminal 1 (Backend):
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 5. Access Marko

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Meta Integration Setup

To enable Instagram/Facebook publishing:

### 1. Create a Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app (Business type)
3. Add the following products:
   - Facebook Login
   - Instagram Graph API
   - Marketing API

### 2. Configure Permissions

In App Review, request these permissions:
- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_posts`
- `instagram_basic`
- `instagram_content_publish`
- `instagram_manage_insights`
- `ads_management`
- `ads_read`

### 3. Add to Environment

```env
META_APP_ID=your-app-id
META_APP_SECRET=your-app-secret
META_REDIRECT_URI=http://localhost:3000/callback/meta
```

### 4. Create OAuth Callback Page

The callback page is already set up at `/callback/meta`. Make sure your Meta app has this URL in the Valid OAuth Redirect URIs.

---

## Deployment (Railway)

### Backend

```bash
cd backend
railway login
railway init
railway link
railway up
```

Set environment variables in Railway dashboard.

### Frontend

```bash
cd frontend
railway init
railway link
railway up
```

Set `NEXT_PUBLIC_API_URL` to your backend Railway URL.

---

## Troubleshooting

### "Module not found" errors in backend
```bash
pip install -r requirements.txt
```

### "CORS error" in frontend
Make sure the backend CORS settings include your frontend URL.

### Meta login not working
1. Check app permissions are approved
2. Verify redirect URI matches exactly
3. Check app is in "Live" mode for production

---

## Architecture

```
marko/
├── backend/           # FastAPI Python backend
│   ├── app/
│   │   ├── api/       # API routes
│   │   ├── core/      # Config, security
│   │   ├── db/        # Database models
│   │   └── services/  # AI, Meta services
│   └── main.py
├── frontend/          # Next.js React frontend
│   └── src/
│       ├── app/       # Pages
│       ├── components/
│       └── lib/       # API client
└── docs/
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login |
| `/api/auth/me` | GET | Get current user |
| `/api/chat/send` | POST | Send message to Marko |
| `/api/chat/conversations` | GET | List conversations |
| `/api/content/generate` | POST | Generate content with AI |
| `/api/content/` | POST | Create content |
| `/api/content/{id}/publish` | POST | Publish to Meta |
| `/api/meta/status` | GET | Check Meta connection |
| `/api/meta/connect` | GET | Get OAuth URL |
| `/api/analytics/overview` | GET | Get analytics |

Full API docs at: http://localhost:8000/docs
