import { describe, expect, it } from 'vitest'
import { AVATAR_CATEGORIES, AVATAR_OPTION_COUNTS, randomAvatarSelection } from './avatar-options'

describe('avatar studio options', () => {
  it('keeps every ChessKid-style customization category available', () => {
    expect(AVATAR_CATEGORIES.map((item) => item.id)).toEqual([
      'hair', 'hairColor', 'skin', 'face', 'eyes', 'expression', 'outfit', 'accessory', 'shoes', 'hat',
    ])
  })

  it('randomizes within each category catalog', () => {
    const selection = randomAvatarSelection(() => 0.999)
    for (const { id } of AVATAR_CATEGORIES) {
      expect(selection[id]).toBe(AVATAR_OPTION_COUNTS[id] - 1)
    }
  })
})
