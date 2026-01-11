'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { supabase } from '@/lib/supabase';
import type { ReviewDetail, Finding } from '@/types';
import { REVIEW, APP_NAME, NAV, STATUS_COLORS, SEVERITY_COLORS } from '@/lib/ui-constants';
import { extractErrorMessage } from '@/lib/error-utils';

export default function ReviewDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reviewId = params.id as string;
  
  const [reviewDetail, setReviewDetail] = useState<ReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
    loadReview();
    
    const interval = setInterval(() => {
      if (reviewDetail?.review.status === 'processing' || reviewDetail?.review.status === 'pending') {
        loadReview();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [reviewId]);

  const checkAuth = async () => {
    // Check for admin token first
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    if (adminToken) {
      return; // Admin is authenticated
    }
    
    // Regular user - check Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    }
  };

  const loadReview = async () => {
    try {
      const response = await apiClient.get(`/api/v1/reviews/${reviewId}`);
      setReviewDetail(response.data);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to load review'));
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return SEVERITY_COLORS.CRITICAL;
      case 'high':
        return SEVERITY_COLORS.HIGH;
      case 'medium':
        return SEVERITY_COLORS.MEDIUM;
      case 'low':
        return SEVERITY_COLORS.LOW;
      default:
        return SEVERITY_COLORS.INFO;
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-600">{REVIEW.DETAIL.LOADING}</div>
        </div>
    );
  }

  if (error || !reviewDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error || REVIEW.DETAIL.NOT_FOUND}</div>
      </div>
    );
  }

  const { review, result } = reviewDetail;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/dashboard" className="text-xl font-bold text-indigo-600">
                {APP_NAME}
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-indigo-600 hover:text-indigo-500 mb-4"
            >
              {NAV.BACK_TO_DASHBOARD}
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {review.repository_name || 'Code Review'}
            </h1>
            <p className="text-gray-600 mt-2">{review.repository_url}</p>
            <span
              className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded ${
                review.status === 'completed'
                  ? STATUS_COLORS.COMPLETED
                  : review.status === 'processing'
                  ? STATUS_COLORS.PROCESSING
                  : review.status === 'failed'
                  ? STATUS_COLORS.FAILED
                  : STATUS_COLORS.PENDING
              }`}
            >
              {review.status}
            </span>
          </div>

          {review.status === 'processing' || review.status === 'pending' ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">{REVIEW.DETAIL.PROCESSING.MESSAGE}</p>
            </div>
          ) : result ? (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">{REVIEW.DETAIL.SCORES.TITLE}</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">{REVIEW.DETAIL.SCORES.SECURITY}</p>
                    <p className="text-3xl font-bold text-red-600">{result.security_score}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{REVIEW.DETAIL.SCORES.QUALITY}</p>
                    <p className="text-3xl font-bold text-blue-600">{result.quality_score}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{REVIEW.DETAIL.SCORES.TECH_DEBT}</p>
                    <p className="text-3xl font-bold text-yellow-600">{result.tech_debt_score}</p>
                  </div>
                </div>
              </div>

              {result.summary && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">{REVIEW.DETAIL.SUMMARY_TITLE}</h2>
                  <p className="text-gray-700">{result.summary}</p>
                </div>
              )}

              {result.finding_objects && result.finding_objects.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">{REVIEW.DETAIL.FINDINGS_TITLE}</h2>
                  <div className="space-y-4">
                    {result.finding_objects.map((finding: Finding) => (
                      <div
                        key={finding.id}
                        className="border-l-4 border-gray-300 pl-4 py-2"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded ${getSeverityColor(
                              finding.severity
                            )}`}
                          >
                            {finding.severity}
                          </span>
                          <span className="text-xs text-gray-500">{finding.category}</span>
                        </div>
                        <p className="text-gray-900 font-medium">{finding.issue_description}</p>
                        {finding.file_path && (
                          <p className="text-sm text-gray-600 mt-1">
                            {finding.file_path}
                            {finding.line_number && `:${finding.line_number}`}
                          </p>
                        )}
                        {finding.suggested_fix && (
                          <div className="mt-2 p-3 bg-gray-50 rounded">
                            <p className="text-sm font-medium text-gray-700">{REVIEW.DETAIL.SUGGESTED_FIX}</p>
                            <p className="text-sm text-gray-600 mt-1">{finding.suggested_fix}</p>
                          </div>
                        )}
                        {finding.code_snippet && (
                          <pre className="mt-2 p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto">
                            {finding.code_snippet}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">{REVIEW.DETAIL.NO_RESULTS}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

