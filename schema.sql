-- Coffee Tracking Database Schema for Supabase
-- Run this in your Supabase SQL Editor to set up the coffee tracking feature

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Beans table: stores coffee bean information
CREATE TABLE IF NOT EXISTS beans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  roaster TEXT,
  origin TEXT,
  roast_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coffees table: stores individual brew logs
CREATE TABLE IF NOT EXISTS coffees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bean_id UUID NOT NULL REFERENCES beans(id) ON DELETE CASCADE,
  brew_date DATE NOT NULL,
  brew_method TEXT,
  coffee_grams NUMERIC(6,2),
  water_grams NUMERIC(6,2),
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities table: stores training/Strava activities
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strava_id BIGINT UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  distance NUMERIC(10,2),
  moving_time INTEGER,
  elapsed_time INTEGER,
  total_elevation_gain NUMERIC(10,2),
  start_date TIMESTAMPTZ NOT NULL,
  average_speed NUMERIC(6,2),
  max_speed NUMERIC(6,2),
  average_heartrate NUMERIC(5,1),
  max_heartrate NUMERIC(5,1),
  kudos_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_coffees_brew_date ON coffees(brew_date DESC);
CREATE INDEX IF NOT EXISTS idx_coffees_bean_id ON coffees(bean_id);
CREATE INDEX IF NOT EXISTS idx_activities_start_date ON activities(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_strava_id ON activities(strava_id);

-- Enable Row Level Security (RLS)
ALTER TABLE beans ENABLE ROW LEVEL SECURITY;
ALTER TABLE coffees ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to beans" ON beans
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to coffees" ON coffees
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to activities" ON activities
  FOR SELECT USING (true);

-- Note: Write access should be restricted to authenticated users via your application
-- The ADMIN_SECRET in your .env handles write authentication in the app layer

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_beans_updated_at BEFORE UPDATE ON beans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coffees_updated_at BEFORE UPDATE ON coffees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
