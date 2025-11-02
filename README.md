# chrisrodz.io

[![Tests](https://github.com/chrisrodz/chrisrodz.io/actions/workflows/test.yml/badge.svg)](https://github.com/chrisrodz/chrisrodz.io/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/github/package-json/v/chrisrodz/chrisrodz.io)](https://github.com/chrisrodz/chrisrodz.io)
[![Built with Astro](https://astro.badg.es/v2/built-with-astro/tiny.svg)](https://astro.build)
[![Made in Puerto Rico](https://img.shields.io/badge/Made%20in-Puerto%20Rico%20🇵🇷-red)](https://chrisrodz.io)

Mi website personal, completamente bilingüe. Actualmente tiene mi blog y mi diario de café. Aunque el website es en español por default, esta documentación es en inglés, porque inglés es el lenguaje universal de software development. Si estás leyendo esta oración, te envío un abrazo

My personal website and digital garden. A fully bilingual (Spanish/English) SSR-powered site featuring my blog, coffee brewing tracker.

**Live at**: [chrisrodz.io](https://chrisrodz.io)

## Features

- **Bilingual by Design** - Spanish (default) and English with smart content translation system
- **Coffee Tracking** - Track brewing methods, beans, and tasting notes with PostgreSQL backend
- **Blog** - Markdown-based blog with Content Collections
- **Dark Mode** - System-aware theme with manual toggle

## Tech Stack

- **Language**: TypeScript
- **Framework**: [Astro](https://astro.build)
- **Styling**: [Pico CSS](https://picocss.com/)
- **Database**: [Supabase](https://supabase.com)
- **Deployment**: [Vercel](https://vercel.com)
- **Testing**: [Vitest](https://vitest.dev) + Testing Library

## Quick Start

### 1. Install dependencies

```bash
yarn install
```

### 2. Set up environment (optional)

```bash
cp .env.example .env
```

The site works without configuration, but you'll need environment variables for:

- **Admin access**: Run `yarn generate:admin-secret` to create credentials
- **Coffee tracking**: Supabase credentials (see `.env.example`)

### 3. Start development

```bash
yarn dev
```

Visit <http://localhost:4321> to see the site.

## Development Scripts

### Content Creation

```bash
yarn new-post "My Post Title"        # Create EN+ES blog posts
yarn new-post "My Post Title" en     # English only
yarn new-post "My Post Title" es     # Spanish only
```

### Internationalization

```bash
yarn generate:i18n      # Generate TypeScript types from translation JSON
yarn validate:i18n      # Ensure EN/ES translation keys match
```

### Database (Supabase)

```bash
yarn db:setup <ref>     # One-time setup: link project + push migrations
yarn db:migration name  # Create new migration file
yarn db:push            # Push migrations to dev database
yarn db:types           # Generate TypeScript types from schema
```

### Code Quality

```bash
yarn verify             # Run all checks (i18n + types + lint + format)
yarn lint               # ESLint
yarn format             # Prettier
yarn test               # Vitest unit tests
yarn test:coverage      # With coverage report
```

### Admin

```bash
yarn generate:admin-secret  # Generate secure admin credentials
```

## Testing

```bash
yarn test              # Run all tests
yarn test:coverage     # With coverage report
yarn test:watch        # Watch mode
```

Tests run automatically on all pushes to `main` and in pull requests via GitHub Actions.

## Deployment

Deployed on Vercel with automatic deployments on every push to `main`. Preview deployments are created for all pull requests.

Visit the live site at [chrisrodz.io](https://chrisrodz.io).

## Project Structure

```plaintext
src/
├── content/blog/    # Markdown blog posts (folder-per-post, EN/ES translations)
├── pages/           # Astro routes (SSR mode)
│   ├── [locale]/    # English routes (/en/*)
│   ├── admin/       # Protected admin pages
│   └── api/         # API endpoints
├── components/      # React + Astro components
├── lib/             # Utilities, DB client, i18n, validation
├── i18n/            # Translation JSON files (en.json, es.json)
└── styles/          # PicoCSS + minimal custom overrides
```

## Contributing

This is my personal website, but I welcome:

- 🐛 **Bug reports** - Open an issue if you spot something broken
- 🔧 **Bug fix PRs** - Fixes are always appreciated
- 💡 **Suggestions** - Feature ideas welcome, but may not be implemented

Not actively seeking feature contributions since this is a personal project, but feel free to fork and adapt for your own use!

## License

MIT License - see [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Christian A. Rodriguez Encarnación
