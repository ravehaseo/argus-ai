"""Custom exception classes for the application."""


class ReviewError(Exception):
    """Base exception for review operations."""

    pass


class ReviewNotFoundError(ReviewError):
    """Raised when a review is not found."""

    pass


class ReviewProcessingError(ReviewError):
    """Raised when review processing fails."""

    def __init__(self, message: str, review_id: str = None):
        self.review_id = review_id
        super().__init__(message)


class InvalidRepositoryError(ReviewError):
    """Raised when repository URL or access is invalid."""

    pass


class QuotaExceededError(ReviewError):
    """Raised when user has exceeded their review quota."""

    pass


class AIServiceError(ReviewError):
    """Raised when AI service fails."""

    pass


class AuthenticationError(ReviewError):
    """Raised when authentication fails."""

    pass


class AuthorizationError(ReviewError):
    """Raised when user lacks required permissions."""

    pass

