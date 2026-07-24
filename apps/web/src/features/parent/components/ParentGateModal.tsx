import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '@/shared/store/auth'
import { api, ApiError, type User } from '@/shared/lib/api'
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton'

/**
 * ParentGateModal — child taps "Ba/Mẹ ơi!" to hand device back to parent.
 *
 * Two auth paths:
 *  1. Password  → POST /api/parent/gate/verify (verifies parent's passwordHash)
 *  2. Google    → GoogleSignInButton renders inline, onSuccess swaps session
 *
 * child.pinHash is ONLY for child login — never used here.
 * Session swap happens BEFORE navigation, so Guard sees correct role.
 */
export function ParentGateModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const setUser = useAuth((s) => s.setUser)

  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setPassword('')
      setError(null)
      setLoading(false)
      setShowPw(false)
      setTimeout(() => inputRef.current?.focus(), 120)
    }
  }, [open])

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  /** Called after successful auth (password OR Google) — force reload for clean session bootstrap */
  const onAuthSuccess = useCallback(
    (user: User) => {
      setUser(user)
      onClose()
      // Full page reload so the new session cookie is bootstrapped cleanly.
      // React Router SPA navigation after a session swap causes white screen
      // because auth state and route guards race each other.
      window.location.replace('/parent')
    },
    [setUser, onClose],
  )

  const handleSubmit = useCallback(async () => {
    if (!password.trim()) {
      setError('Nhập mật khẩu của ba/mẹ nhé!')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await api<{ user: User; message: string }>(
        '/api/parent/gate/verify',
        {
          method: 'POST',
          body: JSON.stringify({ password }),
        },
      )
      onAuthSuccess(res.user)
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        setError(e.message ?? 'Mật khẩu chưa đúng, thử lại nhé!')
      } else {
        setError('Có lỗi xảy ra, thử lại nhé!')
      }
      triggerShake()
    } finally {
      setLoading(false)
    }
  }, [password, onAuthSuccess])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Cổng phụ huynh"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm overflow-y-auto rounded-3xl bg-white shadow-2xl"
        style={{
          maxHeight: 'min(95dvh, 680px)',
          ...(shake ? { animation: 'shake 0.4s ease-in-out' } : {}),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 px-6 pb-6 pt-8 text-center">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 text-5xl shadow-inner">
            🔒
          </div>
          <h2 className="text-2xl font-black text-white">Ba/Mẹ ơi!</h2>
          <p className="mt-1 text-sm text-white/85">
            Nhập mật khẩu hoặc đăng nhập Google của ba/mẹ
          </p>
        </div>

        {/* Body */}
        <div className="px-6 pb-8 pt-6">
          {/* Password input */}
          <div className="mb-4">
            <label
              htmlFor="parent-gate-pw"
              className="mb-2 block text-sm font-bold text-gray-700"
            >
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id="parent-gate-pw"
                ref={inputRef}
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(null)
                }}
                onKeyDown={(e) => e.key === 'Enter' && void handleSubmit()}
                placeholder="Nhập mật khẩu đăng nhập của ba/mẹ"
                autoComplete="current-password"
                disabled={loading}
                className={`w-full rounded-2xl border-2 px-4 py-3.5 pr-12 text-sm font-medium outline-none transition-all
                  ${error
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 bg-gray-50 focus:border-amber-400 focus:bg-white'
                  }`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-400 hover:text-gray-600"
                aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm font-semibold text-red-500">{error}</p>
            )}
          </div>

          {/* Confirm / Cancel */}
          <div className="mb-5 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-2xl border-2 border-gray-200 py-3 text-sm font-bold text-gray-500 transition hover:bg-gray-50 disabled:opacity-40"
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={loading || !password.trim()}
              className="flex-1 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 transition-all hover:opacity-90 disabled:opacity-40"
            >
              {loading ? '…' : 'Xác nhận'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">hoặc</span>
            </div>
          </div>

          {/*
           * GoogleSignInButton renders inline — when parent signs in with Google,
           * onSuccess fires directly here and swaps session without any navigation away.
           * role='parent' ensures the account is treated as parent role.
           */}
          <GoogleSignInButton
            role="parent"
            onSuccess={(user) => onAuthSuccess(user)}
            onError={(msg) => setError(msg)}
          />
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
      `}</style>
    </div>
  )
}
