"""Review endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

router = APIRouter()


@router.post("/")
async def create_review():
    """Create a new code review."""
    # TODO: Implement review creation
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Review creation not yet implemented"
    )


@router.get("/")
async def list_reviews():
    """List user's reviews."""
    # TODO: Implement review listing
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Review listing not yet implemented"
    )


@router.get("/{review_id}")
async def get_review(review_id: str):
    """Get review details."""
    # TODO: Implement review retrieval
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Review retrieval not yet implemented"
    )


@router.delete("/{review_id}")
async def delete_review(review_id: str):
    """Delete a review."""
    # TODO: Implement review deletion
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Review deletion not yet implemented"
    )

