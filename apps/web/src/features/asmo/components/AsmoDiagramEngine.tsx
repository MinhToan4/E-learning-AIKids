import React from 'react'

// ============================================================================
// TYPES & INTERFACES FOR PARAMETRIC SVG DIAGRAM ENGINE
// ============================================================================

export type ClockOptions = {
  size?: number
  className?: string
  showNumbers?: boolean
  showMinuteMarks?: boolean
  highlightHour?: boolean
}

export type MatchstickSegment2D = {
  x1: number
  y1: number
  x2: number
  y2: number
  head?: 'start' | 'end' | 'both' | 'none'
}

export type MatchstickPatternKey =
  | 'square_flag'      // Q9 Option A: Square with 2-stick handle (6 sticks)
  | 'house'            // Q9 Option B: Roof + walls (5 sticks)
  | 'diamond_legs'     // Q9 Option C: Diamond with 2 legs (6 sticks)
  | 'double_square'    // Q9 Option D: 2 adjacent squares (7 sticks)
  | 'triangle'
  | 'square'
  | 'fish'
  | 'star'

export type BalanceScaleTilt = 'left' | 'right' | 'equal'

export type BalanceScaleItem = {
  left: {
    emoji?: string
    text?: string
    count?: number
    weight?: number
  }
  right: {
    emoji?: string
    text?: string
    count?: number
    weight?: number
  }
  tilt: BalanceScaleTilt
  label?: string
}

export type ShapeType = 'circle' | 'square' | 'triangle' | 'pentagon' | 'hexagon' | 'star'

export type ShapeEquationRow = {
  left: ShapeType
  right: ShapeType
  operator?: '+' | '-'
  resultNested?: {
    outer: ShapeType
    inner: ShapeType
  }
  isQuestion?: boolean
}

export type GridCheckerboardConfig = {
  variant: 'full' | 'puzzle_cut' | 'opt_A' | 'opt_B' | 'opt_C' | 'opt_D' | 'custom'
  size?: number
  customMask?: number[][] // 1 = black, 0 = white, -1 = missing
  className?: string
}

export type GridMazeConfig = {
  width?: number
  height?: number
  entrance?: { x: number; y: number; label?: string }
  exits?: Array<{ id: string; label: string; x: number; y: number; dir: 'top' | 'right' | 'bottom' | 'left' }>
  solutionPath?: Array<[number, number]>
  showSolution?: boolean
  className?: string
}

export type GridPolylineConfig = {
  cols?: number
  rows?: number
  points: Array<[number, number]> // coordinates in [0..cols, 0..rows]
  width?: number
  height?: number
  className?: string
}

export type CakePartitionConfig = {
  shape?: 'square' | 'circle'
  variant: 'cross' | 'diagonals' | 'unequal_triangle' | 'diagonal_offset' | 'parallel_vertical' | 'custom'
  className?: string
  isWrong?: boolean
}

export type SierpinskiConfig = {
  depth?: number
  size?: number
  className?: string
  fillCenter?: boolean
}

export type GridShadedRatioConfig = {
  rows: number
  cols: number
  shadedCells: Array<[number, number]> // [row, col] 0-indexed
  labels?: Array<{ r: number; c: number; text: string }>
  cellSize?: number
  className?: string
}

export type ScatteredCountingConfig = {
  type: 'balls' | 'digits' | 'shapes'
  blackBalls?: Array<[number, number]>
  whiteBalls?: Array<[number, number]>
  digits?: Array<{ value: number | string; x: number; y: number; rotate?: number; fontSize?: number; italic?: boolean }>
  className?: string
}

export type VerticalArithmeticConfig = {
  top: number | string
  op: '+' | '-' | '×' | '÷'
  bottom: number | string
  result?: number | string | '?'
  highlightBox?: boolean
  className?: string
}

// ============================================================================
// 1. RENDER CLOCK SVG (Tham số hóa mặt đồng hồ kim giờ, phút)
// ============================================================================

export function renderClockSvg(
  hour: number,
  minute: number,
  options?: ClockOptions,
): React.JSX.Element {
  const size = options?.size ?? 200
  const center = size / 2
  const radius = center - 12
  const innerRadius = radius - 8

  // Calculate angles
  // Hour hand angle: 30 deg per hour + 0.5 deg per minute
  const hourAngle = ((hour % 12) + minute / 60) * 30
  // Minute hand angle: 6 deg per minute
  const minuteAngle = minute * 6

  const hourRad = (hourAngle * Math.PI) / 180
  const minuteRad = (minuteAngle * Math.PI) / 180

  const hourHandLength = radius * 0.54
  const minuteHandLength = radius * 0.78

  const hourX = center + hourHandLength * Math.sin(hourRad)
  const hourY = center - hourHandLength * Math.cos(hourRad)

  const minX = center + minuteHandLength * Math.sin(minuteRad)
  const minY = center - minuteHandLength * Math.cos(minuteRad)

  // Clock numbers
  const numbers = [
    { n: 12, angle: 0 },
    { n: 1, angle: 30 },
    { n: 2, angle: 60 },
    { n: 3, angle: 90 },
    { n: 4, angle: 120 },
    { n: 5, angle: 150 },
    { n: 6, angle: 180 },
    { n: 7, angle: 210 },
    { n: 8, angle: 240 },
    { n: 9, angle: 270 },
    { n: 10, angle: 300 },
    { n: 11, angle: 330 },
  ]

  const numRadius = radius * 0.72

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={options?.className ?? 'w-full max-h-56 select-none font-bold'}
      role="img"
      aria-label={`Clock showing ${hour}:${minute < 10 ? '0' + minute : minute}`}
    >
      <defs>
        <radialGradient id="clockBezelGrad" cx="50%" cy="50%" r="50%">
          <stop offset="85%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </radialGradient>
        <filter id="clockShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Bezel Ring */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="url(#clockBezelGrad)"
        stroke="#1e293b"
        strokeWidth={size > 120 ? 5 : 3.5}
        filter="url(#clockShadow)"
      />

      {/* Inner Track Ring */}
      <circle
        cx={center}
        cy={center}
        r={innerRadius}
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="1.2"
        strokeDasharray="2 4"
      />

      {/* 60 Minute Ticks */}
      {Array.from({ length: 60 }).map((_, i) => {
        const isMajor = i % 5 === 0
        const tickAngle = (i * 6 * Math.PI) / 180
        const rOuter = innerRadius
        const rInner = isMajor ? innerRadius - (size > 120 ? 7 : 4) : innerRadius - (size > 120 ? 3 : 2)
        return (
          <line
            key={`tick-${i}`}
            x1={center + rOuter * Math.sin(tickAngle)}
            y1={center - rOuter * Math.cos(tickAngle)}
            x2={center + rInner * Math.sin(tickAngle)}
            y2={center - rInner * Math.cos(tickAngle)}
            stroke={isMajor ? '#334155' : '#94a3b8'}
            strokeWidth={isMajor ? 2.2 : 1}
            strokeLinecap="round"
          />
        )
      })}

      {/* 12 Hour Numbers */}
      {(options?.showNumbers ?? true) &&
        numbers.map(({ n, angle }) => {
          const rad = (angle * Math.PI) / 180
          const x = center + numRadius * Math.sin(rad)
          const y = center - numRadius * Math.cos(rad)
          const fontSize = size > 120 ? 15 : 11
          return (
            <text
              key={`num-${n}`}
              x={x}
              y={y}
              fill="#0f172a"
              fontSize={fontSize}
              fontWeight="800"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {n}
            </text>
          )
        })}

      {/* Hour Hand */}
      <line
        x1={center}
        y1={center}
        x2={hourX}
        y2={hourY}
        stroke="#0f172a"
        strokeWidth={size > 120 ? 5.5 : 3.5}
        strokeLinecap="round"
      />

      {/* Minute Hand */}
      <line
        x1={center}
        y1={center}
        x2={minX}
        y2={minY}
        stroke="#2563eb"
        strokeWidth={size > 120 ? 3.5 : 2.5}
        strokeLinecap="round"
      />

      {/* Center Pivot Pin */}
      <circle cx={center} cy={center} r={size > 120 ? 5.5 : 3.5} fill="#0f172a" />
      <circle cx={center} cy={center} r={size > 120 ? 2 : 1.2} fill="#ffffff" />
    </svg>
  )
}

// ============================================================================
// 2. RENDER MATCHSTICK FIGURE SVG (Tham số hóa hình que diêm)
// ============================================================================

export function renderMatchstickFigureSvg(
  pattern: MatchstickPatternKey | MatchstickSegment2D[],
  _count?: number,
  options?: { width?: number; height?: number; className?: string },
): React.JSX.Element {
  let segments: MatchstickSegment2D[] = []
  let viewBox = '0 0 90 90'

  if (typeof pattern === 'string') {
    switch (pattern) {
      case 'square_flag': // 6 matches (Option A)
        viewBox = '0 0 90 90'
        segments = [
          { x1: 20, y1: 20, x2: 65, y2: 20, head: 'start' },
          { x1: 20, y1: 20, x2: 20, y2: 65, head: 'end' },
          { x1: 20, y1: 65, x2: 65, y2: 65, head: 'end' },
          { x1: 65, y1: 20, x2: 65, y2: 65, head: 'start' },
          { x1: 65, y1: 65, x2: 84, y2: 65, head: 'end' },
          { x1: 65, y1: 65, x2: 65, y2: 84, head: 'end' },
        ]
        break
      case 'house': // 5 matches (Option B)
        viewBox = '0 0 90 90'
        segments = [
          { x1: 45, y1: 15, x2: 18, y2: 42, head: 'start' },
          { x1: 45, y1: 15, x2: 72, y2: 42, head: 'end' },
          { x1: 22, y1: 42, x2: 22, y2: 75, head: 'start' },
          { x1: 68, y1: 42, x2: 68, y2: 75, head: 'start' },
          { x1: 22, y1: 75, x2: 68, y2: 75, head: 'start' },
        ]
        break
      case 'diamond_legs': // 6 matches (Option C)
        viewBox = '0 0 90 90'
        segments = [
          { x1: 45, y1: 15, x2: 22, y2: 40, head: 'start' },
          { x1: 45, y1: 15, x2: 68, y2: 40, head: 'end' },
          { x1: 22, y1: 40, x2: 45, y2: 62, head: 'start' },
          { x1: 68, y1: 40, x2: 45, y2: 62, head: 'end' },
          { x1: 45, y1: 62, x2: 25, y2: 82, head: 'end' },
          { x1: 45, y1: 62, x2: 65, y2: 82, head: 'end' },
        ]
        break
      case 'double_square': // 7 matches (Option D)
        viewBox = '0 0 90 90'
        segments = [
          { x1: 12, y1: 28, x2: 78, y2: 28, head: 'start' },
          { x1: 12, y1: 64, x2: 78, y2: 64, head: 'end' },
          { x1: 12, y1: 28, x2: 12, y2: 64, head: 'end' },
          { x1: 45, y1: 28, x2: 45, y2: 64, head: 'end' },
          { x1: 78, y1: 28, x2: 78, y2: 64, head: 'end' },
        ]
        break
      case 'triangle':
        viewBox = '0 0 90 90'
        segments = [
          { x1: 45, y1: 15, x2: 15, y2: 75, head: 'start' },
          { x1: 45, y1: 15, x2: 75, y2: 75, head: 'end' },
          { x1: 15, y1: 75, x2: 75, y2: 75, head: 'start' },
        ]
        break
      case 'square':
        viewBox = '0 0 90 90'
        segments = [
          { x1: 20, y1: 20, x2: 70, y2: 20, head: 'start' },
          { x1: 20, y1: 20, x2: 20, y2: 70, head: 'end' },
          { x1: 20, y1: 70, x2: 70, y2: 70, head: 'end' },
          { x1: 70, y1: 20, x2: 70, y2: 70, head: 'start' },
        ]
        break
      default:
        segments = []
    }
  } else {
    segments = pattern
  }

  return (
    <svg
      viewBox={viewBox}
      className={options?.className ?? 'size-20 sm:size-24 shrink-0 select-none'}
      role="img"
      aria-label="Matchstick figure"
    >
      <defs>
        <radialGradient id="matchHeadGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="60%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </radialGradient>
      </defs>

      {segments.map((seg, idx) => {
        const headRadius = 4.5
        return (
          <g key={`match-${idx}`}>
            {/* Wooden Stick Body */}
            <line
              x1={seg.x1}
              y1={seg.y1}
              x2={seg.x2}
              y2={seg.y2}
              stroke="#d97706"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            {/* Match Head at Start */}
            {(seg.head === 'start' || seg.head === 'both') && (
              <circle cx={seg.x1} cy={seg.y1} r={headRadius} fill="url(#matchHeadGrad)" />
            )}
            {/* Match Head at End */}
            {(seg.head === 'end' || seg.head === 'both') && (
              <circle cx={seg.x2} cy={seg.y2} r={headRadius} fill="url(#matchHeadGrad)" />
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ============================================================================
// 3. RENDER GRID CHECKERBOARD PUZZLE SVG (Bàn cờ khuyết & Mảnh ghép)
// ============================================================================

export function renderGridCheckerboardPuzzleSvg(
  config: GridCheckerboardConfig,
): React.JSX.Element {
  const cellSize = 24

  if (config.variant === 'full') {
    const rows = 5
    const cols = 5
    return (
      <svg
        viewBox={`0 0 ${cols * cellSize} ${rows * cellSize}`}
        className={config.className ?? 'w-32 h-32 select-none font-bold'}
      >
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => {
            const isBlack = (r + c) % 2 === 0
            return (
              <rect
                key={`full-${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill={isBlack ? '#0f172a' : '#ffffff'}
                stroke="#1e293b"
                strokeWidth="1.2"
              />
            )
          }),
        )}
      </svg>
    )
  }

  if (config.variant === 'puzzle_cut') {
    // 5x5 board with missing piece at bottom-right, transition arrow in center
    const cutMatrix = [
      [1, 0, 1, 0, 1],
      [0, 1, 0, 1, -1],
      [1, 0, 1, -1, -1],
      [0, 1, -1, -1, -1],
      [1, 0, 1, -1, -1],
    ]

    return (
      <div className={config.className ?? 'flex items-center justify-center p-4 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-md mx-auto w-full'}>
        <svg viewBox="0 0 320 150" className="w-full max-h-56 select-none font-bold">
          {/* Full 5x5 on Left */}
          <g transform="translate(15, 15)">
            <rect x="0" y="0" width="120" height="120" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
            {Array.from({ length: 5 }).map((_, r) =>
              Array.from({ length: 5 }).map((_, c) => (
                <rect
                  key={`full-${r}-${c}`}
                  x={c * 24}
                  y={r * 24}
                  width={24}
                  height={24}
                  fill={(r + c) % 2 === 0 ? '#0f172a' : '#ffffff'}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
              )),
            )}
          </g>

          {/* Arrow */}
          <g transform="translate(145, 65)">
            <polygon points="0,5 18,5 18,0 30,10 18,20 18,15 0,15" fill="#0f172a" />
          </g>

          {/* Cut 5x5 on Right */}
          <g transform="translate(185, 15)">
            <rect x="0" y="0" width="120" height="120" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
            {cutMatrix.map((row, r) =>
              row.map((cell, c) => {
                if (cell === -1) return null
                return (
                  <rect
                    key={`cut-${r}-${c}`}
                    x={c * 24}
                    y={r * 24}
                    width={24}
                    height={24}
                    fill={cell === 1 ? '#0f172a' : '#ffffff'}
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                )
              }),
            )}
          </g>
        </svg>
      </div>
    )
  }

  // Options A, B, C, D
  const optionLayouts: Record<string, Array<{ x: number; y: number; isBlack: boolean }>> = {
    opt_A: [
      { x: 40, y: 0, isBlack: true },
      { x: 20, y: 20, isBlack: true },
      { x: 40, y: 20, isBlack: true },
      { x: 20, y: 40, isBlack: false },
      { x: 40, y: 40, isBlack: true },
      { x: 0, y: 60, isBlack: false },
      { x: 20, y: 60, isBlack: true },
      { x: 40, y: 60, isBlack: true },
      { x: 0, y: 80, isBlack: false },
      { x: 20, y: 80, isBlack: true },
    ],
    opt_B: [
      { x: 40, y: 0, isBlack: false },
      { x: 20, y: 20, isBlack: false },
      { x: 40, y: 20, isBlack: true },
      { x: 0, y: 40, isBlack: false },
      { x: 20, y: 40, isBlack: true },
      { x: 40, y: 40, isBlack: false },
      { x: 20, y: 60, isBlack: true },
      { x: 40, y: 60, isBlack: true },
    ],
    opt_C: [
      { x: 0, y: 0, isBlack: false },
      { x: 20, y: 0, isBlack: true },
      { x: 0, y: 20, isBlack: true },
      { x: 20, y: 20, isBlack: true },
      { x: 40, y: 20, isBlack: true },
      { x: 0, y: 40, isBlack: true },
      { x: 20, y: 40, isBlack: false },
      { x: 0, y: 60, isBlack: true },
    ],
    opt_D: [
      { x: 0, y: 0, isBlack: true },
      { x: 20, y: 0, isBlack: true },
      { x: 0, y: 20, isBlack: false },
      { x: 20, y: 20, isBlack: true },
      { x: 40, y: 20, isBlack: true },
      { x: 0, y: 40, isBlack: true },
      { x: 20, y: 40, isBlack: true },
      { x: 0, y: 60, isBlack: false },
    ],
  }

  const cells = optionLayouts[config.variant] ?? []
  return (
    <svg viewBox="0 0 80 110" className={config.className ?? 'w-16 h-22 shrink-0 select-none'}>
      <g transform="translate(5, 5)">
        {cells.map((cell, idx) => (
          <rect
            key={`opt-cell-${idx}`}
            x={cell.x}
            y={cell.y}
            width={20}
            height={20}
            fill={cell.isBlack ? '#0f172a' : '#ffffff'}
            stroke="#1e293b"
            strokeWidth="1.2"
          />
        ))}
      </g>
    </svg>
  )
}

// ============================================================================
// 4. RENDER BALANCE SCALE SVG (Bập bênh / Cân đĩa)
// ============================================================================

export function renderBalanceScaleSvg(
  balances: BalanceScaleItem | BalanceScaleItem[],
  options?: { className?: string; scale?: number },
): React.JSX.Element {
  const items = Array.isArray(balances) ? balances : [balances]
  const totalWidth = items.length * 180
  const height = 170

  return (
    <div className={options?.className ?? 'flex items-center justify-center p-5 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-2xl mx-auto w-full'}>
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="w-full max-h-56 select-none font-bold"
        role="img"
        aria-label="Balance scale diagram"
      >
        {items.map((b, idx) => {
          const offsetX = idx * 180 + 15
          // Tilt y positions
          let leftY = 95
          let rightY = 95
          if (b.tilt === 'left') {
            // Left is heavier (lower)
            leftY = 110
            rightY = 80
          } else if (b.tilt === 'right') {
            // Right is heavier (lower)
            leftY = 80
            rightY = 110
          }

          const fulcrumX = 75
          const fulcrumY = 100

          return (
            <g key={`scale-${idx}`} transform={`translate(${offsetX}, 20)`}>
              {/* Fulcrum Base Triangle */}
              <polygon points={`${fulcrumX},${fulcrumY} ${fulcrumX - 14},${fulcrumY + 28} ${fulcrumX + 14},${fulcrumY + 28}`} fill="#1e293b" />
              {/* Beam */}
              <line
                x1="15"
                y1={leftY}
                x2="135"
                y2={rightY}
                stroke="#1e293b"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Left Item */}
              <g transform={`translate(20, ${leftY - 12})`}>
                <text x="0" y="0" fontSize="28" textAnchor="middle" dominantBaseline="middle">
                  {b.left.emoji ?? '🍎'}
                </text>
                {b.left.text && (
                  <text x="0" y="16" fontSize="12" fill="#475569" textAnchor="middle">
                    {b.left.text}
                  </text>
                )}
              </g>
              {/* Right Item */}
              <g transform={`translate(130, ${rightY - 12})`}>
                <text x="0" y="0" fontSize="28" textAnchor="middle" dominantBaseline="middle">
                  {b.right.emoji ?? '🍌'}
                </text>
                {b.right.text && (
                  <text x="0" y="16" fontSize="12" fill="#475569" textAnchor="middle">
                    {b.right.text}
                  </text>
                )}
              </g>
              {/* Scale Label */}
              {b.label && (
                <text x={fulcrumX} y={fulcrumY + 44} fontSize="13" fill="#64748b" textAnchor="middle" fontWeight="bold">
                  {b.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ============================================================================
// 5. RENDER SHAPE EQUATION SVG (Phép toán lồng hình học)
// ============================================================================

function renderSingleShape(shape: ShapeType, size = 50, isInner = false): React.JSX.Element {
  const half = size / 2
  const stroke = '#1e293b'
  const strokeWidth = isInner ? 2 : 2.5
  const fill = isInner ? '#e2e8f0' : '#f8fafc'

  switch (shape) {
    case 'square':
      return <rect x="2" y="2" width={size - 4} height={size - 4} rx="4" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
    case 'circle':
      return <circle cx={half} cy={half} r={half - 3} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
    case 'triangle':
      return <polygon points={`${half},4 ${size - 4},${size - 4} 4,${size - 4}`} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
    case 'pentagon':
      return (
        <polygon
          points={`${half},3 ${size - 2},${half * 0.76} ${size * 0.8},${size - 3} ${size * 0.2},${size - 3} 2,${half * 0.76}`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      )
    case 'hexagon':
      return (
        <polygon
          points={`${half},3 ${size - 3},${half * 0.5} ${size - 3},${half * 1.5} ${half},${size - 3} 3,${half * 1.5} 3,${half * 0.5}`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      )
    case 'star':
      return <polygon points={`${half},2 ${half + 10},${half - 4} ${size - 2},${half} ${half + 14},${half + 10} ${half + 8},${size - 2} ${half},${half + 14} ${half - 8},${size - 2} ${half - 14},${half + 10} 2,${half} ${half - 10},${half - 4}`} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
  }
}

export function renderShapeEquationSvg(
  rows: ShapeEquationRow[],
  options?: { className?: string },
): React.JSX.Element {
  const rowHeight = 65
  const totalHeight = rows.length * rowHeight + 15

  return (
    <div className={options?.className ?? 'flex flex-col items-center justify-center p-4 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-md mx-auto w-full'}>
      <svg viewBox={`0 0 300 ${totalHeight}`} className="w-full max-h-56 select-none font-bold">
        {rows.map((row, idx) => {
          const y = idx * rowHeight + 10
          return (
            <g key={`eq-row-${idx}`} transform={`translate(0, ${y})`}>
              {/* Left shape */}
              <g transform="translate(15, 0)">
                {renderSingleShape(row.left, 48)}
              </g>

              {/* Operator */}
              <text x="85" y="27" fill="#0f172a" fontSize="24" textAnchor="middle" dominantBaseline="middle">
                {row.operator ?? '+'}
              </text>

              {/* Right shape */}
              <g transform="translate(105, 0)">
                {renderSingleShape(row.right, 48)}
              </g>

              {/* Equals */}
              <text x="175" y="27" fill="#0f172a" fontSize="24" textAnchor="middle" dominantBaseline="middle">
                =
              </text>

              {/* Result Shape */}
              <g transform="translate(195, 0)">
                {row.isQuestion ? (
                  <g>
                    <rect x="0" y="0" width="48" height="48" rx="10" fill="#fff1f2" stroke="#fb7185" strokeWidth="2" strokeDasharray="4 3" />
                    <text x="24" y="26" fill="#e11d48" fontSize="26" fontWeight="900" textAnchor="middle" dominantBaseline="middle">
                      ?
                    </text>
                  </g>
                ) : (
                  <g>
                    {row.resultNested ? (
                      <g>
                        {renderSingleShape(row.resultNested.outer, 48)}
                        <g transform="translate(10, 10)">
                          {renderSingleShape(row.resultNested.inner, 28, true)}
                        </g>
                      </g>
                    ) : (
                      renderSingleShape(row.left, 48)
                    )}
                  </g>
                )}
              </g>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ============================================================================
// 6. RENDER GRID MAZE SVG (Mê cung Pure Vector)
// ============================================================================

export function renderGridMazeSvg(
  config?: GridMazeConfig,
): React.JSX.Element {
  return (
    <div className={config?.className ?? 'flex items-center justify-center p-5 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-md mx-auto w-full'}>
      <svg viewBox="0 0 340 320" className="w-full max-h-72 select-none font-bold">
        {/* Entrance Arrow (Left) */}
        <g transform="translate(10, 60)">
          <line x1="0" y1="10" x2="35" y2="10" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
          <polygon points="35,4 45,10 35,16" fill="#0f172a" />
        </g>

        {/* Exit A (Top) */}
        <g transform="translate(200, 5)">
          <text x="0" y="16" fill="#0f172a" fontSize="22" fontWeight="900" textAnchor="middle">A</text>
          <line x1="0" y1="40" x2="0" y2="24" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
          <polygon points="-5,24 0,18 5,24" fill="#0f172a" />
        </g>

        {/* Exit B (Right) */}
        <g transform="translate(295, 125)">
          <text x="25" y="7" fill="#0f172a" fontSize="22" fontWeight="900" textAnchor="middle">B</text>
          <line x1="0" y1="0" x2="16" y2="0" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
          <polygon points="16,-5 22,0 16,5" fill="#0f172a" />
        </g>

        {/* Exit C (Bottom-Right) */}
        <g transform="translate(230, 275)">
          <line x1="0" y1="0" x2="0" y2="16" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
          <polygon points="-5,16 0,22 5,16" fill="#0f172a" />
          <text x="0" y="40" fill="#0f172a" fontSize="22" fontWeight="900" textAnchor="middle">C</text>
        </g>

        {/* Exit D (Bottom-Left) */}
        <g transform="translate(90, 275)">
          <line x1="0" y1="0" x2="0" y2="16" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
          <polygon points="-5,16 0,22 5,16" fill="#0f172a" />
          <text x="0" y="40" fill="#0f172a" fontSize="22" fontWeight="900" textAnchor="middle">D</text>
        </g>

        {/* Maze Walls */}
        <g stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Outer Boundary */}
          <line x1="60" y1="50" x2="185" y2="50" />
          <line x1="215" y1="50" x2="280" y2="50" />
          <line x1="280" y1="50" x2="280" y2="110" />
          <line x1="280" y1="140" x2="280" y2="270" />
          <line x1="280" y1="270" x2="245" y2="270" />
          <line x1="215" y1="270" x2="105" y2="270" />
          <line x1="75" y1="270" x2="60" y2="270" />
          <line x1="60" y1="270" x2="60" y2="90" />
          <line x1="60" y1="50" x2="60" y2="50" />

          {/* Internal Walls */}
          <line x1="90" y1="80" x2="150" y2="80" />
          <line x1="90" y1="80" x2="90" y2="130" />
          <line x1="90" y1="130" x2="130" y2="130" />

          <line x1="120" y1="100" x2="120" y2="170" />
          <line x1="150" y1="100" x2="150" y2="150" />
          <line x1="150" y1="150" x2="200" y2="150" />

          <line x1="180" y1="80" x2="250" y2="80" />
          <line x1="180" y1="80" x2="180" y2="120" />
          <line x1="220" y1="100" x2="220" y2="170" />
          <line x1="250" y1="100" x2="250" y2="210" />

          <line x1="90" y1="170" x2="170" y2="170" />
          <line x1="90" y1="200" x2="140" y2="200" />
          <line x1="90" y1="230" x2="180" y2="230" />
          <line x1="140" y1="200" x2="140" y2="270" />
          <line x1="180" y1="170" x2="180" y2="230" />

          <line x1="210" y1="200" x2="270" y2="200" />
          <line x1="210" y1="230" x2="250" y2="230" />
          <line x1="210" y1="200" x2="210" y2="270" />
        </g>
      </svg>
    </div>
  )
}

// ============================================================================
// 7. RENDER GRID POLYLINE SVG (Đường gấp khúc trên lưới 6x2)
// ============================================================================

export function renderGridPolylineSvg(
  config: GridPolylineConfig,
): React.JSX.Element {
  const cols = config.cols ?? 6
  const rows = config.rows ?? 2
  const cellWidth = 26
  const cellHeight = 23
  const padding = 2

  const width = cols * cellWidth + padding * 2
  const height = rows * cellHeight + padding * 2

  // Transform point [gridX, gridY] to svg pixel [x, y]
  const svgPoints = config.points
    .map(([gx, gy]) => `${padding + gx * cellWidth},${padding + gy * cellHeight}`)
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={config.className ?? 'w-36 sm:w-44 h-12 shrink-0 select-none'}
    >
      {/* Outer Grid Box */}
      <rect
        x={padding}
        y={padding}
        width={cols * cellWidth}
        height={rows * cellHeight}
        fill="#ffffff"
        stroke="#1e293b"
        strokeWidth="1"
      />

      {/* Grid Vertical Lines */}
      {Array.from({ length: cols - 1 }).map((_, i) => {
        const x = padding + (i + 1) * cellWidth
        return (
          <line
            key={`grid-v-${i}`}
            x1={x}
            y1={padding}
            x2={x}
            y2={padding + rows * cellHeight}
            stroke="#cbd5e1"
            strokeWidth="1"
          />
        )
      })}

      {/* Grid Horizontal Lines */}
      {Array.from({ length: rows - 1 }).map((_, i) => {
        const y = padding + (i + 1) * cellHeight
        return (
          <line
            key={`grid-h-${i}`}
            x1={padding}
            y1={y}
            x2={padding + cols * cellWidth}
            y2={y}
            stroke="#cbd5e1"
            strokeWidth="1"
          />
        )
      })}

      {/* Polyline */}
      <polyline
        points={svgPoints}
        fill="none"
        stroke="#0f172a"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Vertex Dots */}
      {config.points.map(([gx, gy], idx) => (
        <circle
          key={`pt-${idx}`}
          cx={padding + gx * cellWidth}
          cy={padding + gy * cellHeight}
          r="2.5"
          fill="#2563eb"
        />
      ))}
    </svg>
  )
}

// ============================================================================
// 8. RENDER CAKE PARTITION SVG (Chia bánh vuông / tròn 4 phần)
// ============================================================================

export function renderCakePartitionSvg(
  config: CakePartitionConfig,
): React.JSX.Element {
  const size = 70
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={config.className ?? 'size-16 sm:size-20 shrink-0 select-none'}>
      {/* Cake Base */}
      <rect x="6" y="6" width="58" height="58" rx="4" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />

      {/* Partition Lines */}
      {config.variant === 'cross' && (
        <g stroke="#1e293b" strokeWidth="2" strokeDasharray="3 3">
          <line x1="35" y1="6" x2="35" y2="64" />
          <line x1="6" y1="35" x2="64" y2="35" />
        </g>
      )}

      {config.variant === 'diagonals' && (
        <g stroke="#1e293b" strokeWidth="2" strokeDasharray="3 3">
          <line x1="6" y1="6" x2="64" y2="64" />
          <line x1="64" y1="6" x2="6" y2="64" />
        </g>
      )}

      {config.variant === 'unequal_triangle' && (
        <g stroke="#1e293b" strokeWidth="2" strokeDasharray="3 3">
          <line x1="35" y1="6" x2="6" y2="64" />
          <line x1="35" y1="6" x2="64" y2="64" />
          <line x1="35" y1="6" x2="35" y2="64" />
        </g>
      )}

      {config.variant === 'diagonal_offset' && (
        <g stroke="#1e293b" strokeWidth="2" strokeDasharray="3 3">
          <line x1="6" y1="35" x2="35" y2="6" />
          <line x1="6" y1="64" x2="64" y2="6" />
          <line x1="35" y1="64" x2="64" y2="35" />
        </g>
      )}

      {config.variant === 'parallel_vertical' && (
        <g stroke="#1e293b" strokeWidth="2" strokeDasharray="3 3">
          <line x1="20.5" y1="6" x2="20.5" y2="64" />
          <line x1="35" y1="6" x2="35" y2="64" />
          <line x1="49.5" y1="6" x2="49.5" y2="64" />
        </g>
      )}
    </svg>
  )
}

// ============================================================================
// 9. RENDER SIERPINSKI / DIVIDED TRIANGLE SVG (Đếm tam giác phân rã)
// ============================================================================

export function renderSierpinskiTriangleSvg(
  config?: SierpinskiConfig,
): React.JSX.Element {
  const depth = config?.depth ?? 1
  return (
    <div className={config?.className ?? 'flex items-center justify-center p-5 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-sm mx-auto w-full'}>
      <svg viewBox="0 0 200 170" className="w-full max-h-56 select-none">
        {/* Outer Large Triangle */}
        <polygon points="100,10 190,160 10,160" fill="#ffffff" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
        {/* Level 1 Inverted Inner Triangle */}
        <polygon points="100,160 55,85 145,85" fill={config?.fillCenter ? '#f1f5f9' : '#ffffff'} stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />

        {/* Level 2 Sub-triangles if requested */}
        {depth >= 2 && (
          <g stroke="#1e293b" strokeWidth="1.8" fill="#ffffff" strokeLinejoin="round">
            {/* Top Sub-triangle */}
            <polygon points="100,85 77.5,47.5 122.5,47.5" />
            {/* Bottom-left Sub-triangle */}
            <polygon points="55,160 32.5,122.5 77.5,122.5" />
            {/* Bottom-right Sub-triangle */}
            <polygon points="145,160 122.5,122.5 167.5,122.5" />
          </g>
        )}
      </svg>
    </div>
  )
}

// ============================================================================
// 10. RENDER GRID SHADED RATIO SVG (Lưới diện tích & phân số tỉ lệ)
// ============================================================================

export function renderGridShadedRatioSvg(
  config: GridShadedRatioConfig,
): React.JSX.Element {
  const cellSize = config.cellSize ?? 36
  const padding = 5
  const width = config.cols * cellSize + padding * 2
  const height = config.rows * cellSize + padding * 2

  return (
    <div className={config.className ?? 'flex items-center justify-center p-4 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-sm mx-auto w-full'}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-h-72 select-none font-bold">
        {/* Background Base */}
        <rect
          x={padding}
          y={padding}
          width={config.cols * cellSize}
          height={config.rows * cellSize}
          fill="#ffffff"
          stroke="#1e293b"
          strokeWidth="3"
        />

        {/* Shaded Cells */}
        {config.shadedCells.map(([r, c]) => (
          <rect
            key={`shaded-${r}-${c}`}
            x={padding + c * cellSize}
            y={padding + r * cellSize}
            width={cellSize}
            height={cellSize}
            fill="#94a3b8"
          />
        ))}

        {/* Grid Lines */}
        {Array.from({ length: config.cols - 1 }).map((_, c) => {
          const x = padding + (c + 1) * cellSize
          return (
            <line
              key={`v-line-${c}`}
              x1={x}
              y1={padding}
              x2={x}
              y2={padding + config.rows * cellSize}
              stroke="#1e293b"
              strokeWidth="2"
            />
          )
        })}
        {Array.from({ length: config.rows - 1 }).map((_, r) => {
          const y = padding + (r + 1) * cellSize
          return (
            <line
              key={`h-line-${r}`}
              x1={padding}
              y1={y}
              x2={padding + config.cols * cellSize}
              y2={y}
              stroke="#1e293b"
              strokeWidth="2"
            />
          )
        })}

        {/* Labels in specific cells */}
        {config.labels?.map((lbl, idx) => {
          const x = padding + lbl.c * cellSize
          const y = padding + lbl.r * cellSize
          return (
            <g key={`lbl-${idx}`}>
              <rect x={x} y={y} width={cellSize} height={cellSize} fill="#ffffff" />
              <text
                x={x + cellSize / 2}
                y={y + cellSize / 2}
                fill="#0f172a"
                fontSize="18"
                fontWeight="900"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {lbl.text}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ============================================================================
// 11. RENDER SCATTERED COUNTING SVG (Đếm bóng, chữ số xoay, hình phân tán)
// ============================================================================

export function renderScatteredCountingSvg(
  config: ScatteredCountingConfig,
): React.JSX.Element {
  if (config.type === 'balls') {
    const blackBalls = config.blackBalls ?? [
      [95, 55],
      [108, 108],
      [165, 118],
      [68, 170],
      [148, 165],
      [265, 85],
      [300, 138],
      [390, 120],
      [365, 170],
    ]
    const whiteBalls = config.whiteBalls ?? [
      [198, 62],
      [102, 155],
      [218, 135],
      [340, 90],
      [282, 180],
    ]

    return (
      <div className={config.className ?? 'flex items-center justify-center p-6 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-lg mx-auto w-full'}>
        <svg viewBox="0 0 420 210" className="w-full max-h-60 select-none">
          {/* Black Balls */}
          {blackBalls.map(([x, y], idx) => (
            <circle key={`b-${idx}`} cx={x} cy={y} r="17" fill="#0f172a" />
          ))}
          {/* White Balls */}
          {whiteBalls.map(([x, y], idx) => (
            <circle
              key={`w-${idx}`}
              cx={x}
              cy={y}
              r="17"
              fill="#ffffff"
              stroke="#1e293b"
              strokeWidth="3.5"
            />
          ))}
        </svg>
      </div>
    )
  }

  if (config.type === 'digits') {
    const digits = config.digits ?? [
      { value: '1', x: 65, y: 70, rotate: -30, fontSize: 36 },
      { value: '5', x: 160, y: 65, fontSize: 38 },
      { value: '9', x: 250, y: 65, fontSize: 38 },
      { value: '8', x: 365, y: 65, fontSize: 38 },
      { value: '3', x: 75, y: 145, rotate: 90, fontSize: 36 },
      { value: '8', x: 140, y: 145, rotate: 90, fontSize: 36 },
      { value: '2', x: 205, y: 130, fontSize: 36 },
      { value: '6', x: 205, y: 172, fontSize: 28 },
      { value: '1', x: 260, y: 138, rotate: 20, fontSize: 36 },
      { value: '2', x: 325, y: 125, fontSize: 36 },
      { value: '7', x: 325, y: 172, rotate: 180, fontSize: 32 },
    ]

    return (
      <div className={config.className ?? 'flex items-center justify-center p-6 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-xl mx-auto w-full'}>
        <svg viewBox="0 0 460 220" className="w-full max-h-64 select-none font-bold">
          {/* Box Border */}
          <rect x="15" y="15" width="430" height="190" rx="12" fill="#ffffff" stroke="#1e293b" strokeWidth="3.5" />
          {/* Rotated Digits */}
          {digits.map((d, idx) => {
            const rot = d.rotate ? `rotate(${d.rotate}, ${d.x}, ${d.y})` : undefined
            return (
              <text
                key={`digit-${idx}`}
                x={d.x}
                y={d.y}
                transform={rot}
                fontFamily="system-ui, -apple-system, sans-serif"
                fontSize={d.fontSize ?? 36}
                fontWeight="900"
                fill="#0f172a"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {d.value}
              </text>
            )
          })}
        </svg>
      </div>
    )
  }

  return <div />
}

// ============================================================================
// 12. RENDER VERTICAL ARITHMETIC TABLE (Đặt tính rồi tính cột dọc)
// ============================================================================

export function renderVerticalArithmeticTable(
  top: number | string,
  op: '+' | '-' | '×' | '÷',
  bottom: number | string,
  result?: number | string | '?',
  options?: { className?: string; highlightBox?: boolean },
): React.JSX.Element {
  return (
    <div className={options?.className ?? 'flex items-center justify-center p-4 rounded-2xl bg-white border border-slate-200 shadow-sm max-w-[200px] mx-auto w-full'}>
      <svg viewBox="0 0 120 130" className="w-full max-h-36 select-none font-mono font-bold">
        {/* Top Number */}
        <text x="90" y="32" fontSize="28" fill="#0f172a" textAnchor="end" dominantBaseline="middle">
          {top}
        </text>

        {/* Operator */}
        <text x="25" y="65" fontSize="26" fill="#0f172a" textAnchor="middle" dominantBaseline="middle">
          {op}
        </text>

        {/* Bottom Number */}
        <text x="90" y="65" fontSize="28" fill="#0f172a" textAnchor="end" dominantBaseline="middle">
          {bottom}
        </text>

        {/* Divider Line */}
        <line x1="15" y1="85" x2="105" y2="85" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />

        {/* Result */}
        {result === '?' ? (
          <g transform="translate(58, 93)">
            <rect x="0" y="0" width="36" height="30" rx="6" fill="#fff1f2" stroke="#fb7185" strokeWidth="2" strokeDasharray="3 3" />
            <text x="18" y="16" fontSize="22" fill="#e11d48" fontWeight="900" textAnchor="middle" dominantBaseline="central">
              ?
            </text>
          </g>
        ) : (
          <text x="90" y="108" fontSize="28" fill="#2563eb" fontWeight="900" textAnchor="end" dominantBaseline="middle">
            {result ?? ''}
          </text>
        )}
      </svg>
    </div>
  )
}

// ============================================================================
// 13. RENDER ISOMETRIC 3D CUBES (Mô hình khối lập phương 3D đẳng cự)
// ============================================================================

export type CubeCoord = { x: number; y: number; z: number }

export function renderIsometricCubesSvg(
  cubes: CubeCoord[],
  options?: { size?: number; className?: string; unit?: number },
): React.JSX.Element {
  const u = options?.unit ?? 22
  const cos30 = 0.8660254
  const sin30 = 0.5

  // Painter's algorithm sort: lower (x+y) in background, lower z first
  const sorted = [...cubes].sort((a, b) => {
    const sumA = a.x + a.y
    const sumB = b.x + b.y
    if (sumA !== sumB) return sumA - sumB
    return a.z - b.z
  })

  const allPts: Array<[number, number]> = []
  const renderedCubes = sorted.map((c) => {
    const px = (c.x - c.y) * cos30 * u
    const py = (c.x + c.y) * sin30 * u - c.z * u

    const topPts: Array<[number, number]> = [
      [px, py - u],
      [px + u * cos30, py - u * sin30],
      [px, py],
      [px - u * cos30, py - u * sin30],
    ]
    const leftPts: Array<[number, number]> = [
      [px - u * cos30, py - u * sin30],
      [px, py],
      [px, py + u],
      [px - u * cos30, py + u * sin30],
    ]
    const rightPts: Array<[number, number]> = [
      [px, py],
      [px + u * cos30, py - u * sin30],
      [px + u * cos30, py + u * sin30],
      [px, py + u],
    ]

    allPts.push(...topPts, ...leftPts, ...rightPts)
    return { topPts, leftPts, rightPts }
  })

  const xs = allPts.map((p) => p[0])
  const ys = allPts.map((p) => p[1])
  const minX = Math.min(...xs) - 8
  const maxX = Math.max(...xs) + 8
  const minY = Math.min(...ys) - 8
  const maxY = Math.max(...ys) + 8
  const w = maxX - minX
  const h = maxY - minY

  const ptsToStr = (pts: Array<[number, number]>) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')

  return (
    <div className={options?.className ?? 'flex items-center justify-center p-2 rounded-2xl bg-white border border-slate-200/90 shadow-xs max-w-xs mx-auto w-full'}>
      <svg
        viewBox={`${minX.toFixed(1)} ${minY.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`}
        className="w-full max-h-52 select-none"
      >
        {renderedCubes.map((c, idx) => (
          <g key={`cube-${idx}`}>
            {/* Top Face */}
            <polygon
              points={ptsToStr(c.topPts)}
              fill="#ffffff"
              stroke="#1e293b"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Left Face */}
            <polygon
              points={ptsToStr(c.leftPts)}
              fill="#f1f5f9"
              stroke="#1e293b"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Right Face */}
            <polygon
              points={ptsToStr(c.rightPts)}
              fill="#cbd5e1"
              stroke="#1e293b"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </g>
        ))}
      </svg>
    </div>
  )
}

// ============================================================================
// 14. RENDER FRACTION CIRCLE (Hình tròn phân số tô màu)
// ============================================================================

export function renderFractionCircleSvg(
  totalSlices: number,
  shadedSlices: number,
  options?: { size?: number; color?: string; className?: string },
): React.JSX.Element {
  const size = options?.size ?? 90
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 5
  const color = options?.color ?? '#ef4444' // ASMO red highlight

  const toRad = Math.PI / 180
  const sliceAngle = 360 / totalSlices

  const slices = Array.from({ length: totalSlices }).map((_, i) => {
    const a1Deg = -90 + i * sliceAngle
    const a2Deg = -90 + (i + 1) * sliceAngle
    const x1 = cx + r * Math.cos(a1Deg * toRad)
    const y1 = cy + r * Math.sin(a1Deg * toRad)
    const x2 = cx + r * Math.cos(a2Deg * toRad)
    const y2 = cy + r * Math.sin(a2Deg * toRad)
    const largeArc = a2Deg - a1Deg > 180 ? 1 : 0
    const d = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`
    const isShaded = i < shadedSlices
    return { d, isShaded }
  })

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={options?.className ?? 'size-16 sm:size-20 shrink-0 select-none'}
    >
      {slices.map((s, idx) => (
        <path
          key={`slice-${idx}`}
          d={s.d}
          fill={s.isShaded ? color : '#ffffff'}
          stroke="#1e293b"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      ))}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth="2.2" />
    </svg>
  )
}

// ============================================================================
// 15. RENDER MONEY BANKNOTES (Tiền giấy RM10, RM5, RM1)
// ============================================================================

export function renderMoneyBanknotesSvg(options?: { className?: string }): React.JSX.Element {
  return (
    <div className={options?.className ?? 'flex items-center justify-center p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-md mx-auto w-full'}>
      <svg viewBox="0 0 420 170" className="w-full max-h-48 select-none font-bold">
        {/* Row 1: RM10, RM10, RM5 */}
        <g transform="translate(15, 15)">
          <rect x="0" y="0" width="115" height="58" rx="8" fill="#fee2e2" stroke="#ef4444" strokeWidth="2.5" />
          <rect x="5" y="5" width="105" height="48" rx="5" fill="none" stroke="#fca5a5" strokeWidth="1" strokeDasharray="3 2" />
          <text x="57" y="34" fontSize="22" fontWeight="900" fill="#991b1b" textAnchor="middle" dominantBaseline="central">
            RM10
          </text>
        </g>

        <g transform="translate(150, 15)">
          <rect x="0" y="0" width="115" height="58" rx="8" fill="#fee2e2" stroke="#ef4444" strokeWidth="2.5" />
          <rect x="5" y="5" width="105" height="48" rx="5" fill="none" stroke="#fca5a5" strokeWidth="1" strokeDasharray="3 2" />
          <text x="57" y="34" fontSize="22" fontWeight="900" fill="#991b1b" textAnchor="middle" dominantBaseline="central">
            RM10
          </text>
        </g>

        <g transform="translate(285, 15)">
          <rect x="0" y="0" width="115" height="58" rx="8" fill="#dcfce7" stroke="#22c55e" strokeWidth="2.5" />
          <rect x="5" y="5" width="105" height="48" rx="5" fill="none" stroke="#86efac" strokeWidth="1" strokeDasharray="3 2" />
          <text x="57" y="34" fontSize="22" fontWeight="900" fill="#166534" textAnchor="middle" dominantBaseline="central">
            RM5
          </text>
        </g>

        {/* Row 2: RM1, RM5, RM1 */}
        <g transform="translate(25, 95)">
          <rect x="0" y="0" width="105" height="54" rx="8" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2.5" />
          <rect x="5" y="5" width="95" height="44" rx="5" fill="none" stroke="#93c5fd" strokeWidth="1" strokeDasharray="3 2" />
          <text x="52" y="32" fontSize="20" fontWeight="900" fill="#1e40af" textAnchor="middle" dominantBaseline="central">
            RM1
          </text>
        </g>

        <g transform="translate(155, 95)">
          <rect x="0" y="0" width="115" height="58" rx="8" fill="#dcfce7" stroke="#22c55e" strokeWidth="2.5" />
          <rect x="5" y="5" width="105" height="48" rx="5" fill="none" stroke="#86efac" strokeWidth="1" strokeDasharray="3 2" />
          <text x="57" y="34" fontSize="22" fontWeight="900" fill="#166534" textAnchor="middle" dominantBaseline="central">
            RM5
          </text>
        </g>

        <g transform="translate(290, 95)">
          <rect x="0" y="0" width="105" height="54" rx="8" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2.5" />
          <rect x="5" y="5" width="95" height="44" rx="5" fill="none" stroke="#93c5fd" strokeWidth="1" strokeDasharray="3 2" />
          <text x="52" y="32" fontSize="20" fontWeight="900" fill="#1e40af" textAnchor="middle" dominantBaseline="central">
            RM1
          </text>
        </g>
      </svg>
    </div>
  )
}

// ============================================================================
// 16. RENDER SHAPE SEQUENCE (Dãy hình quy luật hình học)
// ============================================================================

export function renderShapeSequenceSvg(options?: { className?: string }): React.JSX.Element {
  return (
    <div className={options?.className ?? 'flex items-center justify-center p-4 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-2xl mx-auto w-full overflow-x-auto'}>
      <svg viewBox="0 0 620 80" className="w-full min-w-[560px] max-h-24 select-none">
        {/* 1. Rectangle */}
        <rect x="15" y="18" width="48" height="44" rx="8" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
        {/* 2. Triangle */}
        <polygon points="78,62 126,62 126,18" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
        {/* 3. Circle */}
        <circle cx="158" cy="40" r="22" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
        {/* 4. Circle */}
        <circle cx="214" cy="40" r="22" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
        {/* 5. Triangle */}
        <polygon points="252,62 300,62 300,18" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
        {/* 6. Question Box 1 */}
        <rect x="316" y="18" width="46" height="44" rx="8" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 3" />
        <text x="339" y="44" fontSize="24" fontWeight="bold" fill="#2563eb" textAnchor="middle" dominantBaseline="central">?</text>
        {/* 7. Triangle */}
        <polygon points="378,62 426,62 426,18" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
        {/* 8. Circle */}
        <circle cx="458" cy="40" r="22" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
        {/* 9. Question Box 2 */}
        <rect x="496" y="18" width="46" height="44" rx="8" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 3" />
        <text x="519" y="44" fontSize="24" fontWeight="bold" fill="#2563eb" textAnchor="middle" dominantBaseline="central">?</text>
        {/* 10. Triangle */}
        <polygon points="558,62 606,62 606,18" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

// ============================================================================
// 17. RENDER PATTERN BOXES (Lưới chuỗi ô quy luật giảm nét)
// ============================================================================

export function renderPatternBoxesSvg(options?: { className?: string }): React.JSX.Element {
  return (
    <div className={options?.className ?? 'flex items-center justify-center p-4 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-lg mx-auto w-full'}>
      <svg viewBox="0 0 440 110" className="w-full max-h-32 select-none">
        {/* Box 1: Full Square + X */}
        <rect x="15" y="15" width="80" height="80" rx="4" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
        <line x1="15" y1="15" x2="95" y2="95" stroke="#1e293b" strokeWidth="2" />
        <line x1="95" y1="15" x2="15" y2="95" stroke="#1e293b" strokeWidth="2" />

        {/* Box 2: Top line missing */}
        <line x1="125" y1="15" x2="125" y2="95" stroke="#1e293b" strokeWidth="2.5" />
        <line x1="205" y1="15" x2="205" y2="95" stroke="#1e293b" strokeWidth="2.5" />
        <line x1="125" y1="95" x2="205" y2="95" stroke="#1e293b" strokeWidth="2.5" />
        <line x1="125" y1="15" x2="205" y2="95" stroke="#1e293b" strokeWidth="2" />
        <line x1="205" y1="15" x2="125" y2="95" stroke="#1e293b" strokeWidth="2" />

        {/* Box 3: Top and bottom missing */}
        <line x1="235" y1="15" x2="235" y2="95" stroke="#1e293b" strokeWidth="2.5" />
        <line x1="315" y1="15" x2="315" y2="95" stroke="#1e293b" strokeWidth="2.5" />
        <line x1="235" y1="15" x2="315" y2="95" stroke="#1e293b" strokeWidth="2" />
        <line x1="315" y1="15" x2="235" y2="95" stroke="#1e293b" strokeWidth="2" />

        {/* Box 4: Target ? */}
        <rect x="345" y="15" width="80" height="80" rx="4" fill="#f8fafc" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 4" />
        <text x="385" y="62" fontSize="32" fontWeight="bold" fill="#4f46e5" textAnchor="middle" dominantBaseline="central">?</text>
      </svg>
    </div>
  )
}

// ============================================================================
// 18. RENDER BALLOON BAR CHART (Biểu đồ cột bóng bay các màu)
// ============================================================================

export function renderBalloonBarChartSvg(options?: { className?: string }): React.JSX.Element {
  const bars = [
    { label: 'Red', count: 18, color: '#ef4444' },
    { label: 'Yellow', count: 9, color: '#f59e0b' },
    { label: 'Black', count: 15, color: '#334155' },
    { label: 'Blue', count: 12, color: '#3b82f6' },
    { label: 'White', count: 15, color: '#ffffff', stroke: '#1e293b' },
  ]

  const chartY0 = 180
  const chartHeight = 140
  const maxVal = 18

  return (
    <div className={options?.className ?? 'flex items-center justify-center p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-lg mx-auto w-full'}>
      <svg viewBox="0 0 450 240" className="w-full max-h-60 select-none font-sans">
        {/* Title */}
        <text x="225" y="22" fontSize="14" fontWeight="800" fill="#0f172a" textAnchor="middle">
          Colours of Balloons in a shop
        </text>

        {/* Y Axis Label */}
        <text x="20" y="32" fontSize="11" fontWeight="700" fill="#475569" textAnchor="start">
          Number of Balloons
        </text>

        {/* Horizontal Grid lines & Y-ticks (0, 3, 6, 9, 12, 15, 18) */}
        {[0, 3, 6, 9, 12, 15, 18].map((v) => {
          const y = chartY0 - (v / maxVal) * chartHeight
          return (
            <g key={`y-${v}`}>
              <line x1="80" y1={y} x2="410" y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
              <text x="70" y={y + 4} fontSize="11" fontWeight="600" fill="#64748b" textAnchor="end">
                {v}
              </text>
            </g>
          )
        })}

        {/* Y-axis line & X-axis line */}
        <line x1="80" y1="40" x2="80" y2={chartY0} stroke="#1e293b" strokeWidth="2" />
        <line x1="80" y1={chartY0} x2="410" y2={chartY0} stroke="#1e293b" strokeWidth="2" />

        {/* Bars */}
        {bars.map((b, i) => {
          const barW = 44
          const x = 100 + i * 62
          const barH = (b.count / maxVal) * chartHeight
          const y = chartY0 - barH
          const numBlocks = b.count / 3

          return (
            <g key={`bar-${b.label}`}>
              {/* Outer Bar */}
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                fill={b.color}
                stroke={b.stroke ?? '#1e293b'}
                strokeWidth="1.8"
              />
              {/* Internal segment lines every 3 units */}
              {Array.from({ length: numBlocks - 1 }).map((_, bi) => {
                const segY = chartY0 - (((bi + 1) * 3) / maxVal) * chartHeight
                return (
                  <line
                    key={`seg-${bi}`}
                    x1={x}
                    y1={segY}
                    x2={x + barW}
                    y2={segY}
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )
              })}
              {/* Label */}
              <text x={x + barW / 2} y={chartY0 + 18} fontSize="12" fontWeight="700" fill="#1e293b" textAnchor="middle">
                {b.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ============================================================================
// 19. RENDER VERTICAL ADDITION WITH LETTERS (Đặt tính cộng chữ cái)
// ============================================================================

export function renderVerticalAdditionTable(
  num1: string | number,
  char1: string,
  char2: string,
  result: string | number,
  options?: { className?: string },
): React.JSX.Element {
  return (
    <div className={options?.className ?? 'flex items-center justify-center p-4 rounded-2xl bg-white border border-slate-200 shadow-sm max-w-[200px] mx-auto w-full'}>
      <svg viewBox="0 0 130 140" className="w-full max-h-36 select-none font-mono font-bold">
        {/* Top Number, e.g. 1 7 */}
        <text x="75" y="32" fontSize="28" fill="#0f172a" textAnchor="middle" letterSpacing="4">
          {num1}
        </text>

        {/* Plus Operator */}
        <text x="25" y="65" fontSize="26" fill="#0f172a" textAnchor="middle">
          +
        </text>

        {/* Bottom Unknowns, e.g. C D */}
        <g transform="translate(50, 44)">
          <rect x="0" y="0" width="22" height="26" rx="4" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.5" />
          <text x="11" y="18" fontSize="20" fill="#1d4ed8" textAnchor="middle">{char1}</text>
        </g>
        <g transform="translate(76, 44)">
          <rect x="0" y="0" width="22" height="26" rx="4" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.5" />
          <text x="11" y="18" fontSize="20" fill="#1d4ed8" textAnchor="middle">{char2}</text>
        </g>

        {/* Divider Line */}
        <line x1="15" y1="80" x2="115" y2="80" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />

        {/* Result, e.g. 82 */}
        <text x="75" y="112" fontSize="28" fill="#2563eb" fontWeight="900" textAnchor="middle" letterSpacing="4">
          {result}
        </text>
      </svg>
    </div>
  )
}

// ============================================================================
// 20. RENDER DICE VIEWS (Ba góc nhìn xúc xắc)
// ============================================================================

export function renderDiceViewsSvg(options?: { className?: string }): React.JSX.Element {
  const dice = [
    { top: '1', front: '3', right: '2', isHighlight: false },
    { top: '3', front: '?', right: '5', isHighlight: true },
    { top: '1', front: '4', right: '6', isHighlight: false },
  ]
  return (
    <div className={options?.className ?? 'flex items-center justify-center p-4 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-md mx-auto w-full'}>
      <svg viewBox="0 0 380 130" className="w-full max-h-36 select-none font-bold">
        {dice.map((d, i) => {
          const ox = 60 + i * 130
          const oy = 48
          const u = 32
          const cos30 = 0.866
          const sin30 = 0.5

          return (
            <g key={`die-${i}`} transform={`translate(${ox}, ${oy})`}>
              {/* Top Face */}
              <polygon
                points={`0,-${u} ${u * cos30},-${u * sin30} 0,0 -${u * cos30},-${u * sin30}`}
                fill="#ffffff"
                stroke="#1e293b"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <text x="0" y={-u * sin30} fontSize="18" fontWeight="900" fill="#0f172a" textAnchor="middle" dominantBaseline="central">
                {d.top}
              </text>

              {/* Front/Left Face */}
              <polygon
                points={`-${u * cos30},-${u * sin30} 0,0 0,${u} -${u * cos30},${u * sin30}`}
                fill={d.isHighlight ? '#fff1f2' : '#f1f5f9'}
                stroke={d.isHighlight ? '#e11d48' : '#1e293b'}
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <text
                x={-u * cos30 * 0.5}
                y={u * sin30 * 0.5 + 4}
                fontSize={d.front === '?' ? '22' : '18'}
                fontWeight="900"
                fill={d.isHighlight ? '#e11d48' : '#0f172a'}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {d.front}
              </text>

              {/* Right Face */}
              <polygon
                points={`0,0 ${u * cos30},-${u * sin30} ${u * cos30},${u * sin30} 0,${u}`}
                fill="#cbd5e1"
                stroke="#1e293b"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <text x={u * cos30 * 0.5} y={u * sin30 * 0.5 + 4} fontSize="18" fontWeight="900" fill="#0f172a" textAnchor="middle" dominantBaseline="central">
                {d.right}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ============================================================================
// 21. RENDER SHAPE MATRIX 2016 (Ma trận biến đổi hình học 2016)
// ============================================================================

export function renderShapeMatrix2016Svg(options?: { className?: string }): React.JSX.Element {
  return (
    <div className={options?.className ?? 'flex items-center justify-center p-4 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-sm mx-auto w-full'}>
      <svg viewBox="0 0 250 250" className="w-full max-h-64 select-none">
        {/* Row 1: Square, X, Square+X */}
        <rect x="20" y="20" width="40" height="40" rx="4" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
        <g transform="translate(100, 20)">
          <line x1="5" y1="5" x2="35" y2="35" stroke="#1e293b" strokeWidth="3" />
          <line x1="35" y1="5" x2="5" y2="35" stroke="#1e293b" strokeWidth="3" />
        </g>
        <g transform="translate(180, 20)">
          <rect x="0" y="0" width="40" height="40" rx="4" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
          <line x1="0" y1="0" x2="40" y2="40" stroke="#1e293b" strokeWidth="2" />
          <line x1="40" y1="0" x2="0" y2="40" stroke="#1e293b" strokeWidth="2" />
        </g>

        {/* Row 2: Circle, +, Circle++ */}
        <circle cx="40" cy="120" r="20" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
        <g transform="translate(100, 100)">
          <line x1="20" y1="5" x2="20" y2="35" stroke="#1e293b" strokeWidth="3" />
          <line x1="5" y1="20" x2="35" y2="20" stroke="#1e293b" strokeWidth="3" />
        </g>
        <g transform="translate(180, 100)">
          <circle cx="20" cy="20" r="20" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
          <line x1="20" y1="0" x2="20" y2="40" stroke="#1e293b" strokeWidth="2" />
          <line x1="0" y1="20" x2="40" y2="20" stroke="#1e293b" strokeWidth="2" />
        </g>

        {/* Row 3: Triangle, inverted Y, Question Box */}
        <polygon points="40,180 60,220 20,220" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
        <g transform="translate(100, 180)">
          <line x1="20" y1="5" x2="20" y2="22" stroke="#1e293b" strokeWidth="3" />
          <line x1="20" y1="22" x2="8" y2="38" stroke="#1e293b" strokeWidth="3" />
          <line x1="20" y1="22" x2="32" y2="38" stroke="#1e293b" strokeWidth="3" />
        </g>
        <g transform="translate(180, 180)">
          <rect x="0" y="0" width="40" height="40" rx="6" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3 3" />
          <text x="20" y="24" fontSize="22" fontWeight="900" fill="#2563eb" textAnchor="middle" dominantBaseline="central">?</text>
        </g>
      </svg>
    </div>
  )
}

// ============================================================================
// 22. RENDER DOT GRID 2016 (Lưới chấm 3x3)
// ============================================================================

export function renderDotGrid2016Svg(options?: { className?: string }): React.JSX.Element {
  return (
    <div className={options?.className ?? 'flex items-center justify-center p-4 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-[220px] mx-auto w-full'}>
      <svg viewBox="0 0 160 160" className="size-36 select-none">
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => (
            <circle
              key={`dot-${r}-${c}`}
              cx={30 + c * 50}
              cy={30 + r * 50}
              r="9"
              fill="#475569"
              stroke="#0f172a"
              strokeWidth="2.5"
            />
          )),
        )}
      </svg>
    </div>
  )
}

// ============================================================================
// 23. RENDER RECTANGLE GRID 2016 (Lưới hình chữ nhật 2x3 kèm dấu ※)
// ============================================================================

export function renderRectangleGrid2016Svg(options?: { className?: string }): React.JSX.Element {
  return (
    <div className={options?.className ?? 'flex items-center justify-center p-4 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-xs mx-auto w-full'}>
      <svg viewBox="0 0 200 130" className="w-full max-h-36 select-none">
        {[0, 1].map((r) =>
          [0, 1, 2].map((c) => {
            const isTarget = r === 1 && c === 1
            return (
              <g key={`cell-${r}-${c}`}>
                <rect
                  x={20 + c * 53}
                  y={20 + r * 45}
                  width="53"
                  height="45"
                  fill={isTarget ? '#fff1f2' : '#ffffff'}
                  stroke="#1e293b"
                  strokeWidth="2.5"
                />
                {isTarget && (
                  <text
                    x={20 + c * 53 + 26.5}
                    y={20 + r * 45 + 25}
                    fontSize="24"
                    fontWeight="bold"
                    fill="#e11d48"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    ※
                  </text>
                )}
              </g>
            )
          }),
        )}
      </svg>
    </div>
  )
}

// ============================================================================
// MAIN ASMO DIAGRAM ENGINE WRAPPER COMPONENT
// ============================================================================

export type AsmoDiagramEngineProps = {
  diagramKey?: string | null
  className?: string
  clockHour?: number
  clockMinute?: number
}

export function AsmoDiagramEngine({
  diagramKey,
  className,
  clockHour,
  clockMinute,
}: AsmoDiagramEngineProps): React.JSX.Element | null {
  if (!diagramKey) {
    if (clockHour !== undefined && clockMinute !== undefined) {
      return renderClockSvg(clockHour, clockMinute, { className })
    }
    return null
  }

  // Handle generic clock keys, e.g. "clock_5_10", "clock_8_30", "clock_10_00", "q17_clock"
  if (diagramKey.startsWith('clock_') || diagramKey === 'q17_clock' || diagramKey === 'g1_2015_q4_clock' || diagramKey === 'g1_2016_q4_clock') {
    if (diagramKey === 'q17_clock' || diagramKey === 'clock_5_10') {
      return (
        <div className="flex items-center justify-center p-4 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-xs mx-auto w-full">
          {renderClockSvg(5, 10, { className })}
        </div>
      )
    }
    if (diagramKey === 'g1_2015_q4_clock') {
      return (
        <div className="flex items-center justify-center p-4 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-xs mx-auto w-full">
          {renderClockSvg(10, 0, { className })}
        </div>
      )
    }
    if (diagramKey === 'g1_2016_q4_clock') {
      return (
        <div className="flex items-center justify-center p-4 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-xs mx-auto w-full">
          {renderClockSvg(3, 0, { className })}
        </div>
      )
    }
    const match = diagramKey.match(/clock_(\d+)_(\d+)/)
    if (match) {
      const h = parseInt(match[1], 10)
      const m = parseInt(match[2], 10)
      return (
        <div className="flex items-center justify-center p-2 rounded-2xl bg-white border border-slate-200 shadow-xs max-w-xs mx-auto w-full">
          {renderClockSvg(h, m, { className })}
        </div>
      )
    }
  }

  // Handle vertical arithmetic keys
  if (diagramKey === 'q11_vertical_sub' || diagramKey === 'vertical_sub_21_17') {
    return renderVerticalArithmeticTable(21, '-', 17, '?', { className })
  }
  if (diagramKey === 'g1_2015_q15_addition' || diagramKey === 'vertical_add_17_CD_82') {
    return renderVerticalAdditionTable('1 7', 'C', 'D', 82, { className })
  }
  if (diagramKey === 'g1_2016_q15_addition' || diagramKey === 'vertical_add_17_AA_72') {
    return renderVerticalAdditionTable('1 7', 'A', 'A', 72, { className })
  }

  // Match other keys
  switch (diagramKey) {
    // Q1 Balls (2020)
    case 'q01_balls':
      return renderScatteredCountingSvg({ type: 'balls', className })

    // Q2 Digits (2020)
    case 'q02_digits':
      return renderScatteredCountingSvg({ type: 'digits', className })

    // Q4 Balance Scales (2020)
    case 'q04_balance':
      return renderBalanceScaleSvg(
        [
          { left: { emoji: '🍌' }, right: { emoji: '🍓' }, tilt: 'left' },
          { left: { emoji: '🍎' }, right: { emoji: '🍌' }, tilt: 'right' },
          { left: { emoji: '🍇' }, right: { emoji: '🍌' }, tilt: 'left' },
        ],
        { className },
      )

    // Q5 Grey Grid (2020)
    case 'q05_grey_grid':
      return renderGridShadedRatioSvg({
        rows: 7,
        cols: 5,
        shadedCells: [
          // Area A (7)
          [0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2],
          // Area B (9)
          [0, 3], [0, 4], [1, 3], [1, 4], [2, 3], [2, 4], [3, 3], [3, 4], [2, 1],
          // Area C (5)
          [4, 0], [4, 1], [5, 0], [5, 1], [6, 0],
          // Area D (6)
          [4, 3], [4, 4], [5, 3], [5, 4], [6, 3], [6, 4],
        ],
        labels: [
          { r: 1, c: 1, text: 'A' },
          { r: 1, c: 3, text: 'B' },
          { r: 5, c: 1, text: 'C' },
          { r: 5, c: 3, text: 'D' },
        ],
        className,
      })

    // Q8 Shapes Equation (2020)
    case 'q08_shapes_equation':
      return renderShapeEquationSvg(
        [
          { left: 'square', right: 'triangle', resultNested: { outer: 'square', inner: 'triangle' } },
          { left: 'pentagon', right: 'circle', resultNested: { outer: 'pentagon', inner: 'circle' } },
          { left: 'triangle', right: 'circle', isQuestion: true },
        ],
        { className },
      )
    case 'q08_opt_A':
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <polygon points="35,6 65,64 5,64" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
          <rect x="22.5" y="33" width="25" height="25" rx="3" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5" />
        </svg>
      )
    case 'q08_opt_B':
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <circle cx="35" cy="35" r="31" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" />
          <polygon points="35,16 51,28 45,49 25,49 19,28" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      )
    case 'q08_opt_C':
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <polygon points="35,6 65,64 5,64" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="35" cy="44" r="16" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5" />
        </svg>
      )
    case 'q08_opt_D':
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <polygon points="35,6 65,28 53,64 17,64 5,28" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="35,25 50,54 20,54" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      )

    // Q9 Matchstick Options (2020)
    case 'q09_opt_A':
      return renderMatchstickFigureSvg('square_flag', 6, { className })
    case 'q09_opt_B':
      return renderMatchstickFigureSvg('house', 5, { className })
    case 'q09_opt_C':
      return renderMatchstickFigureSvg('diamond_legs', 6, { className })
    case 'q09_opt_D':
      return renderMatchstickFigureSvg('double_square', 7, { className })

    // Q14 Puzzle & Options (2020)
    case 'q14_puzzle':
      return renderGridCheckerboardPuzzleSvg({ variant: 'puzzle_cut', className })
    case 'q14_opt_A':
      return renderGridCheckerboardPuzzleSvg({ variant: 'opt_A', className })
    case 'q14_opt_B':
      return renderGridCheckerboardPuzzleSvg({ variant: 'opt_B', className })
    case 'q14_opt_C':
      return renderGridCheckerboardPuzzleSvg({ variant: 'opt_C', className })
    case 'q14_opt_D':
      return renderGridCheckerboardPuzzleSvg({ variant: 'opt_D', className })

    // Q15 Maze (2020)
    case 'q15_maze':
      return renderGridMazeSvg({ className })

    // Q20 Cake Partition Options (2020)
    case 'q20_opt_A':
      return renderCakePartitionSvg({ variant: 'cross', className })
    case 'q20_opt_B':
      return renderCakePartitionSvg({ variant: 'diagonals', className })
    case 'q20_opt_C':
      return renderCakePartitionSvg({ variant: 'unequal_triangle', className, isWrong: true })
    case 'q20_opt_D':
      return renderCakePartitionSvg({ variant: 'diagonal_offset', className })

    // Q23 Triangles (2020)
    case 'q23_triangles':
      return renderSierpinskiTriangleSvg({ depth: 1, className })

    // Q25 Polyline Options (2020)
    case 'q25_opt_A':
      return renderGridPolylineSvg({ cols: 6, rows: 2, points: [[0, 0], [2, 2], [4, 0], [5, 2], [6, 0]], className })
    case 'q25_opt_B':
      return renderGridPolylineSvg({ cols: 6, rows: 2, points: [[0, 0], [3, 2], [5, 0], [6, 1]], className })
    case 'q25_opt_C':
      return renderGridPolylineSvg({ cols: 6, rows: 2, points: [[0, 0], [1, 2], [2, 0], [3, 2], [5, 0], [6, 2]], className })
    case 'q25_opt_D':
      return renderGridPolylineSvg({ cols: 6, rows: 2, points: [[0, 0], [1, 2], [2, 0], [3, 2], [4, 0], [5, 2], [6, 0]], className })

    // ========================================================================
    // GRADE 1 - 2015 CONTEST DIAGRAMS
    // ========================================================================

    // 2015 Q02: 5 Polygon Options
    case 'g1_2015_q2_opt_A':
      return (
        <svg viewBox="0 0 100 100" className="size-16 sm:size-20 shrink-0 select-none">
          {/* Regular Hexagon (6 edges) */}
          <polygon points="50,12 85,32 85,68 50,88 15,68 15,32" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
        </svg>
      )
    case 'g1_2015_q2_opt_B':
      return (
        <svg viewBox="0 0 100 100" className="size-16 sm:size-20 shrink-0 select-none">
          {/* Concave Hexagon L-shape (6 edges) */}
          <polygon points="15,20 75,20 85,50 45,80 45,45 15,45" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
        </svg>
      )
    case 'g1_2015_q2_opt_C':
      return (
        <svg viewBox="0 0 100 100" className="size-16 sm:size-20 shrink-0 select-none">
          {/* Pentagon with chevron indent (5 edges - CORRECT ANSWER) */}
          <polygon points="30,18 80,18 50,50 85,82 30,82" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
        </svg>
      )
    case 'g1_2015_q2_opt_D':
      return (
        <svg viewBox="0 0 100 100" className="size-16 sm:size-20 shrink-0 select-none">
          {/* Convex Hexagon (6 edges) */}
          <polygon points="45,15 80,32 80,72 50,85 20,72 20,32" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
        </svg>
      )
    case 'g1_2015_q2_opt_E':
      return (
        <svg viewBox="0 0 100 100" className="size-16 sm:size-20 shrink-0 select-none">
          {/* Star-like Hexagon (6 edges) */}
          <polygon points="20,18 42,38 65,18 92,30 35,82 15,50" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
        </svg>
      )

    // 2015 Q03: Isometric Cubes Options
    case 'g1_2015_q3_opt_A':
    case 'g1_2016_q3_opt_A':
      return renderIsometricCubesSvg([
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 1, y: 1, z: 0 },
      ])
    case 'g1_2015_q3_opt_B':
    case 'g1_2016_q3_opt_B':
      return renderIsometricCubesSvg([
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 0, y: 0, z: 1 },
      ])
    case 'g1_2015_q3_opt_C':
    case 'g1_2016_q3_opt_C':
      return renderIsometricCubesSvg([
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 0, z: 1 },
        { x: 0, y: 0, z: 2 },
        { x: 1, y: 0, z: 0 },
      ])
    case 'g1_2015_q3_opt_D':
    case 'g1_2016_q3_opt_D':
      return renderIsometricCubesSvg([
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 0, z: 1 },
        { x: 0, y: 0, z: 2 },
        { x: 1, y: 0, z: 0 },
        { x: 1, y: 0, z: 1 },
        { x: 2, y: 0, z: 0 },
      ])
    case 'g1_2015_q3_opt_E':
    case 'g1_2016_q3_opt_E':
      return renderIsometricCubesSvg([
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 0, z: 1 },
        { x: 1, y: 0, z: 0 },
      ])

    // 2015 Q05 Money
    case 'g1_2015_q5_money':
      return renderMoneyBanknotesSvg({ className })

    // 2015 Q06 Shape Sequence
    case 'g1_2015_q6_sequence':
      return renderShapeSequenceSvg({ className })

    // 2015 Q07 Pattern Grid Boxes
    case 'g1_2015_q7_grid':
      return renderPatternBoxesSvg({ className })

    // 2015 Q08 / 2016 Q08 Stepped Cubes (17 cubes)
    case 'g1_2015_q8_cubes':
    case 'g1_2016_q8_cubes':
      return renderIsometricCubesSvg([
        // Layer 3 (top)
        { x: 0, y: 0, z: 3 },
        // Layer 2
        { x: 0, y: 0, z: 2 },
        { x: 1, y: 0, z: 2 },
        // Layer 1
        { x: 0, y: 0, z: 1 },
        { x: 1, y: 0, z: 1 },
        { x: 2, y: 0, z: 1 },
        { x: 0, y: 1, z: 1 },
        // Layer 0 (base)
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 2, y: 0, z: 0 },
        { x: 3, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 1, y: 1, z: 0 },
        { x: 2, y: 1, z: 0 },
        { x: 0, y: 2, z: 0 },
        { x: 1, y: 2, z: 0 },
        { x: 0, y: 3, z: 0 },
      ])

    // 2015 Q13 / 2016 Q13 Fraction Circle Options
    case 'g1_2015_q13_opt_A':
    case 'g1_2016_q13_opt_A':
      return renderFractionCircleSvg(8, 4, { className })
    case 'g1_2015_q13_opt_B':
    case 'g1_2016_q13_opt_B':
      return renderFractionCircleSvg(4, 2, { className })
    case 'g1_2015_q13_opt_C':
    case 'g1_2016_q13_opt_C':
      return renderFractionCircleSvg(3, 1, { className })
    case 'g1_2015_q13_opt_D':
    case 'g1_2016_q13_opt_D':
      return renderFractionCircleSvg(4, 1, { className })
    case 'g1_2015_q13_opt_E':
    case 'g1_2016_q13_opt_E':
      return renderFractionCircleSvg(10, 6, { className })

    // 2015 Q14 Balloon Bar Chart
    case 'g1_2015_q14_chart':
      return renderBalloonBarChartSvg({ className })

    // ========================================================================
    // GRADE 1 - 2016 CONTEST DIAGRAMS
    // ========================================================================

    // 2016 Q05 Dice Views
    case 'g1_2016_q5_dice':
      return renderDiceViewsSvg({ className })

    // 2016 Q06 Matrix & Options
    case 'g1_2016_q6_matrix':
      return renderShapeMatrix2016Svg({ className })
    case 'g1_2016_q6_opt_A':
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <rect x="15" y="15" width="40" height="40" rx="4" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
        </svg>
      )
    case 'g1_2016_q6_opt_B':
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <polygon points="35,12 60,58 10,58" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      )
    case 'g1_2016_q6_opt_C':
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <polygon points="35,12 60,58 10,58" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
          <line x1="35" y1="26" x2="35" y2="42" stroke="#1e293b" strokeWidth="2.5" />
          <line x1="35" y1="42" x2="22" y2="54" stroke="#1e293b" strokeWidth="2.5" />
          <line x1="35" y1="42" x2="48" y2="54" stroke="#1e293b" strokeWidth="2.5" />
        </svg>
      )
    case 'g1_2016_q6_opt_D':
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <circle cx="35" cy="35" r="24" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
          <line x1="35" y1="11" x2="35" y2="59" stroke="#1e293b" strokeWidth="2" />
          <line x1="11" y1="35" x2="59" y2="35" stroke="#1e293b" strokeWidth="2" />
        </svg>
      )
    case 'g1_2016_q6_opt_E':
      return (
        <svg viewBox="0 0 70 70" className="size-16 sm:size-20 shrink-0 select-none">
          <rect x="15" y="15" width="40" height="40" rx="4" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
          <line x1="15" y1="15" x2="55" y2="55" stroke="#1e293b" strokeWidth="2" />
          <line x1="55" y1="15" x2="15" y2="55" stroke="#1e293b" strokeWidth="2" />
        </svg>
      )

    // 2016 Q11 Rhombus
    case 'g1_2016_q11_rhombus':
      return (
        <div className="flex items-center justify-center p-3 rounded-2xl bg-white border border-slate-200 shadow-xs max-w-[200px] mx-auto w-full">
          <svg viewBox="0 0 160 90" className="w-full max-h-24 select-none">
            <polygon points="45,15 145,15 115,75 15,75" fill="#1e293b" />
          </svg>
        </div>
      )

    // 2016 Q12 Dot Grid 3x3
    case 'g1_2016_q12_dots':
      return renderDotGrid2016Svg({ className })

    // 2016 Q14 Rectangle Grid with ※
    case 'g1_2016_q14_rectangles':
      return renderRectangleGrid2016Svg({ className })

    // Fraction Shaded Area Options
    case 'fraction_6_10':
      return (
        <svg viewBox="0 0 80 40" className="w-20 h-10 select-none">
          {Array.from({ length: 10 }).map((_, i) => (
            <rect
              key={i}
              x={2 + (i % 5) * 15}
              y={2 + Math.floor(i / 5) * 17}
              width="14"
              height="15"
              fill={i < 6 ? '#3b82f6' : '#ffffff'}
              stroke="#1e293b"
              strokeWidth="1.2"
            />
          ))}
        </svg>
      )
    case 'fraction_2_4':
      return (
        <svg viewBox="0 0 60 60" className="size-12 select-none">
          {[
            { x: 2, y: 2, fill: '#3b82f6' },
            { x: 30, y: 2, fill: '#3b82f6' },
            { x: 2, y: 30, fill: '#ffffff' },
            { x: 30, y: 30, fill: '#ffffff' },
          ].map((c, i) => (
            <rect key={i} x={c.x} y={c.y} width="26" height="26" fill={c.fill} stroke="#1e293b" strokeWidth="1.2" />
          ))}
        </svg>
      )
    case 'fraction_1_3':
      return (
        <svg viewBox="0 0 75 30" className="w-18 h-8 select-none">
          {[
            { x: 2, fill: '#3b82f6' },
            { x: 26, fill: '#ffffff' },
            { x: 50, fill: '#ffffff' },
          ].map((c, i) => (
            <rect key={i} x={c.x} y="2" width="22" height="24" fill={c.fill} stroke="#1e293b" strokeWidth="1.2" />
          ))}
        </svg>
      )
    case 'fraction_4_8':
      return (
        <svg viewBox="0 0 80 44" className="w-20 h-11 select-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <rect
              key={i}
              x={2 + (i % 4) * 18}
              y={2 + Math.floor(i / 4) * 19}
              width="17"
              height="17"
              fill={i < 4 ? '#3b82f6' : '#ffffff'}
              stroke="#1e293b"
              strokeWidth="1.2"
            />
          ))}
        </svg>
      )

    default:
      return null
  }
}
