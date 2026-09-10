import React from 'react'
import { X, Sparkles, CheckCircle2 } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { playInstantSound } from '../../LessonInteractiveSidebar'
import type { BlockSlot, CreativeBlock } from '../types'

export interface BlockSlotTrayProps {
  slots: BlockSlot[]
  onRemoveBlock: (slotId: string) => void
  onDropBlock?: (slotId: string, block: CreativeBlock) => void
  onSlotClick?: (slot: BlockSlot) => void
  title?: string
  subtitle?: string
  isComplete?: boolean
  className?: string
}

const SLOT_COLOR_CLASSES: Record<
  string,
  {
    empty: string
    filled: string
    badge: string
  }
> = {
  sky: {
    empty: 'border-sky-300/80 bg-sky-50/40 text-sky-700 hover:border-sky-400 hover:bg-sky-50/70',
    filled: 'border-sky-300 bg-sky-50 text-sky-950 shadow-xs',
    badge: 'bg-sky-100 text-sky-800',
  },
  amber: {
    empty: 'border-amber-300/80 bg-amber-50/40 text-amber-700 hover:border-amber-400 hover:bg-amber-50/70',
    filled: 'border-amber-300 bg-amber-50 text-amber-950 shadow-xs',
    badge: 'bg-amber-100 text-amber-800',
  },
  mint: {
    empty: 'border-emerald-300/80 bg-emerald-50/40 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50/70',
    filled: 'border-emerald-300 bg-emerald-50 text-emerald-950 shadow-xs',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  rose: {
    empty: 'border-rose-300/80 bg-rose-50/40 text-rose-700 hover:border-rose-400 hover:bg-rose-50/70',
    filled: 'border-rose-300 bg-rose-50 text-rose-950 shadow-xs',
    badge: 'bg-rose-100 text-rose-800',
  },
  purple: {
    empty: 'border-purple-300/80 bg-purple-50/40 text-purple-700 hover:border-purple-400 hover:bg-purple-50/70',
    filled: 'border-purple-300 bg-purple-50 text-purple-950 shadow-xs',
    badge: 'bg-purple-100 text-purple-800',
  },
  indigo: {
    empty: 'border-indigo-300/80 bg-indigo-50/40 text-indigo-700 hover:border-indigo-400 hover:bg-indigo-50/70',
    filled: 'border-indigo-300 bg-indigo-50 text-indigo-950 shadow-xs',
    badge: 'bg-indigo-100 text-indigo-800',
  },
  slate: {
    empty: 'border-slate-300/80 bg-slate-50/50 text-slate-600 hover:border-slate-400 hover:bg-slate-100/60',
    filled: 'border-slate-300 bg-white text-slate-900 shadow-xs',
    badge: 'bg-slate-100 text-slate-700',
  },
}

export const BlockSlotTray: React.FC<BlockSlotTrayProps> = ({
  slots,
  onRemoveBlock,
  onDropBlock,
  onSlotClick,
  title = 'Khay Ghép Thẻ Khóa',
  subtitle,
  isComplete,
  className,
}) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, slotId: string) => {
    e.preventDefault()
    try {
      const dataStr = e.dataTransfer.getData('application/json')
      if (dataStr) {
        const block: CreativeBlock = JSON.parse(dataStr)
        playInstantSound('click')
        if (onDropBlock) {
          onDropBlock(slotId, block)
        }
      }
    } catch {
      // fallback
    }
  }

  const handleRemove = (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    playInstantSound('click')
    onRemoveBlock(slotId)
  }

  const allRequiredFilled = slots.every((s) => !s.required || s.currentBlock)
  const completeState = isComplete ?? allRequiredFilled

  return (
    <div
      data-testid="block-slot-tray"
      className={cn(
        'w-full bg-slate-50/80 rounded-2xl border-2 p-3 sm:p-4 text-left transition-all duration-300 flex flex-col gap-2.5',
        completeState
          ? 'border-emerald-300 bg-emerald-50/20 shadow-xs'
          : 'border-slate-200 shadow-2xs',
        className
      )}
    >
      {/* Header Khay Slot */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-base">🧩</span>
          <span className="font-black text-xs sm:text-sm text-slate-800">{title}</span>
          {subtitle && (
            <span className="text-[11px] font-semibold text-slate-400 ml-1 hidden sm:inline">
              ({subtitle})
            </span>
          )}
        </div>

        {completeState && (
          <div className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full animate-fade-in">
            <CheckCircle2 size={12} strokeWidth={3} />
            <span>Đã sẵn sàng!</span>
          </div>
        )}
      </div>

      {/* Danh sách các ô Slot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {slots.map((slot, index) => {
          const color =
            SLOT_COLOR_CLASSES[slot.colorScheme || 'sky'] || SLOT_COLOR_CLASSES.sky
          const hasBlock = !!slot.currentBlock

          return (
            <div
              key={slot.id}
              data-testid={`slot-${slot.id}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, slot.id)}
              onClick={() => onSlotClick && onSlotClick(slot)}
              className={cn(
                'min-h-[64px] rounded-2xl border-2 p-2.5 flex flex-col justify-between transition-all duration-200 select-none relative',
                hasBlock
                  ? cn(color.filled, 'border-solid')
                  : cn(color.empty, 'border-dashed cursor-pointer')
              )}
            >
              {/* Nhãn hướng dẫn ô slot */}
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-black tracking-wide uppercase opacity-75">
                  {slot.label || `Ô số ${index + 1}`}
                </span>
                {slot.required && !hasBlock && (
                  <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1 rounded-sm">
                    Bắt buộc
                  </span>
                )}
              </div>

              {/* Nội dung slot */}
              {hasBlock && slot.currentBlock ? (
                <div className="flex items-center justify-between gap-1.5 flex-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {slot.currentBlock.icon && (
                      <span className="text-base shrink-0">
                        {slot.currentBlock.icon}
                      </span>
                    )}
                    <span className="text-xs font-black text-slate-900 truncate">
                      {slot.currentBlock.label}
                    </span>
                  </div>

                  {/* Nút X gỡ thẻ */}
                  <button
                    type="button"
                    title="Gỡ thẻ này ra"
                    data-testid={`slot-remove-${slot.id}`}
                    onClick={(e) => handleRemove(slot.id, e)}
                    className="size-6 rounded-full bg-slate-200/80 hover:bg-rose-100 hover:text-rose-700 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center py-1 text-slate-400">
                  <span className="text-xs font-semibold text-center italic">
                    {slot.hint || '+ Chạm thẻ để gắn'}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
