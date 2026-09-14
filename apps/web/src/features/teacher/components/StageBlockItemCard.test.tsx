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
})
