/** UI labels and text constants. */

export const APP_NAME = 'Argus';
export const APP_TAGLINE = 'The All-Seeing Code Reviewer';
export const APP_DESCRIPTION = 'AI-powered code review service that analyzes your GitHub repositories for security vulnerabilities, code quality issues, and technical debt.';

// Navigation
export const NAV = {
  SIGN_IN: 'Sign In',
  GET_STARTED: 'Get Started',
  LOGOUT: 'Logout',
  BACK_TO_DASHBOARD: '← Back to Dashboard',
} as const;

// Landing Page
export const LANDING = {
  TITLE: APP_NAME,
  SUBTITLE: APP_TAGLINE,
  DESCRIPTION: APP_DESCRIPTION,
  CTA_PRIMARY: 'Get Started Free',
  CTA_SECONDARY: 'View Dashboard',
  FEATURE_SECURITY_TITLE: '🔍 Security Analysis',
  FEATURE_SECURITY_DESC: 'Detect security vulnerabilities, SQL injection risks, and authentication issues before they reach production.',
  FEATURE_QUALITY_TITLE: '📊 Quality Metrics',
  FEATURE_QUALITY_DESC: 'Get comprehensive code quality scores and actionable recommendations to improve your codebase.',
  FEATURE_FAST_TITLE: '⚡ Fast & Accurate',
  FEATURE_FAST_DESC: 'Reviews completed in minutes, not hours. Powered by GPT-4 for the most accurate analysis.',
} as const;

// Authentication
export const AUTH = {
  LOGIN: {
    TITLE: 'Sign in to Argus',
    SUBTITLE: APP_TAGLINE,
    EMAIL_LABEL: 'Email address',
    PASSWORD_LABEL: 'Password',
    SUBMIT_BUTTON: 'Sign in',
    SUBMIT_LOADING: 'Signing in...',
    NO_ACCOUNT: "Don't have an account?",
    SIGN_UP_LINK: 'Sign up',
    ERROR_INVALID: 'Invalid email or password',
  },
  REGISTER: {
    TITLE: 'Create your account',
    SUBTITLE: 'Start reviewing code with AI',
    EMAIL_LABEL: 'Email address',
    PASSWORD_LABEL: 'Password',
    CONFIRM_PASSWORD_LABEL: 'Confirm Password',
    PASSWORD_HINT: 'Must be at least 8 characters',
    SUBMIT_BUTTON: 'Sign up',
    SUBMIT_LOADING: 'Creating account...',
    HAS_ACCOUNT: 'Already have an account?',
    SIGN_IN_LINK: 'Sign in',
    ERROR_PASSWORD_MISMATCH: 'Passwords do not match',
    ERROR_PASSWORD_LENGTH: 'Password must be at least 8 characters',
    ERROR_EMAIL_EXISTS: 'Email already registered',
  },
} as const;

// Dashboard
export const DASHBOARD = {
  TITLE: 'Code Reviews',
  NEW_REVIEW_BUTTON: 'New Review',
  NO_REVIEWS_MESSAGE: 'No reviews yet',
  CREATE_FIRST_REVIEW: 'Create your first review',
  LOADING: 'Loading...',
} as const;


// Review
export const REVIEW = {
  NEW: {
    TITLE: 'Create New Review',
    REPOSITORY_URL_LABEL: 'GitHub Repository URL',
    REPOSITORY_URL_PLACEHOLDER: 'https://github.com/username/repository',
    REPOSITORY_URL_HINT: 'Enter the full URL of the GitHub repository you want to review',
    SUBMIT_BUTTON: 'Start Review',
    SUBMIT_LOADING: 'Creating Review...',
    CANCEL_BUTTON: 'Cancel',
    ERROR_CREATE_FAILED: 'Failed to create review',
  },
  DETAIL: {
    LOADING: 'Loading review...',
    NOT_FOUND: 'Review not found',
    PROCESSING: {
      TITLE: 'Review is being processed...',
      MESSAGE: 'Review is being processed...',
    },
    NO_RESULTS: 'Review results are not available yet.',
    SCORES: {
      TITLE: 'Scores',
      SECURITY: 'Security',
      QUALITY: 'Quality',
      TECH_DEBT: 'Tech Debt',
    },
    SUMMARY_TITLE: 'Summary',
    FINDINGS_TITLE: 'Findings',
    SUGGESTED_FIX: 'Suggested Fix:',
  },
  STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
  },
} as const;

// Common
export const COMMON = {
  LOADING: 'Loading...',
  ERROR: 'Error',
  SUCCESS: 'Success',
  CANCEL: 'Cancel',
  SUBMIT: 'Submit',
  SAVE: 'Save',
  DELETE: 'Delete',
  EDIT: 'Edit',
  BACK: 'Back',
} as const;

// Status Colors (Tailwind classes)
export const STATUS_COLORS = {
  COMPLETED: 'bg-green-100 text-green-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  FAILED: 'bg-red-100 text-red-800',
  PENDING: 'bg-gray-100 text-gray-800',
} as const;

// Severity Colors
export const SEVERITY_COLORS = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-300',
  HIGH: 'bg-orange-600 text-white border-orange-700', // Dark orange for maximum visibility
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  LOW: 'bg-blue-100 text-blue-800 border-blue-300',
  INFO: 'bg-gray-100 text-gray-800 border-gray-300',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An error occurred',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'Resource not found',
  VALIDATION: 'Please check your input and try again.',
} as const;

