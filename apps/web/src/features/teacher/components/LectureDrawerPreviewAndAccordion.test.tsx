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
} from './LectureDrawer'
import { DEFAULT_NOTEBOOK_CONFIGS } from '@/features/lesson/data/island-curriculum-registry'
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
    expect(html).toContain('Lời thoại &amp; Gợi ý từng lượt của AKI (Nâng cao)')
    expect(html).toContain('4 lượt')

    // Dòng chú thích tinh tế
    expect(html).toContain('Gợi ý câu lệnh nhanh xuất hiện trên thanh prompt')
    expect(html).toContain('lời thoại động viên của AKI qua các lượt vẽ của bé')

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
    title: 'Thử tài cùng AKI',
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
    expect(html).toContain('Xem trước học sinh (Đảo AIKids)')
    expect(html).toContain('Chặng 1/6')

    // Viewport selector buttons
    expect(html).toContain('Mobile')
    expect(html).toContain('iPad')
    expect(html).toContain('PC')

    // Nút nổi bật Toàn màn hình
    expect(html).toContain('Toàn màn hình')
  })

  it('renders Stage 2 (Confirm) with 3 Key sets (A, B, C) and 4 Keys each', () => {
    const html = renderToStaticMarkup(
      <StudentStagePreview
        isIsland={true}
        sixStageJourney={mockJourney}
        stageIndex={1}
      />
    )

    expect(html).toContain('Chặng 2: Xác nhận mục tiêu')
    expect(html).toContain('3 Ổ Khóa Thần Kỳ')

    // 3 Ổ Khóa A, B, C
    expect(html).toContain('Ổ Khóa A')
    expect(html).toContain('Ổ Khóa B')
    expect(html).toContain('Ổ Khóa C')

    // Badge ĐÚNG ở ổ khóa B
    expect(html).toContain('ĐÚNG')
    expect(html).toContain('Mở Rương Thần Kỳ')

    // Nhãn 4 Chìa Khóa
    expect(html).toContain('CHÌA 1')
    expect(html).toContain('CHÌA 2')
    expect(html).toContain('CHÌA 3')
    expect(html).toContain('CHÌA 4')
  })

  it('renders Stage 5 (Practice AI Studio) with 3 Desktop columns without vertical text squish', () => {
    const html = renderToStaticMarkup(
      <StudentStagePreview
        isIsland={true}
        sixStageJourney={mockJourney}
        stageIndex={4}
      />
    )

    expect(html).toContain('Xưởng Sáng Tạo AI Kids')
    expect(html).toContain('Chiếc cốc sứ ấm áp')
    expect(html).toContain('Cốc Sứ Diệu Kỳ')

    // Cột 1: Món đồ bé vẽ
    expect(html).toContain('Món đồ bé vẽ')
    expect(html).toContain('THỰC HÀNH 01')
    expect(html).toContain('THỰC HÀNH 02')
    expect(html).toContain('Cái cốc sứ trắng')
    expect(html).toContain('ĐANG VẼ')

    // Cột 2: Bàn phím 4 Chìa Khóa
    expect(html).toContain('Bàn phím 4 Chìa Khóa')
    expect(html).toContain('1. Cái gì?')
    expect(html).toContain('2. Trông thế nào?')
    expect(html).toContain('3. Đang làm gì?')
    expect(html).toContain('4. Ở đâu?')
    expect(html).toContain('Câu lệnh đang ghép')
    expect(html).toContain('Cốc sứ trắng')
    expect(html).toContain('men bóng mẻ miệng')

    // Cột 3: Khung Tranh AI Canvas
    expect(html).toContain('Khung Tranh AI Canvas')
    expect(html).toContain('Còn 4/4 lượt vẽ')
    expect(html).toContain('Men sứ trắng tinh')
    expect(html).toContain('Tả đủ 4 Chìa Khóa, tranh hiện ra ngay!')
    expect(html).toContain('AKI Vẽ Tranh (Còn 4/4 lượt)')
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
    expect(header?.textContent).toContain('👁️ Xem Trước Trải Nghiệm Học Sinh:')
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
      timestamps: [], // Rỗng để kiểm tra fallback 6 mốc chuẩn AI Kids
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

  it('renders video timeline stepper container, play button and 6 milestone nodes by default fallback', () => {
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

    // Header chặng 3 video
    expect(container.textContent).toContain('🎬 Chặng 3: Video bài giảng')
    expect(container.textContent).toContain('Video Bài Học 4 Chìa Khóa Vàng')
    expect(container.textContent).toContain('6 Mốc kiến thức')

    // Stepper container
    const stepper = container.querySelector('[data-testid="video-timeline-stepper"]')
    expect(stepper).not.toBeNull()

    // Nút play/tua
    const playBtn = container.querySelector('[data-testid="video-timeline-play-btn"]')
    expect(playBtn).not.toBeNull()

    // 6 nút mốc số tròn
    for (let i = 1; i <= 6; i++) {
      const node = container.querySelector(`[data-testid="video-chapter-node-${i}"]`)
      expect(node).not.toBeNull()
      expect(node?.textContent).toBe(String(i))
    }

    // Thời gian ban đầu: 0:00 / 3:00
    expect(stepper?.textContent).toContain('0:00 / 3:00')

    // Mốc 1 ban đầu active
    expect(stepper?.textContent).toContain('🎯 Mốc 1:')
    expect(stepper?.textContent).toContain('Tình huống mở đầu')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('seeks video and updates active milestone and node style when clicking node 2', () => {
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

    const node2 = container.querySelector('[data-testid="video-chapter-node-2"]') as HTMLButtonElement
    expect(node2).not.toBeNull()

    // Click mốc 2 (30s: Khám phá bí kíp)
    act(() => {
      node2.click()
    })

    const stepper = container.querySelector('[data-testid="video-timeline-stepper"]')
    expect(stepper?.textContent).toContain('0:30 / 3:00')
    expect(stepper?.textContent).toContain('🎯 Mốc 2:')
    expect(stepper?.textContent).toContain('Khám phá bí kíp')

    // Node 2 active style có scale-125 và bg-brand-500
    expect(node2.className).toContain('scale-125')
    expect(node2.className).toContain('bg-brand-500')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('seeks to next milestone and rewinds to 0 when clicking video-timeline-play-btn', () => {
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

    const playBtn = container.querySelector('[data-testid="video-timeline-play-btn"]') as HTMLButtonElement
    expect(playBtn).not.toBeNull()

    const stepper = container.querySelector('[data-testid="video-timeline-stepper"]')
    expect(stepper?.textContent).toContain('0:00 / 3:00')

    // Bấm play btn khi ở 0s -> tua đến mốc 2 (30s)
    act(() => {
      playBtn.click()
    })
    expect(stepper?.textContent).toContain('0:30 / 3:00')

    // Bấm play btn khi > 0s -> tua về 0s
    act(() => {
      playBtn.click()
    })
    expect(stepper?.textContent).toContain('0:00 / 3:00')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('renders auxiliary buttons: rewatch video, hear AKI speech, and stage navigation footer', () => {
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

    // Hàng nút phụ
    expect(container.textContent).toContain('Xem lại video')
    expect(container.textContent).toContain('Nghe AKI giảng')
    expect(container.textContent).toContain('Video gồm 6 mốc — con bấm tua xem lại bất kỳ lúc nào nhé!')

    // Footer chuyển chặng
    expect(container.textContent).toContain('Quay lại câu đố')
    expect(container.textContent).toContain('📝 Làm bài test thử tài →')

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

    // 3 nút mốc tùy chỉnh
    expect(container.querySelector('[data-testid="video-chapter-node-1"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="video-chapter-node-2"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="video-chapter-node-3"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="video-chapter-node-4"]')).toBeNull()

    expect(container.textContent).toContain('3 Mốc kiến thức')
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

  it('renders Stage 6 completion container with backpack artwork and congratulations card', () => {
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

    // Container data-testid="stage-5-complete"
    const stageComplete = container.querySelector('[data-testid="stage-5-complete"]')
    expect(stageComplete).not.toBeNull()

    // Preview mobile chassis class and 1-column layout
    expect(container.querySelector('.preview-viewport-mobile')).not.toBeNull()
    expect(stageComplete?.firstElementChild?.className).toContain('grid-cols-1')
    expect(stageComplete?.firstElementChild?.className).not.toContain('lg:grid-cols-12')

    // Cột 1: Tác phẩm kiệt xuất cất vào Balo & Tên huy hiệu
    expect(container.textContent).toContain('Tác phẩm kiệt xuất vừa cất vào Balo')
    expect(container.textContent).toContain('Huy hiệu Phù Thủy AI')
    expect(container.textContent).toContain('🔍 Phóng to')
    expect(container.textContent).toContain('“Vẽ mèo máy thông minh”')

    // Ảnh kiệt tác sử dụng custom iconUrl
    const artworkImg = container.querySelector('img[alt="Kiệt tác của bé"]') as HTMLImageElement
    expect(artworkImg).not.toBeNull()
    expect(artworkImg.src).toContain('/assets/aiki-islands/custom_badge.png')

    // Cột 2: Cúp vàng clay 3D, XP badge, Sao vàng, Tiêu đề, Lời chúc
    expect(container.textContent).toContain('Chặng 6: Hoàn thành bài học')
    const trophyImg = container.querySelector('img[alt="Cúp Vàng Sáng Tạo"]') as HTMLImageElement
    expect(trophyImg).not.toBeNull()
    expect(trophyImg.src).toContain('/assets/trophy-clay-gold.png')

    const xpBadge = container.querySelector('[data-testid="stage6-trophy-xp-badge"]')
    expect(xpBadge).not.toBeNull()
    expect(xpBadge?.textContent).toContain('+100 XP')

    expect(container.textContent).toContain('Chúc Mừng Chiến Binh Nhí!')
    expect(container.textContent).toContain('Bé đã xuất sắc chinh phục bài học và gom trọn bí kíp!')

    // Nút điều hướng
    expect(container.textContent).toContain('👉 Khám Phá Bài Tiếp Theo 🚀')
    expect(container.textContent).toContain('🗺️ Trở Về Bản Đồ Đảo')
    expect(container.textContent).toContain('🔄 Học Lại Bài Này')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('falls back to stage1_goal imageUrl when rewardBadge iconUrl is not provided', () => {
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

    const artworkImg = container.querySelector('img[alt="Kiệt tác của bé"]') as HTMLImageElement
    expect(artworkImg).not.toBeNull()
    expect(artworkImg.src).toContain('/assets/aiki-islands/cat_masterpiece.jpg')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('does not render nextLesson button if nextLessonSlug is empty', () => {
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

    expect(container.textContent).not.toContain('👉 Khám Phá Bài Tiếp Theo 🚀')
    expect(container.textContent).toContain('🗺️ Trở Về Bản Đồ Đảo')
    expect(container.textContent).toContain('🔄 Học Lại Bài Này')

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
    const stageComplete = dialog?.querySelector('[data-testid="stage-5-complete"]')
    expect(stageComplete).not.toBeNull()
    expect(stageComplete?.textContent).toContain('Tác phẩm kiệt xuất vừa cất vào Balo')
    expect(stageComplete?.textContent).toContain('Chúc Mừng Chiến Binh Nhí!')

    // Test Mobile (375px) phone frame
    const mobileBtn = Array.from(dialog?.querySelectorAll('button') ?? []).find((b) => b.textContent?.includes('375px'))
    expect(mobileBtn).toBeDefined()
    act(() => {
      mobileBtn?.click()
    })
    const phoneFrame = dialog?.querySelector('.w-\\[375px\\]')
    expect(phoneFrame).not.toBeNull()
    expect(phoneFrame?.querySelector('[data-testid="stage-5-complete"]')).not.toBeNull()

    // Test Tablet (768px) iPad frame
    const tabletBtn = Array.from(dialog?.querySelectorAll('button') ?? []).find((b) => b.textContent?.includes('768px'))
    expect(tabletBtn).toBeDefined()
    act(() => {
      tabletBtn?.click()
    })
    const tabletFrame = dialog?.querySelector('.w-\\[768px\\]')
    expect(tabletFrame).not.toBeNull()
    expect(tabletFrame?.querySelector('[data-testid="stage-5-complete"]')).not.toBeNull()

    // Test PC (1200px) PC frame
    const pcBtn = Array.from(dialog?.querySelectorAll('button') ?? []).find((b) => b.textContent?.includes('1200px'))
    expect(pcBtn).toBeDefined()
    act(() => {
      pcBtn?.click()
    })
    const pcFrame = dialog?.querySelector('.max-w-\\[1240px\\]')
    expect(pcFrame).not.toBeNull()
    expect(pcFrame?.querySelector('[data-testid="stage-5-complete"]')).not.toBeNull()

    // Close modal
    const closeBtn = Array.from(dialog?.querySelectorAll('button') ?? []).find((b) =>
      b.textContent?.includes('✕ Đóng (Esc)')
    )
    act(() => {
      closeBtn?.click()
    })
    expect(container.querySelector('[role="dialog"]')).toBeNull()

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('renders StudentStagePreview with all 6 Creative Engines seamlessly while synchronizing lesson content 100%', () => {
    // 1. Style Prism Engine
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
    expect(htmlStylePrism).toContain('Lăng Kính Phù Thủy')
    expect(htmlStylePrism).toContain('4 Phong Cách')
    expect(htmlStylePrism).toContain('Đất nặn Claymation')
    expect(htmlStylePrism).toContain('Màu nước Trong trẻo')
    expect(htmlStylePrism).toContain('Hoạt hình Chibi 3D Pixar')
    expect(htmlStylePrism).toContain('Tranh dân gian Đông Hồ')
    // Synchronized content
    expect(htmlStylePrism).toContain('Chiếc cốc sứ ấm áp')
    expect(htmlStylePrism).toContain('Cốc Sứ Diệu Kỳ')
    expect(htmlStylePrism).toContain('Món đồ bé vẽ')

    // 2. Prompt Doctor Engine
    const journeyPromptDoctor = {
      ...mockJourney,
      stage5_practice: {
        ...mockJourney.stage5_practice,
        creativeEngineMode: 'prompt-doctor',
      },
    } as unknown as LessonSixStageJourney

    const htmlPromptDoctor = renderToStaticMarkup(
      <StudentStagePreview
        isIsland={true}
        sixStageJourney={journeyPromptDoctor}
        stageIndex={4}
      />
    )
    expect(htmlPromptDoctor).toContain('Bác Sĩ AKI')
    expect(htmlPromptDoctor).toContain('HỒ SƠ BỆNH ÁN TRANH HỎNG')
    expect(htmlPromptDoctor).toContain('Kê đơn 5 ngón tay đầy đủ chuẩn xác')
    expect(htmlPromptDoctor).toContain('Chiếc cốc sứ ấm áp')

    // 3. Layer Stacking Engine
    const journeyLayerStacking = {
      ...mockJourney,
      stage5_practice: {
        ...mockJourney.stage5_practice,
        creativeEngineMode: 'layer-stacking',
      },
    } as unknown as LessonSixStageJourney

    const htmlLayerStacking = renderToStaticMarkup(
      <StudentStagePreview
        isIsland={true}
        sixStageJourney={journeyLayerStacking}
        stageIndex={4}
      />
    )
    expect(htmlLayerStacking).toContain('3 Tầng Sân Khấu')
    expect(htmlLayerStacking).toContain('Hậu cảnh (Background)')
    expect(htmlLayerStacking).toContain('Ngôi sao 1/3 (Center)')
    expect(htmlLayerStacking).toContain('Tiền cảnh (Foreground)')
    expect(htmlLayerStacking).toContain('Chiếc cốc sứ ấm áp')

    // 4. Identity Lock Engine
    const journeyIdentityLock = {
      ...mockJourney,
      stage5_practice: {
        ...mockJourney.stage5_practice,
        creativeEngineMode: 'identity-lock',
      },
    } as unknown as LessonSixStageJourney

    const htmlIdentityLock = renderToStaticMarkup(
      <StudentStagePreview
        isIsland={true}
        sixStageJourney={journeyIdentityLock}
        stageIndex={4}
      />
    )
    expect(htmlIdentityLock).toContain('Khóa Mật Mã &amp; Biểu Cảm')
    expect(htmlIdentityLock).toContain('3 Mật mã ADN bất biến')
    expect(htmlIdentityLock).toContain('Bánh xe 6 biểu cảm')
    expect(htmlIdentityLock).toContain('Chiếc cốc sứ ấm áp')

    // 5. Card Forge Engine
    const journeyCardForge = {
      ...mockJourney,
      stage5_practice: {
        ...mockJourney.stage5_practice,
        creativeEngineMode: 'card-forge',
      },
    } as unknown as LessonSixStageJourney

    const htmlCardForge = renderToStaticMarkup(
      <StudentStagePreview
        isIsland={true}
        sixStageJourney={journeyCardForge}
        stageIndex={4}
      />
    )
    expect(htmlCardForge).toContain('Xưởng Đúc Thẻ Bài TCG')
    expect(htmlCardForge).toContain('Hệ Nguyên Tố')
    expect(htmlCardForge).toContain('Hệ Hỏa (Lửa Đỏ)')
    expect(htmlCardForge).toContain('Chỉ số chiến đấu &amp; Khung thẻ')
    expect(htmlCardForge).toContain('Chiếc cốc sứ ấm áp')
  })

  it('renders StudentStagePreview with creative-notebook engine correctly', () => {
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

    expect(htmlCreativeNotebook).toContain('Sổ Tay Sáng Tạo Ba Lô')
    expect(htmlCreativeNotebook).toContain('Hồ sơ nhân vật của tớ')
    expect(htmlCreativeNotebook).toContain('TÓM TẮT THỬ THÁCH')
    expect(htmlCreativeNotebook).toContain('HỒ SƠ MẪU CỦA AKI')
    expect(htmlCreativeNotebook).toContain('Tên nhân vật')
    expect(htmlCreativeNotebook).toContain('Cất vào Ba Lô')
    expect(htmlCreativeNotebook).not.toContain('Bàn phím 4 Chìa Khóa')
    expect(htmlCreativeNotebook).not.toContain('Khung Tranh AI Canvas')
    expect(htmlCreativeNotebook).not.toContain('AKI Vẽ Tranh (Còn 4/4 lượt)')
  })

  it('renders StudentStagePreview with hideHeaderToolbar=true and viewport="pc" properly without nested toolbar and with 2-column video layout', () => {
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
    expect(html).not.toContain('Xem trước học sinh (Đảo AIKids)')
    expect(html).not.toContain('Chặng 3/6')
    expect(html).not.toContain('Toàn màn hình')

    // Khẳng định layout 2 cột đẳng cấp PC
    expect(html).toContain('grid grid-cols-1 lg:grid-cols-12 gap-5 items-start')
    expect(html).toContain('lg:col-span-8 space-y-3')
    expect(html).toContain('lg:col-span-4 space-y-3')
    expect(html).toContain('max-h-[460px]')
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
    expect(container.textContent).toContain('Bác Sĩ AKI')
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

  it('toggles preview visibility in LectureDrawer across stages and basics tabs', () => {
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

    // 1. Initial state (defaults to 'basics' tab): header has "Thu gọn preview" button
    const toggleBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Thu gọn preview') || b.textContent?.includes('Xem song song')
    )
    expect(toggleBtn).toBeDefined()
    expect(toggleBtn?.textContent).toContain('Thu gọn preview')
    expect(container.textContent).toContain('Học sinh sẽ thấy')

    // 2. Click "Thu gọn preview" in header
    act(() => {
      toggleBtn?.click()
    })

    // Now header button displays "Xem song song"
    expect(toggleBtn?.textContent).toContain('Xem song song')

    // In basics tab, 56px CollapsedPreviewRail appears with "HỌC SINH SẼ THẤY" and "PREVIEW"
    const railBasics = Array.from(container.querySelectorAll('button')).find((b) =>
      b.getAttribute('aria-label') === 'Mở rộng xem trước màn học sinh'
    )
    expect(railBasics).toBeDefined()
    expect(railBasics?.textContent).toContain('HỌC SINH SẼ THẤY')
    expect(railBasics?.textContent).toContain('PREVIEW')

    // 3. Click CollapsedPreviewRail inside the basics tab
    act(() => {
      railBasics?.click()
    })

    // Preview is restored in basics tab
    expect(container.textContent).toContain('Học sinh sẽ thấy')
    expect(toggleBtn?.textContent).toContain('Thu gọn preview')

    // 4. Navigate to Stage 0 (Mục tiêu)
    const stage0Btn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Mục tiêu')
    )
    expect(stage0Btn).toBeDefined()
    act(() => {
      stage0Btn?.click()
    })

    // In Stage 0, preview is currently visible. Now collapse it via header button:
    act(() => {
      toggleBtn?.click()
    })
    expect(toggleBtn?.textContent).toContain('Xem song song')

    // Stage right column now shows 56px CollapsedPreviewRail
    const railStage = Array.from(container.querySelectorAll('button')).find((b) =>
      b.getAttribute('aria-label') === 'Mở rộng xem trước màn học sinh'
    )
    expect(railStage).toBeDefined()
    expect(railStage?.textContent).toContain('HỌC SINH SẼ THẤY')
    expect(railStage?.textContent).toContain('PREVIEW')

    // 5. Click CollapsedPreviewRail inside the stage section
    act(() => {
      railStage?.click()
    })

    // Preview expands again and header button returns to "Thu gọn preview"
    expect(toggleBtn?.textContent).toContain('Thu gọn preview')

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
