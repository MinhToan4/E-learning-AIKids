/**
 * TeacherOverviewPage — Trang tổng quan giảng viên chuyên nghiệp (UI/UX Pro Max Standard)
 * Route: /teacher
 *
 * Tính năng chính:
 * - Header thông tin lớp, mã mời với nút Copy 1-chạm & Làm mới
 * - 4 Thẻ Hero KPIs phân tích với sparkline & chỉ số tăng trưởng
 * - Biểu đồ nhịp độ học tập theo tuần (Weekly Activity Chart) SVG thuần
 * - Biểu đồ vòng tròn tiến độ lớp học & phân bổ 4 trạm học (ProgressRingChart)
 * - Trung tâm hỗ trợ học sinh cần chú ý (Actionable Intervention Hub)
 * - Bảng vinh danh học sinh tích cực (Top Explorers Leaderboard)
 * - Lưới điều hướng nhanh (Bento Grid) với bộ icon chuẩn mực
 */
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router'
import {
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Send,
  GraduationCap,
  CalendarCheck,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { ProgressRingChart } from '@/shared/components/charts/ProgressRingChart'
import { StatMetricCard } from '@/shared/components/charts/StatMetricCard'
import {
  CmsClassesIcon,
  CmsCoursesIcon,
  CmsLecturesIcon,
  CmsAnalyticsIcon,
  CmsFeedbackIcon,
  CmsUsersIcon,
  CmsSupportIcon,
  CmsTrophyIcon,
} from '@/shared/components/icons/CmsIcons'
import { avatarEmoji } from '@/shared/config/avatars'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'

// ── Types ────────────────────────────────────────────────────
type TopStudent = {
  id: string
  nickname: string | null
  avatarId?: string | null
  completedQuests: number
  level: number
  xp: number
}

type SupportStudent = {
  id: string
  nickname: string | null
  avatarId?: string | null
  supportReason: string | null
  completedQuests: number
  level: number
  xp: number
  lastActiveAt?: string | null
}

type OverviewData = {
  hasClass: boolean
  className: string | null
  classCode: string | null
  studentCount: number
  courseCount: number
  lectureCount: number
  totalCompletedQuests: number
  openQuestCount: number
  projectCount: number
  needsSupportCount: number
  topStudents: TopStudent[]
  supportStudents: SupportStudent[]
  completionRate: number
  progressDistribution: Array<{
    label: string
    emoji: string
    count: number
    pct: number
    gradient: string
    bg: string
  }>
}

// ── Quick Navigation Bento Card ──────────────────────────────
function QuickNavCard({
  icon,
  label,
  desc,
  accent,
  to,
  count,
  badge,
}: {
  icon: React.ReactNode
  label: string
  desc: string
  accent: string
  to: string
  count?: number
  badge?: string
}) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className={cn(
        'group flex flex-col justify-between rounded-2xl border-2 p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:translate-y-0',
        accent,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-sm transition-transform duration-200 group-hover:scale-110">
          {icon}
        </div>
        <div className="flex items-center gap-1.5">
          {badge && (
            <span className="rounded-full bg-sun-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-900">
              {badge}
            </span>
          )}
          {count !== undefined && (
            <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-black shadow-sm">
              {count}
            </span>
          )}
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="font-display text-base font-bold">{label}</p>
          <ArrowRight
            size={16}
            className="transform opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
          />
        </div>
        <p className="mt-0.5 text-xs opacity-75">{desc}</p>
      </div>
    </button>
  )
}

// ── Main Page Component ──────────────────────────────────────
export function TeacherOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [classRes, statsRes, lecturesRes] = await Promise.allSettled([
        api<{
          class: { id?: string; name: string; code: string } | null
          students: Array<{
            id: string
            nickname: string | null
            avatarId?: string | null
            level: number
            xp: number
            completedQuests: number
          }>
        }>('/api/teacher/class'),
        api<{
          stats: {
            studentCount: number
            totalCompletedQuests: number
            openQuestCount: number
            projectCount: number
            students: Array<{
              id: string
              nickname: string | null
              avatarId?: string | null
              needsSupport: boolean
              supportReason: string | null
              completedQuests: number
              level: number
              xp: number
              lastActiveAt?: string | null
            }>
          } | null
        }>('/api/teacher/class/stats'),
        api<{ courses: Array<{ id: string; lectures: unknown[] }> }>('/api/teacher/lectures'),
      ])

      const classData = classRes.status === 'fulfilled' ? classRes.value : null
      const statsData = statsRes.status === 'fulfilled' ? statsRes.value.stats : null
      const lecturesData = lecturesRes.status === 'fulfilled' ? lecturesRes.value : null

      const students = classData?.students ?? []
      const statsStudents = statsData?.students ?? []
      const totalCompleted = statsData?.totalCompletedQuests ?? students.reduce((sum, s) => sum + s.completedQuests, 0)
      const openQuests = statsData?.openQuestCount ?? 8
      const totalTargetQuests = Math.max((students.length || 1) * openQuests, 1)
      const completionRate = Math.min(Math.round((totalCompleted / totalTargetQuests) * 100), 100)



      const overview: OverviewData = {
        hasClass: !!classData?.class,
        className: classData?.class?.name ?? null,
        classCode: classData?.class?.code ?? null,
        studentCount: students.length,
        courseCount: lecturesData?.courses.length ?? 0,
        lectureCount: lecturesData?.courses.reduce((sum, c) => sum + c.lectures.length, 0) ?? 0,
        totalCompletedQuests: totalCompleted,
        openQuestCount: openQuests,
        projectCount: statsData?.projectCount ?? 0,
        needsSupportCount: statsStudents.filter((s) => s.needsSupport).length,
        topStudents: [...students]
          .sort((a, b) => b.completedQuests - a.completedQuests || b.xp - a.xp)
          .slice(0, 5),
        supportStudents: statsStudents
          .filter((s) => s.needsSupport)
          .slice(0, 5)
          .map((s) => ({
            id: s.id,
            nickname: s.nickname,
            avatarId: s.avatarId,
            supportReason: s.supportReason,
            completedQuests: s.completedQuests,
            level: s.level,
            xp: s.xp,
            lastActiveAt: s.lastActiveAt,
          })),
        completionRate,
        progressDistribution: (() => {
          const total = students.length || 1
          // Tiến độ theo số trạm hoàn thành thực tế
          const tiers = [
            {
              label: 'Chưa bắt đầu',
              emoji: '💤',
              gradient: 'from-slate-400 to-slate-300',
              bg: 'bg-slate-100',
              test: (q: number) => q === 0,
            },
            {
              label: 'Mới khởi động',
              emoji: '🌱',
              gradient: 'from-sky-500 to-sky-300',
              bg: 'bg-sky-50',
              test: (q: number) => q >= 1 && q <= 3,
            },
            {
              label: 'Đang tiến bộ',
              emoji: '🚀',
              gradient: 'from-brand-500 to-brand-300',
              bg: 'bg-brand-50',
              test: (q: number) => q >= 4 && q <= 10,
            },
            {
              label: 'Xuất sắc',
              emoji: '⭐',
              gradient: 'from-amber-500 to-amber-300',
              bg: 'bg-amber-50',
              test: (q: number) => q > 10,
            },
          ]
          return tiers.map((tier) => {
            const count = students.filter((s) => tier.test(s.completedQuests)).length
            return {
              label: tier.label,
              emoji: tier.emoji,
              count,
              pct: Math.round((count / total) * 100),
              gradient: tier.gradient,
              bg: tier.bg,
            }
          })
        })(),
      }

      setData(overview)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được dữ liệu tổng quan')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const copyCode = useCallback(() => {
    if (!data?.classCode) return
    void navigator.clipboard.writeText(data.classCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2500)
  }, [data?.classCode])

  const totalClassXp = useMemo(() => {
    return data?.topStudents.reduce((sum, s) => sum + s.xp, 0) ?? 0
  }, [data?.topStudents])

  if (loading) return <PageSkeleton />

  if (error) {
    return (
      <div className="ui-card flex flex-col items-center gap-4 p-8 text-center">
        <CmsSupportIcon size={40} className="text-warning" />
        <h2 className="font-display text-xl font-bold">Không tải được dữ liệu tổng quan</h2>
        <p className="text-sm text-muted">{error}</p>
        <Button variant="secondary" onClick={() => void load()} className="gap-2">
          <RefreshCw size={15} /> Thử lại
        </Button>
      </div>
    )
  }

  // Chưa tạo lớp
  if (!data?.hasClass) {
    return (
      <div className="flex flex-col gap-6">
        <header className="ui-card p-6">
          <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500">
            Không gian Giảng viên
          </p>
          <h1 className="font-display mt-1 text-2xl font-bold">Tổng quan Lớp học</h1>
        </header>
        <EmptyState
          title="Chưa có lớp học nào"
          description="Tạo lớp học đầu tiên để cấp mã tham gia cho học sinh, mở bài giảng và theo dõi tiến trình trực quan."
          action={
            <Button onClick={() => navigate('/teacher/class')} className="gap-2">
              <GraduationCap size={18} /> Tạo lớp học ngay
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── 1. Hero Class Header ─────────────────────────────── */}
      <header className="ui-card relative overflow-hidden p-6 shadow-soft">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-brand-500/5 blur-2xl" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-0.5 text-xs font-black text-brand-700">
                <Sparkles size={12} /> Không gian Giảng viên
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                ● Đang hoạt động
              </span>
            </div>
            <h1 className="font-display mt-1 text-2xl font-black text-text md:text-3xl">
              {data.className || 'Lớp học AI Creator'}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
              <span>
                Mã lớp:{' '}
                <strong className="font-mono text-base font-bold text-sky-600">
                  {data.classCode}
                </strong>
              </span>
              <button
                type="button"
                onClick={copyCode}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
                title="Sao chép mã lớp cho học sinh"
              >
                {copiedCode ? (
                  <>
                    <Check size={13} className="text-emerald-600" />
                    <span className="text-emerald-600">Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Sao chép mã</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="gap-2 !text-xs font-bold"
              onClick={() => navigate('/teacher/feedback')}
            >
              <CmsFeedbackIcon size={16} /> Gửi nhận xét
            </Button>
            <Button
              variant="ghost"
              className="gap-2 !text-xs font-bold"
              onClick={() => void load()}
            >
              <RefreshCw size={13} /> Làm mới
            </Button>
          </div>
        </div>
      </header>

      {/* ── 2. Metric KPI Cards Row ──────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatMetricCard
          label="Tổng học sinh"
          value={data.studentCount}
          icon={<CmsUsersIcon size={32} />}
          color="sky"
          trend={data.studentCount > 0 ? { value: `${data.studentCount} tài khoản`, isPositive: true } : undefined}
          sparklineData={[data.studentCount]}
          subtext={`${data.studentCount} học sinh đang theo học`}
          onClick={() => navigate('/teacher/class')}
        />
        <StatMetricCard
          label="Trạm hoàn thành"
          value={data.totalCompletedQuests}
          icon={<CmsAnalyticsIcon size={32} />}
          color="mint"
          trend={{ value: `${data.completionRate}% tiến độ`, isPositive: data.completionRate > 0 }}
          sparklineData={[data.totalCompletedQuests]}
          subtext={`Đạt ${data.completionRate}% mục tiêu mở`}
          onClick={() => navigate('/teacher/stats')}
        />
        <StatMetricCard
          label="Khóa & Bài giảng"
          value={`${data.courseCount} / ${data.lectureCount}`}
          icon={<CmsLecturesIcon size={32} />}
          color="purple"
          sparklineData={[data.courseCount]}
          subtext={`${data.courseCount} khóa · ${data.lectureCount} trạm học`}
          onClick={() => navigate('/teacher/lectures')}
        />
        <StatMetricCard
          label="Cần hỏi thăm"
          value={data.needsSupportCount}
          icon={<CmsSupportIcon size={32} />}
          color={data.needsSupportCount > 0 ? 'coral' : 'mint'}
          badge={data.needsSupportCount > 0 ? 'Ưu tiên hỗ trợ' : 'Tất cả đều ổn'}
          sparklineData={[data.needsSupportCount]}
          subtext={
            data.needsSupportCount > 0
              ? `${data.needsSupportCount} bạn đang cần gợi ý`
              : 'Tiến độ học tập rất tốt'
          }
          onClick={() => navigate('/teacher/stats')}
        />
      </div>

      {/* ── 3. Dual Charts Row: Weekly Trend & Station Distribution */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Class Progress Distribution — real aggregate data */}
        <div className="lg:col-span-2">
          <div className="ui-card h-full p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-text">Phân bổ tiến độ lớp học</h3>
                <p className="text-xs text-muted">
                  Nhóm học sinh theo mức hoàn thành trạm — {data.studentCount} học sinh
                </p>
              </div>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-extrabold text-brand-700">
                {data.totalCompletedQuests} trạm tổng
              </span>
            </div>

            <div className="space-y-3">
              {data.progressDistribution.map((tier) => (
                <div key={tier.label} className="group flex items-center gap-3">
                  {/* Emoji + Label */}
                  <div className={`flex w-36 shrink-0 items-center gap-2 rounded-lg px-2.5 py-1.5 ${tier.bg}`}>
                    <span className="text-base leading-none">{tier.emoji}</span>
                    <span className="text-[11px] font-bold text-slate-700 leading-tight">{tier.label}</span>
                  </div>

                  {/* Bar */}
                  <div className="relative h-7 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${tier.gradient} transition-all duration-700`}
                      style={{ width: `${Math.max(tier.pct, tier.count > 0 ? 4 : 0)}%` }}
                    />
                    {tier.count > 0 && (
                      <span className="absolute inset-y-0 left-3 flex items-center text-[11px] font-extrabold text-white drop-shadow">
                        {tier.count} học sinh
                      </span>
                    )}
                  </div>

                  {/* Percentage */}
                  <span className="w-10 shrink-0 text-right text-sm font-extrabold text-slate-700">
                    {tier.pct}%
                  </span>
                </div>
              ))}
            </div>

            {/* Summary footer */}
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3">
              <div className="text-center">
                <p className="text-lg font-black text-brand-600">{data.completionRate}%</p>
                <p className="text-[10px] font-semibold text-muted">Tiến độ lớp</p>
              </div>
              <div className="text-center border-x border-border/40">
                <p className="text-lg font-black text-text">{data.studentCount}</p>
                <p className="text-[10px] font-semibold text-muted">Học sinh</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-amber-600">
                  {data.progressDistribution.find(t => t.label === 'Xuất sắc')?.count ?? 0}
                </p>
                <p className="text-[10px] font-semibold text-muted">Xuất sắc ⭐</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Class Station Completion Progress Gauge */}
        <div className="ui-card flex flex-col justify-between p-5 transition hover:shadow-md">
          <div className="border-b border-border/50 pb-3">
            <h3 className="font-display text-base font-bold text-text">Tiến độ Trạm học</h3>
            <p className="text-xs text-muted">Tỷ lệ hoàn thành toàn bộ khóa học</p>
          </div>

          <div className="my-4 flex items-center justify-center">
            <ProgressRingChart
              percent={data.completionRate}
              size={135}
              strokeWidth={11}
              color="mint"
              sublabel={`${data.totalCompletedQuests} trạm đã chinh phục`}
            />
          </div>

          <div className="space-y-2 text-xs">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted">
              Tiến độ tổng quan lớp
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-700">Hoàn thành</span>
              <div className="flex flex-1 items-center gap-2 justify-end">
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all duration-700"
                    style={{ width: `${data.completionRate}%` }}
                  />
                </div>
                <span className="w-9 text-right font-extrabold text-slate-700">{data.completionRate}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-700">Cần hỗ trợ</span>
              <div className="flex flex-1 items-center gap-2 justify-end">
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-700"
                    style={{ width: `${data.studentCount > 0 ? Math.round((data.needsSupportCount / data.studentCount) * 100) : 0}%` }}
                  />
                </div>
                <span className="w-9 text-right font-extrabold text-slate-700">
                  {data.studentCount > 0 ? Math.round((data.needsSupportCount / data.studentCount) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Actionable Intervention Hub & Top Leaderboard ──── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Support Hub: Actionable Student Cards */}
        <section className="ui-card overflow-hidden shadow-soft">
          <div className="flex items-center justify-between border-b border-border/60 bg-amber-50/40 px-5 py-4">
            <div className="flex items-center gap-2">
              <CmsSupportIcon size={20} className="text-amber-600" />
              <div>
                <h2 className="font-display text-base font-bold text-text">
                  Học sinh cần hỏi thăm & gợi ý
                </h2>
                <p className="text-xs text-muted">
                  Gợi ý sư phạm hỗ trợ kịp thời, không xếp loại trẻ
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="!text-xs font-bold text-brand-600"
              onClick={() => navigate('/teacher/stats')}
            >
              Xem tất cả
            </Button>
          </div>

          {data.supportStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-5 py-10 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-2xl">
                🎉
              </div>
              <p className="font-display text-base font-bold text-emerald-700">
                Tất cả học sinh đang tiến triển rất tốt!
              </p>
              <p className="max-w-xs text-xs text-muted">
                Không có bạn nào bị gián đoạn hay gặp khó khăn kéo dài trong các bài học gần đây.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/40">
              {data.supportStudents.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-3 bg-amber-50/20 p-4 transition hover:bg-amber-50/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" role="img" aria-label="Avatar">
                      {avatarEmoji(s.avatarId ?? null)}
                    </span>
                    <div>
                      <p className="font-display text-sm font-bold text-text">
                        {s.nickname || 'Học viên'}
                      </p>
                      <p className="text-xs font-medium text-amber-900">
                        {s.supportReason || 'Chưa hoàn thành trạm trong 3 ngày qua'}
                      </p>
                      <span className="text-[11px] text-muted">
                        Đã xong {s.completedQuests} trạm · Cấp {s.level}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      className="gap-1.5 !px-3 !py-1 !text-xs font-bold"
                      onClick={() => navigate('/teacher/feedback')}
                    >
                      <Send size={12} /> Gửi nhận xét
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Top Explorers Leaderboard */}
        <section className="ui-card overflow-hidden shadow-soft">
          <div className="flex items-center justify-between border-b border-border/60 bg-brand-50/40 px-5 py-4">
            <div className="flex items-center gap-2">
              <CmsTrophyIcon size={20} className="text-brand-600" />
              <div>
                <h2 className="font-display text-base font-bold text-text">
                  Bảng vinh danh học sinh tích cực
                </h2>
                <p className="text-xs text-muted">
                  Tuyên dương các bạn có số trạm hoàn thành cao nhất
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="!text-xs font-bold text-brand-600"
              onClick={() => navigate('/teacher/class')}
            >
              Danh sách lớp
            </Button>
          </div>

          {data.topStudents.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">Chưa có dữ liệu học sinh</p>
          ) : (
            <ul className="divide-y divide-border/40">
              {data.topStudents.map((s, idx) => {
                const medalColors = [
                  'bg-amber-100 text-amber-800 border-amber-300', // 1st Gold
                  'bg-slate-100 text-slate-700 border-slate-300', // 2nd Silver
                  'bg-amber-50 text-amber-900 border-amber-200',  // 3rd Bronze
                ]
                const medalLabels = ['🥇', '🥈', '🥉', `${idx + 1}`]

                return (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-slate-50/60"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'grid h-8 w-8 place-items-center rounded-full border text-xs font-black shadow-sm',
                          medalColors[idx] || 'bg-slate-50 text-muted border-border',
                        )}
                      >
                        {medalLabels[idx] || idx + 1}
                      </span>
                      <span className="text-2xl">{avatarEmoji(s.avatarId ?? null)}</span>
                      <div>
                        <p className="font-display text-sm font-bold text-text">
                          {s.nickname || 'Học viên'}
                        </p>
                        <p className="text-xs text-muted">
                          Cấp {s.level} · {s.xp} XP tích lũy
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-extrabold text-brand-600">
                        {s.completedQuests} trạm
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      {/* ── 5. Quick Navigation Bento Grid ───────────────────── */}
      <section aria-label="Khu vực quản lý giảng viên">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-extrabold uppercase tracking-widest text-muted">
            Khu vực làm việc chuyên môn
          </p>
          <span className="text-xs text-muted">5 phân hệ quản lý</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <QuickNavCard
            icon={<CmsClassesIcon size={34} />}
            label="Lớp & Học sinh"
            desc="Sĩ số, danh sách & tiến độ"
            accent="border-sky-200 bg-sky-50/60 text-sky-900"
            to="/teacher/class"
            count={data.studentCount}
          />
          <QuickNavCard
            icon={<CmsFeedbackIcon size={34} />}
            label="Nhận xét phụ huynh"
            desc="Đánh giá & chia sẻ kết quả"
            accent="border-emerald-200 bg-emerald-50/60 text-emerald-900"
            to="/teacher/feedback"
            badge="Tương tác"
          />
          <QuickNavCard
            icon={<CmsCoursesIcon size={34} />}
            label="Khóa học"
            desc="Quản lý & kích hoạt giáo trình"
            accent="border-brand-200 bg-brand-50/60 text-brand-900"
            to="/teacher/courses"
            count={data.courseCount}
          />
          <QuickNavCard
            icon={<CmsLecturesIcon size={34} />}
            label="Soạn 4 trạm bài học"
            desc="Video, thực hành, sáng tạo, quiz"
            accent="border-purple-200 bg-purple-50/60 text-purple-900"
            to="/teacher/lectures"
            count={data.lectureCount}
          />
          <QuickNavCard
            icon={<CmsAnalyticsIcon size={34} />}
            label="Thống kê chi tiết"
            desc="Báo cáo phân tích chuyên sâu"
            accent="border-amber-200 bg-amber-50/60 text-amber-900"
            to="/teacher/stats"
          />
        </div>
      </section>
    </div>
  )
}
