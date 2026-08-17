import React, { useId } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

type StatMetricCardProps = {
  label: string
  value: number | string
  icon: React.ComponentType<{ size?: number; className?: string }> | React.ReactNode
  color?: 'brand' | 'sky' | 'mint' | 'sun' | 'coral' | 'purple'
  trend?: {
    value: string
    isPositive?: boolean
    label?: string
  }
  sparklineData?: number[]
  subtext?: string
  badge?: string
  onClick?: () => void
  className?: string
}

const COLOR_STYLES = {
  brand: {
    bg: 'bg-brand-50/50 hover:bg-brand-50/80 border-brand-200/60',
    iconBg: 'bg-white shadow-md shadow-brand-200/60',
    text: 'text-brand-700',
    sparkline: '#6D5EFC',
  },
  sky: {
    bg: 'bg-sky-50/50 hover:bg-sky-50/80 border-sky-200/60',
    iconBg: 'bg-white shadow-md shadow-sky-200/60',
    text: 'text-sky-700',
    sparkline: '#3DBFFF',
  },
  mint: {
    bg: 'bg-emerald-50/50 hover:bg-emerald-50/80 border-emerald-200/60',
    iconBg: 'bg-white shadow-md shadow-emerald-200/60',
    text: 'text-emerald-700',
    sparkline: '#3ED9A0',
  },
  sun: {
    bg: 'bg-amber-50/50 hover:bg-amber-50/80 border-amber-200/60',
    iconBg: 'bg-white shadow-md shadow-amber-200/60',
    text: 'text-amber-700',
    sparkline: '#FFC94A',
  },
  coral: {
    bg: 'bg-rose-50/50 hover:bg-rose-50/80 border-rose-200/60',
    iconBg: 'bg-white shadow-md shadow-rose-200/60',
    text: 'text-rose-700',
    sparkline: '#FF7B93',
  },
  purple: {
    bg: 'bg-purple-50/50 hover:bg-purple-50/80 border-purple-200/60',
    iconBg: 'bg-white shadow-md shadow-purple-200/60',
    text: 'text-purple-700',
    sparkline: '#A855F7',
  },
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const sparkId = useId()
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const width = 100
  const height = 28

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width
    const y = height - ((val - min) / range) * (height - 6) - 3
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  const pathD = `M ${points.join(' L ')}`
  const fillD = `${pathD} L ${width},${height} L 0,${height} Z`

  return (
    <div className="h-7 w-24 overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id={`sparkGrad-${sparkId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={fillD} fill={`url(#sparkGrad-${sparkId})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export function StatMetricCard({
  label,
  value,
  icon,
  color = 'brand',
  trend,
  sparklineData,
  subtext,
  badge,
  onClick,
  className,
}: StatMetricCardProps) {
  const style = COLOR_STYLES[color]

  const isClickable = !!onClick

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 p-4 transition-all duration-200',
        style.bg,
        isClickable && 'cursor-pointer hover:-translate-y-1 hover:shadow-md active:translate-y-0',
        className,
      )}
    >
      {/* Top row: Icon + Trend/Badge */}
      <div className="flex items-start justify-between gap-2">
        <div
          className={cn(
            'grid h-12 w-12 place-items-center rounded-2xl transition-transform group-hover:scale-105',
            style.iconBg,
          )}
        >
          {React.isValidElement(icon) ? (
            icon
          ) : typeof icon === 'function' ? (
            React.createElement(icon as React.ComponentType<{ size?: number; className?: string }>, {
              size: 28,
              className: 'text-current',
            })
          ) : null}
        </div>

        <div className="flex flex-col items-end gap-1">
          {badge && (
            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-extrabold text-slate-800 shadow-sm">
              {badge}
            </span>
          )}
          {trend && (
            <div
              className={cn(
                'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-extrabold shadow-sm',
                trend.isPositive !== false
                  ? 'bg-emerald-100/90 text-emerald-800'
                  : 'bg-rose-100/90 text-rose-800',
              )}
            >
              {trend.isPositive !== false ? (
                <TrendingUp size={12} className="stroke-[2.5]" />
              ) : (
                <TrendingDown size={12} className="stroke-[2.5]" />
              )}
              <span>{trend.value}</span>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Big Value */}
      <div className="mt-3">
        <p className="font-display text-3xl font-black tracking-tight text-text">{value}</p>
        <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-muted opacity-80">{label}</p>
      </div>

      {/* Bottom: Sparkline or Subtext */}
      <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[11px]">
        {subtext && <span className="truncate font-semibold text-muted">{subtext}</span>}
        {sparklineData && sparklineData.length > 1 && (
          <div className="ml-auto">
            <MiniSparkline data={sparklineData} color={style.sparkline} />
          </div>
        )}
      </div>
    </div>
  )
}
