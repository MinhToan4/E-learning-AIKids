import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const variants = {
  primary:
    'bg-brand-500 text-white shadow-clay hover:bg-brand-600 active:translate-y-0.5 active:shadow-press',
  secondary:
    'bg-white text-text border-2 border-border shadow-soft hover:border-brand-500 hover:bg-brand-50',
  soft: 'bg-brand-100 text-brand-600 hover:bg-brand-50',
  ghost: 'bg-transparent text-text hover:bg-white/80',
  danger: 'bg-coral-100 text-danger border border-coral-400/40 hover:bg-coral-100/80',
  success: 'bg-mint-100 text-success hover:bg-mint-400/20',
} as const

const sizes = {
  sm: 'min-h-11 px-4 text-sm gap-1.5 font-extrabold',
  md: 'min-h-12 px-5 text-base gap-2 font-extrabold',
  lg: 'min-h-14 px-6 text-lg gap-2 font-extrabold sm:px-8',
} as const

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth,
      disabled,
      type = 'button',
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center rounded-[var(--radius-btn)] font-semibold transition-all duration-200',
        'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
)

Button.displayName = 'Button'
