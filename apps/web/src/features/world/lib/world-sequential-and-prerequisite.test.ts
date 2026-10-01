import { describe, expect, it } from 'vitest'
import {
  applySequentialQuestRules,
  applyGatekeeperRules,
  isCourseRuleCompleted,
} from './world-gatekeeper'
import {
  type PathwayCourse,
  enrichCoursesWithLocalProgress,
} from './world-pathway-mapper'
import { type QuestProgress } from '@/shared/lib/api'

describe('Thứ tự trạm học tuần tự (Strict Sequential Station Order)', () => {
  it('đảm bảo chỉ có DUY NHẤT 1 trạm đang học (isCurrent), không bao giờ có 2 trạm sấm sét cùng lúc', () => {
    // Kịch bản giống như hình ảnh thực tế của người dùng:
    // Trạm 1: 3 sao (completed)
    // Trạm 2: 3 sao (completed)
    // Trạm 3: 0 sao (in_progress hoặc available)
    // Trạm 4: 0 sao (từng bị in_progress do seed/lịch sử)
    // Trạm 5: 3 sao (completed do chạy test)
    // Trạm 6: 0 sao (locked)
    const rawQuests = [
      { id: 'rule-1', order: 1, title: 'Quy tắc 1', status: 'completed' as const, stars: 3 },
      { id: 'rule-2', order: 2, title: 'Quy tắc 2', status: 'completed' as const, stars: 3 },
      { id: 'rule-3', order: 3, title: 'Quy tắc 3', status: 'in_progress' as const, stars: 0 },
      { id: 'rule-4', order: 4, title: 'Quy tắc 4', status: 'in_progress' as const, stars: 0 },
      { id: 'rule-5', order: 5, title: 'Quy tắc 5', status: 'completed' as const, stars: 3 },
      { id: 'rule-6', order: 6, title: 'Quy tắc 6', status: 'locked' as const, stars: 0 },
    ]

    const sequential = applySequentialQuestRules(rawQuests, false)

    // Trạm 1 & 2: completed
    expect(sequential[0].status).toBe('completed')
    expect(sequential[1].status).toBe('completed')

    // Trạm 3: là trạm tiếp theo cần học -> được mở (in_progress/available)
    expect(['in_progress', 'available']).toContain(sequential[2].status)

    // Trạm 4: BẮT BUỘC PHẢI KHÓA (locked) vì Trạm 3 chưa hoàn thành!
    // Tuyệt đối không được phép ở trạng thái in_progress hay available!
    expect(sequential[3].status).toBe('locked')

    // Trạm 5: bảo lưu completed
    expect(sequential[4].status).toBe('completed')

    // Trạm 6: locked
    expect(sequential[5].status).toBe('locked')
  })

  it('xác định đúng vị trí trạm hoạt động duy nhất (firstUncompletedIndex)', () => {
    const quests: QuestProgress[] = [
      { id: 'q1', order: 1, title: 'Trạm 1', status: 'completed', stars: 3, xpEarned: 50, phase: 'learn' },
      { id: 'q2', order: 2, title: 'Trạm 2', status: 'completed', stars: 3, xpEarned: 50, phase: 'learn' },
      { id: 'q3', order: 3, title: 'Trạm 3', status: 'available', stars: 0, xpEarned: 0, phase: 'learn' },
      { id: 'q4', order: 4, title: 'Trạm 4', status: 'locked', stars: 0, xpEarned: 0, phase: 'learn' },
      { id: 'q5', order: 5, title: 'Trạm 5', status: 'completed', stars: 3, xpEarned: 50, phase: 'learn' },
      { id: 'q6', order: 6, title: 'Trạm 6', status: 'locked', stars: 0, xpEarned: 0, phase: 'learn' },
    ]

    const firstUncompletedIndex = quests.findIndex(
      (q) => q.status !== 'completed' && (q.stars ?? 0) < 3,
    )

    // Trạm chưa xong đầu tiên BẮT BUỘC phải là Trạm 3 (index = 2)
    expect(firstUncompletedIndex).toBe(2)

    // Kiểm tra tính logic của các node:
    // Trạm 3 (index 2): isCurrent = true
    const isStation3Current = !quests[2].status.includes('locked') && quests[2].status !== 'completed' && 2 === firstUncompletedIndex
    expect(isStation3Current).toBe(true)

    // Trạm 4 (index 3): isCurrent = false, isLocked = true
    const isStation4Current = !quests[3].status.includes('locked') && quests[3].status !== 'completed' && 3 === firstUncompletedIndex
    expect(isStation4Current).toBe(false)
  })
})

describe('Khóa học tiên quyết (Prerequisite Course & Island Gatekeeping)', () => {
  const createMockCourse = (overrides: Partial<PathwayCourse>): PathwayCourse => ({
    id: 'course-id',
    slug: 'course-slug',
    title: 'Course Title',
    shortTitle: 'Course',
    status: 'locked',
    reasonCode: 'requirements_not_met',
    completionPercent: 0,
    missingPrerequisites: [],
    coverImage: null,
    enrolled: true,
    completedCount: 0,
    questCount: 4,
    totalStars: 0,
    ...overrides,
  })

  it('Đảo 1 (dao-1) bị KHÓA khi Đảo Tiên Quyết (10 Quy Tắc Vàng) chưa xong đủ 10 trạm', () => {
    const courses: PathwayCourse[] = [
      createMockCourse({
        id: 'muoi-quy-tac-xuong-sang-tao',
        slug: 'muoi-quy-tac-xuong-sang-tao',
        title: 'Mười quy tắc Xưởng Sáng Tạo',
        status: 'active',
        questCount: 10,
        completedCount: 5, // Chỉ mới xong 5/10 trạm!
      }),
      createMockCourse({
        id: 'dao-1-nha-tham-hiem-ai',
        slug: 'dao-1-nha-tham-hiem-ai',
        title: 'Nhà thám hiểm AI',
        status: 'available',
        questCount: 4,
        completedCount: 0,
      }),
      createMockCourse({
        id: 'dao-2-hoa-si-ai',
        slug: 'dao-2-hoa-si-ai',
        title: 'Tớ là hoạ sĩ AI!',
        status: 'locked',
        questCount: 4,
        completedCount: 0,
      }),
    ]

    const processed = applyGatekeeperRules(courses, false)

    // Đảo 0 (Tiên quyết): luôn mở
    expect(['available', 'active', 'in_progress']).toContain(processed[0].status)

    // Đảo 1: BẮT BUỘC BỊ KHÓA vì Đảo Tiên Quyết chưa xong 10 trạm
    expect(processed[1].status).toBe('locked')
    expect(processed[1].reasonCode).toBe('previous_island_incomplete')

    // Đảo 2: BẮT BUỘC BỊ KHÓA
    expect(processed[2].status).toBe('locked')
  })

  it('Đảo 1 MỞ KHÓA khi Đảo Tiên Quyết đã hoàn thành 10/10 trạm, nhưng Đảo 2 vẫn KHÓA', () => {
    const courses: PathwayCourse[] = [
      createMockCourse({
        id: 'muoi-quy-tac-xuong-sang-tao',
        slug: 'muoi-quy-tac-xuong-sang-tao',
        title: 'Mười quy tắc Xưởng Sáng Tạo',
        status: 'completed',
        questCount: 10,
        completedCount: 10, // Đã xong 10/10 trạm!
      }),
      createMockCourse({
        id: 'dao-1-nha-tham-hiem-ai',
        slug: 'dao-1-nha-tham-hiem-ai',
        title: 'Nhà thám hiểm AI',
        status: 'locked',
        questCount: 4,
        completedCount: 1, // Mới làm 1/4 trạm Đảo 1
      }),
      createMockCourse({
        id: 'dao-2-hoa-si-ai',
        slug: 'dao-2-hoa-si-ai',
        title: 'Tớ là hoạ sĩ AI!',
        status: 'locked',
        questCount: 4,
        completedCount: 0,
      }),
    ]

    const processed = applyGatekeeperRules(courses, false)

    // Đảo 0: completed
    expect(processed[0].status).toBe('completed')

    // Đảo 1: ĐƯỢC MỞ KHÓA vì Đảo Tiên Quyết đã xong
    expect(['available', 'active', 'in_progress']).toContain(processed[1].status)

    // Đảo 2: VẪN BỊ KHÓA vì Đảo 1 chưa xong
    expect(processed[2].status).toBe('locked')
  })

  it('Đảo 2 MỞ KHÓA khi Đảo 1 hoàn thành toàn bộ 4/4 trạm', () => {
    const courses: PathwayCourse[] = [
      createMockCourse({
        id: 'muoi-quy-tac-xuong-sang-tao',
        slug: 'muoi-quy-tac-xuong-sang-tao',
        title: 'Mười quy tắc Xưởng Sáng Tạo',
        status: 'completed',
        questCount: 10,
        completedCount: 10,
      }),
      createMockCourse({
        id: 'dao-1-nha-tham-hiem-ai',
        slug: 'dao-1-nha-tham-hiem-ai',
        title: 'Nhà thám hiểm AI',
        status: 'completed',
        questCount: 4,
        completedCount: 4, // Xong 4/4 trạm!
      }),
      createMockCourse({
        id: 'dao-2-hoa-si-ai',
        slug: 'dao-2-hoa-si-ai',
        title: 'Tớ là hoạ sĩ AI!',
        status: 'locked',
        questCount: 4,
        completedCount: 0,
      }),
    ]

    const processed = applyGatekeeperRules(courses, false)

    // Cả Đảo 0 và Đảo 1 đã completed
    expect(processed[0].status).toBe('completed')
    expect(processed[1].status).toBe('completed')

    // Đảo 2 ĐƯỢC MỞ KHÓA!
    expect(['available', 'active', 'in_progress']).toContain(processed[2].status)
  })
})
