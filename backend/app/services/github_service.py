"""GitHub API integration service."""

import httpx
import logging
from typing import Optional, Dict, List
from app.core.config import settings
from app.core.exceptions import InvalidRepositoryError
from app.utils.validation import parse_repository_url

logger = logging.getLogger("argus")


class GitHubService:
    """Service for interacting with GitHub API."""

    BASE_URL = "https://api.github.com"
    
    def __init__(self, access_token: Optional[str] = None):
        """Initialize GitHub service with optional access token."""
        self.access_token = access_token
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
        }
        if access_token:
            self.headers["Authorization"] = f"token {access_token}"

    async def get_repository_info(self, repo_url: str) -> Dict:
        """Get repository information."""
        owner, repo = parse_repository_url(repo_url)
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/repos/{owner}/{repo}",
                headers=self.headers,
                timeout=10.0
            )
            
            if response.status_code == 404:
                raise InvalidRepositoryError(f"Repository not found: {repo_url}")
            if response.status_code == 403:
                raise InvalidRepositoryError(f"Access denied to repository: {repo_url}")
            
            response.raise_for_status()
            return response.json()

    async def get_repository_contents(
        self, 
        repo_url: str, 
        path: str = "",
        recursive: bool = False
    ) -> List[Dict]:
        """Get repository contents (files and directories)."""
        owner, repo = parse_repository_url(repo_url)
        
        url = f"{self.BASE_URL}/repos/{owner}/{repo}/contents/{path}"
        params = {}
        if recursive:
            params["recursive"] = "1"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                headers=self.headers,
                params=params,
                timeout=30.0
            )
            
            if response.status_code == 404:
                return []
            
            response.raise_for_status()
            return response.json()

    async def get_file_content(self, repo_url: str, file_path: str) -> str:
        """Get file content from repository."""
        owner, repo = parse_repository_url(repo_url)
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/repos/{owner}/{repo}/contents/{file_path}",
                headers=self.headers,
                timeout=10.0
            )
            
            if response.status_code == 404:
                raise InvalidRepositoryError(f"File not found: {file_path}")
            
            response.raise_for_status()
            data = response.json()
            
            if data.get("encoding") == "base64":
                import base64
                return base64.b64decode(data["content"]).decode("utf-8")
            
            return data.get("content", "")

    async def get_repository_tree(self, repo_url: str, sha: str = "main") -> Dict:
        """Get repository tree recursively."""
        owner, repo = parse_repository_url(repo_url)
        
        async with httpx.AsyncClient() as client:
            # First try with recursive=1
            url = f"{self.BASE_URL}/repos/{owner}/{repo}/git/trees/{sha}?recursive=1"
            logger.debug(f"Fetching tree from: {url}")
            response = await client.get(
                url,
                headers=self.headers,
                timeout=30.0
            )
            
            # If 404, the SHA might be a branch name, try getting the commit SHA
            if response.status_code == 404:
                logger.info(f"Tree not found with SHA '{sha}', trying to get branch SHA")
                # Try to get the branch SHA
                branch_response = await client.get(
                    f"{self.BASE_URL}/repos/{owner}/{repo}/branches/{sha}",
                    headers=self.headers,
                    timeout=10.0
                )
                if branch_response.status_code == 200:
                    branch_data = branch_response.json()
                    sha = branch_data["commit"]["sha"]
                    logger.info(f"Got commit SHA: {sha}, retrying tree fetch")
                    # Retry with the actual SHA
                    response = await client.get(
                        f"{self.BASE_URL}/repos/{owner}/{repo}/git/trees/{sha}?recursive=1",
                        headers=self.headers,
                        timeout=30.0
                    )
                else:
                    logger.error(f"Failed to get branch info: {branch_response.status_code} - {branch_response.text}")
            
            if response.status_code == 404:
                raise InvalidRepositoryError(f"Repository tree not found. Branch/SHA '{sha}' may not exist.")
            if response.status_code == 403:
                error_data = response.json() if response.headers.get("content-type", "").startswith("application/json") else {}
                error_msg = error_data.get("message", "Access denied")
                logger.error(f"GitHub API 403 error: {error_msg}")
                raise InvalidRepositoryError(f"Access denied to repository tree: {error_msg}. Rate limit may be exceeded.")
            
            response.raise_for_status()
            tree_data = response.json()
            logger.info(f"Successfully fetched tree with {len(tree_data.get('tree', []))} items")
            return tree_data

