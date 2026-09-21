// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { CreativeNotebookEngine } from './engines/CreativeNotebookEngine'
import type { CreativeNotebookConfig } from './types'

const MOCK_CONFIG: CreativeNotebookConfig = {
  notebookTitle: 'Hồ sơ nhân vật của tớ',
  akiAdvice: 'Hãy viết bằng chính suy nghĩ của cậu!',
  sampleHelperTitle: 'Hồ sơ mẫu: Chú Sóc Bông',
  sampleTemplate: 'Tên: Sóc Bông\nTrông như: Mũ len đỏ quả bông trắng, đuôi to xù cam.',
  challengeSummary: ['Tạo tên và ngoại hình cho nhân vật', 'Xác định tính cách cụ thể'],
  checklist: [
    { id: 'cl-1', label: 'Tạo một nhân vật bất kỳ có tính cách' },
    { id: 'cl-2', label: 'Điền đủ các ô và không bỏ trống ô quan trọng' },
  ],
  fields: [
    {
      id: 'name',
      label: '1. Tên nhân vật',
      prefix: 'Tên: ',
      placeholder: 'Gõ tên nhân vật...',
      rows: 1,
    },
    {
      id: 'appearance',
      label: '2. Ngoại hình nổi bật',
      prefix: 'Trông như: ',
      placeholder: 'Tả 3 nét nhận diện...',
      badge: 'Quan trọng',
      rows: 1,
    },
  ],
}

const MOCK_4_STAGE_CONFIG: CreativeNotebookConfig = {
  notebookTitle: 'Bốn chặng của câu chuyện tớ',
  akiAdvice: 'MUỐN - CẢN - LÀM - KẾT',
  sampleHelperTitle: 'Kịch bản mẫu: Bốn chặng',
  sampleTemplate:
    'Muốn: bạn ấy muốn hái hoa tuyết\nCản: nhưng dòng suối rất lạnh\nLàm: bạn ấy thử làm ván trượt\nKết: cuối cùng đã thành công',
  challengeSummary: [
    'Mở Hồ sơ nhân vật và viết bốn dòng: MUỐN – CẢN – LÀM – KẾT',
    'Chưa nghĩ được CẢN thì nhìn vào ô SỢ hoặc ô DỞ',
  ],
  fields: [
    {
      id: 'stage-want',
      label: '1. Muốn (Mong muốn của nhân vật)',
      prefix: 'Muốn: bạn ấy muốn ',
      placeholder: 'đạt được điều gì hoặc đi tới đâu...',
      rows: 1,
    },
    {
      id: 'stage-obstacle',
      label: '2. Cản (Trở ngại cản bước)',
      prefix: 'Cản: nhưng ',
      placeholder: 'gặp phải khó khăn gì...',
      badge: 'Thử thách',
      rows: 1,
    },
    {
      id: 'stage-action',
      label: '3. Làm (Hành động vượt qua)',
      prefix: 'Làm: bạn ấy thử ',
      placeholder: 'thử dùng cách gì...',
      rows: 1,
    },
    {
      id: 'stage-resolution',
      label: '4. Kết (Kết cục câu chuyện)',
      prefix: 'Kết: cuối cùng ',
      placeholder: 'kết quả ra sao...',
      rows: 1,
    },
  ],
}

describe('CreativeNotebookEngine - 3-Card Soft Clay Layout', () => {
  it('renders static markup with 3 blocks: Challenge Summary, Instructions, and Student Writing Box', () => {
    const html = renderToStaticMarkup(
      <CreativeNotebookEngine
        onPromptChange={vi.fn()}
        notebookConfig={MOCK_CONFIG}
      />
    )

    // Khối 1: Tóm tắt thử thách
    expect(html).toContain('data-testid="challenge-summary-card"')
    expect(html).toContain('TÓM TẮT THỬ THÁCH')
    expect(html).toContain('AIKI vừa dặn đấy!')
    expect(html).toContain('Tạo tên và ngoại hình cho nhân vật')

    // Khối 2: Profile Card (Hồ sơ mẫu của AIKI)
    expect(html).toContain('data-testid="instructions-card"')
    expect(html).toContain('HỒ SƠ MẪU CỦA AIKI')
    expect(html).toContain('Mẫu tham khảo')
    expect(html).toContain('data-testid="btn-use-sample-quick"')
    expect(html).toContain('📋 Dùng mẫu này')
    expect(html).toContain('data-testid="instruction-card-name"')
    expect(html).toContain('data-testid="instruction-card-appearance"')
    expect(html).toContain('Sóc Bông')
    expect(html).toContain('Mũ len đỏ quả bông trắng')

    // Khối 3: Ô viết của con
    expect(html).toContain('data-testid="student-writing-card"')
    expect(html).toContain('Ô VIẾT CỦA CON')
    expect(html).toContain('“Hồ sơ nhân vật của tớ”')
    expect(html).toContain('data-testid="field-prefix-name"')
    expect(html).toContain('Tên:')
    expect(html).toContain('data-testid="field-prefix-appearance"')
    expect(html).toContain('Trông như:')
    expect(html).toContain('data-testid="notebook-field-name"')
    expect(html).toContain('data-testid="notebook-field-appearance"')

    // Footer
    expect(html).toContain('data-testid="btn-view-sample"')
    expect(html).toContain('data-testid="writing-progress-indicator"')
    expect(html).toContain('Đã viết 0 / 2 ô')
    expect(html).toContain('data-testid="btn-submit-notebook"')
  })

  it('interactively updates field values and tracks writing progress', async () => {
    const onPromptChange = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <CreativeNotebookEngine
          onPromptChange={onPromptChange}
          notebookConfig={MOCK_CONFIG}
        />
      )
    })

    const nameInput = container.querySelector(
      '[data-testid="notebook-field-name"]'
    ) as HTMLInputElement
    const appearanceInput = container.querySelector(
      '[data-testid="notebook-field-appearance"]'
    ) as HTMLInputElement
    const progressEl = container.querySelector(
      '[data-testid="writing-progress-indicator"]'
    )

    expect(nameInput).toBeTruthy()
    expect(appearanceInput).toBeTruthy()
    expect(progressEl?.textContent).toContain('0 / 2 ô')

    // Type into first field
    await act(async () => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set
      nativeInputValueSetter?.call(nameInput, 'Sóc Bông Quả Cảm')
      nameInput.dispatchEvent(new Event('input', { bubbles: true }))
      nameInput.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(onPromptChange).toHaveBeenCalled()
    expect(progressEl?.textContent).toContain('1 / 2 ô')

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('opens sample modal and applies template to populate all fields', async () => {
    const onPromptChange = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <CreativeNotebookEngine
          onPromptChange={onPromptChange}
          notebookConfig={MOCK_CONFIG}
        />
      )
    })

    const btnViewSample = container.querySelector(
      '[data-testid="btn-view-sample"]'
    ) as HTMLButtonElement
    expect(btnViewSample).toBeTruthy()

    // Mở modal
    await act(async () => {
      btnViewSample.click()
    })

    const modal = container.querySelector('[data-testid="sample-template-modal"]')
    expect(modal).toBeTruthy()
    expect(modal?.textContent).toContain('Hồ sơ mẫu: Chú Sóc Bông')
    expect(modal?.textContent).toContain('Mũ len đỏ quả bông trắng')

    // Bấm áp dụng mẫu vào bài
    const btnApply = container.querySelector(
      '[data-testid="modal-use-sample-btn"]'
    ) as HTMLButtonElement
    expect(btnApply).toBeTruthy()

    await act(async () => {
      btnApply.click()
    })

    // Modal đóng lại
    expect(container.querySelector('[data-testid="sample-template-modal"]')).toBeNull()

    // Tiến độ được cập nhật thành 2/2 ô
    const progressEl = container.querySelector(
      '[data-testid="writing-progress-indicator"]'
    )
    expect(progressEl?.textContent).toContain('2 / 2 ô')

    // Prompt change được kích hoạt
    expect(onPromptChange).toHaveBeenCalled()

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('calls onSaveDraft and displays draft saved indicator when clicked', async () => {
    const onSaveDraft = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <CreativeNotebookEngine
          onPromptChange={vi.fn()}
          notebookConfig={MOCK_CONFIG}
          onSaveDraft={onSaveDraft}
        />
      )
    })

    const btnSave = container.querySelector(
      '[data-testid="btn-save-draft"]'
    ) as HTMLButtonElement
    expect(btnSave).toBeTruthy()

    await act(async () => {
      btnSave.click()
    })

    expect(onSaveDraft).toHaveBeenCalledTimes(1)
    expect(
      container.querySelector('[data-testid="draft-saved-indicator"]')
    ).toBeTruthy()
    expect(container.textContent).toContain('Đã lưu lúc')

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('calls onSubmitNotebook and triggers star burst celebration effect', async () => {
    const onSubmitNotebook = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <CreativeNotebookEngine
          onPromptChange={vi.fn()}
          notebookConfig={MOCK_CONFIG}
          onSubmitNotebook={onSubmitNotebook}
        />
      )
    })

    const btnSubmit = container.querySelector(
      '[data-testid="btn-submit-notebook"]'
    ) as HTMLButtonElement
    expect(btnSubmit).toBeTruthy()

    await act(async () => {
      btnSubmit.click()
    })

    expect(onSubmitNotebook).toHaveBeenCalledTimes(1)
    expect(
      container.querySelector('[data-testid="celebrate-stars-burst"]')
    ).toBeTruthy()

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('renders 4-stage story structure with proper stage badges, short titles, and no duplicated subtexts', () => {
    const html = renderToStaticMarkup(
      <CreativeNotebookEngine
        onPromptChange={vi.fn()}
        notebookConfig={MOCK_4_STAGE_CONFIG}
      />
    )

    // Nhận diện bài 4 chặng
    expect(html).toContain('Chặng 1')
    expect(html).toContain('Chặng 2')
    expect(html).toContain('Chặng 3')
    expect(html).toContain('Chặng 4')

    // Tiêu đề ngắn viết hoa
    expect(html).toContain('MUỐN')
    expect(html).toContain('CẢN')
    expect(html).toContain('LÀM')
    expect(html).toContain('KẾT')

    // Icon ngôi sao cho ô quan trọng / thử thách
    expect(html).toContain('data-testid="field-star-stage-obstacle"')

    // Không còn render subtext bị trùng lặp ở Khối 2
    expect(html).not.toContain('Bạn ấy muốn ......')
    expect(html).not.toContain('Nhưng ......')
    expect(html).not.toContain('Bạn ấy thử ......')
    expect(html).not.toContain('Cuối cùng ......')

    // Bộ đếm theo đơn vị "chặng"
    expect(html).toContain('Đã viết 0 / 4 chặng')
  })

  it('renders Profile Card items with interactive styling, badges, and sample values', () => {
    const MOCK_7_FIELD_CONFIG: CreativeNotebookConfig = {
      notebookTitle: 'Hồ sơ nhân vật của tớ',
      akiAdvice: 'Hãy viết bằng chính suy nghĩ của con!',
      sampleHelperTitle: 'Hồ sơ mẫu: Chú Sóc Bông',
      sampleTemplate: 'Tên: Sóc Bông',
      challengeSummary: ['Tạo hồ sơ nhân vật gồm 7 ô'],
      fields: [
        { id: 'f1', label: '1. Tên', prefix: 'Tên: ' },
        { id: 'f2', label: '2. Ngoại hình', prefix: 'Ngoại hình: ' },
        { id: 'f3', label: '3. Điểm mạnh', prefix: 'Điểm mạnh: ' },
        { id: 'f4', label: '4. Điểm yếu', prefix: 'Điểm yếu: ' },
        { id: 'f5', label: '5. Thói quen', prefix: 'Thói quen: ' },
        { id: 'f6', label: '6. Ước mơ', prefix: 'Ước mơ: ' },
        {
          id: 'char-family-feedback',
          label: '7. Người nhà tớ tả bạn ấy là',
          prefix: 'Người nhà tớ tả bạn ấy là: ',
          colSpan: 2,
          spanFull: true,
        },
      ],
    }

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(
        <CreativeNotebookEngine
          onPromptChange={vi.fn()}
          notebookConfig={MOCK_7_FIELD_CONFIG}
        />
      )
    })

    const card1 = container.querySelector('[data-testid="instruction-card-f1"]') as HTMLElement
    const card7 = container.querySelector('[data-testid="instruction-card-char-family-feedback"]') as HTMLElement

    expect(card1).toBeTruthy()
    expect(card7).toBeTruthy()

    // Profile Card item interactive styling
    expect(card1.className).toContain('cursor-pointer')
    expect(card1.className).toContain('hover:bg-slate-50/90')
    expect(card1.className).toContain('active:scale-[0.99]')
    expect(card1.textContent).toContain('Ô 1')
    expect(card1.textContent).toContain('Tên:')
    expect(card1.textContent).toContain('Sóc Bông')

    expect(card7.className).toContain('cursor-pointer')
    expect(card7.textContent).toContain('Ô 7')

    // Không có thẻ p subtext bên trong instruction card
    const card1Subtext = card1.querySelector('p')
    const card7Subtext = card7.querySelector('p')
    expect(card1Subtext).toBeNull()
    expect(card7Subtext).toBeNull()

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('renders close button in sample modal and closes when clicked', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <CreativeNotebookEngine
          onPromptChange={vi.fn()}
          notebookConfig={MOCK_CONFIG}
        />
      )
    })

    const btnViewSample = container.querySelector(
      '[data-testid="btn-view-sample"]'
    ) as HTMLButtonElement

    await act(async () => {
      btnViewSample.click()
    })

    expect(container.querySelector('[data-testid="sample-template-modal"]')).toBeTruthy()

    const closeBtn = container.querySelector(
      '[data-testid="modal-close-btn"]'
    ) as HTMLButtonElement

    await act(async () => {
      closeBtn.click()
    })

    expect(container.querySelector('[data-testid="sample-template-modal"]')).toBeNull()

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('renders 2-column split-screen responsive layout for PC & tablet (md:col-span-5 and md:col-span-7)', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    act(() => {
      root.render(
        <CreativeNotebookEngine
          onPromptChange={vi.fn()}
          notebookConfig={MOCK_CONFIG}
        />
      )
    })

    const mainEngine = container.querySelector('[data-testid="creative-notebook-engine"]') as HTMLElement
    expect(mainEngine).toBeTruthy()
    expect(mainEngine.className).toContain('md:grid')
    expect(mainEngine.className).toContain('md:grid-cols-12')

    const challengeCard = container.querySelector('[data-testid="challenge-summary-card"]') as HTMLElement
    const leftCol = challengeCard.parentElement as HTMLElement
    expect(leftCol.className).toContain('md:col-span-5')

    const studentCard = container.querySelector('[data-testid="student-writing-card"]') as HTMLElement
    const rightCol = studentCard.parentElement as HTMLElement
    expect(rightCol.className).toContain('md:col-span-7')
    expect(rightCol.className).not.toContain('sticky')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('clicks quick sample button (btn-use-sample-quick) to populate all inputs from sample template', async () => {
    const onPromptChange = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <CreativeNotebookEngine
          onPromptChange={onPromptChange}
          notebookConfig={MOCK_CONFIG}
        />
      )
    })

    const btnQuick = container.querySelector(
      '[data-testid="btn-use-sample-quick"]'
    ) as HTMLButtonElement
    expect(btnQuick).toBeTruthy()
    expect(btnQuick.textContent).toContain('Dùng mẫu này')

    await act(async () => {
      btnQuick.click()
    })

    const nameInput = container.querySelector(
      '[data-testid="notebook-field-name"]'
    ) as HTMLInputElement
    const appearanceInput = container.querySelector(
      '[data-testid="notebook-field-appearance"]'
    ) as HTMLInputElement

    expect(nameInput.value).toBe('Sóc Bông')
    expect(appearanceInput.value).toBe('Mũ len đỏ quả bông trắng, đuôi to xù cam.')

    const progressEl = container.querySelector(
      '[data-testid="writing-progress-indicator"]'
    )
    expect(progressEl?.textContent).toContain('2 / 2 ô')
    expect(onPromptChange).toHaveBeenCalled()

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('clicking a sample profile card row focuses the corresponding input on the right column', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <CreativeNotebookEngine
          onPromptChange={vi.fn()}
          notebookConfig={MOCK_CONFIG}
        />
      )
    })

    const appearanceCard = container.querySelector(
      '[data-testid="instruction-card-appearance"]'
    ) as HTMLElement
    const appearanceInput = container.querySelector(
      '[data-testid="notebook-field-appearance"]'
    ) as HTMLInputElement

    expect(appearanceCard).toBeTruthy()
    expect(appearanceInput).toBeTruthy()

    const focusSpy = vi.spyOn(appearanceInput, 'focus')

    await act(async () => {
      appearanceCard.click()
    })

    expect(focusSpy).toHaveBeenCalled()

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('renders Lesson 3.1 7-field character profile card correctly with all squirrel sample values', () => {
    const MOCK_LESSON_3_1_CONFIG: CreativeNotebookConfig = {
      notebookTitle: 'Hồ sơ nhân vật của tớ',
      akiAdvice: 'Hãy tạo một nhân vật bất kỳ: người, con vật, đồ vật...',
      sampleHelperTitle: 'Cách làm kịch bản mẫu: Hồ sơ 7 dòng',
      sampleTemplate:
        'Tên: Sóc Bông Quả Cảm\nThích: Hạt dẻ nướng thơm lừng và trèo cành sồi cao vút\nSợ: Tiếng máy sấy tóc và tiếng sấm sét đùng đoàng\nGiỏi: Bật nhảy thoăn thoắt qua các cành cây\nDở: Cực kỳ hậu đậu, hay quên để chìa khóa\nƯớc mơ: Khám phá vương quốc hạt dẻ trên mây\nNgười nhà tớ tả bạn ấy là: Một bạn sóc nhỏ màu cam vừa dũng cảm vừa buồn cười',
      fields: [
        { id: 'char-name', label: '1. Tên nhân vật', prefix: 'Tên: ' },
        { id: 'char-likes', label: '2. Sở thích đặc trưng', prefix: 'Thích: ' },
        { id: 'char-fears', label: '3. Nỗi sợ hãi', prefix: 'Sợ: ', badge: 'Quan trọng' },
        { id: 'char-strength', label: '4. Sở trường / Điểm giỏi', prefix: 'Giỏi: ' },
        { id: 'char-weakness', label: '5. Điểm dở / Vụng về đáng yêu', prefix: 'Dở: ', badge: 'Quan trọng' },
        { id: 'char-dream', label: '6. Ước mơ', prefix: 'Ước mơ: ' },
        {
          id: 'char-family-feedback',
          label: '7. Người nhà tớ tả bạn ấy là',
          prefix: 'Người nhà tớ tả bạn ấy là: ',
        },
      ],
    }

    const html = renderToStaticMarkup(
      <CreativeNotebookEngine
        onPromptChange={vi.fn()}
        notebookConfig={MOCK_LESSON_3_1_CONFIG}
      />
    )

    // Header Profile Card
    expect(html).toContain('HỒ SƠ MẪU CỦA AIKI')
    expect(html).toContain('🐿️')
    expect(html).toContain('Mẫu tham khảo')
    expect(html).toContain('btn-use-sample-quick')

    // 7 dòng mẫu hiển thị cụ thể
    expect(html).toContain('Sóc Bông Quả Cảm')
    expect(html).toContain('Hạt dẻ nướng thơm lừng và trèo cành sồi cao vút')
    expect(html).toContain('Tiếng máy sấy tóc và tiếng sấm sét đùng đoàng')
    expect(html).toContain('Bật nhảy thoăn thoắt qua các cành cây')
    expect(html).toContain('Cực kỳ hậu đậu, hay quên để chìa khóa')
    expect(html).toContain('Khám phá vương quốc hạt dẻ trên mây')
    expect(html).toContain('Một bạn sóc nhỏ màu cam vừa dũng cảm vừa buồn cười')

    // Star icons cho ô sợ và dở
    expect(html).toContain('data-testid="field-star-char-fears"')
    expect(html).toContain('data-testid="field-star-char-weakness"')
  })

  it('renders AIKI advice banner at top of notebook even when challengeSummary is present (Fix #1)', () => {
    const html = renderToStaticMarkup(
      <CreativeNotebookEngine
        onPromptChange={vi.fn()}
        notebookConfig={{
          notebookTitle: 'Hồ sơ nhân vật của tớ',
          akiAdvice: 'Hãy tạo một nhân vật bất kỳ: người, con vật, đồ vật, thậm chí một cái thang máy...',
          challengeSummary: ['Mục tiêu 1', 'Mục tiêu 2'],
          fields: [{ id: 'f1', label: '1. Tên', rows: 1 }],
        }}
      />
    )

    expect(html).toContain('data-testid="aki-advice-banner"')
    expect(html).toContain('Lời dặn dò của AIKI')
    expect(html).toContain('Hãy tạo một nhân vật bất kỳ: người, con vật, đồ vật, thậm chí một cái thang máy...')
    expect(html).toContain('🦉')
  })

  it('renders backpack tag badge next to notebook title and inside AIKI banner (Fix #2)', () => {
    const html = renderToStaticMarkup(
      <CreativeNotebookEngine
        onPromptChange={vi.fn()}
        notebookConfig={{
          notebookTitle: 'Hồ sơ nhân vật của tớ',
          backpackTag: 'Hồ sơ nhân vật',
          backpackCategory: 'character-dna',
          fields: [{ id: 'f1', label: '1. Tên', rows: 1 }],
        }}
      />
    )

    expect(html).toContain('data-testid="backpack-tag-badge"')
    expect(html).toContain('🎒 Hồ sơ nhân vật')
    expect(html).toContain('data-testid="aki-banner-backpack-badge"')
  })

  it('renders full field labels, badges, and pedagogical helper tips in student writing card (Fix #3 & #6)', () => {
    const html = renderToStaticMarkup(
      <CreativeNotebookEngine
        onPromptChange={vi.fn()}
        notebookConfig={{
          notebookTitle: 'Sổ tay mẫu',
          fields: [
            {
              id: 'field-special',
              label: '3. Nỗi sợ hãi',
              badge: 'Quan trọng',
              helperTip: 'Đừng bỏ trống ô này nhé!',
              rows: 2,
            },
            {
              id: 'field-family',
              label: '7. Người nhà tớ tả bạn ấy là',
              badge: 'Hỏi người nhà',
              helperTip: 'Đọc hồ sơ cho bố hoặc mẹ nghe',
              rows: 3,
            },
          ],
        }}
      />
    )

    // Dòng 1: Label & Badge
    expect(html).toContain('3. Nỗi sợ hãi')
    expect(html).toContain('data-testid="field-badge-field-special"')
    expect(html).toContain('Quan trọng')
    expect(html).toContain('7. Người nhà tớ tả bạn ấy là')
    expect(html).toContain('data-testid="field-badge-field-family"')
    expect(html).toContain('Hỏi người nhà')

    // Dòng 2: Helper tip
    expect(html).toContain('data-testid="field-helper-tip-field-special"')
    expect(html).toContain('Đừng bỏ trống ô này nhé!')
    expect(html).toContain('data-testid="field-helper-tip-field-family"')
    expect(html).toContain('Đọc hồ sơ cho bố hoặc mẹ nghe')
  })

  it('renders <textarea> for rows > 1 and <input> for rows <= 1 without truncating placeholder (Fix #4)', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <CreativeNotebookEngine
          onPromptChange={vi.fn()}
          notebookConfig={{
            notebookTitle: 'Kiểm tra rows',
            fields: [
              { id: 'f-input', label: '1. Tên', rows: 1, placeholder: 'Gõ 1 dòng' },
              { id: 'f-textarea', label: '2. Mô tả dài', rows: 3, placeholder: 'Gõ nhiều dòng...' },
            ],
          }}
        />
      )
    })

    const inputEl = container.querySelector('[data-testid="notebook-field-f-input"]')
    const textareaEl = container.querySelector('[data-testid="notebook-field-f-textarea"]')

    expect(inputEl).toBeInstanceOf(HTMLInputElement)
    expect(textareaEl).toBeInstanceOf(HTMLTextAreaElement)
    expect((textareaEl as HTMLTextAreaElement).rows).toBe(3)

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('renders self-check checklist section and allows students to check off criteria (Fix #5)', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <CreativeNotebookEngine
          onPromptChange={vi.fn()}
          notebookConfig={{
            notebookTitle: 'Sổ tay kiểm tra',
            challengeSummary: ['Tóm tắt mục tiêu'],
            checklist: [
              { id: 'chk-1', label: 'Tiêu chí 1: Tạo tên cho nhân vật' },
              { id: 'chk-2', label: 'Tiêu chí 2: Không bỏ trống ô Sợ' },
            ],
            fields: [{ id: 'f1', label: '1. Tên', rows: 1 }],
          }}
        />
      )
    })

    const checklistSection = container.querySelector('[data-testid="notebook-checklist-section"]')
    expect(checklistSection).toBeTruthy()
    expect(checklistSection?.textContent).toContain('TIÊU CHÍ TỰ KIỂM TRA')
    expect(checklistSection?.textContent).toContain('2 tiêu chí')

    const item1 = container.querySelector('[data-testid="checklist-item-chk-1"]') as HTMLLabelElement
    const inputCheckbox = item1.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(inputCheckbox.checked).toBe(false)

    await act(async () => {
      item1.click()
    })

    expect(inputCheckbox.checked).toBe(true)

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('renders Lesson 3.1 full CMS configuration with all 7 fields, badges, helper tips, and textareas matching CMS spec', () => {
    const LESSON_3_1_FULL_CONFIG: CreativeNotebookConfig = {
      notebookTitle: 'Hồ sơ nhân vật của tớ',
      akiAdvice:
        'Hãy tạo một nhân vật bất kỳ: người, con vật, đồ vật, thậm chí một cái thang máy cũng được. Dù chưa vẽ gì, người nghe vẫn có thể tưởng tượng ra nhân vật trong đầu nhờ tính cách!',
      sampleHelperTitle: 'Cách làm kịch bản mẫu: Hồ sơ 7 dòng',
      sampleTemplate:
        'Tên: Sóc Bông Quả Cảm\nThích: Hạt dẻ nướng thơm lừng\nSợ: Tiếng máy sấy tóc\nGiỏi: Bật nhảy\nDở: Hay quên\nƯớc mơ: Vương quốc hạt dẻ\nNgười nhà tớ tả bạn ấy là: Một bạn sóc nhỏ màu cam',
      backpackCategory: 'character-dna',
      backpackTag: 'Hồ sơ nhân vật',
      characterName: 'Sóc Bông Quả Cảm',
      challengeSummary: [
        'Tạo một nhân vật bất kỳ: người, con vật, đồ vật — thậm chí một cái thang máy cũng được',
        'Điền đủ các ô: Tên – Thích – Sợ – Giỏi – Dở – Ước mơ',
        'Đừng bỏ trống hai ô SỢ và DỞ, và viết thật cụ thể ("sợ tiếng máy sấy tóc" thay vì "sợ nhiều thứ")',
        'Đọc hồ sơ ấy cho bố hoặc mẹ nghe và hỏi: "Theo mẹ, bạn này trông như thế nào?"',
      ],
      checklist: [
        {
          id: 'cl-3-1-1',
          label: 'Tạo một nhân vật bất kỳ: người, con vật, đồ vật — thậm chí một cái thang máy',
        },
        {
          id: 'cl-3-1-2',
          label: 'Điền đủ các ô — ĐẶC BIỆT không bỏ trống hai ô SỢ và DỞ (viết cụ thể)',
        },
        {
          id: 'cl-3-1-3',
          label: 'Đọc hồ sơ cho bố/mẹ nghe và ghi lại câu trả lời vào ô số 7',
        },
      ],
      fields: [
        {
          id: 'char-name',
          label: '1. Tên nhân vật',
          prefix: 'Tên: ',
          placeholder: 'Người, con vật, đồ vật — thậm chí một cái thang máy...',
          helperTip: '💡 Nhân vật bất kỳ: người, con vật, đồ vật, cái bút chì, cái thang máy...',
          rows: 1,
        },
        {
          id: 'char-likes',
          label: '2. Sở thích đặc trưng',
          prefix: 'Thích: ',
          placeholder: 'Sở thích nổi bật nhất của bạn ấy...',
          rows: 2,
        },
        {
          id: 'char-fears',
          label: '3. Nỗi sợ hãi',
          prefix: 'Sợ: ',
          placeholder: 'Sợ tiếng máy sấy tóc thay vì sợ nhiều thứ...',
          badge: 'Quan trọng',
          helperTip: '💡 Đừng bỏ trống! Viết thật cụ thể: sợ tiếng máy sấy tóc thay vì sợ nhiều thứ',
          rows: 2,
        },
        {
          id: 'char-strength',
          label: '4. Sở trường / Điểm giỏi',
          prefix: 'Giỏi: ',
          placeholder: 'Bạn ấy giỏi nhất việc gì...',
          rows: 2,
        },
        {
          id: 'char-weakness',
          label: '5. Điểm dở / Vụng về đáng yêu',
          prefix: 'Dở: ',
          placeholder: 'Hay quên chìa khóa, hậu đậu...',
          badge: 'Quan trọng',
          helperTip: '💡 Đừng bỏ trống! Điểm dở/tật xấu đáng yêu làm nhân vật thật hơn siêu nhân hoàn hảo',
          rows: 2,
        },
        {
          id: 'char-dream',
          label: '6. Ước mơ',
          prefix: 'Ước mơ: ',
          placeholder: 'Ước mơ lớn nhất của bạn ấy...',
          rows: 2,
        },
        {
          id: 'char-family-feedback',
          label: '7. Người nhà tớ tả bạn ấy là',
          prefix: 'Người nhà tớ tả bạn ấy là: ',
          placeholder: 'Ghi lại câu trả lời của bố/mẹ sau khi nghe đọc...',
          badge: 'Hỏi người nhà',
          helperTip: '💡 Đọc hồ sơ cho bố hoặc mẹ nghe và hỏi: "Theo mẹ, bạn này trông như thế nào?" rồi ghi lại',
          rows: 3,
        },
      ],
    }

    const html = renderToStaticMarkup(
      <CreativeNotebookEngine
        onPromptChange={vi.fn()}
        notebookConfig={LESSON_3_1_FULL_CONFIG}
      />
    )

    // 1. AIKI Advice Banner
    expect(html).toContain('data-testid="aki-advice-banner"')
    expect(html).toContain('thậm chí một cái thang máy cũng được')

    // 2. Backpack Badge
    expect(html).toContain('data-testid="backpack-tag-badge"')
    expect(html).toContain('🎒 Hồ sơ nhân vật')

    // 3. Badges & Helper Tips in Student Writing Card
    expect(html).toContain('data-testid="field-badge-char-fears"')
    expect(html).toContain('data-testid="field-badge-char-weakness"')
    expect(html).toContain('data-testid="field-badge-char-family-feedback"')
    expect(html).toContain('Hỏi người nhà')
    expect(html).toContain('data-testid="field-helper-tip-char-name"')
    expect(html).toContain('data-testid="field-helper-tip-char-fears"')
    expect(html).toContain('data-testid="field-helper-tip-char-weakness"')
    expect(html).toContain('data-testid="field-helper-tip-char-family-feedback"')

    // 4. Textarea vs Input
    expect(html).toContain('<input type="text" id="field-char-name"')
    expect(html).toContain('<textarea id="field-char-likes"')
    expect(html).toContain('<textarea id="field-char-fears"')
    expect(html).toContain('<textarea id="field-char-strength"')
    expect(html).toContain('<textarea id="field-char-weakness"')
    expect(html).toContain('<textarea id="field-char-dream"')
    expect(html).toContain('<textarea id="field-char-family-feedback"')

    // 5. Checklist
    expect(html).toContain('data-testid="notebook-checklist-section"')
    expect(html).toContain('data-testid="checklist-item-cl-3-1-1"')
    expect(html).toContain('data-testid="checklist-item-cl-3-1-2"')
    expect(html).toContain('data-testid="checklist-item-cl-3-1-3"')
  })
})

