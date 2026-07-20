/**
 * Integration tests: real Fastify app + real Postgres (Supabase or TEST_DATABASE_URL).
 * Loads apps/api/.env so local runs use the same DB as development.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { config as loadEnv } from 'dotenv'
import { execSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const apiRoot = resolve(__dirname, '../..')
loadEnv({ path: resolve(apiRoot, '.env') })

const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
if (!databaseUrl || databaseUrl.startsWith('file:')) {
  throw new Error(
    'Set DATABASE_URL in apps/api/.env to Supabase Postgres (see docs/SUPABASE.md)',
  )
}

process.env.DATABASE_URL = databaseUrl
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test-secret-aikids-creator-academy-32chars'
process.env.NODE_ENV = 'test'
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'
process.env.COOKIE_SECURE = 'false'
process.env.STUDENT_AUTO_CREATE = 'true'
process.env.DEFAULT_PARENT_EMAIL =
  process.env.DEFAULT_PARENT_EMAIL || 'parent@demo.aikids.local'
process.env.DEFAULT_CLASS_CODE = process.env.DEFAULT_CLASS_CODE || 'STAR-8'
process.env.SEED_FORCE = process.env.SEED_FORCE || 'true'
process.env.SEED_OVERWRITE_CONTENT = ''

const testEnv = { ...process.env, DATABASE_URL: databaseUrl }

beforeAll(() => {
  execSync('npx prisma db push --skip-generate', {
    cwd: apiRoot,
    env: testEnv,
    stdio: 'pipe',
  })
  execSync('npx tsx prisma/seed.ts', {
    cwd: apiRoot,
    env: testEnv,
    stdio: 'pipe',
  })
}, 180_000)

async function inject(
  app: Awaited<ReturnType<typeof import('../app.js').buildApp>>,
  opts: {
    method: 'GET' | 'POST' | 'PATCH'
    url: string
    payload?: unknown
    cookies?: Record<string, string>
  },
) {
  const headers: Record<string, string> = {}
  if (opts.cookies) {
    headers.cookie = Object.entries(opts.cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ')
  }
  const res = await app.inject({
    method: opts.method,
    url: opts.url,
    payload: opts.payload as never,
    headers,
  })
  const setCookie = res.headers['set-cookie']
  let session: string | undefined
  if (setCookie) {
    const raw = Array.isArray(setCookie) ? setCookie[0] : setCookie
    const m = /aikids_session=([^;]+)/.exec(raw)
    if (m) session = m[1]
  }
  let body: unknown = null
  try {
    body = res.json()
  } catch {
    body = res.body
  }
  return {
    status: res.statusCode,
    body: body as Record<string, unknown>,
    session,
  }
}

describe('API integration (Postgres / Supabase)', () => {
  let app: Awaited<ReturnType<typeof import('../app.js').buildApp>>

  beforeAll(async () => {
    const mod = await import('../app.js')
    app = await mod.buildApp()
    await app.ready()
  }, 60_000)

  afterAll(async () => {
    await app.close()
    const { prisma } = await import('../infrastructure/database/prisma.js')
    await prisma.$disconnect()
  })

  it('health is ok and reports postgresql', async () => {
    const r = await inject(app, { method: 'GET', url: '/api/health' })
    expect(r.status).toBe(200)
    expect(r.body.ok).toBe(true)
    expect(r.body.db).toBe('postgresql')
  })

  it('rejects unauthenticated catalog', async () => {
    const r = await inject(app, { method: 'GET', url: '/api/courses' })
    expect(r.status).toBe(401)
  })

  it('student can list open courses with creative stations', async () => {
    const login = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/student',
      payload: {
        nickname: `Hero${Date.now().toString().slice(-6)}`,
        avatarId: 'avatar-cat',
        createIfMissing: true,
      },
    })
    expect(login.status).toBe(200)
    const cookies = { aikids_session: login.session! }

    const courses = await inject(app, {
      method: 'GET',
      url: '/api/courses',
      cookies,
    })
    expect(courses.status).toBe(200)
    const list = courses.body.courses as Array<{ id: string; status: string }>
    expect(list.filter((c) => c.status === 'open').length).toBeGreaterThanOrEqual(4)

    const detail = await inject(app, {
      method: 'GET',
      url: '/api/courses/course-comic',
      cookies,
    })
    const quests = (
      detail.body.course as { quests: Array<{ id: string; practiceKind: string }> }
    ).quests
    expect(quests.some((q) => q.practiceKind === 'character')).toBe(true)
    expect(quests.some((q) => q.practiceKind === 'style')).toBe(true)
    expect(quests.some((q) => q.practiceKind === 'comic')).toBe(true)
  })

  it('teacher ok; parent forbidden on admin', async () => {
    const tLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/adult',
      payload: {
        email: 'teacher@demo.aikids.local',
        password: 'TeacherDemo1!',
      },
    })
    expect(tLogin.status).toBe(200)
    const cls = await inject(app, {
      method: 'GET',
      url: '/api/teacher/class',
      cookies: { aikids_session: tLogin.session! },
    })
    expect(cls.status).toBe(200)

    const pLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/adult',
      payload: {
        email: 'parent@demo.aikids.local',
        password: 'ParentDemo1!',
      },
    })
    const denied = await inject(app, {
      method: 'GET',
      url: '/api/admin/system',
      cookies: { aikids_session: pLogin.session! },
    })
    expect(denied.status).toBe(403)
  })
})
