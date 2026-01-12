'use client';

import Link from 'next/link';
import { STATUS_COLORS } from '@/lib/ui-constants';
import { formatRelativeTime } from '@/lib/date-utils';

interface ActivityData {
  id: string;
  repository_name: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

interface ActivityTimelineProps {
  data: ActivityData[];
}

export default function ActivityTimeline({ data }: ActivityTimelineProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
        <p className="text-gray-500 text-center py-8">No recent activity</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return STATUS_COLORS.COMPLETED;
      case 'processing':
        return STATUS_COLORS.PROCESSING;
      case 'failed':
        return STATUS_COLORS.FAILED;
      default:
        return STATUS_COLORS.PENDING;
    }
  };


  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
        <p className="text-sm text-gray-500">Latest review activity</p>
      </div>
      <div className="space-y-4">
        {data.map((activity, index) => (
          <div key={activity.id} className="relative">
            {index < data.length - 1 && (
              <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />
            )}
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                activity.status === 'completed' ? 'bg-green-100' :
                activity.status === 'processing' ? 'bg-blue-100' :
                activity.status === 'failed' ? 'bg-red-100' :
                'bg-gray-100'
              }`}>
                {activity.status === 'completed' ? (
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : activity.status === 'processing' ? (
                  <svg className="w-4 h-4 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : activity.status === 'failed' ? (
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/review/${activity.id}`}
                    className="text-sm font-semibold text-gray-900 hover:text-indigo-600 truncate"
                  >
                    {activity.repository_name || 'Untitled Repository'}
                  </Link>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {activity.completed_at 
                    ? `Completed ${formatRelativeTime(activity.completed_at)}`
                    : `Created ${formatRelativeTime(activity.created_at)}`
                  }
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

