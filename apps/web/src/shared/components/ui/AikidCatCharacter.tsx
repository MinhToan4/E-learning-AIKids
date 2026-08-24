import { cn } from '@/shared/lib/cn'
import {
  MeeCatInteractiveCanvas,
  type MeeCatState,
  type MeeCatVariant,
} from '@/features/mee-rig/components/MeeCatInteractiveCanvas'

export type AikidCatPose =
  | 'welcome'
  | 'guide'
  | 'walking'
  | 'thinking'
  | 'celebrate'
  | 'support'
  | 'eat'
  | 'sleepy'

const POSE_TO_STATE_MAP: Record<AikidCatPose, MeeCatState> = {
  welcome: 'hint',
  guide: 'look',
  walking: 'idle',
  thinking: 'look',
  celebrate: 'celebrate',
  support: 'hint',
  eat: 'eat',
  sleepy: 'sleepy',
}

export function AikidCatCharacter({
  pose = 'welcome',
  variant = 'full-body',
  quote,
  className,
}: {
  pose?: AikidCatPose
  variant?: MeeCatVariant
  quote?: string
  className?: string
}) {
  const catState = POSE_TO_STATE_MAP[pose] || 'idle'

  return (
    <div
      className={cn('aikid-cat-character inline-flex items-center justify-center', className)}
      data-testid="aikid-cat-character"
      data-pose={pose}
    >
      <MeeCatInteractiveCanvas
        state={catState}
        variant={variant}
        quote={quote}
        transparentBackground
        className="h-full w-full"
      />
    </div>
  )
}
