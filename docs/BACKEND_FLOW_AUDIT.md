# Backend flow audit

Date: 2026-07-23

## Boundary

PostgreSQL is the source of truth. The browser accesses application state only
through the Fastify API and its `httpOnly` session cookie:

`Web → /api/* → Fastify authorization/validation → Prisma → PostgreSQL`

The web package must not import a database, Firestore, or Firebase Realtime
Database client. `backend-boundary.test.ts` enforces this rule and also prevents
feature code from calling `fetch` outside the shared API client.

## Flow inventory

| Flow | Browser entry | Backend owner |
| --- | --- | --- |
| Session bootstrap, password, Google login, logout | `/api/auth/*` | `auth.routes.ts`, session store |
| Parent/teacher registration | `/api/auth/register/adult` | `auth.routes.ts` |
| Parent-child switching and parent gate | `/api/parent/*` | `parent.routes.ts` |
| Profile and onboarding | `/api/auth/me` | `auth.routes.ts` |
| Course catalog and lesson content | `/api/courses/*`, `/api/quests/*` | `catalog.routes.ts` |
| Enrollment and quest progress | `/api/enrollments`, `/api/progress/*` | `progress.routes.ts` |
| Portfolio, projects, sharing approvals | `/api/backpack`, `/api/projects/*`, `/api/parent/approvals/*` | portfolio/parent routes |
| Creative AI and generated media | `/api/creative/*`, `/api/media/*` | creative/media routes |
| Upload ownership and signed URLs | `/api/storage/*` | storage routes |
| Streaks, achievements, leaderboard | `/api/gamification/*` | gamification routes |
| Notifications and device registration | `/api/notifications/*` | notification routes |
| Teacher classroom and authoring | `/api/teacher/*` | teacher routes |
| Admin users, sessions, analytics, settings | `/api/admin/*` | admin routes |
| Classroom event publishing | `/api/realtime/*` | realtime routes |

## Deliberate browser integrations

These browser APIs do not own application data:

- Google Identity Services returns an ID token; the backend verifies it and
  creates the application session.
- Firebase Cloud Messaging obtains a device token in the browser; registration,
  ownership, notification records, and sending remain backend-controlled.
- A signed storage upload may transfer bytes directly to object storage. The
  backend creates the upload intent, fixes the owner/path, and finalizes it.

Any future realtime classroom reader must be exposed through an authenticated
backend endpoint. Direct Firestore collection reads were removed.

## Deployment requirements

Production should prefer one public origin with Nginx forwarding `/api/` to the
API container. If web and API use different origins, set `VITE_API_URL`,
`CORS_ORIGIN`, secure cookie flags, and TLS consistently. Never expose
`DATABASE_URL`, service-account credentials, or vendor API keys to Vite.
