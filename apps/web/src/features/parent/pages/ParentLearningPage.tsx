import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  Award,
  CalendarDays,
  Download,
  FileText,
  MessageSquareText,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  UserRoundPlus,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { api, downloadAuthorizedBlob } from '@/shared/lib/api'
import { learningApi } from '@/shared/lib/learning-api'
import { cn } from '@/shared/lib/cn'
import type { AgeExperiencePolicy } from '@/shared/age-experience/AgeExperienceProvider'
import { ParentTeacherFeedbackSection } from '../components/ParentTeacherFeedbackSection'

type Child = {
  id: string
  nickname: string | null
  avatarId: string | null
  level: number
}
type Session = {
  id: string
  title: string
  startsAt: string
  endsAt: string
  meetingUrl: string | null
  status: string
  quest: { id: string; title: string } | null
}
type ScheduleClass = {
  id: string
  name: string
  classType: string
  teacher: { nickname: string | null }
  course: { title: string; shortTitle: string } | null
  sessions: Session[]
}
type Report = {
  id: string
  periodStart: string
  periodEnd: string
  status: string
  publishedAt: string | null
  pdfSha256: string | null
  template: { name: string; code: string; version: number }
  deliveries: Array<{
    channel: string
    status: string
    attempts: number
    lastError: string | null
    sentAt: string | null
  }>
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
type Course = { id: string; title: string; shortTitle: string; status: string }
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
type LearningData = {
  classes: ScheduleClass[]
  reports: Report[]
  competency: CompetencyMap
  credentials: Credential[]
  courses: Course[]
  placements: PlacementRequest[]
  pathway: Pathway
  ageExperience: {
    status: 'ready' | 'configuration_required'
    policy: AgeExperiencePolicy | null
  }
}
type Section = 'feedback' | 'journey' | 'schedule' | 'placement' | 'reports'

function dateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const levelLabels = {
  no_data: 'Chưa có dữ liệu',
  not_met: 'Cần thêm trải nghiệm',
  developing: 'Đang phát triển',
  achieved: 'Đã thể hiện tốt',
} as const

export function ParentLearningPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [studentId, setStudentId] = useState('')
  const [section, setSection] = useState<Section>('feedback')
  const [data, setData] = useState<LearningData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rescheduleSession, setRescheduleSession] = useState<Session | null>(null)
  const [reschedule, setReschedule] = useState({
    preferredStartsAt: '',
    preferredEndsAt: '',
    reason: '',
  })
  const [busy, setBusy] = useState(false)
  const [placementForm, setPlacementForm] = useState({
    courseId: '',
    requestedLevel: 1,
    availability: [
      { weekday: 1, start: '18:00', end: '19:00' },
    ],
  })
  const { toasts, showToast, dismissToast } = useToast()

  useEffect(() => {
    void api<{ children: Child[] }>('/api/parent/children')
      .then((response) => {
        setChildren(response.children)
        setStudentId((current) => current || response.children[0]?.id || '')
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : 'Không tải được danh sách con.'),
      )
  }, [])

  const load = useCallback(async () => {
    if (!studentId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const query = `studentId=${encodeURIComponent(studentId)}`
      const [
        schedule,
        reports,
        competency,
        credentials,
        courseResult,
        pendingPlacements,
        placedPlacements,
        rejectedPlacements,
        pathway,
        ageExperience,
      ] = await Promise.all([
        api<{ classes: ScheduleClass[] }>(`/api/schedule?${query}`),
        api<{ reports: Report[] }>(`/api/reports?${query}`),
        api<CompetencyMap>(`/api/competency-map?${query}`),
        api<{ credentials: Credential[] }>(`/api/credentials?${query}`),
        api<{ courses: Course[] }>('/api/courses'),
        api<{ requests: PlacementRequest[] }>(
          `/api/schedule/placement-requests?status=pending&${query}`,
        ),
        api<{ requests: PlacementRequest[] }>(
          `/api/schedule/placement-requests?status=placed&${query}`,
        ),
        api<{ requests: PlacementRequest[] }>(
          `/api/schedule/placement-requests?status=rejected&${query}`,
        ),
        learningApi.getPathway(studentId),
        api<{
          status: 'ready' | 'configuration_required'
          policy: AgeExperiencePolicy | null
        }>(`/api/learning/age-policy?${query}`),
      ])
      const placements = [
        ...pendingPlacements.requests,
        ...placedPlacements.requests,
        ...rejectedPlacements.requests,
      ].filter((request) => request.courseId && request)
      setData({
        classes: schedule.classes,
        reports: reports.reports,
        competency,
        credentials: credentials.credentials,
        courses: courseResult.courses,
        placements,
        pathway,
        ageExperience,
      })
      setPlacementForm((current) => ({
        ...current,
        courseId: current.courseId || courseResult.courses[0]?.id || '',
      }))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tải được hành trình học.')
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    void load()
  }, [load])

  const sessions = useMemo(
    () =>
      (data?.classes ?? [])
        .flatMap((classroom) =>
          classroom.sessions.map((session) => ({ ...session, classroom })),
        )
        .sort(
          (left, right) =>
            new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
        ),
    [data],
  )

  async function downloadReport(report: Report) {
    setBusy(true)
    try {
      const blob = await downloadAuthorizedBlob(`/api/reports/${report.id}/pdf`)
      const blobUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = blobUrl
      anchor.download = `bao-cao-hoc-tap-${report.id}.pdf`
      anchor.click()
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000)
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'Không tải được PDF.', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function downloadCredential(credential: Credential) {
    setBusy(true)
    try {
      const blob = await downloadAuthorizedBlob(
        `/api/credentials/${credential.id}/pdf`,
      )
      const blobUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = blobUrl
      anchor.download = `chung-nhan-${credential.id}.pdf`
      anchor.click()
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000)
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'Không tải được chứng nhận.', 'error')
    } finally {
      setBusy(false)
    }
  }

  function openReschedule(session: Session) {
    const duration = new Date(session.endsAt).getTime() - new Date(session.startsAt).getTime()
    const preferredStart = new Date(new Date(session.startsAt).getTime() + 24 * 60 * 60 * 1_000)
    const preferredEnd = new Date(preferredStart.getTime() + duration)
    const local = (value: Date) => {
      const offset = value.getTimezoneOffset() * 60_000
      return new Date(value.getTime() - offset).toISOString().slice(0, 16)
    }
    setRescheduleSession(session)
    setReschedule({
      preferredStartsAt: local(preferredStart),
      preferredEndsAt: local(preferredEnd),
      reason: '',
    })
  }

  async function submitReschedule(event: React.FormEvent) {
    event.preventDefault()
    if (!rescheduleSession || !studentId) return
    setBusy(true)
    try {
      await api('/api/schedule/reschedule-requests', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: rescheduleSession.id,
          studentId,
          preferredStartsAt: new Date(reschedule.preferredStartsAt).toISOString(),
          preferredEndsAt: new Date(reschedule.preferredEndsAt).toISOString(),
          reason: reschedule.reason,
        }),
      })
      setRescheduleSession(null)
      showToast('Đã gửi yêu cầu đổi lịch cho giáo viên.', 'success')
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'Không gửi được yêu cầu.', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function submitPlacement(event: React.FormEvent) {
    event.preventDefault()
    if (!studentId) return
    setBusy(true)
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const minutes = (value: string) => {
        const [hour, minute] = value.split(':').map(Number)
        return hour * 60 + minute
      }
      await api('/api/schedule/placement-requests', {
        method: 'POST',
        body: JSON.stringify({
          studentId,
          courseId: placementForm.courseId,
          requestedLevel: placementForm.requestedLevel,
          availability: placementForm.availability.map((slot) => ({
            weekday: slot.weekday,
            startMinutes: minutes(slot.start),
            endMinutes: minutes(slot.end),
            timezone,
          })),
        }),
      })
      showToast('Đã gửi yêu cầu xếp lớp.', 'success')
      await load()
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'Không gửi được yêu cầu.', 'error')
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
          <h1 className="font-display text-2xl sm:text-3xl">Hành trình học tập</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Lịch học, năng lực, chứng nhận và báo cáo được lấy trực tiếp từ dữ liệu
            học của con.
          </p>
        </div>
        {children.length > 0 && (
          <label className="grid min-w-52 gap-1 text-sm font-bold">
            Đang xem
            <select
              className="min-h-11 rounded-2xl border-2 border-border bg-white px-3"
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
            >
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.nickname ?? 'Học viên'}
                </option>
              ))}
            </select>
          </label>
        )}
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Nội dung hành trình">
        {(
            [
            ['feedback', 'Nhận xét giáo viên', MessageSquareText],
            ['journey', 'Năng lực & chứng nhận', Sparkles],
            ['schedule', 'Lịch học', CalendarDays],
            ['placement', 'Đăng ký xếp lớp', UserRoundPlus],
            ['reports', 'Báo cáo PDF', FileText],
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
          description="Ba / Mẹ hãy tạo hồ sơ cho con trước khi xem hành trình học."
        />
      ) : loading ? (
        <PageSkeleton rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
        ) : section === 'feedback' && studentId ? (
          <ParentTeacherFeedbackSection childId={studentId} />
        ) : data && section === 'journey' ? (
        <JourneySection
          competency={data.competency}
          credentials={data.credentials}
          pathway={data.pathway}
          ageExperience={data.ageExperience}
          busy={busy}
          onDownload={downloadCredential}
        />
      ) : data && section === 'schedule' ? (
        <ScheduleSection
          sessions={sessions}
          canRequestReschedule={
            data.ageExperience.policy?.permissionPolicy
              .canRequestReschedule === true
          }
          onReschedule={openReschedule}
        />
      ) : data && section === 'placement' ? (
        <PlacementSection
          courses={data.courses}
          placements={data.placements}
          form={placementForm}
          busy={busy}
          onChange={setPlacementForm}
          onSubmit={submitPlacement}
        />
      ) : data ? (
        <ReportsSection reports={data.reports} busy={busy} onDownload={downloadReport} />
      ) : null}

      {rescheduleSession && (
        <form className="ui-card grid gap-4 p-5" onSubmit={(event) => void submitReschedule(event)}>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
              Yêu cầu đổi lịch
            </p>
            <h2 className="font-display text-xl">{rescheduleSession.title}</h2>
            <p className="text-sm text-muted">Lịch hiện tại: {dateTime(rescheduleSession.startsAt)}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-bold">
              Bắt đầu mong muốn
              <input
                type="datetime-local"
                required
                className="min-h-11 rounded-xl border-2 border-border px-3"
                value={reschedule.preferredStartsAt}
                onChange={(event) =>
                  setReschedule({ ...reschedule, preferredStartsAt: event.target.value })
                }
              />
            </label>
            <label className="grid gap-1 text-sm font-bold">
              Kết thúc mong muốn
              <input
                type="datetime-local"
                required
                className="min-h-11 rounded-xl border-2 border-border px-3"
                value={reschedule.preferredEndsAt}
                onChange={(event) =>
                  setReschedule({ ...reschedule, preferredEndsAt: event.target.value })
                }
              />
            </label>
          </div>
          <label className="grid gap-1 text-sm font-bold">
            Lý do
            <textarea
              required
              minLength={5}
              maxLength={1_000}
              className="min-h-24 rounded-xl border-2 border-border p-3"
              value={reschedule.reason}
              onChange={(event) => setReschedule({ ...reschedule, reason: event.target.value })}
              placeholder="Ví dụ: Con có lịch khám trùng giờ…"
            />
          </label>
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setRescheduleSession(null)}>
              Hủy
            </Button>
            <Button type="submit" disabled={busy}>
              <RefreshCcw size={17} aria-hidden="true" />
              {busy ? 'Đang gửi…' : 'Gửi yêu cầu'}
            </Button>
          </div>
        </form>
      )}
    </div>
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

function JourneySection({
  competency,
  credentials,
  pathway,
  ageExperience,
  busy,
  onDownload,
}: {
  competency: CompetencyMap
  credentials: Credential[]
  pathway: Pathway
  ageExperience: LearningData['ageExperience']
  busy: boolean
  onDownload: (credential: Credential) => void
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
      <section className="ui-card p-5 lg:col-span-2">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
            Lộ trình cá nhân
          </p>
          <h2 className="font-display text-xl">Khóa đang học và bước tiếp theo</h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {pathway.courses.map((course) => (
            <article
              key={course.id}
              className={cn(
                'rounded-2xl border p-4',
                course.id === pathway.recommendedCourseId
                  ? 'border-brand-300 bg-brand-50'
                  : 'border-border bg-page',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold">{course.title}</h3>
                {course.id === pathway.recommendedCourseId && (
                  <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">
                    Nên học tiếp
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted">
                {course.status === 'completed'
                  ? 'Đã hoàn thành'
                  : course.status === 'active'
                    ? 'Đang học'
                    : course.status === 'available'
                      ? 'Đã mở'
                      : 'Đang khóa'}
                {' · '}
                {course.completionPercent}%
              </p>
              {course.status === 'locked' && course.missingPrerequisites.length > 0 && (
                <p className="mt-1 text-xs text-warning">
                  Cần hoàn thành: {course.missingPrerequisites.join(', ')}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
      <section className="ui-card p-5">
        <div className="mb-4 flex items-start gap-3">
          <ShieldCheck className="text-brand-500" aria-hidden="true" />
          <div>
            <h2 className="font-display text-xl">Bản đồ năng lực</h2>
            <p className="text-sm text-muted">
              “Chưa có dữ liệu” được giữ riêng, không quy đổi thành điểm 0.
            </p>
          </div>
        </div>
        {competency.status === 'configuration_required' ? (
          <div className="rounded-2xl bg-sun-50 p-4 text-sm text-warning">
            Nhà trường chưa công bố khung năng lực và ánh xạ bằng chứng. Hệ thống
            không tự đặt tên miền năng lực thay khách hàng.
          </div>
        ) : (
          <div className="space-y-4">
            {competency.frameworks.map((framework) => (
              <article key={framework.id}>
                <h3 className="font-bold">{framework.name}</h3>
                <div className="mt-3 space-y-3">
                  {framework.domains.map((domain) => (
                    <div key={domain.id} className="rounded-2xl bg-brand-50/60 p-3">
                      <p className="font-bold text-brand-700">{domain.name}</p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {domain.skills.map((skill) => (
                          <div key={skill.id} className="rounded-xl bg-white p-3">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold">
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
                                {ageExperience.policy?.copyPolicy
                                  .competencyLevelLabels[
                                  skill.result.level
                                ] ?? levelLabels[skill.result.level]}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-muted">
                              {skill.result.evidenceCount} bằng chứng
                              {skill.result.scorePercent === null
                                ? ''
                                : ` · ${skill.result.scorePercent}%`}
                            </p>
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
                        <Download size={16} /> Tải PDF
                      </Button>
                    )}
                  {credential.template.layoutJson.allowShare &&
                    ageExperience.policy?.permissionPolicy
                      .canShareCredentials && (
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

function ScheduleSection({
  sessions,
  canRequestReschedule,
  onReschedule,
}: {
  sessions: Array<Session & { classroom: ScheduleClass }>
  canRequestReschedule: boolean
  onReschedule: (session: Session) => void
}) {
  if (sessions.length === 0) {
    return (
      <EmptyState
        title="Chưa có lịch học"
        description="Lịch sẽ xuất hiện sau khi con được xếp lớp hoặc thêm vào buổi học."
      />
    )
  }
  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <article key={session.id} className="ui-card flex flex-wrap items-center gap-4 p-4">
          <div className="flex min-w-24 flex-col items-center rounded-2xl bg-sky-50 p-3 text-center">
            <span className="text-xs font-bold uppercase text-sky-600">
              {new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(
                new Date(session.startsAt),
              )}
            </span>
            <span className="font-display text-2xl">
              {new Intl.DateTimeFormat('vi-VN', { day: '2-digit' }).format(
                new Date(session.startsAt),
              )}
            </span>
            <span className="text-xs text-muted">
              {new Intl.DateTimeFormat('vi-VN', { month: '2-digit' }).format(
                new Date(session.startsAt),
              )}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              {session.classroom.course?.shortTitle ?? session.classroom.name}
            </p>
            <h2 className="font-display text-lg">{session.title}</h2>
            <p className="text-sm text-muted">
              {dateTime(session.startsAt)} · {session.classroom.teacher.nickname ?? 'Giáo viên'}
            </p>
            {session.meetingUrl && (
              <a
                className="mt-1 inline-block text-sm font-bold text-brand-600 underline"
                href={session.meetingUrl}
                target="_blank"
                rel="noreferrer"
              >
                Vào lớp trực tuyến
              </a>
            )}
          </div>
          {canRequestReschedule &&
            new Date(session.startsAt).getTime() > Date.now() && (
            <Button variant="secondary" onClick={() => onReschedule(session)}>
              <RefreshCcw size={17} aria-hidden="true" />
              Xin đổi lịch
            </Button>
          )}
        </article>
      ))}
    </div>
  )
}

function ReportsSection({
  reports,
  busy,
  onDownload,
}: {
  reports: Report[]
  busy: boolean
  onDownload: (report: Report) => void
}) {
  if (reports.length === 0) {
    return (
      <EmptyState
        title="Chưa có báo cáo đã công bố"
        description="Phụ huynh chỉ thấy báo cáo sau khi giáo viên duyệt và công bố."
      />
    )
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {reports.map((report) => (
        <article key={report.id} className="ui-card p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-500">
            {report.template.name}
          </p>
          <h2 className="mt-1 font-display text-xl">
            {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(
              new Date(report.periodStart),
            )}{' '}
            –{' '}
            {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(
              new Date(report.periodEnd),
            )}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {report.deliveries.map((delivery) => (
              <span
                key={delivery.channel}
                className={cn(
                  'rounded-full px-2 py-1 text-xs font-bold',
                  delivery.status === 'sent'
                    ? 'bg-mint-100 text-success'
                    : delivery.status === 'failed'
                      ? 'bg-coral-100 text-danger'
                      : 'bg-sky-100 text-muted',
                )}
                title={delivery.lastError ?? undefined}
              >
                {delivery.channel}: {delivery.status}
              </span>
            ))}
          </div>
          <Button
            className="mt-4 w-full"
            disabled={busy || !report.pdfSha256}
            onClick={() => onDownload(report)}
          >
            <Download size={18} aria-hidden="true" />
            Tải báo cáo PDF
          </Button>
        </article>
      ))}
    </div>
  )
}
