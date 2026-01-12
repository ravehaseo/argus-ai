"""Input validation utilities."""

import re
from urllib.parse import urlparse
from typing import Optional

from app.core.exceptions import InvalidRepositoryError


# More strict pattern: only matches repository URLs, not other GitHub pages
# Must have exactly: github.com/owner/repo (with optional trailing slash)
# Excludes: settings, profile pages, organization pages, etc.
GITHUB_URL_PATTERN = re.compile(
    r"^https?://(www\.)?github\.com/[a-zA-Z0-9]([a-zA-Z0-9_.-]*[a-zA-Z0-9])?/[a-zA-Z0-9]([a-zA-Z0-9_.-]*[a-zA-Z0-9])?/?$"
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
    
    # Must have exactly 2 path parts: owner and repo
    if len(path_parts) != 2:
        return False
    
    owner, repo = path_parts[0], path_parts[1]
    
    # Exclude common GitHub non-repository paths
    excluded_paths = {
        'settings', 'profile', 'orgs', 'organizations', 'explore', 
        'topics', 'trending', 'stars', 'marketplace', 'pulls', 'issues',
        'notifications', 'new', 'import', 'login', 'logout', 'join',
        'pricing', 'enterprise', 'blog', 'about', 'contact', 'site',
        'security', 'roadmap', 'features', 'customer-stories', 'resources',
        'sponsors', 'codespaces', 'discussions', 'pulls', 'actions'
    }
    
    if owner.lower() in excluded_paths or repo.lower() in excluded_paths:
        return False
    
    # Repository name cannot be a reserved word or special path
    if repo.endswith('.git'):
        repo = repo[:-4]
    
    # Additional validation: owner and repo should be valid GitHub identifiers
    if not owner or not repo:
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

