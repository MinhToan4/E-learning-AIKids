import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  Award,
  BookOpen,
  Check,
  Download,
  MessageSquareText,
  Plus,
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

function CourseSelectionSection({
  courses,
  busy,
  onToggleProgram,
}: {
  courses: Course[]
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
      current.regions.push(course)
      grouped.set(id, current)
    }
    return [...grouped.values()].map((program) => ({
      ...program,
      regions: program.regions.sort((a, b) => (a.regionOrder ?? 0) - (b.regionOrder ?? 0)),
    }))
  }, [courses])
  const visiblePrograms = programs.filter((program) => program.source === space)
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
                <Button className="w-full" variant={enrolled ? 'secondary' : 'primary'} disabled={busy} onClick={() => void onToggleProgram(program.regions, !enrolled)}>
                  {enrolled ? <><Check size={17} aria-hidden="true" /> Bỏ chương trình</> : <><Plus size={17} aria-hidden="true" /> Đăng ký chương trình</>}
                </Button>
              </div>
              <details className="border-t border-border bg-white/80">
                <summary className="min-h-11 cursor-pointer px-4 py-3 text-sm font-extrabold text-brand-700">Xem vùng và trạm trong chương trình</summary>
                <div className="grid gap-3 px-4 pb-4 md:grid-cols-2">
                  {program.regions.map((region, index) => <div key={region.id} className="rounded-2xl border border-border bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div><p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">Vùng {index + 1}</p><h4 className="mt-0.5 font-display text-base">{region.title}</h4></div>
                      <span className="shrink-0 rounded-full bg-sky-50 px-2 py-1 text-xs font-bold text-muted">{region.questCount ?? region.stations?.length ?? 0} trạm</span>
                    </div>
                    {region.stations && region.stations.length > 0 && <ol className="mt-2 grid gap-1 text-xs text-muted">{region.stations.slice(0, 3).map((station) => <li key={station.id}><strong className="text-text">Trạm {station.order}:</strong> {station.title}</li>)}</ol>}
                    {(region.stations?.length ?? 0) > 3 && <p className="mt-1 text-xs font-bold text-brand-600">+ {(region.stations?.length ?? 0) - 3} trạm khác</p>}
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
