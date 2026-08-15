import { getGeneratedRewardAssetUrl } from './reward-assets'
import type { RewardAssetVariant } from './reward-asset-address'
import { environment } from '@/shared/config/environment'

export type RewardAssetReference = {
  assetId: string
  variant?: RewardAssetVariant
  release?: string
  format?: 'avif' | 'png' | 'svg' | 'webp'
}

export type RewardCatalogAssets = {
  imageUrl?: string
  thumbnailUrl?: string
  previewUrl?: string
  /** Transitional shorthand for the primary logical asset. */
  assetId?: string
  primary?: RewardAssetReference
  thumbnail?: RewardAssetReference
  preview?: RewardAssetReference
}

export type RewardAssetUsage = 'primary' | 'preview' | 'thumbnail'

export function selectRewardAssetReference(
  assets: RewardCatalogAssets | undefined,
  usage: RewardAssetUsage,
): RewardAssetReference | undefined {
  if (!assets) return undefined
  const explicit = assets[usage]
  if (explicit?.assetId) return explicit
  if (assets.primary?.assetId) return assets.primary
  return assets.assetId ? { assetId: assets.assetId, variant: 'primary' } : undefined
}

/**
 * Catalog assets fail closed when an assetId is absent. This prevents legacy
 * paths or stale CDN URLs from silently becoming permanent application data.
 */
export function resolveCatalogRewardAsset(
  reward: { id: string; assets?: RewardCatalogAssets },
  usage: RewardAssetUsage = 'primary',
): string | undefined {
  const directUrl = usage === 'thumbnail'
    ? reward.assets?.thumbnailUrl ?? reward.assets?.imageUrl
    : usage === 'preview'
      ? reward.assets?.previewUrl ?? reward.assets?.imageUrl ?? reward.assets?.thumbnailUrl
      : reward.assets?.imageUrl ?? reward.assets?.thumbnailUrl
  if (directUrl) {
    try {
      const parsed = new URL(directUrl)
      if (parsed.origin === environment.storagePublicUrl) return parsed.toString()
    } catch {
      if (directUrl.startsWith('/assets/')) return directUrl
    }
  }
  const reference = selectRewardAssetReference(reward.assets, usage)
  return reference
    ? getGeneratedRewardAssetUrl(
        reference.assetId,
        reference.variant ?? 'primary',
        { release: reference.release, format: reference.format },
      )
    : undefined
}
