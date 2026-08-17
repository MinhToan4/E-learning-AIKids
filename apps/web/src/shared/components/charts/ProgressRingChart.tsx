import { useId } from 'react'
import { cn } from '@/shared/lib/cn'

type ProgressRingChartProps = {
  percent: number
  size?: number
  strokeWidth?: number
  label?: string
  sublabel?: string
  color?: 'brand' | 'sky' | 'mint' | 'sun' | 'coral'
  icon?: React.ReactNode
  className?: string
}

const RING_COLORS = {
  brand: {
    start: '#8B7FFD',
    end: '#6D5EFC',
    text: 'text-brand-600',
    bg: '#EBE8FF',
  },
  sky: {
    start: '#68CEFF',
    end: '#3DBFFF',
    text: 'text-sky-600',
    bg: '#E0F4FF',
  },
  mint: {
    start: '#68E4B4',
    end: '#3ED9A0',
    text: 'text-emerald-600',
    bg: '#DDF9EE',
  },
  sun: {
    start: '#FFD777',
    end: '#FFC94A',
    text: 'text-amber-600',
    bg: '#FFF4D6',
  },
  coral: {
    start: '#FF97AC',
    end: '#FF7B93',
    text: 'text-rose-600',
    bg: '#FFE8ED',
  },
}

export function ProgressRingChart({
  percent,
  size = 130,
  strokeWidth = 10,
  label,
  sublabel,
  color = 'brand',
  icon,
  className,
}: ProgressRingChartProps) {
  const ringId = useId()
  const c = RING_COLORS[color]

  const clampedPercent = Math.min(Math.max(percent, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[-90deg] transform"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`ringGrad-${ringId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={c.start} />
              <stop offset="100%" stopColor={c.end} />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={c.bg}
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Animated Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#ringGrad-${ringId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          {icon && <div className="mb-0.5 opacity-80">{icon}</div>}
          <span className={cn('font-display text-xl font-black leading-none', c.text)}>
            {Math.round(clampedPercent)}%
          </span>
          {label && (
            <span className="mt-1 line-clamp-1 max-w-[80px] text-[10px] font-bold text-muted">
              {label}
            </span>
          )}
        </div>
      </div>

      {sublabel && (
        <p className="mt-2 text-center text-xs font-bold text-muted">{sublabel}</p>
      )}
    </div>
  )
}
