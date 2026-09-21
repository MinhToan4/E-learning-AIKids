import { describe, expect, it } from 'vitest'
import { isRewardUnlocked, rewardSource, rewardTitleAsset } from './title-assets'

describe('rewardTitleAsset', () => {
  it('maps catalog titles to the approved Figma plaques', () => {
    expect(rewardTitleAsset('storybook-title-p01')).toContain('storybook-title-p01')
    expect(rewardTitleAsset('storybook-title-p08')).toContain('storybook-title-p08')
    expect(rewardTitleAsset('title-curious-seeker')).toContain('curious-seeker')
    expect(rewardTitleAsset('title-creative-warrior')).toContain('title-creative-warrior')
    expect(rewardTitleAsset('title-explorer')).toContain('title-explorer')
    expect(rewardTitleAsset('title-explorer', 'thumbnail')).toContain('title-explorer--thumbnail')
    expect(rewardTitleAsset('title-first-light')).toBeUndefined()
    expect(rewardTitleAsset('title-explorer')).not.toContain('badge-title-explorer')
  })

  it('fails closed for unknown title ids', () => {
    expect(rewardTitleAsset('title-not-published')).toBeUndefined()
  })

  it('uses server inventory rather than inferring xp reward ownership', () => {
    const reward = { id: 'title-guide', unlock: { type: 'xp_level', value: 6 } }
    expect(isRewardUnlocked(reward, new Set(), 102)).toBe(false)
    expect(isRewardUnlocked(reward, new Set(['title-guide']), 5)).toBe(true)
    expect(isRewardUnlocked(reward, new Set(), 5)).toBe(false)
  })

  it('keeps non-level rewards locked until the inventory grants them', () => {
    const reward = { id: 'event-title', unlock: { type: 'event', value: 'summer' } }
    expect(isRewardUnlocked(reward, new Set(), 102)).toBe(false)
    expect(isRewardUnlocked(reward, new Set(['event-title']), 1)).toBe(true)
  })

  it('requires the claimed Sticker Book reward instead of its prerequisite sticker', () => {
    const reward = {
      id: 'storybook-title-p03',
      unlock: { type: 'storybook_sticker', value: 'P03-S9' },
    }
    expect(isRewardUnlocked(reward, new Set(['P03-S9']), 102)).toBe(false)
    expect(isRewardUnlocked(reward, new Set(['storybook-title-p03']), 1)).toBe(true)
    expect(isRewardUnlocked(reward, new Set(), 102)).toBe(false)
  })

  it('classifies title sources without conflating level and Sticker Book', () => {
    expect(rewardSource('xp_level')).toBe('level')
    expect(rewardSource('storybook_sticker')).toBe('storybook')
    expect(rewardSource('achievement')).toBe('achievement')
    expect(rewardSource('event')).toBe('event')
  })
})
