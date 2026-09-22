import React, { useState, useMemo } from 'react'
import {
  BrainCircuit,
  Check,
  ChevronRight,
  Clock3,
  Lightbulb,
  MessageSquareText,
  MoveRight,
  Printer,
  ScanSearch,
  Sparkles,
  Square,
  Star,
  Target,
  Trophy,
  Volume2,
  ZoomIn,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/Button'
import { LectureVideo } from '@/features/lesson/components/LectureVideo'
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
import {
  AiWarehouseVisual,
  KidBrainVisual,
  CreativeKnightBadgeVisual,
  ZicoDrawingFallback,
  SonetDrawingFallback,
} from '@/features/lesson/components/AikiRuleVisuals'
import {
  type LearnCardDraft,
  type StageBlockItem,
  getStageBlocks,
  parseComicDialogue,
  parseVersusOption,
  type ParsedDialogue,
  type DialogueLine,
} from '@/features/teacher/lib/authoring'
import { useAikiSituationNarrator } from '@/features/lesson/hooks/useAikiSituationNarrator'
import { playInstantSound } from '@/features/lesson/components/LessonInteractiveSidebar'

function readableFormula(value: string): string {
  return value
    .replace(/^\s*\$\$?|\$\$?\s*$/g, '')
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\(?:cdot|times)/g, '×')
    .replace(/\\(?:Rightarrow|rightarrow)/g, '→')
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)')
    .trim()
}

export interface StudentStageBlocksViewProps {
  card: LearnCardDraft
  stageIndex: number
  isAikiRuleJourney?: boolean
  isMobile?: boolean
  quest?: any
  // Zoom image modal trigger
  onZoomImage?: (data: {
    title: string
    subtitle?: string
    url?: string
    description?: string
    isFallbackZico?: boolean
    isFallbackSonet?: boolean
    onSelect?: () => void
  }) => void
  // Riddle A/B interaction
  answers?: Record<string, number>
  answerFeedback?: Record<string, { correct: boolean; explanation: string }>
  checkingQuestionId?: string | null
  onChooseAnswer?: (questionId: string, optionIndex: number) => void
  onRewardStar?: () => void
  // Situation narrator
  isNarratingSituation?: boolean
  speakingLineIndex?: number
  activeSpeaker?: string | null
  onPlaySituation?: (dialogues: any[], fullText?: string) => void
  onStopSituationNarrator?: () => void
  onManualMeeCue?: (cue: { key: number; text: string; gesture?: any }) => void
  // Poster & acknowledgment
  hasAcknowledgedRule?: boolean
  onAcknowledgeRule?: () => void
  onOpenPosterModal?: () => void
  // Knight commitment
  hasCommitted?: boolean
  onToggleCommit?: () => void
  onAikiFinish?: () => void
  // Navigation
  onNextStage?: (nextStageIndex: number) => void
  busy?: boolean
}

export const getStationFallbackImages = (sNum: number): [string, string] => {
  if (sNum === 1) return ['/assets/aiki-rules/rule1_opt_zico.webp', '/assets/aiki-rules/rule1_opt_sonet.webp']
  return [`/assets/aiki-rules/rule${sNum}_opt_a.webp`, `/assets/aiki-rules/rule${sNum}_opt_b.webp`]
}

export function StudentStageBlocksView({
  card,
  stageIndex,
  isAikiRuleJourney = false,
  isMobile = false,
  quest,
  onZoomImage,
  answers: externalAnswers,
  answerFeedback: externalFeedback,
  checkingQuestionId: externalCheckingId,
  onChooseAnswer,
  onRewardStar,
  isNarratingSituation: externalIsNarrating,
  speakingLineIndex: externalSpeakingLineIndex,
  activeSpeaker: externalActiveSpeaker,
  onPlaySituation,
  onStopSituationNarrator,
  onManualMeeCue,
  hasAcknowledgedRule: externalAcknowledged,
  onAcknowledgeRule,
  onOpenPosterModal,
  hasCommitted: externalCommitted,
  onToggleCommit,
  onAikiFinish,
  onNextStage,
  busy = false,
}: StudentStageBlocksViewProps) {
  // Xác định số thứ tự trạm (1..10) từ card.id, quest.id, hoặc tiêu đề
  const getStationNumber = (): number => {
    const text = `${card.id || ''} ${quest?.id || ''} ${card.title || ''} ${quest?.title || ''}`
    const m = text.match(/qt(\d+)/i) || text.match(/quy\s*t[aắ]c\s*(\d+)/i) || text.match(/rule\s*(\d+)/i)
    if (m) return parseInt(m[1], 10)
    return 1
  }
  const stationNum = getStationNumber()

  // Local fallbacks if external state/hooks are not provided
  const internalNarrator = useAikiSituationNarrator()
  const isNarrating = externalIsNarrating !== undefined ? externalIsNarrating : internalNarrator.isPlaying
  const speakingLineIndex = externalSpeakingLineIndex !== undefined ? externalSpeakingLineIndex : internalNarrator.speakingLineIndex
  const activeSpeaker = externalActiveSpeaker !== undefined ? externalActiveSpeaker : internalNarrator.activeSpeaker

  const [localAnswers, setLocalAnswers] = useState<Record<string, number>>({})
  const [localFeedback, setLocalFeedback] = useState<Record<string, { correct: boolean; explanation: string }>>({})
  const [localAcknowledged, setLocalAcknowledged] = useState(false)
  const [localCommitted, setLocalCommitted] = useState(false)

  const answers = externalAnswers || localAnswers
  const answerFeedback = externalFeedback || localFeedback
  const hasAcknowledgedRule = externalAcknowledged !== undefined ? externalAcknowledged : localAcknowledged
  const hasCommitted = externalCommitted !== undefined ? externalCommitted : localCommitted

  // Resolve blocks using authoring getStageBlocks
  const stageBlocks = useMemo(() => {
    return getStageBlocks(card, stageIndex)
  }, [card, stageIndex])

  // Riddle helper
  const defaultRiddle = useMemo(() => {
    if (quest?.check?.[0]) return quest.check[0]
    if (stationNum === 1) {
      return {
        id: 'aiki-stage-riddle',
        question: card.body || 'Bức tranh nào đúng yêu cầu của cô giáo?',
        options: [
          'Bức của Zico (vẽ siêu anh hùng đẹp nhưng ai cũng vẽ được)',
          'Bức của Sonet (siêu anh hùng bố cầm vợt muỗi của riêng bạn ấy)',
        ],
      }
    }
    return {
      id: `aiki-stage-riddle-qt${stationNum}`,
      question: card.body || `Phương án nào thể hiện đúng Quy tắc ${stationNum}?`,
      options: [
        'Phương án A (Cách làm chưa chuẩn)',
        'Phương án B (Cách làm đúng theo quy tắc)',
      ],
    }
  }, [quest, card.body, stationNum])

  const handleChooseAnswerInternal = (riddleId: string, optIdx: number) => {
    const expectedCorrectIdx = quest?.check?.[0]?.correctIndex ?? (stationNum === 1 ? 1 : 1)
    const isCorrect = optIdx === expectedCorrectIdx
    playInstantSound(isCorrect ? 'correct' : 'wrong')
    if (isCorrect) {
      playInstantSound('star')
      onRewardStar?.()
    }

    if (onChooseAnswer) {
      onChooseAnswer(riddleId, optIdx)
    } else {
      setLocalAnswers((prev) => ({ ...prev, [riddleId]: optIdx }))
      setLocalFeedback((prev) => ({
        ...prev,
        [riddleId]: {
          correct: isCorrect,
          explanation: isCorrect
            ? (stationNum === 1
                ? 'Bức tranh của Sonet thể hiện tình huống đời thật độc nhất vô nhị chỉ có ở gia đình con!'
                : 'Con chọn hoàn toàn chính xác! Hãy áp dụng quy tắc này nhé!')
            : (stationNum === 1
                ? 'Bức tranh này rất đẹp nhưng ai cũng có thể vẽ tương tự. Con hãy chọn bức tranh độc nhất nhé!'
                : 'Chưa chính xác rồi. Con hãy xem kỹ lại hai phương án nhé!'),
        },
      }))
    }
  }

  const handlePlaySituationInternal = (dialogues: any[], fullText?: string) => {
    if (onPlaySituation) {
      onPlaySituation(dialogues, fullText)
    } else {
      internalNarrator.playSituation(dialogues, fullText)
    }
    if (onManualMeeCue) {
      onManualMeeCue({
        key: Date.now(),
        text: fullText || 'Các cậu ơi, cùng lắng nghe tình huống này nhé!',
        gesture: 'presentation',
      })
    }
  }

  const handleStopSituationInternal = () => {
    if (onStopSituationNarrator) {
      onStopSituationNarrator()
    } else {
      internalNarrator.stop()
    }
  }

  const handleAcknowledgeRuleInternal = () => {
    if (onAcknowledgeRule) {
      onAcknowledgeRule()
    } else {
      setLocalAcknowledged(true)
    }
    if (onManualMeeCue) {
      onManualMeeCue({
        key: Date.now(),
        text: 'Xuất sắc! Con đã nắm trọn Quy tắc Vàng này rồi!',
        gesture: 'celebrate',
      })
    }
  }

  const handleToggleCommitInternal = () => {
    if (onToggleCommit) {
      onToggleCommit()
    } else {
      setLocalCommitted((prev) => !prev)
    }
    if (!hasCommitted && onManualMeeCue) {
      onManualMeeCue({
        key: Date.now(),
        text: 'Tuyệt vời! Chào mừng Hiệp Sĩ Sáng Tạo mới của Xưởng AIKI!',
        gesture: 'celebrate',
      })
    }
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      {stageBlocks.filter((block) => !block.id.startsWith('course-goal-')).map((block) => {
        // ── 1. BLOCK: VIDEO BÀI GIẢNG ───────────────────────────
        if (block.type === 'video') {
          const videoUrl = block.videoUrl || card.videoUrl
          const videoTitle = block.title || card.title
          if (!videoUrl) return null

          return (
            <div
              key={block.id}
              data-testid="block-video"
              className="rounded-3xl border-2 border-brand-200 bg-white/90 p-4 sm:p-5 shadow-sm"
            >
              {block.title && (
                <h3 className="font-display text-lg sm:text-xl font-black text-brand-900 mb-3 text-left">
                  {block.title}
                </h3>
              )}
              <LectureVideo url={videoUrl} title={videoTitle} />
            </div>
          )
        }

        // ── 2. BLOCK: TEXT / LAYOUT-TEXT ─────────────────────────
        if (block.type === 'text' || block.type === 'layout-text') {
          return (
            <div
              key={block.id}
              data-testid="block-text"
              className="rounded-3xl border-2 border-slate-200 bg-white/90 p-4 sm:p-5 shadow-sm text-left"
            >
              {block.title && (
                <h3 className="font-display text-xl sm:text-2xl font-black text-text leading-tight mb-2">
                  {block.title}
                </h3>
              )}
              {(block.body || card.body) && (
                <p className="whitespace-pre-line text-base font-semibold leading-relaxed text-text">
                  {block.body || card.body}
                </p>
              )}
              {(block.tip || card.tip) && (
                <div className="mt-3 rounded-2xl border-2 border-brand-100 bg-brand-50/80 p-3.5 text-sm font-bold text-brand-900">
                  💡 Ghi nhớ: {block.tip || card.tip}
                </div>
              )}
            </div>
          )
        }

        // ── 3. BLOCK: LAYOUT-CALLOUT (Hộp Ghi Nhớ Nổi Bật) ─────────
        if (block.type === 'layout-callout') {
          return (
            <div
              key={block.id}
              data-testid="block-layout-callout"
              className="rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-4 sm:p-5 text-amber-950 shadow-2xs text-left"
            >
              <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-amber-900 mb-1.5">
                <span>💡</span>
                <span>{block.title || 'Hộp Ghi Nhớ Nổi Bật'}</span>
              </div>
              <p className="text-base font-bold text-amber-950 leading-relaxed">
                {block.tip || block.body || card.tip || 'Bí kíp ghi nhớ quan trọng cho con!'}
              </p>
            </div>
          )
        }

        // ── 4. BLOCK: LAYOUT-FORMULA (plain lesson text; KaTeX belongs to ASMO) ──
        if (block.type === 'layout-formula') {
          const formulaLatex = block.formula || block.body || card.body || '$$x = a + b$$'
          return (
            <div
              key={block.id}
              data-testid="block-layout-formula"
              className="rounded-2xl border-2 border-brand-200 bg-brand-50/80 p-4 sm:p-5 shadow-sm text-center"
            >
              <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-black uppercase text-brand-800 mb-2">
                <span>📐</span>
                <span>{block.title || 'Công thức'}</span>
              </div>
              <div className="py-2 text-lg sm:text-xl font-bold text-brand-950 flex items-center justify-center">
                <span>{readableFormula(formulaLatex)}</span>
              </div>
            </div>
          )
        }

        // ── 5. BLOCK: LAYOUT-SPLIT (2 Cột Chữ + Media) ───────────
        if (block.type === 'layout-split') {
          const splitImage = block.imageUrl || card.imageUrl
          return (
            <div
              key={block.id}
              data-testid="block-layout-split"
              className="rounded-3xl border-2 border-orange-200 bg-white/90 p-4 sm:p-5 shadow-sm"
            >
              <div className={cn(isMobile ? "grid grid-cols-1 gap-3 items-start" : "grid grid-cols-1 md:grid-cols-2 gap-4 items-start md:items-center")}>
                <div className="flex flex-col justify-center text-left">
                  {block.title && (
                    <h3 className="font-display text-xl sm:text-2xl font-black text-text mb-2">
                      {block.title}
                    </h3>
                  )}
                  <p className="whitespace-pre-line text-base font-semibold leading-relaxed text-text">
                    {block.body || card.body}
                  </p>
                  {(block.tip || card.tip) && (
                    <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50/80 p-3 text-xs font-bold text-orange-900">
                      💡 {block.tip || card.tip}
                    </div>
                  )}
                </div>
                <div className="relative overflow-hidden rounded-2xl border-2 border-orange-200 bg-orange-50/60 p-2 group/art flex items-center justify-center min-h-[220px] self-start w-full">
                  {splitImage ? (
                    <img
                      src={splitImage}
                      alt={block.imageAlt || block.title || 'Minh họa'}
                      className="max-h-[320px] w-auto max-w-full object-contain rounded-xl transition-transform duration-300 group-hover/art:scale-105"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  ) : (
                    <div className="text-sm font-bold text-muted">Chưa có ảnh minh họa</div>
                  )}
                  {splitImage && (
                    <button
                      type="button"
                      onClick={() =>
                        onZoomImage?.({
                          title: block.title || 'Minh họa',
                          url: splitImage,
                          description: block.body || card.body,
                        })
                      }
                      className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-black text-white backdrop-blur-xs transition hover:bg-black/85 active:scale-95 shadow-xs cursor-pointer"
                    >
                      <ZoomIn size={14} />
                      <span>🔍 Xem to</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        }

        // ── 6. BLOCK: LAYOUT-GRID (Lưới Ô Thẻ Khái Niệm) ─────────
        if (block.type === 'layout-grid') {
          const items = block.visualItems || card.visualItems || []
          return (
            <div
              key={block.id}
              data-testid="block-layout-grid"
              className="rounded-3xl border-2 border-border bg-white/90 p-4 sm:p-5 shadow-sm text-left"
            >
              {block.title && (
                <h3 className="font-display text-xl sm:text-2xl font-black text-text mb-3">
                  {block.title}
                </h3>
              )}
              <div className={cn(isMobile ? "grid grid-cols-1 gap-2.5" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3")}>
                {items.map((item, i) => {
                  const tone = item.tone || 'brand'
                  const toneCls = {
                    brand: 'border-brand-200 bg-brand-50/80 text-brand-900',
                    sky: 'border-sky-200 bg-sky-50/80 text-sky-900',
                    mint: 'border-mint-200 bg-mint-50/80 text-mint-900',
                    sun: 'border-sun-200 bg-sun-50/80 text-sun-900',
                    coral: 'border-coral-200 bg-coral-50/80 text-coral-900',
                    rose: 'border-rose-200 bg-rose-50/80 text-rose-900',
                  }[tone] || 'border-brand-200 bg-brand-50/80 text-brand-900'

                  return (
                    <div
                      key={i}
                      className={cn('rounded-2xl border-2 p-4 shadow-2xs flex flex-col justify-between', toneCls)}
                    >
                      <div className="flex items-center gap-2 mb-2 font-black text-base">
                        <span className="grid size-6 place-items-center rounded-full bg-white/80 text-xs font-black">
                          {i + 1}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      <p className="text-sm font-semibold leading-relaxed opacity-90">{item.text}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        }

        if (block.type === 'layout-four-keys') {
          const items = (block.visualItems || []).slice(0, 4)
          const keyPresets = [
            { border: 'border-sky-300', bg: 'bg-sky-50 text-sky-950', badge: 'bg-blue-600 text-white', defaultImage: '/assets/aiki-keys/key_what_blue.jpg', defaultSub: 'Ai, đồ vật gì' },
            { border: 'border-amber-300', bg: 'bg-amber-50 text-amber-950', badge: 'bg-amber-600 text-white', defaultImage: '/assets/aiki-keys/key_how_yellow.jpg', defaultSub: 'Màu sắc, hình dáng' },
            { border: 'border-orange-300', bg: 'bg-orange-50 text-orange-950', badge: 'bg-orange-600 text-white', defaultImage: '/assets/aiki-keys/key_action_orange.jpg', defaultSub: 'Hành động' },
            { border: 'border-rose-300', bg: 'bg-rose-50 text-rose-950', badge: 'bg-rose-600 text-white', defaultImage: '/assets/aiki-keys/key_where_pink.jpg', defaultSub: 'Bối cảnh, nơi chốn' },
          ]
          return (
            <section key={block.id} data-testid="block-layout-four-keys" className="rounded-3xl bg-white p-4 shadow-clay sm:p-6 text-left">
              <div className="mx-auto max-w-4xl">
                <div className="text-center">
                  <span className="inline-flex min-h-10 items-center rounded-full bg-brand-100 px-4 text-xs font-black uppercase tracking-wide text-brand-800">Bộ khung câu lệnh</span>
                  <h3 className="mt-3 font-display text-2xl font-black text-text sm:text-3xl">{block.title || 'Bốn chiếc chìa khóa mở câu lệnh'}</h3>
                  {block.body && <p className="mx-auto mt-2 max-w-2xl text-base font-semibold leading-relaxed text-slate-700">{block.body}</p>}
                </div>
                <div className={cn("mt-5", isMobile ? "grid grid-cols-1 gap-2.5" : "grid gap-3 sm:grid-cols-2 lg:grid-cols-4")}>
                  {items.map((item, index) => {
                    const preset = keyPresets[index % keyPresets.length]
                    const keyImg = item.keyImage || preset.defaultImage
                    const subText = item.sub
                    return (
                      <article key={`${block.id}-${index}`} className={cn('min-h-40 rounded-3xl border-2 p-4 shadow-sm flex flex-col justify-between', preset.border, preset.bg)}>
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="grid size-10 place-items-center rounded-2xl bg-white font-black shadow-sm text-sm" aria-hidden="true">{index + 1}</span>
                            <div className="flex items-center gap-1.5">
                              {keyImg && (
                                <img src={keyImg} alt={item.label} className="w-7 h-7 rounded-lg object-contain bg-white/90 p-0.5 border border-amber-200 shadow-2xs" />
                              )}
                              <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-black uppercase">Chìa khóa {index + 1}</span>
                            </div>
                          </div>
                          <h4 className="mt-3 text-lg font-black leading-tight">{item.label}</h4>
                          <p className="mt-1.5 text-sm font-semibold leading-relaxed opacity-90">{item.text}</p>
                        </div>
                        {subText && (
                          <span className="mt-2.5 text-xs font-bold text-slate-500/90 block">({subText})</span>
                        )}
                      </article>
                    )
                  })}
                </div>
                {block.tip && <p className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-center text-sm font-black text-brand-900">{block.tip}</p>}
              </div>
            </section>
          )
        }

        // ── BLOCK: LAYOUT-CONFIRM-OPTION (Phương án Xác nhận Mục tiêu) ──
        if (block.type === 'layout-confirm-option') {
          return (
            <div
              key={block.id}
              data-testid="block-layout-confirm-option"
              className={cn(
                "rounded-3xl border-2 bg-white p-4 sm:p-5 shadow-sm text-left transition-all",
                block.isCorrect ? "border-emerald-400 bg-emerald-50/20 ring-2 ring-emerald-200" : "border-border"
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-black text-brand-800">
                  {block.title || 'Phương án lựa chọn'}
                </span>
                {block.isCorrect && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 flex items-center gap-1">
                    ✓ Đáp án đúng
                  </span>
                )}
              </div>
              {block.imageUrl && (
                <div className="aspect-[16/10] sm:aspect-[2/1] w-full rounded-2xl overflow-hidden mb-3 bg-slate-50 border border-slate-200/80 flex items-center justify-center">
                  <img
                    src={block.imageUrl}
                    alt={block.title || 'Hình ảnh phương án'}
                    className="size-full object-contain p-2"
                  />
                </div>
              )}
              {block.body && (
                <p className="text-sm sm:text-base font-semibold text-slate-700 leading-relaxed">
                  {block.body}
                </p>
              )}
            </div>
          )
        }

        // ── 7. BLOCK: LAYOUT-STORYBOARD (Chuỗi Storyboard) ────────
        if (block.type === 'layout-storyboard') {
          const items = block.visualItems || card.visualItems || []
          return (
            <div
              key={block.id}
              data-testid="block-layout-storyboard"
              className="rounded-3xl border-2 border-border bg-white/90 p-4 sm:p-5 shadow-sm text-left"
            >
              {block.title && (
                <h3 className="font-display text-xl sm:text-2xl font-black text-text mb-3">
                  {block.title}
                </h3>
              )}
              <div className={cn(isMobile ? "grid grid-cols-1 gap-2.5" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3")}>
                {items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="rounded-2xl border-2 border-brand-200 bg-white p-4 shadow-sm flex flex-col justify-between"
                  >
                    <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl border-2 border-text/20 bg-sky-50">
                      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-mint-100" />
                      <AikidCatCharacter
                        pose="walking"
                        className={cn(
                          'absolute bottom-[12%] h-[58%] w-[48%] object-contain drop-shadow-sm',
                          itemIndex === 0 ? 'left-[5%]' : itemIndex === 1 ? 'left-[22%]' : 'left-[38%]'
                        )}
                      />
                      {item.shot && (
                        <span className="absolute left-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-[11px] font-extrabold text-text">
                          {item.shot}
                        </span>
                      )}
                    </div>
                    <p className="font-extrabold text-base leading-tight text-text">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold leading-relaxed text-text/80">{item.text}</p>
                    {(item.duration || item.sound || item.direction) && (
                      <dl className="mt-2.5 grid gap-1 border-t border-slate-100 pt-2 text-xs font-bold text-muted">
                        {item.duration && (
                          <div className="flex items-center gap-1.5">
                            <Clock3 size={13} /> {item.duration}
                          </div>
                        )}
                        {item.sound && (
                          <div className="flex items-center gap-1.5">
                            <Volume2 size={13} /> {item.sound}
                          </div>
                        )}
                        {item.direction && (
                          <div className="flex items-center gap-1.5">
                            <MoveRight size={13} /> {item.direction}
                          </div>
                        )}
                      </dl>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        }

        // ── 8. BLOCK: DIALOGUE (Kịch Bản Phân Vai Comic) ─────────
        if (block.type === 'dialogue') {
          const dialogueSource = block.tip || block.body || card.tip || card.body
          const parsedDialogues = parseComicDialogue(dialogueSource)
          const defaultDialogues: ParsedDialogue[] = [
            { id: 'd-1', speaker: 'zico', speakerName: 'Zico', text: 'Của tớ đẹp hơn!' },
            { id: 'd-2', speaker: 'sonet', speakerName: 'Sonet', text: 'Không, của tớ đúng hơn!' },
            { id: 'd-3', speaker: 'aki', speakerName: 'Mèo AIKI', text: 'DỪNG LẠIIII...! Các cậu ơi, hãy giúp tớ vụ này!' },
          ]
          const lines = (block.dialogueLines && block.dialogueLines.length > 0)
            ? block.dialogueLines.map((d: DialogueLine) => ({
                id: d.id,
                speaker: d.speaker,
                speakerName:
                  d.speaker === 'zico'
                    ? 'Zico (áo cam)'
                    : d.speaker === 'sonet'
                    ? 'Sonet (áo xanh)'
                    : d.speaker === 'aki'
                    ? 'Mèo AIKI'
                    : d.speaker === 'teacher'
                    ? 'Cô giáo'
                    : d.speaker,
                text: d.text,
                role: d.role || (d.speaker === 'zico' ? 'left' : d.speaker === 'sonet' ? 'right' : 'center'),
              }))
            : parsedDialogues.length > 0
            ? parsedDialogues
            : defaultDialogues

          return (
            <div
              key={block.id}
              data-testid="block-dialogue"
              className="rounded-3xl border-2 border-orange-200 bg-white/90 p-4 sm:p-5 shadow-sm text-left space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-orange-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-orange-800">
                  <MessageSquareText size={18} className="text-orange-600" />
                  {block.title || 'Kịch bản Phân vai Tình huống'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (isNarrating) {
                      handleStopSituationInternal()
                    } else {
                      handlePlaySituationInternal(lines, card.mee?.readText?.trim() || card.body)
                    }
                  }}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-xs font-black transition active:scale-95 shadow-xs cursor-pointer',
                    isNarrating
                      ? 'border-orange-500 bg-orange-500 text-white animate-pulse'
                      : 'border-orange-300 bg-orange-50 text-orange-900 hover:bg-orange-100'
                  )}
                  aria-label={isNarrating ? 'Dừng kể tình huống' : 'Nghe AIKI kể tình huống'}
                >
                  {isNarrating ? (
                    <>
                      <Square size={13} className="fill-current" />
                      <span>⏹️ Đang kể... (Bấm để dừng)</span>
                      <span className="flex items-center gap-0.5 ml-1">
                        <span className="inline-block h-2 w-0.5 rounded-full bg-white animate-[bounce_0.8s_infinite_100ms]" />
                        <span className="inline-block h-3 w-0.5 rounded-full bg-white animate-[bounce_0.8s_infinite_200ms]" />
                        <span className="inline-block h-2 w-0.5 rounded-full bg-white animate-[bounce_0.8s_infinite_300ms]" />
                      </span>
                    </>
                  ) : (
                    <>
                      <Volume2 size={15} />
                      <span>🔊 Nghe AIKI kể tình huống</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col gap-3.5 pt-1">
                {lines.map((d: ParsedDialogue, index: number) => {
                  const isLeft = (d as any).role === 'left' || d.speaker === 'zico'
                  const isRight = (d as any).role === 'right' || d.speaker === 'sonet'
                  const isLineActive =
                    isNarrating &&
                    (speakingLineIndex === index || (speakingLineIndex === -1 && activeSpeaker === d.speaker))

                  if (isLeft) {
                    return (
                      <div
                        key={d.id}
                        className={cn(
                          'flex items-start gap-3 max-w-[90%] sm:max-w-[80%] self-start animate-fade-up transition-all duration-300',
                          isLineActive && 'scale-[1.02]'
                        )}
                      >
                        <div
                          className={cn(
                            'grid size-11 sm:size-12 shrink-0 place-items-center rounded-full bg-orange-100 border-2 text-xl shadow-xs transition-all',
                            isLineActive ? 'border-orange-500 ring-4 ring-orange-200 animate-bounce' : 'border-orange-300'
                          )}
                          title={d.speakerName || 'Zico'}
                        >
                          👦
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 ml-1 mb-1">
                            <span className="text-xs sm:text-sm font-black uppercase text-orange-800">
                              {d.speakerName || 'Zico (áo cam)'}
                            </span>
                            {isLineActive && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-black text-white shadow-2xs animate-pulse">
                                <Volume2 size={10} /> Đang nói
                              </span>
                            )}
                          </div>
                          <div
                            className={cn(
                              'rounded-2xl rounded-tl-xs border-2 p-4 text-base sm:text-lg font-bold shadow-xs leading-relaxed transition-all',
                              isLineActive
                                ? 'border-orange-500 bg-orange-100 text-orange-950 ring-2 ring-orange-300 shadow-md'
                                : 'border-orange-200 bg-orange-50 text-orange-950'
                            )}
                          >
                            {d.text}
                          </div>
                        </div>
                      </div>
                    )
                  }

                  if (isRight) {
                    return (
                      <div
                        key={d.id}
                        className={cn(
                          'flex flex-row-reverse items-start gap-3 max-w-[90%] sm:max-w-[80%] self-end animate-fade-up transition-all duration-300',
                          isLineActive && 'scale-[1.02]'
                        )}
                      >
                        <div
                          className={cn(
                            'grid size-11 sm:size-12 shrink-0 place-items-center rounded-full bg-sky-100 border-2 text-xl shadow-xs transition-all',
                            isLineActive ? 'border-sky-500 ring-4 ring-sky-200 animate-bounce' : 'border-sky-300'
                          )}
                          title={d.speakerName || 'Sonet'}
                        >
                          🧒
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2 mr-1 mb-1">
                            {isLineActive && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-black text-white shadow-2xs animate-pulse">
                                <Volume2 size={10} /> Đang nói
                              </span>
                            )}
                            <span className="text-xs sm:text-sm font-black uppercase text-sky-800">
                              {d.speakerName || 'Sonet (áo xanh)'}
                            </span>
                          </div>
                          <div
                            className={cn(
                              'rounded-2xl rounded-tr-xs border-2 p-4 text-base sm:text-lg font-bold shadow-xs text-right leading-relaxed transition-all',
                              isLineActive
                                ? 'border-sky-500 bg-sky-100 text-sky-950 ring-2 ring-sky-300 shadow-md'
                                : 'border-sky-200 bg-sky-50 text-sky-950'
                            )}
                          >
                            {d.text}
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={d.id}
                      className={cn(
                        'w-full my-2 animate-pop transition-all duration-300',
                        isLineActive && 'scale-[1.02]'
                      )}
                    >
                      <div className="mx-auto flex max-w-xl flex-col items-center">
                        <div
                          className={cn(
                            'mb-1.5 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs sm:text-sm font-black shadow-xs transition-all',
                            isLineActive
                              ? 'border-amber-400 bg-amber-200 text-amber-950 ring-2 ring-amber-300 animate-pulse'
                              : 'border-amber-300 bg-amber-100 text-amber-900'
                          )}
                        >
                          <span>🐱</span>
                          <span>{d.speakerName || 'TIẾNG AIKI'}</span>
                          {isLineActive && (
                            <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full">
                              <Volume2 size={9} /> Đang hô to
                            </span>
                          )}
                        </div>
                        <div
                          className={cn(
                            'w-full rounded-2xl border-2 p-4 sm:p-5 text-center font-black shadow-clay text-base sm:text-lg leading-relaxed transition-all',
                            isLineActive
                              ? 'border-brand-500 bg-gradient-to-r from-brand-100 via-amber-100 to-brand-100 text-brand-950 ring-2 ring-brand-300 shadow-lg'
                              : 'border-brand-300 bg-gradient-to-r from-brand-50 via-amber-50 to-brand-50 text-brand-950'
                          )}
                        >
                          {d.text}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        }

        // ── 9. BLOCK: VERSUS-AB (Chọn 2 Tranh Đối Đầu A/B) ───────
        if (block.type === 'versus-ab') {
          const riddle = defaultRiddle
          const feedback = answerFeedback[riddle.id]
          const isChecking = externalCheckingId === riddle.id
          const selectedAnswer = answers[riddle.id]

          const stationFallback = getStationFallbackImages(stationNum)

          return (
            <div
              key={block.id}
              data-testid="block-versus-ab"
              className="rounded-3xl border-3 border-brand-200 bg-white p-5 sm:p-7 shadow-clay animate-fade-up text-left space-y-5"
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
                        onClick={() => handleChooseAnswerInternal(riddle.id, optIdx)}
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
                              onSelect: () => handleChooseAnswerInternal(riddle.id, optIdx),
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
                        onClick={() => handleChooseAnswerInternal(riddle.id, optIdx)}
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

        // ── 10. BLOCK: COMPARE (Bảng So Sánh 2 Cột) ──────────────
        if (block.type === 'compare') {
          const compData = (block.compareData || card.compareData) as any
          const leftTitle = compData?.leftTitle || card.visualItems?.[0]?.label || 'Dữ liệu quen thuộc & chung chung'
          const leftText =
            compData?.leftText ||
            card.visualItems?.[0]?.text ||
            'AI chỉ lấy những hình ảnh quen thuộc trong kho hàng ngàn mẫu có sẵn. Ai gõ câu giống nhau thì kết quả cũng giống hệt nhau.'
          const leftImage =
            compData?.leftImage ||
            block.compareImages?.left ||
            card.compareImages?.left ||
            (isAikiRuleJourney ? '/assets/aiki-rules/aiki_compare_ai_warehouse.webp' : undefined)

          const rightTitle = compData?.rightTitle || card.visualItems?.[1]?.label || 'Ý tưởng độc nhất vô nhị'
          const rightText =
            compData?.rightText ||
            card.visualItems?.[1]?.text ||
            'Chỉ có con mới có kỷ niệm riêng, cảm xúc thật, gia đình và sự tưởng tượng độc đáo mà AI không thể tự nghĩ ra được!'
          const rightImage =
            compData?.rightImage ||
            block.compareImages?.right ||
            card.compareImages?.right ||
            (isAikiRuleJourney ? '/assets/aiki-rules/aiki_compare_kid_mind.webp' : undefined)

          return (
            <div
              key={block.id}
              data-testid="block-compare"
              className="rounded-3xl border-3 border-sky-200 bg-white p-5 sm:p-6 shadow-clay animate-fade-up text-left space-y-4"
            >
              <div className="flex items-center justify-between gap-2 border-b border-sky-100 pb-3">
                <div className="flex items-center gap-2 text-sky-800 font-extrabold text-sm uppercase tracking-wider">
                  <ScanSearch size={20} className="text-sky-600" />
                  {block.title || 'Bảng So Sánh Hai Mặt Bản Chất'}
                </div>
                <span className="rounded-full bg-sky-100 px-3 py-0.5 text-xs font-black text-sky-800">
                  {isAikiRuleJourney ? `Chặng ${stageIndex + 1}/5` : 'So sánh'}
                </span>
              </div>

              {(block.body || card.body) && (
                <p className="font-display text-lg sm:text-xl font-bold text-text leading-relaxed">
                  {block.body || card.body}
                </p>
              )}

              <div className={cn(isMobile ? "grid grid-cols-1 gap-3 items-start" : "grid grid-cols-1 md:grid-cols-2 gap-4 items-start")}>
                {/* Cột 1: Kho của AI */}
                <div className="flex flex-col justify-between rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 sm:p-5 shadow-xs">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-black uppercase text-slate-700">
                      <span>🤖</span>
                      Kho Dữ Liệu Của AI
                    </div>
                    <h4 className="mt-3 font-display text-lg sm:text-xl font-black text-slate-800">{leftTitle}</h4>
                    <p className="mt-1.5 text-base sm:text-lg font-semibold leading-relaxed text-slate-600">
                      {leftText}
                    </p>
                    <AiWarehouseVisual
                      imageUrl={leftImage}
                      onZoom={
                        leftImage
                          ? () =>
                              onZoomImage?.({
                                title: leftTitle,
                                subtitle: 'So sánh bản chất · Kho dữ liệu AI',
                                url: leftImage,
                                description: leftText,
                              })
                          : undefined
                      }
                      className="mt-3.5"
                    />
                  </div>
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white/80 p-3 text-sm font-bold text-slate-500">
                    ⚠️ Không có ký ức riêng của con
                  </div>
                </div>

                {/* Cột 2: Bộ Não Sáng Tạo Của Con */}
                <div className="flex flex-col justify-between rounded-2xl border-2 border-brand-300 bg-gradient-to-br from-amber-50 to-brand-50 p-4 sm:p-5 shadow-clay">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-brand-300 bg-brand-100 px-3 py-1 text-xs font-black uppercase text-brand-900">
                      <Sparkles size={13} className="text-brand-600 fill-brand-400" />
                      Bộ Não Sáng Tạo Của Con
                    </div>
                    <h4 className="mt-3 font-display text-lg sm:text-xl font-black text-brand-950">{rightTitle}</h4>
                    <p className="mt-1.5 text-base sm:text-lg font-semibold leading-relaxed text-brand-900">
                      {rightText}
                    </p>
                    <KidBrainVisual
                      imageUrl={rightImage}
                      onZoom={
                        rightImage
                          ? () =>
                              onZoomImage?.({
                                title: rightTitle,
                                subtitle: 'So sánh bản chất · Bộ não sáng tạo của con',
                                url: rightImage,
                                description: rightText,
                              })
                          : undefined
                      }
                      className="mt-3.5"
                    />
                  </div>
                  <div className="mt-4 rounded-xl border border-brand-200 bg-white/90 p-3 text-sm font-black text-brand-700">
                    ✨ Con chính là thuyền trưởng chỉ huy AI!
                  </div>
                </div>
              </div>

              {/* Hàng so sánh chi tiết nếu có rows */}
              {compData?.rows && compData.rows.length > 0 && (
                <div className="mt-4 overflow-hidden rounded-2xl border-2 border-sky-200 bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-sky-50 text-xs uppercase font-black text-sky-900">
                      <tr>
                        <th className="p-3">Tiêu chí</th>
                        <th className="p-3">{leftTitle}</th>
                        <th className="p-3">{rightTitle}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-100 font-semibold">
                      {compData.rows.map((row: { aspect: string; left: string; right: string }, rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-sky-50/40">
                          <td className="p-3 font-black text-sky-950">{row.aspect}</td>
                          <td className="p-3 text-slate-700">{row.left}</td>
                          <td className="p-3 text-brand-900 font-bold">{row.right}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {(block.tip || card.tip) && (
                <div className="mt-4 rounded-2xl border-2 border-brand-200 bg-brand-50/60 p-4 text-left shadow-xs">
                  <div className="flex items-center gap-2 font-black text-brand-900 text-sm">
                    <span>🐱</span>
                    <span>Bật mí từ Mèo AIKI:</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-brand-950 leading-relaxed">
                    {block.tip || card.tip}
                  </p>
                </div>
              )}

              {onNextStage && (
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="secondary"
                    className="h-12 px-6 font-extrabold border-2 border-sky-300 hover:bg-sky-100 text-sky-900 cursor-pointer"
                    onClick={() => onNextStage(stageIndex + 1)}
                  >
                    Tiếp tục sang phần tiếp theo
                    <ChevronRight size={20} />
                  </Button>
                </div>
              )}
            </div>
          )
        }

        // ── 11. BLOCK: POSTER (Quy Tắc Vàng & Cam Kết) ──────────
        if (block.type === 'poster') {
          const posterText = block.posterText || block.body || card.body || 'Ý TƯỞNG CỦA CON LÀ SỐ 1 · AI CHỈ LÀ TRỢ LÝ GIÚP CON LÀM ĐẸP HƠN!'
          const isClosingStage = stageIndex === 4 || card.kind === 'closing'

          return (
            <div
              key={block.id}
              data-testid="block-poster"
              className="space-y-4 text-left"
            >
              {!isClosingStage ? (
                <div className="relative overflow-hidden rounded-3xl border-3 border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6 sm:p-8 shadow-clay animate-fade-up">
                  <div className="flex items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
                    <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm uppercase tracking-wider">
                      <Sparkles size={20} className="text-amber-600 fill-amber-400" />
                      {block.title || 'Quy Tắc Vàng AIKI'}
                    </div>
                    <span className="rounded-full bg-amber-200 px-3 py-0.5 text-xs font-black text-amber-900">
                      {isAikiRuleJourney ? `Chặng ${stageIndex + 1}/5` : 'Quy tắc'}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-col items-center text-center">
                    <span className="text-4xl sm:text-5xl animate-bounce">🌟</span>
                    <h3 className="mt-2 font-display text-2xl sm:text-4xl font-black text-amber-950 leading-snug max-w-3xl">
                      {posterText}
                    </h3>
                  </div>

                  {(block.tip || card.tip) && (
                    <div className="mt-5 rounded-2xl border-2 border-amber-300/70 bg-white/80 p-5 text-base sm:text-lg font-bold text-amber-950 leading-relaxed shadow-xs">
                      💡 <span className="font-extrabold">Bí kíp ghi nhớ:</span> {block.tip || card.tip}
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    {onOpenPosterModal && (
                      <Button
                        variant="secondary"
                        className="h-14 px-6 text-sm sm:text-base font-black border-2 border-amber-400 bg-white/95 hover:bg-amber-100 text-amber-950 shadow-xs flex items-center gap-2 cursor-pointer"
                        onClick={onOpenPosterModal}
                      >
                        <Printer size={19} className="text-amber-700" />
                        📥 Tải / In Poster Vàng
                      </Button>
                    )}

                    {!hasAcknowledgedRule ? (
                      <Button
                        variant="primary"
                        className="h-14 px-8 text-base sm:text-lg font-black shadow-clay bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 cursor-pointer"
                        onClick={handleAcknowledgeRuleInternal}
                      >
                        <Star size={20} className="fill-white" />
                        🌟 Con đã ghi nhớ quy tắc!
                      </Button>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3 animate-pop">
                        <div className="inline-flex items-center gap-2 rounded-2xl border-2 border-mint-300 bg-mint-50 px-5 py-2.5 text-base font-black text-mint-900 shadow-sm">
                          <Check className="size-5 text-mint-600" />
                          ✨ Con đã ghi nhớ quy tắc vàng thành công! ⭐
                        </div>
                        {onNextStage && (
                          <Button
                            variant="secondary"
                            className="h-12 px-6 font-extrabold border-2 border-amber-300 hover:bg-amber-100 text-amber-900 cursor-pointer"
                            onClick={() => onNextStage(stageIndex + 1)}
                          >
                            Tiếp tục sang phần Giải thích
                            <ChevronRight size={20} />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Chặng cam kết hiệp sĩ sáng tạo */
                <div className="rounded-3xl border-3 border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6 sm:p-8 shadow-clay text-center flex flex-col items-center gap-5 animate-fade-up">
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-400 bg-amber-200/90 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-amber-950 shadow-xs">
                    <Trophy className="size-4 text-amber-700 fill-amber-500" />
                    🛡️ BẢN CAM KẾT HIỆP SĨ SÁNG TẠO AIKI
                  </div>

                  <h3 className="font-display text-2xl sm:text-3xl font-black text-amber-950 max-w-2xl leading-snug">
                    {posterText}
                  </h3>

                  <button
                    type="button"
                    onClick={handleToggleCommitInternal}
                    className={cn(
                      'flex items-center gap-3 px-6 py-4 rounded-2xl border-3 font-black text-base sm:text-lg transition-all shadow-xs active:scale-[0.98] cursor-pointer',
                      hasCommitted
                        ? 'border-mint-500 bg-mint-50 text-mint-900 shadow-clay ring-4 ring-mint-200/60'
                        : 'border-brand-300 bg-white hover:border-brand-400 text-brand-900 hover:shadow-md'
                    )}
                  >
                    <span
                      className={cn(
                        'grid size-8 place-items-center rounded-xl border-2 transition-all',
                        hasCommitted
                          ? 'bg-mint-500 border-mint-600 text-white shadow-xs'
                          : 'border-brand-300 bg-brand-50 text-brand-400'
                      )}
                    >
                      {hasCommitted ? <Check size={20} /> : null}
                    </span>
                    <span>
                      {hasCommitted
                        ? 'Con đã là Hiệp Sĩ Sáng Tạo! 🌟'
                        : 'Con đã sẵn sàng làm Hiệp Sĩ Sáng Tạo! ✋'}
                    </span>
                  </button>

                  {hasCommitted && <CreativeKnightBadgeVisual className="my-2" />}

                  <p className="text-sm font-semibold text-amber-800 max-w-md">
                    Con đã hoàn thành toàn bộ 5 chặng của Quy tắc AIKI! Bấm nút bên dưới để hoàn tất trạm học và nhận sao nhé!
                  </p>

                  {onAikiFinish && (
                    <Button
                      variant="primary"
                      className="w-full sm:w-auto min-w-[280px] max-w-full text-lg sm:text-xl font-black h-16 rounded-2xl shadow-clay border-b-[4px] border-brand-700 active:border-b-0 active:translate-y-1 mt-2 cursor-pointer"
                      onClick={onAikiFinish}
                      disabled={busy}
                    >
                      {!busy && <Star size={24} className="fill-white" aria-hidden="true" />}
                      {busy ? 'Đang hoàn thành…' : 'Hoàn thành trạm học & Nhận sao ⭐'}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )
        }

        // ── 12. BLOCK: VOICE (Khung Mèo AIKI & Lipsync) ──────────
        if (block.type === 'voice') {
          return (
            <div
              key={block.id}
              data-testid="block-voice"
              className="rounded-3xl border-2 border-brand-200 bg-brand-50/70 p-4 sm:p-5 shadow-sm text-left my-3"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 size-16 sm:size-20 rounded-2xl bg-white border-2 border-brand-300 p-1 shadow-xs flex items-center justify-center">
                  <AikidCatCharacter pose="talk" className="size-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-sm text-brand-900 uppercase">🐱 Lời nhắn từ Mèo AIKI</span>
                  </div>
                  <div className="rounded-2xl rounded-tl-xs border-2 border-brand-300 bg-white p-3.5 text-base font-bold text-brand-950 shadow-2xs leading-relaxed">
                    {block.readText || card.mee?.readText || card.body || 'Mèo AIKI luôn đồng hành và khích lệ con!'}
                  </div>
                </div>
              </div>
            </div>
          )
        }

        // ── 13. BLOCK: IMAGES (Hero image hoặc Album ảnh) ─────────
        if (block.type === 'images') {
          const heroImage = block.imageUrl || card.imageUrl
          const additionalImgs = block.additionalImages || card.additionalImages

          return (
            <div
              key={block.id}
              data-testid="block-images"
              className="rounded-3xl border-2 border-border bg-white/90 p-4 sm:p-5 shadow-sm my-3 text-left"
            >
              {heroImage && (
                <div className="relative overflow-hidden rounded-2xl border-2 border-orange-200 bg-orange-50/60 p-2 group/art flex items-center justify-center min-h-[240px] sm:min-h-[300px] max-h-[560px]">
                  <img
                    src={heroImage}
                    alt={block.imageAlt || card.imageAlt || block.title || card.title || 'Minh họa'}
                    className="w-auto max-w-full max-h-[520px] object-contain rounded-xl transition-transform duration-300 group-hover/art:scale-102 mx-auto"
                    onError={(event) => { event.currentTarget.style.display = 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onZoomImage?.({
                        title: block.title || card.title || 'Tranh minh họa',
                        subtitle: isAikiRuleJourney ? `Minh họa Chặng ${stageIndex + 1}` : 'Chi tiết tranh minh họa',
                        url: heroImage,
                        description: block.body || card.body,
                      })
                    }}
                    className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-black text-white backdrop-blur-xs transition hover:bg-black/85 active:scale-95 shadow-xs cursor-pointer"
                    title="Phóng to xem tranh chi tiết"
                  >
                    <ZoomIn size={14} />
                    <span>🔍 Xem tranh to</span>
                  </button>
                </div>
              )}

              {additionalImgs && additionalImgs.length > 0 && (
                <div className={cn("rounded-2xl border-2 border-emerald-100 bg-emerald-50/50 p-4", heroImage && "mt-4")}>
                  <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800">
                    <span>🖼️</span>
                    <span>Bộ sưu tập hình ảnh minh họa</span>
                  </div>
                  <div className={cn(
                    isMobile
                      ? "grid grid-cols-1 gap-2"
                      : "grid grid-cols-2 sm:grid-cols-3 gap-3"
                  )}>
                    {additionalImgs.map((imgItem, imgIdx) => (
                      <figure key={imgItem.id || imgIdx} className="group overflow-hidden rounded-2xl border-2 border-emerald-100 bg-emerald-50/40 p-2 shadow-2xs transition hover:shadow-md">
                        <div className="overflow-hidden rounded-xl aspect-video bg-slate-100 relative flex items-center justify-center">
                          <img
                            src={imgItem.url}
                            alt={imgItem.alt || `Minh họa ${imgIdx + 1}`}
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                          />
                        </div>
                        {imgItem.caption && (
                          <figcaption className="mt-2 text-center text-xs font-bold text-emerald-950 px-1 leading-snug">
                            {imgItem.caption}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
