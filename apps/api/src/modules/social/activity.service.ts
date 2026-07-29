import {
  PACO_PICK_WEEKLY_LIMIT,
  REACTION_TYPES,
  isSocialActivityType,
  type ActivityAudience,
  type ReactionType,
  type SocialActivityType,
} from '@aikids/domain'
import { prisma } from '../../infrastructure/database/prisma.js'
import { awardStorybookSticker } from '../storybook/storybook.service.js'

type ActivityDatabase = Pick<typeof prisma, 'socialActivity'>

export async function publishSocialActivity(input: {
  database?: ActivityDatabase
  actorChildId: string
  type: SocialActivityType
  title: string
  summary: string
  icon?: string
  coverUrl?: string
  rewardId?: string
  referenceId?: string
  audiences: ActivityAudience[]
  sourceEventId: string
}) {
  if (!isSocialActivityType(input.type)) {
    throw serviceError(400, 'Loại hoạt động không hợp lệ.')
  }
  const audiences = [...new Set(input.audiences)].filter(
    (item): item is ActivityAudience =>
      item === 'friends' || item === 'family' || item === 'school',
  )
  const database = input.database ?? prisma
  return database.socialActivity.upsert({
    where: { sourceEventId: input.sourceEventId },
    update: {},
    create: {
      actorChildId: input.actorChildId,
      type: input.type,
      title: input.title.slice(0, 160),
      summary: input.summary.slice(0, 280),
      icon: input.icon?.slice(0, 16),
      coverUrl: input.coverUrl,
      rewardId: input.rewardId,
      referenceId: input.referenceId,
      audiences,
      sourceEventId: input.sourceEventId,
    },
  })
}

export async function getSocialFeed(input: {
  viewerChildId: string
  limit: number
  cursor?: string
}) {
  const visibility = await activityVisibility(input.viewerChildId)
  const activities = await prisma.socialActivity.findMany({
    where: visibility,
    include: {
      actor: {
        select: {
          id: true,
          nickname: true,
          avatarId: true,
          level: true,
        },
      },
      reactions: {
        select: { actorChildId: true, type: true },
      },
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: input.limit + 1,
    ...(input.cursor
      ? { cursor: { id: input.cursor }, skip: 1 }
      : {}),
  })
  const hasMore = activities.length > input.limit
  const page = hasMore ? activities.slice(0, input.limit) : activities

  return {
    activities: page.map((activity) => ({
      id: activity.id,
      actor: activity.actor,
      type: activity.type,
      title: activity.title,
      summary: activity.summary,
      icon: activity.icon,
      coverUrl: activity.coverUrl,
      rewardId: activity.rewardId,
      referenceId: activity.referenceId,
      audiences: activity.audiences,
      createdAt: activity.createdAt,
      reactions: reactionSummary(
        activity.reactions,
        input.viewerChildId,
      ),
    })),
    nextCursor: hasMore ? page.at(-1)?.id ?? null : null,
  }
}

export async function setActivityReaction(input: {
  actorChildId: string
  activityId: string
  type: ReactionType
}) {
  if (!REACTION_TYPES.includes(input.type)) {
    throw serviceError(400, 'Reaction không hợp lệ.')
  }
  const visibility = await activityVisibility(input.actorChildId)
  const activity = await prisma.socialActivity.findFirst({
    where: { id: input.activityId, ...visibility },
    select: { id: true, actorChildId: true },
  })
  if (!activity) throw serviceError(404, 'Không tìm thấy hoạt động.')
  if (activity.actorChildId === input.actorChildId) {
    throw serviceError(403, 'Con không thể reaction hoạt động của chính mình.')
  }

  const reaction = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
      SELECT id FROM users
      WHERE id = ${input.actorChildId}::uuid
      FOR UPDATE
    `
    const existing = await tx.socialReaction.findUnique({
      where: {
        activityId_actorChildId: {
          activityId: input.activityId,
          actorChildId: input.actorChildId,
        },
      },
    })
    if (input.type === 'PACO_PICK' && existing?.type !== 'PACO_PICK') {
      const used = await tx.socialReaction.count({
        where: {
          actorChildId: input.actorChildId,
          type: 'PACO_PICK',
          createdAt: { gte: startOfIsoWeek() },
        },
      })
      if (used >= PACO_PICK_WEEKLY_LIMIT) {
        throw serviceError(409, 'Con đã dùng đủ 3 Paco Pick tuần này.')
      }
    }
    return tx.socialReaction.upsert({
      where: {
        activityId_actorChildId: {
          activityId: input.activityId,
          actorChildId: input.actorChildId,
        },
      },
      update: { type: input.type, createdAt: new Date() },
      create: input,
    })
  })

  const reactionsGiven = await prisma.socialReaction.count({
    where: { actorChildId: input.actorChildId },
  })
  await awardStorybookSticker({
    userId: input.actorChildId,
    stickerId: 'P08-S1',
    sourceEventId: `social:${input.actorChildId}:first-reaction`,
    sourceType: 'social',
  })
  if (reactionsGiven >= 10) {
    await awardStorybookSticker({
      userId: input.actorChildId,
      stickerId: 'P08-S2',
      sourceEventId: `social:${input.actorChildId}:reaction-10`,
      sourceType: 'social',
    })
  }
  return reaction
}

export async function removeActivityReaction(input: {
  actorChildId: string
  activityId: string
  type: ReactionType
}) {
  await prisma.socialReaction.deleteMany({
    where: {
      activityId: input.activityId,
      actorChildId: input.actorChildId,
      type: input.type,
    },
  })
}

async function activityVisibility(viewerChildId: string) {
  const viewer = await prisma.user.findFirst({
    where: { id: viewerChildId, role: 'student', active: true },
    select: { parentId: true, classId: true },
  })
  if (!viewer) throw serviceError(404, 'Không tìm thấy hồ sơ.')

  const [connections, family, school, blocks] = await Promise.all([
    prisma.childConnection.findMany({
      where: {
        status: 'active',
        OR: [{ childAId: viewerChildId }, { childBId: viewerChildId }],
      },
      select: { childAId: true, childBId: true },
    }),
    viewer.parentId
      ? prisma.user.findMany({
          where: {
            parentId: viewer.parentId,
            role: 'student',
            active: true,
          },
          select: { id: true },
        })
      : Promise.resolve([]),
    viewer.classId
      ? prisma.user.findMany({
          where: {
            classId: viewer.classId,
            role: 'student',
            active: true,
          },
          select: { id: true },
        })
      : Promise.resolve([]),
    prisma.childBlock.findMany({
      where: {
        OR: [
          { blockerChildId: viewerChildId },
          { blockedChildId: viewerChildId },
        ],
      },
      select: { blockerChildId: true, blockedChildId: true },
    }),
  ])
  const friendIds = connections.map((item) =>
    item.childAId === viewerChildId ? item.childBId : item.childAId,
  )
  const blockedIds = blocks.map((item) =>
    item.blockerChildId === viewerChildId
      ? item.blockedChildId
      : item.blockerChildId,
  )

  return {
    actorChildId: { notIn: blockedIds },
    OR: [
      { actorChildId: viewerChildId },
      {
        actorChildId: { in: friendIds },
        audiences: { has: 'friends' },
      },
      {
        actorChildId: { in: family.map((item) => item.id) },
        audiences: { has: 'family' },
      },
      {
        actorChildId: { in: school.map((item) => item.id) },
        audiences: { has: 'school' },
      },
    ],
  }
}

function reactionSummary(
  reactions: Array<{ actorChildId: string; type: string }>,
  viewerChildId: string,
) {
  const counts = Object.fromEntries(
    REACTION_TYPES.map((type) => [type, 0]),
  ) as Record<ReactionType, number>
  for (const reaction of reactions) {
    if (reaction.type in counts) {
      counts[reaction.type as ReactionType] += 1
    }
  }
  return {
    counts,
    total: reactions.length,
    mine:
      (reactions.find((item) => item.actorChildId === viewerChildId)
        ?.type as ReactionType | undefined) ?? null,
  }
}

function startOfIsoWeek(now = new Date()): Date {
  const start = new Date(now)
  const day = start.getUTCDay() || 7
  start.setUTCDate(start.getUTCDate() - day + 1)
  start.setUTCHours(0, 0, 0, 0)
  return start
}

function serviceError(statusCode: number, message: string) {
  return Object.assign(new Error(message), { statusCode })
}
