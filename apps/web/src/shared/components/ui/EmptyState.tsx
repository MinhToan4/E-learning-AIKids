import { designerAssets } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'

type EmptyStateProps = {
  title: string
  description?: string
  /** Decorative image; defaults to mascot */
  imageSrc?: string
  action?: React.ReactNode
  className?: string
  compact?: boolean
}

export function EmptyState({
  title,
  description,
  imageSrc = designerAssets.brand.mascot,
  action,
  className,
  compact,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'ui-card flex flex-col items-center text-center',
        compact ? 'gap-2 p-5' : 'gap-3 p-8',
        className,
      )}
    >
      <img
        src={imageSrc}
        alt=""
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
        className={cn(
          'rounded-2xl object-cover shadow-soft',
          compact ? 'h-16 w-16' : 'h-24 w-24',
        )}
      />
      <h2 className={cn('font-display text-text', compact ? 'text-xl' : 'text-2xl')}>
        {title}
      </h2>
      {description && (
        <p className="max-w-sm text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
