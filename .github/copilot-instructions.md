# GitHub Copilot Instructions for chrisrodz.io

This is a personal website built with Astro v5 in SSR mode, featuring a bilingual blog, coffee tracking, and training dashboard.

## Quick Reference

For **specific file types**, see path-specific instructions in `.github/instructions/`:

- [Astro Components](instructions/astro-components.instructions.md) - Pages, layouts, components
- [React Components](instructions/react-components.instructions.md) - Interactive UI components
- [API Routes](instructions/api-routes.instructions.md) - Backend endpoints
- [Library Code](instructions/library-code.instructions.md) - Utilities, stores, schemas
- [Content Collections](instructions/content-collections.instructions.md) - Blog posts, content

## Project Overview

### Tech Stack

- **Framework**: Astro v5+ (SSR mode with Vercel adapter)
- **Styling**: Pico CSS v2 with minimal custom overrides
- **Database**: Supabase (PostgreSQL) with graceful degradation
- **Auth**: Custom session-based authentication
- **Languages**: TypeScript, Astro components
- **Deployment**: Vercel with Node.js 20+

### Key Architecture Patterns

#### SSR Mode (Important!)

- This is an **SSR application** (`output: 'server'`)
- **Never use** `getStaticPaths()` for dynamic routes
- Always use SSR patterns: `const { slug } = Astro.params;`

#### Internationalization (i18n)

- **Spanish** (default): No prefix `/blog/post-slug`
- **English**: `/en/` prefix `/en/blog/post-slug`
- Blog posts stored in folder structure: `blog/post-folder/en.md` and `blog/post-folder/es.md`
- Use `getTranslatedPost()` and `getBlogPostUrl()` helpers from `src/lib/i18n.ts`

#### Graceful Degradation

- Always check `if (!supabase)` before database operations
- Show setup instructions when services aren't configured
- Blog works completely standalone without external dependencies

#### Styling Guidelines

- **Use PicoCSS variables**: `var(--pico-color)`, `var(--pico-primary)`, etc.
- **Never hardcode colors** - use CSS variables for WCAG compliance
- Dark mode via `data-theme="dark"` attribute
- Keep custom CSS minimal in `src/styles/global.css`

### Development Commands

```bash
yarn dev              # Start dev server (localhost:4321)
yarn build            # Type check + build for production
yarn check            # Run all checks (validate + type check + lint + format)
yarn new-post "Title" # Create both en.md and es.md blog posts
```

### File Structure Guidelines

#### Content Collections

- Blog posts: `src/content/blog/post-folder/{en,es}.md`
- Each post has custom `slug` in frontmatter
- Find posts by slug: `allPosts.find(p => p.data.slug === slug && p.data.locale === locale)`

#### Database Operations

```typescript
// Always check supabase availability
if (!supabase) {
  return { error: 'Database not configured' };
}
```

#### Input Validation

- All forms use Zod schemas from `src/lib/validation.ts`
- Always validate: `const result = schema.safeParse(data);`

#### Authentication

- Session-based (not JWT) with HttpOnly cookies
- Check auth: `const isAuth = checkAuth(Astro.cookies);`

### Code Quality Requirements

#### TypeScript

- Full TypeScript coverage required
- Use `CollectionEntry<'blog'>` for blog posts
- Database client is `SupabaseClient | null`

#### Imports

- Use path aliases: `@/lib/`, `@/components/`, etc.
- Import from `astro:content` for collections

#### Error Handling

- Never expose stack traces to users
- Always provide user-friendly error messages
- Log errors server-side when appropriate

### Translation System

- Use type-safe `t()` function from `useTranslations(locale)`
- Translation keys auto-generated from JSON files
- Never hardcode user-facing strings

### Security Practices

- Validate all inputs with Zod schemas
- Use session-based auth with secure cookies
- Never commit secrets (use environment variables)

### Performance Guidelines

- Astro provides excellent performance by default
- Use server-side rendering for dynamic content
- Minimize client-side JavaScript

### Testing Approach

- Test graceful degradation (without env vars)
- Verify both English and Spanish versions
- Test admin authentication flows

### Environment Setup

- Copy `.env.example` to `.env.local`
- `ADMIN_SECRET` required for admin access
- Supabase vars optional (graceful degradation)
- App functions without external services configured

## Common Task Patterns

### Adding New Features

1. **Check if internationalization is needed** - Most user-facing features need both languages
2. **Add Zod validation** for any form inputs or API endpoints
3. **Implement graceful degradation** if using external services (Supabase, Strava)
4. **Use PicoCSS variables** for consistent styling
5. **Test both language versions** (Spanish `/` and English `/en/`)
6. **Run `yarn check`** to ensure code quality

### Bug Fixes

1. **Reproduce the issue** in both language versions if applicable
2. **Check for similar patterns** elsewhere in the codebase
3. **Maintain existing behavior** for working features
4. **Test edge cases** like missing data or offline state

### UI Changes

1. **Use PicoCSS classes and variables** - never hardcode styles
2. **Test in both light and dark themes** - use theme toggle
3. **Ensure accessibility** with proper ARIA labels and semantic HTML
4. **Verify responsive behavior** on different screen sizes
5. **Check both language versions** for layout consistency

### Content Updates

1. **Update both language versions** for blog posts and static content
2. **Use proper frontmatter** with required fields (title, description, pubDate, slug, locale)
3. **Follow folder structure** for content collections
4. **Generate proper slugs** that are SEO-friendly

### API Development

1. **Always validate inputs** with Zod schemas
2. **Handle database unavailability** gracefully (return 503)
3. **Use proper HTTP status codes** (200, 201, 400, 401, 403, 500, 503)
4. **Check authentication** for protected endpoints
5. **Return consistent JSON structure**

## Acceptance Criteria Checklist

For any task, ensure:

- [ ] Code follows TypeScript strict mode
- [ ] All inputs are validated with Zod schemas
- [ ] Database operations check for `supabase` availability
- [ ] Styling uses PicoCSS variables (no hardcoded colors)
- [ ] Both language versions work correctly (Spanish and English)
- [ ] Build passes: `yarn check` (lint, format, type-check)
- [ ] Graceful degradation works without external services
- [ ] Authentication flows work with test credentials
- [ ] No sensitive data exposed in client-side code
