import { cn } from '@/lib/cn'

/** Compact mission strip — consistent sizes, no visual noise */
export function MissionBanner({
  stepLabel,
  doing,
  why,
  reward,
  className,
}: {
  stepLabel?: string
  doing: string
  why: string
  reward?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-white px-3 py-3 shadow-soft sm:px-4',
        className,
      )}
    >
      {stepLabel ? (
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-500">
          {stepLabel}
        </p>
      ) : null}
      <dl className="grid gap-2 sm:grid-cols-3 sm:gap-3">
        <div className="rounded-xl bg-brand-50 px-3 py-2">
          <dt className="text-xs font-bold text-brand-600">Đang làm</dt>
          <dd className="mt-0.5 text-sm font-semibold text-text">{doing}</dd>
        </div>
        <div className="rounded-xl bg-sky-100/80 px-3 py-2">
          <dt className="text-xs font-bold text-sky-600">Để làm gì</dt>
          <dd className="mt-0.5 text-sm font-semibold text-text">{why}</dd>
        </div>
        <div className="rounded-xl bg-sun-100 px-3 py-2">
          <dt className="text-xs font-bold text-warning">Nhận được</dt>
          <dd className="mt-0.5 text-sm font-semibold text-text">
            {reward ?? 'Tiến bộ trên bản đồ'}
          </dd>
        </div>
      </dl>
    </div>
  )
}
