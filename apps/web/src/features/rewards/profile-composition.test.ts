import { describe, expect, it } from 'vitest'
import { PROFILE_COMPOSITION_SPEC } from './profile-composition'

describe('profile composition contract', () => {
  it('keeps the profile background at the documented 3:1 ratio', () => {
    const background = PROFILE_COMPOSITION_SPEC.profileBackground
    expect(background.width / background.height).toBe(background.aspectRatio)
  })

  it('keeps frame and companion exports square with stable anchors', () => {
    expect(PROFILE_COMPOSITION_SPEC.avatarFrame.width).toBe(
      PROFILE_COMPOSITION_SPEC.avatarFrame.height,
    )
    expect(PROFILE_COMPOSITION_SPEC.companion.width).toBe(
      PROFILE_COMPOSITION_SPEC.companion.height,
    )
    expect(PROFILE_COMPOSITION_SPEC.avatarFrame.avatarCenter).toEqual({ x: 0.5, y: 0.5 })
  })
})
