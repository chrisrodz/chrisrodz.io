# Autonomous Migration Prompt for Claude Code

## Your Mission

Execute the complete Tailwind to PicoCSS migration for this codebase by following the comprehensive plan in `TAILWIND_TO_PICO_MIGRATION_PLAN.md`. Work autonomously through all phases, using Chrome DevTools MCP to test and iterate until the migration is complete.

## Context

- **Plan Document:** `/Users/chris/repos/chrisrodz.io/TAILWIND_TO_PICO_MIGRATION_PLAN.md`
- **Repository:** `/Users/chris/repos/chrisrodz.io`
- **Estimated Time:** 6-8 hours of work
- **Goal:** Remove Tailwind CSS entirely and standardize on PicoCSS with reusable component classes

## Your Autonomous Workflow

### 1. Initialize & Plan

**Read the migration plan:**

```
Read /Users/chris/repos/chrisrodz.io/TAILWIND_TO_PICO_MIGRATION_PLAN.md
```

**Check current status:**

- Check git branch: Are we on `refactor/remove-tailwind-standardize-pico`?
- Check git log: What phase are we in?
- Use the "Quick Start Guide" section to determine where to resume

**If starting fresh:**

- Follow the "Prerequisites Check" in Part 6
- Start with Phase 1 (Preparation)

**If resuming:**

- Jump to the appropriate phase based on the last commit message

### 2. Execute Each Phase Systematically

**For Phase 2 (global.css changes):**

1. Read the current global.css file
2. Remove @tailwind directives and @apply usage as specified
3. Add all 25 new PicoCSS component classes from Part 4, Step 4
4. Run verification commands to confirm changes
5. Test that the site still builds: `yarn build`
6. Commit with the exact message specified in the plan

**For Phase 3 (React Components) - Do these ONE AT A TIME:**

For each component in order (BrewMethodChart → QualityChart → StarRating → AddBeanForm → CoffeeLogForm):

1. **Read the component file**
2. **Find the section in Part 3 with migration instructions for this file**
3. **Read the Success Criteria checklist for this file**
4. **Make the changes:**
   - Remove all Tailwind classes
   - Replace with PicoCSS classes/semantic HTML per the plan
   - Use the pattern conversions from Part 2 as reference
5. **Test immediately using Chrome DevTools MCP:**
   ```
   a. Start dev server: yarn dev
   b. Navigate to the page that uses this component:
      - Charts: http://localhost:4321/cafe
      - Forms: http://localhost:4321/admin/cafe
   c. Use mcp__chrome-devtools__take_snapshot to verify page loads
   d. Use mcp__chrome-devtools__take_screenshot to capture visual state
   e. Test interactions:
      - For forms: Try filling and submitting
      - For charts: Verify they render
      - For StarRating: Test clicking stars
   f. Test dark mode:
      - Use mcp__chrome-devtools__click to toggle dark mode
      - Take another screenshot
   g. Test mobile responsive:
      - Use mcp__chrome-devtools__resize_page to 375px width
      - Take screenshot
   h. Check console errors: mcp__chrome-devtools__list_console_messages
   ```
6. **Verify Success Criteria:**
   - Go through the checklist in Part 3 for this file
   - ALL items must pass before proceeding
7. **If tests fail:**
   - Review the "Common Issues During Migration" section
   - Fix the issue
   - Re-test
   - If stuck after 3 attempts, rollback and ask for guidance
8. **If tests pass:**
   - Commit immediately with the exact message from the plan
   - Mark the file as ✅ in the Quick Reference table
   - Move to the next component

**For Phase 4 (Astro Pages) - Do these ONE AT A TIME:**

Same process as Phase 3, but for:

1. admin/cafe.astro
2. cafe.astro

**For Phase 5 (Remove Tailwind Dependencies):**

1. Run `yarn remove @astrojs/tailwind tailwindcss @tailwindcss/typography`
2. Edit astro.config.mjs to remove Tailwind import and integration
3. Delete tailwind.config.mjs
4. Run verification commands
5. Test build: `yarn build`
6. Commit

**For Phase 6 (Final Testing):**

1. Run through the comprehensive testing checklist in Part 5
2. Use Chrome DevTools MCP extensively:
   - Screenshot all major pages
   - Test all interactive elements
   - Verify dark mode on all pages
   - Test responsive at 375px, 768px, 1440px
   - Check console for errors on every page
3. Run production build and preview: `yarn build && yarn preview`
4. Search for any remaining Tailwind remnants
5. Final commit

### 3. Use Chrome DevTools MCP Proactively

**For every page/component you migrate:**

```typescript
// 1. Navigate to the page
mcp__chrome - devtools__navigate_page({ url: 'http://localhost:4321/cafe' });

// 2. Take a snapshot to see structure
mcp__chrome - devtools__take_snapshot();

// 3. Take screenshots (light mode)
mcp__chrome - devtools__take_screenshot({ fullPage: true });

// 4. Test dark mode
mcp__chrome - devtools__click({ uid: 'dark-mode-toggle-uid' }); // Find the right UID from snapshot
mcp__chrome - devtools__take_screenshot({ fullPage: true, filePath: '/tmp/dark-mode.png' });

// 5. Test mobile
mcp__chrome - devtools__resize_page({ width: 375, height: 667 });
mcp__chrome - devtools__take_screenshot({ fullPage: true, filePath: '/tmp/mobile.png' });

// 6. Check for errors
mcp__chrome - devtools__list_console_messages();

// 7. Test interactions (example: form submission)
mcp__chrome - devtools__fill({ uid: 'input-uid', value: 'test value' });
mcp__chrome - devtools__click({ uid: 'submit-button-uid' });
mcp__chrome - devtools__wait_for({ text: 'Success', timeout: 5000 });
```

**Use Chrome DevTools to validate EVERY Success Criteria item.**

### 4. Handle Issues Autonomously

**When you encounter an issue:**

1. **First:** Check the "Common Issues During Migration" section in the plan
2. **Second:** Run the verification commands from the relevant phase
3. **Third:** Check git diff to see what changed
4. **Fourth:** Try the suggested solution from Common Issues
5. **If still stuck after 3 attempts:**
   - Rollback the change: `git checkout HEAD -- [file]`
   - Document what went wrong
   - Ask the user for guidance on this specific issue

**Never:**

- Skip Success Criteria checks
- Commit without testing
- Move to the next file if current one has issues
- Ignore console errors
- Assume something works without verification

### 5. Git Workflow

**Commit messages must match the plan exactly:**

- "Checkpoint before Tailwind removal"
- "Add PicoCSS component classes for coffee tracker"
- "Migrate BrewMethodChart from Tailwind to PicoCSS"
- "Migrate QualityChart from Tailwind to PicoCSS"
- etc.

**Commit frequency:**

- After Phase 2
- After EACH component migration in Phase 3
- After EACH page migration in Phase 4
- After Phase 5
- After Phase 6

**Never batch commits.** Each file gets its own commit.

### 6. Progress Tracking

**Use TodoWrite to track your progress:**

Create todos at the start:

```
1. ✅ Read migration plan
2. Run prerequisites check
3. Phase 1: Preparation
4. Phase 2: Add PicoCSS components to global.css
5. Phase 3.1: Migrate BrewMethodChart.tsx
6. Phase 3.2: Migrate QualityChart.tsx
7. Phase 3.3: Migrate StarRating.tsx
8. Phase 3.4: Migrate AddBeanForm.tsx
9. Phase 3.5: Migrate CoffeeLogForm.tsx
10. Phase 4.1: Migrate admin/cafe.astro
11. Phase 4.2: Migrate cafe.astro
12. Phase 5: Remove Tailwind dependencies
13. Phase 6: Final testing
14. Phase 7: Merge to main
```

**Update todos as you complete each phase.**

### 7. Testing Requirements

**Minimum testing for each component/page:**

```
✅ Visual inspection via screenshot
✅ Dark mode toggle works
✅ Mobile responsive (375px width)
✅ No console errors
✅ All interactive elements work
✅ Success Criteria checklist 100% complete
```

**Use Chrome DevTools MCP for ALL testing.** Do not assume anything works.

### 8. Quality Standards

**Before marking a file as complete:**

- [ ] All Tailwind classes removed (verify with grep)
- [ ] Only PicoCSS classes or semantic HTML used
- [ ] Success Criteria 100% checked
- [ ] Screenshot taken showing it works
- [ ] Dark mode tested and screenshot taken
- [ ] Mobile tested and screenshot taken
- [ ] Console has zero errors
- [ ] Git committed with correct message

**If any item is incomplete, the file is NOT done.**

### 9. Final Validation

**Before Phase 7 (merge to main):**

1. Run all verification commands from Phase 6
2. Use Chrome DevTools to test:
   - Homepage: http://localhost:4321
   - Blog: http://localhost:4321/blog
   - A blog post: http://localhost:4321/blog/[any-slug]
   - Cafe page: http://localhost:4321/cafe
   - Admin login: http://localhost:4321/admin
   - Admin cafe: http://localhost:4321/admin/cafe (after login)
3. Search for Tailwind remnants:
   ```bash
   grep -r "bg-\|text-\|border-\|rounded-\|p-\|m-\|gap-\|grid-cols\|flex\|w-\|h-" src/ --include="*.tsx" --include="*.astro"
   # Should find ZERO Tailwind utility classes
   ```
4. Verify bundle size reduced (check Network tab in DevTools)
5. Run production build: `yarn build && yarn preview`
6. Test production build with Chrome DevTools

**Only proceed to merge if ALL checks pass.**

## Success Criteria for Full Migration

- [ ] All 11 files in Quick Reference table marked ✅
- [ ] All 7 phases in Part 6 completed
- [ ] Zero Tailwind classes remain in codebase
- [ ] Zero console errors on any page
- [ ] All pages render correctly in light/dark mode
- [ ] All pages responsive on mobile
- [ ] Production build succeeds
- [ ] Bundle size reduced by ~100KB
- [ ] All git commits made with correct messages

## When to Ask for Help

**Ask the user for guidance if:**

- You're stuck on the same issue after 3 rollback/retry attempts
- A test consistently fails and the Common Issues section doesn't help
- You're unsure about interpreting a Success Criteria item
- The plan seems to have an error or contradiction
- Chrome DevTools MCP is not working as expected

**Do NOT ask for help if:**

- You can solve it by reading the plan more carefully
- The issue is covered in "Common Issues During Migration"
- You just need to rollback and retry
- You need to run a verification command

## Your Directive

**You are autonomous.** Work through this migration systematically, test thoroughly with Chrome DevTools MCP, and iterate until complete. Use the plan as your comprehensive guide. Commit frequently. Test everything. Do not skip steps.

**Start by:**

1. Reading the migration plan
2. Checking git status to see if work has started
3. Following the appropriate section (Prerequisites → Phase 1 if fresh, or Quick Start Guide if resuming)

**Your goal:** Have all 11 files migrated, all tests passing, and be ready to merge to main.

Go execute the plan. Begin now.
