"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.v1 import reviews, auth, webhooks

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
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(reviews.router, prefix="/api/v1/reviews", tags=["reviews"])
app.include_router(webhooks.router, prefix="/api/v1/webhooks", tags=["webhooks"])


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

