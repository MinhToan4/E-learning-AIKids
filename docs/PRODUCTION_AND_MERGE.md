# Production stack & StoryMee merge seams

## Recommended infrastructure

| Component | Recommendation | Why |
|-----------|----------------|-----|
| **Database** | Supabase / managed PostgreSQL | RLS optional; `DATABASE_URL` only; DDL in `prisma/sql/postgres_init.sql` |
| **Object storage** | S3 / Cloudflare R2 / Supabase Storage | Store lecture video files; **only URL** in `Quest.videoUrl` |
| **CDN** | Cloudflare / Fastly / CloudFront | Cache videos + designer assets; low latency for kids clients |
| **Redis** | Upstash / ElastiCache / self-host | Shared rate-limit + session store when API scales >1 replica |
| **Secrets** | Env / vault (never git) | `JWT_SECRET`, DB URL, cookie flags |
| **Observability** | Structured logs + optional OpenTelemetry | Debug CMS and auth without PII dumps |

## Environment mapping (Supabase)

```env
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-....pooler.supabase.com:6543/postgres?schema=public
JWT_SECRET=<32+ random chars>
CORS_ORIGIN=https://app.yourdomain.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
NODE_ENV=production
VITE_API_URL=https://api.yourdomain.com
```

1. Set `provider = "postgresql"` in `schema.prisma` (Docker does this automatically).
2. `npx prisma db push` or apply `postgres_init.sql`.
3. `npm run db:seed` (or custom seed without demo passwords in real prod).

## Security baseline (production)

- Rotate demo accounts; disable public `createIfMissing` student self-serve if needed
- `COOKIE_SECURE=true` behind HTTPS
- Redis-backed rate limits for multi-instance
- Least privilege DB role for API (no superuser)
- Teacher/admin CMS behind auth only (already)

## Merge seams → StoryMee `2-MCP-Core`

This monorepo is **merge-ready**, not a full multi-service rewrite:

| AI Kids module | Core counterpart | Merge approach |
|----------------|------------------|----------------|
| `auth` + httpOnly session | `core-account-api` | Map users/roles; later SSO token exchange |
| Feature Fastify modules | core-*-api module layout | Keep vertical modules; extract package when needed |
| `Quest.videoUrl` | `core-media-api` / asset CDN | Upload via media service; store URL here |
| Domain package | shared libs | Publish `@aikids/domain` or fold rules into domain skills |
| Docker compose | `infra/docker-compose*.yml` | Add service `aikids-api` alongside existing |

**Do not** hardcode catalog or secrets — SQL + env stay the contract across merge.

## Docker

```bash
docker compose up --build
curl http://localhost:4000/api/health
# Web: http://localhost:8080
```

Dev without Docker: SQLite + `npm run db:setup` + `dev:api` / `dev:web`.
