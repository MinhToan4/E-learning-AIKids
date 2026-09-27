import { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router'
import { Button } from '@/shared/components/ui/Button'
import {
  confirmFirebasePasswordReset,
  verifyFirebasePasswordResetCode,
} from '@/shared/lib/firebase-client'
import { cn } from '@/shared/lib/cn'
import { authFeedback } from '@/features/auth/lib/auth-feedback'
import { AuthRecoveryLayout } from '@/features/auth/components/AuthRecoveryLayout'
import { CircleAlert, CircleCheck, KeyRound, LoaderCircle } from 'lucide-react'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const actionCode = params.get('oobCode') ?? ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [busy, setBusy] = useState(false)
  const [checkingCode, setCheckingCode] = useState(Boolean(actionCode))
  const [codeValid, setCodeValid] = useState(false)

  const passwordsMatch = confirmPassword === '' || password === confirmPassword
  const hasMinimumLength = password.length >= 8
  const hasLetter = /\p{L}/u.test(password)
  const hasNumber = /\d/.test(password)
  const passwordMeetsPolicy = hasMinimumLength && hasLetter && hasNumber

  useEffect(() => {
    if (!actionCode) return undefined
    let active = true
    void verifyFirebasePasswordResetCode(actionCode)
      .then(() => {
        if (active) setCodeValid(true)
      })
      .catch(() => {
        if (active) setCodeValid(false)
      })
      .finally(() => {
        if (active) setCheckingCode(false)
      })
    return () => {
      active = false
    }
  }, [actionCode])

  useEffect(() => {
    if (!success) return undefined
    const redirectTimer = window.setTimeout(() => navigate('/login'), 3000)
    return () => window.clearTimeout(redirectTimer)
  }, [navigate, success])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!passwordMeetsPolicy) {
      setError('Mật khẩu cần có ít nhất 8 ký tự, bao gồm cả chữ và số.')
      return
    }
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

  if (!actionCode || (!checkingCode && !codeValid)) {
    return (
      <AuthRecoveryLayout
        eyebrow="Liên kết không còn hiệu lực"
        title={actionCode ? 'Hãy yêu cầu một email mới' : 'Liên kết chưa đầy đủ'}
        description="Vì lý do bảo mật, mỗi liên kết đặt lại mật khẩu chỉ dùng được một lần và sẽ tự hết hạn."
        currentStep={2}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border-2 border-coral-200 bg-coral-50 p-4" role="alert">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-danger"><CircleAlert size={23} aria-hidden="true" /></span>
            <div className="min-w-0">
              <p className="font-extrabold text-slate-900">Không thể dùng liên kết này</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                {actionCode ? 'Liên kết có thể đã hết hạn hoặc đã được sử dụng.' : 'Email chưa cung cấp mã đặt lại mật khẩu hợp lệ.'}
              </p>
            </div>
          </div>
          <Link to="/forgot-password" className="ui-btn ui-btn-primary min-h-12 w-full text-center">
            Gửi email hướng dẫn mới
          </Link>
        </div>
      </AuthRecoveryLayout>
    )
  }

  if (checkingCode) {
    return (
      <AuthRecoveryLayout
        eyebrow="Đang xác minh"
        title="Kiểm tra liên kết an toàn"
        description="Chỉ mất một chút thời gian. Bạn không cần thao tác thêm."
        currentStep={2}
      >
        <div className="flex flex-col items-center rounded-2xl bg-brand-50 p-6 text-center" role="status" aria-live="polite">
          <LoaderCircle className="animate-spin text-brand-600" size={34} aria-hidden="true" />
          <p className="mt-3 font-extrabold text-slate-900">Đang kiểm tra liên kết…</p>
        </div>
      </AuthRecoveryLayout>
    )
  }

  return (
    <AuthRecoveryLayout
      eyebrow={success ? 'Hoàn tất' : 'Tạo mật khẩu mới'}
      title={success ? 'Mật khẩu đã được thay đổi' : 'Chọn mật khẩu dễ nhớ, khó đoán'}
      description={success
        ? 'Bạn có thể quay lại màn hình đăng nhập và tiếp tục sử dụng tài khoản.'
        : 'Mật khẩu mới cần có ít nhất 8 ký tự, bao gồm cả chữ và số.'}
      currentStep={2}
    >
      {success ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-mint-200 bg-mint-50 p-5 text-center" role="status" aria-live="polite">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-mint-700 shadow-sm" aria-hidden="true">
            <CircleCheck size={31} strokeWidth={2.3} />
          </span>
          <p className="text-sm font-semibold leading-6 text-slate-600">Trang sẽ tự chuyển về đăng nhập sau vài giây.</p>
          <Link to="/login" className="ui-btn ui-btn-primary min-h-12 w-full text-center">
            Đăng nhập bằng mật khẩu mới
          </Link>
        </div>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <label className="flex flex-col gap-1 text-sm font-bold">
            Mật khẩu mới
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} aria-hidden="true" />
              <input
                type="password"
                autoComplete="new-password"
                autoFocus
                className="min-h-12 w-full rounded-2xl border-2 border-slate-200 py-3 pl-11 pr-4 text-base font-semibold outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
          </label>

          <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-extrabold sm:text-xs" aria-label="Yêu cầu mật khẩu">
            <span className={`rounded-xl px-2 py-2 ${hasMinimumLength ? 'bg-mint-50 text-mint-700' : 'bg-slate-100 text-slate-500'}`}>8+ ký tự</span>
            <span className={`rounded-xl px-2 py-2 ${hasLetter ? 'bg-mint-50 text-mint-700' : 'bg-slate-100 text-slate-500'}`}>Có chữ</span>
            <span className={`rounded-xl px-2 py-2 ${hasNumber ? 'bg-mint-50 text-mint-700' : 'bg-slate-100 text-slate-500'}`}>Có số</span>
          </div>

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
              className="flex items-start gap-2 rounded-2xl border border-coral-200 bg-coral-50 px-4 py-3 text-sm font-bold text-danger"
              role="alert"
            >
              <CircleAlert className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}

          <Button type="submit" className="min-h-12 w-full !rounded-2xl !font-extrabold" disabled={busy || !passwordsMatch || !passwordMeetsPolicy}>
            {busy ? 'Đang lưu…' : 'Đặt mật khẩu mới'}
          </Button>
        </form>
      )}
    </AuthRecoveryLayout>
  )
}
