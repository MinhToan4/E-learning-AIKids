import React, { useState, useMemo } from 'react'
import { ZoomIn } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { LectureVideo } from '@/features/lesson/components/LectureVideo'
import {
  type LearnCardDraft,
  type StageBlockItem,
  getStageBlocks,
} from '@/features/teacher/lib/authoring'
import { useAikiSituationNarrator } from '@/features/lesson/hooks/useAikiSituationNarrator'
import { playInstantSound } from '@/features/lesson/components/LessonInteractiveSidebar'
import { DialogueBlockRenderer } from './stage-blocks/DialogueBlockRenderer'
import {
  VersusAbBlockRenderer,
  getStationFallbackImages,
} from './stage-blocks/VersusAbBlockRenderer'
import { CompareBlockRenderer } from './stage-blocks/CompareBlockRenderer'
import { PosterBlockRenderer } from './stage-blocks/PosterBlockRenderer'
import { LayoutBlocksRenderer } from './stage-blocks/LayoutBlocksRenderer'

export { getStationFallbackImages }

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

        // ── 3-9. LAYOUT BLOCKS ──────────────────────────────────
        if (
          block.type === 'layout-callout' ||
          block.type === 'layout-formula' ||
          block.type === 'layout-split' ||
          block.type === 'layout-grid' ||
          block.type === 'layout-four-keys' ||
          block.type === 'layout-confirm-option' ||
          block.type === 'layout-storyboard'
        ) {
          return (
            <LayoutBlocksRenderer
              key={block.id}
              block={block}
              card={card}
              isMobile={isMobile}
              onZoomImage={onZoomImage}
            />
          )
        }

        // ── 10. BLOCK: DIALOGUE (Kịch Bản Phân Vai Comic) ─────────
        if (block.type === 'dialogue') {
          return (
            <DialogueBlockRenderer
              key={block.id}
              block={block}
              card={card}
              isNarrating={isNarrating}
              speakingLineIndex={speakingLineIndex}
              activeSpeaker={activeSpeaker}
              onPlaySituation={handlePlaySituationInternal}
              onStopSituationNarrator={handleStopSituationInternal}
            />
          )
        }

        // ── 11. BLOCK: VERSUS-AB (Chọn 2 Tranh Đối Đầu A/B) ───────
        if (block.type === 'versus-ab') {
          return (
            <VersusAbBlockRenderer
              key={block.id}
              block={block}
              card={card}
              riddle={defaultRiddle}
              answers={answers}
              answerFeedback={answerFeedback}
              checkingQuestionId={externalCheckingId}
              isMobile={isMobile}
              isAikiRuleJourney={isAikiRuleJourney}
              stageIndex={stageIndex}
              stationNum={stationNum}
              onChooseAnswer={handleChooseAnswerInternal}
              onZoomImage={onZoomImage}
              onNextStage={onNextStage}
            />
          )
        }

        // ── 12. BLOCK: COMPARE (Bảng So Sánh 2 Cột) ──────────────
        if (block.type === 'compare') {
          return (
            <CompareBlockRenderer
              key={block.id}
              block={block}
              card={card}
              stageIndex={stageIndex}
              isAikiRuleJourney={isAikiRuleJourney}
              isMobile={isMobile}
              onZoomImage={onZoomImage}
              onNextStage={onNextStage}
            />
          )
        }

        // ── 13. BLOCK: POSTER (Quy Tắc Vàng & Cam Kết) ──────────
        if (block.type === 'poster') {
          return (
            <PosterBlockRenderer
              key={block.id}
              block={block}
              card={card}
              stageIndex={stageIndex}
              isAikiRuleJourney={isAikiRuleJourney}
              hasAcknowledgedRule={hasAcknowledgedRule}
              onAcknowledgeRule={handleAcknowledgeRuleInternal}
              onOpenPosterModal={onOpenPosterModal}
              hasCommitted={hasCommitted}
              onToggleCommit={handleToggleCommitInternal}
              onAikiFinish={onAikiFinish}
              onNextStage={onNextStage}
              busy={busy}
            />
          )
        }

        // ── 14. BLOCK: VOICE (Khung Mèo AIKI - Ẩn để tối ưu diện tích hiển thị) ──────────
        if (block.type === 'voice') {
          return (
            <div
              key={block.id}
              data-testid="block-voice"
              className="sr-only"
              aria-hidden="true"
            >
              {block.readText || card.mee?.readText || card.body || 'Mèo AIKI chào đón các bạn nhỏ khám phá thế giới AI!'}
            </div>
          )
        }

        // ── 15. BLOCK: IMAGES (Hero image hoặc Album ảnh) ─────────
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
                    onError={(event) => {
                      event.currentTarget.style.display = 'none'
                    }}
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
                <div className={cn('rounded-2xl border-2 border-emerald-100 bg-emerald-50/50 p-4', heroImage && 'mt-4')}>
                  <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800">
                    <span>🖼️</span>
                    <span>Bộ sưu tập hình ảnh minh họa</span>
                  </div>
                  <div
                    className={cn(
                      isMobile
                        ? 'grid grid-cols-1 gap-2'
                        : 'grid grid-cols-2 sm:grid-cols-3 gap-3'
                    )}
                  >
                    {additionalImgs.map((imgItem, imgIdx) => (
                      <figure
                        key={imgItem.id || imgIdx}
                        className="group overflow-hidden rounded-2xl border-2 border-emerald-100 bg-emerald-50/40 p-2 shadow-2xs transition hover:shadow-md"
                      >
                        <div className="overflow-hidden rounded-xl aspect-video bg-slate-100 relative flex items-center justify-center">
                          <img
                            src={imgItem.url}
                            alt={imgItem.alt || `Minh họa ${imgIdx + 1}`}
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
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
