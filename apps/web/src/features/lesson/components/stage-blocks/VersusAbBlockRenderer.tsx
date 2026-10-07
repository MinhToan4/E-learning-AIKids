import React from 'react'
import {
  BrainCircuit,
  Check,
  ChevronRight,
  Sparkles,
  ZoomIn,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import {
  ZicoDrawingFallback,
  SonetDrawingFallback,
} from '@/features/lesson/components/AikiRuleVisuals'
import {
  type LearnCardDraft,
  type StageBlockItem,
  parseVersusOption,
} from '@/features/teacher/lib/authoring'

export const getStationFallbackImages = (sNum: number): [string, string] => {
  if (sNum === 1) return ['/assets/aiki-rules/rule1_opt_zico.webp', '/assets/aiki-rules/rule1_opt_sonet.webp']
  return [`/assets/aiki-rules/rule${sNum}_opt_a.webp`, `/assets/aiki-rules/rule${sNum}_opt_b.webp`]
}

export interface VersusAbBlockRendererProps {
  block: StageBlockItem
  card: LearnCardDraft
  riddle: any
  answers: Record<string, number>
  answerFeedback: Record<string, { correct: boolean; explanation: string }>
  checkingQuestionId?: string | null
  isMobile: boolean
  isAikiRuleJourney: boolean
  stageIndex: number
  stationNum: number
  onChooseAnswer: (questionId: string, optionIndex: number) => void
  onZoomImage?: (data: {
    title: string
    subtitle?: string
    url?: string
    description?: string
    isFallbackZico?: boolean
    isFallbackSonet?: boolean
    onSelect?: () => void
  }) => void
  onNextStage?: (nextStageIndex: number) => void
}

export function VersusAbBlockRenderer({
  block,
  card,
  riddle,
  answers,
  answerFeedback,
  checkingQuestionId,
  isMobile,
  isAikiRuleJourney,
  stageIndex,
  stationNum,
  onChooseAnswer,
  onZoomImage,
  onNextStage,
}: VersusAbBlockRendererProps) {
  const feedback = answerFeedback[riddle.id]
  const isChecking = checkingQuestionId === riddle.id
  const selectedAnswer = answers[riddle.id]
  const stationFallback = getStationFallbackImages(stationNum)

  return (
    <div
      key={block.id}
      data-testid="block-versus-ab"
      className="rounded-3xl border-3 border-brand-200 bg-white p-3 sm:p-6 md:p-7 shadow-clay animate-fade-up text-left space-y-5"
    >
      <div className="flex items-center justify-between gap-2 border-b border-brand-100 pb-3">
        <div className="flex items-center gap-2 text-brand-700 font-extrabold text-sm uppercase tracking-wider">
          <BrainCircuit size={20} className="text-brand-600" />
          {block.title || 'Tư liệu học tập · Quan sát & Đối chiếu tranh'}
        </div>
        <span className="rounded-full bg-brand-100 px-3 py-0.5 text-xs font-black text-brand-800">
          {isAikiRuleJourney ? `Chặng ${stageIndex + 1}/5` : 'Đối chiếu A/B'}
        </span>
      </div>

      <p className="font-display text-xl sm:text-2xl text-brand-950 font-black leading-snug">
        {block.body || riddle.question}
      </p>
      <div className="flex items-center justify-between flex-wrap gap-2 text-sm sm:text-base font-bold text-amber-900 bg-amber-50/80 px-4 py-2.5 rounded-2xl border border-amber-200">
        <div className="flex items-center gap-2">
          <span>👀</span>
          <span>Bé hãy quan sát kỹ 2 bức tranh bên dưới và bấm chọn Phương án đúng:</span>
        </div>
      </div>

      <div className={cn(isMobile ? "grid grid-cols-1 gap-4 pt-2 items-start" : "grid gap-6 grid-cols-1 md:grid-cols-2 pt-2 items-start")}>
        {riddle.options.map((opt: string, optIdx: number) => {
          const isSelected = selectedAnswer === optIdx
          const isCorrect = isSelected && feedback?.correct
          const isWrong = isSelected && feedback && !feedback.correct
          const optLetter = String.fromCharCode(65 + optIdx)
          const parsed = parseVersusOption(opt, optIdx, card.tip)

          // Xử lý tiêu đề và mô tả: Nếu nhãn chứa 'Zico' nhưng stationNum > 1, bỏ qua và dùng parsed
          const hasZicoInLabels = Boolean(
            (block.optionLabels && block.optionLabels.some((l: string) => /zico/i.test(l))) ||
            (card.optionLabels && card.optionLabels.some((l: string) => /zico/i.test(l)))
          )
          const shouldUseLabels = !(stationNum > 1 && hasZicoInLabels)

          const rawOptTitle = shouldUseLabels
            ? (block.optionLabels && block.optionLabels[optIdx]) || (card.optionLabels && card.optionLabels[optIdx])
            : undefined
          const optTitle = rawOptTitle || parsed.title

          const rawOptDesc = shouldUseLabels
            ? (block.optionDescs && block.optionDescs[optIdx]) || (card.optionDescs && card.optionDescs[optIdx])
            : undefined
          const optDesc = rawOptDesc || parsed.desc

          const optImageUrl =
            (block.optionImages && block.optionImages[optIdx]) ||
            (card.optionImages && card.optionImages[optIdx]) ||
            stationFallback[optIdx]

          return (
            <div
              key={opt}
              className="flex flex-col gap-3 self-start w-full"
            >
              {/* Khung tranh lớn, to bản với nút xem to */}
              <div
                onClick={() => onChooseAnswer(riddle.id, optIdx)}
                className={cn(
                  'relative w-full aspect-[4/3] shrink-0 overflow-hidden rounded-3xl border-3 bg-slate-100 group shadow-md flex items-center justify-center cursor-pointer transition-all duration-200',
                  isSelected
                    ? isCorrect
                      ? 'border-mint-500 ring-4 ring-mint-300/50 shadow-clay'
                      : isWrong
                      ? 'border-coral-400 ring-4 ring-coral-300/50'
                      : 'border-brand-500'
                    : 'border-border hover:border-brand-300'
                )}
              >
                {optImageUrl ? (
                  <img
                    src={optImageUrl}
                    alt={optTitle}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                ) : stationNum === 1 ? (
                  optIdx === 0 ? (
                    <ZicoDrawingFallback className="size-full min-h-0" />
                  ) : (
                    <SonetDrawingFallback className="size-full min-h-0" />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted p-4 text-center">
                    <Sparkles className="size-12 text-brand-400 mb-2" />
                    <p className="font-bold text-sm">Hình minh họa {optLetter}</p>
                  </div>
                )}

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className={cn(
                    "grid size-9 place-items-center rounded-xl text-sm font-black shadow-xs backdrop-blur-md transition-colors",
                    isSelected
                      ? isCorrect
                        ? 'bg-mint-500 text-white'
                        : isWrong
                        ? 'bg-coral-500 text-white'
                        : 'bg-brand-500 text-white'
                      : 'bg-black/60 text-white'
                  )}>
                    {optLetter}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onZoomImage?.({
                      title: optTitle,
                      subtitle: `Phương án ${optLetter} · Chi tiết tranh`,
                      url: optImageUrl,
                      isFallbackZico: !optImageUrl && optIdx === 0 && stationNum === 1,
                      isFallbackSonet: !optImageUrl && optIdx === 1 && stationNum === 1,
                      description:
                        optDesc ||
                        (stationNum === 1
                          ? (optIdx === 0
                            ? 'Bức tranh vẽ siêu nhân quen thuộc giống như trên phim, ai cũng có thể vẽ hoặc sao chép tương tự nhau.'
                            : 'Bức tranh vẽ Bố dũng cảm cầm vợt muỗi bảo vệ cả nhà — câu chuyện đời thật độc nhất vô nhị chỉ có ở gia đình con!')
                          : `Phương án ${optLetter}`),
                      onSelect: () => onChooseAnswer(riddle.id, optIdx),
                    })
                  }}
                  className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-black text-white backdrop-blur-sm transition hover:bg-black/90 active:scale-95 shadow-xs cursor-pointer"
                  title="Phóng to xem tranh chi tiết"
                >
                  <ZoomIn size={15} />
                  <span>🔍 Xem to</span>
                </button>
              </div>

              {/* Nút chọn phương án to bản chuẩn Soft Clay */}
              <button
                type="button"
                disabled={isChecking}
                onClick={() => onChooseAnswer(riddle.id, optIdx)}
                className={cn(
                  'group relative flex items-start gap-3.5 p-4 sm:p-5 rounded-3xl border-3 text-left transition-all duration-150 shadow-clay active:scale-[0.98] cursor-pointer',
                  isSelected
                    ? isCorrect
                      ? 'border-mint-500 bg-mint-50 text-mint-950 ring-4 ring-mint-300/50 shadow-clay'
                      : isWrong
                      ? 'border-coral-400 bg-coral-50 text-coral-950 ring-4 ring-coral-300/50'
                      : 'border-brand-500 bg-brand-50 text-brand-950'
                    : 'border-border bg-white hover:border-brand-400 hover:bg-brand-50/30 text-text'
                )}
              >
                <span
                  className={cn(
                    'grid size-11 shrink-0 place-items-center rounded-2xl text-lg font-black shadow-xs transition-transform group-hover:scale-105',
                    isSelected
                      ? isCorrect
                        ? 'bg-mint-500 text-white'
                        : isWrong
                        ? 'bg-coral-500 text-white'
                        : 'bg-brand-500 text-white'
                      : optIdx === 0
                      ? 'bg-amber-100 text-amber-900 border-2 border-amber-300'
                      : 'bg-sky-100 text-sky-900 border-2 border-sky-300'
                  )}
                >
                  {optLetter}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-muted">
                      Phương án {optLetter}
                    </span>
                    {isCorrect && (
                      <span className="flex items-center gap-1 rounded-full bg-mint-500 text-white px-2.5 py-0.5 text-xs font-black shadow-xs">
                        <Check size={14} /> Chính xác!
                      </span>
                    )}
                  </div>
                  <h4 className="mt-0.5 font-display text-base sm:text-lg font-black leading-tight text-text">
                    {optTitle}
                  </h4>
                  {optDesc && (
                    <p className="mt-1.5 text-xs sm:text-sm font-semibold leading-relaxed text-slate-700">
                      👉 {optDesc}
                    </p>
                  )}
                </div>
              </button>
            </div>
          )
        })}
      </div>

      {/* Bảng Giải Thích 3 Bước Sư Phạm xuất hiện ngay bên dưới 2 tranh ở Cột Trái */}
      {feedback && (
        <div
          className={cn(
            'mt-6 rounded-3xl border-3 p-5 sm:p-6 shadow-clay animate-fade-up text-left space-y-3.5',
            feedback.correct
              ? 'border-mint-400 bg-mint-50/90 text-mint-950 ring-4 ring-mint-200/50'
              : 'border-coral-300 bg-coral-50/90 text-coral-950'
          )}
          role="status"
        >
          <div className="flex items-center justify-between gap-3 border-b border-current/15 pb-3">
            <div className="flex items-center gap-2.5 font-display text-lg sm:text-xl font-black">
              <span className="text-2xl">{feedback.correct ? '🎉' : '💡'}</span>
              <span>
                {feedback.correct
                  ? 'Con đã chọn rất chính xác! Giải thích 3 bước sư phạm:'
                  : 'Chưa đúng rồi! Cùng phân tích để ghi nhớ nhé:'}
              </span>
            </div>
            {feedback.correct && (
              <span className="rounded-full bg-mint-500 text-white px-3 py-1 text-xs font-black shadow-xs shrink-0">
                +1 ⭐ Xuất sắc
              </span>
            )}
          </div>

          <div className="grid gap-3 pt-1 text-sm sm:text-base font-sans">
            <div className="flex items-start gap-3 bg-white/90 p-3.5 rounded-2xl border border-current/10 shadow-2xs">
              <span className="font-black text-brand-700 shrink-0 bg-brand-100 px-2.5 py-1 rounded-xl text-xs sm:text-sm">
                Bước 1 · Nhận diện
              </span>
              <span className="font-semibold text-slate-800 leading-relaxed">
                Quan sát kỹ hai bức tranh và chi tiết khác biệt trong câu lệnh tạo ảnh.
              </span>
            </div>
            <div className="flex items-start gap-3 bg-white/90 p-3.5 rounded-2xl border border-current/10 shadow-2xs">
              <span className="font-black text-amber-800 shrink-0 bg-amber-100 px-2.5 py-1 rounded-xl text-xs sm:text-sm">
                Bước 2 · Phân tích
              </span>
              <span className="font-semibold text-slate-800 leading-relaxed">
                {feedback.explanation ||
                  riddle.explanation ||
                  'AI chỉ vẽ theo dữ liệu cụ thể ta cung cấp; thiếu chi tiết AI sẽ tự đoán bừa.'}
              </span>
            </div>
            <div className="flex items-start gap-3 bg-white/90 p-3.5 rounded-2xl border border-current/10 shadow-2xs">
              <span className="font-black text-mint-800 shrink-0 bg-mint-100 px-2.5 py-1 rounded-xl text-xs sm:text-sm">
                Bước 3 · Kết luận
              </span>
              <span className="font-semibold text-slate-800 leading-relaxed">
                Luôn áp dụng công thức miêu tả rõ ràng, độc đáo và không sao chép tác phẩm của người khác!
              </span>
            </div>
          </div>

          {feedback.correct && onNextStage && (
            <div className="pt-3 flex justify-end">
              <Button
                variant="primary"
                className="h-12 px-6 font-black text-sm sm:text-base rounded-2xl shadow-clay cursor-pointer flex items-center gap-2"
                onClick={() => onNextStage(stageIndex + 1)}
              >
                <span>Tiếp tục sang Chặng {stageIndex + 2}</span>
                <ChevronRight className="size-5" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
