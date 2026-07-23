# Retired upstream backend

This directory is retained only as upstream migration history. It is excluded
from the npm workspace and every build/deployment path. Do not run it or apply
its Prisma migrations.

All live AI Kids contracts are implemented by StoryMee core services behind
`https://dev-hub.storymee.com`; the only production database source of truth is
`omni_db.public`.
