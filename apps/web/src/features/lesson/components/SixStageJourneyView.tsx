import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Target,
  HelpCircle,
  Video,
  FileQuestion,
  Palette,
  Trophy,
  X,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { CourseCertificateModal } from './CourseCertificateModal'
import { FlatClayIcon } from '@/features/asmo/components/AsmoFlatClayIcons'
import { cn } from '@/shared/lib/cn'
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

import { calculateUniversalStars, getStageTypeIndices } from '../lib/universal-stage-engine'
import { StageStepperBar } from './StageStepperBar'

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
  keepalive?: boolean
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
  onVideoCompleted?: () => void
  isSavingProgress?: boolean
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
      `aikids_lesson_stars_${lessonId}`,
      `aikids_confirm_opt_${lessonId}`,
      `aikids_confirm_cor_${lessonId}`,
      `aikids_practice_done_${lessonId}`,
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
  onVideoCompleted: onVideoCompletedProp,
  isSavingProgress = false,
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
  const indices = useMemo(() => getStageTypeIndices(stages), [stages])

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
    const savedRaw = readLessonStorage<number>(`aikids_stage_${lessonId}`, 0)
    const maxLocalStage = Math.max(0, maxIdx - 1)
    const savedStage = Math.min(savedRaw, maxLocalStage)
    const effectiveInitial = initialStageIndex > 0 ? initialStageIndex : savedStage
    return Math.max(0, Math.min(effectiveInitial, maxIdx))
  })

  const [completedStages, setCompletedStages] = useState<Set<number>>(() => {
    const set = new Set<number>()
    const maxIdx = Math.max(0, stages.length - 1)
    if (isCompletedLesson) {
      for (let i = 0; i <= maxIdx; i++) set.add(i)
      return set
    }
    const savedRaw = readLessonStorage<number>(`aikids_stage_${lessonId}`, 0)
    const maxLocalStage = Math.max(0, maxIdx - 1)
    const savedStage = Math.min(savedRaw, maxLocalStage)
    const effectiveInitial = initialStageIndex > 0 ? initialStageIndex : savedStage
    const init = Math.max(0, Math.min(effectiveInitial, maxIdx))
    for (let i = 0; i < init; i++) set.add(i)
    const isSavedDone = readLessonStorage<boolean>(`aikids_video_done_${lessonId}`, false)
    const videoIdx = stages.findIndex((s) => s.type === 'VIDEO')
    const isVideoPassed = videoIdx >= 0 ? (init > videoIdx) : (init > 0)
    if (isSavedDone || isVideoPassed) {
      set.add(0)
    }
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
      const videoIdx = stages.findIndex((s) => s.type === 'VIDEO')
      const isVideoPassed = videoIdx >= 0 ? (resumedStage > videoIdx) : (resumedStage > 0)
      if (isVideoPassed) {
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
    const savedStage = readLessonStorage<number>(`aikids_lesson_stage_${lessonId}`, 0)
      || readLessonStorage<number>(`aikids_stage_${lessonId}`, 0)
    const init = Math.max(initialStageIndex, savedStage)
    const videoIdx = stages.findIndex((s) => s.type === 'VIDEO')
    const isVideoPassed = videoIdx >= 0 ? (init > videoIdx) : (init > 0)
    return isSavedDone || isVideoPassed
  })

  const hasNotifiedVideoDoneRef = useRef(false)
  useEffect(() => {
    if (isVideoCompleted && !hasNotifiedVideoDoneRef.current) {
      hasNotifiedVideoDoneRef.current = true
      onVideoCompletedProp?.()
    }
  }, [isVideoCompleted, onVideoCompletedProp])

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
  const [isPracticeCompleted, setIsPracticeCompleted] = useState<boolean>(() => {
    return readLessonStorage<boolean>(`aikids_practice_done_${lessonId}`, false)
  })
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

  const quizStageDef = stages.find((s) => s.type === 'QUIZ')
  const rewardStageDef = stages.find((s) => s.type === 'REWARD')
  const rewardXp = rewardXpProp || rewardStageDef?.config?.rewardBadge?.xp || journey?.stage6_completion?.rewardBadge?.xp || 50
  const effectiveQuizQuestions = (quizStageDef?.config?.questions as any[]) || journey?.stage4_quiz?.questions || []
  const submittedQuizAnswers = useMemo(
    () => effectiveQuizQuestions.map((question, index) => ({
      questionId: String(question.id || `${lessonId}-check-${index + 1}`),
      optionIndex: typeof quizAnswers[index] === 'number' ? quizAnswers[index] : -1,
    })),
    [effectiveQuizQuestions, lessonId, quizAnswers],
  )

  const advanceToStage = useCallback(
    (nextStage: number) => {
      const videoIdx = stages.findIndex((s) => s.type === 'VIDEO')
      if (stages[currentStage]?.type === 'VIDEO' || (videoIdx >= 0 && currentStage === videoIdx)) {
        setIsVideoCompleted(true)
        writeLessonStorage(`aikids_video_done_${lessonId}`, true)
        writeLessonStorage(`aikids_lesson_stars_${lessonId}`, 1)
        onVideoCompletedProp?.()
      }
      setCompletedStages((prev) => {
        return new Set([...prev, currentStage])
      })
      setCurrentStage(nextStage)
      writeLessonStorage(`aikids_stage_${lessonId}`, String(nextStage))
      writeLessonStorage(`aikids_lesson_stage_${lessonId}`, nextStage)
      onStageChange?.(nextStage)

      if (stages[nextStage]?.type === 'REWARD' || nextStage === stages.length - 1) {
        hasAutoFinishedRef.current = true
        // Tự động lưu hoàn thành bài học ngay khi học sinh chạm tới chặng Thưởng
        const hasPractice = indices.practiceIdx >= 0
        const practiceDone = Boolean(submittedArtwork) || completedStages.has(indices.practiceIdx) || isPracticeCompleted
        const targetStars = (hasPractice && !practiceDone) ? 2 : 3
        const completionSummary: LessonCompletionSummary = {
          stars: targetStars,
          xp: targetStars >= 3 ? (rewardXp || 50) : calculateStationXp(targetStars),
          answers: submittedQuizAnswers,
          nextLessonSlug: (stages[nextStage]?.config as any)?.nextLessonSlug,
        }
        void onFinishLesson?.(completionSummary)
      }

      try {
        playInstantSound('click')
      } catch {
        // ignore audio failure
      }
    },
    [completedStages, currentStage, indices.practiceIdx, isPracticeCompleted, lessonId, onFinishLesson, onStageChange, onVideoCompletedProp, rewardXp, stages, submittedArtwork, submittedQuizAnswers]
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
      const videoIdx = stages.findIndex((s) => s.type === 'VIDEO')
      const isVideoPassed = videoIdx >= 0 ? (resumed > videoIdx) : (resumed > 0)
      setIsVideoCompleted(isSavedDone || isVideoPassed)
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
      setIsPracticeCompleted(readLessonStorage<boolean>(`aikids_practice_done_${lessonId}`, false))
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
    return calculateUniversalStars({
      stages,
      currentStage,
      completedStages,
      isVideoCompleted,
      quizScore,
      effectiveQuizQuestions,
      quizSubmitted,
      submittedArtwork,
      isCompletedLesson,
      previousStars,
      defaultStars,
      isPracticeCompleted,
    })
  }, [
    stages,
    currentStage,
    completedStages,
    isVideoCompleted,
    quizScore,
    effectiveQuizQuestions,
    quizSubmitted,
    submittedArtwork,
    isCompletedLesson,
    previousStars,
    defaultStars,
    isPracticeCompleted,
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
    if ((currentStageDef?.type === 'REWARD' || currentStage === stages.length - 1) && !hasAutoFinishedRef.current) {
      hasAutoFinishedRef.current = true
      // Completion and rewards are persisted only after the owning LMS
      // endpoint verifies the submitted evidence. Browser storage must not
      // mint stars, XP or unlock the next lesson.
      const hasPractice = indices.practiceIdx >= 0
      const practiceDone = Boolean(submittedArtwork) || completedStages.has(indices.practiceIdx) || isPracticeCompleted
      const targetStars = (hasPractice && !practiceDone) ? effectiveStars : 3
      Promise.resolve(
        onFinishLesson?.({
          stars: targetStars,
          xp: targetStars >= 3 ? (effectiveRewardXp || rewardXp || 50) : (effectiveRewardXp || calculateStationXp(targetStars)),
          nextLessonSlug: (currentStageDef?.config as any)?.nextLessonSlug,
          answers: submittedQuizAnswers,
        })
      ).then((res) => {
        if (res !== false && targetStars >= 3) {
          clearLessonStageStorage(lessonId)
        }
      })
    }
  }, [currentStage, currentStageDef, effectiveRewardXp, isRuleLesson, lessonId, lessonTitle, onFinishLesson, rewardXp, stages.length, submittedQuizAnswers, indices.practiceIdx, submittedArtwork, completedStages, isPracticeCompleted, effectiveStars])

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

  // Lookup Component from Schema Registry
  const StageComp = STAGE_REGISTRY[currentStageDef?.type]

  return (
    <div className="mx-auto flex h-full max-h-full min-h-0 w-full max-w-[1024px] min-w-0 flex-1 flex-col gap-2 overflow-y-auto md:overflow-hidden">
      <StageStepperBar
        stages={stages}
        currentStage={currentStage}
        completedStages={completedStages}
        isVideoCompleted={isVideoCompleted}
        quizScore={quizScore}
        isCompletedLesson={isCompletedLesson}
        onSelectStage={handleStageSelect}
        onBackToMap={onBackToMap}
        onFinishLesson={onFinishLesson}
        lessonTitle={lessonTitle}
        effectiveStars={effectiveStars}
        effectiveRewardXp={effectiveRewardXp}
        submittedQuizAnswers={submittedQuizAnswers}
        isSavingProgress={isSavingProgress}
        stationInfo={stationInfo}
        legacyStationAlias={legacyStationAlias}
        isRuleLesson={isRuleLesson}
        quizSubmitted={quizSubmitted}
      />

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
                writeLessonStorage(`aikids_lesson_stars_${lessonId}`, 1)
                onVideoCompletedProp?.()
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

                if (indices.practiceIdx < 0) {
                  // LÀM ĐẾN ĐÂU LƯU ĐẾN ĐẤY: Lưu ngay hoàn thành bài học 3 sao lên server cho bài học không có thực hành
                  hasAutoFinishedRef.current = true
                  const completionSummary: LessonCompletionSummary = {
                    stars: 3,
                    xp: rewardXp || 50,
                    answers: submittedQuizAnswers,
                    nextLessonSlug: (rewardStageDef?.config as any)?.nextLessonSlug,
                  }
                  void onFinishLesson?.(completionSummary)
                } else {
                  // Bài học có chặng thực hành: Hoàn thành Quiz đạt 2 sao
                  writeLessonStorage(`aikids_lesson_stars_${lessonId}`, 2)
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
                setIsPracticeCompleted(true)
                writeLessonStorage(`aikids_practice_done_${lessonId}`, true)
                writeLessonStorage(`aikids_lesson_stars_${lessonId}`, 3)
                setSubmittedArtwork({ image: selectedImage, prompt })
                if (indices.practiceIdx >= 0) {
                  setCompletedStages((prev) => new Set([...prev, indices.practiceIdx]))
                }
                void onFinishLesson?.({
                  stars: 3,
                  xp: effectiveRewardXp || 50,
                  answers: submittedQuizAnswers,
                  keepalive: true,
                })
                advanceToStage(indices.rewardIdx >= 0 ? indices.rewardIdx : stages.length - 1)
              }}
              onBackToLesson={() => handleStageSelect(indices.quizIdx >= 0 ? indices.quizIdx : Math.max(0, currentStage - 1))}
              onReplayVideo={() => handleStageSelect(indices.videoIdx >= 0 ? indices.videoIdx : Math.max(0, currentStage - 2))}
              // Reward stage props
              submittedArtwork={submittedArtwork}
              effectiveStars={effectiveStars}
              effectiveRewardXp={effectiveRewardXp}
              answers={submittedQuizAnswers}
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
