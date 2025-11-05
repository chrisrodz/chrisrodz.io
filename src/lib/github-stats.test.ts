import { describe, it, expect } from 'vitest';
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  getMostActiveDay,
  getWeeklyPattern,
  getBestWeek,
  getRecentActivity,
  analyzeContributions,
} from './github-stats';
import type { ActivityData } from './github-api';

describe('calculateCurrentStreak', () => {
  it('should return 0 for empty activities', () => {
    expect(calculateCurrentStreak([])).toBe(0);
  });

  it('should return 0 if most recent day has no contributions', () => {
    const activities: ActivityData[] = [
      { date: '2025-01-01', count: 5, level: 3 },
      { date: '2025-01-02', count: 0, level: 0 }, // No contributions on most recent day
    ];
    expect(calculateCurrentStreak(activities)).toBe(0);
  });

  it('should calculate current streak ending at most recent day', () => {
    const activities: ActivityData[] = [
      { date: '2025-01-01', count: 0, level: 0 },
      { date: '2025-01-02', count: 5, level: 3 }, // Start of streak
      { date: '2025-01-03', count: 3, level: 2 },
      { date: '2025-01-04', count: 2, level: 1 }, // Most recent with contribution
    ];
    expect(calculateCurrentStreak(activities)).toBe(3);
  });

  it('should calculate current streak for consecutive recent days', () => {
    const activities: ActivityData[] = [
      { date: '2025-01-01', count: 1, level: 1 },
      { date: '2025-01-02', count: 5, level: 3 },
      { date: '2025-01-03', count: 3, level: 2 },
      { date: '2025-01-04', count: 2, level: 1 }, // All consecutive
    ];
    expect(calculateCurrentStreak(activities)).toBe(4);
  });

  it('should handle single day with contributions', () => {
    const activities: ActivityData[] = [{ date: '2025-01-01', count: 5, level: 3 }];
    expect(calculateCurrentStreak(activities)).toBe(1);
  });
});

describe('calculateLongestStreak', () => {
  it('should return 0 for empty activities', () => {
    expect(calculateLongestStreak([])).toBe(0);
  });

  it('should return 0 if no days with contributions', () => {
    const activities: ActivityData[] = [
      { date: '2025-01-01', count: 0, level: 0 },
      { date: '2025-01-02', count: 0, level: 0 },
    ];
    expect(calculateLongestStreak(activities)).toBe(0);
  });

  it('should find longest streak among multiple streaks', () => {
    const activities: ActivityData[] = [
      { date: '2025-01-01', count: 1, level: 1 },
      { date: '2025-01-02', count: 1, level: 1 },
      { date: '2025-01-03', count: 0, level: 0 },
      { date: '2025-01-04', count: 1, level: 1 },
      { date: '2025-01-05', count: 1, level: 1 },
      { date: '2025-01-06', count: 1, level: 1 },
      { date: '2025-01-07', count: 1, level: 1 },
    ];
    expect(calculateLongestStreak(activities)).toBe(4);
  });

  it('should handle all days with contributions', () => {
    const activities: ActivityData[] = [
      { date: '2025-01-01', count: 1, level: 1 },
      { date: '2025-01-02', count: 2, level: 1 },
      { date: '2025-01-03', count: 3, level: 2 },
    ];
    expect(calculateLongestStreak(activities)).toBe(3);
  });

  it('should handle single day with contributions', () => {
    const activities: ActivityData[] = [{ date: '2025-01-01', count: 5, level: 3 }];
    expect(calculateLongestStreak(activities)).toBe(1);
  });
});

describe('getMostActiveDay', () => {
  it('should return empty string for empty activities', () => {
    expect(getMostActiveDay([])).toBe('');
  });

  it('should return day with highest average contributions', () => {
    const activities: ActivityData[] = [
      { date: '2025-01-06', count: 5, level: 3 }, // Monday
      { date: '2025-01-07', count: 2, level: 1 }, // Tuesday
      { date: '2025-01-13', count: 10, level: 4 }, // Monday
      { date: '2025-01-14', count: 1, level: 1 }, // Tuesday
    ];
    const mostActive = getMostActiveDay(activities);
    expect(mostActive).toBe('Mon'); // Monday has average of 7.5
  });

  it('should handle single occurrence per day of week', () => {
    const activities: ActivityData[] = [
      { date: '2025-01-01', count: 5, level: 3 }, // Wednesday
      { date: '2025-01-02', count: 3, level: 2 }, // Thursday
      { date: '2025-01-03', count: 8, level: 4 }, // Friday
    ];
    const mostActive = getMostActiveDay(activities);
    expect(mostActive).toBe('Fri');
  });

  it('should return abbreviated day name', () => {
    const activities: ActivityData[] = [
      { date: '2025-01-06', count: 10, level: 4 }, // Monday
      { date: '2025-01-07', count: 2, level: 1 }, // Tuesday
    ];
    const result = getMostActiveDay(activities);
    expect(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']).toContain(result);
  });
});

describe('getWeeklyPattern', () => {
  it('should return object with all days and averages', () => {
    const activities: ActivityData[] = [
      { date: '2025-01-06', count: 4, level: 2 }, // Monday
      { date: '2025-01-13', count: 6, level: 3 }, // Monday
      { date: '2025-01-07', count: 2, level: 1 }, // Tuesday
    ];
    const pattern = getWeeklyPattern(activities);
    expect(pattern.Mon).toBe(5); // (4+6)/2
    expect(pattern.Tue).toBe(2);
  });

  it('should handle empty activities', () => {
    const pattern = getWeeklyPattern([]);
    expect(pattern.Mon).toBe(0);
    expect(pattern.Tue).toBe(0);
    expect(Object.keys(pattern)).toHaveLength(7);
  });
});

describe('getBestWeek', () => {
  it('should return week with highest total contributions', () => {
    const activities: ActivityData[] = [
      { date: '2025-01-01', count: 1, level: 1 }, // Week of Dec 30 - Jan 5
      { date: '2025-01-02', count: 1, level: 1 },
      { date: '2025-01-08', count: 5, level: 3 }, // Week of Jan 6 - Jan 12 (total: 15)
      { date: '2025-01-09', count: 5, level: 3 },
      { date: '2025-01-10', count: 5, level: 3 },
      { date: '2025-01-15', count: 2, level: 1 }, // Week of Jan 13 - Jan 19 (total: 2)
    ];
    const bestWeek = getBestWeek(activities);
    expect(bestWeek.total).toBe(15);
  });

  it('should return empty object for empty activities', () => {
    const bestWeek = getBestWeek([]);
    expect(bestWeek.total).toBe(0);
  });

  it('should include startDate and total in result', () => {
    const activities: ActivityData[] = [
      { date: '2025-01-06', count: 10, level: 4 },
      { date: '2025-01-07', count: 8, level: 3 },
      { date: '2025-01-08', count: 5, level: 3 },
    ];
    const bestWeek = getBestWeek(activities);
    expect(bestWeek.startDate).toBeDefined();
    expect(bestWeek.total).toBeGreaterThan(0);
  });
});

describe('getRecentActivity', () => {
  it('should calculate activity in last 30 days', () => {
    const today = new Date();
    const tenDaysAgo = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000);
    const beforeThirtyDays = new Date(today.getTime() - 35 * 24 * 60 * 60 * 1000);

    const activities: ActivityData[] = [
      { date: tenDaysAgo.toISOString().split('T')[0], count: 1, level: 1 },
      { date: today.toISOString().split('T')[0], count: 5, level: 3 },
      { date: beforeThirtyDays.toISOString().split('T')[0], count: 10, level: 4 },
    ];

    const recent = getRecentActivity(activities);
    expect(recent.days).toBe(2);
    expect(recent.total).toBe(6);
    expect(recent.percentage).toBeGreaterThan(0);
    expect(recent.percentage).toBeLessThanOrEqual(100);
  });

  it('should handle empty activities', () => {
    const recent = getRecentActivity([]);
    expect(recent.days).toBe(0);
    expect(recent.total).toBe(0);
    expect(recent.percentage).toBe(0);
  });

  it('should calculate correct percentage', () => {
    const today = new Date();
    const activities: ActivityData[] = [];

    // Add 15 days with contributions
    for (let i = 0; i < 15; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      activities.push({
        date: date.toISOString().split('T')[0],
        count: 1,
        level: 1,
      });
    }

    const recent = getRecentActivity(activities);
    expect(recent.days).toBe(15);
    expect(recent.percentage).toBe(50); // 15/30 = 50%
  });
});

describe('analyzeContributions', () => {
  it('should return complete insights object', () => {
    const today = new Date();
    const activities: ActivityData[] = [
      { date: '2025-01-06', count: 5, level: 3 }, // Monday
      { date: '2025-01-07', count: 2, level: 1 }, // Tuesday
      { date: '2025-01-08', count: 10, level: 4 }, // Wednesday (best week)
      { date: '2025-01-09', count: 3, level: 2 }, // Thursday
      { date: '2025-01-10', count: 4, level: 2 }, // Friday
      { date: '2025-01-13', count: 8, level: 3 }, // Monday
      { date: today.toISOString().split('T')[0], count: 5, level: 3 },
    ];

    const insights = analyzeContributions(activities);

    expect(insights.mostActiveDay).toBeDefined();
    expect(insights.bestWeek).toBeDefined();
    expect(insights.bestWeek.total).toBeGreaterThan(0);
    expect(insights.recentActivity).toBeDefined();
    expect(insights.recentActivity.days).toBeGreaterThanOrEqual(0);
  });

  it('should handle empty activities', () => {
    const insights = analyzeContributions([]);

    expect(insights.mostActiveDay).toBe('');
    expect(insights.bestWeek.total).toBe(0);
    expect(insights.recentActivity.days).toBe(0);
  });
});
