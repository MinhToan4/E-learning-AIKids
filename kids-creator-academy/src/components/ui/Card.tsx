import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border-2 border-border/90 bg-surface p-4 shadow-soft sm:p-5',
        className,
      )}
      {...props}
    />
  )
}

export function ChoiceCard({
  selected,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'min-h-14 cursor-pointer rounded-[var(--radius-card)] border-2 bg-surface p-4 text-left shadow-soft transition-all duration-150',
        'hover:-translate-y-0.5 hover:border-brand-500/50',
        'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus',
        selected
          ? 'border-brand-500 bg-brand-50 shadow-clay ring-2 ring-brand-100'
          : 'border-border',
        className,
      )}
      aria-pressed={selected}
      {...props}
    >
      {children}
    </button>
  )
}
