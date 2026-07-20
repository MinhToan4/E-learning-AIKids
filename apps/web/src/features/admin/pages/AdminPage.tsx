import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { api } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { cn } from '@/shared/lib/cn'

type SystemInfo = {
  service: string
  time: string
  counts: {
    courses: number
    quests: number
    classes: number
    activeSessions: number
    pendingApprovals: number
    usersByRole: Record<string, number>
  }
  vidtory?: {
    configured: boolean
    maskedHint: string | null
    source: string
  }
}

type AdminUser = {
  id: string
  role: string
  email: string | null
  nickname: string | null
  active: boolean
  level: number
  xp: number
  createdAt: string
}

type CourseOverview = {
  id: string
  title: string
  shortTitle?: string
  status: string
  ageTrack?: string
  courseKey?: string
  enrollmentCount?: number
  questCount: number
  quests: Array<{
    id: string
    order: number
    title: string
    videoUrl: string | null
    archived?: boolean
  }>
}

type SessionRow = {
  id: string
  userId: string
  email: string | null
  nickname: string | null
  role: string
  ipAddress: string | null
  createdAt: string
  expiresAt: string
}

type Analytics = {
  time: string
  users: { active: number; byRole: Record<string, number> }
  courses: { open: number; soon: number }
  quests: { active: number; archived: number }
  learning: {
    completedProgress: number
    enrollments: number
    projects: number
  }
  sessions: { active: number }
}

type ModelRow = {
  modelId: string
  weight: number
  label?: string
  enabled?: boolean
  percent?: number
}

type RoutingState = {
  baseURL: string
  image: {
    aspectRatio: string
    resolution: string
    mode?: string
    models: ModelRow[]
  }
  video: {
    aspectRatio: string
    duration: number
    mode?: string
    models: ModelRow[]
  }
}

const emptyRouting = (): RoutingState => ({
  baseURL: 'https://bapi.vidtory.net',
  image: {
    aspectRatio: 'IMAGE_ASPECT_RATIO_LANDSCAPE',
    resolution: '1K',
    models: [
      {
        modelId: 'gemini-3.1-flash-image-preview',
        weight: 100,
        label: 'Gemini Flash Image (SDK)',
        enabled: true,
      },
    ],
  },
  video: {
    aspectRatio: 'VIDEO_ASPECT_RATIO_LANDSCAPE',
    duration: 6,
    models: [
      {
        modelId: 'veo-3.1-fast-generate-001',
        weight: 100,
        label: 'Veo 3.1 Fast (SDK)',
        enabled: true,
      },
    ],
  },
})

type AdminTab =
  | 'system'
  | 'analytics'
  | 'ai'
  | 'users'
  | 'sessions'
  | 'courses'

export function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('system')
  const [system, setSystem] = useState<SystemInfo | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [courses, setCourses] = useState<CourseOverview[]>([])
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [vidtoryKey, setVidtoryKey] = useState('')
  const [vidtoryStatus, setVidtoryStatus] = useState<{
    configured: boolean
    maskedHint: string | null
    source: string
  } | null>(null)
  const [routing, setRouting] = useState<RoutingState>(emptyRouting)
  const [form, setForm] = useState({
    role: 'teacher' as 'parent' | 'teacher' | 'admin',
    email: '',
    password: '',
    nickname: '',
  })
  const [newCourse, setNewCourse] = useState({
    id: '',
    title: '',
    shortTitle: '',
    tagline: '',
    description: '',
    ageTrack: 'L1' as 'L1' | 'L2',
    courseKey: 'K1' as 'K1' | 'K2' | 'K3' | 'K4' | 'K5' | 'K6',
    status: 'soon' as 'open' | 'soon',
  })
  const [roleFilter, setRoleFilter] = useState<string>('')
  const logout = useAuth((s) => s.logout)
  const navigate = useNavigate()

  async function load() {
    setError(null)
    if (tab === 'system') {
      const data = await api<{ system: SystemInfo }>('/api/admin/system')
      setSystem(data.system)
    } else if (tab === 'users') {
      const q = roleFilter ? `?role=${encodeURIComponent(roleFilter)}` : ''
      const data = await api<{ users: AdminUser[] }>(`/api/admin/users${q}`)
      setUsers(data.users)
    } else if (tab === 'sessions') {
      const data = await api<{ sessions: SessionRow[] }>('/api/admin/sessions')
      setSessions(data.sessions)
    } else if (tab === 'analytics') {
      const data = await api<{ analytics: Analytics }>('/api/admin/analytics')
      setAnalytics(data.analytics)
    } else if (tab === 'ai') {
      const data = await api<{
        configured: boolean
        maskedHint: string | null
        source: string
        routing?: RoutingState
        imagePercents?: ModelRow[]
        videoPercents?: ModelRow[]
      }>('/api/admin/settings/vidtory')
      setVidtoryStatus({
        configured: data.configured,
        maskedHint: data.maskedHint,
        source: data.source,
      })
      if (data.routing) {
        setRouting({
          baseURL: data.routing.baseURL || 'https://bapi.vidtory.net',
          image: {
            ...data.routing.image,
            models: (data.imagePercents ?? data.routing.image.models).map(
              (m) => ({
                modelId: m.modelId,
                weight: m.weight,
                label: m.label,
                enabled: m.enabled !== false,
                percent: m.percent,
              }),
            ),
          },
          video: {
            ...data.routing.video,
            models: (data.videoPercents ?? data.routing.video.models).map(
              (m) => ({
                modelId: m.modelId,
                weight: m.weight,
                label: m.label,
                enabled: m.enabled !== false,
                percent: m.percent,
              }),
            ),
          },
        })
      }
    } else {
      const data = await api<{ courses: CourseOverview[] }>('/api/admin/courses')
      setCourses(data.courses)
    }
  }

  async function saveVidtoryKey(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    setError(null)
    try {
      const data = await api<{ configured: boolean; maskedHint: string }>(
        '/api/admin/settings/vidtory',
        {
          method: 'PUT',
          body: JSON.stringify({ apiKey: vidtoryKey.trim() }),
        },
      )
      setVidtoryKey('')
      setVidtoryStatus({
        configured: data.configured,
        maskedHint: data.maskedHint,
        source: 'database',
      })
      setMsg('Đã lưu API key Vidtory (mã hóa phía server). Key không hiển thị lại.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không lưu được key')
    }
  }

  async function saveRouting(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    setError(null)
    try {
      const payload = {
        routing: {
          baseURL: routing.baseURL.trim() || 'https://bapi.vidtory.net',
          image: {
            aspectRatio: routing.image.aspectRatio,
            resolution: routing.image.resolution,
            mode: routing.image.mode || undefined,
            models: routing.image.models.map((m) => ({
              modelId: m.modelId.trim(),
              weight: Number(m.weight) || 0,
              label: m.label,
              enabled: m.enabled !== false,
            })),
          },
          video: {
            aspectRatio: routing.video.aspectRatio,
            duration: Number(routing.video.duration) || 6,
            models: routing.video.models.map((m) => ({
              modelId: m.modelId.trim(),
              weight: Number(m.weight) || 0,
              label: m.label,
              enabled: m.enabled !== false,
            })),
          },
        },
      }
      const data = await api<{
        routing: RoutingState
        imagePercents: ModelRow[]
        videoPercents: ModelRow[]
      }>('/api/admin/settings/vidtory', {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      setRouting({
        baseURL: data.routing.baseURL || 'https://bapi.vidtory.net',
        image: {
          ...data.routing.image,
          models: data.imagePercents,
        },
        video: {
          ...data.routing.video,
          models: data.videoPercents,
        },
      })
      setMsg(
        'Đã lưu phân tải model. Mỗi job ảnh/video sẽ chọn model theo % weight.',
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không lưu được routing')
    }
  }

  async function clearVidtoryKey() {
    setError(null)
    try {
      await api('/api/admin/settings/vidtory', { method: 'DELETE' })
      setVidtoryStatus({ configured: false, maskedHint: null, source: 'none' })
      setMsg('Đã xóa API key Vidtory khỏi hệ thống')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không xóa được')
    }
  }

  function updateModel(
    kind: 'image' | 'video',
    index: number,
    patch: Partial<ModelRow>,
  ) {
    setRouting((r) => {
      const models = [...r[kind].models]
      models[index] = { ...models[index]!, ...patch }
      return { ...r, [kind]: { ...r[kind], models } }
    })
  }

  function addModel(kind: 'image' | 'video') {
    setRouting((r) => ({
      ...r,
      [kind]: {
        ...r[kind],
        models: [
          ...r[kind].models,
          {
            modelId: kind === 'image' ? 'model-id-moi' : 'veo-model-id',
            weight: 0,
            label: 'Model mới',
            enabled: true,
          },
        ],
      },
    }))
  }

  function removeModel(kind: 'image' | 'video', index: number) {
    setRouting((r) => ({
      ...r,
      [kind]: {
        ...r[kind],
        models: r[kind].models.filter((_, i) => i !== index),
      },
    }))
  }

  useEffect(() => {
    void load().catch((e) =>
      setError(e instanceof Error ? e.message : 'Không tải được'),
    )
  }, [tab, roleFilter])

  async function createCourse(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    setError(null)
    try {
      await api('/api/admin/courses', {
        method: 'POST',
        body: JSON.stringify({
          id: newCourse.id.trim(),
          title: newCourse.title.trim(),
          shortTitle: newCourse.shortTitle.trim(),
          tagline: newCourse.tagline.trim(),
          description: newCourse.description.trim(),
          ageTrack: newCourse.ageTrack,
          courseKey: newCourse.courseKey,
          status: newCourse.status,
          ageLabel: newCourse.ageTrack === 'L2' ? '9–11 tuổi' : '6–8 tuổi',
        }),
      })
      setMsg('Đã tạo khóa học')
      setNewCourse({
        id: '',
        title: '',
        shortTitle: '',
        tagline: '',
        description: '',
        ageTrack: 'L1',
        courseKey: 'K1',
        status: 'soon',
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tạo được khóa')
    }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    try {
      await api('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setMsg('Đã tạo tài khoản')
      setForm({ role: 'teacher', email: '', password: '', nickname: '' })
      if (tab === 'users') await load()
      else setTab('users')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tạo user')
    }
  }

  async function toggleActive(u: AdminUser) {
    await api(`/api/admin/users/${u.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ active: !u.active }),
    })
    setMsg(u.active ? 'Đã vô hiệu hóa' : 'Đã kích hoạt lại')
    await load()
  }

  async function softDeleteUser(u: AdminUser) {
    if (!confirm(`Vô hiệu hóa ${u.email ?? u.nickname}?`)) return
    try {
      await api(`/api/admin/users/${u.id}`, { method: 'DELETE' })
      setMsg('Đã soft-delete user + revoke sessions')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi xóa')
    }
  }

  async function revokeSession(id: string) {
    try {
      await api(`/api/admin/sessions/${id}`, { method: 'DELETE' })
      setMsg('Đã thu hồi phiên')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi revoke')
    }
  }

  async function setCourseStatus(id: string, status: 'open' | 'soon') {
    try {
      await api(`/api/admin/courses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setMsg(`Khóa ${id} → ${status}`)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khóa học')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
            CMS · Quản trị
          </p>
          <h1 className="font-display text-3xl text-text">Hệ thống & tài khoản</h1>
          <p className="text-sm text-muted">
            Quản lý người dùng, theo dõi sức khỏe hệ thống, xem catalog từ SQL.
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={async () => {
            await logout()
            navigate('/')
          }}
        >
          Đăng xuất
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl bg-brand-50 p-1">
        {(
          [
            ['system', 'Hệ thống'],
            ['analytics', 'Analytics'],
            ['ai', 'AI Vidtory'],
            ['users', 'Tài khoản'],
            ['sessions', 'Phiên'],
            ['courses', 'Khóa học'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-extrabold transition',
              tab === id
                ? 'bg-white text-brand-600 shadow-soft'
                : 'text-muted hover:text-text',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {msg && (
        <p className="rounded-xl bg-mint-100 px-3 py-2 text-sm text-success">{msg}</p>
      )}
      {error && (
        <p className="rounded-xl bg-coral-100 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      {tab === 'system' && system && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Khóa học', system.counts.courses],
            ['Bài giảng', system.counts.quests],
            ['Lớp học', system.counts.classes],
            ['Phiên active', system.counts.activeSessions],
            ['Chờ duyệt', system.counts.pendingApprovals],
          ].map(([label, value]) => (
            <div key={String(label)} className="ui-card p-4">
              <p className="text-xs font-bold uppercase text-muted">{label}</p>
              <p className="font-display text-3xl text-brand-600">{value}</p>
            </div>
          ))}
          <div className="ui-card p-4 sm:col-span-2 lg:col-span-3">
            <p className="mb-2 text-xs font-bold uppercase text-muted">Theo vai trò</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(system.counts.usersByRole).map(([role, n]) => (
                <span
                  key={role}
                  className="rounded-full bg-brand-100 px-3 py-1 text-sm font-bold text-brand-600"
                >
                  {role}: {n}
                </span>
              ))}
            </div>
            <p className="mt-2 text-sm font-bold">
              Vidtory AI:{' '}
              {system.vidtory?.configured
                ? `Đã cấu hình (${system.vidtory.maskedHint ?? '••••'})`
                : 'Chưa cấu hình — vào tab AI Vidtory'}
            </p>
            <p className="mt-3 text-xs text-muted">
              Cập nhật: {new Date(system.time).toLocaleString('vi-VN')} · {system.service}
            </p>
          </div>
        </div>
      )}

      {tab === 'analytics' && analytics && (
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['User active', analytics.users.active],
              ['Khóa open', analytics.courses.open],
              ['Khóa soon', analytics.courses.soon],
              ['Phiên active', analytics.sessions.active],
              ['Quest active', analytics.quests.active],
              ['Quest ẩn', analytics.quests.archived],
              ['Hoàn thành trạm', analytics.learning.completedProgress],
              ['Enrollment', analytics.learning.enrollments],
              ['Dự án', analytics.learning.projects],
            ].map(([label, value]) => (
              <div key={String(label)} className="ui-card p-4">
                <p className="text-xs font-bold uppercase text-muted">{label}</p>
                <p className="font-display text-3xl text-brand-600">{value}</p>
              </div>
            ))}
          </div>
          <div className="ui-card p-4">
            <p className="mb-2 text-xs font-bold uppercase text-muted">Users theo role</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(analytics.users.byRole).map(([role, n]) => (
                <span
                  key={role}
                  className="rounded-full bg-brand-100 px-3 py-1 text-sm font-bold text-brand-600"
                >
                  {role}: {n}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">
              Snapshot: {new Date(analytics.time).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
      )}

      {tab === 'ai' && (
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          <div className="ui-card flex flex-col gap-4 p-5">
            <div>
              <h2 className="font-display text-2xl">1. API Key Vidtory</h2>
              <p className="text-sm text-muted">
                Header <code className="text-xs">x-api-key</code> gọi{' '}
                <code className="text-xs">/generative-core/image|video</code>. Key mã hóa
                AES-GCM trên server — không trả full key về trình duyệt.
              </p>
            </div>
            <div className="rounded-2xl bg-brand-50 p-3 text-sm">
              <p className="font-bold">
                Trạng thái:{' '}
                {vidtoryStatus?.configured ? (
                  <span className="text-success">
                    Đã cấu hình · {vidtoryStatus.maskedHint} · nguồn{' '}
                    {vidtoryStatus.source}
                  </span>
                ) : (
                  <span className="text-warning">
                    Chưa có key — bài tập sẽ dùng hình minh họa tạm
                  </span>
                )}
              </p>
            </div>
            <form className="flex flex-col gap-3" onSubmit={saveVidtoryKey}>
              <label className="flex flex-col gap-1 text-sm font-bold">
                API Key mới
                <input
                  type="password"
                  autoComplete="off"
                  minLength={8}
                  required
                  placeholder="vidtory_… từ Vidtory B2B"
                  className="min-h-11 rounded-xl border-2 border-border px-3 font-mono text-sm"
                  value={vidtoryKey}
                  onChange={(e) => setVidtoryKey(e.target.value)}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button type="submit">Lưu key (mã hóa)</Button>
                {vidtoryStatus?.configured && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void clearVidtoryKey()}
                  >
                    Xóa key
                  </Button>
                )}
              </div>
            </form>
          </div>

          <form className="ui-card flex flex-col gap-4 p-5" onSubmit={saveRouting}>
            <div>
              <h2 className="font-display text-2xl">2. Model & phân tải job (%)</h2>
              <p className="text-sm text-muted">
                <strong>Weight %</strong> chỉ chia giữa các <code className="text-xs">modelId</code>{' '}
                khác nhau (vd model A 40% · model B 60%). Mode video{' '}
                <strong>không chia %</strong>: có ảnh ref → <code className="text-xs">i2v</code>, chỉ
                text → <code className="text-xs">t2v</code> (tự động).
              </p>
            </div>

            <label className="flex flex-col gap-1 text-sm font-bold">
              Base URL API Vidtory
              <input
                className="min-h-11 rounded-xl border-2 border-border px-3 font-mono text-sm"
                value={routing.baseURL}
                onChange={(e) =>
                  setRouting((r) => ({ ...r, baseURL: e.target.value }))
                }
                placeholder="https://bapi.vidtory.net"
              />
              <span className="text-xs font-normal text-muted">
                Mặc định https://bapi.vidtory.net — chỉ đổi khi merchant có endpoint khác
              </span>
            </label>

            <section className="rounded-2xl border-2 border-border p-4">
              <h3 className="font-display text-xl text-brand-600">Ảnh · /generative-core/image</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm font-bold">
                  aspectRatio
                  <select
                    className="min-h-11 rounded-xl border-2 border-border px-2"
                    value={routing.image.aspectRatio}
                    onChange={(e) =>
                      setRouting((r) => ({
                        ...r,
                        image: { ...r.image, aspectRatio: e.target.value },
                      }))
                    }
                  >
                    <option value="IMAGE_ASPECT_RATIO_SQUARE">SQUARE 1:1</option>
                    <option value="IMAGE_ASPECT_RATIO_LANDSCAPE">LANDSCAPE 16:9</option>
                    <option value="IMAGE_ASPECT_RATIO_PORTRAIT">PORTRAIT 9:16</option>
                    <option value="IMAGE_ASPECT_RATIO_PORTRAIT_THREE_FOUR">
                      PORTRAIT 3:4
                    </option>
                    <option value="IMAGE_ASPECT_RATIO_LANDSCAPE_FOUR_THREE">
                      LANDSCAPE 4:3
                    </option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-bold">
                  resolution
                  <select
                    className="min-h-11 rounded-xl border-2 border-border px-2"
                    value={routing.image.resolution}
                    onChange={(e) =>
                      setRouting((r) => ({
                        ...r,
                        image: { ...r.image, resolution: e.target.value },
                      }))
                    }
                  >
                    <option value="1K">1K (rẻ)</option>
                    <option value="2K">2K</option>
                    <option value="4K">4K (đắt)</option>
                  </select>
                </label>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {routing.image.models.map((m, i) => (
                  <div
                    key={`img-${i}`}
                    className="grid gap-2 rounded-xl bg-brand-50/60 p-2 sm:grid-cols-[1fr_1fr_80px_70px_auto]"
                  >
                    <input
                      className="min-h-10 rounded-lg border border-border px-2 font-mono text-xs"
                      placeholder="modelId"
                      value={m.modelId}
                      onChange={(e) =>
                        updateModel('image', i, { modelId: e.target.value })
                      }
                    />
                    <input
                      className="min-h-10 rounded-lg border border-border px-2 text-sm"
                      placeholder="Nhãn"
                      value={m.label ?? ''}
                      onChange={(e) =>
                        updateModel('image', i, { label: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      min={0}
                      className="min-h-10 rounded-lg border border-border px-2 text-sm"
                      title="Weight (vd 40)"
                      value={m.weight}
                      onChange={(e) =>
                        updateModel('image', i, {
                          weight: Number(e.target.value),
                        })
                      }
                    />
                    <span className="flex items-center justify-center text-xs font-extrabold text-brand-600">
                      {m.percent != null ? `${m.percent}%` : '—'}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      className="!min-h-10 !px-2 !text-xs"
                      onClick={() => removeModel('image', i)}
                    >
                      Xóa
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={() => addModel('image')}>
                  + Model ảnh
                </Button>
              </div>
            </section>

            <section className="rounded-2xl border-2 border-border p-4">
              <h3 className="font-display text-xl text-brand-600">
                Video · /generative-core/video
              </h3>
              <p className="mt-1 text-xs text-muted">
                Mode tự động: có ảnh ref (ba lô / payload) → i2v · chỉ text → t2v. Dòng dưới chỉ
                là các modelId + % tải.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm font-bold">
                  aspectRatio
                  <select
                    className="min-h-11 rounded-xl border-2 border-border px-2"
                    value={routing.video.aspectRatio}
                    onChange={(e) =>
                      setRouting((r) => ({
                        ...r,
                        video: { ...r.video, aspectRatio: e.target.value },
                      }))
                    }
                  >
                    <option value="VIDEO_ASPECT_RATIO_LANDSCAPE">LANDSCAPE 16:9</option>
                    <option value="VIDEO_ASPECT_RATIO_PORTRAIT">PORTRAIT 9:16</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-bold">
                  duration (giây)
                  <input
                    type="number"
                    min={1}
                    max={30}
                    className="min-h-11 rounded-xl border-2 border-border px-2"
                    value={routing.video.duration}
                    onChange={(e) =>
                      setRouting((r) => ({
                        ...r,
                        video: {
                          ...r.video,
                          duration: Number(e.target.value) || 6,
                        },
                      }))
                    }
                  />
                </label>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {routing.video.models.map((m, i) => (
                  <div
                    key={`vid-${i}`}
                    className="grid gap-2 rounded-xl bg-sky-100/40 p-2 sm:grid-cols-[1fr_1fr_80px_70px_auto]"
                  >
                    <input
                      className="min-h-10 rounded-lg border border-border px-2 font-mono text-xs"
                      placeholder="modelId (gõ tay)"
                      value={m.modelId}
                      onChange={(e) =>
                        updateModel('video', i, { modelId: e.target.value })
                      }
                    />
                    <input
                      className="min-h-10 rounded-lg border border-border px-2 text-sm"
                      placeholder="Nhãn"
                      value={m.label ?? ''}
                      onChange={(e) =>
                        updateModel('video', i, { label: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      min={0}
                      className="min-h-10 rounded-lg border border-border px-2 text-sm"
                      title="Weight % giữa các modelId"
                      value={m.weight}
                      onChange={(e) =>
                        updateModel('video', i, {
                          weight: Number(e.target.value),
                        })
                      }
                    />
                    <span className="flex items-center justify-center text-xs font-extrabold text-brand-600">
                      {m.percent != null ? `${m.percent}%` : '—'}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      className="!min-h-10 !px-2 !text-xs"
                      onClick={() => removeModel('video', i)}
                    >
                      Xóa
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={() => addModel('video')}>
                  + Model video (modelId)
                </Button>
              </div>
            </section>

            <Button type="submit">Lưu phân tải model</Button>
          </form>
        </div>
      )}

      {tab === 'users' && (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="ui-card overflow-x-auto">
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
              <p className="text-xs font-bold uppercase text-muted">Lọc role</p>
              <select
                className="min-h-9 rounded-xl border-2 border-border px-2 text-sm font-bold"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="student">student</option>
                <option value="parent">parent</option>
                <option value="teacher">teacher</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-border bg-brand-50/80">
                <tr>
                  <th className="px-4 py-3 font-extrabold">Người dùng</th>
                  <th className="px-4 py-3 font-extrabold">Vai trò</th>
                  <th className="px-4 py-3 font-extrabold">Trạng thái</th>
                  <th className="px-4 py-3 font-extrabold" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/60">
                    <td className="px-4 py-3">
                      <p className="font-bold">{u.nickname ?? '—'}</p>
                      <p className="text-xs text-muted">{u.email ?? u.id.slice(0, 10)}</p>
                    </td>
                    <td className="px-4 py-3 font-bold capitalize">{u.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-extrabold',
                          u.active
                            ? 'bg-mint-100 text-success'
                            : 'bg-coral-100 text-danger',
                        )}
                      >
                        {u.active ? 'Active' : 'Off'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-1">
                        <Button
                          variant="secondary"
                          className="!min-h-9 !px-3 !text-xs"
                          onClick={() => void toggleActive(u)}
                        >
                          {u.active ? 'Tắt' : 'Bật'}
                        </Button>
                        {u.active && (
                          <Button
                            variant="ghost"
                            className="!min-h-9 !px-3 !text-xs text-danger"
                            onClick={() => void softDeleteUser(u)}
                          >
                            Soft-delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form className="ui-card flex flex-col gap-3 p-4" onSubmit={createUser}>
            <h2 className="font-display text-xl">Tạo tài khoản</h2>
            <label className="flex flex-col gap-1 text-sm font-bold">
              Vai trò
              <select
                className="min-h-11 rounded-xl border-2 border-border px-3"
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    role: e.target.value as 'parent' | 'teacher' | 'admin',
                  }))
                }
              >
                <option value="teacher">Giảng viên</option>
                <option value="parent">Phụ huynh</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-bold">
              Email
              <input
                type="email"
                required
                className="min-h-11 rounded-xl border-2 border-border px-3"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-bold">
              Mật khẩu
              <input
                type="password"
                required
                minLength={8}
                className="min-h-11 rounded-xl border-2 border-border px-3"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-bold">
              Tên hiển thị
              <input
                className="min-h-11 rounded-xl border-2 border-border px-3"
                value={form.nickname}
                onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
              />
            </label>
            <Button type="submit">Tạo</Button>
          </form>
        </div>
      )}

      {tab === 'sessions' && (
        <div className="ui-card overflow-x-auto">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-display text-xl">Phiên đang active</h2>
            <p className="text-xs text-muted">
              Thu hồi phiên buộc đăng nhập lại. Không hiển thị token thô.
            </p>
          </div>
          {sessions.length === 0 ? (
            <p className="p-4 text-sm text-muted">Không có phiên active.</p>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border bg-brand-50/80">
                <tr>
                  <th className="px-4 py-3 font-extrabold">User</th>
                  <th className="px-4 py-3 font-extrabold">Role</th>
                  <th className="px-4 py-3 font-extrabold">IP</th>
                  <th className="px-4 py-3 font-extrabold">Hết hạn</th>
                  <th className="px-4 py-3 font-extrabold" />
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b border-border/60">
                    <td className="px-4 py-3">
                      <p className="font-bold">{s.nickname ?? '—'}</p>
                      <p className="text-xs text-muted">{s.email ?? s.userId.slice(0, 8)}</p>
                    </td>
                    <td className="px-4 py-3 font-bold capitalize">{s.role}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {s.ipAddress ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {new Date(s.expiresAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="secondary"
                        className="!min-h-9 !px-3 !text-xs"
                        onClick={() => void revokeSession(s.id)}
                      >
                        Thu hồi
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'courses' && (
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <div className="flex flex-col gap-3">
            {courses.map((c) => (
              <div key={c.id} className="ui-card p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-display text-xl">{c.title}</h2>
                    <p className="text-xs text-muted">
                      {c.id}
                      {c.ageTrack ? ` · ${c.ageTrack}` : ''}
                      {c.courseKey ? ` · ${c.courseKey}` : ''}
                      {c.enrollmentCount != null
                        ? ` · ${c.enrollmentCount} enroll`
                        : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-sky-100 px-3 py-0.5 text-xs font-extrabold text-sky-600">
                      {c.status} · {c.questCount} bài
                    </span>
                    <Button
                      variant="secondary"
                      className="!min-h-8 !px-3 !text-xs"
                      onClick={() =>
                        void setCourseStatus(
                          c.id,
                          c.status === 'open' ? 'soon' : 'open',
                        )
                      }
                    >
                      {c.status === 'open' ? '→ soon' : '→ open'}
                    </Button>
                  </div>
                </div>
                <ul className="space-y-1 text-sm">
                  {c.quests.map((q) => (
                    <li
                      key={q.id}
                      className={cn(
                        'flex flex-wrap items-center justify-between gap-2 rounded-xl bg-brand-50/60 px-3 py-2',
                        q.archived ? 'opacity-50' : '',
                      )}
                    >
                      <span className="font-bold">
                        #{q.order} {q.title}
                        {q.archived ? ' [ẩn]' : ''}
                      </span>
                      <span className="max-w-full truncate text-xs text-muted">
                        {q.videoUrl ? `🎬 ${q.videoUrl}` : 'Chưa có video'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <form className="ui-card flex h-fit flex-col gap-2 p-4" onSubmit={createCourse}>
            <h2 className="font-display text-xl">Tạo khóa (admin)</h2>
            <input
              className="min-h-10 rounded-xl border-2 border-border px-3 font-mono text-sm"
              placeholder="id-slug"
              value={newCourse.id}
              onChange={(e) =>
                setNewCourse((c) => ({ ...c, id: e.target.value.toLowerCase() }))
              }
              required
              pattern="[a-z0-9-]+"
            />
            <input
              className="min-h-10 rounded-xl border-2 border-border px-3"
              placeholder="Tiêu đề"
              value={newCourse.title}
              onChange={(e) => setNewCourse((c) => ({ ...c, title: e.target.value }))}
              required
            />
            <input
              className="min-h-10 rounded-xl border-2 border-border px-3"
              placeholder="Tên ngắn"
              value={newCourse.shortTitle}
              onChange={(e) =>
                setNewCourse((c) => ({ ...c, shortTitle: e.target.value }))
              }
              required
            />
            <input
              className="min-h-10 rounded-xl border-2 border-border px-3"
              placeholder="Tagline"
              value={newCourse.tagline}
              onChange={(e) =>
                setNewCourse((c) => ({ ...c, tagline: e.target.value }))
              }
              required
            />
            <textarea
              className="min-h-20 rounded-xl border-2 border-border px-3 py-2 text-sm"
              placeholder="Mô tả"
              value={newCourse.description}
              onChange={(e) =>
                setNewCourse((c) => ({ ...c, description: e.target.value }))
              }
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                className="min-h-10 rounded-xl border-2 border-border px-2 text-sm"
                value={newCourse.ageTrack}
                onChange={(e) =>
                  setNewCourse((c) => ({
                    ...c,
                    ageTrack: e.target.value as 'L1' | 'L2',
                  }))
                }
              >
                <option value="L1">L1 6–8</option>
                <option value="L2">L2 9–11</option>
              </select>
              <select
                className="min-h-10 rounded-xl border-2 border-border px-2 text-sm"
                value={newCourse.courseKey}
                onChange={(e) =>
                  setNewCourse((c) => ({
                    ...c,
                    courseKey: e.target.value as typeof newCourse.courseKey,
                  }))
                }
              >
                {(['K1', 'K2', 'K3', 'K4', 'K5', 'K6'] as const).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <select
              className="min-h-10 rounded-xl border-2 border-border px-2 text-sm"
              value={newCourse.status}
              onChange={(e) =>
                setNewCourse((c) => ({
                  ...c,
                  status: e.target.value as 'open' | 'soon',
                }))
              }
            >
              <option value="soon">soon</option>
              <option value="open">open</option>
            </select>
            <Button type="submit">Tạo khóa</Button>
          </form>
        </div>
      )}
    </div>
  )
}
