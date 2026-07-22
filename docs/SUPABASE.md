# Supabase + AI Kids (PostgreSQL only)

SQLite has been **removed**. All data goes through **Postgres** via Prisma.

## Bảo mật: FE có API key Supabase — có sao không?

| Secret | Đặt ở đâu | Được public không? |
|--------|-----------|---------------------|
| `DATABASE_URL` + **mật khẩu DB** | **Chỉ BE** `apps/api/.env` | **Không bao giờ** đưa ra FE / git |
| `SUPABASE_ANON_KEY` / publishable | Có thể FE (nếu dùng Storage/Realtime) | **Có** — thiết kế của Supabase giống Firebase web key |
| `service_role` key | Chỉ server, hầu như không cần nếu dùng Prisma | **Không bao giờ** FE |

**Bạn hiểu đúng một nửa:** dữ liệu khóa học / user / RBAC của app này đi qua **BE (Fastify + Prisma)**. FE chỉ gọi `VITE_API_URL` (API của bạn).  

Key publishable trên FE **không** cho phép “đọc hết DB” nếu bật **RLS**; nó chỉ mở các API Supabase public bạn cho phép. Với kiến trúc hiện tại, **không bắt buộc** gắn key Supabase trên FE — đã comment out trong `apps/web/.env`.

**Packages folder** (`packages/domain`): **không phải DB**. Là code TypeScript dùng chung (RBAC, unlock quest, art styles…) import bởi cả BE và FE — monorepo standard, không chứa secret.

## What you need from Supabase Dashboard

| Secret | Where | Used by |
|--------|--------|---------|
| **Project URL** | Settings → API | `SUPABASE_URL` / `VITE_SUPABASE_URL` |
| **Publishable / anon key** | Settings → API | `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY` |
| **Database password** + **Connection string (URI)** | Settings → **Database** | `DATABASE_URL` for **Prisma** (tables + seed) |

> The publishable key alone **cannot** run `prisma db push` / seed.  
> You must paste the **Postgres URI** (with DB password) into `apps/api/.env` as `DATABASE_URL`.

### Example URI (pooler)

```env
DATABASE_URL="postgresql://postgres.nabffxfkkheesbzyvrbd:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public"
```

Region may differ — copy the exact string from the dashboard.

## Database riêng cho integration test

`app.integration.test.ts` chạy migration, seed và các thao tác ghi. Vì vậy test chỉ
được bật khi `TEST_DATABASE_URL` tồn tại và trỏ tới **database khác**
`DATABASE_URL`. Nếu thiếu hoặc trùng database, suite được skip để không ghi đè
user, khóa API hoặc cấu hình runtime.

```env
DATABASE_URL="postgresql://.../aikids_app"
TEST_DATABASE_URL="postgresql://.../aikids_test"
```

Không dùng database production làm `TEST_DATABASE_URL`.

## One-time setup

```powershell
# 1. Edit apps/api/.env → set DATABASE_URL (Supabase URI)
# 2. Apply schema + seed demo courses/users
cd apps/api
npx prisma generate
npx prisma db push
npm run db:seed
```

Or from monorepo root (uses workspace scripts):

```powershell
npm run db:generate
npm run db:push
npm run db:seed
```

**Do not** use `db:push --force-reset` on a shared Supabase project unless you intend to wipe it.

## Architecture

```
FE (Vite) ──HTTP──► API (Fastify + Prisma) ──► Supabase Postgres
                └── optional supabase-js ──► Storage / Realtime
```

- **Tables / seed / RBAC data:** Prisma models in `apps/api/prisma/schema.prisma`
- **JS client:** `apps/api/src/infrastructure/supabase/client.ts`, `apps/web/src/shared/lib/supabase.ts`
- **Expo sample from dashboard** does not apply here (this monorepo is not Expo)

## Daily run (no local Postgres)

```powershell
npm run dev:api
npm run dev:web
```

Docker Compose starts **API + Web only** (no embedded Postgres). SQL stays on Supabase.

## If tables already exist on Supabase

1. Prefer `npx prisma db push` so Prisma models match (adds missing columns like `videoUrl`).
2. Or run `apps/api/prisma/sql/postgres_init.sql` in SQL Editor (idempotent-ish).
3. Then `npm run db:seed` (skips demo users if adults exist; always upserts catalog safely).

## RLS note

API uses the **database password** (bypasses RLS as table owner).  
If you later query from the browser with the anon key, enable RLS policies per table.
