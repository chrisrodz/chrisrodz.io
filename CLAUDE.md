# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
yarn dev              # Start dev server (localhost:4321)
yarn build            # Type check + build for production
yarn preview          # Preview production build

# Content
yarn new-post "Title"       # Create both en.md and es.md
yarn new-post "Title" en    # Create only English post
yarn new-post "Title" es    # Create only Spanish post
```

## Git Workflow

**Critical**: Always work on feature branches to protect `main` which auto-deploys to production.

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

4. **Merge when ready**:

   ```bash
   git checkout main
   git merge feature/description
   git push
   ```

5. **Clean up** after merge:

   ```bash
   git branch -d feature/description
   git push origin --delete feature/description
   ```

### Pull Requests (Optional)

**Only create PRs when explicitly requested.** For most autonomous development tasks, direct merge to main after local testing is sufficient.

When a PR is requested:

```bash
gh pr create --draft --title "Feature: [description]" --body "[description]"
gh pr ready  # When ready for review
```

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
- ❌ Never commit without pushing (work could be lost)
- ❌ Never commit directly to `main`
- ❌ Never add Claude or Anthropic as a co-author to commits
- ❌ Never mention Claude or Anthropic in commit descriptions

### Deployment

- **Main branch** auto-deploys to production (Vercel)
- **Feature branches** do NOT auto-deploy
- **Preview deployments** available for PRs (when created)

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
- Coffee/Training: Show setup instructions when DB missing
- Admin: Shows setup instructions when ADMIN_SECRET missing

### Authentication

**Session-based auth** (not JWT):

- Sessions stored in-memory Map (consider Redis for production)
- 24-hour expiry
- HttpOnly cookies with `secure` flag in production
- No passwords in database (uses `ADMIN_SECRET` env var)

**Auth flow**:

```typescript
import { checkAuth, setAuthCookie, createSession } from '@/lib/auth';

// Check if authenticated
const isAuth = checkAuth(Astro.cookies);

// Create session after login
if (verifyAdminSecret(password)) {
  const sessionId = createSession();
  setAuthCookie(Astro.cookies, sessionId);
}
```

**Protected routes**: Check `checkAuth()` at top of page, redirect if false.

### Input Validation

All forms use **Zod schemas** defined in `src/lib/validation.ts`:

```typescript
import { coffeeSchema } from '@/lib/validation';

const result = coffeeSchema.safeParse(formData);
if (!result.success) {
  return { errors: result.error.flatten().fieldErrors };
}
```

Never trust user input. Always validate with Zod before database operations.

## Tech Stack

- **Framework**: Astro v5.14+ (SSR mode)
- **Styling**: Pico CSS v2
- **Database**: Supabase (PostgreSQL, optional with graceful degradation)
- **Auth**: Custom session-based (nanoid)
- **Validation**: Zod schemas
- **Deployment**: Vercel (Node.js 20+)

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

```bash
# Admin access
ADMIN_SECRET=random_string

# Supabase (optional, for coffee/training)
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...

# Strava (optional, for training sync)
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...
STRAVA_REFRESH_TOKEN=...
```

App functions without these (shows setup instructions instead).

## Database Schema

Supabase tables (if configured):

- `beans`: Coffee bean inventory
- `coffees`: Brew logs (references beans)
- `activities`: Training activities (Strava sync)

All tables have Row Level Security enabled with public read access.

## Common Patterns

### Creating a new page

1. Add `.astro` file to `src/pages/`
2. Import Layout: `import Layout from '@/layouts/Layout.astro';`
3. Use PicoCSS classes/variables for styling

### Adding a blog post

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

### Accessing blog posts in code

```typescript
import { getCollection, render } from 'astro:content';
import { getTranslatedPost, getBlogPostUrl } from '@/lib/i18n';

// List all English posts
const posts = await getCollection('blog', ({ data }) => data.locale === 'en');

// Find post by custom slug (not by ID)
const allPosts = await getCollection('blog');
const post = allPosts.find((p) => p.data.slug === 'my-slug' && p.data.locale === 'en');
if (!post) return Astro.redirect('/404');

// Render content
const { Content } = await render(post);

// Find translation
const translatedPost = await getTranslatedPost(post, 'es');
if (translatedPost) {
  const translatedUrl = getBlogPostUrl(translatedPost);
}
```

### Working with forms

```typescript
import { coffeeSchema } from '@/lib/validation';

const formData = await Astro.request.formData();
const data = Object.fromEntries(formData);

const result = coffeeSchema.safeParse(data);
if (!result.success) {
  // Handle validation errors
}

// Use result.data for type-safe access
```

## Production Deployment

Deploys to **Vercel** with Node.js 20+ runtime.

Auto-deploys on push to `main` branch.

Required Vercel environment variables:

- `ADMIN_SECRET` (required)
- Supabase vars (optional)
- Strava vars (optional)

## Type Safety

Full TypeScript coverage. Key types:

- `CollectionEntry<'blog'>`: Blog post type
- `SupabaseClient | null`: Database client
- Zod inferred types: `z.infer<typeof coffeeSchema>`

## Internationalization (i18n)

The site supports English (default) and Spanish:

- **English**: `/blog/post-slug`
- **Spanish**: `/es/blog/post-slug`

**Translation Structure**:

- Blog posts in the same folder are translations of each other
- Folder name serves as the translation key (e.g., `welcome-post-2025/`)
- Each language version has its own custom `slug` in frontmatter

**Example**:

```
src/content/blog/welcome-post-2025/
├── en.md    # slug: "welcome-to-my-site"  → /blog/welcome-to-my-site
└── es.md    # slug: "bienvenido-a-mi-sitio" → /es/blog/bienvenido-a-mi-sitio
```

The language switcher in `Layout.astro` uses `getTranslatedPost()` to:

1. Extract the translation key from the post's folder
2. Find the sibling file with the target locale
3. Get the correct translated URL using that post's custom slug

## Code Quality Tools

### Formatting (Prettier)

- Auto-formats on save in VSCode
- Run manually: `yarn format`
- Check formatting: `yarn format:check`
- Config: `.prettierrc`

**Prettier settings**:

- Single quotes
- Semicolons enabled
- 2-space tabs
- 100 character line width
- Includes `prettier-plugin-astro` for `.astro` file support

### Linting (ESLint)

- Auto-fixes on save in VSCode
- Run manually: `yarn lint`
- Fix auto-fixable issues: `yarn lint:fix`
- Config: `eslint.config.js` (ESLint flat config format)

**Key ESLint rules**:

- Warns on unused variables (except those prefixed with `_`)
- Warns on `console.log` (allows `console.warn` and `console.error`)
- Enforces `const` over `let` where possible
- Prohibits `var`
- Includes Astro-specific linting rules

### Pre-commit Hooks (Husky + lint-staged)

- Automatically formats and lints staged files before commit
- Prevents committing improperly formatted code
- Config: `lint-staged` in `package.json`

**What runs on commit**:

- `*.{js,ts,astro}`: ESLint fix + Prettier format
- `*.{json,md,css}`: Prettier format

### Best Practices

- ✅ Always run `yarn check` before pushing (runs type check + lint + format check)
- ✅ Let VSCode auto-format on save (requires Prettier extension)
- ✅ Fix ESLint warnings as you code
- ✅ Pre-commit hooks will catch issues before they're committed
- ❌ Don't disable ESLint rules without good reason
- ❌ Don't skip pre-commit hooks (`--no-verify`) unless absolutely necessary

## Notes for Future Development

1. **Don't override PicoCSS colors** unless absolutely necessary. Use CSS variables.
2. **Always validate with Zod** before database operations.
3. **Check supabase !== null** before any database calls.
4. **Use SSR patterns** (find by slug) not static (`getStaticPaths`) for blog posts.
5. **Blog posts use custom slugs**: Find posts by `post.data.slug`, not by ID.
6. **Test graceful degradation**: App should work without env vars configured.
7. **Session storage is in-memory**: Consider Redis/database for production scale.
8. **i18n translations**: Place translated blog posts in the same folder with locale-named files (`en.md`, `es.md`).

---

**Last updated**: 2025-10-13
