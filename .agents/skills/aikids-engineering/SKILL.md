---
name: aikids-engineering
description: >-
  FE-only engineering workflow for AI Kids React/Vite: runtime performance,
  StoryMee Hub contracts, tests, Docker and minimal production-safe changes.
---

# AI Kids frontend engineering

## Orient before editing

- Name the user-visible problem and reproduce or trace its real flow.
- Touch only `apps/web` and FE configuration in this repo.
- Treat StoryMee Hub/core services as external contracts.
- State auth, privacy, API and bundle impact.

## Ponytail ladder

Stop at the first rung that solves the verified problem:

1. Does this need to exist? If not, delete/skip it.
2. Is the behavior already in this codebase? Reuse it.
3. Can React, the browser or CSS do it natively?
4. Can an installed dependency do it without a wrapper?
5. Only then write the minimum new code.

Never minimize validation, cleanup, error handling, security or accessibility.
Read the touched route, store, API normalizer and effect lifecycle before
changing them.

## Boundaries

- All HTTP goes through `shared/lib/api.ts` and StoryMee Hub.
- Do not call microservice ports or add server/database code here.
- Server data stays in local feature state; Zustand is for cross-route client
  state only.
- Lazy-load route pages and heavyweight optional SDKs.
- Effects must survive React StrictMode setup → cleanup → setup without leaked
  listeners, timers or async subscriptions.
- Do not keep hidden route trees mounted to simulate a cache.

## API Proxy Rule

- Luôn gọi API thông qua proxy `/api/*` từ browser.
- Browser → `/api/*` → Vite proxy → `https://dev-hub.storymee.com` (dev).
- Browser → `/api/*` → Vercel/Docker proxy → `https://dev-hub.storymee.com` (prod).
- KHÔNG gọi trực tiếp `dev-hub.storymee.com` từ browser. Điều này đảm bảo cookie HttpOnly hoạt động đúng.

## XP/Progression Pipeline

Flow từ `submitCheck` đến UI:
1. `LessonPage.submitCheck` gọi `POST /api/progress/{id}/check`.
2. Trả về `{ stars, nextQuestId, newAchievements, totalXp?, level? }`.
3. Phát event `aikids:xp-updated` kèm `{ stars, xp?, level? }`.
4. Hook `useProgression`:
   - Nếu `detail.xp` và `detail.level` tồn tại → gọi `setProgressionSnapshot()` NGAY LẬP TỨC.
   - Nếu không → `invalidateQueries` với độ trễ (reconcile timer: 2000ms).
5. `GET /api/gamification/profile` → `normalizeProgression()`.

## Local Curriculum Guard

Không gọi API cho các ID tạm/local. Sử dụng `isLocalId` pattern:
```ts
const isLocalId = progressId.startsWith('rule-') 
               || progressId.startsWith('bai-') 
               || progressId === 'aiki-rules';
```

## Verification

```powershell
cd apps/web && npm run typecheck
cd apps/web && npx vitest run --reporter=verbose
npm run build
```
*(Lưu ý: Không dùng `pnpm --filter web test run` vì vitest không nằm trong root PATH).*

Review the production chunk report and `git diff --check` before handoff.
