'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { supabase } from '@/lib/supabase';
import type { ReviewDetail, Finding } from '@/types';
import { REVIEW, NAV, STATUS_COLORS, SEVERITY_COLORS } from '@/lib/ui-constants';
import { extractErrorMessage } from '@/lib/error-utils';
import { exportFindingsAsCSV } from '@/lib/export-utils';
import { formatDateTime } from '@/lib/date-utils';
import Toast from '@/components/ui/Toast';
import { ReviewDetailSkeleton } from '@/components/ui/LoadingSkeleton';
import { AppShell } from '@/components/layout/AppShell';

// UUID regex pattern: matches standard UUID format
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function extractUUID(str: string): string | null {
  if (!str) return null;
  
  // Try to find UUID in the string
  const uuidMatch = str.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  if (uuidMatch) {
    return uuidMatch[0];
  }
  
  // If no match, try trimming and checking if it's already a valid UUID
  const trimmed = str.trim();
  if (UUID_PATTERN.test(trimmed)) {
    return trimmed;
  }
  
  return null;
}

export default function ReviewDetailPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params.id ? String(params.id) : '';
  const reviewId = extractUUID(rawId) || '';
  
  const [reviewDetail, setReviewDetail] = useState<ReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retrying, setRetrying] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [expandedFindings, setExpandedFindings] = useState<Set<string>>(new Set());
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    loadReview();
  }, [reviewId]);

  // Separate effect for live polling when review is processing
  useEffect(() => {
    if (!reviewDetail?.review) return;
    
    const status = reviewDetail.review.status;
    if (status === 'processing' || status === 'pending') {
      // Poll every 2 seconds for faster updates
      const interval = setInterval(() => {
        loadReview();
      }, 2000);

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewDetail?.review?.status, reviewId]);

  const checkAuth = async () => {
    // Reviews are publicly viewable, so we don't require authentication
    // But we check if user is logged in for owner-specific actions (retry, delete)
    // This allows share links to work without requiring sign-in
    return;
  };

  const loadReview = async () => {
    if (!reviewId) {
      setError('Invalid review ID. Please check the URL.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await apiClient.get(`/api/v1/reviews/${reviewId}`);
      setReviewDetail(response.data);
      
      // Check if current user is the owner (handles both admin and regular users)
      let isOwnerCheck = false;
      
      // Check for admin user first (stored in localStorage)
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const adminUser = adminToken && typeof window !== 'undefined' ? localStorage.getItem('admin_user') : null;
      
      if (adminToken && adminUser) {
        // Admin user - admins can see all reviews as owners (they have dashboard access)
        try {
          const adminUserData = JSON.parse(adminUser);
          const reviewUserId = String(response.data.review.user_id).trim();
          const adminUserId = String(adminUserData.id).trim();
          
          // Admin users always see owner controls (they can access dashboard)
          // Also check if they actually own the review
          isOwnerCheck = adminUserId === reviewUserId || adminUserData.is_admin === true;
        } catch (e) {
          console.error('Failed to parse admin user:', e);
        }
      } else {
        // Regular user - check Supabase auth
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const reviewUserId = String(response.data.review.user_id).trim();
            const currentUserId = String(user.id).trim();
            isOwnerCheck = currentUserId === reviewUserId;
          }
        } catch (e) {
          // Not authenticated - that's fine for public viewing
          console.debug('User not authenticated for owner check');
        }
      }
      
      setIsOwner(isOwnerCheck);
    } catch (err: any) {
      const errorMsg = extractErrorMessage(err, 'Failed to load review');
      setError(errorMsg);
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!reviewDetail?.review || !reviewId) {
      setToast({ message: 'Review data not available', type: 'error' });
      return;
    }
    
    setRetrying(true);
    setError('');
    
    try {
      // Retry endpoint returns ReviewResponse, not ReviewDetailResponse
      // So we just trigger it and reload the full detail
      await apiClient.post(`/api/v1/reviews/${reviewId}/retry`);
      setToast({ message: 'Review retry initiated', type: 'success' });
      
      // Reload the full review detail after a moment
      setTimeout(() => {
        loadReview();
      }, 1000);
    } catch (err: any) {
      const errorMsg = extractErrorMessage(err, 'Failed to retry review');
      setError(errorMsg);
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setRetrying(false);
    }
  };

  const handleExportCSV = () => {
    if (!reviewDetail?.result?.finding_objects || reviewDetail.result.finding_objects.length === 0) {
      setToast({ message: 'No findings to export', type: 'info' });
      return;
    }
    try {
      exportFindingsAsCSV(reviewDetail.result.finding_objects);
      setToast({ message: 'Findings exported as CSV', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to export findings', type: 'error' });
    }
  };

  const handleShareReview = async () => {
    if (typeof window === 'undefined' || !reviewId) return;
    
    const reviewUrl = `${window.location.origin}/review/${reviewId}`;
    
    // Try Web Share API first (mobile-friendly)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Code Review: ${reviewDetail?.review.repository_name || 'Review'}`,
          text: `Check out this code review for ${reviewDetail?.review.repository_name || 'this repository'}`,
          url: reviewUrl,
        });
        setToast({ message: 'Review shared successfully', type: 'success' });
        return;
      } catch (err: any) {
        // User cancelled or share failed, fall back to clipboard
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
    
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setToast({ message: 'Review link copied to clipboard', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to copy link. Please copy the URL manually.', type: 'error' });
    }
  };

  const toggleFinding = (findingId: string) => {
    setExpandedFindings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(findingId)) {
        newSet.delete(findingId);
      } else {
        newSet.add(findingId);
      }
      return newSet;
    });
  };

  const handleCopyCodeSnippet = async (codeSnippet: string) => {
    try {
      await navigator.clipboard.writeText(codeSnippet);
      setToast({ message: 'Code snippet copied to clipboard', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to copy code snippet', type: 'error' });
    }
  };

  const handleDownloadReport = () => {
    if (!reviewDetail?.review || !reviewDetail?.result) {
      setToast({ message: 'Review data not available', type: 'error' });
      return;
    }

    const { review, result } = reviewDetail;
    
    // Generate formatted report text
    let report = `ARGUS CODE REVIEW REPORT\n`;
    report += `================================\n\n`;
    report += `Repository: ${review.repository_name || review.repository_url}\n`;
    report += `Review Date: ${formatDateTime(review.created_at)}\n`;
    report += `Status: ${review.status}\n\n`;
    
    report += `SCORES\n`;
    report += `------\n`;
    report += `Security: ${result.security_score}/100\n`;
    report += `Quality: ${result.quality_score}/100\n`;
    report += `Tech Debt: ${result.tech_debt_score}/100\n\n`;
    
    if (result.summary) {
      report += `SUMMARY\n`;
      report += `-------\n`;
      report += `${result.summary}\n\n`;
    }
    
    if (result.finding_objects && result.finding_objects.length > 0) {
      report += `FINDINGS (${result.finding_objects.length})\n`;
      report += `--------\n\n`;
      
      result.finding_objects.forEach((finding, index) => {
        report += `${index + 1}. [${finding.severity?.toUpperCase()}] ${finding.category}\n`;
        report += `   File: ${finding.file_path || 'N/A'}${finding.line_number ? `:${finding.line_number}` : ''}\n`;
        report += `   Description: ${finding.issue_description}\n`;
        if (finding.suggested_fix) {
          report += `   Suggested Fix: ${finding.suggested_fix}\n`;
        }
        if (finding.code_snippet) {
          report += `   Code Snippet:\n${finding.code_snippet}\n`;
        }
        report += `\n`;
      });
    }
    
    if (result.recommendations && result.recommendations.length > 0) {
      report += `RECOMMENDATIONS\n`;
      report += `---------------\n`;
      result.recommendations.forEach((rec, index) => {
        report += `${index + 1}. ${typeof rec === 'string' ? rec : JSON.stringify(rec)}\n`;
      });
      report += `\n`;
    }
    
    report += `\nGenerated by Argus - The All-Seeing Code Reviewer\n`;
    report += `${window.location.origin}/review/${review.id}\n`;
    
    // Create and download file
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `argus-review-${review.repository_name?.replace(/[^a-z0-9]/gi, '_') || 'review'}-${review.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setToast({ message: 'Report downloaded successfully', type: 'success' });
  };

  // Filter findings based on severity and category
  const getFilteredFindings = () => {
    if (!reviewDetail?.result?.finding_objects) return [];
    
    return reviewDetail.result.finding_objects.filter(finding => {
      const severityMatch = severityFilter === 'all' || finding.severity?.toLowerCase() === severityFilter.toLowerCase();
      const categoryMatch = categoryFilter === 'all' || finding.category?.toLowerCase() === categoryFilter.toLowerCase();
      return severityMatch && categoryMatch;
    });
  };

  const getSeverityColor = (severity: string) => {
    const severityLower = severity?.toLowerCase() || 'info';
    switch (severityLower) {
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
      <AppShell>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <ReviewDetailSkeleton />
          </div>
        </main>
      </AppShell>
    );
  }

  if (!reviewId && !loading) {
    return (
      <AppShell>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-black/40 border border-white/10 rounded-lg shadow-lg shadow-black/40 p-8 text-center">
              <div className="text-red-200">Invalid review ID. Please check the URL.</div>
              {isOwner && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
                >
                  Back to Dashboard
                </button>
              )}
            </div>
          </div>
        </main>
      </AppShell>
    );
  }

  if (!loading && (error || !reviewDetail)) {
    return (
      <AppShell>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-black/40 border border-white/10 rounded-lg shadow-lg shadow-black/40 p-8 text-center">
              <div className="text-red-200">{error || REVIEW.DETAIL.NOT_FOUND}</div>
              {isOwner && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
                >
                  Back to Dashboard
                </button>
              )}
            </div>
          </div>
        </main>
      </AppShell>
    );
  }

  if (!reviewDetail) {
    return null; // Still loading
  }

  const { review, result } = reviewDetail;

  return (
    <AppShell>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            {isOwner && (
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm text-indigo-300 hover:text-indigo-200 mb-4"
              >
                {NAV.BACK_TO_DASHBOARD}
              </button>
            )}
            <h1 className="text-3xl font-bold text-white">
              {review.repository_name || 'Code Review'}
            </h1>
            <p className="text-gray-400 mt-2">{review.repository_url}</p>
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
            <div className="bg-black/40 border border-white/10 rounded-lg shadow-lg shadow-black/40 p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto"></div>
              <p className="mt-4 text-gray-200">{REVIEW.DETAIL.PROCESSING.MESSAGE}</p>
              <p className="mt-2 text-sm text-gray-400">This page will update automatically...</p>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Export & Share Actions */}
              <div className="bg-gradient-to-r from-indigo-500/15 to-purple-500/15 rounded-xl shadow-md border border-indigo-400/40 p-4 flex flex-wrap gap-3">
                {result.finding_objects && result.finding_objects.length > 0 && (
                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2.5 text-sm font-semibold text-indigo-100 bg-black/40 rounded-lg hover:bg-black/60 border border-indigo-300/50 transition-all shadow-sm hover:shadow flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export CSV
                  </button>
                )}
                <button
                  onClick={handleShareReview}
                  className="px-4 py-2.5 text-sm font-semibold text-indigo-100 bg-black/40 rounded-lg hover:bg-black/60 border border-indigo-300/50 transition-all shadow-sm hover:shadow flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share Review
                </button>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-lg shadow-lg shadow-black/40 p-6">
                <h2 className="text-xl font-semibold mb-4 text-white">{REVIEW.DETAIL.SCORES.TITLE}</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-300">{REVIEW.DETAIL.SCORES.SECURITY}</p>
                    <p className="text-3xl font-bold text-red-600">{result.security_score}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">{REVIEW.DETAIL.SCORES.QUALITY}</p>
                    <p className="text-3xl font-bold text-blue-600">{result.quality_score}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">{REVIEW.DETAIL.SCORES.TECH_DEBT}</p>
                    <p className="text-3xl font-bold text-yellow-600">{result.tech_debt_score}</p>
                  </div>
                </div>
              </div>

              {result.summary && (
                <div className="bg-black/40 border border-white/10 rounded-lg shadow-lg shadow-black/40 p-6">
                  <h2 className="text-xl font-semibold mb-4 text-white">{REVIEW.DETAIL.SUMMARY_TITLE}</h2>
                  <p className="text-gray-200">{result.summary}</p>
                </div>
              )}

              {(result.finding_objects && result.finding_objects.length > 0) ? (
                <div className="bg-black/40 rounded-xl shadow-lg border border-white/10 p-6">
                  {/* Header with gradient background */}
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          {REVIEW.DETAIL.FINDINGS_TITLE}
                        </h2>
                        <p className="text-sm text-gray-400 mt-0.5">
                          Showing <span className="font-semibold text-indigo-300">{getFilteredFindings().length}</span> of <span className="font-semibold">{result.finding_objects.length}</span> findings
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDownloadReport}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg hover:from-indigo-500 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Report
                    </button>
                  </div>

                  {/* Enhanced Filter Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-white/10">
                      <label htmlFor="severity-filter" className="block text-sm font-semibold text-gray-100 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Filter by Severity
                      </label>
                      <select
                        id="severity-filter"
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className="w-full px-4 py-2.5 border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-50 bg-black/40 font-medium shadow-sm transition-all"
                      >
                        <option value="all">All Severities</option>
                        <option value="critical">🔴 Critical</option>
                        <option value="high">🟠 High</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="low">🔵 Low</option>
                        <option value="info">⚪ Info</option>
                      </select>
                    </div>
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-white/10">
                      <label htmlFor="category-filter" className="block text-sm font-semibold text-gray-100 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Filter by Category
                      </label>
                      <select
                        id="category-filter"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full px-4 py-2.5 border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-50 bg-black/40 font-medium shadow-sm transition-all"
                      >
                        <option value="all">All Categories</option>
                        <option value="security">🔒 Security</option>
                        <option value="performance">⚡ Performance</option>
                        <option value="maintainability">🔧 Maintainability</option>
                        <option value="best_practices">✨ Best Practices</option>
                        <option value="bug">🐛 Bug</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {getFilteredFindings().length > 0 ? (
                      getFilteredFindings().map((finding: Finding) => {
                        const isExpanded = expandedFindings.has(finding.id);
                        const severityLower = finding.severity?.toLowerCase() || 'info';
                        const borderColorMap: Record<string, string> = {
                          critical: 'border-red-500',
                          high: 'border-orange-500',
                          medium: 'border-yellow-500',
                          low: 'border-blue-500',
                          info: 'border-gray-400',
                        };
                        const bgGradientMap: Record<string, string> = {
                          critical: 'from-red-50 to-red-100/50',
                          high: 'from-orange-50 to-orange-100/50',
                          medium: 'from-yellow-50 to-yellow-100/50',
                          low: 'from-blue-50 to-blue-100/50',
                          info: 'from-gray-50 to-gray-100/50',
                        };
                        return (
                          <div
                            key={finding.id}
                            className={`border-l-4 ${borderColorMap[severityLower] || 'border-gray-400'} bg-gradient-to-r ${bgGradientMap[severityLower] || 'from-gray-900 to-gray-800/50'} rounded-r-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden`}
                          >
                            {/* Header - Always visible */}
                            <div 
                              className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/30 transition-colors"
                              onClick={() => toggleFinding(finding.id)}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span
                                  className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm ${getSeverityColor(
                                    finding.severity
                                  )} border`}
                                  style={finding.severity?.toLowerCase() === 'high' ? { backgroundColor: '#ea580c', color: '#ffffff', borderColor: '#c2410c' } : undefined}
                                >
                                  {finding.severity?.toUpperCase()}
                                </span>
                                <span className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-white/80 rounded-md border border-gray-200">
                                  {finding.category?.replace('_', ' ')}
                                </span>
                                {finding.file_path && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-200 bg-black/40 px-2 py-1 rounded-md">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="font-mono truncate max-w-[200px]">
                                      {finding.file_path}
                                      {finding.line_number && `:${finding.line_number}`}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <svg
                                className={`w-5 h-5 text-gray-600 transition-transform duration-200 flex-shrink-0 ml-2 ${isExpanded ? 'transform rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                            
                            {/* Collapsible Content */}
                            {isExpanded && (
                              <div className="px-4 pb-4 space-y-4 bg-black/40">
                                <div className="pt-2 border-t border-white/10">
                                  <p className="text-gray-100 font-semibold leading-relaxed">{finding.issue_description}</p>
                                </div>
                                
                                {finding.suggested_fix && (
                                  <div className="p-4 bg-gradient-to-br from-green-900/40 to-emerald-800/40 rounded-lg border border-green-400/70 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <p className="text-sm font-bold text-green-800">{REVIEW.DETAIL.SUGGESTED_FIX}</p>
                                    </div>
                                    <p className="text-sm text-green-50 leading-relaxed">{finding.suggested_fix}</p>
                                  </div>
                                )}
                                
                                {finding.code_snippet && (
                                  <div className="relative">
                                    <div className="flex justify-between items-center mb-2">
                                      <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                        <p className="text-sm font-semibold text-gray-100">Code Snippet</p>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCopyCodeSnippet(finding.code_snippet || '');
                                        }}
                                        className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm hover:shadow"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Copy
                                      </button>
                                    </div>
                                    <pre className="p-4 bg-gray-950 text-gray-100 rounded-lg text-xs overflow-x-auto border border-gray-700 shadow-inner font-mono leading-relaxed">
                                      {finding.code_snippet}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border-2 border-dashed border-gray-600">
                        <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-200 font-medium">No findings match the selected filters</p>
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your filters to see more results</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-black/40 rounded-xl shadow-lg border border-white/10 p-8 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-900/40 rounded-full mb-4">
                    <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{REVIEW.DETAIL.FINDINGS_TITLE}</h2>
                  <p className="text-gray-200 text-lg">No findings detected. Great job! 🎉</p>
                </div>
              )}
            </div>
          ) : review.status === 'failed' ? (
            <div className="bg-black/40 border border-white/10 rounded-lg shadow-lg shadow-black/40 p-8 text-center">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Review Failed</h3>
              <p className="text-gray-300 mb-6">The review could not be completed. This might be due to repository access issues or rate limiting.</p>
              {error && (
                <div className="mb-4 bg-red-500/10 border border-red-500/40 text-red-100 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}
              {isOwner && (
                <button
                  onClick={handleRetry}
                  disabled={retrying}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-950 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {retrying ? 'Retrying...' : 'Retry Review'}
                </button>
              )}
              {!isOwner && (
                <p className="text-sm text-gray-400">
                  Sign in as the review owner to retry this review.
                </p>
              )}
            </div>
          ) : (
            <div className="bg-black/40 border border-white/10 rounded-lg shadow-lg shadow-black/40 p-8 text-center">
              <p className="text-gray-200">{REVIEW.DETAIL.NO_RESULTS}</p>
            </div>
          )}
        </div>

        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </main>
    </AppShell>
  );
}

