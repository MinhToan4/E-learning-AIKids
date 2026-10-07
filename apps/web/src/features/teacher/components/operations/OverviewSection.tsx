import React, { useCallback, useEffect, useState } from 'react'
import { MessageSquareText } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { api } from '@/shared/lib/api'
import {
  type ConsoleData,
  type CourseOption,
  type Learner,
  type TeacherObservation,
  formatDate,
  splitValues,
} from './types'

export interface OverviewSectionProps {
  data: ConsoleData
  learners: Learner[]
  courses: CourseOption[]
  canWriteObservation: boolean
  onDone: () => void
  showToast: (message: string, kind: 'success' | 'error') => void
}

export function OverviewSection({
  data,
  learners,
  courses,
  canWriteObservation,
  onDone,
  showToast,
}: OverviewSectionProps) {
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
