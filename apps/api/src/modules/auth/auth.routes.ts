import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { isNicknameSafe } from '@aikids/domain'
import { env, SESSION_COOKIE } from '../../config/env.js'
import { prisma } from '../../infrastructure/database/prisma.js'
import { hashPassword, verifyPassword } from '../../infrastructure/security/crypto.js'
import { getCache } from '../../infrastructure/cache/cache.js'
import { emailService } from '../../infrastructure/email/email.service.js'
import {
  createSession,
  destroySession,
  invalidateUserSessionCache,
  publicUser,
  requireUser,
} from '../../infrastructure/session/session.js'

const adultLoginSchema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(8).max(128),
})

const studentLoginSchema = z.object({
  nickname: z.string().min(1).max(16),
  avatarId: z.string().min(1).max(40),
  /**
   * Dev/demo only when STUDENT_AUTO_CREATE=true.
   * Production: parent creates child — no public auto-create.
   */
  createIfMissing: z.boolean().optional().default(false),
  /** Optional 6-digit PIN if parent set one on the child profile */
  pin: z.string().regex(/^\d{6}$/).optional(),
})

const registerAdultSchema = z.object({
  role: z.enum(['parent', 'teacher']),
  email: z.string().email().max(120),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Za-z]/, 'Cần chữ')
    .regex(/[0-9]/, 'Cần số'),
  nickname: z.string().min(1).max(40).optional(),
})

/** Resolve optional parent/class links from env config (not hardcoded emails). */
export async function resolveStudentDefaults(): Promise<{
  parentId: string | undefined
  classId: string | undefined
}> {
  let parentId: string | undefined
  let classId: string | undefined

  if (env.defaultParentEmail) {
    const parent = await prisma.user.findFirst({
      where: {
        role: 'parent',
        email: env.defaultParentEmail,
        active: true,
      },
    })
    parentId = parent?.id
  }

  if (env.defaultClassCode) {
    const classroom = await prisma.classRoom.findFirst({
      where: { code: env.defaultClassCode },
    })
    classId = classroom?.id
  }

  return { parentId, classId }
}

export async function authRoutes(app: FastifyInstance) {
  app.post('/api/auth/login/adult', async (request, reply) => {
    const body = adultLoginSchema.parse(request.body)
    const ip = (request.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ?? request.ip ?? null
    const ua = (request.headers['user-agent'] as string | undefined) ?? null
    const emailKey = body.email.toLowerCase()

    // ── Per-account brute-force guard (OWASP A07) ──────────
    // 5 consecutive failures → 429 for 15 minutes regardless of IP rotation
    const cache = getCache()
    const lockKey = `login_fail:${emailKey}`
    const fails = Number((await cache.get(lockKey)) ?? 0)
    if (fails >= 5) {
      void prisma.loginLog
        .create({ data: { email: emailKey, outcome: 'locked', reason: 'brute_force_blocked', ipAddress: ip, userAgent: ua } })
        .catch(() => null)
      return reply.code(429).send({
        error: 'Quá nhiều lần thử sai. Vui lòng thử lại sau 15 phút.',
      })
    }

    const user = await prisma.user.findUnique({
      where: { email: emailKey },
    })
    if (!user || user.role === 'student') {
      // Increment counter — same message regardless (prevent email enumeration)
      await cache.set(lockKey, String(fails + 1), 15 * 60 * 1000)
      void prisma.loginLog.create({ data: { email: emailKey, outcome: 'failed', reason: 'user_not_found', ipAddress: ip, userAgent: ua } }).catch(() => null)
      return reply.code(401).send({ error: 'Email hoặc mật khẩu chưa đúng' })
    }
    if (user.active === false) {
      void prisma.loginLog.create({ data: { userId: user.id, email: user.email, outcome: 'locked', reason: 'account_inactive', ipAddress: ip, userAgent: ua } }).catch(() => null)
      return reply.code(403).send({
        error: 'Tài khoản đang tạm khóa. Liên hệ hỗ trợ nhé.',
      })
    }
    if (!user.passwordHash) {
      request.log.info(
        { userId: user.id, hasGoogle: Boolean(user.googleSub) },
        'auth.adult_login password_missing_use_google',
      )
      void prisma.loginLog.create({ data: { userId: user.id, email: user.email, outcome: 'failed', reason: 'no_password_use_google', ipAddress: ip, userAgent: ua } }).catch(() => null)
      return reply.code(401).send({
        error:
          'Tài khoản này đăng nhập bằng Google. Bấm "Tiếp tục với Google" nhé.',
      })
    }
    const ok = await verifyPassword(body.password, user.passwordHash)
    if (!ok) {
      // Increment counter on wrong password
      await cache.set(lockKey, String(fails + 1), 15 * 60 * 1000)
      void prisma.loginLog.create({ data: { userId: user.id, email: user.email, outcome: 'failed', reason: 'wrong_password', ipAddress: ip, userAgent: ua } }).catch(() => null)
      return reply.code(401).send({ error: 'Email hoặc mật khẩu chưa đúng' })
    }
    // ── Success: clear brute-force counter ─────────────────
    await cache.delete(lockKey)
    void prisma.loginLog.create({ data: { userId: user.id, email: user.email, outcome: 'success', ipAddress: ip, userAgent: ua } }).catch(() => null)
    await createSession(user.id, reply)
    return { user: publicUser(user) }
  })

  /**
   * Google Sign-In (GIS credential = OIDC id_token).
   * Same verified email → same User row (link google_sub, never duplicate).
   */
  app.post('/api/auth/login/google', async (request, reply) => {
    const body = z
      .object({
        credential: z.string().min(20).max(8192),
        /** Only for brand-new accounts; ignored if email already exists */
        role: z.enum(['parent', 'teacher']).optional().default('parent'),
      })
      .parse(request.body)

    const { verifyGoogleIdToken, isGoogleAuthConfigured } = await import(
      '../../infrastructure/auth/google-id-token.js'
    )
    if (!isGoogleAuthConfigured()) {
      request.log.error('auth.google_login not_configured')
      return reply.code(503).send({
        error: 'Đăng nhập Google chưa được bật. Dùng email/mật khẩu nhé.',
      })
    }

    try {
      const profile = await verifyGoogleIdToken(body.credential)
      const { loginOrLinkGoogleAccount } = await import('./google-account.js')
      const result = await loginOrLinkGoogleAccount({
        profile,
        preferredRole: body.role,
      })
      await createSession(result.user.id, reply)
      request.log.info(
        {
          userId: result.user.id,
          role: result.user.role,
          created: result.created,
          linked: result.linked,
          emailDomain: profile.email.split('@')[1],
        },
        'auth.google_login ok',
      )
      return {
        user: result.user,
        created: result.created,
        linked: result.linked,
      }
    } catch (e) {
      const err = e as Error & { statusCode?: number; logCode?: string }
      request.log.warn(
        {
          logCode: err.logCode,
          err: err.message,
          statusCode: err.statusCode,
        },
        'auth.google_login failed',
      )
      if (err.statusCode) throw e
      throw Object.assign(new Error('Không đăng nhập được bằng Google.'), {
        statusCode: 401,
        logCode: 'GOOGLE_LOGIN_FAILED',
      })
    }
  })

  app.get('/api/auth/google/config', async () => {
    const { isGoogleAuthConfigured } = await import(
      '../../infrastructure/auth/google-id-token.js'
    )
    return {
      enabled: isGoogleAuthConfigured(),
      /** Public client id for GIS button (safe to expose) */
      clientId: env.googleClientId || null,
    }
  })

  app.post('/api/auth/register/adult', async (request, reply) => {
    const body = registerAdultSchema.parse(request.body)
    const email = body.email.toLowerCase()
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return reply.code(409).send({ error: 'Email đã được dùng' })
    }
    const passwordHash = await hashPassword(body.password)
    const user = await prisma.user.create({
      data: {
        role: body.role,
        email,
        passwordHash,
        nickname: body.nickname ?? (body.role === 'parent' ? 'Phụ huynh' : 'Giáo viên'),
        onboarded: true,
        active: true,
      },
    })

    // Auto-create role-specific profile
    if (body.role === 'parent') {
      await prisma.parentProfile.create({
        data: { userId: user.id },
      })
      // Khan Kids-style: new family starts on Free household plan
      const { ensureHouseholdSubscription } = await import(
        '../parent/family.service.js'
      )
      await ensureHouseholdSubscription(user.id)
    } else if (body.role === 'teacher') {
      await prisma.teacherProfile.create({
        data: { userId: user.id, displayName: body.nickname },
      })
    }

    await createSession(user.id, reply)
    return reply.code(201).send({ user: publicUser(user) })
  })

  app.post('/api/auth/login/student', async (request, reply) => {
    const body = studentLoginSchema.parse(request.body)
    const safe = isNicknameSafe(body.nickname)
    if (!safe.ok) {
      request.log.warn(
        { reason: safe.reason, nicknameLen: body.nickname.length },
        'auth.student_login nickname_rejected',
      )
      return reply.code(400).send({ error: safe.message })
    }

    let user = await prisma.user.findFirst({
      where: {
        role: 'student',
        nickname: body.nickname.trim(),
      },
    })

    // Dev-only orphan create — still attaches default parent when configured
    if (!user && body.createIfMissing && env.studentAutoCreate) {
      const defaults = await resolveStudentDefaults()
      request.log.info(
        {
          nickname: body.nickname.trim(),
          parentId: defaults.parentId,
          classId: defaults.classId,
        },
        'auth.student_login auto_create_dev',
      )
      user = await prisma.user.create({
        data: {
          role: 'student',
          nickname: body.nickname.trim(),
          avatarId: body.avatarId,
          parentId: defaults.parentId,
          classId: defaults.classId,
          level: 1,
          xp: 0,
          onboarded: false,
          active: true,
        },
      })
    }

    if (!user) {
      request.log.info(
        { nickname: body.nickname.trim() },
        'auth.student_login not_found',
      )
      return reply.code(404).send({
        error:
          'Chưa tìm thấy bạn nhỏ này. Nhờ ba/mẹ đăng nhập và tạo hồ sơ cho con trước nhé!',
      })
    }

    if (user.active === false) {
      request.log.warn(
        { userId: user.id },
        'auth.student_login inactive',
      )
      return reply.code(403).send({
        error: 'Tài khoản đang tạm khóa. Ba/mẹ kiểm tra giúp con nhé.',
      })
    }

    // Production: child must be linked to a parent
    if (!user.parentId && env.isProd) {
      request.log.error(
        { userId: user.id },
        'auth.student_login missing_parent_link',
      )
      return reply.code(403).send({
        error: 'Hồ sơ chưa sẵn sàng. Nhờ ba/mẹ hoặc thầy cô hỗ trợ nhé.',
      })
    }

    if (user.pinHash) {
      if (!body.pin) {
        request.log.info({ userId: user.id }, 'auth.student_login pin_required')
        return reply.code(401).send({
          error: 'Ba/mẹ đã đặt mã PIN. Con nhập đủ 6 số để vào học nhé.',
        })
      }
      const ok = await verifyPassword(body.pin, user.pinHash)
      if (!ok) {
        request.log.warn({ userId: user.id }, 'auth.student_login pin_invalid')
        return reply.code(401).send({
          error: 'Mã PIN chưa đúng. Thử lại hoặc hỏi ba/mẹ nhé.',
        })
      }
    }

    if (!user.pinHash && user.avatarId !== body.avatarId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatarId: body.avatarId },
      })
    }

    await createSession(user.id, reply)
    request.log.info(
      { userId: user.id, parentId: user.parentId },
      'auth.student_login ok',
    )
    return { user: publicUser(user) }
  })

  app.post('/api/auth/logout', async (request, reply) => {
    await destroySession(request, reply)
    return { ok: true }
  })

  app.get('/api/auth/me', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({ error: 'Bạn cần đăng nhập lại nhé.' })
    }
    return { user: request.user }
  })

  app.patch('/api/auth/me', async (request, reply) => {
    const user = requireUser(request)
    // Goals align with curriculum tracks K1–K6 (see courses/ + domain COURSE_KEYS)
    const body = z
      .object({
        onboarded: z.boolean().optional(),
        goal: z
          .enum([
            'world',
            'character',
            'story',
            'comic',
            'motion',
            'film',
            // legacy aliases kept for older clients
            'video',
          ])
          .nullable()
          .optional(),
        nickname: z.string().min(1).max(16).optional(),
        avatarId: z.string().min(1).max(40).optional(),
      })
      .parse(request.body)

    if (body.nickname) {
      const safe = isNicknameSafe(body.nickname)
      if (!safe.ok) {
        return reply.code(400).send({ error: safe.message })
      }
    }

    // Normalize legacy "video" → film (K6) for curriculum consistency
    const goal =
      body.goal === undefined
        ? undefined
        : body.goal === 'video'
          ? 'film'
          : body.goal

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        onboarded: body.onboarded,
        goal: goal === undefined ? undefined : goal,
        nickname: body.nickname,
        avatarId: body.avatarId,
      },
    })

    // Drop stale Redis snapshots (onboarded/goal) then warm current token
    await invalidateUserSessionCache(user.id)
    const { refreshSessionUserCache } = await import(
      '../../infrastructure/session/session.js'
    )
    const authUser =
      (await refreshSessionUserCache(
        request.cookies[SESSION_COOKIE],
        user.id,
      )) ?? publicUser(updated)

    request.log.info(
      {
        userId: user.id,
        onboarded: updated.onboarded,
        goal: updated.goal,
      },
      'auth.patch_me ok',
    )

    return { user: authUser }
  })

  // ── Forgot Password ───────────────────────────────────────
  app.post('/api/auth/forgot-password', async (request, reply) => {
    const { email } = z.object({ email: z.string().email() }).parse(request.body)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Always return success to prevent email enumeration
    if (!user || user.role === 'student' || !user.active) {
      return { message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi.' }
    }

    // Generate reset token and store in Redis (1 hour TTL)
    const { nanoid } = await import('nanoid')
    const resetToken = nanoid(48)
    const cache = getCache()
    await cache.set(`reset:${resetToken}`, user.id, 60 * 60 * 1000) // 1 hour

    // Send email
    const resetUrl = `${env.appUrl}/reset-password?token=${resetToken}`
    try {
      await emailService.sendPasswordResetEmail(user.email!, resetUrl)
    } catch (err) {
      console.error('[Auth] Failed to send password reset email:', (err as Error).message)
    }

    return { message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi.' }
  })

  // ── Reset Password (from email link) ──────────────────────
  app.post('/api/auth/reset-password', async (request, reply) => {
    const body = z.object({
      token: z.string().min(1),
      password: z
        .string()
        .min(8)
        .max(128)
        .regex(/[A-Za-z]/, 'Cần chữ')
        .regex(/[0-9]/, 'Cần số'),
    }).parse(request.body)

    const cache = getCache()
    const userId = await cache.get(`reset:${body.token}`)
    if (!userId) {
      return reply.code(400).send({ error: 'Link đã hết hạn hoặc không hợp lệ.' })
    }

    const passwordHash = await hashPassword(body.password)
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    })

    // Delete used token
    await cache.delete(`reset:${body.token}`)

    // Invalidate all sessions for security
    await prisma.session.deleteMany({ where: { userId } })

    return { message: 'Mật khẩu đã được đặt lại. Vui lòng đăng nhập lại.' }
  })

  // ── Change Password (while logged in) ─────────────────────
  app.post('/api/auth/change-password', async (request, reply) => {
    const user = requireUser(request)
    if (user.role === 'student') {
      return reply.code(403).send({ error: 'Học sinh không cần mật khẩu.' })
    }

    const body = z.object({
      currentPassword: z.string().min(1),
      newPassword: z
        .string()
        .min(8)
        .max(128)
        .regex(/[A-Za-z]/, 'Cần chữ')
        .regex(/[0-9]/, 'Cần số'),
    }).parse(request.body)

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!dbUser?.passwordHash) {
      return reply.code(400).send({ error: 'Tài khoản chưa có mật khẩu.' })
    }

    const ok = await verifyPassword(body.currentPassword, dbUser.passwordHash)
    if (!ok) {
      return reply.code(401).send({ error: 'Mật khẩu hiện tại không đúng.' })
    }

    const passwordHash = await hashPassword(body.newPassword)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    })

    return { message: 'Mật khẩu đã được thay đổi.' }
  })
}

