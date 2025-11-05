import type { ActivityData } from './github-api';

/**
 * Calculate current streak of consecutive days with contributions
 * Counts backward from the most recent day in the activities
 */
export function calculateCurrentStreak(activities: ActivityData[]): number {
  if (activities.length === 0) return 0;

  // Sort by date ascending first to make logic easier
  const sorted = [...activities].sort((a, b) => a.date.localeCompare(b.date));

  let streak = 0;
  let lastDate: Date | null = null;

  // Go backwards through array (from most recent)
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].count === 0) break; // Stop at first day with no contributions

    if (lastDate !== null) {
      // Check if consecutive with previous day (next oldest day)
      const currentDate = new Date(sorted[i].date + 'T00:00:00Z');
      const expectedDate = new Date(lastDate);
      expectedDate.setUTCDate(expectedDate.getUTCDate() - 1);

      if (currentDate.toISOString().split('T')[0] !== expectedDate.toISOString().split('T')[0]) {
        break; // Stop if dates are not consecutive
      }
    }

    lastDate = new Date(sorted[i].date + 'T00:00:00Z');
    streak++;
  }

  return streak;
}

/**
 * Calculate longest consecutive streak of contribution days
 */
export function calculateLongestStreak(activities: ActivityData[]): number {
  if (activities.length === 0) return 0;

  const sorted = [...activities].sort((a, b) => a.date.localeCompare(b.date));

  let maxStreak = 0;
  let currentStreak = 0;
  let prevDate: Date | null = null;

  for (const activity of sorted) {
    if (activity.count === 0) {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 0;
      prevDate = null;
      continue;
    }

    const currentDate = new Date(activity.date);

    if (prevDate === null) {
      currentStreak = 1;
    } else {
      // Check if consecutive days
      const expectedDate = new Date(prevDate);
      expectedDate.setDate(expectedDate.getDate() + 1);

      if (currentDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }

    prevDate = currentDate;
  }

  return Math.max(maxStreak, currentStreak);
}

/**
 * Get the day of week with highest average contributions
 */
export function getMostActiveDay(activities: ActivityData[]): string {
  if (activities.length === 0) return '';

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayTotals: Record<number, number[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  };

  // Group contributions by day of week
  for (const activity of activities) {
    const date = new Date(activity.date + 'T00:00:00Z');
    const dayOfWeek = date.getUTCDay();
    dayTotals[dayOfWeek].push(activity.count);
  }

  // Calculate averages
  let maxAverage = 0;
  let mostActiveDayIndex = 0;

  for (let i = 0; i < 7; i++) {
    if (dayTotals[i].length > 0) {
      const average = dayTotals[i].reduce((a, b) => a + b, 0) / dayTotals[i].length;
      if (average > maxAverage) {
        maxAverage = average;
        mostActiveDayIndex = i;
      }
    }
  }

  return dayNames[mostActiveDayIndex];
}

/**
 * Get weekly pattern of average contributions by day of week
 */
export function getWeeklyPattern(activities: ActivityData[]): Record<string, number> {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayTotals: Record<number, number[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  };

  // Group contributions by day of week
  for (const activity of activities) {
    const date = new Date(activity.date + 'T00:00:00Z');
    const dayOfWeek = date.getUTCDay();
    dayTotals[dayOfWeek].push(activity.count);
  }

  // Calculate averages
  const pattern: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const dayName = dayNames[i];
    const values = dayTotals[i];
    pattern[dayName] =
      values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  }

  return pattern;
}

/**
 * Get the best week (highest total contributions) with start date
 */
export function getBestWeek(activities: ActivityData[]): { startDate: string; total: number } {
  if (activities.length === 0) {
    return { startDate: '', total: 0 };
  }

  // Group by week (Monday-Sunday)
  const weeks: Record<string, number> = {};
  const weekStartDates: Record<string, string> = {};

  for (const activity of activities) {
    const date = new Date(activity.date + 'T00:00:00Z');
    // Get Monday of week
    const dayOfWeek = date.getUTCDay();
    const diff = date.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(date.setUTCDate(diff));
    const weekKey = monday.toISOString().split('T')[0];

    weeks[weekKey] = (weeks[weekKey] || 0) + activity.count;
    weekStartDates[weekKey] = weekKey;
  }

  // Find week with max contributions
  let maxTotal = 0;
  let bestWeekStart = '';

  for (const [weekStart, total] of Object.entries(weeks)) {
    if (total > maxTotal) {
      maxTotal = total;
      bestWeekStart = weekStart;
    }
  }

  return {
    startDate: bestWeekStart,
    total: maxTotal,
  };
}

/**
 * Get recent activity (last 30 days)
 */
export function getRecentActivity(activities: ActivityData[]): {
  days: number;
  total: number;
  percentage: number;
} {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  let daysWithActivity = 0;
  let totalContributions = 0;

  for (const activity of activities) {
    const activityDate = new Date(activity.date + 'T00:00:00Z');
    if (activityDate >= thirtyDaysAgo && activityDate <= now) {
      if (activity.count > 0) {
        daysWithActivity++;
      }
      totalContributions += activity.count;
    }
  }

  const percentage = Math.round((daysWithActivity / 30) * 100);

  return {
    days: daysWithActivity,
    total: totalContributions,
    percentage,
  };
}

/**
 * Insights interface
 */
export interface ContributionInsights {
  mostActiveDay: string;
  bestWeek: { startDate: string; total: number };
  recentActivity: { days: number; total: number; percentage: number };
}

/**
 * Analyze contributions and generate insights
 */
export function analyzeContributions(activities: ActivityData[]): ContributionInsights {
  return {
    mostActiveDay: getMostActiveDay(activities),
    bestWeek: getBestWeek(activities),
    recentActivity: getRecentActivity(activities),
  };
}
