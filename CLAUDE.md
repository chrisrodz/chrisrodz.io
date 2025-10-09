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

**Important**: Always follow this workflow when making changes:

1. **Commit AND push together**: Whenever you commit changes, immediately push them
   ```bash
   git add . && git commit -m "message" && git push
   ```

2. **Keep a draft PR open**: Always maintain a draft pull request with your changes
   ```bash
   # After first commit on a feature branch
   gh pr create --draft --title "Feature: [description]" --body "Working on [feature]"

   # The PR will automatically update as you push new commits
   ```

3. **Mark PR as ready when done**: Convert from draft to ready for review when feature is complete
   ```bash
   gh pr ready
   ```

This ensures work is always backed up and visible for review.

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

## Key Files

- `astro.config.mjs`: SSR mode, Vercel adapter, site URL
- `src/lib/supabase.ts`: Null-safe database client
- `src/lib/auth.ts`: Session management
- `src/lib/validation.ts`: Zod schemas
- `src/content/config.ts`: Blog collection schema
- `src/layouts/Layout.astro`: Main layout with PicoCSS, dark mode toggle, meta tags
- `src/styles/global.css`: Custom styles (minimal, uses PicoCSS variables)

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

## Notes for Future Development

1. **Don't override PicoCSS colors** unless absolutely necessary. Use CSS variables.
2. **Always validate with Zod** before database operations.
3. **Check supabase !== null** before any database calls.
4. **Use SSR patterns** (`getEntry`) not static (`getStaticPaths`) for blog posts.
5. **Strip `.md` extension** from blog post IDs when creating URLs.
6. **Test graceful degradation**: App should work without env vars configured.
7. **Session storage is in-memory**: Consider Redis/database for production scale.
