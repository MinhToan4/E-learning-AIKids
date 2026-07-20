import { designerAssets } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'

type Props = {
  /** height class — wide wordmark scales by height only */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  /** decorative only when true */
  decorative?: boolean
}

const HEIGHT: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-8',
  md: 'h-11',
  lg: 'h-14',
  xl: 'h-16 md:h-20',
}

/**
 * AIKid wordmark — no border / no rounded box / no clay shadow.
 * Logo SVG is wide; constrain by height and let width flow.
 */
export function BrandLogo({
  size = 'md',
  className,
  decorative = false,
}: Props) {
  return (
    <img
      src={designerAssets.brand.logo}
      alt={decorative ? '' : 'AIKid'}
      aria-hidden={decorative || undefined}
      draggable={false}
      className={cn(
        'w-auto max-w-[min(100%,220px)] object-contain object-left select-none',
        HEIGHT[size],
        className,
      )}
    />
  )
}
