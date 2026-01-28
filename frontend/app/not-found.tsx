import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';

export default function NotFound() {
  return (
    <AppShell>
      <div className="min-h-screen flex items-center justify-center text-white px-4">
        <div className="max-w-md w-full space-y-8 p-8 bg-black/70 rounded-lg shadow-md border border-white/10 text-center">
          <div>
            <h2 className="text-3xl font-extrabold text-white mb-4">
              404 - Page Not Found
            </h2>
            <p className="text-gray-300 mb-6">
              The page you're looking for doesn't exist.
            </p>
            <div className="space-y-4">
              <Link
                href="/dashboard"
                className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/"
                className="block w-full px-4 py-2 border border-white/20 text-gray-200 rounded-md hover:bg-white/10"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

