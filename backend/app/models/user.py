"""User model."""

from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.models.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    """User model extending Supabase Auth."""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    subscription_tier = Column(String, default="free", nullable=False)
    stripe_customer_id = Column(String, nullable=True, unique=True)

