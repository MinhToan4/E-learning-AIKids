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
      <header className="flex items-center justify-between bg-brand-950 p-4 text-white">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15 text-white transition hover:bg-white/25 focus-visible:outline focus-visible:outline-3 focus-visible:outline-white"
              onClick={onBack}
              aria-label="Chọn game khác"
            >
              <ArrowLeft aria-hidden="true" size={20} />
            </button>
          )}
          <h2 id="source-game-title" className="font-display text-lg font-bold sm:text-xl">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-extrabold backdrop-blur-sm">
          <Star className="fill-sun-300 text-sun-300" size={16} aria-hidden="true" />
          <span>{score}</span>
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
