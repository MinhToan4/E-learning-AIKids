export type LevelRewardLike = {
  code: string
  name: string
  unlockRule?: { type?: string; value?: number | string }
  content?: { level?: number }
  displayConfig?: { level?: number }
}

export function levelForReward(reward: LevelRewardLike): number {
  return Number(reward.content?.level ?? reward.displayConfig?.level ?? reward.unlockRule?.value ?? 0)
}

/** Reject malformed/duplicate catalog rows without inventing a local reward track. */
export function displayableLevelRewards<T extends LevelRewardLike>(rewards: readonly T[]): T[] {
  const seen = new Set<string>()
  return rewards
    .filter((reward) => {
      const level = levelForReward(reward)
      if (reward.unlockRule?.type !== 'xp_level' || !reward.code.trim() || !reward.name.trim()) return false
      if (!Number.isInteger(level) || level <= 0 || seen.has(reward.code)) return false
      seen.add(reward.code)
      return true
    })
    .sort((left, right) => levelForReward(left) - levelForReward(right))
}
