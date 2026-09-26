import { describe, expect, it } from 'vitest'
import {
  calculateCourseStars,
  clampCourseAggregateStars,
  clampStationStars,
  dedupeStationProgress,
} from './star-progress'

describe('star progress integrity', () => {
  it('clamps every station to the canonical 0–3 range', () => {
    expect(clampStationStars(-2)).toBe(0)
    expect(clampStationStars(2.9)).toBe(2)
    expect(clampStationStars(9)).toBe(3)
    expect(clampStationStars('invalid')).toBe(0)
  })

  it('deduplicates repeated phase rows and keeps the best authoritative result', () => {
    const rows = dedupeStationProgress([
      { id: 'lesson-1', stars: 1, status: 'in_progress' as const },
      { id: 'lesson-1', stars: 3, status: 'completed' as const },
      { id: 'lesson-2', stars: 8, status: 'completed' as const },
    ])
    expect(rows).toHaveLength(2)
    expect(rows.map((row) => row.stars)).toEqual([3, 3])
  })

  it('prefers detailed station stars and never exceeds the course maximum', () => {
    expect(calculateCourseStars([{ stars: 2 }, { stars: 3 }], 99)).toEqual({
      earned: 5,
      maximum: 6,
    })
    expect(calculateCourseStars([{ stars: 0 }, { stars: 0 }], 8)).toEqual({
      earned: 6,
      maximum: 6,
    })
  })

  it('clamps pathway aggregates using the published station count', () => {
    expect(clampCourseAggregateStars(20, 4)).toBe(12)
  })
})
