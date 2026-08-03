import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/Button'
import { api } from '@/shared/lib/api'
import { BrandLogo } from '@/shared/components/ui/BrandLogo'
import { designerAssets } from '@/shared/config/assets'
import {
  authFeedback,
  shouldConfirmPasswordResetEmail,
} from '@/features/auth/lib/auth-feedback'
import { MailCheck } from 'lucide-react'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      })
      setSent(true)
    } catch (err) {
      if (shouldConfirmPasswordResetEmail(err)) {
        setSent(true)
      } else {
        setError(authFeedback(err, 'forgot-password'))
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="relative flex min-h-dvh w-full flex-col justify-center px-4 py-8"
      style={{
        backgroundImage: `url(${designerAssets.lobby.bgLogin})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[#f7f5ff]/75" />
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-4">
        <Link to="/login" className="text-sm font-bold text-brand-500">
          ← Quay lại đăng nhập
        </Link>
        <div className="ui-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <BrandLogo size="lg" className="max-w-[200px]" />
          </div>

          {sent ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600" aria-hidden="true">
                <MailCheck size={30} strokeWidth={2} />
              </span>
              <h1 className="font-display text-2xl text-text text-center">
                Kiểm tra email của bạn
              </h1>
              <p className="text-center text-sm text-muted">
                Nếu <strong>{email}</strong> đã được đăng ký, chúng tôi sẽ gửi hướng dẫn
                đặt lại mật khẩu. Bạn nhớ kiểm tra cả thư rác nhé.
              </p>
              <Link
                to="/login"
                className="mt-2 font-bold text-brand-500 hover:underline"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl text-text">Quên mật khẩu?</h1>
              <p className="mt-1 text-sm text-muted">
                Nhập email để nhận hướng dẫn đặt lại mật khẩu.
              </p>

              <form className="mt-5 flex flex-col gap-4" onSubmit={onSubmit}>
                <label className="flex flex-col gap-1 text-sm font-bold">
                  Email
                  <input
                    type="email"
                    className="min-h-12 rounded-2xl border-2 border-border px-4 text-base font-semibold outline-none focus:border-brand-500 transition-colors"
                    value={email}
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                  />
                </label>

                {error && (
                  <p
                    className="rounded-xl bg-coral-100 px-3 py-2 text-sm text-danger"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <Button type="submit" disabled={busy}>
                  {busy ? 'Đang gửi…' : 'Gửi hướng dẫn'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
