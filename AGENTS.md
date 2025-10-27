# AGENTS.md

This file provides comprehensive guidance to AI Coding Agents when working with code in this repository.

## Git Workflow

**Critical**: Always work on feature branches and use GitHub pull requests to protect `main` which auto-deploys to production.

### Standard Workflow

1. **Create feature branch** from main:

   ```bash
   git checkout main
   git pull
   git checkout -b feature/description
   ```

2. **Make changes** on the feature branch
   - Test locally with `yarn dev`
   - Build to verify: `yarn build`

3. **Commit AND push together** (never commit without pushing):

   ```bash
   git add . && git commit -m "descriptive message" && git push
   ```

   If the branch doesn't exist remotely yet, use:

   ```bash
   git push -u origin feature/description
   ```

4. **Create Pull Request** (always required):

   ```bash
   gh pr create --title "Feature: [description]" --body "[detailed description]"
   ```

### Updating the Changelog

**Before creating a pull request**, update [CHANGELOG.md](CHANGELOG.md):

1. Add entry under a new version. Never infer the version. ALWAYS ask user for what type of bump it is major, minor, patch.
2. Use appropriate category: `Added`, `Changed`, `Fixed`, `Removed`, `Security`
3. Write concise description of your changes
4. Include PR number placeholder that will be updated after PR creation

**Example**:

```markdown
## [Unreleased]

### Added

- New feature for user authentication (#XX)
```

**After creating the PR**, update the placeholder:

```markdown
### Added

- New feature for user authentication ([#123](https://github.com/chrisrodz/chrisrodz.io/pull/123))
```

**When releasing to production** (merging significant changes to main):

1. Move entries from `[Unreleased]` to a new version section
2. Add version number and date: `## [X.Y.Z] - YYYY-MM-DD`
3. Update comparison links at bottom of changelog
4. Update version in `package.json` to match: `"version": "X.Y.Z"`
5. Commit with message: `chore: release vX.Y.Z`
6. Optionally create git tag: `git tag vX.Y.Z && git push --tags`

**Version bumping guidelines**:

- **MAJOR** (X.0.0): Breaking changes, major architecture rewrites, incompatible API changes
- **MINOR** (0.X.0): New features, significant improvements, non-breaking enhancements
- **PATCH** (0.0.X): Bug fixes, minor tweaks, dependency updates

### Pull Request Requirements

**All changes must go through pull requests** - no direct merges to main allowed.

### Branch Naming Convention

- `feature/` - New features or enhancements
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

### Best Practices

- ✅ Keep commits atomic - one logical change per commit
- ✅ Write clear, descriptive commit messages.
- ✅ Always test locally before committing
- ✅ Always push immediately after committing
- ✅ Always create pull requests for code review
- ❌ Never commit without pushing (work could be lost)
- ❌ Never commit directly to `main`
- ❌ Never merge feature branches directly to main

## Architecture Overview

### SSR Mode with Astro v5

This is an **SSR (Server-Side Rendered)** Astro application using the Vercel adapter (`output: 'server'`). All pages are dynamically rendered on-demand.

**Critical**: Do NOT use `getStaticPaths()` for dynamic routes. Use SSR patterns instead:

```typescript
// ❌ Wrong (static generation)
export async function getStaticPaths() { ... }

// ✅ Correct (SSR)
const { slug } = Astro.params;
const entry = await getEntry('blog', slug);
```

### Blog Posts (Content Collections)

Blog posts use Astro Content Collections with a translation-friendly folder structure:

**Structure**:

```
src/content/blog/
├── welcome-post-2025/       # Folder name = translation key
│   ├── en.md                # English version
│   └── es.md                # Spanish version
```

**Key Points**:

1. **Folder-based organization**: Each post lives in its own folder, with one file per language
   - Folder name serves as the translation key (e.g., `welcome-post-2025`)
   - Files are named by locale: `en.md`, `es.md`

2. **Entry IDs preserve folder structure**: Using `generateId` option
   - File: `welcome-post-2025/en.md` → ID: `"welcome-post-2025/en.md"`
   - Translation key extracted from folder name

3. **Custom URL slugs**: Each post defines its own `slug` in frontmatter
   - English: `slug: "welcome-to-my-site"` → `/blog/welcome-to-my-site`
   - Spanish: `slug: "bienvenido-a-mi-sitio"` → `/es/blog/bienvenido-a-mi-sitio`

4. **Finding posts by slug** (not by ID):

   ```typescript
   import { getCollection, render } from 'astro:content';

   const allPosts = await getCollection('blog');
   const entry = allPosts.find((post) => post.data.slug === slug && post.data.locale === 'en');
   const { Content } = await render(entry);
   ```

5. **Finding translations**: Use `getTranslationKey()` helper

   ```typescript
   import { getTranslatedPost } from '@/lib/i18n';

   const translatedPost = await getTranslatedPost(post, 'es');
   ```

6. **Schema location**: `src/content/config.ts`

### Styling System

Uses **PicoCSS v2** as the primary CSS framework with minimal custom overrides.

**Important**: Always use PicoCSS CSS variables instead of hardcoded colors:

- Text: `var(--pico-color)`
- Headings: `var(--pico-h1-color)` through `var(--pico-h6-color)`
- Primary: `var(--pico-primary)`
- Muted: `var(--pico-muted-color)`
- Background: `var(--pico-background-color)`

Custom styles in `src/styles/global.css` are minimal. PicoCSS provides excellent WCAG-compliant colors for both light and dark modes by default.

Dark mode: Toggled via `data-theme="dark"` attribute on `<html>`.

### Database & Graceful Degradation

The app uses **Supabase** (PostgreSQL) but gracefully degrades when not configured.

**Null-safe database pattern**:

```typescript
// src/lib/supabase.ts exports:
export const supabase: SupabaseClient | null;
export const isSupabaseConfigured: boolean;

// Always check before use:
if (!supabase) {
  return { error: 'Database not configured' };
}
```

Features work standalone without Supabase:

- Blog: Fully functional (uses file-based content)
- Coffee: Show setup instructions when DB missing
- Admin: Shows setup instructions when secrets are missing

#### Database Migrations (Supabase CLI)

Database schema is managed via **migrations** in `supabase/migrations/`. Development uses a cloud-based Supabase project (no Docker required).

**Development Setup (one-time):**

```bash
# Create new Supabase project at https://supabase.com/dashboard
# Then link and set up:
yarn db:setup <project-ref>

# The setup script will:
# 1. Link to your dev project
# 2. Push all migrations
# 3. Generate TypeScript types
```

**Creating Migrations:**

```bash
# Create new migration
yarn db:migration add_feature_name

# Edit: supabase/migrations/YYYYMMDDHHMMSS_add_feature_name.sql
# Push to dev: yarn db:push
# Generate types: yarn db:types
```

**Type Generation:**

```bash
# Generate TypeScript types from database schema (requires linked project)
yarn db:types

# Output: src/lib/database.types.ts
```

**Development Workflow:**

```bash
# Push migrations to dev project
yarn db:push

# Pull schema changes from dev project
yarn db:pull

# View project status
supabase status
```

See `supabase/README.md` and `docs/DEPLOYMENT.md` for detailed workflow and best practices.

### Authentication

**Protected routes**: Check `checkAuth()` at top of page, redirect if false.

### Input Validation

All forms use **Zod schemas** defined in `src/lib/validation.ts`:
Never trust user input. Always validate with Zod before database operations.

## Key Files

- `astro.config.mjs`: SSR mode, Vercel adapter, site URL
- `src/lib/supabase.ts`: Null-safe database client
- `src/lib/auth.ts`: Session management
- `src/lib/validation.ts`: Zod schemas
- `src/lib/i18n.ts`: Internationalization utilities (en/es)
- `src/content/config.ts`: Blog collection schema
- `src/layouts/Layout.astro`: Main layout with PicoCSS, dark mode toggle, meta tags, i18n
- `src/styles/global.css`: Custom styles (minimal, uses PicoCSS variables)
- `src/pages/`: All routes (SSR)
- `src/content/blog/`: Markdown blog posts (folder-per-post structure)

## Environment Variables

Required for full functionality (see `.env.example`):

For testing locally you may read the .env file for credentials used to login to the admin page

## Database Schema

Supabase tables (if configured):

- `beans`: Coffee bean inventory
- `coffees`: Brew logs (references beans)
- `activities`: Training activities (Strava sync)

All tables have Row Level Security enabled with public read access.

```bash
# Create both English and Spanish versions
yarn new-post "My Post Title"

# Create only English version
yarn new-post "My Post Title" en

# Create only Spanish version
yarn new-post "My Post Title" es
```

This creates:

- `src/content/blog/my-post-title-2025/en.md` (and/or `es.md`)
- Frontmatter includes: `title`, `description`, `slug`, `pubDate`, `tags`, `locale`
- Edit the generated file(s) to customize the slug and add content

## Internationalization (i18n)

The site supports Spanish (default) and English:

- **Spanish** (default): `/blog/post-slug` (no prefix)
- **English**: `/en/blog/post-slug`

**Translation Structure**:

- Blog posts in the same folder are translations of each other
- Folder name serves as the translation key (e.g., `welcome-post-2025/`)
- Each language version has its own custom `slug` in frontmatter

**Example**:

```sh
src/content/blog/welcome-post-2025/
├── en.md    # slug: "welcome-to-my-site"  → /en/blog/welcome-to-my-site
└── es.md    # slug: "bienvenido-a-mi-sitio" → /blog/bienvenido-a-mi-sitio
```

**Type-Safe Translations**:

- Translation keys auto-generated from JSON files (`src/i18n/en.json`, `src/i18n/es.json`)
- Type safety via `TranslationKey` type in `src/lib/i18n-keys.ts`
- Validation script ensures both language files have matching keys
- Pre-commit hooks auto-regenerate types when translation files change

**Usage**:

```typescript
import { getLocaleFromUrl, useTranslations } from '@/lib/i18n';

const locale = getLocaleFromUrl(Astro.url); // 'es' or 'en'
const { t, formatDate } = useTranslations(locale);

// Type-safe translation with autocomplete
const title = t('nav.home'); // 'Inicio' or 'Home'
```

The language switcher in `Layout.astro` uses `getTranslatedPost()` to:

1. Extract the translation key from the post's folder
2. Find the sibling file with the target locale
3. Get the correct translated URL using that post's custom slug

## Code Quality Tools

### Formatting (Prettier)

### Linting (ESLint)

### Pre-commit Hooks (Husky + lint-staged)

### Code Quality Best Practices

- ✅ Always run `yarn check` before pushing (runs type check + lint + format check)
- ✅ Let VSCode auto-format on save (requires Prettier extension)
- ✅ Fix ESLint warnings as you code
- ✅ Pre-commit hooks will catch issues before they're committed
- ❌ Don't disable ESLint rules without good reason
- ❌ Don't skip pre-commit hooks (`--no-verify`) unless absolutely necessary (e.g., emergency hot-fixes, automated tooling)

### High-Value Tests (Write These)

Tests that **catch real bugs** and **document critical behavior**:

✅ **Core user journeys**

- Form submission (success, failure, redirect flows)
- Error message display to users
- Critical feature workflows (e.g., draft restore, bean selection)

✅ **Business logic validation**

- Required field enforcement
- Numeric bounds (e.g., dose 1-100g, rating 1-5)
- Schema validation edge cases (invalid UUIDs, malformed data)
- Custom validation rules unique to your domain

✅ **Important contracts**

- Callback functions fire with correct arguments
- Store/state updates propagate correctly
- Network error handling and retry logic
- Database failure graceful degradation

✅ **Critical integrations**

- API endpoints return correct status codes and shape
- Third-party service mocking (when behavior is critical)

### Low-Value Tests (Avoid These)

Tests that **don't catch bugs** or **test framework/library behavior**:

❌ **Framework behavior**

- Testing that `useState` updates state
- Testing that Zod's `.trim()` or `.transform()` works
- Testing that HTML `required` attribute validates

❌ **Implementation details**

- UI structure (button counts, specific HTML tags)
- CSS classes or styling
- Internal variable names
- Private function implementations

❌ **Redundant tests**

- Testing both min AND max when browser handles validation
- Multiple tests for same validation rule
- Testing "accepts valid data" when you already test "rejects invalid data"

❌ **Trivial tests**

- Testing that a component renders (unless complex conditional logic)
- Testing that form fields update on change (React behavior)
- Testing HTML attributes (maxLength, type, placeholder)

### When to Add Tests

**Always test:**

1. New features with complex business logic
2. Bug fixes (regression tests)
3. Critical user paths (authentication, payments, data loss scenarios)
4. Edge cases that caused production issues

**Consider testing:**

1. Complex validation logic
2. Data transformations
3. State management patterns

**Skip testing:**

1. Simple presentational components
2. Configuration files
3. Types-only files
4. Trivial getters/setters

### Test Quality Guidelines

**Good tests are:**

- **Fast**: Run in milliseconds
- **Isolated**: No shared state between tests
- **Deterministic**: Same input = same output, always
- **Readable**: Test name describes the scenario clearly
- **Focused**: One assertion per logical concept

**Test behavior, not implementation:**

```typescript
// ❌ Bad: Tests implementation
it('should call setState with new value', () => {
  const setState = vi.fn();
  // ...
  expect(setState).toHaveBeenCalledWith(newValue);
});

// ✅ Good: Tests user-visible behavior
it('should show error message when email is invalid', () => {
  render(<Form />);
  fireEvent.change(emailInput, { target: { value: 'invalid' } });
  fireEvent.click(submitButton);

  expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
});
```

### Coverage Goals

Aim for **>80% coverage on critical paths**, but remember:

- **100% coverage ≠ good tests**
- **High coverage with low-value tests = false security**
- **Focus on signal-to-noise ratio over raw percentage**

### Test Organization

```typescript
describe('ComponentName', () => {
  // Setup/teardown
  beforeEach(() => {
    /* reset mocks, clear state */
  });
  afterEach(() => {
    /* cleanup */
  });

  describe('Validation', () => {
    it('should disable submit when required field is empty', () => {});
    it('should show error for invalid input', () => {});
  });

  describe('Submission', () => {
    it('should submit with correct data on success', () => {});
    it('should show error message on failure', () => {});
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {});
  });
});
```

## Notes for Future Development

1. **Don't override PicoCSS colors** unless absolutely necessary. Use CSS variables.
2. **Always validate with Zod** before database operations.
3. **Check supabase !== null** before any database calls.
4. **Use SSR patterns** (find by slug) not static (`getStaticPaths`) for blog posts.
5. **Blog posts use custom slugs**: Find posts by `post.data.slug`, not by ID.
6. **Test graceful degradation**: App should work without env vars configured.
7. **Session storage is in-memory**: Consider Redis/database for production scale.
8. **i18n translations**: Place translated blog posts in the same folder with locale-named files (`en.md`, `es.md`).
9. **Translation system**: Use type-safe `t()` function for all user-facing text. Never hardcode strings. Pre-commit hooks validate translation completeness.
10. **Spanish is default**: All non-prefixed URLs (`/about`, `/blog/slug`) serve Spanish content. English uses `/en/` prefix.
11. **Content/Copy Review**: Whenever adding or updating user-facing text, **do a manual review in the browser before committing**. This includes homepage copy, headings, descriptions, and any translation content. Pre-commit hooks validate i18n completeness but not content accuracy or tone.
