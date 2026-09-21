import React, { useMemo } from 'react'
import { HelpCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/Button'
import { playInstantSound } from '../LessonInteractiveSidebar'
import type { JourneyStageDefinition, ConfirmStageConfig } from '../../types/stage-schema'

export interface ConfirmStageBlockProps {
  stage: JourneyStageDefinition<ConfirmStageConfig>
  selectedOption?: number | null
  isCorrect?: boolean | null
  failedOptionImages?: Record<string, boolean>
  onSelectOption?: (index: number) => void
  onImageClick?: (image: { url: string; title: string; fallbackUrl?: string }) => void
  onOptionImageError?: (optKey: string) => void
  onPrevious?: () => void
  onContinue?: () => void
}

export function ConfirmStageBlock({
  stage,
  selectedOption = null,
  isCorrect = null,
  failedOptionImages = {},
  onSelectOption,
  onImageClick,
  onOptionImageError,
  onPrevious,
  onContinue,
}: ConfirmStageBlockProps) {
  const { config } = stage

  const [displayedOptionSrcs, setDisplayedOptionSrcs] = React.useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    config.options.forEach((opt, idx) => {
      const key = opt.id || `opt-${idx}`
      if (opt.imageUrl) initial[key] = opt.imageUrl
    })
    return initial
  })

  React.useEffect(() => {
    const updated: Record<string, string> = {}
    config.options.forEach((opt, idx) => {
      const key = opt.id || `opt-${idx}`
      if (opt.imageUrl) updated[key] = opt.imageUrl
    })
    setDisplayedOptionSrcs(updated)
  }, [config.options])

  const hasAnyValidOptionImg = useMemo(() => {
    return config.options.some((opt, idx) => {
      const optKey = opt.id || `opt-${idx}`
      return Boolean(opt.imageUrl && opt.imageUrl.trim() !== '' && !failedOptionImages[optKey])
    })
  }, [config.options, failedOptionImages])

  const handleChoose = (idx: number) => {
    onSelectOption?.(idx)
    const correct = idx === config.correctIndex
    try {
      playInstantSound(correct ? 'correct' : 'wrong')
    } catch {
      // ignore
    }
  }

  return (
    <section
      data-testid="stage-1-confirm"
      className="rounded-3xl bg-white p-4 sm:p-6 shadow-clay border-2 border-brand-100 flex flex-col gap-4 animate-fade-up"
    >
      <div className="flex flex-col gap-2 shrink-0">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold w-fit border border-amber-200/60">
          <HelpCircle size={13} className="text-amber-600" />
          <span>Chặng 2: Xác nhận mục tiêu</span>
        </div>

        <div className="text-center sm:text-left">
          <h2 className="text-lg sm:text-xl font-black text-slate-800">
            {config.question}
          </h2>
          {config.subPrompt && (
            <p className="text-sm sm:text-base text-slate-600 mt-1 font-semibold">
              {config.subPrompt}
            </p>
          )}
        </div>
      </div>

      {/* Tùy biến giao diện theo loại options: Có keyItems (3 Bộ chìa khoá A/B/C) hoặc Cards A & B thông thường */}
      {config.hasKeyOptions ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 max-w-5xl w-full mx-auto my-2">
          {config.options.map((option, idx) => {
            const optKey = option.id || `opt-${idx}`
            const isSelected = selectedOption === idx
            const isPick = isSelected && isCorrect === true
            const lockImg = isPick
              ? '/assets/aiki-keys/lock_open_mint.jpg'
              : isSelected && !isCorrect
              ? '/assets/aiki-keys/lock_wrong_rose.jpg'
              : '/assets/aiki-keys/lock_closed_amber.jpg'

            return (
              <button
                key={optKey}
                type="button"
                onClick={() => handleChoose(idx)}
                className={cn(
                  'relative h-auto flex flex-col justify-between rounded-3xl p-3.5 sm:p-4 border-2 text-left transition-all duration-200 cursor-pointer shadow-clay-sm hover:shadow-clay group',
                  isPick
                    ? 'border-mint-500 bg-mint-50/90 ring-2 ring-mint-400 ring-offset-2 scale-[1.02]'
                    : isSelected && !isCorrect
                    ? 'border-rose-400 bg-rose-50/80 ring-2 ring-rose-400 ring-offset-2'
                    : selectedOption !== null
                    ? 'border-slate-200 bg-white/95 opacity-80 hover:opacity-100 hover:border-brand-300'
                    : 'border-slate-200 bg-white/95 hover:border-brand-300'
                )}
              >
                {/* Badge A, B, C */}
                <span
                  className={cn(
                    'absolute top-3 left-3 w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm border transition-colors z-10',
                    isPick
                      ? 'bg-mint-500 text-white border-mint-500 shadow-xs'
                      : isSelected && !isCorrect
                      ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200 group-hover:border-brand-300'
                  )}
                >
                  {String.fromCharCode(65 + idx)}
                </span>

                {/* Dấu tích ✓ khi đúng */}
                {isPick && (
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-mint-500 text-white flex items-center justify-center font-black text-sm shadow-sm animate-fade-up z-10">
                    ✓
                  </div>
                )}

                {/* Header: Ổ Khóa Soft Clay + Tiêu đề */}
                <div className="flex items-center gap-2.5 pt-4 pb-2 border-b border-slate-100">
                  <div
                    className={cn(
                      'w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border-2 transition-all shadow-clay-sm overflow-hidden shrink-0',
                      isPick
                        ? 'border-mint-400 ring-4 ring-mint-300/60 scale-105'
                        : isSelected && !isCorrect
                        ? 'border-rose-300'
                        : 'border-amber-200 group-hover:scale-105'
                    )}
                  >
                    <span className="sr-only">{isPick ? '🔓' : '🔒'}</span>
                    <img
                      loading="lazy"
                      decoding="async"
                      src={lockImg}
                      alt={isPick ? 'Ổ khóa đã mở' : 'Ổ khóa đóng'}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className={cn(
                        'text-sm sm:text-base font-black uppercase tracking-wider',
                        isPick ? 'text-mint-800' : 'text-slate-800'
                      )}
                    >
                      {option.text}
                    </h3>
                    <span className="text-xs sm:text-sm font-bold text-slate-500">
                      {isPick ? '✨ 4 Chìa Khóa Vàng' : 'Bộ 4 Chìa Khóa'}
                    </span>
                  </div>
                </div>

                {/* Hiển thị 1 ảnh 4 chìa khóa nếu có imageUrl, hoặc fallback về lưới 2x2 */}
                {option.imageUrl ? (
                  <div className="my-2 rounded-2xl overflow-hidden bg-slate-100/80 border border-slate-200/80 flex-1 flex items-center justify-center p-1 min-h-[160px]">
                    <img
                      loading="lazy"
                      decoding="async"
                      src={displayedOptionSrcs[optKey] || option.imageUrl}
                      alt={option.text}
                      className="w-full h-auto max-h-[220px] object-contain rounded-xl group-hover:scale-[1.02] transition-transform duration-200"
                      onError={() => {
                        const fallback = '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2'
                        setDisplayedOptionSrcs((prev) => ({ ...prev, [optKey]: fallback }))
                      }}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 my-2 p-2 sm:p-2.5 rounded-2xl bg-slate-50/90 border border-slate-200/60 flex-1">
                    {option.keyItems?.map((k, kIdx) => {
                      const keyThumbnail =
                        kIdx === 0
                          ? '/assets/aiki-keys/key_what_blue.jpg'
                          : kIdx === 1
                          ? '/assets/aiki-keys/key_how_yellow.jpg'
                          : kIdx === 2
                          ? '/assets/aiki-keys/key_action_orange.jpg'
                          : '/assets/aiki-keys/key_where_pink.jpg'

                      return (
                        <div
                          key={kIdx}
                          className="flex flex-col items-center text-center p-1.5 sm:p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs gap-1 transition-transform hover:scale-[1.02]"
                        >
                          <img
                            loading="lazy"
                            decoding="async"
                            src={keyThumbnail}
                            alt={k.label}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-contain bg-amber-50/40 p-0.5 border border-amber-200/80 shrink-0 shadow-2xs"
                          />
                          <span
                            className="text-[10px] sm:text-xs font-black uppercase px-2 py-0.5 rounded-full text-white tracking-wider"
                            style={{ backgroundColor: k.color || '#F59E0B' }}
                          >
                            CHÌA {kIdx + 1}
                          </span>
                          <span className="text-[11px] sm:text-xs font-black text-slate-800 leading-tight break-words text-center">
                            {k.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Nhãn trạng thái dưới đáy thẻ */}
                <div
                  className={cn(
                    'mt-1 py-2 px-3 rounded-xl text-center text-xs sm:text-sm font-black border transition-colors',
                    isPick
                      ? 'bg-mint-100 text-mint-800 border-mint-300'
                      : isSelected && !isCorrect
                      ? 'bg-rose-100 text-rose-700 border-rose-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-brand-50 group-hover:text-brand-700 group-hover:border-brand-200'
                  )}
                >
                  {isPick
                    ? 'Đúng bộ này rồi! 🎉'
                    : isSelected && !isCorrect
                    ? 'Chưa mở được 🔒'
                    : 'Bấm để chọn bộ này'}
                </div>
              </button>
            )
          })}
        </div>
      ) : hasAnyValidOptionImg ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto my-3 w-full">
          {config.options.map((option, idx) => {
            const optKey = option.id || `opt-${idx}`
            const isSelected = selectedOption === idx
            const isThisOptionCorrect = idx === config.correctIndex
            const isImgFailed = failedOptionImages[optKey]
            const hasValidImg = Boolean(
              option.imageUrl && option.imageUrl.trim() !== '' && !isImgFailed
            )

            let cardStyle =
              'border-slate-200 bg-white/95 hover:border-brand-300 text-slate-800'

            if (isSelected) {
              if (isThisOptionCorrect) {
                cardStyle =
                  'border-mint-500 bg-mint-50/90 text-mint-950 ring-4 ring-mint-200 scale-[1.02]'
              } else {
                cardStyle =
                  'border-rose-400 bg-rose-50/90 text-rose-950 ring-4 ring-rose-200 scale-[0.99]'
              }
            } else if (selectedOption !== null) {
              cardStyle =
                'border-slate-200 bg-white/95 text-slate-700 opacity-80 hover:opacity-100 hover:border-brand-300'
            }

            return (
              <button
                key={optKey}
                type="button"
                onClick={() => handleChoose(idx)}
                className={cn(
                  'h-auto flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-3xl border-2 transition-all duration-200 text-left cursor-pointer group relative shadow-clay-sm hover:shadow-clay gap-3',
                  cardStyle
                )}
              >
                {/* Huy hiệu tròn A, B, C nổi bật */}
                <span
                  className={cn(
                    'absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all z-10 shadow-sm',
                    isSelected
                      ? isThisOptionCorrect
                        ? 'bg-mint-500 text-white border-mint-400 scale-110 shadow-mint-200'
                        : 'bg-rose-500 text-white border-rose-400 scale-110 shadow-rose-200'
                      : 'bg-white text-slate-700 border-slate-200 group-hover:border-brand-400 group-hover:bg-brand-50'
                  )}
                >
                  {String.fromCharCode(65 + idx)}
                </span>

                {/* Dấu tích ✓ khi đúng / ✕ khi sai */}
                {isSelected && (
                  <span
                    className={cn(
                      'absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-xs animate-fade-up text-white z-10',
                      isThisOptionCorrect ? 'bg-mint-500' : 'bg-rose-500'
                    )}
                  >
                    {isThisOptionCorrect ? '✓' : '✕'}
                  </span>
                )}

                {hasValidImg ? (
                  <div className="aspect-[16/10] max-h-[220px] w-full rounded-2xl overflow-hidden bg-slate-100/80 border border-slate-200/80 relative flex items-center justify-center p-1.5">
                    <img
                      loading="lazy"
                      decoding="async"
                      src={displayedOptionSrcs[optKey] || option.imageUrl}
                      alt={option.text}
                      className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                      onError={() => {
                        onOptionImageError?.(optKey)
                        const fallback = '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2'
                        setDisplayedOptionSrcs((prev) => ({ ...prev, [optKey]: fallback }))
                      }}
                    />
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label="Xem ảnh phóng to"
                      onClick={(e) => {
                        e.stopPropagation()
                        const optSrc = displayedOptionSrcs[optKey] || option.imageUrl
                        if (optSrc) {
                          onImageClick?.({
                            url: optSrc,
                            title: option.text,
                            fallbackUrl: '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2',
                          })
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation()
                          const optSrc = displayedOptionSrcs[optKey] || option.imageUrl
                          if (optSrc) {
                            onImageClick?.({
                              url: optSrc,
                              title: option.text,
                              fallbackUrl: '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2',
                            })
                          }
                        }
                      }}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-[11px] font-bold px-2 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1 opacity-90 hover:opacity-100 transition shadow-xs z-10 cursor-pointer"
                      title="Xem ảnh phóng to"
                    >
                      <span>🔍 Phóng to</span>
                    </span>
                  </div>
                ) : (
                  <div className="aspect-[16/10] max-h-[220px] w-full rounded-2xl overflow-hidden bg-amber-50/60 border border-amber-200/60 relative flex flex-col items-center justify-center p-4 text-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-clay-sm flex items-center justify-center text-2xl border border-amber-200">
                      🎨
                    </div>
                    <span className="text-xs font-bold text-slate-500">Minh họa phương án</span>
                  </div>
                )}

                <p className="text-sm sm:text-base font-bold text-slate-800 text-center w-full leading-snug px-1 mt-1 flex-1 flex items-center justify-center">
                  {option.text}
                </p>

                <div
                  className={cn(
                    'mt-1 py-2 px-3 rounded-xl text-center text-xs sm:text-sm font-black border transition-colors w-full',
                    isSelected && isThisOptionCorrect
                      ? 'bg-mint-100 text-mint-800 border-mint-300'
                      : isSelected && !isThisOptionCorrect
                      ? 'bg-rose-100 text-rose-700 border-rose-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-brand-50 group-hover:text-brand-700 group-hover:border-brand-200'
                  )}
                >
                  {isSelected && isThisOptionCorrect
                    ? 'Chính xác! 🎉'
                    : isSelected && !isThisOptionCorrect
                    ? 'Chưa đúng, thử lại nhé! ❌'
                    : 'Bấm để chọn đáp án này'}
                </div>

                {isSelected && (
                  <span className="sr-only">
                    {isThisOptionCorrect
                      ? 'Chính xác! Tuyệt vời quá bạn ơi!'
                      : 'Chưa đúng rồi, học sinh hãy thử chọn lại nhé!'}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl mx-auto my-3">
          {config.options.map((option, idx) => {
            const optKey = option.id || `opt-${idx}`
            const isSelected = selectedOption === idx
            const isThisOptionCorrect = idx === config.correctIndex

            return (
              <button
                key={optKey}
                type="button"
                onClick={() => handleChoose(idx)}
                className={cn(
                  'relative h-auto flex flex-col justify-between p-4 sm:p-5 rounded-3xl border-2 transition-all duration-200 text-left cursor-pointer group shadow-clay-sm hover:shadow-clay gap-3 min-h-[160px]',
                  isSelected
                    ? isThisOptionCorrect
                      ? 'border-mint-500 bg-mint-50/90 text-mint-950 ring-4 ring-mint-200 scale-[1.02]'
                      : 'border-rose-400 bg-rose-50/90 text-rose-950 ring-4 ring-rose-200 scale-[0.99]'
                    : selectedOption !== null
                    ? 'border-slate-200 bg-white/95 text-slate-700 opacity-80 hover:opacity-100 hover:border-brand-300'
                    : 'border-slate-200 bg-white/95 text-slate-800 hover:border-brand-300 hover:scale-[1.01]'
                )}
              >
                {/* Header: Huy hiệu chữ cái A, B, C bo tròn nổi bật */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={cn(
                      'w-8 h-8 rounded-2xl flex items-center justify-center font-black text-sm border-2 transition-colors shadow-2xs',
                      isSelected
                        ? isThisOptionCorrect
                          ? 'bg-mint-500 text-white border-mint-400'
                          : 'bg-rose-500 text-white border-rose-400'
                        : 'bg-slate-100 text-slate-700 border-slate-200 group-hover:border-brand-300 group-hover:bg-brand-50'
                    )}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>

                  {/* Dấu tích ✓ khi đúng / ✕ khi sai */}
                  {isSelected && (
                    <span
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-xs animate-fade-up text-white',
                        isThisOptionCorrect ? 'bg-mint-500' : 'bg-rose-500'
                      )}
                    >
                      {isThisOptionCorrect ? '✓' : '✕'}
                    </span>
                  )}
                </div>

                {/* Nội dung câu trả lời */}
                <p className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed flex-1 flex items-center">
                  {option.text}
                </p>

                {/* Nhãn/nút trạng thái dưới chân mỗi card */}
                <div
                  className={cn(
                    'py-2 px-3 rounded-xl text-center text-xs sm:text-sm font-black border transition-colors w-full',
                    isSelected && isThisOptionCorrect
                      ? 'bg-mint-100 text-mint-800 border-mint-300'
                      : isSelected && !isThisOptionCorrect
                      ? 'bg-rose-100 text-rose-700 border-rose-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-brand-50 group-hover:text-brand-700 group-hover:border-brand-200'
                  )}
                >
                  {isSelected && isThisOptionCorrect
                    ? 'Chính xác! 🎉'
                    : isSelected && !isThisOptionCorrect
                    ? 'Chưa đúng, thử lại nhé! ❌'
                    : 'Bấm để chọn đáp án này'}
                </div>

                {isSelected && (
                  <span className="sr-only">
                    {isThisOptionCorrect
                      ? 'Chính xác! Tuyệt vời quá bạn ơi!'
                      : 'Chưa đúng rồi, học sinh hãy thử chọn lại nhé!'}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Action button & Mint Feedback - Sticky đáy luôn nhìn thấy */}
      <div className="shrink-0 pt-2 pb-1 bg-white/95 backdrop-blur-xs flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-slate-100 sticky bottom-0 z-20">
        <Button
          variant="secondary"
          onClick={onPrevious}
          className="rounded-xl order-2 sm:order-1 text-xs sm:text-sm py-2 px-3 min-h-[40px] sm:min-h-[44px]"
        >
          Quay lại mục tiêu
        </Button>

        {isCorrect ? (
          <div className="flex-1 w-full order-1 sm:order-2 flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <div className="flex-1 bg-mint-50 border border-mint-200 rounded-2xl p-2 sm:p-2.5 flex items-center gap-2 text-xs sm:text-sm text-mint-900 shadow-2xs font-bold">
              <span className="text-lg shrink-0">🎉</span>
              <p className="leading-snug line-clamp-2">
                <strong>Đúng rồi các cậu ơi!</strong> {config.explanation}
              </p>
            </div>
            <Button
              variant="primary"
              className="w-full sm:w-auto px-5 sm:px-7 py-2.5 sm:py-3 min-h-[42px] sm:min-h-[46px] text-sm sm:text-base font-black rounded-2xl shadow-clay border-b-[4px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              onClick={onContinue}
            >
              <span>🎬 Xem video bài học thôi nào →</span>
              <ArrowRight size={18} />
            </Button>
          </div>
        ) : (
          <div className="flex-1 w-full order-1 sm:order-2 flex items-center gap-3">
            {config.hasKeyOptions ? (
              selectedOption === null ? (
                <div className="flex-1 bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex items-center gap-2.5 text-xs sm:text-sm text-amber-900 shadow-2xs">
                  <span className="text-base shrink-0">💡</span>
                  <p className="leading-snug font-bold">
                    Bé hãy quan sát 4 chiếc chìa khóa của 3 bộ ở trên, bộ nào có đủ [Cái gì · Trông như thế nào · Đang làm gì · Ở đâu] thì bấm chọn để mở Ổ Khóa nhé!
                  </p>
                </div>
              ) : (
                <div className="flex-1 bg-rose-50 border border-rose-200/80 rounded-2xl p-3 flex items-center gap-2.5 text-xs sm:text-sm text-rose-900 shadow-2xs">
                  <span className="text-base shrink-0">🔒</span>
                  <p className="leading-snug font-bold">
                    Chưa mở được ổ khóa! Bé hãy quan sát kỹ lại 4 chìa khóa và chọn bộ khác nhé!
                  </p>
                </div>
              )
            ) : (
              <span className="text-xs text-slate-500 italic">
                💡 Xem gợi ý ở bảng bên phải nếu cần hỗ trợ nhé!
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
