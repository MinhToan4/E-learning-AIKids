import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Location } from 'react-router'
import {
  isAikiRuleJourney as checkIsAikiRule,
  extractRuleNumber,
  AIKI_MODULE_0_COURSE_ID,
} from '@/features/lesson/lib/rule-journey-identifiers'
import { getAikiStudioConfig } from '@/features/lesson/data/aiki-studio-configs'
import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'
import {
  AIKI_RULE_STAGE_METAS,
} from '@/features/teacher/lib/authoring'
import type { Gesture } from '@/features/mee-rig/hooks/useMeeCatSpeech'
import {
  type ArtStyleId,
  type CharacterShapeId,
  type CharacterVibeId,
} from '@/shared/lib/creation/creative'
import {
  assemblePrompt,
  isPromptComplete,
} from '@/shared/lib/creation/prompt'
import {
  storyToPanelHints,
} from '@/shared/lib/creation/story'
import {
  type PromptChip,
  type PromptParts,
} from '@/shared/lib/creation/types'
import { ApiError, api, clearApiCache, type QuestDetail } from '@/shared/lib/api'
import { queryClient } from '@/shared/lib/query-client'
import { clearWorldPageCache, findCourseByIdentifier } from '@/features/world/pages/WorldPage'
import { learningApi, lessonStageIndexFromProgress } from '@/shared/lib/learning-api'
import { clampStationStars } from '@/shared/lib/star-progress'
import {
  EMPTY_PROMPT_LAB,
  promptLabError,
  strongPrompt,
  type PromptLabValue,
} from '@/features/lesson/lib/prompt-lab-state'
import type { GameEvidence } from '@/features/lesson/components/CurriculumGame'
import type { GameHint } from '@/features/lesson/components/games/types'
import type { ZoomImageData } from '@/features/lesson/components/AikiRuleVisuals'
import {
  resolvePracticeReview,
  type PracticePreview,
  type PracticeResult,
} from '@/features/lesson/lib/practice-result'
import {
  queueOfflineProgress,
  type OfflineManifest,
} from '@/features/lesson/lib/offline-learning'
import type { Phase, PoseType } from '@/features/lesson/components/LessonInteractiveSidebar'
import { useAuth } from '@/shared/store/auth'
import { useAikiSituationNarrator } from '@/features/lesson/hooks/useAikiSituationNarrator'
import {
  hydrateAikiRuleCard,
  createAikiRuleCardsFromData,
} from '@/features/lesson/lib/aiki-rule-cards'
import {
  saveLocalLessonProgress,
  queuePendingSync,
  getStoredItemWithFallback,
} from '@/shared/lib/learning-sync-store'

export function resolveInitialLessonProgress(openedProgress: any, authLessonId: string, questId: string, childId?: string | null) {
  const isLocallyCompleted =
    (typeof window !== 'undefined') &&
    (getStoredItemWithFallback(`aikids_lesson_completed_${authLessonId}`, childId) === 'true' ||
      getStoredItemWithFallback(`aikids_lesson_completed_${questId}`, childId) === 'true' ||
      Number(getStoredItemWithFallback(`aikids_lesson_stars_${authLessonId}`, childId) || 0) >= 3 ||
      Number(getStoredItemWithFallback(`aikids_lesson_stars_${questId}`, childId) || 0) >= 3)
  const status = isLocallyCompleted ? 'completed' : openedProgress?.status
  const stars = isLocallyCompleted ? 3 : clampStationStars(openedProgress?.stars)
  let cachedLocalStage = 0
  try {
    const raw = sessionStorage.getItem(`aikids_stage_${questId}`)
      || sessionStorage.getItem(`aikids_stage_${authLessonId}`)
      || localStorage.getItem(`aikids_lesson_stage_${questId}`)
      || localStorage.getItem(`aikids_lesson_stage_${authLessonId}`)
    const num = raw != null ? parseInt(raw, 10) : 0
    if (Number.isFinite(num) && num > 0) cachedLocalStage = num
  } catch {
    // Storage may be unavailable
  }
  const serverStage = lessonStageIndexFromProgress(openedProgress)
  const resumeStage = isLocallyCompleted ? 99 : Math.max(serverStage, cachedLocalStage)
  return { isLocallyCompleted, status, stars, resumeStage }
}

export function buildRuleQuestDetail(authLessonId: string, rId: number, rData: any, status?: string): QuestDetail {
  return {
    id: authLessonId,
    status,
    courseId: 'aiki-rules',
    order: rId,
    title: `Quy tắc ${rId}: ${rData.shortTitle}`,
    duration: `${rData.durationSec}s`,
    hook: rData.title,
    goals: [rData.goal],
    learnCards: createAikiRuleCardsFromData(rData),
    stations: { stations: [] },
    practiceKind: 'chips',
    check: rData.questions.map((q: any) => ({
      id: String(q.id),
      question: q.prompt,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.successFeedback || q.hint || 'Quy tắc vàng AIKI',
    })),
  } as any
}

export function buildIslandQuestDetail(authLessonId: string, questId: string, islandCurriculum: any, routeCourseId?: string, status?: string): QuestDetail {
  return {
    id: authLessonId,
    slug: questId,
    status,
    courseId: islandCurriculum.courseId || (routeCourseId && !routeCourseId.startsWith('dao-') ? routeCourseId : `dao-${islandCurriculum.islandNumber}`),
    order: islandCurriculum.lessonNumber || 1,
    title: islandCurriculum.title,
    duration: '180s',
    hook: islandCurriculum.journey.stage1_goal.title,
    goals: [islandCurriculum.journey.stage1_goal.coreGoal || islandCurriculum.journey.stage1_goal.goalText || islandCurriculum.objective],
    learnCards: [],
    stations: { stations: [] },
    practiceKind: 'chips',
    sixStageJourney: islandCurriculum.journey,
    check: islandCurriculum.journey.stage4_quiz.questions.map((q: any, idx: number) => ({
      id: String(idx + 1),
      question: q.prompt,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation || 'Quy tắc vàng AIKI',
    })),
  } as any
}

// These workshops can continue from course-created work only; the API verifies ownership.
export const GEN_KINDS = new Set(['ai_pick', 'video', 'chips', 'character'])

export const emptyStory = {
  opening: '',
  problem: '',
  ending: '',
  title: 'Truyện của con',
}

export interface UseLessonPageStateProps {
  questId: string
  routeCourseId?: string
  location?: Location
}

export function useLessonPageState({ questId, routeCourseId, location }: UseLessonPageStateProps) {
  const [quest, setQuest] = useState<QuestDetail | null>(null)
  const [phase, setPhase] = useState<Phase>('learn')
  const [gameHint, setGameHint] = useState<GameHint | null>(null)
  const [maxUnlockedPhase, setMaxUnlockedPhase] = useState<Phase>('learn')
  const [aikiRuleStage, setAikiRuleStage] = useState(0)
  const [resumeStageIndex, setResumeStageIndex] = useState(0)
  const [aikiQuizAnswer, setAikiQuizAnswer] = useState<number | null>(null)
  const [aikiQuizAnswerCorrect, setAikiQuizAnswerCorrect] = useState(false)
  const [zoomedImage, setZoomedImage] = useState<ZoomImageData | null>(null)
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false)
  const [hasAcknowledgedRule, setHasAcknowledgedRule] = useState(false)
  const [hasCommitted, setHasCommitted] = useState(false)
  const [videoSeekTarget, setVideoSeekTarget] = useState<{ sec: number; token: number } | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isSidebarSpeaking, setIsSidebarSpeaking] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aikids_lesson_sidebar_collapsed') === 'true'
    } catch {
      return false
    }
  })
  const toggleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed)
    try {
      localStorage.setItem('aikids_lesson_sidebar_collapsed', String(collapsed))
    } catch {}
  }
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1280
    }
    return false
  })

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1280)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const [manualMeeCue, setManualMeeCue] = useState<{ key: number; text: string; gesture?: Gesture } | null>(null)
  const {
    isPlaying: isNarratingSituation,
    activeSpeaker,
    speakingLineIndex,
    playSituation,
    stop: stopSituationNarrator,
  } = useAikiSituationNarrator()
  const user = useAuth((s) => s.user)
  const isParent = user?.role === 'parent'
  const [isPaywallOpen, setIsPaywallOpen] = useState(false)
  const [isParentGateOpen, setIsParentGateOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [parts, setParts] = useState<PromptParts>({})
  const [generated, setGenerated] = useState<PracticePreview | null>(null)
  const [practiceFeedback, setPracticeFeedback] = useState<string | null>(null)
  const [practiceSaved, setPracticeSaved] = useState(false)
  const [practiceAdvanced, setPracticeAdvanced] = useState(false)
  const [charName, setCharName] = useState('')
  const [charShape, setCharShape] = useState<CharacterShapeId>('animal')
  const [charVibe, setCharVibe] = useState<CharacterVibeId>('curious')
  const [styleId, setStyleId] = useState<ArtStyleId | null>(null)
  const [story, setStory] = useState(emptyStory)
  const [comicBubbles, setComicBubbles] = useState(['', '', '', ''])
  const [detectivePick, setDetectivePick] = useState<0 | 1 | null>(null)
  const [journalText, setJournalText] = useState('')
  const [promptLab, setPromptLab] = useState<PromptLabValue>(EMPTY_PROMPT_LAB)
  const [paletteColors, setPaletteColors] = useState<string[]>([
    '#6d5efc',
    '#3dbfff',
    '#ffc94a',
  ])
  const [practiceOrder, setPracticeOrder] = useState<string[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [answerFeedback, setAnswerFeedback] = useState<
    Record<string, { correct: boolean; explanation: string }>
  >({})
  const [checkingQuestionId, setCheckingQuestionId] = useState<string | null>(null)
  const [lastActiveQuestionId, setLastActiveQuestionId] = useState<string | null>(null)
  const [liveStars, setLiveStars] = useState(0)
  const [starBurst, setStarBurst] = useState<{ id: number; count: number } | null>(null)
  const [checkResult, setCheckResult] = useState<{
    stars: number
    message: string
    nextQuestId: string | null
    newAchievements?: string[]
    courseCredential?: string | null
  } | null>(null)
  const [busy, setBusy] = useState(false)
  const [refAssetIds, setRefAssetIds] = useState<string[]>([])
  const [sketchDataUrl, setSketchDataUrl] = useState<string | null>(null)
  const [reviewMode, setReviewMode] = useState(false)
  const [offlineManifest, setOfflineManifest] = useState<OfflineManifest | null>(null)
  // UUID-resolved lesson ID for aiki-rule journeys (prevents 'rule-1' slug reaching Prisma)
  const [authoritativeLessonId, setAuthoritativeLessonId] = useState<string>('')
  const hasAdvancedFromLearnRef = useRef<Record<string, boolean>>({})

  // Memoized callbacks for AikiRuleVideoPlayer & interactive controls
  const handleSlideChange = useCallback((index: number) => {
    setAikiRuleStage(index)
  }, [])

  const handlePlayStateChange = useCallback((playing: boolean) => {
    setIsVideoPlaying(playing)
  }, [])

  const resetLocal = useCallback(() => {
    hasAdvancedFromLearnRef.current = {}
    setPhase('learn')
    setMaxUnlockedPhase('learn')
    setError(null)
    setParts({})
    setGenerated(null)
    setPracticeFeedback(null)
    setPracticeSaved(false)
    setPracticeAdvanced(false)
    setCharName('')
    setCharShape('animal')
    setCharVibe('curious')
    setStyleId(null)
    setStory(emptyStory)
    setComicBubbles(['', '', '', ''])
    setDetectivePick(null)
    setJournalText('')
    setPromptLab(EMPTY_PROMPT_LAB)
    setPaletteColors(['#6d5efc', '#3dbfff', '#ffc94a'])
    setPracticeOrder([])
    setRefAssetIds([])
    setSketchDataUrl(null)
    setAnswers({})
    setAnswerFeedback({})
    setCheckingQuestionId(null)
    setLastActiveQuestionId(null)
    setLiveStars(0)
    setStarBurst(null)
    setCheckResult(null)
    setReviewMode(false)
    setOfflineManifest(null)
    setQuest(null)
    setAikiRuleStage(0)
    setResumeStageIndex(0)
    setAikiQuizAnswer(null)
    setAikiQuizAnswerCorrect(false)
    setZoomedImage(null)
    setIsPosterModalOpen(false)
    setHasAcknowledgedRule(false)
    setHasCommitted(false)
    setManualMeeCue(null)
  }, [])

  function recoverCurrentPhase(err: unknown): boolean {
    if (!(err instanceof ApiError) || err.status !== 409) return false
    const body = err.body
    if (!body || typeof body !== 'object') return false
    const detail = body as { reason?: unknown; currentPhase?: unknown }
    if (detail.reason !== 'phase_mismatch') return false
    if (
      detail.currentPhase !== 'learn' &&
      detail.currentPhase !== 'game' &&
      detail.currentPhase !== 'practice' &&
      detail.currentPhase !== 'check'
    ) {
      return false
    }
    setPhase(detail.currentPhase)
    setReviewMode(false)
    setError('Bài học vừa được cập nhật. Mình tiếp tục ở phần đang làm nhé!')
    return true
  }

  useEffect(() => {
    setMaxUnlockedPhase((prev) => {
      const phaseOrder = ['learn', 'game', 'practice', 'check', 'done']
      const prevIdx = phaseOrder.indexOf(prev)
      const currentIdx = phaseOrder.indexOf(phase)
      return currentIdx > prevIdx ? phase : prev
    })
  }, [phase])

  // Save resume debounce effect
  useEffect(() => {
    const isLocalCurriculum = questId.startsWith('rule-') || questId.startsWith('bai-') || questId === 'aiki-rules'
    if (!quest || !navigator.onLine || isLocalCurriculum) return
    const percentByPhase: Record<Phase, number> = {
      learn: 10,
      game: 35,
      practice: 65,
      check: 90,
      done: 100,
    }
    const timer = window.setTimeout(() => {
      const occurredAt = new Date().toISOString()
      void learningApi.saveResume(questId, {
        percent: percentByPhase[phase],
        positionSeconds: 0,
        sectionId: phase,
        occurredAt,
      }).catch(() => {
        queueOfflineProgress(questId, {
          percent: percentByPhase[phase],
          positionSeconds: 0,
          sectionId: phase,
        })
      })
    }, 750)
    return () => window.clearTimeout(timer)
  }, [phase, quest, questId])

  const promptText = useMemo(() => assemblePrompt(parts), [parts])

  const isAikiRuleJourney = Boolean(
    checkIsAikiRule(routeCourseId) ||
    checkIsAikiRule(questId) ||
    (quest && (
      checkIsAikiRule(quest.courseId) ||
      checkIsAikiRule(quest.id) ||
      checkIsAikiRule((quest as { slug?: string }).slug) ||
      checkIsAikiRule(quest.title)
    ))
  )

  const isIslandJourney = Boolean(
    !isAikiRuleJourney && (
      quest?.courseId?.startsWith('dao-') ||
      quest?.id?.startsWith('bai-') ||
      questId?.startsWith('bai-') ||
      (quest?.learnCards?.length === 5 && quest.learnCards[0]?.id?.includes('situation'))
    )
  )

  const is5StageJourney = isAikiRuleJourney

  const ruleId = useMemo(() => {
    if (!isAikiRuleJourney) return 0
    return extractRuleNumber(
      quest
        ? { ...quest, courseId: routeCourseId || quest.courseId }
        : questId
    )
  }, [isAikiRuleJourney, questId, quest, routeCourseId])

  const effectiveCourseId = (isAikiRuleJourney && (!routeCourseId || routeCourseId === 'aiki-rules'))
    ? AIKI_MODULE_0_COURSE_ID
    : (routeCourseId || quest?.courseId || (isAikiRuleJourney ? AIKI_MODULE_0_COURSE_ID : '') || 'aiki-rules')

  const ruleData = useMemo(() => {
    if (!isAikiRuleJourney) return null
    return AIKI_RULES_DATA.find((r) => r.id === ruleId) || AIKI_RULES_DATA[0]
  }, [isAikiRuleJourney, ruleId])

  const handleSelectOption = useCallback(
    (idx: number) => {
      const targetQuestion = ruleData?.questions?.[0]
      const isCorrect = targetQuestion ? idx === targetQuestion.correctIndex : idx === 1
      setAikiQuizAnswer(idx)
      if (isCorrect) {
        setAikiQuizAnswerCorrect(true)
        setStarBurst({ id: Date.now(), count: 1 })
        setLiveStars((prev) => Math.max(prev, 1))
      }
    },
    [ruleData],
  )

  const hydratedLearnCards = useMemo(() => {
    if (!quest) return []
    if (isAikiRuleJourney && quest.learnCards.length === 0 && ruleData) {
      return createAikiRuleCardsFromData(ruleData)
    }
    return quest.learnCards.map(hydrateAikiRuleCard)
  }, [quest, isAikiRuleJourney, ruleData])

  const visibleLearnCards = useMemo(() => {
    if (is5StageJourney) {
      const card = hydratedLearnCards[aikiRuleStage] || hydratedLearnCards[0]
      return card ? [card] : []
    }
    return hydratedLearnCards
  }, [is5StageJourney, hydratedLearnCards, aikiRuleStage])

  useEffect(() => {
    if (isAikiRuleJourney) return
    if (location?.pathname.endsWith('/studio')) {
      setPhase('practice')
    }
  }, [location?.pathname, isAikiRuleJourney])

  // Safeguard: Aiki rules NEVER enter practice studio
  useEffect(() => {
    if (isAikiRuleJourney && phase === 'practice') {
      setPhase('learn')
    }
  }, [isAikiRuleJourney, phase])

  const studioConfig = useMemo(() => {
    return getAikiStudioConfig(
      (quest as any)?.slug || quest?.id || questId,
      quest?.title,
      (quest as any)?.courseId
    )
  }, [quest, questId])

  const studioCharacterName = useMemo(() => {
    if (studioConfig?.subjectName) return studioConfig.subjectName
    if (
      quest?.title?.toLowerCase().includes('sóc bông') ||
      quest?.hook?.toLowerCase().includes('sóc bông') ||
      questId?.includes('bai-3-2') ||
      quest?.id?.includes('bai-3-2')
    ) {
      return 'Sóc Bông'
    }
    if (quest?.title?.toLowerCase().includes('mèo') || questId?.includes('bai-1')) {
      return 'Mèo Máy'
    }
    if (quest?.title?.toLowerCase().includes('hiệp sĩ') || questId?.includes('bai-2')) {
      return 'Hiệp Sĩ Sáng Tạo'
    }
    return 'Sóc Bông'
  }, [studioConfig, quest?.title, quest?.hook, questId, quest?.id])

  const studioLockedFeatures = useMemo(() => {
    if (studioConfig?.lockedFeatures && studioConfig.lockedFeatures.length > 0) {
      return studioConfig.lockedFeatures
    }
    if (studioCharacterName === 'Sóc Bông') {
      return [
        'mũ len đỏ quả bông trắng',
        'đuôi to xù màu cam',
        'túi vải nâu đeo chéo',
      ]
    }
    if (studioCharacterName === 'Mèo Máy') {
      return [
        'chuông vàng trước cổ',
        'túi thần kỳ trước bụng',
        'đuôi tròn đỏ xinh xắn',
      ]
    }
    return [
      'mũ len đỏ quả bông trắng',
      'đuôi to xù màu cam',
      'túi vải nâu đeo chéo',
    ]
  }, [studioConfig, studioCharacterName])

  useEffect(() => {
    stopSituationNarrator()
  }, [aikiRuleStage, phase, stopSituationNarrator])

  const finishLessonPromiseRef = useRef<Promise<boolean> | null>(null)

  async function handleAikiFinish(customSummary?: {
    answers?: Array<{ questionId: string; optionIndex: number }>
    stars?: number
    xp?: number
    nextLessonSlug?: string
    keepalive?: boolean
  }) {
    if (checkResult) return true
    if (finishLessonPromiseRef.current) return finishLessonPromiseRef.current
    if (!quest) return false
    const nextRuleTarget = (isAikiRuleJourney && ruleId < 10) ? `rule-${ruleId + 1}` : null
    const currentRuleData = isAikiRuleJourney ? (AIKI_RULES_DATA.find((r) => r.id === ruleId) || AIKI_RULES_DATA[0]) : null

    const answersPayload = isAikiRuleJourney && currentRuleData?.questions?.length
      ? currentRuleData.questions.map((q) => ({
          questionId: q.id,
          optionIndex: q.correctIndex ?? 0,
        }))
      : customSummary?.answers?.length
      ? customSummary.answers.map((a, idx) => ({
          questionId: a.questionId,
          optionIndex: a.optionIndex >= 0 ? a.optionIndex : ((quest?.check?.[idx] as any)?.correctIndex ?? 0),
        }))
      : (quest.check && quest.check.length > 0)
        ? quest.check.map((q) => ({
            questionId: q.id,
            optionIndex: (answers && typeof answers[q.id] === 'number') ? answers[q.id] : ((q as any).correctIndex ?? 0),
          }))
        : []
    const finishPromise = (async () => {
      setBusy(true)
      try {
        const lessonIdForSubmit =
          authoritativeLessonId ||
          quest.id ||
          questId
        const checkRes = await learningApi.submitCheck(lessonIdForSubmit, { answers: answersPayload })
        const confirmedStars = customSummary?.stars && customSummary.stars >= 1 ? customSummary.stars : 3
        const celebrationMsg = isIslandJourney
          ? `Xuất sắc! Con đã hoàn thành ${quest.title} và được hệ thống ghi nhận ${confirmedStars} Sao!`
          : (confirmedStars >= 3 ? 'Xuất sắc! Con đạt trọn 3 Sao. Chào mừng Hiệp Sĩ Sáng Tạo AIKI!' : `Xuất sắc! Con đạt ${confirmedStars} Sao.`)
        const progressId = authoritativeLessonId || quest.id || questId

        if (confirmedStars >= 3) {
          quest.status = 'completed'
          setQuest((prev) => (prev ? { ...prev, status: 'completed' } : prev))
          setLiveStars(3)
          setPhase('done')
          setCheckResult({
            ...checkRes,
            stars: 3,
            message: celebrationMsg,
            nextQuestId: checkRes.nextQuestId || nextRuleTarget,
          })
          try {
            saveLocalLessonProgress(progressId, 3, true, user?.id)
            if (quest?.id && quest.id !== progressId) saveLocalLessonProgress(quest.id, 3, true, user?.id)
            if (questId && questId !== progressId) saveLocalLessonProgress(questId, 3, true, user?.id)
            if (authoritativeLessonId && authoritativeLessonId !== progressId) saveLocalLessonProgress(authoritativeLessonId, 3, true, user?.id)

            sessionStorage.removeItem(`aikids_stage_${quest.id}`)
            sessionStorage.removeItem(`aikids_stage_${questId}`)
            if (authoritativeLessonId) sessionStorage.removeItem(`aikids_stage_${authoritativeLessonId}`)
          } catch {
            // ignore storage failure
          }
          clearApiCache()
          clearWorldPageCache()
          window.dispatchEvent(new CustomEvent('aikids:lesson-completed'))
        } else {
          setLiveStars(confirmedStars)
          try {
            saveLocalLessonProgress(progressId, confirmedStars, false, user?.id)
            if (quest?.id && quest.id !== progressId) saveLocalLessonProgress(quest.id, confirmedStars, false, user?.id)
            if (questId && questId !== progressId) saveLocalLessonProgress(questId, confirmedStars, false, user?.id)
            if (authoritativeLessonId && authoritativeLessonId !== progressId) saveLocalLessonProgress(authoritativeLessonId, confirmedStars, false, user?.id)
          } catch {
            // ignore storage failure
          }
        }

        window.dispatchEvent(new CustomEvent('aikids:xp-updated', {
          detail: {
            stars: confirmedStars,
            ...(typeof checkRes?.totalXp === 'number' && typeof checkRes?.level === 'number'
              ? { xp: checkRes.totalXp, level: checkRes.level }
              : {}),
          },
        }))
        void queryClient.invalidateQueries({ queryKey: ['progression'] })
        void queryClient.invalidateQueries({ queryKey: ['pathway'] })
        void queryClient.invalidateQueries({ queryKey: ['course-progress'] })
        return true
      } catch (err: unknown) {
        console.warn('Submit check failed in handleAikiFinish, completing locally:', err)
        const progressId = authoritativeLessonId || quest.id || questId
        const confirmedStars = customSummary?.stars && customSummary.stars >= 1 ? customSummary.stars : 3

        // Lưu đồng bộ vào local cache (hỗ trợ offline và tương thích ngược)
        saveLocalLessonProgress(progressId, confirmedStars, confirmedStars >= 3, user?.id)
        if (quest?.id && quest.id !== progressId) saveLocalLessonProgress(quest.id, confirmedStars, confirmedStars >= 3, user?.id)
        if (questId && questId !== progressId) saveLocalLessonProgress(questId, confirmedStars, confirmedStars >= 3, user?.id)
        if (authoritativeLessonId && authoritativeLessonId !== progressId) saveLocalLessonProgress(authoritativeLessonId, confirmedStars, confirmedStars >= 3, user?.id)

        // Đưa vào hàng đợi tự động sync lên DB khi mạng phục hồi
        queuePendingSync({
          lessonId: authoritativeLessonId || quest.id || questId,
          answers: answersPayload,
          childId: user?.id,
        })

        if (confirmedStars >= 3) {
          quest.status = 'completed'
          setQuest((prev) => (prev ? { ...prev, status: 'completed' } : prev))
          setLiveStars(3)
          setPhase('done')
          const celebrationMsg = isIslandJourney
            ? `Con đã hoàn thành ${quest.title ?? 'bài học'} với 3 Sao!`
            : 'Xuất sắc! Con đạt trọn 3 Sao. Chào mừng Hiệp Sĩ Sáng Tạo AIKI!'
          setCheckResult({
            stars: 3,
            message: celebrationMsg,
            nextQuestId: nextRuleTarget,
          })
          try {
            sessionStorage.removeItem(`aikids_stage_${quest.id}`)
            sessionStorage.removeItem(`aikids_stage_${questId}`)
            if (authoritativeLessonId) sessionStorage.removeItem(`aikids_stage_${authoritativeLessonId}`)
          } catch {
            // ignore
          }
          clearApiCache()
          clearWorldPageCache()
          window.dispatchEvent(new CustomEvent('aikids:lesson-completed'))
        } else {
          setLiveStars(confirmedStars)
        }
        void queryClient.invalidateQueries({ queryKey: ['progression'] })
        void queryClient.invalidateQueries({ queryKey: ['pathway'] })
        void queryClient.invalidateQueries({ queryKey: ['course-progress'] })
        return true
      } finally {
        setBusy(false)
      }
    })()
    finishLessonPromiseRef.current = finishPromise
    try {
      return await finishPromise
    } finally {
      if (finishLessonPromiseRef.current === finishPromise) {
        finishLessonPromiseRef.current = null
      }
    }
  }

  const persistJourneyStage = useCallback((stageIndex: number, stageCount: number) => {
    const progressId = authoritativeLessonId || quest?.id || questId
    if (stageCount <= 0) return

    try {
      if (typeof window !== 'undefined') {
        const stageStr = String(stageIndex)
        sessionStorage.setItem(`aikids_stage_${progressId}`, stageStr)
        sessionStorage.setItem(`aikids_stage_${questId}`, stageStr)
        localStorage.setItem(`aikids_lesson_stage_${progressId}`, stageStr)
        localStorage.setItem(`aikids_lesson_stage_${questId}`, stageStr)
        if (stageIndex >= 1) {
          sessionStorage.setItem(`aikids_video_done_${progressId}`, 'true')
          sessionStorage.setItem(`aikids_video_done_${questId}`, 'true')
          localStorage.setItem(`aikids_video_done_${progressId}`, 'true')
          localStorage.setItem(`aikids_video_done_${questId}`, 'true')
        }
        if (authoritativeLessonId) {
          sessionStorage.setItem(`aikids_stage_${authoritativeLessonId}`, stageStr)
          localStorage.setItem(`aikids_lesson_stage_${authoritativeLessonId}`, stageStr)
          if (stageIndex >= 1) {
            sessionStorage.setItem(`aikids_video_done_${authoritativeLessonId}`, 'true')
            localStorage.setItem(`aikids_video_done_${authoritativeLessonId}`, 'true')
          }
        }
      }
    } catch {
      // Storage may be unavailable
    }

    setResumeStageIndex(stageIndex)

    const effectiveLessonIdForResume =
      authoritativeLessonId ||
      quest?.id ||
      progressId ||
      questId

    if (stageIndex >= 1 && effectiveLessonIdForResume && !hasAdvancedFromLearnRef.current[effectiveLessonIdForResume]) {
      hasAdvancedFromLearnRef.current[effectiveLessonIdForResume] = true
      void learningApi.advanceLesson(effectiveLessonIdForResume, { fromPhase: 'learn' }).catch(() => {
        // Phase may have already advanced or already completed
      })
    }

    if (!navigator.onLine || !effectiveLessonIdForResume) return
    const percent = Math.max(1, Math.min(99, Math.round(((stageIndex + 1) / stageCount) * 100)))
    void learningApi.saveResume(effectiveLessonIdForResume, {
      percent,
      positionSeconds: 0,
      sectionId: `stage-${stageIndex + 1}`,
      occurredAt: new Date().toISOString(),
    }).catch(() => {
      queueOfflineProgress(effectiveLessonIdForResume, {
        percent,
        positionSeconds: 0,
        sectionId: `stage-${stageIndex + 1}`,
      })
    })
  }, [quest?.id, questId, authoritativeLessonId])

  const handleVideoCompleted = useCallback(() => {
    setLiveStars((prev) => Math.max(prev, 1))
    const progressId = authoritativeLessonId || quest?.id || questId
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`aikids_video_done_${progressId}`, 'true')
        sessionStorage.setItem(`aikids_video_done_${questId}`, 'true')
        localStorage.setItem(`aikids_video_done_${progressId}`, 'true')
        localStorage.setItem(`aikids_video_done_${questId}`, 'true')
        localStorage.setItem(`aikids_lesson_stars_${progressId}`, '1')
        localStorage.setItem(`aikids_lesson_stars_${questId}`, '1')
        if (authoritativeLessonId) {
          sessionStorage.setItem(`aikids_video_done_${authoritativeLessonId}`, 'true')
          localStorage.setItem(`aikids_video_done_${authoritativeLessonId}`, 'true')
          localStorage.setItem(`aikids_lesson_stars_${authoritativeLessonId}`, '1')
        }
      }
    } catch {
      // ignore
    }

    const effectiveId =
      authoritativeLessonId ||
      quest?.id ||
      progressId ||
      questId

    if (effectiveId && navigator.onLine) {
      hasAdvancedFromLearnRef.current[effectiveId] = true
      void learningApi.advanceLesson(effectiveId, { fromPhase: 'learn' }).then(() => {
        clearWorldPageCache()
        clearApiCache()
        window.dispatchEvent(new CustomEvent('aikids:xp-updated', { detail: { stars: 1 } }))
        void queryClient.invalidateQueries({ queryKey: ['pathway'] })
        void queryClient.invalidateQueries({ queryKey: ['course-progress'] })
      }).catch(() => null)
    }
  }, [authoritativeLessonId, quest?.id, questId])

  const panels = useMemo(() => storyToPanelHints(story), [story])
  const gameStation = quest?.stations?.stations.find(
    (station) => station.kind === 'game',
  )
  const practiceStation = quest?.stations?.stations.find(
    (station) => station.kind === 'practice',
  )
  const practiceSteps = practiceStation?.steps?.length
    ? practiceStation.steps
    : [
        practiceStation?.instruction ?? 'Đọc kỹ nhiệm vụ và chọn ý con muốn thực hiện.',
        practiceStation?.product
          ? `Hoàn thành sản phẩm: ${practiceStation.product}`
          : 'Hoàn thành câu trả lời hoặc sản phẩm của con.',
        'Đọc lại, đối chiếu mục tiêu và sửa ít nhất một điểm trước khi lưu.',
      ]
  const practiceCriteria = practiceStation?.successCriteria?.length
    ? practiceStation.successCriteria
    : quest?.goals.slice(0, 4) ?? []
  const orderingCards = practiceStation?.practiceConfig?.cards ?? []
  const effectivePracticeOrder = practiceOrder.length > 0
    ? practiceOrder
    : [...orderingCards].reverse().map((card) => card.id)

  function selectChip(chip: PromptChip) {
    setParts((p) => ({ ...p, [chip.slot]: chip }))
  }

  function practiceReady(): string | null {
    if (!quest) return 'Chưa tải trạm'
    if (quest.practiceKind === 'chips') {
      if (!isPromptComplete(parts)) return 'Ghép đủ 5 thẻ nhé!'
    }
    if (quest.practiceKind === 'story') {
      if (!story.opening || !story.problem || !story.ending) {
        return 'Chọn đủ mở đầu, sự cố và kết nhé!'
      }
    }
    if (quest.practiceKind === 'detective' && detectivePick === null) {
      return 'Chọn một ảnh trước nhé!'
    }
    if (quest.practiceKind === 'character' && !charName.trim()) {
      return 'Đặt tên nhân vật nhé!'
    }
    if (quest.practiceKind === 'style' && !styleId) {
      return 'Chọn một phong cách vẽ nhé!'
    }
    if (
      (quest.practiceKind === 'journal' ||
        quest.practiceKind === 'reflect' ||
        quest.practiceKind === 'spin' ||
        quest.practiceKind === 'match' ||
        quest.practiceKind === 'ai_pick') &&
      journalText.trim().length < 20
    ) {
      return 'Con hãy viết ít nhất 20 ký tự để giải thích trọn ý nhé!'
    }
    if (quest.practiceKind === 'palette' && paletteColors.length < 3) {
      return 'Chọn đủ 3 màu nhé!'
    }
    if (quest.practiceKind === 'palette' && journalText.trim().length < 20) {
      return 'Con hãy giải thích lựa chọn màu của mình ít nhất 20 ký tự nhé!'
    }
    if (quest.practiceKind === 'comic' && comicBubbles.some((bubble) => bubble.trim().length < 2)) {
      return 'Con hãy thêm lời thoại cho đủ bốn khung truyện nhé!'
    }
    if (quest.practiceKind === 'sketch' && !sketchDataUrl) {
      return 'Hãy vẽ vài nét trên canvas trong bài nhé!'
    }
    if (quest.practiceKind === 'video' && !journalText.trim()) {
      return 'Viết mô tả chuyển động hoặc cảnh phim trước nhé!'
    }
    if (quest.practiceKind === 'prompt_lab') {
      return promptLabError(promptLab)
    }
    if (quest.practiceKind === 'ordering') {
      const correct = orderingCards.map((card) => card.id)
      if (effectivePracticeOrder.some((id, index) => id !== correct[index])) {
        return 'Con hãy sắp xếp các thẻ đúng thứ tự trước khi lưu nhé!'
      }
      if (journalText.trim().length < 20) {
        return 'Con hãy giải thích lựa chọn của mình ít nhất 20 ký tự nhé!'
      }
    }
    if (quest.practiceKind === 'card' || quest.practiceKind === 'card_balance') {
      if (!journalText.trim()) {
        return 'Con hãy thiết kế chỉ số cân bằng (<= 20đ) và lưu thẻ bài trước nhé!'
      }
    }
    return null
  }

  async function advanceFromLearn() {
    const prevPhase = phase
    setError(null)
    const hasGame = quest?.stations?.stations?.some((s) => s.kind === 'game')
    const nextPhase = hasGame ? 'game' : 'practice'
    setPhase(nextPhase)

    try {
      const response = await learningApi.advanceLesson(questId, {
        fromPhase: 'learn',
      })
      if (response?.progress?.phase) {
        setPhase(response.progress.phase)
      }
    } catch (e) {
      if (!recoverCurrentPhase(e)) {
        setPhase(prevPhase)
        setError(e instanceof Error ? e.message : 'Chưa mở được phần chơi')
      }
    }
  }

  async function advanceFromGame(gameEvidence: GameEvidence | { skipped: true }) {
    const prevPhase = phase
    const prevStars = liveStars
    setError(null)
    setPhase('practice')
    setLiveStars((prev) => Math.max(prev, 1))
    setStarBurst({ id: Date.now(), count: 1 })

    try {
      const result = await learningApi.advanceLesson(questId, {
        fromPhase: 'game',
        gameEvidence,
      })
      if (result?.progress?.stars != null) {
        setLiveStars(clampStationStars(result.progress.stars))
      }
      if (result?.progress?.phase) {
        setPhase(result.progress.phase)
      }
    } catch (e) {
      if (!recoverCurrentPhase(e)) {
        setPhase(prevPhase)
        setLiveStars(prevStars)
        setError(e instanceof Error ? e.message : 'Chưa lưu được lượt chơi')
      }
    }
  }

  async function savePractice() {
    if (!quest) return
    const gate = practiceReady()
    if (gate) {
      setError(gate)
      return
    }
    setBusy(true)
    setError(null)
    try {
      let payload: Record<string, unknown> = {}
      if (quest.practiceKind === 'chips') {
        payload = { parts, freeText: '' }
      } else if (quest.practiceKind === 'character') {
        payload = {
          name: charName.trim(),
          shapeId: charShape,
          vibeId: charVibe,
        }
      } else if (quest.practiceKind === 'style') {
        payload = { styleId }
      } else if (quest.practiceKind === 'story') {
        payload = story
      } else if (quest.practiceKind === 'comic') {
        payload = {
          title: story.title || 'Truyện của con',
          bubbles: comicBubbles,
          panels,
        }
      } else if (quest.practiceKind === 'video') {
        payload = {
          title: quest.title,
          scenes: [{ label: 'Cảnh của con', beat: journalText.trim() }],
          freeText: journalText.trim(),
        }
      } else if (quest.practiceKind === 'detective') {
        payload = { pickedCorrect: detectivePick === 0 }
      } else if (quest.practiceKind === 'sketch') {
        let uploadedUrl: string | undefined
        if (sketchDataUrl && sketchDataUrl.startsWith('data:image/')) {
          try {
            const [header, base64Data] = sketchDataUrl.split(',')
            const mimeMatch = header.match(/data:(.*?);base64/)
            const mimeType = mimeMatch ? mimeMatch[1] : 'image/webp'
            const binaryStr = atob(base64Data)
            const len = binaryStr.length
            const bytes = new Uint8Array(len)
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryStr.charCodeAt(i)
            }
            const blob = new Blob([bytes], { type: mimeType })
            const form = new FormData()
            form.append('file', blob, 'aikids-sketch.webp')
            form.append('permanent', '1')
            form.append('assetType', 'aikids')

            const uploaded = await api<{ asset?: { url: string }; url?: string }>('/api/media/upload', {
              method: 'POST',
              body: form,
            })
            const maybeUrl = uploaded?.asset?.url || uploaded?.url
            if (maybeUrl) {
              uploadedUrl = maybeUrl
            }
          } catch (uploadErr) {
            console.warn('[LessonPage] Không thể upload ảnh vẽ lên storage, fallback sang dataUrl:', uploadErr)
          }
        }

        if (uploadedUrl) {
          payload = {
            sketchUrl: uploadedUrl,
            sketchDataUrl: uploadedUrl,
            text: journalText.trim(),
          }
        } else {
          payload = {
            sketchDataUrl,
            text: journalText.trim(),
          }
        }
      } else if (
        quest.practiceKind === 'journal' ||
        quest.practiceKind === 'reflect' ||
        quest.practiceKind === 'spin' ||
        quest.practiceKind === 'match' ||
        quest.practiceKind === 'drag'
      ) {
        payload = { text: journalText.trim(), freeText: journalText.trim() }
      } else if (quest.practiceKind === 'palette') {
        payload = { colors: paletteColors, text: journalText.trim() }
      } else if (quest.practiceKind === 'ai_pick') {
        payload = {
          prompt: journalText.trim(),
          freeText: journalText.trim(),
        }
      } else if (quest.practiceKind === 'prompt_lab') {
        payload = {
          weakPrompt: promptLab.weak.trim(),
          mediumPrompt: promptLab.medium.trim(),
          strongPrompt: strongPrompt(promptLab),
          strongPromptParts: {
            role: promptLab.role.trim(),
            task: promptLab.task.trim(),
            context: promptLab.context.trim(),
            format: promptLab.format.trim(),
          },
          explanation: promptLab.explanation.trim(),
          freeText: strongPrompt(promptLab),
        }
      } else if (quest.practiceKind === 'ordering') {
        payload = { order: effectivePracticeOrder, plan: journalText.trim(), completed: true }
      } else if (quest.practiceKind === 'card' || quest.practiceKind === 'card_balance') {
        payload = { cardData: journalText.trim(), freeText: journalText.trim(), completed: true }
      } else {
        payload = { ready: true }
      }

      if (GEN_KINDS.has(quest.practiceKind) && refAssetIds.length > 0) {
        payload = { ...payload, assetIds: refAssetIds }
      }

      const res = await learningApi.savePractice<{ result: PracticeResult }>(
        questId,
        {
          kind: quest.practiceKind === 'chips' ? 'prompt' : quest.practiceKind,
          payload,
        },
      )
      const review = resolvePracticeReview(res.result)
      setGenerated(review.preview)
      setPracticeFeedback(review.feedback)
      setPracticeSaved(true)
      try {
        const advance = await learningApi.advanceLesson(questId, {
          fromPhase: 'practice',
        })
        setLiveStars(clampStationStars(advance.progress.stars))
        setStarBurst({ id: Date.now(), count: 1 })
        setPracticeAdvanced(true)
      } catch {
        setError('Sản phẩm đã được lưu, nhưng kết nối chưa mở được phần kiểm tra. Con có thể thử tiếp tục lại.')
      }
    } catch (e) {
      if (!recoverCurrentPhase(e)) {
        setError(e instanceof Error ? e.message : 'Chưa lưu được')
      }
    } finally {
      setBusy(false)
    }
  }

  async function advanceFromPractice() {
    setBusy(true)
    setError(null)
    try {
      const result = await learningApi.advanceLesson(questId, {
        fromPhase: 'practice',
      })
      setLiveStars(clampStationStars(result.progress.stars))
      setStarBurst({ id: Date.now(), count: 1 })
      setPracticeAdvanced(true)
      setPhase('check')
      setGameHint(null)
    } catch (e) {
      if (!recoverCurrentPhase(e)) {
        setError(e instanceof Error ? e.message : 'Chưa lưu được')
      }
    } finally {
      setBusy(false)
    }
  }

  async function submitCheck() {
    if (!quest) return
    const missing = quest.check.filter((q) => answers[q.id] === undefined)
    if (missing.length > 0) {
      setError('Hãy chọn đáp án cho mọi câu hỏi nhé!')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await learningApi.advanceLesson(questId, { fromPhase: 'learn' }).catch(() => null)
      await learningApi.advanceLesson(questId, { fromPhase: 'game' }).catch(() => null)
      await learningApi.advanceLesson(questId, { fromPhase: 'practice' }).catch(() => null)

      const res = await learningApi.submitCheck(questId, {
        answers: quest.check.map((q) => ({
          questionId: q.id,
          optionIndex: answers[q.id] as number,
        })),
      })
      if (res.passed === false) {
        setError(res.message)
        return
      }
      const confirmedStars = clampStationStars(res.stars)
      setLiveStars(confirmedStars)
      setStarBurst({ id: Date.now(), count: 1 })
      setCheckResult({ ...res, stars: confirmedStars })
      setPhase('done')
      setGameHint(null)
      clearApiCache()
      window.dispatchEvent(new CustomEvent('aikids:xp-updated', {
        detail: {
          stars: confirmedStars,
          ...(typeof res.totalXp === 'number' && typeof res.level === 'number'
            ? { xp: res.totalXp, level: res.level }
            : {}),
        },
      }))
    } catch (e) {
      const isAlreadyCompleted =
        (e instanceof ApiError && (e.status === 409 || e.status === 422)) ||
        (e instanceof Error &&
          (e.message.includes('409') ||
            e.message.includes('CHECKPOINT_REQUIRED') ||
            e.message.includes('422') ||
            e.message.includes('INCOMPLETE_CHECK') ||
            e.message.includes('Lesson phase changed') ||
            e.message.includes('phase_mismatch')))

      if (isAlreadyCompleted) {
        const confirmedStars = liveStars > 0 ? liveStars : 2
        setLiveStars(confirmedStars)
        setStarBurst({ id: Date.now(), count: 1 })
        let nextQuestId: string | null = null
        try {
          if (quest?.courseId) {
            let targetCourseId = quest.courseId
            if (targetCourseId.startsWith('dao-') || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetCourseId)) {
              const pathway = await learningApi.getPathway().catch(() => null)
              if (pathway?.courses) {
                const matchedCourse =
                  pathway.courses.find((c) => c.id === targetCourseId || c.slug === targetCourseId || (c.slug && c.slug.startsWith(`${targetCourseId}-`))) ||
                  findCourseByIdentifier(pathway.courses, targetCourseId)
                if (matchedCourse?.id) {
                  targetCourseId = matchedCourse.id
                }
              }
            }
            const p = await learningApi.getCourseProgress(targetCourseId).catch(() => null)
            const next = p?.quests?.find(
              (q) => q.order === quest.order + 1 &&
                (q.status === 'available' || q.status === 'in_progress' || q.status === 'completed'),
            )
            nextQuestId = next?.id ?? null
          }
        } catch { /* ignore */ }
        setCheckResult({
          stars: confirmedStars,
          message: 'Con đã hoàn thành bài học này rồi!',
          nextQuestId,
        })
        setPhase('done')
        setGameHint(null)
        clearApiCache()
        window.dispatchEvent(new CustomEvent('aikids:xp-updated', { detail: { stars: confirmedStars } }))
        void queryClient.invalidateQueries({ queryKey: ['progression'] })
        void queryClient.invalidateQueries({ queryKey: ['pathway'] })
        void queryClient.invalidateQueries({ queryKey: ['course-progress'] })
      } else if (!recoverCurrentPhase(e)) {
        setError(e instanceof Error ? e.message : 'Chưa gửi được')
      }
    } finally {
      setBusy(false)
    }
  }

  async function chooseCheckAnswer(questionId: string, optionIndex: number) {
    if (answerFeedback[questionId]?.correct || checkingQuestionId) return
    setAnswers((current) => ({ ...current, [questionId]: optionIndex }))
    setCheckingQuestionId(questionId)
    setLastActiveQuestionId(questionId)
    setError(null)

    if (is5StageJourney) {
      const firstCheck = quest?.check?.[0] as any
      const correctIdx = typeof firstCheck?.correctIndex === 'number'
        ? firstCheck.correctIndex
        : (ruleData?.questions?.[0]?.correctIndex ?? 1)
      const isCorrect = optionIndex === correctIdx
      const explanation = isCorrect
        ? (firstCheck?.explain || firstCheck?.explanation || (isAikiRuleJourney ? 'Tuyệt vời! Con chọn hoàn toàn chính xác! Bức tranh của Sonet có chi tiết Bố cầm vợt muỗi — câu chuyện thật độc nhất của riêng bạn ấy!' : 'Tuyệt vời! Con đã chọn phương án chính xác!'))
        : (isAikiRuleJourney ? 'Bức này quen thuộc quá, ai cũng có thể vẽ được giống hệt nhau. Bé hãy thử lại bức của Sonet xem sao nhé!' : 'Chưa đúng rồi! Con hãy quan sát lại 2 bức tranh bên trái và xem gợi ý của Coach Mee nhé!')

      setAnswerFeedback((current) => ({
        ...current,
        [questionId]: {
          correct: isCorrect,
          explanation,
        },
      }))

      if (isCorrect) {
        setLiveStars((s) => Math.min(3, s + 1))
        setStarBurst({ id: Date.now(), count: 1 })
      }

      try {
        await learningApi.checkAnswer(questId, {
          questionId,
          optionIndex,
        })
      } catch {
        // Luồng 5 chặng: Bảo lưu phản hồi visual cho học sinh, không xoá lựa chọn
      } finally {
        setCheckingQuestionId(null)
      }
      return
    }

    try {
      const feedback = await learningApi.checkAnswer(questId, {
        questionId,
        optionIndex,
      })
      setAnswerFeedback((current) => ({
        ...current,
        [questionId]: {
          correct: feedback.correct,
          explanation: feedback.explanation,
        },
      }))
    } catch (e) {
      setAnswers((current) => {
        const next = { ...current }
        delete next[questionId]
        return next
      })
      setError(e instanceof Error ? e.message : 'Chưa kiểm tra được đáp án')
    } finally {
      setCheckingQuestionId(null)
    }
  }

  const allCheckAnswersCorrect = Boolean(
    quest?.check &&
    quest.check.length > 0 &&
    quest.check.every((question) => answerFeedback[question.id]?.correct)
  )

  const currentLearnVideoUrl = quest?.videoUrl || visibleLearnCards[0]?.videoUrl
  const currentLearnVideoTitle = visibleLearnCards[0]?.title || quest?.title

  return {
    quest,
    setQuest,
    phase,
    setPhase,
    gameHint,
    setGameHint,
    maxUnlockedPhase,
    setMaxUnlockedPhase,
    aikiRuleStage,
    setAikiRuleStage,
    resumeStageIndex,
    setResumeStageIndex,
    aikiQuizAnswer,
    setAikiQuizAnswer,
    aikiQuizAnswerCorrect,
    setAikiQuizAnswerCorrect,
    zoomedImage,
    setZoomedImage,
    isPosterModalOpen,
    setIsPosterModalOpen,
    hasAcknowledgedRule,
    setHasAcknowledgedRule,
    hasCommitted,
    setHasCommitted,
    videoSeekTarget,
    setVideoSeekTarget,
    isVideoPlaying,
    setIsVideoPlaying,
    isSidebarSpeaking,
    setIsSidebarSpeaking,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    toggleSidebarCollapse,
    isSmallScreen,
    manualMeeCue,
    setManualMeeCue,
    isNarratingSituation,
    activeSpeaker,
    speakingLineIndex,
    playSituation,
    stopSituationNarrator,
    user,
    isParent,
    isPaywallOpen,
    setIsPaywallOpen,
    isParentGateOpen,
    setIsParentGateOpen,
    error,
    setError,
    loading,
    setLoading,
    parts,
    setParts,
    generated,
    setGenerated,
    practiceFeedback,
    setPracticeFeedback,
    practiceSaved,
    setPracticeSaved,
    practiceAdvanced,
    setPracticeAdvanced,
    charName,
    setCharName,
    charShape,
    setCharShape,
    charVibe,
    setCharVibe,
    styleId,
    setStyleId,
    story,
    setStory,
    comicBubbles,
    setComicBubbles,
    detectivePick,
    setDetectivePick,
    journalText,
    setJournalText,
    promptLab,
    setPromptLab,
    paletteColors,
    setPaletteColors,
    practiceOrder,
    setPracticeOrder,
    answers,
    setAnswers,
    answerFeedback,
    setAnswerFeedback,
    checkingQuestionId,
    setCheckingQuestionId,
    lastActiveQuestionId,
    setLastActiveQuestionId,
    liveStars,
    setLiveStars,
    starBurst,
    setStarBurst,
    checkResult,
    setCheckResult,
    busy,
    setBusy,
    refAssetIds,
    setRefAssetIds,
    sketchDataUrl,
    setSketchDataUrl,
    reviewMode,
    setReviewMode,
    offlineManifest,
    setOfflineManifest,
    authoritativeLessonId,
    setAuthoritativeLessonId,
    promptText,
    isAikiRuleJourney,
    isIslandJourney,
    is5StageJourney,
    ruleId,
    effectiveCourseId,
    ruleData,
    hydratedLearnCards,
    visibleLearnCards,
    studioConfig,
    studioCharacterName,
    studioLockedFeatures,
    panels,
    gameStation,
    practiceStation,
    practiceSteps,
    practiceCriteria,
    orderingCards,
    effectivePracticeOrder,
    handleSlideChange,
    handlePlayStateChange,
    resetLocal,
    recoverCurrentPhase,
    handleAikiFinish,
    persistJourneyStage,
    handleVideoCompleted,
    handleSelectOption,
    selectChip,
    practiceReady,
    advanceFromLearn,
    advanceFromGame,
    savePractice,
    advanceFromPractice,
    submitCheck,
    chooseCheckAnswer,
    allCheckAnswersCorrect,
    currentLearnVideoUrl,
    currentLearnVideoTitle,
    questId,
    routeCourseId,
  }
}
