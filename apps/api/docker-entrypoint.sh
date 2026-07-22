#!/bin/sh
set -e
cd /app/apps/api

# Run migrations once as a deployment job, never concurrently in every API replica.
if [ "${PROCESS_ROLE:-api}" = "migrate" ]; then
  echo "Applying database migrations..."
  exec npx prisma migrate deploy
fi

if [ "${PROCESS_ROLE:-api}" = "push-worker" ]; then
  echo "Starting push worker..."
  exec npx tsx src/workers/push.worker.ts
fi

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
