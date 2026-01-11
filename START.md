# Starting Argus - Quick Start Guide

This guide will help you start the Argus application and see it in action.

## Prerequisites

1. **Python 3.10+** installed
2. **Node.js 18+** installed (currently you have 14.21.3 - you'll need to upgrade)
3. **PostgreSQL** running (or use Docker)
4. **Supabase account** (free tier works)
5. **OpenAI API key** (for AI code review)

## Step 1: Environment Setup

### Backend Environment Variables

1. Copy the example env file:
```bash
cd argus
cp .env.example .env
```

2. Edit `.env` and fill in your values:
   - `SUPABASE_URL` and `SUPABASE_ANON_KEY` - Get from Supabase dashboard
   - `OPENAI_API_KEY` - Get from OpenAI dashboard
   - `DATABASE_URL` - PostgreSQL connection string
   - `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` - Optional for GitHub OAuth
   - `STRIPE_SECRET_KEY` - Optional for payments

### Frontend Environment Variables

1. Copy the example env file:
```bash
cd frontend
cp .env.local.example .env.local
```

2. Edit `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` - Same as backend
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Same as backend
   - `NEXT_PUBLIC_API_URL` - Backend URL (default: http://localhost:8000)

## Step 2: Database Setup

### Option A: Using Docker (Recommended)

```bash
cd argus
docker-compose up -d
```

This will start PostgreSQL on port 5432.

### Option B: Local PostgreSQL

Make sure PostgreSQL is running and create the database:
```sql
CREATE DATABASE argus;
CREATE USER argus WITH PASSWORD 'argus_password';
GRANT ALL PRIVILEGES ON DATABASE argus TO argus;
```

### Run Migrations

```bash
cd backend
# First, create the initial migration (if not done)
python3 -m alembic revision --autogenerate -m "Initial migration"

# Then apply migrations
python3 -m alembic upgrade head
```

**Note:** If you get a `CORS_ORIGINS` parsing error, make sure your `.env` file has:
```bash
CORS_ORIGINS=http://localhost:3000
```
(Not as a JSON array - just a comma-separated string)

## Step 3: Install Dependencies

### Backend
```bash
cd backend
pip3 install -r requirements.txt
```

### Frontend
```bash
cd frontend
npm install
```

**Note:** If you get Node version errors, upgrade Node.js:
```bash
# Using nvm (recommended)
nvm install 18
nvm use 18

# Or download from nodejs.org
```

## Step 4: Start the Servers

### Terminal 1: Backend Server
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### Terminal 2: Frontend Server
```bash
cd frontend
npm run dev
INFO:     127.0.0.1:55546 - "POST /auth/login HTTP/1.1" 404 Not Found
```

You should see:
```
✓ Ready in Xms
○ Local:        http://localhost:3000
```

## Step 5: Access the Application

1. **Frontend:** Open http://localhost:3000
2. **Backend API Docs:** Open http://localhost:8000/docs
3. **Backend Health Check:** Open http://localhost:8000/health

## Step 6: Test the Application

### 1. Register a New User
- Go to http://localhost:3000/register
- Enter email and password (min 8 characters)
- Click "Register"

### 2. Login
- Go to http://localhost:3000/login
- Enter your credentials
- Click "Login"

### 3. Create a Review
- After login, you'll be redirected to dashboard
- Click "Create New Review"
- Enter a GitHub repository URL (e.g., `https://github.com/facebook/react`)
- Click "Start Review"
- Wait for processing (may take 1-2 minutes)

### 4. View Results
- Once processing completes, click on the review
- See security, quality, and tech debt scores
- Browse findings and recommendations

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

**Database connection error:**
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env`
- Check database exists: `psql -l | grep argus`

**Import errors:**
```bash
# Make sure you're in the backend directory
cd backend
# Reinstall dependencies
pip3 install -r requirements.txt
```

### Frontend Issues

**Node version error:**
- Upgrade to Node 18+: `nvm install 18 && nvm use 18`
- Or use the version manager of your choice

**Module not found:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors:**
- These are often IDE-related
- Restart TypeScript server in your IDE
- Or ignore if the app runs fine

**Port 3000 in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use different port
npm run dev -- -p 3001
```

### Common Issues

**CORS errors:**
- Make sure `CORS_ORIGINS` in backend `.env` includes `http://localhost:3000`
- Restart backend server after changing `.env`

**Authentication errors:**
- Verify Supabase credentials in both `.env` files
- Check Supabase project is active
- Ensure Supabase Auth is enabled

**AI review not working:**
- Verify `OPENAI_API_KEY` is set correctly
- Check you have API credits
- Review backend logs for errors

## Quick Start Script

You can also use this script to start both servers:

```bash
# Create start.sh
cat > start.sh << 'EOF'
#!/bin/bash

# Start backend
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Backend running on http://localhost:8000 (PID: $BACKEND_PID)"
echo "Frontend running on http://localhost:3000 (PID: $FRONTEND_PID)"
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
EOF

chmod +x start.sh
./start.sh
```

## Next Steps

Once the app is running:
1. Test all authentication flows
2. Create reviews for different repositories
3. Test error handling (invalid URLs, etc.)
4. Check rate limiting (create multiple reviews)
5. Explore the API docs at http://localhost:8000/docs

## Development Tips

- **Backend logs:** Check terminal running uvicorn for API logs
- **Frontend logs:** Check browser console (F12)
- **Database:** Use `psql` or a GUI tool to inspect data
- **API testing:** Use http://localhost:8000/docs for interactive API testing

Enjoy testing Argus! 🚀

