import React from 'react'
import { BookOpen, Gamepad2, PencilLine, ShieldCheck } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export type Phase = 'learn' | 'game' | 'practice' | 'check' | 'done'

interface Props {
  currentPhase: Phase
  maxUnlockedPhase: Phase
  onPhaseSelect: (phase: Phase) => void
  className?: string
}

const PHASES = [
  { id: 'learn' as const, label: 'Khám phá', icon: BookOpen },
  { id: 'game' as const, label: 'Thử cùng Mee', icon: Gamepad2 },
  { id: 'practice' as const, label: 'Tự tay làm', icon: PencilLine },
  { id: 'check' as const, label: 'Thử thách', icon: ShieldCheck },
]

const PHASE_ORDER = ['learn', 'game', 'practice', 'check', 'done']

export function LeftPhaseSidebar({ currentPhase, maxUnlockedPhase, onPhaseSelect, className }: Props) {
  const maxIdx = PHASE_ORDER.indexOf(maxUnlockedPhase === 'done' ? 'check' : maxUnlockedPhase)
  const currentIdx = PHASE_ORDER.indexOf(currentPhase === 'done' ? 'check' : currentPhase)

  return (
    <nav className={cn(
      'flex sm:flex-col gap-2 sm:gap-4',
      className
    )}>
      {PHASES.map((phase, idx) => {
        const Icon = phase.icon
        const isUnlocked = idx <= maxIdx
        const isActive = idx === currentIdx

        return (
          <button
            key={phase.id}
            onClick={() => {
              if (isUnlocked) onPhaseSelect(phase.id)
            }}
            disabled={!isUnlocked}
            title={phase.label}
            className={cn(
              'relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl transition-all duration-200',
              isActive
                ? 'bg-brand-500 text-white shadow-clay scale-110 z-10'
                : isUnlocked
                  ? 'bg-white text-brand-600 hover:bg-brand-50 shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
            )}
          >
            <Icon size={isActive ? 24 : 20} className={cn(isActive && 'animate-pop')} />
          </button>
        )
      })}
    </nav>
  )
}
