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
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
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

export interface SixStageJourneyViewProps {
  journey?: LessonSixStageJourney
  stages?: JourneyStageDefinition[]
  lessonId: string
  lessonTitle: string
  studentStars?: number
  rewardXp?: number
  isCompleted?: boolean
  previousStars?: number
  onFinishLesson?: (result: { stars: number; xp: number; nextLessonSlug?: string }) => void
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
  initialSidebarCollapsed,
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

  const [currentStage, setCurrentStage] = useState<number>(() => {
    if (initialStageIndex > 0) return initialStageIndex
    if (typeof window !== 'undefined' && lessonId) {
      try {
        const saved = localStorage.getItem(`aikids_lesson_stage_${lessonId}`)
        if (saved !== null) {
          const parsed = parseInt(saved, 10)
          const maxAllowedResumeStage = Math.max(0, stages.length - 2)
          if (!isNaN(parsed) && parsed >= 0 && parsed <= maxAllowedResumeStage) {
            return parsed
          } else if (parsed > maxAllowedResumeStage) {
            // Tự động dọn dẹp cache bị kẹt ở chặng cuối
            localStorage.removeItem(`aikids_lesson_stage_${lessonId}`)
            localStorage.removeItem(`aikids_lesson_completed_stages_${lessonId}`)
          }
        }
      } catch {
        // ignore
      }
    }
    return 0
  })

  const [completedStages, setCompletedStages] = useState<Set<number>>(() => {
    const initial = new Set<number>()
    if (typeof window !== 'undefined' && lessonId) {
      try {
        const maxAllowedResumeStage = Math.max(0, stages.length - 2)
        const savedStage = localStorage.getItem(`aikids_lesson_stage_${lessonId}`)
        if (savedStage !== null) {
          const parsedStage = parseInt(savedStage, 10)
          if (!isNaN(parsedStage) && parsedStage > maxAllowedResumeStage) {
            return initial
          }
        }
        const saved = localStorage.getItem(`aikids_lesson_completed_stages_${lessonId}`)
        if (saved) {
          const arr = JSON.parse(saved)
          if (Array.isArray(arr)) {
            arr.forEach((num: number) => {
              if (typeof num === 'number' && num <= maxAllowedResumeStage) {
                initial.add(num)
              }
            })
          }
        }
      } catch {
        // ignore
      }
    }
    return initial
  })
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof initialSidebarCollapsed === 'boolean') {
      return initialSidebarCollapsed
    }
    if (typeof window !== 'undefined') {
      if (isRuleLesson) {
        return window.innerWidth < 1440 || window.innerHeight < 800
      }
      // Khóa học 6 chặng ưu tiên toàn bộ chiều rộng cho nội dung học.
      // AIKI chỉ xuất hiện khi người học chủ động mở từ nút trên thanh trạm.
      return true
    }
    return !isRuleLesson
  })

  // Keep the learning canvas usable when a Rule lesson loses horizontal or
  // vertical room. The compact rail still exposes progress and AIKI actions.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleResize = () => {
      const constrainedRuleViewport = isRuleLesson && (
        window.innerWidth < 1440 || window.innerHeight < 800
      )
      if (window.innerWidth < 1024 || constrainedRuleViewport) {
        setIsSidebarCollapsed(true)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isRuleLesson])

  const prevStageRef = useRef(currentStage)
  const prevLessonIdRef = useRef(lessonId)
  const hasAutoFinishedRef = useRef(false)
  useEffect(() => {
    if (prevStageRef.current !== currentStage) {
      prevStageRef.current = currentStage
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setIsSidebarCollapsed(true)
      }
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

  useEffect(() => {
    if (typeof window === 'undefined' || !lessonId) return
    if (prevLessonIdRef.current !== lessonId) return
    try {
      const maxAllowedResumeStage = Math.max(0, stages.length - 2)
      if (currentStage <= maxAllowedResumeStage) {
        localStorage.setItem(`aikids_lesson_stage_${lessonId}`, String(currentStage))
      } else {
        localStorage.removeItem(`aikids_lesson_stage_${lessonId}`)
      }
    } catch {
      // ignore
    }
  }, [currentStage, lessonId, stages.length])

  useEffect(() => {
    if (typeof window === 'undefined' || !lessonId) return
    if (prevLessonIdRef.current !== lessonId) return
    try {
      localStorage.setItem(
        `aikids_lesson_completed_stages_${lessonId}`,
        JSON.stringify(Array.from(completedStages))
      )
    } catch {
      // ignore
    }
  }, [completedStages, lessonId])

  const handleStageSelect = useCallback(
    (index: number) => {
      setCurrentStage(index)
      if (typeof window !== 'undefined' && lessonId) {
        try {
          localStorage.setItem(`aikids_lesson_stage_${lessonId}`, String(index))
        } catch {
          // ignore
        }
      }
      onStageChange?.(index)
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setIsSidebarCollapsed(true)
      }
    },
    [lessonId, onStageChange]
  )

  const advanceToStage = useCallback(
    (nextStage: number) => {
      if (stages[currentStage]?.type === 'VIDEO' || (stages.length === 3 && currentStage === 0) || (stages.length > 3 && currentStage === 2)) {
        setIsVideoCompleted(true)
      }
      setCompletedStages((prev) => {
        const updated = new Set([...prev, currentStage])
        if (typeof window !== 'undefined' && lessonId) {
          try {
            localStorage.setItem(
              `aikids_lesson_completed_stages_${lessonId}`,
              JSON.stringify(Array.from(updated))
            )
          } catch {
            // ignore
          }
        }
        return updated
      })
      setCurrentStage(nextStage)
      if (typeof window !== 'undefined' && lessonId) {
        try {
          localStorage.setItem(`aikids_lesson_stage_${lessonId}`, String(nextStage))
        } catch {
          // ignore
        }
      }
      onStageChange?.(nextStage)
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setIsSidebarCollapsed(true)
      }
      try {
        playInstantSound('click')
      } catch {
        // ignore audio failure
      }
    },
    [currentStage, lessonId, onStageChange]
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

  const [isSpeakingCurrentStage, setIsSpeakingCurrentStage] = useState<boolean>(false)

  // Web Speech synthesis for AIKI
  const speakCurrentStage = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const cleaned = normalizeVietnameseSpeech(text)
      if (!cleaned) {
        setIsSpeakingCurrentStage(false)
        return
      }
      const utterance = new SpeechSynthesisUtterance(cleaned)
      utterance.lang = 'vi-VN'
      utterance.rate = 0.95
      utterance.onstart = () => setIsSpeakingCurrentStage(true)
      utterance.onend = () => setIsSpeakingCurrentStage(false)
      utterance.onerror = () => setIsSpeakingCurrentStage(false)
      window.speechSynthesis.speak(utterance)
    } catch {
      setIsSpeakingCurrentStage(false)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeakingCurrentStage(false)
  }, [currentStage, lessonId])

  // Reset local journey state if lessonId changes on the same instance
  useEffect(() => {
    if (prevLessonIdRef.current !== lessonId) {
      prevLessonIdRef.current = lessonId
      hasAutoFinishedRef.current = false
      setCurrentStage(0)
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
      setIsSpeakingCurrentStage(false)
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
  const quizStageDef = stages.find((s) => s.type === 'QUIZ')
  const rewardStageDef = stages.find((s) => s.type === 'REWARD')
  const effectiveQuizQuestions = (quizStageDef?.config?.questions as any[]) || journey?.stage4_quiz?.questions || []

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
      try {
        // Lưu tiến trình bài học hoàn thành vào aikids_completed_lessons
        const raw = localStorage.getItem('aikids_completed_lessons')
        const completed = raw ? JSON.parse(raw) : {}
        completed[lessonId] = {
          stars: effectiveStars,
          xp: effectiveRewardXp,
          completedAt: new Date().toISOString(),
        }
        if (isRuleLesson) {
          const rNum = extractRuleNumber({ id: lessonId, title: lessonTitle })
          if (rNum) {
            completed[`rule-${rNum}`] = {
              stars: effectiveStars,
              xp: effectiveRewardXp,
              completedAt: new Date().toISOString(),
            }
          }
        }
        localStorage.setItem('aikids_completed_lessons', JSON.stringify(completed))

        if (isRuleLesson) {
          const rNum = extractRuleNumber({ id: lessonId, title: lessonTitle })
          const rulesRaw = localStorage.getItem('aikids_golden_rules_progress_v1')
          let rulesProg: any = rulesRaw ? JSON.parse(rulesRaw) : null
          if (!rulesProg || !rulesProg.rules || Object.keys(rulesProg.rules).length < 10) {
            const initialRules: Record<number, any> = {}
            for (let i = 1; i <= 10; i++) {
              initialRules[i] = {
                ruleId: i,
                status: i === 1 ? 'available' : 'locked',
                completedQuestions: 0,
                starsEarned: 0,
              }
            }
            rulesProg = {
              rules: { ...initialRules, ...(rulesProg?.rules || {}) },
              totalStars: rulesProg?.totalStars || 0,
              totalXp: rulesProg?.totalXp || 0,
              unlockedPosters: rulesProg?.unlockedPosters || [],
            }
          }
          const currentRule = rulesProg.rules[rNum]
          const wasCompleted = currentRule?.status === 'completed'
          rulesProg.rules[rNum] = {
            ruleId: rNum,
            status: 'completed',
            completedQuestions: 2,
            starsEarned: effectiveStars || 3,
            completedAt: new Date().toISOString(),
          }
          const nextId = rNum + 1
          if (nextId <= 10 && rulesProg.rules[nextId] && rulesProg.rules[nextId].status === 'locked') {
            rulesProg.rules[nextId].status = 'available'
          }
          if (!wasCompleted) {
            rulesProg.totalStars = (rulesProg.totalStars || 0) + (effectiveStars || 3)
            rulesProg.totalXp = (rulesProg.totalXp || 0) + (effectiveRewardXp || 10)
          }
          if (!rulesProg.unlockedPosters?.includes(rNum)) {
            rulesProg.unlockedPosters = [...(rulesProg.unlockedPosters || []), rNum].sort((a: number, b: number) => a - b)
          }
          localStorage.setItem('aikids_golden_rules_progress_v1', JSON.stringify(rulesProg))
        }
      } catch {}

      onFinishLesson?.({
        stars: effectiveStars,
        xp: effectiveRewardXp,
        nextLessonSlug: (currentStageDef?.config as any)?.nextLessonSlug,
      })

      // Thông báo cho toàn bộ ứng dụng và bản đồ cập nhật ngay lập tức
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aikids:lesson-completed', {
          detail: { lessonId, stars: effectiveStars, xp: effectiveRewardXp }
        }))
      }
    }
  }, [currentStageDef, effectiveStars, effectiveRewardXp, lessonId, lessonTitle, isRuleLesson, onFinishLesson])

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

  // Helper values for the sidebar
  const formulaCards = stages[0]?.config?.formulaCards || []
  const videoStageDef = stages.find((s) => s.type === 'VIDEO') || stages[2]
  const rawTimestamps = (videoStageDef?.config as any)?.timestamps
  const videoChapters = useMemo(() => {
    if (rawTimestamps && rawTimestamps.length > 0) {
      return rawTimestamps
    }
    return [
      { label: 'Tình huống mở đầu', startSec: 0, endSec: 30 },
      { label: 'Khám phá bí kíp', startSec: 30, endSec: 75 },
      { label: 'Quy tắc 4 chìa khóa', startSec: 75, endSec: 120 },
      { label: 'Thực hành cùng AIKI', startSec: 120, endSec: 150 },
      { label: 'Mẹo tránh lỗi đoán mò', startSec: 150, endSec: 175 },
      { label: 'Tổng kết bài học', startSec: 175, endSec: 180 },
    ]
  }, [rawTimestamps])
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
            <span>{isRuleLesson ? 'Vinh danh Hiệp sĩ' : 'Vào xưởng thực hành'}</span>
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
                  try {
                    localStorage.removeItem(`aikids_lesson_stage_${stageItem.config.nextLessonSlug}`)
                    localStorage.removeItem(`aikids_lesson_completed_stages_${stageItem.config.nextLessonSlug}`)
                  } catch {}
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
    <div className="w-full h-auto min-h-full flex-none flex flex-col gap-2 overflow-visible md:h-full md:min-h-0 md:flex-1 md:overflow-hidden">
      {/* ── TOP HEADER: NẤC TIẾN ĐỘ SƯ PHẠM ĐỘNG + NÚT BẢN ĐỒ ── */}
      <header className="shrink-0 flex items-center justify-between gap-2 bg-white/90 backdrop-blur-md px-2 sm:px-3 py-1 min-h-12 [@media(max-height:760px)]:min-h-10 [@media(max-height:760px)]:py-0.5 w-full min-w-0 rounded-2xl border-2 border-brand-100 shadow-sm">
        {/* Trái: Nút Bản đồ + Nấc kẹo dẻo Soft Clay render linh hoạt */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1 overflow-x-auto no-scrollbar scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5">
          {onBackToMap && (
            <button
              type="button"
              onClick={onBackToMap}
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 text-xs font-black text-slate-700 hover:bg-slate-100 shadow-2xs transition-colors cursor-pointer shrink-0"
              title="Quay lại bản đồ"
            >
              <ChevronLeft size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Bản đồ</span>
            </button>
          )}

          <nav
            aria-label="Tiến độ bài học 6 chặng"
            className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5 flex-1 min-w-0"
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
                      'flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full px-2 text-[11px] shadow-2xs transition-all duration-200 sm:gap-1.5 sm:px-3 sm:text-xs',
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

        {/* Phải: Live Star Pill */}
        <div
          data-testid="star-badge-header"
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 shadow-2xs text-amber-900 text-xs font-black shrink-0"
          title={`Bé đã đạt ${earnedStars}/3 Sao trong bài học này`}
        >
          <div className="flex items-center gap-0.5">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                size={14}
                className={cn(
                  s <= earnedStars
                    ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                    : 'text-slate-300 fill-slate-100'
                )}
              />
            ))}
          </div>
          <span className="text-[11px] sm:text-xs font-black ml-0.5">
            {earnedStars}/3
          </span>
          <div className="sr-only" data-testid="star-badge-sr">
            <span>{earnedStars} Sao</span>
          </div>
        </div>
      </header>

      {/* ── THÔNG TIN TRẠM BÀI HỌC ── */}
      <div className="shrink-0 flex min-w-0 flex-wrap items-center justify-between gap-2 px-1 sm:px-1.5 py-0.5">
        <div className="flex min-w-0 flex-1 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <div
            data-testid="current-station-badge"
            className="flex min-h-11 [@media(max-height:760px)]:min-h-9 min-w-0 flex-1 items-center gap-1.5 rounded-2xl border border-amber-300/80 bg-amber-100/90 px-3 py-1.5 [@media(max-height:760px)]:py-0.5 text-xs font-black text-amber-950 shadow-2xs select-none sm:rounded-full sm:text-sm"
          >
            <span className="shrink-0">{stationInfo.icon}</span>
            <span className="hidden shrink-0 font-bold text-amber-800 xl:inline">{stationInfo.islandName}</span>
            <span className="hidden shrink-0 text-amber-400 xl:inline">·</span>
            <span className="min-w-0 break-words leading-snug sm:line-clamp-2">{stationInfo.stationLabel}</span>
          </div>

          {/* Nút Toggle Trợ lý AIKI */}
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={cn(
              'inline-flex min-h-11 items-center justify-center gap-1 px-3 rounded-full text-xs font-black shadow-xs bg-white text-brand-700 border border-brand-200 hover:bg-brand-50 cursor-pointer transition-all active:scale-95 shrink-0',
              isRuleLesson && isSidebarCollapsed && 'md:hidden',
            )}
            title={isSidebarCollapsed ? 'Mở trợ lý AIKI' : 'Thu gọn trợ lý AIKI'}
          >
            <span>🐱</span>
            <span>{isRuleLesson && isSidebarCollapsed ? `AIKI · ${currentStage + 1}/${stages.length}` : 'Trợ lý AIKI'}</span>
            <span className="text-[10px]">{isSidebarCollapsed ? '▼' : '▲'}</span>
          </button>

          {/* Chỉ báo chặng ẩn cho a11y, loại bỏ hiển thị trực quan để tối ưu diện tích banner */}
          <span className="sr-only">Chặng {currentStage + 1}/{stages.length}</span>
        </div>
      </div>

      {/* ── 2 CỘT TƯƠNG THÍCH HOÀN HẢO ── */}
      <div className="flex flex-none flex-col items-stretch gap-4 min-h-0 w-full overflow-visible md:flex-1 md:flex-row md:overflow-hidden">
        {/* CỘT TRÁI (MAIN LEARNING CANVAS QUA STAGE_REGISTRY) */}
        <div
          data-testid="main-learning-canvas"
          style={{ WebkitOverflowScrolling: 'touch' }}
          className={cn(
            'flex-1 min-w-0 flex flex-col gap-4 pr-1 md:overflow-y-auto md:overflow-x-hidden md:overscroll-contain',
            currentStageDef?.type === 'PRACTICE' ? 'gap-2 pr-0.5 sm:pr-1' : 'md:hidden-scrollbar',
            currentStageDef?.type === 'REWARD' ? 'overflow-y-auto pb-28 sm:pb-6' : '',
            currentStageDef?.type === 'VIDEO' ? 'overflow-y-auto overflow-x-hidden overscroll-contain pb-20 md:pb-1' : '',
            (isSidebarCollapsed || currentStageDef?.type === 'PRACTICE' || currentStageDef?.type === 'REWARD')
              ? 'w-full'
              : 'w-full md:flex-1'
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
                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                  setIsSidebarCollapsed(true)
                }
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
                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                  setIsSidebarCollapsed(true)
                }
              }}
              onCheckAnswer={(qIdx: number) => {
                setCheckedQuestions((prev) => ({ ...prev, [qIdx]: true }))
                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                  setIsSidebarCollapsed(true)
                }
              }}
              onRetryQuestion={handleRetryQuestion}
              onSetActiveQuizQuestion={(action: number | ((prev: number) => number)) => {
                setActiveQuizQuestionIdx(action)
                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                  setIsSidebarCollapsed(true)
                }
              }}
              onSubmitQuiz={() => {
                setQuizSubmitted(true)
                const allChecked: Record<number, boolean> = {}
                currentStageDef.config.questions.forEach((_: any, i: number) => {
                  allChecked[i] = true
                })
                setCheckedQuestions(allChecked)
                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                  setIsSidebarCollapsed(true)
                }
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

        {/* Rule lessons keep a compact AIKI learning rail when the full tutor
            would take too much room. Essential progress never disappears. */}
        {isRuleLesson && isSidebarCollapsed && (
          <aside
            data-testid="aiki-compact-rail"
            aria-label={`Trợ lý AIKI, chặng ${currentStage + 1} trên ${stages.length}`}
            className="hidden md:flex w-20 shrink-0 self-start flex-col items-center gap-2.5 rounded-[28px] border-2 border-brand-100 bg-gradient-to-b from-white via-brand-50/70 to-amber-50 px-2.5 py-3 shadow-clay"
          >
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(false)}
              className="flex size-14 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-amber-100 shadow-md ring-2 ring-amber-200 transition hover:-translate-y-0.5"
              title="Mở trợ lý AIKI"
              aria-label="Mở trợ lý AIKI"
            >
              <AikidCatCharacter
                pose={currentStageDef?.type === 'QUIZ' ? 'thinking' : 'welcome'}
                isSpeaking={isSpeakingCurrentStage}
                size="sm"
              />
            </button>

            <div className="text-center leading-tight">
              <strong className="block text-[10px] font-black uppercase tracking-wide text-amber-800">AIKI</strong>
              <span className="mt-1 inline-flex rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-black text-white shadow-2xs">
                {currentStage + 1}/{stages.length}
              </span>
            </div>

            <div className="flex items-center justify-center gap-1.5 py-0.5" aria-hidden="true">
              {stages.map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    'size-2 rounded-full border transition-colors',
                    index < currentStage
                      ? 'border-mint-500 bg-mint-400'
                      : index === currentStage
                        ? 'size-3 border-brand-300 bg-brand-500 ring-2 ring-brand-100'
                        : 'border-slate-200 bg-slate-100',
                  )}
                />
              ))}
            </div>

            <div className="h-px w-10 bg-brand-100" />

            <button
              type="button"
              onClick={() => speakCurrentStage(currentStageSpeech)}
              className="flex size-9 items-center justify-center rounded-xl border border-brand-100 bg-white text-brand-700 shadow-2xs transition hover:bg-brand-100"
              title="Nghe AIKI hướng dẫn"
              aria-label="Nghe AIKI hướng dẫn"
            >
              <Volume2 size={17} />
            </button>

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(false)}
              className="inline-flex items-center gap-0.5 rounded-xl bg-brand-500 px-2 py-1.5 text-[10px] font-black text-white shadow-2xs transition hover:bg-brand-600"
            >
              <ChevronLeft size={12} />
              Mở
            </button>
          </aside>
        )}

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
                  ? 'md:fixed md:top-16 md:right-4 md:bottom-4 md:z-40 md:w-[min(calc(100vw-2rem),360px)] md:border-2 md:border-brand-300 md:shadow-2xl'
                  : 'md:static md:w-[320px] lg:w-[340px] md:border-2 md:border-brand-100 md:shadow-clay',
                isRuleLesson && (currentStageDef?.type === 'VIDEO' || currentStageDef?.type === 'QUIZ') && 'md:self-start'
              )}
            >
              {/* Header Sidebar: bài Quy tắc dùng nhãn AIKI gọn, tránh lặp tên chặng */}
              <div className="p-4 bg-gradient-to-r from-brand-50 to-amber-50 border-b border-brand-100 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-brand-500 text-white text-xs font-black uppercase tracking-wider">
                  {isRuleLesson ? 'AIKI hỗ trợ' : `Chặng ${currentStage + 1}/${stages.length}: ${currentStageDef?.title}`}
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
                    className="inline-flex px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-all cursor-pointer ml-1"
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
                  <div className="w-20 h-20 sm:w-24 sm:h-24 [@media(max-height:760px)]:w-14 [@media(max-height:760px)]:h-14 rounded-full bg-amber-200/60 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                    <AikidCatCharacter
                      pose={currentStageDef?.type === 'QUIZ' ? 'thinking' : currentStageDef?.type === 'REWARD' ? 'celebrate' : 'welcome'}
                      isSpeaking={isSpeakingCurrentStage}
                      size="md"
                    />
                  </div>
                  <span className="mt-2 text-xs font-black text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                    {currentStageDef?.mascotRole || 'Bạn Đồng Hành AIKI'}
                  </span>
                </div>

                {/* Bài Quy tắc đã có lời giảng ngay dưới video, không lặp lại trong sidebar. */}
                {!isRuleLesson && <div className="bg-amber-50/80 rounded-2xl p-3.5 border border-amber-200 flex flex-col gap-2">
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
                </div>}

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
                              journey?.stage5_practice?.akiMotto ||
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
                            {journey?.stage5_practice?.akiMotto ||
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
                            {journey?.stage1_goal?.keyPoints?.[2] || 'Tả càng rõ - Vẽ càng đúng! Chỗ nào các cậu bỏ trống, Ây Ai như tớ sẽ tự điền vào đấy nhé!'}
                          </p>
                        </div>

                        {!isRuleLesson && <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-col gap-2.5">
                          <p className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700">
                            🎯 Nhiệm vụ chặng này:
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 font-medium">
                            Đọc kỹ mục tiêu và ghi nhớ công thức 4 ô bên cạnh để giải câu đố ở chặng sau nhé!
                          </p>
                          <div className="mt-1">{renderSidebarAction(currentStage)}</div>
                        </div>}
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
                                      ? journey?.stage2_confirmGoal?.explanation || ''
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
                                ? journey?.stage2_confirmGoal?.explanation
                                : 'Chưa chuẩn rồi! Bé hãy đọc câu hỏi và liếc sang Bảng Gợi Ý Mật Mã ở trên để chọn lại nhé!'}
                            </p>
                          </div>
                        )}

                        {!isRuleLesson && <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-col gap-2.5">
                          <p className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700">
                            🎯 Nhiệm vụ chặng này:
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 font-medium">
                            {getStageInstruction(1)}
                          </p>
                          <div className="mt-1">{renderSidebarAction(currentStage)}</div>
                        </div>}
                      </div>
                    )}

                    {/* CHẶNG VIDEO: bài Quy tắc chỉ giữ hành động tiếp theo; timeline nằm cạnh video. */}
                    {currentStageDef?.type === 'VIDEO' && (
                      <div className="flex flex-col gap-3">
                        {!isRuleLesson && <div className="bg-purple-50/70 rounded-2xl p-3.5 border-2 border-purple-200 shadow-2xs flex flex-col gap-2.5 text-left lg:hidden">
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
                        </div>}

                        {!isRuleLesson && <div className="bg-amber-50/80 rounded-2xl p-3.5 border border-amber-200 flex flex-col gap-1.5 text-left shadow-2xs">
                          <div className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-1.5">
                            <span>🔑</span>
                            <span>QUY TẮC CỐT LÕI CỦA VIDEO</span>
                          </div>
                          <p className="text-xs sm:text-sm text-amber-900 font-bold leading-relaxed">
                            Tả càng rõ, tranh càng đúng ý! Nhớ quan sát kỹ cách thầy AIKI ghép các từ khóa thành một câu lệnh hoàn chỉnh nhé.
                          </p>
                        </div>}

                        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-col gap-2.5">
                          <p className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700">
                            {isRuleLesson ? 'Sẵn sàng thử tài?' : '🎯 Nhiệm vụ chặng này:'}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 font-medium">
                            {isRuleLesson ? 'Xem xong video, con chuyển sang Thử tài phản xạ nhé.' : getStageInstruction(2)}
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
                              {isRuleLesson ? 'Đạt chuẩn để được vinh danh' : `Đạt ${currentStageDef.config.passScore ?? 2} câu để mở Xưởng`}
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
                                {isRuleLesson
                                  ? `✓ Đã đúng ${quizScore}/${currentStageDef.config.questions?.length ?? 0} câu · Sẵn sàng vinh danh!`
                                  : `✓ Đã đúng ${quizScore}/${currentStageDef.config.questions?.length ?? 0} câu để mở Xưởng!`}
                              </div>
                              <p className="text-xs sm:text-sm text-slate-600">
                                Tổng điểm: {quizScore}/{currentStageDef.config.questions?.length || 0} câu đúng.
                              </p>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-white border border-blue-100 flex flex-col gap-1.5 shadow-2xs">
                              <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-700">
                                <span>Đã chọn:</span>
                                <span className="text-blue-600 font-black">
                                  {Object.keys(quizAnswers).length}/{currentStageDef.config.questions?.length || 0} câu
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${(Object.keys(quizAnswers).length / (currentStageDef.config.questions?.length || 1)) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-slate-500 text-center font-medium">
                                {isRuleLesson
                                  ? `Cần đạt ít nhất ${currentStageDef.config.passScore ?? 2} câu đúng để được vinh danh!`
                                  : `Cần đạt ít nhất ${currentStageDef.config.passScore ?? 2} câu đúng để mở xưởng vẽ!`}
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
                                {quizScore >= (currentStageDef.config.passScore ?? 2) ? 'ĐÃ ĐẠT CHUẨN' : 'CẦN ÔN LẠI'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
                            {quizSubmitted
                              ? quizScore >= (currentStageDef.config.passScore ?? 2)
                                ? isRuleLesson
                                  ? 'Xuất sắc! Giám khảo AIKI xác nhận bé đã nắm chắc quy tắc. Bé đã sẵn sàng bước vào lễ vinh danh Hiệp sĩ!'
                                  : 'Xuất sắc! Giám khảo AIKI xác nhận bé đã nắm chắc bài học. Cánh cửa Xưởng Sáng Tạo AI đã mở toang chào đón bé!'
                                : isRuleLesson
                                  ? 'Bé cần thêm một chút cố gắng để được vinh danh. Hãy xem lại video và thử sức lại nhé!'
                                  : 'Chưa đủ điểm mở Xưởng rồi! Bé hãy xem lại video bài giảng và thử sức lại nhé!'
                              : 'Bé hãy đọc kỹ câu hỏi và hình minh họa ở cột bên trái. Hãy tự tin chọn đáp án chuẩn xác nhất!'}
                          </p>
                        </div>

                        {!isRuleLesson && <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-col gap-2.5">
                          <p className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700">
                            🎯 Nhiệm vụ chặng này:
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 font-medium">
                            {getStageInstruction(3)}
                          </p>
                          <div className="mt-1">{renderSidebarAction(currentStage)}</div>
                        </div>}
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
                                  {rewardStageDef?.config?.rewardBadge?.name || journey?.stage6_completion?.rewardBadge?.name || 'Huy hiệu Sáng Tạo'}
                                </span>
                                <span className="text-[11px] text-slate-500 font-semibold">Huy hiệu vàng</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {!isRuleLesson && <>
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
                        {(rewardStageDef?.config?.nextLessonSlug || journey?.stage6_completion?.nextLessonSlug) && (
                          <div className="bg-indigo-50/80 rounded-2xl p-3.5 border border-indigo-200 flex flex-col gap-1.5 text-left shadow-2xs">
                            <div className="text-xs sm:text-sm font-black text-indigo-950 flex items-center gap-1.5">
                              <span>🔮</span>
                              <span>TEASER BÀI HỌC TIẾP THEO</span>
                            </div>
                            <p className="text-xs sm:text-sm text-indigo-900 font-bold leading-relaxed">
                              Chủ đề tiếp theo: {(rewardStageDef?.config?.nextLessonSlug || journey?.stage6_completion?.nextLessonSlug || '').replace(/[-_]/g, ' ')}
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
                        </>}
                      </div>
                    )}
                  </>
                )}

              </div>

              {/* Tiến độ đã có trên thanh bài học; chỉ giữ footer ở hành trình 6 chặng. */}
              {!isRuleLesson && <div
                data-testid="sidebar-footer-progress"
                className="shrink-0 px-4 py-2.5 bg-white/95 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 select-none shadow-xs"
              >
                <span className="font-bold flex items-center gap-1 text-amber-600">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  Tiến độ: {currentStage + 1}/{stages.length} chặng
                </span>
                <span className="font-extrabold text-brand-600">
                  ⭐ {studentStars} Sao tích lũy
                </span>
              </div>}
            </aside>
          </>
        )}
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
