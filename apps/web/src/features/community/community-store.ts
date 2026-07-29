export type Audience = 'friends' | 'family' | 'school'
export type SharedSurface = 'profile' | 'workspace'

export type CommunitySettings = {
  profile: Record<Audience, boolean>
  workspace: Record<Audience, boolean>
}

export const DEFAULT_COMMUNITY_SETTINGS: CommunitySettings = {
  profile: { friends: true, family: true, school: false },
  workspace: { friends: false, family: true, school: true },
}

const key = (childId: string) => `aikids.community-sharing.${childId}`

export function readCommunitySettings(childId: string): CommunitySettings {
  try {
    return {
      ...DEFAULT_COMMUNITY_SETTINGS,
      ...JSON.parse(localStorage.getItem(key(childId)) ?? '{}'),
    } as CommunitySettings
  } catch {
    return DEFAULT_COMMUNITY_SETTINGS
  }
}

export function saveCommunitySettings(
  childId: string,
  settings: CommunitySettings,
): void {
  localStorage.setItem(key(childId), JSON.stringify(settings))
}

export const DEMO_CONNECTIONS = [
  { id: 'friend-minh-anh', name: 'Minh Anh', avatar: '🦄', relation: 'friend', label: 'Bạn sáng tạo' },
  { id: 'family-mom', name: 'Mẹ của Bo', avatar: '👩', relation: 'family', label: 'Gia đình' },
  { id: 'school-class', name: 'Lớp AI Kids 01', avatar: '🏫', relation: 'school', label: 'Trường học' },
] as const
