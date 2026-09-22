// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Routes, Route } from 'react-router'
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
    vi.spyOn(learningApi, 'startLesson').mockResolvedValue({
      progress: {
        status: 'in_progress',
        phase: 'learn',
        stars: 1,
      },
    })
    const getLessonSpy = vi.spyOn(learningApi, 'getLesson').mockImplementation(async (id: string) => {
      if (id === 'lesson-current') {
        return {
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

    expect(getLessonSpy).toHaveBeenCalledWith('lesson-current')
    expect(getLessonSpy).not.toHaveBeenCalledWith('lesson-next')
    expect(getLessonSpy).toHaveBeenCalledTimes(1)
  })

  it('renders SixStageJourneyView with 3 stages for Aiki Rule lesson with DB UUID and QT1 title', async () => {
    vi.spyOn(learningApi, 'startLesson').mockResolvedValue({
      progress: {
        status: 'in_progress',
        phase: 'learn',
        stars: 1,
      },
    })
    vi.spyOn(learningApi, 'getLesson').mockImplementation(async () => {
      return {
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
      }
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
})
