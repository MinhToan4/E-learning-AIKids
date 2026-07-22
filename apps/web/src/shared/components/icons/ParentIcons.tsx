import React from 'react'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  className?: string
}

/**
 * AI Kids Creator Academy — Parent Icon Suite (Soft Clay Standard)
 * Designed strictly according to UI_DESIGN_SYSTEM.md section 6:
 * - viewBox="0 0 32 32", canvas safe area 3-29.
 * - Soft Clay 3D depth, warm palettes (Brand Purple, Sun Yellow, Coral, Sky, Mint).
 * - React.useId() for SVG gradient namespace safety.
 * - Symbol-focused without hardcoded outer square backgrounds so icons embed seamlessly inside StatCards & Nav items.
 */

export function ParentDashboardIcon({ size = 24, className = '', ...props }: IconProps) {
  const id = React.useId()
  const b1 = `pDashB1-${id}`
  const b2 = `pDashB2-${id}`
  const b3 = `pDashB3-${id}`

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} {...props}>
      <defs>
        <linearGradient id={b1} x1="6" y1="16" x2="10" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6D5EFC" />
          <stop offset="1" stopColor="#4436BD" />
        </linearGradient>
        <linearGradient id={b2} x1="13" y1="10" x2="19" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFC94A" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id={b3} x1="21" y1="4" x2="27" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3ED9A0" />
          <stop offset="1" stopColor="#178A5C" />
        </linearGradient>
      </defs>

      {/* Analytics Chart Bars */}
      <rect x="5" y="16" width="6" height="12" rx="3" fill={`url(#${b1})`} />
      <rect x="13" y="10" width="6" height="18" rx="3" fill={`url(#${b2})`} />
      <rect x="21" y="5" width="6" height="23" rx="3" fill={`url(#${b3})`} />

      {/* Upward Growth Trend Spark */}
      <path d="M4 17L12 11L18 13L27 4" stroke="#6D5EFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      <circle cx="27" cy="4" r="2.5" fill="#FFC94A" />
    </svg>
  )
}

export function ParentKidsIcon({ size = 24, className = '', ...props }: IconProps) {
  const id = React.useId()
  const headId = `pKidsHead-${id}`
  const capId = `pKidsCap-${id}`
  const shirtId = `pKidsShirt-${id}`
  const starId = `pKidsStar-${id}`

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} {...props}>
      <defs>
        <linearGradient id={capId} x1="6" y1="3" x2="26" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF7B93" />
          <stop offset="1" stopColor="#C03955" />
        </linearGradient>
        <linearGradient id={headId} x1="8" y1="8" x2="24" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF9F5" />
          <stop offset="1" stopColor="#FFEBE3" />
        </linearGradient>
        <linearGradient id={shirtId} x1="5" y1="20" x2="27" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6D5EFC" />
          <stop offset="1" stopColor="#4436BD" />
        </linearGradient>
        <linearGradient id={starId} x1="20" y1="2" x2="29" y2="11" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE066" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Soft rounded shoulders / hoodie */}
      <path d="M6 28C6 22.5 10 19.5 16 19.5C22 19.5 26 22.5 26 28V29H6V28Z" fill={`url(#${shirtId})`} />

      {/* Hoodie Collar V-accent */}
      <path d="M13 19.5L16 23L19 19.5" stroke="#EBE8FF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

      {/* Cute round head */}
      <circle cx="16" cy="14" r="8" fill={`url(#${headId})`} stroke="#FFD8CC" strokeWidth="0.8" />

      {/* Cute Creator Beret / Cap */}
      <path d="M8.5 12C7.5 8 11 4.5 16 4.5C21 4.5 24.5 8 23.5 12C21 13 11 13 8.5 12Z" fill={`url(#${capId})`} />
      <circle cx="16" cy="4" r="1.5" fill="#FFC94A" />

      {/* Big Cute Shiny Eyes */}
      <circle cx="12.5" cy="13.5" r="2" fill="#1E2740" />
      <circle cx="19.5" cy="13.5" r="2" fill="#1E2740" />
      <circle cx="13.2" cy="12.7" r="0.8" fill="#FFFFFF" />
      <circle cx="20.2" cy="12.7" r="0.8" fill="#FFFFFF" />

      {/* Sweet Rosy Cheeks */}
      <circle cx="10" cy="15.8" r="1.8" fill="#FF7B93" opacity="0.45" />
      <circle cx="22" cy="15.8" r="1.8" fill="#FF7B93" opacity="0.45" />

      {/* Cheerful Smile */}
      <path d="M14 16C14.8 17.2 17.2 17.2 18 16" stroke="#1E2740" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Creator Sparkle Star on top right */}
      <path d="M25 2L25.8 4.2L28 5L25.8 5.8L25 8L24.2 5.8L22 5L24.2 4.2L25 2Z" fill={`url(#${starId})`} />
    </svg>
  )
}

export function ParentPlanIcon({ size = 24, className = '', ...props }: IconProps) {
  const id = React.useId()
  const boxId = `pPlanBox-${id}`
  const ribbonId = `pPlanRibbon-${id}`

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} {...props}>
      <defs>
        <linearGradient id={boxId} x1="5" y1="10" x2="27" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFC94A" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id={ribbonId} x1="5" y1="5" x2="27" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF7B93" />
          <stop offset="1" stopColor="#C03955" />
        </linearGradient>
      </defs>

      {/* Gift Box Body */}
      <rect x="5" y="13" width="22" height="14" rx="4" fill={`url(#${boxId})`} />
      {/* Gift Lid */}
      <rect x="4" y="9" width="24" height="5" rx="2.5" fill="#FFE066" stroke="#F59E0B" strokeWidth="1" />

      {/* Vertical Ribbon */}
      <rect x="14" y="9" width="4" height="18" fill={`url(#${ribbonId})`} />

      {/* Ribbon Bow on top */}
      <path d="M12 9C10 5.5 13 4 15 7C15 8.5 14 9 12 9Z" fill={`url(#${ribbonId})`} />
      <path d="M20 9C22 5.5 19 4 17 7C17 8.5 18 9 20 9Z" fill={`url(#${ribbonId})`} />
      <circle cx="16" cy="8.5" r="1.5" fill="#FFE885" />
    </svg>
  )
}

export function ParentApprovalIcon({ size = 24, className = '', ...props }: IconProps) {
  const id = React.useId()
  const bellId = `pApprBell-${id}`
  const badgeId = `pApprBadge-${id}`

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} {...props}>
      <defs>
        <linearGradient id={bellId} x1="6" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3DBFFF" />
          <stop offset="1" stopColor="#0878B5" />
        </linearGradient>
        <linearGradient id={badgeId} x1="20" y1="3" x2="29" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF7B93" />
          <stop offset="1" stopColor="#C03955" />
        </linearGradient>
      </defs>

      {/* Bell Body */}
      <path d="M16 5C11.6 5 8 8.6 8 13V20L5.5 23H26.5L24 20V13C24 8.6 20.4 5 16 5Z" fill={`url(#${bellId})`} />

      {/* Clapper */}
      <circle cx="16" cy="26" r="2.5" fill="#FFC94A" />

      {/* Notification Dot Badge */}
      <circle cx="23" cy="8" r="4.5" fill={`url(#${badgeId})`} stroke="#FFFFFF" strokeWidth="1.5" />
    </svg>
  )
}

export function ParentProfileIcon({ size = 24, className = '', ...props }: IconProps) {
  const id = React.useId()
  const profId = `pProfId-${id}`

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} {...props}>
      <defs>
        <linearGradient id={profId} x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6D5EFC" />
          <stop offset="1" stopColor="#4436BD" />
        </linearGradient>
      </defs>

      {/* Avatar Head */}
      <circle cx="16" cy="11" r="5" fill={`url(#${profId})`} />

      {/* Body / Shoulders */}
      <path d="M6 27C6.5 20.5 11 19 16 19C21 19 25.5 20.5 26 27V28H6V27Z" fill={`url(#${profId})`} />

      {/* Crown / Star Accent on top */}
      <path d="M16 2.5L17.2 4.8L19.5 5L17.7 6.5L18.3 9L16 7.6L13.7 9L14.3 6.5L12.5 5L14.8 4.8L16 2.5Z" fill="#FFC94A" />
    </svg>
  )
}

export function ShieldLockIcon({ size = 20, className = '', ...props }: IconProps) {
  const id = React.useId()
  const shieldId = `shieldId-${id}`

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <defs>
        <linearGradient id={shieldId} x1="4" y1="2" x2="20" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6D5EFC" />
          <stop offset="1" stopColor="#4436BD" />
        </linearGradient>
      </defs>
      <path d="M12 2L4 5V11C4 16.5 7.4 21.6 12 23C16.6 21.6 20 16.5 20 11V5L12 2Z" fill={`url(#${shieldId})`} stroke="#4436BD" strokeWidth="1.2" />
      <rect x="9" y="11" width="6" height="5" rx="1.5" fill="#FFC94A" />
      <path d="M10 11V9.5C10 8.4 10.9 7.5 12 7.5C13.1 7.5 14 8.4 14 9.5V11" stroke="#FFC94A" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
