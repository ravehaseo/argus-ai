"""Code analysis and repository parsing service."""

import re
from typing import Dict, List, Optional
from pathlib import Path
from app.core.constants import SUPPORTED_EXTENSIONS, SUPPORTED_LANGUAGES
from app.utils.validation import is_supported_file


class CodeAnalyzer:
    """Service for analyzing code structure and extracting information."""

    @staticmethod
    def detect_language(file_path: str) -> Optional[str]:
        """Detect programming language from file extension."""
        path = Path(file_path)
        ext = path.suffix.lower()
        
        language_map = {
            ".py": "python",
            ".js": "javascript",
            ".ts": "typescript",
            ".jsx": "javascript",
            ".tsx": "typescript",
            ".java": "java",
            ".go": "go",
            ".rs": "rust",
            ".cpp": "cpp",
            ".c": "c",
            ".h": "c",
            ".hpp": "cpp",
            ".cs": "csharp",
            ".php": "php",
            ".rb": "ruby",
            ".swift": "swift",
            ".kt": "kotlin",
            ".scala": "scala",
            ".dart": "dart",
            ".vue": "vue",
            ".svelte": "svelte",
        }
        
        return language_map.get(ext)

    @staticmethod
    def identify_key_files(files: List[Dict]) -> List[Dict]:
        """Identify important files for analysis (entry points, configs, etc.)."""
        key_patterns = [
            r"main\.(py|js|ts|java|go|rs|cpp)$",
            r"app\.(py|js|ts)$",
            r"index\.(js|ts|jsx|tsx)$",
            r"package\.json$",
            r"requirements\.txt$",
            r"go\.mod$",
            r"Cargo\.toml$",
            r"pom\.xml$",
            r"build\.gradle$",
            r"\.env",
            r"config\.(py|js|ts|json|yaml|yml)$",
            r"settings\.(py|js|ts)$",
        ]
        
        key_files = []
        for file_info in files:
            path = file_info.get("path", "")
            if any(re.search(pattern, path, re.IGNORECASE) for pattern in key_patterns):
                key_files.append(file_info)
        
        # If no key files found, return all files (they'll be filtered by language)
        # This ensures we always have something to analyze
        if not key_files:
            return files
        
        return key_files

    @staticmethod
    def filter_code_files(files: List[Dict]) -> List[Dict]:
        """Filter files to only include supported code files."""
        code_files = []
        for file_info in files:
            path = file_info.get("path", "")
            if is_supported_file(path):
                code_files.append(file_info)
        return code_files

    @staticmethod
    def analyze_repository_structure(files: List[Dict]) -> Dict:
        """Analyze repository structure and organization."""
        structure = {
            "total_files": len(files),
            "languages": {},
            "directories": set(),
            "has_tests": False,
            "has_docs": False,
            "has_config": False,
        }
        
        for file_info in files:
            path = file_info.get("path", "")
            
            language = CodeAnalyzer.detect_language(path)
            if language:
                structure["languages"][language] = structure["languages"].get(language, 0) + 1
            
            path_obj = Path(path)
            if path_obj.parent != Path("."):
                structure["directories"].add(str(path_obj.parent))
            
            if "test" in path.lower() or "spec" in path.lower():
                structure["has_tests"] = True
            
            if "doc" in path.lower() or "readme" in path.lower():
                structure["has_docs"] = True
            
            if any(config in path.lower() for config in ["config", "settings", ".env", "package.json"]):
                structure["has_config"] = True
        
        structure["directories"] = list(structure["directories"])
        structure["primary_language"] = max(
            structure["languages"].items(),
            key=lambda x: x[1]
        )[0] if structure["languages"] else None
        
        return structure

    @staticmethod
    def extract_dependencies(code: str, language: str) -> List[str]:
        """Extract dependencies/imports from code."""
        dependencies = []
        
        if language == "python":
            import_pattern = r"^(?:from|import)\s+([\w.]+)"
            matches = re.findall(import_pattern, code, re.MULTILINE)
            dependencies.extend(matches)
        
        elif language in ["javascript", "typescript"]:
            import_pattern = r"(?:import|require)\(?['\"]([^'\"]+)['\"]\)?"
            matches = re.findall(import_pattern, code)
            dependencies.extend(matches)
        
        return list(set(dependencies))

