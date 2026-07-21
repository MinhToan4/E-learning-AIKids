/**
 * AdminPage — Full redesign with:
 * - Route-controlled tabs (prop `tab` from App.tsx routes)
 * - Toast popup notifications (no inline messages)
 * - ConfirmDialog (no browser confirm())
 * - Charts: ASCII mini-bars for analytics (no extra deps)
 * - Login audit log with auto-purge indicator
 * - Full-width layout (CmsShell handles sidebar)
 */
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { useToast } from '@/shared/hooks/useToast'
import { api } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { cn } from '@/shared/lib/cn'

// ── Types ───────────────────────────────────────────────────
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
  vidtory?: { configured: boolean; maskedHint: string | null; source: string }
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
  quests: Array<{ id: string; order: number; title: string; videoUrl: string | null; archived?: boolean }>
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
  learning: { completedProgress: number; enrollments: number; projects: number }
  sessions: { active: number }
}

type ModelRow = { modelId: string; weight: number; label?: string; enabled?: boolean; percent?: number }
type RoutingState = {
  baseURL: string
  image: { aspectRatio: string; resolution: string; mode?: string; models: ModelRow[] }
  video: { aspectRatio: string; duration: number; mode?: string; models: ModelRow[] }
}

type LoginLogItem = {
  id: string
  userId: string | null
  email: string | null
  outcome: string
  ipAddress: string | null
  reason: string | null
  createdAt: string
}

type LoginLogSummary = {
  total: number
  byOutcome: Record<string, number>
  windowHours: number
  purgedAt: string
}

export type AdminTab = 'system' | 'analytics' | 'logs' | 'ai' | 'users' | 'sessions' | 'courses'

const emptyRouting = (): RoutingState => ({
  baseURL: 'https://bapi.vidtory.net',
  image: {
    aspectRatio: 'IMAGE_ASPECT_RATIO_LANDSCAPE',
    resolution: '1K',
    models: [{ modelId: 'gemini-3.1-flash-image-preview', weight: 100, label: 'Gemini Flash Image', enabled: true }],
  },
  video: {
    aspectRatio: 'VIDEO_ASPECT_RATIO_LANDSCAPE',
    duration: 6,
    models: [{ modelId: 'veo-3.1-fast-generate-001', weight: 100, label: 'Veo 3.1 Fast', enabled: true }],
  },
})

// ── Mini bar chart (no deps) ─────────────────────────────────
function MiniBar({ value, max, color = 'bg-brand-500', label }: { value: number; max: number; color?: string; label: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 truncate text-xs text-muted">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-brand-100">
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right text-xs font-extrabold">{value}</span>
    </div>
  )
}

// ── Stat card ────────────────────────────────────────────────
function StatCard({ label, value, icon, sub }: { label: string; value: number | string; icon: string; sub?: string }) {
  return (
    <div className="ui-card flex flex-col gap-1 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="font-display text-3xl text-brand-600">{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  )
}

// ── Outcome badge ────────────────────────────────────────────
function OutcomeBadge({ outcome }: { outcome: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    success: { label: 'Thành công', cls: 'bg-mint-100 text-success' },
    failed: { label: 'Thất bại', cls: 'bg-coral-100 text-danger' },
    locked: { label: 'Bị khóa', cls: 'bg-sun-100 text-warning' },
  }
  const style = map[outcome] ?? { label: outcome, cls: 'bg-brand-100 text-brand-600' }
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-extrabold', style.cls)}>{style.label}</span>
  )
}

// ── Main component ───────────────────────────────────────────
export function AdminPage({ tab }: { tab: AdminTab }) {
  const [system, setSystem] = useState<SystemInfo | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [courses, setCourses] = useState<CourseOverview[]>([])
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loginLogs, setLoginLogs] = useState<LoginLogItem[]>([])
  const [logSummary, setLogSummary] = useState<LoginLogSummary | null>(null)
  const [logFilter, setLogFilter] = useState('')
  const [vidtoryKey, setVidtoryKey] = useState('')
  const [vidtoryStatus, setVidtoryStatus] = useState<{ configured: boolean; maskedHint: string | null; source: string } | null>(null)
  const [routing, setRouting] = useState<RoutingState>(emptyRouting)
  const [form, setForm] = useState({ role: 'teacher' as 'parent' | 'teacher' | 'admin', email: '', password: '', nickname: '' })
  const [newCourse, setNewCourse] = useState({ id: '', title: '', shortTitle: '', tagline: '', description: '', ageTrack: 'L1' as 'L1' | 'L2', courseKey: 'K1' as 'K1' | 'K2' | 'K3' | 'K4' | 'K5' | 'K6', status: 'soon' as 'open' | 'soon' })
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<SessionRow | null>(null)

  const { toasts, showToast, dismissToast } = useToast()
  const logout = useAuth((s) => s.logout)
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    try {
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
        const data = await api<{ configured: boolean; maskedHint: string | null; source: string; routing?: RoutingState; imagePercents?: ModelRow[]; videoPercents?: ModelRow[] }>('/api/admin/settings/vidtory')
        setVidtoryStatus({ configured: data.configured, maskedHint: data.maskedHint, source: data.source })
        if (data.routing) {
          setRouting({
            baseURL: data.routing.baseURL || 'https://bapi.vidtory.net',
            image: { ...data.routing.image, models: (data.imagePercents ?? data.routing.image.models).map((m) => ({ modelId: m.modelId, weight: m.weight, label: m.label, enabled: m.enabled !== false, percent: m.percent })) },
            video: { ...data.routing.video, models: (data.videoPercents ?? data.routing.video.models).map((m) => ({ modelId: m.modelId, weight: m.weight, label: m.label, enabled: m.enabled !== false, percent: m.percent })) },
          })
        }
      } else if (tab === 'logs') {
        const q = logFilter ? `?outcome=${encodeURIComponent(logFilter)}` : ''
        const data = await api<{ logs: LoginLogItem[]; summary: LoginLogSummary }>(`/api/admin/login-logs${q}`)
        setLoginLogs(data.logs)
        setLogSummary(data.summary)
      } else {
        const data = await api<{ courses: CourseOverview[] }>('/api/admin/courses')
        setCourses(data.courses)
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không tải được dữ liệu', 'error')
    } finally {
      setLoading(false)
    }
  }, [tab, roleFilter, logFilter, showToast])

  useEffect(() => { void load() }, [load])

  // ── Handlers ──────────────────────────────────────────────
  async function saveVidtoryKey(e: React.FormEvent) {
    e.preventDefault()
    try {
      const data = await api<{ configured: boolean; maskedHint: string }>('/api/admin/settings/vidtory', { method: 'PUT', body: JSON.stringify({ apiKey: vidtoryKey.trim() }) })
      setVidtoryKey('')
      setVidtoryStatus({ configured: data.configured, maskedHint: data.maskedHint, source: 'database' })
      showToast('Đã lưu API key Vidtory (mã hóa phía server)', 'success')
    } catch (e) { showToast(e instanceof Error ? e.message : 'Không lưu được key', 'error') }
  }

  async function saveRouting(e: React.FormEvent) {
    e.preventDefault()
    try {
      const payload = {
        routing: {
          baseURL: routing.baseURL.trim() || 'https://bapi.vidtory.net',
          image: { aspectRatio: routing.image.aspectRatio, resolution: routing.image.resolution, models: routing.image.models.map((m) => ({ modelId: m.modelId.trim(), weight: Number(m.weight) || 0, label: m.label, enabled: m.enabled !== false })) },
          video: { aspectRatio: routing.video.aspectRatio, duration: Number(routing.video.duration) || 6, models: routing.video.models.map((m) => ({ modelId: m.modelId.trim(), weight: Number(m.weight) || 0, label: m.label, enabled: m.enabled !== false })) },
        },
      }
      const data = await api<{ routing: RoutingState; imagePercents: ModelRow[]; videoPercents: ModelRow[] }>('/api/admin/settings/vidtory', { method: 'PUT', body: JSON.stringify(payload) })
      setRouting({ baseURL: data.routing.baseURL || 'https://bapi.vidtory.net', image: { ...data.routing.image, models: data.imagePercents }, video: { ...data.routing.video, models: data.videoPercents } })
      showToast('Đã lưu phân tải model AI', 'success')
    } catch (e) { showToast(e instanceof Error ? e.message : 'Không lưu được routing', 'error') }
  }

  async function clearVidtoryKey() {
    try {
      await api('/api/admin/settings/vidtory', { method: 'DELETE' })
      setVidtoryStatus({ configured: false, maskedHint: null, source: 'none' })
      showToast('Đã xóa API key Vidtory', 'success')
    } catch (e) { showToast(e instanceof Error ? e.message : 'Không xóa được', 'error') }
  }

  function updateModel(kind: 'image' | 'video', index: number, patch: Partial<ModelRow>) {
    setRouting((r) => { const models = [...r[kind].models]; models[index] = { ...models[index]!, ...patch }; return { ...r, [kind]: { ...r[kind], models } } })
  }
  function addModel(kind: 'image' | 'video') {
    setRouting((r) => ({ ...r, [kind]: { ...r[kind], models: [...r[kind].models, { modelId: kind === 'image' ? 'model-id-moi' : 'veo-model-id', weight: 0, label: 'Model mới', enabled: true }] } }))
  }
  function removeModel(kind: 'image' | 'video', index: number) {
    setRouting((r) => ({ ...r, [kind]: { ...r[kind], models: r[kind].models.filter((_, i) => i !== index) } }))
  }

  async function createCourse(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api('/api/admin/courses', { method: 'POST', body: JSON.stringify({ id: newCourse.id.trim(), title: newCourse.title.trim(), shortTitle: newCourse.shortTitle.trim(), tagline: newCourse.tagline.trim(), description: newCourse.description.trim(), ageTrack: newCourse.ageTrack, courseKey: newCourse.courseKey, status: newCourse.status, ageLabel: newCourse.ageTrack === 'L2' ? '9–11 tuổi' : '6–8 tuổi' }) })
      showToast('Đã tạo khóa học thành công', 'success')
      setNewCourse({ id: '', title: '', shortTitle: '', tagline: '', description: '', ageTrack: 'L1', courseKey: 'K1', status: 'soon' })
      await load()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Không tạo được khóa', 'error') }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api('/api/admin/users', { method: 'POST', body: JSON.stringify(form) })
      showToast('Đã tạo tài khoản thành công', 'success')
      setForm({ role: 'teacher', email: '', password: '', nickname: '' })
      await load()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Lỗi tạo user', 'error') }
  }

  async function toggleActive(u: AdminUser) {
    try {
      await api(`/api/admin/users/${u.id}`, { method: 'PATCH', body: JSON.stringify({ active: !u.active }) })
      showToast(u.active ? 'Đã vô hiệu hóa tài khoản' : 'Đã kích hoạt lại tài khoản', 'success')
      await load()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Lỗi cập nhật', 'error') }
  }

  async function softDeleteUser() {
    if (!deleteTarget) return
    try {
      await api(`/api/admin/users/${deleteTarget.id}`, { method: 'DELETE' })
      showToast('Đã soft-delete user + thu hồi phiên', 'success')
      setDeleteTarget(null)
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lỗi xóa', 'error')
      setDeleteTarget(null)
    }
  }

  async function revokeSession() {
    if (!revokeTarget) return
    try {
      await api(`/api/admin/sessions/${revokeTarget.id}`, { method: 'DELETE' })
      showToast('Đã thu hồi phiên đăng nhập', 'success')
      setRevokeTarget(null)
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lỗi revoke', 'error')
      setRevokeTarget(null)
    }
  }

  async function setCourseStatus(id: string, status: 'open' | 'soon') {
    try {
      await api(`/api/admin/courses/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      showToast(`Khóa học → ${status === 'open' ? 'Mở' : 'Ẩn'}`, 'success')
      await load()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Lỗi cập nhật khóa', 'error') }
  }

  async function purgeLogs() {
    try {
      const data = await api<{ deleted: number; message: string }>('/api/admin/login-logs', { method: 'DELETE' })
      showToast(data.message, 'success')
      await load()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Lỗi purge', 'error') }
  }

  // ── Tab content renderers ────────────────────────────────
  const sectionHeader = (title: string, subtitle?: string) => (
    <div className="mb-5">
      <h1 className="font-display text-2xl text-text">{title}</h1>
      {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
    </div>
  )

  const loadingEl = (
    <div className="flex h-40 items-center justify-center">
      <div className="ui-skeleton h-10 w-48 rounded-2xl" />
    </div>
  )

  // System tab
  const systemTab = system && (
    <>
      {sectionHeader('Tổng quan hệ thống', 'Tình trạng dữ liệu + Vidtory AI')}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[
          { label: 'Khóa học', value: system.counts.courses, icon: '📚' },
          { label: 'Bài giảng', value: system.counts.quests, icon: '🎯' },
          { label: 'Lớp học', value: system.counts.classes, icon: '🏫' },
          { label: 'Phiên active', value: system.counts.activeSessions, icon: '🔑' },
          { label: 'Chờ duyệt', value: system.counts.pendingApprovals, icon: '⏳' },
        ].map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="ui-card p-5">
          <p className="mb-4 text-sm font-extrabold uppercase tracking-wide text-muted">Người dùng theo vai trò</p>
          <div className="flex flex-col gap-3">
            {Object.entries(system.counts.usersByRole).map(([role, n]) => {
              const max = Math.max(...Object.values(system.counts.usersByRole))
              const colorMap: Record<string, string> = { student: 'bg-brand-500', teacher: 'bg-sky-400', parent: 'bg-mint-400', admin: 'bg-coral-400' }
              return <MiniBar key={role} label={role} value={n} max={max} color={colorMap[role] ?? 'bg-brand-500'} />
            })}
          </div>
        </div>
        <div className="ui-card p-5">
          <p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-muted">Vidtory AI</p>
          <div className={cn('flex items-center gap-3 rounded-2xl p-3', system.vidtory?.configured ? 'bg-mint-100' : 'bg-sun-100')}>
            <span className="text-2xl">{system.vidtory?.configured ? '✅' : '⚠️'}</span>
            <div>
              <p className="font-bold">{system.vidtory?.configured ? `Đã cấu hình · ${system.vidtory.maskedHint ?? '••••'}` : 'Chưa cấu hình'}</p>
              <p className="text-xs text-muted">{system.vidtory?.configured ? `Nguồn: ${system.vidtory.source}` : 'Vào tab AI Vidtory để thiết lập'}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">Cập nhật: {new Date(system.time).toLocaleString('vi-VN')} · {system.service}</p>
        </div>
      </div>
    </>
  )

  // Analytics tab
  const analyticsTab = analytics && (
    <>
      {sectionHeader('Analytics', 'Snapshot số liệu toàn hệ thống')}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="User active" value={analytics.users.active} icon="👤" />
        <StatCard label="Khóa mở" value={analytics.courses.open} icon="📖" />
        <StatCard label="Phiên active" value={analytics.sessions.active} icon="🔐" />
        <StatCard label="Enrollment" value={analytics.learning.enrollments} icon="📝" />
        <StatCard label="Quest active" value={analytics.quests.active} icon="🎯" />
        <StatCard label="Quest ẩn" value={analytics.quests.archived} icon="👁️‍🗨️" />
        <StatCard label="Hoàn thành trạm" value={analytics.learning.completedProgress} icon="⭐" />
        <StatCard label="Dự án" value={analytics.learning.projects} icon="🎨" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="ui-card p-5">
          <p className="mb-4 text-sm font-extrabold uppercase tracking-wide text-muted">Users theo role</p>
          <div className="flex flex-col gap-3">
            {Object.entries(analytics.users.byRole).map(([role, n]) => {
              const max = Math.max(...Object.values(analytics.users.byRole))
              const colorMap: Record<string, string> = { student: 'bg-brand-500', teacher: 'bg-sky-400', parent: 'bg-mint-400', admin: 'bg-coral-400' }
              return <MiniBar key={role} label={role} value={n} max={max} color={colorMap[role] ?? 'bg-brand-500'} />
            })}
          </div>
        </div>
        <div className="ui-card p-5">
          <p className="mb-4 text-sm font-extrabold uppercase tracking-wide text-muted">Học tập</p>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Hoàn thành trạm', value: analytics.learning.completedProgress },
              { label: 'Enrollment', value: analytics.learning.enrollments },
              { label: 'Dự án', value: analytics.learning.projects },
            ].map((item) => {
              const max = Math.max(analytics.learning.completedProgress, analytics.learning.enrollments, analytics.learning.projects, 1)
              return <MiniBar key={item.label} label={item.label} value={item.value} max={max} color="bg-mint-400" />
            })}
          </div>
          <p className="mt-3 text-xs text-muted">Snapshot: {new Date(analytics.time).toLocaleString('vi-VN')}</p>
        </div>
      </div>
    </>
  )

  // Login logs tab
  const logsTab = (
    <>
      {sectionHeader('Login Logs', 'Theo dõi đăng nhập 24 giờ gần nhất · Auto-purge mỗi lần xem')}
      {logSummary && (
        <div className="mb-4 grid gap-3 sm:grid-cols-4">
          <StatCard label="Tổng 24h" value={logSummary.total} icon="📋" />
          <StatCard label="Thành công" value={logSummary.byOutcome['success'] ?? 0} icon="✅" />
          <StatCard label="Thất bại" value={logSummary.byOutcome['failed'] ?? 0} icon="❌" />
          <StatCard label="Bị khóa" value={logSummary.byOutcome['locked'] ?? 0} icon="🔒" />
        </div>
      )}
      <div className="ui-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-border/60 px-4 py-3">
          <select
            className="min-h-9 rounded-xl border-2 border-border px-2 text-sm font-bold"
            value={logFilter}
            onChange={(e) => setLogFilter(e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="success">Thành công</option>
            <option value="failed">Thất bại</option>
            <option value="locked">Bị khóa</option>
          </select>
          <Button variant="secondary" className="!min-h-9 !px-3 !text-xs" onClick={() => void load()}>
            🔄 Làm mới
          </Button>
          <Button variant="ghost" className="!min-h-9 !px-3 !text-xs text-muted" onClick={() => void purgeLogs()}>
            🗑 Xóa thủ công
          </Button>
          {logSummary && (
            <span className="text-xs text-muted">Purged: {new Date(logSummary.purgedAt).toLocaleString('vi-VN')}</span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="border-b border-border bg-brand-50/80">
              <tr>
                <th className="px-4 py-3 font-extrabold">Thời gian</th>
                <th className="px-4 py-3 font-extrabold">Email</th>
                <th className="px-4 py-3 font-extrabold">Kết quả</th>
                <th className="px-4 py-3 font-extrabold">IP</th>
                <th className="px-4 py-3 font-extrabold">Lý do</th>
              </tr>
            </thead>
            <tbody>
              {loginLogs.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">Chưa có log nào trong 24 giờ qua</td></tr>
              ) : loginLogs.map((log) => (
                <tr key={log.id} className="border-b border-border/40 hover:bg-brand-50/30">
                  <td className="px-4 py-2 text-xs text-muted">{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                  <td className="px-4 py-2 font-mono text-xs">{log.email ?? '—'}</td>
                  <td className="px-4 py-2"><OutcomeBadge outcome={log.outcome} /></td>
                  <td className="px-4 py-2 font-mono text-xs text-muted">{log.ipAddress ?? '—'}</td>
                  <td className="px-4 py-2 text-xs text-muted">{log.reason ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )

  // Users tab
  const usersTab = (
    <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
      <div className="ui-card overflow-hidden">
        {sectionHeader('Tài khoản')}
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 pb-3">
          <p className="text-xs font-bold uppercase text-muted">Lọc role:</p>
          <select className="min-h-9 rounded-xl border-2 border-border px-2 text-sm font-bold" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="student">student</option>
            <option value="parent">parent</option>
            <option value="teacher">teacher</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div className="overflow-x-auto">
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
                <tr key={u.id} className="border-b border-border/40">
                  <td className="px-4 py-3">
                    <p className="font-bold">{u.nickname ?? '—'}</p>
                    <p className="text-xs text-muted">{u.email ?? u.id.slice(0, 10)}</p>
                  </td>
                  <td className="px-4 py-3 font-bold capitalize">{u.role}</td>
                  <td className="px-4 py-3">
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-extrabold', u.active ? 'bg-mint-100 text-success' : 'bg-coral-100 text-danger')}>
                      {u.active ? 'Active' : 'Off'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button variant="secondary" className="!min-h-9 !px-3 !text-xs" onClick={() => void toggleActive(u)}>
                        {u.active ? 'Tắt' : 'Bật'}
                      </Button>
                      {u.active && (
                        <Button variant="ghost" className="!min-h-9 !px-3 !text-xs text-danger" onClick={() => setDeleteTarget(u)}>
                          Xóa
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <form className="ui-card flex h-fit flex-col gap-3 p-5" onSubmit={(e) => void createUser(e)}>
        <h2 className="font-display text-xl">Tạo tài khoản</h2>
        <label className="flex flex-col gap-1 text-sm font-bold">
          Vai trò
          <select className="min-h-11 rounded-xl border-2 border-border px-3" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as typeof form.role }))}>
            <option value="teacher">Giảng viên</option>
            <option value="parent">Phụ huynh</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold">
          Email
          <input type="email" required className="min-h-11 rounded-xl border-2 border-border px-3" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold">
          Mật khẩu
          <input type="password" required minLength={8} className="min-h-11 rounded-xl border-2 border-border px-3" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold">
          Tên hiển thị
          <input className="min-h-11 rounded-xl border-2 border-border px-3" value={form.nickname} onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))} />
        </label>
        <Button type="submit">Tạo tài khoản</Button>
      </form>
    </div>
  )

  // Sessions tab
  const sessionsTab = (
    <>
      {sectionHeader('Phiên đăng nhập', 'Thu hồi phiên buộc đăng nhập lại. Không hiển thị token thô.')}
      <div className="ui-card overflow-hidden">
        <div className="overflow-x-auto">
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
              {sessions.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">Không có phiên active</td></tr>
              ) : sessions.map((s) => (
                <tr key={s.id} className="border-b border-border/40">
                  <td className="px-4 py-3">
                    <p className="font-bold">{s.nickname ?? '—'}</p>
                    <p className="text-xs text-muted">{s.email ?? s.userId.slice(0, 8)}</p>
                  </td>
                  <td className="px-4 py-3 font-bold capitalize">{s.role}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{s.ipAddress ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted">{new Date(s.expiresAt).toLocaleString('vi-VN')}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="secondary" className="!min-h-9 !px-3 !text-xs" onClick={() => setRevokeTarget(s)}>
                      Thu hồi
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )

  // Courses tab
  const coursesTab = (
    <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
      <div className="flex flex-col gap-3">
        {sectionHeader('Khóa học', 'Quản lý catalog khóa học từ admin')}
        {courses.map((c) => (
          <div key={c.id} className="ui-card p-4">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-display text-lg">{c.title}</h2>
                <p className="text-xs text-muted">{c.id}{c.ageTrack ? ` · ${c.ageTrack}` : ''}{c.courseKey ? ` · ${c.courseKey}` : ''}{c.enrollmentCount != null ? ` · ${c.enrollmentCount} enroll` : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('rounded-full px-3 py-0.5 text-xs font-extrabold', c.status === 'open' ? 'bg-mint-100 text-success' : 'bg-sun-100 text-warning')}>
                  {c.status} · {c.questCount} bài
                </span>
                <Button variant="secondary" className="!min-h-8 !px-3 !text-xs" onClick={() => void setCourseStatus(c.id, c.status === 'open' ? 'soon' : 'open')}>
                  {c.status === 'open' ? '→ soon' : '→ open'}
                </Button>
              </div>
            </div>
            <ul className="space-y-1 text-sm">
              {c.quests.map((q) => (
                <li key={q.id} className={cn('flex flex-wrap items-center justify-between gap-2 rounded-xl bg-brand-50/60 px-3 py-1.5', q.archived ? 'opacity-50' : '')}>
                  <span className="font-bold">#{q.order} {q.title}{q.archived ? ' [ẩn]' : ''}</span>
                  <span className="max-w-[200px] truncate text-xs text-muted">{q.videoUrl ? `🎬 ${q.videoUrl}` : 'Chưa có video'}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <form className="ui-card flex h-fit flex-col gap-3 p-5" onSubmit={(e) => void createCourse(e)}>
        <h2 className="font-display text-xl">Tạo khóa (admin)</h2>
        <input className="min-h-10 rounded-xl border-2 border-border px-3 font-mono text-sm" placeholder="id-slug (vd l1-k7-demo)" value={newCourse.id} onChange={(e) => setNewCourse((c) => ({ ...c, id: e.target.value.toLowerCase() }))} required pattern="[a-z0-9-]+" />
        <input className="min-h-10 rounded-xl border-2 border-border px-3" placeholder="Tiêu đề" value={newCourse.title} onChange={(e) => setNewCourse((c) => ({ ...c, title: e.target.value }))} required />
        <input className="min-h-10 rounded-xl border-2 border-border px-3" placeholder="Tên ngắn" value={newCourse.shortTitle} onChange={(e) => setNewCourse((c) => ({ ...c, shortTitle: e.target.value }))} required />
        <input className="min-h-10 rounded-xl border-2 border-border px-3" placeholder="Tagline" value={newCourse.tagline} onChange={(e) => setNewCourse((c) => ({ ...c, tagline: e.target.value }))} required />
        <textarea className="min-h-20 rounded-xl border-2 border-border px-3 py-2 text-sm" placeholder="Mô tả" value={newCourse.description} onChange={(e) => setNewCourse((c) => ({ ...c, description: e.target.value }))} required />
        <div className="grid grid-cols-2 gap-2">
          <select className="min-h-10 rounded-xl border-2 border-border px-2 text-sm" value={newCourse.ageTrack} onChange={(e) => setNewCourse((c) => ({ ...c, ageTrack: e.target.value as 'L1' | 'L2' }))}>
            <option value="L1">L1 6–8 tuổi</option>
            <option value="L2">L2 9–11 tuổi</option>
          </select>
          <select className="min-h-10 rounded-xl border-2 border-border px-2 text-sm" value={newCourse.courseKey} onChange={(e) => setNewCourse((c) => ({ ...c, courseKey: e.target.value as typeof newCourse.courseKey }))}>
            {(['K1','K2','K3','K4','K5','K6'] as const).map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <select className="min-h-10 rounded-xl border-2 border-border px-2 text-sm" value={newCourse.status} onChange={(e) => setNewCourse((c) => ({ ...c, status: e.target.value as 'open' | 'soon' }))}>
          <option value="soon">soon (ẩn)</option>
          <option value="open">open (hiển thị)</option>
        </select>
        <Button type="submit">Tạo khóa</Button>
      </form>
    </div>
  )

  // AI tab (unchanged layout, just uses toast)
  const aiTab = (
    <div className="flex flex-col gap-5 max-w-3xl">
      {sectionHeader('AI Vidtory', 'Cấu hình API Key và phân tải model')}
      <div className="ui-card flex flex-col gap-4 p-5">
        <div>
          <h2 className="font-display text-xl">1. API Key Vidtory</h2>
          <p className="text-sm text-muted">Key mã hóa AES-GCM trên server — không trả full key về trình duyệt.</p>
        </div>
        <div className={cn('rounded-2xl p-3 text-sm', vidtoryStatus?.configured ? 'bg-mint-100' : 'bg-sun-100/60')}>
          <p className="font-bold">
            Trạng thái:{' '}
            {vidtoryStatus?.configured
              ? <span className="text-success">Đã cấu hình · {vidtoryStatus.maskedHint} · {vidtoryStatus.source}</span>
              : <span className="text-warning">Chưa có key</span>}
          </p>
        </div>
        <form className="flex flex-col gap-3" onSubmit={(e) => void saveVidtoryKey(e)}>
          <label className="flex flex-col gap-1 text-sm font-bold">
            API Key mới
            <input type="password" autoComplete="off" minLength={8} required placeholder="vidtory_…" className="min-h-11 rounded-xl border-2 border-border px-3 font-mono text-sm" value={vidtoryKey} onChange={(e) => setVidtoryKey(e.target.value)} />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit">Lưu key (mã hóa)</Button>
            {vidtoryStatus?.configured && <Button type="button" variant="secondary" onClick={() => void clearVidtoryKey()}>Xóa key</Button>}
          </div>
        </form>
      </div>
      <form className="ui-card flex flex-col gap-4 p-5" onSubmit={(e) => void saveRouting(e)}>
        <div>
          <h2 className="font-display text-xl">2. Model & phân tải (%)</h2>
          <p className="text-sm text-muted"><strong>Weight %</strong> chia giữa các <code className="text-xs">modelId</code>.</p>
        </div>
        <label className="flex flex-col gap-1 text-sm font-bold">
          Base URL
          <input className="min-h-11 rounded-xl border-2 border-border px-3 font-mono text-sm" value={routing.baseURL} onChange={(e) => setRouting((r) => ({ ...r, baseURL: e.target.value }))} placeholder="https://bapi.vidtory.net" />
        </label>
        {(['image', 'video'] as const).map((kind) => (
          <section key={kind} className="rounded-2xl border-2 border-border p-4">
            <h3 className="font-display text-lg text-brand-600 capitalize">{kind === 'image' ? '🖼 Ảnh' : '🎬 Video'}</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {kind === 'image' ? (
                <>
                  <label className="flex flex-col gap-1 text-sm font-bold">aspectRatio
                    <select className="min-h-11 rounded-xl border-2 border-border px-2" value={routing.image.aspectRatio} onChange={(e) => setRouting((r) => ({ ...r, image: { ...r.image, aspectRatio: e.target.value } }))}>
                      <option value="IMAGE_ASPECT_RATIO_SQUARE">SQUARE 1:1</option>
                      <option value="IMAGE_ASPECT_RATIO_LANDSCAPE">LANDSCAPE 16:9</option>
                      <option value="IMAGE_ASPECT_RATIO_PORTRAIT">PORTRAIT 9:16</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-bold">resolution
                    <select className="min-h-11 rounded-xl border-2 border-border px-2" value={routing.image.resolution} onChange={(e) => setRouting((r) => ({ ...r, image: { ...r.image, resolution: e.target.value } }))}>
                      <option value="1K">1K</option><option value="2K">2K</option><option value="4K">4K</option>
                    </select>
                  </label>
                </>
              ) : (
                <>
                  <label className="flex flex-col gap-1 text-sm font-bold">aspectRatio
                    <select className="min-h-11 rounded-xl border-2 border-border px-2" value={routing.video.aspectRatio} onChange={(e) => setRouting((r) => ({ ...r, video: { ...r.video, aspectRatio: e.target.value } }))}>
                      <option value="VIDEO_ASPECT_RATIO_LANDSCAPE">LANDSCAPE 16:9</option>
                      <option value="VIDEO_ASPECT_RATIO_PORTRAIT">PORTRAIT 9:16</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-bold">duration (giây)
                    <input type="number" min={1} max={30} className="min-h-11 rounded-xl border-2 border-border px-2" value={routing.video.duration} onChange={(e) => setRouting((r) => ({ ...r, video: { ...r.video, duration: Number(e.target.value) || 6 } }))} />
                  </label>
                </>
              )}
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {routing[kind].models.map((m, i) => (
                <div key={`${kind}-${i}`} className="grid gap-2 rounded-xl bg-brand-50/60 p-2 sm:grid-cols-[1fr_1fr_80px_70px_auto]">
                  <input className="min-h-10 rounded-lg border border-border px-2 font-mono text-xs" placeholder="modelId" value={m.modelId} onChange={(e) => updateModel(kind, i, { modelId: e.target.value })} />
                  <input className="min-h-10 rounded-lg border border-border px-2 text-sm" placeholder="Nhãn" value={m.label ?? ''} onChange={(e) => updateModel(kind, i, { label: e.target.value })} />
                  <input type="number" min={0} className="min-h-10 rounded-lg border border-border px-2 text-sm" title="Weight" value={m.weight} onChange={(e) => updateModel(kind, i, { weight: Number(e.target.value) })} />
                  <span className="flex items-center justify-center text-xs font-extrabold text-brand-600">{m.percent != null ? `${m.percent}%` : '—'}</span>
                  <Button type="button" variant="ghost" className="!min-h-10 !px-2 !text-xs" onClick={() => removeModel(kind, i)}>Xóa</Button>
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={() => addModel(kind)}>+ Model {kind === 'image' ? 'ảnh' : 'video'}</Button>
            </div>
          </section>
        ))}
        <Button type="submit">Lưu phân tải model</Button>
      </form>
    </div>
  )

  const tabContent = () => {
    if (loading) return loadingEl
    switch (tab) {
      case 'system': return systemTab
      case 'analytics': return analyticsTab
      case 'logs': return logsTab
      case 'users': return usersTab
      case 'sessions': return sessionsTab
      case 'courses': return coursesTab
      case 'ai': return aiTab
      default: return null
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">CMS · Quản trị</p>
          <h1 className="font-display text-2xl text-text">
            {tab === 'system' ? 'Hệ thống & tài khoản'
              : tab === 'analytics' ? 'Analytics'
              : tab === 'logs' ? 'Login Logs'
              : tab === 'ai' ? 'AI Vidtory'
              : tab === 'users' ? 'Tài khoản'
              : tab === 'sessions' ? 'Phiên đăng nhập'
              : 'Khóa học'}
          </h1>
        </div>
        <Button
          variant="ghost"
          onClick={async () => { await logout(); navigate('/') }}
        >
          Đăng xuất
        </Button>
      </div>

      {/* Tab content */}
      {tabContent()}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={`Soft-delete "${deleteTarget?.email ?? deleteTarget?.nickname}"?`}
        description="Tài khoản sẽ bị vô hiệu hóa và tất cả phiên đăng nhập bị thu hồi."
        confirmLabel="Xóa"
        danger
        onConfirm={() => void softDeleteUser()}
        onCancel={() => setDeleteTarget(null)}
      />
      <ConfirmDialog
        open={!!revokeTarget}
        title={`Thu hồi phiên của "${revokeTarget?.nickname ?? revokeTarget?.email}"?`}
        description="Người dùng sẽ bị đăng xuất ngay lập tức."
        confirmLabel="Thu hồi"
        danger
        onConfirm={() => void revokeSession()}
        onCancel={() => setRevokeTarget(null)}
      />
    </div>
  )
}
