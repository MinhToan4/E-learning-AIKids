import React from 'react'
import { History, Trash2 } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export type BillingTransactionLog = {
  id: string
  timestamp: string
  userEmail: string
  userName?: string
  type: 'checkout_paid' | 'vietqr_intent' | 'grant_scholarship' | 'intent_confirmed'
  typeLabel: string
  planId: string
  planName: string
  amount: number
  paymentMethod: string
  note?: string
}

export interface AdminBillingLogsViewProps {
  txLogs: BillingTransactionLog[]
  onClearLogs: () => void
}

export function AdminBillingLogsView({ txLogs, onClearLogs }: AdminBillingLogsViewProps) {
  return (
    <div className="ui-card overflow-hidden shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4 bg-brand-50/30">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700 font-bold">
            <History size={18} />
          </span>
          <div>
            <h3 className="font-display text-base sm:text-lg font-black text-text">
              Lịch sử Cấp & Bán Gói (Transaction Logs)
            </h3>
            <p className="text-xs text-muted">
              Lưu trữ nhật ký giao dịch thu tiền trực tiếp, tạo VietQR, duyệt đơn đối soát và cấp học bổng.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-black text-brand-700">
            {txLogs.length} giao dịch
          </span>
          {txLogs.length > 0 && (
            <button
              type="button"
              onClick={onClearLogs}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-bold text-danger hover:bg-rose-50 transition cursor-pointer shadow-sm"
            >
              <Trash2 size={13} />
              <span>Xóa lịch sử</span>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-brand-50/60 text-xs">
              <th className="px-4 py-3 font-extrabold">Thời gian</th>
              <th className="px-4 py-3 font-extrabold">Khách hàng</th>
              <th className="px-4 py-3 font-extrabold">Loại giao dịch</th>
              <th className="px-4 py-3 font-extrabold">Gói cước</th>
              <th className="px-4 py-3 font-extrabold">Số tiền</th>
              <th className="px-4 py-3 font-extrabold">Hình thức</th>
              <th className="px-4 py-3 font-extrabold">Ghi chú / Đối soát</th>
            </tr>
          </thead>
          <tbody>
            {txLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-muted">
                  <p className="font-bold text-sm text-text">Chưa có nhật ký giao dịch nào</p>
                  <p className="text-xs text-muted mt-1">
                    Các giao dịch lên gói tại POS hoặc duyệt đơn VietQR sẽ tự động ghi vào đây.
                  </p>
                </td>
              </tr>
            ) : (
              txLogs.map((log) => {
                const isScholarship = log.type === 'grant_scholarship'
                const isConfirmed = log.type === 'intent_confirmed'
                const isVietQr = log.type === 'vietqr_intent'

                return (
                  <tr
                    key={log.id}
                    className="border-b border-border/30 hover:bg-brand-50/30 transition text-xs"
                  >
                    <td className="px-4 py-3 text-muted whitespace-nowrap font-medium">
                      {new Date(log.timestamp).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-text">{log.userName || 'Khách hàng'}</p>
                      <p className="text-muted font-mono text-[11px]">{log.userEmail}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 font-extrabold text-[11px]',
                          isScholarship
                            ? 'bg-violet-100 text-violet-800'
                            : isConfirmed
                              ? 'bg-emerald-100 text-emerald-800'
                              : isVietQr
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-sky-100 text-sky-800',
                        )}
                      >
                        {log.typeLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-text">{log.planName}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-display font-black text-sm">
                      {log.amount === 0 ? (
                        <span className="text-violet-700">0₫ (Học bổng)</span>
                      ) : (
                        <span className="text-brand-700">
                          {log.amount.toLocaleString('vi-VN')}₫
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                        {log.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted max-w-xs truncate" title={log.note}>
                      {log.note || '—'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
