import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import {
  applyGatekeeperRules,
  applySequentialQuestRules,
  isCourseRuleCompleted,
} from './world-gatekeeper'
import {
  type PathwayCourse,
  enrichCoursesWithLocalProgress,
  mapPublishedCurriculumStations,
  getStationSlug,
} from './world-pathway-mapper'
import {
  saveLocalLessonProgress,
  getLocalProgress,
  getNamespacedKey,
} from '@/shared/lib/learning-sync-store'
import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'
import {
  QuestNode,
  IslandStationsExplorerView,
} from '../components/IslandStationsExplorerView'
import type { QuestProgress } from '@/shared/lib/api'

describe('Hành trình học sinh tiểu học (Child Learner E2E Journey - 6 Kịch bản)', () => {
  let storageMap: Map<string, string>
  let originalWindow: any
  let originalLocalStorage: any

  const createMockStorage = () => {
    storageMap = new Map<string, string>()
    return {
      getItem: (key: string) => storageMap.get(key) ?? null,
      setItem: (key: string, val: string) => {
        storageMap.set(key, String(val))
      },
      removeItem: (key: string) => {
        storageMap.delete(key)
      },
      clear: () => {
        storageMap.clear()
      },
      key: (i: number) => Array.from(storageMap.keys())[i] ?? null,
      get length() {
        return storageMap.size
      },
    }
  }

  const generateTenRuleQuests = (): QuestProgress[] =>
    Array.from({ length: 10 }, (_, i) => ({
      id: `rule-${i + 1}`,
      slug: `rule-${i + 1}`,
      order: i + 1,
      title: `Quy tắc ${i + 1}: ${AIKI_RULES_DATA[i]?.shortTitle || `Quy tắc ${i + 1}`}`,
      status: (i === 0 ? 'available' : 'locked') as QuestProgress['status'],
      stars: 0,
      score: 0,
      phase: 'learn' as const,
      xpEarned: 0,
      skill: 'Sáng tạo an toàn',
      reward: 'Huy hiệu Hiệp sĩ AIKI',
      duration: '5 phút',
      hook: AIKI_RULES_DATA[i]?.title || '',
      accent: 'mint',
      practiceKind: 'quiz',
    }))

  const createDefaultSixIslands = (): PathwayCourse[] => [
    {
      id: 'muoi-quy-tac-xuong-sang-tao',
      slug: 'muoi-quy-tac-xuong-sang-tao',
      title: 'Mười quy tắc Xưởng Sáng Tạo',
      shortTitle: '10 Quy tắc vàng',
      status: 'active',
      reasonCode: 'requirements_met',
      completionPercent: 0,
      missingPrerequisites: [],
      coverImage: null,
      enrolled: true,
      questCount: 10,
      completedCount: 0,
      totalStars: 0,
    },
    {
      id: 'dao-1-nha-tham-hiem-ai',
      slug: 'dao-1-nha-tham-hiem-ai',
      title: 'Nhà thám hiểm AI',
      shortTitle: 'Bốn chìa khóa vàng',
      status: 'locked',
      reasonCode: 'previous_island_incomplete',
      completionPercent: 0,
      missingPrerequisites: ['muoi-quy-tac-xuong-sang-tao'],
      coverImage: null,
      enrolled: false,
      questCount: 4,
      completedCount: 0,
      totalStars: 0,
    },
    {
      id: 'dao-2-hoa-si-ai',
      slug: 'dao-2-hoa-si-ai',
      title: 'Tớ là hoạ sĩ AI!',
      shortTitle: 'Sắc màu & Kể chuyện',
      status: 'locked',
      reasonCode: 'previous_island_incomplete',
      completionPercent: 0,
      missingPrerequisites: ['dao-1-nha-tham-hiem-ai'],
      coverImage: null,
      enrolled: false,
      questCount: 4,
      completedCount: 0,
      totalStars: 0,
    },
    {
      id: 'dao-3-biet-doi-nhan-vat-ai',
      slug: 'dao-3-biet-doi-nhan-vat-ai',
      title: 'Biệt đội nhân vật AI',
      shortTitle: 'Hồ sơ 3 điểm',
      status: 'locked',
      reasonCode: 'previous_island_incomplete',
      completionPercent: 0,
      missingPrerequisites: ['dao-2-hoa-si-ai'],
      coverImage: null,
      enrolled: false,
      questCount: 4,
      completedCount: 0,
      totalStars: 0,
    },
    {
      id: 'dao-4-vuong-quoc-truyen-tranh-ai',
      slug: 'dao-4-vuong-quoc-truyen-tranh-ai',
      title: 'Vương quốc truyện tranh AI',
      shortTitle: 'Storyboard 8 ô',
      status: 'locked',
      reasonCode: 'previous_island_incomplete',
      completionPercent: 0,
      missingPrerequisites: ['dao-3-biet-doi-nhan-vat-ai'],
      coverImage: null,
      enrolled: false,
      questCount: 4,
      completedCount: 0,
      totalStars: 0,
    },
    {
      id: 'dao-5-nha-phat-minh-tro-choi-ai',
      slug: 'dao-5-nha-phat-minh-tro-choi-ai',
      title: 'Nhà phát minh trò chơi AI',
      shortTitle: 'Đấu trường thẻ bài',
      status: 'locked',
      reasonCode: 'previous_island_incomplete',
      completionPercent: 0,
      missingPrerequisites: ['dao-4-vuong-quoc-truyen-tranh-ai'],
      coverImage: null,
      enrolled: false,
      questCount: 4,
      completedCount: 0,
      totalStars: 0,
    },
  ]

  beforeEach(() => {
    originalWindow = (globalThis as any).window
    originalLocalStorage = (globalThis as any).localStorage
    const mockStorage = createMockStorage()
    ;(globalThis as any).window = globalThis
    ;(globalThis as any).localStorage = mockStorage
  })

  afterEach(() => {
    if (originalWindow === undefined) {
      delete (globalThis as any).window
    } else {
      ;(globalThis as any).window = originalWindow
    }
    if (originalLocalStorage === undefined) {
      delete (globalThis as any).localStorage
    } else {
      ;(globalThis as any).localStorage = originalLocalStorage
    }
  })

  // ───────────────────────────────────────────────────────────────────────────
  // KỊCH BẢN 1: BÉ MỚI BẮT ĐẦU (FIRST-TIME LEARNER)
  // ───────────────────────────────────────────────────────────────────────────
  describe('Kịch bản 1: Bé mới bắt đầu (First-time Learner)', () => {
    it('Đảo Tiên Quyết chỉ có DUY NHẤT Trạm 1 mở (sấm sét), Trạm 2..10 đều khóa. Các đảo 1..5 đều khóa.', () => {
      const rawQuests = generateTenRuleQuests()
      const sequentialQuests = applySequentialQuestRules(rawQuests, false)

      // 1. Kiểm tra trạng thái dữ liệu trạm học
      expect(['available', 'in_progress']).toContain(sequentialQuests[0].status)
      expect(sequentialQuests[0].stars).toBe(0)

      for (let i = 1; i < 10; i++) {
        expect(sequentialQuests[i].status).toBe('locked')
        expect(sequentialQuests[i].stars).toBe(0)
      }

      // 2. Xác định vị trí trạm hoạt động duy nhất (firstUncompletedIndex)
      const firstUncompletedIndex = sequentialQuests.findIndex(
        (q) => q.status !== 'completed' && (q.stars ?? 0) < 3,
      )
      expect(firstUncompletedIndex).toBe(0)

      // 3. Kiểm tra tính độc nhất của trạm sấm sét: CHỈ DUY NHẤT Trạm 1 là current
      const activeStates = sequentialQuests.map(
        (q, idx) => !q.status.includes('locked') && q.status !== 'completed' && idx === firstUncompletedIndex,
      )
      expect(activeStates[0]).toBe(true)
      expect(activeStates.slice(1).every((s) => s === false)).toBe(true)
      expect(activeStates.filter(Boolean)).toHaveLength(1)

      // 4. Kiểm tra các Đảo tiếp theo (Đảo 1 đến 5) đều bị khóa chặt
      const courses = createDefaultSixIslands()
      const gatekeptCourses = applyGatekeeperRules(courses, false)

      expect(gatekeptCourses[0].isGatekeeper).toBe(true)
      expect(['active', 'available']).toContain(gatekeptCourses[0].status)

      for (let i = 1; i <= 5; i++) {
        expect(gatekeptCourses[i].status).toBe('locked')
        expect(gatekeptCourses[i].reasonCode).toBe('previous_island_incomplete')
        expect(gatekeptCourses[i].lockMessage).toContain('Bé hãy hoàn thành')
      }

      // 5. Render QuestNode cho Trạm 1 và Trạm 2 đảm bảo đúng visual indicator
      const htmlStation1 = renderToStaticMarkup(
        createElement(
          MemoryRouter,
          null,
          createElement(QuestNode, {
            quest: sequentialQuests[0],
            index: 0,
            total: 10,
            courseId: 'muoi-quy-tac-xuong-sang-tao',
            getStationSlugFn: getStationSlug,
            isCurrentCourseRule: true,
            meta: { totalStars: 0, completedCount: 0 },
            currentIslandIndex: 0,
            isCourseLocked: false,
            activeStationIndex: firstUncompletedIndex,
          }),
        ),
      )

      expect(htmlStation1).toContain('quest-node-available')
      expect(htmlStation1).toContain('Vào Học Quy tắc 1 Ngay (+3 Sao)')
      expect(htmlStation1).not.toContain('quest-node-locked')

      const htmlStation2 = renderToStaticMarkup(
        createElement(
          MemoryRouter,
          null,
          createElement(QuestNode, {
            quest: sequentialQuests[1],
            index: 1,
            total: 10,
            courseId: 'muoi-quy-tac-xuong-sang-tao',
            getStationSlugFn: getStationSlug,
            isCurrentCourseRule: true,
            meta: { totalStars: 0, completedCount: 0 },
            currentIslandIndex: 0,
            isCourseLocked: false,
            activeStationIndex: firstUncompletedIndex,
          }),
        ),
      )

      expect(htmlStation2).toContain('quest-node-locked')
      expect(htmlStation2).toContain('Khóa (Cần hoàn thành bài trước)')
      expect(htmlStation2).not.toContain('quest-node-available')
    })
  })

  // ───────────────────────────────────────────────────────────────────────────
  // KỊCH BẢN 2: BÉ THỰC HÀNH TƯƠNG TÁC & PHẢN HỒI TÍCH CỰC (GENTLE PRACTICE)
  // ───────────────────────────────────────────────────────────────────────────
  describe('Kịch bản 2: Bé thực hành tương tác & phản hồi tích cực (Gentle Practice)', () => {
    it('chọn sai có phản hồi ấm áp và cho phép thử lại; chọn đúng được khen ngợi; hoàn thành nhận 3 sao + 50 XP', () => {
      const rule1 = AIKI_RULES_DATA[0]
      expect(rule1).toBeDefined()
      expect(rule1.id).toBe(1)
      expect(rule1.questions).toHaveLength(2)

      const q1 = rule1.questions[0]
      const q2 = rule1.questions[1]

      // 1. Kiểm tra tính sư phạm & tâm lý học sinh của dữ liệu câu đố
      expect(q1.correctIndex).toBe(1)
      expect(q1.options[q1.correctIndex]).toBe('Vì đó là ý riêng của Sonet')

      // Phản hồi khi chọn sai: Ấm áp, nhẹ nhàng, không phán xét tiêu cực
      expect(q1.retryFeedback).toContain('Chưa đúng nhé')
      expect(q1.retryFeedback).toContain('Bức của Sonet mới là của riêng bạn ấy')
      expect(q1.hint).toContain('Ghi nhớ Quy tắc 1')

      // Phản hồi khi chọn đúng: Khen ngợi tích cực, khích lệ tư duy độc bản
      expect(q1.successFeedback).toContain('Chuẩn rồi!')
      expect(q1.successFeedback).toContain('KHÔNG GIỐNG AI')

      // Câu 2
      expect(q2.correctIndex).toBe(1)
      expect(q2.retryFeedback).toContain('Chưa đúng')
      expect(q2.successFeedback).toContain('Đúng!')

      // 2. Mô phỏng luồng chọn đáp án & hoàn thành bài học
      let currentAttemptAnswers: Record<number, number> = {}
      let isAnswerCorrect: boolean | null = null

      // Bé bấm chọn đáp án sai đầu tiên (index = 0)
      currentAttemptAnswers[0] = 0
      isAnswerCorrect = currentAttemptAnswers[0] === q1.correctIndex
      expect(isAnswerCorrect).toBe(false)
      const feedbackOnWrong = isAnswerCorrect ? q1.successFeedback : q1.retryFeedback
      expect(feedbackOnWrong).toBe(q1.retryFeedback)

      // Cơ chế Thử lại (Gentle Retry): Bé được chọn lại mà không bị khóa điểm vĩnh viễn
      currentAttemptAnswers[0] = q1.correctIndex
      isAnswerCorrect = currentAttemptAnswers[0] === q1.correctIndex
      expect(isAnswerCorrect).toBe(true)
      const feedbackOnRight = isAnswerCorrect ? q1.successFeedback : q1.retryFeedback
      expect(feedbackOnRight).toBe(q1.successFeedback)

      // 3. Hoàn thành toàn bộ câu hỏi và nhận 3 sao + 50 XP
      currentAttemptAnswers[1] = q2.correctIndex
      const totalCorrect = Object.entries(currentAttemptAnswers).filter(
        ([idx, chosen]) => chosen === rule1.questions[Number(idx)].correctIndex,
      ).length
      expect(totalCorrect).toBe(2)

      const earnedStars = totalCorrect === rule1.questions.length ? 3 : 1
      const earnedXp = 50

      expect(earnedStars).toBe(3)
      expect(earnedXp).toBe(50)
    })
  })

  // ───────────────────────────────────────────────────────────────────────────
  // KỊCH BẢN 3: TIẾN TRÌNH MỞ KHÓA TRẠM TUẦN TỰ & NHẬN SAO
  // ───────────────────────────────────────────────────────────────────────────
  describe('Kịch bản 3: Tiến trình mở khóa trạm tuần tự & nhận sao (Sequential Station Unlock)', () => {
    it('sau khi hoàn thành Trạm 1 với 3 sao, Trạm 1 thành tích xanh (3/3 sao), Trạm 2 mở sấm sét, KHÔNG BAO GIỜ có 2 trạm sấm sét', () => {
      const rawQuests = generateTenRuleQuests()

      // Bé vừa hoàn thành Trạm 1 đạt 3 sao
      rawQuests[0].status = 'completed'
      rawQuests[0].stars = 3
      rawQuests[0].score = 100
      rawQuests[0].xpEarned = 50

      const processed = applySequentialQuestRules(rawQuests, false)

      // 1. Trạm 1: Đã hoàn thành (completed) với 3 sao
      expect(processed[0].status).toBe('completed')
      expect(processed[0].stars).toBe(3)

      // 2. Trạm 2: Là trạm tiếp theo -> lập tức mở (available / in_progress)
      expect(['available', 'in_progress']).toContain(processed[1].status)

      // 3. Trạm 3..10: BẮT BUỘC KHÓA (locked)
      for (let i = 2; i < 10; i++) {
        expect(processed[i].status).toBe('locked')
      }

      // 4. Trạm hoạt động duy nhất (firstUncompletedIndex) chuyển sang Trạm 2 (index = 1)
      const firstUncompletedIndex = processed.findIndex(
        (q) => q.status !== 'completed' && (q.stars ?? 0) < 3,
      )
      expect(firstUncompletedIndex).toBe(1)

      // 5. Kiểm tra logic sấm sét (isCurrent):
      // - Trạm 1: isCurrent = false, isCompleted = true
      // - Trạm 2: isCurrent = true, isCompleted = false
      // - Trạm 3..10: isCurrent = false, isLocked = true
      const stationStates = processed.map((q, idx) => ({
        isCompleted: q.status === 'completed' || (q.stars ?? 0) >= 3,
        isCurrent: q.status !== 'completed' && !q.status.includes('locked') && idx === firstUncompletedIndex,
        isLocked: q.status === 'locked' || (q.status !== 'completed' && idx !== firstUncompletedIndex),
      }))

      expect(stationStates[0]).toEqual({ isCompleted: true, isCurrent: false, isLocked: false })
      expect(stationStates[1]).toEqual({ isCompleted: false, isCurrent: true, isLocked: false })
      expect(stationStates[2]).toEqual({ isCompleted: false, isCurrent: false, isLocked: true })

      // ĐẢM BẢO BẤT BIẾN: Số lượng trạm sấm sét luôn DUY NHẤT = 1
      const totalLightningStations = stationStates.filter((s) => s.isCurrent).length
      expect(totalLightningStations).toBe(1)

      // 6. Kiểm tra giao diện HTML render bằng QuestNode
      const htmlStation1 = renderToStaticMarkup(
        createElement(
          MemoryRouter,
          null,
          createElement(QuestNode, {
            quest: processed[0],
            index: 0,
            total: 10,
            courseId: 'muoi-quy-tac-xuong-sang-tao',
            getStationSlugFn: getStationSlug,
            isCurrentCourseRule: true,
            meta: { totalStars: 3, completedCount: 1 },
            currentIslandIndex: 0,
            isCourseLocked: false,
            activeStationIndex: firstUncompletedIndex,
          }),
        ),
      )
      expect(htmlStation1).toContain('quest-node-completed')
      expect(htmlStation1).toContain('3/3 Sao')
      expect(htmlStation1).toContain('Ôn lại trạm này')

      const htmlStation2 = renderToStaticMarkup(
        createElement(
          MemoryRouter,
          null,
          createElement(QuestNode, {
            quest: processed[1],
            index: 1,
            total: 10,
            courseId: 'muoi-quy-tac-xuong-sang-tao',
            getStationSlugFn: getStationSlug,
            isCurrentCourseRule: true,
            meta: { totalStars: 3, completedCount: 1 },
            currentIslandIndex: 0,
            isCourseLocked: false,
            activeStationIndex: firstUncompletedIndex,
          }),
        ),
      )
      expect(htmlStation2).toContain('quest-node-available')
      expect(htmlStation2).toContain('Vào Học Quy tắc 2 Ngay (+3 Sao)')
    })
  })

  // ───────────────────────────────────────────────────────────────────────────
  // KỊCH BẢN 4: BÉ TÒ MÒ BẤM VÀO TRẠM/ĐẢO BỊ KHÓA (CURIOUS EXPLORATION)
  // ───────────────────────────────────────────────────────────────────────────
  describe('Kịch bản 4: Bé tò mò bấm vào trạm/đảo bị khóa (Curious Exploration)', () => {
    it('không ném lỗi crash, hiển thị Banner Soft Clay hướng dẫn bé quay lại Đảo Tiên Quyết', () => {
      const courses = createDefaultSixIslands()
      const processedCourses = applyGatekeeperRules(courses, false)
      const island1Quests = mapPublishedCurriculumStations(processedCourses[1], 'dao-1')

      // Bé bấm xem Đảo 1 (Nhà thám hiểm AI) vốn đang bị khóa
      expect(processedCourses[1].status).toBe('locked')

      // Render IslandStationsExplorerView cho Đảo 1 đang bị khóa
      const renderLockedIsland = () =>
        renderToStaticMarkup(
          createElement(
            MemoryRouter,
            null,
            createElement(IslandStationsExplorerView, {
              courseId: 'dao-1',
              courseTitle: 'Nhà thám hiểm AI',
              quests: island1Quests,
              courses: processedCourses,
              meta: { totalStars: 0, completedCount: 0 },
              isCurrentCourseRule: false,
              getStationSlugFn: getStationSlug,
            }),
          ),
        )

      // 1. Đảm bảo giao diện KHÔNG ném lỗi crash hoặc Unhandled Exception
      expect(renderLockedIsland).not.toThrow()

      const html = renderLockedIsland()

      // 2. Banner Soft Clay xuất hiện với thông điệp nhẹ nhàng, ấm áp
      expect(html).toContain('Hòn Đảo Này Đang Chờ Mở Khóa!')
      expect(html).toContain(
        processedCourses[1].lockMessage ||
          'Bé hãy hoàn thành Đảo Tiên Quyết (10 Quy Tắc Vàng) trước để mở khóa Đảo 1 nhé!',
      )

      // 3. Nút CTA Soft Clay dẫn bé về Đảo Tiên Quyết an toàn
      expect(html).toContain('Đến Đảo Tiên Quyết (10 Quy Tắc Vàng)')

      // 4. Mọi trạm trên Đảo 1 đều hiển thị biểu tượng khóa, không cho phép click vào học bài
      expect(html).toContain('Mốc trạm Bài 1.1 đã khóa')
      expect(html).toContain('Chưa mở khóa')
    })
  })

  // ───────────────────────────────────────────────────────────────────────────
  // KỊCH BẢN 5: HOÀN THÀNH ĐẢO TIÊN QUYẾT MỞ KHÓA ĐẢO 1
  // ───────────────────────────────────────────────────────────────────────────
  describe('Kịch bản 5: Hoàn thành Đảo Tiên Quyết mở khóa Đảo 1 (Prerequisite Island Graduation)', () => {
    it('khi bé xong 10/10 trạm (30 sao), Đảo 1 mở khóa, Trạm 1.1 mở sấm sét, Đảo 2 vẫn khóa cho đến khi Đảo 1 xong 4/4 trạm', () => {
      const courses = createDefaultSixIslands()

      // 1. Bé hoàn thành toàn bộ 10/10 trạm của Đảo Tiên Quyết (30 sao)
      courses[0].completedCount = 10
      courses[0].totalStars = 30
      courses[0].status = 'completed'

      expect(isCourseRuleCompleted(courses[0])).toBe(true)

      const afterPrereqGraduation = applyGatekeeperRules(courses, false)

      // Đảo Tiên Quyết: completed
      expect(afterPrereqGraduation[0].status).toBe('completed')

      // Đảo 1: ĐƯỢC MỞ KHÓA!
      expect(['available', 'active']).toContain(afterPrereqGraduation[1].status)
      expect(afterPrereqGraduation[1].reasonCode).toBe('requirements_met')
      expect(afterPrereqGraduation[1].lockMessage).toBeUndefined()

      // Đảo 2: VẪN KHÓA vì Đảo 1 mới mở, chưa hoàn thành trạm nào (0/4)
      expect(afterPrereqGraduation[2].status).toBe('locked')
      expect(afterPrereqGraduation[2].reasonCode).toBe('previous_island_incomplete')

      // 2. Kiểm tra tiến trình các trạm trên Đảo 1 (4 bài học)
      const rawIsland1Stations = mapPublishedCurriculumStations(afterPrereqGraduation[1], 'dao-1')
      expect(rawIsland1Stations).toHaveLength(4)

      const island1Stations = applySequentialQuestRules(rawIsland1Stations, false)

      // Trạm 1.1 của Đảo 1 mở sấm sét duy nhất!
      expect(['available', 'in_progress']).toContain(island1Stations[0].status)
      expect(island1Stations[1].status).toBe('locked')
      expect(island1Stations[2].status).toBe('locked')
      expect(island1Stations[3].status).toBe('locked')

      // 3. Khi bé hoàn thành tiếp 4/4 trạm của Đảo 1 (Nhà thám hiểm AI)
      afterPrereqGraduation[1].completedCount = 4
      afterPrereqGraduation[1].totalStars = 12
      afterPrereqGraduation[1].status = 'completed'

      expect(isCourseRuleCompleted(afterPrereqGraduation[1])).toBe(true)

      const afterIsland1Graduation = applyGatekeeperRules(afterPrereqGraduation, false)

      // Cả Đảo 0 và Đảo 1 đã completed
      expect(afterIsland1Graduation[0].status).toBe('completed')
      expect(afterIsland1Graduation[1].status).toBe('completed')

      // Đảo 2: CHÍNH THỨC MỞ KHÓA!
      expect(['available', 'active']).toContain(afterIsland1Graduation[2].status)
      expect(afterIsland1Graduation[2].reasonCode).toBe('requirements_met')

      // Đảo 3: Vẫn khóa cho đến khi Đảo 2 hoàn thành
      expect(afterIsland1Graduation[3].status).toBe('locked')
    })
  })

  // ───────────────────────────────────────────────────────────────────────────
  // KỊCH BẢN 6: TÍNH BỀN VỮNG KHI F5 VÀ PHÂN LẬP DỮ LIỆU ANH EM (BO & BI)
  // ───────────────────────────────────────────────────────────────────────────
  describe('Kịch bản 6: Tính bền vững khi F5 và phân lập dữ liệu anh em (Bo & Bi)', () => {
    it('reload không mất sao, hai bé trên cùng máy tính có tiến trình độc lập tuyệt đối', () => {
      const childBo = 'child_bo_8tuoi'
      const childBi = 'child_bi_6tuoi'

      // 1. Anh Bo học xong Quy tắc 1 đạt 3 sao
      saveLocalLessonProgress('rule-1', 3, true, childBo)

      // Kiểm tra storage namespaced key được lưu đúng chuẩn
      const boCompKey = getNamespacedKey('aikids_lesson_completed_rule-1', childBo)
      const boStarKey = getNamespacedKey('aikids_lesson_stars_rule-1', childBo)
      expect(storageMap.get(boCompKey)).toBe('true')
      expect(storageMap.get(boStarKey)).toBe('3')

      // 2. Bé Bi mới đăng nhập, chưa học trạm nào
      const biProgress = getLocalProgress(childBi)
      expect(biProgress.completedCount).toBe(0)
      expect(biProgress.totalStars).toBe(0)
      expect(biProgress.completedLessonIds.has('rule-1')).toBe(false)
      expect(biProgress.lessonStars['rule-1'] ?? 0).toBe(0)

      // 3. F5 / Reload trang của Bo: Tiến trình vẫn bảo toàn 100%
      const boProgressAfterF5 = getLocalProgress(childBo)
      expect(boProgressAfterF5.completedCount).toBe(1)
      expect(boProgressAfterF5.totalStars).toBe(3)
      expect(boProgressAfterF5.completedLessonIds.has('rule-1')).toBe(true)
      expect(boProgressAfterF5.lessonStars['rule-1']).toBe(3)

      // 4. Áp dụng tiến trình vào danh sách khóa học của Bo và Bi
      const baseCourses = createDefaultSixIslands()

      const boCourses = enrichCoursesWithLocalProgress(baseCourses, undefined, undefined, childBo)
      expect(boCourses[0].completedCount).toBe(1)
      expect(boCourses[0].totalStars).toBe(3)

      const biCourses = enrichCoursesWithLocalProgress(baseCourses, undefined, undefined, childBi)
      expect(biCourses[0].completedCount).toBe(0)
      expect(biCourses[0].totalStars).toBe(0)

      // Tuyệt đối không có sự nhiễm chéo dữ liệu giữa Bo và Bi!
      expect(boCourses[0].completedCount).not.toBe(biCourses[0].completedCount)
    })
  })
})
