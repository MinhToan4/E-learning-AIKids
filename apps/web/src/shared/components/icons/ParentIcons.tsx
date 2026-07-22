import React from 'react'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  className?: string
}

/**
 * Custom High-End SVG Icon Suite for Parent Dashboard & Parent Controls.
 * Designed with rich gradient accents, soft shadows, and warm corporate-family tones.
 */

export function ParentDashboardIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} {...props}>
      <defs>
        <linearGradient id="pDashBg" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6C5CE7" />
          <stop offset="1" stopColor="#A29BFE" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="26" height="26" rx="8" fill="url(#pDashBg)" />
      {/* Bars */}
      <rect x="7" y="17" width="4" height="8" rx="2" fill="#FFFFFF" opacity="0.9" />
      <rect x="14" y="11" width="4" height="14" rx="2" fill="#FFEAA7" />
      <rect x="21" y="7" width="4" height="18" rx="2" fill="#55E6C1" />
    </svg>
  )
}

export function ParentKidsIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} {...props}>
      <defs>
        <linearGradient id="pKidsBg" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF7675" />
          <stop offset="1" stopColor="#E84393" />
        </linearGradient>
      </defs>
      {/* Background Badge */}
      <rect x="3" y="3" width="26" height="26" rx="8" fill="url(#pKidsBg)" />
      {/* Kid Head & Smile */}
      <circle cx="16" cy="13" r="6" fill="#FFF9E6" />
      <path d="M10 26C10.5 21.5 13 20 16 20C19 20 21.5 21.5 22 26" fill="#FFF9E6" />
      {/* Smiling eyes */}
      <circle cx="14" cy="12" r="0.9" fill="#2D3436" />
      <circle cx="18" cy="12" r="0.9" fill="#2D3436" />
      <path d="M14.5 15C15.2 15.6 16.8 15.6 17.5 15" stroke="#2D3436" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function ParentPlanIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} {...props}>
      <defs>
        <linearGradient id="pPlanBg" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDCB6E" />
          <stop offset="1" stopColor="#E17055" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="26" height="26" rx="8" fill="url(#pPlanBg)" />
      {/* Box Ribbon */}
      <path d="M7 13H25V24C25 25.6 23.6 27 22 27H10C8.4 27 7 25.6 7 24V13Z" fill="#FFFFFF" opacity="0.95" />
      <rect x="5" y="10" width="22" height="4" rx="2" fill="#FFEAA7" />
      <rect x="14" y="10" width="4" height="17" fill="#E84393" />
    </svg>
  )
}

export function ParentApprovalIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} {...props}>
      <defs>
        <linearGradient id="pApprBg" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00CEC9" />
          <stop offset="1" stopColor="#0984E3" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="26" height="26" rx="8" fill="url(#pApprBg)" />
      {/* Bell */}
      <path d="M16 8C12.7 8 10 10.7 10 14V19L8 21H24L22 19V14C22 10.7 19.3 8 16 8Z" fill="#FFFFFF" />
      <circle cx="16" cy="24" r="2" fill="#FFEAA7" />
      <circle cx="22" cy="9" r="3.5" fill="#FF7675" stroke="#FFFFFF" strokeWidth="1" />
    </svg>
  )
}

export function ParentProfileIcon({ size = 24, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} {...props}>
      <defs>
        <linearGradient id="pProfBg" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#636E72" />
          <stop offset="1" stopColor="#2D3436" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="26" height="26" rx="8" fill="url(#pProfBg)" />
      {/* Gear / User Avatar */}
      <circle cx="16" cy="12" r="5" fill="#FFEAA7" />
      <path d="M9 25C9.5 20.5 12.5 19 16 19C19.5 19 22.5 20.5 23 25" fill="#FFEAA7" />
    </svg>
  )
}

export function ShieldLockIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path d="M12 2L4 5V11C4 16.5 7.4 21.6 12 23C16.6 21.6 20 16.5 20 11V5L12 2Z" fill="#6C5CE7" stroke="#4834D4" strokeWidth="1.2" />
      <rect x="9" y="11" width="6" height="5" rx="1.5" fill="#FFEAA7" />
      <path d="M10 11V9.5C10 8.4 10.9 7.5 12 7.5C13.1 7.5 14 8.4 14 9.5V11" stroke="#FFEAA7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
