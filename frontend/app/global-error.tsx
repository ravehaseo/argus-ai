'use client';

/**
 * Global error boundary - catches errors that bubble up from the root layout.
 * Must render its own <html> and <body>; replaces the root layout when triggered.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white px-4 font-sans">
        <div className="max-w-md w-full space-y-8 p-8 bg-black/70 rounded-lg border border-white/10 shadow-2xl text-center">
          <h2 className="text-2xl font-extrabold text-white">
            Something went wrong
          </h2>
          <p className="text-gray-300 text-sm">
            A critical error occurred. We&apos;ve been notified and are looking into it.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => reset()}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
            >
              Try again
            </button>
            <a
              href="/"
              className="block w-full px-4 py-2 border border-white/20 text-gray-200 rounded-md hover:bg-white/10"
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
