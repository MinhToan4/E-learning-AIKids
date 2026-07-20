import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

type ErrorStateProps = {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
  /** Inline banner instead of full card */
  inline?: boolean
}

export function ErrorState({
  title = 'Úi, có chút trục trặc',
  message,
  onRetry,
  className,
  inline,
}: ErrorStateProps) {
  if (inline) {
    return (
      <div
        role="alert"
        className={cn(
          'flex flex-wrap items-center justify-between gap-2 rounded-xl bg-coral-100 px-3 py-2 text-sm text-danger',
          className,
        )}
      >
        <p>{message}</p>
        {onRetry && (
          <Button
            type="button"
            variant="secondary"
            className="!min-h-9 !px-3 !text-xs"
            onClick={onRetry}
          >
            Thử lại
          </Button>
        )}
      </div>
    )
  }

  return (
    <div
      role="alert"
      className={cn(
        'ui-card flex flex-col items-center gap-3 p-6 text-center',
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-coral-100 text-2xl">
        ⚠️
      </div>
      <h2 className="font-display text-xl text-text">{title}</h2>
      <p className="max-w-sm text-sm text-muted">{message}</p>
      {onRetry && (
        <Button type="button" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  )
}
