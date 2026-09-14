// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, afterEach } from 'vitest'
import {
  PracticeWorkflowStepsAccordion,
  StudentStagePreview,
  DEFAULT_PRACTICE_PARTS,
  DEFAULT_FOUR_KEYS_OPTIONS,
} from './LectureDrawer'
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

describe('StudentStagePreview Component — Viewport Selector & Fullscreen Preview', () => {
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

