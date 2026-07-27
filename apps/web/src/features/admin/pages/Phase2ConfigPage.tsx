import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Award,
  BookOpenCheck,
  CalendarClock,
  Code2,
  FileText,
  ListChecks,
  RefreshCcw,
  Save,
  ShieldCheck,
} from 'lucide-react'
import { GuidedConfigFields } from '@/features/admin/components/GuidedConfigFields'
import { Button } from '@/shared/components/ui/Button'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'

type ConfigArea = 'learning' | 'competency' | 'credentials' | 'schedule' | 'reports'
type ConfigSnapshot = {
  learning: { agePolicies: unknown[]; pathRules: unknown[] }
  competency: { frameworks: unknown[] }
  credentials: {
    templates: unknown[]
    rules: unknown[]
    issued: Array<{
      id: string
      kind: string
      status: string
      verificationCode: string
      issuedAt: string
      revokedAt: string | null
      revokeReason: string | null
      supersedesCredentialId: string | null
      student: { id: string; nickname: string | null }
      course: { id: string; title: string }
      template: { id: string; name: string; version: number }
    }>
  }
  schedule: { policies: unknown[] }
  reports: { templates: unknown[]; policies: unknown[] }
}

type Submission = {
  id: string
  title: string
  description: string
  method?: 'POST' | 'PUT'
  endpoint: string | ((context: { ageBand: string }) => string)
  initial: Record<string, unknown>
}

const submissions: Record<ConfigArea, Submission[]> = {
  learning: [
    {
      id: 'age-policy',
      title: 'Chính sách trải nghiệm theo tuổi',
      description:
        'Chọn nhóm tuổi bên dưới. Mỗi lần lưu sẽ tăng phiên bản và ghi nhật ký kiểm toán.',
      method: 'PUT',
      endpoint: ({ ageBand }) => `/api/admin/learning/age-policies/${ageBand}`,
      initial: {
        label: '',
        allowedCourseTracks: [],
        uiPolicy: {
          density: 'balanced',
          maxChoicesPerStep: 0,
          largeControls: false,
          oneActivityPerScreen: false,
          showDetailedProgress: false,
        },
        copyPolicy: {
          instructionLength: 'balanced',
          readingSupport: false,
          errorTone: 'gentle',
          actionLabels: {},
          competencyLevelLabels: {
            no_data: '',
            not_met: '',
            developing: '',
            achieved: '',
          },
        },
        permissionPolicy: {
          canDownloadLessons: false,
          canShareCredentials: false,
          canEditProfile: false,
          canRequestReschedule: false,
          requireParentConfirmationFor: [],
        },
        assessmentPolicy: {
          allowedQuestionTypes: [],
          maxShortTextLength: 0,
          preferOneQuestionPerScreen: false,
        },
        status: 'draft',
        reason: '',
      },
    },
    {
      id: 'path-rule',
      title: 'Quy tắc lộ trình khóa học',
      description:
        'Mã khóa học và điều kiện tiên quyết phải tham chiếu dữ liệu khóa học hiện có.',
      endpoint: '/api/admin/learning/path-rules',
      initial: {
        courseId: '',
        prerequisiteCourseIds: [],
        minCompletionPercent: 100,
        minFinalScore: null,
        allowedAgeBands: [],
        availableFrom: null,
        nextCourseId: null,
        status: 'draft',
        reason: '',
      },
    },
  ],
  competency: [
    {
      id: 'framework',
      title: 'Khung năng lực',
      description:
        'Nhập đúng ma trận miền/kỹ năng đã được khách hàng phê duyệt. Không dùng tuyên bố “được cơ quan nhà nước phê duyệt”.',
      endpoint: '/api/admin/competency/frameworks',
      initial: {
        code: '',
        name: '',
        description: null,
        expectedDomainCount: 4,
        sourceReference: null,
        alignmentStatement: null,
        disclaimer: '',
        status: 'draft',
        reason: '',
        domains: [],
      },
    },
    {
      id: 'mapping',
      title: 'Ánh xạ bằng chứng năng lực',
      description:
        'Chỉ công bố sau khung năng lực; skillId và sourceId đều được API xác thực với cơ sở dữ liệu.',
      endpoint: '/api/admin/competency/mapping-versions',
      initial: {
        frameworkId: '',
        calculationPolicy: {
          aggregation: 'weighted_average',
          attemptStrategy: 'latest',
          notMetBelow: 0,
          achievedFrom: 100,
        },
        status: 'draft',
        reason: '',
        mappings: [],
      },
    },
  ],
  credentials: [
    {
      id: 'credential-template',
      title: 'Mẫu chứng nhận / huy hiệu',
      description: 'Nội dung và hình thức được lưu theo phiên bản, không nhúng trong giao diện.',
      endpoint: '/api/admin/credential-templates',
      initial: {
        code: '',
        kind: 'certificate',
        name: '',
        layout: {
          title: '',
          issuerName: '',
          accentColor: '#6D5EFC',
          backgroundUrl: null,
          bodyTemplate: '',
          allowDownload: false,
          allowShare: false,
          publicDisplayName: false,
        },
        status: 'draft',
        reason: '',
      },
    },
    {
      id: 'credential-rule',
      title: 'Điều kiện cấp chứng nhận',
      description:
        'Quy tắc chỉ được công bố khi mẫu tương ứng đã công bố; kỹ năng bắt buộc phải tồn tại.',
      endpoint: '/api/admin/credential-rules',
      initial: {
        courseId: '',
        templateId: '',
        kind: 'certificate',
        minCompletionPercent: 100,
        requirePassedAssessment: true,
        requiredSkillLevels: {},
        status: 'draft',
        reason: '',
      },
    },
  ],
  schedule: [
    {
      id: 'schedule-policy',
      title: 'Chính sách lớp và đổi lịch',
      description:
        'Sức chứa, hạn đổi lịch, số lượt và kênh nhắc lịch phải là chính sách được khách hàng duyệt.',
      endpoint: '/api/admin/schedule-policies',
      initial: {
        code: '',
        classType: 'group',
        maxCapacity: 1,
        changeDeadlineHours: 0,
        maxReschedulesPerPeriod: 0,
        periodDays: 1,
        reminderOffsetsMinutes: [],
        reminderChannels: [],
        absencePolicy: {},
        makeupPolicy: {},
        status: 'draft',
        reason: '',
      },
    },
  ],
  reports: [
    {
      id: 'report-template',
      title: 'Mẫu báo cáo phụ huynh',
      description:
        'PDF sử dụng snapshot bất biến của phiên bản mẫu này và các mục bắt buộc đã chọn.',
      endpoint: '/api/admin/report-templates',
      initial: {
        code: '',
        name: '',
        layout: {
          title: '',
          issuerName: '',
          accentColor: '#6D5EFC',
          footerText: '',
          showScores: false,
          sectionLabels: {},
        },
        requiredSections: [],
        status: 'draft',
        reason: '',
      },
    },
    {
      id: 'report-policy',
      title: 'Chu kỳ và kênh gửi báo cáo',
      description:
        'Email/push/Zalo chỉ được ghi nhận đã gửi khi nhà cung cấp xác nhận thành công.',
      endpoint: '/api/admin/report-policies',
      initial: {
        code: '',
        templateId: '',
        periodDays: 1,
        timezone: '',
        requireApproval: true,
        deliveryChannels: [],
        maxDeliveryAttempts: 3,
        status: 'draft',
        reason: '',
      },
    },
  ],
}

const areaMeta = [
  ['learning', 'Lộ trình & độ tuổi', BookOpenCheck],
  ['competency', 'Năng lực', ShieldCheck],
  ['credentials', 'Chứng nhận', Award],
  ['schedule', 'Lịch học', CalendarClock],
  ['reports', 'Báo cáo', FileText],
] as const

type ReadinessItem = {
  area: ConfigArea
  label: string
  ready: boolean
  detail: string
}

function publishedCount(rows: unknown[]) {
  return rows.filter(
    (row) =>
      row !== null &&
      typeof row === 'object' &&
      'status' in row &&
      row.status === 'published',
  ).length
}

function configReadiness(snapshot: ConfigSnapshot): ReadinessItem[] {
  const publishedAgePolicies = publishedCount(snapshot.learning.agePolicies)
  const publishedPathRules = publishedCount(snapshot.learning.pathRules)
  const publishedFrameworks = publishedCount(snapshot.competency.frameworks)
  const publishedCredentialTemplates = publishedCount(
    snapshot.credentials.templates,
  )
  const publishedCredentialRules = publishedCount(snapshot.credentials.rules)
  const publishedSchedulePolicies = publishedCount(snapshot.schedule.policies)
  const publishedReportTemplates = publishedCount(snapshot.reports.templates)
  const publishedReportPolicies = publishedCount(snapshot.reports.policies)

  return [
    {
      area: 'learning',
      label: '1. Lộ trình & độ tuổi',
      ready: publishedAgePolicies >= 3 && publishedPathRules > 0,
      detail: `${publishedAgePolicies}/3 chính sách tuổi · ${publishedPathRules} quy tắc lộ trình`,
    },
    {
      area: 'competency',
      label: '2. Năng lực',
      ready: publishedFrameworks > 0,
      detail: `${publishedFrameworks} khung đã công bố`,
    },
    {
      area: 'credentials',
      label: '3. Chứng nhận',
      ready:
        publishedCredentialTemplates > 0 && publishedCredentialRules > 0,
      detail: `${publishedCredentialTemplates} mẫu · ${publishedCredentialRules} quy tắc đã công bố`,
    },
    {
      area: 'schedule',
      label: '4. Lịch học',
      ready: publishedSchedulePolicies > 0,
      detail: `${publishedSchedulePolicies} chính sách đã công bố`,
    },
    {
      area: 'reports',
      label: '5. Báo cáo',
      ready: publishedReportTemplates > 0 && publishedReportPolicies > 0,
      detail: `${publishedReportTemplates} mẫu · ${publishedReportPolicies} chính sách đã công bố`,
    },
  ]
}

function pretty(value: unknown) {
  return JSON.stringify(value, null, 2)
}

function parseObject(value: string) {
  const parsed: unknown = JSON.parse(value)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Nội dung phải là một JSON object.')
  }
  return parsed as Record<string, unknown>
}

function agePolicyDraft(
  rows: unknown[],
  ageBand: string,
  fallback: Record<string, unknown>,
) {
  const row = rows.find(
    (candidate) =>
      candidate !== null &&
      typeof candidate === 'object' &&
      'ageBand' in candidate &&
      candidate.ageBand === ageBand,
  )
  if (!row || typeof row !== 'object') return fallback
  const stored = row as Record<string, unknown>
  return {
    label: stored.label ?? fallback.label,
    allowedCourseTracks:
      stored.allowedCourseTracks ?? fallback.allowedCourseTracks,
    uiPolicy: stored.uiPolicyJson ?? fallback.uiPolicy,
    copyPolicy: stored.copyPolicyJson ?? fallback.copyPolicy,
    permissionPolicy:
      stored.permissionPolicyJson ?? fallback.permissionPolicy,
    assessmentPolicy:
      stored.assessmentPolicyJson ?? fallback.assessmentPolicy,
    // Editing production data always starts as a reviewable draft.
    status: 'draft',
    reason: '',
  }
}

export function Phase2ConfigPage() {
  const [area, setArea] = useState<ConfigArea>('learning')
  const [snapshot, setSnapshot] = useState<ConfigSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toasts, showToast, dismissToast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [learning, competency, credentials, schedule, reports] = await Promise.all([
        api<ConfigSnapshot['learning']>('/api/admin/learning/config'),
        api<ConfigSnapshot['competency']>('/api/admin/competency/frameworks'),
        api<ConfigSnapshot['credentials']>('/api/admin/credential-config'),
        api<ConfigSnapshot['schedule']>('/api/admin/schedule-config'),
        api<ConfigSnapshot['reports']>('/api/admin/report-config'),
      ])
      setSnapshot({ learning, competency, credentials, schedule, reports })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tải được cấu hình.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const currentRows = useMemo(() => {
    if (!snapshot) return []
    if (area === 'learning') {
      return [
        { label: 'Chính sách tuổi', rows: snapshot.learning.agePolicies },
        { label: 'Quy tắc lộ trình', rows: snapshot.learning.pathRules },
      ]
    }
    if (area === 'competency') {
      return [{ label: 'Khung và ánh xạ', rows: snapshot.competency.frameworks }]
    }
    if (area === 'credentials') {
      return [
        { label: 'Mẫu chứng nhận', rows: snapshot.credentials.templates },
        { label: 'Quy tắc cấp', rows: snapshot.credentials.rules },
        { label: 'Lịch sử cấp/thu hồi', rows: snapshot.credentials.issued },
      ]
    }
    if (area === 'schedule') {
      return [{ label: 'Chính sách lịch', rows: snapshot.schedule.policies }]
    }
    return [
      { label: 'Mẫu báo cáo', rows: snapshot.reports.templates },
      { label: 'Chính sách báo cáo', rows: snapshot.reports.policies },
    ]
  }, [area, snapshot])

  const readiness = useMemo(
    () => (snapshot ? configReadiness(snapshot) : []),
    [snapshot],
  )
  const currentReadiness = readiness.find((item) => item.area === area)
  const readyCount = readiness.filter((item) => item.ready).length

  if (loading) return <PageSkeleton rows={6} />
  if (error) return <ErrorState message={error} onRetry={() => void load()} />
  if (!snapshot) return null

  return (
    <div className="flex flex-col gap-5">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <header className="ui-card p-5 sm:p-6">
        <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500">
          Cấu hình Production
        </p>
        <h1 className="font-display text-2xl sm:text-3xl">10 module học tập & bài test</h1>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted">
          Đây là nơi nhập chính sách khách hàng đã duyệt. Dữ liệu được kiểm tra phía máy
          chủ, lưu phiên bản trong cơ sở dữ liệu và ghi audit; bản nháp không tác động
          đến học viên.
        </p>
        <div className="mt-5 rounded-2xl border border-border bg-page p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-bold text-text">Tiến độ sẵn sàng vận hành</p>
            <span
              className={cn(
                'rounded-full px-3 py-1 text-xs font-extrabold',
                readyCount === readiness.length
                  ? 'bg-mint-100 text-success'
                  : 'bg-sun-100 text-warning',
              )}
            >
              {readyCount}/{readiness.length} nhóm đã sẵn sàng
            </span>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
            {readiness.map((item) => (
              <button
                key={item.area}
                type="button"
                className={cn(
                  'min-h-20 rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
                  item.ready
                    ? 'border-mint-200 bg-mint-50'
                    : 'border-sun-200 bg-white hover:border-sun-400',
                )}
                onClick={() => setArea(item.area)}
              >
                <span className="block text-sm font-extrabold">
                  {item.label}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted">
                  {item.detail}
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
        {areaMeta.map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={area === key}
            className={cn(
              'flex min-h-11 shrink-0 items-center gap-2 rounded-2xl px-4 text-sm font-extrabold',
              area === key ? 'bg-brand-500 text-white shadow-soft' : 'bg-white text-muted',
            )}
            onClick={() => setArea(key)}
          >
            <Icon size={17} aria-hidden="true" />
            {label}
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[11px]',
                readiness.find((item) => item.area === key)?.ready
                  ? area === key
                    ? 'bg-white/20 text-white'
                    : 'bg-mint-100 text-success'
                  : area === key
                    ? 'bg-white/20 text-white'
                    : 'bg-sun-100 text-warning',
              )}
            >
              {readiness.find((item) => item.area === key)?.ready
                ? 'Sẵn sàng'
                : 'Cần cấu hình'}
            </span>
          </button>
        ))}
      </div>

      {currentReadiness && !currentReadiness.ready && (
        <div
          className="rounded-2xl border border-sun-300 bg-sun-50 p-4 text-sm"
          role="status"
        >
          <p className="font-extrabold text-warning">
            Nhóm này chưa thể dùng trong vận hành
          </p>
          <p className="mt-1 text-muted">
            {currentReadiness.detail}. Chỉ nhập dữ liệu đã được phê duyệt, lưu
            bản nháp để rà soát rồi mới chuyển sang “published”.
          </p>
        </div>
      )}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.72fr)]">
        <div className="space-y-5">
          {submissions[area].map((submission) => (
            <JsonSubmissionForm
              key={submission.id}
              submission={submission}
              existingRows={
                submission.id === 'age-policy'
                  ? snapshot.learning.agePolicies
                  : []
              }
              onSaved={async () => {
                showToast('Đã lưu phiên bản cấu hình.', 'success')
                await load()
              }}
              onError={(message) => showToast(message, 'error')}
            />
          ))}
          {area === 'reports' && (
            <>
              <ProcessorCard
                title="Tạo báo cáo đã đến kỳ"
                description="Tạo draft theo chu kỳ đã công bố cho các học viên đang ở lớp; không tạo trùng kỳ."
                endpoint="/api/admin/reports/due/process"
                onDone={(message, kind) => showToast(message, kind)}
              />
              <ProcessorCard
                title="Xử lý hàng đợi gửi báo cáo"
                description="Chạy tối đa 50 lượt đang chờ/thất bại đủ điều kiện thử lại."
                endpoint="/api/admin/reports/deliveries/process"
                onDone={(message, kind) => showToast(message, kind)}
              />
            </>
          )}
          {area === 'credentials' && (
            <CredentialHistory
              rows={snapshot.credentials.issued}
              onSaved={async () => {
                showToast('Đã thu hồi chứng nhận và lưu audit.', 'success')
                await load()
              }}
              onError={(message) => showToast(message, 'error')}
            />
          )}
          {area === 'schedule' && (
            <ProcessorCard
              title="Xử lý hàng đợi nhắc lịch"
              description="Chỉ gửi các nhắc lịch đã đến hạn; nhà cung cấp chưa cấu hình sẽ thất bại rõ ràng."
              endpoint="/api/admin/schedule/reminders/process"
              onDone={(message, kind) => showToast(message, kind)}
            />
          )}
        </div>

        <aside className="ui-card h-fit p-5 xl:sticky xl:top-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-muted">
                Dữ liệu đang lưu
              </p>
              <h2 className="font-display text-xl">Đối chiếu phiên bản</h2>
            </div>
            <Button variant="ghost" onClick={() => void load()} aria-label="Tải lại">
              <RefreshCcw size={17} aria-hidden="true" />
            </Button>
          </div>
          <div className="mt-4 space-y-4">
            {currentRows.map((group) => (
              <details key={group.label} className="rounded-2xl border border-border bg-page p-3">
                <summary className="cursor-pointer font-bold">
                  {group.label} ({group.rows.length})
                </summary>
                <pre className="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap break-words rounded-xl bg-white p-3 text-xs leading-relaxed">
                  {pretty(group.rows)}
                </pre>
              </details>
            ))}
          </div>
        </aside>
      </section>
    </div>
  )
}

function CredentialHistory({
  rows,
  onSaved,
  onError,
}: {
  rows: ConfigSnapshot['credentials']['issued']
  onSaved: () => Promise<void>
  onError: (message: string) => void
}) {
  const [reasons, setReasons] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)

  async function revoke(id: string) {
    const reason = reasons[id]?.trim() ?? ''
    if (reason.length < 5) {
      onError('Lý do thu hồi phải có ít nhất 5 ký tự.')
      return
    }
    setBusy(id)
    try {
      await api(`/api/admin/credentials/${id}/revoke`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })
      await onSaved()
    } catch (cause) {
      onError(
        cause instanceof Error
          ? cause.message
          : 'Không thu hồi được chứng nhận.',
      )
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="ui-card p-5">
      <h2 className="font-display text-xl">Lịch sử cấp và thu hồi</h2>
      <p className="mt-1 text-sm text-muted">
        Bản đã thu hồi được giữ nguyên để kiểm toán; lần cấp lại sẽ tạo mã mới
        và liên kết bản bị thay thế.
      </p>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Chưa có chứng nhận đã cấp.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.map((row) => (
            <article
              key={row.id}
              className="rounded-2xl border border-border p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold">
                    {row.student.nickname ?? row.student.id} ·{' '}
                    {row.template.name}
                  </p>
                  <p className="text-sm text-muted">{row.course.title}</p>
                  <p className="mt-1 break-all font-mono text-xs text-muted">
                    {row.verificationCode}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2 py-1 text-xs font-bold',
                    row.status === 'issued'
                      ? 'bg-mint-100 text-success'
                      : 'bg-coral-100 text-danger',
                  )}
                >
                  {row.status === 'issued' ? 'Còn hiệu lực' : 'Đã thu hồi'}
                </span>
              </div>
              {row.status === 'issued' ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                  <input
                    aria-label="Lý do thu hồi chứng chỉ"
                    minLength={5}
                    maxLength={500}
                    className="field-input"
                    placeholder="Lý do thu hồi"
                    value={reasons[row.id] ?? ''}
                    onChange={(event) =>
                      setReasons({
                        ...reasons,
                        [row.id]: event.target.value,
                      })
                    }
                  />
                  <Button
                    variant="secondary"
                    disabled={
                      busy === row.id ||
                      (reasons[row.id]?.trim().length ?? 0) < 5
                    }
                    onClick={() => void revoke(row.id)}
                  >
                    Thu hồi
                  </Button>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted">
                  {row.revokeReason}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function JsonSubmissionForm({
  submission,
  existingRows,
  onSaved,
  onError,
}: {
  submission: Submission
  existingRows: unknown[]
  onSaved: () => Promise<void>
  onError: (message: string) => void
}) {
  const [value, setValue] = useState(() => pretty(submission.initial))
  const [ageBand, setAgeBand] = useState('6_8')
  const [mode, setMode] = useState<'guided' | 'json'>('guided')
  const [busy, setBusy] = useState(false)
  const parsedValue = useMemo(() => {
    try {
      return { data: parseObject(value), error: null }
    } catch (cause) {
      return {
        data: null,
        error:
          cause instanceof Error
            ? cause.message
            : 'Nội dung JSON chưa đúng định dạng.',
      }
    }
  }, [value])

  useEffect(() => {
    if (submission.id !== 'age-policy') return
    setValue(
      pretty(agePolicyDraft(existingRows, ageBand, submission.initial)),
    )
  }, [ageBand, existingRows, submission])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    try {
      const body = parseObject(value)
      const endpoint =
        typeof submission.endpoint === 'function'
          ? submission.endpoint({ ageBand })
          : submission.endpoint
      await api(endpoint, {
        method: submission.method ?? 'POST',
        body: JSON.stringify(body),
      })
      await onSaved()
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : 'Không lưu được cấu hình.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="ui-card grid gap-4 p-5" onSubmit={(event) => void submit(event)}>
      <div>
        <h2 className="font-display text-xl">{submission.title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">{submission.description}</p>
      </div>
      {submission.id === 'age-policy' && (
        <div className="grid gap-2">
          <label className="grid max-w-xs gap-1 text-sm font-bold">
            Nhóm tuổi
            <select
              className="min-h-11 rounded-xl border-2 border-border bg-white px-3"
              value={ageBand}
              onChange={(event) => setAgeBand(event.target.value)}
            >
              <option value="6_8">6–8 tuổi</option>
              <option value="9_11">9–11 tuổi</option>
              <option value="11_plus">12–17 tuổi</option>
            </select>
          </label>
          <p className="text-xs text-muted">
            Biểu mẫu đã nạp cấu hình đang lưu và chuyển về bản nháp để rà soát an toàn.
          </p>
        </div>
      )}
      <div
        className="flex w-fit gap-1 rounded-xl border border-border bg-page p-1"
        role="group"
        aria-label="Cách nhập cấu hình"
      >
        <button
          type="button"
          className={cn(
            'flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-extrabold',
            mode === 'guided'
              ? 'bg-white text-brand-600 shadow-soft'
              : 'text-muted',
          )}
          aria-pressed={mode === 'guided'}
          disabled={!parsedValue.data}
          onClick={() => setMode('guided')}
        >
          <ListChecks size={17} aria-hidden="true" />
          Biểu mẫu
        </button>
        <button
          type="button"
          className={cn(
            'flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-extrabold',
            mode === 'json'
              ? 'bg-white text-brand-600 shadow-soft'
              : 'text-muted',
          )}
          aria-pressed={mode === 'json'}
          onClick={() => setMode('json')}
        >
          <Code2 size={17} aria-hidden="true" />
          JSON nâng cao
        </button>
      </div>
      {mode === 'guided' && parsedValue.data ? (
        <GuidedConfigFields
          value={parsedValue.data}
          onChange={(next) => setValue(pretty(next))}
        />
      ) : (
        <label className="grid gap-1 text-sm font-bold">
          Nội dung JSON
          <textarea
            required
            spellCheck={false}
            aria-invalid={Boolean(parsedValue.error)}
            className="min-h-72 resize-y rounded-2xl border-2 border-border bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-100 focus:border-brand-400 focus:outline-none"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </label>
      )}
      {parsedValue.error && (
        <p className="text-sm font-bold text-danger" role="alert">
          {parsedValue.error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">
          Lưu bản nháp, đối chiếu dữ liệu rồi mới chuyển sang trạng thái công bố.
        </p>
        <Button type="submit" disabled={busy || !parsedValue.data}>
          <Save size={17} aria-hidden="true" />
          {busy ? 'Đang lưu…' : 'Lưu phiên bản'}
        </Button>
      </div>
    </form>
  )
}

function ProcessorCard({
  title,
  description,
  endpoint,
  onDone,
}: {
  title: string
  description: string
  endpoint: string
  onDone: (message: string, kind: 'success' | 'error') => void
}) {
  const [busy, setBusy] = useState(false)
  async function process() {
    setBusy(true)
    try {
      const result = await api<Record<string, unknown>>(endpoint, {
        method: 'POST',
        body: JSON.stringify({ limit: 50 }),
      })
      onDone(`Đã xử lý hàng đợi: ${pretty(result)}`, 'success')
    } catch (cause) {
      onDone(cause instanceof Error ? cause.message : 'Không xử lý được hàng đợi.', 'error')
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="ui-card flex flex-wrap items-center justify-between gap-4 p-5">
      <div>
        <h2 className="font-display text-lg">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <Button disabled={busy} onClick={() => void process()}>
        <RefreshCcw size={17} aria-hidden="true" />
        {busy ? 'Đang xử lý…' : 'Xử lý ngay'}
      </Button>
    </section>
  )
}
