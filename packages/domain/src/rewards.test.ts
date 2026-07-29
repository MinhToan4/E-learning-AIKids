import { describe, expect, it } from 'vitest'
import {
  REWARD_CATALOG,
  isRewardUnlocked,
  rewardsForLevel,
} from './rewards.js'

describe('reward catalog', () => {
  it('contains an exact reward for every explorer level', () => {
    for (let level = 1; level <= 10; level += 1) {
      expect(rewardsForLevel(level)).toHaveLength(1)
    }
  })

  it('keeps locked rewards unavailable until their condition is met', () => {
    const frame = REWARD_CATALOG.find((reward) => reward.id === 'frame-rainbow')!
    expect(isRewardUnlocked(frame, { xpLevel: 2 })).toBe(false)
    expect(isRewardUnlocked(frame, { xpLevel: 3 })).toBe(true)
  })
})
