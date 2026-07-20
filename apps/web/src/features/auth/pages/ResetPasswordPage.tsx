import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { api, ApiError } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { BrandLogo } from '@/shared/components/ui/BrandLogo'
import { designerAssets } from '@/shared/config/assets'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [busy, setBusy] = useState(false)

  const passwordsMatch = confirmPassword === '' || password === confirmPassword

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await api('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      })
      setSuccess(true)
      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Link đã hết hạn hoặc không hợp lệ.',
      )
    } finally {
      setBusy(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="ui-card p-6 text-center">
          <p className="text-lg font-bold text-danger">Link không hợp lệ.</p>
          <Link to="/forgot-password" className="mt-4 block text-brand-500 font-bold hover:underline">
            Yêu cầu link mới
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
              <div className="text-5xl">✅</div>
              <h1 className="font-display text-2xl text-text text-center">
                Mật khẩu đã được đặt lại!
              </h1>
              <p className="text-center text-sm text-muted">
                Đang chuyển hướng đến trang đăng nhập...
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
