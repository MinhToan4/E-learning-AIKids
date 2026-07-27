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
    // The URL has already passed the isolated-database guard above. Resetting
    // prevents a failed or repeated run from leaking fixtures into the next run.
    execSync('npx prisma db push --force-reset --skip-generate', {
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

    const unconfiguredPathway = await inject(app, {
      method: 'GET',
      url: '/api/learning/pathway',
      cookies,
    })
    expect(unconfiguredPathway.status).toBe(200)
    expect(unconfiguredPathway.body.ageExperienceStatus).toBe(
      'configuration_required',
    )
    expect(unconfiguredPathway.body.configurationReason).toBe(
      'BIRTH_DATE_REQUIRED',
    )
    expect(unconfiguredPathway.body.courses).toEqual([])

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
    const requiredTwelve = open.filter((course) =>
      /^l[12]-k[1-6]-/.test(course.id),
    )
    expect(open.length).toBeGreaterThanOrEqual(12)
    expect(requiredTwelve.filter((c) => c.ageTrack === 'L1')).toHaveLength(6)
    expect(requiredTwelve.filter((c) => c.ageTrack === 'L2')).toHaveLength(6)
    expect(
      requiredTwelve.reduce(
        (total, course) => total + course.quests.length,
        0,
      ),
    ).toBe(146)

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
    const k2Course = k2.body.course as {
        quests: Array<{ practiceKind: string; stations?: { stations: unknown[] } }>
        recognition: { issuer: string }
      }
    const k2quests = k2Course.quests
    expect(k2quests.some((q) => q.practiceKind === 'character')).toBe(true)
    expect(k2quests.some((q) => q.practiceKind === 'ai_pick')).toBe(true)
    expect(k2quests[0]?.stations?.stations?.length).toBeGreaterThanOrEqual(4)
    expect(k2Course.recognition.issuer).toBe('AI Kids Creator Academy')

    const k4 = await inject(app, {
      method: 'GET',
      url: '/api/courses/l1-k4-truyen-tranh',
      cookies,
    })
    const k4quests = (
      k4.body.course as { quests: Array<{ practiceKind: string }> }
    ).quests
    expect(k4quests.some((q) => q.practiceKind === 'comic')).toBe(true)

    const blockedStandaloneStart = await inject(app, {
      method: 'POST',
      url: '/api/progress/l1-k1-q1/start',
      cookies,
    })
    expect(blockedStandaloneStart.status).toBe(200)

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

  it('credential revoke and reissue preserve an auditable history chain', async () => {
    const adminLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/adult',
      payload: {
        email: 'admin@demo.aikids.local',
        password: 'AdminDemo1!',
      },
    })
    expect(adminLogin.status).toBe(200)
    const cookies = { aikids_session: adminLogin.session! }
    const { prisma } = await import('../infrastructure/database/prisma.js')
    const student = await prisma.user.findFirstOrThrow({
      where: { role: 'student', active: true },
      select: { id: true },
    })
    const code = `integration-badge-${Date.now()}`
    const templateResponse = await inject(app, {
      method: 'POST',
      url: '/api/admin/credential-templates',
      cookies,
      payload: {
        code,
        kind: 'badge',
        name: 'Integration badge',
        layout: {
          title: 'Integration badge',
          issuerName: 'AI Kids Creator Academy',
          accentColor: '#6D5BD0',
          backgroundUrl: 'https://example.com/customer-approved-badge.png',
          bodyTemplate: 'Hoàn thành điều kiện huy hiệu tích hợp.',
          allowDownload: true,
          allowShare: false,
          publicDisplayName: false,
        },
        status: 'published',
        reason: 'Kiểm thử chuỗi cấp lại',
      },
    })
    expect(templateResponse.status).toBe(201)
    const templateId = (
      templateResponse.body.template as { id: string }
    ).id

    const ruleResponse = await inject(app, {
      method: 'POST',
      url: '/api/admin/credential-rules',
      cookies,
      payload: {
        courseId: 'l1-k1-the-gioi',
        templateId,
        kind: 'badge',
        minCompletionPercent: 0,
        requirePassedAssessment: false,
        requiredSkillLevels: {},
        status: 'published',
        reason: 'Kiểm thử điều kiện cấp lại',
      },
    })
    expect(ruleResponse.status).toBe(201)

    const firstIssue = await inject(app, {
      method: 'POST',
      url: '/api/credentials/issue',
      cookies,
      payload: {
        studentId: student.id,
        courseId: 'l1-k1-the-gioi',
        reason: 'Cấp lần đầu để kiểm thử',
      },
    })
    expect(firstIssue.status).toBe(201)
    const first = (
      firstIssue.body.credentials as Array<{
        id: string
        verificationCode: string
      }>
    )[0]!

    const revoked = await inject(app, {
      method: 'POST',
      url: `/api/admin/credentials/${first.id}/revoke`,
      cookies,
      payload: { reason: 'Thu hồi để kiểm thử cấp lại' },
    })
    expect(revoked.status).toBe(200)
    expect((revoked.body.credential as { status: string }).status).toBe(
      'revoked',
    )

    const secondIssue = await inject(app, {
      method: 'POST',
      url: '/api/credentials/issue',
      cookies,
      payload: {
        studentId: student.id,
        courseId: 'l1-k1-the-gioi',
        reason: 'Cấp lại sau khi thu hồi',
      },
    })
    expect(secondIssue.status).toBe(201)
    const second = (
      secondIssue.body.credentials as Array<{
        id: string
        verificationCode: string
        supersedesCredentialId: string | null
      }>
    )[0]!
    expect(second.id).not.toBe(first.id)
    expect(second.verificationCode).not.toBe(first.verificationCode)
    expect(second.supersedesCredentialId).toBe(first.id)

    const oldVerification = await inject(app, {
      method: 'GET',
      url: `/api/public/credentials/${first.verificationCode}`,
    })
    expect(oldVerification.status).toBe(403)
    expect(oldVerification.body.valid).toBe(false)
    expect(oldVerification.body.status).toBe('sharing_disabled')
    const oldRecord = await prisma.issuedCredential.findUniqueOrThrow({
      where: { id: first.id },
    })
    expect(oldRecord.status).toBe('revoked')
  })

  it('a published teacher observation becomes traceable competency evidence', async () => {
    const adminLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/adult',
      payload: {
        email: 'admin@demo.aikids.local',
        password: 'AdminDemo1!',
      },
    })
    const adminCookies = { aikids_session: adminLogin.session! }
    const suffix = Date.now().toString()
    const frameworkResponse = await inject(app, {
      method: 'POST',
      url: '/api/admin/competency/frameworks',
      cookies: adminCookies,
      payload: {
        code: `integration-framework-${suffix}`,
        name: 'Khung kiểm thử tích hợp',
        description: 'Chỉ dùng trong cơ sở dữ liệu kiểm thử cô lập.',
        expectedDomainCount: 4,
        sourceReference: 'integration-test',
        alignmentStatement: 'Phù hợp dữ liệu kiểm thử nội bộ.',
        disclaimer: 'Không phải cấu hình nghiệp vụ production.',
        status: 'published',
        reason: 'Kiểm thử minh chứng nhận xét',
        domains: [1, 2, 3, 4].map((index) => ({
          code: `d${index}`,
          name: `Miền ${index}`,
          description: `Miền kiểm thử số ${index}`,
          sortOrder: index,
          skills: [
            {
              code: `d${index}.s1`,
              name: `Kỹ năng ${index}`,
              description: `Kỹ năng kiểm thử số ${index}`,
              learnerLabel: `Kỹ năng ${index}`,
              levelPolicy: { notMetBelow: 40, achievedFrom: 80 },
              sortOrder: 1,
            },
          ],
        })),
      },
    })
    expect(frameworkResponse.status).toBe(201)
    const framework = frameworkResponse.body.framework as {
      id: string
      domains: Array<{ skills: Array<{ id: string }> }>
    }
    const mappedSkillId = framework.domains[0]!.skills[0]!.id

    const mappingResponse = await inject(app, {
      method: 'POST',
      url: '/api/admin/competency/mapping-versions',
      cookies: adminCookies,
      payload: {
        frameworkId: framework.id,
        calculationPolicy: {
          aggregation: 'weighted_average',
          attemptStrategy: 'latest',
          notMetBelow: 40,
          achievedFrom: 80,
        },
        status: 'published',
        reason: 'Kiểm thử mapping nhận xét',
        mappings: [
          {
            skillId: mappedSkillId,
            sourceType: 'course',
            sourceId: 'l1-k1-the-gioi',
            evidenceType: 'teacher_observation',
            weight: 1,
          },
        ],
      },
    })
    expect(mappingResponse.status).toBe(201)

    const { prisma } = await import('../infrastructure/database/prisma.js')
    const [teacher, student] = await Promise.all([
      prisma.user.findUniqueOrThrow({
        where: { email: 'teacher@demo.aikids.local' },
        select: { id: true },
      }),
      prisma.user.findFirstOrThrow({
        where: { role: 'student', active: true },
        select: { id: true },
      }),
    ])
    const classroom = await prisma.classRoom.create({
      data: {
        name: 'Lớp kiểm thử nhận xét',
        code: `OBS-${suffix}`,
        teacherId: teacher.id,
        courseId: 'l1-k1-the-gioi',
        classType: 'group',
        allowedAgeBands: ['9_11'],
        minLevel: 1,
        maxLevel: 100,
        capacity: 12,
        status: 'active',
        memberships: { create: { studentId: student.id } },
      },
    })
    expect(classroom.id).toBeTruthy()
    const teacherLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/adult',
      payload: {
        email: 'teacher@demo.aikids.local',
        password: 'TeacherDemo1!',
      },
    })
    const teacherCookies = { aikids_session: teacherLogin.session! }

    const missingScore = await inject(app, {
      method: 'POST',
      url: '/api/teacher/observations',
      cookies: teacherCookies,
      payload: {
        studentId: student.id,
        courseId: 'l1-k1-the-gioi',
        body: 'Nhận xét đủ điều kiện kiểm thử.',
        strengths: ['Biết giải thích lựa chọn.'],
        development: ['Tiếp tục luyện tập.'],
        status: 'published',
      },
    })
    expect(missingScore.status).toBe(400)

    const draft = await inject(app, {
      method: 'POST',
      url: '/api/teacher/observations',
      cookies: teacherCookies,
      payload: {
        studentId: student.id,
        courseId: 'l1-k1-the-gioi',
        body: 'Bản nháp nhận xét để tiếp tục hoàn thiện sau.',
        strengths: ['Chủ động thử nghiệm.'],
        development: ['Cần giải thích rõ lựa chọn.'],
        status: 'draft',
      },
    })
    expect(draft.status).toBe(201)
    const draftObservation = draft.body.observation as {
      id: string
      version: number
    }

    const learningOverview = await inject(app, {
      method: 'GET',
      url: `/api/teacher/students/${student.id}/learning-overview`,
      cookies: teacherCookies,
    })
    expect(learningOverview.status).toBe(200)
    expect(
      (
        learningOverview.body.observations as Array<{
          id: string
          status: string
        }>
      ).some(
        (observation) =>
          observation.id === draftObservation.id &&
          observation.status === 'draft',
      ),
    ).toBe(true)

    const adminCannotPublishTeacherDraft = await inject(app, {
      method: 'PATCH',
      url: `/api/teacher/observations/${draftObservation.id}`,
      cookies: { aikids_session: adminLogin.session! },
      payload: {
        version: draftObservation.version,
        scorePercent: 82,
        status: 'published',
      },
    })
    expect(adminCannotPublishTeacherDraft.status).toBe(403)

    const publishedDraft = await inject(app, {
      method: 'PATCH',
      url: `/api/teacher/observations/${draftObservation.id}`,
      cookies: teacherCookies,
      payload: {
        version: draftObservation.version,
        scorePercent: 82,
        status: 'published',
      },
    })
    expect(publishedDraft.status).toBe(200)
    expect(
      (publishedDraft.body.observation as { status: string }).status,
    ).toBe('published')

    const observationBody =
      'Học viên chủ động giải thích lựa chọn, biết lắng nghe phản hồi và điều chỉnh sản phẩm sau khi tự kiểm tra. '
        .repeat(2)
        .trim()
    expect(observationBody.length).toBeGreaterThan(80)
    const published = await inject(app, {
      method: 'POST',
      url: '/api/teacher/observations',
      cookies: teacherCookies,
      payload: {
        studentId: student.id,
        courseId: 'l1-k1-the-gioi',
        body: observationBody,
        strengths: ['Biết giải thích lựa chọn.'],
        development: ['Tiếp tục luyện tập.'],
        scorePercent: 85,
        status: 'published',
      },
    })
    expect(published.status).toBe(201)
    const observationId = (
      published.body.observation as { id: string }
    ).id
    const [evidence, snapshot] = await Promise.all([
      prisma.competencyEvidence.findFirst({
        where: {
          sourceType: 'teacher_observation',
          sourceId: observationId,
          skillId: mappedSkillId,
        },
      }),
      prisma.competencySnapshot.findFirst({
        where: {
          studentId: student.id,
          skillId: mappedSkillId,
          current: true,
        },
      }),
    ])
    expect(evidence?.scorePercent).toBe(85)
    expect(evidence?.sourceVersion).toBe(1)
    expect(snapshot?.scorePercent).toBe(85)
    expect(snapshot?.level).toBe('achieved')

    const piiObservation = await inject(app, {
      method: 'POST',
      url: '/api/teacher/observations',
      cookies: teacherCookies,
      payload: {
        studentId: student.id,
        courseId: 'l1-k1-the-gioi',
        body: `${observationBody} parent@example.com`,
        strengths: ['Biết giải thích lựa chọn.'],
        development: ['Tiếp tục luyện tập.'],
        scorePercent: 85,
        status: 'published',
      },
    })
    expect(piiObservation.status).toBe(400)
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
      payload: {
        nickname: 'SaoMay',
        avatarId: 'avatar-star',
        createIfMissing: true,
      },
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

    const invalidBirthDate = await inject(app, {
      method: 'POST',
      url: '/api/parent/children',
      cookies: pCookie,
      payload: {
        nickname: 'QuaNho',
        avatarId: 'avatar-star',
        birthDate: '2024-01-01',
      },
    })
    expect(invalidBirthDate.status).toBe(400)

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
        birthDate: '2016-08-15',
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
        birthDate: '2017-08-15',
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

  it('portfolio sharing keeps one pending request and prevents stale decision reversal', async () => {
    const suffix = Date.now().toString().slice(-8)
    const parentEmail = `share-parent-${suffix}@demo.aikids.local`
    const parent = await inject(app, {
      method: 'POST',
      url: '/api/auth/register/adult',
      payload: {
        role: 'parent',
        email: parentEmail,
        password: 'ShareTest1!',
        nickname: 'BaMeShare',
      },
    })
    expect(parent.status).toBe(201)
    let parentCookies = { aikids_session: parent.session! }

    const child = await inject(app, {
      method: 'POST',
      url: '/api/parent/children',
      cookies: parentCookies,
      payload: {
        nickname: `BeShare${suffix}`,
        avatarId: 'avatar-star',
        pin: '535353',
        birthDate: '2016-08-15',
      },
    })
    expect(child.status).toBe(201)
    const childId = (child.body.child as { id: string }).id

    const entered = await inject(app, {
      method: 'POST',
      url: `/api/parent/children/${childId}/enter`,
      cookies: parentCookies,
      payload: { pin: '535353' },
    })
    expect(entered.status).toBe(200)
    const childCookies = { aikids_session: entered.session! }

    const { prisma } = await import('../infrastructure/database/prisma.js')
    const project = await prisma.project.create({
      data: {
        userId: childId,
        title: 'Truyện của con',
        kind: 'comic',
        thumbnail: '/assets/designer/lobby/art-comic.jpeg',
        private: true,
        shareStatus: 'private',
      },
    })

    const first = await inject(app, {
      method: 'POST',
      url: `/api/projects/${project.id}/request-share`,
      cookies: childCookies,
      payload: { destination: 'family' },
    })
    expect(first.status).toBe(201)
    const firstApproval = first.body.approval as {
      id: string
      status: string
    }

    const duplicate = await inject(app, {
      method: 'POST',
      url: `/api/projects/${project.id}/request-share`,
      cookies: childCookies,
      payload: { destination: 'family' },
    })
    expect(duplicate.status).toBe(200)
    expect((duplicate.body.approval as { id: string }).id).toBe(
      firstApproval.id,
    )

    const parentLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/adult',
      payload: {
        email: parentEmail,
        password: 'ShareTest1!',
      },
    })
    expect(parentLogin.status).toBe(200)
    parentCookies = { aikids_session: parentLogin.session! }

    const pending = await inject(app, {
      method: 'GET',
      url: '/api/parent/approvals?status=pending',
      cookies: parentCookies,
    })
    expect(pending.status).toBe(200)
    expect(
      (
        pending.body.approvals as Array<{
          id: string
          project: { id: string }
        }>
      ).filter((approval) => approval.project.id === project.id),
    ).toHaveLength(1)

    const approved = await inject(app, {
      method: 'POST',
      url: `/api/parent/approvals/${firstApproval.id}/decide`,
      cookies: parentCookies,
      payload: { decision: 'approved' },
    })
    expect(approved.status).toBe(200)

    const retry = await inject(app, {
      method: 'POST',
      url: `/api/parent/approvals/${firstApproval.id}/decide`,
      cookies: parentCookies,
      payload: { decision: 'approved' },
    })
    expect(retry.status).toBe(200)

    const staleReverse = await inject(app, {
      method: 'POST',
      url: `/api/parent/approvals/${firstApproval.id}/decide`,
      cookies: parentCookies,
      payload: { decision: 'rejected' },
    })
    expect(staleReverse.status).toBe(409)

    const storedProject = await prisma.project.findUniqueOrThrow({
      where: { id: project.id },
      select: { private: true, shareStatus: true },
    })
    expect(storedProject).toEqual({
      private: false,
      shareStatus: 'shared',
    })
  })

  it('notifications stay owner-scoped and a shared device token follows the current account', async () => {
    const suffix = Date.now().toString().slice(-8)
    const first = await inject(app, {
      method: 'POST',
      url: '/api/auth/register/adult',
      payload: {
        role: 'parent',
        email: `notify-a-${suffix}@demo.aikids.local`,
        password: 'NotifyTest1!',
        nickname: 'PhuHuynhA',
      },
    })
    const second = await inject(app, {
      method: 'POST',
      url: '/api/auth/register/adult',
      payload: {
        role: 'parent',
        email: `notify-b-${suffix}@demo.aikids.local`,
        password: 'NotifyTest1!',
        nickname: 'PhuHuynhB',
      },
    })
    expect(first.status).toBe(201)
    expect(second.status).toBe(201)
    const firstCookies = { aikids_session: first.session! }
    const secondCookies = { aikids_session: second.session! }
    const firstUserId = (first.body.user as { id: string }).id
    const secondUserId = (second.body.user as { id: string }).id

    const { prisma } = await import('../infrastructure/database/prisma.js')
    const [firstNotification, secondNotification] =
      await prisma.$transaction([
        prisma.notification.create({
          data: {
            userId: firstUserId,
            type: 'test',
            title: 'Thông báo A',
            body: 'Chỉ tài khoản A được đọc.',
          },
        }),
        prisma.notification.create({
          data: {
            userId: secondUserId,
            type: 'test',
            title: 'Thông báo B',
            body: 'Chỉ tài khoản B được đọc.',
          },
        }),
      ])

    const listed = await inject(app, {
      method: 'GET',
      url: '/api/notifications?limit=10',
      cookies: firstCookies,
    })
    expect(listed.status).toBe(200)
    const listedIds = (
      listed.body.notifications as Array<{ id: string }>
    ).map((notification) => notification.id)
    expect(listedIds).toContain(firstNotification.id)
    expect(listedIds).not.toContain(secondNotification.id)

    const crossAccountRead = await inject(app, {
      method: 'PATCH',
      url: `/api/notifications/${secondNotification.id}/read`,
      cookies: firstCookies,
    })
    expect(crossAccountRead.status).toBe(404)

    const ownRead = await inject(app, {
      method: 'PATCH',
      url: `/api/notifications/${firstNotification.id}/read`,
      cookies: firstCookies,
    })
    expect(ownRead.status).toBe(200)

    const sharedToken = `shared-device-token-${suffix}-0123456789`
    const firstDevice = await inject(app, {
      method: 'POST',
      url: '/api/notifications/devices',
      cookies: firstCookies,
      payload: { token: sharedToken, platform: 'web' },
    })
    expect(firstDevice.status).toBe(201)

    const transferredDevice = await inject(app, {
      method: 'POST',
      url: '/api/notifications/devices',
      cookies: secondCookies,
      payload: { token: sharedToken, platform: 'web' },
    })
    expect(transferredDevice.status).toBe(201)

    const staleOwnerDisable = await inject(app, {
      method: 'DELETE',
      url: '/api/notifications/devices',
      cookies: firstCookies,
      payload: { token: sharedToken },
    })
    expect(staleOwnerDisable.status).toBe(200)
    expect(staleOwnerDisable.body.disabled).toBe(0)

    const currentOwnerDisable = await inject(app, {
      method: 'DELETE',
      url: '/api/notifications/devices',
      cookies: secondCookies,
      payload: { token: sharedToken },
    })
    expect(currentOwnerDisable.status).toBe(200)
    expect(currentOwnerDisable.body.disabled).toBe(1)
  })

  it('gamification is learner-only and daily check-in is idempotent', async () => {
    const suffix = Date.now().toString().slice(-8)
    const parent = await inject(app, {
      method: 'POST',
      url: '/api/auth/register/adult',
      payload: {
        role: 'parent',
        email: `game-parent-${suffix}@demo.aikids.local`,
        password: 'GameTest1!',
        nickname: 'BaMeGame',
      },
    })
    expect(parent.status).toBe(201)
    const parentCookies = { aikids_session: parent.session! }

    for (const request of [
      { method: 'GET' as const, url: '/api/gamification/streak' },
      { method: 'POST' as const, url: '/api/gamification/check-in' },
      { method: 'GET' as const, url: '/api/gamification/achievements' },
      { method: 'GET' as const, url: '/api/gamification/daily-mission' },
      { method: 'GET' as const, url: '/api/gamification/class-celebration' },
    ]) {
      const forbidden = await inject(app, {
        ...request,
        cookies: parentCookies,
      })
      expect(forbidden.status).toBe(403)
    }

    const child = await inject(app, {
      method: 'POST',
      url: '/api/parent/children',
      cookies: parentCookies,
      payload: {
        nickname: `BeGame${suffix}`,
        avatarId: 'avatar-cat',
        pin: '646464',
        birthDate: '2016-08-15',
      },
    })
    expect(child.status).toBe(201)
    const childId = (child.body.child as { id: string }).id
    const entered = await inject(app, {
      method: 'POST',
      url: `/api/parent/children/${childId}/enter`,
      cookies: parentCookies,
      payload: { pin: '646464' },
    })
    expect(entered.status).toBe(200)
    const childCookies = { aikids_session: entered.session! }

    const firstCheckIn = await inject(app, {
      method: 'POST',
      url: '/api/gamification/check-in',
      cookies: childCookies,
    })
    expect(firstCheckIn.status).toBe(200)
    expect(firstCheckIn.body.alreadyCheckedIn).toBe(false)
    expect(Number(firstCheckIn.body.current)).toBeGreaterThanOrEqual(1)

    const repeatedCheckIn = await inject(app, {
      method: 'POST',
      url: '/api/gamification/check-in',
      cookies: childCookies,
    })
    expect(repeatedCheckIn.status).toBe(200)
    expect(repeatedCheckIn.body.alreadyCheckedIn).toBe(true)
    expect(repeatedCheckIn.body.current).toBe(firstCheckIn.body.current)

    const mission = await inject(app, {
      method: 'GET',
      url: '/api/gamification/daily-mission',
      cookies: childCookies,
    })
    expect(mission.status).toBe(200)
    expect(
      (mission.body.mission as { action: { route: string } }).action.route,
    ).toMatch(/^\//)
  })

  it('creative workshop uses the standalone API and persists image and story outputs', async () => {
    const suffix = Date.now().toString().slice(-8)
    const student = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/student',
      payload: {
        nickname: `SangTao${suffix}`,
        avatarId: 'avatar-star',
        createIfMissing: true,
      },
    })
    expect(student.status).toBe(200)
    const cookies = { aikids_session: student.session! }

    const {
      setVidtoryClientFactory,
      setVidtoryRoutingOverride,
    } = await import('../infrastructure/generation/vidtory.adapter.js')
    setVidtoryRoutingOverride({
      baseURL: 'https://bapi.vidtory.net',
      image: {
        aspectRatio: 'IMAGE_ASPECT_RATIO_LANDSCAPE',
        resolution: '1K',
        models: [{ modelId: 'integration-image', weight: 100 }],
      },
      video: {
        aspectRatio: 'VIDEO_ASPECT_RATIO_LANDSCAPE',
        duration: 6,
        models: [{ modelId: 'integration-video', weight: 100 }],
      },
    })
    setVidtoryClientFactory(() => ({
      models: {
        generateText: async () => ({
          id: 'story-job',
          result: 'Ngày xưa có một chú mèo tốt bụng luôn giúp đỡ bạn bè.',
        }),
        generateImage: async () => ({
          id: 'image-job',
          result: 'https://cdn.example.test/creative-art.png',
        }),
        generateVideo: async () => ({
          id: 'video-job',
          result: 'https://cdn.example.test/creative-video.mp4',
        }),
      },
    }))

    try {
      const sketch = await inject(app, {
        method: 'POST',
        url: '/api/creative/sketch',
        cookies,
        payload: {
          title: 'Bản phác thảo khu vườn',
          sketchDataUrl: `data:image/png;base64,${'A'.repeat(400)}`,
        },
      })
      expect(sketch.status).toBe(201)
      const sketchAssetId = (sketch.body.asset as { id: string }).id

      const image = await inject(app, {
        method: 'POST',
        url: '/api/creative/create',
        cookies,
        payload: {
          kind: 'art',
          title: 'Khu vườn của con',
          prompt:
            'Một khu vườn vui vẻ với nhiều hoa, các bạn nhỏ cùng chăm cây và quan sát bướm bay trong nắng sớm.',
          details: { styleId: 'watercolor' },
          assetIds: [sketchAssetId],
        },
      })
      expect(image.status).toBe(201)
      expect((image.body.asset as { url: string }).url).toBe(
        'https://cdn.example.test/creative-art.png',
      )

      const story = await inject(app, {
        method: 'POST',
        url: '/api/creative/create',
        cookies,
        payload: {
          kind: 'story',
          title: 'Chú mèo tốt bụng',
          prompt:
            'Viết truyện thiếu nhi bằng tiếng Việt về một chú mèo tốt bụng giúp đỡ bạn bè, cùng nhau giải quyết thử thách và kết thúc tích cực.',
          details: {},
          assetIds: [],
        },
      })
      expect(story.status).toBe(201)
      expect(story.body.content).toContain('chú mèo tốt bụng')

      const backpack = await inject(app, {
        method: 'GET',
        url: '/api/backpack',
        cookies,
      })
      const projects = await inject(app, {
        method: 'GET',
        url: '/api/projects',
        cookies,
      })
      expect(backpack.status).toBe(200)
      expect(projects.status).toBe(200)
      expect(
        (backpack.body.assets as Array<{ name: string }>).some(
          (asset) => asset.name === 'Khu vườn của con',
        ),
      ).toBe(true)
      expect(
        (
          projects.body.projects as Array<{
            kind: string
            content?: string
          }>
        ).some(
          (project) =>
            project.kind === 'creative_story' &&
            project.content?.includes('chú mèo tốt bụng'),
        ),
      ).toBe(true)
    } finally {
      setVidtoryClientFactory(null)
      setVidtoryRoutingOverride(null)
    }
  })

  it('learning tools respect the family enrollment gate and preserve owned data safely', async () => {
    const suffix = Date.now().toString().slice(-8)
    const parentEmail = `learning-parent-${suffix}@demo.aikids.local`
    const parent = await inject(app, {
      method: 'POST',
      url: '/api/auth/register/adult',
      payload: {
        role: 'parent',
        email: parentEmail,
        password: 'LearningTest1!',
        nickname: `BaMe${suffix}`,
      },
    })
    expect(parent.status).toBe(201)
    const parentCookies = { aikids_session: parent.session! }

    const child = await inject(app, {
      method: 'POST',
      url: '/api/parent/children',
      cookies: parentCookies,
      payload: {
        nickname: `Hoc${suffix}`,
        avatarId: 'avatar-star',
        pin: '535353',
        birthDate: '2018-08-15',
      },
    })
    expect(child.status).toBe(201)
    const childId = (child.body.child as { id: string }).id

    const entered = await inject(app, {
      method: 'POST',
      url: `/api/parent/children/${childId}/enter`,
      cookies: parentCookies,
      payload: { pin: '535353' },
    })
    expect(entered.status).toBe(200)
    const studentCookies = { aikids_session: entered.session! }

    const enrollment = await inject(app, {
      method: 'POST',
      url: '/api/enrollments',
      cookies: studentCookies,
      payload: { courseId: 'l1-k1-the-gioi' },
    })
    expect(enrollment.status).toBe(201)

    const enrolledProgress = await inject(app, {
      method: 'GET',
      url: '/api/progress/l1-k1-the-gioi',
      cookies: studentCookies,
    })
    expect(enrolledProgress.status).toBe(200)
    const enrolledQuestId = (
      enrolledProgress.body.quests as Array<{
        id: string
        status: string
      }>
    ).find((quest) => quest.status === 'available')?.id
    expect(enrolledQuestId).toBeTruthy()

    const started = await inject(app, {
      method: 'POST',
      url: `/api/progress/${enrolledQuestId}/start`,
      cookies: studentCookies,
    })
    expect(started.status).toBe(200)
    expect(started.body.progress.phase).toBe('learn')

    const skippedGame = await inject(app, {
      method: 'POST',
      url: `/api/progress/${enrolledQuestId}/advance`,
      cookies: studentCookies,
      payload: { fromPhase: 'practice' },
    })
    expect(skippedGame.status).toBe(409)
    expect(skippedGame.body.reason).toBe('phase_mismatch')

    const toGame = await inject(app, {
      method: 'POST',
      url: `/api/progress/${enrolledQuestId}/advance`,
      cookies: studentCookies,
      payload: { fromPhase: 'learn' },
    })
    expect(toGame.status).toBe(200)
    expect(toGame.body.phase).toBe('game')

    const resumed = await inject(app, {
      method: 'POST',
      url: `/api/progress/${enrolledQuestId}/start`,
      cookies: studentCookies,
    })
    expect(resumed.body.progress.phase).toBe('game')

    const toPractice = await inject(app, {
      method: 'POST',
      url: `/api/progress/${enrolledQuestId}/advance`,
      cookies: studentCookies,
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

    const unenrolledProgress = await inject(app, {
      method: 'GET',
      url: '/api/progress/l1-k2-nhan-vat',
      cookies: studentCookies,
    })
    expect(unenrolledProgress.status).toBe(200)
    const unenrolledQuestId = (
      unenrolledProgress.body.quests as Array<{
        id: string
        status: string
      }>
    ).find((quest) => quest.status === 'available')?.id
    expect(unenrolledQuestId).toBeTruthy()

    const allowedAutoEnrollment = await inject(app, {
      method: 'POST',
      url: `/api/progress/${unenrolledQuestId}/start`,
      cookies: studentCookies,
    })
    expect(allowedAutoEnrollment.status).toBe(200)

    const blockedCourseProgress = await inject(app, {
      method: 'GET',
      url: '/api/progress/l1-k3-ke-chuyen',
      cookies: studentCookies,
    })
    expect(blockedCourseProgress.status).toBe(200)
    const blockedQuestId = (
      blockedCourseProgress.body.quests as Array<{
        id: string
        status: string
      }>
    ).find((quest) => quest.status === 'available')?.id
    expect(blockedQuestId).toBeTruthy()

    const bypassedEnrollment = await inject(app, {
      method: 'POST',
      url: `/api/progress/${blockedQuestId}/start`,
      cookies: studentCookies,
    })
    expect(bypassedEnrollment.status).toBe(402)

    const unenrolledNotes = await inject(app, {
      method: 'GET',
      url: `/api/learning/quests/${blockedQuestId}/notes`,
      cookies: studentCookies,
    })
    expect(unenrolledNotes.status).toBe(403)

    const createdNote = await inject(app, {
      method: 'POST',
      url: `/api/learning/quests/${enrolledQuestId}/notes`,
      cookies: studentCookies,
      payload: {
        anchorType: 'video',
        anchorValue: '12',
        body: 'Con muốn thử lại phần này',
      },
    })
    expect(createdNote.status).toBe(201)
    const note = createdNote.body.note as { id: string; version: number }
    expect(note.version).toBe(1)

    const unsafeNote = await inject(app, {
      method: 'POST',
      url: `/api/learning/quests/${enrolledQuestId}/notes`,
      cookies: studentCookies,
      payload: {
        anchorType: 'section',
        anchorValue: 'practice',
        body: 'Số điện thoại của con là 0901234567',
      },
    })
    expect(unsafeNote.status).toBe(400)

    const updatedNote = await inject(app, {
      method: 'PATCH',
      url: `/api/learning/notes/${note.id}`,
      cookies: studentCookies,
      payload: {
        version: note.version,
        body: 'Con đã hiểu phần này',
      },
    })
    expect(updatedNote.status).toBe(200)
    expect((updatedNote.body.note as { version: number }).version).toBe(2)

    const staleUpdate = await inject(app, {
      method: 'PATCH',
      url: `/api/learning/notes/${note.id}`,
      cookies: studentCookies,
      payload: {
        version: note.version,
        body: 'Bản sửa cũ',
      },
    })
    expect(staleUpdate.status).toBe(409)

    const bookmark = await inject(app, {
      method: 'POST',
      url: `/api/learning/quests/${enrolledQuestId}/bookmarks`,
      cookies: studentCookies,
      payload: {
        anchorType: 'section',
        anchorValue: 'practice',
        label: 'Luyện tập lại',
      },
    })
    expect(bookmark.status).toBe(201)
    const bookmarkId = (bookmark.body.bookmark as { id: string }).id

    const sameBookmark = await inject(app, {
      method: 'POST',
      url: `/api/learning/quests/${enrolledQuestId}/bookmarks`,
      cookies: studentCookies,
      payload: {
        anchorType: 'section',
        anchorValue: 'practice',
        label: 'Xem lại sau',
      },
    })
    expect(sameBookmark.status).toBe(201)
    expect((sameBookmark.body.bookmark as { id: string }).id).toBe(bookmarkId)

    const listed = await inject(app, {
      method: 'GET',
      url: `/api/learning/quests/${enrolledQuestId}/notes`,
      cookies: studentCookies,
    })
    expect(listed.status).toBe(200)
    expect((listed.body.notes as unknown[])).toHaveLength(1)
    expect((listed.body.bookmarks as unknown[])).toHaveLength(1)

    const now = new Date()
    const resume = await inject(app, {
      method: 'PUT',
      url: `/api/learning/quests/${enrolledQuestId}/resume`,
      cookies: studentCookies,
      payload: {
        percent: 60,
        positionSeconds: 42,
        sectionId: 'practice',
        occurredAt: now.toISOString(),
      },
    })
    expect(resume.status).toBe(200)
    expect((resume.body.resume as { percent: number }).percent).toBe(60)

    const olderResume = await inject(app, {
      method: 'PUT',
      url: `/api/learning/quests/${enrolledQuestId}/resume`,
      cookies: studentCookies,
      payload: {
        percent: 20,
        positionSeconds: 10,
        sectionId: 'learn',
        occurredAt: new Date(now.getTime() - 60_000).toISOString(),
      },
    })
    expect(olderResume.status).toBe(200)
    expect((olderResume.body.resume as { percent: number }).percent).toBe(60)

    const search = await inject(app, {
      method: 'GET',
      url: `/api/learning/quests/${enrolledQuestId}/search?q=AI`,
      cookies: studentCookies,
    })
    expect(search.status).toBe(200)
    expect(Array.isArray(search.body.results)).toBe(true)

    const parentLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/adult',
      payload: {
        email: parentEmail,
        password: 'LearningTest1!',
      },
    })
    expect(parentLogin.status).toBe(200)

    const parentCannotDelete = await inject(app, {
      method: 'DELETE',
      url: `/api/learning/notes/${note.id}`,
      cookies: { aikids_session: parentLogin.session! },
    })
    expect(parentCannotDelete.status).toBe(403)

    const deletedNote = await inject(app, {
      method: 'DELETE',
      url: `/api/learning/notes/${note.id}`,
      cookies: studentCookies,
    })
    expect(deletedNote.status).toBe(204)

    const deletedBookmark = await inject(app, {
      method: 'DELETE',
      url: `/api/learning/bookmarks/${bookmarkId}`,
      cookies: studentCookies,
    })
    expect(deletedBookmark.status).toBe(204)
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

  it('Phase 2 schedule flow stays fail-closed then supports class placement end to end', async () => {
    const adminLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/adult',
      payload: {
        email: 'admin@demo.aikids.local',
        password: 'AdminDemo1!',
      },
    })
    const teacherLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/adult',
      payload: {
        email: 'teacher@demo.aikids.local',
        password: 'TeacherDemo1!',
      },
    })
    const parentLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/adult',
      payload: {
        email: 'parent@demo.aikids.local',
        password: 'ParentDemo1!',
      },
    })
    const adminCookies = { aikids_session: adminLogin.session! }
    const teacherCookies = { aikids_session: teacherLogin.session! }
    const parentCookies = { aikids_session: parentLogin.session! }

    const teacherCourses = await inject(app, {
      method: 'GET',
      url: '/api/teacher/lectures',
      cookies: teacherCookies,
    })
    expect(teacherCourses.status).toBe(200)
    const course = (
      teacherCourses.body.courses as Array<{ id: string }>
    )[0]!
    const classCode = `T${Date.now().toString().slice(-10)}`
    const classPayload = {
      name: 'Lớp kiểm thử lịch',
      code: classCode,
      courseId: course.id,
      classType: 'group',
      allowedAgeBands: ['9_11'],
      minLevel: 1,
      maxLevel: 10,
      capacity: 8,
      status: 'open',
    }

    const blockedWithoutPolicy = await inject(app, {
      method: 'POST',
      url: '/api/schedule/classes',
      cookies: teacherCookies,
      payload: classPayload,
    })
    expect(blockedWithoutPolicy.status).toBe(409)
    expect(blockedWithoutPolicy.body.reason).toBe('schedule_policy_required')

    const policy = await inject(app, {
      method: 'POST',
      url: '/api/admin/schedule-policies',
      cookies: adminCookies,
      payload: {
        code: `group-${classCode.toLowerCase()}`,
        classType: 'group',
        maxCapacity: 12,
        changeDeadlineHours: 12,
        maxReschedulesPerPeriod: 2,
        periodDays: 30,
        reminderOffsetsMinutes: [1_440, 60],
        reminderChannels: ['email'],
        absencePolicy: { recordReason: true },
        makeupPolicy: { allowed: true },
        status: 'published',
        reason: 'Kiểm thử tích hợp chính sách lịch',
      },
    })
    expect(policy.status).toBe(201)

    const createdClass = await inject(app, {
      method: 'POST',
      url: '/api/schedule/classes',
      cookies: teacherCookies,
      payload: classPayload,
    })
    expect(createdClass.status).toBe(201)
    const classroom = createdClass.body.class as { id: string }

    const children = await inject(app, {
      method: 'GET',
      url: '/api/parent/children',
      cookies: parentCookies,
    })
    const child = (
      children.body.children as Array<{ id: string }>
    )[0]!
    const placement = await inject(app, {
      method: 'POST',
      url: '/api/schedule/placement-requests',
      cookies: parentCookies,
      payload: {
        studentId: child.id,
        courseId: course.id,
        requestedLevel: 1,
        availability: [
          {
            weekday: 6,
            startMinutes: 9 * 60,
            endMinutes: 10 * 60,
            timezone: 'Asia/Ho_Chi_Minh',
          },
        ],
      },
    })
    expect(placement.status).toBe(201)
    const placementId = (placement.body.request as { id: string }).id

    const parentCannotDecide = await inject(app, {
      method: 'POST',
      url: `/api/schedule/placement-requests/${placementId}/decide`,
      cookies: parentCookies,
      payload: {
        decision: 'placed',
        classId: classroom.id,
        reason: 'Không được phép duyệt',
      },
    })
    expect(parentCannotDecide.status).toBe(403)

    const decided = await inject(app, {
      method: 'POST',
      url: `/api/schedule/placement-requests/${placementId}/decide`,
      cookies: teacherCookies,
      payload: {
        decision: 'placed',
        classId: classroom.id,
        reason: 'Phù hợp khóa học, độ tuổi và cấp độ',
      },
    })
    expect(decided.status).toBe(200)

    const startsAt = new Date(Date.now() + 48 * 60 * 60 * 1_000)
    const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1_000)
    const session = await inject(app, {
      method: 'POST',
      url: `/api/schedule/classes/${classroom.id}/sessions`,
      cookies: teacherCookies,
      payload: {
        title: 'Buổi học kiểm thử',
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        lessonPlan: { goal: 'Kiểm tra luồng lịch' },
      },
    })
    expect(session.status).toBe(201)

    const schedule = await inject(app, {
      method: 'GET',
      url: '/api/schedule',
      cookies: teacherCookies,
    })
    expect(schedule.status).toBe(200)
    const scheduledClass = (
      schedule.body.classes as Array<{
        id: string
        memberships: Array<{ studentId: string }>
        sessions: Array<{ id: string }>
      }>
    ).find((row) => row.id === classroom.id)
    expect(
      scheduledClass?.memberships.some(
        (membership) => membership.studentId === child.id,
      ),
    ).toBe(true)
    expect(scheduledClass?.sessions).toHaveLength(1)
  })

  it('Phase 2 offline package refresh keeps a valid grant and syncs idempotently', async () => {
    const adminLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/adult',
      payload: {
        email: 'admin@demo.aikids.local',
        password: 'AdminDemo1!',
      },
    })
    expect(adminLogin.status).toBe(200)
    const adminCookies = { aikids_session: adminLogin.session! }

    const agePolicy = await inject(app, {
      method: 'PUT',
      url: '/api/admin/learning/age-policies/9_11',
      cookies: adminCookies,
      payload: {
        label: '9–11 tuổi',
        allowedCourseTracks: ['L2'],
        uiPolicy: {
          density: 'balanced',
          maxChoicesPerStep: 6,
          largeControls: true,
          oneActivityPerScreen: true,
          showDetailedProgress: true,
        },
        copyPolicy: {
          instructionLength: 'balanced',
          readingSupport: true,
          errorTone: 'gentle',
          actionLabels: { submit: 'Hoàn thành' },
          competencyLevelLabels: {
            no_data: 'Chưa có dữ liệu',
            not_met: 'Cần thêm trải nghiệm',
            developing: 'Đang phát triển',
            achieved: 'Đã thể hiện tốt',
          },
        },
        permissionPolicy: {
          canDownloadLessons: true,
          canShareCredentials: false,
          canEditProfile: true,
          canRequestReschedule: true,
          requireParentConfirmationFor: [],
        },
        assessmentPolicy: {
          allowedQuestionTypes: ['single_choice'],
          maxShortTextLength: 500,
          preferOneQuestionPerScreen: true,
        },
        status: 'published',
        reason: 'Kiểm thử gói học ngoại tuyến',
      },
    })
    expect(agePolicy.status).toBe(200)

    const teacherLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/adult',
      payload: {
        email: 'teacher@demo.aikids.local',
        password: 'TeacherDemo1!',
      },
    })
    const offlineEnabled = await inject(app, {
      method: 'PATCH',
      url: '/api/teacher/lectures/l2-k1-q1',
      cookies: { aikids_session: teacherLogin.session! },
      payload: { offlineAllowed: true, offlineMaxAgeHours: 72 },
    })
    expect(offlineEnabled.status).toBe(200)

    const suffix = Date.now().toString().slice(-8)
    const parent = await inject(app, {
      method: 'POST',
      url: '/api/auth/register/adult',
      payload: {
        role: 'parent',
        email: `offline-parent-${suffix}@demo.aikids.local`,
        password: 'OfflineTest1!',
        nickname: `PhuHuynh${suffix}`,
      },
    })
    expect(parent.status).toBe(201)
    const parentCookies = { aikids_session: parent.session! }
    const child = await inject(app, {
      method: 'POST',
      url: '/api/parent/children',
      cookies: parentCookies,
      payload: {
        nickname: `Ngoai${suffix}`,
        avatarId: 'avatar-star',
        pin: '626262',
        birthDate: '2016-08-15',
      },
    })
    expect(child.status).toBe(201)
    const childId = (child.body.child as { id: string }).id
    const entered = await inject(app, {
      method: 'POST',
      url: `/api/parent/children/${childId}/enter`,
      cookies: parentCookies,
      payload: { pin: '626262' },
    })
    expect(entered.status).toBe(200)
    const studentCookies = { aikids_session: entered.session! }
    const enrollment = await inject(app, {
      method: 'POST',
      url: '/api/enrollments',
      cookies: studentCookies,
      payload: { courseId: 'l2-k1-the-gioi' },
    })
    expect(enrollment.status).toBe(201)

    const deviceId = `web.integration-${suffix}`
    const firstDownload = await inject(app, {
      method: 'POST',
      url: '/api/learning/quests/l2-k1-q1/offline-manifest',
      cookies: studentCookies,
      payload: { deviceId },
    })
    expect(firstDownload.status).toBe(201)
    expect(firstDownload.body.manifest.grantId).toBe(
      firstDownload.body.grant.id,
    )

    const refreshedDownload = await inject(app, {
      method: 'POST',
      url: '/api/learning/quests/l2-k1-q1/offline-manifest',
      cookies: studentCookies,
      payload: { deviceId },
    })
    expect(refreshedDownload.status).toBe(201)
    expect(refreshedDownload.body.manifest.grantId).toBe(
      refreshedDownload.body.grant.id,
    )
    expect(refreshedDownload.body.grant.id).toBe(
      firstDownload.body.grant.id,
    )

    const event = {
      clientEventId: `offline-event-${suffix}`,
      percent: 65,
      positionSeconds: 42,
      sectionId: 'practice',
      occurredAt: new Date().toISOString(),
    }
    const sync = await inject(app, {
      method: 'POST',
      url: '/api/learning/quests/l2-k1-q1/offline-sync',
      cookies: studentCookies,
      payload: {
        grantId: refreshedDownload.body.manifest.grantId,
        deviceId,
        contentVersion: refreshedDownload.body.manifest.contentVersion,
        events: [event],
      },
    })
    expect(sync.status).toBe(200)
    expect(sync.body.sync.accepted).toBe(1)
    expect(sync.body.sync.duplicate).toBe(0)
    expect(sync.body.sync.resume.percent).toBe(65)

    const duplicateSync = await inject(app, {
      method: 'POST',
      url: '/api/learning/quests/l2-k1-q1/offline-sync',
      cookies: studentCookies,
      payload: {
        grantId: refreshedDownload.body.manifest.grantId,
        deviceId,
        contentVersion: refreshedDownload.body.manifest.contentVersion,
        events: [event],
      },
    })
    expect(duplicateSync.status).toBe(200)
    expect(duplicateSync.body.sync.accepted).toBe(0)
    expect(duplicateSync.body.sync.duplicate).toBe(1)
  })

  it('Phase 2 assessment flows from enrolled learner answers to teacher-published result', async () => {
    const adminLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/adult',
      payload: {
        email: 'admin@demo.aikids.local',
        password: 'AdminDemo1!',
      },
    })
    const agePolicy = await inject(app, {
      method: 'PUT',
      url: '/api/admin/learning/age-policies/9_11',
      cookies: { aikids_session: adminLogin.session! },
      payload: {
        label: '9–11 tuổi',
        allowedCourseTracks: ['L2'],
        uiPolicy: {
          density: 'balanced',
          maxChoicesPerStep: 6,
          largeControls: true,
          oneActivityPerScreen: true,
          showDetailedProgress: true,
        },
        copyPolicy: {
          instructionLength: 'balanced',
          readingSupport: true,
          errorTone: 'gentle',
          actionLabels: { submit: 'Nộp bài' },
          competencyLevelLabels: {
            no_data: 'Chưa có dữ liệu',
            not_met: 'Cần thêm trải nghiệm',
            developing: 'Đang phát triển',
            achieved: 'Đã thể hiện tốt',
          },
        },
        permissionPolicy: {
          canDownloadLessons: false,
          canShareCredentials: false,
          canEditProfile: true,
          canRequestReschedule: true,
          requireParentConfirmationFor: [],
        },
        assessmentPolicy: {
          allowedQuestionTypes: [
            'single_choice',
            'multiple_choice',
            'drag_drop',
            'short_text',
            'ordering',
            'artifact',
          ],
          maxShortTextLength: 1_000,
          preferOneQuestionPerScreen: true,
        },
        status: 'published',
        reason: 'Kiểm thử tích hợp bài đánh giá',
      },
    })
    expect(agePolicy.status).toBe(200)

    const studentLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/student',
      payload: { nickname: 'MựcCon' },
    })
    expect(studentLogin.status).toBe(200)
    const studentCookies = { aikids_session: studentLogin.session! }
    const incompatibleEnrollment = await inject(app, {
      method: 'POST',
      url: '/api/enrollments',
      cookies: studentCookies,
      payload: { courseId: 'l1-k1-the-gioi' },
    })
    expect([200, 201]).toContain(incompatibleEnrollment.status)
    const incompatibleAssessments = await inject(app, {
      method: 'GET',
      url: '/api/assessments/course/l1-k1-the-gioi',
      cookies: studentCookies,
    })
    expect(incompatibleAssessments.status).toBe(200)
    expect(incompatibleAssessments.body.assessments).toHaveLength(0)

    const courseId = 'l2-k1-the-gioi'
    const enrollment = await inject(app, {
      method: 'POST',
      url: '/api/enrollments',
      cookies: studentCookies,
      payload: { courseId },
    })
    expect([200, 201]).toContain(enrollment.status)

    const courseAssessments = await inject(app, {
      method: 'GET',
      url: `/api/assessments/course/${courseId}`,
      cookies: studentCookies,
    })
    expect(courseAssessments.status).toBe(200)
    const assessment = (
      courseAssessments.body.assessments as Array<{ id: string }>
    )[0]!
    expect(assessment).toBeTruthy()

    const attemptStarted = await inject(app, {
      method: 'POST',
      url: `/api/assessments/${assessment.id}/attempts`,
      cookies: studentCookies,
      payload: { clientAttemptId: crypto.randomUUID() },
    })
    expect(attemptStarted.status).toBe(201)
    const attempt = attemptStarted.body.attempt as {
      id: string
      version: number
      items: Array<{
        questionVersionId: string
        question: {
          type: string
          prompt: { options?: Array<{ id: string }> }
        }
      }>
    }
    expect(attempt.items.length).toBeGreaterThan(0)

    let attemptVersion = attempt.version
    for (const item of attempt.items) {
      expect(item.question.type).toBe('single_choice')
      const firstOptionId = item.question.prompt.options?.[0]?.id
      expect(firstOptionId).toBeTruthy()
      const saved = await inject(app, {
        method: 'PUT',
        url: `/api/assessment-attempts/${attempt.id}/responses/${item.questionVersionId}`,
        cookies: studentCookies,
        payload: {
          attemptVersion,
          response: { selectedOptionIds: [firstOptionId] },
        },
      })
      expect(saved.status).toBe(200)
      attemptVersion = (
        saved.body.saved as { attemptVersion: number }
      ).attemptVersion
    }

    const submitted = await inject(app, {
      method: 'POST',
      url: `/api/assessment-attempts/${attempt.id}/submit`,
      cookies: studentCookies,
      payload: {
        attemptVersion,
        clientSubmissionId: crypto.randomUUID(),
      },
    })
    expect(submitted.status).toBe(200)
    expect((submitted.body.attempt as { status: string }).status).toBe('graded')

    const hiddenUntilPublished = await inject(app, {
      method: 'GET',
      url: `/api/assessment-attempts/${attempt.id}/result`,
      cookies: studentCookies,
    })
    expect(hiddenUntilPublished.status).toBe(409)

    const teacherLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/adult',
      payload: {
        email: 'teacher@demo.aikids.local',
        password: 'TeacherDemo1!',
      },
    })
    const published = await inject(app, {
      method: 'POST',
      url: `/api/teacher/grading/attempts/${attempt.id}/publish`,
      cookies: { aikids_session: teacherLogin.session! },
      payload: { reason: 'Công bố kết quả kiểm thử đã chấm tự động' },
    })
    expect(published.status).toBe(200)
    expect((published.body.attempt as { status: string }).status).toBe(
      'published',
    )

    const visibleResult = await inject(app, {
      method: 'GET',
      url: `/api/assessment-attempts/${attempt.id}/result`,
      cookies: studentCookies,
    })
    expect(visibleResult.status).toBe(200)
    expect((visibleResult.body.result as { status: string }).status).toBe(
      'published',
    )

    const assessmentsAfterPublish = await inject(app, {
      method: 'GET',
      url: `/api/assessments/course/${courseId}`,
      cookies: studentCookies,
    })
    expect(assessmentsAfterPublish.status).toBe(200)
    const publishedAssessment = (
      assessmentsAfterPublish.body.assessments as Array<{
        id: string
        latestAttempt: {
          id: string
          status: string
          scorePercent: number | null
        } | null
      }>
    ).find((row) => row.id === assessment.id)
    expect(publishedAssessment?.latestAttempt).toMatchObject({
      id: attempt.id,
      status: 'published',
    })
    expect(publishedAssessment?.latestAttempt.scorePercent).not.toBeNull()
  })

  it('Phase 2 assessment accepts policy-sized short text while still rejecting PII', async () => {
    const adminLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/adult',
      payload: {
        email: 'admin@demo.aikids.local',
        password: 'AdminDemo1!',
      },
    })
    const agePolicy = await inject(app, {
      method: 'PUT',
      url: '/api/admin/learning/age-policies/9_11',
      cookies: { aikids_session: adminLogin.session! },
      payload: {
        label: '9–11 tuổi',
        allowedCourseTracks: ['L2'],
        uiPolicy: {
          density: 'balanced',
          maxChoicesPerStep: 6,
          largeControls: true,
          oneActivityPerScreen: true,
          showDetailedProgress: true,
        },
        copyPolicy: {
          instructionLength: 'balanced',
          readingSupport: true,
          errorTone: 'gentle',
          actionLabels: { submit: 'Nộp bài' },
          competencyLevelLabels: {
            no_data: 'Chưa có dữ liệu',
            not_met: 'Cần thêm trải nghiệm',
            developing: 'Đang phát triển',
            achieved: 'Đã thể hiện tốt',
          },
        },
        permissionPolicy: {
          canDownloadLessons: false,
          canShareCredentials: false,
          canEditProfile: true,
          canRequestReschedule: true,
          requireParentConfirmationFor: [],
        },
        assessmentPolicy: {
          allowedQuestionTypes: ['short_text'],
          maxShortTextLength: 1_000,
          preferOneQuestionPerScreen: true,
        },
        status: 'published',
        reason: 'Kiểm thử giới hạn câu trả lời ngắn theo chính sách',
      },
    })
    expect(agePolicy.status).toBe(200)

    const teacherLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/adult',
      payload: {
        email: 'teacher@demo.aikids.local',
        password: 'TeacherDemo1!',
      },
    })
    const teacherCookies = { aikids_session: teacherLogin.session! }
    const uniqueCode = `short-text-${crypto.randomUUID()}`
    const questionCreated = await inject(app, {
      method: 'POST',
      url: '/api/teacher/question-bank',
      cookies: teacherCookies,
      payload: {
        code: uniqueCode,
        courseId: 'l2-k1-the-gioi',
        title: 'Câu trả lời phản tư',
        tags: ['integration'],
        type: 'short_text',
        prompt: {
          stem: 'Em hãy mô tả điều em đã học được.',
          minLength: 1,
          maxLength: 500,
        },
        answerKey: {},
        rubric: {
          criteria: [{ id: 'reflection', label: 'Phản tư', maxPoints: 10 }],
        },
        ageBands: ['9_11'],
        status: 'published',
        reason: 'Kiểm thử tích hợp câu trả lời ngắn',
      },
    })
    expect(questionCreated.status).toBe(201)
    const questionVersionId = (
      questionCreated.body.question as {
        versions: Array<{ id: string }>
      }
    ).versions[0]!.id
    const assessmentCreated = await inject(app, {
      method: 'POST',
      url: '/api/teacher/assessments',
      cookies: teacherCookies,
      payload: {
        code: uniqueCode,
        courseId: 'l2-k1-the-gioi',
        title: 'Bài phản tư tích hợp',
        kind: 'practice',
        status: 'published',
        feedbackPolicy: 'after_publish',
        items: [
          {
            questionVersionId,
            order: 1,
            points: 10,
            required: true,
          },
        ],
        reason: 'Kiểm thử tích hợp câu trả lời ngắn',
      },
    })
    expect(assessmentCreated.status).toBe(201)
    const assessmentId = (
      assessmentCreated.body.assessment as { id: string }
    ).id

    const studentLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/student',
      payload: { nickname: 'MựcCon' },
    })
    const studentCookies = { aikids_session: studentLogin.session! }
    const enrollment = await inject(app, {
      method: 'POST',
      url: '/api/enrollments',
      cookies: studentCookies,
      payload: { courseId: 'l2-k1-the-gioi' },
    })
    expect([200, 201]).toContain(enrollment.status)
    const attemptStarted = await inject(app, {
      method: 'POST',
      url: `/api/assessments/${assessmentId}/attempts`,
      cookies: studentCookies,
      payload: { clientAttemptId: crypto.randomUUID() },
    })
    expect(attemptStarted.status).toBe(201)
    const attempt = attemptStarted.body.attempt as {
      id: string
      version: number
    }
    const safeLongAnswer = 'Em đã học cách kiểm tra từng bước và giải thích lựa chọn của mình rõ ràng hơn. '.repeat(2)
    expect(safeLongAnswer.length).toBeGreaterThan(80)
    const saved = await inject(app, {
      method: 'PUT',
      url: `/api/assessment-attempts/${attempt.id}/responses/${questionVersionId}`,
      cookies: studentCookies,
      payload: {
        attemptVersion: attempt.version,
        response: { text: safeLongAnswer },
      },
    })
    expect(saved.status).toBe(200)

    const piiRejected = await inject(app, {
      method: 'PUT',
      url: `/api/assessment-attempts/${attempt.id}/responses/${questionVersionId}`,
      cookies: studentCookies,
      payload: {
        attemptVersion: saved.body.saved.attemptVersion,
        response: { text: 'Email của em là child@example.com' },
      },
    })
    expect(piiRejected.status).toBe(400)
  })

  it('Phase 2 report keeps drafts private then publishes an owned parent PDF', async () => {
    const adminLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/adult',
      payload: {
        email: 'admin@demo.aikids.local',
        password: 'AdminDemo1!',
      },
    })
    const adminCookies = { aikids_session: adminLogin.session! }
    const template = await inject(app, {
      method: 'POST',
      url: '/api/admin/report-templates',
      cookies: adminCookies,
      payload: {
        code: `report-${Date.now()}`,
        name: 'Báo cáo kiểm thử',
        layout: {
          title: 'Hành trình học tập',
          issuerName: 'AI Kids Creator Academy',
          accentColor: '#6D5EFC',
          footerText: 'Báo cáo riêng tư dành cho gia đình.',
          showScores: true,
          sectionLabels: { student: 'Học viên' },
        },
        requiredSections: ['student'],
        status: 'published',
        reason: 'Kiểm thử tích hợp mẫu báo cáo',
      },
    })
    expect(template.status).toBe(201)
    const templateId = (template.body.template as { id: string }).id
    const policy = await inject(app, {
      method: 'POST',
      url: '/api/admin/report-policies',
      cookies: adminCookies,
      payload: {
        code: `monthly-${Date.now()}`,
        templateId,
        periodDays: 30,
        timezone: 'Asia/Ho_Chi_Minh',
        requireApproval: false,
        deliveryChannels: ['in_app'],
        maxDeliveryAttempts: 3,
        status: 'published',
        reason: 'Kiểm thử tích hợp chu kỳ báo cáo',
      },
    })
    expect(policy.status).toBe(201)
    const policyId = (policy.body.policy as { id: string }).id

    const parentLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/adult',
      payload: {
        email: 'parent@demo.aikids.local',
        password: 'ParentDemo1!',
      },
    })
    const parentCookies = { aikids_session: parentLogin.session! }
    const children = await inject(app, {
      method: 'GET',
      url: '/api/parent/children',
      cookies: parentCookies,
    })
    const child = (
      children.body.children as Array<{ id: string }>
    )[0]!

    const teacherLogin = await inject(app, {
      method: 'POST',
      url: '/api/auth/login/adult',
      payload: {
        email: 'teacher@demo.aikids.local',
        password: 'TeacherDemo1!',
      },
    })
    const teacherCookies = { aikids_session: teacherLogin.session! }
    const generated = await inject(app, {
      method: 'POST',
      url: '/api/reports/generate',
      cookies: teacherCookies,
      payload: {
        studentId: child.id,
        policyId,
        periodEnd: new Date().toISOString(),
      },
    })
    expect(generated.status).toBe(201)
    const draft = generated.body.report as {
      id: string
      status: string
      version: number
      missingSections: string[]
    }
    expect(draft.status).toBe('draft')
    expect(draft.missingSections).toEqual([])

    const parentDrafts = await inject(app, {
      method: 'GET',
      url: `/api/reports?studentId=${child.id}`,
      cookies: parentCookies,
    })
    expect(parentDrafts.status).toBe(200)
    expect(parentDrafts.body.reports).toEqual([])

    const submitted = await inject(app, {
      method: 'POST',
      url: `/api/reports/${draft.id}/submit-review`,
      cookies: teacherCookies,
      payload: {
        expectedVersion: draft.version,
        reason: 'Hoàn tất kiểm tra báo cáo tích hợp',
      },
    })
    expect(submitted.status).toBe(200)
    const approved = submitted.body.report as {
      status: string
      version: number
    }
    expect(approved.status).toBe('approved')

    const published = await inject(app, {
      method: 'POST',
      url: `/api/reports/${draft.id}/publish`,
      cookies: teacherCookies,
      payload: {
        expectedVersion: approved.version,
        reason: 'Công bố báo cáo tích hợp cho phụ huynh',
      },
    })
    expect(published.status).toBe(200)
    expect((published.body.report as { status: string }).status).toBe(
      'published',
    )

    const parentReports = await inject(app, {
      method: 'GET',
      url: `/api/reports?studentId=${child.id}`,
      cookies: parentCookies,
    })
    expect(parentReports.status).toBe(200)
    expect(
      (parentReports.body.reports as Array<{ id: string }>).some(
        (report) => report.id === draft.id,
      ),
    ).toBe(true)

    const pdf = await app.inject({
      method: 'GET',
      url: `/api/reports/${draft.id}/pdf`,
      headers: {
        cookie: `aikids_session=${parentLogin.session!}`,
      },
    })
    expect(pdf.statusCode).toBe(200)
    expect(pdf.headers['content-type']).toContain('application/pdf')
    expect(pdf.rawPayload.byteLength).toBeGreaterThan(1_000)
  })
})
