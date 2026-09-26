import {
  api,
  normalizeGatewayResponse,
  type AchievementRow,
} from '@/shared/lib/api'
import type { RewardKind } from '@/shared/lib/creation/rewards'
import type {
  Audience,
  ProfileModule,
} from '@/features/community/community-store'
import type { ShowcaseProject } from './profile-showcase'
import type { LearningPathway } from '@/shared/lib/learning-api'

export type ProfileMediaAsset = {
  id: string
  name: string
  thumbnail: string
  type: string
}

export type PublicProfileSettings = {
  childProfileId: string
  slug: string
  enabled: boolean
  visibility: Audience[]
  modules: ProfileModule[]
  themeKey?: string | null
  frameKey?: string | null
  backgroundKey?: string | null
}

export type ProfileEquipmentRow = {
  kind: RewardKind
  rewardId: string
}

export type ProfileOverviewData = {
  streak: number
  achievements: AchievementRow[]
  projects: ShowcaseProject[]
  avatarChoices: ProfileMediaAsset[]
  totalXp: number
  level: number
  profileSettings: PublicProfileSettings | null
  equipment: ProfileEquipmentRow[]
  storybook: ProfileStorybookData | null
  pathway: LearningPathway | null
}

export type ProfileStorybookData = {
  earnedStickerIds?: string[]
  inventory?: Array<{ rewardId: string }>
  equipment?: ProfileEquipmentRow[]
  studio?: { chapters?: unknown[] }
}

export type ProfileAppearanceData = Pick<ProfileOverviewData, 'profileSettings' | 'equipment'> & {
  ownedRewardIds: string[] | null
}

type ProfileRequest = <T>(
  path: string,
  options?: RequestInit,
) => Promise<T>

export function withTimeout<T>(promise: Promise<T>, timeoutMs = 3500): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Request timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer !== undefined) clearTimeout(timer)
  })
}

async function loadLegacyProfileOverview(
  request: ProfileRequest,
  timeoutMs = 3500,
  includeMedia = true,
  includeProgression = true,
  includeAppearance = true,
  includePathway = false,
): Promise<ProfileOverviewData> {
  const safeReq = <T>(path: string) => withTimeout(request<T>(path), timeoutMs)

  const [streak, achievements, projects, media, gamification, settings, rewards, pathway] =
    await Promise.allSettled([
      safeReq<{ current: number }>('/api/gamification/streak'),
      safeReq<{ achievements: AchievementRow[] }>('/api/gamification/achievements'),
      safeReq<{ projects: ShowcaseProject[] }>('/api/projects'),
      includeMedia
        ? safeReq<{ assets: ProfileMediaAsset[] }>('/api/backpack')
        : Promise.resolve({ assets: [] as ProfileMediaAsset[] }),
      includeProgression
        ? safeReq<{ totalXp: number; level: number }>('/api/gamification/profile')
        : Promise.resolve({
            totalXp: 0,
            level: 1,
          }),
      includeAppearance
        ? safeReq<PublicProfileSettings>('/api/profile/settings')
        : Promise.resolve(null),
      includeAppearance
        ? safeReq<{ equipment: ProfileEquipmentRow[] }>('/api/gamification/storybook')
        : Promise.resolve({ equipment: [] as ProfileEquipmentRow[] }),
      includePathway
        ? safeReq<LearningPathway>('/api/learning/pathway')
        : Promise.resolve(null),
    ])

  return {
    streak: streak.status === 'fulfilled' ? streak.value.current : 0,
    achievements: achievements.status === 'fulfilled'
      ? achievements.value.achievements ?? []
      : [],
    projects: projects.status === 'fulfilled'
      ? projects.value.projects ?? []
      : [],
    avatarChoices: media.status === 'fulfilled'
      ? media.value.assets ?? []
      : [],
    totalXp: gamification.status === 'fulfilled'
      ? gamification.value.totalXp
      : 0,
    level: gamification.status === 'fulfilled'
      ? gamification.value.level
      : 1,
    profileSettings: settings.status === 'fulfilled' ? settings.value : null,
    equipment: rewards.status === 'fulfilled'
      ? rewards.value.equipment ?? []
      : [],
    storybook: rewards.status === 'fulfilled' ? rewards.value : null,
    pathway: pathway.status === 'fulfilled' ? pathway.value : null,
  }
}

/**
 * Load profile data through the Hub aggregate endpoint. The Hub executes the
 * service-owned reads concurrently over its shared keep-alive transport, while
 * the legacy fan-out below remains a rolling-deploy fallback for older servers.
 */
export async function loadProfileOverview(
  request: ProfileRequest = api,
  timeoutMs = 3500,
  includeMedia = true,
  includeProgression = true,
  includeAppearance = true,
  includePathway = false,
): Promise<ProfileOverviewData> {
  // The Hub BFF runs the service-owned reads concurrently over its shared
  // keep-alive pool. Keep the legacy fan-out only as a rolling-deploy fallback.
  try {
    const activeIpId = typeof localStorage !== 'undefined'
      ? localStorage.getItem('storymee_active_ip_id')
      : null
    const sections = ['core']
    if (includeProgression) sections.push('progression')
    if (includeAppearance) sections.push('appearance')
    if (includePathway) sections.push('pathway')
    const query = new URLSearchParams({ sections: sections.join(',') })
    if (activeIpId) query.set('ipId', activeIpId)
    const aggregate = await withTimeout(request<Record<string, unknown>>(
      `/api/v1/aikids/profile-overview?${query.toString()}`,
    ), timeoutMs)
    if (!aggregate.streak || !aggregate.achievements || !aggregate.projects) {
      throw new Error('Profile overview aggregate is incomplete')
    }
    if ((includeProgression && !aggregate.progression) ||
        (includeAppearance && (!aggregate.appearance || !aggregate.storybook)) ||
        (includePathway && !aggregate.pathway)) {
      throw new Error('Profile overview optional sections are incomplete')
    }
    const streak = normalizeGatewayResponse('/api/gamification/streak', aggregate.streak) as { current?: number }
    const achievements = normalizeGatewayResponse('/api/gamification/achievements', aggregate.achievements) as { achievements?: AchievementRow[] }
    const projects = normalizeGatewayResponse('/api/projects', aggregate.projects) as { projects?: ShowcaseProject[] }
    const progression = includeProgression
      ? normalizeGatewayResponse('/api/gamification/profile', aggregate.progression) as { totalXp?: number; level?: number }
      : null
    const settings = includeAppearance
      ? normalizeGatewayResponse('/api/profile/settings', aggregate.appearance) as PublicProfileSettings | null
      : null
    const storybook = includeAppearance
      ? normalizeGatewayResponse('/api/gamification/storybook', aggregate.storybook) as ProfileStorybookData
      : null
    const pathway = includePathway
      ? normalizeGatewayResponse('/api/learning/pathway', aggregate.pathway) as LearningPathway
      : null
    const media = includeMedia
      ? normalizeGatewayResponse('/api/backpack', aggregate.projects) as { assets?: ProfileMediaAsset[] }
      : null

    return {
      streak: Number(streak.current ?? 0),
      achievements: achievements.achievements ?? [],
      projects: projects.projects ?? [],
      avatarChoices: media?.assets ?? [],
      totalXp: Number(progression?.totalXp ?? 0),
      level: Number(progression?.level ?? 1),
      profileSettings: settings,
      equipment: storybook?.equipment ?? [],
      storybook,
      pathway,
    }
  } catch {
    return loadLegacyProfileOverview(request, timeoutMs, includeMedia, includeProgression, includeAppearance, includePathway)
  }
}

export async function loadProfileAppearance(
  request: ProfileRequest = api,
  timeoutMs = 3500,
): Promise<ProfileAppearanceData> {
  const [settings, rewards] = await Promise.allSettled([
    withTimeout(request<PublicProfileSettings>('/api/profile/settings'), timeoutMs),
    withTimeout(request<{
      inventory?: Array<{ rewardId: string }>
      equipment: ProfileEquipmentRow[]
    }>('/api/gamification/storybook'), timeoutMs),
  ])
  return {
    profileSettings: settings.status === 'fulfilled' ? settings.value : null,
    equipment: rewards.status === 'fulfilled' ? rewards.value.equipment ?? [] : [],
    ownedRewardIds: rewards.status === 'fulfilled'
      ? rewards.value.inventory?.map((item) => item.rewardId) ?? []
      : null,
  }
}
