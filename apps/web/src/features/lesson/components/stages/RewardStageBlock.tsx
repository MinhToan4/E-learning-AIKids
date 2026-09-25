import React from 'react'
import { Award, BookOpen, CheckCircle2, Sparkles, Star } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/Button'
import type { JourneyStageDefinition, RewardStageConfig } from '../../types/stage-schema'
import type { LessonCompletionSummary } from '../SixStageJourneyView'

export interface RewardStageBlockProps {
  stage: JourneyStageDefinition<RewardStageConfig>
  submittedArtwork?: { image: { url: string; title?: string }; prompt?: string } | null
  effectiveStars?: number
  effectiveRewardXp?: number
  onNavigateNextLesson?: (nextSlug: string) => void
  onBackToMap?: () => void
  onFinishLesson?: (summary: LessonCompletionSummary) => boolean | void | Promise<boolean | void>
  onImageClick?: (image: { url: string; title: string; fallbackUrl?: string }) => void
  onOpenCertificate?: () => void
  onOpenCourse?: () => void
  isFinalStation?: boolean
}

export function RewardStageBlock({
  stage,
  submittedArtwork,
  effectiveStars = 3,
  effectiveRewardXp = 50,
  onNavigateNextLesson,
  onBackToMap,
  onFinishLesson,
  onImageClick,
  onOpenCertificate,
  onOpenCourse,
  isFinalStation,
}: RewardStageBlockProps) {
  const { config } = stage

  const fallbackRewardUrl = '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2'
  const targetArtworkUrl =
    submittedArtwork?.image.url ||
    config?.rewardBadge?.iconUrl ||
    fallbackRewardUrl

  const [displayedSrc, setDisplayedSrc] = React.useState<string>(targetArtworkUrl)

  const finishThenNavigate = (
    summary: LessonCompletionSummary,
    navigate: () => void,
  ) => {
    const result = onFinishLesson?.(summary)
    if (result instanceof Promise) {
      void result.then((saved) => {
        if (saved !== false) navigate()
      })
      return
    }
    if (result !== false) navigate()
  }

  React.useEffect(() => {
    setDisplayedSrc(targetArtworkUrl)
  }, [targetArtworkUrl])

  const handleImageZoom = () => {
    if (displayedSrc) {
      onImageClick?.({
        url: displayedSrc,
        title: 'Tác phẩm kiệt xuất của bé',
        fallbackUrl: fallbackRewardUrl,
      })
    }
  }

  const handleImageError = () => {
    if (displayedSrc !== fallbackRewardUrl) {
      setDisplayedSrc(fallbackRewardUrl)
    }
  }

  return (
    <section
      data-testid="stage-5-completion"
      className="flex w-full max-w-full min-h-0 flex-col rounded-3xl border border-slate-200/80 bg-white p-3.5 sm:p-5 lg:p-6 pb-28 sm:pb-8 shadow-xs animate-fade-up overflow-y-auto"
    >
      <div className="grid w-full max-w-full grid-cols-1 items-center gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-6">
        {/* CỘT TRÁI (md:col-span-1 lg:col-span-6): Trưng bày tác phẩm kiệt xuất vừa cất vào Balo */}
        <div className="flex flex-col justify-between rounded-2xl border-2 border-amber-200 bg-amber-50/70 p-3 sm:p-4 md:col-span-1 lg:col-span-6 lg:h-full min-w-0 max-w-full overflow-hidden">
          <div className="mb-2 flex min-w-0 flex-col items-stretch gap-2 text-xs font-black uppercase tracking-wider text-amber-900">
            <span className="flex min-w-0 items-start gap-1.5">
              <Award size={16} className="text-amber-600 shrink-0" />
              <span className="min-w-0 break-words leading-snug">Tác phẩm kiệt xuất vừa cất vào Balo</span>
            </span>
            <div className="flex w-full min-w-0 items-start gap-1.5 rounded-xl bg-mint-100 px-2.5 py-1 text-left text-xs font-black normal-case tracking-normal text-mint-800 sm:text-sm">
              <CheckCircle2 size={13} className="text-mint-600 shrink-0" />
              <span className="min-w-0 break-words leading-snug">{config?.rewardBadge?.name || 'Hoàn thành xuất sắc'}</span>
            </div>
          </div>

          {/* Khung ảnh to, sắc nét chuẩn tỷ lệ 4:3 */}
          <div className="w-full flex-1 flex items-center justify-center my-auto min-h-0 py-1 overflow-hidden">
            <div className="group relative flex aspect-[4/3] w-full max-w-xl items-center justify-center overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-100/40 shadow-xs sm:rounded-3xl">
              <img
                loading="lazy"
                decoding="async"
                src={displayedSrc}
                alt="Kiệt tác của bé"
                className="size-full object-cover cursor-pointer group-hover:scale-102 transition-transform duration-300"
                onClick={handleImageZoom}
                onError={handleImageError}
              />
              <button
                type="button"
                onClick={handleImageZoom}
                className="absolute top-2.5 right-2.5 bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-2.5 py-1 rounded-xl backdrop-blur-xs flex items-center gap-1 opacity-90 hover:opacity-100 transition shadow-xs cursor-pointer z-10"
                title="Xem ảnh phóng to"
              >
                <span>Phóng to</span>
              </button>
            </div>
          </div>

          {submittedArtwork?.prompt && (
            <p className="text-xs sm:text-sm text-slate-600 font-medium italic bg-white/80 px-3 py-1.5 rounded-lg border border-amber-200/60 w-full text-center mt-2 max-w-full break-words leading-relaxed">
              &ldquo;{submittedArtwork.prompt}&rdquo;
            </p>
          )}
        </div>

        {/* CỘT PHẢI (md:col-span-1 lg:col-span-6): Vinh danh, Tiêu đề, Lời chúc & Các nút điều hướng */}
        <div className="flex flex-col justify-center gap-2.5 sm:gap-3.5 text-center md:col-span-1 lg:col-span-6 lg:h-full lg:text-left min-w-0 max-w-full">
          <div className="inline-flex items-center self-center rounded-full border border-amber-300/60 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900 sm:text-sm lg:self-start shrink-0 max-w-full">
            <span>Chặng 6: Hoàn thành bài học</span>
          </div>

          {/* Vinh danh: Cúp vàng đất nặn 3D Hallmark Soft Clay + 3 Sao vàng */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 lg:justify-start">
            <div className="relative shrink-0">
              <img
                loading="lazy"
                decoding="async"
                src="/assets/trophy-clay-gold.png"
                alt="Cúp Vàng Sáng Tạo"
                className="w-14 h-14 sm:w-18 sm:h-18 lg:w-20 lg:h-20 object-contain drop-shadow-clay select-none hover:scale-105 transition-transform duration-300"
              />
              <div
                data-testid="stage6-trophy-xp-badge"
                className="absolute -top-1.5 -right-2 bg-brand-500 text-white text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow-clay-xs flex items-center gap-0.5 z-10"
              >
                <Sparkles size={11} />
                +{effectiveRewardXp} XP
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((star) => (
                <Star
                  key={star}
                  size={22}
                  className={cn(
                    'drop-shadow-md transition-all',
                    star <= effectiveStars
                      ? 'fill-amber-400 text-amber-500 animate-pulse'
                      : 'fill-slate-200 text-slate-300'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Tiêu đề & Lời chúc mừng */}
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 leading-tight break-words">
              {config?.title || 'Chúc mừng con!'}
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-slate-600 font-medium leading-relaxed break-words">
              {config?.congratsMessage || 'Con đã hoàn thành bài học xuất sắc!'}
            </p>
          </div>

          {/* Cụm Nút điều hướng kết thúc */}
          <div className="flex flex-col gap-2 sm:gap-2.5 w-full pt-1">
            {config?.nextLessonSlug && onNavigateNextLesson ? (
              <button
                type="button"
                className="w-full min-h-[48px] py-3 text-sm sm:text-base font-black rounded-2xl bg-[#18181b] hover:bg-black text-white flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                onClick={() => {
                  finishThenNavigate({
                    stars: effectiveStars,
                    xp: effectiveRewardXp,
                    nextLessonSlug: config?.nextLessonSlug,
                  }, () => onNavigateNextLesson(config.nextLessonSlug!))
                }}
              >
                <span>Khám phá bài tiếp theo</span>
              </button>
            ) : null}

            {onOpenCertificate && (isFinalStation ?? !config?.nextLessonSlug) && (
              <button
                type="button"
                className="w-full min-h-[48px] py-3 text-sm sm:text-base font-black rounded-2xl bg-[#FD7D2E] hover:bg-[#ea6a1f] text-white flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                onClick={onOpenCertificate}
              >
                <span>Nhận chứng chỉ hoàn thành khóa học</span>
              </button>
            )}

            {onOpenCourse && (isFinalStation ?? !config?.nextLessonSlug) && (
              <button
                type="button"
                className="w-full min-h-[48px] py-3 text-sm sm:text-base font-black rounded-2xl bg-[#18181b] hover:bg-black text-white flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                onClick={onOpenCourse}
              >
                <BookOpen size={18} aria-hidden="true" />
                <span>Sang khu khóa học</span>
              </button>
            )}

            {onBackToMap && (
              <Button
                variant="secondary"
                className="w-full min-h-[44px] py-2.5 text-xs sm:text-sm font-black rounded-2xl border-2 border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2 cursor-pointer active:translate-y-0.5"
                onClick={() => {
                  finishThenNavigate({
                    stars: effectiveStars,
                    xp: effectiveRewardXp,
                  }, onBackToMap)
                }}
              >
                <span>Quay về bản đồ đảo</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
