import { cn } from '@/shared/lib/cn'

type PageMotionProps = {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function PageMotion({ children, className, style }: PageMotionProps) {
  return (
    <div className={cn('page-enter', className)} style={style}>
      {children}
    </div>
  )
}
