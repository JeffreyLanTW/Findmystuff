import { formatDistanceToNow, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * Format a timestamp to relative time (e.g., "2 hours ago")
 */
export const formatTimeAgo = (timestamp: number): string => {
  return formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
    locale: zhCN,
  });
};

/**
 * Format a timestamp to readable date (e.g., "Nov 24, 2025")
 */
export const formatDate = (timestamp: number): string => {
  return format(new Date(timestamp), 'MMM dd, yyyy');
};

/**
 * Format a timestamp to full datetime (e.g., "Nov 24, 2025 at 2:30 PM")
 */
export const formatDateTime = (timestamp: number): string => {
  return format(new Date(timestamp), 'MMM dd, yyyy \'at\' h:mm a');
};

/**
 * Truncate text to a maximum length with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format bytes to human-readable size (e.g., "2.5 MB")
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
