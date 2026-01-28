"""Review endpoints."""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from sqlalchemy import or_, func, extract, case
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_optional_user
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
    from app.core.logging_config import logger
    from app.core.exceptions import ReviewProcessingError
    
    local_db = SessionLocal()
    review = None
    try:
        review = local_db.query(Review).filter(Review.id == review_id).first()
        if not review:
            logger.warning(f"Review {review_id} not found")
            return
        
        # Get user to determine subscription tier
        user = local_db.query(User).filter(User.id == review.user_id).first()
        subscription_tier = user.subscription_tier if user else "free"
        logger.info(f"Processing review for user tier: {subscription_tier}")
        
        logger.info(f"Starting review processing for {review_id}: {repo_url}")
        review.status = ReviewStatus.PROCESSING
        local_db.commit()
        
        try:
            generator = ReviewGenerator(subscription_tier=subscription_tier)
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
            local_db.flush()  # Flush to get review_result.id
            
            findings_data = result_data.get("findings", [])
            logger.info(f"Processing {len(findings_data)} findings for review {review_id}")
            
            for idx, finding_data in enumerate(findings_data):
                # Log first finding for debugging
                if idx == 0:
                    logger.debug(f"Sample finding data: {finding_data}")
                
                # Handle line_number conversion (AI might return string)
                line_number = finding_data.get("line_number")
                if line_number is not None:
                    try:
                        line_number = int(line_number)
                    except (ValueError, TypeError):
                        logger.warning(f"Invalid line_number in finding: {line_number}")
                        line_number = None
                
                finding = Finding(
                    review_result_id=review_result.id,
                    severity=finding_data.get("severity", "info"),
                    category=finding_data.get("category", "best_practices"),
                    file_path=finding_data.get("file_path"),
                    line_number=line_number,
                    issue_description=finding_data.get("description", finding_data.get("issue_description", "")),
                    suggested_fix=finding_data.get("suggested_fix"),
                    code_snippet=finding_data.get("code_snippet")
                )
                local_db.add(finding)
            
            logger.info(f"Created {len(findings_data)} Finding records")
            
            from datetime import datetime
            review.status = ReviewStatus.COMPLETED
            review.completed_at = datetime.utcnow()
            local_db.commit()
            logger.info(f"Review {review_id} completed successfully")
            
        except Exception as e:
            logger.error(f"Error processing review {review_id}: {str(e)}", exc_info=True)
            if review:
                review.status = ReviewStatus.FAILED
                local_db.commit()
    except Exception as e:
        logger.error(f"Critical error in review processing {review_id}: {str(e)}", exc_info=True)
        if review:
            try:
                review.status = ReviewStatus.FAILED
                local_db.commit()
            except:
                pass
    finally:
        local_db.close()


@router.get("/")
async def list_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: Optional[str] = "created_at",
    sort_order: Optional[str] = "desc"
):
    """List user's reviews with pagination, search, filter, and sort."""
    # Base query
    query = db.query(Review).filter(Review.user_id == current_user.id)
    
    # Apply search filter
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            or_(
                Review.repository_name.ilike(search_term),
                Review.repository_url.ilike(search_term)
            )
        )
    
    # Apply status filter
    if status:
        try:
            status_enum = ReviewStatus(status.lower())
            query = query.filter(Review.status == status_enum)
        except ValueError:
            pass  # Invalid status, ignore
    
    # Get total count (before pagination)
    total = query.count()
    
    # Get status counts for stats (unfiltered)
    status_counts = db.query(
        Review.status,
        func.count(Review.id).label('count')
    ).filter(
        Review.user_id == current_user.id
    ).group_by(Review.status).all()
    
    stats = {
        'completed': 0,
        'processing': 0,
        'pending': 0,
        'failed': 0
    }
    for status_val, count in status_counts:
        if status_val in stats:
            stats[status_val] = count
    
    # Combine processing and pending for display
    processing_total = stats.get('processing', 0) + stats.get('pending', 0)
    
    # Apply sorting
    if sort_by == "repository_name":
        order_column = Review.repository_name
    elif sort_by == "status":
        order_column = Review.status
    else:  # default to created_at
        order_column = Review.created_at
    
    if sort_order.lower() == "asc":
        query = query.order_by(order_column.asc())
    else:
        query = query.order_by(order_column.desc())
    
    # Get paginated reviews
    reviews = query.offset(skip).limit(limit).all()
    
    return {
        "items": [ReviewResponse.model_validate(review) for review in reviews],
        "total": total,
        "skip": skip,
        "limit": limit,
        "has_more": (skip + limit) < total,
        "stats": {
            "completed": stats.get('completed', 0),
            "processing": processing_total,
            "failed": stats.get('failed', 0)
        }
    }


@router.get("/{review_id}", response_model=ReviewDetailResponse)
async def get_review(
    review_id: UUID,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Get review details. Publicly accessible - no authentication required."""
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if not review:
        raise ReviewNotFoundError(f"Review {review_id} not found")
    
    # If user is authenticated and owns the review, allow full access
    # Otherwise, allow public read-only access
    if current_user and review.user_id == current_user.id:
        # Owner can see everything
        pass
    else:
        # Public view - only show completed reviews
        if review.status not in [ReviewStatus.COMPLETED]:
            raise ReviewNotFoundError(f"Review {review_id} not found or not yet completed")
    
    # Eagerly load finding_objects relationship
    result = db.query(ReviewResult).filter(
        ReviewResult.review_id == review_id
    ).first()
    
    review_response = ReviewResponse.model_validate(review)
    
    if result:
        # Eagerly load findings
        from sqlalchemy.orm import joinedload
        result_with_findings = db.query(ReviewResult).options(
            joinedload(ReviewResult.finding_objects)
        ).filter(ReviewResult.id == result.id).first()
        result_response = ReviewResultResponse.model_validate(result_with_findings)
    else:
        result_response = None
    
    return ReviewDetailResponse(
        review=review_response,
        result=result_response
    )


@router.post("/{review_id}/retry", response_model=ReviewResponse)
async def retry_review(
    review_id: UUID,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retry a failed review."""
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.user_id == current_user.id
    ).first()
    
    if not review:
        raise ReviewNotFoundError(f"Review {review_id} not found")
    
    if review.status != ReviewStatus.FAILED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only retry failed reviews"
        )
    
    # Reset review status and clear previous result
    review.status = ReviewStatus.PENDING
    review.completed_at = None
    
    # Delete previous result and findings
    previous_result = db.query(ReviewResult).filter(ReviewResult.review_id == review_id).first()
    if previous_result:
        db.query(Finding).filter(Finding.review_result_id == previous_result.id).delete()
        db.delete(previous_result)
    
    db.commit()
    db.refresh(review)
    
    # Start processing again
    background_tasks.add_task(process_review_async, review.id, review.repository_url)
    
    return ReviewResponse.model_validate(review)


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a review and its associated data."""
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.user_id == current_user.id
    ).first()
    
    if not review:
        raise ReviewNotFoundError(f"Review {review_id} not found")
    
    # Delete associated findings and results
    result = db.query(ReviewResult).filter(ReviewResult.review_id == review_id).first()
    if result:
        db.query(Finding).filter(Finding.review_result_id == result.id).delete()
        db.delete(result)
    
    # Delete the review
    db.delete(review)
    db.commit()
    
    return None


@router.get("/analytics/trends")
async def get_review_trends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    days: int = 30
):
    """Get review trends over time (reviews created per day)."""
    # Calculate start date
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Query reviews grouped by date
    trends = db.query(
        func.date(Review.created_at).label('date'),
        func.count(Review.id).label('count')
    ).filter(
        Review.user_id == current_user.id,
        Review.created_at >= start_date
    ).group_by(
        func.date(Review.created_at)
    ).order_by(
        func.date(Review.created_at)
    ).all()
    
    # Format response
    return {
        "period_days": days,
        "data": [
            {
                "date": str(trend.date),
                "count": trend.count
            }
            for trend in trends
        ]
    }


@router.get("/analytics/scores")
async def get_average_scores(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    days: int = 30
):
    """Get average scores over time."""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Query average scores grouped by date
    scores = db.query(
        func.date(Review.created_at).label('date'),
        func.avg(ReviewResult.security_score).label('avg_security'),
        func.avg(ReviewResult.quality_score).label('avg_quality'),
        func.avg(ReviewResult.tech_debt_score).label('avg_tech_debt')
    ).join(
        ReviewResult, Review.id == ReviewResult.review_id
    ).filter(
        Review.user_id == current_user.id,
        Review.created_at >= start_date,
        Review.status == ReviewStatus.COMPLETED
    ).group_by(
        func.date(Review.created_at)
    ).order_by(
        func.date(Review.created_at)
    ).all()
    
    # Format response
    return {
        "period_days": days,
        "data": [
            {
                "date": str(score.date),
                "security": round(float(score.avg_security or 0), 1),
                "quality": round(float(score.avg_quality or 0), 1),
                "tech_debt": round(float(score.avg_tech_debt or 0), 1)
            }
            for score in scores
        ]
    }


@router.get("/analytics/repositories")
async def get_most_reviewed_repositories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 10
):
    """Get most reviewed repositories."""
    repos = db.query(
        Review.repository_name,
        Review.repository_url,
        func.count(Review.id).label('review_count'),
        func.avg(ReviewResult.security_score).label('avg_security'),
        func.avg(ReviewResult.quality_score).label('avg_quality'),
        func.avg(ReviewResult.tech_debt_score).label('avg_tech_debt')
    ).outerjoin(
        ReviewResult, Review.id == ReviewResult.review_id
    ).filter(
        Review.user_id == current_user.id,
        Review.repository_name.isnot(None)
    ).group_by(
        Review.repository_name,
        Review.repository_url
    ).order_by(
        func.count(Review.id).desc()
    ).limit(limit).all()
    
    # Format response
    return {
        "data": [
            {
                "repository_name": repo.repository_name,
                "repository_url": repo.repository_url,
                "review_count": repo.review_count,
                "avg_security": round(float(repo.avg_security or 0), 1) if repo.avg_security else None,
                "avg_quality": round(float(repo.avg_quality or 0), 1) if repo.avg_quality else None,
                "avg_tech_debt": round(float(repo.avg_tech_debt or 0), 1) if repo.avg_tech_debt else None
            }
            for repo in repos
        ]
    }


@router.get("/analytics/activity")
async def get_activity_timeline(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20
):
    """Get recent activity timeline."""
    activities = db.query(
        Review.id,
        Review.repository_name,
        Review.status,
        Review.created_at,
        Review.completed_at
    ).filter(
        Review.user_id == current_user.id
    ).order_by(
        Review.created_at.desc()
    ).limit(limit).all()
    
    # Format response
    return {
        "data": [
            {
                "id": str(activity.id),
                "repository_name": activity.repository_name,
                "status": activity.status,
                "created_at": activity.created_at.isoformat() if activity.created_at else None,
                "completed_at": activity.completed_at.isoformat() if activity.completed_at else None
            }
            for activity in activities
        ]
    }
