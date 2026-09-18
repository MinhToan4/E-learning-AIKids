import { cn } from '@/shared/lib/cn'

type CuteProgressProps = {
  value: number
  label?: string
  tone?: 'violet' | 'mint' | 'coral'
  compact?: boolean
  className?: string
}

export function CuteProgress({
  value,
  label,
  tone = 'violet',
  compact = false,
  className,
}: CuteProgressProps) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)))

  return (
    <div className={cn('cute-progress', compact && 'cute-progress-compact', className)}>
      {label && (
        <div className="cute-progress-header flex items-center justify-between mb-1.5 px-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700">{label}</span>
          <strong className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 text-[11px] font-black border border-brand-200 shadow-2xs">
            {safeValue}%
          </strong>
        </div>
      )}
      <div
        className="cute-progress-track"
        role="progressbar"
        aria-label={label || 'Tiến độ'}
        aria-valuenow={safeValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span className={`cute-progress-fill cute-progress-fill-${tone}`} style={{ width: `${safeValue}%` }} />
        <img
          src="/assets/aikid-ui/generated/star.webp"
          alt=""
          aria-hidden="true"
          className="cute-progress-star cute-progress-star-earned cute-progress-star-current"
          style={{ left: `${safeValue}%` }}
        />
      </div>
    </div>
  )
}
