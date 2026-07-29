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

## Verification

```powershell
npm test
npm run typecheck
npm run build
```

Review the production chunk report and `git diff --check` before handoff.
