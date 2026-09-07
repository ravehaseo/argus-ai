import Link from 'next/link';
import Image from 'next/image';
import { LANDING, APP_NAME, NAV } from '@/lib/ui-constants';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Top navigation */}
      <nav className="sticky top-0 z-30 border-b border-white/10 bg-black/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Image src="/argus-logo.svg" alt="Argus" width={32} height={32} className="h-8 w-8 rounded-lg object-contain shadow-lg shadow-indigo-500/40" />
              <span className="text-xl font-semibold tracking-tight">{APP_NAME}</span>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <span className="text-gray-300">
                <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  <span className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Powered by GPT‑5 & Groq
                </span>
              </span>
              <Link
                href="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                {NAV.SIGN_IN}
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center rounded-full bg-indigo-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 hover:bg-indigo-400 transition-colors"
              >
                {NAV.GET_STARTED}
              </Link>
            </div>
            <div className="md:hidden flex items-center space-x-3">
              <Link
                href="/login"
                className="text-gray-300 hover:text-white text-sm"
              >
                {NAV.SIGN_IN}
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-indigo-400 transition-colors"
              >
                {NAV.GET_STARTED}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.25),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(8,47,73,0.5),_transparent_55%)]" />
        <div className="absolute inset-x-10 top-40 h-72 rounded-3xl border border-white/5 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-cyan-500/5 blur-3xl" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        {/* Hero section */}
        <section className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gray-200 mb-5">
              <span className="mr-2 inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AI-native code review workspace for high-performing teams
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              <span className="block bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent">
                {LANDING.TITLE}
              </span>
              <span className="mt-3 block text-2xl sm:text-3xl text-indigo-300">
                {LANDING.SUBTITLE}
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base sm:text-lg text-gray-300 leading-relaxed">
              {LANDING.DESCRIPTION}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-7 py-3 text-sm sm:text-base font-semibold text-white shadow-xl shadow-indigo-500/40 hover:bg-indigo-400 transition-colors"
              >
                {LANDING.CTA_PRIMARY}
                <svg
                  className="ml-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M13 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm sm:text-base font-semibold text-gray-100 hover:bg-white/10 transition-colors"
              >
                {LANDING.CTA_SECONDARY}
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs sm:text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 text-xs">
                  ✓
                </span>
                <span>Security, Quality & Tech Debt scores in one view</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 text-xs">
                  ✓
                </span>
                <span>Works with GitHub repositories in minutes</span>
              </div>
            </div>
          </div>

          {/* Hero preview card */}
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-indigo-500/30 via-transparent to-cyan-500/30 blur-2xl opacity-60" />
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-gray-900/90 to-gray-950/90 shadow-2xl shadow-black/60 p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Overview</p>
                  <p className="mt-1 text-sm font-semibold text-gray-100">Recent Code Reviews</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                  • Live insights
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5 text-xs">
                <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 p-3">
                  <p className="text-gray-400 mb-1">Security</p>
                  <p className="text-2xl font-semibold text-emerald-300">92</p>
                  <p className="mt-1 text-[11px] text-emerald-200/80">+8 vs last review</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-sky-500/10 to-sky-500/5 border border-sky-500/30 p-3">
                  <p className="text-gray-400 mb-1">Quality</p>
                  <p className="text-2xl font-semibold text-sky-300">88</p>
                  <p className="mt-1 text-[11px] text-sky-200/80">Fewer code smells</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 p-3">
                  <p className="text-gray-400 mb-1">Tech Debt</p>
                  <p className="text-2xl font-semibold text-amber-300">71</p>
                  <p className="mt-1 text-[11px] text-amber-200/80">Target: 80+</p>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-3 mb-4">
                <p className="text-xs font-medium text-gray-300 mb-2">Recent findings</p>
                <ul className="space-y-2 text-[11px]">
                  <li className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="inline-flex items-center rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-300 mr-2">
                        CRITICAL
                      </div>
                      <span className="text-gray-200">
                        JWT verification missing on admin endpoint
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">backend/app/api/v1/auth.py</span>
                  </li>
                  <li className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="inline-flex items-center rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-semibold text-orange-300 mr-2">
                        HIGH
                      </div>
                      <span className="text-gray-200">
                        Unbounded list rendering for large collections
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">frontend/app/dashboard/page.tsx</span>
                  </li>
                  <li className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="inline-flex items-center rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10px] font-semibold text-yellow-300 mr-2">
                        MEDIUM
                      </div>
                      <span className="text-gray-200">
                        Consider extracting shared layout into a reusable component
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">Multiple files</span>
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>Designed for teams who care about shipping safe, maintainable code.</span>
                <span className="text-indigo-300 font-medium">View live dashboard →</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature highlights */}
        <section className="mt-20 border-t border-white/10 pt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/15 text-red-300">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                  <path d="M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {LANDING.FEATURE_SECURITY_TITLE}
              </h3>
              <p className="text-sm text-gray-300">
                {LANDING.FEATURE_SECURITY_DESC}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {LANDING.FEATURE_QUALITY_TITLE}
              </h3>
              <p className="text-sm text-gray-300">
                {LANDING.FEATURE_QUALITY_DESC}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M13 2L3 14h9l-1 8L21 10h-9l1-8Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {LANDING.FEATURE_FAST_TITLE}
              </h3>
              <p className="text-sm text-gray-300">
                {LANDING.FEATURE_FAST_DESC}
              </p>
            </div>
          </div>
        </section>

        {/* Simple footer */}
        <footer className="mt-16 border-t border-white/10 pt-6 pb-2 text-xs text-gray-500 flex flex-col sm:flex-row justify-between gap-3">
          <span>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</span>
          <span className="text-gray-500">
            Built for engineers who want AI assistance <span className="font-semibold text-gray-300">without losing control</span>.
          </span>
        </footer>
      </main>
    </div>
  );
}

