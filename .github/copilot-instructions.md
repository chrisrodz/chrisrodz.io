# Copilot Instructions for chrisrodz.io

This is an **SSR Astro v5** personal website with bilingual content (Spanish default, English with `/en/` prefix), coffee tracking, and training logs.

## Critical Architecture Patterns

### SSR-First Development

- **Never use `getStaticPaths()`** - this is SSR mode (`output: 'server'`) with Vercel adapter
- Find blog posts by **slug**, not ID: `allPosts.find(p => p.data.slug === slug && p.data.locale === locale)`
- All pages render on-demand; no static generation

### Bilingual Content Collections

Blog posts use **folder-per-translation** structure:

```
src/content/blog/welcome-post-2025/
├── en.md  # slug: "welcome" → /en/blog/welcome
└── es.md  # slug: "bienvenido" → /blog/bienvenido
```

- Folder name = translation key, files = locales
- Each post defines custom `slug` in frontmatter
- Use `getTranslatedPost(post, targetLocale)` to find translations

### Database Graceful Degradation

```typescript
// Always check before DB operations
if (!supabase) {
  return { error: 'Database not configured' };
}
```

- App functions without Supabase (shows setup instructions)
- Coffee/training features degrade gracefully when missing env vars

## Key Commands

```bash
# Development
yarn dev                    # Starts with i18n type generation
yarn build                  # Type check + i18n + build
yarn new-post "Title"       # Creates both en.md and es.md
yarn new-post "Title" en    # English only

# Database (Supabase cloud, no Docker)
yarn db:setup <ref>        # One-time: link + push migrations + generate types
yarn db:migration <name>   # Create migration file
yarn db:push               # Push to dev environment
yarn db:types              # Generate TypeScript types

# Quality checks
yarn check                 # validate:i18n + astro check + lint + format:check
```

## Project-Specific Conventions

### Authentication: Session-Based

- **In-memory sessions** (Map storage, consider Redis for production)
- Uses `ADMIN_SECRET_HASH` + `ADMIN_SECRET_SALT` (scrypt hashing)
- HttpOnly cookies, 24h expiry
- Always use `checkAuth(Astro.cookies)` for protected routes

### Styling: PicoCSS Variables

```css
/* ✅ Use CSS variables, never hardcode colors */
color: var(--pico-color);
background: var(--pico-primary);
/* ❌ Don't override PicoCSS colors */
```

### Type-Safe i18n System

```typescript
import { useTranslations } from '@/lib/i18n';
const { t } = useTranslations(locale);
const title = t('nav.home'); // Auto-complete + type safety
```

- Translation keys auto-generated from `src/i18n/{en,es}.json`
- Pre-commit hooks validate translation completeness
- Never hardcode user-facing strings

### Form Validation with Zod

```typescript
import { coffeeSchema } from '@/lib/validation';
const result = coffeeSchema.safeParse(formData);
// Always validate before DB operations
```

## Git Workflow

- **Never commit to `main`** - always use feature branches
- `main` auto-deploys to production (Vercel)
- **Always push immediately after commit** (prevents lost work)
- Use: `git add . && git commit -m "msg" && git push`

## File Organization

- `src/lib/`: Core utilities (auth, i18n, supabase, validation)
- `src/components/cafe/`: React components for coffee tracking
- `src/pages/[app]/[slug].astro`: Legal pages (privacy policies)
- `supabase/migrations/`: Database schema changes
- `docs/`: All project documentation (not root directory)

## Common Pitfalls

- Blog posts: Find by `post.data.slug`, not `post.id`
- i18n: Spanish is default (no prefix), English uses `/en/`
- Database: Always null-check `supabase` before operations
- Styling: Use PicoCSS CSS variables, minimal custom overrides
- Validation: Never trust form data, always validate with Zod schemas

See `AGENTS.md` for comprehensive development guidance and architectural decisions.
