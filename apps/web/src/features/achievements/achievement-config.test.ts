import { describe, expect, it } from 'vitest'
import { achievementEvolutionTier, resolveAchievementMetric } from './achievement-config'

describe('shared achievement configuration', () => {
  it('uses one evolution ladder for every achievement series', () => {
    expect([0, 1, 2, 3, 4].map((index) => achievementEvolutionTier(index).label))
      .toEqual(['Mầm xanh', 'Đồng hành', 'Bạc sáng', 'Vàng rực', 'Pha lê'])
  })

  it('maps legacy achievement keys to selectable metrics', () => {
    expect(resolveAchievementMetric('achievement.perfect-lessons')).toBe('perfect_lessons')
    expect(resolveAchievementMetric('achievement.code-projects')).toBe('code_projects_created')
    expect(resolveAchievementMetric('unknown-runtime-key')).toBe('lessons_completed')
  })
})
