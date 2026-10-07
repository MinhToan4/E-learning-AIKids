import React from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/shared/components/ui/Button'

export interface CreateUserModalProps {
  open: boolean
  form: {
    role: 'parent' | 'student'
    email: string
    password: string
    nickname: string
  }
  onChange: React.Dispatch<
    React.SetStateAction<{
      role: 'parent' | 'student'
      email: string
      password: string
      nickname: string
    }>
  >
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export function CreateUserModal({
  open,
  form,
  onChange,
  onSubmit,
  onClose,
}: CreateUserModalProps) {
  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(20,26,48,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-family-user-title"
        className="ui-card w-full max-w-md overflow-y-auto p-6"
        style={{ maxHeight: 'calc(100dvh - 2rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-brand-600">Thêm người dùng mới</p>
            <h2 id="create-family-user-title" className="font-display text-xl font-bold text-text">Tạo tài khoản Gia đình</h2>
          </div>
          <button
            type="button"
            className="min-h-10 shrink-0 rounded-lg px-2.5 text-sm font-bold text-muted hover:bg-brand-50 cursor-pointer"
            onClick={onClose}
            aria-label="Đóng hộp thoại tạo tài khoản"
          >
            ✕
          </button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Vai trò người dùng
            <select
              className="min-h-11 rounded-xl border-2 border-border px-3 bg-white outline-none focus:border-brand-400"
              value={form.role}
              onChange={(e) =>
                onChange((f) => ({ ...f, role: e.target.value as typeof form.role }))
              }
            >
              <option value="parent">👨‍👩‍👧 Phụ huynh (quản lý con & thanh toán)</option>
              <option value="student">👶 Học sinh (trải nghiệm học tập & tích XP)</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-bold">
            {form.role === 'parent' ? 'Email phụ huynh' : 'Email hoặc Mã học sinh'}
            <input
              type={form.role === 'parent' ? 'email' : 'text'}
              required
              placeholder={form.role === 'parent' ? 'phuhuynh@example.com' : 'hocsinh01 hoặc email'}
              className="min-h-11 rounded-xl border-2 border-border px-3 bg-white outline-none focus:border-brand-400 text-sm"
              value={form.email}
              onChange={(e) => onChange((f) => ({ ...f, email: e.target.value }))}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-bold">
            {form.role === 'parent' ? 'Mật khẩu (tối thiểu 8 ký tự)' : 'Mật khẩu nội bộ (tối thiểu 6 ký tự)'}
            <input
              type="password"
              required
              minLength={form.role === 'parent' ? 8 : 6}
              placeholder="••••••••"
              className="min-h-11 rounded-xl border-2 border-border px-3 bg-white outline-none focus:border-brand-400 text-sm"
              value={form.password}
              onChange={(e) => onChange((f) => ({ ...f, password: e.target.value }))}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Tên hiển thị / Biệt danh
            <input
              placeholder={form.role === 'parent' ? 'Mẹ Lan / Ba Hùng' : 'Bé Bon / Minh Trí'}
              className="min-h-11 rounded-xl border-2 border-border px-3 bg-white outline-none focus:border-brand-400 text-sm"
              value={form.nickname}
              onChange={(e) => onChange((f) => ({ ...f, nickname: e.target.value }))}
            />
          </label>

          <div className="mt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 border-t border-border/70 pt-4 w-full">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="w-full sm:w-auto h-11 px-5 whitespace-nowrap inline-flex items-center justify-center"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto h-11 px-5 shadow-sm whitespace-nowrap inline-flex items-center justify-center"
            >
              Xác nhận tạo tài khoản
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
