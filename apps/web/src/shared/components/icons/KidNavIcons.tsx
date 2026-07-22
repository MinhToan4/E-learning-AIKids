import React from 'react'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  className?: string
}

/**
 * 3D Soft-Clay SVG Icon Suite designed specifically for AI Kids Creator Academy.
 * Features warm palettes, rich gradients, rounded geometry, and vibrant friendly depth.
 */

export function NavHomeIcon({ size = 24, className = '', ...props }: IconProps) {
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
        <linearGradient id="homeRoof" x1="16" y1="4" x2="16" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF6B6B" />
          <stop offset="1" stopColor="#EE5253" />
        </linearGradient>
        <linearGradient id="homeBase" x1="16" y1="14" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF9E6" />
          <stop offset="1" stopColor="#FFEAA7" />
        </linearGradient>
        <linearGradient id="homeDoor" x1="16" y1="20" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6C5CE7" />
          <stop offset="1" stopColor="#574B90" />
        </linearGradient>
      </defs>
      {/* Base */}
      <path
        d="M16 4.5L3.5 15C2.8 15.6 3.2 16.8 4.2 16.8H6.5V26.5C6.5 27.6 7.4 28.5 8.5 28.5H23.5C24.6 28.5 25.5 27.6 25.5 26.5V16.8H27.8C28.8 16.8 29.2 15.6 28.5 15L16 4.5Z"
        fill="url(#homeBase)"
        stroke="#E17055"
        strokeWidth="1.5"
      />
      {/* Roof */}
      <path
        d="M16 3.5L2.8 14.2C2.1 14.8 2.5 16 3.5 16H28.5C29.5 16 29.9 14.8 29.2 14.2L16 3.5Z"
        fill="url(#homeRoof)"
        stroke="#D63031"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Door */}
      <rect x="12" y="19" width="8" height="9.5" rx="4" fill="url(#homeDoor)" />
      {/* Door Knob */}
      <circle cx="18" cy="24" r="1" fill="#FFEAA7" />
      {/* Window */}
      <circle cx="16" cy="11.5" r="2.5" fill="#74B9FF" stroke="#0984E3" strokeWidth="1" />
    </svg>
  )
}

export function NavWorldIcon({ size = 24, className = '', ...props }: IconProps) {
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
        <linearGradient id="worldOcean" x1="16" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#74B9FF" />
          <stop offset="1" stopColor="#0984E3" />
        </linearGradient>
        <linearGradient id="worldLand" x1="16" y1="6" x2="16" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#55E6C1" />
          <stop offset="1" stopColor="#1DD1A1" />
        </linearGradient>
      </defs>
      {/* Globe base */}
      <circle cx="16" cy="16" r="12" fill="url(#worldOcean)" stroke="#0984E3" strokeWidth="1.2" />
      {/* Continents */}
      <path
        d="M11 9.5C12.5 8 15 8.5 16 10C17 11.5 15.5 13 14 13.5C12.5 14 10 12.5 9.5 11C9 9.5 9.5 11 11 9.5Z"
        fill="url(#worldLand)"
      />
      <path
        d="M20 15C22 14.5 24.5 16 25 18C25.5 20 23.5 22 22 22.5C20.5 23 18.5 21.5 19 19.5C19.5 17.5 18 15.5 20 15Z"
        fill="url(#worldLand)"
      />
      <path
        d="M10 21C11.5 20.5 13 22 12.5 23.5C12 25 10 25.5 9 24.5C8 23.5 8.5 21.5 10 21Z"
        fill="url(#worldLand)"
      />
      {/* Orbit Ring */}
      <ellipse
        cx="16"
        cy="16"
        rx="14"
        ry="5"
        fill="none"
        stroke="#FFEAA7"
        strokeWidth="1.5"
        strokeDasharray="2 1"
        transform="rotate(-20 16 16)"
      />
      {/* Orbiting star */}
      <circle cx="28" cy="11" r="2" fill="#FDCB6E" />
    </svg>
  )
}

export function NavLeaderboardIcon({ size = 24, className = '', ...props }: IconProps) {
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
        <linearGradient id="trophyGold" x1="16" y1="4" x2="16" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFEAA7" />
          <stop offset="0.5" stopColor="#FDCB6E" />
          <stop offset="1" stopColor="#E1B12C" />
        </linearGradient>
        <linearGradient id="trophyBase" x1="16" y1="23" x2="16" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A29BFE" />
          <stop offset="1" stopColor="#6C5CE7" />
        </linearGradient>
      </defs>
      {/* Handles */}
      <path
        d="M7 9C4.5 9 3.5 11 4 13.5C4.5 16 7 17 9.5 16.5"
        stroke="#FDCB6E"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M25 9C27.5 9 28.5 11 28 13.5C27.5 16 25 17 22.5 16.5"
        stroke="#FDCB6E"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Cup body */}
      <path
        d="M8 6H24V14C24 18.4 20.4 22 16 22C11.6 22 8 18.4 8 14V6Z"
        fill="url(#trophyGold)"
        stroke="#E1B12C"
        strokeWidth="1.2"
      />
      {/* Stem & Pedestal */}
      <path d="M14 22H18V25H14V22Z" fill="#FDCB6E" />
      <rect x="10" y="25" width="12" height="4" rx="2" fill="url(#trophyBase)" />
      {/* Star emblem */}
      <path
        d="M16 9.5L17.2 12.2L20 12.4L17.8 14.2L18.5 17L16 15.5L13.5 17L14.2 14.2L12 12.4L14.8 12.2L16 9.5Z"
        fill="#FFFFFF"
      />
    </svg>
  )
}

export function NavBadgeIcon({ size = 24, className = '', ...props }: IconProps) {
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
        <linearGradient id="badgeRibbonLeft" x1="12" y1="18" x2="10" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF7675" />
          <stop offset="1" stopColor="#D63031" />
        </linearGradient>
        <linearGradient id="badgeRibbonRight" x1="20" y1="18" x2="22" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#74B9FF" />
          <stop offset="1" stopColor="#0984E3" />
        </linearGradient>
        <linearGradient id="badgeCircle" x1="16" y1="3" x2="16" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FD79A8" />
          <stop offset="1" stopColor="#E84393" />
        </linearGradient>
      </defs>
      {/* Ribbons */}
      <path d="M12 18L8 28.5L13 26.5L16 28.5L14 18H12Z" fill="url(#badgeRibbonLeft)" />
      <path d="M20 18L24 28.5L19 26.5L16 28.5L18 18H20Z" fill="url(#badgeRibbonRight)" />
      {/* Main Medal Starburst Circle */}
      <circle cx="16" cy="12" r="9.5" fill="url(#badgeCircle)" stroke="#D63031" strokeWidth="1.2" />
      <circle cx="16" cy="12" r="7" fill="#FFEAA7" />
      {/* Center Star */}
      <path
        d="M16 7.5L17.1 10.1L19.8 10.2L17.7 12L18.4 14.6L16 13.2L13.6 14.6L14.3 12L12.2 10.2L14.9 10.1L16 7.5Z"
        fill="#E17055"
      />
    </svg>
  )
}

export function NavBackpackIcon({ size = 24, className = '', ...props }: IconProps) {
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
        <linearGradient id="bagMain" x1="16" y1="5" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A29BFE" />
          <stop offset="1" stopColor="#6C5CE7" />
        </linearGradient>
        <linearGradient id="bagPocket" x1="16" y1="16" x2="16" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#81ECEC" />
          <stop offset="1" stopColor="#00CEC9" />
        </linearGradient>
      </defs>
      {/* Top Handle Loop */}
      <path d="M12 7C12 4.5 13.8 3 16 3C18.2 3 20 4.5 20 7" stroke="#4834D4" strokeWidth="2" strokeLinecap="round" />
      {/* Main Body */}
      <rect x="6" y="6" width="20" height="22" rx="7" fill="url(#bagMain)" stroke="#4834D4" strokeWidth="1.2" />
      {/* Side Pocket Accents */}
      <rect x="4" y="15" width="2.5" height="7" rx="1.2" fill="#00CEC9" />
      <rect x="25.5" y="15" width="2.5" height="7" rx="1.2" fill="#00CEC9" />
      {/* Front Pocket */}
      <rect x="9" y="16" width="14" height="10" rx="4" fill="url(#bagPocket)" stroke="#00B894" strokeWidth="1" />
      {/* Zipper details */}
      <line x1="11" y1="19" x2="21" y2="19" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="19" r="1.5" fill="#FFEAA7" />
    </svg>
  )
}

export function NavProfileIcon({ size = 24, className = '', ...props }: IconProps) {
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
        <linearGradient id="profBg" x1="16" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDCB6E" />
          <stop offset="1" stopColor="#E17055" />
        </linearGradient>
        <linearGradient id="profHead" x1="16" y1="8" x2="16" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFF9E6" />
        </linearGradient>
      </defs>
      {/* Main circle */}
      <circle cx="16" cy="16" r="12" fill="url(#profBg)" stroke="#D63031" strokeWidth="1.2" />
      {/* Kid Head */}
      <circle cx="16" cy="13" r="5" fill="url(#profHead)" />
      {/* Kid Body / Shoulders */}
      <path d="M9 25.5C9.5 21 12.5 19.5 16 19.5C19.5 19.5 22.5 21 23 25.5C21 27 18.6 28 16 28C13.4 28 11 27 9 25.5Z" fill="url(#profHead)" />
      {/* Crown / Star accent on top */}
      <path d="M16 4.5L17 7L19.5 7L17.5 8.5L18.2 11L16 9.5L13.8 11L14.5 8.5L12.5 7L15 7L16 4.5Z" fill="#FFEAA7" />
    </svg>
  )
}
