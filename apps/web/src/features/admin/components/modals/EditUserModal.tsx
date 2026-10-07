import React, { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import type { AdminUser } from '../../types'

export type EditUserModalProps = {
  target: AdminUser | null
  isSelf?: boolean
  form: { nickname: string; role: AdminUser['role']; email: string; newPassword: string }
  onChange: React.Dispatch<
    React.SetStateAction<{ nickname: string; role: AdminUser['role']; email: string; newPassword: string }>
  >
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
  onSyncClaims: (userId: string) => Promise<void>
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: 'Quản trị viên: Toàn quyền quản trị hệ thống LMS, người dùng, tài chính và AI.',
  teacher: 'Giáo viên: Quản lý lớp học, chấm điểm, theo dõi học sinh và soạn bài giảng trạm học.',
  curriculum_lead: 'Trưởng ban chuyên môn: Toàn quyền thiết kế giáo trình, xuất bản khóa học và giám sát chất lượng.',
  parent: 'Phụ huynh: Theo dõi tiến độ học của con và thanh toán gói cước.',
  student: 'Học sinh: Trải nghiệm học tập, làm nhiệm vụ và khám phá các trạm bài giảng.',
}

export function EditUserModal({
  target,
  isSelf = false,
  form,
  onChange,
  onSubmit,
  onClose,
  onSyncClaims,
}: EditUserModalProps) {
  const firstInputRef = useRef<HTMLInputElement>(null)
  const [syncingClaims, setSyncingClaims] = useState(false)

  useEffect(() => {
    if (target) {
      setTimeout(() => firstInputRef.current?.focus(), 50)
    }
  }, [target])

  useEffect(() => {
    if (!target) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [target, onClose])

  if (!target) return null

  async function handleSyncClaims() {
    if (!target) return
    setSyncingClaims(true)
    try {
      await onSyncClaims(target.id)
    } finally {
      setSyncingClaims(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(20,26,48,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-user-title"
        className="ui-card w-full max-w-md overflow-y-auto p-6"
        style={{ maxHeight: 'calc(100dvh - 2rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
              Sửa tài khoản
            </p>
            <h2 id="edit-user-title" className="font-display text-xl text-text">
              {target.nickname ?? target.email ?? target.id.slice(0, 10)}
            </h2>
            <p className="mt-0.5 text-xs text-muted font-mono">{target.id.slice(0, 16)}…</p>
          </div>
          <button
            type="button"
            className="min-h-11 shrink-0 rounded-lg px-3 text-sm font-bold text-muted hover:bg-brand-50 cursor-pointer"
            onClick={onClose}
            aria-label="Đóng hộp thoại chỉnh sửa"
          >
            ✕
          </button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Tên hiển thị
            <input
              ref={firstInputRef}
              className="min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none transition focus:border-brand-400"
              value={form.nickname}
              onChange={(e) => onChange((f) => ({ ...f, nickname: e.target.value }))}
              placeholder={target.nickname ?? '—'}
            />
          </label>

          <div className="flex flex-col gap-1.5 text-sm font-bold">
            <label htmlFor="user-role-select" className="text-text">
              Vai trò
            </label>
            <select
              id="user-role-select"
              disabled={isSelf}
              className={cn(
                'min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none transition focus:border-brand-400',
                isSelf && 'cursor-not-allowed bg-slate-100 opacity-80',
              )}
              value={form.role}
              onChange={(e) => onChange((f) => ({ ...f, role: e.target.value as AdminUser['role'] }))}
            >
              <option value="student">Học sinh</option>
              <option value="parent">Phụ huynh</option>
            </select>
            {isSelf && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 p-2 text-xs font-bold text-amber-800">
                🛡️ Bạn không thể tự đổi vai trò của chính mình để tránh mất quyền Quản trị hệ thống.
              </p>
            )}
            <div className="rounded-xl bg-brand-50/60 p-2.5 text-xs font-medium text-brand-800 border border-brand-100/80">
              <span className="font-bold">Đặc quyền: </span>
              {ROLE_DESCRIPTIONS[form.role] ?? 'Chưa xác định đặc quyền cụ thể cho vai trò này.'}
            </div>
          </div>

          {target.role !== 'student' && (
            <label className="flex flex-col gap-1.5 text-sm font-bold">
              Email
              <input
                type="email"
                autoComplete="email"
                className="min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none transition focus:border-brand-400"
                value={form.email}
                onChange={(e) => onChange((f) => ({ ...f, email: e.target.value }))}
                placeholder={target.email ?? 'email@example.com'}
              />
              <span className="text-xs font-normal text-muted">
                Để trống nếu không muốn thay đổi
              </span>
            </label>
          )}

          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Mật khẩu mới
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              className="min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none transition focus:border-brand-400"
              value={form.newPassword}
              onChange={(e) => onChange((f) => ({ ...f, newPassword: e.target.value }))}
              placeholder="Để trống nếu không đổi mật khẩu"
            />
            <span className="text-xs font-normal text-muted">
              Tối thiểu 8 ký tự. Để trống để giữ nguyên mật khẩu.
            </span>
          </label>

          <div className="rounded-2xl border-2 border-border/80 bg-brand-50/40 p-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-brand-600 mb-3">
              Thông tin Xác thực & Firebase
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="text-muted font-bold">Firebase Auth:</span>
                <div className="text-right">
                  {target.isFirebaseLinked || target.firebaseUid ? (
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-mint-100 px-2 py-0.5 font-extrabold text-success">
                        ✓ Đã liên kết
                      </span>
                      {target.firebaseUid && (
                        <p className="mt-1 font-mono text-[11px] text-muted break-all select-all">
                          UID: {target.firebaseUid}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-bold text-muted">
                      Chưa liên kết
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-muted font-bold">Google Sign-in:</span>
                {target.isGoogleLinked || target.googleSub ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 font-extrabold text-sky-700">
                    🔵 Đã liên kết
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-bold text-muted">
                    Chưa liên kết
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-muted font-bold">Tên đăng nhập alias:</span>
                {target.loginUsername ? (
                  <code className="rounded bg-brand-100/70 px-2 py-0.5 font-mono font-bold text-brand-800">
                    {target.loginUsername}
                  </code>
                ) : (
                  <span className="text-muted italic">—</span>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="secondary"
                disabled={syncingClaims}
                onClick={() => void handleSyncClaims()}
                className="w-full text-xs font-bold"
              >
                {syncingClaims
                  ? 'Đang đồng bộ Custom Claims...'
                  : '⚡ Đồng bộ Custom Claims lên Firebase'}
              </Button>
            </div>
          </div>

          <div className="mt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 border-t border-border/60 pt-4 w-full">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="w-full sm:w-auto h-11 px-5 whitespace-nowrap inline-flex items-center justify-center"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto h-11 px-5 whitespace-nowrap inline-flex items-center justify-center"
            >
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
