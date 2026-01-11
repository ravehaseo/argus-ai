#!/bin/bash
# Test runner script for Argus backend

echo "Running Argus Backend Tests..."
echo "================================"

# Check if pytest is installed
if ! python3 -m pytest --version > /dev/null 2>&1; then
    echo "Installing test dependencies..."
    pip3 install -r requirements.txt
fi

# Run tests
echo ""
echo "Running unit tests..."
python3 -m pytest tests/test_auth.py tests/test_reviews.py tests/test_services.py -v

echo ""
echo "Running integration tests..."
python3 -m pytest tests/integration/ -v

echo ""
echo "Running E2E tests..."
python3 -m pytest tests/e2e/ -v

echo ""
echo "Running all tests with coverage..."
python3 -m pytest --cov=app --cov-report=term-missing --cov-report=html

echo ""
echo "Test coverage report generated in htmlcov/index.html"

