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

  // Handle generic clock keys, e.g. "clock_5_10", "clock_8_30", "q17_clock"
  if (diagramKey.startsWith('clock_') || diagramKey === 'q17_clock') {
    if (diagramKey === 'q17_clock' || diagramKey === 'clock_5_10') {
      return (
        <div className="flex items-center justify-center p-4 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-xs mx-auto w-full">
          {renderClockSvg(5, 10, { className })}
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

  // Match other keys
  switch (diagramKey) {
    // Q1 Balls
    case 'q01_balls':
      return renderScatteredCountingSvg({ type: 'balls', className })

    // Q2 Digits
    case 'q02_digits':
      return renderScatteredCountingSvg({ type: 'digits', className })

    // Q4 Balance Scales
    case 'q04_balance':
      return renderBalanceScaleSvg(
        [
          { left: { emoji: '🍌' }, right: { emoji: '🍓' }, tilt: 'left' },
          { left: { emoji: '🍎' }, right: { emoji: '🍌' }, tilt: 'right' },
          { left: { emoji: '🍇' }, right: { emoji: '🍌' }, tilt: 'left' },
        ],
        { className },
      )

    // Q5 Grey Grid
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

    // Q8 Shapes Equation
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

    // Q9 Matchstick Options
    case 'q09_opt_A':
      return renderMatchstickFigureSvg('square_flag', 6, { className })
    case 'q09_opt_B':
      return renderMatchstickFigureSvg('house', 5, { className })
    case 'q09_opt_C':
      return renderMatchstickFigureSvg('diamond_legs', 6, { className })
    case 'q09_opt_D':
      return renderMatchstickFigureSvg('double_square', 7, { className })

    // Q14 Puzzle & Options
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

    // Q15 Maze
    case 'q15_maze':
      return renderGridMazeSvg({ className })

    // Q20 Cake Partition Options
    case 'q20_opt_A':
      return renderCakePartitionSvg({ variant: 'cross', className })
    case 'q20_opt_B':
      return renderCakePartitionSvg({ variant: 'diagonals', className })
    case 'q20_opt_C':
      return renderCakePartitionSvg({ variant: 'unequal_triangle', className, isWrong: true })
    case 'q20_opt_D':
      return renderCakePartitionSvg({ variant: 'diagonal_offset', className })

    // Q23 Triangles
    case 'q23_triangles':
      return renderSierpinskiTriangleSvg({ depth: 1, className })

    // Q25 Polyline Options
    case 'q25_opt_A':
      return renderGridPolylineSvg({ cols: 6, rows: 2, points: [[0, 0], [2, 2], [4, 0], [5, 2], [6, 0]], className })
    case 'q25_opt_B':
      return renderGridPolylineSvg({ cols: 6, rows: 2, points: [[0, 0], [3, 2], [5, 0], [6, 1]], className })
    case 'q25_opt_C':
      return renderGridPolylineSvg({ cols: 6, rows: 2, points: [[0, 0], [1, 2], [2, 0], [3, 2], [5, 0], [6, 2]], className })
    case 'q25_opt_D':
      return renderGridPolylineSvg({ cols: 6, rows: 2, points: [[0, 0], [1, 2], [2, 0], [3, 2], [4, 0], [5, 2], [6, 0]], className })

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
