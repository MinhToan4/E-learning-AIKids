import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Download,
  Lock,
  Palette,
  Pencil,
  Plus,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  Zap,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
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
import { EditChildModal, avatarEmoji } from '@/features/parent/components/EditChildModal'
import { StudentQrCardModal } from '@/features/parent/components/StudentQrCardModal'
import { getChildOverallLocalStats } from '@/shared/lib/learning-sync-store'
import { useToast } from '@/shared/hooks/useToast'
import { ToastContainer } from '@/shared/components/ui/Toast'
import type { CheckoutProductMode } from '@/features/parent/components/ParentSubscriptionCheckoutModal'
import type { Approval, Child, HouseholdSub } from '@/features/parent/types/parent.types'
import {
  getDashboardCache,
  invalidateParentCache,
  setDashboardCache,
} from '@/features/parent/lib/parent-cache'

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
  const initialCache = getDashboardCache()
  const [kids, setKids] = useState<Child[]>(initialCache?.kids ?? [])
  const [approvals, setApprovals] = useState<Approval[]>(initialCache?.approvals ?? [])
  const [sub, setSub] = useState<HouseholdSub | null>(initialCache?.sub ?? null)
  const [loading, setLoading] = useState(!initialCache)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null)
  const [editTarget, setEditTarget] = useState<Child | null | undefined>(undefined)
  const [qrModalTarget, setQrModalTarget] = useState<Child | null>(null)

  const navigate = useNavigate()
  const user = useAuth((s) => s.user)
  const enterAsChild = useAuth((s) => s.enterAsChild)
  const { toasts, showToast, dismissToast } = useToast()

  const load = useCallback(async (silent = false) => {
    const hasCache = Boolean(getDashboardCache())
    if (!silent && !hasCache) {
      setLoading(true)
    }
    setError('')
    try {
      const [childrenData, approvalsData, subData] = await Promise.allSettled([
        api<{ children: Child[] }>('/api/parent/children'),
        api<{ approvals: Approval[] }>('/api/parent/approvals?status=pending'),
        api<{ subscription: HouseholdSub }>('/api/parent/subscription'),
      ])
      if (childrenData.status === 'rejected') {
        if (!hasCache) {
          setError('Chưa tải được dữ liệu của các con. Ba / Mẹ thử lại nhé.')
        }
        return
      }
      const fetchedKids = childrenData.value.children
      const fetchedApprovals = approvalsData.status === 'fulfilled' ? approvalsData.value.approvals : []
      const fetchedSub = subData.status === 'fulfilled' ? subData.value.subscription : null

      setKids(fetchedKids)
      setApprovals(fetchedApprovals)
      if (fetchedSub) {
        setSub(fetchedSub)
      }

      setDashboardCache({
        kids: fetchedKids,
        approvals: fetchedApprovals,
        sub: fetchedSub,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const handleReload = () => void load()
    window.addEventListener('parent:reload-data', handleReload)
    return () => window.removeEventListener('parent:reload-data', handleReload)
  }, [load])

  const getDerivedStats = (k: Child) => {
    const localStats = getChildOverallLocalStats(k.id)
    const xpForCalculation = (k.xp || 0) > 0 ? (k.xp || 0) : Math.max(0, ((k.level || 1) - 1) * 100)
    const totalStars = Math.max(
      k.totalStars ?? 0,
      localStats.totalStars,
      Math.min(30, Math.floor(xpForCalculation / 100)),
    )
    const completedQuests = Math.max(
      k.completedQuests ?? 0,
      localStats.completedCount,
      Math.min(32, Math.floor(totalStars / 3)),
    )
    return { totalStars, completedQuests }
  }

  async function handleEnterChild(childId: string) {
    setBusy(true)
    try {
      const next = await enterAsChild(childId)
      navigate(next.onboarded ? '/home' : '/onboarding')
    } catch (e) {
      showToast(
        e instanceof Error ? e.message : 'Chưa chuyển sang tài khoản bé được. Ba / Mẹ thử lại nhé.',
        'error',
      )
    } finally {
      setBusy(false)
    }
  }

  async function updateConsent(
    child: Child,
    capability: 'allowAiCreate' | 'allowPhoto' | 'allowExport',
    enabled: boolean,
  ) {
    try {
      await api(`/api/parent/children/${child.id}/consent`, {
        method: 'PATCH',
        body: JSON.stringify({
          [capability]: enabled,
          policyVersion: 'aikids-child-safety-v1',
          locale: 'vi-VN',
        }),
      })
      invalidateParentCache()
      setKids((prev) =>
        prev.map((item) => (item.id === child.id ? { ...item, [capability]: enabled } : item)),
      )
      showToast('Đã cập nhật quyền an toàn cho con.', 'success')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không cập nhật được quyền an toàn', 'error')
    }
  }

  async function deleteChild(childId: string) {
    try {
      await api(`/api/parent/children/${childId}`, { method: 'DELETE' })
      showToast('Tài khoản con đã được tạm khóa.', 'success')
      invalidateParentCache()
      await load()
      setDeleteTarget(null)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lỗi tạm khóa tài khoản', 'error')
      setDeleteTarget(null)
    }
  }

  if (loading) {
    return <LoadingSkeleton count={3} />
  }

  if (error) return <ErrorState message={error} onRetry={() => void load()} inline />

  const totalStars = kids.reduce((s, k) => s + getDerivedStats(k).totalStars, 0)
  const totalQuests = kids.reduce((s, k) => s + getDerivedStats(k).completedQuests, 0)
  const pendingCount = approvals.length
  const aiCredits = sub?.aiCreditsRemaining ?? sub?.monthlyCreateCredits ?? 50

  return (
    <div className="flex flex-col gap-6">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ── 1. Household Status Banner & Cockpit Header ──────── */}
      <header className="rounded-3xl border border-border/80 bg-gradient-to-b from-brand-50/70 via-white to-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-brand-100/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-black text-brand-700">
              <ShieldCheck size={14} className="text-brand-600" /> Quản lý danh tính, quyền an toàn và hồ sơ học của con
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
                    {sub?.planCode === 'aikids_pro' || sub?.planCode === 'aikids_official_129k'
                      ? 'AI Kid Chính Thức'
                      : (sub?.planName || 'Khởi Đầu')}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-700 truncate">
                  {kids.length}/{sub?.maxChildren || 2} hồ sơ con · {sub?.maxOpenCoursesPerChild || 5} vùng mở cùng lúc
                </p>
                <p className="text-[11px] font-bold text-purple-700 mt-0.5 truncate">
                  🎨 Còn {aiCredits} lượt tạo ảnh AI
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
          subtext={
            kids.length > 0
              ? kids.map((k) => `${k.nickname || 'Bé'}: ${getDerivedStats(k).totalStars} sao`).join(' · ')
              : '0 sao đạt từ các bài quiz'
          }
        />
        <StatMetricCard
          label="Nhiệm vụ hoàn thành"
          value={totalQuests}
          icon={<ParentQuestIcon size={32} />}
          color="mint"
          trend={totalQuests > 0 ? { value: `${totalQuests} trạm`, isPositive: true } : undefined}
          sparklineData={[totalQuests]}
          subtext={
            kids.length > 0
              ? kids.map((k) => `${k.nickname || 'Bé'}: ${getDerivedStats(k).completedQuests} trạm`).join(' · ')
              : '0 trạm học đã chinh phục'
          }
          onClick={() => navigate('/parent/learning')}
        />
        <StatMetricCard
          label="Lượt tạo ảnh AI"
          value={aiCredits}
          icon={<Palette size={30} className="text-purple-600" />}
          color="purple"
          badge="Nạp thêm +"
          sparklineData={[aiCredits]}
          subtext={`${aiCredits} lượt khả dụng`}
          onClick={() => onOpenCheckout('credits', undefined, 100000, '50 lượt tạo ảnh AI', 'credits_50')}
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

      {/* ── 3. KHỐI CHUYỂN NHANH SANG TÀI KHOẢN CON (TOUCH-TO-ENTER) ── */}
      <section
        aria-label="Chuyển nhanh sang không gian học của con"
        className="rounded-3xl border-2 border-brand-200/80 bg-gradient-to-b from-brand-50/70 via-white to-purple-50/30 p-5 sm:p-6 shadow-clay"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-100/70 pb-3 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-500 text-white shadow-soft text-lg">
              🚀
            </span>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-black text-slate-900">
                Chuyển nhanh sang không gian học của con
              </h2>
              <p className="text-xs text-muted">
                Chạm vào bé để thiết bị chuyển sang chế độ học tập riêng của con. Khu vực quản lý của Ba / Mẹ sẽ được ẩn để con tập trung học.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 self-start sm:self-auto rounded-full bg-brand-100/80 px-3 py-1 text-xs font-black text-brand-800">
            <Sparkles size={13} className="text-brand-600" /> Chạm là vào học ngay
          </span>
        </div>

        {kids.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-8 text-center rounded-2xl bg-white/80 border border-brand-100">
            <Users size={36} className="text-brand-500" />
            <p className="font-display text-base font-bold">Chưa có hồ sơ con nào</p>
            <p className="text-xs text-muted max-w-sm">
              Ba / Mẹ hãy tạo hồ sơ cho con để bé có thể bắt đầu hành trình học tập.
            </p>
            <Button onClick={() => setEditTarget(null)} className="gap-2 rounded-2xl shadow-clay">
              <Plus size={16} /> Thêm hồ sơ con
            </Button>
          </div>
        ) : (
          <ul
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full min-w-0"
            aria-label="Danh sách con touch-to-enter"
          >
            {kids.map((k) => {
              const av = getAvatar(k.avatarId)
              const img = avatarImage(k.avatarId)
              const { totalStars: childStars, completedQuests: childQuests } = getDerivedStats(k)

              return (
                <li key={k.id} className="h-full">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleEnterChild(k.id)}
                    className={cn(
                      'group relative flex w-full h-full flex-col items-center justify-between rounded-3xl border-2 border-brand-100/90 bg-white p-5 sm:p-6 text-center shadow-clay transition-all duration-300',
                      'hover:-translate-y-1 hover:border-brand-400 hover:shadow-soft-xl active:scale-95 focus-visible:outline focus-visible:outline-3 focus-visible:outline-focus',
                      busy && 'opacity-60 pointer-events-none',
                    )}
                  >
                    {/* Top Status */}
                    <div className="flex w-full items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-black text-brand-700">
                        <Sparkles size={11} className="text-brand-500" />
                        <span>Học sinh</span>
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">Vào không gian riêng</span>
                    </div>

                    {/* Avatar with Ceramic Rim & Level Badge */}
                    <div className="relative my-3">
                      <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-tr from-brand-100 to-purple-50 text-4xl shadow-clay group-hover:scale-105 transition-transform duration-300">
                        {img ? (
                          <img
                            src={img}
                            alt={k.nickname ?? 'Avatar'}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          av.emoji
                        )}
                      </div>
                      <span className="absolute -bottom-1 right-0 rounded-full bg-gradient-to-r from-brand-600 to-purple-600 px-2.5 py-0.5 text-xs font-black text-white shadow-md border-2 border-white">
                        Lv.{k.level || 1}
                      </span>
                    </div>

                    {/* Nickname & Stats */}
                    <div className="w-full">
                      <h3 className="font-display text-xl font-black text-slate-900 group-hover:text-brand-600 transition-colors">
                        {k.nickname ?? 'Bạn nhỏ'}
                      </h3>

                      {/* Mini Badges */}
                      <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700 border border-amber-200/60 shadow-2xs">
                          ⭐ {childStars} sao
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-mint-50 px-2.5 py-1 text-xs font-black text-emerald-700 border border-emerald-200/60 shadow-2xs">
                          🎯 {childQuests} trạm
                        </span>
                      </div>

                      <div className="mt-3.5 inline-flex items-center justify-center gap-1.5 w-full rounded-2xl bg-brand-500 group-hover:bg-brand-600 text-white py-2 px-3 text-xs font-black shadow-clay transition">
                        <span>Chạm để vào học ngay</span>
                        <ArrowRight size={13} />
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}

            {/* Card "+ Thêm bé mới" */}
            <li className="h-full">
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className={cn(
                  'group flex w-full h-full min-h-[220px] flex-col items-center justify-center rounded-3xl border-3 border-dashed border-brand-200 bg-white/70 backdrop-blur-xs p-6 text-center transition-all duration-300',
                  'hover:-translate-y-1 hover:border-brand-400 hover:bg-brand-50/70 hover:shadow-clay active:scale-95 shadow-xs',
                )}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100/80 text-brand-600 shadow-soft group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                  <Plus size={30} strokeWidth={2.5} />
                </div>
                <span className="mt-3 font-display text-lg font-black text-slate-800 group-hover:text-brand-700 transition-colors">
                  + Thêm bé mới
                </span>
                <span className="mt-1 text-xs text-muted max-w-[180px]">
                  Tạo thêm hồ sơ và cá nhân hóa trải nghiệm học tập
                </span>
              </button>
            </li>
          </ul>
        )}
      </section>

      {/* ── 4. Creative Approvals Widget (Duyệt tác phẩm AI) ──── */}
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

      {/* ── 5. QUẢN TRỊ & PHÂN QUYỀN AN TOÀN ─────────────────── */}
      <section
        aria-label="Quản trị & Phân quyền an toàn"
        className="rounded-3xl border border-border/80 bg-white p-5 sm:p-6 shadow-soft"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-soft">
              <ShieldCheck size={22} />
            </span>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-black text-slate-900">
                Quản trị & Phân quyền an toàn
              </h2>
              <p className="text-xs text-muted">
                Quản lý danh tính, phân quyền tạo ảnh AI, sử dụng máy ảnh, xuất tác phẩm và thiết lập bảo vệ cho từng con.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            className="gap-2 !text-xs font-bold rounded-xl whitespace-nowrap self-start sm:self-auto h-11 px-4"
            onClick={() => setEditTarget(null)}
          >
            <Plus size={15} /> Thêm bé mới
          </Button>
        </div>

        {kids.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted">
            Chưa có hồ sơ con. Nhấn "Thêm bé mới" để bắt đầu.
          </div>
        ) : (
          <div className="space-y-4">
            {kids.map((k) => {
              const av = getAvatar(k.avatarId)
              const img = avatarImage(k.avatarId)

              return (
                <div
                  key={k.id}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 transition hover:bg-slate-50 hover:border-brand-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Child Profile Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative shrink-0">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-tr from-brand-100 to-purple-50 text-3xl shadow-soft border-2 border-white">
                          {img ? (
                            <img src={img} alt={k.nickname || 'Avatar'} className="h-full w-full object-cover" />
                          ) : (
                            av.emoji
                          )}
                        </div>
                        <span className="absolute -bottom-1 -right-1 rounded-full bg-brand-600 px-1.5 py-0.2 text-[10px] font-black text-white shadow-2xs border border-white">
                          Lv.{k.level || 1}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-base sm:text-lg font-black text-slate-900 truncate">
                            {k.nickname || 'Bé yêu'}
                          </h3>
                          <span
                            className={cn(
                              'h-2 w-2 shrink-0 rounded-full',
                              k.active !== false ? 'bg-emerald-500' : 'bg-slate-300',
                            )}
                            title={k.active !== false ? 'Đang hoạt động' : 'Tạm dừng'}
                          />
                        </div>
                        <p className="text-xs text-muted font-bold mt-0.5">
                          {k.ageBand ? `Nhóm tuổi: ${k.ageBand}` : 'Nhóm tuổi: 8-11'} · Cấp độ Lv.{k.level || 1}
                        </p>
                      </div>
                    </div>

                    {/* Management Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditTarget(k)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                        title="Đổi tên hoặc ảnh đại diện"
                      >
                        <Pencil size={13} className="text-slate-500" />
                        <span>Đổi tên / avatar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setQrModalTarget(k)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-bold text-brand-700 hover:bg-brand-100 transition shadow-2xs"
                        title="Xem thẻ QR đăng nhập nhanh"
                      >
                        <QrCode size={13} className="text-brand-600" />
                        <span>Thẻ QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(k)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition shadow-2xs"
                        title="Tạm khóa tài khoản con"
                      >
                        <Trash2 size={13} />
                        <span>Tạm khóa</span>
                      </button>

                      <Link
                        to={`/parent/learning?childId=${encodeURIComponent(k.id)}`}
                        className="inline-flex items-center gap-1 rounded-xl bg-brand-500 hover:bg-brand-600 text-white px-3.5 py-2 text-xs font-black shadow-clay transition"
                      >
                        <span>Học tập</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>

                  {/* Safety Permissions Switches */}
                  <div className="mt-4 pt-3.5 border-t border-slate-200/70">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
                      Cài đặt phân quyền an toàn cho {k.nickname || 'bé'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* AI Create Toggle */}
                      <label className="flex items-center justify-between gap-2 rounded-xl bg-white border border-slate-200/80 p-2.5 text-xs font-bold cursor-pointer hover:border-brand-300 transition">
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <Palette size={14} className="text-purple-500" />
                          <span>Cho phép AI tạo ảnh</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={k.allowAiCreate ?? true}
                          onChange={(e) => void updateConsent(k, 'allowAiCreate', e.target.checked)}
                          className="h-4 w-4 rounded accent-brand-500 cursor-pointer"
                        />
                      </label>

                      {/* Photo/Camera Toggle */}
                      <label className="flex items-center justify-between gap-2 rounded-xl bg-white border border-slate-200/80 p-2.5 text-xs font-bold cursor-pointer hover:border-brand-300 transition">
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <Camera size={14} className="text-sky-500" />
                          <span>Sử dụng máy ảnh</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={k.allowPhoto ?? true}
                          onChange={(e) => void updateConsent(k, 'allowPhoto', e.target.checked)}
                          className="h-4 w-4 rounded accent-brand-500 cursor-pointer"
                        />
                      </label>

                      {/* Export Artwork Toggle */}
                      <label className="flex items-center justify-between gap-2 rounded-xl bg-white border border-slate-200/80 p-2.5 text-xs font-bold cursor-pointer hover:border-brand-300 transition">
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <Download size={14} className="text-emerald-500" />
                          <span>Xuất tác phẩm</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={k.allowExport ?? true}
                          onChange={(e) => void updateConsent(k, 'allowExport', e.target.checked)}
                          className="h-4 w-4 rounded accent-brand-500 cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── 6. Chuyển tiếp sang Tab Học Tập ────────────────────── */}
      <section className="rounded-3xl border border-brand-200/80 bg-gradient-to-r from-amber-50/70 via-cream-50 to-brand-50/60 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-100 text-2xl shadow-soft">
              🧭
            </span>
            <div>
              <h3 className="font-display text-base sm:text-lg font-black text-slate-900">
                Lộ trình, hoạt động và năng lực học tập của con
              </h3>
              <p className="text-xs sm:text-sm text-muted mt-0.5 max-w-xl leading-relaxed">
                Để xem tiến độ Hải Trình 6 Đảo Sáng Tạo, chứng nhận tốt nghiệp và nhận xét năng lực của từng con, Ba / Mẹ vui lòng chuyển sang tab <strong>Học tập</strong>.
              </p>
            </div>
          </div>
          <Link
            to="/parent/learning"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 shadow-clay transition whitespace-nowrap self-start sm:self-auto"
          >
            <span>Khám phá Trung tâm học tập</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── Modals: Edit Child & Student QR Card ──────────────── */}
      {editTarget !== undefined && (
        <EditChildModal
          child={editTarget}
          isOpen={true}
          referenceChildId={kids[0]?.id}
          onClose={() => setEditTarget(undefined)}
          onSuccess={() => {
            setEditTarget(undefined)
            invalidateParentCache()
            void load()
            showToast('Đã lưu thông tin của con.', 'success')
          }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

      {qrModalTarget && (
        <StudentQrCardModal
          child={qrModalTarget}
          isOpen={true}
          onClose={() => setQrModalTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          open={true}
          title="Tạm khóa hồ sơ con"
          description={`Ba / Mẹ có chắc chắn muốn tạm khóa hồ sơ của bé "${deleteTarget.nickname}" không? Dữ liệu và tác phẩm đã lưu của bé vẫn được bảo lưu an toàn.`}
          confirmLabel="Tạm khóa"
          cancelLabel="Hủy"
          danger={true}
          onConfirm={() => void deleteChild(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

export { ParentDashboardTab as DashboardTab }
