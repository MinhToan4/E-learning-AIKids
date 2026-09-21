// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi, afterEach } from 'vitest'
import {
  Stage5CreativeEngineEditor,
  PracticePartsAndFourKeysEditor,
  DEFAULT_PRACTICE_PARTS,
  DEFAULT_FOUR_KEYS_OPTIONS,
  DEFAULT_LOCKED_FEATURES,
  DEFAULT_EXPRESSIONS,
  DEFAULT_STYLE_PRISM_OPTIONS,
  DEFAULT_PROMPT_DOCTOR_CASE,
  DEFAULT_LAYER_STACKING_OPTIONS,
  DEFAULT_CARD_FORGE_OPTIONS,
} from './index'
import type { SixStagePractice } from '../../../../shared/lib/api'

describe('Stage5CreativeEngineEditor Component — Dynamic CMS for 6 Creative Engines', () => {
  let container: HTMLDivElement | null = null

  afterEach(() => {
    if (container) {
      container.remove()
      container = null
    }
  })

  const basePractice: SixStagePractice = {
    id: 'test-practice',
    title: 'Xưởng Sáng Tạo AI',
    subjectName: 'Chú Mèo Mướp Béo',
    badge: 'Bài 1.1',
    illustrationType: 'cartoon',
    lockedFeatures: ['Tai tam giác vểnh', 'Đuôi to xù', 'Mũ len đỏ'],
    akiMotto: 'Cùng vẽ nào!',
    maxAttempts: 6,
    workflowSteps: [],
    practiceParts: DEFAULT_PRACTICE_PARTS,
    fourKeysOptions: DEFAULT_FOUR_KEYS_OPTIONS,
    creativeEngineMode: 'magic-keys',
  }

  it('renders shared Practice Parts editor for all engine modes with pipeline divider', () => {
    const html = renderToStaticMarkup(
      <Stage5CreativeEngineEditor
        practice={basePractice}
        onChange={() => {}}
        showToast={() => {}}
      />
    )

    expect(html).toContain('BỘ CHỦ THỂ CẦN MỞ KHÓA (CHÌA KHÓA 1: CÁI GÌ - WHAT)')
    expect(html).toContain('Cái cốc sứ trắng')
    expect(html).toContain('Cái xe đạp')
    expect(html).toContain('🔄 Nạp mặc định')
    expect(html).toContain('Thêm món đồ')
    expect(html).toContain('3 Chìa khóa ghép vào sau chủ thể')
  })

  it('renders Magic Keys CMS editor when mode is magic-keys or undefined', () => {
    const html = renderToStaticMarkup(
      <Stage5CreativeEngineEditor
        practice={{ ...basePractice, creativeEngineMode: 'magic-keys' }}
        onChange={() => {}}
        showToast={() => {}}
      />
    )

    expect(html).toContain('Ngân Hàng Thẻ 4 Chìa Khóa')
    expect(html).toContain('1. Cái gì?')
    expect(html).toContain('2. Trông thế nào?')
    expect(html).toContain('3. Đang làm gì?')
    expect(html).toContain('4. Ở đâu?')
    expect(html).toContain('🪄 Gợi ý thẻ 4 Chìa Khóa theo bài')
  })

  it('renders Identity Lock CMS editor when mode is identity-lock', () => {
    const html = renderToStaticMarkup(
      <Stage5CreativeEngineEditor
        practice={{
          ...basePractice,
          creativeEngineMode: 'identity-lock',
          lockedFeatures: ['Đội mũ len đỏ', 'Đuôi to xù cam'],
          expressionOptions: ['😊 Cười tít mắt vui vẻ', '😉 Nháy mắt tinh nghịch'],
        }}
        onChange={() => {}}
        showToast={() => {}}
      />
    )

    expect(html).toContain('Khóa Mật Mã ADN &amp; 6 Biểu Cảm')
    expect(html).toContain('3 Mật Mã ADN Bất Biến')
    expect(html).toContain('Đội mũ len đỏ')
    expect(html).toContain('Đuôi to xù cam')
    expect(html).toContain('Bánh Xe 6 Biểu Cảm Thần Thái')
    expect(html).toContain('😊 Cười tít mắt vui vẻ')
    expect(html).toContain('😉 Nháy mắt tinh nghịch')
    expect(html).toContain('🪄 Nạp 6 biểu cảm mẫu Hallmark')
  })

  it('allows adding ADN feature in Identity Lock editor interactively', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    const onChange = vi.fn()
    const showToast = vi.fn()

    act(() => {
      root.render(
        <Stage5CreativeEngineEditor
          practice={{
            ...basePractice,
            creativeEngineMode: 'identity-lock',
            lockedFeatures: ['Đặc điểm 1', 'Đặc điểm 2'],
          }}
          onChange={onChange}
          showToast={showToast}
        />
      )
    })

    const input = container.querySelector('input[placeholder*="VD: Đội mũ len đỏ"]') as HTMLInputElement
    expect(input).not.toBeNull()

    act(() => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set
      nativeInputValueSetter?.call(input, 'Mắt xanh biếc long lanh')
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })

    const addBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Thêm ADN')
    )
    expect(addBtn).toBeDefined()

    act(() => {
      addBtn?.click()
    })

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        lockedFeatures: ['Đặc điểm 1', 'Đặc điểm 2', 'Mắt xanh biếc long lanh'],
      })
    )

    act(() => {
      root.unmount()
    })
  })

  it('renders Style Prism CMS editor when mode is style-prism', () => {
    const html = renderToStaticMarkup(
      <Stage5CreativeEngineEditor
        practice={{
          ...basePractice,
          creativeEngineMode: 'style-prism',
          stylePrismOptions: DEFAULT_STYLE_PRISM_OPTIONS,
        }}
        onChange={() => {}}
        showToast={() => {}}
      />
    )

    expect(html).toContain('Lăng Kính Phù Thủy (Style Prism Editor)')
    expect(html).toContain('Đất nặn Claymation (Soft Clay)')
    expect(html).toContain('Màu nước Trong trẻo (Màu nước loang mềm)')
    expect(html).toContain('Tranh dân gian Đông Hồ')
    expect(html).toContain('🪄 Nạp bộ lăng kính mỹ thuật mẫu')
  })

  it('renders Prompt Doctor CMS editor when mode is prompt-doctor', () => {
    const html = renderToStaticMarkup(
      <Stage5CreativeEngineEditor
        practice={{
          ...basePractice,
          creativeEngineMode: 'prompt-doctor',
          promptDoctorCase: DEFAULT_PROMPT_DOCTOR_CASE,
        }}
        onChange={() => {}}
        showToast={() => {}}
      />
    )

    expect(html).toContain('Bác Sĩ Câu Lệnh (Prompt Doctor Clinic Editor)')
    expect(html).toContain('Hồ Sơ Bệnh Án Tranh Hỏng')
    expect(html).toContain('Bàn tay hiệp sĩ bị dị tật')
    expect(html).toContain('Ảnh tham chiếu (Ref Image URL)')
    expect(html).toContain('/assets/aiki-islands/island1_lesson4_opt_a.jpg')
    expect(html).toContain('Tủ Thuốc Thẻ Chữ Chữa Lành')
    expect(html).toContain('Kê đơn 5 ngón tay đầy đủ chuẩn xác')
    expect(html).toContain('Đội mũ len đỏ quả bông trắng')
    expect(html).toContain('🪄 Nạp ca bệnh &amp; toa thuốc mẫu')
    expect(html).toContain('🎯 Đặc trị')
    expect(html).toContain('⚠️ Bẫy')
  })

  it('renders Layer Stacking CMS editor when mode is layer-stacking', () => {
    const html = renderToStaticMarkup(
      <Stage5CreativeEngineEditor
        practice={{
          ...basePractice,
          creativeEngineMode: 'layer-stacking',
          layerStackingOptions: DEFAULT_LAYER_STACKING_OPTIONS,
        }}
        onChange={() => {}}
        showToast={() => {}}
      />
    )

    expect(html).toContain('3 Tầng Sân Khấu (Layer Stacking Editor)')
    expect(html).toContain('Tầng 1: Hậu Cảnh (Background)')
    expect(html).toContain('🪐 Bầu trời dải ngân hà vũ trụ lung linh')
    expect(html).toContain('Tầng 2: Ngôi Sao 1/3 (Hero / Subject)')
    expect(html).toContain('Tầng 3: Tiền Cảnh (Foreground)')
    expect(html).toContain('🪄 Gợi ý 3 tầng bố cục sân khấu')
  })

  it('renders Card Forge CMS editor when mode is card-forge', () => {
    const html = renderToStaticMarkup(
      <Stage5CreativeEngineEditor
        practice={{
          ...basePractice,
          creativeEngineMode: 'card-forge',
          cardForgeOptions: DEFAULT_CARD_FORGE_OPTIONS,
        }}
        onChange={() => {}}
        showToast={() => {}}
      />
    )

    expect(html).toContain('Xưởng Đúc Thẻ Bài TCG (Card Forge Editor)')
    expect(html).toContain('4 Hệ Nguyên Tố')
    expect(html).toContain('Hệ Hỏa (Lửa Đỏ)')
    expect(html).toContain('Hệ Băng (Pha Lê)')
    expect(html).toContain('Chỉ Số Sức Mạnh &amp; Kỹ Năng')
    expect(html).toContain('Khung Viền Thẻ Bài')
    expect(html).toContain('🪄 Tạo mẫu thẻ bài TCG')
  })

  it('renders Preset Prompt Chips Banks across all 6 creative engine modes', () => {
    // 1. Magic Keys Preset Chips
    const htmlMagic = renderToStaticMarkup(
      <Stage5CreativeEngineEditor
        practice={{ ...basePractice, creativeEngineMode: 'magic-keys' }}
        onChange={() => {}}
        showToast={() => {}}
      />
    )
    expect(htmlMagic).toContain('Đồng bộ Tầng 1')
    expect(htmlMagic).toContain('Cái cốc sứ trắng')

    // 2. Style Prism Preset Chips
    const htmlStyle = renderToStaticMarkup(
      <Stage5CreativeEngineEditor
        practice={{ ...basePractice, creativeEngineMode: 'style-prism' }}
        onChange={() => {}}
        showToast={() => {}}
      />
    )
    expect(htmlStyle).toContain('Ngân Hàng Phong Cách Mỹ Thuật Có Sẵn')
    expect(htmlStyle).toContain('Đất nặn Soft Clay')
    expect(htmlStyle).toContain('Màu nước loang')
    expect(htmlStyle).toContain('Chibi Manga 3D')
    expect(htmlStyle).toContain('Dân gian Đông Hồ')
    expect(htmlStyle).toContain('Xé dán Quilling')
    expect(htmlStyle).toContain('3D Pixar Cinematic')

    // 3. Prompt Doctor Preset Cases & Cures
    const htmlDoctor = renderToStaticMarkup(
      <Stage5CreativeEngineEditor
        practice={{ ...basePractice, creativeEngineMode: 'prompt-doctor' }}
        onChange={() => {}}
        showToast={() => {}}
      />
    )
    expect(htmlDoctor).toContain('Ngân Hàng Ca Bệnh Mẫu')
    expect(htmlDoctor).toContain('Bàn tay 3 ngón dị tật')
    expect(htmlDoctor).toContain('Sóc mất mũ len')
    expect(htmlDoctor).toContain('Mèo trôi nổi không ghế')
    expect(htmlDoctor).toContain('Khay Thẻ Thuốc Gợi Ý')
    expect(htmlDoctor).toContain('Vẽ chuẩn 5 ngón tay')

    // 4. Layer Stacking Preset Chips
    const htmlLayers = renderToStaticMarkup(
      <Stage5CreativeEngineEditor
        practice={{ ...basePractice, creativeEngineMode: 'layer-stacking' }}
        onChange={() => {}}
        showToast={() => {}}
      />
    )
    expect(htmlLayers).toContain('Gợi ý phông nền có sẵn')
    expect(htmlLayers).toContain('Hoàng hôn mây hồng')
    expect(htmlLayers).toContain('Gợi ý chủ thể ngôi sao 1/3 có sẵn')
    expect(htmlLayers).toContain('Chủ thể đứng chính diện 1/3')
    expect(htmlLayers).toContain('Gợi ý tiền cảnh có sẵn')
    expect(htmlLayers).toContain('Cánh hoa đào bay')

    // 5. Identity Lock ADN & Expression Preset Chips
    const htmlIdentity = renderToStaticMarkup(
      <Stage5CreativeEngineEditor
        practice={{ ...basePractice, creativeEngineMode: 'identity-lock' }}
        onChange={() => {}}
        showToast={() => {}}
      />
    )
    expect(htmlIdentity).toContain('Ngân hàng đặc điểm ADN nhận diện')
    expect(htmlIdentity).toContain('Cốc sứ trắng men bóng')
    expect(htmlIdentity).toContain('Bộ lông vằn cam trắng')
    expect(htmlIdentity).toContain('Ngân hàng biểu cảm thần thái')
    expect(htmlIdentity).toContain('Cười tít mắt vui vẻ')

    // 6. Card Forge Element/Skill & Tier Preset Chips
    const htmlCard = renderToStaticMarkup(
      <Stage5CreativeEngineEditor
        practice={{ ...basePractice, creativeEngineMode: 'card-forge' }}
        onChange={() => {}}
        showToast={() => {}}
      />
    )
    expect(htmlCard).toContain('Ngân Hàng Tuyệt Chiêu &amp; Hệ Nguyên Tố')
    expect(htmlCard).toContain('Băng Tuyết: Hơi Thở Băng Giá')
    expect(htmlCard).toContain('Lửa Thiêng: Bão Lửa Cuồng Phong')
    expect(htmlCard).toContain('Cấp bậc mẫu:')
    expect(htmlCard).toContain('Tập Sự: 800/500')
    expect(htmlCard).toContain('Huyền Thoại: 1500/1200')
  })

  it('supports alias PracticePartsAndFourKeysEditor for backward compatibility', () => {
    expect(PracticePartsAndFourKeysEditor).toBe(Stage5CreativeEngineEditor)
  })

  it('adapts Practice Parts header, badge, default parts and pipeline label for all 6 creative engines', () => {
    // 1. prompt-doctor
    const htmlDoctor = renderToStaticMarkup(
      <Stage5CreativeEngineEditor
        practice={{ ...basePractice, creativeEngineMode: 'prompt-doctor', practiceParts: [] }}
        onChange={() => {}}
        showToast={() => {}}
      />
    )
    expect(htmlDoctor).toContain('🩺 NGÂN HÀNG CA BỆNH TRANH HỎNG')
    expect(htmlDoctor).toContain('4 Ca bệnh')
    expect(htmlDoctor).toContain('Ca 1: Hiệp Sĩ Bạc')
    expect(htmlDoctor).toContain('Ca 2: Sóc Bông')
    expect(htmlDoctor).toContain('Ca 3: Mèo Mướp')
    expect(htmlDoctor).toContain('Ca 4: Tranh Lem Nhem')
    expect(htmlDoctor).not.toContain('Cái cốc sứ trắng')
    expect(htmlDoctor).toContain('Toa thuốc thẻ chữ ghép vào chữa lành')

    // 2. layer-stacking
    const htmlLayers = renderToStaticMarkup(
      <Stage5CreativeEngineEditor
        practice={{ ...basePractice, creativeEngineMode: 'layer-stacking', practiceParts: [] }}
        onChange={() => {}}
        showToast={() => {}}
      />
    )
    expect(htmlLayers).toContain('🌟 NGÂN HÀNG NGÔI SAO CHÍNH 1/3')
    expect(htmlLayers).toContain('4 Ngôi sao 1/3')
    expect(htmlLayers).toContain('Hiệp Sĩ Cáo Lửa (Điểm vàng 1/3)')
    expect(htmlLayers).toContain('Sóc Bông Hạt Dẻ (Điểm vàng 1/3)')
    expect(htmlLayers).toContain('Thuyền Buồm Vàng (Điểm vàng 1/3)')
    expect(htmlLayers).toContain('Mèo Phi Hành Gia (Điểm vàng 1/3)')
    expect(htmlLayers).toContain('Bố cục 3 tầng bọc quanh Ngôi Sao')

    // 3. card-forge
    const htmlCard = renderToStaticMarkup(
      <Stage5CreativeEngineEditor
        practice={{ ...basePractice, creativeEngineMode: 'card-forge', practiceParts: [] }}
        onChange={() => {}}
        showToast={() => {}}
      />
    )
    expect(htmlCard).toContain('⚔️ NGÂN HÀNG CHIẾN TƯỚNG THẺ BÀI')
    expect(htmlCard).toContain('4 Chiến tướng')
    expect(htmlCard).toContain('Rồng Băng Bão Tuyết')
    expect(htmlCard).toContain('Hiệp Sĩ Cáo Lửa')
    expect(htmlCard).toContain('Đại Bàng Lôi Thần')
    expect(htmlCard).toContain('Rùa Thần Cổ Đại Gai Mộc')
    expect(htmlCard).not.toContain('Cốc Sứ Trắng')
    expect(htmlCard).toContain('Thuộc tính TCG ghép vào đúc thẻ')

    // 4. identity-lock
    const htmlIdentity = renderToStaticMarkup(
      <Stage5CreativeEngineEditor
        practice={{ ...basePractice, creativeEngineMode: 'identity-lock', practiceParts: [] }}
        onChange={() => {}}
        showToast={() => {}}
      />
    )
    expect(htmlIdentity).toContain('🧬 NGÂN HÀNG DANH TÍNH NHÂN VẬT &amp; BIỂU CẢM')
    expect(htmlIdentity).toContain('4 Nhân vật &amp; Biểu cảm')
    expect(htmlIdentity).toContain('Chú Sóc Bông Hạt Dẻ')
    expect(htmlIdentity).toContain('Cáo Lửa Zico Hiệp Sĩ')
    expect(htmlIdentity).toContain('Mật mã ADN bất biến ghép nối')

    // 5. style-prism
    const htmlStyle = renderToStaticMarkup(
      <Stage5CreativeEngineEditor
        practice={{ ...basePractice, creativeEngineMode: 'style-prism', practiceParts: [] }}
        onChange={() => {}}
        showToast={() => {}}
      />
    )
    expect(htmlStyle).toContain('🔮 NGÂN HÀNG CHỦ THỂ NGHỆ THUẬT')
    expect(htmlStyle).toContain('4 Chủ thể nghệ thuật')
    expect(htmlStyle).toContain('Chú Trâu Đất Nặn')
    expect(htmlStyle).toContain('Chú Mèo Béo Múp')
    expect(htmlStyle).toContain('Lăng kính phong cách khoác lên chủ thể')

    // 6. magic-keys
    const htmlMagic = renderToStaticMarkup(
      <Stage5CreativeEngineEditor
        practice={{ ...basePractice, creativeEngineMode: 'magic-keys', practiceParts: [] }}
        onChange={() => {}}
        showToast={() => {}}
      />
    )
    expect(htmlMagic).toContain('🔑 BỘ CHỦ THỂ CẦN MỞ KHÓA (CHÌA KHÓA 1: CÁI GÌ - WHAT)')
    expect(htmlMagic).toContain('4 Món đồ')
    expect(htmlMagic).toContain('Cái cốc sứ trắng')
    expect(htmlMagic).toContain('3 Chìa khóa ghép vào sau chủ thể')
  })

  it('clicking Nạp mặc định properly resets practiceParts to mode-specific defaults', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    const onChangeDoctor = vi.fn()
    const showToastDoctor = vi.fn()

    // Test prompt-doctor load default
    act(() => {
      root.render(
        <Stage5CreativeEngineEditor
          practice={{
            ...basePractice,
            creativeEngineMode: 'prompt-doctor',
            practiceParts: [{ partNumber: 1, title: 'Đồ cũ', icon: '❓', emoji: '❓' }],
          }}
          onChange={onChangeDoctor}
          showToast={showToastDoctor}
        />
      )
    })

    const resetBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Nạp mặc định')
    )
    expect(resetBtn).toBeDefined()

    act(() => {
      resetBtn?.click()
    })

    expect(onChangeDoctor).toHaveBeenCalledWith(
      expect.objectContaining({
        practiceParts: expect.arrayContaining([
          expect.objectContaining({ title: expect.stringContaining('Hiệp Sĩ Bạc') }),
          expect.objectContaining({ title: expect.stringContaining('Sóc Bông') }),
          expect.objectContaining({ title: expect.stringContaining('Mèo Mướp') }),
          expect.objectContaining({ title: expect.stringContaining('Tranh Lem Nhem') }),
        ]),
      })
    )

    act(() => {
      root.unmount()
    })
  })

  it('resets practiceParts to all 4 standard identity characters when clicking Nạp mặc định in identity-lock mode', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    const onChangeIdentity = vi.fn()
    const showToastIdentity = vi.fn()

    act(() => {
      root.render(
        <Stage5CreativeEngineEditor
          practice={{
            ...basePractice,
            creativeEngineMode: 'identity-lock',
            practiceParts: [{ partNumber: 1, title: 'Đồ cũ', icon: '❓', emoji: '❓' }],
          }}
          onChange={onChangeIdentity}
          showToast={showToastIdentity}
        />
      )
    })

    const resetBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Nạp mặc định')
    )
    expect(resetBtn).toBeDefined()

    act(() => {
      resetBtn?.click()
    })

    expect(onChangeIdentity).toHaveBeenCalledWith(
      expect.objectContaining({
        practiceParts: [
          expect.objectContaining({ title: 'Chú Sóc Bông Hạt Dẻ', icon: '🐿️' }),
          expect.objectContaining({ title: 'Cáo Lửa Zico Hiệp Sĩ', icon: '🦊' }),
          expect.objectContaining({ title: 'Chú Bé Robot Leo', icon: '🤖' }),
          expect.objectContaining({ title: 'Mèo Thám Tử Mimi', icon: '🐱' }),
        ],
      })
    )

    act(() => {
      root.unmount()
    })
  })

  it('renders CreativeNotebookEditor when creativeEngineMode is creative-notebook', () => {
    const html = renderToStaticMarkup(
      <Stage5CreativeEngineEditor
        practice={{
          ...basePractice,
          creativeEngineMode: 'creative-notebook',
          notebookConfig: {
            notebookTitle: 'Sổ Tay Thử Nghiệm',
            akiAdvice: 'Lời khuyên từ AIKI',
            challengeSummary: ['Bước 1', 'Bước 2'],
            fields: [{ id: 'f-1', label: 'Tiêu đề kịch bản', rows: 2 }],
          },
        }}
        onChange={() => {}}
        showToast={() => {}}
      />
    )

    expect(html).toContain('data-testid="creative-notebook-editor"')
    expect(html).toContain('CẤU HÌNH SỔ TAY SÁNG TẠO BA LÔ')
    expect(html).toContain('value="Sổ Tay Thử Nghiệm"')
    expect(html).toContain('Tiêu đề kịch bản')
    expect(html).toContain('Lời khuyên từ AIKI')
  })
})
