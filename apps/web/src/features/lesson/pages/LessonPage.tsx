import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { BookOpen, Gamepad2, PencilLine, Play, Star, Target, ShieldCheck, Check } from 'lucide-react'
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
  { id: 'learn' as const, label: 'Khám phá', icon: BookOpen },
  { id: 'game' as const, label: 'Thử cùng Mee', icon: Gamepad2 },
  { id: 'practice' as const, label: 'Tự tay làm', icon: PencilLine },
  { id: 'check' as const, label: 'Thử thách', icon: ShieldCheck },
]

const PHASE_ORDER = ['learn', 'game', 'practice', 'check', 'done']

export function LessonPage() {
  const { questId = '' } = useParams()
  const navigate = useNavigate()
  const [quest, setQuest] = useState<QuestDetail | null>(null)
  const [phase, setPhase] = useState<Phase>('learn')
  const [gameHint, setGameHint] = useState<GameHint | null>(null)
  const [maxUnlockedPhase, setMaxUnlockedPhase] = useState<Phase>('learn')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [parts, setParts] = useState<PromptParts>({})
  const [generated, setGenerated] = useState<PracticePreview | null>(null)
  const [practiceFeedback, setPracticeFeedback] = useState<string | null>(null)
  const [practiceSaved, setPracticeSaved] = useState(false)
  const [practiceAdvanced, setPracticeAdvanced] = useState(false)
  const [charName, setCharName] = useState('Mèo Sao')
  const [charShape, setCharShape] = useState<CharacterShapeId>('animal')
  const [charVibe, setCharVibe] = useState<CharacterVibeId>('curious')
  const [styleId, setStyleId] = useState<ArtStyleId | null>(null)
  const [story, setStory] = useState(emptyStory)
  const [comicBubbles, setComicBubbles] = useState([
    'Xin chào!',
    'Ôi không!',
    'Mình sửa nhé!',
    'Xong rồi!',
  ])
  const [detectivePick, setDetectivePick] = useState<0 | 1 | null>(null)
  const [journalText, setJournalText] = useState('')
  const [promptLab, setPromptLab] = useState<PromptLabValue>(EMPTY_PROMPT_LAB)
  const [paletteColors, setPaletteColors] = useState<string[]>([
    '#6d5efc',
    '#3dbfff',
    '#ffc94a',
  ])
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
    setCharName('Mèo Sao')
    setCharShape('animal')
    setCharVibe('curious')
    setStyleId(null)
    setStory(emptyStory)
    setComicBubbles(['Xin chào!', 'Ôi không!', 'Mình sửa nhé!', 'Xong rồi!'])
    setDetectivePick(null)
    setJournalText('')
    setPromptLab(EMPTY_PROMPT_LAB)
    setPaletteColors(['#6d5efc', '#3dbfff', '#ffc94a'])
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
  const panels = useMemo(() => storyToPanelHints(story), [story])
  const gameStation = quest?.stations?.stations.find(
    (station) => station.kind === 'game',
  )
  const practiceStation = quest?.stations?.stations.find(
    (station) => station.kind === 'practice',
  )

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
        quest.practiceKind === 'drag' ||
        quest.practiceKind === 'ai_pick') &&
      !journalText.trim()
    ) {
      return 'Viết ý tưởng của con vào sổ tay nhé!'
    }
    if (quest.practiceKind === 'palette' && paletteColors.length < 3) {
      return 'Chọn đủ 3 màu nhé!'
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
    <div className="page-enter flex flex-col sm:flex-row gap-4 h-dvh overflow-hidden p-2 sm:p-4">
      <LeftPhaseSidebar 
        className="shrink-0 flex-row justify-center sm:flex-col sm:justify-start" 
        guideCopy={dynamicGuideCopy}
        videoUrl={phase === 'learn' ? quest?.videoUrl : null}
        videoTitle={quest?.title}
      />
      
      <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="ui-card p-4 shrink-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500">Trạm {quest.order}</p>
            <h1 className="font-display text-2xl sm:text-3xl leading-tight">{quest.title}</h1>
            {practiceStation?.product && (
              <p className="mt-1 text-xs font-semibold text-muted">
                Sản phẩm của trạm: <strong className="text-text">{practiceStation.product}</strong>
              </p>
            )}
          </div>
          {phase !== 'done' && (
            <div className="lesson-star-rack" aria-label={`${liveStars} sao đã nhận`}>
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
                  onClick={() => {
                    if (isUnlocked) {
                      setPhase(p.id)
                      if (p.id !== 'game') setGameHint(null)
                    }
                  }}
                  disabled={!isUnlocked}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-bold transition-all",
                    isActive ? "bg-brand-50 border-brand-500 text-brand-700 shadow-sm"
                             : isUnlocked ? "bg-white border-border text-text hover:border-brand-200"
                                          : "bg-surface border-transparent text-muted opacity-60 cursor-not-allowed"
                  )}
                >
                  <p.icon size={16} />
                  <span>{p.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

      <main className="lesson-stage-main min-h-0 flex-1 relative overflow-y-auto hidden-scrollbar pb-10 pr-2">
        {phase === 'learn' && (
        <div className="flex flex-col gap-6 animate-fade-up">
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
          {/* Hook highlight */}
          <div className="relative overflow-hidden rounded-[2rem] border-[4px] border-brand-200 bg-brand-50 p-6 sm:p-8 shadow-clay text-center">
             <h2 className="font-display text-2xl sm:text-3xl font-black text-brand-800 leading-tight">
               {quest.hook}
             </h2>
             <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 opacity-20" aria-hidden="true">
               <Star size={120} className="fill-brand-500 text-brand-500" />
             </div>
          </div>

          {/* Goals */}
          {quest.goals.length > 0 && (
            <div className="flex flex-col gap-4 rounded-[1.5rem] bg-white border-2 border-border p-5 shadow-sm">
              <p className="text-sm font-extrabold uppercase tracking-wider text-coral-500 flex items-center gap-2">
                <Target size={18} /> Hôm nay con sẽ:
              </p>
              <ul className="flex flex-wrap gap-2">
                {quest.goals.map((g) => (
                  <li key={g} className="px-4 py-2 bg-coral-50 text-coral-800 border-2 border-coral-200 rounded-full text-sm font-bold shadow-sm">
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Learn cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quest.learnCards.map((card, idx) => {
              const CARD_ICONS = ['💡', '🔍', '🎯', '✨', '🧩', '🚀']
              const TONES = [
                { bg: 'bg-sun-50', border: 'border-sun-200', text: 'text-sun-700', iconBg: 'bg-sun-200' },
                { bg: 'bg-mint-50', border: 'border-mint-200', text: 'text-mint-700', iconBg: 'bg-mint-200' },
                { bg: 'bg-brand-50', border: 'border-brand-200', text: 'text-brand-700', iconBg: 'bg-brand-200' },
              ]
              const tone = TONES[idx % TONES.length]
              
              return (
                <div key={card.id} className={cn(
                  "relative flex flex-col gap-3 rounded-[1.5rem] border-[3px] p-5 shadow-sm transition-transform hover:-translate-y-1",
                  tone.bg, tone.border
                )}>
                  {card.imageUrl && (
                    <img
                      src={card.imageUrl}
                      alt={card.imageAlt || card.title}
                      className="mb-3 h-32 w-full rounded-xl object-cover"
                      onError={(event) => { event.currentTarget.style.display = 'none' }}
                    />
                  )}
                  <div className={cn("grid size-12 place-items-center rounded-2xl text-2xl border-2 shadow-sm", tone.iconBg, tone.border)}>
                    {CARD_ICONS[idx % CARD_ICONS.length]}
                  </div>
                  <p className={cn("text-lg font-black leading-tight mt-1", tone.text)}>
                    {card.title}
                  </p>
                  <p className="text-sm font-semibold text-text/80 leading-relaxed">{card.body}</p>
                  {card.tip && (
                    <div className="mt-auto pt-3">
                      <p className={cn("text-xs font-bold px-3 py-2 rounded-xl border-2 shadow-sm", tone.border, tone.text, "bg-white/60")}>
                        💡 {card.tip}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

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
        <div className="ui-card flex flex-col gap-4 p-5 animate-fade-up">
          {practiceStation?.instruction && (
            <div className="rounded-2xl border-2 border-mint-100 bg-mint-100/40 p-4">
              <p className="font-display flex items-center gap-2 text-xl">
                <PencilLine size={22} aria-hidden="true" />
                Nhiệm vụ thực hành
              </p>
              <p className="mt-1 text-sm font-semibold leading-relaxed">
                {practiceStation.instruction}
              </p>
              {practiceStation.product && (
                <p className="mt-2 text-xs text-muted">
                  Sản phẩm cần lưu: {practiceStation.product}
                </p>
              )}
            </div>
          )}
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

              {(quest.practiceKind === 'journal' ||
                quest.practiceKind === 'reflect' ||
                quest.practiceKind === 'spin' ||
                quest.practiceKind === 'match' ||
                quest.practiceKind === 'drag' ||
                quest.practiceKind === 'ai_pick') && (
                  <div className="flex flex-col gap-2">
                    <p className="font-extrabold">
                      {quest.practiceKind === 'ai_pick'
                        ? 'Mô tả để máy vẽ giúp — con chọn ý trước nhé!'
                        : quest.practiceKind === 'spin'
                          ? 'Vòng quay ý tưởng — ghi 3 từ khoá của con'
                          : 'Sổ tay thế giới — viết ý của con'}
                    </p>
                    <textarea
                      aria-label="Ý tưởng của con"
                      className="min-h-28 rounded-2xl border-2 border-border p-3 text-sm font-semibold"
                      placeholder="Viết ý tưởng của con (không dùng tên thật)…"
                      value={journalText}
                      maxLength={500}
                      onChange={(e) => setJournalText(e.target.value)}
                    />
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
        <div className="ui-card flex flex-col items-center gap-4 p-8 text-center animate-pop">
          {/* Confetti overlay */}
          <div className="star-burst-overlay" aria-hidden>
            {['🌟', '⭐', '✨', '🎉', '🎊', '💫', '🌈', '🏆'].map((emoji, i) => (
              <span
                key={i}
                className="confetti-piece"
                style={{
                  left: `${10 + i * 11}%`,
                  fontSize: '1.5rem',
                  background: 'transparent',
                  width: 'auto',
                  height: 'auto',
                  '--fall-duration': `${2 + (i % 3) * 0.5}s`,
                  '--fall-delay': `${i * 0.15}s`,
                  '--spin-amount': `${360 * (i % 2 === 0 ? 1 : -1)}deg`,
                } as React.CSSProperties}
              >
                {emoji}
              </span>
            ))}
          </div>

          {/* Stars */}
          <div className="stars-row" aria-label={`${checkResult.stars} sao`}>
            {[1, 2, 3].map((i) => (
              <Star
                key={i}
                size={44}
                className={cn(
                  'result-star-slot',
                  i <= checkResult.stars && 'result-star-earned',
                )}
                aria-hidden="true"
              />
            ))}
          </div>

          <div>
            <h2 className="font-display text-3xl">
              {checkResult.stars > 0 ? 'Hoàn thành trạm! 🎉' : 'Thử lại để nhận sao ⭐'}
            </h2>
            <p className="mt-1 text-muted">{checkResult.message}</p>
          </div>

          {/* Reward */}
          {checkResult.stars > 0 && (
            <div className="rounded-2xl bg-brand-50 border border-brand-100 px-4 py-3 w-full max-w-sm">
              <p className="text-xs font-extrabold uppercase tracking-wider text-brand-500 mb-1">Phần thưởng</p>
              <p className="text-sm font-bold">{quest.reward}</p>
            </div>
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
          <div className="mt-2 flex flex-wrap justify-center gap-3">
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
        </div>
      )}
        </main>
      </div>
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
