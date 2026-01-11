"""FastAPI application entry point."""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.database import engine, Base
from app.core.logging_config import logger
from app.core.error_handlers import (
    review_error_handler,
    authentication_error_handler,
    authorization_error_handler,
    validation_error_handler,
    database_error_handler,
    generic_exception_handler,
)
from app.core.exceptions import (
    ReviewError,
    AuthenticationError,
    AuthorizationError,
)
from app.api.v1 import reviews, auth, webhooks, admin

Base.metadata.create_all(bind=engine)

logger.info("Starting Argus API")

app = FastAPI(
    title="Argus API",
    description="API for Argus - AI-powered code review service",
    version="0.1.0",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Error handlers
app.add_exception_handler(ReviewError, review_error_handler)
app.add_exception_handler(AuthenticationError, authentication_error_handler)
app.add_exception_handler(AuthorizationError, authorization_error_handler)
app.add_exception_handler(RequestValidationError, validation_error_handler)
app.add_exception_handler(SQLAlchemyError, database_error_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(reviews.router, prefix="/api/v1/reviews", tags=["reviews"])
app.include_router(webhooks.router, prefix="/api/v1/webhooks", tags=["webhooks"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])


@app.get("/")
async def root():
    """Health check endpoint."""
    return JSONResponse({"status": "ok", "message": "Argus API - The all-seeing code reviewer"})


@app.get("/health")
async def health():
    """Detailed health check."""
    return JSONResponse({
        "status": "healthy",
        "version": "0.1.0",
        "environment": settings.ENVIRONMENT,
    })

