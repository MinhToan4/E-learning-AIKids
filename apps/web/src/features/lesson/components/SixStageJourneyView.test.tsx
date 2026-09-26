// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot as originalCreateRoot } from 'react-dom/client'

const activeRoots: Array<{ unmount: () => void }> = []
const createRoot: typeof originalCreateRoot = (container, options) => {
  const root = originalCreateRoot(container, options)
  activeRoots.push(root)
  return root
}

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
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
    configurable: true,
  })
}
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { SixStageJourneyView } from './SixStageJourneyViewLegacy'
import type { LessonSixStageJourney } from '@/shared/lib/api'
import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'
import { adaptRuleToStages } from '../lib/rule-stage-adapter'

const mockJourney: LessonSixStageJourney = {
  stage1_goal: {
    id: 'bai-1-1-stage1-goal',
    title: 'Mục tiêu: Đừng Để AIKI Đoán Mò',
    goalText: 'Con hiểu được AI tạo ảnh không tự nghĩ được, nó chỉ vẽ theo từ ngữ mà con cho nó.',
    imageUrl: '/assets/aiki-islands/island1_lesson1_cat.jpg',
    speech: 'Chào bạn nhỏ! Hôm nay tớ sẽ giúp bạn làm quen với xưởng vẽ AIKI!',
    keyPoints: [
      'Tả càng rõ, tranh càng đúng ý',
      'Không để AI tự đoán bừa',
      'Kiểm tra kết quả cẩn thận',
    ],
  },
  stage2_confirmGoal: {
    id: 'bai-1-1-stage2-confirm',
    question: 'Tại sao AIKI lại vẽ ra chú mèo mướp màu vàng thay vì màu đen?',
    options: [
      { id: 'opt-a', text: 'Vì câu lệnh của bé chưa ghi rõ màu sắc lông mèo', imageUrl: '/assets/aiki-islands/island1_lesson1_opt_a.jpg' },
      { id: 'opt-b', text: 'Vì AIKI thích màu vàng hơn', imageUrl: '/assets/aiki-islands/island1_lesson1_opt_b.jpg' },
    ],
    correctIndex: 0,
    explanation: 'Chính xác! Khi bé không tả màu lông, AIKI sẽ tự đoán mò!',
    speech: 'Bé hãy chọn phương án chính xác nhất nhé!',
  },
  stage3_video: {
    id: 'bai-1-1-stage3-video',
    title: 'Video Bài Giảng: Bí Kíp Câu Lệnh Thần Kỳ',
    videoUrl: 'https://www.youtube.com/embed/NMdHhsLY5jc',
    durationSec: 180,
    posterUrl: '/assets/aiki-islands/island1_lesson1_cat.jpg',
    timestamps: [
      { label: 'Tình huống khởi động', startSec: 0, endSec: 45, speech: 'Chào mừng các bạn!' },
      { label: 'Bí kíp 4 chìa khóa', startSec: 45, endSec: 120, speech: 'Ghi nhớ 4 chìa khóa nhé!' },
      { label: 'Thực hành cùng AIKI', startSec: 120, endSec: 180, speech: 'Cùng bắt tay vào làm nào!' },
    ],
  },
  stage4_quiz: {
    id: 'bai-1-1-stage4-quiz',
    title: 'Bài Test Thử Tài: 4 Chìa Khóa Vàng',
    questions: [
      {
        id: 'q1',
        prompt: 'Nếu câu lệnh chỉ có chữ "Con mèo", điều gì sẽ xảy ra?',
        options: ['AIKI sẽ đoán mò hình dáng và màu sắc', 'AIKI sẽ từ chối vẽ', 'AIKI luôn vẽ đúng ý bé'],
        correctIndex: 0,
        explanation: 'AI không tự nghĩ được nên phải đoán mò nếu câu lệnh quá ngắn!',
      },
      {
        id: 'q2',
        prompt: 'Quy tắc vàng của Xưởng AIKI là gì?',
        options: ['Miêu tả càng rõ tranh càng đúng ý', 'Bấm nút liên tục không cần nghĩ', 'Chép tranh của bạn khác'],
        correctIndex: 0,
        explanation: 'Miêu tả càng chi tiết thì tranh càng chính xác!',
      },
    ],
    passScore: 2,
  },
  stage5_practice: {
    id: 'bai-1-1-stage5-practice',
    title: 'Xưởng Sáng Tạo: Chú Mèo Mướp Béo',
    subjectName: 'Chú Mèo Mướp Béo',
    badge: 'Bài 1.1',
    illustrationType: 'cat-fat',
    lockedFeatures: ['mèo mướp vàng béo tròn', 'lông vằn cam trắng', 'nằm ngủ cuộn tròn'],
    akiMotto: 'Tả càng rõ, tranh càng đúng ý!',
    maxAttempts: 6,
    workflowSteps: [
      { step: 1, title: 'Thử câu lệnh ban đầu', akiSpeech: 'Hãy thử gõ "Con mèo" nhé!', quickPrompt: 'Con mèo', instruction: 'Thử 1-2 từ' },
      { step: 2, title: 'Thêm màu sắc & hình dáng', akiSpeech: 'Giờ hãy thêm chi tiết!', quickPrompt: 'Mèo mướp béo', instruction: 'Thêm chi tiết' },
      { step: 3, title: 'Hoàn thiện chi tiết vàng', akiSpeech: 'Bổ sung hành động và bối cảnh!', quickPrompt: 'Mèo mướp béo nằm ngủ', instruction: 'Hoàn thiện' },
      { step: 4, title: 'Soi kỹ tranh & nộp bài', akiSpeech: 'Soi kỹ tranh và nộp bài nhé!', quickPrompt: '', instruction: 'Nộp bài' },
    ],
    sampleUrl: '/assets/aiki-islands/island1_lesson1_cat.jpg',
  },
  stage6_completion: {
    id: 'bai-1-1-stage6-completion',
    title: 'Chúc mừng Nhà Sáng Tạo Tí Hon!',
    congratsMessage: 'Bé đã hoàn thành xuất sắc bài học và làm chủ bí kíp câu lệnh!',
    rewardBadge: {
      name: 'Huy hiệu Mèo Mướp Béo',
      iconUrl: '/assets/aiki-islands/island1_lesson1_cat.jpg',
      stars: 3,
      xp: 50,
    },
    nextLessonSlug: 'bai-1-2-bon-chiec-chia-khoa',
  },
}

describe('SixStageJourneyView', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    mockStorage = {}
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    mockStorage = {}
    act(() => {
      while (activeRoots.length > 0) {
        try {
          activeRoots.pop()?.unmount()
        } catch {
          // ignore already unmounted
        }
      }
    })
    if (container && container.parentNode) {
      document.body.removeChild(container)
    }
  })

  it('renders 2-column layout: Left Main Learning Canvas & Right AIKI Interactive Sidebar', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialSidebarCollapsed={false}
        />
      )
    })

    // Header progression bar
    expect(container.textContent).toContain('Mục tiêu')
    expect(container.textContent).toContain('Xác nhận')
    expect(container.textContent).toContain('Video')
    expect(container.textContent).toContain('Bài test')
    expect(container.textContent).toContain('Thực hành')
    expect(container.textContent).toContain('Hoàn thành')

    // Left Column: Main Learning Canvas & Stage 0 Goal (clean, non-cluttered)
    const mainCanvas = container.querySelector('[data-testid="main-learning-canvas"]')
    expect(mainCanvas).not.toBeNull()
    expect(mainCanvas?.querySelector('[data-testid="stage-0-goal"]')).not.toBeNull()
    expect(mainCanvas?.textContent).toContain('Mục tiêu: Đừng Để AIKI Đoán Mò')
    expect(mainCanvas?.textContent).toContain('Con hiểu được AI tạo ảnh không tự nghĩ được')

    // Main learning canvas is full width, sidebar omitted
    expect(mainCanvas?.className).toContain('w-full')
    expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()
  })

  it('renders teacher drag-and-drop blocks appended to the matching course stage', async () => {
    await import('./StudentStageBlocksView')
    const root = createRoot(container)
    await act(async () => {
      root.render(
        <SixStageJourneyView
          journey={{
            ...mockJourney,
            stageContentBlocks: {
              'stage-0': [{ id: 'teacher-tip', type: 'layout-callout', title: 'Bí kíp riêng', tip: 'Quan sát đủ bốn chìa khóa.' }],
            },
          }}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
        />
      )
      await Promise.resolve()
    })

    expect(container.querySelector('[data-testid="block-layout-callout"]')).not.toBeNull()
    expect(container.textContent).toContain('Quan sát đủ bốn chìa khóa.')
    act(() => root.unmount())
  })

  it('respects initialSidebarCollapsed prop and does not render toggle buttons', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialSidebarCollapsed={true}
        />
      )
    })

    // Sidebar is collapsed and no toggle buttons exist in the DOM
    expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()
    expect(container.querySelector('[data-testid="toggle-sidebar-btn"]')).toBeNull()
    expect(container.querySelector('[data-testid="toggle-sidebar-mobile-btn"]')).toBeNull()
    act(() => root.unmount())
  })

  it('synchronizes stage transition from 0 to 1 between Main Block and Sidebar', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialSidebarCollapsed={false}
        />
      )
    })

    const nextBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Đã hiểu mục tiêu')
    )
    expect(nextBtn).toBeDefined()

    act(() => {
      nextBtn?.click()
    })

    // Both Main Canvas and Sidebar advance to Stage 1 (Confirm goal)
    expect(container.querySelector('[data-testid="stage-1-confirm"]')).not.toBeNull()
    expect(container.textContent).toContain('Tại sao AIKI lại vẽ ra chú mèo mướp màu vàng')
    expect(container.textContent).toContain('Vì câu lệnh của bé chưa ghi rõ màu sắc lông mèo')

    expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()
  })

  it('handles Stage 1 quiz answer and unlocks video stage', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialStageIndex={1}
          initialSidebarCollapsed={false}
        />
      )
    })

    expect(container.querySelector('[data-testid="stage-1-confirm"]')).not.toBeNull()

    // Click option A (correct answer)
    const optABtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Vì câu lệnh của bé chưa ghi rõ')
    )
    expect(optABtn).toBeDefined()

    act(() => {
      optABtn?.click()
    })

    expect(container.textContent).toContain('Chính xác! Tuyệt vời quá bạn ơi!')
    expect(container.textContent).toContain('🎬 Xem video bài học thôi nào')

    // Click to advance to video stage
    const toVideoBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Xem video bài học thôi nào')
    )
    act(() => {
      toVideoBtn?.click()
    })

    // Now in Stage 2 (Video)
    expect(container.querySelector('[data-testid="stage-2-video"]')).not.toBeNull()
    expect(container.textContent).toContain('Video Bài Giảng: Bí Kíp Câu Lệnh Thần Kỳ')
    expect(container.textContent).toContain('Tình huống khởi động')

    expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()
  })

  it('renders Stage 3 (Quiz) and computes score on submit, updating Sidebar action', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialStageIndex={3}
          initialSidebarCollapsed={false}
        />
      )
    })

    expect(container.querySelector('[data-testid="stage-3-quiz"]')).not.toBeNull()
    expect(container.textContent).toContain('Bài Test Thử Tài: 4 Chìa Khóa Vàng')

    // Select answers
    const ans1 = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('AIKI sẽ đoán mò hình dáng')
    )
    const ans2 = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Miêu tả càng rõ tranh càng đúng ý')
    )

    act(() => {
      ans1?.click()
      ans2?.click()
    })

    const submitBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Nộp bài kiểm tra')
    )
    expect(submitBtn).toBeDefined()

    act(() => {
      submitBtn?.click()
    })

    expect(container.textContent).toContain('2/2 điểm')
    expect(container.textContent).toContain('👉 Vào Xưởng Sáng Tạo AI 🎨')

    expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()
  })

  it('renders Stage 5 (Completion) with badge and rewards, calling navigation callbacks', () => {
    const onFinishLesson = vi.fn()
    const onNavigateNextLesson = vi.fn()

    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialStageIndex={5}
          onFinishLesson={onFinishLesson}
          onNavigateNextLesson={onNavigateNextLesson}
          initialSidebarCollapsed={false}
        />
      )
    })

    expect(container.querySelector('[data-testid="stage-5-completion"]')).not.toBeNull()
    expect(container.textContent).toContain('Chúc mừng Nhà Sáng Tạo Tí Hon!')
    expect(container.textContent).toContain('+50 XP')
    expect(container.textContent).toContain('Huy hiệu Mèo Mướp Béo')
    expect(container.textContent).toContain('Khám phá bài tiếp theo')

    expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()

    const nextLessonBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Khám phá bài tiếp theo')
    )
    act(() => {
      nextLessonBtn?.click()
    })

    expect(onFinishLesson).toHaveBeenCalledWith({
      stars: 3,
      xp: 50,
      nextLessonSlug: 'bai-1-2-bon-chiec-chia-khoa',
    })
    expect(onNavigateNextLesson).toHaveBeenCalledWith('bai-1-2-bon-chiec-chia-khoa')
  })

  it('does not leave the reward screen when the server rejects completion persistence', () => {
    const onFinishLesson = vi.fn(() => false)
    const onNavigateNextLesson = vi.fn()

    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialStageIndex={5}
          onFinishLesson={onFinishLesson}
          onNavigateNextLesson={onNavigateNextLesson}
        />,
      )
    })

    const nextLessonBtn = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Khám phá bài tiếp theo'),
    )
    act(() => nextLessonBtn?.click())

    expect(onFinishLesson).toHaveBeenCalled()
    expect(onNavigateNextLesson).not.toHaveBeenCalled()
  })

  it('renders Stage 5 completion in a side-by-side 2-column layout fitting one screen with floating drawer sidebar', () => {
    const onNavigateNextLesson = vi.fn()
    const onBackToMap = vi.fn()
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialStageIndex={5}
          initialSidebarCollapsed={false}
          onNavigateNextLesson={onNavigateNextLesson}
          onBackToMap={onBackToMap}
        />
      )
    })

    const stage5Section = container.querySelector('[data-testid="stage-5-completion"]')
    expect(stage5Section).not.toBeNull()

    // 1. Main canvas has full width (w-full) at Stage 5
    const mainCanvas = container.querySelector('[data-testid="main-learning-canvas"]')
    expect(mainCanvas?.className).toContain('w-full')

    // 2. Side-by-side grid layout container
    const gridContainer = stage5Section?.querySelector('.grid')
    expect(gridContainer).not.toBeNull()
    expect(gridContainer?.className).toContain('grid-cols-1')
    expect(gridContainer?.className).toContain('lg:grid-cols-12')

    // 3. Left column (Artwork display)
    expect(stage5Section?.textContent).toContain('Tác phẩm kiệt xuất vừa cất vào Balo')
    expect(stage5Section?.textContent).toContain('Huy hiệu Mèo Mướp Béo')
    const zoomBtn = Array.from(stage5Section?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Phóng to')
    )
    expect(zoomBtn).toBeDefined()

    // 4. Right column (Trophy clay image, stars, title, congrats, action buttons)
    expect(stage5Section?.textContent).toContain('Chặng 6: Hoàn thành bài học')
    const trophyImg = stage5Section?.querySelector('img[alt="Cúp Vàng Sáng Tạo"]') as HTMLImageElement | null
    expect(trophyImg).not.toBeNull()
    expect(trophyImg?.src).toContain('/assets/trophy-clay-gold.png')
    const trophyBadge = stage5Section?.querySelector('[data-testid="stage6-trophy-xp-badge"]')
    expect(trophyBadge).not.toBeNull()
    expect(trophyBadge?.textContent).toContain('+50 XP')
    expect(stage5Section?.textContent).toContain('+50 XP')
    expect(stage5Section?.textContent).toContain('Chúc mừng Nhà Sáng Tạo Tí Hon!')
    expect(stage5Section?.textContent).toContain('Bé đã hoàn thành xuất sắc bài học')
    expect(stage5Section?.textContent).toContain('Khám phá bài tiếp theo')

    // 5. Sidebar is completely removed in favor of full width layout
    expect(container.querySelector('[data-testid="sidebar-overlay-backdrop"]')).toBeNull()
    expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()
  })

  it('verifies Top Header Stepper has NO emoji icons, has ChevronRight delimiters, sharp text without opacity-40, and smooth navigation', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialStageIndex={0}
          initialSidebarCollapsed={false}
        />
      )
    })

    const nav = container.querySelector('nav[aria-label="Tiến độ bài học 6 chặng"]')
    expect(nav).not.toBeNull()

    // Stepper must not contain emoji icons in headers
    const forbiddenEmojis = ['🎯', '❓', '🎬', '📝', '🎨', '🏆']
    forbiddenEmojis.forEach((emoji) => {
      expect(nav?.textContent).not.toContain(emoji)
    })

    // Stepper has SVG ChevronRight delimiters (5 chevrons between 6 stages)
    const chevrons = nav?.querySelectorAll('svg.lucide-chevron-right')
    expect(chevrons?.length).toBe(5)

    // Stepper has 6 stage buttons
    const buttons = nav?.querySelectorAll('button')
    expect(buttons?.length).toBe(6)

    // Verify all 6 stage titles and step numbers are rendered sharp and legible
    expect(nav?.textContent).toContain('Mục tiêu')
    expect(nav?.textContent).toContain('Xác nhận')
    expect(nav?.textContent).toContain('Video')
    expect(nav?.textContent).toContain('Bài test')
    expect(nav?.textContent).toContain('Thực hành')
    expect(nav?.textContent).toContain('Hoàn thành')

    // Verify strict sequential progression:
    // Stage 0 (current) and Stage 1 (next unlockable) are enabled
    expect(buttons?.[0]?.disabled).toBe(false)
    expect(buttons?.[1]?.disabled).toBe(false)
    expect(buttons?.[0]?.className).not.toContain('opacity-40')
    expect(buttons?.[1]?.className).not.toContain('opacity-40')

    // Future stages (2-5) are locked with opacity-40, cursor-not-allowed, and disabled
    for (let i = 2; i < 6; i++) {
      expect(buttons?.[i]?.disabled).toBe(true)
      expect(buttons?.[i]?.className).toContain('opacity-40')
      expect(buttons?.[i]?.className).toContain('cursor-not-allowed')
    }

    // Clicking locked stage 2 (Video) directly does NOT navigate
    act(() => {
      buttons?.[2]?.click()
    })
    expect(container.querySelector('[data-testid="stage-2-video"]')).toBeNull()

    // Clicking unlocked stage 1 navigates smoothly
    act(() => {
      buttons?.[1]?.click()
    })
    expect(container.querySelector('[data-testid="stage-1-confirm"]')).not.toBeNull()
  })

  it('handles image failure in Stage 2 without leaving empty placeholder boxes', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialStageIndex={1}
        />
      )
    })

    // Stage 1 badge content
    expect(container.textContent).toContain('Chặng 2: Xác nhận mục tiêu')

    // Initially images exist
    const images = container.querySelectorAll('section[data-testid="stage-1-confirm"] img')
    expect(images.length).toBeGreaterThan(0)

    // Simulate image loading error on the first option image
    act(() => {
      const img = images[0] as HTMLImageElement
      img.dispatchEvent(new Event('error'))
    })

    // After error, the failed image container should be hidden completely
    const remainingImages = container.querySelectorAll('section[data-testid="stage-1-confirm"] img')
    expect(remainingImages.length).toBe(images.length - 1)

    // Option text must still be clearly displayed
    expect(container.textContent).toContain('Vì câu lệnh của bé chưa ghi rõ màu sắc lông mèo')
  })

  it('verifies Stage 1 option image container uses aspect-[16/10] object-cover and max-h-[220px] to prevent vertical stretching, and supports full-screen zoom Lightbox', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialStageIndex={1}
        />
      )
    })

    const stage1Section = container.querySelector('section[data-testid="stage-1-confirm"]')
    expect(stage1Section).not.toBeNull()

    // Verify option cards use h-auto and max-w-6xl to prevent vertical and horizontal stretching
    const optionsGrid = stage1Section?.querySelector('.max-w-6xl')
    expect(optionsGrid).not.toBeNull()
    const optionCards = optionsGrid?.querySelectorAll('button')
    expect(optionCards?.length).toBe(2)
    optionCards?.forEach((card) => {
      expect(card.className).toContain('h-auto')
    })

    const imgContainers = stage1Section?.querySelectorAll('.aspect-\\[16\\/10\\]')
    expect(imgContainers?.length).toBe(2)

    imgContainers?.forEach((box) => {
      expect(box.className).toContain('aspect-[16/10]')
      expect(box.className).toContain('max-h-[220px]')
    })

    const images = stage1Section?.querySelectorAll('img')
    expect(images?.length).toBe(2)
    images?.forEach((img) => {
      expect(img.className).toContain('object-cover')
    })

    // Test clicking zoom button to open Lightbox Modal
    const zoomButtons = stage1Section?.querySelectorAll('[aria-label="Xem ảnh phóng to"]')
    expect(zoomButtons?.length).toBe(2)
    const firstZoomBtn = zoomButtons?.[0] as HTMLElement

    act(() => {
      firstZoomBtn.click()
    })

    const modal = document.body.querySelector('[data-testid="lightbox-modal"]')
    expect(modal).not.toBeNull()
    expect(modal?.querySelector('img')).not.toBeNull()

    // Test closing modal by pressing Escape
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(document.body.querySelector('[data-testid="lightbox-modal"]')).toBeNull()
  })

  it('verifies Responsive Full-Screen Lightbox Modal controls, self-healing image fallback, and zoom scaling', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialStageIndex={0}
        />
      )
    })

    const stage0Section = container.querySelector('section[data-testid="stage-0-goal"]')
    expect(stage0Section).not.toBeNull()

    // Find and click zoom button on Stage 0
    const zoomBtn = Array.from(stage0Section?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Phóng to')
    )
    expect(zoomBtn).toBeDefined()

    act(() => {
      zoomBtn?.click()
    })

    const modal = document.body.querySelector('[data-testid="lightbox-modal"]')
    expect(modal).not.toBeNull()
    expect(modal?.className).toContain('fixed')
    expect(modal?.className).toContain('bg-black/90')

    // Verify PC control buttons: Fullscreen, Zoom In, Zoom Out, Reset, and Close
    const fullscreenBtn = modal?.querySelector('button[title*="Toàn màn hình"]') as HTMLButtonElement | null
    expect(fullscreenBtn).not.toBeNull()

    const zoomInBtn = modal?.querySelector('button[title*="Phóng to"]') as HTMLButtonElement | null
    expect(zoomInBtn).not.toBeNull()

    const zoomOutBtn = modal?.querySelector('button[title*="Thu nhỏ"]') as HTMLButtonElement | null
    expect(zoomOutBtn).not.toBeNull()

    const resetBtn = modal?.querySelector('button[title*="Đặt lại"]') as HTMLButtonElement | null
    expect(resetBtn).not.toBeNull()

    const closeBtn = modal?.querySelector('button[aria-label="Đóng"]') as HTMLButtonElement | null
    expect(closeBtn).not.toBeNull()

    // Test Zoom In scaling
    const modalImg = modal?.querySelector('img') as HTMLImageElement
    expect(modalImg).not.toBeNull()
    expect(modalImg.className).toContain('max-w-[95vw]')
    expect(modalImg.className).toContain('object-contain')

    act(() => {
      zoomInBtn?.click()
    })
    expect(resetBtn?.textContent).toContain('125%')
    expect(modalImg.style.transform).toBe('scale(1.25)')

    // Test Reset scaling back to 100%
    act(() => {
      resetBtn?.click()
    })
    expect(resetBtn?.textContent).toContain('100%')
    expect(modalImg.style.transform).toBe('')

    // Test Self-Healing image fallback on error in Modal
    act(() => {
      modalImg.dispatchEvent(new Event('error'))
    })
    // Recovered to fallback
    expect(modalImg.src).toContain('/assets/aiki-islands/island1_lesson1_cat.jpg?v=2')

    // Close modal via close button
    act(() => {
      closeBtn?.click()
    })
    expect(document.body.querySelector('[data-testid="lightbox-modal"]')).toBeNull()
  })

  it('verifies Stage 0 uses a direct responsive image without a forced frame, plus objective and 2x2 formula keys', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialStageIndex={0}
        />
      )
    })

    const stage0Section = container.querySelector('section[data-testid="stage-0-goal"]')
    expect(stage0Section).not.toBeNull()

    // 2-column layout
    const twoColContainer = Array.from(stage0Section?.children || []).find((el) =>
      el.className.includes('lg:flex-row')
    )
    expect(twoColContainer).not.toBeNull()

    // Left Column: natural-ratio image, without a forced aspect/height frame.
    const leftCol = twoColContainer?.children[0]
    expect(leftCol?.className).toContain('lg:w-1/2')
    const heroImg = leftCol?.querySelector('img')
    expect(heroImg?.className).toContain('object-contain')
    expect(heroImg?.className).toContain('h-auto')
    expect(heroImg?.parentElement?.className).not.toContain('aspect-[4/3]')

    // Right Column: Objective card + 4 formula keys in 2x2 grid
    const rightCol = twoColContainer?.children[1]
    expect(rightCol?.className).toContain('lg:w-1/2')
    const keysGrid = rightCol?.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2')
    expect(keysGrid).not.toBeNull()
    const keyItems = keysGrid?.children || []
    expect(keyItems.length).toBe(4)
  })

  it('verifies Stage 2 video layout is cinema full-width 16:9, timestamps moved to Sidebar for non-cluttered view, and seeking works', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialStageIndex={2}
          initialSidebarCollapsed={false}
        />
      )
    })

    const stage2Section = container.querySelector('section[data-testid="stage-2-video"]')
    expect(stage2Section).not.toBeNull()

    // Container must be flex flex-col justify-between with h-full
    expect(stage2Section?.className).toContain('flex')
    expect(stage2Section?.className).toContain('flex-col')
    expect(stage2Section?.className).toContain('justify-between')
    expect(stage2Section?.className).toContain('h-full')

    // Video container must adapt with aspect-video and container query responsive layout
    const videoWrapper = stage2Section?.querySelector('.relative.aspect-video')
    expect(videoWrapper).not.toBeNull()
    expect(videoWrapper?.className).toContain('aspect-video')

    // Mainbar iframe has base video URL initially
    const iframe = stage2Section?.querySelector('iframe')
    expect(iframe).not.toBeNull()
    expect(iframe?.getAttribute('src')).toContain('https://www.youtube.com/embed/NMdHhsLY5jc')
    expect(iframe?.getAttribute('src')).toContain('controls=0')
    expect(iframe?.getAttribute('src')).toContain('disablekb=1')
    expect(iframe?.className).toContain('pointer-events-none')

    // Sidebar is omitted; timestamps are built into video timeline stepper in main canvas
    expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()

    // Clicking a timestamp seeks video player in Mainbar
    const chapterBtn = Array.from(stage2Section?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Bí kíp 4 chìa khóa')
    )
    expect(chapterBtn).toBeDefined()
    act(() => {
      chapterBtn?.click()
    })
    expect(stage2Section?.querySelector('iframe')?.getAttribute('src')).not.toContain('start=45')
    expect(stage2Section?.querySelector('[data-testid="video-timeline-stepper"]')?.textContent).toContain('0:45')

    // Action button footer container
    const footerAction = stage2Section?.querySelector('[data-testid="video-action-footer"]')
    expect(footerAction).not.toBeNull()
  })

  it('renders question.visualUrl in Quiz stage and verifies responsive 2-column layout classes', () => {
    const journeyWithQuizImage: LessonSixStageJourney = {
      ...mockJourney,
      stage4_quiz: {
        ...mockJourney.stage4_quiz,
        questions: [
          {
            ...mockJourney.stage4_quiz.questions[0],
            visualUrl: '/assets/aiki-islands/island1_lesson1_opt_a.jpg',
          },
          ...mockJourney.stage4_quiz.questions.slice(1),
        ],
      },
    }

    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={journeyWithQuizImage}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialStageIndex={3}
          initialSidebarCollapsed={false}
        />
      )
    })

    // Stage 3 Quiz
    const quizSection = container.querySelector('section[data-testid="stage-3-quiz"]')
    expect(quizSection).not.toBeNull()

    // Question visualUrl rendered with object-contain
    const quizImg = quizSection?.querySelector('img[src="/assets/aiki-islands/island1_lesson1_opt_a.jpg"]')
    expect(quizImg).not.toBeNull()
    expect(quizImg?.className).toContain('object-cover')

    // Main canvas is full width, sidebar is omitted
    const mainCanvas = container.querySelector('[data-testid="main-learning-canvas"]')
    expect(mainCanvas?.className).toContain('w-full')
    expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()
  })

  it('renders Stage 4 Practice with interactive sidebar containing 4 practice steps and AIKI golden motto', async () => {
    const root = createRoot(container)
    await act(async () => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialStageIndex={4}
          initialSidebarCollapsed={false}
        />
      )
    })
    await act(async () => {
      await import('./AikiStudioWorkspace')
    })




    // Main workspace for practice stage
    expect(container.querySelector('[data-testid="stage-4-practice"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="aiki-studio-workspace"]')).not.toBeNull()

    // Main canvas keeps 100% width at Stage 4 even when sidebar is open
    const mainCanvas = container.querySelector('[data-testid="main-learning-canvas"]')
    expect(mainCanvas?.className).toContain('w-full')

    // Sidebar is omitted; workspace takes full canvas
    expect(container.querySelector('[data-testid="sidebar-overlay-backdrop"]')).toBeNull()
    expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()
  }, 15000)

  it('verifies full-width canvas and omitted sidebar across Stages 0, 1, 3, and 5 according to pedagogical design', () => {
    const root = createRoot(container)

    // Stage 0: 4-slot formula in Main Learning Canvas
    act(() => {
      root.render(
        <SixStageJourneyView
          key="stage-0"
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialStageIndex={0}
          initialSidebarCollapsed={false}
        />
      )
    })
    const sidebar0 = container.querySelector('[data-testid="interactive-sidebar"]')
    expect(sidebar0).toBeNull()

    // Bốn Chiếc Chìa Khóa Mở Khóa Câu Lệnh được hiển thị ở Main Learning Canvas
    const main0 = container.querySelector('[data-testid="stage-0-goal"]')
    expect(main0?.textContent).toContain('BỐN CHIẾC CHÌA KHÓA MỞ KHÓA CÂU LỆNH')
    expect(main0?.textContent).toContain('CÁI GÌ')
    expect(main0?.textContent).toContain('TRÔNG THẾ NÀO')
    expect(main0?.textContent).toContain('ĐANG LÀM GÌ')
    expect(main0?.textContent).toContain('Ở ĐÂU')

    // Stage 1: Main Canvas
    act(() => {
      root.render(
        <SixStageJourneyView
          key="stage-1"
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialStageIndex={1}
          initialSidebarCollapsed={false}
        />
      )
    })
    const sidebar1 = container.querySelector('[data-testid="interactive-sidebar"]')
    expect(sidebar1).toBeNull()

    // Stage 3: Live Scoreboard in Main Canvas
    act(() => {
      root.render(
        <SixStageJourneyView
          key="stage-3"
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialStageIndex={3}
          initialSidebarCollapsed={false}
        />
      )
    })
    const sidebar3 = container.querySelector('[data-testid="interactive-sidebar"]')
    expect(sidebar3).toBeNull()

    // Select answers and submit quiz in Stage 3
    const ans1 = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('AIKI sẽ đoán mò hình dáng')
    )
    const ans2 = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Miêu tả càng rõ tranh càng đúng ý')
    )
    act(() => {
      ans1?.click()
      ans2?.click()
    })
    const submitBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Nộp bài kiểm tra')
    )
    act(() => {
      submitBtn?.click()
    })
    expect(container.textContent).toContain('2/2 điểm')

    // Stage 5: Rewards in Main Canvas
    act(() => {
      root.render(
        <SixStageJourneyView
          key="stage-5"
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialStageIndex={5}
          initialSidebarCollapsed={false}
        />
      )
    })
    const sidebar5 = container.querySelector('[data-testid="interactive-sidebar"]')
    expect(sidebar5).toBeNull()
    expect(container.querySelector('[data-testid="stage-5-completion"]')).not.toBeNull()
  })

  it('renders Stage 4 practice with omitted companion sidebar', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-2-bon-chiec-chia-khoa"
          lessonTitle="Bốn Chiếc Chìa Khóa Vạn Năng"
          initialStageIndex={4}
          initialSidebarCollapsed={false}
        />
      )
    })

    expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()
    expect(container.querySelector('[data-testid="stage-4-practice"]')).not.toBeNull()
  })

  it('loads Station 3.3 (bai-3-3) in Stage 4 practice without sidebar', () => {
    const root = createRoot(container)
    const journey3_3: LessonSixStageJourney = {
      ...mockJourney,
      stage5_practice: {
        ...mockJourney.stage5_practice,
        id: 'bai-3-3-stage5-practice',
        title: 'Xưởng Sáng Tạo: Biến Hoá Biểu Cảm',
        subjectName: 'Biệt Đội 6 Biểu Cảm',
      },
    }

    act(() => {
      root.render(
        <SixStageJourneyView
          journey={journey3_3}
          lessonId="bai-3-3"
          lessonTitle="Biến Hoá Biểu Cảm"
          initialStageIndex={4}
          initialSidebarCollapsed={false}
        />
      )
    })

    expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()
    expect(container.querySelector('[data-testid="stage-4-practice"]')).not.toBeNull()
  })

  it('loads Station 3.1 (bai-3-1) in Stage 4 practice without sidebar', async () => {
    const root = createRoot(container)
    const journey3_1: LessonSixStageJourney = {
      ...mockJourney,
      stage5_practice: {
        ...mockJourney.stage5_practice,
        id: 'bai-3-1-stage5-practice',
        title: 'Xưởng Sáng Tạo AI: Bài 3.1 — Hồ sơ biệt đội',
        subjectName: 'Hiệp Sĩ Cáo Lửa',
        creativeEngineMode: 'card-forge',
        practiceParts: [
          { partNumber: 1, title: 'Hiệp Sĩ Cáo Lửa (Chiến tướng Hệ Hỏa)', icon: '🦊', emoji: '🦊' },
          { partNumber: 2, title: 'Rồng Băng Bão Tuyết (Chiến tướng Hệ Băng)', icon: '🐉', emoji: '🐉' },
          { partNumber: 3, title: 'Sư Tử Lửa Cuồng Nộ (Chiến tướng Hệ Hỏa)', icon: '🦁', emoji: '🦁' },
          { partNumber: 4, title: 'Đại Bàng Lôi Thần (Chiến tướng Hệ Sét)', icon: '🦅', emoji: '🦅' },
        ],
      },
    }

    await act(async () => {
      root.render(
        <SixStageJourneyView
          journey={journey3_1}
          lessonId="bai-3-1"
          lessonTitle="Hồ sơ biệt đội"
          initialStageIndex={4}
          initialSidebarCollapsed={false}
        />
      )
    })
    await act(async () => {
      await import('./AikiStudioWorkspace')
    })

    expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()
    expect(container.querySelector('[data-testid="stage-4-practice"]')).not.toBeNull()
  })

  it('renders Lesson 1.2 Stage 0 with 4-keys banner and 4-colored formula grid', () => {
    const lesson1_2Journey: LessonSixStageJourney = {
      ...mockJourney,
      stage1_goal: {
        id: 'bai-1-2-stage1-goal',
        title: 'Bài 1.2 — Bốn chiếc chìa khoá',
        goalText: 'Viết được một câu lệnh có đủ bốn phần: Cái gì, Trông như thế nào, Đang làm gì, Ở đâu',
        imageUrl: '/assets/aiki-islands/island1_lesson2_keys.jpg',
        speech: 'Zico: Một con mèo rất đẹp... AIKI: Hả? Zico viết dài thế mà tranh vẫn chưa rõ kìa!',
        keyPoints: [
          "CÁI GÌ (Xanh Sky): 'một cái cốc'",
          "TRÔNG NHƯ THẾ NÀO (Vàng Sun): 'sứ trắng, có vết mẻ ở miệng'",
          "ĐANG LÀM GÌ (Cam Mango): 'đang bốc khói'",
          "Ở ĐÂU (Hồng Gum): 'trên bàn gỗ, cạnh cuốn sổ'",
        ],
      },
    }

    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={lesson1_2Journey}
          lessonId="bai-1-2-bon-chiec-chia-khoa"
          lessonTitle="Bài 1.2 — Bốn chiếc chìa khoá"
          initialStageIndex={0}
        />
      )
    })

    const stage0 = container.querySelector('[data-testid="stage-0-goal"]')
    expect(stage0).not.toBeNull()
    expect(stage0?.textContent).toContain('Rương 4 Chìa Khóa Thần Kỳ')
    expect(stage0?.textContent).toContain('BỐN CHIẾC CHÌA KHÓA MỞ KHÓA CÂU LỆNH')
    expect(stage0?.textContent).toContain('1. Cái gì')
    expect(stage0?.textContent).toContain('2. Trông thế nào')
    expect(stage0?.textContent).toContain('3. Đang làm gì')
    expect(stage0?.textContent).toContain('4. Ở đâu')
    expect(stage0?.textContent).toContain('CÁI GÌ')
    expect(stage0?.textContent).toContain('TRÔNG THẾ NÀO')
    expect(stage0?.textContent).toContain('ĐANG LÀM GÌ')
    expect(stage0?.textContent).toContain('Ở ĐÂU')
    expect(stage0?.textContent).toContain('“một cái cốc”')

    // Anti-clipping checks for 4 keys on iPad / student screens
    const cards = stage0?.querySelectorAll('.min-h-\\[64px\\]')
    expect(cards?.length).toBe(4)
    cards?.forEach((el) => {
      expect(el.className).toContain('items-start')
    })
    const texts = stage0?.querySelectorAll('p.line-clamp-3')
    expect(texts?.length).toBe(4)
    texts?.forEach((el) => {
      expect(el.className).toContain('leading-snug')
      expect(el.className).toContain('break-words')
      expect(el.className).not.toContain('line-clamp-1')
    })
  })

  it('renders Lesson 1.2 Stage 1 with 3-column key sets and unlocks with mint feedback on correct choice', () => {
    const lesson1_2Journey: LessonSixStageJourney = {
      ...mockJourney,
      stage2_confirmGoal: {
        id: 'bai-1-2-stage2-confirm',
        question: 'Bộ chìa khoá nào mở được một câu lệnh tốt?',
        options: [
          {
            id: 'opt-a',
            text: 'Bộ chìa khoá A',
            keyItems: [
              { label: 'Ai vẽ', color: '#3FA9F5' },
              { label: 'Vẽ lúc nào', color: '#F5C93E' },
              { label: 'Vẽ ở đâu', color: '#FF9427' },
              { label: 'Vẽ bằng gì', color: '#FF6FA5' },
            ],
          },
          {
            id: 'opt-b',
            text: 'Bộ chìa khoá B',
            keyItems: [
              { label: 'Cái gì', color: '#3FA9F5' },
              { label: 'Trông như thế nào', color: '#F5C93E' },
              { label: 'Đang làm gì', color: '#FF9427' },
              { label: 'Ở đâu', color: '#FF6FA5' },
            ],
          },
          {
            id: 'opt-c',
            text: 'Bộ chìa khoá C',
            keyItems: [
              { label: 'Cái gì', color: '#3FA9F5' },
              { label: 'Màu gì', color: '#F5C93E' },
              { label: 'To hay nhỏ', color: '#FF9427' },
              { label: 'Của ai', color: '#FF6FA5' },
            ],
          },
        ],
        correctIndex: 1,
        explanation: 'Đúng rồi các cậu ơi! Bốn chìa khoá này chính là bốn ô các cậu sẽ điền trong Xưởng.',
        speech: 'Bộ chìa khoá nào mở được một câu lệnh tốt?',
      },
    }

    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={lesson1_2Journey}
          lessonId="bai-1-2-bon-chiec-chia-khoa"
          lessonTitle="Bài 1.2 — Bốn chiếc chìa khoá"
          initialStageIndex={1}
        />
      )
    })

    const stage1 = container.querySelector('[data-testid="stage-1-confirm"]')
    expect(stage1).not.toBeNull()
    expect(stage1?.textContent).toContain('Bộ chìa khoá nào mở được một câu lệnh tốt?')
    expect(stage1?.textContent).toContain('Chiếc Rương Thần Kỳ ở chặng trước có 3 ổ khóa (A, B, C)')
    expect(stage1?.textContent).toContain('Bộ chìa khoá A')
    expect(stage1?.textContent).toContain('Bộ chìa khoá B')
    expect(stage1?.textContent).toContain('Bộ chìa khoá C')
    expect(stage1?.textContent).toContain('Ai vẽ')
    expect(stage1?.textContent).toContain('Cái gì')
    expect(stage1?.textContent).toContain('Trông như thế nào')

    // Find option buttons
    const buttons = stage1?.querySelectorAll('button') || []
    // Click Option B (index 1)
    const optBBtn = buttons[1] as HTMLButtonElement
    expect(optBBtn).toBeDefined()
    expect(optBBtn.textContent).toContain('Bộ chìa khoá B')

    act(() => {
      optBBtn.click()
    })

    // Expect unlocked state
    expect(optBBtn.textContent).toContain('🔓')
    expect(optBBtn.textContent).toContain('Đúng bộ này rồi! 🎉')
    expect(stage1?.textContent).toContain('Đúng rồi các cậu ơi!')
    expect(stage1?.textContent).toContain('🎬 Xem video bài học thôi nào')
  })

  it('renders clean single current station title badge without clutter station switcher buttons', () => {
    const handleNavigate = vi.fn()
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1-mot-tu-hay-nam-tu"
          lessonTitle="Bài 1.1 — Một từ hay năm từ?"
          onNavigateNextLesson={handleNavigate}
        />
      )
    })

    const badge = container.querySelector('[data-testid="current-station-badge"]')
    expect(badge).not.toBeNull()
    expect(badge?.textContent).toContain('Trạm 1: Mèo AIKI')
    expect(badge?.textContent).not.toMatch(/[🐱🎨⭐]/u)

    // 6 chặng tiến độ hiển thị đầy đủ, thoáng đãng
    const nav = container.querySelector('nav[aria-label="Tiến độ bài học 6 chặng"]')
    expect(nav).not.toBeNull()
    expect(nav?.querySelectorAll('button').length).toBe(6)

    // Kiểm tra với Bài 1.2
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-2-bon-chiec-chia-khoa"
          lessonTitle="Bài 1.2 — Bốn Chiếc Chìa Khóa Vạn Năng"
          onNavigateNextLesson={handleNavigate}
        />
      )
    })

    const badge2 = container.querySelector('[data-testid="current-station-badge"]')
    expect(badge2).not.toBeNull()
    expect(badge2?.textContent).toContain('Trạm 2: 4 Chìa Khoá')
    expect(badge2?.textContent).not.toMatch(/[🔑🎨⭐]/u)
  })

  it('renders 4-formula cards in Stage 0 for Lesson 1.1 to eliminate blank space', () => {
    const lesson1_1Journey: LessonSixStageJourney = {
      ...mockJourney,
      stage1_goal: {
        ...mockJourney.stage1_goal,
        keyPoints: [
          "CÁI GÌ (Xanh Sky): 'một con mèo'",
          "TRÔNG NHƯ THẾ NÀO (Vàng Sun): 'mèo mướp vàng béo tròn'",
          "ĐANG LÀM GÌ (Cam Mango): 'đang nằm ngủ cuộn tròn'",
          "Ở ĐÂU (Hồng Gum): 'trên ghế mây cạnh cửa sổ'",
        ],
      },
    }

    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={lesson1_1Journey}
          lessonId="bai-1-1-mot-tu-hay-nam-tu"
          lessonTitle="Bài 1.1 — Một từ hay năm từ?"
          initialStageIndex={0}
        />
      )
    })

    const stage0 = container.querySelector('[data-testid="stage-0-goal"]')
    expect(stage0).not.toBeNull()
    expect(stage0?.textContent).toContain('BỐN CHIẾC CHÌA KHÓA MỞ KHÓA CÂU LỆNH')
    expect(stage0?.textContent).toContain('CÁI GÌ')
    expect(stage0?.textContent).toContain('“một con mèo”')
    expect(stage0?.textContent).toContain('TRÔNG THẾ NÀO')
    expect(stage0?.textContent).toContain('“mèo mướp vàng béo tròn”')
    expect(stage0?.textContent).toContain('ĐANG LÀM GÌ')
    expect(stage0?.textContent).toContain('“đang nằm ngủ cuộn tròn”')
    expect(stage0?.textContent).toContain('Ở ĐÂU')
    expect(stage0?.textContent).toContain('“trên ghế mây cạnh cửa sổ”')
  })

  it('verifies Lesson 1.2 visual linkage: exact 4 key images, chest pin badges, robust clay cards, and narrative connection to stage 1', () => {
    const lesson1_2Journey: LessonSixStageJourney = {
      ...mockJourney,
      stage1_goal: {
        id: 'bai-1-2-stage1-goal',
        title: 'Bài 1.2 — Bốn chiếc chìa khoá',
        goalText: 'Viết được một câu lệnh có đủ bốn phần: Cái gì, Trông như thế nào, Đang làm gì, Ở đâu',
        imageUrl: '/assets/aiki-islands/island1_lesson2_keys.jpg',
        speech: 'Zico: Một con mèo rất đẹp... AIKI: Hả? Zico viết dài thế mà tranh vẫn chưa rõ kìa!',
        keyPoints: [
          "CÁI GÌ (Xanh Sky): 'một cái cốc'",
          "TRÔNG NHƯ THẾ NÀO (Vàng Sun): 'sứ trắng, có vết mẻ ở miệng'",
          "ĐANG LÀM GÌ (Cam Mango): 'đang bốc khói'",
          "Ở ĐÂU (Hồng Gum): 'trên bàn gỗ, cạnh cuốn sổ'",
        ],
      },
      stage2_confirmGoal: {
        id: 'bai-1-2-stage2-confirm',
        question: 'Bộ chìa khoá nào mở được một câu lệnh tốt?',
        options: [
          { id: 'opt-a', text: 'Bộ chìa khoá A' },
          { id: 'opt-b', text: 'Bộ chìa khoá B' },
        ],
        correctIndex: 1,
        explanation: 'Đúng rồi các cậu ơi!',
        speech: 'Bộ chìa khoá nào mở được một câu lệnh tốt?',
      },
    }

    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={lesson1_2Journey}
          lessonId="bai-1-2-bon-chiec-chia-khoa"
          lessonTitle="Bài 1.2 — Bốn chiếc chìa khoá"
          initialStageIndex={0}
        />
      )
    })

    const stage0 = container.querySelector('[data-testid="stage-0-goal"]')
    expect(stage0).not.toBeNull()

    // 1. Corner badge
    expect(stage0?.textContent).toContain('Rương 4 Chìa Khóa Thần Kỳ')

    // 2. 4 Pin Badges on chest image foot
    expect(stage0?.textContent).toContain('1. Cái gì')
    expect(stage0?.textContent).toContain('2. Trông thế nào')
    expect(stage0?.textContent).toContain('3. Đang làm gì')
    expect(stage0?.textContent).toContain('4. Ở đâu')

    // 3. Formula cards images - slot 1 MUST be key_what_blue.jpg (Blue bear with wings, NOT cup!)
    const cardImages = stage0?.querySelectorAll('.grid img') || []
    expect(cardImages.length).toBe(4)
    expect((cardImages[0] as HTMLImageElement).src).toContain('/assets/aiki-keys/key_what_blue.jpg')
    expect((cardImages[1] as HTMLImageElement).src).toContain('/assets/aiki-keys/key_how_yellow.jpg')
    expect((cardImages[2] as HTMLImageElement).src).toContain('/assets/aiki-keys/key_action_orange.jpg')
    expect((cardImages[3] as HTMLImageElement).src).toContain('/assets/aiki-keys/key_where_pink.jpg')

    // 4. Detailed card badges format: [1] CÁI GÌ, [2] TRÔNG THẾ NÀO, etc.
    expect(stage0?.textContent).toContain('[1] CÁI GÌ')
    expect(stage0?.textContent).toContain('[2] TRÔNG THẾ NÀO')
    expect(stage0?.textContent).toContain('[3] ĐANG LÀM GÌ')
    expect(stage0?.textContent).toContain('[4] Ở ĐÂU')

    // 5. Advance to Stage 1 and verify narrative connection
    const advanceBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Đã hiểu mục tiêu')
    )
    act(() => {
      advanceBtn?.click()
    })

    const stage1 = container.querySelector('[data-testid="stage-1-confirm"]')
    expect(stage1).not.toBeNull()
    expect(stage1?.textContent).toContain(
      'Chiếc Rương Thần Kỳ ở chặng trước có 3 ổ khóa (A, B, C). Bạn hãy dùng đúng 4 Chiếc Chìa Khóa Vàng vừa tìm thấy để mở Ổ Khóa B nhé!'
    )
  })

  it('renders 3 Soft Clay locks and defaults active key tray to correct 4 Golden Keys', () => {
    const lesson1_2Journey: LessonSixStageJourney = {
      ...mockJourney,
      stage2_confirmGoal: {
        id: 'bai-1-2-stage2-confirm',
        question: 'Bộ chìa khoá nào mở được một câu lệnh tốt?',
        options: [
          {
            id: 'opt-a',
            text: 'Bộ chìa khoá A',
            keyItems: [
              { label: 'Ai vẽ', color: '#64748B' },
              { label: 'Vẽ lúc nào', color: '#64748B' },
              { label: 'Vẽ ở đâu', color: '#64748B' },
              { label: 'Vẽ bằng gì', color: '#64748B' },
            ],
          },
          {
            id: 'opt-b',
            text: 'Bộ chìa khoá B',
            keyItems: [
              { label: 'Cái gì', color: '#0EA5E9' },
              { label: 'Trông như thế nào', color: '#EAB308' },
              { label: 'Đang làm gì', color: '#F97316' },
              { label: 'Ở đâu', color: '#EC4899' },
            ],
          },
          {
            id: 'opt-c',
            text: 'Bộ chìa khoá C',
            keyItems: [
              { label: 'Màu gì', color: '#64748B' },
              { label: 'To hay nhỏ', color: '#64748B' },
              { label: 'Đẹp hay xấu', color: '#64748B' },
              { label: 'Thích không', color: '#64748B' },
            ],
          },
        ],
        correctIndex: 1,
        explanation: 'Đúng rồi các cậu ơi! Bốn chìa khoá này chính là bốn ô các cậu sẽ điền trong Xưởng.',
        speech: 'Bộ chìa khoá nào mở được một câu lệnh tốt?',
      },
    }

    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={lesson1_2Journey}
          lessonId="bai-1-2-bon-chiec-chia-khoa"
          lessonTitle="Bài 1.2 — Bốn chiếc chìa khoá"
          initialStageIndex={1}
        />
      )
    })

    const stage1 = container.querySelector('[data-testid="stage-1-confirm"]')
    expect(stage1).not.toBeNull()

    // 1. Initial State: All 3 locks show closed amber soft clay
    const optionButtons = stage1?.querySelectorAll('button') || []
    expect(optionButtons.length).toBeGreaterThanOrEqual(3)

    const optAImg = optionButtons[0]?.querySelector('img') as HTMLImageElement
    const optBImg = optionButtons[1]?.querySelector('img') as HTMLImageElement
    const optCImg = optionButtons[2]?.querySelector('img') as HTMLImageElement
    expect(optAImg.src).toContain('/assets/aiki-keys/lock_closed_amber.jpg')
    expect(optBImg.src).toContain('/assets/aiki-keys/lock_closed_amber.jpg')
    expect(optCImg.src).toContain('/assets/aiki-keys/lock_closed_amber.jpg')

    // 2. Initial State: All 3 sets of keys are rendered directly on the cards
    expect(optionButtons[0]?.textContent).toContain('Ai vẽ')
    expect(optionButtons[0]?.textContent).toContain('Vẽ lúc nào')
    expect(optionButtons[1]?.textContent).toContain('Cái gì')
    expect(optionButtons[1]?.textContent).toContain('Trông như thế nào')
    expect(optionButtons[1]?.textContent).toContain('Đang làm gì')
    expect(optionButtons[1]?.textContent).toContain('Ở đâu')
    expect(optionButtons[2]?.textContent).toContain('Màu gì')
    expect(optionButtons[2]?.textContent).toContain('To hay nhỏ')

    // Amber tip message below
    expect(stage1?.textContent).toContain('Bé hãy quan sát 4 chiếc chìa khóa của 3 bộ ở trên')

    // 3. User clicks Option A (Wrong option)
    act(() => {
      optionButtons[0]?.click()
    })
    expect((optionButtons[0]?.querySelector('img') as HTMLImageElement).src).toContain(
      '/assets/aiki-keys/lock_wrong_rose.jpg'
    )
    expect(optionButtons[0]?.textContent).toContain('Chưa mở được 🔒')

    // 4. User clicks Option B (Correct option)
    act(() => {
      optionButtons[1]?.click()
    })
    expect((optionButtons[1]?.querySelector('img') as HTMLImageElement).src).toContain(
      '/assets/aiki-keys/lock_open_mint.jpg'
    )
    expect(optionButtons[1]?.textContent).toContain('Đúng bộ này rồi! 🎉')
    expect(stage1?.textContent).toContain('Đúng rồi các cậu ơi!')
    expect(stage1?.textContent).toContain('🎬 Xem video bài học thôi nào')
  })

  it('navigates Stage 4 quiz using single question stepper with side-by-side layout and progress indicators', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialStageIndex={3}
          initialSidebarCollapsed={false}
        />
      )
    })

    const quizSection = container.querySelector('section[data-testid="stage-3-quiz"]')
    expect(quizSection).not.toBeNull()

    // 1. Initial State: Câu 1 / 2
    expect(quizSection?.textContent).toContain('CÂU 1 / 2')
    expect(quizSection?.textContent).toContain('👉 Hãy chọn 1 đáp án')

    // Chưa trả lời đúng thì không cho bỏ qua sang câu tiếp theo.
    expect(quizSection?.textContent).not.toContain('Câu tiếp theo')
    const firstCorrectOption = Array.from(quizSection?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('AIKI sẽ đoán mò hình dáng và màu sắc')
    )
    act(() => firstCorrectOption?.click())

    // Sau khi trả lời đúng mới mở nút sang câu kế tiếp.
    const nextBtn = Array.from(quizSection?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Câu tiếp theo')
    )
    expect(nextBtn).toBeDefined()

    // 2. Click next question
    act(() => {
      nextBtn?.click()
    })

    // Now active: Câu 2 / 2
    expect(quizSection?.textContent).toContain('CÂU 2 / 2')

    // Find Prev button
    const prevBtn = Array.from(quizSection?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Câu trước')
    )
    expect(prevBtn).toBeDefined()

    // 3. Click prev question
    act(() => {
      prevBtn?.click()
    })
    expect(quizSection?.textContent).toContain('CÂU 1 / 2')
  })

  it('handles answering questions, submitting quiz and displays feedback with correct/incorrect indicators and explanations', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialStageIndex={3}
          initialSidebarCollapsed={false}
        />
      )
    })

    const quizSection = container.querySelector('section[data-testid="stage-3-quiz"]')
    expect(quizSection).not.toBeNull()

    // 1. Câu 1: Chọn đáp án A (đúng)
    const optA_Q1 = Array.from(quizSection?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('AIKI sẽ đoán mò hình dáng và màu sắc')
    )
    expect(optA_Q1).toBeDefined()
    act(() => {
      optA_Q1?.click()
    })

    // Nút Nộp bài phải bị disabled vì chưa trả lời đủ 2 câu
    const submitBtn = Array.from(quizSection?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Nộp bài kiểm tra')
    )
    expect(submitBtn?.getAttribute('disabled')).not.toBeNull()

    // Chuyển sang Câu 2
    const nextBtn = Array.from(quizSection?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Câu tiếp theo')
    )
    act(() => {
      nextBtn?.click()
    })

    // 2. Câu 2: Chọn đáp án A (đúng)
    const optA_Q2 = Array.from(quizSection?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Miêu tả càng rõ tranh càng đúng ý')
    )
    expect(optA_Q2).toBeDefined()
    act(() => {
      optA_Q2?.click()
    })

    // Giờ đã trả lời đủ câu -> Nút nộp bài enabled
    expect(submitBtn?.getAttribute('disabled')).toBeNull()

    // 3. Nộp bài
    act(() => {
      submitBtn?.click()
    })

    // Hiển thị kết quả điểm số và giải thích
    expect(quizSection?.textContent).toContain('2/2 điểm')
    expect(quizSection?.textContent).toContain('Miêu tả càng chi tiết thì tranh càng chính xác!')

    // Quay lại câu 1 xem kết quả
    const prevBtn = Array.from(quizSection?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Câu trước')
    )
    act(() => {
      prevBtn?.click()
    })
    expect(quizSection?.textContent).toContain('AI không tự nghĩ được nên phải đoán mò')
  })

  it('provides instant feedback per question when clicking "Kiểm tra đáp án ✨" in Quiz stage', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialStageIndex={3}
          initialSidebarCollapsed={false}
        />
      )
    })

    const quizSection = container.querySelector('section[data-testid="stage-3-quiz"]')
    expect(quizSection).not.toBeNull()

    // 1. Kiểm tra ban đầu: Nút "Kiểm tra đáp án ✨" bị disabled khi chưa chọn phương án
    const checkBtnQ1 = Array.from(quizSection?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Kiểm tra đáp án')
    )
    expect(checkBtnQ1).toBeDefined()
    expect(checkBtnQ1?.getAttribute('disabled')).not.toBeNull()

    // 2. Chọn đáp án đúng cho Câu 1
    const optA_Q1 = Array.from(quizSection?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('AIKI sẽ đoán mò hình dáng và màu sắc')
    )
    expect(optA_Q1).toBeDefined()
    act(() => {
      optA_Q1?.click()
    })

    // Giờ nút kiểm tra đã enabled
    expect(checkBtnQ1?.getAttribute('disabled')).toBeNull()

    // Bấm "Kiểm tra đáp án ✨"
    act(() => {
      checkBtnQ1?.click()
    })

    // Hiện phản hồi tức thì: huy hiệu đúng và hộp giải thích
    expect(quizSection?.textContent).toContain('✓ Đúng rồi!')
    expect(quizSection?.textContent).toContain('AI không tự nghĩ được nên phải đoán mò')

    // Các lựa chọn của câu 1 đã bị disabled sau khi kiểm tra
    expect(optA_Q1?.getAttribute('disabled')).not.toBeNull()

    // Chuyển sang Câu 2
    const nextBtn = Array.from(quizSection?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Câu tiếp theo')
    )
    expect(nextBtn).toBeDefined()
    act(() => {
      nextBtn?.click()
    })

    // Chọn phương án sai cho Câu 2 (phương án B)
    const optB_Q2 = Array.from(quizSection?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Bấm nút liên tục không cần nghĩ')
    )
    expect(optB_Q2).toBeDefined()
    act(() => {
      optB_Q2?.click()
    })

    const checkBtnQ2 = Array.from(quizSection?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Kiểm tra đáp án')
    )
    act(() => {
      checkBtnQ2?.click()
    })

    // Hiện phản hồi tức thì sai: huy hiệu chưa chính xác và hộp giải thích
    expect(quizSection?.textContent).toContain('✕ Chưa chính xác')
    expect(quizSection?.textContent).toContain('Con hãy đọc lại câu hỏi và quan sát hình minh họa rồi thử lại nhé.')
    expect(quizSection?.textContent).not.toContain('Câu tiếp theo')
  })

  it('renders horizontal timeline stepper in Stage 2 Video and seeks player directly when clicking chapter nodes', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialStageIndex={2}
          initialSidebarCollapsed={true}
        />
      )
    })

    const stage2Section = container.querySelector('section[data-testid="stage-2-video"]')
    expect(stage2Section).not.toBeNull()

    // Kiểm tra timeline stepper dàn ngang chuẩn AikiRuleVideoPlayer
    const timelineStepper = stage2Section?.querySelector('[data-testid="video-timeline-stepper"]')
    expect(timelineStepper).not.toBeNull()
    expect(timelineStepper?.textContent).not.toContain('Xem lại video')
    expect(timelineStepper?.textContent).not.toContain('Nghe AIKI giảng')
    expect(timelineStepper?.querySelector('[aria-label="Tua lại từ đầu"]')).not.toBeNull()
    expect(timelineStepper?.textContent).toContain('Tình huống khởi động')

    // Bấm mốc "Thực hành cùng AIKI" (node thứ 3, startSec = 120)
    const node3 = container.querySelector('[data-testid="video-chapter-node-3"]') as HTMLButtonElement
    expect(node3).not.toBeNull()
    act(() => {
      node3.click()
    })

    // Player dùng YouTube API để tua mà không reload iframe; UI tiến độ phải cập nhật.
    const iframe = stage2Section?.querySelector('iframe')
    expect(iframe?.getAttribute('src')).not.toContain('start=120')
    expect(timelineStepper?.textContent).toContain('2:00')
  })

  it('keeps the video canvas compact without generic preparation notices', () => {
    // Bài 1.1 không lặp lại thông báo chuẩn bị video dưới player.
    const root1 = createRoot(container)
    act(() => {
      root1.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Một từ hay năm từ?"
          initialStageIndex={2}
          initialSidebarCollapsed={true}
        />
      )
    })

    const notice = container.querySelector('[data-testid="generic-video-notice"]')
    expect(notice).toBeNull()

    // 2. Bài 1.2 (Dedicated video): Không hiển thị thông báo
    act(() => {
      root1.render(
        <SixStageJourneyView
          journey={{
            ...mockJourney,
            stage3_video: {
              ...mockJourney.stage3_video,
              id: 'bai-1-2-bon-chiec-chia-khoa-stage3-video',
              videoUrl: 'https://www.youtube.com/embed/NMdHhsLY5jc',
            },
          }}
          lessonId="bai-1-2"
          lessonTitle="Bốn chiếc chìa khoá"
          initialStageIndex={2}
          initialSidebarCollapsed={true}
        />
      )
    })
    expect(container.querySelector('[data-testid="generic-video-notice"]')).toBeNull()

    // 3. Bài 1.3 (Dedicated video): Không hiển thị thông báo
    act(() => {
      root1.render(
        <SixStageJourneyView
          journey={{
            ...mockJourney,
            stage3_video: {
              ...mockJourney.stage3_video,
              id: 'bai-1-3-um-ba-la-bien-hinh-stage3-video',
              videoUrl: 'https://www.youtube.com/embed/GCtez_WirtU',
            },
          }}
          lessonId="bai-1-3"
          lessonTitle="Úm ba la... Biến hình"
          initialStageIndex={2}
          initialSidebarCollapsed={true}
        />
      )
    })
    expect(container.querySelector('[data-testid="generic-video-notice"]')).toBeNull()
  })

  it('renders dynamic XP badge from SSOT rewardBadge config and passes correct XP to onFinishLesson callback', () => {
    const onFinishLessonMock = vi.fn()
    const onNavigateNextLessonMock = vi.fn()
    const onBackToMapMock = vi.fn()

    const customJourney: LessonSixStageJourney = {
      ...mockJourney,
      stage6_completion: {
        ...mockJourney.stage6_completion,
        rewardBadge: {
          name: 'Huy hiệu Phù Thủy Ngôn Từ',
          iconUrl: '/assets/trophy-clay-gold.png',
          stars: 3,
          xp: 80,
        },
        nextLessonSlug: 'bai-1-2-bon-chiec-chia-khoa',
      },
    }

    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={customJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialStageIndex={5}
          onFinishLesson={onFinishLessonMock}
          onNavigateNextLesson={onNavigateNextLessonMock}
          onBackToMap={onBackToMapMock}
        />
      )
    })

    const trophyBadge = container.querySelector('[data-testid="stage6-trophy-xp-badge"]')
    expect(trophyBadge).not.toBeNull()
    expect(trophyBadge?.textContent).toContain('+80 XP')

    // Click "👉 Khám Phá Bài Tiếp Theo 🚀"
    const nextBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Khám phá bài tiếp theo')
    )
    expect(nextBtn).toBeDefined()
    act(() => {
      nextBtn?.click()
    })

    expect(onFinishLessonMock).toHaveBeenCalledWith({
      stars: 3,
      xp: 80,
      nextLessonSlug: 'bai-1-2-bon-chiec-chia-khoa',
    })
    expect(onNavigateNextLessonMock).toHaveBeenCalledWith('bai-1-2-bon-chiec-chia-khoa')

    // Click "🗺️ Quay Về Bản Đồ Đảo"
    const backBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Quay về bản đồ đảo')
    )
    expect(backBtn).toBeDefined()
    act(() => {
      backBtn?.click()
    })

    expect(onFinishLessonMock).toHaveBeenCalledWith({
      stars: 3,
      xp: 80,
    })
    expect(onBackToMapMock).toHaveBeenCalled()
  })

  it('allows overriding XP via rewardXp prop and transmits overridden XP to onFinishLesson callback', () => {
    const onFinishLessonMock = vi.fn()
    const onNavigateNextLessonMock = vi.fn()

    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialStageIndex={5}
          rewardXp={100}
          onFinishLesson={onFinishLessonMock}
          onNavigateNextLesson={onNavigateNextLessonMock}
        />
      )
    })

    const trophyBadge = container.querySelector('[data-testid="stage6-trophy-xp-badge"]')
    expect(trophyBadge).not.toBeNull()
    expect(trophyBadge?.textContent).toContain('+100 XP')

    const nextBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Khám phá bài tiếp theo')
    )
    act(() => {
      nextBtn?.click()
    })

    expect(onFinishLessonMock).toHaveBeenCalledWith({
      stars: 3,
      xp: 100,
      nextLessonSlug: mockJourney.stage6_completion.nextLessonSlug,
    })
  })

  it('falls back to lesson poster image instead of hiding image column when quiz image fails or is missing', () => {
    const journeyWithQuizImages: any = {
      ...mockJourney,
      stage4_quiz: {
        id: 'quiz-visual-test',
        title: 'Quiz Layout Test',
        passScore: 1,
        questions: [
          {
            id: 'q-with-img',
            prompt: 'Question with image',
            options: ['A', 'B'],
            correctIndex: 0,
            explanation: 'Why',
            visualUrl: '/assets/aiki-islands/island1_lesson1_cat.jpg',
          },
          {
            id: 'q-without-img',
            prompt: 'Question without image',
            options: ['A', 'B'],
            correctIndex: 0,
            explanation: 'Why',
            visualUrl: '',
          },
        ],
      },
    }

    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={journeyWithQuizImages}
          lessonId="bai-1-1"
          lessonTitle="Layout Test"
          initialStageIndex={3}
        />
      )
    })

    const quizSection = container.querySelector('section[data-testid="stage-3-quiz"]')
    expect(quizSection).not.toBeNull()

    // 1. Question 1 has a valid visual and uses a balanced 2-column desktop layout.
    const imgEl = quizSection?.querySelector('img[src="/assets/aiki-islands/island1_lesson1_cat.jpg"]')
    expect(imgEl).not.toBeNull()
    const imgCol = imgEl?.parentElement?.parentElement
    expect(imgCol).not.toBeNull()
    expect(imgCol?.parentElement?.className).toContain('xl:grid-cols-2')
    expect(imgEl?.parentElement?.className).toContain('xl:max-h-[420px]')

    // Question box shares the other half and grows vertically on large displays.
    const q1Box = imgCol?.nextElementSibling
    expect(q1Box?.className).toContain('xl:min-h-[320px]')
    expect(q1Box?.className).not.toContain('xl:col-span-2')

    // 2. Trigger onError on image -> image should fallback to lesson poster instead of hiding column
    act(() => {
      imgEl?.dispatchEvent(new Event('error'))
    })

    const imgAfterError = quizSection?.querySelector('img')
    expect(imgAfterError).not.toBeNull()
    expect(imgAfterError?.src).toContain('/assets/aiki-islands/island1_lesson1_cat.jpg')

    const imgColAfter = imgAfterError?.parentElement?.parentElement
    expect(imgColAfter).not.toBeNull()
    const q1BoxAfter = imgColAfter?.nextElementSibling
    expect(q1BoxAfter?.className).toContain('xl:min-h-[320px]')
  })

  it('ensures sidebar and backdrop are omitted on mobile viewports without toggle buttons', () => {
    const originalInnerWidth = window.innerWidth
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 390 })

    try {
      const root = createRoot(container)
      act(() => {
        root.render(
          <SixStageJourneyView
            journey={mockJourney}
            lessonId="bai-1-1"
            lessonTitle="Đừng Để AIKI Đoán Mò"
            initialSidebarCollapsed={false}
          />
        )
      })

      // 1. Verify no toggle buttons exist
      expect(container.querySelector('[data-testid="toggle-sidebar-mobile-btn"]')).toBeNull()
      expect(container.querySelector('[data-testid="toggle-sidebar-btn"]')).toBeNull()

      // 2. Sidebar drawer and backdrop are not rendered
      expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()
      expect(container.querySelector('[data-testid="sidebar-overlay-backdrop"]')).toBeNull()
      act(() => root.unmount())
    } finally {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: originalInnerWidth })
    }
  })

  it('verifies image optimization: fetchPriority="high" on Stage 0 hero image and loading="lazy" on options/formula cards', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialSidebarCollapsed={false}
        />
      )
    })

    // 1. Stage 0 hero image has fetchPriority="high" and decoding="async"
    const heroImg = container.querySelector('section[data-testid="stage-0-goal"] img') as HTMLImageElement
    expect(heroImg).not.toBeNull()
    expect(heroImg.getAttribute('fetchpriority')).toBe('high')
    expect(heroImg.getAttribute('decoding')).toBe('async')

    // 2. Formula card images have loading="lazy" and decoding="async"
    const formulaImgs = container.querySelectorAll('section[data-testid="stage-0-goal"] .grid img')
    expect(formulaImgs.length).toBeGreaterThan(0)
    formulaImgs.forEach((img) => {
      expect((img as HTMLImageElement).getAttribute('loading')).toBe('lazy')
      expect((img as HTMLImageElement).getAttribute('decoding')).toBe('async')
    })
    act(() => root.unmount())
  })

  it('verifies sidebar mascot is omitted for full-width learning focus', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialStageIndex={0}
          initialSidebarCollapsed={false}
        />
      )
    })

    expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()
    expect(container.querySelector('[data-testid="aikid-cat-character"]')).toBeNull()
    act(() => root.unmount())
  })

  it('renders Universal 3-Stage Rule Journey with YouTube Video 16:9 for rule-1', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          lessonId="rule-1"
          lessonTitle="Quy tắc 1: Nghĩ ý tưởng trước"
          initialStageIndex={0}
          initialSidebarCollapsed={false}
        />
      )
    })

    // 1. Should have 3 stages in progress indicator
    expect(container.textContent).toContain('Chặng 1/3')

    // 2. YouTube Video iframe 16:9
    const iframe = container.querySelector('iframe')
    expect(iframe).not.toBeNull()
    expect(iframe?.src).toContain('opYm3mvrnqI')

    // 3. Chapter nodes 1-5 in horizontal timeline stepper
    const node1 = container.querySelector('[data-testid="video-chapter-node-1"]')
    const node5 = container.querySelector('[data-testid="video-chapter-node-5"]')
    expect(node1).not.toBeNull()
    expect(node5).not.toBeNull()

    // Rule sidebar is omitted in favor of full-width immersion
    expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()

    act(() => root.unmount())
  })

  it('renders Universal 3-Stage Rule Journey when lessonId is DB UUID and lessonTitle is QT1', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          lessonId="0da9d441-43a0-4d00-84d7-e8f8958e2aad"
          lessonTitle="QT1 — Hãy nghĩ ý tưởng của con, rồi mới chia sẻ với AIKI nhé!"
          initialStageIndex={0}
          initialSidebarCollapsed={false}
        />
      )
    })

    // 1. Should resolve to 3 stages
    expect(container.textContent).toContain('Chặng 1/3')

    // 2. Station label and header should be recognized as Rule 1
    expect(container.textContent).toContain('Quy tắc 1: Nghĩ ý tưởng trước khi hỏi AI')

    // 3. Directly renders YouTube Video iframe
    const iframe = container.querySelector('iframe')
    expect(iframe).not.toBeNull()
    expect(iframe?.src).toContain('opYm3mvrnqI')

    const node5 = container.querySelector('[data-testid="video-chapter-node-5"]')
    expect(node5).not.toBeNull()

    act(() => root.unmount())
  })

  it('verifies sidebar is omitted across screen widths without toggle buttons', () => {
    const originalInnerWidth = window.innerWidth
    try {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 })
      const root = createRoot(container)
      act(() => {
        root.render(
          <SixStageJourneyView
            journey={mockJourney}
            lessonId="bai-1-1"
            lessonTitle="Đừng Để AIKI Đoán Mò"
          />
        )
      })

      // Sidebar and toggles are permanently omitted
      expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()
      expect(container.querySelector('[data-testid="toggle-sidebar-btn"]')).toBeNull()
      expect(container.querySelector('[data-testid="main-learning-canvas"]')?.className).toContain('w-full')

      act(() => root.unmount())
    } finally {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: originalInnerWidth })
    }
  })

  it('maintains zero-sidebar full width canvas on mobile (< 1024px) during stage transitions and window resize', () => {
    const originalInnerWidth = window.innerWidth
    try {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 390 })
      const root = createRoot(container)
      act(() => {
        root.render(
          <SixStageJourneyView
            journey={mockJourney}
            lessonId="bai-1-1"
            lessonTitle="Đừng Để AIKI Đoán Mò"
          />
        )
      })

      expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()
      expect(container.querySelector('[data-testid="main-learning-canvas"]')?.className).toContain('w-full')

      // Advancing stage keeps sidebar null
      const nextBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Đã hiểu mục tiêu')
      )
      expect(nextBtn).toBeDefined()
      act(() => {
        nextBtn?.click()
      })
      expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()

      // Resize event keeps sidebar null
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 768 })
      act(() => {
        window.dispatchEvent(new Event('resize'))
      })
      expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()

      act(() => root.unmount())
    } finally {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: originalInnerWidth })
    }
  })

  it('maintains zero-sidebar full width canvas on mobile (< 1024px) when answering quiz or switching questions', () => {
    const originalInnerWidth = window.innerWidth
    try {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 390 })
      const root = createRoot(container)
      act(() => {
        root.render(
          <SixStageJourneyView
            journey={mockJourney}
            lessonId="bai-1-1"
            lessonTitle="Đừng Để AIKI Đoán Mò"
            initialStageIndex={3} // Quiz stage
          />
        )
      })

      // Starts with no sidebar
      expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()
      expect(container.querySelector('[data-testid="stage-3-quiz"]')).not.toBeNull()

      // Selecting an answer option keeps sidebar null
      const firstOption = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('AIKI sẽ đoán mò')
      )
      expect(firstOption).toBeDefined()
      act(() => {
        firstOption?.click()
      })
      expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()

      // Clicking "Câu tiếp theo" keeps sidebar null
      const nextQBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Câu tiếp theo')
      )
      expect(nextQBtn).toBeDefined()
      act(() => {
        nextQBtn?.click()
      })
      expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()

      act(() => root.unmount())
    } finally {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: originalInnerWidth })
    }
  })

  it('ignores and removes device-local stage data when returning to a lesson', () => {
    const testLessonId = 'bai-1-1'
    mockLocalStorage.setItem(`aikids_lesson_stage_${testLessonId}`, '2') // Chặng 2: Video
    mockLocalStorage.setItem(`aikids_lesson_completed_stages_${testLessonId}`, JSON.stringify([0, 1]))

    try {
      const root = createRoot(container)
      act(() => {
        root.render(
          <SixStageJourneyView
            journey={mockJourney as any}
            lessonId={testLessonId}
            lessonTitle="Test Restore"
          />
        )
      })

      expect(container.textContent).toContain('Chặng 1/6')
      expect(mockLocalStorage.getItem(`aikids_lesson_stage_${testLessonId}`)).toBeNull()
      expect(mockLocalStorage.getItem(`aikids_lesson_completed_stages_${testLessonId}`)).toBeNull()
      act(() => root.unmount())
    } finally {
      mockLocalStorage.removeItem(`aikids_lesson_stage_${testLessonId}`)
      mockLocalStorage.removeItem(`aikids_lesson_completed_stages_${testLessonId}`)
    }
  })

  it('supports retrying a quiz question after wrong answer to reset and choose again', () => {
    const testLessonId = 'bai-retry-test'
    const root = createRoot(container)

    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney as any}
          lessonId={testLessonId}
          lessonTitle="Quiz Retry Test"
          initialStageIndex={3} // Chặng 3: Quiz
        />
      )
    })

    const quizSection = container.querySelector('section[data-testid="stage-3-quiz"]')
    expect(quizSection).not.toBeNull()

    // Chọn một đáp án sai ('AIKI sẽ từ chối vẽ')
    const wrongOpt = Array.from(quizSection?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('AIKI sẽ từ chối vẽ')
    )
    expect(wrongOpt).toBeDefined()
    act(() => {
      wrongOpt?.click()
    })

    // Xuất hiện nhãn chưa chính xác và nút Thử lại câu này
    expect(quizSection?.textContent).toContain('✕ Chưa chính xác')
    const retryBtn = Array.from(quizSection?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Thử lại câu này')
    )
    expect(retryBtn).toBeDefined()

    // Bấm Thử lại câu này
    act(() => {
      retryBtn?.click()
    })

    // Trạng thái trở về chưa chọn/chưa kiểm tra
    expect(quizSection?.textContent).not.toContain('✕ Chưa chính xác')
    act(() => root.unmount())
  })

  it('Quy tắc 1 (QT1): Chặng Reward KHÔNG hiển thị nút Nhận Chứng Chỉ, chỉ hiển thị Khám Phá Bài Tiếp Theo', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          lessonId="rule-1"
          lessonTitle="Quy tắc 1: Nghĩ ý tưởng trước khi hỏi AI"
          initialStageIndex={2}
          onNavigateNextLesson={() => {}}
          onBackToMap={() => {}}
        />
      )
    })

    // Ở Chặng 3 (Reward) của Quy tắc 1, KHÔNG được xuất hiện nút nhận chứng chỉ
    expect(container.textContent).not.toContain('Nhận chứng chỉ hoàn thành khóa học')
    // Phải hiển thị nút chuyển sang bài tiếp theo
    expect(container.textContent).toContain('Khám phá bài tiếp theo')
    expect(container.textContent).toContain('Quay về bản đồ đảo')
    act(() => root.unmount())
  })

  it('Quy tắc 10 (QT10): Chặng Reward CÓ hiển thị nút Nhận Chứng Chỉ vì là trạm cuối', () => {
    const root = createRoot(container)
    const onOpenCourse = vi.fn()
    act(() => {
      root.render(
        <SixStageJourneyView
          lessonId="rule-10"
          lessonTitle="Quy tắc 10: Tự hào tác phẩm của chính con"
          initialStageIndex={2}
          onBackToMap={() => {}}
          onOpenCourse={onOpenCourse}
        />
      )
    })

    // Ở Chặng 3 (Reward) của Quy tắc 10 (trạm cuối), PHẢI có nút nhận chứng chỉ
    expect(container.textContent).toContain('Nhận chứng chỉ hoàn thành khóa học')
    expect(container.textContent).not.toContain('Khám phá bài tiếp theo')
    expect(container.textContent).toContain('Quay về bản đồ đảo')
    expect(container.textContent).toContain('Sang khu khóa học')
    expect(container.textContent).not.toContain('Việc Ngoài Màn Hình (Home Mission)')
    expect(container.textContent).not.toContain('Hành động tiếp theo')
    const courseButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Sang khu khóa học'),
    )
    act(() => courseButton?.click())
    expect(onOpenCourse).toHaveBeenCalledTimes(1)
    act(() => root.unmount())
  })

  it('Đảo 1 bài 1.1: Chặng Reward KHÔNG hiển thị nút Nhận Chứng Chỉ', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Bài 1.1 — Một từ hay năm từ?"
          initialStageIndex={5}
          onNavigateNextLesson={() => {}}
        />
      )
    })

    expect(container.textContent).not.toContain('Nhận chứng chỉ hoàn thành khóa học')
    expect(container.textContent).toContain('Khám phá bài tiếp theo')
    act(() => root.unmount())
  })

  it('Đảo 1 bài 1.4: Chặng Reward CÓ hiển thị nút Nhận Chứng Chỉ vì là trạm cuối của Đảo 1', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-4"
          lessonTitle="Bài 1.4 — Kỹ sư tài ba"
          initialStageIndex={5}
          onNavigateNextLesson={() => {}}
        />
      )
    })

    expect(container.textContent).toContain('Nhận chứng chỉ hoàn thành khóa học')
    act(() => root.unmount())
  })

  it('never resumes to final REWARD stage from localStorage and cleans up corrupted cache', () => {
    const testLessonId = 'rule-2'
    // Stale cache pointing to final stage 2 of 3-stage rule journey
    mockLocalStorage.setItem(`aikids_lesson_stage_${testLessonId}`, '2')
    mockLocalStorage.setItem(`aikids_lesson_completed_stages_${testLessonId}`, JSON.stringify([0, 1, 2]))

    try {
      const root = createRoot(container)
      act(() => {
        root.render(
          <SixStageJourneyView
            lessonId={testLessonId}
            lessonTitle="Quy tắc 2"
          />
        )
      })

      // Must start at Stage 0 (Chặng 1/3: Video bài giảng) and NOT jump to Stage 2 (Vinh danh Hiệp Sĩ)
      expect(container.textContent).toContain('Chặng 1/3')
      expect(container.textContent).not.toContain('Vinh danh Hiệp Sĩ Sáng Tạo')
      // Corrupted final stage cache must NOT remain
      expect(mockLocalStorage.getItem(`aikids_lesson_stage_${testLessonId}`)).toBeNull()
      expect(mockLocalStorage.getItem(`aikids_lesson_completed_stages_${testLessonId}`)).toBeNull()
      act(() => root.unmount())
    } finally {
      mockLocalStorage.removeItem(`aikids_lesson_stage_${testLessonId}`)
      mockLocalStorage.removeItem(`aikids_lesson_completed_stages_${testLessonId}`)
    }
  })

  it('resets stage to 0 when lessonId changes on same instance', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          lessonId="rule-1"
          lessonTitle="Quy tắc 1"
          initialStageIndex={1}
        />
      )
    })

    expect(container.textContent).toContain('Chặng 2/3')

    // Change lessonId to rule-2 on same instance
    act(() => {
      root.render(
        <SixStageJourneyView
          lessonId="rule-2"
          lessonTitle="Quy tắc 2"
        />
      )
    })

    // Must reset to Chặng 1/3
    expect(container.textContent).toContain('Chặng 1/3')
    act(() => root.unmount())
  })

  it('requests server-side completion without minting local rewards when reaching REWARD stage', () => {
    const onFinishSpy = vi.fn()
    const eventSpy = vi.fn()
    window.addEventListener('aikids:lesson-completed', eventSpy)

    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          lessonId="rule-1"
          lessonTitle="Quy tắc 1: AI không tự nghĩ được"
          initialStageIndex={2} // Chặng 3/3: REWARD (Vinh danh Hiệp Sĩ)
          onFinishLesson={onFinishSpy}
        />
      )
    })

    // Expect onFinishLesson to have been called automatically
    expect(onFinishSpy).toHaveBeenCalledTimes(1)
    expect(onFinishSpy).toHaveBeenCalledWith(expect.objectContaining({
      stars: expect.any(Number),
      xp: expect.any(Number),
      answers: expect.arrayContaining([
        expect.objectContaining({
          questionId: expect.any(String),
          optionIndex: expect.any(Number),
        }),
      ]),
    }))

    // The view only requests completion. LessonPage dispatches the event and
    // updates its cache after the LMS confirms the submitted learner answers.
    expect(mockLocalStorage.getItem('aikids_completed_lessons')).toBeNull()
    expect(mockLocalStorage.getItem('aikids_golden_rules_progress_v1')).toBeNull()
    expect(eventSpy).not.toHaveBeenCalled()
    window.removeEventListener('aikids:lesson-completed', eventSpy)

    act(() => root.unmount())
  })

  it('accumulates 3 stars step by step for Rule Lesson: 0 initial -> 1 on video completion (>= 75%) -> 2 on quiz correct -> 3 on reward stage', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          lessonId="rule-1"
          lessonTitle="Quy tắc 1: AI không tự nghĩ được"
        />
      )
    })

    // 1. Initial state at Stage 0 (Video / Slide Cinema): stars must be 0!
    const headerPill = container.querySelector('[data-testid="star-badge-header"]')
    expect(headerPill).not.toBeNull()
    expect(headerPill?.textContent).toContain('0/3')

    // Video completed badge should not be visible yet
    expect(container.querySelector('[data-testid="video-completed-badge"]')).toBeNull()

    // 2. Click chapter node 4 (index 3 out of 5 slides, >= 75%)
    const chapterNode4 = container.querySelector('[data-testid="video-chapter-node-4"]') as HTMLButtonElement | null
    expect(chapterNode4).not.toBeNull()
    act(() => {
      chapterNode4?.click()
    })

    // Progress is represented once in the compact header pill.
    expect(headerPill?.textContent).toContain('1/3')
    expect(container.querySelector('[data-testid="video-completed-badge"]')).toBeNull()

    // Click next to reach the final slide
    const nextSlideBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Kế tiếp')
    )
    act(() => {
      nextSlideBtn?.click()
    })

    // 3. Advance to Stage 1 (Quiz)
    const continueBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Tiếp tục sang Thử Tài Phản Xạ')
    )
    expect(continueBtn).toBeDefined()
    act(() => {
      continueBtn?.click()
    })

    // Now at Stage 1 (Quiz). Still 1/3 stars before answering quiz correctly!
    expect(container.querySelector('[data-testid="stage-3-quiz"]')).not.toBeNull()
    expect(headerPill?.textContent).toContain('1/3')

    // Select the correct option for quiz (Sonet's own idea, option index 1)
    const options = container.querySelectorAll('[data-testid="stage-3-quiz"] button')
    const sonetOption = Array.from(options).find((b) =>
      b.textContent?.includes('ý riêng của Sonet')
    )
    expect(sonetOption).toBeDefined()
    act(() => {
      ;(sonetOption as HTMLButtonElement)?.click()
    })

    // Now quiz is correct: 2 stars earned!
    expect(headerPill?.textContent).toContain('2/3')

    // Click "Câu tiếp theo" to go to Question 2
    const nextQBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Câu tiếp theo')
    )
    expect(nextQBtn).toBeDefined()
    act(() => {
      nextQBtn?.click()
    })

    // Answer Question 2 correctly
    const q2Options = container.querySelectorAll('[data-testid="stage-3-quiz"] button')
    const q2CorrectOpt = Array.from(q2Options).find((b) =>
      b.textContent?.includes('quen thuộc nhất trong kho hình')
    )
    expect(q2CorrectOpt).toBeDefined()
    act(() => {
      ;(q2CorrectOpt as HTMLButtonElement)?.click()
    })

    // Click "Nộp bài kiểm tra"
    const submitBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Nộp bài kiểm tra')
    )
    expect(submitBtn).toBeDefined()
    act(() => {
      submitBtn?.click()
    })

    // Advance to Stage 2 (Reward)
    const rewardBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Vinh danh Hiệp sĩ') || b.textContent?.includes('Tiếp tục')
    )
    expect(rewardBtn).toBeDefined()
    act(() => {
      rewardBtn?.click()
    })

    // 4. Now at Stage 2 (Reward): 3 stars earned!
    expect(container.querySelector('[data-testid="stage-5-completion"]')).not.toBeNull()
    expect(headerPill?.textContent).toContain('3/3')

    // Stars shown during the journey are pedagogical UI state only. Persistent
    // rewards remain server-owned until LessonPage receives LMS confirmation.
    expect(mockLocalStorage.getItem('aikids_completed_lessons')).toBeNull()
    expect(mockLocalStorage.getItem('aikids_golden_rules_progress_v1')).toBeNull()

    act(() => root.unmount())
  })

  it('accumulates 3 stars step by step for 6-stage Island Lesson: 0 initial -> 1 on video completion -> 2 on quiz pass -> 3 on practice submit / reward', async () => {
    vi.useFakeTimers()
    const root = createRoot(container)
    await act(async () => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AIKI Đoán Mò"
          initialSidebarCollapsed={false}
        />
      )
    })

    const headerPill = container.querySelector('[data-testid="star-badge-header"]')
    expect(headerPill).not.toBeNull()

    // 1. Initial state at Stage 0 (Goal): exactly 0/3 stars!
    expect(headerPill?.textContent).toContain('0/3')
    expect(container.querySelector('[data-testid="stage-0-goal"]')).not.toBeNull()

    // Advance to Stage 1 (Confirm Goal)
    const goalBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Đã hiểu mục tiêu')
    )
    expect(goalBtn).toBeDefined()
    await act(async () => {
      goalBtn?.click()
    })

    // 2. Stage 1 (Confirm Goal): still 0/3 stars!
    expect(container.querySelector('[data-testid="stage-1-confirm"]')).not.toBeNull()
    expect(headerPill?.textContent).toContain('0/3')

    // Select correct answer in Confirm Goal (option 0)
    const confirmOptions = container.querySelectorAll('[data-testid="stage-1-confirm"] button')
    expect(confirmOptions.length).toBeGreaterThanOrEqual(2)
    await act(async () => {
      ;(confirmOptions[0] as HTMLButtonElement)?.click()
    })

    // Advance to Stage 2 (Video)
    const toVideoBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Xem video bài học')
    )
    expect(toVideoBtn).toBeDefined()
    await act(async () => {
      toVideoBtn?.click()
    })

    // 3. Stage 2 (Video): still 0/3 stars before completing video!
    expect(container.querySelector('[data-testid="stage-2-video"]')).not.toBeNull()
    expect(headerPill?.textContent).toContain('0/3')
    expect(container.querySelector('[data-testid="video-completed-badge"]')).toBeNull()

    // Click chapter node 3 (startSec: 120s / 180s, which is chapter index 2 >= length - 2)
    const chapterNode3 = container.querySelector('[data-testid="video-chapter-node-3"]') as HTMLButtonElement | null
    expect(chapterNode3).not.toBeNull()
    await act(async () => {
      chapterNode3?.click()
    })

    // Progress is represented once in the compact header pill.
    expect(headerPill?.textContent).toContain('1/3')
    expect(container.querySelector('[data-testid="video-completed-badge"]')).toBeNull()

    // Advance to Stage 3 (Quiz)
    const toQuizBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Làm bài test thử tài')
    )
    expect(toQuizBtn).toBeDefined()
    await act(async () => {
      toQuizBtn?.click()
    })

    // 4. Stage 3 (Quiz): still 1/3 stars before answering quiz!
    expect(container.querySelector('[data-testid="stage-3-quiz"]')).not.toBeNull()
    expect(headerPill?.textContent).toContain('1/3')

    // Answer Q1 correctly (opt 0: AIKI sẽ đoán mò)
    const q1Options = container.querySelectorAll('[data-testid="stage-3-quiz"] button')
    const q1Correct = Array.from(q1Options).find((b) =>
      b.textContent?.includes('AIKI sẽ đoán mò')
    )
    expect(q1Correct).toBeDefined()
    await act(async () => {
      ;(q1Correct as HTMLButtonElement)?.click()
    })

    // Click "Câu tiếp theo"
    const nextQBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Câu tiếp theo')
    )
    expect(nextQBtn).toBeDefined()
    await act(async () => {
      nextQBtn?.click()
    })

    // Answer Q2 correctly (opt 0: Miêu tả càng rõ)
    const q2Options = container.querySelectorAll('[data-testid="stage-3-quiz"] button')
    const q2Correct = Array.from(q2Options).find((b) =>
      b.textContent?.includes('Miêu tả càng rõ')
    )
    expect(q2Correct).toBeDefined()
    await act(async () => {
      ;(q2Correct as HTMLButtonElement)?.click()
    })

    // Submit quiz
    const submitQuizBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Nộp bài kiểm tra')
    )
    expect(submitQuizBtn).toBeDefined()
    await act(async () => {
      submitQuizBtn?.click()
    })

    // Quiz passed: 2 stars earned!
    expect(headerPill?.textContent).toContain('2/3')

    // Preload practice artwork in session cache so the student has an artwork to submit
    mockLocalStorage.setItem(
      'aiki_studio_session_bai-1-1',
      JSON.stringify([
        {
          id: 'img-bai-1-1-artwork',
          url: '/assets/aiki-islands/island1_lesson1_cat.jpg',
          prompt: 'Chú mèo mướp béo nằm ngủ',
          time: '08:30',
          turn: 1,
          partIndex: 0,
          partTurn: 1,
        },
      ])
    )

    // Advance to Stage 4 (Practice)
    await act(async () => {
      await import('./AikiStudioWorkspace')
    })
    const toPracticeBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Vào Xưởng Sáng Tạo AI') || b.textContent?.includes('Vào xưởng')
    )
    expect(toPracticeBtn).toBeDefined()
    await act(async () => {
      toPracticeBtn?.click()
    })
    await act(async () => {
      await Promise.resolve()
    })

    // 5. Stage 4 (Practice): still 2/3 stars before submitting artwork!
    expect(container.querySelector('[data-testid="stage-4-practice"]')).not.toBeNull()
    expect(headerPill?.textContent).toContain('2/3')

    // Open submit modal in practice studio
    const submitStudioBtn = container.querySelector('[data-testid="studio-submit-btn"]') as HTMLButtonElement | null
    expect(submitStudioBtn).not.toBeNull()
    await act(async () => {
      submitStudioBtn?.click()
    })

    // Confirm submit in studio modal
    const confirmSubmitBtn = document.querySelector('[data-testid="studio-confirm-submit"]') as HTMLButtonElement | null
    expect(confirmSubmitBtn).not.toBeNull()
    await act(async () => {
      confirmSubmitBtn?.click()
    })

    // Fast-forward the submission timeout (1400ms) to advance to Stage 5 (Reward)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500)
    })

    // 6. Stage 5 (Reward): 3 stars earned!
    expect(container.querySelector('[data-testid="stage-5-completion"]')).not.toBeNull()
    expect(headerPill?.textContent).toContain('3/3')

    // Client-side stage progress must not persist authoritative rewards.
    expect(mockLocalStorage.getItem('aikids_completed_lessons')).toBeNull()
    expect(mockLocalStorage.getItem('aikids_golden_rules_progress_v1')).toBeNull()

    vi.useRealTimers()
    act(() => root.unmount())
  })

  it('renders REWARD stage smoothly when journey is undefined without crashing or throwing errors', async () => {
    const root = createRoot(container)
    const ruleStages = adaptRuleToStages(AIKI_RULES_DATA[0])
    const onFinishLesson = vi.fn()
    const onNavigateNextLesson = vi.fn()

    await act(async () => {
      root.render(
        <SixStageJourneyView
          journey={undefined}
          stages={ruleStages}
          lessonId="rule-1"
          lessonTitle="Quy tắc 1: Không Nói Bừa Khi Dùng AI"
          initialStageIndex={2}
          onFinishLesson={onFinishLesson}
          onNavigateNextLesson={onNavigateNextLesson}
          initialSidebarCollapsed={false}
        />
      )
    })

    // Verify stage REWARD / completion section rendered without crashing
    expect(container.querySelector('[data-testid="stage-5-completion"]')).not.toBeNull()
    expect(container.textContent).toContain('Chúc mừng Hiệp Sĩ Quy Tắc 1!')
    expect(container.textContent).toContain('Huy hiệu QT1: Nghĩ ý tưởng trước khi hỏi AI')
    expect(container.textContent).toContain('Khám phá bài tiếp theo')

    // Verify sidebar is omitted in favor of full-width completion canvas
    expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()

    act(() => root.unmount())
  })

  it('keeps the AIKI assistant completely hidden by default in regular courses on wide screens', () => {
    const originalInnerWidth = window.innerWidth
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1600 })
    const root = createRoot(container)

    try {
      act(() => {
        root.render(
          <SixStageJourneyView
            journey={mockJourney}
            lessonId="bai-1-1"
            lessonTitle="Đừng Để AIKI Đoán Mò"
            initialStageIndex={0}
          />
        )
      })

      expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()
      expect(container.querySelector('[data-testid="aiki-compact-rail"]')).toBeNull()
      expect(container.querySelector('[data-testid="toggle-sidebar-btn"]')).toBeNull()
    } finally {
      act(() => root.unmount())
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: originalInnerWidth })
    }
  })

  it('omits companion sidebar and compact rail in Rule journeys', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          lessonId="rule-1"
          lessonTitle="Quy tắc 1: Nghĩ ý tưởng trước khi hỏi AI"
          initialStageIndex={0}
        />
      )
    })

    expect(container.querySelector('[data-testid="aiki-compact-rail"]')).toBeNull()
    expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()

    act(() => root.unmount())
  })

  it('verifies Layout Defense Engine on short viewport height: responsive video classes and omitted sidebar', async () => {
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="test-lesson-layout-defense"
          lessonTitle="Bảo vệ Giao diện Chiều cao Thấp"
          studentStars={42}
          initialStageIndex={2}
          initialSidebarCollapsed={false}
        />
      )
    })

    // 1. Check Video Stage container has flex-1 overflow-y-auto and responsive height classes
    const videoSection = container.querySelector('[data-testid="stage-2-video"]') as HTMLElement
    expect(videoSection).not.toBeNull()
    expect(videoSection.className).toContain('overflow-y-auto')
    expect(videoSection.className).toContain('flex-1')

    // Check video iframe wrapper has expanded responsive dimensions
    const iframeWrapper = videoSection.querySelector('iframe')?.parentElement as HTMLElement
    expect(iframeWrapper).not.toBeNull()
    expect(iframeWrapper.className).toContain('aspect-video')
    expect(iframeWrapper.style.width).toContain('100dvh - 190px')
    expect(iframeWrapper.style.maxHeight).toContain('100dvh - 190px')

    // 2. Check timeline stepper has low-height responsive padding
    const stepper = container.querySelector('[data-testid="video-timeline-stepper"]') as HTMLElement
    expect(stepper).not.toBeNull()
    expect(stepper.className).toContain('[@media(max-height:760px)]:py-1')
    expect(stepper.className).toContain('overflow-hidden')
    expect(stepper.className).toContain('lg:h-fit')
    expect(stepper.className).toContain('lg:max-h-full')
    expect(stepper.className).toContain('lg:self-start')

    // Vertical chapter labels must be taller than their viewport and scroll
    // inside the track instead of painting over the pinned continue button.
    const chapterTrack = stepper.querySelector('[data-testid="video-chapter-node-1"]')
      ?.parentElement?.parentElement as HTMLElement
    expect(chapterTrack.className).toContain('lg:h-max')
    expect(chapterTrack.className).toContain('lg:min-h-full')
    expect(chapterTrack.firstElementChild?.className).toContain('lg:shrink-0')

    // 3. Check sidebar is omitted and main canvas is full width
    expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()
    const mainCanvas = container.querySelector('[data-testid="main-learning-canvas"]')
    expect(mainCanvas?.className).toContain('w-full')
  })
})
