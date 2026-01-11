'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ERROR_MESSAGES, APP_NAME } from '@/lib/ui-constants';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md text-center">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">
            {error.message || ERROR_MESSAGES.GENERIC}
          </p>
          <div className="space-y-4">
            <button
              onClick={reset}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Try again
            </button>
            <Link
              href="/dashboard"
              className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

