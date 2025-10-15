# Supabase Database Setup

This directory contains the Supabase configuration and database migrations for chrisrodz.io.

## Quick Start

### Local Development

```bash
# Start local Supabase (requires Docker)
yarn db:start

# Check status
yarn db:status

# Stop local Supabase
yarn db:stop
```

Access local services:

- Supabase Studio: http://127.0.0.1:54323
- Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- API: http://127.0.0.1:54321

### Remote Connection

```bash
# Login to Supabase (one-time setup)
supabase login

# Link to your remote project
supabase link --project-ref your-project-ref

# Pull latest schema from remote
yarn db:pull

# Push local migrations to remote
yarn db:push
```

## Available Scripts

### Database Management

- `yarn db:start` - Start local Supabase stack (Docker required)
- `yarn db:stop` - Stop local Supabase stack
- `yarn db:reset` - Reset local database and run all migrations
- `yarn db:status` - Show status of all Supabase services

### Migrations

- `yarn db:migration <name>` - Create a new migration file
- `yarn db:push` - Push migrations to remote database
- `yarn db:pull` - Pull schema changes from remote database

### Type Generation

- `yarn db:types` - Generate TypeScript types from local database
- `yarn db:types:remote` - Generate TypeScript types from remote database

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

### Testing Migrations Locally

```bash
# Reset database with all migrations
yarn db:reset

# Check migration status
supabase migration list
```

### Deploying to Production

```bash
# Make sure you're linked to the right project
supabase link

# Push migrations
yarn db:push

# Generate updated types
yarn db:types:remote
```

## Type Generation

The Supabase CLI can automatically generate TypeScript types from your database schema:

```bash
# From local database
yarn db:types

# From remote database (requires linking)
yarn db:types:remote
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

### Local Development

No environment variables needed! Just run `yarn db:start`.

### Remote Connection

Add to `.env`:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

## Troubleshooting

### Docker Issues

If `yarn db:start` fails:

- Make sure Docker is running
- Check Docker has enough resources (4GB+ RAM recommended)
- Try: `docker system prune` to free up space

### Migration Conflicts

If migrations fail:

```bash
# Check current migration status
supabase migration list

# Reset local database
yarn db:reset

# If remote is broken, you may need to manually fix via SQL Editor
```

### Type Generation Issues

If type generation fails:

```bash
# Make sure database is running
yarn db:status

# For local types
yarn db:types

# For remote types (requires linking)
supabase link --project-ref your-project-ref
yarn db:types:remote
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
