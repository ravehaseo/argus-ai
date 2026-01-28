"""Admin utilities and authentication."""

from sqlalchemy.orm import Session
from app.models.user import User
from app.core.config import settings
# Removed circular import - get_supabase_client not needed here
from app.core.exceptions import AuthenticationError


def create_or_get_admin_user(db: Session) -> User:
    """Create or get the admin user."""
    if not settings.ADMIN_EMAIL or not settings.ADMIN_ENABLED:
        raise ValueError("Admin account not configured")
    
    admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
    
    if not admin:
        # Create admin user directly in database
        import uuid
        admin = User(
            id=uuid.uuid4(),
            email=settings.ADMIN_EMAIL,
            subscription_tier="enterprise",
            is_admin=True
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
    else:
        # Ensure existing user is marked as admin
        admin.is_admin = True
        admin.subscription_tier = "enterprise"
        db.commit()
        db.refresh(admin)
    
    return admin


async def authenticate_admin(email: str, password: str, db: Session) -> dict:
    """Authenticate admin user with special bypass."""
    # In production, the admin bypass must be disabled to avoid a hard-coded
    # superuser backdoor. Use proper authentication / RBAC instead.
    if settings.ENVIRONMENT == "production":
        raise AuthenticationError("Admin bypass authentication is disabled in production")
    
    if not settings.ADMIN_ENABLED:
        raise AuthenticationError("Admin authentication is disabled")
    
    if email != settings.ADMIN_EMAIL:
        raise AuthenticationError("Invalid admin credentials")
    
    if password != settings.ADMIN_PASSWORD:
        raise AuthenticationError("Invalid admin credentials")
    
    # Get or create admin user
    admin = create_or_get_admin_user(db)
    
    # Create a mock session for admin (bypass Supabase)
    # In production, you might want to use a different approach
    return {
        "access_token": "admin-token-bypass",
        "refresh_token": "admin-refresh-token",
        "user": {
            "id": str(admin.id),
            "email": admin.email,
            "subscription_tier": admin.subscription_tier,
            "is_admin": True
        }
    }


def is_admin_user(user: User) -> bool:
    """Check if user is an admin."""
    return user.is_admin if user else False

