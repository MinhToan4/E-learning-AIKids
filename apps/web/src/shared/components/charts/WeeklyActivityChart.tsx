import React, { useState, useId } from 'react'
import { cn } from '@/shared/lib/cn'

export type DayActivity = {
  day: string          // e.g. 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'
  label: string        // e.g. 'Thứ 2', 'Thứ 3'
  count: number        // Activity count / completed quests / active count
  target?: number      // Daily target
  isToday?: boolean
  detail?: string      // e.g. '18 bài hoàn thành'
}

type WeeklyActivityChartProps = {
  title?: string
  subtitle?: string
  data: DayActivity[]
  unit?: string
  dailyTarget?: number
  accentColor?: 'brand' | 'sky' | 'mint' | 'sun' | 'coral'
  className?: string
}

const COLOR_MAP = {
  brand: {
    barTop: '#8B7FFD',
    barBottom: '#6D5EFC',
    barHover: '#5646E8',
    glow: 'rgba(109, 94, 252, 0.25)',
    activeText: 'text-brand-600',
    todayBg: 'bg-brand-500 text-white',
    border: 'border-brand-200',
  },
  sky: {
    barTop: '#68CEFF',
    barBottom: '#3DBFFF',
    barHover: '#1AAFF5',
    glow: 'rgba(61, 191, 255, 0.25)',
    activeText: 'text-sky-600',
    todayBg: 'bg-sky-500 text-white',
    border: 'border-sky-200',
  },
  mint: {
    barTop: '#68E4B4',
    barBottom: '#3ED9A0',
    barHover: '#28C48B',
    glow: 'rgba(62, 217, 160, 0.25)',
    activeText: 'text-emerald-600',
    todayBg: 'bg-emerald-500 text-white',
    border: 'border-emerald-200',
  },
  sun: {
    barTop: '#FFD777',
    barBottom: '#FFC94A',
    barHover: '#E8B132',
    glow: 'rgba(255, 201, 74, 0.25)',
    activeText: 'text-amber-600',
    todayBg: 'bg-amber-500 text-white',
    border: 'border-amber-200',
  },
  coral: {
    barTop: '#FF97AC',
    barBottom: '#FF7B93',
    barHover: '#E8617B',
    glow: 'rgba(255, 123, 147, 0.25)',
    activeText: 'text-rose-600',
    todayBg: 'bg-rose-500 text-white',
    border: 'border-rose-200',
  },
}

export function WeeklyActivityChart({
  title = 'Nhịp độ học tập trong tuần',
  subtitle = 'Số nhiệm vụ hoàn thành mỗi ngày',
  data,
  unit = 'bài',
  dailyTarget,
  accentColor = 'brand',
  className,
}: WeeklyActivityChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const chartId = useId()
  const c = COLOR_MAP[accentColor]

  const maxVal = Math.max(...data.map((d) => d.count), dailyTarget ?? 0, 8)
  const totalCount = data.reduce((sum, d) => sum + d.count, 0)
  const peakDay = data.reduce((prev, curr) => (curr.count > prev.count ? curr : prev), data[0] || { day: '', count: 0, label: '' })

  return (
    <div
      className={cn(
        'ui-card flex flex-col justify-between p-5 transition hover:shadow-md',
        className,
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
        <div>
          <h3 className="font-display text-base font-bold text-text">{title}</h3>
          <p className="text-xs text-muted">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-extrabold text-brand-600">
            Tổng: {totalCount} {unit}
          </span>
          {peakDay && peakDay.count > 0 && (
            <span className="hidden sm:inline-flex rounded-full bg-sun-100 px-2.5 py-1 text-xs font-bold text-amber-800">
              ⚡ Cao điểm: {peakDay.label} ({peakDay.count})
            </span>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative mt-5 flex h-48 w-full items-end justify-between gap-2 pt-6 sm:gap-3">
        {/* SVG Gradient Definition */}
        <svg className="absolute h-0 w-0" aria-hidden="true">
          <defs>
            <linearGradient id={`barGrad-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.barTop} />
              <stop offset="100%" stopColor={c.barBottom} />
            </linearGradient>
            <linearGradient id={`barGradHover-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.barHover} />
              <stop offset="100%" stopColor={c.barBottom} />
            </linearGradient>
          </defs>
        </svg>

        {/* Target Line (if specified) */}
        {dailyTarget && dailyTarget > 0 && (
          <div
            className="pointer-events-none absolute left-0 right-0 z-0 border-b border-dashed border-muted/40"
            style={{
              bottom: `calc(${(dailyTarget / maxVal) * 80}% + 28px)`,
            }}
          >
            <span className="absolute -top-4 right-0 rounded bg-muted/15 px-1.5 py-0.5 text-[10px] font-bold text-muted">
              Mục tiêu: {dailyTarget}
            </span>
          </div>
        )}

        {/* Bars */}
        {data.map((item, idx) => {
          const heightPercent = maxVal > 0 ? Math.max((item.count / maxVal) * 100, 6) : 6
          const isHovered = hoveredIdx === idx
          const isPeak = peakDay?.day === item.day && item.count > 0

          return (
            <div
              key={item.day}
              className="group relative flex flex-1 flex-col items-center justify-end h-full cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              tabIndex={0}
              role="button"
              aria-label={`${item.label}: ${item.count} ${unit}`}
            >
              {/* Tooltip Popup */}
              {isHovered && (
                <div
                  className="pointer-events-none absolute -top-12 z-20 flex flex-col items-center rounded-xl bg-slate-900 px-2.5 py-1.5 text-center text-white shadow-xl animate-in fade-in zoom-in-95 duration-150"
                  style={{ minWidth: '84px' }}
                >
                  <span className="text-[10px] font-medium text-slate-300">{item.label}</span>
                  <span className="font-display text-xs font-bold text-amber-300">
                    {item.count} {unit}
                  </span>
                  <div className="absolute -bottom-1 h-2 w-2 rotate-45 bg-slate-900" />
                </div>
              )}

              {/* Bar Value on top when not hovered */}
              <span
                className={cn(
                  'mb-1.5 text-[11px] font-extrabold transition duration-150',
                  item.count > 0 ? 'opacity-90' : 'opacity-30',
                  isHovered ? 'scale-110 font-black' : '',
                  isPeak ? c.activeText : 'text-muted',
                )}
              >
                {item.count}
              </span>

              {/* The Visual Bar */}
              <div className="relative w-full max-w-[42px] overflow-hidden rounded-t-xl bg-slate-100 dark:bg-slate-800">
                <div
                  className={cn(
                    'w-full rounded-t-xl transition-all duration-500 ease-out',
                    isHovered ? 'scale-y-[1.02] shadow-lg' : '',
                  )}
                  style={{
                    height: `${heightPercent * 1.3}px`,
                    maxHeight: '130px',
                    minHeight: item.count > 0 ? '12px' : '4px',
                    background: isHovered ? `url(#barGradHover-${chartId})` : `url(#barGrad-${chartId})`,
                    boxShadow: isHovered ? `0 4px 14px ${c.glow}` : 'none',
                  }}
                />
              </div>

              {/* Day Label & Badge */}
              <div className="mt-2 flex flex-col items-center">
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-bold transition',
                    item.isToday
                      ? c.todayBg
                      : isHovered
                      ? 'bg-slate-200 text-slate-900 font-extrabold'
                      : 'text-muted',
                  )}
                >
                  {item.day}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
