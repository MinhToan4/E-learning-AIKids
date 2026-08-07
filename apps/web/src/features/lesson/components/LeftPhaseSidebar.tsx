import React, { useState } from 'react'
import { BookOpen, Gamepad2, PencilLine, ShieldCheck, Lightbulb, RotateCcw } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
import { LectureVideo } from '@/features/lesson/components/LectureVideo'
import { Button } from '@/shared/components/ui/Button'

export type Phase = 'learn' | 'game' | 'practice' | 'check' | 'done'
type PoseType = 'support' | 'guide' | 'welcome' | 'thinking' | 'celebrate'

interface Props {
  currentPhase: Phase
  maxUnlockedPhase: Phase
  onPhaseSelect: (phase: Phase) => void
  className?: string
  guideCopy: {
    eyebrow: string
    title: string
    body: string
    pose: PoseType
  }
  videoUrl?: string | null
  videoTitle?: string
}

const PHASES = [
  { id: 'learn' as const, label: 'Khám phá', icon: BookOpen },
  { id: 'game' as const, label: 'Thử cùng Mee', icon: Gamepad2 },
  { id: 'practice' as const, label: 'Tự tay làm', icon: PencilLine },
  { id: 'check' as const, label: 'Thử thách', icon: ShieldCheck },
]

const PHASE_ORDER = ['learn', 'game', 'practice', 'check', 'done']

export function LeftPhaseSidebar({ currentPhase, maxUnlockedPhase, onPhaseSelect, className, guideCopy, videoUrl, videoTitle }: Props) {
  const maxIdx = PHASE_ORDER.indexOf(maxUnlockedPhase === 'done' ? 'check' : maxUnlockedPhase)
  const currentIdx = PHASE_ORDER.indexOf(currentPhase === 'done' ? 'check' : currentPhase)
  const [showHint, setShowHint] = useState(false)

  return (
    <aside className={cn(
      'w-[320px] flex flex-col gap-6 items-center justify-start text-center shrink-0 h-full overflow-y-auto hidden-scrollbar',
      className
    )}>
      <div className="lesson-guide-panel flex flex-col items-center justify-start text-center w-full" aria-labelledby="lesson-guide-title">
        <AikidCatCharacter
          pose={guideCopy.pose}
          className="lesson-guide-cat w-28 h-28 object-contain drop-shadow-md z-10 mx-auto"
        />
        
        <div className="relative w-full mt-2 rounded-[1.5rem] border-2 border-brand-100 bg-brand-50 p-4 shadow-sm text-center">
          <div className="absolute -top-3 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-brand-100 bg-brand-50" />
          
          <p className="text-xs font-extrabold text-coral-600 mb-1">{guideCopy.eyebrow}</p>
          <h2 id="lesson-guide-title" className="font-display text-lg text-text leading-tight">{guideCopy.title}</h2>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-muted">{guideCopy.body}</p>

          {showHint && (
            <div className="mt-3 p-3 rounded-xl bg-sun-50 border border-sun-200 text-sm text-left animate-pop">
              <p className="font-bold text-warning flex items-center gap-1"><Lightbulb size={16} /> Gợi ý từ Mee</p>
              <p className="text-muted mt-1">Con hãy để ý kỹ các chi tiết, không sao nếu cần thử lại nhiều lần nhé!</p>
            </div>
          )}
        </div>

        {videoUrl && (
          <div className="mt-4 w-full shadow-sm animate-fade-up">
            <LectureVideo title={videoTitle || ''} url={videoUrl} />
          </div>
        )}

        {/* Action Board */}
        <div className="mt-4 flex flex-wrap gap-2 w-full justify-center">
          <Button variant="secondary" onClick={() => setShowHint(!showHint)}>
            <Lightbulb size={16} className="mr-1" />
            {showHint ? 'Ẩn gợi ý' : 'Gợi ý'}
          </Button>
          {videoUrl && (
            <Button variant="ghost" onClick={() => setShowHint(false)}>
              <RotateCcw size={16} className="mr-1" />
              Xem lại
            </Button>
          )}
        </div>
      </div>

      <nav className="flex sm:flex-col gap-2 sm:gap-4 mt-auto w-full items-center pb-4">
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
    </aside>
  )
}
