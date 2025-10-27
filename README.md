# Personal Site - Christian A. Rodriguez Encarnación

My personal website. Built with Astro, featuring my blog, my daily coffee tracking app, and some new stuff I'm cooking up.

**Live at**: [chrisrodz.io](https://chrisrodz.io)

## Quick Start

Follow these steps to get started:

### 1. Install dependencies

```bash
yarn install
```

### 2. Copy environment variables

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:

```bash
# Supabase
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Admin (store hashed secret values only)
# You can use yarn generate:admin-secret to generate these values
ADMIN_SECRET_SALT=hex_encoded_salt
ADMIN_SECRET_HASH=hex_encoded_hash

# Strava (optional, for training sync)
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
STRAVA_REFRESH_TOKEN=your_strava_refresh_token
```

### 3. Start development

```bash
yarn dev
```

Visit <http://localhost:4321> to see the site

### 4. Set up Supabase (optional but recommended)

The site works without Supabase, but you'll need it for coffee tracking and admin login. Follow the instructions at [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Testing

Tests use **Vitest** + **Testing Library** (React) with coverage reporting via v8.

### Running Tests

```bash
yarn test              # Run all tests
yarn test:coverage     # Run with coverage report
yarn test:watch        # Watch mode for development
```

### Configuration

- **vitest.config.ts** - Main Vitest configuration
- **vitest.setup.ts** - Test setup file (runs before all tests)

### CI/CD

Tests run automatically on:

- All pushes to `main` branch
- All pushes to `claude/**` branches
- All pull requests to `main`

See `.github/workflows/test.yml` for the GitHub Actions configuration.

## Deployment

This site is configured for seamless deployment on Vercel with automatic deployments on every push to `main`.

### Initial Deployment

**Via Vercel Dashboard (Recommended):**

1. Push your code to GitHub
2. Visit [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Configure environment variables:
   - `ADMIN_SECRET` - Generate with: `openssl rand -base64 32`
   - Optional: Supabase credentials (if using coffee/training features)
5. Deploy!

**Via Vercel CLI:**

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Continuous Deployment

- **Auto-deploy**: Every push to `main` triggers a new deployment
- **Build time**: ~30-60 seconds
- **Preview deploys**: Available for pull requests
- **Rollback**: One-click rollback to previous deployments

## Tech Stack

- **Framework**: [Astro](https://astro.build) v5.14+
- **Language**: TypeScript
- **Styling**: [Pico CSS](https://picocss.com/)
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **Deployment**: [Vercel](https://vercel.com) (Node.js 20+)
- **Validation**: [Zod](https://zod.dev)
- **Authentication**: Custom session-based with [nanoid](https://github.com/ai/nanoid)
- **Content**: Markdown with frontmatter (Astro Content Collections)

## Resources

- [Astro Documentation](https://docs.astro.build)
- [Supabase Documentation](https://supabase.com/docs)
- [Pico CSS Documentation](https://picocss.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
