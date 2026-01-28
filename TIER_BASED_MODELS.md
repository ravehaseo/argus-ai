# Tier-Based AI Model Selection

## ✅ Implementation Complete

Argus now automatically selects AI models based on user subscription tier:

### Model Selection by Tier

| Tier | Model | Reason |
|------|-------|--------|
| **Free** | Groq (llama-3.1-8b-instant) or GPT-4o-mini | Cost-effective, free tier |
| **Pro** | **GPT-5-mini** | Latest GPT-5, cost-effective |
| **Enterprise** | **GPT-5.1** | Latest GPT-5, best quality |

---

## 🔧 How It Works

### Automatic Selection

When a review is created:
1. System gets user's `subscription_tier` from database
2. `AIService` is initialized with the tier
3. Model is automatically selected based on tier
4. Review uses the appropriate model

### Code Flow

```python
# In ReviewGenerator
generator = ReviewGenerator(subscription_tier=user.subscription_tier)

# In AIService.__init__
def _get_model_for_tier(self) -> str:
    if tier == "free":
        return "gpt-4o-mini"  # or Groq if enabled
    elif tier == "pro":
        return "gpt-5-mini"   # GPT-5 for Pro!
    elif tier == "enterprise":
        return "gpt-5.1"      # Best GPT-5 for Enterprise!
```

---

## 📊 Benefits

### For Users:
- **Pro users** get GPT-5 automatically (better quality)
- **Enterprise users** get best GPT-5 model
- **Free users** still get good quality with Groq/GPT-4o-mini

### For Business:
- Clear value proposition: "Pro gets GPT-5"
- Upsell opportunity: "Upgrade to Enterprise for GPT-5.1"
- Cost optimization: Free tier uses cheaper models

---

## ⚠️ Rate Limits

### GPT-5 Models:
- **gpt-5.1**: 3 RPM, 200 RPD, 10,000 TPM
- **gpt-5-mini**: 3 RPM, 200 RPD, 60,000 TPM

**Considerations:**
- May need rate limiting for high-volume Pro users
- Consider upgrading API tier for higher limits
- Monitor usage and adjust if needed

---

## 🔄 Fallback Behavior

If GPT-5 models are unavailable or fail:
1. System will log error
2. Could fallback to GPT-4o-mini (needs implementation)
3. User sees error message

**Future Enhancement:** Add automatic fallback to GPT-4o if GPT-5 fails

---

## 📝 Configuration

### Environment Variables

```bash
# Required for Pro/Enterprise tiers
OPENAI_API_KEY=sk-...

# Optional: For free tier
USE_GROQ=True
GROQ_API_KEY=...
```

### Model Selection Logic

Located in: `backend/app/services/ai_service.py`

```python
def _get_model_for_tier(self) -> str:
    if self.subscription_tier == SubscriptionTier.FREE:
        return "gpt-4o-mini"  # or Groq
    elif self.subscription_tier == SubscriptionTier.PRO:
        return "gpt-5-mini"   # GPT-5!
    elif self.subscription_tier == SubscriptionTier.ENTERPRISE:
        return "gpt-5.1"      # Best GPT-5!
```

---

## 🧪 Testing

### Test Pro Tier:
1. Create a Pro user (or update existing user)
2. Create a review
3. Check logs: Should see "gpt-5-mini" in logs
4. Verify review quality (should be better)

### Test Enterprise Tier:
1. Create an Enterprise user
2. Create a review
3. Check logs: Should see "gpt-5.1" in logs
4. Verify review quality (should be best)

---

## 📈 Monitoring

### What to Monitor:
- Model usage by tier
- Cost per tier
- Review quality differences
- Rate limit errors

### Logs to Check:
```
Initialized AIService with model: gpt-5-mini for tier: pro
Initialized AIService with model: gpt-5.1 for tier: enterprise
```

---

## 🚀 Future Enhancements

1. **Fallback Logic**: Auto-fallback if GPT-5 unavailable
2. **Model Selection UI**: Let users choose model (Enterprise)
3. **Cost Tracking**: Track costs per tier
4. **Quality Metrics**: Compare GPT-5 vs GPT-4 quality
5. **Rate Limit Handling**: Queue requests if rate limited

---

*Last Updated: 2024*

