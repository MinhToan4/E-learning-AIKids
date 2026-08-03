import { describe, expect, it } from 'vitest'
import { displayableRewardInventory, displayableWardrobeRewards } from './reward-inventory'

describe('displayable reward inventory', () => {
  it('removes missing assets, duplicate artwork and unapproved effects', () => {
    const rewards = displayableRewardInventory([
      { code: 'frame-a', kind: 'frame' as const, assets: { assetId: 'frame-level-15' } },
      { code: 'frame-a-copy', kind: 'frame' as const, assets: { assetId: 'frame-level-15' } },
      { code: 'emoji-only', kind: 'perk' as const },
      { code: 'checkerboard-effect', kind: 'effect' as const, assets: { assetId: 'effect-galaxy' } },
      { code: 'clean-effect', kind: 'effect' as const, assets: { assetId: 'effect-firefly-trail' } },
    ])

    expect(rewards.map((reward) => reward.code)).toEqual(['frame-a', 'clean-effect'])
  })
})

describe('displayable wardrobe rewards', () => {
  it('keeps supported renderers and removes invalid or duplicate frames', () => {
    const rewards = [
      { id: 'frame-rainbow', kind: 'frame' as const },
      { id: 'frame-level-15', kind: 'frame' as const, assets: { assetId: 'frame-level-15' } },
      { id: 'frame-level-15-copy', kind: 'frame' as const, assets: { assetId: 'frame-level-15' } },
      { id: 'frame-broken', kind: 'frame' as const },
      { id: 'title-first-light', kind: 'title' as const },
    ]

    expect(displayableWardrobeRewards(rewards, 'frame').map((reward) => reward.id))
      .toEqual(['frame-rainbow', 'frame-level-15'])
    expect(displayableWardrobeRewards(rewards, 'title').map((reward) => reward.id))
      .toEqual(['title-first-light'])
  })

  it('deduplicates shared artwork and prefers curated effects', () => {
    const rewards = [
      { id: 'background-level-71', kind: 'background' as const },
      { id: 'background-level-72', kind: 'background' as const },
      { id: 'effect-level-12', kind: 'effect' as const },
      { id: 'perk-sticker-sparkle', kind: 'effect' as const },
    ]

    expect(displayableWardrobeRewards(rewards, 'background').map((reward) => reward.id))
      .toEqual(['background-level-71'])
    expect(displayableWardrobeRewards(rewards, 'effect').map((reward) => reward.id))
      .toEqual(['effect-level-12'])
  })
})
