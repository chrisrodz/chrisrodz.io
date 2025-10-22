-- Session Management Table for Admin Authentication
-- Migration adds persistent session storage with security best practices

-- Sessions table: stores authenticated admin sessions
create table public.sessions (
  id text not null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  expires_at timestamp with time zone not null,
  authenticated boolean not null default false,
  csrf_token text null,
  ip_address text null,
  user_agent text null,
  last_activity timestamp with time zone not null default timezone('utc'::text, now()),
  constraint sessions_pkey primary key (id),
  constraint sessions_id_length_check check (char_length(id) = 32)
) tablespace pg_default;

-- Index for efficient expiry lookups and cleanup
create index if not exists sessions_expires_at_idx on public.sessions
  using btree (expires_at) tablespace pg_default;

-- Index for efficient session validation
create index if not exists sessions_authenticated_idx on public.sessions
  using btree (authenticated) tablespace pg_default
where (authenticated = true);

-- Enable Row Level Security
alter table sessions enable row level security;

-- No public access - sessions are managed only via service key in application code
-- This ensures sessions can only be read/written by the application backend

-- Function to clean up expired sessions
create or replace function public.cleanup_expired_sessions()
returns void
language plpgsql
security definer
as $$
begin
  delete from public.sessions
  where expires_at < timezone('utc'::text, now());
end;
$$;

-- Grant execute permission to authenticated and service roles
grant execute on function public.cleanup_expired_sessions() to authenticated, service_role;

-- Optional: Create a scheduled job to automatically clean up expired sessions
-- Note: This requires pg_cron extension (available in Supabase)
-- Uncomment the following if you want automatic cleanup every hour:
--
-- select cron.schedule(
--   'cleanup-expired-sessions',
--   '0 * * * *', -- Run every hour at minute 0
--   $$select public.cleanup_expired_sessions()$$
-- );

-- Comment explaining session security model
comment on table public.sessions is 'Stores admin authentication sessions. Access restricted to service role only. Sessions expire after 24 hours and include CSRF tokens for additional security.';
