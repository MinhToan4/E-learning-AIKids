import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  NavBadgeIcon,
  NavCreativeIcon,
  NavLeaderboardIcon,
  NavWorldIcon,
} from '@/shared/components/icons/KidNavIcons'
import { ShieldLockIcon } from '@/shared/components/icons/ParentIcons'
import { Button } from '@/shared/components/ui/Button'
import { api, type CourseSummary } from '@/shared/lib/api'
import { learningApi } from '@/shared/lib/learning-api'
import { courseCoverHint } from '@/shared/config/assets'

type CourseDetail = CourseSummary & {
  description: string
  outcomes: string[]
  skills: string[]
  recognition?: {
    issuer: string
    credential: string
    finalAssessment: string
    frameworks: Array<{ code: string; title: string }>
    disclaimer: string
  }
  quests: Array<{ id: string; order: number; title: string; practiceKind: string }>
}

export function CourseIntroPage() {
  const { courseId = 'course-comic' } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [progress, setProgress] = useState<{
    completedCount: number
    nextId: string | null
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [enrolled, setEnrolled] = useState(false)

  useEffect(() => {
    void (async () => {
      setError(null)
      try {
        const [data, enrollmentData] = await Promise.all([
          learningApi.getCourse<{ course: CourseDetail }>(courseId),
          api<{ enrollments: Array<{ courseId: string; status: string }> }>('/api/enrollments'),
        ])
        setCourse(data.course)
        setEnrolled(enrollmentData.enrollments.some((item) =>
          item.courseId === courseId && ['active', 'completed'].includes(item.status)))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Không tải được khóa học')
      }
    })()
  }, [courseId])

  async function startCourse() {
    if (!course) return
    if (enrolled) {
      navigate(`/world/${course.id}`)
      return
    }
    setBusy(true)
    try {
      await api('/api/enrollments', {
        method: 'POST',
        body: JSON.stringify({ courseId: course.id }),
      })
      const p = await learningApi.getCourseProgress(course.id)
      const next =
        p.quests.find(
          (q) => q.status === 'available' || q.status === 'in_progress',
        ) ?? p.quests.find((q) => q.status === 'completed')
      setProgress({
        completedCount: p.completedCount,
        nextId: next?.id ?? p.quests[0]?.id ?? null,
      })
      setEnrolled(true)
      if (next?.id) {
        navigate(`/world/${course.id}`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chưa ghi danh được')
    } finally {
      setBusy(false)
    }
  }

  if (error && !course) {
    return (
      <div className="ui-card p-6">
        <p className="text-danger">{error}</p>
        <Link to="/home" className="mt-4 inline-block">
          <Button variant="secondary">Về nhà</Button>
        </Link>
      </div>
    )
  }

  if (!course) {
    return (
      <p className="animate-pulse text-muted" aria-live="polite">
        Đang mở giới thiệu khóa học…
      </p>
    )
  }

  const outcomes =
    course.outcomes?.length > 0
      ? course.outcomes
      : [
          course.productLabel,
          'Sao và huy hiệu theo từng trạm',
          'Sáng tạo lưu riêng tư trong ba lô',
        ]

  const sortedQuests = [...(course.quests ?? [])].sort((a, b) => a.order - b.order)
  const primaryActionLabel = busy
    ? 'Đang mở…'
    : enrolled || progress?.completedCount
      ? 'Tiếp tục hành trình'
      : 'Bắt đầu hành trình'

  const practiceLabels: Record<string, string> = {
    explore: 'Khám phá',
    video: 'Khám phá',
    play: 'Chơi',
    game: 'Chơi',
    create: 'Sáng tạo',
    creative: 'Sáng tạo',
    quiz: 'Thử tài',
    assessment: 'Thử tài',
  }

  const practiceLabel = (value: string) => practiceLabels[value.toLowerCase()] ?? 'Học và chơi'

  return (
    <div className="page-enter flex flex-col gap-5">
      <Link to="/world" className="self-start rounded-xl bg-white/80 px-4 py-2 text-sm font-extrabold text-brand-700 shadow-soft">
        ← Về bản đồ học
      </Link>

      <header className="ui-card overflow-hidden border-2 border-white/80">
        <div
          className="relative min-h-[23rem] sm:min-h-[25rem]"
          style={{
            background: `linear-gradient(135deg, ${course.coverFrom}, ${course.coverTo})`,
          }}
        >
          {(() => {
            const cover = courseCoverHint({
              courseKey: course.courseKey,
              ageTrack: course.ageTrack,
              coverImage: course.coverImage,
            })
            return cover ? (
              <img
                src={cover}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
              />
            ) : null
          })()}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
            <div className="mb-3 flex flex-wrap gap-2 text-xs font-extrabold">
              <span className="rounded-full bg-white/90 px-3 py-1.5 text-brand-700">{course.ageLabel}</span>
              <span className="rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">{course.durationLabel}</span>
              <span className="rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">{sortedQuests.length} trạm</span>
            </div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-sun-300">Hành trình học tập</p>
            <h1 className="mt-1 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
              {course.title}
            </h1>
            <p className="mt-2 max-w-3xl text-base font-bold leading-relaxed text-white/90 sm:text-lg">{course.tagline}</p>
            <Button
              className="mt-5 min-h-12 px-6 text-base"
              onClick={() => void startCourse()}
              disabled={busy}
            >
              {primaryActionLabel}
            </Button>
          </div>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
          <p className="max-w-4xl font-semibold leading-relaxed text-muted">{course.description}</p>
          <div className="rounded-2xl bg-brand-50 px-4 py-3 text-sm font-extrabold text-brand-700">
            {progress?.completedCount
              ? `${progress.completedCount}/${sortedQuests.length} trạm đã xong`
              : 'Sẵn sàng khám phá'}
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="ui-card p-5 sm:p-6">
          <h2 className="font-display mb-4 flex items-center gap-3 text-2xl">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50"><NavWorldIcon size={28} aria-hidden /></span>
            Con sẽ khám phá
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {course.skills.map((skill, index) => (
              <li key={skill} className="flex min-h-20 items-center gap-3 rounded-2xl bg-brand-50 p-3 font-bold text-text">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white font-display text-xl text-brand-700 shadow-soft">{index + 1}</span>
                <span className="leading-snug">{skill}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="ui-card p-5 sm:p-6">
          <h2 className="font-display mb-4 flex items-center gap-3 text-2xl">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-mint-50"><NavLeaderboardIcon size={28} aria-hidden /></span>
            Con sẽ làm được
          </h2>
          <ul className="space-y-3">
            {outcomes.map((outcome) => (
              <li key={outcome} className="flex items-start gap-3 rounded-2xl border border-mint-200 bg-mint-50 p-3 font-bold">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mint-500 text-sm text-white" aria-hidden>✓</span>
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-sun-50 p-4">
            <NavBadgeIcon size={32} className="shrink-0" aria-hidden />
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-sun-700">Phần thưởng cuối hành trình</p>
              <p className="font-display text-lg leading-tight">{course.productLabel}</p>
            </div>
          </div>
        </section>
      </div>

      {course.recognition?.frameworks && (
        <section className="ui-card p-5" aria-labelledby="recognition-title">
          <h2
            id="recognition-title"
            className="font-display mb-3 flex items-center gap-2 text-2xl"
          >
            <ShieldLockIcon size={26} />
            Ghi nhận minh bạch
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-sun-100 bg-sun-100/40 p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-muted">
                Đơn vị ghi nhận hoàn thành
              </p>
              <p className="mt-1 flex items-start gap-2 font-bold">
                <NavBadgeIcon size={20} className="mt-0.5 shrink-0" />
                {course.recognition.issuer}
              </p>
              <p className="mt-2 text-sm text-muted">
                {course.recognition.credential}
              </p>
            </div>
            <div className="rounded-2xl border-2 border-brand-100 bg-brand-50 p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-muted">
                Cách hoàn thành
              </p>
              <p className="mt-1 text-sm font-semibold">
                {course.recognition.finalAssessment}
              </p>
            </div>
          </div>
          <div className="mt-3 rounded-2xl border border-border px-4 py-3">
            <p className="text-sm font-extrabold">Khung nội dung tham chiếu</p>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {course.recognition.frameworks.map((framework) => (
                <li key={framework.code}>
                  {framework.code} · {framework.title}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {course.recognition.disclaimer}
            </p>
          </div>
        </section>
      )}

      {course.quests && course.quests.length > 0 && (
        <section className="ui-card p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-600">Bản đồ nhiệm vụ</p>
              <h2 className="font-display mt-1 flex items-center gap-3 text-2xl sm:text-3xl">
                <NavCreativeIcon size={30} aria-hidden />
                Chinh phục {sortedQuests.length} trạm
              </h2>
            </div>
            <p className="text-sm font-bold text-muted">Khám phá → Chơi → Sáng tạo → Thử tài</p>
          </div>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {sortedQuests.map((quest) => (
                <li
                  key={quest.id}
                  className="relative min-h-36 overflow-hidden rounded-3xl border-2 border-brand-100 bg-gradient-to-br from-white to-brand-50 p-4 shadow-soft"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 font-display text-xl text-white shadow-soft">{quest.order}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-brand-700">{practiceLabel(quest.practiceKind)}</span>
                  </div>
                  <h3 className="mt-4 font-display text-lg leading-tight">{quest.title}</h3>
                </li>
              ))}
          </ol>
        </section>
      )}

      {error && (
        <p className="rounded-xl bg-coral-100 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="ui-card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="font-display text-xl">Sẵn sàng vào trạm đầu tiên?</p>
          <p className="text-sm font-semibold text-muted">Mỗi trạm đều có phần học, luyện tập và kiểm tra ngắn.</p>
        </div>
        <Button className="min-h-12 px-6" onClick={() => void startCourse()} disabled={busy}>{primaryActionLabel}</Button>
        {!enrolled && (
          <p className="basis-full text-xs font-semibold text-muted">
            Tiến độ của con được lưu riêng. Nội dung cần quyền sẽ yêu cầu Ba/Mẹ duyệt.
          </p>
        )}
      </div>

      {progress && (
        <p className="text-sm text-muted">
          Đã xong {progress.completedCount} trạm
          {progress.nextId ? ' · sẵn sàng trạm tiếp theo' : ''}.
        </p>
      )}
    </div>
  )
}
