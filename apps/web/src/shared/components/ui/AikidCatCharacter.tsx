import { cn } from '@/shared/lib/cn'
import {
  MeeCatInteractiveCanvas,
  type MeeCatState,
  type MeeCatVariant,
} from '@/features/mee-rig/components/MeeCatInteractiveCanvas'
import type { Gesture, Viseme } from '@/features/mee-rig/hooks/useMeeCatSpeech'

export type AikidCatPose =
  | 'welcome'
  | 'guide'
  | 'walking'
  | 'thinking'
  | 'celebrate'
  | 'support'
  | 'eat'
  | 'sleepy'
  | 'talk'

const POSE_TO_STATE_MAP: Record<AikidCatPose, MeeCatState> = {
  welcome: 'hint',
  guide: 'look',
  walking: 'idle',
  thinking: 'look',
  celebrate: 'celebrate',
  support: 'hint',
  eat: 'eat',
  sleepy: 'sleepy',
  talk: 'talk',
}

export interface AikidCatCharacterProps {
  pose?: AikidCatPose
  variant?: MeeCatVariant
  quote?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | string
  isSpeaking?: boolean
  speechText?: string
  gesture?: Gesture
  viseme?: Viseme
  onSpeechEnd?: () => void
  animated?: boolean
}

const POSE_TO_GESTURE_MAP: Partial<Record<AikidCatPose, Gesture>> = {
  welcome: 'explain',
  guide: 'point-left',
  walking: 'presentation',
  thinking: 'think',
  celebrate: 'celebrate-2',
  support: 'idea',
  talk: 'presentation',
}

export function AikidCatCharacter({
  pose = 'welcome',
  variant = 'full-body',
  quote,
  className,
  size,
  isSpeaking,
  speechText,
  gesture,
  viseme,
  onSpeechEnd,
  animated,
}: AikidCatCharacterProps) {
  const catState = POSE_TO_STATE_MAP[pose] || 'idle'
  const effectiveGesture = gesture || POSE_TO_GESTURE_MAP[pose] || 'presentation'
  const sizeClass = size === 'sm' ? 'w-16 h-16' : size === 'md' ? 'w-20 h-20 sm:w-24 sm:h-24' : size === 'lg' ? 'w-28 h-28 sm:w-32 sm:h-32' : ''

  return (
    <div
      className={cn('aikid-cat-character inline-flex items-center justify-center', sizeClass, className)}
      data-testid="aikid-cat-character"
      data-pose={pose}
      data-size={size}
    >
      <MeeCatInteractiveCanvas
        state={catState}
        variant={variant}
        quote={quote}
        isSpeaking={isSpeaking}
        speechText={speechText}
        gesture={effectiveGesture}
        viseme={viseme}
        onSpeechEnd={onSpeechEnd}
        animated={animated}
        transparentBackground
        className="h-full w-full"
      />
    </div>
  )
}
