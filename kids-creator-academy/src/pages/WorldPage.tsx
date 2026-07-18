import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Lock,
  Play,
  Sparkles,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/Progress'
import { useDemoStore } from '@/store/demo-store'
import { MASCOT_SRC, questRoute } from '@/data/mock'
import {
  COURSES,
  QUEST_KID,
  courseProgress,
  getCourse,
  type Course,
} from '@/data/courses'
import { challengeAfter } from '@/data/challenges'
import { cn } from '@/lib/cn'
import { computeQuestStatuses } from '@/lib/quests'

export function WorldPage() {
  const navigate = useNavigate()
  const completed = useDemoStore((s) => s.completedQuestIds)
  const currentQuestId = useDemoStore((s) => s.currentQuestId)
  const setCurrentQuest = useDemoStore((s) => s.setCurrentQuest)
  const selectedCourseId = useDemoStore((s) => s.selectedCourseId)
  const setSelectedCourseId = useDemoStore((s) => s.setSelectedCourseId)
  const child = useDemoStore((s) => s.child)
  const stars = useDemoStore((s) => s.stars)
  const challengesPassed = useDemoStore((s) => s.challengesPassed)
  const [view, setView] = useState<'catalog' | 'course'>('catalog')

  const course = getCourse(selectedCourseId)
  const quests = useMemo(
    () => computeQuestStatuses(completed, currentQuestId, course.quests),
    [completed, currentQuestId, course.quests],
  )

  const next = quests.find((q) => q.status === 'available' || q.status === 'in_progress')
  const progress = courseProgress(course, completed)
  const nextKid = next
    ? (QUEST_KID[next.id] ?? { make: next.title, why: next.skill, emoji: '✨' })
    : null

  const openQuest = (id: string) => {
    // Smooth create path: detective is done inside Compare, never force quiz gate that loops to prompt
    if (id === 'detective') {
      if (useDemoStore.getState().generatedResults.length > 0) {
        setCurrentQuest(id)
        navigate('/studio/compare')
        return
      }
      // No images yet → send to prompt, not a broken empty compare
      setCurrentQuest('prompt-lab')
      navigate('/studio/prompt')
      return
    }
    const prev = quests.find(
      (q) => q.order === (quests.find((x) => x.id === id)?.order ?? 0) - 1,
    )
    if (prev && completed.includes(prev.id)) {
      const ch = challengeAfter(prev.id)
      // Only gate with challenge if not the prompt→comic path (handled after compare)
      if (
        ch &&
        ch.id !== 'ch-after-prompt' &&
        !challengesPassed.includes(ch.id) &&
        id !== prev.id
      ) {
        navigate(`/challenge/${ch.id}`)
        return
      }
    }
    setCurrentQuest(id)
    navigate(questRoute(id))
  }

  if (view === 'catalog') {
    return (
      <div className="stage-shell space-y-6 pb-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold text-brand-500">Xin chào, {child.nickname} 👋</p>
            <h1 className="font-display text-3xl text-text sm:text-4xl">Chọn khóa học</h1>
            <p className="mt-1 max-w-xl text-base text-muted">
              Mỗi khóa là một cuộc phiêu lưu. Chạm vào thẻ to để xem nhiệm vụ.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="ui-chip bg-sun-100!">
              <Star className="size-4 fill-sun-400 text-sun-400" aria-hidden />
              {stars} sao
            </span>
            <span className="ui-chip bg-brand-50! text-brand-600!">{child.xp} XP</span>
          </div>
        </header>

        <ContinueBanner
          completed={completed}
          onOpen={(id) => {
            setSelectedCourseId(id)
            setView('course')
          }}
        />

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {COURSES.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              completed={completed}
              onOpen={() => {
                if (c.status === 'soon') return
                setSelectedCourseId(c.id)
                setView('course')
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="stage-shell space-y-5 pb-8">
      <button
        type="button"
        onClick={() => setView('catalog')}
        className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl bg-white px-4 text-sm font-bold text-brand-600 shadow-soft ring-1 ring-border hover:bg-brand-50"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Tất cả khóa học
      </button>

      <div className="ui-card overflow-hidden">
        <div className="relative h-40 sm:h-48">
          {course.coverImage ? (
            <img
              src={course.coverImage}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <div
              className="size-full"
              style={{
                background: `linear-gradient(135deg, ${course.coverFrom}, ${course.coverTo})`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e2740]/80 via-[#1e2740]/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
            <p className="text-sm font-bold text-white/85">Khóa học</p>
            <h1 className="font-display text-2xl sm:text-3xl">
              {course.emoji} {course.title}
            </h1>
            <p className="mt-1 text-sm font-semibold text-white/90">{course.tagline}</p>
          </div>
        </div>
        <div className="space-y-3 p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">
            <span className="ui-chip">
              <Clock className="size-3.5" aria-hidden />
              {course.durationLabel}
            </span>
            <span className="ui-chip">
              <BookOpen className="size-3.5" aria-hidden />
              {progress.total} nhiệm vụ
            </span>
            <span className="ui-chip">
              <Sparkles className="size-3.5" aria-hidden />
              {course.productLabel}
            </span>
          </div>
          <ProgressBar
            value={progress.percent}
            label={`Đã xong ${progress.done}/${progress.total}`}
          />
        </div>
      </div>

      {next && nextKid ? (
        <div className="rounded-[1.5rem] border-2 border-brand-500 bg-gradient-to-br from-brand-50 via-white to-sky-100 p-4 shadow-clay sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <img
              src={MASCOT_SRC}
              alt=""
              className="mx-auto size-20 sm:mx-0"
              width={80}
              height={80}
            />
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-600">
                Nhiệm vụ đang mở
              </p>
              <p className="font-display text-xl text-text sm:text-2xl">
                <span aria-hidden>{nextKid.emoji} </span>
                {next.order}. {nextKid.make}
              </p>
              <p className="mt-1 text-sm text-muted">{nextKid.why}</p>
            </div>
            <Button size="lg" className="w-full sm:w-auto" onClick={() => openQuest(next.id)}>
              <Play className="size-5" aria-hidden />
              Vào nhiệm vụ
            </Button>
          </div>
        </div>
      ) : null}

      <div>
        <h2 className="mb-3 font-display text-xl text-text">Lộ trình nhiệm vụ</h2>
        <ol className="grid gap-3 md:grid-cols-2">
          {quests.map((q) => {
            const kid = QUEST_KID[q.id] ?? {
              make: q.title,
              why: q.skill,
              emoji: '✨',
            }
            const locked = q.status === 'locked'
            const done = q.status === 'completed'
            const current =
              q.status === 'available' || q.status === 'in_progress'

            return (
              <li key={q.id}>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => {
                    if (!locked) openQuest(q.id)
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl border-2 bg-white p-4 text-left shadow-soft transition-transform duration-150',
                    locked && 'cursor-not-allowed opacity-60',
                    done && 'border-mint-400/50 bg-mint-100/40',
                    current && 'border-brand-500 shadow-clay',
                    !locked && !done && !current && 'border-border hover:-translate-y-0.5',
                    !locked && 'cursor-pointer',
                  )}
                >
                  <span
                    className="flex size-14 shrink-0 items-center justify-center rounded-2xl text-2xl text-white"
                    style={{ background: locked ? '#C5CAD6' : q.accent }}
                    aria-hidden
                  >
                    {done ? '✓' : kid.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-lg text-text">
                        {q.order}. {kid.make}
                      </span>
                      {done ? (
                        <span className="rounded-full bg-mint-100 px-2 py-0.5 text-[11px] font-bold text-success">
                          Xong
                        </span>
                      ) : null}
                      {current ? (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-600">
                          Làm tiếp
                        </span>
                      ) : null}
                      {locked ? (
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-muted">
                          <Lock className="size-3" aria-hidden />
                          Khóa
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">{kid.why}</span>
                  </span>
                  {!locked ? (
                    done ? (
                      <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden />
                    ) : (
                      <ChevronRight className="size-5 shrink-0 text-brand-500" aria-hidden />
                    )
                  ) : null}
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

function ContinueBanner({
  completed,
  onOpen,
}: {
  completed: string[]
  onOpen: (id: string) => void
}) {
  const selectedCourseId = useDemoStore((s) => s.selectedCourseId)
  const course = getCourse(selectedCourseId)
  const prog = courseProgress(course, completed)
  if (course.status === 'soon' || prog.done === 0) return null

  return (
    <div className="ui-card flex flex-col gap-4 overflow-hidden p-0 sm:flex-row sm:items-stretch">
      <div className="relative h-28 w-full shrink-0 sm:h-auto sm:w-44">
        {course.coverImage ? (
          <img src={course.coverImage} alt="" className="size-full object-cover" />
        ) : (
          <div
            className="size-full"
            style={{
              background: `linear-gradient(135deg, ${course.coverFrom}, ${course.coverTo})`,
            }}
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 px-4 pb-4 sm:py-4 sm:pr-5">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-600">
          Tiếp tục học
        </p>
        <p className="font-display text-xl text-text">
          {course.emoji} {course.title}
        </p>
        <p className="text-sm text-muted">
          {prog.done}/{prog.total} nhiệm vụ · {prog.percent}%
        </p>
        <Button className="mt-1 w-full sm:w-fit" onClick={() => onOpen(course.id)}>
          Vào khóa
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  )
}

function CourseCard({
  course,
  completed,
  onOpen,
}: {
  course: Course
  completed: string[]
  onOpen: () => void
}) {
  const prog = courseProgress(course, completed)
  const soon = course.status === 'soon'
  const isNew = course.status === 'new'

  return (
    <article
      className={cn(
        'ui-card ui-card-hover flex flex-col overflow-hidden',
        soon && 'opacity-90',
      )}
    >
      <div className="relative h-40 overflow-hidden sm:h-44">
        {course.coverImage ? (
          <img
            src={course.coverImage}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="flex size-full items-center justify-center text-6xl"
            style={{
              background: `linear-gradient(145deg, ${course.coverFrom}, ${course.coverTo})`,
            }}
          >
            {course.emoji}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        {isNew ? (
          <span className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-brand-600 shadow-soft">
            Mới
          </span>
        ) : null}
        {soon ? (
          <span className="absolute right-3 top-3 rounded-full bg-slate-900/85 px-2.5 py-1 text-xs font-bold text-white">
            Sắp ra mắt
          </span>
        ) : null}
        <span className="absolute bottom-3 left-3 text-3xl drop-shadow" aria-hidden>
          {course.emoji}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-xl leading-snug text-text">{course.title}</h3>
        <p className="mt-1 text-sm font-semibold text-muted">{course.tagline}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="ui-chip">{course.ageLabel}</span>
          <span className="ui-chip">{course.durationLabel}</span>
        </div>
        {!soon ? (
          <div className="mt-3">
            <ProgressBar value={prog.percent} label={`${prog.done}/${prog.total}`} />
          </div>
        ) : null}
        <Button
          className="mt-4"
          fullWidth
          disabled={soon}
          variant={soon ? 'secondary' : 'primary'}
          onClick={onOpen}
        >
          {soon ? (
            <>
              <Lock className="size-4" aria-hidden />
              Sắp mở
            </>
          ) : prog.done > 0 ? (
            <>
              Tiếp tục
              <ChevronRight className="size-4" aria-hidden />
            </>
          ) : (
            <>
              <Play className="size-4" aria-hidden />
              Bắt đầu
            </>
          )}
        </Button>
      </div>
    </article>
  )
}
