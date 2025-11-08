import type { CoffeeLogWithBean, CoffeeBeanRow } from './schemas/cafe';
import { getDaysAgo, formatDate } from './date-utils';
import dayjs from './dayjs-config';

/**
 * Return type for calculateStats function
 */
export interface CafeStats {
  totalLogs: number;
  logsThisWeek: number;
  avgRating: string;
}

/**
 * Brew method distribution data point
 */
export interface BrewMethodData {
  method: string;
  count: number;
  percentage: number;
}

/**
 * Quality rating data point over time
 */
export interface QualityDataPoint {
  date: string;
  avgRating: number;
  count: number;
}

/**
 * Bean usage statistics
 */
export interface BeanUsage {
  bean: CoffeeBeanRow;
  count: number;
}

/**
 * Calculate statistics from coffee logs
 */
export function calculateStats(logs: CoffeeLogWithBean[]): CafeStats {
  const oneWeekAgo = getDaysAgo(7);

  // Total logs
  const totalLogs = logs.length;

  // Logs this week
  const logsThisWeek = logs.filter((log) => {
    const logDate = dayjs(log.brew_time);
    return logDate.isSameOrAfter(oneWeekAgo);
  }).length;

  // Average rating
  const totalRating = logs.reduce((sum, log) => sum + log.quality_rating, 0);
  const avgRating = totalLogs > 0 ? (totalRating / totalLogs).toFixed(1) : '0.0';

  return {
    totalLogs,
    logsThisWeek,
    avgRating,
  };
}

/**
 * Get brew method distribution
 */
export function getBrewMethodDistribution(logs: CoffeeLogWithBean[]): BrewMethodData[] {
  const distribution = logs.reduce(
    (acc, log) => {
      acc[log.brew_method] = (acc[log.brew_method] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Convert to array with percentages
  const total = logs.length;
  return Object.entries(distribution)
    .map(([method, count]) => ({
      method,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get quality ratings over time (last 30 days)
 */
export function getQualityOverTime(logs: CoffeeLogWithBean[]): QualityDataPoint[] {
  const thirtyDaysAgo = getDaysAgo(30);

  // Filter to last 30 days
  const recentLogs = logs.filter((log) => dayjs(log.brew_time).isSameOrAfter(thirtyDaysAgo));

  // Group by date
  const byDate = recentLogs.reduce(
    (acc, log) => {
      const date = formatDate(log.brew_time, 'en', {
        month: 'short',
        day: 'numeric',
      });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(log.quality_rating);
      return acc;
    },
    {} as Record<string, number[]>
  );

  // Calculate average rating per date
  return Object.entries(byDate)
    .map(([date, ratings]) => ({
      date,
      avgRating: ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
      count: ratings.length,
    }))
    .slice(-14); // Last 14 data points for readability
}

/**
 * Get most used beans
 */
export function getMostUsedBeans(logs: CoffeeLogWithBean[]): BeanUsage[] {
  // Count by bean
  const beanCounts = logs.reduce(
    (acc, log) => {
      if (log.bean?.bean_name) {
        const key = log.bean.bean_name;
        if (!acc[key]) {
          acc[key] = { bean: log.bean, count: 0 };
        }
        acc[key].count += 1;
      }
      return acc;
    },
    {} as Record<string, { bean: NonNullable<CoffeeLogWithBean['bean']>; count: number }>
  );

  // Convert to array and sort
  return Object.values(beanCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5
}

/**
 * Format brew ratio for display
 */
export function formatBrewRatio(doseGrams: number, yieldGrams: number | null): string {
  if (!yieldGrams) return `${doseGrams}g`;
  const ratio = (yieldGrams / doseGrams).toFixed(1);
  return `${doseGrams}g:${yieldGrams}g (1:${ratio})`;
}

/**
 * Activity data point for the coffee calendar
 */
export interface CoffeeActivityData {
  date: string; // YYYY-MM-DD format
  count: number; // Number of coffees brewed that day
  level: number; // 0-4 intensity level
}

/**
 * Transform coffee logs to activity calendar format
 * Compatible with react-activity-calendar library
 */
export function transformToActivityData(logs: CoffeeLogWithBean[]): CoffeeActivityData[] {
  // Group logs by date
  const byDate = logs.reduce(
    (acc, log) => {
      const date = dayjs(log.brew_time).format('YYYY-MM-DD');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Get date range for the last 365 days
  const today = dayjs();
  const oneYearAgo = today.subtract(365, 'day');
  const activities: CoffeeActivityData[] = [];

  // Generate all dates in the range
  let current = oneYearAgo;
  while (current.isSameOrBefore(today, 'day')) {
    const dateStr = current.format('YYYY-MM-DD');
    const count = byDate[dateStr] || 0;

    // Map count to intensity level (0-4)
    // 0 coffees = level 0
    // 1 coffee = level 1
    // 2 coffees = level 2
    // 3 coffees = level 3
    // 4+ coffees = level 4
    const level = Math.min(count, 4);

    activities.push({
      date: dateStr,
      count,
      level,
    });

    current = current.add(1, 'day');
  }

  return activities;
}

/**
 * Calculate current coffee streak (consecutive days with at least one coffee)
 */
export function calculateCurrentStreak(activities: CoffeeActivityData[]): number {
  const today = dayjs();
  let streak = 0;
  let current = today;

  // Check if today has any coffee, if not start from yesterday
  const todayActivity = activities.find((a) => a.date === today.format('YYYY-MM-DD'));
  if (!todayActivity || todayActivity.count === 0) {
    current = current.subtract(1, 'day');
  }

  // Count backwards while there are coffees
  while (current.isAfter(dayjs().subtract(365, 'day'))) {
    const dateStr = current.format('YYYY-MM-DD');
    const activity = activities.find((a) => a.date === dateStr);

    if (!activity || activity.count === 0) {
      break;
    }

    streak++;
    current = current.subtract(1, 'day');
  }

  return streak;
}

/**
 * Calculate longest coffee streak in the entire history
 */
export function calculateLongestStreak(activities: CoffeeActivityData[]): number {
  let longestStreak = 0;
  let currentStreak = 0;

  for (const activity of activities) {
    if (activity.count > 0) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return longestStreak;
}
