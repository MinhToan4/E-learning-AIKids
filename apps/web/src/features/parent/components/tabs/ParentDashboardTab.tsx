import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  Award,
  Camera,
  CheckCircle2,
  Download,
  Palette,
  Pencil,
  Plus,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import {
  ParentApprovalIcon,
  ParentKidsIcon,
} from '@/shared/components/icons/ParentIcons'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { useAuth } from '@/shared/store/auth'
import { LoadingSkeleton } from '@/features/parent/components/ParentStatCard'
import { avatarImage, getAvatar } from '@/shared/config/avatars'
import { EditChildModal } from '@/features/parent/components/EditChildModal'
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
  const [expandedSafety, setExpandedSafety] = useState<Record<string, boolean>>({})

  const navigate = useNavigate()
  const user = useAuth((s) => s.user)
  const enterAsChild = useAuth((s) => s.enterAsChild)
  const { toasts, showToast, dismissToast } = useToast()

  const toggleSafety = (childId: string) => {
    setExpandedSafety((prev) => ({ ...prev, [childId]: !prev[childId] }))
  }

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
              className="gap-2 !text-xs font-bold rounded-xl whitespace-nowrap h-11 px-4 cursor-pointer"
              onClick={() => navigate('/parent/kids')}
            >
              <ParentKidsIcon size={18} /> Quản lý con
            </Button>
            <Button
              variant="ghost"
              className="gap-2 !text-xs font-bold whitespace-nowrap h-11 px-3 cursor-pointer"
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
                <Award size={20} className="text-white" />
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
                  Còn {aiCredits} lượt tạo ảnh AI
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
              <Button
                variant="primary"
                className="flex-1 sm:flex-none gap-1.5 !text-xs font-black shadow-clay bg-brand-500 hover:bg-brand-600 text-white rounded-xl whitespace-nowrap h-11 px-4 cursor-pointer"
                onClick={() => onOpenCheckout('sub', 'aikids_pro', 129000, 'AI Kids Pro')}
              >
                Nâng cấp gói
              </Button>
              <Button
                variant="secondary"
                className="flex-1 sm:flex-none gap-1.5 !text-xs font-bold rounded-xl border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 whitespace-nowrap h-11 px-4 cursor-pointer"
                onClick={() => onOpenCheckout('credits', undefined, 100000, '50 lượt tạo ảnh AI', 'credits_50')}
              >
                Nạp lượt AI
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. KHỐI DUY NHẤT: HỒ SƠ CỦA CÁC CON ───────────────────────── */}
      <section
        aria-label="Hồ sơ của các con"
        className="rounded-3xl border-2 border-brand-200/80 bg-gradient-to-b from-brand-50/70 via-white to-purple-50/30 p-5 sm:p-6 shadow-clay"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-100/70 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-500 text-white shadow-soft">
              <Users size={22} className="text-white" />
            </span>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900">
                Hồ sơ của các con
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-0.5">
                Chạm vào bé để thiết bị chuyển sang không gian học tập riêng, hoặc quản lý phân quyền bảo vệ con.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            className="gap-1.5 !text-xs font-black shadow-clay bg-brand-500 hover:bg-brand-600 text-white rounded-xl whitespace-nowrap self-start sm:self-auto h-11 px-4 cursor-pointer"
            onClick={() => setEditTarget(null)}
          >
            <Plus size={15} /> + Thêm bé mới
          </Button>
        </div>

        {kids.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-8 text-center rounded-2xl bg-white/80 border border-brand-100">
            <Users size={36} className="text-brand-500" />
            <p className="font-display text-base font-bold">Chưa có hồ sơ con nào</p>
            <p className="text-xs text-muted max-w-sm">
              Ba / Mẹ hãy tạo hồ sơ cho con để bé có thể bắt đầu hành trình học tập.
            </p>
            <Button onClick={() => setEditTarget(null)} className="gap-2 rounded-2xl shadow-clay cursor-pointer">
              <Plus size={16} /> Thêm hồ sơ con
            </Button>
          </div>
        ) : (
          <ul
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full min-w-0"
            aria-label="Danh sách hồ sơ các con"
          >
            {kids.map((k) => {
              const av = getAvatar(k.avatarId)
              const img = avatarImage(k.avatarId)
              const { totalStars: childStars, completedQuests: childQuests } = getDerivedStats(k)
              const isExpanded = !!expandedSafety[k.id]

              return (
                <li key={k.id} className="h-full">
                  <div
                    className={cn(
                      'group relative flex w-full h-full flex-col justify-between rounded-3xl border-2 border-brand-100/90 bg-white p-5 sm:p-6 shadow-clay transition-all duration-300 hover:border-brand-300 hover:shadow-soft-xl',
                      busy && 'opacity-70 pointer-events-none',
                    )}
                  >
                    <div>
                      {/* ── Header thẻ con: Hàng 1 (Trạng thái + Công cụ) ── */}
                      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={cn(
                              'h-2.5 w-2.5 shrink-0 rounded-full',
                              k.active !== false ? 'bg-emerald-500 ring-2 ring-emerald-100' : 'bg-slate-300',
                            )}
                          />
                          <span className="text-xs font-bold text-slate-600 truncate">
                            {k.active !== false ? 'Đang hoạt động' : 'Tạm dừng'}
                          </span>
                        </div>

                        {/* Cụm 3 nút công cụ nhỏ gọn */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditTarget(k)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition border border-slate-200/60 shadow-2xs cursor-pointer"
                            title="Đổi tên / avatar"
                            aria-label="Đổi tên / avatar"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setQrModalTarget(k)}
                            className="p-1.5 rounded-lg text-brand-600 hover:text-brand-800 hover:bg-brand-50 transition border border-brand-200/60 shadow-2xs cursor-pointer"
                            title="Thẻ QR đăng nhập"
                            aria-label="Thẻ QR đăng nhập"
                          >
                            <QrCode size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(k)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition border border-slate-200/60 shadow-2xs cursor-pointer"
                            title="Tạm khóa tài khoản con"
                            aria-label="Tạm khóa tài khoản con"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* ── Thân thẻ: Hàng 2 (Avatar + Khối thông tin rộng rãi) ── */}
                      <div className="flex items-center gap-3.5 pt-3">
                        <div className="relative shrink-0">
                          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-tr from-brand-100 to-purple-50 text-2xl shadow-soft">
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
                          <span className="absolute -bottom-1 -right-1 rounded-full bg-gradient-to-r from-brand-600 to-purple-600 px-1.5 py-0.2 text-[9px] font-black text-white shadow-2xs border border-white">
                            Lv.{k.level || 1}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-lg font-black text-slate-900 break-words leading-snug">
                            {k.nickname ?? 'Bạn nhỏ'}
                          </h3>
                          <p className="text-xs font-bold text-slate-500 mt-0.5">
                            {k.ageBand ? `Nhóm ${k.ageBand}` : 'Nhóm 8-11 tuổi'}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-amber-700">
                            <span>{childStars} sao</span>
                            <span className="text-slate-300">·</span>
                            <span className="text-emerald-700">{childQuests} trạm</span>
                          </div>
                        </div>
                      </div>

                      {/* ── Nút hành động trung tâm ── */}
                      <div className="my-4 flex flex-col gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void handleEnterChild(k.id)}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white font-extrabold shadow-clay border-2 border-brand-600 transition-all py-3 px-4 text-sm sm:text-base cursor-pointer"
                        >
                          <span>Chạm để vào học ngay</span>
                        </button>

                        <Link
                          to={`/parent/learning?childId=${encodeURIComponent(k.id)}`}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2 px-3 border border-slate-200/80 transition"
                        >
                          <span>Xem tiến độ học tập</span>
                        </Link>
                      </div>
                    </div>

                    {/* ── Phần Cài đặt phân quyền an toàn (COLLAPSIBLE / THU GỌN) ── */}
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => toggleSafety(k.id)}
                        className="w-full flex items-center justify-between rounded-xl bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 border border-slate-200/70 transition cursor-pointer"
                        aria-expanded={isExpanded}
                      >
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                          <span>Cài đặt & Phân quyền an toàn</span>
                        </span>
                        <span className="text-slate-500 font-black">{isExpanded ? '▴' : '▾'}</span>
                      </button>

                      {isExpanded && (
                        <div className="mt-2.5 space-y-2 pt-1">
                          {/* AI Create Toggle */}
                          <label className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 text-xs font-bold cursor-pointer hover:border-brand-300 transition">
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
                          <label className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 text-xs font-bold cursor-pointer hover:border-brand-300 transition">
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
                          <label className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 text-xs font-bold cursor-pointer hover:border-brand-300 transition">
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
                      )}
                    </div>
                  </div>
                </li>
              )
            })}

            {/* Thẻ nét đứt "+ Thêm bé mới" */}
            <li className="h-full">
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className={cn(
                  'group flex w-full h-full min-h-[260px] flex-col items-center justify-center rounded-3xl border-3 border-dashed border-brand-200 bg-white/70 backdrop-blur-xs p-6 text-center transition-all duration-300',
                  'hover:-translate-y-1 hover:border-brand-400 hover:bg-brand-50/70 hover:shadow-clay active:scale-95 shadow-xs cursor-pointer',
                )}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100/80 text-brand-600 shadow-soft group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                  <Plus size={30} strokeWidth={2.5} />
                </div>
                <span className="mt-3 font-display text-lg font-black text-slate-800 group-hover:text-brand-700 transition-colors">
                  + Thêm bé mới
                </span>
                <span className="mt-1 text-xs text-muted max-w-[200px]">
                  Tạo thêm hồ sơ và cá nhân hóa trải nghiệm học tập
                </span>
              </button>
            </li>
          </ul>
        )}
      </section>

      {/* ── 3. Creative Approvals Widget (Duyệt tác phẩm AI) ──── */}
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
              className="!text-xs font-bold text-rose-600 cursor-pointer"
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
                  className="gap-1.5 !px-3 !py-1 !text-xs font-bold text-rose-700 rounded-xl cursor-pointer"
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
            className="!text-xs font-bold text-emerald-700 hover:text-emerald-800 !py-1 !px-2.5 cursor-pointer"
            onClick={() => navigate('/parent/approvals')}
          >
            Lịch sử duyệt
          </Button>
        </div>
      )}

      {/* ── 4. Chuyển tiếp sang Tab Học Tập ────────────────────── */}
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
