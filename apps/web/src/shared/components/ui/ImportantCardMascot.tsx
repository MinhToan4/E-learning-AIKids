import { AikidCatCharacter, type AikidCatPose } from './AikidCatCharacter'
import { cn } from '@/shared/lib/cn'

export function ImportantCardMascot({
  pose = 'welcome',
  className,
}: {
  pose?: AikidCatPose
  className?: string
}) {
  return (
    <span className={cn('important-card-mascot', className)} aria-hidden="true">
      <AikidCatCharacter pose={pose} />
    </span>
  )
}
