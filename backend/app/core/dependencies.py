"""FastAPI dependencies for common tasks."""

from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.exceptions import AuthenticationError, AuthorizationError
from app.core.supabase_client import get_supabase_client
from app.core.admin import is_admin_user, create_or_get_admin_user
from app.models.user import User


async def get_current_user(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token or admin bypass."""
    from app.core.config import settings
    
    # Extract token from Authorization header first
    if not authorization or not authorization.startswith("Bearer "):
        raise AuthenticationError("Missing or invalid authorization header")
    
    token = authorization.replace("Bearer ", "").strip()
    
    # Check for admin token bypass FIRST (before Supabase validation)
    if token == "admin-token-bypass" and settings.ADMIN_ENABLED:
        import logging
        logger = logging.getLogger("argus")
        logger.info(f"Admin token detected for email: {settings.ADMIN_EMAIL}")
        return create_or_get_admin_user(db)
    
    # Regular Supabase JWT validation
    try:
        supabase = get_supabase_client()
        
        # Verify token with Supabase
        try:
            user_data = supabase.auth.get_user(token)
            if not user_data or not user_data.user:
                raise AuthenticationError("Invalid token")
        except Exception:
            # If Supabase validation fails, check if it's admin token (fallback)
            if token == "admin-token-bypass" and settings.ADMIN_ENABLED:
                return create_or_get_admin_user(db)
            raise AuthenticationError("Invalid token")
        
        user_id = user_data.user.id
        email = user_data.user.email
        
        # Get or create user in database
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            user = User(
                id=user_id,
                email=email,
                subscription_tier="free"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        return user
        
    except AuthenticationError:
        raise
    except Exception as e:
        raise AuthenticationError(f"Authentication failed: {str(e)}")


async def get_optional_user(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current user if authenticated, otherwise None.
    
    This allows endpoints to be publicly accessible while still providing
    user context if the user is authenticated.
    """
    # If no authorization header, return None (public access)
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    # Try to get the user, but don't fail if authentication fails
    try:
        return await get_current_user(authorization, db)
    except (AuthenticationError, HTTPException, Exception):
        # Any authentication error means no user - return None for public access
        return None


async def get_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current user and verify they are an admin."""
    if not is_admin_user(current_user):
        raise AuthorizationError("Admin access required")
    return current_user
