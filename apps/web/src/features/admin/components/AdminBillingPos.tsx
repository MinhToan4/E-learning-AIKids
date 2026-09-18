import React, { useState } from 'react'
import { Search, CreditCard, QrCode, Gift, X, Sparkles, Clock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import type { AdminUser, PlanDef, PendingIntent } from '../types'

export const AI_CREDIT_PACKS = [
  {
    id: 'credits_10',
    credits: 10,
    price: 20000,
    priceFormatted: '20.000₫',
    label: '10 lượt AI',
    unitPriceText: '2.000₫/lượt',
  },
  {
    id: 'credits_25',
    credits: 25,
    price: 50000,
    priceFormatted: '50.000₫',
    label: '25 lượt AI',
    unitPriceText: '2.000₫/lượt',
  },
  {
    id: 'credits_50',
    credits: 50,
    price: 100000,
    priceFormatted: '100.000₫',
    label: '50 lượt AI',
    badge: 'Phổ biến nhất',
    unitPriceText: '2.000₫/lượt',
  },
  {
    id: 'credits_100',
    credits: 100,
    price: 180000,
    priceFormatted: '180.000₫',
    label: '100 lượt AI',
    badge: 'Tiết kiệm 10%',
    unitPriceText: '1.800₫/lượt',
  },
  {
    id: 'credits_200',
    credits: 200,
    price: 320000,
    priceFormatted: '320.000₫',
    label: '200 lượt AI',
    badge: 'Tiết kiệm 20%',
    unitPriceText: '1.600₫/lượt',
  },
]

export type AdminBillingPosProps = {
  billingAdminMode: 'checkout' | 'vietqr' | 'grant'
  setBillingAdminMode: React.Dispatch<React.SetStateAction<'checkout' | 'vietqr' | 'grant'>>
  paymentMethod: 'transfer' | 'cash'
  setPaymentMethod: React.Dispatch<React.SetStateAction<'transfer' | 'cash'>>
  grantForm: { userEmail: string; planId: string; durationMonths: number; reason: string }
  setGrantForm: React.Dispatch<
    React.SetStateAction<{ userEmail: string; planId: string; durationMonths: number; reason: string }>
  >
  grantLoading: boolean
  grantSelectedUser: AdminUser | null
  setGrantSelectedUser: React.Dispatch<React.SetStateAction<AdminUser | null>>
  grantUserResults: AdminUser[]
  setGrantUserResults: React.Dispatch<React.SetStateAction<AdminUser[]>>
  grantUserSearching: boolean
  searchGrantUser: (email: string) => Promise<void>
  availablePlans: PlanDef[]
  planLabels: Record<string, string>
  planBadgeColors: Record<string, string>
  roleLabels: Record<string, string>
  handlePosSubmit: (e: React.FormEvent) => Promise<void>
  generateSuggestedReason: (
    mode: 'checkout' | 'vietqr' | 'grant',
    method: 'transfer' | 'cash',
    planName: string,
    durationMonths: number,
  ) => string
  pendingIntents?: PendingIntent[]
  onConfirmPendingIntent?: (intent: PendingIntent) => void
  onViewPendingIntentDetail?: (intent: PendingIntent) => void
}

export function AdminBillingPos({
  billingAdminMode,
  setBillingAdminMode,
  paymentMethod,
  setPaymentMethod,
  grantForm,
  setGrantForm,
  grantLoading,
  grantSelectedUser,
  setGrantSelectedUser,
  grantUserResults,
  setGrantUserResults,
  grantUserSearching,
  searchGrantUser,
  availablePlans,
  planLabels,
  planBadgeColors,
  roleLabels,
  handlePosSubmit,
  generateSuggestedReason,
  pendingIntents = [],
  onConfirmPendingIntent,
  onViewPendingIntentDetail,
}: AdminBillingPosProps) {
  // Toggle between Monthly Plans (129k, Premium, Pro) and AI Refill Packs (5 packs)
  const [productType, setProductType] = useState<'subscription' | 'credits'>('subscription')

  const selCreditPack = AI_CREDIT_PACKS.find((cp) => cp.id === grantForm.planId)
  const selPlan = availablePlans.find((p) => p.id === grantForm.planId) ?? availablePlans[0]

  const rawUnitPrice =
    productType === 'credits'
      ? (selCreditPack?.price ?? 100000)
      : (selPlan?.amountMinor ?? (selPlan as any)?.priceMonthly ?? (selPlan as any)?.price ?? 0)

  const unitPrice = billingAdminMode === 'grant' ? 0 : Number(rawUnitPrice) || 0
  const durationFactor = productType === 'credits' ? 1 : grantForm.durationMonths
  const totalAmount = unitPrice * durationFactor

  return (
    <div id="billing-grant-form" className="flex flex-col gap-4">
      {/* ── 1. PHÂN VÙNG DUYỆT ĐƠN CHỜ THANH TOÁN (PENDING TRANSACTIONS) ── */}
      {pendingIntents.length > 0 && (
        <div className="rounded-3xl border-2 border-amber-300 bg-amber-50/80 p-3.5 shadow-clay">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-200 text-amber-900 text-xs font-black">
                <Clock size={14} />
              </span>
              <p className="text-xs font-black uppercase tracking-wider text-amber-900">
                1. Duyệt đơn chờ thanh toán ({pendingIntents.length})
              </p>
            </div>
            <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-black text-amber-900">
              Cần xác nhận
            </span>
          </div>

          <div className="max-h-56 overflow-y-auto p-1 space-y-2">
            {pendingIntents.map((pi) => (
              <div
                key={pi.id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  onViewPendingIntentDetail
                    ? onViewPendingIntentDetail(pi)
                    : onConfirmPendingIntent?.(pi)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    if (onViewPendingIntentDetail) {
                      onViewPendingIntentDetail(pi)
                    } else {
                      onConfirmPendingIntent?.(pi)
                    }
                  }
                }}
                className="flex items-center justify-between gap-2 rounded-2xl bg-white p-2.5 border border-amber-200 shadow-sm cursor-pointer hover:border-amber-400 hover:shadow-md transition text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-bold text-xs truncate text-text">{pi.userName ?? 'Khách hàng'}</p>
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-amber-900">
                      {pi.paymentCode ?? pi.id.slice(0, 8)}
                    </span>
                    <span className="text-xs font-black text-amber-900 ml-auto mr-1">
                      {Number(pi.amountMinor).toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                  <p className="text-[11px] text-muted truncate mt-0.5">{pi.userEmail}</p>
                </div>

                {(onConfirmPendingIntent || onViewPendingIntentDetail) && (
                  <Button
                    className="shrink-0 text-xs font-bold !bg-amber-600 hover:!bg-amber-700 !text-white shadow-sm !py-1.5 !px-2.5 rounded-xl cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      onConfirmPendingIntent ? onConfirmPendingIntent(pi) : onViewPendingIntentDetail?.(pi)
                    }}
                  >
                    <CheckCircle2 size={13} className="mr-1" />
                    Duyệt 1-Click
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 2, 3, 4: POS FORM (XUẤT VIETQR, BẢNG GIÁ 129K & 5 GÓI AI, CẤP HỌC BỔNG) ── */}
      <form
        className="ui-card p-4 sm:p-5 border-2 border-brand-100/60 shadow-clay"
        onSubmit={(e) => void handlePosSubmit(e)}
      >
        {/* POS Header */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-brand-100 text-brand-700 text-[10px] font-black">
              POS
            </span>
            <p className="text-[11px] font-black uppercase tracking-wider text-brand-600">
              Trung tâm Lên Gói, Xuất VietQR & Thu Ngân
            </p>
          </div>
          <h2 className="font-display text-base sm:text-lg font-bold text-text mt-0.5">
            Admin POS Thu Ngân & Học Bổng
          </h2>
        </div>

        {/* Thanh chuyển đổi chế độ thu ngân (3 tab nhỏ gọn, Hallmark UI) */}
        <div className="mb-3 flex gap-1 rounded-2xl bg-brand-50/80 p-1 border border-brand-100/70">
          <button
            type="button"
            onClick={() => {
              setBillingAdminMode('checkout')
              const pName = planLabels[grantForm.planId] ?? grantForm.planId
              setGrantForm((f) => ({
                ...f,
                reason: generateSuggestedReason('checkout', paymentMethod, pName, f.durationMonths),
              }))
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 rounded-xl py-1.5 px-1 text-xs font-bold transition cursor-pointer',
              billingAdminMode === 'checkout'
                ? 'bg-white text-brand-700 shadow-clay font-black'
                : 'text-muted hover:text-text',
            )}
          >
            <CreditCard size={14} />
            <span>Thanh toán ngay</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setBillingAdminMode('vietqr')
              const pName = planLabels[grantForm.planId] ?? grantForm.planId
              setGrantForm((f) => ({
                ...f,
                reason: generateSuggestedReason('vietqr', paymentMethod, pName, f.durationMonths),
              }))
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 rounded-xl py-1.5 px-1 text-xs font-bold transition cursor-pointer',
              billingAdminMode === 'vietqr'
                ? 'bg-white text-brand-700 shadow-clay font-black'
                : 'text-muted hover:text-text',
            )}
          >
            <QrCode size={14} />
            <span>Xuất mã VietQR</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setBillingAdminMode('grant')
              const pName = planLabels[grantForm.planId] ?? grantForm.planId
              setGrantForm((f) => ({
                ...f,
                reason: generateSuggestedReason('grant', paymentMethod, pName, f.durationMonths),
              }))
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 rounded-xl py-1.5 px-1 text-xs font-bold transition cursor-pointer',
              billingAdminMode === 'grant'
                ? 'bg-white text-brand-700 shadow-clay font-black'
                : 'text-muted hover:text-text',
            )}
          >
            <Gift size={14} />
            <span>Cấp học bổng 0đ</span>
          </button>
        </div>

        {/* 1. Chọn phụ huynh */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-xs font-extrabold uppercase tracking-wide text-muted"
            htmlFor="grant-user-search"
          >
            1. Chọn phụ huynh / người học
          </label>

          {grantSelectedUser ? (
            <div className="flex items-center gap-2 rounded-2xl bg-brand-50 p-2 border border-brand-200/70 shadow-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-200 text-xs font-black text-brand-800">
                {(grantSelectedUser.nickname ?? grantSelectedUser.email ?? '?')[0]?.toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs truncate text-text">
                  {grantSelectedUser.nickname ?? '—'}
                </p>
                <p className="text-[11px] text-muted font-mono truncate">{grantSelectedUser.email}</p>
              </div>
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700 shrink-0">
                {roleLabels[grantSelectedUser.role] ?? grantSelectedUser.role}
              </span>
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-lg text-muted hover:bg-coral-50 hover:text-danger transition cursor-pointer shrink-0"
                onClick={() => {
                  setGrantSelectedUser(null)
                  setGrantForm((f) => ({ ...f, userEmail: '' }))
                  setGrantUserResults([])
                }}
                aria-label="Xóa người dùng đã chọn"
                title="Chọn người khác"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
                <Search size={15} />
              </span>
              <input
                id="grant-user-search"
                type="search"
                placeholder="Nhập email, họ tên, hoặc username..."
                className="w-full min-h-9 rounded-xl border-2 border-border bg-white pl-9 pr-3 text-xs outline-none transition focus:border-brand-400"
                value={grantForm.userEmail}
                onChange={(e) => {
                  const val = e.target.value
                  setGrantForm((f) => ({ ...f, userEmail: val }))
                  void searchGrantUser(val)
                }}
                autoComplete="off"
              />
              {grantUserSearching && (
                <span className="absolute right-3 inset-y-0 flex items-center text-xs text-muted font-medium animate-pulse">
                  Đang tìm...
                </span>
              )}
            </div>
          )}

          {/* Dropdown gợi ý tìm kiếm */}
          {!grantSelectedUser && grantUserResults.length > 0 && (
            <div className="mt-1 rounded-2xl border-2 border-brand-200 bg-white shadow-clay overflow-hidden max-h-48 overflow-y-auto">
              {grantUserResults.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-brand-50 transition border-b border-border/20 last:border-0 cursor-pointer"
                  onClick={() => {
                    setGrantSelectedUser(u)
                    setGrantUserResults([])
                    const pName = planLabels[grantForm.planId] ?? grantForm.planId
                    setGrantForm((f) => ({
                      ...f,
                      userEmail: u.email ?? f.userEmail,
                      reason:
                        f.reason ||
                        generateSuggestedReason(
                          billingAdminMode,
                          paymentMethod,
                          pName,
                          f.durationMonths,
                        ),
                    }))
                  }}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                    {(u.nickname ?? u.email ?? '?')[0]?.toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs truncate text-text">{u.nickname ?? '—'}</p>
                    <p className="text-[11px] text-muted truncate font-mono">{u.email}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 shrink-0">
                    {roleLabels[u.role] ?? u.role}
                  </span>
                </button>
              ))}
            </div>
          )}
          {!grantSelectedUser &&
            !grantUserSearching &&
            grantForm.userEmail.trim().length >= 2 &&
            grantUserResults.length === 0 && (
              <p className="text-xs text-muted italic px-1">
                Không tìm thấy phụ huynh/người học phù hợp.
              </p>
            )}
        </div>

        {/* 2. Chọn Danh Mục Gói Cước (Gói 129k / Catalog HOẶC 5 Gói nạp lượt AI) */}
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wide text-muted">
              2. Danh mục Gói Cước & Nạp AI
            </label>
            <div className="flex rounded-xl bg-brand-50 p-0.5 border border-brand-100">
              <button
                type="button"
                onClick={() => {
                  setProductType('subscription')
                  setGrantForm((f) => ({ ...f, planId: 'starter' }))
                }}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer',
                  productType === 'subscription'
                    ? 'bg-white text-brand-700 shadow-sm font-black'
                    : 'text-muted hover:text-text',
                )}
              >
                Gói tháng (129K)
              </button>
              <button
                type="button"
                onClick={() => {
                  setProductType('credits')
                  setGrantForm((f) => ({ ...f, planId: 'credits_50' }))
                }}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer',
                  productType === 'credits'
                    ? 'bg-white text-brand-700 shadow-sm font-black'
                    : 'text-muted hover:text-text',
                )}
              >
                Nạp lượt AI (5 gói)
              </button>
            </div>
          </div>

          {/* GÓI THÁNG CATALOG (Có Gói Tiêu Chuẩn 129K) - Lưới 2 cột */}
          {productType === 'subscription' ? (
            <div className="grid grid-cols-2 gap-2">
              {availablePlans.map((p) => {
                const isSelected = grantForm.planId === p.id
                const is129k = p.id === 'starter' || p.amountMinor === 129000
                return (
                  <div
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      const pName = planLabels[p.id] ?? p.name
                      setGrantForm((f) => ({
                        ...f,
                        planId: p.id,
                        reason: generateSuggestedReason(
                          billingAdminMode,
                          paymentMethod,
                          pName,
                          f.durationMonths,
                        ),
                      }))
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        const pName = planLabels[p.id] ?? p.name
                        setGrantForm((f) => ({
                          ...f,
                          planId: p.id,
                          reason: generateSuggestedReason(
                            billingAdminMode,
                            paymentMethod,
                            pName,
                            f.durationMonths,
                          ),
                        }))
                      }
                    }}
                    className={cn(
                      'flex flex-col justify-between p-2 rounded-xl border-2 transition cursor-pointer text-left',
                      isSelected
                        ? 'border-brand-500 bg-brand-50/80 shadow-clay font-bold'
                        : is129k
                          ? 'border-brand-200 bg-brand-50/20 hover:border-brand-400'
                          : 'border-border bg-white hover:border-brand-200',
                    )}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-1">
                        <p className="font-bold text-xs text-text truncate">{p.name}</p>
                        {is129k && (
                          <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 text-[9px] font-black">
                            Tiêu chuẩn 129K
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        <span
                          className={cn(
                            'rounded-full px-1.5 py-0.5 text-[10px] font-black',
                            planBadgeColors[p.id] ?? 'bg-slate-100 text-slate-600',
                          )}
                        >
                          {p.monthlyCreateCredits} lượt AI
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 pt-1 border-t border-border/30 flex items-baseline justify-between">
                      <span
                        className={cn(
                          'font-display font-black text-xs',
                          isSelected ? 'text-brand-600' : 'text-text',
                        )}
                      >
                        {billingAdminMode === 'grant'
                          ? '0₫'
                          : (() => {
                              const rawP =
                                p.amountMinor ?? (p as any)?.priceMonthly ?? (p as any)?.price ?? 0
                              const amt = Number(rawP) || 0
                              return amt === 0 ? 'Miễn phí' : `${amt.toLocaleString('vi-VN')}₫`
                            })()}
                      </span>
                      <span className="text-[10px] text-muted">/tháng</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* 5 GÓI NẠP LƯỢT AI (10, 25, 50, 100, 200 lượt) - Lưới 2 cột */
            <div className="grid grid-cols-2 gap-2">
              {AI_CREDIT_PACKS.map((cp, idx) => {
                const isSelected = grantForm.planId === cp.id
                const isLastOdd = idx === 4
                return (
                  <div
                    key={cp.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setGrantForm((f) => ({
                        ...f,
                        planId: cp.id,
                        reason: generateSuggestedReason(
                          billingAdminMode,
                          paymentMethod,
                          cp.label,
                          1,
                        ),
                      }))
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setGrantForm((f) => ({
                          ...f,
                          planId: cp.id,
                          reason: generateSuggestedReason(
                            billingAdminMode,
                            paymentMethod,
                            cp.label,
                            1,
                          ),
                        }))
                      }
                    }}
                    className={cn(
                      'flex flex-col justify-between p-2 rounded-xl border-2 transition cursor-pointer text-left',
                      isLastOdd && 'col-span-2',
                      isSelected
                        ? 'border-brand-500 bg-brand-50/80 shadow-clay font-bold'
                        : 'border-border bg-white hover:border-brand-200',
                    )}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-1">
                        <Sparkles size={12} className="text-brand-500 shrink-0" />
                        <p className="font-bold text-xs text-text">{cp.label}</p>
                        {cp.badge && (
                          <span className="rounded-full bg-amber-100 text-amber-800 px-1 py-0.2 text-[9px] font-black">
                            {cp.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted mt-0.5 font-medium">{cp.unitPriceText}</p>
                    </div>
                    <div className="mt-1.5 pt-1 border-t border-border/30 flex items-baseline justify-between">
                      <span
                        className={cn(
                          'font-display font-black text-xs',
                          isSelected ? 'text-brand-600' : 'text-text',
                        )}
                      >
                        {billingAdminMode === 'grant' ? '0₫' : cp.priceFormatted}
                      </span>
                      <span className="text-[9px] text-muted">nạp ngay</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 3. Chọn thời hạn (Chỉ hiển thị với gói tháng) */}
        {productType === 'subscription' && (
          <div className="mt-3 flex flex-col gap-1">
            <label className="text-xs font-extrabold uppercase tracking-wide text-muted">
              3. Chọn thời hạn
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 3, 6, 12].map((m) => {
                const isSelected = grantForm.durationMonths === m
                return (
                  <button
                    key={m}
                    type="button"
                    className={cn(
                      'rounded-xl border-2 py-1.5 text-xs font-bold transition text-center cursor-pointer',
                      isSelected
                        ? 'border-brand-400 bg-brand-50 text-brand-700 shadow-clay font-black'
                        : 'border-border bg-white text-muted hover:border-brand-300',
                    )}
                    onClick={() => {
                      const pName = planLabels[grantForm.planId] ?? grantForm.planId
                      setGrantForm((f) => ({
                        ...f,
                        durationMonths: m,
                        reason: generateSuggestedReason(billingAdminMode, paymentMethod, pName, m),
                      }))
                    }}
                  >
                    {m} tháng
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* 4. Hình thức thu (chỉ hiện trong mode checkout) */}
        {billingAdminMode === 'checkout' && (
          <div className="mt-3 flex flex-col gap-1">
            <label className="text-xs font-extrabold uppercase tracking-wide text-muted">
              4. Hình thức thu tiền
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('transfer')
                  const pName = planLabels[grantForm.planId] ?? grantForm.planId
                  setGrantForm((f) => ({
                    ...f,
                    reason: generateSuggestedReason('checkout', 'transfer', pName, f.durationMonths),
                  }))
                }}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-xl border-2 py-1.5 px-2 text-xs font-bold transition cursor-pointer',
                  paymentMethod === 'transfer'
                    ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-clay font-black'
                    : 'border-border bg-white text-muted hover:border-brand-300',
                )}
              >
                <span>🏦 Chuyển khoản</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('cash')
                  const pName = planLabels[grantForm.planId] ?? grantForm.planId
                  setGrantForm((f) => ({
                    ...f,
                    reason: generateSuggestedReason('checkout', 'cash', pName, f.durationMonths),
                  }))
                }}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-xl border-2 py-1.5 px-2 text-xs font-bold transition cursor-pointer',
                  paymentMethod === 'cash'
                    ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-clay font-black'
                    : 'border-border bg-white text-muted hover:border-brand-300',
                )}
              >
                <span>💵 Tiền mặt</span>
              </button>
            </div>
          </div>
        )}

        {/* Ghi chú / Lý do (Cấp học bổng / 0đ) */}
        <div className="mt-3 flex flex-col gap-1">
          <label
            className="text-xs font-extrabold uppercase tracking-wide text-muted"
            htmlFor="grant-reason-input"
          >
            {billingAdminMode === 'grant' ? 'Lý do cấp học bổng / 0đ' : 'Ghi chú thu tiền đối soát'}
          </label>
          <input
            id="grant-reason-input"
            required={billingAdminMode === 'grant'}
            placeholder={
              billingAdminMode === 'grant'
                ? 'Nhập lý do cấp học bổng (học sinh xuất sắc, đối tác)...'
                : 'Ghi chú đối soát nội bộ...'
            }
            className="min-h-9 rounded-xl border-2 border-border bg-white px-3 text-xs outline-none transition focus:border-brand-400"
            value={grantForm.reason}
            onChange={(e) => setGrantForm((f) => ({ ...f, reason: e.target.value }))}
          />
        </div>

        {/* Smart POS Receipt & Footer */}
        <div className="mt-3 rounded-2xl bg-gradient-to-br from-brand-50/80 to-sky-50/50 p-3 border border-brand-100 text-xs shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] text-muted pb-2 border-b border-brand-200/50">
            <span>
              Đơn giá:{' '}
              <strong className="text-text font-bold">
                {billingAdminMode === 'grant'
                  ? '0₫ (Học bổng)'
                  : `${unitPrice.toLocaleString('vi-VN')}₫${productType === 'subscription' ? '/tháng' : ''}`}
              </strong>
            </span>
            {productType === 'subscription' && (
              <span>
                Thời hạn: <strong className="text-text font-bold">+{grantForm.durationMonths} tháng</strong>
              </span>
            )}
            <span>
              Lượt AI:{' '}
              <strong className="text-brand-700 font-bold">
                {productType === 'credits'
                  ? `+${selCreditPack?.credits ?? 50} lượt`
                  : `${selPlan?.monthlyCreateCredits ?? 50} lượt/tháng`}
              </strong>
            </span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="font-extrabold text-xs text-text">
              {billingAdminMode === 'grant' ? 'Giá trị cấp:' : 'Tổng tiền thực thu:'}
            </span>
            <span
              className={cn(
                'font-display text-lg font-black',
                billingAdminMode === 'grant' ? 'text-success' : 'text-brand-600',
              )}
            >
              {billingAdminMode === 'grant' ? '0₫ (Học bổng 0đ)' : `${totalAmount.toLocaleString('vi-VN')}₫`}
            </span>
          </div>
        </div>

        {/* Action button */}
        <Button
          type="submit"
          disabled={grantLoading || !grantSelectedUser}
          className={cn(
            'mt-3 w-full !py-2.5 rounded-2xl font-bold shadow-clay transition text-xs sm:text-sm cursor-pointer',
            billingAdminMode === 'checkout'
              ? '!bg-brand-600 hover:!bg-brand-700 !text-white'
              : billingAdminMode === 'vietqr'
                ? '!bg-amber-600 hover:!bg-amber-700 !text-white'
                : '!bg-violet-600 hover:!bg-violet-700 !text-white',
          )}
        >
          {grantLoading
            ? 'Đang xử lý...'
            : billingAdminMode === 'checkout'
              ? '⚡ Xác nhận Đã Thu Tiền & Kích Hoạt Gói'
              : billingAdminMode === 'vietqr'
                ? '📱 Tạo Đơn Chờ & Xuất Mã VietQR'
                : '🎁 Xác nhận Cấp Gói Học Bổng (0đ)'}
        </Button>
      </form>
    </div>
  )
}
