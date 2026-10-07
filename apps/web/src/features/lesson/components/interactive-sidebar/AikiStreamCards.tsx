import React from 'react'
import {
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Star,
  Target,
  Trophy,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/Button'
import { playInstantSound } from '@/features/lesson/lib/lesson-sound'
import type { AikiRuleQuestion } from '@/features/rules/types'
import type { InteractiveRiddle } from './types'

export interface AikiStreamCardsProps {
  isAikiMode: boolean
  currentStageIndex: number
  activeQuestion: AikiRuleQuestion
  aikiQuizSelected: number | null
  aikiQuizStatus: 'idle' | 'correct' | 'incorrect'
  onSelectAikiQuiz: (optIdx: number) => void
  onRetryQuiz: () => void
  onSeekVideo?: (sec: number) => void
  seekExplainSec?: number
  onNextStage?: (nextStageIndex: number) => void
  onOpenPosterModal?: () => void
  onAcknowledgeRule?: () => void
  onRewardStar?: () => void
  hasCommitted?: boolean
  onToggleCommit?: () => void
  onAikiFinish?: () => void
  busy?: boolean
  riddle?: InteractiveRiddle
  goals?: string[]
  onSelectOption: (idx: number) => void
}

export function AikiStreamCards({
  isAikiMode,
  currentStageIndex,
  activeQuestion,
  aikiQuizSelected,
  aikiQuizStatus,
  onSelectAikiQuiz,
  onRetryQuiz,
  onSeekVideo,
  seekExplainSec = 38,
  onNextStage,
  onOpenPosterModal,
  onAcknowledgeRule,
  onRewardStar,
  hasCommitted = false,
  onToggleCommit,
  onAikiFinish,
  busy = false,
  riddle,
  goals = [],
  onSelectOption,
}: AikiStreamCardsProps) {
  return (
    <div className="overflow-y-auto hidden-scrollbar flex-1 min-h-0 pr-1 space-y-3">
      {/* ── CHẶNG 0: TÌNH HUỐNG (Zico & Sonet giằng tranh) ────────────────── */}
      {isAikiMode && currentStageIndex === 0 && (
        <div className="flex flex-col gap-3.5 rounded-3xl border-2 border-brand-200 bg-brand-50/60 p-4 sm:p-5 shadow-clay animate-fade-up">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-brand-800">
              <BookOpen className="size-4 text-brand-600" />
              Chặng 1: Tình Huống
            </span>
            <span className="rounded-full bg-brand-200 text-brand-800 text-[11px] font-black px-2.5 py-0.5">
              1 / 5
            </span>
          </div>

          <div className="rounded-2xl bg-white border border-brand-200/80 p-3.5 space-y-2 text-slate-800">
            <div className="flex items-center gap-2 text-red-600 font-bold text-xs">
              <span>⚡</span>
              <span>Zico & Sonet đang giằng co tranh:</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold italic text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              &quot;Của tớ đẹp hơn!&quot; — &quot;Không, của tớ đúng hơn!&quot;
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
              🐱 AIKI hốt hoảng: <em>&quot;DỪNG LẠIII...! Các cậu ơi, hãy giúp tớ vụ này!&quot;</em>
            </p>
          </div>

          <p className="text-xs font-semibold text-slate-600 leading-snug">
            Cô giáo ra đề bài gì mà hai bạn lại tranh cãi nảy lửa thế nhỉ? Cùng bấm nút bên dưới để xem câu đố của AIKI nhé!
          </p>

          {onNextStage && (
            <Button
              variant="primary"
              className="w-full h-12 font-black text-sm rounded-2xl shadow-clay cursor-pointer flex items-center justify-center gap-2 mt-1 bg-brand-500 hover:bg-brand-600 text-white"
              onClick={() => {
                playInstantSound('click')
                onNextStage(1)
              }}
            >
              <span>Giúp AIKI giải quyết ➔</span>
              <ChevronRight className="size-5" />
            </Button>
          )}
        </div>
      )}

      {/* ── CHẶNG 1: CÂU ĐỐ CỦA AIKI (Tranh nào đúng yêu cầu cô giáo?) ───────── */}
      {isAikiMode && currentStageIndex === 1 && (
        <div className="flex flex-col gap-3.5 rounded-3xl border-2 border-brand-200/90 bg-white p-4 sm:p-5 shadow-clay animate-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow-xs">
                ❓
              </span>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-brand-600">
                  Chặng 2
                </span>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                  Câu Đố Của AIKI
                </h3>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-800">
              <Award className="size-3.5 text-amber-600" />
              +1 ⭐
            </span>
          </div>

          {/* Đề bài câu hỏi */}
          <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-3 text-left space-y-1">
            <p className="text-xs font-black uppercase tracking-wider text-amber-900">
              Đề bài của cô giáo:
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
              &quot;Vẽ nhân vật siêu anh hùng của con...&quot;
            </p>
          </div>

          <p className="text-xs sm:text-sm font-black text-slate-800">
            Bức nào mới đúng yêu cầu của cô? Bấm chọn đi nào!
          </p>

          {/* 2 Lựa chọn A (Zico) vs B (Sonet) */}
          <div className="space-y-2.5">
            {activeQuestion.options.map((optText, optIdx) => {
              const isSelected = aikiQuizSelected === optIdx
              const isCorrectOpt = optIdx === activeQuestion.correctIndex
              const isWrongSelection = aikiQuizStatus === 'incorrect' && isSelected
              const isCorrectSelection = aikiQuizStatus === 'correct' && isSelected

              return (
                <button
                  key={optIdx}
                  type="button"
                  disabled={aikiQuizStatus === 'correct'}
                  onClick={() => onSelectAikiQuiz(optIdx)}
                  className={cn(
                    'w-full text-left p-3 sm:p-4 rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all duration-200 flex flex-col gap-1 cursor-pointer shadow-xs active:scale-[0.99]',
                    aikiQuizStatus === 'idle' &&
                      !isSelected &&
                      'border-slate-200 bg-white text-slate-800 hover:border-brand-400 hover:bg-brand-50/40',
                    isCorrectSelection || (aikiQuizStatus === 'correct' && isCorrectOpt)
                      ? 'border-mint-500 bg-mint-50 text-mint-950 ring-2 ring-mint-300 font-black'
                      : aikiQuizStatus === 'correct' && !isCorrectOpt
                        ? 'border-slate-100 bg-slate-50 text-slate-400 opacity-50'
                        : null,
                    isWrongSelection &&
                      'border-rose-400 bg-rose-50 text-rose-950 ring-2 ring-rose-200',
                    aikiQuizStatus === 'incorrect' &&
                      !isSelected &&
                      'border-slate-200 bg-white text-slate-500 opacity-70',
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        'grid size-6 place-items-center rounded-xl text-xs font-black shrink-0 border mt-0.5',
                        isCorrectSelection || (aikiQuizStatus === 'correct' && isCorrectOpt)
                          ? 'bg-mint-500 text-white border-mint-600'
                          : isWrongSelection
                            ? 'bg-rose-500 text-white border-rose-600'
                            : 'bg-slate-100 text-slate-700 border-slate-200',
                      )}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="leading-snug flex-1">{optText}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Phản hồi khi chọn sai */}
          {aikiQuizStatus === 'incorrect' && (
            <div className="flex flex-col gap-2 pt-1 animate-fade-up">
              <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-3 text-xs sm:text-sm font-semibold text-amber-950 flex items-start gap-2">
                <span className="text-xl">🐱</span>
                <div>
                  <span className="font-black text-amber-900 block mb-0.5">
                    AIKI mách nhỏ:
                  </span>
                  {activeQuestion.retryFeedback}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onRetryQuiz}
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Thử chọn lại</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSeekVideo?.(seekExplainSec)}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>↺ Xem lại video</span>
                </button>
              </div>
            </div>
          )}

          {/* Phản hồi khi chọn đúng */}
          {aikiQuizStatus === 'correct' && (
            <div className="flex flex-col gap-3 pt-1 animate-fade-up">
              <div className="rounded-2xl border-2 border-mint-300 bg-mint-50 p-3.5 text-mint-950 text-xs sm:text-sm font-semibold flex items-start gap-2.5 shadow-2xs">
                <CheckCircle2 className="size-5 text-mint-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-mint-900 block mb-1">
                    Chính xác 100%! (+1 ⭐)
                  </span>
                  {activeQuestion.successFeedback}
                </div>
              </div>

              {onNextStage && (
                <Button
                  variant="primary"
                  className="w-full h-12 rounded-2xl font-black text-sm shadow-clay cursor-pointer flex items-center justify-center gap-2 bg-mint-500 hover:bg-mint-600 text-white"
                  onClick={() => {
                    playInstantSound('click')
                    onNextStage(2)
                  }}
                >
                  <span>Xem Quy Tắc Vàng ➔</span>
                  <ChevronRight className="size-5" />
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── CHẶNG 2: QUY TẮC VÀNG (Poster trượt vào, nghĩ ý tưởng trước) ────── */}
      {isAikiMode && currentStageIndex === 2 && (
        <div className="flex flex-col gap-3.5 rounded-3xl border-2 border-amber-300 bg-amber-50/70 p-4 sm:p-5 shadow-clay animate-fade-up">
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-amber-900">
              <Star className="size-4 fill-amber-400 text-amber-600" />
              Chặng 3: Khắc Ghi Quy Tắc 1
            </span>
            <span className="text-xs font-black text-amber-800">+1 ⭐</span>
          </div>

          {/* Mini Poster Card */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 p-4 text-center text-slate-950 shadow-md">
            <span className="inline-block rounded-full bg-white/90 text-amber-900 text-[10px] font-black px-2.5 py-0.5 mb-1.5 uppercase tracking-wider shadow-2xs">
              Quy Tắc Sáng Tạo 1
            </span>
            <p className="font-display text-base sm:text-lg font-black text-slate-950 leading-snug">
              &quot;Hãy nghĩ ý tưởng của cậu, rồi mới chia sẻ với AIKI nhé!&quot;
            </p>
          </div>

          <div className="space-y-1.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white/80 p-3 rounded-2xl border border-amber-200">
            <p>
              👦 <strong>Zico gõ trước:</strong> Ra nhân vật ai cũng vẽ được (rập khuôn).
            </p>
            <p className="text-brand-900 font-bold">
              🧒 <strong>Sonet nghĩ trước:</strong> Ra nhân vật chỉ mình bạn ấy nghĩ ra (độc nhất vô nhị)!
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            {onOpenPosterModal && (
              <button
                type="button"
                className="w-full py-2 rounded-xl bg-white hover:bg-slate-50 border border-amber-200 text-amber-900 font-bold text-xs transition cursor-pointer"
                onClick={onOpenPosterModal}
              >
                🔍 Xem lại Poster phóng to
              </button>
            )}

            <Button
              variant="primary"
              className="w-full h-12 font-black text-sm rounded-2xl shadow-clay cursor-pointer flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950"
              onClick={() => {
                playInstantSound('star')
                onAcknowledgeRule?.()
                onRewardStar?.()
                onNextStage?.(3)
              }}
            >
              <Check className="size-4" />
              <span>Con đã hiểu quy tắc (+1⭐) ➔</span>
            </Button>
          </div>
        </div>
      )}

      {/* ── CHẶNG 3: GIẢI THÍCH (Kho hình AI vs Bộ não của con) ─────────────── */}
      {isAikiMode && currentStageIndex === 3 && (
        <div className="flex flex-col gap-3.5 rounded-3xl border-2 border-sky-300 bg-sky-50/70 p-4 sm:p-5 shadow-clay animate-fade-up">
          <div className="flex items-center justify-between border-b border-sky-200/60 pb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-sky-900">
              <Target className="size-4 text-sky-600" />
              Chặng 4: Bí Quyết Tư Duy
            </span>
            <span className="text-xs font-black text-sky-800">4 / 5</span>
          </div>

          <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
            Đối chiếu giữa Kho hình trong đầu AI và Bộ não sáng tạo của con:
          </p>

          {/* 2 Khối so sánh */}
          <div className="space-y-2">
            <div className="rounded-2xl bg-white border border-slate-200 p-3 text-xs text-slate-700">
              <p className="font-black text-slate-900 mb-1 flex items-center gap-1.5">
                <span>📦</span>
                <span>Kho Dữ Liệu Trong Đầu AIKI:</span>
              </p>
              <p className="leading-snug text-slate-600">
                Gõ &quot;siêu anh hùng ngầu&quot; là AIKI lấy ngay cái quen thuộc nhất trong hàng trăm ngàn mẫu có sẵn ra.
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-mint-200 p-3 text-xs text-slate-700">
              <p className="font-black text-mint-900 mb-1 flex items-center gap-1.5">
                <span>🧠</span>
                <span>Bộ Não Sáng Tạo Của Bé:</span>
              </p>
              <p className="leading-snug text-mint-950 font-semibold">
                Cái sợ con gián, cái vợt muỗi ấy — chỉ có trong đầu con thôi, AI chịu không thể tự đoán được!
              </p>
            </div>
          </div>

          {onNextStage && (
            <Button
              variant="primary"
              className="w-full h-12 font-black text-sm rounded-2xl shadow-clay cursor-pointer flex items-center justify-center gap-2 mt-1 bg-sky-500 hover:bg-sky-600 text-white"
              onClick={() => {
                playInstantSound('click')
                onNextStage(4)
              }}
            >
              <span>Xem lời dặn của AIKI ➔</span>
              <ChevronRight className="size-5" />
            </Button>
          )}
        </div>
      )}

      {/* ── CHẶNG 4: CHỐT (Lời dặn của AIKI, Nhận Cúp Hiệp Sĩ) ──────────────── */}
      {isAikiMode && currentStageIndex === 4 && (
        <div className="flex flex-col gap-3.5 rounded-3xl border-2 border-mint-300 bg-mint-50/70 p-4 sm:p-5 shadow-clay animate-fade-up">
          <div className="flex items-center justify-between border-b border-mint-200/60 pb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-mint-900">
              <Trophy className="size-4 text-mint-600" />
              Chặng 5: Lời Nhắn Nhủ & Nhận Cúp
            </span>
            <span className="text-xs font-black text-mint-800">5 / 5</span>
          </div>

          {/* Lời nhắn nhủ AIKI */}
          <div className="rounded-2xl bg-white border border-mint-200 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-brand-800 font-black text-xs">
              <span>🐱</span>
              <span>Mèo AIKI vẫy tay chong chóng tre:</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed italic bg-brand-50/60 p-2.5 rounded-xl border border-brand-100">
              &quot;Lần sau, cậu thử nghĩ xem nhân vật của mình có gì mà{' '}
              <strong className="text-brand-900">KHÔNG GIỐNG ai hết</strong> nhé. Còn bây giờ, tớ phải đi đây, hẹn gặp lại các cậu nhaaaa!&quot;
            </p>
          </div>

          {/* Checkbox cam kết */}
          {onToggleCommit && (
            <label className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-mint-200 cursor-pointer shadow-2xs">
              <input
                type="checkbox"
                checked={hasCommitted}
                onChange={() => {
                  playInstantSound('star')
                  if (!hasCommitted) {
                    onRewardStar?.()
                  }
                  onToggleCommit()
                }}
                className="size-5 rounded text-mint-600 focus:ring-mint-400 cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                Con hứa luôn nghĩ ý tưởng của mình trước khi nhờ AI ✨ (+1 ⭐)
              </span>
            </label>
          )}

          {onAikiFinish && (
            <Button
              variant="primary"
              disabled={busy}
              className="w-full h-12 font-black text-sm rounded-2xl shadow-clay cursor-pointer flex items-center justify-center gap-2 mt-1 bg-mint-500 hover:bg-mint-600 text-white"
              onClick={() => {
                playInstantSound('star')
                onAikiFinish()
              }}
            >
              <Trophy className="size-5" />
              <span>{busy ? 'Đang cấp chứng chỉ…' : '🏆 Nhận Cúp Hiệp Sĩ & Tiếp tục'}</span>
            </Button>
          )}
        </div>
      )}

      {/* ── BÀI HỌC THƯỜNG (NON-AIKI MODE FALLBACKS) ───────────────────────── */}
      {!isAikiMode && (
        <>
          {currentStageIndex === 1 && riddle && (
            <div className="flex flex-col gap-3 rounded-2xl border-2 border-brand-300 bg-white p-4 shadow-clay">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-black uppercase text-brand-600">Câu đố phản xạ</span>
                <span className="text-xs font-black text-amber-700">+1 ⭐</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800">{riddle.question}</p>
              <div className="space-y-2">
                {riddle.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectOption(idx)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 text-xs font-semibold hover:border-brand-400"
                  >
                    {typeof opt === 'string' ? opt : opt.text || opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {goals.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-xs">
              <span className="font-black text-slate-700 uppercase tracking-wider block mb-1.5">
                Mục tiêu trạm học
              </span>
              <ul className="space-y-1">
                {goals.slice(0, 3).map((g, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 font-medium text-slate-600">
                    <Check className="size-3.5 text-mint-600 shrink-0 mt-0.5" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
