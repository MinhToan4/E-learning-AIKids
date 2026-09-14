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
import { AikiStudioWorkspace, getStudioAIArtwork, renderObjectClayIcon, type StudioImageItem } from './AikiStudioWorkspace'
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
        lessonTitle="Bắt AKI vẽ Sóc Bông bằng mật mã của các cậu"
        lessonBadge="Bài 3.2"
        characterName="Sóc Bông"
        maxAttempts={6}
        studentStars={42}
      />
    )

    // 1. Kiểm tra Top Bar & Khởi tạo phiên tươi mới (đầy đủ 6/6 lượt, không mock dở dang)
    expect(html).toContain('data-testid="aiki-studio-workspace"')
    expect(html).toContain('XƯỞNG SÁNG TẠO')
    expect(html).toContain('Bắt AKI vẽ Sóc Bông bằng mật mã của các cậu')
    expect(html).toContain('Còn')
    expect(html).toContain('6')
    expect(html).toContain('6 lượt của bài này')
    expect(html).toContain('42')
    expect(html).toContain('← Bài 3.2')
    expect(html).toContain('data-testid="studio-fullscreen-btn"')

    // 2. Kiểm tra Cột 1: ĐÃ DỌN SẠCH (Chỉ có 2 card: Tiến Trình 4 Bước & Mẹo Vàng AKI)
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
    expect(html).toContain('Mẹo Vàng Của AKI')
    expect(html).toContain('↺ Tua lại video / Xem lại bài')

    // 3. Kiểm tra Cột 2: Studio Canvas Chat & Live Studio Coach
    expect(html).toContain('data-testid="studio-col-canvas"')
    expect(html).toContain('AKI · Xưởng Bài 3.2')
    expect(html).toContain('Hôm nay chỉ vẽ Sóc Bông')
    // Tin nhắn chào đón duy nhất từ AKI giải thích nhiệm vụ Bước 1
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
    expect(html).toContain('Mẹo Vàng Của AKI')
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
          lessonTitle="Bắt AKI vẽ Sóc Bông bằng mật mã của các cậu"
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
        prompt: 'Sóc Bông',
        aspectRatio: '1:1',
      })
    )

    // Kiểm tra tin nhắn chờ của AKI xuất hiện trong chat
    expect(container.textContent).toContain('🐱 AKI đang kết nối Gateway và tạo tranh bằng Google Flow cho bé... Chờ tớ một chút nhé! ✨')

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
        prompt: 'Sóc Bông',
        aspectRatio: '1:1',
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
        lessonTitle="Bắt AKI vẽ Sóc Bông"
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
    expect(modal?.textContent).toContain('Khám Phá Toàn Bộ Balo Tại /backpack →')

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
        characterName="Cốc Sứ Trắng"
        maxAttempts={8}
      />
    )

    // 1. Kiểm tra 4 Món đồ mặc định theo bài 1.2
    expect(html).toContain('Cái cốc sứ trắng')
    expect(html).toContain('Cái xe đạp')
    expect(html).toContain('Cuốn sổ tay mở')
    expect(html).toContain('Cái đồng hồ cổ')

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

  it('synchronizes step1QuickPrompt when switching practice items (e.g. from cup to clock)', async () => {
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
        />
      )
    })

    // Ban đầu chọn Part 1: Cái cốc sứ trắng -> prompt gợi ý là "Cái cốc"
    const quickPromptBtnInitial = container.querySelector('[data-testid="studio-step-quick-btn"]')
    expect(quickPromptBtnInitial?.textContent).toContain('Cái cốc')

    // Click chuyển sang Part 4: Cái đồng hồ cổ
    const part4Btn = container.querySelector('[data-testid="practice-item-select-4"]') as HTMLButtonElement
    expect(part4Btn).not.toBeNull()

    await act(async () => {
      part4Btn.click()
    })

    // Sau khi chuyển, prompt gợi ý cập nhật theo Món 4 (Cái đồng)
    const quickPromptBtnAfter = container.querySelector('[data-testid="studio-step-quick-btn"]')
    expect(quickPromptBtnAfter?.textContent).toContain('Cái đồng')
    expect(quickPromptBtnAfter?.textContent).not.toContain('Cốc Sứ')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('switches sample artwork and banner dynamically across 4 soft clay items in Lesson 1.2', async () => {
    // 1. Kiểm tra unit hàm getStudioAIArtwork
    expect(getStudioAIArtwork('teacup', 'bai-1-2', 'Cái cốc sứ trắng')).toBe('/assets/aiki-islands/island1_lesson2_teacup.jpg')
    expect(getStudioAIArtwork(undefined, 'bai-1-2', 'Cái xe đạp')).toBe('/assets/aiki-islands/island1_lesson2_bicycle.jpg')
    expect(getStudioAIArtwork(undefined, 'bai-1-2', 'Cuốn sổ tay mở')).toBe('/assets/aiki-islands/island1_lesson2_notebook.jpg')
    expect(getStudioAIArtwork(undefined, 'bai-1-2', 'Cái đồng hồ cổ')).toBe('/assets/aiki-islands/island1_lesson2_clock.jpg')

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
          characterName="Cốc Sứ Trắng"
          maxAttempts={8}
        />
      )
    })

    const emptyCanvas = container.querySelector('[data-testid="studio-canvas-empty"]')
    expect(emptyCanvas).not.toBeNull()

    // Ban đầu: Món 1 (Cốc sứ)
    const emptyImg = emptyCanvas?.querySelector('img') as HTMLImageElement
    expect(emptyImg.src).toContain('island1_lesson2_teacup.jpg')
    expect(emptyCanvas?.textContent).toContain('Món 1: Cái cốc sứ trắng')

    // Chuyển sang Món 2 (Xe đạp)
    const part2Btn = container.querySelector('[data-testid="practice-item-select-2"]') as HTMLButtonElement
    await act(async () => {
      part2Btn.click()
    })
    expect(emptyImg.src).toContain('island1_lesson2_bicycle.jpg')
    expect(emptyCanvas?.textContent).toContain('Món 2: Cái xe đạp')

    // Chuyển sang Món 3 (Sổ tay)
    const part3Btn = container.querySelector('[data-testid="practice-item-select-3"]') as HTMLButtonElement
    await act(async () => {
      part3Btn.click()
    })
    expect(emptyImg.src).toContain('island1_lesson2_notebook.jpg')
    expect(emptyCanvas?.textContent).toContain('Món 3: Cuốn sổ tay mở')

    // Chuyển sang Món 4 (Đồng hồ)
    const part4Btn = container.querySelector('[data-testid="practice-item-select-4"]') as HTMLButtonElement
    await act(async () => {
      part4Btn.click()
    })
    expect(emptyImg.src).toContain('island1_lesson2_clock.jpg')
    expect(emptyCanvas?.textContent).toContain('Món 4: Cái đồng hồ cổ')

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
          characterName="Cốc Sứ Trắng"
          maxAttempts={8}
        />
      )
    })

    const part1Card = container.querySelector('[data-testid="practice-item-select-1"]')
    const part2Card = container.querySelector('[data-testid="practice-item-select-2"]')

    expect(part1Card).not.toBeNull()
    expect(part1Card?.textContent).toContain('THỰC HÀNH 01 · ĐANG LÀM')
    expect(part1Card?.textContent).toContain('Cái cốc sứ trắng')
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
        prompt: 'Cái cốc sứ trắng tinh',
        time: '08:30',
        toneBg: 'bg-amber-100',
        url: '/assets/aiki-islands/island1_lesson2_teacup.jpg',
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
          preloadedImages={preloadedMock}
        />
      )
    })

    // Part 1 (Cốc sứ): Canvas có ảnh của Part 1
    const activeCanvasImg = container.querySelector('[data-testid="studio-col-canvas"] img') as HTMLImageElement
    expect(activeCanvasImg).not.toBeNull()
    expect(activeCanvasImg.src).toContain('island1_lesson2_teacup.jpg')

    // Chuyển sang Part 3 (Cuốn sổ tay mở) - phần này chưa vẽ
    const part3Btn = container.querySelector('[data-testid="practice-item-select-3"]') as HTMLButtonElement
    await act(async () => {
      part3Btn.click()
    })

    // Khung canvas phải ở trạng thái empty chờ vẽ Part 3, TUYỆT ĐỐI không hiển thị ảnh Part 1 (Cái cốc)
    const emptyCanvas = container.querySelector('[data-testid="studio-canvas-empty"]')
    expect(emptyCanvas).not.toBeNull()
    expect(emptyCanvas?.textContent).toContain('Món 3: Cuốn sổ tay mở')

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

    // 2. Khung ảnh to đang hiển thị ảnh Lượt 1
    const liveCanvas = container.querySelector('[data-testid="studio-live-canvas-display"]')
    expect(liveCanvas).not.toBeNull()
    expect(liveCanvas?.textContent).toContain('Lượt 1')

    // 3. Click chuyển sang Tab Lượt 2
    const buttons = container.querySelectorAll('button')
    const turn2Btn = Array.from(buttons).find((b) => b.textContent?.includes('Lượt 2: Hoàn thiện ★'))
    expect(turn2Btn).toBeDefined()

    await act(async () => {
      turn2Btn?.click()
    })

    // 4. Vì chưa vẽ lượt 2, canvas to chuyển sang studio-canvas-empty
    const emptyCanvas = container.querySelector('[data-testid="studio-canvas-empty"]')
    expect(emptyCanvas).not.toBeNull()
    expect(emptyCanvas?.textContent).toContain('Khung Tranh Của Bé Đang Chờ!')

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

    const modal = container.querySelector('[data-testid="studio-submit-modal"]')
    expect(modal).not.toBeNull()
    expect(modal?.textContent).toContain('Chọn Kiệt Tác Của Bé Để Nhận Cúp Vàng!')
    expect(modal?.textContent).toContain('Bé hãy chạm vào bức tranh bé tự hào nhất')
    expect(modal?.textContent).toContain('⭐ KIỆT TÁC CHỌN NỘP')

    // 3. Bấm xác nhận nộp bài
    const confirmBtn = container.querySelector('[data-testid="studio-confirm-submit"]') as HTMLButtonElement
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
          maxAttempts={8}
          preloadedImages={mockImages}
        />
      )
    })

    // Initially Turn 1 is selected; since it is already drawn, the draw button is disabled with message
    const drawBtn = container.querySelector('[data-testid="studio-draw-btn"]') as HTMLButtonElement
    expect(drawBtn).not.toBeNull()
    expect(drawBtn.disabled).toBe(true)
    expect(drawBtn.textContent).toContain('🔒 Lượt 1 đã vẽ xong · Chuyển sang Lượt 2 nhé!')

    // Switch to Turn 2
    const buttons = container.querySelectorAll('button')
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

    const confirmBtn = container.querySelector('[data-testid="studio-confirm-submit"]') as HTMLButtonElement
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
})

