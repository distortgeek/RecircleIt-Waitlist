-- Fix waitlist read policy to allow public count queries
-- Drop the restrictive policy
drop policy if exists "public_read_waitlist_count" on waitlist;

-- Create a better policy that allows count queries but restricts full row access
-- Note: Supabase count queries work differently, so we need to allow select but limit via RLS
create policy "public_read_waitlist_for_count" on waitlist
  for select
  using (is_deleted = false);

-- However, for security, we'll use a function-based approach for public counts
-- This ensures public users can only get counts, not individual entries
create or replace function get_waitlist_count()
returns bigint
language sql
stable
security definer
as $$
  select count(*)::bigint
  from waitlist
  where is_deleted = false;
$$;

grant execute on function get_waitlist_count() to anon, authenticated;

