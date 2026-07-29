import type { AuthUser } from '../../infrastructure/session/session.js'
import { prisma } from '../../infrastructure/database/prisma.js'
import type { ActivityAudience } from '@aikids/domain'

export async function audiencesForViewer(
  ownerChildId: string,
  viewer: AuthUser,
): Promise<{
  owner: {
    id: string
    parentId: string | null
    classId: string | null
    nickname: string | null
    avatarId: string | null
    level: number
    xp: number
  }
  isOwner: boolean
  audiences: Set<ActivityAudience>
}> {
  const owner = await prisma.user.findFirst({
    where: { id: ownerChildId, role: 'student', active: true },
    select: {
      id: true,
      parentId: true,
      classId: true,
      nickname: true,
      avatarId: true,
      level: true,
      xp: true,
    },
  })
  if (!owner) throw accessError(404, 'Không tìm thấy hồ sơ.')
  if (viewer.id === owner.id) {
    return { owner, isOwner: true, audiences: new Set() }
  }
  if (viewer.role === 'admin') {
    return {
      owner,
      isOwner: false,
      audiences: new Set(['friends', 'family', 'school']),
    }
  }

  const blocked = await prisma.childBlock.findFirst({
    where: {
      OR: [
        { blockerChildId: owner.id, blockedChildId: viewer.id },
        { blockerChildId: viewer.id, blockedChildId: owner.id },
      ],
    },
  })
  if (blocked) throw accessError(404, 'Không tìm thấy hồ sơ.')

  const audiences = new Set<ActivityAudience>()
  if (
    owner.parentId &&
    (viewer.id === owner.parentId ||
      (viewer.role === 'student' && viewer.parentId === owner.parentId))
  ) {
    audiences.add('family')
  }
  if (
    owner.classId &&
    (viewer.classId === owner.classId ||
      (viewer.role === 'teacher' &&
        await prisma.classRoom.count({
          where: { id: owner.classId, teacherId: viewer.id },
        }) > 0))
  ) {
    audiences.add('school')
  }
  if (viewer.role === 'student') {
    const [childAId, childBId] =
      owner.id < viewer.id ? [owner.id, viewer.id] : [viewer.id, owner.id]
    const connection = await prisma.childConnection.findFirst({
      where: { childAId, childBId, status: 'active' },
    })
    if (connection) audiences.add('friends')
  }
  return { owner, isOwner: false, audiences }
}

export function accessError(statusCode: number, message: string) {
  return Object.assign(new Error(message), { statusCode })
}
