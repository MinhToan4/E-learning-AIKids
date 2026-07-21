/**
 * Link Google identity to a single User by email (account unification).
 * Same Gmail → one row whether registered with password or Google first.
 */
import type { GoogleIdProfile } from '../../infrastructure/auth/google-id-token.js'
import { prisma } from '../../infrastructure/database/prisma.js'
import { publicUser, type AuthUser } from '../../infrastructure/session/session.js'

export type GoogleLoginResult = {
  user: AuthUser
  created: boolean
  linked: boolean
}

/**
 * Find or create adult user for verified Google profile.
 * - Prefer match by googleSub, then by email.
 * - Never create a second row for the same email.
 * - Students cannot use Google login.
 */
export async function loginOrLinkGoogleAccount(input: {
  profile: GoogleIdProfile
  /** Only used when creating a brand-new user */
  preferredRole: 'parent' | 'teacher'
}): Promise<GoogleLoginResult> {
  const { profile, preferredRole } = input
  const email = profile.email

  const bySub = await prisma.user.findFirst({
    where: { googleSub: profile.sub },
  })
  const byEmail = await prisma.user.findUnique({ where: { email } })

  // Conflict: two different rows claim this Google vs this email
  if (bySub && byEmail && bySub.id !== byEmail.id) {
    const err = new Error(
      'Tài khoản Google và email này đang gắn với hai hồ sơ khác nhau. Liên hệ hỗ trợ nhé.',
    ) as Error & { statusCode: number; logCode?: string }
    err.statusCode = 409
    err.logCode = 'GOOGLE_EMAIL_SUB_CONFLICT'
    throw err
  }

  let user = bySub ?? byEmail

  if (user) {
    if (user.role === 'student') {
      const err = new Error(
        'Hồ sơ học sinh không đăng nhập bằng Google. Dùng biệt danh con nhé.',
      ) as Error & { statusCode: number; logCode?: string }
      err.statusCode = 403
      err.logCode = 'GOOGLE_STUDENT_FORBIDDEN'
      throw err
    }
    if (user.active === false) {
      const err = new Error(
        'Tài khoản đang tạm khóa. Liên hệ hỗ trợ nhé.',
      ) as Error & { statusCode: number; logCode?: string }
      err.statusCode = 403
      err.logCode = 'GOOGLE_USER_INACTIVE'
      throw err
    }

    // Email already linked to a different Google subject
    if (
      user.googleSub &&
      user.googleSub !== profile.sub
    ) {
      const err = new Error(
        'Email này đã liên kết Google khác. Đăng nhập email/mật khẩu hoặc dùng đúng tài khoản Google.',
      ) as Error & { statusCode: number; logCode?: string }
      err.statusCode = 409
      err.logCode = 'GOOGLE_SUB_MISMATCH'
      throw err
    }

    let linked = false
    const data: { googleSub?: string; nickname?: string } = {}
    if (!user.googleSub) {
      data.googleSub = profile.sub
      linked = true
    }
    // Fill nickname if empty
    if (!user.nickname && profile.name) {
      data.nickname = profile.name.slice(0, 40)
    }

    if (Object.keys(data).length > 0) {
      user = await prisma.user.update({
        where: { id: user.id },
        data,
      })
    }

    return { user: publicUser(user), created: false, linked }
  }

  // New adult account (Google-first)
  const nickname =
    (profile.name?.trim().slice(0, 40) ||
      (preferredRole === 'teacher' ? 'Giáo viên' : 'Phụ huynh')) 

  user = await prisma.user.create({
    data: {
      role: preferredRole,
      email,
      googleSub: profile.sub,
      passwordHash: null,
      nickname,
      onboarded: true,
      active: true,
    },
  })

  if (preferredRole === 'parent') {
    await prisma.parentProfile.create({ data: { userId: user.id } })
    const { ensureHouseholdSubscription } = await import(
      '../parent/family.service.js'
    )
    await ensureHouseholdSubscription(user.id)
  } else {
    await prisma.teacherProfile.create({
      data: { userId: user.id, displayName: nickname },
    })
  }

  return { user: publicUser(user), created: true, linked: true }
}
