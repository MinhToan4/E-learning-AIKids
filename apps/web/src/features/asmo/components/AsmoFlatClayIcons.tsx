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

export interface BaseFlatClayIconProps {
  size?: number | string
  className?: string
}

// ════════════════════════════════════════════════════════════════════════════
// 1. FLAT CLAY BALLOON (Bóng Bay 2D Flat Soft Clay)
// ════════════════════════════════════════════════════════════════════════════
export interface FlatClayBalloonProps extends BaseFlatClayIconProps {
  color?: FlatClayColorTheme | string
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

        {/* Red Cherry / Strawberry on Top */}
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
  color?: 'rainbow' | 'pink' | 'sky' | 'emerald'
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
        {/* Base Circle */}
        <circle cx="32" cy="24" r="19" fill="#f43f5e" stroke="#be123c" strokeWidth="1.8" />

        {/* Swirl Spiral Arms */}
        {/* White Swirl */}
        <path
          d="M 32 5 A 19 19 0 0 1 51 24 C 51 32 42 38 34 38 C 26 38 20 32 20 25 C 20 19 24 15 30 15 C 34 15 37 18 37 22 C 37 25 34 27 32 27 C 30 27 28 25 28 24"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Amber / Yellow Accent Swirl */}
        <path
          d="M 13 24 A 19 19 0 0 1 32 5 C 24 5 18 12 18 20 C 18 26 23 30 29 30 C 33 30 36 28 36 24"
          stroke="#facc15"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cyan Accent Swirl */}
        <path
          d="M 32 43 A 19 19 0 0 1 13 24"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Top Glaze Specular */}
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
        {/* Outer Green Rind */}
        <path
          d="M 8 46 Q 32 62 56 46 Q 32 54 8 46 Z"
          fill="#10b981"
          stroke="#047857"
          strokeWidth="1.8"
        />
        {/* Inner Light-Green/White Rind */}
        <path
          d="M 10 44 Q 32 56 54 44 Q 32 50 10 44 Z"
          fill="#ecfdf5"
        />
        {/* Red Watermelon Flesh */}
        <path
          d="M 32 10 L 53 43 Q 32 49 11 43 Z"
          fill={`url(#${gradId})`}
          stroke="#be123c"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        {/* Cute Seeds */}
        {/* Top Seed */}
        <path d="M 32 22 Q 33 26 32 27 Q 31 26 32 22 Z" fill="#1e293b" />
        {/* Left Seeds */}
        <path d="M 24 30 Q 25 34 24 35 Q 23 34 24 30 Z" fill="#1e293b" />
        <path d="M 22 40 Q 23 43 22 44 Q 21 43 22 40 Z" fill="#1e293b" />
        {/* Right Seeds */}
        <path d="M 40 30 Q 41 34 40 35 Q 39 34 40 30 Z" fill="#1e293b" />
        <path d="M 42 40 Q 43 43 42 44 Q 41 43 42 40 Z" fill="#1e293b" />
        {/* Center Seed */}
        <path d="M 32 36 Q 33 39 32 40 Q 31 39 32 36 Z" fill="#1e293b" />

        {/* Left Side Specular Glaze */}
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
        {/* Crust */}
        <path
          d="M 10 18 Q 32 10 54 18 Q 55 24 50 25 Q 32 17 14 25 Q 9 24 10 18 Z"
          fill="#d97706"
          stroke="#92400e"
          strokeWidth="1.8"
        />

        {/* Cheese Body */}
        <path
          d="M 13 23 Q 32 17 51 23 L 32 58 Z"
          fill={`url(#${cheeseGradId})`}
          stroke="#d97706"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        {/* Pepperoni Slices */}
        <circle cx="32" cy="30" r="4.5" fill="#e11d48" stroke="#9f1239" strokeWidth="1.2" />
        <circle cx="30.5" cy="28.5" r="1.2" fill="#ffffff" opacity="0.6" />

        <circle cx="24" cy="42" r="3.8" fill="#e11d48" stroke="#9f1239" strokeWidth="1.2" />
        <circle cx="22.8" cy="40.8" r="1" fill="#ffffff" opacity="0.6" />

        <circle cx="40" cy="40" r="4" fill="#e11d48" stroke="#9f1239" strokeWidth="1.2" />
        <circle cx="38.5" cy="38.5" r="1" fill="#ffffff" opacity="0.6" />

        {/* Basil Leaves */}
        <ellipse cx="32" cy="46" rx="2" ry="1.2" fill="#16a34a" transform="rotate(-30 32 46)" />
        <ellipse cx="27" cy="28" rx="2" ry="1.2" fill="#16a34a" transform="rotate(20 27 28)" />
      </g>
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 7. FLAT CLAY CUBE (Khối Lập Phương Isometric Soft Clay Thay Thế 🧊)
// ════════════════════════════════════════════════════════════════════════════
export interface FlatClayCubeProps extends BaseFlatClayIconProps {
  color?: FlatClayColorTheme | string
}

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
        {/* Left Face (Mid Tone) */}
        <path
          d="M 12 21 L 32 32 L 32 54 L 12 43 Z"
          fill={c.left}
          stroke={c.stroke}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        {/* Right Face (Shadow Tone) */}
        <path
          d="M 32 32 L 52 21 L 52 43 L 32 54 Z"
          fill={c.right}
          stroke={c.stroke}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        {/* Top Face (Brightest Light) */}
        <path
          d="M 32 10 L 52 21 L 32 32 L 12 21 Z"
          fill={c.top}
          stroke={c.stroke}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        {/* Soft Clay Highlight along top ridge */}
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
// 8. FLAT CLAY APPLES (Quả Táo Đỏ & Táo Xanh Soft Clay)
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

      {/* Stem */}
      <path
        d="M 32 16 C 32 10 36 6 39 4"
        stroke="#78350f"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Leaf */}
      <path
        d="M 34 12 Q 44 8 46 14 Q 40 18 34 12 Z"
        fill="#22c55e"
        stroke="#15803d"
        strokeWidth="1.2"
      />

      {/* Apple Body with Shadow */}
      <g filter={`url(#${filterId})`}>
        <path
          d="M 32 18 C 26 14 13 14 11 28 C 9 40 21 54 32 58 C 43 54 55 40 53 28 C 51 14 38 14 32 18 Z"
          fill={`url(#${gradId})`}
          stroke="#9f1239"
          strokeWidth="1.8"
        />
      </g>

      {/* Glossy Clay Highlight */}
      <path
        d="M 20 22 C 24 18 30 18 32 20 C 28 19 23 20 19 24 C 17 26 16 30 16 34 C 15 30 16 25 20 22 Z"
        fill="#ffffff"
        opacity="0.65"
      />
      <circle cx="44" cy="26" r="2" fill="#ffffff" opacity="0.4" />

      {/* Optional Number Badge */}
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

      {/* Stem */}
      <path
        d="M 32 16 C 32 10 36 6 39 4"
        stroke="#78350f"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Leaf */}
      <path
        d="M 34 12 Q 44 8 46 14 Q 40 18 34 12 Z"
        fill="#86efac"
        stroke="#15803d"
        strokeWidth="1.2"
      />

      {/* Apple Body with Shadow */}
      <g filter={`url(#${filterId})`}>
        <path
          d="M 32 18 C 26 14 13 14 11 28 C 9 40 21 54 32 58 C 43 54 55 40 53 28 C 51 14 38 14 32 18 Z"
          fill={`url(#${gradId})`}
          stroke="#14532d"
          strokeWidth="1.8"
        />
      </g>

      {/* Glossy Clay Highlight */}
      <path
        d="M 20 22 C 24 18 30 18 32 20 C 28 19 23 20 19 24 C 17 26 16 30 16 34 C 15 30 16 25 20 22 Z"
        fill="#ffffff"
        opacity="0.65"
      />
      <circle cx="44" cy="26" r="2" fill="#ffffff" opacity="0.4" />

      {/* Optional Number Badge */}
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
