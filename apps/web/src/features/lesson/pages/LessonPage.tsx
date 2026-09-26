import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { BookOpen, BrainCircuit, Check, ChevronLeft, ChevronRight, Clock3, Gamepad2, Lightbulb, MessageSquareText, MoveRight, PencilLine, Play, Printer, ScanSearch, ShieldCheck, Sparkles, Square, Star, Target, Timer, Trophy, Volume2, ZoomIn } from 'lucide-react'
import {
  ZicoDrawingFallback,
  SonetDrawingFallback,
  AiWarehouseVisual,
  KidBrainVisual,
  CreativeKnightBadgeVisual,
  AikiPictureZoomModal,
  AikiPosterModal,
  type ZoomImageData,
} from '@/features/lesson/components/AikiRuleVisuals'

import {
  isAikiRuleJourney as checkIsAikiRule,
  extractRuleNumber,
  AIKI_MODULE_0_COURSE_ID,
} from '@/features/lesson/lib/rule-journey-identifiers'
import { findIslandCurriculum } from '@/features/lesson/data/island-curriculum-registry'
import { getAikiStudioConfig } from '@/features/lesson/data/aiki-studio-configs'
import type { AikiRule } from '@/features/rules/types'
import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'
import {
  AIKI_RULE_STAGE_METAS,
  parseVersusOption,
  parseComicDialogue,
  type ParsedDialogue,
  type DialogueLine,
} from '@/features/teacher/lib/authoring'
import type { Gesture } from '@/features/mee-rig/hooks/useMeeCatSpeech'
import {
  ART_STYLES,
  CHARACTER_SHAPES,
  CHARACTER_VIBES,
  type ArtStyleId,
  type CharacterShapeId,
  type CharacterVibeId,
} from '@/shared/lib/creation/creative'
import {
  assemblePrompt,
  isPromptComplete,
  SLOT_LABELS,
} from '@/shared/lib/creation/prompt'
import {
  STORY_ENDINGS,
  STORY_OPENINGS,
  STORY_PROBLEMS,
  storyToPanelHints,
} from '@/shared/lib/creation/story'
import {
  type PromptChip,
  type PromptParts,
  type PromptSlotKey,
} from '@/shared/lib/creation/types'
import { Button } from '@/shared/components/ui/Button'
import { ApiError, api, clearApiCache, type QuestDetail } from '@/shared/lib/api'
import { clearWorldPageCache, findCourseByIdentifier, isUserTestingUnlocked } from '@/features/world/pages/WorldPage'
import { learningApi, lessonStageIndexFromProgress } from '@/shared/lib/learning-api'
import { clampStationStars } from '@/shared/lib/star-progress'
import { cn } from '@/shared/lib/cn'
import { designerAssets, styleImage } from '@/shared/config/assets'
import {
  EMPTY_PROMPT_LAB,
  promptLabError,
  strongPrompt,
  type PromptLabValue,
} from '@/features/lesson/lib/prompt-lab-state'
import type { GameEvidence } from '@/features/lesson/components/CurriculumGame'
import type { GameHint } from '@/features/lesson/components/games/types'

const LessonJourneyRenderer = React.lazy(() => import('@/features/lesson/components/LessonJourneyRenderer'))
const RuleLessonJourneyRenderer = React.lazy(() => import('@/features/lesson/components/RuleLessonJourneyRenderer'))

import { NavWorldIcon } from '@/shared/components/icons/KidNavIcons'
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
import {
  resolvePracticeReview,
  type PracticePreview,
  type PracticeResult,
} from '@/features/lesson/lib/practice-result'
import {
  cachedOfflineManifest,
  queueOfflineProgress,
  type OfflineManifest,
} from '@/features/lesson/lib/offline-learning'
import type { Phase, PoseType } from '@/features/lesson/components/LessonInteractiveSidebar'
import { LessonCelebrationModal } from '@/features/lesson/components/LessonCelebrationModal'
import { CoursePaywallModal } from '@/features/lesson/components/CoursePaywallModal'
import { ParentGateModal } from '@/features/parent/components/ParentGateModal'
import { useAuth } from '@/shared/store/auth'
import { LessonNavigationHeader } from '@/features/lesson/components/LessonNavigationHeader'
import type { LearnCardDraft } from '@/features/teacher/lib/authoring'
import { useAikiSituationNarrator } from '@/features/lesson/hooks/useAikiSituationNarrator'

type PlayState = 'idle' | 'playing' | 'ended'

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
const AikiRuleVideoPlayer = React.lazy(() => import('@/features/lesson/components/AikiRuleVideoPlayer').then(m => ({ default: m.AikiRuleVideoPlayer })))
const AikiRuleQuiz = React.lazy(() => import('@/features/lesson/components/AikiRuleQuiz').then(m => ({ default: m.AikiRuleQuiz })))
const RefMediaPicker = React.lazy(() => import('@/features/lesson/components/RefMediaPicker').then(m => ({ default: m.RefMediaPicker })))
const SketchCanvas = React.lazy(() => import('@/features/lesson/components/SketchCanvas').then(m => ({ default: m.SketchCanvas })))
const OrderingPractice = React.lazy(() => import('@/features/lesson/components/OrderingPractice').then(m => ({ default: m.OrderingPractice })))
const PromptLab = React.lazy(() => import('@/features/lesson/components/PromptLab').then(m => ({ default: m.PromptLab })))
const CardBalancePractice = React.lazy(() => import('@/features/lesson/components/CardBalancePractice').then(m => ({ default: m.CardBalancePractice })))
const LectureVideo = React.lazy(() => import('@/features/lesson/components/LectureVideo').then(m => ({ default: m.LectureVideo })))


// These workshops can continue from course-created work only; the API verifies ownership.
const GEN_KINDS = new Set(['ai_pick', 'video', 'chips', 'character'])

const emptyStory = {
  opening: '',
  problem: '',
  ending: '',
  title: 'Truyện của con',
}



const PHASES = [
  { id: 'learn' as const, label: 'Khám phá', description: 'Xem và hiểu', icon: BookOpen },
  { id: 'game' as const, label: 'Thử cùng Mee', description: 'Luyện có hướng dẫn', icon: Gamepad2 },
  { id: 'practice' as const, label: 'Tự tay làm', description: 'Thực hành Studio', icon: PencilLine },
  { id: 'check' as const, label: 'Thử thách', description: 'Kiểm tra cuối trạm', icon: ShieldCheck },
]

const PHASE_ORDER = ['learn', 'game', 'practice', 'check', 'done']

export function hydrateAikiRuleCard(card: QuestDetail['learnCards'][number]): QuestDetail['learnCards'][number] {
  const encodedItem = card.visualItems?.find((item) => item.label === '__AIKI_RULE_STAGE__')
  if (encodedItem) {
    try {
      const meta = JSON.parse(encodedItem.text)
      const visualItems = card.visualItems?.filter((item) => item.label !== '__AIKI_RULE_STAGE__')
      return {
        ...card,
        ...meta,
        visualItems,
      }
    } catch {
      /* ignore and fallback to tip */
    }
  }

  if (card.tip && card.tip.includes('__AIKI_RULE_STAGE__')) {
    const match = card.tip.match(/<!--__AIKI_RULE_STAGE__:(.*?)-->/)
    if (match) {
      try {
        const meta = JSON.parse(match[1])
        return {
          ...card,
          ...meta,
        }
      } catch {
        return card
      }
    }
  }

  return card
}

export function createAikiRuleCardsFromData(rule: AikiRule): QuestDetail['learnCards'] {
  return [
    // Chặng 0: Tình huống
    {
      id: `rule-${rule.id}-situation`,
      title: `1. Tình huống: ${rule.shortTitle}`,
      kind: 'situation',
      body: rule.slides[0]?.dialogue || 'Cùng lắng nghe tình huống nhé!',
      tip: rule.akiTip,
      imageUrl: rule.slides[0]?.image || rule.posterImage,
      dialogueLines: rule.slides.map((s, idx) => ({
        id: `d-${idx}`,
        speaker: s.speaker.toLowerCase().includes('sonet') ? 'sonet' : s.speaker.toLowerCase().includes('zico') ? 'zico' : 'aki',
        role: s.speaker.toLowerCase().includes('sonet') ? 'right' : s.speaker.toLowerCase().includes('zico') ? 'left' : 'center',
        text: s.dialogue,
      })),
      enabledModules: ['images', 'dialogue'],
      mee: {
        gesture: 'presentation',
        readText: rule.slides[0]?.dialogue || 'Cùng lắng nghe tình huống nhé!',
      },
    },
    // Chặng 1: Thử tài
    {
      id: `rule-${rule.id}-riddle`,
      title: '2. Thử tài phản xạ',
      kind: 'aiki-riddle',
      body: rule.questions[0]?.prompt || 'Bức tranh nào thể hiện đúng quy tắc?',
      tip: rule.questions[0]?.hint,
      optionImages: [
        rule.slides[1]?.image || `/assets/aiki-rules/rule${rule.id}_opt_a.webp`,
        rule.slides[2]?.image || `/assets/aiki-rules/rule${rule.id}_opt_b.webp`,
      ],
      optionLabels: [
        rule.questions[0]?.options[0] || 'Phương án A',
        rule.questions[0]?.options[1] || 'Phương án B',
      ],
      optionDescs: [
        rule.questions[0]?.hint || 'Phương án A',
        rule.questions[0]?.successFeedback || 'Phương án B',
      ],
      enabledModules: ['versus-ab'],
      mee: {
        gesture: 'think',
        readText: rule.questions[0]?.prompt || 'Con hãy chọn bức tranh đúng nhé!',
      },
    },
    // Chặng 2: Poster Quy tắc Vàng
    {
      id: `rule-${rule.id}-rule`,
      title: '3. Poster Quy tắc Vàng',
      kind: 'rule',
      imageUrl: rule.posterImage,
      body: rule.audioVoiceText || rule.title,
      tip: rule.akiTip,
      enabledModules: ['poster'],
      mee: {
        gesture: 'idea',
        readText: rule.audioVoiceText || rule.title,
      },
    },
    // Chặng 3: Giải thích & So sánh
    {
      id: `rule-${rule.id}-explanation`,
      title: '4. So sánh cùng AIKI',
      kind: 'explanation',
      compareData: {
        leftTitle: 'Kho Dữ Liệu Của AI',
        leftText: rule.compareMindset?.aiWarehouse || 'AI chỉ lấy những hình ảnh quen thuộc trong kho hàng ngàn mẫu có sẵn. Ai gõ câu giống nhau thì kết quả cũng giống hệt nhau.',
        rightTitle: 'Bộ Não Sáng Tạo Của Con',
        rightText: rule.compareMindset?.kidMind || 'Chỉ có con mới có kỷ niệm riêng, cảm xúc thật, gia đình và sự tưởng tượng độc đáo mà AI không thể tự nghĩ ra được!',
        leftImage: '/assets/aiki-rules/aiki_compare_ai_warehouse.webp',
        rightImage: '/assets/aiki-rules/aiki_compare_kid_mind.webp',
      },
      compareImages: {
        left: '/assets/aiki-rules/aiki_compare_ai_warehouse.webp',
        right: '/assets/aiki-rules/aiki_compare_kid_mind.webp',
      },
      enabledModules: ['compare'],
      mee: {
        gesture: 'point-left',
        readText: 'Kho dữ liệu AI chỉ có mẫu quen thuộc, còn ý tưởng độc đáo nằm trong đầu con!',
      },
    },
    // Chặng 4: Cam kết
    {
      id: `rule-${rule.id}-closing`,
      title: '5. Cam kết Hiệp Sĩ',
      kind: 'closing',
      imageUrl: rule.posterImage,
      body: rule.knightCommitment || 'Con cam kết luôn dùng ý tưởng độc đáo của riêng mình!',
      enabledModules: ['poster'],
      mee: {
        gesture: 'celebrate',
        readText: 'Chúc mừng Hiệp Sĩ Sáng Tạo mới của Xưởng AIKI!',
      },
    },
  ] as QuestDetail['learnCards']
}

export function LessonPage() {
  const {
    courseId: routeCourseId,
    lessonId: routeLessonId,
    ruleId: routeRuleId,
    questId: routeQuestId,
  } = useParams<{
    courseId?: string
    lessonId?: string
    ruleId?: string
    questId?: string
  }>()

  const effectiveQuestId =
    routeLessonId ||
    (routeRuleId ? (routeRuleId.startsWith('rule-') ? routeRuleId : `rule-${routeRuleId}`) : '') ||
    routeQuestId ||
    ''

  const questId = effectiveQuestId
  const navigate = useNavigate()
  const location = useLocation()
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

  // Memoized callbacks for AikiRuleVideoPlayer & interactive controls
  const handleSlideChange = useCallback((index: number) => {
    setAikiRuleStage(index)
  }, [])

  const handlePlayStateChange = useCallback((playing: boolean) => {
    setIsVideoPlaying(playing)
  }, [])

  const resetLocal = useCallback(() => {
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

  function recoverCurrentPhase(error: unknown): boolean {
    if (!(error instanceof ApiError) || error.status !== 409) return false
    const body = error.body
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
    let cancelled = false
    resetLocal()
    setLoading(true)



    void (async () => {
      const localRuleLesson = questId.startsWith('rule-') || questId === 'aiki-rules'
      const islandCurriculumPromise = questId.startsWith('bai-')
        ? import('@/features/lesson/data/island-curriculum-registry')
            .then((module) => module.findIslandCurriculum({ id: questId, slug: questId }))
        : Promise.resolve(undefined)
      if (!localRuleLesson && questId.startsWith('bai-')) {
        try {
          const pathway = await learningApi.getPathway()
          const course = routeCourseId
            ? findCourseByIdentifier(pathway.courses, routeCourseId)
            : undefined
          const isUnlocked = isUserTestingUnlocked()
          if (!isUnlocked && (!course || (!course.enrolled && course.status !== 'completed'))) {
            setIsPaywallOpen(true)
            setLoading(false)
            return
          }
        } catch (error) {
          if (!cancelled) {
            setError(error instanceof Error ? error.message : 'Chưa xác minh được quyền vào khóa học.')
            setLoading(false)
          }
          return
        }
      }

      if (questId.startsWith('rule-') || questId === 'aiki-rules') {
        const rId = parseInt(questId.replace(/[^0-9]/g, '') || '1', 10) || 1
        const rData = AIKI_RULES_DATA.find((r) => r.id === rId) || AIKI_RULES_DATA[0]
        let authoritativeLessonId = questId

        // Rule pages use locally-authored presentation content, but progress
        // must be opened and committed against the real LMS lesson identity.
        // Sending the route alias ("rule-1") directly previously allowed the
        // reward screen to render while no authoritative progress was saved.
        try {
          const pathway = await learningApi.getPathway()
          if (cancelled) return
          const course = findCourseByIdentifier(pathway.courses, routeCourseId || 'dao-1')
          const station = course?.stations?.find((row) =>
            row.slug === questId ||
            row.id === questId ||
            row.order === rId ||
            extractRuleNumber(row) === rId,
          )
          authoritativeLessonId = station?.id?.trim() || questId

          const opened = await learningApi.openLesson(authoritativeLessonId)
          if (cancelled) return
          const openedStars = clampStationStars(opened.progress.stars)
          setLiveStars(openedStars)
          setResumeStageIndex(lessonStageIndexFromProgress(opened.progress))
          if (opened.progress.status === 'completed') {
            setPhase('done')
            setCheckResult({
              stars: openedStars,
              message: 'Con đã hoàn thành quy tắc này. Tiến trình đã được lưu trên hệ thống.',
              nextQuestId: rId < 10 ? `rule-${rId + 1}` : null,
            })
          } else if (
            opened.progress.phase === 'game' ||
            opened.progress.phase === 'practice' ||
            opened.progress.phase === 'check'
          ) {
            setPhase(opened.progress.phase)
          }
        } catch (progressError) {
          if (!cancelled) {
            setError(
              progressError instanceof Error
                ? `Chưa kết nối được tiến trình LMS: ${progressError.message}`
                : 'Chưa kết nối được tiến trình LMS. Bài học sẽ không được báo hoàn thành cho tới khi lưu thành công.',
            )
          }
        }

        setQuest({
          id: authoritativeLessonId,
          courseId: 'aiki-rules',
          order: rId,
          title: `Quy tắc ${rId}: ${rData.shortTitle}`,
          duration: `${rData.durationSec}s`,
          hook: rData.title,
          goals: [rData.goal],
          learnCards: createAikiRuleCardsFromData(rData),
          stations: { stations: [] },
          practiceKind: 'chips',
          check: rData.questions.map((q) => ({
            id: String(q.id),
            question: q.prompt,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.successFeedback || q.hint || 'Quy tắc vàng AIKI',
          })),
        } as any)
        setLoading(false)
        return
      }

      const islandCurriculum = await islandCurriculumPromise
      if (islandCurriculum) {
        let authoritativeLessonId = islandCurriculum.id || questId
        try {
          const pathway = await learningApi.getPathway()
          if (cancelled) return
          const course = routeCourseId
            ? findCourseByIdentifier(pathway.courses, routeCourseId)
            : pathway.courses.find((row) => row.id === `dao-${islandCurriculum.islandNumber}`)
          const station = course?.stations?.find((row) =>
            row.slug === questId ||
            row.id === questId ||
            row.title.trim().toLocaleLowerCase('vi') === islandCurriculum.title.trim().toLocaleLowerCase('vi'),
          )
          authoritativeLessonId = station?.id?.trim() || authoritativeLessonId

          const opened = await learningApi.openLesson(authoritativeLessonId)
          if (cancelled) return
          setLiveStars(clampStationStars(opened.progress.stars))
          setResumeStageIndex(lessonStageIndexFromProgress(opened.progress))
        } catch (progressError) {
          if (!cancelled) {
            setError(
              progressError instanceof Error
                ? `Chưa khôi phục được chặng đang học: ${progressError.message}`
                : 'Chưa khôi phục được chặng đang học từ hệ thống.',
            )
          }
        }
        setQuest({
          id: authoritativeLessonId,
          slug: questId,
          courseId: (islandCurriculum as any).courseId || (routeCourseId && !routeCourseId.startsWith('dao-') ? routeCourseId : `dao-${islandCurriculum.islandNumber}`),
          order: (islandCurriculum as any).lessonNumber || 1,
          title: islandCurriculum.title,
          duration: '180s',
          hook: islandCurriculum.journey.stage1_goal.title,
          goals: [(islandCurriculum.journey.stage1_goal as any).coreGoal || islandCurriculum.journey.stage1_goal.goalText || islandCurriculum.objective],
          learnCards: [],
          stations: { stations: [] },
          practiceKind: 'chips',
          sixStageJourney: islandCurriculum.journey,
          check: islandCurriculum.journey.stage4_quiz.questions.map((q, idx) => ({
            id: String(idx + 1),
            question: q.prompt,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation || 'Quy tắc vàng AIKI',
          })),
        } as any)
        setLoading(false)
        return
      }

      try {
        const opened = await learningApi.openLesson(questId)
        if (cancelled) return
        setQuest(opened.quest)
        const openedStars = clampStationStars(opened.progress.stars)
        setLiveStars(openedStars)
        setResumeStageIndex(lessonStageIndexFromProgress(opened.progress))

        // Resume mid-quest; completed stations open on celebrate/review
        if (opened.progress.status === 'completed') {
          setPhase('done')
          setCheckResult({
            stars: openedStars,
            message: openedStars > 0
              ? 'Con đã hoàn thành trạm này! Có thể thử lại để nâng số sao.'
              : 'Lần trước con chưa nhận được sao. Hãy thử lại phần Thử tài nhé!',
            nextQuestId: null,
          })
          // Still fetch next from course map if needed on UI
        } else if (
          opened.progress.phase === 'game' ||
          opened.progress.phase === 'practice' ||
          opened.progress.phase === 'check'
        ) {
          setPhase(opened.progress.phase)
        } else {
          setPhase('learn')
        }
      } catch (e) {
        if (!cancelled) {
          const isPaywall =
            !isUserTestingUnlocked() &&
            ((e instanceof ApiError && (e.status === 402 || e.code === 'COURSE_PURCHASE_REQUIRED' || e.code === 'LMS_ENTITLEMENT_REQUIRED' || e.code === 'CREDITS_EXHAUSTED')) ||
            (e instanceof Error && /entitlement|purchase|paid|402/i.test(e.message)))

          if (isPaywall) {
            setIsPaywallOpen(true)
          } else {
            const cached = await cachedOfflineManifest(questId)
            if (cached) {
              setOfflineManifest(cached)
              queueOfflineProgress(questId, {
                percent: 10,
                positionSeconds: 0,
                sectionId: 'offline-open',
              })
            } else {
              setError(e instanceof Error ? e.message : 'Không mở được trạm')
            }
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [questId, resetLocal])

  useEffect(() => {
    setMaxUnlockedPhase((prev) => {
      const phaseOrder = ['learn', 'game', 'practice', 'check', 'done']
      const prevIdx = phaseOrder.indexOf(prev)
      const currentIdx = phaseOrder.indexOf(phase)
      return currentIdx > prevIdx ? phase : prev
    })
  }, [phase])

  useEffect(() => {
    // rule-* and bai-* are local curriculum manifests. Sending their synthetic
    // ids to the Hub creates a guaranteed failed resume request on every phase.
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
      void api(`/api/learning/quests/${questId}/resume`, {
        method: 'PUT',
        body: JSON.stringify({
          percent: percentByPhase[phase],
          positionSeconds: 0,
          sectionId: phase,
          occurredAt,
        }),
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

  const effectiveCourseId = routeCourseId || quest?.courseId || (isAikiRuleJourney ? AIKI_MODULE_0_COURSE_ID : '') || 'aiki-rules'

  // Chuẩn hóa URL sang friendly slug nếu questId trên URL là raw UUID
  useEffect(() => {
    if (!quest || !questId) return
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(questId)
    if (!isUuid) return

    if (isAikiRuleJourney && ruleId >= 1 && ruleId <= 10) {
      navigate(`/world/${effectiveCourseId}/lesson/rule-${ruleId}`, { replace: true })
      return
    }

    const curriculum = findIslandCurriculum({
      id: quest.id,
      title: quest.title,
      slug: (quest as any).slug,
    })
    if (curriculum?.slug) {
      navigate(`/world/${effectiveCourseId}/lesson/${curriculum.slug}`, { replace: true })
    }
  }, [quest, questId, isAikiRuleJourney, ruleId, effectiveCourseId, navigate])

  // Load nextQuestId when reviewing completed station
  useEffect(() => {
    if (!quest || phase !== 'done' || checkResult?.nextQuestId) return
    if (isAikiRuleJourney && ruleId < 10) {
      setCheckResult((prev) =>
        prev
          ? { ...prev, nextQuestId: `rule-${ruleId + 1}` }
          : {
            stars: 3,
            message: 'Tiếp tục nào!',
            nextQuestId: `rule-${ruleId + 1}`,
          },
      )
      return
    }
    void (async () => {
      try {
        const p = await learningApi.getCourseProgress(quest.courseId)
        const next = p.quests.find(
          (q) =>
            q.order === quest.order + 1 &&
            (q.status === 'available' ||
              q.status === 'in_progress' ||
              q.status === 'completed'),
        )
        if (next) {
          setCheckResult((prev) =>
            prev
              ? { ...prev, nextQuestId: next.id }
              : {
                stars: 1,
                message: 'Tiếp tục nào!',
                nextQuestId: next.id,
              },
          )
        }
      } catch {
        /* ignore */
      }
    })()
  }, [quest, phase, checkResult?.nextQuestId, isAikiRuleJourney, ruleId])

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
    if (location.pathname.endsWith('/studio')) {
      setPhase('practice')
    }
  }, [location.pathname, isAikiRuleJourney])

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

  async function handleAikiFinish(customSummary?: { answers?: Array<{ questionId: string; optionIndex: number }> }) {
    if (checkResult) return true
    if (finishLessonPromiseRef.current) return finishLessonPromiseRef.current
    if (!quest) return false
    const nextRuleTarget = (isAikiRuleJourney && ruleId < 10) ? `rule-${ruleId + 1}` : null
    const answersPayload = customSummary?.answers?.length
      ? customSummary.answers
      : isAikiRuleJourney
      ? [
          {
            questionId: (quest.check && quest.check[0]?.id) || `${(quest as any).slug || quest.id}-check-1`,
            optionIndex: aikiQuizAnswer ?? -1,
          },
        ]
      : (quest.check && quest.check.length > 0)
        ? quest.check.map((q) => ({
            questionId: q.id,
            optionIndex: (answers && typeof answers[q.id] === 'number') ? answers[q.id] : -1,
          }))
        : []
    const finishPromise = (async () => {
      setBusy(true)
      try {
      const checkRes = await learningApi.submitCheck(quest.id, { answers: answersPayload })
      const confirmedStars = Math.max(0, Math.min(3, checkRes.stars))
      const celebrationMsg = isIslandJourney
        ? `Xuất sắc! Con đã hoàn thành ${quest.title} và được hệ thống ghi nhận ${confirmedStars} Sao!`
        : confirmedStars === 3
          ? 'Xuất sắc! Con đạt trọn 3 Sao. Chào mừng Hiệp Sĩ Sáng Tạo AIKI!'
          : confirmedStars === 2
            ? 'Rất tốt! Con đạt 2 Sao. Cùng tiến lên trạm tiếp theo nhé!'
            : 'Hoan hô! Kết quả của con đã được hệ thống ghi nhận. Cùng cố gắng giành 3 Sao nhé!'
      setLiveStars(confirmedStars)
      setCheckResult({
        ...checkRes,
        stars: confirmedStars,
        message: celebrationMsg,
        nextQuestId: checkRes.nextQuestId || nextRuleTarget,
      })
      setPhase('done')
      clearWorldPageCache()
      window.dispatchEvent(new CustomEvent('aikids:lesson-completed'))
      return true
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Chưa xác nhận được kết quả. Con thử lại nhé!')
        return false
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
    const progressId = quest?.id || questId
    if (!navigator.onLine || !progressId || stageCount <= 0) return
    const percent = Math.max(1, Math.min(99, Math.round(((stageIndex + 1) / stageCount) * 100)))
    setResumeStageIndex(stageIndex)
    void api(`/api/learning/quests/${progressId}/resume`, {
      method: 'PUT',
      keepalive: true,
      body: JSON.stringify({
        percent,
        positionSeconds: 0,
        sectionId: `stage-${stageIndex + 1}`,
        occurredAt: new Date().toISOString(),
      }),
    }).catch(() => {
      queueOfflineProgress(progressId, {
        percent,
        positionSeconds: 0,
        sectionId: `stage-${stageIndex + 1}`,
      })
    })
  }, [quest?.id, questId])
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

  async function advanceFromGame(
    gameEvidence: GameEvidence | { skipped: true },
  ) {
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
          kind:
            quest.practiceKind === 'chips' ? 'prompt' : quest.practiceKind,
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
        setError(
          'Sản phẩm đã được lưu, nhưng kết nối chưa mở được phần kiểm tra. Con có thể thử tiếp tục lại.',
        )
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
      window.dispatchEvent(new CustomEvent('aikids:xp-updated'))
    } catch (e) {
      if (!recoverCurrentPhase(e)) {
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

  const dynamicGuideCopy = useMemo(() => {
    if (error) {
      return {
        eyebrow: 'Mee báo lỗi',
        title: 'Oops!',
        body: error,
        pose: 'support' as const,
      }
    }

    if (phase === 'learn') {
      if (isAikiRuleJourney) {
        const stagePrompts = [
          'Cùng xem Zico và Sonet đang tranh luận điều gì nhé!',
          'Hãy giúp Mèo AIKI quan sát và chọn bức tranh đúng nhé!',
          'Cùng đọc to Quy Tắc Vàng của Xưởng AIKI nhé!',
          'Xem giải thích để hiểu vì sao quy tắc này lại quan trọng nhé!',
          'Cùng đọc lời hứa để trở thành Hiệp Sĩ Sáng Tạo nhé!',
        ]
        return {
          eyebrow: 'Mee kể con nghe',
          title: AIKI_RULE_STAGE_METAS[aikiRuleStage]?.label || 'Khám phá quy tắc',
          body: stagePrompts[aikiRuleStage] || 'Cùng học quy tắc AIKI nhé!',
          pose: 'guide' as const,
        }
      }
      if (isIslandJourney) {
        const islandStagePrompts = [
          'Con hãy lắng nghe tình huống khởi động của các bạn nhé!',
          'Quan sát 2 bức tranh bên trái và chọn phương án đúng nhất nhé!',
          'Cùng đọc to Quy Tắc Vàng của bài học này nhé!',
          'Xem đối chiếu và giải thích để nắm vững bí kíp nhé!',
          'Hoàn thành thử thách để nhận Cúp Hiệp Sĩ Sáng Tạo!',
        ]
        return {
          eyebrow: 'Trợ lý Coach Mee',
          title: AIKI_RULE_STAGE_METAS[aikiRuleStage]?.label || `Chặng ${aikiRuleStage + 1}`,
          body: islandStagePrompts[aikiRuleStage] || 'Cùng học tập cùng Coach Mee nhé!',
          pose: 'guide' as const,
        }
      }
      return {
        eyebrow: 'Mee kể con nghe',
        title: 'Khám phá điều mới',
        body: quest?.hook || 'Cùng học nhé!',
        pose: 'guide' as const,
      }
    }
    if (phase === 'game') {
      if (gameHint) {
        return {
          eyebrow: gameHint.type === 'correct' ? 'Chính xác!' : 'Mee gợi ý',
          title: gameHint.type === 'correct' ? 'Giỏi quá!' : 'Cùng thử lại!',
          body: gameHint.text,
          pose: (gameHint.type === 'correct' ? 'celebrate' : 'support') as PoseType,
        }
      }
      return {
        eyebrow: 'Thử cùng Mee',
        title: 'Chơi để ghi nhớ',
        body: gameStation?.instruction ?? 'Cứ thử từng bước nhé. Sai cũng là một cách để học!',
        pose: 'welcome' as const,
      }
    }
    if (phase === 'practice') {
      return {
        eyebrow: 'Đến lượt con',
        title: 'Tự tay sáng tạo',
        body: practiceStation?.instruction ?? 'Con hãy dùng điều vừa học để tạo sản phẩm của riêng mình.',
        pose: 'thinking' as const,
      }
    }
    if (phase === 'check') {
      if (checkingQuestionId) {
        return {
          eyebrow: 'Đang kiểm tra',
          title: 'Hồi hộp quá...',
          body: 'Chờ Mee xem lại một chút nhé!',
          pose: 'thinking' as const,
        }
      }
      if (lastActiveQuestionId && answerFeedback[lastActiveQuestionId]) {
        const fb = answerFeedback[lastActiveQuestionId]
        if (fb.correct) {
          return {
            eyebrow: 'Chính xác!',
            title: 'Giỏi quá!',
            body: fb.explanation || 'Con chọn đúng rồi!',
            pose: 'celebrate' as const,
          }
        } else {
          return {
            eyebrow: 'Chưa đúng',
            title: 'Cùng thử lại!',
            body: fb.explanation || 'Hãy đọc kỹ lại và chọn đáp án khác nhé.',
            pose: 'support' as const,
          }
        }
      }
      return {
        eyebrow: 'Thử thách cuối',
        title: 'Con làm được!',
        body: 'Đọc kỹ từng câu. Nếu chưa đúng, Mee sẽ giúp con thử lại ngay.',
        pose: 'support' as const,
      }
    }
    if (phase === 'done') {
      return {
        eyebrow: 'Hoàn thành',
        title: 'Tuyệt vời!',
        body: checkResult?.message ?? 'Mee rất tự hào về hành trình của con.',
        pose: 'celebrate' as const,
      }
    }

    return {
      eyebrow: '',
      title: '',
      body: '',
      pose: 'welcome' as const,
    }
  }, [
    error,
    phase,
    quest?.hook,
    gameStation?.instruction,
    practiceStation?.instruction,
    checkingQuestionId,
    lastActiveQuestionId,
    answerFeedback,
    checkResult?.message,
    gameHint,
    isAikiRuleJourney,
    aikiRuleStage,
  ])

  const currentInteractiveRiddle = useMemo(() => {
    if (isAikiRuleJourney && ruleData?.questions?.[0]) {
      const q = ruleData.questions[0]
      return {
        id: q.id,
        question: q.prompt,
        options: q.options,
        answer: q.correctIndex,
        explanation: q.successFeedback,
        meeHint: q.hint,
        hints: [
          'Tầng 1: Quan sát kỹ số lượng chi tiết hoặc hành động trong hai bức tranh bên trái.',
          'Tầng 2: Loại bỏ phương án vẽ chung chung hoặc vi phạm quy tắc đạo đức.',
          q.hint || 'Tầng 3: Tả càng rõ, AI vẽ càng đúng!',
        ],
      }
    }
    if (quest?.check?.[0]) {
      const q = quest.check[0] as unknown as {
        id: string
        question: string
        options: string[]
        correctIndex?: number
        explanation?: string
      }
      return {
        id: q.id,
        question: q.question,
        options: q.options,
        answer: q.correctIndex ?? 0,
        explanation: q.explanation || quest.hook,
        meeHint: quest.hook,
        hints: [
          'Tầng 1: Hãy nhìn kỹ chủ thể chính và bối cảnh của câu hỏi.',
          'Tầng 2: Đọc kỹ từng từ khóa để tìm ra phương án đầy đủ nhất.',
          `Tầng 3: ${quest.hook || 'Tả càng rõ, AIKI vẽ càng đúng!'}`,
        ],
      }
    }
    return undefined
  }, [isAikiRuleJourney, ruleData, quest])

  if (loading) {
    return (
      <p className="animate-pulse text-muted" aria-live="polite">
        Đang mở trạm…
      </p>
    )
  }

  if (isPaywallOpen && !quest) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center p-6 text-center">
        <CoursePaywallModal
          open={isPaywallOpen}
          courseTitle={routeCourseId || effectiveCourseId}
          onClose={() => {
            setIsPaywallOpen(false)
            navigate(effectiveCourseId ? `/world/${effectiveCourseId}` : '/world')
          }}
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

  if (error && !quest) {
    return (
      <div className="ui-card page-enter p-6">
        <p className="text-danger">{error}</p>
        <p className="mt-2 text-sm text-muted">
          Nếu trạm bị khóa, hãy hoàn thành trạm trước trên bản đồ.
        </p>
        <Link to={`/world/${effectiveCourseId}`} className="mt-4 inline-block">
          <Button variant="secondary">
            <NavWorldIcon size={18} aria-hidden="true" />
            Về bản đồ
          </Button>
        </Link>
      </div>
    )
  }

  if (!quest && offlineManifest) {
    return <OfflineLessonView manifest={offlineManifest} />
  }

  if (!quest) {
    return <p className="text-muted">Không tìm thấy trạm.</p>
  }

  // ── TEMPLATE 1: 10 Quy Tắc Vàng AIKI (Module 0 - 3 Chặng Chuẩn: VIDEO ➔ QUIZ ➔ REWARD) ──
  if (isAikiRuleJourney && quest) {
    return (
      <Suspense fallback={<p className="animate-pulse text-muted" aria-live="polite">Đang mở hành trình…</p>}>
        <RuleLessonJourneyRenderer key={quest.id} quest={quest} ruleId={ruleId} effectiveCourseId={effectiveCourseId} liveStars={liveStars} initialStageIndex={resumeStageIndex} onFinish={handleAikiFinish} onStageChange={persistJourneyStage} />
      </Suspense>
    )
  }

  // ── TEMPLATE 2: Khóa Học Đảo AIKids (Module 1 -> Module 5 - 6 Chặng Bố Cục 2 Cột Chuẩn) ──
  if (isIslandJourney && quest) {
    return (
      <Suspense fallback={<p className="animate-pulse text-muted" aria-live="polite">Đang mở hành trình…</p>}>
        <LessonJourneyRenderer key={quest.id} mode="island" quest={quest} ruleId={ruleId} effectiveCourseId={effectiveCourseId} liveStars={liveStars} initialStageIndex={resumeStageIndex} onFinish={handleAikiFinish} onStageChange={persistJourneyStage} />
      </Suspense>
    )
  }

  const allCheckAnswersCorrect =
    quest.check.length > 0 &&
    quest.check.every((question) => answerFeedback[question.id]?.correct)

  const currentLearnVideoUrl = quest?.videoUrl || visibleLearnCards[0]?.videoUrl
  const currentLearnVideoTitle = visibleLearnCards[0]?.title || quest?.title

  // ── TEMPLATE 1: Quy Tắc Vàng (Module 0 - isAikiRuleJourney) & Khóa học cơ bản ──
  return (
    <div
      className={cn(
        "page-enter flex flex-col rounded-3xl",
        isAikiRuleJourney
          ? "min-h-[calc(100dvh-4rem)] xl:h-full xl:max-h-full flex flex-col p-1.5 sm:p-2.5 rounded-3xl bg-slate-50/60 xl:overflow-hidden"
          : "min-h-[calc(100dvh-4rem)] bg-slate-50/60 p-2 sm:p-3 lg:p-4"
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
                      "flex min-h-11 items-center gap-2 px-3 py-1.5 rounded-2xl border-2 text-sm font-bold transition-all",
                      isActive ? "bg-brand-50 border-brand-500 text-brand-700 shadow-sm"
                               : isUnlocked ? "bg-white border-border text-text hover:border-brand-200"
                                            : "bg-surface border-transparent text-muted opacity-60 cursor-not-allowed"
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

      <main className={cn(
        "min-h-0 flex-1 relative overflow-y-auto hidden-scrollbar pr-1",
        !isAikiRuleJourney && "lesson-stage-main pb-10",
        isSidebarCollapsed && "w-full max-w-[1024px] mx-auto",
        isAikiRuleJourney && "flex flex-col"
      )}>
        {phase === 'learn' && (
        <div className={cn("flex flex-col animate-fade-up", isSidebarCollapsed ? "w-full max-w-[1024px] mx-auto" : "w-full", isAikiRuleJourney ? "gap-2 sm:gap-2.5 flex-1 min-h-0" : "gap-6")}>
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
                      "flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer active:scale-95",
                      isActive && "bg-brand-500 text-white shadow-clay ring-2 sm:ring-4 ring-brand-200 scale-[1.02]",
                      isDone && "bg-mint-500 text-white shadow-2xs hover:bg-mint-600",
                      !isActive && !isDone && "bg-slate-50 border border-slate-200 text-slate-600 hover:border-brand-300"
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
            <React.Suspense fallback={<div className="p-4 text-center text-sm font-bold text-slate-400">Đang tải...</div>}>
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
            </React.Suspense>
          )}

          {/* Video bài giảng to bản 16:9 sắc nét đặt ở Mainbar cho khóa học thông thường */}
          {!is5StageJourney && currentLearnVideoUrl && (
            <div className="rounded-3xl border-2 border-brand-200 bg-white p-3 sm:p-4 shadow-clay overflow-hidden">
              <div className="flex items-center gap-2 mb-2 text-xs font-black text-brand-700 uppercase tracking-wider">
                <Play size={15} className="text-brand-600" />
                <span>Video bài giảng trạm {quest.order || ''}</span>
              </div>
              <React.Suspense fallback={<div className="p-4 text-center text-sm font-bold text-slate-400">Đang tải...</div>}>
                <LectureVideo title={currentLearnVideoTitle || ''} url={currentLearnVideoUrl} />
              </React.Suspense>
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
                  <Suspense fallback={<div className="h-32 animate-pulse rounded-2xl bg-slate-100" />}>
                  <StudentStageBlocksView
                    key={card.id || currentStageIndex}
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
                        text: fullText || "Các cậu ơi, cùng lắng nghe tình huống này nhé!",
                        gesture: "presentation",
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
                        text: "Xuất sắc! Con đã nắm trọn Quy tắc Vàng này rồi!",
                        gesture: "celebrate",
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
                          text: isIslandJourney ? "Tuyệt vời! Con đã hoàn thành xuất sắc bài học này!" : "Tuyệt vời! Chào mừng Hiệp Sĩ Sáng Tạo mới của Xưởng AIKI!",
                          gesture: "celebrate",
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
          {/* Game header instruction */}
          <div className="mb-4">
            <div className="companion-bubble" style={{ maxWidth: 'none', width: '100%' }}>
              <p className="text-sm font-bold">
                {gameStation.instruction ?? 'Chơi một lượt để ghi nhớ ý chính của bài! Không sao nếu thử nhiều lần. 😊'}
              </p>
            </div>
          </div>
          <React.Suspense
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
          </React.Suspense>
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
            <React.Suspense
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
            </React.Suspense>
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
                  
                  {/* Result Builder Header */}
                  <div className="bg-white rounded-[1.5rem] p-5 border-[3px] border-brand-200 shadow-sm relative">
                    <p className="text-xs font-black uppercase tracking-wider text-brand-400 mb-2">Thần chú của con</p>
                    <p className="text-lg font-bold text-text leading-relaxed">
                      {isPromptComplete(parts) ? promptText : (
                        <span className="text-muted">Hãy chọn thẻ bài để ghép thành câu lệnh nhé...</span>
                      )}
                    </p>
                  </div>

                  {/* Chips Selection */}
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
                                    : cn('bg-white hover:-translate-y-1 hover:shadow-sm border-b-[5px]', tone.border, tone.text)
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
                    )})}
                  </div>
                </div>
              )}

              {quest.practiceKind === 'character' && (
                <>
                  <div className="overflow-hidden rounded-2xl border-2 border-border">
                    <img
                      src={designerAssets.workshop.character}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                      className="h-28 w-full object-cover opacity-90"
                    />
                  </div>
                  <p className="font-extrabold">Xưởng nhân vật · AIkid</p>
                  <p className="text-sm text-muted">
                    Chọn loại & tính cách (không dùng tên thật).
                  </p>
                  <div>
                    <p className="mb-2 text-sm font-bold text-muted">
                      Loại nhân vật
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {CHARACTER_SHAPES.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className={cn(
                            'chip',
                            charShape === s.id && 'chip-active',
                          )}
                          onClick={() => setCharShape(s.id)}
                        >
                          {s.emoji} {s.labelVi}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-bold text-muted">
                      Tính cách
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {CHARACTER_VIBES.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          className={cn(
                            'chip',
                            charVibe === v.id && 'chip-active',
                          )}
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
                      {
                        key: 'opening' as const,
                        list: STORY_OPENINGS,
                        label: 'Mở đầu',
                      },
                      {
                        key: 'problem' as const,
                        list: STORY_PROBLEMS,
                        label: 'Sự cố',
                      },
                      {
                        key: 'ending' as const,
                        list: STORY_ENDINGS,
                        label: 'Kết',
                      },
                    ] as const
                  ).map((block) => (
                    <div key={block.key}>
                      <p className="mb-2 text-sm font-bold text-muted">
                        {block.label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {block.list.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className={cn(
                              'chip',
                              story[block.key] === item.label && 'chip-active',
                            )}
                            onClick={() =>
                              setStory((s) => ({
                                ...s,
                                [block.key]: item.label,
                              }))
                            }
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
                  <p className="font-extrabold">
                    Ảnh nào đúng ý hơn? (AI có thể sai!)
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[0, 1].map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setDetectivePick(i as 0 | 1)}
                        className={cn(
                          'rounded-2xl border-4 p-2 transition',
                          detectivePick === i
                            ? 'border-mint-400 scale-[1.02]'
                            : 'border-border',
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
                  <p className="font-extrabold">
                    Truyện 4 khung — thêm lời thoại ngắn
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {panels.map((p, idx) => (
                      <div
                        key={p.panel}
                        className="rounded-2xl border-2 border-border p-3"
                      >
                        <p className="text-xs font-bold text-brand-500">
                          Khung {p.panel}: {p.label}
                        </p>
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

              {(quest.practiceKind === 'video' ||
                quest.practiceKind === 'intro') && (
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

              <React.Suspense fallback={<div className="p-4 text-center text-sm font-bold text-slate-400">Đang tải...</div>}>
                {GEN_KINDS.has(quest.practiceKind) && (
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
                        `Thẻ: ${card.name} | Sức ${card.power}, Nhanh ${card.speed}, Khéo ${card.agility} | Kỹ năng: ${card.skill}`
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
              </React.Suspense>

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
                  <p className="font-extrabold">
                    Chọn 3 màu cho thế giới của con
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {paletteColors.map((c, i) => (
                      <label
                        key={i}
                        className="flex flex-col items-center gap-1 text-xs font-bold"
                      >
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
                <video
                  src={generated.url}
                  controls
                  playsInline
                  preload="metadata"
                  className="max-h-80 w-full bg-black"
                >
                  Trình duyệt chưa phát được video này.
                </video>
              ) : (
                <img
                  src={generated.url}
                  alt={generated.title}
                  className="max-h-64 w-full bg-brand-50 object-contain"
                />
              )}
              <p className="p-2 text-center text-sm font-bold">
                {generated.title}
              </p>
            </div>
          )}

          {practiceSaved && practiceFeedback && (
            <div
              className="rounded-2xl border-2 border-mint-300 bg-mint-100/50 p-4"
              role="status"
            >
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
            <div className="flex items-center gap-2">
            <div>
              <p className="font-extrabold text-lg">Kiểm tra nhanh</p>
              <p className="text-xs text-muted">Chọn từng đáp án để biết ngay đúng hay chưa.</p>
            </div>
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
                          {/* Dark gradient overlay for better text contrast */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                          
                          <div className="absolute top-3 left-3">
                            <span className={cn(
                              'inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm font-extrabold shadow-sm',
                              answers[q.id] === idx ? 'bg-brand-500 text-white' : 'bg-white/90 text-brand-700 backdrop-blur-sm'
                            )}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                          </div>
                          
                          {/* Selection indicator overlay */}
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
                            answers[q.id] === idx ? 'bg-brand-500 text-white' : 'bg-brand-50 text-brand-600'
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

function OfflineLessonView({ manifest }: { manifest: OfflineManifest }) {
  const [completed, setCompleted] = useState(false)
  const cards = manifest.lesson.learnCards
  const stations = manifest.lesson.stations
  function stringValue(value: unknown) {
    return typeof value === 'string' ? value : ''
  }
  function complete() {
    queueOfflineProgress(manifest.questId, {
      percent: 100,
      positionSeconds: 0,
      sectionId: 'offline-complete',
    })
    setCompleted(true)
  }
  return (
    <div className="page-enter mx-auto flex max-w-4xl flex-col gap-4">
      <header className="ui-card p-5">
        <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500">
          Bản học ngoại tuyến
        </p>
        <h1 className="font-display text-2xl">{manifest.lesson.title}</h1>
        <p className="mt-2 text-sm text-muted">{manifest.lesson.hook}</p>
        <p className="mt-3 rounded-xl bg-sun-50 px-3 py-2 text-sm text-warning">
          Đang mất kết nối. Nội dung đã lưu không chứa đáp án; tiến độ sẽ đồng bộ
          theo sự kiện có mã riêng khi mạng trở lại.
        </p>
      </header>
      <section className="grid gap-3 sm:grid-cols-2">
        {cards.map((card, index) => (
          <article key={stringValue(card.id) || index} className="ui-card p-4">
            <p className="font-bold">{stringValue(card.title) || `Nội dung ${index + 1}`}</p>
            <p className="mt-2 text-sm leading-relaxed">
              {stringValue(card.body) || stringValue(card.content)}
            </p>
            {stringValue(card.tip) && (
              <p className="mt-2 text-xs text-muted">Gợi ý: {stringValue(card.tip)}</p>
            )}
          </article>
        ))}
      </section>
      <section className="ui-card p-5">
        <h2 className="font-display text-xl">Hoạt động đã lưu</h2>
        <div className="mt-3 space-y-3">
          {stations.map((station, index) => (
            <article key={stringValue(station.id) || index} className="rounded-2xl bg-sky-50 p-4">
              <p className="font-bold">
                {stringValue(station.title) || `Hoạt động ${index + 1}`}
              </p>
              <p className="mt-1 text-sm">
                {stringValue(station.instruction) || stringValue(station.content)}
              </p>
            </article>
          ))}
        </div>
        <Button className="mt-4 w-full" disabled={completed} onClick={complete}>
          {completed ? 'Đã lưu mốc hoàn thành để đồng bộ' : 'Đánh dấu đã xem xong ngoại tuyến'}
        </Button>
      </section>
    </div>
  )
}
