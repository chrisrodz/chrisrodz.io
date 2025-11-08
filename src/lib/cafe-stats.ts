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
