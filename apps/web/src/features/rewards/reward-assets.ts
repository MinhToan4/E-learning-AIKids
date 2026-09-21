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

const designerRewardFileMap: Record<string, { category: string; file: string }> = {
  // Backgrounds
  'background-ai-gate': { category: 'backgrounds', file: 'background-ai-gate' },
  'background-forest-guardian': { category: 'backgrounds', file: 'background-forest-guardian' },
  'background-ocean-artist': { category: 'backgrounds', file: 'background-ocean-artist' },
  // Frames
  'frame-galaxy': { category: 'frames', file: 'frame-galaxy' },
  'frame-rainbow': { category: 'frames', file: 'frame-rainbow' },
  'frame-cloud-summer': { category: 'frames', file: 'frame-cloud-summer' },
  'frame-language-kingdom': { category: 'frames', file: 'frame-language-kingdom' },
  'frame-summit-gold': { category: 'frames', file: 'frame-summit-gold' },
  'frame-galaxy-storyteller': { category: 'frames', file: 'frame-galaxy-storyteller' },
  // Themes
  'theme-paco-workshop': { category: 'themes', file: 'theme-paco-workshop' },
  'theme-community-legend': { category: 'themes', file: 'theme-community-legend' },
  'theme-future-workshop': { category: 'themes', file: 'theme-future-workshop' },
  'theme-legend': { category: 'themes', file: 'theme-legend' },
  'theme-cloud-garden': { category: 'themes', file: 'theme-cloud-garden' },
  'theme-colorful-city': { category: 'themes', file: 'theme-colorful-city' },
  'theme-magical-forest': { category: 'themes', file: 'theme-magical-forest' },
  'theme-ocean-ideas': { category: 'themes', file: 'theme-ocean-ideas' },
  'theme-paco-cosmic': { category: 'themes', file: 'theme-paco-cosmic' },
  'theme-star-library': { category: 'themes', file: 'theme-star-library' },
  'theme-workshop': { category: 'themes', file: 'theme-paco-workshop' },
  // Companions
  'avatar-paco-blue': { category: 'companions', file: 'avatar-paco-blue' },
  'companion-paco-cloud': { category: 'companions', file: 'paco-cloud-companion' },
  'companion-paco-leaf': { category: 'companions', file: 'paco-leaf-companion' },
  'companion-paco-sea': { category: 'companions', file: 'paco-sea-companion' },
  'companion-paco-fire': { category: 'companions', file: 'paco-fire-companion' },
  'paco-cloud-companion': { category: 'companions', file: 'paco-cloud-companion' },
  'paco-fire-companion': { category: 'companions', file: 'paco-fire-companion' },
  'paco-leaf-companion': { category: 'companions', file: 'paco-leaf-companion' },
  'paco-sea-companion': { category: 'companions', file: 'paco-sea-companion' },
  'paco-inventor': { category: 'companions', file: 'paco-inventor' },
  'paco-star-companion': { category: 'companions', file: 'paco-star-companion' },
  'paco-storyteller': { category: 'companions', file: 'paco-storyteller' },
  // Effects
  'effect-galaxy': { category: 'effects', file: 'effect-galaxy' },
  'effect-rainbow': { category: 'effects', file: 'effect-rainbow' },
  'effect-sunrise': { category: 'effects', file: 'effect-sunrise' },
  'perk-sticker-sparkle': { category: 'effects', file: 'perk-sticker-sparkle' },
  // Badges
  'badge-ai-storyteller': { category: 'badges', file: 'badge-ai-storyteller' },
  'badge-creative-superstar': { category: 'badges', file: 'badge-creative-superstar' },
  'badge-legendary-persistence': { category: 'badges', file: 'badge-legendary-persistence' },
  'badge-lightning-starter': { category: 'badges', file: 'badge-lightning-starter' },
  'badge-little-explorer': { category: 'badges', file: 'badge-little-explorer' },
  'badge-master-experimenter': { category: 'badges', file: 'badge-master-experimenter' },
  'badge-prompt-architect': { category: 'badges', file: 'badge-prompt-architect' },
  'badge-young-legend': { category: 'badges', file: 'badge-young-legend' },
}

export function isLocalRewardAssetTestMode(): boolean {
  return typeof window !== 'undefined'
    && ['127.0.0.1', 'localhost'].includes(window.location.hostname)
    && new URLSearchParams(window.location.search).get('asset-test') === 'antigravity'
}

export function localDesignerRewardAssetUrl(
  assetId: string,
  variant: RewardAssetVariant = 'primary',
): string | undefined {
  const mapped = designerRewardFileMap[assetId]
  if (!mapped) return undefined
  const basePath = ['/assets', 'rewards', mapped.category].join('/')
  if (variant === 'thumbnail') {
    return `${basePath}/${mapped.file}--thumb.webp`
  }
  const suffix = variant === 'plaque' ? '--plaque' : ''
  return `${basePath}/${mapped.file}${suffix}.webp`
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

  // Allow custom remote test CDN overrides when explicitly configured
  const runtimeBaseUrl = typeof window !== 'undefined'
    ? window.__AIKIDS_RUNTIME_CONFIG__?.rewardAssetBaseUrl
    : undefined
  const isCustomTestCdn = Boolean(runtimeBaseUrl && runtimeBaseUrl.includes('example.com'))

  if (!isCustomTestCdn) {
    const designerAsset = localDesignerRewardAssetUrl(assetId, variant)
    if (designerAsset) return designerAsset
  }

  const remoteUrl = resolveRemoteRewardAssetUrl(assetId, variant, {
    ...getRewardAssetLocationConfig(),
    ...location,
  })
  return remoteUrl && location?.release
    ? `${remoteUrl}?release=${encodeURIComponent(location.release)}`
    : remoteUrl
}
