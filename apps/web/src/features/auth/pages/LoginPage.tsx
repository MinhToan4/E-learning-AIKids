import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/shared/components/ui/Button'
import { BrandLogo } from '@/shared/components/ui/BrandLogo'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { designerAssets } from '@/shared/config/assets'
import { useToast } from '@/shared/hooks/useToast'
import type { User } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { LoginCatFrame } from '@/features/auth/components/LoginCatFrame'
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton'
import { authFeedback } from '@/features/auth/lib/auth-feedback'

export function LoginPage() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const { toasts, showToast, dismissToast } = useToast()
  const loginAdult = useAuth((state) => state.loginAdult)
  const navigate = useNavigate()

  function goAfterLogin(user: User) {
    if (user.role === 'admin') navigate('/admin', { replace: true })
    else if (user.role === 'teacher') navigate('/teacher', { replace: true })
    else navigate('/kids', { replace: true })
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    try {
      goAfterLogin(await loginAdult(login.trim(), password))
    } catch (error) {
      showToast(authFeedback(error, 'login'), 'error')
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
            variant="adult"
            portalSlot={(
              <div className="rounded-[1.25rem] border border-white/80 bg-white/90 p-3 text-center shadow-clay backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2 text-sm font-extrabold text-coral-700 sm:text-base">
                  <img src="/assets/aikid-ui/figma-icons/login-parent.svg" alt="" className="h-7 w-auto" aria-hidden="true" />
                  Cổng phụ huynh
                </div>
                <p className="mt-1 text-xs font-semibold text-muted">Đăng nhập một lần, sau đó chọn hồ sơ con để vào học.</p>
              </div>
            )}
            mouthSlot={(
              <main>
                <h1 className="sr-only">Đăng nhập cổng phụ huynh AIKid</h1>
                <form id="login-form" className="flex h-full flex-col justify-center gap-4 sm:gap-6" onSubmit={onSubmit}>
                  <label>
                    <span className="sr-only">Email hoặc tên đăng nhập</span>
                    <input
                      id="login-email"
                      name="login"
                      type="text"
                      autoComplete="username"
                      placeholder="Email hoặc tên đăng nhập"
                      className="min-h-12 w-full rounded-2xl border-[3px] border-white/80 bg-white/95 px-4 text-center text-sm font-bold shadow-sm outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-50 sm:min-h-14 sm:text-base"
                      value={login}
                      onChange={(event) => setLogin(event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    <span className="sr-only">Mật khẩu</span>
                    <input
                      id="login-password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="Mật khẩu"
                      className="min-h-12 w-full rounded-2xl border-[3px] border-white/80 bg-white/95 px-4 text-center text-sm font-bold shadow-sm outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-50 sm:min-h-14 sm:text-base"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </label>
                </form>
              </main>
            )}
            pawsSlot={(
              <div className="flex w-full justify-center">
                <Button
                  form="login-form"
                  type="submit"
                  disabled={busy}
                  className="w-[75%] max-w-[16rem] !min-h-16 !rounded-[2rem] !border-4 !border-white !bg-brand-500 !text-xl !font-black !text-white shadow-[0_8px_0_rgba(109,94,252,0.3)] transition-transform hover:-translate-y-1 active:translate-y-1 active:shadow-none"
                >
                  {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
                </Button>
              </div>
            )}
            footerSlot={(
              <aside className="flex w-full flex-col gap-2 rounded-[1.35rem] border-2 border-border bg-white p-3 text-center shadow-clay sm:p-4" aria-label="Hỗ trợ đăng nhập">
                <GoogleSignInButton
                  disabled={busy}
                  onSuccess={goAfterLogin}
                  onError={(message) => showToast(message, 'error')}
                />
                <div className="flex items-center gap-3" aria-hidden="true">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-xs font-bold text-muted">hoặc dùng mật khẩu</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <Link to="/forgot-password" className="inline-flex min-h-8 items-center justify-center text-sm font-bold text-brand-600 hover:underline">
                  Quên mật khẩu?
                </Link>
                <p className="text-sm text-muted">
                  Chưa có tài khoản?{' '}
                  <Link to="/register" className="font-bold text-brand-500 hover:underline">Đăng ký phụ huynh</Link>
                </p>
              </aside>
            )}
          />
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
