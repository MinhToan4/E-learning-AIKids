/**
 * TeacherDashboardPage — Tổng quan giáo viên
 *
 * Mục đích: Trang đầu tiên giáo viên thấy sau khi đăng nhập.
 * Hiển thị:
 *  - Stats nhanh (học sinh, sessions hôm nay, yêu cầu chờ xử lý)
 *  - Lịch tuần (7 ngày tới, read-only — detail xử lý tại /teacher/scheduling)
 *  - Quick links tới các công cụ chính
 *
 * Luồng nghiệp vụ:
 *  - Phụ huynh yêu cầu xếp lớp → Giáo viên duyệt tại /teacher/scheduling
 *  - Dashboard chỉ hiện badge count, click → redirect
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  Clock,
  GraduationCap,
  LayoutDashboard,
  PenLine,
  Users,
  UserRoundPlus,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { api } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { cn } from '@/shared/lib/cn'

// ── Types ──────────────────────────────────────────────────────
type DashboardStats = {
  studentCount: number
  todaySessionCount: number
  pendingPlacements: number
  pendingReschedules: number
  className: string | null
  classCode: string | null
}

type WeekSession = {
  id: string
  title: string
  startsAt: string
  endsAt: string
  status: string
  classroom: {
    id: string
    name: string
    classType: 'one_to_one' | 'group'
  }
}

type QuickLink = {
  to: string
  label: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  accent: string
}

// ── Helpers ───────────────────────────────────────────────────
function formatTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', { timeStyle: 'short' }).format(new Date(value))
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' }).format(
    new Date(value),
  )
}

/** Trả về số ngày từ hôm nay (0 = hôm nay, 1 = ngày mai, ...) */
function daysFromNow(value: string) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const d = new Date(value)
  d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - now.getTime()) / 86_400_000)
}

function dayLabel(offset: number) {
  if (offset === 0) return 'Hôm nay'
  if (offset === 1) return 'Ngày mai'
  return `${offset} ngày nữa`
}

function sessionStatusColor(status: string) {
  if (status === 'completed') return 'bg-mint-100 text-success border-mint-200'
  if (status === 'cancelled') return 'bg-coral-100 text-error border-coral-200'
  return 'bg-sky-50 text-sky-700 border-sky-200'
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  to,
  badge,
}: {
  label: string
  value: number | string
  icon: React.ComponentType<{ size?: number; className?: string }>
  accent: string
  to?: string
  badge?: boolean
}) {
  const content = (
    <div
      className={cn(
        'relative flex flex-col gap-2 rounded-2xl border-2 p-4 transition-all',
        accent,
        to && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase tracking-widest opacity-70">{label}</span>
        <span aria-hidden="true" className="opacity-80">
          <Icon size={20} />
        </span>
      </div>
      <p className="font-display text-3xl font-extrabold">{value}</p>
      {badge && typeof value === 'number' && value > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-coral-500 text-[10px] font-extrabold text-white shadow">
          {value}
        </span>
      )}
      {to && (
        <span className="mt-auto flex items-center gap-1 text-xs font-bold opacity-60">
          Xem chi tiết <ChevronRight size={13} />
        </span>
      )}
    </div>
  )
  if (to) return <Link to={to}>{content}</Link>
  return content
}

// ── Weekly Calendar ───────────────────────────────────────────
function WeeklyCalendar({ sessions }: { sessions: WeekSession[] }) {
  // Group by day (offset from today, 0–6)
  const grouped = useMemo(() => {
    const map = new Map<number, WeekSession[]>()
    for (let i = 0; i <= 6; i++) map.set(i, [])
    for (const s of sessions) {
      const offset = daysFromNow(s.startsAt)
      if (offset >= 0 && offset <= 6) {
        map.get(offset)?.push(s)
      }
    }
    // Sort each day's sessions by start time
    for (const [, list] of map) {
      list.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    }
    return map
  }, [sessions])

  const totalThisWeek = sessions.filter((s) => {
    const offset = daysFromNow(s.startsAt)
    return offset >= 0 && offset <= 6
  }).length

  return (
    <section className="ui-card flex flex-col gap-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={20} className="text-sky-500" aria-hidden="true" />
          <h2 className="font-display text-lg">Lịch tuần</h2>
          {totalThisWeek > 0 && (
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-extrabold text-sky-600">
              {totalThisWeek} buổi
            </span>
          )}
        </div>
        <Link
          to="/teacher/scheduling"
          className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:underline"
        >
          Quản lý lịch <ChevronRight size={13} />
        </Link>
      </div>

      {/* 7-day grid */}
      <div className="grid divide-x divide-border/40 overflow-x-auto" style={{ gridTemplateColumns: 'repeat(7, minmax(7.5rem, 1fr))' }}>
        {Array.from({ length: 7 }, (_, i) => {
          const daySessions = grouped.get(i) ?? []
          const isToday = i === 0
          // Calculate the actual date for this column
          const colDate = new Date(Date.now() + i * 86_400_000)
          const dateLabel = new Intl.DateTimeFormat('vi-VN', { weekday: 'short', day: 'numeric' }).format(colDate)

          return (
            <div key={i} className={cn('flex min-h-[8rem] flex-col gap-1.5 p-2', isToday && 'bg-sky-50/60')}>
              {/* Day header */}
              <div
                className={cn(
                  'mb-1 rounded-xl px-2 py-1 text-center text-xs font-extrabold',
                  isToday ? 'bg-sky-500 text-white' : 'text-muted',
                )}
              >
                {dateLabel}
              </div>

              {daySessions.length === 0 ? (
                <p className="text-center text-[10px] text-muted/60 mt-2">—</p>
              ) : (
                daySessions.map((s) => (
                  <Link
                    key={s.id}
                    to="/teacher/scheduling"
                    title={`${s.title} · ${formatTime(s.startsAt)}–${formatTime(s.endsAt)}`}
                    className={cn(
                      'rounded-xl border px-2 py-1.5 text-[10px] font-bold leading-tight transition hover:shadow-sm',
                      sessionStatusColor(s.status),
                    )}
                  >
                    <p className="truncate">{s.title || s.classroom.name}</p>
                    <p className="mt-0.5 font-normal opacity-80">
                      {formatTime(s.startsAt)}–{formatTime(s.endsAt)}
                    </p>
                    <p className="mt-0.5 font-normal opacity-60 capitalize">
                      {s.classroom.classType === 'one_to_one' ? '1:1' : 'Nhóm'}
                    </p>
                  </Link>
                ))
              )}
            </div>
          )
        })}
      </div>

      {totalThisWeek === 0 && (
        <p className="px-5 py-3 text-center text-sm text-muted">
          Chưa có buổi học nào trong 7 ngày tới.{' '}
          <Link to="/teacher/scheduling" className="font-bold text-sky-600 hover:underline">
            Tạo lịch ngay
          </Link>
        </p>
      )}
    </section>
  )
}

// ── Pending Requests Banner ────────────────────────────────────
function PendingBanner({
  placements,
  reschedules,
}: {
  placements: number
  reschedules: number
}) {
  const total = placements + reschedules
  if (total === 0) return null

  return (
    <Link
      to="/teacher/scheduling"
      className="flex items-center gap-3 rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-3 transition hover:bg-amber-100"
    >
      <AlertCircle size={20} className="shrink-0 text-amber-500" aria-hidden="true" />
      <div className="flex-1 text-sm">
        <p className="font-extrabold text-amber-700">
          {total} yêu cầu đang chờ xử lý
        </p>
        <p className="text-amber-600">
          {placements > 0 && `${placements} xếp lớp`}
          {placements > 0 && reschedules > 0 && ' · '}
          {reschedules > 0 && `${reschedules} đổi lịch`}
          {' — nhấn để xử lý'}
        </p>
      </div>
      <ChevronRight size={17} className="shrink-0 text-amber-500" />
    </Link>
  )
}

// ── Quick Links ────────────────────────────────────────────────
const QUICK_LINKS: QuickLink[] = [
  {
    to: '/teacher',
    label: 'Lớp học',
    description: 'Xem danh sách học sinh, tiến trình',
    icon: Users,
    accent: 'border-sky-200 bg-sky-50 hover:bg-sky-100',
  },
  {
    to: '/teacher/scheduling',
    label: 'Điều phối lịch',
    description: 'Tạo lịch, xếp lớp, xử lý yêu cầu từ phụ huynh',
    icon: CalendarDays,
    accent: 'border-violet-200 bg-violet-50 hover:bg-violet-100',
  },
  {
    to: '/teacher/assessments',
    label: 'Biên soạn test',
    description: 'Tạo câu hỏi, bài kiểm tra cho học sinh',
    icon: PenLine,
    accent: 'border-mint-200 bg-mint-50 hover:bg-mint-100',
  },
  {
    to: '/teacher/lectures',
    label: 'Bài giảng',
    description: 'Biên soạn và quản lý nội dung bài học',
    icon: BookOpen,
    accent: 'border-sun-200 bg-sun-50 hover:bg-sun-100',
  },
  {
    to: '/teacher/stats',
    label: 'Thống kê',
    description: 'Theo dõi tiến bộ cả lớp, cảnh báo hỗ trợ',
    icon: GraduationCap,
    accent: 'border-coral-200 bg-coral-50 hover:bg-coral-100',
  },
  {
    to: '/teacher/operations',
    label: 'Điều hành',
    description: 'Báo cáo, nhật ký vận hành lớp',
    icon: LayoutDashboard,
    accent: 'border-slate-200 bg-slate-50 hover:bg-slate-100',
  },
]

// ── Main Component ────────────────────────────────────────────
export function TeacherDashboardPage() {
  const user = useAuth((s) => s.user)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [sessions, setSessions] = useState<WeekSession[]>([])
  const [loading, setLoading] = useState(true)
  const { toasts, showToast, dismissToast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // Parallel: class info + schedule (7 days)
      const [classData, scheduleData, placementsData, reschedulesData] = await Promise.allSettled([
        api<{ class: { name: string; code: string } | null; students: { id: string }[] }>(
          '/api/teacher/class',
        ),
        api<{ classes: Array<{ sessions: WeekSession[] }> }>('/api/schedule'),
        api<{ requests: { id: string }[] }>('/api/schedule/placement-requests?status=pending'),
        api<{ requests: { id: string }[] }>('/api/schedule/reschedule-requests?status=pending'),
      ])

      const classInfo =
        classData.status === 'fulfilled' ? classData.value : { class: null, students: [] }
      const scheduleInfo =
        scheduleData.status === 'fulfilled' ? scheduleData.value : { classes: [] }
      const placements =
        placementsData.status === 'fulfilled' ? placementsData.value.requests.length : 0
      const reschedules =
        reschedulesData.status === 'fulfilled' ? reschedulesData.value.requests.length : 0

      // Flatten all sessions from all classrooms
      const allSessions: WeekSession[] = scheduleInfo.classes.flatMap((cls) =>
        cls.sessions.map((s) => s as WeekSession),
      )

      // Filter to 7 days from now
      const upcoming = allSessions.filter((s) => {
        const offset = daysFromNow(s.startsAt)
        return offset >= 0 && offset <= 6
      })

      // Count sessions today
      const todayCount = upcoming.filter((s) => daysFromNow(s.startsAt) === 0).length

      setSessions(allSessions)
      setStats({
        studentCount: classInfo.students.length,
        todaySessionCount: todayCount,
        pendingPlacements: placements,
        pendingReschedules: reschedules,
        className: classInfo.class?.name ?? null,
        classCode: classInfo.class?.code ?? null,
      })
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không tải được dữ liệu', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void load()
  }, [load])

  const greeting = user?.nickname ? `Xin chào, ${user.nickname}` : 'Xin chào Giáo viên'
  const now = new Date()
  const timeGreeting =
    now.getHours() < 12 ? 'Chào buổi sáng' : now.getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  if (loading) {
    return (
      <div className="flex flex-col gap-5" aria-busy="true">
        {/* Header skeleton */}
        <div className="ui-card p-5">
          <div className="ui-skeleton h-5 w-32 rounded-xl mb-2" />
          <div className="ui-skeleton h-8 w-64 rounded-xl" />
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="ui-skeleton h-24 rounded-2xl" />
          ))}
        </div>
        {/* Calendar skeleton */}
        <div className="ui-skeleton h-48 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ── Header ───────────────────────────────────────── */}
      <header className="ui-card p-5 sm:p-6">
        <p className="text-xs font-extrabold uppercase tracking-widest text-sky-500">
          {timeGreeting} · Giáo viên
        </p>
        <h1 className="font-display text-2xl sm:text-3xl">{greeting} 👋</h1>
        {stats?.className && (
          <p className="mt-1 text-sm text-muted">
            Lớp: <strong>{stats.className}</strong>
            {stats.classCode && (
              <span className="ml-2 rounded-lg bg-sky-100 px-2 py-0.5 font-mono text-xs font-extrabold text-sky-600">
                {stats.classCode}
              </span>
            )}
          </p>
        )}
      </header>

      {/* ── Pending alert ────────────────────────────────── */}
      {stats && (
        <PendingBanner
          placements={stats.pendingPlacements}
          reschedules={stats.pendingReschedules}
        />
      )}

      {/* ── Stats ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Học sinh"
          value={stats?.studentCount ?? 0}
          icon={Users}
          accent="border-2 border-sky-200 bg-sky-50 text-sky-700"
          to="/teacher"
        />
        <StatCard
          label="Buổi hôm nay"
          value={stats?.todaySessionCount ?? 0}
          icon={Clock}
          accent="border-2 border-violet-200 bg-violet-50 text-violet-700"
          to="/teacher/scheduling"
        />
        <StatCard
          label="Chờ xếp lớp"
          value={stats?.pendingPlacements ?? 0}
          icon={UserRoundPlus}
          accent="border-2 border-amber-200 bg-amber-50 text-amber-700"
          to="/teacher/scheduling"
          badge
        />
        <StatCard
          label="Chờ đổi lịch"
          value={stats?.pendingReschedules ?? 0}
          icon={CalendarDays}
          accent="border-2 border-coral-200 bg-coral-50 text-coral-700"
          to="/teacher/scheduling"
          badge
        />
      </div>

      {/* ── Weekly Calendar ───────────────────────────────── */}
      <WeeklyCalendar sessions={sessions} />

      {/* ── Quick Links ──────────────────────────────────── */}
      <section>
        <h2 className="mb-3 font-display text-lg">Công cụ nhanh</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'flex items-start gap-3 rounded-2xl border-2 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md',
                link.accent,
              )}
            >
              <span className="mt-0.5 shrink-0" aria-hidden="true">
                <link.icon size={20} />
              </span>
              <div>
                <p className="font-bold">{link.label}</p>
                <p className="text-xs leading-relaxed opacity-70">{link.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Refresh ──────────────────────────────────────── */}
      <div className="flex justify-center">
        <Button variant="ghost" onClick={() => void load()}>
          ↻ Làm mới dữ liệu
        </Button>
      </div>
    </div>
  )
}
