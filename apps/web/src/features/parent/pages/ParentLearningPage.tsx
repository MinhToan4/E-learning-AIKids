import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  Award,
  Download,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
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
import { useAuth } from '@/shared/store/auth'
import type { AgeExperiencePolicy } from '@/shared/age-experience/AgeExperienceProvider'
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
  competency: CompetencyMap
  credentials: Credential[]
  pathway: Pathway
  ageExperience: {
    status: 'ready' | 'configuration_required'
    policy: AgeExperiencePolicy | null
  }
}
type Section = 'feedback' | 'journey'

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

export function ParentLearningPage() {
  const role = useAuth((s) => s.user?.role)
  const feedbackBadge = useParentFeedbackBadge(role)
  const [children, setChildren] = useState<Child[]>([])
  const [studentId, setStudentId] = useState('')
  const [section, setSection] = useState<Section>('feedback')
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
        setStudentId((current) => current || response.children[0]?.id || '')
      })
      .catch((cause) => setError(friendlyError(cause)))
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
      const [competency, credentials, pathway, ageExperience] = await Promise.all([
        api<CompetencyMap>(`/api/competency-map?${query}`),
        api<{ credentials: Credential[] }>(`/api/credentials?${query}`),
        learningApi.getPathway(studentId),
        api<{
          status: 'ready' | 'configuration_required'
          policy: AgeExperiencePolicy | null
        }>(`/api/learning/age-policy?${query}`),
      ])
      setData({
        competency,
        credentials: credentials.credentials,
        pathway,
        ageExperience,
      })
    } catch (cause) {
      setError(friendlyError(cause))
    } finally {
      setLoading(false)
    }
  }, [studentId])

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
          <h1 className="font-display text-2xl sm:text-3xl">Tình trạng học tập</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Nhận xét từ giáo viên, năng lực và chứng nhận được cập nhật theo tiến trình học của con.
          </p>
        </div>
        {children.length > 0 && (
          <div className="grid min-w-52 gap-2">
            <p className="text-sm font-bold">Đang xem</p>
            {/* Show child buttons instead of select — easier to see badge per child */}
            <div className="flex flex-wrap gap-2">
              {children.map((child) => {
                const hasNew = feedbackBadge.byChild[child.id] ?? false
                const isActive = studentId === child.id
                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => setStudentId(child.id)}
                    className={cn(
                      'relative flex min-h-10 items-center gap-2 rounded-2xl border-2 px-4 text-sm font-bold transition',
                      isActive
                        ? 'border-brand-400 bg-brand-50 text-brand-700'
                        : 'border-border bg-white text-text hover:border-brand-200',
                    )}
                    aria-pressed={isActive}
                    aria-label={`${child.nickname ?? 'Học viên'}${hasNew ? ' — có nhận xét mới' : ''}`}
                  >
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

      {/* Tab bar — chỉ 2 tab */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Nội dung tình trạng học">
        {(
          [
            ['feedback', 'Nhận xét giáo viên', MessageSquareText],
            ['journey', 'Năng lực & chứng nhận', Sparkles],
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
      ) : data ? (
        <JourneySection
          competency={data.competency}
          credentials={data.credentials}
          pathway={data.pathway}
          ageExperience={data.ageExperience}
          busy={busy}
          onDownload={downloadCredential}
        />
      ) : null}
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
                                {ageExperience.policy?.copyPolicy.competencyLevelLabels[
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
