import type { FirebaseIdProfile } from '../../infrastructure/firebase/firebase-auth.js'
import { prisma } from '../../infrastructure/database/prisma.js'
import { publicUser, type AuthUser } from '../../infrastructure/session/session.js'

export type FirebaseLoginResult = {
  user: AuthUser
  created: boolean
  linked: boolean
}

function authError(message: string, statusCode: number, logCode: string): Error {
  return Object.assign(new Error(message), { statusCode, logCode })
}

/** Students authenticate through the parent-provisioned nickname/PIN flow. */
export function assertFirebaseAccountRole(role: string): void {
  if (role === 'student') {
    throw authError(
      'Hồ sơ học sinh không đăng nhập bằng StoryMee. Hãy dùng biệt danh/PIN.',
      403,
      'FIREBASE_STUDENT_FORBIDDEN',
    )
  }
}

/** Unifies StoryMee/Firebase identity with the existing Postgres user row. */
export async function loginOrLinkFirebaseAccount(input: {
  profile: FirebaseIdProfile
  preferredRole: 'parent' | 'teacher'
}): Promise<FirebaseLoginResult> {
  const { profile, preferredRole } = input
  const [byUid, byEmail] = await Promise.all([
    prisma.user.findUnique({ where: { firebaseUid: profile.uid } }),
    profile.email
      ? prisma.user.findUnique({ where: { email: profile.email } })
      : Promise.resolve(null),
  ])

  if (byUid && byEmail && byUid.id !== byEmail.id) {
    throw authError('Danh tính StoryMee đang gắn với hai hồ sơ khác nhau.', 409, 'FIREBASE_IDENTITY_CONFLICT')
  }

  let user = byUid ?? byEmail
  if (user) {
    assertFirebaseAccountRole(user.role)
    if (!byUid && !profile.emailVerified) {
      throw authError('Email StoryMee chưa được xác minh.', 401, 'FIREBASE_EMAIL_UNVERIFIED')
    }
    if (!user.active) {
      throw authError('Tài khoản đang tạm khóa.', 403, 'FIREBASE_USER_INACTIVE')
    }
    if (user.firebaseUid && user.firebaseUid !== profile.uid) {
      throw authError('Email này đã liên kết với một tài khoản StoryMee khác.', 409, 'FIREBASE_UID_MISMATCH')
    }

    let linked = false
    if (!user.firebaseUid) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firebaseUid: profile.uid,
          ...(!user.nickname && profile.name ? { nickname: profile.name.slice(0, 40) } : {}),
        },
      })
      linked = true
    }
    return { user: publicUser(user), created: false, linked }
  }

  if (!profile.email || !profile.emailVerified) {
    throw authError('Cần email StoryMee đã xác minh để tạo tài khoản.', 401, 'FIREBASE_VERIFIED_EMAIL_REQUIRED')
  }

  const nickname = profile.name?.trim().slice(0, 40) ||
    (preferredRole === 'teacher' ? 'Giáo viên' : 'Phụ huynh')

  user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        role: preferredRole,
        email: profile.email,
        firebaseUid: profile.uid,
        passwordHash: null,
        nickname,
        onboarded: true,
        active: true,
      },
    })
    if (preferredRole === 'parent') {
      await tx.parentProfile.create({ data: { userId: created.id } })
    } else {
      await tx.teacherProfile.create({ data: { userId: created.id, displayName: nickname } })
    }
    return created
  })

  if (preferredRole === 'parent') {
    const { ensureHouseholdSubscription } = await import('../parent/family.service.js')
    await ensureHouseholdSubscription(user.id)
  }
  return { user: publicUser(user), created: true, linked: true }
}
