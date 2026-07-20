import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import {
  can,
  parentOwnsChild,
  isNicknameSafe,
  isValidChildPin,
  PLAN_CATALOG,
  type PlanCode,
} from '@aikids/domain'
import { prisma } from '../../infrastructure/database/prisma.js'
import {
  createSession,
  destroySession,
  publicUser,
  requireRole,
} from '../../infrastructure/session/session.js'
import { hashPassword, verifyPassword } from '../../infrastructure/security/crypto.js'
import {
  assertParentCanAddChild,
  changeHouseholdPlan,
  ensureHouseholdSubscription,
  getHouseholdEntitlement,
} from './family.service.js'

export async function parentRoutes(app: FastifyInstance) {
  /** Catalog of household plans (no payment processor in v1 — manual activate) */
  app.get('/api/parent/plans', async (request) => {
    const user = requireRole(request, ['parent'])
    if (!can(user.role, 'subscription:read')) {
      const err = new Error('Forbidden') as Error & { statusCode: number }
      err.statusCode = 403
      throw err
    }
    await ensureHouseholdSubscription(user.id)
    request.log.info({ parentId: user.id }, 'parent.plans_list')
    return {
      plans: PLAN_CATALOG.map((p) => ({
        code: p.code,
        name: p.name,
        tagline: p.tagline,
        maxChildren: p.maxChildren,
        maxOpenCoursesPerChild: p.maxOpenCoursesPerChild,
        priceMonthly: p.priceMonthly,
        currency: p.currency,
        features: p.features,
      })),
    }
  })

  app.get('/api/parent/subscription', async (request) => {
    const user = requireRole(request, ['parent'])
    if (!can(user.role, 'subscription:read')) {
      const err = new Error('Forbidden') as Error & { statusCode: number }
      err.statusCode = 403
      throw err
    }
    const entitlement = await getHouseholdEntitlement(user.id)
    request.log.info(
      {
        parentId: user.id,
        planCode: entitlement.planCode,
        childCount: entitlement.childCount,
        seatsRemaining: entitlement.seatsRemaining,
      },
      'parent.subscription_get',
    )
    return { subscription: entitlement }
  })

  /** Activate / change household plan (v1 manual; payment gateway later). */
  app.post('/api/parent/subscription', async (request, reply) => {
    const user = requireRole(request, ['parent'])
    if (!can(user.role, 'subscription:write')) {
      return reply.code(403).send({ error: 'Bạn không thể đổi gói.' })
    }
    const body = z
      .object({
        planCode: z.enum(['free', 'plus', 'family']),
      })
      .parse(request.body)

    try {
      const sub = await changeHouseholdPlan(user.id, body.planCode as PlanCode)
      await prisma.parentProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          maxChildren: sub.plan.maxChildren,
        },
        update: { maxChildren: sub.plan.maxChildren },
      })
      const entitlement = await getHouseholdEntitlement(user.id)
      request.log.info(
        {
          parentId: user.id,
          planCode: body.planCode,
          subscriptionId: sub.id,
          seats: sub.seats,
        },
        'parent.subscription_change ok',
      )
      return reply.code(200).send({
        subscription: entitlement,
        message:
          body.planCode === 'free'
            ? 'Đã chuyển về gói Khám phá (miễn phí).'
            : `Đã bật gói ${sub.plan.name}. Gia đình có thể học trong 30 ngày (bản demo).`,
      })
    } catch (e) {
      const err = e as Error & { statusCode?: number; logCode?: string }
      request.log.warn(
        {
          parentId: user.id,
          planCode: body.planCode,
          logCode: err.logCode,
          err: err.message,
        },
        'parent.subscription_change failed',
      )
      throw e
    }
  })

  app.get('/api/parent/children', async (request) => {
    const user = requireRole(request, ['parent'])
    const entitlement = await getHouseholdEntitlement(user.id)
    const children = await prisma.user.findMany({
      where: { parentId: user.id, role: 'student' },
      orderBy: { createdAt: 'asc' },
    })

    const enriched = await Promise.all(
      children.map(async (c) => {
        const completed = await prisma.questProgress.count({
          where: { userId: c.id, status: 'completed' },
        })
        const stars = await prisma.questProgress.aggregate({
          where: { userId: c.id },
          _sum: { stars: true },
        })
        const projects = await prisma.project.count({ where: { userId: c.id } })
        return {
          id: c.id,
          nickname: c.nickname,
          avatarId: c.avatarId,
          level: c.level,
          xp: c.xp,
          onboarded: c.onboarded,
          active: c.active,
          hasPin: Boolean(c.pinHash),
          completedQuests: completed,
          totalStars: stars._sum.stars ?? 0,
          projectCount: projects,
        }
      }),
    )

    return { children: enriched, subscription: entitlement }
  })

  /** Progress for one linked child — isolation enforced */
  app.get('/api/parent/children/:childId/progress', async (request, reply) => {
    const user = requireRole(request, ['parent'])
    if (!can(user.role, 'progress:read')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const { childId } = request.params as { childId: string }
    const child = await prisma.user.findUnique({ where: { id: childId } })
    if (!child || child.role !== 'student') {
      return reply.code(404).send({ error: 'Not found' })
    }
    if (!parentOwnsChild(user.id, child.parentId)) {
      return reply.code(403).send({ error: 'Forbidden' })
    }

    const courseId =
      (request.query as { courseId?: string }).courseId ?? 'course-comic'

    const quests = await prisma.quest.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        order: true,
        title: true,
        skill: true,
        videoUrl: true,
      },
    })
    const progress = await prisma.questProgress.findMany({
      where: {
        userId: childId,
        questId: { in: quests.map((q) => q.id) },
      },
    })
    const byQuest = new Map(progress.map((p) => [p.questId, p]))

    return {
      child: {
        id: child.id,
        nickname: child.nickname,
        level: child.level,
        xp: child.xp,
      },
      courseId,
      quests: quests.map((q) => {
        const p = byQuest.get(q.id)
        return {
          id: q.id,
          order: q.order,
          title: q.title,
          skill: q.skill,
          videoUrl: q.videoUrl,
          status: p?.status ?? (q.order === 1 ? 'available' : 'locked'),
          stars: p?.stars ?? 0,
          phase: p?.phase ?? 'learn',
        }
      }),
    }
  })

  app.get('/api/parent/approvals', async (request) => {
    const user = requireRole(request, ['parent'])
    if (!can(user.role, 'approval:decide')) {
      const err = new Error('Forbidden') as Error & { statusCode: number }
      err.statusCode = 403
      throw err
    }

    const status = (request.query as { status?: string }).status ?? 'pending'
    const approvals = await prisma.approval.findMany({
      where: {
        OR: [
          { parentId: user.id },
          { parentId: null, child: { parentId: user.id } },
        ],
        status: status === 'all' ? undefined : status,
      },
      include: {
        project: true,
        child: { select: { id: true, nickname: true, avatarId: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return {
      approvals: approvals.map((a) => ({
        id: a.id,
        status: a.status,
        destination: a.destination,
        note: a.note,
        createdAt: a.createdAt,
        project: {
          id: a.project.id,
          title: a.project.title,
          kind: a.project.kind,
          thumbnail: a.project.thumbnail,
          shareStatus: a.project.shareStatus,
        },
        child: a.child,
      })),
    }
  })

  app.post('/api/parent/approvals/:id/decide', async (request, reply) => {
    const user = requireRole(request, ['parent'])
    if (!can(user.role, 'approval:decide')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const { id } = request.params as { id: string }
    const body = z
      .object({
        decision: z.enum(['approved', 'rejected']),
        note: z.string().max(200).optional(),
      })
      .parse(request.body)

    const approval = await prisma.approval.findUnique({
      where: { id },
      include: { child: true, project: true },
    })
    if (!approval) return reply.code(404).send({ error: 'Not found' })
    if (!parentOwnsChild(user.id, approval.child.parentId)) {
      return reply.code(403).send({ error: 'Forbidden' })
    }

    const updated = await prisma.approval.update({
      where: { id },
      data: {
        status: body.decision,
        note: body.note,
        parentId: user.id,
      },
    })

    await prisma.project.update({
      where: { id: approval.projectId },
      data: {
        shareStatus: body.decision === 'approved' ? 'shared' : 'private',
        private: body.decision !== 'approved',
      },
    })

    return {
      approval: {
        id: updated.id,
        status: updated.status,
        note: updated.note,
      },
      projectShareStatus:
        body.decision === 'approved' ? 'shared' : 'private',
    }
  })

  // ── Parent creates child profile ────────────────────────────
  app.post('/api/parent/children', async (request, reply) => {
    const user = requireRole(request, ['parent'])
    if (!can(user.role, 'child:create')) {
      return reply.code(403).send({ error: 'Bạn không thể thêm hồ sơ con.' })
    }

    const body = z
      .object({
        nickname: z.string().min(1).max(16),
        avatarId: z.string().min(1).max(40).default('avatar-robot'),
        classCode: z.string().max(20).optional(),
        /** Optional 6-digit PIN for shared devices */
        pin: z.string().regex(/^\d{6}$/).optional(),
      })
      .parse(request.body)

    const safe = isNicknameSafe(body.nickname)
    if (!safe.ok) {
      request.log.warn(
        { parentId: user.id, reason: safe.reason },
        'parent.child_create nickname_rejected',
      )
      return reply.code(400).send({ error: safe.message })
    }

    try {
      await assertParentCanAddChild(user.id)
    } catch (e) {
      const err = e as Error & { statusCode?: number }
      request.log.warn(
        { parentId: user.id, err: err.message },
        'parent.child_create seat_denied',
      )
      throw e
    }

    const sibling = await prisma.user.findFirst({
      where: {
        parentId: user.id,
        nickname: body.nickname.trim(),
        role: 'student',
      },
    })
    if (sibling) {
      return reply.code(409).send({
        error: 'Trong nhà đã có bạn nhỏ trùng tên này rồi. Chọn biệt danh khác nhé.',
      })
    }

    let classId: string | undefined
    if (body.classCode) {
      const classroom = await prisma.classRoom.findFirst({
        where: { code: body.classCode.toUpperCase() },
      })
      if (classroom) classId = classroom.id
      else {
        request.log.info(
          { parentId: user.id, classCode: body.classCode },
          'parent.child_create class_code_not_found',
        )
      }
    }

    const pinHash = body.pin ? await hashPassword(body.pin) : null

    const child = await prisma.user.create({
      data: {
        role: 'student',
        nickname: body.nickname.trim(),
        avatarId: body.avatarId,
        parentId: user.id,
        classId,
        pinHash,
        level: 1,
        xp: 0,
        onboarded: false,
        active: true,
      },
    })

    request.log.info(
      {
        parentId: user.id,
        childId: child.id,
        hasPin: Boolean(pinHash),
        classId: child.classId,
      },
      'parent.child_create ok',
    )

    return reply.code(201).send({
      child: {
        id: child.id,
        nickname: child.nickname,
        avatarId: child.avatarId,
        classId: child.classId,
        hasPin: Boolean(pinHash),
      },
    })
  })

  /**
   * Parent hands device to child: end parent session, start student session.
   */
  app.post('/api/parent/children/:childId/enter', async (request, reply) => {
    const user = requireRole(request, ['parent'])
    const { childId } = request.params as { childId: string }
    const body = z
      .object({
        pin: z.string().regex(/^\d{6}$/).optional(),
      })
      .parse(request.body ?? {})

    const child = await prisma.user.findUnique({ where: { id: childId } })
    if (!child || child.role !== 'student' || !child.active) {
      request.log.warn(
        { parentId: user.id, childId },
        'parent.enter_child not_found',
      )
      return reply.code(404).send({ error: 'Không tìm thấy hồ sơ con.' })
    }
    if (!parentOwnsChild(user.id, child.parentId)) {
      request.log.warn(
        { parentId: user.id, childId, childParentId: child.parentId },
        'parent.enter_child forbidden',
      )
      return reply.code(403).send({ error: 'Đây không phải hồ sơ con của bạn.' })
    }

    if (child.pinHash) {
      if (!body.pin || !(await verifyPassword(body.pin, child.pinHash))) {
        request.log.warn(
          { parentId: user.id, childId },
          'parent.enter_child pin_invalid',
        )
        return reply.code(401).send({
          error: 'Mã PIN chưa đúng. Thử lại nhé.',
        })
      }
    }

    await destroySession(request, reply)
    await createSession(child.id, reply)
    request.log.info(
      { parentId: user.id, childId: child.id },
      'parent.enter_child ok',
    )
    return {
      user: publicUser(child),
      message: `Xong! Đang mở hồ sơ ${child.nickname}. Chúc con học vui!`,
    }
  })

  // ── Parent updates child profile ────────────────────────────
  app.patch('/api/parent/children/:childId', async (request, reply) => {
    const user = requireRole(request, ['parent'])
    if (!can(user.role, 'child:update')) {
      return reply.code(403).send({ error: 'Không có quyền.' })
    }

    const { childId } = request.params as { childId: string }
    const child = await prisma.user.findUnique({ where: { id: childId } })
    if (!child || child.role !== 'student') {
      return reply.code(404).send({ error: 'Không tìm thấy.' })
    }
    if (!parentOwnsChild(user.id, child.parentId)) {
      return reply.code(403).send({ error: 'Không phải con của bạn.' })
    }

    const body = z
      .object({
        nickname: z.string().min(1).max(16).optional(),
        avatarId: z.string().min(1).max(40).optional(),
        classCode: z.string().max(20).optional(),
        /** Set new PIN; empty string clears PIN */
        pin: z.union([z.string().regex(/^\d{6}$/), z.literal('')]).optional(),
      })
      .parse(request.body)

    if (body.nickname) {
      const safe = isNicknameSafe(body.nickname)
      if (!safe.ok) {
        return reply.code(400).send({ error: safe.message })
      }
    }

    let classId: string | undefined
    if (body.classCode !== undefined) {
      if (body.classCode) {
        const classroom = await prisma.classRoom.findFirst({
          where: { code: body.classCode.toUpperCase() },
        })
        classId = classroom?.id
      } else {
        classId = undefined
      }
    }

    let pinHash: string | null | undefined
    if (body.pin === '') pinHash = null
    else if (body.pin && isValidChildPin(body.pin)) {
      pinHash = await hashPassword(body.pin)
    }

    const updated = await prisma.user.update({
      where: { id: childId },
      data: {
        nickname: body.nickname?.trim(),
        avatarId: body.avatarId,
        classId:
          classId === undefined && body.classCode === undefined
            ? undefined
            : (classId ?? null),
        pinHash,
      },
    })

    return {
      child: {
        id: updated.id,
        nickname: updated.nickname,
        avatarId: updated.avatarId,
        classId: updated.classId,
        hasPin: Boolean(updated.pinHash),
      },
    }
  })

  // ── Parent deactivates child account ────────────────────────
  app.delete('/api/parent/children/:childId', async (request, reply) => {
    const user = requireRole(request, ['parent'])
    if (!can(user.role, 'child:delete')) {
      return reply.code(403).send({ error: 'Không có quyền.' })
    }

    const { childId } = request.params as { childId: string }
    const child = await prisma.user.findUnique({ where: { id: childId } })
    if (!child || child.role !== 'student') {
      return reply.code(404).send({ error: 'Không tìm thấy.' })
    }
    if (!parentOwnsChild(user.id, child.parentId)) {
      return reply.code(403).send({ error: 'Không phải con của bạn.' })
    }

    // Soft-delete: deactivate, don't actually remove data
    await prisma.user.update({
      where: { id: childId },
      data: { active: false },
    })

    // Delete child sessions
    await prisma.session.deleteMany({ where: { userId: childId } })

    return { message: 'Tài khoản con đã được vô hiệu hóa.' }
  })

  // ── Parent profile (GET + PATCH) ────────────────────────────
  app.get('/api/parent/profile', async (request) => {
    const user = requireRole(request, ['parent'])
    let profile = await prisma.parentProfile.findUnique({
      where: { userId: user.id },
    })
    if (!profile) {
      profile = await prisma.parentProfile.create({
        data: { userId: user.id },
      })
    }
    return {
      profile: {
        phone: profile.phone,
        preferredLanguage: profile.preferredLanguage,
        notificationPrefs: profile.notificationPrefs,
        maxChildren: profile.maxChildren,
      },
    }
  })

  app.patch('/api/parent/profile', async (request, reply) => {
    const user = requireRole(request, ['parent'])
    const body = z.object({
      phone: z.string().max(20).optional(),
      preferredLanguage: z.enum(['vi', 'en', 'bilingual']).optional(),
      notificationPrefs: z.record(z.unknown()).optional(),
    }).parse(request.body)

    const prefsJson = (body.notificationPrefs ?? {}) as object
    const profile = await prisma.parentProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        phone: body.phone,
        preferredLanguage: body.preferredLanguage,
        notificationPrefs: prefsJson,
      },
      update: {
        phone: body.phone,
        preferredLanguage: body.preferredLanguage,
        ...(body.notificationPrefs !== undefined
          ? { notificationPrefs: body.notificationPrefs as object }
          : {}),
      },
    })

    return {
      profile: {
        phone: profile.phone,
        preferredLanguage: profile.preferredLanguage,
        notificationPrefs: profile.notificationPrefs,
        maxChildren: profile.maxChildren,
      },
    }
  })
}
