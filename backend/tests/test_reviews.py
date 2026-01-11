"""Tests for review endpoints."""

import pytest
from fastapi import status
from unittest.mock import patch, MagicMock, AsyncMock
from uuid import uuid4

from app.models.review import Review, ReviewStatus
from app.core.constants import SubscriptionTier


@pytest.mark.unit
class TestReviewEndpoints:
    """Test review endpoints."""
    
    def test_create_review_success(self, client, db, test_user):
        """Test successful review creation."""
        with patch('app.api.v1.reviews.get_current_user') as mock_user, \
             patch('app.core.rate_limiter.rate_limiter.check_quota') as mock_quota, \
             patch('app.api.v1.reviews.process_review_async') as mock_process:
            
            mock_user.return_value = test_user
            mock_quota.return_value = (True, 5)  # Has quota, 5 remaining
            
            response = client.post(
                "/api/v1/reviews/",
                json={
                    "repository_url": "https://github.com/user/repo"
                }
            )
            
            assert response.status_code == status.HTTP_201_CREATED
            data = response.json()
            assert data["repository_url"] == "https://github.com/user/repo"
            assert data["status"] == ReviewStatus.PENDING.value
            assert data["user_id"] == str(test_user.id)
    
    def test_create_review_quota_exceeded(self, client, db, test_user):
        """Test review creation when quota is exceeded."""
        with patch('app.api.v1.reviews.get_current_user') as mock_user, \
             patch('app.core.rate_limiter.rate_limiter.check_quota') as mock_quota:
            
            mock_user.return_value = test_user
            mock_quota.return_value = (False, 0)  # No quota
            
            response = client.post(
                "/api/v1/reviews/",
                json={
                    "repository_url": "https://github.com/user/repo"
                }
            )
            
            assert response.status_code == status.HTTP_403_FORBIDDEN
            data = response.json()
            assert "quota" in data["detail"].lower() or "limit" in data["detail"].lower()
    
    def test_create_review_invalid_url(self, client, db, test_user):
        """Test review creation with invalid repository URL."""
        with patch('app.api.v1.reviews.get_current_user') as mock_user:
            mock_user.return_value = test_user
            
            response = client.post(
                "/api/v1/reviews/",
                json={
                    "repository_url": "not-a-valid-url"
                }
            )
            
            assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_list_reviews(self, client, db, test_user):
        """Test listing user's reviews."""
        # Create test reviews
        review1 = Review(
            id=uuid4(),
            user_id=test_user.id,
            repository_url="https://github.com/user/repo1",
            status=ReviewStatus.COMPLETED
        )
        review2 = Review(
            id=uuid4(),
            user_id=test_user.id,
            repository_url="https://github.com/user/repo2",
            status=ReviewStatus.PENDING
        )
        db.add(review1)
        db.add(review2)
        db.commit()
        
        with patch('app.api.v1.reviews.get_current_user') as mock_user:
            mock_user.return_value = test_user
            
            response = client.get("/api/v1/reviews/")
            
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert len(data) == 2
            assert any(r["repository_url"] == "https://github.com/user/repo1" for r in data)
            assert any(r["repository_url"] == "https://github.com/user/repo2" for r in data)
    
    def test_get_review_detail(self, client, db, test_user):
        """Test getting review details."""
        review = Review(
            id=uuid4(),
            user_id=test_user.id,
            repository_url="https://github.com/user/repo",
            status=ReviewStatus.COMPLETED
        )
        db.add(review)
        db.commit()
        
        with patch('app.api.v1.reviews.get_current_user') as mock_user:
            mock_user.return_value = test_user
            
            response = client.get(f"/api/v1/reviews/{review.id}")
            
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["id"] == str(review.id)
            assert data["repository_url"] == review.repository_url
    
    def test_get_review_not_found(self, client, db, test_user):
        """Test getting non-existent review."""
        fake_id = uuid4()
        
        with patch('app.api.v1.reviews.get_current_user') as mock_user:
            mock_user.return_value = test_user
            
            response = client.get(f"/api/v1/reviews/{fake_id}")
            
            assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_delete_review(self, client, db, test_user):
        """Test deleting a review."""
        review = Review(
            id=uuid4(),
            user_id=test_user.id,
            repository_url="https://github.com/user/repo",
            status=ReviewStatus.PENDING
        )
        db.add(review)
        db.commit()
        
        with patch('app.api.v1.reviews.get_current_user') as mock_user:
            mock_user.return_value = test_user
            
            response = client.delete(f"/api/v1/reviews/{review.id}")
            
            assert response.status_code == status.HTTP_204_NO_CONTENT
            
            # Verify review is deleted
            deleted_review = db.query(Review).filter(Review.id == review.id).first()
            assert deleted_review is None
    
    def test_list_reviews_pagination(self, client, db, test_user):
        """Test review list pagination."""
        # Create multiple reviews
        for i in range(15):
            review = Review(
                id=uuid4(),
                user_id=test_user.id,
                repository_url=f"https://github.com/user/repo{i}",
                status=ReviewStatus.COMPLETED
            )
            db.add(review)
        db.commit()
        
        with patch('app.api.v1.reviews.get_current_user') as mock_user:
            mock_user.return_value = test_user
            
            # Test first page
            response = client.get("/api/v1/reviews/?skip=0&limit=10")
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert len(data) == 10
            
            # Test second page
            response = client.get("/api/v1/reviews/?skip=10&limit=10")
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert len(data) == 5  # Remaining reviews

