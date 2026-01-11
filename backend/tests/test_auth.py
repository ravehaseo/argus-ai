"""Tests for authentication endpoints."""

import pytest
from fastapi import status
from unittest.mock import patch, MagicMock

from app.models.user import User


@pytest.mark.unit
class TestAuthEndpoints:
    """Test authentication endpoints."""
    
    def test_register_success(self, client, db):
        """Test successful user registration."""
        with patch('app.api.v1.auth.get_supabase_client') as mock_supabase:
            # Mock Supabase response
            mock_client = MagicMock()
            mock_response = MagicMock()
            mock_response.user = MagicMock()
            mock_response.user.id = "new-user-id"
            mock_response.user.email = "newuser@example.com"
            mock_response.session = MagicMock()
            mock_response.session.access_token = "test-access-token"
            mock_response.session.refresh_token = "test-refresh-token"
            mock_client.auth.sign_up.return_value = mock_response
            mock_supabase.return_value = mock_client
            
            response = client.post(
                "/api/v1/auth/register",
                json={
                    "email": "newuser@example.com",
                    "password": "password123"
                }
            )
            
            assert response.status_code == status.HTTP_201_CREATED
            data = response.json()
            assert "access_token" in data
            assert "refresh_token" in data
            assert data["user"]["email"] == "newuser@example.com"
    
    def test_register_invalid_email(self, client):
        """Test registration with invalid email."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "invalid-email",
                "password": "password123"
            }
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_register_short_password(self, client):
        """Test registration with short password."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "user@example.com",
                "password": "short"
            }
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_login_success(self, client, db, test_user):
        """Test successful login."""
        with patch('app.api.v1.auth.get_supabase_client') as mock_supabase:
            mock_client = MagicMock()
            mock_response = MagicMock()
            mock_response.user = MagicMock()
            mock_response.user.id = test_user.id
            mock_response.user.email = test_user.email
            mock_response.session = MagicMock()
            mock_response.session.access_token = "test-access-token"
            mock_response.session.refresh_token = "test-refresh-token"
            mock_client.auth.sign_in_with_password.return_value = mock_response
            mock_supabase.return_value = mock_client
            
            response = client.post(
                "/api/v1/auth/login",
                json={
                    "email": test_user.email,
                    "password": "password123"
                }
            )
            
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert "access_token" in data
            assert "refresh_token" in data
    
    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials."""
        with patch('app.api.v1.auth.get_supabase_client') as mock_supabase:
            mock_client = MagicMock()
            mock_client.auth.sign_in_with_password.side_effect = Exception("Invalid credentials")
            mock_supabase.return_value = mock_client
            
            response = client.post(
                "/api/v1/auth/login",
                json={
                    "email": "wrong@example.com",
                    "password": "wrongpassword"
                }
            )
            
            assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_me_endpoint(self, client, test_user):
        """Test getting current user info."""
        with patch('app.api.v1.auth.get_current_user') as mock_user:
            mock_user.return_value = test_user
            
            response = client.get("/api/v1/auth/me")
            
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["email"] == test_user.email
            assert data["subscription_tier"] == test_user.subscription_tier

