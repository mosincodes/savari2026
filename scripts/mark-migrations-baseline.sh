#!/usr/bin/env bash
# One-time: record migrations already applied before scripts/migrate.sh tracked them.
# migrate.sh uses public.app_schema_migrations and skips files listed there — it will not
# re-run 001 on a populated DB unless you bootstrap this table first.
#
# Do NOT run on an empty database — use npm run db:migrate alone on a fresh DB.
#
# If your DB already matches 001–004 (tables exist), run this once, then:
#   npm run db:migrate
# …to apply only 005, 006, …
#
# If you applied additional SQL manually, add matching rows before migrate, e.g.:
#   INSERT INTO public.app_schema_migrations (filename) VALUES ('006_profiles_admin_rls_no_recursion.sql')
#
# Usage: CONFIRM=1 DATABASE_URL='...' ./scripts/mark-migrations-baseline.sh
# Or with .env.local: CONFIRM=1 ./scripts/mark-migrations-baseline.sh

set -euo pipefail
cd "$(dirname "$0")/.."

if [[ "${CONFIRM:-}" != "1" ]]; then
  echo "Refusing to run without CONFIRM=1." >&2
  echo "Only use this if the DB already has schema from migrations 001–004 (or equivalent)." >&2
  exit 1
fi

if [[ -f .env.local ]]; then
  set -a
  # shellcheck source=/dev/null
  source .env.local
  set +a
elif [[ -f .env ]]; then
  set -a
  # shellcheck source=/dev/null
  source .env
  set +a
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL not set." >&2
  exit 1
fi

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'EOF'
CREATE TABLE IF NOT EXISTS public.app_schema_migrations (
  filename text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.app_schema_migrations (filename) VALUES
  ('001_initial_schema.sql'),
  ('002_book_ride_and_policies.sql'),
  ('003_admin_booking_policy.sql'),
  ('004_profile_public_driver.sql')
ON CONFLICT (filename) DO NOTHING;
EOF

echo "Baseline recorded for 001–004. Next: npm run db:migrate (applies pending migrations only)."
