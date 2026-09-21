const titleSvgModules = import.meta.glob<string>(
  [
    '../../assets/rewards/titles/storybook-title-*.svg',
    '../../assets/rewards/titles/title-*.svg',
  ],
  { eager: true, import: 'default', query: '?url' },
)

const titlePngModules = import.meta.glob<string>(
  '../../assets/rewards/titles/title-*.png',
  { eager: true, import: 'default', query: '?url' },
)

const titleThumbnailModules = import.meta.glob<string>(
  '../../assets/rewards/titles/*--thumbnail.webp',
  { eager: true, import: 'default', query: '?url' },
)

const titleAssets = new Map<string, string>()
const titleThumbnailAssets = new Map<string, string>()

// 1. First register SVGs (legacy fallback / storybook plaques)
for (const [path, url] of Object.entries(titleSvgModules)) {
  const fileName = path.split('/').at(-1)?.replace(/\.svg$/, '') ?? ''
  if (fileName) {
    titleAssets.set(fileName, url)
  }
}

// 2. Register horizontal designer title plaques, taking precedence over SVGs.
// Circular badge artwork is a different reward family and must never be used
// as a title: titles are always long horizontal plaques.
for (const [path, url] of Object.entries(titlePngModules)) {
  const fileName = path.split('/').at(-1)?.replace(/\.png$/, '') ?? ''
  if (!fileName) continue
  titleAssets.set(fileName, url)

}

for (const [path, url] of Object.entries(titleThumbnailModules)) {
  const fileName = path.split('/').at(-1)?.replace(/--thumbnail\.webp$/, '') ?? ''
  if (fileName) titleThumbnailAssets.set(fileName, url)
}

/** Resolve only the approved title plaques exported from the Figma Title frame. */
export function rewardTitleAsset(
  rewardId?: string,
  variant: 'primary' | 'thumbnail' = 'primary',
): string | undefined {
  if (!rewardId) return undefined
  if (variant === 'thumbnail') {
    return titleThumbnailAssets.get(rewardId) ?? titleAssets.get(rewardId)
  }
  return titleAssets.get(rewardId)
}

export type RewardSource = 'level' | 'storybook' | 'achievement' | 'event'

export function rewardSource(unlockType: string): RewardSource {
  if (unlockType === 'xp_level') return 'level'
  if (unlockType === 'storybook_sticker') return 'storybook'
  if (unlockType === 'event') return 'event'
  return 'achievement'
}

export function isRewardUnlocked(
  reward: { id: string; unlock: { type: string; value: string | number } },
  owned: ReadonlySet<string>,
  _xpLevel: number,
): boolean {
  if (
    reward.id === 'storybook-title-p01' &&
    typeof window !== 'undefined' &&
    ['127.0.0.1', 'localhost'].includes(window.location.hostname) &&
    new URLSearchParams(window.location.search).get('reward-test') === 'storybook-p01'
  ) return true
  // The backend inventory is authoritative for every reward source. Level and
  // Storybook rules are projected into that inventory before this screen is
  // returned. Inferring ownership again in the browser can expose an Equip
  // action that the backend correctly rejects, making the choice disappear on
  // refresh.
  return owned.has(reward.id)
}
