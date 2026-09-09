import { describe, expect, it } from 'vitest'
import {
  isPathwayCourseVisible,
  isAikiRuleCourse,
  isCourseRuleCompleted,
  applyGatekeeperRules,
  FORCE_UNLOCK_ALL_ISLANDS,
  type PathwayCourse,
} from './WorldPage'

type PathwayCourseInput = Parameters<typeof isPathwayCourseVisible>[0]

function course(
  overrides: Partial<PathwayCourseInput>,
): PathwayCourse {
  return {
    id: 'course-1',
    title: 'AI cơ bản',
    shortTitle: 'Khởi đầu',
    status: 'available',
    reasonCode: 'requirements_met',
    completionPercent: 0,
    missingPrerequisites: [],
    coverImage: null,
    enrolled: false,
    ...overrides,
  }
}

describe('World pathway enrollment visibility', () => {
  it('uses canonical enrollment and keeps active/completed legacy pathway rows visible', () => {
    expect(isPathwayCourseVisible(course({ enrolled: true }))).toBe(true)
    expect(isPathwayCourseVisible(course({ status: 'active' }))).toBe(true)
    expect(isPathwayCourseVisible(course({ status: 'completed' }))).toBe(true)
    expect(isPathwayCourseVisible(course({ status: 'available' }))).toBe(true)
    expect(isPathwayCourseVisible(course({ status: 'locked' }))).toBe(true)
  })
})

describe('Gatekeeper Island (Đảo Quy Tắc Vàng AIKI)', () => {
  it('exports FORCE_UNLOCK_ALL_ISLANDS set to true for testing', () => {
    expect(FORCE_UNLOCK_ALL_ISLANDS).toBe(true)
  })

  it('identifies rule island by id, prefix, or title', () => {
    expect(isAikiRuleCourse({ id: 'aiki-rules', title: 'Khóa học bất kỳ' })).toBe(true)
    expect(isAikiRuleCourse({ id: 'rule-1', title: 'Khóa học 1' })).toBe(true)
    expect(isAikiRuleCourse({ id: 'c-1', title: 'Mười quy tắc vàng AIKI' })).toBe(true)
    expect(isAikiRuleCourse({ id: 'c-0', title: 'Module 0: Nhập môn' })).toBe(true)
    expect(isAikiRuleCourse({ id: 'c-random', title: 'Sáng tạo truyện tranh' }, 0)).toBe(false)
    expect(isAikiRuleCourse({ id: 'c-random', title: 'Sáng tạo truyện tranh' }, 1)).toBe(false)
  })

  it('determines completion based on status or quest count', () => {
    expect(isCourseRuleCompleted(course({ status: 'completed' }))).toBe(true)
    expect(isCourseRuleCompleted(course({ status: 'active', questCount: 5, completedCount: 5 }))).toBe(true)
    expect(isCourseRuleCompleted(course({ status: 'active', questCount: 5, completedCount: 4 }))).toBe(false)
    expect(isCourseRuleCompleted(course({ status: 'available', questCount: 5, completedCount: 0 }))).toBe(false)
  })

  it('unlocks all islands for boss testing when FORCE_UNLOCK_ALL_ISLANDS is true', () => {
    const courses: PathwayCourse[] = [
      course({ id: 'aiki-rules', title: 'Quy tắc vàng AIKI', status: 'locked', questCount: 5, completedCount: 2 }),
      course({ id: 'course-story', title: 'Đảo kể chuyện', status: 'locked' }),
      course({ id: 'course-mountain', title: 'Dãy núi sáng tạo', status: 'locked' }),
    ]

    const result = applyGatekeeperRules(courses)

    // Gatekeeper island must be open, never locked
    expect(result[0].isGatekeeper).toBe(true)
    expect(result[0].status).toBe('available')

    // All other islands must be unlocked for testing
    expect(result[1].status).toBe('available')
    expect(result[1].reasonCode).toBe('requirements_met')
    expect(result[1].lockMessage).toBeUndefined()

    expect(result[2].status).toBe('available')
    expect(result[2].reasonCode).toBe('requirements_met')
    expect(result[2].lockMessage).toBeUndefined()
  })

  it('keeps gatekeeper island open and locks all other islands when force unlock is disabled and gatekeeper is incomplete', () => {
    const courses: PathwayCourse[] = [
      course({ id: 'aiki-rules', title: 'Quy tắc vàng AIKI', status: 'locked', questCount: 5, completedCount: 2 }),
      course({ id: 'course-story', title: 'Đảo kể chuyện', status: 'available' }),
      course({ id: 'course-mountain', title: 'Dãy núi sáng tạo', status: 'available' }),
    ]

    const result = applyGatekeeperRules(courses, false)

    // Gatekeeper island must be open, never locked
    expect(result[0].isGatekeeper).toBe(true)
    expect(result[0].status).toBe('available')

    // All other islands must be locked with friendly message
    expect(result[1].status).toBe('locked')
    expect(result[1].reasonCode).toBe('gatekeeper_rule_incomplete')
    expect(result[1].lockMessage).toContain('Bé hãy hoàn thành Đảo Quy Tắc Vàng AIKI trước')

    expect(result[2].status).toBe('locked')
    expect(result[2].reasonCode).toBe('gatekeeper_rule_incomplete')
    expect(result[2].lockMessage).toContain('Bé hãy hoàn thành Đảo Quy Tắc Vàng AIKI trước')
  })

  it('unlocks all other islands simultaneously (parallel) once gatekeeper island is completed', () => {
    const courses: PathwayCourse[] = [
      course({ id: 'aiki-rules', title: 'Quy tắc vàng AIKI', status: 'completed', questCount: 5, completedCount: 5 }),
      course({ id: 'course-story', title: 'Đảo kể chuyện', status: 'locked' }),
      course({ id: 'course-mountain', title: 'Dãy núi sáng tạo', status: 'locked' }),
    ]

    const result = applyGatekeeperRules(courses)

    expect(result[0].isGatekeeper).toBe(true)
    expect(result[0].status).toBe('completed')

    // Both other islands are unlocked in parallel
    expect(result[1].status).toBe('available')
    expect(result[1].reasonCode).toBe('requirements_met')
    expect(result[1].lockMessage).toBeUndefined()

    expect(result[2].status).toBe('available')
    expect(result[2].reasonCode).toBe('requirements_met')
    expect(result[2].lockMessage).toBeUndefined()
  })
})
