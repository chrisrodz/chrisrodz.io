#!/bin/bash
set -euo pipefail

# Quick Setup Script for GitHub Copilot Agents
# This script sets up the development environment quickly

echo "🚀 Setting up chrisrodz.io for GitHub Copilot agents..."

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    yarn install
else
    echo "✅ Dependencies already installed"
fi

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "⚙️  Creating development environment file..."
    cat > .env.local << EOF
# Minimal config for development
# WARNING: Change this password for production use!
ADMIN_SECRET=test_admin_secret_for_development

# Supabase (optional - will show setup instructions if not configured)
# SUPABASE_URL=your_project_url
# SUPABASE_ANON_KEY=your_anon_key
# SUPABASE_SERVICE_KEY=your_service_key

# Strava (optional)
# STRAVA_CLIENT_ID=
# STRAVA_CLIENT_SECRET=
# STRAVA_REFRESH_TOKEN=
EOF
    echo "✅ Environment file created"
else
    echo "✅ Environment file already exists"
fi

# Run checks to ensure everything is working
echo "🔍 Running project checks..."
yarn run check

if [ $? -eq 0 ]; then
    echo "✅ All checks passed!"
    echo ""
    echo "🎉 Setup complete! You can now:"
    echo "   • Start development server: yarn dev"
    echo "   • View the site: http://localhost:4321/"
    echo "   • Test admin panel: http://localhost:4321/admin"
    echo "   • Admin password: test_admin_secret_for_development"
    echo ""
    echo "📚 See .github/DEVELOPMENT.md for detailed testing guide"
else
    echo "❌ Some checks failed. Please review the output above."
    exit 1
fi