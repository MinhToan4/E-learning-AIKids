import { cn } from '@/lib/cn'

/** Always answer for kids: What am I doing? Why? What do I get? */
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
        'rounded-[1.5rem] border-2 border-brand-500/20 bg-white p-4 shadow-soft sm:p-5',
        className,
      )}
    >
      {stepLabel ? (
        <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
          {stepLabel}
        </p>
      ) : null}
      <dl className="mt-2 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-brand-50 px-3 py-2.5">
          <dt className="text-xs font-extrabold text-brand-600">Con đang làm gì?</dt>
          <dd className="mt-0.5 text-sm font-bold text-text sm:text-base">{doing}</dd>
        </div>
        <div className="rounded-2xl bg-sky-100/80 px-3 py-2.5">
          <dt className="text-xs font-extrabold text-sky-600">Để làm gì?</dt>
          <dd className="mt-0.5 text-sm font-bold text-text sm:text-base">{why}</dd>
        </div>
        <div className="rounded-2xl bg-sun-100 px-3 py-2.5">
          <dt className="text-xs font-extrabold text-warning">Nhận được gì?</dt>
          <dd className="mt-0.5 text-sm font-bold text-text sm:text-base">
            {reward ?? 'Một phần truyện của con'}
          </dd>
        </div>
      </dl>
    </div>
  )
}
