# Troubleshooting Guide

## "Access denied. Admin privileges required."

This error occurs when trying to access the admin portal. Here's how to fix it:

### Step 1: Verify You Have an Admin User

Run this query in Supabase SQL Editor to check if your user is in the admins table:

```sql
-- Replace with your email
SELECT au.id, au.email, a.id as admin_id
FROM auth.users au
LEFT JOIN admins a ON a.id = au.id
WHERE au.email = 'your-email@example.com';
```

If `admin_id` is NULL, you need to create an admin user (see Step 2).

### Step 2: Create Admin User

If you don't have an admin user, create one:

```sql
-- Method 1: Using email (recommended)
INSERT INTO admins (id, email)
SELECT id, email
FROM auth.users
WHERE email = 'your-email@example.com';

-- Method 2: Using helper function (if migration 003 was run)
SELECT create_admin('your-email@example.com');
```

### Step 3: Fix RLS Policy (If Still Not Working)

If you still get "Access denied" after creating an admin user, the RLS policy might be blocking the check. Run this migration:

```sql
-- Run migration 004_fix_admin_rls.sql
-- Or manually run:

DROP POLICY IF EXISTS "admins_read_admins" ON admins;

CREATE POLICY "users_check_own_admin_status" ON admins
  FOR SELECT
  USING (
    auth.role() = 'authenticated' 
    AND admins.id = auth.uid()
  );
```

### Step 4: Verify Login

1. Make sure you're logged in at `/admin/login`
2. Check browser console for any errors
3. Try logging out and logging back in

### Common Issues

**Issue:** "User doesn't exist in auth.users"
- **Solution:** Create the user first in **Authentication** → **Users** before adding to admins table

**Issue:** "Invalid UUID format"
- **Solution:** Use the SELECT query method instead of manually entering UUIDs

**Issue:** "RLS policy violation"
- **Solution:** Run migration `004_fix_admin_rls.sql` to fix the circular dependency

## "Missing Supabase environment variables"

Make sure you have a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Countdown Not Working

1. Check that `get_server_time()` function exists:
   ```sql
   SELECT get_server_time();
   ```

2. Verify Realtime is enabled for `settings` table:
   - Go to **Database** → **Replication**
   - Ensure `settings` table is enabled

3. Check browser console for errors

## Waitlist Count Not Updating

1. Enable Realtime for `waitlist` table:
   - Go to **Database** → **Replication**
   - Toggle ON for `waitlist` table

2. Verify RLS policies allow public reads:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'waitlist';
   ```

3. Check that `get_waitlist_count()` function exists (from migration 002)

## Still Having Issues?

1. Check Supabase logs: **Logs** → **Postgres Logs**
2. Check browser console for client-side errors
3. Verify all migrations have been run in order
4. Make sure environment variables are set correctly

