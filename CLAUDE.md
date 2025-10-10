# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
yarn dev              # Start dev server (localhost:4321)
yarn build            # Type check + build for production
yarn preview          # Preview production build

# Content
yarn new-post "Title" # Create new blog post with frontmatter
```

## Git Workflow

**Critical**: Always work on feature branches to protect `main` which auto-deploys to production.

### Standard Workflow:

1. **Create feature branch** from main:
   ```bash
   git checkout main
   git pull
   git checkout -b feature/description
   ```

2. **Make changes** on the feature branch
   - Test locally with `yarn dev`
   - Build to verify: `yarn build`

3. **ALWAYS commit AND push together** (never commit without pushing):
   ```bash
   git add . && git commit -m "descriptive message" && git push
   ```
   If the branch doesn't exist remotely yet, use:
   ```bash
   git push -u origin feature/description
   ```

4. **ALWAYS create a draft PR** immediately after first push:
   ```bash
   gh pr create --draft --title "Feature: [description]" --body "Working on [feature]"
   ```
   The PR will automatically update as you push new commits.

5. **Mark PR as ready** when feature is complete:
   ```bash
   gh pr ready
   ```
   - Review changes in GitHub
   - Get approval (or self-review)
   - Merge to main

6. **Clean up** after merge:
   ```bash
   git checkout main
   git pull
   git branch -d feature/description
   ```

### Branch Naming Convention:
- `feature/` - New features or enhancements
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

### Best Practices:
- ✅ Keep commits atomic - one logical change per commit
- ✅ Write clear, descriptive commit messages
- ✅ Always test locally before pushing
- ✅ Review your own PRs before merging
- ❌ Never commit without pushing
- ❌ Never work on a feature branch without a draft PR open
- ❌ Never commit directly to `main`

This ensures work is always backed up, visible, and ready for review.

### Deployment:
- **Main branch** auto-deploys to production (Vercel)
- **Feature branches** do NOT auto-deploy (unless PR created)
- **Preview deployments** available for PRs

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

Blog posts use Astro Content Collections with important quirks:

1. **Entry IDs include file extensions**:
   - File: `welcome.md` → ID: `"welcome.md"`
   - Strip extensions in URLs: `post.id.replace(/\.mdx?$/, '')`

2. **Rendering pattern** (Astro v5):
   ```typescript
   import { getEntry, render } from 'astro:content';

   const entry = await getEntry('blog', slug);
   const { Content } = await render(entry); // Not entry.render()
   ```

3. **Schema location**: `src/content/config.ts`

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
- **Styling**: Pico CSS v2 + Tailwind CSS
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
- `src/content/blog/`: Markdown blog posts (en/ and es/ subdirectories)

## Environment Variables

Required for full functionality (see `.env.example`):
```bash
# Admin access
ADMIN_SECRET=random_string

# Supabase (optional, for coffee/training)
PUBLIC_SUPABASE_URL=https://...
PUBLIC_SUPABASE_ANON_KEY=...
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
yarn new-post "My Post Title"
# Edit src/content/blog/my-post-title.md
```

### Accessing blog posts in code
```typescript
import { getEntry, getCollection, render } from 'astro:content';

// List all posts
const posts = await getCollection('blog');

// Get single post (SSR)
const post = await getEntry('blog', slug);
if (!post) return Astro.redirect('/404');

// Render content
const { Content } = await render(post);
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

Blog posts with translations must share a `translationKey` in their frontmatter:
```yaml
# en/welcome.md
translationKey: "welcome-post-2025"

# es/bienvenido.md
translationKey: "welcome-post-2025"
```

The language switcher in `Layout.astro` uses `getTranslatedPost()` to find the correct translated URL based on `translationKey`, not just by swapping the `/es/` prefix.

## Notes for Future Development

1. **Don't override PicoCSS colors** unless absolutely necessary. Use CSS variables.
2. **Always validate with Zod** before database operations.
3. **Check supabase !== null** before any database calls.
4. **Use SSR patterns** (`getEntry`) not static (`getStaticPaths`) for blog posts.
5. **Strip `.md` extension** from blog post IDs when creating URLs.
6. **Test graceful degradation**: App should work without env vars configured.
7. **Session storage is in-memory**: Consider Redis/database for production scale.
8. **i18n translations**: When adding translated blog posts, always use matching `translationKey` in frontmatter.

---

**Last updated**: 2025-10-10
