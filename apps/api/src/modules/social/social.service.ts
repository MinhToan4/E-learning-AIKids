import { createHmac, randomInt } from 'node:crypto'
import {
  FAVORITE_FRIEND_LIMIT,
  canonicalConnectionPair,
  friendInviteStatus,
  normalizeFriendCode,
} from '@aikids/domain'
import { env } from '../../config/env.js'
import { prisma } from '../../infrastructure/database/prisma.js'

const INVITE_TTL_MS = 15 * 60 * 1000
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function inviteCode(): string {
  return Array.from(
    { length: 8 },
    () => CODE_ALPHABET[randomInt(0, CODE_ALPHABET.length)],
  ).join('')
}

function hashInviteCode(code: string): string {
  return createHmac('sha256', env.jwtSecret)
    .update(`friend-invite:${normalizeFriendCode(code)}`)
    .digest('hex')
}

export async function createFriendInvite(senderChildId: string) {
  const sender = await prisma.user.findFirst({
    where: {
      id: senderChildId,
      role: 'student',
      active: true,
      parentId: { not: null },
    },
    select: { id: true },
  })
  if (!sender) {
    throw serviceError(
      409,
      'Hồ sơ cần liên kết với phụ huynh trước khi kết bạn.',
    )
  }
  await prisma.friendInvite.updateMany({
    where: {
      senderChildId,
      status: 'created',
      expiresAt: { lte: new Date() },
    },
    data: { status: 'expired' },
  })

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const code = inviteCode()
    try {
      const invite = await prisma.friendInvite.create({
        data: {
          senderChildId,
          codeHash: hashInviteCode(code),
          expiresAt: new Date(Date.now() + INVITE_TTL_MS),
        },
      })
      return { invite, code }
    } catch (error) {
      if (!isUniqueConstraint(error)) throw error
    }
  }
  throw serviceError(503, 'Chưa tạo được mã kết bạn. Thử lại sau nhé.')
}

export async function acceptFriendInvite(
  recipientChildId: string,
  rawCode: string,
) {
  const code = normalizeFriendCode(rawCode)
  const invite = await prisma.friendInvite.findUnique({
    where: { codeHash: hashInviteCode(code) },
    include: {
      senderChild: {
        select: {
          id: true,
          role: true,
          active: true,
          parentId: true,
          nickname: true,
          avatarId: true,
        },
      },
    },
  })
  if (!invite || invite.status !== 'created') {
    throw serviceError(404, 'Mã kết bạn không đúng hoặc đã được sử dụng.')
  }
  if (invite.expiresAt.getTime() <= Date.now()) {
    await prisma.friendInvite.update({
      where: { id: invite.id },
      data: { status: 'expired' },
    })
    throw serviceError(410, 'Mã kết bạn đã hết hạn.')
  }
  if (
    invite.senderChildId === recipientChildId ||
    invite.senderChild.role !== 'student' ||
    !invite.senderChild.active
  ) {
    throw serviceError(400, 'Không thể dùng mã kết bạn này.')
  }

  const recipient = await prisma.user.findFirst({
    where: { id: recipientChildId, role: 'student', active: true },
    select: { id: true, parentId: true },
  })
  if (!recipient?.parentId || !invite.senderChild.parentId) {
    throw serviceError(
      409,
      'Hai hồ sơ cần liên kết với phụ huynh trước khi kết bạn.',
    )
  }
  await assertNotBlocked(invite.senderChildId, recipientChildId)
  const [childAId, childBId] = canonicalConnectionPair(
    invite.senderChildId,
    recipientChildId,
  )
  const existing = await prisma.childConnection.findUnique({
    where: { childAId_childBId: { childAId, childBId } },
  })
  if (existing?.status === 'active') {
    throw serviceError(409, 'Hai con đã là bạn bè.')
  }

  const accepted = await prisma.friendInvite.updateMany({
    where: {
      id: invite.id,
      status: 'created',
      recipientChildId: null,
      expiresAt: { gt: new Date() },
    },
    data: {
      recipientChildId,
      recipientAcceptedAt: new Date(),
      status: 'parent_review',
    },
  })
  if (accepted.count !== 1) {
    throw serviceError(409, 'Mã kết bạn vừa được sử dụng.')
  }
  return {
    id: invite.id,
    status: 'parent_review',
    sender: invite.senderChild,
  }
}

export async function listChildConnections(childId: string) {
  const [connections, favorites] = await prisma.$transaction([
    prisma.childConnection.findMany({
      where: {
        status: 'active',
        OR: [{ childAId: childId }, { childBId: childId }],
      },
      include: {
        childA: {
          select: {
            id: true,
            nickname: true,
            avatarId: true,
            level: true,
          },
        },
        childB: {
          select: {
            id: true,
            nickname: true,
            avatarId: true,
            level: true,
          },
        },
      },
      orderBy: { approvedAt: 'desc' },
    }),
    prisma.favoriteConnection.findMany({
      where: { childId },
      orderBy: { position: 'asc' },
    }),
  ])
  const favoritePosition = new Map(
    favorites.map((item) => [item.connectionId, item.position]),
  )
  return connections.map((connection) => ({
    id: connection.id,
    friend:
      connection.childAId === childId
        ? connection.childB
        : connection.childA,
    favorite: favoritePosition.has(connection.id),
    favoritePosition: favoritePosition.get(connection.id) ?? null,
    connectedAt: connection.approvedAt,
  }))
}

export async function listChildInvites(childId: string) {
  const rows = await prisma.friendInvite.findMany({
    where: {
      OR: [{ senderChildId: childId }, { recipientChildId: childId }],
      status: { in: ['created', 'parent_review'] },
    },
    include: {
      senderChild: {
        select: { id: true, nickname: true, avatarId: true },
      },
      recipientChild: {
        select: { id: true, nickname: true, avatarId: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map(({ codeHash: _secret, ...row }) => row)
}

export async function listParentReviewInvites(parentId: string) {
  const rows = await prisma.friendInvite.findMany({
    where: {
      status: 'parent_review',
      OR: [
        { senderChild: { parentId } },
        { recipientChild: { parentId } },
      ],
    },
    include: {
      senderChild: {
        select: { id: true, nickname: true, avatarId: true },
      },
      recipientChild: {
        select: { id: true, nickname: true, avatarId: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  })
  return rows.map(publicInvite)
}

export async function reviewFriendInvite(input: {
  parentId: string
  inviteId: string
  decision: 'approved' | 'declined'
}) {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM friend_invites
      WHERE id = ${input.inviteId}::uuid
      FOR UPDATE
    `
    if (rows.length === 0) throw serviceError(404, 'Không tìm thấy lời mời.')

    const invite = await tx.friendInvite.findUnique({
      where: { id: input.inviteId },
      include: {
        senderChild: { select: { parentId: true } },
        recipientChild: { select: { parentId: true } },
      },
    })
    if (!invite || invite.status !== 'parent_review' || !invite.recipientChildId) {
      throw serviceError(409, 'Lời mời không còn chờ duyệt.')
    }
    const ownsSender = invite.senderChild.parentId === input.parentId
    const ownsRecipient = invite.recipientChild?.parentId === input.parentId
    if (!ownsSender && !ownsRecipient) {
      throw serviceError(403, 'Phụ huynh không quản lý hồ sơ trong lời mời này.')
    }
    if (input.decision === 'declined') {
      const declined = await tx.friendInvite.update({
        where: { id: invite.id },
        data: { status: 'declined' },
      })
      return { invite: publicInvite(declined), connection: null }
    }

    await assertNotBlocked(
      invite.senderChildId,
      invite.recipientChildId,
      tx,
    )
    const now = new Date()
    const senderApproved =
      invite.senderParentApprovedAt ?? (ownsSender ? now : null)
    const recipientApproved =
      invite.recipientParentApprovedAt ?? (ownsRecipient ? now : null)
    const status = friendInviteStatus({
      recipientAccepted: true,
      senderParentApproved: Boolean(senderApproved),
      recipientParentApproved: Boolean(recipientApproved),
    })
    const updated = await tx.friendInvite.update({
      where: { id: invite.id },
      data: {
        senderParentApprovedAt: senderApproved,
        recipientParentApprovedAt: recipientApproved,
        status,
      },
    })
    if (status !== 'active') {
      return { invite: publicInvite(updated), connection: null }
    }

    const [childAId, childBId] = canonicalConnectionPair(
      invite.senderChildId,
      invite.recipientChildId,
    )
    const connection = await tx.childConnection.upsert({
      where: { childAId_childBId: { childAId, childBId } },
      update: { status: 'active', approvedAt: now },
      create: { childAId, childBId, status: 'active', approvedAt: now },
    })
    return { invite: publicInvite(updated), connection }
  })
}

export async function setFavoriteConnection(input: {
  childId: string
  connectionId: string
  favorite: boolean
}) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM users WHERE id = ${input.childId}::uuid FOR UPDATE`
    const connection = await tx.childConnection.findFirst({
      where: {
        id: input.connectionId,
        status: 'active',
        OR: [{ childAId: input.childId }, { childBId: input.childId }],
      },
    })
    if (!connection) throw serviceError(404, 'Không tìm thấy bạn bè.')

    if (!input.favorite) {
      await tx.favoriteConnection.deleteMany({
        where: {
          childId: input.childId,
          connectionId: input.connectionId,
        },
      })
      return null
    }
    const existing = await tx.favoriteConnection.findUnique({
      where: {
        childId_connectionId: {
          childId: input.childId,
          connectionId: input.connectionId,
        },
      },
    })
    if (existing) return existing

    const current = await tx.favoriteConnection.findMany({
      where: { childId: input.childId },
      select: { position: true },
    })
    if (current.length >= FAVORITE_FRIEND_LIMIT) {
      throw serviceError(409, 'Con chỉ có thể ghim tối đa 6 bạn.')
    }
    const used = new Set(current.map((item) => item.position))
    const position = Array.from(
      { length: FAVORITE_FRIEND_LIMIT },
      (_, index) => index + 1,
    ).find((item) => !used.has(item))!
    return tx.favoriteConnection.create({
      data: {
        childId: input.childId,
        connectionId: input.connectionId,
        position,
      },
    })
  })
}

export async function removeConnection(childId: string, connectionId: string) {
  const deleted = await prisma.childConnection.deleteMany({
    where: {
      id: connectionId,
      OR: [{ childAId: childId }, { childBId: childId }],
    },
  })
  if (deleted.count === 0) throw serviceError(404, 'Không tìm thấy bạn bè.')
}

export async function blockChild(blockerChildId: string, blockedChildId: string) {
  canonicalConnectionPair(blockerChildId, blockedChildId)
  const target = await prisma.user.findFirst({
    where: { id: blockedChildId, role: 'student', active: true },
    select: { id: true },
  })
  if (!target) throw serviceError(404, 'Không tìm thấy hồ sơ.')

  const [childAId, childBId] = canonicalConnectionPair(
    blockerChildId,
    blockedChildId,
  )
  return prisma.$transaction(async (tx) => {
    const block = await tx.childBlock.upsert({
      where: {
        blockerChildId_blockedChildId: {
          blockerChildId,
          blockedChildId,
        },
      },
      update: {},
      create: { blockerChildId, blockedChildId },
    })
    await tx.childConnection.deleteMany({
      where: { childAId, childBId },
    })
    await tx.friendInvite.updateMany({
      where: {
        status: { in: ['created', 'parent_review'] },
        OR: [
          {
            senderChildId: blockerChildId,
            recipientChildId: blockedChildId,
          },
          {
            senderChildId: blockedChildId,
            recipientChildId: blockerChildId,
          },
        ],
      },
      data: { status: 'blocked' },
    })
    return block
  })
}

export async function unblockChild(
  blockerChildId: string,
  blockedChildId: string,
) {
  await prisma.childBlock.deleteMany({
    where: { blockerChildId, blockedChildId },
  })
}

async function assertNotBlocked(
  firstChildId: string,
  secondChildId: string,
  database: Pick<typeof prisma, 'childBlock'> = prisma,
) {
  const block = await database.childBlock.findFirst({
    where: {
      OR: [
        { blockerChildId: firstChildId, blockedChildId: secondChildId },
        { blockerChildId: secondChildId, blockedChildId: firstChildId },
      ],
    },
  })
  if (block) throw serviceError(403, 'Không thể tạo kết nối này.')
}

function isUniqueConstraint(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  )
}

function publicInvite<T extends { codeHash: string }>(
  invite: T,
): Omit<T, 'codeHash'> {
  const { codeHash: _secret, ...safe } = invite
  return safe
}

function serviceError(statusCode: number, message: string) {
  return Object.assign(new Error(message), { statusCode })
}
