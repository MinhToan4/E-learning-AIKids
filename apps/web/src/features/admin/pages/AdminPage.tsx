/**
 * AdminPage ΓÇö Full redesign with:
 * - Route-controlled tabs (prop `tab` from App.tsx routes)
 * - Toast popup notifications (no inline messages)
 * - ConfirmDialog (no browser confirm())
 * - Charts: ASCII mini-bars for analytics (no extra deps)
 * - Login audit log with auto-purge indicator
 * - Full-width layout (CmsShell handles sidebar)
 */
import { useEffect, useRef, useState, useCallback, useMemo, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { Paginator } from '@/shared/components/ui/Paginator'
import { useToast } from '@/shared/hooks/useToast'
import { usePagination } from '@/shared/hooks/usePagination'
import { api } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { cn } from '@/shared/lib/cn'
import {
  CmsAiIcon,
  CmsAnalyticsIcon,
  CmsClassesIcon,
  CmsCoursesIcon,
  CmsLecturesIcon,
  CmsLogsIcon,
  CmsSessionsIcon,
  CmsUsersIcon,
} from '@/shared/components/icons/CmsIcons'

// ΓöÇΓöÇ Types ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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
  trends: Array<{
    date: string
    newUsers: number
    completedQuests: number
    projects: number
  }>
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

const ROLE_LABELS: Record<string, string> = {
  student: 'Hß╗ìc sinh',
  parent: 'Phß╗Ñ huynh',
  teacher: 'Giß║úng vi├¬n',
  admin: 'Quß║ún trß╗ï vi├¬n',
}

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

// ΓöÇΓöÇ Mini bar chart (no deps) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function MiniBar({ value, max, color = 'bg-brand-500', label }: { value: number; max: number; color?: string; label: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      {/* w-20 on mobile, w-28 on sm+ ΓÇö truncate prevents overflow on 320px */}
      <span className="w-20 truncate text-xs text-muted sm:w-28">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-brand-100">
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right text-xs font-extrabold">{value}</span>
    </div>
  )
}

function TrendChart({ rows }: { rows: Analytics['trends'] }) {
  const width = 700
  const height = 230
  const padX = 38
  const padY = 24
  const max = Math.max(
    1,
    ...rows.flatMap((row) => [row.newUsers, row.completedQuests, row.projects]),
  )
  const x = (index: number) =>
    padX + (index * (width - padX * 2)) / Math.max(1, rows.length - 1)
  const y = (value: number) =>
    height - padY - (value * (height - padY * 2)) / max
  const points = (key: 'newUsers' | 'completedQuests' | 'projects') =>
    rows.map((row, index) => `${x(index)},${y(row[key])}`).join(' ')
  const series = [
    { key: 'completedQuests' as const, label: 'B├ái ho├án th├ánh', color: '#6d5efc' },
    { key: 'newUsers' as const, label: 'T├ái khoß║ún mß╗¢i', color: '#37b9d5' },
    { key: 'projects' as const, label: 'Sß║ún phß║⌐m mß╗¢i', color: '#39a77e' },
  ]

  return (
    <div className="ui-card p-5 lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide text-muted">
            Nhß╗ïp hoß║ít ─æß╗Öng 14 ng├áy
          </p>
          <p className="mt-1 text-xs text-muted">
            Theo d├╡i hß╗ìc tß║¡p, t─âng tr╞░ß╗ƒng v├á sß║ún phß║⌐m tr├¬n c├╣ng mß╗Öt trß╗Ñc thß╗¥i gian.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-bold">
          {series.map((item) => (
            <span key={item.key} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-page p-6 text-center text-sm text-muted">
          Ch╞░a c├│ dß╗» liß╗çu theo ng├áy.
        </p>
      ) : (
        <div className="mt-4 w-full">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="block h-auto w-full"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Biß╗âu ─æß╗ô hoß║ít ─æß╗Öng hß╗ç thß╗æng trong 14 ng├áy gß║ºn nhß║Ñt"
          >
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const lineY = padY + ratio * (height - padY * 2)
              const value = Math.round(max * (1 - ratio))
              return (
                <g key={ratio}>
                  <line x1={padX} y1={lineY} x2={width - padX} y2={lineY} stroke="#e8e5f2" strokeWidth="1" />
                  <text x={padX - 8} y={lineY + 4} textAnchor="end" fontSize="10" fill="#726f80">{value}</text>
                </g>
              )
            })}
            {series.map((item) => (
              <polyline
                key={item.key}
                points={points(item.key)}
                fill="none"
                stroke={item.color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {rows.map((row, index) =>
              series.map((item) => (
                <circle key={`${row.date}-${item.key}`} cx={x(index)} cy={y(row[item.key])} r="4" fill="white" stroke={item.color} strokeWidth="3">
                  <title>{`${row.date} ┬╖ ${item.label}: ${row[item.key]}`}</title>
                </circle>
              )),
            )}
            {[...new Set([0, Math.floor((rows.length - 1) / 2), rows.length - 1])].map((index) => (
              <text key={index} x={x(index)} y={height - 3} textAnchor="middle" fontSize="10" fill="#726f80">
                {new Date(`${rows[index].date}T00:00:00`).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
              </text>
            ))}
          </svg>
        </div>
      )}
    </div>
  )
}

// ΓöÇΓöÇ Stat card ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function StatCard({ label, value, icon, sub }: { label: string; value: number | string; icon: ReactNode; sub?: string }) {
  return (
    <div className="ui-card flex flex-col gap-1 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
        <span aria-hidden="true">{icon}</span>
      </div>
      <p className="font-display text-3xl text-brand-600">{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  )
}

// ΓöÇΓöÇ Outcome badge ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function OutcomeBadge({ outcome }: { outcome: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    success: { label: 'Th├ánh c├┤ng', cls: 'bg-mint-100 text-success' },
    failed: { label: 'Thß║Ñt bß║íi', cls: 'bg-coral-100 text-danger' },
    locked: { label: 'Bß╗ï kh├│a', cls: 'bg-sun-100 text-warning' },
  }
  const style = map[outcome] ?? { label: outcome, cls: 'bg-brand-100 text-brand-600' }
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-extrabold', style.cls)}>{style.label}</span>
  )
}

// ΓöÇΓöÇ Main component ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<SessionRow | null>(null)
  // Inline edit state ΓÇö tracks which user row is open for editing
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null)
  const [editForm, setEditForm] = useState({ nickname: '', role: 'student' as AdminUser['role'], email: '', newPassword: '' })

  // ΓöÇΓöÇ Search / filter state ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const [userSearch, setUserSearch] = useState('')
  const [userActiveFilter, setUserActiveFilter] = useState<'' | 'active' | 'inactive'>('')
  const [sessionSearch, setSessionSearch] = useState('')
  const [logSearch, setLogSearch] = useState('')
  const [courseSearch, setCourseSearch] = useState('')
  const [courseStatusFilter, setCourseStatusFilter] = useState<'' | 'open' | 'soon'>('')

  const { toasts, showToast, dismissToast } = useToast()
  const logout = useAuth((s) => s.logout)
  const navigate = useNavigate()

  // ΓöÇΓöÇ Filtered arrays (client-side) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const filteredUsers = useMemo(() => {
    let list = users
    if (roleFilter) list = list.filter((u) => u.role === roleFilter)
    if (userActiveFilter === 'active') list = list.filter((u) => u.active)
    if (userActiveFilter === 'inactive') list = list.filter((u) => !u.active)
    if (userSearch) {
      const q = userSearch.toLowerCase()
      list = list.filter(
        (u) => u.nickname?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q),
      )
    }
    return list
  }, [users, roleFilter, userActiveFilter, userSearch])

  const filteredSessions = useMemo(() => {
    if (!sessionSearch) return sessions
    const q = sessionSearch.toLowerCase()
    return sessions.filter(
      (s) =>
        s.nickname?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.role?.toLowerCase().includes(q) ||
        (s.ipAddress ?? '').includes(q),
    )
  }, [sessions, sessionSearch])

  const filteredLogs = useMemo(() => {
    let list = loginLogs
    if (logFilter) list = list.filter((l) => l.outcome === logFilter)
    if (logSearch) {
      const q = logSearch.toLowerCase()
      list = list.filter(
        (l) =>
          (l.email ?? '').toLowerCase().includes(q) ||
          (l.ipAddress ?? '').includes(q),
      )
    }
    return list
  }, [loginLogs, logFilter, logSearch])

  const filteredCourses = useMemo(() => {
    let list = courses
    if (courseStatusFilter) list = list.filter((c) => c.status === courseStatusFilter)
    if (courseSearch) {
      const q = courseSearch.toLowerCase()
      list = list.filter(
        (c) => c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q),
      )
    }
    return list
  }, [courses, courseSearch, courseStatusFilter])

  // ΓöÇΓöÇ Pagination ΓÇö one hook per data-heavy tab ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const usersPag = usePagination(filteredUsers, 15)
  const sessionsPag = usePagination(filteredSessions, 15)
  const logsPag = usePagination(filteredLogs, 20)
  const coursesPag = usePagination(filteredCourses, 8)

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
      showToast(e instanceof Error ? e.message : 'Kh├┤ng tß║úi ─æ╞░ß╗úc dß╗» liß╗çu', 'error')
    } finally {
      setLoading(false)
    }
  }, [tab, roleFilter, logFilter, showToast])

  useEffect(() => { void load() }, [load])

  // ΓöÇΓöÇ Handlers ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  async function saveVidtoryKey(e: React.FormEvent) {
    e.preventDefault()
    try {
      const data = await api<{ configured: boolean; maskedHint: string }>('/api/admin/settings/vidtory', { method: 'PUT', body: JSON.stringify({ apiKey: vidtoryKey.trim() }) })
      setVidtoryKey('')
      setVidtoryStatus({ configured: data.configured, maskedHint: data.maskedHint, source: 'database' })
      showToast('─É├ú l╞░u API key Vidtory (m├ú h├│a ph├¡a server)', 'success')
    } catch (e) { showToast(e instanceof Error ? e.message : 'Kh├┤ng l╞░u ─æ╞░ß╗úc key', 'error') }
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
      showToast('─É├ú l╞░u ph├ón tß║úi model AI', 'success')
    } catch (e) { showToast(e instanceof Error ? e.message : 'Kh├┤ng l╞░u ─æ╞░ß╗úc routing', 'error') }
  }

  async function clearVidtoryKey() {
    try {
      await api('/api/admin/settings/vidtory', { method: 'DELETE' })
      setVidtoryStatus({ configured: false, maskedHint: null, source: 'none' })
      showToast('─É├ú x├│a API key Vidtory', 'success')
    } catch (e) { showToast(e instanceof Error ? e.message : 'Kh├┤ng x├│a ─æ╞░ß╗úc', 'error') }
  }

  function updateModel(kind: 'image' | 'video', index: number, patch: Partial<ModelRow>) {
    setRouting((r) => { const models = [...r[kind].models]; models[index] = { ...models[index]!, ...patch }; return { ...r, [kind]: { ...r[kind], models } } })
  }
  function addModel(kind: 'image' | 'video') {
    setRouting((r) => ({ ...r, [kind]: { ...r[kind], models: [...r[kind].models, { modelId: kind === 'image' ? 'model-id-moi' : 'veo-model-id', weight: 0, label: 'Model mß╗¢i', enabled: true }] } }))
  }
  function removeModel(kind: 'image' | 'video', index: number) {
    setRouting((r) => ({ ...r, [kind]: { ...r[kind], models: r[kind].models.filter((_, i) => i !== index) } }))
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api('/api/admin/users', { method: 'POST', body: JSON.stringify(form) })
      showToast('─É├ú tß║ío t├ái khoß║ún th├ánh c├┤ng', 'success')
      setForm({ role: 'teacher', email: '', password: '', nickname: '' })
      await load()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Lß╗ùi tß║ío user', 'error') }
  }

  async function toggleActive(u: AdminUser) {
    try {
      await api(`/api/admin/users/${u.id}`, { method: 'PATCH', body: JSON.stringify({ active: !u.active }) })
      showToast(u.active ? '─É├ú v├┤ hiß╗çu h├│a t├ái khoß║ún' : '─É├ú k├¡ch hoß║ít lß║íi t├ái khoß║ún', 'success')
      // Close edit panel if it was open for this user ΓÇö data will be refreshed
      if (editTarget?.id === u.id) setEditTarget(null)
      await load()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Lß╗ùi cß║¡p nhß║¡t', 'error') }
  }

  async function softDeleteUser() {
    if (!deleteTarget) return
    try {
      await api(`/api/admin/users/${deleteTarget.id}`, { method: 'DELETE' })
      showToast('─É├ú soft-delete user + thu hß╗ôi phi├¬n', 'success')
      // Close edit panel if the deleted user was open for editing
      if (editTarget?.id === deleteTarget.id) setEditTarget(null)
      setDeleteTarget(null)
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lß╗ùi x├│a', 'error')
      setDeleteTarget(null)
    }
  }

  async function revokeSession() {
    if (!revokeTarget) return
    try {
      await api(`/api/admin/sessions/${revokeTarget.id}`, { method: 'DELETE' })
      showToast('─É├ú thu hß╗ôi phi├¬n ─æ─âng nhß║¡p', 'success')
      setRevokeTarget(null)
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lß╗ùi revoke', 'error')
      setRevokeTarget(null)
    }
  }

  async function setCourseStatus(id: string, status: 'open' | 'soon') {
    try {
      await api(`/api/admin/courses/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      showToast(`Kh├│a hß╗ìc ΓåÆ ${status === 'open' ? 'Mß╗ƒ' : 'ß║¿n'}`, 'success')
      await load()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Lß╗ùi cß║¡p nhß║¡t kh├│a', 'error') }
  }

  async function patchUser(e: React.FormEvent) {
    e.preventDefault()
    if (!editTarget) return
    try {
      await api(`/api/admin/users/${editTarget.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          nickname: editForm.nickname.trim() || undefined,
          role: editForm.role,
          // Only send email if changed (non-empty and different from current)
          email: editForm.email.trim() && editForm.email.trim() !== editTarget.email
            ? editForm.email.trim().toLowerCase()
            : undefined,
          // Only send password if admin typed a new one
          password: editForm.newPassword.trim() || undefined,
        }),
      })
      showToast('─É├ú cß║¡p nhß║¡t t├ái khoß║ún', 'success')
      setEditTarget(null)
      await load()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Lß╗ùi cß║¡p nhß║¡t', 'error') }
  }

  async function purgeLogs() {
    try {
      const data = await api<{ deleted: number; message: string }>('/api/admin/login-logs', { method: 'DELETE' })
      showToast(data.message, 'success')
      await load()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Lß╗ùi purge', 'error') }
  }

  // ΓöÇΓöÇ Tab content renderers ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const loadingEl = (
    <div className="flex h-40 items-center justify-center">
      <div className="ui-skeleton h-10 w-48 rounded-2xl" />
    </div>
  )

  // System tab
  const systemTab = system && (
    <>
      <section className="ui-card mb-4 p-5" aria-labelledby="admin-attention-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">╞»u ti├¬n h├┤m nay</p>
            <h3 id="admin-attention-title" className="mt-1 font-display text-xl text-text">Viß╗çc cß║ºn xß╗¡ l├╜</h3>
          </div>
          <p className="text-xs text-muted">Cß║¡p nhß║¡t {new Date(system.time).toLocaleString('vi-VN')}</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <button type="button" className="min-h-24 rounded-2xl border-2 border-border bg-white p-4 text-left transition hover:border-brand-300 hover:bg-brand-50" onClick={() => navigate('/admin/users')}>
            <span className="flex items-center gap-2 font-bold text-text"><CmsUsersIcon /> T├ái khoß║ún chß╗¥ duyß╗çt</span>
            <span className="mt-2 block text-2xl font-display text-brand-600">{system.counts.pendingApprovals}</span>
            <span className="mt-1 block text-xs text-muted">Xem v├á xß╗¡ l├╜ t├ái khoß║ún mß╗¢i</span>
          </button>
          <button type="button" className="min-h-24 rounded-2xl border-2 border-border bg-white p-4 text-left transition hover:border-brand-300 hover:bg-brand-50" onClick={() => navigate('/admin/logs')}>
            <span className="flex items-center gap-2 font-bold text-text"><CmsLogsIcon /> Kiß╗âm tra ─æ─âng nhß║¡p</span>
            <span className="mt-2 block text-sm font-bold text-brand-600">Xem sß╗▒ cß╗æ trong 24 giß╗¥</span>
            <span className="mt-1 block text-xs text-muted">T├¼m ─æ─âng nhß║¡p thß║Ñt bß║íi hoß║╖c bß╗ï kh├│a</span>
          </button>
          <button type="button" className={cn('min-h-24 rounded-2xl border-2 p-4 text-left transition', system.vidtory?.configured ? 'border-mint-200 bg-mint-100/50 hover:bg-mint-100' : 'border-sun-200 bg-sun-50 hover:bg-sun-100')} onClick={() => navigate('/admin/ai')}>
            <span className="flex items-center gap-2 font-bold text-text"><CmsAiIcon /> Dß╗ïch vß╗Ñ tß║ío nß╗Öi dung AI</span>
            <span className={cn('mt-2 block text-sm font-bold', system.vidtory?.configured ? 'text-success' : 'text-warning')}>{system.vidtory?.configured ? '─É├ú kß║┐t nß╗æi' : 'Cß║ºn cß║Ñu h├¼nh'}</span>
            <span className="mt-1 block text-xs text-muted">Mß╗ƒ phß║ºn thiß║┐t lß║¡p v├á kiß╗âm tra kß║┐t nß╗æi</span>
          </button>
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[
          { label: 'Kh├│a hß╗ìc', value: system.counts.courses, icon: <CmsCoursesIcon /> },
          { label: 'B├ái hß╗ìc', value: system.counts.quests, icon: <CmsLecturesIcon /> },
          { label: 'Lß╗¢p hß╗ìc', value: system.counts.classes, icon: <CmsClassesIcon /> },
          { label: 'Phi├¬n ─æang hoß║ít ─æß╗Öng', value: system.counts.activeSessions, icon: <CmsSessionsIcon /> },
          { label: 'T├ái khoß║ún chß╗¥ duyß╗çt', value: system.counts.pendingApprovals, icon: <CmsUsersIcon /> },
        ].map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="ui-card p-5">
          <p className="mb-4 text-sm font-extrabold uppercase tracking-wide text-muted">Ng╞░ß╗¥i d├╣ng theo vai tr├▓</p>
          <div className="flex flex-col gap-3">
            {Object.entries(system.counts.usersByRole).map(([role, n]) => {
              const max = Math.max(...Object.values(system.counts.usersByRole))
              const colorMap: Record<string, string> = { student: 'bg-brand-500', teacher: 'bg-sky-400', parent: 'bg-mint-400', admin: 'bg-coral-400' }
              return <MiniBar key={role} label={ROLE_LABELS[role] ?? role} value={n} max={max} color={colorMap[role] ?? 'bg-brand-500'} />
            })}
          </div>
        </div>
        <div className="ui-card p-5">
          <p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-muted">Vidtory AI</p>
          <div className={cn('flex items-center gap-3 rounded-2xl p-3', system.vidtory?.configured ? 'bg-mint-100' : 'bg-sun-100')}>
            <CmsAiIcon size={28} />
            <div>
              <p className="font-bold">{system.vidtory?.configured ? `─É├ú cß║Ñu h├¼nh ┬╖ ${system.vidtory.maskedHint ?? 'ΓÇóΓÇóΓÇóΓÇó'}` : 'Ch╞░a cß║Ñu h├¼nh'}</p>
              <p className="text-xs text-muted">{system.vidtory?.configured ? `Nguß╗ôn: ${system.vidtory.source}` : 'V├áo tab AI Vidtory ─æß╗â thiß║┐t lß║¡p'}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">Cß║¡p nhß║¡t: {new Date(system.time).toLocaleString('vi-VN')} ┬╖ {system.service}</p>
        </div>
      </div>
    </>
  )

  // Analytics tab
  const analyticsTab = analytics && (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ng╞░ß╗¥i d├╣ng hoß║ít ─æß╗Öng" value={analytics.users.active} icon={<CmsUsersIcon />} />
        <StatCard label="Kh├│a hß╗ìc ─æang mß╗ƒ" value={analytics.courses.open} icon={<CmsCoursesIcon />} />
        <StatCard label="Phi├¬n ─æang hoß║ít ─æß╗Öng" value={analytics.sessions.active} icon={<CmsSessionsIcon />} />
        <StatCard label="L╞░ß╗út tham gia kh├│a" value={analytics.learning.enrollments} icon={<CmsAnalyticsIcon />} />
        <StatCard label="B├ái hß╗ìc ─æang d├╣ng" value={analytics.quests.active} icon={<CmsLecturesIcon />} />
        <StatCard label="B├ái hß╗ìc ─æang ß║⌐n" value={analytics.quests.archived} icon={<CmsLecturesIcon />} />
        <StatCard label="Trß║ím ─æ├ú ho├án th├ánh" value={analytics.learning.completedProgress} icon={<CmsAnalyticsIcon />} />
        <StatCard label="Sß║ún phß║⌐m hß╗ìc tß║¡p" value={analytics.learning.projects} icon={<CmsCoursesIcon />} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <TrendChart rows={analytics.trends ?? []} />
        <div className="ui-card p-5">
          <p className="mb-4 text-sm font-extrabold uppercase tracking-wide text-muted">Ng╞░ß╗¥i d├╣ng theo vai tr├▓</p>
          <div className="flex flex-col gap-3">
            {Object.entries(analytics.users.byRole).map(([role, n]) => {
              const max = Math.max(...Object.values(analytics.users.byRole))
              const colorMap: Record<string, string> = { student: 'bg-brand-500', teacher: 'bg-sky-400', parent: 'bg-mint-400', admin: 'bg-coral-400' }
              return <MiniBar key={role} label={ROLE_LABELS[role] ?? role} value={n} max={max} color={colorMap[role] ?? 'bg-brand-500'} />
            })}
          </div>
        </div>
        <div className="ui-card p-5">
          <p className="mb-4 text-sm font-extrabold uppercase tracking-wide text-muted">Hß╗ìc tß║¡p</p>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Ho├án th├ánh trß║ím', value: analytics.learning.completedProgress },
              { label: 'L╞░ß╗út tham gia kh├│a', value: analytics.learning.enrollments },
              { label: 'Dß╗▒ ├ín', value: analytics.learning.projects },
            ].map((item) => {
              const max = Math.max(analytics.learning.completedProgress, analytics.learning.enrollments, analytics.learning.projects, 1)
              return <MiniBar key={item.label} label={item.label} value={item.value} max={max} color="bg-mint-400" />
            })}
          </div>
          <p className="mt-3 text-xs text-muted">Cß║¡p nhß║¡t: {new Date(analytics.time).toLocaleString('vi-VN')}</p>
        </div>
      </div>
    </>
  )

  // Login logs tab
  const logsTab = (
    <>
      {logSummary && (
        <div className="mb-4 grid gap-3 sm:grid-cols-4">
          <StatCard label="Tß╗òng trong 24 giß╗¥" value={logSummary.total} icon={<CmsLogsIcon />} />
          <StatCard label="Th├ánh c├┤ng" value={logSummary.byOutcome['success'] ?? 0} icon={<CmsSessionsIcon />} />
          <StatCard label="Thß║Ñt bß║íi" value={logSummary.byOutcome['failed'] ?? 0} icon={<CmsLogsIcon />} />
          <StatCard label="Bß╗ï kh├│a" value={logSummary.byOutcome['locked'] ?? 0} icon={<CmsSessionsIcon />} />
        </div>
      )}
      <div className="ui-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-4 py-3">
          <div className="relative flex-1 min-w-[180px]">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">≡ƒöì</span>
            <input
              type="search"
              placeholder="T├¼m email, IP..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="w-full min-h-11 rounded-xl border-2 border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-400"
            />
          </div>
          <select
            className="min-h-11 rounded-xl border-2 border-border px-3 text-sm font-bold"
            value={logFilter}
            onChange={(e) => setLogFilter(e.target.value)}
          >
            <option value="">Tß║Ñt cß║ú kß║┐t quß║ú</option>
            <option value="success">Γ£à Th├ánh c├┤ng</option>
            <option value="failed">Γ¥î Thß║Ñt bß║íi</option>
            <option value="locked">≡ƒöÆ Bß╗ï kh├│a</option>
          </select>
          <Button variant="secondary" onClick={() => void load()}>L├ám mß╗¢i</Button>
          <Button variant="ghost" className="text-muted" onClick={() => void purgeLogs()}>X├│a nhß║¡t k├╜ c┼⌐</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="border-b border-border bg-brand-50/80">
              <tr>
                <th className="px-4 py-3 font-extrabold">Thß╗¥i gian</th>
                <th className="px-4 py-3 font-extrabold">Email</th>
                <th className="px-4 py-3 font-extrabold">Kß║┐t quß║ú</th>
                <th className="px-4 py-3 font-extrabold">IP</th>
                <th className="px-4 py-3 font-extrabold">L├╜ do</th>
              </tr>
            </thead>
            <tbody>
              {logsPag.slice.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">{loginLogs.length === 0 ? 'Ch╞░a c├│ log n├áo trong 24 giß╗¥ qua' : 'Kh├┤ng c├│ log khß╗¢p bß╗Ö lß╗ìc'}</td></tr>
              ) : logsPag.slice.map((log) => (
                <tr key={log.id} className="border-b border-border/40 hover:bg-brand-50/30">
                  <td className="px-4 py-2 text-xs text-muted">{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                  <td className="px-4 py-2 font-mono text-xs">{log.email ?? 'ΓÇö'}</td>
                  <td className="px-4 py-2"><OutcomeBadge outcome={log.outcome} /></td>
                  <td className="px-4 py-2 font-mono text-xs text-muted">{log.ipAddress ?? 'ΓÇö'}</td>
                  <td className="px-4 py-2 text-xs text-muted">{log.reason ?? 'ΓÇö'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Paginator
          page={logsPag.page} totalPages={logsPag.totalPages}
          totalItems={filteredLogs.length} pageSize={20}
          onPrev={logsPag.prev} onNext={logsPag.next} onGoTo={logsPag.goTo}
        />
      </div>
    </>
  )

  // Users tab

  const usersTab = (
    <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
      <div className="ui-card overflow-hidden">
        {/* Professional filter bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
          {/* Text search */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">≡ƒöì</span>
            <input
              type="search"
              placeholder="T├¼m t├¬n, email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full min-h-11 rounded-xl border-2 border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-400"
            />
          </div>
          {/* Role filter */}
          <select className="min-h-11 rounded-xl border-2 border-border px-3 text-sm font-bold" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">Tß║Ñt cß║ú vai tr├▓</option>
            <option value="student">Hß╗ìc sinh</option>
            <option value="parent">Phß╗Ñ huynh</option>
            <option value="teacher">Giß║úng vi├¬n</option>
            <option value="admin">Quß║ún trß╗ï vi├¬n</option>
          </select>
          {/* Active filter */}
          <select className="min-h-11 rounded-xl border-2 border-border px-3 text-sm font-bold" value={userActiveFilter} onChange={(e) => setUserActiveFilter(e.target.value as '' | 'active' | 'inactive')}>
            <option value="">Tß║Ñt cß║ú trß║íng th├íi</option>
            <option value="active">Γ£à ─Éang hoß║ít ─æß╗Öng</option>
            <option value="inactive">Γ¥î V├┤ hiß╗çu h├│a</option>
          </select>
          {/* Result count badge */}
          {(userSearch || roleFilter || userActiveFilter) && (
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">
              {filteredUsers.length} / {users.length} t├ái khoß║ún
            </span>
          )}
          {/* Clear all */}
          {(userSearch || roleFilter || userActiveFilter) && (
            <button type="button" className="text-xs font-bold text-muted underline" onClick={() => { setUserSearch(''); setRoleFilter(''); setUserActiveFilter('') }}>X├│a bß╗Ö lß╗ìc</button>
          )}
          {/* Background reload indicator ΓÇö shown when reloading with existing data (stale-while-revalidate) */}
          {loading && users.length > 0 && (
            <span className="ml-auto text-xs font-bold text-brand-400 animate-pulse">─Éang cß║¡p nhß║¡tΓÇª</span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-border bg-brand-50/80">
              <tr>
                <th className="px-4 py-3 font-extrabold">Ng╞░ß╗¥i d├╣ng</th>
                <th className="px-4 py-3 font-extrabold">Vai tr├▓</th>
                <th className="px-4 py-3 font-extrabold">Trß║íng th├íi</th>
                <th className="px-4 py-3 font-extrabold" />
              </tr>
            </thead>
            <tbody>
              {usersPag.slice.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted">{users.length === 0 ? 'Kh├┤ng c├│ t├ái khoß║ún n├áo' : 'Kh├┤ng c├│ t├ái khoß║ún khß╗¢p bß╗Ö lß╗ìc'}</td></tr>
              ) : usersPag.slice.map((u) => (
                <tr key={u.id} className="border-b border-border/40">
                  <td className="px-4 py-3">
                    <p className="font-bold">{u.nickname ?? 'ΓÇö'}</p>
                    <p className="text-xs text-muted">{u.email ?? u.id.slice(0, 10)}</p>
                  </td>
                  <td className="px-4 py-3 font-bold">{ROLE_LABELS[u.role] ?? u.role}</td>
                  <td className="px-4 py-3">
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-extrabold', u.active ? 'bg-mint-100 text-success' : 'bg-coral-100 text-danger')}>
                      {u.active ? '─Éang hoß║ít ─æß╗Öng' : '─É├ú v├┤ hiß╗çu h├│a'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditTarget(u)
                          setEditForm({ nickname: u.nickname ?? '', role: u.role as AdminUser['role'], email: u.email ?? '', newPassword: '' })
                        }}
                      >
                        Sß╗¡a
                      </Button>
                      <Button variant="secondary" onClick={() => void toggleActive(u)}>
                        {u.active ? 'Tß║»t' : 'Bß║¡t'}
                      </Button>
                      {u.active && (
                        <Button variant="ghost" className="text-danger" onClick={() => setDeleteTarget(u)}>
                          X├│a
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Paginator
          page={usersPag.page} totalPages={usersPag.totalPages}
          totalItems={filteredUsers.length} pageSize={15}
          onPrev={usersPag.prev} onNext={usersPag.next} onGoTo={usersPag.goTo}
        />

      </div>
      <form className="ui-card flex h-fit flex-col gap-3 p-5" onSubmit={(e) => void createUser(e)}>
        <h2 className="font-display text-xl">Tß║ío t├ái khoß║ún</h2>
        <label className="flex flex-col gap-1 text-sm font-bold">
          Vai tr├▓
          <select className="min-h-11 rounded-xl border-2 border-border px-3" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as typeof form.role }))}>
            <option value="teacher">Giß║úng vi├¬n</option>
            <option value="parent">Phß╗Ñ huynh</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold">
          Email
          <input type="email" required className="min-h-11 rounded-xl border-2 border-border px-3" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold">
          Mß║¡t khß║⌐u
          <input type="password" required minLength={8} className="min-h-11 rounded-xl border-2 border-border px-3" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold">
          T├¬n hiß╗ân thß╗ï
          <input className="min-h-11 rounded-xl border-2 border-border px-3" value={form.nickname} onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))} />
        </label>
        <Button type="submit">Tß║ío t├ái khoß║ún</Button>
      </form>
    </div>
  )

  // Sessions tab
  const sessionsTab = (
    <>
      <div className="ui-card overflow-hidden">
        {/* Session search bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-4 py-3">
          <div className="relative flex-1 min-w-[220px]">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">≡ƒöì</span>
            <input
              type="search"
              placeholder="T├¼m t├¬n, email, IP..."
              value={sessionSearch}
              onChange={(e) => setSessionSearch(e.target.value)}
              className="w-full min-h-11 rounded-xl border-2 border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-400"
            />
          </div>
          {sessionSearch && (
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">
              {filteredSessions.length} / {sessions.length} phi├¬n
            </span>
          )}
          {sessionSearch && (
            <button type="button" className="text-xs font-bold text-muted underline" onClick={() => setSessionSearch('')}>X├│a</button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-brand-50/80">
              <tr>
                <th className="px-4 py-3 font-extrabold">User</th>
                <th className="px-4 py-3 font-extrabold">Role</th>
                <th className="px-4 py-3 font-extrabold">IP</th>
                <th className="px-4 py-3 font-extrabold">Hß║┐t hß║ín</th>
                <th className="px-4 py-3 font-extrabold" />
              </tr>
            </thead>
            <tbody>
              {sessionsPag.slice.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">{sessions.length === 0 ? 'Kh├┤ng c├│ phi├¬n active' : 'Kh├┤ng c├│ phi├¬n khß╗¢p bß╗Ö lß╗ìc'}</td></tr>
              ) : sessionsPag.slice.map((s) => (
                <tr key={s.id} className="border-b border-border/40">
                  <td className="px-4 py-3">
                    <p className="font-bold">{s.nickname ?? 'ΓÇö'}</p>
                    <p className="text-xs text-muted">{s.email ?? s.userId.slice(0, 8)}</p>
                  </td>
                  <td className="px-4 py-3 font-bold capitalize">{s.role}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{s.ipAddress ?? 'ΓÇö'}</td>
                  <td className="px-4 py-3 text-xs text-muted">{new Date(s.expiresAt).toLocaleString('vi-VN')}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="secondary" onClick={() => setRevokeTarget(s)}>
                      Thu hß╗ôi
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Paginator
            page={sessionsPag.page} totalPages={sessionsPag.totalPages}
            totalItems={filteredSessions.length} pageSize={15}
            onPrev={sessionsPag.prev} onNext={sessionsPag.next} onGoTo={sessionsPag.goTo}
          />
        </div>
      </div>
    </>
  )

  // Courses tab
  const coursesTab = (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col gap-3">
        {/* Course search + status filter bar */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-white px-4 py-3">
          <div className="relative flex-1 min-w-[200px]">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">≡ƒöì</span>
            <input
              type="search"
              placeholder="T├¼m t├¬n kh├│a hß╗ìc..."
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              className="w-full min-h-11 rounded-xl border-2 border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-400"
            />
          </div>
          <select className="min-h-11 rounded-xl border-2 border-border px-3 text-sm font-bold" value={courseStatusFilter} onChange={(e) => setCourseStatusFilter(e.target.value as '' | 'open' | 'soon')}>
            <option value="">Tß║Ñt cß║ú trß║íng th├íi</option>
            <option value="open">Γ£à ─Éang mß╗ƒ</option>
            <option value="soon">≡ƒöÆ ─Éang ß║⌐n</option>
          </select>
          {(courseSearch || courseStatusFilter) && (
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">{filteredCourses.length} kh├│a hß╗ìc</span>
          )}
          {(courseSearch || courseStatusFilter) && (
            <button type="button" className="text-xs font-bold text-muted underline" onClick={() => { setCourseSearch(''); setCourseStatusFilter('') }}>X├│a bß╗Ö lß╗ìc</button>
          )}
        </div>
        {coursesPag.slice.map((c) => (
          <div key={c.id} className="ui-card p-4">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-display text-lg">{c.title}</h2>
                <p className="text-xs text-muted">{c.ageTrack === 'L2' ? '10ΓÇô11 tuß╗òi' : '8ΓÇô9 tuß╗òi'}{c.courseKey ? ` ┬╖ Chß║╖ng ${c.courseKey}` : ''}{c.enrollmentCount != null ? ` ┬╖ ${c.enrollmentCount} l╞░ß╗út tham gia` : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('rounded-full px-3 py-0.5 text-xs font-extrabold', c.status === 'open' ? 'bg-mint-100 text-success' : 'bg-sun-100 text-warning')}>
                  {c.status === 'open' ? '─Éang mß╗ƒ' : '─Éang ß║⌐n'} ┬╖ {c.questCount} b├ái
                </span>
                <Button variant="secondary" onClick={() => void setCourseStatus(c.id, c.status === 'open' ? 'soon' : 'open')}>
                  {c.status === 'open' ? 'ß║¿n khß╗Åi hß╗ìc sinh' : 'Mß╗ƒ cho hß╗ìc sinh'}
                </Button>
              </div>
            </div>
            <ul className="space-y-1 text-sm">
              {c.quests.map((q) => (
                <li key={q.id} className={cn('flex flex-wrap items-center justify-between gap-2 rounded-xl bg-brand-50/60 px-3 py-1.5', q.archived ? 'opacity-50' : '')}>
                  <span className="font-bold">#{q.order} {q.title}{q.archived ? ' [ß║⌐n]' : ''}</span>
                  <span className="max-w-[200px] truncate text-xs text-muted">{q.videoUrl ? '─É├ú c├│ video' : 'Ch╞░a c├│ video'}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <Paginator
          page={coursesPag.page} totalPages={coursesPag.totalPages}
          totalItems={filteredCourses.length} pageSize={8}
          onPrev={coursesPag.prev} onNext={coursesPag.next} onGoTo={coursesPag.goTo}
          className="rounded-2xl border border-border bg-white"
        />
      </div>
      <aside className="ui-card h-fit p-5 xl:sticky xl:top-5">
        <div className="flex items-center gap-3">
          <CmsCoursesIcon size={28} />
          <h2 className="font-display text-xl text-text">Bi├¬n soß║ín kh├│a hß╗ìc</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted">Admin v├á giß║úng vi├¬n d├╣ng chung mß╗Öt quy tr├¼nh ho├án chß╗ënh ─æß╗â tr├ính hai biß╗âu mß║½u kh├íc nhau v├á thiß║┐u dß╗» liß╗çu.</p>
        <ol className="mt-4 space-y-2 text-sm font-bold text-text">
          <li className="rounded-xl bg-sky-50 px-3 py-2">1. Nhß║¡p th├┤ng tin kh├│a hß╗ìc</li>
          <li className="rounded-xl bg-sky-50 px-3 py-2">2. Soß║ín ─æß╗º bß╗æn trß║ím cho tß╗½ng b├ái</li>
          <li className="rounded-xl bg-sky-50 px-3 py-2">3. Kiß╗âm tra rß╗ôi mß╗ƒ cho hß╗ìc sinh</li>
        </ol>
        <Button className="mt-5 w-full" onClick={() => navigate('/teacher/courses')}>Mß╗ƒ kh├┤ng gian bi├¬n soß║ín</Button>
      </aside>
    </div>
  )

  // AI tab
  const aiTab = (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="ui-card flex flex-col gap-4 p-5">
        <div>
          <h2 className="font-display text-xl">1. API Key Vidtory</h2>
          <p className="text-sm text-muted">Key m├ú h├│a AES-GCM tr├¬n server ΓÇö kh├┤ng trß║ú full key vß╗ü tr├¼nh duyß╗çt.</p>
        </div>
        <div className={cn('rounded-2xl p-3 text-sm', vidtoryStatus?.configured ? 'bg-mint-100' : 'bg-sun-100/60')}>
          <p className="font-bold">
            Trß║íng th├íi:{' '}
            {vidtoryStatus?.configured
              ? <span className="text-success">─É├ú cß║Ñu h├¼nh ┬╖ {vidtoryStatus.maskedHint} ┬╖ {vidtoryStatus.source}</span>
              : <span className="text-warning">Ch╞░a c├│ key</span>}
          </p>
        </div>
        <form className="flex flex-col gap-3" onSubmit={(e) => void saveVidtoryKey(e)}>
          <label className="flex flex-col gap-1 text-sm font-bold">
            API Key mß╗¢i
            <input type="password" autoComplete="off" minLength={8} required placeholder="vidtory_ΓÇª" className="min-h-11 rounded-xl border-2 border-border px-3 font-mono text-sm" value={vidtoryKey} onChange={(e) => setVidtoryKey(e.target.value)} />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit">L╞░u key (m├ú h├│a)</Button>
            {vidtoryStatus?.configured && <Button type="button" variant="secondary" onClick={() => void clearVidtoryKey()}>X├│a key</Button>}
          </div>
        </form>
      </div>
      <form className="ui-card flex flex-col gap-4 p-5" onSubmit={(e) => void saveRouting(e)}>
        <div>
          <h2 className="font-display text-xl">2. M├┤ h├¼nh AI v├á tß╗╖ lß╗ç sß╗¡ dß╗Ñng</h2>
          <p className="text-sm text-muted">Chia tß╗╖ lß╗ç y├¬u cß║ºu giß╗»a c├íc m├┤ h├¼nh. Tß╗òng tß╗╖ lß╗ç n├¬n bß║▒ng 100%.</p>
        </div>
        <label className="flex flex-col gap-1 text-sm font-bold">
          ─Éß╗ïa chß╗ë dß╗ïch vß╗Ñ API
          <input className="min-h-11 rounded-xl border-2 border-border px-3 font-mono text-sm" value={routing.baseURL} onChange={(e) => setRouting((r) => ({ ...r, baseURL: e.target.value }))} placeholder="https://bapi.vidtory.net" />
        </label>
        {(['image', 'video'] as const).map((kind) => (
          <section key={kind} className="rounded-2xl border-2 border-border p-4">
            <h3 className="font-display text-lg text-brand-600">{kind === 'image' ? 'Tß║ío ß║únh' : 'Tß║ío video'}</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {kind === 'image' ? (
                <>
                  <label className="flex flex-col gap-1 text-sm font-bold">Tß╗╖ lß╗ç khung h├¼nh
                    <select className="min-h-11 rounded-xl border-2 border-border px-2" value={routing.image.aspectRatio} onChange={(e) => setRouting((r) => ({ ...r, image: { ...r.image, aspectRatio: e.target.value } }))}>
                      <option value="IMAGE_ASPECT_RATIO_SQUARE">Vu├┤ng 1:1</option>
                      <option value="IMAGE_ASPECT_RATIO_LANDSCAPE">Ngang 16:9</option>
                      <option value="IMAGE_ASPECT_RATIO_PORTRAIT">Dß╗ìc 9:16</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-bold">─Éß╗Ö ph├ón giß║úi
                    <select className="min-h-11 rounded-xl border-2 border-border px-2" value={routing.image.resolution} onChange={(e) => setRouting((r) => ({ ...r, image: { ...r.image, resolution: e.target.value } }))}>
                      <option value="1K">1K</option><option value="2K">2K</option><option value="4K">4K</option>
                    </select>
                  </label>
                </>
              ) : (
                <>
                  <label className="flex flex-col gap-1 text-sm font-bold">Tß╗╖ lß╗ç khung h├¼nh
                    <select className="min-h-11 rounded-xl border-2 border-border px-2" value={routing.video.aspectRatio} onChange={(e) => setRouting((r) => ({ ...r, video: { ...r.video, aspectRatio: e.target.value } }))}>
                      <option value="VIDEO_ASPECT_RATIO_LANDSCAPE">Ngang 16:9</option>
                      <option value="VIDEO_ASPECT_RATIO_PORTRAIT">Dß╗ìc 9:16</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-bold">Thß╗¥i l╞░ß╗úng (gi├óy)
                    <input type="number" min={1} max={30} className="min-h-11 rounded-xl border-2 border-border px-2" value={routing.video.duration} onChange={(e) => setRouting((r) => ({ ...r, video: { ...r.video, duration: Number(e.target.value) || 6 } }))} />
                  </label>
                </>
              )}
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {routing[kind].models.map((m, i) => (
                <div key={`${kind}-${i}`} className="grid gap-2 rounded-xl bg-brand-50/60 p-2 grid-cols-2 sm:grid-cols-[1fr_1fr_80px_70px_auto]">
                  <input className="col-span-2 sm:col-span-1 min-h-11 rounded-lg border border-border px-3 font-mono text-xs" aria-label={`M├ú m├┤ h├¼nh ${i + 1}`} placeholder="M├ú m├┤ h├¼nh" value={m.modelId} onChange={(e) => updateModel(kind, i, { modelId: e.target.value })} />
                  <input className="col-span-2 sm:col-span-1 min-h-11 rounded-lg border border-border px-3 text-sm" aria-label={`T├¬n hiß╗ân thß╗ï m├┤ h├¼nh ${i + 1}`} placeholder="T├¬n hiß╗ân thß╗ï" value={m.label ?? ''} onChange={(e) => updateModel(kind, i, { label: e.target.value })} />
                  <input type="number" min={0} max={100} className="min-h-11 rounded-lg border border-border px-3 text-sm" aria-label={`Tß╗╖ lß╗ç sß╗¡ dß╗Ñng m├┤ h├¼nh ${i + 1}`} value={m.weight} onChange={(e) => updateModel(kind, i, { weight: Number(e.target.value) })} />
                  <span className="flex items-center justify-center text-xs font-extrabold text-brand-600">{m.percent != null ? `${m.percent}%` : 'ΓÇö'}</span>
                  <Button type="button" variant="ghost" onClick={() => removeModel(kind, i)}>X├│a</Button>
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={() => addModel(kind)}>Th├¬m m├┤ h├¼nh {kind === 'image' ? 'ß║únh' : 'video'}</Button>
            </div>
          </section>
        ))}
        <Button type="submit">L╞░u cß║Ñu h├¼nh m├┤ h├¼nh</Button>
      </form>
    </div>
  )

  /**
   * Determine if we have any loaded data for the current tab.
   * On the very first load (no data yet), show the skeleton.
   * On subsequent filter-triggered reloads, keep showing existing data
   * so the edit panel (editTarget) is not destroyed mid-interaction.
   * This implements a "stale-while-revalidate" UX pattern.
   */
  const hasData = () => {
    switch (tab) {
      case 'system': return system !== null
      case 'analytics': return analytics !== null
      case 'users': return users.length > 0 || !loading
      case 'sessions': return sessions.length > 0 || !loading
      case 'logs': return loginLogs.length > 0 || logSummary !== null || !loading
      case 'courses': return courses.length > 0 || !loading
      case 'ai': return vidtoryStatus !== null
      default: return true
    }
  }

  const tabContent = () => {
    // Only block with skeleton on initial load (no data yet).
    // For filter reloads, keep rendering existing data so the edit panel stays.
    if (loading && !hasData()) return loadingEl
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
          <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">CMS ┬╖ Quß║ún trß╗ï</p>
          <h1 className="font-display text-2xl text-text">
            {tab === 'system' ? 'Hß╗ç thß╗æng & t├ái khoß║ún'
              : tab === 'analytics' ? 'Ph├ón t├¡ch hoß║ít ─æß╗Öng'
                : tab === 'logs' ? 'Nhß║¡t k├╜ ─æ─âng nhß║¡p'
                  : tab === 'ai' ? 'AI Vidtory'
                    : tab === 'users' ? 'T├ái khoß║ún'
                      : tab === 'sessions' ? 'Phi├¬n ─æ─âng nhß║¡p'
                        : 'Kh├│a hß╗ìc'}
          </h1>
        </div>
        <Button
          variant="ghost"
          onClick={async () => { await logout(); navigate('/') }}
        >
          ─É─âng xuß║Ñt
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
        description="T├ái khoß║ún sß║╜ bß╗ï v├┤ hiß╗çu h├│a v├á tß║Ñt cß║ú phi├¬n ─æ─âng nhß║¡p bß╗ï thu hß╗ôi."
        confirmLabel="X├│a"
        danger
        onConfirm={() => void softDeleteUser()}
        onCancel={() => setDeleteTarget(null)}
      />
      <ConfirmDialog
        open={!!revokeTarget}
        title={`Thu hß╗ôi phi├¬n cß╗ºa "${revokeTarget?.nickname ?? revokeTarget?.email}"?`}
        description="Ng╞░ß╗¥i d├╣ng sß║╜ bß╗ï ─æ─âng xuß║Ñt ngay lß║¡p tß╗⌐c."
        confirmLabel="Thu hß╗ôi"
        danger
        onConfirm={() => void revokeSession()}
        onCancel={() => setRevokeTarget(null)}
      />

      {/* ΓöÇΓöÇ Edit user modal ΓÇö fixed overlay so it always appears in viewport center
           regardless of scroll position. Replaces the old inline panel that was
           hidden below the table when the list was long. ΓöÇΓöÇ */}
      <EditUserModal
        target={editTarget}
        form={editForm}
        onChange={setEditForm}
        onSubmit={(e) => void patchUser(e)}
        onClose={() => setEditTarget(null)}
      />
    </div>
  )
}

// ΓöÇΓöÇ Edit user modal ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// Uses createPortal(ΓÇª, document.body) to escape the CSS transform stacking
// context created by the page-enter animation on <main>. Without the portal,
// `position: fixed` is anchored to the transformed <main> element instead of
// the viewport, causing the offset and partial backdrop seen in the screenshot.
type EditUserModalProps = {
  target: AdminUser | null
  form: { nickname: string; role: AdminUser['role']; email: string; newPassword: string }
  onChange: React.Dispatch<React.SetStateAction<{ nickname: string; role: AdminUser['role']; email: string; newPassword: string }>>
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

function EditUserModal({ target, form, onChange, onSubmit, onClose }: EditUserModalProps) {
  const firstInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus nickname input when modal opens
  useEffect(() => {
    if (target) {
      setTimeout(() => firstInputRef.current?.focus(), 50)
    }
  }, [target])

  // Close on Escape key
  useEffect(() => {
    if (!target) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [target, onClose])

  if (!target) return null

  // Render into document.body via portal so the overlay truly covers the full
  // viewport, unaffected by any CSS transform / will-change on ancestor elements.
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(20,26,48,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-user-title"
        className="ui-card w-full max-w-md overflow-y-auto p-6"
        style={{ maxHeight: 'calc(100dvh - 2rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">Sß╗¡a t├ái khoß║ún</p>
            <h2 id="edit-user-title" className="font-display text-xl text-text">
              {target.nickname ?? target.email ?? target.id.slice(0, 10)}
            </h2>
            <p className="mt-0.5 text-xs text-muted font-mono">{target.id.slice(0, 16)}ΓÇª</p>
          </div>
          <button
            type="button"
            className="min-h-11 shrink-0 rounded-lg px-3 text-sm font-bold text-muted hover:bg-brand-50"
            onClick={onClose}
            aria-label="─É├│ng hß╗Öp thoß║íi chß╗ënh sß╗¡a"
          >
            Γ£ò
          </button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          {/* Nickname */}
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            T├¬n hiß╗ân thß╗ï
            <input
              ref={firstInputRef}
              className="min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none transition focus:border-brand-400"
              value={form.nickname}
              onChange={(e) => onChange((f) => ({ ...f, nickname: e.target.value }))}
              placeholder={target.nickname ?? 'ΓÇö'}
            />
          </label>

          {/* Role */}
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Vai tr├▓
            <select
              className="min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none transition focus:border-brand-400"
              value={form.role}
              onChange={(e) => onChange((f) => ({ ...f, role: e.target.value as AdminUser['role'] }))}
            >
              <option value="student">Hß╗ìc sinh</option>
              <option value="parent">Phß╗Ñ huynh</option>
              <option value="teacher">Giß║úng vi├¬n</option>
              <option value="admin">Quß║ún trß╗ï vi├¬n</option>
            </select>
          </label>

          {/* Email ΓÇö only shown for non-student (students don't have email accounts) */}
          {target.role !== 'student' && (
            <label className="flex flex-col gap-1.5 text-sm font-bold">
              Email
              <input
                type="email"
                autoComplete="email"
                className="min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none transition focus:border-brand-400"
                value={form.email}
                onChange={(e) => onChange((f) => ({ ...f, email: e.target.value }))}
                placeholder={target.email ?? 'email@example.com'}
              />
              <span className="text-xs font-normal text-muted">─Éß╗â trß╗æng nß║┐u kh├┤ng muß╗æn thay ─æß╗òi</span>
            </label>
          )}

          {/* New password ΓÇö optional, only sent when filled */}
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Mß║¡t khß║⌐u mß╗¢i
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              className="min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none transition focus:border-brand-400"
              value={form.newPassword}
              onChange={(e) => onChange((f) => ({ ...f, newPassword: e.target.value }))}
              placeholder="─Éß╗â trß╗æng nß║┐u kh├┤ng ─æß╗òi mß║¡t khß║⌐u"
            />
            <span className="text-xs font-normal text-muted">Tß╗æi thiß╗âu 8 k├╜ tß╗▒. ─Éß╗â trß╗æng ─æß╗â giß╗» nguy├¬n mß║¡t khß║⌐u.</span>
          </label>

          {/* Actions */}
          <div className="mt-2 flex justify-end gap-3 border-t border-border/60 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Hß╗ºy</Button>
            <Button type="submit">L╞░u thay ─æß╗òi</Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,  // ΓåÉ portal target: outside any transform context
  )
}
