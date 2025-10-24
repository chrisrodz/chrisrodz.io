#!/bin/bash

# Script to generate Supabase TypeScript types from a remote project
# Usage: PROJECT_ID=your-project-id ./scripts/generate-remote-types.sh

if [ -z "$PROJECT_ID" ]; then
    echo "Error: PROJECT_ID environment variable is required."
    echo "Usage: PROJECT_ID=your-project-id yarn db:types:remote"
    exit 1
fi

echo "Generating types from remote Supabase project: $PROJECT_ID"
supabase gen types typescript --project-id "$PROJECT_ID" > src/lib/database.types.ts

if [ $? -eq 0 ]; then
    echo "✅ Types generated successfully in src/lib/database.types.ts"
else
    echo "❌ Failed to generate types. Please check your PROJECT_ID and network connection."
    exit 1
fi