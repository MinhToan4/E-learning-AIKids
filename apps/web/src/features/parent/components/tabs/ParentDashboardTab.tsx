import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  ArrowRight,
  CheckCircle2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
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
import { avatarImage, getAvatar } from '@/shared/config/avatars'
import type { CheckoutProductMode } from '@/features/parent/components/ParentSubscriptionCheckoutModal'
import type { Approval, Child, HouseholdSub } from '@/features/parent/types/parent.types'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const user = useAuth((s) => s.user)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const [childrenData, approvalsData, subData] = await Promise.allSettled([
      api<{ children: Child[] }>('/api/parent/children'),
      api<{ approvals: Approval[] }>('/api/parent/approvals?status=pending'),
      api<{ subscription: HouseholdSub }>('/api/parent/subscription'),
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

  const totalStars = kids.reduce((s, k) => s + (k.totalStars ?? 0), 0)
  const totalQuests = kids.reduce((s, k) => s + (k.completedQuests ?? 0), 0)
  const pendingCount = approvals.length

  return (
    <div className="flex flex-col gap-6">
      {/* ── 1. Household Status Banner & Cockpit ──────────────── */}
      <header className="rounded-3xl border border-border/80 bg-gradient-to-b from-brand-50/70 via-white to-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-brand-100/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-black text-brand-700">
              <ShieldCheck size={14} className="text-brand-600" /> Quản lý tài khoản và phân quyền an toàn
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
              Tổng quan gia đình
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="gap-2 !text-xs font-bold rounded-xl whitespace-nowrap h-11 px-4"
              onClick={() => navigate('/parent/kids')}
            >
              <ParentKidsIcon size={18} /> Quản lý con
            </Button>
            <Button
              variant="ghost"
              className="gap-2 !text-xs font-bold whitespace-nowrap h-11 px-3"
              onClick={() => void load()}
            >
              <RefreshCw size={13} /> Làm mới
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-black text-slate-900 sm:text-3xl">
              Chào Ba / Mẹ {(user?.nickname || user?.name) ?? ''}!
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1 max-w-2xl leading-relaxed">
              Cùng theo dõi sự tiến bộ, khích lệ sáng tạo và đồng hành trên từng trạm học của con.
            </p>
          </div>

          {/* Subscription Cockpit Capsule */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-brand-200/80 bg-gradient-to-r from-brand-50/80 to-purple-50/80 p-3.5 shadow-2xs w-full lg:w-auto">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500 text-white shadow-clay text-lg">
                <Sparkles size={20} className="text-white" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-black uppercase tracking-wide text-brand-700">
                    Gói học hiện tại
                  </span>
                  <span className="rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-black text-brand-800">
                    {sub?.planName || 'Khởi Đầu'}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-700 truncate">
                  {kids.length}/{sub?.maxChildren ?? 1} hồ sơ con · {sub?.maxOpenCoursesPerChild ?? 2} vùng mở cùng lúc
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
              <Button
                variant="primary"
                className="flex-1 sm:flex-none gap-1.5 !text-xs font-black shadow-clay bg-brand-500 hover:bg-brand-600 text-white rounded-xl whitespace-nowrap h-11 px-4"
                onClick={() => onOpenCheckout('sub', 'aikids_pro', 129000, 'AI Kids Pro')}
              >
                <Sparkles size={13} /> Nâng cấp gói
              </Button>
              <Button
                variant="secondary"
                className="flex-1 sm:flex-none gap-1.5 !text-xs font-bold rounded-xl border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 whitespace-nowrap h-11 px-4"
                onClick={() => onOpenCheckout('credits', undefined, 100000, '50 lượt tạo ảnh AI', 'credits_50')}
              >
                Nạp lượt AI
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
          subtext="Ba / Mẹ chọn đúng hồ sơ để vào học"
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

      {/* ── 3. Creative Approvals Widget (Tinh tế & Gọn gàng) ──── */}
      {pendingCount > 0 ? (
        <section aria-label="Trung tâm phê duyệt tác phẩm" className="ui-card overflow-hidden shadow-soft">
          <div className="flex items-center justify-between border-b border-border/60 bg-coral-50/50 px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <ParentApprovalIcon size={20} />
              <div>
                <h3 className="font-display text-sm sm:text-base font-bold text-text">
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
                  className="gap-1.5 !px-3 !py-1 !text-xs font-bold text-rose-700 rounded-xl"
                  onClick={() => navigate('/parent/approvals')}
                >
                  <CheckCircle2 size={13} /> Duyệt tác phẩm
                </Button>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-200/70 bg-emerald-50/60 px-4 py-3 text-xs text-emerald-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="font-bold">Tất cả tác phẩm của con đã an toàn</span>
            <span className="hidden sm:inline text-emerald-700/80">· Không có yêu cầu chia sẻ nào đang chờ duyệt.</span>
          </div>
          <Button
            variant="ghost"
            className="!text-xs font-bold text-emerald-700 hover:text-emerald-800 !py-1 !px-2.5"
            onClick={() => navigate('/parent/approvals')}
          >
            Lịch sử duyệt
          </Button>
        </div>
      )}

      {/* ── 4. Compact Per-Child Learning Journey ────────────── */}
      <section aria-label="Tiến trình chi tiết từng con">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-text">Tiến độ học tập của các con</h3>
            <p className="text-xs text-muted">
              Lộ trình, hoạt động và năng lực · Danh tính và quyền an toàn
            </p>
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
          <div className="ui-card flex flex-col items-center justify-center gap-3 p-8 text-center rounded-3xl shadow-soft">
            <Users size={36} className="text-brand-500" />
            <p className="font-display text-base font-bold">Chưa có hồ sơ con nào</p>
            <p className="max-w-md text-xs text-muted">
              Ba / Mẹ hãy tạo hồ sơ cho con để bé có thể bắt đầu đăng nhập bằng biệt danh và học tập.
            </p>
            <Button onClick={() => navigate('/parent/kids')} className="gap-2 rounded-2xl shadow-clay">
              <Plus size={16} /> Thêm hồ sơ con
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {kids.map((k) => {
              const nextLevelXp = Math.max(k.level * 200, 100)
              const currentLvlXp = k.xp % nextLevelXp
              const progressPct = Math.min(Math.round((currentLvlXp / nextLevelXp) * 100), 100)
              const img = avatarImage(k.avatarId)
              const av = getAvatar(k.avatarId)

              return (
                <div
                  key={k.id}
                  className="ui-card flex flex-col justify-between p-4 sm:p-5 rounded-3xl border border-brand-100/80 shadow-clay hover:shadow-soft-xl transition-all duration-300 w-full min-w-0"
                >
                  {/* Top: Avatar + Level + Nickname */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-tr from-brand-100 to-purple-50 text-3xl shadow-soft border-2 border-white">
                            {img ? (
                              <img
                                src={img}
                                alt={k.nickname || 'Avatar'}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              av.emoji
                            )}
                          </div>
                          <span className="absolute -bottom-1 -right-1 rounded-full bg-brand-600 px-1.5 py-0.2 text-[10px] font-black text-white shadow-2xs border border-white">
                            Lv.{k.level}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-display text-base font-bold text-text truncate">
                              {k.nickname || 'Bé yêu'}
                            </h4>
                            <span
                              className={cn(
                                'h-2 w-2 shrink-0 rounded-full',
                                k.active ? 'bg-emerald-500' : 'bg-slate-300',
                              )}
                              title={k.active ? 'Đang hoạt động' : 'Tạm dừng'}
                            />
                          </div>
                          <p className="text-xs text-muted truncate">
                            {k.ageBand ? `Nhóm tuổi: ${k.ageBand}` : 'Nhóm tuổi: 8-11'}
                          </p>
                        </div>
                      </div>

                      {/* Mini Stat Pills */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-black text-amber-700 border border-amber-200/50">
                          {k.totalStars ?? 0} sao
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-mint-50 px-2 py-0.5 text-xs font-black text-emerald-700 border border-emerald-200/50">
                          {k.completedQuests ?? 0} trạm
                        </span>
                      </div>
                    </div>

                    {/* XP Progress Bar */}
                    <div className="mt-3.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-bold text-muted">Cấp {k.level + 1}</span>
                        <span className="font-black text-brand-600">
                          {currentLvlXp} / {nextLevelXp} XP ({progressPct}%)
                        </span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-sky-400 transition-all duration-700"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions: Xem học tập + Chuyển sang con */}
                  <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 gap-2">
                    <Link
                      to={`/parent/learning?childId=${encodeURIComponent(k.id)}`}
                      className="inline-flex min-h-[44px] items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 transition px-1"
                    >
                      <span>Xem học tập</span>
                      <ArrowRight size={13} />
                    </Link>
                    <Button
                      variant="secondary"
                      className="gap-1 min-h-[44px] !px-4 !text-xs font-bold rounded-xl text-slate-700 hover:text-brand-700 whitespace-nowrap"
                      onClick={() => navigate('/kids')}
                    >
                      Chuyển sang con
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export { ParentDashboardTab as DashboardTab }
