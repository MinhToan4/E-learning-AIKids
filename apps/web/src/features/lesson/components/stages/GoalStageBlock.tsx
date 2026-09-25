import React from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/Button'
import type { JourneyStageDefinition, GoalStageConfig } from '../../types/stage-schema'
import { GOAL_CARD_STYLES } from '../../lib/stage-view-utils'

export interface GoalStageBlockProps {
  stage: JourneyStageDefinition<GoalStageConfig>
  onContinue?: () => void
  onImageClick?: (image: { url: string; title: string; fallbackUrl?: string }) => void
}

export function GoalStageBlock({
  stage,
  onContinue,
  onImageClick,
}: GoalStageBlockProps) {
  const { config } = stage
  const [displayedSrc, setDisplayedSrc] = React.useState<string>(config.imageUrl)

  React.useEffect(() => {
    setDisplayedSrc(config.imageUrl)
  }, [config.imageUrl])

  const handleImageError = () => {
    const fallback = config.fallbackImageUrl || '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2'
    if (displayedSrc !== fallback) {
      setDisplayedSrc(fallback)
    }
  }

  const handleImageZoom = () => {
    onImageClick?.({
      url: displayedSrc,
      title: config.title,
      fallbackUrl: config.fallbackImageUrl,
    })
  }

  return (
    <section
      data-testid="stage-0-goal"
      className="min-w-0 rounded-3xl bg-white p-5 sm:p-7 shadow-xs border border-slate-200/80 flex flex-col gap-5 animate-fade-up"
    >
      {/* Phần 1 - Tiêu đề & Header */}
      <div className="flex flex-col gap-2 shrink-0">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs sm:text-sm font-bold w-fit border border-purple-200/60">
          <Sparkles size={13} className="text-purple-500" />
          <span>Chặng 1: Mục tiêu bài học</span>
        </div>
        <h2 className="min-w-0 break-words text-xl sm:text-2xl font-black text-slate-800 leading-tight">
          {config.title}
        </h2>
      </div>

      {/* Thân nội dung 2 cột */}
      <div className="flex flex-col lg:flex-row gap-5 items-stretch">
        {/* Cột Trái (Ảnh) */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="group relative w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200/80 shadow-xs aspect-16/11 sm:aspect-16/10 flex items-center justify-center">
            <img
              fetchPriority="high"
              decoding="async"
              src={displayedSrc}
              alt={config.title}
              className="block h-auto w-full cursor-pointer object-contain"
              onClick={handleImageZoom}
              onError={handleImageError}
            />
            {/* sr-only text và nút Phóng to */}
            <div className="sr-only">
              <span>🔑</span>
              <span>{config.isFourKeys ? 'Rương 4 Chìa Khóa Thần Kỳ' : 'Chìa Khóa Mục Tiêu'}</span>
              {config.isFourKeys && (
                <div>
                  <span>1. Cái gì</span>
                  <span>2. Trông thế nào</span>
                  <span>3. Đang làm gì</span>
                  <span>4. Ở đâu</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleImageZoom}
              className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-2.5 py-1 rounded-xl backdrop-blur-xs flex items-center gap-1 opacity-90 hover:opacity-100 transition shadow-xs cursor-pointer z-10"
              title="Xem ảnh phóng to"
            >
              <span>🔍 Phóng to</span>
            </button>
          </div>
        </div>

        {/* Cột Phải (Mục tiêu cốt lõi + Box 4 chìa khóa 2x2) */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between gap-4">
          {/* Mục Tiêu Cốt Lõi */}
          <div className="w-full rounded-2xl border border-purple-100 bg-[#f5f0ff] p-4 sm:p-5 shadow-2xs flex items-start gap-3 shrink-0">
            <span className="text-2xl shrink-0 mt-0.5">🎯</span>
            <div className="min-w-0">
              <span className="font-black text-purple-900 block mb-1 text-xs sm:text-sm uppercase tracking-wide">
                Mục Tiêu Cốt Lõi:
              </span>
              <div className="min-w-0 break-words font-semibold text-slate-800 text-sm sm:text-base leading-relaxed">
                {config.goalText}
              </div>
            </div>
          </div>

          {/* Bốn Chiếc Chìa Khóa Vàng (1.1 & 1.2) HOẶC Nội Dung Trọng Tâm Bài Học */}
          {config.isFourKeys && config.formulaCards && config.formulaCards.length > 0 ? (
            <div className="flex flex-col gap-2.5 sm:gap-3 flex-1 min-h-0 justify-center">
              <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-black uppercase tracking-wider text-purple-900 min-w-0 break-words shrink-0">
                <span>🔑 BỐN CHIẾC CHÌA KHÓA MỞ KHÓA CÂU LỆNH (Khớp 1-1 Với Rương):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {config.formulaCards.map((card, idx) => (
                  <div
                    key={card.id}
                    className={cn(
                      'p-2.5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs hover:shadow-xs transition-all flex items-start gap-2.5 min-h-[64px] h-auto',
                      card.bg
                    )}
                  >
                    <img
                      loading="lazy"
                      decoding="async"
                      src={card.image}
                      alt={card.code}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-contain bg-amber-50/60 border border-amber-200/90 p-1 shrink-0 shadow-2xs transition-transform hover:scale-105"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-black uppercase tracking-wider w-fit',
                          card.badge
                        )}
                      >
                        [{idx + 1}] {card.code}
                      </span>
                      <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 line-clamp-3 leading-snug break-words">
                        {card.val}
                      </p>
                      <span className="text-[11px] sm:text-xs font-bold text-slate-500 block mt-0.5">
                        ({card.sub})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 sm:gap-3 flex-1 min-h-0">
              <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-black uppercase tracking-wider text-purple-900 min-w-0 break-words shrink-0">
                <span>✨ CÁC NỘI DUNG TRỌNG TÂM CỦA BÀI HỌC:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(config.parsedCards || []).map((card, idx) => {
                  const style = GOAL_CARD_STYLES[idx % GOAL_CARD_STYLES.length]
                  return (
                    <div
                      key={idx}
                      className={cn(
                        'p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 bg-white shadow-2xs hover:shadow-xs transition-all flex flex-col justify-center gap-1 min-h-[64px] h-auto',
                        style.bg
                      )}
                    >
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wider w-fit',
                            style.badge
                          )}
                        >
                          [{card.index}] {card.title}
                        </span>
                      </div>
                      {card.content && (
                        <p className="text-xs sm:text-[13px] font-black text-slate-900 leading-snug break-words">
                          {card.content}
                        </p>
                      )}
                      {card.note && (
                        <span className="text-[11px] sm:text-xs font-bold text-slate-500 italic block">
                          ({card.note})
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action button */}
      <div className="pt-2 flex justify-end border-t border-slate-100">
        <button
          type="button"
          className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 text-sm sm:text-base font-black rounded-2xl bg-[#18181b] hover:bg-black text-white flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
          onClick={onContinue}
        >
          <span>Đã hiểu mục tiêu! Bắt đầu học</span>
        </button>
      </div>
    </section>
  )
}
