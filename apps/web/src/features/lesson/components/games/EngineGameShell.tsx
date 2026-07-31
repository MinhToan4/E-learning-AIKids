import type { ReactNode } from 'react'
import { ArrowLeft, Star } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

type Props = {
  title: string
  subtitle: string
  scene: string
  sceneAlt: string
  score: number
  progress: number
  children: ReactNode
  status?: string
  onBack?: () => void
}

export function EngineGameShell({
  title,
  subtitle,
  scene,
  sceneAlt,
  score,
  progress,
  children,
  status,
  onBack,
}: Props) {
  return (
    <section
      className="overflow-hidden rounded-[2rem] border-2 border-brand-100 bg-white shadow-clay"
      aria-labelledby="source-game-title"
    >
      {/* WHY: flex thay grid để left col tự co, right col fill phần còn lại.
          Grid cols cố định gây khoảng trắng trái khi col trái ngắn. */}
      <header className="flex min-h-[18rem] bg-brand-950 text-white">
        {/* Left: game title + score — tự co theo content */}
        <div className="flex shrink-0 basis-[42%] flex-col justify-between gap-5 p-5 sm:p-7">
          <div className="flex items-start gap-3">
            {onBack && (
              <button
                type="button"
                className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/15 text-white transition hover:bg-white/25 focus-visible:outline focus-visible:outline-3 focus-visible:outline-white"
                onClick={onBack}
                aria-label="Chọn game khác"
              >
                <ArrowLeft aria-hidden="true" />
              </button>
            )}
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sun-300 sm:text-sm">
                ✦ StoryMee Game Lab
              </p>
              <h2 id="source-game-title" className="mt-1 font-display text-2xl leading-tight sm:text-3xl">
                {title}
              </h2>
              <p className="mt-2 max-w-sm text-sm font-semibold leading-relaxed text-white/80">
                {subtitle}
              </p>
            </div>
          </div>
          {/* Score badge */}
          <div className="flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-extrabold backdrop-blur-sm">
            <Star className="fill-sun-300 text-sun-300" size={18} aria-hidden="true" />
            <span>{score}</span>
            <span className="font-normal text-white/70">điểm khám phá</span>
          </div>
        </div>

        {/* Right: scene illustration — fill phần còn lại hoàn toàn */}
        <div className="relative min-h-[18rem] flex-1 overflow-hidden">
          {/* WHY: absolute inset-0 đảm bảo ảnh fill đúng container,
              không để lại khoảng trắng góc nào */}
          <img
            src={scene}
            alt={sceneAlt}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          {/* Gradient blend trái để ảnh hòa với header tối */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-brand-950/95 via-brand-950/40 to-transparent"
            aria-hidden="true"
          />
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-2.5 bg-brand-50" aria-hidden="true">
        <div
          className="h-full rounded-r-full bg-gradient-to-r from-mint-400 via-brand-400 to-brand-500 transition-[width] duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>

      {/* Game content area */}
      <div className="grid gap-5 p-4 sm:p-6">
        {status && (
          <p
            className={cn(
              'rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm font-bold text-brand-800',
            )}
            role="status"
            aria-live="polite"
          >
            {status}
          </p>
        )}
        {children}
      </div>
    </section>
  )
}
