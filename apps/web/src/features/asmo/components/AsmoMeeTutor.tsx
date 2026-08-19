import { useState } from 'react'
import { Sparkles, Lightbulb, MessageCircle } from 'lucide-react'
import { AikidCatCharacter, type AikidCatPose } from '@/shared/components/ui/AikidCatCharacter'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

type Props = {
  pose?: AikidCatPose
  speech: string
  hint?: string
  onAskHint?: () => void
  showHintButton?: boolean
  className?: string
  compact?: boolean
}

export function AsmoMeeTutor({
  pose = 'guide',
  speech,
  hint,
  onAskHint,
  showHintButton = true,
  className,
  compact = false,
}: Props) {
  const [hintRevealed, setHintRevealed] = useState(false)

  const handleHintClick = () => {
    setHintRevealed(true)
    if (onAskHint) onAskHint()
  }

  return (
    <div
      className={cn(
        'relative flex items-start gap-4 rounded-3xl border border-brand-200/80 bg-gradient-to-br from-brand-50/90 via-sky-50/70 to-sun-50/80 p-4 shadow-sm backdrop-blur-md sm:p-5',
        compact && 'p-3 sm:p-3.5',
        className,
      )}
    >
      {/* Mèo Mee Avatar with Badge */}
      <div className="relative shrink-0 flex flex-col items-center">
        <div className="relative size-16 sm:size-20 rounded-2xl bg-white/80 p-1.5 shadow-inner border border-brand-100 flex items-center justify-center overflow-hidden">
          <AikidCatCharacter
            pose={pose}
            className="size-full object-contain drop-shadow-sm transition-transform duration-300 hover:scale-110"
          />
        </div>
        <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
          <Sparkles className="size-2.5" /> Mèo Mee
        </span>
      </div>

      {/* Speech Bubble */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <MessageCircle className="size-3.5 text-brand-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
            Lời Khuyên Từ Trợ Giảng AI
          </span>
        </div>

        <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
          {speech}
        </p>

        {/* Revealed Hint or Hint Button */}
        {hint && (
          <div className="mt-3">
            {hintRevealed ? (
              <div className="rounded-2xl border border-sun-300 bg-sun-50/90 p-3 text-xs sm:text-sm text-amber-900 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200 shadow-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-1">
                  <Lightbulb className="size-4 text-amber-600" />
                  <span>Manh mối tư duy:</span>
                </div>
                {hint}
              </div>
            ) : showHintButton ? (
              <Button
                type="button"
                variant="secondary"
                onClick={handleHintClick}
                className="gap-1.5 rounded-xl border border-sun-200 bg-white/80 py-1.5 px-3 text-xs font-bold text-amber-700 hover:bg-sun-50 shadow-xs"
              >
                <Lightbulb className="size-3.5 text-amber-500" />
                Mee ơi, gợi ý cho con nhé!
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
