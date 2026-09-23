import { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router'
import { Button } from '@/shared/components/ui/Button'
import { confirmFirebasePasswordReset } from '@/shared/lib/firebase-client'
import { cn } from '@/shared/lib/cn'
import { BrandLogo } from '@/shared/components/ui/BrandLogo'
import { designerAssets } from '@/shared/config/assets'
import { authFeedback } from '@/features/auth/lib/auth-feedback'
import { CircleCheck } from 'lucide-react'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const actionCode = params.get('oobCode') ?? ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [busy, setBusy] = useState(false)

  const passwordsMatch = confirmPassword === '' || password === confirmPassword

  useEffect(() => {
    if (!success) return undefined
    const redirectTimer = window.setTimeout(() => navigate('/login'), 3000)
    return () => window.clearTimeout(redirectTimer)
  }, [navigate, success])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await confirmFirebasePasswordReset(actionCode, password)
      setSuccess(true)
    } catch (err) {
      setError(authFeedback(err, 'reset-password'))
    } finally {
      setBusy(false)
    }
  }

  if (!actionCode) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="ui-card p-6 text-center">
          <p className="text-lg font-bold text-danger">Liên kết không hợp lệ.</p>
          <Link to="/forgot-password" className="mt-4 block text-brand-500 font-bold hover:underline">
            Gửi lại hướng dẫn
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-4 px-4 py-8"
      style={{
        backgroundImage: `url(${designerAssets.lobby.bgLogin})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[#f7f5ff]/75" />
      <div className="relative z-10 flex flex-col gap-4">
        <div className="ui-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <BrandLogo size="lg" className="max-w-[200px]" />
          </div>

          {success ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-50 text-mint-700" aria-hidden="true">
                <CircleCheck size={30} strokeWidth={2} />
              </span>
              <h1 className="font-display text-2xl text-text text-center">
                Đã đổi mật khẩu
              </h1>
              <p className="text-center text-sm text-muted">
                Bạn có thể đăng nhập bằng mật khẩu mới.
              </p>
              <Link
                to="/login"
                className="mt-2 font-bold text-brand-500 hover:underline"
              >
                Đăng nhập ngay
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl text-text">Đặt mật khẩu mới</h1>
              <p className="mt-1 text-sm text-muted">
                Nhập mật khẩu mới cho tài khoản của bạn.
              </p>

              <form className="mt-5 flex flex-col gap-4" onSubmit={onSubmit}>
                <label className="flex flex-col gap-1 text-sm font-bold">
                  Mật khẩu mới
                  <input
                    type="password"
                    autoComplete="new-password"
                    className="min-h-12 rounded-2xl border-2 border-border px-4 text-base font-semibold outline-none focus:border-brand-500 transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                  <span className="text-xs text-muted">Ít nhất 8 ký tự, gồm chữ và số</span>
                </label>

                <label className="flex flex-col gap-1 text-sm font-bold">
                  Xác nhận mật khẩu
                  <input
                    type="password"
                    autoComplete="new-password"
                    className={cn(
                      'min-h-12 rounded-2xl border-2 px-4 text-base font-semibold outline-none transition-colors',
                      !passwordsMatch ? 'border-red-400' : 'border-border focus:border-brand-500',
                    )}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {!passwordsMatch && (
                    <span className="text-xs text-danger">Mật khẩu không khớp</span>
                  )}
                </label>

                {error && (
                  <p
                    className="rounded-xl bg-coral-100 px-3 py-2 text-sm text-danger"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <Button type="submit" disabled={busy || !passwordsMatch}>
                  {busy ? 'Đang lưu…' : 'Đặt mật khẩu mới'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
