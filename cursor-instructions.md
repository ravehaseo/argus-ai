# Argus - Project Instructions

## Project Overview
**Project Name:** Argus (AI Code Review Assistant)
**Type:** Micro SaaS Application
**Primary Goal:** Generate side income and build portfolio for AI Engineer roles in Korean, Japanese, and Western markets
**Target Users:** Non-technical founders, hiring managers, development teams, solo developers

## Core Value Proposition
- Upload GitHub repository or code files
- Get AI-powered code review with:
  - Security vulnerability detection
  - Code quality assessment
  - Tech debt identification
  - Best practices recommendations
  - Plain-English explanations for non-technical users
  - Actionable fix suggestions

## Tech Stack
- **Frontend:** Next.js 14+ (App Router) with TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Python FastAPI (preferred for AI/ML integration)
- **Database:** PostgreSQL with Supabase (includes auth and storage)
- **AI Services:** 
  - OpenAI GPT-4 Turbo (code analysis and explanations)
  - OpenAI GPT-4 (for complex reviews)
  - Anthropic Claude 3 (fallback/alternative analysis)
- **Authentication:** Supabase Auth (email/password, OAuth for GitHub)
- **Payments:** Stripe (subscription-based)
- **File Storage:** Supabase Storage (for uploaded code files)
- **Version Control Integration:** GitHub API (for repo analysis)
- **Hosting:** 
  - Frontend: Vercel
  - Backend: Railway or Render
  - Database: Supabase (managed PostgreSQL)

## Architecture Principles
1. **API-First Design:** Backend as separate FastAPI service, frontend consumes REST APIs
2. **Type Safety:** TypeScript for frontend, Pydantic for backend validation
3. **Security First:** Never store sensitive code long-term, process and delete
4. **Scalability:** Queue system for long-running reviews, async processing
5. **Cost Optimization:** Cache common patterns, use appropriate AI models
6. **User Experience:** Real-time progress updates, streaming responses when possible

## Coding Standards

### Industry Standard Practices

#### Code Quality
- **Clean Code Principles:** Follow SOLID principles, especially Single Responsibility and Dependency Inversion
- **DRY (Don't Repeat Yourself):** Extract common logic into reusable functions/utilities
- **KISS (Keep It Simple, Stupid):** Prefer simple, readable solutions over clever ones
- **YAGNI (You Aren't Gonna Need It):** Don't over-engineer; build what's needed now
- **Code Reviews:** Self-review before committing; ensure code is production-ready

#### Naming Conventions
- **Descriptive Names:** Use clear, self-documenting names (avoid abbreviations unless standard)
- **Consistent Patterns:** Follow language/framework conventions
  - Python: `snake_case` for functions/variables, `PascalCase` for classes, `UPPER_CASE` for constants
  - TypeScript: `camelCase` for functions/variables, `PascalCase` for components/classes, `UPPER_CASE` for constants
- **Boolean Variables:** Use `is_`, `has_`, `can_`, `should_` prefixes
- **Functions:** Use verbs (e.g., `getUser`, `validateInput`, `processReview`)
- **Classes:** Use nouns (e.g., `CodeAnalyzer`, `ReviewService`)

#### Code Organization
- **Separation of Concerns:** Business logic separate from API routes, utilities separate from services
- **Dependency Injection:** Use dependency injection for testability and flexibility
- **Layered Architecture:** Clear boundaries between API, service, and data layers
- **Module Structure:** One class/function per file when possible, group related functionality

#### Generic Functions and Constants

**Constants Management:**
- **Centralized Constants:** Create dedicated constants files/modules
  - `backend/app/core/constants.py` for backend constants
  - `frontend/lib/constants.ts` for frontend constants
- **Environment-Based Config:** Use environment variables with sensible defaults
- **Magic Numbers/Strings:** Never use magic numbers or strings; extract to named constants
- **Enum Usage:** Use enums for fixed sets of values (status types, severity levels, etc.)

**Reusable Functions:**
- **Utility Functions:** Create generic, pure functions in `utils/` directories
- **Service Layer:** Extract business logic into service classes with clear interfaces
- **Helper Functions:** Group related helpers (e.g., `string_utils`, `date_utils`, `validation_utils`)
- **Type Guards:** Use TypeScript type guards and Python type hints for runtime safety
- **Error Handling:** Create custom exception classes and error handling utilities

**Example Patterns:**
```python
# backend/app/core/constants.py
class ReviewStatus:
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
SUPPORTED_LANGUAGES = ["python", "javascript", "typescript", "java"]

# backend/app/utils/validation.py
def validate_repository_url(url: str) -> bool:
    """Generic URL validation for repositories."""
    # Reusable validation logic
```

```typescript
// frontend/lib/constants.ts
export const REVIEW_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// frontend/lib/utils/validation.ts
export function isValidRepositoryUrl(url: string): boolean {
  // Reusable validation logic
}
```

### Security-First Coding

#### Input Validation
- **Validate Early:** Validate all inputs at API boundaries
- **Sanitize Inputs:** Sanitize user inputs before processing
- **Type Validation:** Use Pydantic schemas (backend) and Zod (frontend) for validation
- **File Validation:** Validate file types, sizes, and content before processing
- **URL Validation:** Validate and sanitize repository URLs and external links

#### Authentication & Authorization
- **Never Trust Client:** Always validate authentication/authorization server-side
- **Principle of Least Privilege:** Grant minimum required permissions
- **Token Security:** Use secure, httpOnly cookies or secure token storage
- **Session Management:** Implement proper session timeout and refresh logic
- **OAuth Security:** Validate OAuth tokens, check scopes, handle token refresh

#### Data Protection
- **Sensitive Data:** Never log, store, or expose sensitive data (API keys, tokens, code)
- **SQL Injection:** Always use parameterized queries (ORM handles this)
- **XSS Prevention:** Sanitize outputs, use React's built-in XSS protection
- **CSRF Protection:** Implement CSRF tokens for state-changing operations
- **Rate Limiting:** Implement rate limiting on all public endpoints

#### Code Security Patterns
```python
# ✅ GOOD: Parameterized queries, input validation
def get_review(review_id: UUID, user_id: UUID) -> Review:
    # Validate user owns review
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.user_id == user_id
    ).first()
    if not review:
        raise NotFoundError("Review not found")
    return review

# ❌ BAD: String concatenation, no validation
def get_review(review_id: str):
    query = f"SELECT * FROM reviews WHERE id = '{review_id}'"
    # SQL injection risk, no authorization check
```

```typescript
// ✅ GOOD: Input validation, type safety
async function createReview(data: CreateReviewSchema): Promise<Review> {
  const validated = createReviewSchema.parse(data); // Zod validation
  // Process validated data
}

// ❌ BAD: No validation, any type
async function createReview(data: any): Promise<any> {
  // Direct use without validation
}
```

### Senior Software Engineer Patterns

#### Design Patterns
- **Repository Pattern:** Abstract data access layer
- **Service Layer Pattern:** Business logic in service classes
- **Factory Pattern:** For creating complex objects (e.g., AI service instances)
- **Strategy Pattern:** For interchangeable algorithms (e.g., different AI models)
- **Observer Pattern:** For event-driven architecture (e.g., review completion notifications)

#### Error Handling
- **Custom Exceptions:** Create domain-specific exception classes
- **Error Context:** Include context in error messages (without exposing sensitive data)
- **Graceful Degradation:** Handle errors gracefully, provide fallbacks
- **Error Logging:** Log errors with context for debugging
- **User-Friendly Messages:** Translate technical errors to user-friendly messages

```python
# backend/app/core/exceptions.py
class ReviewError(Exception):
    """Base exception for review operations."""
    pass

class ReviewNotFoundError(ReviewError):
    """Raised when review is not found."""
    pass

class ReviewProcessingError(ReviewError):
    """Raised when review processing fails."""
    def __init__(self, message: str, review_id: UUID):
        self.review_id = review_id
        super().__init__(message)

# Usage in service
try:
    result = process_review(review_id)
except AIAPIError as e:
    logger.error(f"AI service error: {e}", extra={"review_id": review_id})
    raise ReviewProcessingError("Failed to analyze code", review_id)
```

#### Async/Await Patterns
- **Proper Async:** Use async/await correctly, avoid blocking operations
- **Error Handling:** Properly handle errors in async operations
- **Concurrency:** Use appropriate concurrency patterns (asyncio.gather, queues)
- **Resource Management:** Properly manage resources in async context

#### Testing Patterns
- **Test Structure:** Arrange-Act-Assert pattern
- **Test Isolation:** Each test should be independent
- **Mocking:** Mock external dependencies (APIs, databases)
- **Fixtures:** Use fixtures for common test data
- **Edge Cases:** Test edge cases, error conditions, boundary values

### Avoiding AI-Generated Code Patterns

#### Natural Code Flow
- **Avoid Over-Commenting:** Don't comment obvious code; comments should explain "why" not "what"
- **Natural Logic:** Write code that reads naturally, like a human wrote it
- **Varied Patterns:** Use different patterns and approaches (not formulaic)
- **Contextual Decisions:** Make decisions based on context, not templates

#### Code Style
- **Consistent Style:** Follow project style guide, but allow some variation
- **Personal Touch:** Include reasonable variations that show human judgment
- **Pragmatic Solutions:** Sometimes choose simpler solutions over "perfect" ones
- **Real-World Patterns:** Use patterns you'd see in production codebases

#### What to Avoid
- ❌ **Overly Verbose Comments:** Don't comment every line
- ❌ **Perfectly Structured:** Real code has some inconsistencies
- ❌ **Template-Like Code:** Avoid identical patterns everywhere
- ❌ **Over-Engineering:** Don't add unnecessary abstractions
- ❌ **AI-Style Explanations:** Avoid explanatory comments that sound like AI

#### Examples

```python
# ❌ AI-GENERATED STYLE: Over-commented, formulaic
def process_review(review_id: UUID) -> ReviewResult:
    """
    This function processes a review by taking a review_id as input.
    It first validates the review_id, then fetches the review from the database.
    After that, it processes the review and returns the result.
    """
    # Validate the review_id
    if not review_id:
        raise ValueError("Review ID is required")
    
    # Fetch the review from database
    review = db.query(Review).filter(Review.id == review_id).first()
    
    # Check if review exists
    if not review:
        raise NotFoundError("Review not found")
    
    # Process the review
    result = analyze_code(review)
    
    # Return the result
    return result

# ✅ SENIOR ENGINEER STYLE: Natural, contextual, minimal comments
def process_review(review_id: UUID) -> ReviewResult:
    review = get_review_by_id(review_id)
    if review.status != ReviewStatus.PENDING:
        raise InvalidStateError(f"Review {review_id} is not pending")
    
    return analyze_code(review)
```

```typescript
// ❌ AI-GENERATED STYLE: Overly structured, template-like
const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
  /**
   * This function handles the form submission event.
   * It prevents the default form submission behavior,
   * validates the form data, and then submits it to the API.
   */
  event.preventDefault();
  
  // Validate the form data
  const formData = new FormData(event.currentTarget);
  const data = Object.fromEntries(formData);
  
  // Validate the data
  if (!data.repositoryUrl) {
    setError("Repository URL is required");
    return;
  }
  
  // Submit to API
  try {
    await submitReview(data);
  } catch (error) {
    setError("Failed to submit review");
  }
};

// ✅ SENIOR ENGINEER STYLE: Natural flow, appropriate abstraction
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  const formData = new FormData(e.currentTarget);
  const url = formData.get("repositoryUrl") as string;
  
  if (!isValidRepositoryUrl(url)) {
    setError("Invalid repository URL");
    return;
  }
  
  try {
    await createReview({ repositoryUrl: url });
    router.push("/dashboard");
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to create review");
  }
};
```

### Code Review Checklist

Before committing code, ensure:
- [ ] No security vulnerabilities (SQL injection, XSS, etc.)
- [ ] Input validation on all user inputs
- [ ] Error handling for all error cases
- [ ] No hardcoded secrets or sensitive data
- [ ] Constants extracted (no magic numbers/strings)
- [ ] Reusable functions created (DRY principle)
- [ ] Type safety (TypeScript types, Python type hints)
- [ ] Tests written for critical logic
- [ ] Code reads naturally (not AI-generated style)
- [ ] Follows project conventions and patterns
- [ ] Performance considerations addressed
- [ ] Documentation updated if needed

## Project Structure
```
argus/
├── frontend/                    # Next.js application
│   ├── app/                    # App router pages
│   │   ├── (auth)/            # Auth pages (login, signup)
│   │   ├── dashboard/          # User dashboard
│   │   ├── review/             # Review pages
│   │   └── api/                # API routes (proxy to backend)
│   ├── components/             # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── review/            # Review-specific components
│   │   └── dashboard/          # Dashboard components
│   ├── lib/                    # Utilities
│   │   ├── api.ts             # API client
│   │   ├── supabase.ts        # Supabase client
│   │   └── utils.ts           # Helper functions
│   ├── types/                  # TypeScript types
│   └── styles/                 # Global styles
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── v1/
│   │   │   │   ├── reviews.py # Review endpoints
│   │   │   │   ├── auth.py    # Auth endpoints
│   │   │   │   └── webhooks.py # Stripe webhooks
│   │   ├── services/          # Business logic
│   │   │   ├── code_analyzer.py    # Code analysis service
│   │   │   ├── ai_service.py       # AI integration
│   │   │   ├── github_service.py   # GitHub API integration
│   │   │   └── review_generator.py # Review report generation
│   │   ├── models/            # Database models (SQLAlchemy)
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── core/              # Core config, security
│   │   └── utils/             # Helper functions
│   ├── alembic/               # Database migrations
│   └── tests/                 # Backend tests
├── database/
│   └── migrations/            # SQL migrations
├── docker-compose.yml         # Local development
├── .env.example               # Environment variables template
└── README.md                   # Project documentation
```

## Database Schema (Key Tables)
```sql
-- Users (handled by Supabase Auth, extend with profiles table)
users (
  id UUID PRIMARY KEY,
  email VARCHAR,
  subscription_tier VARCHAR, -- free, pro, enterprise
  stripe_customer_id VARCHAR,
  created_at TIMESTAMP
)

-- Reviews
reviews (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  repository_url VARCHAR,
  repository_name VARCHAR,
  status VARCHAR, -- pending, processing, completed, failed
  review_type VARCHAR, -- github_repo, file_upload
  created_at TIMESTAMP,
  completed_at TIMESTAMP
)

-- Review Results
review_results (
  id UUID PRIMARY KEY,
  review_id UUID REFERENCES reviews(id),
  security_score INTEGER, -- 0-100
  quality_score INTEGER,  -- 0-100
  tech_debt_score INTEGER, -- 0-100
  summary TEXT,
  findings JSONB, -- Structured findings
  recommendations JSONB,
  raw_analysis TEXT, -- Full AI response
  created_at TIMESTAMP
)

-- Findings (detailed issues)
findings (
  id UUID PRIMARY KEY,
  review_result_id UUID REFERENCES review_results(id),
  severity VARCHAR, -- critical, high, medium, low, info
  category VARCHAR, -- security, performance, maintainability, best_practices
  file_path VARCHAR,
  line_number INTEGER,
  issue_description TEXT,
  suggested_fix TEXT,
  code_snippet TEXT
)
```

## Feature Priorities

### MVP (Phase 1 - Weeks 1-2)
- [ ] User authentication (email/password, GitHub OAuth)
- [ ] GitHub repository connection and analysis
- [ ] Basic code review generation using GPT-4
- [ ] Review results display (security, quality, tech debt scores)
- [ ] Simple dashboard showing review history
- [ ] Free tier: 1 review/month, Pro tier: 10 reviews/month

### Phase 2 (Weeks 3-4)
- [ ] File upload option (ZIP files, individual files)
- [ ] Detailed findings with code snippets
- [ ] Suggested fixes for each issue
- [ ] Export review as PDF/JSON
- [ ] Email notifications when review completes
- [ ] Stripe payment integration
- [ ] Subscription management

### Phase 3 (Weeks 5-6)
- [ ] Real-time review progress (WebSocket or polling)
- [ ] Comparison between reviews (track improvements)
- [ ] Custom review templates/focus areas
- [ ] API access for Pro+ users
- [ ] Team/organization support
- [ ] Integration with CI/CD (GitHub Actions, etc.)

### Phase 4 (Future)
- [ ] Multi-language support (beyond common languages)
- [ ] Custom rules/standards configuration
- [ ] Automated PR comments (GitHub integration)
- [ ] Historical trend analysis
- [ ] White-label options for enterprise

## AI Integration Guidelines

### Code Analysis Strategy
1. **Repository Analysis:**
   - Fetch repository structure via GitHub API
   - Identify main languages and frameworks
   - Analyze key files (entry points, config files, critical modules)
   - Use tree-sitter or similar for code parsing

2. **AI Prompt Engineering:**
   - Use structured prompts with code context
   - Include file structure, dependencies, and framework info
   - Request structured JSON responses for parsing
   - Implement prompt versioning for improvements

3. **Model Selection:**
   - GPT-4 Turbo for general reviews (cost-effective)
   - GPT-4 for complex codebases (higher accuracy)
   - Claude 3 as fallback or for alternative perspective
   - Cache common patterns to reduce API calls

4. **Response Processing:**
   - Parse AI responses into structured findings
   - Validate and sanitize all outputs
   - Extract scores, issues, and recommendations
   - Generate human-readable summaries

### Cost Optimization
- **Token Management:** Limit context size, use smart truncation
- **Caching:** Cache analysis of common patterns/libraries
- **Batching:** Process multiple files in single API call when possible
- **Model Selection:** Use GPT-4 Turbo for most cases, GPT-4 only when needed
- **Rate Limiting:** Implement user-level rate limits based on subscription tier

### Error Handling
- Graceful degradation if AI service fails
- Retry logic with exponential backoff
- User-friendly error messages
- Logging for debugging (without exposing sensitive code)

## Security Requirements

### Code Privacy
- **Never store code long-term:** Process and delete after review
- **Encrypted storage:** If temporary storage needed, encrypt at rest
- **Access control:** Users can only access their own reviews
- **GitHub tokens:** Store securely, never log or expose
- **Data retention:** Auto-delete reviews older than 90 days (configurable)

### Authentication & Authorization
- Secure JWT tokens via Supabase
- GitHub OAuth with minimal scopes (read-only repo access)
- Role-based access control for subscription tiers
- API rate limiting per user

### Input Validation
- Validate repository URLs and access
- Sanitize all user inputs
- File size limits (prevent abuse)
- File type validation (code files only)

### API Security
- CORS configuration
- Rate limiting (prevent abuse)
- Request validation with Pydantic
- SQL injection prevention (use ORM)

## UI/UX Guidelines

### Design System
- **Framework:** Tailwind CSS with shadcn/ui components
- **Theme:** Modern, professional, developer-friendly
- **Colors:** Dark mode support (developers prefer dark)
- **Typography:** Clear hierarchy, readable code snippets
- **Spacing:** Consistent 4px grid system

### Key Pages

1. **Landing Page:**
   - Clear value proposition
   - Demo/screenshot of review results
   - Pricing tiers
   - CTA for sign up

2. **Dashboard:**
   - Review history (cards/list view)
   - Quick stats (total reviews, average scores)
   - New review CTA
   - Subscription status

3. **Review Creation:**
   - GitHub repo URL input
   - File upload option
   - Review options (focus areas)
   - Progress indicator

4. **Review Results:**
   - Executive summary (scores, overview)
   - Findings grouped by severity/category
   - Expandable code snippets
   - Suggested fixes
   - Export options

### User Experience
- **Loading States:** Skeleton screens, progress bars
- **Error States:** Clear messages with actionable steps
- **Success States:** Confirmation messages, visual feedback
- **Responsive:** Mobile-friendly (though desktop-focused)
- **Accessibility:** WCAG 2.1 AA compliance

## Performance Targets
- **Page Load:** < 2 seconds initial load
- **API Response:** < 500ms for non-AI endpoints
- **Review Processing:** 
  - Small repos (< 10 files): < 30 seconds
  - Medium repos (10-100 files): < 2 minutes
  - Large repos (100+ files): < 5 minutes (with progress updates)
- **Database Queries:** < 100ms, use indexes
- **File Uploads:** Support up to 50MB, show progress

## Monetization Strategy

### Pricing Tiers
- **Free:**
  - 1 review per month
  - Basic security and quality scores
  - Limited findings (top 10 issues)
  - No export options

- **Pro ($29/month):**
  - 10 reviews per month
  - Full detailed analysis
  - All findings with suggested fixes
  - PDF/JSON export
  - Email support
  - Review history (30 days)

- **Enterprise ($99/month):**
  - Unlimited reviews
  - Team collaboration
  - API access
  - Custom review templates
  - Priority support
  - Extended history (1 year)
  - White-label options

### Stripe Integration
- Subscription management
- Webhook handling for payment events
- Usage-based limits enforcement
- Invoice generation

## Development Workflow

### Local Setup
1. Clone repository
2. Set up environment variables (.env)
3. Run `docker-compose up` for local services
4. Run database migrations
5. Start backend: `uvicorn app.main:app --reload`
6. Start frontend: `npm run dev`

### Environment Variables
```bash
# Backend
DATABASE_URL=postgresql://...
SUPABASE_URL=...
SUPABASE_KEY=...
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
```

### Git Workflow
- Main branch: production-ready code
- Feature branches: `feature/description`
- Commit messages: Conventional commits format
- PR required before merge to main

## Testing Strategy
- **Unit Tests:** Critical business logic (AI service, code analyzer)
- **Integration Tests:** API endpoints, database operations
- **E2E Tests:** Key user flows (sign up, create review, view results)
- **Target Coverage:** 70%+ for backend, 50%+ for frontend

## Documentation Requirements
- **README.md:** Setup, architecture, deployment
- **API Documentation:** OpenAPI/Swagger (auto-generated from FastAPI)
- **Component Docs:** JSDoc for complex React components
- **Deployment Guide:** Step-by-step production deployment
- **User Guide:** How to use the application (for end users)

## Success Metrics

### Technical Metrics
- Uptime: > 99.5%
- API response time: < 500ms (p95)
- Review processing: < 2 minutes (p95)
- Error rate: < 1%

### Business Metrics
- Target: $2.5K MRR by month 3
- User acquisition: 100+ users by month 2
- Conversion rate: 5%+ free to paid
- Churn rate: < 5% monthly

### User Metrics
- User retention: > 60% (month 2)
- NPS: > 50
- Average reviews per user: 3+ (Pro tier)

## Market-Specific Considerations

### Korean Market
- Emphasize technical depth in portfolio
- Show performance metrics and scalability
- Highlight enterprise-ready features
- Consider Korean language support (future)

### Japanese Market
- Focus on quality and accuracy metrics
- Emphasize reliability and thoroughness
- Show business impact and ROI
- Consider Japanese language support (future)

### Western Market
- Highlight innovation and user experience
- Show growth metrics and traction
- Emphasize developer experience
- Focus on product-market fit

## AI Assistant Guidelines

When helping with this project:
- **Security First:** Always flag security concerns, especially around code handling. Never suggest code with security vulnerabilities.
- **Industry Standards:** Write code that follows industry best practices and senior engineer patterns. Code should look like it was written by an experienced developer, not AI-generated.
- **Generic Functions:** Always extract reusable logic into generic functions and constants. Avoid code duplication.
- **Code Quality:** Maintain high standards - this is a code review tool after all. Follow SOLID principles, DRY, KISS, and YAGNI.
- **Natural Code Style:** Write code that reads naturally. Avoid over-commenting, template-like patterns, or overly verbose explanations. Let the code speak for itself.
- **Cost Awareness:** Suggest optimizations to reduce AI API costs
- **User Experience:** Prioritize clear, actionable feedback for users
- **Performance:** Optimize for speed, especially review processing
- **Documentation:** Help maintain excellent documentation (but don't over-document obvious code)
- **Testing:** Encourage tests, especially for AI integration logic
- **Error Handling:** Robust error handling is critical for user trust
- **Code Review:** Before suggesting code, ensure it passes the Code Review Checklist in Coding Standards

## Implementation Log

*Updated as features are built. Use this to stay in sync with the current codebase.*

### UI & Layout
- **AppShell** (`frontend/components/layout/AppShell.tsx`): Shared dark-theme wrapper used by dashboard, auth (login/register), review (new, detail), pricing, error, not-found, loading pages
- **Theme**: Dark gradient (`from-gray-950 via-gray-900 to-gray-950`), indigo/purple accents, consistent across all pages
- **Logo**: SVG at `frontend/public/argus-logo.svg` (transparent, eye + A mark). Favicon via `metadata.icons` in layout
- **Pricing page** (`/pricing`): Free, Pro (coming soon), Enterprise tiers. Linked from dashboard "View plans" and "Upgrade" (navbar, for non-enterprise users). "Back to dashboard" button

### Auth
- **Login**: OAuth (GitHub, Google) + email/password. Supabase Auth with redirect to `/auth/callback?next=/dashboard`
- **Register**: Same OAuth options as login (GitHub, Google) + email/password. OAuth creates account if new user
- **Admin bypass**: Only when `ADMIN_ENABLED=true` and `ENVIRONMENT!=production`. Stored in localStorage

### Security (Backend)
- **Admin bypass**: Disabled in production (`dependencies.py`, `admin.py`, `config.py`). `ADMIN_ENABLED` defaults to `False`
- **Token validation**: Supabase JWT for regular users; admin token only in dev/staging

### Error Handling
- **Route-level**: `app/error.tsx` catches React errors in route segments
- **Global**: `app/global-error.tsx` catches root-level crashes (must render own `<html>` and `<body>`)
- **API client**: Response interceptor handles 401 (redirect to login), logs other errors

### Key Files
- `frontend/lib/ui-constants.ts` – UI text, labels, status colors
- `frontend/lib/error-utils.ts` – `extractErrorMessage()` for API errors
- `frontend/lib/api-client.ts` – Axios client with auth interceptors

## Notes & Constraints
- **Budget:** OpenAI API can be expensive (~$0.01-0.10 per review depending on repo size)
- **Timeline:** MVP in 2-3 weeks, full product in 6-8 weeks
- **Team:** Solo developer, prioritize simplicity and maintainability
- **Legal:** Ensure compliance with GitHub API terms, data privacy laws (GDPR, etc.)
- **Competition:** Similar tools exist but focus on developer experience and non-technical user accessibility

## Quick Start Checklist
- [ ] Set up project structure
- [ ] Configure Supabase (auth, database, storage)
- [ ] Set up FastAPI backend with basic routes
- [ ] Set up Next.js frontend with authentication
- [ ] Integrate GitHub API for repo access
- [ ] Implement basic AI code review (GPT-4)
- [ ] Create review results display
- [ ] Add Stripe payment integration
- [ ] Deploy to production
- [ ] Set up monitoring and error tracking

