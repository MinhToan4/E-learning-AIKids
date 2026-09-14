import React, { useState, useEffect, useMemo, useCallback } from 'react'
import type { EngineProps, BlockSlot, CreativeBlock } from '../types'
import {
  SUBJECT_BLOCKS,
  COLOR_SHAPE_BLOCKS,
  ACTION_BLOCKS,
  CONTEXT_BLOCKS,
  CERAMIC_CUP_BLOCKS,
  BICYCLE_BLOCKS,
  NOTEBOOK_BLOCKS,
  CLOCK_BLOCKS,
} from '../data/creative-blocks-dataset'
import { BlockSlotTray } from '../components/BlockSlotTray'
import { BlockPalette } from '../components/BlockPalette'
import { playInstantSound } from '../../LessonInteractiveSidebar'
import { cn } from '@/shared/lib/cn'

export function getSubjectImage(name?: string): string {
  const s = (name || '').toLowerCase()
  if (s.includes('xe') || s.includes('đạp') || s.includes('bicycle')) return '/assets/aiki-islands/island1_lesson2_bicycle.jpg'
  if (s.includes('sổ') || s.includes('sách') || s.includes('notebook')) return '/assets/aiki-islands/island1_lesson2_notebook.jpg'
  if (s.includes('đồng hồ') || s.includes('clock')) return '/assets/aiki-islands/island1_lesson2_clock.jpg'
  if (s.includes('cốc') || s.includes('ly') || s.includes('cup') || s.includes('teacup')) return '/assets/aiki-islands/island1_lesson2_teacup.jpg'
  if (s.includes('mèo') || s.includes('cat')) return '/assets/aiki-islands/island1_lesson1_cat.jpg'
  return '/assets/aiki-islands/island1_lesson2_teacup.jpg'
}

export const MAGIC_SUBJECT_BLOCKS: CreativeBlock[] = [
  {
    id: 'sub-coc-su',
    label: 'Cốc sứ trắng',
    text: 'Cái cốc sứ trắng tinh',
    category: 'subject',
    icon: '☕',
    colorScheme: 'sky',
    badge: 'Bài 1.2',
  },
  {
    id: 'sub-xe-dap',
    label: 'Cái xe đạp',
    text: 'Chiếc xe đạp mini màu xanh',
    category: 'subject',
    icon: '🚲',
    colorScheme: 'sky',
    badge: 'Bài 1.2',
  },
  {
    id: 'sub-so-tay',
    label: 'Cuốn sổ tay',
    text: 'Cuốn sổ tay mở bìa da nâu',
    category: 'subject',
    icon: '📖',
    colorScheme: 'sky',
    badge: 'Bài 1.2',
  },
  {
    id: 'sub-dong-ho',
    label: 'Đồng hồ để bàn',
    text: 'Chiếc đồng hồ báo thức quả lắc',
    category: 'subject',
    icon: '⏰',
    colorScheme: 'sky',
    badge: 'Bài 1.2',
  },
  ...SUBJECT_BLOCKS,
]

const INITIAL_SLOTS: BlockSlot[] = [
  {
    id: 'slot-subject',
    keyId: 'subject',
    keyNumber: 1,
    keyTitle: 'Cái gì?',
    label: '🔑 1. Cái gì?',
    required: true,
    category: 'subject',
    colorScheme: 'sky',
    hint: '+ Chọn món đồ',
  },
  {
    id: 'slot-color-shape',
    keyId: 'color-shape',
    keyNumber: 2,
    keyTitle: 'Trông thế nào',
    label: '🔑 2. Trông thế nào',
    required: true,
    category: 'color-shape',
    colorScheme: 'amber',
    hint: '+ Chọn đặc điểm',
  },
  {
    id: 'slot-action',
    keyId: 'action',
    keyNumber: 3,
    keyTitle: 'Đang làm gì',
    label: '🔑 3. Đang làm gì',
    required: true,
    category: 'action',
    colorScheme: 'mint',
    hint: '+ Chọn hành động',
  },
  {
    id: 'slot-context',
    keyId: 'context',
    keyNumber: 4,
    keyTitle: 'Ở đâu?',
    label: '🔑 4. Ở đâu?',
    required: true,
    category: 'context',
    colorScheme: 'rose',
    hint: '+ Chọn bối cảnh',
  },
]

export interface MagicKeysEngineProps extends EngineProps {
  promptSlot?: React.ReactNode
}

export const MagicKeysEngine: React.FC<MagicKeysEngineProps> = ({
  onPromptChange,
  characterName,
  selectedSubject,
  lessonId,
  currentPrompt,
  canvasSlot,
  practiceSlot,
  promptSlot,
}) => {
  const [selectedSubjectOverride, setSelectedSubjectOverride] = useState<string | null>(null)
  const effectiveSubject = selectedSubjectOverride || selectedSubject || characterName || 'Cái cốc sứ trắng'

  useEffect(() => {
    setSelectedSubjectOverride(null)
  }, [selectedSubject, characterName])

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
          locked: false,
          subjectImage: getSubjectImage(effectiveSubject),
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
            locked: false,
            subjectImage: getSubjectImage(effectiveSubject),
          }
        }
        return slot
      })
      syncPrompt(next)
      return next
    })
  }, [effectiveSubject, buildSubjectBlock, syncPrompt])

  const currentObjectBlocks = useMemo(() => {
    const s = (effectiveSubject || '').toLowerCase()
    if (s.includes('xe') || s.includes('đạp')) return BICYCLE_BLOCKS
    if (s.includes('sổ') || s.includes('sách')) return NOTEBOOK_BLOCKS
    if (s.includes('đồng hồ') || s.includes('clock')) return CLOCK_BLOCKS
    if (s.includes('cốc') || s.includes('ly') || lessonId?.includes('1-2') || lessonId?.includes('1.2')) return CERAMIC_CUP_BLOCKS
    return [...COLOR_SHAPE_BLOCKS, ...ACTION_BLOCKS, ...CONTEXT_BLOCKS]
  }, [effectiveSubject, lessonId])

  // Tập trung vào các nhóm thuộc tính mô tả
  const allBlocks = currentObjectBlocks

  const categories = [
    { id: 'color-shape', label: '2. Trông thế nào', icon: '🎨' },
    { id: 'action', label: '3. Đang làm gì', icon: '🏃' },
    { id: 'context', label: '4. Ở đâu', icon: '🌲' },
  ]

  const [activeSlotId, setActiveSlotId] = useState<string>('slot-color-shape')
  const [activeCategory, setActiveCategory] = useState<string>('color-shape')
  const [isPaletteModalOpen, setIsPaletteModalOpen] = useState<boolean>(false)

  // Lọc danh sách thẻ từ chỉ lấy đúng các thẻ thuộc activeCategory đang được mở (popup riêng biệt từng chìa khóa)
  const currentSlotBlocks = useMemo(() => {
    return allBlocks.filter((b) => b.category === activeCategory)
  }, [allBlocks, activeCategory])

  // Khi bấm vào một ô slot: chuyển active category tương ứng và mở modal popup (ngoại trừ Ô 1 đã chọn ở Cột 1)
  const handleSlotClick = (slot: BlockSlot) => {
    playInstantSound('click')
    if (slot.category === 'subject' || slot.id === 'slot-subject') {
      // Món đồ đã được chọn trực tiếp từ thanh bài tập bên cạnh (Cột 1), không để hiện popup nữa
      return
    }
    setActiveSlotId(slot.id)
    if (slot.locked) {
      return
    }
    if (slot.category) {
      setActiveCategory(slot.category)
    }
    setIsPaletteModalOpen(true)
  }

  // Xử lý chọn block (từ Palette click 1-chạm hoặc drop)
  const handleSelectBlock = (block: CreativeBlock) => {
    playInstantSound('correct')
    if (block.category === 'subject') {
      setSelectedSubjectOverride(block.label)
    }
    setSlots((prev) => {
      const next = prev.map((slot) => {
        // Nếu chọn block subject: cập nhật slot-subject
        if (block.category === 'subject' && (slot.id === 'slot-subject' || slot.category === 'subject')) {
          return {
            ...slot,
            currentBlock: block,
            subjectImage: getSubjectImage(block.label),
          }
        }
        // Không ghi đè slot đã bị khóa cứng (trừ khi là subject vừa xử lý ở trên)
        if (slot.locked) return slot
        if (slot.id === activeSlotId || slot.category === block.category) {
          return { ...slot, currentBlock: block }
        }
        return slot
      })
      syncPrompt(next)
      return next
    })

    // Chọn xong từ là đóng popup ngay, quay lại màn hình chính, tuyệt đối không nhảy sang chìa khóa khác
    setIsPaletteModalOpen(false)
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

    // Khi gỡ, đưa tiêu điểm về lại ô đó để trẻ dễ chọn lại
    setActiveSlotId(slotId)
    const targetSlot = slots.find((s) => s.id === slotId)
    if (targetSlot?.category && targetSlot.category !== 'subject') {
      setActiveCategory(targetSlot.category)
    }
  }

  const selectedBlockIds = slots
    .map((s) => s.currentBlock?.id)
    .filter((id): id is string => !!id)

  const currentActiveSlot = slots.find((s) => s.id === activeSlotId)

  return (
    <div data-testid="magic-keys-engine" className="flex w-full min-h-0 flex-col gap-2.5">
      {/* Tầng 1: Bố cục 3 Cột (Món đồ - 4 Chìa khóa - Tranh AI Canvas) */}
      {practiceSlot || canvasSlot ? (
        <div className="grid w-full min-h-0 items-start gap-2.5 md:grid-cols-[minmax(200px,250px)_minmax(0,1fr)] xl:grid-cols-[minmax(200px,230px)_minmax(400px,1fr)_minmax(340px,520px)]">
          {/* CỘT 1 (BÊN TRÁI): MÓN ĐỒ BÉ VẼ */}
          {practiceSlot && (
            <div className="w-full min-w-0 self-start md:col-start-1 md:row-start-1 xl:col-start-1 xl:row-start-1">
              {practiceSlot}
            </div>
          )}

          {/* CỘT 2 (Ở GIỮA): 4 CHÌA KHÓA VÀNG AKI */}
          <div className="min-w-0 self-start md:col-start-2 md:row-start-1 xl:col-start-2 xl:row-start-1">
            <BlockSlotTray
              title="4 Chìa Khóa Vàng AKI"
              subtitle="Chạm ô để đổi từ gợi ý"
              slots={slots}
              activeSlotId={activeSlotId}
              onSlotClick={handleSlotClick}
              onRemoveBlock={handleRemoveBlock}
              onDropBlock={handleDropBlock}
              isGrid2x2={true}
              className="h-auto border-2 border-amber-200/70 bg-slate-50/90"
            />
          </div>

          {/* THANH CÂU LỆNH & NÚT VẼ:
              - Khi < xl: Nằm ở Hàng 2 (md:col-span-2 md:row-start-2), NGAY DƯỚI 4 CHÌA KHÓA VÀ TRÊN TRANH SÁNG TẠO!
              - Khi >= xl: Nằm ở Hàng 2 (xl:col-span-3 xl:row-start-2), trải dài dưới cả 3 cột!
          */}
          {promptSlot && (
            <div className="w-full min-w-0 md:col-span-2 md:row-start-2 xl:col-span-3 xl:row-start-2">
              {promptSlot}
            </div>
          )}

          {/* CỘT 3: KHUNG PREVIEW TRANH VẼ (PHẦN ẢNH)
              - Khi < xl: Nằm ở Hàng 3 (md:col-span-2 md:row-start-3), TRÀN VIỀN 100% (ngang bằng tổng chiều dài Món đồ + 4 Chìa khóa, loại bỏ hoàn toàn md:max-w-2xl và md:justify-self-center)!
              - Khi >= xl: Nằm ở Cột 3, Hàng 1 (xl:col-span-1 xl:col-start-3 xl:row-start-1)!
          */}
          {canvasSlot && (
            <div className="w-full min-w-0 self-start md:col-span-2 md:row-start-3 xl:col-span-1 xl:col-start-3 xl:row-start-1">
              {canvasSlot}
            </div>
          )}
        </div>
      ) : (
        <>
          <BlockSlotTray
            title="4 Chìa Khóa Vàng AKI"
            subtitle="Chạm ô để đổi từ gợi ý"
            slots={slots}
            activeSlotId={activeSlotId}
            onSlotClick={handleSlotClick}
            onRemoveBlock={handleRemoveBlock}
            onDropBlock={handleDropBlock}
          />
          {promptSlot}
        </>
      )}

      {/* MODAL DIALOG SOFT CLAY CHỌN TỪ CHO 4 CHÌA KHÓA VÀNG (BẢO TOÀN BLOCKPALETTE TRONG DOM) */}
      <div
        className={cn(
          isPaletteModalOpen
            ? 'fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4'
            : 'hidden'
        )}
        onClick={() => setIsPaletteModalOpen(false)}
      >
        <div
          data-testid="magic-keys-palette-modal"
          className="w-full max-w-xl bg-white rounded-3xl border-3 border-amber-300 shadow-2xl p-4 sm:p-5 flex flex-col gap-3 relative max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-2 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {activeCategory === 'color-shape'
                  ? '🎨'
                  : activeCategory === 'action'
                  ? '🏃'
                  : activeCategory === 'context'
                  ? '🌲'
                  : '🔑'}
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                  {activeCategory === 'color-shape'
                    ? '🎨 Chọn Đặc Điểm (Trông thế nào)'
                    : activeCategory === 'action'
                    ? '🏃 Chọn Hành Động (Đang làm gì)'
                    : activeCategory === 'context'
                    ? '🌲 Chọn Bối Cảnh (Ở đâu?)'
                    : '🔑 Chọn Từ Gợi Ý'}
                </h3>
                <p className="text-[11px] font-bold text-amber-900">
                  Dành cho: <span className="underline decoration-amber-400">{effectiveSubject}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              data-testid="close-palette-modal-btn"
              onClick={() => setIsPaletteModalOpen(false)}
              className="size-8 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-600 flex items-center justify-center text-sm font-black transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Modal Body: Thẻ bài chỉ riêng cho chìa khóa đang chọn (ẩn header & categories của palette) */}
          <div className="w-full">
            <BlockPalette
              title="Khay Thẻ Bài 4 Nhóm Chìa Khóa"
              subtitle="Chạm 1 cái là từ bay vào ô chìa khóa"
              blocks={currentSlotBlocks}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              selectedBlockIds={selectedBlockIds}
              onSelectBlock={handleSelectBlock}
              categories={categories}
              hideHeader={true}
              hideCategories={true}
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 mt-1">
            {currentActiveSlot?.currentBlock && !currentActiveSlot.locked ? (
              <button
                type="button"
                onClick={() => {
                  handleRemoveBlock(currentActiveSlot.id)
                  playInstantSound('click')
                }}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-black flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>🗑️ Bỏ chọn từ này</span>
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={() => setIsPaletteModalOpen(false)}
              className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-clay active:scale-95 transition-all cursor-pointer"
            >
              <span>✨ Xong rồi, xem tranh! →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
