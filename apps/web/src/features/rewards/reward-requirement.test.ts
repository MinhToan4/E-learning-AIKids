import { describe, expect, it } from 'vitest'
import { normalizeRewardRequirement } from './reward-requirement'

describe('normalizeRewardRequirement', () => {
  it('preserves every supported reward source', () => {
    expect(normalizeRewardRequirement({ type: 'xp_level', value: 15 })).toEqual({ type: 'xp_level', value: 15 })
    expect(normalizeRewardRequirement({ type: 'storybook_sticker', value: 'P03-S9' })).toEqual({ type: 'storybook_sticker', value: 'P03-S9' })
    expect(normalizeRewardRequirement({ type: 'event', value: 'summer' })).toEqual({ type: 'event', value: 'summer' })
    expect(normalizeRewardRequirement({ type: 'achievement', value: 'first-project' })).toEqual({ type: 'achievement', value: 'first-project' })
  })

  it('fails unknown rules into achievement inventory instead of Sticker Book', () => {
    expect(normalizeRewardRequirement({ type: 'metric', value: 'lessons-10' })).toEqual({ type: 'achievement', value: 'lessons-10' })
  })
})
