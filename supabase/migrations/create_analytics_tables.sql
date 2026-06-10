-- Create page_views table for tracking individual page visits
create table if not exists page_views (
  id bigint primary key generated always as identity,
  session_id text not null,
  page_path text not null,
  page_title text,
  device_type text,  -- 'mobile', 'desktop', 'tablet', or null
  referrer text,     -- HTTP referrer header
  user_agent text,   -- Browser user agent (optional)
  user_id uuid,      -- Foreign key to auth.users (nullable for anonymous visitors)
  created_at timestamptz default now()
);

-- Create indexes for fast queries
create index if not exists idx_page_views_session on page_views(session_id);
create index if not exists idx_page_views_path on page_views(page_path);
create index if not exists idx_page_views_created on page_views(created_at);
create index if not exists idx_page_views_device on page_views(device_type);

-- Create sessions table for aggregated session analytics
create table if not exists sessions (
  session_id text primary key,
  user_id uuid,      -- Foreign key to auth.users (nullable for anonymous)
  first_page_path text,
  first_referrer text,
  device_type text,
  first_page_at timestamptz default now(),
  last_page_at timestamptz default now(),
  page_count int default 1,
  is_bounce boolean default null  -- true if page_count == 1 after 30 min idle
);

-- Create indexes for session queries
create index if not exists idx_sessions_created on sessions(first_page_at);
create index if not exists idx_sessions_device on sessions(device_type);
create index if not exists idx_sessions_user on sessions(user_id);

-- Add RLS policies for public read access to analytics (optional)
-- This allows the admin API to read analytics data
alter table page_views enable row level security;
alter table sessions enable row level security;

-- Allow service role (backend) to read/insert analytics
create policy "service_can_read_page_views" on page_views
  for select using (true);

create policy "service_can_insert_page_views" on page_views
  for insert with check (true);

create policy "service_can_read_sessions" on sessions
  for select using (true);

create policy "service_can_insert_sessions" on sessions
  for insert with check (true);

create policy "service_can_update_sessions" on sessions
  for update using (true);
