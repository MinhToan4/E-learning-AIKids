import React, { useState } from 'react'
import { Dices, Sparkles, Shuffle } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { playInstantSound } from '../../LessonInteractiveSidebar'
import type { CreativeEngineMode } from '../types'
import { ENGINE_CONFIGS, getRandomCreativeEngineMode } from '../data/engine-presets'

export interface ShuffleEngineButtonProps {
  currentMode: CreativeEngineMode
  onShuffle: (nextMode: CreativeEngineMode) => void
  disabled?: boolean
  className?: string
}

export const ShuffleEngineButton: React.FC<ShuffleEngineButtonProps> = ({
  currentMode,
  onShuffle,
  disabled = false,
  className,
}) => {
  const [isSpinning, setIsSpinning] = useState(false)
  const [switchedName, setSwitchedName] = useState<string | null>(null)
  const timeoutsRef = React.useRef<ReturnType<typeof setTimeout>[]>([])

  React.useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
    }
  }, [])

  const handleShuffle = () => {
    if (disabled || isSpinning) return

    setIsSpinning(true)
    playInstantSound('star')

    const nextMode = getRandomCreativeEngineMode(currentMode)
    const nextConfig = ENGINE_CONFIGS[nextMode]
    setSwitchedName(nextConfig.shortName)

    onShuffle(nextMode)

    const t1 = setTimeout(() => {
      setIsSpinning(false)
    }, 500)

    const t2 = setTimeout(() => {
      setSwitchedName(null)
    }, 2400)
    timeoutsRef.current.push(t1, t2)
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        data-testid="shuffle-engine-btn"
        onClick={handleShuffle}
        disabled={disabled || isSpinning}
        title="Đổi ngay sang một mini game sáng tạo ngẫu nhiên khác!"
        aria-label="Đổi Engine Ngẫu Nhiên"
        className={cn(
          // Hallmark UI: Touch targets >= 48px, 2D Flat Soft Clay, Pastel Warm tone
          'group relative min-h-[48px] px-3.5 py-2.5 rounded-2xl font-black text-xs sm:text-sm select-none cursor-pointer',
          'bg-linear-to-r from-orange-100 via-amber-100 to-yellow-100 hover:from-orange-200 hover:to-yellow-200',
          'text-amber-950 border-2 border-amber-300 shadow-clay-sm hover:shadow-md active:scale-95 transition-all duration-150',
          'inline-flex items-center justify-center gap-2',
          (disabled || isSpinning) && 'opacity-60 cursor-not-allowed active:scale-100',
          className
        )}
      >
        <Dices
          size={20}
          className={cn(
            'text-amber-800 transition-transform duration-500 group-hover:rotate-90',
            isSpinning && 'animate-spin'
          )}
        />
        <span className="whitespace-nowrap">🎲 Đổi Engine Ngẫu Nhiên</span>
        <Sparkles
          size={16}
          className={cn(
            'text-amber-600 transition-all',
            isSpinning ? 'scale-125 rotate-45 text-amber-500' : 'opacity-80 group-hover:scale-110'
          )}
        />
      </button>

      {/* Hiệu ứng visual badge nảy vui tai khi chuyển engine thành công */}
      {switchedName && (
        <div
          data-testid="shuffle-toast"
          role="status"
          className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 px-3 py-1 bg-amber-900 text-amber-100 text-xs font-black rounded-full shadow-lg border border-amber-700 whitespace-nowrap animate-bounce pointer-events-none"
        >
          ✨ Đổi sang {switchedName}!
        </div>
      )}
    </div>
  )
}
