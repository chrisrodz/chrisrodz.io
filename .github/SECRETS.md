# GitHub Secrets Setup for chrisrodz.io

This document explains how to configure GitHub repository secrets for optimal GitHub Copilot agent functionality and Supabase integration.

## Required Secrets

### For GitHub Copilot Agents

Set these secrets in your GitHub repository (Settings → Secrets and variables → Actions):

#### `ADMIN_SECRET`

- **Purpose**: Secure authentication for admin panel access
- **Value**: Generate a secure random string (32+ characters)
- **Generate command**: `openssl rand -base64 32`
- **Example**: `xB8mZPQ2F1nR7vK9eDwLsU3jY6hV4pAc`

### For Supabase Integration (Optional)

These are optional - the application gracefully degrades without them:

#### `SUPABASE_URL`

- **Purpose**: Supabase project URL for database operations
- **Value**: Your Supabase project URL
- **Format**: `https://your-project-id.supabase.co`
- **Where to find**: Supabase Dashboard → Settings → API

#### `SUPABASE_ANON_KEY`

- **Purpose**: Public anonymous key for client-side operations
- **Value**: Your Supabase anonymous/public key
- **Where to find**: Supabase Dashboard → Settings → API → anon/public key

#### `SUPABASE_SERVICE_KEY`

- **Purpose**: Service role key for admin operations (server-side only)
- **Value**: Your Supabase service role key
- **Where to find**: Supabase Dashboard → Settings → API → service_role key
- **⚠️ Security**: Never expose this key in client-side code

### For Strava Integration (Optional)

These are optional for training data features:

#### `STRAVA_CLIENT_ID`

- **Purpose**: Strava API application identifier
- **Value**: Your Strava application client ID
- **Where to find**: Strava API settings

#### `STRAVA_CLIENT_SECRET`

- **Purpose**: Strava API application secret
- **Value**: Your Strava application client secret
- **Where to find**: Strava API settings

#### `STRAVA_REFRESH_TOKEN`

- **Purpose**: Long-lived token for Strava API access
- **Value**: Your Strava refresh token
- **Where to find**: Generated through Strava OAuth flow

## How to Add Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact name and value

## Verification

After adding secrets, the `copilot-setup.yml` workflow will:

- ✅ Validate all configuration files
- ✅ Check secret availability
- ✅ Test development environment
- ✅ Generate setup summary

## Local Development

For local development, create `.env.local`:

```bash
# Copy from example
cp .env.example .env.local

# Edit with your values
ADMIN_SECRET=your_secure_admin_secret
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
```

## Security Best Practices

- ✅ **Use strong, unique secrets** - Generate with `openssl rand -base64 32`
- ✅ **Never commit secrets** - `.env.local` is in `.gitignore`
- ✅ **Rotate secrets regularly** - Update in both GitHub and Supabase
- ✅ **Principle of least privilege** - Only use service keys when necessary
- ✅ **Monitor secret usage** - Check GitHub Actions logs for issues

## Graceful Degradation

The application is designed to work without external services:

- **No Supabase**: Shows setup instructions, blog still works
- **No Strava**: Training section shows connection instructions
- **No Admin Secret**: Uses development default with warnings

This ensures GitHub Copilot agents can test core functionality immediately.

## Troubleshooting

### Common Issues

1. **Copilot setup workflow fails**
   - Check that all required secrets are set
   - Verify secret names match exactly (case-sensitive)
   - Check GitHub Actions logs for specific errors

2. **Supabase connection fails**
   - Verify URL format: `https://project-id.supabase.co`
   - Check that anon key matches your project
   - Ensure service key is the service_role key

3. **Admin authentication fails**
   - Verify `ADMIN_SECRET` is set and matches
   - Check that secret is properly base64 encoded
   - Clear browser cookies and try again

### Getting Help

- Check the [Development Guide](.github/DEVELOPMENT.md) for setup instructions
- Review workflow logs in GitHub Actions tab
- Verify secret configuration in repository settings
