import { useMemo, useState } from 'react'
import { ChevronRight, RotateCcw, Sparkles } from 'lucide-react'
import { api } from '@/shared/lib/api'
import { generateCreativeImage } from '@/shared/lib/creative-api'
import { designerAssets } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'
import {
  buildCharacterPrompt,
  CHARACTER_CATEGORIES,
  CHARACTER_CATEGORY_LABELS,
  CHARACTER_QUESTIONS,
  type CharacterAnswers,
  type CharacterCategoryId,
} from '../lib/character-workshop'
import type { WorkshopStep } from '../lib/workshop-types'

type Props = {
  onBack: (step: WorkshopStep) => void
  onSaved: () => void
}

export function WorkshopCharacter({ onBack, onSaved }: Props) {
  const [category, setCategory] = useState<CharacterCategoryId>('shape')
  const [idea, setIdea] = useState('')
  const [answers, setAnswers] = useState<CharacterAnswers>({})
  const [result, setResult] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const questions = CHARACTER_QUESTIONS[category]
  const completed = useMemo(
    () => Object.values(answers).filter(Boolean).length,
    [answers],
  )

  async function generate() {
    setGenerating(true)
    setError(null)
    try {
      setResult(await generateCreativeImage({
        prompt: buildCharacterPrompt(idea, answers),
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ch╞░a tß║ío ─æ╞░ß╗úc nh├ón vß║¡t')
    } finally {
      setGenerating(false)
    }
  }

  async function save() {
    if (!result) return
    setSaving(true)
    setError(null)
    try {
      await api('/api/media/promote', {
        method: 'POST',
        body: JSON.stringify({
          url: result,
          purpose: 'creative_workshop',
          creativeKind: 'character',
          title: idea.trim() || 'Nh├ón vß║¡t AI cß╗ºa con',
        }),
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ch╞░a l╞░u ─æ╞░ß╗úc nh├ón vß║¡t')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
            Nh├ón vß║¡t AI ┬╖ ─æß╗ông bß╗Ö tß╗½ AiKid app
          </p>
          <h2 className="font-display text-2xl text-text">Con muß╗æn tß║ío ng╞░ß╗¥i bß║ín n├áo?</h2>
          <p className="mt-1 text-sm text-muted">{completed} ─æß║╖c ─æiß╗âm ─æ├ú chß╗ìn</p>
        </div>
        <button type="button" onClick={() => onBack('hub')}
          className="rounded-btn border border-border bg-white px-4 py-2 text-sm font-bold text-muted">
          ΓåÉ Trß╗ƒ vß╗ü
        </button>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
        <section className="ui-card flex flex-col gap-4 p-4">
          <label>
            <span className="mb-1.5 block text-sm font-extrabold">├¥ t╞░ß╗ƒng nhanh</span>
            <textarea value={idea} onChange={(event) => setIdea(event.target.value)}
              placeholder="V├¡ dß╗Ñ: mß╗Öt ch├║ m├¿o m├áu cam tr├▓n xoe th├¡ch kh├ím ph├í v┼⌐ trß╗Ñ..."
              rows={2} maxLength={240}
              className="w-full rounded-2xl border-2 border-border p-3 text-sm font-semibold outline-none focus:border-brand-400" />
          </label>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {CHARACTER_CATEGORIES.map((id) => (
              <button key={id} type="button" onClick={() => setCategory(id)}
                className={cn(
                  'shrink-0 rounded-full border-2 px-3 py-2 text-xs font-extrabold',
                  category === id ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-border bg-white text-muted',
                )}>
                {CHARACTER_CATEGORY_LABELS[id]}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {questions.map((question) => (
              <fieldset key={question.subject} className="rounded-2xl border border-border bg-bg/50 p-3">
                <legend className="px-1 text-sm font-extrabold text-text">{question.label}</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {question.choices.map((choice) => (
                    <button key={choice} type="button"
                      onClick={() => setAnswers((current) => ({ ...current, [question.subject]: choice }))}
                      className={cn(
                        'rounded-full border px-2.5 py-1.5 text-xs font-bold transition',
                        answers[question.subject] === choice
                          ? 'border-coral-400 bg-coral-50 text-danger'
                          : 'border-border bg-white text-muted hover:border-brand-300',
                      )}>
                      {choice}
                    </button>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </section>

        <aside className="ui-card flex min-h-[420px] flex-col overflow-hidden">
          <div className="border-b border-border p-3">
            <p className="font-display text-lg">Bß║ín mß╗¢i cß╗ºa con</p>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center bg-brand-50/50 p-4">
            {result ? (
              <img src={result} alt="Nh├ón vß║¡t AI vß╗½a tß║ío" className="max-h-[460px] w-full rounded-2xl object-contain" />
            ) : (
              <div className="text-center">
                <img src={designerAssets.workshop.character} alt="" className="mx-auto h-40 w-40 rounded-3xl object-cover opacity-80" />
                <p className="mt-3 text-sm font-bold text-muted">Chß╗ìn ─æß║╖c ─æiß╗âm rß╗ôi nhß╗¥ AI vß║╜ nh├⌐!</p>
              </div>
            )}
          </div>
          {error && <p className="mx-3 mt-3 rounded-xl bg-coral-50 p-2 text-xs font-bold text-danger">{error}</p>}
          <div className="grid gap-2 p-3 sm:grid-cols-2">
            <button type="button" onClick={() => void generate()} disabled={generating}
              className="ui-btn ui-btn-primary gap-2 disabled:opacity-60">
              {result ? <RotateCcw size={16} /> : <Sparkles size={16} />}
              {generating ? 'AI ─æang vß║╜ΓÇª' : result ? 'Tß║ío bß║ún kh├íc' : 'Tß║ío nh├ón vß║¡t'}
            </button>
            <button type="button" onClick={() => void save()} disabled={!result || saving}
              className="ui-btn ui-btn-secondary gap-2 disabled:opacity-50">
              {saving ? '─Éang l╞░uΓÇª' : 'L╞░u v├áo Ba l├┤'} <ChevronRight size={16} />
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
