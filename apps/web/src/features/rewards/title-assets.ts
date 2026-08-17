const titleModules = import.meta.glob<string>(
  [
    '../../assets/rewards/titles/storybook-title-*.svg',
    '../../assets/rewards/titles/title-*.svg',
  ],
  { eager: true, import: 'default', query: '?url' },
)

const titleAssets = new Map(
  Object.entries(titleModules).map(([path, url]) => [
    path.split('/').at(-1)?.replace(/\.svg$/, '') ?? '',
    url,
  ]),
)

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
