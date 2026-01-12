/**
 * Utility functions for exporting review data.
 */

import type { ReviewDetail, Finding } from '@/types';
import { formatDateTime } from './date-utils';

/**
 * Export review data as JSON.
 */
export function exportAsJSON(reviewDetail: ReviewDetail): void {
  const data = {
    review: {
      id: reviewDetail.review.id,
      repository_url: reviewDetail.review.repository_url,
      repository_name: reviewDetail.review.repository_name,
      status: reviewDetail.review.status,
      created_at: reviewDetail.review.created_at,
      completed_at: reviewDetail.review.completed_at,
    },
    result: reviewDetail.result ? {
      security_score: reviewDetail.result.security_score,
      quality_score: reviewDetail.result.quality_score,
      tech_debt_score: reviewDetail.result.tech_debt_score,
      summary: reviewDetail.result.summary,
      findings: reviewDetail.result.finding_objects || [],
      recommendations: reviewDetail.result.recommendations || [],
      created_at: reviewDetail.result.created_at,
    } : null,
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `review-${reviewDetail.review.repository_name || reviewDetail.review.id}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export findings as CSV.
 */
export function exportFindingsAsCSV(findings: Finding[]): void {
  if (!findings || findings.length === 0) {
    return;
  }

  const headers = ['Severity', 'Category', 'File Path', 'Line Number', 'Description', 'Suggested Fix'];
  const rows = findings.map(finding => [
    finding.severity || '',
    finding.category || '',
    finding.file_path || '',
    finding.line_number?.toString() || '',
    (finding.issue_description || '').replace(/"/g, '""'), // Escape quotes
    (finding.suggested_fix || '').replace(/"/g, '""'), // Escape quotes
  ]);

  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `findings-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy review summary to clipboard.
 */
export async function copyReviewToClipboard(reviewDetail: ReviewDetail): Promise<boolean> {
  try {
    const text = `Review: ${reviewDetail.review.repository_name || 'Untitled'}
Repository: ${reviewDetail.review.repository_url}
Status: ${reviewDetail.review.status}
Created: ${formatDateTime(reviewDetail.review.created_at)}
${reviewDetail.result ? `
Security Score: ${reviewDetail.result.security_score}
Quality Score: ${reviewDetail.result.quality_score}
Tech Debt Score: ${reviewDetail.result.tech_debt_score}

Summary:
${reviewDetail.result.summary || 'N/A'}

Findings: ${reviewDetail.result.finding_objects?.length || 0}
` : ''}`;

    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

