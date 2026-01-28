'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { supabase } from '@/lib/supabase';
import type { Review, User } from '@/types';
import { DASHBOARD, APP_NAME, NAV, STATUS_COLORS } from '@/lib/ui-constants';
import { ReviewCardSkeleton } from '@/components/ui/LoadingSkeleton';
import Toast from '@/components/ui/Toast';
import ReviewTrendsChart from '@/components/charts/ReviewTrendsChart';
import AverageScoresChart from '@/components/charts/AverageScoresChart';
import MostReviewedRepos from '@/components/charts/MostReviewedRepos';
import ActivityTimeline from '@/components/charts/ActivityTimeline';
import { formatDateTime, formatRelativeTime } from '@/lib/date-utils';
import { AppShell } from '@/components/layout/AppShell';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [stats, setStats] = useState({ completed: 0, processing: 0, failed: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const reviewsPerPage = 10;
  
  // Analytics data
  const [trendsData, setTrendsData] = useState<any>(null);
  const [scoresData, setScoresData] = useState<any>(null);
  const [reposData, setReposData] = useState<any>(null);
  const [activityData, setActivityData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Check for admin token first
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const adminUser = adminToken && typeof window !== 'undefined' ? localStorage.getItem('admin_user') : null;
    
    if (adminToken && adminUser) {
      // Admin user - set from localStorage
      setUser(JSON.parse(adminUser));
      return;
    }
    
    // Regular user - check Supabase session with expiration
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (!session || error) {
      router.push('/login');
      return;
    }
    
    // Check if session is expired
    const expiresAt = session.expires_at;
    if (expiresAt) {
      const now = Math.floor(Date.now() / 1000);
      if (now >= expiresAt) {
        // Session expired, sign out and redirect
        await supabase.auth.signOut();
        router.push('/login');
        return;
      }
    }
    
    // Set up session refresh listener
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login');
      }
    });
    
    try {
      const response = await apiClient.get('/api/v1/auth/me');
      setUser(response.data);
    } catch (err) {
      router.push('/login');
    }
  };

  const loadReviews = async (page: number = currentPage) => {
    try {
      const skip = (page - 1) * reviewsPerPage;
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: reviewsPerPage.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await apiClient.get(`/api/v1/reviews/?${params.toString()}`);
      const data = response.data;
      
      // Handle both new paginated format and old array format
      if (data.items) {
        setReviews(data.items);
        setTotalReviews(data.total || 0);
        setHasMore(data.has_more || false);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        // Fallback for old format
        setReviews(Array.isArray(data) ? data : []);
        setTotalReviews(Array.isArray(data) ? data.length : 0);
        setHasMore(false);
      }
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    if (!user) return;
    
    setAnalyticsLoading(true);
    try {
      // Load all analytics in parallel
      const [trendsRes, scoresRes, reposRes, activityRes] = await Promise.allSettled([
        apiClient.get('/api/v1/reviews/analytics/trends?days=30'),
        apiClient.get('/api/v1/reviews/analytics/scores?days=30'),
        apiClient.get('/api/v1/reviews/analytics/repositories?limit=5'),
        apiClient.get('/api/v1/reviews/analytics/activity?limit=10')
      ]);

      if (trendsRes.status === 'fulfilled') {
        setTrendsData(trendsRes.value.data);
      }
      if (scoresRes.status === 'fulfilled') {
        setScoresData(scoresRes.value.data);
      }
      if (reposRes.status === 'fulfilled') {
        setReposData(reposRes.value.data);
      }
      if (activityRes.status === 'fulfilled') {
        setActivityData(activityRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setCurrentPage(1); // Reset to first page when filters change
      loadReviews(1);
      loadAnalytics();
    }
  }, [user, searchQuery, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    if (user && currentPage > 1) {
      loadReviews(currentPage);
    }
  }, [currentPage]);

  const handleLogout = async () => {
    // Clear admin token if exists
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
    // Clear Supabase session
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return STATUS_COLORS.COMPLETED;
      case 'processing':
        return STATUS_COLORS.PROCESSING;
      case 'failed':
        return STATUS_COLORS.FAILED;
      default:
        return STATUS_COLORS.PENDING;
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await apiClient.delete(`/api/v1/reviews/${reviewId}`);
      setDeleteConfirmId(null);
      setToast({ message: 'Review deleted successfully', type: 'success' });
      // Reload reviews
      loadReviews(currentPage);
    } catch (err) {
      console.error('Failed to delete review:', err);
      setToast({ message: 'Failed to delete review. Please try again.', type: 'error' });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'date_asc' || value === 'date_desc') {
      setSortBy('created_at');
      setSortOrder(value === 'date_asc' ? 'asc' : 'desc');
    } else if (value === 'name_asc' || value === 'name_desc') {
      setSortBy('repository_name');
      setSortOrder(value === 'name_asc' ? 'asc' : 'desc');
    } else if (value === 'status_asc' || value === 'status_desc') {
      setSortBy('status');
      setSortOrder(value === 'status_asc' ? 'asc' : 'desc');
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <AppShell>
        <nav className="bg-black/60 border-b border-white/10 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 text-xs font-black shadow-md shadow-indigo-500/40">
                    A
                  </span>
                  <span className="text-xl font-semibold tracking-tight text-white">
                    {APP_NAME}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <ReviewCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <nav className="bg-black/60 border-b border-white/10 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 text-xs font-black shadow-md shadow-indigo-500/40">
                  A
                </span>
                <span className="text-xl font-semibold tracking-tight text-white">
                  {APP_NAME}
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-200">{user?.email}</span>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/40">
                {user?.subscription_tier}
              </span>
              {user?.subscription_tier && user.subscription_tier.toLowerCase() !== 'enterprise' && (
                <Link
                  href="/pricing"
                  className="text-xs font-semibold px-3 py-1 rounded-full border border-amber-400/70 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25 hover:border-amber-300 transition-colors"
                >
                  Upgrade
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-gray-300 hover:text-white"
              >
                {NAV.LOGOUT}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">{DASHBOARD.TITLE}</h1>
              {totalReviews > 0 && (
                <p className="text-sm text-gray-400 mt-1">
                  {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'} {searchQuery || statusFilter !== 'all' ? 'found' : 'total'}
                </p>
              )}
              {typeof window !== 'undefined' && (
                <p className="text-xs text-gray-500 mt-1">
                  Times shown in {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {user?.subscription_tier && user.subscription_tier.toLowerCase() !== 'enterprise' && (
                <Link
                  href="/pricing"
                  className="inline-flex items-center rounded-full border border-indigo-400/60 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-200 hover:bg-indigo-500/20 hover:border-indigo-300 transition-colors"
                >
                  View plans
                </Link>
              )}
              <Link
                href="/review/new"
                className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 hover:bg-indigo-500 transition-colors"
              >
                {DASHBOARD.NEW_REVIEW_BUTTON}
              </Link>
            </div>
          </div>

          {/* Search, Filter, and Sort Controls */}
          <div className="bg-black/40 border border-white/10 rounded-lg shadow-lg shadow-black/40 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-200 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Repository name or URL..."
                  className="w-full px-3 py-2 border border-white/15 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-50 bg-black/40 placeholder-gray-500"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-200 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="w-full px-3 py-2 border border-white/15 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-50 bg-black/40"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label htmlFor="sort" className="block text-sm font-medium text-gray-200 mb-1">
                  Sort By
                </label>
                <select
                  id="sort"
                  onChange={handleSortChange}
                  className="w-full px-3 py-2 border border-white/15 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-50 bg-black/40"
                  defaultValue="date_desc"
                >
                  <option value="date_desc">Date (Newest First)</option>
                  <option value="date_asc">Date (Oldest First)</option>
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                  <option value="status_asc">Status (A-Z)</option>
                  <option value="status_desc">Status (Z-A)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {totalReviews > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 rounded-xl shadow-md shadow-black/40 border border-indigo-400/40 p-4">
                <p className="text-sm font-medium text-indigo-100 mb-1">Total Reviews</p>
                <p className="text-3xl font-bold text-white">{totalReviews}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-xl shadow-md shadow-black/40 border border-green-400/40 p-4">
                <p className="text-sm font-medium text-green-100 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-100">{stats.completed || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-xl shadow-md shadow-black/40 border border-blue-400/40 p-4">
                <p className="text-sm font-medium text-blue-100 mb-1">Processing</p>
                <p className="text-3xl font-bold text-blue-100">{stats.processing || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-xl shadow-md shadow-black/40 border border-red-400/40 p-4">
                <p className="text-sm font-medium text-red-100 mb-1">Failed</p>
                <p className="text-3xl font-bold text-red-100">{stats.failed || 0}</p>
              </div>
            </div>
          )}

          {/* Analytics Charts */}
          {!analyticsLoading && totalReviews > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {trendsData && trendsData.data && trendsData.data.length > 0 && (
                <ReviewTrendsChart data={trendsData.data} periodDays={trendsData.period_days} />
              )}
              {scoresData && scoresData.data && scoresData.data.length > 0 && (
                <AverageScoresChart data={scoresData.data} periodDays={scoresData.period_days} />
              )}
            </div>
          )}

          {/* Most Reviewed Repos and Activity Timeline */}
          {!analyticsLoading && totalReviews > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {reposData && reposData.data && reposData.data.length > 0 && (
                <MostReviewedRepos data={reposData.data} />
              )}
              {activityData && activityData.data && activityData.data.length > 0 && (
                <ActivityTimeline data={activityData.data} />
              )}
            </div>
          )}

          {reviews.length === 0 && !loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">{DASHBOARD.NO_REVIEWS_MESSAGE}</p>
              <Link
                href="/review/new"
                className="text-indigo-300 hover:text-indigo-200"
              >
                {DASHBOARD.CREATE_FIRST_REVIEW}
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-black/40 border border-white/10 rounded-lg shadow-lg shadow-black/40 p-6 hover:border-indigo-500/60 hover:shadow-indigo-500/20 transition"
                >
                  <div className="flex justify-between items-start">
                    <Link
                      href={`/review/${review.id}`}
                      className="flex-1"
                    >
                      <h3 className="text-lg font-semibold text-white hover:text-indigo-300">
                        {review.repository_name || 'Untitled Repository'}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {review.repository_url}
                      </p>
                      {(() => {
                        const isCompleted = review.status === 'completed';
                        const completedAt = (review as any).completed_at;
                        const baseDate =
                          isCompleted && completedAt ? completedAt : review.created_at;
                        const label = isCompleted ? 'Completed' : 'Requested';
                        return (
                          <p
                            className="text-xs text-gray-500 mt-2"
                            title={formatDateTime(baseDate)}
                          >
                            {label} {formatRelativeTime(baseDate)}
                          </p>
                        );
                      })()}
                    </Link>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded ${getStatusColor(
                          review.status
                        )}`}
                      >
                        {review.status}
                      </span>
                      {review.status === 'failed' && (
                        <Link
                          href={`/review/${review.id}`}
                          className="px-2 py-1 text-xs text-indigo-600 hover:text-indigo-800"
                        >
                          Retry
                        </Link>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setDeleteConfirmId(review.id);
                        }}
                        className="px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        title="Delete review"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {reviews.length > 0 && totalReviews > reviewsPerPage && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * reviewsPerPage + 1} to {Math.min(currentPage * reviewsPerPage, totalReviews)} of {totalReviews} reviews
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  Page {currentPage} of {Math.ceil(totalReviews / reviewsPerPage)}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!hasMore && currentPage * reviewsPerPage >= totalReviews}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirmId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Review?</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete this review? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirmId)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toast Notification */}
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </div>
      </main>
    </AppShell>
  );
}

