import { useEffect, useState } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

type Props = {
  durationMinutes: number
  onTimeUp?: () => void
  paused?: boolean
  className?: string
}

export function AsmoExamTimer({
  durationMinutes,
  onTimeUp,
  paused = false,
  className,
}: Props) {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60)

  useEffect(() => {
    setSecondsLeft(durationMinutes * 60)
  }, [durationMinutes])

  useEffect(() => {
    if (paused || secondsLeft <= 0) return

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          if (onTimeUp) onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [paused, secondsLeft, onTimeUp])

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  const totalSeconds = durationMinutes * 60
  const pct = Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100))
  const isWarning = secondsLeft < 300 // < 5 mins
  const isUrgent = secondsLeft < 60 // < 1 min

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl px-4 py-2 border shadow-xs transition-colors backdrop-blur-md',
        isUrgent
          ? 'bg-coral-50 border-coral-300 text-coral-700 animate-pulse'
          : isWarning
            ? 'bg-sun-50 border-sun-300 text-amber-800'
            : 'bg-white/90 border-slate-200 text-slate-800',
        className,
      )}
    >
      <div className="flex items-center gap-1.5 font-mono text-sm sm:text-base font-extrabold tracking-wider">
        {isUrgent ? (
          <AlertTriangle className="size-4 text-coral-600 animate-bounce" />
        ) : (
          <Clock className="size-4 text-brand-600" />
        )}
        <span>{formatted}</span>
      </div>

      {/* Mini Progress Bar */}
      <div className="w-16 sm:w-24 h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-1000 rounded-full',
            isUrgent ? 'bg-coral-500' : isWarning ? 'bg-amber-500' : 'bg-brand-500',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
