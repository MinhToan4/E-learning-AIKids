import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { can, isAdultRole } from '@aikids/domain'
import { prisma } from '../../infrastructure/database/prisma.js'
import { hashPassword } from '../../infrastructure/security/crypto.js'
import { requireRole } from '../../infrastructure/session/session.js'
import {
  DEFAULT_VIDTORY_ROUTING,
  modelWeightPercents,
  validateVidtoryRouting,
} from '@aikids/domain'
import {
  getVidtoryKeyStatus,
  getVidtoryRouting,
  saveVidtoryRouting,
  VIDTORY_API_KEY_SETTING,
} from '../../infrastructure/generation/vidtory.adapter.js'
import {
  encryptSecret,
  maskSecret,
} from '../../infrastructure/security/secret-box.js'

/**
 * Admin CMS: accounts + system overview + AI provider settings.
 * Never returns password hashes or raw API keys.
 */
export async function adminRoutes(app: FastifyInstance) {
  app.get('/api/admin/system', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'system:read')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }

    const [users, courses, quests, sessions, classes, approvals, vidtory] =
      await Promise.all([
        prisma.user.groupBy({ by: ['role'], _count: true }),
        prisma.course.count(),
        prisma.quest.count(),
        prisma.session.count({
          where: { expiresAt: { gt: new Date() } },
        }),
        prisma.classRoom.count(),
        prisma.approval.count({ where: { status: 'pending' } }),
        getVidtoryKeyStatus(),
      ])

    return {
      system: {
        service: 'aikids-api',
        time: new Date().toISOString(),
        counts: {
          courses,
          quests,
          classes,
          activeSessions: sessions,
          pendingApprovals: approvals,
          usersByRole: Object.fromEntries(
            users.map((u) => [u.role, u._count]),
          ),
        },
        vidtory: {
          configured: vidtory.configured,
          maskedHint: vidtory.maskedHint,
          source: vidtory.source,
        },
      },
    }
  })

  /** Status + routing (no raw API key) */
  app.get('/api/admin/settings/vidtory', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'settings:read')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const [status, routing] = await Promise.all([
      getVidtoryKeyStatus(),
      getVidtoryRouting(),
    ])
    return {
      configured: status.configured,
      maskedHint: status.maskedHint,
      source: status.source,
      updatedAt: status.updatedAt,
      apiKey: undefined,
      routing,
      defaults: DEFAULT_VIDTORY_ROUTING,
      imagePercents: modelWeightPercents(routing.image.models),
      videoPercents: modelWeightPercents(routing.video.models),
    }
  })

  app.put('/api/admin/settings/vidtory', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'settings:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }

    const body = z
      .object({
        /** Optional — only update key when provided */
        apiKey: z.string().min(8).max(512).optional(),
        /** Optional — model load-balancing + aspect/resolution */
        routing: z.unknown().optional(),
      })
      .parse(request.body)

    let maskedHint: string | undefined
    if (body.apiKey) {
      const plain = body.apiKey.trim()
      const valueEnc = encryptSecret(plain)
      const last4 = plain.slice(-4)
      const hint = maskSecret(plain)
      maskedHint = hint
      const metaJson = JSON.stringify({
        last4,
        hint,
        configuredAt: new Date().toISOString(),
        configuredBy: user.id,
      })
      await prisma.systemSetting.upsert({
        where: { key: VIDTORY_API_KEY_SETTING },
        create: {
          key: VIDTORY_API_KEY_SETTING,
          valueEnc,
          metaJson,
        },
        update: { valueEnc, metaJson },
      })
    }

    let routing = await getVidtoryRouting()
    if (body.routing !== undefined) {
      const v = validateVidtoryRouting(body.routing)
      if (!v.ok) {
        return reply.code(400).send({ error: v.message })
      }
      routing = await saveVidtoryRouting(v.config)
    }

    const status = await getVidtoryKeyStatus()
    return {
      ok: true,
      configured: status.configured,
      maskedHint: maskedHint ?? status.maskedHint,
      routing,
      imagePercents: modelWeightPercents(routing.image.models),
      videoPercents: modelWeightPercents(routing.video.models),
    }
  })

  app.delete('/api/admin/settings/vidtory', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'settings:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    await prisma.systemSetting.deleteMany({
      where: { key: VIDTORY_API_KEY_SETTING },
    })
    return { ok: true, configured: false }
  })

  app.get('/api/admin/users', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'user:read')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }

    const q = request.query as { role?: string; take?: string }
    const take = Math.min(Number(q.take ?? 100) || 100, 200)
    const where = q.role ? { role: q.role } : {}

    const rows = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        role: true,
        email: true,
        nickname: true,
        avatarId: true,
        level: true,
        xp: true,
        onboarded: true,
        active: true,
        parentId: true,
        classId: true,
        createdAt: true,
      },
    })

    return { users: rows }
  })

  app.post('/api/admin/users', async (request, reply) => {
    const actor = requireRole(request, ['admin'])
    if (!can(actor.role, 'user:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }

    const body = z
      .object({
        role: z.enum(['parent', 'teacher', 'admin', 'student']),
        email: z.string().email().max(120).optional(),
        password: z.string().min(8).max(128).optional(),
        nickname: z.string().min(1).max(40).optional(),
        parentId: z.string().optional(),
        classId: z.string().optional(),
        avatarId: z.string().max(40).optional(),
      })
      .parse(request.body)

    if (body.role !== 'student') {
      if (!body.email || !body.password) {
        return reply
          .code(400)
          .send({ error: 'Adult accounts require email and password' })
      }
      if (!isAdultRole(body.role)) {
        return reply.code(400).send({ error: 'Invalid adult role' })
      }
      const email = body.email.toLowerCase()
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        return reply.code(409).send({ error: 'Email already in use' })
      }
      const passwordHash = await hashPassword(body.password)
      const created = await prisma.user.create({
        data: {
          role: body.role,
          email,
          passwordHash,
          nickname:
            body.nickname ??
            (body.role === 'admin'
              ? 'Quản trị'
              : body.role === 'teacher'
                ? 'Giáo viên'
                : 'Phụ huynh'),
          onboarded: true,
          active: true,
        },
      })
      return reply.code(201).send({
        user: {
          id: created.id,
          role: created.role,
          email: created.email,
          nickname: created.nickname,
          active: created.active,
        },
      })
    }

    // Student provisioning (admin)
    const created = await prisma.user.create({
      data: {
        role: 'student',
        nickname: body.nickname ?? 'HọcSinh',
        avatarId: body.avatarId ?? 'avatar-star',
        parentId: body.parentId,
        classId: body.classId,
        onboarded: false,
        active: true,
      },
    })
    return reply.code(201).send({
      user: {
        id: created.id,
        role: created.role,
        nickname: created.nickname,
        active: created.active,
        parentId: created.parentId,
        classId: created.classId,
      },
    })
  })

  app.patch('/api/admin/users/:id', async (request, reply) => {
    const actor = requireRole(request, ['admin'])
    if (!can(actor.role, 'user:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const { id } = request.params as { id: string }
    const body = z
      .object({
        active: z.boolean().optional(),
        role: z.enum(['parent', 'teacher', 'admin', 'student']).optional(),
        nickname: z.string().min(1).max(40).optional(),
        parentId: z.string().nullable().optional(),
        classId: z.string().nullable().optional(),
      })
      .parse(request.body)

    // Prevent admin from locking themselves out mid-session
    if (id === actor.id && body.active === false) {
      return reply.code(400).send({ error: 'Cannot deactivate yourself' })
    }

    const target = await prisma.user.findUnique({ where: { id } })
    if (!target) return reply.code(404).send({ error: 'Not found' })

    const updated = await prisma.user.update({
      where: { id },
      data: {
        active: body.active,
        role: body.role,
        nickname: body.nickname,
        parentId: body.parentId === undefined ? undefined : body.parentId,
        classId: body.classId === undefined ? undefined : body.classId,
      },
      select: {
        id: true,
        role: true,
        email: true,
        nickname: true,
        active: true,
        parentId: true,
        classId: true,
      },
    })

    return { user: updated }
  })

  app.get('/api/admin/courses', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'course:read')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const courses = await prisma.course.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        quests: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            order: true,
            title: true,
            videoUrl: true,
            practiceKind: true,
            archived: true,
          },
        },
        _count: { select: { enrollments: true } },
      },
    })
    return {
      courses: courses.map((c) => ({
        id: c.id,
        title: c.title,
        shortTitle: c.shortTitle,
        status: c.status,
        ageTrack: c.ageTrack,
        courseKey: c.courseKey,
        ageLabel: c.ageLabel,
        recommended: c.recommended,
        enrollmentCount: c._count.enrollments,
        questCount: c.quests.length,
        quests: c.quests,
      })),
    }
  })

  app.post('/api/admin/courses', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'course:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = z
      .object({
        id: z.string().min(3).max(40).regex(/^[a-z0-9-]+$/),
        title: z.string().min(1).max(120),
        shortTitle: z.string().min(1).max(40),
        tagline: z.string().min(1).max(200),
        description: z.string().min(1).max(2000),
        coverFrom: z.string().min(1).max(20).default('#6d5efc'),
        coverTo: z.string().min(1).max(20).default('#3dbfff'),
        accent: z.string().min(1).max(20).default('#6d5efc'),
        ageLabel: z.string().min(1).max(20).default('6–8 tuổi'),
        ageTrack: z.enum(['L1', 'L2']).default('L1'),
        courseKey: z
          .enum(['K1', 'K2', 'K3', 'K4', 'K5', 'K6'])
          .default('K1'),
        durationLabel: z.string().min(1).max(40).default('4 tuần'),
        productLabel: z.string().min(1).max(80).default('Sản phẩm khóa học'),
        status: z.enum(['open', 'soon']).default('soon'),
        skills: z.array(z.string()).max(12).default([]),
      })
      .parse(request.body)

    if (await prisma.course.findUnique({ where: { id: body.id } })) {
      return reply.code(409).send({ error: 'ID khóa đã tồn tại' })
    }
    const maxSort = await prisma.course.aggregate({ _max: { sortOrder: true } })
    const course = await prisma.course.create({
      data: {
        id: body.id,
        title: body.title,
        shortTitle: body.shortTitle,
        tagline: body.tagline,
        description: body.description,
        coverFrom: body.coverFrom,
        coverTo: body.coverTo,
        accent: body.accent,
        ageLabel: body.ageLabel,
        ageTrack: body.ageTrack,
        courseKey: body.courseKey,
        durationLabel: body.durationLabel,
        productLabel: body.productLabel,
        status: body.status,
        skillsJson: JSON.stringify(body.skills),
        sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      },
    })
    return reply.code(201).send({ course })
  })

  app.patch('/api/admin/courses/:courseId', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'course:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const { courseId } = request.params as { courseId: string }
    const body = z
      .object({
        title: z.string().min(1).max(120).optional(),
        shortTitle: z.string().min(1).max(40).optional(),
        tagline: z.string().min(1).max(200).optional(),
        description: z.string().min(1).max(2000).optional(),
        status: z.enum(['open', 'soon']).optional(),
        ageTrack: z.enum(['L1', 'L2']).optional(),
        courseKey: z
          .enum(['K1', 'K2', 'K3', 'K4', 'K5', 'K6'])
          .optional(),
        ageLabel: z.string().min(1).max(20).optional(),
        recommended: z.boolean().optional(),
        sortOrder: z.number().int().min(0).max(9999).optional(),
      })
      .parse(request.body)

    if (!(await prisma.course.findUnique({ where: { id: courseId } }))) {
      return reply.code(404).send({ error: 'Not found' })
    }
    const course = await prisma.course.update({
      where: { id: courseId },
      data: body,
    })
    return { course }
  })

  /** Soft-delete user (active=false) — never hard-delete for audit */
  app.delete('/api/admin/users/:id', async (request, reply) => {
    const actor = requireRole(request, ['admin'])
    if (!can(actor.role, 'user:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const { id } = request.params as { id: string }
    if (id === actor.id) {
      return reply.code(400).send({ error: 'Không thể xóa chính mình' })
    }
    const target = await prisma.user.findUnique({ where: { id } })
    if (!target) return reply.code(404).send({ error: 'Not found' })

    await prisma.user.update({
      where: { id },
      data: { active: false },
    })
    await prisma.session.deleteMany({ where: { userId: id } })
    return { message: 'Đã vô hiệu hóa user và thu hồi phiên.', softDeleted: true }
  })

  app.get('/api/admin/analytics', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'system:read')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }

    const [
      usersByRole,
      activeUsers,
      coursesOpen,
      coursesSoon,
      questsActive,
      questsArchived,
      completedProgress,
      projects,
      activeSessions,
      enrollments,
      dailyTrendRows,
    ] = await prisma.$transaction([
      prisma.user.groupBy({
        by: ['role'],
        orderBy: { role: 'asc' },
        _count: true,
      }),
      prisma.user.count({ where: { active: true } }),
      prisma.course.count({ where: { status: 'open' } }),
      prisma.course.count({ where: { status: 'soon' } }),
      prisma.quest.count({ where: { archived: false } }),
      prisma.quest.count({ where: { archived: true } }),
      prisma.questProgress.count({ where: { status: 'completed' } }),
      prisma.project.count(),
      prisma.session.count({ where: { expiresAt: { gt: new Date() } } }),
      prisma.enrollment.count(),
      prisma.$queryRaw<
        Array<{
          date: string
          new_users: bigint
          completed_quests: bigint
          projects: bigint
        }>
      >`
        WITH days AS (
          SELECT generate_series(
            CURRENT_DATE - INTERVAL '13 days',
            CURRENT_DATE,
            INTERVAL '1 day'
          )::date AS day
        ), signups AS (
          SELECT created_at::date AS day, COUNT(*)::bigint AS count
          FROM users
          WHERE created_at >= CURRENT_DATE - INTERVAL '13 days'
          GROUP BY created_at::date
        ), completions AS (
          SELECT updated_at::date AS day, COUNT(*)::bigint AS count
          FROM quest_progress
          WHERE status = 'completed'
            AND updated_at >= CURRENT_DATE - INTERVAL '13 days'
          GROUP BY updated_at::date
        ), creations AS (
          SELECT created_at::date AS day, COUNT(*)::bigint AS count
          FROM projects
          WHERE created_at >= CURRENT_DATE - INTERVAL '13 days'
          GROUP BY created_at::date
        )
        SELECT
          TO_CHAR(days.day, 'YYYY-MM-DD') AS date,
          COALESCE(signups.count, 0)::bigint AS new_users,
          COALESCE(completions.count, 0)::bigint AS completed_quests,
          COALESCE(creations.count, 0)::bigint AS projects
        FROM days
        LEFT JOIN signups USING (day)
        LEFT JOIN completions USING (day)
        LEFT JOIN creations USING (day)
        ORDER BY days.day ASC
      `,
    ])

    return {
      analytics: {
        time: new Date().toISOString(),
        users: {
          active: activeUsers,
          byRole: Object.fromEntries(
            usersByRole.map((u) => [u.role, u._count]),
          ),
        },
        courses: { open: coursesOpen, soon: coursesSoon },
        quests: { active: questsActive, archived: questsArchived },
        learning: {
          completedProgress,
          enrollments,
          projects,
        },
        sessions: { active: activeSessions },
        trends: dailyTrendRows.map((row) => ({
          date: row.date,
          newUsers: Number(row.new_users),
          completedQuests: Number(row.completed_quests),
          projects: Number(row.projects),
        })),
      },
    }
  })

  // ── Sessions management ─────────────────────────────────────
  app.get('/api/admin/sessions', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'system:read')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }

    const sessions = await prisma.session.findMany({
      where: { expiresAt: { gt: new Date() } },
      include: {
        user: {
          select: { id: true, email: true, nickname: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return {
      sessions: sessions.map((s) => ({
        id: s.id,
        userId: s.userId,
        email: s.user.email,
        nickname: s.user.nickname,
        role: s.user.role,
        ipAddress: s.ipAddress,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
      })),
    }
  })

  app.delete('/api/admin/sessions/:id', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'user:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }

    const { id } = request.params as { id: string }
    await prisma.session.deleteMany({ where: { id } })

    return { message: 'Session đã bị thu hồi.' }
  })

  // ── Classrooms management ──────────────────────────────────
  app.get('/api/admin/classrooms', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'class:read')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }

    const classrooms = await prisma.classRoom.findMany({
      include: {
        teacher: {
          select: { id: true, nickname: true, email: true },
        },
        students: {
          where: { active: true },
          select: { id: true, nickname: true, level: true, xp: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return {
      classrooms: classrooms.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        status: c.status,
        teacher: c.teacher,
        studentCount: c.students.length,
        students: c.students,
        createdAt: c.createdAt,
      })),
    }
  })

  app.delete('/api/admin/classrooms/:id', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'class:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }

    const { id } = request.params as { id: string }
    // Unlink students first
    await prisma.user.updateMany({
      where: { classId: id },
      data: { classId: null },
    })
    await prisma.classRoom.delete({ where: { id } })

    return { message: 'Lớp học đã được xóa.' }
  })

  // ── Login Audit Logs (OWASP A07) ────────────────────────────
  /**
   * GET /api/admin/login-logs
   * Returns last 200 login events within the past 24 hours.
   * Also auto-purges records older than 24 h to prevent unbounded growth.
   */
  app.get('/api/admin/login-logs', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'system:read')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // Auto-purge logs older than 24h — fire-and-forget (non-blocking)
    void prisma.loginLog
      .deleteMany({ where: { createdAt: { lt: since24h } } })
      .catch((e) => request.log.warn({ err: e }, 'login_log_purge_error'))

    const q = request.query as {
      outcome?: string
      limit?: string
    }
    const take = Math.min(Number(q.limit ?? 200) || 200, 500)
    const where = {
      createdAt: { gte: since24h },
      ...(q.outcome ? { outcome: q.outcome } : {}),
    }

    const [logs, summary] = await Promise.all([
      prisma.loginLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        select: {
          id: true,
          userId: true,
          email: true,
          outcome: true,
          ipAddress: true,
          reason: true,
          createdAt: true,
        },
      }),
      prisma.loginLog.groupBy({
        by: ['outcome'],
        where,
        _count: true,
      }),
    ])

    return {
      logs,
      summary: {
        total: logs.length,
        byOutcome: Object.fromEntries(
          summary.map((s) => [s.outcome, s._count]),
        ),
        windowHours: 24,
        purgedAt: new Date().toISOString(),
      },
    }
  })

  /**
   * DELETE /api/admin/login-logs — manual purge of all logs older than 24h.
   * Idempotent, safe to call any time.
   */
  app.delete('/api/admin/login-logs', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'system:read')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const result = await prisma.loginLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    })
    return {
      deleted: result.count,
      message: `Đã xóa ${result.count} log cũ hơn 24 giờ.`,
    }
  })
}
