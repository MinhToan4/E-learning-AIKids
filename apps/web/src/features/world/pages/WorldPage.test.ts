import { describe, expect, it } from 'vitest'
import {
  isPathwayCourseVisible,
  isAikiRuleCourse,
  isCourseRuleCompleted,
  applyGatekeeperRules,
  getAikiCourseSortOrder,
  sortAikiCourses,
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

describe('Multi-tier World & Program Source mapping', () => {
  it('correctly filters courses by programSource', () => {
    const courses: PathwayCourse[] = [
      course({ id: 'aiki-rules', programSource: 'aikid_official' }),
      course({ id: 'course-school', programSource: 'workspace' }),
      course({ id: 'course-free', programSource: 'creator_marketplace' }),
    ]

    const aikidCourses = courses.filter((c) => (c.programSource ?? 'aikid_official') === 'aikid_official')
    expect(aikidCourses).toHaveLength(1)
    expect(aikidCourses[0].id).toBe('aiki-rules')

    const workspaceCourses = courses.filter((c) => c.programSource === 'workspace')
    expect(workspaceCourses).toHaveLength(1)
    expect(workspaceCourses[0].id).toBe('course-school')

    const freeCourses = courses.filter((c) => c.programSource === 'creator_marketplace')
    expect(freeCourses).toHaveLength(1)
    expect(freeCourses[0].id).toBe('course-free')
  })
})

describe('AI Kids Learning Roadmap Order (Module 0 / Quy tắc đầu tiên > M1 -> M5)', () => {
  it('assigns correct order values: Rule = 0, M1 = 1, M2 = 2, M3 = 3, M4 = 4, M5 = 5', () => {
    expect(getAikiCourseSortOrder({ id: 'aiki-rules', title: 'Module 0 — Mười quy tắc của Xưởng sáng tạo' })).toBe(0)
    expect(getAikiCourseSortOrder({ id: 'rule-gold', title: 'Quy tắc vàng AIKI' })).toBe(0)
    expect(getAikiCourseSortOrder({ id: 'dao-1-nha-tham-hiem-ai', title: 'Module 1 — Nhà thám hiểm AI' })).toBe(1)
    expect(getAikiCourseSortOrder({ id: 'dao-2-hoa-si-ai', title: 'Module 2 — Tớ là hoạ sĩ AI!' })).toBe(2)
    expect(getAikiCourseSortOrder({ id: 'dao-3-biet-doi-nhan-vat-ai', title: 'Module 3 — Biệt đội nhân vật AI' })).toBe(3)
    expect(getAikiCourseSortOrder({ id: 'dao-4-vuong-quoc-truyen-tranh-ai', title: 'Module 4 — Vương quốc truyện tranh AI' })).toBe(4)
    expect(getAikiCourseSortOrder({ id: 'dao-5-nha-phat-minh-tro-choi-ai', title: 'Module 5 — Nhà phát minh trò chơi AI' })).toBe(5)
  })

  it('sorts inverted course list [M5, M4, M3, M2, M1, M0] in correct ascending order: Rule -> M1 -> M5', () => {
    const reversedCourses: PathwayCourse[] = [
      course({ id: 'dao-5-tro-choi', title: 'Module 5 — Nhà phát minh trò chơi AI' }),
      course({ id: 'dao-4-truyen-tranh', title: 'Module 4 — Vương quốc truyện tranh AI' }),
      course({ id: 'dao-3-nhan-vat', title: 'Module 3 — Biệt đội nhân vật AI' }),
      course({ id: 'dao-2-hoa-si', title: 'Module 2 — Tớ là hoạ sĩ AI!' }),
      course({ id: 'dao-1-tham-hiem', title: 'Module 1 — Nhà thám hiểm AI' }),
      course({ id: 'aiki-rules', title: 'Module 0 — Mười quy tắc của Xưởng sáng tạo' }),
    ]

    const sorted = sortAikiCourses(reversedCourses)

    expect(sorted.map((c) => c.title)).toEqual([
      'Module 0 — Mười quy tắc của Xưởng sáng tạo',
      'Module 1 — Nhà thám hiểm AI',
      'Module 2 — Tớ là hoạ sĩ AI!',
      'Module 3 — Biệt đội nhân vật AI',
      'Module 4 — Vương quốc truyện tranh AI',
      'Module 5 — Nhà phát minh trò chơi AI',
    ])
  })

  it('applyGatekeeperRules ensures Gatekeeper Island (Quy tắc) is always first and islands are ordered M0 -> M5', () => {
    const reversedCourses: PathwayCourse[] = [
      course({ id: 'dao-5-tro-choi', title: 'Module 5 — Nhà phát minh trò chơi AI', status: 'locked' }),
      course({ id: 'dao-4-truyen-tranh', title: 'Module 4 — Vương quốc truyện tranh AI', status: 'locked' }),
      course({ id: 'dao-3-nhan-vat', title: 'Module 3 — Biệt đội nhân vật AI', status: 'locked' }),
      course({ id: 'dao-2-hoa-si', title: 'Module 2 — Tớ là hoạ sĩ AI!', status: 'locked' }),
      course({ id: 'dao-1-tham-hiem', title: 'Module 1 — Nhà thám hiểm AI', status: 'locked' }),
      course({ id: 'aiki-rules', title: 'Module 0 — Mười quy tắc của Xưởng sáng tạo', status: 'locked' }),
    ]

    const processed = applyGatekeeperRules(reversedCourses)

    // First item must be Module 0 Gatekeeper
    expect(processed[0].id).toBe('aiki-rules')
    expect(processed[0].isGatekeeper).toBe(true)
    expect(processed[0].status).toBe('available')

    // Subsequent items must follow M1 -> M5
    expect(processed[1].id).toBe('dao-1-tham-hiem')
    expect(processed[2].id).toBe('dao-2-hoa-si')
    expect(processed[3].id).toBe('dao-3-nhan-vat')
    expect(processed[4].id).toBe('dao-4-truyen-tranh')
    expect(processed[5].id).toBe('dao-5-tro-choi')
  })
})


