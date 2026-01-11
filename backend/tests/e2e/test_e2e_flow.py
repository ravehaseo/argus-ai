"""End-to-end tests for complete user flows."""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from uuid import uuid4


@pytest.mark.e2e
class TestE2EFlows:
    """End-to-end tests for complete user flows."""
    
    @pytest.mark.asyncio
    async def test_user_registration_to_review_flow(self, client, db):
        """Test complete flow: register -> login -> create review -> view results."""
        
        # Step 1: Register user
        with patch('app.api.v1.auth.get_supabase_client') as mock_supabase:
            mock_client = MagicMock()
            mock_response = MagicMock()
            mock_response.user = MagicMock()
            mock_response.user.id = "e2e-user-id"
            mock_response.user.email = "e2e@example.com"
            mock_response.session = MagicMock()
            mock_response.session.access_token = "e2e-access-token"
            mock_response.session.refresh_token = "e2e-refresh-token"
            mock_client.auth.sign_up.return_value = mock_response
            mock_supabase.return_value = mock_client
            
            register_response = client.post(
                "/api/v1/auth/register",
                json={
                    "email": "e2e@example.com",
                    "password": "password123"
                }
            )
            
            assert register_response.status_code == 201
            auth_data = register_response.json()
            assert "access_token" in auth_data
        
        # Step 2: Get user info
        from app.models.user import User
        user = db.query(User).filter(User.email == "e2e@example.com").first()
        assert user is not None
        
        # Step 3: Create review
        with patch('app.api.v1.reviews.get_current_user') as mock_user, \
             patch('app.core.rate_limiter.rate_limiter.check_quota') as mock_quota, \
             patch('app.services.github_service.GitHubService.get_repository_info') as mock_repo, \
             patch('app.services.github_service.GitHubService.get_repository_tree') as mock_tree, \
             patch('app.services.github_service.GitHubService.get_file_content') as mock_file, \
             patch('app.services.ai_service.AIService.review_repository') as mock_ai:
            
            mock_user.return_value = user
            mock_quota.return_value = (True, 10)
            mock_repo.return_value = {"name": "test-repo", "default_branch": "main"}
            mock_tree.return_value = {
                "tree": [{"path": "main.py", "type": "blob", "sha": "abc"}]
            }
            mock_file.return_value = {"content": "def hello(): pass", "encoding": "base64"}
            mock_ai.return_value = {
                "security_score": 90,
                "quality_score": 85,
                "tech_debt_score": 80,
                "summary": "Good code",
                "findings": []
            }
            
            review_response = client.post(
                "/api/v1/reviews/",
                json={
                    "repository_url": "https://github.com/user/test-repo"
                }
            )
            
            assert review_response.status_code == 201
            review_data = review_response.json()
            review_id = review_data["id"]
            
            # Step 4: List reviews
            list_response = client.get("/api/v1/reviews/")
            assert list_response.status_code == 200
            reviews = list_response.json()
            assert len(reviews) >= 1
            assert any(r["id"] == review_id for r in reviews)
            
            # Step 5: Get review details
            detail_response = client.get(f"/api/v1/reviews/{review_id}")
            assert detail_response.status_code == 200
            detail_data = detail_response.json()
            assert detail_data["id"] == review_id

