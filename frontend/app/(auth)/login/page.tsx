'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { supabase } from '@/lib/supabase';
import { AUTH, APP_NAME, APP_TAGLINE, ERROR_MESSAGES } from '@/lib/ui-constants';
import { extractErrorMessage } from '@/lib/error-utils';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/api/v1/auth/login', {
        email,
        password,
      });

      const { access_token, refresh_token, user } = response.data;
      
      // Check if this is an admin token (non-JWT)
      if (access_token === 'admin-token-bypass') {
        // Store admin token in localStorage instead of Supabase
        localStorage.setItem('admin_token', access_token);
        localStorage.setItem('admin_user', JSON.stringify(user));
      } else {
        // Regular user - use Supabase session
        await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(extractErrorMessage(err, AUTH.LOGIN.ERROR_INVALID));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {AUTH.LOGIN.TITLE}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {APP_TAGLINE}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {AUTH.LOGIN.EMAIL_LABEL}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {AUTH.LOGIN.PASSWORD_LABEL}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? AUTH.LOGIN.SUBMIT_LOADING : AUTH.LOGIN.SUBMIT_BUTTON}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {AUTH.LOGIN.NO_ACCOUNT}{' '}
              <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                {AUTH.LOGIN.SIGN_UP_LINK}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

