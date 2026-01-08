"""Review endpoints."""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.exceptions import (
    ReviewNotFoundError,
    QuotaExceededError,
    InvalidRepositoryError,
    ReviewProcessingError,
)
from app.core.constants import ReviewStatus, SubscriptionTier, REVIEW_LIMITS
from app.core.rate_limiter import rate_limiter
from app.core.admin import is_admin_user
from app.models.user import User
from app.models.review import Review, ReviewResult, Finding
from app.schemas.review import (
    ReviewCreate,
    ReviewResponse,
    ReviewDetailResponse,
    ReviewResultResponse
)
from app.services.review_generator import ReviewGenerator
from app.utils.validation import validate_repository_url

router = APIRouter()


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ReviewCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new code review."""
    if not validate_repository_url(str(review_data.repository_url)):
        raise InvalidRepositoryError("Invalid repository URL format")
    
    user_tier = SubscriptionTier(current_user.subscription_tier)
    is_admin = is_admin_user(current_user)
    has_quota, remaining = rate_limiter.check_quota(current_user.id, user_tier, is_admin)
    
    if not has_quota:
        limit = REVIEW_LIMITS.get(user_tier, 1)
        raise QuotaExceededError(
            f"You have reached your monthly review limit ({limit}). "
            f"Upgrade your plan for more reviews."
        )
    
    repo_url = str(review_data.repository_url)
    repo_name = repo_url.split("/")[-1].rstrip(".git")
    
    review = Review(
        user_id=current_user.id,
        repository_url=repo_url,
        repository_name=repo_name,
        status=ReviewStatus.PENDING,
        review_type=review_data.review_type
    )
    
    db.add(review)
    db.commit()
    db.refresh(review)
    
    rate_limiter.record_review(current_user.id)
    background_tasks.add_task(process_review_async, review.id, repo_url)
    
    return ReviewResponse.model_validate(review)


async def process_review_async(review_id: UUID, repo_url: str):
    """Process review asynchronously in background."""
    from app.core.database import SessionLocal
    
    local_db = SessionLocal()
    try:
        review = local_db.query(Review).filter(Review.id == review_id).first()
        if not review:
            return
        
        review.status = ReviewStatus.PROCESSING
        local_db.commit()
        
        generator = ReviewGenerator()
        result_data = await generator.generate_review(repo_url, review_id)
        
        review_result = ReviewResult(
            review_id=review_id,
            security_score=result_data["security_score"],
            quality_score=result_data["quality_score"],
            tech_debt_score=result_data["tech_debt_score"],
            summary=result_data.get("summary"),
            findings=result_data.get("findings", []),
            recommendations=result_data.get("recommendations", []),
            raw_analysis=result_data.get("raw_analysis")
        )
        
        local_db.add(review_result)
        
        for finding_data in result_data.get("findings", []):
            finding = Finding(
                review_result_id=review_result.id,
                severity=finding_data.get("severity", "info"),
                category=finding_data.get("category", "best_practices"),
                file_path=finding_data.get("file_path"),
                line_number=finding_data.get("line_number"),
                issue_description=finding_data.get("description", ""),
                suggested_fix=finding_data.get("suggested_fix"),
                code_snippet=finding_data.get("code_snippet")
            )
            local_db.add(finding)
        
        from datetime import datetime
        review.status = ReviewStatus.COMPLETED
        review.completed_at = datetime.utcnow()
        
        local_db.commit()
        
    except Exception as e:
        review.status = ReviewStatus.FAILED
        local_db.commit()
    finally:
        local_db.close()


@router.get("/", response_model=List[ReviewResponse])
async def list_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 20
):
    """List user's reviews."""
    reviews = db.query(Review).filter(
        Review.user_id == current_user.id
    ).order_by(
        Review.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return [ReviewResponse.model_validate(review) for review in reviews]


@router.get("/{review_id}", response_model=ReviewDetailResponse)
async def get_review(
    review_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get review details."""
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.user_id == current_user.id
    ).first()
    
    if not review:
        raise ReviewNotFoundError(f"Review {review_id} not found")
    
    result = db.query(ReviewResult).filter(
        ReviewResult.review_id == review_id
    ).first()
    
    review_response = ReviewResponse.model_validate(review)
    result_response = ReviewResultResponse.model_validate(result) if result else None
    
    return ReviewDetailResponse(
        review=review_response,
        result=result_response
    )


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a review."""
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.user_id == current_user.id
    ).first()
    
    if not review:
        raise ReviewNotFoundError(f"Review {review_id} not found")
    
    db.delete(review)
    db.commit()
    
    return None
