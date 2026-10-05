import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Check,
  Delete,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  X,
} from 'lucide-react'
import { useAuth } from '@/shared/store/auth'
import { api, ApiError, setAccessToken, type User } from '@/shared/lib/api'
import { firebaseApp } from '@/shared/lib/firebase-client'
import { ParentHomeIcon } from '@/shared/components/icons/ParentHomeIcon'
import { cn } from '@/shared/lib/cn'

type GateMode = 'pin' | 'password' | 'recovery'

/**
 * ParentGateModal — child taps "Ba / Mẹ ơi!" to hand device back to parent.
 *
 * Parent PIN or password is verified by Core Account before the student session is
 * replaced. Child PIN is never accepted by this adult boundary.
 *
 * Session swap happens BEFORE navigation, so Guard sees correct role.
 */
export function ParentGateModal({
  open,
  onClose,
  redirectTo = '/parent',
}: {
  open: boolean
  onClose: () => void
  redirectTo?: string
}) {
  const user = useAuth((s) => s.user)
  const setUser = useAuth((s) => s.setUser)
  const logout = useAuth((s) => s.logout)
  const completeFirebaseSignIn = useAuth((s) => s.completeFirebaseSignIn)

  const [mode, setMode] = useState<GateMode>('pin')
  const [pin, setPin] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [shake, setShake] = useState(false)
  const hiddenPinInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setMode('pin')
      setPin('')
      setPassword('')
      setError(null)
      setLoading(false)
      setLoadingGoogle(false)
      setShowPw(false)
      setTimeout(() => hiddenPinInputRef.current?.focus(), 150)
    }
  }, [open])

  useEffect(() => {
    if (mode === 'pin') {
      setTimeout(() => hiddenPinInputRef.current?.focus(), 100)
    } else if (mode === 'password') {
      setTimeout(() => passwordInputRef.current?.focus(), 100)
    }
    setError(null)
  }, [mode])

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  /** Called after successful parent authentication — reload for clean session bootstrap. */
  const onAuthSuccess = useCallback(
    (user: User, token?: string) => {
      if (token) {
        setAccessToken(token)
      }
      setUser(user)
      onClose()
      // Full page reload so the new session cookie is bootstrapped cleanly.
      // React Router SPA navigation after a session swap causes white screen
      // because auth state and route guards race each other.
      window.location.replace(redirectTo)
    },
    [setUser, onClose, redirectTo],
  )

  const verifyPin = useCallback(
    async (pinToVerify: string) => {
      if (loading || loadingGoogle) return
      setLoading(true)
      setError(null)
      try {
        const res = await api<{ status: string; user: User; token?: string }>(
          '/api/parent/gate/verify',
          {
            method: 'POST',
            body: JSON.stringify({ pin: pinToVerify }),
          },
        )
        onAuthSuccess(res.user, res.token)
      } catch (e: unknown) {
        if (e instanceof ApiError) {
          if (e.code === 'INVALID_PARENT_PIN' || e.status === 401) {
            setError('Mã PIN chưa đúng, thử lại nhé!')
          } else if (e.code === 'NO_PARENT_PIN_SET' || e.status === 400) {
            setError(
              'Chưa cài đặt mã PIN Ba / Mẹ. Hãy dùng mật khẩu hoặc Google để vào thiết lập mã PIN nhé!',
            )
          } else {
            setError(e.message ?? 'Mã PIN chưa đúng, thử lại nhé!')
          }
        } else {
          setError('Có lỗi xảy ra, thử lại nhé!')
        }
        triggerShake()
        setPin('')
        setTimeout(() => hiddenPinInputRef.current?.focus(), 50)
      } finally {
        setLoading(false)
      }
    },
    [loading, loadingGoogle, onAuthSuccess],
  )

  const handlePinDigit = useCallback(
    (digit: string) => {
      if (loading || loadingGoogle) return
      setError(null)
      setPin((prev) => {
        if (prev.length < 4) {
          const next = prev + digit
          if (next.length === 4) {
            setTimeout(() => void verifyPin(next), 0)
          }
          return next
        }
        return prev
      })
    },
    [loading, loadingGoogle, verifyPin],
  )

  const handlePinDelete = useCallback(() => {
    if (loading || loadingGoogle) return
    setError(null)
    setPin((prev) => prev.slice(0, -1))
  }, [loading, loadingGoogle])

  const handlePasswordSubmit = useCallback(async () => {
    if (!password.trim()) {
      setError('Nhập mật khẩu của Ba / Mẹ nhé!')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await api<{ status: string; user: User; token?: string }>(
        '/api/parent/gate/verify',
        {
          method: 'POST',
          body: JSON.stringify({ password }),
        },
      )
      onAuthSuccess(res.user, res.token)
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

  const handleGoogleVerify = useCallback(async () => {
    setLoadingGoogle(true)
    setError(null)
    try {
      const app = await firebaseApp()
      if (!app) throw new Error('Firebase chưa được cấu hình.')
      const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
      const auth = getAuth(app)
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      const credential = await signInWithPopup(auth, provider)
      const idToken = await credential.user.getIdToken()

      let authedUser: User
      let token: string | undefined
      try {
        const res = await api<{ status: string; user: User; token?: string }>(
          '/api/parent/gate/verify-google',
          {
            method: 'POST',
            body: JSON.stringify({
              idToken,
              parentId: user?.parentId || undefined,
            }),
          },
        )
        authedUser = res.user
        token = res.token
      } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 401) {
          throw err
        }
        authedUser = await completeFirebaseSignIn(idToken, { role: 'parent' })
      }

      try {
        sessionStorage.setItem('aikids.suggest_pin_setup', '1')
      } catch {
        // ignore
      }
      onAuthSuccess(authedUser, token)
    } catch (e: unknown) {
      const code =
        e && typeof e === 'object' && 'code' in e
          ? String((e as { code?: unknown }).code ?? '')
          : ''
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return
      }
      if (e instanceof ApiError) {
        setError(e.message ?? 'Không thể xác thực bằng Google. Ba / Mẹ thử lại nhé!')
      } else if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('Không thể mở khóa bằng Google. Ba / Mẹ thử lại nhé!')
      }
      triggerShake()
    } finally {
      setLoadingGoogle(false)
    }
  }, [completeFirebaseSignIn, onAuthSuccess])

  const handleEmergencyLogout = useCallback(async () => {
    if (
      window.confirm('Ba / Mẹ có chắc chắn muốn đăng xuất tài khoản khỏi thiết bị này không?')
    ) {
      await logout()
      onClose()
      window.location.replace('/login?mode=adult')
    }
  }, [logout, onClose])

  // Global keyboard shortcuts for modal
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (mode === 'pin') {
        if (e.key >= '0' && e.key <= '9') {
          handlePinDigit(e.key)
        } else if (e.key === 'Backspace') {
          handlePinDelete()
        } else if (e.key === 'Enter' && pin.length === 4) {
          void verifyPin(pin)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, mode, pin, onClose, handlePinDigit, handlePinDelete, verifyPin])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm safe-pt safe-pb"
      role="dialog"
      aria-modal="true"
      aria-label="Cổng phụ huynh"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border-2 border-amber-100 flex flex-col"
        style={{
          maxHeight: 'min(95dvh, 700px)',
          ...(shake ? { animation: 'shake 0.4s ease-in-out' } : {}),
        }}
        onClick={(e) => {
          e.stopPropagation()
          if (mode === 'pin') hiddenPinInputRef.current?.focus()
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 px-6 pb-5 pt-7 text-center shrink-0 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-all cursor-pointer"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>

          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 shadow-inner backdrop-blur-xs">
            <ParentHomeIcon size={42} />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">Ba / Mẹ ơi!</h2>
          <p className="mt-1 text-xs sm:text-sm font-semibold text-white/90">
            {mode === 'pin' && 'Nhập mã PIN Ba / Mẹ gồm 4 chữ số'}
            {mode === 'password' && 'Nhập mật khẩu đăng nhập của Ba / Mẹ'}
            {mode === 'recovery' && 'Khôi phục quyền truy cập Ba / Mẹ'}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex-1 min-h-0 flex flex-col justify-between overflow-y-auto">
          {mode === 'pin' && (
            <>
              {/* Hidden input for physical keyboard and mobile numeric virtual keyboard */}
              <input
                ref={hiddenPinInputRef}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                  setPin(val)
                  if (val.length === 4) {
                    void verifyPin(val)
                  }
                }}
                className="sr-only opacity-0 absolute pointer-events-none"
                aria-hidden="true"
                tabIndex={-1}
              />

              {/* 4 PIN display dots / boxes */}
              <div className="mb-3">
                <div
                  className="flex items-center justify-center gap-3.5 my-2"
                  onClick={() => hiddenPinInputRef.current?.focus()}
                >
                  {[0, 1, 2, 3].map((i) => {
                    const isFilled = i < pin.length
                    const isActive = i === pin.length
                    return (
                      <div
                        key={i}
                        className={cn(
                          'flex h-13 w-12 sm:h-15 sm:w-14 items-center justify-center rounded-2xl border-2 text-2xl sm:text-3xl font-black transition-all select-none',
                          isFilled
                            ? 'border-amber-500 bg-amber-50 text-slate-800 shadow-soft scale-105'
                            : isActive
                              ? 'border-amber-400 bg-white ring-2 ring-amber-300 ring-offset-2 animate-pulse'
                              : 'border-slate-200 bg-slate-50 text-slate-300',
                        )}
                      >
                        {isFilled ? '•' : ''}
                      </div>
                    )
                  })}
                </div>

                {/* Error message */}
                {error && (
                  <p className="mt-2 text-center text-xs sm:text-sm font-bold text-rose-500 leading-snug">
                    {error}
                  </p>
                )}
                {!error && (
                  <p className="mt-1.5 text-center text-xs text-muted">
                    {loading ? 'Đang kiểm tra mã PIN…' : 'Chạm các phím số bên dưới hoặc gõ bàn phím'}
                  </p>
                )}
              </div>

              {/* On-screen Soft-Clay Numpad */}
              <div className="grid grid-cols-3 gap-2 w-full max-w-[280px] mx-auto select-none">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={loading}
                    onClick={() => handlePinDigit(String(n))}
                    className="flex h-12 sm:h-13 items-center justify-center rounded-2xl border-2 border-slate-100 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 active:scale-95 text-xl sm:text-2xl font-black text-slate-800 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {n}
                  </button>
                ))}

                {/* Bottom row: Delete, 0, Enter */}
                <button
                  type="button"
                  disabled={loading || pin.length === 0}
                  onClick={handlePinDelete}
                  className="flex h-12 sm:h-13 items-center justify-center rounded-2xl border-2 border-slate-100 bg-slate-100 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 active:scale-95 text-slate-600 shadow-2xs transition-all cursor-pointer disabled:opacity-30"
                  aria-label="Xóa 1 số"
                >
                  <Delete size={20} />
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handlePinDigit('0')}
                  className="flex h-12 sm:h-13 items-center justify-center rounded-2xl border-2 border-slate-100 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 active:scale-95 text-xl sm:text-2xl font-black text-slate-800 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                >
                  0
                </button>

                <button
                  type="button"
                  disabled={loading || pin.length !== 4}
                  onClick={() => void verifyPin(pin)}
                  className="flex h-12 sm:h-13 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:opacity-90 active:scale-95 text-white font-bold shadow-soft transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                  aria-label="Xác nhận"
                >
                  <Check size={20} />
                </button>
              </div>

              {/* Alternate options */}
              <div className="mt-4 flex flex-col items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMode('password')}
                  disabled={loading}
                  className="text-xs sm:text-sm font-bold text-slate-600 hover:text-amber-600 transition-colors cursor-pointer"
                >
                  Hoặc dùng mật khẩu tài khoản
                </button>

                <button
                  type="button"
                  onClick={() => setMode('recovery')}
                  disabled={loading}
                  className="text-xs font-semibold text-amber-600 hover:underline cursor-pointer"
                >
                  Quên mã PIN?
                </button>
              </div>
            </>
          )}

          {mode === 'password' && (
            <div className="flex flex-col justify-between h-full">
              <div className="mb-4">
                <label
                  htmlFor="parent-gate-pw"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
                  Mật khẩu tài khoản Ba / Mẹ
                </label>
                <div className="relative">
                  <input
                    id="parent-gate-pw"
                    ref={passwordInputRef}
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError(null)
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && void handlePasswordSubmit()}
                    placeholder="Nhập mật khẩu đăng nhập của Ba / Mẹ"
                    autoComplete="current-password"
                    disabled={loading}
                    className={`w-full rounded-2xl border-2 px-4 py-3.5 pr-12 text-sm font-medium outline-none transition-all ${
                      error
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 bg-gray-50 focus:border-amber-400 focus:bg-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-1 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-xl text-gray-400 hover:bg-white hover:text-gray-600 cursor-pointer"
                    aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPw ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-xs sm:text-sm font-semibold text-red-500">{error}</p>
                )}
              </div>

              {/* Confirm / Cancel */}
              <div className="mb-4 flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setMode('pin')}
                  disabled={loading}
                  className="flex-1 rounded-2xl border-2 border-gray-200 py-3 min-h-[44px] text-sm font-bold text-gray-500 transition hover:bg-gray-50 disabled:opacity-40 whitespace-nowrap inline-flex items-center justify-center cursor-pointer"
                >
                  ← Dùng mã PIN
                </button>
                <button
                  type="button"
                  onClick={() => void handlePasswordSubmit()}
                  disabled={loading || !password.trim()}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 py-3 min-h-[44px] text-sm font-black text-white shadow-soft transition-all hover:opacity-90 disabled:opacity-40 whitespace-nowrap inline-flex items-center justify-center cursor-pointer"
                >
                  {loading ? '…' : 'Xác nhận'}
                </button>
              </div>

              <div className="text-center pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMode('recovery')}
                  className="text-xs font-semibold text-amber-600 hover:underline cursor-pointer"
                >
                  Quên mã PIN hoặc mật khẩu?
                </button>
              </div>
            </div>
          )}

          {mode === 'recovery' && (
            <div className="flex flex-col gap-3 py-2">
              <p className="text-xs sm:text-sm text-slate-600 mb-1 leading-relaxed">
                Ba / Mẹ có thể chọn một trong các cách sau để mở khóa nhanh:
              </p>

              {/* Option 1: Google verification */}
              <button
                type="button"
                onClick={() => void handleGoogleVerify()}
                disabled={loadingGoogle || loading}
                className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 active:scale-98 py-3.5 px-4 font-bold text-slate-700 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              >
                <GoogleIcon className="h-5 w-5 shrink-0" />
                <span>
                  {loadingGoogle ? 'Đang mở khóa qua Google…' : 'Mở khóa nhanh bằng Google'}
                </span>
              </button>

              {/* Option 2: Account Password */}
              <button
                type="button"
                onClick={() => setMode('password')}
                disabled={loadingGoogle || loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-98 py-3 px-4 font-bold text-slate-700 shadow-2xs transition-all cursor-pointer"
              >
                <KeyRound size={18} className="text-slate-500" />
                <span>Nhập mật khẩu tài khoản Ba / Mẹ</span>
              </button>

              {error && (
                <p className="mt-1 text-center text-xs sm:text-sm font-semibold text-red-500">
                  {error}
                </p>
              )}

              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => setMode('pin')}
                  className="text-xs sm:text-sm font-bold text-amber-600 hover:underline cursor-pointer"
                >
                  ← Quay lại nhập mã PIN Ba / Mẹ
                </button>
              </div>
            </div>
          )}

          {/* Emergency Exit Button */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => void handleEmergencyLogout()}
              className="text-xs font-semibold text-slate-400 hover:text-rose-600 hover:underline transition-colors cursor-pointer"
            >
              Đăng xuất khỏi thiết bị này
            </button>
          </div>
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
    </div>,
    document.body,
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}
