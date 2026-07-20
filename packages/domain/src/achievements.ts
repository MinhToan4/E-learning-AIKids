/**
 * Pure achievement unlock rules — evaluated after progress events.
 * HTTP layer only persists; tests prove thresholds without DB.
 */

export type AchievementType =
  | 'first_quest'
  | 'streak_3'
  | 'streak_7'
  | 'streak_30'
  | 'star_10'
  | 'star_50'
  | 'course_complete'
  | 'project_first'

export interface AchievementMeta {
  type: AchievementType
  title: string
  description: string
  icon: string
  requiredValue: number
}

export const ACHIEVEMENT_CATALOG: readonly AchievementMeta[] = [
  {
    type: 'first_quest',
    title: 'Khám Phá Đầu Tiên',
    description: 'Hoàn thành bài học đầu tiên',
    icon: '🌟',
    requiredValue: 1,
  },
  {
    type: 'streak_3',
    title: 'Chăm Chỉ 3 Ngày',
    description: 'Học liên tục 3 ngày',
    icon: '🔥',
    requiredValue: 3,
  },
  {
    type: 'streak_7',
    title: 'Tuần Lễ Rực Rỡ',
    description: 'Học liên tục 7 ngày',
    icon: '⚡',
    requiredValue: 7,
  },
  {
    type: 'streak_30',
    title: 'Siêu Sao Kiên Trì',
    description: 'Học liên tục 30 ngày',
    icon: '💎',
    requiredValue: 30,
  },
  {
    type: 'star_10',
    title: 'Thu Thập 10 Sao',
    description: 'Đạt tổng cộng 10 ngôi sao',
    icon: '⭐',
    requiredValue: 10,
  },
  {
    type: 'star_50',
    title: 'Bộ Sưu Tập Sao',
    description: 'Đạt tổng cộng 50 ngôi sao',
    icon: '🌠',
    requiredValue: 50,
  },
  {
    type: 'course_complete',
    title: 'Tốt Nghiệp',
    description: 'Hoàn thành một khóa học',
    icon: '🎓',
    requiredValue: 1,
  },
  {
    type: 'project_first',
    title: 'Sáng Tạo Đầu Tay',
    description: 'Tạo dự án đầu tiên',
    icon: '🎨',
    requiredValue: 1,
  },
] as const

export interface ProgressSnapshot {
  /** Completed quests count for this user (lifetime) */
  completedQuests: number
  /** Sum of stars across quest progress */
  totalStars: number
  /** Current daily streak */
  streakCurrent: number
  /** Number of completed courses (all quests done) */
  coursesCompleted: number
  /** Number of creative projects */
  projectCount: number
  /** Types already unlocked */
  alreadyUnlocked: ReadonlySet<string> | string[]
}

function has(set: ReadonlySet<string> | string[], type: string): boolean {
  if (Array.isArray(set)) return set.includes(type)
  return set.has(type)
}

/**
 * Returns achievement types newly earned given snapshot (not yet unlocked).
 */
export function achievementsToUnlock(snap: ProgressSnapshot): AchievementType[] {
  const out: AchievementType[] = []
  const tryAdd = (type: AchievementType, condition: boolean) => {
    if (condition && !has(snap.alreadyUnlocked, type)) out.push(type)
  }

  tryAdd('first_quest', snap.completedQuests >= 1)
  tryAdd('streak_3', snap.streakCurrent >= 3)
  tryAdd('streak_7', snap.streakCurrent >= 7)
  tryAdd('streak_30', snap.streakCurrent >= 30)
  tryAdd('star_10', snap.totalStars >= 10)
  tryAdd('star_50', snap.totalStars >= 50)
  tryAdd('course_complete', snap.coursesCompleted >= 1)
  tryAdd('project_first', snap.projectCount >= 1)

  return out
}

export function getAchievementMeta(type: string): AchievementMeta | undefined {
  return ACHIEVEMENT_CATALOG.find((a) => a.type === type)
}
