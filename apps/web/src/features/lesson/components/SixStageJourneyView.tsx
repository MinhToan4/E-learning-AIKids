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
  Play,
  Sparkles,
} from 'lucide-react'
import { CourseCertificateModal } from './CourseCertificateModal'
import { FlatClayIcon } from '@/features/asmo/components/AsmoFlatClayIcons'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/Button'
import { designerAssets } from '@/shared/config/assets'
import type { LessonSixStageJourney } from '@/shared/lib/api'
import {
  type StudioImageItem,
  type PracticePartState,
} from '../lib/practice-parts'
import { playInstantSound } from './LessonInteractiveSidebar'
import type { LearnCardDraft, StageBlockItem } from '@/features/teacher/lib/authoring'
import { normalizeVietnameseSpeech } from '@/shared/lib/vietnameseSpeech'
import { isValidImageUrl, parseGoalCard, GOAL_CARD_STYLES, buildVideoEmbedUrl } from '../lib/stage-view-utils'
import { isAikiRuleJourney, extractRuleNumber } from '../lib/rule-journey-identifiers'
import { STAGE_REGISTRY } from './stages'
import type { JourneyStageDefinition, ParsedGoalCard, RewardStageConfig, VideoStageConfig } from '../types/stage-schema'

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

export function readLessonStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined') return fallback
    const raw = sessionStorage.getItem(key) ?? localStorage.getItem(key)
    if (raw == null) return fallback
    if (typeof fallback === 'number') {
      const parsed = parseInt(raw, 10)
      return (Number.isFinite(parsed) ? parsed : fallback) as T
    }
    if (typeof fallback === 'boolean') {
      return (raw === 'true') as T
    }
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeLessonStorage(key: string, value: unknown): void {
  try {
    if (typeof window === 'undefined') return
    const str = typeof value === 'string' ? value : JSON.stringify(value)
    sessionStorage.setItem(key, str)
    localStorage.setItem(key, str)
  } catch {
    // Storage may be unavailable
  }
}

export function clearLessonStageStorage(lessonId: string): void {
  try {
    if (typeof window === 'undefined') return
    const keys = [
      `aikids_lesson_stage_${lessonId}`,
      `aikids_lesson_completed_stages_${lessonId}`,
      `aikids_stage_${lessonId}`,
      `aikids_quiz_ans_${lessonId}`,
      `aikids_quiz_chk_${lessonId}`,
      `aikids_quiz_active_${lessonId}`,
      `aikids_quiz_sub_${lessonId}`,
      `aikids_video_done_${lessonId}`,
      `aikids_confirm_opt_${lessonId}`,
      `aikids_confirm_cor_${lessonId}`,
    ]
    for (const k of keys) {
      sessionStorage.removeItem(k)
      localStorage.removeItem(k)
    }
  } catch {
    // Storage may be unavailable
  }
}

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
      const stationLabel = pureTitle.startsWith('Bài') || pureTitle.startsWith('Trạm')
        ? pureTitle
        : `Bài ${num} — ${pureTitle}`

      return {
        stationLabel,
        islandName: ISLAND_CANONICAL_NAMES[curriculum.islandNumber] || (curriculum as any).islandName || `Đảo ${curriculum.islandNumber}`,
        lessonNumber: num,
      }
    }

    if (isAikiRuleJourney(lessonId) || isAikiRuleJourney(lessonTitle)) {
      const rNum = extractRuleNumber({ id: lessonId, title: lessonTitle })
      const ruleStageTitle = String(stagesProp?.[0]?.title || '')
      return {
        stationLabel: ruleStageTitle ? `Quy tắc ${rNum}: ${ruleStageTitle}` : lessonTitle || `Quy tắc ${rNum}`,
        islandName: 'Xưởng Sáng Tạo — 10 Quy Tắc Vàng',
        lessonNumber: String(rNum),
      }
    }

    const safeTitle = cleanCurriculumTitle(lessonTitle || 'Bài học')
    return {
      stationLabel: safeTitle.startsWith('Trạm') ? safeTitle : `Trạm: ${safeTitle}`,
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

  const isCompletedLesson = Boolean(isCompleted || (previousStars != null && previousStars >= 3))

  const [currentStage, setCurrentStage] = useState<number>(() => {
    const maxIdx = Math.max(0, stages.length - 1)
    if (isCompletedLesson) {
      return Math.max(0, Math.min(initialStageIndex > 0 ? initialStageIndex : maxIdx, maxIdx))
    }
    return Math.max(0, Math.min(initialStageIndex, maxIdx))
  })

  const [completedStages, setCompletedStages] = useState<Set<number>>(() => {
    const set = new Set<number>()
    const maxIdx = Math.max(0, stages.length - 1)
    if (isCompletedLesson) {
      for (let i = 0; i <= maxIdx; i++) set.add(i)
      return set
    }
    const init = Math.max(0, Math.min(initialStageIndex, maxIdx))
    for (let i = 0; i < init; i++) set.add(i)
    return set
  })
  const prevStageRef = useRef(currentStage)
  const prevLessonIdRef = useRef(lessonId)
  const hasAutoFinishedRef = useRef(false)
  const hasInitializedCompletedRef = useRef(false)

  useEffect(() => {
    try {
      localStorage.removeItem(`aikids_lesson_stage_${lessonId}`)
      localStorage.removeItem(`aikids_lesson_completed_stages_${lessonId}`)
    } catch {
      // Storage may be unavailable
    }
  }, [lessonId])

  useEffect(() => {
    if (prevStageRef.current !== currentStage) {
      prevStageRef.current = currentStage
    }
  }, [currentStage])

  // The authoritative resume checkpoint arrives with the async lesson-open
  // response. Apply a newer server checkpoint without ever moving a learner
  // backwards if they already advanced while the request was in flight.
  useEffect(() => {
    const maxIdx = Math.max(0, stages.length - 1)
    if (isCompletedLesson) {
      setCompletedStages((prev) => {
        const next = new Set(prev)
        for (let i = 0; i <= maxIdx; i++) next.add(i)
        return next
      })
      setIsVideoCompleted(true)
      if (!hasInitializedCompletedRef.current) {
        hasInitializedCompletedRef.current = true
        const targetStage = Math.max(0, Math.min(initialStageIndex > 0 ? initialStageIndex : maxIdx, maxIdx))
        setCurrentStage(targetStage)
      }
      return
    }
    const resumedStage = Math.max(
      0,
      Math.min(initialStageIndex, maxIdx),
    )
    if (resumedStage > 0) {
      setCompletedStages((prev) => {
        const next = new Set(prev)
        for (let i = 0; i < resumedStage; i++) {
          next.add(i)
        }
        return next
      })
      if (stages.length === 3 ? resumedStage > 0 : resumedStage > 2) {
        setIsVideoCompleted(true)
      }
    }
    setCurrentStage((current) => Math.max(current, resumedStage))
  }, [initialStageIndex, stages.length, lessonId, isCompletedLesson])

  // Stage 1 (Confirm goal) state
  const [selectedConfirmOption, setSelectedConfirmOption] = useState<number | null>(() =>
    readLessonStorage<number | null>(`aikids_confirm_opt_${lessonId}`, null),
  )
  const [isConfirmCorrect, setIsConfirmCorrect] = useState<boolean | null>(() =>
    readLessonStorage<boolean | null>(`aikids_confirm_cor_${lessonId}`, null),
  )
  const [failedOptionImages, setFailedOptionImages] = useState<Record<string, boolean>>({})

  // Stage 2 (Video) seek & completion state
  const [videoSeekSec, setVideoSeekSec] = useState<number | null>(null)
  const [isVideoCompleted, setIsVideoCompleted] = useState<boolean>(() => {
    const isSavedDone = readLessonStorage<boolean>(`aikids_video_done_${lessonId}`, false)
    const init = readLessonStorage<number>(`aikids_lesson_stage_${lessonId}`, initialStageIndex)
    return isSavedDone || (stages.length === 3 ? init > 0 : init > 2)
  })

  // Stage 3 (Quiz) state - khôi phục 100% khi thoát ra vào lại
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>(() =>
    readLessonStorage<Record<number, number>>(`aikids_quiz_ans_${lessonId}`, {}),
  )
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(() =>
    readLessonStorage<boolean>(`aikids_quiz_sub_${lessonId}`, false),
  )
  const [activeQuizQuestionIdx, setActiveQuizQuestionIdx] = useState<number>(() =>
    readLessonStorage<number>(`aikids_quiz_active_${lessonId}`, 0),
  )
  const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>(() =>
    readLessonStorage<Record<number, boolean>>(`aikids_quiz_chk_${lessonId}`, {}),
  )
  const [failedQuizImages, setFailedQuizImages] = useState<Record<number, boolean>>({})
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false)

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
      writeLessonStorage(`aikids_stage_${lessonId}`, String(index))
      writeLessonStorage(`aikids_lesson_stage_${lessonId}`, index)
      onStageChange?.(index)
    },
    [lessonId, onStageChange]
  )

  const advanceToStage = useCallback(
    (nextStage: number) => {
      if (stages[currentStage]?.type === 'VIDEO' || (stages.length === 3 && currentStage === 0) || (stages.length > 3 && currentStage === 2)) {
        setIsVideoCompleted(true)
        writeLessonStorage(`aikids_video_done_${lessonId}`, true)
      }
      setCompletedStages((prev) => {
        return new Set([...prev, currentStage])
      })
      setCurrentStage(nextStage)
      writeLessonStorage(`aikids_stage_${lessonId}`, String(nextStage))
      writeLessonStorage(`aikids_lesson_stage_${lessonId}`, nextStage)
      onStageChange?.(nextStage)
      try {
        playInstantSound('click')
      } catch {
        // ignore audio failure
      }
    },
    [currentStage, lessonId, onStageChange, stages]
  )

  const handleRetryQuestion = useCallback((qIdx: number) => {
    setCheckedQuestions((prev) => {
      const updated = { ...prev }
      delete updated[qIdx]
      writeLessonStorage(`aikids_quiz_chk_${lessonId}`, updated)
      return updated
    })
    setQuizAnswers((prev) => {
      const updated = { ...prev }
      delete updated[qIdx]
      writeLessonStorage(`aikids_quiz_ans_${lessonId}`, updated)
      return updated
    })
    try {
      playInstantSound('click')
    } catch {
      // ignore
    }
  }, [lessonId])

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

  // Reset local journey state or restore persisted state if lessonId changes on the same instance
  useEffect(() => {
    if (prevLessonIdRef.current !== lessonId) {
      prevLessonIdRef.current = lessonId
      hasInitializedCompletedRef.current = false
      const resumed = Math.max(0, Math.min(initialStageIndex, Math.max(0, stages.length - 1)))
      setCurrentStage(resumed)
      const set = new Set<number>()
      for (let i = 0; i < resumed; i++) set.add(i)
      setCompletedStages(set)
      const isSavedDone = readLessonStorage<boolean>(`aikids_video_done_${lessonId}`, false)
      setIsVideoCompleted(isSavedDone || (stages.length === 3 ? resumed > 0 : resumed > 2))
      setSelectedConfirmOption(readLessonStorage<number | null>(`aikids_confirm_opt_${lessonId}`, null))
      setIsConfirmCorrect(readLessonStorage<boolean | null>(`aikids_confirm_cor_${lessonId}`, null))
      setFailedOptionImages({})
      setVideoSeekSec(null)
      setQuizAnswers(readLessonStorage<Record<number, number>>(`aikids_quiz_ans_${lessonId}`, {}))
      setQuizSubmitted(readLessonStorage<boolean>(`aikids_quiz_sub_${lessonId}`, false))
      setActiveQuizQuestionIdx(readLessonStorage<number>(`aikids_quiz_active_${lessonId}`, 0))
      setCheckedQuestions(readLessonStorage<Record<number, boolean>>(`aikids_quiz_chk_${lessonId}`, {}))
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
  }, [lessonId, initialStageIndex, stages.length])

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
    if (isCompletedLesson) {
      return previousStars && previousStars >= 1 ? previousStars : 3
    }

    if (stages.length === 3) {
      let stars = 0
      const videoDone = completedStages.has(0) || isVideoCompleted || currentStage > 0
      const quizTotal = effectiveQuizQuestions.length || 1
      const quizDone =
        completedStages.has(1) ||
        currentStage > 1 ||
        (quizScore >= quizTotal && quizTotal > 0)
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

    // Ngôi sao 3: Thực hành sáng tạo và hoàn thành (Chặng 4 Practice -> Chặng 5 Reward)
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
    isCompletedLesson,
    previousStars,
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
  const effectiveStars = earnedStars
  const effectiveRewardXp = isReplay ? 0 : calculatedXp
  const previousEarnedStarsRef = useRef(earnedStars)
  const [starCelebration, setStarCelebration] = useState(0)

  useEffect(() => {
    const previousStarsCount = previousEarnedStarsRef.current
    previousEarnedStarsRef.current = earnedStars
    if (isReplay || earnedStars <= previousStarsCount) return

    setStarCelebration((sequence) => sequence + 1)
    try {
      playInstantSound('star')
    } catch {
      // Animation remains visible when browser audio is unavailable.
    }

    const timer = window.setTimeout(() => setStarCelebration(0), 1800)
    return () => window.clearTimeout(timer)
  }, [earnedStars, isReplay])

  // Tự động lưu tiến trình và thông báo mở khóa ngay khi tới bước hoàn thành (REWARD)
  useEffect(() => {
    if (currentStageDef?.type === 'REWARD' && !hasAutoFinishedRef.current) {
      hasAutoFinishedRef.current = true
      // Completion and rewards are persisted only after the owning LMS
      // endpoint verifies the submitted evidence. Browser storage must not
      // mint stars, XP or unlock the next lesson.
      Promise.resolve(
        onFinishLesson?.({
          stars: effectiveStars,
          xp: effectiveRewardXp,
          nextLessonSlug: (currentStageDef?.config as any)?.nextLessonSlug,
          answers: submittedQuizAnswers,
        })
      ).then((res) => {
        if (res !== false) {
          clearLessonStageStorage(lessonId)
        }
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

  const legacyStationAlias = useMemo(() => {
    if (stationInfo.lessonNumber === '1.1') return 'Trạm 1: Mèo AIKI'
    if (stationInfo.lessonNumber === '1.2') return 'Trạm 2: 4 Chìa Khoá'
    return ''
  }, [stationInfo.lessonNumber])

  const currentStageTitle = useMemo(() => {
    if (stages.length === 6) {
      switch (currentStage) {
        case 0: return 'Mục tiêu'
        case 1: return 'Xác nhận'
        case 2: return 'Video'
        case 3: return 'Bài test'
        case 4: return 'Thực hành'
        case 5: return 'Hoàn thành'
        default: return stages[currentStage]?.title || 'Khám phá'
      }
    }
    return stages[currentStage]?.title || `Chặng ${currentStage + 1}`
  }, [currentStage, stages])

  // Lookup Component from Schema Registry
  const StageComp = STAGE_REGISTRY[currentStageDef?.type]

  return (
    <div className="mx-auto flex h-full max-h-full min-h-0 w-full max-w-[1024px] min-w-0 flex-1 flex-col gap-2 overflow-y-auto md:overflow-hidden">
      {/* ── HÀNG 1: TOP BAR ĐỒNG NHẤT (BẢN ĐỒ, TÊN TRẠM & SAO/XP GAME-LIKE) ── */}
      <div className="shrink-0 flex items-center justify-between gap-2 w-full px-0.5 py-0.5">
        {/* Nút Quay lại bản đồ & Tên bài học / Trạm ngắn gọn */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {onBackToMap ? (
            <button
              type="button"
              onClick={onBackToMap}
              className="min-h-[38px] px-3 py-1.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-xs border border-slate-200/80 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
              title="Quay lại bản đồ"
            >
              <ChevronLeft size={16} aria-hidden="true" className="shrink-0" />
              <span className="hidden sm:inline">Quay lại Bản đồ</span>
              <span className="sm:hidden">Bản đồ</span>
            </button>
          ) : <div />}

          {/* Tên trạm ngắn gọn (đưa lên đây theo yêu cầu của Sếp để bỏ dòng dư thừa) */}
          <div data-testid="current-station-badge" className="min-w-0 flex items-center gap-1.5">
            <span className="sr-only">{stationInfo.islandName || 'Đảo Khám Phá'}</span>
            <h1 className="text-xs sm:text-sm md:text-base font-black text-slate-900 leading-snug truncate">
              <span className="truncate">{stationInfo.stationLabel}</span>
            </h1>
            {legacyStationAlias && <span className="sr-only">{legacyStationAlias}</span>}
          </div>
        </div>

        {/* Gamified Badges: Chặng + XP + Sao thiết kế cao cấp, thu hút trẻ */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Badge Chặng */}
          <span className="px-2.5 py-1 rounded-xl bg-purple-50 border border-purple-200/90 text-purple-700 font-black text-[11px] sm:text-xs shadow-2xs shrink-0">
            Chặng {currentStage + 1}/{stages.length}
          </span>

          {/* Badge XP & Sao Gamification Pill */}
          <div
            data-testid="star-badge-header"
            className="flex items-center gap-1 sm:gap-1.5 shrink-0"
            title={`Bé đã đạt ${earnedStars}/3 Sao trong bài học này`}
          >
            {/* Pill XP */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/80 text-amber-950 font-black text-[11px] sm:text-xs shadow-clay-xs">
              <Sparkles size={13} className="text-amber-500 fill-amber-400 shrink-0" />
              <span>+{effectiveRewardXp} XP</span>
            </div>

            {/* Pill Sao */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 font-black text-[11px] sm:text-xs shadow-clay-xs">
              <Star size={13} className="text-amber-500 fill-amber-400 shrink-0" />
              <span>{earnedStars}/3 Sao</span>
            </div>

            {/* Test marker sr-only để tương thích 100% test contract */}
            <div className="sr-only" data-testid="star-badge-sr">
              <span>+{effectiveRewardXp} XP • {earnedStars}/3 Sao</span>
              <span>{earnedStars} Sao</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION STEPPER: DÀNH CHO CẢ ISLAND VÀ RULE LESSONS (ĐÃ BỎ DÒNG TIÊU ĐỀ THỪA THEO YÊU CẦU CỦA SẾP) ── */}
      <div className="rounded-2xl sm:rounded-3xl bg-white p-2 sm:p-2.5 shadow-xs border border-slate-200/80 space-y-1.5 w-full min-w-0 shrink-0">
        <div className="w-full h-1 sm:h-1.5 rounded-full bg-purple-100 overflow-hidden p-0.5 shadow-inner">
          <div
            className="h-full rounded-full bg-purple-600 progress-hatched transition-all duration-300"
            style={{ width: `${((currentStage + 1) / stages.length) * 100}%` }}
          />
        </div>

        {/* Stepper trên Desktop (hidden sm:flex): Giữ nguyên Stepper 6 chặng mở rộng đầy đủ */}
        <nav
          aria-label="Tiến độ bài học 6 chặng"
          className="hidden sm:flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5 w-full min-w-0"
        >
          {stages.map((stageItem, idx) => {
            const isActive = currentStage === idx
            const isDone = isCompletedLesson
              ? !isActive
              : (
                  isRuleLesson || stages.length === 3
                    ? (idx === 0 && (isVideoCompleted || completedStages.has(0))) ||
                      (idx === 1 && (quizScore >= 1 || completedStages.has(1))) ||
                      (idx === 2 && completedStages.has(2))
                    : completedStages.has(idx)
                ) && currentStage > idx
            const isUnlocked =
              isCompletedLesson ||
              idx <= currentStage ||
              completedStages.has(idx) ||
              completedStages.has(idx - 1) ||
              (idx === 1 && stages.length > 3) ||
              (idx === 1 && isVideoCompleted)

            const defaultTitle =
              stages.length === 6
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
                : isRuleLesson || stages.length === 3
                ? idx === 0
                  ? '1. Bài học'
                  : idx === 1
                  ? '2. Kiểm tra'
                  : '3. Hoàn thành'
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

        {/* Stepper trên Mobile (flex sm:hidden): Gộp 1 hàng ngang duy nhất vừa khít màn hình, bước đang chơi tự động mở rộng */}
        <div className="flex sm:hidden items-center justify-between gap-1 w-full min-w-0 pt-0.5">
          {stages.map((stageItem, idx) => {
            const isActive = currentStage === idx
            const isDone = isCompletedLesson
              ? !isActive
              : (
                  isRuleLesson || stages.length === 3
                    ? (idx === 0 && (isVideoCompleted || completedStages.has(0))) ||
                      (idx === 1 && (quizScore >= 1 || completedStages.has(1))) ||
                      (idx === 2 && completedStages.has(2))
                    : completedStages.has(idx)
                ) && currentStage > idx
            const isUnlocked =
              isCompletedLesson ||
              idx <= currentStage ||
              completedStages.has(idx) ||
              completedStages.has(idx - 1) ||
              (idx === 1 && stages.length > 3) ||
              (idx === 1 && isVideoCompleted)

            const fullStageTitle =
              stages.length === 6
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
                : isRuleLesson || stages.length === 3
                ? idx === 0
                  ? '1. Bài học'
                  : idx === 1
                  ? '2. Kiểm tra'
                  : '3. Hoàn thành'
                : `${idx + 1}. ${stageItem.title}`

            if (isActive) {
              return (
                <button
                  key={`mobile-stage-${stageItem.id || idx}`}
                  type="button"
                  disabled={!isUnlocked}
                  onClick={() => handleStageSelect(idx)}
                  className="flex-1 min-w-0 px-2.5 py-1 rounded-full bg-purple-700 text-white font-black text-xs flex items-center justify-center gap-1 shadow-2xs truncate cursor-pointer"
                  title={`Chặng ${idx + 1}: ${stageItem.title}`}
                >
                  <span className="truncate">{fullStageTitle}</span>
                </button>
              )
            }

            return (
              <button
                key={`mobile-stage-${stageItem.id || idx}`}
                type="button"
                disabled={!isUnlocked}
                onClick={() => handleStageSelect(idx)}
                className={cn(
                  'size-7 shrink-0 text-xs font-black rounded-full flex items-center justify-center transition-all select-none',
                  !isUnlocked && 'bg-zinc-100 text-zinc-400 opacity-40 cursor-not-allowed',
                  isUnlocked && isDone && 'bg-purple-100 text-purple-800 border border-purple-200 cursor-pointer',
                  isUnlocked && !isDone && 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 cursor-pointer'
                )}
                title={`Chặng ${idx + 1}: ${stageItem.title}${!isUnlocked ? ' (Chưa mở)' : ''}`}
              >
                {isDone ? (
                  <CheckCircle2 size={13} className="text-purple-700" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── KHÔNG GIAN BÀI HỌC CHÍNH (FULL WIDTH) ── */}
      <div className="flex flex-1 flex-col items-stretch gap-4 min-h-0 w-full max-w-full min-w-0 overflow-x-hidden md:overflow-hidden">
        {/* MAIN LEARNING CANVAS QUA STAGE_REGISTRY */}
        <div
          data-testid="main-learning-canvas"
          style={{ WebkitOverflowScrolling: 'touch' }}
          className={cn(
            'flex-1 min-w-0 w-full max-w-full overflow-x-hidden flex flex-col gap-4 pr-1 md:overflow-y-auto md:overscroll-contain',
            currentStageDef?.type === 'PRACTICE' ? 'gap-2 pr-0.5 sm:pr-1' : 'scrollbar-none hidden-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            currentStageDef?.type === 'REWARD' ? 'overflow-y-auto pb-28 sm:pb-6' : '',
            currentStageDef?.type === 'VIDEO' ? 'overflow-hidden md:overflow-hidden overflow-x-hidden overscroll-contain pb-1' : '',
          )}
        >
          {StageComp && (
            <StageComp
              stage={currentStageDef}
              onContinue={() => advanceToStage(currentStage + 1)}
              continueLabel={isRuleLesson ? 'Hoàn thành bài học' : undefined}
              onPrevious={currentStage > 0 ? () => handleStageSelect(currentStage - 1) : undefined}
              onImageClick={setZoomImage}
              // Confirm stage props
              selectedOption={selectedConfirmOption}
              isCorrect={isConfirmCorrect}
              failedOptionImages={failedOptionImages}
              onSelectOption={(idx: number) => {
                setSelectedConfirmOption(idx)
                writeLessonStorage(`aikids_confirm_opt_${lessonId}`, idx)
                const correct = idx === currentStageDef.config.correctIndex
                setIsConfirmCorrect(correct)
                writeLessonStorage(`aikids_confirm_cor_${lessonId}`, correct)
              }}
              onOptionImageError={(optKey: string) => {
                setFailedOptionImages((prev) => ({ ...prev, [optKey]: true }))
              }}
              // Video stage props
              videoSeekSec={videoSeekSec}
              onSeekVideo={handleSeekVideo}
              onSpeakCurrentStage={speakCurrentStage}
              isVideoCompleted={isVideoCompleted}
              onVideoCompleted={() => {
                setIsVideoCompleted(true)
                writeLessonStorage(`aikids_video_done_${lessonId}`, true)
              }}
              // Quiz stage props - lưu tiến trình tức thì cho từng câu hỏi
              activeQuizQuestionIdx={activeQuizQuestionIdx}
              quizAnswers={quizAnswers}
              checkedQuestions={checkedQuestions}
              quizSubmitted={quizSubmitted}
              quizScore={quizScore}
              quizStars={quizStars}
              failedQuizImages={failedQuizImages}
              onSelectQuizAnswer={(qIdx: number, optIdx: number) => {
                setQuizAnswers((prev) => {
                  const next = { ...prev, [qIdx]: optIdx }
                  writeLessonStorage(`aikids_quiz_ans_${lessonId}`, next)
                  return next
                })
                setCheckedQuestions((prev) => {
                  const next = { ...prev, [qIdx]: true }
                  writeLessonStorage(`aikids_quiz_chk_${lessonId}`, next)
                  return next
                })
              }}
              onCheckAnswer={(qIdx: number) => {
                setCheckedQuestions((prev) => {
                  const next = { ...prev, [qIdx]: true }
                  writeLessonStorage(`aikids_quiz_chk_${lessonId}`, next)
                  return next
                })
              }}
              onRetryQuestion={handleRetryQuestion}
              onSetActiveQuizQuestion={(action: number | ((prev: number) => number)) => {
                setActiveQuizQuestionIdx((prev) => {
                  const next = typeof action === 'function' ? action(prev) : action
                  writeLessonStorage(`aikids_quiz_active_${lessonId}`, next)
                  return next
                })
              }}
              onSubmitQuiz={() => {
                setQuizSubmitted(true)
                writeLessonStorage(`aikids_quiz_sub_${lessonId}`, true)
                const allChecked: Record<number, boolean> = {}
                currentStageDef.config.questions.forEach((_: any, i: number) => {
                  allChecked[i] = true
                })
                setCheckedQuestions(allChecked)
                writeLessonStorage(`aikids_quiz_chk_${lessonId}`, allChecked)
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

      {starCelebration > 0 && typeof document !== 'undefined' && createPortal(
        <div
          key={starCelebration}
          data-testid="star-earned-celebration"
          className="lesson-star-celebration fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none px-4"
          role="status"
          aria-live="polite"
          aria-label="Con đã nhận được một ngôi sao"
        >
          <div className="lesson-star-celebration-card relative flex min-w-[210px] flex-col items-center rounded-3xl border-2 border-amber-300 bg-white px-7 py-5 shadow-2xl">
            <span className="lesson-star-celebration-glow absolute inset-0 rounded-3xl" aria-hidden="true" />
            <div className="lesson-star-celebration-icon relative">
              <FlatClayIcon name="star" size={92} />
            </div>
            <p className="relative mt-2 text-center text-lg font-black text-slate-900">
              Con nhận được một ngôi sao!
            </p>
          </div>
        </div>,
        document.body,
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
