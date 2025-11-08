import dayjs, { DEFAULT_TIMEZONE, DATE_FORMAT_ISO } from './dayjs-config';
import type { Locale } from './i18n';
import type { Dayjs } from 'dayjs';

/**
 * Format date in YYYY-MM-DD format (replaces formatLocalDate in github-api.ts)
 */
export function formatDateISO(date: Date | string | Dayjs): string {
  return dayjs(date).format(DATE_FORMAT_ISO);
}

/**
 * Format date with locale-aware formatting (replaces i18n.formatDate)
 */
export function formatDate(
  date: Date | string | Dayjs,
  locale: Locale,
  options?: {
    year?: 'numeric' | '2-digit';
    month?: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long';
    day?: 'numeric' | '2-digit';
  }
): string {
  const d = dayjs(date).locale(locale === 'es' ? 'es' : 'en');

  // Map Intl options to dayjs format tokens
  const parts: string[] = [];

  if (options?.month === 'long') parts.push('MMMM');
  else if (options?.month === 'short') parts.push('MMM');
  else if (options?.month === 'numeric') parts.push('M');

  if (options?.day === 'numeric') parts.push('D');

  if (options?.year === 'numeric') parts.push('YYYY');

  const format = parts.join(' ');
  return d.format(format || 'MMM D, YYYY');
}

/**
 * Format time in Puerto Rico timezone (consolidates RecentLogs + TodaysCoffeeCard)
 */
export function formatTimeInPR(date: Date | string, locale: Locale = 'es'): string {
  return dayjs(date)
    .tz(DEFAULT_TIMEZONE)
    .locale(locale === 'es' ? 'es' : 'en')
    .format('h:mm A');
}

/**
 * Get start of today in local timezone
 */
export function getStartOfToday(): Dayjs {
  return dayjs().startOf('day');
}

/**
 * Get date N days ago
 */
export function getDaysAgo(days: number): Dayjs {
  return dayjs().subtract(days, 'days');
}

/**
 * Check if date is same day as another date
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  return dayjs(date1).utc().isSame(dayjs(date2).utc(), 'day');
}

/**
 * Check if date is within range
 */
export function isWithinRange(
  date: Date | string,
  start: Date | string,
  end: Date | string
): boolean {
  const d = dayjs(date);
  return d.isSameOrAfter(dayjs(start)) && d.isSameOrBefore(dayjs(end));
}

/**
 * Parse YYYY-MM-DD string strictly
 */
export function parseDate(dateString: string): Dayjs | null {
  const parsed = dayjs(dateString, DATE_FORMAT_ISO, true);
  return parsed.isValid() ? parsed : null;
}
