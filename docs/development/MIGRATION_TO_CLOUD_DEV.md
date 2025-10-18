# Migration to Cloud-Based Dev Environment

## Summary of Changes

✅ **Successfully converted from Docker-based local development to cloud-based Supabase dev environment**

This change makes the repository **truly portable** - works on any device (iPad, Chromebook, cloud IDEs, etc.) without Docker!

---

## What Changed

### 1. **package.json Scripts Updated**

**Removed:**

- ❌ `db:start` - No longer needed (no Docker)
- ❌ `db:stop` - No longer needed
- ❌ `db:reset` - Handled by migrations
- ❌ `db:status` - Handled by `supabase status`
- ❌ `db:types:remote` - Consolidated to `db:types`

**Added:**

- ✅ `db:setup <ref>` - One-command setup (link, push migrations, generate types)
- ✅ `db:link <ref>` - Link to a project manually

**Kept:**

- ✅ `db:migration <name>` - Create new migrations
- ✅ `db:types` - Generate types from linked DB
- ✅ `db:push` - Push migrations to dev DB
- ✅ `db:pull` - Pull schema from dev DB

### 2. **New Setup Script**

**`scripts/setup-dev-db.js`** - Automates the entire setup process:

```bash
yarn db:setup <project-ref>
```

This script:

1. Links to your Supabase dev project
2. Pushes all migrations
3. Generates TypeScript types
4. Guides you through getting credentials

### 3. **Updated Documentation**

#### `supabase/README.md`

- ✅ Removed all Docker references
- ✅ Added cloud dev environment setup
- ✅ Updated scripts documentation
- ✅ Simplified troubleshooting (no Docker issues)
- ✅ Updated environment setup section

#### `CLAUDE.md`

- ✅ Updated database commands section
- ✅ Added "Development Setup" instructions
- ✅ Updated development workflow
- ✅ Removed Docker requirements

#### `.env.local`

- ✅ Updated with cloud dev environment template
- ✅ Removed local Docker credentials
- ✅ Added instructions for getting dev credentials

---

## Next Steps: Complete the Setup

### 1. Create a Dev Supabase Project

1. Go to: https://supabase.com/dashboard
2. Click "New Project"
3. **Name**: `chrisrodz-dev` (or similar)
4. **Region**: `us-east-2` (same as production)
5. Create project
6. **Copy the Project Reference ID** (e.g., `abcdefghijklmnop`)

### 2. Run the Setup Script

```bash
yarn db:setup <your-project-ref>
```

This will:

- ✅ Link to your dev project
- ✅ Push migrations
- ✅ Generate database types

### 3. Get Your Dev Credentials

The setup script will tell you where to find these:

1. Go to: https://supabase.com/dashboard/project/<your-project-ref>/settings/api
2. Copy:
   - **Project URL**
   - **Anon public key**
   - **Service role key** (secret)

### 4. Update .env.local

```bash
SUPABASE_URL=https://your-dev-project-ref.supabase.co
SUPABASE_ANON_KEY=<paste anon public key>
SUPABASE_SERVICE_KEY=<paste service role key>

ADMIN_SECRET="cafe"
```

### 5. Test It

```bash
yarn dev
```

Visit http://localhost:4321 and verify the app works!

---

## Benefits of This Change

| Benefit                  | Local Docker | Cloud Dev            |
| ------------------------ | ------------ | -------------------- |
| Portable (any device)    | ❌           | ✅                   |
| Works on iPad/Chromebook | ❌           | ✅                   |
| GitHub Codespaces        | ❌           | ✅                   |
| Gitpod compatible        | ❌           | ✅                   |
| Requires Docker          | ✅           | ❌                   |
| Requires internet        | ❌           | ✅                   |
| Cost                     | Free         | Free (Supabase tier) |
| Offline development      | ✅           | ❌                   |

**For on-the-go development, cloud dev is much better!**

---

## Supabase Free Tier Limits (per project)

- 500 MB database space
- 2 GB bandwidth/month
- 50 MB file storage
- Unlimited API requests

For a personal dev environment, this is plenty. Upgrade production if needed.

---

## Reverting to Docker (if needed)

Old Docker commands are still available via Supabase CLI:

```bash
# Start Docker Supabase
supabase start

# Stop Docker Supabase
supabase stop

# Reset local database
supabase db reset
```

But the recommended workflow is cloud-based going forward.

---

## Environment Variables Reference

### Development (.env.local)

```bash
# Cloud dev project credentials
SUPABASE_URL=https://your-dev-project-ref.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_KEY=<your-service-key>

# Admin (same for all environments)
ADMIN_SECRET=<your-secret>

# Strava (optional)
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
STRAVA_REFRESH_TOKEN=
```

### Production (.env)

For production environment variables, see docs/DEPLOYMENT.md

---

## Quick Reference

```bash
# One-time setup
yarn db:setup <project-ref>

# Create new migration
yarn db:migration add_feature_name

# Test migrations on dev
yarn db:push

# Generate types
yarn db:types

# Pull schema from dev
yarn db:pull

# Check status
supabase status

# Start dev server
yarn dev
```

---

**Setup Status**: ⏳ **Waiting for you to create dev project and run `yarn db:setup`**

Once you complete the setup steps above, everything will be ready for portable, cloud-based development!
