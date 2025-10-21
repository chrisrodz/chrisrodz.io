# Personal Site - Christian Rodriguez

A modern personal website built with Astro, featuring a blog, coffee tracking, and training logs.

🌐 **Live at**: [chrisrodz.io](https://chrisrodz.io)

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
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Admin (store hashed secret values only)
ADMIN_SECRET_SALT=hex_encoded_salt
ADMIN_SECRET_HASH=hex_encoded_hash

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

#### Generate the admin secret hash

The admin panel now verifies a hash instead of the raw secret. Generate these values offline and add them to `.env.local`:

1. Pick a long, random admin password and keep it private.
2. Generate a random salt (16 bytes shown below):

   ```bash
   node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
   ```

3. Derive the hash using Node's `scrypt` implementation (64-byte output):

   ```bash
   node -e "const crypto = require('crypto'); const [secret, salt] = process.argv.slice(1); const hash = crypto.scryptSync(secret, salt, 64); console.log(hash.toString('hex'));" "your-admin-password" "hex_encoded_salt"
   ```

4. Store only the salt and hash in `.env.local`:

   ```bash
   ADMIN_SECRET_SALT=hex_encoded_salt
   ADMIN_SECRET_HASH=hex_encoded_hash
   ```

The plain-text password should never be committed or stored alongside the environment file.

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
│   ├── auth.ts               # Session-based authentication
│   ├── supabase.ts           # Database client (null-safe)
│   └── validation.ts         # Zod schemas for input validation
└── env.d.ts                  # Type definitions

scripts/
└── new-post.js               # Blog post creation script

Config files:
├── astro.config.mjs          # Astro configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── .env.example              # Environment variables template
```

## ✨ Features

- **📝 Blog**: Write and publish markdown blog posts with frontmatter
- **🏠 Homepage**: Overview with recent coffee entries and training activities
- **☕ Coffee Tracking**: Log your coffee brewing experiments with ratings and notes
- **🏃‍♂️ Training Dashboard**: View your activities (sync with Strava)
- **🔐 Admin Panel**: Secure session-based authentication for content management
- **✅ Input Validation**: Zod schemas for type-safe form validation
- **🛡️ Security**: HttpOnly cookies, CSRF protection, secure session management
- **📱 Responsive**: Beautiful design with Pico CSS
- **🚀 Performance**: Built with Astro for optimal loading speeds
- **♿ Graceful Degradation**: Works without Supabase configured

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

This site is configured for seamless deployment on Vercel with automatic deployments on every push to `main`.

### Initial Deployment

**Via Vercel Dashboard (Recommended):**

1. Push your code to GitHub
2. Visit [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Configure environment variables:
   - `ADMIN_SECRET` - Generate with: `openssl rand -base64 32`
   - Optional: Supabase credentials (if using coffee/training features)
5. Deploy!

**Via Vercel CLI:**

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Custom Domain Setup

1. In Vercel dashboard → Settings → Domains
2. Add both `yourdomain.com` and `www.yourdomain.com`
3. Set apex domain as primary (ensures www redirects to apex)
4. Update DNS at your registrar:
   ```
   Type: A, Host: @, Value: 76.76.21.21
   Type: CNAME, Host: www, Value: cname.vercel-dns.com
   ```
5. Wait for DNS propagation (5-30 minutes)
6. Vercel auto-provisions SSL certificate

### Continuous Deployment

- **Auto-deploy**: Every push to `main` triggers a new deployment
- **Build time**: ~30-60 seconds
- **Preview deploys**: Available for pull requests
- **Rollback**: One-click rollback to previous deployments

## 🔧 Admin Features

Visit `/admin` to access the secure admin panel.

**Authentication:**

- Session-based auth with secure HttpOnly cookies
- 24-hour session expiry
- Password set via `ADMIN_SECRET` environment variable

**Available Features:**

- Add and manage coffee beans and brewing entries
- View setup instructions for Supabase and Strava
- Manage blog posts (coming soon)

## 🌐 API Endpoints

- `GET /api/coffee.json` - Public coffee entries API
  - Returns coffee data with bean information
  - Gracefully handles database not configured (503 status)

## 🔒 Security Features

- **Session Management**: Secure session tokens (not exposing secrets in cookies)
- **Input Validation**: Zod schemas validate all form inputs
- **Type Safety**: Full TypeScript coverage
- **Null Safety**: Graceful handling of missing database connections
- **Cookie Security**: HttpOnly, Secure, SameSite=Lax flags
- **Error Handling**: User-friendly error messages, no stack traces exposed

## 📝 Development Notes

### Environment Setup

The site gracefully degrades when services aren't configured:

- **Without Supabase**: Coffee and training features show setup instructions
- **Without Strava**: Training section shows connection instructions
- **Without Admin Secret**: Admin panel shows setup instructions
- **Blog**: Works completely standalone, no external dependencies

### Styling

The site uses [Pico CSS](https://picocss.com/) for beautiful, semantic styling with minimal custom CSS.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `yarn dev`
5. Submit a pull request

## 📚 Tech Stack

- **Framework**: [Astro](https://astro.build) v5.14+
- **Language**: TypeScript
- **Styling**: [Pico CSS](https://picocss.com/)
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **Deployment**: [Vercel](https://vercel.com) (Node.js 20+)
- **Validation**: [Zod](https://zod.dev)
- **Authentication**: Custom session-based with [nanoid](https://github.com/ai/nanoid)
- **Content**: Markdown with frontmatter (Astro Content Collections)

## 📖 Resources

- [Astro Documentation](https://docs.astro.build)
- [Supabase Documentation](https://supabase.com/docs)
- [Pico CSS Documentation](https://picocss.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
