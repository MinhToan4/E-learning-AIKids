# Architecture layers (professional monorepo)

## Mental model

| Path | Layer | Runs where | Secrets? |
|------|--------|------------|----------|
| `apps/web` | **Presentation (FE)** | Browser | Only public config (`VITE_API_URL`) |
| `apps/api` | **Application + infrastructure (BE)** | Node server | `DATABASE_URL`, `JWT_SECRET`, cookies |
| `packages/domain` | **Domain (shared pure logic)** | Imported by FE & BE | **Never** |
| Supabase Postgres | **Data store** | Cloud | Password only in BE env |

## Request path (security)

```
Browser (FE)
  → HTTPS/HTTP to Fastify API only
  → Session cookie httpOnly (not localStorage JWT for kids session)
  → Prisma with DATABASE_URL (server-side)
  → Supabase PostgreSQL
```

FE **does not** open a direct privileged DB connection.

## Why Docker had Postgres before

Local Postgres was a **dev fallback** when SQLite was removed and Supabase password was not yet configured.  
That is **optional offline mode**. With Supabase live, you only need:

```bash
npm run dev:api
npm run dev:web
```

Docker Compose no longer starts a local database container.

## International naming conventions (this repo)

| Kind | Convention | Example |
|------|------------|---------|
| Packages | `@scope/name` | `@aikids/domain` |
| Folders | kebab-case | `quest-access`, `seed/courses` |
| TS files | kebab or domain noun | `auth.routes.ts`, `creative.ts` |
| Functions | camelCase | `requireRole`, `assertArtStyleId` |
| Types/Interfaces | PascalCase | `QuestDetail`, `ArtStyleId` |
| Env vars | SCREAMING_SNAKE | `DATABASE_URL`, `JWT_SECRET` |
| DB models (Prisma) | PascalCase model, camelCase fields | `User.passwordHash` |

References: Google TypeScript Style, Prisma naming, npm workspaces monorepo layout.
