# Frontend environments

All browser API calls go through one origin configured by `VITE_API_URL`.
Feature code must use `api()` from `apps/web/src/shared/lib/api.ts` and must not
construct a StoryMee backend URL directly.

| Deployment target | `VITE_APP_ENV` | `VITE_API_URL` |
| --- | --- | --- |
| Local development | `development` | `https://dev-hub.storymee.com` |
| Vercel Preview | `staging` | `https://dev-hub.storymee.com` |
| Vercel Production (current) | `production` | `https://dev-hub.storymee.com` |
| Vercel Production (after cutover) | `production` | `https://api.aikid.vn` |

`VITE_API_URL` must contain only an origin such as `https://api.aikid.vn`.
Do not include `/api`, a route, query string or fragment. Production builds fail
when the variable is missing, preventing an accidental development fallback.

Vite variables are compiled into the browser bundle. Changing an environment
variable requires a new Vercel deployment, but no source-code change.

## Production cutover

1. Configure and verify `api.aikid.vn` against the same StoryMee Hub gateway.
2. Smoke-test login, account context, LMS, gamification, media and notifications.
3. Change only Production `VITE_API_URL` to `https://api.aikid.vn`.
4. Redeploy the same frontend commit.
5. Keep `dev-hub.storymee.com` for Development and Preview.

`VITE_STORAGE_PUBLIC_URL` remains separate because existing media references may
resolve directly to public storage. It normally does not change with the gateway.
