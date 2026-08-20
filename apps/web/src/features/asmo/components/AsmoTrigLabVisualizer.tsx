import { useState, useEffect, useRef } from 'react'
import {
  Compass,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Calculator,
  Award,
} from 'lucide-react'
import { AsmoFormula } from './AsmoFormula'
import { cn } from '@/shared/lib/cn'

export type LabTabMode = 'circle' | 'wave' | 'formula'

export type SpecialAngle = {
  deg: number
  radKatex: string
  sinExact: string
  cosExact: string
  tanExact: string
  cotExact: string
  isProblemAngle?: boolean
}

export const SPECIAL_ANGLES: SpecialAngle[] = [
  { deg: 0, radKatex: '0', sinExact: '0', cosExact: '1', tanExact: '0', cotExact: '\\text{KXD}' },
  { deg: 30, radKatex: '\\frac{\\pi}{6}', sinExact: '\\frac{1}{2}', cosExact: '\\frac{\\sqrt{3}}{2}', tanExact: '\\frac{\\sqrt{3}}{3}', cotExact: '\\sqrt{3}' },
  { deg: 45, radKatex: '\\frac{\\pi}{4}', sinExact: '\\frac{\\sqrt{2}}{2}', cosExact: '\\frac{\\sqrt{2}}{2}', tanExact: '1', cotExact: '1' },
  { deg: 60, radKatex: '\\frac{\\pi}{3}', sinExact: '\\frac{\\sqrt{3}}{2}', cosExact: '\\frac{1}{2}', tanExact: '\\sqrt{3}', cotExact: '\\frac{\\sqrt{3}}{3}' },
  { deg: 90, radKatex: '\\frac{\\pi}{2}', sinExact: '1', cosExact: '0', tanExact: '\\text{KXD}', cotExact: '0' },
  { deg: 120, radKatex: '\\frac{2\\pi}{3}', sinExact: '\\frac{\\sqrt{3}}{2}', cosExact: '-\\frac{1}{2}', tanExact: '-\\sqrt{3}', cotExact: '-\\frac{\\sqrt{3}}{3}', isProblemAngle: true },
  { deg: 135, radKatex: '\\frac{3\\pi}{4}', sinExact: '\\frac{\\sqrt{2}}{2}', cosExact: '-\\frac{\\sqrt{2}}{2}', tanExact: '-1', cotExact: '-1', isProblemAngle: true },
  { deg: 150, radKatex: '\\frac{5\\pi}{6}', sinExact: '\\frac{1}{2}', cosExact: '-\\frac{\\sqrt{3}}{2}', tanExact: '-\\frac{\\sqrt{3}}{3}', cotExact: '-\\sqrt{3}', isProblemAngle: true },
  { deg: 180, radKatex: '\\pi', sinExact: '0', cosExact: '-1', tanExact: '0', cotExact: '\\text{KXD}' },
  { deg: 270, radKatex: '\\frac{3\\pi}{2}', sinExact: '-1', cosExact: '0', tanExact: '\\text{KXD}', cotExact: '0' },
  { deg: 360, radKatex: '2\\pi', sinExact: '0', cosExact: '1', tanExact: '0', cotExact: '\\text{KXD}' },
]

export type AsmoTrigLabProps = {
  className?: string
  level?: 1 | 2 | 3
  initialAngle?: number
  externalAngle?: number
  externalTab?: LabTabMode
  highlightTarget?: 'sin' | 'cos' | 'tan' | 'cot' | 'pythagoras' | 'double' | null
  onAngleChange?: (deg: number) => void
  demoSinValue?: number
}

export function AsmoTrigLabVisualizer({
  className,
  level = 1,
  initialAngle = 150,
  externalAngle,
  externalTab,
  highlightTarget,
  onAngleChange,
  demoSinValue,
}: AsmoTrigLabProps) {
  // Infer active level from props if level is not explicitly set but externalTab is passed
  const activeLevel: 1 | 2 | 3 = level || (externalTab === 'formula' ? 2 : 1)

  const [angleDeg, setAngleDeg] = useState(
    externalAngle !== undefined
      ? externalAngle
      : activeLevel === 1
      ? (initialAngle || 150)
      : activeLevel === 2
      ? 19.47
      : 7.5,
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [showAxesDetails, setShowAxesDetails] = useState(true)
  const [showTanCot, setShowTanCot] = useState(true)
  const [demoSinVal, setDemoSinVal] = useState(demoSinValue !== undefined ? demoSinValue : 1 / 3)
  const animFrameRef = useRef<number | null>(null)

  // Sync externalAngle when prop changes
  useEffect(() => {
    if (externalAngle !== undefined) {
      setAngleDeg(externalAngle)
      setIsPlaying(false)
    }
  }, [externalAngle])

  // Sync demoSinValue when prop changes
  useEffect(() => {
    if (demoSinValue !== undefined) {
      setDemoSinVal(demoSinValue)
    }
  }, [demoSinValue])

  const handleAngleUpdate = (newDeg: number) => {
    setAngleDeg(newDeg)
    onAngleChange?.(newDeg)
  }

  // Trigonometric calculated values for Level 1 & general circle
  const rad = (angleDeg * Math.PI) / 180
  const cosVal = Math.cos(rad)
  const sinVal = Math.sin(rad)
  const tanVal = Math.abs(cosVal) > 0.0001 ? Math.tan(rad) : null
  const cotVal = Math.abs(sinVal) > 0.0001 ? 1 / Math.tan(rad) : null

  // Quadrant determination
  const normalizedDeg = ((angleDeg % 360) + 360) % 360
  const quadrant =
    normalizedDeg > 0 && normalizedDeg < 90
      ? 'I'
      : normalizedDeg > 90 && normalizedDeg < 180
      ? 'II'
      : normalizedDeg > 180 && normalizedDeg < 270
      ? 'III'
      : normalizedDeg > 270 && normalizedDeg < 360
      ? 'IV'
      : 'Trục'

  // Special angle exact match
  const matchedSpecial = SPECIAL_ANGLES.find((a) => a.deg === Math.round(normalizedDeg))

  // Auto rotation animation
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      return
    }

    const speed = 0.5
    const loop = () => {
      setAngleDeg((prev) => (prev + speed) % 360)
      animFrameRef.current = requestAnimationFrame(loop)
    }
    animFrameRef.current = requestAnimationFrame(loop)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isPlaying])

  // Geometry for Unit Circle SVG: Center at (190, 170), Radius R = 120, viewBox 0 0 380 340
  const CX = 190
  const CY = 170
  const R = 120

  const px = CX + R * cosVal
  const py = CY - R * sinVal

  // Tangent line at x = 1 (X = CX + R = 310)
  const tanX = CX + R
  const clampedTan = tanVal !== null ? Math.max(-2.5, Math.min(2.5, tanVal)) : 0
  const tanY = CY - R * clampedTan

  // Cotangent line at y = 1 (Y = CY - R = 50)
  const cotY = CY - R
  const clampedCot = cotVal !== null ? Math.max(-2.5, Math.min(2.5, cotVal)) : 0
  const cotX = CX + R * clampedCot

  // Demo Grade 11 calculation for Level 2: cos(2x) = 1 - 2*sin^2(x)
  const computedCos2x = 1 - 2 * demoSinVal * demoSinVal
  const angleRadL2 = Math.asin(Math.max(-1, Math.min(1, demoSinVal)))
  const angleDegL2 = (angleRadL2 * 180) / Math.PI

  return (
    <div
      className={cn(
        'relative w-full rounded-3xl overflow-hidden bg-white border-2 border-brand-200 shadow-clay p-4 sm:p-6 text-slate-800 flex flex-col gap-5',
        className,
      )}
    >
      {/* ══════════════════════════════════════════════════════════════════════
          LEVEL 1: ĐƯỜNG TRÒN LƯỢNG GIÁC SOI GÓC ĐẶC BIỆT & DẤU 4 GÓC PHẦN TƯ
          (Giải bài toán: P = sin(150°) + cos(120°) - tan(135°) và dấu cos(150°))
         ══════════════════════════════════════════════════════════════════════ */}
      {activeLevel === 1 && (
        <>
          {/* Top Header: Title & Badges */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-3.5 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 border-2 border-brand-300 shadow-xs shrink-0">
                <Compass className="size-6 text-brand-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
                    Phòng Thí Nghiệm Lượng Giác ASMO
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 border border-emerald-300 shrink-0">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Interactive Lab
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-extrabold text-indigo-800 border border-indigo-300 shrink-0">
                    🎯 Đường Tròn Đơn Vị
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Đường tròn đơn vị (R = 1) · Soi góc đặc biệt &amp; xét dấu 4 góc phần tư giải biểu thức P
                </p>
              </div>
            </div>
          </div>

          {/* Quick Special Angles Ribbon with KaTeX & Starred Problem Angles */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none border-b border-slate-100">
            <span className="text-xs font-extrabold text-slate-700 shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="size-3.5 text-amber-500" />
              <span>Góc đặc biệt:</span>
            </span>
            {SPECIAL_ANGLES.map((spec) => {
              const isSelected = Math.round(normalizedDeg) === spec.deg
              return (
                <button
                  key={spec.deg}
                  type="button"
                  onClick={() => {
                    handleAngleUpdate(spec.deg)
                    setIsPlaying(false)
                  }}
                  className={cn(
                    'shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer border select-none',
                    isSelected
                      ? 'bg-brand-500 text-white border-brand-600 shadow-xs ring-2 ring-brand-200'
                      : spec.isProblemAngle
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200',
                  )}
                >
                  {spec.isProblemAngle && <span className="text-[10px]">⭐</span>}
                  <span>{spec.deg}°</span>
                  <span className={cn('text-[11px]', isSelected ? 'text-brand-100' : 'text-slate-500')}>
                    (<AsmoFormula text={`$${spec.radKatex}$`} className="inline-block" />)
                  </span>
                </button>
              )
            })}
          </div>

          {/* ── 1-COLUMN FULL-WIDTH SVG DIAGRAM & CONTROLS ── */}
          <div className="w-full rounded-3xl bg-slate-50/80 p-4 sm:p-5 border-2 border-slate-200 shadow-xs flex flex-col gap-3.5">
            {/* Top Toolbar inside Canvas */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                  🎯 Đường Tròn Đơn Vị (R = 1)
                </span>
                <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-black text-brand-800 border border-brand-300">
                  Góc Phần Tư {quadrant}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAxesDetails((prev) => !prev)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer select-none',
                    showAxesDetails
                      ? 'bg-brand-50 text-brand-700 border-brand-300'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50',
                  )}
                >
                  Chiếu sin/cos
                </button>
                <button
                  type="button"
                  onClick={() => setShowTanCot((prev) => !prev)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer select-none',
                    showTanCot
                      ? 'bg-purple-50 text-purple-700 border-purple-300'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50',
                  )}
                >
                  Trục tan/cot
                </button>
              </div>
            </div>

            {/* Big Unit Circle SVG (Full Column width, max-w-[480px] centered) */}
            <div className="w-full flex items-center justify-center py-2 bg-white rounded-2xl border border-slate-200/80 shadow-inner">
              <svg viewBox="0 0 380 340" className="w-full max-w-[480px] aspect-[380/340] select-none font-sans">
                <defs>
                  <filter id="glow-circle-cyan-l1" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="triangleGradL1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#e11d48" stopOpacity="0.15" />
                  </linearGradient>
                </defs>

                {/* 4 Quadrants Background Soft Tint (R = 120, CX = 190, CY = 170) */}
                <rect x={CX} y={CY - R} width={R} height={R} fill="#e0f2fe" fillOpacity="0.4" />
                <rect x={CX - R} y={CY - R} width={R} height={R} fill="#f3e8ff" fillOpacity="0.4" />
                <rect x={CX - R} y={CY} width={R} height={R} fill="#ffe4e6" fillOpacity="0.4" />
                <rect x={CX} y={CY} width={R} height={R} fill="#ecfdf5" fillOpacity="0.4" />

                {/* Quadrant Text Labels */}
                <text x={CX + R / 2} y={CY - R / 2} fill="#0284c7" fontSize="11" fontWeight="bold" opacity="0.7" textAnchor="middle">Góc I (+,+)</text>
                <text x={CX - R / 2} y={CY - R / 2} fill="#7c3aed" fontSize="11" fontWeight="bold" opacity="0.7" textAnchor="middle">Góc II (-,+)</text>
                <text x={CX - R / 2} y={CY + R / 2} fill="#e11d48" fontSize="11" fontWeight="bold" opacity="0.7" textAnchor="middle">Góc III (-,-)</text>
                <text x={CX + R / 2} y={CY + R / 2} fill="#059669" fontSize="11" fontWeight="bold" opacity="0.7" textAnchor="middle">Góc IV (+,-)</text>

                {/* Unit Circle (R = 120) */}
                <circle cx={CX} cy={CY} r={R} fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
                <circle cx={CX} cy={CY} r={R} fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="4 4" opacity="0.7" />

                {/* Tangent Axis (Vertical at x = 1 -> X = CX + R = 310) */}
                {showTanCot && (
                  <g opacity="0.85">
                    <line x1={tanX} y1={15} x2={tanX} y2={325} stroke="#9333ea" strokeWidth="2" strokeDasharray="3 3" />
                    <text x={tanX + 5} y={28} fill="#7e22ce" fontSize="11" fontWeight="bold">Trục tan</text>
                  </g>
                )}

                {/* Cotangent Axis (Horizontal at y = 1 -> Y = CY - R = 50) */}
                {showTanCot && (
                  <g opacity="0.85">
                    <line x1={15} y1={cotY} x2={365} y2={cotY} stroke="#d97706" strokeWidth="2" strokeDasharray="3 3" />
                    <text x={340} y={cotY - 6} fill="#b45309" fontSize="11" fontWeight="bold">Trục cot</text>
                  </g>
                )}

                {/* Cosine Axis (X-axis, Sky Blue, 3px bold) */}
                <line x1={15} y1={CY} x2={365} y2={CY} stroke="#0284c7" strokeWidth="3" />
                <polygon points="365,166 375,170 365,174" fill="#0284c7" />
                <text x={340} y={158} fill="#0369a1" fontSize="12" fontWeight="bold">cos (x)</text>

                {/* Sine Axis (Y-axis, Coral Red, 3px bold) */}
                <line x1={CX} y1={325} x2={CX} y2={15} stroke="#e11d48" strokeWidth="3" />
                <polygon points="186,15 190,5 194,15" fill="#e11d48" />
                <text x={200} y={20} fill="#be123c" fontSize="12" fontWeight="bold">sin (y)</text>

                {/* Ticks on axes */}
                <text x={CX + R} y={CY + 16} fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">+1</text>
                <text x={CX - R} y={CY + 16} fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">-1</text>
                <text x={CX - 8} y={CY - R + 4} fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="end">+1</text>
                <text x={CX - 8} y={CY + R + 4} fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="end">-1</text>

                {/* Angle Arc from 0 to theta */}
                {angleDeg > 0 && (
                  <path
                    d={`M ${CX + 32},${CY} A 32,32 0 ${angleDeg > 180 ? 1 : 0},0 ${CX + 32 * Math.cos(rad)},${CY - 32 * Math.sin(rad)}`}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="3"
                  />
                )}
                <text
                  x={CX + 44 * Math.cos(rad / 2)}
                  y={CY - 44 * Math.sin(rad / 2) + 4}
                  fill="#b45309"
                  fontSize="11"
                  fontWeight="extrabold"
                  textAnchor="middle"
                >
                  {Math.round(normalizedDeg)}°
                </text>

                {/* Shaded Projection Right Triangle */}
                {showAxesDetails && (
                  <polygon
                    points={`${CX},${CY} ${px},${CY} ${px},${py}`}
                    fill="url(#triangleGradL1)"
                    stroke="#6366f1"
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                  />
                )}

                {/* Tangent Projection Line to tan axis */}
                {showTanCot && tanVal !== null && Math.abs(tanVal) <= 2.5 && (
                  <g>
                    <line x1={CX} y1={CY} x2={tanX} y2={tanY} stroke="#9333ea" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
                    <circle cx={tanX} cy={tanY} r="5" fill="#7e22ce" />
                    <text x={tanX + 7} y={tanY + 4} fill="#6b21a8" fontSize="10" fontWeight="bold">
                      T(1, {tanVal.toFixed(2)})
                    </text>
                  </g>
                )}

                {/* Cotangent Projection Line to cot axis */}
                {showTanCot && cotVal !== null && Math.abs(cotVal) <= 2.5 && (
                  <g>
                    <line x1={CX} y1={CY} x2={cotX} y2={cotY} stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
                    <circle cx={cotX} cy={cotY} r="5" fill="#b45309" />
                    <text x={cotX} y={cotY - 7} fill="#92400e" fontSize="10" fontWeight="bold" textAnchor="middle">
                      C({cotVal.toFixed(2)}, 1)
                    </text>
                  </g>
                )}

                {/* Projection Lines to Cosine and Sine axes */}
                {showAxesDetails && (
                  <>
                    {/* Vertical line from M to cos-axis */}
                    <line x1={px} y1={py} x2={px} y2={CY} stroke="#e11d48" strokeWidth="2.5" strokeDasharray="3 2" />
                    {/* Horizontal line from M to sin-axis */}
                    <line x1={px} y1={py} x2={CX} y2={py} stroke="#0284c7" strokeWidth="2.5" strokeDasharray="3 2" />

                    {/* Adjacent side (cos) along x-axis (Bold 5px) */}
                    <line x1={CX} y1={CY} x2={px} y2={CY} stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
                    {/* Opposite side (sin) vertical (Bold 5px) */}
                    <line x1={px} y1={CY} x2={px} y2={py} stroke="#e11d48" strokeWidth="5" strokeLinecap="round" />

                    {/* Right angle marker at (px, CY) */}
                    <rect
                      x={cosVal >= 0 ? px - 8 : px}
                      y={sinVal >= 0 ? CY - 8 : CY}
                      width="8"
                      height="8"
                      fill="none"
                      stroke="#64748b"
                      strokeWidth="1.2"
                    />
                  </>
                )}

                {/* Hypotenuse Vector OM (Radius R = 1, Bold 4px) */}
                <line x1={CX} y1={CY} x2={px} y2={py} stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />

                {/* Origin Point O(0,0) */}
                <circle cx={CX} cy={CY} r="4.5" fill="#1e293b" />
                <text x={CX - 14} y={CY + 16} fill="#475569" fontSize="11" fontWeight="extrabold">O</text>

                {/* Moving Point M(cos α, sin α) */}
                <circle cx={px} cy={py} r="8.5" fill="#0284c7" filter="url(#glow-circle-cyan-l1)" />
                <circle cx={px} cy={py} r="4.5" fill="#ffffff" />
                <text
                  x={px + (cosVal >= 0 ? 12 : -12)}
                  y={py + (sinVal >= 0 ? -12 : 18)}
                  fill="#0f172a"
                  fontSize="12"
                  fontWeight="900"
                  textAnchor={cosVal >= 0 ? 'start' : 'end'}
                  className="drop-shadow-xs"
                >
                  M({cosVal.toFixed(2)}, {sinVal.toFixed(2)})
                </text>
              </svg>
            </div>

            {/* Slider & Control Toolbar */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlaying((prev) => !prev)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs select-none',
                      isPlaying
                        ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                        : 'bg-brand-500 hover:bg-brand-600 text-white',
                    )}
                  >
                    {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                    <span>{isPlaying ? 'Tạm Dừng' : 'Quay Tự Động'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleAngleUpdate(0)
                      setIsPlaying(false)
                    }}
                    className="p-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 transition-all cursor-pointer shadow-xs"
                    title="Đặt lại về 0°"
                  >
                    <RotateCcw className="size-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs text-slate-500 font-bold">Góc quay:</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-900 text-xs font-black border border-amber-300">
                    α = {Math.round(normalizedDeg)}°
                  </span>
                  <span className="text-xs text-brand-700 font-bold">
                    ({(rad / Math.PI).toFixed(2)}π rad)
                  </span>
                </div>
              </div>

              {/* Range Slider */}
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={Math.round(normalizedDeg)}
                onChange={(e) => {
                  handleAngleUpdate(parseInt(e.target.value, 10))
                  setIsPlaying(false)
                }}
                className="w-full accent-brand-500 cursor-pointer h-2.5 bg-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* ── VALUE CARDS PLACED UNDERNEATH (SPACIOUS 2-COLUMN GRID) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* 🔴 CARD 1: SINE (ĐỘ CAO ĐỨNG) */}
            <div
              className={cn(
                'rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/70 border-2 border-rose-300 p-4 sm:p-5 shadow-sm transition-all duration-300',
                highlightTarget === 'sin'
                  ? 'ring-4 ring-rose-400 border-rose-500 shadow-md scale-[1.01] bg-rose-100/90'
                  : 'hover:border-rose-400',
              )}
            >
              <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-rose-800">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <AsmoFormula text="🔴 Trục đứng $\sin(\alpha)$ (Chiều cao):" />
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-rose-200/80 font-mono text-xs font-black">
                  Dấu: {sinVal >= 0 ? '+' : '−'}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
                <div className="text-xl sm:text-2xl font-black text-rose-700 font-mono tracking-tight">
                  <AsmoFormula
                    text={`$\\sin(${Math.round(normalizedDeg)}^\\circ) = ${matchedSpecial ? matchedSpecial.sinExact : sinVal.toFixed(4)}$`}
                  />
                </div>
                <div className="text-xs sm:text-sm font-black text-rose-600 font-mono bg-white/80 px-2 py-0.5 rounded-lg border border-rose-200 shadow-2xs">
                  ≈ {sinVal.toFixed(3)}
                </div>
              </div>
              <div className="text-[11px] sm:text-xs text-rose-600/90 mt-1.5 font-medium flex items-center justify-between">
                <AsmoFormula text="Độ cao đứng của điểm $M$ so với trục hoành" />
                {normalizedDeg === 150 && (
                  <span className="text-[11px] font-bold text-rose-700 font-mono bg-rose-200/60 px-1.5 py-0.2 rounded">
                    Góc II: sin(150°) = 1/2
                  </span>
                )}
              </div>
            </div>

            {/* 🔵 CARD 2: COSINE (ĐỘ RỘNG NGANG) */}
            <div
              className={cn(
                'rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100/70 border-2 border-sky-300 p-4 sm:p-5 shadow-sm transition-all duration-300',
                highlightTarget === 'cos'
                  ? 'ring-4 ring-sky-400 border-sky-500 shadow-md scale-[1.01] bg-sky-100/90'
                  : 'hover:border-sky-400',
              )}
            >
              <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-sky-800">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-sky-500 animate-pulse" />
                  <AsmoFormula text="🔵 Trục ngang $\cos(\alpha)$ (Độ rộng):" />
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-sky-200/80 font-mono text-xs font-black">
                  Dấu: {cosVal >= 0 ? '+' : '−'}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
                <div className="text-xl sm:text-2xl font-black text-sky-700 font-mono tracking-tight">
                  <AsmoFormula
                    text={`$\\cos(${Math.round(normalizedDeg)}^\\circ) = ${matchedSpecial ? matchedSpecial.cosExact : cosVal.toFixed(4)}$`}
                  />
                </div>
                <div className="text-xs sm:text-sm font-black text-sky-600 font-mono bg-white/80 px-2 py-0.5 rounded-lg border border-sky-200 shadow-2xs">
                  ≈ {cosVal.toFixed(3)}
                </div>
              </div>
              <div className="text-[11px] sm:text-xs text-sky-600/90 mt-1.5 font-medium flex items-center justify-between">
                <AsmoFormula text="Độ rộng ngang từ gốc $O$ đến hình chiếu của $M$" />
                {(normalizedDeg === 120 || normalizedDeg === 150) && (
                  <span className="text-[11px] font-bold text-sky-700 font-mono bg-sky-200/60 px-1.5 py-0.2 rounded">
                    Góc II ➔ cos &lt; 0
                  </span>
                )}
              </div>
            </div>

            {/* 🟣 CARD 3: TANGENT & COTANGENT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div
                className={cn(
                  'rounded-2xl bg-purple-50/90 border-2 border-purple-300 p-3.5 shadow-xs flex flex-col justify-between transition-all duration-300',
                  highlightTarget === 'tan'
                    ? 'ring-4 ring-purple-400 border-purple-500 shadow-md scale-[1.01] bg-purple-100/90'
                    : 'hover:border-purple-400',
                )}
              >
                <div className="flex items-center justify-between text-xs font-extrabold text-purple-800">
                  <AsmoFormula text="$\tan(\alpha) = \frac{\sin}{\cos}$:" />
                  <span className="px-1.5 py-0.2 rounded bg-purple-200/70 font-mono text-[10px]">
                    {tanVal !== null && tanVal < 0 ? 'Âm (−)' : tanVal !== null && tanVal > 0 ? 'Dương (+)' : ''}
                  </span>
                </div>
                <div className="my-1.5 font-mono font-black text-purple-900 text-base sm:text-lg">
                  {tanVal !== null ? (
                    <AsmoFormula
                      text={`$\\tan(${Math.round(normalizedDeg)}^\\circ) = ${matchedSpecial ? matchedSpecial.tanExact : tanVal.toFixed(3)}$`}
                    />
                  ) : (
                    <span className="text-sm text-rose-600 font-bold">Không XĐ</span>
                  )}
                </div>
                <div className="text-[11px] text-purple-700 font-mono flex items-center justify-between">
                  <span>{tanVal !== null ? `≈ ${tanVal.toFixed(3)}` : 'Góc 90°, 270°'}</span>
                  {normalizedDeg === 135 && <span className="font-extrabold text-purple-900">= -1</span>}
                </div>
              </div>

              <div
                className={cn(
                  'rounded-2xl bg-amber-50/90 border-2 border-amber-300 p-3.5 shadow-xs flex flex-col justify-between transition-all duration-300',
                  highlightTarget === 'cot'
                    ? 'ring-4 ring-amber-400 border-amber-500 shadow-md scale-[1.01] bg-amber-100/90'
                    : 'hover:border-amber-400',
                )}
              >
                <div className="flex items-center justify-between text-xs font-extrabold text-amber-800">
                  <AsmoFormula text="$\cot(\alpha) = \frac{\cos}{\sin}$:" />
                  <span className="px-1.5 py-0.2 rounded bg-amber-200/70 font-mono text-[10px]">
                    {cotVal !== null && cotVal < 0 ? 'Âm (−)' : cotVal !== null && cotVal > 0 ? 'Dương (+)' : ''}
                  </span>
                </div>
                <div className="my-1.5 font-mono font-black text-amber-900 text-base sm:text-lg">
                  {cotVal !== null ? (
                    <AsmoFormula
                      text={`$\\cot(${Math.round(normalizedDeg)}^\\circ) = ${matchedSpecial ? matchedSpecial.cotExact : cotVal.toFixed(3)}$`}
                    />
                  ) : (
                    <span className="text-sm text-rose-600 font-bold">Không XĐ</span>
                  )}
                </div>
                <div className="text-[11px] text-amber-700 font-mono flex items-center justify-between">
                  <span>{cotVal !== null ? `≈ ${cotVal.toFixed(3)}` : 'Góc 0°, 180°'}</span>
                  {normalizedDeg === 135 && <span className="font-extrabold text-amber-900">= -1</span>}
                </div>
              </div>
            </div>

            {/* 💡 CARD 4: MEE CAT SECRET TIP */}
            <div className="rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-200 p-4 shadow-sm flex items-start gap-3">
              <div className="text-2xl shrink-0">🐱</div>
              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                <span className="font-extrabold text-amber-950 block mb-1">
                  Bí kíp Mèo Mee ghi nhớ nhanh:
                </span>
                <div className="space-y-1 text-slate-700">
                  <div>
                    <strong>"Sin đứng, Cos nằm"</strong> (Sin đo trên trục đứng, Cos đo trên trục nằm ngang)
                  </div>
                  <div>
                    <strong>Nhất cả (+,+), Nhì sin (-,+), Tam tan (-,-), Tứ cos (+,-)</strong>
                  </div>
                  <div className="text-amber-900 font-bold text-[11px] pt-0.5">
                    <AsmoFormula text="👉 Góc $150^\circ \in \text{Góc II} \implies \cos(150^\circ) < 0$ và $\sin(150^\circ) > 0$." />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 🟢 ROW 3: PYTHAGORAS IDENTITY VERIFICATION */}
          <div
            className={cn(
              'flex flex-col gap-1.5 rounded-2xl bg-emerald-50/90 p-4 border-2 border-emerald-300 text-xs shadow-xs transition-all duration-300',
              highlightTarget === 'pythagoras'
                ? 'ring-4 ring-emerald-400 border-emerald-500 shadow-md scale-[1.01] bg-emerald-100/90'
                : 'hover:border-emerald-400',
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
                <span className="font-extrabold text-emerald-950 text-xs sm:text-sm">
                  Hằng đẳng thức Pythagoras:
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                Luôn đúng ∀α
              </span>
            </div>
            <div className="font-mono font-black text-emerald-900 text-sm sm:text-base flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-emerald-200">
              <AsmoFormula text="$\sin^2\alpha + \cos^2\alpha \equiv 1$" />
              <span className="text-xs text-emerald-800 font-bold">
                ({sinVal.toFixed(3)})² + ({cosVal.toFixed(3)})² = 1.000
              </span>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          LEVEL 2: CÔNG THỨC NHÂN ĐÔI & THƯỚC KÉO THỰC NGHIỆM
          (Giải bài toán: Cho sin(x) = 1/3, Tính cos(2x) = 7/9)
         ══════════════════════════════════════════════════════════════════════ */}
      {activeLevel === 2 && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-3.5 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 border-2 border-indigo-300 shadow-xs shrink-0">
                <Calculator className="size-6 text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
                    Phòng Thí Nghiệm Lượng Giác ASMO
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-800 border border-amber-300 shrink-0">
                    📐 Công Thức Lớp 11
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 border border-emerald-300 shrink-0">
                    Live Interactive Lab
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  <AsmoFormula text="Mô hình trực quan hóa công thức nhân đôi $\cos(2x) = 1 - 2\sin^2(x)$ &amp; Thước kéo thực nghiệm" />
                </div>
              </div>
            </div>
          </div>

          {/* ── 1-COLUMN FULL-WIDTH DOUBLE ANGLE VISUALIZER ── */}
          <div className="w-full rounded-3xl bg-slate-50/80 p-4 sm:p-5 border-2 border-slate-200 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                🔬 Mô Hình Góc Đôi: Góc $x$ vs Góc $2x$
              </span>
              <div className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-900 border border-indigo-200">
                <AsmoFormula text={`$\\sin(x) = ${demoSinVal.toFixed(3)}$ ➔ $\\cos(2x) = ${computedCos2x.toFixed(3)}$`} />
              </div>
            </div>

            {/* Double Angle Interactive SVG */}
            <div className="w-full flex items-center justify-center py-2 bg-white rounded-2xl border border-slate-200/80 shadow-inner">
              <svg viewBox="0 0 380 230" className="w-full max-w-[480px] aspect-[380/230] select-none font-sans">
                {/* Center at (190, 150), R = 100 */}
                {(() => {
                  const cx2 = 190
                  const cy2 = 150
                  const r2 = 100
                  const x1 = cx2 + r2 * Math.cos(angleRadL2)
                  const y1 = cy2 - r2 * Math.sin(angleRadL2)
                  const rad2x = 2 * angleRadL2
                  const x2 = cx2 + r2 * Math.cos(rad2x)
                  const y2 = cy2 - r2 * Math.sin(rad2x)

                  return (
                    <g>
                      {/* Semicircle */}
                      <path d={`M ${cx2 - r2},${cy2} A ${r2},${r2} 0 0,1 ${cx2 + r2},${cy2}`} fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />

                      {/* X & Y axes */}
                      <line x1={cx2 - 130} y1={cy2} x2={cx2 + 130} y2={cy2} stroke="#0284c7" strokeWidth="2.5" />
                      <line x1={cx2} y1={cy2} x2={cx2} y2={cy2 - 125} stroke="#e11d48" strokeWidth="2.5" />

                      {/* Vector x (Indigo) */}
                      <line x1={cx2} y1={cy2} x2={x1} y2={y1} stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round" />
                      <circle cx={x1} cy={y1} r="5" fill="#6366f1" />
                      <text x={x1 + 8} y={y1 - 4} fill="#4338ca" fontSize="11" fontWeight="bold">
                        M₁(x ≈ {angleDegL2.toFixed(1)}°)
                      </text>

                      {/* Vector 2x (Emerald) */}
                      <line x1={cx2} y1={cy2} x2={x2} y2={y2} stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
                      <circle cx={x2} cy={y2} r="5" fill="#059669" />
                      <text x={x2 + 8} y={y2 - 6} fill="#065f46" fontSize="11" fontWeight="bold">
                        M₂(2x ≈ {(angleDegL2 * 2).toFixed(1)}°)
                      </text>

                      {/* Projections */}
                      <line x1={x1} y1={y1} x2={cx2} y2={y1} stroke="#e11d48" strokeWidth="2" strokeDasharray="3 2" />
                      <text x={cx2 - 10} y={y1 + 4} fill="#be123c" fontSize="10" fontWeight="bold" textAnchor="end">
                        sin(x) = {demoSinVal.toFixed(2)}
                      </text>

                      <line x1={x2} y1={y2} x2={x2} y2={cy2} stroke="#0284c7" strokeWidth="2" strokeDasharray="3 2" />
                      <text x={x2} y={cy2 + 16} fill="#0369a1" fontSize="10" fontWeight="bold" textAnchor="middle">
                        cos(2x) = {computedCos2x.toFixed(2)}
                      </text>

                      {/* Origin */}
                      <circle cx={cx2} cy={cy2} r="4" fill="#1e293b" />
                      <text x={cx2 - 12} y={cy2 + 14} fill="#475569" fontSize="10" fontWeight="bold">O</text>
                    </g>
                  )
                })()}
              </svg>
            </div>

            {/* Preset Problem Value Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setDemoSinVal(1 / 3)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-black shrink-0 border transition-all cursor-pointer select-none',
                  Math.abs(demoSinVal - 1 / 3) < 0.01
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm ring-2 ring-indigo-300'
                    : 'bg-white hover:bg-indigo-50 text-indigo-900 border-indigo-200',
                )}
              >
                ⭐ sin(x) = 1/3 (Bài toán) ➔ cos(2x) = 7/9
              </button>

              <button
                type="button"
                onClick={() => setDemoSinVal(0.5)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-black shrink-0 border transition-all cursor-pointer select-none',
                  Math.abs(demoSinVal - 0.5) < 0.01
                    ? 'bg-brand-500 text-white border-brand-600 shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200',
                )}
              >
                sin(x) = 1/2 (30°) ➔ cos(2x) = 1/2
              </button>

              <button
                type="button"
                onClick={() => setDemoSinVal(Math.SQRT1_2)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-black shrink-0 border transition-all cursor-pointer select-none',
                  Math.abs(demoSinVal - Math.SQRT1_2) < 0.01
                    ? 'bg-brand-500 text-white border-brand-600 shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200',
                )}
              >
                sin(x) = √2/2 (45°) ➔ cos(2x) = 0
              </button>

              <button
                type="button"
                onClick={() => setDemoSinVal(0)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-black shrink-0 border transition-all cursor-pointer select-none',
                  Math.abs(demoSinVal) < 0.01
                    ? 'bg-brand-500 text-white border-brand-600 shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200',
                )}
              >
                sin(x) = 0 (0°) ➔ cos(2x) = 1
              </button>
            </div>

            {/* Interactive Slider */}
            <div className="space-y-1.5 pt-1 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">
                  🔬 Kéo thanh trượt thay đổi giá trị $\sin(x)$:
                </span>
                <span className="font-mono font-bold text-slate-500 text-[11px]">
                  Bước nhảy: 0.01
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={Math.round(demoSinVal * 100)}
                onChange={(e) => setDemoSinVal(parseInt(e.target.value, 10) / 100)}
                className="w-full accent-indigo-600 cursor-pointer h-2.5 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>-1.00</span>
                <span>0.00</span>
                <span>+1.00</span>
              </div>
            </div>
          </div>

          {/* ── VALUE & FORMULA CARDS (SPACIOUS 2-COLUMN GRID) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Card 1: 3 Double Angle Formulas */}
            <div
              className={cn(
                'rounded-2xl bg-white border-2 border-indigo-200 p-4 shadow-sm space-y-2 transition-all duration-300',
                highlightTarget === 'double'
                  ? 'ring-4 ring-indigo-400 border-indigo-500 shadow-md bg-indigo-50/60 scale-[1.01]'
                  : 'hover:border-indigo-300',
              )}
            >
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <span className="font-extrabold text-indigo-950 text-xs sm:text-sm uppercase tracking-wider">
                  <AsmoFormula text="⭐ Công Thức Nhân Đôi $\cos(2x)$" />
                </span>
                <span className="text-[10px] font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  Chuẩn Lớp 11
                </span>
              </div>
              <div className="text-xs text-slate-800 space-y-1.5 font-mono font-bold">
                <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-950">
                  <AsmoFormula text="• $\cos(2x) = 1 - 2\sin^2(x)$ (Tối ưu cho bài toán)" />
                </div>
                <div className="p-1 rounded bg-slate-50 text-slate-700">
                  <AsmoFormula text="• $\cos(2x) = 2\cos^2(x) - 1$" />
                </div>
                <div className="p-1 rounded bg-slate-50 text-slate-700">
                  <AsmoFormula text="• $\cos(2x) = \cos^2(x) - \sin^2(x)$" />
                </div>
              </div>
            </div>

            {/* Card 2: 3-Step Problem Solving Breakdown */}
            <div className="rounded-2xl bg-white border-2 border-brand-200 p-4 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between border-b border-brand-100 pb-2">
                <span className="font-black text-brand-900 text-xs sm:text-sm">
                  <AsmoFormula text="📘 3 Bước Giải Nhanh Khi Cho $\sin(x) = \frac{1}{3}$" />
                </span>
                <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-[11px] font-black text-amber-900 border border-amber-300">
                  Đáp số: 7/9
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                  <AsmoFormula text="**B1 (Phân tích):** Chọn $\cos(2x) = 1 - 2\sin^2(x)$ để tính trực tiếp từ $\sin(x)$." />
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                  <AsmoFormula text="**B2 (Thay số):** $\cos(2x) = 1 - 2 \cdot \left(\frac{1}{3}\right)^2 = 1 - \frac{2}{9}$." />
                </div>
                <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold">
                  <AsmoFormula text="**B3 (Kết luận):** $\cos(2x) = \frac{7}{9} \approx 0.778 \Rightarrow \text{Chọn B}$." />
                </div>
              </div>
            </div>

            {/* Card 3: MEE CAT SECRET TIP (Span 2 cols) */}
            <div className="md:col-span-2 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-200 p-4 shadow-sm flex items-start gap-3">
              <div className="text-2xl shrink-0">🐱</div>
              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed space-y-1">
                <span className="font-extrabold text-amber-950 block">
                  Bí kíp Mèo Mee làm nhanh bài trắc nghiệm nhân đôi:
                </span>
                <div className="text-slate-700">
                  <AsmoFormula text="Không cần mất công tính $\cos(x) = \sqrt{1 - \sin^2 x} = \frac{2\sqrt{2}}{3}$ rồi mới nhân đôi! Hãy chọn ngay công thức **$1 - 2\sin^2(x)$** khi đề bài cho $\sin(x)$, hoặc **$2\cos^2(x) - 1$** khi đề bài cho $\cos(x)$ để ra đáp án chỉ trong 5 giây!" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          LEVEL 3: BIẾN ĐỔI PHƯƠNG TRÌNH LƯỢNG GIÁC OLYMPIC
          (Giải bài toán: tan(x) + cot(x) = 8cos(2x) -> sin(4x) = 1/2 -> x = π/24)
         ══════════════════════════════════════════════════════════════════════ */}
      {activeLevel === 3 && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-3.5 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 border-2 border-purple-300 shadow-xs shrink-0">
                <Award className="size-6 text-purple-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
                    Phòng Thí Nghiệm Lượng Giác ASMO
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-extrabold text-purple-800 border border-purple-300 shrink-0">
                    🏆 Olympic Chuyên Sâu
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 border border-emerald-300 shrink-0">
                    Live Interactive Lab
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  <AsmoFormula text="Mô hình biến đổi phương trình Olympic: $\tan(x) + \cot(x) = 8\cos(2x) \Rightarrow \sin(4x) = \frac{1}{2} \Rightarrow x = \frac{\pi}{24}$ ($7.5^\circ$)" />
                </div>
              </div>
            </div>
          </div>

          {/* ── 1-COLUMN FULL-WIDTH OLYMPIC EQUATION VISUALIZER ── */}
          <div className="w-full rounded-3xl bg-slate-50/80 p-4 sm:p-5 border-2 border-slate-200 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                🌊 Trực Quan Hóa Điểm Rơi Nghiệm: $x = 7.5^\circ$ vs $4x = 30^\circ$
              </span>
              <div className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-900 border border-purple-200">
                <AsmoFormula text="$\sin(4x) = \frac{1}{2} \Rightarrow x = \frac{\pi}{24} = 7.5^\circ$" />
              </div>
            </div>

            {/* Olympic Interactive SVG */}
            <div className="w-full flex items-center justify-center py-2 bg-white rounded-2xl border border-slate-200/80 shadow-inner">
              <svg viewBox="0 0 380 230" className="w-full max-w-[480px] aspect-[380/230] select-none font-sans">
                {(() => {
                  const cx3 = 190
                  const cy3 = 155
                  const r3 = 100

                  // Angle x = 7.5 deg
                  const radX = (7.5 * Math.PI) / 180
                  const pxX = cx3 + r3 * Math.cos(radX)
                  const pyX = cy3 - r3 * Math.sin(radX)

                  // Angle 4x = 30 deg
                  const rad4X = (30 * Math.PI) / 180
                  const px4X = cx3 + r3 * Math.cos(rad4X)
                  const py4X = cy3 - r3 * Math.sin(rad4X)

                  return (
                    <g>
                      {/* Arc sector in (0, pi/4) */}
                      <path
                        d={`M ${cx3},${cy3} L ${cx3 + r3},${cy3} A ${r3},${r3} 0 0,0 ${cx3 + r3 * Math.SQRT1_2},${cy3 - r3 * Math.SQRT1_2} Z`}
                        fill="#f3e8ff"
                        fillOpacity="0.4"
                      />
                      <text x={cx3 + 70} y={cy3 - 25} fill="#9333ea" fontSize="9" fontWeight="bold">
                        Miền nghiệm (0, π/4)
                      </text>

                      {/* Semicircle */}
                      <path d={`M ${cx3 - r3},${cy3} A ${r3},${r3} 0 0,1 ${cx3 + r3},${cy3}`} fill="none" stroke="#cbd5e1" strokeWidth="2" />

                      {/* Axes */}
                      <line x1={cx3 - 130} y1={cy3} x2={cx3 + 130} y2={cy3} stroke="#0284c7" strokeWidth="2.5" />
                      <line x1={cx3} y1={cy3} x2={cx3} y2={cy3 - 125} stroke="#e11d48" strokeWidth="2.5" />

                      {/* Vector x = 7.5 deg (Purple) */}
                      <line x1={cx3} y1={cy3} x2={pxX} y2={pyX} stroke="#9333ea" strokeWidth="3.5" strokeLinecap="round" />
                      <circle cx={pxX} cy={pyX} r="5" fill="#9333ea" />
                      <text x={pxX + 8} y={pyX + 2} fill="#6b21a8" fontSize="11" fontWeight="extrabold">
                        x = π/24 (7.5°)
                      </text>

                      {/* Vector 4x = 30 deg (Rose) */}
                      <line x1={cx3} y1={cy3} x2={px4X} y2={py4X} stroke="#e11d48" strokeWidth="3.5" strokeLinecap="round" />
                      <circle cx={px4X} cy={py4X} r="5" fill="#e11d48" />
                      <text x={px4X + 8} y={py4X - 6} fill="#be123c" fontSize="11" fontWeight="extrabold">
                        4x = π/6 (30°)
                      </text>

                      {/* Projection of 4x to sin-axis -> 1/2 */}
                      <line x1={px4X} y1={py4X} x2={cx3} y2={py4X} stroke="#e11d48" strokeWidth="2" strokeDasharray="3 2" />
                      <text x={cx3 - 10} y={py4X + 4} fill="#be123c" fontSize="10" fontWeight="bold" textAnchor="end">
                        sin(4x) = 1/2
                      </text>

                      {/* Origin */}
                      <circle cx={cx3} cy={cy3} r="4" fill="#1e293b" />
                      <text x={cx3 - 12} y={cy3 + 14} fill="#475569" fontSize="10" fontWeight="bold">O</text>
                    </g>
                  )
                })()}
              </svg>
            </div>

            {/* Quick Angle Buttons for Level 3 */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => handleAngleUpdate(7.5)}
                className="px-3 py-1.5 rounded-xl text-xs font-black shrink-0 border bg-purple-600 text-white border-purple-700 shadow-sm ring-2 ring-purple-300 cursor-pointer"
              >
                ⭐ x = π/24 (7.5°) (Nghiệm bài toán)
              </button>

              <button
                type="button"
                onClick={() => handleAngleUpdate(30)}
                className="px-3 py-1.5 rounded-xl text-xs font-black shrink-0 border bg-rose-500 text-white border-rose-600 shadow-sm cursor-pointer"
              >
                ⭐ 4x = π/6 (30°) (sin(4x) = 1/2)
              </button>

              <button
                type="button"
                onClick={() => handleAngleUpdate(45)}
                className="px-3 py-1.5 rounded-xl text-xs font-black shrink-0 border bg-white hover:bg-slate-100 text-slate-700 border-slate-200 cursor-pointer"
              >
                x = π/4 (45°) (Biên điều kiện)
              </button>
            </div>
          </div>

          {/* ── VALUE & TRANSFORMATION CARDS (SPACIOUS 2-COLUMN GRID) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Card 1: LHS Transformation */}
            <div className="rounded-2xl bg-white border-2 border-purple-200 p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                <span className="font-extrabold text-purple-950 text-xs sm:text-sm uppercase tracking-wider">
                  <AsmoFormula text="⭐ Biến Đổi Vế Trái $\tan(x) + \cot(x)$" />
                </span>
                <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  Đẳng Thức Vàng
                </span>
              </div>
              <div className="text-xs text-slate-800 space-y-1.5 font-mono">
                <div className="p-1.5 rounded bg-purple-50 text-purple-950 font-bold">
                  <AsmoFormula text="• $\tan(x) + \cot(x) = \frac{\sin x}{\cos x} + \frac{\cos x}{\sin x}$" />
                </div>
                <div className="p-1.5 rounded bg-purple-50 text-purple-950 font-bold">
                  <AsmoFormula text="• $= \frac{\sin^2 x + \cos^2 x}{\sin x \cos x} = \frac{1}{\frac{1}{2}\sin(2x)} = \frac{2}{\sin(2x)}$" />
                </div>
              </div>
            </div>

            {/* Card 2: Equation Reduction */}
            <div className="rounded-2xl bg-white border-2 border-brand-200 p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between border-b border-brand-100 pb-2">
                <span className="font-black text-brand-900 text-xs sm:text-sm">
                  <AsmoFormula text="🎯 Thu Gọn Về $\sin(4x) = \frac{1}{2}$" />
                </span>
                <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-[11px] font-black text-amber-900 border border-amber-300">
                  Đáp số: x = π/24
                </span>
              </div>
              <div className="text-xs text-slate-800 space-y-1.5 font-mono">
                <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                  <AsmoFormula text="• $\frac{2}{\sin(2x)} = 8\cos(2x) \iff 2 = 8\sin(2x)\cos(2x)$" />
                </div>
                <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                  <AsmoFormula text="• $2 = 4 \cdot [2\sin(2x)\cos(2x)] = 4\sin(4x)$" />
                </div>
                <div className="p-1.5 rounded bg-emerald-50 text-emerald-950 font-bold border border-emerald-200">
                  <AsmoFormula text="• $\sin(4x) = \frac{2}{4} = \frac{1}{2} \Rightarrow 4x = \frac{\pi}{6} \Rightarrow x = \frac{\pi}{24} \Rightarrow \text{Chọn B}$" />
                </div>
              </div>
            </div>

            {/* Card 3: MEE CAT TIP (Span 2 cols) */}
            <div className="md:col-span-2 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-200 p-4 shadow-sm flex items-start gap-3">
              <div className="text-2xl shrink-0">🐱</div>
              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed space-y-1">
                <span className="font-extrabold text-amber-950 block">
                  Bí kíp Mèo Mee Olympic:
                </span>
                <div className="text-slate-700">
                  <AsmoFormula text="Cặp song sinh biến đổi vàng Olympic: **$\\tan(x) + \\cot(x) = \\frac{2}{\\sin(2x)}$** và **$\\cot(x) - \\tan(x) = 2\\cot(2x)$**! Khi gặp biểu thức chứa $\\tan$ và $\\cot$, hãy gom về $\\sin(2x)$ hoặc $\\cot(2x)$ để biến đổi nhân đôi liên tiếp nhé!" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── FOOTER BAR ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 pt-3 border-t border-slate-200">
        <span className="inline-flex items-center gap-1.5 text-brand-700 font-bold">
          <Sparkles className="size-3.5 text-amber-500" />
          Phòng Thí Nghiệm Đồ Họa Lượng Giác Chuẩn Olympic ASMO &amp; Sách Giáo Khoa Mới
        </span>
        <span className="font-mono text-slate-400 text-[11px]">
          KaTeX Mathematical Typography + SVG 360°
        </span>
      </div>
    </div>
  )
}
