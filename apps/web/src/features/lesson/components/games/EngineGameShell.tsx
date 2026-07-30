import type { ReactNode } from 'react'
import { ArrowLeft, Star } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

type Props = {
  title: string
  subtitle: string
  scene: string
  scenePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
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
  scenePosition,
  score,
  progress,
  children,
  status,
  onBack,
}: Props) {
  const atlasPosition = {
    'top-left': '0% 0%',
    'top-right': '100% 0%',
    'bottom-left': '0% 100%',
    'bottom-right': '100% 100%',
  } as const

  return (
    <section
      className="overflow-hidden rounded-[2rem] border-2 border-brand-100 bg-white shadow-clay"
      aria-labelledby="source-game-title"
    >
      <header className="relative min-h-40 overflow-hidden bg-brand-950 text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{
            backgroundImage: `url("${scene}")`,
            ...(scenePosition
              ? {
                  backgroundSize: '200% 200%',
                  backgroundPosition: atlasPosition[scenePosition],
                }
              : {}),
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/90 via-brand-900/55 to-transparent" />
        <div className="relative flex min-h-40 flex-col justify-between gap-4 p-5 sm:flex-row sm:items-end">
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
              <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-sun-300">
                StoryMee Game Lab
              </p>
              <h2 id="source-game-title" className="font-display text-3xl">
                {title}
              </h2>
              <p className="mt-1 max-w-2xl text-sm font-semibold text-white/85">
                {subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full bg-white/15 px-4 py-2 text-sm font-extrabold backdrop-blur-sm sm:self-auto">
            <Star className="fill-sun-300 text-sun-300" size={18} aria-hidden="true" />
            {score} điểm
          </div>
        </div>
      </header>

      <div className="h-3 bg-brand-50" aria-hidden="true">
        <div
          className="h-full rounded-r-full bg-gradient-to-r from-mint-400 to-brand-500 transition-[width] duration-200"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>

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
