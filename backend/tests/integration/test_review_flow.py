"""Integration tests for review flow."""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from uuid import uuid4

from app.models.review import Review, ReviewStatus
from app.models.review_result import ReviewResult


@pytest.mark.integration
class TestReviewFlow:
    """Integration tests for complete review flow."""
    
    @pytest.mark.asyncio
    async def test_complete_review_flow(self, client, db, test_user):
        """Test complete review flow from creation to completion."""
        with patch('app.api.v1.reviews.get_current_user') as mock_user, \
             patch('app.core.rate_limiter.rate_limiter.check_quota') as mock_quota, \
             patch('app.services.github_service.GitHubService.get_repository_info') as mock_repo_info, \
             patch('app.services.github_service.GitHubService.get_repository_tree') as mock_tree, \
             patch('app.services.github_service.GitHubService.get_file_content') as mock_file, \
             patch('app.services.ai_service.AIService.review_repository') as mock_ai:
            
            # Setup mocks
            mock_user.return_value = test_user
            mock_quota.return_value = (True, 5)
            
            mock_repo_info.return_value = {
                "name": "test-repo",
                "default_branch": "main"
            }
            
            mock_tree.return_value = {
                "tree": [
                    {"path": "main.py", "type": "blob", "sha": "abc123"},
                    {"path": "README.md", "type": "blob", "sha": "def456"}
                ]
            }
            
            mock_file.return_value = {
                "content": "def hello():\n    print('world')",
                "encoding": "base64"
            }
            
            mock_ai.return_value = {
                "security_score": 85,
                "quality_score": 90,
                "tech_debt_score": 75,
                "summary": "Good code quality",
                "findings": [
                    {
                        "severity": "low",
                        "category": "best_practices",
                        "description": "Consider adding docstrings",
                        "file_path": "main.py",
                        "line_number": 1
                    }
                ]
            }
            
            # Create review
            response = client.post(
                "/api/v1/reviews/",
                json={
                    "repository_url": "https://github.com/user/test-repo"
                }
            )
            
            assert response.status_code == 201
            review_data = response.json()
            review_id = review_data["id"]
            
            # Simulate processing completion
            review = db.query(Review).filter(Review.id == review_id).first()
            review.status = ReviewStatus.COMPLETED
            db.commit()
            
            # Get review details
            response = client.get(f"/api/v1/reviews/{review_id}")
            assert response.status_code == 200
            
            data = response.json()
            assert data["status"] == ReviewStatus.COMPLETED.value

