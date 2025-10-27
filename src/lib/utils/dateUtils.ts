/**
 * Date & Time Utility Functions
 * 
 * Shared utility functions for formatting dates and times across MoSurveys.
 * Centralizing these functions ensures consistent date formatting throughout the app.
 */

/**
 * Formats a timestamp into a human-readable "time ago" string
 * 
 * @example
 * formatTimeAgo('2024-01-15T10:30:00Z') // "2 hours ago"
 * formatTimeAgo('2024-01-14T10:30:00Z') // "1 day ago"
 * 
 * @param timestamp - ISO timestamp string
 * @param options - Formatting options
 * @returns Human-readable time ago string
 */
export function formatTimeAgo(
  timestamp: string,
  options: {
    shortFormat?: boolean; // "2h ago" vs "2 hours ago"
    includeSeconds?: boolean; // Include "just now" for < 1 min
  } = {}
): string {
  const { shortFormat = false, includeSeconds = true } = options;

  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Just now (< 1 minute)
  if (includeSeconds && diffMins < 1) {
    return 'Just now';
  }

  // Minutes
  if (diffMins < 60) {
    if (shortFormat) {
      return `${diffMins}m ago`;
    }
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  }

  // Hours
  if (diffHours < 24) {
    if (shortFormat) {
      return `${diffHours}h ago`;
    }
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  }

  // Days
  if (shortFormat) {
    return `${diffDays}d ago`;
  }
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}

/**
 * Formats a date to a localized string
 * 
 * @example
 * formatDate('2024-01-15T10:30:00Z') // "Jan 15, 2024"
 * formatDate('2024-01-15T10:30:00Z', { includeTime: true }) // "Jan 15, 2024, 10:30 AM"
 */
export function formatDate(
  timestamp: string,
  options: {
    includeTime?: boolean;
    includeYear?: boolean;
  } = {}
): string {
  const { includeTime = false, includeYear = true } = options;

  const date = new Date(timestamp);
  
  const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  };

  if (includeYear) {
    dateOptions.year = 'numeric';
  }

  if (includeTime) {
    dateOptions.hour = 'numeric';
    dateOptions.minute = '2-digit';
  }

  return date.toLocaleString('en-US', dateOptions);
}

/**
 * Formats a date to ISO date string (YYYY-MM-DD)
 * Useful for file names and API calls
 * 
 * @example
 * formatISODate('2024-01-15T10:30:00Z') // "2024-01-15"
 */
export function formatISODate(timestamp: string): string {
  return new Date(timestamp).toISOString().split('T')[0];
}

