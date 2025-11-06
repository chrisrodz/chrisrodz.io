import { describe, it, expect } from 'vitest';
import type { GitHubContributionCalendar, ActivityData } from './github-api';
import {
  transformToActivityData,
  calculateCurrentStreak,
  calculateLongestStreak,
  getMostActiveDay,
} from './github-api';

describe('GitHub API Module', () => {
  describe('transformToActivityData', () => {
    it('should handle empty calendar', () => {
      const calendar: GitHubContributionCalendar = {
        totalContributions: 0,
        weeks: [],
      };

      const result = transformToActivityData(calendar);
      expect(result).toEqual([]);
    });

    it('should transform single week with contributions', () => {
      const calendar: GitHubContributionCalendar = {
        totalContributions: 10,
        weeks: [
          {
            contributionDays: [
              { date: '2025-01-01', contributionCount: 0 },
              { date: '2025-01-02', contributionCount: 5 },
              { date: '2025-01-03', contributionCount: 3 },
            ],
          },
        ],
      };

      const result = transformToActivityData(calendar);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ date: '2025-01-01', count: 0, level: 0 });
      expect(result[1]).toEqual({ date: '2025-01-02', count: 5, level: 2 });
      expect(result[2]).toEqual({ date: '2025-01-03', count: 3, level: 2 });
    });

    it('should transform multiple weeks', () => {
      const calendar: GitHubContributionCalendar = {
        totalContributions: 30,
        weeks: [
          {
            contributionDays: [
              { date: '2025-01-01', contributionCount: 10 },
              { date: '2025-01-02', contributionCount: 15 },
            ],
          },
          {
            contributionDays: [{ date: '2025-01-08', contributionCount: 5 }],
          },
        ],
      };

      const result = transformToActivityData(calendar);
      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2025-01-01');
      expect(result[1].date).toBe('2025-01-02');
      expect(result[2].date).toBe('2025-01-08');
    });

    it('should assign correct contribution levels', () => {
      const calendar: GitHubContributionCalendar = {
        totalContributions: 30,
        weeks: [
          {
            contributionDays: [
              { date: '2025-01-01', contributionCount: 0 }, // level 0
              { date: '2025-01-02', contributionCount: 1 }, // level 1
              { date: '2025-01-03', contributionCount: 3 }, // level 2
              { date: '2025-01-04', contributionCount: 6 }, // level 3
              { date: '2025-01-05', contributionCount: 10 }, // level 4
            ],
          },
        ],
      };

      const result = transformToActivityData(calendar);
      expect(result[0].level).toBe(0);
      expect(result[1].level).toBe(1);
      expect(result[2].level).toBe(2);
      expect(result[3].level).toBe(3);
      expect(result[4].level).toBe(4);
    });
  });

  describe('calculateCurrentStreak', () => {
    it('should return 0 for empty activities', () => {
      expect(calculateCurrentStreak([])).toBe(0);
    });

    it('should count streak ending today with contributions', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(today.getDate() - 2);

      const activities: ActivityData[] = [
        { date: twoDaysAgo.toISOString().split('T')[0], count: 5, level: 2 },
        { date: yesterday.toISOString().split('T')[0], count: 3, level: 2 },
        { date: today.toISOString().split('T')[0], count: 2, level: 1 },
      ];

      expect(calculateCurrentStreak(activities)).toBe(3);
    });

    it('should not break streak if today has 0 contributions', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(today.getDate() - 2);
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(today.getDate() - 3);

      const activities: ActivityData[] = [
        { date: threeDaysAgo.toISOString().split('T')[0], count: 5, level: 2 },
        { date: twoDaysAgo.toISOString().split('T')[0], count: 4, level: 2 },
        { date: yesterday.toISOString().split('T')[0], count: 3, level: 2 },
        { date: today.toISOString().split('T')[0], count: 0, level: 0 },
      ];

      // Should count yesterday's streak (3 days) without breaking due to today
      expect(calculateCurrentStreak(activities)).toBe(3);
    });

    it('should handle streak broken by gap in middle', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(today.getDate() - 2);
      const fourDaysAgo = new Date(today);
      fourDaysAgo.setDate(today.getDate() - 4);

      const activities: ActivityData[] = [
        { date: fourDaysAgo.toISOString().split('T')[0], count: 5, level: 2 },
        // Gap on day -3
        { date: twoDaysAgo.toISOString().split('T')[0], count: 3, level: 2 },
        { date: yesterday.toISOString().split('T')[0], count: 2, level: 1 },
        { date: today.toISOString().split('T')[0], count: 1, level: 1 },
      ];

      // Only last 3 days count
      expect(calculateCurrentStreak(activities)).toBe(3);
    });

    it('should return 0 if no recent contributions', () => {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      const activities: ActivityData[] = [
        { date: fiveDaysAgo.toISOString().split('T')[0], count: 5, level: 2 },
      ];

      expect(calculateCurrentStreak(activities)).toBe(0);
    });

    it('should handle all days having contributions', () => {
      const today = new Date();
      const activities: ActivityData[] = [];

      for (let i = 0; i < 10; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        activities.push({
          date: date.toISOString().split('T')[0],
          count: i + 1,
          level: 1,
        });
      }

      expect(calculateCurrentStreak(activities)).toBe(10);
    });

    it('should handle single day with contribution', () => {
      const today = new Date();
      const activities: ActivityData[] = [
        { date: today.toISOString().split('T')[0], count: 5, level: 2 },
      ];

      expect(calculateCurrentStreak(activities)).toBe(1);
    });
  });

  describe('calculateLongestStreak', () => {
    it('should return 0 for empty activities', () => {
      expect(calculateLongestStreak([])).toBe(0);
    });

    it('should calculate longest streak with single continuous period', () => {
      const activities: ActivityData[] = [
        { date: '2025-01-01', count: 5, level: 2 },
        { date: '2025-01-02', count: 3, level: 2 },
        { date: '2025-01-03', count: 2, level: 1 },
        { date: '2025-01-04', count: 1, level: 1 },
      ];

      expect(calculateLongestStreak(activities)).toBe(4);
    });

    it('should break streak on days with 0 contributions', () => {
      const activities: ActivityData[] = [
        { date: '2025-01-01', count: 5, level: 2 },
        { date: '2025-01-02', count: 3, level: 2 },
        { date: '2025-01-03', count: 0, level: 0 }, // Break
        { date: '2025-01-04', count: 4, level: 2 },
        { date: '2025-01-05', count: 2, level: 1 },
      ];

      expect(calculateLongestStreak(activities)).toBe(2);
    });

    it('should find longest among multiple streaks', () => {
      const activities: ActivityData[] = [
        { date: '2025-01-01', count: 5, level: 2 },
        { date: '2025-01-02', count: 3, level: 2 },
        { date: '2025-01-03', count: 0, level: 0 }, // Break
        { date: '2025-01-04', count: 4, level: 2 },
        { date: '2025-01-05', count: 2, level: 1 },
        { date: '2025-01-06', count: 1, level: 1 },
        { date: '2025-01-07', count: 0, level: 0 }, // Break
        { date: '2025-01-08', count: 6, level: 3 },
      ];

      // Longest streak is 3 days (Jan 4-6)
      expect(calculateLongestStreak(activities)).toBe(3);
    });

    it('should handle single day streak', () => {
      const activities: ActivityData[] = [
        { date: '2025-01-01', count: 0, level: 0 },
        { date: '2025-01-02', count: 5, level: 2 },
        { date: '2025-01-03', count: 0, level: 0 },
      ];

      expect(calculateLongestStreak(activities)).toBe(1);
    });

    it('should handle all days with 0 contributions', () => {
      const activities: ActivityData[] = [
        { date: '2025-01-01', count: 0, level: 0 },
        { date: '2025-01-02', count: 0, level: 0 },
        { date: '2025-01-03', count: 0, level: 0 },
      ];

      expect(calculateLongestStreak(activities)).toBe(0);
    });

    it('should handle entire year with contributions', () => {
      const activities: ActivityData[] = [];
      for (let i = 1; i <= 365; i++) {
        activities.push({
          date: `2025-${String(Math.floor((i - 1) / 31) + 1).padStart(2, '0')}-${String(((i - 1) % 31) + 1).padStart(2, '0')}`,
          count: 1,
          level: 1,
        });
      }

      expect(calculateLongestStreak(activities)).toBe(365);
    });

    it('should work with unsorted input', () => {
      const activities: ActivityData[] = [
        { date: '2025-01-05', count: 2, level: 1 },
        { date: '2025-01-01', count: 5, level: 2 },
        { date: '2025-01-03', count: 0, level: 0 },
        { date: '2025-01-02', count: 3, level: 2 },
        { date: '2025-01-04', count: 4, level: 2 },
      ];

      // Should sort and find longest streak (2 days: Jan 1-2)
      expect(calculateLongestStreak(activities)).toBe(2);
    });
  });

  describe('getMostActiveDay', () => {
    it('should return sunday for empty activities', () => {
      expect(getMostActiveDay([])).toBe('sunday');
    });

    it('should identify most active day with single week', () => {
      const activities: ActivityData[] = [
        { date: '2025-01-06', count: 1, level: 1 }, // Sunday (in UTC, gets shifted to Saturday in AST)
        { date: '2025-01-07', count: 10, level: 4 }, // Monday (most active)
        { date: '2025-01-08', count: 2, level: 1 }, // Tuesday
      ];

      expect(getMostActiveDay(activities)).toBe('monday');
    });

    it('should calculate average across multiple weeks', () => {
      const activities: ActivityData[] = [
        // Week 1
        { date: '2025-01-05', count: 5, level: 2 }, // Sunday
        { date: '2025-01-06', count: 10, level: 4 }, // Monday
        // Week 2
        { date: '2025-01-12', count: 3, level: 2 }, // Sunday
        { date: '2025-01-13', count: 20, level: 4 }, // Monday
      ];

      // Monday avg: (10 + 20) / 2 = 15
      // Sunday avg: (5 + 3) / 2 = 4
      expect(getMostActiveDay(activities)).toBe('monday');
    });

    it('should handle ties by returning first day', () => {
      const activities: ActivityData[] = [
        { date: '2025-01-05', count: 5, level: 2 }, // Sunday
        { date: '2025-01-06', count: 5, level: 2 }, // Monday
        { date: '2025-01-07', count: 5, level: 2 }, // Tuesday
      ];

      // All have same average, should return Sunday (first in week)
      expect(getMostActiveDay(activities)).toBe('sunday');
    });

    it('should work across different months', () => {
      const activities: ActivityData[] = [
        { date: '2025-01-01', count: 1, level: 1 }, // Wednesday
        { date: '2025-01-08', count: 2, level: 1 }, // Wednesday
        { date: '2025-02-05', count: 9, level: 3 }, // Wednesday
        { date: '2025-02-06', count: 3, level: 2 }, // Thursday
      ];

      // Wednesday avg: (1 + 2 + 9) / 3 = 4
      // Thursday avg: 3 / 1 = 3
      expect(getMostActiveDay(activities)).toBe('wednesday');
    });

    it('should handle single day', () => {
      const activities: ActivityData[] = [
        { date: '2025-01-10', count: 10, level: 4 }, // Friday
      ];

      expect(getMostActiveDay(activities)).toBe('friday');
    });

    it('should correctly identify all days of week', () => {
      // Test each day can be identified as most active
      const daysOfWeek = [
        { date: '2025-01-05', day: 'sunday' },
        { date: '2025-01-06', day: 'monday' },
        { date: '2025-01-07', day: 'tuesday' },
        { date: '2025-01-08', day: 'wednesday' },
        { date: '2025-01-09', day: 'thursday' },
        { date: '2025-01-10', day: 'friday' },
        { date: '2025-01-11', day: 'saturday' },
      ];

      for (const { date, day } of daysOfWeek) {
        const activities: ActivityData[] = [
          { date, count: 10, level: 4 },
          { date: '2025-01-01', count: 1, level: 1 }, // Wednesday with low count
        ];
        expect(getMostActiveDay(activities)).toBe(day);
      }
    });
  });
});
