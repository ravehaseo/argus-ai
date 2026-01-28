"""Application configuration using Pydantic settings."""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    ENVIRONMENT: str = "development"
    SECRET_KEY: str
    CORS_ORIGINS: str = "http://localhost:3000"  # Comma-separated or JSON array
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS into a list."""
        import json
        try:
            # Try parsing as JSON array first
            return json.loads(self.CORS_ORIGINS)
        except (json.JSONDecodeError, TypeError):
            # Fall back to comma-separated string
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    # Database
    DATABASE_URL: str

    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_ANON_KEY: str

    # AI Services
    OPENAI_API_KEY: str = ""  # Optional if using Groq
    # OpenAI Models: gpt-5.1, gpt-5-mini, gpt-5-nano, gpt-4.1, gpt-4o, gpt-4o-mini, o3 (check OpenAI docs for latest)
    # Note: Models are selected automatically based on subscription tier:
    #   - Free: Groq (if enabled) or gpt-4o-mini
    #   - Pro: gpt-5-mini
    #   - Enterprise: gpt-5.1
    OPENAI_MODEL: str = "gpt-4o-mini"  # Fallback default (used for free tier if not using Groq)
    # Alternative: Groq (free tier available)
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.1-8b-instant"  # Current free tier model (fast and reliable)
    USE_GROQ: bool = False  # Set to True to use Groq instead of OpenAI for free tier
    ANTHROPIC_API_KEY: str = ""

    # GitHub
    GITHUB_CLIENT_ID: str
    GITHUB_CLIENT_SECRET: str
    GITHUB_ACCESS_TOKEN: str = ""  # Optional: Personal Access Token for higher rate limits and private repo access

    # Stripe
    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_SECRET: str = ""

    # Admin
    ADMIN_EMAIL: str = ""
    ADMIN_PASSWORD: str = ""
    # IMPORTANT:
    # - Admin bypass is intended for local development and testing only.
    # - It should be disabled in production to avoid a permanent superuser backdoor.
    # - Use proper authentication / RBAC for production admin access instead.
    ADMIN_ENABLED: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

