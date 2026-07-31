import { describe, expect, it } from 'vitest'
import {
  profileCardBackgroundStyle,
  profileCardBackgroundTone,
  profilePageThemeStyle,
} from './reward-equipment'

describe('profile card contrast', () => {
  it('uses light text for dark reward backgrounds', () => {
    expect(profileCardBackgroundTone('background-ai-gate')).toBe('dark')
    expect(profileCardBackgroundTone('background-forest-guardian')).toBe('dark')
  })

  it('uses dark text for light and default backgrounds', () => {
    expect(profileCardBackgroundTone('background-ocean-artist')).toBe('light')
    expect(profileCardBackgroundTone()).toBe('light')
  })

  it('keeps page themes and card backgrounds in separate style helpers', () => {
    expect(profilePageThemeStyle('theme-workshop')).not.toEqual(
      profileCardBackgroundStyle('theme-workshop'),
    )
    expect(profileCardBackgroundStyle('theme-workshop')).toEqual(
      profileCardBackgroundStyle(),
    )
  })
})
