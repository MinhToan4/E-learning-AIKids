// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot as originalCreateRoot } from 'react-dom/client'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { QuizStageBlock } from './QuizStageBlock'
import type { JourneyStageDefinition, QuizStageConfig } from '../../types/stage-schema'

const activeRoots: Array<{ unmount: () => void }> = []
const createRoot: typeof originalCreateRoot = (container, options) => {
  const root = originalCreateRoot(container, options)
  activeRoots.push(root)
  return root
}

const mockQuizStage: JourneyStageDefinition<QuizStageConfig> = {
  id: 'stage-3',
  type: 'QUIZ',
  title: 'Bài test',
  stepNumber: 4,
  config: {
    title: 'Thử Tài Phản Xạ',
    passScore: 2,
    posterUrl: '/assets/aiki-islands/island1_lesson1_cat.jpg',
    questions: [
      {
        id: 'q1',
        prompt: 'Câu thần chú của bài hôm nay là gì?',
        options: [
          'Chỗ nào các cậu bỏ trống, AI sẽ tự điền vào',
          'Cứ bấm nhiều lần là sẽ ra hình đẹp',
          'Viết càng ngắn thì AI càng hiểu nhanh',
        ],
        correctIndex: 0,
        explanation: 'Đúng rồi! Đây là câu neo của cả chương.',
        visualUrl: '/assets/aiki-islands/island1_lesson1_cat.jpg',
      },
      {
        id: 'q2',
        prompt: 'Câu tả có mấy điều?',
        options: ['Ba điều', 'Năm điều', 'Một điều'],
        correctIndex: 1,
        explanation: 'Năm điều nhé!',
        visualUrl: '',
      },
    ],
  },
}

describe('QuizStageBlock', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    act(() => {
      while (activeRoots.length > 0) {
        try {
          activeRoots.pop()?.unmount()
        } catch {
          // ignore
        }
      }
    })
    if (container && container.parentNode) {
      document.body.removeChild(container)
    }
  })

  it('renders question prompt, options and handles fallback image when visualUrl is missing', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <QuizStageBlock
          stage={mockQuizStage}
          activeQuizQuestionIdx={1} // Câu 2 có visualUrl: ''
          quizAnswers={{}}
          checkedQuestions={{}}
        />
      )
    })

    const section = container.querySelector('section[data-testid="stage-3-quiz"]')
    expect(section).not.toBeNull()
    expect(section?.textContent).toContain('Câu tả có mấy điều?')

    const img = section?.querySelector('img') as HTMLImageElement
    expect(img).not.toBeNull()
    // Phải fallback về posterUrl của config
    expect(img.src).toContain('/assets/aiki-islands/island1_lesson1_cat.jpg')
  })

  it('allows user to re-select option when the previous answer was WRONG', () => {
    const onSelectQuizAnswer = vi.fn()
    const root = createRoot(container)

    // Câu 1: correctIndex = 0. Giả sử học sinh đã chọn option 1 (SAI)
    act(() => {
      root.render(
        <QuizStageBlock
          stage={mockQuizStage}
          activeQuizQuestionIdx={0}
          quizAnswers={{ 0: 1 }}
          checkedQuestions={{ 0: true }}
          onSelectQuizAnswer={onSelectQuizAnswer}
        />
      )
    })

    const section = container.querySelector('section[data-testid="stage-3-quiz"]')
    expect(section?.textContent).toContain('✕ Chưa chính xác')

    // Nút option 0 (đáp án đúng) không được bị disabled vì học sinh đang chọn sai
    const activeQuestionBlock = section?.querySelector('div.block')
    const optionButtons = activeQuestionBlock?.querySelectorAll('button[class*="rounded-xl sm:rounded-2xl"]')
    expect(optionButtons?.length).toBe(3)

    const opt0Button = optionButtons?.[0] as HTMLButtonElement
    expect(opt0Button.disabled).toBe(false)

    // Bé click vào đáp án 0 để sửa lại
    act(() => {
      opt0Button.click()
    })

    expect(onSelectQuizAnswer).toHaveBeenCalledWith(0, 0)
  })

  it('shows retry button when answer is wrong and triggers onRetryQuestion', () => {
    const onRetryQuestion = vi.fn()
    const root = createRoot(container)

    act(() => {
      root.render(
        <QuizStageBlock
          stage={mockQuizStage}
          activeQuizQuestionIdx={0}
          quizAnswers={{ 0: 2 }}
          checkedQuestions={{ 0: true }}
          onRetryQuestion={onRetryQuestion}
        />
      )
    })

    const section = container.querySelector('section[data-testid="stage-3-quiz"]')
    const retryBtn = section?.querySelector('button[title="Thử lại câu này ngay"]') as HTMLButtonElement
    expect(retryBtn).not.toBeNull()
    expect(retryBtn.textContent).toContain('🔄 Thử lại câu này')
    expect(section?.querySelectorAll('button[title*="Thử lại"]').length).toBe(1)
    expect(section?.textContent).toContain('Con hãy đọc lại câu hỏi và quan sát hình minh họa rồi thử lại nhé.')
    expect(section?.textContent).not.toContain('câu neo')
    expect(section?.textContent).not.toContain('Đúng rồi! Đây là câu neo của cả chương.')
    expect(section?.textContent).not.toContain('Câu tiếp theo')

    act(() => {
      retryBtn.click()
    })

    expect(onRetryQuestion).toHaveBeenCalledWith(0)
  })

  it('disables options once question is answered CORRECTLY or quiz is submitted', () => {
    const onSelectQuizAnswer = vi.fn()
    const root = createRoot(container)

    // TH 1: Đã trả lời ĐÚNG (option 0)
    act(() => {
      root.render(
        <QuizStageBlock
          stage={mockQuizStage}
          activeQuizQuestionIdx={0}
          quizAnswers={{ 0: 0 }}
          checkedQuestions={{ 0: true }}
          onSelectQuizAnswer={onSelectQuizAnswer}
        />
      )
    })

    const section = container.querySelector('section[data-testid="stage-3-quiz"]')
    expect(section?.textContent).toContain('✓ Đúng rồi!')

    const activeBlock = section?.querySelector('div.block')
    const optionButtons = activeBlock?.querySelectorAll('button[class*="rounded-xl sm:rounded-2xl"]')
    const opt1Button = optionButtons?.[1] as HTMLButtonElement
    expect(opt1Button.disabled).toBe(true)

    // Click không trigger onSelectQuizAnswer
    act(() => {
      opt1Button.click()
    })
    expect(onSelectQuizAnswer).not.toHaveBeenCalled()
  })

  it('verifies Layout Defense: bottom action bar does not use sticky to prevent floating over options', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <QuizStageBlock
          stage={mockQuizStage}
          activeQuizQuestionIdx={0}
          quizAnswers={{}}
          checkedQuestions={{}}
        />
      )
    })

    const section = container.querySelector('section[data-testid="stage-3-quiz"]') as HTMLElement
    expect(section).not.toBeNull()
    expect(section.className).toContain('overflow-hidden')

    // Find scroll body containing options
    const scrollBody = section.querySelector('div[class*="overflow-y-auto"]') as HTMLElement
    expect(scrollBody).not.toBeNull()

    // Find bottom action bar: must NOT contain "sticky" or "bottom-0"
    const bottomBar = section.lastElementChild as HTMLElement
    expect(bottomBar).not.toBeNull()
    expect(bottomBar.className).not.toContain('sticky')
    expect(bottomBar.className).not.toContain('bottom-0')
    expect(bottomBar.textContent).toContain('Xem lại video')
    expect(bottomBar.textContent).toContain('Nộp bài kiểm tra')
  })
})
