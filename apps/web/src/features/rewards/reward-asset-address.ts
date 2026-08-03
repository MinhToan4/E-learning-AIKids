export type RewardAssetVariant = 'primary' | 'plaque' | 'preview' | 'thumbnail'

export interface RewardAssetLocationConfig {
  baseUrl?: string
  release?: string
  format?: 'avif' | 'png' | 'svg' | 'webp'
}

const ASSET_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const RELEASE_PATTERN = /^[a-zA-Z0-9]+(?:[._-][a-zA-Z0-9]+)*$/

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '')
}

export function isRewardAssetId(value: string): boolean {
  return ASSET_ID_PATTERN.test(value)
}

/**
 * A stable logical address. Persist this address/asset ID, never a file path.
 * Example: reward://frame-cloud-summer/plaque
 */
export function createRewardAssetAddress(
  assetId: string,
  variant: RewardAssetVariant = 'primary',
): string {
  if (!isRewardAssetId(assetId)) {
    throw new Error(`Invalid reward asset ID: ${assetId}`)
  }
  return `reward://${assetId}/${variant}`
}

export function getRewardAssetLocationConfig(): RewardAssetLocationConfig {
  const runtime = typeof window === 'undefined'
    ? undefined
    : window.__AIKIDS_RUNTIME_CONFIG__

  return {
    baseUrl: runtime?.rewardAssetBaseUrl
      ?? import.meta.env.VITE_REWARD_ASSET_BASE_URL,
    release: runtime?.rewardAssetRelease
      ?? import.meta.env.VITE_REWARD_ASSET_RELEASE,
    format: runtime?.rewardAssetFormat
      ?? import.meta.env.VITE_REWARD_ASSET_FORMAT,
  }
}

/**
 * Deterministic CDN/VPS path:
 * {baseUrl}/rewards/{release}/{assetId}[--variant].{format}
 *
 * Release directories are immutable. Changing runtime-config.js switches the
 * entire app to another release without rebuilding its JavaScript.
 */
export function resolveRemoteRewardAssetUrl(
  assetId: string,
  variant: RewardAssetVariant = 'primary',
  config: RewardAssetLocationConfig = getRewardAssetLocationConfig(),
): string | undefined {
  const baseUrl = config.baseUrl?.trim().replace(/\/+$/g, '')
  if (!baseUrl || !isRewardAssetId(assetId)) return undefined

  const release = trimSlashes(config.release?.trim() || 'v1')
  if (!RELEASE_PATTERN.test(release)) return undefined

  const format = config.format ?? 'webp'
  const suffix = variant === 'primary' ? '' : `--${variant}`
  return `${baseUrl}/rewards/${release}/${assetId}${suffix}.${format}`
}
