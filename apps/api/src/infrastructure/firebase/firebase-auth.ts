import { getAuth } from 'firebase-admin/auth'
import { prisma } from '../database/prisma.js'
import { requireFirebaseAdminApp } from './firebase-admin.js'
import type { AuthUser } from '../session/session.js'

export type FirebaseIdProfile = {
  uid: string
  email: string | null
  emailVerified: boolean
  name: string | null
}

export async function verifyFirebaseIdToken(idToken: string): Promise<FirebaseIdProfile> {
  const decoded = await getAuth(requireFirebaseAdminApp()).verifyIdToken(idToken, true)
  return {
    uid: decoded.uid,
    email: decoded.email?.trim().toLowerCase() ?? null,
    emailVerified: decoded.email_verified === true,
    name: typeof decoded.name === 'string' ? decoded.name : null,
  }
}

async function resolveFirebaseUid(user: AuthUser): Promise<string> {
  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { firebaseUid: true, email: true },
  })
  if (!record) throw Object.assign(new Error('User not found'), { statusCode: 404 })
  if (record.firebaseUid) return record.firebaseUid

  const auth = getAuth(requireFirebaseAdminApp())
  let uid: string | undefined
  if (record.email) {
    try {
      uid = (await auth.getUserByEmail(record.email)).uid
    } catch (error) {
      if ((error as { code?: string }).code !== 'auth/user-not-found') throw error
    }
  }
  uid ??= `aikids:${user.id}`

  await prisma.user.update({
    where: { id: user.id },
    data: { firebaseUid: uid },
  })
  return uid
}

export async function createFirebaseCustomToken(user: AuthUser): Promise<string> {
  const uid = await resolveFirebaseUid(user)
  let classIds = user.classId ? [user.classId] : []
  if (user.role === 'teacher') {
    classIds = (
      await prisma.classRoom.findMany({
        where: { teacherId: user.id, status: 'active' },
        orderBy: { createdAt: 'asc' },
        take: 20,
        select: { id: true },
      })
    ).map((classroom) => classroom.id)
  }

  return getAuth(requireFirebaseAdminApp()).createCustomToken(uid, {
    appUserId: user.id,
    role: user.role,
    ...(classIds[0] ? { classId: classIds[0], classIds } : {}),
  })
}
