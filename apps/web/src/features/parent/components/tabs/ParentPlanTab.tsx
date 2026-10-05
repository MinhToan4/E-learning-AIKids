import { useCallback, useEffect, useState } from 'react'
import { Check, CreditCard, ExternalLink, Palette } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { api } from '@/shared/lib/api'
import { getAffiliateRef } from '@/shared/lib/affiliate-tracker'
import { cn } from '@/shared/lib/cn'
import { LoadingSkeleton } from '@/features/parent/components/ParentStatCard'
import {
  CREDIT_PACKS,
  type CheckoutProductMode,
} from '@/features/parent/components/ParentSubscriptionCheckoutModal'
import type { Child, ChildPlanUsage, HouseholdSub, PlanRow } from '@/features/parent/types/parent.types'
import { parentFriendlyError } from '@/features/parent/lib/parent-error'

export function ParentPlanTab({
  onOpenCheckout,
}: {
  onOpenCheckout?: (
    mode: CheckoutProductMode,
    planId?: string,
    amount?: number,
    name?: string,
    packId?: string,
  ) => void
}) {
  const [plans, setPlans] = useState<PlanRow[]>([])
  const [sub, setSub] = useState<HouseholdSub | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [usage, setUsage] = useState<ChildPlanUsage[]>([])
  const [checkout, setCheckout] = useState<{ payUrl: string | null; transferHint: string | null } | null>(null)
  const [pricingTab, setPricingTab] = useState<'plans' | 'credits'>('plans')
  const { toasts, showToast, dismissToast } = useToast()

  const load = useCallback(async () => {
    try {
      const [p, s, family] = await Promise.all([
        api<{ plans: PlanRow[] }>('/api/parent/plans'),
        api<{ subscription: HouseholdSub }>('/api/parent/subscription'),
        api<{ children: Child[] }>('/api/parent/children'),
      ])
      setPlans(p.plans)
      setSub({
        ...s.subscription,
        childCount: family.children.length,
        seatsRemaining: Math.max(0, s.subscription.maxChildren - family.children.length),
      })
      const childUsage = await Promise.all(
        family.children.map(async (child) => {
          const result = await api<{ courses: Array<{ enrolled?: boolean }> }>(
            `/api/parent/children/${child.id}/courses`,
          )
          return {
            id: child.id,
            nickname: child.nickname,
            openCourses: result.courses.filter((course) => course.enrolled).length,
          }
        }),
      )
      setUsage(childUsage)
    } catch (e) {
      showToast(parentFriendlyError(e, 'Chưa tải được thông tin gói học. Ba / Mẹ vui lòng thử lại.'), 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const handleReload = () => void load()
    window.addEventListener('parent:reload-data', handleReload)
    return () => window.removeEventListener('parent:reload-data', handleReload)
  }, [load])

  async function activate(code: string, planName?: string, priceMonthly?: number) {
    setBusy(code)
    if (typeof priceMonthly === 'number' && priceMonthly > 0 && onOpenCheckout) {
      onOpenCheckout('sub', code, priceMonthly, planName)
    }
    try {
      const data = await api<{
        subscription?: HouseholdSub
        message: string
        checkout?: { payUrl?: string | null; transferHint?: string | null; paymentReady?: boolean }
      }>('/api/parent/subscription', {
        method: 'POST',
        body: JSON.stringify({
          planCode: code,
          refCode: getAffiliateRef() || undefined,
        }),
      })
      if (data.subscription) setSub(data.subscription)
      const rawPayUrl = data.checkout?.payUrl ?? null
      let payUrl: string | null = null
      if (rawPayUrl) {
        try {
          const parsed = new URL(rawPayUrl)
          if (parsed.protocol === 'https:') payUrl = parsed.toString()
        } catch {
          payUrl = null
        }
      }
      setCheckout(data.checkout ? { payUrl, transferHint: data.checkout.transferHint ?? null } : null)
      showToast(data.message || (data.checkout ? 'Đã tạo yêu cầu nâng gói.' : 'Đã cập nhật gói học.'), 'success')
      await load()
    } catch (e) {
      showToast(parentFriendlyError(e, 'Chưa thể cập nhật gói học. Ba / Mẹ vui lòng thử lại.'), 'error')
    } finally {
      setBusy(null)
    }
  }

  if (loading) return <LoadingSkeleton count={3} />

  const isPaid = Boolean(sub && sub.planCode && sub.planCode !== 'free')
  const aiCredits = sub?.aiCreditsRemaining ?? sub?.monthlyCreateCredits ?? 50

  const officialPlan = plans.find((p) => p.code === 'aikids_official_129k' || p.code === 'aikids_pro')
  const officialPrice = officialPlan?.priceMonthly ?? 129000
  const officialName = officialPlan?.name || 'Gói AI Kid Chính Thức'
  const officialPriceFormatted = officialPrice > 0 ? `${officialPrice.toLocaleString('vi-VN')}đ` : 'Miễn phí'

  const isCurrentPlan = (pCode: string) => {
    if (!sub) return false
    if (sub.planCode === pCode) return true
    if (
      (sub.planCode === 'aikids_pro' || sub.planCode === 'aikids_official_129k') &&
      (pCode === 'aikids_pro' || pCode === 'aikids_official_129k')
    ) {
      return true
    }
    return false
  }

  return (
    <div className="flex flex-col gap-6">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ── 1. Header ────────────────────────────────────────── */}
      <header className="rounded-3xl border border-border/80 bg-gradient-to-b from-brand-50/60 via-white to-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-100/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-black text-brand-700">
              Góc Phụ Huynh & Gia Đình
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
              Gói học gia đình
            </span>
          </div>
        </div>
        <h1 className="font-display text-2xl font-black text-slate-900 mt-4 sm:text-3xl">
          Gói học & Lượt sáng tạo AI
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1 max-w-3xl leading-relaxed">
          Chọn gói học phù hợp cho các bé trong gia đình. Gói học quyết định số hồ sơ con và số vùng học mỗi con được mở cùng lúc.
        </p>
      </header>

      {/* ── 2. Segmented Control Men Gốm Sang Trọng ──────────── */}
      <div className="flex items-center justify-start">
        <div className="inline-flex items-center gap-1.5 rounded-2xl bg-cream-100 p-1.5 border border-cream-200/80 shadow-soft">
          <button
            type="button"
            onClick={() => setPricingTab('plans')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer',
              pricingTab === 'plans'
                ? 'bg-brand-500 text-white shadow-clay'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60',
            )}
          >
            <span>💳 Gói học định kỳ</span>
          </button>
          <button
            type="button"
            onClick={() => setPricingTab('credits')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer',
              pricingTab === 'credits'
                ? 'bg-brand-500 text-white shadow-clay'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60',
            )}
          >
            <span>Lượt sáng tạo AI</span>
          </button>
        </div>
      </div>

      {/* ── 3. Phân định rõ ràng: ĐÃ MUA vs CHƯA MUA ───────────── */}
      {isPaid ? (
        /* Trạng thái ĐÃ MUA: Gói đang hoạt động */
        <section className="rounded-3xl border-2 border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 via-white to-brand-50/30 p-5 sm:p-6 shadow-clay">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100/70 pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 shadow-2xs">
                  GÓI ĐANG HOẠT ĐỘNG
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900">
                {sub?.planName || 'AI Kid Chính Thức'}
              </h2>
              <p className="text-xs sm:text-sm text-muted">
                Gói học cao cấp cho gia đình, sẵn sàng trên mọi hành trình sáng tạo của con.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
              <Button
                variant="secondary"
                className="gap-2 !text-xs font-bold rounded-xl border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 shadow-2xs h-11 px-4 cursor-pointer"
                onClick={() => onOpenCheckout?.('credits', undefined, 100000, '50 lượt tạo ảnh AI', 'credits_50')}
              >
                <Palette size={14} className="text-amber-700" /> Nạp thêm lượt AI
              </Button>
              <Button
                variant="primary"
                className="gap-2 !text-xs font-black shadow-clay bg-brand-500 hover:bg-brand-600 text-white rounded-xl h-11 px-4 cursor-pointer"
                onClick={() => setPricingTab('plans')}
              >
                Đổi gói / Mở thêm ghế
              </Button>
            </div>
          </div>

          {/* Thông số cốt lõi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Số ghế con</p>
              <p className="font-display text-base sm:text-lg font-black text-slate-900 mt-0.5">
                {sub?.childCount ?? 0}/{sub?.maxChildren ?? 2} ghế
              </p>
              <p className="text-[11px] text-muted">Hồ sơ con trong gia đình</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-purple-600">Lượt tạo ảnh AI</p>
              <p className="font-display text-base sm:text-lg font-black text-purple-700 mt-0.5">
                Còn {aiCredits} lượt
              </p>
              <p className="text-[11px] text-muted">Tạo ảnh AI</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-brand-600">Hạn mức vùng học mỗi bé</p>
              <p className="font-display text-base sm:text-lg font-black text-brand-700 mt-0.5">
                {sub?.maxOpenCoursesPerChild ?? 5} vùng học mở cùng lúc / con
              </p>
              <p className="text-[11px] text-muted">vùng mở cùng lúc</p>
            </div>
          </div>
        </section>
      ) : (
        /* Trạng thái CHƯA MUA: Thẻ Gói AI Kid Chính Thức To, Đẹp, Nổi Bật Nhất */
        <section className="rounded-3xl border-3 border-amber-300 bg-gradient-to-br from-amber-50/80 via-white to-purple-50/50 p-6 sm:p-8 shadow-clay">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-amber-100 pb-6">
            <div className="space-y-2.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-100 px-3.5 py-1 text-xs font-black text-amber-900 shadow-2xs">
                  ⭐ GÓI TOÀN DIỆN KHUYÊN DÙNG
                </span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {officialName}
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-brand-600">
                  {officialPriceFormatted}
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-500">
                  /tháng
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                vùng học mở cùng lúc / con: trọn bộ 5 đảo · Nâng cấp để mở khóa đầy đủ hành trình cho các con.
              </p>
            </div>

            <div className="shrink-0 flex flex-col items-center sm:items-start lg:items-end gap-2">
              <Button
                variant="primary"
                className="w-full sm:w-auto flex flex-col items-center justify-center gap-1 !text-base font-black shadow-clay bg-gradient-to-r from-amber-500 via-orange-500 to-brand-500 hover:opacity-95 text-white rounded-2xl py-3.5 px-8 h-auto cursor-pointer"
                onClick={() => onOpenCheckout?.('sub', officialPlan?.code || 'aikids_official_129k', officialPrice, officialName)}
              >
                <span className="text-base sm:text-lg font-black flex items-center gap-2">
                  💳 Nâng cấp ngay bằng VietQR
                </span>
                <span className="text-xs font-semibold opacity-95">
                  Kích hoạt {officialName} · {officialPriceFormatted}
                </span>
              </Button>
              <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <span>Quét mã VietQR tiện lợi qua mọi app ngân hàng</span>
              </p>
            </div>
          </div>

          {/* 3 Đặc quyền cốt lõi dễ hiểu */}
          <div className="mt-6">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3.5">
              3 Đặc quyền cốt lõi cho con:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Đặc quyền 1 */}
              <div className="flex items-start gap-3.5 rounded-2xl border border-amber-200/90 bg-amber-50/70 p-4 shadow-2xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-white text-xl shadow-soft">
                  🌟
                </div>
                <div className="min-w-0">
                  <h4 className="font-display text-sm sm:text-base font-black text-slate-900">
                    Trọn bộ 5 Đảo Sáng Tạo
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Mở khóa trọn bộ 5 Đảo Sáng Tạo (30 trạm học chuẩn Olympic).
                  </p>
                </div>
              </div>

              {/* Đặc quyền 2 */}
              <div className="flex items-start gap-3.5 rounded-2xl border border-purple-200/90 bg-purple-50/70 p-4 shadow-2xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-500 text-white text-xl shadow-soft">
                  🎨
                </div>
                <div className="min-w-0">
                  <h4 className="font-display text-sm sm:text-base font-black text-slate-900">
                    {officialPlan?.monthlyCreateCredits ?? 50} lượt tạo ảnh AI
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {officialPlan?.monthlyCreateCredits ?? 50} lượt tạo ảnh AI mỗi tháng.
                  </p>
                </div>
              </div>

              {/* Đặc quyền 3 */}
              <div className="flex items-start gap-3.5 rounded-2xl border border-emerald-200/90 bg-emerald-50/70 p-4 shadow-2xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white text-xl shadow-soft">
                  👨‍👩‍👧
                </div>
                <div className="min-w-0">
                  <h4 className="font-display text-sm sm:text-base font-black text-slate-900">
                    Dùng chung cho các bé trong gia đình
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Được dùng chung cho các bé trong gia đình cùng học.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 4. Mức sử dụng vùng học của từng bé ───────────────── */}
      {sub && usage.length > 0 && (
        <section className="ui-card p-4 sm:p-5 rounded-3xl border border-border/80 shadow-soft">
          <h3 className="font-display text-lg sm:text-xl font-black text-slate-900">Mức sử dụng của gia đình</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {usage.map((child) => {
              const maxOpen = sub.maxOpenCoursesPerChild || 1
              const percent =
                maxOpen > 0
                  ? Math.min(100, Math.round((child.openCourses / maxOpen) * 100))
                  : 100
              const isFull = child.openCourses >= maxOpen
              return (
                <article key={child.id} className="rounded-2xl border border-slate-200/80 p-3.5 bg-white shadow-2xs">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-sm text-slate-900">{child.nickname ?? 'Học viên'}</p>
                    <span className="text-xs font-black text-brand-700">
                      {isFull
                        ? `${child.openCourses}/${maxOpen} vùng · Đã mở trọn bộ 6 đảo`
                        : `${child.openCourses}/${maxOpen} vùng`}
                    </span>
                  </div>
                  <div
                    className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-label={`${child.nickname ?? 'Học viên'} đã mở ${child.openCourses}/${maxOpen} vùng`}
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-300',
                        isFull ? 'bg-emerald-500' : 'bg-brand-500',
                      )}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted font-medium">
                    {isFull
                      ? 'Đã kích hoạt toàn bộ các đảo trong khóa học của con.'
                      : `Còn ${maxOpen - child.openCourses} vùng có thể mở.`}
                  </p>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {/* ── 5. Checkout Status Banner (nếu có yêu cầu thanh toán) ── */}
      {checkout && (
        <section className="ui-card border-2 border-sun-200 bg-sun-50 p-5 rounded-3xl shadow-soft">
          <div className="flex items-start gap-3">
            <CreditCard className="mt-0.5 text-warning shrink-0" aria-hidden="true" />
            <div>
              <h3 className="font-display text-xl font-black text-slate-900">Hoàn tất nâng gói</h3>
              {checkout.transferHint && (
                <p className="mt-1 text-sm text-muted">
                  Nội dung thanh toán: <strong className="text-text">{checkout.transferHint}</strong>
                </p>
              )}
              {checkout.payUrl ? (
                <a className="ui-btn ui-btn-primary mt-3 inline-flex items-center gap-1.5" href={checkout.payUrl} target="_blank" rel="noreferrer">
                  Mở trang thanh toán <ExternalLink size={16} />
                </a>
              ) : (
                <p className="mt-2 text-sm text-muted">Yêu cầu đang chờ hệ thống thanh toán xác nhận.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── 6. Danh mục các gói & Lượt sáng tạo AI ─────────────── */}
      <div className="pt-2">
        <div className="mb-4">
          <h3 className="font-display text-lg sm:text-xl font-black text-slate-900">
            {pricingTab === 'plans' ? 'Tất cả các gói học' : 'Gói nạp lượt sáng tạo AI'}
          </h3>
        </div>

        {pricingTab === 'plans' ? (
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((p) => {
              const current = isCurrentPlan(p.code)
              const keyFeatures = p.features.slice(0, 3)
              return (
                <article
                  key={p.code}
                  className={cn(
                    'ui-card flex flex-col justify-between p-5 rounded-3xl border-2 transition hover:shadow-soft',
                    current ? 'border-brand-500 ring-2 ring-brand-300 bg-brand-50/20' : 'border-border/70',
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-display text-xl font-black text-slate-900">{p.name}</h4>
                      {current && (
                        <span className="rounded-full bg-brand-100 text-brand-700 px-2.5 py-0.5 text-xs font-black">
                          Đang dùng
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-1">{p.tagline}</p>
                    <p className="mt-3 font-display text-2xl font-black text-brand-600">
                      {p.priceMonthly === 0
                        ? 'Miễn phí'
                        : `${p.priceMonthly.toLocaleString('vi-VN')} ${p.currency}/tháng`}
                    </p>
                    <div className="grid gap-1 rounded-2xl bg-page p-3 text-xs sm:text-sm my-3 border border-border/50">
                      <p>
                        <strong>{p.maxChildren}</strong> hồ sơ con
                      </p>
                      <p>
                        <strong>{p.maxOpenCoursesPerChild}</strong> vùng học mở cùng lúc / con
                      </p>
                    </div>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-muted mb-4">
                      {keyFeatures.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    disabled={current || busy === p.code}
                    onClick={() => void activate(p.code, p.name, p.priceMonthly)}
                    className={cn(
                      'w-full py-2.5 font-black text-sm rounded-2xl transition',
                      current
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none hover:bg-slate-100'
                        : 'bg-brand-500 hover:bg-brand-600 text-white shadow-clay cursor-pointer',
                    )}
                  >
                    {current
                      ? 'Gói hiện tại'
                      : busy === p.code
                        ? 'Đang tạo yêu cầu…'
                        : 'Chọn gói'}
                  </Button>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {CREDIT_PACKS.map((pack) => (
              <article
                key={pack.id}
                className="ui-card flex flex-col justify-between p-4 relative overflow-hidden rounded-3xl border border-border/80 shadow-2xs"
              >
                {pack.badge && (
                  <span className="absolute top-2 right-2 rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 text-[10px] font-black">
                    {pack.badge}
                  </span>
                )}
                <div>
                  <h4 className="font-display text-base font-black text-text">{pack.label}</h4>
                  <p className="text-xs text-muted">{pack.unitPriceText}</p>
                  <p className="mt-2 font-display text-lg font-black text-brand-600">{pack.priceFormatted}</p>
                </div>
                <Button
                  variant="primary"
                  className="mt-3 !py-1.5 !text-xs font-bold w-full rounded-xl cursor-pointer"
                  onClick={() => onOpenCheckout?.('credits', undefined, pack.price, pack.label, pack.id)}
                >
                  Mua lượt
                </Button>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export { ParentPlanTab as PlanTab }
