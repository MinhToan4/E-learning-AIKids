// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

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

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { AikiStudioWorkspace, getDefaultPracticeParts, DEFAULT_IDENTITY_LOCK_PARTS, getStudioAIArtwork, renderObjectClayIcon, type StudioImageItem } from './AikiStudioWorkspace'
import { getAikiStudioConfig } from '../data/aiki-studio-configs'
import * as creativeApi from '@/shared/lib/creative-api'

describe('AikiStudioWorkspace', () => {
  beforeEach(() => {
    mockStorage = {}
  })
  it('renders fresh practice session cleanly matching the simplified, gamified UI', () => {
    const html = renderToStaticMarkup(
      <AikiStudioWorkspace
        lessonId="bai-3-2"
        lessonTitle="Bắt AIKI vẽ Sóc Bông bằng mật mã của các cậu"
        lessonBadge="Bài 3.2"
        characterName="Sóc Bông"
        maxAttempts={6}
        studentStars={42}
      />
    )

    // 1. Kiểm tra Top Bar & Khởi tạo phiên tươi mới (đầy đủ 6/6 lượt, không mock dở dang)
    expect(html).toContain('data-testid="aiki-studio-workspace"')
    expect(html).toContain('XƯỞNG SÁNG TẠO')
    expect(html).toContain('Bắt AIKI vẽ Sóc Bông bằng mật mã của các cậu')
    expect(html).toContain('Còn')
    expect(html).toContain('6')
    expect(html).toContain('6 lượt của bài này')
    expect(html).toContain('42')
    expect(html).toContain('← Bài 3.2')
    expect(html).toContain('data-testid="studio-fullscreen-btn"')

    // 2. Kiểm tra Cột 1: ĐÃ DỌN SẠCH (Chỉ có 2 card: Tiến Trình 4 Bước & Mẹo Vàng AIKI)
    expect(html).toContain('data-testid="studio-col-tasks"')
    expect(html).toContain('Tiến Trình 4 Bước Thực Hành')
    expect(html).toContain('Bước 1: Thử câu lệnh ban đầu (1-2 từ)')
    expect(html).toContain('● Đang làm')
    expect(html).toContain('Bước 2: Thêm hình dáng &amp; màu sắc')
    expect(html).toContain('Bước 3: Hoàn thiện câu lệnh 5 chi tiết vàng')
    expect(html).toContain('Bước 4: Soi kỹ tranh &amp; nộp vào Balo')
    // Đã loại bỏ hoàn toàn card cũ gây rối mắt với các dòng gạch chéo xám
    expect(html).not.toContain('Hôm nay Xưởng mở gì')
    expect(html).not.toContain('Vẽ biểu cảm — cất cho bài 3.3')
    expect(html).toContain('Mẹo Vàng Của AIKI')
    expect(html).toContain('↺ Tua lại video / Xem lại bài')

    // 3. Kiểm tra Cột 2: Studio Canvas Chat & Live Studio Coach
    expect(html).toContain('data-testid="studio-col-canvas"')
    expect(html).toContain('AIKI · Xưởng Bài 3.2')
    expect(html).toContain('Hôm nay chỉ vẽ Sóc Bông')
    // Tin nhắn chào đón duy nhất từ AIKI giải thích nhiệm vụ Bước 1
    expect(html).toContain('Chào bé! Hôm nay chúng mình vào Xưởng để cùng tạo tranh Sóc Bông')
    expect(html).toContain('Bước 1: Hãy thử một câu lệnh thật ngắn')
    // Nút gợi ý 1-chạm TO RÕ
    expect(html).toContain('data-testid="studio-step-quick-btn"')
    expect(html).toContain('👉 Chạm để thử ngay:')
    expect(html).toContain('Sóc Bông')
    // Placeholder thân thiện
    expect(html).toContain('placeholder="Gõ câu lệnh của bé ở đây, hoặc chạm nút gợi ý bên dưới 👇"')
    expect(html).toContain('data-testid="studio-draw-btn"')

    // 4. Kiểm tra Cột 3: Kho Sáng Tạo & Balo rõ ràng
    expect(html).toContain('data-testid="studio-col-gallery"')
    expect(html).toContain('Lượt vẽ của bài này')
    expect(html).toContain('KHO SÁNG TẠO')
    expect(html).toContain('0 ảnh')
    // Khi chưa có ảnh nào: Hiển thị các ô nét đứt thân thiện chờ bé vẽ
    expect(html).toContain('🎨 Lượt 1: Đang chờ bé vẽ...')
    expect(html).toContain('🎨 Lượt 2: Đang chờ bé vẽ...')
    expect(html).toContain('🎨 Lượt 3: Đang chờ bé vẽ...')
    expect(html).toContain('BALO SÁNG TẠO CỦA BÉ')
    expect(html).toContain('Hồ sơ biệt đội')
    expect(html).toContain('data-testid="studio-submit-btn"')
    expect(html).toContain('🏆 Nộp Bài &amp; Cất Vào Balo')
  })

  it('renders preloaded session with images and verification step when preloadedImages provided', () => {
    const preloadedMock = [
      {
        id: 'img-p1',
        turn: 1,
        prompt: 'Sóc Bông',
        time: '08:30',
        toneBg: 'bg-amber-100',
        url: '/assets/aiki-islands/island3_lesson2_opt_a.jpg',
      },
      {
        id: 'img-p2',
        turn: 2,
        prompt: 'Sóc Bông mũ len đỏ quả bông trắng',
        time: '08:32',
        toneBg: 'bg-purple-100',
        url: '/assets/aiki-islands/island3_lesson2_opt_b.jpg',
      },
      {
        id: 'img-p3',
        turn: 3,
        prompt: 'Sóc Bông đang ôm quả thông to trong rừng thông ngập nắng',
        time: '08:35',
        toneBg: 'bg-pink-100',
        url: '/assets/aiki-islands/island3_lesson2_code3.jpg',
      },
    ]

    const html = renderToStaticMarkup(
      <AikiStudioWorkspace
        lessonId="bai-3-2"
        preloadedImages={preloadedMock}
        initialAttemptsLeft={3}
        maxAttempts={6}
      />
    )

    expect(html).toContain('3 ảnh')
    expect(html).toContain('🎨 Lượt 1')
    expect(html).toContain('🎨 Lượt 2')
    expect(html).toContain('🎨 Lượt 3')
    expect(html).toContain('Soi hộ tớ cái: bức này đủ ba đặc điểm chưa các cậu?')
    expect(html).toContain('Đủ rồi, chuẩn!')
    expect(html).toContain('Thiếu, để tớ tả lại')
  })

  it('renders customized character and tags correctly', () => {
    const html = renderToStaticMarkup(
      <AikiStudioWorkspace
        lessonId="bai-1-1"
        lessonTitle="Thiết kế Mèo Máy thông minh"
        lessonBadge="Bài 1.1"
        characterName="Mèo Máy"
        lockedFeatures={['chuông vàng trước cổ', 'túi thần kỳ trước bụng']}
        initialAttemptsLeft={6}
        maxAttempts={6}
        studentStars={15}
      />
    )

    expect(html).toContain('Thiết kế Mèo Máy thông minh')
    expect(html).toContain('Hôm nay chỉ vẽ Mèo Máy')
    expect(html).toContain('chuông vàng trước cổ')
    expect(html).toContain('túi thần kỳ trước bụng')
    expect(html).toContain('15')
    expect(html).toContain('Tiến Trình 4 Bước Thực Hành')
  })

  it('renders dynamically when provided with SSOT config (e.g. Bai 1.1 Cat Fat)', () => {
    const config11 = getAikiStudioConfig('bai-1-1')
    expect(config11.subjectName).toBe('Chú Mèo Mướp Béo')
    expect(config11.illustrationType).toBe('cat-fat')

    const html = renderToStaticMarkup(
      <AikiStudioWorkspace config={config11} />
    )

    expect(html).toContain('Chú Mèo Mướp Béo')
    expect(html).toContain('Bài 1.1')
    expect(html).toContain('Tiến Trình 4 Bước Thực Hành')
    expect(html).toContain('mèo mướp vàng béo tròn')
    expect(html).toContain('lông vằn cam trắng')
    expect(html).toContain('đang nằm ngủ cuộn tròn')
    expect(html).toContain('Mẹo Vàng Của AIKI')
  })

  it('renders dynamically when provided with SSOT config for Island 5 (Bai 5.1 Dragon Card)', () => {
    const config51 = getAikiStudioConfig('bai-5-1')
    expect(config51.subjectName).toBe('Thẻ Bài Rồng Băng Tinh Thể')
    expect(config51.illustrationType).toBe('dragon-card')

    const html = renderToStaticMarkup(
      <AikiStudioWorkspace config={config51} />
    )

    expect(html).toContain('Thẻ Bài Rồng Băng Tinh Thể')
    expect(html).toContain('Bài 5.1')
    expect(html).toContain('thẻ bài rồng băng vảy pha lê xanh ngọc')
    expect(html).toContain('viền thẻ nguyên tố Băng bạc')
    expect(html).toContain('Tiến Trình 4 Bước Thực Hành')
  })

  it('verifies getAikiStudioConfig coverage for all 22 lessons across 5 islands', () => {
    const keys = [
      'bai-1-1', 'bai-1-2', 'bai-1-3', 'bai-1-4',
      'bai-2-1', 'bai-2-2', 'bai-2-3', 'bai-2-4',
      'bai-3-1', 'bai-3-2', 'bai-3-3', 'bai-3-4',
      'bai-4-1', 'bai-4-2', 'bai-4-3', 'bai-4-4', 'bai-4-5',
      'bai-5-1', 'bai-5-2', 'bai-5-3', 'bai-5-4', 'bai-5-5',
    ]

    for (const key of keys) {
      const cfg = getAikiStudioConfig(key)
      expect(cfg).toBeDefined()
      expect(cfg.badge).toBeDefined()
      expect(cfg.subjectName).toBeTruthy()
      expect(cfg.lockedFeatures.length).toBeGreaterThan(0)
      expect(cfg.missionChecklist.length).toBe(4)
      expect(cfg.preloadedImages.length).toBeGreaterThan(0)
    }

    // Kiểm tra matching qua slug đầy đủ từ curriculum
    const cfgCat = getAikiStudioConfig('bai-1-1-mot-tu-hay-nam-tu')
    expect(cfgCat.subjectName).toBe('Chú Mèo Mướp Béo')

    const cfgRabbit = getAikiStudioConfig('bai-1-2-bon-chiec-chia-khoa')
    expect(cfgRabbit.subjectName).toBe('Cỗ Xe Bay Cà Rốt Của Thỏ Trắng')

    const cfgArena = getAikiStudioConfig('bai-5-5-dau-truong-khai-mo')
    expect(cfgArena.subjectName).toBe('Hộp Game & Đấu Trường Thần Thoại')

    // Rule mapping
    const cfgRule1 = getAikiStudioConfig('rule-1', 'Quy tắc 1: Nghĩ ý tưởng trước', 'aiki-rules')
    expect(cfgRule1.badge).toBe('QT 1')
    expect(cfgRule1.subjectName).toContain('Siêu Anh Hùng Bố')
  })

  it('calls creative API via generateCreativeImage and updates gallery', async () => {
    const spy = vi.spyOn(creativeApi, 'generateCreativeImage').mockResolvedValueOnce(
      'https://cdn.example.com/gflow-generated-socbong.png'
    )

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AikiStudioWorkspace
          lessonId="bai-3-2"
          lessonTitle="Bắt AIKI vẽ Sóc Bông bằng mật mã của các cậu"
          lessonBadge="Bài 3.2"
          characterName="Sóc Bông"
        />
      )
    })

    // Click nút chip 1-chạm: "👉 Chạm để thử ngay: Sóc Bông"
    const quickChipBtn = container.querySelector('[data-testid="studio-step-quick-btn"]') as HTMLButtonElement
    expect(quickChipBtn).not.toBeNull()

    await act(async () => {
      quickChipBtn.click()
    })

    // Kiểm tra generateCreativeImage được gọi
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringMatching(/Cute 3D cartoon animation style.*Sóc.*Strictly avoid realistic photo/),
        aspectRatio: '4:3',
      })
    )

    // Kiểm tra tin nhắn chờ của AIKI xuất hiện trong chat
    expect(container.textContent).toContain('🐱 AIKI đang kết nối Gateway và tạo tranh bằng Google Flow cho bạn... Chờ tớ một chút nhé! ✨')

    // Kiểm tra tin nhắn phản hồi thành công và ảnh mới được thêm vào gallery
    expect(container.textContent).toContain('Đã tạo tranh hoàn thành cho bé!')
    expect(container.textContent).toContain('1 ảnh')

    // Dọn dẹp
    act(() => {
      root.unmount()
    })
    container.remove()
    spy.mockRestore()
  })

  it('gracefully falls back to curated sampleUrl when creative API is unavailable or worker is busy', async () => {
    const spy = vi.spyOn(creativeApi, 'generateCreativeImage').mockRejectedValueOnce(
      new Error('Worker timeout or extension disconnected')
    )
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AikiStudioWorkspace
          lessonId="bai-3-2"
          characterName="Sóc Bông"
        />
      )
    })

    const quickChipBtn = container.querySelector('[data-testid="studio-step-quick-btn"]') as HTMLButtonElement
    expect(quickChipBtn).not.toBeNull()

    await act(async () => {
      quickChipBtn.click()
    })

    // Kiểm tra API vẫn được gọi
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringMatching(/Sóc/),
        aspectRatio: '4:3',
      })
    )

    // Kiểm tra log warning graceful fallback
    expect(warnSpy).toHaveBeenCalled()

    // Trải nghiệm học tập không gián đoạn: Vẫn hoàn thành và đưa ảnh mẫu vào gallery
    expect(container.textContent).toContain('Đã tạo tranh hoàn thành cho bé!')
    expect(container.textContent).toContain('1 ảnh')

    // Dọn dẹp
    act(() => {
      root.unmount()
    })
    container.remove()
    spy.mockRestore()
    warnSpy.mockRestore()
  })

  it('verifies 2-zone layout (col-span-8 and col-span-4), compact top stepper, and Art Gallery Easel', () => {
    const html = renderToStaticMarkup(
      <AikiStudioWorkspace
        lessonId="bai-3-2"
        lessonTitle="Bắt AIKI vẽ Sóc Bông"
        lessonBadge="Bài 3.2"
        characterName="Sóc Bông"
        maxAttempts={6}
        studentStars={50}
      />
    )

    // Bố cục 2 khu vực: Chính (col-span-8) và Phụ (col-span-4)
    expect(html).toContain('lg:col-span-8')
    expect(html).toContain('lg:col-span-4')

    // Thanh Stepper 1 dòng tinh gọn trên đỉnh
    expect(html).toContain('data-testid="studio-col-tasks"')
    expect(html).toContain('Tiến Trình 4 Bước Thực Hành')
    expect(html).toContain('1. Lệnh ngắn')
    expect(html).toContain('2. Dáng &amp; Màu')
    expect(html).toContain('3. Đủ 5 chi tiết')
    expect(html).toContain('4. Soi &amp; Nộp')

    // Kệ Trưng Bày Nghệ Thuật Soft Clay (Art Gallery Easel)
    expect(html).toContain('⭐ Đã tạo: 0 / 6 tác phẩm')
    expect(html).toContain('Chờ cọ vẽ của bé trổ tài!')
    expect(html).toContain('Men Gốm')

    // Balo thật của hệ thống với 3 ngăn báu vật
    expect(html).toContain('BALO SÁNG TẠO CỦA BÉ')
    expect(html).toContain('Tranh &amp; Ảnh')
    expect(html).toContain('Truyện Tranh')
    expect(html).toContain('Huy Hiệu')
  })

  it('opens Backpack Modal with 3 system tabs and link to /backpack', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AikiStudioWorkspace
          lessonId="bai-3-2"
          characterName="Sóc Bông"
          studentStars={25}
        />
      )
    })

    // Click nút mở Balo
    const openBpBtn = container.querySelector('[data-testid="studio-open-backpack-btn"]') as HTMLButtonElement
    expect(openBpBtn).not.toBeNull()

    await act(async () => {
      openBpBtn.click()
    })

    // Modal Balo xuất hiện
    const modal = container.querySelector('[data-testid="studio-backpack-modal"]')
    expect(modal).not.toBeNull()
    expect(modal?.textContent).toContain('Balo Sáng Tạo Của Bé')
    expect(modal?.textContent).toContain('Tranh & Ảnh')
    expect(modal?.textContent).toContain('Truyện Tranh')
    expect(modal?.textContent).toContain('Huy Hiệu')
    expect(modal?.textContent).toContain('Khám Phá Toàn Bộ Balo Tại /backpack')

    // Dọn dẹp
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('manages 4 practice items/parts and 8-slot gallery grid matching requirements', async () => {
    const html = renderToStaticMarkup(
      <AikiStudioWorkspace
        lessonId="bai-1-2"
        lessonTitle="Bốn Chiếc Chìa Khóa Vạn Năng"
        lessonBadge="Bài 1.2"
        characterName="Con cún"
        maxAttempts={8}
      />
    )

    // 1. Kiểm tra 4 Món đồ mặc định theo bài 1.2
    expect(html).toContain('Con cún')
    expect(html).toContain('Cái xe đạp')
    expect(html).toContain('Cuốn sách')
    expect(html).toContain('Cái đồng hồ')

    // 2. Kiểm tra Badges yêu cầu
    expect(html).toContain('BALO SÁNG TẠO (0/8 ảnh)')
    expect(html).toContain('Lượt tạo của phần này 0/2')

    // 3. Kiểm tra Lưới 8 ô (4 hàng x 2 cột: P1 lượt 1/2, P2 lượt 1/2, P3 lượt 1/2, P4 lượt 1/2)
    expect(html).toContain('P1 lượt 1/2')
    expect(html).toContain('P1 lượt 2/2')
    expect(html).toContain('P2 lượt 1/2')
    expect(html).toContain('P2 lượt 2/2')
    expect(html).toContain('P3 lượt 1/2')
    expect(html).toContain('P3 lượt 2/2')
    expect(html).toContain('P4 lượt 1/2')
    expect(html).toContain('P4 lượt 2/2')

    // 4. Kiểm tra Thanh Chọn 4 Món Đồ Thực Hành (Practice Items Switcher) ngay trên Header
    expect(html).toContain('Món đồ bé vẽ:')
    expect(html).toContain('data-testid="practice-item-select-1"')
    expect(html).toContain('data-testid="practice-item-select-2"')
    expect(html).toContain('data-testid="practice-item-select-3"')
    expect(html).toContain('data-testid="practice-item-select-4"')
  })

  it('synchronizes step1QuickPrompt when switching practice items (e.g. from dog to clock)', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AikiStudioWorkspace
          lessonId="bai-1-2"
          lessonTitle="Bốn Chiếc Chìa Khóa Vạn Năng"
          lessonBadge="Bài 1.2"
          characterName="Con cún"
          maxAttempts={8}
        />
      )
    })

    // Ban đầu chọn Part 1: Con cún -> prompt gợi ý là "Con cún"
    const quickPromptBtnInitial = container.querySelector('[data-testid="studio-step-quick-btn"]')
    expect(quickPromptBtnInitial?.textContent).toContain('Con cún')

    // Click chuyển sang Part 4: Cái đồng hồ
    const part4Btn = container.querySelector('[data-testid="practice-item-select-4"]') as HTMLButtonElement
    expect(part4Btn).not.toBeNull()

    await act(async () => {
      part4Btn.click()
    })

    // Sau khi chuyển, prompt gợi ý cập nhật theo Món 4 (Cái đồng)
    const quickPromptBtnAfter = container.querySelector('[data-testid="studio-step-quick-btn"]')
    expect(quickPromptBtnAfter?.textContent).toContain('Cái đồng')
    expect(quickPromptBtnAfter?.textContent).not.toContain('Con cún')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('switches sample artwork and banner dynamically across 4 soft clay items in Lesson 1.2', async () => {
    // 1. Kiểm tra unit hàm getStudioAIArtwork
    expect(getStudioAIArtwork(undefined, 'bai-1-2', 'Con cún')).toBe('/assets/pregenerated-fallback/magic-keys/dog_full_details_v1.webp')
    expect(getStudioAIArtwork(undefined, 'bai-1-2', 'Cái xe đạp')).toBe('/assets/aiki-islands/island1_lesson2_bicycle.jpg')
    expect(getStudioAIArtwork(undefined, 'bai-1-2', 'Cuốn sách')).toBe('/assets/aiki-islands/island1_lesson2_notebook.jpg')
    expect(getStudioAIArtwork(undefined, 'bai-1-2', 'Cái đồng hồ')).toBe('/assets/aiki-islands/island1_lesson2_clock.jpg')

    // 2. Kiểm tra tương tác component AikiStudioWorkspace
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AikiStudioWorkspace
          lessonId="bai-1-2"
          lessonTitle="Bốn Chiếc Chìa Khóa Vạn Năng"
          lessonBadge="Bài 1.2"
          characterName="Con cún"
          maxAttempts={8}
        />
      )
    })

    const emptyCanvas = container.querySelector('[data-testid="studio-canvas-empty"]')
    expect(emptyCanvas).not.toBeNull()

    // Ban đầu: Món 1 (Con cún)
    const emptyImg = emptyCanvas?.querySelector('img') as HTMLImageElement
    expect(emptyImg.src).toContain('dog_full_details_v1.webp')
    expect(emptyCanvas?.textContent).toContain('Món 1: Con cún')

    // Chuyển sang Món 2 (Xe đạp)
    const part2Btn = container.querySelector('[data-testid="practice-item-select-2"]') as HTMLButtonElement
    await act(async () => {
      part2Btn.click()
    })
    expect(emptyImg.src).toContain('island1_lesson2_bicycle.jpg')
    expect(emptyCanvas?.textContent).toContain('Món 2: Cái xe đạp')

    // Chuyển sang Món 3 (Cuốn sách)
    const part3Btn = container.querySelector('[data-testid="practice-item-select-3"]') as HTMLButtonElement
    await act(async () => {
      part3Btn.click()
    })
    expect(emptyImg.src).toContain('island1_lesson2_notebook.jpg')
    expect(emptyCanvas?.textContent).toContain('Món 3: Cuốn sách')

    // Chuyển sang Món 4 (Cái đồng hồ)
    const part4Btn = container.querySelector('[data-testid="practice-item-select-4"]') as HTMLButtonElement
    await act(async () => {
      part4Btn.click()
    })
    expect(emptyImg.src).toContain('island1_lesson2_clock.jpg')
    expect(emptyCanvas?.textContent).toContain('Món 4: Cái đồng hồ')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('renders Flat Clay SVG icons for practice parts correctly and clearly without dark background', () => {
    const container = document.createElement('div')
    const root = createRoot(container)

    act(() => {
      root.render(
        <div>
          <div data-testid="icon-teacup">{renderObjectClayIcon('Cái cốc sứ trắng', 28)}</div>
          <div data-testid="icon-bicycle">{renderObjectClayIcon('Cái xe đạp', 28)}</div>
          <div data-testid="icon-notebook">{renderObjectClayIcon('Cuốn sổ tay mở', 28)}</div>
          <div data-testid="icon-clock">{renderObjectClayIcon('Cái đồng hồ cổ', 28)}</div>
        </div>
      )
    })

    const teacupSvg = container.querySelector('[data-testid="icon-teacup"] svg')
    const bicycleSvg = container.querySelector('[data-testid="icon-bicycle"] svg')
    const notebookSvg = container.querySelector('[data-testid="icon-notebook"] svg')
    const clockSvg = container.querySelector('[data-testid="icon-clock"] svg')

    expect(teacupSvg?.getAttribute('aria-label')).toBe('Cốc sứ trắng')
    expect(bicycleSvg?.getAttribute('aria-label')).toBe('Cái xe đạp')
    expect(notebookSvg?.getAttribute('aria-label')).toBe('Cuốn sổ tay mở')
    expect(clockSvg?.getAttribute('aria-label')).toBe('Cái đồng hồ cổ')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('renders Column 1 practice items with THỰC HÀNH status pill and turn badges matching mockup', () => {
    const container = document.createElement('div')
    const root = createRoot(container)

    act(() => {
      root.render(
        <AikiStudioWorkspace
          lessonId="bai-1-2"
          lessonTitle="Bốn Chiếc Chìa Khóa Vạn Năng"
          lessonBadge="Bài 1.2"
          characterName="Con cún"
          turnsPerItem={2}
          maxAttempts={8}
        />
      )
    })

    const part1Card = container.querySelector('[data-testid="practice-item-select-1"]')
    const part2Card = container.querySelector('[data-testid="practice-item-select-2"]')

    expect(part1Card).not.toBeNull()
    expect(part1Card?.textContent).toContain('THỰC HÀNH 01 · ĐANG LÀM')
    expect(part1Card?.textContent).toContain('Con cún')
    expect(part1Card?.textContent).toContain('lượt 1')
    expect(part1Card?.textContent).toContain('lượt 2')

    expect(part2Card).not.toBeNull()
    expect(part2Card?.textContent).toContain('THỰC HÀNH 02 · CHỜ')
    expect(part2Card?.textContent).toContain('Cái xe đạp')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('renders content-sized Column 1 practice items without stretching them to preview height', () => {
    const container = document.createElement('div')
    const root = createRoot(container)

    act(() => {
      root.render(
        <AikiStudioWorkspace
          lessonId="bai-1-2"
          lessonTitle="Bốn Chiếc Chìa Khóa Vạn Năng"
          lessonBadge="Bài 1.2"
          characterName="Cốc Sứ Trắng"
          maxAttempts={8}
        />
      )
    })

    const part1Btn = container.querySelector('[data-testid="practice-item-select-1"]') as HTMLButtonElement
    expect(part1Btn).not.toBeNull()
    expect(part1Btn.className).not.toContain('flex-1')
    expect(part1Btn.className).not.toContain('min-h-[58px]')
    expect(part1Btn.className).toContain('overflow-hidden')

    const parentList = part1Btn.parentElement
    expect(parentList).not.toBeNull()
    expect(parentList?.className).toContain('grid')
    expect(parentList?.className).toContain('md:grid-cols-1')
    expect(parentList?.className).not.toContain('justify-between')

    const outerCol1 = parentList?.parentElement
    expect(outerCol1).not.toBeNull()
    expect(outerCol1?.className).not.toContain('h-full')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('correctly scopes gallery images to activePartIndex so switching parts does not display previous part image', async () => {
    const preloadedMock = [
      {
        id: 'img-p1-1',
        turn: 1,
        partIndex: 0,
        prompt: 'Chú cún con lông vàng',
        time: '08:30',
        toneBg: 'bg-amber-100',
        url: '/assets/pregenerated-fallback/magic-keys/dog_full_details_v1.webp',
      },
    ]

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AikiStudioWorkspace
          lessonId="bai-1-2"
          lessonTitle="Bốn Chiếc Chìa Khóa Vạn Năng"
          lessonBadge="Bài 1.2"
          characterName="Con cún"
          maxAttempts={8}
          preloadedImages={preloadedMock}
        />
      )
    })

    // Part 1 (Con cún): Canvas có ảnh của Part 1
    const activeCanvasImg = container.querySelector('[data-testid="studio-live-canvas-display"] img') as HTMLImageElement
    expect(activeCanvasImg).not.toBeNull()
    expect(activeCanvasImg.src).toContain('dog_full_details_v1.webp')

    // Chuyển sang Part 3 (Cuốn sách) - phần này chưa vẽ
    const part3Btn = container.querySelector('[data-testid="practice-item-select-3"]') as HTMLButtonElement
    await act(async () => {
      part3Btn.click()
    })

    // Khung canvas phải ở trạng thái empty chờ vẽ Part 3, TUYỆT ĐỐI không hiển thị ảnh Part 1 (Con cún)
    const emptyCanvas = container.querySelector('[data-testid="studio-canvas-empty"]')
    expect(emptyCanvas).not.toBeNull()
    expect(emptyCanvas?.textContent).toContain('Món 3: Cuốn sách')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('accurately reflects turn 1 and turn 2 states based on gallery, preventing turn 1 from being green when not drawn', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    // 1. Trường hợp gallery rỗng (chưa vẽ tranh nào)
    await act(async () => {
      root.render(
        <AikiStudioWorkspace
          lessonId="bai-1-2"
          lessonTitle="Bốn Chiếc Chìa Khóa Vạn Năng"
          lessonBadge="Bài 1.2"
          characterName="Cốc Sứ Trắng"
          turnsPerItem={2}
          maxAttempts={8}
          preloadedImages={[]}
        />
      )
    })

    const part1Card = container.querySelector('[data-testid="practice-item-select-1"]') as HTMLButtonElement
    expect(part1Card).not.toBeNull()
    expect(part1Card.textContent).toContain('THỰC HÀNH 01 · ĐANG LÀM')

    const turnBadges = part1Card.querySelectorAll('span.rounded-md')
    expect(turnBadges.length).toBe(2)
    // Lượt 1: đang làm, màu vàng amber, tuyệt đối không có dấu tick xanh
    expect(turnBadges[0].textContent).toBe('lượt 1')
    expect(turnBadges[0].className).toContain('bg-amber-100/80')
    expect(turnBadges[0].className).not.toContain('bg-emerald-100/90')

    // Lượt 2: chờ, màu xám slate
    expect(turnBadges[1].textContent).toBe('lượt 2')
    expect(turnBadges[1].className).toContain('bg-slate-100')

    act(() => {
      root.unmount()
    })
    container.remove()

    // 2. Trường hợp gallery có 1 ảnh của Part 1
    const oneImageMock: StudioImageItem[] = [
      {
        id: 'img-p1-turn1',
        url: '/assets/aiki-islands/island1_lesson2_teacup.jpg',
        prompt: 'Cái cốc sứ trắng',
        time: '1 phút trước',
        toneBg: 'bg-amber-100',
        turn: 1,
        partIndex: 0,
        partTurn: 1,
      },
    ]

    const container2 = document.createElement('div')
    document.body.appendChild(container2)
    const root2 = createRoot(container2)

    await act(async () => {
      root2.render(
        <AikiStudioWorkspace
          lessonId="bai-1-2"
          lessonTitle="Bốn Chiếc Chìa Khóa Vạn Năng"
          lessonBadge="Bài 1.2"
          characterName="Cốc Sứ Trắng"
          turnsPerItem={2}
          maxAttempts={8}
          preloadedImages={oneImageMock}
        />
      )
    })

    const part1CardAfter1 = container2.querySelector('[data-testid="practice-item-select-1"]') as HTMLButtonElement
    expect(part1CardAfter1.textContent).toContain('THỰC HÀNH 01 · 1/2 LƯỢT')
    const turnBadgesAfter1 = part1CardAfter1.querySelectorAll('span.rounded-md')
    // Lượt 1: đã xong, xanh lá có tick
    expect(turnBadgesAfter1[0].textContent).toBe('✓ lượt 1')
    expect(turnBadgesAfter1[0].className).toContain('bg-emerald-100/90')
    // Lượt 2: đang làm, màu vàng amber
    expect(turnBadgesAfter1[1].textContent).toBe('lượt 2')
    expect(turnBadgesAfter1[1].className).toContain('bg-amber-100/80')

    act(() => {
      root2.unmount()
    })
    container2.remove()
  })

  it('handles 2-turn evolution tabs and switches displayedPartImage vs studio-canvas-empty correctly', async () => {
    const mockImages: StudioImageItem[] = [
      {
        id: 'img-p1-t1',
        url: '/assets/aiki-islands/island1_lesson2_teacup.jpg',
        prompt: 'Cái cốc sứ trắng',
        time: '08:30',
        toneBg: 'bg-amber-100',
        turn: 1,
        partIndex: 0,
        partTurn: 1,
      },
    ]

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AikiStudioWorkspace
          lessonId="bai-1-2"
          lessonTitle="Bốn Chiếc Chìa Khóa Vạn Năng"
          lessonBadge="Bài 1.2"
          characterName="Cốc Sứ Trắng"
          turnsPerItem={2}
          maxAttempts={8}
          preloadedImages={mockImages}
        />
      )
    })

    // 1. Kiểm tra Turn Switcher tabs
    expect(container.textContent).toContain('Lượt 1: Sơ khai')
    expect(container.textContent).toContain('Lượt 2: Hoàn thiện ★')
    expect(container.textContent).toContain('✓ Đã vẽ')
    expect(container.textContent).toContain('Chưa vẽ')

    // 2. Khung ảnh to đang hiển thị ảnh Lượt 1, kiểm tra responsive max-h giải phóng chiều cao cho Prompt Bar và max-w bảo toàn tỷ lệ 4:3
    const liveCanvas = container.querySelector('[data-testid="studio-live-canvas-display"]')
    expect(liveCanvas).not.toBeNull()
    expect(liveCanvas?.textContent).toContain('Lượt 1')
    expect(liveCanvas?.className).toContain('lg:max-h-[290px]')
    expect(liveCanvas?.className).toContain('xl:max-h-[310px]')
    expect(liveCanvas?.className).toContain('2xl:max-h-[350px]')
    expect(liveCanvas?.className).toContain('max-w-md')
    expect(liveCanvas?.className).toContain('sm:max-w-lg')
    expect(liveCanvas?.className).toContain('xl:max-w-none')
    expect(liveCanvas?.className).toContain('mx-auto')
    const liveImg = liveCanvas?.querySelector('img')
    expect(liveImg?.className).toContain('object-contain')

    // 3. Click chuyển sang Tab Lượt 2
    const buttons = container.querySelectorAll('button')
    const turn2Btn = Array.from(buttons).find((b) => b.textContent?.includes('Lượt 2: Hoàn thiện ★'))
    expect(turn2Btn).toBeDefined()

    await act(async () => {
      turn2Btn?.click()
    })

    // 4. Vì chưa vẽ lượt 2, canvas to chuyển sang studio-canvas-empty, kiểm tra responsive max-h và max-w
    const emptyCanvas = container.querySelector('[data-testid="studio-canvas-empty"]')
    expect(emptyCanvas).not.toBeNull()
    expect(emptyCanvas?.textContent).toContain('Khung Tranh Của Học Sinh Đang Chờ!')
    expect(emptyCanvas?.className).toContain('lg:max-h-[290px]')
    expect(emptyCanvas?.className).toContain('xl:max-h-[310px]')
    expect(emptyCanvas?.className).toContain('2xl:max-h-[350px]')
    expect(emptyCanvas?.className).toContain('max-w-md')
    expect(emptyCanvas?.className).toContain('sm:max-w-lg')
    expect(emptyCanvas?.className).toContain('xl:max-w-none')
    expect(emptyCanvas?.className).toContain('mx-auto')

    // 5. Kiểm tra Dải phim Mini Filmstrip Gallery
    expect(container.textContent).toContain('Balo bài học:')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('opens Masterpiece Selection modal, allows candidate selection, and confirms submission', async () => {
    const onSubmitWorkSpy = vi.fn()
    const mockImages: StudioImageItem[] = [
      {
        id: 'img-p1-t1',
        url: '/assets/aiki-islands/island1_lesson2_teacup.jpg',
        prompt: 'Cái cốc sứ trắng',
        time: '08:30',
        toneBg: 'bg-amber-100',
        turn: 1,
        partIndex: 0,
        partTurn: 1,
      },
      {
        id: 'img-p1-t2',
        url: '/assets/aiki-islands/island1_lesson2_teacup.jpg',
        prompt: 'Cái cốc sứ trắng có quai tròn viền vàng',
        time: '08:32',
        toneBg: 'bg-purple-100',
        turn: 2,
        partIndex: 0,
        partTurn: 2,
      },
    ]

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AikiStudioWorkspace
          lessonId="bai-1-2"
          lessonTitle="Bốn Chiếc Chìa Khóa Vạn Năng"
          lessonBadge="Bài 1.2"
          characterName="Cốc Sứ Trắng"
          maxAttempts={8}
          preloadedImages={mockImages}
          onSubmitWork={onSubmitWorkSpy}
        />
      )
    })

    // 1. Nút Submit hiển thị số ảnh đã tạo (2 ảnh)
    const submitBtn = container.querySelector('[data-testid="studio-submit-btn"]') as HTMLButtonElement
    expect(submitBtn).not.toBeNull()
    expect(submitBtn.textContent).toContain('2 ảnh')

    // 2. Mở Modal Nộp Bài
    await act(async () => {
      submitBtn.click()
    })

    const modal = document.querySelector('[data-testid="studio-submit-modal"]')
    expect(modal).not.toBeNull()
    expect(modal?.textContent).toContain('Chọn một tranh để nộp bài')
    expect(modal?.textContent).toContain('Chạm vào ảnh để xem rõ và chọn')
    expect(modal?.textContent).toContain('ĐANG CHỌN')

    // 3. Bấm xác nhận nộp bài
    const confirmBtn = document.querySelector('[data-testid="studio-confirm-submit"]') as HTMLButtonElement
    expect(confirmBtn).not.toBeNull()

    await act(async () => {
      confirmBtn.click()
    })

    // Modal chuyển sang trạng thái chúc mừng nhận cúp
    expect(modal?.textContent).toContain('XUẤT SẮC QUÁ CẬU ƠI!')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('supports multiplatform horizontal scrolling (touch-pan-x, chevron buttons, drag-to-scroll, active thumbnail indicator)', async () => {
    // Mock scrollIntoView and scrollBy for jsdom
    const scrollIntoViewMock = vi.fn()
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AikiStudioWorkspace
          lessonId="bai-1-2"
          characterName="Cái cốc sứ trắng"
          maxAttempts={8}
        />
      )
    })

    // 1. Kiểm tra hai nút cuộn Chevron tactile
    const scrollLeftBtn = container.querySelector('[data-testid="filmstrip-scroll-left"]') as HTMLButtonElement
    const scrollRightBtn = container.querySelector('[data-testid="filmstrip-scroll-right"]') as HTMLButtonElement
    expect(scrollLeftBtn).not.toBeNull()
    expect(scrollRightBtn).not.toBeNull()
    expect(scrollLeftBtn.getAttribute('aria-label')).toBe('Cuộn sang trái')
    expect(scrollRightBtn.getAttribute('aria-label')).toBe('Cuộn sang phải')

    // 2. Ban đầu canScrollLeft = false -> disabled
    expect(scrollLeftBtn.disabled).toBe(true)
    expect(scrollLeftBtn.className).toContain('opacity-30')

    // 3. Kiểm tra container dải phim có các class đa nền tảng
    const filmstripEl = container.querySelector('.touch-pan-x') as HTMLDivElement
    expect(filmstripEl).not.toBeNull()
    expect(filmstripEl.className).toContain('scroll-smooth')
    expect(filmstripEl.className).toContain('snap-x')
    expect(filmstripEl.className).toContain('select-none')
    expect(filmstripEl.className).toContain('cursor-grab')
    expect(filmstripEl.textContent).toContain('🎒')
    expect(filmstripEl.textContent).toContain('Balo bài học:')

    // 4. Kiểm tra thumbnail active có data-active-filmstrip="true" và snap-start
    const activeThumbnail = filmstripEl.querySelector('[data-active-filmstrip="true"]') as HTMLElement
    expect(activeThumbnail).not.toBeNull()
    expect(activeThumbnail.className).toContain('snap-start')
    expect(scrollIntoViewMock).toHaveBeenCalled()

    // 5. Giả lập cuộn filmstrip để kích hoạt checkFilmstripScroll
    Object.defineProperty(filmstripEl, 'scrollLeft', { value: 50, writable: true })
    Object.defineProperty(filmstripEl, 'clientWidth', { value: 300, writable: true })
    Object.defineProperty(filmstripEl, 'scrollWidth', { value: 600, writable: true })

    await act(async () => {
      filmstripEl.dispatchEvent(new Event('scroll'))
    })

    expect(scrollLeftBtn.disabled).toBe(false)
    expect(scrollRightBtn.disabled).toBe(false)

    // 6. Click nút cuộn chevron
    const scrollByMock = vi.fn()
    filmstripEl.scrollBy = scrollByMock

    await act(async () => {
      scrollRightBtn.click()
    })
    expect(scrollByMock).toHaveBeenCalledWith(expect.objectContaining({ left: 140, behavior: 'smooth' }))

    await act(async () => {
      scrollLeftBtn.click()
    })
    expect(scrollByMock).toHaveBeenCalledWith(expect.objectContaining({ left: -140, behavior: 'smooth' }))

    // 7. Test Mouse Drag-to-Scroll
    await act(async () => {
      filmstripEl.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 200 }))
      filmstripEl.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 150 }))
      filmstripEl.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    })

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('blocks Turn 1 when already drawn with clear message, and blocks Turn 2 when completed', async () => {
    const mockImages: StudioImageItem[] = [
      {
        id: 'img-p1-t1',
        url: '/assets/aiki-islands/island1_lesson2_teacup.jpg',
        prompt: 'Cái cốc sứ trắng',
        time: '08:30',
        toneBg: 'bg-amber-100',
        turn: 1,
        partIndex: 0,
        partTurn: 1,
      },
    ]

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AikiStudioWorkspace
          lessonId="bai-1-2"
          characterName="Cốc Sứ Trắng"
          turnsPerItem={2}
          maxAttempts={8}
          preloadedImages={mockImages}
        />
      )
    })

    // Theo logic tối ưu mới: Nếu Lượt 1 đã vẽ mà Lượt 2 chưa vẽ, hệ thống tự động chọn Lượt 2 để trẻ vẽ tiếp (không bị khóa)
    const drawBtn = container.querySelector('[data-testid="studio-draw-btn"]') as HTMLButtonElement
    expect(drawBtn).not.toBeNull()
    expect(drawBtn.textContent).not.toContain('🔒 Lượt 1 đã vẽ xong')

    // Khi trẻ bấm chọn lại Lượt 1: Sơ khai đã vẽ, nút vẽ bị khóa với thông báo rõ ràng
    const buttons = container.querySelectorAll('button')
    const turn1Btn = Array.from(buttons).find((b) => b.textContent?.includes('Lượt 1: Sơ khai'))
    await act(async () => {
      turn1Btn?.click()
    })

    expect(drawBtn.disabled).toBe(true)
    expect(drawBtn.textContent).toContain('🔒 Lượt 1 đã vẽ xong · Chuyển sang Lượt 2 nhé!')

    // Chuyển lại sang Lượt 2: Chưa vẽ nên nút mở khóa sẵn sàng
    const turn2Btn = Array.from(buttons).find((b) => b.textContent?.includes('Lượt 2: Hoàn thiện ★'))
    await act(async () => {
      turn2Btn?.click()
    })

    // Turn 2 is not drawn yet, button should NOT show locked message
    const drawBtnAfter = container.querySelector('[data-testid="studio-draw-btn"]') as HTMLButtonElement
    expect(drawBtnAfter.textContent).not.toContain('🔒 Lượt 1 đã vẽ xong')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('supports CMS configuration via maxTurnsPerItem and turnsPerItem prop', () => {
    const configWithMaxTurns = {
      ...getAikiStudioConfig('bai-1-2'),
      maxTurnsPerItem: 1,
    }

    const html = renderToStaticMarkup(
      <AikiStudioWorkspace
        lessonId="bai-1-2"
        config={configWithMaxTurns}
        turnsPerItem={1}
      />
    )

    expect(html).toContain('data-testid="aiki-studio-workspace"')
  })

  it('restores gallery and selectedTurnByPart from localStorage session, calculating attemptsLeft accurately', async () => {
    const sessionKey = 'aiki_studio_session_bai-test-session'
    const sessionTurnsKey = 'aiki_studio_turns_bai-test-session'
    const savedGallery = [
      {
        id: 'img-saved-1',
        url: '/assets/aiki-islands/island1_lesson2_teacup.jpg',
        prompt: 'Cái cốc sứ',
        time: '08:30',
        toneBg: 'bg-amber-100',
        turn: 1,
        partIndex: 0,
        partTurn: 1 as const,
      },
      {
        id: 'img-saved-2',
        url: '/assets/aiki-islands/island1_lesson2_teacup.jpg',
        prompt: 'Cái cốc sứ viền vàng',
        time: '08:35',
        toneBg: 'bg-purple-100',
        turn: 2,
        partIndex: 0,
        partTurn: 2 as const,
      },
    ]

    localStorage.setItem(sessionKey, JSON.stringify(savedGallery))
    localStorage.setItem(sessionTurnsKey, JSON.stringify({ 0: 2 }))

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AikiStudioWorkspace
          lessonId="bai-test-session"
          turnsPerItem={2}
          maxAttempts={8}
        />
      )
    })

    // attemptsLeft should be maxAttempts - 2 = 6
    expect(container.textContent).toContain('6')
    // Both turns drawn for part 0 -> on turn 2 shows completion message
    const drawBtn = container.querySelector('[data-testid="studio-draw-btn"]') as HTMLButtonElement
    expect(drawBtn.disabled).toBe(true)
    expect(drawBtn.textContent).toContain('🏆 Đã hoàn thành 2/2 lượt món này')

    localStorage.removeItem(sessionKey)
    localStorage.removeItem(sessionTurnsKey)

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('saves masterpiece and all gallery works to aiki_backpack_saved_works when confirming submit', async () => {
    const mockImages: StudioImageItem[] = [
      {
        id: 'img-sub-1',
        url: '/assets/aiki-islands/island1_lesson2_teacup.jpg',
        prompt: 'Cái cốc sứ trắng',
        time: '08:30',
        toneBg: 'bg-amber-100',
        turn: 1,
        partIndex: 0,
        partTurn: 1,
      },
      {
        id: 'img-sub-2',
        url: '/assets/aiki-islands/island1_lesson2_teacup.jpg',
        prompt: 'Cái cốc sứ quai vàng',
        time: '08:32',
        toneBg: 'bg-purple-100',
        turn: 2,
        partIndex: 0,
        partTurn: 2,
      },
    ]

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AikiStudioWorkspace
          lessonId="bai-1-2"
          characterName="Cốc Sứ Trắng"
          maxAttempts={8}
          preloadedImages={mockImages}
        />
      )
    })

    const submitBtn = container.querySelector('[data-testid="studio-submit-btn"]') as HTMLButtonElement
    await act(async () => {
      submitBtn.click()
    })

    const confirmBtn = document.querySelector('[data-testid="studio-confirm-submit"]') as HTMLButtonElement
    await act(async () => {
      confirmBtn.click()
    })

    const backpackRaw = localStorage.getItem('aiki_backpack_saved_works')
    expect(backpackRaw).not.toBeNull()
    const savedWorks = JSON.parse(backpackRaw!)
    expect(Array.isArray(savedWorks)).toBe(true)
    expect(savedWorks.length).toBeGreaterThanOrEqual(2)
    // Masterpiece is marked
    expect(savedWorks[0].isMasterpiece).toBe(true)

    localStorage.removeItem('aiki_backpack_saved_works')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('returns engine-specific default practice parts based on mode or lessonId', () => {
    // 1. prompt-doctor
    expect(getDefaultPracticeParts(undefined, undefined, 'prompt-doctor')).toHaveLength(4)
    expect(getDefaultPracticeParts('bai-1-4')[0].title).toContain('Ca 1: Hiệp Sĩ Bạc')

    // 2. layer-stacking
    expect(getDefaultPracticeParts(undefined, undefined, 'layer-stacking')[0].title).toContain('Hiệp Sĩ Cáo Lửa')
    expect(getDefaultPracticeParts('bai-2-2')[0].title).toContain('Bức tranh ba lớp')
    expect(getDefaultPracticeParts('bai-2-2')).toHaveLength(1)

    // 3. card-forge
    expect(getDefaultPracticeParts(undefined, undefined, 'card-forge')[0].title).toContain('Rồng Băng Bão Tuyết')
    expect(getDefaultPracticeParts('bai-3-1')).toHaveLength(0)
    expect(getDefaultPracticeParts('bai-4-4')).toHaveLength(8)
    expect(getDefaultPracticeParts('bai-4-4')[0].title).toBe('Khung 1')
    expect(getDefaultPracticeParts('bai-5-1')).toHaveLength(0)

    // 4. identity-lock
    expect(DEFAULT_IDENTITY_LOCK_PARTS).toHaveLength(4)
    expect(DEFAULT_IDENTITY_LOCK_PARTS[0].title).toBe('Chú Sóc Bông Hạt Dẻ')
    expect(DEFAULT_IDENTITY_LOCK_PARTS[1].title).toBe('Cáo Lửa Zico Hiệp Sĩ')
    expect(DEFAULT_IDENTITY_LOCK_PARTS[2].title).toBe('Chú Bé Robot Leo')
    expect(DEFAULT_IDENTITY_LOCK_PARTS[3].title).toBe('Mèo Thám Tử AIKI')

    const identityParts = getDefaultPracticeParts(undefined, undefined, 'identity-lock')
    expect(identityParts).toHaveLength(4)
    expect(identityParts[0].title).toBe('Chú Sóc Bông Hạt Dẻ')
    expect(identityParts[1].title).toBe('Cáo Lửa Zico Hiệp Sĩ')
    expect(identityParts[2].title).toBe('Chú Bé Robot Leo')
    expect(identityParts[3].title).toBe('Mèo Thám Tử AIKI')

    const bai33Parts = getDefaultPracticeParts('bai-3-3')
    expect(bai33Parts).toHaveLength(6)
    expect(bai33Parts[0].title).toBe('Biểu cảm Vui 😊')
    expect(bai33Parts[1].title).toBe('Biểu cảm Buồn 😢')
    expect(bai33Parts[2].title).toBe('Biểu cảm Sợ 😨')
    expect(bai33Parts[3].title).toBe('Biểu cảm Giận 😠')
    expect(bai33Parts[4].title).toBe('Biểu cảm Ngạc nhiên 😲')
    expect(bai33Parts[5].title).toBe('Biểu cảm Buồn ngủ 😴')

    // 5. style-prism
    expect(getDefaultPracticeParts(undefined, undefined, 'style-prism')[0].title).toContain('Phong cách Màu nước')
    expect(getDefaultPracticeParts('bai-1-3')[0].title).toContain('Phong cách Màu nước')

    // 6. magic-keys / default
    expect(getDefaultPracticeParts(undefined, undefined, 'magic-keys')[0].title).toBe('Cái cốc sứ trắng')
    expect(getDefaultPracticeParts('bai-1-2')[0].title).toBe('Con cún')
  })

  it('supports instant fallback toggle mode and generates non-repeating curated artwork', async () => {
    const spy = vi.spyOn(creativeApi, 'generateCreativeImage')

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AikiStudioWorkspace
          lessonId="bai-3-2"
          characterName="Sóc Bông"
          initialInstantFallback={true}
        />
      )
    })

    // 1. Nút toggle xuất hiện với nhãn "⚡ Demo Nhanh"
    const toggleBtn = container.querySelector('[data-testid="toggle-instant-fallback-btn"]') as HTMLButtonElement
    expect(toggleBtn).not.toBeNull()
    expect(toggleBtn.textContent).toContain('⚡ Demo Nhanh')

    // 2. Chạy tạo tranh lượt 1 với instant fallback
    const quickChipBtn = container.querySelector('[data-testid="studio-step-quick-btn"]') as HTMLButtonElement
    expect(quickChipBtn).not.toBeNull()

    await act(async () => {
      quickChipBtn.click()
      await new Promise((resolve) => setTimeout(resolve, 600))
    })

    // generateCreativeImage KHÔNG được gọi vì đang ở chế độ Instant Fallback
    expect(spy).not.toHaveBeenCalled()

    // Ảnh đã được thêm vào gallery và hiển thị
    expect(container.textContent).toContain('1 ảnh')

    // 3. Chuyển toggle sang AI Gateway
    await act(async () => {
      toggleBtn.click()
    })
    expect(toggleBtn.textContent).toContain('🌐 AI Gateway')

    // 4. Chuyển lại về Demo Nhanh
    await act(async () => {
      toggleBtn.click()
    })
    expect(toggleBtn.textContent).toContain('⚡ Demo Nhanh')

    // Dọn dẹp
    act(() => {
      root.unmount()
    })
    container.remove()
    spy.mockRestore()
  })

  it('displays studio-live-canvas-prompt and synchronizes prompt when viewing saved image', async () => {
    const testPrompt = 'Cái cốc sứ trắng men sữa bóng bẩy đang bốc khói trên bàn gỗ'
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AikiStudioWorkspace
          lessonId="bai-1-2"
          characterName="Cái cốc sứ trắng"
          preloadedImages={[
            {
              id: 'img-1',
              url: '/sample-test.jpg',
              prompt: testPrompt,
              time: '12:00',
              toneBg: 'from-amber-100 to-amber-200',
              turn: 1,
              partIndex: 0,
              partTurn: 1,
            },
          ]}
        />
      )
    })

    // Banner câu lệnh đã kết hợp xuất hiện trên canvas
    const promptBanner = container.querySelector('[data-testid="studio-live-canvas-prompt"]')
    expect(promptBanner).not.toBeNull()
    expect(promptBanner?.textContent).toContain('Câu lệnh đã kết hợp:')
    expect(promptBanner?.textContent).toContain(testPrompt)

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('correctly resolves AI artwork for lessons and keywords via getStudioAIArtwork', () => {
    // Import and test getStudioAIArtwork
    const catArt = getStudioAIArtwork('cat-fat', 'bai-1-1', 'Chú Mèo Mướp')
    expect(catArt).toBe('/assets/aiki-islands/island1_lesson1_cat.jpg')

    const keywordCatArt = getStudioAIArtwork('', 'bai-3-2', 'Con mèo mướp ngủ trên ghế')
    expect(keywordCatArt).toBe('/assets/aiki-islands/island1_lesson1_cat.jpg')

    const foxArt = getStudioAIArtwork('fire-fox', 'bai-3-2', 'Sóc Bông')
    expect(foxArt).toBe('/assets/aiki-islands/island3_lesson2_opt_b.jpg')

    const comicArt = getStudioAIArtwork('', 'bai-4-5', '')
    expect(comicArt).toBe('/assets/aiki-islands/island4_lesson5_comicbook.jpg')

    const arenaArt = getStudioAIArtwork('', 'bai-5-5', '')
    expect(arenaArt).toBe('/assets/aiki-islands/island5_lesson5_arena.jpg')
  })

  it('renders studio inspect modal with balanced 2-column responsive layout', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AikiStudioWorkspace
          lessonId="bai-1-1"
          characterName="Mèo Mướp Béo"
          preloadedImages={[
            {
              id: 'test-inspect-1',
              url: '/sample-cat.jpg',
              prompt: 'Con mèo mướp béo',
              time: '14:00',
              toneBg: 'from-amber-100 to-amber-200',
              turn: 1,
              partIndex: 0,
              partTurn: 1,
            },
          ]}
        />
      )
    })

    // Click "Xem to, soi kỹ bức tranh này" (Inspect button)
    const inspectBtn = container.querySelector('button[title="Xem to, soi kỹ bức tranh này"]') as HTMLButtonElement
    expect(inspectBtn).not.toBeNull()
    act(() => {
      inspectBtn.click()
    })

    // Modal inspect xuất hiện
    const modal = document.querySelector('[data-testid="studio-inspect-modal"]')
    expect(modal).not.toBeNull()

    // Kiểm tra cấu trúc 2 cột cân đối trên PC: container mở rộng max-w-4xl / max-w-5xl
    const modalContainer = modal?.firstElementChild as HTMLElement
    expect(modalContainer.className).toContain('md:max-w-4xl')
    expect(modalContainer.className).toContain('overflow-hidden')

    // Thân modal phân chia 2 cột (md:flex-row)
    const modalBody = modalContainer.firstElementChild as HTMLElement
    expect(modalBody.className).toContain('md:flex-row')

    // Nút đóng modal
    const closeBtn = modal?.querySelector('button[title="Đóng modal"]') as HTMLButtonElement
    expect(closeBtn).not.toBeNull()
    act(() => {
      closeBtn.click()
    })

    expect(document.querySelector('[data-testid="studio-inspect-modal"]')).toBeNull()

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('displays instant live preview with pregenerated combo when prompt contains keywords before drawing', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AikiStudioWorkspace
          lessonId="bai-1-1"
          characterName="Mèo Mướp"
          initialPrompt="Chú mèo mướp lông vằn vàng dạo bước trên thảm cỏ"
        />
      )
    })

    const emptyCanvas = container.querySelector('[data-testid="studio-canvas-empty"]')
    expect(emptyCanvas).not.toBeNull()

    // Ảnh live preview xuất hiện ngay lập tức
    const previewImg = emptyCanvas?.querySelector('img[alt="Xem trước tranh"]') as HTMLImageElement
    expect(previewImg).not.toBeNull()
    expect(previewImg.src).toContain('combo__sub-meo-muop__cs-cat-long-van-vang__act-cat-dao-buoc__ctx-cat-tham-co.webp')

    // Badge "Xem trước nét vẽ ma thuật" hiển thị
    expect(emptyCanvas?.textContent).toContain('Xem trước nét vẽ ma thuật')
    expect(emptyCanvas?.textContent).toContain('Đã khớp ảnh! Bấm “Vẽ đi AIKI!” để lưu tranh')

    act(() => {
      root.unmount()
    })
    container.remove()
  })
})
