# Supabase Setup Instructions

## Running Migrations

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the migration files in order:
   - `001_initial_schema.sql` - Creates tables, RLS policies, and functions
   - `002_fix_waitlist_policy.sql` - Fixes waitlist read policy for public count queries

## Enabling Realtime

For the real-time countdown and waitlist count updates to work, you need to enable Realtime replication:

1. Go to **Database** → **Replication** in your Supabase dashboard
2. Enable replication for the following tables:
   - `waitlist` - For real-time waitlist count updates
   - `settings` - For real-time launch date updates

Alternatively, you can enable it via SQL:

```sql
-- Enable Realtime for waitlist
alter publication supabase_realtime add table waitlist;

-- Enable Realtime for settings
alter publication supabase_realtime add table settings;
```

## Creating Your First Admin User

**Important:** The `admins.id` column requires a valid UUID from `auth.users`, not a plain string.

### Method 1: Using the Helper Function (Easiest)

After running all migrations (including `003_create_admin_helper.sql`):

1. Create a user in **Authentication** → **Users** (or sign up via `/admin/login`)
2. Run this SQL (replace with your email):

```sql
SELECT create_admin('your-email@example.com');
```

### Method 2: Using Email Query

1. Create a user in **Authentication** → **Users**
2. Run this SQL:

```sql
INSERT INTO admins (id, email)
SELECT id, email
FROM auth.users
WHERE email = 'your-email@example.com';
```

### Method 3: Using UUID Directly

1. Get the user's UUID from **Authentication** → **Users** (format: `123e4567-e89b-12d3-a456-426614174000`)
2. Run this SQL:

```sql
INSERT INTO admins (id, email)
VALUES ('123e4567-e89b-12d3-a456-426614174000'::uuid, 'your-email@example.com');
```

**Common Error:**
- ❌ `ERROR: invalid input syntax for type uuid: "test123"` 
- This happens when you use a plain string instead of a UUID
- ✅ Solution: Use one of the methods above that gets the UUID from `auth.users`

## Fixing "Access Denied" Error

If you get "Access denied. Admin privileges required" after creating an admin user, you may need to fix the RLS policy. The original policy has a circular dependency.

Run migration `004_fix_admin_rls.sql` or manually:

```sql
DROP POLICY IF EXISTS "admins_read_admins" ON admins;

CREATE POLICY "users_check_own_admin_status" ON admins
  FOR SELECT
  USING (
    auth.role() = 'authenticated' 
    AND admins.id = auth.uid()
  );
```

This allows users to check their own admin status without requiring admin access first.

## Verifying Setup

Run these queries to verify everything is set up correctly:

```sql
-- Check settings table
SELECT * FROM settings WHERE key = 'launch';

-- Check waitlist table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'waitlist';

-- Check admins table
SELECT * FROM admins;

-- Check RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

