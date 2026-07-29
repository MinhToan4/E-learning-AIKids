import {
  PROFILE_MODULES,
  REWARD_CATALOG,
  STORYBOOK_CHAPTERS,
  isShareableWorkspaceKind,
  type ActivityAudience,
  type ProfileModule,
} from '@aikids/domain'
import type { AuthUser } from '../../infrastructure/session/session.js'
import { prisma } from '../../infrastructure/database/prisma.js'
import { accessError, audiencesForViewer } from './audience-access.js'

const DEFAULT_MODULES: ProfileModule[] = [...PROFILE_MODULES]
const DEFAULT_VISIBILITY: ActivityAudience[] = ['friends', 'family']

export async function getMyProfileSettings(childId: string) {
  return prisma.publicProfile.upsert({
    where: { childId },
    update: {},
    create: {
      childId,
      slug: childId,
      enabled: false,
      visibility: DEFAULT_VISIBILITY,
      modules: DEFAULT_MODULES,
    },
  })
}

export async function updateMyProfileSettings(input: {
  childId: string
  enabled: boolean
  visibility: ActivityAudience[]
  modules: ProfileModule[]
}) {
  return prisma.publicProfile.upsert({
    where: { childId: input.childId },
    update: {
      enabled: input.enabled,
      visibility: [...new Set(input.visibility)],
      modules: [...new Set(input.modules)],
    },
    create: {
      childId: input.childId,
      slug: input.childId,
      enabled: input.enabled,
      visibility: [...new Set(input.visibility)],
      modules: [...new Set(input.modules)],
    },
  })
}

export async function getProfileProjection(
  slug: string,
  viewer: AuthUser,
) {
  const profile = await prisma.publicProfile.findUnique({ where: { slug } })
  const ownerId = profile?.childId ?? slug
  const access = await audiencesForViewer(ownerId, viewer)
  const settings = profile ?? {
    childId: ownerId,
    slug: ownerId,
    enabled: false,
    visibility: DEFAULT_VISIBILITY,
    modules: DEFAULT_MODULES,
  }
  const allowed =
    access.isOwner ||
    (settings.enabled &&
      settings.visibility.some((item) =>
        access.audiences.has(item as ActivityAudience),
      ))
  if (!allowed) throw accessError(404, 'Trang này chưa được xuất bản.')

  const modules = new Set(
    settings.modules.filter((item): item is ProfileModule =>
      PROFILE_MODULES.includes(item as ProfileModule),
    ),
  )
  const [
    equipment,
    stickers,
    progress,
    achievements,
    projects,
    favorites,
    activities,
  ] = await Promise.all([
    prisma.rewardEquipment.findMany({
      where: { userId: ownerId },
      select: { kind: true, rewardId: true },
    }),
    modules.has('storybook')
      ? prisma.storybookSticker.findMany({
          where: { userId: ownerId },
          select: { stickerId: true, earnedAt: true },
        })
      : Promise.resolve([]),
    modules.has('progress')
      ? prisma.questProgress.aggregate({
          where: { userId: ownerId },
          _count: true,
          _sum: { stars: true },
        })
      : Promise.resolve(null),
    modules.has('achievements')
      ? prisma.achievement.findMany({
          where: { userId: ownerId },
          select: { type: true, unlockedAt: true },
          orderBy: { unlockedAt: 'desc' },
        })
      : Promise.resolve([]),
    modules.has('works')
      ? prisma.project.findMany({
          where: {
            userId: ownerId,
            shareStatus: { in: ['approved', 'public', 'shared'] },
          },
          select: {
            id: true,
            title: true,
            kind: true,
            thumbnail: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: 'desc' },
          take: 12,
        })
      : Promise.resolve([]),
    modules.has('friends')
      ? prisma.favoriteConnection.findMany({
          where: { childId: ownerId },
          include: {
            connection: {
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
            },
          },
          orderBy: { position: 'asc' },
        })
      : Promise.resolve([]),
    modules.has('activity')
      ? prisma.socialActivity.findMany({
          where: {
            actorChildId: ownerId,
            audiences: {
              hasSome: access.isOwner
                ? ['friends', 'family', 'school']
                : [...access.audiences],
            },
          },
          select: {
            id: true,
            type: true,
            title: true,
            summary: true,
            icon: true,
            rewardId: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        })
      : Promise.resolve([]),
  ])

  const earnedIds = new Set(stickers.map((item) => item.stickerId))
  return {
    profile: {
      slug: settings.slug,
      nickname: access.owner.nickname,
      avatarId: access.owner.avatarId,
      level: access.owner.level,
      modules: [...modules],
      equipment: equipment.map((item) => ({
        ...item,
        definition: REWARD_CATALOG.find(
          (reward) => reward.id === item.rewardId,
        ) ?? null,
      })),
    },
    storybook: modules.has('storybook')
      ? STORYBOOK_CHAPTERS.map((chapter) => ({
          slug: chapter.slug,
          title: chapter.title,
          completed: earnedIds.has(chapter.bossStickerId),
          earned: chapter.stickerIds.filter((id) => earnedIds.has(id)).length,
        }))
      : null,
    progress: progress
      ? {
          questCount: progress._count,
          totalStars: progress._sum.stars ?? 0,
        }
      : null,
    achievements,
    works: projects.filter((item) => isShareableWorkspaceKind(item.kind)),
    friends: favorites.map((item) => {
      const connection = item.connection
      return connection.childAId === ownerId
        ? connection.childB
        : connection.childA
    }),
    activities,
  }
}
