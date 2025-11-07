# Quick Start Guide

Get your RecircleIt launch page up and running in 5 minutes!

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key from **Settings** → **API**

## 3. Run Database Migrations

In Supabase **SQL Editor**, run these migrations in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_fix_waitlist_policy.sql`
3. `supabase/migrations/003_create_admin_helper.sql` (optional, but recommended)

## 4. Enable Realtime

In Supabase dashboard:
- Go to **Database** → **Replication**
- Toggle ON for `waitlist` and `settings` tables

## 5. Create Environment File

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 6. Create Admin User

**Option 1: Using Helper Function (Easiest - if you ran migration 003)**

1. Create a user account:
   - Go to **Authentication** → **Users** in Supabase dashboard
   - Click **Add user** → **Create new user**
   - Enter your email and password
   - Or sign up at `/admin/login` on your site

2. Run this SQL (replace with your email):

```sql
SELECT create_admin('your-email@example.com');
```

**Option 2: Using Email Query**

1. Create a user account (same as above)

2. Run this SQL:

```sql
INSERT INTO admins (id, email)
SELECT id, email
FROM auth.users
WHERE email = 'your-email@example.com';
```

**Option 3: Using UUID**

1. Get your user UUID from **Authentication** → **Users** (copy the UUID)
2. Run this SQL (replace with your actual UUID and email):

```sql
INSERT INTO admins (id, email)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'your-email@example.com');
```

**Note:** The UUID must be a valid UUID format (with dashes). You cannot use plain text like "test123".

## 7. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## Troubleshooting

**Countdown not working?**
- Check that `get_server_time()` function exists (from migration)
- Verify Realtime is enabled for `settings` table

**Waitlist count not updating?**
- Enable Realtime for `waitlist` table
- Check browser console for errors

**Can't login to admin?**
- Verify user exists in `admins` table
- Check RLS policies are applied

## Next Steps

- Customize colors in `tailwind.config.js`
- Update launch date in admin portal
- Deploy to Vercel/Netlify

