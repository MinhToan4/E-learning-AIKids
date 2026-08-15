import { describe, expect, it } from 'vitest'
import { DEFAULT_PROFILE_CARD_LAYOUT, normalizeProfileCardLayout, profileCardSlotStyle } from './profile-card-layout'

describe('profile card layout', () => {
  it('keeps one shared default for all equipped assets', () => {
    expect(Object.keys(DEFAULT_PROFILE_CARD_LAYOUT.slots)).toEqual(['effect', 'avatar', 'frame', 'companion', 'name', 'level', 'title'])
  })

  it('converts CMS position and size to composable CSS properties', () => {
    expect(profileCardSlotStyle({ scalePercent: 120, offsetXPercent: 5, offsetYPercent: -10, layer: 30 }))
      .toEqual({ transform: 'translate(5%, -10%) scale(1.2)', zIndex: 30 })
  })

  it('fills new text and layer slots when reading an older published layout', () => {
    const layout = normalizeProfileCardLayout({ slots: { frame: { scalePercent: 90, offsetXPercent: 4, offsetYPercent: 0 } } } as never)
    expect(layout.slots.frame).toMatchObject({ scalePercent: 90, offsetXPercent: 4, layer: 30 })
    expect(layout.slots.avatar.offsetXPercent).toBe(4)
    expect(layout.slots.name.layer).toBe(50)
    expect(layout.slots.level.layer).toBe(51)
  })
})
