"""Review generation service that orchestrates code analysis."""

from typing import Dict, List
from uuid import UUID
import logging

from app.services.github_service import GitHubService
from app.services.ai_service import AIService
from app.services.code_analyzer import CodeAnalyzer
from app.core.exceptions import ReviewProcessingError
from app.utils.validation import parse_repository_url

logger = logging.getLogger("argus")


class ReviewGenerator:
    """Service for generating code reviews."""

    def __init__(self, github_token: str = None):
        """Initialize review generator with services."""
        from app.core.config import settings
        
        # Use provided token, or fall back to config token, or None
        token = github_token or settings.GITHUB_ACCESS_TOKEN or None
        if token:
            logger.info("Using GitHub access token for API requests")
        else:
            logger.warning("No GitHub access token configured. Rate limit: 60 requests/hour. Add GITHUB_ACCESS_TOKEN to .env for 5000 requests/hour.")
        
        self.github_service = GitHubService(access_token=token)
        self.ai_service = AIService()
        self.code_analyzer = CodeAnalyzer()

    async def generate_review(
        self,
        repository_url: str,
        review_id: UUID,
        max_files: int = 50
    ) -> Dict:
        """Generate comprehensive code review for repository."""
        
        try:
            logger.info(f"Fetching repository info for {repository_url}")
            repo_info = await self.github_service.get_repository_info(repository_url)
            default_branch = repo_info.get("default_branch", "main")
            logger.info(f"Repository default branch: {default_branch}")
            
            # Get the commit SHA for the default branch
            owner, repo = parse_repository_url(repository_url)
            
            # Try to get tree with branch name, if that fails, get the SHA
            try:
                logger.info(f"Fetching repository tree for branch: {default_branch}")
                tree_data = await self.github_service.get_repository_tree(
                    repository_url,
                    sha=default_branch
                )
            except Exception as e:
                logger.warning(f"Failed to get tree with branch name, trying SHA: {e}")
                # If branch name doesn't work, try to get the SHA from the branch
                import httpx
                async with httpx.AsyncClient() as client:
                    branch_response = await client.get(
                        f"https://api.github.com/repos/{owner}/{repo}/branches/{default_branch}",
                        headers=self.github_service.headers,
                        timeout=10.0
                    )
                    if branch_response.status_code == 200:
                        branch_data = branch_response.json()
                        sha = branch_data["commit"]["sha"]
                        logger.info(f"Using commit SHA: {sha}")
                        tree_data = await self.github_service.get_repository_tree(
                            repository_url,
                            sha=sha
                        )
                    else:
                        logger.error(f"Failed to get branch info: {branch_response.status_code}")
                        raise ReviewProcessingError(
                            f"Failed to access repository branch: {branch_response.status_code}",
                            review_id=str(review_id)
                        )
            
            all_files = tree_data.get("tree", [])
            logger.info(f"Found {len(all_files)} total files in repository")
            
            code_files = [
                f for f in all_files 
                if f.get("type") == "blob" and self.code_analyzer.detect_language(f.get("path", ""))
            ]
            
            logger.info(f"Found {len(code_files)} code files to analyze")
            
            if not code_files:
                raise ReviewProcessingError(
                    "No code files found in repository. Please ensure the repository contains supported code files.",
                    review_id=str(review_id)
                )
            
            structure = self.code_analyzer.analyze_repository_structure(code_files)
            primary_language = structure.get("primary_language", "unknown")
            logger.info(f"Primary language detected: {primary_language}")
            
            key_files = self.code_analyzer.identify_key_files(code_files)
            logger.info(f"Identified {len(key_files)} key files")
            
            # If no key files found, use all code files (up to max_files)
            if not key_files:
                logger.info("No key files identified, using all code files")
                files_to_analyze = code_files[:max_files]
            else:
                files_to_analyze = key_files[:max_files]
            
            logger.info(f"Analyzing {len(files_to_analyze)} files: {[f.get('path') for f in files_to_analyze[:5]]}")
            
            file_contents = []
            for file_info in files_to_analyze:
                try:
                    content = await self.github_service.get_file_content(
                        repository_url,
                        file_info["path"]
                    )
                    file_contents.append({
                        "path": file_info["path"],
                        "content": content[:5000],
                        "language": self.code_analyzer.detect_language(file_info["path"])
                    })
                except Exception as e:
                    logger.warning(f"Failed to fetch file {file_info.get('path')}: {e}")
                    continue
            
            logger.info(f"Successfully fetched {len(file_contents)} files for analysis")
            
            if not file_contents:
                raise ReviewProcessingError(
                    "Failed to fetch any file contents from repository. Repository may be empty or inaccessible.",
                    review_id=str(review_id)
                )
            
            logger.info(f"Calling AI service to review repository (language: {primary_language})")
            ai_result = await self.ai_service.review_repository(
                structure,
                file_contents,
                primary_language
            )
            logger.info("AI service review completed")
            
            return {
                "security_score": ai_result.get("security_score", 0),
                "quality_score": ai_result.get("quality_score", 0),
                "tech_debt_score": ai_result.get("tech_debt_score", 0),
                "summary": ai_result.get("summary", ""),
                "findings": ai_result.get("findings", []),
                "recommendations": ai_result.get("recommendations", []),
                "raw_analysis": str(ai_result),
                "repository_info": {
                    "name": repo_info.get("name"),
                    "full_name": repo_info.get("full_name"),
                    "language": primary_language,
                    "structure": structure
                }
            }
            
        except ReviewProcessingError:
            raise
        except Exception as e:
            logger.error(f"Failed to generate review for {repository_url}: {str(e)}", exc_info=True)
            raise ReviewProcessingError(
                f"Failed to generate review: {str(e)}",
                review_id=str(review_id)
            )
