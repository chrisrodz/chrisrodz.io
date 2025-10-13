# Tailwind to PicoCSS Migration Plan

**Date Created:** 2025-10-12
**Status:** Planning Phase
**Estimated Total Time:** 6-8 hours

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Quick Start Guide](#quick-start-guide) - **Start here if resuming work**
3. [Quick Reference: All Files Being Modified](#quick-reference-all-files-being-modified)
4. [Part 1: Complete File Inventory](#part-1-complete-file-inventory)
5. [Part 2: PicoCSS Pattern Library](#part-2-pico-css-pattern-library)
6. [Part 3: File-by-File Migration Checklist](#part-3-file-by-file-migration-checklist)
7. [Part 4: Configuration Cleanup](#part-4-configuration-cleanup)
8. [Part 5: Testing Strategy](#part-5-testing-strategy)
9. [Common Issues During Migration](#common-issues-during-migration) - **Reference when stuck**
10. [Part 6: Step-by-Step Migration Execution](#part-6-step-by-step-migration-execution) - **Follow these phases**
11. [Part 7: Rollback Plan](#part-7-rollback-plan)
12. [Part 8: Success Metrics](#part-8-success-metrics)
13. [Part 9: Post-Migration Tasks](#part-9-post-migration-tasks)
14. [Part 10: Known Gotchas & Tips](#part-10-known-gotchas--tips)
15. [Appendix: Quick Reference](#appendix-quick-reference)

---

## How to Use This Document

**First time reading this plan?**

1. Read the [Executive Summary](#executive-summary) to understand the goal
2. Review [Quick Reference: All Files Being Modified](#quick-reference-all-files-being-modified) to see scope
3. When ready to start, follow [Part 6: Step-by-Step Migration Execution](#part-6-step-by-step-migration-execution)

**Resuming work mid-migration?**

1. Go directly to [Quick Start Guide](#quick-start-guide)
2. Identify which phase to resume based on your last commit
3. Jump to that phase in Part 6

**Stuck on an issue?**

1. Check [Common Issues During Migration](#common-issues-during-migration) first
2. Use the verification commands in each phase to diagnose
3. Use rollback instructions if needed

**Need a reference while coding?**

- [Part 2: PicoCSS Pattern Library](#part-2-pico-css-pattern-library) - Pattern conversions with examples
- [Appendix: Quick Reference](#appendix-quick-reference) - Quick lookup tables
- [Part 3: File-by-File Migration Checklist](#part-3-file-by-file-migration-checklist) - Specific instructions per file

---

## Executive Summary

This document provides a comprehensive, step-by-step plan to remove Tailwind CSS from the chrisrodz.io codebase and standardize on PicoCSS v2. Currently, the project has an antipattern where 80% of the site uses PicoCSS while 20% (coffee tracker and admin pages) uses Tailwind CSS.

**Migration Philosophy:**
This plan prioritizes **reusable CSS classes** over inline styles or CSS variable usage. Instead of scattering style logic throughout JSX/TSX files, we'll create a library of semantic, reusable classes in global.css that leverage PicoCSS variables internally. This approach ensures:

- Consistent styling across components
- Easier maintenance and updates
- DRY (Don't Repeat Yourself) principles
- Better separation of concerns

**Scope of Work:**

- 8 files with Tailwind classes (6 React components, 2 Astro pages)
- Remove 3 Tailwind dependencies from package.json
- Remove Tailwind integration from astro.config.mjs
- Delete tailwind.config.mjs
- Clean up global.css (remove @tailwind directives, add 25 reusable PicoCSS component classes)
- Create PicoCSS-based replacements for all Tailwind patterns

**Benefits:**

- Simplified codebase with single CSS framework
- Reduced bundle size (remove ~100KB of Tailwind CSS)
- Consistent styling across entire site
- Better accessibility (PicoCSS has better semantic defaults)
- Easier maintenance

---

## Quick Start Guide

**If resuming work on this migration:**

1. Check the current git branch: `git branch --show-current`
2. Should be on: `refactor/remove-tailwind-standardize-pico`
3. Run `git log --oneline -5` to see which phase is complete
4. Jump to the appropriate phase in Part 6 based on last commit
5. Before continuing, run `yarn dev` to ensure the site still works

**Phase Identification by Last Commit:**

- "Checkpoint before Tailwind removal" → Start Phase 2
- "Add PicoCSS component classes" → Start Phase 3
- "Migrate BrewMethodChart" → Continue Phase 3 (QualityChart next)
- "Migrate QualityChart" → Continue Phase 3 (StarRating next)
- "Migrate StarRating" → Continue Phase 3 (AddBeanForm next)
- "Migrate AddBeanForm" → Continue Phase 3 (CoffeeLogForm next)
- "Migrate CoffeeLogForm" → Start Phase 4
- "Migrate admin/cafe" → Continue Phase 4 (cafe.astro next)
- "Migrate cafe page" → Start Phase 5
- "Remove Tailwind CSS dependencies" → Start Phase 6

---

## Quick Reference: All Files Being Modified

| File Path                                 | Type   | Phase   | Status                       |
| ----------------------------------------- | ------ | ------- | ---------------------------- |
| `src/styles/global.css`                   | CSS    | Phase 2 | ⬜ Not started               |
| `src/components/cafe/BrewMethodChart.tsx` | React  | Phase 3 | ⬜ Not started               |
| `src/components/cafe/QualityChart.tsx`    | React  | Phase 3 | ⬜ Not started               |
| `src/components/cafe/StarRating.tsx`      | React  | Phase 3 | ⬜ Not started               |
| `src/components/cafe/AddBeanForm.tsx`     | React  | Phase 3 | ⬜ Not started               |
| `src/components/cafe/CoffeeLogForm.tsx`   | React  | Phase 3 | ⬜ Not started               |
| `src/pages/admin/cafe.astro`              | Astro  | Phase 4 | ⬜ Not started               |
| `src/pages/cafe.astro`                    | Astro  | Phase 4 | ⬜ Not started               |
| `package.json`                            | Config | Phase 5 | ⬜ Not started               |
| `astro.config.mjs`                        | Config | Phase 5 | ⬜ Not started               |
| `tailwind.config.mjs`                     | Config | Phase 5 | ⬜ Not started (will delete) |

**Instructions:** Update the "Status" column as you complete each file (⬜ → ✅).

---

## Part 1: Complete File Inventory

### Files Using Tailwind Classes

#### React Components (6 files)

1. **`/Users/chris/repos/chrisrodz.io/src/components/cafe/CoffeeLogForm.tsx`**
   - **Lines:** 400+ lines, extensive Tailwind usage
   - **Complexity:** HIGH
   - **Tailwind Patterns Used:**
     - Layout: `max-w-2xl`, `mx-auto`, `space-y-6`, `grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-3`
     - Colors: `bg-green-50`, `dark:bg-green-900/20`, `bg-red-50`, `text-green-900`, `text-gray-600`
     - Borders: `border`, `border-2`, `border-gray-300`, `rounded-lg`, `rounded-full`
     - Spacing: `p-4`, `p-6`, `px-6 py-3`, `mb-2`, `mb-4`, `gap-3`, `gap-4`
     - Typography: `text-sm`, `text-xl`, `text-4xl`, `font-medium`, `font-semibold`
     - Interactive: `hover:bg-blue-700`, `focus:outline-none`, `focus:ring-2`, `disabled:bg-gray-400`
     - Responsive: `sm:grid-cols-2`, `sm:grid-cols-3`
   - **Key UI Elements:**
     - Success/error message cards
     - Multi-column brew method selector (radio buttons styled as cards)
     - Form inputs with labels
     - Two-column grid for dose/yield inputs
     - Custom star rating component
     - Collapsible notes section
     - Submit button with states

2. **`/Users/chris/repos/chrisrodz.io/src/components/cafe/AddBeanForm.tsx`**
   - **Lines:** 178 lines
   - **Complexity:** MEDIUM
   - **Tailwind Patterns Used:**
     - Layout: `space-y-3`
     - Colors: `bg-blue-50`, `dark:bg-blue-900/20`, `bg-red-50`, `text-blue-600`
     - Borders: `border-2`, `border-blue-200`, `rounded-lg`
     - Spacing: `p-3`, `p-4`, `mb-2`, `mb-3`, `gap-2`
     - Typography: `text-sm`, `font-medium`
     - Interactive: `hover:bg-green-700`, `disabled:bg-gray-400`
   - **Key UI Elements:**
     - Blue highlight container
     - Error message display
     - Form inputs (text, date, textarea)
     - Submit button

3. **`/Users/chris/repos/chrisrodz.io/src/components/cafe/StarRating.tsx`**
   - **Lines:** 95 lines
   - **Complexity:** MEDIUM
   - **Tailwind Patterns Used:**
     - Layout: `flex gap-3`
     - Colors: `bg-blue-600`, `dark:bg-blue-500`, `text-white`, `text-gray-600`
     - Borders: `border-2`, `border-blue-600`, `rounded-full`
     - Sizing: `w-12 h-12`
     - Interactive: `hover:scale-110`, `active:scale-95`, `hover:border-gray-400`
     - Typography: `text-sm`, `font-medium`
   - **Key UI Elements:**
     - 5 circular radio buttons
     - Hover effects with scale
     - Active state styling
     - Accessibility support (aria, keyboard nav)

4. **`/Users/chris/repos/chrisrodz.io/src/components/cafe/BrewMethodChart.tsx`**
   - **Lines:** 43 lines
   - **Complexity:** LOW
   - **Tailwind Patterns Used:**
     - Layout: `space-y-4`
     - Colors: `bg-gray-200`, `dark:bg-gray-700`, `bg-blue-600`, `text-gray-500`
     - Borders: `rounded-full`
     - Sizing: `w-full h-3`
     - Typography: `text-sm`, `font-medium`, `text-center`
     - Spacing: `py-8`, `mb-1`
   - **Key UI Elements:**
     - Horizontal bar chart
     - Progress bars with labels
     - Empty state message

5. **`/Users/chris/repos/chrisrodz.io/src/components/cafe/QualityChart.tsx`**
   - **Lines:** 117 lines
   - **Complexity:** LOW
   - **Tailwind Patterns Used:**
     - Colors: `text-gray-300`, `dark:text-gray-600`, `text-blue-600`, `fill-blue-600`
     - Typography: `text-xs`, `text-center`
     - Spacing: `py-8`, `mt-2`, `px-4`
     - SVG Styling: `fill-`, `stroke-`, `dark:fill-`, `dark:stroke-`
   - **Key UI Elements:**
     - SVG line chart
     - Grid lines
     - Data points with tooltips
     - X-axis labels

#### Astro Pages (2 files)

6. **`/Users/chris/repos/chrisrodz.io/src/pages/admin/cafe.astro`**
   - **Lines:** 234 lines
   - **Complexity:** LOW
   - **Tailwind Patterns Used:**
     - Layout: None (uses inline styles and classes)
     - Colors: `bg-yellow-50`, `dark:bg-yellow-900/20`, `text-blue-600`, `text-yellow-900`
     - Borders: `border`, `border-yellow-200`, `rounded-lg`
     - Spacing: `p-6`, `mb-6`, `mb-4`, `space-y-2`
     - Typography: `text-xl`, `font-semibold`
     - Interactive: `hover:text-blue-700`, `inline-flex items-center gap-2`
   - **Key UI Elements:**
     - Back navigation link
     - Warning banner for unconfigured database
     - Success/error messages
     - CoffeeLogForm component embed

7. **`/Users/chris/repos/chrisrodz.io/src/pages/cafe.astro`**
   - **Lines:** 224 lines
   - **Complexity:** MEDIUM-HIGH
   - **Tailwind Patterns Used:**
     - Layout: `grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-2`, `gap-4`, `gap-6`
     - Colors: `bg-white`, `dark:bg-gray-800`, `bg-yellow-50`, `text-gray-600`
     - Borders: `border border-gray-200`, `rounded-lg`, `border-b border-b-2`
     - Spacing: `p-6`, `mb-8`, `mb-2`, `mb-4`
     - Typography: `text-sm`, `text-3xl`, `text-4xl`, `text-xl`, `font-bold`, `font-semibold`
     - Responsive: `sm:grid-cols-3`, `lg:grid-cols-2`, `max-w-xs`
     - Tables: Custom responsive table styling
   - **Key UI Elements:**
     - 3-column stats cards (Total Logs, This Week, Avg Rating)
     - 2-column chart grid (Brew Method, Quality Over Time)
     - Most Used Beans section
     - Recent Brews table with 7 columns
     - Empty states for no data
     - Warning banners

8. **`/Users/chris/repos/chrisrodz.io/src/pages/admin/index.astro`**
   - **Lines:** 119 lines
   - **Complexity:** VERY LOW
   - **Tailwind Patterns Used:** NONE
   - **Note:** This file uses inline styles and PicoCSS's `.grid` class. No Tailwind migration needed.

### Configuration Files to Modify

1. **`/Users/chris/repos/chrisrodz.io/package.json`**
   - Remove dependencies:
     - `@astrojs/tailwind` (line 24)
     - `tailwindcss` (line 34)
     - `@tailwindcss/typography` (line 39)

2. **`/Users/chris/repos/chrisrodz.io/astro.config.mjs`**
   - Remove import: `import tailwind from '@astrojs/tailwind';` (line 3)
   - Remove integration: `tailwind(),` (line 15)

3. **`/Users/chris/repos/chrisrodz.io/tailwind.config.mjs`**
   - DELETE entire file (138 lines)

4. **`/Users/chris/repos/chrisrodz.io/src/styles/global.css`**
   - Remove lines 2-4: `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`
   - Convert `@apply` usage (line 393: `.prose { @apply max-w-none; }`)
   - Keep all PicoCSS custom properties and component styles

---

## Part 2: PicoCSS Pattern Library

### Understanding PicoCSS Philosophy

PicoCSS is a **semantic, classless CSS framework** that:

- Styles native HTML elements automatically
- Uses CSS variables for theming
- Has built-in dark mode support
- Requires minimal custom classes

**Key Differences from Tailwind:**

- Tailwind: Utility-first, many classes per element
- PicoCSS: Semantic HTML with few/no classes, CSS variables for customization

**Our Migration Strategy:**
While PicoCSS can work entirely classless, we're creating a small library of **reusable component classes** (e.g., `.stat-card`, `.chart-label`, `.radio-card`) that:

1. Encapsulate common UI patterns
2. Use PicoCSS CSS variables internally for theming
3. Keep our JSX/Astro files clean and readable
4. Make styling changes easier (update one class definition vs. many inline styles)

### Available PicoCSS Features

#### CSS Variables (Available for Use)

**Colors:**

```css
--pico-background-color
--pico-color                    /* Text color */
--pico-primary                  /* Primary button/link color */
--pico-primary-hover
--pico-primary-focus
--pico-secondary
--pico-secondary-hover
--pico-contrast                 /* High contrast color */
--pico-muted-color              /* Muted/secondary text */
--pico-h1-color through --pico-h6-color
```

**Form Elements:**

```css
--pico-form-element-background-color
--pico-form-element-border-color
--pico-form-element-spacing-vertical
```

**Borders & Spacing:**

```css
--pico-border-radius
--pico-border-width
--pico-spacing
--pico-typography-spacing-vertical
--pico-block-spacing-vertical
--pico-muted-border-color
```

**Cards/Containers:**

```css
--pico-card-background-color
--pico-card-border-color
--pico-card-box-shadow
```

#### PicoCSS Built-in Styles

**Forms:**

- `<input>`, `<select>`, `<textarea>` are styled automatically
- Width: 100% by default
- Use `<label>` for field labels (can wrap inputs or be separate)
- Use `<small>` for helper text
- Use `<fieldset>` and `<legend>` for grouping

**Buttons:**

- `<button>` and `<a role="button">` are styled
- States: `:hover`, `:active`, `[disabled]`, `[aria-busy="true"]`
- No classes needed for basic buttons

**Layout:**

- `.container`: Centered container with max-width
- `.grid`: Simple grid layout (auto-columns, collapses on mobile <768px)

**Colors/States:**

- Automatic dark mode via `[data-theme="dark"]`
- Semantic HTML colors (e.g., `<ins>` = success, `<del>` = error, `<mark>` = warning)

### Tailwind to PicoCSS Pattern Conversions

#### Pattern 1: Container/Wrapper

**Tailwind:**

```tsx
<div className="max-w-2xl mx-auto">{/* content */}</div>
```

**PicoCSS:**

```tsx
<div className="form-container">{/* content */}</div>
```

**CSS (add to global.css):**

```css
.form-container {
  max-width: 48rem;
  margin: 0 auto;
}
```

#### Pattern 2: Success/Error Messages

**Tailwind:**

```tsx
<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
  <h2 className="text-xl font-semibold mb-4 text-green-900 dark:text-green-100">
    {submitStatus.message}
  </h2>
</div>
```

**PicoCSS:**

```tsx
{
  /* Use semantic <ins> for success */
}
<ins className="message-card">
  <h2>{submitStatus.message}</h2>
</ins>;
```

**CSS (add to global.css):**

```css
.message-card {
  display: block;
  padding: var(--pico-spacing);
  border-radius: var(--pico-border-radius);
  text-align: center;
  text-decoration: none;
}

.message-card h2 {
  margin-bottom: var(--pico-spacing);
}

/* Error variant */
.message-card[data-variant='error'] {
  background: var(--pico-del-color);
  border: 1px solid var(--pico-del-color);
}
```

#### Pattern 3: Grid Layouts (2-3 columns)

**Tailwind:**

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
</div>
```

**PicoCSS:**

```tsx
<div className="grid">
  <div>Column 1</div>
  <div>Column 2</div>
</div>
```

**CSS (for custom column counts):**

```css
/* PicoCSS .grid auto-sizes columns, but we can customize */
.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--pico-spacing);
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--pico-spacing);
}

@media (max-width: 768px) {
  .grid-2,
  .grid-3 {
    grid-template-columns: 1fr;
  }
}
```

#### Pattern 4: Stats Cards

**Tailwind:**

```tsx
<div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Total Logs</div>
  <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">{stats?.totalLogs}</div>
</div>
```

**PicoCSS:**

```tsx
<article className="stat-card">
  <small>Total Logs</small>
  <p className="stat-value">{stats?.totalLogs}</p>
</article>
```

**CSS (add to global.css):**

```css
.stat-card {
  background: var(--pico-card-background-color);
  border: 1px solid var(--pico-card-border-color);
  border-radius: var(--pico-border-radius);
  padding: var(--pico-spacing);
  margin-bottom: 0;
}

.stat-card small {
  display: block;
  color: var(--pico-muted-color);
  margin-bottom: calc(var(--pico-spacing) * 0.25);
  font-weight: 500;
  font-size: 0.875rem;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--pico-color);
  margin: 0;
  line-height: 1;
}
```

#### Pattern 5: Form Inputs with Labels

**Tailwind:**

```tsx
<div>
  <label
    htmlFor="dose_grams"
    className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100"
  >
    Coffee Dose (grams) *
  </label>
  <input
    type="number"
    id="dose_grams"
    value={doseGrams}
    onChange={(e) => setDoseGrams(Number(e.target.value))}
    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
  />
</div>
```

**PicoCSS:**

```tsx
<label>
  Coffee Dose (grams) *
  <input
    type="number"
    id="dose_grams"
    value={doseGrams}
    onChange={(e) => setDoseGrams(Number(e.target.value))}
    min="1"
    max="100"
    required
  />
</label>
```

**Note:** PicoCSS automatically styles inputs with proper focus states, borders, dark mode support. No custom CSS needed!

#### Pattern 6: Buttons

**Tailwind:**

```tsx
<button
  type="submit"
  disabled={isSubmitting}
  className="w-full p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
>
  {isSubmitting ? 'Logging...' : 'Log Coffee'}
</button>
```

**PicoCSS:**

```tsx
<button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="full-width">
  {isSubmitting ? 'Logging...' : 'Log Coffee'}
</button>
```

**CSS (add to global.css):**

```css
button.full-width,
a[role='button'].full-width {
  width: 100%;
}
```

#### Pattern 7: Custom Radio Buttons (Brew Method Selector)

**Tailwind:**

```tsx
<button
  type="button"
  role="radio"
  aria-checked={brewMethod === method}
  onClick={() => setBrewMethod(method)}
  className={`p-4 rounded-lg border-2 font-medium transition-all ${
    brewMethod === method
      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
      : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:border-blue-400'
  }`}
>
  {method}
</button>
```

**PicoCSS:**

```tsx
<button
  type="button"
  role="radio"
  aria-checked={brewMethod === method}
  onClick={() => setBrewMethod(method)}
  className="radio-card"
  data-active={brewMethod === method}
>
  {method}
</button>
```

**CSS (add to global.css):**

```css
.radio-card {
  background: var(--pico-card-background-color);
  border: 2px solid var(--pico-form-element-border-color);
  padding: var(--pico-spacing);
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.radio-card:hover {
  border-color: var(--pico-primary);
}

.radio-card[data-active='true'] {
  border-color: var(--pico-primary);
  background: var(--pico-primary-focus);
  color: var(--pico-primary);
}
```

#### Pattern 8: Star Rating (Circular Buttons)

**Tailwind:**

```tsx
<button
  className={`w-12 h-12 rounded-full border-2 transition-all hover:scale-110 ${
    isFilled
      ? 'bg-blue-600 border-blue-600 dark:bg-blue-500'
      : 'bg-transparent border-gray-300 dark:border-gray-600'
  }`}
>
  <span className={isFilled ? 'text-white' : 'text-gray-600 dark:text-gray-400'}>{rating}</span>
</button>
```

**PicoCSS:**

```tsx
<button className="star-button" data-filled={isFilled} aria-checked={isSelected}>
  <span>{rating}</span>
</button>
```

**CSS (add to global.css):**

```css
.star-button {
  width: 3rem;
  height: 3rem;
  min-width: 48px;
  min-height: 48px;
  border-radius: 50%;
  border: 2px solid var(--pico-muted-border-color);
  background: transparent;
  transition: all 0.2s ease;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.star-button:hover {
  transform: scale(1.1);
  border-color: var(--pico-primary);
}

.star-button:active {
  transform: scale(0.95);
}

.star-button[data-filled='true'] {
  background: var(--pico-primary);
  border-color: var(--pico-primary);
}

.star-button[data-filled='true'] span {
  color: var(--pico-primary-inverse);
}

.star-button[data-filled='false'] span {
  color: var(--pico-muted-color);
}
```

#### Pattern 9: Progress Bars (Brew Method Chart)

**Tailwind:**

```tsx
<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
  <div
    className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
    style={{ width: `${(item.count / maxCount) * 100}%` }}
  />
</div>
```

**PicoCSS:**

```tsx
<progress value={item.count} max={maxCount}></progress>
```

**CSS (PicoCSS styles `<progress>` automatically! If customization needed):**

```css
progress {
  height: 0.75rem;
}
```

#### Pattern 10: Tables

**Tailwind:**

```tsx
<table className="w-full">
  <thead>
    <tr className="border-b-2 border-gray-300 dark:border-gray-600">
      <th className="text-left py-3 px-3 font-semibold text-gray-900 dark:text-gray-100">Date</th>
    </tr>
  </thead>
</table>
```

**PicoCSS:**

```tsx
<table>
  <thead>
    <tr>
      <th>Date</th>
    </tr>
  </thead>
</table>
```

**Note:** PicoCSS automatically styles tables! No classes needed.

#### Pattern 11: Highlighted Sections (Info/Warning Boxes)

**Tailwind:**

```tsx
<section className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
  <h2 className="text-xl font-semibold mb-4">Database Not Configured</h2>
  <p>Coffee tracking requires Supabase...</p>
</section>
```

**PicoCSS:**

```tsx
<section className="notice-box" data-variant="warning">
  <h2>Database Not Configured</h2>
  <p>Coffee tracking requires Supabase...</p>
</section>
```

**CSS (add to global.css):**

```css
.notice-box {
  border-radius: var(--pico-border-radius);
  padding: var(--pico-spacing);
  margin-bottom: var(--pico-spacing);
}

.notice-box[data-variant='warning'] {
  background: var(--pico-mark-background-color);
  border: 1px solid var(--pico-mark-color);
  color: var(--pico-mark-color);
}

.notice-box[data-variant='info'] {
  background: var(--pico-ins-color);
  border: 1px solid var(--pico-primary);
}

.notice-box h2 {
  margin-top: 0;
}
```

#### Pattern 12: Inline Highlight Container (Add Bean Form)

**Tailwind:**

```tsx
<div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
  <div className="flex items-center gap-2 mb-3">
    <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">Add New Bean</span>
  </div>
  {/* form fields */}
</div>
```

**PicoCSS:**

```tsx
<article className="inline-form">
  <header>Add New Bean</header>
  {/* form fields */}
</article>
```

**CSS (add to global.css):**

```css
.inline-form {
  background: var(--pico-primary-focus);
  border: 2px solid var(--pico-primary);
  border-radius: var(--pico-border-radius);
  padding: var(--pico-spacing);
  margin-top: var(--pico-spacing);
}

.inline-form header {
  color: var(--pico-primary);
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: calc(var(--pico-spacing) * 0.75);
}
```

---

## Part 3: File-by-File Migration Checklist

### File 1: CoffeeLogForm.tsx

**Path:** `/Users/chris/repos/chrisrodz.io/src/components/cafe/CoffeeLogForm.tsx`
**Complexity:** HIGH
**Estimated Time:** 2-3 hours

**Success Criteria:**

- [ ] No `className` props contain Tailwind classes (bg-, text-, border-, p-, m-, gap-, grid-cols, rounded-, etc.)
- [ ] Form submits successfully (test with valid data)
- [ ] Success message displays after submission
- [ ] Error messages display for validation failures
- [ ] Dark mode toggle works (no broken colors)
- [ ] Mobile view: brew method buttons stack vertically
- [ ] Star rating component works (clicking selects rating)
- [ ] Add bean inline form toggles open/closed
- [ ] No console errors in browser devtools
- [ ] All interactive states work (hover, focus, disabled)

**Changes Required:**

1. **Lines 170-184: Success Message Card**
   - Remove Tailwind classes from outer `<div>`
   - Use semantic `<ins>` tag or `<article>` with custom class
   - Replace button classes with PicoCSS defaults

2. **Lines 186-191: Error Message**
   - Replace with `.notice-box[data-variant="error"]`

3. **Lines 193-217: Brew Method Radio Group**
   - Replace `grid grid-cols-1 sm:grid-cols-3 gap-3` with `.grid-3`
   - Replace button classes with `.radio-card` + `data-active` attribute
   - Remove all color/border/spacing Tailwind classes

4. **Lines 220-252: Bean Selection Dropdown + Add Bean Form**
   - Remove label classes (PicoCSS handles)
   - Remove select classes (PicoCSS handles)
   - Add bean form uses inline-form pattern (see File 3)

5. **Lines 254-299: Dose/Yield Grid**
   - Replace `grid grid-cols-1 sm:grid-cols-2 gap-4` with `.grid`
   - Remove all input classes (PicoCSS handles)
   - Remove label classes (PicoCSS handles)

6. **Lines 301-322: Grind Setting**
   - Remove all classes from label and input

7. **Lines 324-335: Quality Rating**
   - StarRating component migration (see File 6)
   - Update error text styling

8. **Lines 337-354: Brew Time**
   - Remove all classes from label and input

9. **Lines 356-383: Notes (Collapsible)**
   - Simplify button classes
   - Remove textarea classes (PicoCSS handles)

10. **Lines 386-396: Submit Button**
    - Replace with basic `<button>` + `.full-width` class
    - Use `aria-busy` for loading state

**Testing Requirements:**

- Form submission works
- Validation errors display correctly
- Success/error states work
- Dark mode renders properly
- Mobile responsive (brew method buttons stack)
- Star rating component functions
- Add bean inline form toggles correctly

**Code Snippet (Before/After):**

**Before (Lines 193-217):**

```tsx
<fieldset>
  <legend className="block text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">
    Brew Method *
  </legend>
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup">
    {BREW_METHODS.map((method) => (
      <button
        key={method}
        type="button"
        role="radio"
        aria-checked={brewMethod === method}
        onClick={() => setBrewMethod(method)}
        className={`p-4 rounded-lg border-2 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          brewMethod === method
            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
            : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:border-blue-400'
        }`}
        style={{ minHeight: '48px' }}
      >
        {method}
      </button>
    ))}
  </div>
</fieldset>
```

**After:**

```tsx
<fieldset>
  <legend>Brew Method *</legend>
  <div className="grid-3" role="radiogroup">
    {BREW_METHODS.map((method) => (
      <button
        key={method}
        type="button"
        role="radio"
        aria-checked={brewMethod === method}
        onClick={() => setBrewMethod(method)}
        className="radio-card"
        data-active={brewMethod === method}
      >
        {method}
      </button>
    ))}
  </div>
</fieldset>
```

---

### File 2: AddBeanForm.tsx

**Path:** `/Users/chris/repos/chrisrodz.io/src/components/cafe/AddBeanForm.tsx`
**Complexity:** MEDIUM
**Estimated Time:** 45 minutes

**Success Criteria:**

- [ ] No Tailwind classes remain
- [ ] Form submits and creates new bean
- [ ] Error states display correctly
- [ ] Dark mode works
- [ ] Mobile responsive (form fields stack)
- [ ] All form inputs work (text, date, textarea)
- [ ] No console errors

**Changes Required:**

1. **Lines 72-76: Outer Container + Header**
   - Replace `bg-blue-50 dark:bg-blue-900/20 border-2...` with `.inline-form`
   - Simplify header to just `<header>Add New Bean</header>`

2. **Lines 78-83: Error Message**
   - Replace with `.notice-box[data-variant="error"]`

3. **Lines 85-104: Bean Name Input**
   - Remove all classes from label and input

4. **Lines 106-124: Roaster Input**
   - Remove all classes from label and input

5. **Lines 126-142: Roast Date Input**
   - Remove all classes from label and input

6. **Lines 144-161: Notes Textarea**
   - Remove all classes from label and textarea

7. **Lines 163-173: Submit Button**
   - Replace with basic `<button>` + custom class for green variant

**Testing Requirements:**

- Form submission creates bean
- Error states display
- Dark mode works
- Mobile responsive

**Code Snippet (Before/After):**

**Before (Lines 72-104):**

```tsx
<div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
  <div className="flex items-center gap-2 mb-3">
    <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">Add New Bean</span>
  </div>
  <div className="space-y-3">
    {error && (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
        <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
      </div>
    )}
    <div>
      <label
        htmlFor="bean_name"
        className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100"
      >
        Bean Name *
      </label>
      <input
        type="text"
        id="bean_name"
        value={beanName}
        onChange={(e) => setBeanName(e.target.value)}
        required
        maxLength={200}
        placeholder="e.g., Ethiopia Yirgacheffe"
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        style={{ minHeight: '48px' }}
      />
    </div>
```

**After:**

```tsx
<article className="inline-form">
  <header>Add New Bean</header>

  {error && (
    <div className="notice-box" data-variant="error">
      <p>{error}</p>
    </div>
  )}

  <label>
    Bean Name *
    <input
      type="text"
      id="bean_name"
      value={beanName}
      onChange={(e) => setBeanName(e.target.value)}
      required
      maxLength={200}
      placeholder="e.g., Ethiopia Yirgacheffe"
    />
  </label>
```

---

### File 3: admin/cafe.astro

**Path:** `/Users/chris/repos/chrisrodz.io/src/pages/admin/cafe.astro`
**Complexity:** LOW
**Estimated Time:** 20 minutes

**Success Criteria:**

- [ ] No Tailwind classes remain
- [ ] Navigation back link works
- [ ] Warning box displays when DB not configured
- [ ] Success/error messages display correctly
- [ ] Form (CoffeeLogForm component) works
- [ ] Dark mode works
- [ ] No console errors

**Changes Required:**

1. **Lines 160-167: Back Navigation**
   - Simplify classes to just link styling

2. **Lines 169-172: Page Header**
   - Remove Tailwind typography classes

3. **Lines 175-197: Warning Box (Database Not Configured)**
   - Replace with `.notice-box[data-variant="warning"]`

4. **Lines 200-210: Success/Error Messages**
   - Replace with `.notice-box[data-variant="success"|"error"]`

**Testing Requirements:**

- Navigation works
- Warning box displays when DB not configured
- Form submission messages work
- Dark mode works

---

### File 4: cafe.astro

**Path:** `/Users/chris/repos/chrisrodz.io/src/pages/cafe.astro`
**Complexity:** MEDIUM-HIGH
**Estimated Time:** 1.5-2 hours

**Success Criteria:**

- [ ] No Tailwind classes remain
- [ ] Stats cards display correctly (3 columns on desktop)
- [ ] Charts render properly (BrewMethodChart, QualityChart)
- [ ] Most Used Beans section displays
- [ ] Recent Brews table is readable on desktop and mobile
- [ ] Empty states work (no data messages)
- [ ] Warning banner shows when DB not configured
- [ ] Dark mode works
- [ ] Mobile responsive (cards stack, table scrolls)
- [ ] No console errors

**Changes Required:**

1. **Lines 56-72: Warning/Empty States**
   - Replace with `.notice-box` pattern

2. **Lines 76-95: Stats Cards Grid**
   - Replace `grid grid-cols-1 sm:grid-cols-3 gap-4` with `.grid-3`
   - Replace card div with `.stat-card` article
   - Remove all Tailwind typography classes

3. **Lines 98-114: Chart Grid**
   - Replace `grid grid-cols-1 lg:grid-cols-2 gap-6` with `.grid`
   - Replace card divs with `<article>` tags
   - Update chart component props if needed

4. **Lines 117-140: Most Used Beans Section**
   - Replace card div with `<article>`
   - Simplify spacing classes

5. **Lines 143-206: Recent Brews Table**
   - Remove ALL Tailwind classes from table
   - Let PicoCSS handle table styling
   - Move responsive CSS to global.css if needed

**Testing Requirements:**

- Stats display correctly
- Charts render properly
- Table is readable on mobile
- Empty states work
- Dark mode works

**Code Snippet (Before/After):**

**Before (Lines 76-95):**

```astro
<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
    <div class="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Total Logs</div>
    <div class="text-4xl font-bold text-gray-900 dark:text-gray-100">
      {stats?.totalLogs}
    </div>
  </div>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
    <div class="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">This Week</div>
    <div class="text-4xl font-bold text-gray-900 dark:text-gray-100">
      {stats?.logsThisWeek}
    </div>
  </div>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
    <div class="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Avg Rating</div>
    <div class="text-4xl font-bold text-gray-900 dark:text-gray-100">
      {stats?.avgRating} / 5
    </div>
  </div>
</div>
```

**After:**

```astro
<div class="grid-3 mb">
  <article class="stat-card">
    <small>Total Logs</small>
    <p class="stat-value">{stats?.totalLogs}</p>
  </article>
  <article class="stat-card">
    <small>This Week</small>
    <p class="stat-value">{stats?.logsThisWeek}</p>
  </article>
  <article class="stat-card">
    <small>Avg Rating</small>
    <p class="stat-value">{stats?.avgRating} / 5</p>
  </article>
</div>
```

---

### File 5: StarRating.tsx

**Path:** `/Users/chris/repos/chrisrodz.io/src/components/cafe/StarRating.tsx`
**Complexity:** MEDIUM
**Estimated Time:** 30 minutes

**Success Criteria:**

- [ ] No Tailwind classes remain
- [ ] Click to select rating works
- [ ] Hover effects work (scale animation)
- [ ] Keyboard navigation works (arrow keys, Enter)
- [ ] Selected rating shows filled state
- [ ] Dark mode works
- [ ] Accessibility attributes work (aria-checked, role)
- [ ] No console errors

**Changes Required:**

1. **Lines 48-92: Rating Buttons**
   - Replace outer `className="flex gap-3"` with simple flexbox or inline-block
   - Replace all button classes with `.star-button` + `data-filled` attribute
   - Remove all Tailwind color/sizing classes

**Testing Requirements:**

- Click to select rating
- Hover effects work
- Keyboard navigation works (arrow keys)
- Dark mode works
- Accessibility (screen reader announcements)

---

### File 6: BrewMethodChart.tsx

**Path:** `/Users/chris/repos/chrisrodz.io/src/components/cafe/BrewMethodChart.tsx`
**Complexity:** LOW
**Estimated Time:** 20 minutes

**Success Criteria:**

- [ ] No Tailwind classes remain
- [ ] Progress bars display correctly
- [ ] Percentages show next to labels
- [ ] Empty state message displays when no data
- [ ] Dark mode works (bars visible)
- [ ] Labels are readable
- [ ] No console errors

**Changes Required:**

1. **Lines 14-16: Empty State**
   - Remove Tailwind classes, use semantic styling

2. **Lines 23-39: Progress Bars**
   - Replace custom div progress bars with `<progress>` element
   - Remove all Tailwind classes
   - Let PicoCSS handle styling

**Testing Requirements:**

- Progress bars display correctly
- Percentages show
- Dark mode works
- Labels are readable

**Code Snippet (Before/After):**

**Before (Lines 23-39):**

```tsx
<div className="space-y-4">
  {data.map((item) => (
    <div key={item.method}>
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.method}</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {item.count} ({item.percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${(item.count / maxCount) * 100}%` }}
        />
      </div>
    </div>
  ))}
</div>
```

**After:**

```tsx
<div className="chart-container">
  {data.map((item) => (
    <div key={item.method} className="chart-item">
      <div className="chart-label">
        <strong>{item.method}</strong>
        <small>
          {item.count} ({item.percentage}%)
        </small>
      </div>
      <progress value={item.count} max={maxCount}></progress>
    </div>
  ))}
</div>
```

---

### File 7: QualityChart.tsx

**Path:** `/Users/chris/repos/chrisrodz.io/src/components/cafe/QualityChart.tsx`
**Complexity:** LOW
**Estimated Time:** 15 minutes

**Success Criteria:**

- [ ] No Tailwind classes remain (including SVG classes)
- [ ] Chart renders correctly
- [ ] Tooltips work on hover over data points
- [ ] Dark mode colors work (line and grid visible)
- [ ] Labels are readable on X-axis
- [ ] Empty state displays when no data
- [ ] No console errors

**Changes Required:**

1. **Lines 14-16: Empty State**
   - Remove Tailwind classes

2. **Lines 42-114: SVG Chart**
   - Replace color classes with CSS variables
   - Use `var(--pico-primary)` for line color
   - Use `var(--pico-muted-color)` for grid/labels
   - Replace `text-xs` with inline fontSize

**Testing Requirements:**

- Chart renders correctly
- Tooltips work on hover
- Dark mode colors work
- Labels are readable

---

### File 8: admin/index.astro

**Path:** `/Users/chris/repos/chrisrodz.io/src/pages/admin/index.astro`
**Complexity:** VERY LOW
**Estimated Time:** 0 minutes (NO CHANGES NEEDED)

**Note:** This file already uses PicoCSS exclusively. No Tailwind migration required.

---

## Part 4: Configuration Cleanup

### Step 1: Update package.json

**File:** `/Users/chris/repos/chrisrodz.io/package.json`

**Changes:**

1. Remove line 24: `"@astrojs/tailwind": "^5.1.0",`
2. Remove line 34: `"tailwindcss": "^3.4.0",`
3. Remove line 39: `"@tailwindcss/typography": "^0.5.19",`

**Command:**

```bash
yarn remove @astrojs/tailwind tailwindcss @tailwindcss/typography
```

**Verification:**

```bash
grep -E "tailwind|@tailwindcss" package.json
# Should return nothing
```

---

### Step 2: Update astro.config.mjs

**File:** `/Users/chris/repos/chrisrodz.io/astro.config.mjs`

**Changes:**

1. Remove line 3: `import tailwind from '@astrojs/tailwind';`
2. Remove line 15: `tailwind(),`

**Before:**

```js
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://chrisrodz.io',
  output: 'server',
  adapter: vercel(),
  prefetch: true,
  integrations: [
    react(),
    tailwind(),
    sitemap({
      filter: (page) => {
        // Exclude admin pages from sitemap
        if (page.includes('/admin')) return false;
        // Exclude 404 page
        if (page.includes('/404')) return false;
        return true;
      },
    }),
  ],
  // ...
});
```

**After:**

```js
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://chrisrodz.io',
  output: 'server',
  adapter: vercel(),
  prefetch: true,
  integrations: [
    react(),
    sitemap({
      filter: (page) => {
        // Exclude admin pages from sitemap
        if (page.includes('/admin')) return false;
        // Exclude 404 page
        if (page.includes('/404')) return false;
        return true;
      },
    }),
  ],
  // ...
});
```

---

### Step 3: Delete tailwind.config.mjs

**File:** `/Users/chris/repos/chrisrodz.io/tailwind.config.mjs`

**Command:**

```bash
rm tailwind.config.mjs
```

**Verification:**

```bash
ls tailwind.config.mjs
# Should return: No such file or directory
```

---

### Step 4: Update global.css

**File:** `/Users/chris/repos/chrisrodz.io/src/styles/global.css`

**Changes:**

1. **Remove lines 2-4:**

   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

2. **Replace line 393** (the only `@apply` usage):

   ```css
   /* Before */
   .prose {
     @apply max-w-none;
   }

   /* After */
   .prose {
     max-width: none;
   }
   ```

3. **Add new PicoCSS component classes** (add at end of file, before the closing of `@layer components` around line 363):

```css
/* Coffee Tracker Components */

/* Form Container */
.form-container {
  max-width: 48rem;
  margin: 0 auto;
}

/* Grid Layouts */
.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--pico-spacing);
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--pico-spacing);
}

@media (max-width: 768px) {
  .grid-2,
  .grid-3 {
    grid-template-columns: 1fr;
  }
}

/* Spacing Utilities */
.mb {
  margin-bottom: var(--pico-spacing);
}

.mt {
  margin-top: var(--pico-spacing);
}

.space-y {
  display: flex;
  flex-direction: column;
  gap: var(--pico-spacing);
}

/* Message Cards */
.message-card {
  display: block;
  padding: var(--pico-spacing);
  border-radius: var(--pico-border-radius);
  text-align: center;
  text-decoration: none;
}

.message-card h2 {
  margin-bottom: var(--pico-spacing);
  margin-top: 0;
}

/* Notice Boxes (Warning, Error, Info) */
.notice-box {
  border-radius: var(--pico-border-radius);
  padding: var(--pico-spacing);
  margin-bottom: var(--pico-spacing);
}

.notice-box[data-variant='warning'] {
  background: var(--pico-mark-background-color);
  border: 1px solid var(--pico-mark-color);
  color: var(--pico-color);
}

.notice-box[data-variant='error'] {
  background: var(--pico-del-color);
  border: 1px solid var(--pico-del-color);
  color: var(--pico-color);
}

.notice-box[data-variant='info'],
.notice-box[data-variant='success'] {
  background: var(--pico-ins-color);
  border: 1px solid var(--pico-primary);
  color: var(--pico-color);
}

.notice-box h2,
.notice-box h3 {
  margin-top: 0;
}

.notice-box p:last-child {
  margin-bottom: 0;
}

/* Stat Cards */
.stat-card {
  background: var(--pico-card-background-color);
  border: 1px solid var(--pico-card-border-color);
  border-radius: var(--pico-border-radius);
  padding: var(--pico-spacing);
  margin-bottom: 0;
}

.stat-card small {
  display: block;
  color: var(--pico-muted-color);
  margin-bottom: calc(var(--pico-spacing) * 0.25);
  font-weight: 500;
  font-size: 0.875rem;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--pico-color);
  margin: 0;
  line-height: 1;
}

/* Radio Card Buttons (Brew Method Selector) */
.radio-card {
  background: var(--pico-card-background-color);
  border: 2px solid var(--pico-form-element-border-color);
  padding: var(--pico-spacing);
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.radio-card:hover {
  border-color: var(--pico-primary);
}

.radio-card[data-active='true'] {
  border-color: var(--pico-primary);
  background: var(--pico-primary-focus);
  color: var(--pico-primary);
}

/* Star Rating Buttons */
.star-rating {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.star-button {
  width: 3rem;
  height: 3rem;
  min-width: 48px;
  min-height: 48px;
  border-radius: 50%;
  border: 2px solid var(--pico-muted-border-color);
  background: transparent;
  transition: all 0.2s ease;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.star-button:hover {
  transform: scale(1.1);
  border-color: var(--pico-primary);
}

.star-button:active {
  transform: scale(0.95);
}

.star-button[data-filled='true'] {
  background: var(--pico-primary);
  border-color: var(--pico-primary);
}

.star-button[data-filled='true'] span {
  color: var(--pico-primary-inverse);
  font-weight: 600;
}

.star-button[data-filled='false'] span {
  color: var(--pico-muted-color);
  font-weight: 500;
}

/* Inline Form (Add Bean Form) */
.inline-form {
  background: var(--pico-primary-focus);
  border: 2px solid var(--pico-primary);
  border-radius: var(--pico-border-radius);
  padding: var(--pico-spacing);
  margin-top: var(--pico-spacing);
}

.inline-form header {
  color: var(--pico-primary);
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: calc(var(--pico-spacing) * 0.75);
  display: block;
}

/* Full Width Buttons */
button.full-width,
a[role='button'].full-width {
  width: 100%;
}

/* Button Variants */
button.secondary {
  background: var(--pico-secondary);
}

button.secondary:hover {
  background: var(--pico-secondary-hover);
}

button[data-variant='success'] {
  --pico-background-color: #16a34a;
  --pico-border-color: #16a34a;
}

button[data-variant='success']:hover {
  --pico-background-color: #15803d;
  --pico-border-color: #15803d;
}

/* Progress Bars (if needed beyond PicoCSS defaults) */
progress {
  height: 0.75rem;
}

/* Chart Components */
.chart-container {
  display: flex;
  flex-direction: column;
  gap: var(--pico-spacing);
}

.chart-item {
  display: flex;
  flex-direction: column;
}

.chart-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  align-items: baseline;
}
```

**Verification:**

```bash
grep -E "@tailwind|@apply" src/styles/global.css
# Should return nothing
```

---

## Part 5: Testing Strategy

### Pre-Migration Testing (Create Baseline)

1. **Take Screenshots:**
   - `/cafe` page (all states: with data, empty, error)
   - `/admin/cafe` page (logged in, form view)
   - StarRating component (all states)
   - Brew method selector (selected/unselected)
   - Stats cards on mobile/desktop
   - Tables on mobile/desktop

2. **Test Dark Mode:**
   - Toggle dark mode and verify all pages render correctly

3. **Test Responsive:**
   - Test at 375px (mobile), 768px (tablet), 1440px (desktop)

### During Migration Testing (After Each File)

**After Each Component Migration:**

1. Run `yarn dev`
2. Navigate to the page using the component
3. Test all interactive features
4. Toggle dark mode
5. Test on mobile viewport
6. Check browser console for errors
7. Verify no styling regressions

**After Each Page Migration:**

1. Visit the page in browser
2. Test all states (empty, with data, error)
3. Test form submissions
4. Verify navigation
5. Test dark mode
6. Test mobile responsive
7. Compare to baseline screenshots

### Post-Migration Testing (Full Regression)

#### Visual Testing Checklist

- [ ] Homepage renders correctly
- [ ] Blog index renders correctly
- [ ] Individual blog posts render correctly
- [ ] `/cafe` page:
  - [ ] Stats cards display correctly
  - [ ] Charts render properly (BrewMethodChart, QualityChart)
  - [ ] Table is readable on desktop
  - [ ] Table is readable/scrollable on mobile
  - [ ] Empty state displays
  - [ ] Warning banner displays when DB not configured
- [ ] `/admin` page:
  - [ ] Login form works
  - [ ] Dashboard links display
  - [ ] Grid layout works
- [ ] `/admin/cafe` page:
  - [ ] Form displays correctly
  - [ ] Brew method selector works (3 columns on desktop, stacks on mobile)
  - [ ] Bean dropdown works
  - [ ] Add bean inline form toggles
  - [ ] StarRating works (click, hover, keyboard)
  - [ ] Form inputs styled correctly
  - [ ] Submit button has proper states
  - [ ] Success message displays
  - [ ] Error messages display

#### Functional Testing Checklist

- [ ] Coffee logging form submission works
- [ ] Bean creation works (inline form)
- [ ] Star rating selection works (mouse + keyboard)
- [ ] Brew method selection works
- [ ] Form validation errors display
- [ ] Success/error messages show after submission
- [ ] Charts display data correctly
- [ ] Table sorting/display works

#### Dark Mode Testing Checklist

- [ ] All pages render in dark mode
- [ ] Text is readable (proper contrast)
- [ ] Buttons have proper hover states
- [ ] Form inputs are styled correctly
- [ ] Charts use proper colors
- [ ] Tables are readable
- [ ] Cards/borders visible
- [ ] Success/error/warning boxes visible

#### Responsive Testing Checklist

**Mobile (375px):**

- [ ] Navigation works
- [ ] Brew method buttons stack vertically
- [ ] Form inputs full width
- [ ] Stats cards stack
- [ ] Charts visible and responsive
- [ ] Table scrolls horizontally or wraps

**Tablet (768px):**

- [ ] Grid layouts show 2 columns where appropriate
- [ ] Charts side-by-side
- [ ] Forms properly sized

**Desktop (1440px):**

- [ ] Stats cards 3 columns
- [ ] Charts 2 columns
- [ ] Forms centered with max-width
- [ ] Tables full width

#### Accessibility Testing Checklist

- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] Form labels associated with inputs
- [ ] Error messages announced
- [ ] Buttons have accessible names
- [ ] Star rating keyboard navigation works
- [ ] Color contrast meets WCAG AA (use browser devtools)

#### Performance Testing Checklist

- [ ] Page load time acceptable
- [ ] No console errors
- [ ] No console warnings
- [ ] Bundle size reduced (check Network tab)
- [ ] No layout shifts (CLS)

#### Browser Compatibility Testing

**Test in:**

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Safari iOS (if available)
- [ ] Chrome Android (if available)

---

## Common Issues During Migration

### Issue 1: "Module not found" or Import Errors After Removing Tailwind

**Symptoms:** Build fails with errors about missing modules
**Cause:** Tailwind imports or references still exist in files
**Solution:**

```bash
# Search for any remaining Tailwind imports
grep -r "tailwind" src/ --include="*.tsx" --include="*.astro" --include="*.ts" --include="*.js"
# Remove any found imports

# Also check for @tailwindcss references
grep -r "@tailwindcss" src/
```

### Issue 2: Styles Don't Apply After Migration

**Symptoms:** Elements have no styling or look broken
**Cause:** Custom class not defined in global.css, or typo in className
**Solution:**

1. Check that the class exists in global.css (Part 4, Step 4 has all classes)
2. Verify className spelling matches exactly (case-sensitive)
3. Check browser devtools Elements tab to see if class is applied
4. Ensure global.css is imported in your layout

### Issue 3: Dark Mode Broken (Colors Wrong or Invisible)

**Symptoms:** Dark mode toggle doesn't work, or elements invisible in dark mode
**Cause:** Using hardcoded colors instead of PicoCSS variables
**Solution:**

1. Replace hardcoded colors with CSS variables:

   ```css
   /* Wrong */
   color: #333;
   background: #fff;

   /* Correct */
   color: var(--pico-color);
   background: var(--pico-card-background-color);
   ```

2. Or use semantic HTML elements that PicoCSS styles automatically
3. Test dark mode after each component migration

### Issue 4: Layout Broken on Mobile

**Symptoms:** Elements overlap, don't stack, or overflow screen
**Cause:** Missing responsive classes or incorrect grid setup
**Solution:**

1. Use responsive grid classes (`.grid-2`, `.grid-3` with media query in global.css)
2. Test mobile viewport in devtools (F12 → Toggle device toolbar)
3. Check that PicoCSS `.grid` collapses at 768px (built-in behavior)

### Issue 5: Site Crashes with "Cannot read property of undefined"

**Symptoms:** White screen, React error in console
**Cause:** Removed a className that had conditional logic, breaking JavaScript
**Solution:**

1. Check git diff to see what changed
2. Ensure data-attributes are still present (e.g., `data-active`, `data-filled`, `data-variant`)
3. Verify boolean props still work with attributes:

   ```tsx
   {/* Correct */}
   <button data-active={isActive}>

   {/* Wrong - removed too much */}
   <button>
   ```

### Issue 6: TypeScript/Build Errors About className

**Symptoms:** Type errors like "Property 'className' does not exist"
**Cause:** Astro vs React syntax confusion
**Solution:**

- React/TSX: Use `className="..."`
- Astro: Use `class="..."`
- Don't mix them up!

### Issue 7: Changes Not Showing in Browser

**Symptoms:** Saved file changes, but browser shows old styles
**Cause:** Browser cache or dev server not reloading
**Solution:**

1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Restart dev server: Stop yarn dev (Ctrl+C), then `yarn dev` again
3. Clear browser cache in devtools (F12 → Network tab → "Disable cache" checkbox)

### Issue 8: Vercel Build Fails (But Local Build Works)

**Symptoms:** Deployment fails with errors
**Cause:** Different Node version, missing env vars, or caching issue
**Solution:**

1. Check Vercel build logs for specific error
2. Ensure all files committed and pushed
3. Try redeploying from Vercel dashboard
4. Check Node version matches (Vercel uses Node 20+)

---

## Part 6: Step-by-Step Migration Execution

### Prerequisites Check

**Before starting, verify these requirements:**

```bash
# 1. On main branch with latest changes
git checkout main
git pull

# 2. Verify clean working tree
git status
# Expected: "nothing to commit, working tree clean"

# 3. Dependencies installed
yarn install

# 4. Site builds successfully
yarn build
# Expected: Successful build, check dist/ folder created

# 5. Dev server works
yarn dev
# Expected: Site accessible at http://localhost:4321
# Test: Visit homepage, blog, /cafe, /admin pages
```

**If any check fails, resolve issues before continuing with the migration.**

Common fixes:

- Uncommitted changes: `git add . && git commit -m "WIP: save work"` or `git stash`
- Build errors: Check error messages, fix syntax/type errors
- Dev server issues: Kill any processes on port 4321: `lsof -ti:4321 | xargs kill`

---

### Phase 1: Preparation (15 minutes)

1. **Create Feature Branch:**

   ```bash
   cd /Users/chris/repos/chrisrodz.io
   git checkout main
   git pull
   git checkout -b refactor/remove-tailwind-standardize-pico
   ```

2. **Take Baseline Screenshots:**
   - Run `yarn dev`
   - Visit `/cafe`, `/admin`, `/admin/cafe`
   - Take screenshots in light/dark mode
   - Test on mobile viewport

3. **Create Backup:**
   ```bash
   git add .
   git commit -m "Checkpoint before Tailwind removal"
   ```

### Phase 2: Add PicoCSS Components (30 minutes)

1. **Update global.css:**
   - Open `/Users/chris/repos/chrisrodz.io/src/styles/global.css`
   - Remove lines 2-4 (`@tailwind` directives)
   - Replace line 393 (`@apply max-w-none` → `max-width: none;`)
   - Add all new PicoCSS component classes from Part 4, Step 4
   - Save file

2. **Verify Changes:**

   ```bash
   # Check that @tailwind directives are removed
   grep "@tailwind" src/styles/global.css
   # Expected: No output (should be removed)

   # Check that @apply is removed/converted
   grep "@apply" src/styles/global.css
   # Expected: No output

   # Check that new classes were added
   grep "\.chart-container" src/styles/global.css
   # Expected: Should find the new class definition

   grep "\.stat-card" src/styles/global.css
   # Expected: Should find the new class definition
   ```

3. **Test Build:**

   ```bash
   yarn dev
   ```

   - Verify no errors in terminal
   - Visit http://localhost:4321 in browser
   - Check that existing PicoCSS pages still work (homepage, blog)
   - No console errors in browser devtools

4. **Build Verification:**

   ```bash
   yarn build
   # Expected: Successful build, no errors
   ```

5. **Commit Progress:**
   ```bash
   git add src/styles/global.css
   git commit -m "Add PicoCSS component classes for coffee tracker"
   ```

### Phase 3: Migrate React Components (3-4 hours)

**IMPORTANT: Commit after each component migration. This creates rollback points.**

**Order of Migration:**

1. BrewMethodChart.tsx (simplest)
2. QualityChart.tsx
3. StarRating.tsx
4. AddBeanForm.tsx
5. CoffeeLogForm.tsx (most complex)

**For Each Component:**

1. Open the file in your editor
2. Remove Tailwind classes using:
   - **Pattern reference:** Part 2, "Tailwind to PicoCSS Pattern Conversions"
   - **File-specific instructions:** Part 3, find the section for this component
   - **Quick reference:** Appendix, "Tailwind → PicoCSS Common Conversions" table
3. Replace with PicoCSS semantic HTML or reusable classes from global.css
4. Save file
5. Test in browser:
   ```bash
   yarn dev
   # Visit /admin/cafe (for form components) or /cafe (for chart components)
   ```
6. Verify functionality (check Success Criteria in Part 3 for this file)
7. Toggle dark mode (button in top-right of site)
8. Test mobile responsive (resize browser or use devtools device toolbar)
9. Check browser console for errors (F12 → Console tab)
10. **If everything works, commit immediately:**
    ```bash
    git add src/components/cafe/[ComponentName].tsx
    git commit -m "Migrate [ComponentName] from Tailwind to PicoCSS"
    ```

**If Migration Breaks the Component:**

1. Review the changes:
   ```bash
   git diff src/components/cafe/[ComponentName].tsx
   ```
2. Option A: Fix the issue and continue
3. Option B: Rollback and try again:
   ```bash
   git checkout HEAD -- src/components/cafe/[ComponentName].tsx
   yarn dev  # Verify site works again
   # Review Part 3 instructions more carefully and retry
   ```

### Phase 4: Migrate Astro Pages (1.5-2 hours)

**Order of Migration:**

1. admin/cafe.astro
2. cafe.astro

**For Each Page:**

1. Open the file
2. Remove Tailwind classes following the patterns in Part 3
3. Replace with PicoCSS/semantic HTML or custom classes
4. Save file
5. Test in browser
6. Verify all states (with data, empty, error)
7. Test dark mode
8. Test mobile responsive
9. Commit:
   ```bash
   git add src/pages/[path]
   git commit -m "Migrate [page name] from Tailwind to PicoCSS"
   ```

### Phase 5: Remove Tailwind Dependencies (10 minutes)

1. **Remove from package.json:**

   ```bash
   yarn remove @astrojs/tailwind tailwindcss @tailwindcss/typography
   ```

2. **Update astro.config.mjs:**
   - Open `/Users/chris/repos/chrisrodz.io/astro.config.mjs`
   - Remove line 3: `import tailwind from '@astrojs/tailwind';`
   - Remove line 15: `tailwind(),`
   - Save file

3. **Delete tailwind.config.mjs:**

   ```bash
   rm tailwind.config.mjs
   ```

4. **Test Build:**

   ```bash
   yarn build
   ```

   - Should complete successfully
   - No Tailwind errors

5. **Commit:**
   ```bash
   git add package.json yarn.lock astro.config.mjs
   git commit -m "Remove Tailwind CSS dependencies and configuration"
   ```

### Phase 6: Final Testing & Verification (1 hour)

1. **Run Full Test Suite:**
   - Follow "Post-Migration Testing" checklist from Part 5
   - Test all pages
   - Test dark mode
   - Test responsive
   - Test all interactive features

2. **Run Production Build:**

   ```bash
   yarn build
   yarn preview
   ```

   - Test in production mode
   - Verify bundle size reduced

3. **Check for Tailwind Remnants:**

   ```bash
   # Search for any remaining Tailwind classes
   grep -r "className=\".*\(bg-\|text-\|border-\|rounded-\|p-\|m-\|gap-\|grid-cols\|flex\|w-\|h-\)" src/ --include="*.tsx" --include="*.astro"

   # Search for Tailwind imports
   grep -r "tailwind" . --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git
   ```

4. **Final Commit:**
   ```bash
   git add .
   git commit -m "Final verification and cleanup after Tailwind removal"
   ```

### Phase 7: Merge to Main (15 minutes)

1. **Push Feature Branch:**

   ```bash
   git push -u origin refactor/remove-tailwind-standardize-pico
   ```

2. **Final Testing on Dev Server:**
   - If using Vercel preview deployments, test the preview URL
   - Verify everything works

3. **Merge to Main:**

   ```bash
   git checkout main
   git merge refactor/remove-tailwind-standardize-pico
   git push
   ```

4. **Monitor Production Deploy:**
   - Watch Vercel deployment logs
   - Test production site after deploy
   - Verify no errors in browser console

5. **Clean Up Branch:**
   ```bash
   git branch -d refactor/remove-tailwind-standardize-pico
   git push origin --delete refactor/remove-tailwind-standardize-pico
   ```

---

## Part 7: Rollback Plan

### If Migration Fails

**Option 1: Revert Last Commit**

```bash
git revert HEAD
git push
```

**Option 2: Revert Multiple Commits**

```bash
# Find the commit hash before migration started
git log --oneline

# Reset to that commit
git reset --hard [commit-hash]
git push --force
```

**Option 3: Revert Entire Branch**

```bash
git checkout main
git reset --hard origin/main
```

### If Production Build Fails

1. **Check Vercel logs** for specific errors
2. **Test locally:**
   ```bash
   yarn build
   # Fix errors shown in terminal
   ```
3. **Common Issues:**
   - Missing CSS class definitions → Add to global.css
   - Syntax errors in JSX → Check removed className props
   - Import errors → Verify no Tailwind imports remain

### If Visual Regressions Occur

1. Compare to baseline screenshots
2. Check which component/page is affected
3. Review the specific file migration
4. Common fixes:
   - Add missing custom CSS class
   - Adjust CSS variable usage
   - Fix semantic HTML structure
   - Add inline styles as fallback

---

## Part 8: Success Metrics

### Before Migration

- **Bundle Size:** ~XXX KB (check in Network tab)
- **CSS Dependencies:** 3 (PicoCSS, Tailwind, @tailwindcss/typography)
- **Styling Approach:** Mixed (PicoCSS + Tailwind)
- **Lines of Tailwind Classes:** ~500+

### After Migration

- **Bundle Size:** ~XXX KB (should be ~100KB smaller)
- **CSS Dependencies:** 1 (PicoCSS only)
- **Styling Approach:** Unified (PicoCSS only)
- **Lines of Tailwind Classes:** 0
- **Custom PicoCSS Classes Added:** 25 reusable classes
- **Code Maintainability:** Improved (single framework, semantic HTML, reusable classes)

### Expected Benefits

1. **Performance:** Smaller bundle, faster page loads
2. **Maintainability:** Single framework, clearer patterns
3. **Consistency:** Unified design system across site
4. **Accessibility:** Better semantic HTML, improved defaults
5. **Dark Mode:** Simpler implementation with PicoCSS variables

---

## Part 9: Post-Migration Tasks

### Documentation Updates

1. Update `CLAUDE.md`:
   - Remove Tailwind references
   - Add PicoCSS component class documentation
   - Update styling guidelines

2. Update README (if exists):
   - Remove Tailwind from tech stack
   - Add note about PicoCSS-only styling

### Code Quality

1. Run linter:

   ```bash
   yarn lint
   ```

2. Run formatter:

   ```bash
   yarn format
   ```

3. Type check:
   ```bash
   yarn build
   ```

### Future Considerations

1. **Consider adding more PicoCSS plugins** (if needed)
2. **Document custom component patterns** for future developers
3. **Create style guide page** (optional) showing all custom components
4. **Monitor Core Web Vitals** after deployment

---

## Part 10: Known Gotchas & Tips

### Common Pitfalls

1. **Forgetting to remove `className` prop entirely**
   - PicoCSS styles semantic HTML, so many elements don't need classes
   - Only add className when using custom component classes

2. **Using inline styles instead of creating reusable classes**
   - If you're repeating the same style pattern, create a class in global.css
   - Inline styles make the code harder to maintain and update
   - Reusable classes keep the codebase DRY and consistent

3. **Over-styling with custom CSS**
   - Trust PicoCSS defaults first
   - Only add custom CSS when necessary
   - Use CSS variables instead of hardcoded values

4. **Not testing dark mode**
   - Always test both light and dark themes
   - PicoCSS handles dark mode via CSS variables

5. **Missing mobile testing**
   - PicoCSS grids collapse at 768px
   - Test breakpoints: 375px, 768px, 1440px

6. **Forgetting `aria-busy` for loading buttons**
   - PicoCSS styles `[aria-busy="true"]` automatically
   - Use this instead of custom disabled styles

### Best Practices

1. **Prefer reusable classes over inline styles**

   ```tsx
   <!-- Good -->
   <div className="chart-container">
     <div className="chart-item">
       <div className="chart-label">
         <strong>Label</strong>
         <small>Value</small>
       </div>
     </div>
   </div>

   <!-- Avoid -->
   <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pico-spacing)' }}>
     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
       <strong>Label</strong>
       <small>Value</small>
     </div>
   </div>
   ```

2. **Use semantic HTML first**

   ```html
   <!-- Good -->
   <button type="submit" disabled>Submit</button>

   <!-- Avoid -->
   <div className="button primary disabled">Submit</div>
   ```

3. **Wrap inputs with labels**

   ```html
   <!-- Good -->
   <label>
     Email
     <input type="email" />
   </label>

   <!-- Also good -->
   <label for="email">Email</label>
   <input type="email" id="email" />
   ```

4. **Use `<article>` for card-like content**

   ```html
   <article className="stat-card">
     <small>Label</small>
     <p className="stat-value">123</p>
   </article>
   ```

5. **Create reusable classes instead of repeating inline styles**

   ```css
   /* Good - Create reusable class */
   .chart-label {
     display: flex;
     justify-content: space-between;
     margin-bottom: 0.5rem;
   }

   /* Avoid - Repeating inline styles everywhere */
   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
   ```

6. **Use CSS variables within your classes for consistency**

   ```css
   /* Good */
   .custom-component {
     padding: var(--pico-spacing);
     color: var(--pico-color);
   }

   /* Avoid */
   .custom-component {
     padding: 1rem;
     color: #333;
   }
   ```

7. **Test with PicoCSS devtools**
   - Inspect elements to see PicoCSS variables in use
   - Check computed styles to understand defaults

---

## Appendix: Quick Reference

### Tailwind → PicoCSS Common Conversions

| Tailwind Pattern                                | PicoCSS Equivalent                                            |
| ----------------------------------------------- | ------------------------------------------------------------- |
| `className="bg-white dark:bg-gray-800"`         | `<article>` (styled automatically) or `className="stat-card"` |
| `className="text-gray-600 dark:text-gray-400"`  | `<small>` (semantic HTML)                                     |
| `className="rounded-lg p-4 border"`             | Create reusable class: `.card`                                |
| `className="grid grid-cols-3 gap-4"`            | `className="grid-3"` (reusable class)                         |
| `className="flex gap-4"`                        | Create reusable class or use `.space-y`                       |
| `className="flex justify-between items-center"` | Create reusable class: `.chart-label`                         |
| `className="mb-4"`                              | `className="mb"` (reusable spacing utility)                   |
| `className="space-y-4"`                         | `className="space-y"` (reusable class)                        |
| `className="w-full"`                            | `className="full-width"` or PicoCSS default for inputs        |
| `className="font-bold"`                         | Use `<strong>` (semantic HTML)                                |
| `className="text-sm"`                           | Use `<small>` (semantic HTML)                                 |
| Multiple utility classes                        | Create single reusable component class                        |

### PicoCSS CSS Variables Reference

```css
/* Colors */
--pico-color                  /* Main text */
--pico-primary                /* Primary actions */
--pico-secondary              /* Secondary actions */
--pico-muted-color            /* Muted text */
--pico-background-color       /* Page background */
--pico-card-background-color  /* Card backgrounds */

/* Spacing */
--pico-spacing                /* Base spacing unit */
--pico-typography-spacing-vertical
--pico-block-spacing-vertical

/* Borders */
--pico-border-radius
--pico-border-width
--pico-muted-border-color

/* Forms */
--pico-form-element-border-color
--pico-form-element-background-color

/* States */
--pico-primary-hover
--pico-primary-focus
--pico-primary-inverse
```

### Custom Classes Added

```css
/* Layout */
.form-container
.grid-2
.grid-3

/* Spacing Utilities */
.mb
.mt
.space-y

/* Components */
.message-card
.notice-box
.stat-card
.stat-value
.radio-card
.star-button
.star-rating
.inline-form
.chart-container
.chart-item
.chart-label

/* Utilities */
.full-width
```

---

## Summary

This migration plan provides a comprehensive, step-by-step approach to removing Tailwind CSS from the chrisrodz.io codebase and standardizing on PicoCSS. The plan includes:

**Planning & Reference:**

- **Table of Contents** for quick navigation
- **Quick Start Guide** for resuming work mid-migration
- **Quick Reference table** of all 11 files being modified with status tracking
- **Complete inventory** of all files using Tailwind (8 files)
- **Detailed PicoCSS pattern library** with 12 code examples

**Migration Instructions:**

- **File-by-file migration instructions** with before/after code snippets
- **Success criteria checklists** for each component/page
- **Configuration cleanup steps** for package.json, astro.config.mjs, and CSS files
- **Explicit verification commands** to confirm each phase worked
- **Step-by-step execution plan** with time estimates (6-8 hours total)

**Safety & Troubleshooting:**

- **Prerequisites check** before starting migration
- **Common Issues section** with 8 issue/solution pairs
- **Rollback instructions** at each phase if things go wrong
- **Phase identification guide** to resume work from git commits

**Testing & Validation:**

- **Comprehensive testing strategy** (80+ test cases: visual, functional, accessibility, performance)
- **Success metrics** to measure improvement
- **Post-migration tasks** for documentation and code quality

**Estimated Timeline:**

- Prerequisites check: 5 minutes
- Preparation: 15 minutes
- Add PicoCSS components: 30 minutes
- Migrate React components: 3-4 hours
- Migrate Astro pages: 1.5-2 hours
- Remove dependencies: 10 minutes
- Testing: 1 hour
- Merge & deploy: 15 minutes

**Total: 6-8 hours**

This plan can be followed sequentially by any developer to complete the migration safely and thoroughly. The Quick Start Guide enables resuming work at any point, and the Common Issues section provides solutions to expected problems.
