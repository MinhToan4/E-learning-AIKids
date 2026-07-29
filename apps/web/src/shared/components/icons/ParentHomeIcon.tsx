type ParentHomeIconProps = {
  size?: number
  className?: string
}

export function ParentHomeIcon({
  size = 24,
  className = '',
}: ParentHomeIconProps) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{ fontSize: size, lineHeight: 1 }}
    >
      🏠
    </span>
  )
}
