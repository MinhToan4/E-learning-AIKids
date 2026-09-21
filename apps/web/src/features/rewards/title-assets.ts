const titleSvgModules = import.meta.glob<string>(
  [
    '../../assets/rewards/titles/storybook-title-*.svg',
    '../../assets/rewards/titles/title-*.svg',
  ],
  { eager: true, import: 'default', query: '?url' },
)

const titlePngModules = import.meta.glob<string>(
  [
    '../../assets/rewards/badges/badge-title-*.png',
    '../../assets/rewards/titles/title-*.png',
  ],
  { eager: true, import: 'default', query: '?url' },
)

const titleAssets = new Map<string, string>()

// 1. First register SVGs (legacy fallback / storybook plaques)
for (const [path, url] of Object.entries(titleSvgModules)) {
  const fileName = path.split('/').at(-1)?.replace(/\.svg$/, '') ?? ''
  if (fileName) {
    titleAssets.set(fileName, url)
  }
}

// 2. Register designer PNG badges and titles, taking precedence over SVGs
for (const [path, url] of Object.entries(titlePngModules)) {
  const fileName = path.split('/').at(-1)?.replace(/\.png$/, '') ?? ''
  if (!fileName) continue
  titleAssets.set(fileName, url)

  if (fileName.startsWith('badge-title-')) {
    // e.g. badge-title-first-light -> title-first-light
    const titleId = fileName.replace(/^badge-/, '')
    titleAssets.set(titleId, url)
  } else if (fileName.startsWith('title-')) {
    // e.g. title-gate-keeper -> badge-title-gate-keeper
    titleAssets.set(`badge-${fileName}`, url)
  }
}

/** Resolve only the approved title plaques exported from the Figma Title frame. */
export function rewardTitleAsset(rewardId?: string): string | undefined {
  if (!rewardId) return undefined
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
