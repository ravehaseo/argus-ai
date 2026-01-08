"""Global error handlers for FastAPI."""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
import logging

from app.core.exceptions import (
    ReviewError,
    ReviewNotFoundError,
    ReviewProcessingError,
    InvalidRepositoryError,
    QuotaExceededError,
    AIServiceError,
    AuthenticationError,
    AuthorizationError,
)

logger = logging.getLogger("argus")


async def review_error_handler(request: Request, exc: ReviewError) -> JSONResponse:
    """Handle review-related errors."""
    status_code = status.HTTP_400_BAD_REQUEST
    
    if isinstance(exc, ReviewNotFoundError):
        status_code = status.HTTP_404_NOT_FOUND
    elif isinstance(exc, QuotaExceededError):
        status_code = status.HTTP_403_FORBIDDEN
    elif isinstance(exc, InvalidRepositoryError):
        status_code = status.HTTP_400_BAD_REQUEST
    elif isinstance(exc, ReviewProcessingError):
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        logger.error(f"Review processing error: {exc}", exc_info=True)
    elif isinstance(exc, AIServiceError):
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        logger.error(f"AI service error: {exc}", exc_info=True)
    
    logger.warning(f"Review error: {exc.__class__.__name__} - {exc}")
    
    return JSONResponse(
        status_code=status_code,
        content={
            "error": exc.__class__.__name__,
            "detail": str(exc),
            "review_id": getattr(exc, "review_id", None),
        }
    )


async def authentication_error_handler(request: Request, exc: AuthenticationError) -> JSONResponse:
    """Handle authentication errors."""
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={
            "error": "AuthenticationError",
            "detail": str(exc),
        }
    )


async def authorization_error_handler(request: Request, exc: AuthorizationError) -> JSONResponse:
    """Handle authorization errors."""
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={
            "error": "AuthorizationError",
            "detail": str(exc),
        }
    )


async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle request validation errors."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "ValidationError",
            "detail": exc.errors(),
        }
    )


async def database_error_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    """Handle database errors."""
    logger.error(f"Database error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "DatabaseError",
            "detail": "A database error occurred. Please try again later.",
        }
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unexpected exceptions."""
    logger.error(f"Unexpected error: {exc}", exc_info=True, extra={
        "path": request.url.path,
        "method": request.method,
    })
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "detail": "An unexpected error occurred. Please try again later.",
        }
    )

