import React, { useState } from 'react'
import { Sparkles, ArrowRight, RotateCcw, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { playInstantSound } from '../../LessonInteractiveSidebar'
import type { CreativeBlock } from '../types'

export interface PromptPreviewBarProps {
  blocks?: CreativeBlock[]
  generatedPrompt: string
  onReset?: () => void
  lockedFeatures?: string[]
  className?: string
  stepQuickPrompt?: string
  stepQuickLabel?: string
  onQuickPromptClick?: (prompt: string) => void
}

export const PromptPreviewBar: React.FC<PromptPreviewBarProps> = ({
  blocks = [],
  generatedPrompt,
  onReset,
  lockedFeatures = [],
  className,
  stepQuickPrompt,
  stepQuickLabel,
  onQuickPromptClick,
}) => {
  const handleReset = () => {
    playInstantSound('click')
    if (onReset) onReset()
  }

  const isPromptAlreadyIncluded = Boolean(
    generatedPrompt &&
      stepQuickPrompt &&
      generatedPrompt.toLowerCase().includes(stepQuickPrompt.toLowerCase().trim())
  )

  return (
    <div
      data-testid="prompt-preview-bar"
      className={cn(
        'flex items-center gap-2 bg-amber-50/80 border border-amber-200/90 rounded-2xl px-3 py-1.5 shadow-2xs min-h-[46px] text-left transition-all',
        className
      )}
    >
      {/* Icon tia sáng & Nội dung câu lệnh tự ghép */}
      <span className="text-sm shrink-0 text-amber-600">✨</span>

      <div className="flex-1 min-w-0 text-xs sm:text-sm md:text-base font-bold text-slate-800 leading-snug">
        {blocks && blocks.length > 0 ? (
          <div
            data-testid="prompt-linked-blocks"
            className="flex flex-wrap items-center gap-1.5 py-0.5"
          >
            {blocks.map((block, idx) => {
              const isFirst = idx === 0
              const colorMap: Record<string, string> = {
                subject: 'bg-sky-100/90 text-sky-950 border-sky-300 shadow-2xs',
                'color-shape': 'bg-amber-100/90 text-amber-950 border-amber-300 shadow-2xs',
                action: 'bg-emerald-100/90 text-emerald-950 border-emerald-300 shadow-2xs',
                context: 'bg-rose-100/90 text-rose-950 border-rose-300 shadow-2xs',
              }
              const colorClass =
                colorMap[block.category] || 'bg-amber-100/90 text-amber-950 border-amber-300'
              const keyNumber = idx + 1

              return (
                <React.Fragment key={block.id || idx}>
                  {!isFirst && (
                    <span className="text-amber-500 font-black text-sm select-none px-0.5">
                      +
                    </span>
                  )}
                  <div
                    data-testid={`prompt-block-chip-${block.id || idx}`}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border font-black text-xs sm:text-[13px] transition-all hover:scale-102',
                      colorClass
                    )}
                    title={`Chìa Khóa ${keyNumber}: ${block.label || block.text}`}
                  >
                    <span className="text-[10px] opacity-75 font-bold shrink-0">
                      🔑 {keyNumber}
                    </span>
                    <span className="leading-snug break-words">{block.text || block.label}</span>
                  </div>
                </React.Fragment>
              )
            })}
            <span className="sr-only line-clamp-2 sm:line-clamp-3 break-words text-slate-900">
              {generatedPrompt}
            </span>
          </div>
        ) : generatedPrompt ? (
          <span className="line-clamp-2 sm:line-clamp-3 break-words text-slate-900 font-bold">
            {generatedPrompt}
          </span>
        ) : (
          <span className="text-slate-400 italic font-medium line-clamp-1">
            Chạm vào các chìa khóa ở trên để ghép câu lệnh ma thuật...
          </span>
        )}
      </div>

      {/* Dải gợi ý nhanh 1-chạm nếu có stepQuickPrompt */}
      {stepQuickPrompt && (
        <button
          type="button"
          data-testid="studio-step-quick-btn"
          onClick={() => {
            if (onQuickPromptClick) {
              onQuickPromptClick(stepQuickPrompt)
            }
          }}
          className={cn(
            'shrink-0 px-2.5 py-1 rounded-xl bg-linear-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-950 font-black text-xs sm:text-sm border border-amber-500/60 shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 max-w-[200px] sm:max-w-xs truncate',
            isPromptAlreadyIncluded && 'hidden'
          )}
          title="Chạm để thử ngay câu lệnh này"
        >
          <span className="shrink-0">👉 {stepQuickLabel || 'Chạm để thử ngay:'}</span>
          <span className="underline decoration-1 font-black truncate">"{stepQuickPrompt}"</span>
        </button>
      )}

      {/* Nút Reset gỡ nhanh nếu có block */}
      {blocks.length > 0 && onReset && (
        <button
          type="button"
          onClick={handleReset}
          title="Làm mới câu lệnh"
          className="size-7 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer shrink-0"
        >
          <RotateCcw size={12} />
        </button>
      )}
    </div>
  )
}
