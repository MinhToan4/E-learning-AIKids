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

/**
 * Load profile data through the Hub aggregate endpoint. The Hub executes the
 * service-owned reads concurrently over its shared keep-alive transport.
 */
export async function loadProfileOverview(
  request: ProfileRequest = api,
  timeoutMs = 3500,
  includeMedia = true,
  includeProgression = true,
  includeAppearance = true,
  includePathway = false,
): Promise<ProfileOverviewData> {
  // Fail closed when the aggregate contract is incomplete. Falling back to
  // browser fan-out hides deployment mismatches and recreates the waterfall.
    const activeIpId = typeof localStorage !== 'undefined'
      ? localStorage.getItem('storymee_active_ip_id')
      : null
    const sections = ['core']
    if (includeMedia) sections.push('media')
    if (includeProgression) sections.push('progression')
    if (includeAppearance) sections.push('appearance')
    if (includePathway) sections.push('pathway')
    const query = new URLSearchParams({ sections: sections.join(',') })
    if (activeIpId) query.set('ipId', activeIpId)
    const aggregate = await withTimeout(request<Record<string, unknown>>(
      `/api/v1/aikids/profile-overview?${query.toString()}`,
    ), timeoutMs)
    if (!aggregate.streak || !aggregate.achievements) {
      throw new Error('Profile overview aggregate is incomplete')
    }
    if ((includeProgression && !aggregate.progression) ||
        (includeAppearance && (!aggregate.appearance || !aggregate.storybook)) ||
        (includePathway && !aggregate.pathway)) {
      throw new Error('Profile overview optional sections are incomplete')
    }
    const streak = normalizeGatewayResponse('/api/gamification/streak', aggregate.streak) as { current?: number }
    const achievements = normalizeGatewayResponse('/api/gamification/achievements', aggregate.achievements) as { achievements?: AchievementRow[] }
    const projects = aggregate.projects
      ? normalizeGatewayResponse('/api/projects', aggregate.projects) as { projects?: ShowcaseProject[] }
      : { projects: [] }
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
      ? normalizeGatewayResponse('/api/backpack', aggregate.media) as { assets?: ProfileMediaAsset[] }
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
