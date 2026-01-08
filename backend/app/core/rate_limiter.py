"""Rate limiting utilities."""

from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict
from uuid import UUID

from app.core.constants import SubscriptionTier, REVIEW_LIMITS


class RateLimiter:
    """Simple in-memory rate limiter for review quotas."""
    
    def __init__(self):
        self.user_reviews: Dict[UUID, list] = defaultdict(list)
    
    def check_quota(self, user_id: UUID, tier: SubscriptionTier, is_admin: bool = False) -> tuple[bool, int]:
        """Check if user has remaining quota for the month."""
        # Admin users have unlimited quota
        if is_admin:
            return True, -1
        
        limit = REVIEW_LIMITS.get(tier, 1)
        
        if limit == -1:
            return True, -1
        
        now = datetime.utcnow()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        user_reviews = self.user_reviews.get(user_id, [])
        reviews_this_month = [
            review_time for review_time in user_reviews
            if review_time >= month_start
        ]
        
        remaining = limit - len(reviews_this_month)
        return remaining > 0, remaining
    
    def record_review(self, user_id: UUID):
        """Record a review for rate limiting."""
        self.user_reviews[user_id].append(datetime.utcnow())
    
    def reset_user(self, user_id: UUID):
        """Reset rate limit for a user (for testing)."""
        if user_id in self.user_reviews:
            del self.user_reviews[user_id]


rate_limiter = RateLimiter()

