import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Button } from '@/shared/components/ui/Button'
import { useAuth } from '@/shared/store/auth'
import { ApiError } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { BrandLogo } from '@/shared/components/ui/BrandLogo'
import { designerAssets } from '@/shared/config/assets'
import { useToast } from '@/shared/hooks/useToast'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton'
import { PinPadModal } from '@/shared/components/ui/PinPadModal'
import type { User } from '@/shared/lib/api'
import { authFeedback } from '@/features/auth/lib/auth-feedback'
import { NavProfileIcon } from '@/shared/components/icons/KidNavIcons'
import { ParentProfileIcon } from '@/shared/components/icons/ParentIcons'
import { CmsClassesIcon } from '@/shared/components/icons/CmsIcons'
import { LoginCatFrame } from '@/features/auth/components/LoginCatFrame'

export function LoginPage() {
  const [params] = useSearchParams()
  const initial =
    params.get('mode') === 'adult' ||
    params.get('role') === 'parent' ||
    params.get('role') === 'teacher' ||
    params.get('role') === 'admin'
      ? 'adult'
      : 'student'
  const [mode, setMode] = useState<'student' | 'adult'>(initial as 'student' | 'adult')
  const [adultRole, setAdultRole] = useState<'parent' | 'teacher'>(
    params.get('role') === 'teacher' ? 'teacher' : 'parent',
  )
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')
  const [showPinModal, setShowPinModal] = useState(false)
  const [busy, setBusy] = useState(false)
  const { toasts, showToast, dismissToast } = useToast()
  const loginStudent = useAuth((s) => s.loginStudent)
  const loginAdult = useAuth((s) => s.loginAdult)
  const setSessionUser = useAuth((s) => s.setSessionUser)
  const navigate = useNavigate()

  function goAfterAdult(user: User) {
    if (user.role === 'admin') navigate('/admin')
    else if (user.role === 'teacher') navigate('/teacher')
    else navigate('/kids')
  }

  const hint = useMemo(
    () =>
      mode === 'student'
        ? 'Nhập biệt danh để tiếp tục học và sáng tạo.'
        : adultRole === 'teacher'
          ? 'Vào lớp học, bài giảng và công cụ dành cho giáo viên.'
          : 'Theo dõi tiến bộ và đồng hành cùng việc học của con.',
    [adultRole, mode],
  )

  async function onSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setBusy(true)
    try {
      if (mode === 'student') {
        // Gọi API trước không có PIN — nếu server yêu cầu PIN thì error message có "PIN"
        const user = await loginStudent(nickname.trim(), undefined)
        navigate(user.onboarded ? '/home' : '/onboarding')
      } else {
        const user = await loginAdult(email.trim(), password)
        goAfterAdult(user)
      }
    } catch (err) {
      const rawMessage = err instanceof ApiError ? err.message : ''
      // Nếu server yêu cầu PIN → mở PinPadModal thay vì hiện lỗi
      if (mode === 'student' && rawMessage.toUpperCase().includes('PIN')) {
        setShowPinModal(true)
      } else {
        showToast(authFeedback(err, 'login'), 'error')
      }
    } finally {
      setBusy(false)
    }
  }

  async function onSubmitPin(enteredPin: string) {
    setBusy(true)
    try {
      // Gọi lại với PIN — dùng tham số thứ 3 opts
      const user = await loginStudent(nickname.trim(), undefined, {
        pin: enteredPin.trim(),
      })
      navigate(user.onboarded ? '/home' : '/onboarding')
    } catch (err) {
      showToast(authFeedback(err, 'login'), 'error')
      setPin('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="relative h-dvh overflow-hidden bg-bg bg-cover bg-center"
      style={{ backgroundImage: `url(${designerAssets.lobby.bgLogin})` }}
    >
      <div className="absolute inset-0 bg-white/20" />
      <BrandLogo size="lg" className="absolute left-4 top-4 z-30 max-w-[140px] drop-shadow-sm sm:left-7 sm:top-6 sm:max-w-[180px]" />
      <Link
        to="/"
        aria-label="Đóng và về trang chào"
        className="absolute right-4 top-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-coral-400 text-3xl font-black leading-none text-white shadow-clay transition-transform hover:-translate-y-0.5 sm:right-7 sm:top-6 sm:h-16 sm:w-16"
      >
        ×
      </Link>

      <div className="absolute inset-0 flex items-end justify-center overflow-hidden pt-20 sm:pt-16">
          <div className="h-[82dvh] max-h-[56rem] min-h-[36rem] shrink-0 aspect-[1000/820] sm:h-[86dvh]">
          <LoginCatFrame
            variant={mode}
            portalSlot={(
              <fieldset>
            <legend className="sr-only">Chọn vai trò đăng nhập</legend>
            <div className="grid grid-cols-3 gap-2 rounded-[1.25rem] border border-white/80 bg-white/88 p-1.5 shadow-clay backdrop-blur-sm">
              <button
                type="button"
                className={cn(
                  'flex min-h-12 items-center justify-center gap-1 rounded-xl border-2 px-1 text-[10px] font-extrabold sm:text-sm',
                  mode === 'student'
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-transparent text-muted',
                )}
                aria-pressed={mode === 'student'}
                onClick={() => {
                  setMode('student')
                  setEmail('')
                  setPassword('')
                }}
              >
                <NavProfileIcon size={19} aria-hidden="true" />
                Học sinh
              </button>
              <button
                type="button"
                className={cn(
                  'flex min-h-12 items-center justify-center gap-1 rounded-xl border-2 px-1 text-[10px] font-extrabold sm:text-sm',
                  mode === 'adult' && adultRole === 'parent'
                    ? 'border-coral-400 bg-coral-50 text-coral-700'
                    : 'border-transparent text-muted',
                )}
                aria-pressed={mode === 'adult' && adultRole === 'parent'}
                onClick={() => {
                  setMode('adult')
                  setAdultRole('parent')
                  setNickname('')
                }}
              >
                <ParentProfileIcon size={19} aria-hidden="true" />
                Phụ huynh
              </button>
              <button
                type="button"
                className={cn(
                  'flex min-h-12 items-center justify-center gap-1 rounded-xl border-2 px-1 text-[10px] font-extrabold sm:text-sm',
                  mode === 'adult' && adultRole === 'teacher'
                    ? 'border-sky-400 bg-sky-50 text-sky-700'
                    : 'border-transparent text-muted',
                )}
                aria-pressed={mode === 'adult' && adultRole === 'teacher'}
                onClick={() => {
                  setMode('adult')
                  setAdultRole('teacher')
                  setNickname('')
                }}
              >
                <CmsClassesIcon size={19} aria-hidden="true" />
                Giáo viên
              </button>
            </div>
              </fieldset>
            )}
            mouthSlot={(
              <main>
                <h1 className="sr-only">
                  {mode === 'student' ? 'Chào con trở lại!' : `Đăng nhập ${adultRole === 'teacher' ? 'giáo viên' : 'phụ huynh'}`}
                </h1>
                <span className="sr-only">{'Đăng nhập AIKid · Phụ huynh & giáo viên'}</span>
                <p className="sr-only">{hint}</p>
                <form className="flex flex-col gap-2" onSubmit={onSubmit}>
                  {mode === 'student' ? (
                    <label>
                      <span className="sr-only">Biệt danh</span>
                      <input
                        autoComplete="username"
                        placeholder="Nhập biệt danh"
                        className="min-h-12 w-full rounded-xl border-2 border-white bg-white px-3 text-center text-sm font-bold text-text outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-50 sm:min-h-14 sm:text-base"
                        value={nickname}
                        maxLength={16}
                        onChange={(e) => setNickname(e.target.value)}
                        required
                      />
                    </label>
                  ) : (
                    <>
                      <label>
                        <span className="sr-only">Email hoặc Tên đăng nhập</span>
                        <input
                          type="text"
                          autoComplete="username"
                          placeholder="Nhập email hoặc tên đăng nhập"
                          className="min-h-11 w-full rounded-xl border-2 border-white bg-white px-3 text-center text-sm font-semibold outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-50"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </label>
                      <label>
                        <span className="sr-only">Mật khẩu</span>
                        <input
                          type="password"
                          autoComplete="current-password"
                          placeholder="Nhập mật khẩu"
                          className="min-h-11 w-full rounded-xl border-2 border-white bg-white px-3 text-center text-sm font-semibold outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-50"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </label>
                    </>
                  )}
                  <Button
                    type="submit"
                    disabled={busy}
                    className={cn(mode === 'student' && '!min-h-12 !rounded-full !bg-coral-400 !text-white !shadow-[0_10px_20px_rgba(255,123,147,0.3)]')}
                  >
                    {busy ? 'Đang vào…' : mode === 'adult' ? 'Đăng nhập' : 'Vào học!'}
                  </Button>
                </form>
              </main>
            )}
            pawsSlot={mode === 'adult' ? (
              <aside className="flex w-full flex-col gap-2 rounded-[1.35rem] border border-border bg-white/98 p-3 shadow-clay sm:p-4" aria-label="Tùy chọn đăng nhập khác">
                <Link to="/forgot-password" className="inline-flex min-h-8 items-center justify-center text-sm font-bold text-brand-600 hover:underline">
                  Quên mật khẩu?
                </Link>
                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-xs font-bold text-muted">hoặc</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <GoogleSignInButton
                  role={adultRole}
                  onSuccess={(user) => {
                    setSessionUser(user)
                    goAfterAdult(user)
                  }}
                  onError={(msg) => showToast(msg, 'error')}
                />
                {adultRole === 'teacher' ? (
                  <p className="rounded-2xl bg-sky-50 p-2.5 text-center text-xs font-semibold text-sky-800">
                    Tài khoản giáo viên do trường cấp. Đăng nhập bằng email nhận lời mời.
                  </p>
                ) : (
                  <p className="text-center text-sm text-muted">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="font-bold text-brand-500 hover:underline">Đăng ký ngay</Link>
                  </p>
                )}
              </aside>
            ) : undefined}
          />
        </div>
      </div>
      <PinPadModal
        isOpen={showPinModal}
        onClose={() => {
          setShowPinModal(false)
          setPin('')
        }}
        onSubmit={(value) => void onSubmitPin(value)}
        title={`Xin chào ${nickname || 'bạn nhỏ'}!`}
        subtitle="Nhập mã PIN 6 số Ba / Mẹ đã đặt"
        busy={busy}
        pin={pin}
        setPin={setPin}
      />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
