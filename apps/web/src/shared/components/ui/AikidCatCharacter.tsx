import { cn } from '@/shared/lib/cn'

export type AikidCatPose =
  | 'welcome'
  | 'guide'
  | 'walking'
  | 'thinking'
  | 'celebrate'
  | 'support'

const ORIGINAL_CAT_POSES: Record<AikidCatPose, string> = {
  welcome: '/assets/aikid-ui/mascot-original/course-wave.webp',
  guide: '/assets/aikid-ui/mascot-original/course-wave.webp',
  walking: '/assets/aikid-ui/mascot-original/world-walking.webp',
  thinking: '/assets/designer/brand/modal-cat-original.webp',
  celebrate: '/assets/aikid-ui/mascot-original/world-celebrate.webp',
  support: '/assets/aikid-ui/mascot-original/course-wave.webp',
}

export function AikidCatCharacter({
  pose = 'welcome',
  className,
}: {
  pose?: AikidCatPose
  className?: string
}) {
  return (
    <img
      src={ORIGINAL_CAT_POSES[pose]}
      alt=""
      aria-hidden="true"
      decoding="async"
      draggable={false}
      className={cn('aikid-cat-character', className)}
    />
  )
}
