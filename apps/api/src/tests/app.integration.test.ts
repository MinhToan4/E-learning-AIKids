/**
 * Integration tests: real Fastify app + an explicitly isolated TEST_DATABASE_URL.
 * Never migrate, seed or mutate the application DATABASE_URL.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { config as loadEnv } from 'dotenv'
import { execSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { selectIsolatedTestDatabase } from './test-database-policy.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const apiRoot = resolve(__dirname, '../..')
loadEnv({ path: resolve(apiRoot, '.env') })

const applicationDatabaseUrl = process.env.DATABASE_URL
const databaseUrl = selectIsolatedTestDatabase(
  process.env.TEST_DATABASE_URL,
  applicationDatabaseUrl,
)
const integrationEnabled = databaseUrl !== null

if (databaseUrl) process.env.DATABASE_URL = databaseUrl
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

const testEnv = databaseUrl
  ? { ...process.env, DATABASE_URL: databaseUrl }
  : process.env

if (integrationEnabled) {
  beforeAll(() => {
    execSync('npx prisma db push --skip-generate', {
      cwd: apiRoot,
      env: testEnv,
      stdio: 'pipe',
    })
    // Postgres CHECK constraints are not managed by Prisma — expand practice kinds
    execSync('npx tsx prisma/run-fix-practice.ts', {
      cwd: apiRoot,
      env: testEnv,
      stdio: 'pipe',
    })
    // Expand users.goal allowed values (K1–K6 onboarding)
    execSync('npx tsx prisma/run-fix-goal-check.ts', {
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
}

async function inject(
  app: Awaited<ReturnType<typeof import('../app.js').buildApp>>,
  opts: {
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
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

const describeIntegration = integrationEnabled ? describe : describe.skip

describeIntegration('API integration (isolated Postgres)', () => {
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

  it('health is ready without exposing infrastructure details', async () => {
    const r = await inject(app, { method: 'GET', url: '/api/health' })
    expect(r.status).toBe(200)
    expect(r.body.ok).toBe(true)
    expect(r.body.success).toBe(true)
    expect(r.body.data).toEqual({ status: 'ready' })
    const serialized = JSON.stringify(r.body)
    expect(serialized).not.toContain('postgresql')
    expect(serialized).not.toContain('redis')
    expect(serialized).not.toContain('supabase')
  })

  it('rejects unauthenticated catalog', async () => {
    const r = await inject(app, { method: 'GET', url: '/api/courses' })
    expect(r.status).toBe(401)
  })

  it('student can list L1/L2 open courses with creative stations', async () => {
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
    const list = courses.body.courses as Array<{
      id: string
      status: string
      ageTrack: string
      courseKey: string
      quests: Array<{ id: string }>
    }>
    const open = list.filter((c) => c.status === 'open')
    expect(open.length).toBeGreaterThanOrEqual(12)
    expect(open.some((c) => c.ageTrack === 'L1')).toBe(true)
    expect(open.some((c) => c.ageTrack === 'L2')).toBe(true)
    expect(open.filter((c) => c.ageTrack === 'L1')).toHaveLength(6)
    expect(open.filter((c) => c.ageTrack === 'L2')).toHaveLength(6)
    expect(open.reduce((total, course) => total + course.quests.length, 0)).toBe(
      146,
    )

    const l1 = await inject(app, {
      method: 'GET',
      url: '/api/courses?ageTrack=L1',
      cookies,
    })
    expect(
      (l1.body.courses as Array<{ ageTrack: string }>).every(
        (c) => c.ageTrack === 'L1',
      ),
    ).toBe(true)

    const k2 = await inject(app, {
      method: 'GET',
      url: '/api/courses/l1-k2-nhan-vat',
      cookies,
    })
    expect(k2.status).toBe(200)
    const k2quests = (
      k2.body.course as {
        quests: Array<{ practiceKind: string; stations?: { stations: unknown[] } }>
      }
    ).quests
    expect(k2quests.some((q) => q.practiceKind === 'character')).toBe(true)
    expect(k2quests.some((q) => q.practiceKind === 'ai_pick')).toBe(true)
    expect(k2quests[0]?.stations?.stations?.length).toBeGreaterThanOrEqual(4)

    const k4 = await inject(app, {
      method: 'GET',
      url: '/api/courses/l1-k4-truyen-tranh',
      cookies,
    })
    const k4quests = (
      k4.body.course as { quests: Array<{ practiceKind: string }> }
    ).quests
    expect(k4quests.some((q) => q.practiceKind === 'comic')).toBe(true)

    const legacyComic = await inject(app, {
      method: 'GET',
      url: '/api/courses/course-comic',
      cookies,
    })
    expect(legacyComic.status).toBe(200)
    expect(
      (legacyComic.body.course as { recognition: { issuer: string } }).recognition.issuer,
    ).toBe('AI Kids Creator Academy')

    const started = await inject(app, {
      method: 'POST',
      url: '/api/progress/l1-k1-q1/start',
      cookies,
    })
    expect(started.status).toBe(200)
    expect(started.body.progress.phase).toBe('learn')

    const skippedGame = await inject(app, {
      method: 'POST',
      url: '/api/progress/l1-k1-q1/advance',
      cookies,
      payload: { fromPhase: 'practice' },
    })
    expect(skippedGame.status).toBe(409)
    expect(skippedGame.body.reason).toBe('phase_mismatch')

    const toGame = await inject(app, {
      method: 'POST',
      url: '/api/progress/l1-k1-q1/advance',
      cookies,
      payload: { fromPhase: 'learn' },
    })
    expect(toGame.status).toBe(200)
    expect(toGame.body.phase).toBe('game')

    const resumed = await inject(app, {
      method: 'POST',
      url: '/api/progress/l1-k1-q1/start',
      cookies,
    })
    expect(resumed.body.progress.phase).toBe('game')

    const toPractice = await inject(app, {
      method: 'POST',
      url: '/api/progress/l1-k1-q1/advance',
      cookies,
      payload: {
        fromPhase: 'game',
        gameEvidence: {
          gameType: 'pick',
          choices: ['Quan sát kỹ', 'Nói lý do'],
          attempts: 2,
          durationMs: 1200,
        },
      },
    })
    expect(toPractice.status).toBe(200)
    expect(toPractice.body.phase).toBe('practice')
    expect(toPractice.body.gameRecorded).toBe(true)

    const celebration = await inject(app, {
      method: 'GET',
      // A caller cannot select or inspect another class through query params.
      url: '/api/gamification/class-celebration?classId=another-class',
      cookies,
    })
    expect(celebration.status).toBe(200)
    expect(celebration.body.celebration.personal.xp).toBeTypeOf('number')
    expect(celebration.body.leaderboard).toBeUndefined()
    expect(JSON.stringify(celebration.body)).not.toContain('nickname')
  })

  it('admin can set Vidtory API key status without leaking secret; non-admin 403', async () => {
    const aLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/adult',
      payload: {
        email: 'admin@demo.aikids.local',
        password: 'AdminDemo1!',
      },
    })
    expect(aLogin.status).toBe(200)
    const adminCookie = { aikids_session: aLogin.session! }

    const put = await inject(app, {
      method: 'PUT',
      url: '/api/admin/settings/vidtory',
      cookies: adminCookie,
      payload: { apiKey: 'vidtory_test_secret_key_for_admin_ui' },
    })
    expect(put.status).toBe(200)
    expect(put.body.configured).toBe(true)
    expect(put.body.maskedHint).toBeTruthy()
    expect(JSON.stringify(put.body)).not.toContain(
      'vidtory_test_secret_key_for_admin_ui',
    )

    const status = await inject(app, {
      method: 'GET',
      url: '/api/admin/settings/vidtory',
      cookies: adminCookie,
    })
    expect(status.status).toBe(200)
    expect(status.body.configured).toBe(true)
    expect(status.body.apiKey).toBeUndefined()
    expect(JSON.stringify(status.body)).not.toContain(
      'vidtory_test_secret_key_for_admin_ui',
    )

    const tLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/adult',
      payload: {
        email: 'teacher@demo.aikids.local',
        password: 'TeacherDemo1!',
      },
    })
    const denied = await inject(app, {
      method: 'PUT',
      url: '/api/admin/settings/vidtory',
      cookies: { aikids_session: tLogin.session! },
      payload: { apiKey: 'should_not_work_key_xx' },
    })
    expect(denied.status).toBe(403)

    // Admin can save weighted model routing (no secret in response)
    const routePut = await inject(app, {
      method: 'PUT',
      url: '/api/admin/settings/vidtory',
      cookies: adminCookie,
      payload: {
        routing: {
          baseURL: 'https://bapi.vidtory.net',
          image: {
            aspectRatio: 'IMAGE_ASPECT_RATIO_LANDSCAPE',
            resolution: '1K',
            models: [
              { modelId: 'gemini-3.1-flash-image-preview', weight: 40, label: 'A' },
              { modelId: 'premium-image-model', weight: 60, label: 'B' },
            ],
          },
          video: {
            aspectRatio: 'VIDEO_ASPECT_RATIO_LANDSCAPE',
            duration: 6,
            models: [
              {
                modelId: 'veo-3.1-fast-generate-001',
                weight: 40,
                label: 'Veo Fast',
              },
              {
                modelId: 'veo-premium-id',
                weight: 60,
                label: 'Veo Premium',
              },
            ],
          },
        },
      },
    })
    expect(routePut.status).toBe(200)
    const routing = routePut.body.routing as {
      baseURL: string
      image: { models: Array<{ modelId: string; weight: number }> }
      video: { models: Array<{ modelId: string; weight: number }> }
    }
    expect(routing.baseURL).toBe('https://bapi.vidtory.net')
    expect(routing.image.models).toHaveLength(2)
    expect(routing.image.models.some((m) => m.weight === 40)).toBe(true)
    // % applies to different modelIds — not t2v/i2v rows
    expect(routing.video.models.map((m) => m.modelId).sort()).toEqual([
      'veo-3.1-fast-generate-001',
      'veo-premium-id',
    ])
    const percents = routePut.body.imagePercents as Array<{ percent: number }>
    expect(percents.map((p) => p.percent).sort()).toEqual([40, 60])
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

  it('Phase 5: teacher archive/restore lecture + reorder; catalog hides archived', async () => {
    const tLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/adult',
      payload: {
        email: 'teacher@demo.aikids.local',
        password: 'TeacherDemo1!',
      },
    })
    expect(tLogin.status).toBe(200)
    const tCookie = { aikids_session: tLogin.session! }

    const lectures = await inject(app, {
      method: 'GET',
      url: '/api/teacher/lectures',
      cookies: tCookie,
    })
    expect(lectures.status).toBe(200)
    const courses = lectures.body.courses as Array<{
      id: string
      lectures: Array<{ id: string; order: number; archived?: boolean }>
    }>
    expect(courses.length).toBeGreaterThan(0)
    const course = courses[0]!
    expect(course.lectures.length).toBeGreaterThan(1)
    const target = course.lectures.find((l) => !l.archived) ?? course.lectures[0]!

    const edited = await inject(app, {
      method: 'PATCH',
      url: `/api/teacher/lectures/${target.id}`,
      cookies: tCookie,
      payload: {
        goals: ['Phân biệt được hai dấu hiệu quan trọng'],
        concept: 'Máy học từ nhiều ví dụ và trẻ luôn cần kiểm tra kết quả.',
        example: 'Con thử phân loại đồ chơi theo màu rồi kiểm tra món khó.',
        gameType: 'match',
        gameInstruction: 'Ghép từng ví dụ với nhóm phù hợp rồi giải thích lựa chọn.',
        gameOutcome: 'Nhận ra cách ví dụ ảnh hưởng đến kết quả',
        gameCards: ['Dữ liệu rõ ràng', 'Kết quả phù hợp'],
        practiceInstruction: 'Tạo một sản phẩm nhỏ, thử lại và ghi một điều con đã sửa.',
        product: 'Bản thử có ghi chú cải thiện',
        checkQuestion: 'Khi kết quả chưa đúng, con nên làm gì?',
        checkOptions: ['Bỏ qua', 'Kiểm tra ví dụ và thử lại', 'Chia sẻ thông tin riêng'],
        correctIndex: 1,
        checkExplain: 'Kiểm tra ví dụ và thử lại giúp sản phẩm tốt hơn.',
      },
    })
    expect(edited.status).toBe(200)
    const editedLecture = edited.body.lecture as {
      gameType: string
      product: string
      checkOptions: string[]
    }
    expect(editedLecture.gameType).toBe('match')
    expect(editedLecture.product).toBe('Bản thử có ghi chú cải thiện')
    expect(editedLecture.checkOptions).toHaveLength(3)

    const archived = await inject(app, {
      method: 'DELETE',
      url: `/api/teacher/lectures/${target.id}`,
      cookies: tCookie,
    })
    expect(archived.status).toBe(200)
    expect((archived.body.lecture as { archived: boolean }).archived).toBe(true)

    // Student catalog must not list archived quest
    const sLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/student',
      payload: { nickname: 'SaoMay', avatarId: 'avatar-star' },
    })
    expect(sLogin.status).toBe(200)
    const courseDetail = await inject(app, {
      method: 'GET',
      url: `/api/courses/${course.id}`,
      cookies: { aikids_session: sLogin.session! },
    })
    expect(courseDetail.status).toBe(200)
    const publicQuests = (
      courseDetail.body.course as { quests: Array<{ id: string }> }
    ).quests
    expect(publicQuests.some((q) => q.id === target.id)).toBe(false)

    const restored = await inject(app, {
      method: 'POST',
      url: `/api/teacher/lectures/${target.id}/restore`,
      cookies: tCookie,
    })
    expect(restored.status).toBe(200)
    expect((restored.body.lecture as { archived: boolean }).archived).toBe(false)

    // Reorder: reverse first two active lectures
    const ordered = course.lectures.map((l) => l.id)
    if (ordered.length >= 2) {
      const swapped = [...ordered]
      ;[swapped[0], swapped[1]] = [swapped[1]!, swapped[0]!]
      const reorder = await inject(app, {
        method: 'POST',
        url: '/api/teacher/lectures/reorder',
        cookies: tCookie,
        payload: { courseId: course.id, orderedQuestIds: swapped },
      })
      expect(reorder.status).toBe(200)
      const after = reorder.body.lectures as Array<{ id: string; order: number }>
      expect(after[0]?.id).toBe(swapped[0])
      expect(after[0]?.order).toBe(1)
      expect(after[1]?.id).toBe(swapped[1])
      expect(after[1]?.order).toBe(2)
    }

    const stats = await inject(app, {
      method: 'GET',
      url: '/api/teacher/class/stats',
      cookies: tCookie,
    })
    expect(stats.status).toBe(200)
    if (stats.body.stats) {
      const students = (stats.body.stats as {
        students: Array<{ needsSupport: boolean; lastActiveAt: string | null }>
      }).students
      expect(students.every((student) => typeof student.needsSupport === 'boolean')).toBe(true)
    }
  })

  it('Family model: parent plan seats, create child, enter as child, enroll gate', async () => {
    // Isolated household (do not reuse demo parent — seats may be full)
    const email = `family-parent-${Date.now()}@demo.aikids.local`
    const reg = await inject(app, {
      method: 'POST',
      url: '/api/auth/register/adult',
      payload: {
        role: 'parent',
        email,
        password: 'FamilyTest1!',
        nickname: 'BaMeFamily',
      },
    })
    expect(reg.status).toBe(201)
    const pCookie = { aikids_session: reg.session! }

    const plans = await inject(app, {
      method: 'GET',
      url: '/api/parent/plans',
      cookies: pCookie,
    })
    expect(plans.status).toBe(200)
    const planList = plans.body.plans as Array<{ code: string }>
    expect(planList.some((p) => p.code === 'free')).toBe(true)

    const sub = await inject(app, {
      method: 'GET',
      url: '/api/parent/subscription',
      cookies: pCookie,
    })
    expect(sub.status).toBe(200)
    expect((sub.body.subscription as { planCode: string }).planCode).toBe(
      'free',
    )

    // Free = 1 seat — first child OK
    const nick = `BeTest${Date.now().toString().slice(-6)}`
    const created = await inject(app, {
      method: 'POST',
      url: '/api/parent/children',
      cookies: pCookie,
      payload: {
        nickname: nick,
        avatarId: 'avatar-star',
        pin: '424242',
      },
    })
    expect(created.status).toBe(201)
    const childId = (created.body.child as { id: string }).id

    // Second child on free plan → 402 seat limit
    const blocked = await inject(app, {
      method: 'POST',
      url: '/api/parent/children',
      cookies: pCookie,
      payload: {
        nickname: `${nick}2`,
        avatarId: 'avatar-cat',
      },
    })
    expect(blocked.status).toBe(402)

    // Upgrade Plus → more seats
    const upgrade = await inject(app, {
      method: 'POST',
      url: '/api/parent/subscription',
      cookies: pCookie,
      payload: { planCode: 'plus' },
    })
    expect(upgrade.status).toBe(200)

    // Enter as child (parent session becomes student)
    const entered = await inject(app, {
      method: 'POST',
      url: `/api/parent/children/${childId}/enter`,
      cookies: pCookie,
      payload: { pin: '424242' },
    })
    expect(entered.status).toBe(200)
    expect((entered.body.user as { role: string }).role).toBe('student')
    const childSession = entered.session!
    expect(childSession).toBeTruthy()

    const courses = await inject(app, {
      method: 'GET',
      url: '/api/courses',
      cookies: { aikids_session: childSession },
    })
    expect(courses.status).toBe(200)
    const open = (
      courses.body.courses as Array<{ id: string; status: string }>
    ).find((c) => c.status === 'open')
    if (open) {
      const en = await inject(app, {
        method: 'POST',
        url: '/api/enrollments',
        cookies: { aikids_session: childSession },
        payload: { courseId: open.id },
      })
      expect(en.status).toBe(201)
    }

    const badPin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/student',
      payload: {
        nickname: nick,
        avatarId: 'avatar-star',
        pin: '000000',
        createIfMissing: false,
      },
    })
    expect(badPin.status).toBe(401)
  })

  it('Phase 5: admin analytics, sessions, course PATCH, soft-delete user', async () => {
    const aLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/adult',
      payload: {
        email: 'admin@demo.aikids.local',
        password: 'AdminDemo1!',
      },
    })
    expect(aLogin.status).toBe(200)
    const adminCookie = { aikids_session: aLogin.session! }

    const analytics = await inject(app, {
      method: 'GET',
      url: '/api/admin/analytics',
      cookies: adminCookie,
    })
    expect(analytics.status).toBe(200)
    const a = analytics.body.analytics as {
      users: { active: number }
      courses: { open: number; soon: number }
      sessions: { active: number }
      trends: Array<{
        date: string
        newUsers: number
        completedQuests: number
        projects: number
      }>
    }
    expect(a.users.active).toBeGreaterThan(0)
    expect(typeof a.courses.open).toBe('number')
    expect(a.sessions.active).toBeGreaterThan(0)
    expect(a.trends).toHaveLength(14)
    expect(a.trends.every((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.date))).toBe(true)

    const sessions = await inject(app, {
      method: 'GET',
      url: '/api/admin/sessions',
      cookies: adminCookie,
    })
    expect(sessions.status).toBe(200)
    const sessionList = sessions.body.sessions as Array<{ id: string }>
    expect(Array.isArray(sessionList)).toBe(true)

    const courses = await inject(app, {
      method: 'GET',
      url: '/api/admin/courses',
      cookies: adminCookie,
    })
    expect(courses.status).toBe(200)
    const list = courses.body.courses as Array<{ id: string; status: string }>
    expect(list.length).toBeGreaterThan(0)
    const first = list[0]!
    const nextStatus = first.status === 'open' ? 'soon' : 'open'
    const patched = await inject(app, {
      method: 'PATCH',
      url: `/api/admin/courses/${first.id}`,
      cookies: adminCookie,
      payload: { status: nextStatus },
    })
    expect(patched.status).toBe(200)
    // restore original status
    await inject(app, {
      method: 'PATCH',
      url: `/api/admin/courses/${first.id}`,
      cookies: adminCookie,
      payload: { status: first.status },
    })

    // Create temp adult then soft-delete
    const email = `phase5-temp-${Date.now()}@demo.aikids.local`
    const created = await inject(app, {
      method: 'POST',
      url: '/api/admin/users',
      cookies: adminCookie,
      payload: {
        role: 'teacher',
        email,
        password: 'TempTeacher1!',
        nickname: 'TempGV',
      },
    })
    expect(created.status).toBe(201)
    const uid = (created.body.user as { id: string }).id
    const soft = await inject(app, {
      method: 'DELETE',
      url: `/api/admin/users/${uid}`,
      cookies: adminCookie,
    })
    expect(soft.status).toBe(200)
    expect(soft.body.softDeleted).toBe(true)

    // Teacher cannot hit admin analytics
    const tLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/adult',
      payload: {
        email: 'teacher@demo.aikids.local',
        password: 'TeacherDemo1!',
      },
    })
    const denied = await inject(app, {
      method: 'GET',
      url: '/api/admin/analytics',
      cookies: { aikids_session: tLogin.session! },
    })
    expect(denied.status).toBe(403)
  })
})
