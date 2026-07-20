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
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 30),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
  isProd,
  studentAutoCreate: studentAutoCreateEnabled(),
  defaultParentEmail: (process.env.DEFAULT_PARENT_EMAIL ?? '').trim().toLowerCase(),
  defaultClassCode: (process.env.DEFAULT_CLASS_CODE ?? '').trim().toUpperCase(),
  /** Supabase project URL (JS client / Storage) */
  supabaseUrl: (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '')
    .trim(),
  /** Publishable / anon key — never service_role in the browser */
  supabaseAnonKey: (
    process.env.SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_KEY ??
    ''
  ).trim(),

  // ── Redis (optional — falls back to InMemory cache) ─────
  redisUrl: (process.env.REDIS_URL ?? '').trim() || undefined,

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
}

export const SESSION_COOKIE = 'aikids_session'
export const SESSION_DAYS = 14

