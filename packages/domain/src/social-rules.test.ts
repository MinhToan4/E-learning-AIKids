import { describe, expect, it } from 'vitest'
import {
  canUsePacoPick,
  canFavoriteFriend,
  computeReactionScore,
  getIsoWeekKey,
  isValidFriendCode,
  normalizeFriendCode,
} from './social-rules.js'

describe('social rules', () => {
  it('enforces the three Paco Picks per week quota', () => {
    expect(canUsePacoPick(0)).toBe(true)
    expect(canUsePacoPick(2)).toBe(true)
    expect(canUsePacoPick(3)).toBe(false)
    expect(canUsePacoPick(-1)).toBe(false)
  })

  it('uses ISO week-year around New Year', () => {
    expect(getIsoWeekKey(new Date('2027-01-01T12:00:00Z'))).toBe('2026-W53')
    expect(getIsoWeekKey(new Date('2027-01-04T12:00:00Z'))).toBe('2027-W01')
  })

  it('weights Paco Picks without allowing negative counts', () => {
    expect(computeReactionScore({
      EXCELLENT: 2, CREATIVE: 1, HOT: 0, LOVE: 3,
      INSIGHTFUL: -5, PACO_PICK: 2,
    })).toBe(16)
  })

  it('limits favorite friends and normalizes safe invite codes', () => {
    expect(canFavoriteFriend(5)).toBe(true)
    expect(canFavoriteFriend(6)).toBe(false)
    expect(normalizeFriendCode('ab-12 cd_34')).toBe('AB12CD34')
    expect(isValidFriendCode('AB12-CD34')).toBe(true)
    expect(isValidFriendCode('short')).toBe(false)
  })
})
