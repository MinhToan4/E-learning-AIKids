import React, { useState, useMemo } from 'react'
import { Search, RotateCcw } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import type { PlanDef, SubscriptionRow } from '../../types'

export interface AdminSubscribersViewProps {
  billingSubs: SubscriptionRow[]
  billingPlans: PlanDef[]
  loading: boolean
  planLabels: Record<string, string>
  planBadgeColors: Record<string, string>
  roleLabels: Record<string, string>
  onRefresh: () => void
  onQuickGrant: (sub: SubscriptionRow) => void
}

export function AdminSubscribersView({
  billingSubs,
  billingPlans,
  loading,
  planLabels,
  planBadgeColors,
  roleLabels,
  onRefresh,
  onQuickGrant,
}: AdminSubscribersViewProps) {
  const [billingSubSearch, setBillingSubSearch] = useState('')
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('all')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'paid' | 'free' | 'expired'>('all')

  const filteredBillingSubs = useMemo(() => {
    return billingSubs.filter((s) => {
      const q = billingSubSearch.toLowerCase().trim()
      const matchSearch =
        !q ||
        (s.email ?? '').toLowerCase().includes(q) ||
        (s.name ?? '').toLowerCase().includes(q) ||
        s.userId.toLowerCase().includes(q)
      const matchPlan = selectedPlanFilter === 'all' || s.plan === selectedPlanFilter
      const isExpired = s.expiresAt ? new Date(s.expiresAt) < new Date() : false
      const matchStatus =
        selectedStatusFilter === 'all' ||
        (selectedStatusFilter === 'paid' && s.plan !== 'free' && !isExpired) ||
        (selectedStatusFilter === 'free' && s.plan === 'free') ||
        (selectedStatusFilter === 'expired' && isExpired)
      return matchSearch && matchPlan && matchStatus
    })
  }, [billingSubs, billingSubSearch, selectedPlanFilter, selectedStatusFilter])

  return (
    <div className="ui-card overflow-hidden shadow-sm">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-border/60 px-4 py-3 bg-brand-50/20">
        <div className="relative flex-1 min-w-[200px]">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
            <Search size={16} aria-hidden="true" />
          </span>
          <input
            type="search"
            aria-label="Tìm tài khoản trong danh sách thuê bao"
            placeholder="Tìm tên hoặc email..."
            value={billingSubSearch}
            onChange={(e) => setBillingSubSearch(e.target.value)}
            className="w-full min-h-10 rounded-xl border-2 border-border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-brand-400"
          />
        </div>

        {/* Bộ lọc gói cước */}
        <div className="flex items-center gap-1">
          <select
            value={selectedPlanFilter}
            onChange={(e) => setSelectedPlanFilter(e.target.value)}
            aria-label="Lọc theo gói cước"
            className="min-h-10 rounded-xl border-2 border-border bg-white px-3 py-1.5 text-xs font-bold text-text outline-none transition focus:border-brand-400 cursor-pointer shadow-sm"
          >
            <option value="all">Tất cả gói cước</option>
            {billingPlans.length > 0 ? (
              billingPlans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.amountMinor ? `(${p.amountMinor.toLocaleString('vi-VN')}₫)` : ''}
                </option>
              ))
            ) : (
              <>
                <option value="free">Miễn Phí</option>
                <option value="starter">Starter (69K)</option>
                <option value="aikids_official_129k">AI Kid Chính Thức (129K)</option>
                <option value="premium_family">Premium Gia Đình (149K)</option>
                <option value="pro">Pro (349K)</option>
              </>
            )}
          </select>
        </div>

        {/* Bộ lọc trạng thái */}
        <div className="flex items-center gap-1">
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value as 'all' | 'paid' | 'free' | 'expired')}
            aria-label="Lọc theo trạng thái"
            className="min-h-10 rounded-xl border-2 border-border bg-white px-3 py-1.5 text-xs font-bold text-text outline-none transition focus:border-brand-400 cursor-pointer shadow-sm"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="paid">Đang trả phí</option>
            <option value="free">Miễn phí</option>
            <option value="expired">Đã hết hạn</option>
          </select>
        </div>

        {(billingSubSearch || selectedPlanFilter !== 'all' || selectedStatusFilter !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setBillingSubSearch('')
              setSelectedPlanFilter('all')
              setSelectedStatusFilter('all')
            }}
            className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 px-2.5 py-2 text-xs font-bold text-slate-700 transition cursor-pointer"
            title="Xóa bộ lọc"
          >
            <RotateCcw size={13} />
            <span>Đặt lại</span>
          </button>
        )}

        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 border border-brand-200">
          {filteredBillingSubs.length}/{billingSubs.length} thuê bao
        </span>

        <Button variant="secondary" onClick={onRefresh} className="rounded-xl">
          Làm mới
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-brand-50/60 text-xs">
              <th className="px-4 py-2.5 font-extrabold">Tài khoản</th>
              <th className="px-4 py-2.5 font-extrabold">Vai trò</th>
              <th className="px-4 py-2.5 font-extrabold">Gói hiện tại</th>
              <th className="px-4 py-2.5 font-extrabold">Lượt AI còn</th>
              <th className="px-4 py-2.5 font-extrabold">Hết hạn</th>
              <th className="px-4 py-2.5 font-extrabold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && billingSubs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted">
                  Đang tải dữ liệu thuê bao...
                </td>
              </tr>
            ) : filteredBillingSubs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted">
                  Chưa có dữ liệu thuê bao
                </td>
              </tr>
            ) : (
              filteredBillingSubs.map((s) => (
                <tr
                  key={s.userId}
                  className="group border-b border-border/30 hover:bg-brand-50/30 transition"
                >
                  <td className="px-4 py-3">
                    <p className="font-bold">{s.name ?? '—'}</p>
                    <p className="text-xs text-muted font-mono">{s.email ?? s.userId.slice(0, 14)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                      {roleLabels[s.role] ?? s.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-extrabold',
                        planBadgeColors[s.plan] ?? 'bg-brand-50 text-brand-600',
                      )}
                    >
                      {planLabels[s.plan] ?? s.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'font-mono text-sm font-bold',
                        s.remainingCreateCredits === 0 ? 'text-danger' : 'text-text',
                      )}
                    >
                      {s.remainingCreateCredits}
                    </span>
                    <span className="text-xs text-muted">/{s.monthlyCreateCredits}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {s.expiresAt ? (
                      <span
                        className={cn(
                          new Date(s.expiresAt) < new Date() ? 'text-danger font-bold' : 'text-muted',
                        )}
                      >
                        {new Date(s.expiresAt).toLocaleDateString('vi-VN')}
                      </span>
                    ) : (
                      <span className="text-success font-bold">Không hết hạn</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="secondary"
                      className="text-xs py-1 px-3 shadow-sm"
                      onClick={() => onQuickGrant(s)}
                    >
                      Cấp gói mới
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
