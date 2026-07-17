import type { ReactNode } from 'react'
import { MASCOT_SRC } from '@/data/mock'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-border bg-white/70 px-6 py-12 text-center">
      <img src={MASCOT_SRC} alt="" className="mb-4 size-24 opacity-90" />
      <h3 className="font-display text-xl font-semibold text-text">{title}</h3>
      <p className="mt-2 max-w-md text-muted">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}

export function ErrorState({
  title = 'Kết nối đang trốn đâu đó',
  description = 'Sản phẩm của con vẫn an toàn. Hãy thử lại nhé!',
  onRetry,
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-coral-400/30 bg-coral-100/40 p-6 text-center">
      <h3 className="font-display text-xl font-semibold text-text">{title}</h3>
      <p className="mt-2 text-muted">{description}</p>
      {onRetry ? (
        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          Thử lại
        </Button>
      ) : null}
    </div>
  )
}

export function LoadingCreature({
  stage,
  className,
}: {
  stage?: string | null
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-[var(--radius-card)] bg-brand-50 p-8 text-center',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <img
        src={MASCOT_SRC}
        alt=""
        className="size-28 animate-soft-pulse"
        width={112}
        height={112}
      />
      <div>
        <p className="font-display text-xl font-semibold text-brand-600">
          Robot Mực Màu đang pha màu…
        </p>
        <p className="mt-1 text-muted">{stage ?? 'Đang chuẩn bị…'}</p>
      </div>
    </div>
  )
}

export function SafetyNotice({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-[var(--radius-btn)] border border-sun-400/50 bg-sun-100 px-4 py-3 text-sm font-medium text-text"
      role="note"
    >
      {children}
    </div>
  )
}
