import React, { useState } from 'react'
import { Dices, Sparkles } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { playInstantSound } from '../../LessonInteractiveSidebar'

export interface SurpriseRollButtonProps {
  onRoll: () => void
  disabled?: boolean
  label?: string
  className?: string
}

export const SurpriseRollButton: React.FC<SurpriseRollButtonProps> = ({
  onRoll,
  disabled = false,
  label = 'Xúc Xắc Ma Thuật 🎲',
  className,
}) => {
  const [isRolling, setIsRolling] = useState(false)

  const handleRoll = () => {
    if (disabled || isRolling) return
    setIsRolling(true)
    playInstantSound('star')
    onRoll()

    setTimeout(() => {
      setIsRolling(false)
    }, 450)
  }

  return (
    <button
      type="button"
      data-testid="surprise-roll-btn"
      onClick={handleRoll}
      disabled={disabled || isRolling}
      title="Tung xúc xắc để AKI phối ngẫu nhiên các thẻ cho bé!"
      className={cn(
        'group relative min-h-[44px] px-3.5 py-2 rounded-2xl font-black text-xs sm:text-sm',
        'bg-linear-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500',
        'text-amber-950 border-2 border-amber-500/60 shadow-xs hover:shadow-md active:scale-95 transition-all duration-150',
        'inline-flex items-center justify-center gap-2 select-none cursor-pointer',
        (disabled || isRolling) && 'opacity-60 cursor-not-allowed active:scale-100',
        className
      )}
    >
      <Dices
        size={18}
        className={cn(
          'text-amber-950 transition-transform duration-300 group-hover:rotate-45',
          isRolling && 'animate-spin'
        )}
      />
      <span>{label}</span>
      <Sparkles size={14} className="text-amber-800 opacity-75 group-hover:scale-125 transition-transform" />
    </button>
  )
}
