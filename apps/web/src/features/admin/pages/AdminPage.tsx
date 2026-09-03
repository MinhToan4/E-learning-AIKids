/**
 * AdminPage — Full redesign with:
 * - Route-controlled tabs (prop `tab` from App.tsx routes)
 * - Toast popup notifications (no inline messages)
 * - ConfirmDialog (no browser confirm())
 * - Charts: ASCII mini-bars for analytics (no extra deps)
 * - Login audit log with auto-purge indicator
 * - Full-width layout (CmsShell handles sidebar)
 */
import { lazy, Suspense, useEffect, useRef, useState, useCallback, useMemo, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/shared/components/ui/Button'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { AdventureModal } from '@/shared/components/ui/AdventureModal'
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
const LegendRewardStudio = lazy(() => import('../components/LegendRewardStudio').then((module) => ({ default: module.LegendRewardStudio })))

// ── Types ───────────────────────────────────────────────────
type SystemInfo = {
  service: string
  time: string
  counts: {
    courses: number
    quests: number
    classes: number
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
  loginUsername?: string | null
  authProviders?: string[]
  isFirebaseLinked?: boolean
  isGoogleLinked?: boolean
  firebaseUid?: string | null
  googleSub?: string | null
  platformRoles?: string[]
  personas?: string[]
}

type CourseOverview = {
  id: string
  title: string
  shortTitle?: string
  status: string
  ageLabel?: string
  ageTrack?: string
  courseKey?: string
  enrollmentCount?: number
  questCount: number
  accessPolicy?: string
  priceAmountMinor?: string
  priceCurrency?: string
  teacherGrantPolicy?: string
  visibility?: string
  quests: Array<{ id: string; order: number; title: string; videoUrl: string | null; archived?: boolean }>
}

type CourseReadiness = {
  ready: boolean
  issues: string[]
  stations: Array<{ id: string; title: string; ready: boolean; missing: string[] }>
}

type Analytics = {
  time: string
  users: { active: number; byRole: Record<string, number> }
  courses: { open: number; soon: number }
  quests: { active: number; archived: number }
  learning: { completedProgress: number; enrollments: number; projects: number }
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

// ── Billing types ─────────────────────────────────────────────
type PlanDef = {
  id: string; name: string; amountMinor: number; currency: string;
  monthlyCreateCredits: number; maxChildren: number; maxOpenCoursesPerChild?: number;
  features: string[]; requiresPayment: boolean;
}
type BillingStats = { totalPaid: number; totalFree: number; totalPending: number; totalExpired: number }
type SubscriptionRow = {
  userId: string; email: string | null; name: string | null;
  role: string; active: boolean; plan: string; status: string;
  expiresAt: string | null; monthlyCreateCredits: number;
  remainingCreateCredits: number; createdAt: string;
}
type PendingIntent = {
  id: string; publicId: string; provider: string; purpose: string;
  amountMinor: string; currency: string; status: string;
  userId: string | null; userEmail: string | null; userName: string | null;
  paymentCode: string | null; courseTitle: string | null; createdAt: string;
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

export type AdminTab = 'system' | 'analytics' | 'logs' | 'ai' | 'users' | 'courses' | 'legends' | 'billing'

const ROLE_LABELS: Record<string, string> = {
  student: 'Học sinh',
  parent: 'Phụ huynh',
  teacher: 'Giáo viên',
  admin: 'Admin',
}

function UserAuthBadges({ user }: { user: AdminUser }) {
  const hasFirebase = Boolean(user.isFirebaseLinked || user.firebaseUid || user.authProviders?.includes('firebase'))
  const hasGoogle = Boolean(user.isGoogleLinked || user.googleSub || user.authProviders?.includes('google') || user.authProviders?.includes('google.com') || user.authProviders?.includes('firebase_google'))
  const hasLocal = Boolean(user.loginUsername || !hasFirebase)
  const isStudent = user.role === 'student' || Boolean(user.authProviders?.includes('pin'))

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {hasFirebase && (
        <span
          title={user.firebaseUid ? `Firebase UID: ${user.firebaseUid}` : 'Đã xác thực qua Firebase Auth'}
          className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-700 shadow-sm"
        >
          <span>🟠</span> Firebase Auth
        </span>
      )}
      {hasGoogle && (
        <span
          title={user.googleSub ? `Google Sub: ${user.googleSub}` : 'Đăng nhập bằng Google'}
          className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-bold text-sky-700 shadow-sm"
        >
          <span>🔵</span> Google
        </span>
      )}
      {hasLocal && (
        <span
          title={user.loginUsername ? `Tên đăng nhập alias: ${user.loginUsername}` : 'Tài khoản nội bộ'}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 shadow-sm"
        >
          <span>⚪</span> {user.loginUsername ? `Nội bộ (${user.loginUsername})` : 'Nội bộ'}
        </span>
      )}
      {isStudent && (
        <span
          title="Đăng nhập bằng mã PIN học sinh"
          className="inline-flex items-center gap-1 rounded-full border border-sun-200 bg-sun-100 px-2 py-0.5 text-xs font-bold text-sun-800 shadow-sm"
        >
          <span>🟡</span> Mã PIN
        </span>
      )}
    </div>
  )
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

// ── Mini bar chart (no deps) ─────────────────────────────────
function MiniBar({ value, max, color = 'bg-brand-500', label }: { value: number; max: number; color?: string; label: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      {/* w-20 on mobile, w-28 on sm+ — truncate prevents overflow on 320px */}
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
    { key: 'completedQuests' as const, label: 'Bài hoàn thành', color: '#6d5efc' },
    { key: 'newUsers' as const, label: 'Tài khoản mới', color: '#37b9d5' },
    { key: 'projects' as const, label: 'Sản phẩm mới', color: '#39a77e' },
  ]

  return (
    <div className="ui-card p-5 lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide text-muted">
            Nhịp hoạt động 14 ngày
          </p>
          <p className="mt-1 text-xs text-muted">
            Theo dõi học tập, tăng trưởng và sản phẩm trên cùng một trục thời gian.
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
          Chưa có dữ liệu theo ngày.
        </p>
      ) : (
        <div className="mt-4 w-full">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="block h-auto w-full"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Biểu đồ hoạt động hệ thống trong 14 ngày gần nhất"
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
                  <title>{`${row.date} · ${item.label}: ${row[item.key]}`}</title>
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

// ── Stat card ────────────────────────────────────────────────
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
  const [courseReadiness, setCourseReadiness] = useState<CourseReadiness | null>(null)
  const [checkingCourseId, setCheckingCourseId] = useState<string | null>(null)
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
  // Inline edit state — tracks which user row is open for editing
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null)
  const [editForm, setEditForm] = useState({ nickname: '', role: 'student' as AdminUser['role'], email: '', newPassword: '' })
  const [offerTarget, setOfferTarget] = useState<string | null>(null)
  const [offerForm, setOfferForm] = useState({
    accessPolicy: 'free',
    priceAmountMinor: '0',
    priceCurrency: 'vnd',
    visibility: 'public',
    teacherGrantPolicy: 'allowed',
  })

  // ── Billing state ─────────────────────────────────────────────
  const [billingStats, setBillingStats] = useState<BillingStats | null>(null)
  const [billingPlans, setBillingPlans] = useState<PlanDef[]>([])
  const [billingSubSearch, setBillingSubSearch] = useState('')
  const [billingSubs, setBillingSubs] = useState<SubscriptionRow[]>([])
  const [pendingIntents, setPendingIntents] = useState<PendingIntent[]>([])
  // Grant form — targetUser tìm bằng email, không phải UUID thủ công
  const [grantForm, setGrantForm] = useState({ userEmail: '', planId: 'starter', durationMonths: 1, reason: '' })
  const [grantLoading, setGrantLoading] = useState(false)
  const [grantUserResults, setGrantUserResults] = useState<AdminUser[]>([])
  const [grantUserSearching, setGrantUserSearching] = useState(false)
  const [grantSelectedUser, setGrantSelectedUser] = useState<AdminUser | null>(null)
  const [billingConfirmIntent, setBillingConfirmIntent] = useState<PendingIntent | null>(null)
  const [billingPlanView, setBillingPlanView] = useState<'subscribers' | 'plans'>('subscribers')

  // ── Search / filter state ──────────────────────────────
  const [userSearch, setUserSearch] = useState('')
  const [userActiveFilter, setUserActiveFilter] = useState<'' | 'active' | 'inactive'>('')
  const [userAuthFilter, setUserAuthFilter] = useState<'' | 'firebase' | 'google' | 'local' | 'pin'>('')
  const [logSearch, setLogSearch] = useState('')
  const [courseSearch, setCourseSearch] = useState('')
  const [courseStatusFilter, setCourseStatusFilter] = useState<'' | 'open' | 'soon'>('')

  const { toasts, showToast, dismissToast } = useToast()
  const navigate = useNavigate()

  // ── Filtered arrays (client-side) ───────────────────────────
  const filteredUsers = useMemo(() => {
    let list = users
    if (roleFilter) list = list.filter((u) => u.role === roleFilter)
    if (userActiveFilter === 'active') list = list.filter((u) => u.active)
    if (userActiveFilter === 'inactive') list = list.filter((u) => !u.active)
    if (userAuthFilter === 'firebase') {
      list = list.filter((u) => Boolean(u.isFirebaseLinked || u.firebaseUid || u.authProviders?.includes('firebase')))
    } else if (userAuthFilter === 'google') {
      list = list.filter((u) => Boolean(u.isGoogleLinked || u.googleSub || u.authProviders?.includes('google') || u.authProviders?.includes('google.com') || u.authProviders?.includes('firebase_google')))
    } else if (userAuthFilter === 'local') {
      list = list.filter((u) => Boolean(u.loginUsername || !u.isFirebaseLinked || u.authProviders?.includes('password') || u.authProviders?.includes('local')))
    } else if (userAuthFilter === 'pin') {
      list = list.filter((u) => u.role === 'student' || Boolean(u.authProviders?.includes('pin')))
    }
    if (userSearch) {
      const q = userSearch.toLowerCase()
      list = list.filter(
        (u) =>
          u.nickname?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.loginUsername?.toLowerCase().includes(q) ||
          u.firebaseUid?.toLowerCase().includes(q),
      )
    }
    return list
  }, [users, roleFilter, userActiveFilter, userAuthFilter, userSearch])

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

  // ── Pagination — one hook per data-heavy tab ─────────────────
  const usersPag = usePagination(filteredUsers, 15)
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
        // WHY: Load users song song để cross-reference trạng thái active ngay trên tab Nhật ký,
        // tránh phải quay về tab Tài khoản chỉ để tắt/bật một account đáng ngờ.
        const q = logFilter ? `?outcome=${encodeURIComponent(logFilter)}` : ''
        const [logsData, usersData] = await Promise.all([
          api<{ logs: LoginLogItem[]; summary: LoginLogSummary }>(`/api/admin/login-logs${q}`),
          api<{ users: AdminUser[] }>('/api/admin/users'),
        ])
        setLoginLogs(logsData.logs)
        setLogSummary(logsData.summary)
        setUsers(usersData.users)
      } else if (tab === 'courses') {
        const data = await api<{ courses: CourseOverview[] }>('/api/admin/courses')
        setCourses(data.courses)
      } else if (tab === 'billing') {
        // WHY: normalizeGatewayResponse đã unwrap body.data → FE nhận trực tiếp payload
        // /api/admin/billing/* → /api/v1/billing/admin/* (xem normalizeGatewayRequest)
        // Responses:
        //   stats endpoint → { stats: {...}, plans: [...] }
        //   subscriptions  → SubscriptionRow[]
        //   pending-intents → PendingIntent[]
        const [statsData, subsData, intentsData] = await Promise.all([
          api<{ stats: BillingStats; plans: PlanDef[] }>('/api/admin/billing/subscriptions/stats'),
          api<SubscriptionRow[]>('/api/admin/billing/subscriptions'),
          api<PendingIntent[]>('/api/admin/billing/subscriptions/pending-intents'),
        ])
        setBillingStats(statsData.stats)
        setBillingPlans(statsData.plans ?? [])
        setBillingSubs(Array.isArray(subsData) ? subsData : [])
        setPendingIntents(Array.isArray(intentsData) ? intentsData : [])
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
      // Close edit panel if it was open for this user — data will be refreshed
      if (editTarget?.id === u.id) setEditTarget(null)
      await load()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Lỗi cập nhật', 'error') }
  }

  async function softDeleteUser() {
    if (!deleteTarget) return
    try {
      await api(`/api/admin/users/${deleteTarget.id}`, { method: 'DELETE' })
      showToast('Đã soft-delete user + thu hồi phiên', 'success')
      // Close edit panel if the deleted user was open for editing
      if (editTarget?.id === deleteTarget.id) setEditTarget(null)
      setDeleteTarget(null)
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lỗi xóa', 'error')
      setDeleteTarget(null)
    }
  }

  async function setCourseStatus(id: string, status: 'open' | 'soon') {
    if (status === 'open') {
      setCheckingCourseId(id)
      try {
        const readiness = await api<CourseReadiness>(`/api/admin/courses/${id}/readiness`)
        if (!readiness.ready) {
          setCourseReadiness(readiness)
          return
        }
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Không kiểm tra được mức độ hoàn thiện', 'error')
        return
      } finally {
        setCheckingCourseId(null)
      }
    }
    try {
      await api(`/api/admin/courses/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      showToast(`Khóa học → ${status === 'open' ? 'Mở' : 'Ẩn'}`, 'success')
      await load()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Lỗi cập nhật khóa', 'error') }
  }

  function openCourseOffer(course: CourseOverview) {
    setOfferTarget(course.id)
    setOfferForm({
      accessPolicy: course.accessPolicy ?? 'free',
      priceAmountMinor: course.priceAmountMinor ?? '0',
      priceCurrency: course.priceCurrency ?? 'vnd',
      visibility: course.visibility ?? 'public',
      teacherGrantPolicy: course.teacherGrantPolicy ?? 'allowed',
    })
  }

  async function saveCourseOffer() {
    if (!offerTarget) return
    try {
      await api(`/api/admin/courses/${offerTarget}`, {
        method: 'PATCH',
        body: JSON.stringify(offerForm),
      })
      showToast('Đã cập nhật giá, hiển thị và quyền cấp khóa học', 'success')
      setOfferTarget(null)
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không cập nhật được cấu hình khóa học', 'error')
    }
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
      showToast('Đã cập nhật tài khoản', 'success')
      setEditTarget(null)
      await load()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Lỗi cập nhật', 'error') }
  }

  async function syncFirebaseClaims(userId: string) {
    try {
      const data = await api<{ message?: string }>(`/api/admin/users/${userId}/sync-firebase-claims`, {
        method: 'POST',
      })
      showToast(data.message ?? 'Đã đồng bộ Custom Claims lên Firebase Auth thành công', 'success')
      await load()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lỗi đồng bộ Custom Claims lên Firebase', 'error')
      throw e
    }
  }

  async function purgeLogs() {
    try {
      const data = await api<{ deleted: number; message: string }>('/api/admin/login-logs', { method: 'DELETE' })
      showToast(data.message, 'success')
      await load()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Lỗi purge', 'error') }
  }

  // ── Billing handlers ────────────────────────────────────────

  /** Tìm user theo email để admin chọn khi grant gói thủ công */
  async function searchGrantUser(email: string) {
    const q = email.trim()
    if (q.length < 3) { setGrantUserResults([]); return }
    setGrantUserSearching(true)
    try {
      const data = await api<{ users: AdminUser[] }>(`/api/admin/users?email=${encodeURIComponent(q)}`)
      // Lọc chỉ hiện parent/teacher — không grant cho student/child
      setGrantUserResults((data.users ?? []).filter((u) => u.role === 'parent' || u.role === 'teacher'))
    } catch { setGrantUserResults([]) }
    finally { setGrantUserSearching(false) }
  }

  async function grantPlan(e: React.FormEvent) {
    e.preventDefault()
    if (!grantSelectedUser || !grantForm.planId) return
    setGrantLoading(true)
    try {
      const payload = {
        targetUserId: grantSelectedUser.id,
        planId: grantForm.planId,
        durationMonths: Number(grantForm.durationMonths) || 1,
        reason: grantForm.reason.trim() || `Admin cấp thủ công cho ${grantSelectedUser.email}`,
      }
      const res = await api<{ message: string }>(
        '/api/admin/billing/subscriptions/grant',
        { method: 'POST', body: JSON.stringify(payload) },
      )
      showToast(res.message ?? `Đã cấp gói ${grantForm.planId} cho ${grantSelectedUser.email}`, 'success')
      // Reset form
      setGrantForm({ userEmail: '', planId: 'starter', durationMonths: 1, reason: '' })
      setGrantSelectedUser(null)
      setGrantUserResults([])
      await load()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Lỗi cấp gói', 'error') }
    finally { setGrantLoading(false) }
  }

  /** Quick-grant từ subscriber row — prefill user vào form */
  function quickGrant(sub: SubscriptionRow) {
    setGrantSelectedUser({
      id: sub.userId, email: sub.email, nickname: sub.name,
      role: sub.role, active: sub.active, level: 1, xp: 0, createdAt: sub.createdAt,
    })
    setGrantForm((f) => ({ ...f, userEmail: sub.email ?? '' }))
    // Scroll to grant form
    document.getElementById('billing-grant-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function confirmIntent(intent: PendingIntent) {
    setBillingConfirmIntent(null)
    try {
      const res = await api<{ message: string }>(
        `/api/admin/billing/subscriptions/intents/${encodeURIComponent(intent.publicId)}/complete`,
        { method: 'POST' },
      )
      showToast(res.message ?? 'Thanh toán đã được xác nhận', 'success')
      await load()
    } catch (e) { showToast(e instanceof Error ? e.message : 'Lỗi xác nhận', 'error') }
  }

  // ── Tab content renderers ────────────────────────────────
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
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">Ưu tiên hôm nay</p>
            <h3 id="admin-attention-title" className="mt-1 font-display text-xl text-text">Việc cần xử lý</h3>
          </div>
          <p className="text-xs text-muted">Cập nhật {new Date(system.time).toLocaleString('vi-VN')}</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <button type="button" className="min-h-24 rounded-2xl border-2 border-border bg-white p-4 text-left transition hover:border-brand-300 hover:bg-brand-50" onClick={() => navigate('/admin/users')}>
            <span className="flex items-center gap-2 font-bold text-text"><CmsUsersIcon /> Tài khoản chờ duyệt</span>
            <span className="mt-2 block text-2xl font-display text-brand-600">{system.counts.pendingApprovals}</span>
            <span className="mt-1 block text-xs text-muted">Xem và xử lý tài khoản mới</span>
          </button>
          <button type="button" className="min-h-24 rounded-2xl border-2 border-border bg-white p-4 text-left transition hover:border-brand-300 hover:bg-brand-50" onClick={() => navigate('/admin/logs')}>
            <span className="flex items-center gap-2 font-bold text-text"><CmsLogsIcon /> Kiểm tra đăng nhập</span>
            <span className="mt-2 block text-sm font-bold text-brand-600">Xem sự cố trong 24 giờ</span>
            <span className="mt-1 block text-xs text-muted">Tìm đăng nhập thất bại hoặc bị khóa</span>
          </button>
          <button type="button" className={cn('min-h-24 rounded-2xl border-2 p-4 text-left transition', system.vidtory?.configured ? 'border-mint-200 bg-mint-100/50 hover:bg-mint-100' : 'border-sun-200 bg-sun-50 hover:bg-sun-100')} onClick={() => navigate('/admin/ai')}>
            <span className="flex items-center gap-2 font-bold text-text"><CmsAiIcon /> Dịch vụ tạo nội dung AI</span>
            <span className={cn('mt-2 block text-sm font-bold', system.vidtory?.configured ? 'text-success' : 'text-warning')}>{system.vidtory?.configured ? 'Đã kết nối' : 'Cần cấu hình'}</span>
            <span className="mt-1 block text-xs text-muted">Mở phần thiết lập và kiểm tra kết nối</span>
          </button>
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Khóa học', value: system.counts.courses, icon: <CmsCoursesIcon /> },
          { label: 'Bài học', value: system.counts.quests, icon: <CmsLecturesIcon /> },
          { label: 'Lớp học', value: system.counts.classes, icon: <CmsClassesIcon /> },
          { label: 'Tài khoản chờ duyệt', value: system.counts.pendingApprovals, icon: <CmsUsersIcon /> },
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
              return <MiniBar key={role} label={ROLE_LABELS[role] ?? role} value={n} max={max} color={colorMap[role] ?? 'bg-brand-500'} />
            })}
          </div>
        </div>
        <div className="ui-card p-5">
          <p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-muted">Vidtory AI</p>
          <div className={cn('flex items-center gap-3 rounded-2xl p-3', system.vidtory?.configured ? 'bg-mint-100' : 'bg-sun-100')}>
            <CmsAiIcon size={28} />
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Người dùng hoạt động" value={analytics.users.active} icon={<CmsUsersIcon />} />
        <StatCard label="Khóa học đang mở" value={analytics.courses.open} icon={<CmsCoursesIcon />} />
        <StatCard label="Lượt tham gia khóa" value={analytics.learning.enrollments} icon={<CmsAnalyticsIcon />} />
        <StatCard label="Bài học đang dùng" value={analytics.quests.active} icon={<CmsLecturesIcon />} />
        <StatCard label="Bài học đang ẩn" value={analytics.quests.archived} icon={<CmsLecturesIcon />} />
        <StatCard label="Trạm đã hoàn thành" value={analytics.learning.completedProgress} icon={<CmsAnalyticsIcon />} />
        <StatCard label="Sản phẩm học tập" value={analytics.learning.projects} icon={<CmsCoursesIcon />} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <TrendChart rows={analytics.trends ?? []} />
        <div className="ui-card p-5">
          <p className="mb-4 text-sm font-extrabold uppercase tracking-wide text-muted">Người dùng theo vai trò</p>
          <div className="flex flex-col gap-3">
            {Object.entries(analytics.users.byRole).map(([role, n]) => {
              const max = Math.max(...Object.values(analytics.users.byRole))
              const colorMap: Record<string, string> = { student: 'bg-brand-500', teacher: 'bg-sky-400', parent: 'bg-mint-400', admin: 'bg-coral-400' }
              return <MiniBar key={role} label={ROLE_LABELS[role] ?? role} value={n} max={max} color={colorMap[role] ?? 'bg-brand-500'} />
            })}
          </div>
        </div>
        <div className="ui-card p-5">
          <p className="mb-4 text-sm font-extrabold uppercase tracking-wide text-muted">Học tập</p>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Hoàn thành trạm', value: analytics.learning.completedProgress },
              { label: 'Lượt tham gia khóa', value: analytics.learning.enrollments },
              { label: 'Dự án', value: analytics.learning.projects },
            ].map((item) => {
              const max = Math.max(analytics.learning.completedProgress, analytics.learning.enrollments, analytics.learning.projects, 1)
              return <MiniBar key={item.label} label={item.label} value={item.value} max={max} color="bg-mint-400" />
            })}
          </div>
          <p className="mt-3 text-xs text-muted">Cập nhật: {new Date(analytics.time).toLocaleString('vi-VN')}</p>
        </div>
      </div>
    </>
  )

  // WHY: Tắt = đỏ (nguy hiểm, vô hiệu hóa tài khoản), Bật = xanh lá (an toàn, khôi phục).
  // Dùng style prop + CSS variables đã định nghĩa thay vì Tailwind class —
  // tầng design-system có coral-600 và mint-600 nhưng không có coral-500/mint-500.
  const toggleBtnStyle = (active: boolean): React.CSSProperties =>
    active
      ? { background: 'var(--color-coral-600)', color: 'white', borderColor: 'var(--color-coral-600)' }
      : { background: 'var(--color-mint-600)', color: 'white', borderColor: 'var(--color-mint-600)' }

  // WHY: Tab Nhật ký dùng compact size để hài hòa với chiều cao row table (~40px).
  // ui-btn mặc định min-height 48px + padding 12px 20px — quá lớn trong context bảng log.
  // Tab Tài khoản giữ nguyên size chuẩn vì có nhiều không gian hơn.
  const toggleBtnStyleCompact = (active: boolean): React.CSSProperties => ({
    ...toggleBtnStyle(active),
    minHeight: 0,
    padding: '4px 12px',
    fontSize: '0.75rem',
    fontWeight: 700,
    lineHeight: '1.25rem',
  })

  // Login logs tab
  const logsTab = (
    <>
      {logSummary && (
        <div className="mb-4 grid gap-3 sm:grid-cols-4">
          <StatCard label="Tổng trong 24 giờ" value={logSummary.total} icon={<CmsLogsIcon />} />
          <StatCard label="Thành công" value={logSummary.byOutcome['success'] ?? 0} icon={<CmsSessionsIcon />} />
          <StatCard label="Thất bại" value={logSummary.byOutcome['failed'] ?? 0} icon={<CmsLogsIcon />} />
          <StatCard label="Bị khóa" value={logSummary.byOutcome['locked'] ?? 0} icon={<CmsSessionsIcon />} />
        </div>
      )}
      <div className="ui-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-4 py-3">
          <div className="relative flex-1 min-w-[180px]">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
              <Search size={17} aria-hidden="true" />
            </span>
            <input
              type="search"
              aria-label="Tìm nhật ký đăng nhập"
              placeholder="Tìm email, IP..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="w-full min-h-11 rounded-xl border-2 border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-400"
            />
          </div>
          <select
            aria-label="Lọc nhật ký theo kết quả"
            className="min-h-11 rounded-xl border-2 border-border px-3 text-sm font-bold"
            value={logFilter}
            onChange={(e) => setLogFilter(e.target.value)}
          >
            <option value="">Tất cả kết quả</option>
            <option value="success">Thành công</option>
            <option value="failed">Thất bại</option>
            <option value="locked">Bị khóa</option>
          </select>
          <Button variant="secondary" onClick={() => void load()}>Làm mới</Button>
          <Button variant="ghost" className="text-muted" onClick={() => void purgeLogs()}>Xóa nhật ký cũ</Button>
        </div>
        {/* ── Desktop table (md+) ─────────────────────────────────────── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-brand-50/80">
              <tr>
                <th className="px-4 py-3 font-extrabold">Thời gian</th>
                <th className="px-4 py-3 font-extrabold">Email</th>
                <th className="px-4 py-3 font-extrabold">Kết quả</th>
                <th className="px-4 py-3 font-extrabold">IP</th>
                <th className="px-4 py-3 font-extrabold">Lý do</th>
                <th className="px-4 py-3 font-extrabold" />
              </tr>
            </thead>
            <tbody>
              {logsPag.slice.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">{loginLogs.length === 0 ? 'Chưa có log nào trong 24 giờ qua' : 'Không có log khớp bộ lọc'}</td></tr>
              ) : logsPag.slice.map((log) => {
                // Cross-reference với danh sách users để lấy trạng thái active.
                // Chỉ hiện button khi log có userId hợp lệ và user tồn tại trong hệ thống.
                const logUser = log.userId ? users.find((u) => u.id === log.userId) : undefined
                return (
                  <tr key={log.id} className="border-b border-border/40 hover:bg-brand-50/30">
                    <td className="px-4 py-2 text-xs text-muted">{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-2 font-mono text-xs">{log.email ?? '—'}</td>
                    <td className="px-4 py-2"><OutcomeBadge outcome={log.outcome} /></td>
                    <td className="px-4 py-2 font-mono text-xs text-muted">{log.ipAddress ?? '—'}</td>
                    <td className="px-4 py-2 text-xs text-muted">{log.reason ?? '—'}</td>
                    <td className="px-4 py-2 text-right">
                      {logUser && (
                        <Button
                          variant="secondary"
                          style={toggleBtnStyleCompact(logUser.active)}
                          onClick={() => void toggleActive(logUser)}
                          aria-label={logUser.active ? `Vô hiệu hóa tài khoản ${log.email ?? logUser.id}` : `Kích hoạt tài khoản ${log.email ?? logUser.id}`}
                        >
                          {logUser.active ? 'Tắt' : 'Bật'}
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {/* ── Mobile card list (<md) ──────────────────────────────────── */}
        <div className="md:hidden divide-y divide-border/40">
          {logsPag.slice.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              {loginLogs.length === 0 ? 'Chưa có log nào trong 24 giờ qua' : 'Không có log khớp bộ lọc'}
            </p>
          ) : logsPag.slice.map((log) => {
            const logUser = log.userId ? users.find((u) => u.id === log.userId) : undefined
            return (
              <div key={log.id} className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <OutcomeBadge outcome={log.outcome} />
                    <span className="truncate font-mono text-xs text-text font-semibold">{log.email ?? '—'}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{new Date(log.createdAt).toLocaleString('vi-VN')}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted">{log.ipAddress ?? '—'}{log.reason ? ` · ${log.reason}` : ''}</p>
                </div>
                {logUser && (
                  <Button
                    variant="secondary"
                    style={toggleBtnStyleCompact(logUser.active)}
                    onClick={() => void toggleActive(logUser)}
                    aria-label={logUser.active ? `Vô hiệu hóa ${log.email ?? logUser.id}` : `Kích hoạt ${log.email ?? logUser.id}`}
                  >
                    {logUser.active ? 'Tắt' : 'Bật'}
                  </Button>
                )}
              </div>
            )
          })}
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
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
              <Search size={17} aria-hidden="true" />
            </span>
            <input
              type="search"
              aria-label="Tìm tài khoản"
              placeholder="Tìm tên, email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full min-h-11 rounded-xl border-2 border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-400"
            />
          </div>
          {/* Role filter */}
          <select aria-label="Lọc tài khoản theo vai trò" className="min-h-11 rounded-xl border-2 border-border px-3 text-sm font-bold" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">Tất cả vai trò</option>
            <option value="student">Học sinh</option>
            <option value="parent">Phụ huynh</option>
            <option value="teacher">Giảng viên</option>
            <option value="admin">Quản trị viên</option>
          </select>
          {/* Active filter */}
          <select aria-label="Lọc tài khoản theo trạng thái" className="min-h-11 rounded-xl border-2 border-border px-3 text-sm font-bold" value={userActiveFilter} onChange={(e) => setUserActiveFilter(e.target.value as '' | 'active' | 'inactive')}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Vô hiệu hóa</option>
          </select>
          {/* Auth provider filter */}
          <select aria-label="Lọc tài khoản theo nguồn xác thực" className="min-h-11 rounded-xl border-2 border-border px-3 text-sm font-bold" value={userAuthFilter} onChange={(e) => setUserAuthFilter(e.target.value as '' | 'firebase' | 'google' | 'local' | 'pin')}>
            <option value="">Tất cả nguồn</option>
            <option value="firebase">Đã lên Firebase</option>
            <option value="google">Dùng Google</option>
            <option value="local">Nội bộ / Alias</option>
            <option value="pin">Học sinh PIN</option>
          </select>
          {/* Result count badge */}
          {(userSearch || roleFilter || userActiveFilter || userAuthFilter) && (
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">
              {filteredUsers.length} / {users.length} tài khoản
            </span>
          )}
          {/* Clear all */}
          {(userSearch || roleFilter || userActiveFilter || userAuthFilter) && (
            <button type="button" className="text-xs font-bold text-muted underline" onClick={() => { setUserSearch(''); setRoleFilter(''); setUserActiveFilter(''); setUserAuthFilter('') }}>Xóa bộ lọc</button>
          )}
          {/* Background reload indicator — shown when reloading with existing data (stale-while-revalidate) */}
          {loading && users.length > 0 && (
            <span className="ml-auto text-xs font-bold text-brand-400 animate-pulse">Đang cập nhật…</span>
          )}
        </div>
        {/* ── Desktop table (md+) ─────────────────────────────────────── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-brand-50/80">
              <tr>
                <th className="px-4 py-3 font-extrabold">Người dùng</th>
                <th className="px-4 py-3 font-extrabold">Vai trò</th>
                <th className="px-4 py-3 font-extrabold">Phương thức xác thực</th>
                <th className="px-4 py-3 font-extrabold">Trạng thái</th>
                <th className="px-4 py-3 font-extrabold" />
              </tr>
            </thead>
            <tbody>
              {usersPag.slice.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">{users.length === 0 ? 'Không có tài khoản nào' : 'Không có tài khoản khớp bộ lọc'}</td></tr>
              ) : usersPag.slice.map((u) => (
                <tr key={u.id} className="border-b border-border/40 hover:bg-brand-50/30">
                  <td className="px-4 py-3">
                    <p className="font-bold">{u.nickname ?? '—'}</p>
                    <p className="text-xs text-muted">{u.email ?? u.id.slice(0, 10)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-bold">{ROLE_LABELS[u.role] ?? u.role}</span>
                      {u.platformRoles?.includes('superadmin') && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-extrabold text-amber-800">
                          👑 Superadmin
                        </span>
                      )}
                      {u.platformRoles?.includes('platform_admin') && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-extrabold text-purple-700">
                          🛡️ Platform Admin
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <UserAuthBadges user={u} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-extrabold', u.active ? 'bg-mint-100 text-success' : 'bg-coral-100 text-danger')}>
                      {u.active ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
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
                        Sửa
                      </Button>
                      <Button variant="secondary" style={toggleBtnStyle(u.active)} onClick={() => void toggleActive(u)}>
                        {u.active ? 'Tắt' : 'Bật'}
                      </Button>
                      {u.active && (
                        <Button variant="ghost" className="text-danger" onClick={() => setDeleteTarget(u)}>
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
        {/* ── Mobile card list (<md) ──────────────────────────────────── */}
        <div className="md:hidden divide-y divide-border/40">
          {usersPag.slice.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              {users.length === 0 ? 'Không có tài khoản nào' : 'Không có tài khoản khớp bộ lọc'}
            </p>
          ) : usersPag.slice.map((u) => (
            <div key={u.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-sm">{u.nickname ?? '—'}</p>
                  <p className="truncate text-xs text-muted">{u.email ?? u.id.slice(0, 10)}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-600">
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                    {u.platformRoles?.includes('superadmin') && (
                      <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-extrabold text-amber-800">
                        👑 Superadmin
                      </span>
                    )}
                    {u.platformRoles?.includes('platform_admin') && (
                      <span className="rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-extrabold text-purple-700">
                        🛡️ Platform Admin
                      </span>
                    )}
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-extrabold', u.active ? 'bg-mint-100 text-success' : 'bg-coral-100 text-danger')}>
                      {u.active ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                    </span>
                  </div>
                  <div className="mt-2">
                    <UserAuthBadges user={u} />
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditTarget(u)
                      setEditForm({ nickname: u.nickname ?? '', role: u.role as AdminUser['role'], email: u.email ?? '', newPassword: '' })
                    }}
                  >
                    Sửa
                  </Button>
                  <Button variant="secondary" style={toggleBtnStyle(u.active)} onClick={() => void toggleActive(u)}>
                    {u.active ? 'Tắt' : 'Bật'}
                  </Button>
                  {u.active && (
                    <Button variant="ghost" className="text-danger" onClick={() => setDeleteTarget(u)}>
                      Xóa
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Paginator
          page={usersPag.page} totalPages={usersPag.totalPages}
          totalItems={filteredUsers.length} pageSize={15}
          onPrev={usersPag.prev} onNext={usersPag.next} onGoTo={usersPag.goTo}
        />

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

  // Courses tab
  const coursesTab = (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col gap-3">
        {/* Course search + status filter bar */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-white px-4 py-3">
          <div className="relative flex-1 min-w-[200px]">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
              <Search size={17} aria-hidden="true" />
            </span>
            <input
              type="search"
              aria-label="Tìm khóa học"
              placeholder="Tìm tên khóa học..."
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              className="w-full min-h-11 rounded-xl border-2 border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-400"
            />
          </div>
          <select aria-label="Lọc khóa học theo trạng thái" className="min-h-11 rounded-xl border-2 border-border px-3 text-sm font-bold" value={courseStatusFilter} onChange={(e) => setCourseStatusFilter(e.target.value as '' | 'open' | 'soon')}>
            <option value="">Tất cả trạng thái</option>
            <option value="open">Đang mở</option>
            <option value="soon">Đang ẩn</option>
          </select>
          {(courseSearch || courseStatusFilter) && (
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">{filteredCourses.length} khóa học</span>
          )}
          {(courseSearch || courseStatusFilter) && (
            <button type="button" className="text-xs font-bold text-muted underline" onClick={() => { setCourseSearch(''); setCourseStatusFilter('') }}>Xóa bộ lọc</button>
          )}
        </div>
        {coursesPag.slice.map((c) => (
          <div key={c.id} className="ui-card p-4">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-display text-lg">{c.title}</h2>
                <p className="text-xs text-muted">{c.ageLabel ?? c.ageTrack ?? 'Chưa cấu hình nhóm tuổi'}{c.courseKey ? ` · Chặng ${c.courseKey}` : ''}{c.enrollmentCount != null ? ` · ${c.enrollmentCount} lượt tham gia` : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('rounded-full px-3 py-0.5 text-xs font-extrabold', c.status === 'open' ? 'bg-mint-100 text-success' : 'bg-sun-100 text-warning')}>
                  {c.status === 'open' ? 'Đang mở' : 'Đang ẩn'} · {c.questCount} bài
                </span>
                <Button variant="secondary" disabled={checkingCourseId === c.id} onClick={() => void setCourseStatus(c.id, c.status === 'open' ? 'soon' : 'open')}>
                  {checkingCourseId === c.id ? 'Đang kiểm tra...' : c.status === 'open' ? 'Ẩn khỏi học sinh' : 'Mở cho học sinh'}
                </Button>
                <Button variant="secondary" onClick={() => navigate(`/teacher/courses?courseId=${encodeURIComponent(c.id)}`)}>
                  Biên soạn & lộ trình
                </Button>
                <Button variant="secondary" onClick={() => openCourseOffer(c)}>
                  Phân phối & bán
                </Button>
              </div>
            </div>
            <div className="mb-3 flex flex-wrap gap-2 text-xs font-bold text-muted">
              <span className="rounded-full bg-brand-50 px-2 py-1">
                {c.accessPolicy === 'paid'
                  ? `${Number(c.priceAmountMinor ?? 0).toLocaleString('vi-VN')} ${(c.priceCurrency ?? 'vnd').toUpperCase()}`
                  : 'Miễn phí'}
              </span>
              <span className="rounded-full bg-sky-50 px-2 py-1">Hiển thị: {c.visibility ?? 'public'}</span>
              <span className="rounded-full bg-mint-50 px-2 py-1">Giáo viên: {c.teacherGrantPolicy ?? 'allowed'}</span>
            </div>
            <ul className="space-y-1 text-sm">
              {c.quests.map((q) => (
                <li key={q.id} className={cn('flex flex-wrap items-center justify-between gap-2 rounded-xl bg-brand-50/60 px-3 py-1.5', q.archived ? 'opacity-50' : '')}>
                  <span className="font-bold">#{q.order} {q.title}{q.archived ? ' [ẩn]' : ''}</span>
                  <span className="max-w-[200px] truncate text-xs text-muted">{q.videoUrl ? 'Đã có video' : 'Chưa có video'}</span>
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
      {offerTarget && (
        <div className="ui-card h-fit p-5 xl:sticky xl:top-5">
          <h2 className="font-display text-xl">Cấu hình bán và cấp quyền</h2>
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-bold">Mô hình truy cập
              <select className="mt-1 min-h-11 w-full rounded-xl border-2 border-border px-3" value={offerForm.accessPolicy} onChange={(e) => setOfferForm((v) => ({ ...v, accessPolicy: e.target.value, priceAmountMinor: e.target.value === 'free' ? '0' : v.priceAmountMinor }))}>
                <option value="free">Miễn phí</option>
                <option value="paid">Trả phí</option>
                <option value="invite_only">Chỉ được mời</option>
                <option value="organization_only">Theo trường/lớp</option>
              </select>
            </label>
            <label className="block text-sm font-bold">Giá (minor unit)
              <input className="mt-1 min-h-11 w-full rounded-xl border-2 border-border px-3" inputMode="numeric" value={offerForm.priceAmountMinor} onChange={(e) => setOfferForm((v) => ({ ...v, priceAmountMinor: e.target.value.replace(/\D/g, '') }))} disabled={offerForm.accessPolicy !== 'paid'} />
            </label>
            <label className="block text-sm font-bold">Hiển thị
              <select className="mt-1 min-h-11 w-full rounded-xl border-2 border-border px-3" value={offerForm.visibility} onChange={(e) => setOfferForm((v) => ({ ...v, visibility: e.target.value }))}>
                <option value="public">Công khai</option>
                <option value="unlisted">Có liên kết</option>
                <option value="invite_only">Chỉ lời mời</option>
                <option value="private">Riêng tư</option>
                <option value="organization">Theo tổ chức</option>
              </select>
            </label>
            <label className="block text-sm font-bold">Quyền giáo viên cấp khóa
              <select className="mt-1 min-h-11 w-full rounded-xl border-2 border-border px-3" value={offerForm.teacherGrantPolicy} onChange={(e) => setOfferForm((v) => ({ ...v, teacherGrantPolicy: e.target.value }))}>
                <option value="allowed">Cho phép</option>
                <option value="admin_only">Chỉ quản trị viên tổ chức</option>
                <option value="disabled">Tắt</option>
              </select>
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <Button className="flex-1" onClick={() => void saveCourseOffer()}>Lưu</Button>
            <Button variant="secondary" onClick={() => setOfferTarget(null)}>Hủy</Button>
          </div>
        </div>
      )}

    </div>
  )

  // AI tab
  const aiTab = (
    <div className="flex flex-col gap-5 max-w-3xl">
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
          <h2 className="font-display text-xl">2. Mô hình AI và tỷ lệ sử dụng</h2>
          <p className="text-sm text-muted">Chia tỷ lệ yêu cầu giữa các mô hình. Tổng tỷ lệ nên bằng 100%.</p>
        </div>
        <label className="flex flex-col gap-1 text-sm font-bold">
          Địa chỉ dịch vụ API
          <input className="min-h-11 rounded-xl border-2 border-border px-3 font-mono text-sm" value={routing.baseURL} onChange={(e) => setRouting((r) => ({ ...r, baseURL: e.target.value }))} placeholder="https://bapi.vidtory.net" />
        </label>
        {(['image', 'video'] as const).map((kind) => (
          <section key={kind} className="rounded-2xl border-2 border-border p-4">
            <h3 className="font-display text-lg text-brand-600">{kind === 'image' ? 'Tạo ảnh' : 'Tạo video'}</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {kind === 'image' ? (
                <>
                  <label className="flex flex-col gap-1 text-sm font-bold">Tỷ lệ khung hình
                    <select className="min-h-11 rounded-xl border-2 border-border px-2" value={routing.image.aspectRatio} onChange={(e) => setRouting((r) => ({ ...r, image: { ...r.image, aspectRatio: e.target.value } }))}>
                      <option value="IMAGE_ASPECT_RATIO_SQUARE">Vuông 1:1</option>
                      <option value="IMAGE_ASPECT_RATIO_LANDSCAPE">Ngang 16:9</option>
                      <option value="IMAGE_ASPECT_RATIO_PORTRAIT">Dọc 9:16</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-bold">Độ phân giải
                    <select className="min-h-11 rounded-xl border-2 border-border px-2" value={routing.image.resolution} onChange={(e) => setRouting((r) => ({ ...r, image: { ...r.image, resolution: e.target.value } }))}>
                      <option value="1K">1K</option><option value="2K">2K</option><option value="4K">4K</option>
                    </select>
                  </label>
                </>
              ) : (
                <>
                  <label className="flex flex-col gap-1 text-sm font-bold">Tỷ lệ khung hình
                    <select className="min-h-11 rounded-xl border-2 border-border px-2" value={routing.video.aspectRatio} onChange={(e) => setRouting((r) => ({ ...r, video: { ...r.video, aspectRatio: e.target.value } }))}>
                      <option value="VIDEO_ASPECT_RATIO_LANDSCAPE">Ngang 16:9</option>
                      <option value="VIDEO_ASPECT_RATIO_PORTRAIT">Dọc 9:16</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-bold">Thời lượng (giây)
                    <input type="number" min={1} max={30} className="min-h-11 rounded-xl border-2 border-border px-2" value={routing.video.duration} onChange={(e) => setRouting((r) => ({ ...r, video: { ...r.video, duration: Number(e.target.value) || 6 } }))} />
                  </label>
                </>
              )}
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {routing[kind].models.map((m, i) => (
                <div key={`${kind}-${i}`} className="grid gap-2 rounded-xl bg-brand-50/60 p-2 grid-cols-2 sm:grid-cols-[1fr_1fr_80px_70px_auto]">
                  <input className="col-span-2 sm:col-span-1 min-h-11 rounded-lg border border-border px-3 font-mono text-xs" aria-label={`Mã mô hình ${i + 1}`} placeholder="Mã mô hình" value={m.modelId} onChange={(e) => updateModel(kind, i, { modelId: e.target.value })} />
                  <input className="col-span-2 sm:col-span-1 min-h-11 rounded-lg border border-border px-3 text-sm" aria-label={`Tên hiển thị mô hình ${i + 1}`} placeholder="Tên hiển thị" value={m.label ?? ''} onChange={(e) => updateModel(kind, i, { label: e.target.value })} />
                  <input type="number" min={0} max={100} className="min-h-11 rounded-lg border border-border px-3 text-sm" aria-label={`Tỷ lệ sử dụng mô hình ${i + 1}`} value={m.weight} onChange={(e) => updateModel(kind, i, { weight: Number(e.target.value) })} />
                  <span className="flex items-center justify-center text-xs font-extrabold text-brand-600">{m.percent != null ? `${m.percent}%` : '—'}</span>
                  <Button type="button" variant="ghost" onClick={() => removeModel(kind, i)}>Xóa</Button>
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={() => addModel(kind)}>Thêm mô hình {kind === 'image' ? 'ảnh' : 'video'}</Button>
            </div>
          </section>
        ))}
        <Button type="submit">Lưu cấu hình mô hình</Button>
      </form>
    </div>
  )

  // ── Billing tab UI ──────────────────────────────────────────
  const filteredBillingSubs = useMemo(() => {
    if (!billingSubSearch.trim()) return billingSubs
    const q = billingSubSearch.toLowerCase()
    return billingSubs.filter(
      (s) => (s.email ?? '').toLowerCase().includes(q) || (s.name ?? '').toLowerCase().includes(q),
    )
  }, [billingSubs, billingSubSearch])

  // Plan metadata — bổ sung từ billingPlans nếu có, fallback sang labels cứng
  const PLAN_LABELS: Record<string, string> = useMemo(() => {
    const base: Record<string, string> = { free: 'Miễn phí', starter: 'Starter', premium_family: 'Premium Gia Đình', pro: 'Pro' }
    billingPlans.forEach((p) => { base[p.id] = p.name })
    return base
  }, [billingPlans])

  const PLAN_COLORS: Record<string, string> = {
    free: 'bg-slate-100 text-slate-600',
    starter: 'bg-sky-50 text-sky-700',
    premium_family: 'bg-violet-50 text-violet-700',
    pro: 'bg-amber-50 text-amber-700',
  }
  const PLAN_BADGE_COLORS: Record<string, string> = {
    free: 'bg-slate-100 text-slate-600',
    starter: 'bg-sky-100 text-sky-700',
    premium_family: 'bg-violet-100 text-violet-700',
    pro: 'bg-amber-100 text-amber-700',
  }
  const PURPOSE_LABELS: Record<string, string> = {
    user_sub: 'Gói cá nhân', credit_pack: 'Gói lượt', course_purchase: 'Mua khóa học',
  }

  // ── Plan price display helpers ────────────────────────────────
  function formatVnd(minor: number) {
    return minor === 0 ? 'Miễn phí' : `${minor.toLocaleString('vi-VN')}₫/tháng`
  }

  // ── Billing tab JSX ──────────────────────────────────────────
  const billingTab = (
    <div className="flex flex-col gap-6">

      {/* ── Header: Stat cards ─────────────────────────────── */}
      {billingStats && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Đang trả phí', value: billingStats.totalPaid, color: 'text-success', bg: 'bg-mint-50', icon: '✓' },
            { label: 'Gói miễn phí', value: billingStats.totalFree, color: 'text-brand-600', bg: 'bg-brand-50', icon: '○' },
            { label: 'Chờ xác nhận', value: billingStats.totalPending, color: 'text-warning', bg: 'bg-sun-50', icon: '⏳' },
            { label: 'Hết hạn', value: billingStats.totalExpired, color: 'text-danger', bg: 'bg-coral-50', icon: '✕' },
          ].map((s) => (
            <div key={s.label} className={cn('ui-card flex items-center gap-4 p-4', s.bg)}>
              <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-black', s.color)} style={{ background: 'rgba(255,255,255,0.7)' }}>{s.icon}</span>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-muted">{s.label}</p>
                <p className={cn('font-display text-3xl font-black', s.color)}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Sub-nav: Subscribers | Plans ──────────────────── */}
      <div className="flex gap-1 rounded-2xl bg-brand-50 p-1 w-fit">
        {(['subscribers', 'plans'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setBillingPlanView(v)}
            className={cn(
              'rounded-xl px-5 py-2 text-sm font-bold transition',
              billingPlanView === v ? 'bg-white text-brand-700 shadow-sm' : 'text-muted hover:text-text',
            )}
          >
            {v === 'subscribers' ? 'Danh sách thuê bao' : 'Catalog gói học'}
          </button>
        ))}
      </div>

      {/* ── Main layout: Left content | Right grant panel ─── */}
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">

        {/* ─── LEFT ─── */}
        <div className="flex flex-col gap-5">

          {/* Pending payment intents — chỉ hiện khi có data */}
          {billingPlanView === 'subscribers' && pendingIntents.length > 0 && (
            <div className="ui-card overflow-hidden border-l-4 border-warning">
              <div className="flex items-center gap-3 border-b border-border/60 bg-sun-50/60 px-4 py-3">
                <span className="text-warning text-lg">⏳</span>
                <div>
                  <p className="font-display text-base font-bold text-warning">Chờ xác nhận thanh toán ({pendingIntents.length})</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-page text-xs">
                      <th className="px-4 py-2.5 font-extrabold">Phụ huynh</th>
                      <th className="px-4 py-2.5 font-extrabold">Mục đích</th>
                      <th className="px-4 py-2.5 font-extrabold">Số tiền</th>
                      <th className="px-4 py-2.5 font-extrabold">Mã CK</th>
                      <th className="px-4 py-2.5 font-extrabold">Ngày tạo</th>
                      <th className="px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {pendingIntents.map((pi) => (
                      <tr key={pi.id} className="border-b border-border/20 hover:bg-sun-50/30 transition">
                        <td className="px-4 py-3">
                          <p className="font-bold">{pi.userName ?? '—'}</p>
                          <p className="text-xs text-muted font-mono">{pi.userEmail ?? pi.userId?.slice(0, 12)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-700">
                            {PURPOSE_LABELS[pi.purpose] ?? pi.purpose}
                          </span>
                          {pi.courseTitle && <p className="text-xs text-muted mt-1">{pi.courseTitle}</p>}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-warning">
                          {Number(pi.amountMinor).toLocaleString('vi-VN')}₫
                        </td>
                        <td className="px-4 py-3">
                          {pi.paymentCode
                            ? <code className="rounded bg-sun-100 px-2 py-1 text-xs font-mono text-warning">{pi.paymentCode}</code>
                            : <span className="text-muted">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted">
                          {new Date(pi.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            id={`confirm-payment-${pi.id}`}
                            onClick={() => setBillingConfirmIntent(pi)}
                          >
                            Xác nhận
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Subscriber list ──────────────────────────── */}
          {billingPlanView === 'subscribers' && (
            <div className="ui-card overflow-hidden">
              <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-4 py-3">
                <div className="relative flex-1 min-w-[200px]">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
                    <Search size={16} aria-hidden="true" />
                  </span>
                  <input
                    type="search"
                    aria-label="Tìm tài khoản trong danh sách thuê bao"
                    placeholder="Tìm tên hoặc email..."
                    value={billingSubSearch}
                    onChange={(e) => setBillingSubSearch(e.target.value)}
                    className="w-full min-h-10 rounded-xl border-2 border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-400"
                  />
                </div>
                {billingSubSearch && (
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">
                    {filteredBillingSubs.length}/{billingSubs.length}
                  </span>
                )}
                <Button variant="secondary" onClick={() => void load()}>Làm mới</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-brand-50/60 text-xs">
                      <th className="px-4 py-2.5 font-extrabold">Tài khoản</th>
                      <th className="px-4 py-2.5 font-extrabold">Vai trò</th>
                      <th className="px-4 py-2.5 font-extrabold">Gói hiện tại</th>
                      <th className="px-4 py-2.5 font-extrabold">Lượt AI còn</th>
                      <th className="px-4 py-2.5 font-extrabold">Hết hạn</th>
                      <th className="px-4 py-2.5 font-extrabold" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBillingSubs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-muted">Chưa có dữ liệu thuê bao</td>
                      </tr>
                    ) : filteredBillingSubs.map((s) => (
                      <tr key={s.userId} className="group border-b border-border/30 hover:bg-brand-50/30 transition">
                        <td className="px-4 py-3">
                          <p className="font-bold">{s.name ?? '—'}</p>
                          <p className="text-xs text-muted font-mono">{s.email ?? s.userId.slice(0, 14)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                            {ROLE_LABELS[s.role] ?? s.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-extrabold', PLAN_BADGE_COLORS[s.plan] ?? 'bg-brand-50 text-brand-600')}>
                            {PLAN_LABELS[s.plan] ?? s.plan}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('font-mono text-sm font-bold', s.remainingCreateCredits === 0 ? 'text-danger' : 'text-text')}>
                            {s.remainingCreateCredits}
                          </span>
                          <span className="text-xs text-muted">/{s.monthlyCreateCredits}</span>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {s.expiresAt ? (
                            <span className={cn(new Date(s.expiresAt) < new Date() ? 'text-danger font-bold' : 'text-muted')}>
                              {new Date(s.expiresAt).toLocaleDateString('vi-VN')}
                            </span>
                          ) : (
                            <span className="text-success font-bold">Không hết hạn</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="secondary"
                            className="opacity-0 group-hover:opacity-100 transition text-xs py-1 px-3"
                            onClick={() => quickGrant(s)}
                          >
                            Cấp gói mới
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Plan Catalog View ─────────────────────────── */}
          {billingPlanView === 'plans' && (
            <div className="grid gap-4 sm:grid-cols-2">
              {billingPlans.length === 0 ? (
                <div className="ui-card col-span-2 py-12 text-center text-muted">Đang tải catalog gói...</div>
              ) : billingPlans.map((plan) => {
                const userCount = billingSubs.filter((s) => s.plan === plan.id).length
                return (
                  <div
                    key={plan.id}
                    className={cn(
                      'ui-card flex flex-col gap-3 p-5 transition hover:shadow-md',
                      plan.id !== 'free' ? 'border-2' : 'border border-dashed border-border',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-extrabold mb-2', PLAN_BADGE_COLORS[plan.id] ?? 'bg-brand-50 text-brand-600')}>
                          {plan.id.toUpperCase()}
                        </span>
                        <h3 className="font-display text-lg text-text">{plan.name}</h3>
                        <p className="text-2xl font-black text-brand-600 mt-1">{formatVnd(plan.amountMinor)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-display text-2xl text-text">{userCount}</p>
                        <p className="text-xs text-muted">thuê bao</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 rounded-xl bg-page p-3 text-center text-xs">
                      <div>
                        <p className="font-extrabold text-brand-600">{plan.monthlyCreateCredits}</p>
                        <p className="text-muted">lượt AI/tháng</p>
                      </div>
                      <div>
                        <p className="font-extrabold text-brand-600">{plan.maxChildren}</p>
                        <p className="text-muted">hồ sơ trẻ</p>
                      </div>
                      <div>
                        <p className="font-extrabold text-brand-600">
                          {plan.maxOpenCoursesPerChild === 999 ? '∞' : (plan.maxOpenCoursesPerChild ?? '?')}
                        </p>
                        <p className="text-muted">khóa/trẻ</p>
                      </div>
                    </div>

                    <ul className="flex flex-col gap-1.5">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted">
                          <span className="mt-0.5 text-success shrink-0">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-3 border-t border-border/60">
                      <p className="text-xs text-muted">
                        {plan.requiresPayment ? '💳 Yêu cầu thanh toán' : '🎁 Miễn phí, tự động kích hoạt'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ─── RIGHT: Grant panel ─── */}
        <div id="billing-grant-form" className="flex flex-col gap-4">
          <form
            className="ui-card p-5"
            onSubmit={(e) => void grantPlan(e)}
          >
            <div className="mb-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">Cấp gói thủ công</p>
              <h2 className="font-display text-xl text-text mt-0.5">Kích hoạt không qua thanh toán</h2>
            </div>

            {/* User search */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold" htmlFor="grant-user-search">Tìm phụ huynh / giảng viên</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
                  <Search size={15} />
                </span>
                <input
                  id="grant-user-search"
                  type="search"
                  placeholder="Nhập email..."
                  className="w-full min-h-11 rounded-xl border-2 border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-400"
                  value={grantForm.userEmail}
                  onChange={(e) => {
                    setGrantForm((f) => ({ ...f, userEmail: e.target.value }))
                    void searchGrantUser(e.target.value)
                  }}
                  autoComplete="off"
                />
              </div>
              {/* Search results dropdown */}
              {grantUserSearching && (
                <p className="text-xs text-muted animate-pulse">Đang tìm...</p>
              )}
              {!grantUserSearching && grantUserResults.length > 0 && !grantSelectedUser && (
                <div className="rounded-xl border-2 border-brand-200 bg-white shadow-sm overflow-hidden">
                  {grantUserResults.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-brand-50 transition"
                      onClick={() => {
                        setGrantSelectedUser(u)
                        setGrantForm((f) => ({ ...f, userEmail: u.email ?? f.userEmail }))
                        setGrantUserResults([])
                      }}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-600">
                        {(u.nickname ?? u.email ?? '?')[0]?.toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold truncate">{u.nickname ?? '—'}</p>
                        <p className="text-xs text-muted truncate font-mono">{u.email}</p>
                      </div>
                      <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 shrink-0">
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {!grantUserSearching && grantForm.userEmail.length >= 3 && grantUserResults.length === 0 && !grantSelectedUser && (
                <p className="text-xs text-muted">Không tìm thấy phụ huynh/giảng viên với email này.</p>
              )}
              {/* Selected user chip */}
              {grantSelectedUser && (
                <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-200 text-xs font-black text-brand-700">
                    {(grantSelectedUser.nickname ?? grantSelectedUser.email ?? '?')[0]?.toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm truncate">{grantSelectedUser.nickname ?? '—'}</p>
                    <p className="text-xs text-muted font-mono truncate">{grantSelectedUser.email}</p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 text-muted hover:text-danger transition text-lg leading-none"
                    onClick={() => { setGrantSelectedUser(null); setGrantForm((f) => ({ ...f, userEmail: '' })); setGrantUserResults([]) }}
                    aria-label="Xóa người dùng đã chọn"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Plan select */}
            <label className="mt-3 flex flex-col gap-1 text-sm font-bold">
              Gói học
              <select
                className="min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none transition focus:border-brand-400"
                value={grantForm.planId}
                onChange={(e) => setGrantForm((f) => ({ ...f, planId: e.target.value }))}
              >
                {billingPlans.filter((p) => p.id !== 'free').map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.amountMinor === 0 ? 'Miễn phí' : `${Number(p.amountMinor).toLocaleString('vi-VN')}₫/tháng`}
                  </option>
                ))}
              </select>
              {/* Selected plan info */}
              {(() => {
                const sel = billingPlans.find((p) => p.id === grantForm.planId)
                if (!sel) return null
                return (
                  <span className="text-xs text-muted font-normal">
                    {sel.monthlyCreateCredits} lượt AI · tối đa {sel.maxChildren} hồ sơ trẻ · {sel.maxOpenCoursesPerChild === 999 ? 'không giới hạn' : sel.maxOpenCoursesPerChild ?? '?'} khóa/trẻ
                  </span>
                )
              })()}
            </label>

            {/* Duration */}
            <label className="mt-3 flex flex-col gap-1 text-sm font-bold">
              Thời hạn (tháng)
              <div className="flex gap-2">
                {[1, 3, 6, 12].map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={cn(
                      'flex-1 rounded-xl border-2 py-2 text-sm font-bold transition',
                      grantForm.durationMonths === m
                        ? 'border-brand-400 bg-brand-50 text-brand-700'
                        : 'border-border bg-white text-muted hover:border-brand-300',
                    )}
                    onClick={() => setGrantForm((f) => ({ ...f, durationMonths: m }))}
                  >
                    {m}th
                  </button>
                ))}
              </div>
            </label>

            {/* Reason */}
            <label className="mt-3 flex flex-col gap-1 text-sm font-bold">
              Lý do cấp
              <input
                required
                placeholder="VD: CK qua tổng đài ngày 09/08, mã GD 123456..."
                className="min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none transition focus:border-brand-400"
                value={grantForm.reason}
                onChange={(e) => setGrantForm((f) => ({ ...f, reason: e.target.value }))}
              />
            </label>

            {/* Summary before submit */}
            {grantSelectedUser && (
              <div className="mt-3 rounded-xl bg-brand-50 p-3 text-xs">
                <p className="font-extrabold text-brand-700 mb-1">Xác nhận kích hoạt:</p>
                <p><span className="text-muted">Tài khoản:</span> <span className="font-bold">{grantSelectedUser.email}</span></p>
                <p><span className="text-muted">Gói:</span> <span className="font-bold">{PLAN_LABELS[grantForm.planId] ?? grantForm.planId}</span></p>
                <p><span className="text-muted">Thời hạn:</span> <span className="font-bold">{grantForm.durationMonths} tháng</span></p>
                <p className="mt-1 text-muted italic">Gói sẽ được kích hoạt ngay, không thể hoàn tác.</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={grantLoading || !grantSelectedUser}
              className="mt-4 w-full"
            >
              {grantLoading ? 'Đang kích hoạt...' : '⚡ Kích hoạt gói ngay'}
            </Button>
          </form>


        </div>
      </div>

      {/* Confirm payment intent dialog */}
      <ConfirmDialog
        open={!!billingConfirmIntent}
        title={`Xác nhận đã nhận tiền từ ${billingConfirmIntent?.userName ?? billingConfirmIntent?.userEmail ?? 'user'}?`}
        description={`Mục đích: ${PURPOSE_LABELS[billingConfirmIntent?.purpose ?? ''] ?? billingConfirmIntent?.purpose} · Số tiền: ${Number(billingConfirmIntent?.amountMinor ?? 0).toLocaleString('vi-VN')}₫. Hành động này không thể hoàn tác.`}
        confirmLabel="Xác nhận đã nhận tiền"
        onConfirm={() => billingConfirmIntent && void confirmIntent(billingConfirmIntent)}
        onCancel={() => setBillingConfirmIntent(null)}
      />
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
      case 'logs': return loginLogs.length > 0 || logSummary !== null || !loading
      case 'courses': return courses.length > 0 || !loading
      case 'ai': return vidtoryStatus !== null
      case 'billing': return billingStats !== null || !loading
      case 'legends': return true
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
      case 'courses': return coursesTab
      case 'ai': return aiTab
      case 'billing': return billingTab
      case 'legends': return <Suspense fallback={<div className="ui-card p-8" role="status"><div className="ui-skeleton h-8 w-72 rounded-xl" /><div className="ui-skeleton mt-5 h-48 rounded-2xl" /><p className="mt-4 text-sm text-muted">Đang mở Legend Studio…</p></div>}><LegendRewardStudio /></Suspense>
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
              : tab === 'analytics' ? 'Phân tích hoạt động'
                : tab === 'logs' ? 'Nhật ký đăng nhập'
                  : tab === 'ai' ? 'AI Vidtory'
                    : tab === 'legends' ? 'Legend & Reward Studio'
                    : tab === 'billing' ? 'Gói & Thanh toán'
                    : tab === 'users' ? 'Tài khoản'
                      : 'Khóa học'}
          </h1>
        </div>
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
      <AdventureModal
        open={!!courseReadiness}
        tone="guidance"
        eyebrow="Kiểm tra nội dung"
        title="Chưa thể mở giáo trình"
        description="Admin và giáo viên đang dùng cùng một tiêu chuẩn backend. Hãy chuyển sang khu vực biên soạn để hoàn thiện các mục còn thiếu."
        showMascot={false}
        onClose={() => setCourseReadiness(null)}
        actions={<Button variant="secondary" onClick={() => setCourseReadiness(null)}>Đóng checklist</Button>}
      >
        <div className="max-h-[56vh] space-y-3 overflow-y-auto pr-1 text-left">
          {courseReadiness?.stations.filter((station) => !station.ready).map((station) => (
            <article key={station.id} className="rounded-2xl border-2 border-sun-200 bg-sun-50 p-4">
              <h3 className="font-display text-lg text-text">{station.title}</h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {station.missing.map((item) => <li key={item} className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-text">Còn thiếu: {item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </AdventureModal>
      {/* ── Edit user modal — fixed overlay so it always appears in viewport center
           regardless of scroll position. Replaces the old inline panel that was
           hidden below the table when the list was long. ── */}
      <EditUserModal
        target={editTarget}
        form={editForm}
        onChange={setEditForm}
        onSubmit={(e) => void patchUser(e)}
        onClose={() => setEditTarget(null)}
        onSyncClaims={syncFirebaseClaims}
      />
    </div>
  )
}

// ── Edit user modal ───────────────────────────────────────────
// Uses createPortal(…, document.body) to escape the CSS transform stacking
// context created by the page-enter animation on <main>. Without the portal,
// `position: fixed` is anchored to the transformed <main> element instead of
// the viewport, causing the offset and partial backdrop seen in the screenshot.
type EditUserModalProps = {
  target: AdminUser | null
  form: { nickname: string; role: AdminUser['role']; email: string; newPassword: string }
  onChange: React.Dispatch<React.SetStateAction<{ nickname: string; role: AdminUser['role']; email: string; newPassword: string }>>
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
  onSyncClaims: (userId: string) => Promise<void>
}

function EditUserModal({ target, form, onChange, onSubmit, onClose, onSyncClaims }: EditUserModalProps) {
  const firstInputRef = useRef<HTMLInputElement>(null)
  const [syncingClaims, setSyncingClaims] = useState(false)

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

  async function handleSyncClaims() {
    if (!target) return
    setSyncingClaims(true)
    try {
      await onSyncClaims(target.id)
    } finally {
      setSyncingClaims(false)
    }
  }

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
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">Sửa tài khoản</p>
            <h2 id="edit-user-title" className="font-display text-xl text-text">
              {target.nickname ?? target.email ?? target.id.slice(0, 10)}
            </h2>
            <p className="mt-0.5 text-xs text-muted font-mono">{target.id.slice(0, 16)}…</p>
          </div>
          <button
            type="button"
            className="min-h-11 shrink-0 rounded-lg px-3 text-sm font-bold text-muted hover:bg-brand-50"
            onClick={onClose}
            aria-label="Đóng hộp thoại chỉnh sửa"
          >
            ✕
          </button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          {/* Nickname */}
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Tên hiển thị
            <input
              ref={firstInputRef}
              className="min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none transition focus:border-brand-400"
              value={form.nickname}
              onChange={(e) => onChange((f) => ({ ...f, nickname: e.target.value }))}
              placeholder={target.nickname ?? '—'}
            />
          </label>

          {/* Role */}
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Vai trò
            <select
              className="min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none transition focus:border-brand-400"
              value={form.role}
              onChange={(e) => onChange((f) => ({ ...f, role: e.target.value as AdminUser['role'] }))}
            >
              <option value="student">Học sinh</option>
              <option value="parent">Phụ huynh</option>
              <option value="teacher">Giáo viên</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          {/* Email — only shown for non-student (students don't have email accounts) */}
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
              <span className="text-xs font-normal text-muted">Để trống nếu không muốn thay đổi</span>
            </label>
          )}

          {/* New password — optional, only sent when filled */}
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Mật khẩu mới
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              className="min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none transition focus:border-brand-400"
              value={form.newPassword}
              onChange={(e) => onChange((f) => ({ ...f, newPassword: e.target.value }))}
              placeholder="Để trống nếu không đổi mật khẩu"
            />
            <span className="text-xs font-normal text-muted">Tối thiểu 8 ký tự. Để trống để giữ nguyên mật khẩu.</span>
          </label>

          {/* Khu vực Thông tin Xác thực & Firebase */}
          <div className="rounded-2xl border-2 border-border/80 bg-brand-50/40 p-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-brand-600 mb-3">
              Thông tin Xác thực & Firebase
            </h3>
            <div className="space-y-2.5 text-xs">
              {/* Trạng thái Firebase Auth */}
              <div className="flex items-start justify-between gap-2">
                <span className="text-muted font-bold">Firebase Auth:</span>
                <div className="text-right">
                  {target.isFirebaseLinked || target.firebaseUid ? (
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-mint-100 px-2 py-0.5 font-extrabold text-success">
                        ✓ Đã liên kết
                      </span>
                      {target.firebaseUid && (
                        <p className="mt-1 font-mono text-[11px] text-muted break-all select-all">
                          UID: {target.firebaseUid}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-bold text-muted">
                      Chưa liên kết
                    </span>
                  )}
                </div>
              </div>

              {/* Trạng thái Google Sign-in */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted font-bold">Google Sign-in:</span>
                {target.isGoogleLinked || target.googleSub ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 font-extrabold text-sky-700">
                    🔵 Đã liên kết
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-bold text-muted">
                    Chưa liên kết
                  </span>
                )}
              </div>

              {/* Tên đăng nhập alias (loginUsername) */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted font-bold">Tên đăng nhập alias:</span>
                {target.loginUsername ? (
                  <code className="rounded bg-brand-100/70 px-2 py-0.5 font-mono font-bold text-brand-800">
                    {target.loginUsername}
                  </code>
                ) : (
                  <span className="text-muted italic">—</span>
                )}
              </div>
            </div>

            {/* Nút hành động Đồng bộ Custom Claims lên Firebase */}
            <div className="mt-3 pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="secondary"
                disabled={syncingClaims}
                onClick={() => void handleSyncClaims()}
                className="w-full text-xs font-bold"
              >
                {syncingClaims ? 'Đang đồng bộ Custom Claims...' : '⚡ Đồng bộ Custom Claims lên Firebase'}
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-2 flex justify-end gap-3 border-t border-border/60 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Hủy</Button>
            <Button type="submit">Lưu thay đổi</Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,  // ← portal target: outside any transform context
  )
}
