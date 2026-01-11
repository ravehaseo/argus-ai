# Supabase Setup Guide - Step by Step

This guide will walk you through getting your Supabase keys step by step.

## Step 1: Create/Login to Supabase

1. Go to https://app.supabase.com
2. Sign up or log in
3. Click **"New Project"** if you don't have one

## Step 2: Create a Project

1. Fill in:
   - **Project Name**: `argus` (or any name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
2. Click **"Create new project"**
3. Wait 2-3 minutes for project to be ready

## Step 3: Get Your API Keys

1. In your project dashboard, click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"** in the settings menu
3. You'll see a page with several sections

### What You'll See:

```
┌─────────────────────────────────────────┐
│ Project URL                             │
│ https://abc123xyz.supabase.co           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Project API keys                        │
│                                         │
│ anon public                             │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │
│                                         │
│ service_role                            │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │
└─────────────────────────────────────────┘
```

## Step 4: Copy the Values

### For Backend (`backend/.env`):

```bash
# Copy the "Project URL"
SUPABASE_URL=https://abc123xyz.supabase.co

# Copy the "anon public" key (the first long string)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiYzEyM3h5eiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2MjM5MDIyfQ.xxxxxxxxxxxxx

# Copy the "service_role" key (the second long string, different from anon)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiYzEyM3h5eiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2MTYyMzkwMjJ9.yyyyyyyyyyyyy
```

### For Frontend (`frontend/.env.local`):

```bash
# Same "Project URL" as backend
NEXT_PUBLIC_SUPABASE_URL=https://abc123xyz.supabase.co

# Same "anon public" key as backend
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiYzEyM3h5eiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2MjM5MDIyfQ.xxxxxxxxxxxxx
```

**⚠️ Important:** 
- **DO NOT** put `SUPABASE_SERVICE_ROLE_KEY` in the frontend `.env.local` file
- The service_role key should ONLY be in `backend/.env`
- The anon key is safe for frontend (it's public by design)

## Step 5: Enable Authentication

1. In Supabase dashboard, go to **"Authentication"** in left sidebar
2. Click **"Providers"**
3. Make sure **"Email"** provider is enabled (it should be by default)
4. Optionally enable **"GitHub"** if you want GitHub OAuth

## Step 6: Verify Your Setup

After filling in the `.env` files:

1. **Backend:**
   ```bash
   cd backend
   python3 -c "from app.core.config import settings; print('Supabase URL:', settings.SUPABASE_URL[:30] + '...')"
   ```
   Should print your Supabase URL without errors.

2. **Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   Should start without environment variable errors.

## Troubleshooting

### "Invalid API key" error
- Check you copied the entire key (they're very long)
- Make sure there are no extra spaces
- Verify you're using the correct key type (anon vs service_role)

### "Project not found" error
- Verify the SUPABASE_URL is correct
- Make sure your project is active (not paused)
- Check the URL format: `https://xxxxx.supabase.co`

### Can't find the API keys
- Make sure you're in **Settings** > **API**
- Look for "Project API keys" section
- The keys might be hidden - click "Reveal" or "Show" button

### Keys look the same
- The anon and service_role keys are different strings
- They both start with `eyJ` but have different content
- Make sure you're copying the right one for each field

## Quick Reference

| Field | Where to Find | Where to Put |
|-------|---------------|--------------|
| `SUPABASE_URL` | Settings > API > Project URL | `backend/.env` and `frontend/.env.local` |
| `SUPABASE_ANON_KEY` | Settings > API > anon public | `backend/.env` and `frontend/.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings > API > service_role | `backend/.env` only |

## Security Notes

- ✅ **anon key**: Safe to use in frontend (public by design)
- ⚠️ **service_role key**: Keep secret, backend only, has admin privileges
- 🔒 Never commit `.env` files to git
- 🔄 Rotate keys if they're exposed

## Need Help?

If you're still stuck:
1. Check Supabase docs: https://supabase.com/docs/guides/api
2. Verify your project is active in Supabase dashboard
3. Make sure you're logged into the correct Supabase account

