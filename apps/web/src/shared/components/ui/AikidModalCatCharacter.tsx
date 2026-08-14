import { designerAssets } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'

export function AikidModalCatCharacter({ className }: { className?: string }) {
  return (
    <img
      src={designerAssets.brand.modalMascot}
      alt=""
      aria-hidden="true"
      decoding="async"
      draggable={false}
      className={cn('object-contain', className)}
    />
  )
}
