import React, { useState } from 'react'
import { Sparkles, Check } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { playInstantSound } from '../../LessonInteractiveSidebar'
import type { CreativeBlock } from '../types'

export interface BlockPaletteProps {
  title?: string
  subtitle?: string
  blocks: CreativeBlock[]
  selectedBlockIds?: string[]
  onSelectBlock: (block: CreativeBlock) => void
  categories?: Array<{ id: string; label: string; icon?: string }>
  activeCategory?: string
  onCategoryChange?: (category: string) => void
  className?: string
  hideHeader?: boolean
  hideCategories?: boolean
}

const COLOR_CLASSES: Record<
  string,
  {
    idle: string
    active: string
    badge: string
  }
> = {
  sky: {
    idle: 'bg-sky-50 hover:bg-sky-100/90 border-sky-200 text-sky-950 shadow-xs hover:border-sky-300',
    active: 'bg-sky-500 border-sky-600 text-white shadow-md scale-[1.02]',
    badge: 'bg-sky-200/80 text-sky-900',
  },
  amber: {
    idle: 'bg-amber-50 hover:bg-amber-100/90 border-amber-200 text-amber-950 shadow-xs hover:border-amber-300',
    active: 'bg-amber-500 border-amber-600 text-white shadow-md scale-[1.02]',
    badge: 'bg-amber-200/80 text-amber-900',
  },
  mint: {
    idle: 'bg-emerald-50 hover:bg-emerald-100/90 border-emerald-200 text-emerald-950 shadow-xs hover:border-emerald-300',
    active: 'bg-emerald-500 border-emerald-600 text-white shadow-md scale-[1.02]',
    badge: 'bg-emerald-200/80 text-emerald-900',
  },
  rose: {
    idle: 'bg-rose-50 hover:bg-rose-100/90 border-rose-200 text-rose-950 shadow-xs hover:border-rose-300',
    active: 'bg-rose-500 border-rose-600 text-white shadow-md scale-[1.02]',
    badge: 'bg-rose-200/80 text-rose-900',
  },
  purple: {
    idle: 'bg-purple-50 hover:bg-purple-100/90 border-purple-200 text-purple-950 shadow-xs hover:border-purple-300',
    active: 'bg-purple-500 border-purple-600 text-white shadow-md scale-[1.02]',
    badge: 'bg-purple-200/80 text-purple-900',
  },
  indigo: {
    idle: 'bg-indigo-50 hover:bg-indigo-100/90 border-indigo-200 text-indigo-950 shadow-xs hover:border-indigo-300',
    active: 'bg-indigo-500 border-indigo-600 text-white shadow-md scale-[1.02]',
    badge: 'bg-indigo-200/80 text-indigo-900',
  },
  slate: {
    idle: 'bg-slate-50 hover:bg-slate-100/90 border-slate-200 text-slate-800 shadow-xs hover:border-slate-300',
    active: 'bg-slate-700 border-slate-800 text-white shadow-md scale-[1.02]',
    badge: 'bg-slate-200 text-slate-700',
  },
}

export const BlockPalette: React.FC<BlockPaletteProps> = ({
  title = 'Khay Thẻ Bài 4 Nhóm Chìa Khóa',
  subtitle = 'Chạm 1 cái để gắn vào ô chìa khóa',
  blocks,
  selectedBlockIds = [],
  onSelectBlock,
  categories,
  activeCategory: propActiveCategory,
  onCategoryChange,
  className,
  hideHeader,
  hideCategories,
}) => {
  const [internalCategory, setInternalCategory] = useState<string>('all')
  const effectiveCategory = propActiveCategory !== undefined ? propActiveCategory : internalCategory
  const currentCategory =
    effectiveCategory === 'all' && categories && categories.length > 0
      ? categories[0].id
      : effectiveCategory
  const setCategory = onCategoryChange || setInternalCategory

  const filteredBlocks =
    categories && categories.length > 0 && currentCategory && currentCategory !== 'all'
      ? blocks.filter((b) => b.category === currentCategory)
      : blocks

  const displayBlocks = filteredBlocks.slice(0, 6)

  const handleBlockClick = (block: CreativeBlock) => {
    playInstantSound('click')
    onSelectBlock(block)
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, block: CreativeBlock) => {
    try {
      e.dataTransfer.setData('application/json', JSON.stringify(block))
      e.dataTransfer.setData('text/plain', block.id)
    } catch {
      // safe fallback for older browsers or jsdom
    }
  }

  return (
    <div
      data-testid="block-palette"
      className={cn(
        'w-full bg-slate-50/60 rounded-2xl border border-slate-100 p-1.5 sm:p-2 shadow-2xs flex flex-col gap-1 text-left shrink-0',
        className
      )}
    >
      <span className="sr-only">{title || 'Khay Thẻ Bài 4 Nhóm Chìa Khóa'}</span>

      {/* Header Khay Thẻ Tinh Gọn 1 Dòng */}
      {!hideHeader && (
        <div className="flex items-center justify-between gap-1.5 px-0.5">
          <div className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-500 shrink-0" />
            <span className="font-black text-xs text-slate-800 tracking-tight">{title}</span>
            {subtitle && (
              <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline truncate">
                · {subtitle}
              </span>
            )}
          </div>

          {/* Danh mục filter nếu có */}
          {!hideCategories && categories && categories.length > 0 && (
            <div className="flex items-center gap-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    'px-1.5 py-0.5 rounded-lg text-[10px] font-black inline-flex items-center gap-1 transition-all cursor-pointer min-h-[22px]',
                    currentCategory === cat.id
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  )}
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dải Thẻ Từ 1 Chạm (Quick Word Chips - Tối đa 6 thẻ mỗi danh mục, không icon, cực kỳ gọn gàng) */}
      <div className="flex flex-wrap items-center gap-2 py-1 min-h-[48px] sm:min-h-[56px]">
        {displayBlocks.map((block) => {
          const isSelected = selectedBlockIds.includes(block.id)
          const color = COLOR_CLASSES[block.colorScheme || 'sky'] || COLOR_CLASSES.sky

          return (
            <div
              key={block.id}
              role="button"
              tabIndex={0}
              data-testid={`block-card-${block.id}`}
              draggable
              onDragStart={(e) => handleDragStart(e, block)}
              onClick={() => handleBlockClick(block)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleBlockClick(block)
                }
              }}
              className={cn(
                'group relative min-h-[36px] px-3 py-1.5 rounded-xl border-2 select-none shrink-0 cursor-pointer active:scale-95 hover:scale-102 transition-all duration-150 flex items-center justify-between gap-1.5 text-left shadow-2xs text-xs whitespace-nowrap',
                isSelected ? color.active : color.idle
              )}
            >
              <span className="text-xs font-black leading-tight">{block.label}</span>

              {/* Status indicator */}
              {isSelected ? (
                <div className="size-4 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-xs shrink-0 ml-1">
                  <Check size={10} strokeWidth={3} />
                </div>
              ) : (
                <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity font-bold text-amber-600 ml-1 shrink-0">
                  +
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
