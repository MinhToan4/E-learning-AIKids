import React from 'react'
import { cn } from '@/shared/lib/cn'
import { DEFAULT_CATALOG_PLANS, type PlanDef, type SubscriptionRow } from '../../types'

function formatVnd(minor: number) {
  return minor === 0 ? 'Miễn phí' : `${minor.toLocaleString('vi-VN')}₫/tháng`
}

export interface AdminPlansCatalogViewProps {
  paymentProviderMode: 'manual' | 'sepay'
  onPaymentProviderModeChange: (mode: 'manual' | 'sepay') => void
  billingPlans: PlanDef[]
  billingSubs: SubscriptionRow[]
  planBadgeColors: Record<string, string>
  onEditPlan: (plan: PlanDef | null) => void
  onTogglePlan: (plan: PlanDef) => void
}

export function AdminPlansCatalogView({
  paymentProviderMode,
  onPaymentProviderModeChange,
  billingPlans,
  billingSubs,
  planBadgeColors,
  onEditPlan,
  onTogglePlan,
}: AdminPlansCatalogViewProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* ⚙️ Cấu hình Cổng Thanh Toán Khách Hàng (Soft Clay Panel) */}
      <div className="rounded-3xl border-2 border-brand-200/80 bg-gradient-to-r from-brand-50/50 via-white to-amber-50/40 p-4 sm:p-5 shadow-clay">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⚙️</span>
              <h3 className="font-display text-base sm:text-lg font-black text-text">
                Cấu hình Cổng Thanh Toán Khách Hàng
              </h3>
              <span className="rounded-full bg-brand-100 text-brand-700 px-2 py-0.5 text-[10px] font-black border border-brand-200">
                {paymentProviderMode === 'sepay' ? 'SePay PG' : 'Thủ công Vietcombank'}
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Chọn phương thức xử lý cổng thanh toán khi phụ huynh bấm nâng cấp gói hoặc mua lượt AI trên app.
            </p>
          </div>

          {/* 2 Lựa chọn: Radio / Button Tab */}
          <div className="flex rounded-2xl bg-white p-1 border-2 border-brand-200/70 shadow-sm shrink-0 gap-1">
            <button
              type="button"
              onClick={() => onPaymentProviderModeChange('manual')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer',
                paymentProviderMode === 'manual'
                  ? 'bg-brand-600 text-white shadow-clay font-black'
                  : 'text-stone-600 hover:text-text hover:bg-stone-50',
              )}
            >
              <span>🏦 Chuyển khoản Thủ công (Mặc định)</span>
            </button>
            <button
              type="button"
              onClick={() => onPaymentProviderModeChange('sepay')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer',
                paymentProviderMode === 'sepay'
                  ? 'bg-brand-600 text-white shadow-clay font-black'
                  : 'text-stone-600 hover:text-text hover:bg-stone-50',
              )}
            >
              <span>⚡ Cổng Tự động SePay</span>
            </button>
          </div>
        </div>

        <div className="mt-3 grid gap-2.5 sm:grid-cols-2 text-xs">
          <div
            onClick={() => onPaymentProviderModeChange('manual')}
            className={cn(
              'rounded-2xl p-3 border-2 transition cursor-pointer flex items-start gap-2.5',
              paymentProviderMode === 'manual'
                ? 'border-brand-400 bg-brand-50/70 shadow-sm'
                : 'border-border/60 bg-white/70 hover:border-brand-200 opacity-70',
            )}
          >
            <div className="h-4 w-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 border-brand-600">
              {paymentProviderMode === 'manual' && (
                <div className="h-2 w-2 rounded-full bg-brand-600" />
              )}
            </div>
            <div>
              <p className="font-bold text-text">Thanh toán Chuyển khoản Thủ công (Mặc định)</p>
              <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                Vietcombank LE QUANG MINH 9812723359, khách báo đã chuyển khoản → Admin duyệt 1-Click.
              </p>
            </div>
          </div>

          <div
            onClick={() => onPaymentProviderModeChange('sepay')}
            className={cn(
              'rounded-2xl p-3 border-2 transition cursor-pointer flex items-start gap-2.5',
              paymentProviderMode === 'sepay'
                ? 'border-brand-400 bg-brand-50/70 shadow-sm'
                : 'border-border/60 bg-white/70 hover:border-brand-200 opacity-70',
            )}
          >
            <div className="h-4 w-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 border-brand-600">
              {paymentProviderMode === 'sepay' && (
                <div className="h-2 w-2 rounded-full bg-brand-600" />
              )}
            </div>
            <div>
              <p className="font-bold text-text">Cổng Thanh toán Tự động SePay</p>
              <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                Tích hợp SePay PG (Merchant SP-TEST-LQ79A795). Tự động khớp mã và kích hoạt gói tức thì.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border-2 border-border/80 bg-surface p-5 shadow-clay">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📦</span>
            <h3 className="font-display text-lg font-black text-text">
              Quản trị danh mục gói bán & Tùy biến (Package Builder)
            </h3>
          </div>
          <p className="text-xs text-muted mt-1">
            Tùy chỉnh định mức lượt tạo AI, giới hạn tài khoản con, chính sách bảo toàn quyền lợi và
            trạng thái mở bán.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onEditPlan(null)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-95 px-4 py-2.5 text-sm font-black text-white shadow-clay transition shrink-0 cursor-pointer"
        >
          <span className="text-lg leading-none">+</span>
          <span>Tạo gói bán mới</span>
        </button>
      </div>

      {/* Grid cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {(billingPlans.length > 0 ? billingPlans : DEFAULT_CATALOG_PLANS).map((plan) => {
          const userCount =
            plan.activeSubscribers ?? billingSubs.filter((s) => s.plan === plan.id).length
          const isPlanActive = plan.isActive !== false
          return (
            <div
              key={plan.id}
              className={cn(
                'ui-card flex flex-col gap-2.5 p-3.5 sm:p-4 transition hover:shadow-md',
                plan.id !== 'free' ? 'border-2' : 'border border-dashed border-border',
                !isPlanActive &&
                  'border-2 border-dashed border-stone-300 bg-stone-100/70 opacity-70 grayscale-[25%]',
              )}
            >
              {!isPlanActive && (
                <div className="rounded-lg bg-stone-200/90 text-stone-700 px-2 py-0.5 text-[11px] font-black tracking-wide border border-stone-300 flex items-center gap-1.5 w-fit">
                  <span>🔒 ĐÃ TẠM ẨN KHỎI KHÁCH HÀNG</span>
                </div>
              )}

              <div className="flex items-start justify-between gap-2.5">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span
                      className={cn(
                        'inline-block rounded-full px-2.5 py-0.5 text-xs font-extrabold',
                        planBadgeColors[plan.id] ?? 'bg-brand-50 text-brand-600',
                      )}
                    >
                      {plan.id.toUpperCase()}
                    </span>
                    {plan.badge && (
                      <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800 border border-amber-300">
                        {plan.badge}
                      </span>
                    )}
                    <span className="inline-block rounded-full bg-border/60 px-2 py-0.5 text-[9px] font-bold text-muted">
                      v{plan.version ?? 1}
                    </span>
                  </div>
                  <h4 className="font-display text-base sm:text-lg text-text font-bold">{plan.name}</h4>
                  {plan.tagline && (
                    <p className="text-xs text-muted line-clamp-1 mt-0.5">{plan.tagline}</p>
                  )}
                  <p className="text-xl sm:text-2xl font-black text-brand-600 mt-0.5">
                    {formatVnd(plan.amountMinor)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-xl text-text font-black">{userCount}</p>
                  <p className="text-[11px] text-muted">phụ huynh</p>
                  <div className="mt-1">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black',
                        isPlanActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-stone-200/90 text-stone-700 border border-stone-300',
                      )}
                    >
                      <span>{isPlanActive ? '🟢' : '🔒'}</span>
                      <span>{isPlanActive ? 'Đang mở bán' : 'Đã tạm ẩn'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Thu gọn 3 chỉ số (Lượt AI, Hồ sơ con, Khóa/trẻ) thành 1 hàng ngang compact */}
              <div className="grid grid-cols-3 gap-2 bg-stone-50 p-2 rounded-xl text-center text-xs border border-stone-200/60">
                <div className="rounded-lg bg-white p-1.5 shadow-2xs">
                  <p className="font-display text-base font-black text-brand-700 leading-tight">
                    {plan.monthlyCreateCredits}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 mt-0.5">lượt AI/tháng</p>
                </div>
                <div className="rounded-lg bg-white p-1.5 shadow-2xs">
                  <p className="font-display text-base font-black text-brand-700 leading-tight">
                    {plan.maxChildren}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 mt-0.5">hồ sơ trẻ</p>
                </div>
                <div className="rounded-lg bg-white p-1.5 shadow-2xs">
                  <p className="font-display text-base font-black text-brand-700 leading-tight">
                    {plan.maxOpenCoursesPerChild === 999
                      ? '∞'
                      : (plan.maxOpenCoursesPerChild ?? '?')}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 mt-0.5">khóa/trẻ</p>
                </div>
              </div>

              {/* Thu gọn danh sách tính năng: 2-3 tính năng gạch đầu dòng ngắn gọn */}
              <ul className="flex flex-col gap-1 text-xs">
                {plan.features.slice(0, 3).map((f, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 truncate" title={f}>
                    <span className="text-emerald-600 font-black text-xs shrink-0">✓</span>
                    <span className="truncate">{f}</span>
                  </li>
                ))}
                {plan.features.length > 3 && (
                  <li className="text-[10px] text-muted font-bold pl-4">
                    +{plan.features.length - 3} tính năng khác
                  </li>
                )}
              </ul>

              <div className="mt-auto pt-3 border-t border-border/60 flex flex-col gap-2.5">
                <p className="text-xs text-muted">
                  {plan.requiresPayment ? '💳 Yêu cầu thanh toán' : '🎁 Miễn phí, tự động kích hoạt'}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onEditPlan(plan)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-border/80 bg-surface px-3 py-1.5 text-xs font-black text-text shadow-sm transition hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 active:scale-95 cursor-pointer"
                  >
                    <span>✏️</span>
                    <span>Chỉnh sửa gói</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onTogglePlan(plan)}
                    disabled={plan.id === 'free'}
                    title={
                      plan.id === 'free'
                        ? 'Không được phép ẩn gói miễn phí (free)'
                        : isPlanActive
                          ? 'Tạm ẩn gói khỏi danh mục khách hàng'
                          : 'Mở bán lại gói này'
                    }
                    className={cn(
                      'inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black shadow-sm transition active:scale-95 cursor-pointer',
                      plan.id === 'free'
                        ? 'opacity-40 cursor-not-allowed text-muted border-border/80 bg-surface'
                        : isPlanActive
                          ? 'bg-stone-200 hover:bg-stone-300 text-stone-700 border-stone-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-clay',
                    )}
                  >
                    <span>{isPlanActive ? '🔒' : '👁️'}</span>
                    <span>{isPlanActive ? 'Tạm ẩn gói' : 'Mở bán lại'}</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
