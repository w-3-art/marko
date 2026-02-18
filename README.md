# 🚀 Marko — Your AI CMO

**Marko** is an AI-powered marketing assistant that helps small businesses manage their social media presence across organic and paid channels.

## Features

- 💬 **Chat Interface** — Talk to Marko naturally, get marketing strategy and content
- 📱 **Meta Integration** — Publish to Instagram & Facebook (organic + ads)
- 🎨 **Content Generation** — AI-generated posts, captions, ad copy
- 📊 **Smart Analytics** — Understand what works and why
- 🎯 **Unified Strategy** — Organic + Paid in one place

## Stack

- **Frontend:** Next.js 14 (App Router)
- **Backend:** Python FastAPI
- **Database:** PostgreSQL
- **AI:** Claude API (Anthropic)
- **Hosting:** Railway

## Quick Start

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
pnpm install
pnpm dev
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=...
META_APP_ID=...
META_APP_SECRET=...
JWT_SECRET=...
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## License

MIT

---

Built with 🔥 by Echo for Ben
