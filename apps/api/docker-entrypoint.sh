#!/bin/sh
set -e
# Coolify / container start: apply Drizzle migrations (same as root `pnpm db:migrate`).
if [ "${SKIP_DB_MIGRATE:-0}" != "1" ]; then
  cd /app
  pnpm exec drizzle-kit migrate
fi
exec "$@"
