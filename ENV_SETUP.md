# Environment Variables Setup Guide

This guide will help you fill in the `.env` files with your actual credentials.

## Files Created

1. `backend/.env` - Backend environment variables
2. `frontend/.env.local` - Frontend environment variables

## Quick Setup Steps

### 1. Supabase Setup (Required)

1. Go to https://app.supabase.com
2. Create a new project (or use existing)
3. Go to **Settings** > **API** (or **Project Settings** > **API**)
4. You'll see three important values:

   **a. Project URL:**
   - Look for "Project URL" or "API URL"
   - Format: `https://xxxxxxxxxxxxx.supabase.co`
   - Copy this to:
     - `SUPABASE_URL` in `backend/.env`
     - `NEXT_PUBLIC_SUPABASE_URL` in `frontend/.env.local`

   **b. anon/public key (for frontend and user-facing operations):**
   - Look for "anon public" or "public anon key" or "Project API keys" > "anon public"
   - This is a long string starting with `eyJ...`
   - Copy this to:
     - `SUPABASE_ANON_KEY` in `backend/.env`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `frontend/.env.local`

   **c. service_role key (for backend admin operations only):**
   - Look for "service_role" or "service_role secret" key
   - ⚠️ **WARNING:** This key has admin privileges - keep it secret!
   - This is also a long string starting with `eyJ...`
   - Copy this to:
     - `SUPABASE_SERVICE_ROLE_KEY` in `backend/.env` only
     - **DO NOT** put this in frontend `.env.local` (security risk!)

**Visual Guide:**
```
Supabase Dashboard > Settings > API

Project URL:        https://abc123xyz.supabase.co
                    ↓
                    Use for: SUPABASE_URL, NEXT_PUBLIC_SUPABASE_URL

anon public key:    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                    ↓
                    Use for: SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY

service_role key:   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (different string)
                    ↓
                    Use for: SUPABASE_SERVICE_ROLE_KEY (backend only!)
```

### 2. AI Service Setup (Choose One)

**Option A: OpenAI (Recommended for Production)**
- New accounts get ~$5 free credits
- Use `gpt-4o-mini` for cheaper testing (default)
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key → `OPENAI_API_KEY` in `backend/.env`
4. Default model is `gpt-4o-mini` (cheaper) - change to `gpt-4o` for better quality

**Option B: Groq (FREE Tier Available! ⭐)**
- **Free tier: 14,400 requests/day**
- Fast inference, great for testing
- Uses Llama 3.1 models
1. Go to https://console.groq.com/keys
2. Create a free account and get API key
3. Add to `backend/.env`:
   ```bash
   USE_GROQ=true
   GROQ_API_KEY=your-groq-key-here
   GROQ_MODEL=llama-3.1-8b-instant
   ```
4. Leave `OPENAI_API_KEY` empty (or remove it)

### 3. Database Setup

**Option A: Use Docker (Easiest)**
```bash
cd argus
docker-compose up -d
```
Then use: `DATABASE_URL=postgresql://argus:postgres@localhost:5432/argus`

**Option B: Use Supabase Database**
1. Go to Supabase dashboard
2. **Settings** > **Database**
3. Copy the connection string
4. Use it for `DATABASE_URL` in `backend/.env`

### 4. Admin Account (Already Configured)

The admin account is pre-configured:
- Email: `ravehaseo@gmail.com`
- Password: `admin123`

You can change these in `backend/.env`:
```bash
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=your-secure-password
```

### 5. GitHub Access Token (Recommended)

**Why you need it:**
- Without token: 60 requests/hour (rate limit)
- With token: 5,000 requests/hour
- Required for private repositories

**How to get a GitHub Personal Access Token:**
1. Go to https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name (e.g., "Argus Code Reviewer")
4. Select scopes:
   - ✅ `public_repo` (for public repositories)
   - ✅ `repo` (for private repositories, if needed)
5. Click **"Generate token"**
6. Copy the token (starts with `ghp_`)
7. Add to `backend/.env`:
   ```bash
   GITHUB_ACCESS_TOKEN=ghp_your_token_here
   ```

**Note:** The token is optional but highly recommended to avoid rate limiting.

### 6. Optional: GitHub OAuth (for user login)

Argus now supports **modern OAuth login via Supabase Auth** (recommended).

#### Option A (Recommended): Supabase Auth OAuth (GitHub/Google)

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Enable **GitHub** (and/or **Google**)
3. For GitHub, you’ll need to create a GitHub OAuth App:
   - Go to https://github.com/settings/developers
   - Click **New OAuth App**
   - Set:
     - **Application name**: Argus
     - **Homepage URL**: http://localhost:3000
     - **Authorization callback URL**: (copy from Supabase provider settings)
4. In Supabase, set **Redirect URLs** to include:
   - `http://localhost:3000/auth/callback`
   - (Production) `https://YOUR_DOMAIN/auth/callback`

**Notes:**
- OAuth login happens in the frontend using Supabase (`signInWithOAuth`).
- The backend continues to authenticate requests using the Supabase JWT in `Authorization: Bearer <token>`.

#### Option B (Legacy): Backend GitHub OAuth endpoint

If you use the backend OAuth flow (older), configure GitHub OAuth App callback to:
- `http://localhost:8000/api/v1/auth/github`

Then copy **Client ID** and **Client Secret** to `backend/.env`.

### 6. Optional: Stripe (For Payments)

1. Go to https://dashboard.stripe.com/apikeys
2. Copy:
   - **Secret key** → `STRIPE_SECRET_KEY` in `backend/.env`
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `frontend/.env.local`

## Minimum Required Variables

To get started quickly, you only need:

**Backend (`backend/.env`):**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - The "anon public" key from Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - The "service_role" key (optional for basic auth, but recommended)
- `OPENAI_API_KEY` - Your OpenAI API key
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - Any random string for development (e.g., `dev-secret-key-123`)

**Frontend (`frontend/.env.local`):**
- `NEXT_PUBLIC_SUPABASE_URL` - Same as `SUPABASE_URL` above
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Same as `SUPABASE_ANON_KEY` above
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: `http://localhost:8000`)

**Note:** The `SUPABASE_SERVICE_ROLE_KEY` is optional for basic functionality but recommended for admin operations. You can leave it empty initially if you just want to test basic auth.

## Security Notes

⚠️ **Important:**
- Never commit `.env` files to git (they're in `.gitignore`)
- Use different credentials for production
- Keep your API keys secure
- Rotate keys if they're exposed

## Testing Your Setup

After filling in the values:

1. **Backend:**
```bash
cd backend
python3 -m uvicorn app.main:app --reload
```
Should start without errors.

2. **Frontend:**
```bash
cd frontend
npm run dev
```
Should start without errors.

3. **Test Admin Login:**
- Go to http://localhost:3000/login
- Use: `ravehaseo@gmail.com` / `admin123` (or your configured password)
- Should log in successfully

## Troubleshooting

**"Missing environment variable" error:**
- Check all required variables are set
- Restart the server after changing `.env`
- Check for typos in variable names

**Database connection error:**
- Verify PostgreSQL is running (if using Docker: `docker-compose ps`)
- Check `DATABASE_URL` format is correct
- Ensure database exists

**Supabase errors:**
- Verify Supabase project is active
- Check API keys are correct
- Ensure Supabase Auth is enabled

**OpenAI errors:**
- Verify API key is valid
- Check you have credits in your OpenAI account
- Ensure key has proper permissions

## Next Steps

Once `.env` files are configured:
1. Start the database: `docker-compose up -d`
2. Run migrations: `cd backend && alembic upgrade head`
3. Start backend: `cd backend && uvicorn app.main:app --reload`
4. Start frontend: `cd frontend && npm run dev`
5. Visit http://localhost:3000

Happy coding! 🚀

