# Quick Switch to Groq (Free Tier)

Your OpenAI quota has been reached. Here's how to switch to Groq's **FREE tier** (14,400 requests/day):

## Step 1: Get Groq API Key (Free)

1. Go to https://console.groq.com/keys
2. Sign up for a free account (if you don't have one)
3. Click "Create API Key"
4. Copy your API key (starts with `gsk_`)

## Step 2: Update Your `.env` File

Edit `backend/.env` and make these changes:

```bash
# Switch to Groq
USE_GROQ=true
GROQ_API_KEY=gsk_your_actual_key_here
GROQ_MODEL=llama-3.1-8b-instant

# You can leave OPENAI_API_KEY empty or remove it
# OPENAI_API_KEY=sk-...
```

## Step 3: Restart Backend Server

```bash
# Stop your current backend server (Ctrl+C)
# Then restart it
cd argus/backend
uvicorn app.main:app --reload
```

## That's It! 🎉

Your app will now use Groq's free tier instead of OpenAI. The code automatically detects `USE_GROQ=true` and switches providers.

## Available Groq Models

- `llama-3.1-8b-instant` (default) - Fast and reliable, free tier
- `llama-3.3-70b-versatile` - Better quality (if available)
- `mixtral-8x7b-32768` - Alternative

Change `GROQ_MODEL` in `.env` to switch models.

## Switch Back to OpenAI Later

When you add credits to OpenAI, just set:
```bash
USE_GROQ=false
OPENAI_API_KEY=sk-your-key
```

