"""Input validation utilities."""

import re
from urllib.parse import urlparse
from typing import Optional

from app.core.exceptions import InvalidRepositoryError


GITHUB_URL_PATTERN = re.compile(
    r"^https?://(www\.)?github\.com/[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+/?$"
)


def validate_repository_url(url: str) -> bool:
    """Validate GitHub repository URL format."""
    if not url or not isinstance(url, str):
        return False
    
    url = url.strip()
    if not GITHUB_URL_PATTERN.match(url):
        return False
    
    parsed = urlparse(url)
    path_parts = [p for p in parsed.path.split("/") if p]
    
    if len(path_parts) < 2:
        return False
    
    return True


def parse_repository_url(url: str) -> tuple[str, str]:
    """Parse GitHub URL into owner and repo name."""
    if not validate_repository_url(url):
        raise InvalidRepositoryError(f"Invalid repository URL: {url}")
    
    parsed = urlparse(url)
    path_parts = [p for p in parsed.path.split("/") if p]
    
    owner = path_parts[0]
    repo = path_parts[1].rstrip(".git")
    
    return owner, repo


def validate_file_size(size: int, max_size: int) -> bool:
    """Validate file size is within limit."""
    return 0 < size <= max_size


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent directory traversal."""
    filename = filename.replace("..", "")
    filename = filename.replace("/", "_")
    filename = filename.replace("\\", "_")
    return filename


def is_supported_file(filename: str) -> bool:
    """Check if file extension is supported for analysis."""
    from app.core.constants import SUPPORTED_EXTENSIONS
    
    if not filename:
        return False
    
    filename_lower = filename.lower()
    return any(filename_lower.endswith(ext) for ext in SUPPORTED_EXTENSIONS)

