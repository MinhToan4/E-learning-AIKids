import React, { useState, useEffect, useMemo, useCallback } from 'react'
import type { EngineProps, BlockSlot, CreativeBlock } from '../types'
import {
  SUBJECT_BLOCKS,
  COLOR_SHAPE_BLOCKS,
  ACTION_BLOCKS,
  CONTEXT_BLOCKS,
} from '../data/creative-blocks-dataset'
import { BlockSlotTray } from '../components/BlockSlotTray'
import { BlockPalette } from '../components/BlockPalette'

const INITIAL_SLOTS: BlockSlot[] = [
  {
    id: 'slot-subject',
    keyId: 'subject',
    label: '🔑 1. Cái gì? / Ai?',
    required: true,
    category: 'subject',
    colorScheme: 'sky',
    hint: 'Chọn một nhân vật hoặc đồ vật',
  },
  {
    id: 'slot-color-shape',
    keyId: 'color-shape',
    label: '🔑 2. Trông thế nào?',
    required: true,
    category: 'color-shape',
    colorScheme: 'amber',
    hint: 'Màu sắc, hình dáng, đặc điểm',
  },
  {
    id: 'slot-action',
    keyId: 'action',
    label: '🔑 3. Đang làm gì?',
    required: true,
    category: 'action',
    colorScheme: 'mint',
    hint: 'Hành động, cử chỉ',
  },
  {
    id: 'slot-context',
    keyId: 'context',
    label: '🔑 4. Ở đâu?',
    required: true,
    category: 'context',
    colorScheme: 'rose',
    hint: 'Nơi chốn, bối cảnh xung quanh',
  },
]

export const MagicKeysEngine: React.FC<EngineProps> = ({
  onPromptChange,
  characterName,
  selectedSubject,
  currentPrompt,
}) => {
  const effectiveSubject = selectedSubject || characterName || 'Cái cốc sứ trắng'

  const buildSubjectBlock = useCallback((name: string): CreativeBlock => {
    const matched = SUBJECT_BLOCKS.find(
      (b) =>
        b.label.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(b.label.toLowerCase())
    )
    if (matched) {
      return { ...matched, label: name, text: name }
    }
    const icon = name.includes('cốc')
      ? '☕'
      : name.includes('xe')
      ? '🚲'
      : name.includes('sổ')
      ? '📖'
      : name.includes('đồng hồ')
      ? '⏰'
      : '🎨'
    return {
      id: `custom-sub-${name}`,
      label: name,
      text: name,
      category: 'subject',
      icon,
      colorScheme: 'sky',
    }
  }, [])

  const [slots, setSlots] = useState<BlockSlot[]>(() => {
    return INITIAL_SLOTS.map((slot) => {
      if (slot.keyId === 'subject') {
        return {
          ...slot,
          currentBlock: buildSubjectBlock(effectiveSubject),
          locked: true,
        }
      }
      return slot
    })
  })

  // Cập nhật prompt khi slots thay đổi
  const syncPrompt = useCallback(
    (currentSlots: BlockSlot[]) => {
      const activeBlocks = currentSlots
        .map((s) => s.currentBlock)
        .filter((b): b is CreativeBlock => b !== null && b !== undefined)

      // Ghép câu lệnh mượt mà
      const parts = activeBlocks.map((b) => b.text.trim())
      const assembledPrompt = parts.join(' ')
      onPromptChange(assembledPrompt, activeBlocks)
    },
    [onPromptChange]
  )

  // Khóa ô slot-subject theo món đồ đã chọn (tự động cập nhật khi đổi món đồ ở Sidebar)
  useEffect(() => {
    setSlots((prev) => {
      const next = prev.map((slot) => {
        if (slot.keyId === 'subject') {
          return {
            ...slot,
            currentBlock: buildSubjectBlock(effectiveSubject),
            locked: true,
          }
        }
        return slot
      })
      syncPrompt(next)
      return next
    })
  }, [effectiveSubject, buildSubjectBlock, syncPrompt])

  // Tập trung vào 3 nhóm thuộc tính mô tả: 2. Trông thế nào, 3. Đang làm gì, 4. Ở đâu
  const allBlocks = useMemo(() => {
    return [
      ...COLOR_SHAPE_BLOCKS,
      ...ACTION_BLOCKS,
      ...CONTEXT_BLOCKS,
    ]
  }, [])

  const categories = [
    { id: 'color-shape', label: '2. Trông thế nào', icon: '🎨' },
    { id: 'action', label: '3. Đang làm gì', icon: '🏃' },
    { id: 'context', label: '4. Ở đâu', icon: '🌲' },
  ]

  // Xử lý chọn block (từ Palette click hoặc drop)
  const handleSelectBlock = (block: CreativeBlock) => {
    setSlots((prev) => {
      const next = prev.map((slot) => {
        // Không ghi đè slot đã bị khóa cứng
        if (slot.locked) return slot
        if (slot.category === block.category) {
          return { ...slot, currentBlock: block }
        }
        return slot
      })
      syncPrompt(next)
      return next
    })
  }

  // Xử lý drop trực tiếp vào slot cụ thể
  const handleDropBlock = (slotId: string, block: CreativeBlock) => {
    setSlots((prev) => {
      const next = prev.map((slot) => {
        if (slot.id === slotId && !slot.locked) {
          return { ...slot, currentBlock: block }
        }
        return slot
      })
      syncPrompt(next)
      return next
    })
  }

  // Gỡ block ra khỏi slot (nếu không bị khóa)
  const handleRemoveBlock = (slotId: string) => {
    setSlots((prev) => {
      const next = prev.map((slot) => {
        if (slot.id === slotId && !slot.locked) {
          return { ...slot, currentBlock: null }
        }
        return slot
      })
      syncPrompt(next)
      return next
    })
  }

  const selectedBlockIds = slots
    .map((s) => s.currentBlock?.id)
    .filter((id): id is string => !!id)

  return (
    <div data-testid="magic-keys-engine" className="flex flex-col gap-3">
      {/* Khay 4 Ô Slot chìa khóa */}
      <BlockSlotTray
        title="4 Chìa Khóa Vàng AKI"
        subtitle="Ô 1 đã khóa món đồ; điền tiếp 3 ô để câu lệnh chuẩn nhất"
        slots={slots}
        onRemoveBlock={handleRemoveBlock}
        onDropBlock={handleDropBlock}
      />

      {/* Khay Thẻ Bài Cho Bé Chọn */}
      <BlockPalette
        title="Khay Thẻ Bài 4 Nhóm Chìa Khóa"
        subtitle="Tập trung 3 nhóm thuộc tính: Trông thế nào · Đang làm gì · Ở đâu"
        blocks={allBlocks}
        selectedBlockIds={selectedBlockIds}
        onSelectBlock={handleSelectBlock}
        categories={categories}
      />
    </div>
  )
}
