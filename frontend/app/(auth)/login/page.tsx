'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient } from '@/lib/api-client';
import { supabase } from '@/lib/supabase';
import { AUTH, APP_TAGLINE } from '@/lib/ui-constants';
import { useSearchParams } from 'next/navigation';
import { extractErrorMessage } from '@/lib/error-utils';
import { AppShell } from '@/components/layout/AppShell';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(
    searchParams.get('reason') === 'session_expired'
      ? 'Your session expired. Please sign in again.'
      : ''
  );
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'github' | 'google' | null>(null);

  const handleOAuth = async (provider: 'github' | 'google') => {
    setError('');
    setOauthLoading(provider);
    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback?next=/dashboard`
          : undefined;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });

      if (oauthError) throw oauthError;
      // Redirect happens automatically
    } catch (err: any) {
      setError(extractErrorMessage(err, 'OAuth login failed. Please try again.'));
      setOauthLoading(null);
    }
  };

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
    <AppShell>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="relative max-w-md w-full space-y-8 p-8 rounded-2xl border border-white/10 bg-black/70 shadow-2xl shadow-black/60 backdrop-blur">
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-transparent to-cyan-500/20 pointer-events-none" />
          <div className="relative">
            <div className="flex flex-col items-center space-y-2">
              <Image src="/argus-logo.svg" alt="Argus" width={40} height={40} className="h-10 w-10 rounded-xl object-contain shadow-md shadow-indigo-500/40" />
              <h2 className="text-center text-2xl font-bold text-white">
                {AUTH.LOGIN.TITLE}
              </h2>
              <p className="text-center text-xs text-gray-400">
                {APP_TAGLINE}
              </p>
            </div>
          </div>
          <div className="relative space-y-3">
            <button
              type="button"
              onClick={() => handleOAuth('github')}
              disabled={!!oauthLoading || loading}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-md border border-white/10 bg-white/5 text-sm font-medium text-gray-50 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-950 disabled:opacity-50 transition-colors"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
              >
                <path
                  fill="currentColor"
                  d="M12 0C5.37 0 0 5.37 0 12a12 12 0 008.21 11.43c.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.1-.75.08-.73.08-.73 1.22.09 1.86 1.26 1.86 1.26 1.08 1.85 2.84 1.31 3.53 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.25-3.23-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.78.84 1.25 1.91 1.25 3.23 0 4.63-2.8 5.66-5.48 5.96.43.37.81 1.1.81 2.22 0 1.6-.02 2.88-.02 3.27 0 .32.21.7.82.58A12 12 0 0024 12c0-6.63-5.37-12-12-12z"
                />
              </svg>
              <span>
                {oauthLoading === 'github' ? 'Connecting…' : 'Continue with GitHub'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading || loading}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-md border border-white/10 bg-white text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-950 disabled:opacity-50 transition-colors"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
              >
                <path
                  fill="#EA4335"
                  d="M11.99 10.2v3.92h5.46c-.24 1.26-.98 2.33-2.08 3.04l3.37 2.62c1.97-1.82 3.11-4.5 3.11-7.66 0-.74-.07-1.45-.2-2.14H12z"
                />
                <path
                  fill="#34A853"
                  d="M6.53 14.32l-.86.66-2.69 2.08A11.94 11.94 0 0012 24c3.24 0 5.96-1.07 7.95-2.92l-3.37-2.62c-.9.6-2.06.97-3.58.97-2.75 0-5.08-1.86-5.91-4.38z"
                />
                <path
                  fill="#4A90E2"
                  d="M3 6.94A11.96 11.96 0 00.04 12c0 1.92.46 3.73 1.27 5.32l3.22-3c-.19-.58-.29-1.21-.29-1.87 0-.64.1-1.26.28-1.85z"
                />
                <path
                  fill="#FBBC05"
                  d="M12 4.75c1.76 0 3.33.61 4.57 1.81l3.42-3.42C17.94 1.2 15.22 0 12 0 7.31 0 3.27 2.69 1.27 6.94l3.54 2.69C5.63 7.61 8.02 4.75 12 4.75z"
                />
              </svg>
              <span>
                {oauthLoading === 'google' ? 'Connecting…' : 'Continue with Google'}
              </span>
            </button>
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-black/70 px-2 text-gray-400">or continue with email</span>
              </div>
            </div>
          </div>
          <form className="relative mt-4 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/40 text-red-100 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                  {AUTH.LOGIN.EMAIL_LABEL}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-white/10 rounded-md bg-black/40 text-gray-50 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                  {AUTH.LOGIN.PASSWORD_LABEL}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-white/10 rounded-md bg-black/40 text-gray-50 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !!oauthLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-950 disabled:opacity-50"
              >
                {loading ? AUTH.LOGIN.SUBMIT_LOADING : AUTH.LOGIN.SUBMIT_BUTTON}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                {AUTH.LOGIN.NO_ACCOUNT}{' '}
                <Link href="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
                  {AUTH.LOGIN.SIGN_UP_LINK}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

