"""Authentication-related schemas."""

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")


class LoginRequest(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    """Schema for authentication response."""
    access_token: str
    refresh_token: str
    user: dict


class UserResponse(BaseModel):
    """Schema for user information."""
    id: str
    email: str
    subscription_tier: str


class GitHubOAuthRequest(BaseModel):
    """Schema for GitHub OAuth callback."""
    code: str


class GitHubOAuthUrlResponse(BaseModel):
    """Schema for GitHub OAuth URL response."""
    auth_url: str


class LogoutResponse(BaseModel):
    """Schema for logout response."""
    message: str

