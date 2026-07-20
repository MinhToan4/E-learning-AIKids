# Architecture — AI Kids Creator Academy

Professional monorepo: **apps** (deployables) + **packages** (shared libraries).

```
E-learning-AIKids-full/
├── apps/
│   ├── api/                 # Backend (Fastify + Prisma → Supabase Postgres)
│   │   ├── prisma/          # schema.prisma, seed, SQL
│   │   └── src/
│   │       ├── config/      # env (secrets)
│   │       ├── infrastructure/  # db, session, crypto, supabase client
│   │       └── modules/     # auth, catalog, progress, parent, teacher, admin
│   └── web/                 # Frontend (React + Vite)
│       └── src/
│           ├── app/         # router shell
│           ├── features/    # vertical UI slices
│           └── shared/      # UI kit, api client, asset map
├── packages/
│   └── domain/              # Shared pure business rules (NOT a server, NOT a UI)
├── docs/                    # Architecture, Supabase, security notes
├── .agents/skills/          # Agent-readable engineering/security skills
├── docker-compose.yml       # Optional API+Web images (DB = Supabase)
└── package.json             # npm workspaces root
```

## packages/domain — in one sentence

**Library of pure TypeScript rules** (RBAC, quest unlock, safety, art styles) imported by both FE and BE so logic is not duplicated. See `packages/domain/README.md`.

## Data

- **Source of truth:** Supabase PostgreSQL  
- **Access path:** Browser → `apps/api` → Prisma → `DATABASE_URL`  
- **Schema:** `apps/api/prisma/schema.prisma`  
- **Seed:** `apps/api/prisma/seed.ts`

## Run (daily)

```powershell
# DB already on Supabase — no local Postgres required
npm run dev:api    # :4000
npm run dev:web    # :5173
```

## Security baseline

See `.agents/skills/aikids-security-rbac/SKILL.md` and `docs/SUPABASE.md`.
