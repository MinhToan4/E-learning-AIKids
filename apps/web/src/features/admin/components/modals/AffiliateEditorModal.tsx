import React from 'react'
import { createPortal } from 'react-dom'
import { Users, X, AlertTriangle } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'

export interface AffiliateModalData {
  id?: string
  name: string
  phone: string
  email: string
  ref_code: string
  commission_rate: number
  bank_name: string
  bank_account: string
  bank_account_name: string
  status: 'active' | 'inactive'
}

export interface AffiliateEditorModalProps {
  isOpen: boolean
  modalMode: 'create' | 'edit'
  formData: AffiliateModalData
  setFormData: React.Dispatch<React.SetStateAction<AffiliateModalData>>
  formError: string | null
  formSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export function AffiliateEditorModal({
  isOpen,
  modalMode,
  formData,
  setFormData,
  formError,
  formSubmitting,
  onSubmit,
  onClose,
}: AffiliateEditorModalProps) {
  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in">
      <div
        className="ui-card w-full max-w-lg overflow-hidden rounded-3xl border-2 border-brand-100 bg-surface shadow-clay animate-in zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-page/60">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
              <Users className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-display font-black text-base text-text">
                {modalMode === 'create' ? 'Thêm Cộng Tác Viên Mới' : 'Cập Nhật Thông Tin CTV'}
              </h3>
              <p className="text-[11px] text-muted">
                {modalMode === 'create'
                  ? 'Cấp mã giới thiệu và thiết lập hoa hồng cho đối tác'
                  : 'Điều chỉnh mã ref, tỉ lệ hoa hồng và tài khoản nhận tiền'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted hover:bg-surface hover:text-text transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {formError && (
            <div className="flex items-center gap-2 rounded-2xl bg-coral-50 p-3 text-xs font-bold text-coral-700 border border-coral-200">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Họ tên */}
          <div className="space-y-1">
            <label className="text-xs font-black text-text">
              Họ và tên CTV <span className="text-coral-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Nguyễn Văn An"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-2xl border-2 border-border/80 bg-surface px-4 py-2 text-xs font-medium text-text focus:border-emerald-500 focus:outline-none transition"
            />
          </div>

          {/* SĐT & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-black text-text">Số điện thoại</label>
              <input
                type="tel"
                placeholder="0912345678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-2xl border-2 border-border/80 bg-surface px-4 py-2 text-xs font-medium text-text focus:border-emerald-500 focus:outline-none transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-text">Email</label>
              <input
                type="email"
                placeholder="ctv@aikid.vn"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-2xl border-2 border-border/80 bg-surface px-4 py-2 text-xs font-medium text-text focus:border-emerald-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Mã Ref & Tỉ lệ hoa hồng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-black text-text">
                Mã Ref (Viết hoa) <span className="text-coral-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: MEELAN, VIP99"
                value={formData.ref_code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ref_code: e.target.value.toUpperCase().replace(/\s+/g, ''),
                  })
                }
                className="w-full rounded-2xl border-2 border-border/80 bg-surface px-4 py-2 text-xs font-mono font-bold text-emerald-800 uppercase focus:border-emerald-500 focus:outline-none transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-text">% Hoa hồng</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.commission_rate}
                  onChange={(e) =>
                    setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full rounded-2xl border-2 border-border/80 bg-surface pl-4 pr-8 py-2 text-xs font-bold text-text focus:border-emerald-500 focus:outline-none transition"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Ngân hàng */}
          <div className="space-y-3 pt-2 border-t border-border/60">
            <p className="text-xs font-black text-muted uppercase tracking-wider">
              Thông Tin Tài Khoản Nhận Hoa Hồng
            </p>

            <div className="space-y-1">
              <label className="text-xs font-black text-text">Tên ngân hàng</label>
              <input
                type="text"
                placeholder="MBBank, Techcombank, Vietcombank…"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                className="w-full rounded-2xl border-2 border-border/80 bg-surface px-4 py-2 text-xs font-medium text-text focus:border-emerald-500 focus:outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-black text-text">Số tài khoản</label>
                <input
                  type="text"
                  placeholder="Số TK ngân hàng"
                  value={formData.bank_account}
                  onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                  className="w-full rounded-2xl border-2 border-border/80 bg-surface px-4 py-2 text-xs font-mono font-medium text-text focus:border-emerald-500 focus:outline-none transition"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-text">Tên chủ tài khoản</label>
                <input
                  type="text"
                  placeholder="NGUYEN VAN AN"
                  value={formData.bank_account_name}
                  onChange={(e) =>
                    setFormData({ ...formData, bank_account_name: e.target.value.toUpperCase() })
                  }
                  className="w-full rounded-2xl border-2 border-border/80 bg-surface px-4 py-2 text-xs font-bold text-text uppercase focus:border-emerald-500 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Trạng thái nếu edit */}
          {modalMode === 'edit' && (
            <div className="space-y-1 pt-2 border-t border-border/60">
              <label className="text-xs font-black text-text">Trạng thái kích hoạt</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-text cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={formData.status === 'active'}
                    onChange={() => setFormData({ ...formData, status: 'active' })}
                    className="accent-emerald-600"
                  />
                  Hoạt động
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-text cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={formData.status === 'inactive'}
                    onChange={() => setFormData({ ...formData, status: 'inactive' })}
                    className="accent-coral-600"
                  />
                  Tạm khóa
                </label>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/80">
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
              disabled={formSubmitting}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-clay"
              disabled={formSubmitting}
            >
              {formSubmitting
                ? 'Đang lưu…'
                : modalMode === 'create'
                  ? 'Tạo CTV Mới'
                  : 'Lưu Cập Nhật'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
