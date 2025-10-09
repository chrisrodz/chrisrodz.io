# Personal Site - Chris Rodriguez

A modern personal website built with Astro, featuring coffee tracking, training logs, and a blog.

## 🚀 Quick Start

The project is now fully bootstrapped! Follow these steps to get started:

### 1. Install dependencies
```bash
yarn install
```

### 2. Copy environment variables
```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual values:

```bash
# Supabase (required for coffee and training features)
PUBLIC_SUPABASE_URL=your_project_url
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Admin (generate a random string for authentication)
ADMIN_SECRET=your_secure_random_string

# Strava (optional, for training sync)
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
STRAVA_REFRESH_TOKEN=your_strava_refresh_token
```

### 3. Start development
```bash
yarn dev
```

Visit http://localhost:4321 to see your site!

### 4. Set up Supabase (optional but recommended)

The site works without Supabase, but you'll need it for coffee tracking and training data:

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key to `.env.local`
3. Run this SQL in the Supabase SQL editor:
```sql
-- Enable UUID extension
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

-- Admin write access (update this with your user ID after authentication)
-- CREATE POLICY "Admin can manage coffees" ON coffees FOR ALL USING (auth.uid() = 'YOUR_USER_ID');
```

## 📁 Project Structure
## 📁 Project Structure

```
src/
├── pages/
│   ├── index.astro           # Homepage
│   ├── blog/
│   │   ├── index.astro       # Blog listing
│   │   └── [slug].astro      # Blog posts
│   ├── coffee.astro          # Public coffee tracker
│   ├── training.astro        # Training dashboard
│   ├── admin/
│   │   ├── index.astro       # Admin dashboard (protected)
│   │   └── coffee.astro      # Coffee entry form
│   └── api/
│       └── coffee.json.ts    # Public API
├── content/
│   ├── config.ts             # Content collections config
│   └── blog/                 # Markdown blog posts
│       └── welcome.md        # Sample blog post
├── layouts/
│   └── Layout.astro          # Main layout with Pico CSS
├── lib/
│   └── supabase.ts           # Database client
└── env.d.ts                  # Type definitions

scripts/
└── new-post.js               # Blog post creation script

Config files:
├── astro.config.mjs          # Astro configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.mjs       # Tailwind CSS configuration
└── .env.example              # Environment variables template
```

## ✨ Features

- **🏠 Homepage**: Overview with recent coffee entries and training activities
- **☕ Coffee Tracking**: Log your coffee brewing experiments with ratings and notes
- **🏃‍♂️ Training Dashboard**: View your activities (sync with Strava)
- **📝 Blog**: Write and publish markdown blog posts
- **🔐 Admin Panel**: Protected admin interface for content management
- **📱 Responsive**: Beautiful design with Pico CSS
- **🚀 Performance**: Built with Astro for optimal loading speeds

## 🛠️ Available Scripts

```json
{
  "scripts": {
    "dev": "astro dev",                    # Start development server
    "build": "astro check && astro build", # Build for production
    "preview": "astro preview",            # Preview production build
    "new-post": "node scripts/new-post.js" # Create new blog post
  }
}
```

### Creating a new blog post

```bash
yarn new-post "My Awesome Blog Post"
```

This creates a new markdown file in `src/content/blog/` with the proper frontmatter.

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add your environment variables
4. Deploy!

Or use the Vercel CLI:

```bash
yarn global add vercel
vercel --prod
```

### Connect your domain

1. In Vercel dashboard → Settings → Domains
2. Add your domain (e.g., chrisrodz.io)
3. Update DNS settings at your registrar

## 🔧 Admin Features

Visit `/admin` to access the admin panel. You'll need to set the `ADMIN_SECRET` environment variable.

Features include:
- Add coffee beans and brewing entries
- View setup instructions for Supabase and Strava
- Manage blog posts (coming soon)

## 🌐 API Endpoints

- `GET /api/coffee.json` - Public coffee entries API

## 📝 Development Notes

### Environment Setup

The site gracefully handles missing environment variables:
- Without Supabase: Coffee and training features show setup instructions
- Without Strava: Training section shows connection instructions
- Without admin secret: Admin panel requires password setup

### Styling

The site uses [Pico CSS](https://picocss.com/) for beautiful, semantic styling with minimal custom CSS.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `yarn dev`
5. Submit a pull request

## 📚 Tech Stack

- **Framework**: [Astro](https://astro.build) v4
- **Language**: TypeScript
- **Styling**: [Pico CSS](https://picocss.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.com)
- **Deployment**: [Vercel](https://vercel.com)
- **Content**: Markdown with frontmatter

## 📖 Resources

- [Astro Documentation](https://docs.astro.build)
- [Supabase Documentation](https://supabase.com/docs)
- [Pico CSS Documentation](https://picocss.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
