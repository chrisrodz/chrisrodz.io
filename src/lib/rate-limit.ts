export interface RateLimiterOptions {
  /** Maximum number of failed attempts allowed within the rolling window. */
  maxAttempts: number;
  /** Duration of the rolling window in milliseconds. */
  windowMs: number;
  /** Duration in milliseconds to block further attempts once the limit is exceeded. */
  cooldownMs: number;
}

interface AttemptInfo {
  failures: number[];
  blockedUntil?: number;
}

export interface RateLimitState {
  /** Indicates if the request is allowed to proceed. */
  allowed: boolean;
  /** Remaining attempts before the limit is reached. */
  remaining: number;
  /** Timestamp (ms) when the cooldown expires, if currently blocked. */
  blockedUntil?: number;
  /** Milliseconds until the next allowed attempt, if currently blocked. */
  retryAfter?: number;
}

const stores = new Map<string, AttemptInfo>();

function getInfo(key: string): AttemptInfo {
  let info = stores.get(key);
  if (!info) {
    info = { failures: [] };
    stores.set(key, info);
  }
  return info;
}

function pruneFailures(info: AttemptInfo, windowMs: number, now: number): void {
  if (info.failures.length === 0) return;
  const threshold = now - windowMs;
  info.failures = info.failures.filter((timestamp) => timestamp >= threshold);
}

function toState(info: AttemptInfo, options: RateLimiterOptions, now: number): RateLimitState {
  if (info.blockedUntil) {
    if (info.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        blockedUntil: info.blockedUntil,
        retryAfter: info.blockedUntil - now,
      };
    }
    // Cooldown expired, reset the tracking data.
    info.blockedUntil = undefined;
    info.failures = [];
  }

  const remaining = Math.max(0, options.maxAttempts - info.failures.length);
  return {
    allowed: remaining > 0,
    remaining,
  };
}

/**
 * Returns the current rate limit state for the given key without recording a failure.
 */
export function getRateLimitState(
  key: string,
  options: RateLimiterOptions,
  now: number = Date.now(),
): RateLimitState {
  const info = getInfo(key);
  pruneFailures(info, options.windowMs, now);
  return toState(info, options, now);
}

/**
 * Records a failed attempt for the key and returns the updated state.
 */
export function recordFailedAttempt(
  key: string,
  options: RateLimiterOptions,
  now: number = Date.now(),
): RateLimitState {
  const info = getInfo(key);
  pruneFailures(info, options.windowMs, now);

  info.failures.push(now);
  pruneFailures(info, options.windowMs, now);

  if (info.failures.length >= options.maxAttempts) {
    info.blockedUntil = now + options.cooldownMs;
  }

  return toState(info, options, now);
}

/**
 * Resets the stored failures and cooldown for the given key.
 */
export function resetRateLimit(key: string): void {
  stores.delete(key);
}
