import type { CoffeeLogWithBean } from './schemas/cafe';
import { getDaysAgo } from './date-utils';
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
 * Format brew ratio for display
 */
export function formatBrewRatio(doseGrams: number, yieldGrams: number | null): string {
  if (!yieldGrams) return `${doseGrams}g`;
  const ratio = (yieldGrams / doseGrams).toFixed(1);
  return `${doseGrams}g:${yieldGrams}g (1:${ratio})`;
}
