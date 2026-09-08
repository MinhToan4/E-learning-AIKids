import { cn } from '@/shared/lib/cn'
import {
  MeeCatInteractiveCanvas,
  type MeeCatState,
  type MeeCatVariant,
} from '@/features/mee-rig/components/MeeCatInteractiveCanvas'
import type { Gesture } from '@/features/mee-rig/hooks/useMeeCatSpeech'

export function AikidModalCatCharacter({
  className,
  state = 'celebrate',
  variant = 'full-body',
  isSpeaking = false,
  speechText = '',
  gesture,
  onSpeechEnd,
}: {
  className?: string
  state?: MeeCatState
  variant?: MeeCatVariant
  isSpeaking?: boolean
  speechText?: string
  gesture?: Gesture
  onSpeechEnd?: () => void
}) {
  return (
    <div
      className={cn('aikid-modal-cat-character inline-flex items-center justify-center', className)}
      data-testid="aikid-modal-cat-character"
    >
      <MeeCatInteractiveCanvas
        state={state}
        variant={variant}
        transparentBackground
        isSpeaking={isSpeaking}
        speechText={speechText}
        gesture={gesture}
        onSpeechEnd={onSpeechEnd}
        className="h-full w-full"
      />
    </div>
  )
}
