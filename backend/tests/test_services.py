"""Tests for service layer."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.core.exceptions import AIServiceError, InvalidRepositoryError
from app.services.github_service import GitHubService
from app.services.ai_service import AIService
from app.services.code_analyzer import CodeAnalyzer


@pytest.mark.unit
class TestGitHubService:
    """Test GitHub service."""
    
    def test_service_initialization(self):
        """Test GitHub service initialization."""
        service = GitHubService()
        assert service.BASE_URL == "https://api.github.com"
    
    def test_parse_repository_url(self):
        """Test repository URL parsing."""
        from app.utils.validation import parse_repository_url
        
        owner, repo = parse_repository_url("https://github.com/user/repo")
        assert owner == "user"
        assert repo == "repo"
        
        owner, repo = parse_repository_url("https://github.com/user/repo.git")
        assert owner == "user"
        assert repo == "repo"


@pytest.mark.unit
class TestCodeAnalyzer:
    """Test code analyzer service."""
    
    def test_detect_language(self):
        """Test language detection."""
        analyzer = CodeAnalyzer()
        
        assert analyzer.detect_language("test.py") == "python"
        assert analyzer.detect_language("test.js") == "javascript"
        assert analyzer.detect_language("test.ts") == "typescript"
        assert analyzer.detect_language("test.java") == "java"
        assert analyzer.detect_language("test.go") == "go"
        assert analyzer.detect_language("unknown.xyz") is None
    
    def test_identify_key_files(self):
        """Test key file identification."""
        analyzer = CodeAnalyzer()
        
        files = [
            {"path": "README.md", "type": "blob"},
            {"path": "main.py", "type": "blob"},
            {"path": "test.py", "type": "blob"},
            {"path": "config.json", "type": "blob"},
            {"path": "utils/helper.py", "type": "blob"},
        ]
        
        key_files = analyzer.identify_key_files(files)
        
        # Should prioritize main files
        assert "main.py" in [f["path"] for f in key_files]
        # Should exclude test files
        assert "test.py" not in [f["path"] for f in key_files]


@pytest.mark.unit
class TestAIService:
    """Test AI service."""
    
    @pytest.mark.asyncio
    async def test_analyze_code(self):
        """Test code analysis."""
        service = AIService()
        
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = '{"security_score": 85, "quality_score": 90, "findings": []}'
        
        with patch.object(service.client.chat.completions, 'create', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_response
            
            result = await service.analyze_code(
                code="def hello(): print('world')",
                file_path="test.py",
                language="python"
            )
            
            assert "security_score" in result
            assert "quality_score" in result
    
    @pytest.mark.asyncio
    async def test_analyze_code_invalid_response(self):
        """Test code analysis with invalid AI response."""
        service = AIService()
        
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "not valid json"
        
        with patch.object(service.client.chat.completions, 'create', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_response
            
            with pytest.raises(AIServiceError):
                await service.analyze_code(
                    code="def hello(): print('world')",
                    file_path="test.py",
                    language="python"
                )

