"""Application-wide constants."""

from enum import Enum


class ReviewStatus(str, Enum):
    """Review processing status."""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ReviewType(str, Enum):
    """Type of review source."""

    GITHUB_REPO = "github_repo"
    FILE_UPLOAD = "file_upload"


class FindingSeverity(str, Enum):
    """Severity levels for code findings."""

    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class FindingCategory(str, Enum):
    """Categories for code findings."""

    SECURITY = "security"
    PERFORMANCE = "performance"
    MAINTAINABILITY = "maintainability"
    BEST_PRACTICES = "best_practices"
    BUG = "bug"


class SubscriptionTier(str, Enum):
    """User subscription tiers."""

    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"


# File and size limits
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
MAX_REPO_SIZE = 100 * 1024 * 1024  # 100MB

# Supported file extensions for code analysis
SUPPORTED_EXTENSIONS = {
    ".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".go", ".rs",
    ".cpp", ".c", ".h", ".hpp", ".cs", ".php", ".rb", ".swift",
    ".kt", ".scala", ".dart", ".vue", ".svelte",
}

# Supported languages for analysis
SUPPORTED_LANGUAGES = {
    "python", "javascript", "typescript", "java", "go", "rust",
    "cpp", "c", "csharp", "php", "ruby", "swift", "kotlin",
    "scala", "dart", "vue", "svelte",
}

# Review limits per subscription tier
REVIEW_LIMITS = {
    SubscriptionTier.FREE: 1,  # per month
    SubscriptionTier.PRO: 10,  # per month
    SubscriptionTier.ENTERPRISE: -1,  # unlimited
}

# Score ranges
MIN_SCORE = 0
MAX_SCORE = 100

