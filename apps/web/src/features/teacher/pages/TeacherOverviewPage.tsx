/**
 * TeacherOverviewPage — Trang tổng quan giảng viên.
 * Route: /teacher (index)
 *
 * Hiển thị:
 * - Thống kê nhanh: học sinh, khóa học, bài giảng, học sinh cần hỗ trợ
 * - Trạng thái lớp học (có hay chưa)
 * - Điều hướng nhanh đến các khu vực chính
 * - Danh sách học sinh cần hỗ trợ (needsSupport)
 */
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import {
  BookOpen,
  GraduationCap,
  LayoutGrid,
  RefreshCw,
  Users,
  AlertTriangle,
  MessageSquareText,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'

// ── Types ────────────────────────────────────────────────────
type OverviewData = {
  hasClass: boolean
  className: string | null
  classCode: string | null
  studentCount: number
  courseCount: number
  lectureCount: number
  needsSupportCount: number
  pendingFeedbackCount: number
  topStudents: Array<{ id: string; nickname: string | null; completedQuests: number; level: number; xp: number }>
  supportStudents: Array<{ id: string; nickname: string | null; supportReason: string | null }>
}

// ── Quick Action Card ─────────────────────────────────────────
function QuickCard({
  icon: Icon,
  label,
  desc,
  accent,
  to,
  count,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  desc: string
  accent: string
  to: string
  count?: number
}) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className={cn(
        'group flex flex-col gap-3 rounded-2xl border-2 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md',
        accent,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/70 shadow-sm">
          <Icon size={22} className="text-current opacity-80" />
        </div>
        {count !== undefined && (
          <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-sm font-extrabold">
            {count}
          </span>
        )}
      </div>
      <div>
        <p className="font-display text-base font-bold">{label}</p>
        <p className="mt-0.5 text-xs opacity-70">{desc}</p>
      </div>
    </button>
  )
}

// ── Main page ─────────────────────────────────────────────────
export function TeacherOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch class + stats in parallel
      const [classRes, statsRes, lecturesRes] = await Promise.allSettled([
        api<{ class: { id?: string; name: string; code: string } | null; students: Array<{ id: string; nickname: string | null; level: number; xp: number; completedQuests: number }> }>('/api/teacher/class'),
        api<{ stats: { studentCount: number; totalCompletedQuests: number; openQuestCount: number; projectCount: number; students: Array<{ id: string; nickname: string | null; needsSupport: boolean; supportReason: string | null; completedQuests: number; level: number; xp: number }> } | null }>('/api/teacher/class/stats'),
        api<{ courses: Array<{ id: string; lectures: unknown[] }> }>('/api/teacher/lectures'),
      ])

      const classData = classRes.status === 'fulfilled' ? classRes.value : null
      const statsData = statsRes.status === 'fulfilled' ? statsRes.value.stats : null
      const lecturesData = lecturesRes.status === 'fulfilled' ? lecturesRes.value : null

      const students = classData?.students ?? []
      const statsStudents = statsData?.students ?? []

      const overview: OverviewData = {
        hasClass: !!classData?.class,
        className: classData?.class?.name ?? null,
        classCode: classData?.class?.code ?? null,
        studentCount: students.length,
        courseCount: lecturesData?.courses.length ?? 0,
        lectureCount: lecturesData?.courses.reduce((sum, c) => sum + c.lectures.length, 0) ?? 0,
        needsSupportCount: statsStudents.filter((s) => s.needsSupport).length,
        pendingFeedbackCount: 0,
        topStudents: [...students]
          .sort((a, b) => b.completedQuests - a.completedQuests)
          .slice(0, 5),
        supportStudents: statsStudents
          .filter((s) => s.needsSupport)
          .slice(0, 5)
          .map((s) => ({ id: s.id, nickname: s.nickname, supportReason: s.supportReason })),
      }
      setData(overview)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  if (loading) return <PageSkeleton />

  if (error) {
    return (
      <div className="ui-card flex flex-col items-center gap-4 p-8 text-center">
        <AlertTriangle size={32} className="text-warning" />
        <p className="font-display text-lg">Không tải được dữ liệu</p>
        <p className="text-sm text-muted">{error}</p>
        <Button variant="secondary" onClick={() => void load()} className="gap-2">
          <RefreshCw size={15} /> Thử lại
        </Button>
      </div>
    )
  }

  // Chưa có lớp
  if (!data?.hasClass) {
    return (
      <div className="flex flex-col gap-6">
        <header className="ui-card p-6">
          <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500">Không gian giảng viên</p>
          <h1 className="font-display mt-1 text-2xl">Tổng quan</h1>
        </header>
        <EmptyState
          title="Chưa có lớp học"
          description="Tạo lớp học đầu tiên để bắt đầu quản lý học sinh và theo dõi tiến trình."
          action={<Button onClick={() => navigate('/teacher/class')}>Tạo lớp học</Button>}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="ui-card flex flex-wrap items-end justify-between gap-4 p-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500">Không gian giảng viên</p>
          <h1 className="font-display mt-1 text-2xl">Tổng quan</h1>
          {data.className && (
            <p className="mt-1 text-sm text-muted">
              Lớp <strong>{data.className}</strong> · Mã: <code className="font-mono text-sky-600">{data.classCode}</code>
            </p>
          )}
        </div>
        <Button variant="ghost" className="gap-2 !text-xs" onClick={() => void load()}>
          <RefreshCw size={13} /> Làm mới
        </Button>
      </header>

      {/* ── Stats row ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Học sinh', value: data.studentCount, icon: Users, color: 'bg-sky-50 text-sky-700' },
          { label: 'Khóa học', value: data.courseCount, icon: BookOpen, color: 'bg-brand-50 text-brand-700' },
          { label: 'Bài giảng', value: data.lectureCount, icon: LayoutGrid, color: 'bg-purple-50 text-purple-700' },
          { label: 'Cần hỗ trợ', value: data.needsSupportCount, icon: AlertTriangle, color: data.needsSupportCount > 0 ? 'bg-sun-50 text-warning' : 'bg-mint-50 text-success' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={cn('rounded-2xl p-4', color)}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide opacity-60">{label}</p>
              <Icon size={18} className="opacity-50" aria-hidden="true" />
            </div>
            <p className="font-display mt-1 text-3xl">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Quick navigation ─────────────────────────────────── */}
      <section aria-label="Điều hướng nhanh">
        <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-muted">Khu vực</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <QuickCard
            icon={Users}
            label="Lớp & Học sinh"
            desc="Quản lý danh sách, tiến trình"
            accent="border-sky-200 bg-sky-50 text-sky-800"
            to="/teacher/class"
            count={data.studentCount}
          />
          <QuickCard
            icon={MessageSquareText}
            label="Nhận xét"
            desc="Gửi đánh giá cho phụ huynh"
            accent="border-teal-200 bg-teal-50 text-teal-800"
            to="/teacher/feedback"
          />
          <QuickCard
            icon={BookOpen}
            label="Khóa học"
            desc="Tạo và quản lý khóa học"
            accent="border-brand-200 bg-brand-50 text-brand-800"
            to="/teacher/courses"
            count={data.courseCount}
          />
          <QuickCard
            icon={LayoutGrid}
            label="Bài giảng"
            desc="Soạn thảo 4 trạm bài học"
            accent="border-purple-200 bg-purple-50 text-purple-800"
            to="/teacher/lectures"
            count={data.lectureCount}
          />
          <QuickCard
            icon={TrendingUp}
            label="Thống kê"
            desc="Tiến trình và gợi ý hỗ trợ"
            accent="border-emerald-200 bg-emerald-50 text-emerald-800"
            to="/teacher/stats"
            count={data.studentCount}
          />
        </div>
      </section>

      {/* ── Two columns: top students + needs support ─────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top performers */}
        <section className="ui-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <GraduationCap size={18} className="text-brand-500" />
              <h2 className="font-display text-base">Học sinh nổi bật</h2>
            </div>
            <button
              type="button"
              className="text-xs font-bold text-brand-500 hover:underline"
              onClick={() => navigate('/teacher/class')}
            >
              Xem tất cả
            </button>
          </div>
          {data.topStudents.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted">Chưa có học sinh nào</p>
          ) : (
            <ul className="divide-y divide-border/40">
              {data.topStudents.map((s, i) => (
                <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sky-50 text-xs font-extrabold text-sky-600">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{s.nickname ?? 'Học viên'}</p>
                    <p className="text-xs text-muted">Lv{s.level} · {s.xp} XP</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-600">
                    {s.completedQuests} trạm
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Needs support */}
        <section className="ui-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <MessageSquareText size={18} className="text-warning" />
              <h2 className="font-display text-base">Cần hỏi thăm</h2>
            </div>
            <button
              type="button"
              className="text-xs font-bold text-brand-500 hover:underline"
              onClick={() => navigate('/teacher/stats')}
            >
              Xem thống kê
            </button>
          </div>
          {data.supportStudents.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-5 py-8 text-center">
              <span className="text-2xl">🎉</span>
              <p className="text-sm font-bold text-success">Tất cả học sinh đang tiến triển tốt!</p>
            </div>
          ) : (
            <ul className="divide-y divide-border/40">
              {data.supportStudents.map((s) => (
                <li key={s.id} className="flex items-start gap-3 bg-sun-50/40 px-5 py-3">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warning" />
                  <div className="min-w-0">
                    <p className="font-bold">{s.nickname ?? 'Học viên'}</p>
                    {s.supportReason && (
                      <p className="mt-0.5 text-xs text-muted">{s.supportReason}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
