import { cn } from '@/shared/lib/cn'

export type AikidCatPose =
  | 'welcome'
  | 'guide'
  | 'walking'
  | 'thinking'
  | 'celebrate'
  | 'support'

export function AikidCatCharacter({
  pose = 'welcome',
  className,
}: {
  pose?: AikidCatPose
  className?: string
}) {
  return (
    <img
      src={`/assets/aikid-ui/mascot-flat/${pose}.png`}
      alt=""
      aria-hidden="true"
      decoding="async"
      draggable={false}
      className={cn('aikid-cat-character', className)}
    />
  )
}
