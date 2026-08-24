import { cn } from '@/shared/lib/cn'
import {
  MeeCatInteractiveCanvas,
  type MeeCatState,
  type MeeCatVariant,
} from '@/features/mee-rig/components/MeeCatInteractiveCanvas'

export function AikidModalCatCharacter({
  className,
  state = 'celebrate',
  variant = 'full-body',
}: {
  className?: string
  state?: MeeCatState
  variant?: MeeCatVariant
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
        className="h-full w-full"
      />
    </div>
  )
}
