import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'

const LINES = [
  'Giỏi quá!',
  'Tuyệt vời!',
  'Con làm được rồi!',
  'Sao sáng lắm!',
  'Cứ thế này nhé!',
  'Siêu đấy!',
]

export function useCheer() {
  const [cheer, setCheer] = useState<string | null>(null)

  const fire = (custom?: string) => {
    setCheer(custom ?? LINES[Math.floor(Math.random() * LINES.length)])
  }

  useEffect(() => {
    if (!cheer) return
    const t = window.setTimeout(() => setCheer(null), 1800)
    return () => window.clearTimeout(t)
  }, [cheer])

return { cheer, fire }
}

export function CheerOverlay({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[180] flex items-center justify-center"
      aria-live="polite"
    >
      <div
        className={cn(
          'rounded-[2rem] border-4 border-white bg-gradient-to-br from-sun-100 via-white to-mint-100',
          'px-8 py-5 font-display text-3xl text-brand-600 shadow-clay sm:text-4xl',
          'animate-soft-pulse',
        )}
      >
        ⭐ {message} ⭐
      </div>
    </div>
  )
}
