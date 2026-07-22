import React from 'react'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  className?: string
}

/**
 * 3D Soft-Clay SVG Icon Suite designed specifically for AI Kids Creator Academy.
 * Features warm palettes, rich gradients, rounded geometry, and vibrant friendly depth.
 * Strictly aligned with docs/UI_DESIGN_SYSTEM.md (Section 6).
 */

export function NavHomeIcon({ size = 24, className = '', ...props }: IconProps) {
  const id = React.useId()
  const roofId = `homeRoof-${id}`
  const baseId = `homeBase-${id}`
  const doorId = `homeDoor-${id}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id={roofId} x1="16" y1="4" x2="16" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF7B93" />
          <stop offset="1" stopColor="#C03955" />
        </linearGradient>
        <linearGradient id={baseId} x1="16" y1="14" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF9E6" />
          <stop offset="1" stopColor="#FFC94A" />
        </linearGradient>
        <linearGradient id={doorId} x1="16" y1="20" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6D5EFC" />
          <stop offset="1" stopColor="#4436BD" />
        </linearGradient>
      </defs>
      {/* Base */}
      <path
        d="M16 4.5L3.5 15C2.8 15.6 3.2 16.8 4.2 16.8H6.5V26.5C6.5 27.6 7.4 28.5 8.5 28.5H23.5C24.6 28.5 25.5 27.6 25.5 26.5V16.8H27.8C28.8 16.8 29.2 15.6 28.5 15L16 4.5Z"
        fill={`url(#${baseId})`}
        stroke="#F59E0B"
        strokeWidth="1.2"
      />
      {/* Roof */}
      <path
        d="M16 3.5L2.8 14.2C2.1 14.8 2.5 16 3.5 16H28.5C29.5 16 29.9 14.8 29.2 14.2L16 3.5Z"
        fill={`url(#${roofId})`}
        stroke="#C03955"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Door */}
      <rect x="12" y="19" width="8" height="9.5" rx="4" fill={`url(#${doorId})`} />
      {/* Door Knob */}
      <circle cx="18" cy="24" r="1" fill="#FFEAA7" />
      {/* Window */}
      <circle cx="16" cy="11.5" r="2.5" fill="#3DBFFF" stroke="#0878B5" strokeWidth="1" />
    </svg>
  )
}

export function NavWorldIcon({ size = 24, className = '', ...props }: IconProps) {
  const id = React.useId()
  const oceanId = `worldOcean-${id}`
  const landId = `worldLand-${id}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id={oceanId} x1="16" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3DBFFF" />
          <stop offset="1" stopColor="#0878B5" />
        </linearGradient>
        <linearGradient id={landId} x1="16" y1="6" x2="16" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3ED9A0" />
          <stop offset="1" stopColor="#178A5C" />
        </linearGradient>
      </defs>
      {/* Globe base */}
      <circle cx="16" cy="16" r="12" fill={`url(#${oceanId})`} stroke="#0878B5" strokeWidth="1.2" />
      {/* Continents */}
      <path
        d="M11 9.5C12.5 8 15 8.5 16 10C17 11.5 15.5 13 14 13.5C12.5 14 10 12.5 9.5 11C9 9.5 9.5 11 11 9.5Z"
        fill={`url(#${landId})`}
      />
      <path
        d="M20 15C22 14.5 24.5 16 25 18C25.5 20 23.5 22 22 22.5C20.5 23 18.5 21.5 19 19.5C19.5 17.5 18 15.5 20 15Z"
        fill={`url(#${landId})`}
      />
      <path
        d="M10 21C11.5 20.5 13 22 12.5 23.5C12 25 10 25.5 9 24.5C8 23.5 8.5 21.5 10 21Z"
        fill={`url(#${landId})`}
      />
      {/* Orbit Ring */}
      <ellipse
        cx="16"
        cy="16"
        rx="14"
        ry="5"
        fill="none"
        stroke="#FFC94A"
        strokeWidth="1.5"
        strokeDasharray="2 1"
        transform="rotate(-20 16 16)"
      />
      {/* Orbiting star */}
      <circle cx="28" cy="11" r="2" fill="#F59E0B" />
    </svg>
  )
}

export function NavLeaderboardIcon({ size = 24, className = '', ...props }: IconProps) {
  const id = React.useId()
  const goldId = `trophyGold-${id}`
  const baseId = `trophyBase-${id}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id={goldId} x1="16" y1="4" x2="16" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE066" />
          <stop offset="0.5" stopColor="#FFC94A" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id={baseId} x1="16" y1="23" x2="16" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6D5EFC" />
          <stop offset="1" stopColor="#4436BD" />
        </linearGradient>
      </defs>
      {/* Handles */}
      <path
        d="M7 9C4.5 9 3.5 11 4 13.5C4.5 16 7 17 9.5 16.5"
        stroke="#FFC94A"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M25 9C27.5 9 28.5 11 28 13.5C27.5 16 25 17 22.5 16.5"
        stroke="#FFC94A"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Cup body */}
      <path
        d="M8 6H24V14C24 18.4 20.4 22 16 22C11.6 22 8 18.4 8 14V6Z"
        fill={`url(#${goldId})`}
        stroke="#F59E0B"
        strokeWidth="1.2"
      />
      {/* Stem & Pedestal */}
      <path d="M14 22H18V25H14V22Z" fill="#FFC94A" />
      <rect x="10" y="25" width="12" height="4" rx="2" fill={`url(#${baseId})`} />
      {/* Star emblem */}
      <path
        d="M16 9.5L17.2 12.2L20 12.4L17.8 14.2L18.5 17L16 15.5L13.5 17L14.2 14.2L12 12.4L14.8 12.2L16 9.5Z"
        fill="#FFFFFF"
      />
    </svg>
  )
}

export function NavBadgeIcon({ size = 24, className = '', ...props }: IconProps) {
  const id = React.useId()
  const rLeftId = `badgeRibbonLeft-${id}`
  const rRightId = `badgeRibbonRight-${id}`
  const circleId = `badgeCircle-${id}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id={rLeftId} x1="12" y1="18" x2="10" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF7B93" />
          <stop offset="1" stopColor="#C03955" />
        </linearGradient>
        <linearGradient id={rRightId} x1="20" y1="18" x2="22" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3DBFFF" />
          <stop offset="1" stopColor="#0878B5" />
        </linearGradient>
        <linearGradient id={circleId} x1="16" y1="3" x2="16" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF7B93" />
          <stop offset="1" stopColor="#C03955" />
        </linearGradient>
      </defs>
      {/* Ribbons */}
      <path d="M12 18L8 28.5L13 26.5L16 28.5L14 18H12Z" fill={`url(#${rLeftId})`} />
      <path d="M20 18L24 28.5L19 26.5L16 28.5L18 18H20Z" fill={`url(#${rRightId})`} />
      {/* Main Medal Starburst Circle */}
      <circle cx="16" cy="12" r="9.5" fill={`url(#${circleId})`} stroke="#C03955" strokeWidth="1.2" />
      <circle cx="16" cy="12" r="7" fill="#FFEAA7" />
      {/* Center Star */}
      <path
        d="M16 7.5L17.1 10.1L19.8 10.2L17.7 12L18.4 14.6L16 13.2L13.6 14.6L14.3 12L12.2 10.2L14.9 10.1L16 7.5Z"
        fill="#F59E0B"
      />
    </svg>
  )
}

export function NavBackpackIcon({ size = 24, className = '', ...props }: IconProps) {
  const id = React.useId()
  const bagId = `bagMain-${id}`
  const pocketId = `bagPocket-${id}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id={bagId} x1="16" y1="5" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6D5EFC" />
          <stop offset="1" stopColor="#4436BD" />
        </linearGradient>
        <linearGradient id={pocketId} x1="16" y1="16" x2="16" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3ED9A0" />
          <stop offset="1" stopColor="#178A5C" />
        </linearGradient>
      </defs>
      {/* Top Handle Loop */}
      <path d="M12 7C12 4.5 13.8 3 16 3C18.2 3 20 4.5 20 7" stroke="#4436BD" strokeWidth="2" strokeLinecap="round" />
      {/* Main Body */}
      <rect x="6" y="6" width="20" height="22" rx="7" fill={`url(#${bagId})`} stroke="#4436BD" strokeWidth="1.2" />
      {/* Side Pocket Accents */}
      <rect x="4" y="15" width="2.5" height="7" rx="1.2" fill="#3ED9A0" />
      <rect x="25.5" y="15" width="2.5" height="7" rx="1.2" fill="#3ED9A0" />
      {/* Front Pocket */}
      <rect x="9" y="16" width="14" height="10" rx="4" fill={`url(#${pocketId})`} stroke="#178A5C" strokeWidth="1" />
      {/* Zipper details */}
      <line x1="11" y1="19" x2="21" y2="19" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="19" r="1.5" fill="#FFC94A" />
    </svg>
  )
}

export function NavProfileIcon({ size = 24, className = '', ...props }: IconProps) {
  const id = React.useId()
  const headId = `kProfHead-${id}`
  const capId = `kProfCap-${id}`
  const starId = `kProfStar-${id}`
  const bodyId = `kProfBody-${id}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id={capId} x1="6" y1="3" x2="26" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3DBFFF" />
          <stop offset="1" stopColor="#0878B5" />
        </linearGradient>
        <linearGradient id={headId} x1="8" y1="8" x2="24" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF9F5" />
          <stop offset="1" stopColor="#FFEBE3" />
        </linearGradient>
        <linearGradient id={bodyId} x1="5" y1="20" x2="27" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6D5EFC" />
          <stop offset="1" stopColor="#4436BD" />
        </linearGradient>
        <linearGradient id={starId} x1="20" y1="2" x2="29" y2="11" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE066" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Soft rounded shoulders / hoodie */}
      <path d="M6 28C6 22.5 10 19.5 16 19.5C22 19.5 26 22.5 26 28V29H6V28Z" fill={`url(#${bodyId})`} />

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

      {/* Golden Creator Star on top right */}
      <path d="M25 2L25.8 4.2L28 5L25.8 5.8L25 8L24.2 5.8L22 5L24.2 4.2L25 2Z" fill={`url(#${starId})`} />
    </svg>
  )
}
