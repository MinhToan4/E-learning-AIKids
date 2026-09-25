import { describe, expect, it } from 'vitest'
import type { LearningPathway } from '@/shared/lib/learning-api'
import { rulesProgressFromPathway } from './useRulesProgress'

function pathway(): LearningPathway {
  return {
    student: { nickname: 'Bo', ageBand: '8-11' },
    policy: null,
    recommendedCourseId: 'rules-course',
    courses: [{
      id: 'rules-course', title: 'Module 0 — Mười quy tắc của Xưởng sáng tạo',
      shortTitle: '10 Quy tắc vàng', status: 'active', reasonCode: 'enrolled',
      completionPercent: 10, missingPrerequisites: [], coverImage: null,
      enrolled: true, enrollmentId: 'enrollment-1', totalStars: 2,
      stations: [
        { id: 'lesson-1', slug: 'rule-1', order: 1, title: 'Quy tắc 1', skill: '', reward: '', duration: '', hook: '', accent: '', practiceKind: 'chips', status: 'completed', phase: 'check', stars: 2, xpEarned: 50 },
        { id: 'lesson-2', slug: 'rule-2', order: 2, title: 'Quy tắc 2', skill: '', reward: '', duration: '', hook: '', accent: '', practiceKind: 'chips', status: 'locked', phase: 'learn', stars: 0, xpEarned: 0 },
      ],
    }],
  }
}

describe('rulesProgressFromPathway', () => {
  it('uses the server pathway for stars, XP and completion', () => {
    const progress = rulesProgressFromPathway(pathway())
    expect(progress.rules[1]).toMatchObject({ status: 'completed', starsEarned: 2 })
    expect(progress.rules[2].status).toBe('available')
    expect(progress.totalStars).toBe(2)
    expect(progress.totalXp).toBe(50)
    expect(progress.unlockedPosters).toEqual([1])
  })

  it('fails closed when the rules course is absent', () => {
    const input = pathway()
    input.courses = []
    const progress = rulesProgressFromPathway(input)
    expect(progress.totalStars).toBe(0)
    expect(progress.rules[1].status).toBe('available')
    expect(progress.rules[2].status).toBe('locked')
  })
})
