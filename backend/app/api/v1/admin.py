"""Admin-only endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_admin_user
from app.models.user import User
from app.models.review import Review
from app.schemas.review import ReviewResponse

router = APIRouter()


@router.get("/users", response_model=List[dict])
async def list_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """List all users (admin only)."""
    users = db.query(User).all()
    return [
        {
            "id": str(user.id),
            "email": user.email,
            "subscription_tier": user.subscription_tier,
            "is_admin": user.is_admin,
            "created_at": user.created_at.isoformat(),
        }
        for user in users
    ]


@router.get("/reviews", response_model=List[ReviewResponse])
async def list_all_reviews(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
    skip: int = 0,
    limit: int = 100
):
    """List all reviews across all users (admin only)."""
    reviews = db.query(Review).order_by(
        Review.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return [ReviewResponse.model_validate(review) for review in reviews]


@router.get("/stats")
async def get_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    """Get platform statistics (admin only)."""
    total_users = db.query(User).count()
    total_reviews = db.query(Review).count()
    completed_reviews = db.query(Review).filter(Review.status == "completed").count()
    
    return {
        "total_users": total_users,
        "total_reviews": total_reviews,
        "completed_reviews": completed_reviews,
        "pending_reviews": total_reviews - completed_reviews,
    }

