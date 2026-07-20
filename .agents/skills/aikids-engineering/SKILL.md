---
name: aikids-engineering
description: >-
  Engineering workflow for AI Kids monorepo: TDD seams, modular Fastify,
  Prisma portable schema, Docker, merge seams to StoryMee 2-MCP-Core.
  Inspired by mattpocock/skills (small composable skills, domain clarity, TDD).
---

# Engineering workflow

## Layout

```
apps/api     Fastify + Prisma modules
apps/web     React + Vite features
packages/domain  pure rules (no I/O)
.agents/skills   agent-readable skills
docker-compose.yml
docs/
```

## Feedback loops (mattpocock-style)

1. **Align** — change should match FEATURE_MAP + role matrix
2. **Red-green** — failing domain/API test first for behavior changes
3. **Deep modules** — domain for rules; modules for HTTP; features for UI
4. **Small PRs** — one vertical slice (e.g. lecture videoUrl end-to-end)

## Commands

```bash
npm test                 # domain + api
npm run db:setup         # generate + push + seed
npm run dev:api
npm run dev:web
npm run build
docker compose up --build
```

## Postgres / Supabase

- Local default: SQLite `file:./dev.db`
- Production: `provider = "postgresql"` + `DATABASE_URL`
- DDL reference: `apps/api/prisma/sql/postgres_init.sql`
- Docker entrypoint switches provider automatically

## StoryMee 2-MCP-Core merge seams

| This app | MCP-Core analog |
|----------|-----------------|
| `modules/auth` + session cookie | `core-account-api` sessions |
| `modules/*` Fastify feature folders | microservice modules |
| env + helmet + rate-limit | shared fastify-common patterns |
| catalog/media URLs | `core-media-api` / CDN later |
| single API process | later split via gateway if needed |

Do **not** rewrite every MCP service in this repo; keep compatible modular shape.

## Production add-ons (recommended)

| Tech | Why |
|------|-----|
| **Redis** | multi-instance rate limit + optional session store |
| **CDN** (Cloudflare/Fastly) | lecture videos + designer assets |
| **Object storage** (S3/R2) | upload video; store only URL in SQL |
| **Managed Postgres** (Supabase) | auth optional later; use DB + RLS if desired |
| **Observability** | OpenTelemetry / structured logs |

## Checklist

- [ ] Tests drive real shipped entry points
- [ ] No production secrets in git
- [ ] README/Docker path works for new machine
