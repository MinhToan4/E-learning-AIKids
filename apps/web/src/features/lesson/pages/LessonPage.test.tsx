// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { LessonPage, createAikiRuleCardsFromData } from './LessonPage'
import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'
import { learningApi } from '@/shared/lib/learning-api'

let mockStorage: Record<string, string> = {}
const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = String(val)
  },
  removeItem: (key: string) => {
    delete mockStorage[key]
  },
  clear: () => {
    mockStorage = {}
  },
  get length() {
    return Object.keys(mockStorage).length
  },
  key: (i: number) => Object.keys(mockStorage)[i] ?? null,
}
Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true,
})

describe('createAikiRuleCardsFromData', () => {
  it('generates 5 fully populated stages for rule journey', () => {
    const rule = AIKI_RULES_DATA[0]
    const cards = createAikiRuleCardsFromData(rule)

    expect(cards).toHaveLength(5)
    expect(cards[0].kind).toBe('situation')
    expect(cards[0].dialogueLines).toBeDefined()
    expect(cards[1].kind).toBe('aiki-riddle')
    expect(cards[1].optionImages).toHaveLength(2)
    expect(cards[2].kind).toBe('rule')
    expect(cards[2].imageUrl).toBe(rule.posterImage)
    expect(cards[3].kind).toBe('explanation')
    expect(cards[3].compareData).toBeDefined()
    expect(cards[4].kind).toBe('closing')
    expect(cards[4].body).toBe(rule.knightCommitment || 'Con cam kết luôn dùng ý tưởng độc đáo của riêng mình!')
  })
})

describe('LessonPage prefetch', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot> | null = null

  beforeEach(() => {
    mockStorage = {}
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    act(() => {
      root?.unmount()
    })
    root = null
    if (container.parentNode) {
      document.body.removeChild(container)
    }
    vi.restoreAllMocks()
  })

  it('loads only the current lesson and does not prefetch the next lesson', async () => {
    const openLessonSpy = vi.spyOn(learningApi, 'openLesson').mockImplementation(async (id: string) => {
      if (id === 'lesson-current') {
        return {
          progress: { status: 'in_progress', phase: 'learn', stars: 1 },
          quest: {
            id: 'lesson-current',
            courseId: 'course-1',
            order: 1,
            title: 'Current Lesson',
            duration: '10m',
            hook: 'Hook',
            accent: 'blue',
            practiceKind: 'chips',
            skill: 'Skill',
            reward: 'Reward',
            goals: ['Goal 1'],
            learnCards: [],
            check: [],
            sixStageJourney: {
              nextSlug: 'lesson-next',
              stage1_goal: { id: 'g1', title: 'Goal', goalText: 'Text', imageUrl: '', speech: '', keyPoints: [] },
              stage2_confirmGoal: { id: 'cg1', question: 'Q', options: [], correctIndex: 0, explanation: '', speech: '' },
              stage3_video: { id: 'v1', title: 'V', videoUrl: '', durationSec: 100 },
              stage4_quiz: { id: 'q1', title: 'Quiz', questions: [], passScore: 1 },
              stage5_practice: { id: 'p1', title: 'P', subjectName: 'P', badge: 'B', illustrationType: '', lockedFeatures: [], akiMotto: '', maxAttempts: 3, workflowSteps: [] },
              stage6_completion: {
                id: 'c1',
                title: 'Done',
                congratsMessage: '',
                rewardBadge: { name: 'Badge', stars: 3, xp: 50 },
                nextLessonSlug: 'lesson-next',
              },
            },
          } as unknown as import('@/shared/lib/api').QuestDetail,
        }
      }
      return {
        progress: { status: 'in_progress', phase: 'learn', stars: 0 },
        quest: {
          id: 'lesson-next',
          courseId: 'course-1',
          order: 2,
          title: 'Next Lesson',
          duration: '10m',
          hook: 'Hook',
          accent: 'blue',
          practiceKind: 'chips',
          skill: 'Skill',
          reward: 'Reward',
          goals: [],
          learnCards: [],
          check: [],
        } as unknown as import('@/shared/lib/api').QuestDetail,
      }
    })

    const activeRoot = createRoot(container)
    root = activeRoot
    await act(async () => {
      activeRoot.render(
        <MemoryRouter initialEntries={['/world/course-1/lesson/lesson-current']}>
          <Routes>
            <Route path="/world/:courseId/lesson/:lessonId" element={<LessonPage />} />
          </Routes>
        </MemoryRouter>,
      )
    })

    expect(openLessonSpy).toHaveBeenCalledWith('lesson-current')
    expect(openLessonSpy).not.toHaveBeenCalledWith('lesson-next')
    expect(openLessonSpy).toHaveBeenCalledTimes(1)
  })

  it('renders SixStageJourneyView with 3 stages for Aiki Rule lesson with DB UUID and QT1 title', async () => {
    vi.spyOn(learningApi, 'openLesson').mockResolvedValue({
      progress: {
        status: 'in_progress',
        phase: 'learn',
        stars: 1,
      },
      quest: {
        id: '0da9d441-43a0-4d00-84d7-e8f8958e2aad',
        courseId: '5a2221e2-91a7-42dc-8362-ac9e51d8cc5b',
        order: 1,
        title: 'QT1 — Hãy nghĩ ý tưởng của con, rồi mới chia sẻ với AIKI nhé!',
        duration: '52 giây',
        hook: 'Nghĩ ý tưởng trước khi hỏi AI',
        accent: '#f59e0b',
        practiceKind: 'chips',
        skill: 'Khi con muốn sáng tạo, dừng lại 30 giây để hình dung',
        reward: 'Huy hiệu Quy tắc 1',
        goals: ['Bí quyết của con: Hãy luôn nghĩ ý tưởng của riêng con trước'],
        learnCards: [],
        check: [],
      } as unknown as import('@/shared/lib/api').QuestDetail,
    })

    const activeRoot = createRoot(container)
    root = activeRoot
    await act(async () => {
      activeRoot.render(
        <MemoryRouter initialEntries={['/world/5a2221e2-91a7-42dc-8362-ac9e51d8cc5b/lesson/0da9d441-43a0-4d00-84d7-e8f8958e2aad']}>
          <Routes>
            <Route path="/world/:courseId/lesson/:lessonId" element={<LessonPage />} />
          </Routes>
        </MemoryRouter>,
      )
    })

    // The journey renderer is intentionally split from the route bundle.
    await vi.waitFor(() => expect(container.textContent).toContain('Chặng 1/3'))
    expect(container.textContent).toContain('Quy tắc 1: Nghĩ ý tưởng trước khi hỏi AI')
    // Legacy sidebar / 4-phase tabs should NOT be rendered
    expect(container.querySelector('[data-testid="legacy-sidebar"]')).toBeNull()
  })

  it('opens a friendly rule route with the authoritative LMS lesson id', async () => {
    const authoritativeId = '0da9d441-43a0-4d00-84d7-e8f8958e2aad'
    vi.spyOn(learningApi, 'getPathway').mockResolvedValue({
      student: { nickname: 'Bo', ageBand: '8-10' },
      policy: null,
      recommendedCourseId: 'dao-1',
      courses: [{
        id: 'dao-1',
        title: 'Mười quy tắc của Xưởng sáng tạo',
        shortTitle: 'Đảo 1',
        status: 'active',
        reasonCode: 'manual_override',
        completionPercent: 0,
        missingPrerequisites: [],
        coverImage: null,
        enrolled: true,
        enrollmentId: 'enrollment-bo',
        stations: [{
          id: authoritativeId,
          slug: 'rule-1',
          order: 1,
          title: 'QT1 — Nghĩ ý tưởng trước khi hỏi AI',
          skill: '', reward: '', duration: '52 giây', hook: '', accent: '#f59e0b', practiceKind: 'chips',
          status: 'available', phase: 'learn', stars: 0, xpEarned: 0,
        }],
      }],
    })
    const openLessonSpy = vi.spyOn(learningApi, 'openLesson').mockResolvedValue({
      progress: { status: 'in_progress', phase: 'learn', stars: 0 },
      quest: { id: authoritativeId } as import('@/shared/lib/api').QuestDetail,
    })

    const activeRoot = createRoot(container)
    root = activeRoot
    await act(async () => {
      activeRoot.render(
        <MemoryRouter initialEntries={['/world/dao-1/lesson/rule-1']}>
          <Routes>
            <Route path="/world/:courseId/lesson/:lessonId" element={<LessonPage />} />
          </Routes>
        </MemoryRouter>,
      )
    })

    await vi.waitFor(() => expect(openLessonSpy).toHaveBeenCalledWith(authoritativeId))
    expect(openLessonSpy).not.toHaveBeenCalledWith('rule-1')
  })

  it('automatically normalizes raw UUID in URL to friendly /rule-2 slug (Kịch bản 3)', async () => {
    vi.spyOn(learningApi, 'openLesson').mockResolvedValue({
      progress: {
        status: 'in_progress',
        phase: 'learn',
        stars: 1,
      },
      quest: {
        id: 'c0363e77-2148-4373-b41a-0d0be4a4e4be',
        courseId: 'dao-1-nha-tham-hiem-ai',
        order: 2,
        title: 'QT2 — Nội dung là do con viết, hãy đảm bảo viết xong mới gửi cho AIKI!',
        duration: '50 giây',
        hook: 'Tự viết nội dung trước khi gửi',
        accent: '#f59e0b',
        practiceKind: 'chips',
        skill: 'Tự suy nghĩ và viết nội dung trước',
        reward: 'Huy hiệu Quy tắc 2',
        goals: [],
        learnCards: [],
        check: [],
      } as unknown as import('@/shared/lib/api').QuestDetail,
    })

    let currentLocation = ''
    function LocationTracker() {
      const location = useLocation()
      currentLocation = location.pathname
      return null
    }

    const activeRoot = createRoot(container)
    root = activeRoot
    await act(async () => {
      activeRoot.render(
        <MemoryRouter initialEntries={['/world/dao-1/lesson/c0363e77-2148-4373-b41a-0d0be4a4e4be']}>
          <LocationTracker />
          <Routes>
            <Route path="/world/:courseId/lesson/:lessonId" element={<LessonPage />} />
            <Route path="/world/:courseId/lesson/rule-2" element={<div data-testid="rule-2-page">Rule 2 Normalized</div>} />
          </Routes>
        </MemoryRouter>,
      )
    })

    await vi.waitFor(() => {
      expect(currentLocation).toBe('/world/dao-1/lesson/rule-2')
    })
  })
})
