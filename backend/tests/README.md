# Testing Guide

This directory contains tests for the Argus backend API.

## Test Structure

- `test_auth.py` - Authentication endpoint tests
- `test_reviews.py` - Review endpoint tests
- `test_services.py` - Service layer tests
- `integration/` - Integration tests
- `e2e/` - End-to-end tests

## Running Tests

### Run all tests
```bash
cd backend
pytest
```

### Run specific test file
```bash
pytest tests/test_auth.py
```

### Run with coverage
```bash
pytest --cov=app --cov-report=html
```

### Run specific test markers
```bash
pytest -m unit          # Unit tests only
pytest -m integration   # Integration tests only
pytest -m e2e           # E2E tests only
```

### Run in watch mode
```bash
pytest-watch
```

## Test Fixtures

- `db` - Database session (fresh for each test)
- `client` - FastAPI test client
- `test_user` - Pre-created test user
- `auth_headers` - Authentication headers

## Writing Tests

### Example Unit Test
```python
@pytest.mark.unit
def test_example(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
```

### Example Integration Test
```python
@pytest.mark.integration
def test_review_flow(client, db, test_user):
    # Test complete flow
    pass
```

## Mocking

Tests use mocks for:
- Supabase authentication
- GitHub API calls
- OpenAI API calls
- External services

This allows tests to run without external dependencies.

