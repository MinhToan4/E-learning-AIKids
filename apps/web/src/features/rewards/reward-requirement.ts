import type { RewardDefinition } from '@/shared/lib/creation/rewards'

export type RewardRequirement = RewardDefinition['unlock']

/** Normalize Hub catalog rules without guessing one reward source from another. */
export function normalizeRewardRequirement(input?: {
  type?: string
  value?: string | number
}): RewardRequirement {
  const value = input?.value ?? ''
  switch (input?.type) {
    case 'xp_level':
      return { type: 'xp_level', value }
    case 'storybook_sticker':
      return { type: 'storybook_sticker', value }
    case 'event':
      return { type: 'event', value }
    default:
      return { type: 'achievement', value }
  }
}
