import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, Check, Clapperboard, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, ChoiceCard } from '@/components/ui/Card'
import { MissionBanner } from '@/components/ui/MissionBanner'
import { CheerOverlay, useCheer } from '@/components/game/CheerBurst'
import {
  STORY_ENDINGS,
  STORY_OPENINGS,
  STORY_PROBLEMS,
  storyToPanelHints,
} from '@/lib/flow'
import { useDemoStore } from '@/store/demo-store'
import { cn } from '@/lib/cn'

/**
 * Story outline BEFORE 4-panel comic.
 * Flow: images → quiz → THIS → comic → video
 * Design: playful “story workshop” — not a form.
 */
export function StoryStudioPage() {
  const navigate = useNavigate()
  const outline = useDemoStore((s) => s.storyOutline)
  const setStoryOutline = useDemoStore((s) => s.setStoryOutline)
  const setCurrentQuest = useDemoStore((s) => s.setCurrentQuest)
  const addStars = useDemoStore((s) => s.addStars)
  const addToast = useDemoStore((s) => s.addToast)
  const project = useDemoStore((s) => s.currentProject)
  const { cheer, fire } = useCheer()

  const stepsDone = [outline.opening, outline.problem, outline.ending].filter(Boolean).length
  const ready = stepsDone === 3
  const panelHints = useMemo(() => storyToPanelHints(outline), [outline])

  const goComic = () => {
    if (!ready) {
      addToast({
        type: 'warning',
        title: 'Chưa đủ 3 mảnh',
        description: 'Chọn Mở đầu · Vấn đề · Kết thúc nhé!',
      })
      return
    }
    useDemoStore.getState().markPracticeDone('plot')
    addStars(10)
    setCurrentQuest('plot')
    fire('Cốt truyện xong!')
    addToast({
      type: 'success',
      title: 'Đã có câu chuyện!',
      description: 'Làm trắc nghiệm ngắn, rồi xếp 4 khung.',
    })
    navigate('/lesson/plot?step=quiz')
  }

  return (
    <div className="stage-shell space-y-5 pb-28 sm:pb-10">
      <CheerOverlay message={cheer} />

      {/* Hero workshop */}
      <section className="relative overflow-hidden rounded-[1.75rem] border-2 border-white shadow-clay">
        <div className="absolute inset-0">
          <img
            src="/assets/story-workshop.jpg"
            alt=""
            className="size-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1e2740]/92 via-[#1e2740]/75 to-[#6d5efc]/40" />
        </div>
        <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
          <div className="max-w-xl text-white">
            <p className="text-sm font-bold text-sun-400">Xưởng kể chuyện · Trước khi vẽ 4 khung</p>
            <h1 className="mt-1 font-display text-3xl sm:text-4xl">Tạo nội dung truyện</h1>
            <p className="mt-2 text-base font-semibold text-white/90">
              Chọn 3 mảnh cốt truyện → xem trước 4 khung → rồi mới làm truyện tranh.
              Giống game: xong thử thách này mới mở màn “vẽ truyện”.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { n: 1, label: 'Mở đầu', ok: !!outline.opening },
                { n: 2, label: 'Vấn đề', ok: !!outline.problem },
                { n: 3, label: 'Kết thúc', ok: !!outline.ending },
              ].map((s) => (
                <span
                  key={s.n}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold',
                    s.ok ? 'bg-mint-400 text-[#0f3d2a]' : 'bg-white/20 text-white',
                  )}
                >
                  {s.ok ? <Check className="size-3.5" /> : <span>{s.n}</span>}
                  {s.label}
                </span>
              ))}
            </div>
          </div>
          {project.cover ? (
            <img
              src={project.cover}
              alt="Ảnh đã tạo"
              className="h-28 w-36 rounded-2xl border-2 border-white object-cover shadow-soft sm:h-32 sm:w-44"
            />
          ) : null}
        </div>
      </section>

      <MissionBanner
        doing="Ghép 3 mảnh câu chuyện"
        why="Có cốt truyện rõ trước khi vẽ 4 khung — dễ hơn làm truyện mù"
        reward="+20 sao · Mở truyện 4 khung"
      />

      {/* Progress bar game-style */}
      <div className="rounded-2xl border-2 border-brand-100 bg-white p-4 shadow-soft">
        <div className="mb-2 flex items-center justify-between text-sm font-bold">
          <span className="text-text">Tiến độ cốt truyện</span>
          <span className="text-brand-600">{stepsDone}/3 mảnh</span>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-brand-50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-mint-400 transition-all duration-300"
            style={{ width: `${(stepsDone / 3) * 100}%` }}
          />
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-bold">Tên truyện (tùy chọn, vui là được)</span>
        <input
          value={outline.title}
          onChange={(e) => setStoryOutline({ title: e.target.value.slice(0, 48) })}
          className="min-h-12 w-full max-w-xl rounded-2xl border-2 border-border bg-white px-4 text-base font-bold outline-none focus:border-brand-500"
          placeholder="Ví dụ: Mèo Sao và Hành tinh Kẹo"
        />
      </label>

      <StorySection
        step="1"
        title="Mở đầu"
        hint="Câu chuyện bắt đầu thế nào?"
        color="brand"
        options={STORY_OPENINGS}
        value={outline.opening}
        onPick={(label) => {
          setStoryOutline({ opening: label })
          fire('Mở đầu hay!')
        }}
      />
      <StorySection
        step="2"
        title="Vấn đề / sự cố"
        hint="Có chuyện gì bất ngờ?"
        color="coral"
        options={STORY_PROBLEMS}
        value={outline.problem}
        onPick={(label) => {
          setStoryOutline({ problem: label })
          fire('Hồi hộp quá!')
        }}
      />
      <StorySection
        step="3"
        title="Kết thúc"
        hint="Mọi thứ giải quyết ra sao?"
        color="mint"
        options={STORY_ENDINGS}
        value={outline.ending}
        onPick={(label) => {
          setStoryOutline({ ending: label })
          fire('Kết đẹp!')
        }}
      />

      {/* Live story card */}
      <Card className="border-2 border-brand-200 bg-gradient-to-br from-white to-brand-50">
        <div className="flex items-center gap-2 text-brand-600">
          <BookOpen className="size-5" aria-hidden />
          <h2 className="font-display text-xl">Truyện của con</h2>
        </div>
        <p className="mt-2 font-display text-lg text-text">
          {outline.title || 'Chưa đặt tên'}
        </p>
        <ol className="mt-3 space-y-2 text-sm font-semibold text-text sm:text-base">
          <li className="rounded-xl bg-white/80 px-3 py-2">
            <span className="text-brand-600">Mở đầu: </span>
            {outline.opening || '…'}
          </li>
          <li className="rounded-xl bg-white/80 px-3 py-2">
            <span className="text-coral-400">Vấn đề: </span>
            {outline.problem || '…'}
          </li>
          <li className="rounded-xl bg-white/80 px-3 py-2">
            <span className="text-success">Kết thúc: </span>
            {outline.ending || '…'}
          </li>
        </ol>
      </Card>

      {/* 4-panel storyboard preview — bridge to comic */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Clapperboard className="size-5 text-brand-500" aria-hidden />
          <h2 className="font-display text-xl text-text">Xem trước 4 khung (sắp làm)</h2>
        </div>
        <p className="text-sm text-muted">
          3 mảnh cốt truyện sẽ được trải ra 4 khung truyện tranh. Con xem trước rồi bấm tiếp.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {panelHints.map((h) => (
            <div
              key={h.panel}
              className={cn(
                'rounded-2xl border-2 bg-white p-3 shadow-soft',
                ready ? 'border-mint-400/60' : 'border-border',
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="flex size-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">
                  {h.panel}
                </span>
                <span className="text-xs font-bold uppercase text-muted">{h.label}</span>
              </div>
              <p className="min-h-[3.5rem] text-sm font-bold leading-snug text-text">
                {h.beat}
              </p>
              <p className="mt-2 text-xs font-semibold text-muted">{h.tip}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="secondary" onClick={() => navigate('/studio/compare')}>
          Về chọn ảnh
        </Button>
        <Button size="lg" className="flex-1 min-h-14" disabled={!ready} onClick={goComic}>
          <Sparkles className="size-5" aria-hidden />
          Xong cốt truyện · Làm 4 khung
          <ArrowRight className="size-5" aria-hidden />
        </Button>
      </div>
      {!ready ? (
        <p className="text-center text-sm font-semibold text-muted">
          Còn {3 - stepsDone} mảnh nữa là mở được truyện 4 khung!
        </p>
      ) : null}
    </div>
  )
}

function StorySection({
  step,
  title,
  hint,
  options,
  value,
  onPick,
  color,
}: {
  step: string
  title: string
  hint: string
  options: { id: string; label: string; emoji: string }[]
  value: string
  onPick: (label: string) => void
  color: 'brand' | 'coral' | 'mint'
}) {
  const ring =
    color === 'brand'
      ? 'border-brand-200'
      : color === 'coral'
        ? 'border-coral-100'
        : 'border-mint-100'
  return (
    <section className={cn('rounded-[1.5rem] border-2 bg-white/80 p-4 shadow-soft sm:p-5', ring)}>
      <h2 className="font-display text-xl text-text">
        {step}. {title}
      </h2>
      <p className="mb-3 text-sm text-muted">{hint}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((o) => {
          const selected = value === o.label
          return (
            <ChoiceCard
              key={o.id}
              selected={selected}
              onClick={() => onPick(o.label)}
              className={cn(
                'min-h-[6rem] p-3 transition-transform active:scale-[0.98]',
                selected && 'shadow-clay',
              )}
            >
              <span className="text-3xl" aria-hidden>
                {o.emoji}
              </span>
              <p className="mt-2 text-sm font-bold leading-snug">{o.label}</p>
              {selected ? (
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-success">
                  <Check className="size-3.5" /> Đã chọn
                </span>
              ) : null}
            </ChoiceCard>
          )
        })}
      </div>
    </section>
  )
}
