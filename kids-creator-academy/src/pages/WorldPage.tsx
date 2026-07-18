import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  Flag,
  Gamepad2,
  Lock,
  Map as MapIcon,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  List,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/Progress'
import { useDemoStore } from '@/store/demo-store'
import { MAP_MASCOT_SRC, MASCOT_SRC, questRoute } from '@/data/mock'
import {
  COURSES,
  QUEST_KID,
  courseProgress,
  getCourse,
  type Course,
} from '@/data/courses'
import { cn } from '@/lib/cn'
import { computeQuestStatuses } from '@/lib/quests'
import { emptyLessonProgress, ensureLesson } from '@/data/lessons'
import {
  getActiveAdventureIndex,
  isCourseComplete,
} from '@/lib/course-flow'

/** catalog = Netflix hub; inside a course: adventure | missions | practice */
type WorldView =
  | 'catalog'
  | 'pick-mode'
  | 'adventure'
  | 'missions'
  | 'practice'

type CourseTab = 'adventure' | 'missions' | 'practice'

/**
 * Netflix catalog → enter a course → tabs scoped to THAT course:
 * Bản đồ · Nhiệm vụ · Bài tập (not global shared content).
 */
export function WorldPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const completed = useDemoStore((s) => s.completedQuestIds)
  const currentQuestId = useDemoStore((s) => s.currentQuestId)
  const setCurrentQuest = useDemoStore((s) => s.setCurrentQuest)
  const selectedCourseId = useDemoStore((s) => s.selectedCourseId)
  const setSelectedCourseId = useDemoStore((s) => s.setSelectedCourseId)
  const enrolledCourseIds = useDemoStore((s) => s.enrolledCourseIds)
  const enrollCourse = useDemoStore((s) => s.enrollCourse)
  const setCoursePlayMode = useDemoStore((s) => s.setCoursePlayMode)
  const setAdventureIndex = useDemoStore((s) => s.setAdventureIndex)
  const resetCurrentCourseProgress = useDemoStore((s) => s.resetCurrentCourseProgress)
  const child = useDemoStore((s) => s.child)
  const stars = useDemoStore((s) => s.stars)
  const lessonProgress = useDemoStore((s) => s.lessonProgress)
  const addToast = useDemoStore((s) => s.addToast)
  const addStars = useDemoStore((s) => s.addStars)

  const viewParam = searchParams.get('view')
  const [view, setView] = useState<WorldView>(() => {
    if (viewParam === 'list') return 'missions'
    if (
      viewParam === 'adventure' ||
      viewParam === 'missions' ||
      viewParam === 'practice' ||
      viewParam === 'catalog' ||
      viewParam === 'pick-mode'
    ) {
      return viewParam
    }
    return 'catalog'
  })
  const course = getCourse(selectedCourseId)

  // Deep-link: /world?view=adventure|missions|practice&course=…
  useEffect(() => {
    const courseParam = searchParams.get('course')
    if (courseParam) {
      setSelectedCourseId(courseParam)
      if (!enrolledCourseIds.includes(courseParam)) enrollCourse(courseParam)
    }
    if (!viewParam || viewParam === 'catalog') {
      if (viewParam === 'catalog') setView('catalog')
      return
    }
    if (viewParam === 'list') {
      setView('missions')
      return
    }
    if (
      viewParam === 'adventure' ||
      viewParam === 'missions' ||
      viewParam === 'practice' ||
      viewParam === 'pick-mode'
    ) {
      setView(viewParam)
    }
  }, [
    viewParam,
    searchParams,
    setSelectedCourseId,
    enrolledCourseIds,
    enrollCourse,
  ])

  const goView = (v: WorldView) => {
    setView(v)
    if (v === 'catalog') {
      setSearchParams({}, { replace: true })
    } else {
      setSearchParams({ view: v }, { replace: true })
    }
  }

  const goCourseTab = (tab: CourseTab) => {
    if (tab === 'adventure') setCoursePlayMode('adventure')
    goView(tab)
  }

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
    // Always enter lesson shell: Theory → Practice → Quiz
    setCurrentQuest(id)
    navigate(questRoute(id))
  }

  const enterCourse = (c: Course) => {
    if (c.status === 'soon') return
    if (!enrolledCourseIds.includes(c.id)) enrollCourse(c.id)
    setSelectedCourseId(c.id)
    const prog = courseProgress(c, completed)
    // Resume path if already progressed; else choose adventure/list
    if (prog.done > 0) {
      setCoursePlayMode('adventure')
      const idx = getActiveAdventureIndex(c.id, completed, currentQuestId)
      setAdventureIndex(idx)
      goView('adventure')
      return
    }
    goView('pick-mode')
  }

  const courseFinished = isCourseComplete(selectedCourseId, completed)

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
          onClick={() => goView('catalog')}
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
                  setAdventureIndex(
                    getActiveAdventureIndex(
                      selectedCourseId,
                      completed,
                      currentQuestId,
                    ),
                  )
                  goView('adventure')
                }}
              />
              <ModeCard
                icon={<List className="size-9 text-sky-400" />}
                title="Danh sách nhiệm vụ"
                desc="Xem rõ từng bước như checklist — bấm vào nhiệm vụ muốn làm."
                onClick={() => {
                  setCoursePlayMode('list')
                  goView('missions')
                }}
              />
            </div>
            <p className="text-center text-xs font-semibold text-muted">
              Trong khóa: tab Bản đồ · Nhiệm vụ · Bài tập (riêng từng khóa).
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Inside a course: shared shell + tab content ──
  if (view === 'adventure' || view === 'missions' || view === 'practice') {
    const activeTab: CourseTab =
      view === 'missions' ? 'missions' : view === 'practice' ? 'practice' : 'adventure'

    return (
      <CourseShell
        course={course}
        progress={progress}
        courseFinished={courseFinished}
        activeTab={activeTab}
        onBackCatalog={() => goView('catalog')}
        onTab={goCourseTab}
        onReplay={() => {
          resetCurrentCourseProgress()
          addToast({
            type: 'success',
            title: 'Học lại từ đầu!',
            description: 'Nhân vật về trạm 1 của khóa này.',
          })
          goCourseTab('adventure')
        }}
      >
        {activeTab === 'adventure' ? (
          <AdventureMap
            course={course}
            quests={quests}
            stars={stars}
            lessonProgress={lessonProgress}
            courseFinished={courseFinished}
            onAccept={(questId) => openQuest(questId)}
            onReplay={() => {
              resetCurrentCourseProgress()
              addToast({
                type: 'success',
                title: 'Học lại từ đầu!',
                description: 'Nhân vật về trạm 1 — chúc con chơi vui!',
              })
              goCourseTab('adventure')
            }}
          />
        ) : null}
        {activeTab === 'missions' ? (
          <CourseMissionsTab
            course={course}
            quests={quests}
            next={next}
            onOpen={openQuest}
            courseFinished={courseFinished}
            onReplay={() => {
              resetCurrentCourseProgress()
              addToast({ type: 'info', title: 'Bắt đầu học lại từ trạm 1' })
            }}
          />
        ) : null}
        {activeTab === 'practice' ? (
          <CoursePracticeTab
            course={course}
            quests={quests}
            onOpenStudio={(path) => navigate(path)}
            addStars={addStars}
            addToast={addToast}
          />
        ) : null}
      </CourseShell>
    )
  }

  return null
}

/** Header + 3 tabs scoped to the selected course */
function CourseShell({
  course,
  progress,
  courseFinished,
  activeTab,
  onBackCatalog,
  onTab,
  onReplay,
  children,
}: {
  course: Course
  progress: { done: number; total: number; percent: number }
  courseFinished: boolean
  activeTab: CourseTab
  onBackCatalog: () => void
  onTab: (t: CourseTab) => void
  onReplay: () => void
  children: ReactNode
}) {
  const tabs: { id: CourseTab; label: string; icon: ReactNode }[] = [
    { id: 'adventure', label: 'Bản đồ', icon: <MapIcon className="size-4" /> },
    { id: 'missions', label: 'Nhiệm vụ', icon: <List className="size-4" /> },
    { id: 'practice', label: 'Bài tập', icon: <Dumbbell className="size-4" /> },
  ]

  return (
    <div className="w-full space-y-4 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBackCatalog}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl bg-white px-4 text-sm font-bold text-brand-600 shadow-soft ring-1 ring-border"
        >
          <ChevronLeft className="size-4" /> Tất cả khóa học
        </button>
        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-muted shadow-soft ring-1 ring-border">
          {progress.done}/{progress.total} · {progress.percent}%
        </span>
      </div>

      <div className="ui-card overflow-hidden">
        <div className="relative h-28 sm:h-36">
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e2740]/90 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <p className="text-xs font-bold text-sun-400">Đang học trong khóa</p>
            <h1 className="font-display text-2xl sm:text-3xl">
              {course.emoji} {course.title}
            </h1>
            <p className="text-sm text-white/90">{course.tagline}</p>
          </div>
        </div>
        <div className="border-t border-border bg-gradient-to-b from-white to-brand-50/40 p-2">
          <nav
            className="grid grid-cols-3 gap-1.5 rounded-[1.25rem] bg-white/90 p-1.5 shadow-inner ring-1 ring-border"
            aria-label="Trong khóa học"
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onTab(t.id)}
                className={cn(
                  'flex min-h-12 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl text-xs font-extrabold transition-all sm:flex-row sm:gap-1.5 sm:text-sm',
                  activeTab === t.id
                    ? 'bg-gradient-to-br from-brand-500 to-sky-400 text-white shadow-clay'
                    : 'text-muted hover:bg-brand-50 hover:text-text',
                )}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {courseFinished ? (
        <div className="rounded-[1.25rem] border-2 border-mint-400 bg-mint-100/50 px-4 py-3 text-center">
          <p className="font-display text-lg text-success">
            ✓ Khóa này đã hoàn thành 100%
          </p>
          <Button size="sm" className="mt-2" onClick={onReplay}>
            <RotateCcw className="size-4" /> Học lại khóa này
          </Button>
        </div>
      ) : null}

      {children}
    </div>
  )
}

/** Nhiệm vụ tab — only quests of THIS course */
function CourseMissionsTab({
  course,
  quests,
  next,
  onOpen,
  courseFinished,
  onReplay,
}: {
  course: Course
  quests: ReturnType<typeof computeQuestStatuses>
  next: ReturnType<typeof computeQuestStatuses>[number] | undefined
  onOpen: (id: string) => void
  courseFinished: boolean
  onReplay: () => void
}) {
  const nextKid = next
    ? (QUEST_KID[next.id] ?? { make: next.title, why: next.skill, emoji: '✨' })
    : null

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl text-text">
          Nhiệm vụ · {course.shortTitle}
        </h2>
        <p className="text-sm font-semibold text-muted">
          Chỉ các chặng của khóa này. Có thể mở lại chặng đã xong để xem lại.
        </p>
      </div>

      {courseFinished ? (
        <div className="rounded-2xl border-2 border-sun-400/50 bg-sun-100/60 p-4 text-center">
          <Trophy className="mx-auto size-8 text-sun-400" />
          <p className="mt-1 font-bold">Hết nhiệm vụ — con giỏi lắm!</p>
          <Button size="sm" className="mt-2" onClick={onReplay}>
            <RotateCcw className="size-4" /> Học lại
          </Button>
        </div>
      ) : null}

      {next && nextKid ? (
        <div className="rounded-[1.5rem] border-2 border-brand-500 bg-gradient-to-br from-brand-50 to-sky-100 p-4 shadow-clay sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <img src={MASCOT_SRC} alt="" className="mx-auto size-16 sm:mx-0" />
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="text-xs font-bold uppercase text-brand-600">
                Đang mở
              </p>
              <p className="font-display text-xl">
                {nextKid.emoji} {next.order}. {nextKid.make}
              </p>
              <p className="text-sm text-muted">{nextKid.why}</p>
            </div>
            <Button size="lg" onClick={() => onOpen(next.id)}>
              <Play className="size-5" /> Vào làm
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
                onClick={() => !locked && onOpen(q.id)}
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
                {done ? (
                  <span className="rounded-full bg-mint-100 px-2 py-1 text-xs font-bold text-success">
                    Xem lại
                  </span>
                ) : current ? (
                  <span className="rounded-full bg-brand-100 px-2 py-1 text-xs font-bold text-brand-600">
                    Làm
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

/** Bài tập tab — drills only for quests in THIS course */
function CoursePracticeTab({
  course,
  quests,
  onOpenStudio,
  addStars,
  addToast,
}: {
  course: Course
  quests: ReturnType<typeof computeQuestStatuses>
  onOpenStudio: (path: string) => void
  addStars: (n: number) => void
  addToast: (t: { type: 'success' | 'info' | 'warning' | 'error'; title: string; description?: string }) => void
}) {
  const drills = useMemo(
    () =>
      quests.map((q) => {
        const lesson = ensureLesson(q.id)
        const kid = QUEST_KID[q.id] ?? { make: q.title, why: q.skill, emoji: lesson.emoji }
        return {
          id: q.id,
          emoji: kid.emoji,
          title: kid.make,
          skill: q.skill,
          locked: q.status === 'locked',
          done: q.status === 'completed',
          lesson,
        }
      }),
    [quests],
  )

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl text-text">
          Bài tập · {course.shortTitle}
        </h2>
        <p className="text-sm font-semibold text-muted">
          Luyện kỹ năng của <strong>khóa này</strong> — khác với khóa khác.
          Chặng đã mở / đã xong mới luyện được.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {drills.map((d) => (
          <article
            key={d.id}
            className={cn(
              'ui-card flex flex-col p-4',
              d.locked && 'opacity-55',
            )}
          >
            <div className="flex items-start gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-2xl">
                {d.locked ? '🔒' : d.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg">{d.title}</p>
                <p className="text-sm text-muted">{d.skill}</p>
                {d.done ? (
                  <span className="mt-1 inline-block text-xs font-bold text-success">
                    Đã học · luyện lại OK
                  </span>
                ) : null}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                className="flex-1"
                disabled={d.locked}
                onClick={() => {
                  if (d.locked) {
                    addToast({
                      type: 'warning',
                      title: 'Chưa mở',
                      description: 'Làm nhiệm vụ trước trên Bản đồ / Nhiệm vụ.',
                    })
                    return
                  }
                  onOpenStudio(`/lesson/${d.id}`)
                }}
              >
                <BookOpen className="size-4" /> Ôn bài học
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="flex-1"
                disabled={d.locked}
                onClick={() => {
                  if (d.locked) return
                  addStars(3)
                  addToast({
                    type: 'success',
                    title: 'Luyện nhanh +3 sao',
                    description: d.lesson.practiceHint,
                  })
                  onOpenStudio(d.lesson.practicePath)
                }}
              >
                <Dumbbell className="size-4" /> Luyện xưởng
              </Button>
            </div>
          </article>
        ))}
      </div>
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

/**
 * Adventure path for ONE course.
 * Default: mascot on current learning station (first incomplete).
 * After complete: jumps to next. User may roam free to past stations.
 */
function AdventureMap({
  course,
  quests,
  stars,
  lessonProgress,
  courseFinished,
  onAccept,
  onReplay,
}: {
  course: Course
  quests: ReturnType<typeof computeQuestStatuses>
  stars: number
  lessonProgress: Record<string, { starsEarned: number; quizDone: boolean }>
  courseFinished: boolean
  onAccept: (questId: string) => void
  onReplay: () => void
}) {
  const adventureIndex = useDemoStore((s) => s.adventureIndex)
  const setAdventureIndex = useDemoStore((s) => s.setAdventureIndex)
  const completed = useDemoStore((s) => s.completedQuestIds)
  const currentQuestId = useDemoStore((s) => s.currentQuestId)
  const selectedCourseId = useDemoStore((s) => s.selectedCourseId)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [hop, setHop] = useState(false)
  /** User manually browsed; stop auto-follow until progress changes */
  const browsingRef = useRef(false)
  const completedKey = completed.slice().sort().join('|')

  const maxIdx = Math.max(0, quests.length - 1)
  const activeIdx = getActiveAdventureIndex(
    selectedCourseId,
    completed,
    currentQuestId,
  )
  const idx = Math.min(Math.max(0, adventureIndex), maxIdx)
  const node = quests[idx]
  const kid = node
    ? (QUEST_KID[node.id] ?? { make: node.title, why: node.skill, emoji: '✨' })
    : null
  const locked = node?.status === 'locked'
  const done = node?.status === 'completed'
  const doneCount = quests.filter(
    (q) => q.status === 'completed' || completed.includes(q.id),
  ).length

  // Park on current learning station when opening map / after progress
  useEffect(() => {
    browsingRef.current = false
    setAdventureIndex(activeIdx)
    setHop(true)
    const t = window.setTimeout(() => setHop(false), 320)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedKey, selectedCourseId])

  // Unstick if on locked (safety)
  useEffect(() => {
    const standing = quests[idx]
    if (standing?.status === 'locked') {
      browsingRef.current = false
      setAdventureIndex(activeIdx)
    }
  }, [idx, quests, activeIdx, setAdventureIndex])

  const moveTo = (next: number) => {
    const clamped = Math.min(maxIdx, Math.max(0, next))
    if (clamped === idx) return
    const target = quests[clamped]
    if (target?.status === 'locked') return
    browsingRef.current = true
    setHop(true)
    setAdventureIndex(clamped)
    window.setTimeout(() => setHop(false), 280)
  }

  const jumpToLearning = () => {
    browsingRef.current = false
    setHop(true)
    setAdventureIndex(activeIdx)
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
        if (courseFinished && done) onReplay()
        else setConfirmOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, locked, node, quests, courseFinished, done])

  const canGoRight = (() => {
    if (idx >= maxIdx) return false
    const nextQ = quests[idx + 1]
    return !!nextQ && nextQ.status !== 'locked'
  })()

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600">
          <Gamepad2 className="size-4" /> Bản đồ · {course.shortTitle}
        </p>
        <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-bold shadow-soft ring-1 ring-border">
          <Star className="size-4 fill-sun-400 text-sun-400" />
          {stars} sao
          <span className="text-muted">·</span>
          <Flag className="size-4 text-brand-500" />
          {doneCount}/{quests.length} trạm
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <p className="text-center text-sm font-semibold text-muted">
          Đang học: trạm {activeIdx + 1}
          {idx !== activeIdx ? ' · Bạn đang xem trạm khác' : ''}
        </p>
        {idx !== activeIdx ? (
          <Button size="sm" variant="soft" onClick={jumpToLearning}>
            Về trạm đang học
          </Button>
        ) : null}
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
                const lp = lessonProgress[q.id] ?? emptyLessonProgress()
                const starN = isDone ? Math.max(1, lp.starsEarned || 0) : 0
                return (
                  <button
                    key={q.id}
                    type="button"
                    disabled={isLocked && !isHere}
                    aria-label={`Trạm ${q.order}: ${k.make}${isLocked ? ' (chưa mở)' : ''}${starN ? `, ${starN} sao` : ''}`}
                    onClick={() => {
                      if (!isLocked || isHere) {
                        browsingRef.current = true
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
                        src={MAP_MASCOT_SRC}
                        alt="Nhân vật đang đứng ở đây"
                        className={cn(
                          'absolute -top-[4.25rem] size-14 rounded-full border-2 border-white bg-white object-cover shadow-clay sm:-top-[5rem] sm:size-16',
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
                    {/* Phaser-style level stars */}
                    <span className="flex gap-0.5" aria-hidden>
                      {[0, 1, 2].map((si) => (
                        <Star
                          key={si}
                          className={cn(
                            'size-2.5 sm:size-3',
                            si < starN
                              ? 'fill-sun-400 text-sun-400'
                              : 'fill-white/40 text-white/50',
                          )}
                        />
                      ))}
                    </span>
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
                <p className="text-center text-xs font-semibold text-muted">
                  Trong trạm: ① Video/lý thuyết → ② Thực hành → ③ Trắc nghiệm
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
                disabled={locked && !courseFinished}
                onClick={() => {
                  if (courseFinished) {
                    onReplay()
                    return
                  }
                  if (node && !locked) setConfirmOpen(true)
                }}
              >
                {courseFinished ? (
                  <>
                    <RotateCcw className="size-5" /> Học lại
                  </>
                ) : done ? (
                  <>
                    <Sparkles className="size-5" /> Xem lại chặng
                  </>
                ) : locked ? (
                  <>
                    <Lock className="size-5" /> Chưa mở
                  </>
                ) : (
                  <>
                    <Play className="size-5" /> Vào chặng này
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
              ← → di chuyển · Enter vào chặng · Có thể quay lại chặng cũ để xem lại
            </p>
            {courseFinished ? (
              <Button className="mt-2 w-full" variant="soft" onClick={onReplay}>
                <RotateCcw className="size-4" /> Học lại khóa từ trạm 1
              </Button>
            ) : null}
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
              <p className="text-sm font-bold text-white/90">Bài học trạm {node.order}</p>
              <p id="challenge-title" className="mt-1 font-display text-2xl">
                {kid.emoji} {kid.make}
              </p>
            </div>
            <div className="space-y-4 p-5">
              <p className="text-center text-base font-semibold text-text">{kid.why}</p>
              <ul className="space-y-2 text-left text-sm font-bold text-text">
                <li className="rounded-xl bg-brand-50 px-3 py-2">① Xem video + lý thuyết</li>
                <li className="rounded-xl bg-sky-100 px-3 py-2">② Làm thực hành (xưởng)</li>
                <li className="rounded-xl bg-sun-100 px-3 py-2">③ Trắc nghiệm ngắn → nhận sao</li>
              </ul>
              <div className="rounded-2xl bg-sun-100 px-4 py-3 text-center text-sm font-bold text-text">
                Phần thưởng: {node.reward} · tối đa 3★
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
                  <Play className="size-5" /> Bắt đầu bài học!
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
