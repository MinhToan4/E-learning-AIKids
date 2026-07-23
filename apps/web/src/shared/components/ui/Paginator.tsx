import { cn } from '@/shared/lib/cn'

type Props = {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPrev: () => void
  onNext: () => void
  onGoTo?: (page: number) => void
  className?: string
}

/**
 * Pagination bar — shows current range, prev/next buttons, and
 * compact page-number pills for navigating directly to a page.
 * Renders nothing when there is only 1 page.
 */
export function Paginator({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPrev,
  onNext,
  onGoTo,
  className,
}: Props) {
  if (totalPages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)

  // Build visible page numbers (always show first, last, current ±1)
  const pages: (number | 'gap')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== 'gap') {
      pages.push('gap')
    }
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-4 py-3',
        className,
      )}
    >
      {/* Range info */}
      <p className="text-xs text-muted">
        {from}–{to} / <span className="font-bold text-text">{totalItems}</span>
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={onPrev}
          aria-label="Trang trước"
          className="min-h-9 min-w-9 rounded-lg px-2 text-sm font-bold text-muted transition hover:bg-brand-50 disabled:opacity-30"
        >
          ‹
        </button>

        {pages.map((p, i) =>
          p === 'gap' ? (
            <span key={`gap-${i}`} className="px-1 text-xs text-muted">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onGoTo?.(p)}
              aria-label={`Trang ${p}`}
              aria-current={p === page ? 'page' : undefined}
              className={cn(
                'min-h-9 min-w-9 rounded-lg text-sm font-bold transition',
                p === page
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-muted hover:bg-brand-50',
              )}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={page === totalPages}
          onClick={onNext}
          aria-label="Trang sau"
          className="min-h-9 min-w-9 rounded-lg px-2 text-sm font-bold text-muted transition hover:bg-brand-50 disabled:opacity-30"
        >
          ›
        </button>
      </div>
    </div>
  )
}
