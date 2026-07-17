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

/**
 * World map = multi-course hub.
 * 1) Catalog of courses (default)
 * 2) Inside a course = path of missions
 * Does not change studio / quest / parent flows.
 */
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

  // null view = catalog when user wants — we use selectedCourseId; catalog when empty string?
  // Use: if browsing catalog, selectedCourseId still tracks "last open" but UI mode via local state would remount.
  // Pattern: show catalog always at top OR detail when selectedCourseId is set AND user opened it.
  // Simpler: `mapView: 'catalog' | 'course'` — store as selectedCourseId + optional `worldView` in store.
  // For simplicity: if we only set course when user clicks, show catalog when `catalogMode` local.
  // Better UX: default show catalog; click course opens detail. Back returns catalog without clearing selection.

  const [view, setView] = useWorldView()

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
    const prev = quests.find(
      (q) => q.order === (quests.find((x) => x.id === id)?.order ?? 0) - 1,
    )
    if (prev && completed.includes(prev.id)) {
      const ch = challengeAfter(prev.id)
      if (ch && !challengesPassed.includes(ch.id) && id !== prev.id) {
        navigate(`/challenge/${ch.id}`)
        return
      }
    }
    setCurrentQuest(id)
    navigate(questRoute(id))
  }

  if (view === 'catalog') {
    return (
      <CourseCatalog
        childName={child.nickname}
        stars={stars}
        xp={child.xp}
        completed={completed}
        onOpenCourse={(id) => {
          const c = getCourse(id)
          if (c.status === 'soon') return
          setSelectedCourseId(id)
          setView('course')
        }}
      />
    )
  }

  return (
    <div className="w-full space-y-5 pb-6">
      <button
        type="button"
        onClick={() => setView('catalog')}
        className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-white px-3 text-sm font-bold text-brand-600 shadow-soft ring-1 ring-border hover:bg-brand-50"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Tất cả khóa học
      </button>

      {/* Course header */}
      <div
        className="overflow-hidden rounded-[1.75rem] border-2 border-white shadow-soft"
        style={{
          background: `linear-gradient(135deg, ${course.coverFrom}22, ${course.coverTo}44)`,
        }}
      >
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-6">
          <div
            className="mx-auto flex size-20 shrink-0 items-center justify-center rounded-3xl text-4xl shadow-soft sm:mx-0 sm:size-24 sm:text-5xl"
            style={{ background: course.coverFrom }}
            aria-hidden
          >
            <span className="drop-shadow-sm">{course.emoji}</span>
          </div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-sm font-bold text-brand-600">Khóa học</p>
            <h1 className="font-display text-2xl text-text sm:text-3xl">{course.title}</h1>
            <p className="mt-1 text-sm font-semibold text-muted sm:text-base">
              {course.tagline}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Chip icon={<Clock className="size-3.5" />} text={course.durationLabel} />
              <Chip icon={<BookOpen className="size-3.5" />} text={`${progress.total} nhiệm vụ`} />
              <Chip icon={<Sparkles className="size-3.5" />} text={course.productLabel} />
            </div>
            <ProgressBar
              className="mt-4 max-w-md"
              value={progress.percent}
              label={`Đã xong ${progress.done}/${progress.total} nhiệm vụ`}
            />
          </div>
        </div>
      </div>

      {/* Next mission CTA */}
      {next && nextKid && course.status !== 'soon' ? (
        <div className="rounded-[1.5rem] border-2 border-brand-500 bg-gradient-to-br from-brand-50 to-sky-100 p-4 shadow-clay sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <img
              src={MASCOT_SRC}
              alt=""
              className="mx-auto size-20 shrink-0 sm:mx-0"
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

      {/* Mission list */}
      <div>
        <h2 className="mb-3 text-base font-bold text-text">Lộ trình nhiệm vụ</h2>
        <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
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
                    'flex w-full items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition-colors duration-150',
                    locked && 'cursor-not-allowed border-border bg-white/70 opacity-65',
                    done && 'cursor-pointer border-mint-400/50 bg-mint-100/50',
                    current && 'cursor-pointer border-brand-500 bg-white shadow-soft',
                    !locked && !done && !current && 'cursor-pointer border-border bg-white',
                  )}
                >
                  <span
                    className="flex size-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white"
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
                          Làm bước trước
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

function useWorldView(): ['catalog' | 'course', (v: 'catalog' | 'course') => void] {
  return useState<'catalog' | 'course'>('catalog')
}

function Chip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-text shadow-soft">
      {icon}
      {text}
    </span>
  )
}

function CourseCatalog({
  childName,
  stars,
  xp,
  completed,
  onOpenCourse,
}: {
  childName: string
  stars: number
  xp: number
  completed: string[]
  onOpenCourse: (id: string) => void
}) {
  return (
    <div className="w-full space-y-5 pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-500">Xin chào, {childName}</p>
          <h1 className="font-display text-3xl text-text sm:text-4xl">Bản đồ khóa học</h1>
          <p className="mt-1 max-w-xl text-base text-muted">
            Chọn một khóa để xem lộ trình nhiệm vụ. Mỗi khóa tạo sản phẩm khác nhau.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex min-h-11 items-center gap-1.5 rounded-2xl bg-sun-100 px-4 text-sm font-bold text-text">
            <Star className="size-4 fill-sun-400 text-sun-400" aria-hidden />
            {stars} sao
          </span>
          <span className="inline-flex min-h-11 items-center rounded-2xl bg-brand-50 px-4 text-sm font-bold text-brand-600">
            {xp} XP
          </span>
        </div>
      </div>

      {/* Continue banner for last course with progress */}
      <ContinueCard completed={completed} onOpen={onOpenCourse} />

      <h2 className="text-base font-bold text-text">Tất cả khóa học</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
        {COURSES.map((c) => (
          <CourseCard
            key={c.id}
            course={c}
            completed={completed}
            onOpen={() => onOpenCourse(c.id)}
          />
        ))}
      </div>
    </div>
  )
}

function ContinueCard({
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
    <div className="flex flex-col gap-3 rounded-[1.5rem] border-2 border-brand-200 bg-gradient-to-r from-brand-50 to-sky-100 p-4 sm:flex-row sm:items-center sm:p-5">
      <img src={MASCOT_SRC} alt="" className="mx-auto size-16 sm:mx-0" width={64} height={64} />
      <div className="min-w-0 flex-1 text-center sm:text-left">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-600">
          Tiếp tục học
        </p>
        <p className="font-display text-xl text-text">
          {course.emoji} {course.title}
        </p>
        <p className="text-sm text-muted">
          Đã xong {prog.done}/{prog.total} nhiệm vụ · {prog.percent}%
        </p>
      </div>
      <Button size="lg" className="w-full sm:w-auto" onClick={() => onOpen(course.id)}>
        Vào khóa
        <ChevronRight className="size-5" aria-hidden />
      </Button>
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
        'flex flex-col overflow-hidden rounded-[1.5rem] border-2 bg-white shadow-soft transition-transform duration-150',
        soon ? 'border-border opacity-90' : 'border-transparent hover:-translate-y-0.5',
      )}
    >
      <div
        className="relative flex h-32 items-center justify-center sm:h-36"
        style={{
          background: `linear-gradient(145deg, ${course.coverFrom}, ${course.coverTo})`,
        }}
      >
        <span className="text-6xl drop-shadow-md" aria-hidden>
          {course.emoji}
        </span>
        {isNew ? (
          <span className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-brand-600 shadow-soft">
            Mới
          </span>
        ) : null}
        {soon ? (
          <span className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-bold text-white">
            Sắp ra mắt
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-xl text-text">{course.title}</h3>
        <p className="mt-1 text-sm font-semibold text-muted">{course.tagline}</p>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{course.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-bg px-2 py-0.5 text-[11px] font-bold text-muted">
            {course.ageLabel}
          </span>
          <span className="rounded-full bg-bg px-2 py-0.5 text-[11px] font-bold text-muted">
            {course.durationLabel}
          </span>
          <span className="rounded-full bg-bg px-2 py-0.5 text-[11px] font-bold text-muted">
            {course.productLabel}
          </span>
        </div>
        {!soon ? (
          <div className="mt-3">
            <ProgressBar value={prog.percent} label={`${prog.done}/${prog.total} nhiệm vụ`} />
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
              Bắt đầu khóa
            </>
          )}
        </Button>
      </div>
    </article>
  )
}
