# RecircleIt — Launch Page

A ready-to-ship, dark-themed launch/waitlist page for RecircleIt with real-time countdown, Supabase waitlist integration, and a secure admin portal.

## Features

- ⏱️ **Real-time countdown** with server time synchronization (supports negative time)
- 📝 **Waitlist form** with real-time validation and duplicate detection
- 📊 **Live waitlist count** updates via Supabase Realtime
- 🔐 **Secure admin portal** for managing launch date and waitlist entries
- 🎨 **Dark theme** with custom color palette
- ♿ **Accessible** (WCAG AA compliant)
- 📱 **Mobile-first** responsive design
- ⚡ **Performance optimized** with Next.js 14 App Router

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React + TypeScript
- **Styling**: TailwindCSS + Inter & Fira Code fonts
- **Backend**: Supabase (Postgres + Realtime + Auth)
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Supabase project ([create one here](https://supabase.com))

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd launchpage
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Run the migration files in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_fix_waitlist_policy.sql`
4. **Enable Realtime** (required for live updates):
   - Go to **Database** → **Replication** in Supabase dashboard
   - Enable replication for `waitlist` and `settings` tables
   - Or run: `ALTER PUBLICATION supabase_realtime ADD TABLE waitlist, settings;`

### 3. Create Admin User

**Important:** The `admins.id` must be a valid UUID from the `auth.users` table, not a plain string.

**Option 1: Using Email (Easiest)**

1. Create a user account first:
   - Go to **Authentication** → **Users** in Supabase dashboard
   - Click **Add user** → **Create new user**
   - Enter your email and password
   - Or sign up at `/admin/login` on your site

2. Then run this SQL (replace with your email):

```sql
INSERT INTO admins (id, email)
SELECT id, email
FROM auth.users
WHERE email = 'your-email@example.com';
```

**Option 2: Using UUID Directly**

1. Get your user UUID from **Authentication** → **Users** (it looks like: `123e4567-e89b-12d3-a456-426614174000`)
2. Run this SQL (replace with your actual UUID and email):

```sql
INSERT INTO admins (id, email)
VALUES ('123e4567-e89b-12d3-a456-426614174000'::uuid, 'your-email@example.com');
```

**Troubleshooting:**
- ❌ **Wrong:** `VALUES ('test123', 'admin@example.com')` - "test123" is not a valid UUID
- ✅ **Correct:** Use the SELECT query with email, or use a proper UUID format with dashes

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

You can find these values in your Supabase project settings:
- Go to **Settings** → **API**
- Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Copy the **anon/public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy the **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Netlify

1. Push your code to GitHub
2. Import your repository in [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add environment variables in Netlify dashboard
6. Deploy!

### Environment Variables for Production

Make sure to add all environment variables in your hosting platform's dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (only needed for server-side admin operations)

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin portal pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── Countdown.tsx      # Countdown timer
│   │   ├── WaitlistForm.tsx   # Waitlist signup form
│   │   └── WaitlistCount.tsx  # Live waitlist count
│   ├── lib/                   # Utilities
│   │   ├── supabaseClient.ts  # Supabase client
│   │   ├── serverTime.ts      # Server time sync
│   │   └── utils.ts           # Helper functions
│   └── __tests__/             # Tests
├── supabase/
│   └── migrations/            # Database migrations
├── public/                     # Static assets
└── package.json
```

## Admin Portal

Access the admin portal at `/admin` (requires authentication).

**Features:**
- View all waitlist entries
- Search and filter entries
- Export waitlist to CSV
- Update launch date
- Delete entries (soft delete)

**Login:**
- Go to `/admin/login`
- Use email/password or magic link
- Must be added to `admins` table in Supabase

## Database Schema

### Settings Table
- Stores launch date configuration
- Single row with key `'launch'`

### Waitlist Table
- `email` (unique, required)
- `name` (optional)
- `phone` (optional)
- `referral_source` (optional)
- `created_at` (timestamp)
- `is_deleted` (boolean, for soft deletes)

### Admins Table
- Links to `auth.users` via `id`
- Controls admin access

## Row Level Security (RLS)

- **Public**: Can insert into waitlist, read count
- **Admins**: Can read/update settings, read/update waitlist entries

## Testing

```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Customization

### Colors

Edit `tailwind.config.js` to change the color palette:

```js
colors: {
  primary: {
    yellow: '#FFFD8F',
    sage: '#B0CE88',
    forest: '#4C763B',
    'dark-green': '#043915',
  },
}
```

### Launch Date

Update the launch date via:
1. Admin portal (recommended)
2. Direct SQL update in Supabase

```sql
UPDATE settings
SET value = jsonb_build_object('date', '2025-12-01T10:00:00Z')
WHERE key = 'launch';
```

## Troubleshooting

### Countdown not syncing
- Check that `get_server_time()` function exists in Supabase
- Verify Realtime is enabled for `settings` table
- Check browser console for errors

### Waitlist count not updating
- Ensure Realtime is enabled for `waitlist` table
- Check Supabase dashboard → Database → Replication
- Verify RLS policies allow public reads

### Admin login not working / "Access denied" error
- Verify user exists in `admins` table (see troubleshooting below)
- **Important:** Run migration `004_fix_admin_rls.sql` to fix circular RLS policy
- Check that RLS policies allow users to check their own admin status
- Ensure Supabase Auth is properly configured

**Quick Fix:**
```sql
-- Check if you're an admin
SELECT * FROM admins WHERE id = auth.uid();

-- If empty, create admin (replace with your email):
INSERT INTO admins (id, email)
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Fix RLS policy if needed:
DROP POLICY IF EXISTS "admins_read_admins" ON admins;
CREATE POLICY "users_check_own_admin_status" ON admins
  FOR SELECT USING (auth.role() = 'authenticated' AND admins.id = auth.uid());
```

### Build errors
- Make sure all environment variables are set
- Run `npm install` to ensure dependencies are installed
- Check TypeScript errors with `npm run build`

## Performance

- Lighthouse score target: >85
- Optimized images and fonts
- Code splitting with Next.js
- Lazy loading for animations

## Accessibility

- WCAG AA compliant
- Keyboard navigation support
- Screen reader friendly
- Focus indicators
- ARIA labels

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

