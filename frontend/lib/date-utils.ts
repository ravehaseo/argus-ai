/** Date and timezone utilities for consistent date formatting. */

/**
 * Format a date string to the user's local timezone.
 * @param dateString - ISO date string from the backend
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string in user's local timezone
 */
export function formatDate(
  dateString: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }
): string {
  if (!dateString) return 'N/A';
  
  // Handle SSR - use default locale if navigator is not available
  if (typeof window === 'undefined') {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return new Intl.DateTimeFormat('en-US', options).format(date);
    } catch (error) {
      return 'Invalid date';
    }
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    // Use browser's locale and timezone
    const locale = navigator?.language || 'en-US';
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    return new Intl.DateTimeFormat(locale, {
      ...options,
      timeZone
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Format a date for display in lists (shorter format).
 * @param dateString - ISO date string from the backend
 * @returns Formatted date string
 */
export function formatDateShort(dateString: string | null | undefined): string {
  return formatDate(dateString, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format a date with time for display.
 * @param dateString - ISO date string from the backend
 * @returns Formatted date and time string
 */
export function formatDateTime(dateString: string | null | undefined): string {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}

/**
 * Format a date for chart labels (month and day only).
 * @param dateString - ISO date string from the backend
 * @returns Formatted date string for charts
 */
export function formatDateForChart(dateString: string | null | undefined): string {
  return formatDate(dateString, {
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get relative time (e.g., "2 hours ago", "3 days ago").
 * @param dateString - ISO date string from the backend
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    
    // For older dates, show actual date
    return formatDateShort(dateString);
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid date';
  }
}

/**
 * Get the user's timezone.
 * @returns User's timezone string (e.g., "America/New_York")
 */
export function getUserTimezone(): string {
  if (typeof window === 'undefined') {
    return 'UTC'; // Default for SSR
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Get timezone abbreviation (e.g., "EST", "PST").
 * @param dateString - Optional date string to get timezone for specific date
 * @returns Timezone abbreviation
 */
export function getTimezoneAbbr(dateString?: string): string {
  if (typeof window === 'undefined') {
    return 'UTC'; // Default for SSR
  }
  const date = dateString ? new Date(dateString) : new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZoneName: 'short',
    timeZone: getUserTimezone()
  });
  const parts = formatter.formatToParts(date);
  const timeZoneName = parts.find(part => part.type === 'timeZoneName');
  return timeZoneName?.value || '';
}

