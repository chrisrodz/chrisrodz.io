import { describe, it, expect } from 'vitest';
import { formatBrewRatio, calculateStats, getBrewMethodDistribution } from './cafe-stats';
import type { CoffeeLogWithBean } from './schemas/cafe';

describe('formatBrewRatio', () => {
  it('should format ratio with both dose and yield', () => {
    const result = formatBrewRatio(18, 36);
    expect(result).toBe('18g:36g (1:2.0)');
  });

  it('should format ratio with only dose when yield is null', () => {
    const result = formatBrewRatio(18, null);
    expect(result).toBe('18g');
  });

  it('should calculate correct ratio for different values', () => {
    const result = formatBrewRatio(20, 50);
    expect(result).toBe('20g:50g (1:2.5)');
  });

  it('should handle 1:1 ratio', () => {
    const result = formatBrewRatio(15, 15);
    expect(result).toBe('15g:15g (1:1.0)');
  });
});

describe('calculateStats', () => {
  it('should return zeros for empty logs array', () => {
    const result = calculateStats([]);
    expect(result).toEqual({
      totalLogs: 0,
      logsThisWeek: 0,
      avgRating: '0.0',
    });
  });

  it('should calculate total logs correctly', () => {
    const mockLogs: CoffeeLogWithBean[] = [
      {
        id: '1',
        brew_time: new Date().toISOString(),
        brew_method: 'Espresso',
        quality_rating: 4,
        dose_grams: 18,
        yield_grams: 36,
        grind_setting: 20,
        bean_id: '1',
        created_at: new Date().toISOString(),
        notes: null,
        bean: null,
      },
      {
        id: '2',
        brew_time: new Date().toISOString(),
        brew_method: 'AeroPress',
        quality_rating: 5,
        dose_grams: 15,
        yield_grams: 250,
        grind_setting: 25,
        bean_id: '1',
        created_at: new Date().toISOString(),
        notes: null,
        bean: null,
      },
    ];

    const result = calculateStats(mockLogs);
    expect(result.totalLogs).toBe(2);
    expect(result.logsThisWeek).toBe(2);
    expect(result.avgRating).toBe('4.5');
  });

  it('should count logs from this week correctly', () => {
    const today = new Date();
    const tenDaysAgo = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000);

    const mockLogs: CoffeeLogWithBean[] = [
      {
        id: '1',
        brew_time: today.toISOString(),
        brew_method: 'Espresso',
        quality_rating: 4,
        dose_grams: 18,
        yield_grams: 36,
        grind_setting: 20,
        bean_id: '1',
        created_at: new Date().toISOString(),
        notes: null,
        bean: null,
      },
      {
        id: '2',
        brew_time: tenDaysAgo.toISOString(),
        brew_method: 'AeroPress',
        quality_rating: 5,
        dose_grams: 15,
        yield_grams: 250,
        grind_setting: 25,
        bean_id: '1',
        created_at: new Date().toISOString(),
        notes: null,
        bean: null,
      },
    ];

    const result = calculateStats(mockLogs);
    expect(result.totalLogs).toBe(2);
    expect(result.logsThisWeek).toBe(1); // Only today's log is within the week
  });
});

describe('getBrewMethodDistribution', () => {
  it('should return empty array for no logs', () => {
    const result = getBrewMethodDistribution([]);
    expect(result).toEqual([]);
  });

  it('should calculate distribution correctly', () => {
    const mockLogs: CoffeeLogWithBean[] = [
      {
        id: '1',
        brew_time: new Date().toISOString(),
        brew_method: 'Espresso',
        quality_rating: 4,
        dose_grams: 18,
        yield_grams: 36,
        grind_setting: 20,
        bean_id: '1',
        created_at: new Date().toISOString(),
        notes: null,
        bean: null,
      },
      {
        id: '2',
        brew_time: new Date().toISOString(),
        brew_method: 'Espresso',
        quality_rating: 5,
        dose_grams: 18,
        yield_grams: 36,
        grind_setting: 20,
        bean_id: '1',
        created_at: new Date().toISOString(),
        notes: null,
        bean: null,
      },
      {
        id: '3',
        brew_time: new Date().toISOString(),
        brew_method: 'AeroPress',
        quality_rating: 4,
        dose_grams: 15,
        yield_grams: 250,
        grind_setting: 25,
        bean_id: '1',
        created_at: new Date().toISOString(),
        notes: null,
        bean: null,
      },
    ];

    const result = getBrewMethodDistribution(mockLogs);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      method: 'Espresso',
      count: 2,
      percentage: 67, // 2/3 = 66.67, rounded to 67
    });
    expect(result[1]).toEqual({
      method: 'AeroPress',
      count: 1,
      percentage: 33, // 1/3 = 33.33, rounded to 33
    });
  });

  it('should sort methods by count descending', () => {
    const mockLogs: CoffeeLogWithBean[] = [
      {
        id: '1',
        brew_time: new Date().toISOString(),
        brew_method: 'AeroPress',
        quality_rating: 4,
        dose_grams: 15,
        yield_grams: 250,
        grind_setting: 25,
        bean_id: '1',
        created_at: new Date().toISOString(),
        notes: null,
        bean: null,
      },
      {
        id: '2',
        brew_time: new Date().toISOString(),
        brew_method: 'Espresso',
        quality_rating: 5,
        dose_grams: 18,
        yield_grams: 36,
        grind_setting: 20,
        bean_id: '1',
        created_at: new Date().toISOString(),
        notes: null,
        bean: null,
      },
      {
        id: '3',
        brew_time: new Date().toISOString(),
        brew_method: 'Espresso',
        quality_rating: 4,
        dose_grams: 18,
        yield_grams: 36,
        grind_setting: 20,
        bean_id: '1',
        created_at: new Date().toISOString(),
        notes: null,
        bean: null,
      },
      {
        id: '4',
        brew_time: new Date().toISOString(),
        brew_method: 'Espresso',
        quality_rating: 5,
        dose_grams: 18,
        yield_grams: 36,
        grind_setting: 20,
        bean_id: '1',
        created_at: new Date().toISOString(),
        notes: null,
        bean: null,
      },
    ];

    const result = getBrewMethodDistribution(mockLogs);
    expect(result[0].method).toBe('Espresso'); // Most frequent first
    expect(result[0].count).toBe(3);
  });
});
