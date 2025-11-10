import dayjs, { DEFAULT_TIMEZONE } from './dayjs-config';
import { formatDateISO } from './date-utils';
import type { CoffeeLogRow } from './schemas/cafe';
import type { ActivityData } from './github-api';
import { calculateCurrentStreak, calculateLongestStreak } from './github-api';

/**
 * Number of days to show in the coffee intake calendar (matches GitHub-style year view)
 */
export const COFFEE_ACTIVITY_DAYS = 365;

/**
 * Shape of the metrics returned alongside the activity data
 */
export interface CoffeeActivityMetrics {
  totalCoffees: number;
  currentStreak: number;
  longestStreak: number;
}

/**
 * Build activity calendar data for the coffee tracker
 */
export function buildCoffeeActivity(
  logs: Array<Pick<CoffeeLogRow, 'brew_time'>>,
  days: number = COFFEE_ACTIVITY_DAYS
): ActivityData[] {
  if (days <= 0) return [];

  const today = dayjs().tz(DEFAULT_TIMEZONE).endOf('day');
  const startDate = today.subtract(days - 1, 'day').startOf('day');
  const counts = new Map<string, number>();

  for (const log of logs) {
    const logDate = dayjs(log.brew_time).tz(DEFAULT_TIMEZONE).startOf('day');
    if (logDate.isBefore(startDate) || logDate.isAfter(today)) continue;

    const dateKey = formatDateISO(logDate);
    counts.set(dateKey, (counts.get(dateKey) ?? 0) + 1);
  }

  const activities: ActivityData[] = [];

  for (let i = 0; i < days; i++) {
    const date = startDate.add(i, 'day');
    const isoDate = formatDateISO(date);
    const count = counts.get(isoDate) ?? 0;

    activities.push({
      date: isoDate,
      count,
      level: getCoffeeIntensityLevel(count),
    });
  }

  return activities;
}

/**
 * Calculate summary metrics for a coffee activity dataset
 */
export function getCoffeeActivityMetrics(activities: ActivityData[]): CoffeeActivityMetrics {
  const totalCoffees = activities.reduce((sum, activity) => sum + activity.count, 0);
  const currentStreak = calculateCurrentStreak(activities);
  const longestStreak = calculateLongestStreak(activities);

  return { totalCoffees, currentStreak, longestStreak };
}

/**
 * Determine the intensity level for a day's coffee intake
 */
export function getCoffeeIntensityLevel(count: number): ActivityData['level'] {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  return 3;
}
