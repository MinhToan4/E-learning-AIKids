import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Award, BookOpen, ShieldCheck, Sparkles, Target, Trophy } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { api, type CourseSummary } from '@/shared/lib/api'
import { BrandLogo } from '@/shared/components/ui/BrandLogo'

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

  useEffect(() => {
    void (async () => {
      setError(null)
      try {
        const data = await api<{ course: CourseDetail }>(
          `/api/courses/${courseId}`,
        )
        setCourse(data.course)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Không tải được khóa học')
      }
    })()
  }, [courseId])

  async function startCourse() {
    if (!course) return
    setBusy(true)
    try {
      await api('/api/enrollments', {
        method: 'POST',
        body: JSON.stringify({ courseId: course.id }),
      })
      const p = await api<{
        completedCount: number
        quests: Array<{ id: string; order: number; status: string }>
      }>(`/api/progress/${course.id}`)
      const next =
        p.quests.find(
          (q) => q.status === 'available' || q.status === 'in_progress',
        ) ?? p.quests.find((q) => q.status === 'completed')
      setProgress({
        completedCount: p.completedCount,
        nextId: next?.id ?? p.quests[0]?.id ?? null,
      })
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

  return (
    <div className="page-enter flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <BrandLogo size="lg" />
        <Link to="/home" className="text-sm font-bold text-brand-500">
          ← Sảnh
        </Link>
      </div>

      <header className="ui-card overflow-hidden">
        <div
          className="relative h-40 sm:h-48"
          style={{
            background: `linear-gradient(135deg, ${course.coverFrom}, ${course.coverTo})`,
          }}
        >
          {course.coverImage && (
            <img
              src={course.coverImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-90"
              loading="eager"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="text-sm font-bold opacity-90">
              {course.ageLabel} · {course.durationLabel}
            </p>
            <h1 className="font-display text-3xl leading-tight sm:text-4xl">
              {course.title}
            </h1>
          </div>
        </div>
        <div className="p-5">
          <p className="text-lg font-bold text-brand-600">{course.tagline}</p>
          <p className="mt-2 text-muted">{course.description}</p>
        </div>
      </header>

      <section className="ui-card p-5">
        <h2 className="font-display mb-3 flex items-center gap-2 text-2xl">
          <BookOpen className="text-brand-500" size={24} />
          Con sẽ học gì?
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {course.skills.map((s) => (
            <li
              key={s}
              className="flex items-start gap-2 rounded-2xl bg-brand-50 px-3 py-2 text-sm font-semibold"
            >
              <Sparkles className="mt-0.5 shrink-0 text-brand-500" size={16} />
              {s}
            </li>
          ))}
        </ul>
      </section>

      {course.recognition?.frameworks && (
        <section className="ui-card p-5" aria-labelledby="recognition-title">
          <h2
            id="recognition-title"
            className="font-display mb-3 flex items-center gap-2 text-2xl"
          >
            <ShieldCheck className="text-brand-500" size={24} />
            Ghi nhận minh bạch
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-sun-100 bg-sun-100/40 p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-muted">
                Đơn vị ghi nhận hoàn thành
              </p>
              <p className="mt-1 flex items-start gap-2 font-bold">
                <Award className="mt-0.5 shrink-0 text-sun-500" size={18} />
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

      <section className="ui-card p-5">
        <h2 className="font-display mb-3 flex items-center gap-2 text-2xl">
          <Trophy className="text-sun-400" size={24} />
          Kết quả sau khóa học
        </h2>
        <ul className="flex flex-col gap-2">
          {outcomes.map((o) => (
            <li
              key={o}
              className="flex items-start gap-2 rounded-2xl border-2 border-mint-100 bg-mint-100/40 px-3 py-2 text-sm font-semibold"
            >
              <Target className="mt-0.5 shrink-0 text-success" size={16} />
              {o}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">
          Sản phẩm chính: <strong>{course.productLabel}</strong> ·{' '}
          {course.quests?.length ?? 0} nhiệm vụ · Khám phá → Chơi → Sáng tạo → Thử tài
        </p>
      </section>

      {course.quests && course.quests.length > 0 && (
        <section className="ui-card p-5">
          <h2 className="font-display mb-3 text-2xl">Lộ trình trạm</h2>
          <ol className="flex flex-col gap-2">
            {[...course.quests]
              .sort((a, b) => a.order - b.order)
              .map((q) => (
                <li
                  key={q.id}
                  className="flex items-center gap-3 rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 font-extrabold text-brand-600">
                    {q.order}
                  </span>
                  <span className="font-bold">{q.title}</span>
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

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => void startCourse()} disabled={busy}>
          {busy ? 'Đang mở…' : 'Bắt đầu / Tiếp tục bản đồ'}
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate(`/world/${course.id}`)}
        >
          Xem bản đồ
        </Button>
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
