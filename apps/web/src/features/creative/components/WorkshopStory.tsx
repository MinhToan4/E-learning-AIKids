import { useState } from 'react'
import { BookOpen, ChevronRight, Sparkles } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { generateCreativeStory } from '@/shared/lib/creative-api'
import { STORY_GENRES } from '../lib/workshop-types'
import type { WorkshopStep } from '../lib/workshop-types'

// ── Story flow steps ──────────────────────────────────────────
type StoryFlowStep = 'genre' | 'idea' | 'result'

type StoryDraft = {
  genre: string
  genreLabel: string
  idea: string
  characters: string
  setting: string
}

type Props = {
  initialStep?: StoryFlowStep
  onBack: (step: WorkshopStep) => void
  onSaved: () => void
}

const EMPTY_DRAFT: StoryDraft = {
  genre: '',
  genreLabel: '',
  idea: '',
  characters: '',
  setting: '',
}

export function WorkshopStory({ initialStep = 'genre', onBack, onSaved }: Props) {
  const [flowStep, setFlowStep] = useState<StoryFlowStep>(initialStep)
  const [draft, setDraft] = useState<StoryDraft>(EMPTY_DRAFT)
  const [generating, setGenerating] = useState(false)
  const [storyResult, setStoryResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // ── Genre picker ──────────────────────────────────────────────
  if (flowStep === 'genre') {
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
              Bước 1 / 3
            </p>
            <h2 className="font-display text-2xl text-text">Chọn thể loại truyện</h2>
            <p className="mt-0.5 text-sm text-muted">Con muốn kể câu chuyện gì hôm nay?</p>
          </div>
          <button
            type="button"
            onClick={() => onBack('hub')}
            className="rounded-btn border border-border bg-white px-4 py-2 text-sm font-bold text-muted transition hover:border-brand-300"
          >
            ← Trở về
          </button>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
          {STORY_GENRES.map((genre) => {
            const active = draft.genre === genre.id
            return (
              <button
                key={genre.id}
                type="button"
                aria-pressed={active}
                onClick={() => setDraft((d) => ({ ...d, genre: genre.id, genreLabel: genre.label }))}
                className={cn(
                  'flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition',
                  active
                    ? 'border-brand-500 bg-brand-50 shadow-clay'
                    : 'border-border bg-white hover:border-brand-300 hover:bg-brand-50/40',
                )}
              >
                <span className="text-2xl">{genre.label.split(' ')[0]}</span>
                <span className="font-display text-base font-extrabold text-text">
                  {genre.label.replace(/^\S+ /, '')}
                </span>
                <span className="text-xs text-muted">{genre.desc}</span>
              </button>
            )
          })}
        </div>

        <div className="flex justify-end border-t border-border pt-4">
          <button
            type="button"
            disabled={!draft.genre}
            onClick={() => setFlowStep('idea')}
            className="ui-btn ui-btn-primary gap-2 disabled:opacity-50"
          >
            Tiếp tục <ChevronRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  // ── Idea builder ──────────────────────────────────────────────
  if (flowStep === 'idea') {
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
              Bước 2 / 3 · {draft.genreLabel}
            </p>
            <h2 className="font-display text-2xl text-text">Xây dựng ý tưởng</h2>
          </div>
          <button
            type="button"
            onClick={() => setFlowStep('genre')}
            className="rounded-btn border border-border bg-white px-4 py-2 text-sm font-bold text-muted transition hover:border-brand-300"
          >
            ← Thể loại
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-extrabold text-text">
              Ý tưởng chính của câu chuyện *
            </span>
            <textarea
              value={draft.idea}
              onChange={(e) => setDraft((d) => ({ ...d, idea: e.target.value }))}
              placeholder="Ví dụ: Một chú mèo nhỏ phát hiện ra cánh cổng bí ẩn dẫn đến vương quốc thần tiên..."
              className="w-full rounded-2xl border-2 border-border bg-white p-3 text-sm font-semibold text-text placeholder:text-muted/60 focus:border-brand-400 focus:outline-none"
              rows={3}
              maxLength={300}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-extrabold text-text">
              Nhân vật chính
            </span>
            <input
              type="text"
              value={draft.characters}
              onChange={(e) => setDraft((d) => ({ ...d, characters: e.target.value }))}
              placeholder="Ví dụ: Mèo Sao, Cô bé Hana, Robot Tita..."
              className="w-full rounded-2xl border-2 border-border bg-white p-3 text-sm font-semibold text-text placeholder:text-muted/60 focus:border-brand-400 focus:outline-none"
              maxLength={100}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-extrabold text-text">
              Bối cảnh
            </span>
            <input
              type="text"
              value={draft.setting}
              onChange={(e) => setDraft((d) => ({ ...d, setting: e.target.value }))}
              placeholder="Ví dụ: Một khu rừng ma thuật, trái đất năm 3000, thành phố ven biển..."
              className="w-full rounded-2xl border-2 border-border bg-white p-3 text-sm font-semibold text-text placeholder:text-muted/60 focus:border-brand-400 focus:outline-none"
              maxLength={100}
            />
          </label>

          {error && (
            <p className="rounded-2xl border-2 border-coral-200 bg-coral-50 p-3 text-sm font-bold text-danger">
              {error}
            </p>
          )}
        </div>

        <div className="mt-auto flex justify-between border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setFlowStep('genre')}
            className="rounded-btn border border-border px-4 py-2 text-sm font-bold text-muted"
          >
            ← Quay lại
          </button>
          <button
            type="button"
            disabled={!draft.idea.trim() || generating}
            onClick={generateStory}
            className="ui-btn ui-btn-primary gap-2 disabled:opacity-50"
          >
            {generating ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Sparkles size={16} />
            )}
            {generating ? 'AI đang viết…' : 'AI Sáng Tác'}
          </button>
        </div>
      </div>
    )
  }

  // ── Result ────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-mint-700">
            Bước 3 / 3 · Hoàn thành
          </p>
          <h2 className="font-display text-2xl text-text">Câu chuyện của con</h2>
        </div>
        <button
          type="button"
          onClick={() => { setFlowStep('idea'); setStoryResult(null); setError(null) }}
          className="rounded-btn border border-border bg-white px-4 py-2 text-sm font-bold text-muted transition hover:border-brand-300"
        >
          ← Viết lại
        </button>
      </div>

      <div className="flex-1 overflow-y-auto rounded-2xl border-2 border-border bg-white p-5">
        <div className="flex gap-3">
          <BookOpen size={20} className="mt-1 shrink-0 text-brand-400" />
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">{storyResult}</p>
        </div>
      </div>

      <div className="flex gap-3 border-t border-border pt-4">
        <button type="button" onClick={generateStory} disabled={generating}
          className="ui-btn ui-btn-secondary flex-1 gap-2 disabled:opacity-50">
          <Sparkles size={16} /> Viết thêm bản khác
        </button>
        <button type="button" onClick={handleSave}
          className="ui-btn ui-btn-primary flex-1 gap-2">
          Lưu vào Ba lô
        </button>
      </div>
    </div>
  )

  async function generateStory() {
    setGenerating(true)
    setError(null)
    try {
      const content = await generateCreativeStory(
        [
          'Viết một truyện thiếu nhi an toàn bằng tiếng Việt.',
          `Thể loại: ${draft.genre}.`,
          `Ý tưởng: ${draft.idea}.`,
          `Nhân vật: ${draft.characters}.`,
          `Bối cảnh: ${draft.setting}.`,
          'Nội dung tích cực, phù hợp trẻ em, có mở đầu, cao trào và kết thúc.',
        ].join('\n'),
      )
      setStoryResult(content)
      setFlowStep('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setGenerating(false)
    }
  }

  function handleSave() {
    onSaved()
  }
}
