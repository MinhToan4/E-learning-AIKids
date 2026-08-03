import { describe, expect, it } from 'vitest'
import { displayableLevelRewards } from './level-reward-inventory'

describe('displayable level rewards', () => {
  it('sorts valid XP rewards and removes invalid or duplicate rows', () => {
    const rewards = displayableLevelRewards([
      { code: 'level-3', name: 'Quà 3', unlockRule: { type: 'xp_level', value: 3 } },
      { code: 'level-1', name: 'Quà 1', unlockRule: { type: 'xp_level', value: 1 } },
      { code: 'level-1', name: 'Bản sao', unlockRule: { type: 'xp_level', value: 1 } },
      { code: 'bad', name: 'Sai', unlockRule: { type: 'xp_level', value: 0 } },
      { code: 'event', name: 'Sự kiện', unlockRule: { type: 'event', value: 2 } },
    ])

    expect(rewards.map((reward) => reward.code)).toEqual(['level-1', 'level-3'])
  })
})
