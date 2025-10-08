# Personal Site - Chris Rodriguez

🚀 Quick Start for Claude Code
bash# 1. Clone this repository
git clone <https://github.com/[your-username]/[repo-name].git>
cd [repo-name]

# 2. Install dependencies

yarn create astro@latest . -- --template minimal --typescript --tailwind --no-install
yarn install @supabase/supabase-js @astrojs/vercel @picocss/pico

# 3. Copy environment variables

cp .env.example .env.local

# 4. Start development

yarn run dev
📁 Project Structure
src/
├── pages/
│ ├── index.astro # Homepage
│ ├── blog/
│ │ └── [slug].astro # Blog posts
│ ├── coffee.astro # Public coffee tracker
│ ├── training.astro # Training dashboard
│ ├── admin/
│ │ ├── index.astro # Admin dashboard (protected)
│ │ └── coffee.astro # Coffee entry form
│ └── api/
│ ├── coffee.json.ts # Public API
│ └── admin/
│ └── coffee.json.ts # Protected API
├── content/
│ └── blog/ # Markdown blog posts
├── layouts/
│ └── Layout.astro # Main layout
├── lib/
│ └── supabase.ts # Database client
└── env.d.ts # Type definitions
🔧 Initial Setup Tasks

1. Create Astro Configuration
   Create astro.config.mjs:
   javascriptimport { defineConfig } from 'astro/config';
   import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
output: 'hybrid',
adapter: vercel(),
prefetch: true
}); 2. Set Up Supabase

Go to supabase.com and create a new project
Save your project URL and anon key
Run this SQL in the Supabase SQL editor:

sql-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Beans table
CREATE TABLE beans (
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
name TEXT NOT NULL,
roaster TEXT,
origin TEXT,
process TEXT,
variety TEXT,
roast_date DATE,
purchase_date DATE,
price DECIMAL(10,2),
notes TEXT,
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Coffees table
CREATE TABLE coffees (
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
bean_id UUID REFERENCES beans(id),
brew_date DATE DEFAULT CURRENT_DATE,
brew_time TIME DEFAULT CURRENT_TIME,
brew_method TEXT,
grind_setting INTEGER,
water_temp INTEGER,
coffee_grams DECIMAL(5,1),
water_grams DECIMAL(6,1),
brew_duration TEXT,
rating INTEGER CHECK (rating >= 1 AND rating <= 10),
notes TEXT,
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Training activities table (for Strava integration)
CREATE TABLE activities (
id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
strava_id BIGINT UNIQUE,
type TEXT,
name TEXT,
distance DECIMAL(10,2),
duration INTEGER,
elevation_gain DECIMAL(8,2),
start_date TIMESTAMP WITH TIME ZONE,
average_heartrate INTEGER,
average_watts INTEGER,
training_stress_score INTEGER,
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create indexes
CREATE INDEX idx_coffees_brew_date ON coffees(brew_date DESC);
CREATE INDEX idx_activities_start_date ON activities(start_date DESC);

-- Row Level Security
ALTER TABLE beans ENABLE ROW LEVEL SECURITY;
ALTER TABLE coffees ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can read coffees" ON coffees FOR SELECT USING (true);
CREATE POLICY "Public can read beans" ON beans FOR SELECT USING (true);
CREATE POLICY "Public can read activities" ON activities FOR SELECT USING (true);

-- Admin write access (you'll update this with your user ID)
-- CREATE POLICY "Admin can manage coffees" ON coffees FOR ALL USING (auth.uid() = 'YOUR_USER_ID'); 3. Create Environment Variables
Create .env.example:
bash# Supabase
PUBLIC_SUPABASE_URL=your_project_url
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Admin (generate a random string)

ADMIN_SECRET=generate_random_string_here

# Strava (optional)

STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
STRAVA_REFRESH_TOKEN= 4. Create Base Layout
Create src/layouts/Layout.astro:
astro---
export interface Props {
title: string;
}

## const { title } = Astro.props

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Chris Rodriguez - Software Engineer, Triathlete, Dad">
  <title>{title} | Chris Rodriguez</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/yarn/@picocss/pico@2/css/pico.min.css">
  <style>
    /* Custom theme colors */
    :root {
      --pico-font-family: system-ui, -apple-system, sans-serif;
    }

    nav ul li strong {
      font-size: 1.2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin: 2rem 0;
    }

  </style>
</head>
<body>
  <nav class="container">
    <ul>
      <li><strong>Chris Rodriguez</strong></li>
    </ul>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/blog">Blog</a></li>
      <li><a href="/coffee">Coffee</a></li>
      <li><a href="/training">Training</a></li>
    </ul>
  </nav>
  
  <main class="container">
    <slot />
  </main>
  
  <footer class="container">
    <small>
      © {new Date().getFullYear()} Chris Rodriguez •
      <a href="/admin">Admin</a>
    </small>
  </footer>
</body>
</html>
5. Create Supabase Client
Create src/lib/supabase.ts:
typescriptimport { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations
export function getServiceSupabase() {
const serviceKey = import.meta.env.SUPABASE_SERVICE_KEY;
if (!serviceKey) {
throw new Error('Missing Supabase service key');
}
return createClient(supabaseUrl, serviceKey);
} 6. Create Homepage
Create src/pages/index.astro:
astro---
import Layout from '../layouts/Layout.astro';
import { supabase } from '../lib/supabase';

// Fetch recent data
const { data: recentCoffees } = await supabase
.from('coffees')
.select('\*, beans(name, roaster)')
.order('brew_date', { ascending: false })
.limit(3);

const { data: recentActivities } = await supabase
.from('activities')
.select('\*')
.order('start_date', { ascending: false })
.limit(3)

---

<Layout title="Home">
  <header>
    <h1>Chris Rodriguez</h1>
    <p>Software Engineer • Triathlete • Dad</p>
  </header>
  
  <section>
    <h2>Recent Coffee</h2>
    {recentCoffees && recentCoffees.length > 0 ? (
      <div class="stats-grid">
        {recentCoffees.map(coffee => (
          <article>
            <header>{coffee.beans?.name || 'Unknown'}</header>
            <p>Rating: {coffee.rating}/10</p>
            <p><small>{new Date(coffee.brew_date).toLocaleDateString()}</small></p>
          </article>
        ))}
      </div>
    ) : (
      <p>No coffees logged yet.</p>
    )}
    <a href="/coffee" role="button">View Coffee Log →</a>
  </section>
  
  <section>
    <h2>Recent Training</h2>
    {recentActivities && recentActivities.length > 0 ? (
      <div class="stats-grid">
        {recentActivities.map(activity => (
          <article>
            <header>{activity.type}</header>
            <p>{(activity.distance / 1000).toFixed(1)} km</p>
            <p><small>{new Date(activity.start_date).toLocaleDateString()}</small></p>
          </article>
        ))}
      </div>
    ) : (
      <p>No activities synced yet.</p>
    )}
    <a href="/training" role="button">View Training Log →</a>
  </section>
</Layout>
🔐 Admin Setup
Create src/pages/admin/index.astro:
astro---
// Simple auth check
const authHeader = Astro.request.headers.get('authorization');
const isAuthed = authHeader === import.meta.env.ADMIN_SECRET;

if (!isAuthed && Astro.request.method === 'GET') {
// Show login form
}

## import Layout from '../../layouts/Layout.astro'

<Layout title="Admin">
  {!isAuthed ? (
    <form method="POST">
      <input type="password" name="password" placeholder="Admin password" required>
      <button type="submit">Login</button>
    </form>
  ) : (
    <div>
      <h1>Admin Dashboard</h1>
      <!-- Admin content here -->
    </div>
  )}
</Layout>
🚀 Deployment
Deploy to Vercel

Push your code to GitHub
Import project in Vercel
Add environment variables
Deploy!

yarn install -g vercel
vercel --prod
Connect Domain

In Vercel dashboard → Settings → Domains
Add chrisrodz.io
Update DNS settings at your registrar

📝 Development with Claude Code
Codespaces Setup
Create .devcontainer/devcontainer.json:
json{
"name": "Personal Site",
"image": "mcr.microsoft.com/devcontainers/javascript-node:20",
"features": {
"ghcr.io/devcontainers/features/github-cli:1": {}
},
"forwardPorts": [4321],
"postCreateCommand": "yarn install",
"postStartCommand": "yarn run dev",
"secrets": {
"PUBLIC_SUPABASE_URL": {},
"PUBLIC_SUPABASE_ANON_KEY": {},
"SUPABASE_SERVICE_KEY": {},
"ADMIN_SECRET": {}
}
}
Available Scripts
json{
"scripts": {
"dev": "astro dev",
"build": "astro build",
"preview": "astro preview",
"new-post": "node scripts/new-post.js"
}
}
🎯 Next Steps for Claude Code

Set up the base structure - Create all files listed above
Configure Supabase - Add connection and create tables
Build coffee tracker - Create entry form and display
Add Strava integration - OAuth flow and data sync
Create blog system - Markdown processing and display
Style improvements - Customize Pico CSS theme
Add dad metrics - Fun tracking features

🤝 Contributing with Claude Code
When working with Claude Code:

Always test in Codespaces first
Use the dev database for experiments
Commit frequently with clear messages
Keep API keys in GitHub Secrets

📚 Resources

Astro Documentation
Supabase Documentation
Pico CSS Documentation
Vercel Documentation
