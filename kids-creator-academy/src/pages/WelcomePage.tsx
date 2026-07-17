import { useNavigate } from 'react-router-dom'
import { LogIn, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MASCOT_SRC, COURSE_TAGLINE } from '@/data/mock'
import { useDemoStore } from '@/store/demo-store'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { fadeUp } from '@/lib/motion'
import { motion } from 'framer-motion'

export function WelcomePage() {
  const navigate = useNavigate()
  const isLoggedIn = useDemoStore((s) => s.isLoggedIn)
  const onboarded = useDemoStore((s) => s.child.onboarded)
  const reduced = useReducedMotion()
  const anim = fadeUp(reduced)

  return (
    <main
      id="main"
      className="relative mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-center px-4 py-10 page-pad"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 top-10 size-52 rounded-full bg-brand-100" />
        <div className="absolute -right-8 bottom-16 size-60 rounded-full bg-sky-100" />
        <div className="absolute left-1/2 top-1/3 size-36 -translate-x-1/2 rounded-full bg-sun-100" />
      </div>

      <motion.div
        {...anim}
        className="relative z-10 grid w-full items-center gap-8 lg:grid-cols-2 lg:gap-12"
      >
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-white bg-white/90 px-3 py-1.5 text-sm font-extrabold text-brand-600 shadow-soft">
            <Sparkles className="size-4" aria-hidden />
            Dành cho bé 8–11 tuổi · An toàn
          </p>
          <h1 className="font-display text-[2rem] leading-tight text-text sm:text-4xl md:text-5xl text-balance">
            Biến ý tưởng thành truyện và video!
          </h1>
          <p className="mt-3 text-base text-muted sm:text-lg md:text-xl">
            {COURSE_TAGLINE}. Học AI bằng cách tạo — không bài giảng dài, không chatbot mở.
          </p>
          <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button
              size="lg"
              onClick={() => {
                if (isLoggedIn && onboarded) navigate('/world')
                else if (isLoggedIn) navigate('/onboarding')
                else navigate('/login')
              }}
            >
              <LogIn className="size-5" aria-hidden />
              {isLoggedIn ? 'Tiếp tục phiêu lưu' : 'Đăng nhập / Bắt đầu'}
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/login')}>
              Phụ huynh & giáo viên
            </Button>
          </div>
          <ul className="mt-6 grid gap-2 text-left text-sm font-semibold text-muted sm:grid-cols-3">
            <li className="rounded-2xl bg-white/80 px-3 py-2 shadow-soft">1 việc / màn hình</li>
            <li className="rounded-2xl bg-white/80 px-3 py-2 shadow-soft">Nút to, dễ bấm</li>
            <li className="rounded-2xl bg-white/80 px-3 py-2 shadow-soft">Riêng tư mặc định</li>
          </ul>
        </div>

        <div className="order-1 flex justify-center lg:order-2">
          <div className="relative w-full max-w-sm">
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-brand-100 via-sky-100 to-mint-100" />
            <div className="relative rounded-[2rem] border-2 border-white bg-white/90 p-6 shadow-clay sm:p-8">
              <img
                src={MASCOT_SRC}
                alt="Robot Mực Màu — mascot xưởng sáng tạo"
                className="mx-auto size-44 sm:size-56"
                width={224}
                height={224}
              />
              <p className="mt-3 text-center font-display text-xl text-brand-600 sm:text-2xl">
                Robot Mực Màu
              </p>
              <p className="text-center text-sm font-semibold text-muted">
                Người bạn pha màu an toàn trong mọi nhiệm vụ
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  )
}
