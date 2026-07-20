import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'

type PageMotionProps = {
  children: React.ReactNode
  className?: string
}

/**
 * Short page enter transition. Honors prefers-reduced-motion.
 * Prefer wrapping page roots only — not every nested card.
 */
export function PageMotion({ children, className }: PageMotionProps) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
