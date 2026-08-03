import { describe, expect, it } from 'vitest'
import type { AchievementRow } from '@/shared/lib/api'
import { displayableAchievements } from './achievement-inventory'

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
})
