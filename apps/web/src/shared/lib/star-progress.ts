import type { QuestProgress } from './api'

export const STARS_PER_STATION = 3

export function clampStationStars(value: unknown): number {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return 0
  return Math.max(0, Math.min(STARS_PER_STATION, Math.trunc(numeric)))
}

export function dedupeStationProgress<T extends Pick<QuestProgress, 'id' | 'stars' | 'status'>>(
  stations: T[],
): T[] {
  const byId = new Map<string, T>()
  for (const station of stations) {
    const id = String(station.id ?? '').trim()
    if (!id) continue
    const normalized = { ...station, stars: clampStationStars(station.stars) } as T
    const current = byId.get(id)
    if (!current || normalized.stars > clampStationStars(current.stars) ||
      (normalized.status === 'completed' && current.status !== 'completed')) {
      byId.set(id, normalized)
    }
  }
  return [...byId.values()]
}

export function calculateCourseStars(
  stations: Array<Pick<QuestProgress, 'stars'>>,
  aggregateStars?: unknown,
): { earned: number; maximum: number } {
  const maximum = stations.length * STARS_PER_STATION
  const detailed = stations.reduce((sum, station) => sum + clampStationStars(station.stars), 0)
  const aggregate = Math.max(0, Math.trunc(Number(aggregateStars) || 0))
  return {
    earned: Math.min(maximum, detailed > 0 ? detailed : aggregate),
    maximum,
  }
}

export function clampCourseAggregateStars(totalStars: unknown, stationCount: number): number {
  const maximum = Math.max(0, stationCount) * STARS_PER_STATION
  const earned = Math.max(0, Math.trunc(Number(totalStars) || 0))
  return maximum > 0 ? Math.min(earned, maximum) : earned
}
