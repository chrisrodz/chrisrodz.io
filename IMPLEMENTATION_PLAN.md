# Implementation Plan: Issue #42 - Component-Based Architecture Refactor

**Issue:** https://github.com/chrisrodz/chrisrodz.io/issues/42
**Branch:** `claude/review-issue-42-011CUeeoFx6mhF63bJqYF5fm`

## Summary

Refactor index and cafe pages to use component-based architecture.

**Goals:**

- Extract inline HTML into reusable Astro components
- Add i18n support to all components
- Reduce page complexity (cafe.astro: 900→150 lines, index.astro: 88→30 lines)
- Improve maintainability and adherence to modern web development practices

---

## Phase 1: Index Page Components

### Components to Create:

1. **`src/components/home/Greeting.astro`**
   - **Props:** `locale: Locale`
   - **Renders:** h1 with greeting text
   - **i18n keys:** `home.greeting`

2. **`src/components/home/IntroParagraphs.astro`**
   - **Props:** `locale: Locale`
   - **Renders:** Two intro paragraphs
   - **i18n keys:** `home.intro.paragraph1`, `home.intro.paragraph2`

3. **`src/components/home/BlogPostsList.astro`**
   - **Props:** `posts: CollectionEntry<'blog'>[], locale: Locale`
   - **Renders:** Styled list of blog posts
   - **i18n keys:** None needed (uses post data)

---

## Phase 2: Cafe Page Components

### A. Utility/State Components:

1. **`src/components/cafe/ErrorState.astro`**
   - **Props:** `error: string, locale: Locale`
   - **Renders:** Warning notice box
   - **i18n keys:** `cafe.errors.heading`, `cafe.errors.notConfigured`

2. **`src/components/cafe/EmptyState.astro`**
   - **Props:** `locale: Locale`
   - **Renders:** Info notice box
   - **i18n keys:** `cafe.empty.heading`, `cafe.empty.message`

3. **`src/components/cafe/WhyTracking.astro`**
   - **Props:** `locale: Locale`
   - **Renders:** Simple section with explanation
   - **i18n keys:** `cafe.why.text`

### B. Data Display Components:

4. **`src/components/cafe/TodaysCoffeeCard.astro`**
   - **Props:** `log: CoffeeLog, locale: Locale`
   - **Renders:** Hero card with metrics, timezone comparison, notes
   - **i18n keys:** `cafe.todaysCoffee.*` (heading, dialedIn, notes, metrics, etc.)
   - **Includes:** Rating badge, metrics grid, timezone display

5. **`src/components/cafe/StatsCards.astro`**
   - **Props:** `stats: { totalLogs: number, avgRating: number, avgBrew: number }, locale: Locale`
   - **Renders:** 3-card grid with key statistics
   - **i18n keys:** `cafe.stats.*` (totalLogs, avgRating, avgBrew)

6. **`src/components/cafe/BrewDistribution.astro`**
   - **Props:** `distribution: BrewMethodDistribution[], locale: Locale`
   - **Renders:** Bar chart visualization
   - **i18n keys:** `cafe.brewMethods.heading`

7. **`src/components/cafe/RecentLogs.astro`**
   - **Props:** `logs: CoffeeLog[], locale: Locale`
   - **Renders:** List of recent coffee entries
   - **i18n keys:** `cafe.recent.*` (heading, bean, method, rating, notes)

---

## Phase 3: I18n Updates

### Files to Update:

**`src/i18n/en.json`** and **`src/i18n/es.json`**

Add translation keys for:

- Home page components (greeting, intro paragraphs)
- Cafe empty state
- Cafe brew method distribution heading
- Cafe recent logs section
- Expand existing cafe keys for component needs

### Existing Components to Update:

- **`src/components/cafe/BrewMethodChart.tsx`**
  - Add props: `locale: Locale`
  - Replace hardcoded "No brew data available" with `t('cafe.brewMethods.noData')`

- **`src/components/cafe/QualityChart.tsx`**
  - Add props: `locale: Locale`
  - Internationalize any hardcoded strings

---

## Phase 4: Page Refactoring

### `src/pages/index.astro` (88 lines → ~30 lines)

Replace inline HTML with component composition:

```astro
---
import Layout from '@/layouts/Layout.astro';
import Greeting from '@/components/home/Greeting.astro';
import IntroParagraphs from '@/components/home/IntroParagraphs.astro';
import BlogPostsList from '@/components/home/BlogPostsList.astro';
import { getLocaleFromUrl } from '@/lib/i18n';
import { getCollection } from 'astro:content';

const locale = getLocaleFromUrl(Astro.url);
const allPosts = await getCollection('blog', ({ data }) => data.locale === locale);
---

<Layout title={/* ... */}>
  <Greeting locale={locale} />
  <IntroParagraphs locale={locale} />
  <BlogPostsList posts={allPosts} locale={locale} />
</Layout>
```

### `src/pages/cafe.astro` (900 lines → ~150 lines)

Replace inline sections with components:

```astro
---
import Layout from '@/layouts/Layout.astro';
import ErrorState from '@/components/cafe/ErrorState.astro';
import EmptyState from '@/components/cafe/EmptyState.astro';
import WhyTracking from '@/components/cafe/WhyTracking.astro';
import TodaysCoffeeCard from '@/components/cafe/TodaysCoffeeCard.astro';
import StatsCards from '@/components/cafe/StatsCards.astro';
import BrewDistribution from '@/components/cafe/BrewDistribution.astro';
import RecentLogs from '@/components/cafe/RecentLogs.astro';
// ... existing imports

const locale = getLocaleFromUrl(Astro.url);
// ... existing data fetching
---

<Layout title={/* ... */}>
  {
    error ? (
      <ErrorState error={error} locale={locale} />
    ) : logs.length === 0 ? (
      <EmptyState locale={locale} />
    ) : (
      <>
        <WhyTracking locale={locale} />
        {todaysLog && <TodaysCoffeeCard log={todaysLog} locale={locale} />}
        <StatsCards stats={stats} locale={locale} />
        <BrewDistribution distribution={brewDist} locale={locale} />
        <RecentLogs logs={recentLogs} locale={locale} />
      </>
    )
  }
</Layout>
```

---

## Phase 5: Testing

Add tests for components with conditional logic:

- **`src/components/cafe/ErrorState.test.ts`** - Test error message rendering
- **`src/components/cafe/EmptyState.test.ts`** - Test empty state rendering
- **`src/components/cafe/TodaysCoffeeCard.test.ts`** - Test conditional rendering (dialed in badge, notes)

**Testing approach:**

- Use existing test setup (Vitest)
- Test behavior, not implementation
- Focus on conditional logic and edge cases
- Skip testing trivial components (Greeting, WhyTracking)

---

## Phase 6: Quality Assurance

### Pre-push checklist:

```bash
yarn verify       # Types + lint + format + i18n validation
yarn dev          # Manual testing in browser
yarn build        # Production build verification
yarn test         # Run test suite
```

### Manual testing checklist:

- [ ] Index page renders correctly (ES + EN)
- [ ] Cafe page with data renders correctly (ES + EN)
- [ ] Cafe page error state displays properly
- [ ] Cafe page empty state displays properly
- [ ] Dark mode toggle works on all new components
- [ ] Responsive design works (mobile, tablet, desktop)

---

## Expected Impact

### Before:

- `index.astro`: 88 lines (mostly inline HTML)
- `cafe.astro`: 900 lines (547 CSS + 300+ HTML)
- Components: 5 (React only, no i18n)
- Reusability: Low
- Maintainability: Difficult (tightly coupled)

### After:

- `index.astro`: ~30 lines (component composition)
- `cafe.astro`: ~150 lines (component composition)
- Components: 15 (10 new Astro + 5 updated React, all with i18n)
- Reusability: High
- Maintainability: Easy (separation of concerns)

**Code reduction:** ~850 lines removed from pages, organized into reusable components

---

## Architecture Decisions

| Decision           | Choice                              | Rationale                                                           |
| ------------------ | ----------------------------------- | ------------------------------------------------------------------- |
| **Component Type** | Astro components                    | Server-side rendered, better performance for presentational content |
| **Granularity**    | Single component per section        | Start simple; refactor to nested if needed                          |
| **I18n Strategy**  | Full i18n for all components        | Consistency across codebase, proper localization                    |
| **Styling**        | Component-specific `<style>` blocks | Encapsulation, uses PicoCSS variables                               |
| **Testing**        | Focus on conditional logic          | Skip trivial presentational components initially                    |

---

## Git Workflow

```bash
# Work is being done on:
# Branch: claude/review-issue-42-011CUeeoFx6mhF63bJqYF5fm

# After completion:
git add .
git commit -m "refactor: Extract reusable components from pages

- Create 10 new Astro components for index and cafe pages
- Add i18n support to all components
- Update existing React components with i18n
- Reduce cafe.astro from 900 to ~150 lines
- Reduce index.astro from 88 to ~30 lines
- Add tests for components with conditional logic

Closes #42"

git push -u origin claude/review-issue-42-011CUeeoFx6mhF63bJqYF5fm
```

---

## Next Steps

1. ✅ Plan completed
2. ⏳ Implement components (Phases 1-2)
3. ⏳ Update i18n files (Phase 3)
4. ⏳ Refactor pages (Phase 4)
5. ⏳ Add tests (Phase 5)
6. ⏳ QA and push (Phase 6)
7. ⏳ Create PR

**Closes:** #42
