import type { CoffeeLogWithBean } from './schemas/cafe';

/**
 * Calculate statistics from coffee logs
 */
export function calculateStats(logs: CoffeeLogWithBean[]) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Total logs
  const totalLogs = logs.length;

  // Logs this week
  const logsThisWeek = logs.filter((log) => {
    const logDate = new Date(log.brew_time);
    return logDate >= oneWeekAgo;
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
export function getBrewMethodDistribution(logs: CoffeeLogWithBean[]) {
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
export function getQualityOverTime(logs: CoffeeLogWithBean[]) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Filter to last 30 days
  const recentLogs = logs.filter((log) => new Date(log.brew_time) >= thirtyDaysAgo);

  // Group by date
  const byDate = recentLogs.reduce(
    (acc, log) => {
      const date = new Date(log.brew_time).toLocaleDateString('en-US', {
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
export function getMostUsedBeans(logs: CoffeeLogWithBean[]) {
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
