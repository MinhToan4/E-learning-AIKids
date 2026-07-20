import { describe, expect, it } from 'vitest'
import { achievementsToUnlock, ACHIEVEMENT_CATALOG } from './achievements.js'

describe('achievementsToUnlock', () => {
  it('unlocks first_quest and star_10 on progress', () => {
    const types = achievementsToUnlock({
      completedQuests: 1,
      totalStars: 12,
      streakCurrent: 0,
      coursesCompleted: 0,
      projectCount: 0,
      alreadyUnlocked: [],
    })
    expect(types).toContain('first_quest')
    expect(types).toContain('star_10')
    expect(types).not.toContain('star_50')
  })

  it('skips already unlocked types', () => {
    const types = achievementsToUnlock({
      completedQuests: 5,
      totalStars: 60,
      streakCurrent: 7,
      coursesCompleted: 1,
      projectCount: 2,
      alreadyUnlocked: new Set(['first_quest', 'star_10']),
    })
    expect(types).not.toContain('first_quest')
    expect(types).not.toContain('star_10')
    expect(types).toContain('star_50')
    expect(types).toContain('streak_7')
    expect(types).toContain('course_complete')
    expect(types).toContain('project_first')
  })

  it('catalog covers all unlock types', () => {
    const types = ACHIEVEMENT_CATALOG.map((a) => a.type)
    expect(types).toContain('first_quest')
    expect(types).toContain('project_first')
  })
})
