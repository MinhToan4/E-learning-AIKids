import { api, type AchievementRow } from '@/shared/lib/api'
import type { RewardKind } from '@/shared/lib/creation/rewards'
import type {
  Audience,
  ProfileModule,
} from '@/features/community/community-store'
import type { ShowcaseProject } from './profile-showcase'

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
): Promise<ProfileOverviewData> {
  const safeReq = <T>(path: string) => withTimeout(request<T>(path), timeoutMs)

  const [streak, achievements, projects, media, gamification, settings, rewards] =
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
  }
}

/**
 * Load the profile from the service-owned endpoints available through the
 * local gateway. The aggregate route is not part of the local Hub contract;
 * probing it first only creates a guaranteed 404 on every profile visit.
 * Promise.allSettled keeps optional sections independent so one unavailable
 * section cannot prevent the rest of the profile from rendering.
 */
export async function loadProfileOverview(
  request: ProfileRequest = api,
  timeoutMs = 3500,
  includeMedia = true,
  includeProgression = true,
  includeAppearance = true,
): Promise<ProfileOverviewData> {
  return loadLegacyProfileOverview(request, timeoutMs, includeMedia, includeProgression, includeAppearance)
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
