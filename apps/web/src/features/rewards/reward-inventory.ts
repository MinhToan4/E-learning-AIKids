import type { RewardKind } from '@/shared/lib/creation/rewards'
import {
  selectRewardAssetReference,
  type RewardCatalogAssets,
} from './reward-catalog-assets'
import { getSharedLevelRewardAssetId } from './reward-assets'

export type InventoryVisualReward = {
  code: string
  kind: RewardKind
  assets?: RewardCatalogAssets
}

const approvedTransparentEffects = new Set([
  'effect-firefly-trail',
  'effect-idea-bubbles',
])

const curatedProfileCompanions = new Set(['avatar-paco-blue', 'companion-level-23', 'companion-level-31', 'companion-level-41'])
const curatedProfileEffects = new Set(['effect-level-12', 'effect-level-24', 'effect-level-32', 'effect-level-44'])
const cssProfileFrames = new Set(['frame-rainbow', 'frame-galaxy', 'frame-cloud-summer', 'frame-language-kingdom', 'frame-summit-gold', 'frame-galaxy-storyteller'])
const horizontalProfileBackgroundAssets = new Set(['background-community-legend', 'background-paco-cosmic', 'background-paco-workshop'])
const responsivePageThemeAssets = new Set(['background-cloud-garden', 'background-star-library', 'background-magical-forest', 'background-colorful-city'])

/**
 * Backpack is a finished-artwork surface. Rewards without a catalog asset,
 * duplicated logical artwork, or known non-transparent effect exports fail
 * closed instead of falling back to emoji/checkerboard previews.
 */
export function displayableRewardInventory<T extends InventoryVisualReward>(
  rewards: readonly T[],
): T[] {
  const seenArtwork = new Set<string>()
  return rewards.filter((reward) => {
    const reference = selectRewardAssetReference(reward.assets, 'thumbnail')
    if (!reference?.assetId) return false
    if (reward.kind === 'effect' && !approvedTransparentEffects.has(reference.assetId)) {
      return false
    }
    const artworkKey = `${reward.kind}:${reference.assetId}:${reference.variant ?? 'primary'}`
    if (seenArtwork.has(artworkKey)) return false
    seenArtwork.add(artworkKey)
    return true
  })
}

export type WardrobeVisualReward = {
  id: string
  kind: RewardKind
  assets?: RewardCatalogAssets
}

/** Profile accepts intentional text/CSS renderers, but rejects unknown or duplicate visuals. */
export function displayableWardrobeRewards<T extends WardrobeVisualReward>(
  rewards: readonly T[],
  kind: RewardKind,
): T[] {
  const hasCuratedEffects = rewards.some((reward) => curatedProfileEffects.has(reward.id))
  const seenArtwork = new Set<string>()

  return rewards.filter((reward) => {
    if (reward.kind !== kind) return false
    if (kind === 'title') return true
    if (kind === 'companion') return curatedProfileCompanions.has(reward.id)
    if (kind === 'effect') {
      return curatedProfileEffects.has(reward.id)
        || (!hasCuratedEffects && reward.id === 'perk-sticker-sparkle')
    }

    const sharedAsset = getSharedLevelRewardAssetId(reward.id)
    if (kind === 'background' || kind === 'theme') {
      if (!sharedAsset) return true
      const allowed = kind === 'background'
        ? horizontalProfileBackgroundAssets.has(sharedAsset)
        : responsivePageThemeAssets.has(sharedAsset)
      const key = `${kind}:${sharedAsset}`
      if (!allowed || seenArtwork.has(key)) return false
      seenArtwork.add(key)
      return true
    }

    if (kind === 'frame' && cssProfileFrames.has(reward.id)) return true
    if (kind === 'avatar') return true

    const reference = selectRewardAssetReference(reward.assets, 'thumbnail')
    if (!reference?.assetId) return false
    const key = `${kind}:${reference.assetId}:${reference.variant ?? 'primary'}`
    if (seenArtwork.has(key)) return false
    seenArtwork.add(key)
    return true
  })
}
