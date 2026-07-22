import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ART_STYLES,
  assemblePrompt,
  CHARACTER_SHAPES,
  CHARACTER_VIBES,
  isPromptComplete,
  STORY_ENDINGS,
  STORY_OPENINGS,
  STORY_PROBLEMS,
  storyToPanelHints,
  type ArtStyleId,
  type CharacterShapeId,
  type CharacterVibeId,
  type PromptChip,
  type PromptParts,
  type PromptSlotKey,
} from '@aikids/domain'
import { Button } from '@/shared/components/ui/Button'
import { ApiError, api, type QuestDetail } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { designerAssets, styleImage } from '@/shared/config/assets'
import { RefMediaPicker } from '@/features/lesson/components/RefMediaPicker'
import { SketchCanvas } from '@/features/lesson/components/SketchCanvas'
import {
  CurriculumGame,
  type GameEvidence,
} from '@/features/lesson/components/CurriculumGame'

type Phase = 'learn' | 'game' | 'practice' | 'check' | 'done'

const GEN_KINDS = new Set(['ai_pick', 'video', 'chips'])


const emptyStory = {
  opening: '',
  problem: '',
  ending: '',
  title: 'Truyện của con',
}

export function LessonPage() {
  const { questId = '' } = useParams()
  const navigate = useNavigate()
  const [quest, setQuest] = useState<QuestDetail | null>(null)
  const [phase, setPhase] = useState<Phase>('learn')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [parts, setParts] = useState<PromptParts>({})
  const [generated, setGenerated] = useState<{
    url: string
    title: string
    mediaKind: 'image' | 'video'
  } | null>(null)
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
  const [paletteColors, setPaletteColors] = useState<string[]>(['#6d5efc', '#3dbfff', '#ffc94a'])
  const [answers, setAnswers] = useState<Record<string, number>>({})
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

  const resetLocal = useCallback(() => {
    setPhase('learn')
    setError(null)
    setParts({})
    setGenerated(null)
    setCharName('Mèo Sao')
    setCharShape('animal')
    setCharVibe('curious')
    setStyleId(null)
    setStory(emptyStory)
    setComicBubbles(['Xin chào!', 'Ôi không!', 'Mình sửa nhé!', 'Xong rồi!'])
    setDetectivePick(null)
    setJournalText('')
    setPaletteColors(['#6d5efc', '#3dbfff', '#ffc94a'])
    setRefAssetIds([])
    setSketchDataUrl(null)
    setAnswers({})
    setCheckResult(null)
    setReviewMode(false)
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
        const start = await api<{
          progress: {
            status: string
            phase: Phase
            stars: number
          }
        }>(`/api/progress/${questId}/start`, { method: 'POST' })
        const data = await api<{ quest: QuestDetail }>(
          `/api/quests/${questId}`,
        )
        if (cancelled) return
        setQuest(data.quest)
        // Resume mid-quest; completed stations open on celebrate/review
        if (start.progress.status === 'completed') {
          setPhase('done')
          setCheckResult({
            stars: start.progress.stars || 1,
            message: 'Con đã hoàn thành trạm này! Có thể xem lại hoặc sang trạm mới.',
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
          setError(e instanceof Error ? e.message : 'Không mở được trạm')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [questId, resetLocal])

  // Load nextQuestId when reviewing completed station
  useEffect(() => {
    if (!quest || phase !== 'done' || checkResult?.nextQuestId) return
    void (async () => {
      try {
        const p = await api<{
          quests: Array<{ id: string; order: number; status: string }>
        }>(`/api/progress/${quest.courseId}`)
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
    return null
  }

  async function advanceFromLearn() {
    setBusy(true)
    setError(null)
    try {
      await api(`/api/progress/${questId}/advance`, {
        method: 'POST',
        body: JSON.stringify({ fromPhase: 'learn' }),
      })
      setPhase('game')
    } catch (e) {
      if (!recoverCurrentPhase(e)) {
        setError(e instanceof Error ? e.message : 'Chưa mở được phần chơi')
      }
    } finally {
      setBusy(false)
    }
  }

  async function advanceFromGame(gameEvidence: GameEvidence) {
    setBusy(true)
    setError(null)
    try {
      await api(`/api/progress/${questId}/advance`, {
        method: 'POST',
        body: JSON.stringify({ fromPhase: 'game', gameEvidence }),
      })
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
      } else {
        payload = { ready: true }
      }

      if (GEN_KINDS.has(quest.practiceKind) && refAssetIds.length > 0) {
        payload = { ...payload, assetIds: refAssetIds }
      }

      const res = await api<{
        result: {
          generated?: {
            imageDataUrl?: string
            imageUrl?: string
            videoUrl?: string
            title: string
          }
          asset?: { id: string; url: string }
          message?: string
        }
      }>(`/api/progress/${questId}/practice`, {
        method: 'POST',
        body: JSON.stringify({
          kind: quest.practiceKind === 'chips' ? 'prompt' : quest.practiceKind,
          payload,
        }),
      })
      if (res.result?.generated) {
        const g = res.result.generated
        setGenerated({
          url: g.imageDataUrl ?? g.imageUrl ?? g.videoUrl ?? '',
          title: g.title,
          mediaKind: g.videoUrl ? 'video' : 'image',
        })
      } else if (res.result?.asset?.url) {
        setGenerated({
          url: res.result.asset.url,
          title: 'Bản vẽ của con',
          mediaKind: 'image',
        })
      }
      await api(`/api/progress/${questId}/advance`, {
        method: 'POST',
        body: JSON.stringify({ fromPhase: 'practice' }),
      })
      setPhase('check')
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
      const res = await api<{
        stars: number
        message: string
        nextQuestId: string | null
        newAchievements?: string[]
        courseCredential?: string | null
      }>(`/api/progress/${questId}/check`, {
        method: 'POST',
        body: JSON.stringify({
          answers: quest.check.map((q) => ({
            questionId: q.id,
            optionIndex: answers[q.id] as number,
          })),
        }),
      })
      setCheckResult(res)
      setPhase('done')
    } catch (e) {
      if (!recoverCurrentPhase(e)) {
        setError(e instanceof Error ? e.message : 'Chưa gửi được')
      }
    } finally {
      setBusy(false)
    }
  }

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
          <Button variant="secondary">Về bản đồ</Button>
        </Link>
      </div>
    )
  }

  if (!quest) {
    return <p className="text-muted">Không tìm thấy trạm.</p>
  }

  return (
    <div className="page-enter flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-brand-500">Trạm {quest.order}</p>
          <h1 className="font-display text-3xl">{quest.title}</h1>
        </div>
        <div className="flex gap-1" aria-label="Tiến trình bài">
          {(['learn', 'game', 'practice', 'check'] as const).map((p) => (
            <span
              key={p}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-extrabold transition-colors duration-200',
                phase === p || (phase === 'done' && p === 'check')
                  ? 'bg-brand-500 text-white'
                  : 'bg-brand-50 text-muted',
              )}
            >
              {p === 'learn'
                ? 'Học'
                : p === 'game'
                  ? 'Game'
                  : p === 'practice'
                    ? 'Làm'
                    : 'Check'}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <p
          className="rounded-xl bg-coral-100 px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {error}
        </p>
      )}

      {phase === 'learn' && (
        <div className="ui-card flex flex-col gap-4 p-5 animate-fade-up">
          <p className="text-lg font-bold">{quest.hook}</p>
          {quest.videoUrl && (
            <div className="overflow-hidden rounded-2xl border-2 border-border bg-black/5">
              <p className="bg-brand-50 px-3 py-2 text-xs font-extrabold uppercase text-brand-600">
                Video bài giảng
              </p>
              <video
                className="aspect-video w-full bg-black"
                controls
                playsInline
                preload="metadata"
                src={quest.videoUrl}
              >
                Trình duyệt không hỗ trợ video.
              </video>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            {quest.learnCards.map((card) => (
              <div
                key={card.id}
                className="rounded-2xl border-2 border-border bg-brand-50/50 p-4"
              >
                <p className="text-xs font-extrabold uppercase text-brand-500">
                  {card.title}
                </p>
                <p className="mt-1 text-sm">{card.body}</p>
                <p className="mt-2 text-xs text-muted">💡 {card.tip}</p>
              </div>
            ))}
          </div>
          <ul className="list-inside list-disc text-sm text-muted">
            {quest.goals.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
          <Button
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
            {reviewMode ? 'Quay lại kết quả' : 'Bắt đầu trò chơi'}
          </Button>
        </div>
      )}

      {phase === 'game' && gameStation && (
        <div className="ui-card p-5 animate-fade-up">
          <CurriculumGame
            gameType={gameStation.gameType}
            gameConfig={gameStation.gameConfig}
            instruction={
              gameStation.instruction ??
              'Chơi một lượt để ghi nhớ ý chính của bài.'
            }
            outcome={gameStation.outcome}
            onComplete={(evidence) => void advanceFromGame(evidence)}
          />
        </div>
      )}

      {phase === 'practice' && (
        <div className="ui-card flex flex-col gap-4 p-5 animate-fade-up">
          {practiceStation?.instruction && (
            <div className="rounded-2xl border-2 border-mint-100 bg-mint-100/40 p-4">
              <p className="font-display text-xl">✏️ Nhiệm vụ thực hành</p>
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
          {quest.practiceKind === 'chips' && quest.chips && (
            <>
              <p className="font-extrabold">Ghép thẻ để mô tả cho AI</p>
              {(Object.keys(quest.chips) as PromptSlotKey[]).map((slot) => (
                <div key={slot}>
                  <p className="mb-2 text-sm font-bold capitalize text-muted">
                    {slot}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(quest.chips![slot] ?? []).map((chip) => (
                      <button
                        key={chip.id}
                        type="button"
                        className={cn(
                          'chip',
                          parts[slot]?.id === chip.id && 'chip-active',
                        )}
                        onClick={() => selectChip(chip as PromptChip)}
                      >
                        <span>{chip.emoji}</span> {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="rounded-2xl bg-sky-100 p-3 text-sm">
                <strong>Câu mô tả:</strong> {promptText}
              </div>
            </>
          )}

          {quest.practiceKind === 'character' && (
            <>
              <div className="overflow-hidden rounded-2xl border-2 border-border">
                <img
                  src={designerAssets.workshop.character}
                  alt=""
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
                <p className="mb-2 text-sm font-bold text-muted">Tính cách</p>
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
                  Đã chọn: <strong>{ART_STYLES.find((x) => x.id === styleId)?.labelVi}</strong>
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
                          setStory((s) => ({ ...s, [block.key]: item.label }))
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
                className="min-h-20 rounded-2xl border-2 border-border p-3 text-sm"
                placeholder="Vì sao con chọn màu này?"
                value={journalText}
                maxLength={200}
                onChange={(e) => setJournalText(e.target.value)}
              />
            </div>
          )}

          {generated && (
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
              <p className="p-2 text-center text-sm font-bold">{generated.title}</p>
            </div>
          )}

          <Button onClick={() => void savePractice()} disabled={busy}>
            {busy ? 'Đang lưu…' : 'Lưu sản phẩm và thử tài'}
          </Button>
        </div>
      )}

      {phase === 'check' && (
        <div className="ui-card flex flex-col gap-4 p-5 animate-fade-up">
          <p className="font-extrabold">Check nhanh — không sao nếu thử lại!</p>
          {quest.check.map((q) => (
            <div key={q.id}>
              <p className="mb-2 font-bold">{q.question}</p>
              <div className="flex flex-col gap-2">
                {q.options.map((opt, idx) => (
                  <button
                    key={opt}
                    type="button"
                    className={cn(
                      'rounded-2xl border-2 px-4 py-3 text-left text-sm font-semibold transition',
                      answers[q.id] === idx
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-border bg-white',
                    )}
                    onClick={() =>
                      setAnswers((a) => ({ ...a, [q.id]: idx }))
                    }
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <Button
            onClick={() => void submitCheck()}
            disabled={
              busy || quest.check.some((q) => answers[q.id] === undefined)
            }
          >
            {busy ? 'Chấm…' : 'Nộp bài & nhận sao'}
          </Button>
        </div>
      )}

      {phase === 'done' && checkResult && (
        <div className="ui-card flex flex-col items-center gap-3 p-8 text-center animate-pop">
          <p className="text-5xl" aria-label={`${checkResult.stars} sao`}>
            {'⭐'.repeat(Math.max(1, checkResult.stars))}
          </p>
          <h2 className="font-display text-3xl">Hoàn thành trạm!</h2>
          <p className="text-muted">{checkResult.message}</p>
          <p className="text-sm">Phần thưởng: {quest.reward}</p>
          {checkResult.newAchievements &&
            checkResult.newAchievements.length > 0 && (
              <p className="rounded-2xl bg-sun-100 px-4 py-2 text-sm font-extrabold text-warning">
                🏆 Huy hiệu mới: {checkResult.newAchievements.join(', ')}
              </p>
            )}
          {checkResult.courseCredential && (
            <div className="rounded-3xl border-2 border-sun-200 bg-sun-100/60 px-5 py-4">
              <p className="font-display text-xl">🎓 Huy hiệu hoàn thành khóa</p>
              <p className="mt-1 text-sm font-bold">
                {checkResult.courseCredential}
              </p>
              <p className="mt-1 text-xs text-muted">
                Do AI Kids Creator Academy ghi nhận · đã lưu riêng tư vào Vũ trụ của em
              </p>
            </div>
          )}
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {checkResult.nextQuestId ? (
              <Button
                onClick={() =>
                  navigate(`/lesson/${checkResult.nextQuestId}`)
                }
              >
                Trạm tiếp theo
              </Button>
            ) : null}
            <Button
              variant="secondary"
              onClick={() => navigate(`/world/${quest.courseId}`)}
            >
              Về bản đồ
            </Button>
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
    </div>
  )
}
