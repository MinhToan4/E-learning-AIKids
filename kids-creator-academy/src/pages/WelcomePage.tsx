import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, Shield, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MASCOT_SRC } from '@/data/mock'
import { useDemoStore } from '@/store/demo-store'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function WelcomePage() {
  const navigate = useNavigate()
  const setRole = useDemoStore((s) => s.setRole)
  const onboarded = useDemoStore((s) => s.child.onboarded)
  const reduced = useReducedMotion()

  return (
    <main
      id="main"
      className="relative mx-auto flex min-h-dvh max-w-6xl flex-col items-center justify-center px-4 py-10"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-10 size-64 rounded-full bg-brand-100/80 blur-3xl" />
        <div className="absolute -right-10 bottom-20 size-72 rounded-full bg-sky-100/90 blur-3xl" />
        <div className="absolute left-1/3 top-1/2 size-40 rounded-full bg-sun-100/70 blur-2xl" />
      </div>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 grid w-full items-center gap-10 lg:grid-cols-2"
      >
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-sm font-bold text-brand-600 shadow-soft">
            <Sparkles className="size-4" aria-hidden />
            Xưởng sáng tạo AI an toàn · 8–11 tuổi
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight text-text md:text-5xl text-balance">
            Biến ý tưởng thành truyện và video!
          </h1>
          <p className="mt-4 text-lg text-muted md:text-xl">
            Không chỉ xem bài giảng — con nhận nhiệm vụ, ghép prompt, tạo truyện tranh
            và video kể chuyện của riêng mình.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button
              size="lg"
              onClick={() => {
                setRole('student')
                navigate(onboarded ? '/world' : '/onboarding')
              }}
            >
              Bắt đầu phiêu lưu
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => {
                setRole('parent')
                navigate('/parent/overview')
              }}
            >
              <Shield className="size-5" aria-hidden />
              Khu vực phụ huynh
            </Button>
          </div>
          <button
            type="button"
            className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-muted underline-offset-4 hover:text-text hover:underline"
            onClick={() => {
              setRole('teacher')
              navigate('/teacher/overview')
            }}
          >
            <GraduationCap className="size-4" aria-hidden />
            Giáo viên / demo lớp học
          </button>
        </div>

        <div className="order-1 flex justify-center lg:order-2">
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-brand-100 via-sky-100 to-mint-100 opacity-80" />
            <div className="relative rounded-[2rem] border border-white bg-white/80 p-8 shadow-clay backdrop-blur-sm">
              <img
                src={MASCOT_SRC}
                alt="Robot Mực Màu — mascot xưởng sáng tạo"
                className="mx-auto size-56 md:size-64"
              />
              <p className="mt-4 text-center font-display text-xl font-semibold text-brand-600">
                Robot Mực Màu
              </p>
              <p className="text-center text-sm text-muted">
                Người bạn pha màu an toàn trong mọi nhiệm vụ
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  )
}
