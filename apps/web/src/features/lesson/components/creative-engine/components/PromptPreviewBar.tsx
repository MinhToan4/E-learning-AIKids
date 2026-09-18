import React from 'react'
import { RotateCcw } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { playInstantSound } from '../../LessonInteractiveSidebar'
import type { CreativeBlock, CreativeEngineMode } from '../types'

export interface PromptPreviewBarProps {
  blocks?: CreativeBlock[]
  generatedPrompt: string
  onReset?: () => void
  lockedFeatures?: string[]
  className?: string
  stepQuickPrompt?: string
  stepQuickLabel?: string
  onQuickPromptClick?: (prompt: string) => void
  mode?: CreativeEngineMode
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
  mode = 'magic-keys',
}) => {
  const handleReset = () => {
    playInstantSound('click')
    if (onReset) onReset()
  }

  const hasAllBlocks = blocks.length >= 4
  const isPromptAlreadyIncluded = Boolean(
    hasAllBlocks ||
      (generatedPrompt &&
        stepQuickPrompt &&
        generatedPrompt.toLowerCase().includes(stepQuickPrompt.toLowerCase().trim()))
  )

  return (
    <div
      data-testid="prompt-preview-bar"
      className={cn(
        'flex flex-col justify-center gap-1.5 bg-linear-to-r from-amber-50/90 via-white to-amber-50/80 border-2 border-amber-200/90 rounded-2xl px-3 py-2 shadow-clay-xs text-left transition-all min-h-[58px] sm:min-h-[64px]',
        className
      )}
    >
      {/* Tầng 1: Header Tiêu Đề & Công Cụ Gợi Ý Nhanh */}
      <div className="flex items-center justify-between gap-2 w-full min-w-0">
        <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 uppercase tracking-wide shrink-0">
          <span className="text-amber-500 text-sm">✨</span>
          <span>Câu lệnh:</span>
          {blocks.length > 0 && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100/90 px-1.5 py-0.5 rounded-md border border-amber-200">
              {mode === 'magic-keys'
                ? `${blocks.length}/4 Chìa Khóa`
                : mode === 'prompt-doctor'
                ? blocks.length >= 2
                  ? 'Đã kê đơn thuốc ✨'
                  : 'Chờ kê đơn thuốc 📋'
                : `${blocks.length} Thẻ ghép`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Dải gợi ý nhanh 1-chạm: Đặt ở góc phải header, hiển thị rõ ràng không bị chen lấn */}
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
                'px-2.5 py-1 rounded-xl bg-linear-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-950 font-black text-xs border border-amber-500/60 shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 shrink-0',
                isPromptAlreadyIncluded && 'hidden'
              )}
              title="Chạm để thử ngay câu lệnh này"
            >
              <span className="shrink-0">👉 {stepQuickLabel || 'Chạm để thử ngay:'}</span>
              <span className="underline decoration-1 font-black">"{stepQuickPrompt}"</span>
            </button>
          )}

          {/* Nút Reset gỡ nhanh nếu có block */}
          {blocks.length > 0 && onReset && (
            <button
              type="button"
              onClick={handleReset}
              title="Làm mới câu lệnh"
              className="size-6 sm:size-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Tầng 2: Dòng Chảy Thần Chú (Hiển thị 100% đầy đủ chữ, dòng chảy mềm mại) */}
      <div className="w-full min-w-0 text-xs sm:text-[13px] font-medium text-slate-800 leading-relaxed">
        {blocks && blocks.length > 0 ? (
          <div
            data-testid="prompt-linked-blocks"
            className="flex flex-wrap items-baseline gap-1 py-0.5 max-h-[72px] sm:max-h-[82px] overflow-y-auto pr-1 scrollbar-thin [scrollbar-width:thin]"
          >
            {blocks.map((block, idx) => {
              const isFirst = idx === 0
              const colorMap: Record<string, string> = {
                subject: 'bg-sky-100/90 text-sky-950 border-sky-300',
                'color-shape': 'bg-amber-100/90 text-amber-950 border-amber-300',
                action: 'bg-emerald-100/90 text-emerald-950 border-emerald-300',
                context: 'bg-rose-100/90 text-rose-950 border-rose-300',
                modifier: 'bg-purple-100/90 text-purple-950 border-purple-300',
                expression: 'bg-amber-100/90 text-amber-950 border-amber-300',
              }
              const colorClass =
                colorMap[block.category] || 'bg-amber-100/90 text-amber-950 border-amber-300'
              const keyNumber = idx + 1

              return (
                <React.Fragment key={block.id || idx}>
                  {!isFirst && (
                    <span className="text-amber-500 font-black text-xs select-none px-0.5">
                      +
                    </span>
                  )}
                  <span
                    data-testid={`prompt-block-chip-${block.id || idx}`}
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border font-bold text-[11px] sm:text-xs max-w-[260px] sm:max-w-[340px] truncate transition-all hover:scale-102 shadow-2xs',
                      colorClass
                    )}
                    title={
                      mode === 'magic-keys'
                        ? `Chìa Khóa ${keyNumber}: ${block.text || block.label}`
                        : mode === 'prompt-doctor'
                        ? block.category === 'subject'
                          ? `Bệnh án câu lệnh cũ: ${block.text || block.label}`
                          : `Đơn thuốc chữa lành: ${block.text || block.label}`
                        : block.label || block.text
                    }
                  >
                    <span className="text-[10px] opacity-75 font-black shrink-0">
                      {mode === 'magic-keys' && `🔑 ${keyNumber}`}
                      {mode === 'prompt-doctor' && block.category === 'subject' && '📜 Bệnh án: '}
                      {mode === 'prompt-doctor' && block.category !== 'subject' && '💊 Đơn thuốc: '}
                      {mode !== 'magic-keys' && mode !== 'prompt-doctor' && (block.icon || '✨')}
                    </span>
                    <span className="leading-snug truncate">{block.text || block.label}</span>
                  </span>
                </React.Fragment>
              )
            })}
            <span className="sr-only">{generatedPrompt}</span>
          </div>
        ) : generatedPrompt ? (
          <span className="break-words text-slate-900 font-bold text-xs sm:text-[13px] leading-relaxed">
            {generatedPrompt}
          </span>
        ) : (
          <span className="text-slate-400 italic font-medium text-xs sm:text-[13px]">
            Chạm vào các chìa khóa ở trên để ghép câu lệnh ma thuật...
          </span>
        )}
      </div>
    </div>
  )
}
