import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import {
  Award,
  Activity,
  ArrowRight,
  BookOpen,
  Check,
  CircleCheckBig,
  Clock3,
  Download,
  Map as MapIcon,
  MessageSquareText,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  TimerReset,
  UserRoundPlus,
} from 'lucide-react'

import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { ApiError, api, downloadAuthorizedBlob } from '@/shared/lib/api'
import { learningApi } from '@/shared/lib/learning-api'
import { cn } from '@/shared/lib/cn'
import { useAuth } from '@/shared/store/auth'
import type { AgeExperiencePolicy } from '@/shared/age-experience/AgeExperienceProvider'
import { programArtworkHint } from '@/shared/config/assets'
import { ParentTeacherFeedbackSection } from '../components/ParentTeacherFeedbackSection'
import { useParentFeedbackBadge } from '../hooks/useParentFeedbackBadge'


type Child = {
  id: string
  nickname: string | null
  avatarId: string | null
  level: number
}
type CompetencyMap = {
  status: 'ready' | 'configuration_required'
  frameworks: Array<{
    id: string
    name: string
    disclaimer: string
    domains: Array<{
      id: string
      name: string
      skills: Array<{
        id: string
        name: string
        learnerLabel: string
        result: {
          level: 'no_data' | 'not_met' | 'developing' | 'achieved'
          scorePercent: number | null
          evidenceCount: number
        }
      }>
    }>
  }>
}
type Credential = {
  id: string
  kind: 'certificate' | 'badge'
  status: string
  verificationCode: string
  issuedAt: string
  course: { title: string; shortTitle: string }
  template: {
    name: string
    layoutJson: {
      backgroundUrl?: string | null
      allowDownload?: boolean
      allowShare?: boolean
    }
  }
}
type Course = {
  id: string
  title: string
  shortTitle: string
  status: string
  description?: string
  coverImage?: string | null
  ageLabel?: string
  enrolled?: boolean
  accessPolicy?: string
  priceAmountMinor?: number
  priceCurrency?: string
  questCount?: number
  programId?: string
  programTitle?: string
  programDescription?: string
  programImage?: string | null
  programSource?: 'aikid_official' | 'workspace' | 'creator_marketplace'
  regionOrder?: number
  stations?: Array<{ id: string; order: number; title: string }>
}
type PlacementRequest = {
  id: string
  courseId: string
  requestedLevel: number
  status: 'pending' | 'placed' | 'rejected' | 'cancelled'
  resolutionNote: string | null
  createdAt: string
  course: { id: string; title: string }
  targetClass: { id: string; name: string; code: string } | null
}
type Pathway = {
  recommendedCourseId: string | null
  courses: Array<{
    id: string
    title: string
    shortTitle: string
    status: 'completed' | 'active' | 'available' | 'locked'
    reasonCode: string
    completionPercent: number
    missingPrerequisites: string[]
  }>
}
type ChildProgress = {
  courseId: string | null
  courses: Array<{ id: string; title: string; shortTitle: string; ageLabel: string }>
  summary: { completed: number; total: number; totalStars: number; currentPhase: string | null }
  quests: Array<{
    id: string
    order: number
    title: string
    status: string
    phase: string
    stars: number
    xpEarned: number
  }>
}
type LearningData = {
  competency: CompetencyMap
  credentials: Credential[]
  pathway: Pathway
  courses: Course[]
  progress: ChildProgress
  subscription: { status: string; maxOpenCoursesPerChild: number }
  ageExperience: {
    status: 'ready' | 'configuration_required'
    policy: AgeExperiencePolicy | null
  }
}
type Section = 'overview' | 'pathway' | 'activity' | 'feedback' | 'growth'


const levelLabels = {
  no_data: 'Chưa có dữ liệu',
  not_met: 'Cần thêm trải nghiệm',
  developing: 'Đang phát triển',
  achieved: 'Đã thể hiện tốt',
} as const

/** Trả về thông báo lỗi thân thiện — không bao giờ lộ tên kỹ thuật */
function friendlyError(cause: unknown): string {
  if (cause instanceof Error) {
    const msg = cause.message
    // Che các lỗi kỹ thuật: ZodError, validation schema, stack trace
    if (
      msg.includes('ZodError') ||
      msg.includes('validation') ||
      msg.includes('schema') ||
      msg.includes('Expected') ||
      msg.includes('Received')
    ) {
      return 'Dữ liệu phản hồi không đúng định dạng. Vui lòng thử lại.'
    }
    // Che lỗi mạng/kết nối
    if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed to fetch')) {
      return 'Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.'
    }
    return msg
  }
  return 'Đã xảy ra sự cố. Vui lòng thử lại.'
}

function friendlyEnrollmentError(cause: unknown): string {
  if (cause instanceof ApiError) {
    if (cause.status === 402 || cause.status === 403 || cause.code === 'ENTITLEMENT_REQUIRED') {
      return 'Gói học hiện tại chưa có quyền mở vùng này. Ba / Mẹ hãy kiểm tra Gói học.'
    }
    if (cause.status === 409 || cause.code === 'COURSE_LIMIT_REACHED') {
      return 'Con đã dùng hết số khóa được mở trong gói hiện tại.'
    }
  }
  const message = friendlyError(cause)
  return message === 'Error' ? 'Chưa thể cập nhật khóa học. Vui lòng kiểm tra gói học và thử lại.' : message
}

export function ParentLearningPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const role = useAuth((s) => s.user?.role)
  const feedbackBadge = useParentFeedbackBadge(role)
  const [children, setChildren] = useState<Child[]>([])
  const [studentId, setStudentId] = useState('')
  const [section, setSection] = useState<Section>('overview')
  const [data, setData] = useState<LearningData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const { toasts, showToast, dismissToast } = useToast()

  // Mark seen when parent actively views feedback section
  useEffect(() => {
    if (section === 'feedback' && studentId) {
      feedbackBadge.markSeen(studentId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, studentId])

  useEffect(() => {
    void api<{ children: Child[] }>('/api/parent/children')
      .then((response) => {
        setChildren(response.children)
        const requestedChildId = searchParams.get('childId')
        const initialChildId = response.children.some((child) => child.id === requestedChildId)
          ? requestedChildId ?? ''
          : response.children[0]?.id ?? ''
        setStudentId(initialChildId)
      })
      .catch((cause) => setError(friendlyError(cause)))
  }, [searchParams])

  const selectChild = useCallback((childId: string) => {
    setStudentId(childId)
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set('childId', childId)
      return next
    }, { replace: true })
  }, [setSearchParams])

  const load = useCallback(async () => {
    if (!studentId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const query = `studentId=${encodeURIComponent(studentId)}`
      const [competency, credentials, pathway, ageExperience, courseResponse, progress, subscriptionResponse] = await Promise.all([
        api<CompetencyMap>(`/api/competency-map?${query}`),
        api<{ credentials: Credential[] }>(`/api/credentials?${query}`),
        learningApi.getPathway(studentId),
        api<{
          status: 'ready' | 'configuration_required'
          policy: AgeExperiencePolicy | null
        }>(`/api/learning/age-policy?${query}`),
        api<{ courses: Course[] }>(`/api/parent/children/${studentId}/courses`),
        api<ChildProgress>(`/api/parent/children/${studentId}/progress`),
        api<{ subscription: LearningData['subscription'] }>('/api/parent/subscription'),
      ])
      setData({
        competency,
        credentials: credentials.credentials,
        pathway,
        courses: courseResponse.courses,
        progress,
        subscription: subscriptionResponse.subscription,
        ageExperience,
      })
    } catch (cause) {
      setError(friendlyError(cause))
    } finally {
      setLoading(false)
    }
  }, [studentId])

  const toggleProgram = useCallback(async (courses: Course[], enroll: boolean) => {
    if (!studentId) return
    setBusy(true)
    try {
      for (const course of courses) {
        await api(`/api/parent/children/${studentId}/courses`, {
          method: 'POST',
          body: JSON.stringify({ courseId: course.id, enroll }),
        })
      }
      showToast(enroll ? 'Đã thêm vùng học vào lộ trình của con.' : 'Đã dừng vùng học.', 'success')
      await load()
    } catch (cause) {
      await load()
      showToast(friendlyEnrollmentError(cause), 'error')
    } finally {
      setBusy(false)
    }
  }, [load, showToast, studentId])

  useEffect(() => {
    void load()
  }, [load])

  async function downloadCredential(credential: Credential) {
    setBusy(true)
    try {
      const blob = await downloadAuthorizedBlob(`/api/credentials/${credential.id}/pdf`)
      const blobUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = blobUrl
      anchor.download = `chung-nhan-${credential.id}.pdf`
      anchor.click()
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000)
    } catch (cause) {
      showToast(friendlyError(cause), 'error')
    } finally {
      setBusy(false)
    }
  }


  return (
    <div className="flex flex-col gap-5">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <header className="ui-card flex flex-wrap items-end justify-between gap-4 p-5 sm:p-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500">
            Đồng hành cùng con
          </p>
          <h1 className="font-display text-2xl sm:text-3xl">Trung tâm học tập</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Chọn từng con để theo dõi lộ trình, hoạt động, nhận xét và năng lực trên cùng một nơi.
          </p>
        </div>
        {children.length > 0 && (
          <div className="grid min-w-52 gap-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold">Đang xem hồ sơ học tập</p>
              <Link to="/parent/kids" className="text-xs font-extrabold text-brand-600 hover:underline">Quản lý hồ sơ</Link>
            </div>
            {/* Show child buttons instead of select — easier to see badge per child */}
            <div className="flex flex-wrap gap-2">
              {children.map((child) => {
                const hasNew = feedbackBadge.byChild[child.id] ?? false
                const isActive = studentId === child.id
                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => selectChild(child.id)}
                    className={cn(
                      'relative flex min-h-10 items-center gap-2 rounded-2xl border-2 px-4 text-sm font-bold transition',
                      isActive
                        ? 'border-brand-400 bg-brand-50 text-brand-700'
                        : 'border-border bg-white text-text hover:border-brand-200',
                    )}
                    aria-pressed={isActive}
                    aria-label={`${child.nickname ?? 'Học viên'}${hasNew ? ' — có nhận xét mới' : ''}`}
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-xs text-brand-700">{(child.nickname ?? 'H').trim().slice(0, 1).toUpperCase()}</span>
                    {child.nickname ?? 'Học viên'}
                    {hasNew && (
                      <span
                        aria-hidden="true"
                        className="h-2 w-2 rounded-full bg-danger ring-1 ring-white"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Nội dung học tập của con">
        {(
          [
            ['overview', 'Tổng quan', TrendingUp],
            ['pathway', 'Lộ trình', MapIcon],
            ['activity', 'Hoạt động', Activity],
            ['feedback', 'Nhận xét', MessageSquareText],
            ['growth', 'Năng lực & thành tích', Sparkles],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={section === key}
            className={cn(
              'flex min-h-11 shrink-0 items-center gap-2 rounded-2xl px-4 text-sm font-extrabold transition',
              section === key
                ? 'bg-brand-500 text-white shadow-soft'
                : 'bg-white text-muted hover:bg-brand-50',
            )}
            onClick={() => setSection(key)}
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {children.length === 0 && !loading ? (
        <EmptyState
          title="Chưa có hồ sơ học viên"
          description="Ba / Mẹ hãy tạo hồ sơ cho con trước khi xem tình trạng học."
        />
      ) : loading ? (
        <PageSkeleton rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : section === 'feedback' && studentId ? (
        <ParentTeacherFeedbackSection childId={studentId} />
      ) : data && section === 'overview' ? (
        <LearningOverview
          child={children.find((child) => child.id === studentId) ?? null}
          pathway={data.pathway}
          credentials={data.credentials}
          hasNewFeedback={feedbackBadge.byChild[studentId] ?? false}
          onOpenPathway={() => setSection('pathway')}
          onOpenFeedback={() => setSection('feedback')}
        />
      ) : data && section === 'pathway' ? (
        <div className="grid gap-5">
          <PathwaySection pathway={data.pathway} />
          <CourseSelectionSection courses={data.courses} subscription={data.subscription} busy={busy} onToggleProgram={toggleProgram} />
        </div>
      ) : data && section === 'activity' ? (
        <LearningActivitySection studentId={studentId} initialProgress={data.progress} />
      ) : data ? (
        <GrowthSection
          competency={data.competency}
          credentials={data.credentials}
          ageExperience={data.ageExperience}
          busy={busy}
          onDownload={downloadCredential}
        />
      ) : null}
    </div>
  )
}

function LearningOverview({
  child,
  pathway,
  credentials,
  hasNewFeedback,
  onOpenPathway,
  onOpenFeedback,
}: {
  child: Child | null
  pathway: Pathway
  credentials: Credential[]
  hasNewFeedback: boolean
  onOpenPathway: () => void
  onOpenFeedback: () => void
}) {
  const active = pathway.courses.find((course) => course.id === pathway.recommendedCourseId)
    ?? pathway.courses.find((course) => course.status === 'active')
  const completed = pathway.courses.filter((course) => course.status === 'completed').length
  const childName = child?.nickname ?? 'Con'

  return (
    <div className="grid gap-5">
      <section className="ui-card overflow-hidden">
        <div className="grid gap-5 bg-gradient-to-br from-brand-50 via-white to-sky-50 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">Bước tiếp theo</p>
            <h2 className="mt-1 font-display text-2xl">
              {active ? `${childName} nên tiếp tục “${active.title}”` : `Chọn chương trình đầu tiên cho ${childName}`}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              {active
                ? `Lộ trình đã hoàn thành ${active.completionPercent}%. Tiến độ và điều kiện mở khóa do hệ thống học tập cập nhật.`
                : 'Chương trình phù hợp độ tuổi và quyền học hiện có sẽ xuất hiện trong mục Lộ trình.'}
            </p>
          </div>
          <Button onClick={onOpenPathway}>
            {active ? 'Xem lộ trình' : 'Chọn chương trình'} <ArrowRight size={17} aria-hidden="true" />
          </Button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewStat icon={BookOpen} label="Đang học" value={pathway.courses.filter((course) => course.status === 'active').length} tone="brand" />
        <OverviewStat icon={CircleCheckBig} label="Đã hoàn thành" value={completed} tone="mint" />
        <OverviewStat icon={Award} label="Chứng nhận" value={credentials.length} tone="sun" />
        <button type="button" onClick={onOpenFeedback} className="ui-card min-h-28 p-4 text-left transition hover:-translate-y-0.5 hover:border-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
          <div className="flex items-center justify-between gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-coral-50 text-coral-600"><MessageSquareText size={20} aria-hidden="true" /></span>
            {hasNewFeedback && <span className="rounded-full bg-coral-100 px-2 py-1 text-xs font-extrabold text-danger">Mới</span>}
          </div>
          <p className="mt-3 text-sm font-bold text-muted">Nhận xét giáo viên</p>
          <p className="mt-1 text-sm font-extrabold text-text">{hasNewFeedback ? 'Có cập nhật mới' : 'Xem nhận xét'}</p>
        </button>
      </div>

      <PathwaySection pathway={pathway} compact />
    </div>
  )
}

function OverviewStat({ icon: Icon, label, value, tone }: { icon: typeof BookOpen; label: string; value: number; tone: 'brand' | 'mint' | 'sun' }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600',
    mint: 'bg-mint-50 text-success',
    sun: 'bg-sun-50 text-warning',
  }
  return <article className="ui-card min-h-28 p-4"><span className={cn('grid h-10 w-10 place-items-center rounded-2xl', tones[tone])}><Icon size={20} aria-hidden="true" /></span><p className="mt-3 text-sm font-bold text-muted">{label}</p><p className="font-display text-2xl text-text">{value}</p></article>
}

function LearningActivitySection({ studentId, initialProgress }: { studentId: string; initialProgress: ChildProgress }) {
  const [progress, setProgress] = useState(initialProgress)
  const [courseId, setCourseId] = useState(initialProgress.courseId ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    setProgress(initialProgress)
    setCourseId(initialProgress.courseId ?? '')
    setShowAll(false)
  }, [initialProgress])

  const selectCourse = useCallback(async (nextCourseId: string) => {
    setCourseId(nextCourseId)
    setLoading(true)
    setError(null)
    try {
      const next = await api<ChildProgress>(`/api/parent/children/${studentId}/progress?courseId=${encodeURIComponent(nextCourseId)}`)
      setProgress(next)
    } catch (cause) {
      setError(friendlyError(cause))
    } finally {
      setLoading(false)
    }
  }, [studentId])

  const visibleQuests = progress.quests
    .filter((quest) => quest.status === 'completed' || quest.status === 'in_progress')
    .sort((a, b) => b.order - a.order)
  const completionPercent = progress.summary.total > 0
    ? Math.round((progress.summary.completed / progress.summary.total) * 100)
    : 0
  const phaseLabel = progress.summary.completed === progress.summary.total && progress.summary.total > 0
    ? 'Đã hoàn thành'
    : progress.summary.currentPhase === 'game'
    ? 'Trò chơi'
    : progress.summary.currentPhase === 'practice'
      ? 'Thực hành'
      : progress.summary.currentPhase === 'check'
        ? 'Kiểm tra'
        : progress.summary.currentPhase === 'learn'
          ? 'Khám phá'
          : 'Chưa bắt đầu'
  const currentQuest = progress.quests.find((quest) => quest.status === 'in_progress')
  const recentQuests = showAll ? visibleQuests : visibleQuests.slice(0, 3)

  return (
    <div className="grid gap-5">
      <section className="ui-card p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">Tiến độ từ LMS</p>
            <h2 className="font-display text-2xl">Hoạt động học</h2>
            <p className="mt-1 text-sm text-muted">Theo dõi các trạm con đã hoàn thành hoặc đang học.</p>
          </div>
          {progress.courses.length > 0 && (
            <label className="grid min-w-56 gap-1 text-sm font-bold">
              Chương trình
              <select className="field-input" value={courseId} disabled={loading} onChange={(event) => void selectCourse(event.target.value)}>
                {progress.courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
              </select>
            </label>
          )}
        </div>
      </section>

      {error ? <ErrorState message={error} onRetry={() => void selectCourse(courseId)} /> : loading ? <PageSkeleton rows={3} /> : progress.summary.total === 0 ? (
        <EmptyState title="Chưa có hoạt động học" description="Hoạt động sẽ xuất hiện sau khi con bắt đầu trạm đầu tiên." />
      ) : (
        <>
          <section className="ui-card overflow-hidden">
            <div className="grid gap-5 bg-gradient-to-br from-brand-50 via-white to-mint-50 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">{currentQuest ? 'Đang học' : phaseLabel}</p>
                <h3 className="mt-1 font-display text-2xl">{currentQuest?.title ?? (completionPercent === 100 ? 'Đã hoàn thành chương trình' : 'Sẵn sàng cho trạm tiếp theo')}</h3>
                <p className="mt-2 text-sm text-muted">{progress.summary.completed}/{progress.summary.total} trạm · {progress.summary.totalStars} sao · {completionPercent}% lộ trình</p>
              </div>
              <div className="grid h-24 w-24 place-items-center rounded-full bg-white shadow-soft" style={{ background: `conic-gradient(var(--color-brand-500) ${completionPercent}%, white 0)` }}>
                <div className="grid h-20 w-20 place-items-center rounded-full bg-white font-display text-xl text-brand-700">{completionPercent}%</div>
              </div>
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
            <section className="ui-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div><p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">Lịch sử gần đây</p><h3 className="font-display text-xl">Các trạm vừa học</h3></div>
                <span className="rounded-full bg-mint-50 px-3 py-1 text-sm font-extrabold text-success">{progress.summary.completed} hoàn thành</span>
              </div>
              {recentQuests.length === 0 ? <p className="mt-5 text-sm text-muted">Con chưa bắt đầu trạm nào trong chương trình này.</p> : <ol className="mt-5 grid gap-2">{recentQuests.map((quest) => <li key={quest.id} className="flex items-center gap-3 border-b border-border py-3 last:border-0"><span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold', quest.status === 'completed' ? 'bg-mint-100 text-success' : 'bg-brand-100 text-brand-700')}>{quest.status === 'completed' ? <Check size={18} aria-hidden="true" /> : quest.order}</span><div className="min-w-0 flex-1"><p className="font-bold text-text">{quest.title}</p><p className="mt-0.5 text-xs text-muted">{quest.status === 'completed' ? 'Đã hoàn thành' : `Đang học · ${phaseLabel}`}</p></div><span className="shrink-0 text-xs font-extrabold text-muted">{quest.stars} sao · {quest.xpEarned} XP</span></li>)}</ol>}
              {visibleQuests.length > 3 && <Button variant="ghost" className="mt-3 w-full" onClick={() => setShowAll((current) => !current)}>{showAll ? 'Thu gọn lịch sử' : `Xem tất cả ${visibleQuests.length} hoạt động`}</Button>}
            </section>

            <aside className="ui-card grid content-start gap-4 p-5 sm:p-6">
              <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-600"><Clock3 size={20} aria-hidden="true" /></span><div><h3 className="font-display text-xl">Nhịp học & thời lượng</h3><p className="mt-1 text-sm leading-relaxed text-muted">LMS chưa gửi phiên học, số phút và mốc thời gian nên hệ thống chưa thể vẽ biểu đồ tuần chính xác.</p></div></div>
              <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 p-4">
                <p className="text-sm font-extrabold text-brand-800">Sẵn sàng khi LMS kết nối</p>
                <ul className="mt-2 grid gap-2 text-sm text-muted"><li className="flex gap-2"><TrendingUp size={16} className="mt-0.5 shrink-0" /> Phút học và số phiên theo ngày</li><li className="flex gap-2"><TimerReset size={16} className="mt-0.5 shrink-0" /> Mục tiêu tuần, nhắc nghỉ và giới hạn giờ học</li><li className="flex gap-2"><Activity size={16} className="mt-0.5 shrink-0" /> So sánh xu hướng 7/30/90 ngày</li></ul>
              </div>
              <p className="text-xs leading-relaxed text-muted">Không dùng sao hoặc XP để suy đoán thời gian học.</p>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}

function CourseSelectionSection({
  courses,
  subscription,
  busy,
  onToggleProgram,
}: {
  courses: Course[]
  subscription: LearningData['subscription']
  busy: boolean
  onToggleProgram: (courses: Course[], enroll: boolean) => Promise<void>
}) {
  type Space = NonNullable<Course['programSource']>
  const [space, setSpace] = useState<Space>('aikid_official')
  const programs = useMemo(() => {
    const grouped = new Map<string, { id: string; title: string; description: string; image: string | null; source: Space; regions: Course[] }>()
    for (const course of courses) {
      const source = course.programSource ?? 'aikid_official'
      const id = course.programId || course.id
      const current = grouped.get(id) ?? {
        id,
        title: course.programTitle || course.title,
        description: course.programDescription || course.description || '',
        image: programArtworkHint({
          id,
          title: course.programTitle || course.title,
          imageUrl: course.programImage ?? course.coverImage ?? null,
        }),
        source,
        regions: [],
      }
      if (!current.regions.some((region) => region.id === course.id)) current.regions.push(course)
      grouped.set(id, current)
    }
    return [...grouped.values()].map((program) => ({
      ...program,
      regions: program.regions.sort((a, b) => (a.regionOrder ?? 0) - (b.regionOrder ?? 0)),
    }))
  }, [courses])
  const visiblePrograms = programs.filter((program) => program.source === space)
  const enrolledCourseCount = courses.filter((course) => course.enrolled).length
  const availableSlots = Math.max(0, subscription.maxOpenCoursesPerChild - enrolledCourseCount)
  function openProgramDetails(programId: string) {
    const details = document.getElementById(`program-${programId}-regions`)
    if (details instanceof HTMLDetailsElement) {
      details.open = true
      details.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }
  const spaces: Array<{ id: Space; label: string; caption: string }> = [
    { id: 'aikid_official', label: 'AiKid', caption: 'Chương trình chính thức' },
    { id: 'workspace', label: 'Trường học', caption: 'Do trường phân phối' },
    { id: 'creator_marketplace', label: 'Học tập tự do', caption: 'Giáo viên & gia đình' },
  ]
  return (
    <section className="ui-card overflow-hidden" aria-labelledby="parent-course-title">
      <div className="border-b border-border bg-brand-50/60 p-5">
        <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">Học theo tiến độ riêng</p>
        <h2 id="parent-course-title" className="mt-1 font-display text-2xl">Chọn chương trình cho con</h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted">
          Chọn không gian và đăng ký một chương trình. Ba / Mẹ có thể xem trước các vùng, trạm; con học bất cứ lúc nào và tiếp tục từ trạm đang dở.
        </p>
      </div>
      <div className="grid gap-2 border-b border-border bg-white p-4 sm:grid-cols-3" role="tablist" aria-label="Không gian học tập">
        {spaces.map((item) => {
          const count = programs.filter((program) => program.source === item.id).length
          return <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={space === item.id}
            className={cn('min-h-16 rounded-2xl border-2 px-4 py-2 text-left transition', space === item.id ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-soft' : 'border-border bg-white hover:border-brand-200')}
            onClick={() => setSpace(item.id)}
          >
            <span className="flex items-center justify-between gap-2 font-extrabold"><span>{item.label}</span><span className="rounded-full bg-white px-2 py-0.5 text-xs text-muted">{count}</span></span>
            <span className="mt-0.5 block text-xs font-bold text-muted">{item.caption}</span>
          </button>
        })}
      </div>
      {visiblePrograms.length === 0 ? (
        <div className="p-8 text-center">
          <p className="font-display text-lg">Chưa có chương trình trong không gian này</p>
          <p className="mt-1 text-sm text-muted">Chương trình do AiKid, trường hoặc giáo viên cấp sẽ xuất hiện đúng không gian.</p>
        </div>
      ) : (
        <div className="grid gap-4 p-4">
          {visiblePrograms.map((program) => {
            const enrolledCount = program.regions.filter((region) => region.enrolled).length
            const enrolled = enrolledCount === program.regions.length
            const stationCount = program.regions.reduce((sum, region) => sum + (region.questCount ?? region.stations?.length ?? 0), 0)
            return <article key={program.id} className={cn('overflow-hidden rounded-3xl border-2', enrolledCount > 0 ? 'border-mint-300 bg-mint-50/30' : 'border-border bg-white')}>
              <div className="grid gap-4 p-4 sm:grid-cols-[180px_minmax(0,1fr)_210px] sm:items-center">
                {program.image ? <img src={program.image} alt="" loading="lazy" className="aspect-[3/2] w-full rounded-2xl border border-border object-cover shadow-soft" /> : <div className="flex aspect-[3/2] w-full items-center justify-center rounded-2xl bg-brand-50 text-brand-500"><BookOpen size={34} aria-hidden="true" /></div>}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-xl text-text">{program.title}</h3>
                    {enrolledCount > 0 && <span className="rounded-full bg-mint-100 px-2 py-1 text-xs font-extrabold text-success">{enrolled ? 'Đang học' : `${enrolledCount}/${program.regions.length} vùng`}</span>}
                  </div>
                  {program.description && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{program.description}</p>}
                  <p className="mt-2 text-xs font-extrabold text-muted">{program.regions.length} vùng · {stationCount} trạm · Tự học theo tiến độ riêng</p>
                </div>
                <Button className="w-full" variant={enrolled ? 'secondary' : 'primary'} disabled={busy} onClick={() => openProgramDetails(program.id)}>
                  {enrolled
                    ? <><Check size={17} aria-hidden="true" /> Đã đăng ký đủ</>
                    : <><Plus size={17} aria-hidden="true" /> {enrolledCount > 0 ? `Chọn thêm ${program.regions.length - enrolledCount} vùng` : 'Chọn vùng học'}</>}
                </Button>
              </div>
              <details id={`program-${program.id}-regions`} className="border-t border-border bg-white/80">
                <summary className="min-h-11 cursor-pointer px-4 py-3 text-sm font-extrabold text-brand-700">Xem vùng và trạm trong chương trình</summary>
                <div className="grid gap-3 px-4 pb-4 md:grid-cols-2">
                  {program.regions.map((region, index) => <div key={region.id} className="rounded-2xl border border-border bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div><p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">Vùng {index + 1}</p><h4 className="mt-0.5 font-display text-base">{region.title}</h4></div>
                      <div className="flex shrink-0 flex-wrap justify-end gap-1"><span className="rounded-full bg-sky-50 px-2 py-1 text-xs font-bold text-muted">{region.questCount ?? region.stations?.length ?? 0} trạm</span>{region.enrolled && <span className="rounded-full bg-mint-100 px-2 py-1 text-xs font-extrabold text-success">Đã đăng ký</span>}</div>
                    </div>
                    {region.stations && region.stations.length > 0 && <ol className="mt-2 grid gap-1 text-xs text-muted">{region.stations.slice(0, 3).map((station) => <li key={station.id}><strong className="text-text">Trạm {station.order}:</strong> {station.title}</li>)}</ol>}
                    {(region.stations?.length ?? 0) > 3 && <p className="mt-1 text-xs font-bold text-brand-600">+ {(region.stations?.length ?? 0) - 3} trạm khác</p>}
                    {!region.enrolled && (availableSlots > 0
                      ? <Button className="mt-3 w-full" disabled={busy} onClick={() => void onToggleProgram([region], true)}><Plus size={16} aria-hidden="true" /> Đăng ký vùng này</Button>
                      : <Link to="/parent/plan" className="ui-btn ui-btn-secondary mt-3 w-full">Đã mở {enrolledCourseCount}/{subscription.maxOpenCoursesPerChild} vùng · Nâng gói</Link>)}
                  </div>)}
                </div>
              </details>
            </article>
          })}
        </div>
      )}
    </section>
  )
}

const weekdayLabels = [
  'Chủ nhật',
  'Thứ hai',
  'Thứ ba',
  'Thứ tư',
  'Thứ năm',
  'Thứ sáu',
  'Thứ bảy',
]

function PlacementSection({
  courses,
  placements,
  form,
  busy,
  onChange,
  onSubmit,
}: {
  courses: Course[]
  placements: PlacementRequest[]
  form: {
    courseId: string
    requestedLevel: number
    availability: Array<{ weekday: number; start: string; end: string }>
  }
  busy: boolean
  onChange: (value: {
    courseId: string
    requestedLevel: number
    availability: Array<{ weekday: number; start: string; end: string }>
  }) => void
  onSubmit: (event: React.FormEvent) => Promise<void>
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <form className="ui-card grid h-fit gap-4 p-5" onSubmit={(event) => void onSubmit(event)}>
        <div>
          <h2 className="font-display text-xl">Yêu cầu xếp lớp</h2>
          <p className="text-sm text-muted">
            Giáo viên chỉ xếp vào lớp phù hợp tuổi, cấp độ, sức chứa và không trùng lịch.
          </p>
        </div>
        <label className="grid gap-1 text-sm font-bold">
          Khóa học
          <select
            required
            className="field-input"
            value={form.courseId}
            onChange={(event) => onChange({ ...form, courseId: event.target.value })}
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Cấp độ mong muốn
          <input
            type="number"
            min={1}
            max={100}
            required
            className="field-input"
            value={form.requestedLevel}
            onChange={(event) =>
              onChange({ ...form, requestedLevel: Number(event.target.value) })
            }
          />
        </label>
        <fieldset className="rounded-2xl border-2 border-border p-3">
          <legend className="px-2 text-sm font-bold">Khung giờ có thể học</legend>
          <div className="space-y-3">
            {form.availability.map((slot, index) => (
              <div key={index} className="grid gap-2 rounded-xl bg-page p-3 sm:grid-cols-3">
                <select
                  aria-label={`Ngày ${index + 1}`}
                  className="field-input"
                  value={slot.weekday}
                  onChange={(event) =>
                    onChange({
                      ...form,
                      availability: form.availability.map((row, rowIndex) =>
                        rowIndex === index
                          ? { ...row, weekday: Number(event.target.value) }
                          : row,
                      ),
                    })
                  }
                >
                  {weekdayLabels.map((label, weekday) => (
                    <option key={label} value={weekday}>{label}</option>
                  ))}
                </select>
                <input
                  type="time"
                  required
                  aria-label={`Bắt đầu khung ${index + 1}`}
                  className="field-input"
                  value={slot.start}
                  onChange={(event) =>
                    onChange({
                      ...form,
                      availability: form.availability.map((row, rowIndex) =>
                        rowIndex === index ? { ...row, start: event.target.value } : row,
                      ),
                    })
                  }
                />
                <input
                  type="time"
                  required
                  aria-label={`Kết thúc khung ${index + 1}`}
                  className="field-input"
                  value={slot.end}
                  onChange={(event) =>
                    onChange({
                      ...form,
                      availability: form.availability.map((row, rowIndex) =>
                        rowIndex === index ? { ...row, end: event.target.value } : row,
                      ),
                    })
                  }
                />
                {form.availability.length > 1 && (
                  <button
                    type="button"
                    className="text-left text-xs font-bold text-danger"
                    onClick={() =>
                      onChange({
                        ...form,
                        availability: form.availability.filter((_, rowIndex) => rowIndex !== index),
                      })
                    }
                  >
                    Xóa khung giờ
                  </button>
                )}
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            className="mt-2"
            disabled={form.availability.length >= 30}
            onClick={() =>
              onChange({
                ...form,
                availability: [
                  ...form.availability,
                  { weekday: 1, start: '18:00', end: '19:00' },
                ],
              })
            }
          >
            Thêm khung giờ
          </Button>
        </fieldset>
        <Button type="submit" disabled={busy || !form.courseId}>
          <UserRoundPlus size={17} />
          {busy ? 'Đang gửi…' : 'Gửi yêu cầu'}
        </Button>
      </form>

      <section className="ui-card p-5">
        <h2 className="font-display text-xl">Trạng thái yêu cầu</h2>
        {placements.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Chưa có yêu cầu xếp lớp.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {placements.map((request) => (
              <article key={request.id} className="rounded-2xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">{request.course.title}</p>
                    <p className="text-sm text-muted">
                      Gửi {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(
                        new Date(request.createdAt),
                      )}
                      {request.targetClass ? ` · ${request.targetClass.name}` : ''}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2 py-1 text-xs font-bold',
                      request.status === 'placed'
                        ? 'bg-mint-100 text-success'
                        : request.status === 'rejected'
                          ? 'bg-coral-100 text-danger'
                          : 'bg-sun-100 text-warning',
                    )}
                  >
                    {request.status === 'placed'
                      ? 'Đã xếp lớp'
                      : request.status === 'rejected'
                        ? 'Không phù hợp'
                        : 'Đang xử lý'}
                  </span>
                </div>
                {request.resolutionNote && (
                  <p className="mt-2 text-sm text-muted">{request.resolutionNote}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>

  )
}

function PathwaySection({ pathway, compact = false }: { pathway: Pathway; compact?: boolean }) {
  return (
    <section className="ui-card p-5">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">Lộ trình cá nhân</p>
        <h2 className="font-display text-xl">Khóa đang học và bước tiếp theo</h2>
      </div>
      {pathway.courses.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-brand-50 p-4">
          <p className="font-bold text-brand-800">Chưa có chương trình đang học</p>
          <p className="mt-1 text-sm text-muted">Ba / Mẹ có thể chọn chương trình phù hợp ngay trong mục Lộ trình.</p>
        </div>
      ) : (
        <div className={cn('mt-4 grid gap-3 sm:grid-cols-2', compact ? 'xl:grid-cols-3' : 'xl:grid-cols-3')}>
          {pathway.courses.map((course) => (
            <article key={course.id} className={cn('rounded-2xl border p-4', course.id === pathway.recommendedCourseId ? 'border-brand-300 bg-brand-50' : 'border-border bg-page')}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold">{course.title}</h3>
                {course.id === pathway.recommendedCourseId && <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">Nên học tiếp</span>}
              </div>
              <p className="mt-2 text-sm text-muted">{course.status === 'completed' ? 'Đã hoàn thành' : course.status === 'active' ? 'Đang học' : course.status === 'available' ? 'Đã mở' : 'Đang khóa'} · {course.completionPercent}%</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white" aria-label={`Hoàn thành ${course.completionPercent}%`} role="progressbar" aria-valuenow={course.completionPercent} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, Math.max(0, course.completionPercent))}%` }} />
              </div>
              {course.status === 'locked' && course.missingPrerequisites.length > 0 && <p className="mt-2 text-xs text-warning">Cần hoàn thành: {course.missingPrerequisites.join(', ')}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function GrowthSection({
  competency,
  credentials,
  ageExperience,
  busy,
  onDownload,
}: {
  competency: CompetencyMap
  credentials: Credential[]
  ageExperience: LearningData['ageExperience']
  busy: boolean
  onDownload: (credential: Credential) => void
}) {
  const levelWidth = { no_data: 0, not_met: 25, developing: 62, achieved: 100 } as const
  return (
    <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
      <section className="ui-card p-5">
        <div className="mb-4 flex items-start gap-3">
          <ShieldCheck className="text-brand-500" aria-hidden="true" />
          <div>
            <h2 className="font-display text-xl">Bản đồ năng lực</h2>
            <p className="text-sm text-muted">
              "Chưa có dữ liệu" được giữ riêng, không quy đổi thành điểm 0.
            </p>
          </div>
        </div>
        {competency.status === 'configuration_required' ? (
          <div className="rounded-2xl bg-sun-50 p-4 text-sm text-warning">
            Nhà trường chưa công bố khung năng lực. Hệ thống không tự đặt tên miền năng lực thay khách hàng.
          </div>
        ) : (
          <div className="space-y-4">
            {competency.frameworks.map((framework) => (
              <article key={framework.id}>
                <h3 className="font-bold">{framework.name}</h3>
                <div className="mt-3 space-y-3">
                  {framework.domains.map((domain) => (
                    <div key={domain.id} className="rounded-3xl border border-border bg-page p-4">
                      <div className="flex items-center justify-between gap-3"><p className="font-display text-lg text-brand-800">{domain.name}</p><span className="text-xs font-bold text-muted">{domain.skills.reduce((sum, skill) => sum + skill.result.evidenceCount, 0)} bằng chứng</span></div>
                      <div className="mt-3 grid gap-3">
                        {domain.skills.map((skill) => (
                          <div key={skill.id} className="rounded-2xl bg-white p-4 shadow-soft">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-bold">
                                {skill.learnerLabel || skill.name}
                              </p>
                              <span
                                className={cn(
                                  'rounded-full px-2 py-0.5 text-xs font-bold',
                                  skill.result.level === 'achieved'
                                    ? 'bg-mint-100 text-success'
                                    : skill.result.level === 'developing'
                                      ? 'bg-sun-100 text-warning'
                                      : 'bg-sky-100 text-muted',
                                )}
                              >
                                {ageExperience.policy?.copyPolicy.competencyLevelLabels[
                                  skill.result.level
                                ] ?? levelLabels[skill.result.level]}
                              </span>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-50" role="progressbar" aria-label={`${skill.learnerLabel || skill.name}: ${levelLabels[skill.result.level]}`} aria-valuenow={levelWidth[skill.result.level]} aria-valuemin={0} aria-valuemax={100}><div className={cn('h-full rounded-full', skill.result.level === 'achieved' ? 'bg-mint-500' : skill.result.level === 'developing' ? 'bg-sun-400' : 'bg-sky-300')} style={{ width: `${levelWidth[skill.result.level]}%` }} /></div>
                            <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted"><span>{skill.result.evidenceCount === 0 ? 'Cần thêm trải nghiệm để đánh giá' : `${skill.result.evidenceCount} bằng chứng học tập`}</span>{skill.result.scorePercent !== null && <span className="font-bold">Kết quả gần nhất {skill.result.scorePercent}%</span>}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted">{framework.disclaimer}</p>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="ui-card p-5">
        <div className="mb-4 flex items-center gap-3">
          <Award className="text-sun-500" aria-hidden="true" />
          <h2 className="font-display text-xl">Chứng nhận</h2>
        </div>
        {credentials.length === 0 ? (
          <p className="text-sm text-muted">
            Chưa có chứng nhận mới. Hệ thống chỉ cấp khi đủ điều kiện được cấu hình.
          </p>
        ) : (
          <div className="space-y-3">
            {credentials.map((credential) => (
              <article key={credential.id} className="rounded-2xl bg-sun-50 p-4">
                {credential.kind === 'badge' && credential.template.layoutJson.backgroundUrl && (
                  <img
                    src={credential.template.layoutJson.backgroundUrl}
                    alt=""
                    className="mb-3 h-20 w-20 rounded-2xl object-cover"
                    loading="lazy"
                  />
                )}
                <p className="font-bold">{credential.template.name}</p>
                <p className="mt-1 text-sm text-muted">{credential.course.title}</p>
                <p className="mt-2 break-all font-mono text-xs">
                  Mã chứng nhận: {credential.verificationCode}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {credential.kind === 'certificate' &&
                    credential.template.layoutJson.allowDownload && (
                      <Button
                        variant="secondary"
                        disabled={busy}
                        onClick={() => onDownload(credential)}
                      >
                        <Download size={16} /> Tải chứng nhận
                      </Button>
                    )}
                  {credential.template.layoutJson.allowShare &&
                    ageExperience.policy?.permissionPolicy.canShareCredentials && (
                    <Link
                      to={`/verify/credential/${credential.verificationCode}`}
                      className="ui-btn ui-btn-ghost"
                    >
                      Xác minh / chia sẻ
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
