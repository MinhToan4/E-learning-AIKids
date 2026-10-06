import React from 'react'
import { BookOpen, Sparkles, Star } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/Button'
import completionCelebrationUrl from '@/assets/lesson/aiki-completion-celebration.webp'
import type { JourneyStageDefinition, RewardStageConfig } from '../../types/stage-schema'
import type { LessonCompletionSummary } from '../SixStageJourneyView'

export interface RewardStageBlockProps {
  stage: JourneyStageDefinition<RewardStageConfig>
  submittedArtwork?: { image: { url: string; title?: string }; prompt?: string } | null
  effectiveStars?: number
  effectiveRewardXp?: number
  answers?: Array<{ questionId: string; optionIndex: number }>
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
  effectiveStars = 3,
  effectiveRewardXp = 50,
  answers,
  onNavigateNextLesson,
  onBackToMap,
  onFinishLesson,
  onImageClick,
  onOpenCertificate,
  onOpenCourse,
  isFinalStation,
}: RewardStageBlockProps) {
  const { config } = stage

  const fallbackRewardUrl = completionCelebrationUrl
  const targetArtworkUrl = completionCelebrationUrl

  const [displayedSrc, setDisplayedSrc] = React.useState<string>(targetArtworkUrl)
  const [isSavingProgress, setIsSavingProgress] = React.useState(false)

  const resolvedNextSlug =
    config?.nextLessonSlug ||
    (stage as any)?.config?.nextLessonSlug ||
    ''

  const finishThenNavigate = (summary: LessonCompletionSummary, navigate: () => void) => {
    let hasNavigated = false
    const doNavigate = () => {
      if (!hasNavigated) {
        hasNavigated = true
        setIsSavingProgress(false)
        navigate()
      }
    }

    if (onFinishLesson) {
      setIsSavingProgress(true)
      try {
        const result = onFinishLesson(summary)
        if (result instanceof Promise) {
          // Cho phép lưu tối đa 350ms, sau đó luôn luôn điều hướng để trải nghiệm của học sinh không bị kẹt
          const timer = setTimeout(doNavigate, 350)
          void result
            .catch((err) => console.warn('Finish lesson error:', err))
            .finally(() => {
              clearTimeout(timer)
              doNavigate()
            })
          return
        }
      } catch (err) {
        console.warn('Finish lesson error:', err)
      }
    }
    doNavigate()
  }

  React.useEffect(() => {
    setDisplayedSrc(targetArtworkUrl)
  }, [targetArtworkUrl])

  const handleImageZoom = () => {
    if (displayedSrc) {
      onImageClick?.({
        url: displayedSrc,
        title: 'Mèo AIKI chúc mừng hoàn thành bài học',
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
      className="flex w-full max-w-full min-h-0 flex-col rounded-3xl border border-slate-200/80 bg-white p-2.5 sm:p-5 lg:p-6 pb-28 sm:pb-8 shadow-xs animate-fade-up overflow-y-auto"
    >
      <div className="grid w-full max-w-full grid-cols-1 items-center gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-6">
        {/* Hình chúc mừng dùng chung cho mọi bài học và khóa học */}
        <div className="flex flex-col justify-between rounded-2xl bg-amber-50/60 p-2.5 sm:p-3 md:col-span-1 lg:col-span-6 lg:h-full min-w-0 max-w-full overflow-hidden">
          <div className="w-full flex-1 flex items-center justify-center my-auto min-h-0 py-1 overflow-hidden">
            <div className="group relative flex aspect-video w-full max-w-xl items-center justify-center overflow-hidden rounded-2xl bg-amber-100/40 shadow-xs sm:rounded-3xl">
              <img
                loading="lazy"
                decoding="async"
                src={displayedSrc}
                alt="Mèo AIKI vui nhảy và tặng cúp hoàn thành bài học"
                className="size-full object-cover cursor-pointer group-hover:scale-[1.02] transition-transform duration-300"
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

        </div>

        {/* CỘT PHẢI: Kết quả, lời chúc và các nút điều hướng */}
        <div className="flex flex-col justify-center gap-2.5 sm:gap-3.5 text-center md:col-span-1 lg:col-span-6 lg:h-full lg:text-left min-w-0 max-w-full">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <div className="inline-flex items-center self-center rounded-full border border-amber-300/60 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900 sm:text-sm lg:self-start shrink-0 max-w-full">
              <span>Hoàn thành bài học</span>
            </div>
            {config?.rewardBadge?.name && (
              <div
                data-testid="stage6-reward-badge"
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100/90 px-3 py-1 text-xs font-black text-amber-950 shadow-2xs shrink-0 max-w-full"
              >
                {config.rewardBadge.iconUrl && (
                  <img
                    src={config.rewardBadge.iconUrl}
                    alt={config.rewardBadge.name}
                    className="size-4 rounded-full object-cover border border-amber-300 shadow-2xs"
                  />
                )}
                <span>{config.rewardBadge.name}</span>
              </div>
            )}
          </div>

          {/* Phần thưởng hoàn thành: cúp và 3 sao */}
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
            {onNavigateNextLesson ? (
              <button
                type="button"
                className="w-full min-h-[48px] py-3 text-sm sm:text-base font-black rounded-2xl border-2 border-brand-600 bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center gap-2 cursor-pointer shadow-clay transition-all active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                onClick={() => {
                  finishThenNavigate({
                    stars: effectiveStars,
                    xp: effectiveRewardXp,
                    nextLessonSlug: resolvedNextSlug,
                    answers,
                  }, () => onNavigateNextLesson(resolvedNextSlug))
                }}
              >
                <span>{isSavingProgress ? 'Đang mở bài tiếp theo…' : 'Khám phá bài tiếp theo'}</span>
              </button>
            ) : null}

            {onOpenCertificate && isFinalStation && (
              <button
                type="button"
                className="w-full min-h-[48px] py-3 text-sm sm:text-base font-black rounded-2xl bg-[#FD7D2E] hover:bg-[#ea6a1f] text-white flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                onClick={onOpenCertificate}
              >
                <span>Nhận chứng chỉ hoàn thành khóa học</span>
              </button>
            )}

            {onOpenCourse && isFinalStation && (
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
                    answers,
                  }, onBackToMap)
                }}
              >
                <span>{isSavingProgress ? 'Đang về bản đồ…' : 'Quay về bản đồ đảo'}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
