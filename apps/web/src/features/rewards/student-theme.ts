import type { CSSProperties } from 'react'
import { profilePageEdgeBackgroundStyle } from './profile-backgrounds'

export function readStudentTheme(userId: string): string | undefined {
  // Themes are loaded through the authenticated profile/storybook projection.
  // Do not restore learner appearance from persistent browser storage.
  void userId
  return undefined
}

export function profilePageThemeStyle(themeId?: string): CSSProperties {
  return profilePageEdgeBackgroundStyle(themeId)
}
