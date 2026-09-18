import React, { useState } from 'react'
import {
  HelpCircle,
  Star,
  CheckCircle2,
  XCircle,
  RotateCcw,
  PencilLine,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import { AsmoFormula } from '../AsmoFormula'
import type { AsmoLmsLesson } from '../../data/asmo-curriculum-lms'

export interface AsmoLessonWorkspaceProps {
  lesson: AsmoLmsLesson
  selectedOptionId: string | null
  onSelectOption: (id: string) => void
  quizSubmitted: boolean
  isQuizCorrect: boolean
  earnedStars: number
  onRetryQuiz: () => void
}

export function AsmoLessonWorkspace({
  lesson,
  selectedOptionId,
  onSelectOption,
  quizSubmitted,
  isQuizCorrect,
  earnedStars,
  onRetryQuiz,
}: AsmoLessonWorkspaceProps) {
  const [showScratchpad, setShowScratchpad] = useState(false)
  const [scratchNotes, setScratchNotes] = useState('')

  return (
    <div className="rounded-3xl border-2 border-brand-100 shadow-clay bg-white p-5 sm:p-7 space-y-6 animate-fade-up">
      {/* Question Header Card */}
      <div className="rounded-2xl bg-brand-50/80 border-2 border-brand-100 p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-brand-100 pb-2.5 flex-wrap gap-2">
          <span className="text-xs font-black text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="size-4 text-brand-600" />
            <span><AsmoFormula text={lesson.quiz.questionTitle} /></span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowScratchpad(!showScratchpad)}
              className={cn(
                "rounded-xl px-2.5 py-1 text-xs font-bold border transition-colors flex items-center gap-1 cursor-pointer",
                showScratchpad
                  ? "bg-brand-500 text-white border-brand-600"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              )}
              title="Mở nháp nháp tính toán"
            >
              <PencilLine className="size-3.5" />
              <span>{showScratchpad ? 'Đóng nháp' : 'Nháp tính'}</span>
            </button>
            <span className="rounded-xl bg-sun-100 px-3 py-1 text-xs font-black text-sun-950 border border-sun-200 shadow-2xs">
              ⭐ 1–3 Sao + {lesson.xpReward} XP
            </span>
          </div>
        </div>

        <div className="text-base sm:text-lg font-extrabold text-slate-900 leading-relaxed">
          <AsmoFormula text={lesson.quiz.questionText} />
        </div>
      </div>

      {/* Optional Scratchpad Area */}
      {showScratchpad && (
        <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/60 p-3 space-y-2 animate-fade-up">
          <div className="flex items-center justify-between text-xs font-black text-amber-900">
            <span>📝 Giấy nháp tính toán của bé:</span>
            <button
              type="button"
              onClick={() => setScratchNotes('')}
              className="text-amber-700 hover:text-amber-900 font-bold underline text-[11px] cursor-pointer"
            >
              Xóa nháp
            </button>
          </div>
          <textarea
            value={scratchNotes}
            onChange={(e) => setScratchNotes(e.target.value)}
            placeholder="Viết các phép tính nháp tại đây (ví dụ: 12 + 8 = 20)..."
            rows={3}
            className="w-full rounded-xl border border-amber-200 bg-white p-2.5 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400 resize-y"
          />
        </div>
      )}

      {/* 4 Options Grid (A, B, C, D) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {lesson.quiz.options.map((opt) => {
          const isSelected = selectedOptionId === opt.id
          const isCorrect = opt.isCorrect

          let optClass = 'bg-white border-slate-200 text-slate-800 hover:border-brand-300 hover:bg-brand-50/40 shadow-xs'
          if (quizSubmitted) {
            if (isCorrect) {
              optClass = 'bg-mint-50 border-mint-500 text-mint-950 ring-2 ring-mint-400 font-extrabold shadow-sm'
            } else if (isSelected && !isCorrect) {
              optClass = 'bg-coral-50 border-coral-500 text-coral-950 ring-2 ring-coral-300 font-bold'
            }
          } else if (isSelected) {
            optClass = 'bg-brand-50 border-brand-500 text-brand-900 ring-2 ring-brand-400 font-extrabold shadow-clay'
          }

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectOption(opt.id)}
              className={cn(
                'flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.99] cursor-pointer select-none',
                optClass,
              )}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className={cn(
                    'size-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs',
                    isSelected
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-700',
                  )}
                >
                  {opt.label}
                </span>
                <span className="text-sm sm:text-base font-bold leading-snug">
                  <AsmoFormula text={opt.text} />
                </span>
              </div>

              {quizSubmitted && (
                <div>
                  {isCorrect ? (
                    <CheckCircle2 className="size-6 text-mint-600 shrink-0 animate-in zoom-in-50" />
                  ) : isSelected ? (
                    <XCircle className="size-6 text-coral-600 shrink-0 animate-in zoom-in-50" />
                  ) : null}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Quiz Immediate Feedback Banner */}
      {quizSubmitted && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {isQuizCorrect ? (
            <div className="rounded-3xl bg-mint-50 border-2 border-mint-200 p-6 text-center space-y-3.5 shadow-clay">
              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Star
                    key={`star-${i}`}
                    className={cn(
                      'size-9 transition-all',
                      i < earnedStars
                        ? 'text-amber-400 fill-amber-400 drop-shadow-md animate-bounce'
                        : 'text-slate-300 fill-slate-200',
                    )}
                  />
                ))}
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black text-mint-950">
                  🎉 CHÍNH XÁC XUẤT SẮC! BÉ ĐÃ ĐẠT {earnedStars} SAO!
                </h3>
                <p className="text-xs sm:text-sm font-bold text-mint-900 mt-1">
                  <AsmoFormula text={lesson.quiz.correctExplanation} />
                </p>
                {lesson.quiz.formulaExplanation && (
                  <div className="mt-2 inline-block px-3 py-1 bg-white/90 rounded-xl border border-mint-200 text-xs font-mono font-bold text-mint-900">
                    <AsmoFormula text={`$$${lesson.quiz.formulaExplanation}$$`} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-coral-50 border-2 border-coral-200 p-6 text-center space-y-3 shadow-clay">
              <h3 className="text-base sm:text-lg font-black text-coral-950">
                Chưa chính xác rồi! Hãy xem lại bí kíp của Mèo Mee và thử lại nhé!
              </h3>
              <p className="text-xs sm:text-sm font-bold text-coral-800">
                Bí kíp: Hãy quay lại Tab 2 &quot;Mẹo Mèo Mee &amp; Bí kíp&quot; để nắm vững phương pháp giải!
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onRetryQuiz}
                  className="gap-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 font-extrabold shadow-2xs px-6 py-2.5 cursor-pointer"
                >
                  <RotateCcw className="size-4" />
                  <span>Thử Chọn Lại</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
