import Link from 'next/link';
import { APP_NAME, NAV } from '@/lib/ui-constants';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md text-center">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            404 - Page Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist.
          </p>
          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

