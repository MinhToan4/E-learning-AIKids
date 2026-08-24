import React from 'react'
import { cn } from '@/shared/lib/cn'

export type FlatClayColorTheme =
  | 'rose'
  | 'amber'
  | 'emerald'
  | 'sky'
  | 'purple'
  | 'pink'
  | 'indigo'
  | 'teal'
  | 'orange'
  | 'lime'
  | 'slate'
  | 'gold'
  | 'violet'

export interface BaseFlatClayIconProps {
  size?: number | string
  className?: string
  color?: FlatClayColorTheme | string
}

// ════════════════════════════════════════════════════════════════════════════
// 1. FLAT CLAY BALLOON (Bóng Bay 2D Flat Soft Clay)
// ════════════════════════════════════════════════════════════════════════════
export interface FlatClayBalloonProps extends BaseFlatClayIconProps {
  number?: number | string
  showString?: boolean
  showKnot?: boolean
}

const BALLOON_COLOR_MAP: Record<
  string,
  {
    gradientStart: string
    gradientEnd: string
    stroke: string
    knot: string
    highlight: string
    shadow: string
    textColor: string
  }
> = {
  rose: {
    gradientStart: '#fb7185',
    gradientEnd: '#e11d48',
    stroke: '#be123c',
    knot: '#be123c',
    highlight: '#ffe4e6',
    shadow: '#9f1239',
    textColor: '#ffffff',
  },
  amber: {
    gradientStart: '#fbbf24',
    gradientEnd: '#d97706',
    stroke: '#b45309',
    knot: '#b45309',
    highlight: '#fef3c7',
    shadow: '#92400e',
    textColor: '#ffffff',
  },
  emerald: {
    gradientStart: '#34d399',
    gradientEnd: '#059669',
    stroke: '#047857',
    knot: '#047857',
    highlight: '#d1fae5',
    shadow: '#065f46',
    textColor: '#ffffff',
  },
  sky: {
    gradientStart: '#38bdf8',
    gradientEnd: '#0284c7',
    stroke: '#0369a1',
    knot: '#0369a1',
    highlight: '#e0f2fe',
    shadow: '#075985',
    textColor: '#ffffff',
  },
  purple: {
    gradientStart: '#a78bfa',
    gradientEnd: '#7c3aed',
    stroke: '#6d28d9',
    knot: '#6d28d9',
    highlight: '#ede9fe',
    shadow: '#5b21b6',
    textColor: '#ffffff',
  },
  pink: {
    gradientStart: '#f472b6',
    gradientEnd: '#db2777',
    stroke: '#be185d',
    knot: '#be185d',
    highlight: '#fce7f3',
    shadow: '#9d174d',
    textColor: '#ffffff',
  },
  indigo: {
    gradientStart: '#818cf8',
    gradientEnd: '#4f46e5',
    stroke: '#4338ca',
    knot: '#4338ca',
    highlight: '#e0e7ff',
    shadow: '#3730a3',
    textColor: '#ffffff',
  },
  teal: {
    gradientStart: '#2dd4bf',
    gradientEnd: '#0d9488',
    stroke: '#0f766e',
    knot: '#0f766e',
    highlight: '#ccfbf1',
    shadow: '#115e59',
    textColor: '#ffffff',
  },
  orange: {
    gradientStart: '#fb923c',
    gradientEnd: '#ea580c',
    stroke: '#c2410c',
    knot: '#c2410c',
    highlight: '#ffedd5',
    shadow: '#9a3412',
    textColor: '#ffffff',
  },
  lime: {
    gradientStart: '#a3e635',
    gradientEnd: '#65a30d',
    stroke: '#4d7c0f',
    knot: '#4d7c0f',
    highlight: '#ecfccb',
    shadow: '#3f6212',
    textColor: '#ffffff',
  },
}

export function FlatClayBalloon({
  size = 48,
  color = 'sky',
  number,
  showString = true,
  showKnot = true,
  className,
}: FlatClayBalloonProps) {
  const c = BALLOON_COLOR_MAP[color] || BALLOON_COLOR_MAP.sky
  const idSuffix = React.useId().replace(/:/g, '')
  const gradId = `balloon-grad-${idSuffix}`
  const filterId = `balloon-shadow-${idSuffix}`

  return (
    <svg
      width={size}
      height={typeof size === 'number' ? (size * 78) / 64 : size}
      viewBox="0 0 64 78"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible transition-transform', className)}
      role="img"
      aria-label={number !== undefined ? `Quả bóng số ${number}` : 'Quả bóng bay'}
    >
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor={c.gradientStart} />
          <stop offset="70%" stopColor={c.gradientEnd} />
          <stop offset="100%" stopColor={c.shadow} />
        </radialGradient>
        <filter id={filterId} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor={c.shadow} floodOpacity="0.35" />
        </filter>
      </defs>

      {/* String */}
      {showString && (
        <path
          d="M 32 54 Q 30 62 34 68 T 32 76"
          stroke="#94a3b8"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
      )}

      {/* Knot */}
      {showKnot && (
        <path
          d="M 28 54 L 36 54 L 33 49 L 31 49 Z"
          fill={c.knot}
          stroke={c.stroke}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      )}

      {/* Balloon Body with Shadow */}
      <g filter={`url(#${filterId})`}>
        <path
          d="M 32 4 C 15 4 8 20 8 32 C 8 44 19 52 32 52 C 45 52 56 44 56 32 C 56 20 49 4 32 4 Z"
          fill={`url(#${gradId})`}
          stroke={c.stroke}
          strokeWidth="1.8"
        />
      </g>

      {/* Soft Clay Glaze Highlight */}
      <path
        d="M 20 12 C 26 8 38 8 42 11 C 38 10 27 10 21 14 C 18 16 16 21 16 27 C 15 22 16 15 20 12 Z"
        fill="#ffffff"
        opacity="0.65"
      />
      <circle cx="44" cy="18" r="2.5" fill="#ffffff" opacity="0.5" />

      {/* Optional Number / Badge */}
      {number !== undefined && (
        <text
          x="32"
          y="32"
          textAnchor="middle"
          dominantBaseline="central"
          fill={c.textColor}
          fontWeight="900"
          fontSize="18"
          fontFamily="system-ui, -apple-system, sans-serif"
          className="drop-shadow-sm font-display select-none"
        >
          {number}
        </text>
      )}
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 2. FLAT CLAY POP BURST (Vết Nổ Sao Soft Clay Thay Thế 💥)
// ════════════════════════════════════════════════════════════════════════════
export interface FlatClayPopBurstProps extends BaseFlatClayIconProps {}

export function FlatClayPopBurst({ size = 48, className }: FlatClayPopBurstProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  const gradId = `pop-grad-${idSuffix}`
  const filterId = `pop-shadow-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Vết nổ sao"
    >
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#fbbf24" />
          <stop offset="80%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#e11d48" />
        </radialGradient>
        <filter id={filterId} x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#9f1239" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Main Starburst */}
      <g filter={`url(#${filterId})`}>
        <path
          d="M 32 4 Q 35 20 48 12 Q 43 24 58 27 Q 44 33 50 48 Q 37 42 32 60 Q 27 42 14 48 Q 20 33 6 27 Q 21 24 16 12 Q 29 20 32 4 Z"
          fill={`url(#${gradId})`}
          stroke="#be123c"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </g>

      {/* Inner Bright Burst */}
      <path
        d="M 32 14 Q 34 24 42 19 Q 39 26 49 29 Q 40 33 43 42 Q 35 38 32 50 Q 29 38 21 42 Q 24 33 15 29 Q 25 26 22 19 Q 30 24 32 14 Z"
        fill="#ffffff"
        opacity="0.8"
      />
      <circle cx="32" cy="31" r="5" fill="#fef08a" />

      {/* Orbiting Sparkle Dots */}
      <circle cx="10" cy="14" r="2.5" fill="#fbbf24" />
      <circle cx="54" cy="14" r="3" fill="#f43f5e" />
      <circle cx="56" cy="46" r="2.5" fill="#38bdf8" />
      <circle cx="8" cy="46" r="3" fill="#34d399" />
      <circle cx="32" cy="62" r="2" fill="#fbbf24" />
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 3. FLAT CLAY CUPCAKE (Bánh Cupcake Soft Clay Thay Thế 🍰/🧁)
// ════════════════════════════════════════════════════════════════════════════
export interface FlatClayCupcakeProps extends BaseFlatClayIconProps {
  flavor?: 'strawberry' | 'chocolate' | 'vanilla' | 'matcha'
}

export function FlatClayCupcake({ size = 48, flavor = 'strawberry', className }: FlatClayCupcakeProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  const frostingGradId = `cupcake-frosting-${idSuffix}`
  const cupGradId = `cupcake-cup-${idSuffix}`
  const filterId = `cupcake-shadow-${idSuffix}`

  const frostingColors = {
    strawberry: { start: '#fbcfe8', mid: '#f472b6', end: '#db2777', stroke: '#be185d' },
    chocolate: { start: '#d6d3d1', mid: '#a8a29e', end: '#78716c', stroke: '#57534e' },
    vanilla: { start: '#fef3c7', mid: '#fde047', end: '#eab308', stroke: '#ca8a04' },
    matcha: { start: '#d1fae5', mid: '#6ee7b7', end: '#10b981', stroke: '#047857' },
  }[flavor]

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Bánh cupcake"
    >
      <defs>
        <linearGradient id={frostingGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={frostingColors.start} />
          <stop offset="60%" stopColor={frostingColors.mid} />
          <stop offset="100%" stopColor={frostingColors.end} />
        </linearGradient>
        <linearGradient id={cupGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <filter id={filterId} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#78350f" floodOpacity="0.25" />
        </filter>
      </defs>

      <g filter={`url(#${filterId})`}>
        {/* Paper Cup Base (Trapezoid) */}
        <path
          d="M 16 38 L 20 58 Q 32 60 44 58 L 48 38 Z"
          fill={`url(#${cupGradId})`}
          stroke="#ea580c"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Pleated Lines on Cup */}
        <line x1="23" y1="39" x2="26" y2="58" stroke="#ea580c" strokeWidth="1.2" opacity="0.6" />
        <line x1="32" y1="39" x2="32" y2="59" stroke="#ea580c" strokeWidth="1.2" opacity="0.6" />
        <line x1="41" y1="39" x2="38" y2="58" stroke="#ea580c" strokeWidth="1.2" opacity="0.6" />

        {/* Bottom Frosting Swirl Layer */}
        <path
          d="M 12 38 C 10 30 20 26 26 28 C 30 24 38 24 42 28 C 48 26 54 30 52 38 C 48 42 16 42 12 38 Z"
          fill={`url(#${frostingGradId})`}
          stroke={frostingColors.stroke}
          strokeWidth="1.6"
        />

        {/* Middle Frosting Swirl */}
        <path
          d="M 18 30 C 16 23 24 19 30 22 C 34 18 40 18 44 22 C 48 25 46 31 38 31 Z"
          fill={frostingColors.start}
          stroke={frostingColors.stroke}
          strokeWidth="1.4"
        />

        {/* Top Swirl Crown */}
        <path
          d="M 28 22 C 26 17 32 13 36 15 C 38 17 38 22 32 23 Z"
          fill="#ffffff"
          opacity="0.9"
        />

        {/* Red Cherry on Top */}
        <circle cx="34" cy="12" r="5.5" fill="#e11d48" stroke="#9f1239" strokeWidth="1.2" />
        <circle cx="32.5" cy="10" r="1.5" fill="#ffffff" opacity="0.8" />
        <path d="M 34 7 Q 38 3 42 5" stroke="#15803d" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </g>

      {/* Decorative Sprinkles */}
      <rect x="22" y="32" width="3" height="1.5" rx="0.75" fill="#38bdf8" transform="rotate(-20 22 32)" />
      <rect x="36" y="30" width="3" height="1.5" rx="0.75" fill="#facc15" transform="rotate(30 36 30)" />
      <rect x="44" y="34" width="3" height="1.5" rx="0.75" fill="#34d399" transform="rotate(-15 44 34)" />
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 4. FLAT CLAY CANDY (Kẹo Mút Xoắn Cầu Vồng Soft Clay Thay Thế 🍬)
// ════════════════════════════════════════════════════════════════════════════
export interface FlatClayCandyProps extends BaseFlatClayIconProps {
  colorScheme?: 'rainbow' | 'pink' | 'sky' | 'emerald'
}

export function FlatClayCandy({ size = 48, className }: FlatClayCandyProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  const filterId = `candy-shadow-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Kẹo mút xoắn tròn"
    >
      <defs>
        <filter id={filterId} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#78350f" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Stick */}
      <rect
        x="30"
        y="36"
        width="4.5"
        height="24"
        rx="2.25"
        fill="#fde68a"
        stroke="#d97706"
        strokeWidth="1.2"
      />

      {/* Lollipop Head */}
      <g filter={`url(#${filterId})`}>
        <circle cx="32" cy="24" r="19" fill="#f43f5e" stroke="#be123c" strokeWidth="1.8" />
        <path
          d="M 32 5 A 19 19 0 0 1 51 24 C 51 32 42 38 34 38 C 26 38 20 32 20 25 C 20 19 24 15 30 15 C 34 15 37 18 37 22 C 37 25 34 27 32 27 C 30 27 28 25 28 24"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 13 24 A 19 19 0 0 1 32 5 C 24 5 18 12 18 20 C 18 26 23 30 29 30 C 33 30 36 28 36 24"
          stroke="#facc15"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 32 43 A 19 19 0 0 1 13 24"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 22 11 C 26 8 36 8 40 11 C 36 10 27 10 23 13 C 21 14 20 18 20 22 C 19 18 19 13 22 11 Z"
          fill="#ffffff"
          opacity="0.6"
        />
      </g>
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 5. FLAT CLAY WATERMELON (Miếng Dưa Hấu Tam Giác Soft Clay Thay Thế 🍉)
// ════════════════════════════════════════════════════════════════════════════
export interface FlatClayWatermelonProps extends BaseFlatClayIconProps {}

export function FlatClayWatermelon({ size = 48, className }: FlatClayWatermelonProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  const gradId = `watermelon-grad-${idSuffix}`
  const filterId = `watermelon-shadow-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Miếng dưa hấu"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="70%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#be123c" />
        </linearGradient>
        <filter id={filterId} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#065f46" floodOpacity="0.25" />
        </filter>
      </defs>

      <g filter={`url(#${filterId})`}>
        <path
          d="M 8 46 Q 32 62 56 46 Q 32 54 8 46 Z"
          fill="#10b981"
          stroke="#047857"
          strokeWidth="1.8"
        />
        <path
          d="M 10 44 Q 32 56 54 44 Q 32 50 10 44 Z"
          fill="#ecfdf5"
        />
        <path
          d="M 32 10 L 53 43 Q 32 49 11 43 Z"
          fill={`url(#${gradId})`}
          stroke="#be123c"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M 32 22 Q 33 26 32 27 Q 31 26 32 22 Z" fill="#1e293b" />
        <path d="M 24 30 Q 25 34 24 35 Q 23 34 24 30 Z" fill="#1e293b" />
        <path d="M 22 40 Q 23 43 22 44 Q 21 43 22 40 Z" fill="#1e293b" />
        <path d="M 40 30 Q 41 34 40 35 Q 39 34 40 30 Z" fill="#1e293b" />
        <path d="M 42 40 Q 43 43 42 44 Q 41 43 42 40 Z" fill="#1e293b" />
        <path d="M 32 36 Q 33 39 32 40 Q 31 39 32 36 Z" fill="#1e293b" />
        <path
          d="M 32 12 L 15 41 Q 20 42 24 36 L 32 16 Z"
          fill="#ffffff"
          opacity="0.3"
        />
      </g>
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 6. FLAT CLAY PIZZA SLICE (Lát Pizza Soft Clay Thay Thế 🍕)
// ════════════════════════════════════════════════════════════════════════════
export interface FlatClayPizzaSliceProps extends BaseFlatClayIconProps {}

export function FlatClayPizzaSlice({ size = 48, className }: FlatClayPizzaSliceProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  const cheeseGradId = `pizza-cheese-${idSuffix}`
  const filterId = `pizza-shadow-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Lát pizza"
    >
      <defs>
        <linearGradient id={cheeseGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id={filterId} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#78350f" floodOpacity="0.25" />
        </filter>
      </defs>

      <g filter={`url(#${filterId})`}>
        <path
          d="M 10 18 Q 32 10 54 18 Q 55 24 50 25 Q 32 17 14 25 Q 9 24 10 18 Z"
          fill="#d97706"
          stroke="#92400e"
          strokeWidth="1.8"
        />
        <path
          d="M 13 23 Q 32 17 51 23 L 32 58 Z"
          fill={`url(#${cheeseGradId})`}
          stroke="#d97706"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="30" r="4.5" fill="#e11d48" stroke="#9f1239" strokeWidth="1.2" />
        <circle cx="30.5" cy="28.5" r="1.2" fill="#ffffff" opacity="0.6" />
        <circle cx="24" cy="42" r="3.8" fill="#e11d48" stroke="#9f1239" strokeWidth="1.2" />
        <circle cx="22.8" cy="40.8" r="1" fill="#ffffff" opacity="0.6" />
        <circle cx="40" cy="40" r="4" fill="#e11d48" stroke="#9f1239" strokeWidth="1.2" />
        <circle cx="38.5" cy="38.5" r="1" fill="#ffffff" opacity="0.6" />
        <ellipse cx="32" cy="46" rx="2" ry="1.2" fill="#16a34a" transform="rotate(-30 32 46)" />
        <ellipse cx="27" cy="28" rx="2" ry="1.2" fill="#16a34a" transform="rotate(20 27 28)" />
      </g>
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 7. FLAT CLAY CUBE (Khối Lập Phương Isometric Soft Clay Thay Thế 🧊)
// ════════════════════════════════════════════════════════════════════════════
export interface FlatClayCubeProps extends BaseFlatClayIconProps {}

const CUBE_COLOR_MAP: Record<
  string,
  {
    top: string
    left: string
    right: string
    stroke: string
    highlight: string
  }
> = {
  indigo: {
    top: '#a5b4fc',
    left: '#6366f1',
    right: '#4338ca',
    stroke: '#3730a3',
    highlight: '#e0e7ff',
  },
  purple: {
    top: '#c4b5fd',
    left: '#8b5cf6',
    right: '#6d28d9',
    stroke: '#5b21b6',
    highlight: '#ede9fe',
  },
  pink: {
    top: '#f9a8d4',
    left: '#ec4899',
    right: '#be185d',
    stroke: '#9d174d',
    highlight: '#fce7f3',
  },
  rose: {
    top: '#fda4af',
    left: '#f43f5e',
    right: '#be123c',
    stroke: '#9f1239',
    highlight: '#ffe4e6',
  },
  sky: {
    top: '#7dd3fc',
    left: '#0284c7',
    right: '#0369a1',
    stroke: '#075985',
    highlight: '#e0f2fe',
  },
  emerald: {
    top: '#6ee7b7',
    left: '#10b981',
    right: '#047857',
    stroke: '#065f46',
    highlight: '#d1fae5',
  },
  amber: {
    top: '#fcd34d',
    left: '#f59e0b',
    right: '#b45309',
    stroke: '#92400e',
    highlight: '#fef3c7',
  },
  teal: {
    top: '#5eead4',
    left: '#14b8a6',
    right: '#0f766e',
    stroke: '#115e59',
    highlight: '#ccfbf1',
  },
  orange: {
    top: '#fdba74',
    left: '#f97316',
    right: '#c2410c',
    stroke: '#9a3412',
    highlight: '#ffedd5',
  },
  lime: {
    top: '#bef264',
    left: '#84cc16',
    right: '#4d7c0f',
    stroke: '#3f6212',
    highlight: '#ecfccb',
  },
}

export function FlatClayCube({ size = 48, color = 'indigo', className }: FlatClayCubeProps) {
  const c = CUBE_COLOR_MAP[color] || CUBE_COLOR_MAP.indigo
  const idSuffix = React.useId().replace(/:/g, '')
  const filterId = `cube-shadow-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Khối lập phương isometric"
    >
      <defs>
        <filter id={filterId} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor={c.stroke} floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter={`url(#${filterId})`}>
        <path
          d="M 12 21 L 32 32 L 32 54 L 12 43 Z"
          fill={c.left}
          stroke={c.stroke}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M 32 32 L 52 21 L 52 43 L 32 54 Z"
          fill={c.right}
          stroke={c.stroke}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M 32 10 L 52 21 L 32 32 L 12 21 Z"
          fill={c.top}
          stroke={c.stroke}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M 14 21 L 32 31 L 50 21"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.6"
        />
        <circle cx="32" cy="14" r="2" fill="#ffffff" opacity="0.6" />
      </g>
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 8. FLAT CLAY APPLES (Quả Táo Đỏ & Táo Xanh Soft Clay Thay Thế 🍎 / 🍏)
// ════════════════════════════════════════════════════════════════════════════
export interface FlatClayAppleProps extends BaseFlatClayIconProps {
  number?: number | string
}

export function FlatClayRedApple({ size = 48, number, className }: FlatClayAppleProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  const gradId = `apple-red-grad-${idSuffix}`
  const filterId = `apple-red-shadow-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label={number !== undefined ? `Quả táo đỏ số ${number}` : 'Quả táo đỏ'}
    >
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="70%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#9f1239" />
        </radialGradient>
        <filter id={filterId} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#9f1239" floodOpacity="0.3" />
        </filter>
      </defs>

      <path
        d="M 32 16 C 32 10 36 6 39 4"
        stroke="#78350f"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 34 12 Q 44 8 46 14 Q 40 18 34 12 Z"
        fill="#22c55e"
        stroke="#15803d"
        strokeWidth="1.2"
      />

      <g filter={`url(#${filterId})`}>
        <path
          d="M 32 18 C 26 14 13 14 11 28 C 9 40 21 54 32 58 C 43 54 55 40 53 28 C 51 14 38 14 32 18 Z"
          fill={`url(#${gradId})`}
          stroke="#9f1239"
          strokeWidth="1.8"
        />
      </g>

      <path
        d="M 20 22 C 24 18 30 18 32 20 C 28 19 23 20 19 24 C 17 26 16 30 16 34 C 15 30 16 25 20 22 Z"
        fill="#ffffff"
        opacity="0.65"
      />
      <circle cx="44" cy="26" r="2" fill="#ffffff" opacity="0.4" />

      {number !== undefined && (
        <text
          x="32"
          y="36"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#ffffff"
          fontWeight="900"
          fontSize="18"
          fontFamily="system-ui, -apple-system, sans-serif"
          className="drop-shadow-sm font-display select-none"
        >
          {number}
        </text>
      )}
    </svg>
  )
}

export function FlatClayGreenApple({ size = 48, number, className }: FlatClayAppleProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  const gradId = `apple-green-grad-${idSuffix}`
  const filterId = `apple-green-shadow-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label={number !== undefined ? `Quả táo xanh số ${number}` : 'Quả táo xanh'}
    >
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="70%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#14532d" />
        </radialGradient>
        <filter id={filterId} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#14532d" floodOpacity="0.3" />
        </filter>
      </defs>

      <path
        d="M 32 16 C 32 10 36 6 39 4"
        stroke="#78350f"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 34 12 Q 44 8 46 14 Q 40 18 34 12 Z"
        fill="#86efac"
        stroke="#15803d"
        strokeWidth="1.2"
      />

      <g filter={`url(#${filterId})`}>
        <path
          d="M 32 18 C 26 14 13 14 11 28 C 9 40 21 54 32 58 C 43 54 55 40 53 28 C 51 14 38 14 32 18 Z"
          fill={`url(#${gradId})`}
          stroke="#14532d"
          strokeWidth="1.8"
        />
      </g>

      <path
        d="M 20 22 C 24 18 30 18 32 20 C 28 19 23 20 19 24 C 17 26 16 30 16 34 C 15 30 16 25 20 22 Z"
        fill="#ffffff"
        opacity="0.65"
      />
      <circle cx="44" cy="26" r="2" fill="#ffffff" opacity="0.4" />

      {number !== undefined && (
        <text
          x="32"
          y="36"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#ffffff"
          fontWeight="900"
          fontSize="18"
          fontFamily="system-ui, -apple-system, sans-serif"
          className="drop-shadow-sm font-display select-none"
        >
          {number}
        </text>
      )}
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 9. CHẶNG HỌC & ĐẢO HỌC TẬP (ISLANDS 1 - 5)
// ════════════════════════════════════════════════════════════════════════════

export interface FlatClayIslandProps extends BaseFlatClayIconProps {}

/** Đảo Rừng Táo - Chặng 1 */
export function FlatClayIslandForest({ size = 64, className }: FlatClayIslandProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Đảo Rừng Táo"
    >
      <defs>
        <radialGradient id={`isl-for-soil-${idSuffix}`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </radialGradient>
        <radialGradient id={`isl-for-grass-${idSuffix}`} cx="50%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="70%" stopColor="#059669" />
          <stop offset="100%" stopColor="#065f46" />
        </radialGradient>
        <filter id={`isl-for-sh-${idSuffix}`} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#065f46" floodOpacity="0.3" />
        </filter>
      </defs>
      <g filter={`url(#${`isl-for-sh-${idSuffix}`})`}>
        {/* Floating Island Earth Base */}
        <path
          d="M 6 36 C 8 46 20 58 32 60 C 44 58 56 46 58 36 C 54 42 10 42 6 36 Z"
          fill={`url(#${`isl-for-soil-${idSuffix}`})`}
          stroke="#451a03"
          strokeWidth="1.6"
        />
        {/* Strata Rocks */}
        <ellipse cx="28" cy="48" rx="5" ry="3" fill="#92400e" opacity="0.6" />
        <ellipse cx="40" cy="45" rx="4" ry="2.5" fill="#92400e" opacity="0.6" />

        {/* Lush Grass Surface Plate */}
        <path
          d="M 4 34 C 4 25 18 20 32 20 C 46 20 60 25 60 34 C 60 41 46 44 32 44 C 18 44 4 41 4 34 Z"
          fill={`url(#${`isl-for-grass-${idSuffix}`})`}
          stroke="#047857"
          strokeWidth="1.8"
        />
        {/* Stream */}
        <path
          d="M 28 22 Q 34 32 30 44"
          stroke="#38bdf8"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Tree Left */}
        <rect x="15" y="16" width="3" height="12" rx="1.5" fill="#78350f" />
        <circle cx="16.5" cy="14" r="8" fill="#10b981" stroke="#047857" strokeWidth="1.2" />
        <circle cx="14" cy="12" r="2.2" fill="#ef4444" stroke="#991b1b" strokeWidth="0.8" />
        <circle cx="19" cy="15" r="2.2" fill="#ef4444" stroke="#991b1b" strokeWidth="0.8" />

        {/* Tree Right */}
        <rect x="45" y="14" width="3.5" height="14" rx="1.5" fill="#78350f" />
        <circle cx="47" cy="12" r="9" fill="#059669" stroke="#065f46" strokeWidth="1.2" />
        <circle cx="44" cy="9" r="2.5" fill="#ef4444" stroke="#991b1b" strokeWidth="0.8" />
        <circle cx="49" cy="13" r="2.2" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />

        {/* Cute Mushroom */}
        <path d="M 24 35 Q 26 31 28 35 Z" fill="#f43f5e" stroke="#9f1239" strokeWidth="0.8" />
        <rect x="25.5" y="35" width="1.5" height="3" rx="0.75" fill="#ffffff" />
      </g>
    </svg>
  )
}

/** Đảo Bánh Ngọt - Chặng 2 */
export function FlatClayIslandBakery({ size = 64, className }: FlatClayIslandProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Đảo Bánh Ngọt"
    >
      <defs>
        <radialGradient id={`isl-bak-cake-${idSuffix}`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#ea580c" />
        </radialGradient>
        <linearGradient id={`isl-bak-frost-${idSuffix}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fbcfe8" />
          <stop offset="60%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
        <filter id={`isl-bak-sh-${idSuffix}`} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#9d174d" floodOpacity="0.3" />
        </filter>
      </defs>
      <g filter={`url(#${`isl-bak-sh-${idSuffix}`})`}>
        {/* Sponge Cake Base */}
        <path
          d="M 6 36 C 8 46 20 58 32 60 C 44 58 56 46 58 36 C 54 42 10 42 6 36 Z"
          fill={`url(#${`isl-bak-cake-${idSuffix}`})`}
          stroke="#c2410c"
          strokeWidth="1.6"
        />
        {/* Cream Fillings */}
        <path d="M 12 42 Q 32 46 52 42" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

        {/* Pink Frosting Plateau */}
        <path
          d="M 4 34 C 4 25 18 20 32 20 C 46 20 60 25 60 34 C 60 41 46 44 32 44 C 18 44 4 41 4 34 Z"
          fill={`url(#${`isl-bak-frost-${idSuffix}`})`}
          stroke="#be185d"
          strokeWidth="1.8"
        />
        {/* Frosting Drips */}
        <path
          d="M 10 36 C 12 40 16 40 18 36 C 20 42 24 42 26 36 C 30 42 34 42 36 36 C 40 42 44 42 46 36 C 50 40 54 40 56 36"
          stroke="#fdf2f8"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Bakery Cupcake Dome Castle */}
        <path
          d="M 24 24 C 24 14 40 14 40 24 Z"
          fill="#fef08a"
          stroke="#ca8a04"
          strokeWidth="1.5"
        />
        <circle cx="32" cy="12" r="4.5" fill="#e11d48" stroke="#9f1239" strokeWidth="1.2" />
        <circle cx="30.5" cy="10.5" r="1.2" fill="#ffffff" />
        <path d="M 32 7.5 Q 36 4 39 6" stroke="#15803d" strokeWidth="1.4" strokeLinecap="round" fill="none" />

        {/* Candy Canes / Wafers */}
        <rect x="14" y="16" width="4" height="14" rx="2" fill="#ffffff" stroke="#e11d48" strokeWidth="1" />
        <line x1="14" y1="20" x2="18" y2="18" stroke="#e11d48" strokeWidth="1.5" />
        <line x1="14" y1="25" x2="18" y2="23" stroke="#e11d48" strokeWidth="1.5" />

        {/* Sprinkles */}
        <rect x="20" y="29" width="3" height="1.5" rx="0.75" fill="#38bdf8" transform="rotate(-15 20 29)" />
        <rect x="44" y="27" width="3" height="1.5" rx="0.75" fill="#facc15" transform="rotate(25 44 27)" />
      </g>
    </svg>
  )
}

/** Đảo Pizza Phân Số - Chặng 3 */
export function FlatClayIslandPizza({ size = 64, className }: FlatClayIslandProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Đảo Pizza Phân Số"
    >
      <defs>
        <radialGradient id={`isl-piz-crust-${idSuffix}`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#92400e" />
        </radialGradient>
        <linearGradient id={`isl-piz-cheese-${idSuffix}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="70%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id={`isl-piz-sh-${idSuffix}`} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#78350f" floodOpacity="0.3" />
        </filter>
      </defs>
      <g filter={`url(#${`isl-piz-sh-${idSuffix}`})`}>
        {/* Baked Crust Island Base */}
        <path
          d="M 6 36 C 8 46 20 58 32 60 C 44 58 56 46 58 36 C 54 42 10 42 6 36 Z"
          fill={`url(#${`isl-piz-crust-${idSuffix}`})`}
          stroke="#78350f"
          strokeWidth="1.6"
        />

        {/* Melted Cheese Surface */}
        <path
          d="M 4 34 C 4 25 18 20 32 20 C 46 20 60 25 60 34 C 60 41 46 44 32 44 C 18 44 4 41 4 34 Z"
          fill={`url(#${`isl-piz-cheese-${idSuffix}`})`}
          stroke="#b45309"
          strokeWidth="1.8"
        />

        {/* Fraction Cut Slices Lines (1/2, 1/4) */}
        <line x1="32" y1="20" x2="32" y2="44" stroke="#d97706" strokeWidth="2.2" strokeDasharray="3,2" />
        <line x1="6" y1="34" x2="58" y2="34" stroke="#d97706" strokeWidth="2.2" strokeDasharray="3,2" />

        {/* Floating Fraction Slice Lift-up */}
        <path
          d="M 28 8 L 44 14 L 32 26 Z"
          fill="#fef08a"
          stroke="#d97706"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <circle cx="36" cy="14" r="2.5" fill="#e11d48" stroke="#9f1239" strokeWidth="0.8" />

        {/* Pepperoni Slices on Ground */}
        <circle cx="20" cy="28" r="4" fill="#e11d48" stroke="#9f1239" strokeWidth="1.2" />
        <circle cx="18.5" cy="26.8" r="1.2" fill="#ffffff" opacity="0.6" />

        <circle cx="44" cy="30" r="4.2" fill="#e11d48" stroke="#9f1239" strokeWidth="1.2" />
        <circle cx="42.5" cy="28.8" r="1.2" fill="#ffffff" opacity="0.6" />

        <circle cx="30" cy="38" r="3.5" fill="#e11d48" stroke="#9f1239" strokeWidth="1" />

        {/* Basil Leaves */}
        <ellipse cx="23" cy="37" rx="2.5" ry="1.4" fill="#16a34a" transform="rotate(-30 23 37)" />
        <ellipse cx="40" cy="38" rx="2.5" ry="1.4" fill="#16a34a" transform="rotate(30 40 38)" />
      </g>
    </svg>
  )
}

/** Đảo Đồng Hồ & Cân Thăng Bằng - Chặng 4 */
export function FlatClayIslandClock({ size = 64, className }: FlatClayIslandProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Đảo Đồng Hồ & Cân Thăng Bằng"
    >
      <defs>
        <radialGradient id={`isl-clk-base-${idSuffix}`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#075985" />
        </radialGradient>
        <radialGradient id={`isl-clk-top-${idSuffix}`} cx="50%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="70%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </radialGradient>
        <filter id={`isl-clk-sh-${idSuffix}`} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#075985" floodOpacity="0.3" />
        </filter>
      </defs>
      <g filter={`url(#${`isl-clk-sh-${idSuffix}`})`}>
        {/* Sky Island Base */}
        <path
          d="M 6 36 C 8 46 20 58 32 60 C 44 58 56 46 58 36 C 54 42 10 42 6 36 Z"
          fill={`url(#${`isl-clk-base-${idSuffix}`})`}
          stroke="#0369a1"
          strokeWidth="1.6"
        />

        {/* Surface */}
        <path
          d="M 4 34 C 4 25 18 20 32 20 C 46 20 60 25 60 34 C 60 41 46 44 32 44 C 18 44 4 41 4 34 Z"
          fill={`url(#${`isl-clk-top-${idSuffix}`})`}
          stroke="#0284c7"
          strokeWidth="1.8"
        />

        {/* Clock Tower Center */}
        <rect x="26" y="16" width="12" height="18" rx="3" fill="#f8fafc" stroke="#64748b" strokeWidth="1.4" />
        <circle cx="32" cy="12" r="9" fill="#fef08a" stroke="#d97706" strokeWidth="1.6" />
        <line x1="32" y1="12" x2="32" y2="7" stroke="#78350f" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="32" y1="12" x2="36" y2="12" stroke="#78350f" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="32" cy="12" r="1.5" fill="#e11d48" />

        {/* Balance Scale Left */}
        <line x1="12" y1="26" x2="22" y2="26" stroke="#475569" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="17" y1="26" x2="17" y2="35" stroke="#475569" strokeWidth="1.6" />
        <path d="M 10 29 Q 12 33 14 29 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />
        <path d="M 20 29 Q 22 33 24 29 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />
        <circle cx="12" cy="28" r="1.5" fill="#f59e0b" />
        <circle cx="22" cy="28" r="1.5" fill="#10b981" />

        {/* Hourglass Right */}
        <path
          d="M 46 22 L 54 22 L 50 27 L 54 32 L 46 32 L 50 27 Z"
          fill="#ede9fe"
          stroke="#7c3aed"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="29" r="1.2" fill="#fbbf24" />
      </g>
    </svg>
  )
}

/** Đảo Pha Lê & Lâu Đài 3D - Chặng 5 */
export function FlatClayIslandCrystal({ size = 64, className }: FlatClayIslandProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Đảo Pha Lê & Lâu Đài 3D"
    >
      <defs>
        <radialGradient id={`isl-cry-base-${idSuffix}`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4c1d95" />
        </radialGradient>
        <radialGradient id={`isl-cry-top-${idSuffix}`} cx="50%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="70%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6d28d9" />
        </radialGradient>
        <filter id={`isl-cry-sh-${idSuffix}`} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#4c1d95" floodOpacity="0.35" />
        </filter>
      </defs>
      <g filter={`url(#${`isl-cry-sh-${idSuffix}`})`}>
        {/* Crystal Amethyst Island Base */}
        <path
          d="M 6 36 C 8 46 20 58 32 60 C 44 58 56 46 58 36 C 54 42 10 42 6 36 Z"
          fill={`url(#${`isl-cry-base-${idSuffix}`})`}
          stroke="#4c1d95"
          strokeWidth="1.6"
        />

        {/* Plateau */}
        <path
          d="M 4 34 C 4 25 18 20 32 20 C 46 20 60 25 60 34 C 60 41 46 44 32 44 C 18 44 4 41 4 34 Z"
          fill={`url(#${`isl-cry-top-${idSuffix}`})`}
          stroke="#5b21b6"
          strokeWidth="1.8"
        />

        {/* 3D Isometric Castle Tower in Center */}
        {/* Left Face */}
        <path d="M 26 14 L 32 18 L 32 30 L 26 26 Z" fill="#6366f1" stroke="#3730a3" strokeWidth="1.2" />
        {/* Right Face */}
        <path d="M 32 18 L 38 14 L 38 26 L 32 30 Z" fill="#4338ca" stroke="#3730a3" strokeWidth="1.2" />
        {/* Top Face */}
        <path d="M 32 8 L 38 14 L 32 18 L 26 14 Z" fill="#a5b4fc" stroke="#3730a3" strokeWidth="1.2" />

        {/* Crystal Spires */}
        {/* Left Spire */}
        <path
          d="M 16 28 L 13 14 L 18 16 L 21 28 Z"
          fill="#38bdf8"
          stroke="#0369a1"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Right Spire */}
        <path
          d="M 44 28 L 48 12 L 52 17 L 49 28 Z"
          fill="#f472b6"
          stroke="#be185d"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Sparkle Glints */}
        <polygon points="32,4 33.5,7 36,8 33.5,9 32,12 30.5,9 28,8 30.5,7" fill="#fef08a" />
        <circle cx="12" cy="12" r="1.5" fill="#ffffff" />
        <circle cx="52" cy="10" r="1.5" fill="#fef08a" />
      </g>
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 10. TOÁN HỌC & ĐỒ VẬT MONTESSORI (CLOCK, SCALE, CUBENET, MATCHSTICK, COMPASS, COLUMN CALC)
// ════════════════════════════════════════════════════════════════════════════

/** Mặt đồng hồ kim Soft Clay */
export interface FlatClayClockProps extends BaseFlatClayIconProps {
  hours?: number
  minutes?: number
}

export function FlatClayClock({ size = 48, hours = 3, minutes = 0, className }: FlatClayClockProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  const filterId = `clock-shadow-${idSuffix}`
  const gradId = `clock-grad-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label={`Đồng hồ kim ${hours}:${minutes < 10 ? '0' : ''}${minutes}`}
    >
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="85%" stopColor="#e0e7ff" />
          <stop offset="100%" stopColor="#c7d2fe" />
        </radialGradient>
        <filter id={filterId} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#3730a3" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Bell / Ear Bumpers on top */}
      <circle cx="16" cy="14" r="5" fill="#fbbf24" stroke="#d97706" strokeWidth="1.4" />
      <circle cx="48" cy="14" r="5" fill="#fbbf24" stroke="#d97706" strokeWidth="1.4" />

      {/* Feet Base */}
      <rect x="18" y="52" width="5" height="6" rx="2" fill="#64748b" />
      <rect x="41" y="52" width="5" height="6" rx="2" fill="#64748b" />

      {/* Outer Case */}
      <g filter={`url(#${filterId})`}>
        <circle cx="32" cy="34" r="24" fill="#6366f1" stroke="#4338ca" strokeWidth="2" />
        <circle cx="32" cy="34" r="19" fill={`url(#${gradId})`} stroke="#818cf8" strokeWidth="1.4" />
      </g>

      {/* Dial Hour Dots */}
      <circle cx="32" cy="19" r="2" fill="#4338ca" />
      <circle cx="47" cy="34" r="2" fill="#4338ca" />
      <circle cx="32" cy="49" r="2" fill="#4338ca" />
      <circle cx="17" cy="34" r="2" fill="#4338ca" />

      {/* Minor Ticks */}
      <circle cx="42.6" cy="23.4" r="1" fill="#94a3b8" />
      <circle cx="42.6" cy="44.6" r="1" fill="#94a3b8" />
      <circle cx="21.4" cy="44.6" r="1" fill="#94a3b8" />
      <circle cx="21.4" cy="23.4" r="1" fill="#94a3b8" />

      {/* Hands */}
      {/* Hour Hand (Points to 3 o'clock) */}
      <line x1="32" y1="34" x2="42" y2="34" stroke="#1e293b" strokeWidth="3.2" strokeLinecap="round" />
      {/* Minute Hand (Points to 12 o'clock) */}
      <line x1="32" y1="34" x2="32" y2="22" stroke="#e11d48" strokeWidth="2.4" strokeLinecap="round" />

      {/* Center Pin */}
      <circle cx="32" cy="34" r="2.8" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
      <circle cx="31" cy="33" r="0.8" fill="#ffffff" />
    </svg>
  )
}

/** Cân đĩa thăng bằng Soft Clay */
export interface FlatClayScaleProps extends BaseFlatClayIconProps {
  tilt?: 'balanced' | 'left' | 'right'
}

export function FlatClayScale({ size = 48, tilt = 'balanced', className }: FlatClayScaleProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  const filterId = `scale-shadow-${idSuffix}`

  const beamAngle = tilt === 'left' ? -12 : tilt === 'right' ? 12 : 0

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Cân đĩa thăng bằng"
    >
      <defs>
        <filter id={filterId} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.25" />
        </filter>
      </defs>

      <g filter={`url(#${filterId})`}>
        {/* Base Pedestal */}
        <path
          d="M 16 56 C 16 52 24 50 32 50 C 40 50 48 52 48 56 Z"
          fill="#3b82f6"
          stroke="#1d4ed8"
          strokeWidth="1.6"
        />

        {/* Central Stand Column */}
        <rect x="30" y="16" width="4" height="36" rx="2" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="1.4" />
        <circle cx="32" cy="16" r="4.5" fill="#f59e0b" stroke="#b45309" strokeWidth="1.2" />
        <circle cx="31" cy="15" r="1" fill="#ffffff" />

        {/* Tilting Beam Group */}
        <g transform={`rotate(${beamAngle} 32 16)`}>
          {/* Main Beam */}
          <rect x="8" y="14" width="48" height="4" rx="2" fill="#f59e0b" stroke="#b45309" strokeWidth="1.4" />

          {/* Left Pan Setup */}
          <line x1="12" y1="18" x2="8" y2="34" stroke="#94a3b8" strokeWidth="1.2" />
          <line x1="12" y1="18" x2="16" y2="34" stroke="#94a3b8" strokeWidth="1.2" />
          <path
            d="M 6 34 Q 12 40 18 34 Z"
            fill="#38bdf8"
            stroke="#0284c7"
            strokeWidth="1.4"
          />
          {/* Left Apple Weight */}
          <circle cx="12" cy="32" r="3.5" fill="#e11d48" stroke="#9f1239" strokeWidth="0.8" />

          {/* Right Pan Setup */}
          <line x1="52" y1="18" x2="48" y2="34" stroke="#94a3b8" strokeWidth="1.2" />
          <line x1="52" y1="18" x2="56" y2="34" stroke="#94a3b8" strokeWidth="1.2" />
          <path
            d="M 46 34 Q 52 40 58 34 Z"
            fill="#38bdf8"
            stroke="#0284c7"
            strokeWidth="1.4"
          />
          {/* Right Cube Weight */}
          <rect x="50" y="28" width="5" height="5" rx="1" fill="#10b981" stroke="#047857" strokeWidth="0.8" />
        </g>
      </g>
    </svg>
  )
}

/** Lưới gấp hộp 6 mặt Soft Clay */
export interface FlatClayCubeNetProps extends BaseFlatClayIconProps {}

export function FlatClayCubeNet({ size = 48, className }: FlatClayCubeNetProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  const filterId = `cubenet-shadow-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Lưới gấp hộp 6 mặt"
    >
      <defs>
        <filter id={filterId} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#3730a3" floodOpacity="0.25" />
        </filter>
      </defs>

      <g filter={`url(#${filterId})`}>
        {/* Top Face (Row 1, Col 2) */}
        <rect x="24" y="4" width="16" height="14" rx="2" fill="#fda4af" stroke="#e11d48" strokeWidth="1.4" />
        <text x="32" y="12" textAnchor="middle" dominantBaseline="central" fontSize="8" fontWeight="bold" fill="#9f1239">1</text>

        {/* Row 2: 4 Faces Left to Right */}
        {/* Face 2 (Col 1) */}
        <rect x="6" y="20" width="16" height="14" rx="2" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.4" />
        <text x="14" y="28" textAnchor="middle" dominantBaseline="central" fontSize="8" fontWeight="bold" fill="#9a3412">2</text>

        {/* Face 3 (Col 2 - Center) */}
        <rect x="24" y="20" width="16" height="14" rx="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.4" />
        <text x="32" y="28" textAnchor="middle" dominantBaseline="central" fontSize="8" fontWeight="bold" fill="#854d0e">3</text>

        {/* Face 4 (Col 3) */}
        <rect x="42" y="20" width="16" height="14" rx="2" fill="#a7f3d0" stroke="#059669" strokeWidth="1.4" />
        <text x="50" y="28" textAnchor="middle" dominantBaseline="central" fontSize="8" fontWeight="bold" fill="#065f46">4</text>

        {/* Face 5 (Row 3, Col 2) */}
        <rect x="24" y="36" width="16" height="14" rx="2" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.4" />
        <text x="32" y="44" textAnchor="middle" dominantBaseline="central" fontSize="8" fontWeight="bold" fill="#075985">5</text>

        {/* Face 6 (Row 4, Col 2) */}
        <rect x="24" y="52" width="16" height="10" rx="2" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="1.4" />
        <text x="32" y="58" textAnchor="middle" dominantBaseline="central" fontSize="8" fontWeight="bold" fill="#5b21b6">6</text>

        {/* Dotted Fold Lines */}
        <line x1="24" y1="19" x2="40" y2="19" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="2,2" />
        <line x1="23" y1="20" x2="23" y2="34" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="2,2" />
        <line x1="41" y1="20" x2="41" y2="34" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="2,2" />
        <line x1="24" y1="35" x2="40" y2="35" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="2,2" />
        <line x1="24" y1="51" x2="40" y2="51" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="2,2" />
      </g>
    </svg>
  )
}

/** Que diêm đầu đỏ Soft Clay */
export interface FlatClayMatchstickProps extends BaseFlatClayIconProps {
  lit?: boolean
}

export function FlatClayMatchstick({ size = 48, lit = true, className }: FlatClayMatchstickProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  const filterId = `match-shadow-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Que diêm đầu đỏ"
    >
      <defs>
        <filter id={filterId} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#78350f" floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter={`url(#${filterId})`}>
        {/* Wooden Stick */}
        <rect
          x="28"
          y="20"
          width="8"
          height="40"
          rx="3"
          fill="#fed7aa"
          stroke="#ea580c"
          strokeWidth="1.6"
        />

        {/* Wood Texture Lines */}
        <line x1="32" y1="26" x2="32" y2="54" stroke="#f97316" strokeWidth="1" opacity="0.5" />

        {/* Sulfur Head */}
        <ellipse cx="32" cy="18" rx="6.5" ry="8" fill="#e11d48" stroke="#9f1239" strokeWidth="1.6" />
        <circle cx="30" cy="15" r="2" fill="#ffffff" opacity="0.6" />

        {/* Optional Flame */}
        {lit && (
          <path
            d="M 32 2 Q 38 8 35 13 Q 32 14 29 13 Q 26 8 32 2 Z"
            fill="#facc15"
            stroke="#f97316"
            strokeWidth="1"
          />
        )}
      </g>
    </svg>
  )
}

/** La bàn & Mê cung tọa độ Soft Clay */
export interface FlatClayCompassProps extends BaseFlatClayIconProps {}

export function FlatClayCompass({ size = 48, className }: FlatClayCompassProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  const filterId = `compass-shadow-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="La bàn tọa độ"
    >
      <defs>
        <filter id={filterId} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#075985" floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter={`url(#${filterId})`}>
        {/* Outer Casing Ring */}
        <circle cx="32" cy="32" r="27" fill="#38bdf8" stroke="#0284c7" strokeWidth="2.2" />
        <circle cx="32" cy="32" r="22" fill="#ffffff" stroke="#bae6fd" strokeWidth="1.6" />

        {/* Direction Cross Ticks */}
        <line x1="32" y1="12" x2="32" y2="52" stroke="#cbd5e1" strokeWidth="1.2" />
        <line x1="12" y1="32" x2="52" y2="32" stroke="#cbd5e1" strokeWidth="1.2" />

        {/* Cardinal Badges */}
        <text x="32" y="17" textAnchor="middle" dominantBaseline="central" fontSize="7" fontWeight="bold" fill="#e11d48">N</text>
        <text x="47" y="32" textAnchor="middle" dominantBaseline="central" fontSize="7" fontWeight="bold" fill="#64748b">E</text>
        <text x="32" y="47" textAnchor="middle" dominantBaseline="central" fontSize="7" fontWeight="bold" fill="#0284c7">S</text>
        <text x="17" y="32" textAnchor="middle" dominantBaseline="central" fontSize="7" fontWeight="bold" fill="#64748b">W</text>

        {/* Needle */}
        {/* North Pointer (Red) */}
        <polygon points="32,15 36,32 32,30 28,32" fill="#e11d48" stroke="#9f1239" strokeWidth="1" strokeLinejoin="round" />
        {/* South Pointer (Blue) */}
        <polygon points="32,49 36,32 32,34 28,32" fill="#0284c7" stroke="#0369a1" strokeWidth="1" strokeLinejoin="round" />

        {/* Center Cap */}
        <circle cx="32" cy="32" r="3.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
        <circle cx="31" cy="31" r="1" fill="#ffffff" />
      </g>
    </svg>
  )
}

/** Mô hình bảng tính cột dọc Soft Clay (Đặt tính có nhớ) */
export interface FlatClayColumnCalcProps extends BaseFlatClayIconProps {}

export function FlatClayColumnCalc({ size = 48, className }: FlatClayColumnCalcProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  const filterId = `calc-shadow-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Mô hình bảng tính cột dọc"
    >
      <defs>
        <filter id={filterId} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#3730a3" floodOpacity="0.25" />
        </filter>
      </defs>

      <g filter={`url(#${filterId})`}>
        {/* Blackboard / Tablet Frame */}
        <rect x="8" y="6" width="48" height="52" rx="6" fill="#ede9fe" stroke="#6366f1" strokeWidth="2" />

        {/* Carry Bubble on top (Số nhớ 1) */}
        <circle cx="28" cy="14" r="4.5" fill="#f43f5e" stroke="#be123c" strokeWidth="1" />
        <text x="28" y="14" textAnchor="middle" dominantBaseline="central" fontSize="7" fontWeight="bold" fill="#ffffff">1</text>

        {/* Digits Line 1: 4 8 */}
        <text x="28" y="24" textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="900" fill="#1e293b">4</text>
        <text x="42" y="24" textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="900" fill="#1e293b">8</text>

        {/* Operator + Digits Line 2: + 3 7 */}
        <text x="16" y="35" textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="900" fill="#6366f1">+</text>
        <text x="28" y="35" textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="900" fill="#1e293b">3</text>
        <text x="42" y="35" textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="900" fill="#1e293b">7</text>

        {/* Horizontal Equal Line */}
        <line x1="14" y1="42" x2="50" y2="42" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" />

        {/* Result Line 3: 8 5 */}
        <text x="28" y="50" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="900" fill="#059669">8</text>
        <text x="42" y="50" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="900" fill="#059669">5</text>
      </g>
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 11. OLYMPIC, CHUYÊN ĐỀ & GAMIFICATION (TROPHY, MEDAL, STAR, ZAP, HEART, TARGET, SHIELD, DIAMOND, SPARKLES)
// ════════════════════════════════════════════════════════════════════════════

/** Cúp vàng Olympic Soft Clay */
export interface FlatClayTrophyProps extends BaseFlatClayIconProps {}

export function FlatClayTrophy({ size = 48, className }: FlatClayTrophyProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  const gradId = `trophy-grad-${idSuffix}`
  const filterId = `trophy-shadow-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Cúp vàng Olympic"
    >
      <defs>
        <radialGradient id={gradId} cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
        <filter id={filterId} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#78350f" floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter={`url(#${filterId})`}>
        {/* Handles */}
        <path
          d="M 12 18 C 6 18 6 32 18 34"
          stroke="#ca8a04"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 52 18 C 58 18 58 32 46 34"
          stroke="#ca8a04"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Trophy Cup Body */}
        <path
          d="M 16 10 L 48 10 C 48 28 40 38 32 38 C 24 38 16 28 16 10 Z"
          fill={`url(#${gradId})`}
          stroke="#b45309"
          strokeWidth="1.8"
        />

        {/* Embossed Star on Cup */}
        <polygon
          points="32,16 33.8,21.5 39,21.5 35,24.8 36.5,30 32,26.8 27.5,30 29,24.8 25,21.5 30.2,21.5"
          fill="#ffffff"
          opacity="0.85"
        />

        {/* Stem */}
        <rect x="28" y="38" width="8" height="10" rx="2" fill="#ca8a04" stroke="#92400e" strokeWidth="1.4" />

        {/* Pedestal Base */}
        <rect x="18" y="48" width="28" height="10" rx="3" fill="#78350f" stroke="#451a03" strokeWidth="1.6" />
        <rect x="22" y="50" width="20" height="4" rx="1.5" fill="#facc15" />

        {/* Glossy Glaze Highlight */}
        <path
          d="M 20 13 C 24 11 30 11 32 12 C 26 12 21 14 20 18 Z"
          fill="#ffffff"
          opacity="0.6"
        />
      </g>
    </svg>
  )
}

/** Huy chương Olympic Soft Clay (Gold / Silver / Bronze) */
export interface FlatClayMedalProps extends BaseFlatClayIconProps {
  tier?: 'gold' | 'silver' | 'bronze'
  rank?: 1 | 2 | 3
}

export function FlatClayMedal({ size = 48, tier = 'gold', rank = 1, className }: FlatClayMedalProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  const filterId = `medal-shadow-${idSuffix}`

  const resolvedTier = tier || (rank === 2 ? 'silver' : rank === 3 ? 'bronze' : 'gold')

  const colors = {
    gold: { start: '#fef08a', end: '#f59e0b', stroke: '#b45309', label: '1', numColor: '#78350f' },
    silver: { start: '#f1f5f9', end: '#94a3b8', stroke: '#475569', label: '2', numColor: '#1e293b' },
    bronze: { start: '#fed7aa', end: '#ea580c', stroke: '#9a3412', label: '3', numColor: '#451a03' },
  }[resolvedTier] || { start: '#fef08a', end: '#f59e0b', stroke: '#b45309', label: '1', numColor: '#78350f' }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label={`Huy chương ${resolvedTier}`}
    >
      <defs>
        <radialGradient id={`medal-grad-${idSuffix}`} cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor={colors.start} />
          <stop offset="100%" stopColor={colors.end} />
        </radialGradient>
        <filter id={filterId} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor={colors.stroke} floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Ribbons Top (V-Shape) */}
      <path d="M 22 4 L 32 30 L 26 30 L 14 4 Z" fill="#6d5efc" stroke="#4f46e5" strokeWidth="1" />
      <path d="M 42 4 L 32 30 L 38 30 L 50 4 Z" fill="#f43f5e" stroke="#e11d48" strokeWidth="1" />

      {/* Medallion Disc */}
      <g filter={`url(#${filterId})`}>
        <circle cx="32" cy="38" r="18" fill={`url(#${`medal-grad-${idSuffix}`})`} stroke={colors.stroke} strokeWidth="2" />
        <circle cx="32" cy="38" r="14" fill="none" stroke={colors.stroke} strokeWidth="1.2" strokeDasharray="3,2" />

        {/* Rank Number */}
        <text
          x="32"
          y="38"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="16"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill={colors.numColor}
          className="font-display"
        >
          {colors.label}
        </text>

        {/* Specular Highlight */}
        <path
          d="M 22 26 C 26 22 36 22 40 24 C 34 24 26 26 23 30 Z"
          fill="#ffffff"
          opacity="0.6"
        />
      </g>
    </svg>
  )
}

/** Ngôi sao vàng Soft Clay */
export interface FlatClayStarProps extends BaseFlatClayIconProps {
  filled?: boolean
}

export function FlatClayStar({ size = 48, filled = true, className }: FlatClayStarProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  const gradId = `star-grad-${idSuffix}`
  const filterId = `star-shadow-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Ngôi sao vàng"
    >
      <defs>
        <radialGradient id={gradId} cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
        <filter id={filterId} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#b45309" floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter={`url(#${filterId})`}>
        <path
          d="M 32 6 L 39.5 22 L 57 23 L 43.5 34.5 L 48 52 L 32 42 L 16 52 L 20.5 34.5 L 7 23 L 24.5 22 Z"
          fill={filled ? `url(#${gradId})` : '#f1f5f9'}
          stroke={filled ? '#b45309' : '#cbd5e1'}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />

        {filled && (
          <>
            {/* Top Soft Glaze */}
            <path
              d="M 32 10 L 36 20 L 28 20 Z"
              fill="#ffffff"
              opacity="0.65"
            />
            <circle cx="32" cy="28" r="4" fill="#ffffff" opacity="0.3" />
          </>
        )}
      </g>
    </svg>
  )
}

/** Tia sét năng lượng XP Soft Clay */
export interface FlatClayZapProps extends BaseFlatClayIconProps {}

export function FlatClayZap({ size = 48, className }: FlatClayZapProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  const gradId = `zap-grad-${idSuffix}`
  const filterId = `zap-shadow-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Tia sét XP"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <filter id={filterId} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#9a3412" floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter={`url(#${filterId})`}>
        <path
          d="M 36 4 L 14 34 L 30 34 L 24 60 L 52 26 L 36 26 Z"
          fill={`url(#${gradId})`}
          stroke="#c2410c"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Soft Glaze Highlight */}
        <path
          d="M 34 8 L 18 32 L 28 32 L 25 44"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
          fill="none"
        />
        <circle cx="48" cy="18" r="2.5" fill="#fde047" />
        <circle cx="12" cy="46" r="2" fill="#fbbf24" />
      </g>
    </svg>
  )
}

/** Trái tim máu / năng lượng Soft Clay */
export interface FlatClayHeartProps extends BaseFlatClayIconProps {}

export function FlatClayHeart({ size = 48, className }: FlatClayHeartProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  const gradId = `heart-grad-${idSuffix}`
  const filterId = `heart-shadow-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Trái tim năng lượng"
    >
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fda4af" />
          <stop offset="60%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#be123c" />
        </radialGradient>
        <filter id={filterId} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#9f1239" floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter={`url(#${filterId})`}>
        <path
          d="M 32 54 C 18 42 8 32 8 20 C 8 11 15 5 24 5 C 29 5 31 8 32 10 C 33 8 35 5 40 5 C 49 5 56 11 56 20 C 56 32 46 42 32 54 Z"
          fill={`url(#${gradId})`}
          stroke="#9f1239"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Soft Glaze Crescent on Left Lobe */}
        <path
          d="M 18 10 C 22 7 28 8 30 11 C 26 10 20 11 16 16 C 14 18 13 22 14 26 C 12 21 13 14 18 10 Z"
          fill="#ffffff"
          opacity="0.65"
        />
        <circle cx="46" cy="14" r="2.2" fill="#ffffff" opacity="0.5" />
      </g>
    </svg>
  )
}

/** Bia ngắm chuyên đề Soft Clay */
export interface FlatClayTargetProps extends BaseFlatClayIconProps {}

export function FlatClayTarget({ size = 48, className }: FlatClayTargetProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  const filterId = `target-shadow-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Bia ngắm chuyên đề"
    >
      <defs>
        <filter id={filterId} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#9f1239" floodOpacity="0.25" />
        </filter>
      </defs>

      <g filter={`url(#${filterId})`}>
        {/* Outer Ring Red */}
        <circle cx="32" cy="32" r="26" fill="#f43f5e" stroke="#be123c" strokeWidth="2" />
        {/* Ring 2 White */}
        <circle cx="32" cy="32" r="20" fill="#ffffff" stroke="#fecdd3" strokeWidth="1.4" />
        {/* Ring 3 Cyan */}
        <circle cx="32" cy="32" r="14" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.4" />
        {/* Bullseye Gold */}
        <circle cx="32" cy="32" r="8" fill="#facc15" stroke="#ca8a04" strokeWidth="1.4" />
        <circle cx="32" cy="32" r="3" fill="#e11d48" />

        {/* Hitting Arrow */}
        <line x1="46" y1="18" x2="33" y2="31" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
        {/* Fletching */}
        <polygon points="46,18 52,14 48,22" fill="#10b981" />
      </g>
    </svg>
  )
}

/** Khiên bảo vệ Soft Clay */
export interface FlatClayShieldProps extends BaseFlatClayIconProps {}

export function FlatClayShield({ size = 48, className }: FlatClayShieldProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  const gradId = `shield-grad-${idSuffix}`
  const filterId = `shield-shadow-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Khiên bảo vệ"
    >
      <defs>
        <radialGradient id={gradId} cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="60%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4338ca" />
        </radialGradient>
        <filter id={filterId} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#3730a3" floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter={`url(#${filterId})`}>
        {/* Shield Body */}
        <path
          d="M 32 6 C 44 6 54 12 54 26 C 54 44 32 58 32 58 C 32 58 10 44 10 26 C 10 12 20 6 32 6 Z"
          fill={`url(#${gradId})`}
          stroke="#3730a3"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Inner Gold Border */}
        <path
          d="M 32 11 C 41 11 49 16 49 26 C 49 40 32 52 32 52 C 32 52 15 40 15 26 C 15 16 23 11 32 11 Z"
          fill="none"
          stroke="#facc15"
          strokeWidth="1.6"
        />
        {/* Center Star Emblem */}
        <polygon
          points="32,22 34,28 40,28 35,32 37,38 32,34 27,38 29,32 24,28 30,28"
          fill="#fef08a"
          stroke="#ca8a04"
          strokeWidth="1"
        />
        {/* Top Glaze */}
        <path
          d="M 22 14 C 26 10 38 10 42 14 C 36 12 28 12 22 18 Z"
          fill="#ffffff"
          opacity="0.5"
        />
      </g>
    </svg>
  )
}

/** Kim cương đá quý Soft Clay */
export interface FlatClayDiamondProps extends BaseFlatClayIconProps {}

export function FlatClayDiamond({ size = 48, className }: FlatClayDiamondProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  const gradId = `diam-grad-${idSuffix}`
  const filterId = `diam-shadow-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Kim cương đá quý"
    >
      <defs>
        <radialGradient id={gradId} cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="60%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </radialGradient>
        <filter id={filterId} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#075985" floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter={`url(#${filterId})`}>
        {/* Gem Silhouette */}
        <polygon
          points="20,12 44,12 56,26 32,54 8,26"
          fill={`url(#${gradId})`}
          stroke="#0369a1"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Upper Table Facet */}
        <polygon points="24,12 40,12 46,26 18,26" fill="#e0f2fe" opacity="0.6" />
        {/* Facet Lines */}
        <line x1="18" y1="26" x2="32" y2="54" stroke="#0284c7" strokeWidth="1.4" />
        <line x1="46" y1="26" x2="32" y2="54" stroke="#0284c7" strokeWidth="1.4" />
        <line x1="20" y1="12" x2="18" y2="26" stroke="#0284c7" strokeWidth="1.4" />
        <line x1="44" y1="12" x2="46" y2="26" stroke="#0284c7" strokeWidth="1.4" />
        <line x1="32" y1="12" x2="32" y2="26" stroke="#ffffff" strokeWidth="1.4" />

        {/* Sparkle Glint */}
        <polygon points="48,14 49.5,17 53,18 49.5,19 48,22 46.5,19 43,18 46.5,17" fill="#ffffff" />
      </g>
    </svg>
  )
}

/** Bụi sao lấp lánh Soft Clay */
export interface FlatClaySparklesProps extends BaseFlatClayIconProps {}

export function FlatClaySparkles({ size = 48, className }: FlatClaySparklesProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  const filterId = `spk-shadow-${idSuffix}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Bụi sao lấp lánh"
    >
      <defs>
        <filter id={filterId} x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#ca8a04" floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter={`url(#${filterId})`}>
        {/* Large Center Sparkle */}
        <path
          d="M 32 8 Q 33 22 46 24 Q 33 26 32 40 Q 31 26 18 24 Q 31 22 32 8 Z"
          fill="#facc15"
          stroke="#ca8a04"
          strokeWidth="1.4"
        />
        <circle cx="32" cy="24" r="3.5" fill="#ffffff" />

        {/* Top-Right Medium Sparkle */}
        <path
          d="M 48 28 Q 48.5 35 55 36 Q 48.5 37 48 44 Q 47.5 37 41 36 Q 47.5 35 48 28 Z"
          fill="#38bdf8"
          stroke="#0284c7"
          strokeWidth="1.2"
        />
        <circle cx="48" cy="36" r="2" fill="#ffffff" />

        {/* Bottom-Left Small Sparkle */}
        <path
          d="M 18 36 Q 18.5 42 24 43 Q 18.5 44 18 50 Q 17.5 44 12 43 Q 17.5 42 18 36 Z"
          fill="#f472b6"
          stroke="#be185d"
          strokeWidth="1"
        />

        {/* Tiny Glow Dots */}
        <circle cx="20" cy="14" r="2" fill="#fef08a" />
        <circle cx="44" cy="10" r="1.5" fill="#34d399" />
        <circle cx="38" cy="52" r="2" fill="#a78bfa" />
      </g>
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 12. BỔ SUNG CÁC ICON TIỆN ÍCH KHÁC (FROG, WAND, ORANGE)
// ════════════════════════════════════════════════════════════════════════════

/** Chú ếch nhảy số Soft Clay */
export function FlatClayFrog({ size = 48, className }: BaseFlatClayIconProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Chú ếch nhảy số"
    >
      <defs>
        <radialGradient id={`frog-grad-${idSuffix}`} cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="70%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#14532d" />
        </radialGradient>
      </defs>
      {/* Eyes */}
      <circle cx="20" cy="20" r="9" fill="#16a34a" stroke="#14532d" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="6" fill="#ffffff" />
      <circle cx="21" cy="20" r="3" fill="#1e293b" />
      <circle cx="22" cy="19" r="1" fill="#ffffff" />

      <circle cx="44" cy="20" r="9" fill="#16a34a" stroke="#14532d" strokeWidth="1.5" />
      <circle cx="44" cy="20" r="6" fill="#ffffff" />
      <circle cx="43" cy="20" r="3" fill="#1e293b" />
      <circle cx="44" cy="19" r="1" fill="#ffffff" />

      {/* Head/Body */}
      <path
        d="M 12 34 C 12 22 22 22 32 22 C 42 22 52 22 52 34 C 52 48 44 54 32 54 C 20 54 12 48 12 34 Z"
        fill={`url(#${`frog-grad-${idSuffix}`})`}
        stroke="#14532d"
        strokeWidth="1.8"
      />
      {/* Cheeks */}
      <circle cx="18" cy="38" r="3.5" fill="#f472b6" opacity="0.6" />
      <circle cx="46" cy="38" r="3.5" fill="#f472b6" opacity="0.6" />
      {/* Smile */}
      <path d="M 25 40 Q 32 46 39 40" stroke="#14532d" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  )
}

/** Đũa thần phép thuật Soft Clay */
export function FlatClayWand({ size = 48, className }: BaseFlatClayIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Đũa thần phép thuật"
    >
      {/* Shaft */}
      <line x1="12" y1="52" x2="38" y2="26" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
      <line x1="38" y1="26" x2="44" y2="20" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
      {/* Star Tip */}
      <polygon points="46,8 48,14 54,14 49,18 51,24 46,20 41,24 43,18 38,14 44,14" fill="#facc15" stroke="#ca8a04" strokeWidth="1.2" />
      {/* Sparkles */}
      <circle cx="34" cy="10" r="2" fill="#38bdf8" />
      <circle cx="56" cy="28" r="1.5" fill="#f472b6" />
      <circle cx="54" cy="8" r="1.5" fill="#ffffff" />
    </svg>
  )
}

/** Quả cam ngọt Soft Clay */
export function FlatClayOrange({ size = 48, className }: BaseFlatClayIconProps) {
  const idSuffix = React.useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block select-none overflow-visible', className)}
      role="img"
      aria-label="Quả cam ngọt"
    >
      <defs>
        <radialGradient id={`org-grad-${idSuffix}`} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fdba74" />
          <stop offset="70%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#c2410c" />
        </radialGradient>
      </defs>
      {/* Stem & Leaf */}
      <path d="M 32 14 C 32 8 36 6 38 4" stroke="#78350f" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M 34 10 Q 44 6 44 12 Q 38 14 34 10 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
      {/* Orange Body */}
      <circle cx="32" cy="36" r="22" fill={`url(#${`org-grad-${idSuffix}`})`} stroke="#c2410c" strokeWidth="1.8" />
      {/* Highlight */}
      <path d="M 22 22 C 26 18 36 18 40 22 C 34 20 26 22 22 28 Z" fill="#ffffff" opacity="0.6" />
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 13. COMPONENT ĐA NĂNG <FlatClayIcon />
// ════════════════════════════════════════════════════════════════════════════

export interface FlatClayIconProps extends BaseFlatClayIconProps {
  name: string
  number?: number | string
  tier?: 'gold' | 'silver' | 'bronze'
  rank?: 1 | 2 | 3
  hours?: number
  minutes?: number
}

/**
 * Universal Flat Clay Icon Component.
 * Maps any name, keyword, ID, or legacy emoji string to the exact 2D Flat Soft Clay pure SVG component!
 */
export function FlatClayIcon({
  name,
  size = 32,
  className,
  color,
  number,
  tier,
  rank,
  hours,
  minutes,
  ...props
}: FlatClayIconProps) {
  if (!name) {
    return <FlatClayStar size={size} className={className} />
  }

  const key = name.toLowerCase().trim()

  // 1. Chặng học & Đảo học tập
  if (key === 'island_forest' || key === 'island-forest' || key === 'stage-1' || key === 'island-1' || key === 'forest') {
    return <FlatClayIslandForest size={size} className={className} />
  }
  if (key === 'island_bakery' || key === 'island-bakery' || key === 'stage-2' || key === 'island-2' || key === 'bakery') {
    return <FlatClayIslandBakery size={size} className={className} />
  }
  if (key === 'island_pizza' || key === 'island-pizza' || key === 'stage-3' || key === 'island-3' || key === 'fraction-island') {
    return <FlatClayIslandPizza size={size} className={className} />
  }
  if (key === 'island_clock' || key === 'island-clock' || key === 'stage-4' || key === 'island-4' || key === 'clock-island') {
    return <FlatClayIslandClock size={size} className={className} />
  }
  if (key === 'island_crystal' || key === 'island-crystal' || key === 'stage-5' || key === 'island-5' || key === 'crystal-island') {
    return <FlatClayIslandCrystal size={size} className={className} />
  }

  // 2. Apples
  if (key === '🍎' || key === 'apple' || key === 'red_apple' || key === 'red-apple' || key === 'apple_drop') {
    return <FlatClayRedApple size={size} number={number} className={className} />
  }
  if (key === '🍏' || key === 'green_apple' || key === 'green-apple') {
    return <FlatClayGreenApple size={size} number={number} className={className} />
  }

  // 3. Balloons & Bursts
  if (key === '🎈' || key === 'balloon' || key === 'balloon_pop') {
    return <FlatClayBalloon size={size} color={color || 'sky'} number={number} className={className} />
  }
  if (key === '💥' || key === 'pop_burst' || key === 'pop-burst' || key === 'burst') {
    return <FlatClayPopBurst size={size} className={className} />
  }

  // 4. Pastry & Food
  if (key === '🍰' || key === '🧁' || key === 'cupcake' || key === 'cake' || key === 'cake_tray') {
    return <FlatClayCupcake size={size} className={className} />
  }
  if (key === '🍬' || key === '🍭' || key === 'candy' || key === 'candy_division' || key === 'lollipop') {
    return <FlatClayCandy size={size} className={className} />
  }
  if (key === '🍉' || key === 'watermelon' || key === 'fraction_of_number') {
    return <FlatClayWatermelon size={size} className={className} />
  }
  if (key === '🍕' || key === 'pizza' || key === 'pizza_fraction' || key === 'compare_fractions' || key === 'fraction_add_sub') {
    return <FlatClayPizzaSlice size={size} className={className} />
  }
  if (key === '🍊' || key === 'orange' || key === 'fruit') {
    return <FlatClayOrange size={size} className={className} />
  }

  // 5. 3D & Cubes & Nets
  if (key === '🧊' || key === 'cube' || key === 'cube_3d' || key === 'block' || key === '3d') {
    return <FlatClayCube size={size} color={color || 'indigo'} className={className} />
  }
  if (key === '📐' || key === '📦' || key === 'cube_net' || key === 'cubenet' || key === 'geometry' || key === 'perimeter_area') {
    return <FlatClayCubeNet size={size} className={className} />
  }

  // 6. Time & Measurement & Montessori Tools
  if (key === '⏰' || key === '⏳' || key === 'clock' || key === 'analog_clock' || key === 'elapsed_time' || key === 'time') {
    return <FlatClayClock size={size} hours={hours} minutes={minutes} className={className} />
  }
  if (key === '⚖️' || key === '⚖' || key === 'scale' || key === 'balance_scale' || key === 'balance') {
    return <FlatClayScale size={size} className={className} />
  }
  if (key === '🥢' || key === '🔥' || key === 'matchstick' || key === 'stick') {
    return <FlatClayMatchstick size={size} className={className} />
  }
  if (key === '🧭' || key === '🗺️' || key === '🗺' || key === 'grid_maze' || key === 'compass' || key === 'maze') {
    return <FlatClayCompass size={size} className={className} />
  }

  // 7. Arithmetic & Math Columns
  if (
    key === '🧮' ||
    key === '🔢' ||
    key === '🔟' ||
    key === '➕' ||
    key === '➖' ||
    key === 'column_add' ||
    key === 'column_sub' ||
    key === 'column_calc' ||
    key === 'column-calc' ||
    key === 'make10' ||
    key === 'math' ||
    key === 'abacus' ||
    key === 'calc'
  ) {
    return <FlatClayColumnCalc size={size} className={className} />
  }

  // 8. Olympic & Gamification
  if (key === '🏆' || key === 'trophy' || key === 'olympic' || key === 'olympic_arena') {
    return <FlatClayTrophy size={size} className={className} />
  }
  if (key === '🥇' || key === 'medal_gold' || key === 'medal-gold') {
    return <FlatClayMedal size={size} tier="gold" rank={1} className={className} />
  }
  if (key === '🥈' || key === 'medal_silver' || key === 'medal-silver') {
    return <FlatClayMedal size={size} tier="silver" rank={2} className={className} />
  }
  if (key === '🥉' || key === 'medal_bronze' || key === 'medal-bronze') {
    return <FlatClayMedal size={size} tier="bronze" rank={3} className={className} />
  }
  if (key === '🎖️' || key === '🏅' || key === 'medal') {
    return <FlatClayMedal size={size} tier={tier} rank={rank} className={className} />
  }

  if (key === '⭐' || key === '🌟' || key === 'star') {
    return <FlatClayStar size={size} className={className} />
  }
  if (key === '⚡' || key === '⚡️' || key === 'zap' || key === 'xp' || key === 'lightning' || key === 'bolt') {
    return <FlatClayZap size={size} className={className} />
  }
  if (key === '❤️' || key === '💖' || key === '🧡' || key === 'heart' || key === 'hp' || key === 'life') {
    return <FlatClayHeart size={size} className={className} />
  }
  if (key === '🎯' || key === 'target' || key === 'topic') {
    return <FlatClayTarget size={size} className={className} />
  }
  if (key === '🛡️' || key === '🛡' || key === 'shield') {
    return <FlatClayShield size={size} className={className} />
  }
  if (key === '💎' || key === '💠' || key === 'diamond' || key === 'gem' || key === 'crystal') {
    return <FlatClayDiamond size={size} className={className} />
  }
  if (key === '✨' || key === '💫' || key === 'sparkles' || key === 'sparkle') {
    return <FlatClaySparkles size={size} className={className} />
  }

  // 9. Other cute elements
  if (key === '🐸' || key === 'frog' || key === 'times_table_25') {
    return <FlatClayFrog size={size} className={className} />
  }
  if (key === '🪄' || key === 'wand' || key === 'magic' || key === 'times_table_69') {
    return <FlatClayWand size={size} className={className} />
  }
  if (key === '🍽️' || key === 'plate' || key === 'div_remainder') {
    return <FlatClayPizzaSlice size={size} className={className} />
  }

  // Default fallback to gleaming Star
  return <FlatClayStar size={size} className={className} />
}
