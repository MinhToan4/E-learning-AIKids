import { describe, expect, it } from 'vitest'
import {
  isPathwayCourseVisible,
  isAikiRuleCourse,
  isCourseRuleCompleted,
  applyGatekeeperRules,
  applySequentialQuestRules,
  getAikiCourseSortOrder,
  sortAikiCourses,
  formatCourseTitle,
  getIslandBadge,
  AIKI_ISLAND_BADGES,
  WORLD_REGIONS,
  FORCE_UNLOCK_ALL_ISLANDS,
  type PathwayCourse,
  mergeQuestsWithLocalProgress,
  enrichCoursesWithLocalProgress,
  getStationSlug,
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

describe('Gatekeeper Island (Đảo Quy Tắc Vàng AIKI & Khóa Tuần Tự)', () => {
  it('exports FORCE_UNLOCK_ALL_ISLANDS set to false by default', () => {
    expect(FORCE_UNLOCK_ALL_ISLANDS).toBe(false)
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

  it('unlocks all islands when force unlock is true', () => {
    const courses: PathwayCourse[] = [
      course({ id: 'aiki-rules', title: 'Quy tắc vàng AIKI', status: 'locked', questCount: 5, completedCount: 2 }),
      course({ id: 'course-story', title: 'Đảo kể chuyện', status: 'locked' }),
      course({ id: 'course-mountain', title: 'Dãy núi sáng tạo', status: 'locked' }),
    ]

    const result = applyGatekeeperRules(courses, true)

    // Gatekeeper island must be open, never locked
    expect(result[0].isGatekeeper).toBe(true)
    expect(result[0].status).toBe('available')

    // All other islands must be unlocked when force unlock is active
    expect(result[1].status).toBe('available')
    expect(result[1].reasonCode).toBe('requirements_met')
    expect(result[1].lockMessage).toBeUndefined()

    expect(result[2].status).toBe('available')
    expect(result[2].reasonCode).toBe('requirements_met')
    expect(result[2].lockMessage).toBeUndefined()
  })

  it('keeps gatekeeper island open and locks subsequent islands when previous is incomplete', () => {
    const courses: PathwayCourse[] = [
      course({ id: 'aiki-rules', title: 'Quy tắc vàng AIKI', status: 'locked', questCount: 5, completedCount: 2 }),
      course({ id: 'course-story', title: 'Đảo kể chuyện', status: 'available' }),
      course({ id: 'course-mountain', title: 'Dãy núi sáng tạo', status: 'available' }),
    ]

    const result = applyGatekeeperRules(courses, false)

    // Gatekeeper island must be open, never locked
    expect(result[0].isGatekeeper).toBe(true)
    expect(result[0].status).toBe('available')

    // Island 2 is locked because Island 1 is incomplete
    expect(result[1].status).toBe('locked')
    expect(result[1].reasonCode).toBe('previous_island_incomplete')
    expect(result[1].lockMessage).toContain('Bé hãy hoàn thành')

    // Island 3 is locked because Island 2 is incomplete
    expect(result[2].status).toBe('locked')
    expect(result[2].reasonCode).toBe('previous_island_incomplete')
    expect(result[2].lockMessage).toContain('Bé hãy hoàn thành')
  })

  it('unlocks islands sequentially (Island 2 unlocked when Island 1 completed, Island 3 still locked until Island 2 completed)', () => {
    const courses: PathwayCourse[] = [
      course({ id: 'aiki-rules', title: 'Quy tắc vàng AIKI', status: 'completed', questCount: 5, completedCount: 5 }),
      course({ id: 'course-story', title: 'Đảo kể chuyện', status: 'locked', questCount: 4, completedCount: 1 }),
      course({ id: 'course-mountain', title: 'Dãy núi sáng tạo', status: 'locked' }),
    ]

    const result = applyGatekeeperRules(courses, false)

    expect(result[0].isGatekeeper).toBe(true)
    expect(result[0].status).toBe('completed')

    // Island 2 is unlocked because Island 1 is completed
    expect(result[1].status).toBe('available')
    expect(result[1].reasonCode).toBe('requirements_met')
    expect(result[1].lockMessage).toBeUndefined()

    // Island 3 remains locked because Island 2 is incomplete (completedCount 1 < questCount 4)
    expect(result[2].status).toBe('locked')
    expect(result[2].reasonCode).toBe('previous_island_incomplete')
    expect(result[2].lockMessage).toContain('Bé hãy hoàn thành')
  })
})

describe('Sequential Quest Rules (Khóa tuần tự các Trạm học)', () => {
  it('opens first quest (index 0) and locks subsequent quests if previous is not completed', () => {
    const rawQuests = [
      { id: 'q1', order: 1, title: 'Trạm 1', status: 'available' as const, stars: 0, score: 0 },
      { id: 'q2', order: 2, title: 'Trạm 2', status: 'available' as const, stars: 0, score: 0 },
      { id: 'q3', order: 3, title: 'Trạm 3', status: 'available' as const, stars: 0, score: 0 },
    ]
    const quests = applySequentialQuestRules(rawQuests, false)
    expect(quests[0].status).toBe('available')
    expect(quests[1].status).toBe('locked')
    expect(quests[2].status).toBe('locked')
  })

  it('unlocks quest i when quest i-1 is completed', () => {
    const rawQuests = [
      { id: 'q1', order: 1, title: 'Trạm 1', status: 'completed' as const, stars: 3, score: 100 },
      { id: 'q2', order: 2, title: 'Trạm 2', status: 'locked' as const, stars: 0, score: 0 },
      { id: 'q3', order: 3, title: 'Trạm 3', status: 'locked' as const, stars: 0, score: 0 },
    ]
    const quests = applySequentialQuestRules(rawQuests, false)
    expect(quests[0].status).toBe('completed')
    expect(quests[1].status).toBe('available')
    expect(quests[2].status).toBe('locked')
  })

  it('unlocks all quests when forceUnlockOverride is true', () => {
    const rawQuests = [
      { id: 'q1', order: 1, title: 'Trạm 1', status: 'locked' as const, stars: 0, score: 0 },
      { id: 'q2', order: 2, title: 'Trạm 2', status: 'locked' as const, stars: 0, score: 0 },
    ]
    const quests = applySequentialQuestRules(rawQuests, true)
    expect(quests[0].status).toBe('available')
    expect(quests[1].status).toBe('available')
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

describe('Island Badges & Title Formatting (ĐẢO TIÊN QUYẾT -> ĐẢO TRÒ CHƠI, bỏ tiền tố Module)', () => {
  it('formats course titles by stripping Module 0..5 prefixes and keeping course name', () => {
    expect(formatCourseTitle('Module 0 — Mười quy tắc của Xưởng sáng tạo')).toBe('Mười quy tắc của Xưởng sáng tạo')
    expect(formatCourseTitle('Module 1 — Nhà thám hiểm AI')).toBe('Nhà thám hiểm AI')
    expect(formatCourseTitle('Module 2 — Tớ là hoạ sĩ AI!')).toBe('Tớ là hoạ sĩ AI!')
    expect(formatCourseTitle('Module 3 — Biệt đội nhân vật AI')).toBe('Biệt đội nhân vật AI')
    expect(formatCourseTitle('Module 4 — Vương quốc truyện tranh AI')).toBe('Vương quốc truyện tranh AI')
    expect(formatCourseTitle('Module 5 — Nhà phát minh trò chơi AI')).toBe('Nhà phát minh trò chơi AI')
    expect(formatCourseTitle('Module 1: Nhà thám hiểm AI')).toBe('Nhà thám hiểm AI')
    expect(formatCourseTitle('Đảo 1: Nhà thám hiểm AI')).toBe('Nhà thám hiểm AI')
  })

  it('provides correct island badge names matching Module 0 -> 5', () => {
    expect(AIKI_ISLAND_BADGES).toEqual([
      'ĐẢO TIÊN QUYẾT',
      'ĐẢO KHÁM PHÁ',
      'ĐẢO HOẠ SĨ',
      'ĐẢO NHÂN VẬT',
      'ĐẢO TRUYỆN TRANH',
      'ĐẢO TRÒ CHƠI',
    ])

    expect(getIslandBadge({ id: 'aiki-rules', title: 'Mười quy tắc của Xưởng sáng tạo' }, 0)).toBe('ĐẢO TIÊN QUYẾT')
    expect(getIslandBadge({ id: 'dao-1-tham-hiem', title: 'Nhà thám hiểm AI' }, 1)).toBe('ĐẢO KHÁM PHÁ')
    expect(getIslandBadge({ id: 'dao-2-hoa-si', title: 'Tớ là hoạ sĩ AI!' }, 2)).toBe('ĐẢO HOẠ SĨ')
    expect(getIslandBadge({ id: 'dao-3-nhan-vat', title: 'Biệt đội nhân vật AI' }, 3)).toBe('ĐẢO NHÂN VẬT')
    expect(getIslandBadge({ id: 'dao-4-truyen-tranh', title: 'Vương quốc truyện tranh AI' }, 4)).toBe('ĐẢO TRUYỆN TRANH')
    expect(getIslandBadge({ id: 'dao-5-tro-choi', title: 'Nhà phát minh trò chơi AI' }, 5)).toBe('ĐẢO TRÒ CHƠI')
  })

  it('WORLD_REGIONS names match the new island naming schema', () => {
    expect(WORLD_REGIONS.map((r) => r.name)).toEqual([
      'Đảo Tiên Quyết',
      'Đảo Khám Phá',
      'Đảo Hoạ Sĩ',
      'Đảo Nhân Vật',
      'Đảo Truyện Tranh',
      'Đảo Trò Chơi',
    ])
  })
})

describe('WorldPage module cache management', () => {
  it('exports clearWorldPageCache function to clear cached pathway and progress', async () => {
    const { clearWorldPageCache } = await import('./WorldPage')
    expect(typeof clearWorldPageCache).toBe('function')
    expect(() => clearWorldPageCache()).not.toThrow()
  })
})

describe('Clean Slug Resolution and findCourseByIdentifier', () => {
  it('resolves island clean slugs and aliases correctly', async () => {
    const { findCourseByIdentifier, AIKID_CANONICAL_SLUGS, ISLAND_ALIAS_MAP } = await import('./WorldPage')

    expect(AIKID_CANONICAL_SLUGS).toHaveLength(6)
    expect(AIKID_CANONICAL_SLUGS[0]).toBe('muoi-quy-tac-xuong-sang-tao')
    expect(AIKID_CANONICAL_SLUGS[1]).toBe('dao-1-nha-tham-hiem-ai')

    expect(ISLAND_ALIAS_MAP['dao-1']).toBe('muoi-quy-tac-xuong-sang-tao')
    expect(ISLAND_ALIAS_MAP['dao-2']).toBe('dao-1-nha-tham-hiem-ai')
    expect(ISLAND_ALIAS_MAP['dao-3']).toBe('dao-2-hoa-si-ai')
    expect(ISLAND_ALIAS_MAP['dao-4']).toBe('dao-3-biet-doi-nhan-vat-ai')
    expect(ISLAND_ALIAS_MAP['dao-5']).toBe('dao-4-vuong-quoc-truyen-tranh-ai')
    expect(ISLAND_ALIAS_MAP['dao-6']).toBe('dao-5-nha-phat-minh-tro-choi-ai')
    expect(ISLAND_ALIAS_MAP['aiki-rules']).toBe('muoi-quy-tac-xuong-sang-tao')

    const sampleCourses: PathwayCourse[] = [
      course({ id: 'uuid-0', title: 'Module 0 — Mười quy tắc của Xưởng sáng tạo', slug: 'muoi-quy-tac-xuong-sang-tao' }),
      course({ id: 'uuid-1', title: 'Module 1 — Nhà thám hiểm AI', slug: 'dao-1-nha-tham-hiem-ai' }),
      course({ id: 'uuid-2', title: 'Module 2 — Tớ là hoạ sĩ AI!', slug: 'dao-2-hoa-si-ai' }),
      course({ id: 'uuid-3', title: 'Module 3 — Biệt đội nhân vật AI', slug: 'dao-3-biet-doi-nhan-vat-ai' }),
      course({ id: 'uuid-4', title: 'Module 4 — Vương quốc truyện tranh AI', slug: 'dao-4-vuong-quoc-truyen-tranh-ai' }),
      course({ id: 'uuid-5', title: 'Module 5 — Nhà phát minh trò chơi AI', slug: 'dao-5-nha-phat-minh-tro-choi-ai' }),
    ]

    // Match by dao-1 alias
    expect(findCourseByIdentifier(sampleCourses, 'dao-1')?.id).toBe('uuid-0')
    expect(findCourseByIdentifier(sampleCourses, 'dao-2')?.id).toBe('uuid-1')
    expect(findCourseByIdentifier(sampleCourses, 'dao-3')?.id).toBe('uuid-2')
    expect(findCourseByIdentifier(sampleCourses, 'dao-4')?.id).toBe('uuid-3')
    expect(findCourseByIdentifier(sampleCourses, 'dao-5')?.id).toBe('uuid-4')
    expect(findCourseByIdentifier(sampleCourses, 'dao-6')?.id).toBe('uuid-5')

    // Match by canonical slug
    expect(findCourseByIdentifier(sampleCourses, 'muoi-quy-tac-xuong-sang-tao')?.id).toBe('uuid-0')
    expect(findCourseByIdentifier(sampleCourses, 'dao-1-nha-tham-hiem-ai')?.id).toBe('uuid-1')

    // Match by legacy aiki-rules alias
    expect(findCourseByIdentifier(sampleCourses, 'aiki-rules')?.id).toBe('uuid-0')

    // Match by direct UUID
    expect(findCourseByIdentifier(sampleCourses, 'uuid-2')?.id).toBe('uuid-2')
  })

  it('automatically assigns canonical slugs to courses in applyGatekeeperRules if missing', () => {
    const rawCourses: PathwayCourse[] = [
      course({ id: 'uuid-0', title: 'Module 0 — Mười quy tắc của Xưởng sáng tạo' }),
      course({ id: 'uuid-1', title: 'Module 1 — Nhà thám hiểm AI' }),
      course({ id: 'uuid-2', title: 'Module 2 — Tớ là hoạ sĩ AI!' }),
    ]

    const result = applyGatekeeperRules(rawCourses)
    expect(result[0].slug).toBe('muoi-quy-tac-xuong-sang-tao')
    expect(result[1].slug).toBe('dao-1-nha-tham-hiem-ai')
    expect(result[2].slug).toBe('dao-2-hoa-si-ai')
  })
})

describe('Merging Local Progress into World map quests and courses', () => {
  it('merges aikids_golden_rules_progress_v1 for rule course: Rule 1 completed unlocks Station 2 with 3 stars', () => {
    const rawQuests: Array<{
      id: string
      order: number
      title: string
      status: 'completed' | 'available' | 'locked' | 'in_progress'
      stars: number
      score: number
    }> = [
      { id: 'rule-1', order: 1, title: 'Quy tắc 1', status: 'available', stars: 0, score: 0 },
      { id: 'rule-2', order: 2, title: 'Quy tắc 2', status: 'locked', stars: 0, score: 0 },
      { id: 'rule-3', order: 3, title: 'Quy tắc 3', status: 'locked', stars: 0, score: 0 },
    ]

    const mockGoldenRules = {
      1: { status: 'completed', starsEarned: 3 },
    }

    const merged = mergeQuestsWithLocalProgress(rawQuests, true, {}, mockGoldenRules)
    const sequential = applySequentialQuestRules(merged, false)

    expect(sequential[0].status).toBe('completed')
    expect(sequential[0].stars).toBe(3)
    expect(sequential[1].status).toBe('available')
    expect(sequential[2].status).toBe('locked')

    const completedCount = sequential.filter((q) => q.status === 'completed').length
    const totalStars = sequential.reduce((sum, q) => sum + (q.stars || 0), 0)
    expect(completedCount).toBe(1)
    expect(totalStars).toBe(3)
  })

  it('merges aikids_completed_lessons by id or slug and unlocks next station', () => {
    const rawQuests: Array<{
      id: string
      slug: string
      order: number
      title: string
      status: 'completed' | 'available' | 'locked' | 'in_progress'
      stars: number
    }> = [
      { id: 'bai-1-1', slug: 'bai-1-1-meo-aiki', order: 1, title: 'Trạm 1: Mèo AIKI', status: 'available', stars: 0 },
      { id: 'bai-1-2', slug: 'bai-1-2-bon-chia-khoa', order: 2, title: 'Trạm 2: 4 Chìa Khóa', status: 'locked', stars: 0 },
    ]

    const mockCompleted = {
      'bai-1-1-meo-aiki': { stars: 3, xp: 100 },
    }

    const merged = mergeQuestsWithLocalProgress(rawQuests, false, mockCompleted, {})
    const sequential = applySequentialQuestRules(merged, false)

    expect(sequential[0].status).toBe('completed')
    expect(sequential[0].stars).toBe(3)
    expect(sequential[1].status).toBe('available')
  })

  it('enrichCoursesWithLocalProgress unlocks Island 2 when all 10 rules completed in local storage', () => {
    const courses: PathwayCourse[] = [
      course({ id: 'aiki-rules', title: 'Module 0 — Mười quy tắc', status: 'available', questCount: 10, completedCount: 0 }),
      course({ id: 'dao-1-tham-hiem', title: 'Module 1 — Nhà thám hiểm AI', status: 'locked' }),
    ]

    const mockGoldenRules: Record<number, { status: string; starsEarned: number }> = {}
    for (let i = 1; i <= 10; i++) {
      mockGoldenRules[i] = { status: 'completed', starsEarned: 3 }
    }

    const enriched = enrichCoursesWithLocalProgress(courses, {}, mockGoldenRules)
    const result = applyGatekeeperRules(enriched, false)

    expect(result[0].status).toBe('completed')
    expect(result[0].completedCount).toBe(10)
    expect(result[0].totalStars).toBe(30)
    // Island 2 must now be unlocked!
    expect(result[1].status).toBe('available')
  })

  it('generates friendly /rule-X links for all 10 Golden Rules stations even when DB supplies raw UUIDs (Kịch bản 2)', () => {
    const mockDbStations = [
      { id: 'c0363e77-2148-4373-b41a-0d0be4a4e4be', order: 1, title: 'QT1 — Hãy nghĩ ý tưởng' },
      { id: '11111111-2148-4373-b41a-0d0be4a4e4be', order: 2, title: 'QT2 — Tự viết nội dung' },
      { id: '22222222-2148-4373-b41a-0d0be4a4e4be', order: 3, title: 'QT3 — Có giá trị' },
      { id: '33333333-2148-4373-b41a-0d0be4a4e4be', order: 4, title: 'QT4 — Giải thích vì sao' },
      { id: '44444444-2148-4373-b41a-0d0be4a4e4be', order: 5, title: 'QT5 — Chia việc ra' },
      { id: '55555555-2148-4373-b41a-0d0be4a4e4be', order: 6, title: 'QT6 — Bảo vệ hình ảnh' },
      { id: '66666666-2148-4373-b41a-0d0be4a4e4be', order: 7, title: 'QT7 — Tôn trọng sự thật' },
      { id: '77777777-2148-4373-b41a-0d0be4a4e4be', order: 8, title: 'QT8 — Sửa mô tả' },
      { id: '88888888-2148-4373-b41a-0d0be4a4e4be', order: 9, title: 'QT9 — Kiểm tra kỹ' },
      { id: '99999999-2148-4373-b41a-0d0be4a4e4be', order: 10, title: 'QT10 — Bài tập ở trường' },
    ]

    const slugs = mockDbStations.map((station) => getStationSlug(station, true))
    expect(slugs).toEqual([
      'rule-1',
      'rule-2',
      'rule-3',
      'rule-4',
      'rule-5',
      'rule-6',
      'rule-7',
      'rule-8',
      'rule-9',
      'rule-10',
    ])

    // TUYỆT ĐỐI KHÔNG xuất hiện chuỗi UUID thô
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    slugs.forEach((slug) => {
      expect(uuidRegex.test(slug)).toBe(false)
      expect(slug).toMatch(/^rule-[1-9]|rule-10$/)
    })
  })
})
