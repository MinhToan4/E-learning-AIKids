import {
  getRewardAssetLocationConfig,
  resolveRemoteRewardAssetUrl,
  type RewardAssetVariant,
} from './reward-asset-address'
import { designerAssets } from '@/shared/config/assets'

const LEVEL_REWARD_ASSET_RELEASE = '2026.08.01.6'

// Static catalog artwork published in the active immutable release. Do not
// derive an image URL for every reward ID: titles, tickets and perks may be
// icon-only, and an inferred URL turns those valid rewards into broken images.
const verifiedStaticRewardAssetIds = new Set([
  'title-first-light',
  'avatar-paco-blue',
  'frame-rainbow',
  'theme-workshop',
  'perk-sticker-sparkle',
  'frame-galaxy',
  'theme-legend',
  'frame-cloud-summer',
  'background-ai-gate',
  'frame-language-kingdom',
  'frame-summit-gold',
  'frame-galaxy-storyteller',
])

// Level frames are part of the UI composition contract. Keep their clean frame
// layer local so the app never falls back to a preview with baked-in text when
// a remote reward release is missing or stale. Level text lives outside artwork.
const localLevelFrameModules = import.meta.glob<string>(
  [
    '../../assets/rewards/frames/frame-level-*.webp',
    '!../../assets/rewards/frames/frame-level-*--preview.webp',
    '!../../assets/rewards/frames/frame-level-*--plaque.webp',
  ],
  { eager: true, import: 'default', query: '?url' },
)

const localSvgFrameModules = import.meta.glob<string>(
  '../../assets/rewards/frames/frame-*.svg',
  { eager: true, import: 'default', query: '?url' },
)

function localLevelFrameAssetUrl(
  assetId: string,
  variant: RewardAssetVariant,
): string | undefined {
  if (!/^frame-level-(?:15|25|35|45|55|65|75|85|95|100)$/.test(assetId)) return undefined
  if (variant !== 'primary') return undefined
  return localLevelFrameModules[`../../assets/rewards/frames/${assetId}.webp`]
}

function localSvgFrameAssetUrl(
  assetId: string,
  variant: RewardAssetVariant,
): string | undefined {
  if (variant !== 'primary') return undefined
  return localSvgFrameModules[`../../assets/rewards/frames/${assetId}.svg`]
}

const localTransparentCompanionAssets: Record<string, string> = {
  'avatar-paco-blue': designerAssets.companions.cloud,
  'companion-paco-cloud': designerAssets.companions.cloud,
  'companion-paco-leaf': designerAssets.companions.leaf,
  'companion-paco-sea': designerAssets.companions.sea,
  'companion-paco-fire': designerAssets.companions.fire,
}

const sharedLevelRewardAssets = {
  companion: ['companion-paco-cloud', 'companion-paco-leaf', 'companion-paco-sea', 'companion-paco-fire'],
  background: ['background-cloud-garden', 'background-star-library', 'background-ocean-ideas', 'background-magical-forest', 'background-future-workshop', 'background-colorful-city', 'background-community-legend', 'background-paco-cosmic', 'background-paco-workshop'],
  theme: ['background-cloud-garden', 'background-star-library', 'background-ocean-ideas', 'background-magical-forest', 'background-future-workshop', 'background-colorful-city', 'background-community-legend', 'background-paco-cosmic', 'background-paco-workshop'],
  effect: ['effect-sunrise', 'effect-rainbow', 'effect-galaxy', 'effect-sparkle'],
  title: ['title-common'],
} as const

export type SharedLevelRewardKind = keyof typeof sharedLevelRewardAssets

export function getLevelRewardNumber(
  rewardId: string | undefined,
  kind: SharedLevelRewardKind,
): number | undefined {
  const match = rewardId?.match(new RegExp(`^${kind}-level-(\\d+)$`))
  return match ? Number(match[1]) : undefined
}

export function getSharedLevelRewardAssetId(rewardId?: string): string | undefined {
  const match = rewardId?.match(/^(companion|background|theme|effect|title)-level-(\d+)$/)
  if (!match) return undefined
  const kind = match[1] as SharedLevelRewardKind
  const level = Number(match[2])
  const tier = Math.min(8, Math.max(0, Math.floor((level - 11) / 10)))
  const assets = sharedLevelRewardAssets[kind]
  return assets[kind === 'background' || kind === 'theme' ? tier : tier % assets.length]
}

export function getResolvedRewardAssetUrl(
  rewardId?: string,
  variant: RewardAssetVariant = 'primary',
): string | undefined {
  const sharedAssetId = getSharedLevelRewardAssetId(rewardId)
  return sharedAssetId
    ? getGeneratedRewardAssetUrl(sharedAssetId, variant, {
        release: LEVEL_REWARD_ASSET_RELEASE,
        format: 'webp',
      })
    : getGeneratedRewardAssetUrl(rewardId, variant)
}

export function getVerifiedStaticRewardAssetUrl(
  rewardId?: string,
  variant: RewardAssetVariant = 'primary',
): string | undefined {
  return rewardId && verifiedStaticRewardAssetIds.has(rewardId)
    ? getGeneratedRewardAssetUrl(rewardId, variant)
    : undefined
}

const antigravityTestAliases: Record<string, string> = {
  'avatar-paco-blue': 'paco-cloud-companion',
  'background-forest-guardian': 'background-forest-guardian',
  'background-ocean-artist': 'background-ocean-artist',
  'frame-cloud-summer': 'frame-cloud-summer',
  'frame-galaxy': 'frame-galaxy',
  'perk-sticker-sparkle': 'perk-sticker-sparkle',
  'theme-community-legend': 'theme-paco-cosmic',
  'theme-legend': 'theme-star-library',
  'theme-paco-workshop': 'theme-future-workshop',
  'theme-workshop': 'theme-future-workshop',
}

export function isLocalRewardAssetTestMode(): boolean {
  return typeof window !== 'undefined'
    && ['127.0.0.1', 'localhost'].includes(window.location.hostname)
    && new URLSearchParams(window.location.search).get('asset-test') === 'antigravity'
}

function localTestRewardAssetUrl(
  assetId: string,
  variant: RewardAssetVariant,
): string | undefined {
  if (!isLocalRewardAssetTestMode()) return undefined
  const runtime = window.__AIKIDS_RUNTIME_CONFIG__
  const rewardBase = getRewardAssetLocationConfig().baseUrl?.replace(/\/+$/g, '')
  const testPath = runtime?.rewardAssetTestPath
    ?? '/test-imports/2026.07.31-antigravity'
  const alias = antigravityTestAliases[assetId]
  if (!rewardBase || !testPath || !alias) return undefined
  const suffix = variant === 'plaque' ? '--plaque' : ''
  return `${rewardBase}/${testPath.replace(/^\/+|\/+$/g, '')}/${alias}${suffix}.jpg`
}

export function getGeneratedRewardAssetUrl(
  assetId?: string,
  variant: RewardAssetVariant = 'primary',
  location?: { release?: string; format?: 'avif' | 'png' | 'svg' | 'webp' },
): string | undefined {
  if (!assetId) return undefined
  const localSvgFrame = localSvgFrameAssetUrl(assetId, variant)
  if (localSvgFrame) return localSvgFrame
  const localLevelFrame = localLevelFrameAssetUrl(assetId, variant)
  if (localLevelFrame) return localLevelFrame
  const localCompanion = localTransparentCompanionAssets[assetId]
  if (localCompanion) return localCompanion
  const testAsset = localTestRewardAssetUrl(assetId, variant)
  if (testAsset) return testAsset
  const remoteUrl = resolveRemoteRewardAssetUrl(assetId, variant, {
    ...getRewardAssetLocationConfig(),
    ...location,
  })
  return remoteUrl && location?.release
    ? `${remoteUrl}?release=${encodeURIComponent(location.release)}`
    : remoteUrl
}
