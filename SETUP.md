# Setup Guide

## Project Structure Created ✅

The basic project structure has been set up with:

### Backend (FastAPI)
- ✅ Project structure with proper organization
- ✅ Core configuration and settings
- ✅ Constants and enums
- ✅ Custom exception classes
- ✅ Database models (User, Review, ReviewResult, Finding)
- ✅ API route stubs (auth, reviews, webhooks)
- ✅ Utility functions (validation)
- ✅ Alembic configuration for migrations

### Frontend (Next.js)
- ✅ Next.js 14 with App Router
- ✅ TypeScript configuration
- ✅ Tailwind CSS setup
- ✅ Basic layout and homepage
- ✅ Constants and utilities
- ✅ API client setup

## Next Steps

### 1. Install Dependencies

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Set Up Environment Variables

Create `.env` files:

**Backend (`backend/.env`):**
```bash
DATABASE_URL=postgresql://argus:postgres@localhost:5432/argus
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key
SUPABASE_ANON_KEY=your-key
OPENAI_API_KEY=sk-your-key
ANTHROPIC_API_KEY=your-key
GITHUB_CLIENT_ID=your-id
GITHUB_CLIENT_SECRET=your-secret
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-secret
SECRET_KEY=your-secret-key
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000
```

**Frontend (`frontend/.env.local`):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-key
```

### 3. Set Up Database

**Option A: Local PostgreSQL (using Docker)**
```bash
docker-compose up -d postgres
```

**Option B: Supabase**
- Create a Supabase project
- Get connection string from Supabase dashboard

**Run Migrations:**
```bash
cd backend
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to see the frontend.

## Implementation Status

### ✅ Completed
- Project structure
- Backend core setup
- Frontend basic setup
- Database models
- Constants and utilities
- API route stubs

### 🚧 Next to Implement
1. Supabase integration (auth, database)
2. GitHub API service
3. AI service (OpenAI integration)
4. Code analyzer service
5. Review generation service
6. Complete API endpoints
7. Frontend pages (auth, dashboard, review)
8. Stripe integration
9. Error handling and security

## Code Quality Standards

All code follows the standards defined in `cursor-instructions.md`:
- ✅ Industry-standard practices
- ✅ Security-first approach
- ✅ Generic functions and constants
- ✅ Senior engineer patterns
- ✅ Natural, non-AI-generated code style

## Notes

- The backend API endpoints are currently stubs returning 501 (Not Implemented)
- Database models are ready but migrations need to be run
- Frontend is a basic Next.js setup ready for development
- All constants are centralized and reusable
- Error handling structure is in place

