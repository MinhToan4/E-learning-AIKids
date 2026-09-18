import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Copy,
  Check,
  Clock,
  Building2,
  User,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import type { PendingIntent } from '../types'

export type PendingIntentDetailModalProps = {
  intent: PendingIntent | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (intent: PendingIntent) => Promise<void> | void
  confirming?: boolean
}

const PURPOSE_LABELS: Record<string, string> = {
  user_sub: 'Gói cá nhân',
  credit_pack: 'Gói lượt AI',
  course_purchase: 'Mua khóa học',
}

export function PendingIntentDetailModal({
  intent,
  isOpen,
  onClose,
  onConfirm,
  confirming = false,
}: PendingIntentDetailModalProps) {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedAccount, setCopiedAccount] = useState(false)

  // Khóa cuộn màn hình khi mở modal
  useEffect(() => {
    if (isOpen && intent) {
      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prevOverflow
      }
    }
  }, [isOpen, intent])

  // Đóng modal khi nhấn Escape
  useEffect(() => {
    if (!isOpen || !intent) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !confirming) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, intent, confirming, onClose])

  if (!isOpen || !intent) return null

  const orderCode = intent.paymentCode ?? intent.id.slice(0, 8).toUpperCase()
  const bankName = 'MBBank (Ngân hàng TMCP Quân Đội)'
  const bankAccount = '0382228888'
  const accountHolder = 'CONG TY CONG NGHE GIAO DUC AI KIDS'
  const purposeText = PURPOSE_LABELS[intent.purpose] ?? intent.purpose
  const createdDate = intent.createdAt
    ? new Date(intent.createdAt).toLocaleString('vi-VN')
    : '—'

  async function copyText(text: string, type: 'code' | 'account') {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'code') {
        setCopiedCode(true)
        setTimeout(() => setCopiedCode(false), 2000)
      } else {
        setCopiedAccount(true)
        setTimeout(() => setCopiedAccount(false), 2000)
      }
    } catch {
      /* ignore clipboard error */
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(20, 26, 48, 0.65)', backdropFilter: 'blur(6px)' }}
      onClick={() => {
        if (!confirming) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pending-intent-detail-title"
        className="ui-card w-full max-w-xl overflow-y-auto p-6 rounded-3xl border-2 border-brand-100 shadow-clay bg-white"
        style={{ maxHeight: 'calc(100dvh - 2rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 1. HEADER ── */}
        <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 font-black shadow-sm">
              <CreditCard size={22} />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="pending-intent-detail-title"
                  className="font-display text-lg sm:text-xl font-black text-text"
                >
                  Đơn hàng #{orderCode}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-300">
                  <Clock size={12} />
                  <span>Chờ thanh toán</span>
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Cổng thanh toán: <span className="font-bold uppercase">{intent.provider}</span> · ID: <span className="font-mono">{intent.publicId || intent.id.slice(0, 12)}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={confirming}
            className="rounded-xl p-1.5 text-muted hover:bg-slate-100 hover:text-text transition cursor-pointer"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── 2. SỐ TIỀN THỰC THU NỔI BẬT ── */}
        <div className="mt-4 rounded-2xl bg-amber-50/80 p-4 border border-amber-200 shadow-sm flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
              Số tiền thực thu
            </p>
            <p className="font-display text-2xl sm:text-3xl font-black text-amber-700 mt-0.5">
              {Number(intent.amountMinor).toLocaleString('vi-VN')}₫
            </p>
          </div>
          <div className="text-right">
            <span className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-amber-900 shadow-sm border border-amber-200 inline-block">
              {purposeText}
            </span>
          </div>
        </div>

        {/* ── 3. THÔNG TIN KHÁCH HÀNG & ĐƠN HÀNG ── */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {/* Cột khách hàng */}
          <div className="rounded-2xl bg-brand-50/60 p-3.5 border border-brand-100/80">
            <div className="flex items-center gap-1.5 mb-2 text-brand-700">
              <User size={15} />
              <p className="text-xs font-extrabold uppercase tracking-wide">Thông tin khách hàng</p>
            </div>
            <div className="space-y-1.5 text-xs">
              <div>
                <span className="text-muted">Họ tên: </span>
                <span className="font-bold text-text">{intent.userName ?? 'Khách hàng'}</span>
              </div>
              <div>
                <span className="text-muted">Email: </span>
                <span className="font-semibold text-text font-mono">{intent.userEmail ?? '—'}</span>
              </div>
              <div>
                <span className="text-muted">User ID: </span>
                <span className="font-mono text-muted text-[11px] truncate block">
                  {intent.userId ?? '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Cột đơn hàng */}
          <div className="rounded-2xl bg-brand-50/60 p-3.5 border border-brand-100/80">
            <div className="flex items-center gap-1.5 mb-2 text-brand-700">
              <CreditCard size={15} />
              <p className="text-xs font-extrabold uppercase tracking-wide">Chi tiết giao dịch</p>
            </div>
            <div className="space-y-1.5 text-xs">
              <div>
                <span className="text-muted">Mục đích: </span>
                <span className="font-bold text-text">{purposeText}</span>
              </div>
              {intent.courseTitle && (
                <div>
                  <span className="text-muted">Khóa học: </span>
                  <span className="font-bold text-text">{intent.courseTitle}</span>
                </div>
              )}
              <div>
                <span className="text-muted">Thời gian tạo: </span>
                <span className="text-text font-medium">{createdDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. THÔNG TIN ĐỐI SOÁT NGÂN HÀNG ── */}
        <div className="mt-4 rounded-2xl bg-white border-2 border-brand-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-brand-700">
            <Building2 size={16} />
            <p className="text-xs font-black uppercase tracking-wide">
              Thông tin chuyển khoản đối soát MBBank
            </p>
          </div>

          <div className="grid gap-2 text-xs">
            <div className="flex items-center justify-between gap-2 py-1 border-b border-border/40">
              <span className="text-muted font-medium">Ngân hàng:</span>
              <span className="font-bold text-text text-right">{bankName}</span>
            </div>

            <div className="flex items-center justify-between gap-2 py-1 border-b border-border/40">
              <span className="text-muted font-medium">Chủ tài khoản:</span>
              <span className="font-extrabold text-text uppercase text-right">{accountHolder}</span>
            </div>

            <div className="flex items-center justify-between gap-2 py-1 border-b border-border/40">
              <span className="text-muted font-medium">Số tài khoản:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black text-brand-700">{bankAccount}</span>
                <button
                  type="button"
                  onClick={() => void copyText(bankAccount, 'account')}
                  className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700 hover:bg-brand-100 transition cursor-pointer"
                  title="Sao chép số tài khoản"
                >
                  {copiedAccount ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  <span>{copiedAccount ? 'Đã chép' : 'Chép'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 py-1">
              <span className="text-muted font-medium">Nội dung CK:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300">
                  {orderCode}
                </span>
                <button
                  type="button"
                  onClick={() => void copyText(orderCode, 'code')}
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900 hover:bg-amber-200 transition cursor-pointer"
                  title="Sao chép mã chuyển khoản"
                >
                  {copiedCode ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  <span>{copiedCode ? 'Đã chép' : 'Chép mã'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. HỘP NHẮC NHỞ ĐỐI SOÁT ── */}
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-amber-50 p-3.5 border border-amber-200 text-xs text-amber-900">
          <AlertTriangle size={17} className="shrink-0 text-amber-600 mt-0.5" />
          <p className="font-medium leading-relaxed">
            <span className="font-black">Lưu ý đối soát:</span> Vui lòng kiểm tra biến động số dư tài khoản ngân hàng trước khi xác nhận duyệt đơn.
          </p>
        </div>

        {/* ── 6. NÚT HÀNH ĐỘNG ── */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-border/60">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={confirming}
            className="w-full sm:w-auto rounded-xl font-bold"
          >
            Đóng
          </Button>
          <Button
            className="w-full sm:w-auto !bg-emerald-600 hover:!bg-emerald-700 !text-white rounded-xl font-black shadow-clay flex items-center justify-center gap-2 py-2.5 px-5"
            disabled={confirming}
            onClick={async () => {
              await onConfirm(intent)
            }}
          >
            <CheckCircle2 size={16} />
            <span>{confirming ? 'Đang xử lý...' : '✅ Xác nhận Đã Nhận Tiền & Kích Hoạt Gói'}</span>
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
