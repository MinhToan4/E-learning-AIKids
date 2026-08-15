import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BookOpenCheck,
  CalendarCheck,
  ClipboardCheck,
  FileCheck2,
  MessageSquareText,
  Users,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { useAuth } from '@/shared/store/auth'
import { reviewResponseSummary } from '../lib/grading'

type Learner = {
  id: string
  nickname: string | null
  ageBand: string
  level: number
  completedLessons: number
  totalPlatformLessons: number
  latestObservation: {
    body: string
    status: string
    updatedAt: string
  } | null
}
type ConsoleClass = {
  id: string
  name: string
  code: string
  classType: string
  capacity: number
  status: string
  course: { id: string; title: string; shortTitle: string } | null
  nextSession: {
    id: string
    title: string
    startsAt: string
    endsAt: string
  } | null
  learners: Learner[]
}
type ConsoleData = {
  pendingReviews: number
  alerts: { configurationRequired: boolean; reason: string }
  classes: ConsoleClass[]
}
type CourseOption = { id: string; title: string }
type TeacherObservation = {
  id: string
  studentId: string
  courseId: string | null
  body: string
  strengthsJson: string[]
  developmentJson: string[]
  scorePercent: number | null
  status: 'draft' | 'published'
  version: number
  updatedAt: string
}
type RubricCriterion = { id: string; label: string; maxPoints: number }
type Review = {
  id: string
  status: string
  version: number
  feedback: string | null
  rubricScores: Record<string, number>
  student: { id: string; nickname: string | null }
  assessment: { id: string; title: string; courseId: string }
  attemptId: string
  attemptNumber: number
  maxAttempts: number
  points: number
  question: {
    type: string
    prompt: { stem?: string }
    rubric: { criteria?: RubricCriterion[] }
  }
  response: Record<string, unknown>
  artifact: { snapshotJson?: unknown } | null
}
type Session = {
  id: string
  classId: string
  title: string
  startsAt: string
  endsAt: string
  status: string
  attendanceFinalizedAt: string | null
}
type ScheduleClass = { id: string; name: string; sessions: Session[] }
type AttendanceStudent = { id: string; nickname: string | null }
type AttendanceRecord = {
  studentId: string
  status: AttendanceStatus
  note: string | null
  version: number
}
type AttendanceData = {
  session: Session & { attendance: AttendanceRecord[] }
  students: AttendanceStudent[]
}
type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'
type ReportPolicy = {
  id: string
  code: string
  version: number
  periodDays: number
  timezone: string
  requireApproval: boolean
  deliveryChannels: string[]
  template: { name: string; requiredSections: string[] }
}
type TeacherReport = {
  id: string
  studentId: string
  status: string
  version: number
  periodStart: string
  periodEnd: string
  missingSections: string[]
  student: { nickname: string | null }
  template: { name: string }
  deliveries: Array<{ channel: string; status: string; lastError: string | null }>
}
type Section = 'overview' | 'grading' | 'attendance' | 'reports'

function splitValues(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((row) => row.trim())
    .filter(Boolean)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function TeacherOperationsPage() {
  const [section, setSection] = useState<Section>('overview')
  const [consoleData, setConsoleData] = useState<ConsoleData | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [schedule, setSchedule] = useState<ScheduleClass[]>([])
  const [policies, setPolicies] = useState<ReportPolicy[]>([])
  const [reports, setReports] = useState<TeacherReport[]>([])
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const role = useAuth((state) => state.user?.role)
  const { toasts, showToast, dismissToast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [
        consoleResult,
        reviewResult,
        scheduleResult,
        policyResult,
        reportResult,
        courseResult,
      ] =
        await Promise.all([
          api<ConsoleData>('/api/teacher/console'),
          api<{ reviews: Review[] }>('/api/teacher/grading/queue?limit=100'),
          api<{ classes: ScheduleClass[] }>('/api/schedule'),
          api<{ policies: ReportPolicy[] }>('/api/report-policies/active'),
          api<{ reports: TeacherReport[] }>('/api/reports'),
          api<{ courses: CourseOption[] }>('/api/teacher/lectures'),
        ])
      setConsoleData(consoleResult)
      setReviews(reviewResult.reviews)
      setSchedule(scheduleResult.classes)
      setPolicies(policyResult.policies)
      setReports(reportResult.reports)
      setCourses(courseResult.courses)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tải được bàn làm việc.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const learners = useMemo(
    () =>
      [
        ...new Map(
          (consoleData?.classes ?? [])
            .flatMap((classroom) => classroom.learners)
            .map((learner) => [learner.id, learner]),
        ).values(),
      ],
    [consoleData],
  )

  if (loading) return <PageSkeleton rows={6} />
  if (error) return <ErrorState message={error} onRetry={() => void load()} />
  if (!consoleData) return null

  return (
    <div className="flex flex-col gap-5">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <header className="ui-card p-5 sm:p-6">
        <p className="text-xs font-extrabold uppercase tracking-widest text-sky-600">
          Điều hành lớp học
        </p>
        <h1 className="font-display text-2xl sm:text-3xl">Bàn làm việc giáo viên</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Một nơi để theo dõi lớp, chấm bài, điểm danh, nhận xét và phát hành báo
          cáo phụ huynh.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Lớp phụ trách" value={consoleData.classes.length} icon={Users} />
          <Metric label="Học viên" value={learners.length} icon={BookOpenCheck} />
          <Metric label="Bài chờ chấm" value={consoleData.pendingReviews} icon={ClipboardCheck} />
          <Metric label="Báo cáo" value={reports.length} icon={FileCheck2} />
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
        {(
          [
            ['overview', 'Tổng quan & nhận xét', Users],
            ['grading', 'Chấm bài', ClipboardCheck],
            ['attendance', 'Điểm danh', CalendarCheck],
            ['reports', 'Báo cáo phụ huynh', FileCheck2],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={section === key}
            className={cn(
              'flex min-h-11 shrink-0 items-center gap-2 rounded-2xl px-4 text-sm font-extrabold',
              section === key
                ? 'bg-sky-500 text-white shadow-soft'
                : 'bg-white text-muted hover:bg-sky-50',
            )}
            onClick={() => setSection(key)}
          >
            <Icon size={17} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {section === 'overview' && (
        <OverviewSection
          data={consoleData}
          learners={learners}
          courses={courses}
          canWriteObservation={role === 'teacher'}
          onDone={() => void load()}
          showToast={showToast}
        />
      )}
      {section === 'grading' && (
        <GradingSection reviews={reviews} onDone={() => void load()} showToast={showToast} />
      )}
      {section === 'attendance' && (
        <AttendanceSection
          classes={schedule}
          onDone={() => void load()}
          showToast={showToast}
        />
      )}
      {section === 'reports' && (
        <ReportWorkflowSection
          learners={learners}
          policies={policies}
          reports={reports}
          onDone={() => void load()}
          showToast={showToast}
        />
      )}
    </div>
  )
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: typeof Users
}) {
  return (
    <div className="rounded-2xl bg-sky-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-muted">{label}</span>
        <Icon size={17} className="text-sky-500" aria-hidden="true" />
      </div>
      <p className="mt-1 font-display text-2xl text-sky-700">{value}</p>
    </div>
  )
}

function OverviewSection({
  data,
  learners,
  courses,
  canWriteObservation,
  onDone,
  showToast,
}: {
  data: ConsoleData
  learners: Learner[]
  courses: CourseOption[]
  canWriteObservation: boolean
  onDone: () => void
  showToast: (message: string, kind: 'success' | 'error') => void
}) {
  const [studentId, setStudentId] = useState(learners[0]?.id ?? '')
  const [body, setBody] = useState('')
  const [strengths, setStrengths] = useState('')
  const [development, setDevelopment] = useState('')
  const [observationCourseId, setObservationCourseId] = useState(
    courses[0]?.id ?? '',
  )
  const [scorePercent, setScorePercent] = useState<number | ''>('')
  const [observationStatus, setObservationStatus] = useState<
    'draft' | 'published'
  >('draft')
  const [observations, setObservations] = useState<TeacherObservation[]>([])
  const [editingObservation, setEditingObservation] =
    useState<TeacherObservation | null>(null)
  const [busy, setBusy] = useState(false)
  const [override, setOverride] = useState({
    studentId: learners[0]?.id ?? '',
    courseId: courses[0]?.id ?? '',
    allowed: true,
    reason: '',
    expiresAt: '',
  })

  const loadObservations = useCallback(
    async (selectedStudentId: string) => {
      if (!canWriteObservation || !selectedStudentId) {
        setObservations([])
        return
      }
      try {
        const overview = await api<{ observations: TeacherObservation[] }>(
          `/api/teacher/students/${selectedStudentId}/learning-overview`,
        )
        setObservations(overview.observations)
      } catch (cause) {
        setObservations([])
        showToast(
          cause instanceof Error
            ? cause.message
            : 'Không tải được bản nháp nhận xét.',
          'error',
        )
      }
    },
    [canWriteObservation, showToast],
  )

  useEffect(() => {
    setEditingObservation(null)
    setBody('')
    setStrengths('')
    setDevelopment('')
    setScorePercent('')
    setObservationStatus('draft')
    void loadObservations(studentId)
  }, [loadObservations, studentId])

  function editObservation(observation: TeacherObservation) {
    setEditingObservation(observation)
    setStudentId(observation.studentId)
    setObservationCourseId(observation.courseId ?? '')
    setBody(observation.body)
    setStrengths(observation.strengthsJson.join('\n'))
    setDevelopment(observation.developmentJson.join('\n'))
    setScorePercent(observation.scorePercent ?? '')
    setObservationStatus(observation.status)
  }

  function resetObservationForm() {
    setEditingObservation(null)
    setBody('')
    setStrengths('')
    setDevelopment('')
    setScorePercent('')
    setObservationStatus('draft')
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    try {
      const observationDetails = {
        body,
        strengths: splitValues(strengths),
        development: splitValues(development),
        scorePercent: scorePercent === '' ? null : scorePercent,
        status: observationStatus,
      }
      await api(
        editingObservation
          ? `/api/teacher/observations/${editingObservation.id}`
          : '/api/teacher/observations',
        {
          method: editingObservation ? 'PATCH' : 'POST',
          body: JSON.stringify(
            editingObservation
              ? {
                  version: editingObservation.version,
                  ...observationDetails,
                }
              : {
                  studentId,
                  courseId: observationCourseId || null,
                  ...observationDetails,
                },
          ),
        },
      )
      resetObservationForm()
      await loadObservations(studentId)
      showToast(
        observationStatus === 'published'
          ? 'Đã công bố nhận xét và cập nhật bằng chứng năng lực.'
          : 'Đã lưu bản nháp nhận xét.',
        'success',
      )
      onDone()
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'Không lưu được nhận xét.', 'error')
    } finally {
      setBusy(false)
    }
  }
  async function saveOverride(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    try {
      await api('/api/learning/pathway/overrides', {
        method: 'POST',
        body: JSON.stringify({
          ...override,
          expiresAt: override.expiresAt
            ? new Date(override.expiresAt).toISOString()
            : null,
        }),
      })
      setOverride({ ...override, reason: '' })
      showToast('Đã cập nhật ngoại lệ lộ trình và lưu audit.', 'success')
      onDone()
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'Không cập nhật được lộ trình.', 'error')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
      <section className="space-y-4">
        {data.alerts.configurationRequired && (
          <div className="rounded-2xl bg-sun-50 p-4 text-sm text-warning">
            Chưa cấu hình ngưỡng “chậm tiến độ / không hoạt động”, nên hệ thống không
            tự gắn nhãn trẻ. Cần khách hàng phê duyệt ngưỡng trước.
          </div>
        )}
        {data.classes.length === 0 ? (
          <EmptyState
            title="Chưa có lớp phụ trách"
            description="Lớp đã xếp cho giáo viên sẽ xuất hiện tại đây."
          />
        ) : (
          data.classes.map((classroom) => (
            <article key={classroom.id} className="ui-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase text-sky-600">{classroom.code}</p>
                  <h2 className="font-display text-xl">{classroom.name}</h2>
                  <p className="text-sm text-muted">
                    {classroom.course?.title ?? 'Chưa gắn khóa học'} ·{' '}
                    {classroom.learners.length}/{classroom.capacity} học viên
                  </p>
                </div>
                {classroom.nextSession && (
                  <div className="rounded-2xl bg-sky-50 px-3 py-2 text-sm">
                    <p className="font-bold">{classroom.nextSession.title}</p>
                    <p className="text-xs text-muted">
                      {formatDate(classroom.nextSession.startsAt)}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {classroom.learners.map((learner) => (
                  <div key={learner.id} className="rounded-2xl border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold">{learner.nickname ?? 'Học viên'}</p>
                      <span className="text-xs text-muted">{learner.ageBand}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {learner.completedLessons} bài hoàn thành
                    </p>
                    {learner.latestObservation && (
                      <p className="mt-2 line-clamp-2 text-sm">
                        {learner.latestObservation.body}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </article>
          ))
        )}
      </section>
      <div className="space-y-5">
        {canWriteObservation ? (
          <>
            {observations.some(
              (observation) => observation.status === 'draft',
            ) && (
              <section className="ui-card p-5">
                <h2 className="font-display text-xl">Bản nháp nhận xét</h2>
                <p className="mt-1 text-sm text-muted">
                  Tiếp tục hoàn thiện trước khi gửi cho gia đình.
                </p>
                <div className="mt-3 space-y-2">
                  {observations
                    .filter((observation) => observation.status === 'draft')
                    .map((observation) => (
                      <article
                        key={observation.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sky-50 p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm">
                            {observation.body}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            Cập nhật {formatDate(observation.updatedAt)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => editObservation(observation)}
                        >
                          Tiếp tục bản nháp
                        </Button>
                      </article>
                    ))}
                </div>
              </section>
            )}
            <form
              className="ui-card grid content-start gap-3 p-5"
              onSubmit={(event) => void submit(event)}
            >
        <div className="flex items-center gap-2">
          <MessageSquareText className="text-sky-500" aria-hidden="true" />
          <h2 className="font-display text-xl">
            {editingObservation ? 'Tiếp tục bản nháp' : 'Nhận xét mới'}
          </h2>
        </div>
        <label className="grid gap-1 text-sm font-bold">
          Học viên
          <select
            required
            disabled={editingObservation !== null}
            className="min-h-11 rounded-xl border-2 border-border bg-white px-3"
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
          >
            {learners.map((learner) => (
              <option key={learner.id} value={learner.id}>
                {learner.nickname ?? 'Học viên'}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Khóa học liên quan
          <select
            required
            disabled={editingObservation !== null}
            className="field-input"
            value={observationCourseId}
            onChange={(event) =>
              setObservationCourseId(event.target.value)
            }
          >
            <option value="">Chọn khóa học</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Nhận xét gửi gia đình
          <textarea
            required
            minLength={2}
            maxLength={3_000}
            className="min-h-28 rounded-xl border-2 border-border p-3"
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Điểm mạnh (mỗi dòng một ý)
          <textarea
            className="min-h-20 rounded-xl border-2 border-border p-3"
            value={strengths}
            onChange={(event) => setStrengths(event.target.value)}
          />
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Nội dung cần phát triển
          <textarea
            className="min-h-20 rounded-xl border-2 border-border p-3"
            value={development}
            onChange={(event) => setDevelopment(event.target.value)}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-bold">
            Điểm theo rubric đã duyệt
            <input
              type="number"
              min={0}
              max={100}
              className="field-input"
              value={scorePercent}
              onChange={(event) =>
                setScorePercent(
                  event.target.value === ''
                    ? ''
                    : Number(event.target.value),
                )
              }
            />
          </label>
          <label className="grid gap-1 text-sm font-bold">
            Trạng thái
            <select
              className="field-input"
              value={observationStatus}
              onChange={(event) =>
                setObservationStatus(
                  event.target.value as 'draft' | 'published',
                )
              }
            >
              <option value="draft">Lưu bản nháp</option>
              <option value="published">Công bố</option>
            </select>
          </label>
        </div>
        <Button
          type="submit"
          disabled={
            busy ||
            !studentId ||
            !observationCourseId ||
            (observationStatus === 'published' && scorePercent === '')
          }
        >
          {busy
            ? 'Đang lưu…'
            : observationStatus === 'published'
              ? 'Công bố nhận xét'
              : 'Lưu bản nháp'}
        </Button>
        {editingObservation && (
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={resetObservationForm}
          >
            Hủy chỉnh sửa
          </Button>
        )}
            </form>
          </>
        ) : (
          <section className="ui-card p-5">
            <h2 className="font-display text-xl">Nhận xét của giáo viên</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Quản trị viên có thể theo dõi vận hành tại đây. Việc soạn và công
              bố nhận xét thuộc giáo viên trực tiếp phụ trách học viên.
            </p>
          </section>
        )}
        <form
          className="ui-card grid content-start gap-3 p-5"
          onSubmit={(event) => void saveOverride(event)}
        >
        <div>
          <h2 className="font-display text-xl">Ngoại lệ lộ trình</h2>
          <p className="text-sm text-muted">
            Mở hoặc khóa thủ công có lý do và thời hạn; mọi thay đổi được lưu audit.
          </p>
        </div>
        <label className="grid gap-1 text-sm font-bold">
          Học viên
          <select
            required
            className="field-input"
            value={override.studentId}
            onChange={(event) => setOverride({ ...override, studentId: event.target.value })}
          >
            {learners.map((learner) => (
              <option key={learner.id} value={learner.id}>
                {learner.nickname ?? 'Học viên'}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Khóa học
          <select
            required
            className="field-input"
            value={override.courseId}
            onChange={(event) => setOverride({ ...override, courseId: event.target.value })}
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-bold">
            Quyết định
            <select
              className="field-input"
              value={override.allowed ? 'allow' : 'deny'}
              onChange={(event) =>
                setOverride({ ...override, allowed: event.target.value === 'allow' })
              }
            >
              <option value="allow">Mở thủ công</option>
              <option value="deny">Khóa thủ công</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold">
            Hết hạn
            <input
              type="datetime-local"
              className="field-input"
              value={override.expiresAt}
              onChange={(event) => setOverride({ ...override, expiresAt: event.target.value })}
            />
          </label>
        </div>
        <label className="grid gap-1 text-sm font-bold">
          Lý do
          <input
            required
            minLength={5}
            maxLength={500}
            className="field-input"
            value={override.reason}
            onChange={(event) => setOverride({ ...override, reason: event.target.value })}
          />
        </label>
        <Button
          type="submit"
          disabled={busy || !override.studentId || !override.courseId}
        >
          Lưu ngoại lệ
        </Button>
        </form>
      </div>
    </div>
  )
}

function GradingSection({
  reviews,
  onDone,
  showToast,
}: {
  reviews: Review[]
  onDone: () => void
  showToast: (message: string, kind: 'success' | 'error') => void
}) {
  const [forms, setForms] = useState<
    Record<string, { scores: Record<string, number>; feedback: string }>
  >({})
  const [busy, setBusy] = useState<string | null>(null)
  const [resubmitReasons, setResubmitReasons] = useState<Record<string, string>>({})
  const [publishReasons, setPublishReasons] = useState<Record<string, string>>({})
  function form(review: Review) {
    return (
      forms[review.id] ?? {
        scores: review.rubricScores ?? {},
        feedback: review.feedback ?? '',
      }
    )
  }
  async function save(review: Review) {
    setBusy(review.id)
    try {
      const current = form(review)
      await api(`/api/teacher/grading/reviews/${review.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          version: review.version,
          rubricScores: current.scores,
          feedback: current.feedback,
        }),
      })
      showToast('Đã lưu phiếu chấm.', 'success')
      onDone()
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'Không lưu được phiếu chấm.', 'error')
    } finally {
      setBusy(null)
    }
  }
  async function publish(attemptId: string) {
    const reason = publishReasons[attemptId]?.trim() ?? ''
    if (reason.length < 5) {
      showToast('Hãy nhập lý do công bố ít nhất 5 ký tự.', 'error')
      return
    }
    setBusy(attemptId)
    try {
      await api(`/api/teacher/grading/attempts/${attemptId}/publish`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })
      showToast('Đã công bố kết quả cho học viên và phụ huynh.', 'success')
      onDone()
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'Chưa thể công bố.', 'error')
    } finally {
      setBusy(null)
    }
  }
  async function requestResubmission(attemptId: string) {
    const reason = resubmitReasons[attemptId]?.trim() ?? ''
    if (reason.length < 5) {
      showToast('Hãy nhập lý do nộp lại ít nhất 5 ký tự.', 'error')
      return
    }
    setBusy(attemptId)
    try {
      await api(`/api/teacher/grading/attempts/${attemptId}/request-resubmission`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })
      showToast('Đã trả bài và mở lượt nộp lại theo chính sách đề.', 'success')
      onDone()
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'Không thể yêu cầu nộp lại.', 'error')
    } finally {
      setBusy(null)
    }
  }
  const grouped = [...new Set(reviews.map((review) => review.attemptId))]
  if (reviews.length === 0) {
    return (
      <EmptyState
        title="Không có bài chờ chấm"
        description="Câu tự luận và sản phẩm cần rubric sẽ xuất hiện tại đây."
      />
    )
  }
  return (
    <div className="space-y-5">
      {grouped.map((attemptId) => {
        const rows = reviews.filter((review) => review.attemptId === attemptId)
        const ready = rows.every((review) => review.status === 'reviewed')
        const first = rows[0]
        const canResubmit = Boolean(
          first && first.attemptNumber < first.maxAttempts,
        )
        return (
          <section key={attemptId} className="ui-card p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-sky-600">
                  {rows[0]?.student.nickname ?? 'Học viên'}
                </p>
                <h2 className="font-display text-xl">{rows[0]?.assessment.title}</h2>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <label className="grid min-w-64 gap-1 text-sm font-bold">
                  Lý do công bố
                  <input
                    minLength={5}
                    maxLength={500}
                    className="field-input"
                    value={publishReasons[attemptId] ?? ''}
                    onChange={(event) =>
                      setPublishReasons({
                        ...publishReasons,
                        [attemptId]: event.target.value,
                      })
                    }
                  />
                </label>
                <Button
                  className="self-end"
                  disabled={
                    !ready ||
                    busy === attemptId ||
                    (publishReasons[attemptId]?.trim().length ?? 0) < 5
                  }
                  onClick={() => void publish(attemptId)}
                >
                  {busy === attemptId ? 'Đang xử lý…' : 'Công bố kết quả'}
                </Button>
              </div>
            </div>
            {canResubmit && (
              <div className="mb-4 grid gap-2 rounded-2xl border border-sun-200 bg-sun-50 p-3 sm:grid-cols-[1fr_auto]">
                <label className="grid gap-1 text-sm font-bold">
                  Lý do yêu cầu nộp lại (lượt {first!.attemptNumber}/{first!.maxAttempts})
                  <input
                    minLength={5}
                    maxLength={2_000}
                    className="field-input bg-white"
                    value={resubmitReasons[attemptId] ?? ''}
                    onChange={(event) =>
                      setResubmitReasons({
                        ...resubmitReasons,
                        [attemptId]: event.target.value,
                      })
                    }
                  />
                </label>
                <Button
                  variant="secondary"
                  className="self-end"
                  disabled={
                    busy === attemptId ||
                    (resubmitReasons[attemptId]?.trim().length ?? 0) < 5
                  }
                  onClick={() => void requestResubmission(attemptId)}
                >
                  Yêu cầu nộp lại
                </Button>
              </div>
            )}
            <div className="space-y-4">
              {rows.map((review, index) => {
                const current = form(review)
                const criteria = review.question.rubric.criteria ?? []
                const responseSummary = reviewResponseSummary({
                  questionType: review.question.type,
                  response: review.response,
                  artifact: review.artifact,
                })
                return (
                  <article key={review.id} className="rounded-2xl bg-sky-50/60 p-4">
                    <p className="text-xs font-bold text-muted">Nội dung {index + 1}</p>
                    <h3 className="mt-1 font-bold">
                      {review.question.prompt.stem ?? 'Sản phẩm học tập'}
                    </h3>
                    <div className="mt-2 rounded-xl bg-white p-3">
                      <p className="text-xs font-bold text-muted">
                        {responseSummary.label}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                        {responseSummary.value}
                      </p>
                      {responseSummary.detail && (
                        <p className="mt-1 text-xs text-muted">
                          {responseSummary.detail}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {criteria.map((criterion) => (
                        <label key={criterion.id} className="grid gap-1 text-sm font-bold">
                          {criterion.label} / {criterion.maxPoints}
                          <input
                            type="number"
                            min={0}
                            max={criterion.maxPoints}
                            step="0.5"
                            disabled={review.status === 'published'}
                            className="min-h-11 rounded-xl border-2 border-border bg-white px-3"
                            value={current.scores[criterion.id] ?? ''}
                            onChange={(event) =>
                              setForms({
                                ...forms,
                                [review.id]: {
                                  ...current,
                                  scores: {
                                    ...current.scores,
                                    [criterion.id]: Number(event.target.value),
                                  },
                                },
                              })
                            }
                          />
                        </label>
                      ))}
                    </div>
                    <label className="mt-3 grid gap-1 text-sm font-bold">
                      Phản hồi cho học viên
                      <textarea
                        minLength={2}
                        maxLength={2_000}
                        disabled={review.status === 'published'}
                        className="min-h-24 rounded-xl border-2 border-border bg-white p-3"
                        value={current.feedback}
                        onChange={(event) =>
                          setForms({
                            ...forms,
                            [review.id]: { ...current, feedback: event.target.value },
                          })
                        }
                      />
                    </label>
                    {review.status !== 'published' && (
                      <div className="mt-3 flex justify-end">
                        <Button
                          variant="secondary"
                          disabled={busy === review.id}
                          onClick={() => void save(review)}
                        >
                          {busy === review.id ? 'Đang lưu…' : 'Lưu phiếu chấm'}
                        </Button>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function AttendanceSection({
  classes,
  onDone,
  showToast,
}: {
  classes: ScheduleClass[]
  onDone: () => void
  showToast: (message: string, kind: 'success' | 'error') => void
}) {
  const sessions = classes
    .flatMap((classroom) =>
      classroom.sessions.map((session) => ({ ...session, className: classroom.name })),
    )
    .sort(
      (left, right) =>
        new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime(),
    )
  const [sessionId, setSessionId] = useState(sessions[0]?.id ?? '')
  const [attendance, setAttendance] = useState<AttendanceData | null>(null)
  const [records, setRecords] = useState<Record<string, AttendanceRecord>>({})
  const [reason, setReason] = useState('Giáo viên cập nhật điểm danh buổi học.')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (!sessionId) return
    setBusy(true)
    void api<AttendanceData>(`/api/schedule/sessions/${sessionId}/attendance`)
      .then((response) => {
        setAttendance(response)
        const existing = new Map(
          response.session.attendance.map((row) => [row.studentId, row]),
        )
        setRecords(
          Object.fromEntries(
            response.students.map((student) => [
              student.id,
              existing.get(student.id) ?? {
                studentId: student.id,
                status: 'present',
                note: null,
                version: 1,
              },
            ]),
          ),
        )
      })
      .catch((cause) =>
        showToast(cause instanceof Error ? cause.message : 'Không tải được điểm danh.', 'error'),
      )
      .finally(() => setBusy(false))
  }, [sessionId, showToast])
  async function save(finalize: boolean) {
    if (!sessionId) return
    setBusy(true)
    try {
      await api(`/api/schedule/sessions/${sessionId}/attendance`, {
        method: 'PUT',
        body: JSON.stringify({
          reason,
          finalize,
          records: Object.values(records).map((row) => ({
            studentId: row.studentId,
            status: row.status,
            note: row.note,
            version: attendance?.session.attendance.some(
              (existing) => existing.studentId === row.studentId,
            )
              ? row.version
              : null,
          })),
        }),
      })
      showToast(finalize ? 'Đã chốt điểm danh.' : 'Đã lưu điểm danh.', 'success')
      onDone()
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'Không lưu được điểm danh.', 'error')
    } finally {
      setBusy(false)
    }
  }
  if (sessions.length === 0) {
    return (
      <EmptyState
        title="Chưa có buổi học"
        description="Hãy tạo lịch buổi học trước khi điểm danh."
      />
    )
  }
  return (
    <section className="ui-card p-5">
      <label className="grid gap-1 text-sm font-bold">
        Chọn buổi học
        <select
          className="min-h-11 rounded-xl border-2 border-border bg-white px-3"
          value={sessionId}
          onChange={(event) => setSessionId(event.target.value)}
        >
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.className} · {session.title} · {formatDate(session.startsAt)}
            </option>
          ))}
        </select>
      </label>
      {busy && !attendance ? (
        <PageSkeleton rows={2} className="mt-4" />
      ) : attendance ? (
        <>
          <div className="mt-4 space-y-2">
            {attendance.students.map((student) => {
              const row = records[student.id]
              if (!row) return null
              return (
                <div
                  key={student.id}
                  className="grid gap-2 rounded-2xl border border-border p-3 sm:grid-cols-[1fr_180px_1.3fr] sm:items-center"
                >
                  <p className="font-bold">{student.nickname ?? 'Học viên'}</p>
                  <select
                    aria-label={`Trạng thái điểm danh của ${student.nickname ?? 'học viên'}`}
                    className="min-h-11 rounded-xl border-2 border-border bg-white px-3"
                    value={row.status}
                    onChange={(event) =>
                      setRecords({
                        ...records,
                        [student.id]: {
                          ...row,
                          status: event.target.value as AttendanceStatus,
                        },
                      })
                    }
                  >
                    <option value="present">Có mặt</option>
                    <option value="late">Đi muộn</option>
                    <option value="excused">Vắng có phép</option>
                    <option value="absent">Vắng</option>
                  </select>
                  <input
                    aria-label={`Ghi chú điểm danh của ${student.nickname ?? 'học viên'}`}
                    className="min-h-11 rounded-xl border-2 border-border px-3"
                    value={row.note ?? ''}
                    onChange={(event) =>
                      setRecords({
                        ...records,
                        [student.id]: { ...row, note: event.target.value || null },
                      })
                    }
                    placeholder="Ghi chú (nếu có)"
                  />
                </div>
              )
            })}
          </div>
          <label className="mt-4 grid gap-1 text-sm font-bold">
            Lý do cập nhật
            <input
              required
              minLength={5}
              maxLength={500}
              className="min-h-11 rounded-xl border-2 border-border px-3"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </label>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Button variant="secondary" disabled={busy} onClick={() => void save(false)}>
              Lưu nháp
            </Button>
            <Button disabled={busy} onClick={() => void save(true)}>
              Chốt điểm danh
            </Button>
          </div>
        </>
      ) : null}
    </section>
  )
}

function ReportWorkflowSection({
  learners,
  policies,
  reports,
  onDone,
  showToast,
}: {
  learners: Learner[]
  policies: ReportPolicy[]
  reports: TeacherReport[]
  onDone: () => void
  showToast: (message: string, kind: 'success' | 'error') => void
}) {
  const [studentId, setStudentId] = useState(learners[0]?.id ?? '')
  const [policyId, setPolicyId] = useState(policies[0]?.id ?? '')
  const [busy, setBusy] = useState<string | null>(null)
  const [reasons, setReasons] = useState<Record<string, string>>({})
  async function generate() {
    setBusy('generate')
    try {
      await api('/api/reports/generate', {
        method: 'POST',
        body: JSON.stringify({ studentId, policyId }),
      })
      showToast('Đã tạo snapshot báo cáo để giáo viên kiểm tra.', 'success')
      onDone()
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'Không tạo được báo cáo.', 'error')
    } finally {
      setBusy(null)
    }
  }
  async function transition(
    report: TeacherReport,
    action: 'refresh' | 'submit-review' | 'approve' | 'publish',
  ) {
    const reason = reasons[report.id]?.trim() ?? ''
    if (reason.length < 5) {
      showToast('Hãy nhập lý do thao tác ít nhất 5 ký tự.', 'error')
      return
    }
    setBusy(report.id)
    try {
      await api(`/api/reports/${report.id}/${action}`, {
        method: 'POST',
        body: JSON.stringify({
          expectedVersion: report.version,
          reason,
        }),
      })
      setReasons({ ...reasons, [report.id]: '' })
      showToast(
        action === 'refresh'
          ? 'Đã làm mới snapshot từ dữ liệu hiện tại.'
          : action === 'publish'
          ? 'Đã phát hành PDF và tạo hàng đợi giao báo cáo.'
          : 'Đã cập nhật luồng duyệt báo cáo.',
        'success',
      )
      onDone()
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'Không cập nhật được báo cáo.', 'error')
    } finally {
      setBusy(null)
    }
  }
  if (policies.length === 0) {
    return (
      <EmptyState
        title="Chưa có chính sách báo cáo"
        description="Quản trị viên cần công bố template, kỳ báo cáo và kênh giao trước."
      />
    )
  }
  return (
    <div className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
      <section className="ui-card grid content-start gap-3 p-5">
        <h2 className="font-display text-xl">Tạo báo cáo theo kỳ</h2>
        <label className="grid gap-1 text-sm font-bold">
          Học viên
          <select
            className="min-h-11 rounded-xl border-2 border-border bg-white px-3"
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
          >
            {learners.map((learner) => (
              <option key={learner.id} value={learner.id}>
                {learner.nickname ?? 'Học viên'}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Chính sách đang công bố
          <select
            className="min-h-11 rounded-xl border-2 border-border bg-white px-3"
            value={policyId}
            onChange={(event) => setPolicyId(event.target.value)}
          >
            {policies.map((policy) => (
              <option key={policy.id} value={policy.id}>
                {policy.template.name} · {policy.periodDays} ngày
              </option>
            ))}
          </select>
        </label>
        <Button
          disabled={!studentId || !policyId || busy === 'generate'}
          onClick={() => void generate()}
        >
          {busy === 'generate' ? 'Đang tổng hợp…' : 'Tạo báo cáo'}
        </Button>
      </section>
      <section className="space-y-3">
        {reports.length === 0 ? (
          <EmptyState
            title="Chưa có báo cáo"
            description="Tạo báo cáo để bắt đầu quy trình kiểm tra và phát hành."
          />
        ) : (
          reports.map((report) => (
            <article key={report.id} className="ui-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase text-sky-600">
                    {report.student.nickname ?? 'Học viên'} · {report.status}
                  </p>
                  <h2 className="font-display text-lg">{report.template.name}</h2>
                  <p className="text-sm text-muted">
                    {formatDate(report.periodStart)} – {formatDate(report.periodEnd)}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-bold',
                    report.missingSections.length
                      ? 'bg-coral-100 text-danger'
                      : 'bg-mint-100 text-success',
                  )}
                >
                  {report.missingSections.length
                    ? `Thiếu ${report.missingSections.length} mục`
                    : 'Đủ mục bắt buộc'}
                </span>
              </div>
              {report.missingSections.length > 0 && (
                <p className="mt-2 text-sm text-danger">
                  {report.missingSections.join(', ')}
                </p>
              )}
              {report.status !== 'published' && (
                <label className="mt-3 grid gap-1 text-sm font-bold">
                  Lý do thao tác
                  <input
                    minLength={5}
                    maxLength={500}
                    className="field-input"
                    value={reasons[report.id] ?? ''}
                    onChange={(event) =>
                      setReasons({ ...reasons, [report.id]: event.target.value })
                    }
                  />
                </label>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {report.status === 'draft' && (
                  <>
                    <Button
                      variant="ghost"
                      disabled={
                        busy === report.id ||
                        (reasons[report.id]?.trim().length ?? 0) < 5
                      }
                      onClick={() => void transition(report, 'refresh')}
                    >
                      Làm mới dữ liệu
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={
                        busy === report.id ||
                        report.missingSections.length > 0 ||
                        (reasons[report.id]?.trim().length ?? 0) < 5
                      }
                      onClick={() => void transition(report, 'submit-review')}
                    >
                      Gửi duyệt
                    </Button>
                  </>
                )}
                {report.status === 'review' && (
                  <Button
                    variant="secondary"
                    disabled={
                      busy === report.id ||
                      (reasons[report.id]?.trim().length ?? 0) < 5
                    }
                    onClick={() => void transition(report, 'approve')}
                  >
                    Duyệt báo cáo
                  </Button>
                )}
                {report.status === 'approved' && (
                  <Button
                    disabled={
                      busy === report.id ||
                      (reasons[report.id]?.trim().length ?? 0) < 5
                    }
                    onClick={() => void transition(report, 'publish')}
                  >
                    Xuất PDF & phát hành
                  </Button>
                )}
                {report.deliveries.map((delivery) => (
                  <span
                    key={delivery.channel}
                    className="rounded-full bg-sky-50 px-2 py-1 text-xs font-bold text-muted"
                    title={delivery.lastError ?? undefined}
                  >
                    {delivery.channel}: {delivery.status}
                  </span>
                ))}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  )
}
