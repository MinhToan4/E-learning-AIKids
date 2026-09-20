import React from 'react'
import { cn } from '@/shared/lib/cn'

export function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ size?: number }>
  label: string
  value: number
  color: string
}) {
  return (
    <div className="ui-card flex items-center gap-3 p-4 shadow-soft transition-all duration-150 hover:scale-[1.02]">
      <div
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl shadow-xs',
          color === 'brand' && 'bg-brand-50 text-brand-600',
          color === 'sun' && 'bg-sun-50 text-sun-600',
          color === 'mint' && 'bg-mint-50 text-mint-600',
          color === 'coral' && 'bg-coral-50 text-coral-600',
        )}
      >
        <Icon size={26} />
      </div>
      <div>
        <p className="text-2xl font-extrabold">{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </div>
  )
}

export function LoadingSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Đang tải dữ liệu…">
      {Array.from({ length: count }).map((_, i) => (
        // WHY: varied widths give a more natural skeleton appearance (avoids uniform "bar" look)
        <div key={i} className="ui-card flex animate-pulse flex-col gap-2 p-4">
          <div className="h-3 w-24 rounded-full bg-brand-100" />
          <div className={`h-5 rounded-full bg-brand-50 ${i % 2 === 0 ? 'w-3/4' : 'w-1/2'}`} />
        </div>
      ))}
    </div>
  )
}
