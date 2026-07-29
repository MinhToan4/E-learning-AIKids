import { describe, expect, it } from 'vitest'
import { profileCardTone } from './reward-equipment'

describe('profile card contrast', () => {
  it('uses light text for dark reward backgrounds', () => {
    expect(profileCardTone('theme-legend')).toBe('dark')
    expect(profileCardTone('background-ai-gate')).toBe('dark')
    expect(profileCardTone('background-forest-guardian')).toBe('dark')
  })

  it('uses dark text for light and default backgrounds', () => {
    expect(profileCardTone('theme-workshop')).toBe('light')
    expect(profileCardTone('background-ocean-artist')).toBe('light')
    expect(profileCardTone()).toBe('light')
  })
})
