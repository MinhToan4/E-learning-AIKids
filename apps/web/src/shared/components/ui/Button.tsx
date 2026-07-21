import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = 'primary', children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'ui-btn',
        variant === 'primary' && 'ui-btn-primary',
        variant === 'secondary' && 'ui-btn-secondary',
        variant === 'ghost' && 'ui-btn-ghost',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
})
