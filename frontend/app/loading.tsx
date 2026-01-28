import { DASHBOARD } from '@/lib/ui-constants';
import { AppShell } from '@/components/layout/AppShell';

export default function Loading() {
  return (
    <AppShell>
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">{DASHBOARD.LOADING}</p>
        </div>
      </div>
    </AppShell>
  );
}

