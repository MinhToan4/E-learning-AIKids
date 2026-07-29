export type Audience = 'friends' | 'family' | 'school'
export type SharedSurface = 'profile' | 'workspace'
export type ProfileModule = 'storybook' | 'progress' | 'achievements' | 'works' | 'friends' | 'activity'

export type CommunitySettings = {
  profile: Record<Audience, boolean>
  workspace: Record<Audience, boolean>
  modules: Record<ProfileModule, boolean>
}

export const DEFAULT_COMMUNITY_SETTINGS: CommunitySettings = {
  profile: { friends: true, family: true, school: false },
  workspace: { friends: false, family: true, school: true },
  modules: {
    storybook: true,
    progress: true,
    achievements: true,
    works: true,
    friends: true,
    activity: true,
  },
}

const key = (childId: string) => `aikids.community-sharing.${childId}`

export function readCommunitySettings(childId: string): CommunitySettings {
  try {
    const saved = JSON.parse(localStorage.getItem(key(childId)) ?? '{}') as Partial<CommunitySettings>
    return {
      ...DEFAULT_COMMUNITY_SETTINGS,
      ...saved,
      profile: { ...DEFAULT_COMMUNITY_SETTINGS.profile, ...saved.profile },
      workspace: { ...DEFAULT_COMMUNITY_SETTINGS.workspace, ...saved.workspace },
      modules: { ...DEFAULT_COMMUNITY_SETTINGS.modules, ...saved.modules },
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
  { id: 'friend-minh-anh', name: 'Minh Anh', avatar: '🦄', relation: 'friend', label: 'Bạn sáng tạo', favorite: true },
  { id: 'friend-gia-huy', name: 'Gia Huy', avatar: '🐉', relation: 'friend', label: 'Bạn cùng lớp', favorite: false },
  { id: 'family-mom', name: 'Mẹ của Bo', avatar: '👩', relation: 'family', label: 'Gia đình', favorite: true },
  { id: 'school-class', name: 'Lớp AI Kids 01', avatar: '🏫', relation: 'school', label: 'Trường học', favorite: false },
] as const

export type SocialConnection = {
  id: string
  name: string
  avatar: string
  relation: 'friend' | 'family' | 'school'
  label: string
  favorite: boolean
}

export type FriendRequest = {
  id: string
  name: string
  avatar: string
  status: 'parent_review' | 'accepted' | 'declined'
}

export type SocialGraphState = {
  friendCode: string
  connections: SocialConnection[]
  requests: FriendRequest[]
}

const graphKey = (childId: string) => `aikids.social-graph.${childId}`

function codeFor(childId: string): string {
  return childId.replace(/-/g, '').slice(0, 8).toUpperCase().padEnd(8, 'K')
}

export function readSocialGraph(childId: string): SocialGraphState {
  try {
    const saved = JSON.parse(localStorage.getItem(graphKey(childId)) ?? 'null') as SocialGraphState | null
    if (saved) return saved
  } catch {
    // Start from the safe demo graph.
  }
  return {
    friendCode: codeFor(childId),
    connections: DEMO_CONNECTIONS.map((connection) => ({ ...connection })),
    requests: [{
      id: 'request-lan-chi',
      name: 'Lan Chi',
      avatar: '🦊',
      status: 'parent_review',
    }],
  }
}

export function saveSocialGraph(childId: string, state: SocialGraphState): void {
  localStorage.setItem(graphKey(childId), JSON.stringify(state))
}
