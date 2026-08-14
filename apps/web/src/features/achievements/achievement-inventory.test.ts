import { describe, expect, it } from 'vitest'
import type { AchievementRow } from '@/shared/lib/api'
import { achievementCollectionItems, displayableAchievements, groupAchievementSeries, recentUnlockedAchievements } from './achievement-inventory'

const achievement = (overrides: Partial<AchievementRow> = {}): AchievementRow => ({
  type: 'first-lesson',
  title: 'Bài học đầu tiên',
  description: 'Hoàn thành bài học đầu tiên.',
  icon: '🏅',
  requiredValue: 1,
  unlocked: false,
  unlockedAt: null,
  ...overrides,
})

describe('displayable achievements', () => {
  it('removes malformed, duplicate and hidden locked rows', () => {
    const rows = displayableAchievements([
      achievement(),
      achievement({ title: 'Bản sao' }),
      achievement({ type: '', title: 'Thiếu mã' }),
      achievement({ type: 'bad-threshold', requiredValue: 0 }),
      achievement({ type: 'hidden', hidden: true }),
      achievement({ type: 'hidden-earned', hidden: true, unlocked: true }),
    ])

    expect(rows.map((row) => row.type)).toEqual(['first-lesson', 'hidden-earned'])
  })

  it('expands backend milestones into individual collectible achievements', () => {
    const rows = displayableAchievements([
      achievement({
        type: 'lesson-series',
        seriesKey: 'lessons',
        title: 'Nhà thám hiểm',
        currentValue: 12,
        milestones: [
          { threshold: 1, label: 'Bước đầu tiên', points: 5, rewardLabel: 'Huy hiệu Khởi hành' },
          { threshold: 10, label: 'Nhà thám hiểm', points: 20, rewardLabel: 'Khung Mầm xanh' },
          { threshold: 50, label: 'Bậc thầy hành trình', points: 50 },
        ],
      }),
    ])

    expect(rows.map((row) => row.type)).toEqual(['lessons:1', 'lessons:10', 'lessons:50'])
    expect(rows.map((row) => row.unlocked)).toEqual([true, true, false])
    expect(rows[1]).toMatchObject({
      title: 'Nhà thám hiểm · Đồng hành',
      requiredValue: 10,
      rewardLabel: 'Khung Mầm xanh',
      imageUrl: undefined,
    })
  })

  it('carries backend milestone artwork into each collectible card', () => {
    const imageUrl = 'https://storage.storymee.com/reward-assets/achievements/2026.08.14/v2/lessons/level-1.png'
    const [row] = displayableAchievements([achievement({
      seriesKey: 'lessons',
      milestones: [{ threshold: 1, imageUrl }],
    })])

    expect(row?.imageUrl).toBe(imageUrl)
  })

  it('keeps record-backed milestones in the collectible achievement grid', () => {
    const rows = displayableAchievements([
      achievement({
        type: 'lesson-series',
        seriesKey: 'lessons',
        currentValue: 12,
        milestones: [
          { threshold: 1, label: 'Bước đầu tiên' },
          { threshold: 10, label: 'Nhà thám hiểm' },
          { threshold: 50, label: 'Bậc thầy hành trình' },
        ],
      }),
    ])

    expect(achievementCollectionItems(rows).map((row) => row.type)).toEqual([
      'lessons:1',
      'lessons:10',
      'lessons:50',
    ])
  })

  it('returns the latest unlocked collectible milestones for compact surfaces', () => {
    const rows = [
      achievement({ type: 'older', unlocked: true, unlockedAt: '2026-08-01T08:00:00.000Z' }),
      achievement({ type: 'locked', unlocked: false }),
      achievement({ type: 'newest', unlocked: true, unlockedAt: '2026-08-11T08:00:00.000Z' }),
      achievement({ type: 'middle', unlocked: true, unlockedAt: '2026-08-05T08:00:00.000Z' }),
    ]

    expect(recentUnlockedAchievements(rows, 2).map((row) => row.type)).toEqual(['newest', 'middle'])
  })

  it('groups legacy star and streak thresholds into evolving achievement series', () => {
    const rows = [
      achievement({ type: 'stars-10', category: 'stars', requiredValue: 10 }),
      achievement({ type: 'stars-50', category: 'stars', requiredValue: 50 }),
      achievement({ type: 'streak-3', category: 'habit', description: 'Học 3 ngày liên tiếp', requiredValue: 3 }),
      achievement({ type: 'streak-7', category: 'habit', description: 'Học 7 ngày liên tiếp', requiredValue: 7 }),
    ]

    expect(groupAchievementSeries(rows).map((series) => ({
      key: series.key,
      thresholds: series.items.map((item) => item.requiredValue),
    }))).toEqual([
      { key: 'stars', thresholds: [10, 50] },
      { key: 'streak', thresholds: [3, 7] },
    ])
  })
})
