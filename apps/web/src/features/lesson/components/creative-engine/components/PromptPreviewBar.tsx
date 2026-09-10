import React, { useState } from 'react'
import { Sparkles, ArrowRight, RotateCcw, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { playInstantSound } from '../../LessonInteractiveSidebar'
import type { CreativeBlock } from '../types'

export interface PromptPreviewBarProps {
  blocks: CreativeBlock[]
  generatedPrompt: string
  onReset?: () => void
  lockedFeatures?: string[]
  className?: string
}

export const PromptPreviewBar: React.FC<PromptPreviewBarProps> = ({
  blocks,
  generatedPrompt,
  onReset,
  lockedFeatures = [],
  className,
}) => {
  const [showFullText, setShowFullText] = useState(false)

  const handleReset = () => {
    playInstantSound('click')
    if (onReset) onReset()
  }

  return (
    <div
      data-testid="prompt-preview-bar"
      className={cn(
        'w-full bg-linear-to-r from-amber-50/90 via-orange-50/70 to-pink-50/90 rounded-2xl border-2 border-amber-200/90 p-3 sm:p-3.5 shadow-2xs flex flex-col gap-2 text-left',
        className
      )}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
          <Sparkles size={14} className="text-amber-600" />
          <span>Chuỗi Câu Lệnh Ma Thuật (Block-chain)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút bật/tắt xem câu lệnh chi tiết */}
          <button
            type="button"
            onClick={() => setShowFullText(!showFullText)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 cursor-pointer bg-white/70 hover:bg-white px-2 py-0.5 rounded-lg border border-amber-200 transition-colors"
          >
            {showFullText ? <EyeOff size={11} /> : <Eye size={11} />}
            <span>{showFullText ? 'Thu gọn' : 'Xem câu lệnh'}</span>
          </button>

          {/* Nút Reset nếu có block */}
          {blocks.length > 0 && onReset && (
            <button
              type="button"
              onClick={handleReset}
              title="Làm mới khay ghép thẻ"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 cursor-pointer bg-white/70 hover:bg-rose-50 px-2 py-0.5 rounded-lg border border-slate-200 transition-colors"
            >
              <RotateCcw size={11} />
              <span>Xếp lại</span>
            </button>
          )}
        </div>
      </div>

      {/* Dải chuỗi các Block liên kết */}
      <div className="flex items-center gap-1.5 flex-wrap min-h-[36px]">
        {/* Khóa đặc điểm VIP dán sẵn */}
        {lockedFeatures.map((feat, idx) => (
          <React.Fragment key={`feat-${idx}`}>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-100 border border-purple-300 text-purple-900 text-xs font-black shadow-2xs">
              <span>🔒</span>
              <span>{feat}</span>
            </span>
            <span className="text-amber-400 font-bold text-xs">+</span>
          </React.Fragment>
        ))}

        {/* Các block được chọn */}
        {blocks.length === 0 ? (
          <div className="text-xs font-medium text-amber-900/60 italic py-1">
            Chưa có thẻ nào được gắn... Bé hãy chạm hoặc kéo các thẻ phía trên nhé! 👇
          </div>
        ) : (
          blocks.map((b, idx) => (
            <React.Fragment key={b.id || idx}>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-amber-300 text-amber-950 text-xs font-black shadow-2xs animate-fade-in">
                {b.icon && <span className="text-sm">{b.icon}</span>}
                <span>{b.label}</span>
              </span>
              {idx < blocks.length - 1 && (
                <ArrowRight size={12} className="text-amber-500 stroke-[3]" />
              )}
            </React.Fragment>
          ))
        )}
      </div>

      {/* Preview văn bản câu lệnh hoàn chỉnh khi toggle hoặc mặc định */}
      {showFullText && generatedPrompt && (
        <div className="mt-1 p-2.5 bg-white rounded-xl border border-amber-200/80 text-xs font-bold text-slate-800 leading-relaxed shadow-inner">
          <span className="text-amber-600 font-black mr-1.5">AKI sẽ vẽ:</span>
          <span>"{generatedPrompt}"</span>
        </div>
      )}
    </div>
  )
}
