# Migration Deployment Checklist

Use this checklist when deploying the Supabase CLI setup for the first time.

## Pre-Merge Checklist

- [ ] **Verify local Supabase is working**

  ```bash
  yarn db:start
  yarn db:status
  ```

- [ ] **Link to production Supabase**

  ```bash
  supabase login
  supabase link --project-ref YOUR_PROJECT_REF
  ```

- [ ] **Pull production schema**

  ```bash
  yarn db:pull
  ```

- [ ] **Verify initial migration matches production**
  - Compare `supabase/migrations/20250101000000_initial_schema.sql` with pulled schema
  - If different, update migration file to match production exactly
  - Commit any changes before merging PR

- [ ] **Test migration locally**
  ```bash
  yarn db:reset  # This should succeed without errors
  yarn dev       # Verify app works with migrated schema
  ```

## Post-Merge Setup (One-Time)

- [ ] **Baseline production migration history**

  ```bash
  supabase link --project-ref YOUR_PROJECT_REF
  supabase migration repair 20250101000000 --status applied
  ```

- [ ] **Verify migration is marked as applied**

  ```bash
  supabase migration list
  # Should show: ✓ applied  ✓ applied  20250101000000_initial_schema
  ```

- [ ] **Add GitHub Secrets** (Settings → Secrets and variables → Actions)
  - `SUPABASE_ACCESS_TOKEN` - Get from https://supabase.com/dashboard/account/tokens
  - `SUPABASE_PROJECT_ID` - Your project reference (e.g., `abcdefgh12345678`)
  - `SUPABASE_DB_PASSWORD` - From Supabase Dashboard → Project Settings → Database

- [ ] **Add Vercel Environment Variables** (optional, if needed for build-time type checking)
  - Settings → Environment Variables → Production
  - Add same variables as GitHub Secrets

- [ ] **Test GitHub Action**
  - Create a test migration:
    ```bash
    yarn db:migration test_deployment
    # Add a comment to the file: -- Test migration
    git add supabase/migrations/
    git commit -m "Test migration deployment"
    git push origin main
    ```
  - Watch GitHub Actions run
  - Verify migration appears in production: `supabase migration list`

- [ ] **Clean up test migration** (if you created one)
  - Delete test migration from production via Supabase SQL Editor
  - Remove test migration file locally
  - Commit the removal

## Verification

- [ ] **Check production database**
  - Visit Supabase Dashboard → Database → Schema Visualizer
  - Verify tables exist: `coffee_beans`, `coffee_logs`, `activities`

- [ ] **Test production site**
  - Visit your production URL
  - Test coffee logging feature
  - Test training activities feature
  - Check admin panel

- [ ] **Check logs**
  - Vercel Dashboard → Logs (check for database errors)
  - Supabase Dashboard → Logs (check for query errors)

## Future Migrations (Reference)

When adding new database features:

- [ ] Create migration: `yarn db:migration feature_name`
- [ ] Write SQL in generated file
- [ ] Test locally: `yarn db:reset && yarn dev`
- [ ] Generate types: `yarn db:types`
- [ ] Commit: `git add supabase/ src/lib/database.types.ts`
- [ ] Push to `main` (GitHub Action deploys automatically)
- [ ] Verify in production

## Rollback Plan (If Something Goes Wrong)

- [ ] **Option 1: Forward fix**

  ```bash
  yarn db:migration rollback_feature
  # Write SQL to undo changes
  yarn db:push
  ```

- [ ] **Option 2: Restore from backup**
  - Supabase Dashboard → Database → Backups
  - Restore to point before migration
  - Fix migration locally and redeploy

---

## Quick Reference

### Get Production Credentials

```bash
# Access Token
https://supabase.com/dashboard/account/tokens

# Project ID
supabase projects list
# Or check URL: https://supabase.com/dashboard/project/[PROJECT_ID]

# Database Password
# Supabase Dashboard → Project Settings → Database → Connection string
```

### Check Migration Status

```bash
# Local
supabase migration list

# Production
supabase link --project-ref YOUR_PROJECT_REF
supabase migration list
```

### Manual Migration Deployment

```bash
supabase link --project-ref YOUR_PROJECT_REF
yarn db:push
yarn db:types:remote
```

---

**Status**: [ ] Not Started | [ ] In Progress | [X] Complete

**Date Completed**: **\*\***\_\_\_**\*\***

**Notes**:
