import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  ArrowRight,
  Bell,
  BookOpen,
  CheckCircle2,
  Lock,
  Plus,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { StatMetricCard } from '@/shared/components/charts/StatMetricCard'
import {
  ParentApprovalIcon,
  ParentKidsIcon,
  ParentQuestIcon,
  ParentStarsIcon,
} from '@/shared/components/icons/ParentIcons'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { useAuth } from '@/shared/store/auth'
import { LoadingSkeleton } from '@/features/parent/components/ParentStatCard'
import { avatarEmoji } from '@/features/parent/components/EditChildModal'
import {
  CREDIT_PACKS,
  type CheckoutProductMode,
} from '@/features/parent/components/ParentSubscriptionCheckoutModal'
import type { Approval, Child, HouseholdSub, PlanRow } from '@/features/parent/types/parent.types'

export function ParentDashboardTab({
  onOpenCheckout,
}: {
  onOpenCheckout: (
    mode: CheckoutProductMode,
    planId?: string,
    amount?: number,
    name?: string,
    packId?: string,
  ) => void
}) {
  const [kids, setKids] = useState<Child[]>([])
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [sub, setSub] = useState<HouseholdSub | null>(null)
  const [plans, setPlans] = useState<PlanRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashPricingMode, setDashPricingMode] = useState<'sub' | 'credits'>('sub')
  const navigate = useNavigate()
  const user = useAuth((s) => s.user)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const [childrenData, approvalsData, subData, plansData] = await Promise.allSettled([
      api<{ children: Child[] }>('/api/parent/children'),
      api<{ approvals: Approval[] }>('/api/parent/approvals?status=pending'),
      api<{ subscription: HouseholdSub }>('/api/parent/subscription'),
      api<{ plans: PlanRow[] }>('/api/parent/plans'),
    ])
    if (childrenData.status === 'rejected') {
      setError('Chưa tải được dữ liệu của các con. Ba / Mẹ thử lại nhé.')
      setLoading(false)
      return
    }
    setKids(childrenData.value.children)
    setApprovals(approvalsData.status === 'fulfilled' ? approvalsData.value.approvals : [])
    if (subData.status === 'fulfilled') {
      setSub(subData.value.subscription)
    }
    if (plansData.status === 'fulfilled') {
      setPlans(plansData.value.plans)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const handleReload = () => void load()
    window.addEventListener('parent:reload-data', handleReload)
    return () => window.removeEventListener('parent:reload-data', handleReload)
  }, [load])

  if (loading) {
    return <LoadingSkeleton count={3} />
  }

  if (error) return <ErrorState message={error} onRetry={() => void load()} inline />

  const totalXp = kids.reduce((s, k) => s + k.xp, 0)
  const totalStars = kids.reduce((s, k) => s + (k.totalStars ?? 0), 0)
  const totalQuests = kids.reduce((s, k) => s + (k.completedQuests ?? 0), 0)
  const pendingCount = approvals.length

  return (
    <div className="flex flex-col gap-6">
      {/* ── 1. Household Status Banner & Cockpit ──────────────── */}
      <header className="rounded-3xl border border-border/80 bg-gradient-to-b from-brand-50/70 via-white to-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-100/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-0.5 text-xs font-black text-brand-700">
              <Sparkles size={12} /> 👨👩👧 Góc Phụ Huynh & Gia Đình
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
              Tổng quan gia đình
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="gap-2 !text-xs font-bold"
              onClick={() => navigate('/parent/kids')}
            >
              <ParentKidsIcon size={18} /> Quản lý con
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

        <div className="mt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-black text-slate-900 sm:text-3xl">
              Chào Ba / Mẹ {(user?.nickname || user?.name) ?? ''}! ✨
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1 max-w-2xl leading-relaxed">
              Cùng theo dõi sự tiến bộ, khích lệ sáng tạo và đồng hành trên từng trạm học của con.
            </p>
          </div>

          {/* Subscription Cockpit Capsule */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brand-200/80 bg-gradient-to-r from-brand-50/80 to-purple-50/80 p-3.5 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-white shadow-clay text-lg">
                👑
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wide text-brand-700">
                    Gói học hiện tại
                  </span>
                  <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-black text-brand-800">
                    {sub?.planName || 'Khởi Đầu'}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-700">
                  {kids.length}/{sub?.maxChildren ?? 1} hồ sơ con · {sub?.maxOpenCoursesPerChild ?? 2} vùng mở cùng lúc
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="primary"
                className="gap-1.5 !text-xs font-black shadow-clay bg-brand-500 hover:bg-brand-600 text-white rounded-xl"
                onClick={() => onOpenCheckout('sub', 'aikids_pro', 129000, 'AI Kids Pro')}
              >
                <Sparkles size={13} /> ⭐ Nâng cấp gói
              </Button>
              <Button
                variant="secondary"
                className="gap-1.5 !text-xs font-bold rounded-xl border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                onClick={() => onOpenCheckout('credits', undefined, 100000, '50 lượt tạo ảnh AI', 'credits_50')}
              >
                ⚡ Nạp lượt AI
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. Metric KPI Cards ──────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatMetricCard
          label="Số con theo học"
          value={kids.length}
          icon={<ParentKidsIcon size={32} />}
          color="sky"
          trend={kids.length > 0 ? { value: `${kids.length} hồ sơ`, isPositive: true } : undefined}
          sparklineData={[kids.length]}
          subtext="Học an toàn bằng biệt danh & PIN"
          onClick={() => navigate('/parent/kids')}
        />
        <StatMetricCard
          label="Tổng sao tích lũy"
          value={totalStars}
          icon={<ParentStarsIcon size={32} />}
          color="sun"
          trend={totalStars > 0 ? { value: `${totalStars} sao`, isPositive: true } : undefined}
          sparklineData={[totalStars]}
          subtext={`${totalStars} sao đạt từ các bài quiz`}
        />
        <StatMetricCard
          label="Nhiệm vụ hoàn thành"
          value={totalQuests}
          icon={<ParentQuestIcon size={32} />}
          color="mint"
          trend={totalQuests > 0 ? { value: `${totalQuests} trạm`, isPositive: true } : undefined}
          sparklineData={[totalQuests]}
          subtext={`${totalQuests} trạm học đã chinh phục`}
          onClick={() => navigate('/parent/learning')}
        />
        <StatMetricCard
          label="Chờ duyệt sáng tạo"
          value={pendingCount}
          icon={<ParentApprovalIcon size={32} />}
          color={pendingCount > 0 ? 'coral' : 'brand'}
          badge={pendingCount > 0 ? 'Cần duyệt ngay' : 'Đã duyệt hết'}
          sparklineData={[pendingCount]}
          subtext={
            pendingCount > 0
              ? `${pendingCount} tác phẩm con muốn chia sẻ`
              : 'Tất cả tác phẩm đã sẵn sàng'
          }
          onClick={() => navigate('/parent/approvals')}
        />
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          to="/parent/kids"
          className="ui-card flex items-center gap-3 p-4 transition hover:ring-2 hover:ring-brand-300"
        >
          <ParentKidsIcon size={32} aria-hidden="true" />
          <div>
            <p className="font-bold">Quản lý hồ sơ con</p>
            <p className="text-xs text-muted">Danh tính, PIN và quyền an toàn</p>
          </div>
        </Link>
        <Link
          to="/parent/learning"
          className="ui-card flex items-center gap-3 p-4 transition hover:ring-2 hover:ring-brand-300"
        >
          <BookOpen size={30} className="text-brand-500" aria-hidden="true" />
          <div>
            <p className="font-bold">Theo dõi học tập</p>
            <p className="text-xs text-muted">Lộ trình, hoạt động và năng lực</p>
          </div>
        </Link>
        <Link
          to="/parent/approvals"
          className="ui-card flex items-center gap-3 p-4 transition hover:ring-2 hover:ring-coral-300"
        >
          <Bell size={30} className="text-coral-500" aria-hidden="true" />
          <div>
            <p className="font-bold">Duyệt chia sẻ</p>
            <p className="text-xs text-muted">{pendingCount} yêu cầu đang chờ</p>
          </div>
        </Link>
      </div>

      {/* ── 3. Per-Child Progress — dữ liệu thực từ API ─────────── */}
      {kids.length > 0 && (
        <div className="ui-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-text">Tiến độ từng con</h3>
              <p className="text-xs text-muted">Số trạm học đã chinh phục — dữ liệu thực từ hệ thống</p>
            </div>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-extrabold text-brand-700">
              Tổng: {totalQuests} trạm
            </span>
          </div>
          <div className="flex items-end gap-4">
            {kids.map((kid) => {
              const quests = kid.completedQuests ?? 0
              const maxQuests = Math.max(...kids.map((k) => k.completedQuests ?? 0), 1)
              const pct = Math.round((quests / maxQuests) * 100)
              return (
                <div key={kid.id} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-extrabold text-text">{quests}</span>
                  <div className="relative w-full overflow-hidden rounded-xl bg-slate-100" style={{ height: 80 }}>
                    <div
                      className="absolute bottom-0 w-full rounded-xl bg-gradient-to-t from-brand-500 to-brand-300 transition-all duration-700"
                      style={{ height: `${Math.max(pct, 8)}%` }}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="max-w-[72px] truncate text-center text-[11px] font-bold text-text">
                      {kid.nickname}
                    </span>
                    <span className="text-[10px] text-muted">Cấp {kid.level ?? 1}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 4. Children Deep-Dive Journey Cards ──────────────── */}
      <section aria-label="Tiến trình chi tiết từng con">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-text">Hành trình học tập của các con</h3>
            <p className="text-xs text-muted">Chi tiết cấp độ, kinh nghiệm và cài đặt an toàn</p>
          </div>
          <Button
            variant="ghost"
            className="!text-xs font-bold text-brand-600"
            onClick={() => navigate('/parent/kids')}
          >
            Quản lý hồ sơ
          </Button>
        </div>

        {kids.length === 0 ? (
          <div className="ui-card flex flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="text-4xl">👶</span>
            <p className="font-display text-base font-bold">Chưa có hồ sơ con nào</p>
            <p className="max-w-md text-xs text-muted">
              Ba / Mẹ hãy tạo hồ sơ cho con để bé có thể bắt đầu đăng nhập bằng biệt danh và học tập.
            </p>
            <Button onClick={() => navigate('/parent/kids')} className="gap-2">
              <Plus size={16} /> Thêm hồ sơ con
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {kids.map((k) => {
              const nextLevelXp = Math.max(k.level * 200, 100)
              const currentLvlXp = k.xp % nextLevelXp
              const progressPct = Math.min(Math.round((currentLvlXp / nextLevelXp) * 100), 100)

              return (
                <div
                  key={k.id}
                  className="ui-card flex flex-col justify-between p-5 transition hover:shadow-md"
                >
                  {/* Top: Child Avatar + Level + Name */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span
                          className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-3xl shadow-sm"
                          role="img"
                          aria-label="Avatar"
                        >
                          {avatarEmoji(k.avatarId)}
                        </span>
                        <span className="absolute -bottom-1.5 -right-1.5 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-black text-white shadow-sm">
                          Lv.{k.level}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display text-base font-bold text-text">
                            {k.nickname || 'Bé yêu'}
                          </h4>
                          <span
                            className={cn(
                              'h-2 w-2 rounded-full',
                              k.active ? 'bg-emerald-500' : 'bg-slate-300',
                            )}
                            title={k.active ? 'Đang hoạt động' : 'Tạm dừng'}
                          />
                        </div>
                        <p className="text-xs text-muted">
                          {k.ageBand ? `Nhóm tuổi: ${k.ageBand}` : 'Nhóm tuổi: 8-11'} · {k.xp} XP
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-sun-50 px-2.5 py-1 text-xs font-black text-amber-700">
                        ⭐ {k.totalStars ?? 0}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-mint-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                        🚀 {k.completedQuests ?? 0} trạm
                      </span>
                    </div>
                  </div>

                  {/* Level Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-muted">Tiến độ lên Cấp {k.level + 1}</span>
                      <span className="font-black text-brand-600">
                        {currentLvlXp} / {nextLevelXp} XP ({progressPct}%)
                      </span>
                    </div>
                    <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-sky-400 transition-all duration-700"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Safety & Permissions Badges */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/40 pt-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold',
                        k.allowAiCreate
                          ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                          : 'bg-slate-100 text-slate-500',
                      )}
                    >
                      <Sparkles size={11} /> AI Sáng tạo: {k.allowAiCreate ? 'Bật' : 'Tắt'}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold',
                        k.hasPin
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/60',
                      )}
                    >
                      <Lock size={11} /> {k.hasPin ? 'Có PIN bảo vệ' : 'Chưa đặt PIN'}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold',
                        k.allowExport
                          ? 'bg-sky-50 text-sky-700 border border-sky-200/60'
                          : 'bg-slate-100 text-slate-500',
                      )}
                    >
                      Xuất tác phẩm: {k.allowExport ? 'Cho phép' : 'Khóa'}
                    </span>
                  </div>

                  {/* Action Link to Learning Portal */}
                  <div className="mt-3 flex items-center justify-between pt-2">
                    <span className="text-[11px] text-muted font-medium">Lộ trình học theo nhóm tuổi</span>
                    <Link
                      to={`/parent/learning?childId=${encodeURIComponent(k.id)}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 transition"
                    >
                      <span>Xem chi tiết học tập</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── 5. Direct Subscription & Credits Showcase Hub ─────── */}
      <section aria-label="Gói học và nâng cấp cho gia đình">
        <div className="ui-card p-5 sm:p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-border/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🚀</span>
                <h3 className="font-display text-lg sm:text-xl font-black text-text">
                  Gói học & Nâng cấp cho gia đình
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted mt-1">
                Mở khóa toàn bộ chương trình Toán Olympic ASMO, vẽ tranh truyện AI và vùng học không giới hạn.
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setDashPricingMode('sub')}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-black transition',
                  dashPricingMode === 'sub' ? 'bg-white text-brand-700 shadow-xs' : 'text-muted hover:text-text',
                )}
              >
                Gói học gia đình
              </button>
              <button
                type="button"
                onClick={() => setDashPricingMode('credits')}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-black transition',
                  dashPricingMode === 'credits' ? 'bg-white text-brand-700 shadow-xs' : 'text-muted hover:text-text',
                )}
              >
                Lượt sáng tạo AI
              </button>
            </div>
          </div>

          {dashPricingMode === 'sub' ? (
            <div className="grid gap-4 md:grid-cols-3">
              {/* Free plan */}
              <div
                className={cn(
                  'rounded-3xl border-2 p-5 flex flex-col justify-between transition',
                  sub?.planCode === 'free' ? 'border-brand-400 bg-brand-50/30' : 'border-border/70 bg-white',
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-lg font-black text-text">Khởi Đầu</h4>
                    <span className="rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-extrabold">
                      Miễn phí
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1">Trải nghiệm các trạm học cơ bản</p>
                  <p className="font-display text-2xl font-black text-slate-900 mt-2">0 đ</p>
                  <div className="mt-3 space-y-1.5 text-xs text-muted border-t border-border/50 pt-3">
                    <p>• 1 hồ sơ con</p>
                    <p>• 1 vùng học mở cùng lúc</p>
                    <p>• 10 lượt tạo truyện AI dùng thử</p>
                  </div>
                </div>
                <Button
                  disabled={sub?.planCode === 'free'}
                  variant="secondary"
                  className="mt-4 w-full !text-xs font-bold rounded-xl"
                  onClick={() => navigate('/parent/plan')}
                >
                  {sub?.planCode === 'free' ? 'Gói hiện tại' : 'Xem chi tiết'}
                </Button>
              </div>

              {/* Pro plan */}
              <div className="rounded-3xl border-2 border-brand-500 bg-gradient-to-b from-brand-50/40 via-white to-white p-5 flex flex-col justify-between relative shadow-clay">
                <span className="absolute -top-3 right-4 rounded-full bg-brand-500 text-white px-3 py-0.5 text-[11px] font-black shadow-sm">
                  ⭐ Khuyên dùng
                </span>
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-lg font-black text-brand-700">AI Kids Pro</h4>
                    <span className="rounded-full bg-brand-100 text-brand-800 px-2 py-0.5 text-[10px] font-black">
                      Phổ biến
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1">Đầy đủ Toán Olympic & Sáng tạo AI</p>
                  <p className="font-display text-2xl font-black text-brand-600 mt-2">
                    129.000 đ <span className="text-xs text-muted font-normal">/tháng</span>
                  </p>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-700 border-t border-brand-100 pt-3">
                    <p className="font-bold text-brand-700">• 2 hồ sơ con theo học</p>
                    <p className="font-bold">• 5 vùng học mở cùng lúc / con</p>
                    <p>• Trọn bộ luyện thi Olympic ASMO, TIMO</p>
                    <p>• 50 lượt tạo tranh/truyện AI mỗi tháng</p>
                    <p>• Báo cáo sư phạm hàng tuần cho Ba / Mẹ</p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  className="mt-4 w-full !text-xs font-black shadow-clay bg-brand-500 hover:bg-brand-600 text-white rounded-xl gap-1.5"
                  onClick={() => onOpenCheckout('sub', 'aikids_pro', 129000, 'AI Kids Pro')}
                >
                  <Sparkles size={14} /> Nâng cấp ngay
                </Button>
              </div>

              {/* Family Hero plan */}
              <div className="rounded-3xl border-2 border-purple-300 bg-white p-5 flex flex-col justify-between transition hover:border-purple-400">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-lg font-black text-purple-900">Family Hero</h4>
                    <span className="rounded-full bg-purple-100 text-purple-800 px-2 py-0.5 text-[10px] font-black">
                      Toàn diện
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1">Dành cho gia đình có nhiều bé</p>
                  <p className="font-display text-2xl font-black text-purple-700 mt-2">
                    249.000 đ <span className="text-xs text-muted font-normal">/tháng</span>
                  </p>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-700 border-t border-border/50 pt-3">
                    <p className="font-bold text-purple-800">• Lên tới 5 hồ sơ con</p>
                    <p className="font-bold">• Không giới hạn vùng học mở</p>
                    <p>• 150 lượt sáng tạo tranh & comic AI</p>
                    <p>• Đấu trường Olympic trực tuyến không giới hạn</p>
                    <p>• Hỗ trợ riêng từ chuyên gia giáo dục</p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="mt-4 w-full !text-xs font-bold rounded-xl border border-purple-200 text-purple-800 hover:bg-purple-50"
                  onClick={() => onOpenCheckout('sub', 'aikids_family', 249000, 'Family Hero')}
                >
                  Nâng lên Family Hero
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {CREDIT_PACKS.map((pack) => (
                <div
                  key={pack.id}
                  className="rounded-2xl border border-border/70 p-3.5 flex flex-col justify-between bg-page/50"
                >
                  <div>
                    <span className="text-xl">🎨</span>
                    <h4 className="font-display text-sm font-black text-text mt-1">{pack.label}</h4>
                    <p className="text-[11px] text-muted">{pack.unitPriceText}</p>
                    <p className="font-display text-base font-black text-brand-600 mt-1">{pack.priceFormatted}</p>
                  </div>
                  <Button
                    variant="secondary"
                    className="mt-3 !py-1 !text-xs font-bold rounded-lg w-full"
                    onClick={() => onOpenCheckout('credits', undefined, pack.price, pack.label, pack.id)}
                  >
                    Nạp ngay
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 6. Creative Approvals Showcase Widget ────────────── */}
      <section aria-label="Trung tâm phê duyệt tác phẩm">
        <div className="ui-card overflow-hidden shadow-soft">
          <div className="flex items-center justify-between border-b border-border/60 bg-coral-50/40 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <ParentApprovalIcon size={22} />
              <div>
                <h3 className="font-display text-base font-bold text-text">
                  Duyệt chia sẻ tác phẩm của con
                </h3>
                <p className="text-xs text-muted">
                  Bảo vệ an toàn và quyền riêng tư cho các tác phẩm AI do con sáng tạo
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="!text-xs font-bold text-rose-600"
              onClick={() => navigate('/parent/approvals')}
            >
              Xem tất cả ({pendingCount})
            </Button>
          </div>

          {approvals.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-mint-50 text-2xl">
                🎨
              </div>
              <p className="font-display text-sm font-bold text-emerald-800">
                Tất cả tác phẩm đều đã được xử lý an toàn
              </p>
              <p className="max-w-sm text-xs text-muted">
                Khi con hoàn thành truyện tranh hoặc tranh vẽ AI mới và muốn chia sẻ, yêu cầu sẽ xuất hiện tại đây để Ba / Mẹ phê duyệt.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {approvals.slice(0, 3).map((appr) => (
                <div
                  key={appr.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:bg-rose-50/20"
                >
                  <div className="flex items-center gap-3">
                    {appr.project.thumbnail ? (
                      <img
                        src={appr.project.thumbnail}
                        alt=""
                        className="h-12 w-12 rounded-xl object-cover shadow-sm"
                      />
                    ) : (
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-purple-100 text-xl">
                        🎨
                      </div>
                    )}
                    <div>
                      <p className="font-display text-sm font-bold text-text">
                        {appr.project.title || 'Tác phẩm sáng tạo AI'}
                      </p>
                      <p className="text-xs text-muted">
                        Tác giả: <strong>{appr.child.nickname || 'Bé'}</strong> · Loại: {appr.project.kind || 'Truyện tranh'}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    className="gap-1.5 !px-3 !py-1 !text-xs font-bold text-rose-700"
                    onClick={() => navigate('/parent/approvals')}
                  >
                    <CheckCircle2 size={13} /> Duyệt tác phẩm
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export { ParentDashboardTab as DashboardTab }
