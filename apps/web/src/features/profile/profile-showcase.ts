export type ProfileAvatar = {
  id: string
  url: string
  label: string
  source: 'upload' | 'generated' | 'library'
}

export type ShowcaseProject = {
  id: string
  title: string
  kind: string
  thumbnail: string
  content?: string
  shareStatus: string
}

export type ProfileShowcase = {
  childId: string
  nickname: string
  avatar: ProfileAvatar | null
  projects: ShowcaseProject[]
  updatedAt: string
}

const avatarKey = (userId: string) => `aikids.profile-avatar.${userId}`
const showcaseKey = (userId: string) => `aikids.profile-showcase.${userId}`

export function readProfileAvatar(userId: string): ProfileAvatar | null {
  try {
    return JSON.parse(localStorage.getItem(avatarKey(userId)) ?? 'null') as ProfileAvatar | null
  } catch {
    return null
  }
}

export function saveProfileAvatar(userId: string, avatar: ProfileAvatar): void {
  localStorage.setItem(avatarKey(userId), JSON.stringify(avatar))
  window.dispatchEvent(new CustomEvent('aikids:profile-avatar', { detail: avatar }))
}

export function saveProfileShowcase(showcase: ProfileShowcase): void {
  localStorage.setItem(showcaseKey(showcase.childId), JSON.stringify(showcase))
}

export function readProfileShowcase(childId: string): ProfileShowcase | null {
  try {
    return JSON.parse(localStorage.getItem(showcaseKey(childId)) ?? 'null') as ProfileShowcase | null
  } catch {
    return null
  }
}
