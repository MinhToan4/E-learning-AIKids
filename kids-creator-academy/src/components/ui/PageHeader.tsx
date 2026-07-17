import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function PageHeader({
  kicker,
  title,
  subtitle,
  action,
  className,
}: {
  kicker?: string
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        {kicker ? (
          <p className="mb-1 text-sm font-extrabold uppercase tracking-wide text-brand-500">
            {kicker}
          </p>
        ) : null}
        <h1 className="font-display text-[1.75rem] leading-tight text-text sm:text-3xl md:text-4xl text-balance">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 max-w-2xl text-base text-muted sm:text-lg">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
    </div>
  )
}

/** Always-visible “what to do next” strip for kids */
export function NextStepBar({
  label,
  cta,
  onClick,
}: {
  label: string
  cta: string
  onClick: () => void
}) {
  return (
    <div className="sticky bottom-[4.75rem] z-30 mx-auto w-full max-w-3xl xl:bottom-4">
      <div className="flex items-center gap-3 rounded-[1.5rem] border-2 border-brand-500/20 bg-white/95 p-3 shadow-clay backdrop-blur-sm">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-500">
            Việc tiếp theo
          </p>
          <p className="truncate text-sm font-bold text-text sm:text-base">{label}</p>
        </div>
        <button
          type="button"
          onClick={onClick}
          className="min-h-12 shrink-0 cursor-pointer rounded-2xl bg-brand-500 px-5 text-sm font-extrabold text-white shadow-press transition-transform duration-150 active:translate-y-0.5 hover:bg-brand-600"
        >
          {cta}
        </button>
      </div>
    </div>
  )
}
