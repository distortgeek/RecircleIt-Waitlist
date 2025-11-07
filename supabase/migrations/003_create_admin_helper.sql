-- Helper function to create an admin user by email
-- Usage: SELECT create_admin('your-email@example.com');
-- This will automatically find the user in auth.users and add them to admins table

create or replace function create_admin(user_email text)
returns void
language plpgsql
security definer
as $$
declare
  user_id uuid;
begin
  -- Find the user by email
  select id into user_id
  from auth.users
  where email = user_email;
  
  -- Check if user exists
  if user_id is null then
    raise exception 'User with email % does not exist. Please create the user first in Authentication → Users', user_email;
  end if;
  
  -- Check if already an admin
  if exists (select 1 from admins where id = user_id) then
    raise notice 'User % is already an admin', user_email;
    return;
  end if;
  
  -- Insert into admins table
  insert into admins (id, email)
  values (user_id, user_email);
  
  raise notice 'Successfully created admin for %', user_email;
end;
$$;

-- Grant execute permission to authenticated users (or you can restrict this further)
-- For security, you might want to only allow service role to execute this
grant execute on function create_admin(text) to authenticated;

-- Example usage:
-- SELECT create_admin('your-email@example.com');

