/** Application-wide constants. */

export const REVIEW_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const REVIEW_TYPE = {
  GITHUB_REPO: 'github_repo',
  FILE_UPLOAD: 'file_upload',
} as const;

export const FINDING_SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info',
} as const;

export const FINDING_CATEGORY = {
  SECURITY: 'security',
  PERFORMANCE: 'performance',
  MAINTAINABILITY: 'maintainability',
  BEST_PRACTICES: 'best_practices',
  BUG: 'bug',
} as const;

export const SUBSCRIPTION_TIER = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

