import { describe, it, expect, beforeEach } from 'vitest';
import {
  getRateLimitState,
  recordFailedAttempt,
  resetRateLimit,
  type RateLimiterOptions,
} from './rate-limit';

describe('rate-limit', () => {
  const options: RateLimiterOptions = {
    maxAttempts: 3,
    windowMs: 1000,
    cooldownMs: 5000,
  };

  beforeEach(() => {
    // Clear rate limit state between tests
    resetRateLimit('test-key');
  });

  describe('getRateLimitState', () => {
    it('should allow requests with full remaining attempts initially', () => {
      const state = getRateLimitState('test-key', options, 0);

      expect(state.allowed).toBe(true);
      expect(state.remaining).toBe(3);
      expect(state.blockedUntil).toBeUndefined();
      expect(state.retryAfter).toBeUndefined();
    });

    it('should return correct state after failures are recorded', () => {
      recordFailedAttempt('test-key', options, 0);
      recordFailedAttempt('test-key', options, 100);

      const state = getRateLimitState('test-key', options, 200);

      expect(state.allowed).toBe(true);
      expect(state.remaining).toBe(1);
    });

    it('should prune old failures outside the rolling window', () => {
      recordFailedAttempt('test-key', options, 0);
      recordFailedAttempt('test-key', options, 100);

      // Check state after window has expired (1000ms + 100ms)
      const state = getRateLimitState('test-key', options, 1101);

      expect(state.allowed).toBe(true);
      expect(state.remaining).toBe(3); // All failures pruned
    });
  });

  describe('recordFailedAttempt', () => {
    it('should decrease remaining attempts with each failure', () => {
      const state1 = recordFailedAttempt('test-key', options, 0);
      expect(state1.allowed).toBe(true);
      expect(state1.remaining).toBe(2);

      const state2 = recordFailedAttempt('test-key', options, 100);
      expect(state2.allowed).toBe(true);
      expect(state2.remaining).toBe(1);
    });

    it('should block requests after max attempts are exceeded', () => {
      recordFailedAttempt('test-key', options, 0);
      recordFailedAttempt('test-key', options, 100);
      const state = recordFailedAttempt('test-key', options, 200);

      expect(state.allowed).toBe(false);
      expect(state.remaining).toBe(0);
      expect(state.blockedUntil).toBe(5200); // 200 + 5000 cooldownMs
      expect(state.retryAfter).toBe(5000);
    });

    it('should keep requests blocked during cooldown period', () => {
      recordFailedAttempt('test-key', options, 0);
      recordFailedAttempt('test-key', options, 100);
      recordFailedAttempt('test-key', options, 200);

      // Try again during cooldown
      const state = getRateLimitState('test-key', options, 3000);

      expect(state.allowed).toBe(false);
      expect(state.remaining).toBe(0);
      expect(state.retryAfter).toBe(2200); // 5200 - 3000
    });

    it('should allow requests after cooldown expires', () => {
      recordFailedAttempt('test-key', options, 0);
      recordFailedAttempt('test-key', options, 100);
      recordFailedAttempt('test-key', options, 200);

      // Check after cooldown expired (5200ms + 1ms)
      const state = getRateLimitState('test-key', options, 5201);

      expect(state.allowed).toBe(true);
      expect(state.remaining).toBe(3);
      expect(state.blockedUntil).toBeUndefined();
    });

    it('should handle failures in rolling window correctly', () => {
      // First failure at t=0
      recordFailedAttempt('test-key', options, 0);
      // Second failure at t=500
      recordFailedAttempt('test-key', options, 500);
      // Third failure at t=1200 (first failure at t=0 should be pruned)
      const state = recordFailedAttempt('test-key', options, 1200);

      // Should still be allowed because only 2 failures in current window
      expect(state.allowed).toBe(true);
      expect(state.remaining).toBe(1);
    });
  });

  describe('resetRateLimit', () => {
    it('should clear all failures and cooldown', () => {
      recordFailedAttempt('test-key', options, 0);
      recordFailedAttempt('test-key', options, 100);
      recordFailedAttempt('test-key', options, 200);

      resetRateLimit('test-key');

      const state = getRateLimitState('test-key', options, 200);
      expect(state.allowed).toBe(true);
      expect(state.remaining).toBe(3);
      expect(state.blockedUntil).toBeUndefined();
    });

    it('should not affect other keys', () => {
      recordFailedAttempt('key1', options, 0);
      recordFailedAttempt('key2', options, 0);

      resetRateLimit('key1');

      const state1 = getRateLimitState('key1', options, 100);
      const state2 = getRateLimitState('key2', options, 100);

      expect(state1.remaining).toBe(3);
      expect(state2.remaining).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should handle zero remaining attempts correctly', () => {
      const state = recordFailedAttempt('test-key', { ...options, maxAttempts: 1 }, 0);

      expect(state.allowed).toBe(false);
      expect(state.remaining).toBe(0);
    });

    it('should handle multiple keys independently', () => {
      resetRateLimit('key1');
      resetRateLimit('key2');

      recordFailedAttempt('key1', options, 0);
      recordFailedAttempt('key1', options, 100);

      recordFailedAttempt('key2', options, 0);

      const state1 = getRateLimitState('key1', options, 200);
      const state2 = getRateLimitState('key2', options, 200);

      expect(state1.remaining).toBe(1);
      expect(state2.remaining).toBe(2);
    });

    it('should handle very short windows', () => {
      const shortOptions: RateLimiterOptions = {
        maxAttempts: 2,
        windowMs: 100,
        cooldownMs: 500,
      };

      recordFailedAttempt('test-key', shortOptions, 0);
      recordFailedAttempt('test-key', shortOptions, 50);

      // After cooldown expires (blocked at t=50, cooldown until t=550)
      const state = getRateLimitState('test-key', shortOptions, 551);

      expect(state.allowed).toBe(true);
      expect(state.remaining).toBe(2);
    });
  });
});
