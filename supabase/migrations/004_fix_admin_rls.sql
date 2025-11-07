-- Fix RLS policy for admins table
-- The original policy was circular: it required admin access to check admin status
-- This migration fixes that by allowing users to check their own admin status

-- Drop the existing restrictive policy
drop policy if exists "admins_read_admins" on admins;

-- Create a new policy that allows authenticated users to check if they themselves are admins
-- This is safe because users can only see their own row (where id = auth.uid())
-- This breaks the circular dependency
create policy "users_check_own_admin_status" on admins
  for select
  using (
    auth.role() = 'authenticated' 
    and admins.id = auth.uid()
  );

-- Optional: Allow admins to see all admins (for admin management)
-- This uses a function to avoid circular dependency
create or replace function is_admin(user_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from admins where id = user_id
  );
$$;

grant execute on function is_admin(uuid) to authenticated;

-- Policy for admins to read all admins (using the function)
create policy "admins_read_all_admins" on admins
  for select
  using (
    auth.role() = 'authenticated' 
    and is_admin(auth.uid())
  );

