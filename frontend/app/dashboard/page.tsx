'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { supabase } from '@/lib/supabase';
import type { Review, User } from '@/types';
import { DASHBOARD, APP_NAME, NAV, STATUS_COLORS } from '@/lib/ui-constants';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadReviews();
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
    
    // Regular user - check Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    
    try {
      const response = await apiClient.get('/api/v1/auth/me');
      setUser(response.data);
    } catch (err) {
      router.push('/login');
    }
  };

  const loadReviews = async () => {
    try {
      const response = await apiClient.get('/api/v1/reviews/');
      setReviews(response.data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-600">{DASHBOARD.LOADING}</div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
                {APP_NAME}
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.email}</span>
              <span className="px-2 py-1 text-xs font-semibold rounded bg-indigo-100 text-indigo-800">
                {user?.subscription_tier}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
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
            <h1 className="text-3xl font-bold text-gray-900">{DASHBOARD.TITLE}</h1>
            <Link
              href="/review/new"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {DASHBOARD.NEW_REVIEW_BUTTON}
            </Link>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">{DASHBOARD.NO_REVIEWS_MESSAGE}</p>
              <Link
                href="/review/new"
                className="text-indigo-600 hover:text-indigo-500"
              >
                {DASHBOARD.CREATE_FIRST_REVIEW}
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {reviews.map((review) => (
                <Link
                  key={review.id}
                  href={`/review/${review.id}`}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {review.repository_name || 'Untitled Repository'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {review.repository_url}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(review.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded ${getStatusColor(
                        review.status
                      )}`}
                    >
                      {review.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

