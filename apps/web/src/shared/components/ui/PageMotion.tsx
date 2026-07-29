import { cn } from '@/shared/lib/cn'

type PageMotionProps = {
  children: React.ReactNode
  className?: string
}

export function PageMotion({ children, className }: PageMotionProps) {
  return (
    <div className={cn('page-enter', className)}>
      {children}
    </div>
  )
}
