import { describe, expect, it } from 'vitest'
import { effectVisualForReward } from './RewardEffectArtwork'

describe('effectVisualForReward', () => {
  it('maps the curated effect rewards to four distinct transparent visuals', () => {
    expect(effectVisualForReward('effect-level-12')).toBe('stardust')
    expect(effectVisualForReward('effect-level-24')).toBe('rainbow')
    expect(effectVisualForReward('effect-level-32')).toBe('fireflies')
    expect(effectVisualForReward('effect-level-44')).toBe('bubbles')
  })

  it('keeps the legacy sparkle reward compatible with stardust', () => {
    expect(effectVisualForReward('perk-sticker-sparkle')).toBe('stardust')
  })
})
