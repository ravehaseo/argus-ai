'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ERROR_MESSAGES } from '@/lib/ui-constants';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-black/70 rounded-lg border border-white/10 shadow-2xl shadow-black/60 text-center">
        <div>
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-300 mb-6">
            {error.message || ERROR_MESSAGES.GENERIC}
          </p>
          <div className="space-y-4">
            <button
              onClick={reset}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-950"
            >
              Try again
            </button>
            <Link
              href="/dashboard"
              className="block w-full px-4 py-2 border border-white/20 text-gray-200 rounded-md hover:bg-white/10"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

