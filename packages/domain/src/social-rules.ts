export const PACO_PICK_WEEKLY_LIMIT = 3
export const FAVORITE_FRIEND_LIMIT = 6

export type ReactionType =
  | 'EXCELLENT'
  | 'CREATIVE'
  | 'HOT'
  | 'LOVE'
  | 'INSIGHTFUL'
  | 'PACO_PICK'

export const REACTION_TYPES = [
  'EXCELLENT',
  'CREATIVE',
  'HOT',
  'LOVE',
  'INSIGHTFUL',
  'PACO_PICK',
] as const satisfies readonly ReactionType[]

export type ActivityAudience = 'friends' | 'family' | 'school'

export type ProfileModule =
  | 'storybook'
  | 'progress'
  | 'achievements'
  | 'works'
  | 'friends'
  | 'activity'

export const PROFILE_MODULES = [
  'storybook',
  'progress',
  'achievements',
  'works',
  'friends',
  'activity',
] as const satisfies readonly ProfileModule[]

export type SocialActivityType =
  | 'chapter_completed'
  | 'reward_unlocked'
  | 'level_reached'
  | 'achievement_unlocked'
  | 'course_completed'
  | 'streak_milestone'
  | 'work_shared'
  | 'challenge_completed'

export const SOCIAL_ACTIVITY_TYPES = [
  'chapter_completed',
  'reward_unlocked',
  'level_reached',
  'achievement_unlocked',
  'course_completed',
  'streak_milestone',
  'work_shared',
  'challenge_completed',
] as const satisfies readonly SocialActivityType[]

export function isReactionType(value: string): value is ReactionType {
  return REACTION_TYPES.includes(value as ReactionType)
}

export function isSocialActivityType(
  value: string,
): value is SocialActivityType {
  return SOCIAL_ACTIVITY_TYPES.includes(value as SocialActivityType)
}

export function isShareableWorkspaceKind(kind: string): boolean {
  return !/(?:^|[_-])(video|film|movie)(?:$|[_-])/i.test(kind.trim())
}

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

export type FriendInviteStatus =
  | 'created'
  | 'parent_review'
  | 'active'
  | 'declined'
  | 'expired'
  | 'blocked'

export function canonicalConnectionPair(
  firstChildId: string,
  secondChildId: string,
): [string, string] {
  if (!firstChildId || !secondChildId || firstChildId === secondChildId) {
    throw new Error('A connection requires two different children.')
  }
  return firstChildId < secondChildId
    ? [firstChildId, secondChildId]
    : [secondChildId, firstChildId]
}

export function friendInviteStatus(input: {
  recipientAccepted: boolean
  senderParentApproved: boolean
  recipientParentApproved: boolean
  terminalStatus?: 'declined' | 'expired' | 'blocked'
}): FriendInviteStatus {
  if (input.terminalStatus) return input.terminalStatus
  if (!input.recipientAccepted) return 'created'
  if (input.senderParentApproved && input.recipientParentApproved) {
    return 'active'
  }
  return 'parent_review'
}
