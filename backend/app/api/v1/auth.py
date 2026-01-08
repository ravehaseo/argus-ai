"""Authentication endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer

router = APIRouter()
security = HTTPBearer()


@router.post("/login")
async def login():
    """User login endpoint."""
    # TODO: Implement Supabase authentication
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Authentication not yet implemented"
    )


@router.post("/register")
async def register():
    """User registration endpoint."""
    # TODO: Implement user registration
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Registration not yet implemented"
    )


@router.post("/github")
async def github_oauth():
    """GitHub OAuth callback."""
    # TODO: Implement GitHub OAuth
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="GitHub OAuth not yet implemented"
    )


@router.post("/logout")
async def logout():
    """User logout endpoint."""
    # TODO: Implement logout
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Logout not yet implemented"
    )

