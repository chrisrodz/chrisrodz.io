applyTo:

- "src/pages/\*_/_.astro"
- "src/layouts/\*_/_.astro"
- "src/components/\*_/_.astro"

---

# Astro Component Instructions

## SSR Mode Requirements

- This is an SSR application (`output: 'server'`)
- **NEVER** use `getStaticPaths()` for dynamic routes
- Always use SSR patterns: `const { slug } = Astro.params;`
- Access request data via `Astro.request`, `Astro.cookies`, `Astro.url`

## Component Structure

- Keep component logic in the frontmatter (`---` blocks)
- Use TypeScript for all component props and logic
- Import types from `astro:content` for Content Collections

## Styling Guidelines

- **ALWAYS** use PicoCSS variables: `var(--pico-primary)`, `var(--pico-color)`, etc.
- **NEVER** hardcode colors or CSS values
- Dark mode support via `data-theme="dark"` attribute
- Keep custom styles minimal in `src/styles/global.css`

## Internationalization

- Check current locale: `const locale = Astro.currentLocale || 'es';`
- Use translation helpers from `src/lib/i18n.ts`
- Test both Spanish (`/`) and English (`/en/`) routes
- Blog posts: `blog/post-folder/{en,es}.md` structure

## Common Patterns

```astro
---
// ✅ Good: SSR pattern
const { slug } = Astro.params;

// ✅ Good: Locale handling
const locale = Astro.currentLocale || 'es';
const t = useTranslations(locale);

// ✅ Good: Database null check
if (!supabase) {
  return Astro.redirect('/setup-instructions');
}
---

<h1>{t('page.title')}</h1>
<style>
  /* ✅ Good: Use PicoCSS variables */
  .custom-element {
    color: var(--pico-primary);
    background: var(--pico-background-color);
  }

  /* ❌ Bad: Hardcoded colors */
  .bad-element {
    color: #007bff; /* Don't do this */
  }
</style>
```
