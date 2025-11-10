import { describe, expect, it } from 'vitest';
import dayjs, { DEFAULT_TIMEZONE } from '@/lib/dayjs-config';
import {
  buildCoffeeActivity,
  getCoffeeActivityMetrics,
  getCoffeeIntensityLevel,
} from './coffee-activity';

describe('coffee activity helpers', () => {
  it('fills missing days and aggregates counts chronologically', () => {
    const today = dayjs().tz(DEFAULT_TIMEZONE).startOf('day');
    const logs = [
      { brew_time: today.subtract(3, 'day').add(8, 'hour').toISOString() },
      { brew_time: today.subtract(1, 'day').add(9, 'hour').toISOString() },
      { brew_time: today.subtract(1, 'day').add(14, 'hour').toISOString() },
    ];

    const activities = buildCoffeeActivity(logs, 4);

    expect(activities).toHaveLength(4);
    expect(activities[0].count).toBe(1); // 3 days ago
    expect(activities[1].count).toBe(0); // 2 days ago
    expect(activities[2].count).toBe(2); // yesterday
    expect(activities[3].count).toBe(0); // today (no entries)
    expect(activities[2].level).toBe(2);
    expect(activities[0].level).toBe(1);
  });

  it('calculates intensity levels for varying counts', () => {
    expect(getCoffeeIntensityLevel(0)).toBe(0);
    expect(getCoffeeIntensityLevel(1)).toBe(1);
    expect(getCoffeeIntensityLevel(2)).toBe(2);
    expect(getCoffeeIntensityLevel(3)).toBe(3);
    expect(getCoffeeIntensityLevel(8)).toBe(3);
  });

  it('returns total coffees and streak metrics', () => {
    const today = dayjs().tz(DEFAULT_TIMEZONE);
    const logs = [
      { brew_time: today.toISOString() },
      { brew_time: today.subtract(1, 'day').toISOString() },
      { brew_time: today.subtract(3, 'day').toISOString() },
    ];

    const activities = buildCoffeeActivity(logs, 5);
    const metrics = getCoffeeActivityMetrics(activities);

    expect(metrics.totalCoffees).toBe(3);
    expect(metrics.currentStreak).toBeGreaterThanOrEqual(2);
    expect(metrics.longestStreak).toBeGreaterThanOrEqual(2);
  });
});
