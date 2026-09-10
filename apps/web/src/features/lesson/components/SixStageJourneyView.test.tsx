// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { SixStageJourneyView } from './SixStageJourneyView'
import type { LessonSixStageJourney } from '@/shared/lib/api'

const mockJourney: LessonSixStageJourney = {
  stage1_goal: {
    id: 'bai-1-1-stage1-goal',
    title: 'Mục tiêu: Đừng Để AKI Đoán Mò',
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
    question: 'Tại sao AKI lại vẽ ra chú mèo mướp màu vàng thay vì màu đen?',
    options: [
      { id: 'opt-a', text: 'Vì câu lệnh của bé chưa ghi rõ màu sắc lông mèo', imageUrl: '/assets/aiki-islands/island1_lesson1_opt_a.jpg' },
      { id: 'opt-b', text: 'Vì AKI thích màu vàng hơn', imageUrl: '/assets/aiki-islands/island1_lesson1_opt_b.jpg' },
    ],
    correctIndex: 0,
    explanation: 'Chính xác! Khi bé không tả màu lông, AKI sẽ tự đoán mò!',
    speech: 'Bé hãy chọn phương án chính xác nhất nhé!',
  },
  stage3_video: {
    id: 'bai-1-1-stage3-video',
    title: 'Video Bài Giảng: Bí Kíp Câu Lệnh Thần Kỳ',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    durationSec: 180,
    posterUrl: '/assets/aiki-islands/island1_lesson1_cat.jpg',
    timestamps: [
      { label: 'Tình huống khởi động', startSec: 0, endSec: 45, speech: 'Chào mừng các bạn!' },
      { label: 'Bí kíp 4 chìa khóa', startSec: 45, endSec: 120, speech: 'Ghi nhớ 4 chìa khóa nhé!' },
      { label: 'Thực hành cùng AKI', startSec: 120, endSec: 180, speech: 'Cùng bắt tay vào làm nào!' },
    ],
  },
  stage4_quiz: {
    id: 'bai-1-1-stage4-quiz',
    title: 'Bài Test Thử Tài: 4 Chìa Khóa Vàng',
    questions: [
      {
        id: 'q1',
        prompt: 'Nếu câu lệnh chỉ có chữ "Con mèo", điều gì sẽ xảy ra?',
        options: ['AKI sẽ đoán mò hình dáng và màu sắc', 'AKI sẽ từ chối vẽ', 'AKI luôn vẽ đúng ý bé'],
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
    document.body.removeChild(container)
  })

  it('renders 2-column layout: Left Main Learning Canvas & Right AKI Interactive Sidebar', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AKI Đoán Mò"
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
    expect(mainCanvas?.textContent).toContain('Mục tiêu: Đừng Để AKI Đoán Mò')
    expect(mainCanvas?.textContent).toContain('Con hiểu được AI tạo ảnh không tự nghĩ được')

    // Right Column: Companion Sidebar with 4-Slot Formula & Key points
    const sidebar = container.querySelector('[data-testid="interactive-sidebar"]')
    expect(sidebar).not.toBeNull()
    expect(sidebar?.textContent).toContain('Chặng 1/6: Mục tiêu')
    expect(sidebar?.textContent).toContain('AKI Đồng Hành')
    expect(sidebar?.textContent).toContain('LỜI THOẠI CỦA AKI')
    expect(sidebar?.textContent).toContain('Công Thức 4 Ô Mật Mã')
    expect(sidebar?.textContent).toContain('Tả càng rõ, tranh càng đúng ý')
    expect(sidebar?.textContent).toContain('Nhiệm vụ chặng này')
    expect(sidebar?.textContent).toContain('42 Sao tích lũy')
  })

  it('toggles sidebar collapse/expand smoothly', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AKI Đoán Mò"
        />
      )
    })

    // Initially, sidebar is visible
    expect(container.querySelector('[data-testid="interactive-sidebar"]')).not.toBeNull()
    const toggleBtn = container.querySelector('[data-testid="toggle-sidebar-btn"]') as HTMLButtonElement
    expect(toggleBtn).not.toBeNull()
    expect(toggleBtn.textContent).toContain('Thu gọn')

    // Click toggle to collapse
    act(() => {
      toggleBtn.click()
    })
    expect(container.querySelector('[data-testid="interactive-sidebar"]')).toBeNull()
    expect(toggleBtn.textContent).toContain('Bảng tương tác')

    // Click toggle again to expand
    act(() => {
      toggleBtn.click()
    })
    expect(container.querySelector('[data-testid="interactive-sidebar"]')).not.toBeNull()
    expect(toggleBtn.textContent).toContain('Thu gọn')
  })

  it('synchronizes stage transition from 0 to 1 between Main Block and Sidebar', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AKI Đoán Mò"
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
    expect(container.textContent).toContain('Tại sao AKI lại vẽ ra chú mèo mướp màu vàng')
    expect(container.textContent).toContain('Vì câu lệnh của bé chưa ghi rõ màu sắc lông mèo')

    const sidebar = container.querySelector('[data-testid="interactive-sidebar"]')
    expect(sidebar?.textContent).toContain('Chặng 2/6: Xác nhận')
    expect(sidebar?.textContent).toContain('AKI Cố Vấn')
  })

  it('handles Stage 1 quiz answer and unlocks video stage', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AKI Đoán Mò"
          initialStageIndex={1}
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

    expect(container.textContent).toContain('Chính xác! Tuyệt vời quá bé ơi!')
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
    expect(sidebar?.textContent).toContain('Thầy Giáo AKI')
  })

  it('renders Stage 3 (Quiz) and computes score on submit, updating Sidebar action', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AKI Đoán Mò"
          initialStageIndex={3}
        />
      )
    })

    expect(container.querySelector('[data-testid="stage-3-quiz"]')).not.toBeNull()
    expect(container.textContent).toContain('Bài Test Thử Tài: 4 Chìa Khóa Vàng')

    // Select answers
    const ans1 = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('AKI sẽ đoán mò hình dáng')
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
          lessonTitle="Đừng Để AKI Đoán Mò"
          initialStageIndex={5}
          onFinishLesson={onFinishLesson}
          onNavigateNextLesson={onNavigateNextLesson}
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

  it('verifies Top Header Stepper has NO emoji icons, has ChevronRight delimiters, sharp text without opacity-40, and smooth navigation', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AKI Đoán Mò"
          initialStageIndex={0}
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

    // Verify NO button has opacity-40 or cursor-not-allowed (100% sharp and accessible)
    buttons?.forEach((btn) => {
      expect(btn.className).not.toContain('opacity-40')
      expect(btn.className).not.toContain('cursor-not-allowed')
      expect(btn.className).not.toContain('text-slate-400')
    })

    // Verify smooth navigation: click stage 3 (Video) directly navigates without getting blocked
    act(() => {
      buttons?.[2]?.click()
    })
    expect(container.querySelector('[data-testid="stage-2-video"]')).not.toBeNull()
    expect(container.textContent).toContain('Video Bài Giảng: Bí Kíp Câu Lệnh Thần Kỳ')

    // Stage 0 badge content
    // When navigated to Stage 2, sidebar shows Stage 3/6
    const sidebar = container.querySelector('[data-testid="interactive-sidebar"]')
    expect(sidebar?.textContent).toContain('Chặng 3/6: Video')
  })

  it('handles image failure in Stage 2 without leaving empty placeholder boxes', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AKI Đoán Mò"
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

  it('verifies Stage 1 option image container uses aspect-[4/3] object-contain without cropping or max-h restrictions, and supports full-screen zoom Lightbox', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AKI Đoán Mò"
          initialStageIndex={1}
        />
      )
    })

    const stage1Section = container.querySelector('section[data-testid="stage-1-confirm"]')
    expect(stage1Section).not.toBeNull()

    const imgContainers = stage1Section?.querySelectorAll('.aspect-\\[4\\/3\\]')
    expect(imgContainers?.length).toBe(2)

    imgContainers?.forEach((box) => {
      expect(box.className).toContain('aspect-[4/3]')
      expect(box.className).not.toContain('max-h-[220px]')
      expect(box.className).not.toContain('sm:max-h-[260px]')
    })

    const images = stage1Section?.querySelectorAll('img')
    expect(images?.length).toBe(2)
    images?.forEach((img) => {
      expect(img.className).toContain('object-contain')
      expect(img.className).not.toContain('sm:object-cover')
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

  it('verifies Stage 2 video layout is cinema full-width 16:9, timestamps moved to Sidebar for non-cluttered view, and seeking works', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AKI Đoán Mò"
          initialStageIndex={2}
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
    expect(iframe?.getAttribute('src')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')

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
          lessonTitle="Đừng Để AKI Đoán Mò"
          initialStageIndex={3}
        />
      )
    })

    // Stage 3 Quiz
    const quizSection = container.querySelector('section[data-testid="stage-3-quiz"]')
    expect(quizSection).not.toBeNull()

    // Question visualUrl rendered with object-contain
    const quizImg = quizSection?.querySelector('img[src="/assets/aiki-islands/island1_lesson1_opt_a.jpg"]')
    expect(quizImg).not.toBeNull()
    expect(quizImg?.className).toContain('object-contain')

    // 2-column layout container uses md:flex-row
    const twoColContainer = container.querySelector('.flex.flex-col.md\\:flex-row')
    expect(twoColContainer).not.toBeNull()

    // Sidebar uses md:w-[300px]
    const sidebar = container.querySelector('[data-testid="interactive-sidebar"]')
    expect(sidebar?.className).toContain('md:w-[300px]')
    expect(sidebar?.className).toContain('lg:w-[360px]')
  })

  it('renders Stage 4 Practice with interactive sidebar containing 4 practice steps and AKI golden motto', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <SixStageJourneyView
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AKI Đoán Mò"
          initialStageIndex={4}
        />
      )
    })

    // Main workspace for practice stage
    expect(container.querySelector('[data-testid="stage-4-practice"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="aiki-studio-workspace"]')).not.toBeNull()

    // Interactive sidebar is visible at Stage 4
    const sidebar = container.querySelector('[data-testid="interactive-sidebar"]')
    expect(sidebar).not.toBeNull()

    // Sidebar displays 4 practice steps clearly
    expect(sidebar?.textContent).toContain('Tiến Trình 4 Bước Thực Hành')
    expect(sidebar?.textContent).toContain('Bước 1: Thử câu lệnh ban đầu (1-2 từ)')
    expect(sidebar?.textContent).toContain('Bước 2: Thêm hình dáng & màu sắc')
    expect(sidebar?.textContent).toContain('Bước 3: Hoàn thiện câu lệnh 5 chi tiết vàng')
    expect(sidebar?.textContent).toContain('Bước 4: Soi kỹ tranh & nộp vào Balo')

    // Sidebar displays AKI golden motto & locked features
    expect(sidebar?.textContent).toContain('MẸO VÀNG CỦA AKI')
    expect(sidebar?.textContent).toContain('Tả càng rõ, tranh càng đúng ý!')
    expect(sidebar?.textContent).toContain('Mật mã đặc điểm vàng')
    expect(sidebar?.textContent).toContain('mèo mướp vàng béo tròn')
    expect(sidebar?.textContent).toContain('↺ Xem lại video bài giảng')
  })

  it('verifies specialized sidebar widgets across Stages 0, 1, 3, and 5 according to pedagogical design', () => {
    const root = createRoot(container)

    // Stage 0: 4-slot formula & AKI advice
    act(() => {
      root.render(
        <SixStageJourneyView
          key="stage-0"
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AKI Đoán Mò"
          initialStageIndex={0}
        />
      )
    })
    const sidebar0 = container.querySelector('[data-testid="interactive-sidebar"]')
    expect(sidebar0?.textContent).toContain('Công Thức 4 Ô Mật Mã')
    expect(sidebar0?.textContent).toContain('CÁI GÌ')
    expect(sidebar0?.textContent).toContain('TRÔNG THẾ NÀO')
    expect(sidebar0?.textContent).toContain('ĐANG LÀM GÌ')
    expect(sidebar0?.textContent).toContain('Ở ĐÂU')
    expect(sidebar0?.textContent).toContain('LỜI THOẠI CỦA AKI')
    expect(sidebar0?.textContent).not.toContain('LỜI DẶN DÒ TỪ AKI')

    // Stage 1: Cheat-sheet
    act(() => {
      root.render(
        <SixStageJourneyView
          key="stage-1"
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AKI Đoán Mò"
          initialStageIndex={1}
        />
      )
    })
    const sidebar1 = container.querySelector('[data-testid="interactive-sidebar"]')
    expect(sidebar1?.textContent).toContain('Bảng Gợi Ý Mật Mã')
    expect(sidebar1?.textContent).toContain('Cheat-sheet')
    expect(sidebar1?.textContent).toContain('LỜI THOẠI CỦA AKI')
    expect(sidebar1?.textContent).not.toContain('CỐ VẤN AKI DẶN DÒ')

    // Stage 3: Live Scoreboard and AKI Advisor
    act(() => {
      root.render(
        <SixStageJourneyView
          key="stage-3"
          journey={mockJourney}
          lessonId="bai-1-1"
          lessonTitle="Đừng Để AKI Đoán Mò"
          initialStageIndex={3}
        />
      )
    })
    const sidebar3 = container.querySelector('[data-testid="interactive-sidebar"]')
    expect(sidebar3?.textContent).toContain('Bảng Điểm Trực Tiếp')
    expect(sidebar3?.textContent).toContain('GÓC CỐ VẤN AKI')

    // Select answers and submit quiz in Stage 3
    const ans1 = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('AKI sẽ đoán mò hình dáng')
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
          lessonTitle="Đừng Để AKI Đoán Mò"
          initialStageIndex={5}
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
    expect(part1Btn.textContent).toContain('Cái cốc sứ trắng')
    expect(part2Btn.textContent).toContain('PHẦN 2 - CHỜ')
    expect(part2Btn.textContent).toContain('Cái xe đạp')

    // 3. Click chọn Phần 2 -> chuyển sang ĐANG LÀM
    act(() => {
      part2Btn.click()
    })

    expect(part2Btn.textContent).toContain('PHẦN 2 - ĐANG LÀM')

    // 4. Mẹo vàng AKI và nút Tua lại video
    expect(sidebar?.textContent).toContain('MẸO VÀNG CỦA AKI')
    expect(sidebar?.textContent).toContain('↺ Tua lại video')
  })

  it('renders Lesson 1.2 Stage 0 with 4-keys banner and 4-colored formula grid', () => {
    const lesson1_2Journey: LessonSixStageJourney = {
      ...mockJourney,
      stage1_goal: {
        id: 'bai-1-2-stage1-goal',
        title: 'Bài 1.2 — Bốn chiếc chìa khoá',
        goalText: 'Viết được một câu lệnh có đủ bốn phần: Cái gì, Trông như thế nào, Đang làm gì, Ở đâu',
        imageUrl: '/assets/aiki-islands/island1_lesson2_keys.jpg',
        speech: 'Zico: Một con mèo rất đẹp... AKI: Hả? Zico viết dài thế mà tranh vẫn chưa rõ kìa!',
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
    expect(stage0?.textContent).toContain('Bốn chiếc chìa khoá')
    expect(stage0?.textContent).toContain('Mở được cả bốn thì AKI vẽ đúng ngay từ lần đầu tiên')
    expect(stage0?.textContent).toContain('Công Thức Câu Lệnh Bốn Ô')
    expect(stage0?.textContent).toContain('CÁI GÌ')
    expect(stage0?.textContent).toContain('TRÔNG THẾ NÀO')
    expect(stage0?.textContent).toContain('ĐANG LÀM GÌ')
    expect(stage0?.textContent).toContain('Ở ĐÂU')
    expect(stage0?.textContent).toContain('“một cái cốc”')
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

  it('renders Quick Station Switcher and navigates between Lesson 1.1 and 1.2', () => {
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

    expect(container.textContent).toContain('Trạm 1: Mèo Mimi 🐱')
    expect(container.textContent).toContain('Trạm 2: 4 Chìa Khoá 🔑')

    const station2Btn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Trạm 2: 4 Chìa Khoá')
    )
    expect(station2Btn).toBeDefined()
    act(() => {
      station2Btn?.click()
    })
    expect(handleNavigate).toHaveBeenCalledWith('bai-1-2-bon-chiec-chia-khoa')
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
    expect(stage0?.textContent).toContain('Công Thức Câu Lệnh Bốn Ô')
    expect(stage0?.textContent).toContain('CÁI GÌ')
    expect(stage0?.textContent).toContain('“một con mèo”')
    expect(stage0?.textContent).toContain('TRÔNG THẾ NÀO')
    expect(stage0?.textContent).toContain('“mèo mướp vàng béo tròn”')
    expect(stage0?.textContent).toContain('ĐANG LÀM GÌ')
    expect(stage0?.textContent).toContain('“đang nằm ngủ cuộn tròn”')
    expect(stage0?.textContent).toContain('Ở ĐÂU')
    expect(stage0?.textContent).toContain('“trên ghế mây cạnh cửa sổ”')
  })
})


