// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { StageBlockItemCard } from './StageBlockItemCard'
import type { StageBlockItem, LearnCardDraft } from '../lib/authoring'

describe('StageBlockItemCard Component — layout-confirm-option Block', () => {
  let container: HTMLDivElement | null = null
  let root: ReturnType<typeof createRoot> | null = null

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount()
      })
      root = null
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
      container = null
    }
  })

  const mockCard: LearnCardDraft = {
    id: 'island-stage-2',
    title: 'Chặng 2: Xác nhận mục tiêu',
    body: '',
    tip: '',
    kind: 'example',
    layout: 'text',
    visualItems: [],
  }

  const mockBlocks: StageBlockItem[] = [
    {
      id: 'course-confirm-question',
      type: 'text',
      title: 'Câu hỏi xác nhận',
      body: 'Bộ chìa khoá nào mở được câu lệnh tốt?',
    },
    {
      id: 'course-confirm-option-0',
      type: 'layout-confirm-option',
      title: 'Bộ chìa khoá A',
      body: 'Phương án A với con mèo tam thể',
      imageUrl: 'https://cdn.example.com/cat.webp',
      isCorrect: true,
      visualItems: [],
    },
    {
      id: 'course-confirm-option-1',
      type: 'layout-confirm-option',
      title: 'Bộ chìa khoá B',
      body: 'Phương án B với chú chó',
      imageUrl: '',
      isCorrect: false,
      visualItems: [],
    },
  ]

  it('renders layout-confirm-option with letter badge, radio correct answer, title and image preview when expanded', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    act(() => {
      root?.render(
        <StageBlockItemCard
          block={mockBlocks[1]}
          bIdx={0}
          totalBlocks={mockBlocks.length}
          stageIndex={1}
          card={mockCard}
          stageBlocks={mockBlocks}
          draggingBlockIdx={null}
          dragOverBlockIdx={null}
          setDraggingBlockIdx={vi.fn()}
          setDragOverBlockIdx={vi.fn()}
          setIsTrashDragOver={vi.fn()}
          moveBlock={vi.fn()}
          removeBlock={vi.fn()}
          updateStageBlocks={vi.fn()}
          updateBlockItem={vi.fn()}
          updateLearnCard={vi.fn()}
          uploadingStageMedia={null}
          setUploadingStageMedia={vi.fn()}
          uploadLearnCardMedia={vi.fn()}
          uploadAdditionalImageItem={vi.fn()}
          previewAikiVoice={vi.fn()}
          previewSpeakingIndex={null}
          speakTextPreview={vi.fn()}
          courseId="dao-1"
          handleAddModule={vi.fn()}
          stageInfo={{ title: 'Xác nhận mục tiêu', icon: () => null, desc: 'Chặng 2' }}
          inputStyle={{}}
          textareaStyle={{}}
          showToast={vi.fn()}
        />
      )
    })

    const text = container.textContent || ''
    // Header có badge Phương án A và Đáp án đúng
    expect(text).toContain('Phương án A')
    expect(text).toContain('Đáp án đúng')
    expect(text).toContain('Bộ chìa khoá A')

    // Tuyệt đối không còn 4 ô con lắt nhắt của layout-four-keys cũ
    expect(text).not.toContain('Cái gì?')
    expect(text).not.toContain('Trông như thế nào?')
    expect(text).not.toContain('Đang làm gì?')
    expect(text).not.toContain('Ở đâu?')
    expect(text).not.toContain('Thêm ô con')

    // Có ảnh preview
    const img = container.querySelector('img')
    expect(img).toBeTruthy()
    expect(img?.getAttribute('src')).toBe('https://cdn.example.com/cat.webp')
  })

  it('updates correct answer radio when clicked', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    const updateStageBlocks = vi.fn()

    act(() => {
      root?.render(
        <StageBlockItemCard
          block={mockBlocks[2]}
          bIdx={2}
          totalBlocks={mockBlocks.length}
          stageIndex={1}
          card={mockCard}
          stageBlocks={mockBlocks}
          draggingBlockIdx={null}
          dragOverBlockIdx={null}
          setDraggingBlockIdx={vi.fn()}
          setDragOverBlockIdx={vi.fn()}
          setIsTrashDragOver={vi.fn()}
          moveBlock={vi.fn()}
          removeBlock={vi.fn()}
          updateStageBlocks={updateStageBlocks}
          updateBlockItem={vi.fn()}
          updateLearnCard={vi.fn()}
          uploadingStageMedia={null}
          setUploadingStageMedia={vi.fn()}
          uploadLearnCardMedia={vi.fn()}
          uploadAdditionalImageItem={vi.fn()}
          previewAikiVoice={vi.fn()}
          previewSpeakingIndex={null}
          speakTextPreview={vi.fn()}
          courseId="dao-1"
          handleAddModule={vi.fn()}
          stageInfo={{ title: 'Xác nhận mục tiêu', icon: () => null, desc: 'Chặng 2' }}
          inputStyle={{}}
          textareaStyle={{}}
          showToast={vi.fn()}
        />
      )
    })

    const radio = container.querySelector('input[type="radio"]') as HTMLInputElement
    expect(radio).toBeTruthy()
    expect(radio.checked).toBe(false)

    act(() => {
      radio.click()
    })

    expect(updateStageBlocks).toHaveBeenCalledTimes(1)
    const updatedBlocks = updateStageBlocks.mock.calls[0][1] as StageBlockItem[]
    expect(updatedBlocks.find((b) => b.id === 'course-confirm-option-1')?.isCorrect).toBe(true)
    expect(updatedBlocks.find((b) => b.id === 'course-confirm-option-0')?.isCorrect).toBe(false)
  })

  it('renders upload dropzone button when expanded and no image is present', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    act(() => {
      root?.render(
        <StageBlockItemCard
          block={mockBlocks[2]}
          bIdx={0}
          totalBlocks={mockBlocks.length}
          stageIndex={1}
          card={mockCard}
          stageBlocks={mockBlocks}
          draggingBlockIdx={null}
          dragOverBlockIdx={null}
          setDraggingBlockIdx={vi.fn()}
          setDragOverBlockIdx={vi.fn()}
          setIsTrashDragOver={vi.fn()}
          moveBlock={vi.fn()}
          removeBlock={vi.fn()}
          updateStageBlocks={vi.fn()}
          updateBlockItem={vi.fn()}
          updateLearnCard={vi.fn()}
          uploadingStageMedia={null}
          setUploadingStageMedia={vi.fn()}
          uploadLearnCardMedia={vi.fn()}
          uploadAdditionalImageItem={vi.fn()}
          previewAikiVoice={vi.fn()}
          previewSpeakingIndex={null}
          speakTextPreview={vi.fn()}
          courseId="dao-1"
          handleAddModule={vi.fn()}
          stageInfo={{ title: 'Xác nhận mục tiêu', icon: () => null, desc: 'Chặng 2' }}
          inputStyle={{}}
          textareaStyle={{}}
          showToast={vi.fn()}
        />
      )
    })

    const text = container.textContent || ''
    expect(text).toContain('Tải ảnh từ máy tính lên')
    expect(text).not.toContain('https://')
    expect(text).not.toContain('Chọn nhanh')
  })

  it('renders layout-four-keys without Lời dẫn and Câu ghi nhớ, and provides color chips and sub inputs', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    const updateBlockItem = vi.fn()
    const fourKeysBlock: StageBlockItem = {
      id: 'course-goal-four-keys',
      type: 'layout-four-keys',
      title: 'Bốn chiếc chìa khóa mở câu lệnh',
      body: 'Lời dẫn không được render',
      tip: 'Câu ghi nhớ không được render',
      visualItems: [
        { label: 'CÁI GÌ (Xanh Sky)', text: 'một cái cốc', sub: 'Ai, đồ vật gì', tone: 'sky', keyImage: '/assets/aiki-keys/key_what_blue.jpg' },
        { label: 'TRÔNG THẾ NÀO', text: 'sứ trắng', sub: 'Màu sắc, hình dáng', tone: 'sun', keyImage: '/assets/aiki-keys/key_how_yellow.jpg' },
      ],
    }

    act(() => {
      root?.render(
        <StageBlockItemCard
          block={fourKeysBlock}
          bIdx={0}
          totalBlocks={1}
          stageIndex={0}
          card={mockCard}
          stageBlocks={[fourKeysBlock]}
          draggingBlockIdx={null}
          dragOverBlockIdx={null}
          setDraggingBlockIdx={vi.fn()}
          setDragOverBlockIdx={vi.fn()}
          setIsTrashDragOver={vi.fn()}
          moveBlock={vi.fn()}
          removeBlock={vi.fn()}
          updateStageBlocks={vi.fn()}
          updateBlockItem={updateBlockItem}
          updateLearnCard={vi.fn()}
          uploadingStageMedia={null}
          setUploadingStageMedia={vi.fn()}
          uploadLearnCardMedia={vi.fn()}
          uploadAdditionalImageItem={vi.fn()}
          previewAikiVoice={vi.fn()}
          previewSpeakingIndex={null}
          speakTextPreview={vi.fn()}
          courseId="dao-1"
          handleAddModule={vi.fn()}
          stageInfo={{ title: 'Mục tiêu bài học', icon: () => null, desc: 'Chặng 1' }}
          inputStyle={{}}
          textareaStyle={{}}
          showToast={vi.fn()}
        />
      )
    })

    const text = container.textContent || ''
    // Không được chứa các label trường thừa
    expect(text).not.toContain('Lời dẫn')
    expect(text).not.toContain('Câu ghi nhớ')

    // Hiển thị badge số thứ tự
    expect(text).toContain('[1]')
    expect(text).toContain('[2]')

    // Input placeholders
    const inputs = container.querySelectorAll('input')
    const placeholders = Array.from(inputs).map((input) => input.getAttribute('placeholder'))
    expect(placeholders).toContain('Tên chìa khóa (VD: CÁI GÌ)')
    expect(placeholders).toContain('Phụ đề gợi ý (VD: Ai, đồ vật gì)')
    expect(placeholders).toContain("Ví dụ mẫu (VD: 'một cái cốc')")

    // Cleaned label: "CÁI GÌ (Xanh Sky)" được làm sạch thành "CÁI GÌ" trong input
    const labelInput = Array.from(inputs).find((inp) => inp.getAttribute('placeholder') === 'Tên chìa khóa (VD: CÁI GÌ)') as HTMLInputElement
    expect(labelInput.value).toBe('CÁI GÌ')

    // Nút chip màu mini: 4 presets (Xanh Sky, Vàng Sun, Cam Mango, Hồng Gum)
    const colorButtons = container.querySelectorAll('button[title="Vàng Sun"]')
    expect(colorButtons.length).toBeGreaterThanOrEqual(1)

    // Click đổi màu sang Vàng Sun
    act(() => {
      ;(colorButtons[0] as HTMLButtonElement).click()
    })

    expect(updateBlockItem).toHaveBeenCalledWith(
      0,
      'course-goal-four-keys',
      expect.objectContaining({
        visualItems: expect.arrayContaining([
          expect.objectContaining({
            tone: 'sun',
            keyImage: '/assets/aiki-keys/key_how_yellow.jpg',
          }),
        ]),
      })
    )
  })

  it('verifies that header action buttons and badges have shrink-0, whitespace-nowrap, and title is truncated', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    const longTitleBlock: StageBlockItem = {
      id: 'block-long-title',
      type: 'text',
      title: 'MỤC TIÊU BÀI HỌC: BÀI 1.2 — BỐN CHIẾC CHÌA KHOÁ MỞ KHÓA VẠN VẬT SIÊU DÀI KHÔNG BAO GIỜ BỊ ĐÈ NÚT',
      body: 'Nội dung văn bản',
    }

    act(() => {
      root?.render(
        <StageBlockItemCard
          block={longTitleBlock}
          bIdx={0}
          totalBlocks={1}
          stageIndex={0}
          card={mockCard}
          stageBlocks={[longTitleBlock]}
          draggingBlockIdx={null}
          dragOverBlockIdx={null}
          setDraggingBlockIdx={vi.fn()}
          setDragOverBlockIdx={vi.fn()}
          setIsTrashDragOver={vi.fn()}
          moveBlock={vi.fn()}
          removeBlock={vi.fn()}
          updateStageBlocks={vi.fn()}
          updateBlockItem={vi.fn()}
          updateLearnCard={vi.fn()}
          uploadingStageMedia={null}
          setUploadingStageMedia={vi.fn()}
          uploadLearnCardMedia={vi.fn()}
          uploadAdditionalImageItem={vi.fn()}
          previewAikiVoice={vi.fn()}
          previewSpeakingIndex={null}
          speakTextPreview={vi.fn()}
          courseId="dao-1"
          handleAddModule={vi.fn()}
          stageInfo={{ title: 'Mục tiêu', icon: () => null, desc: 'Chặng 1' }}
          inputStyle={{}}
          textareaStyle={{}}
          showToast={vi.fn()}
        />
      )
    })

    // Header title element has truncate and min-w-0 flex-1
    const titleEl = container.querySelector('h4')
    expect(titleEl).not.toBeNull()
    expect(titleEl?.className).toContain('truncate')
    expect(titleEl?.className).toContain('min-w-0')
    expect(titleEl?.className).toContain('flex-1')

    // Collapse / Edit button has shrink-0 and whitespace-nowrap
    const buttons = container.querySelectorAll('button')
    const toggleBtn = Array.from(buttons).find((b) => b.textContent?.includes('Thu gọn') || b.textContent?.includes('Chỉnh sửa'))
    expect(toggleBtn).toBeDefined()
    expect(toggleBtn?.className).toContain('shrink-0')
    expect(toggleBtn?.className).toContain('whitespace-nowrap')

    // Delete block button has shrink-0 and whitespace-nowrap
    const deleteBtn = Array.from(buttons).find((b) => b.getAttribute('title') === 'Xóa khối')
    expect(deleteBtn).toBeDefined()
    expect(deleteBtn?.className).toContain('shrink-0')
    expect(deleteBtn?.className).toContain('whitespace-nowrap')
  })
})
