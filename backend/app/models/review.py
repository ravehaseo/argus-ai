"""Review models."""

from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.models.base import Base, TimestampMixin
from app.core.constants import ReviewStatus, ReviewType


class Review(Base, TimestampMixin):
    """Review model."""

    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    repository_url = Column(String, nullable=True)
    repository_name = Column(String, nullable=True)
    status = Column(String, default=ReviewStatus.PENDING, nullable=False, index=True)
    review_type = Column(String, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<Review(id={self.id}, status={self.status}, repository={self.repository_name})>"

    user = relationship("User", backref="reviews")
    result = relationship("ReviewResult", back_populates="review", uselist=False)


class ReviewResult(Base, TimestampMixin):
    """Review result model."""

    __tablename__ = "review_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    review_id = Column(UUID(as_uuid=True), ForeignKey("reviews.id"), nullable=False, unique=True, index=True)
    security_score = Column(Integer, nullable=False)
    quality_score = Column(Integer, nullable=False)
    tech_debt_score = Column(Integer, nullable=False)
    summary = Column(Text, nullable=True)
    findings = Column(JSONB, nullable=True)
    recommendations = Column(JSONB, nullable=True)
    raw_analysis = Column(Text, nullable=True)

    review = relationship("Review", back_populates="result")
    finding_objects = relationship("Finding", back_populates="review_result", cascade="all, delete-orphan")


class Finding(Base, TimestampMixin):
    """Individual finding/issue from code review."""

    __tablename__ = "findings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    review_result_id = Column(UUID(as_uuid=True), ForeignKey("review_results.id"), nullable=False, index=True)
    severity = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    file_path = Column(String, nullable=True)
    line_number = Column(Integer, nullable=True)
    issue_description = Column(Text, nullable=False)
    suggested_fix = Column(Text, nullable=True)
    code_snippet = Column(Text, nullable=True)

    review_result = relationship("ReviewResult", back_populates="finding_objects")

