#!/bin/sh
set -e

# DATABASE_URL is DERIVED here, never read from the environment file, so that a
# local development value (e.g. 127.0.0.1:5434) cannot leak into the container.
# The host is forced to `postgres`, the compose service name.
#
# To point the API at an EXTERNAL database instead, unset POSTGRES_USER /
# POSTGRES_PASSWORD / POSTGRES_DB and supply DATABASE_URL directly.
if [ -n "$POSTGRES_USER" ] && [ -n "$POSTGRES_PASSWORD" ] && [ -n "$POSTGRES_DB" ]; then
  export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public"
fi

echo "Running database migrations..."
npx prisma migrate deploy

# Idempotent: creates the admin if missing, and re-syncs the password from
# ADMIN_SEED_PASSWORD if it has changed. Exits 1 when that variable is unset,
# which deliberately fails the deploy rather than starting without an admin.
echo "Seeding admin user..."
node prisma/seed.js

echo "Starting CareOne API..."
exec node src/server.js
