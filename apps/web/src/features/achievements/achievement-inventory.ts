import type { AchievementRow } from '@/shared/lib/api'

/** Keep the Hub as source of truth while rejecting malformed or duplicate rows. */
export function displayableAchievements(rows: readonly AchievementRow[]): AchievementRow[] {
  const seen = new Set<string>()
  return rows.filter((row) => {
    const type = row.type.trim()
    if (!type || !row.title.trim() || !Number.isFinite(row.requiredValue) || row.requiredValue <= 0) {
      return false
    }
    if (seen.has(type)) return false
    seen.add(type)
    return !row.hidden || row.unlocked
  })
}
