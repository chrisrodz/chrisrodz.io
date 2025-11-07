# Day.js Migration Plan for chrisrodz.io

## Executive Summary

**Current State**: Native JavaScript Date API with 19+ files containing date operations, multiple duplicate formatters, manual timezone handling, and mutation-based date arithmetic.

**Goal**: Introduce day.js for robust, immutable, and maintainable date-time logic across the entire codebase.

**Impact**: ~19 files, ~40+ date operations, 6 core utility functions

---

## 1. Goals & Benefits

### Why Day.js?

| Benefit                   | Current Pain Point                               | Day.js Solution                      |
| ------------------------- | ------------------------------------------------ | ------------------------------------ |
| **Immutability**          | `.setDate()`, `.setHours()` mutate originals     | All operations return new instances  |
| **Readable Arithmetic**   | `7 * 24 * 60 * 60 * 1000`                        | `.subtract(7, 'days')`               |
| **Consistent Formatting** | Manual YYYY-MM-DD + Intl API mix                 | `.format('YYYY-MM-DD')`              |
| **Timezone Support**      | Hardcoded Puerto Rico formatters (duplicated 4x) | `dayjs.tz()` plugin                  |
| **Validation**            | Regex-only (allows invalid dates)                | `.isValid()` checks                  |
| **Bundle Size**           | N/A                                              | 2KB gzipped (smaller than moment.js) |

### Success Criteria

- ✅ Zero date mutation
- ✅ Single timezone formatter utility
- ✅ Eliminate all manual millisecond math
- ✅ All tests passing
- ✅ Type-safe date operations
- ✅ Bundle size increase < 10KB

---

## 2. Day.js Configuration

### Dependencies to Install

```json
{
  "dependencies": {
    "dayjs": "^1.11.10"
  }
}
```

### Required Plugins

```typescript
// src/lib/dayjs-config.ts (NEW FILE)
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localeData from 'dayjs/plugin/localeData';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

// Locale files
import 'dayjs/locale/es';
import 'dayjs/locale/en';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// Default timezone for coffee logs (Puerto Rico)
export const DEFAULT_TIMEZONE = 'America/Puerto_Rico';

export default dayjs;
```

**Why These Plugins?**

- `utc` + `timezone`: Puerto Rico coffee log timestamps
- `localeData`: ES/EN locale support (already using es-ES, en-US)
- `customParseFormat`: Parse YYYY-MM-DD strings (roast dates)
- `isSameOrAfter`/`isSameOrBefore`: Date range filtering

---

## 3. Migration Strategy

### Phased Approach (4 Phases)

```
Phase 1: Foundation (Week 1)
  └─ Install day.js
  └─ Create dayjs-config.ts
  └─ Create date utility library

Phase 2: Core Utilities (Week 1-2)
  └─ Migrate src/lib/i18n.ts
  └─ Migrate src/lib/github-api.ts
  └─ Migrate src/lib/cafe-stats.ts
  └─ Update tests

Phase 3: Components & Pages (Week 2-3)
  └─ Consolidate timezone formatters
  └─ Migrate Astro components
  └─ Migrate React components
  └─ Update validation schemas

Phase 4: Cleanup & Validation (Week 3)
  └─ Remove duplicate code
  └─ Bundle size analysis
  └─ End-to-end testing
  └─ Documentation update
```

**Why This Order?**

1. Start with **core utilities** (i18n, github-api, cafe-stats) - highest impact, used everywhere
2. Then **components** that consume those utilities
3. Finally **validation & forms** (lowest risk)

---

## 4. Phase 1: Foundation

### Step 1.1: Install Day.js

```bash
yarn add dayjs
```

### Step 1.2: Create Day.js Configuration

**File**: `src/lib/dayjs-config.ts` (NEW)

```typescript
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localeData from 'dayjs/plugin/localeData';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

// Import locales
import 'dayjs/locale/es';
import 'dayjs/locale/en';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// Constants
export const DEFAULT_TIMEZONE = 'America/Puerto_Rico';
export const DATE_FORMAT_ISO = 'YYYY-MM-DD';
export const DATETIME_FORMAT_ISO = 'YYYY-MM-DDTHH:mm:ss';

export default dayjs;
```

### Step 1.3: Create Date Utilities Library

**File**: `src/lib/date-utils.ts` (NEW)

```typescript
import dayjs, { DEFAULT_TIMEZONE, DATE_FORMAT_ISO } from './dayjs-config';
import type { Locale } from './i18n';

/**
 * Format date in YYYY-MM-DD format (replaces formatLocalDate in github-api.ts)
 */
export function formatDateISO(date: Date | string | dayjs.Dayjs): string {
  return dayjs(date).format(DATE_FORMAT_ISO);
}

/**
 * Format date with locale-aware formatting (replaces i18n.formatDate)
 */
export function formatDate(
  date: Date | string | dayjs.Dayjs,
  locale: Locale,
  options?: {
    year?: 'numeric' | '2-digit';
    month?: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long';
    day?: 'numeric' | '2-digit';
  }
): string {
  const d = dayjs(date).locale(locale === 'es' ? 'es' : 'en');

  // Map Intl options to dayjs format tokens
  const parts: string[] = [];

  if (options?.month === 'long') parts.push('MMMM');
  else if (options?.month === 'short') parts.push('MMM');
  else if (options?.month === 'numeric') parts.push('M');

  if (options?.day === 'numeric') parts.push('D');

  if (options?.year === 'numeric') parts.push('YYYY');

  const format = parts.join(' ');
  return d.format(format || 'MMM D, YYYY');
}

/**
 * Format time in Puerto Rico timezone (consolidates RecentLogs + TodaysCoffeeCard)
 */
export function formatTimeInPR(date: Date | string, locale: Locale = 'es'): string {
  return dayjs(date)
    .tz(DEFAULT_TIMEZONE)
    .locale(locale === 'es' ? 'es' : 'en')
    .format('h:mm A');
}

/**
 * Get start of today in local timezone
 */
export function getStartOfToday(): dayjs.Dayjs {
  return dayjs().startOf('day');
}

/**
 * Get date N days ago
 */
export function getDaysAgo(days: number): dayjs.Dayjs {
  return dayjs().subtract(days, 'days');
}

/**
 * Check if date is same day as another date
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  return dayjs(date1).isSame(dayjs(date2), 'day');
}

/**
 * Check if date is within range
 */
export function isWithinRange(
  date: Date | string,
  start: Date | string,
  end: Date | string
): boolean {
  const d = dayjs(date);
  return d.isSameOrAfter(dayjs(start)) && d.isSameOrBefore(dayjs(end));
}

/**
 * Parse YYYY-MM-DD string strictly
 */
export function parseDate(dateString: string): dayjs.Dayjs | null {
  const parsed = dayjs(dateString, DATE_FORMAT_ISO, true);
  return parsed.isValid() ? parsed : null;
}
```

### Step 1.4: Create Tests

**File**: `src/lib/date-utils.test.ts` (NEW)

```typescript
import { describe, it, expect } from 'vitest';
import dayjs from './dayjs-config';
import {
  formatDateISO,
  formatDate,
  formatTimeInPR,
  getStartOfToday,
  getDaysAgo,
  isSameDay,
  isWithinRange,
  parseDate,
} from './date-utils';

describe('date-utils', () => {
  describe('formatDateISO', () => {
    it('formats Date object as YYYY-MM-DD', () => {
      const date = new Date('2025-03-15T14:30:00Z');
      expect(formatDateISO(date)).toBe('2025-03-15');
    });

    it('formats ISO string as YYYY-MM-DD', () => {
      expect(formatDateISO('2025-03-15T14:30:00Z')).toBe('2025-03-15');
    });
  });

  describe('formatDate', () => {
    it('formats date with Spanish locale', () => {
      const date = new Date('2025-03-15');
      const result = formatDate(date, 'es', { month: 'short', day: 'numeric' });
      expect(result).toContain('mar'); // Spanish abbreviation
    });

    it('formats date with English locale', () => {
      const date = new Date('2025-03-15');
      const result = formatDate(date, 'en', { month: 'long', day: 'numeric' });
      expect(result).toContain('March');
    });
  });

  describe('isSameDay', () => {
    it('returns true for same calendar day', () => {
      const date1 = '2025-03-15T08:00:00Z';
      const date2 = '2025-03-15T20:00:00Z';
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('returns false for different days', () => {
      const date1 = '2025-03-15T23:59:00Z';
      const date2 = '2025-03-16T00:01:00Z';
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe('parseDate', () => {
    it('parses valid YYYY-MM-DD string', () => {
      const result = parseDate('2025-03-15');
      expect(result?.format('YYYY-MM-DD')).toBe('2025-03-15');
    });

    it('returns null for invalid date', () => {
      expect(parseDate('2025-13-45')).toBeNull();
      expect(parseDate('not-a-date')).toBeNull();
    });
  });

  describe('getDaysAgo', () => {
    it('returns date 7 days ago', () => {
      const result = getDaysAgo(7);
      const expected = dayjs().subtract(7, 'days').startOf('day');
      expect(result.isSame(expected, 'day')).toBe(true);
    });
  });
});
```

---

## 5. Phase 2: Core Utilities Migration

### Step 2.1: Migrate `src/lib/i18n.ts`

**Location**: Line 141-142

**Before**:

```typescript
formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) =>
  date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', options),
```

**After**:

```typescript
import { formatDate } from './date-utils';

// In useTranslations():
formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) =>
  formatDate(date, locale, options),
```

**Impact**: All blog posts, coffee logs automatically use day.js formatting

---

### Step 2.2: Migrate `src/lib/github-api.ts`

**Changes**:

1. **Replace formatLocalDate** (Lines 190-195):

   ```typescript
   // Remove manual implementation
   import { formatDateISO } from './date-utils';
   // Replace all formatLocalDate() calls with formatDateISO()
   ```

2. **Replace date arithmetic** (Line 218):

   ```typescript
   // Before:
   const expectedDate = new Date(today);
   expectedDate.setDate(today.getDate() - daysBack);

   // After:
   import dayjs from './dayjs-config';
   const expectedDate = dayjs().subtract(daysBack, 'days');
   ```

3. **Keep string comparisons** (Line 198):
   ```typescript
   // No change needed - localeCompare works for YYYY-MM-DD format
   const sorted = [...activities].sort((a, b) => b.date.localeCompare(a.date));
   ```

---

### Step 2.3: Migrate `src/lib/cafe-stats.ts`

**Changes**:

1. **Replace 7-day calculation** (Lines 42-43):

   ```typescript
   // Before:
   const now = new Date();
   const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

   // After:
   import { getDaysAgo } from './date-utils';
   const oneWeekAgo = getDaysAgo(7);
   ```

2. **Replace date comparison** (Line 51):

   ```typescript
   // Before:
   return logDate >= oneWeekAgo;

   // After:
   import dayjs from './dayjs-config';
   return dayjs(log.brew_time).isSameOrAfter(oneWeekAgo);
   ```

3. **Replace 30-day calculation** (Lines 92-93):

   ```typescript
   // Before:
   const thirtyDaysAgo = new Date();
   thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

   // After:
   const thirtyDaysAgo = getDaysAgo(30);
   ```

4. **Replace date formatting** (Lines 101-104):

   ```typescript
   // Before:
   const dateStr = new Date(log.brew_time).toLocaleDateString('en-US', {
     month: 'short',
     day: 'numeric',
   });

   // After:
   import { formatDate } from './date-utils';
   const dateStr = formatDate(log.brew_time, 'en', { month: 'short', day: 'numeric' });
   ```

---

### Step 2.4: Keep `src/lib/auth.ts` As-Is

**Rationale**: Uses `Date.now()` for numeric timestamps - optimal for session management.

```typescript
// Keep as-is - no day.js needed for simple timestamp comparisons
const now = Date.now();
const SESSION_DURATION = 24 * 60 * 60 * 1000;
```

---

### Step 2.5: Keep `src/lib/rate-limit.ts` As-Is

**Rationale**: Numeric timestamps are efficient for rate limiting.

---

## 6. Phase 3: Components & Pages

### Step 3.1: Consolidate Puerto Rico Timezone Formatters

**Remove duplicates in**:

- `src/components/cafe/RecentLogs.astro` (Lines 14-24, 89-100)
- `src/components/cafe/TodaysCoffeeCard.astro` (Lines 14-23, 124-135)

**Replace with**:

```astro
---
import { formatTimeInPR } from '@/lib/date-utils';

// Server-side
const brewTime = formatTimeInPR(log.brew_time, locale);
---

<time datetime={log.brew_time}>
  {brewTime}
</time>

<!-- Client-side script (if hydration needed) -->
<script>
  import { formatTimeInPR } from '@/lib/date-utils';

  document.querySelectorAll('[data-brew-time]').forEach((el) => {
    const isoTime = el.getAttribute('data-brew-time');
    if (isoTime) {
      el.textContent = formatTimeInPR(isoTime);
    }
  });
</script>
```

**Impact**: Removes ~40 lines of duplicate code

---

### Step 3.2: Migrate `src/pages/cafe.astro`

**Location**: Lines 41-47

**Before**:

```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);
// ...
return logDate.getTime() === today.getTime();
```

**After**:

```typescript
import { getStartOfToday, isSameDay } from '@/lib/date-utils';
const today = getStartOfToday();
// ...
return isSameDay(log.brew_time, today);
```

---

### Step 3.3: Migrate `src/pages/blog/[slug].astro`

**Location**: Lines 33-37

**Before**:

```typescript
const formattedDate = entry.data.pubDate.toLocaleDateString(locale, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
```

**After**:

```typescript
const { formatDate } = useTranslations(locale); // Already uses date-utils!
const formattedDate = formatDate(entry.data.pubDate, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
```

---

### Step 3.4: Migrate `src/components/cafe/CoffeeLogForm.tsx`

**Location**: Line 171

**Before**:

```typescript
brew_time: new Date().toISOString(),
```

**After**:

```typescript
import dayjs from '@/lib/dayjs-config';
brew_time: dayjs().toISOString(),
```

**Note**: Keep `Date.now()` for draft timestamp (Line 101) - optimal as-is.

---

### Step 3.5: Migrate `src/layouts/Layout.astro`

**Location**: Line 277-278

**Before**:

```typescript
const expires = new Date();
expires.setFullYear(expires.getFullYear() + 1);
```

**After**:

```typescript
import dayjs from '@/lib/dayjs-config';
const expires = dayjs().add(1, 'year').toDate();
```

**Note**: Keep `new Date().getFullYear()` for copyright year (Line 37) - simple operation.

---

## 7. Phase 4: Validation & Cleanup

### Step 4.1: Enhance Date Validation

**File**: `src/lib/schemas/cafe.ts`
**Location**: Line 46

**Before**:

```typescript
roast_date: z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Roast date must be in YYYY-MM-DD format'),
```

**After**:

```typescript
import { parseDate } from '@/lib/date-utils';

roast_date: z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Roast date must be in YYYY-MM-DD format')
  .refine(
    (val) => parseDate(val) !== null,
    'Roast date must be a valid date'
  ),
```

**Impact**: Rejects invalid dates like `2025-13-45`

---

### Step 4.2: Remove Duplicate Code

**Delete**:

1. `formatLocalDate()` in `src/lib/github-api.test.ts:10-14`
2. Puerto Rico formatters in `RecentLogs.astro`
3. Puerto Rico formatters in `TodaysCoffeeCard.astro`

**Lines Saved**: ~60 lines

---

### Step 4.3: Update Tests

**Files to modify**:

- `src/lib/github-api.test.ts` - Use `formatDateISO` instead of duplicate
- `src/lib/cafe-stats.test.ts` - Update date fixtures to use `getDaysAgo`
- `src/pages/rss.xml.test.ts` - Verify date sorting still works

---

## 8. Testing Strategy

### Unit Tests Checklist

- [ ] `date-utils.test.ts` - All new utilities tested
- [ ] `github-api.test.ts` - Streak calculations work
- [ ] `cafe-stats.test.ts` - 7-day/30-day windows work
- [ ] `rss.xml.test.ts` - Date sorting works

### Integration Tests Checklist

- [ ] Blog post dates render correctly (ES + EN)
- [ ] Coffee log times show in Puerto Rico timezone
- [ ] GitHub streak calculations match previous results
- [ ] Today's coffee filter works at midnight boundary
- [ ] Cookie expiration dates work (1 year from now)
- [ ] Form validation rejects invalid dates

### Test Commands

```bash
yarn test                    # Unit tests
yarn test:coverage           # Check coverage
yarn build                   # Verify SSR build works
yarn dev                     # Manual testing
yarn verify                  # Full pre-commit checks
```

---

## 9. Bundle Size Analysis

### Expected Impact

```
Before:  No date library (0 KB)
After:   dayjs + 6 plugins (~8-10 KB gzipped)

Breakdown:
- dayjs core: 2 KB
- timezone plugin: 3 KB
- locale files (es, en): 2 KB
- other plugins: 1 KB
```

### Verification Commands

```bash
yarn build
ls -lh dist/_astro/*.js | head -20
```

### Optimization Tips

1. **Tree-shaking**: Only import plugins you use
2. **Locale splitting**: Load Spanish/English conditionally if bundle grows
3. **Keep rate-limit.ts using Date.now()**: Avoid day.js overhead for hot paths

---

## 10. Migration Checklist

### Phase 1: Foundation ✅

- [ ] Install `dayjs` dependency
- [ ] Create `src/lib/dayjs-config.ts`
- [ ] Create `src/lib/date-utils.ts`
- [ ] Create `src/lib/date-utils.test.ts`
- [ ] Run `yarn test` - verify all pass

### Phase 2: Core Utilities ✅

- [ ] Migrate `src/lib/i18n.ts` formatDate
- [ ] Migrate `src/lib/github-api.ts` (formatLocalDate, date arithmetic)
- [ ] Migrate `src/lib/cafe-stats.ts` (7-day, 30-day windows)
- [ ] Update `github-api.test.ts`
- [ ] Update `cafe-stats.test.ts`
- [ ] Run `yarn test` - all tests pass
- [ ] Run `yarn build` - verify no SSR errors

### Phase 3: Components & Pages ✅

- [ ] Consolidate Puerto Rico timezone formatters
- [ ] Migrate `src/components/cafe/RecentLogs.astro`
- [ ] Migrate `src/components/cafe/TodaysCoffeeCard.astro`
- [ ] Migrate `src/pages/cafe.astro`
- [ ] Migrate `src/pages/blog/[slug].astro`
- [ ] Migrate `src/components/cafe/CoffeeLogForm.tsx`
- [ ] Migrate `src/layouts/Layout.astro`
- [ ] Run `yarn dev` - manual smoke test all pages
- [ ] Verify coffee logs show correct PR timezone
- [ ] Verify blog dates display correctly (ES/EN)

### Phase 4: Validation & Cleanup ✅

- [ ] Enhance `src/lib/schemas/cafe.ts` roast_date validation
- [ ] Delete duplicate `formatLocalDate` in test file
- [ ] Delete inline Puerto Rico formatters (4 locations)
- [ ] Run `yarn verify` (types, lint, format, i18n)
- [ ] Run `yarn test:coverage` - check coverage metrics
- [ ] Bundle size analysis with `yarn build`
- [ ] Update `CHANGELOG.md`

### Final Validation ✅

- [ ] All tests passing (`yarn test`)
- [ ] Build succeeds (`yarn build`)
- [ ] Manual testing complete
- [ ] No TypeScript errors (`yarn astro check`)
- [ ] Lint passes (`yarn lint`)
- [ ] Bundle size acceptable (<10KB increase)

---

## 11. Rollback Plan

### If Migration Fails

**Immediate Rollback**:

```bash
# Revert all changes
git reset --hard HEAD

# Remove day.js
yarn remove dayjs
```

**Partial Rollback** (keep Phase 1, revert Phase 2+):

```bash
# Keep date-utils.ts for future use
# Revert individual file changes
git checkout HEAD -- src/lib/i18n.ts
git checkout HEAD -- src/lib/github-api.ts
# etc.
```

---

## 12. Common Issues & Solutions

| Issue                   | Cause               | Solution                              |
| ----------------------- | ------------------- | ------------------------------------- |
| Timezone mismatch       | Wrong plugin config | Check `dayjs.extend(timezone)`        |
| Test failures           | Date mocking        | Use `dayjs('2025-03-15')` in fixtures |
| SSR build error         | Client-only plugin  | Ensure plugins loaded server-side     |
| Bundle size too large   | Too many locales    | Load locales conditionally            |
| Invalid date not caught | Missing validation  | Use `parseDate()` with `.isValid()`   |

---

## 13. Post-Migration Benefits

### Before vs After

| Metric                   | Before                | After             | Improvement          |
| ------------------------ | --------------------- | ----------------- | -------------------- |
| **Lines of code**        | ~40 date operations   | ~25 utility calls | 37% reduction        |
| **Duplicate formatters** | 4 (Puerto Rico)       | 1                 | 75% reduction        |
| **Manual math**          | 5 instances           | 0                 | 100% elimination     |
| **Date mutations**       | 8 instances           | 0                 | 100% elimination     |
| **Invalid date bugs**    | Possible (regex only) | Prevented         | Risk eliminated      |
| **Bundle size**          | 0 KB                  | ~8 KB             | Acceptable trade-off |

### Maintainability Wins

- ✅ Single source of truth for date formatting
- ✅ Type-safe date operations
- ✅ Immutable date handling (no mutations)
- ✅ Centralized timezone logic
- ✅ Future-proof for new date features

---

## 14. Future Enhancements

Once day.js is established:

1. **Relative Time Plugin** (`dayjs/plugin/relativeTime`)

   ```typescript
   // "2 hours ago", "hace 2 horas"
   dayjs(log.brew_time).from(dayjs());
   ```

2. **Calendar Plugin** (`dayjs/plugin/calendar`)

   ```typescript
   // "Today at 3:30 PM", "Yesterday at 10:00 AM"
   dayjs(log.brew_time).calendar();
   ```

3. **Week Plugin** (for GitHub contribution weeks)

   ```typescript
   dayjs().week(); // ISO week number
   ```

4. **Duration Plugin** (for brew timer feature)
   ```typescript
   const duration = dayjs.duration(4, 'minutes');
   ```

---

## 15. Files Summary

### Files to Create (3)

1. `src/lib/dayjs-config.ts` (~30 lines)
2. `src/lib/date-utils.ts` (~120 lines)
3. `src/lib/date-utils.test.ts` (~100 lines)

### Files to Modify (15)

1. `package.json` - Add dayjs dependency
2. `src/lib/i18n.ts` - Use date-utils
3. `src/lib/github-api.ts` - Replace formatLocalDate, date arithmetic
4. `src/lib/cafe-stats.ts` - Use getDaysAgo, formatDate
5. `src/lib/schemas/cafe.ts` - Enhance validation
6. `src/components/cafe/RecentLogs.astro` - Use formatTimeInPR
7. `src/components/cafe/TodaysCoffeeCard.astro` - Use formatTimeInPR
8. `src/components/cafe/CoffeeLogForm.tsx` - Use dayjs()
9. `src/pages/cafe.astro` - Use isSameDay
10. `src/pages/blog/[slug].astro` - Use formatDate
11. `src/layouts/Layout.astro` - Use dayjs for cookie expiry
12. `src/lib/github-api.test.ts` - Remove duplicate formatLocalDate
13. `src/lib/cafe-stats.test.ts` - Update test fixtures
14. `src/pages/rss.xml.test.ts` - Verify date sorting (if needed)
15. `CHANGELOG.md` - Document migration

### Files to Keep As-Is (2)

1. `src/lib/auth.ts` - Date.now() is optimal
2. `src/lib/rate-limit.ts` - Timestamp logic is efficient

---

## 16. Estimated Effort

| Phase                   | Complexity | Time         | Risk       |
| ----------------------- | ---------- | ------------ | ---------- |
| Phase 1: Foundation     | Low        | 2 hours      | Low        |
| Phase 2: Core Utilities | Medium     | 4 hours      | Medium     |
| Phase 3: Components     | High       | 6 hours      | Medium     |
| Phase 4: Cleanup        | Low        | 2 hours      | Low        |
| **Total**               | -          | **14 hours** | **Medium** |

**Risks**:

- Timezone edge cases (Puerto Rico DST)
- SSR vs client-side hydration mismatches
- Test fixture adjustments

**Mitigation**:

- Comprehensive testing at each phase
- Manual smoke testing after each phase
- Keep rollback plan ready

---

## Summary

This migration plan introduces **day.js** to your codebase in a structured, low-risk manner. By following the 4-phase approach:

1. **Phase 1** establishes the foundation with configuration and utilities
2. **Phase 2** migrates high-impact core utilities (i18n, github-api, cafe-stats)
3. **Phase 3** updates all components and pages
4. **Phase 4** cleans up duplicates and validates everything

### Key Achievements

- 🎯 **37% less code** for date operations
- 🎯 **Zero date mutations** (immutable by default)
- 🎯 **Single timezone formatter** (no duplicates)
- 🎯 **Type-safe date validation** (prevents invalid dates)
- 🎯 **Maintainable date logic** (centralized utilities)

### Next Steps

1. Review this plan
2. Start with Phase 1 (low risk, high value)
3. Test thoroughly after each phase
4. Deploy with confidence!
