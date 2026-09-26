import React, { useState } from 'react'
import { Check, X, RotateCcw, BrainCircuit, Sparkles } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { AikiRuleQuestion } from '@/features/rules/types'
import { Button } from '@/shared/components/ui/Button'

export interface AikiRuleQuizProps {
  questions: AikiRuleQuestion[]
  ruleId: number
  onComplete?: () => void
  onNextStage?: () => void
  className?: string
}

type QuestionState = 'answering' | 'correct' | 'incorrect' | 'completed'

export function AikiRuleQuiz({
  questions,
  ruleId,
  onComplete,
  onNextStage,
  className,
}: AikiRuleQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [questionState, setQuestionState] = useState<QuestionState>('answering')

  if (!questions || questions.length === 0) return null

  const currentQuestion = questions[currentQuestionIndex] ?? questions[0]
  const isLastQuestion = currentQuestionIndex >= questions.length - 1

  const handleSelectOption = (optIdx: number) => {
    if (questionState === 'correct') return
    setSelectedOption(optIdx)

    // Phản hồi tức thì
    if (optIdx === currentQuestion.correctIndex) {
      setQuestionState('correct')
    } else {
      setQuestionState('incorrect')
    }
  }

  const handleRetry = () => {
    setSelectedOption(null)
    setQuestionState('answering')
  }

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedOption(null)
      setQuestionState('answering')
    } else {
      setQuestionState('completed')
      onComplete?.()
      onNextStage?.()
    }
  }

  return (
    <div
      data-testid="aiki-rule-quiz"
      className={cn(
        'rounded-3xl border-3 border-brand-200 bg-white p-5 sm:p-6 shadow-clay animate-fade-up text-left space-y-4',
        className
      )}
    >
      {/* Header Câu đố & Dots */}
      <div className="flex items-center justify-between border-b border-brand-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-100 text-brand-800 font-black">
            <BrainCircuit size={18} />
          </div>
          <div>
            <h2 className="font-display text-base sm:text-lg font-black text-text">
              Thử tài câu hỏi ôn tập Quy tắc {ruleId}
            </h2>
            <p className="text-[11px] font-bold text-muted">
              Chọn đáp án để kiểm tra khả năng nhớ bài của con nhé!
            </p>
          </div>
        </div>

        {/* Dots chỉ thị Câu 1, Câu 2 */}
        <div className="flex items-center gap-1.5" aria-label={`Câu hỏi ${currentQuestionIndex + 1} trên ${questions.length}`}>
          {questions.map((_, qIdx) => {
            const isActive = qIdx === currentQuestionIndex
            const isPassed = qIdx < currentQuestionIndex || (qIdx === currentQuestionIndex && questionState === 'correct')
            return (
              <span
                key={qIdx}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-all shadow-2xs',
                  isActive
                    ? 'bg-brand-500 text-white ring-2 ring-brand-200'
                    : isPassed
                      ? 'bg-mint-500 text-white'
                      : 'bg-slate-100 text-slate-500'
                )}
              >
                {qIdx + 1}
              </span>
            )
          })}
        </div>
      </div>

      {/* Nội dung câu hỏi */}
      <div className="rounded-2xl bg-brand-50/60 p-4 border-2 border-brand-100">
        <span className="inline-block rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-black text-brand-800 mb-1.5">
          Câu {currentQuestionIndex + 1}/{questions.length}
        </span>
        <p className="font-display text-base sm:text-lg font-bold text-text leading-relaxed">
          {currentQuestion.prompt}
        </p>
      </div>

      {/* Danh sách 3 phương án A, B, C */}
      <div className="space-y-2.5">
        {currentQuestion.options.map((optionText: string, idx: number) => {
          const isSelected = selectedOption === idx
          const isCorrect = idx === currentQuestion.correctIndex
          const optLetter = String.fromCharCode(65 + idx)

          return (
            <button
              key={idx}
              type="button"
              disabled={questionState === 'correct'}
              onClick={() => handleSelectOption(idx)}
              className={cn(
                'w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 flex items-start gap-3 cursor-pointer active:scale-[0.99]',
                // Answering: chưa chọn
                questionState === 'answering' &&
                  !isSelected &&
                  'border-slate-200 bg-white text-text hover:border-brand-300 hover:bg-brand-50/40 shadow-2xs',
                // Answering: đang chọn
                questionState === 'answering' &&
                  isSelected &&
                  'border-brand-500 bg-brand-50 text-brand-900 font-black ring-2 ring-brand-200 shadow-xs',
                // Correct
                questionState === 'correct' &&
                  isCorrect &&
                  'border-mint-500 bg-mint-50 text-mint-950 font-black ring-2 ring-mint-200 shadow-xs',
                questionState === 'correct' &&
                  !isCorrect &&
                  'border-slate-100 bg-slate-50 text-slate-400 opacity-60',
                // Incorrect
                questionState === 'incorrect' &&
                  isSelected &&
                  'border-coral-500 bg-coral-50 text-coral-950 font-black ring-2 ring-coral-200 shadow-xs',
                questionState === 'incorrect' &&
                  !isSelected &&
                  'border-slate-200 bg-white text-slate-500 opacity-80'
              )}
            >
              <div className="mt-0.5 shrink-0">
                {questionState === 'correct' && isCorrect ? (
                  <span className="grid size-6 place-items-center rounded-full bg-mint-500 text-white shadow-2xs">
                    <Check size={16} className="stroke-[3]" />
                  </span>
                ) : questionState === 'incorrect' && isSelected ? (
                  <span className="grid size-6 place-items-center rounded-full bg-coral-500 text-white shadow-2xs">
                    <X size={16} className="stroke-[3]" />
                  </span>
                ) : (
                  <span
                    className={cn(
                      'grid size-6 place-items-center rounded-full border-2 text-xs font-black',
                      isSelected
                        ? 'border-brand-500 bg-brand-500 text-white'
                        : 'border-slate-300 bg-slate-50 text-slate-700'
                    )}
                  >
                    {optLetter}
                  </span>
                )}
              </div>
              <span className="leading-snug flex-1">{optionText}</span>
            </button>
          )
        })}
      </div>

      {/* Hộp phản hồi tức thì */}
      {questionState === 'correct' && (
        <div className="rounded-2xl border-2 border-mint-300 bg-mint-50 p-4 text-mint-950 animate-pop">
          <div className="flex items-center gap-2 font-black text-sm sm:text-base text-mint-800">
            <Sparkles size={18} className="text-mint-600" />
            <span>Con chọn hoàn toàn chính xác! 🎉</span>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm font-semibold leading-relaxed">
            {currentQuestion.successFeedback || 'Giỏi quá con ơi! Con đã hiểu rất rõ quy tắc này!'}
          </p>
          <div className="mt-3 pt-2.5 border-t border-mint-200 flex justify-end">
            <Button
              variant="primary"
              className="h-10 px-4 font-extrabold shadow-clay cursor-pointer"
              onClick={handleNext}
            >
              <span>{isLastQuestion ? 'Tiếp tục sang Chặng 3: Poster Vàng' : 'Tiếp tục sang Câu 2'}</span>
            </Button>
          </div>
        </div>
      )}

      {questionState === 'incorrect' && (
        <div className="rounded-2xl border-2 border-coral-300 bg-coral-50 p-4 text-coral-950 animate-pop">
          <div className="flex items-center gap-2 font-black text-sm sm:text-base text-coral-800">
            <span>💡</span>
            <span>Chưa chuẩn rồi con ơi, thử lại nhé!</span>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm font-semibold leading-relaxed">
            {currentQuestion.retryFeedback || currentQuestion.hint || 'Bé hãy đọc kỹ lại câu hỏi và các phương án nhé!'}
          </p>
          <div className="mt-3 pt-2.5 border-t border-coral-200 flex justify-end">
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-coral-300 bg-white px-3.5 py-1.5 text-xs font-bold text-coral-800 hover:bg-coral-50 shadow-2xs transition cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Thử chọn lại</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
