import type { AchievementRow } from '@/shared/lib/api'
import { achievementEvolutionTier } from './achievement-config'

function milestoneAchievement(
  achievement: AchievementRow,
  milestone: NonNullable<AchievementRow['milestones']>[number],
  tierIndex: number,
): AchievementRow {
  const unlocked = milestone.unlocked === true
    || milestone.unlockedAt != null
    || (achievement.currentValue != null && achievement.currentValue >= milestone.threshold)

  return {
    ...achievement,
    type: `${achievement.seriesKey ?? achievement.type}:${milestone.threshold}`,
    title: `${achievement.title} · ${achievementEvolutionTier(tierIndex).label}`,
    requiredValue: milestone.threshold,
    points: milestone.points ?? achievement.points,
    rewardLabel: milestone.rewardLabel ?? achievement.rewardLabel,
    rewardAssetId: milestone.rewardAssetId ?? achievement.rewardAssetId,
    milestones: undefined,
    unlocked,
    unlockedAt: milestone.unlockedAt ?? (unlocked ? achievement.unlockedAt : null),
  }
}

/**
 * Keep the Hub as source of truth while expanding every published milestone.
 * A series is one backend definition, but each milestone is one collectible card.
 */
export function displayableAchievements(rows: readonly AchievementRow[]): AchievementRow[] {
  const seen = new Set<string>()
  return rows.flatMap((row) => {
    const type = row.type.trim()
    if (!type || !row.title.trim() || !Number.isFinite(row.requiredValue) || row.requiredValue <= 0) {
      return []
    }
    const candidates = row.milestones?.length
      ? row.milestones
        .filter((milestone) => Number.isFinite(milestone.threshold) && milestone.threshold > 0)
        .map((milestone, index) => milestoneAchievement(row, milestone, index))
      : [row]

    return candidates.filter((candidate) => {
      if (seen.has(candidate.type)) return false
      seen.add(candidate.type)
      return !candidate.hidden || candidate.unlocked
    })
  })
}

/**
 * Personal records are a summary lens over the achievement inventory. They are
 * not a mutually-exclusive catalog category: one lesson milestone can inform a
 * personal-best card and must still remain visible in the collectible grid.
 */
export function achievementCollectionItems(rows: readonly AchievementRow[]): AchievementRow[] {
  return [...rows]
}

/** Uses the same expanded inventory everywhere a compact "latest earned" list
 * is shown. Stable input order is retained when legacy rows have no timestamp. */
export function recentUnlockedAchievements(
  rows: readonly AchievementRow[],
  limit = 3,
): AchievementRow[] {
  return displayableAchievements(rows)
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.unlocked)
    .sort((a, b) => {
      const aTime = a.item.unlockedAt ? Date.parse(a.item.unlockedAt) : Number.NaN
      const bTime = b.item.unlockedAt ? Date.parse(b.item.unlockedAt) : Number.NaN
      if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) return bTime - aTime
      if (Number.isFinite(aTime) !== Number.isFinite(bTime)) return Number.isFinite(bTime) ? 1 : -1
      return a.index - b.index
    })
    .slice(0, Math.max(0, limit))
    .map(({ item }) => item)
}

export type AchievementSeries = {
  key: string
  items: AchievementRow[]
}

function inferredSeriesKey(item: AchievementRow): string {
  if (item.seriesKey?.trim()) return item.seriesKey.trim().toLowerCase()

  const category = item.category?.trim().toLowerCase()
  if (category === 'stars') return 'stars'
  if (category === 'habit' || category === 'streak') return 'streak'
  if (category === 'xp') return 'xp'
  if (category === 'level') return 'level'
  if (category === 'lessons_completed') return 'lessons'
  if (category === 'courses_completed') return 'courses'
  if (category === 'creation' || category === 'creative') return 'creative'
  if (category === 'collaboration') return 'collaboration'

  const semantic = `${item.type} ${item.category ?? ''} ${item.description}`.toLowerCase()
  if (semantic.includes('course') || semantic.includes('khóa học')) return 'courses'
  if (semantic.includes('lesson') || semantic.includes('bài học')) return 'lessons'
  if (semantic.includes('streak') || semantic.includes('habit') || semantic.includes('liên tiếp')) return 'streak'
  if (semantic.includes('star') || semantic.includes('ngôi sao') || semantic.includes('sao từ')) return 'stars'
  if (semantic.includes('xp')) return 'xp'
  if (semantic.includes('level') || semantic.includes('cấp độ')) return 'level'
  if (semantic.includes('perfect') || semantic.includes('hoàn hảo')) return 'perfect'
  if (semantic.includes('creative') || semantic.includes('creation') || semantic.includes('tác phẩm')) return 'creative'
  if (semantic.includes('collaboration') || semantic.includes('cộng tác')) return 'collaboration'
  if (semantic.includes('quest') || semantic.includes('mission') || semantic.includes('nhiệm vụ')) return 'quests'
  return item.type.split(':')[0].trim().toLowerCase()
}

/** Groups legacy one-threshold definitions and modern milestone definitions
 * into the same evolving achievement family without inventing catalog data. */
export function groupAchievementSeries(rows: readonly AchievementRow[]): AchievementSeries[] {
  const groups = new Map<string, AchievementRow[]>()
  for (const item of rows) {
    const key = inferredSeriesKey(item)
    const group = groups.get(key)
    if (group) group.push(item)
    else groups.set(key, [item])
  }

  return [...groups.entries()].map(([key, items]) => ({
    key,
    items: items.sort((a, b) => a.requiredValue - b.requiredValue),
  }))
}
