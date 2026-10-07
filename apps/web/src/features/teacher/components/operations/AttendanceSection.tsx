import { useEffect, useState } from 'react'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { api } from '@/shared/lib/api'
import {
  type AttendanceData,
  type AttendanceRecord,
  type AttendanceStatus,
  type ScheduleClass,
  formatDate,
} from './types'

export interface AttendanceSectionProps {
  classes: ScheduleClass[]
  onDone: () => void
  showToast: (message: string, kind: 'success' | 'error') => void
}

export function AttendanceSection({
  classes,
  onDone,
  showToast,
}: AttendanceSectionProps) {
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
