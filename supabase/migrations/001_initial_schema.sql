-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Settings table (single row for launch date)
create table if not exists settings (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Insert initial launch date
insert into settings (key, value) 
values ('launch', jsonb_build_object('date', '2025-12-01T10:00:00Z'))
on conflict (key) do nothing;

-- Waitlist table
create table if not exists waitlist (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  name text,
  phone text,
  referral_source text,
  created_at timestamptz default now(),
  is_deleted boolean default false
);

-- Create index for faster queries
create index if not exists idx_waitlist_email on waitlist(email);
create index if not exists idx_waitlist_created_at on waitlist(created_at);
create index if not exists idx_waitlist_is_deleted on waitlist(is_deleted);

-- Admins table
create table if not exists admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table settings enable row level security;
alter table waitlist enable row level security;
alter table admins enable row level security;

-- RLS Policies for settings
-- Allow public to read launch date
create policy "public_read_settings" on settings
  for select
  using (true);

-- Only admins can update settings
create policy "admins_update_settings" on settings
  for update
  using (
    auth.role() = 'authenticated' 
    and exists (
      select 1 from admins 
      where admins.id = auth.uid()
    )
  );

-- RLS Policies for waitlist
-- Allow public to insert into waitlist
create policy "public_insert_waitlist" on waitlist
  for insert
  with check (true);

-- Allow public to read count (limited columns)
create policy "public_read_waitlist_count" on waitlist
  for select
  using (
    is_deleted = false
    and (
      -- Only return count, not full rows for public
      false
    )
  );

-- Allow admins to read all waitlist entries
create policy "admins_read_waitlist" on waitlist
  for select
  using (
    auth.role() = 'authenticated' 
    and exists (
      select 1 from admins 
      where admins.id = auth.uid()
    )
  );

-- Allow admins to update waitlist (for soft delete)
create policy "admins_update_waitlist" on waitlist
  for update
  using (
    auth.role() = 'authenticated' 
    and exists (
      select 1 from admins 
      where admins.id = auth.uid()
    )
  );

-- RLS Policies for admins
-- Only admins can read admins table
create policy "admins_read_admins" on admins
  for select
  using (
    auth.role() = 'authenticated' 
    and exists (
      select 1 from admins 
      where admins.id = auth.uid()
    )
  );

-- Function to get server time (for countdown sync)
create or replace function get_server_time()
returns timestamptz
language sql
stable
as $$
  select now();
$$;

-- Grant execute permission to authenticated and anon users
grant execute on function get_server_time() to anon, authenticated;

-- Enable Realtime for waitlist table
alter publication supabase_realtime add table waitlist;
alter publication supabase_realtime add table settings;

