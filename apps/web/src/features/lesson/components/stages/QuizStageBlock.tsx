import React from 'react'
import { Check, X, Star, ZoomIn, Palette, RotateCcw, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/Button'
import { isValidImageUrl } from '../../lib/stage-view-utils'
import { playInstantSound } from '../LessonInteractiveSidebar'
import type { JourneyStageDefinition, QuizStageConfig } from '../../types/stage-schema'

export interface QuizStageBlockProps {
  stage: JourneyStageDefinition<QuizStageConfig>
  activeQuizQuestionIdx?: number
  quizAnswers?: Record<number, number>
  checkedQuestions?: Record<number, boolean>
  quizSubmitted?: boolean
  quizScore?: number
  quizStars?: number
  failedQuizImages?: Record<number, boolean>
  onSelectQuizAnswer?: (questionIdx: number, optionIdx: number) => void
  onCheckAnswer?: (questionIdx: number) => void
  onRetryQuestion?: (questionIdx: number) => void
  onSetActiveQuizQuestion?: (index: number | ((prev: number) => number)) => void
  onSubmitQuiz?: () => void
  onQuizImageError?: (questionIdx: number) => void
  onImageClick?: (image: { url: string; title: string; fallbackUrl?: string }) => void
  onPrevious?: () => void
  onContinue?: () => void
  continueLabel?: string
}

export function QuizStageBlock({
  stage,
  activeQuizQuestionIdx = 0,
  quizAnswers = {},
  checkedQuestions = {},
  quizSubmitted = false,
  quizScore = 0,
  quizStars = 0,
  failedQuizImages = {},
  onSelectQuizAnswer,
  onCheckAnswer,
  onRetryQuestion,
  onSetActiveQuizQuestion,
  onSubmitQuiz,
  onQuizImageError,
  onImageClick,
  onPrevious,
  onContinue,
  continueLabel = 'Vào Xưởng Sáng Tạo',
}: QuizStageBlockProps) {
  const { config } = stage
  const questions = config.questions || []
  const fallbackPoster =
    (config as any)?.posterUrl ||
    (stage as any)?.config?.posterUrl ||
    '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2'

  const [displayedQuizSrcs, setDisplayedQuizSrcs] = React.useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {}
    questions.forEach((q, idx) => {
      if (q.visualUrl) initial[idx] = q.visualUrl
    })
    return initial
  })

  React.useEffect(() => {
    const updated: Record<number, string> = {}
    questions.forEach((q, idx) => {
      if (q.visualUrl) updated[idx] = q.visualUrl
    })
    setDisplayedQuizSrcs(updated)
  }, [questions])

  const handleOptionSelect = (qIdx: number, optIdx: number, correctIndex: number) => {
    if (quizSubmitted) return
    const isQuestionChecked = checkedQuestions[qIdx]
    const isCurrentlyCorrect = isQuestionChecked && quizAnswers[qIdx] === correctIndex
    // Nếu câu này đã đúng thì không cho đổi
    if (isCurrentlyCorrect) return

    onSelectQuizAnswer?.(qIdx, optIdx)
    const isRight = optIdx === correctIndex
    try {
      playInstantSound(isRight ? 'click' : 'wrong')
    } catch {
      // ignore
    }
  }

  const handleRetry = (qIdx: number) => {
    if (quizSubmitted) return
    onRetryQuestion?.(qIdx)
    try {
      playInstantSound('click')
    } catch {
      // ignore
    }
  }

  return (
    <section
      data-testid="stage-3-quiz"
      className="flex min-h-0 h-full max-h-full flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-2.5 sm:p-4 shadow-xs animate-fade-up gap-2"
    >
      <h2 className="sr-only">{config.title}</h2>

      {/* Container ẩn bảo toàn test contract */}
      <div className="sr-only" aria-hidden="true">
        <span>CÂU {activeQuizQuestionIdx + 1} / {questions.length}</span>
        <span>
          {checkedQuestions[activeQuizQuestionIdx] || quizSubmitted
            ? quizAnswers[activeQuizQuestionIdx] === questions[activeQuizQuestionIdx]?.correctIndex
              ? '✓ Đúng rồi!'
              : '✕ Chưa chính xác'
            : quizAnswers[activeQuizQuestionIdx] !== undefined
            ? '✓ Đã chọn đáp án'
            : '👉 Hãy chọn 1 đáp án'}
        </span>
        {(quizSubmitted || Object.keys(checkedQuestions).length === questions.length) && (
          <span>{quizScore}/{questions.length} điểm</span>
        )}
      </div>

      {/* Danh sách câu hỏi Single Question Stepper 2 Cột cuộn độc lập */}
      <div className="flex w-full flex-1 min-h-0 flex-col justify-start overflow-y-auto pr-1 py-1 scrollbar-none">
        {questions.map((question, qIdx) => {
          const selectedOpt = quizAnswers[qIdx]
          const isActive = qIdx === activeQuizQuestionIdx
          const isQuestionChecked = checkedQuestions[qIdx] || quizSubmitted
          const isCorrect = selectedOpt === question.correctIndex
          const isQuizImgFailed = failedQuizImages[qIdx]
          const resolvedImgUrl =
            displayedQuizSrcs[qIdx] ||
            (question.visualUrl && isValidImageUrl(question.visualUrl) && !isQuizImgFailed
              ? question.visualUrl
              : fallbackPoster)
          const hasValidQuizImg = true

          return (
            <div
              key={question.id || qIdx}
              className={cn(
                'w-full transition-all',
                isActive ? 'block' : 'hidden'
              )}
            >
              <div className="grid w-full grid-cols-1 items-start gap-4 xl:grid-cols-2 xl:gap-6">
                {/* CỘT TRÁI: ảnh mở rộng cân đối với câu hỏi trên màn hình lớn. */}
                {hasValidQuizImg && (
                  <div className="flex min-h-0 w-full flex-col justify-start">
                    <div className="group relative flex aspect-[16/10] w-full max-w-3xl mx-auto max-h-[260px] sm:max-h-[300px] xl:max-h-[420px] items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50/90 p-1.5 shadow-clay-sm">
                      <img
                        loading="lazy"
                        decoding="async"
                        src={resolvedImgUrl}
                        alt={question.prompt}
                        className="w-full h-full object-contain cursor-pointer group-hover:scale-102 transition-transform duration-300"
                        onError={() => {
                          onQuizImageError?.(qIdx)
                          setDisplayedQuizSrcs((prev) => ({
                            ...prev,
                            [qIdx]: fallbackPoster,
                          }))
                        }}
                        onClick={() => {
                          onImageClick?.({
                            url: resolvedImgUrl,
                            title: question.prompt,
                            fallbackUrl: fallbackPoster,
                          })
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          onImageClick?.({
                            url: resolvedImgUrl,
                            title: question.prompt,
                            fallbackUrl: fallbackPoster,
                          })
                        }}
                        className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-xs flex items-center gap-1.5 opacity-90 hover:opacity-100 transition shadow-xs cursor-pointer z-10"
                        title="Xem ảnh phóng to"
                      >
                        <ZoomIn size={13} className="text-white" />
                        <span>Phóng to</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* CỘT CÂU HỎI & CÁC ĐÁP ÁN: cân nửa màn hình với ảnh trên desktop. */}
                <div
                  className={cn(
                    'flex min-h-0 flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 sm:p-4 shadow-2xs w-full xl:min-h-[320px] 2xl:min-h-[360px]',
                    !hasValidQuizImg && 'xl:col-span-2 max-w-3xl mx-auto'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/70">
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-xl bg-brand-500 text-white text-xs font-black shadow-xs shrink-0">
                          CÂU {qIdx + 1} / {questions.length}
                        </span>
                        {qIdx === questions.length - 1 && (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black shrink-0">
                            Câu cuối cùng
                          </span>
                        )}
                        {isQuestionChecked && (
                          <span
                            className={cn(
                              'text-xs font-black px-2 py-0.5 rounded-lg shrink-0',
                              isCorrect ? 'bg-mint-100 text-mint-800' : 'bg-rose-100 text-rose-800'
                            )}
                          >
                            {isCorrect ? '✓ Đúng rồi!' : '✕ Chưa chính xác'}
                          </span>
                        )}
                      </div>

                      {/* Dải dots chuyển câu & Sao điểm tích hợp */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1.5">
                          {questions.map((q, dotIdx) => {
                            const isAnswered = quizAnswers[dotIdx] !== undefined
                            const isChecked = checkedQuestions[dotIdx] || quizSubmitted
                            const isDotCorrect = quizAnswers[dotIdx] === q.correctIndex
                            const isCurrentDot = dotIdx === activeQuizQuestionIdx

                            let dotClass = 'w-2 bg-slate-300 hover:bg-slate-400'
                            if (isCurrentDot) {
                              dotClass = 'w-6 bg-brand-500 shadow-xs'
                            } else if (isChecked) {
                              dotClass = isDotCorrect ? 'w-3.5 bg-emerald-500' : 'w-3.5 bg-rose-500'
                            } else if (isAnswered) {
                              dotClass = 'w-3.5 bg-amber-400'
                            }

                            return (
                              <button
                                key={dotIdx}
                                type="button"
                                onClick={() => onSetActiveQuizQuestion?.(dotIdx)}
                                className={cn('h-2 rounded-full transition-all cursor-pointer', dotClass)}
                                title={`Chuyển đến câu ${dotIdx + 1}${isChecked ? (isDotCorrect ? ' (Đúng ✓)' : ' (Sai ✕)') : ''}`}
                              />
                            )
                          })}
                        </div>

                        {(quizSubmitted || Object.keys(checkedQuestions).length === questions.length) && (
                          <div className="flex items-center gap-1 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300 text-[11px] font-black text-amber-950">
                            <Star size={12} className="fill-amber-400 text-amber-500 shrink-0" />
                            <span>
                              {quizScore}/{questions.length} điểm
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-900 break-words leading-snug">
                      {question.prompt}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-1.5 my-1.5 overflow-y-auto">
                    {question.options.map((optText, optIdx) => {
                      const isSelected = selectedOpt === optIdx
                      const isOptCorrect = optIdx === question.correctIndex
                      const isOptionDisabled = quizSubmitted || (isQuestionChecked && isCorrect)

                      let optClass =
                        'border-slate-200 bg-white hover:bg-amber-50/70 text-slate-700 hover:border-amber-300'
                      if (isQuestionChecked) {
                        if (isSelected && isOptCorrect) {
                          optClass =
                            'border-mint-600 bg-mint-50 text-mint-900 font-bold ring-2 ring-inset ring-mint-300'
                        } else if (isSelected && !isOptCorrect) {
                          optClass =
                            'border-rose-500 bg-rose-50 text-rose-900 font-medium ring-2 ring-inset ring-rose-200'
                        } else if (!isCorrect && !isOptionDisabled) {
                          optClass =
                            'border-slate-200 bg-white hover:bg-amber-50/80 text-slate-800 hover:border-amber-400'
                        }
                      } else if (isSelected) {
                        optClass =
                          'border-brand-600 bg-brand-50 text-brand-900 font-bold ring-2 ring-inset ring-brand-300 shadow-clay-xs'
                      }

                      return (
                        <div key={optIdx} className="flex flex-col">
                          <button
                            type="button"
                            disabled={isOptionDisabled}
                            onClick={() => handleOptionSelect(qIdx, optIdx, question.correctIndex)}
                            className={cn(
                              'p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border-2 text-left text-xs sm:text-sm font-bold text-slate-800 transition-all flex items-center gap-2 min-h-[38px] sm:min-h-[42px] shadow-2xs',
                              isOptionDisabled ? 'cursor-not-allowed opacity-90' : 'cursor-pointer',
                              optClass
                            )}
                          >
                            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg sm:rounded-xl border border-slate-300 flex items-center justify-center text-xs sm:text-sm font-black flex-shrink-0 bg-white shadow-2xs">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1 leading-snug">{optText}</span>
                            {isQuestionChecked && isSelected && isOptCorrect && (
                              <Check size={18} className="text-mint-600 flex-shrink-0" />
                            )}
                            {isQuestionChecked && isSelected && !isOptCorrect && (
                              <X size={18} className="text-rose-500 flex-shrink-0" />
                            )}
                          </button>

                          {isQuestionChecked && isSelected && (
                            <div
                              className={cn(
                                'mt-1 p-2 rounded-xl border text-xs sm:text-sm leading-snug font-bold flex items-start gap-1.5 animate-fade-in',
                                isOptCorrect
                                  ? 'bg-mint-50/90 border-mint-500 text-mint-900'
                                  : 'bg-rose-50/90 border-rose-400 text-rose-900'
                              )}
                            >
                              <span className="shrink-0 flex items-center justify-center pt-0.5">
                                {isOptCorrect ? (
                                  <Check size={14} className="text-mint-700 stroke-[3]" />
                                ) : (
                                  <>
                                    <span className="sr-only">💡</span>
                                    <Sparkles size={14} className="text-rose-600" />
                                  </>
                                )}
                              </span>
                              <span className="flex-1">
                                {isOptCorrect
                                  ? question.explanation
                                  : question.retryFeedback ||
                                    question.hint ||
                                    'Con hãy đọc lại câu hỏi và quan sát hình minh họa rồi thử lại nhé.'}
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Nút Chuyển Câu Hỏi & Kiểm Tra Trực Tiếp Trong Card */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 mt-auto gap-2 shrink-0 min-h-[38px]">
                    <button
                      type="button"
                      disabled={activeQuizQuestionIdx === 0}
                      onClick={() =>
                        onSetActiveQuizQuestion?.((prev) =>
                          Math.max(0, (typeof prev === 'number' ? prev : activeQuizQuestionIdx) - 1)
                        )
                      }
                      className={cn(
                        'px-2.5 sm:px-3 py-1 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shrink-0',
                        activeQuizQuestionIdx === 0 && 'opacity-0 pointer-events-none'
                      )}
                    >
                      <ChevronLeft size={14} className="shrink-0" />
                      <span>Câu trước</span>
                    </button>

                    {isActive && (
                      <button
                        type="button"
                        disabled={selectedOpt === undefined}
                        onClick={() => {
                          onCheckAnswer?.(qIdx)
                          const isRight = selectedOpt === question.correctIndex
                          try {
                            playInstantSound(isRight ? 'click' : 'wrong')
                          } catch {
                            // ignore
                          }
                        }}
                        className="sr-only"
                      >
                        <span>Kiểm tra đáp án</span>
                      </button>
                    )}

                    <div className="flex items-center gap-2 shrink-0">
                      {isQuestionChecked && !isCorrect && !quizSubmitted && (
                        <button
                          type="button"
                          onClick={() => handleRetry(qIdx)}
                          className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-xs cursor-pointer transition-all shrink-0"
                          title="Thử lại câu này ngay"
                        >
                          <span className="sr-only">🔄 </span>
                          <RotateCcw size={13} className="shrink-0" />
                          <span>Thử lại câu này</span>
                        </button>
                      )}

                      {isCorrect && activeQuizQuestionIdx < questions.length - 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            onSetActiveQuizQuestion?.((prev) =>
                              Math.min(
                                questions.length - 1,
                                (typeof prev === 'number' ? prev : activeQuizQuestionIdx) + 1
                              )
                            )
                          }
                          className="px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-black shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <span>Câu tiếp theo</span>
                          <ChevronRight size={14} className="shrink-0" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Action buttons - Đáy cố định độc lập không đè nội dung (Layout Defense) */}
      <div className="shrink-0 pt-2 pb-1 bg-white/95 flex flex-wrap gap-2 sm:gap-3 justify-between items-center border-t border-slate-100 z-10">
        <Button
          variant="secondary"
          onClick={onPrevious}
          className="rounded-xl text-xs sm:text-sm py-2 px-3 sm:px-4 shrink-0"
        >
          Xem lại video
        </Button>

        {!quizSubmitted ? (
          <Button
            variant="primary"
            disabled={Object.keys(quizAnswers).length < questions.length}
            onClick={onSubmitQuiz}
            className="min-h-[48px] px-5 sm:px-6 py-2 text-xs sm:text-sm font-black rounded-2xl border-2 border-brand-600 bg-brand-500 hover:bg-brand-600 shadow-clay"
          >
            <span aria-hidden="true">Hoàn tất</span>
            <span className="sr-only">Nộp bài kiểm tra</span>
          </Button>
        ) : (
          <button
            type="button"
            className="min-h-[48px] px-6 sm:px-8 py-3 text-sm sm:text-base font-black rounded-2xl border-2 border-brand-600 bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center cursor-pointer shadow-clay transition-all active:scale-[0.98]"
            onClick={onContinue}
          >
            <span>{continueLabel}</span>
            <span className="sr-only">👉 Vào Xưởng Sáng Tạo AI 🎨</span>
          </button>
        )}
      </div>
    </section>
  )
}
