import { AikidModalCatCharacter } from '@/shared/components/ui/AikidModalCatCharacter'
import { cn } from '@/shared/lib/cn'
import type { Gesture } from '@/features/mee-rig/hooks/useMeeCatSpeech'

export type MeeTutorPose = 'support' | 'guide' | 'welcome' | 'thinking' | 'celebrate' | 'idea'

const POSE_LABELS: Record<MeeTutorPose, string> = {
  welcome: 'Mee đang chào con',
  guide: 'Mee đang hướng dẫn',
  thinking: 'Mee đang cùng con suy nghĩ',
  support: 'Mee đang động viên con',
  celebrate: 'Mee đang chúc mừng con',
  idea: 'Mee có ý tưởng mới',
}

type Props = {
  pose: MeeTutorPose
  className?: string
  isSpeaking?: boolean
  speechText?: string
  gesture?: Gesture
  onSpeechEnd?: () => void
}

export function MeeTutorAvatar({ pose, className, isSpeaking, speechText, gesture, onSpeechEnd }: Props) {
  return (
    <span
      key={pose}
      className={cn('mee-tutor-avatar', `mee-tutor-avatar--${pose}`, className)}
      role="img"
      aria-label={POSE_LABELS[pose]}
      data-pose={pose}
    >
      <AikidModalCatCharacter
        className="mee-tutor-avatar__character size-full object-contain drop-shadow-sm"
        state={isSpeaking ? 'talk' : pose === 'celebrate' ? 'celebrate' : (pose === 'support' || pose === 'idea') ? 'hint' : 'idle'}
        isSpeaking={isSpeaking}
        speechText={speechText}
        gesture={gesture ?? (pose === 'idea' ? 'idea' : undefined)}
        onSpeechEnd={onSpeechEnd}
      />
      <span className="mee-tutor-avatar__accent" aria-hidden="true" />
    </span>
  )
}

export { POSE_LABELS as MEE_TUTOR_POSE_LABELS }
