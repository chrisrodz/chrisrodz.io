import { describe, it, expect } from 'vitest';
import type { GitHubContributionCalendar, ActivityData } from './github-api';
import {
  transformToActivityData,
  calculateCurrentStreak,
  calculateLongestStreak,
} from './github-api';
import { formatDateISO as formatLocalDate, getDaysAgo } from './date-utils';
import dayjs from './dayjs-config';

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
      const today = dayjs();
      const yesterday = getDaysAgo(1);
      const twoDaysAgo = getDaysAgo(2);

      const activities: ActivityData[] = [
        { date: formatLocalDate(twoDaysAgo), count: 5, level: 2 },
        { date: formatLocalDate(yesterday), count: 3, level: 2 },
        { date: formatLocalDate(today), count: 2, level: 1 },
      ];

      expect(calculateCurrentStreak(activities)).toBe(3);
    });

    it('should break streak if today has 0 contributions', () => {
      const today = dayjs();
      const yesterday = getDaysAgo(1);
      const twoDaysAgo = getDaysAgo(2);
      const threeDaysAgo = getDaysAgo(3);

      const activities: ActivityData[] = [
        { date: formatLocalDate(threeDaysAgo), count: 5, level: 2 },
        { date: formatLocalDate(twoDaysAgo), count: 4, level: 2 },
        { date: formatLocalDate(yesterday), count: 3, level: 2 },
        { date: formatLocalDate(today), count: 0, level: 0 },
      ];

      // Current streak is 0 because today has 0 contributions
      expect(calculateCurrentStreak(activities)).toBe(0);
    });

    it('should handle streak broken by gap in middle', () => {
      const today = dayjs();
      const yesterday = getDaysAgo(1);
      const twoDaysAgo = getDaysAgo(2);
      const fourDaysAgo = getDaysAgo(4);

      const activities: ActivityData[] = [
        { date: formatLocalDate(fourDaysAgo), count: 5, level: 2 },
        // Gap on day -3
        { date: formatLocalDate(twoDaysAgo), count: 3, level: 2 },
        { date: formatLocalDate(yesterday), count: 2, level: 1 },
        { date: formatLocalDate(today), count: 1, level: 1 },
      ];

      // Only last 3 days count
      expect(calculateCurrentStreak(activities)).toBe(3);
    });

    it('should return 0 if no recent contributions', () => {
      const fiveDaysAgo = getDaysAgo(5);

      const activities: ActivityData[] = [
        { date: formatLocalDate(fiveDaysAgo), count: 5, level: 2 },
      ];

      expect(calculateCurrentStreak(activities)).toBe(0);
    });

    it('should handle all days having contributions', () => {
      const activities: ActivityData[] = [];

      for (let i = 0; i < 10; i++) {
        const date = getDaysAgo(i);
        activities.push({
          date: formatLocalDate(date),
          count: i + 1,
          level: 1,
        });
      }

      expect(calculateCurrentStreak(activities)).toBe(10);
    });

    it('should handle single day with contribution', () => {
      const today = dayjs();
      const activities: ActivityData[] = [{ date: formatLocalDate(today), count: 5, level: 2 }];

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
});
