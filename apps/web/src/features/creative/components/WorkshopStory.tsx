import { useState } from 'react'
import { BookOpen, ChevronRight, Sparkles } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { api } from '@/shared/lib/api'
import { generateCreativeStory } from '@/shared/lib/creative-api'
import { STORY_GENRES } from '../lib/workshop-types'
import type { WorkshopStep } from '../lib/workshop-types'

// ΓöÇΓöÇ Story flow steps ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
type StoryFlowStep = 'mode' | 'genre' | 'idea' | 'result'
type StoryMode = 'text' | 'comic'

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

export function WorkshopStory({ initialStep = 'mode', onBack, onSaved }: Props) {
  const [flowStep, setFlowStep] = useState<StoryFlowStep>(initialStep)
  const [mode, setMode] = useState<StoryMode>('text')
  const [draft, setDraft] = useState<StoryDraft>(EMPTY_DRAFT)
  const [generating, setGenerating] = useState(false)
  const [storyResult, setStoryResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  if (flowStep === 'mode') {
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
              S├íng t├íc truyß╗çn ┬╖ AiKid
            </p>
            <h2 className="font-display text-2xl text-text">Con muß╗æn tß║ío loß║íi truyß╗çn n├áo?</h2>
          </div>
          <button type="button" onClick={() => onBack('hub')}
            className="rounded-btn border border-border bg-white px-4 py-2 text-sm font-bold text-muted">
            ΓåÉ Trß╗ƒ vß╗ü
          </button>
        </div>
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          {([
            ['text', '≡ƒôû Truyß╗çn chß╗»', 'S├íng t├íc c├óu chuyß╗çn bß║▒ng v─ân bß║ún, c├│ mß╗ƒ ─æß║ºu, cao tr├áo v├á kß║┐t th├║c.'],
            ['comic', '≡ƒû╝∩╕Å Truyß╗çn tranh', 'Lß║¡p kß╗ïch bß║ún 4 khung vß╗¢i cß║únh, h├ánh ─æß╗Öng v├á lß╗¥i thoß║íi r├╡ r├áng.'],
          ] as const).map(([id, title, description]) => (
            <button key={id} type="button" onClick={() => { setMode(id); setFlowStep('genre') }}
              className="rounded-3xl border-2 border-border bg-white p-6 text-left shadow-soft transition hover:border-brand-400 hover:bg-brand-50">
              <span className="font-display text-2xl text-text">{title}</span>
              <span className="mt-2 block text-sm text-muted">{description}</span>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-extrabold text-brand-600">
                Bß║»t ─æß║ºu <ChevronRight size={16} />
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ΓöÇΓöÇ Genre picker ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  if (flowStep === 'genre') {
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
              B╞░ß╗¢c 1 / 3 ┬╖ {mode === 'comic' ? 'Truyß╗çn tranh' : 'Truyß╗çn chß╗»'}
            </p>
            <h2 className="font-display text-2xl text-text">Chß╗ìn thß╗â loß║íi truyß╗çn</h2>
            <p className="mt-0.5 text-sm text-muted">Con muß╗æn kß╗â c├óu chuyß╗çn g├¼ h├┤m nay?</p>
          </div>
          <button
            type="button"
            onClick={() => setFlowStep('mode')}
            className="rounded-btn border border-border bg-white px-4 py-2 text-sm font-bold text-muted transition hover:border-brand-300"
          >
            ΓåÉ Trß╗ƒ vß╗ü
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
            Tiß║┐p tß╗Ñc <ChevronRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  // ΓöÇΓöÇ Idea builder ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  if (flowStep === 'idea') {
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
              B╞░ß╗¢c 2 / 3 ┬╖ {draft.genreLabel}
            </p>
            <h2 className="font-display text-2xl text-text">X├óy dß╗▒ng ├╜ t╞░ß╗ƒng</h2>
          </div>
          <button
            type="button"
            onClick={() => setFlowStep('genre')}
            className="rounded-btn border border-border bg-white px-4 py-2 text-sm font-bold text-muted transition hover:border-brand-300"
          >
            ΓåÉ Thß╗â loß║íi
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-extrabold text-text">
              ├¥ t╞░ß╗ƒng ch├¡nh cß╗ºa c├óu chuyß╗çn *
            </span>
            <textarea
              value={draft.idea}
              onChange={(e) => setDraft((d) => ({ ...d, idea: e.target.value }))}
              placeholder="V├¡ dß╗Ñ: Mß╗Öt ch├║ m├¿o nhß╗Å ph├ít hiß╗çn ra c├ính cß╗òng b├¡ ß║⌐n dß║½n ─æß║┐n v╞░╞íng quß╗æc thß║ºn ti├¬n..."
              className="w-full rounded-2xl border-2 border-border bg-white p-3 text-sm font-semibold text-text placeholder:text-muted/60 focus:border-brand-400 focus:outline-none"
              rows={3}
              maxLength={300}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-extrabold text-text">
              Nh├ón vß║¡t ch├¡nh
            </span>
            <input
              type="text"
              value={draft.characters}
              onChange={(e) => setDraft((d) => ({ ...d, characters: e.target.value }))}
              placeholder="V├¡ dß╗Ñ: M├¿o Sao, C├┤ b├⌐ Hana, Robot Tita..."
              className="w-full rounded-2xl border-2 border-border bg-white p-3 text-sm font-semibold text-text placeholder:text-muted/60 focus:border-brand-400 focus:outline-none"
              maxLength={100}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-extrabold text-text">
              Bß╗æi cß║únh
            </span>
            <input
              type="text"
              value={draft.setting}
              onChange={(e) => setDraft((d) => ({ ...d, setting: e.target.value }))}
              placeholder="V├¡ dß╗Ñ: Mß╗Öt khu rß╗½ng ma thuß║¡t, tr├íi ─æß║Ñt n─âm 3000, th├ánh phß╗æ ven biß╗ân..."
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
            ΓåÉ Quay lß║íi
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
            {generating ? 'AI ─æang viß║┐tΓÇª' : 'AI S├íng T├íc'}
          </button>
        </div>
      </div>
    )
  }

  // ΓöÇΓöÇ Result ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-mint-700">
            B╞░ß╗¢c 3 / 3 ┬╖ Ho├án th├ánh
          </p>
          <h2 className="font-display text-2xl text-text">
            {mode === 'comic' ? 'Kß╗ïch bß║ún truyß╗çn tranh cß╗ºa con' : 'C├óu chuyß╗çn cß╗ºa con'}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => { setFlowStep('idea'); setStoryResult(null); setError(null) }}
          className="rounded-btn border border-border bg-white px-4 py-2 text-sm font-bold text-muted transition hover:border-brand-300"
        >
          ΓåÉ Viß║┐t lß║íi
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
          <Sparkles size={16} /> Viß║┐t th├¬m bß║ún kh├íc
        </button>
        <button type="button" onClick={() => void handleSave()} disabled={saving}
          className="ui-btn ui-btn-primary flex-1 gap-2 disabled:opacity-50">
          {saving ? '─Éang l╞░uΓÇª' : 'L╞░u v├áo Ba l├┤'}
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
          mode === 'comic'
            ? 'Viß║┐t kß╗ïch bß║ún truyß╗çn tranh thiß║┐u nhi an to├án bß║▒ng tiß║┐ng Viß╗çt gß╗ôm ─æ├║ng 4 khung. Mß╗ùi khung c├│ m├┤ tß║ú cß║únh, h├ánh ─æß╗Öng v├á lß╗¥i thoß║íi ngß║»n.'
            : 'Viß║┐t mß╗Öt truyß╗çn thiß║┐u nhi an to├án bß║▒ng tiß║┐ng Viß╗çt.',
          `Thß╗â loß║íi: ${draft.genre}.`,
          `├¥ t╞░ß╗ƒng: ${draft.idea}.`,
          `Nh├ón vß║¡t: ${draft.characters}.`,
          `Bß╗æi cß║únh: ${draft.setting}.`,
          'Nß╗Öi dung t├¡ch cß╗▒c, ph├╣ hß╗úp trß║╗ em, c├│ mß╗ƒ ─æß║ºu, cao tr├áo v├á kß║┐t th├║c.',
        ].join('\n'),
      )
      setStoryResult(content)
      setFlowStep('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lß╗ùi kh├┤ng x├íc ─æß╗ïnh')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSave() {
    if (!storyResult) return
    setSaving(true)
    setError(null)
    try {
      await api('/api/media/promote', {
        method: 'POST',
        body: JSON.stringify({
          purpose: 'creative_workshop',
          creativeKind: mode === 'comic' ? 'comic' : 'story',
          title: `${mode === 'comic' ? 'Truyß╗çn tranh' : 'Truyß╗çn chß╗»'} ┬╖ ${draft.genreLabel}`,
          content: storyResult,
        }),
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ch╞░a l╞░u ─æ╞░ß╗úc truyß╗çn')
    } finally {
      setSaving(false)
    }
  }
}
