import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Target,
  HelpCircle,
  Video,
  FileQuestion,
  Palette,
  Trophy,
  CheckCircle2,
  Star,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Lock,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
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
import type { LearnCardDraft, StageBlockItem } from '@/features/teacher/lib/authoring'
import { normalizeVietnameseSpeech } from '@/shared/lib/vietnameseSpeech'
import { isValidImageUrl, parseGoalCard, GOAL_CARD_STYLES } from '../lib/stage-view-utils'
import { isAikiRuleJourney, extractRuleNumber } from '../lib/rule-journey-identifiers'
import { STAGE_REGISTRY } from './stages'
import type { JourneyStageDefinition, ParsedGoalCard, RewardStageConfig } from '../types/stage-schema'

const StudentStageBlocksView = React.lazy(() =>
  import('./StudentStageBlocksView').then((module) => ({ default: module.StudentStageBlocksView })),
)

// Re-export helpers for 100% backward compatibility
export { isValidImageUrl, parseGoalCard, GOAL_CARD_STYLES }
export type { ParsedGoalCard }

export type LessonCompletionSummary = {
  stars: number
  xp: number
  nextLessonSlug?: string
  answers?: Array<{ questionId: string; optionIndex: number }>
}

export interface SixStageJourneyViewProps {
  journey?: LessonSixStageJourney
  stages?: JourneyStageDefinition[]
  lessonId: string
  lessonTitle: string
  studentStars?: number
  rewardXp?: number
  isCompleted?: boolean
  previousStars?: number
  onFinishLesson?: (result: LessonCompletionSummary) => boolean | void | Promise<boolean | void>
  onBackToMap?: () => void
  onNavigateNextLesson?: (nextLessonSlug: string) => void
  onOpenCourse?: () => void
  initialStageIndex?: number
  onStageChange?: (stageIndex: number) => void
  initialSidebarCollapsed?: boolean
  isFinalStation?: boolean
  matchedCurriculum?: {
    lessonNumber?: string
    islandNumber: number
    islandName?: string
    title: string
    journey?: Partial<LessonSixStageJourney>
  }
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
  { index: 1, title: 'Xác nhận mục tiêu', icon: HelpCircle, stepNumber: 2 },
  { index: 2, title: 'Video bài giảng', icon: Video, stepNumber: 3 },
  { index: 3, title: 'Bài test', icon: FileQuestion, stepNumber: 4 },
  { index: 4, title: 'Thực hành', icon: Palette, stepNumber: 5 },
  { index: 5, title: 'Hoàn thành', icon: Trophy, stepNumber: 6 },
] as const

export function SixStageJourneyView({
  journey: rawJourney,
  stages: stagesProp,
  lessonId,
  lessonTitle,
  studentStars = 42,
  rewardXp: rewardXpProp,
  isCompleted = false,
  previousStars,
  onFinishLesson,
  onBackToMap,
  onNavigateNextLesson,
  onOpenCourse,
  initialStageIndex = 0,
  onStageChange,
  initialSidebarCollapsed: _initialSidebarCollapsed,
  isFinalStation: isFinalStationProp,
  matchedCurriculum: matchedCurriculumProp,
}: SixStageJourneyViewProps) {
  const journey = rawJourney as LessonSixStageJourney

  const matchedCurriculum = useMemo(() => {
    if (matchedCurriculumProp) return matchedCurriculumProp
    const match = `${lessonId} ${lessonTitle}`.match(/(?:bai[-_]|bài\s+)(\d+)[-_.\s]+(\d+)/i)
    if (!match) return undefined
    return {
      islandNumber: Number(match[1]),
      lessonNumber: `${match[1]}.${match[2]}`,
      title: lessonTitle,
      journey,
    }
  }, [journey, lessonId, lessonTitle, matchedCurriculumProp])

  const isRuleLesson = useMemo(
    () => isAikiRuleJourney(lessonId) || isAikiRuleJourney(lessonTitle) || isAikiRuleJourney(journey),
    [journey, lessonId, lessonTitle],
  )

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

    if (isAikiRuleJourney(lessonId) || isAikiRuleJourney(lessonTitle)) {
      const rNum = extractRuleNumber({ id: lessonId, title: lessonTitle })
      const ruleStageTitle = String(stagesProp?.[0]?.title || '')
      return {
        stationLabel: ruleStageTitle ? `Quy tắc ${rNum}: ${ruleStageTitle}` : lessonTitle || `Quy tắc ${rNum}`,
        icon: '⭐',
        islandName: 'Xưởng Sáng Tạo — 10 Quy Tắc Vàng',
        lessonNumber: String(rNum),
      }
    }

    const safeTitle = cleanCurriculumTitle(lessonTitle || 'Bài học')
    return {
      stationLabel: safeTitle.startsWith('Trạm') ? safeTitle : `Trạm: ${safeTitle}`,
      icon: '🎨',
      islandName: 'Đảo Sáng Tạo',
      lessonNumber: '1',
    }
  }, [matchedCurriculum, lessonId, lessonTitle, stagesProp])

  const stages = useMemo(() => stagesProp || [], [stagesProp])

  const isFinalStation = useMemo(() => {
    if (typeof isFinalStationProp === 'boolean') {
      return isFinalStationProp
    }
    if (isRuleLesson) {
      return extractRuleNumber({ id: lessonId, title: lessonTitle }) === 10
    }
    const rewardStageDef = stages.find((s) => s.type === 'REWARD')
    const rewardConfig = (rewardStageDef?.config as RewardStageConfig | undefined) ?? journey?.stage6_completion
    if (matchedCurriculum) {
      const num = String(matchedCurriculum.lessonNumber || '')
      if (['1.4', '2.4', '3.4', '4.5', '5.5'].includes(num)) return true
      if (!rewardConfig?.nextLessonSlug) return true
      return false
    }
    return !rewardConfig?.nextLessonSlug
  }, [isFinalStationProp, isRuleLesson, lessonId, lessonTitle, matchedCurriculum, stages, journey])

  const [currentStage, setCurrentStage] = useState<number>(() =>
    Math.max(0, Math.min(initialStageIndex, Math.max(0, stages.length - 1))),
  )

  // Stage navigation is view state only. Authoritative completion, stars and XP
  // are committed by the LMS; persisting these indexes in the browser could
  // leak progress across child profiles on a shared parent device.
  const [completedStages, setCompletedStages] = useState<Set<number>>(() => new Set())
  const prevStageRef = useRef(currentStage)
  const prevLessonIdRef = useRef(lessonId)
  const hasAutoFinishedRef = useRef(false)

  useEffect(() => {
    // Remove the former device-wide resume markers. They were not scoped by
    // child profile and could unlock a sibling's stage on shared devices.
    try {
      localStorage.removeItem(`aikids_lesson_stage_${lessonId}`)
      localStorage.removeItem(`aikids_lesson_completed_stages_${lessonId}`)
    } catch {
      // Storage may be unavailable; there is no browser fallback to restore.
    }
  }, [lessonId])

  useEffect(() => {
    if (prevStageRef.current !== currentStage) {
      prevStageRef.current = currentStage
    }
  }, [currentStage])

  // Stage 1 (Confirm goal) state
  const [selectedConfirmOption, setSelectedConfirmOption] = useState<number | null>(null)
  const [isConfirmCorrect, setIsConfirmCorrect] = useState<boolean | null>(null)
  const [failedOptionImages, setFailedOptionImages] = useState<Record<string, boolean>>({})

  // Stage 2 (Video) seek & completion state
  const [videoSeekSec, setVideoSeekSec] = useState<number | null>(null)
  const [isVideoCompleted, setIsVideoCompleted] = useState<boolean>(false)

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

  // Stage 4 (Practice) submitted artwork state
  const [submittedArtwork, setSubmittedArtwork] = useState<{
    image: StudioImageItem
    prompt: string
  } | null>(null)

  // Stage 4 (Practice) parts state
  const [activePracticePartIndex, setActivePracticePartIndex] = useState<number>(0)
  const [practicePartsState, setPracticePartsState] = useState<PracticePartState[]>([])

  // Lightbox Modal state
  const [zoomImage, setZoomImage] = useState<{ url: string; title: string; fallbackUrl?: string } | null>(null)
  const [modalImgSrc, setModalImgSrc] = useState<string>('')
  const [zoomScale, setZoomScale] = useState<number>(1)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (zoomImage) {
      setModalImgSrc(zoomImage.url)
      setZoomScale(1)
    }
  }, [zoomImage])

  useEffect(() => {
    if (!zoomImage) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {})
        }
        setZoomImage(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [zoomImage])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      const el = modalRef.current || document.documentElement
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {})
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      }
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const handleModalImgError = useCallback(() => {
    const fallback = zoomImage?.fallbackUrl || '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2'
    if (modalImgSrc !== fallback) {
      setModalImgSrc(fallback)
    } else if (modalImgSrc !== '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2') {
      setModalImgSrc('/assets/aiki-islands/island1_lesson1_cat.jpg?v=2')
    }
  }, [modalImgSrc, zoomImage])

  const handleCloseModal = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {})
    }
    setZoomImage(null)
  }, [])

  const handleStageSelect = useCallback(
    (index: number) => {
      setCurrentStage(index)
      onStageChange?.(index)
    },
    [onStageChange]
  )

  const advanceToStage = useCallback(
    (nextStage: number) => {
      if (stages[currentStage]?.type === 'VIDEO' || (stages.length === 3 && currentStage === 0) || (stages.length > 3 && currentStage === 2)) {
        setIsVideoCompleted(true)
      }
      setCompletedStages((prev) => {
        return new Set([...prev, currentStage])
      })
      setCurrentStage(nextStage)
      onStageChange?.(nextStage)
      try {
        playInstantSound('click')
      } catch {
        // ignore audio failure
      }
    },
    [currentStage, onStageChange, stages]
  )

  const handleRetryQuestion = useCallback((qIdx: number) => {
    setCheckedQuestions((prev) => {
      const updated = { ...prev }
      delete updated[qIdx]
      return updated
    })
    setQuizAnswers((prev) => {
      const updated = { ...prev }
      delete updated[qIdx]
      return updated
    })
    try {
      playInstantSound('click')
    } catch {
      // ignore
    }
  }, [])

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

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }, [currentStage, lessonId])

  // Reset local journey state if lessonId changes on the same instance
  useEffect(() => {
    if (prevLessonIdRef.current !== lessonId) {
      prevLessonIdRef.current = lessonId
      hasAutoFinishedRef.current = false
      setCurrentStage(Math.max(0, Math.min(initialStageIndex, Math.max(0, stages.length - 1))))
      setCompletedStages(new Set<number>())
      setIsVideoCompleted(false)
      setSelectedConfirmOption(null)
      setIsConfirmCorrect(null)
      setFailedOptionImages({})
      setVideoSeekSec(null)
      setQuizAnswers({})
      setQuizSubmitted(false)
      setActiveQuizQuestionIdx(0)
      setCheckedQuestions({})
      setFailedQuizImages({})
      setIsCertificateModalOpen(false)
      setSubmittedArtwork(null)
      setActivePracticePartIndex(0)
      setPracticePartsState([])
      setZoomImage(null)
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel()
        } catch {
          // ignore
        }
      }
    }
  }, [lessonId])

  const currentStageDef = stages[currentStage] || stages[0]

  const getStageInstruction = (stage: number) => {
    return currentStageDef?.instruction || 'Hoàn thành các bước để thu thập đủ 3 sao nhé!'
  }

  // Calculate Quiz Score
  const quizStageDef = stages.find((s) => s.type === 'QUIZ')
  const rewardStageDef = stages.find((s) => s.type === 'REWARD')
  const effectiveQuizQuestions = (quizStageDef?.config?.questions as any[]) || journey?.stage4_quiz?.questions || []
  const submittedQuizAnswers = useMemo(
    () => effectiveQuizQuestions.map((question, index) => ({
      questionId: String(question.id || `${lessonId}-check-${index + 1}`),
      optionIndex: typeof quizAnswers[index] === 'number' ? quizAnswers[index] : -1,
    })),
    [effectiveQuizQuestions, lessonId, quizAnswers],
  )

  const quizScore = useMemo(() => {
    let correct = 0
    effectiveQuizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        correct++
      }
    })
    return correct
  }, [effectiveQuizQuestions, quizAnswers])

  const quizStars = useMemo(() => {
    const total = effectiveQuizQuestions.length || 1
    const ratio = quizScore / total
    if (ratio >= 0.8) return 3
    if (ratio >= 0.5) return 2
    return 1
  }, [quizScore, effectiveQuizQuestions])

  const isReplay = Boolean(isCompleted || (previousStars != null && previousStars > 0))
  const defaultStars = rewardStageDef?.config?.rewardBadge?.stars ?? journey?.stage6_completion?.rewardBadge?.stars ?? 3

  const earnedStars = useMemo(() => {
    if (stages.length === 3) {
      let stars = 0
      const videoDone = completedStages.has(0) || isVideoCompleted || currentStage > 0
      const quizDone = completedStages.has(1) || quizScore >= 1 || currentStage > 1
      const rewardDone = currentStage === 2 || completedStages.has(2)

      if (videoDone) stars += 1
      if (quizDone) stars += 1
      if (rewardDone) stars += 1
      return Math.min(3, stars)
    }

    // Khóa học chính các Đảo AIKids (6 chặng)
    let stars = 0

    // ⭐ Ngôi sao 1: Khám phá & Nắm vững bài giảng (Chặng 0, 1 & 2 Video)
    const videoPhaseDone =
      (completedStages.has(2) || isVideoCompleted || currentStage > 2) &&
      (completedStages.has(0) || currentStage > 0)

    // ⭐⭐ Ngôi sao 2: Thử tài kiến thức / Phản xạ (Chặng 3 Quiz)
    const quizTotal = effectiveQuizQuestions.length || 1
    const quizPhaseDone =
      completedStages.has(3) ||
      currentStage > 3 ||
      (quizScore / quizTotal >= 0.7) ||
      (quizSubmitted && quizScore >= 1)

    // ⭐⭐⭐ Ngôi sao 3: Thực hành sáng tạo & Vinh danh (Chặng 4 Practice -> Chặng 5 Reward)
    const practiceRewardDone =
      Boolean(submittedArtwork) ||
      currentStage === 5 ||
      completedStages.has(4) ||
      completedStages.has(5)

    if (videoPhaseDone) stars += 1
    if (quizPhaseDone) stars += 1
    if (practiceRewardDone) stars += 1

    if (currentStage === 5 && stars < 3) {
      return defaultStars
    }

    return Math.min(3, stars)
  }, [
    stages.length,
    completedStages,
    isVideoCompleted,
    quizScore,
    effectiveQuizQuestions,
    quizSubmitted,
    submittedArtwork,
    currentStage,
    defaultStars,
  ])

  const calculatedXp = rewardXpProp ?? rewardStageDef?.config?.rewardBadge?.xp ?? journey?.stage6_completion?.rewardBadge?.xp ?? calculateStationXp(earnedStars)
  const effectiveStars = isReplay ? 0 : earnedStars
  const effectiveRewardXp = isReplay ? 0 : calculatedXp

  // Tự động lưu tiến trình và thông báo mở khóa ngay khi tới chặng Vinh danh Hiệp Sĩ (REWARD)
  useEffect(() => {
    if (currentStageDef?.type === 'REWARD' && !hasAutoFinishedRef.current) {
      hasAutoFinishedRef.current = true
      // Completion and rewards are persisted only after the owning LMS
      // endpoint verifies the submitted evidence. Browser storage must not
      // mint stars, XP or unlock the next lesson.
      onFinishLesson?.({
        stars: effectiveStars,
        xp: effectiveRewardXp,
        nextLessonSlug: (currentStageDef?.config as any)?.nextLessonSlug,
        answers: submittedQuizAnswers,
      })
    }
  }, [currentStageDef, effectiveStars, effectiveRewardXp, lessonId, lessonTitle, isRuleLesson, onFinishLesson, submittedQuizAnswers])

  const supplementalStageCard = useMemo<LearnCardDraft | null>(() => {
    const blocks = (journey?.stageContentBlocks?.[`stage-${currentStage}`] as StageBlockItem[] | undefined)
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
  }, [currentStage, journey?.stageContentBlocks, stages])

  // Lookup Component from Schema Registry
  const StageComp = STAGE_REGISTRY[currentStageDef?.type]

  return (
    <div className="w-full max-w-[1024px] min-w-0 max-w-full mx-auto h-auto min-h-full flex-none flex flex-col gap-2 overflow-x-hidden md:h-full md:max-h-full md:min-h-0 md:flex-1 md:overflow-hidden">
      {/* ── HÀNG 1: TOP BAR (BẢN ĐỒ & SAO/XP) ── */}
      <div className="shrink-0 flex items-center justify-between gap-2 w-full px-0.5">
        {onBackToMap ? (
          <button
            type="button"
            onClick={onBackToMap}
            className="min-h-[44px] px-3.5 py-2 rounded-full bg-white/90 hover:bg-white text-zinc-700 text-xs sm:text-sm font-bold shadow-xs border border-slate-200/80 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
            title="Quay lại bản đồ"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            <span>Quay lại Bản đồ</span>
          </button>
        ) : <div />}

        <div
          data-testid="star-badge-header"
          className="px-3 py-1.5 rounded-full bg-amber-100/90 text-amber-900 text-xs font-black shadow-xs flex items-center gap-1.5 shrink-0"
          title={`Bé đã đạt ${earnedStars}/3 Sao trong bài học này`}
        >
          <span>+50 XP</span>
          <span>•</span>
          <span>{earnedStars}/3 Sao</span>
          <div className="sr-only" data-testid="star-badge-sr">
            <span>{earnedStars} Sao</span>
          </div>
        </div>
      </div>

      {/* ── HÀNG 2: CARD THÔNG TIN TRẠM & TIẾN ĐỘ SOFT CLAY ── */}
      <div className="rounded-2xl sm:rounded-3xl bg-white p-2.5 sm:p-3 shadow-xs border border-slate-200/80 space-y-2 w-full min-w-0">
        {/* Dòng tiêu đề */}
        <div className="flex items-center justify-between gap-2">
          <div data-testid="current-station-badge" className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-purple-700 block">
              {stationInfo.islandName || 'Đảo Khám Phá'}
            </span>
            <h1 className="text-sm sm:text-base font-black text-zinc-900 leading-snug flex items-center gap-1.5 truncate">
              <span className="truncate">{stationInfo.stationLabel}</span>
            </h1>
          </div>
          <span className="text-xs font-black text-purple-700 shrink-0">
            Chặng {currentStage + 1}/{stages.length}
          </span>
        </div>

        {/* Thanh tiến độ Soft Clay */}
        <div className="w-full h-2 rounded-full bg-purple-100 overflow-hidden p-0.5 shadow-inner">
          <div
            className="h-full rounded-full bg-purple-600 progress-hatched transition-all duration-300"
            style={{ width: `${((currentStage + 1) / stages.length) * 100}%` }}
          />
        </div>

        {/* Dải Step Pills chặng (Clickable Step Pills) */}
        <nav
          aria-label="Tiến độ bài học 6 chặng"
          className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5 w-full min-w-0"
        >
          {stages.map((stageItem, idx) => {
            const isActive = currentStage === idx
            const isDone = (
              isRuleLesson || stages.length === 3
                ? (idx === 0 && (isVideoCompleted || completedStages.has(0))) ||
                  (idx === 1 && (quizScore >= 1 || completedStages.has(1))) ||
                  (idx === 2 && completedStages.has(2))
                : completedStages.has(idx)
            ) && currentStage > idx
            const isUnlocked =
              idx <= currentStage ||
              completedStages.has(idx) ||
              completedStages.has(idx - 1) ||
              (idx === 1 && !isRuleLesson && stages.length > 3) ||
              (idx === 1 && isVideoCompleted)

            const defaultTitle =
              stages.length === 3
                ? idx === 0
                  ? '1. Tình huống & Bí kíp'
                  : idx === 1
                  ? '2. Câu đố phản xạ'
                  : '3. Thực hành & Cúp'
                : stages.length === 6
                ? idx === 0
                  ? '1. Mục tiêu'
                  : idx === 1
                  ? '2. Xác nhận'
                  : idx === 2
                  ? '3. Video'
                  : idx === 3
                  ? '4. Bài test'
                  : idx === 4
                  ? '5. Thực hành'
                  : '6. Hoàn thành'
                : `${idx + 1}. ${stageItem.title}`

            return (
              <React.Fragment key={stageItem.id || idx}>
                {idx > 0 && (
                  <ChevronRight
                    size={12}
                    className="lucide-chevron-right mx-0.5 size-3 shrink-0 text-slate-400"
                    aria-hidden="true"
                  />
                )}
                <button
                  type="button"
                  disabled={!isUnlocked}
                  onClick={() => handleStageSelect(idx)}
                  className={cn(
                    'flex-1 min-w-0 shrink-0 min-h-[32px] sm:min-h-[34px] py-1 px-1.5 sm:px-2 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer truncate',
                    !isUnlocked && 'bg-zinc-100 text-zinc-400 font-bold opacity-40 cursor-not-allowed',
                    isUnlocked && isDone && !isActive && 'bg-purple-50 text-purple-800 border border-purple-200 font-bold hover:bg-purple-100',
                    isUnlocked && !isActive && !isDone && 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold',
                    isUnlocked && isActive && 'bg-purple-700 text-white font-black shadow-2xs'
                  )}
                  title={`Chặng ${idx + 1}: ${stageItem.title}${!isUnlocked ? ' (Chưa mở)' : ''}`}
                >
                  {isDone && !isActive ? (
                    <CheckCircle2 size={12} className="text-purple-600 shrink-0" />
                  ) : !isUnlocked ? (
                    <Lock size={12} className="text-zinc-400 shrink-0" />
                  ) : null}
                  <span className="truncate">{defaultTitle}</span>
                </button>
              </React.Fragment>
            )
          })}
        </nav>
      </div>

      {/* ── KHÔNG GIAN BÀI HỌC CHÍNH (FULL WIDTH) ── */}
      <div className="flex flex-1 flex-col items-stretch gap-4 min-h-0 w-full max-w-full min-w-0 overflow-x-hidden md:overflow-hidden">
        {/* MAIN LEARNING CANVAS QUA STAGE_REGISTRY */}
        <div
          data-testid="main-learning-canvas"
          style={{ WebkitOverflowScrolling: 'touch' }}
          className={cn(
            'flex-1 min-w-0 w-full max-w-full overflow-x-hidden flex flex-col gap-4 pr-1 md:overflow-y-auto md:overscroll-contain',
            currentStageDef?.type === 'PRACTICE' ? 'gap-2 pr-0.5 sm:pr-1' : 'md:hidden-scrollbar',
            currentStageDef?.type === 'REWARD' ? 'overflow-y-auto pb-28 sm:pb-6' : '',
            currentStageDef?.type === 'VIDEO' ? 'overflow-y-auto overflow-x-hidden overscroll-contain pb-20 md:pb-1' : '',
          )}
        >
          {StageComp && (
            <StageComp
              stage={currentStageDef}
              onContinue={() => advanceToStage(currentStage + 1)}
              continueLabel={isRuleLesson ? 'Vinh danh Hiệp sĩ' : undefined}
              onPrevious={currentStage > 0 ? () => handleStageSelect(currentStage - 1) : undefined}
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
              isVideoCompleted={isVideoCompleted}
              onVideoCompleted={() => setIsVideoCompleted(true)}
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
              onRetryQuestion={handleRetryQuestion}
              onSetActiveQuizQuestion={(action: number | ((prev: number) => number)) => {
                setActiveQuizQuestionIdx(action)
              }}
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
              isFinalStation={isFinalStation}
              onOpenCertificate={isFinalStation ? () => setIsCertificateModalOpen(true) : undefined}
              onOpenCourse={isFinalStation ? onOpenCourse : undefined}
            />
          )}

          {supplementalStageCard && (
            <section aria-label="Nội dung bổ sung của chặng" className="animate-fade-up">
              <React.Suspense fallback={<div className="h-24 animate-pulse rounded-2xl bg-slate-100" />}>
                <StudentStageBlocksView
                  card={supplementalStageCard}
                  stageIndex={currentStage}
                  onNextStage={currentStage < stages.length - 1 ? advanceToStage : undefined}
                  onZoomImage={(image) => image.url && setZoomImage({ url: image.url, title: image.title })}
                />
              </React.Suspense>
            </section>
          )}
        </div>

        </div>

      {/* ── LIGHTBOX MODAL PHÓNG TO ẢNH FULL-SCREEN RESPONSIVE ── */}
      {zoomImage && typeof document !== 'undefined' && createPortal(
        <div
          ref={modalRef}
          data-testid="lightbox-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 animate-fade-in select-none"
          onClick={handleCloseModal}
        >
          {/* Bộ công cụ điều khiển trên PC / Tablet: Fullscreen, Zoom In, Zoom Out, Reset */}
          <div
            className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-1 sm:gap-1.5 bg-black/70 hover:bg-black/85 p-1 sm:p-1.5 rounded-full border border-white/25 backdrop-blur-md shadow-xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút Toàn màn hình (Fullscreen Toggle ⛶) */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/20 active:scale-90 transition cursor-pointer flex items-center justify-center text-white"
              title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình (⛶)'}
              aria-label="Toàn màn hình"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            <div className="h-4 w-[1px] bg-white/30 my-auto" />

            {/* Nút Zoom Out (-) */}
            <button
              type="button"
              disabled={zoomScale <= 1}
              onClick={() => setZoomScale((prev) => Math.max(1, +(prev - 0.25).toFixed(2)))}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-transparent active:scale-90 transition cursor-pointer flex items-center justify-center text-white"
              title="Thu nhỏ (-)"
              aria-label="Thu nhỏ"
            >
              <ZoomOut size={18} />
            </button>

            {/* Nút Reset (↺) */}
            <button
              type="button"
              onClick={() => setZoomScale(1)}
              className="px-2 py-1 rounded-full hover:bg-white/20 active:scale-95 transition cursor-pointer flex items-center gap-1 text-white text-xs font-bold"
              title="Đặt lại kích thước gốc 100% (↺)"
              aria-label="Đặt lại kích thước gốc"
            >
              <span>{Math.round(zoomScale * 100)}%</span>
              {zoomScale > 1 && <RotateCcw size={13} className="text-amber-300" />}
            </button>

            {/* Nút Zoom In (+) */}
            <button
              type="button"
              disabled={zoomScale >= 2.5}
              onClick={() => setZoomScale((prev) => Math.min(2.5, +(prev + 0.25).toFixed(2)))}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-transparent active:scale-90 transition cursor-pointer flex items-center justify-center text-white"
              title="Phóng to (+)"
              aria-label="Phóng to"
            >
              <ZoomIn size={18} />
            </button>
          </div>

          {/* Nút Đóng (X) to rõ góc trên bên phải */}
          <button
            type="button"
            aria-label="Đóng"
            onClick={handleCloseModal}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 w-11 h-11 rounded-full bg-black/80 hover:bg-black text-white border border-white/40 active:scale-95 flex items-center justify-center transition cursor-pointer shadow-2xl backdrop-blur-md"
            title="Đóng xem ảnh (Esc)"
          >
            <X size={24} />
          </button>

          {/* Container ảnh to bản Full-Screen */}
          <div
            className="relative w-full h-full max-w-[96vw] max-h-[92vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-auto p-1 sm:p-2">
              <img
                decoding="async"
                src={modalImgSrc || zoomImage.url}
                alt={zoomImage.title}
                onError={handleModalImgError}
                style={{
                  transform: zoomScale > 1 ? `scale(${zoomScale})` : undefined,
                  transformOrigin: 'center center',
                }}
                className="w-auto h-auto max-w-[95vw] max-h-[82vh] lg:max-h-[84vh] object-contain rounded-2xl sm:rounded-3xl shadow-2xl transition-transform duration-200 select-none border border-white/20 bg-black/40"
              />
            </div>

            {/* Thẻ tiêu đề tranh dưới đáy */}
            {zoomImage.title && (
              <div className="mt-2.5 text-xs sm:text-sm font-bold text-white bg-black/75 px-4 py-1.5 rounded-full backdrop-blur-md max-w-[90vw] sm:max-w-2xl truncate text-center shadow-lg border border-white/10 shrink-0">
                {zoomImage.title}
              </div>
            )}
          </div>
        </div>,
        document.body
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
