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
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { SixStageJourneyView } from './SixStageJourneyView'
import type { LessonSixStageJourney } from '@/shared/lib/api'

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
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
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

    // Right Column: Companion Sidebar with AIKI Tip & Key points
    const sidebar = container.querySelector('[data-testid="interactive-sidebar"]')
    expect(sidebar).not.toBeNull()
    expect(sidebar?.textContent).toContain('Chặng 1/6: Mục tiêu')
    expect(sidebar?.textContent).toContain('AIKI Đồng Hành')
    expect(sidebar?.textContent).toContain('LỜI THOẠI CỦA AIKI')
    expect(sidebar?.textContent).toContain('Mẹo Vàng Của AIKI')
    expect(sidebar?.textContent).toContain('Nhiệm vụ chặng này')
    expect(sidebar?.textContent).toContain('42 Sao tích lũy')
  })

  it('renders teacher drag-and-drop blocks appended to the matching course stage', () => {
    const root = createRoot(container)
    act(() => {
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

    const sidebar = container.querySelector('[data-testid="interactive-sidebar"]')
    expect(sidebar?.textContent).toContain('Chặng 2/6: Xác nhận')
    expect(sidebar?.textContent).toContain('AIKI Cố Vấn')
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
    expect(container.textContent).toContain('🎬 Xem video bài học thôi nào →')

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

    const sidebar = container.querySelector('[data-testid="interactive-sidebar"]')
    expect(sidebar?.textContent).toContain('Chặng 3/6: Video')
    expect(sidebar?.textContent).toContain('Thầy Giáo AIKI')
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

    // Sidebar now offers action to enter workshop
    const sidebar = container.querySelector('[data-testid="interactive-sidebar"]')
    expect(sidebar?.textContent).toContain('Vào xưởng thực hành')
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
    expect(container.textContent).toContain('👉 Khám Phá Bài Tiếp Theo 🚀')

    const sidebar = container.querySelector('[data-testid="interactive-sidebar"]')
    expect(sidebar?.textContent).toContain('Chặng 6/6: Hoàn thành')
    expect(sidebar?.textContent).toContain('Thần Đèn AIKI')

    const nextLessonBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Khám Phá Bài Tiếp Theo')
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
    expect(stage5Section?.textContent).toContain('👉 Khám Phá Bài Tiếp Theo 🚀')

    // 5. Floating drawer sidebar with backdrop at Stage 5
    const backdrop = container.querySelector('[data-testid="sidebar-overlay-backdrop"]')
    expect(backdrop).not.toBeNull()

    const sidebar = container.querySelector('[data-testid="interactive-sidebar"]')
    expect(sidebar).not.toBeNull()
    expect(sidebar?.className).toContain('fixed')
    expect(sidebar?.textContent).toContain('✕ Đóng')

    // Clicking close button closes the floating drawer
    const closeBtn = Array.from(sidebar?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('✕ Đóng')
    )
    act(() => {
      closeBtn?.click()
    })
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

  it('verifies Stage 0 (Chặng 1) layout has 2 columns: left image container with aspect-[4/3] max-h-[380px] object-contain, right objective and 2x2 formula keys', () => {
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

    // Left Column: Image container with aspect-[4/3] and max-h-[380px] object-contain
    const leftCol = twoColContainer?.children[0]
    expect(leftCol?.className).toContain('lg:w-1/2')
    const imgContainer = leftCol?.querySelector('.aspect-\\[4\\/3\\]')
    expect(imgContainer?.className).toContain('max-h-[380px]')
    const heroImg = leftCol?.querySelector('img')
    expect(heroImg?.className).toContain('object-contain')

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
    expect(iframe?.getAttribute('src')).toBe('https://www.youtube.com/embed/NMdHhsLY5jc')

    // Timestamps are cleanly displayed in Companion Sidebar (Interactive Chapters)
    const sidebar = container.querySelector('[data-testid="interactive-sidebar"]')
    expect(sidebar).not.toBeNull()
    expect(sidebar?.textContent).toContain('Mốc Phân Đoạn Video')
    expect(sidebar?.textContent).toContain('Tình huống khởi động')
    expect(sidebar?.textContent).toContain('Bí kíp 4 chìa khóa')

    // Clicking a timestamp seeks video player in Mainbar
    const chapterBtn = Array.from(sidebar?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Bí kíp 4 chìa khóa')
    )
    expect(chapterBtn).toBeDefined()
    act(() => {
      chapterBtn?.click()
    })
    expect(stage2Section?.querySelector('iframe')?.getAttribute('src')).toContain('start=45')

    // Action button footer container
    const footerAction = stage2Section?.querySelector('.flex.justify-between.items-center.pt-1')
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

    // 2-column layout container uses md:flex-row
    const twoColContainer = container.querySelector('.flex.flex-col.md\\:flex-row')
    expect(twoColContainer).not.toBeNull()

    // Sidebar uses md:w-[300px]
    const sidebar = container.querySelector('[data-testid="interactive-sidebar"]')
    expect(sidebar?.className).toContain('md:w-[300px]')
    expect(sidebar?.className).toContain('lg:w-[360px]')
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

    // Interactive sidebar is visible at Stage 4 as a floating slide-over drawer with backdrop
    const backdrop = container.querySelector('[data-testid="sidebar-overlay-backdrop"]')
    expect(backdrop).not.toBeNull()

    const sidebar = container.querySelector('[data-testid="interactive-sidebar"]')
    expect(sidebar).not.toBeNull()
    expect(sidebar?.className).toContain('fixed')
    expect(sidebar?.textContent).toContain('✕ Đóng')

    // Sidebar displays 4 practice steps clearly
    expect(sidebar?.textContent).toContain('Tiến Trình 4 Bước Thực Hành')
    expect(sidebar?.textContent).toContain('Bước 1: Thử câu lệnh ban đầu (1-2 từ)')
    expect(sidebar?.textContent).toContain('Bước 2: Thêm hình dáng & màu sắc')
    expect(sidebar?.textContent).toContain('Bước 3: Hoàn thiện câu lệnh 5 chi tiết vàng')
    expect(sidebar?.textContent).toContain('Bước 4: Soi kỹ tranh & nộp vào Balo')

    // Sidebar displays AIKI golden motto & locked features
    expect(sidebar?.textContent).toContain('MẸO VÀNG CỦA AIKI')
    expect(sidebar?.textContent).toContain('Tả càng rõ, tranh càng đúng ý!')
    expect(sidebar?.textContent).toContain('Mật mã đặc điểm vàng')
    expect(sidebar?.textContent).toContain('mèo mướp vàng béo tròn')
    expect(sidebar?.textContent).toContain('↺ Xem lại video bài giảng')

    // Clicking close button closes the floating drawer
    const closeBtn = Array.from(sidebar?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('✕ Đóng')
    )
    expect(closeBtn).toBeDefined()
    act(() => {
      closeBtn?.click()
    })
    expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()
  })

  it('verifies specialized sidebar widgets across Stages 0, 1, 3, and 5 according to pedagogical design', () => {
    const root = createRoot(container)

    // Stage 0: 4-slot formula & AIKI advice
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
    expect(sidebar0?.textContent).toContain('Mẹo Vàng Của AIKI')
    expect(sidebar0?.textContent).toContain('Bí Kíp Vàng')
    expect(sidebar0?.textContent).toContain('LỜI THOẠI CỦA AIKI')
    expect(sidebar0?.textContent).not.toContain('LỜI DẶN DÒ TỪ AIKI')

    // Bốn Chiếc Chìa Khóa Mở Khóa Câu Lệnh được hiển thị ở Main Learning Canvas
    const main0 = container.querySelector('[data-testid="stage-0-goal"]')
    expect(main0?.textContent).toContain('BỐN CHIẾC CHÌA KHÓA MỞ KHÓA CÂU LỆNH')
    expect(main0?.textContent).toContain('CÁI GÌ')
    expect(main0?.textContent).toContain('TRÔNG THẾ NÀO')
    expect(main0?.textContent).toContain('ĐANG LÀM GÌ')
    expect(main0?.textContent).toContain('Ở ĐÂU')

    // Stage 1: Cheat-sheet
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
    expect(sidebar1?.textContent).toContain('Bảng Gợi Ý Mật Mã')
    expect(sidebar1?.textContent).toContain('Cheat-sheet')
    expect(sidebar1?.textContent).toContain('LỜI THOẠI CỦA AIKI')
    expect(sidebar1?.textContent).not.toContain('CỐ VẤN AIKI DẶN DÒ')

    // Stage 3: Live Scoreboard and AIKI Advisor
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
    expect(sidebar3?.textContent).toContain('Bảng Điểm Trực Tiếp')
    expect(sidebar3?.textContent).toContain('GÓC CỐ VẤN AIKI')

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
    expect(sidebar3?.textContent).toContain('✓ Đã đúng 2/2 câu để mở Xưởng!')
    expect(sidebar3?.textContent).toContain('ĐÃ ĐẠT CHUẨN')

    // Stage 5: Rewards, Home Mission & Next Lesson Teaser
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
    expect(sidebar5?.textContent).toContain('Tổng Kết Phần Thưởng')
    expect(sidebar5?.textContent).toContain('+3 Sao')
    expect(sidebar5?.textContent).toContain('+5 Xu')
    expect(sidebar5?.textContent).toContain('+50 XP')
    expect(sidebar5?.textContent).toContain('Việc Ngoài Màn Hình (Home Mission)')
    expect(sidebar5?.textContent).toContain('Bé hãy đem tranh khoe với bố mẹ ngay bây giờ, đố bố mẹ đoán xem bé đã vẽ gì nhé!')
    expect(sidebar5?.textContent).toContain('TEASER BÀI HỌC TIẾP THEO')
  })

  it('renders 4 practice items/parts widget in Stage 4 sidebar and switches workspace parts on click', () => {
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

    const sidebar = container.querySelector('[data-testid="interactive-sidebar"]')
    expect(sidebar).not.toBeNull()

    // 1. Kiểm tra Khối Bốn món đồ của các cậu
    expect(sidebar?.textContent).toContain('Bốn món đồ của các cậu')
    expect(sidebar?.textContent).toContain('Bài này có 4 phần. Mỗi phần 2 lượt tạo.')
    expect(sidebar?.textContent).toContain('Chỉ 4 lượt chọn')

    // 2. 4 Cards món đồ
    const part1Btn = sidebar?.querySelector('[data-testid="sidebar-practice-part-1"]') as HTMLButtonElement
    const part2Btn = sidebar?.querySelector('[data-testid="sidebar-practice-part-2"]') as HTMLButtonElement
    const part3Btn = sidebar?.querySelector('[data-testid="sidebar-practice-part-3"]') as HTMLButtonElement
    const part4Btn = sidebar?.querySelector('[data-testid="sidebar-practice-part-4"]') as HTMLButtonElement

    expect(part1Btn).not.toBeNull()
    expect(part2Btn).not.toBeNull()
    expect(part3Btn).not.toBeNull()
    expect(part4Btn).not.toBeNull()

    // Mặc định part 1 đang làm
    expect(part1Btn.textContent).toContain('PHẦN 1 - ĐANG LÀM')
    expect(part1Btn.textContent).toContain('Con cún')
    expect(part2Btn.textContent).toContain('PHẦN 2 - CHỜ')
    expect(part2Btn.textContent).toContain('Cái xe đạp')

    // 3. Click chọn Phần 2 -> chuyển sang ĐANG LÀM
    act(() => {
      part2Btn.click()
    })

    expect(part2Btn.textContent).toContain('PHẦN 2 - ĐANG LÀM')

    // 4. Mẹo vàng AIKI và nút Tua lại video
    expect(sidebar?.textContent).toContain('MẸO VÀNG CỦA AIKI')
    expect(sidebar?.textContent).toContain('↺ Tua lại video')
  })

  it('loads correct 6 standard expressions for Station 3.3 (bai-3-3)', () => {
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

    const sidebar = container.querySelector('[data-testid="interactive-sidebar"]')
    expect(sidebar).not.toBeNull()

    // 6 expression cards in sidebar for Station 3.3
    const part1Btn = sidebar?.querySelector('[data-testid="sidebar-practice-part-1"]') as HTMLButtonElement
    const part2Btn = sidebar?.querySelector('[data-testid="sidebar-practice-part-2"]') as HTMLButtonElement
    const part3Btn = sidebar?.querySelector('[data-testid="sidebar-practice-part-3"]') as HTMLButtonElement
    const part4Btn = sidebar?.querySelector('[data-testid="sidebar-practice-part-4"]') as HTMLButtonElement

    expect(part1Btn).not.toBeNull()
    expect(part2Btn).not.toBeNull()
    expect(part3Btn).not.toBeNull()
    expect(part4Btn).not.toBeNull()

    expect(part1Btn.textContent).toContain('Biểu cảm Vui 😊')
    expect(part2Btn.textContent).toContain('Biểu cảm Buồn 😢')
    expect(part3Btn.textContent).toContain('Biểu cảm Sợ 😨')
    expect(part4Btn.textContent).toContain('Biểu cảm Giận 😠')
  })

  it('loads correct 4 TCG champions and card-forge engine for Station 3.1 (bai-3-1)', async () => {
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

    const sidebar = container.querySelector('[data-testid="interactive-sidebar"]')
    expect(sidebar).not.toBeNull()

    const part1Btn = sidebar?.querySelector('[data-testid="sidebar-practice-part-1"]') as HTMLButtonElement
    const part2Btn = sidebar?.querySelector('[data-testid="sidebar-practice-part-2"]') as HTMLButtonElement
    const part3Btn = sidebar?.querySelector('[data-testid="sidebar-practice-part-3"]') as HTMLButtonElement
    const part4Btn = sidebar?.querySelector('[data-testid="sidebar-practice-part-4"]') as HTMLButtonElement

    expect(part1Btn).not.toBeNull()
    expect(part2Btn).not.toBeNull()
    expect(part3Btn).not.toBeNull()
    expect(part4Btn).not.toBeNull()

    expect(part1Btn.textContent).toContain('Hiệp Sĩ Cáo Lửa')
    expect(part2Btn.textContent).toContain('Rồng Băng Bão Tuyết')
    expect(part3Btn.textContent).toContain('Sư Tử Lửa Cuồng Nộ')
    expect(part4Btn.textContent).toContain('Đại Bàng Lôi Thần')

    // CardForgeEngine is rendered
    expect(container.querySelector('[data-testid="card-forge-engine"]')).not.toBeNull()
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
    expect(stage1?.textContent).toContain('🎬 Xem video bài học thôi nào →')
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
    expect(badge?.textContent).toContain('🐱')

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
    expect(badge2?.textContent).toContain('🔑')
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
    expect(stage1?.textContent).toContain('🎬 Xem video bài học thôi nào →')
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

    // Find Next button
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
    expect(quizSection?.textContent).toContain('Câu cuối cùng')

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
    expect(quizSection?.textContent).toContain('Miêu tả càng chi tiết thì tranh càng chính xác!')
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
    expect(timelineStepper?.textContent).toContain('Xem lại video')
    expect(timelineStepper?.textContent).toContain('Nghe AIKI giảng')
    expect(timelineStepper?.textContent).toContain('Tình huống khởi động')

    // Bấm mốc "Thực hành cùng AIKI" (node thứ 3, startSec = 120)
    const node3 = container.querySelector('[data-testid="video-chapter-node-3"]') as HTMLButtonElement
    expect(node3).not.toBeNull()
    act(() => {
      node3.click()
    })

    // iframe URL cập nhật tua tới giây 120
    const iframe = stage2Section?.querySelector('iframe')
    expect(iframe?.getAttribute('src')).toContain('start=120')
  })

  it('renders warm notice when lesson uses generic AIKid video and hides it for dedicated lessons 1.2 and 1.3', () => {
    // 1. Bài 1.1 (Generic video): Phải hiển thị thông báo ấm áp của AIKI
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
    expect(notice).not.toBeNull()
    expect(notice?.textContent).toContain('Video bài học chuyên sâu của trạm này đang được AIKI chuẩn bị!')
    expect(notice?.textContent).toContain('Bạn hãy xem video bí kíp của AIKI ở trên hoặc bấm "Tiếp tục" để làm trắc nghiệm & thực hành nhé ✨')

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
      b.textContent?.includes('Khám Phá Bài Tiếp Theo')
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
      b.textContent?.includes('Quay Về Bản Đồ Đảo')
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
      b.textContent?.includes('Khám Phá Bài Tiếp Theo')
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

  it('hides image column and expands question box to md:col-span-12 when quiz has no image or image fails to load', () => {
    const journeyWithQuizImages: LessonSixStageJourney = {
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

    // 1. Question 1 has valid visualUrl -> image column (md:col-span-5) is visible, question box has md:col-span-7
    const imgEl = quizSection?.querySelector('img[src="/assets/aiki-islands/island1_lesson1_cat.jpg"]')
    expect(imgEl).not.toBeNull()
    const imgCol = imgEl?.closest('.md\\:col-span-5')
    expect(imgCol).not.toBeNull()

    // Question box should have md:col-span-7
    const q1Box = imgCol?.nextElementSibling
    expect(q1Box?.className).toContain('md:col-span-7')
    expect(q1Box?.className).not.toContain('md:col-span-12')

    // 2. Trigger onError on image -> image column should disappear and question box should expand to md:col-span-12
    act(() => {
      imgEl?.dispatchEvent(new Event('error'))
    })

    const imgAfterError = quizSection?.querySelector('img[src="/assets/aiki-islands/island1_lesson1_cat.jpg"]')
    expect(imgAfterError).toBeNull()

    // Question box expands to md:col-span-12
    const questionBoxes = quizSection?.querySelectorAll('.md\\:col-span-12')
    expect(questionBoxes?.length).toBeGreaterThanOrEqual(1)
  })

  it('handles mobile drawer sidebar and backdrop close on mobile viewports without toggle buttons', () => {
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

      // 2. Sidebar drawer is open as mobile fixed drawer
      const sidebar = container.querySelector('[data-testid="interactive-sidebar"]')
      expect(sidebar).not.toBeNull()
      expect(sidebar?.className).toContain('fixed')

      // 3. Backdrop is rendered and clicking it closes the drawer
      const backdrop = container.querySelector('[data-testid="sidebar-overlay-backdrop"]') as HTMLElement
      expect(backdrop).not.toBeNull()

      act(() => {
        backdrop.click()
      })

      expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()
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
})

