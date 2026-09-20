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

  it('prefetches next lesson in background when current quest loads', async () => {
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
    expect(getLessonSpy).toHaveBeenCalledWith('lesson-next')
  })
})

