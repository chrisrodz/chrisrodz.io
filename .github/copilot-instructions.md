# GitHub Copilot Instructions for chrisrodz.io

This is a personal website built with Astro v5 in SSR mode, featuring a bilingual blog, coffee tracking, and training dashboard.

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

## When Working on This Project

1. **Always check the current locale** when working with i18n
2. **Use SSR patterns** - never static generation for dynamic routes
3. **Validate inputs** with Zod before any database operations
4. **Check database availability** before Supabase calls
5. **Use PicoCSS variables** for all styling
6. **Test both languages** for any user-facing changes
7. **Follow the established file structure** for content and components
8. **Keep changes minimal** and focused on the specific task
9. **Run `yarn check`** before committing changes
10. **Test graceful degradation** when external services aren't configured
