// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { ConfirmGoalStageEditor } from './ConfirmGoalStageEditor'
import { StudentStagePreview } from './LectureDrawer'
import type { SixStageConfirmGoal, LessonSixStageJourney } from '@/shared/lib/api'

describe('ConfirmGoalStageEditor Component', () => {
  let container: HTMLDivElement | null = null

  afterEach(() => {
    if (container) {
      document.body.removeChild(container)
      container = null
    }
  })

  const mockConfirmGoal: SixStageConfirmGoal = {
    id: 'test-confirm-goal',
    question: 'Bộ chìa khoá nào mở được một câu lệnh tốt?',
    speech: 'Các con hãy chọn bộ chìa khóa đúng nhé!',
    explanation: 'CÔNG THỨC 4 CHÌA KHOÁ: Cái gì · Trông như thế nào · Đang làm gì · Ở đâu',
    correctIndex: 1,
    options: [
      { id: 'opt-a', text: 'Bộ chìa khoá A', imageUrl: '/assets/aiki-keys/option_a_4keys.svg' },
      { id: 'opt-b', text: 'Bộ chìa khoá B', imageUrl: '/assets/aiki-keys/option_b_4keys.svg' },
      { id: 'opt-c', text: 'Bộ chìa khoá C', imageUrl: '/assets/aiki-keys/option_c_4keys.svg' },
    ],
  }

  it('renders question, speech, explanation, and all 3 options', () => {
    const html = renderToStaticMarkup(
      <ConfirmGoalStageEditor
        confirmGoal={mockConfirmGoal}
        onChange={() => {}}
        previewAikiVoice={() => {}}
      />
    )

    expect(html).toContain('Khối Biên Soạn Câu Hỏi Xác Nhận Mục Tiêu (Chặng 2)')
    expect(html).toContain('3 phương án')
    expect(html).toContain('Bộ chìa khoá nào mở được một câu lệnh tốt?')
    expect(html).toContain('Các con hãy chọn bộ chìa khóa đúng nhé!')
    expect(html).toContain('CÔNG THỨC 4 CHÌA KHOÁ')
    expect(html).toContain('Phương án A')
    expect(html).toContain('Phương án B')
    expect(html).toContain('Phương án C')
    expect(html).toContain('/assets/aiki-keys/option_a_4keys.svg')
    expect(html).toContain('/assets/aiki-keys/option_b_4keys.svg')
    expect(html).toContain('/assets/aiki-keys/option_c_4keys.svg')
  })

  it('calls onChange with updated question when user types', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    const handleChange = vi.fn()

    act(() => {
      root.render(
        <ConfirmGoalStageEditor
          confirmGoal={mockConfirmGoal}
          onChange={handleChange}
          previewAikiVoice={() => {}}
        />
      )
    })

    const questionInput = container.querySelector('textarea') as HTMLTextAreaElement
    expect(questionInput).not.toBeNull()

    act(() => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set
      nativeSetter?.call(questionInput, 'Câu hỏi mới?')
      questionInput.dispatchEvent(new Event('input', { bubbles: true }))
      questionInput.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ question: 'Câu hỏi mới?' }))
  })

  it('allows switching correctIndex via radio button', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    const handleChange = vi.fn()

    act(() => {
      root.render(
        <ConfirmGoalStageEditor
          confirmGoal={mockConfirmGoal}
          onChange={handleChange}
          previewAikiVoice={() => {}}
        />
      )
    })

    const radioButtons = container.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>
    expect(radioButtons.length).toBe(3)
    expect(radioButtons[1].checked).toBe(true) // Option B is correct

    act(() => {
      radioButtons[0].click()
    })

    expect(handleChange).toHaveBeenCalledWith({ correctIndex: 0 })
  })

  it('allows adding a new option with preset image', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    const handleChange = vi.fn()
    const handleToast = vi.fn()

    act(() => {
      root.render(
        <ConfirmGoalStageEditor
          confirmGoal={mockConfirmGoal}
          onChange={handleChange}
          previewAikiVoice={() => {}}
          showToast={handleToast}
        />
      )
    })

    const addBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('+ Thêm phương án')
    )
    expect(addBtn).toBeDefined()

    act(() => {
      addBtn?.click()
    })

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.arrayContaining([
          ...mockConfirmGoal.options,
          expect.objectContaining({
            id: 'opt-d',
            text: 'Bộ chìa khoá D',
          }),
        ]),
      })
    )
    expect(handleToast).toHaveBeenCalledWith('Đã thêm Phương án D!', 'success')
  })

  it('prevents removing options below minimum of 2', () => {
    const twoOptionsGoal: SixStageConfirmGoal = {
      ...mockConfirmGoal,
      options: [mockConfirmGoal.options[0], mockConfirmGoal.options[1]],
    }

    container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    const handleChange = vi.fn()
    const handleToast = vi.fn()

    act(() => {
      root.render(
        <ConfirmGoalStageEditor
          confirmGoal={twoOptionsGoal}
          onChange={handleChange}
          previewAikiVoice={() => {}}
          showToast={handleToast}
        />
      )
    })

    // Trash button should not be present when only 2 options exist
    const trashButtons = container.querySelectorAll('button[title="Xóa phương án này"]')
    expect(trashButtons.length).toBe(0)
  })

  it('allows selecting preset image for an option', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    const handleChange = vi.fn()

    act(() => {
      root.render(
        <ConfirmGoalStageEditor
          confirmGoal={mockConfirmGoal}
          onChange={handleChange}
          previewAikiVoice={() => {}}
        />
      )
    })

    const presetButtons = Array.from(container.querySelectorAll('button')).filter((b) =>
      b.textContent?.includes('Bộ Chìa B - ĐÚNG (SVG)')
    )
    expect(presetButtons.length).toBeGreaterThan(0)

    act(() => {
      presetButtons[0].click()
    })

    expect(handleChange).toHaveBeenCalledWith({
      options: [
        { ...mockConfirmGoal.options[0], imageUrl: '/assets/aiki-keys/option_b_4keys.svg' },
        mockConfirmGoal.options[1],
        mockConfirmGoal.options[2],
      ],
    })
  })
})

describe('StudentStagePreview Stage 2 Option Image Rendering', () => {
  it('renders 1 image per option with SVG path and correct order A -> B -> C', () => {
    const mockJourney: Partial<LessonSixStageJourney> = {
      stage1_goal: {
        id: 'goal-stage-1',
        title: 'Bốn chiếc chìa khoá',
        speech: 'Chào bé!',
        imageUrl: '/assets/aiki-islands/island1_lesson2_keys_v2.jpg',
        goalText: 'Bé nắm vững 4 chìa khóa',
        keyPoints: ['Cái gì', 'Trông thế nào', 'Đang làm gì', 'Ở đâu'],
      },
      stage2_confirmGoal: {
        id: 'confirm-test-stage',
        question: 'Bộ chìa khoá nào mở được một câu lệnh tốt?',
        speech: 'Nhớ lại 4 chiếc chìa khóa nào bé ơi!',
        options: [
          { id: 'opt-a', text: 'Bộ chìa khoá A', imageUrl: '/assets/aiki-keys/option_a_4keys.svg' },
          { id: 'opt-b', text: 'Bộ chìa khoá B', imageUrl: '/assets/aiki-keys/option_b_4keys.svg' },
          { id: 'opt-c', text: 'Bộ chìa khoá C', imageUrl: '/assets/aiki-keys/option_c_4keys.svg' },
        ],
        correctIndex: 1,
        explanation: 'CÔNG THỨC 4 CHÌA KHOÁ: Cái gì · Trông như thế nào · Đang làm gì · Ở đâu',
      },
    }

    const html = renderToStaticMarkup(
      <StudentStagePreview
        isIsland={true}
        sixStageJourney={mockJourney as LessonSixStageJourney}
        stageIndex={1}
      />
    )

    // Verify Chặng 2 Title
    expect(html).toContain('Chặng 2: Xác nhận mục tiêu')
    expect(html).toContain('Bộ chìa khoá nào mở được một câu lệnh tốt?')

    // Verify all 3 options exist
    expect(html).toContain('Ổ Khóa A')
    expect(html).toContain('Ổ Khóa B [ĐÚNG]')
    expect(html).toContain('Ổ Khóa C')

    // Verify option images are rendered
    expect(html).toContain('src="/assets/aiki-keys/option_a_4keys.svg"')
    expect(html).toContain('src="/assets/aiki-keys/option_b_4keys.svg"')
    expect(html).toContain('src="/assets/aiki-keys/option_c_4keys.svg"')

    // Verify B is marked correct
    expect(html).toContain('ĐÚNG')
    expect(html).toContain('✓ Mở Rương Thần Kỳ')
  })
})
