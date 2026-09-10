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
  title = 'Khay Thẻ Bài Ma Thuật',
  subtitle = 'Chạm hoặc Kéo thẻ vào ô trống để ghép câu lệnh',
  blocks,
  selectedBlockIds = [],
  onSelectBlock,
  categories,
  activeCategory,
  onCategoryChange,
  className,
}) => {
  const [internalCategory, setInternalCategory] = useState<string>('all')
  const currentCategory = activeCategory !== undefined ? activeCategory : internalCategory
  const setCategory = onCategoryChange || setInternalCategory

  const filteredBlocks =
    currentCategory && currentCategory !== 'all'
      ? blocks.filter((b) => b.category === currentCategory)
      : blocks

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
        'w-full bg-white/95 rounded-2xl border-2 border-indigo-100 p-3.5 sm:p-4 shadow-xs flex flex-col gap-3 text-left',
        className
      )}
    >
      {/* Header Khay Thẻ */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-slate-800">
            <Sparkles size={14} className="text-amber-500" />
            <span>{title}</span>
          </div>
          {subtitle && (
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Danh mục filter nếu có */}
        {categories && categories.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setCategory('all')}
              className={cn(
                'px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer min-h-[32px]',
                currentCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={cn(
                  'px-2.5 py-1 rounded-xl text-xs font-black inline-flex items-center gap-1 transition-all cursor-pointer min-h-[32px]',
                  currentCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {cat.icon && <span>{cat.icon}</span>}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid danh sách các Thẻ Bài Soft Clay */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {filteredBlocks.map((block) => {
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
                'group relative min-h-[52px] px-3 py-2 rounded-2xl border-2 select-none cursor-pointer',
                'flex items-center justify-between gap-2 text-left transition-all duration-150 active:scale-95',
                isSelected ? color.active : color.idle
              )}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {block.icon && (
                  <span className="text-lg shrink-0 group-hover:scale-110 transition-transform">
                    {block.icon}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black truncate leading-snug">
                    {block.label}
                  </div>
                  {block.hint && (
                    <div
                      className={cn(
                        'text-[10px] font-semibold truncate leading-tight mt-0.5',
                        isSelected ? 'text-white/80' : 'text-slate-500'
                      )}
                    >
                      {block.hint}
                    </div>
                  )}
                </div>
              </div>

              {/* Status indicator */}
              <div className="shrink-0 flex items-center">
                {isSelected ? (
                  <div className="size-5 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-xs">
                    <Check size={12} strokeWidth={3} />
                  </div>
                ) : block.badge ? (
                  <span
                    className={cn(
                      'text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider',
                      color.badge
                    )}
                  >
                    {block.badge}
                  </span>
                ) : (
                  <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    +
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
