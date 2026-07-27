import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarPlus, Check, Clock3, UserRoundPlus, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { api } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { cn } from '@/shared/lib/cn'
import { buildLessonPlan } from '../lib/scheduling'

type Section = 'classes' | 'placements' | 'reschedules'
type Course = { id: string; title: string }
type Teacher = { id: string; nickname: string | null; email: string | null }
type Session = {
  id: string
  title: string
  startsAt: string
  endsAt: string
  status: string
}
type Classroom = {
  id: string
  name: string
  code: string
  courseId: string | null
  classType: 'one_to_one' | 'group'
  capacity: number
  status: string
  course: Course | null
  sessions: Session[]
}
type Placement = {
  id: string
  courseId: string
  requestedLevel: number
  availabilityJson: Array<{
    weekday: number
    startMinutes: number
    endMinutes: number
    timezone: string
  }>
  student: { id: string; nickname: string | null; ageBand: string; level: number }
  course: Course
}
type Reschedule = {
  id: string
  preferredStartsAt: string
  preferredEndsAt: string
  reason: string
  student: { id: string; nickname: string | null }
  session: Session & {
    classroom: {
      id: string
      name: string
      classType: 'one_to_one' | 'group'
      courseId: string | null
    }
  }
}

function localDateTime(value: Date) {
  const offset = value.getTimezoneOffset() * 60_000
  return new Date(value.getTime() - offset).toISOString().slice(0, 16)
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function initialClass() {
  return {
    name: '',
    code: '',
    teacherId: '',
    courseId: '',
    classType: 'group' as 'one_to_one' | 'group',
    allowedAgeBands: [] as string[],
    minLevel: 1,
    maxLevel: 100,
    capacity: 1,
    location: '',
    meetingUrl: '',
    status: 'draft' as 'draft' | 'open',
  }
}

function initialSession() {
  const startsAt = new Date(Date.now() + 24 * 60 * 60 * 1_000)
  startsAt.setMinutes(0, 0, 0)
  const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1_000)
  return {
    classId: '',
    title: '',
    startsAt: localDateTime(startsAt),
    endsAt: localDateTime(endsAt),
    location: '',
    meetingUrl: '',
    lessonPlan: {
      goal: '',
      activities: '',
      materials: '',
      notes: '',
    },
  }
}

export function SchedulingPage() {
  const [section, setSection] = useState<Section>('classes')
  const [classes, setClasses] = useState<Classroom[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [placements, setPlacements] = useState<Placement[]>([])
  const [reschedules, setReschedules] = useState<Reschedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refresh, setRefresh] = useState(0)
  const role = useAuth((state) => state.user?.role)
  const { toasts, showToast, dismissToast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const teacherRequest =
        role === 'admin'
          ? api<{ users: Teacher[] }>('/api/admin/users?role=teacher')
          : Promise.resolve({ users: [] as Teacher[] })
      const [schedule, courseResult, placementResult, rescheduleResult, teacherResult] =
        await Promise.all([
          api<{ classes: Classroom[] }>('/api/schedule'),
          api<{ courses: Course[] }>('/api/teacher/lectures'),
          api<{ requests: Placement[] }>('/api/schedule/placement-requests?status=pending'),
          api<{ requests: Reschedule[] }>('/api/schedule/reschedule-requests?status=pending'),
          teacherRequest,
        ])
      setClasses(schedule.classes)
      setCourses(courseResult.courses)
      setPlacements(placementResult.requests)
      setReschedules(rescheduleResult.requests)
      setTeachers(teacherResult.users)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tải được dữ liệu lịch học.')
    } finally {
      setLoading(false)
    }
  }, [role])

  useEffect(() => {
    void load()
  }, [load, refresh])

  const sessions = useMemo(
    () =>
      classes
        .flatMap((classroom) =>
          classroom.sessions.map((session) => ({ ...session, classroom })),
        )
        .sort(
          (left, right) =>
            new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
        ),
    [classes],
  )

  if (loading) return <PageSkeleton rows={6} />
  if (error) return <ErrorState message={error} onRetry={() => setRefresh((key) => key + 1)} />

  const done = (message: string) => {
    showToast(message, 'success')
    setRefresh((key) => key + 1)
  }

  return (
    <div className="flex flex-col gap-5">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <header className="ui-card p-5 sm:p-6">
        <p className="text-xs font-extrabold uppercase tracking-widest text-sky-600">
          Xếp lớp & lịch học
        </p>
        <h1 className="font-display text-2xl sm:text-3xl">Điều phối lớp học</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Tạo lớp theo chính sách đã công bố, kiểm tra trùng lịch, xử lý xếp lớp và
          đổi lịch có lưu vết.
        </p>
      </header>

      <div className="flex gap-2 overflow-x-auto" role="tablist">
        {(
          [
            ['classes', 'Lớp & buổi học', CalendarPlus, classes.length],
            ['placements', 'Yêu cầu xếp lớp', UserRoundPlus, placements.length],
            ['reschedules', 'Yêu cầu đổi lịch', Clock3, reschedules.length],
          ] as const
        ).map(([key, label, Icon, count]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={section === key}
            className={cn(
              'flex min-h-11 shrink-0 items-center gap-2 rounded-2xl px-4 text-sm font-extrabold',
              section === key ? 'bg-sky-500 text-white shadow-soft' : 'bg-white text-muted',
            )}
            onClick={() => setSection(key)}
          >
            <Icon size={17} /> {label}
            <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">{count}</span>
          </button>
        ))}
      </div>

      {section === 'classes' ? (
        <ClassAndSessionSection
          role={role}
          classes={classes}
          courses={courses}
          teachers={teachers}
          sessions={sessions}
          onDone={done}
          onError={(message) => showToast(message, 'error')}
        />
      ) : section === 'placements' ? (
        <PlacementSection
          rows={placements}
          classes={classes}
          onDone={done}
          onError={(message) => showToast(message, 'error')}
        />
      ) : (
        <RescheduleSection
          rows={reschedules}
          classes={classes}
          onDone={done}
          onError={(message) => showToast(message, 'error')}
        />
      )}
    </div>
  )
}

function ClassAndSessionSection({
  role,
  classes,
  courses,
  teachers,
  sessions,
  onDone,
  onError,
}: {
  role: string | undefined
  classes: Classroom[]
  courses: Course[]
  teachers: Teacher[]
  sessions: Array<Session & { classroom: Classroom }>
  onDone: (message: string) => void
  onError: (message: string) => void
}) {
  const [classForm, setClassForm] = useState(initialClass)
  const [sessionForm, setSessionForm] = useState(initialSession)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setClassForm((current) => ({
      ...current,
      courseId: current.courseId || courses[0]?.id || '',
      teacherId: current.teacherId || teachers[0]?.id || '',
    }))
  }, [courses, teachers])
  useEffect(() => {
    setSessionForm((current) => ({
      ...current,
      classId: current.classId || classes[0]?.id || '',
    }))
  }, [classes])

  async function createClass(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    try {
      await api('/api/schedule/classes', {
        method: 'POST',
        body: JSON.stringify({
          ...classForm,
          teacherId: role === 'admin' ? classForm.teacherId : undefined,
          location: classForm.location || null,
          meetingUrl: classForm.meetingUrl || null,
        }),
      })
      setClassForm({ ...initialClass(), courseId: courses[0]?.id ?? '', teacherId: teachers[0]?.id ?? '' })
      onDone('Đã tạo lớp học.')
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : 'Không tạo được lớp.')
    } finally {
      setBusy(false)
    }
  }

  async function createSession(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    try {
      await api(`/api/schedule/classes/${sessionForm.classId}/sessions`, {
        method: 'POST',
        body: JSON.stringify({
          title: sessionForm.title,
          startsAt: new Date(sessionForm.startsAt).toISOString(),
          endsAt: new Date(sessionForm.endsAt).toISOString(),
          location: sessionForm.location || null,
          meetingUrl: sessionForm.meetingUrl || null,
          lessonPlan: buildLessonPlan(sessionForm.lessonPlan),
        }),
      })
      setSessionForm({ ...initialSession(), classId: sessionForm.classId })
      onDone('Đã tạo buổi học và lịch nhắc theo chính sách.')
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : 'Không tạo được buổi học.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <form className="ui-card grid gap-4 p-5" onSubmit={(event) => void createClass(event)}>
        <div>
          <h2 className="font-display text-xl">Tạo lớp</h2>
          <p className="text-sm text-muted">
            Cần có chính sách lịch published đúng loại lớp trước khi tạo.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Tên lớp">
            <input required className="field-input" value={classForm.name} onChange={(event) => setClassForm({ ...classForm, name: event.target.value })} />
          </Field>
          <Field label="Mã lớp">
            <input required pattern="[A-Za-z0-9-]+" className="field-input" value={classForm.code} onChange={(event) => setClassForm({ ...classForm, code: event.target.value })} />
          </Field>
        </div>
        <Field label="Khóa học">
          <select required className="field-input" value={classForm.courseId} onChange={(event) => setClassForm({ ...classForm, courseId: event.target.value })}>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
        </Field>
        {role === 'admin' && (
          <Field label="Giáo viên">
            <select required className="field-input" value={classForm.teacherId} onChange={(event) => setClassForm({ ...classForm, teacherId: event.target.value })}>
              <option value="">Chọn giáo viên</option>
              {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.nickname ?? teacher.email ?? teacher.id}</option>)}
            </select>
          </Field>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Loại lớp">
            <select className="field-input" value={classForm.classType} onChange={(event) => {
              const classType = event.target.value as 'one_to_one' | 'group'
              setClassForm({ ...classForm, classType, capacity: classType === 'one_to_one' ? 1 : classForm.capacity })
            }}>
              <option value="one_to_one">1 kèm 1</option>
              <option value="group">Nhóm</option>
            </select>
          </Field>
          <Field label="Sức chứa">
            <input type="number" min={1} max={500} required disabled={classForm.classType === 'one_to_one'} className="field-input" value={classForm.capacity} onChange={(event) => setClassForm({ ...classForm, capacity: Number(event.target.value) })} />
          </Field>
        </div>
        <AgeBands value={classForm.allowedAgeBands} onChange={(allowedAgeBands) => setClassForm({ ...classForm, allowedAgeBands })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Cấp độ tối thiểu">
            <input type="number" min={1} max={100} required className="field-input" value={classForm.minLevel} onChange={(event) => setClassForm({ ...classForm, minLevel: Number(event.target.value) })} />
          </Field>
          <Field label="Cấp độ tối đa">
            <input type="number" min={1} max={100} required className="field-input" value={classForm.maxLevel} onChange={(event) => setClassForm({ ...classForm, maxLevel: Number(event.target.value) })} />
          </Field>
        </div>
        <Field label="Địa điểm">
          <input className="field-input" value={classForm.location} onChange={(event) => setClassForm({ ...classForm, location: event.target.value })} />
        </Field>
        <Field label="Link phòng học">
          <input type="url" className="field-input" value={classForm.meetingUrl} onChange={(event) => setClassForm({ ...classForm, meetingUrl: event.target.value })} />
        </Field>
        <Field label="Trạng thái">
          <select className="field-input" value={classForm.status} onChange={(event) => setClassForm({ ...classForm, status: event.target.value as 'draft' | 'open' })}>
            <option value="draft">Bản nháp</option>
            <option value="open">Mở nhận học viên</option>
          </select>
        </Field>
        <Button type="submit" disabled={busy || classForm.allowedAgeBands.length === 0}>
          <UserRoundPlus size={17} /> Tạo lớp
        </Button>
      </form>

      <div className="space-y-5">
        <form className="ui-card grid gap-4 p-5" onSubmit={(event) => void createSession(event)}>
          <div>
            <h2 className="font-display text-xl">Tạo buổi học</h2>
            <p className="text-sm text-muted">Hệ thống từ chối lịch trùng của giáo viên hoặc học viên.</p>
          </div>
          <Field label="Lớp">
            <select required className="field-input" value={sessionForm.classId} onChange={(event) => setSessionForm({ ...sessionForm, classId: event.target.value })}>
              <option value="">Chọn lớp</option>
              {classes.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.name}</option>)}
            </select>
          </Field>
          <Field label="Tên buổi học">
            <input required className="field-input" value={sessionForm.title} onChange={(event) => setSessionForm({ ...sessionForm, title: event.target.value })} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Bắt đầu">
              <input type="datetime-local" required className="field-input" value={sessionForm.startsAt} onChange={(event) => setSessionForm({ ...sessionForm, startsAt: event.target.value })} />
            </Field>
            <Field label="Kết thúc">
              <input type="datetime-local" required className="field-input" value={sessionForm.endsAt} onChange={(event) => setSessionForm({ ...sessionForm, endsAt: event.target.value })} />
            </Field>
          </div>
          <Field label="Địa điểm ghi đè">
            <input className="field-input" value={sessionForm.location} onChange={(event) => setSessionForm({ ...sessionForm, location: event.target.value })} />
          </Field>
          <Field label="Link phòng học ghi đè">
            <input type="url" className="field-input" value={sessionForm.meetingUrl} onChange={(event) => setSessionForm({ ...sessionForm, meetingUrl: event.target.value })} />
          </Field>
          <Field label="Mục tiêu buổi học">
            <textarea
              required
              maxLength={500}
              className="min-h-20 field-input"
              placeholder="Sau buổi học, học viên có thể làm được gì?"
              value={sessionForm.lessonPlan.goal}
              onChange={(event) =>
                setSessionForm({
                  ...sessionForm,
                  lessonPlan: {
                    ...sessionForm.lessonPlan,
                    goal: event.target.value,
                  },
                })
              }
            />
          </Field>
          <Field label="Hoạt động chính">
            <textarea
              maxLength={2_000}
              className="min-h-24 field-input"
              placeholder={'Mỗi hoạt động một dòng\nVí dụ: Khởi động bằng trò chơi ghép thẻ'}
              value={sessionForm.lessonPlan.activities}
              onChange={(event) =>
                setSessionForm({
                  ...sessionForm,
                  lessonPlan: {
                    ...sessionForm.lessonPlan,
                    activities: event.target.value,
                  },
                })
              }
            />
          </Field>
          <Field label="Học liệu cần chuẩn bị">
            <textarea
              maxLength={1_000}
              className="min-h-20 field-input"
              placeholder="Mỗi học liệu một dòng"
              value={sessionForm.lessonPlan.materials}
              onChange={(event) =>
                setSessionForm({
                  ...sessionForm,
                  lessonPlan: {
                    ...sessionForm.lessonPlan,
                    materials: event.target.value,
                  },
                })
              }
            />
          </Field>
          <Field label="Ghi chú cho giáo viên">
            <textarea
              maxLength={1_000}
              className="min-h-20 field-input"
              placeholder="Điều cần lưu ý khi tổ chức buổi học (không bắt buộc)"
              value={sessionForm.lessonPlan.notes}
              onChange={(event) =>
                setSessionForm({
                  ...sessionForm,
                  lessonPlan: {
                    ...sessionForm.lessonPlan,
                    notes: event.target.value,
                  },
                })
              }
            />
          </Field>
          <Button type="submit" disabled={busy || !sessionForm.classId}>
            <CalendarPlus size={17} /> Tạo buổi học
          </Button>
        </form>

        <section className="ui-card p-5">
          <h2 className="font-display text-xl">Lịch sắp tới</h2>
          {sessions.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Chưa có buổi học.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {sessions.map((session) => (
                <article key={session.id} className="rounded-xl bg-sky-50 p-3">
                  <p className="font-bold">{session.title}</p>
                  <p className="text-sm text-muted">{session.classroom.name} · {displayDate(session.startsAt)}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function PlacementSection({
  rows,
  classes,
  onDone,
  onError,
}: {
  rows: Placement[]
  classes: Classroom[]
  onDone: (message: string) => void
  onError: (message: string) => void
}) {
  if (rows.length === 0) {
    return <EmptyState title="Không có yêu cầu chờ xếp lớp" description="Yêu cầu mới từ phụ huynh sẽ xuất hiện tại đây." />
  }
  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <DecisionCard
          key={row.id}
          title={row.student.nickname ?? 'Học viên'}
          description={`${row.course.title} · cấp độ mong muốn ${row.requestedLevel} · nhóm ${row.student.ageBand}`}
          options={classes.filter((classroom) => classroom.courseId === row.courseId || classroom.courseId === null)}
          optionLabel={(classroom) => {
            const next = classroom.sessions?.[0]
            const timeInfo = next ? ` - ${new Date(next.startsAt).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })} ${new Date(next.startsAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : ' (Chưa có lịch)'
            return `${classroom.name}${timeInfo}`
          }}
          onDecide={async (decision, classId, reason) => {
            try {
              await api(`/api/schedule/placement-requests/${row.id}/decide`, {
                method: 'POST',
                body: JSON.stringify(
                  decision === 'approved'
                    ? { decision: 'placed', classId, reason }
                    : { decision: 'rejected', reason },
                ),
              })
              onDone(decision === 'approved' ? 'Đã xếp học viên vào lớp.' : 'Đã từ chối yêu cầu.')
            } catch (cause) {
              onError(cause instanceof Error ? cause.message : 'Không xử lý được yêu cầu.')
            }
          }}
        />
      ))}
    </div>
  )
}

function RescheduleSection({
  rows,
  classes,
  onDone,
  onError,
}: {
  rows: Reschedule[]
  classes: Classroom[]
  onDone: (message: string) => void
  onError: (message: string) => void
}) {
  if (rows.length === 0) {
    return <EmptyState title="Không có yêu cầu đổi lịch" description="Yêu cầu mới từ phụ huynh sẽ xuất hiện tại đây." />
  }
  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const targets = classes
          .filter((classroom) => classroom.courseId === row.session.classroom.courseId)
          .flatMap((classroom) => classroom.sessions)
          .filter((session) => session.id !== row.session.id)
        return (
          <DecisionCard
            key={row.id}
            title={`${row.student.nickname ?? 'Học viên'} · ${row.session.title}`}
            description={`Hiện tại ${displayDate(row.session.startsAt)} → mong muốn ${displayDate(row.preferredStartsAt)}. Lý do: ${row.reason}`}
            options={targets}
            optionalOption={row.session.classroom.classType === 'one_to_one'}
            optionLabel={(session) => `${session.title} · ${displayDate(session.startsAt)}`}
            onDecide={async (decision, targetSessionId, reason) => {
              try {
                await api(`/api/schedule/reschedule-requests/${row.id}/decide`, {
                  method: 'POST',
                  body: JSON.stringify({
                    decision,
                    targetSessionId:
                      decision === 'approved' && targetSessionId ? targetSessionId : null,
                    reason,
                  }),
                })
                onDone(decision === 'approved' ? 'Đã duyệt đổi lịch.' : 'Đã từ chối đổi lịch.')
              } catch (cause) {
                onError(cause instanceof Error ? cause.message : 'Không xử lý được yêu cầu.')
              }
            }}
          />
        )
      })}
    </div>
  )
}

function DecisionCard<T extends { id: string }>({
  title,
  description,
  options,
  optionalOption = false,
  optionLabel,
  onDecide,
}: {
  title: string
  description: string
  options: T[]
  optionalOption?: boolean
  optionLabel: (value: T) => string
  onDecide: (decision: 'approved' | 'rejected', optionId: string, reason: string) => Promise<void>
}) {
  const [optionId, setOptionId] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  async function decide(decision: 'approved' | 'rejected') {
    if (decision === 'approved' && !optionalOption && !optionId) {
      alert('Vui lòng chọn một phương án (lớp học) trước khi duyệt')
      return
    }
    setBusy(true)
    try {
      await onDecide(decision, optionId, reason)
    } finally {
      setBusy(false)
    }
  }
  return (
    <article className="ui-card grid gap-4 p-5">
      <div>
        <h2 className="font-display text-lg">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label={optionalOption ? 'Phương án (tùy chọn)' : 'Phương án'}>
          <select className="field-input" value={optionId} onChange={(event) => setOptionId(event.target.value)}>
            <option value="">{optionalOption ? 'Đúng thời gian phụ huynh đề xuất' : 'Chọn phương án'}</option>
            {options.map((option) => <option key={option.id} value={option.id}>{optionLabel(option)}</option>)}
          </select>
        </Field>
        <Field label="Lý do quyết định (không bắt buộc)">
          <input maxLength={1_000} className="field-input" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Nhập lý do..." />
        </Field>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="ghost" disabled={busy} onClick={() => void decide('rejected')}>
          <X size={17} /> Từ chối
        </Button>
        <Button disabled={busy} onClick={() => void decide('approved')}>
          <Check size={17} /> Duyệt
        </Button>
      </div>
    </article>
  )
}

function AgeBands({
  value,
  onChange,
}: {
  value: string[]
  onChange: (value: string[]) => void
}) {
  const options = [['6_8', '6–8'], ['9_11', '9–11'], ['11_plus', '12–17']]
  return (
    <fieldset className="rounded-xl border-2 border-border p-3">
      <legend className="px-2 text-sm font-bold">Nhóm tuổi nhận học</legend>
      <div className="flex flex-wrap gap-4">
        {options.map(([key, label]) => (
          <label key={key} className="flex min-h-11 items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={value.includes(key)}
              onChange={(event) =>
                onChange(
                  event.target.checked
                    ? [...value, key]
                    : value.filter((item) => item !== key),
                )
              }
            />
            {label} tuổi
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1 text-sm font-bold">{label}{children}</label>
}
