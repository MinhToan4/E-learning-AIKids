import React, { Suspense } from 'react'
import {
  BookOpen,
  Check,
  Gamepad2,
  PencilLine,
  Play,
  ShieldCheck,
  Star,
  Target,
} from 'lucide-react'
import {
  AikiPictureZoomModal,
  AikiPosterModal,
  type ZoomImageData,
} from '@/features/lesson/components/AikiRuleVisuals'
import type { LearnCardDraft } from '@/features/teacher/lib/authoring'
import {
  ART_STYLES,
  CHARACTER_SHAPES,
  CHARACTER_VIBES,
  type ArtStyleId,
  type CharacterShapeId,
  type CharacterVibeId,
} from '@/shared/lib/creation/creative'
import {
  SLOT_LABELS,
} from '@/shared/lib/creation/prompt'
import {
  STORY_ENDINGS,
  STORY_OPENINGS,
  STORY_PROBLEMS,
} from '@/shared/lib/creation/story'
import {
  type PromptChip,
  type PromptParts,
  type PromptSlotKey,
} from '@/shared/lib/creation/types'
import { Button } from '@/shared/components/ui/Button'
import type { QuestDetail } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { designerAssets, styleImage } from '@/shared/config/assets'
import type { PromptLabValue } from '@/features/lesson/lib/prompt-lab-state'
import type { GameEvidence } from '@/features/lesson/components/CurriculumGame'
import type { GameHint } from '@/features/lesson/components/games/types'
import { NavWorldIcon } from '@/shared/components/icons/KidNavIcons'
import type { PracticePreview } from '@/features/lesson/lib/practice-result'
import type { Phase } from '@/features/lesson/components/LessonInteractiveSidebar'
import { LessonCelebrationModal } from '@/features/lesson/components/LessonCelebrationModal'
import { CoursePaywallModal } from '@/features/lesson/components/CoursePaywallModal'
import { ParentGateModal } from '@/features/parent/components/ParentGateModal'
import { LessonNavigationHeader } from '@/features/lesson/components/LessonNavigationHeader'
import { isPromptComplete } from '@/shared/lib/creation/prompt'

const AikiStudioWorkspace = React.lazy(() =>
  import('@/features/lesson/components/AikiStudioWorkspace').then((m) => ({
    default: m.AikiStudioWorkspace,
  })),
)
const StudentStageBlocksView = React.lazy(() =>
  import('@/features/lesson/components/StudentStageBlocksView').then((module) => ({
    default: module.StudentStageBlocksView,
  })),
)
const CurriculumGame = React.lazy(() =>
  import('@/features/lesson/components/CurriculumGame').then((m) => ({
    default: m.CurriculumGame,
  })),
)
const AikiRuleVideoPlayer = React.lazy(() =>
  import('@/features/lesson/components/AikiRuleVideoPlayer').then((m) => ({
    default: m.AikiRuleVideoPlayer,
  })),
)
const RefMediaPicker = React.lazy(() =>
  import('@/features/lesson/components/RefMediaPicker').then((m) => ({
    default: m.RefMediaPicker,
  })),
)
const SketchCanvas = React.lazy(() =>
  import('@/features/lesson/components/SketchCanvas').then((m) => ({
    default: m.SketchCanvas,
  })),
)
const OrderingPractice = React.lazy(() =>
  import('@/features/lesson/components/OrderingPractice').then((m) => ({
    default: m.OrderingPractice,
  })),
)
const PromptLab = React.lazy(() =>
  import('@/features/lesson/components/PromptLab').then((m) => ({
    default: m.PromptLab,
  })),
)
const CardBalancePractice = React.lazy(() =>
  import('@/features/lesson/components/CardBalancePractice').then((m) => ({
    default: m.CardBalancePractice,
  })),
)
const LectureVideo = React.lazy(() =>
  import('@/features/lesson/components/LectureVideo').then((m) => ({
    default: m.LectureVideo,
  })),
)

export const PHASES = [
  { id: 'learn' as const, label: 'Khám phá', description: 'Xem và hiểu', icon: BookOpen },
  { id: 'game' as const, label: 'Thử cùng Mee', description: 'Luyện có hướng dẫn', icon: Gamepad2 },
  { id: 'practice' as const, label: 'Tự tay làm', description: 'Thực hành Studio', icon: PencilLine },
  { id: 'check' as const, label: 'Thử thách', description: 'Kiểm tra cuối trạm', icon: ShieldCheck },
]

export const PHASE_ORDER = ['learn', 'game', 'practice', 'check', 'done']

export interface LegacyPhaseLessonViewProps {
  quest: QuestDetail
  questId: string
  routeCourseId?: string
  effectiveCourseId: string
  isAikiRuleJourney: boolean
  isIslandJourney: boolean
  is5StageJourney: boolean
  ruleId: number
  ruleData: any
  phase: Phase
  setPhase: (phase: Phase) => void
  maxUnlockedPhase: Phase
  aikiRuleStage: number
  setAikiRuleStage: (stage: number) => void
  hydratedLearnCards: any[]
  visibleLearnCards: any[]
  isSidebarCollapsed: boolean
  toggleSidebarCollapse: (collapsed: boolean) => void
  practiceStation: any
  gameStation: any
  liveStars: number
  setLiveStars: React.Dispatch<React.SetStateAction<number>>
  starBurst: { id: number; count: number } | null
  setStarBurst: (star: { id: number; count: number } | null) => void
  videoSeekTarget: { sec: number; token: number } | null
  setVideoSeekTarget: (target: { sec: number; token: number } | null) => void
  handleSlideChange: (index: number) => void
  aikiQuizAnswer: number | null
  handleSelectOption: (idx: number) => void
  handlePlayStateChange: (playing: boolean) => void
  currentLearnVideoUrl?: string | null
  currentLearnVideoTitle?: string | null
  zoomedImage: ZoomImageData | null
  setZoomedImage: (img: ZoomImageData | null) => void
  answers: Record<string, number>
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, number>>>
  answerFeedback: Record<string, { correct: boolean; explanation: string }>
  setAnswerFeedback: React.Dispatch<React.SetStateAction<Record<string, { correct: boolean; explanation: string }>>>
  checkingQuestionId: string | null
  chooseCheckAnswer: (questionId: string, optionIndex: number) => void | Promise<void>
  isNarratingSituation: boolean
  speakingLineIndex: number
  activeSpeaker: any
  playSituation: (dialogues: any, fullText?: string) => void
  stopSituationNarrator: () => void
  setManualMeeCue: (cue: any) => void
  hasAcknowledgedRule: boolean
  setHasAcknowledgedRule: (ack: boolean) => void
  aikiQuizAnswerCorrect: boolean
  isPosterModalOpen: boolean
  setIsPosterModalOpen: (open: boolean) => void
  hasCommitted: boolean
  setHasCommitted: React.Dispatch<React.SetStateAction<boolean>>
  handleAikiFinish: (customSummary?: any) => Promise<boolean>
  busy: boolean
  reviewMode: boolean
  setReviewMode: (mode: boolean) => void
  advanceFromLearn: () => Promise<void>
  setGameHint: (hint: GameHint | null) => void
  advanceFromGame: (evidence: GameEvidence | { skipped: true }) => Promise<void>
  studioConfig: any
  studioCharacterName: string
  studioLockedFeatures: string[]
  setGenerated: (preview: PracticePreview | null) => void
  setPracticeSaved: (saved: boolean) => void
  practiceSteps: string[]
  practiceSaved: boolean
  parts: PromptParts
  promptText: string
  selectChip: (chip: PromptChip) => void
  charShape: CharacterShapeId
  setCharShape: (shape: CharacterShapeId) => void
  charVibe: CharacterVibeId
  setCharVibe: (vibe: CharacterVibeId) => void
  charName: string
  setCharName: (name: string) => void
  styleId: ArtStyleId | null
  setStyleId: (id: ArtStyleId | null) => void
  story: any
  setStory: React.Dispatch<React.SetStateAction<any>>
  detectivePick: 0 | 1 | null
  setDetectivePick: (pick: 0 | 1 | null) => void
  panels: any[]
  comicBubbles: string[]
  setComicBubbles: React.Dispatch<React.SetStateAction<string[]>>
  journalText: string
  setJournalText: (text: string) => void
  refAssetIds: string[]
  setRefAssetIds: (ids: string[]) => void
  sketchDataUrl: string | null
  setSketchDataUrl: (url: string | null) => void
  promptLab: PromptLabValue
  setPromptLab: (lab: PromptLabValue) => void
  orderingCards: any[]
  effectivePracticeOrder: string[]
  setPracticeOrder: (order: string[]) => void
  paletteColors: string[]
  setPaletteColors: React.Dispatch<React.SetStateAction<string[]>>
  generated: PracticePreview | null
  practiceFeedback: string | null
  practiceAdvanced: boolean
  advanceFromPractice: () => Promise<void>
  savePractice: () => Promise<void>
  submitCheck: () => Promise<void>
  allCheckAnswersCorrect: boolean
  checkResult: any
  setCheckResult: (res: any) => void
  setError: (err: string | null) => void
  isPaywallOpen: boolean
  setIsPaywallOpen: (open: boolean) => void
  isParent: boolean
  isParentGateOpen: boolean
  setIsParentGateOpen: (open: boolean) => void
  navigate: (path: string) => void
}

export function LegacyPhaseLessonView(props: LegacyPhaseLessonViewProps) {
  const {
    quest,
    questId,
    routeCourseId,
    effectiveCourseId,
    isAikiRuleJourney,
    isIslandJourney,
    is5StageJourney,
    ruleId,
    ruleData,
    phase,
    setPhase,
    maxUnlockedPhase,
    aikiRuleStage,
    setAikiRuleStage,
    hydratedLearnCards,
    visibleLearnCards,
    isSidebarCollapsed,
    toggleSidebarCollapse,
    practiceStation,
    gameStation,
    liveStars,
    setLiveStars,
    starBurst,
    setStarBurst,
    videoSeekTarget,
    setVideoSeekTarget,
    handleSlideChange,
    aikiQuizAnswer,
    handleSelectOption,
    handlePlayStateChange,
    currentLearnVideoUrl,
    currentLearnVideoTitle,
    zoomedImage,
    setZoomedImage,
    answers,
    setAnswers,
    answerFeedback,
    setAnswerFeedback,
    checkingQuestionId,
    chooseCheckAnswer,
    isNarratingSituation,
    speakingLineIndex,
    activeSpeaker,
    playSituation,
    stopSituationNarrator,
    setManualMeeCue,
    hasAcknowledgedRule,
    setHasAcknowledgedRule,
    aikiQuizAnswerCorrect,
    isPosterModalOpen,
    setIsPosterModalOpen,
    hasCommitted,
    setHasCommitted,
    handleAikiFinish,
    busy,
    reviewMode,
    setReviewMode,
    advanceFromLearn,
    setGameHint,
    advanceFromGame,
    studioConfig,
    studioCharacterName,
    studioLockedFeatures,
    setGenerated,
    setPracticeSaved,
    practiceSteps,
    practiceSaved,
    parts,
    promptText,
    selectChip,
    charShape,
    setCharShape,
    charVibe,
    setCharVibe,
    charName,
    setCharName,
    styleId,
    setStyleId,
    story,
    setStory,
    detectivePick,
    setDetectivePick,
    panels,
    comicBubbles,
    setComicBubbles,
    journalText,
    setJournalText,
    refAssetIds,
    setRefAssetIds,
    sketchDataUrl,
    setSketchDataUrl,
    promptLab,
    setPromptLab,
    orderingCards,
    effectivePracticeOrder,
    setPracticeOrder,
    paletteColors,
    setPaletteColors,
    generated,
    practiceFeedback,
    practiceAdvanced,
    advanceFromPractice,
    savePractice,
    submitCheck,
    allCheckAnswersCorrect,
    checkResult,
    setError,
    isPaywallOpen,
    setIsPaywallOpen,
    isParent,
    isParentGateOpen,
    setIsParentGateOpen,
    navigate,
  } = props

  return (
    <div
      className={cn(
        'page-enter flex flex-col rounded-3xl',
        isAikiRuleJourney
          ? 'min-h-[calc(100dvh-4rem)] xl:h-full xl:max-h-full flex flex-col p-1.5 sm:p-2.5 rounded-3xl bg-slate-50/60 xl:overflow-hidden'
          : 'min-h-[calc(100dvh-4rem)] bg-slate-50/60 p-2 sm:p-3 lg:p-4',
      )}
    >
      <div className="w-full flex-1 flex flex-col min-h-0 items-stretch gap-3 overflow-hidden">
        <div className="flex-1 min-w-0 w-full flex flex-col gap-3 overflow-hidden">
          {/* ── Flatten Header Không Dùng Box Lồng Nhau ─────────────────────── */}
          <LessonNavigationHeader
            phase={phase}
            isAikiRuleJourney={isAikiRuleJourney}
            is5StageJourney={is5StageJourney}
            isIslandJourney={isIslandJourney}
            quest={quest}
            aikiRuleStage={aikiRuleStage}
            hydratedLearnCardsCount={hydratedLearnCards.length}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebarCollapse={toggleSidebarCollapse}
            onNavigateBack={() => navigate(`/world/${effectiveCourseId}`)}
            onSelectAikiRuleStage={(idx) => setAikiRuleStage(idx)}
            practiceStation={practiceStation}
            liveStars={liveStars}
            starBurst={starBurst}
          >
            {/* ── Horizontal Phase Nav ──────────────────────────────── */}
            <nav className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t-2 border-border/50 w-full">
              {PHASES.map((p, idx) => {
                const maxIdx = PHASE_ORDER.indexOf(maxUnlockedPhase === 'done' ? 'check' : maxUnlockedPhase)
                const currentIdx = PHASE_ORDER.indexOf(phase === 'done' ? 'check' : phase)
                const isUnlocked = idx <= maxIdx
                const isActive = idx === currentIdx

                return (
                  <button
                    key={p.id}
                    aria-label={`${p.label}: ${p.description}`}
                    title={`${p.label} · ${p.description}`}
                    onClick={() => {
                      if (isUnlocked) {
                        setPhase(p.id)
                        if (p.id !== 'game') setGameHint(null)
                      }
                    }}
                    disabled={!isUnlocked}
                    className={cn(
                      'flex min-h-11 items-center gap-2 px-3 py-1.5 rounded-2xl border-2 text-sm font-bold transition-all',
                      isActive
                        ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm'
                        : isUnlocked
                          ? 'bg-white border-border text-text hover:border-brand-200'
                          : 'bg-surface border-transparent text-muted opacity-60 cursor-not-allowed',
                    )}
                  >
                    <p.icon size={16} />
                    <span className="text-left leading-tight">
                      <span className="block">{p.label}</span>
                      <span className="hidden text-[10px] font-bold text-current opacity-70 lg:block">{p.description}</span>
                    </span>
                  </button>
                )
              })}
            </nav>
          </LessonNavigationHeader>

          <main
            className={cn(
              'min-h-0 flex-1 relative overflow-y-auto hidden-scrollbar pr-1',
              !isAikiRuleJourney && 'lesson-stage-main pb-10',
              isSidebarCollapsed && 'w-full max-w-[1024px] mx-auto',
              isAikiRuleJourney && 'flex flex-col',
            )}
          >
            {phase === 'learn' && (
              <div className={cn('flex flex-col animate-fade-up', isSidebarCollapsed ? 'w-full max-w-[1024px] mx-auto' : 'w-full', isAikiRuleJourney ? 'gap-2 sm:gap-2.5 flex-1 min-h-0' : 'gap-6')}>
                {/* HÀNG 2: Thanh Tiến Độ 5 Chặng Nằm Riêng 1 Hàng Ngay Trên Video */}
                {isAikiRuleJourney && (
                  <nav
                    aria-label="Tiến độ 5 chặng bài học"
                    className="grid grid-cols-5 gap-1.5 sm:gap-2.5 w-full bg-white/90 border-2 border-brand-200/80 rounded-2xl p-2 sm:p-2.5 shadow-clay shrink-0 select-none"
                  >
                    {[
                      { label: '1. Tình huống', title: 'Tình huống' },
                      { label: '2. Câu đố', title: 'Câu đố' },
                      { label: '3. Quy tắc', title: 'Quy tắc' },
                      { label: '4. Giải thích', title: 'Giải thích' },
                      { label: '5. Chốt', title: 'Chốt' },
                    ].map((step, stageIdx) => {
                      const isActive = stageIdx === aikiRuleStage
                      const isDone = stageIdx < aikiRuleStage
                      return (
                        <button
                          key={stageIdx}
                          type="button"
                          onClick={() => {
                            setAikiRuleStage(stageIdx)
                            const totalDuration = ruleData?.durationSec || 75
                            const targetSec = Math.round((stageIdx / 5) * totalDuration)
                            setVideoSeekTarget({ sec: targetSec, token: Date.now() })
                          }}
                          className={cn(
                            'flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer active:scale-95',
                            isActive && 'bg-brand-500 text-white shadow-clay ring-2 sm:ring-4 ring-brand-200 scale-[1.02]',
                            isDone && 'bg-mint-500 text-white shadow-2xs hover:bg-mint-600',
                            !isActive && !isDone && 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-brand-300',
                          )}
                          title={`Chặng ${stageIdx + 1}: ${step.title}`}
                        >
                          <span className="text-sm sm:text-base shrink-0">
                            {isDone ? '✓' : stageIdx + 1}
                          </span>
                          <span className="truncate">
                            {step.label}
                          </span>
                        </button>
                      )
                    })}
                  </nav>
                )}

                {/* Video bài giảng quy tắc 16:9 to bản sắc nét chiếm 100% Cột Trái */}
                {isAikiRuleJourney && ruleData && (
                  <Suspense fallback={<div className="p-4 text-center text-sm font-bold text-slate-400">Đang tải...</div>}>
                    <AikiRuleVideoPlayer
                      rule={ruleData}
                      seekTarget={videoSeekTarget}
                      questions={ruleData.questions}
                      activeSlideIndex={aikiRuleStage}
                      onSlideChange={handleSlideChange}
                      selectedAnswer={aikiQuizAnswer}
                      onSelectOption={handleSelectOption}
                      onPlayStateChange={handlePlayStateChange}
                    />
                  </Suspense>
                )}

                {/* Video bài giảng to bản 16:9 sắc nét đặt ở Mainbar cho khóa học thông thường */}
                {!is5StageJourney && currentLearnVideoUrl && (
                  <div className="rounded-3xl border-2 border-brand-200 bg-white p-3 sm:p-4 shadow-clay overflow-hidden">
                    <div className="flex items-center gap-2 mb-2 text-xs font-black text-brand-700 uppercase tracking-wider">
                      <Play size={15} className="text-brand-600" />
                      <span>Video bài giảng trạm {quest.order || ''}</span>
                    </div>
                    <Suspense fallback={<div className="p-4 text-center text-sm font-bold text-slate-400">Đang tải...</div>}>
                      <LectureVideo title={currentLearnVideoTitle || ''} url={currentLearnVideoUrl} />
                    </Suspense>
                  </div>
                )}

                {!is5StageJourney && (
                  <div className="rounded-3xl border border-brand-100 bg-gradient-to-r from-brand-50 via-white to-sky-50 p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      {quest.coverImage && (
                        <img
                          src={quest.coverImage}
                          alt={quest.coverImageAlt || `Minh họa cho ${quest.title}`}
                          className="h-32 w-full rounded-2xl object-cover sm:h-28 sm:w-48"
                          onError={(event) => { event.currentTarget.style.display = 'none' }}
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500">Nhiệm vụ hôm nay</p>
                        <p className="mt-1 font-display text-2xl leading-tight">Con sắp mở khóa một bí mật AI ✨</p>
                        <p className="mt-1 text-sm font-semibold leading-relaxed text-muted">
                          Đọc nhanh, thử một dự đoán và đừng ngại sửa câu trả lời. Mỗi lần kiểm chứng đều giúp con tiến bộ.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hook highlight */}
                {!is5StageJourney && (
                  <div className="relative overflow-hidden rounded-[2rem] border-[4px] border-brand-200 bg-brand-50 p-6 sm:p-8 shadow-clay text-center">
                    <h2 className="font-display text-2xl sm:text-3xl font-black text-brand-800 leading-tight">
                      {quest.hook}
                    </h2>
                    <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 opacity-20" aria-hidden="true">
                      <Star size={120} className="fill-brand-500 text-brand-500" />
                    </div>
                  </div>
                )}

                {/* Goals */}
                {!is5StageJourney && quest.goals.length > 0 && (
                  <div className="flex flex-col gap-4 rounded-[1.5rem] bg-white border-2 border-border p-5 shadow-sm">
                    <p className="text-sm font-extrabold uppercase tracking-wider text-coral-500 flex items-center gap-2">
                      <Target size={18} /> Hôm nay con sẽ:
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {quest.goals.map((g, goalIndex) => (
                        <li key={g} title={g} className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-2xl border-2 border-coral-200 bg-coral-50 px-3 py-2 text-sm font-bold text-coral-800 shadow-sm">
                          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-xs text-coral-700">{goalIndex + 1}</span>
                          <span className="line-clamp-2">{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Render khối tính năng động WYSIWYG theo tác giả CMS */}
                {(!isAikiRuleJourney || Boolean(visibleLearnCards[0]?.contentBlocks?.length)) && (
                  <section className="grid gap-4" aria-label="Nội dung xem và hiểu">
                    {visibleLearnCards.map((card, idx) => {
                      const currentStageIndex = is5StageJourney ? aikiRuleStage : idx
                      return (
                        <Suspense key={card.id || currentStageIndex} fallback={<div className="h-32 animate-pulse rounded-2xl bg-slate-100" />}>
                          <StudentStageBlocksView
                            card={card as unknown as LearnCardDraft}
                            stageIndex={currentStageIndex}
                            isAikiRuleJourney={isAikiRuleJourney}
                            quest={quest}
                            onZoomImage={(data) => setZoomedImage({ subtitle: '', description: '', ...data })}
                            answers={answers}
                            answerFeedback={answerFeedback}
                            checkingQuestionId={checkingQuestionId}
                            onChooseAnswer={(qid, optIdx) => void chooseCheckAnswer(qid, optIdx)}
                            onRewardStar={() => {
                              setStarBurst({ id: Date.now(), count: 1 })
                              setLiveStars((prev) => Math.min(3, prev + 1))
                            }}
                            isNarratingSituation={isNarratingSituation}
                            speakingLineIndex={speakingLineIndex}
                            activeSpeaker={activeSpeaker}
                            onPlaySituation={(dialogues, fullText) => {
                              playSituation(dialogues, fullText)
                              setManualMeeCue({
                                key: Date.now(),
                                text: fullText || 'Các cậu ơi, cùng lắng nghe tình huống này nhé!',
                                gesture: 'presentation',
                              })
                            }}
                            onStopSituationNarrator={stopSituationNarrator}
                            onManualMeeCue={setManualMeeCue}
                            hasAcknowledgedRule={hasAcknowledgedRule}
                            onAcknowledgeRule={() => {
                              setHasAcknowledgedRule(true)
                              setStarBurst({ id: Date.now(), count: 1 })
                              setLiveStars((prev) => Math.max(prev, aikiQuizAnswerCorrect ? 2 : 1))
                              setManualMeeCue({
                                key: Date.now(),
                                text: 'Xuất sắc! Con đã nắm trọn Quy tắc Vàng này rồi!',
                                gesture: 'celebrate',
                              })
                            }}
                            onOpenPosterModal={() => setIsPosterModalOpen(true)}
                            hasCommitted={hasCommitted}
                            onToggleCommit={() => {
                              setHasCommitted((prev) => !prev)
                              if (!hasCommitted) {
                                setStarBurst({ id: Date.now(), count: 1 })
                                setLiveStars(3)
                                setManualMeeCue({
                                  key: Date.now(),
                                  text: isIslandJourney ? 'Tuyệt vời! Con đã hoàn thành xuất sắc bài học này!' : 'Tuyệt vời! Chào mừng Hiệp Sĩ Sáng Tạo mới của Xưởng AIKI!',
                                  gesture: 'celebrate',
                                })
                              }
                            }}
                            onAikiFinish={() => void handleAikiFinish()}
                            onNextStage={(nextIdx) => setAikiRuleStage(nextIdx)}
                            busy={busy}
                          />
                        </Suspense>
                      )
                    })}
                  </section>
                )}

                {quest.media && quest.media.length > 0 && (
                  <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-3">
                    <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-sky-600">Góc quan sát</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {quest.media.map((media) => (
                        <figure key={media.id} className="overflow-hidden rounded-xl bg-white">
                          <img src={media.url} alt={media.alt} className="h-36 w-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none' }} />
                          {media.caption && <figcaption className="p-2 text-xs font-semibold text-muted">{media.caption}</figcaption>}
                        </figure>
                      ))}
                    </div>
                  </div>
                )}

                {!is5StageJourney && (
                  <Button
                    variant="primary"
                    className="w-full text-lg sm:text-xl font-black h-16 rounded-2xl shadow-clay border-b-[4px] border-brand-700 active:border-b-0 active:translate-y-1 mt-2"
                    onClick={() => {
                      if (reviewMode) {
                        setReviewMode(false)
                        setPhase('done')
                        return
                      }
                      void advanceFromLearn()
                    }}
                    disabled={busy}
                  >
                    {!reviewMode && <Gamepad2 size={24} aria-hidden="true" />}
                    {reviewMode
                      ? 'Quay lại kết quả'
                      : gameStation
                        ? 'Bắt đầu trò chơi'
                        : 'Bắt đầu thực hành'}
                  </Button>
                )}

                {isIslandJourney && !isAikiRuleJourney && (
                  <div className="pt-3 animate-fade-up">
                    <Button
                      variant="primary"
                      className="w-full text-lg sm:text-xl font-black h-16 rounded-2xl shadow-clay border-b-[4px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2 cursor-pointer"
                      onClick={() => setPhase('practice')}
                    >
                      <span>Vào Xưởng Sáng Tạo Thực Hành (Studio Mode)</span>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {phase === 'game' && gameStation && (
              <div className="ui-card p-5 animate-fade-up">
                <div className="mb-4">
                  <div className="companion-bubble" style={{ maxWidth: 'none', width: '100%' }}>
                    <p className="text-sm font-bold">
                      {gameStation.instruction ?? 'Chơi một lượt để ghi nhớ ý chính của bài! Không sao nếu thử nhiều lần. 😊'}
                    </p>
                  </div>
                </div>
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center p-12">
                      <div className="w-8 h-8 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
                    </div>
                  }
                >
                  <CurriculumGame
                    gameType={gameStation.gameType}
                    gameConfig={gameStation.gameConfig}
                    instruction={gameStation.instruction ?? ''}
                    outcome={gameStation.outcome}
                    onComplete={(evidence) => void advanceFromGame(evidence)}
                    onGameHint={setGameHint}
                  />
                </Suspense>
              </div>
            )}

            {phase === 'game' && !gameStation && (
              <div className="ui-card flex flex-col items-start gap-3 p-5 animate-fade-up">
                <p className="font-display text-xl">Bài này không có trò chơi</p>
                <p className="text-sm text-muted">
                  Con có thể chuyển thẳng sang phần thực hành.
                </p>
                <Button
                  disabled={busy}
                  onClick={() => void advanceFromGame({ skipped: true })}
                >
                  Tiếp tục thực hành
                </Button>
              </div>
            )}

            {phase === 'practice' && (
              is5StageJourney && quest ? (
                <div className="w-full">
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center p-12">
                        <div className="w-8 h-8 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
                      </div>
                    }
                  >
                    <AikiStudioWorkspace
                      config={studioConfig}
                      lessonId={quest.id}
                      lessonTitle={quest.title}
                      lessonBadge={
                        isAikiRuleJourney
                          ? `QT ${ruleId}`
                          : quest.order
                            ? `Bài ${quest.order}`
                            : 'Bài thực hành'
                      }
                      characterName={studioCharacterName}
                      lockedFeatures={studioLockedFeatures}
                      studentStars={liveStars || 42}
                      initialInstantFallback={true}
                      onBackToLesson={() => setPhase('learn')}
                      onReplayVideo={() => {
                        setPhase('learn')
                        setVideoSeekTarget({ sec: 0, token: Date.now() })
                      }}
                      onZoomImage={(data) => setZoomedImage({ subtitle: '', description: '', ...data })}
                      onSubmitWork={({ selectedImage, prompt }) => {
                        setGenerated({
                          title: prompt,
                          url:
                            selectedImage.url ||
                            studioConfig?.preloadedImages?.[studioConfig.preloadedImages.length - 1]?.url ||
                            '/assets/aiki-islands/island3_lesson2_code3.jpg',
                          mediaKind: 'image',
                        })
                        setPracticeSaved(true)
                        void handleAikiFinish()
                      }}
                    />
                  </Suspense>
                </div>
              ) : (
                <div className="ui-card flex flex-col gap-5 p-4 sm:p-5 animate-fade-up">
                  <section aria-labelledby="practice-brief-title">
                    <div className="rounded-2xl border-2 border-mint-200 bg-mint-50 p-4 sm:p-5">
                      <p id="practice-brief-title" className="font-display flex items-center gap-2 text-xl text-text">
                        <PencilLine size={22} className="text-mint-700" aria-hidden="true" />
                        Nhiệm vụ thực hành
                      </p>
                      {practiceStation?.instruction && (
                        <p className="mt-2 font-semibold leading-relaxed text-text">
                          {practiceStation.instruction}
                        </p>
                      )}
                      <ol className="mt-4 grid gap-2">
                        {practiceSteps.map((step, index) => (
                          <li key={`${index}-${step}`} className="flex items-start gap-3 rounded-xl bg-white/80 px-3 py-2.5 text-sm font-bold leading-snug text-text">
                            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-mint-100 text-xs text-mint-700" aria-hidden="true">
                              {index + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </section>
                  {!practiceSaved && (
                    <>
                      {quest.practiceKind === 'chips' && quest.chips && (
                        <div className="flex flex-col gap-6 bg-brand-50/50 p-4 sm:p-6 rounded-[2rem] border-[4px] border-brand-100 shadow-sm relative overflow-hidden">
                          <div className="bg-white rounded-[1.5rem] p-5 border-[3px] border-brand-200 shadow-sm relative">
                            <p className="text-xs font-black uppercase tracking-wider text-brand-400 mb-2">Thần chú của con</p>
                            <p className="text-lg font-bold text-text leading-relaxed">
                              {isPromptComplete(parts) ? promptText : (
                                <span className="text-muted">Hãy chọn thẻ bài để ghép thành câu lệnh nhé...</span>
                              )}
                            </p>
                          </div>

                          <div className="flex flex-col gap-5">
                            {(Object.keys(quest.chips) as PromptSlotKey[]).map((slot, idx) => {
                              const TONES = [
                                { bg: 'bg-sun-50', border: 'border-sun-300', text: 'text-sun-600', active: 'bg-sun-100 border-sun-500 shadow-clay' },
                                { bg: 'bg-mint-50', border: 'border-mint-300', text: 'text-mint-600', active: 'bg-mint-100 border-mint-500 shadow-clay' },
                                { bg: 'bg-sky-50', border: 'border-sky-300', text: 'text-sky-600', active: 'bg-sky-100 border-sky-500 shadow-clay' },
                                { bg: 'bg-coral-50', border: 'border-coral-300', text: 'text-coral-600', active: 'bg-coral-100 border-coral-500 shadow-clay' },
                                { bg: 'bg-brand-50', border: 'border-brand-300', text: 'text-brand-600', active: 'bg-brand-100 border-brand-500 shadow-clay' },
                              ]
                              const tone = TONES[idx % TONES.length]

                              return (
                                <div key={slot} className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="flex items-center justify-center size-6 rounded-full text-xs font-black text-white bg-text">{idx + 1}</span>
                                    <p className="text-sm font-black uppercase tracking-wide text-text/80">
                                      {SLOT_LABELS[slot] || slot}
                                    </p>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {(quest.chips![slot] ?? []).map((chip) => {
                                      const isActive = parts[slot]?.id === chip.id
                                      return (
                                        <button
                                          key={chip.id}
                                          type="button"
                                          className={cn(
                                            'relative flex items-center gap-2 px-4 py-2.5 rounded-2xl border-[3px] font-bold text-sm transition-all',
                                            isActive
                                              ? cn(tone.active, 'translate-y-1 border-b-[3px]')
                                              : cn('bg-white hover:-translate-y-1 hover:shadow-sm border-b-[5px]', tone.border, tone.text),
                                          )}
                                          onClick={() => selectChip(chip as PromptChip)}
                                        >
                                          <span className="text-xl">{chip.emoji}</span>
                                          <span className={isActive ? 'text-text' : ''}>{chip.label}</span>
                                          {isActive && (
                                            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm">
                                              <Check size={12} strokeWidth={4} />
                                            </div>
                                          )}
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {quest.practiceKind === 'character' && (
                        <>
                          <div className="overflow-hidden rounded-2xl border-2 border-border">
                            <img
                              src={designerAssets.workshop.character}
                              alt=""
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                              className="h-28 w-full object-cover opacity-90"
                            />
                          </div>
                          <p className="font-extrabold">Xưởng nhân vật · AIkid</p>
                          <p className="text-sm text-muted">Chọn loại & tính cách (không dùng tên thật).</p>
                          <div>
                            <p className="mb-2 text-sm font-bold text-muted">Loại nhân vật</p>
                            <div className="flex flex-wrap gap-2">
                              {CHARACTER_SHAPES.map((s) => (
                                <button
                                  key={s.id}
                                  type="button"
                                  className={cn('chip', charShape === s.id && 'chip-active')}
                                  onClick={() => setCharShape(s.id)}
                                >
                                  {s.emoji} {s.labelVi}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="mb-2 text-sm font-bold text-muted">Tính cách</p>
                            <div className="flex flex-wrap gap-2">
                              {CHARACTER_VIBES.map((v) => (
                                <button
                                  key={v.id}
                                  type="button"
                                  className={cn('chip', charVibe === v.id && 'chip-active')}
                                  onClick={() => setCharVibe(v.id)}
                                >
                                  {v.emoji} {v.labelVi}
                                </button>
                              ))}
                            </div>
                          </div>
                          <label className="flex flex-col gap-1 text-sm font-bold">
                            Biệt danh an toàn
                            <input
                              className="min-h-12 rounded-2xl border-2 border-border px-4"
                              value={charName}
                              maxLength={16}
                              onChange={(e) => setCharName(e.target.value)}
                            />
                          </label>
                        </>
                      )}

                      {quest.practiceKind === 'style' && (
                        <>
                          <p className="font-extrabold">Chọn phong cách vẽ</p>
                          <p className="text-sm text-muted">
                            Thẻ designer AIkid — ấm, handmade, không bóng nhựa AI.
                          </p>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                            {ART_STYLES.map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => setStyleId(s.id)}
                                className={cn(
                                  'overflow-hidden rounded-2xl border-4 bg-white text-left transition',
                                  styleId === s.id
                                    ? 'border-brand-500 shadow-clay scale-[1.02]'
                                    : 'border-border hover:border-brand-100',
                                )}
                              >
                                <img
                                  src={styleImage(s.id)}
                                  alt=""
                                  className="aspect-square w-full object-cover"
                                />
                                <span className="block px-2 py-2 text-xs font-extrabold">
                                  {s.labelVi}
                                </span>
                              </button>
                            ))}
                          </div>
                          {styleId && (
                            <p className="rounded-xl bg-mint-100 px-3 py-2 text-sm">
                              Đã chọn:{' '}
                              <strong>
                                {ART_STYLES.find((x) => x.id === styleId)?.labelVi}
                              </strong>
                              {' — '}
                              {ART_STYLES.find((x) => x.id === styleId)?.tip}
                            </p>
                          )}
                        </>
                      )}

                      {quest.practiceKind === 'story' && (
                        <>
                          <p className="font-extrabold">Chọn 3 nhịp truyện</p>
                          {(
                            [
                              { key: 'opening' as const, list: STORY_OPENINGS, label: 'Mở đầu' },
                              { key: 'problem' as const, list: STORY_PROBLEMS, label: 'Sự cố' },
                              { key: 'ending' as const, list: STORY_ENDINGS, label: 'Kết' },
                            ] as const
                          ).map((block) => (
                            <div key={block.key}>
                              <p className="mb-2 text-sm font-bold text-muted">{block.label}</p>
                              <div className="flex flex-wrap gap-2">
                                {block.list.map((item) => (
                                  <button
                                    key={item.id}
                                    type="button"
                                    className={cn('chip', story[block.key] === item.label && 'chip-active')}
                                    onClick={() => setStory((s: any) => ({ ...s, [block.key]: item.label }))}
                                  >
                                    {item.emoji} {item.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {quest.practiceKind === 'detective' && (
                        <>
                          <p className="font-extrabold">Ảnh nào đúng ý hơn? (AI có thể sai!)</p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {[0, 1].map((i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setDetectivePick(i as 0 | 1)}
                                className={cn(
                                  'rounded-2xl border-4 p-2 transition',
                                  detectivePick === i ? 'border-mint-400 scale-[1.02]' : 'border-border',
                                )}
                              >
                                <div
                                  className="flex h-36 items-center justify-center rounded-xl text-5xl"
                                  style={{
                                    background:
                                      i === 0
                                        ? 'linear-gradient(135deg,#dcd6ff,#c8eeff)'
                                        : 'linear-gradient(135deg,#ffe6eb,#fff4d6)',
                                  }}
                                >
                                  {i === 0 ? '🐱🪐' : '🐶🌵'}
                                </div>
                                <p className="mt-2 text-sm font-bold">
                                  {i === 0 ? 'Gần đúng mô tả' : 'Lệch ý (bẫy AI)'}
                                </p>
                              </button>
                            ))}
                          </div>
                        </>
                      )}

                      {quest.practiceKind === 'comic' && (
                        <>
                          <p className="font-extrabold">Truyện 4 khung — thêm lời thoại ngắn</p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {panels.map((p, idx) => (
                              <div key={p.panel} className="rounded-2xl border-2 border-border p-3">
                                <p className="text-xs font-bold text-brand-500">Khung {p.panel}: {p.label}</p>
                                <p className="text-sm text-muted">{p.beat}</p>
                                <input
                                  aria-label={`Lời thoại khung ${p.panel}`}
                                  className="mt-2 min-h-10 w-full rounded-xl border border-border px-2 text-sm"
                                  value={comicBubbles[idx] ?? ''}
                                  maxLength={40}
                                  onChange={(e) => {
                                    const next = [...comicBubbles]
                                    next[idx] = e.target.value
                                    setComicBubbles(next)
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {(quest.practiceKind === 'video' || quest.practiceKind === 'intro') && (
                        <div className="rounded-2xl bg-mint-100 p-4">
                          <p className="font-extrabold">
                            {quest.practiceKind === 'intro'
                              ? 'Con đã sẵn sàng? Bấm tiếp để kiểm tra kiến thức nhỏ!'
                              : 'Sắp xếp cảnh video mini — mỗi cảnh một câu kể.'}
                          </p>
                          {quest.practiceKind === 'video' && (
                            <label className="mt-3 flex flex-col gap-2 text-sm font-bold">
                              Mô tả chuyển động hoặc cảnh phim của con
                              <textarea
                                className="min-h-28 rounded-2xl border-2 border-border bg-white p-3 font-normal"
                                value={journalText}
                                maxLength={800}
                                placeholder="Ai đang làm gì, chuyển động nhanh hay chậm, cảm xúc ra sao?"
                                onChange={(event) => setJournalText(event.target.value)}
                              />
                            </label>
                          )}
                        </div>
                      )}

                      <Suspense fallback={<div className="p-4 text-center text-sm font-bold text-slate-400">Đang tải...</div>}>
                        {['ai_pick', 'video', 'chips', 'character'].includes(quest.practiceKind) && (
                          <RefMediaPicker
                            questId={questId}
                            selectedIds={refAssetIds}
                            onChange={setRefAssetIds}
                            max={4}
                          />
                        )}

                        {quest.practiceKind === 'sketch' && (
                          <div className="flex flex-col gap-3">
                            <SketchCanvas onChange={setSketchDataUrl} />
                            <label className="flex flex-col gap-1 text-sm font-bold">
                              Ghi chú ngắn (tuỳ chọn)
                              <input
                                className="min-h-11 rounded-xl border-2 border-border px-3 text-sm"
                                value={journalText}
                                maxLength={200}
                                placeholder="Ví dụ: thế giới kẹo của con"
                                onChange={(e) => setJournalText(e.target.value)}
                              />
                            </label>
                          </div>
                        )}

                        {quest.practiceKind === 'prompt_lab' && (
                          <PromptLab value={promptLab} onChange={setPromptLab} />
                        )}

                        {(quest.practiceKind === 'card' ||
                          quest.practiceKind === 'card_balance' ||
                          quest.id.includes('bai-5-2') ||
                          quest.title.toLowerCase().includes('mặt thẻ') ||
                          quest.title.toLowerCase().includes('phù phép mặt thẻ')) && (
                          <CardBalancePractice
                            onSave={(card) => {
                              setJournalText(
                                `Thẻ: ${card.name} | Sức ${card.power}, Nhanh ${card.speed}, Khéo ${card.agility} | Kỹ năng: ${card.skill}`,
                              )
                            }}
                          />
                        )}

                        {quest.practiceKind === 'ordering' && orderingCards.length > 0 && (
                          <div className="grid gap-4">
                            <OrderingPractice
                              prompt={practiceStation?.practiceConfig?.prompt ?? practiceStation?.instruction ?? 'Sắp xếp các bước theo thứ tự hợp lý.'}
                              cards={orderingCards}
                              order={effectivePracticeOrder}
                              onChange={setPracticeOrder}
                            />
                            <label className="rounded-3xl border-2 border-mint-200 bg-mint-50 p-4 font-bold text-text sm:p-5">
                              Lý do sắp xếp của con
                              <span className="mt-1 block text-sm font-semibold text-muted">Giải thích ngắn vì sao các bước cần đi theo thứ tự này.</span>
                              <textarea
                                className="mt-3 min-h-36 w-full rounded-2xl border-2 border-mint-200 bg-white p-4 font-semibold leading-relaxed focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100"
                                value={journalText}
                                maxLength={600}
                                placeholder="Con xếp như vậy vì bước đầu tiên cần… Sau đó…"
                                onChange={(event) => setJournalText(event.target.value)}
                              />
                              <span className="mt-2 block text-right text-xs text-muted">{journalText.trim().length}/600 ký tự</span>
                            </label>
                          </div>
                        )}
                      </Suspense>

                      {(quest.practiceKind === 'journal' ||
                        quest.practiceKind === 'reflect' ||
                        quest.practiceKind === 'spin' ||
                        quest.practiceKind === 'match' ||
                        quest.practiceKind === 'ai_pick') && (
                        <div className="flex flex-col gap-3 rounded-2xl border-2 border-brand-100 bg-white p-4 sm:p-5">
                          <label htmlFor="practice-journal" className="font-display text-xl text-text">
                            {quest.practiceKind === 'ai_pick'
                              ? 'Mô tả để máy vẽ giúp — con chọn ý trước nhé!'
                              : quest.practiceKind === 'spin'
                                ? 'Vòng quay ý tưởng — ghi 3 từ khoá của con'
                                : 'Sổ tay thực hành — giải thích ý của con'}
                          </label>
                          <p className="text-sm font-semibold leading-relaxed text-muted">
                            {practiceStation?.reflectionPrompt ??
                              'Viết điều con quan sát được, câu trả lời của con và lý do con nghĩ như vậy.'}
                          </p>
                          <textarea
                            id="practice-journal"
                            aria-label="Ý tưởng của con"
                            className="min-h-40 rounded-2xl border-2 border-border bg-page p-4 font-semibold leading-relaxed text-text focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100"
                            placeholder="Ví dụ: Con quan sát thấy… Con nghĩ AI học từ… vì… (không dùng tên thật)"
                            value={journalText}
                            maxLength={500}
                            onChange={(e) => setJournalText(e.target.value)}
                          />
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-muted">
                            <span>Viết ít nhất 20 ký tự và trả lời đủ các ý trong nhiệm vụ.</span>
                            <span aria-live="polite">{journalText.trim().length}/500 ký tự</span>
                          </div>
                        </div>
                      )}

                      {quest.practiceKind === 'palette' && (
                        <div className="flex flex-col gap-3">
                          <p className="font-extrabold">Chọn 3 màu cho thế giới của con</p>
                          <div className="flex flex-wrap gap-3">
                            {paletteColors.map((c, i) => (
                              <label key={i} className="flex flex-col items-center gap-1 text-xs font-bold">
                                Màu {i + 1}
                                <input
                                  type="color"
                                  value={c}
                                  className="h-12 w-12 cursor-pointer rounded-xl border-2 border-border"
                                  onChange={(e) => {
                                    const next = [...paletteColors]
                                    next[i] = e.target.value
                                    setPaletteColors(next)
                                  }}
                                />
                              </label>
                            ))}
                          </div>
                          <textarea
                            aria-label="Lý do chọn bảng màu"
                            className="min-h-20 rounded-2xl border-2 border-border p-3 text-sm"
                            placeholder="Vì sao con chọn màu này?"
                            value={journalText}
                            maxLength={200}
                            onChange={(e) => setJournalText(e.target.value)}
                          />
                        </div>
                      )}
                    </>
                  )}

                  {practiceSaved && generated && (
                    <div className="overflow-hidden rounded-2xl border-2 border-border">
                      {generated.mediaKind === 'video' ? (
                        <video src={generated.url} controls playsInline preload="metadata" className="max-h-80 w-full bg-black">
                          Trình duyệt chưa phát được video này.
                        </video>
                      ) : (
                        <img src={generated.url} alt={generated.title} className="max-h-64 w-full bg-brand-50 object-contain" />
                      )}
                      <p className="p-2 text-center text-sm font-bold">{generated.title}</p>
                    </div>
                  )}

                  {practiceSaved && practiceFeedback && (
                    <div className="rounded-2xl border-2 border-mint-300 bg-mint-100/50 p-4" role="status">
                      <p className="font-extrabold text-mint-700">Đã lưu sản phẩm</p>
                      <p className="mt-1 text-sm font-semibold text-muted">
                        {practiceFeedback} Hãy xem lại rồi tiếp tục khi con sẵn sàng.
                      </p>
                    </div>
                  )}

                  {practiceSaved ? (
                    <Button
                      onClick={() =>
                        practiceAdvanced
                          ? setPhase('check')
                          : void advanceFromPractice()
                      }
                      disabled={busy}
                    >
                      {busy ? 'Đang mở kiểm tra…' : 'Tiếp tục kiểm tra'}
                    </Button>
                  ) : (
                    <Button onClick={() => void savePractice()} disabled={busy}>
                      {busy ? 'Đang lưu…' : 'Lưu sản phẩm'}
                    </Button>
                  )}
                </div>
              )
            )}

            {phase === 'check' && (
              <div className="ui-card flex flex-col gap-5 p-5 animate-fade-up">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-extrabold text-lg">Kiểm tra nhanh</p>
                    <p className="text-xs text-muted">Chọn từng đáp án để biết ngay đúng hay chưa.</p>
                  </div>
                  <p className="rounded-xl bg-sun-50 px-3 py-2 text-xs font-bold text-warning">
                    Sao cuối chỉ sáng khi tất cả câu đều đúng.
                  </p>
                </div>
                {quest.check.map((q, qIdx) => (
                  <div key={q.id} className="flex flex-col gap-2">
                    <p className="font-bold">
                      <span className="text-brand-500 mr-1">{qIdx + 1}.</span>
                      {q.question}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {q.options.map((opt, idx) => {
                        const isImage = opt.startsWith('http')
                        return (
                          <button
                            key={opt}
                            type="button"
                            className={cn(
                              isImage
                                ? 'group relative overflow-hidden rounded-2xl border-4 p-0 text-left transition-all hover:-translate-y-1 hover:shadow-clay'
                                : 'game-card text-left text-sm font-semibold',
                              !isImage && answers[q.id] === idx && 'game-card-selected',
                              isImage && answers[q.id] !== idx && 'border-transparent',
                              isImage && answers[q.id] === idx && 'border-brand-500 scale-[1.02] shadow-clay',
                              answers[q.id] === idx &&
                                answerFeedback[q.id]?.correct &&
                                'lesson-answer-correct',
                              answers[q.id] === idx &&
                                answerFeedback[q.id] &&
                                !answerFeedback[q.id].correct &&
                                'lesson-answer-wrong',
                            )}
                            disabled={
                              answerFeedback[q.id]?.correct === true ||
                              checkingQuestionId === q.id
                            }
                            onClick={() => void chooseCheckAnswer(q.id, idx)}
                          >
                            {isImage ? (
                              <>
                                <img
                                  src={opt}
                                  alt={`Option ${String.fromCharCode(65 + idx)}`}
                                  className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                                <div className="absolute top-3 left-3">
                                  <span className={cn(
                                    'inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm font-extrabold shadow-sm',
                                    answers[q.id] === idx ? 'bg-brand-500 text-white' : 'bg-white/90 text-brand-700 backdrop-blur-sm',
                                  )}>
                                    {String.fromCharCode(65 + idx)}
                                  </span>
                                </div>
                                {answers[q.id] === idx && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-brand-500/20 backdrop-blur-[2px] animate-in fade-in duration-300">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg animate-in zoom-in-50 spin-in-12 duration-500">
                                      <span className="text-2xl" aria-hidden>✨</span>
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                <span className={cn(
                                  'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold mr-2 flex-shrink-0',
                                  answers[q.id] === idx ? 'bg-brand-500 text-white' : 'bg-brand-50 text-brand-600',
                                )}>
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                {opt}
                              </>
                            )}
                          </button>
                        )
                      })}
                    </div>
                    {checkingQuestionId === q.id && (
                      <p className="text-sm font-bold text-brand-500" role="status">
                        Đang kiểm tra đáp án…
                      </p>
                    )}
                    {answerFeedback[q.id] && (
                      <div
                        className={cn(
                          'rounded-2xl border-2 px-4 py-3 text-sm font-semibold animate-pop',
                          answerFeedback[q.id].correct
                            ? 'border-mint-300 bg-mint-100/60 text-mint-700'
                            : 'border-coral-200 bg-coral-50 text-coral-700',
                        )}
                        role="status"
                      >
                        <p className="font-extrabold">
                          {answerFeedback[q.id].correct
                            ? '✅ Chính xác!'
                            : 'Chưa đúng — con chọn lại ngay nhé.'}
                        </p>
                        <p className="mt-1">{answerFeedback[q.id].explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => void submitCheck()}
                    disabled={busy || checkingQuestionId !== null || !allCheckAnswersCorrect}
                  >
                    {!busy && <Star size={18} aria-hidden="true" />}
                    {busy ? 'Đang hoàn thành…' : 'Hoàn thành'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/world/${effectiveCourseId}`)}
                  >
                    <NavWorldIcon size={18} aria-hidden="true" />
                    Thoát về bản đồ
                  </Button>
                </div>
              </div>
            )}

            <LessonCelebrationModal
              open={phase === 'done'}
              checkResult={checkResult}
              quest={quest}
              onNextQuest={(nextId) => navigate(`/world/${effectiveCourseId}/lesson/${nextId}`)}
              onBackToMap={() => navigate(`/world/${effectiveCourseId}`)}
              onRetry={() => {
                setReviewMode(false)
                setAnswers({})
                setAnswerFeedback({})
                setLiveStars(0)
                setStarBurst(null)
                setError(null)
                setPhase('check')
              }}
              onReview={() => {
                setReviewMode(true)
                setPhase('learn')
                setAnswers({})
              }}
            />
          </main>
        </div>
      </div>

      {/* Modals cho AIKI Rule: Phóng to tranh & Tấm Poster Quy Tắc Vàng */}
      <AikiPictureZoomModal
        data={zoomedImage}
        onClose={() => setZoomedImage(null)}
      />
      <AikiPosterModal
        open={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
        ruleBody={hydratedLearnCards[2]?.body || visibleLearnCards[0]?.body || 'Nghĩ ra ý tưởng của riêng mình trước, sau đó mới dùng AI để làm cho ý tưởng phong phú hơn!'}
        ruleTip={hydratedLearnCards[2]?.tip || visibleLearnCards[0]?.tip}
      />

      <CoursePaywallModal
        open={isPaywallOpen}
        courseTitle={quest?.title || routeCourseId || effectiveCourseId}
        onClose={() => setIsPaywallOpen(false)}
        onContinueFree={() => {
          setIsPaywallOpen(false)
          navigate('/world')
        }}
        onUpgrade={() => {
          if (isParent) {
            navigate('/parent/learning?upgrade=aikids_official_129k')
          } else {
            setIsParentGateOpen(true)
          }
        }}
      />
      {isParentGateOpen && (
        <ParentGateModal
          open={isParentGateOpen}
          onClose={() => setIsParentGateOpen(false)}
          redirectTo="/parent/learning?upgrade=aikids_official_129k"
        />
      )}
    </div>
  )
}
