"""AI service for code analysis using OpenAI."""

import json
import logging
from typing import Dict, List, Optional
from openai import AsyncOpenAI
from app.core.config import settings
from app.core.exceptions import AIServiceError
from app.core.constants import SubscriptionTier

logger = logging.getLogger("argus")


class AIService:
    """Service for AI-powered code analysis."""

    def __init__(self, subscription_tier: str = "free"):
        """Initialize AI service with OpenAI or Groq client.
        
        Args:
            subscription_tier: User's subscription tier (free, pro, enterprise)
        """
        self.subscription_tier = SubscriptionTier(subscription_tier.lower())
        self.use_groq = settings.USE_GROQ
        
        if self.use_groq:
            if not settings.GROQ_API_KEY:
                raise ValueError("GROQ_API_KEY is not set when USE_GROQ=True")
            # Groq uses OpenAI-compatible API
            self.client = AsyncOpenAI(
                api_key=settings.GROQ_API_KEY,
                base_url="https://api.groq.com/openai/v1"
            )
            self.model = settings.GROQ_MODEL
        else:
            if not settings.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY is not set. Set USE_GROQ=True to use Groq free tier instead.")
            self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            # Select model based on subscription tier
            self.model = self._get_model_for_tier()
        
        logger.info(f"Initialized AIService with model: {self.model} for tier: {self.subscription_tier.value}")
    
    def _get_model_for_tier(self) -> str:
        """Get appropriate OpenAI model based on subscription tier.
        
        Returns:
            Model name string
        """
        # Free tier: Use Groq if enabled, otherwise GPT-4o-mini (fallback)
        if self.subscription_tier == SubscriptionTier.FREE:
            if self.use_groq:
                return settings.GROQ_MODEL
            # Fallback to GPT-4o-mini for free tier if not using Groq
            return "gpt-4o-mini"
        
        # Pro tier: Use GPT-5-mini (cost-effective GPT-5)
        elif self.subscription_tier == SubscriptionTier.PRO:
            return "gpt-5-mini"
        
        # Enterprise tier: Use GPT-5.1 (best quality)
        elif self.subscription_tier == SubscriptionTier.ENTERPRISE:
            return "gpt-5.1"
        
        # Default fallback
        return settings.OPENAI_MODEL

    async def analyze_code(
        self,
        code: str,
        file_path: str,
        language: str,
        context: Optional[Dict] = None
    ) -> Dict:
        """Analyze code for security, quality, and best practices."""
        
        prompt = self._build_analysis_prompt(code, file_path, language, context)
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert code reviewer. Analyze code for security vulnerabilities, code quality issues, performance problems, and best practices. Return structured JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            logger.debug(f"Code analysis completed for {file_path}")
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response: {e}")
            raise AIServiceError(f"Invalid response from AI service: {str(e)}")
        except Exception as e:
            logger.error(f"AI service error: {e}", exc_info=True)
            raise AIServiceError(f"Failed to analyze code: {str(e)}")

    async def review_repository(
        self,
        repository_structure: Dict,
        key_files: List[Dict],
        language: str
    ) -> Dict:
        """Review entire repository structure and key files."""
        
        prompt = self._build_repository_review_prompt(
            repository_structure, 
            key_files, 
            language
        )
        
        try:
            logger.info(f"Reviewing repository with {len(key_files)} key files")
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert code reviewer. Analyze repositories for security vulnerabilities, code quality, tech debt, and best practices. Provide structured JSON with scores and findings."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            findings_count = len(result.get("findings", []))
            logger.info(f"Repository review completed successfully. Found {findings_count} findings.")
            if findings_count > 0:
                sample_finding = result.get("findings", [])[0]
                logger.debug(f"Sample finding structure: severity={sample_finding.get('severity')}, category={sample_finding.get('category')}, has_file_path={bool(sample_finding.get('file_path'))}")
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response: {e}")
            raise AIServiceError(f"Invalid response from AI service: {str(e)}")
        except Exception as e:
            logger.error(f"AI service error during repository review: {e}", exc_info=True)
            raise AIServiceError(f"Failed to review repository: {str(e)}")

    def _build_analysis_prompt(
        self,
        code: str,
        file_path: str,
        language: str,
        context: Optional[Dict]
    ) -> str:
        """Build prompt for code analysis."""
        
        prompt = f"""Analyze the following {language} code from {file_path}:

```{language}
{code}
```

Provide a JSON response with:
1. security_score: 0-100 (security vulnerabilities)
2. quality_score: 0-100 (code quality and maintainability)
3. tech_debt_score: 0-100 (technical debt)
4. findings: array of issues with:
   - severity: "critical", "high", "medium", "low", "info"
   - category: "security", "performance", "maintainability", "best_practices", "bug"
   - description: detailed issue description
   - file_path: path to the file where the issue was found (e.g., "src/main.py")
   - line_number: line number where the issue occurs (if applicable, as integer)
   - suggested_fix: how to fix the issue
   - code_snippet: the problematic code snippet (if applicable)

Focus on:
- Security vulnerabilities (SQL injection, XSS, authentication issues, etc.)
- Code quality (DRY violations, complexity, naming, etc.)
- Performance issues (inefficient algorithms, N+1 queries, etc.)
- Best practices (error handling, logging, documentation, etc.)
"""
        
        if context:
            prompt += f"\nAdditional context: {json.dumps(context, indent=2)}"
        
        return prompt

    def _build_repository_review_prompt(
        self,
        repository_structure: Dict,
        key_files: List[Dict],
        language: str
    ) -> str:
        """Build prompt for repository review."""
        
        prompt = f"""Review this {language} repository:

Repository Structure:
{json.dumps(repository_structure, indent=2)}

Key Files Analyzed:
"""
        
        for file_info in key_files[:10]:  # Limit to 10 files for token efficiency
            prompt += f"\n{file_info.get('path', 'unknown')}:\n{file_info.get('content', '')[:500]}...\n"
        
        prompt += """
Provide a JSON response with:
1. security_score: 0-100
2. quality_score: 0-100
3. tech_debt_score: 0-100
4. summary: overall assessment
5. findings: array of issues with:
   - severity: "critical", "high", "medium", "low", "info"
   - category: "security", "performance", "maintainability", "best_practices", "bug"
   - description: detailed issue description
   - file_path: path to the file where the issue was found (e.g., "src/main.py")
   - line_number: line number where the issue occurs (if applicable)
   - suggested_fix: how to fix the issue
   - code_snippet: the problematic code snippet (if applicable)
6. recommendations: array of improvement suggestions

Analyze the repository holistically for architecture, security patterns, code organization, and best practices.
For each finding, include the file path and line number where the issue was found.
"""
        
        return prompt

