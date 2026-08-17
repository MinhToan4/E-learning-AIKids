import React from 'react'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  className?: string
}

/**
 * AIKids Unified CMS Icon Suite — 3D Plastic/Clay Style
 * Matches KidNavIcons aesthetic: 64x64 viewBox, multi-layer gradients,
 * depth shadows, specular highlights, React.useId() gradient safety.
 */

export function CmsOverviewIcon({ size = 22, className = '', ...props }: IconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props} aria-hidden="true">
      <defs>
        <linearGradient id={`ov1-${id}`} x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A598FE" />
          <stop offset="1" stopColor="#6D5EFC" />
        </linearGradient>
        <linearGradient id={`ov2-${id}`} x1="36" y1="4" x2="60" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7CD8FF" />
          <stop offset="1" stopColor="#3DBFFF" />
        </linearGradient>
        <linearGradient id={`ov3-${id}`} x1="4" y1="36" x2="28" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF97AC" />
          <stop offset="1" stopColor="#FF5C7A" />
        </linearGradient>
        <linearGradient id={`ov4-${id}`} x1="36" y1="36" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD777" />
          <stop offset="1" stopColor="#FFC94A" />
        </linearGradient>
        <filter id={`ov-sh-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(30,39,64,0.2)" />
        </filter>
      </defs>
      <rect x="4" y="4" width="24" height="24" rx="7" fill={`url(#ov1-${id})`} filter={`url(#ov-sh-${id})`} />
      <rect x="8" y="8" width="8" height="4" rx="2" fill="#FFFFFF" opacity="0.35" />
      <rect x="36" y="4" width="24" height="24" rx="7" fill={`url(#ov2-${id})`} filter={`url(#ov-sh-${id})`} />
      <rect x="40" y="8" width="8" height="4" rx="2" fill="#FFFFFF" opacity="0.35" />
      <rect x="4" y="36" width="24" height="24" rx="7" fill={`url(#ov3-${id})`} filter={`url(#ov-sh-${id})`} />
      <rect x="8" y="40" width="8" height="4" rx="2" fill="#FFFFFF" opacity="0.35" />
      <rect x="36" y="36" width="24" height="24" rx="7" fill={`url(#ov4-${id})`} filter={`url(#ov-sh-${id})`} />
      <rect x="40" y="40" width="8" height="4" rx="2" fill="#FFFFFF" opacity="0.35" />
    </svg>
  )
}

export function CmsClassesIcon({ size = 22, className = '', ...props }: IconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props} aria-hidden="true">
      <defs>
        <linearGradient id={`cls-body-${id}`} x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#68CEFF" />
          <stop offset="1" stopColor="#0984E3" />
        </linearGradient>
        <linearGradient id={`cls-roof-${id}`} x1="8" y1="4" x2="56" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF97AC" />
          <stop offset="1" stopColor="#FF5C7A" />
        </linearGradient>
        <filter id={`cls-sh-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(30,39,64,0.2)" />
        </filter>
      </defs>
      <ellipse cx="32" cy="28" rx="26" ry="8" fill={`url(#cls-body-${id})`} filter={`url(#cls-sh-${id})`} />
      <rect x="6" y="24" width="52" height="8" rx="4" fill={`url(#cls-body-${id})`} />
      <rect x="18" y="8" width="28" height="22" rx="6" fill={`url(#cls-roof-${id})`} filter={`url(#cls-sh-${id})`} />
      <rect x="22" y="12" width="14" height="5" rx="2.5" fill="#FFFFFF" opacity="0.4" />
      <circle cx="44" cy="10" r="4" fill="#FFC94A" />
      <line x1="44" y1="14" x2="44" y2="30" stroke="#FFC94A" strokeWidth="3" strokeLinecap="round" />
      <line x1="44" y1="30" x2="40" y2="38" stroke="#FFC94A" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="44" y1="30" x2="48" y2="38" stroke="#FFC94A" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 32C16 32 12 38 12 48C12 52 20 56 32 56C44 56 52 52 52 48C52 38 48 32 48 32L16 32Z" fill={`url(#cls-body-${id})`} />
      <rect x="22" y="36" width="8" height="5" rx="2.5" fill="#FFFFFF" opacity="0.3" />
    </svg>
  )
}

export function CmsCoursesIcon({ size = 22, className = '', ...props }: IconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props} aria-hidden="true">
      <defs>
        <linearGradient id={`crs-main-${id}`} x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A598FE" />
          <stop offset="1" stopColor="#5646E8" />
        </linearGradient>
        <linearGradient id={`crs-side-${id}`} x1="48" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B7FFD" />
          <stop offset="1" stopColor="#4436BD" />
        </linearGradient>
        <filter id={`crs-sh-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(86,70,232,0.3)" />
        </filter>
      </defs>
      <rect x="48" y="8" width="10" height="48" rx="4" fill={`url(#crs-side-${id})`} />
      <rect x="10" y="6" width="42" height="52" rx="6" fill={`url(#crs-main-${id})`} filter={`url(#crs-sh-${id})`} />
      <rect x="14" y="10" width="22" height="6" rx="3" fill="#FFFFFF" opacity="0.3" />
      <rect x="18" y="22" width="26" height="5" rx="2.5" fill="#FFFFFF" opacity="0.85" />
      <rect x="18" y="33" width="20" height="4" rx="2" fill="#FFFFFF" opacity="0.65" />
      <rect x="18" y="43" width="14" height="4" rx="2" fill="#FFFFFF" opacity="0.45" />
      <path d="M40 34L41.5 38L46 38.5L43 41.5L44 46L40 43.8L36 46L37 41.5L34 38.5L38.5 38L40 34Z" fill="#FFD777" />
    </svg>
  )
}

export function CmsLecturesIcon({ size = 22, className = '', ...props }: IconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props} aria-hidden="true">
      <defs>
        <linearGradient id={`lec-screen-${id}`} x1="4" y1="6" x2="60" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF97AC" />
          <stop offset="1" stopColor="#E8174A" />
        </linearGradient>
        <linearGradient id={`lec-base-${id}`} x1="20" y1="48" x2="44" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#475569" />
          <stop offset="1" stopColor="#334155" />
        </linearGradient>
        <filter id={`lec-sh-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(232,23,74,0.25)" />
        </filter>
      </defs>
      <rect x="4" y="6" width="56" height="40" rx="7" fill={`url(#lec-screen-${id})`} filter={`url(#lec-sh-${id})`} />
      <rect x="8" y="10" width="48" height="32" rx="4" fill="#1E0A1A" opacity="0.85" />
      <rect x="10" y="12" width="20" height="5" rx="2.5" fill="#FFFFFF" opacity="0.12" />
      <path d="M26 20L26 36L42 28L26 20Z" fill="#FFFFFF" />
      <ellipse cx="30" cy="24" rx="4" ry="2" fill="#FFFFFF" opacity="0.25" />
      <rect x="28" y="46" width="8" height="8" rx="2" fill={`url(#lec-base-${id})`} />
      <rect x="20" y="53" width="24" height="5" rx="2.5" fill={`url(#lec-base-${id})`} />
    </svg>
  )
}

export function CmsAnalyticsIcon({ size = 22, className = '', ...props }: IconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props} aria-hidden="true">
      <defs>
        <linearGradient id={`ana-bg-${id}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F0FFFE" />
          <stop offset="1" stopColor="#D8F8EE" />
        </linearGradient>
        <linearGradient id={`ana-bar1-${id}`} x1="10" y1="18" x2="10" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#68E4B4" />
          <stop offset="1" stopColor="#3ED9A0" />
        </linearGradient>
        <linearGradient id={`ana-bar2-${id}`} x1="26" y1="10" x2="26" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#68CEFF" />
          <stop offset="1" stopColor="#3DBFFF" />
        </linearGradient>
        <linearGradient id={`ana-bar3-${id}`} x1="42" y1="24" x2="42" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A598FE" />
          <stop offset="1" stopColor="#6D5EFC" />
        </linearGradient>
        <filter id={`ana-sh-${id}`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(30,39,64,0.12)" />
        </filter>
      </defs>
      <rect x="3" y="3" width="58" height="58" rx="10" fill={`url(#ana-bg-${id})`} filter={`url(#ana-sh-${id})`} />
      <line x1="8" y1="54" x2="56" y2="54" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
      <rect x="8" y="30" width="12" height="24" rx="4" fill={`url(#ana-bar1-${id})`} />
      <rect x="26" y="14" width="12" height="40" rx="4" fill={`url(#ana-bar2-${id})`} />
      <rect x="44" y="22" width="12" height="32" rx="4" fill={`url(#ana-bar3-${id})`} />
      <rect x="10" y="32" width="4" height="6" rx="2" fill="#FFFFFF" opacity="0.45" />
      <rect x="28" y="16" width="4" height="6" rx="2" fill="#FFFFFF" opacity="0.45" />
      <rect x="46" y="24" width="4" height="6" rx="2" fill="#FFFFFF" opacity="0.45" />
      <path d="M14 35L32 20L50 28" stroke="#FFC94A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="28" r="3.5" fill="#FFC94A" />
    </svg>
  )
}

export function CmsUsersIcon({ size = 22, className = '', ...props }: IconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props} aria-hidden="true">
      <defs>
        <linearGradient id={`usr-head-${id}`} x1="10" y1="6" x2="38" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7CD8FF" />
          <stop offset="1" stopColor="#3DBFFF" />
        </linearGradient>
        <linearGradient id={`usr-body-${id}`} x1="4" y1="34" x2="48" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7CD8FF" />
          <stop offset="1" stopColor="#3DBFFF" />
        </linearGradient>
        <linearGradient id={`usr-head2-${id}`} x1="30" y1="10" x2="58" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B5A3FF" />
          <stop offset="1" stopColor="#8B7FFD" />
        </linearGradient>
        <filter id={`usr-sh-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(30,39,64,0.18)" />
        </filter>
      </defs>
      <circle cx="42" cy="20" r="10" fill={`url(#usr-head2-${id})`} filter={`url(#usr-sh-${id})`} />
      <ellipse cx="42" cy="16" rx="5" ry="3" fill="#FFFFFF" opacity="0.3" />
      <path d="M28 52C29 44 34 40 42 40C50 40 55 44 56 52L56 58H28Z" fill="#8B7FFD" opacity="0.85" />
      <circle cx="24" cy="22" r="13" fill={`url(#usr-head-${id})`} filter={`url(#usr-sh-${id})`} />
      <ellipse cx="24" cy="18" rx="7" ry="3.5" fill="#FFFFFF" opacity="0.3" />
      <path d="M6 56C7 46 14 42 24 42C34 42 41 46 42 56L42 60H6Z" fill={`url(#usr-body-${id})`} />
    </svg>
  )
}

export function CmsFeedbackIcon({ size = 22, className = '', ...props }: IconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props} aria-hidden="true">
      <defs>
        <linearGradient id={`fb-body-${id}`} x1="4" y1="4" x2="60" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#68E4B4" />
          <stop offset="1" stopColor="#178A5C" />
        </linearGradient>
        <filter id={`fb-sh-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(23,138,92,0.3)" />
        </filter>
      </defs>
      <path
        d="M8 8C5.8 8 4 9.8 4 12V42C4 44.2 5.8 46 8 46H18L12 58L30 46H56C58.2 46 60 44.2 60 42V12C60 9.8 58.2 8 56 8H8Z"
        fill={`url(#fb-body-${id})`}
        filter={`url(#fb-sh-${id})`}
      />
      <rect x="10" y="12" width="28" height="8" rx="4" fill="#FFFFFF" opacity="0.3" />
      <rect x="16" y="20" width="32" height="5" rx="2.5" fill="#FFFFFF" opacity="0.9" />
      <rect x="16" y="30" width="24" height="5" rx="2.5" fill="#FFFFFF" opacity="0.9" />
      <circle cx="48" cy="33" r="7" fill="#FFC94A" />
      <path d="M48 27.5L49.5 31H53L50.2 33.2L51.2 37L48 35L44.8 37L45.8 33.2L43 31H46.5L48 27.5Z" fill="#FFFFFF" />
    </svg>
  )
}

export function CmsSupportIcon({ size = 22, className = '', ...props }: IconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props} aria-hidden="true">
      <defs>
        <linearGradient id={`sup-body-${id}`} x1="6" y1="4" x2="58" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD777" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <filter id={`sup-sh-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(245,158,11,0.3)" />
        </filter>
      </defs>
      <path d="M32 6L58 54H6L32 6Z" fill={`url(#sup-body-${id})`} filter={`url(#sup-sh-${id})`} />
      <path d="M32 10L55 52H32L32 10Z" fill="#FFFFFF" opacity="0.1" />
      <path d="M32 10L9 52H32L32 10Z" fill="#FFFFFF" opacity="0.05" />
      <ellipse cx="32" cy="20" rx="6" ry="3" fill="#FFFFFF" opacity="0.3" transform="rotate(-10 32 20)" />
      <rect x="29" y="22" width="6" height="18" rx="3" fill="#FFFFFF" />
      <circle cx="32" cy="46" r="4" fill="#FFFFFF" />
    </svg>
  )
}

export function CmsTrophyIcon({ size = 22, className = '', ...props }: IconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props} aria-hidden="true">
      <defs>
        <linearGradient id={`trp-cup-${id}`} x1="10" y1="4" x2="54" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE066" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id={`trp-base-${id}`} x1="16" y1="48" x2="48" y2="62" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFC94A" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <filter id={`trp-sh-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(245,158,11,0.35)" />
        </filter>
      </defs>
      <path d="M18 14H8C6 14 4 16 4 18C4 24 8 30 16 30H18" stroke={`url(#trp-cup-${id})`} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M46 14H56C58 14 60 16 60 18C60 24 56 30 48 30H46" stroke={`url(#trp-cup-${id})`} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M16 6H48V28C48 38 40 42 32 42C24 42 16 38 16 28V6Z" fill={`url(#trp-cup-${id})`} filter={`url(#trp-sh-${id})`} />
      <path d="M20 8H40V14C40 14 36 16 32 16C28 16 24 14 24 14L20 8Z" fill="#FFFFFF" opacity="0.3" />
      <path d="M32 16L34 21H39.5L35 24.2L37 30L32 27L27 30L29 24.2L24.5 21H30L32 16Z" fill="#FFFFFF" opacity="0.85" />
      <rect x="28" y="42" width="8" height="10" rx="3" fill={`url(#trp-base-${id})`} />
      <rect x="18" y="52" width="28" height="8" rx="4" fill={`url(#trp-base-${id})`} />
    </svg>
  )
}

export function CmsLogsIcon({ size = 22, className = '', ...props }: IconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props} aria-hidden="true">
      <defs>
        <linearGradient id={`log-main-${id}`} x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD777" />
          <stop offset="1" stopColor="#E1B12C" />
        </linearGradient>
        <filter id={`log-sh-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(225,177,44,0.25)" />
        </filter>
      </defs>
      <rect x="10" y="4" width="44" height="56" rx="8" fill={`url(#log-main-${id})`} filter={`url(#log-sh-${id})`} />
      <rect x="14" y="8" width="24" height="7" rx="3.5" fill="#FFFFFF" opacity="0.35" />
      <rect x="18" y="22" width="28" height="5" rx="2.5" fill="#FFFFFF" opacity="0.85" />
      <rect x="18" y="33" width="22" height="5" rx="2.5" fill="#FFFFFF" opacity="0.75" />
      <rect x="18" y="44" width="16" height="5" rx="2.5" fill="#FFFFFF" opacity="0.6" />
      <circle cx="14" cy="24.5" r="2.5" fill="#FFFFFF" opacity="0.7" />
      <circle cx="14" cy="35.5" r="2.5" fill="#FFFFFF" opacity="0.7" />
      <circle cx="14" cy="46.5" r="2.5" fill="#FFFFFF" opacity="0.7" />
    </svg>
  )
}

export function CmsSessionsIcon({ size = 22, className = '', ...props }: IconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props} aria-hidden="true">
      <defs>
        <linearGradient id={`ses-${id}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B5A3FF" />
          <stop offset="1" stopColor="#6C5CE7" />
        </linearGradient>
        <filter id={`ses-sh-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(108,92,231,0.3)" />
        </filter>
      </defs>
      <circle cx="22" cy="32" r="16" fill={`url(#ses-${id})`} filter={`url(#ses-sh-${id})`} />
      <ellipse cx="22" cy="25" rx="8" ry="4" fill="#FFFFFF" opacity="0.25" />
      <path d="M38 32H56M48 22V42" stroke={`url(#ses-${id})`} strokeWidth="6" strokeLinecap="round" />
      <circle cx="56" cy="32" r="5" fill="#FF7B93" />
    </svg>
  )
}

export function CmsSettingsIcon({ size = 22, className = '', ...props }: IconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props} aria-hidden="true">
      <defs>
        <linearGradient id={`set-gear-${id}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A598FE" />
          <stop offset="1" stopColor="#6D5EFC" />
        </linearGradient>
        <filter id={`set-sh-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(109,94,252,0.3)" />
        </filter>
      </defs>
      <path
        d="M32 6L37 14.5H46.5L52 21.5L47 30L52 38.5L46.5 45.5H37L32 54L27 45.5H17.5L12 38.5L17 30L12 21.5L17.5 14.5H27L32 6Z"
        fill={`url(#set-gear-${id})`}
        filter={`url(#set-sh-${id})`}
      />
      <path d="M32 8L36 15L44 15L49 21L45 28L49 35L44 41L36 41L32 48L28 41L20 41L15 35L19 28L15 21L20 15L28 15L32 8Z" fill="#FFFFFF" opacity="0.12" />
      <circle cx="32" cy="30" r="10" fill="#FFFFFF" />
      <circle cx="32" cy="30" r="6" fill={`url(#set-gear-${id})`} opacity="0.6" />
    </svg>
  )
}

export function CmsAiIcon({ size = 22, className = '', ...props }: IconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props} aria-hidden="true">
      <defs>
        <linearGradient id={`ai-body-${id}`} x1="6" y1="12" x2="58" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A598FE" />
          <stop offset="1" stopColor="#6D5EFC" />
        </linearGradient>
        <filter id={`ai-sh-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(109,94,252,0.3)" />
        </filter>
      </defs>
      <rect x="10" y="14" width="44" height="38" rx="10" fill={`url(#ai-body-${id})`} filter={`url(#ai-sh-${id})`} />
      <rect x="14" y="18" width="28" height="8" rx="4" fill="#FFFFFF" opacity="0.25" />
      <circle cx="22" cy="32" r="6" fill="#3ED9A0" />
      <circle cx="22" cy="32" r="3" fill="#178A5C" />
      <circle cx="42" cy="32" r="6" fill="#3ED9A0" />
      <circle cx="42" cy="32" r="3" fill="#178A5C" />
      <circle cx="20" cy="30" r="1.5" fill="#FFFFFF" />
      <circle cx="40" cy="30" r="1.5" fill="#FFFFFF" />
      <path d="M24 42C26.5 46 37.5 46 40 42" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
      <rect x="29" y="4" width="6" height="12" rx="3" fill={`url(#ai-body-${id})`} />
      <circle cx="32" cy="4" r="5" fill="#FF7B93" />
    </svg>
  )
}

export function CmsBillingIcon({ size = 22, className = '', ...props }: IconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props} aria-hidden="true">
      <defs>
        <linearGradient id={`bill-card-${id}`} x1="4" y1="10" x2="60" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#68E4B4" />
          <stop offset="1" stopColor="#3ED9A0" />
        </linearGradient>
        <filter id={`bill-sh-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(62,217,160,0.3)" />
        </filter>
      </defs>
      <rect x="4" y="12" width="56" height="40" rx="8" fill={`url(#bill-card-${id})`} filter={`url(#bill-sh-${id})`} />
      <rect x="4" y="22" width="56" height="10" fill="#178A5C" opacity="0.5" />
      <rect x="4" y="12" width="56" height="12" rx="8" fill="#178A5C" opacity="0.25" />
      <rect x="10" y="16" width="20" height="7" rx="3.5" fill="#FFFFFF" opacity="0.35" />
      <rect x="10" y="38" width="20" height="7" rx="3.5" fill="#FFFFFF" />
      <circle cx="46" cy="41.5" r="7" fill="#FFD777" opacity="0.9" />
      <circle cx="52" cy="41.5" r="7" fill="#FFC94A" />
    </svg>
  )
}

export function CmsLogoutIcon({ size = 22, className = '', ...props }: IconProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props} aria-hidden="true">
      <defs>
        <linearGradient id={`out-door-${id}`} x1="6" y1="6" x2="40" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B5A3FF" />
          <stop offset="1" stopColor="#8B7FFD" />
        </linearGradient>
        <linearGradient id={`out-arrow-${id}`} x1="34" y1="24" x2="60" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF97AC" />
          <stop offset="1" stopColor="#FF5C7A" />
        </linearGradient>
        <filter id={`out-sh-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(30,39,64,0.15)" />
        </filter>
      </defs>
      {/* Hairline outline giữ CSS theming capability */}
      <rect x="6" y="8" width="34" height="48" rx="6" fill={`url(#out-door-${id})`} filter={`url(#out-sh-${id})`} stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.12" />
      <rect x="10" y="12" width="14" height="8" rx="4" fill="#FFFFFF" opacity="0.25" />
      <circle cx="34" cy="32" r="4" fill="#FFC94A" />
      <path d="M38 24L52 32L38 40" fill={`url(#out-arrow-${id})`} />
      <path d="M52 32H28" stroke={`url(#out-arrow-${id})`} strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

