# Savvari — Lahore carpooling

Next.js 15 app with Supabase (Postgres + Auth): commuter survey, Phase 1 driver/passenger signups, authenticated ride posting & booking, admin ops, manual payments, ratings, and SOS SMS (Twilio).

## Requirements

- **Node.js 20+** (recommended; Supabase client warns on Node 18)
- **npm** (or pnpm/yarn)
- **Supabase** project
- **Twilio** (optional: SMS OTP via Supabase; required for `/api/sos` admin-style alerts)

### Tailwind v4 native binding

If `next build` fails with “Cannot find native binding” for `@tailwindcss/oxide`, install the package for your platform, e.g.:

- macOS ARM64: `npm i -D @tailwindcss/oxide-darwin-arm64`
- Linux x64: `npm i -D @tailwindcss/oxide-linux-x64-gnu`

## Setup

1. Copy [`.env.example`](.env.example) to `.env.local` and fill in values.

2. In **Supabase → SQL Editor**, run migrations in order:

   - [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql)
   - [`supabase/migrations/002_book_ride_and_policies.sql`](supabase/migrations/002_book_ride_and_policies.sql)
   - [`supabase/migrations/003_admin_booking_policy.sql`](supabase/migrations/003_admin_booking_policy.sql)
   - [`supabase/migrations/004_profile_public_driver.sql`](supabase/migrations/004_profile_public_driver.sql)

   If the auth trigger fails on `execute procedure`, try `execute function` depending on your Postgres version.

3. **Phone auth**: In Supabase → Authentication → Providers, enable **Phone** and configure your SMS provider (e.g. Twilio). Use E.164 numbers (`+923...`).

4. **Admin access**: After your first login, set a profile admin flag:

   ```sql
   update public.profiles set is_admin = true where id = '<your-auth-user-uuid>';
   ```

   Or set `ADMIN_USER_IDS` in `.env.local` (comma-separated UUIDs).

5. **Service role**: Admin tables (`driver_signups`, etc.) use `SUPABASE_SERVICE_ROLE_KEY` only on the server — never expose it to the client.

## Scripts

```bash
npm run dev    # development
npm run build  # production build
npm run start  # production server
```

## Routes (overview)

| Path | Purpose |
|------|---------|
| `/` | Landing |
| `/survey` | Embedded commuter survey (`public/survey.html`) |
| `/join/driver`, `/join/passenger` | Phase 1 signups (public) |
| `/login`, `/verify` | Phone OTP |
| `/onboarding` | Profile + vehicle |
| `/dashboard`, `/rides`, `/rides/new`, `/rides/[id]`, `/bookings`, `/profile` | Authenticated app |
| `/admin/*` | Admin: signups, matches, payment confirmation |
| `/api/sos` | POST — SMS emergency contact |

## Deploy (Vercel)

Connect the repo, set env vars from `.env.example`, and deploy. Use **Node 20** in project settings.

## Legacy static survey

The original single-file survey was moved to `public/survey.html` during bootstrap. A copy may also exist under `../savari2026_legacy_backup/` on your machine.
