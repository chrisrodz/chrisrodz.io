# Supabase Database Setup

This directory contains the Supabase configuration and database migrations for chrisrodz.io.

## Quick Start

### Development Environment Setup

Development uses a cloud-based Supabase project for maximum portability (works anywhere: iPad, Chromebook, cloud IDEs, etc.). No Docker required!

```bash
# 1. Create a new Supabase project (if you haven't already)
#    - Go to https://supabase.com/dashboard
#    - Click "New Project"
#    - Name: chrisrodz-dev
#    - Region: us-east-2 (same as production)

# 2. Link to your dev project and set up
yarn db:setup <project-ref>

# 3. Update .env.local with your dev credentials
#    (The setup script will tell you where to get them)

# 4. Start development server
yarn dev
```

**One-time setup:**

```bash
# Login to Supabase (required once)
supabase login

# Then run the setup
yarn db:setup <project-ref>
```

### Development Workflow

Once linked to your dev project:

```bash
# Check project status
supabase status

# Pull latest schema from dev project
yarn db:pull

# Push migrations to dev project
yarn db:push

# Generate TypeScript types from dev database
yarn db:types
```

## Available Scripts

### Setup

- `yarn db:setup <project-ref>` - Link to dev project, push migrations, generate types
- `yarn db:link <project-ref>` - Manually link to a Supabase project

### Database Management

- `yarn db:pull` - Pull latest schema from dev project
- `yarn db:push` - Push local migrations to dev project

### Type Generation

- `yarn db:types` - Generate TypeScript types from linked database

## Directory Structure

```
supabase/
├── config.toml              # Supabase project configuration
├── migrations/              # Database migration files
│   └── 20250101000000_initial_schema.sql
├── seed.sql                 # Seed data for local development
└── .temp/                   # Temporary files (gitignored)
```

## Working with Migrations

### Creating a New Migration

```bash
# Create a new migration file
yarn db:migration add_coffee_temperature_field

# This creates: supabase/migrations/YYYYMMDDHHMMSS_add_coffee_temperature_field.sql
```

### Writing Migration SQL

```sql
-- supabase/migrations/20250114120000_add_coffee_temperature_field.sql

-- Add new column
ALTER TABLE public.coffee_logs
ADD COLUMN brew_temp_celsius NUMERIC(4, 1);

-- Add constraint
ALTER TABLE public.coffee_logs
ADD CONSTRAINT coffee_logs_brew_temp_celsius_check
CHECK (
  (brew_temp_celsius IS NULL)
  OR (
    (brew_temp_celsius >= 80)
    AND (brew_temp_celsius <= 100)
  )
);
```

### Testing Migrations on Dev

```bash
# Push migrations to your dev project
yarn db:push

# Generate updated types
yarn db:types

# Test your feature in dev
yarn dev
```

### Deploying to Production

See [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for production deployment workflow.

## Type Generation

The Supabase CLI automatically generates TypeScript types from your database schema:

```bash
# Generate types from dev database (requires linking)
yarn db:types
```

This generates `src/lib/database.types.ts` with interfaces for all tables, views, and functions.

### Using Generated Types

```typescript
import type { Database } from '@/lib/database.types';

// Table row types
type CoffeeBean = Database['public']['Tables']['coffee_beans']['Row'];
type CoffeeLog = Database['public']['Tables']['coffee_logs']['Row'];

// Insert types (for creating new records)
type NewCoffeeLog = Database['public']['Tables']['coffee_logs']['Insert'];

// Update types (for updating records)
type CoffeeLogUpdate = Database['public']['Tables']['coffee_logs']['Update'];

// Using with Supabase client
const { data, error } = await supabase.from('coffee_logs').select('*').returns<CoffeeLog[]>();
```

## Schema Management

### Current Schema

The database has three main tables:

1. **coffee_beans** - Coffee bean inventory
   - Stores bean name, roaster, origin, roast date
   - Has `is_active` flag to soft-delete beans

2. **coffee_logs** - Brew logs
   - References coffee_beans
   - Stores brew parameters (method, dose, yield, grind, etc.)
   - Quality rating (1-5 stars)
   - Timestamps and notes

3. **activities** - Training/Strava activities
   - Stores activity data from Strava API
   - Tracks distance, duration, elevation, heart rate

All tables have Row Level Security (RLS) enabled with public read access.

### Adding New Tables

1. Create migration: `yarn db:migration add_new_table`
2. Write SQL in the generated file
3. Test locally: `yarn db:reset`
4. Push to remote: `yarn db:push`
5. Update types: `yarn db:types:remote`

## Environment Setup

### Development Environment

Your `.env.local` file contains credentials for your dev Supabase project:

```bash
# Get from: https://supabase.com/dashboard/project/<your-project-id>/settings/api
SUPABASE_URL=https://your-dev-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Admin (generate a random string)
ADMIN_SECRET=your_secret_here
```

**Update these after creating your dev project:**

1. Create new Supabase project: https://supabase.com/dashboard
2. Run: `yarn db:setup <project-ref>`
3. The setup script will guide you through getting the credentials

### Production Connection

See [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for production configuration.

## Troubleshooting

### Linking Issues

If linking fails:

```bash
# Make sure you're logged in
supabase login

# Verify the project reference is correct
supabase projects list

# Try linking again
supabase link --project-ref your-project-ref
```

### Migration Conflicts

If migrations fail when pushing:

```bash
# Check current migration status
supabase migration list

# Pull remote schema to see what's there
yarn db:pull

# If needed, create a new migration to fix the divergence
yarn db:migration fix_migration_conflict
```

### Type Generation Issues

If type generation fails:

```bash
# Make sure you're linked to a project
supabase status

# For dev types (requires linking)
yarn db:types

# Check that your database has the tables you expect
# Go to: https://supabase.com/dashboard/project/<your-project-id>/editor
```

## Best Practices

1. **Never edit migration files after they've been applied**
   - Create a new migration instead

2. **Always test migrations locally first**
   - Use `yarn db:reset` to test the full migration sequence

3. **Use descriptive migration names**
   - Good: `add_coffee_temperature_tracking`
   - Bad: `update_schema`

4. **Keep migrations small and focused**
   - One feature per migration
   - Easier to debug and rollback if needed

5. **Generate types after schema changes**
   - Run `yarn db:types` or `yarn db:types:remote`
   - Commit the generated types to git

6. **Version control everything**
   - All migrations should be committed
   - Config.toml should be committed
   - Generated types should be committed

## Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Database Migrations Guide](https://supabase.com/docs/guides/deployment/database-migrations)
- [Local Development](https://supabase.com/docs/guides/local-development)
- [Type Generation](https://supabase.com/docs/reference/cli/supabase-gen-types-typescript)
