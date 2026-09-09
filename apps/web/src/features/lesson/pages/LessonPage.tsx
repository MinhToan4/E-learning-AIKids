import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
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
import { ApiError, api, type QuestDetail } from '@/shared/lib/api'
import { learningApi } from '@/shared/lib/learning-api'
import { cn } from '@/shared/lib/cn'
import { designerAssets, styleImage } from '@/shared/config/assets'
import { RefMediaPicker } from '@/features/lesson/components/RefMediaPicker'
import { SketchCanvas } from '@/features/lesson/components/SketchCanvas'
import { OrderingPractice } from '@/features/lesson/components/OrderingPractice'
import {
  EMPTY_PROMPT_LAB,
  PromptLab,
  promptLabError,
  strongPrompt,
  type PromptLabValue,
} from '@/features/lesson/components/PromptLab'
import {
  CurriculumGame,
  type GameEvidence,
} from '@/features/lesson/components/CurriculumGame'
import type { GameHint } from '@/features/lesson/components/games/types'
import { LectureVideo } from '@/features/lesson/components/LectureVideo'

import { NavWorldIcon } from '@/shared/components/icons/KidNavIcons'
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
import { AdventureModal } from '@/shared/components/ui/AdventureModal'
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
import { LeftPhaseSidebar, type Phase, type PoseType } from '@/features/lesson/components/LeftPhaseSidebar'
import { useAikiSituationNarrator } from '@/features/lesson/hooks/useAikiSituationNarrator'

type PlayState = 'idle' | 'playing' | 'ended'

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
  { id: 'practice' as const, label: 'Tự tay làm', description: 'Tự thực hành', icon: PencilLine },
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

export function LessonPage() {
  const { questId = '' } = useParams()
  const navigate = useNavigate()
  const [quest, setQuest] = useState<QuestDetail | null>(null)
  const [phase, setPhase] = useState<Phase>('learn')
  const [gameHint, setGameHint] = useState<GameHint | null>(null)
  const [maxUnlockedPhase, setMaxUnlockedPhase] = useState<Phase>('learn')
  const [aikiRuleStage, setAikiRuleStage] = useState(0)
  const [zoomedImage, setZoomedImage] = useState<ZoomImageData | null>(null)
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false)
  const [hasAcknowledgedRule, setHasAcknowledgedRule] = useState(false)
  const [hasCommitted, setHasCommitted] = useState(false)
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
  const [manualMeeCue, setManualMeeCue] = useState<{ key: number; text: string; gesture?: Gesture } | null>(null)
  const {
    isPlaying: isNarratingSituation,
    activeSpeaker,
    speakingLineIndex,
    playSituation,
    stop: stopSituationNarrator,
  } = useAikiSituationNarrator()
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
      try {
        const start = await learningApi.startLesson(questId)
        const data = await learningApi.getLesson(questId)
        if (cancelled) return
        setQuest(data.quest)
        setLiveStars(start.progress.stars)
        // Resume mid-quest; completed stations open on celebrate/review
        if (start.progress.status === 'completed') {
          setPhase('done')
          setCheckResult({
            stars: start.progress.stars,
            message: start.progress.stars > 0
              ? 'Con đã hoàn thành trạm này! Có thể thử lại để nâng số sao.'
              : 'Lần trước con chưa nhận được sao. Hãy thử lại phần Thử tài nhé!',
            nextQuestId: null,
          })
          // Still fetch next from course map if needed on UI
        } else if (
          start.progress.phase === 'game' ||
          start.progress.phase === 'practice' ||
          start.progress.phase === 'check'
        ) {
          setPhase(start.progress.phase)
        } else {
          setPhase('learn')
        }
      } catch (e) {
        if (!cancelled) {
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
    if (!quest || !navigator.onLine) return
    const percentByPhase: Record<Phase, number> = {
      learn: 10,
      game: 35,
      practice: 65,
      check: 90,
      done: 100,
    }
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
  }, [phase, quest, questId])

  // Load nextQuestId when reviewing completed station
  useEffect(() => {
    if (!quest || phase !== 'done' || checkResult?.nextQuestId) return
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
  }, [quest, phase, checkResult?.nextQuestId])

  const promptText = useMemo(() => assemblePrompt(parts), [parts])
  const isAikiRuleJourney = Boolean(
    quest && (
      quest.id.includes('aiki') ||
      quest.id.includes('rule') ||
      quest.title.toLowerCase().includes('quy tắc') ||
      quest.learnCards.some((c) => c.visualItems?.some((item) => item.label === '__AIKI_RULE_STAGE__')) ||
      quest.learnCards.some((c) => c.tip?.includes('__AIKI_RULE_STAGE__')) ||
      quest.learnCards.length === 5 && quest.learnCards[0]?.id?.includes('situation')
    )
  )

  const hydratedLearnCards = useMemo(() => {
    if (!quest) return []
    return quest.learnCards.map(hydrateAikiRuleCard)
  }, [quest])

  const visibleLearnCards = useMemo(() => {
    if (isAikiRuleJourney) {
      const card = hydratedLearnCards[aikiRuleStage] || hydratedLearnCards[0]
      return card ? [card] : []
    }
    return hydratedLearnCards
  }, [isAikiRuleJourney, hydratedLearnCards, aikiRuleStage])

  useEffect(() => {
    stopSituationNarrator()
  }, [aikiRuleStage, phase, stopSituationNarrator])

  async function handleAikiFinish() {
    if (!quest || busy) return
    setBusy(true)
    try {
      const checkRes = await learningApi.submitCheck(quest.id, { answers: [] })
      setLiveStars(checkRes.stars)
      setCheckResult(checkRes)
      setPhase('done')
    } catch {
      setLiveStars(3)
      setCheckResult({
        stars: 3,
        message: 'Xuất sắc! Con đã trở thành Hiệp Sĩ Sáng Tạo và nắm vững Quy Tắc Vàng AIKI!',
        nextQuestId: null,
      })
      setPhase('done')
    } finally {
      setBusy(false)
    }
  }
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
    return null
  }

  async function advanceFromLearn() {
    setBusy(true)
    setError(null)
    try {
      const response = await learningApi.advanceLesson(questId, {
        fromPhase: 'learn',
      })
      setPhase(response.progress.phase)
    } catch (e) {
      if (!recoverCurrentPhase(e)) {
        setError(e instanceof Error ? e.message : 'Chưa mở được phần chơi')
      }
    } finally {
      setBusy(false)
    }
  }

  async function advanceFromGame(
    gameEvidence: GameEvidence | { skipped: true },
  ) {
    setBusy(true)
    setError(null)
    try {
      const result = await learningApi.advanceLesson(questId, {
        fromPhase: 'game',
        gameEvidence,
      })
      setLiveStars(result.progress.stars)
      setStarBurst({ id: Date.now(), count: 1 })
      setPhase('practice')
    } catch (e) {
      if (!recoverCurrentPhase(e)) {
        setError(e instanceof Error ? e.message : 'Chưa lưu được lượt chơi')
      }
    } finally {
      setBusy(false)
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
        payload = {
          sketchDataUrl,
          text: journalText.trim(),
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
        setLiveStars(advance.progress.stars)
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
      setLiveStars(result.progress.stars)
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
      setLiveStars(res.stars)
      setStarBurst({ id: Date.now(), count: 1 })
      setCheckResult(res)
      setPhase('done')
      setGameHint(null)
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

    if (isAikiRuleJourney) {
      const firstCheck = quest?.check?.[0] as any
      const correctIdx = typeof firstCheck?.correctIndex === 'number' ? firstCheck.correctIndex : 1
      const isCorrect = optionIndex === correctIdx
      const explanation = isCorrect
        ? (firstCheck?.explain || 'Tuyệt vời! Con chọn hoàn toàn chính xác! Bức tranh của Sonet có chi tiết Bố cầm vợt muỗi — câu chuyện thật độc nhất của riêng bạn ấy! 🎉')
        : 'Bức này quen thuộc quá, ai cũng có thể vẽ được giống hệt nhau. Bé hãy thử lại bức của Sonet xem sao nhé! 💡'

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
        // Luồng Aiki Rule: Bảo lưu phản hồi visual cho học sinh, không xoá lựa chọn
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

  if (loading) {
    return (
      <p className="animate-pulse text-muted" aria-live="polite">
        Đang mở trạm…
      </p>
    )
  }

  if (error && !quest) {
    return (
      <div className="ui-card page-enter p-6">
        <p className="text-danger">{error}</p>
        <p className="mt-2 text-sm text-muted">
          Nếu trạm bị khóa, hãy hoàn thành trạm trước trên bản đồ.
        </p>
        <Link to="/world" className="mt-4 inline-block">
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

  const allCheckAnswersCorrect =
    quest.check.length > 0 &&
    quest.check.every((question) => answerFeedback[question.id]?.correct)

  return (
    <div className="page-enter flex h-dvh flex-col gap-4 overflow-hidden p-2 sm:p-4 lg:flex-row">
      <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">
        {/* ── Header Card Chuẩn Soft Clay 3 Tầng ────────────────────────── */}
        {isAikiRuleJourney ? (
          <div className="ui-card p-4 sm:p-5 shrink-0 bg-white rounded-3xl border-2 border-border shadow-clay">
            {/* Tầng 1: Meta Tag & Huy Hiệu Mục Tiêu & Nút Mở Rộng */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 border border-brand-200 px-3 py-1 text-xs font-black text-brand-800 uppercase tracking-wider shadow-2xs">
                  <Sparkles size={13} className="text-brand-600" />
                  Trạm {quest.order || 1} · Quy tắc sáng tạo
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-50 border border-mint-200 px-3 py-1 text-xs font-black text-mint-800 shadow-2xs">
                  <span className="size-2 rounded-full bg-mint-500" />
                  Chặng {aikiRuleStage + 1} / {Math.max(5, hydratedLearnCards.length)}: {AIKI_RULE_STAGE_METAS[aikiRuleStage]?.shortLabel || AIKI_RULE_STAGE_METAS[aikiRuleStage]?.label || `Chặng ${aikiRuleStage + 1}`}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <button
                  type="button"
                  onClick={() => toggleSidebarCollapse(!isSidebarCollapsed)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95",
                    isSidebarCollapsed
                      ? "bg-brand-500 border-brand-600 text-white hover:bg-brand-600 ring-2 ring-brand-200"
                      : "bg-white border-brand-200 text-brand-800 hover:bg-brand-50"
                  )}
                  title={isSidebarCollapsed ? "Hiển thị trợ lý Mèo Mee bên cạnh" : "Mở rộng toàn màn hình không gian học"}
                >
                  <span>{isSidebarCollapsed ? "📖 Hiện Trợ Lý Mee" : "↔️ Mở Rộng Không Gian Học"}</span>
                </button>

                {/* Hộp Thưởng Mục Tiêu */}
                <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-black text-amber-900 shadow-2xs shrink-0">
                  <span className="text-xs font-black">⭐ 3 Sao</span>
                  <span className="text-amber-300">•</span>
                  <span className="flex items-center gap-1 text-xs font-black">
                    <span>🏆</span>
                    <span>Hiệp Sĩ AIKI</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Tầng 2: Tiêu Đề Trạm Hoàn Chỉnh (100% Chiều Rộng, TUYỆT ĐỐI KHÔNG CÓ TRUNCATE) */}
            <h1 className="mt-2.5 font-display text-2xl sm:text-3xl lg:text-4xl font-black text-text leading-tight">
              {quest.title}
            </h1>

            {/* Tầng 3: Thanh Tiến Độ Kẹo Dẻo Mini Track */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-1" aria-label={`Tiến độ chặng ${aikiRuleStage + 1} trên 5`}>
                {[0, 1, 2, 3, 4].map((stageIdx) => {
                  const isDone = stageIdx < aikiRuleStage
                  const isActive = stageIdx === aikiRuleStage
                  const meta = AIKI_RULE_STAGE_METAS[stageIdx]
                  return (
                    <div
                      key={stageIdx}
                      className={cn(
                        "h-2 flex-1 rounded-full transition-all duration-300",
                        isActive
                          ? "bg-brand-500 ring-2 ring-brand-200 shadow-xs"
                          : isDone
                            ? "bg-mint-500"
                            : "bg-slate-100"
                      )}
                      title={meta?.label}
                    />
                  )
                })}
              </div>
              <span className="text-xs font-black text-muted shrink-0">
                {Math.round(((aikiRuleStage + 1) / 5) * 100)}% hoàn thành
              </span>
            </div>
          </div>
        ) : (
          <div className="ui-card p-4 shrink-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500">Trạm {quest.order}</p>
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black leading-tight text-text">{quest.title}</h1>
                {practiceStation?.product && (
                  <p className="mt-1 text-xs font-semibold text-muted">
                    Sản phẩm của trạm: <strong className="text-text">{practiceStation.product}</strong>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => toggleSidebarCollapse(!isSidebarCollapsed)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95",
                    isSidebarCollapsed
                      ? "bg-brand-500 border-brand-600 text-white hover:bg-brand-600 ring-2 ring-brand-200"
                      : "bg-white border-brand-200 text-brand-800 hover:bg-brand-50"
                  )}
                  title={isSidebarCollapsed ? "Hiển thị trợ lý Mèo Mee bên cạnh" : "Mở rộng toàn màn hình không gian học"}
                >
                  <span>{isSidebarCollapsed ? "📖 Hiện Trợ Lý Mee" : "↔️ Mở Rộng Không Gian Học"}</span>
                </button>
                {phase !== 'done' && liveStars > 0 && (
                  <div className="lesson-star-rack" aria-label={`Sao của trạm: ${liveStars} sao đã nhận`}>
                    <span className="lesson-star-rack-label">Sao của trạm</span>
                    {[1, 2, 3].map((star) => (
                      <Star
                        key={star}
                        size={28}
                        className={cn(
                          'lesson-star-placeholder',
                          star <= liveStars && 'lesson-star-earned',
                        )}
                        aria-hidden="true"
                      />
                    ))}
                    {starBurst && Array.from({ length: starBurst.count }, (_, index) => (
                      <span
                        key={`${starBurst.id}-${index}`}
                        className="lesson-star-fly"
                        aria-hidden="true"
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
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
          </div>
        )}

      <main className={cn(
        "lesson-stage-main min-h-0 flex-1 relative overflow-y-auto hidden-scrollbar pb-10 pr-2",
        isSidebarCollapsed && "w-full max-w-[1400px] mx-auto"
      )}>
        {phase === 'learn' && (
        <div className={cn("flex flex-col gap-6 animate-fade-up", isSidebarCollapsed ? "w-full max-w-[1400px] mx-auto" : "w-full")}>
          {!isAikiRuleJourney && (
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
          {!isAikiRuleJourney && (
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
          {!isAikiRuleJourney && quest.goals.length > 0 && (
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

          {/* Short visual explanations are authored by LMS; the UI only controls presentation. */}
          <section className="grid gap-4" aria-label="Nội dung xem và hiểu">
            {visibleLearnCards.map((card, idx) => {
              const currentStageIndex = isAikiRuleJourney ? aikiRuleStage : idx
              const CARD_ICONS = [BrainCircuit, ScanSearch, Lightbulb]
              const CardIcon = CARD_ICONS[currentStageIndex % CARD_ICONS.length]!
              const TONES = [
                { bg: 'bg-sun-50', border: 'border-sun-200', text: 'text-sun-700', iconBg: 'bg-sun-200' },
                { bg: 'bg-mint-50', border: 'border-mint-200', text: 'text-mint-700', iconBg: 'bg-mint-200' },
                { bg: 'bg-brand-50', border: 'border-brand-200', text: 'text-brand-700', iconBg: 'bg-brand-200' },
              ]
              const tone = TONES[currentStageIndex % TONES.length]
              const isStoryboardCard = card.visualItems?.some((item) =>
                Boolean(item.shot || item.duration || item.sound || item.direction),
              ) ?? card.layout === 'storyboard'
              const usesSplitLayout = card.layout === 'split' || (!card.layout && card.visualItems?.length && !isStoryboardCard)
              
              return (
                <article key={card.id} className={cn(
                  "relative grid gap-4 rounded-[1.5rem] border-2 p-4 shadow-sm sm:p-5",
                  usesSplitLayout && card.visualItems?.length && !isStoryboardCard && !isAikiRuleJourney && "lg:grid-cols-[minmax(16rem,.78fr)_minmax(0,1.22fr)]",
                  tone.bg, tone.border
                )}>
                  <div className={cn('flex flex-col justify-center', isStoryboardCard && 'max-w-4xl')}>
                    {card.videoUrl && (
                      <div className="mb-4">
                        <LectureVideo url={card.videoUrl} title={card.title} />
                      </div>
                    )}
                    {card.imageUrl && !card.videoUrl && (
                      <div className={cn(
                        "relative mb-4 w-full overflow-hidden rounded-2xl border-2 border-orange-200 bg-orange-50/60 shadow-clay group/art flex items-center justify-center",
                        isAikiRuleJourney ? "min-h-[280px] sm:min-h-[360px] max-h-[560px]" : ""
                      )}>
                        <img
                          src={card.imageUrl}
                          alt={card.imageAlt || card.title}
                          className={cn(
                            "rounded-2xl transition-transform duration-300 group-hover/art:scale-101 mx-auto",
                            isAikiRuleJourney ? "w-auto max-w-full max-h-[560px] object-contain" : "w-full h-32 object-cover"
                          )}
                          onError={(event) => { event.currentTarget.style.display = 'none' }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setZoomedImage({
                              title: card.title,
                              subtitle: isAikiRuleJourney ? `Minh họa Chặng ${currentStageIndex + 1}` : 'Chi tiết tranh minh họa',
                              url: card.imageUrl || undefined,
                              description: card.body,
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
                    <div className={cn("grid size-12 place-items-center rounded-2xl border-2 shadow-sm", tone.iconBg, tone.border)}>
                      <CardIcon size={26} className={tone.text} aria-hidden="true" />
                    </div>
                    <h3 className={cn("mt-3 font-display text-xl sm:text-2xl lg:text-3xl font-black leading-tight", tone.text)}>
                      {card.title}
                    </h3>
                    {!(isAikiRuleJourney && (
                      currentStageIndex === 0 ||
                      currentStageIndex === 1 ||
                      card.body.includes('C1 —') ||
                      card.body.includes('Cận cảnh') ||
                      card.body.includes('máy lùi ra') ||
                      card.body.includes('Trong khung')
                    )) && (
                      <p className="mt-3 text-lg sm:text-xl font-semibold leading-relaxed text-text">{card.body}</p>
                    )}
                    {card.tip && !isAikiRuleJourney && (
                      <p className={cn("mt-3 rounded-xl border bg-white/80 px-3 py-2 text-sm font-bold leading-snug", tone.border, tone.text)}>
                        Ghi nhớ: {card.tip}
                      </p>
                    )}

                    {/* ── MODULE: BỘ SƯU TẬP ẢNH KÈM CAPTION ───────────── */}
                    {card.additionalImages && card.additionalImages.length > 0 && (
                      <div className="mt-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50/50 p-4">
                        <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800">
                          <span>🖼️</span>
                          <span>Bộ sưu tập hình ảnh minh họa</span>
                        </div>
                        <div className={cn(
                          "grid gap-3",
                          card.additionalImages.length === 1 ? "grid-cols-1 max-w-md mx-auto" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        )}>
                          {card.additionalImages.map((imgItem, imgIdx) => (
                            <figure key={imgItem.id || imgIdx} className="group overflow-hidden rounded-2xl border-2 border-emerald-100 bg-emerald-50/40 p-2 shadow-2xs transition hover:shadow-md">
                              <div className="overflow-hidden rounded-xl aspect-video bg-slate-100 relative">
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

                    {/* ── MODULE: KỊCH BẢN PHÂN VAI TÌNH HUỐNG ────────── */}
                    {((isAikiRuleJourney && currentStageIndex === 0) || (card.dialogueLines && card.dialogueLines.length > 0)) && (() => {
                      const dialogueSource = card.tip || card.body
                      const parsedDialogues = parseComicDialogue(dialogueSource)
                      const defaultDialogues: ParsedDialogue[] = [
                        { id: 'd-1', speaker: 'zico', speakerName: 'Zico', text: 'Của tớ đẹp hơn!' },
                        { id: 'd-2', speaker: 'sonet', speakerName: 'Sonet', text: 'Không, của tớ đúng hơn!' },
                        { id: 'd-3', speaker: 'aki', speakerName: 'Mèo AKI', text: 'DỪNG LẠIIII...! Các cậu ơi, hãy giúp tớ vụ này!' },
                      ]
                      const dialogues = (card.dialogueLines && card.dialogueLines.length > 0)
                        ? card.dialogueLines.map((d: DialogueLine) => ({
                            id: d.id,
                            speaker: d.speaker,
                            speakerName: d.speaker === 'zico' ? 'Zico (áo cam)' : d.speaker === 'sonet' ? 'Sonet (áo xanh)' : d.speaker === 'aki' ? 'Mèo AKI' : d.speaker === 'teacher' ? 'Cô giáo' : d.speaker,
                            text: d.text,
                            role: d.role || (d.speaker === 'zico' ? 'left' : d.speaker === 'sonet' ? 'right' : 'center'),
                          }))
                        : parsedDialogues.length > 0
                          ? parsedDialogues
                          : defaultDialogues

                      return (
                        <div className="mt-4 space-y-4 rounded-3xl border-2 border-orange-200 bg-white/85 p-4 sm:p-5 shadow-xs text-left">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-orange-100 pb-3">
                            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-orange-800">
                              <MessageSquareText size={18} className="text-orange-600" />
                              Kịch bản Phân vai Tình huống
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (isNarratingSituation) {
                                  stopSituationNarrator()
                                } else {
                                  playSituation(dialogues, card.mee?.readText?.trim() || card.body)
                                  setManualMeeCue({
                                    key: Date.now(),
                                    text: card.mee?.readText?.trim() || card.body || 'Các cậu ơi, cùng lắng nghe tình huống này nhé!',
                                    gesture: 'presentation',
                                  })
                                }
                              }}
                              className={cn(
                                'inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-xs font-black transition active:scale-95 shadow-xs cursor-pointer',
                                isNarratingSituation
                                  ? 'border-orange-500 bg-orange-500 text-white animate-pulse'
                                  : 'border-orange-300 bg-orange-50 text-orange-900 hover:bg-orange-100'
                              )}
                              aria-label={isNarratingSituation ? 'Dừng kể tình huống' : 'Nghe AIKI kể tình huống'}
                            >
                              {isNarratingSituation ? (
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
                            {dialogues.map((d: ParsedDialogue, index: number) => {
                              const isLeft = (d as any).role === 'left' || d.speaker === 'zico'
                              const isRight = (d as any).role === 'right' || d.speaker === 'sonet'
                              const isLineActive = isNarratingSituation && (speakingLineIndex === index || (speakingLineIndex === -1 && activeSpeaker === d.speaker))

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
                                      <span>{d.speakerName || 'TIẾNG AKI'}</span>
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
                    })()}

                    {/* ── MODULE: CÂU ĐỐ TRANH LỰA CHỌN A / B ─────────── */}
                    {((isAikiRuleJourney && currentStageIndex === 1) || (card.optionImages && card.optionImages.length > 0)) && (() => {
                      const riddle = quest.check[0] || {
                        id: 'aiki-stage-riddle',
                        question: card.body || 'Bức tranh nào đúng yêu cầu của cô giáo?',
                        options: [
                          'Bức của Zico (vẽ siêu anh hùng đẹp nhưng ai cũng vẽ được)',
                          'Bức của Sonet (siêu anh hùng bố cầm vợt muỗi của riêng bạn ấy)',
                        ],
                      }
                      const feedback = answerFeedback[riddle.id]
                      const isChecking = checkingQuestionId === riddle.id

                      return (
                        <div className="mt-4 space-y-4 rounded-3xl border-3 border-brand-200 bg-white p-5 sm:p-6 shadow-clay animate-fade-up text-left">
                          <div className="flex items-center justify-between gap-2 border-b border-brand-100 pb-3">
                            <div className="flex items-center gap-2 text-brand-700 font-extrabold text-sm uppercase tracking-wider">
                              <BrainCircuit size={20} className="text-brand-600" />
                              Câu đố của AIKI · Chọn bức tranh đúng
                            </div>
                            <span className="rounded-full bg-brand-100 px-3 py-0.5 text-xs font-black text-brand-800">
                              {isAikiRuleJourney ? `Chặng ${currentStageIndex + 1}/5` : 'Chọn tranh A/B'}
                            </span>
                          </div>

                          <p className="font-display text-xl sm:text-2xl text-brand-950 font-black leading-snug">
                            {riddle.question}
                          </p>
                          <p className="text-sm sm:text-base font-bold text-amber-800 flex items-center gap-1.5">
                            <span>👀</span>
                            <span>Bé hãy nhìn 2 bức tranh bên dưới và bấm trực tiếp vào bức tranh con chọn nhé:</span>
                          </p>

                          <div className="relative grid gap-5 sm:grid-cols-2 pt-2">
                            {riddle.options.map((opt, optIdx) => {
                              const isSelected = answers[riddle.id] === optIdx
                              const isCorrect = isSelected && feedback?.correct
                              const isWrong = isSelected && feedback && !feedback.correct
                              const optLetter = String.fromCharCode(65 + optIdx)
                              const parsed = parseVersusOption(opt, optIdx, card.tip)
                              const optTitle = card.optionLabels?.[optIdx] || parsed.title
                              const optDesc = card.optionDescs?.[optIdx] || parsed.desc
                              const defaultOptImages = isAikiRuleJourney && (currentStageIndex === 1 || aikiRuleStage === 1) && (questId?.includes('qt1') || quest?.id?.includes('qt1') || quest?.title?.includes('QT1') || quest?.title?.includes('Quy tắc 1'))
                                ? ['/assets/aiki-rules/rule1_opt_zico.jpg', '/assets/aiki-rules/rule1_opt_sonet.jpg']
                                : undefined
                              const optImageUrl = card.optionImages?.[optIdx] || defaultOptImages?.[optIdx]

                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  disabled={feedback?.correct === true || isChecking}
                                  onClick={() => void chooseCheckAnswer(riddle.id, optIdx)}
                                  className={cn(
                                    "group relative flex flex-col justify-between p-4 sm:p-5 rounded-3xl border-3 text-left transition-all duration-200 shadow-xs active:scale-[0.98] cursor-pointer",
                                    isSelected
                                      ? isCorrect
                                        ? "border-mint-500 bg-mint-50 text-mint-950 shadow-clay ring-4 ring-mint-200/50"
                                        : isWrong
                                          ? "border-coral-500 bg-coral-50 text-coral-950 ring-4 ring-coral-200/50"
                                          : "border-brand-500 bg-brand-50 text-brand-950 shadow-clay"
                                      : "border-border bg-white hover:border-brand-300 hover:bg-brand-50/20 hover:shadow-md text-text"
                                  )}
                                >
                                  <div className="w-full">
                                    <div className="flex items-start justify-between gap-3 w-full">
                                      <div className="flex items-center gap-3">
                                        <span
                                          className={cn(
                                            "grid size-11 shrink-0 place-items-center rounded-2xl text-lg font-black shadow-xs transition-transform group-hover:scale-105",
                                            isSelected
                                              ? isCorrect
                                                ? "bg-mint-500 text-white"
                                                : isWrong
                                                  ? "bg-coral-500 text-white"
                                                  : "bg-brand-500 text-white"
                                              : optIdx === 0
                                                ? "bg-amber-100 text-amber-900 border-2 border-amber-300"
                                                : "bg-sky-100 text-sky-900 border-2 border-sky-300"
                                          )}
                                        >
                                          {optLetter}
                                        </span>
                                        <div>
                                          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-muted">
                                            Phương án {optLetter}
                                          </span>
                                          <h4 className="font-display text-lg sm:text-xl font-black leading-tight text-text">
                                            {optTitle}
                                          </h4>
                                        </div>
                                      </div>
                                      {isCorrect && (
                                        <span className="grid size-8 place-items-center rounded-full bg-mint-500 text-white shadow-xs">
                                          <Check size={20} />
                                        </span>
                                      )}
                                    </div>

                                    <div className="relative mt-3.5 w-full min-h-[260px] sm:min-h-[320px] aspect-[4/3] overflow-hidden rounded-2xl border-2 border-dashed border-current/25 bg-white/75 group/art shadow-inner flex items-center justify-center">
                                      {optImageUrl ? (
                                        <img
                                          src={optImageUrl}
                                          alt={optTitle}
                                          className="size-full object-cover transition-transform duration-300 group-hover/art:scale-105"
                                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                                        />
                                      ) : optIdx === 0 ? (
                                        <ZicoDrawingFallback className="size-full" />
                                      ) : (
                                        <SonetDrawingFallback className="size-full" />
                                      )}

                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setZoomedImage({
                                            title: optTitle,
                                            subtitle: `Phương án ${optLetter} · Chi tiết tranh`,
                                            url: optImageUrl,
                                            isFallbackZico: !optImageUrl && optIdx === 0,
                                            isFallbackSonet: !optImageUrl && optIdx === 1,
                                            description: optDesc || (optIdx === 0
                                              ? 'Bức tranh vẽ siêu nhân quen thuộc giống như trên phim, ai cũng có thể vẽ hoặc sao chép tương tự nhau.'
                                              : 'Bức tranh vẽ Bố dũng cảm cầm vợt muỗi bảo vệ cả nhà — câu chuyện đời thật độc nhất vô nhị chỉ có ở gia đình con!'),
                                            onSelect: () => void chooseCheckAnswer(riddle.id, optIdx),
                                          })
                                        }}
                                        className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-black text-white backdrop-blur-xs transition hover:bg-black/85 active:scale-95 shadow-xs cursor-pointer"
                                        title="Phóng to xem tranh chi tiết"
                                      >
                                        <ZoomIn size={13} />
                                        <span>Xem tranh to</span>
                                      </button>
                                    </div>
                                  </div>

                                  {optDesc && (
                                    <div className="mt-3 rounded-xl bg-white/85 p-3 border border-current/10 text-sm sm:text-base font-semibold leading-relaxed text-text/90">
                                      👉 {optDesc}
                                    </div>
                                  )}
                                </button>
                              )
                            })}
                          </div>

                          {isChecking && (
                            <div className="flex items-center gap-2 rounded-2xl bg-brand-50 p-3 text-sm font-bold text-brand-700 animate-pulse">
                              <span className="size-2 rounded-full bg-brand-500 animate-ping" />
                              AIKI đang xem xét câu trả lời của con…
                            </div>
                          )}

                          {feedback && (
                            <div
                              className={cn(
                                "rounded-2xl border-2 p-4 animate-pop text-left",
                                feedback.correct
                                  ? "border-mint-300 bg-mint-50 text-mint-900"
                                  : "border-coral-300 bg-coral-50 text-coral-900"
                              )}
                              role="status"
                            >
                              <div className="flex items-center gap-2 font-extrabold text-base sm:text-lg">
                                <span>{feedback.correct ? '🎉' : '💡'}</span>
                                <span>{feedback.correct ? 'Tuyệt vời! Con chọn hoàn toàn chính xác!' : 'Chưa đúng rồi, bé thử suy nghĩ thêm nhé!'}</span>
                              </div>
                              <p className="mt-1.5 text-sm font-semibold leading-relaxed">
                                {feedback.explanation}
                              </p>
                              {feedback.correct && isAikiRuleJourney && (
                                <div className="mt-4 pt-3 border-t border-mint-200 flex justify-end">
                                  <Button
                                    variant="primary"
                                    className="h-11 px-5 font-extrabold shadow-clay"
                                    onClick={() => setAikiRuleStage(2)}
                                  >
                                    Tiếp tục sang Chặng 3: Quy tắc Vàng
                                    <ChevronRight size={18} />
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })()}

                    {/* ── MODULE: TUYÊN BỐ QUY TẮC VÀNG POSTER ────────── */}
                    {isAikiRuleJourney && currentStageIndex === 2 && (() => {
                      return (
                        <div className="mt-4 space-y-4 text-left">
                          <div className="relative overflow-hidden rounded-3xl border-3 border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6 sm:p-8 shadow-clay animate-fade-up">
                            <div className="flex items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
                              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm uppercase tracking-wider">
                                <Sparkles size={20} className="text-amber-600 fill-amber-400" />
                                Quy Tắc Vàng AIKI
                              </div>
                              <span className="rounded-full bg-amber-200 px-3 py-0.5 text-xs font-black text-amber-900">
                                Chặng 3/5
                              </span>
                            </div>

                            <div className="mt-4 flex flex-col items-center text-center">
                              <span className="text-4xl sm:text-5xl animate-bounce">🌟</span>
                              <h3 className="mt-2 font-display text-2xl sm:text-4xl font-black text-amber-950 leading-snug max-w-3xl">
                                {card.body || 'Ý TƯỞNG CỦA CON LÀ SỐ 1 · AI CHỈ LÀ TRỢ LÝ GIÚP CON LÀM ĐẸP HƠN!'}
                              </h3>
                            </div>

                            {card.tip && (
                              <div className="mt-5 rounded-2xl border-2 border-amber-300/70 bg-white/80 p-5 text-base sm:text-lg font-bold text-amber-950 leading-relaxed shadow-xs">
                                💡 <span className="font-extrabold">Bí kíp ghi nhớ:</span> {card.tip}
                              </div>
                            )}

                            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                              <Button
                                variant="secondary"
                                className="h-14 px-6 text-sm sm:text-base font-black border-2 border-amber-400 bg-white/95 hover:bg-amber-100 text-amber-950 shadow-xs flex items-center gap-2"
                                onClick={() => setIsPosterModalOpen(true)}
                              >
                                <Printer size={19} className="text-amber-700" />
                                📥 Tải / In Poster Vàng
                              </Button>

                              {!hasAcknowledgedRule ? (
                                <Button
                                  variant="primary"
                                  className="h-14 px-8 text-base sm:text-lg font-black shadow-clay bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-b-4 border-orange-700 active:border-b-0 active:translate-y-1"
                                  onClick={() => {
                                    setHasAcknowledgedRule(true)
                                    setStarBurst({ id: Date.now(), count: 1 })
                                    setManualMeeCue({
                                      key: Date.now(),
                                      text: 'Xuất sắc! Con đã nắm trọn Quy tắc Vàng này rồi!',
                                      gesture: 'celebrate',
                                    })
                                  }}
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
                                  <Button
                                    variant="secondary"
                                    className="h-12 px-6 font-extrabold border-2 border-amber-300 hover:bg-amber-100 text-amber-900"
                                    onClick={() => setAikiRuleStage(3)}
                                  >
                                    Tiếp tục sang phần Giải thích
                                    <ChevronRight size={20} />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })()}

                    {/* ── MODULE: BẢNG SO SÁNH 2 CỘT ─────────────────── */}
                    {((isAikiRuleJourney && currentStageIndex === 3) || Boolean(card.compareData)) && (() => {
                      const leftTitle = card.compareData?.leftTitle || card.visualItems?.[0]?.label || 'Dữ liệu quen thuộc & chung chung'
                      const leftText = card.compareData?.leftText || card.visualItems?.[0]?.text || 'AI chỉ lấy những hình ảnh quen thuộc trong kho hàng ngàn mẫu có sẵn. Ai gõ câu giống nhau thì kết quả cũng giống hệt nhau.'
                      const leftImage = card.compareData?.leftImage || card.compareImages?.left || (isAikiRuleJourney ? '/assets/aiki-rules/aiki_compare_ai_warehouse.jpg' : undefined)

                      const rightTitle = card.compareData?.rightTitle || card.visualItems?.[1]?.label || 'Ý tưởng độc nhất vô nhị'
                      const rightText = card.compareData?.rightText || card.visualItems?.[1]?.text || 'Chỉ có con mới có kỷ niệm riêng, cảm xúc thật, gia đình và sự tưởng tượng độc đáo mà AI không thể tự nghĩ ra được!'
                      const rightImage = card.compareData?.rightImage || card.compareImages?.right || (isAikiRuleJourney ? '/assets/aiki-rules/aiki_compare_kid_mind.jpg' : undefined)

                      return (
                        <div className="mt-4 space-y-4 text-left">
                          <div className="rounded-3xl border-3 border-sky-200 bg-white p-5 sm:p-6 shadow-clay animate-fade-up">
                            <div className="flex items-center justify-between gap-2 border-b border-sky-100 pb-3">
                              <div className="flex items-center gap-2 text-sky-800 font-extrabold text-sm uppercase tracking-wider">
                                <ScanSearch size={20} className="text-sky-600" />
                                Bảng So Sánh Hai Mặt Bản Chất
                              </div>
                              <span className="rounded-full bg-sky-100 px-3 py-0.5 text-xs font-black text-sky-800">
                                {isAikiRuleJourney ? `Chặng ${currentStageIndex + 1}/5` : 'So sánh'}
                              </span>
                            </div>

                            <p className="mt-3 font-display text-lg sm:text-xl font-bold text-text leading-relaxed">
                              {card.body}
                            </p>

                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                              {/* Cột 1: Kho của AI */}
                              <div className="flex flex-col justify-between rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 sm:p-5 shadow-xs">
                                <div>
                                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-black uppercase text-slate-700">
                                    <span>🤖</span>
                                    Kho Dữ Liệu Của AI
                                  </div>
                                  <h4 className="mt-3 font-display text-lg sm:text-xl font-black text-slate-800">
                                    {leftTitle}
                                  </h4>
                                  <p className="mt-1.5 text-base sm:text-lg font-semibold leading-relaxed text-slate-600">
                                    {leftText}
                                  </p>
                                  <AiWarehouseVisual
                                    imageUrl={leftImage}
                                    onZoom={leftImage ? () => setZoomedImage({
                                      title: leftTitle,
                                      subtitle: 'So sánh bản chất · Kho dữ liệu AI',
                                      url: leftImage,
                                      description: leftText,
                                    }) : undefined}
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
                                  <h4 className="mt-3 font-display text-lg sm:text-xl font-black text-brand-950">
                                    {rightTitle}
                                  </h4>
                                  <p className="mt-1.5 text-base sm:text-lg font-semibold leading-relaxed text-brand-900">
                                    {rightText}
                                  </p>
                                  <KidBrainVisual
                                    imageUrl={rightImage}
                                    onZoom={rightImage ? () => setZoomedImage({
                                      title: rightTitle,
                                      subtitle: 'So sánh bản chất · Bộ não sáng tạo của con',
                                      url: rightImage,
                                      description: rightText,
                                    }) : undefined}
                                    className="mt-3.5"
                                  />
                                </div>
                                <div className="mt-4 rounded-xl border border-brand-200 bg-white/90 p-3 text-sm font-black text-brand-700">
                                  ✨ Con chính là thuyền trưởng chỉ huy AI!
                                </div>
                              </div>
                            </div>

                            {card.tip && (
                              <div className="mt-4 rounded-2xl border-2 border-brand-200 bg-brand-50/60 p-4 text-left shadow-xs">
                                <div className="flex items-center gap-2 font-black text-brand-900 text-sm">
                                  <span>🐱</span>
                                  <span>Bật mí từ Mèo AIKI:</span>
                                </div>
                                <p className="mt-1 text-sm font-bold text-brand-950 leading-relaxed">
                                  {card.tip}
                                </p>
                              </div>
                            )}

                            {isAikiRuleJourney && currentStageIndex === 3 && (
                              <div className="mt-5 flex justify-end">
                                <Button
                                  variant="secondary"
                                  className="h-12 px-6 font-extrabold border-2 border-sky-300 hover:bg-sky-100 text-sky-900"
                                  onClick={() => setAikiRuleStage(4)}
                                >
                                  Tiếp tục sang phần Chốt cam kết
                                  <ChevronRight size={20} />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })()}

                    {/* ── MODULE: BẢN CAM KẾT HIỆP SĨ SÁNG TẠO ────────── */}
                    {isAikiRuleJourney && currentStageIndex === 4 && (() => {
                      return (
                        <div className="mt-4 space-y-4">
                          <div className="rounded-3xl border-3 border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6 sm:p-8 shadow-clay text-center flex flex-col items-center gap-5 animate-fade-up">
                            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400 bg-amber-200/90 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-amber-950 shadow-xs">
                              <Trophy className="size-4 text-amber-700 fill-amber-500" />
                              🛡️ BẢN CAM KẾT HIỆP SĨ SÁNG TẠO AIKI
                            </div>

                            <h3 className="font-display text-2xl sm:text-3xl font-black text-amber-950 max-w-2xl leading-snug">
                              {card.body || 'Lời hứa của con khi dùng AI: Luôn có ý tưởng của riêng mình trước khi nhờ AI hỗ trợ!'}
                            </h3>

                            <button
                              type="button"
                              onClick={() => {
                                setHasCommitted((prev) => !prev)
                                if (!hasCommitted) {
                                  setStarBurst({ id: Date.now(), count: 1 })
                                  setManualMeeCue({
                                    key: Date.now(),
                                    text: 'Tuyệt vời! Chào mừng Hiệp Sĩ Sáng Tạo mới của Xưởng AIKI!',
                                    gesture: 'celebrate',
                                  })
                                }
                              }}
                              className={cn(
                                "flex items-center gap-3 px-6 py-4 rounded-2xl border-3 font-black text-base sm:text-lg transition-all shadow-xs active:scale-[0.98] cursor-pointer",
                                hasCommitted
                                  ? "border-mint-500 bg-mint-50 text-mint-900 shadow-clay ring-4 ring-mint-200/60"
                                  : "border-brand-300 bg-white hover:border-brand-400 text-brand-900 hover:shadow-md"
                              )}
                            >
                              <span
                                className={cn(
                                  "grid size-8 place-items-center rounded-xl border-2 transition-all",
                                  hasCommitted
                                    ? "bg-mint-500 border-mint-600 text-white shadow-xs"
                                    : "border-brand-300 bg-brand-50 text-brand-400"
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

                            {hasCommitted && (
                              <CreativeKnightBadgeVisual className="my-2" />
                            )}

                            <p className="text-sm font-semibold text-amber-800 max-w-md">
                              Con đã hoàn thành toàn bộ 5 chặng của Quy tắc AIKI! Bấm nút bên dưới để hoàn tất trạm học và nhận sao nhé!
                            </p>

                            <Button
                              variant="primary"
                              className="w-full sm:w-auto min-w-[280px] text-lg sm:text-xl font-black h-16 rounded-2xl shadow-clay border-b-[4px] border-brand-700 active:border-b-0 active:translate-y-1 mt-2"
                              onClick={() => void handleAikiFinish()}
                              disabled={busy}
                            >
                              {!busy && <Star size={24} className="fill-white" aria-hidden="true" />}
                              {busy ? 'Đang hoàn thành…' : 'Hoàn thành trạm học & Nhận sao ⭐'}
                            </Button>
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  {!isAikiRuleJourney && card.visualItems?.length ? (
                    <div className={cn(
                      'grid content-center gap-3',
                      isStoryboardCard
                        ? 'sm:grid-cols-2 sm:gap-4'
                        : card.layout === 'split'
                          ? 'grid-cols-1'
                          : card.layout === 'visual-grid' && card.visualItems.length >= 3
                          ? 'sm:grid-cols-3'
                          : card.layout === 'visual-grid'
                            ? 'sm:grid-cols-2'
                            : 'grid-cols-1',
                    )}>
                      {card.visualItems.map((item, itemIndex) => {
                        const isStoryboardFrame = Boolean(item.shot || item.duration || item.sound || item.direction)
                        const visualTone = {
                          brand: 'border-brand-200 bg-brand-50 text-brand-800',
                          sky: 'border-sky-200 bg-sky-50 text-sky-800',
                          mint: 'border-mint-200 bg-mint-50 text-mint-800',
                          sun: 'border-sun-200 bg-sun-50 text-sun-800',
                          coral: 'border-coral-200 bg-coral-50 text-coral-800',
                        }[item.tone ?? 'brand'] ?? 'border-brand-200 bg-brand-50 text-brand-800'
                        const VisualIcon = item.label.toLocaleLowerCase('vi').includes('đồng hồ')
                          ? Timer
                          : itemIndex === card.visualItems!.length - 1
                            ? Target
                            : BrainCircuit
                        return (
                          <div key={`${item.label}-${itemIndex}`} className={cn(
                            'min-h-32 overflow-hidden rounded-2xl border-2 bg-white p-4 shadow-sm',
                            isStoryboardFrame && 'grid content-start sm:grid-cols-[minmax(9rem,.85fr)_minmax(0,1.15fr)] sm:gap-x-4',
                            visualTone,
                          )}>
                            {isStoryboardFrame ? (
                              <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl border-2 border-text/20 bg-sky-50 sm:row-span-3 sm:mb-0" aria-hidden="true">
                                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-mint-100" />
                                <div className="absolute bottom-[24%] right-[9%] h-[58%] w-[31%] rounded-t-xl border-2 border-text/30 bg-sun-100">
                                  <div className="absolute bottom-[42%] left-[14%] h-2 w-2 rounded-full bg-text/50" />
                                </div>
                                <AikidCatCharacter
                                  pose="walking"
                                  className={cn(
                                    'absolute bottom-[12%] h-[58%] w-[48%] object-contain drop-shadow-sm',
                                    itemIndex === 0 ? 'left-[5%]' : itemIndex === 1 ? 'left-[22%]' : itemIndex === 2 ? 'left-[28%] scale-125' : 'left-[38%]',
                                  )}
                                />
                                {itemIndex > 0 && (
                                  <MoveRight className="absolute bottom-[10%] left-[8%] text-brand-700" size={28} />
                                )}
                                <span className="absolute left-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-[11px] font-extrabold text-text">
                                  {item.shot}
                                </span>
                              </div>
                            ) : (
                              <VisualIcon size={24} aria-hidden="true" />
                            )}
                            <p className={cn('mt-2 text-base font-extrabold leading-tight', isStoryboardFrame && 'sm:mt-0')}>{item.label}</p>
                            <p className="mt-1 text-sm font-semibold leading-relaxed text-text">{item.text}</p>
                            {isStoryboardFrame && (
                              <dl className="mt-3 grid gap-2 border-t border-current/15 pt-3 text-sm font-bold text-text">
                                {item.duration && <div className="flex items-start gap-2"><Clock3 size={17} className="mt-0.5 shrink-0" /><dt className="sr-only">Thời lượng</dt><dd>{item.duration}</dd></div>}
                                {item.sound && <div className="flex items-start gap-2"><Volume2 size={17} className="mt-0.5 shrink-0" /><dt className="sr-only">Âm thanh</dt><dd>{item.sound}</dd></div>}
                                {item.direction && <div className="flex items-start gap-2"><MoveRight size={17} className="mt-0.5 shrink-0" /><dt className="sr-only">Chỉ dẫn</dt><dd className="leading-snug">{item.direction}</dd></div>}
                              </dl>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : null}
                </article>
              )
            })}
          </section>

          {isAikiRuleJourney && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {aikiRuleStage > 0 ? (
                <Button
                  variant="secondary"
                  className="min-h-12 px-5 font-extrabold cursor-pointer"
                  onClick={() => setAikiRuleStage((value) => Math.max(0, value - 1))}
                >
                  <ChevronLeft size={20} aria-hidden="true" />
                  Chặng trước
                </Button>
              ) : <div />}
              {aikiRuleStage < 4 && (
                <Button
                  variant="primary"
                  className="min-h-12 px-5 font-extrabold ml-auto shadow-clay cursor-pointer"
                  onClick={() => setAikiRuleStage((value) => Math.min(4, value + 1))}
                >
                  Chặng tiếp theo: {AIKI_RULE_STAGE_METAS[aikiRuleStage + 1]?.shortLabel || AIKI_RULE_STAGE_METAS[aikiRuleStage + 1]?.label}
                  <ChevronRight size={20} aria-hidden="true" />
                </Button>
              )}
            </div>
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

          {!isAikiRuleJourney && (
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
          <CurriculumGame
            gameType={gameStation.gameType}
            gameConfig={gameStation.gameConfig}
            instruction={gameStation.instruction ?? ''}
            outcome={gameStation.outcome}
            onComplete={(evidence) => void advanceFromGame(evidence)}
            onGameHint={setGameHint}
          />
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
      )}

      {phase === 'check' && (
        <div className="ui-card flex flex-col gap-5 p-5 animate-fade-up">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>⭐</span>
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
                      : '💡 Chưa đúng — con chọn lại ngay nhé.'}
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
              onClick={() => navigate(`/world/${quest.courseId}`)}
            >
              <NavWorldIcon size={18} aria-hidden="true" />
              Thoát về bản đồ
            </Button>
          </div>
        </div>
      )}

      {phase === 'done' && checkResult && (
        <AdventureModal
          open
          tone={checkResult.stars > 0 ? 'celebration' : 'guidance'}
          eyebrow={checkResult.stars > 0 ? 'Trạm đã hoàn thành' : 'Mee vẫn ở đây cùng con'}
          title={checkResult.stars > 0 ? 'Con đã chinh phục trạm!' : 'Mình thử thêm một lần nhé'}
          description={checkResult.message}
          className="lesson-completion-modal"
          artwork={
            <div className="lesson-result-visual">
              <div className="stars-row flex items-center justify-center gap-2" aria-label={`${checkResult.stars} sao`}>
                {[1, 2, 3].map((i) => (
                  <Star
                    key={i}
                    size={48}
                    className={cn('result-star-slot', i <= checkResult.stars && 'result-star-earned')}
                    aria-hidden="true"
                  />
                ))}
              </div>
              {checkResult.stars > 0 && quest.reward && (
                <div className="lesson-result-reward">
                  <span className="lesson-result-reward-icon" aria-hidden="true">
                    <Trophy size={27} strokeWidth={2.5} />
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block text-xs font-extrabold uppercase tracking-wide text-sun-700">Phần thưởng mới</span>
                    <strong className="mt-0.5 block text-sm leading-snug text-text">{quest.reward}</strong>
                  </span>
                </div>
              )}
            </div>
          }
        >

          {/* Reflect the authored learning outcomes back to the child. This is
              API content, so the celebration stays accurate for every lesson. */}
          {checkResult.stars > 0 && quest.goals.length > 0 && (
            <section className="w-full max-w-lg rounded-2xl border-2 border-mint-200 bg-mint-50 px-4 py-3 text-left" aria-labelledby="completed-goals-title">
              <p id="completed-goals-title" className="text-xs font-extrabold uppercase tracking-wider text-mint-700">
                Hôm nay con đã học được
              </p>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {quest.goals.slice(0, 4).map((goal) => (
                  <li key={goal} className="flex items-start gap-2 text-sm font-bold leading-snug text-text">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white text-mint-700" aria-hidden="true">
                      <Check size={14} strokeWidth={3} />
                    </span>
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* New achievements */}
          {checkResult.newAchievements && checkResult.newAchievements.length > 0 && (
            <div className="rounded-2xl bg-sun-100 border border-sun-200 px-4 py-3 w-full max-w-sm">
              <p className="text-sm font-extrabold text-warning">
                🏆 Huy hiệu mới: {checkResult.newAchievements.join(', ')}
              </p>
            </div>
          )}

          {/* Course credential */}
          {checkResult.courseCredential && (
            <div className="rounded-3xl border-2 border-sun-200 bg-gradient-to-br from-sun-100 to-coral-50 px-5 py-4 w-full max-w-sm">
              <p className="font-display text-xl">🎓 Hoàn thành khóa học!</p>
              <p className="mt-1 text-sm font-bold">{checkResult.courseCredential}</p>
              <p className="mt-1 text-xs text-muted">
                AI Kids Creator Academy · Riêng tư & bảo mật
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            {checkResult.nextQuestId && (
              <Button onClick={() => navigate(`/lesson/${checkResult.nextQuestId}`)}>
                <Play size={18} aria-hidden="true" />
                Trạm tiếp theo
              </Button>
            )}
            <Button variant="secondary" onClick={() => navigate(`/world/${quest.courseId}`)}>
              <NavWorldIcon size={18} aria-hidden="true" />
              Về bản đồ
            </Button>
            {checkResult.stars < 3 && (
              <Button
                onClick={() => {
                  setReviewMode(false)
                  setAnswers({})
                  setAnswerFeedback({})
                  setLiveStars(0)
                  setStarBurst(null)
                  setError(null)
                  setPhase('check')
                }}
              >
                <Star size={18} aria-hidden="true" />
                {checkResult.stars === 0 ? 'Thử lại để nhận sao' : 'Thử lại để nâng sao'}
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => {
                setReviewMode(true)
                setPhase('learn')
                setAnswers({})
              }}
            >
              Xem lại bài
            </Button>
          </div>
        </AdventureModal>
      )}
      </main>
      </div>

      <LeftPhaseSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        guideCopy={dynamicGuideCopy}
        videoUrl={phase === 'learn' ? quest?.videoUrl : null}
        videoTitle={quest?.title}
        phase={phase}
        maxUnlockedPhase={maxUnlockedPhase}
        goals={quest.goals}
        product={practiceStation?.product}
        successCriteria={practiceCriteria}
        narrationText={phase === 'learn' ? (manualMeeCue?.text || visibleLearnCards[0]?.mee?.readText || (isAikiRuleJourney ? dynamicGuideCopy.body : visibleLearnCards[0]?.body) || dynamicGuideCopy.body) : dynamicGuideCopy.body}
        autoRead={phase === 'learn' && manualMeeCue !== null}
        gesture={manualMeeCue?.gesture}
        narrationKey={manualMeeCue?.key}
        stages={isAikiRuleJourney ? hydratedLearnCards.map((c, i) => ({
          id: c.id,
          label: AIKI_RULE_STAGE_METAS[i]?.label || c.title,
          kind: c.kind,
        })) : undefined}
        currentStageIndex={isAikiRuleJourney ? aikiRuleStage : undefined}
        onSelectStage={isAikiRuleJourney ? (idx) => setAikiRuleStage(idx) : undefined}
      />

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
