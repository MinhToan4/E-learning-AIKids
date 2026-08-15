import { describe, expect, it } from 'vitest'
import type { AchievementRow } from '@/shared/lib/api'
import { meePersonalRecordAsset } from './mee-record-assets'

function record(type: string): AchievementRow {
  return {
    type,
    title: type,
    description: type,
    icon: '',
    requiredValue: 1,
    unlocked: true,
    unlockedAt: null,
  }
}

describe('Mee personal-record artwork', () => {
  it.each([
    ['streak', 'mee-record-streak'],
    ['xp', 'mee-record-xp'],
    ['perfect_lessons', 'mee-record-perfect'],
    ['level', 'mee-record-level'],
    ['lessons_completed', 'mee-record-lessons'],
    ['courses_completed', 'mee-record-courses'],
    ['stars', 'mee-record-stars'],
    ['creative_projects', 'mee-record-creative'],
    ['collaboration', 'mee-record-collaboration'],
    ['quests_completed', 'mee-record-quests'],
  ])('maps %s to its own artwork', (type, fileName) => {
    expect(meePersonalRecordAsset(record(type))).toContain(fileName)
  })
})
