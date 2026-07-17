import { useNavigate } from 'react-router-dom'
import { LogIn, Shield, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { COURSE_TAGLINE } from '@/data/mock'
import { useDemoStore } from '@/store/demo-store'

const HERO = '/assets/mascot-hero.jpg'

export function WelcomePage() {
  const navigate = useNavigate()
  const isLoggedIn = useDemoStore((s) => s.isLoggedIn)
  const onboarded = useDemoStore((s) => s.child.onboarded)

  return (
    <main
      id="main"
      className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col justify-center px-4 py-8 page-pad sm:px-6 lg:py-12"
    >
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Visual first on mobile */}
        <div className="order-1 flex justify-center lg:order-2">
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-brand-100 via-sky-100 to-sun-100 opacity-90 blur-[1px]" />
            <div className="relative overflow-hidden rounded-[1.75rem] border-4 border-white shadow-clay">
              <img
                src={HERO}
                alt="Robot Mực Màu — bạn đồng hành sáng tạo"
                className="aspect-square w-full object-cover"
                width={480}
                height={480}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1e2740]/75 to-transparent px-5 pb-5 pt-16 text-white">
                <p className="font-display text-2xl">Robot Mực Màu</p>
                <p className="text-sm font-semibold text-white/90">
                  Cùng con học AI bằng cách tạo truyện & video
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="order-2 text-center lg:order-1 lg:text-left">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-white bg-white px-3 py-1.5 text-sm font-bold text-brand-600 shadow-soft">
            <Sparkles className="size-4" aria-hidden />
            An toàn · 8–11 tuổi · Tiếng Việt
          </p>
          <h1 className="font-display text-[2.1rem] leading-[1.15] text-text sm:text-5xl text-balance">
            Biến ý tưởng thành truyện và video!
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted sm:text-lg lg:mx-0">
            {COURSE_TAGLINE}. Không bài giảng dài — con nhận nhiệm vụ, ghép thẻ, tạo sản phẩm thật.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button
              size="lg"
              className="min-h-14 text-base"
              onClick={() => {
                if (isLoggedIn && onboarded) navigate('/world')
                else if (isLoggedIn) navigate('/onboarding')
                else navigate('/login')
              }}
            >
              <LogIn className="size-5" aria-hidden />
              {isLoggedIn ? 'Tiếp tục học' : 'Bắt đầu ngay'}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="min-h-14"
              onClick={() => navigate('/login')}
            >
              <Shield className="size-5" aria-hidden />
              Phụ huynh / Giáo viên
            </Button>
          </div>

          <ul className="mt-8 grid gap-2 text-left text-sm font-semibold text-text sm:grid-cols-3">
            {[
              { t: 'Nhiều khóa học', d: 'Truyện, an toàn, kể chuyện…' },
              { t: 'Ghép thẻ tạo ảnh', d: 'Chạm thẻ to, rất dễ' },
              { t: 'Riêng tư mặc định', d: 'Phụ huynh duyệt chia sẻ' },
            ].map((x) => (
              <li
                key={x.t}
                className="rounded-2xl border-2 border-white bg-white/90 px-3 py-3 shadow-soft"
              >
                <p className="font-bold text-brand-600">{x.t}</p>
                <p className="mt-0.5 text-muted">{x.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
