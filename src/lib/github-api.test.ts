import { describe, it, expect } from 'vitest';
import type { ActivityData } from './github-api';
import { calculateCurrentStreak, calculateLongestStreak, getMostActiveDay } from './github-api';

describe('GitHub API Statistics', () => {
  describe('calculateCurrentStreak', () => {
    it('should return 0 for empty activities', () => {
      expect(calculateCurrentStreak([])).toBe(0);
    });

    it('should return 0 when most recent day has no contributions', () => {
      const activities: ActivityData[] = [
        { date: '2024-01-01', count: 5, level: 2 },
        { date: '2024-01-02', count: 0, level: 0 },
        { date: '2024-01-03', count: 0, level: 0 },
      ];
      expect(calculateCurrentStreak(activities)).toBe(0);
    });

    it('should count consecutive days ending at most recent', () => {
      const activities: ActivityData[] = [
        { date: '2024-01-01', count: 0, level: 0 },
        { date: '2024-01-02', count: 3, level: 2 },
        { date: '2024-01-03', count: 5, level: 2 },
        { date: '2024-01-04', count: 2, level: 1 },
      ];
      expect(calculateCurrentStreak(activities)).toBe(3);
    });

    it('should return 1 for single day streak', () => {
      const activities: ActivityData[] = [
        { date: '2024-01-01', count: 0, level: 0 },
        { date: '2024-01-02', count: 5, level: 2 },
      ];
      expect(calculateCurrentStreak(activities)).toBe(1);
    });

    it('should handle all days with contributions', () => {
      const activities: ActivityData[] = [
        { date: '2024-01-01', count: 1, level: 1 },
        { date: '2024-01-02', count: 2, level: 1 },
        { date: '2024-01-03', count: 3, level: 2 },
      ];
      expect(calculateCurrentStreak(activities)).toBe(3);
    });
  });

  describe('calculateLongestStreak', () => {
    it('should return 0 for empty activities', () => {
      expect(calculateLongestStreak([])).toBe(0);
    });

    it('should return 0 when no contributions', () => {
      const activities: ActivityData[] = [
        { date: '2024-01-01', count: 0, level: 0 },
        { date: '2024-01-02', count: 0, level: 0 },
        { date: '2024-01-03', count: 0, level: 0 },
      ];
      expect(calculateLongestStreak(activities)).toBe(0);
    });

    it('should find longest consecutive streak', () => {
      const activities: ActivityData[] = [
        { date: '2024-01-01', count: 5, level: 2 },
        { date: '2024-01-02', count: 3, level: 2 },
        { date: '2024-01-03', count: 0, level: 0 },
        { date: '2024-01-04', count: 2, level: 1 },
        { date: '2024-01-05', count: 4, level: 2 },
        { date: '2024-01-06', count: 1, level: 1 },
        { date: '2024-01-07', count: 0, level: 0 },
      ];
      expect(calculateLongestStreak(activities)).toBe(3); // Jan 4-6
    });

    it('should return streak length when all days have contributions', () => {
      const activities: ActivityData[] = [
        { date: '2024-01-01', count: 1, level: 1 },
        { date: '2024-01-02', count: 2, level: 1 },
        { date: '2024-01-03', count: 3, level: 2 },
      ];
      expect(calculateLongestStreak(activities)).toBe(3);
    });

    it('should handle multiple equal length streaks', () => {
      const activities: ActivityData[] = [
        { date: '2024-01-01', count: 1, level: 1 },
        { date: '2024-01-02', count: 2, level: 1 },
        { date: '2024-01-03', count: 0, level: 0 },
        { date: '2024-01-04', count: 3, level: 2 },
        { date: '2024-01-05', count: 4, level: 2 },
      ];
      expect(calculateLongestStreak(activities)).toBe(2);
    });
  });

  describe('getMostActiveDay', () => {
    it('should return "N/A" for empty activities', () => {
      expect(getMostActiveDay([])).toBe('N/A');
    });

    it('should return "N/A" when no contributions', () => {
      const activities: ActivityData[] = [
        { date: '2024-01-01', count: 0, level: 0 }, // Monday
        { date: '2024-01-02', count: 0, level: 0 }, // Tuesday
      ];
      expect(getMostActiveDay(activities)).toBe('N/A');
    });

    it('should find day with highest average contributions', () => {
      const activities: ActivityData[] = [
        { date: '2024-01-01', count: 2, level: 1 }, // Sunday (Jan 1, 2024)
        { date: '2024-01-02', count: 5, level: 2 }, // Monday
        { date: '2024-01-08', count: 4, level: 2 }, // Monday
        { date: '2024-01-09', count: 10, level: 4 }, // Tuesday
      ];
      expect(getMostActiveDay(activities)).toBe('Tuesday'); // Tuesday: 10/1 = 10 avg, Monday: (5+4)/2 = 4.5 avg
    });

    it('should handle single contribution day', () => {
      const activities: ActivityData[] = [
        { date: '2024-01-10', count: 5, level: 2 }, // Wednesday
      ];
      expect(getMostActiveDay(activities)).toBe('Wednesday');
    });

    it('should return correct day name for each weekday', () => {
      // Test that day names match actual dates
      const testCases = [
        { date: '2024-01-08', expected: 'Monday' },
        { date: '2024-01-09', expected: 'Tuesday' },
        { date: '2024-01-10', expected: 'Wednesday' },
        { date: '2024-01-11', expected: 'Thursday' },
        { date: '2024-01-12', expected: 'Friday' },
        { date: '2024-01-13', expected: 'Saturday' },
        { date: '2024-01-14', expected: 'Sunday' },
      ];

      testCases.forEach(({ date, expected }) => {
        const activities: ActivityData[] = [{ date, count: 5, level: 2 }];
        expect(getMostActiveDay(activities)).toBe(expected);
      });
    });
  });
});
