import React from 'react'
import { Check, X, Star, ArrowRight } from 'lucide-react'
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
  quizStars = 1,
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
  continueLabel = '👉 Vào Xưởng Sáng Tạo AI 🎨',
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
      playInstantSound(isRight ? 'star' : 'wrong')
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
      className="flex min-h-0 flex-col gap-3 overflow-y-auto rounded-3xl border-2 border-brand-100 bg-white p-3 shadow-clay animate-fade-up sm:p-4"
    >
      <h2 className="sr-only">{config.title}</h2>

      {/* Dải chỉ báo tiến độ & trạng thái câu hỏi 1 hàng duy nhất */}
      <div className="flex items-center justify-between gap-2 p-2 bg-amber-50/70 rounded-2xl border border-amber-200/80 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2.5 py-0.5 rounded-xl bg-brand-500 text-white text-xs font-black shadow-xs shrink-0">
            CÂU {activeQuizQuestionIdx + 1} / {questions.length}
          </span>
          <span className="text-xs font-bold text-slate-700 truncate">
            {checkedQuestions[activeQuizQuestionIdx] || quizSubmitted
              ? quizAnswers[activeQuizQuestionIdx] === questions[activeQuizQuestionIdx]?.correctIndex
                ? '✓ Đúng rồi!'
                : '✕ Chưa chính xác'
              : quizAnswers[activeQuizQuestionIdx] !== undefined
              ? '✓ Đã chọn đáp án'
              : '👉 Hãy chọn 1 đáp án'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            {questions.map((q, dotIdx) => {
              const isAnswered = quizAnswers[dotIdx] !== undefined
              const isChecked = checkedQuestions[dotIdx] || quizSubmitted
              const isCorrect = quizAnswers[dotIdx] === q.correctIndex
              const isActive = dotIdx === activeQuizQuestionIdx

              let dotClass = 'w-2.5 bg-slate-300 hover:bg-slate-400'
              if (isActive) {
                dotClass = 'w-8 bg-brand-500 shadow-xs'
              } else if (isChecked) {
                dotClass = isCorrect ? 'w-4 bg-emerald-500' : 'w-4 bg-rose-500'
              } else if (isAnswered) {
                dotClass = 'w-4 bg-amber-400'
              }

              return (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => onSetActiveQuizQuestion?.(dotIdx)}
                  className={cn(
                    'h-2.5 rounded-full transition-all cursor-pointer',
                    dotClass
                  )}
                  title={`Chuyển đến câu ${dotIdx + 1}${isChecked ? (isCorrect ? ' (Đúng ✓)' : ' (Sai ✕)') : ''}`}
                />
              )
            })}
          </div>

          {(quizSubmitted || Object.keys(checkedQuestions).length === questions.length) && (
            <div className="flex items-center gap-1 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  size={14}
                  className={cn(
                    s <= quizStars ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                  )}
                />
              ))}
              <span className="text-xs font-bold text-amber-900 ml-1">
                {quizScore}/{questions.length} điểm
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Danh sách câu hỏi Single Question Stepper 2 Cột */}
      <div className="w-full min-h-0">
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
              <div className="grid w-full min-h-0 grid-cols-1 items-start gap-4 xl:grid-cols-12 xl:gap-5">
                {/* CỘT TRÁI: Ảnh To Rõ Ràng - Dọc mặc định, 5/12 cols trên XL */}
                {hasValidQuizImg && (
                  <div className="flex min-h-0 flex-col justify-center w-full xl:col-span-5">
                    <div className="group relative flex aspect-[16/10] w-full max-w-xl mx-auto max-h-[260px] sm:max-h-[300px] items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-100 shadow-clay-sm">
                      <img
                        loading="lazy"
                        decoding="async"
                        src={resolvedImgUrl}
                        alt={question.prompt}
                        className="w-full h-full object-cover cursor-pointer group-hover:scale-103 transition-transform duration-300"
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
                        <span>🔍 Phóng to</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* CỘT CÂU HỎI & CÁC ĐÁP ÁN: 100% width nếu không có ảnh, 7 COLS NẾU CÓ ẢNH TRÊN XL */}
                <div
                  className={cn(
                    'flex min-h-0 flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 sm:p-5 shadow-2xs w-full',
                    hasValidQuizImg ? 'xl:col-span-7' : 'xl:col-span-12 max-w-3xl mx-auto'
                  )}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-xl bg-brand-500 text-white text-xs font-black shadow-xs">
                        CÂU {qIdx + 1}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-900 break-words leading-snug">
                      {question.prompt}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-2 my-2 overflow-y-auto">
                    {question.options.map((optText, optIdx) => {
                      const isSelected = selectedOpt === optIdx
                      const isOptCorrect = optIdx === question.correctIndex
                      const isOptionDisabled = quizSubmitted || (isQuestionChecked && isCorrect)

                      let optClass =
                        'border-slate-200 bg-white hover:bg-amber-50/70 text-slate-700 hover:border-amber-300'
                      if (isQuestionChecked) {
                        if (isSelected && isOptCorrect) {
                          optClass =
                            'border-mint-500 bg-mint-50 text-mint-900 font-bold ring-2 ring-mint-300'
                        } else if (isSelected && !isOptCorrect) {
                          optClass =
                            'border-rose-400 bg-rose-50 text-rose-900 font-medium ring-2 ring-rose-200'
                        } else if (!isCorrect && !isOptionDisabled) {
                          optClass =
                            'border-slate-200 bg-white hover:bg-amber-50/80 text-slate-800 hover:border-amber-400'
                        }
                      } else if (isSelected) {
                        optClass =
                          'border-brand-500 bg-brand-50 text-brand-900 font-bold ring-2 ring-brand-300 shadow-clay-xs scale-[1.01]'
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={isOptionDisabled}
                          onClick={() => handleOptionSelect(qIdx, optIdx, question.correctIndex)}
                          className={cn(
                            'p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 text-left text-xs sm:text-sm md:text-base font-bold text-slate-800 transition-all flex items-center gap-2.5 min-h-[44px] sm:min-h-[48px] shadow-2xs',
                            isOptionDisabled ? 'cursor-not-allowed opacity-90' : 'cursor-pointer',
                            optClass
                          )}
                        >
                          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl border border-slate-300 flex items-center justify-center text-xs sm:text-sm font-black flex-shrink-0 bg-white shadow-2xs">
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
                      )
                    })}

                    {isQuestionChecked && question.explanation && (
                      <div className="mt-1 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 leading-relaxed font-bold flex items-start gap-2">
                        <span className="text-base shrink-0">💡</span>
                        <span className="flex-1">{question.explanation}</span>
                        {!isCorrect && !quizSubmitted && (
                          <button
                            type="button"
                            onClick={() => handleRetry(qIdx)}
                            className="ml-auto px-2.5 py-1 rounded-xl bg-amber-200 hover:bg-amber-300 active:scale-95 text-amber-950 font-black text-xs flex items-center gap-1 shrink-0 cursor-pointer transition-all shadow-2xs"
                            title="Làm lại câu này"
                          >
                            <span>🔄 Thử lại</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Nút Chuyển Câu Hỏi & Kiểm Tra Trực Tiếp Trong Card */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 mt-auto gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={activeQuizQuestionIdx === 0}
                      onClick={() => onSetActiveQuizQuestion?.((prev) => Math.max(0, (typeof prev === 'number' ? prev : activeQuizQuestionIdx) - 1))}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                    >
                      <span>←</span> <span>Câu trước</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {isActive && (
                        <button
                          type="button"
                          disabled={selectedOpt === undefined}
                          onClick={() => {
                            onCheckAnswer?.(qIdx)
                            const isRight = selectedOpt === question.correctIndex
                            try {
                              playInstantSound(isRight ? 'star' : 'wrong')
                            } catch {
                              // ignore
                            }
                          }}
                          className="sr-only"
                        >
                          <span>Kiểm tra đáp án ✨</span>
                        </button>
                      )}

                      {isQuestionChecked && (
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              'px-3 py-1 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1',
                              isCorrect
                                ? 'bg-mint-100 text-mint-800'
                                : 'bg-rose-100 text-rose-800'
                            )}
                          >
                            {isCorrect ? '✓ Đúng rồi!' : '✕ Chưa chính xác'}
                          </span>
                          {!isCorrect && !quizSubmitted && (
                            <button
                              type="button"
                              onClick={() => handleRetry(qIdx)}
                              className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center gap-1 shadow-xs cursor-pointer transition-all"
                              title="Thử lại câu này ngay"
                            >
                              <span>🔄 Thử lại câu này</span>
                            </button>
                          )}
                        </div>
                      )}

                      {activeQuizQuestionIdx < questions.length - 1 ? (
                        <button
                          type="button"
                          onClick={() =>
                            onSetActiveQuizQuestion?.((prev) =>
                              Math.min(questions.length - 1, (typeof prev === 'number' ? prev : activeQuizQuestionIdx) + 1)
                            )
                          }
                          className="px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-black shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <span>Câu tiếp theo</span> <span>→</span>
                        </button>
                      ) : (
                        <span className="text-xs sm:text-sm font-bold text-amber-900">
                          Câu cuối cùng
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Action buttons - Sticky đáy */}
      <div className="shrink-0 pt-2 pb-1 bg-white/95 backdrop-blur-xs flex flex-wrap gap-2 sm:gap-3 justify-between items-center border-t border-slate-100 sticky bottom-0 z-20">
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
            className="px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-base font-black rounded-xl"
          >
            Nộp bài kiểm tra
          </Button>
        ) : (
          <Button
            variant="primary"
            className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg font-black rounded-2xl shadow-clay border-b-[4px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center gap-2 cursor-pointer"
            onClick={onContinue}
          >
            <span>{continueLabel}</span>
            <ArrowRight size={20} />
          </Button>
        )}
      </div>
    </section>
  )
}
