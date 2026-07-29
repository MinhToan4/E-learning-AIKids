import {
  LEGACY_TO_STICKER_MAP,
  REWARD_CATALOG,
  STORYBOOK_CHAPTERS,
  chapterReward,
  explorerLevelForXp,
  isChapterClaimable,
  isStorybookStickerId,
  storybookChapter,
  type RewardKind,
} from '@aikids/domain'
import { prisma } from '../../infrastructure/database/prisma.js'

type StorybookSource =
  | 'achievement'
  | 'chapter_claim'
  | 'learning'
  | 'creative'
  | 'social'
  | 'migration'

export async function awardStorybookSticker(input: {
  userId: string
  stickerId: string
  sourceEventId: string
  sourceType: StorybookSource
}) {
  if (!isStorybookStickerId(input.stickerId)) {
    throw serviceError(400, 'Sticker Storybook không hợp lệ.')
  }

  return prisma.storybookSticker.upsert({
    where: {
      userId_stickerId: {
        userId: input.userId,
        stickerId: input.stickerId,
      },
    },
    update: {},
    create: input,
  })
}

/**
 * Compatibility projection for achievements earned before Storybook had its
 * own persistence. Safe to run on every read because both keys are unique.
 */
export async function syncAchievementStickers(userId: string): Promise<void> {
  const achievements = await prisma.achievement.findMany({
    where: { userId },
    select: { id: true, type: true },
  })
  await Promise.all(
    achievements.flatMap((achievement) => {
      const stickerId = LEGACY_TO_STICKER_MAP[achievement.type]
      if (!stickerId) return []
      return [
        awardStorybookSticker({
          userId,
          stickerId,
          sourceEventId: `achievement:${achievement.id}`,
          sourceType: 'achievement',
        }),
      ]
    }),
  )
}

export async function syncXpRewards(userId: string, xp: number): Promise<void> {
  const level = explorerLevelForXp(xp).level
  const unlocked = REWARD_CATALOG.filter(
    (reward) =>
      reward.unlock.type === 'xp_level' &&
      Number(reward.unlock.value) <= level,
  )
  if (unlocked.length === 0) return

  await prisma.$transaction(
    unlocked.map((reward) =>
      prisma.rewardInventory.upsert({
        where: {
          userId_rewardId: { userId, rewardId: reward.id },
        },
        update: {},
        create: {
          userId,
          rewardId: reward.id,
          sourceEventId: `xp-level:${userId}:${Number(reward.unlock.value)}`,
          sourceType: 'xp_level',
        },
      }),
    ),
  )
}

export async function getStorybook(userId: string, xp: number) {
  await Promise.all([
    syncAchievementStickers(userId),
    syncXpRewards(userId, xp),
  ])
  const [stickers, inventory] = await prisma.$transaction([
    prisma.storybookSticker.findMany({
      where: { userId },
      orderBy: { earnedAt: 'asc' },
    }),
    prisma.rewardInventory.findMany({
      where: { userId },
      select: { rewardId: true },
    }),
  ])
  const earned = new Set(stickers.map((item) => item.stickerId))
  const rewards = new Set(inventory.map((item) => item.rewardId))

  return {
    pages: STORYBOOK_CHAPTERS.map((item) => ({
      slug: item.slug,
      title: item.title,
      group: item.group,
      earnedStickerIds: item.stickerIds.filter((id) => earned.has(id)),
      bossStickerId: item.bossStickerId,
      bossEarned: earned.has(item.bossStickerId),
      claimable:
        !earned.has(item.bossStickerId) && isChapterClaimable(item, earned),
      rewardId: item.rewardId,
      rewardClaimed: rewards.has(item.rewardId),
    })),
    stickers,
  }
}

export async function claimChapter(
  userId: string,
  chapterSlug: string,
) {
  const definition = storybookChapter(chapterSlug)
  if (!definition) throw serviceError(404, 'Không tìm thấy Chapter này.')

  return prisma.$transaction(async (tx) => {
    // Serialize claims for one child without introducing a separate lock table.
    await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId}::uuid FOR UPDATE`
    const earned = await tx.storybookSticker.findMany({
      where: { userId },
      select: { stickerId: true },
    })
    const earnedIds = new Set(earned.map((item) => item.stickerId))
    if (!isChapterClaimable(definition, earnedIds)) {
      throw serviceError(
        409,
        'Con cần đủ 8 sticker thường trước khi nhận phần thưởng Chapter.',
      )
    }

    const boss = await tx.storybookSticker.upsert({
      where: {
        userId_stickerId: {
          userId,
          stickerId: definition.bossStickerId,
        },
      },
      update: {},
      create: {
        userId,
        stickerId: definition.bossStickerId,
        sourceEventId: `chapter:${userId}:${definition.slug}:boss`,
        sourceType: 'chapter_claim',
      },
    })
    const rewardDefinition = chapterReward(definition)
    const reward = await tx.rewardInventory.upsert({
      where: {
        userId_rewardId: {
          userId,
          rewardId: rewardDefinition.id,
        },
      },
      update: {},
      create: {
        userId,
        rewardId: rewardDefinition.id,
        sourceEventId: `chapter:${userId}:${definition.slug}:reward`,
        sourceType: 'chapter_claim',
      },
    })
    return { chapter: definition, boss, reward, rewardDefinition }
  })
}

export async function getRewards(userId: string, xp: number) {
  await syncXpRewards(userId, xp)
  const [inventory, equipment] = await prisma.$transaction([
    prisma.rewardInventory.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'asc' },
    }),
    prisma.rewardEquipment.findMany({
      where: { userId },
      orderBy: { kind: 'asc' },
    }),
  ])
  const definitions = new Map(REWARD_CATALOG.map((item) => [item.id, item]))
  return {
    inventory: inventory.map((item) => ({
      ...item,
      definition: definitions.get(item.rewardId) ?? null,
    })),
    equipment,
  }
}

export async function equipReward(input: {
  userId: string
  kind: RewardKind
  rewardId: string | null
}) {
  if (input.rewardId === null) {
    await prisma.rewardEquipment.deleteMany({
      where: { userId: input.userId, kind: input.kind },
    })
    return null
  }

  const definition = REWARD_CATALOG.find(
    (item) => item.id === input.rewardId,
  )
  if (!definition || definition.kind !== input.kind) {
    throw serviceError(400, 'Phần thưởng không khớp loại trang bị.')
  }
  const owned = await prisma.rewardInventory.findUnique({
    where: {
      userId_rewardId: {
        userId: input.userId,
        rewardId: input.rewardId,
      },
    },
  })
  if (!owned) {
    throw serviceError(403, 'Con chưa mở khóa phần thưởng này.')
  }

  return prisma.rewardEquipment.upsert({
    where: {
      userId_kind: { userId: input.userId, kind: input.kind },
    },
    update: { rewardId: input.rewardId },
    create: {
      userId: input.userId,
      kind: input.kind,
      rewardId: input.rewardId,
    },
  })
}

function serviceError(statusCode: number, message: string) {
  return Object.assign(new Error(message), { statusCode })
}
