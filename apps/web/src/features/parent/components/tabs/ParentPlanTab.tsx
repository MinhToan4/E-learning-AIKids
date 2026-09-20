import { useCallback, useEffect, useState } from 'react'
import { Check, CreditCard, ExternalLink, Sparkles } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { LoadingSkeleton } from '@/features/parent/components/ParentStatCard'
import {
  CREDIT_PACKS,
  type CheckoutProductMode,
} from '@/features/parent/components/ParentSubscriptionCheckoutModal'
import type { Child, ChildPlanUsage, HouseholdSub, PlanRow } from '@/features/parent/types/parent.types'

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
      showToast(e instanceof Error ? e.message : 'Không tải được gói', 'error')
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
        body: JSON.stringify({ planCode: code }),
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
      showToast(e instanceof Error ? e.message : 'Không đổi được gói', 'error')
    } finally {
      setBusy(null)
    }
  }

  if (loading) return <LoadingSkeleton count={3} />

  return (
    <div className="flex flex-col gap-5">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <header className="rounded-3xl border border-border/80 bg-gradient-to-b from-brand-50/60 via-white to-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-100/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-0.5 text-xs font-black text-brand-700">
              <Sparkles size={12} /> 👨👩👧 Góc Phụ Huynh & Gia Đình
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
              Gói học gia đình
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setPricingTab('plans')}
              className={cn(
                'rounded-xl px-3 py-1.5 text-xs font-black transition',
                pricingTab === 'plans' ? 'bg-white text-brand-700 shadow-xs' : 'text-muted hover:text-text',
              )}
            >
              Gói học định kỳ
            </button>
            <button
              type="button"
              onClick={() => setPricingTab('credits')}
              className={cn(
                'rounded-xl px-3 py-1.5 text-xs font-black transition',
                pricingTab === 'credits' ? 'bg-white text-brand-700 shadow-xs' : 'text-muted hover:text-text',
              )}
            >
              Lượt sáng tạo AI
            </button>
          </div>
        </div>
        <h1 className="font-display text-2xl font-black text-slate-900 mt-3 sm:text-3xl">
          Chọn gói học phù hợp
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1 max-w-3xl leading-relaxed">
          Gói học quyết định số hồ sơ con và số vùng học mỗi con được mở cùng lúc. Chương trình là nội dung; chỉ vùng đã đăng ký mới xuất hiện trong lộ trình của con.
        </p>
        {sub && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-mint-200/80 bg-mint-50/60 p-4 shadow-2xs">
              <p className="text-xs font-extrabold uppercase tracking-wide text-success">Gói hiện tại</p>
              <p className="mt-1 font-display text-xl font-black text-slate-900">{sub.planName}</p>
              <p className="mt-1 text-xs sm:text-sm text-muted">{sub.childCount}/{sub.maxChildren} hồ sơ con</p>
            </div>
            <div className="rounded-2xl border border-brand-200/80 bg-brand-50/60 p-4 shadow-2xs">
              <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">Quyền học</p>
              <p className="mt-1 font-display text-xl font-black text-slate-900">{sub.maxOpenCoursesPerChild} vùng / con</p>
              <p className="mt-1 text-xs sm:text-sm text-muted">Vùng đã hoàn thành vẫn được giữ tiến độ khi đổi gói.</p>
            </div>
          </div>
        )}
      </header>

      {sub && usage.length > 0 && (
        <section className="ui-card p-5">
          <h3 className="font-display text-xl">Mức sử dụng của gia đình</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {usage.map((child) => {
              const percent =
                sub.maxOpenCoursesPerChild > 0
                  ? Math.min(100, Math.round((child.openCourses / sub.maxOpenCoursesPerChild) * 100))
                  : 100
              return (
                <article key={child.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold">{child.nickname ?? 'Học viên'}</p>
                    <span className="text-sm font-extrabold text-brand-700">
                      {child.openCourses}/{sub.maxOpenCoursesPerChild} vùng
                    </span>
                  </div>
                  <div
                    className="mt-3 h-2 overflow-hidden rounded-full bg-brand-50"
                    role="progressbar"
                    aria-label={`${child.nickname ?? 'Học viên'} đã mở ${child.openCourses}/${sub.maxOpenCoursesPerChild} vùng`}
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className={cn('h-full rounded-full', percent >= 100 ? 'bg-coral-400' : 'bg-brand-500')}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {child.openCourses >= sub.maxOpenCoursesPerChild
                      ? 'Đã dùng hết hạn mức. Nâng gói để mở thêm vùng.'
                      : `Còn ${sub.maxOpenCoursesPerChild - child.openCourses} vùng có thể mở.`}
                  </p>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {checkout && (
        <section className="ui-card border-2 border-sun-200 bg-sun-50 p-5">
          <div className="flex items-start gap-3">
            <CreditCard className="mt-0.5 text-warning" aria-hidden="true" />
            <div>
              <h3 className="font-display text-xl">Hoàn tất nâng gói</h3>
              {checkout.transferHint && (
                <p className="mt-1 text-sm text-muted">
                  Nội dung thanh toán: <strong className="text-text">{checkout.transferHint}</strong>
                </p>
              )}
              {checkout.payUrl ? (
                <a className="ui-btn ui-btn-primary mt-3" href={checkout.payUrl} target="_blank" rel="noreferrer">
                  Mở trang thanh toán <ExternalLink size={16} />
                </a>
              ) : (
                <p className="mt-2 text-sm text-muted">Yêu cầu đang chờ hệ thống thanh toán xác nhận.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {pricingTab === 'plans' ? (
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((p) => {
            const current = sub?.planCode === p.code
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
                    <h3 className="font-display text-xl font-black text-slate-900">{p.name}</h3>
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
                    {p.features.map((f) => (
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
                    'w-full py-2.5 font-black text-sm rounded-2xl shadow-clay transition',
                    current
                      ? 'bg-slate-200 text-slate-600 cursor-default'
                      : 'bg-brand-500 hover:bg-brand-600 text-white',
                  )}
                >
                  {current
                    ? 'Gói hiện tại'
                    : busy === p.code
                      ? 'Đang tạo yêu cầu…'
                      : sub && p.maxOpenCoursesPerChild > sub.maxOpenCoursesPerChild
                        ? 'Nâng lên gói này'
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
                <div className="text-2xl mb-1">🎨</div>
                <h4 className="font-display text-base font-black text-text">{pack.label}</h4>
                <p className="text-xs text-muted">{pack.unitPriceText}</p>
                <p className="mt-2 font-display text-lg font-black text-brand-600">{pack.priceFormatted}</p>
              </div>
              <Button
                variant="primary"
                className="mt-3 !py-1.5 !text-xs font-bold w-full rounded-xl"
                onClick={() => onOpenCheckout?.('credits', undefined, pack.price, pack.label, pack.id)}
              >
                Mua lượt
              </Button>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export { ParentPlanTab as PlanTab }
