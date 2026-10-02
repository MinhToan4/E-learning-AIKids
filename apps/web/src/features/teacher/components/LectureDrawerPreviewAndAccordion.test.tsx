// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi, afterEach } from 'vitest'
import {
  PracticeWorkflowStepsAccordion,
  StudentStagePreview,
  StudentBasicsPreview,
  CollapsedPreviewRail,
  LectureDrawer,
  CREATIVE_ENGINES,
  emptyDraft,
  DEFAULT_PRACTICE_PARTS,
  DEFAULT_FOUR_KEYS_OPTIONS,
  buildRuleSyntheticJourney,
} from './LectureDrawer'
import { DEFAULT_NOTEBOOK_CONFIGS } from '@/features/lesson/data/island-curriculum-registry'
import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'
import type { LessonSixStageJourney } from '@/shared/lib/api'

describe('PracticeWorkflowStepsAccordion Component', () => {
  const mockWorkflowSteps = [
    { step: 1, title: 'Bé vẽ món đồ chính', quickPrompt: 'vẽ cốc sứ', akiSpeech: 'Bé hãy vẽ một chiếc cốc nhé!', instruction: 'Vẽ nét chính' },
    { step: 2, title: 'Bé thêm chi tiết bề mặt', quickPrompt: 'thêm men bóng', akiSpeech: 'Thêm men bóng nữa nào!', instruction: 'Tô bề mặt' },
    { step: 3, title: 'Bé thêm hành động', quickPrompt: 'bốc khói nghi ngút', akiSpeech: 'Khói bốc lên ấm áp quá!', instruction: 'Thêm chuyển động' },
    { step: 4, title: 'Bé đặt vào khung cảnh', quickPrompt: 'trên bàn gỗ', akiSpeech: 'Đặt cốc lên bàn thật đẹp!', instruction: 'Hoàn thiện bối cảnh' },
  ]

  it('renders accordion in collapsed state by default with title and refined note', () => {
    const html = renderToStaticMarkup(
      <PracticeWorkflowStepsAccordion
        workflowSteps={mockWorkflowSteps}
        onChange={() => {}}
      />
    )

    // Tiêu đề khối Accordion
    expect(html).toContain('Lời thoại &amp; Gợi ý từng lượt của AIKI (Nâng cao)')
    expect(html).toContain('4 lượt')

    // Dòng chú thích tinh tế
    expect(html).toContain('Gợi ý câu lệnh nhanh xuất hiện trên thanh prompt')
    expect(html).toContain('lời thoại động viên của AIKI qua các lượt vẽ của bé')

    // Mặc định đóng: aria-expanded="false", không render form input của các bước
    expect(html).toContain('aria-expanded="false"')
    expect(html).not.toContain('Tên bước kịch bản')
  })
})

const mockJourney = {
  stage1_goal: {
    title: 'Học cách tả chiếc cốc với 4 Chìa Khóa',
    imageUrl: '/assets/aiki-islands/island1_lesson2_teacup.jpg',
    goalText: 'Bé sẽ nắm được 4 Chìa Khóa Vàng để tạo nên một câu lệnh vẽ hoàn hảo.',
    keyPoints: ['Cái gì', 'Trông thế nào', 'Đang làm gì', 'Ở đâu'],
    durationSec: 60,
  },
  stage2_confirmGoal: {
    question: 'Bộ chìa khoá nào mở được một câu lệnh tốt?',
    options: [
      { id: 'opt-a', text: 'Bộ chìa khoá A: Ai vẽ · Vẽ lúc nào · Vẽ ở đâu · Vẽ bằng gì' },
      { id: 'opt-b', text: 'Bộ chìa khoá B: Cái gì · Trông như thế nào · Đang làm gì · Ở đâu' },
      { id: 'opt-c', text: 'Bộ chìa khoá C: Cái gì · Màu gì · To hay nhỏ · Của ai' },
    ],
    correctIndex: 1,
    explanation: 'Bộ B gồm đúng 4 câu hỏi vàng giúp AI vẽ chuẩn nhất!',
  },
  stage3_video: {
    title: 'Video Bài Học 4 Chìa Khóa',
    videoUrl: 'https://youtube.com/watch?v=mock',
    durationSec: 180,
    posterUrl: '/assets/poster.jpg',
    timestamps: [{ label: 'Mở đầu', startSec: 0, endSec: 60 }],
  },
  stage4_quiz: {
    title: 'Thử tài cùng AIKI',
    passScore: 1,
    questions: [
      {
        id: 'q1',
        prompt: 'Chìa khóa số 1 là gì?',
        options: ['Cái gì?', 'Ở đâu?'],
        correctIndex: 0,
      },
    ],
  },
  stage5_practice: {
    subjectName: 'Chiếc cốc sứ ấm áp',
    badge: 'Cốc Sứ Diệu Kỳ',
    akiMotto: 'Tả đủ 4 Chìa Khóa, tranh hiện ra ngay!',
    sampleUrl: '/assets/sample.jpg',
    lockedFeatures: ['Men sứ trắng tinh', 'Miệng cốc mẻ nhẹ', 'Quai cầm uốn cong'],
    workflowSteps: [
      { step: 1, title: 'Bước 1', quickPrompt: 'cốc', akiSpeech: 'Chào bé!', instruction: 'Vẽ' },
    ],
    practiceParts: DEFAULT_PRACTICE_PARTS,
    fourKeysOptions: DEFAULT_FOUR_KEYS_OPTIONS,
  },
  stage6_completion: {
    title: 'Chúc Mừng Bé!',
    congratsMessage: 'Bé đã hoàn thành xuất sắc bài học!',
    rewardBadge: { stars: 3, xp: 50 },
  },
} as unknown as LessonSixStageJourney

describe('StudentStagePreview Component — Viewport Selector & Fullscreen Preview', () => {

  it('renders preview header with Viewport Selector buttons and Fullscreen button', () => {
    const html = renderToStaticMarkup(
      <StudentStagePreview
        isIsland={true}
        sixStageJourney={mockJourney}
        stageIndex={0}
      />
    )

    // Header title & badge
    expect(html).toContain('Xem trước học sinh')
    expect(html).toContain('Chặng 1/6')

    // Viewport selector buttons
    expect(html).toContain('Mobile')
    expect(html).toContain('iPad')
    expect(html).toContain('PC')

    // Nút nổi bật Toàn màn hình
    expect(html).toContain('Toàn màn hình')
  })

  it('renders Stage 2 (Confirm) with standard ConfirmStageBlock and 3 option sets', () => {
    const html = renderToStaticMarkup(
      <StudentStagePreview
        isIsland={true}
        sixStageJourney={mockJourney}
        stageIndex={1}
      />
    )

    expect(html).toContain('Chặng 2: Xác nhận mục tiêu')
    expect(html).toContain('data-testid="stage-1-confirm"')
    expect(html).toContain('Bộ chìa khoá nào mở được một câu lệnh tốt?')
    expect(html).toContain('Bộ chìa khoá A')
    expect(html).toContain('Bộ chìa khoá B')
    expect(html).toContain('Bộ chìa khoá C')
  })

  it('renders Stage 5 (Practice AI Studio) with standard PracticeStageBlock', () => {
    const html = renderToStaticMarkup(
      <StudentStagePreview
        isIsland={true}
        sixStageJourney={mockJourney}
        stageIndex={4}
      />
    )

    expect(html).toContain('data-testid="stage-4-practice"')
  })

  it('renders Fullscreen Modal with light theme Soft Clay header, light backdrop, and realistic phone frame for mobile', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(
        <StudentStagePreview
          isIsland={true}
          sixStageJourney={mockJourney}
          stageIndex={0}
        />
      )
    })

    // Click "Toàn màn hình" button to open modal
    const fullscreenBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Toàn màn hình')
    )
    expect(fullscreenBtn).toBeDefined()

    act(() => {
      fullscreenBtn?.click()
    })

    // Modal dialog exists
    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()

    // 1. Light backdrop
    expect(dialog?.className).toContain('bg-slate-900/25')
    expect(dialog?.className).toContain('backdrop-blur-md')

    // 2. Light header Soft Clay
    const header = dialog?.querySelector('header')
    expect(header).not.toBeNull()
    expect(header?.className).toContain('bg-white/95')
    expect(header?.className).toContain('border-border/80')
    expect(header?.className).toContain('text-slate-900')
    expect(header?.className).toContain('shadow-2xs')

    // 3. Modal title
    expect(header?.textContent).toContain('Xem trước học sinh:')
    expect(header?.textContent).toContain('1. 🎯 Mục tiêu (Ảnh)')

    // 4. Device selector buttons
    const mobileBtn = Array.from(dialog?.querySelectorAll('button') ?? []).find(
      (b) => b.textContent?.includes('375px')
    )
    expect(mobileBtn).toBeDefined()
    expect(mobileBtn?.className).toContain('bg-brand-500')
    expect(mobileBtn?.className).toContain('text-white')

    const tabletBtn = Array.from(dialog?.querySelectorAll('button') ?? []).find(
      (b) => b.textContent?.includes('768px')
    )
    expect(tabletBtn).toBeDefined()
    expect(tabletBtn?.className).toContain('bg-slate-100')
    expect(tabletBtn?.className).toContain('text-slate-700')

    // 5. Close button
    const closeBtn = Array.from(dialog?.querySelectorAll('button') ?? []).find(
      (b) => b.textContent?.includes('✕ Đóng (Esc)')
    )
    expect(closeBtn).toBeDefined()
    expect(closeBtn?.className).toContain('bg-slate-100')
    expect(closeBtn?.className).toContain('text-slate-700')

    // 6. Canvas area has warm gray bg
    const canvasArea = dialog?.querySelector('.flex-1.overflow-y-auto')
    expect(canvasArea?.className).toContain('bg-slate-100/70')

    // 7. Realistic phone frame for active mobile view
    const phoneFrame = canvasArea?.querySelector('.rounded-\\[2\\.5rem\\]')
    expect(phoneFrame).not.toBeNull()
    expect(phoneFrame?.className).toContain('w-[375px]')
    expect(phoneFrame?.className).toContain('border-[6px]')
    expect(phoneFrame?.className).toContain('border-slate-300')
    expect(phoneFrame?.className).toContain('shadow-2xl')

    // Notch/speaker bar
    const notchBar = phoneFrame?.querySelector('.h-5')
    expect(notchBar).not.toBeNull()
    expect(notchBar?.className).toContain('bg-slate-100')
    expect(notchBar?.className).toContain('border-b')

    // Inner scroll container inside phone
    const innerScroll = phoneFrame?.querySelector('.overflow-y-auto')
    expect(innerScroll).not.toBeNull()
    expect(innerScroll?.className).toContain('max-h-[75vh]')
    expect(innerScroll?.className).toContain('p-3')

    // 8. In mobile view, SixStageGoalStage uses compact={true} (single column grid-cols-1 for keys)
    const keysGrid = innerScroll?.querySelector('.grid-cols-1')
    expect(keysGrid).not.toBeNull()

    // 9. Switch to Tablet: verify iPad frame
    act(() => {
      tabletBtn?.click()
    })
    const ipadFrame = canvasArea?.querySelector('.w-\\[768px\\]')
    expect(ipadFrame).not.toBeNull()
    expect(ipadFrame?.className).toContain('border-4')
    expect(ipadFrame?.className).toContain('border-slate-300')

    // 10. Switch to PC: verify PC frame
    const pcBtn = Array.from(dialog?.querySelectorAll('button') ?? []).find(
      (b) => b.textContent?.includes('1200px')
    )
    act(() => {
      pcBtn?.click()
    })
    const pcFrame = canvasArea?.querySelector('.max-w-\\[1240px\\]')
    expect(pcFrame).not.toBeNull()
    expect(pcFrame?.className).toContain('border-2')
    expect(pcFrame?.className).toContain('border-slate-200')

    // 11. Close modal
    act(() => {
      closeBtn?.click()
    })
    expect(container.querySelector('[role="dialog"]')).toBeNull()

    act(() => {
      root.unmount()
    })
    container.remove()
  })
})

describe('StudentStagePreview Component — Stage 2 Video Milestone Stepper Bar', () => {
  const defaultVideoJourney = {
    stage1_goal: {
      title: 'Mục tiêu',
      imageUrl: '/assets/goal.jpg',
      goalText: 'Mục tiêu',
      keyPoints: ['Key 1', 'Key 2'],
      durationSec: 60,
    },
    stage2_confirmGoal: {
      question: 'Xác nhận',
      options: [{ id: 'opt-a', text: 'Option A' }],
      correctIndex: 0,
      explanation: 'Giải thích',
    },
    stage3_video: {
      title: 'Video Bài Học 4 Chìa Khóa Vàng',
      videoUrl: 'https://youtube.com/watch?v=mock',
      durationSec: 180,
      posterUrl: '/assets/poster.jpg',
      timestamps: [],
    },
    stage4_quiz: {
      title: 'Quiz',
      passScore: 1,
      questions: [],
    },
    stage5_practice: {
      subjectName: 'Thực hành',
      badge: 'Badge',
      akiMotto: 'Motto',
      sampleUrl: '',
      lockedFeatures: [],
      workflowSteps: [],
      practiceParts: DEFAULT_PRACTICE_PARTS,
      fourKeysOptions: DEFAULT_FOUR_KEYS_OPTIONS,
    },
    stage6_completion: {
      title: 'Hoàn thành',
      congratsMessage: 'Chúc mừng',
      rewardBadge: { stars: 3, xp: 50 },
    },
  } as unknown as LessonSixStageJourney

  it('renders video stage block with VideoStageBlock, play button and timeline slider', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(
        <StudentStagePreview
          isIsland={true}
          sixStageJourney={defaultVideoJourney}
          stageIndex={2}
        />
      )
    })

    // Header & Video block
    expect(container.querySelector('[data-testid="stage-2-video"]')).not.toBeNull()
    expect(container.textContent).toContain('Video Bài Học 4 Chìa Khóa Vàng')
    expect(container.textContent).toContain('0:00 / 3:00')

    // Timeline slider
    const slider = container.querySelector('[aria-label="Thanh tua thời gian video"]')
    expect(slider).not.toBeNull()

    // Nút tua lại
    const rewindBtn = container.querySelector('[aria-label="Tua lại từ đầu"]')
    expect(rewindBtn).not.toBeNull()

    // Nút xem toàn màn hình
    const fullscreenBtn = container.querySelector('[aria-label="Xem toàn màn hình"]')
    expect(fullscreenBtn).not.toBeNull()

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('renders video timeline slider with proper max duration and interactive seek capability', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(
        <StudentStagePreview
          isIsland={true}
          sixStageJourney={defaultVideoJourney}
          stageIndex={2}
        />
      )
    })

    const slider = container.querySelector('[aria-label="Thanh tua thời gian video"]') as HTMLInputElement
    expect(slider).not.toBeNull()
    expect(slider.max).toBe('180')
    expect(slider.value).toBe('0')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('renders video action footer with rewind button and continue button', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(
        <StudentStagePreview
          isIsland={true}
          sixStageJourney={defaultVideoJourney}
          stageIndex={2}
        />
      )
    })

    const actionFooter = container.querySelector('[data-testid="video-action-footer"]')
    expect(actionFooter).not.toBeNull()
    expect(actionFooter?.textContent).toContain('Tua lại')
    expect(actionFooter?.textContent).toContain('Làm bài test')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('supports custom timestamps when provided in stage3_video', () => {
    const customJourney = {
      ...defaultVideoJourney,
      stage3_video: {
        title: 'Video tùy biến',
        videoUrl: 'https://youtube.com/watch?v=custom',
        durationSec: 120,
        timestamps: [
          { label: 'Phần mở', startSec: 0, endSec: 40 },
          { label: 'Phần giữa', startSec: 40, endSec: 80 },
          { label: 'Phần kết', startSec: 80, endSec: 120 },
        ],
      },
    } as unknown as LessonSixStageJourney

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(
        <StudentStagePreview
          isIsland={true}
          sixStageJourney={customJourney}
          stageIndex={2}
        />
      )
    })

    expect(container.querySelector('[data-testid="stage-2-video"]')).not.toBeNull()
    expect(container.textContent).toContain('Video tùy biến')
    expect(container.textContent).toContain('0:00 / 2:00')

    act(() => {
      root.unmount()
    })
    container.remove()
  })
})

describe('StudentStagePreview Component — Stage 6 Completion (Màn kết thúc chuẩn 100% học sinh)', () => {
  const defaultJourney = {
    stage1_goal: {
      title: 'Vẽ mèo máy thông minh',
      imageUrl: '/assets/aiki-islands/cat_masterpiece.jpg',
      goalText: 'Mục tiêu vẽ mèo',
      keyPoints: ['Cái gì', 'Màu gì'],
      durationSec: 60,
    },
    stage2_confirmGoal: {
      question: 'Câu hỏi',
      options: [{ id: 'opt-a', text: 'Option A' }],
      correctIndex: 0,
      explanation: 'Giải thích',
    },
    stage3_video: {
      title: 'Video',
      videoUrl: 'https://youtube.com/watch?v=mock',
      durationSec: 180,
      posterUrl: '',
      timestamps: [],
    },
    stage4_quiz: {
      title: 'Quiz',
      passScore: 1,
      questions: [],
    },
    stage5_practice: {
      subjectName: 'Thực hành',
      badge: 'Badge',
      akiMotto: 'Motto',
      sampleUrl: '',
      lockedFeatures: [],
      workflowSteps: [],
      practiceParts: DEFAULT_PRACTICE_PARTS,
      fourKeysOptions: DEFAULT_FOUR_KEYS_OPTIONS,
    },
    stage6_completion: {
      title: 'Chúc Mừng Chiến Binh Nhí!',
      congratsMessage: 'Bé đã xuất sắc chinh phục bài học và gom trọn bí kíp!',
      rewardBadge: {
        name: 'Huy hiệu Phù Thủy AI',
        iconUrl: '/assets/aiki-islands/custom_badge.png',
        stars: 3,
        xp: 100,
      },
      nextLessonSlug: 'bai-tiep-theo',
    },
  } as unknown as LessonSixStageJourney

  it('renders Stage 6 completion container with RewardStageBlock and congratulations card', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(
        <StudentStagePreview
          isIsland={true}
          sixStageJourney={defaultJourney}
          stageIndex={5}
        />
      )
    })

    // Container data-testid="stage-5-completion"
    const stageComplete = container.querySelector('[data-testid="stage-5-completion"]')
    expect(stageComplete).not.toBeNull()

    // Hình chúc mừng và nút phóng to
    expect(container.querySelector('img[alt="Mèo AIKI vui nhảy và tặng cúp hoàn thành bài học"]')).not.toBeNull()
    expect(container.textContent).toContain('Phóng to')

    // Tiêu đề và lời chúc
    expect(container.textContent).toContain('Chúc Mừng Chiến Binh Nhí!')
    expect(container.textContent).toContain('Bé đã xuất sắc chinh phục bài học và gom trọn bí kíp!')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('renders RewardStageBlock successfully when badge iconUrl is omitted', () => {
    const journeyWithoutBadgeIcon = {
      ...defaultJourney,
      stage6_completion: {
        ...defaultJourney.stage6_completion,
        rewardBadge: {
          name: 'Huy hiệu Mặc Định',
          stars: 3,
          xp: 50,
        },
      },
    } as unknown as LessonSixStageJourney

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(
        <StudentStagePreview
          isIsland={true}
          sixStageJourney={journeyWithoutBadgeIcon}
          stageIndex={5}
        />
      )
    })

    expect(container.querySelector('[data-testid="stage-5-completion"]')).not.toBeNull()
    expect(container.textContent).toContain('Chúc Mừng Chiến Binh Nhí!')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('renders RewardStageBlock with navigation buttons when nextLessonSlug is set or omitted', () => {
    const journeyWithoutNext = {
      ...defaultJourney,
      stage6_completion: {
        ...defaultJourney.stage6_completion,
        nextLessonSlug: undefined,
      },
    } as unknown as LessonSixStageJourney

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(
        <StudentStagePreview
          isIsland={true}
          sixStageJourney={journeyWithoutNext}
          stageIndex={5}
        />
      )
    })

    expect(container.querySelector('[data-testid="stage-5-completion"]')).not.toBeNull()

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('renders Stage 6 completion seamlessly in Fullscreen Modal across Mobile, Tablet, and PC viewports', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(
        <StudentStagePreview
          isIsland={true}
          sixStageJourney={defaultJourney}
          stageIndex={5}
        />
      )
    })

    // Inline Viewport buttons exist
    const mobileTab = Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.includes('Mobile'))
    const ipadTab = Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.includes('iPad'))
    const pcTab = Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.includes('PC'))
    expect(mobileTab).toBeDefined()
    expect(ipadTab).toBeDefined()
    expect(pcTab).toBeDefined()

    // Open Fullscreen modal
    const fullscreenBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Toàn màn hình')
    )
    expect(fullscreenBtn).toBeDefined()

    act(() => {
      fullscreenBtn?.click()
    })

    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()

    // Title shows stage 6
    expect(dialog?.querySelector('header')?.textContent).toContain('6. 🏆 Màn kết thúc')

    // Stage 6 complete elements are rendered inside the fullscreen canvas
    const stageComplete = dialog?.querySelector('[data-testid="stage-5-completion"]')
    expect(stageComplete).not.toBeNull()
    expect(stageComplete?.textContent).toContain('Chúc Mừng Chiến Binh Nhí!')

    // Close modal
    const closeBtn = Array.from(dialog?.querySelectorAll('button') ?? []).find((b) =>
      b.textContent?.includes('✕ Đóng (Esc)')
    )
    expect(closeBtn).toBeDefined()
    act(() => {
      closeBtn?.click()
    })
    expect(container.querySelector('[role="dialog"]')).toBeNull()

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('renders StudentStagePreview with PracticeStageBlock across Creative Engines while synchronizing lesson content 100%', () => {
    const journeyStylePrism = {
      ...mockJourney,
      stage5_practice: {
        ...mockJourney.stage5_practice,
        creativeEngineMode: 'style-prism',
      },
    } as unknown as LessonSixStageJourney

    const htmlStylePrism = renderToStaticMarkup(
      <StudentStagePreview
        isIsland={true}
        sixStageJourney={journeyStylePrism}
        stageIndex={4}
      />
    )
    expect(htmlStylePrism).toContain('data-testid="stage-4-practice"')
    expect(htmlStylePrism).toContain('Đang nạp Xưởng Sáng Tạo AIKI...')
  })

  it('renders StudentStagePreview with creative-notebook engine and PracticeStageBlock correctly', () => {
    const journeyCreativeNotebook = {
      ...mockJourney,
      stage5_practice: {
        ...mockJourney.stage5_practice,
        creativeEngineMode: 'creative-notebook',
        notebookConfig: DEFAULT_NOTEBOOK_CONFIGS['3.1'],
      },
    } as unknown as LessonSixStageJourney

    const htmlCreativeNotebook = renderToStaticMarkup(
      <StudentStagePreview
        isIsland={true}
        sixStageJourney={journeyCreativeNotebook}
        stageIndex={4}
      />
    )

    expect(htmlCreativeNotebook).toContain('data-testid="stage-4-practice"')
    expect(htmlCreativeNotebook).toContain('Đang nạp Xưởng Sáng Tạo AIKI...')
  })

  it('renders StudentStagePreview with hideHeaderToolbar=true and viewport="pc" properly without nested toolbar and with standard VideoStageBlock', () => {
    const html = renderToStaticMarkup(
      <StudentStagePreview
        isIsland={true}
        sixStageJourney={mockJourney}
        stageIndex={2}
        viewport="pc"
        hideHeaderToolbar={true}
      />
    )

    // Khẳng định không có thanh công cụ lồng nhau
    expect(html).not.toContain('Xem trước học sinh')
    expect(html).not.toContain('Chặng 3/6')
    expect(html).not.toContain('Toàn màn hình')

    // Khẳng định render VideoStageBlock chuẩn
    expect(html).toContain('data-testid="stage-2-video"')
    expect(html).toContain('Video Bài Học 4 Chìa Khóa')
  })

  it('renders StudentStagePreview in Rule 3 Steps format correctly for each stage', () => {
    // Stage 0: Video bài học
    const htmlStage0 = renderToStaticMarkup(
      <StudentStagePreview
        lessonFormat="aiki-rule-3steps"
        sixStageJourney={mockJourney}
        stageIndex={0}
      />
    )
    expect(htmlStage0).toContain('data-testid="stage-2-video"')
    expect(htmlStage0).toContain('1. Bài học')

    // Stage 1: Kiểm tra phản xạ
    const htmlStage1 = renderToStaticMarkup(
      <StudentStagePreview
        lessonFormat="aiki-rule-3steps"
        sixStageJourney={mockJourney}
        stageIndex={1}
      />
    )
    expect(htmlStage1).toContain('data-testid="stage-3-quiz"')
    expect(htmlStage1).toContain('2. Kiểm tra')

    // Stage 2: Hoàn thành & trao thưởng
    const htmlStage2 = renderToStaticMarkup(
      <StudentStagePreview
        lessonFormat="aiki-rule-3steps"
        sixStageJourney={mockJourney}
        stageIndex={2}
      />
    )
    expect(htmlStage2).toContain('data-testid="stage-5-completion"')
    expect(htmlStage2).toContain('3. Hoàn thành')
  })

  it('buildRuleSyntheticJourney uses extractRuleNumber to match real SSOT data for every station candidate', () => {
    // QT1
    const j1 = buildRuleSyntheticJourney({ ...emptyDraft(), id: 'rule-1', title: 'QT1 — Hãy nghĩ ý tưởng của con' })
    const r1 = AIKI_RULES_DATA[0]
    expect(j1.stage3_video.videoUrl).toBe(r1.videoUrl)
    expect(j1.stage3_video.posterUrl).toBe(r1.posterImage)
    expect(j1.stage3_video.durationSec).toBe(r1.durationSec)
    expect(j1.stage4_quiz.questions).toHaveLength(r1.questions.length)
    expect(j1.stage6_completion.rewardBadge.name).toBe(`Huy hiệu ${r1.code}: ${r1.shortTitle}`)

    // QT3 with "Trạm 3" title
    const j3 = buildRuleSyntheticJourney({ ...emptyDraft(), id: 'station-uuid-3', title: 'Trạm 3: Sản phẩm có giá trị' })
    const r3 = AIKI_RULES_DATA.find((r) => r.id === 3)!
    expect(j3.stage3_video.videoUrl).toBe(r3.videoUrl)
    expect(j3.stage6_completion.rewardBadge.name).toBe(`Huy hiệu ${r3.code}: ${r3.shortTitle}`)

    // QT10 with "QT10" slug
    const j10 = buildRuleSyntheticJourney({ ...emptyDraft(), id: 'rule-10', slug: 'qt-10-hoc-tap', title: 'Bài tập ở trường' })
    const r10 = AIKI_RULES_DATA.find((r) => r.id === 10)!
    expect(j10.stage3_video.videoUrl).toBe(r10.videoUrl)
    expect(j10.stage6_completion.rewardBadge.name).toBe(`Huy hiệu ${r10.code}: ${r10.shortTitle}`)
  })

  it('StudentStagePreview in Rule 3 Steps renders VideoStageBlock, QuizStageBlock, and RewardStageBlock with real SSOT data and student blocks view', () => {
    const r1 = AIKI_RULES_DATA[0]
    const journey1 = buildRuleSyntheticJourney({ ...emptyDraft(), id: 'rule-1', title: 'QT1' })

    // Stage 0: Video
    const html0 = renderToStaticMarkup(
      <StudentStagePreview
        lessonFormat="aiki-rule-3steps"
        sixStageJourney={journey1}
        stageIndex={0}
        card={{
          id: 'rule-3step-stage-1',
          title: '1. Bài học',
          body: 'Nội dung bài học',
          kind: 'concept',
          layout: 'text',
          contentBlocks: [
            { id: 'custom-callout-1', type: 'layout-callout', title: 'Mẹo học', body: 'Hãy ghi nhớ quy tắc này!' }
          ]
        }}
      />
    )
    expect(html0).toContain('data-testid="stage-2-video"')
    expect(html0).toContain('Hãy ghi nhớ quy tắc này!')

    // Stage 1: Quiz
    const html1 = renderToStaticMarkup(
      <StudentStagePreview
        lessonFormat="aiki-rule-3steps"
        sixStageJourney={journey1}
        stageIndex={1}
        card={{
          id: 'rule-3step-stage-2',
          title: '2. Kiểm tra',
          body: '',
          kind: 'example',
          layout: 'text',
        }}
      />
    )
    expect(html1).toContain('data-testid="stage-3-quiz"')
    expect(html1).toContain(r1.questions[0].prompt)

    // Stage 2: Completion
    const html2 = renderToStaticMarkup(
      <StudentStagePreview
        lessonFormat="aiki-rule-3steps"
        sixStageJourney={journey1}
        stageIndex={2}
        card={{
          id: 'rule-3step-stage-3',
          title: '3. Hoàn thành',
          body: '',
          kind: 'remember',
          layout: 'text',
        }}
      />
    )
    expect(html2).toContain('data-testid="stage-5-completion"')
    expect(html2).toContain(`Huy hiệu ${r1.code}: ${r1.shortTitle}`)
  })

  it('renders Stage 0 (Goal) with full 4 keys when viewport is "pc" and compact is false', () => {
    const html = renderToStaticMarkup(
      <StudentStagePreview
        isIsland={true}
        sixStageJourney={mockJourney}
        stageIndex={0}
        viewport="pc"
        hideHeaderToolbar={true}
      />
    )

    // Khẳng định 4 chìa khóa hiển thị ở chế độ rộng (không bị ép 1 cột compact)
    expect(html).toContain('Học cách tả chiếc cốc với 4 Chìa Khóa')
    expect(html).toContain('Cái gì')
    expect(html).toContain('Trông thế nào')
    expect(html).toContain('Đang làm gì')
    expect(html).toContain('Ở đâu')
  })
})

describe('Creative Engine Selector - Collapse / Expand in LectureDrawer', () => {
  it('defines all 7 creative engines with proper metadata', () => {
    expect(CREATIVE_ENGINES).toHaveLength(7)
    const modes = CREATIVE_ENGINES.map((e) => e.mode)
    expect(modes).toEqual([
      'magic-keys',
      'style-prism',
      'prompt-doctor',
      'layer-stacking',
      'identity-lock',
      'card-forge',
      'creative-notebook',
    ])

    CREATIVE_ENGINES.forEach((eng) => {
      expect(eng.mode).toBeTruthy()
      expect(eng.title).toBeTruthy()
      expect(eng.shortName).toBeTruthy()
      expect(eng.icon).toBeTruthy()
      expect(eng.desc).toBeTruthy()
      expect(eng.activeBorder).toBeTruthy()
      expect(eng.badgeBg).toBeTruthy()
    })
  })

  it('renders Creative Engine Header in collapsed state by default with badge and toggle button, then expands upon click', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    const mockLecture = {
      ...emptyDraft(),
      id: 'bai-1-1',
      title: 'Trạm 1: Khởi động 4 Chìa Khóa',
      courseId: 'dao-1',
      lessonFormat: 'aiki-island-6steps' as const,
      sixStageJourney: mockJourney as unknown as LessonSixStageJourney,
      learnCards: [
        { id: 'c1', title: 'Mục tiêu', contentBlocks: [] },
        { id: 'c2', title: 'Xác nhận', contentBlocks: [] },
        { id: 'c3', title: 'Video', contentBlocks: [] },
        { id: 'c4', title: 'Thử tài', contentBlocks: [] },
        { id: 'c5', title: 'Thực hành', contentBlocks: [] },
        { id: 'c6', title: 'Về đích', contentBlocks: [] },
      ],
    }

    act(() => {
      root.render(
        <LectureDrawer
          courseId="dao-1"
          lecture={mockLecture as any}
          onSaved={() => {}}
          onClose={() => {}}
        />
      )
    })

    // Navigate to Stage 5 (Thực hành) tab
    const stage5Tab = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Thực hành')
    )
    expect(stage5Tab).toBeDefined()

    act(() => {
      stage5Tab?.click()
    })

    // 1. In collapsed state by default:
    expect(container.textContent).toContain('Game Engine Thực Hành:')
    expect(container.textContent).toContain('4 Chìa Khóa Ma Thuật')
    expect(container.textContent).toContain('Đang dùng')

    // Nút toggle hiển thị "Đổi Game Engine"
    const toggleBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Đổi Game Engine')
    )
    expect(toggleBtn).toBeDefined()
    expect(toggleBtn?.textContent).toContain('Đổi Game Engine')

    // Khi thu gọn: mô tả chi tiết và lưới 7 nút chưa hiển thị
    expect(container.textContent).not.toContain('Chuyển đổi linh hoạt giữa 7 cơ chế chơi')
    expect(container.textContent).not.toContain('Xưởng Đúc Thẻ Bài TCG')

    // 2. Click "Đổi Game Engine" để mở rộng
    act(() => {
      toggleBtn?.click()
    })

    // Lúc này nút chuyển sang "Thu gọn"
    expect(toggleBtn?.textContent).toContain('Thu gọn')

    // Mô tả chi tiết và danh sách các engine hiển thị
    expect(container.textContent).toContain('Chuyển đổi linh hoạt giữa 7 cơ chế chơi')
    expect(container.textContent).toContain('Lăng Kính')
    expect(container.textContent).toContain('Bác Sĩ AIKI')
    expect(container.textContent).toContain('3 Tầng')
    expect(container.textContent).toContain('Khóa Mật Mã')
    expect(container.textContent).toContain('Đúc Thẻ Bài')
    expect(container.textContent).toContain('Sổ Tay Ba Lô')

    // Engine hiện tại có nhãn "ĐANG CHỌN"
    expect(container.textContent).toContain('ĐANG CHỌN')

    // 3. Chọn một engine khác: "Lăng Kính Phù Thủy"
    const stylePrismBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Lăng Kính')
    )
    expect(stylePrismBtn).toBeDefined()

    act(() => {
      stylePrismBtn?.click()
    })

    // Badge ở Header cập nhật ngay thành "Lăng Kính Phù Thủy"
    expect(container.textContent).toContain('🔮')
    expect(container.textContent).toContain('Lăng Kính Phù Thủy')

    // 4. Bấm "Thu gọn" để đóng lại
    act(() => {
      toggleBtn?.click()
    })

    // Thu gọn lại: nút quay về "Đổi Game Engine", mô tả chi tiết biến mất
    expect(toggleBtn?.textContent).toContain('Đổi Game Engine')
    expect(container.textContent).not.toContain('Chuyển đổi linh hoạt giữa 7 cơ chế chơi')

    // Badge ở Header vẫn phản ánh đúng engine đã chọn
    expect(container.textContent).toContain('Lăng Kính Phù Thủy')
    expect(container.textContent).toContain('Đang dùng')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('renders StudentBasicsPreview with collapse button when onCollapse is provided', () => {
    const onCollapse = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(
        <StudentBasicsPreview
          draft={{
            ...emptyDraft(),
            title: 'Trạm Thám Hiểm',
            hook: 'Tại sao robot lại thông minh?',
            goalsText: 'Mục tiêu A\nMục tiêu B',
          }}
          onCollapse={onCollapse}
        />
      )
    })

    const collapseBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Thu gọn')
    )
    expect(collapseBtn).toBeDefined()

    act(() => {
      collapseBtn?.click()
    })

    expect(onCollapse).toHaveBeenCalledTimes(1)

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('renders StudentStagePreview with toolbar collapse button when onCollapse is provided', () => {
    const onCollapse = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(
        <StudentStagePreview
          isIsland={true}
          sixStageJourney={mockJourney}
          stageIndex={0}
          onCollapse={onCollapse}
        />
      )
    })

    const collapseBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Thu gọn')
    )
    expect(collapseBtn).toBeDefined()

    act(() => {
      collapseBtn?.click()
    })

    expect(onCollapse).toHaveBeenCalledTimes(1)

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('opens compact preview modal from header and stage quick button, returning 100% space to editor', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    const mockLecture = {
      ...emptyDraft(),
      id: 'bai-test-preview',
      title: 'Trạm 1: Khởi động 4 Chìa Khóa',
      courseId: 'dao-1',
      lessonFormat: 'aiki-island-6steps' as const,
      sixStageJourney: mockJourney as unknown as LessonSixStageJourney,
      learnCards: [
        { id: 'c1', title: 'Mục tiêu', contentBlocks: [] },
        { id: 'c2', title: 'Xác nhận', contentBlocks: [] },
        { id: 'c3', title: 'Video', contentBlocks: [] },
        { id: 'c4', title: 'Thử tài', contentBlocks: [] },
        { id: 'c5', title: 'Thực hành', contentBlocks: [] },
        { id: 'c6', title: 'Về đích', contentBlocks: [] },
      ],
    }

    act(() => {
      root.render(
        <LectureDrawer
          courseId="dao-1"
          lecture={mockLecture as any}
          onSaved={() => {}}
          onClose={() => {}}
        />
      )
    })

    // 1. Initial state: inline preview is OFF by default, no 56px CollapsedPreviewRail
    const rail = container.querySelector('[aria-label="Mở rộng xem trước màn học sinh"]')
    expect(rail).toBeNull()

    // Header has the single prominent "Xem trước" button
    const previewHeaderBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Xem trước')
    )
    expect(previewHeaderBtn).toBeDefined()

    // 2. Click "Xem trước" in header opens CompactStationPreviewModal
    act(() => {
      previewHeaderBtn?.click()
    })

    // Modal is rendered in document.body via createPortal
    expect(document.body.textContent).toContain('Xem trước học sinh')
    expect(document.body.textContent).toContain('Trạm 1: Khởi động 4 Chìa Khóa')

    // 3. Close the modal by clicking "Đóng xem trước"
    const closeBtn = Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Đóng xem trước')
    )
    expect(closeBtn).toBeDefined()
    act(() => {
      closeBtn?.click()
    })
    expect(document.body.textContent).not.toContain('Xem trước học sinh')

    // 4. Navigate to Stage 0 (Mục tiêu)
    const stage0Btn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Mục tiêu')
    )
    expect(stage0Btn).toBeDefined()
    act(() => {
      stage0Btn?.click()
    })

    // In Stage 0 header, "Xem thử chặng" button is available
    const stagePreviewBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Xem thử chặng')
    )
    expect(stagePreviewBtn).toBeDefined()

    // 5. Click "Xem thử chặng" to open preview for this specific stage
    act(() => {
      stagePreviewBtn?.click()
    })
    expect(document.body.textContent).toContain('Xem trước học sinh')
    expect(document.body.textContent).toContain('Chặng 1/6')

    // Press Escape key to close modal
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(document.body.textContent).not.toContain('Xem trước học sinh')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('updates draft and preview immediately when teacher switches station lecture prop', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    const station1 = {
      id: 'rule-1',
      title: 'QT1 — Hãy nghĩ ý tưởng của con',
      lessonFormat: 'aiki-rule-3steps',
      learnCards: [],
    }
    const station2 = {
      id: 'rule-2',
      title: 'QT2 — Con chọn phong cách',
      lessonFormat: 'aiki-rule-3steps',
      learnCards: [],
    }

    // 1. Render Trạm 1
    act(() => {
      root.render(
        <LectureDrawer
          courseId="aiki-rules"
          lecture={station1 as any}
          onSaved={() => {}}
          onClose={() => {}}
          inline={true}
        />
      )
    })
    expect(container.textContent).toContain('QT1 — Hãy nghĩ ý tưởng của con')

    // 2. Chuyển sang Trạm 2
    act(() => {
      root.render(
        <LectureDrawer
          courseId="aiki-rules"
          lecture={station2 as any}
          onSaved={() => {}}
          onClose={() => {}}
          inline={true}
        />
      )
    })
    expect(container.textContent).toContain('QT2 — Con chọn phong cách')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('renders CollapsedPreviewRail with vertical label, icons, and triggers onExpand when clicked', () => {
    const onExpand = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(
        <CollapsedPreviewRail onExpand={onExpand} label="HỌC SINH SẼ THẤY" />
      )
    })

    const button = container.querySelector('button')
    expect(button).toBeDefined()
    expect(button?.getAttribute('aria-label')).toBe('Mở rộng xem trước màn học sinh')
    expect(button?.className).toContain('w-14')
    expect(button?.className).toContain('border-sky-200')
    expect(button?.textContent).toContain('HỌC SINH SẼ THẤY')
    expect(button?.textContent).toContain('PREVIEW')

    act(() => {
      button?.click()
    })

    expect(onExpand).toHaveBeenCalledTimes(1)

    act(() => {
      root.unmount()
    })
    container.remove()
  })
})
