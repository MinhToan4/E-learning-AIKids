import type { CSSProperties } from 'react'
import { profilePageEdgeBackgroundStyle } from './profile-backgrounds'

export function readStudentTheme(userId: string): string | undefined {
  try {
    const equipment = JSON.parse(
      localStorage.getItem(`aikids.reward-equipment.${userId}`) ?? '{}',
    ) as { theme?: string }
    return equipment.theme
  } catch {
    return undefined
  }
}

export function profilePageThemeStyle(themeId?: string): CSSProperties {
  return profilePageEdgeBackgroundStyle(themeId)
}
