# Fix: Switch to Groq

Your backend is still using OpenAI because `USE_GROQ` is not set to `true` in your `.env` file.

## Quick Fix

1. **Edit `backend/.env`** and add these lines:

```bash
USE_GROQ=true
GROQ_API_KEY=gsk_your_groq_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

**Important:** 
- `USE_GROQ=true` (not `True` or `1` - lowercase `true`)
- Replace `gsk_your_groq_key_here` with your actual Groq API key

2. **Get your Groq API key** (if you don't have it):
   - Go to https://console.groq.com/keys
   - Sign up/login
   - Create API key
   - Copy it (starts with `gsk_`)

3. **Restart your backend server**:
   ```bash
   # Stop the server (Ctrl+C in the terminal running it)
   # Then restart:
   cd argus/backend
   uvicorn app.main:app --reload
   ```

4. **Verify it's working**:
   ```bash
   cd argus/backend
   python3 -c "from app.core.config import settings; print(f'USE_GROQ: {settings.USE_GROQ}'); print(f'Has GROQ_KEY: {bool(settings.GROQ_API_KEY)}')"
   ```
   
   Should show:
   ```
   USE_GROQ: True
   Has GROQ_KEY: True
   ```

## Example .env file

```bash
# ... your other settings ...

# AI Service - Switch to Groq
USE_GROQ=true
GROQ_API_KEY=gsk_abc123xyz789...
GROQ_MODEL=llama-3.1-70b-versatile

# Comment out or remove OpenAI key (optional)
# OPENAI_API_KEY=sk-...
```

## Troubleshooting

If it still doesn't work:
1. Make sure you **restarted the backend server** after changing `.env`
2. Check for typos: `USE_GROQ` (not `USE_GROQ_` or `USE_GROQ_KEY`)
3. Make sure the value is exactly `true` (lowercase)
4. Verify your Groq API key is correct

