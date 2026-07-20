import { cn } from '@/shared/lib/cn'

/** Soft Clay loading pulse — prefers-reduced-motion handled in CSS */
export function Skeleton({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('ui-skeleton rounded-2xl', className)}
      aria-hidden
      {...rest}
    />
  )
}

export function PageSkeleton({
  rows = 4,
  className,
}: {
  rows?: number
  className?: string
}) {
  return (
    <div
      className={cn('flex flex-col gap-4', className)}
      role="status"
      aria-live="polite"
      aria-label="Đang tải"
    >
      <Skeleton className="h-8 w-2/5 max-w-[200px]" />
      <Skeleton className="h-4 w-3/5 max-w-[280px]" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
      <span className="sr-only">Đang tải nội dung…</span>
    </div>
  )
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Đang tải danh sách"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="ui-card overflow-hidden p-0">
          <Skeleton className="h-28 w-full rounded-none" />
          <div className="flex flex-col gap-2 p-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
