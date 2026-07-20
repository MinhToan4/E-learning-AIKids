import { cn } from '@/shared/lib/cn'
import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({
  className,
  variant = 'primary',
  children,
  ...rest
}: Props) {
  return (
    <button
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
}
