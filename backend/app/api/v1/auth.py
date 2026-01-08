"""Authentication endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from urllib.parse import urlencode

from app.core.database import get_db
from app.core.supabase_client import supabase
from app.core.config import settings
from app.core.exceptions import AuthenticationError
from app.core.admin import authenticate_admin
from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    UserResponse,
    GitHubOAuthRequest,
    GitHubOAuthUrlResponse,
    LogoutResponse
)
from app.core.dependencies import get_current_user

router = APIRouter()
security = HTTPBearer()


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    register_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    """User registration with email and password."""
    try:
        response = supabase.auth.sign_up({
            "email": register_data.email,
            "password": register_data.password
        })
        
        if not response.user:
            raise AuthenticationError("Registration failed")
        
        user_id = response.user.id
        email = response.user.email
        
        user = User(
            id=user_id,
            email=email,
            subscription_tier="free"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        session = response.session
        if not session:
            raise AuthenticationError("Failed to create session")
        
        return AuthResponse(
            access_token=session.access_token,
            refresh_token=session.refresh_token,
            user={
                "id": str(user.id),
                "email": user.email,
                "subscription_tier": user.subscription_tier
            }
        )
        
    except Exception as e:
        error_msg = str(e)
        if "already registered" in error_msg.lower() or "user already exists" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {error_msg}"
        )


@router.post("/login", response_model=AuthResponse)
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """User login with email and password."""
    try:
        # Check if this is an admin login attempt
        if (settings.ADMIN_ENABLED and 
            login_data.email == settings.ADMIN_EMAIL and 
            login_data.password == settings.ADMIN_PASSWORD):
            # Admin login bypass
            admin_auth = await authenticate_admin(login_data.email, login_data.password, db)
            return AuthResponse(**admin_auth)
        
        # Regular user login via Supabase
        response = supabase.auth.sign_in_with_password({
            "email": login_data.email,
            "password": login_data.password
        })
        
        if not response.user or not response.session:
            raise AuthenticationError("Invalid credentials")
        
        user_id = response.user.id
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            user = User(
                id=user_id,
                email=response.user.email,
                subscription_tier="free"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        return AuthResponse(
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            user={
                "id": str(user.id),
                "email": user.email,
                "subscription_tier": user.subscription_tier
            }
        )
        
    except Exception as e:
        error_msg = str(e)
        if "invalid" in error_msg.lower() or "credentials" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Login failed: {error_msg}"
        )


@router.get("/github/url", response_model=GitHubOAuthUrlResponse)
async def get_github_oauth_url(redirect_to: str = None):
    """Get GitHub OAuth URL for frontend redirect."""
    if not redirect_to:
        redirect_to = f"{settings.CORS_ORIGINS[0]}/auth/callback" if settings.CORS_ORIGINS else "http://localhost:3000/auth/callback"
    
    response = supabase.auth.sign_in_with_oauth({
        "provider": "github",
        "options": {
            "redirect_to": redirect_to
        }
    })
    
    return GitHubOAuthUrlResponse(auth_url=response.url)


@router.post("/github", response_model=AuthResponse)
async def github_oauth_callback(
    oauth_data: GitHubOAuthRequest,
    db: Session = Depends(get_db)
):
    """Handle GitHub OAuth callback with authorization code."""
    try:
        response = supabase.auth.exchange_code_for_session(oauth_data.code)
        
        if not response.user or not response.session:
            raise AuthenticationError("OAuth authentication failed")
        
        user_id = response.user.id
        email = response.user.email or response.user.user_metadata.get("email", "")
        
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
        else:
            if email and user.email != email:
                user.email = email
                db.commit()
                db.refresh(user)
        
        return AuthResponse(
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            user={
                "id": str(user.id),
                "email": user.email,
                "subscription_tier": user.subscription_tier
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"GitHub OAuth failed: {str(e)}"
        )


@router.post("/logout", response_model=LogoutResponse)
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """User logout - invalidate session."""
    try:
        token = credentials.credentials
        supabase.auth.sign_out(token)
        
        return LogoutResponse(message="Logged out successfully")
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Logout failed: {str(e)}"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current authenticated user information."""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        subscription_tier=current_user.subscription_tier
    )


@router.post("/refresh", response_model=AuthResponse)
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token."""
    try:
        response = supabase.auth.refresh_session(refresh_token)
        
        if not response.user or not response.session:
            raise AuthenticationError("Token refresh failed")
        
        user_id = response.user.id
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise AuthenticationError("User not found")
        
        return AuthResponse(
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            user={
                "id": str(user.id),
                "email": user.email,
                "subscription_tier": user.subscription_tier
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token refresh failed: {str(e)}"
        )
