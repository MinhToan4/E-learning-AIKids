export const PACO_PICK_WEEKLY_LIMIT = 3
export const FAVORITE_FRIEND_LIMIT = 6

export type ReactionType =
  | 'EXCELLENT'
  | 'CREATIVE'
  | 'HOT'
  | 'LOVE'
  | 'INSIGHTFUL'
  | 'PACO_PICK'

export type ReactionCounts = Record<ReactionType, number>

export const REACTION_WEIGHTS: Readonly<Record<ReactionType, number>> = {
  EXCELLENT: 1,
  CREATIVE: 1,
  HOT: 1,
  LOVE: 1,
  INSIGHTFUL: 1,
  PACO_PICK: 5,
}

export function canUsePacoPick(usedThisWeek: number): boolean {
  return Number.isInteger(usedThisWeek) &&
    usedThisWeek >= 0 &&
    usedThisWeek < PACO_PICK_WEEKLY_LIMIT
}

export function getIsoWeekKey(date = new Date()): string {
  const target = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  ))
  const day = target.getUTCDay() || 7
  target.setUTCDate(target.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1))
  const week = Math.ceil(
    ((target.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  )
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

export function computeReactionScore(reactions: ReactionCounts): number {
  return (Object.keys(REACTION_WEIGHTS) as ReactionType[]).reduce(
    (score, type) =>
      score + REACTION_WEIGHTS[type] * Math.max(0, reactions[type] || 0),
    0,
  )
}

export function canFavoriteFriend(currentFavorites: number): boolean {
  return Number.isInteger(currentFavorites) &&
    currentFavorites >= 0 &&
    currentFavorites < FAVORITE_FRIEND_LIMIT
}

export function normalizeFriendCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
}

export function isValidFriendCode(value: string): boolean {
  return /^[A-Z0-9]{8}$/.test(normalizeFriendCode(value))
}
