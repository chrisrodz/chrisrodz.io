# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Dependabot configuration for automated dependency updates (#XX)

## [1.2.1] - 2025-10-27

**Documentation Streamlining** - Comprehensive cleanup and restructuring for public repository readiness.

### Added

- MIT License for open-source distribution ([#49](https://github.com/chrisrodz/chrisrodz.io/pull/49))

### Changed

- Refactored AGENTS.md from verbose to concise table format (~80% reduction) ([#49](https://github.com/chrisrodz/chrisrodz.io/pull/49))
- Streamlined README.md for public audience, removed internal planning details ([#49](https://github.com/chrisrodz/chrisrodz.io/pull/49))
- Updated CLAUDE.md instructions for AI coding agents ([#49](https://github.com/chrisrodz/chrisrodz.io/pull/49))
- Renamed docs/DEPLOYMENT.md → docs/MIGRATIONS.md to reflect actual content ([#49](https://github.com/chrisrodz/chrisrodz.io/pull/49))

### Removed

- Obsolete documentation files: NEXT_STEPS.md, README.md, TESTING.md, cafe-page-redesign.md ([#49](https://github.com/chrisrodz/chrisrodz.io/pull/49))
- Outdated migration plans in docs/development/ directory ([#49](https://github.com/chrisrodz/chrisrodz.io/pull/49))
- GitHub Copilot instructions file (.github/copilot-instructions.md) ([#49](https://github.com/chrisrodz/chrisrodz.io/pull/49))

## [1.2.0] - 2025-10-27

**Schema.org Structured Data** - Enhanced SEO with Person schema for Google Knowledge Panel eligibility.

### Added

- Person schema.org structured data on homepage with JSON-LD
- Professional information, social links, and areas of expertise in structured format
- Improved eligibility for Google Knowledge Panels and rich search results

### Technical Details

- Added JSON-LD Person schema to homepage (src/pages/index.astro)
- Schema includes name, URL, email, job title, description, social profiles, and expertise areas
- Follows schema.org Person specification for optimal search engine understanding

## [1.1.1] - 2025-10-26

**System Theme Detection** - Enhanced theme detection to automatically respect user's device dark/light mode preference on first visit.

### Added

- System preference detection using `prefers-color-scheme` media query
- Automatic dark mode for first-time visitors with dark mode system preference
- Automatic light mode for first-time visitors with light mode system preference

### Changed

- Theme initialization now checks localStorage first, then system preference, then defaults to light
- Updated theme detection priority: explicit user choice > system preference > default

### Technical Details

- FOUC prevention script now detects `window.matchMedia('(prefers-color-scheme: dark)')`
- Maintains backward compatibility - existing localStorage preferences take priority
- First-time visitors automatically see their preferred theme without manual toggle

## [1.1.0] - 2025-10-26

**I18n Consolidation** - Eliminated code duplication across internationalized pages using thin wrapper pattern.

### Changed

- Consolidated blog slug pages to use single source component with locale detection
- Refactored RSS feed generation to shared helper function with i18n support
- Moved RSS metadata (title, description) to translation JSON files
- Reduced total i18n code by ~180 lines (35% reduction)

### Added

- Shared RSS helper function in `src/lib/rss-helper.ts`
- RSS translation keys (`blog.rssTitle`, `blog.rssDescription`) in translation files
- Type declarations for markdown-it and sanitize-html

### Technical Details

- Blog slug pages: Reduced from 230 to 121 lines (47% reduction)
- RSS feeds: Reduced from 82 to 65 lines (21% reduction)
- All i18n pages now follow consistent thin wrapper pattern
- Single source of truth for RSS feed generation logic

## [1.0.0] - 2025-10-26

**CHANGELOG.md created** - Created changelog file with history of work in repo and added instructions to update automatically

### Added

- Changelog to track project releases and updates ([#43](https://github.com/chrisrodz/chrisrodz.io/pull/43))
- Changelog workflow documentation in AGENTS.md ([#43](https://github.com/chrisrodz/chrisrodz.io/pull/43))

### Changed

- Updated package.json version to 1.0.0 to match current release state ([#43](https://github.com/chrisrodz/chrisrodz.io/pull/43))

## [0.10.0] - 2025-10-23

**Production-Ready Release** - Security hardening, session management, and development workflow improvements.

### Added

- Database-backed session management with HttpOnly cookies and 24-hour expiry ([#31](https://github.com/chrisrodz/chrisrodz.io/pull/31))
- Required GitHub pull request workflow for all changes to main ([#33](https://github.com/chrisrodz/chrisrodz.io/pull/33))
- Security headers middleware with CSP, HSTS, and X-Frame-Options ([#30](https://github.com/chrisrodz/chrisrodz.io/pull/30))
- CSRF protection for admin login ([#29](https://github.com/chrisrodz/chrisrodz.io/pull/29))
- Comprehensive test coverage for cafe components ([#28](https://github.com/chrisrodz/chrisrodz.io/pull/28))
- Centralized, type-safe environment configuration system ([#27](https://github.com/chrisrodz/chrisrodz.io/pull/27))

### Fixed

- XSS vulnerability in coffee form error handling
- Async auth check in Layout component
- Empty roast_date validation for coffee beans

### Security

- Session tokens stored server-side instead of in cookies
- CSRF token validation for admin actions
- Content Security Policy headers
- Secure cookie flags (HttpOnly, Secure, SameSite)

## [0.9.0] - 2025-10-20

**Testing & Analytics** - Unit testing infrastructure and performance monitoring.

### Added

- Vitest unit testing infrastructure with coverage reporting ([#19](https://github.com/chrisrodz/chrisrodz.io/pull/19))
- Vercel Analytics and Speed Insights integration ([#21](https://github.com/chrisrodz/chrisrodz.io/pull/21))
- Testing best practices documentation with high/low-value test guidelines
- GitHub Actions workflow to run tests on all PRs

### Fixed

- Mobile layout overflow on navigation and header ([#18](https://github.com/chrisrodz/chrisrodz.io/pull/18))
- Horizontal scrolling issues on mobile devices
- Header tooltip positioning outside navigation bounds

### Changed

- Optimized GitHub Actions to prevent duplicate test runs on PRs

## [0.8.0] - 2025-10-19

**Security & Admin Enhancements** - Hardened authentication and improved admin experience.

### Added

- Secure admin secret verification with scrypt hashing ([#13](https://github.com/chrisrodz/chrisrodz.io/pull/13))
- Admin login rate limiting with cooldown period ([#14](https://github.com/chrisrodz/chrisrodz.io/pull/14))
- Admin-only logout link in site footer ([#16](https://github.com/chrisrodz/chrisrodz.io/pull/16))
- Timezone-aware brew times with Puerto Rico comparison ([#15](https://github.com/chrisrodz/chrisrodz.io/pull/15))

### Changed

- Admin password verification now uses constant-time hash comparison
- Login form disables during rate limit cooldown

### Security

- Replaced plaintext admin secret with salt + hash storage
- Added rate limiting to prevent brute force attacks

## [0.7.0] - 2025-10-18

**Cafe Page Redesign** - Visual refresh and development tooling improvements.

### Added

- Redesigned /cafe page with personality, i18n support, and visual polish ([#11](https://github.com/chrisrodz/chrisrodz.io/pull/11))
- GitHub Copilot agent configuration with automated environment setup ([#9](https://github.com/chrisrodz/chrisrodz.io/pull/9))
- Coffee emoji Easter egg for authenticated admins
- Today's Coffee card with compact, above-fold layout

### Changed

- Refreshed cafe page layout for coffee logs ([#12](https://github.com/chrisrodz/chrisrodz.io/pull/12))
- Updated blog post copy and content

### Fixed

- GitHub Actions copilot-setup.yml workflow bash syntax error ([#10](https://github.com/chrisrodz/chrisrodz.io/pull/10))

## [0.6.0] - 2025-10-16

**Database & Development Infrastructure** - Local development setup with cloud-based Supabase.

### Added

- Supabase CLI for local development and migration management ([#8](https://github.com/chrisrodz/chrisrodz.io/pull/8))
- Database migration deployment strategy and automation
- GitHub Actions workflow for automated type generation
- Helper scripts for Supabase environment setup (`yarn db:setup`, `yarn db:push`, `yarn db:types`)
- Comprehensive deployment documentation in docs/DEPLOYMENT.md

### Changed

- Migrated to cloud-based dev environment (no Docker required)
- Consolidated development documentation in AGENTS.md

### Fixed

- Supabase environment variables for SSR compatibility
- TypeScript errors with process.env in Supabase client

## [0.5.0] - 2025-10-14

**Spanish Default & i18n** - Full bilingual support with Spanish as the primary language.

### Added

- Spanish as default site language (English available at /en/)
- Full i18n support for all pages (cafe, training, blog)
- Type-safe translation system with auto-generated types
- Translation validation scripts to ensure completeness
- Automatic language detection based on browser preferences
- Pre-commit hooks to validate translation files

### Changed

- Updated site structure: Spanish at root, English at /en/ prefix
- Migrated all content to folder-based translation structure
- Updated Astro config and middleware for Spanish default

### Fixed

- TypeScript naming conflicts in English route pages
- Prettier formatting in cafe components

## [0.4.0] - 2025-10-13

**CSS Migration & Polish** - Migrated from Tailwind CSS to PicoCSS for semantic, minimal styling.

### Added

- PicoCSS v2 as primary CSS framework
- Dark mode persistence across page navigation
- Mobile-optimized navigation without hamburger menu

### Changed

- Migrated all components from Tailwind to PicoCSS (AddBeanForm, CoffeeLogForm, StarRating, charts)
- Updated CLAUDE.md to reflect Tailwind removal
- Improved mobile footer layout with links above copyright

### Removed

- Tailwind CSS dependencies and configuration
- Tailwind migration documentation

### Fixed

- Dark mode toggle styling and persistence
- Number input button visibility in light mode
- Brew method button visibility in light mode
- Header and footer padding on mobile

## [0.3.0] - 2025-10-12

**Coffee Tracking Feature** - Complete coffee brewing tracker with bean inventory.

### Added

- Coffee tracking system with polished UI ([#6](https://github.com/chrisrodz/chrisrodz.io/pull/6))
- Bean inventory management with roaster, origin, process details
- Brew logging with method, grind setting, water temp, and ratings
- Inline bean form in coffee logger for quick entry
- Database schema for beans and coffees tables
- Smart defaults and redirect for improved UX
- X/Twitter profile link in site footer

### Changed

- Updated environment variable naming conventions
- Improved coffee log form UX with better validation

### Fixed

- Coffee emoji Easter egg to display on all pages when logged in

## [0.2.0] - 2025-10-11

**SEO & Code Quality** - Search engine optimization and development tooling.

### Added

- Comprehensive SEO improvements with meta tags, Open Graph, and structured data
- Site-wide footer with social links and legal pages
- Prettier and ESLint for code formatting and quality
- Pre-commit hooks with Husky and lint-staged
- Complete favicon package from favicon.io (CC BY 4.0 Twemoji)
- Markdown-based legal content collection for privacy policies
- Redirects from /blog to homepage for backwards compatibility

### Changed

- Updated homepage intro copy and footer details
- Enhanced .gitignore with comprehensive best practices
- Consolidated blog structure (removed redundant index pages)

### Removed

- Admin pages from sitemap and robots.txt

## [0.1.0] - 2025-10-10

**Design & Content** - Minimalist design and content improvements.

### Added

- Minimalist theme with typography-first design ([#3](https://github.com/chrisrodz/chrisrodz.io/pull/3))
- Mobile navigation with improved accessibility
- Minimal homepage with consolidated content
- Serif headings and cleaner navigation
- Blog content restructuring to folder-per-post organization ([#4](https://github.com/chrisrodz/chrisrodz.io/pull/4))

### Changed

- Updated branding to full name (Christian A. Rodriguez)
- Added cultural identity and Puerto Rican heritage
- Applied typography-first redesign with minimal blog cards
- Updated Git workflow documentation (PRs optional → required)

### Removed

- Tags feature from blog posts

### Fixed

- Language switcher to use correct translated blog post slugs

## [0.0.1] - 2025-10-08

**Initial Release** - Project bootstrap and foundation.

### Added

- Astro v5 project with SSR mode and Vercel adapter ([#2](https://github.com/chrisrodz/chrisrodz.io/pull/2))
- Blog system with Content Collections and markdown support
- Admin panel with session-based authentication
- Training dashboard with Strava integration
- Supabase database integration (PostgreSQL)
- Input validation with Zod schemas
- Responsive design foundation
- Vercel deployment configuration
- Initial README and project documentation

### Fixed

- Vercel deployment with Astro v5 upgrade

---

[Unreleased]: https://github.com/chrisrodz/chrisrodz.io/compare/v1.2.1...HEAD
[1.2.1]: https://github.com/chrisrodz/chrisrodz.io/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/chrisrodz/chrisrodz.io/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/chrisrodz/chrisrodz.io/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/chrisrodz/chrisrodz.io/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/chrisrodz/chrisrodz.io/compare/v0.9.0...v1.0.0
[0.9.0]: https://github.com/chrisrodz/chrisrodz.io/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/chrisrodz/chrisrodz.io/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/chrisrodz/chrisrodz.io/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/chrisrodz/chrisrodz.io/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/chrisrodz/chrisrodz.io/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/chrisrodz/chrisrodz.io/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/chrisrodz/chrisrodz.io/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/chrisrodz/chrisrodz.io/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/chrisrodz/chrisrodz.io/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/chrisrodz/chrisrodz.io/releases/tag/v0.0.1
