import React from 'react'
import { Search, CreditCard, QrCode, Gift, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import type { AdminUser, PlanDef } from '../pages/AdminPage'

export type AdminBillingPosProps = {
  billingAdminMode: 'checkout' | 'vietqr' | 'grant'
  setBillingAdminMode: React.Dispatch<React.SetStateAction<'checkout' | 'vietqr' | 'grant'>>
  paymentMethod: 'transfer' | 'cash'
  setPaymentMethod: React.Dispatch<React.SetStateAction<'transfer' | 'cash'>>
  grantForm: { userEmail: string; planId: string; durationMonths: number; reason: string }
  setGrantForm: React.Dispatch<React.SetStateAction<{ userEmail: string; planId: string; durationMonths: number; reason: string }>>
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
}: AdminBillingPosProps) {
  const selPlan = availablePlans.find((p) => p.id === grantForm.planId) ?? availablePlans[0]
  const unitPrice = billingAdminMode === 'grant' ? 0 : (selPlan?.amountMinor ?? 0)
  const totalAmount = unitPrice * grantForm.durationMonths

  return (
    <div id="billing-grant-form" className="flex flex-col gap-4">
      <form
        className="ui-card p-5 border-2 border-brand-100/60 shadow-clay"
        onSubmit={(e) => void handlePosSubmit(e)}
      >
        {/* POS Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-700 text-[10px] font-black">
              POS
            </span>
            <p className="text-xs font-black uppercase tracking-wider text-brand-600">
              Trung tâm lên gói & thu ngân
            </p>
          </div>
          <h2 className="font-display text-xl font-bold text-text mt-1">
            Admin POS Thu Ngân
          </h2>
        </div>

        {/* Thanh chuyển đổi chế độ thu ngân (3 tab nhỏ gọn, Hallmark UI) */}
        <div className="mb-4 flex gap-1 rounded-2xl bg-brand-50/80 p-1 border border-brand-100/70">
          <button
            type="button"
            onClick={() => {
              setBillingAdminMode('checkout')
              const pName = planLabels[grantForm.planId] ?? grantForm.planId
              setGrantForm((f) => ({ ...f, reason: generateSuggestedReason('checkout', paymentMethod, pName, f.durationMonths) }))
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-1 text-xs font-bold transition',
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
              setGrantForm((f) => ({ ...f, reason: generateSuggestedReason('vietqr', paymentMethod, pName, f.durationMonths) }))
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-1 text-xs font-bold transition',
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
              setGrantForm((f) => ({ ...f, reason: generateSuggestedReason('grant', paymentMethod, pName, f.durationMonths) }))
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-1 text-xs font-bold transition',
              billingAdminMode === 'grant'
                ? 'bg-white text-brand-700 shadow-clay font-black'
                : 'text-muted hover:text-text',
            )}
          >
            <Gift size={14} />
            <span>Cấp 0đ</span>
          </button>
        </div>

        {/* 1. Chọn phụ huynh */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-extrabold uppercase tracking-wide text-muted" htmlFor="grant-user-search">
            1. Chọn phụ huynh / giảng viên
          </label>

          {grantSelectedUser ? (
            <div className="flex items-center gap-2.5 rounded-2xl bg-brand-50 p-2.5 border border-brand-200/70 shadow-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-200 text-xs font-black text-brand-800">
                {(grantSelectedUser.nickname ?? grantSelectedUser.email ?? '?')[0]?.toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm truncate text-text">{grantSelectedUser.nickname ?? '—'}</p>
                <p className="text-xs text-muted font-mono truncate">{grantSelectedUser.email}</p>
              </div>
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700 shrink-0">
                {roleLabels[grantSelectedUser.role] ?? grantSelectedUser.role}
              </span>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-coral-50 hover:text-danger transition"
                onClick={() => {
                  setGrantSelectedUser(null)
                  setGrantForm((f) => ({ ...f, userEmail: '' }))
                  setGrantUserResults([])
                }}
                aria-label="Xóa người dùng đã chọn"
                title="Chọn người khác"
              >
                <X size={15} />
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
                className="w-full min-h-11 rounded-xl border-2 border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-400"
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
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-brand-50 transition border-b border-border/20 last:border-0"
                  onClick={() => {
                    setGrantSelectedUser(u)
                    setGrantUserResults([])
                    const pName = planLabels[grantForm.planId] ?? grantForm.planId
                    setGrantForm((f) => ({
                      ...f,
                      userEmail: u.email ?? f.userEmail,
                      reason: f.reason || generateSuggestedReason(billingAdminMode, paymentMethod, pName, f.durationMonths),
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
          {!grantSelectedUser && !grantUserSearching && grantForm.userEmail.trim().length >= 2 && grantUserResults.length === 0 && (
            <p className="text-xs text-muted italic px-1">Không tìm thấy phụ huynh/giảng viên phù hợp.</p>
          )}
        </div>

        {/* 2. Chọn gói học */}
        <div className="mt-4 flex flex-col gap-1.5">
          <label className="text-xs font-extrabold uppercase tracking-wide text-muted">
            2. Chọn gói học
          </label>
          <div className="grid grid-cols-1 gap-2">
            {availablePlans.map((p) => {
              const isSelected = grantForm.planId === p.id
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
                      reason: generateSuggestedReason(billingAdminMode, paymentMethod, pName, f.durationMonths),
                    }))
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      const pName = planLabels[p.id] ?? p.name
                      setGrantForm((f) => ({
                        ...f,
                        planId: p.id,
                        reason: generateSuggestedReason(billingAdminMode, paymentMethod, pName, f.durationMonths),
                      }))
                    }
                  }}
                  className={cn(
                    'flex items-center justify-between p-2.5 rounded-2xl border-2 transition cursor-pointer text-left',
                    isSelected
                      ? 'border-brand-500 bg-brand-50/80 shadow-clay'
                      : 'border-border bg-white hover:border-brand-200',
                  )}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-text">{p.name}</p>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-black', planBadgeColors[p.id] ?? 'bg-slate-100 text-slate-600')}>
                        {p.monthlyCreateCredits} lượt AI
                      </span>
                    </div>
                    <p className="text-[11px] text-muted mt-0.5">
                      Tối đa {p.maxChildren} trẻ · {p.maxOpenCoursesPerChild === 999 ? 'Không giới hạn' : p.maxOpenCoursesPerChild ?? '?'} khóa/trẻ
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn('font-display font-black text-sm', isSelected ? 'text-brand-600' : 'text-text')}>
                      {billingAdminMode === 'grant' ? '0₫' : `${Number(p.amountMinor).toLocaleString('vi-VN')}₫`}
                    </p>
                    <p className="text-[10px] text-muted">/tháng</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 3. Chọn thời hạn */}
        <div className="mt-4 flex flex-col gap-1.5">
          <label className="text-xs font-extrabold uppercase tracking-wide text-muted">
            3. Chọn thời hạn
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 3, 6, 12].map((m) => {
              const isSelected = grantForm.durationMonths === m
              return (
                <button
                  key={m}
                  type="button"
                  className={cn(
                    'rounded-xl border-2 py-2 text-xs font-bold transition text-center',
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

        {/* 4. Hình thức thu (chỉ hiện trong mode checkout) */}
        {billingAdminMode === 'checkout' && (
          <div className="mt-4 flex flex-col gap-1.5">
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
                  'flex items-center justify-center gap-1.5 rounded-xl border-2 py-2 px-2 text-xs font-bold transition',
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
                  'flex items-center justify-center gap-1.5 rounded-xl border-2 py-2 px-2 text-xs font-bold transition',
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

        {/* Ghi chú / Lý do */}
        <div className="mt-4 flex flex-col gap-1.5">
          <label className="text-xs font-extrabold uppercase tracking-wide text-muted" htmlFor="grant-reason-input">
            {billingAdminMode === 'grant' ? 'Lý do cấp học bổng / 0đ' : 'Ghi chú thu tiền'}
          </label>
          <input
            id="grant-reason-input"
            required={billingAdminMode === 'grant'}
            placeholder="Ghi chú đối soát nội bộ..."
            className="min-h-10 rounded-xl border-2 border-border bg-white px-3 text-xs outline-none transition focus:border-brand-400"
            value={grantForm.reason}
            onChange={(e) => setGrantForm((f) => ({ ...f, reason: e.target.value }))}
          />
        </div>

        {/* Hộp tóm tắt thanh toán (POS receipt summary) */}
        <div className="mt-4 rounded-2xl bg-gradient-to-br from-brand-50/80 to-sky-50/50 p-3.5 border border-brand-100 text-xs shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-brand-200/50">
            <span className="text-muted font-medium">Đơn giá tháng:</span>
            <span className="font-bold text-text">
              {billingAdminMode === 'grant' ? '0₫ (Học bổng)' : `${unitPrice.toLocaleString('vi-VN')}₫/tháng`}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-brand-200/50">
            <span className="text-muted font-medium">Thời hạn mới:</span>
            <span className="font-bold text-text">+{grantForm.durationMonths} tháng</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-brand-200/50">
            <span className="text-muted font-medium">Số lượt tạo AI:</span>
            <span className="font-bold text-brand-700">{selPlan?.monthlyCreateCredits} lượt/tháng</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="font-extrabold text-sm text-text">
              {billingAdminMode === 'grant' ? 'Giá trị cấp:' : 'Tổng tiền thực thu:'}
            </span>
            <span className={cn('font-display text-lg font-black', billingAdminMode === 'grant' ? 'text-success' : 'text-brand-600')}>
              {billingAdminMode === 'grant' ? '0₫ (Miễn phí)' : `${totalAmount.toLocaleString('vi-VN')}₫`}
            </span>
          </div>
        </div>

        {/* Action button */}
        <Button
          type="submit"
          disabled={grantLoading || !grantSelectedUser}
          className={cn(
            'mt-4 w-full !py-3 rounded-2xl font-bold shadow-clay transition text-sm',
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
