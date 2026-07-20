# `@aikids/domain` — shared domain layer (neither FE nor BE alone)

## What is this?

In a **professional monorepo** (npm workspaces), `packages/*` holds **shared libraries**.

`packages/domain` is the **domain layer** from clean architecture:

| Question | Answer |
|----------|--------|
| Is it FE? | **No** — no React, no DOM, no browser APIs |
| Is it BE? | **No** — no Fastify, no Prisma, no database, no env secrets |
| What is it? | **Pure TypeScript business rules** both apps import |

```
┌─────────────────────────────────────────────────┐
│  apps/web (FE)     apps/api (BE)                │
│       │                  │                      │
│       └────────┬─────────┘                      │
│                ▼                                │
│     packages/domain  ← pure rules only          │
│     (RBAC, unlock quests, safety, art styles)   │
└─────────────────────────────────────────────────┘
```

## Why not put this only in BE?

- FE needs the **same unlock rules** / style catalogs for UI without re-implementing (bugs if duplicated).
- Unit tests run in milliseconds with **no database**.
- OWASP-friendly: **authorization matrix lives in one place** (`authz.ts`), API calls `can()` / `assertCan()`.

## Naming (international)

- Package: `@aikids/domain`
- Files: `authz.ts`, `progress.ts`, `safety.ts`, `creative.ts` (English, kebab/snake not needed for single words)
- Types: `PascalCase` (`ArtStyleId`), functions: `camelCase` (`can`, `buildQuestStatuses`)

## What must NEVER live here

- Database passwords, API keys, `DATABASE_URL`
- HTTP handlers
- Prisma models
- React components
