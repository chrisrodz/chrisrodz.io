-- Coffee Tracking Database Schema for Supabase
-- Initial migration - sets up all tables and policies

-- Coffee Beans table: stores coffee bean information
create table public.coffee_beans (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  bean_name text not null,
  roaster text null,
  origin text null,
  roast_date date null,
  notes text null,
  is_active boolean null default true,
  constraint coffee_beans_pkey primary key (id)
) tablespace pg_default;

create index if not exists coffee_beans_active_idx on public.coffee_beans using btree (is_active) tablespace pg_default
where
  (is_active = true);

-- Coffee Logs table: stores individual brew logs
create table public.coffee_logs (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  brew_method text not null,
  bean_id uuid null,
  dose_grams numeric(4, 1) not null,
  yield_grams numeric(4, 1) null,
  grind_setting integer not null,
  quality_rating integer not null,
  brew_time timestamp with time zone not null,
  notes text null,
  constraint coffee_logs_pkey primary key (id),
  constraint coffee_logs_bean_id_fkey foreign key (bean_id) references coffee_beans (id) on delete set null,
  constraint coffee_logs_dose_grams_check check (
    (
      (dose_grams > (0)::numeric)
      and (dose_grams <= (100)::numeric)
    )
  ),
  constraint coffee_logs_quality_rating_check check (
    (
      (quality_rating >= 1)
      and (quality_rating <= 5)
    )
  ),
  constraint coffee_logs_yield_grams_check check (
    (
      (yield_grams is null)
      or (
        (yield_grams > (0)::numeric)
        and (yield_grams <= (200)::numeric)
      )
    )
  ),
  constraint coffee_logs_grind_setting_check check (
    (
      (grind_setting >= 1)
      and (grind_setting <= 40)
    )
  ),
  constraint coffee_logs_brew_method_check check (
    (
      brew_method = any (
        array[
          'Espresso'::text,
          'AeroPress'::text,
          'French Press'::text
        ]
      )
    )
  )
) tablespace pg_default;

create index if not exists coffee_logs_brew_time_idx on public.coffee_logs using btree (brew_time desc) tablespace pg_default;

create index if not exists coffee_logs_bean_id_idx on public.coffee_logs using btree (bean_id) tablespace pg_default;

-- Activities table: stores training/Strava activities
create table public.activities (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  strava_id bigint unique,
  name text,
  type text not null,
  start_date timestamp with time zone not null,
  distance numeric(10, 2),
  duration integer,
  elevation_gain numeric(8, 2),
  average_heartrate numeric(5, 1),
  max_heartrate integer,
  constraint activities_pkey primary key (id)
) tablespace pg_default;

create index if not exists activities_start_date_idx on public.activities using btree (start_date desc) tablespace pg_default;

create index if not exists activities_strava_id_idx on public.activities using btree (strava_id) tablespace pg_default;

-- Enable Row Level Security (RLS)
alter table coffee_beans enable row level security;
alter table coffee_logs enable row level security;
alter table activities enable row level security;

-- Create policies for public read access
create policy "Allow public read access to coffee_beans" on coffee_beans
  for select using (true);

create policy "Allow public read access to coffee_logs" on coffee_logs
  for select using (true);

create policy "Allow public read access to activities" on activities
  for select using (true);

-- Note: Write access should be restricted to authenticated users via your application
-- The ADMIN_SECRET in your .env handles write authentication in the app layer
