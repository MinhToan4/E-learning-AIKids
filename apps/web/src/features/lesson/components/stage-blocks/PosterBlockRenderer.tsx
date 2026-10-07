import React from 'react'
import {
  Check,
  ChevronRight,
  Printer,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import { CreativeKnightBadgeVisual } from '@/features/lesson/components/AikiRuleVisuals'
import type { LearnCardDraft, StageBlockItem } from '@/features/teacher/lib/authoring'

export interface PosterBlockRendererProps {
  block: StageBlockItem
  card: LearnCardDraft
  stageIndex: number
  isAikiRuleJourney: boolean
  hasAcknowledgedRule: boolean
  onAcknowledgeRule: () => void
  onOpenPosterModal?: () => void
  hasCommitted: boolean
  onToggleCommit: () => void
  onAikiFinish?: () => void
  onNextStage?: (nextStageIndex: number) => void
  busy?: boolean
}

export function PosterBlockRenderer({
  block,
  card,
  stageIndex,
  isAikiRuleJourney,
  hasAcknowledgedRule,
  onAcknowledgeRule,
  onOpenPosterModal,
  hasCommitted,
  onToggleCommit,
  onAikiFinish,
  onNextStage,
  busy = false,
}: PosterBlockRendererProps) {
  const posterText =
    block.posterText ||
    block.body ||
    card.body ||
    'Ý TƯỞNG CỦA CON LÀ SỐ 1 · AI CHỈ LÀ TRỢ LÝ GIÚP CON LÀM ĐẸP HƠN!'
  const isClosingStage = stageIndex === 4 || card.kind === 'closing'

  return (
    <div
      key={block.id}
      data-testid="block-poster"
      className="space-y-4 text-left"
    >
      {!isClosingStage ? (
        <div className="relative overflow-hidden rounded-3xl border-3 border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6 sm:p-8 shadow-clay animate-fade-up">
          <div className="flex items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm uppercase tracking-wider">
              <Sparkles size={20} className="text-amber-600 fill-amber-400" />
              {block.title || 'Quy Tắc Vàng AIKI'}
            </div>
            <span className="rounded-full bg-amber-200 px-3 py-0.5 text-xs font-black text-amber-900">
              {isAikiRuleJourney ? `Chặng ${stageIndex + 1}/5` : 'Quy tắc'}
            </span>
          </div>

          <div className="mt-4 flex flex-col items-center text-center">
            <span className="text-4xl sm:text-5xl animate-bounce">🌟</span>
            <h3 className="mt-2 font-display text-2xl sm:text-4xl font-black text-amber-950 leading-snug max-w-3xl">
              {posterText}
            </h3>
          </div>

          {(block.tip || card.tip) && (
            <div className="mt-5 rounded-2xl border-2 border-amber-300/70 bg-white/80 p-5 text-base sm:text-lg font-bold text-amber-950 leading-relaxed shadow-xs">
              💡 <span className="font-extrabold">Bí kíp ghi nhớ:</span> {block.tip || card.tip}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {onOpenPosterModal && (
              <Button
                variant="secondary"
                className="h-14 px-6 text-sm sm:text-base font-black border-2 border-amber-400 bg-white/95 hover:bg-amber-100 text-amber-950 shadow-xs flex items-center gap-2 cursor-pointer"
                onClick={onOpenPosterModal}
              >
                <Printer size={19} className="text-amber-700" />
                📥 Tải / In Poster Vàng
              </Button>
            )}

            {!hasAcknowledgedRule ? (
              <Button
                variant="primary"
                className="h-14 px-8 text-base sm:text-lg font-black shadow-clay bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 cursor-pointer"
                onClick={onAcknowledgeRule}
              >
                <Star size={20} className="fill-white" />
                🌟 Con đã ghi nhớ quy tắc!
              </Button>
            ) : (
              <div className="flex flex-wrap items-center gap-3 animate-pop">
                <div className="inline-flex items-center gap-2 rounded-2xl border-2 border-mint-300 bg-mint-50 px-5 py-2.5 text-base font-black text-mint-900 shadow-sm">
                  <Check className="size-5 text-mint-600" />
                  ✨ Con đã ghi nhớ quy tắc vàng thành công! ⭐
                </div>
                {onNextStage && (
                  <Button
                    variant="secondary"
                    className="h-12 px-6 font-extrabold border-2 border-amber-300 hover:bg-amber-100 text-amber-900 cursor-pointer"
                    onClick={() => onNextStage(stageIndex + 1)}
                  >
                    Tiếp tục sang phần Giải thích
                    <ChevronRight size={20} />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Chặng cam kết hiệp sĩ sáng tạo */
        <div className="rounded-3xl border-3 border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6 sm:p-8 shadow-clay text-center flex flex-col items-center gap-5 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400 bg-amber-200/90 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-amber-950 shadow-xs">
            <Trophy className="size-4 text-amber-700 fill-amber-500" />
            🛡️ BẢN CAM KẾT HIỆP SĨ SÁNG TẠO AIKI
          </div>

          <h3 className="font-display text-2xl sm:text-3xl font-black text-amber-950 max-w-2xl leading-snug">
            {posterText}
          </h3>

          <button
            type="button"
            onClick={onToggleCommit}
            className={cn(
              'flex items-center gap-3 px-6 py-4 rounded-2xl border-3 font-black text-base sm:text-lg transition-all shadow-xs active:scale-[0.98] cursor-pointer',
              hasCommitted
                ? 'border-mint-500 bg-mint-50 text-mint-900 shadow-clay ring-4 ring-mint-200/60'
                : 'border-brand-300 bg-white hover:border-brand-400 text-brand-900 hover:shadow-md'
            )}
          >
            <span
              className={cn(
                'grid size-8 place-items-center rounded-xl border-2 transition-all',
                hasCommitted
                  ? 'bg-mint-500 border-mint-600 text-white shadow-xs'
                  : 'border-brand-300 bg-brand-50 text-brand-400'
              )}
            >
              {hasCommitted ? <Check size={20} /> : null}
            </span>
            <span>
              {hasCommitted
                ? 'Con đã là Hiệp Sĩ Sáng Tạo! 🌟'
                : 'Con đã sẵn sàng làm Hiệp Sĩ Sáng Tạo! ✋'}
            </span>
          </button>

          {hasCommitted && <CreativeKnightBadgeVisual className="my-2" />}

          <p className="text-sm font-semibold text-amber-800 max-w-md">
            Con đã hoàn thành toàn bộ 5 chặng của Quy tắc AIKI! Bấm nút bên dưới để hoàn tất trạm học và nhận sao nhé!
          </p>

          {onAikiFinish && (
            <Button
              variant="primary"
              className="w-full sm:w-auto min-w-[280px] max-w-full text-lg sm:text-xl font-black h-16 rounded-2xl shadow-clay border-b-[4px] border-brand-700 active:border-b-0 active:translate-y-1 mt-2 cursor-pointer"
              onClick={onAikiFinish}
              disabled={busy}
            >
              {!busy && <Star size={24} className="fill-white" aria-hidden="true" />}
              {busy ? 'Đang hoàn thành…' : 'Hoàn thành trạm học & Nhận sao ⭐'}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
