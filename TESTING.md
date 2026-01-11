# Testing Guide for Argus

This document provides a comprehensive guide for running and writing tests for the Argus project.

## Backend Testing

### Setup

1. Install test dependencies:
```bash
cd backend
pip3 install -r requirements.txt
```

2. Run tests:
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run specific test markers
pytest -m unit          # Unit tests only
pytest -m integration   # Integration tests only
pytest -m e2e          # E2E tests only
```

### Test Structure

- `tests/test_auth.py` - Authentication endpoint tests
- `tests/test_reviews.py` - Review endpoint tests
- `tests/test_services.py` - Service layer tests
- `tests/integration/` - Integration tests
- `tests/e2e/` - End-to-end tests

### Test Fixtures

- `db` - Fresh database session for each test
- `client` - FastAPI test client
- `test_user` - Pre-created test user
- `auth_headers` - Authentication headers

### Writing Backend Tests

Example:
```python
@pytest.mark.unit
def test_create_review(client, db, test_user):
    with patch('app.api.v1.reviews.get_current_user') as mock_user:
        mock_user.return_value = test_user
        response = client.post("/api/v1/reviews/", json={...})
        assert response.status_code == 201
```

## Frontend Testing

### Setup

1. Install test dependencies:
```bash
cd frontend
npm install
```

2. Run tests:
```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Test Structure

- `__tests__/` - Test files
- `__tests__/components/` - Component tests

### Writing Frontend Tests

Example:
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

test('renders button', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

## Running All Tests

### Backend
```bash
cd backend
./run_tests.sh
```

### Frontend
```bash
cd frontend
npm test
```

## Test Coverage Goals

- **Backend:** Aim for 80%+ coverage
- **Frontend:** Aim for 70%+ coverage
- **Critical paths:** 100% coverage (auth, payments, review creation)

## Continuous Integration

Tests should be run:
- Before every commit
- In CI/CD pipeline
- Before deployment

## Mocking Strategy

### Backend
- Mock external APIs (GitHub, OpenAI, Supabase)
- Use in-memory SQLite for database tests
- Mock authentication for endpoint tests

### Frontend
- Mock API calls
- Mock Supabase client
- Use test utilities for common scenarios

## Best Practices

1. **Test isolation:** Each test should be independent
2. **Clear naming:** Test names should describe what they test
3. **Arrange-Act-Assert:** Structure tests clearly
4. **Mock external dependencies:** Don't rely on external services
5. **Test edge cases:** Include error scenarios
6. **Keep tests fast:** Unit tests should run quickly
7. **Maintain test data:** Use fixtures for consistency

## Troubleshooting

### Backend Tests Failing

1. Check database connection
2. Verify environment variables
3. Ensure all dependencies are installed
4. Check for import errors

### Frontend Tests Failing

1. Verify Jest configuration
2. Check for missing dependencies
3. Ensure TypeScript types are correct
4. Check for module resolution issues

## Next Steps

- [ ] Add more integration tests
- [ ] Add E2E tests with Playwright/Cypress
- [ ] Set up CI/CD with automated testing
- [ ] Add performance tests
- [ ] Add load tests

