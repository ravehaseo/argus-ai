import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';

export default function PricingPage() {
  return (
    <AppShell>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Pricing & plans
            </h1>
            <p className="mt-3 text-sm sm:text-base text-gray-300 max-w-2xl">
              Start on the free tier. Upgrade when you want faster reviews, higher limits,
              and GPT‑5 quality for your critical repositories.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-xs sm:text-sm font-medium text-indigo-200 hover:text-white border border-indigo-400/60 rounded-full px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-6 flex flex-col">
            <h2 className="text-lg font-semibold mb-1">Free</h2>
            <p className="text-sm text-gray-400 mb-4 flex-1">
              Ideal for solo developers exploring Argus.
            </p>
            <p className="text-3xl font-bold mb-1">$0</p>
            <p className="text-xs text-gray-400 mb-4">per month</p>
            <ul className="text-xs text-gray-300 space-y-2 mb-6">
              <li>• Limited reviews / month</li>
              <li>• Groq or GPT‑4o‑mini quality</li>
              <li>• Core dashboard & findings</li>
            </ul>
            <span className="inline-flex items-center justify-center rounded-full border border-white/15 px-3 py-1 text-xs text-gray-200">
              You are here
            </span>
          </div>

          <div className="rounded-2xl border border-indigo-400/60 bg-gradient-to-b from-indigo-500/25 via-indigo-500/5 to-black/60 p-6 flex flex-col shadow-xl shadow-indigo-500/40">
            <div className="inline-flex items-center self-start rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-200 mb-2">
              Most popular
            </div>
            <h2 className="text-lg font-semibold mb-1">Pro</h2>
            <p className="text-sm text-gray-200 mb-4 flex-1">
              For engineers and small teams who live in their repos.
            </p>
            <p className="text-3xl font-bold mb-1">TBD</p>
            <p className="text-xs text-gray-400 mb-4">per seat / month</p>
            <ul className="text-xs text-gray-100 space-y-2 mb-6">
              <li>• Higher monthly review limits</li>
              <li>• GPT‑5‑mini powered analysis</li>
              <li>• Priority processing & richer reports</li>
            </ul>
            <span className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold text-white shadow-md shadow-indigo-500/40">
              Coming soon
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-6 flex flex-col">
            <h2 className="text-lg font-semibold mb-1">Enterprise</h2>
            <p className="text-sm text-gray-300 mb-4 flex-1">
              Custom SLAs, on‑prem options, and deep integrations.
            </p>
            <p className="text-3xl font-bold mb-1">Let&apos;s talk</p>
            <p className="text-xs text-gray-400 mb-4">custom</p>
            <ul className="text-xs text-gray-300 space-y-2 mb-6">
              <li>• GPT‑5.1 quality and controls</li>
              <li>• Dedicated support & onboarding</li>
              <li>• Security & compliance reviews</li>
            </ul>
            <a
              href="mailto:founder@argus.ai?subject=Argus%20Enterprise%20interest"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-gray-100 hover:bg-white/10 transition-colors"
            >
              Contact us
            </a>
          </div>
        </div>
      </main>
    </AppShell>
  );
}

