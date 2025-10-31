# AGENTS.md

**Be extremely concise, sacrifice grammar for the sake of conciseness**

Guidance for AI Coding Agents working in this repository.

## Critical Rules

**MUST follow these constraints:**

| Rule                             | Why                                         |
| -------------------------------- | ------------------------------------------- |
| Never commit directly to `main`  | Auto-deploys to production                  |
| Always commit AND push together  | Prevents work loss                          |
| Always create PR before merging  | Required for all changes                    |
| Never use `getStaticPaths()`     | SSR-only app (output: 'server')             |
| Always check `supabase !== null` | Graceful degradation when DB not configured |
| Always validate with Zod         | Never trust user input                      |
| Use PicoCSS CSS variables        | Never hardcode colors                       |
| Never hardcode UI strings        | Use type-safe `t()` function                |

## Git Workflow

### Feature Branch Workflow

```bash
# 1. Create branch
git checkout main && git pull && git checkout -b feature/description

# 2. Make changes and test
yarn dev
yarn build
yarn test

# 3. Commit + push (always together)
git add . && git commit -m "message" && git push

# 4. Create PR
gh pr create --title "Feature: description" --body "details"
```

**Branch prefixes**: `feature/`, `fix/`, `docs/`, `refactor/`

### Version Bumping (Automated)

**PR Title Conventions** - Merge to main triggers automated version bump via semantic-release.

| Prefix                     | Version Bump | Example                                                 |
| -------------------------- | ------------ | ------------------------------------------------------- |
| `feat:`                    | MINOR        | `feat: Add coffee export`                               |
| `fix:`                     | PATCH        | `fix: Correct brew time`                                |
| `chore:`                   | PATCH        | `chore: Update dependencies`                            |
| `chore(deps-dev):`         | None         | `chore(deps-dev): bump eslint`                          |
| `docs:`                    | None         | `docs: Update README`                                   |
| `ci:`                      | None         | `ci: Update Actions`                                    |
| `refactor:`                | None         | `refactor: Extract i18n`                                |
| `BREAKING CHANGE:` in body | MAJOR        | `feat: New auth\n\nBREAKING CHANGE: Old tokens invalid` |

**How it works:**

1. Use conventional commit prefix in PR title (e.g., `feat:`, `fix:`, `docs:`)
2. Merge PR to main (requires squash merge to preserve title as commit message)
3. Semantic-release workflow runs automatically
4. Bumps version in package.json, creates Git tag, generates GitHub Release

**No manual version management needed** - Version updates happen via CI/CD on merge.

## Architecture Gotchas

### SSR Mode (Astro v5)

**All routes are SSR** - No static generation.

```typescript
// ❌ NEVER use this
export async function getStaticPaths() { ... }

// ✅ Always use SSR pattern
const { slug } = Astro.params;
const entry = await getEntry('blog', slug);
```

### Blog Posts (Content Collections)

**Folder-per-post structure:**

```
src/content/blog/
└── welcome-post-2025/        # Translation key
    ├── en.md                 # English (slug in frontmatter)
    └── es.md                 # Spanish (slug in frontmatter)
```

**Finding posts:**

```typescript
// Find by slug (not ID)
const entry = allPosts.find((post) => post.data.slug === slug && post.data.locale === locale);

// Find translations
import { getTranslatedPost } from '@/lib/i18n';
const translated = await getTranslatedPost(post, 'es');
```

### Internationalization

**Spanish is default** (no prefix), English uses `/en/`

```typescript
import { getLocaleFromUrl, useTranslations } from '@/lib/i18n';

const locale = getLocaleFromUrl(Astro.url); // 'es' or 'en'
const { t } = useTranslations(locale);
const title = t('nav.home'); // Type-safe translation
```

**Key files:**

- Translation JSONs: `src/i18n/{en,es}.json`
- Types: Auto-generated in `src/lib/i18n-keys.ts`
- Pre-commit hooks validate completeness

### Database (Supabase)

**Null-safe pattern** - App degrades gracefully without DB:

```typescript
// src/lib/supabase.ts exports
export const supabase: SupabaseClient | null;

// Always check before use
if (!supabase) {
  return { error: 'Database not configured' };
}
```

**Migrations:**

```bash
yarn db:migration name    # Create migration
yarn db:push              # Push to dev
yarn db:types             # Generate types
```

See [supabase/README.md](supabase/README.md) for detailed workflow.

### Styling (PicoCSS v2)

**Always use CSS variables:**

```css
/* ✅ Correct */
color: var(--pico-color);
background: var(--pico-background-color);

/* ❌ Never hardcode */
color: #333;
background: white;
```

Dark mode: Toggle via `data-theme="dark"` on `<html>`

### Authentication & Validation

- **Protected routes**: Call `checkAuth()` at page top
- **All forms**: Validate with Zod schemas in `src/lib/validation.ts`

## Code Quality

### Pre-push Checklist

- [ ] Run `yarn verify` (types + lint + format + i18n)
- [ ] Test locally with `yarn dev`
- [ ] Build succeeds: `yarn build`
- [ ] Tests pass: `yarn test`
- [ ] Update CHANGELOG.md

### Testing Guidelines

| Test This ✅                 | Skip This ❌                       |
| ---------------------------- | ---------------------------------- |
| Business logic validation    | Framework behavior (useState, etc) |
| Critical user journeys       | UI structure (button counts)       |
| Error handling & edge cases  | CSS classes and styling            |
| API contracts & integrations | HTML attributes                    |
| Custom validation rules      | Trivial getters/setters            |

**Test quality:**

- Fast (milliseconds), isolated, deterministic
- Test behavior, not implementation
- One assertion per logical concept

**When to test:**

- New features with complex logic
- Bug fixes (regression tests)
- Critical user paths (auth, data loss scenarios)
- Edge cases from production issues

## Quick Reference

### Key Files

- **Architecture**: `astro.config.mjs`
- **Database**: `src/lib/supabase.ts`, `supabase/README.md`
- **i18n**: `src/lib/i18n.ts`, `src/i18n/{en,es}.json`
- **Validation**: `src/lib/validation.ts`
- **Content schema**: `src/content/config.ts`

### Common Scripts

```bash
yarn dev                    # Start dev server
yarn build                  # Build for production
yarn verify                 # Run all checks
yarn test                   # Run tests
yarn new-post "Title"       # Create blog post (EN+ES)
yarn db:setup <ref>         # One-time DB setup
yarn generate:admin-secret  # Generate admin credentials
```

### Documentation

- **Setup & scripts**: [README.md](README.md)
- **Database workflow**: [supabase/README.md](supabase/README.md)

## Important Notes

1. **Blog posts use custom slugs** - Find by `post.data.slug`, not by ID
2. **App works without env vars** - Test graceful degradation
3. **Spanish is default** - No `/es/` prefix needed
4. **Manual review required** - Always preview UI text changes in browser before committing
