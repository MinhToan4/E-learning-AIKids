import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Gamepad2,
  Lock,
  Map as MapIcon,
  Play,
  Sparkles,
  Star,
  List,
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

type WorldView = 'catalog' | 'pick-mode' | 'list' | 'adventure'

/**
 * Netflix-style course hub for kids + optional Mario-like adventure map.
 * Design notes (kids 8–11):
 * - Catalog: horizontal rows (enrolled / recommended / not enrolled)
 * - Start course: pick Adventure (game path) or List
 * - Adventure: stations = challenges, D-pad move, Accept challenge CTA
 */
export function WorldPage() {
  const navigate = useNavigate()
  const completed = useDemoStore((s) => s.completedQuestIds)
  const currentQuestId = useDemoStore((s) => s.currentQuestId)
  const setCurrentQuest = useDemoStore((s) => s.setCurrentQuest)
  const selectedCourseId = useDemoStore((s) => s.selectedCourseId)
  const setSelectedCourseId = useDemoStore((s) => s.setSelectedCourseId)
  const enrolledCourseIds = useDemoStore((s) => s.enrolledCourseIds)
  const enrollCourse = useDemoStore((s) => s.enrollCourse)
  const coursePlayMode = useDemoStore((s) => s.coursePlayMode)
  const setCoursePlayMode = useDemoStore((s) => s.setCoursePlayMode)
  const child = useDemoStore((s) => s.child)
  const stars = useDemoStore((s) => s.stars)
  const challengesPassed = useDemoStore((s) => s.challengesPassed)

  const [view, setView] = useState<WorldView>('catalog')
  const course = getCourse(selectedCourseId)

  const quests = useMemo(
    () => computeQuestStatuses(completed, currentQuestId, course.quests),
    [completed, currentQuestId, course.quests],
  )
  const progress = courseProgress(course, completed)
  const next = quests.find((q) => q.status === 'available' || q.status === 'in_progress')

  const enrolled = COURSES.filter((c) => enrolledCourseIds.includes(c.id) && c.status !== 'soon')
  const recommended = COURSES.filter(
    (c) => c.recommended && !enrolledCourseIds.includes(c.id) && c.status !== 'soon',
  )
  const notEnrolled = COURSES.filter(
    (c) => !enrolledCourseIds.includes(c.id) && (!c.recommended || c.status === 'soon'),
  )

  const openQuest = (id: string) => {
    if (id === 'detective') {
      if (useDemoStore.getState().generatedResults.length > 0) {
        setCurrentQuest(id)
        navigate('/studio/compare')
        return
      }
      setCurrentQuest('prompt-lab')
      navigate('/studio/prompt')
      return
    }
    const prev = quests.find(
      (q) => q.order === (quests.find((x) => x.id === id)?.order ?? 0) - 1,
    )
    if (prev && completed.includes(prev.id)) {
      const ch = challengeAfter(prev.id)
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

  const enterCourse = (c: Course) => {
    if (c.status === 'soon') return
    if (!enrolledCourseIds.includes(c.id)) enrollCourse(c.id)
    setSelectedCourseId(c.id)
    setView('pick-mode')
  }

  if (view === 'catalog') {
    return (
      <div className="w-full space-y-8 pb-10">
        <FeaturedHero
          course={enrolled[0] ?? COURSES[0]}
          childName={child.nickname}
          stars={stars}
          xp={child.xp}
          completed={completed}
          onPlay={() => enterCourse(enrolled[0] ?? COURSES[0])}
        />

        <NetflixRow
          title="Khóa học đã đăng ký"
          subtitle="Tiếp tục cuộc phiêu lưu của con"
          emptyHint="Chưa có khóa nào — xem mục gợi ý bên dưới nhé!"
          courses={enrolled}
          completed={completed}
          enrolledIds={enrolledCourseIds}
          onOpen={enterCourse}
          onEnroll={enrollCourse}
          badgeMode="progress"
        />
        <NetflixRow
          title="Phù hợp với con"
          subtitle="Gợi ý cho bé 8–11 tuổi học AI an toàn & sáng tạo"
          emptyHint="Con đã đăng ký hết các khóa gợi ý — giỏi quá!"
          courses={recommended}
          completed={completed}
          enrolledIds={enrolledCourseIds}
          onOpen={enterCourse}
          onEnroll={enrollCourse}
          badgeMode="recommended"
        />
        <NetflixRow
          title="Chưa đăng ký / Sắp ra mắt"
          subtitle="Khám phá thêm khi con sẵn sàng"
          emptyHint="Không còn khóa chờ — con đã mở hết bản đồ!"
          courses={notEnrolled}
          completed={completed}
          enrolledIds={enrolledCourseIds}
          onOpen={enterCourse}
          onEnroll={enrollCourse}
          badgeMode="explore"
        />
      </div>
    )
  }

  if (view === 'pick-mode') {
    return (
      <div className="stage-shell mx-auto max-w-3xl space-y-5 pb-10">
        <button
          type="button"
          onClick={() => setView('catalog')}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl bg-white px-4 text-sm font-bold text-brand-600 shadow-soft ring-1 ring-border"
        >
          <ChevronLeft className="size-4" /> Tất cả khóa học
        </button>
        <div className="ui-card overflow-hidden">
          <div className="relative h-48 sm:h-56">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <p className="text-sm font-bold text-sun-400">Bắt đầu khóa học</p>
              <h1 className="font-display text-3xl sm:text-4xl">
                {course.emoji} {course.title}
              </h1>
              <p className="mt-1 text-sm text-white/90">{course.tagline}</p>
            </div>
          </div>
          <div className="space-y-4 p-5">
            <p className="text-base font-semibold text-muted">{course.description}</p>
            <p className="text-sm font-bold text-text">
              Chọn cách chơi (đổi lại bất cứ lúc nào):
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <ModeCard
                icon={<Gamepad2 className="size-9 text-brand-500" />}
                title="Phiêu lưu bản đồ"
                desc="Giống game: di chuyển nhân vật, nhận thử thách từng trạm, vượt ải để mở trạm sau."
                badge="Khuyên dùng · Vui nhất"
                highlight
                onClick={() => {
                  setCoursePlayMode('adventure')
                  setView('adventure')
                }}
              />
              <ModeCard
                icon={<List className="size-9 text-sky-400" />}
                title="Danh sách nhiệm vụ"
                desc="Xem rõ từng bước như checklist — bấm vào nhiệm vụ muốn làm."
                onClick={() => {
                  setCoursePlayMode('list')
                  setView('list')
                }}
              />
            </div>
            <p className="text-center text-xs font-semibold text-muted">
              Mỗi bài tập = một thử thách. Vượt xong → trạm tiếp theo mở ra.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (view === 'adventure' || (coursePlayMode === 'adventure' && view !== 'list')) {
    return (
      <AdventureMap
        course={course}
        quests={quests}
        stars={stars}
        onBack={() => setView('catalog')}
        onSwitchList={() => {
          setCoursePlayMode('list')
          setView('list')
        }}
        onAccept={(questId) => openQuest(questId)}
      />
    )
  }

  // list mode
  const nextKid = next
    ? (QUEST_KID[next.id] ?? { make: next.title, why: next.skill, emoji: '✨' })
    : null

  return (
    <div className="stage-shell space-y-5 pb-8">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setView('catalog')}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl bg-white px-4 text-sm font-bold text-brand-600 shadow-soft ring-1 ring-border"
        >
          <ChevronLeft className="size-4" /> Khóa học
        </button>
        <Button
          size="sm"
          variant="soft"
          onClick={() => {
            setCoursePlayMode('adventure')
            setView('adventure')
          }}
        >
          <MapIcon className="size-4" />
          Chế độ phiêu lưu
        </Button>
      </div>

      <div className="ui-card overflow-hidden">
        <div className="relative h-40 sm:h-48">
          {course.coverImage ? (
            <img src={course.coverImage} alt="" className="size-full object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e2740]/85 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <h1 className="font-display text-2xl sm:text-3xl">
              {course.emoji} {course.title}
            </h1>
            <p className="text-sm text-white/90">{course.tagline}</p>
          </div>
        </div>
        <div className="p-4">
          <ProgressBar
            value={courseProgress(course, completed).percent}
            label={`Đã xong ${progress.done}/${progress.total}`}
          />
        </div>
      </div>

      {next && nextKid ? (
        <div className="rounded-[1.5rem] border-2 border-brand-500 bg-gradient-to-br from-brand-50 to-sky-100 p-4 shadow-clay sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <img src={MASCOT_SRC} alt="" className="mx-auto size-20 sm:mx-0" />
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="text-xs font-bold uppercase text-brand-600">Thử thách tiếp theo</p>
              <p className="font-display text-xl">
                {nextKid.emoji} {next.order}. {nextKid.make}
              </p>
              <p className="text-sm text-muted">{nextKid.why}</p>
            </div>
            <Button size="lg" onClick={() => openQuest(next.id)}>
              <Play className="size-5" /> Nhận thử thách
            </Button>
          </div>
        </div>
      ) : null}

      <ol className="grid gap-3 md:grid-cols-2">
        {quests.map((q) => {
          const kid = QUEST_KID[q.id] ?? { make: q.title, why: q.skill, emoji: '✨' }
          const locked = q.status === 'locked'
          const done = q.status === 'completed'
          const current = q.status === 'available' || q.status === 'in_progress'
          return (
            <li key={q.id}>
              <button
                type="button"
                disabled={locked}
                onClick={() => !locked && openQuest(q.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl border-2 bg-white p-4 text-left shadow-soft',
                  locked && 'cursor-not-allowed opacity-60',
                  done && 'border-mint-400/50 bg-mint-100/40',
                  current && 'border-brand-500 shadow-clay',
                  !locked && !done && !current && 'border-border',
                  !locked && 'cursor-pointer',
                )}
              >
                <span
                  className="flex size-14 items-center justify-center rounded-2xl text-2xl text-white"
                  style={{ background: locked ? '#C5CAD6' : q.accent }}
                >
                  {done ? '✓' : kid.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-display text-lg">
                    {q.order}. {kid.make}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">{kid.why}</span>
                </span>
                {current ? (
                  <span className="rounded-full bg-brand-100 px-2 py-1 text-xs font-bold text-brand-600">
                    Thử thách
                  </span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function FeaturedHero({
  course,
  childName,
  stars,
  xp,
  completed,
  onPlay,
}: {
  course: Course
  childName: string
  stars: number
  xp: number
  completed: string[]
  onPlay: () => void
}) {
  const prog = courseProgress(course, completed)
  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border-2 border-white shadow-clay">
      <div className="absolute inset-0">
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
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e2740]/92 via-[#1e2740]/55 to-transparent" />
      </div>
      <div className="relative flex min-h-[300px] flex-col justify-end gap-4 p-5 sm:min-h-[340px] sm:p-8 md:max-w-[62%]">
        <p className="inline-flex flex-wrap items-center gap-2 text-sm font-bold text-sun-400">
          <span>Chào {childName}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5 text-white">
            <Star className="size-3.5 fill-sun-400 text-sun-400" /> {stars}
          </span>
          <span className="rounded-full bg-black/30 px-2 py-0.5 text-white">{xp} XP</span>
        </p>
        <h1 className="font-display text-3xl text-white sm:text-4xl md:text-5xl">
          {course.emoji} {course.title}
        </h1>
        <p className="text-base font-semibold text-white/90 sm:text-lg">{course.tagline}</p>
        <div className="flex flex-wrap gap-2">
          <span className="ui-chip">{course.ageLabel}</span>
          <span className="ui-chip">
            <Clock className="size-3.5" /> {course.durationLabel}
          </span>
          <span className="ui-chip">
            {prog.done}/{prog.total} nhiệm vụ
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="lg" className="min-h-14 text-base" onClick={onPlay}>
            <Play className="size-5" />
            {prog.done > 0 ? 'Tiếp tục phiêu lưu' : 'Bắt đầu ngay'}
          </Button>
        </div>
      </div>
    </section>
  )
}

function NetflixRow({
  title,
  subtitle,
  emptyHint,
  courses,
  completed,
  enrolledIds,
  onOpen,
  onEnroll,
  badgeMode,
}: {
  title: string
  subtitle: string
  emptyHint: string
  courses: Course[]
  completed: string[]
  enrolledIds: string[]
  onOpen: (c: Course) => void
  onEnroll: (id: string) => void
  badgeMode: 'progress' | 'recommended' | 'explore'
}) {
  const scroller = useRef<HTMLDivElement>(null)

  const scroll = (dir: -1 | 1) => {
    scroller.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  if (!courses.length) {
    return (
      <section className="space-y-2 px-0.5">
        <h2 className="font-display text-xl text-text sm:text-2xl">{title}</h2>
        <p className="rounded-2xl border-2 border-dashed border-border bg-white/60 px-4 py-6 text-sm font-semibold text-muted">
          {emptyHint}
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3 px-0.5">
        <div>
          <h2 className="font-display text-xl text-text sm:text-2xl">{title}</h2>
          <p className="text-sm text-muted">{subtitle}</p>
        </div>
        <div className="hidden gap-1 sm:flex">
          <button
            type="button"
            aria-label="Cuộn trái"
            className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-white shadow-soft ring-1 ring-border"
            onClick={() => scroll(-1)}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Cuộn phải"
            className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-white shadow-soft ring-1 ring-border"
            onClick={() => scroll(1)}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
      <div
        ref={scroller}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {courses.map((c) => {
          const prog = courseProgress(c, completed)
          const enrolled = enrolledIds.includes(c.id)
          const soon = c.status === 'soon'
          return (
            <article
              key={c.id}
              className="ui-card ui-card-hover w-[270px] shrink-0 overflow-hidden sm:w-[310px]"
            >
              <div className="relative h-44">
                {c.coverImage ? (
                  <img src={c.coverImage} alt="" className="size-full object-cover" loading="lazy" />
                ) : (
                  <div
                    className="size-full"
                    style={{
                      background: `linear-gradient(145deg, ${c.coverFrom}, ${c.coverTo})`,
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                {c.status === 'new' ? (
                  <span className="absolute right-2 top-2 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-brand-600 shadow-soft">
                    Mới
                  </span>
                ) : null}
                {soon ? (
                  <span className="absolute right-2 top-2 rounded-full bg-black/80 px-2.5 py-1 text-xs font-bold text-white">
                    Sắp có
                  </span>
                ) : null}
                {badgeMode === 'recommended' && !soon ? (
                  <span className="absolute left-2 top-2 rounded-full bg-sun-400 px-2.5 py-1 text-xs font-bold text-[#1e2740] shadow-soft">
                    Gợi ý
                  </span>
                ) : null}
                {enrolled && prog.done > 0 ? (
                  <span className="absolute bottom-2 right-2 rounded-full bg-mint-400 px-2 py-0.5 text-[10px] font-bold text-[#0f3d2a]">
                    Đang học
                  </span>
                ) : null}
                <span className="absolute bottom-2 left-2 text-3xl" aria-hidden>
                  {c.emoji}
                </span>
              </div>
              <div className="space-y-2 p-3.5">
                <h3 className="font-display text-lg leading-snug">{c.title}</h3>
                <p className="line-clamp-2 text-sm text-muted">{c.tagline}</p>
                <div className="flex flex-wrap gap-1.5 text-[11px] font-bold text-muted">
                  <span className="rounded-full bg-brand-50 px-2 py-0.5">{c.ageLabel}</span>
                  <span className="rounded-full bg-sky-100 px-2 py-0.5">{c.durationLabel}</span>
                </div>
                {!soon && enrolled ? (
                  <ProgressBar value={prog.percent} label={`${prog.done}/${prog.total}`} />
                ) : null}
                <div className="flex gap-2 pt-1">
                  {soon ? (
                    <Button fullWidth variant="secondary" disabled>
                      <Lock className="size-4" /> Sắp mở
                    </Button>
                  ) : enrolled ? (
                    <Button fullWidth className="min-h-12" onClick={() => onOpen(c)}>
                      <Play className="size-4" /> Vào học
                    </Button>
                  ) : (
                    <>
                      <Button
                        className="min-h-12 flex-1"
                        variant="secondary"
                        onClick={() => {
                          onEnroll(c.id)
                          onOpen(c)
                        }}
                      >
                        Đăng ký
                      </Button>
                      <Button className="min-h-12 flex-1" onClick={() => onOpen(c)}>
                        Xem
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function ModeCard({
  icon,
  title,
  desc,
  badge,
  highlight,
  onClick,
}: {
  icon: ReactNode
  title: string
  desc: string
  badge?: string
  highlight?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative cursor-pointer rounded-2xl border-2 bg-white p-5 text-left shadow-soft transition-transform hover:-translate-y-1 active:translate-y-0',
        highlight
          ? 'border-brand-500 shadow-clay ring-2 ring-brand-100'
          : 'border-border hover:border-brand-500',
      )}
    >
      {badge ? (
        <span className="absolute right-3 top-3 rounded-full bg-sun-100 px-2.5 py-1 text-[10px] font-bold text-text">
          {badge}
        </span>
      ) : null}
      <div className="mb-3">{icon}</div>
      <p className="font-display text-xl">{title}</p>
      <p className="mt-1.5 text-sm leading-snug text-muted">{desc}</p>
    </button>
  )
}

/** Mario-inspired path: stations = challenges, move left/right, accept challenge */
function AdventureMap({
  course,
  quests,
  stars,
  onBack,
  onSwitchList,
  onAccept,
}: {
  course: Course
  quests: ReturnType<typeof computeQuestStatuses>
  stars: number
  onBack: () => void
  onSwitchList: () => void
  onAccept: (questId: string) => void
}) {
  const adventureIndex = useDemoStore((s) => s.adventureIndex)
  const setAdventureIndex = useDemoStore((s) => s.setAdventureIndex)
  const completed = useDemoStore((s) => s.completedQuestIds)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [hop, setHop] = useState(false)

  const maxIdx = Math.max(0, quests.length - 1)
  const idx = Math.min(Math.max(0, adventureIndex), maxIdx)
  const node = quests[idx]
  const kid = node
    ? (QUEST_KID[node.id] ?? { make: node.title, why: node.skill, emoji: '✨' })
    : null
  const locked = node?.status === 'locked'
  const done = node?.status === 'completed'
  const doneCount = quests.filter((q) => q.status === 'completed' || completed.includes(q.id)).length

  const moveTo = (next: number) => {
    const clamped = Math.min(maxIdx, Math.max(0, next))
    if (clamped === idx) return
    const target = quests[clamped]
    if (target?.status === 'locked' && clamped > idx) {
      // allow browsing locked ahead? No — stop at first locked
      return
    }
    setHop(true)
    setAdventureIndex(clamped)
    window.setTimeout(() => setHop(false), 280)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        moveTo(idx - 1)
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        const nextQ = quests[idx + 1]
        if (nextQ && nextQ.status !== 'locked') moveTo(idx + 1)
      }
      if (e.key === 'Enter' && node && !locked) {
        e.preventDefault()
        setConfirmOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, locked, node, quests])

  // Snap to first available on mount if current locked
  useEffect(() => {
    if (node?.status === 'locked') {
      const firstOpen = quests.findIndex(
        (q) => q.status === 'available' || q.status === 'in_progress' || q.status === 'completed',
      )
      if (firstOpen >= 0) setAdventureIndex(firstOpen)
    }
    // only once when opening
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canGoRight = (() => {
    if (idx >= maxIdx) return false
    const nextQ = quests[idx + 1]
    if (!nextQ) return false
    // Can walk onto completed / available stations; locked stays closed
    return nextQ.status !== 'locked'
  })()

  return (
    <div className="w-full space-y-4 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl bg-white px-4 text-sm font-bold text-brand-600 shadow-soft ring-1 ring-border"
          >
            <ChevronLeft className="size-4" /> Khóa học
          </button>
          <Button size="sm" variant="soft" onClick={onSwitchList}>
            <List className="size-4" /> Danh sách
          </Button>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-bold shadow-soft ring-1 ring-border">
          <Star className="size-4 fill-sun-400 text-sun-400" />
          {stars} sao
          <span className="text-muted">·</span>
          <Flag className="size-4 text-brand-500" />
          {doneCount}/{quests.length} trạm
        </div>
      </div>

      <div className="text-center">
        <p className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-500">
          <Gamepad2 className="size-4" /> Chế độ phiêu lưu
        </p>
        <h1 className="font-display text-2xl sm:text-3xl">
          {course.emoji} {course.title}
        </h1>
        <p className="text-sm text-muted">
          Di chuyển · Nhận thử thách · Vượt ải mở trạm sau
        </p>
      </div>

      {/* Game stage */}
      <div className="relative overflow-hidden rounded-[1.75rem] border-4 border-white shadow-clay">
        <div className="absolute inset-0">
          <img
            src="/assets/adventure-map.jpg"
            alt=""
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-sky-100/30 via-transparent to-[#3f6212]/55" />
        </div>

        {/* Decorative clouds */}
        <div className="pointer-events-none absolute left-[8%] top-6 h-10 w-16 rounded-full bg-white/70 blur-[1px] sm:h-12 sm:w-20" />
        <div className="pointer-events-none absolute right-[12%] top-10 h-8 w-14 rounded-full bg-white/60" />

        <div className="relative px-2 py-8 sm:px-6 sm:py-10">
          {/* Path track */}
          <div className="relative mx-auto max-w-4xl pb-6 pt-14">
            <div
              className="absolute left-[6%] right-[6%] top-[4.5rem] h-3 rounded-full bg-[#fef3c7]/90 shadow-inner sm:top-[5rem]"
              aria-hidden
            />
            <div
              className="absolute left-[6%] top-[4.5rem] h-3 rounded-full bg-gradient-to-r from-mint-400 to-sun-400 transition-all duration-300 sm:top-[5rem]"
              style={{
                width: `${Math.max(8, (doneCount / Math.max(1, quests.length)) * 88)}%`,
              }}
              aria-hidden
            />

            <div className="relative flex items-end justify-between gap-0.5 sm:gap-1">
              {quests.map((q, i) => {
                const k = QUEST_KID[q.id] ?? { make: q.title, why: q.skill, emoji: '⭐' }
                const isHere = i === idx
                const isDone = q.status === 'completed' || completed.includes(q.id)
                const isLocked = q.status === 'locked'
                const isCurrent =
                  q.status === 'available' || q.status === 'in_progress'
                return (
                  <button
                    key={q.id}
                    type="button"
                    disabled={isLocked && !isHere}
                    aria-label={`Trạm ${q.order}: ${k.make}${isLocked ? ' (chưa mở)' : ''}`}
                    onClick={() => {
                      if (!isLocked || isHere) {
                        setAdventureIndex(i)
                        setHop(true)
                        window.setTimeout(() => setHop(false), 280)
                      }
                    }}
                    className={cn(
                      'relative flex flex-1 flex-col items-center gap-1',
                      isLocked && !isHere ? 'cursor-not-allowed opacity-55' : 'cursor-pointer',
                    )}
                  >
                    {isHere ? (
                      <img
                        src={MASCOT_SRC}
                        alt="Nhân vật của con"
                        className={cn(
                          'absolute -top-14 size-12 drop-shadow-lg sm:-top-[4.25rem] sm:size-14',
                          hop && 'animate-bounce',
                          !hop && 'animate-soft-pulse',
                        )}
                      />
                    ) : null}
                    <div
                      className={cn(
                        'flex size-12 items-center justify-center rounded-full border-4 border-white text-lg shadow-soft transition-transform sm:size-16 sm:text-2xl',
                        isDone && 'bg-mint-400',
                        isHere && !isDone && 'scale-110 bg-sun-400 ring-4 ring-white/90',
                        !isDone && !isHere && isCurrent && 'bg-brand-500',
                        !isDone && !isHere && !isCurrent && !isLocked && 'bg-brand-500/80',
                        isLocked && 'bg-slate-400',
                      )}
                    >
                      {isDone ? (
                        <span className="font-bold text-white">✓</span>
                      ) : isLocked ? (
                        <Lock className="size-4 text-white sm:size-5" />
                      ) : (
                        k.emoji
                      )}
                    </div>
                    <span className="hidden max-w-[4.5rem] text-center text-[10px] font-bold leading-tight text-[#1e2740] drop-shadow-sm sm:block sm:text-xs">
                      {q.order}. {k.make}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* HUD / challenge panel */}
          <div className="relative z-10 mx-auto max-w-xl rounded-[1.5rem] border-2 border-white bg-white/95 p-4 shadow-clay backdrop-blur-md sm:p-5">
            {kid && node ? (
              <>
                <div className="mb-2 flex items-center justify-center gap-2">
                  <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-600">
                    Trạm {node.order}/{quests.length}
                  </span>
                  {done ? (
                    <span className="rounded-full bg-mint-100 px-3 py-1 text-xs font-bold text-success">
                      Đã vượt
                    </span>
                  ) : locked ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-muted">
                      Chưa mở
                    </span>
                  ) : (
                    <span className="rounded-full bg-sun-100 px-3 py-1 text-xs font-bold text-[#7a4f00]">
                      Thử thách sẵn sàng
                    </span>
                  )}
                </div>
                <p className="text-center font-display text-xl sm:text-2xl">
                  {kid.emoji} {kid.make}
                </p>
                <p className="mt-1 text-center text-sm font-semibold text-muted">{kid.why}</p>
                <p className="mt-2 text-center text-sm font-bold text-text">
                  🎁 Phần thưởng: {node.reward}
                </p>
              </>
            ) : null}

            {/* D-pad + accept */}
            <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="lg"
                className="min-w-[7rem]"
                disabled={idx <= 0}
                onClick={() => moveTo(idx - 1)}
                aria-label="Di chuyển trái"
              >
                <ChevronLeft className="size-5" /> Trái
              </Button>
              <Button
                size="lg"
                className="min-h-14 min-w-[11rem] text-base shadow-clay"
                disabled={locked}
                onClick={() => node && !locked && setConfirmOpen(true)}
              >
                {done ? (
                  <>
                    <Sparkles className="size-5" /> Xem lại
                  </>
                ) : locked ? (
                  <>
                    <Lock className="size-5" /> Chưa mở
                  </>
                ) : (
                  <>
                    <Play className="size-5" /> Nhận thử thách
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="min-w-[7rem]"
                disabled={!canGoRight}
                onClick={() => moveTo(idx + 1)}
                aria-label="Di chuyển phải"
              >
                Phải <ChevronRight className="size-5" />
              </Button>
            </div>
            <p className="mt-3 text-center text-xs font-semibold text-muted">
              Mẹo: phím ← → để di chuyển, Enter để nhận thử thách. Chỉ mở trạm đã mở khóa.
            </p>
          </div>
        </div>
      </div>

      {/* Challenge accept modal */}
      {confirmOpen && node && kid ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="challenge-title"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-[1.75rem] border-2 border-white bg-white shadow-clay"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-brand-500 to-sky-400 px-5 py-6 text-center text-white">
              <p className="text-sm font-bold text-white/90">Thử thách trạm {node.order}</p>
              <p id="challenge-title" className="mt-1 font-display text-2xl">
                {kid.emoji} {kid.make}
              </p>
            </div>
            <div className="space-y-4 p-5">
              <p className="text-center text-base font-semibold text-text">{kid.why}</p>
              <div className="rounded-2xl bg-sun-100 px-4 py-3 text-center text-sm font-bold text-text">
                Vượt qua sẽ nhận: {node.reward}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setConfirmOpen(false)}
                >
                  Chưa sẵn sàng
                </Button>
                <Button
                  size="lg"
                  className="flex-1 min-h-12"
                  onClick={() => {
                    setConfirmOpen(false)
                    onAccept(node.id)
                  }}
                >
                  <Play className="size-5" /> Bắt đầu ngay!
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
