import { config as loadEnv } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
// apps/api/.env
loadEnv({ path: resolve(__dirname, '../../.env') })
// monorepo root .env (optional)
loadEnv({ path: resolve(__dirname, '../../../../.env') })

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback
  if (!v) throw new Error(`Missing env ${name}`)
  return v
}

const nodeEnv = process.env.NODE_ENV ?? 'development'
const isProd = nodeEnv === 'production'

function studentAutoCreateEnabled(): boolean {
  if (process.env.STUDENT_AUTO_CREATE === 'true') return true
  if (process.env.STUDENT_AUTO_CREATE === 'false') return false
  return !isProd
}

function booleanEnv(name: string, fallback = false): boolean {
  const value = process.env[name]
  if (value === undefined || value === '') return fallback
  if (value === 'true') return true
  if (value === 'false') return false
  throw new Error(`${name} must be true or false`)
}

function positiveIntEnv(name: string, fallback: number): number {
  const value = Number(process.env[name] ?? fallback)
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`)
  }
  return value
}

function urlEnv(name: string, fallback: string): string {
  const value = (process.env[name] ?? fallback).trim().replace(/\/$/, '')
  try {
    return new URL(value).toString().replace(/\/$/, '')
  } catch {
    throw new Error(`${name} must be a valid absolute URL`)
  }
}

// Required: Supabase (or any Postgres) connection URI — never sqlite, never ship to FE
const databaseUrl = required('DATABASE_URL')

if (databaseUrl.startsWith('file:')) {
  throw new Error(
    'SQLite is removed. Set DATABASE_URL to a PostgreSQL/Supabase URI (see docs/SUPABASE.md).',
  )
}

export const env = {
  nodeEnv,
  port: Number(process.env.PORT ?? 4000),
  host: process.env.HOST ?? '0.0.0.0',
  databaseUrl,
  jwtSecret: required(
    'JWT_SECRET',
    'dev-secret-aikids-creator-academy-32chars-min',
  ),
  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  cookieSameSite: (process.env.COOKIE_SAME_SITE ?? 'lax') as
    | 'lax'
    | 'strict'
    | 'none',
  rateLimitMax: positiveIntEnv('RATE_LIMIT_MAX', 30),
  rateLimitWindowMs: positiveIntEnv('RATE_LIMIT_WINDOW_MS', 60_000),
  globalRateLimitMax: positiveIntEnv('GLOBAL_RATE_LIMIT_MAX', 600),
  generationRateLimitMax: positiveIntEnv('GENERATION_RATE_LIMIT_MAX', 12),
  /** Only trust forwarding headers when traffic is guaranteed to come through a proxy. */
  trustProxy: booleanEnv('TRUST_PROXY', false),
  isProd,
  studentAutoCreate: studentAutoCreateEnabled(),
  defaultParentEmail: (process.env.DEFAULT_PARENT_EMAIL ?? '').trim().toLowerCase(),
  defaultClassCode: (process.env.DEFAULT_CLASS_CODE ?? '').trim().toUpperCase(),
  // ── Redis (optional — falls back to InMemory cache) ─────
  redisUrl: (process.env.REDIS_URL ?? '').trim() || undefined,

  // All AI media generation goes through StoryMee Hub provider rotation.
  storymeeHubUrl: urlEnv(
    'STORYMEE_HUB_URL',
    isProd ? 'http://storymee-hub:5100' : 'https://dev-hub.storymee.com',
  ),
  storymeeStorageUrl: urlEnv(
    'STORYMEE_STORAGE_URL',
    'https://storage.storymee.com',
  ),
  hubApiKey: (process.env.HUB_API_KEY ?? '').trim(),
  hubMediaProvider: (process.env.HUB_MEDIA_PROVIDER ?? 'auto').trim(),
  hubMediaTimeoutMs: positiveIntEnv('HUB_MEDIA_TIMEOUT_MS', 180_000),
  hubMediaPollMs: positiveIntEnv('HUB_MEDIA_POLL_MS', 1_000),

  // ── Gmail SMTP (optional in dev — logs to console) ──────
  gmailUser: (process.env.GMAIL_USER ?? '').trim(),
  gmailAppPassword: (process.env.GMAIL_APP_PASSWORD ?? '').trim() || undefined,

  // ── App URL (for email links) ───────────────────────────
  appUrl: (process.env.APP_URL ?? 'http://localhost:5173').trim(),

  /**
   * Optional cookie Domain for cross-subdomain SSO with StoryMee
   * (e.g. `.storymee.com`). Leave empty in local dev.
   */
  cookieDomain: (process.env.COOKIE_DOMAIN ?? '').trim() || undefined,

  /**
   * Optional gateway alias — requests under this prefix rewrite to `/api/*`
   * (e.g. `/api/aikids/health` → `/api/health`). Empty = disabled.
   */
  apiAliasPrefix: (process.env.API_ALIAS_PREFIX ?? '').trim() || undefined,

  /**
   * Google Identity Services — OAuth 2.0 Web Client ID (public).
   * Used to verify ID tokens (aud). Same value on FE as VITE_GOOGLE_CLIENT_ID.
   */
  googleClientId: (
    process.env.GOOGLE_CLIENT_ID ??
    process.env.VITE_GOOGLE_CLIENT_ID ??
    ''
  ).trim(),

  // Firebase Admin is optional. Postgres remains the source of truth.
  firebaseEnabled: booleanEnv('FIREBASE_ENABLED', false),
  firebaseProjectId: (process.env.FIREBASE_PROJECT_ID ?? '').trim(),
  firebaseServiceAccountJsonBase64: (
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 ?? ''
  ).trim(),
  firebaseStorageBucket: (process.env.FIREBASE_STORAGE_BUCKET ?? '').trim(),
  firebaseWebApiKey: (process.env.FIREBASE_WEB_API_KEY ?? '').trim(),
  firebaseWebAuthDomain: (process.env.FIREBASE_WEB_AUTH_DOMAIN ?? '').trim(),
  firebaseWebMessagingSenderId: (
    process.env.FIREBASE_WEB_MESSAGING_SENDER_ID ?? ''
  ).trim(),
  firebaseWebAppId: (process.env.FIREBASE_WEB_APP_ID ?? '').trim(),
  firebaseWebVapidKey: (process.env.FIREBASE_WEB_VAPID_KEY ?? '').trim(),
  firebasePushEnabled: booleanEnv('FIREBASE_PUSH_ENABLED', false),
}

export const SESSION_COOKIE = 'aikids_session'
export const SESSION_DAYS = 14
