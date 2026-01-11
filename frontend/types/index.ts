/** TypeScript type definitions. */

export interface User {
  id: string;
  email: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface Review {
  id: string;
  user_id: string;
  repository_url: string | null;
  repository_name: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  review_type: 'github_repo' | 'file_upload';
  created_at: string;
  completed_at: string | null;
}

export interface Finding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'security' | 'performance' | 'maintainability' | 'best_practices' | 'bug';
  file_path: string | null;
  line_number: number | null;
  issue_description: string;
  suggested_fix: string | null;
  code_snippet: string | null;
}

export interface ReviewResult {
  id: string;
  review_id: string;
  security_score: number;
  quality_score: number;
  tech_debt_score: number;
  summary: string | null;
  findings: Finding[] | null;
  recommendations: any[] | null;
  created_at: string;
  finding_objects?: Finding[];
}

export interface ReviewDetail {
  review: Review;
  result: ReviewResult | null;
}

