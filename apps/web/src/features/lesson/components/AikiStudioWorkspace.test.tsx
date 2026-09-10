// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { AikiStudioWorkspace } from './AikiStudioWorkspace'
import { getAikiStudioConfig } from '../data/aiki-studio-configs'
import * as creativeApi from '@/shared/lib/creative-api'

describe('AikiStudioWorkspace', () => {
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

  it('calls Google Flow Gateway via generateCreativeImage with provider gflow and updates gallery', async () => {
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

    // Kiểm tra generateCreativeImage được gọi với provider 'gflow'
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: 'Sóc Bông',
        provider: 'gflow',
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

  it('gracefully falls back to curated sampleUrl when Google Flow Gateway is unavailable or worker is busy', async () => {
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

    // Kiểm tra API vẫn được gọi với provider 'gflow'
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'gflow',
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
})
