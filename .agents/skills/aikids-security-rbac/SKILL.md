---
name: aikids-security-rbac
description: >-
  OWASP-aligned security and RBAC for AI Kids monorepo (Fastify + Prisma +
  Supabase). Use when adding routes, auth, env, CMS writes, or reviewing access.
---

# Security & RBAC (authoritative for this repo)

Sources (do not invent policies beyond these):

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) — broken access control, crypto failures, injection, security misconfig
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/) — session, secrets, validation
- [Supabase RLS / Postgres security guidance](https://github.com/supabase/agent-skills) — RLS critical when browser talks to Supabase; connection mgmt
- [Prisma security](https://www.prisma.io/docs/orm/prisma-client/queries/raw-database-access) — prefer Client over raw SQL string concat

## Trust boundaries

| Boundary | Rule |
|----------|------|
| Browser | No `DATABASE_URL`, no DB password, no `service_role` |
| `apps/web` | Only `VITE_*` public vars; all mutations via API |
| `apps/api` | Owns sessions, bcrypt, Prisma, rate limits |
| `packages/domain` | Pure authz matrix — no secrets, no I/O |
| Supabase | Password only in server env; enable RLS if client SDK used |

## Must enforce on every change

1. **Broken access control (OWASP A01):** `requireRole` + `can(role, action)` + ownership (`parentOwnsChild`, teacher class).
2. **Injection (A03):** Zod parse bodies; Prisma only (no string-built SQL).
3. **Auth failures (A07):** bcrypt adults; httpOnly cookie; inactive users 403; rate-limit login.
4. **Security misconfig (A05):** CORS allowlist; Helmet; env-driven secrets; never commit `.env`.
5. **Sensitive data:** never return `passwordHash`; private portfolio default.

## Checklist

- [ ] New route: domain action + unit test + integration 403 for wrong role
- [ ] No secret in `apps/web` or `packages/domain`
- [ ] Student free text / nickname pass `validateChildText`
- [ ] Production: strong `JWT_SECRET`, `COOKIE_SECURE=true` behind HTTPS, `STUDENT_AUTO_CREATE=false` unless intentional

## FE Supabase publishable key

Per Supabase docs, **anon/publishable keys are public**. They are **not** a substitute for server secrets. This product uses **API + Prisma** as the data path; FE key is optional and must pair with RLS if used.
