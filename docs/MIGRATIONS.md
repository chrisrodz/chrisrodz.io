# Deployment & Migration Strategy

This document outlines the process for deploying database migrations to production and keeping your Supabase database in sync.

## Table of Contents

- [One-Time Setup (Before First Deploy)](#one-time-setup-before-first-deploy)
- [Ongoing Deployment Process](#ongoing-deployment-process)
- [Manual Migration Deployment](#manual-migration-deployment)
- [Automated CI/CD Setup](#automated-cicd-setup)
- [Verification & Rollback](#verification--rollback)
- [Troubleshooting](#troubleshooting)

---

## One-Time Setup (Before First Deploy)

### Step 1: Verify Production Schema Matches Initial Migration

**Before merging PR #8**, verify that your production database schema matches the initial migration.

```bash
# 1. Link to your production Supabase project
supabase login
supabase link --project-ref your-project-ref

# 2. Pull the current production schema
yarn db:pull

# 3. Compare the pulled schema with your initial migration
# Check: supabase/migrations/20250101000000_initial_schema.sql
# This should match your current production schema exactly
```

**If schemas don't match:**

- Update the initial migration to reflect production's actual state
- OR apply missing changes to production manually first
- Commit any corrections before merging

### Step 2: Baseline the Migration History

After merging PR #8, you need to tell Supabase that the initial migration has already been applied to production (since it represents the existing schema).

```bash
# 1. SSH into your deployment environment or run locally with production credentials
supabase link --project-ref your-project-ref

# 2. Check current migration status
supabase migration list

# 3. Repair/baseline the migration history
# This marks migrations as applied WITHOUT running them
supabase migration repair 20250101000000 --status applied

# 4. Verify the migration is now marked as applied
supabase migration list
```

**Expected output:**

```
    Local      Remote     Time (UTC)
──────────────────────────────────────────────
  ✓ applied  ✓ applied  20250101000000_initial_schema
```

### Step 3: Add Deployment Credentials to Vercel

Add these environment variables to your Vercel project:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add for **Production** environment:

```bash
SUPABASE_ACCESS_TOKEN=<your-supabase-access-token>
SUPABASE_DB_PASSWORD=<your-database-password>
SUPABASE_PROJECT_ID=<your-project-ref>
```

**Getting these values:**

```bash
# Access token: Generate at https://supabase.com/dashboard/account/tokens
# Project ID: Your project reference (e.g., abcdefghijklmnop)
# DB Password: Found in your Supabase project settings → Database → Connection string
```

---

## Ongoing Deployment Process

### Developer Workflow

When adding new database features:

```bash
# 1. Create a new migration
yarn db:migration add_new_feature

# 2. Write your SQL in the generated file
# supabase/migrations/YYYYMMDDHHMMSS_add_new_feature.sql

# 3. Test locally
yarn db:reset

# 4. Verify the migration works
yarn dev
# Test your feature...

# 5. Generate updated types
yarn db:types

# 6. Commit everything
git add supabase/migrations/ src/lib/database.types.ts
git commit -m "Add new feature to database schema"

# 7. Push and create PR
git push
```

### Deployment Flow

**Option A: Automatic (Recommended)**

Set up a GitHub Action that runs migrations on every deployment to `main`:

```yaml
# .github/workflows/deploy.yml
name: Deploy with Migrations

on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Run migrations
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
          PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
        run: |
          supabase link --project-ref $PROJECT_ID
          supabase db push

      - name: Generate production types
        run: |
          yarn db:types:remote
          # Optionally: Commit updated types back to repo

  deploy:
    needs: migrate
    runs-on: ubuntu-latest
    steps:
      # Your existing Vercel deployment steps
      # (Vercel handles this automatically, so you may not need this job)
      - run: echo "Vercel deploys automatically"
```

**Option B: Manual (For Critical Changes)**

Before pushing to `main`:

```bash
# 1. Link to production
supabase link --project-ref your-project-ref

# 2. Push migrations manually
yarn db:push

# 3. Verify migration applied
supabase migration list

# 4. Generate updated types from production
yarn db:types:remote

# 5. Now push to main (which triggers Vercel deployment)
git push origin main
```

### Which Option to Use?

- **Automatic (Option A)**: For most migrations (adding columns, indexes, tables)
- **Manual (Option B)**: For risky migrations (dropping columns, major refactors)

---

## Manual Migration Deployment

For hands-on control or emergency fixes:

```bash
# 1. Ensure you're linked to production
supabase link --project-ref your-project-ref

# 2. Check what migrations are pending
supabase migration list

# 3. Review the SQL that will be applied
cat supabase/migrations/YYYYMMDDHHMMSS_migration_name.sql

# 4. Push migrations to production
yarn db:push

# 5. Verify in Supabase Dashboard
# Go to SQL Editor and check the schema changes

# 6. Update production types
yarn db:types:remote

# 7. Commit the updated types
git add src/lib/database.types.ts
git commit -m "Update database types after migration"
git push
```

---

## Automated CI/CD Setup

For automatic migration deployment on every push to `main`, this repository includes a pre-configured GitHub Actions workflow.

See `.github/workflows/supabase-migrations.yml` for the automated migrations runner that:

1. Runs on every push to `main` branch
2. Sets up Supabase CLI
3. Links to your production project
4. Pushes pending migrations
5. Generates updated TypeScript types

**Manual override:** If you need to skip automated migrations for a specific deployment, include `[skip migrations]` in your commit message.

---

### Verification & Rollback

After deployment:

```bash
# 1. Check migration status
supabase migration list

# 2. Verify in Supabase Dashboard
# Navigate to: Database → Schema Visualizer
# Confirm new tables/columns appear

# 3. Test your application
# Visit your production site and test the new features

# 4. Check for errors in logs
# Vercel Dashboard → Your Project → Logs
# Supabase Dashboard → Logs
```

### Rollback Strategy

If a migration causes issues:

**Option 1: Forward Fix (Recommended)**

```bash
# Create a new migration that reverses the changes
yarn db:migration rollback_problematic_feature

# Write SQL to undo the changes
# Example: DROP TABLE, DROP COLUMN, etc.

# Apply the rollback migration
yarn db:push
```

**Option 2: Manual SQL Fix**

```bash
# 1. Go to Supabase Dashboard → SQL Editor
# 2. Write SQL to manually fix the issue
# 3. Create a migration file that matches what you did manually:

yarn db:migration manual_fix_YYYYMMDD
# Paste your fix SQL into the migration file
# This keeps your migration history accurate
```

**Option 3: Database Restore (Last Resort)**

If you have backups enabled in Supabase:

1. Go to Supabase Dashboard → Database → Backups
2. Restore to a point before the migration
3. Fix the migration locally
4. Redeploy with corrected migration

---

## Troubleshooting

### "Migration already applied" Error

```bash
# The migration exists in production but not marked in history
supabase migration repair <timestamp> --status applied
```

### "Migration conflicts" Error

```bash
# Your local and remote histories diverged
# Option 1: Pull remote schema and create new migration
yarn db:pull

# Option 2: Reset remote to match local (DANGEROUS)
# Only do this if remote is wrong
supabase db reset --linked
```

### "Permission denied" Error

```bash
# Verify your credentials
supabase link --project-ref your-project-ref

# Regenerate access token if needed
# https://supabase.com/dashboard/account/tokens
```

### Types Out of Sync

```bash
# Regenerate types from production
yarn db:types:remote

# Compare with local
yarn db:types

# If they differ, your schemas don't match
# Pull production schema to see differences
yarn db:pull
```

---

## Best Practices

1. **Always test migrations locally first** with `yarn db:reset`
2. **Never edit migration files after they're merged** - create new migrations instead
3. **Run migrations before deploying code** that depends on them
4. **Keep migrations atomic** - one logical change per migration
5. **Write reversible migrations** when possible (include DOWN steps in comments)
6. **Back up production** before risky migrations
7. **Monitor after deployment** - check logs and test features immediately
8. **Use transactions** in migration SQL where possible:

   ```sql
   BEGIN;
   -- Your changes here
   COMMIT;
   ```

---

## Quick Reference

```bash
# Local Development
yarn db:start           # Start local Supabase
yarn db:reset           # Reset local DB with all migrations
yarn db:migration name  # Create new migration

# Production Deployment
supabase link           # Link to production project
yarn db:push            # Push migrations to production
yarn db:types:remote    # Update types from production

# Verification
supabase migration list # Check migration status
yarn db:status          # Check local services
```
