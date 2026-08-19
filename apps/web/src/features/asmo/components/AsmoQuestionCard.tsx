import { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Award,
  Navigation,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react'
import type { AsmoQuestion } from '../types'
import { AsmoFormula } from './AsmoFormula'
import { AsmoMeeTutor } from './AsmoMeeTutor'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

type Props = {
  question: AsmoQuestion
  questionIndex?: number
  totalQuestions?: number
  selectedAnswer?: string | null
  onSelectAnswer?: (answerId: string) => void
  showSolutionImmediately?: boolean
  onNext?: () => void
  activeInteractiveStep?: number
  onInteractiveStepChange?: (stepIndex: number) => void
  className?: string
}

export function AsmoQuestionCard({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer: controlledSelected,
  onSelectAnswer,
  showSolutionImmediately = true,
  onNext,
  activeInteractiveStep,
  onInteractiveStepChange,
  className,
}: Props) {
  const [internalSelected, setInternalSelected] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [internalStep, setInternalStep] = useState(0)

  const currentSelected = controlledSelected !== undefined ? controlledSelected : internalSelected
  const currentStep = activeInteractiveStep !== undefined ? activeInteractiveStep : internalStep

  const handleSelect = (optionId: string) => {
    if (onSelectAnswer) {
      onSelectAnswer(optionId)
    } else {
      setInternalSelected(optionId)
    }
    if (showSolutionImmediately) {
      setShowExplanation(true)
    }
  }

  const handleStepChange = (newStep: number) => {
    if (onInteractiveStepChange) {
      onInteractiveStepChange(newStep)
    } else {
      setInternalStep(newStep)
    }
  }

  const isAnswered = currentSelected !== null && currentSelected !== undefined
  const isCorrect = isAnswered && currentSelected === question.correctAnswer
  const steps = question.explanationSteps ?? []
  const hasSteps = steps.length > 0

  return (
    <div className={cn('rounded-3xl border border-slate-200/80 bg-white/95 p-5 sm:p-7 shadow-clay backdrop-blur-md flex flex-col gap-5', className)}>
      {/* Header / Meta */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 rounded-xl bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
            {question.topicName}
          </span>
          <span className="rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 font-mono">
            {question.topicCode}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {questionIndex !== undefined && totalQuestions !== undefined && (
            <span className="text-xs font-bold text-slate-500">
              Câu {questionIndex + 1}/{totalQuestions}
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-xl bg-sun-100 px-2.5 py-1 text-xs font-extrabold text-amber-800">
            <Award className="size-3 text-amber-600" />
            +{question.points} điểm
          </span>
        </div>
      </div>

      {/* Question Text */}
      <div className="space-y-2">
        <AsmoFormula
          text={question.title}
          className="text-base sm:text-lg font-bold text-slate-900 leading-snug"
        />
        <AsmoFormula
          text={question.text}
          className="text-sm sm:text-base text-slate-700 leading-relaxed font-sans"
        />
      </div>

      {/* Options List */}
      <div className="flex flex-col gap-2.5">
        {question.options.map((opt) => {
          const isThisSelected = currentSelected === opt.id
          const isThisCorrect = opt.id === question.correctAnswer

          let optionStyle = 'border-slate-200 bg-slate-50/60 hover:bg-brand-50/50 hover:border-brand-300 text-slate-800'
          if (showExplanation && isAnswered) {
            if (isThisCorrect) {
              optionStyle = 'border-mint-400 bg-mint-50/90 text-mint-900 font-bold ring-2 ring-mint-300'
            } else if (isThisSelected && !isThisCorrect) {
              optionStyle = 'border-coral-300 bg-coral-50/80 text-coral-900'
            }
          } else if (isThisSelected) {
            optionStyle = 'border-brand-500 bg-brand-50/90 text-brand-900 font-bold ring-2 ring-brand-300'
          }

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.id)}
              className={cn(
                'group flex items-center justify-between gap-3 rounded-2xl border p-3.5 sm:p-4 text-left transition-all duration-200 active:scale-[0.99] cursor-pointer',
                optionStyle,
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-xl font-bold text-xs shadow-xs transition-colors',
                    isThisSelected
                      ? 'bg-brand-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 group-hover:border-brand-400',
                  )}
                >
                  {opt.label}
                </span>
                <AsmoFormula text={opt.text} className="text-sm sm:text-base leading-snug" />
              </div>

              {showExplanation && isAnswered && (
                <div className="shrink-0">
                  {isThisCorrect ? (
                    <CheckCircle2 className="size-5 text-mint-600 animate-in zoom-in-50 duration-200" />
                  ) : isThisSelected ? (
                    <XCircle className="size-5 text-coral-500 animate-in zoom-in-50 duration-200" />
                  ) : null}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Mèo Mee Tutor Coaching (Chỉ hiển thị khi luyện tập, không hiển thị trong phòng thi) */}
      {showSolutionImmediately && (
        <AsmoMeeTutor
          pose={
            !isAnswered
              ? 'guide'
              : isCorrect
                ? 'celebrate'
                : 'support'
          }
          speech={
            !isAnswered
              ? 'Con hãy quan sát kỹ đề bài hoặc mô hình 3D để tìm quy luật nhé!'
              : isCorrect
                ? 'Tuyệt vời lắm! Con đã tư duy rất chính xác!'
                : 'Chưa đúng rồi nhưng không sao cả! Đọc lời giải chi tiết của Mee để hiểu bản chất nhé!'
          }
          hint={question.meeHint}
          compact
        />
      )}

      {/* Detailed Solution Box & Interactive 3D Step Player */}
      {showExplanation && isAnswered && (
        <div className="flex flex-col gap-3 rounded-2xl border border-mint-200 bg-mint-50/70 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-mint-900 text-xs uppercase tracking-wider">
              <CheckCircle2 className="size-4 text-mint-600" />
              <span>Phân Tích & Lời Giải Chi Tiết</span>
            </div>
            {hasSteps && (
              <span className="inline-flex items-center gap-1 rounded-full bg-mint-200/70 px-2 py-0.5 text-[11px] font-bold text-mint-800">
                <Sparkles className="size-3 text-mint-700" />
                Mô phỏng 3D
              </span>
            )}
          </div>

          <AsmoFormula
            text={question.explanation}
            className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans"
          />

          {/* Interactive Steps / Grid Paths Visualizer Widget */}
          {hasSteps && (
            <div className="mt-2 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-3.5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-indigo-900 flex items-center gap-1.5">
                  <Navigation className="size-3.5 text-indigo-600" />
                  <span>Mô phỏng trực tiếp trên 3D:</span>
                </span>
                <span className="text-xs font-mono font-bold text-indigo-700">
                  {currentStep + 1} / {steps.length}
                </span>
              </div>

              {/* Step Navigation Bar */}
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleStepChange((currentStep - 1 + steps.length) % steps.length)}
                  className="inline-flex items-center gap-1 rounded-xl bg-white border border-indigo-200 px-2.5 py-1.5 text-xs font-bold text-indigo-700 shadow-xs hover:bg-indigo-100/60 transition-all active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="size-3.5" />
                  <span>Trước</span>
                </button>

                <div className="min-w-0 flex-1 text-center">
                  <p className="truncate text-xs font-bold text-indigo-950">
                    {steps[currentStep]?.title}
                  </p>
                  <p className="truncate text-[11px] text-indigo-700">
                    {steps[currentStep]?.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleStepChange((currentStep + 1) % steps.length)}
                  className="inline-flex items-center gap-1 rounded-xl bg-white border border-indigo-200 px-2.5 py-1.5 text-xs font-bold text-indigo-700 shadow-xs hover:bg-indigo-100/60 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Tiếp</span>
                  <ChevronRight className="size-3.5" />
                </button>
              </div>

              {/* Quick step/path pills */}
              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-indigo-100">
                {steps.map((step, idx) => {
                  const isCurrent = idx === currentStep
                  return (
                    <button
                      key={step.stepIndex}
                      type="button"
                      onClick={() => handleStepChange(idx)}
                      className={cn(
                        'rounded-lg px-2 py-1 text-[11px] font-bold transition-all active:scale-95 cursor-pointer',
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white/80 hover:bg-white text-indigo-800 border border-indigo-200/80',
                      )}
                    >
                      {step.code ? `Đường ${idx + 1}` : `Bước ${idx + 1}`}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Next Button */}
      {onNext && isAnswered && (
        <div className="flex justify-end pt-2">
          <Button
            type="button"
            variant="primary"
            onClick={onNext}
            className="gap-2 rounded-2xl px-5 font-bold"
          >
            <span>Câu tiếp theo</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
