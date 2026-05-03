#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
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
  echo "DATABASE_URL not set. Add it to .env.local (see .env.example)." >&2
  exit 1
fi

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'EOF'
CREATE TABLE IF NOT EXISTS public.app_schema_migrations (
  filename text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
EOF

migrate_one() {
  local f bn already
  f=$1
  bn=$(basename "$f")
  # shellcheck disable=SC2016
  already=$(psql "$DATABASE_URL" -tAc "SELECT count(*) FROM public.app_schema_migrations WHERE filename = '$bn'" | tr -d '[:space:]')
  if [[ "$already" == "1" ]]; then
    echo "Skipping $f (already applied)"
    return 0
  fi
  if [[ "$already" != "0" ]]; then
    echo "Unexpected migration registry count for $bn: $already" >&2
    exit 1
  fi
  echo "Applying $bn ..."
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "INSERT INTO public.app_schema_migrations (filename) VALUES ('$bn')"
}

shopt -s nullglob || true
matches=(supabase/migrations/*.sql)
if [[ ${#matches[@]} -eq 0 ]]; then
  echo "No files in supabase/migrations/*.sql" >&2
  exit 1
fi

sorted=$(mktemp)
trap 'rm -f "$sorted"' EXIT
printf '%s\n' "${matches[@]}" | LC_ALL=C sort >"$sorted"

while IFS= read -r f; do
  migrate_one "$f"
done <"$sorted"

echo "Done."
