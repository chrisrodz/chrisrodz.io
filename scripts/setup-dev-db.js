#!/usr/bin/env node

/**
 * Setup script for linking to a Supabase dev project
 *
 * This script helps set up the development database connection.
 * Run with: yarn db:setup <project-ref>
 *
 * Example: yarn db:setup abcdefghijklmnop
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const envLocalPath = path.join(projectRoot, '.env.local');

const projectRef = process.argv[2];

if (!projectRef) {
  console.error(`
❌ Missing project reference ID

Usage: yarn db:setup <project-ref>

Example: yarn db:setup abcdefghijklmnop

To find your Supabase dev project reference:
1. Go to https://supabase.com/dashboard
2. Select your dev project
3. Go to Settings → General
4. Copy the "Reference ID"

Steps:
1. Create a new Supabase project at https://supabase.com/dashboard
   - Name: chrisrodz-dev (or similar)
   - Region: us-east-2 (same as production)
2. Copy the Reference ID
3. Run: yarn db:setup <reference-id>
  `);
  process.exit(1);
}

try {
  console.log(`\n🔗 Linking to Supabase project: ${projectRef}...`);

  // Link to the project
  execSync(`supabase link --project-ref ${projectRef}`, {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  console.log('\n📦 Pushing migrations to dev project...');

  // Push migrations
  execSync('supabase db push', {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  console.log('\n🔑 Generating types from dev database...');

  // Generate types
  execSync('yarn db:types', {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  console.log('\n📝 Retrieving dev project credentials...');

  // Get the project info to get credentials
  const projectInfo = JSON.parse(
    execSync(`supabase projects list --output json`, {
      cwd: projectRoot,
      encoding: 'utf-8',
    })
  );

  const devProject = projectInfo.find((p) => p.id === projectRef);

  if (!devProject) {
    throw new Error(`Project ${projectRef} not found`);
  }

  // Get connection details
  const dbUrl = `https://${projectRef}.supabase.co`;

  // Prompt user to get keys from Supabase dashboard
  console.log(`
✅ Setup complete!

Next steps:
1. Go to: https://supabase.com/dashboard/project/${projectRef}/settings/api
2. Copy the following keys:
   - Project URL
   - Anon public key
   - Service role key (secret)

3. Update .env.local with these values:
   SUPABASE_URL=https://${projectRef}.supabase.co
   SUPABASE_ANON_KEY=<paste anon public key>
   SUPABASE_SERVICE_KEY=<paste service role key>

4. Then run: yarn dev

Your migrations have been pushed to the dev project ✨
Database types have been generated ✨
  `);
} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  console.error(`
Make sure:
- Supabase CLI is installed: https://supabase.com/docs/guides/cli/getting-started
- You're logged in: supabase login
- The project reference is correct
  `);
  process.exit(1);
}
