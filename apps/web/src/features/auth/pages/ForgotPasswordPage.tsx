import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/Button'
import { sendFirebasePasswordReset } from '@/shared/lib/firebase-client'
import {
  authFeedback,
  shouldConfirmPasswordResetEmail,
} from '@/features/auth/lib/auth-feedback'
import { AuthRecoveryLayout } from '@/features/auth/components/AuthRecoveryLayout'
import { CircleAlert, MailCheck, RotateCcw } from 'lucide-react'

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
      await sendFirebasePasswordReset(email.trim())
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
    <AuthRecoveryLayout
      eyebrow={sent ? 'Email đã được gửi' : 'Khôi phục tài khoản'}
      title={sent ? 'Kiểm tra hộp thư của bạn' : 'Quên mật khẩu?'}
      description={sent
        ? 'Hãy mở email mới nhất từ AIKid và làm theo hướng dẫn để tạo mật khẩu mới.'
        : 'Nhập email phụ huynh đã dùng để đăng ký. Chúng tôi sẽ gửi một liên kết đặt lại mật khẩu an toàn.'}
      currentStep={1}
    >
      {sent ? (
        <div className="space-y-4" role="status" aria-live="polite">
          <div className="flex min-w-0 items-start gap-3 rounded-2xl border-2 border-mint-200 bg-mint-50 p-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-mint-700 shadow-sm" aria-hidden="true">
              <MailCheck size={27} strokeWidth={2.3} />
            </span>
            <div className="min-w-0">
              <p className="font-extrabold text-slate-900">Hướng dẫn đã sẵn sàng</p>
              <p className="mt-1 break-words text-sm font-semibold leading-6 text-slate-600">
                Nếu <strong>{email}</strong> đã được đăng ký, email hướng dẫn sẽ được gửi tới địa chỉ này.
              </p>
            </div>
          </div>
          <ul className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600">
            <li>Kiểm tra cả mục Thư rác hoặc Quảng cáo.</li>
            <li>Chỉ mở email mới nhất nếu bạn đã gửi yêu cầu nhiều lần.</li>
            <li>Liên kết chỉ sử dụng được một lần.</li>
          </ul>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="button" variant="secondary" className="min-h-12" onClick={() => setSent(false)}>
              <RotateCcw size={18} aria-hidden="true" />
              Gửi lại email
            </Button>
            <Link to="/login" className="ui-btn ui-btn-primary min-h-12 text-center">
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <label className="flex min-w-0 flex-col gap-2 text-sm font-extrabold text-slate-800" htmlFor="recovery-email">
            Email phụ huynh
            <input
              id="recovery-email"
              name="email"
              type="email"
              className="min-h-12 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 text-base font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-50"
              value={email}
              autoComplete="email"
              inputMode="email"
              autoFocus
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ten@email.com"
              required
              aria-describedby="recovery-email-help"
            />
            <span id="recovery-email-help" className="text-xs font-semibold leading-5 text-slate-500">
              Dùng đúng email đã đăng nhập hoặc đăng ký tài khoản AIKid.
            </span>
          </label>

          {error && (
            <p className="flex items-start gap-2 rounded-2xl border border-coral-200 bg-coral-50 px-4 py-3 text-sm font-bold text-danger" role="alert">
              <CircleAlert className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}

          <Button type="submit" disabled={busy || !email.trim()} className="min-h-12 w-full !rounded-2xl !font-extrabold">
            {busy ? 'Đang gửi email…' : 'Gửi hướng dẫn đặt lại mật khẩu'}
          </Button>
          <Link to="/login" className="inline-flex min-h-11 items-center justify-center rounded-xl text-sm font-extrabold text-brand-700 hover:bg-brand-50">
            Quay lại đăng nhập
          </Link>
        </form>
      )}
    </AuthRecoveryLayout>
  )
}
