import React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import type { Child } from '@/features/parent/types/parent.types'
import { avatarEmoji } from '@/features/parent/components/EditChildModal'

export function StudentQrCardModal({
  child,
  isOpen,
  onClose,
}: {
  child: Child | null
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen || !child) return null

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    JSON.stringify({ type: 'aikids_student_login', studentId: child.id, nickname: child.nickname }),
  )}`

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: 'rgba(20, 26, 48, 0.65)' }}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-clay border-2 border-cream-300 overflow-hidden animate-in zoom-in-95 duration-200 text-text">
        <div className="bg-gradient-to-b from-brand-100/70 via-brand-50/40 to-white p-6 pb-4 text-center relative border-b border-cream-200">
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-muted hover:bg-white hover:text-text transition shadow-xs"
          >
            <X size={16} />
          </button>
          <div className="mx-auto w-20 h-20 bg-white rounded-2xl shadow-soft border-2 border-brand-200 flex items-center justify-center text-5xl mb-3 relative">
            {avatarEmoji(child.avatarId)}
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-xs">
              Lv.{child.level || 1}
            </div>
          </div>
          <h2 className="font-display text-2xl font-black text-text">{child.nickname}</h2>
          <p className="text-xs font-bold text-brand-600 mt-1 uppercase tracking-wider">Thẻ Học Sinh Thông Minh</p>
        </div>

        <div className="p-6 text-center bg-cream-50/50">
          <p className="text-sm font-black text-text mb-3">Quét mã QR để vào học ngay</p>
          <div className="mx-auto w-48 h-48 bg-white rounded-2xl shadow-clay border-2 border-brand-100 flex items-center justify-center mb-4 p-2 relative overflow-hidden">
            <img
              src={qrCodeUrl}
              alt={`QR Đăng nhập cho bé ${child.nickname}`}
              className="w-full h-full object-contain rounded-xl"
              loading="eager"
            />
          </div>
          <p className="text-xs text-muted mb-4 px-2 leading-relaxed font-bold">
            Mở camera trên máy tính bảng hoặc điện thoại của con và quét mã này để đăng nhập nhanh không cần mật khẩu.
          </p>
          <Button variant="secondary" className="w-full font-black text-sm shadow-soft" onClick={onClose}>
            Đóng lại
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
