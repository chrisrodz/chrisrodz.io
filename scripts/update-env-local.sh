#!/bin/bash
# Update .env.local with current local Supabase credentials
# Run this script if you need to refresh your local credentials after a clean Docker setup

set -e

echo "Getting local Supabase credentials..."

# Check if Supabase is running
if ! docker ps | grep -q supabase_db_chrisrodz.io; then
    echo "Error: Local Supabase is not running."
    echo "Start it with: yarn db:start"
    exit 1
fi

# Get credentials from supabase status
CREDENTIALS=$(supabase status 2>&1)

# Extract values
API_URL=$(echo "$CREDENTIALS" | grep "API URL:" | awk '{print $3}')
ANON_KEY=$(echo "$CREDENTIALS" | grep "Publishable key:" | awk '{print $3}')
SERVICE_KEY=$(echo "$CREDENTIALS" | grep "Secret key:" | awk '{print $3}')

echo ""
echo "Local Supabase credentials:"
echo "  API URL: $API_URL"
echo "  Anon Key: $ANON_KEY"
echo "  Service Key: $SERVICE_KEY"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Creating .env.local..."
    cat > .env.local << EOF
# Supabase - Local Development
# These credentials are stable across Docker restarts
# Generated from: yarn db:status
SUPABASE_URL=$API_URL
SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_KEY=$SERVICE_KEY

# Admin (generate a random string)
ADMIN_SECRET=

# Strava (optional)
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
STRAVA_REFRESH_TOKEN=
EOF
    echo "Created .env.local with local Supabase credentials"
else
    echo "Note: .env.local already exists."
    echo "To update it, manually edit the file with the credentials above."
    echo "Or backup your .env.local and re-run this script to regenerate it."
fi

echo ""
echo "✓ Done!"
