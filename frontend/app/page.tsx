import Link from 'next/link';
import { LANDING, APP_NAME, NAV } from '@/lib/ui-constants';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-white">{APP_NAME}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                {NAV.SIGN_IN}
              </Link>
              <Link
                href="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {NAV.GET_STARTED}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-white mb-6">
            {LANDING.TITLE}
            <span className="block text-3xl text-indigo-400 mt-2">
              {LANDING.SUBTITLE}
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {LANDING.DESCRIPTION}
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/register"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-md text-lg font-medium"
            >
              {LANDING.CTA_PRIMARY}
            </Link>
            <Link
              href="/dashboard"
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-md text-lg font-medium"
            >
              {LANDING.CTA_SECONDARY}
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-3">{LANDING.FEATURE_SECURITY_TITLE}</h3>
            <p className="text-gray-300">
              {LANDING.FEATURE_SECURITY_DESC}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-3">{LANDING.FEATURE_QUALITY_TITLE}</h3>
            <p className="text-gray-300">
              {LANDING.FEATURE_QUALITY_DESC}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-3">{LANDING.FEATURE_FAST_TITLE}</h3>
            <p className="text-gray-300">
              {LANDING.FEATURE_FAST_DESC}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

