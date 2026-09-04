import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Copy, QrCode, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'

export type VietQrModalData = {
  publicId: string
  paymentCode: string
  amount: number
  planId: string
  planName: string
  userName: string
  userEmail: string
  durationMonths: number
}

export type VietQrModalProps = {
  intent: VietQrModalData | null
  onClose: () => void
  onConfirmPaid: (publicId: string) => Promise<void>
}

export function VietQrModal({ intent, onClose, onConfirmPaid }: VietQrModalProps) {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedAccount, setCopiedAccount] = useState(false)
  const [confirming, setConfirming] = useState(false)

  // Khóa cuộn màn hình khi mở modal
  useEffect(() => {
    if (intent) {
      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prevOverflow
      }
    }
  }, [intent])

  // Đóng khi nhấn Escape
  useEffect(() => {
    if (!intent) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [intent, onClose])

  if (!intent) return null

  const bankName = 'MBBank (Ngân hàng TMCP Quân Đội)'
  const bankAccount = '0382228888'
  const accountHolder = 'CONG TY CONG NGHE GIAO DUC AI KIDS'
  const qrUrl = `https://img.vietqr.io/image/MB-0382228888-compact2.png?amount=${intent.amount}&addInfo=${encodeURIComponent(intent.paymentCode)}&accountName=${encodeURIComponent('CONG TY AI KIDS')}`

  async function copyToClipboard(text: string, type: 'code' | 'account') {
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
      // ignore clipboard errors
    }
  }

  async function handleConfirm() {
    if (!intent) return
    setConfirming(true)
    try {
      await onConfirmPaid(intent.publicId)
    } finally {
      setConfirming(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(20,26,48,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vietqr-modal-title"
        className="ui-card w-full max-w-lg overflow-y-auto p-6 rounded-3xl shadow-clay bg-white"
        style={{ maxHeight: 'calc(100dvh - 2rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 font-black shadow-clay">
              <QrCode size={22} />
            </span>
            <div>
              <h2 id="vietqr-modal-title" className="font-display text-xl font-bold text-text">
                Mã Thanh Toán VietQR
              </h2>
              <p className="text-xs text-muted font-medium">Đơn chờ thu tiền gói {intent.planName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted hover:bg-slate-100 hover:text-text transition"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Thông tin phụ huynh & số tiền */}
        <div className="mt-4 rounded-2xl bg-brand-50/70 p-4 border border-brand-100/80 shadow-clay">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">Phụ huynh</p>
              <p className="font-bold text-text">{intent.userName}</p>
              <p className="text-xs text-muted font-mono">{intent.userEmail}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-extrabold uppercase tracking-wide text-muted">Số tiền cần thu</p>
              <p className="font-display text-2xl font-black text-brand-600">
                {intent.amount.toLocaleString('vi-VN')}₫
              </p>
              <p className="text-xs text-muted font-medium">
                Gói {intent.planName} · {intent.durationMonths} tháng
              </p>
            </div>
          </div>
        </div>

        {/* Ảnh mã VietQR */}
        <div className="mt-4 flex flex-col items-center">
          <div className="rounded-3xl border-2 border-brand-200 bg-white p-3 shadow-clay">
            <img
              src={qrUrl}
              alt={`VietQR ${intent.paymentCode}`}
              className="h-56 w-56 sm:h-60 sm:w-60 rounded-2xl object-contain"
              loading="eager"
            />
          </div>
          <p className="mt-2 text-xs text-muted font-medium text-center">
            Quét mã bằng ứng dụng ngân hàng bất kỳ để chuyển khoản tự động
          </p>
        </div>

        {/* Chi tiết chuyển khoản */}
        <div className="mt-4 space-y-2 rounded-2xl border border-border/80 bg-brand-50/40 p-3.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted font-medium">Ngân hàng:</span>
            <span className="font-bold text-text">{bankName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted font-medium">Số tài khoản:</span>
            <div className="flex items-center gap-1.5">
              <code className="font-mono font-bold text-text text-sm">{bankAccount}</code>
              <button
                type="button"
                onClick={() => copyToClipboard(bankAccount, 'account')}
                className="rounded-lg p-1 text-muted hover:bg-white hover:text-brand-600 transition"
                title="Sao chép số tài khoản"
              >
                {copiedAccount ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted font-medium">Chủ tài khoản:</span>
            <span className="font-bold text-text">{accountHolder}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <span className="text-muted font-medium">Nội dung chuyển khoản:</span>
            <div className="flex items-center gap-1.5">
              <span className="rounded-lg bg-brand-100 px-2.5 py-1 font-mono text-sm font-black text-brand-700">
                {intent.paymentCode}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(intent.paymentCode, 'code')}
                className="rounded-lg p-1 text-muted hover:bg-white hover:text-brand-600 transition"
                title="Sao chép mã chuyển khoản"
              >
                {copiedCode ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Nút thao tác */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={confirming}
            className="flex-1 !bg-success hover:!bg-success/90 !text-white rounded-2xl shadow-clay"
          >
            {confirming ? 'Đang xác nhận...' : '⚡ Đã nhận tiền (Xác nhận ngay)'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="sm:w-24 rounded-2xl"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
