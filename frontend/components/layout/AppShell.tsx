'use client';

import type { ReactNode } from 'react';

type AppShellProps = {
  children: ReactNode;
};

/**
 * AppShell
 *
 * Minimal shared wrapper that applies the global dark theme
 * background and base text color for authenticated / inner pages.
 * Individual pages are still responsible for their own nav and layout,
 * but they all share this outer visual shell.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      {children}
    </div>
  );
}



