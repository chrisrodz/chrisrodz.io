import { describe, it, expect } from 'vitest';
import dayjs, { DEFAULT_TIMEZONE } from './dayjs-config';
import {
  formatDateISO,
  formatDate,
  formatTimeInPR,
  getStartOfToday,
  getDaysAgo,
  isSameDay,
  isWithinRange,
  parseDate,
} from './date-utils';

describe('date-utils', () => {
  describe('formatDateISO', () => {
    it('formats Date object as YYYY-MM-DD', () => {
      const date = dayjs('2025-03-15T14:30:00Z').toDate();
      expect(formatDateISO(date)).toBe('2025-03-15');
    });

    it('formats ISO string as YYYY-MM-DD', () => {
      expect(formatDateISO('2025-03-15T14:30:00Z')).toBe('2025-03-15');
    });

    it('formats dayjs object as YYYY-MM-DD', () => {
      const date = dayjs('2025-03-15');
      expect(formatDateISO(date)).toBe('2025-03-15');
    });
  });

  describe('formatDate', () => {
    it('formats date with Spanish locale and short month', () => {
      const date = dayjs('2025-03-15').toDate();
      const result = formatDate(date, 'es', { month: 'short', day: 'numeric' });
      expect(result).toContain('mar'); // Spanish abbreviation
    });

    it('formats date with English locale and long month', () => {
      const date = dayjs('2025-03-15').toDate();
      const result = formatDate(date, 'en', { month: 'long', day: 'numeric' });
      expect(result).toContain('March');
    });

    it('formats date with full format', () => {
      const date = dayjs('2025-03-15');
      const result = formatDate(date, 'en', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      expect(result).toContain('March');
      expect(result).toContain('15');
      expect(result).toContain('2025');
    });

    it('uses default format when no options provided', () => {
      const date = dayjs('2025-03-15').toDate();
      const result = formatDate(date, 'en');
      expect(result).toBeTruthy();
    });
  });

  describe('formatTimeInPR', () => {
    it('formats time in Puerto Rico timezone', () => {
      const date = '2025-03-15T14:30:00Z';
      const result = formatTimeInPR(date, 'en');
      // Should format to PR time (AST, UTC-4)
      expect(result).toMatch(/\d{1,2}:\d{2} [AP]M/);
    });

    it('defaults to Spanish locale', () => {
      const date = '2025-03-15T14:30:00Z';
      const result = formatTimeInPR(date);
      expect(result).toMatch(/\d{1,2}:\d{2} [AP]M/);
    });
  });

  describe('getStartOfToday', () => {
    it('returns start of today', () => {
      const result = getStartOfToday();
      expect(result.hour()).toBe(0);
      expect(result.minute()).toBe(0);
      expect(result.second()).toBe(0);
      expect(result.millisecond()).toBe(0);
    });
  });

  describe('getDaysAgo', () => {
    it('returns date 7 days ago', () => {
      const result = getDaysAgo(7);
      const expected = dayjs().tz(DEFAULT_TIMEZONE).subtract(7, 'days');
      expect(result.format('YYYY-MM-DD')).toBe(expected.format('YYYY-MM-DD'));
    });

    it('returns date 30 days ago', () => {
      const result = getDaysAgo(30);
      const expected = dayjs().tz(DEFAULT_TIMEZONE).subtract(30, 'days');
      expect(result.format('YYYY-MM-DD')).toBe(expected.format('YYYY-MM-DD'));
    });
  });

  describe('isSameDay', () => {
    it('returns true for same calendar day', () => {
      const date1 = '2025-03-15T08:00:00Z';
      const date2 = '2025-03-15T20:00:00Z';
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('returns false for different days', () => {
      const date1 = '2025-03-15T23:59:00Z';
      const date2 = '2025-03-16T00:01:00Z';
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('works with Date objects', () => {
      const date1 = dayjs('2025-03-15T10:00:00Z').toDate();
      const date2 = dayjs('2025-03-15T18:00:00Z').toDate();
      expect(isSameDay(date1, date2)).toBe(true);
    });
  });

  describe('isWithinRange', () => {
    it('returns true for date within range', () => {
      const date = '2025-03-15';
      const start = '2025-03-10';
      const end = '2025-03-20';
      expect(isWithinRange(date, start, end)).toBe(true);
    });

    it('returns false for date before range', () => {
      const date = '2025-03-05';
      const start = '2025-03-10';
      const end = '2025-03-20';
      expect(isWithinRange(date, start, end)).toBe(false);
    });

    it('returns false for date after range', () => {
      const date = '2025-03-25';
      const start = '2025-03-10';
      const end = '2025-03-20';
      expect(isWithinRange(date, start, end)).toBe(false);
    });

    it('returns true for date at start boundary', () => {
      const date = '2025-03-10';
      const start = '2025-03-10';
      const end = '2025-03-20';
      expect(isWithinRange(date, start, end)).toBe(true);
    });

    it('returns true for date at end boundary', () => {
      const date = '2025-03-20';
      const start = '2025-03-10';
      const end = '2025-03-20';
      expect(isWithinRange(date, start, end)).toBe(true);
    });
  });

  describe('parseDate', () => {
    it('parses valid YYYY-MM-DD string', () => {
      const result = parseDate('2025-03-15');
      expect(result?.format('YYYY-MM-DD')).toBe('2025-03-15');
    });

    it('returns null for invalid month', () => {
      expect(parseDate('2025-13-15')).toBeNull();
    });

    it('returns null for invalid day', () => {
      expect(parseDate('2025-02-30')).toBeNull();
    });

    it('returns null for completely invalid date', () => {
      expect(parseDate('not-a-date')).toBeNull();
    });

    it('returns null for wrong format', () => {
      expect(parseDate('03/15/2025')).toBeNull();
    });

    it('validates leap year correctly', () => {
      expect(parseDate('2024-02-29')).not.toBeNull(); // 2024 is leap year
      expect(parseDate('2025-02-29')).toBeNull(); // 2025 is not leap year
    });
  });
});
