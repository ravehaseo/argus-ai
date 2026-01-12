'use client';

import Link from 'next/link';

interface RepoData {
  repository_name: string;
  repository_url: string;
  review_count: number;
  avg_security: number | null;
  avg_quality: number | null;
  avg_tech_debt: number | null;
}

interface MostReviewedReposProps {
  data: RepoData[];
}

export default function MostReviewedRepos({ data }: MostReviewedReposProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Most Reviewed Repositories</h3>
        <p className="text-gray-500 text-center py-8">No repository data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Most Reviewed Repositories</h3>
        <p className="text-sm text-gray-500">Top repositories by review count</p>
      </div>
      <div className="space-y-3">
        {data.map((repo, index) => (
          <div
            key={repo.repository_url || index}
            className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                    {index + 1}
                  </span>
                  {repo.repository_url ? (
                    <Link
                      href={repo.repository_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-gray-900 hover:text-indigo-600 truncate"
                    >
                      {repo.repository_name}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {repo.repository_name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {repo.review_count} {repo.review_count === 1 ? 'review' : 'reviews'}
                  </span>
                </div>
              </div>
              {repo.avg_security !== null && (
                <div className="flex items-center gap-3 ml-4">
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Avg Scores</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-red-600">{repo.avg_security}</span>
                      <span className="text-xs font-semibold text-blue-600">{repo.avg_quality}</span>
                      <span className="text-xs font-semibold text-yellow-600">{repo.avg_tech_debt}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

