// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi, afterEach } from 'vitest'
import {
  LectureDrawerHeader,
  ISLAND_6_STAGE_SECTIONS,
  AIKI_SECTIONS,
  STANDARD_SECTIONS,
} from './LectureDrawerHeader'
import type { LectureDraft } from '../../lib/authoring'

const mockDraft: LectureDraft = {
  id: 'lec-test-1',
  title: 'Bài học Thám hiểm AI',
  skill: 'Kỹ năng AI',
  hook: 'Mở đầu bài học',
  practiceKind: 'journal',
  videoUrl: '',
  concept: 'Khái niệm AI',
  example: 'Ví dụ AI',
  learnCards: [],
  reward: '',
  duration: '',
  goalsText: '',
  gameType: 'math-kids',
  gameMode: 'required',
  gameAllowedTypes: ['math-kids'],
  gameDifficulty: 'steady',
  gameInstruction: '',
  gameOutcome: '',
  gameCardsText: '',
  gameStructuredText: '',
  questionCount: 6,
  practiceInstruction: '',
  product: '',
  practiceStepsText: '',
  successCriteriaText: '',
  reflectionPrompt: '',
  practiceConfigText: '',
  checkQuestions: [],
  checkQuestion: '',
  checkOption1: '',
  checkOption2: '',
  checkOption3: '',
  correctIndex: '0',
  checkExplain: '',
  lessonFormat: 'aiki-island-6steps',
}

describe('LectureDrawerHeader Section Navigation Stepper', () => {
  let container: HTMLDivElement | null = null
  let root: ReturnType<typeof createRoot> | null = null

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount()
      })
      root = null
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
      container = null
    }
  })

  it('standardizes ISLAND_6_STAGE_SECTIONS with precise labels, shortLabels, and fullTitles', () => {
    const stage0 = ISLAND_6_STAGE_SECTIONS.find((s) => s.id === 'stage-0')
    const stage1 = ISLAND_6_STAGE_SECTIONS.find((s) => s.id === 'stage-1')
    const stage2 = ISLAND_6_STAGE_SECTIONS.find((s) => s.id === 'stage-2')
    const stage3 = ISLAND_6_STAGE_SECTIONS.find((s) => s.id === 'stage-3')
    const stage4 = ISLAND_6_STAGE_SECTIONS.find((s) => s.id === 'stage-4')
    const stage5 = ISLAND_6_STAGE_SECTIONS.find((s) => s.id === 'stage-5')

    expect(stage0).toBeDefined()
    expect(stage0?.label).toBe('1. 🎯 Mục tiêu')
    expect(stage0?.shortLabel).toBe('Mục tiêu')
    expect(stage0?.fullTitle).toBe('1. 🎯 Mục tiêu bài học (Ảnh minh họa)')

    expect(stage1).toBeDefined()
    expect(stage1?.label).toBe('2. ❓ Xác nhận')
    expect(stage1?.shortLabel).toBe('Khởi động')
    expect(stage1?.fullTitle).toBe('2. ❓ Xác nhận (1 câu hỏi khởi động)')

    expect(stage2).toBeDefined()
    expect(stage2?.label).toBe('3. 🎬 Video')
    expect(stage2?.shortLabel).toBe('Video')
    expect(stage2?.fullTitle).toBe('3. 🎬 Video bài giảng YouTube / MP4')

    expect(stage3).toBeDefined()
    expect(stage3?.label).toBe('4. 🧩 Trắc nghiệm')
    expect(stage3?.shortLabel).toBe('Câu hỏi')
    expect(stage3?.fullTitle).toBe('4. 🧩 Bộ câu hỏi trắc nghiệm kiểm tra')

    expect(stage4).toBeDefined()
    expect(stage4?.label).toBe('5. 🎨 Thực hành')
    expect(stage4?.shortLabel).toBe('Thực hành')
    expect(stage4?.fullTitle).toBe('5. 🎨 Kịch bản thực hành AI Studio')

    expect(stage5).toBeDefined()
    expect(stage5?.label).toBe('6. 🏆 Kết thúc')
    expect(stage5?.shortLabel).toBe('Kết thúc')
    expect(stage5?.fullTitle).toBe('6. 🏆 Màn kết thúc, trao sao & huy hiệu')
  })

  it('renders dedicated "Thông tin trạm" button on top row and 6-stage full-width stepper when isIslandCourse=true', () => {
    const onSelectSection = vi.fn()
    const sectionStatus = vi.fn().mockReturnValue(false)
    const sectionMissing = vi.fn().mockReturnValue([])

    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    act(() => {
      root?.render(
        <LectureDrawerHeader
          uid="drawer-test"
          draft={mockDraft}
          isEdit={true}
          isIslandCourse={true}
          lessonFormat="aiki-island-6steps"
          activeSection="stage-0"
          readiness={{ completed: 1, total: 6, complete: false }}
          showInlinePreview={false}
          recovery={null}
          draftStorageKey="key"
          onRequestClose={vi.fn()}
          onShowFullPreview={vi.fn()}
          onToggleInlinePreview={vi.fn()}
          onFormatChange={vi.fn()}
          onSelectSection={onSelectSection}
          onDiscardRecovery={vi.fn()}
          onApplyRecovery={vi.fn()}
          sectionStatus={sectionStatus}
          sectionMissing={sectionMissing}
        />
      )
    })

    const buttons = Array.from(container.querySelectorAll('button'))

    // Dedicated Station Info button in top bar
    const basicsBtn = buttons.find((b) => b.textContent?.includes('Thông tin trạm'))
    expect(basicsBtn).toBeDefined()

    // Stepper has all 6 stages rendered simultaneously
    expect(buttons.some((b) => b.textContent?.includes('1. 🎯 Mục tiêu'))).toBe(true)
    expect(buttons.some((b) => b.textContent?.includes('2. ❓ Xác nhận'))).toBe(true)
    expect(buttons.some((b) => b.textContent?.includes('3. 🎬 Video'))).toBe(true)
    expect(buttons.some((b) => b.textContent?.includes('4. 🧩 Trắc nghiệm'))).toBe(true)
    expect(buttons.some((b) => b.textContent?.includes('5. 🎨 Thực hành'))).toBe(true)
    expect(buttons.some((b) => b.textContent?.includes('6. 🏆 Kết thúc'))).toBe(true)

    // Clicking a stage calls onSelectSection
    const stage2Btn = buttons.find((b) => b.textContent?.includes('3. 🎬 Video'))
    expect(stage2Btn).toBeDefined()
    act(() => {
      stage2Btn?.click()
    })
    expect(onSelectSection).toHaveBeenCalledWith('stage-2')

    // Clicking basics button calls onSelectSection('basics')
    act(() => {
      basicsBtn?.click()
    })
    expect(onSelectSection).toHaveBeenCalledWith('basics')
  })

  it('highlights basics button with active styling when activeSection is basics', () => {
    const sectionStatus = vi.fn().mockReturnValue(true)
    const sectionMissing = vi.fn().mockReturnValue([])

    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    act(() => {
      root?.render(
        <LectureDrawerHeader
          uid="drawer-test"
          draft={mockDraft}
          isEdit={true}
          isIslandCourse={true}
          lessonFormat="aiki-island-6steps"
          activeSection="basics"
          readiness={{ completed: 6, total: 6, complete: true }}
          showInlinePreview={false}
          recovery={null}
          draftStorageKey="key"
          onRequestClose={vi.fn()}
          onShowFullPreview={vi.fn()}
          onToggleInlinePreview={vi.fn()}
          onFormatChange={vi.fn()}
          onSelectSection={vi.fn()}
          onDiscardRecovery={vi.fn()}
          onApplyRecovery={vi.fn()}
          sectionStatus={sectionStatus}
          sectionMissing={sectionMissing}
        />
      )
    })

    const buttons = Array.from(container.querySelectorAll('button'))
    const basicsBtn = buttons.find((b) => b.textContent?.includes('Thông tin trạm'))
    expect(basicsBtn).toBeDefined()
    expect(basicsBtn?.className).toContain('bg-brand-100')
    expect(basicsBtn?.className).toContain('font-black')
  })

  it('displays warning badge when section has missing required fields', () => {
    const sectionStatus = vi.fn().mockImplementation((sec) => sec !== 'stage-3')
    const sectionMissing = vi.fn().mockImplementation((sec) => (sec === 'stage-3' ? ['Chưa tạo câu hỏi trắc nghiệm'] : []))

    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    act(() => {
      root?.render(
        <LectureDrawerHeader
          uid="drawer-test"
          draft={mockDraft}
          isEdit={true}
          isIslandCourse={true}
          lessonFormat="aiki-island-6steps"
          activeSection="stage-0"
          readiness={{ completed: 5, total: 6, complete: false }}
          showInlinePreview={false}
          recovery={null}
          draftStorageKey="key"
          onRequestClose={vi.fn()}
          onShowFullPreview={vi.fn()}
          onToggleInlinePreview={vi.fn()}
          onFormatChange={vi.fn()}
          onSelectSection={vi.fn()}
          onDiscardRecovery={vi.fn()}
          onApplyRecovery={vi.fn()}
          sectionStatus={sectionStatus}
          sectionMissing={sectionMissing}
        />
      )
    })

    const buttons = Array.from(container.querySelectorAll('button'))
    const stage3Btn = buttons.find((b) => b.textContent?.includes('4. 🧩 Trắc nghiệm'))
    expect(stage3Btn).toBeDefined()
    expect(stage3Btn?.textContent).toContain('1')
  })

  it('prevents accidental section change during mouse drag when distance exceeds 5px', () => {
    const onSelectSection = vi.fn()

    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    act(() => {
      root?.render(
        <LectureDrawerHeader
          uid="drawer-test"
          draft={mockDraft}
          isEdit={true}
          isIslandCourse={true}
          lessonFormat="aiki-island-6steps"
          activeSection="stage-0"
          readiness={{ completed: 1, total: 6, complete: false }}
          showInlinePreview={false}
          recovery={null}
          draftStorageKey="key"
          onRequestClose={vi.fn()}
          onShowFullPreview={vi.fn()}
          onToggleInlinePreview={vi.fn()}
          onFormatChange={vi.fn()}
          onSelectSection={onSelectSection}
          onDiscardRecovery={vi.fn()}
          onApplyRecovery={vi.fn()}
          sectionStatus={vi.fn().mockReturnValue(true)}
          sectionMissing={vi.fn().mockReturnValue([])}
        />
      )
    })

    const scrollContainer = container.querySelector('.overflow-x-auto') as HTMLDivElement
    expect(scrollContainer).toBeDefined()

    // Simulate drag start at pageX: 100
    act(() => {
      scrollContainer.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100 }))
    })

    // Simulate drag move to pageX: 150 (distance 50px > 5px threshold)
    act(() => {
      scrollContainer.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 150 }))
    })

    const buttons = Array.from(container.querySelectorAll('button'))
    const stage1Btn = buttons.find((b) => b.textContent?.includes('2. ❓ Xác nhận'))
    expect(stage1Btn).toBeDefined()

    // Click during or right after drag should be suppressed
    act(() => {
      stage1Btn?.click()
    })

    // Should not call onSelectSection due to drag threshold
    expect(onSelectSection).not.toHaveBeenCalled()
  })

  it('calls scrollIntoView when active tab changes', () => {
    const scrollIntoViewMock = vi.fn()
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock

    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    act(() => {
      root?.render(
        <LectureDrawerHeader
          uid="drawer-test"
          draft={mockDraft}
          isEdit={true}
          isIslandCourse={true}
          lessonFormat="aiki-island-6steps"
          activeSection="stage-2"
          readiness={{ completed: 2, total: 6, complete: false }}
          showInlinePreview={false}
          recovery={null}
          draftStorageKey="key"
          onRequestClose={vi.fn()}
          onShowFullPreview={vi.fn()}
          onToggleInlinePreview={vi.fn()}
          onFormatChange={vi.fn()}
          onSelectSection={vi.fn()}
          onDiscardRecovery={vi.fn()}
          onApplyRecovery={vi.fn()}
          sectionStatus={vi.fn().mockReturnValue(false)}
          sectionMissing={vi.fn().mockReturnValue([])}
        />
      )
    })

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  })

  it('renders standard/AIKI sections when isIslandCourse is false', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    act(() => {
      root?.render(
        <LectureDrawerHeader
          uid="drawer-test"
          draft={mockDraft}
          isEdit={true}
          isIslandCourse={false}
          lessonFormat="aiki-rule-5steps"
          activeSection="stage-0"
          readiness={{ completed: 1, total: 5, complete: false }}
          showInlinePreview={false}
          recovery={null}
          draftStorageKey="key"
          onRequestClose={vi.fn()}
          onShowFullPreview={vi.fn()}
          onToggleInlinePreview={vi.fn()}
          onFormatChange={vi.fn()}
          onSelectSection={vi.fn()}
          onDiscardRecovery={vi.fn()}
          onApplyRecovery={vi.fn()}
          sectionStatus={vi.fn().mockReturnValue(false)}
          sectionMissing={vi.fn().mockReturnValue([])}
        />
      )
    })

    const buttons = Array.from(container.querySelectorAll('button'))
    expect(buttons.some((b) => b.textContent?.includes('1. Tình huống'))).toBe(true)
    expect(buttons.some((b) => b.textContent?.includes('2. Câu đố'))).toBe(true)
    expect(buttons.some((b) => b.textContent?.includes('3. Quy tắc'))).toBe(true)
    expect(buttons.some((b) => b.textContent?.includes('4. Giải thích'))).toBe(true)
    expect(buttons.some((b) => b.textContent?.includes('5. Chốt'))).toBe(true)
    expect(buttons.some((b) => b.textContent?.includes('Xem song song'))).toBe(true)
  })

  it('renders custom 3-stage journey stepper correctly when customJourneyStages provides 3 steps', () => {
    const custom3Stages = [
      { id: 'stage-0', index: 0, title: '1. Khởi động AI', shortTitle: 'Khởi động', iconName: 'Target' },
      { id: 'stage-1', index: 1, title: '2. Thử tài Prompt', shortTitle: 'Prompt', iconName: 'Palette' },
      { id: 'stage-2', index: 2, title: '3. Tốt nghiệp Mini', shortTitle: 'Tốt nghiệp', iconName: 'Trophy' },
    ]

    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    act(() => {
      root?.render(
        <LectureDrawerHeader
          uid="drawer-test"
          draft={{ ...mockDraft, customJourneyStages: custom3Stages }}
          isEdit={true}
          isIslandCourse={false}
          lessonFormat="standard"
          activeSection="stage-0"
          readiness={{ completed: 1, total: 3, complete: false }}
          showInlinePreview={false}
          recovery={null}
          draftStorageKey="key"
          customJourneyStages={custom3Stages}
          onRequestClose={vi.fn()}
          onShowFullPreview={vi.fn()}
          onToggleInlinePreview={vi.fn()}
          onFormatChange={vi.fn()}
          onSelectSection={vi.fn()}
          onDiscardRecovery={vi.fn()}
          onApplyRecovery={vi.fn()}
          sectionStatus={vi.fn().mockReturnValue(false)}
          sectionMissing={vi.fn().mockReturnValue([])}
        />
      )
    })

    const buttons = Array.from(container.querySelectorAll('button'))
    expect(buttons.some((b) => b.textContent?.includes('1. Khởi động AI'))).toBe(true)
    expect(buttons.some((b) => b.textContent?.includes('2. Thử tài Prompt'))).toBe(true)
    expect(buttons.some((b) => b.textContent?.includes('3. Tốt nghiệp Mini'))).toBe(true)
  })

  it('renders custom 7-stage journey stepper correctly when customJourneyStages provides 7 steps', () => {
    const custom7Stages = Array.from({ length: 7 }, (_, i) => ({
      id: `stage-${i}`,
      index: i,
      title: `${i + 1}. Chặng nâng cao ${i + 1}`,
      shortTitle: `Chặng ${i + 1}`,
      iconName: 'Target',
    }))

    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    act(() => {
      root?.render(
        <LectureDrawerHeader
          uid="drawer-test"
          draft={{ ...mockDraft, customJourneyStages: custom7Stages }}
          isEdit={true}
          isIslandCourse={false}
          lessonFormat="standard"
          activeSection="stage-0"
          readiness={{ completed: 1, total: 7, complete: false }}
          showInlinePreview={false}
          recovery={null}
          draftStorageKey="key"
          customJourneyStages={custom7Stages}
          onRequestClose={vi.fn()}
          onShowFullPreview={vi.fn()}
          onToggleInlinePreview={vi.fn()}
          onFormatChange={vi.fn()}
          onSelectSection={vi.fn()}
          onDiscardRecovery={vi.fn()}
          onApplyRecovery={vi.fn()}
          sectionStatus={vi.fn().mockReturnValue(false)}
          sectionMissing={vi.fn().mockReturnValue([])}
        />
      )
    })

    const buttons = Array.from(container.querySelectorAll('button'))
    for (let i = 1; i <= 7; i++) {
      expect(buttons.some((b) => b.textContent?.includes(`${i}. Chặng nâng cao ${i}`))).toBe(true)
    }
  })
})


