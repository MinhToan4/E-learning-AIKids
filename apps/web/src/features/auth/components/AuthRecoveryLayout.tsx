import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { BrandLogo } from '@/shared/components/ui/BrandLogo'
import { designerAssets } from '@/shared/config/assets'
import { CheckCircle2, Mail, ShieldCheck } from 'lucide-react'

type AuthRecoveryLayoutProps = {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  currentStep?: 1 | 2
}

export function AuthRecoveryLayout({
  eyebrow,
  title,
  description,
  children,
  currentStep = 1,
}: AuthRecoveryLayoutProps) {
  return (
    <main
      className="relative min-h-dvh overflow-x-hidden bg-bg px-3 py-4 sm:px-5 sm:py-6 lg:py-8"
      style={{
        backgroundImage: `linear-gradient(rgba(248,250,252,.7), rgba(248,250,252,.88)), url(${designerAssets.lobby.bgLogin})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      <div className="mx-auto flex w-full max-w-[1024px] flex-col gap-4 sm:gap-6">
        <header className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border-2 border-white/80 bg-white/90 px-4 py-2 shadow-soft backdrop-blur-sm sm:px-5">
          <BrandLogo size="lg" className="max-w-[150px] sm:max-w-[180px]" />
          <Link
            to="/login"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition-colors hover:border-brand-300 hover:text-brand-700"
          >
            Đăng nhập
          </Link>
        </header>

        <section className="grid min-w-0 overflow-hidden rounded-[1.75rem] border-2 border-white bg-white shadow-soft-xl lg:grid-cols-[0.86fr_1.14fr]">
          <div className="relative hidden min-h-[34rem] overflow-hidden bg-gradient-to-br from-brand-100 via-sky-50 to-mint-50 p-8 lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/55" aria-hidden="true" />
            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black uppercase tracking-wider text-brand-700 shadow-sm">
                <ShieldCheck size={17} aria-hidden="true" />
                Tài khoản an toàn
              </span>
              <h2 className="mt-5 max-w-sm text-3xl font-black tracking-tight text-slate-900">
                Lấy lại mật khẩu thật dễ dàng
              </h2>
              <p className="mt-3 max-w-sm text-sm font-semibold leading-6 text-slate-600">
                Chúng tôi gửi liên kết riêng tới email của phụ huynh. Liên kết chỉ dùng một lần và sẽ tự hết hạn.
              </p>
            </div>

            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white bg-white/80 p-3.5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-700"><Mail size={22} aria-hidden="true" /></span>
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-800">Bước 1 · Kiểm tra email</p>
                  <p className="text-xs font-semibold text-slate-500">Mở thư mới nhất từ AIKid.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white bg-white/80 p-3.5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-mint-100 text-mint-700"><CheckCircle2 size={22} aria-hidden="true" /></span>
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-800">Bước 2 · Tạo mật khẩu mới</p>
                  <p className="text-xs font-semibold text-slate-500">Dùng ít nhất 8 ký tự gồm chữ và số.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-col justify-center p-4 sm:p-7 lg:p-10">
            <div className="mb-6 flex items-center gap-2" aria-label={`Bước ${currentStep} trên 2`}>
              {[1, 2].map((step) => (
                <div key={step} className="flex flex-1 items-center gap-2">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black ${step <= currentStep ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {step}
                  </span>
                  <span className={`h-2 flex-1 rounded-full ${step <= currentStep ? 'bg-brand-400' : 'bg-slate-100'}`} />
                </div>
              ))}
            </div>

            <div className="mb-6 min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">{eyebrow}</p>
              <h1 className="mt-2 break-words text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
              <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-600">{description}</p>
            </div>

            {children}
          </div>
        </section>

        <p className="text-center text-xs font-semibold text-slate-500">
          AIKid không bao giờ yêu cầu bạn gửi mật khẩu qua email hoặc tin nhắn.
        </p>
      </div>
    </main>
  )
}
