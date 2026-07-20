#!/bin/sh
set -e
cd /app/apps/api
# DATABASE_URL must point at Supabase (or any Postgres). No embedded local DB.
echo "Prisma db push (Supabase/Postgres)..."
npx prisma db push --skip-generate

case "${SEED_ON_START:-never}" in
  force)
    echo "Forced seed..."
    SEED_FORCE=true npx tsx prisma/seed.ts
    ;;
  auto|true|1)
    echo "Seed auto..."
    npx tsx prisma/seed.ts
    ;;
  *)
    echo "Skipping seed (SEED_ON_START=${SEED_ON_START:-never})"
    ;;
esac

echo "Starting API..."
exec npx tsx src/index.ts
