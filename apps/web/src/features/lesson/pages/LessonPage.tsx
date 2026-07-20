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
import { api, type QuestDetail } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { designerAssets, styleImage } from '@/shared/config/assets'

type Phase = 'learn' | 'practice' | 'check' | 'done'

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
    imageDataUrl: string
    title: string
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
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [checkResult, setCheckResult] = useState<{
    stars: number
    message: string
    nextQuestId: string | null
  } | null>(null)
  const [busy, setBusy] = useState(false)

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
    setAnswers({})
    setCheckResult(null)
    setQuest(null)
  }, [])

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
      setPhase('practice')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi')
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
        payload = { title: 'Video mini', scenes: panels }
      } else if (quest.practiceKind === 'detective') {
        payload = { pickedCorrect: detectivePick === 0 }
      } else {
        payload = { ready: true }
      }

      const res = await api<{
        result: {
          generated?: { imageDataUrl: string; title: string }
        }
      }>(`/api/progress/${questId}/practice`, {
        method: 'POST',
        body: JSON.stringify({
          kind: quest.practiceKind === 'chips' ? 'prompt' : quest.practiceKind,
          payload,
        }),
      })
      if (res.result?.generated) setGenerated(res.result.generated)
      await api(`/api/progress/${questId}/advance`, {
        method: 'POST',
        body: JSON.stringify({ fromPhase: 'practice' }),
      })
      setPhase('check')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chưa lưu được')
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
      setError(e instanceof Error ? e.message : 'Chưa gửi được')
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
          {(['learn', 'practice', 'check'] as const).map((p) => (
            <span
              key={p}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-extrabold transition-colors duration-200',
                phase === p || (phase === 'done' && p === 'check')
                  ? 'bg-brand-500 text-white'
                  : 'bg-brand-50 text-muted',
              )}
            >
              {p === 'learn' ? 'Học' : p === 'practice' ? 'Làm' : 'Check'}
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
          <Button onClick={() => void advanceFromLearn()} disabled={busy}>
            Bắt đầu thực hành
          </Button>
        </div>
      )}

      {phase === 'practice' && (
        <div className="ui-card flex flex-col gap-4 p-5 animate-fade-up">
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
              {generated && (
                <img
                  src={generated.imageDataUrl}
                  alt={generated.title}
                  className="max-h-64 rounded-2xl border-2 border-border"
                />
              )}
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
              <p className="font-extrabold">Chọn phong cách Soft Clay</p>
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
                <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
                  {panels.map((p) => (
                    <li key={p.panel}>
                      {p.label}: {p.beat}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}

          <Button onClick={() => void savePractice()} disabled={busy}>
            {busy ? 'Đang lưu…' : 'Xong thực hành → Check'}
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
                setPhase('learn')
                setAnswers({})
                setCheckResult(null)
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
