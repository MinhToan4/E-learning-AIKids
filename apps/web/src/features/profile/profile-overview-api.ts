import { api, ApiError, type AchievementRow } from '@/shared/lib/api'
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

type ProfileOverviewPayload = {
  profile: {
    settings: PublicProfileSettings | null
  }
  gamification: {
    streak: number
    totalXp: number
    level: number
    achievements: AchievementRow[]
  }
  recentProjects: ShowcaseProject[]
  media: {
    avatarChoices: ProfileMediaAsset[]
  }
  rewards: {
    equipment: ProfileEquipmentRow[]
  }
}

type ProfileRequest = <T>(
  path: string,
  options?: RequestInit,
) => Promise<T>

function fromOverviewPayload(
  payload: ProfileOverviewPayload,
): ProfileOverviewData {
  return {
    streak: Number(payload.gamification?.streak ?? 0),
    achievements: Array.isArray(payload.gamification?.achievements)
      ? payload.gamification.achievements
      : [],
    projects: Array.isArray(payload.recentProjects)
      ? payload.recentProjects
      : [],
    avatarChoices: Array.isArray(payload.media?.avatarChoices)
      ? payload.media.avatarChoices
      : [],
    totalXp: Number(payload.gamification?.totalXp ?? 0),
    level: Math.max(1, Number(payload.gamification?.level ?? 1)),
    profileSettings: payload.profile?.settings ?? null,
    equipment: Array.isArray(payload.rewards?.equipment)
      ? payload.rewards.equipment
      : [],
  }
}

async function loadLegacyProfileOverview(
  request: ProfileRequest,
): Promise<ProfileOverviewData> {
  const [streak, achievements, projects, media, gamification, settings, rewards] =
    await Promise.allSettled([
      request<{ current: number }>('/api/gamification/streak'),
      request<{ achievements: AchievementRow[] }>('/api/gamification/achievements'),
      request<{ projects: ShowcaseProject[] }>('/api/projects'),
      request<{ assets: ProfileMediaAsset[] }>('/api/backpack'),
      request<{ totalXp: number; level: number }>('/api/gamification/profile'),
      request<PublicProfileSettings>('/api/profile/settings'),
      request<{ equipment: ProfileEquipmentRow[] }>('/api/gamification/storybook'),
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
 * New Ubuntu backend: one authenticated aggregate request.
 * Old Ubuntu backend: seven legacy requests only when the route is absent.
 * Auth/ownership/server failures never downgrade to the broad legacy fan-out.
 */
export async function loadProfileOverview(
  request: ProfileRequest = api,
): Promise<ProfileOverviewData> {
  try {
    const payload = await request<ProfileOverviewPayload>(
      '/api/v1/profile/overview',
    )
    return fromOverviewPayload(payload)
  } catch (error) {
    const legacyBackend =
      error instanceof ApiError &&
      (error.status === 404 || error.status === 405 || error.status === 501)
    if (!legacyBackend) throw error
    return loadLegacyProfileOverview(request)
  }
}
