"""Review-related schemas."""

from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Dict
from uuid import UUID
from datetime import datetime
from app.core.constants import ReviewStatus, ReviewType, FindingSeverity, FindingCategory


class ReviewCreate(BaseModel):
    """Schema for creating a review."""
    repository_url: HttpUrl = Field(..., description="GitHub repository URL")
    review_type: ReviewType = ReviewType.GITHUB_REPO


class ReviewResponse(BaseModel):
    """Schema for review response."""
    id: UUID
    user_id: UUID
    repository_url: Optional[str]
    repository_name: Optional[str]
    status: ReviewStatus
    review_type: ReviewType
    created_at: datetime
    completed_at: Optional[datetime]

    model_config = {"from_attributes": True}


class FindingResponse(BaseModel):
    """Schema for finding response."""
    id: UUID
    severity: FindingSeverity
    category: FindingCategory
    file_path: Optional[str]
    line_number: Optional[int]
    issue_description: str
    suggested_fix: Optional[str]
    code_snippet: Optional[str]

    model_config = {"from_attributes": True}


class ReviewResultResponse(BaseModel):
    """Schema for review result response."""
    id: UUID
    review_id: UUID
    security_score: int = Field(..., ge=0, le=100)
    quality_score: int = Field(..., ge=0, le=100)
    tech_debt_score: int = Field(..., ge=0, le=100)
    summary: Optional[str]
    findings: Optional[List[Dict]]
    recommendations: Optional[List[Dict]]
    created_at: datetime
    finding_objects: Optional[List[FindingResponse]] = []

    model_config = {"from_attributes": True}


class ReviewDetailResponse(BaseModel):
    """Schema for detailed review response."""
    review: ReviewResponse
    result: Optional[ReviewResultResponse]

