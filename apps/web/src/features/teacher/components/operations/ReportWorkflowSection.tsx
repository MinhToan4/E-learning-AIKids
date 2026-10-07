import { useState } from 'react'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import {
  type Learner,
  type ReportPolicy,
  type TeacherReport,
  formatDate,
} from './types'

export interface ReportWorkflowSectionProps {
  learners: Learner[]
  policies: ReportPolicy[]
  reports: TeacherReport[]
  onDone: () => void
  showToast: (message: string, kind: 'success' | 'error') => void
}

export function ReportWorkflowSection({
  learners,
  policies,
  reports,
  onDone,
  showToast,
}: ReportWorkflowSectionProps) {
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
