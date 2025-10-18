# Development Setup Guide for GitHub Copilot Agents

## Quick Start for Agents

### 1. Environment Setup

```bash
# Install dependencies
yarn install

# Create environment file with minimal config
cp .env.example .env.local

# Edit .env.local with test credentials:
echo "ADMIN_SECRET=test_admin_secret_for_development" > .env.local
```

### 2. Development Server

```bash
# Start development server (includes i18n type generation)
yarn dev

# Server runs on: http://localhost:4321/
```

### 3. Testing the Application

#### Core Functionality Tests

- **Homepage**:
  - Spanish: `http://localhost:4321/`
  - English: `http://localhost:4321/en`
- **Blog Posts**:
  - Spanish: `http://localhost:4321/blog/bienvenido-a-mi-sitio`
  - English: `http://localhost:4321/en/blog/welcome-to-my-site`
- **Coffee Tracking**:
  - Spanish: `http://localhost:4321/cafe`
  - English: `http://localhost:4321/en/cafe`
- **Admin Panel**: `http://localhost:4321/admin`
  - Login with password: `test_admin_secret_for_development`

#### Build and Quality Checks

```bash
# Run all checks (validation, type-check, lint, format)
yarn check

# Build for production
yarn build

# Preview build
yarn preview
```

### 4. Key Features to Verify

#### Internationalization (i18n)

- [ ] Language switching works (🇵🇷 ES / 🇺🇸 EN buttons)
- [ ] URLs follow correct patterns:
  - Spanish (default): `/`, `/blog/slug`, `/cafe`
  - English: `/en`, `/en/blog/slug`, `/en/cafe`
- [ ] Content displays in correct language
- [ ] Blog post translations work properly

#### Theme System

- [ ] Dark/light mode toggle works (🌕/🌞 button)
- [ ] Theme persists across page navigation
- [ ] PicoCSS variables render correctly in both themes

#### Authentication

- [ ] Admin login works with test credentials
- [ ] Session persists across page navigation
- [ ] Protected routes redirect to login when needed
- [ ] Logout functionality works

#### Graceful Degradation

- [ ] Coffee tracking shows "Database not configured" message
- [ ] Application works without Supabase environment variables
- [ ] No JavaScript errors in browser console
- [ ] All features degrade gracefully when services unavailable

#### Content Management

- [ ] Blog posts render from Markdown files
- [ ] Frontmatter data displays correctly (title, date, tags)
- [ ] Content Collections work with both languages
- [ ] RSS feeds generate properly

### 5. Development Workflow

#### Making Changes

1. **Always test both languages** after making changes
2. **Run `yarn check`** before committing
3. **Test graceful degradation** - app should work without env vars
4. **Verify build succeeds** with `yarn build`

#### Adding New Features

1. Check if feature needs i18n support
2. Add Zod validation for any forms
3. Implement graceful degradation for external services
4. Use PicoCSS variables for styling
5. Test in both light and dark themes

#### Debugging Common Issues

- **Build failures**: Check TypeScript errors with `yarn astro check`
- **i18n issues**: Verify translation keys with `yarn validate:i18n`
- **Style issues**: Ensure using PicoCSS variables, not hardcoded values
- **SSR errors**: Confirm using `Astro.params` instead of `getStaticPaths()`

### 6. Testing Checklist for Agents

When working on this project, verify:

- [ ] Development server starts without errors (`yarn dev`)
- [ ] Both language versions load properly
- [ ] Admin authentication works with test credentials
- [ ] Theme toggle functions correctly
- [ ] Blog posts display with proper formatting
- [ ] Coffee tracking shows graceful degradation message
- [ ] Build process completes successfully (`yarn build`)
- [ ] No TypeScript or linting errors (`yarn check`)
- [ ] All forms validate inputs properly
- [ ] Navigation works between all pages and languages

### 7. Environment Variables

**Required for full functionality:**

```bash
ADMIN_SECRET=test_admin_secret_for_development
```

**Optional (for enhanced features):**

```bash
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_REFRESH_TOKEN=your_refresh_token
```

The application will work without the optional variables and show setup instructions for missing services.

---

**Note for Agents**: This project is designed to work out-of-the-box for development and testing. The graceful degradation ensures you can test all core functionality without external service setup.
