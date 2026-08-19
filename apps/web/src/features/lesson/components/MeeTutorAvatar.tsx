import { AikidModalCatCharacter } from '@/shared/components/ui/AikidModalCatCharacter'
import { cn } from '@/shared/lib/cn'

export type MeeTutorPose = 'support' | 'guide' | 'welcome' | 'thinking' | 'celebrate'

const POSE_LABELS: Record<MeeTutorPose, string> = {
  welcome: 'Mee đang chào con',
  guide: 'Mee đang hướng dẫn',
  thinking: 'Mee đang cùng con suy nghĩ',
  support: 'Mee đang động viên con',
  celebrate: 'Mee đang chúc mừng con',
}

type Props = {
  pose: MeeTutorPose
  className?: string
}

export function MeeTutorAvatar({ pose, className }: Props) {
  return (
    <span
      key={pose}
      className={cn('mee-tutor-avatar', `mee-tutor-avatar--${pose}`, className)}
      role="img"
      aria-label={POSE_LABELS[pose]}
      data-pose={pose}
    >
      <AikidModalCatCharacter className="mee-tutor-avatar__character size-full object-contain drop-shadow-sm" />
      <span className="mee-tutor-avatar__accent" aria-hidden="true" />
    </span>
  )
}

export { POSE_LABELS as MEE_TUTOR_POSE_LABELS }
