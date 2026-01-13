'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { supabase } from '@/lib/supabase';
import { REVIEW, APP_NAME, COMMON } from '@/lib/ui-constants';
import { extractErrorMessage } from '@/lib/error-utils';

export default function NewReviewPage() {
  const router = useRouter();
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateGitHubUrl = (url: string): boolean => {
    if (!url) return false;
    const trimmed = url.trim();
    
    // More strict pattern: only matches repository URLs
    // Must have exactly: github.com/owner/repo
    const githubPattern = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9]([a-zA-Z0-9_.-]*[a-zA-Z0-9])?\/[a-zA-Z0-9]([a-zA-Z0-9_.-]*[a-zA-Z0-9])?\/?$/;
    
    if (!githubPattern.test(trimmed)) {
      return false;
    }
    
    // Parse URL to check path parts
    try {
      const urlObj = new URL(trimmed);
      const pathParts = urlObj.pathname.split('/').filter(p => p);
      
      // Must have exactly 2 path parts: owner and repo
      if (pathParts.length !== 2) {
        return false;
      }
      
      const [owner, repo] = pathParts;
      
      // Exclude common GitHub non-repository paths
      const excludedPaths = [
        'settings', 'profile', 'orgs', 'organizations', 'explore',
        'topics', 'trending', 'stars', 'marketplace', 'pulls', 'issues',
        'notifications', 'new', 'import', 'login', 'logout', 'join',
        'pricing', 'enterprise', 'blog', 'about', 'contact', 'site',
        'security', 'roadmap', 'features', 'customer-stories', 'resources'
      ];
      
      if (excludedPaths.includes(owner.toLowerCase()) || excludedPaths.includes(repo.toLowerCase())) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    // Validate GitHub URL
    if (!validateGitHubUrl(repositoryUrl)) {
      setError('Please enter a valid GitHub repository URL (e.g., https://github.com/username/repository)');
      return;
    }
    
    setLoading(true);

    try {
      const response = await apiClient.post('/api/v1/reviews/', {
        repository_url: repositoryUrl.trim(),
        review_type: 'github_repo',
      });

      router.push(`/review/${response.data.id}`);
    } catch (err: any) {
      setError(extractErrorMessage(err, REVIEW.NEW.ERROR_CREATE_FAILED));
    } finally {
      setLoading(false);
    }
  };

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

      <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{REVIEW.NEW.TITLE}</h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="repositoryUrl"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {REVIEW.NEW.REPOSITORY_URL_LABEL}
              </label>
              <input
                id="repositoryUrl"
                type="url"
                required
                value={repositoryUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRepositoryUrl(e.target.value)}
                placeholder={REVIEW.NEW.REPOSITORY_URL_PLACEHOLDER}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
              />
              <p className="mt-2 text-sm text-gray-500">
                {REVIEW.NEW.REPOSITORY_URL_HINT}
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? REVIEW.NEW.SUBMIT_LOADING : REVIEW.NEW.SUBMIT_BUTTON}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {COMMON.CANCEL}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

