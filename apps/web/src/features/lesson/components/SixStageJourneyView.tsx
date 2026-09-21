import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Target,
  HelpCircle,
  Video,
  FileQuestion,
  Palette,
  Trophy,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Star,
  X,
  Volume2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  RotateCcw,
  Lock,
} from 'lucide-react'
import { CourseCertificateModal } from './CourseCertificateModal'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/Button'
import type { LessonSixStageJourney } from '@/shared/lib/api'
import {
  type StudioImageItem,
  type PracticePartState,
} from '../lib/practice-parts'
import { playInstantSound } from './LessonInteractiveSidebar'
import { StudentStageBlocksView } from './StudentStageBlocksView'
import type { LearnCardDraft, StageBlockItem } from '@/features/teacher/lib/authoring'
import { normalizeVietnameseSpeech } from '@/shared/lib/vietnameseSpeech'
import { findIslandCurriculum } from '@/features/lesson/data/island-curriculum-registry'
import {
  adaptSixStageJourneyToStages,
  isValidImageUrl,
  parseGoalCard,
  GOAL_CARD_STYLES,
} from '../lib/stage-adapter'
import { STAGE_REGISTRY } from './stages'
import type { ParsedGoalCard } from '../types/stage-schema'

// Re-export helpers for 100% backward compatibility
export { isValidImageUrl, parseGoalCard, GOAL_CARD_STYLES }
export type { ParsedGoalCard }

export interface SixStageJourneyViewProps {
  journey: LessonSixStageJourney
  lessonId: string
  lessonTitle: string
  studentStars?: number
  rewardXp?: number
  isCompleted?: boolean
  previousStars?: number
  onFinishLesson?: (result: { stars: number; xp: number; nextLessonSlug?: string }) => void
  onBackToMap?: () => void
  onNavigateNextLesson?: (nextLessonSlug: string) => void
  initialStageIndex?: number
  onStageChange?: (stageIndex: number) => void
  initialSidebarCollapsed?: boolean
}

/**
 * Quy đổi thống nhất Sao sang XP cho toàn bộ trạm học AIKids:
 * - 1 Sao = 30 XP
 * - 2 Sao = 60 XP
 * - 3 Sao = 100 XP (kèm 10 XP Mastery Bonus)
 */
export function calculateStationXp(stars: number): number {
  if (stars >= 3) return 100
  if (stars === 2) return 60
  if (stars === 1) return 30
  return 0
}

export const STAGES = [
  { index: 0, title: 'Mục tiêu', icon: Target, stepNumber: 1 },
  { index: 1, title: 'Xác nhận', icon: HelpCircle, stepNumber: 2 },
  { index: 2, title: 'Video', icon: Video, stepNumber: 3 },
  { index: 3, title: 'Bài test', icon: FileQuestion, stepNumber: 4 },
  { index: 4, title: 'Thực hành', icon: Palette, stepNumber: 5 },
  { index: 5, title: 'Hoàn thành', icon: Trophy, stepNumber: 6 },
] as const

export function SixStageJourneyView({
  journey,
  lessonId,
  lessonTitle,
  studentStars = 42,
  rewardXp: rewardXpProp,
  isCompleted = false,
  previousStars,
  onFinishLesson,
  onBackToMap,
  onNavigateNextLesson,
  initialStageIndex = 0,
  onStageChange,
  initialSidebarCollapsed,
}: SixStageJourneyViewProps) {
  const matchedCurriculum = useMemo(() => {
    return findIslandCurriculum({ id: lessonId, slug: lessonId, title: lessonTitle })
  }, [lessonId, lessonTitle])

  const stationInfo = useMemo(() => {
    const curriculum = matchedCurriculum
    const cleanCurriculumTitle = (rawTitle: string) => {
      return (rawTitle || '')
        .replace(/^Bài\s+[\d.]+\s*[-—:]\s*/i, '')
        .replace(/^Trạm\s+[\d.]+\s*[-—:]\s*/i, '')
        .trim()
    }

    const ISLAND_CANONICAL_NAMES: Record<number, string> = {
      0: 'Đảo Tiên Quyết',
      1: 'Đảo 1: Nhà Thám Hiểm AI',
      2: 'Đảo 2: Hoạ Sĩ AI',
      3: 'Đảo 3: Biệt Đội Nhân Vật',
      4: 'Đảo 4: Vương Quốc Truyện Tranh',
      5: 'Đảo 5: Đấu Trường Trò Chơi',
      6: 'Đảo 6: Triển Lãm & Tốt Nghiệp',
    }

    if (curriculum) {
      const num = String(curriculum.lessonNumber || '1.1')
      const pureTitle = cleanCurriculumTitle(curriculum.title)
      let title = pureTitle
      let icon = '🎨'
      let stationLabel = `Trạm ${num}: ${pureTitle}`

      if (num === '1.1') {
        title = 'Mèo AIKI'
        icon = '🐱'
        stationLabel = 'Trạm 1: Mèo AIKI'
      } else if (num === '1.2') {
        title = '4 Chìa Khoá'
        icon = '🔑'
        stationLabel = 'Trạm 2: 4 Chìa Khoá'
      } else if (num === '1.3') {
        title = 'Lăng Kính Phù Thủy'
        icon = '🪄'
        stationLabel = 'Trạm 3: Lăng Kính Phù Thủy'
      } else if (num === '1.4') {
        title = 'Kỹ Sư Tài Ba'
        icon = '🩺'
        stationLabel = 'Trạm 4: Kỹ Sư Tài Ba'
      } else if (num === '2.1') {
        title = 'Bức Tranh Biết Nói'
        icon = '🦊'
        stationLabel = `Trạm ${num}: Bức Tranh Biết Nói`
      } else if (num === '2.2') {
        title = 'Ai Là Ngôi Sao?'
        icon = '⭐'
        stationLabel = `Trạm ${num}: Ai Là Ngôi Sao?`
      } else if (num === '2.3') {
        title = 'Cảm Xúc Của Sắc Màu'
        icon = '🌈'
        stationLabel = `Trạm ${num}: Cảm Xúc Sắc Màu`
      } else if (num === '2.4') {
        title = 'Mảnh Ghép Hoàn Hảo'
        icon = '🖼️'
        stationLabel = `Trạm ${num}: Mảnh Ghép Hoàn Hảo`
      } else if (num.startsWith('3.')) {
        icon = '🔒'
        stationLabel = `Trạm ${num}: ${pureTitle}`
      } else if (num.startsWith('4.')) {
        icon = '📚'
        stationLabel = `Trạm ${num}: ${pureTitle}`
      } else if (num.startsWith('5.')) {
        icon = '🃏'
        stationLabel = `Trạm ${num}: ${pureTitle}`
      }

      return {
        stationLabel,
        icon,
        islandName: ISLAND_CANONICAL_NAMES[curriculum.islandNumber] || (curriculum as any).islandName || `Đảo ${curriculum.islandNumber}`,
        lessonNumber: num,
      }
    }

    const safeTitle = cleanCurriculumTitle(lessonTitle || 'Bài học')
    return {
      stationLabel: safeTitle.startsWith('Trạm') ? safeTitle : `Trạm: ${safeTitle}`,
      icon: '🎨',
      islandName: 'Đảo Sáng Tạo',
      lessonNumber: '1',
    }
  }, [matchedCurriculum, lessonTitle])

  // Adapter transforms journey data into declarative stages without hardcoded lesson checks
  const stages = useMemo(() => {
    return adaptSixStageJourneyToStages(journey, {
      lessonId,
      lessonTitle,
      stationInfo,
      matchedCurriculum,
    })
  }, [journey, lessonId, lessonTitle, stationInfo, matchedCurriculum])

  const [currentStage, setCurrentStage] = useState<number>(initialStageIndex)
  const [completedStages, setCompletedStages] = useState<Set<number>>(() => new Set([0]))
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof initialSidebarCollapsed === 'boolean') {
      return initialSidebarCollapsed
    }
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768
    }
    return false
  })

  // Stage 1 (Confirm goal) state
  const [selectedConfirmOption, setSelectedConfirmOption] = useState<number | null>(null)
  const [isConfirmCorrect, setIsConfirmCorrect] = useState<boolean | null>(null)
  const [failedOptionImages, setFailedOptionImages] = useState<Record<string, boolean>>({})

  // Stage 2 (Video) seek state
  const [videoSeekSec, setVideoSeekSec] = useState<number | null>(null)

  // Stage 3 (Quiz) state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false)
  const [activeQuizQuestionIdx, setActiveQuizQuestionIdx] = useState(0)
  const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>({})
  const [failedQuizImages, setFailedQuizImages] = useState<Record<number, boolean>>({})
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false)

  useEffect(() => {
    setActiveQuizQuestionIdx(0)
    setCheckedQuestions({})
    setFailedQuizImages({})
  }, [currentStage, lessonId])

  useEffect(() => {
    if (currentStage >= 2) {
      void import('./AikiStudioWorkspace')
    }
  }, [currentStage])

  // Stage 4 (Practice) submitted artwork state
  const [submittedArtwork, setSubmittedArtwork] = useState<{
    image: StudioImageItem
    prompt: string
  } | null>(null)

  // Stage 4 (Practice) parts state
  const [activePracticePartIndex, setActivePracticePartIndex] = useState<number>(0)
  const [practicePartsState, setPracticePartsState] = useState<PracticePartState[]>([])

  // Lightbox Modal state
  const [zoomImage, setZoomImage] = useState<{ url: string; title: string } | null>(null)

  useEffect(() => {
    if (!zoomImage) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setZoomImage(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [zoomImage])

  const handleStageSelect = useCallback(
    (index: number) => {
      setCurrentStage(index)
      onStageChange?.(index)
    },
    [onStageChange]
  )

  const advanceToStage = useCallback(
    (nextStage: number) => {
      setCompletedStages((prev) => new Set([...prev, currentStage, nextStage]))
      setCurrentStage(nextStage)
      onStageChange?.(nextStage)
      try {
        playInstantSound('click')
      } catch {
        // ignore audio failure
      }
    },
    [currentStage, onStageChange]
  )

  const handleSeekVideo = useCallback((sec: number) => {
    setVideoSeekSec(sec)
    try {
      playInstantSound('click')
    } catch {
      // ignore
    }
  }, [])

  // Web Speech synthesis for AIKI
  const speakCurrentStage = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const cleaned = normalizeVietnameseSpeech(text)
      if (!cleaned) return
      const utterance = new SpeechSynthesisUtterance(cleaned)
      utterance.lang = 'vi-VN'
      utterance.rate = 0.95
      window.speechSynthesis.speak(utterance)
    } catch {
      // ignore
    }
  }, [])

  const currentStageDef = stages[currentStage] || stages[0]
  const currentStageSpeech = currentStageDef?.speech || 'Cùng AIKI học thật vui nhé!'

  const getStageMascotEmoji = (type?: string, stageNum?: number) => {
    switch (type) {
      case 'GOAL':
        return '🎯'
      case 'CONFIRM':
        return '🧐'
      case 'VIDEO':
        return '🎬'
      case 'QUIZ':
        return '📝'
      case 'PRACTICE':
        return '🎨'
      case 'REWARD':
        return '🏆'
      default:
        switch (stageNum) {
          case 0: return '🎯'
          case 1: return '🧐'
          case 2: return '🎬'
          case 3: return '📝'
          case 4: return '🎨'
          case 5: return '🏆'
          default: return '🐱'
        }
    }
  }

  const getStageInstruction = (stage: number) => {
    return currentStageDef?.instruction || 'Hoàn thành các bước để thu thập đủ 3 sao nhé!'
  }

  // Calculate Quiz Score
  const quizScore = useMemo(() => {
    const questions = journey.stage4_quiz?.questions || []
    let correct = 0
    questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        correct++
      }
    })
    return correct
  }, [journey.stage4_quiz?.questions, quizAnswers])

  const quizStars = useMemo(() => {
    const total = journey.stage4_quiz?.questions?.length || 1
    const ratio = quizScore / total
    if (ratio >= 0.8) return 3
    if (ratio >= 0.5) return 2
    return 1
  }, [quizScore, journey.stage4_quiz?.questions])

  const isReplay = Boolean(isCompleted || (previousStars != null && previousStars > 0))
  const defaultStars = journey.stage6_completion?.rewardBadge?.stars ?? 3

  const earnedStars = useMemo(() => {
    let stars = 0
    if (completedStages.has(0) && completedStages.has(1) && completedStages.has(2)) {
      stars += 1
    }
    const quizTotal = journey.stage4_quiz?.questions?.length || 1
    if (quizScore / quizTotal >= 0.8) {
      stars += 1
    }
    if (submittedArtwork) {
      stars += 1
    }
    if (currentStage === 5 && completedStages.size <= 1 && stars === 0) {
      return defaultStars
    }
    return Math.max(1, stars)
  }, [completedStages, quizScore, journey.stage4_quiz?.questions, submittedArtwork, currentStage, defaultStars])

  const calculatedXp = rewardXpProp ?? journey.stage6_completion?.rewardBadge?.xp ?? calculateStationXp(earnedStars)
  const effectiveStars = isReplay ? 0 : earnedStars
  const effectiveRewardXp = isReplay ? 0 : calculatedXp

  const supplementalStageCard = useMemo<LearnCardDraft | null>(() => {
    const blocks = (journey.stageContentBlocks?.[`stage-${currentStage}`] as StageBlockItem[] | undefined)
      ?.filter((block) => !block.id.startsWith('course-goal-') && !block.id.startsWith('course-confirm-'))
    if (!Array.isArray(blocks) || blocks.length === 0) return null
    return {
      id: `island-stage-${currentStage + 1}`,
      title: stages[currentStage]?.title || `Chặng ${currentStage + 1}`,
      body: '',
      tip: '',
      kind: currentStage === 0 ? 'concept' : 'example',
      layout: 'text',
      visualItems: [],
      contentBlocks: blocks,
      mee: { readText: '', gesture: 'presentation', autoRead: false },
    }
  }, [currentStage, journey.stageContentBlocks, stages])

  // Helper values for the sidebar
  const formulaCards = stages[0]?.config?.formulaCards || []
  const videoChapters = stages[2]?.config?.timestamps || []
  const practiceConfig = stages[4]?.config
  const isCreativeNotebook = practiceConfig?.creativeEngineMode === 'creative-notebook'
  const defaultPracticeParts = practiceConfig?.defaultPracticeParts || []
  const studioConfig = practiceConfig?.studioConfig
  const effectiveNotebookConfig = practiceConfig?.notebookConfig

  const renderSidebarAction = (stageIdx: number) => {
    const stageItem = stages[stageIdx]
    const stageType = stageItem?.type

    switch (stageType) {
      case 'GOAL':
        return (
          <Button
            variant="primary"
            className="w-full py-2.5 px-3 text-xs sm:text-sm font-black rounded-xl shadow-clay border-b-[3px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-1.5 cursor-pointer"
            onClick={() => advanceToStage(stageIdx + 1)}
          >
            <span>👉 Đã hiểu mục tiêu!</span>
            <ArrowRight size={14} />
          </Button>
        )
      case 'CONFIRM':
        return isConfirmCorrect ? (
          <Button
            variant="primary"
            className="w-full py-2.5 px-3 text-xs sm:text-sm font-black rounded-xl shadow-clay border-b-[3px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-1.5 cursor-pointer"
            onClick={() => advanceToStage(stageIdx + 1)}
          >
            <span>🎬 Xem video bài học</span>
            <ArrowRight size={14} />
          </Button>
        ) : (
          <p className="text-xs text-amber-800 font-bold text-center bg-amber-100/70 p-2 rounded-lg border border-amber-200">
            👉 Hãy chọn đáp án đúng ở cột bên trái nhé!
          </p>
        )
      case 'VIDEO':
        return (
          <Button
            variant="primary"
            className="w-full py-2.5 px-3 text-xs sm:text-sm font-black rounded-xl shadow-clay border-b-[3px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-1.5 cursor-pointer"
            onClick={() => advanceToStage(stageIdx + 1)}
          >
            <span>📝 Làm bài test thử tài</span>
            <ArrowRight size={14} />
          </Button>
        )
      case 'QUIZ':
        return quizSubmitted ? (
          <Button
            variant="primary"
            className="w-full py-2.5 px-3 text-xs sm:text-sm font-black rounded-xl shadow-clay border-b-[3px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-1.5 cursor-pointer"
            onClick={() => advanceToStage(stageIdx + 1)}
          >
            <span>🎨 Vào xưởng thực hành</span>
            <ArrowRight size={14} />
          </Button>
        ) : (
          <p className="text-xs text-blue-800 font-bold text-center bg-blue-100/70 p-2 rounded-lg border border-blue-200">
            👉 Trả lời hết câu hỏi rồi bấm Nộp bài nhé!
          </p>
        )
      case 'PRACTICE':
        return (
          <div className="flex flex-col gap-1.5 text-xs text-slate-700 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
            <span className="font-bold text-emerald-800">🎨 Xưởng thực hành đang mở:</span>
            <span>Làm theo 4 bước hướng dẫn và nộp bài để cất vào Balo.</span>
          </div>
        )
      case 'REWARD':
        return (
          <div className="flex flex-col gap-2">
            {stageItem.config?.nextLessonSlug && onNavigateNextLesson ? (
              <Button
                variant="primary"
                className="w-full py-2.5 px-3 text-xs sm:text-sm font-black rounded-xl shadow-clay border-b-[3px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-1.5 cursor-pointer"
                onClick={() => {
                  onFinishLesson?.({
                    stars: effectiveStars,
                    xp: effectiveRewardXp,
                    nextLessonSlug: stageItem.config.nextLessonSlug,
                  })
                  onNavigateNextLesson(stageItem.config.nextLessonSlug!)
                }}
              >
                <span>🚀 Khám phá bài tiếp theo</span>
              </Button>
            ) : null}
            {onBackToMap && (
              <Button
                variant="secondary"
                className="w-full py-2 px-3 text-xs font-bold rounded-xl border border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-1 cursor-pointer"
                onClick={() => {
                  onFinishLesson?.({ stars: effectiveStars, xp: effectiveRewardXp })
                  onBackToMap()
                }}
              >
                <span>🗺️ Về bản đồ đảo</span>
              </Button>
            )}
          </div>
        )
      default:
        return null
    }
  }

  // Lookup Component from Schema Registry
  const StageComp = STAGE_REGISTRY[currentStageDef?.type]

  return (
    <div className="w-full h-full min-h-0 flex-1 flex flex-col gap-2 overflow-hidden">
      {/* ── TOP HEADER: NẤC TIẾN ĐỘ SƯ PHẠM ĐỘNG + NÚT BẢN ĐỒ ── */}
      <header className="shrink-0 flex items-center justify-between gap-2 bg-white/90 backdrop-blur-md px-2.5 sm:px-3 py-0.5 min-h-[36px] sm:min-h-[38px] w-full rounded-2xl border-2 border-brand-100 shadow-sm">
        {/* Trái: Nút Bản đồ + Nấc kẹo dẻo Soft Clay render linh hoạt */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1 overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5">
          {onBackToMap && (
            <button
              type="button"
              onClick={onBackToMap}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 sm:px-2.5 py-1 text-xs font-black text-slate-700 hover:bg-slate-100 shadow-2xs transition-colors cursor-pointer shrink-0"
              title="Quay lại bản đồ"
            >
              <ChevronLeft size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Bản đồ</span>
            </button>
          )}

          <nav
            aria-label="Tiến độ bài học 6 chặng"
            className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5 flex-1 min-w-0"
          >
            {stages.map((stageItem, idx) => {
              const isActive = currentStage === idx
              const isDone = completedStages.has(idx) && currentStage > idx
              const isUnlocked =
                idx <= currentStage ||
                completedStages.has(idx) ||
                completedStages.has(idx - 1)

              return (
                <React.Fragment key={stageItem.id || idx}>
                  {idx > 0 && (
                    <ChevronRight
                      size={12}
                      className="mx-0.5 hidden size-3 shrink-0 text-slate-400 sm:block"
                      aria-hidden="true"
                    />
                  )}
                  <button
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => handleStageSelect(idx)}
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-full p-1 text-[11px] shadow-2xs transition-all duration-200 sm:size-auto sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-xs',
                      !isUnlocked &&
                        'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200',
                      isUnlocked &&
                        isActive &&
                        'cursor-pointer bg-brand-500 text-white font-black shadow-sm border border-brand-600/30 active:translate-y-0.5',
                      isUnlocked &&
                        isDone &&
                        !isActive &&
                        'cursor-pointer bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold hover:bg-emerald-100',
                      isUnlocked &&
                        !isActive &&
                        !isDone &&
                        'cursor-pointer bg-white border border-slate-200 text-slate-700 font-bold hover:border-brand-300 hover:text-brand-600 shadow-2xs hover:bg-slate-50'
                    )}
                    title={`Chặng ${idx + 1}: ${stageItem.title}${!isUnlocked ? ' (Chưa mở)' : ''}`}
                  >
                    {!isUnlocked ? (
                      <Lock size={12} className="shrink-0 text-slate-400" />
                    ) : isDone && !isActive ? (
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    ) : isActive ? (
                      <span className="size-4 rounded-full bg-white/25 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                    ) : (
                      <span className="size-4 rounded-full bg-slate-100 text-slate-600 text-[11px] font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                    )}
                    <span className="hidden sm:inline">{stageItem.title}</span>
                  </button>
                </React.Fragment>
              )
            })}
          </nav>
        </div>

        {/* Phải: Huy hiệu 3 Sao */}
        <div className="sr-only">
          <div data-testid="star-badge-sr">
            <Star className="size-3.5 fill-amber-400 text-amber-500" />
            <span>3 Sao</span>
          </div>
        </div>
      </header>

      {/* ── THÔNG TIN TRẠM BÀI HỌC ── */}
      <div className="shrink-0 flex items-center justify-between gap-2 px-1 sm:px-1.5 py-0.5">
        <div
          data-testid="current-station-badge"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 text-amber-950 border border-amber-300/80 shadow-2xs font-black text-xs sm:text-sm select-none shrink-0"
        >
          <span>{stationInfo.icon}</span>
          <span className="font-bold text-amber-800 hidden md:inline">{stationInfo.islandName}</span>
          <span className="text-amber-400 hidden md:inline">·</span>
          <span>{stationInfo.stationLabel}</span>
        </div>

        <div className="text-[11px] font-bold text-slate-500 hidden sm:flex items-center gap-1.5">
          <span>Đang học:</span>
          <span className="text-brand-600 font-black">
            Chặng {currentStage + 1}/{stages.length} · {currentStageDef?.title}
          </span>
        </div>
      </div>

      {/* ── 2 CỘT TƯƠNG THÍCH HOÀN HẢO ── */}
      <div className="flex flex-col md:flex-row items-stretch gap-4 flex-1 min-h-0 w-full overflow-hidden">
        {/* CỘT TRÁI (MAIN LEARNING CANVAS QUA STAGE_REGISTRY) */}
        <div
          data-testid="main-learning-canvas"
          style={{ WebkitOverflowScrolling: 'touch' }}
          className={cn(
            'flex-1 min-w-0 flex flex-col gap-4 pr-1',
            currentStageDef?.type === 'PRACTICE' ? 'gap-2 pr-0.5 sm:pr-1' : 'md:hidden-scrollbar',
            (isSidebarCollapsed || currentStageDef?.type === 'PRACTICE' || currentStageDef?.type === 'REWARD')
              ? 'w-full'
              : 'w-full md:flex-1'
          )}
        >
          {StageComp && (
            <StageComp
              stage={currentStageDef}
              onContinue={() => advanceToStage(currentStage + 1)}
              onPrevious={() => handleStageSelect(Math.max(0, currentStage - 1))}
              onImageClick={setZoomImage}
              // Confirm stage props
              selectedOption={selectedConfirmOption}
              isCorrect={isConfirmCorrect}
              failedOptionImages={failedOptionImages}
              onSelectOption={(idx: number) => {
                setSelectedConfirmOption(idx)
                const correct = idx === currentStageDef.config.correctIndex
                setIsConfirmCorrect(correct)
              }}
              onOptionImageError={(optKey: string) => {
                setFailedOptionImages((prev) => ({ ...prev, [optKey]: true }))
              }}
              // Video stage props
              videoSeekSec={videoSeekSec}
              onSeekVideo={handleSeekVideo}
              onSpeakCurrentStage={speakCurrentStage}
              // Quiz stage props
              activeQuizQuestionIdx={activeQuizQuestionIdx}
              quizAnswers={quizAnswers}
              checkedQuestions={checkedQuestions}
              quizSubmitted={quizSubmitted}
              quizScore={quizScore}
              quizStars={quizStars}
              failedQuizImages={failedQuizImages}
              onSelectQuizAnswer={(qIdx: number, optIdx: number) => {
                setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
                setCheckedQuestions((prev) => ({ ...prev, [qIdx]: true }))
              }}
              onCheckAnswer={(qIdx: number) => {
                setCheckedQuestions((prev) => ({ ...prev, [qIdx]: true }))
              }}
              onSetActiveQuizQuestion={setActiveQuizQuestionIdx}
              onSubmitQuiz={() => {
                setQuizSubmitted(true)
                const allChecked: Record<number, boolean> = {}
                currentStageDef.config.questions.forEach((_: any, i: number) => {
                  allChecked[i] = true
                })
                setCheckedQuestions(allChecked)
                try {
                  playInstantSound('star')
                } catch {
                  // ignore
                }
              }}
              onQuizImageError={(qIdx: number) => {
                setFailedQuizImages((prev) => ({ ...prev, [qIdx]: true }))
              }}
              // Practice stage props
              lessonId={lessonId}
              lessonTitle={lessonTitle}
              studentStars={studentStars}
              activePracticePartIndex={activePracticePartIndex}
              onPartChange={setActivePracticePartIndex}
              onPracticePartsSync={(parts: any, activeIdx: number) => {
                setPracticePartsState(parts)
                setActivePracticePartIndex(activeIdx)
              }}
              onSubmitWork={({ selectedImage, prompt }: any) => {
                setSubmittedArtwork({ image: selectedImage, prompt })
                advanceToStage(5)
              }}
              onBackToLesson={() => handleStageSelect(3)}
              onReplayVideo={() => handleStageSelect(2)}
              // Reward stage props
              submittedArtwork={submittedArtwork}
              effectiveStars={effectiveStars}
              effectiveRewardXp={effectiveRewardXp}
              onNavigateNextLesson={onNavigateNextLesson}
              onBackToMap={onBackToMap}
              onFinishLesson={onFinishLesson}
            />
          )}

          {supplementalStageCard && (
            <section aria-label="Nội dung bổ sung của chặng" className="animate-fade-up">
              <StudentStageBlocksView
                card={supplementalStageCard}
                stageIndex={currentStage}
                onNextStage={currentStage < stages.length - 1 ? advanceToStage : undefined}
                onZoomImage={(image) => image.url && setZoomImage({ url: image.url, title: image.title })}
              />
            </section>
          )}
        </div>

        {/* CỘT PHẢI: SIDEBAR TƯƠNG TÁC AIKI ĐỒNG HÀNH (300-400px) */}
        {!isSidebarCollapsed && (
          <>
            <div
              data-testid="sidebar-overlay-backdrop"
              className={cn(
                'fixed inset-0 backdrop-blur-2xs z-30 transition-opacity',
                (currentStage === 4 || currentStage === 5)
                  ? 'bg-black/20'
                  : 'bg-black/30 md:hidden'
              )}
              onClick={() => setIsSidebarCollapsed(true)}
            />
            <aside
              data-testid="interactive-sidebar"
              className={cn(
                'shrink-0 flex flex-col bg-white rounded-3xl overflow-hidden',
                // Mobile (< md): Always fixed drawer
                'fixed top-14 right-2 sm:right-4 bottom-2 z-40 w-[min(calc(100vw-1.5rem),380px)] shadow-2xl border-2 border-brand-300',
                // Desktop (>= md):
                (currentStage === 4 || currentStage === 5)
                  ? 'md:fixed md:top-16 md:right-4 md:bottom-4 md:z-40 md:w-[min(calc(100vw-2rem),400px)] md:border-2 md:border-brand-300 md:shadow-2xl'
                  : 'md:static md:w-[300px] lg:w-[360px] xl:w-[400px] md:border-2 md:border-brand-100 md:shadow-clay'
              )}
            >
              {/* Header Sidebar: Chặng X/N + Tên Chặng + Nút Âm Thanh */}
              <div className="p-4 bg-gradient-to-r from-brand-50 to-amber-50 border-b border-brand-100 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-brand-500 text-white text-xs font-black uppercase tracking-wider">
                  Chặng {currentStage + 1}/{stages.length}: {currentStageDef?.title}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => speakCurrentStage(currentStageSpeech)}
                    className="p-1.5 rounded-full bg-white hover:bg-brand-100 text-brand-700 transition shadow-2xs cursor-pointer"
                    title="Nghe lời giảng của AIKI"
                  >
                    <Volume2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSidebarCollapsed(true)}
                    className={cn(
                      'px-2.5 py-0.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-all cursor-pointer ml-1',
                      (currentStage === 4 || currentStage === 5) ? 'inline-flex' : 'inline-flex md:hidden'
                    )}
                    title="Đóng bảng tương tác"
                  >
                    ✕ Đóng
                  </button>
                </div>
              </div>

              {/* Thân Sidebar: Mascot AIKI + Hộp thoại + Thẻ tương tác chặng */}
              <div className="flex-1 overflow-y-auto hidden-scrollbar p-4 flex flex-col gap-4">
                {/* Mascot Mèo AIKI sinh động */}
                <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-b from-amber-50 to-orange-50/40 rounded-2xl border border-amber-200 shadow-2xs">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-amber-300 border-4 border-white shadow-md grid place-items-center text-4xl animate-bounce">
                    {getStageMascotEmoji(currentStageDef?.type, currentStage)}
                  </div>
                  <span className="mt-2 text-xs font-black text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                    {currentStageDef?.mascotRole || 'Bạn Đồng Hành AIKI'}
                  </span>
                </div>

                {/* Lời thoại của AIKI có nút nghe đọc */}
                <div className="bg-amber-50/80 rounded-2xl p-3.5 border border-amber-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-black text-amber-950">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare size={14} className="text-amber-600" />
                      {currentStageDef?.type === 'PRACTICE' ? 'DẶN DÒ CỦA AIKI' : 'LỜI THOẠI CỦA AIKI'}
                    </span>
                    <button
                      type="button"
                      onClick={() => speakCurrentStage(currentStageSpeech)}
                      className="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 size={12} />
                      Nghe lại
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
                    {currentStageSpeech}
                  </p>
                </div>

                {/* Nếu ở Chặng Thực hành: Hiển thị Bốn món đồ, Tiến trình 4 bước & Mẹo vàng AIKI */}
                {currentStageDef?.type === 'PRACTICE' ? (
                  <div className="flex flex-col gap-3">
                    {!isCreativeNotebook && (
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-3xl p-3.5 border-2 border-amber-300 shadow-clay flex flex-col gap-2.5 text-left">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-amber-950">
                            <span className="text-base">🧰</span>
                            <span>Bốn món đồ của các cậu</span>
                          </div>
                          <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                            Chỉ 4 lượt chọn
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-amber-900 font-medium">
                          Bài này có 4 phần. Mỗi phần 2 lượt tạo.
                        </p>

                        <div className="flex flex-col gap-2">
                          {(() => {
                            const partsList =
                              practicePartsState.length > 0
                                ? practicePartsState
                                : defaultPracticeParts.map((def: any, idx: number) => ({
                                    ...def,
                                    images: [],
                                    isDone: false,
                                    isActive: idx === activePracticePartIndex,
                                  }))

                            return partsList.map((part: any, idx: number) => {
                              const isSelected = activePracticePartIndex === idx
                              const imagesCount = part.images?.length || 0
                              const isDone = part.isDone || imagesCount >= 2

                              let statusBadgeText = `PHẦN ${idx + 1} - CHỜ`
                              let statusBadgeClass = 'bg-slate-200 text-slate-700'
                              if (isDone) {
                                statusBadgeText = `PHẦN ${idx + 1} - XONG ✓`
                                statusBadgeClass = 'bg-emerald-500 text-white shadow-2xs'
                              } else if (isSelected) {
                                statusBadgeText = `PHẦN ${idx + 1} - ĐANG LÀM`
                                statusBadgeClass = 'bg-indigo-600 text-white shadow-xs animate-pulse'
                              }

                              let turnText = '(lượt 1, lượt 2)'
                              if (imagesCount >= 2) {
                                turnText = '(✓ lượt 1, ✓ lượt 2)'
                              } else if (imagesCount === 1) {
                                turnText = '(✓ lượt 1, lượt 2)'
                              }

                              const displayName =
                                isDone || isSelected
                                  ? part.title
                                  : `Chưa chọn món đồ / ${part.title}`

                              return (
                                <button
                                  key={part.partNumber}
                                  type="button"
                                  data-testid={`sidebar-practice-part-${part.partNumber}`}
                                  onClick={() => {
                                    setActivePracticePartIndex(idx)
                                    playInstantSound('click')
                                  }}
                                  className={cn(
                                    'w-full p-2.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col gap-1.5 select-none',
                                    isSelected
                                      ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-200 scale-[1.01]'
                                      : isDone
                                      ? 'bg-emerald-50/70 border-emerald-300 hover:bg-emerald-100/70'
                                      : 'bg-white/90 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                                  )}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span
                                      className={cn(
                                        'text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-md uppercase tracking-wider',
                                        statusBadgeClass
                                      )}
                                    >
                                      {statusBadgeText}
                                    </span>
                                    <span className="text-[11px] sm:text-xs font-bold text-slate-500">
                                      {turnText}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {part.iconImage ? (
                                      <img
                                        loading="lazy"
                                        decoding="async"
                                        src={part.iconImage}
                                        alt={part.title}
                                        className="w-8 h-8 rounded-lg object-contain bg-white border border-amber-200 p-0.5 shrink-0 shadow-2xs"
                                      />
                                    ) : (
                                      <span className="text-lg shrink-0">{part.icon}</span>
                                    )}
                                    <span className="text-xs sm:text-sm font-black text-slate-900 truncate">
                                      {displayName}
                                    </span>
                                  </div>
                                </button>
                              )
                            })
                          })()}
                        </div>
                      </div>
                    )}

                    {isCreativeNotebook ? (
                      <div className="bg-amber-50/90 rounded-2xl p-3.5 border border-amber-200 flex flex-col gap-2.5 text-left shadow-2xs">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className="text-xs sm:text-sm font-black uppercase tracking-wide text-amber-950 flex items-center gap-1.5">
                            <span>🎒</span>
                            <span>Sổ Tay Sáng Tạo Ba Lô</span>
                          </span>
                          <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300/80">
                            {effectiveNotebookConfig?.backpackTag || 'Sổ tay Ba Lô'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/95 border border-amber-200/80 shadow-2xs">
                          <div className="text-[10px] font-black uppercase tracking-wide text-amber-800">
                            Tiêu Đề Sổ Tay:
                          </div>
                          <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">
                            {effectiveNotebookConfig?.notebookTitle || 'Sổ Tay Sáng Tạo Ba Lô'}
                          </div>
                        </div>

                        <div className="bg-amber-100/70 rounded-xl p-2.5 border border-amber-200/90 flex flex-col gap-1 text-left">
                          <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                            <span>💡</span>
                            <span>Lời dặn của AIKI:</span>
                          </div>
                          <p className="text-xs text-amber-900 font-bold leading-relaxed">
                            {effectiveNotebookConfig?.akiAdvice ||
                              journey.stage5_practice?.akiMotto ||
                              'Hãy viết bằng chính suy nghĩ của con! Cốt truyện này là của riêng con!'}
                          </p>
                        </div>

                        {effectiveNotebookConfig?.challengeSummary &&
                          effectiveNotebookConfig.challengeSummary.length > 0 && (
                            <div className="flex flex-col gap-1.5 pt-1">
                              <span className="text-[11px] font-black text-amber-900 uppercase tracking-wide">
                                🎯 Mục tiêu thử thách:
                              </span>
                              <div className="flex flex-col gap-1.5">
                                {effectiveNotebookConfig.challengeSummary.map((item: string, idx: number) => (
                                  <div
                                    key={idx}
                                    className="p-2 rounded-xl bg-white/90 border border-amber-200/60 flex items-start gap-2 shadow-2xs text-xs font-bold text-slate-800 leading-snug"
                                  >
                                    <span className="size-4 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <span>{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {effectiveNotebookConfig?.checklist &&
                          effectiveNotebookConfig.checklist.length > 0 && (
                            <div className="flex flex-col gap-1.5 pt-1">
                              <span className="text-[11px] font-black text-amber-900 uppercase tracking-wide">
                                ✓ Tiêu chí hoàn thành:
                              </span>
                              <div className="flex flex-col gap-1">
                                {effectiveNotebookConfig.checklist.map((item: any) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white/70 px-2 py-1 rounded-lg border border-amber-100"
                                  >
                                    <span className="text-emerald-600 font-black text-xs">✓</span>
                                    <span>{item.label}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    ) : (
                      <>
                        {/* Tiến trình 4 bước thực hành của bài học */}
                        <div className="bg-indigo-50/80 rounded-2xl p-3.5 border border-indigo-200 flex flex-col gap-2.5 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-black uppercase tracking-wide text-indigo-950 flex items-center gap-1.5">
                              <span>🎯</span>
                              <span>Tiến Trình 4 Bước Thực Hành</span>
                            </span>
                            <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                              Chuẩn AIKI
                            </span>
                          </div>

                          <div className="flex flex-col gap-2">
                            {[
                              {
                                step: 1,
                                title: 'Bước 1: Thử câu lệnh ban đầu (1-2 từ)',
                                hint: studioConfig?.practiceWorkflow?.steps?.[0]?.quickPrompt
                                  ? `💡 Thử: "${studioConfig.practiceWorkflow.steps[0].quickPrompt}"`
                                  : 'Thử lệnh 1-2 từ',
                              },
                              {
                                step: 2,
                                title: 'Bước 2: Thêm hình dáng & màu sắc',
                                hint: studioConfig?.practiceWorkflow?.steps?.[1]?.quickPrompt
                                  ? `💡 Thêm: "${studioConfig.practiceWorkflow.steps[1].quickPrompt}"`
                                  : 'Thêm dáng & màu',
                              },
                              {
                                step: 3,
                                title: 'Bước 3: Hoàn thiện câu lệnh 5 chi tiết vàng',
                                hint: studioConfig?.practiceWorkflow?.steps?.[2]?.quickPrompt
                                  ? `💡 5 chi tiết: "${studioConfig.practiceWorkflow.steps[2].quickPrompt}"`
                                  : 'Đủ 5 chi tiết vàng',
                              },
                              {
                                step: 4,
                                title: 'Bước 4: Soi kỹ tranh & nộp vào Balo',
                                hint: '🔍 Soi kỹ và cất Balo',
                              },
                            ].map((s) => (
                              <div
                                key={s.step}
                                className="p-2 rounded-xl bg-white/90 border border-indigo-100 flex items-start gap-2 shadow-2xs"
                              >
                                <span className="size-5 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                                  {s.step}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                                    {s.title}
                                  </div>
                                  <div className="text-[11px] sm:text-xs text-indigo-700 font-semibold mt-0.5 truncate">
                                    {s.hint}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Mẹo vàng của AIKI */}
                        <div className="bg-amber-50/90 rounded-2xl p-3.5 border border-amber-200 flex flex-col gap-1.5 text-left">
                          <div className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-1.5">
                            <span>💡</span>
                            <span>MẸO VÀNG CỦA AIKI</span>
                          </div>
                          <p className="text-xs sm:text-sm text-amber-900 font-bold leading-relaxed">
                            {journey.stage5_practice?.akiMotto ||
                              studioConfig?.akiMotto ||
                              'Tả càng rõ, tranh càng đúng ý! Hãy miêu tả đủ chi tiết để AIKI vẽ chuẩn nhé.'}
                          </p>
                        </div>

                        {/* Mật mã đặc điểm vàng */}
                        {studioConfig?.lockedFeatures && studioConfig.lockedFeatures.length > 0 && (
                          <div className="bg-purple-50/80 rounded-2xl p-3 border border-purple-200 flex flex-col gap-1.5 text-left">
                            <div className="text-xs sm:text-sm font-black text-purple-950 flex items-center gap-1.5">
                              <span>🔑</span>
                              <span>Mật mã đặc điểm vàng:</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {studioConfig.lockedFeatures.map((feat: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-xs font-bold text-purple-900 bg-white px-2 py-0.5 rounded-lg border border-purple-200 shadow-2xs"
                                >
                                  ✓ {feat}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Nút xem lại bài giảng */}
                    <Button
                      variant="secondary"
                      className="w-full py-2 px-3 text-xs sm:text-sm font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      onClick={() => handleStageSelect(2)}
                    >
                      <RotateCcw size={13} className="text-slate-500" />
                      <span>↺ Tua lại video</span>
                      <span className="text-[11px] sm:text-xs text-slate-400 font-normal">↺ Xem lại video bài giảng</span>
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* CHẶNG 0: Trợ Lý Đồng Hành Sư Phạm Của AIKI */}
                    {currentStageDef?.type === 'GOAL' && (
                      <div className="flex flex-col gap-3">
                        <div className="bg-gradient-to-b from-amber-50/80 to-yellow-50/60 rounded-2xl p-3.5 border-2 border-amber-200 shadow-2xs flex flex-col gap-2.5 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                              <span>💡</span>
                              <span>Mẹo Vàng Của AIKI</span>
                            </span>
                            <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                              Bí Kíp Vàng
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                            {journey.stage1_goal?.keyPoints?.[2] || 'Tả càng rõ - Vẽ càng đúng! Chỗ nào các cậu bỏ trống, Ây Ai như tớ sẽ tự điền vào đấy nhé!'}
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-col gap-2.5">
                          <p className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700">
                            🎯 Nhiệm vụ chặng này:
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 font-medium">
                            Đọc kỹ mục tiêu và ghi nhớ công thức 4 ô bên cạnh để giải câu đố ở chặng sau nhé!
                          </p>
                          <div className="mt-1">{renderSidebarAction(currentStage)}</div>
                        </div>
                      </div>
                    )}

                    {/* CHẶNG 1: Bảng Gợi Ý Mật Mã (Cheat-sheet) + Cố vấn AIKI */}
                    {currentStageDef?.type === 'CONFIRM' && (
                      <div className="flex flex-col gap-3">
                        <div className="bg-gradient-to-b from-amber-50/80 to-yellow-50/60 rounded-2xl p-3.5 border-2 border-amber-200 shadow-2xs flex flex-col gap-2.5 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                              <span>💡</span>
                              <span>Bảng Gợi Ý Mật Mã</span>
                            </span>
                            <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                              Cheat-sheet
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-amber-900/80 font-medium">
                            Tra cứu nhanh 4 ô chìa khóa nếu bé chưa chắc chắn:
                          </p>

                          <div className="grid grid-cols-2 gap-1.5">
                            {formulaCards.map((card: any) => (
                              <div
                                key={card.id}
                                className="p-1.5 rounded-xl bg-white/90 border border-amber-200 flex items-center gap-1.5 shadow-2xs"
                              >
                                <img
                                  loading="lazy"
                                  decoding="async"
                                  src={card.image}
                                  alt={card.code}
                                  className="w-6 h-6 rounded-md object-contain border border-amber-200/80 p-0.5 shrink-0 bg-white"
                                />
                                <div className="min-w-0">
                                  <span className="text-[11px] sm:text-xs font-black text-slate-800 block truncate">
                                    {card.code}
                                  </span>
                                  <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold block truncate">
                                    {card.sub}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {selectedConfirmOption !== null && (
                          <div
                            className={cn(
                              'rounded-2xl p-3.5 border flex flex-col gap-2 transition-all text-left shadow-2xs',
                              isConfirmCorrect
                                ? 'bg-mint-50/90 border-mint-200 text-mint-950'
                                : 'bg-rose-50/90 border-rose-200 text-rose-950'
                            )}
                          >
                            <div className="flex items-center justify-between text-xs font-black">
                              <span className="flex items-center gap-1.5">
                                <span>{isConfirmCorrect ? '🎉' : '🧐'}</span>
                                <span>
                                  {isConfirmCorrect
                                    ? 'AIKI GIẢI THÍCH CHUẨN XÁC'
                                    : 'AIKI GỢI Ý CHO BÉ'}
                                </span>
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  speakCurrentStage(
                                    isConfirmCorrect
                                      ? journey.stage2_confirmGoal?.explanation || ''
                                      : 'Chưa chuẩn rồi! Bé hãy đọc câu hỏi và liếc sang Bảng Gợi Ý Mật Mã ở trên để chọn lại nhé!'
                                  )
                                }
                                className="text-[11px] font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                              >
                                <Volume2 size={12} />
                                Nghe
                              </button>
                            </div>
                            <p className="text-xs sm:text-sm leading-relaxed font-medium">
                              {isConfirmCorrect
                                ? journey.stage2_confirmGoal?.explanation
                                : 'Chưa chuẩn rồi! Bé hãy đọc câu hỏi và liếc sang Bảng Gợi Ý Mật Mã ở trên để chọn lại nhé!'}
                            </p>
                          </div>
                        )}

                        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-col gap-2.5">
                          <p className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700">
                            🎯 Nhiệm vụ chặng này:
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 font-medium">
                            {getStageInstruction(1)}
                          </p>
                          <div className="mt-1">{renderSidebarAction(currentStage)}</div>
                        </div>
                      </div>
                    )}

                    {/* CHẶNG 2: Danh Sách Mốc Phân Đoạn (Interactive Chapters) + Quy Tắc Cốt Lõi */}
                    {currentStageDef?.type === 'VIDEO' && (
                      <div className="flex flex-col gap-3">
                        <div className="bg-purple-50/70 rounded-2xl p-3.5 border-2 border-purple-200 shadow-2xs flex flex-col gap-2.5 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                              <Video size={14} className="text-purple-600" />
                              <span>Mốc Phân Đoạn Video</span>
                            </span>
                            <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                              {videoChapters.length} Mốc
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-purple-900/80 font-medium">
                            Bấm vào mốc phân đoạn để Video tua ngay đến đoạn đó:
                          </p>

                          <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto hidden-scrollbar pr-0.5">
                            {videoChapters.map((ts: any, idx: number) => {
                              const isSelected = videoSeekSec === ts.startSec
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleSeekVideo(ts.startSec)}
                                  className={cn(
                                    'w-full p-2.5 rounded-xl border flex items-center justify-between gap-2 text-left transition-all cursor-pointer group shadow-2xs hover:shadow-xs',
                                    isSelected
                                      ? 'bg-purple-600 text-white border-purple-700 font-black'
                                      : 'bg-white hover:bg-purple-100/70 border-purple-200/80 text-slate-700'
                                  )}
                                  title={`Tua đến ${Math.floor(ts.startSec / 60)}:${String(ts.startSec % 60).padStart(2, '0')}`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span
                                      className={cn(
                                        'size-5 rounded-md flex items-center justify-center text-[11px] font-black shrink-0',
                                        isSelected ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
                                      )}
                                    >
                                      {idx + 1}
                                    </span>
                                    <span className="text-xs sm:text-sm truncate font-bold">{ts.label}</span>
                                  </div>
                                  <span
                                    className={cn(
                                      'text-xs font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 shadow-2xs',
                                      isSelected ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-700 border border-purple-200'
                                    )}
                                  >
                                    {Math.floor(ts.startSec / 60)}:{String(ts.startSec % 60).padStart(2, '0')}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        <div className="bg-amber-50/80 rounded-2xl p-3.5 border border-amber-200 flex flex-col gap-1.5 text-left shadow-2xs">
                          <div className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-1.5">
                            <span>🔑</span>
                            <span>QUY TẮC CỐT LÕI CỦA VIDEO</span>
                          </div>
                          <p className="text-xs sm:text-sm text-amber-900 font-bold leading-relaxed">
                            Tả càng rõ, tranh càng đúng ý! Nhớ quan sát kỹ cách thầy AIKI ghép các từ khóa thành một câu lệnh hoàn chỉnh nhé.
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-col gap-2.5">
                          <p className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700">
                            🎯 Nhiệm vụ chặng này:
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 font-medium">
                            {getStageInstruction(2)}
                          </p>
                          <div className="mt-1">{renderSidebarAction(currentStage)}</div>
                        </div>
                      </div>
                    )}

                    {/* CHẶNG 3: Bảng Điểm Trực Tiếp + Góc Cố Vấn AIKI */}
                    {currentStageDef?.type === 'QUIZ' && (
                      <div className="flex flex-col gap-3">
                        <div className="bg-blue-50/70 rounded-2xl p-3.5 border-2 border-blue-200 shadow-2xs flex flex-col gap-2.5 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                              <FileQuestion size={14} className="text-blue-600" />
                              <span>Bảng Điểm Trực Tiếp</span>
                            </span>
                            <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                              Đạt {journey.stage4_quiz?.passScore ?? 2} câu để mở Xưởng
                            </span>
                          </div>

                          {quizSubmitted ? (
                            <div className="p-3 rounded-xl bg-white border border-blue-200 flex flex-col items-center gap-2 text-center shadow-2xs">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3].map((s) => (
                                  <Star
                                    key={s}
                                    size={20}
                                    className={cn(
                                      s <= quizStars ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                                    )}
                                  />
                                ))}
                              </div>
                              <div className="text-sm font-black text-blue-950">
                                ✓ Đã đúng {quizScore}/{journey.stage4_quiz?.passScore ?? 2} câu để mở Xưởng!
                              </div>
                              <p className="text-xs sm:text-sm text-slate-600">
                                Tổng điểm: {quizScore}/{journey.stage4_quiz?.questions?.length || 0} câu đúng.
                              </p>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-white border border-blue-100 flex flex-col gap-1.5 shadow-2xs">
                              <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-700">
                                <span>Đã chọn:</span>
                                <span className="text-blue-600 font-black">
                                  {Object.keys(quizAnswers).length}/{journey.stage4_quiz?.questions?.length || 0} câu
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${(Object.keys(quizAnswers).length / (journey.stage4_quiz?.questions?.length || 1)) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-slate-500 text-center font-medium">
                                Cần đạt ít nhất {journey.stage4_quiz?.passScore ?? 2} câu đúng để mở xưởng vẽ!
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="bg-amber-50/80 rounded-2xl p-3.5 border border-amber-200 flex flex-col gap-2 text-left shadow-2xs">
                          <div className="flex items-center justify-between text-xs font-black text-amber-950">
                            <span className="flex items-center gap-1.5">
                              <span>🧐</span>
                              <span>GÓC CỐ VẤN AIKI</span>
                            </span>
                            {quizSubmitted && (
                              <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                                {quizScore >= (journey.stage4_quiz?.passScore ?? 2) ? 'ĐÃ ĐẠT CHUẨN' : 'CẦN ÔN LẠI'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
                            {quizSubmitted
                              ? quizScore >= (journey.stage4_quiz?.passScore ?? 2)
                                ? 'Xuất sắc! Giám khảo AIKI xác nhận bé đã nắm chắc bài học. Cánh cửa Xưởng Sáng Tạo AI đã mở toang chào đón bé!'
                                : 'Chưa đủ điểm mở Xưởng rồi! Bé hãy xem lại video bài giảng và thử sức lại nhé!'
                              : 'Bé hãy đọc kỹ câu hỏi và hình minh họa ở cột bên trái. Hãy tự tin chọn đáp án chuẩn xác nhất!'}
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-col gap-2.5">
                          <p className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700">
                            🎯 Nhiệm vụ chặng này:
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 font-medium">
                            {getStageInstruction(3)}
                          </p>
                          <div className="mt-1">{renderSidebarAction(currentStage)}</div>
                        </div>
                      </div>
                    )}

                    {/* CHẶNG 5: Bảng Tổng Kết Phần Thưởng + Home Mission + Teaser Bài Sau */}
                    {currentStageDef?.type === 'REWARD' && (
                      <div className="flex flex-col gap-3">
                        <div className="bg-gradient-to-b from-amber-50 to-yellow-50/60 rounded-2xl p-3.5 border-2 border-amber-300 shadow-2xs flex flex-col gap-2.5 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                              <Trophy size={14} className="text-amber-600" />
                              <span>Tổng Kết Phần Thưởng</span>
                            </span>
                            <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                              Tốt Nghiệp
                            </span>
                          </div>

                          {isReplay && (
                            <div className="bg-amber-100/80 rounded-xl p-2.5 border border-amber-300 text-xs text-amber-900 font-bold text-center">
                              🎉 Bé đang ôn tập lại trạm học! (Đã nhận thưởng ở lần học trước)
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200 flex items-center gap-2 shadow-2xs">
                              <span className="text-lg">⭐</span>
                              <div>
                                <span className="text-xs sm:text-sm font-black text-amber-900 block">
                                  {isReplay ? '+0 Sao' : `+${earnedStars} Sao`}
                                </span>
                                <span className="text-[11px] text-slate-500 font-semibold">
                                  {isReplay ? 'Đã nhận' : 'Tích lũy'}
                                </span>
                              </div>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200 flex items-center gap-2 shadow-2xs">
                              <span className="text-lg">🪙</span>
                              <div>
                                <span className="text-xs sm:text-sm font-black text-amber-900 block">+5 Xu</span>
                                <span className="text-[11px] text-slate-500 font-semibold">Thần kỳ</span>
                              </div>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200 flex items-center gap-2 shadow-2xs">
                              <span className="text-lg">⚡</span>
                              <div>
                                <span className="text-xs sm:text-sm font-black text-amber-900 block">
                                  {isReplay ? '+0 XP' : `+${calculatedXp} XP`}
                                </span>
                                <span className="text-[11px] text-slate-500 font-semibold">
                                  {isReplay ? 'Đã nhận thưởng' : 'Kinh nghiệm'}
                                </span>
                              </div>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200 flex items-center gap-2 shadow-2xs">
                              <span className="text-lg">🏅</span>
                              <div className="min-w-0">
                                <span className="text-xs sm:text-sm font-black text-amber-900 block truncate">
                                  {journey.stage6_completion?.rewardBadge?.name}
                                </span>
                                <span className="text-[11px] text-slate-500 font-semibold">Huy hiệu vàng</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Việc Ngoài Màn Hình (Home Mission) */}
                        <div className="bg-emerald-50/80 rounded-2xl p-3.5 border-2 border-emerald-200 flex flex-col gap-2 text-left shadow-2xs">
                          <div className="flex items-center justify-between text-xs sm:text-sm font-black text-emerald-950">
                            <span className="flex items-center gap-1.5">
                              <span>🏠</span>
                              <span>Việc Ngoài Màn Hình (Home Mission)</span>
                            </span>
                            <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                              Nhiệm Vụ
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed font-medium">
                            Lời dặn AIKI: &ldquo;Bé hãy đem tranh khoe với bố mẹ ngay bây giờ, đố bố mẹ đoán xem bé đã vẽ gì nhé!&rdquo;
                          </p>
                        </div>

                        {/* Teaser Bài Sau */}
                        {journey.stage6_completion?.nextLessonSlug && (
                          <div className="bg-indigo-50/80 rounded-2xl p-3.5 border border-indigo-200 flex flex-col gap-1.5 text-left shadow-2xs">
                            <div className="text-xs sm:text-sm font-black text-indigo-950 flex items-center gap-1.5">
                              <span>🔮</span>
                              <span>TEASER BÀI HỌC TIẾP THEO</span>
                            </div>
                            <p className="text-xs sm:text-sm text-indigo-900 font-bold leading-relaxed">
                              Chủ đề tiếp theo: {journey.stage6_completion.nextLessonSlug.replace(/[-_]/g, ' ')}
                            </p>
                            <span className="text-xs text-slate-500">
                              Nhiều điều bí ẩn và công thức thần kỳ mới đang chờ đón bé khám phá!
                            </span>
                          </div>
                        )}

                        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-col gap-2.5">
                          <p className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700">
                            🎯 Hành động tiếp theo:
                          </p>
                          <div className="mt-1">{renderSidebarAction(currentStage)}</div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Tiến độ sao & danh hiệu */}
                <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-bold flex items-center gap-1 text-amber-600">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    Tiến độ: {currentStage + 1}/{stages.length} chặng
                  </span>
                  <span className="font-extrabold text-brand-600">
                    ⭐ {studentStars} Sao tích lũy
                  </span>
                </div>
              </div>
            </aside>
          </>
        )}
      </div>

      {/* ── LIGHTBOX MODAL PHÓNG TO ẢNH FULL-SCREEN ── */}
      {zoomImage && (
        <div
          data-testid="lightbox-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setZoomImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90dvh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Đóng"
              onClick={() => setZoomImage(null)}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center text-xl font-bold backdrop-blur-md transition cursor-pointer shadow-lg border border-white/30"
            >
              <X size={24} />
            </button>

            <img
              decoding="async"
              src={zoomImage.url}
              alt={zoomImage.title}
              className="max-w-4xl max-h-[85dvh] w-auto h-auto object-contain rounded-2xl shadow-2xl border border-white/20 bg-black/40"
            />

            {zoomImage.title && (
              <p className="mt-3 text-sm sm:text-base text-white/90 font-medium text-center bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-xs max-w-xl truncate">
                {zoomImage.title}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL TRAO CHỨNG CHỈ HOÀN THÀNH ĐẢO ── */}
      <CourseCertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        courseTitle={lessonTitle}
        islandTitle={stationInfo.islandName}
        stars={effectiveStars}
        xp={effectiveRewardXp}
      />
    </div>
  )
}
