# AI Kids Creator Academy

Hồ sơ tổng kết và bàn giao Firebase Production: [docs/FIREBASE_PRODUCTION_HANDOVER.md](docs/FIREBASE_PRODUCTION_HANDOVER.md).

Tài liệu vận hành tải lớn và Firebase: [docs/CAPACITY-2000-FIREBASE.md](docs/CAPACITY-2000-FIREBASE.md).

Kiểm tra kết nối Firebase an toàn (không in dữ liệu người dùng hoặc secret): `npm run firebase:check -w @aikids/api`.

Experiential AI courses for ages **8–11** (Vietnamese UI): quests, portfolio + parent gate, CMS roles, **Supabase PostgreSQL**.

## What is what?

| Path | Role |
|------|------|
| `apps/web` | **Frontend** — React UI, calls API only |
| `apps/api` | **Backend** — Fastify, Prisma, sessions, secrets |
| `packages/domain` | **Shared pure logic** — not FE, not BE server; both import it |
| Supabase | **Cloud SQL** — tables + data |

Diagram and naming: [docs/ARCHITECTURE_LAYERS.md](./docs/ARCHITECTURE_LAYERS.md) · [packages/domain/README.md](./packages/domain/README.md)

## Run FE + BE only (SQL on Supabase)

```powershell
npm install
# apps/api/.env must have DATABASE_URL → your Supabase Postgres URI
npm run db:generate
npm run dev:api    # http://localhost:4000
npm run dev:web    # http://localhost:5173
```

No local Docker Postgres required. Optional full image deploy: `docker compose up --build` (API + Web only; still uses Supabase).

### Demo accounts (after seed)

| Role | Login |
|------|--------|
| Student | Nickname `MựcCon` + avatar |
| Parent | `parent@demo.aikids.local` / `ParentDemo1!` |
| Teacher | `teacher@demo.aikids.local` / `TeacherDemo1!` |
| Admin | `admin@demo.aikids.local` / `AdminDemo1!` |

```powershell
npm run db:seed   # or SEED_FORCE=true if refreshing demo users
```

## Security (short)

| Secret | Where |
|--------|--------|
| DB password / `DATABASE_URL` | **BE only** (`apps/api/.env`) |
| `JWT_SECRET` | BE only |
| Publishable Supabase key | Optional; public by design; this app does not need it on FE |

Details: [docs/SUPABASE.md](./docs/SUPABASE.md), skill `aikids-security-rbac`.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev:api` / `dev:web` | Local BE / FE |
| `npm run db:push` / `db:seed` | Schema + data on Supabase |
| `npm test` | Domain + API tests |
| `npm run build` | Production build |

## Course content

Seed modules: `apps/api/prisma/seed/courses/*` (SQL is source of truth, not FE fixtures).
