import { ChevronLeft, ChevronRight, Star, Trophy } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/Button'
import { playInstantSound } from '@/features/lesson/lib/lesson-sound'

export interface SidebarFooterProgressProps {
  currentStageIndex: number
  liveStars: number
  stages?: Array<{ id: string; label: string; kind?: string }>
  onSelectStage?: (index: number) => void
  onNextStage?: (nextStageIndex: number) => void
  onAikiFinish?: () => void
  busy?: boolean
}

export function SidebarFooterProgress({
  currentStageIndex,
  liveStars,
  stages,
  onSelectStage,
  onNextStage,
  onAikiFinish,
  busy = false,
}: SidebarFooterProgressProps) {
  return (
    <div className="rounded-3xl border-2 border-amber-200/90 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 p-3 sm:p-3.5 shadow-clay shrink-0 mt-1 space-y-2.5">
      {/* Header: Badge Tiến độ + Số sao */}
      <div className="flex items-center justify-between gap-2 border-b border-amber-100 pb-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-900 tracking-tight">
          <Trophy className="size-3.5 text-amber-600" />
          <span>Tiến độ Hiệp Sĩ Quy Tắc</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-[11px] font-black text-amber-900 shadow-2xs">
          <Star className="size-3 fill-amber-400 text-amber-500" />
          <span>{liveStars > 0 ? `${liveStars} Sao` : '⭐ 3 Sao'}</span>
        </span>
      </div>

      {/* Thanh 5 nấc tiến độ kẹo dẻo nhỏ */}
      <div className="flex items-center gap-1.5 py-0.5">
        {[0, 1, 2, 3, 4].map((stepIdx) => {
          const isPassedOrCurrent = currentStageIndex >= stepIdx
          const isCurrent = currentStageIndex === stepIdx
          return (
            <button
              key={stepIdx}
              type="button"
              onClick={() => {
                playInstantSound('click')
                onSelectStage?.(stepIdx)
                onNextStage?.(stepIdx)
              }}
              title={`Chặng ${stepIdx + 1}${stages?.[stepIdx] ? `: ${stages[stepIdx].label}` : ''}`}
              className={cn(
                'flex-1 h-2.5 rounded-full transition-all duration-300 cursor-pointer',
                isCurrent
                  ? 'bg-gradient-to-r from-amber-400 to-brand-500 ring-2 ring-brand-300 shadow-2xs scale-y-125'
                  : isPassedOrCurrent
                    ? 'bg-amber-400/90'
                    : 'bg-amber-100 border border-amber-200/70 hover:bg-amber-200',
              )}
            />
          )
        })}
      </div>

      {/* Mẹo vàng từ AIKI cho từng chặng (Contextual Tip) */}
      <div className="rounded-2xl bg-white/95 border border-amber-200/80 p-2.5 text-xs font-semibold text-amber-950 shadow-2xs flex items-start gap-2">
        <span className="text-base shrink-0 mt-[-1px]">💡</span>
        <p className="leading-snug flex-1">
          {currentStageIndex === 0 &&
            'Để ý kỹ: Tìm chi tiết khiến bức tranh của Sonet và Zico khác nhau nhé!'}
          {currentStageIndex === 1 &&
            'Bấm chọn tranh: Chọn bức tranh thể hiện ý tưởng độc nhất của con!'}
          {currentStageIndex === 2 &&
            'Khắc ghi: Đọc to Quy Tắc Vàng để nhớ câu thần chú sáng tạo!'}
          {currentStageIndex === 3 &&
            'Hiểu sâu: Biết lý do vì sao AI cần ý tưởng gốc từ con người!'}
          {currentStageIndex >= 4 &&
            'Tuyên thệ: Nhận cúp Hiệp Sĩ và sẵn sàng cho bài tiếp theo!'}
        </p>
      </div>

      {/* Cụm nút điều hướng chặng gắn liền đáy: [← Chặng trước] và [Chặng sau ➔ / 🏆 Nhận Cúp] */}
      <div className="flex items-center gap-2 pt-0.5">
        <Button
          variant="secondary"
          disabled={currentStageIndex === 0}
          onClick={() => {
            if (currentStageIndex > 0) {
              playInstantSound('click')
              const targetIdx = currentStageIndex - 1
              onSelectStage?.(targetIdx)
              onNextStage?.(targetIdx)
            }
          }}
          className={cn(
            'flex-1 h-9 rounded-xl font-bold text-xs flex items-center justify-center gap-1 border-2 transition-all cursor-pointer shadow-2xs',
            currentStageIndex === 0
              ? 'opacity-40 cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
              : 'border-amber-200 bg-white text-amber-900 hover:bg-amber-50 active:scale-95',
          )}
        >
          <ChevronLeft size={14} />
          <span>Chặng trước</span>
        </Button>

        {currentStageIndex < 4 ? (
          <Button
            variant="primary"
            onClick={() => {
              playInstantSound('click')
              const targetIdx = currentStageIndex + 1
              onSelectStage?.(targetIdx)
              onNextStage?.(targetIdx)
            }}
            className="flex-1 h-9 rounded-xl font-black text-xs flex items-center justify-center gap-1 bg-brand-500 hover:bg-brand-600 text-white shadow-clay transition-all cursor-pointer active:scale-95"
          >
            <span>Chặng sau</span>
            <ChevronRight size={14} />
          </Button>
        ) : (
          <Button
            variant="primary"
            disabled={busy}
            onClick={() => {
              playInstantSound('star')
              onAikiFinish?.()
            }}
            className="flex-1 h-9 rounded-xl font-black text-xs flex items-center justify-center gap-1 bg-mint-500 hover:bg-mint-600 text-white shadow-clay transition-all cursor-pointer active:scale-95"
          >
            <Trophy size={14} />
            <span>{busy ? 'Đang cấp chứng chỉ…' : '🏆 Nhận Cúp & Tiếp tục'}</span>
          </Button>
        )}
      </div>
    </div>
  )
}
