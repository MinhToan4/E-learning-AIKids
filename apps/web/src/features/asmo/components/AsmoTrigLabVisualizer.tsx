import { useState, useEffect, useRef } from 'react'
import {
  Compass,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Waves,
  Calculator,
  CheckCircle2,
  BookOpen,
  ChevronRight,
  Eye,
  Sliders,
  Layers,
  Info,
} from 'lucide-react'
import { AsmoFormula } from './AsmoFormula'
import { cn } from '@/shared/lib/cn'

type LabViewMode = 'all' | 'circle' | 'wave' | 'formula'

type SpecialAngle = {
  deg: number
  radLabel: string
  sinExact: string
  cosExact: string
  tanExact: string
  cotExact: string
}

const SPECIAL_ANGLES: SpecialAngle[] = [
  { deg: 0, radLabel: '0', sinExact: '0', cosExact: '1', tanExact: '0', cotExact: 'ND' },
  { deg: 30, radLabel: '\\frac{\\pi}{6}', sinExact: '\\frac{1}{2}', cosExact: '\\frac{\\sqrt{3}}{2}', tanExact: '\\frac{\\sqrt{3}}{3}', cotExact: '\\sqrt{3}' },
  { deg: 45, radLabel: '\\frac{\\pi}{4}', sinExact: '\\frac{\\sqrt{2}}{2}', cosExact: '\\frac{\\sqrt{2}}{2}', tanExact: '1', cotExact: '1' },
  { deg: 60, radLabel: '\\frac{\\pi}{3}', sinExact: '\\frac{\\sqrt{3}}{2}', cosExact: '\\frac{1}{2}', tanExact: '\\sqrt{3}', cotExact: '\\frac{\\sqrt{3}}{3}' },
  { deg: 90, radLabel: '\\frac{\\pi}{2}', sinExact: '1', cosExact: '0', tanExact: 'ND', cotExact: '0' },
  { deg: 120, radLabel: '\\frac{2\\pi}{3}', sinExact: '\\frac{\\sqrt{3}}{2}', cosExact: '-\\frac{1}{2}', tanExact: '-\\sqrt{3}', cotExact: '-\\frac{\\sqrt{3}}{3}' },
  { deg: 135, radLabel: '\\frac{3\\pi}{4}', sinExact: '\\frac{\\sqrt{2}}{2}', cosExact: '-\\frac{\\sqrt{2}}{2}', tanExact: '-1', cotExact: '-1' },
  { deg: 150, radLabel: '\\frac{5\\pi}{6}', sinExact: '\\frac{1}{2}', cosExact: '-\\frac{\\sqrt{3}}{2}', tanExact: '-\\frac{\\sqrt{3}}{3}', cotExact: '-\\sqrt{3}' },
  { deg: 180, radLabel: '\\pi', sinExact: '0', cosExact: '-1', tanExact: '0', cotExact: 'ND' },
  { deg: 270, radLabel: '\\frac{3\\pi}{2}', sinExact: '-1', cosExact: '0', tanExact: 'ND', cotExact: '0' },
  { deg: 360, radLabel: '2\\pi', sinExact: '0', cosExact: '1', tanExact: '0', cotExact: 'ND' },
]

export type AsmoTrigLabProps = {
  className?: string
  initialAngle?: number
}

export function AsmoTrigLabVisualizer({ className, initialAngle = 30 }: AsmoTrigLabProps) {
  const [angleDeg, setAngleDeg] = useState(initialAngle)
  const [isPlaying, setIsPlaying] = useState(false)
  const [viewMode, setViewMode] = useState<LabViewMode>('all')
  const [showAxesDetails, setShowAxesDetails] = useState(true)
  const [showTanCot, setShowTanCot] = useState(true)
  const [demoSinVal, setDemoSinVal] = useState(1 / 3)
  const animFrameRef = useRef<number | null>(null)

  // Trigonometric calculated values
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

    const speed = 0.5 // degrees per frame
    const loop = () => {
      setAngleDeg((prev) => (prev + speed) % 360)
      animFrameRef.current = requestAnimationFrame(loop)
    }
    animFrameRef.current = requestAnimationFrame(loop)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isPlaying])

  // Geometry for Unit Circle SVG (Center at (160, 160), Radius R = 100)
  const CX = 160
  const CY = 160
  const R = 100

  const px = CX + R * cosVal
  const py = CY - R * sinVal

  // Tangent line at x = 1 (X = CX + R = 260)
  const tanX = CX + R
  const clampedTan = tanVal !== null ? Math.max(-2.5, Math.min(2.5, tanVal)) : 0
  const tanY = CY - R * clampedTan

  // Cotangent line at y = 1 (Y = CY - R = 60)
  const cotY = CY - R
  const clampedCot = cotVal !== null ? Math.max(-2.5, Math.min(2.5, cotVal)) : 0
  const cotX = CX + R * clampedCot

  // Demo Grade 11 calculation: cos(2x) = 1 - 2*sin^2(x)
  const computedCos2x = 1 - 2 * demoSinVal * demoSinVal

  return (
    <div
      className={cn(
        'relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border border-slate-700/80 shadow-2xl p-4 sm:p-6 text-white flex flex-col gap-4',
        className,
      )}
    >
      {/* ── TOP CONTROL BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 shadow-inner">
            <Compass className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-indigo-200 uppercase tracking-wider">
                Phòng Thí Nghiệm Lượng Giác ASMO
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-500/30">
                Live Interactive Lab
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Đường tròn đơn vị · Máy vẽ sóng sin/cos · Công thức nhân đôi Lớp 11
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-2xl border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('all')}
            className={cn(
              'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
              viewMode === 'all'
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                : 'text-slate-300 hover:text-white',
            )}
          >
            🔬 Toàn Cảnh
          </button>
          <button
            type="button"
            onClick={() => setViewMode('circle')}
            className={cn(
              'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
              viewMode === 'circle'
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                : 'text-slate-300 hover:text-white',
            )}
          >
            🎯 Đường Tròn
          </button>
          <button
            type="button"
            onClick={() => setViewMode('wave')}
            className={cn(
              'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
              viewMode === 'wave'
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                : 'text-slate-300 hover:text-white',
            )}
          >
            🌊 Sóng Lượng Giác
          </button>
          <button
            type="button"
            onClick={() => setViewMode('formula')}
            className={cn(
              'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
              viewMode === 'formula'
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                : 'text-slate-300 hover:text-white',
            )}
          >
            📐 Công Thức Lớp 11
          </button>
        </div>
      </div>

      {/* ── QUICK SPECIAL ANGLES BAR ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none border-b border-white/5">
        <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
          <Sparkles className="size-3 text-amber-400" />
          <span>Góc đặc biệt:</span>
        </span>
        {SPECIAL_ANGLES.map((spec) => {
          const isSelected = Math.round(normalizedDeg) === spec.deg
          return (
            <button
              key={spec.deg}
              type="button"
              onClick={() => {
                setAngleDeg(spec.deg)
                setIsPlaying(false)
              }}
              className={cn(
                'shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border',
                isSelected
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-300 shadow-sm ring-1 ring-indigo-300'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10',
              )}
            >
              <span>{spec.deg}°</span>
              <span className="text-[10px] text-indigo-300 ml-1">({spec.radLabel.replace(/\\/g, '')})</span>
            </button>
          )
        })}
      </div>

      {/* ── MAIN LAB WORKSPACE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ── LEFT / MAIN: UNIT CIRCLE INTERACTIVE VIEWER (7 cols) ── */}
        {(viewMode === 'all' || viewMode === 'circle') && (
          <div
            className={cn(
              'flex flex-col gap-3 rounded-3xl bg-slate-950/60 p-4 border border-white/10 shadow-inner',
              viewMode === 'circle' ? 'lg:col-span-12' : 'lg:col-span-7',
            )}
          >
            {/* Viewport Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-300">
                  🎯 Đường Tròn Lượng Giác Động (Unit Circle R = 1)
                </span>
                <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-black text-indigo-300 border border-indigo-500/30">
                  Góc Phần Tư {quadrant}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setShowTanCot((prev) => !prev)}
                  className={cn(
                    'px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer',
                    showTanCot
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-white/5 text-slate-400 border-white/10',
                  )}
                >
                  Trục tan / cot
                </button>
                <button
                  type="button"
                  onClick={() => setShowAxesDetails((prev) => !prev)}
                  className={cn(
                    'px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer',
                    showAxesDetails
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-white/5 text-slate-400 border-white/10',
                  )}
                >
                  Chiếu sin / cos
                </button>
              </div>
            </div>

            {/* SVG Unit Circle */}
            <div className="relative w-full flex items-center justify-center py-2">
              <svg viewBox="0 0 320 320" className="w-full max-w-[320px] aspect-square select-none font-sans">
                <defs>
                  {/* Glowing Filters */}
                  <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="glow-rose" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="triangleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.15" />
                  </linearGradient>
                </defs>

                {/* 4 Quadrants Background Tint */}
                <rect x={CX} y={CY - R} width={R} height={R} fill="#3b82f6" fillOpacity="0.04" />
                <rect x={CX - R} y={CY - R} width={R} height={R} fill="#8b5cf6" fillOpacity="0.04" />
                <rect x={CX - R} y={CY} width={R} height={R} fill="#ec4899" fillOpacity="0.04" />
                <rect x={CX} y={CY} width={R} height={R} fill="#10b981" fillOpacity="0.04" />

                {/* Quadrant Text Badges */}
                <text x={CX + R / 2} y={CY - R / 2} fill="#60a5fa" fontSize="10" opacity="0.5" textAnchor="middle">Góc I (+,+)</text>
                <text x={CX - R / 2} y={CY - R / 2} fill="#c084fc" fontSize="10" opacity="0.5" textAnchor="middle">Góc II (-,+)</text>
                <text x={CX - R / 2} y={CY + R / 2} fill="#f472b6" fontSize="10" opacity="0.5" textAnchor="middle">Góc III (-,-)</text>
                <text x={CX + R / 2} y={CY + R / 2} fill="#34d399" fontSize="10" opacity="0.5" textAnchor="middle">Góc IV (+,-)</text>

                {/* Unit Circle (R = 100) */}
                <circle cx={CX} cy={CY} r={R} fill="none" stroke="#475569" strokeWidth="2" />
                <circle cx={CX} cy={CY} r={R} fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />

                {/* Tangent Axis (Vertical at x = 1 -> X = CX + R = 260) */}
                {showTanCot && (
                  <g opacity="0.7">
                    <line x1={tanX} y1={20} x2={tanX} y2={300} stroke="#a855f7" strokeWidth="1.5" strokeDasharray="3 3" />
                    <text x={tanX + 5} y={35} fill="#c084fc" fontSize="10" fontWeight="bold">Trục tan</text>
                  </g>
                )}

                {/* Cotangent Axis (Horizontal at y = 1 -> Y = CY - R = 60) */}
                {showTanCot && (
                  <g opacity="0.7">
                    <line x1={20} y1={cotY} x2={300} y2={cotY} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
                    <text x={280} y={cotY - 6} fill="#fbbf24" fontSize="10" fontWeight="bold">Trục cot</text>
                  </g>
                )}

                {/* Cosine Axis (X-axis, Blue) */}
                <line x1={15} y1={CY} x2={305} y2={CY} stroke="#38bdf8" strokeWidth="2" />
                <polygon points="305,156 315,160 305,164" fill="#38bdf8" />
                <text x={300} y={150} fill="#38bdf8" fontSize="12" fontWeight="bold">cos (x)</text>

                {/* Sine Axis (Y-axis, Red) */}
                <line x1={CX} y1={305} x2={CX} y2={15} stroke="#f43f5e" strokeWidth="2" />
                <polygon points="156,15 160,5 164,15" fill="#f43f5e" />
                <text x={168} y={20} fill="#f43f5e" fontSize="12" fontWeight="bold">sin (y)</text>

                {/* Ticks on axes */}
                <text x={CX + R} y={CY + 15} fill="#94a3b8" fontSize="9" textAnchor="middle">+1</text>
                <text x={CX - R} y={CY + 15} fill="#94a3b8" fontSize="9" textAnchor="middle">-1</text>
                <text x={CX - 12} y={CY - R + 4} fill="#94a3b8" fontSize="9" textAnchor="end">+1</text>
                <text x={CX - 12} y={CY + R + 4} fill="#94a3b8" fontSize="9" textAnchor="end">-1</text>

                {/* Angle Arc from 0 to theta */}
                {angleDeg > 0 && (
                  <path
                    d={`M ${CX + 28},${CY} A 28,28 0 ${angleDeg > 180 ? 1 : 0},0 ${CX + 28 * Math.cos(rad)},${CY - 28 * Math.sin(rad)}`}
                    fill="none"
                    stroke="#facc15"
                    strokeWidth="2.5"
                  />
                )}
                <text
                  x={CX + 38 * Math.cos(rad / 2)}
                  y={CY - 38 * Math.sin(rad / 2) + 4}
                  fill="#fde047"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {Math.round(normalizedDeg)}°
                </text>

                {/* Shaded Projection Right Triangle */}
                {showAxesDetails && (
                  <polygon
                    points={`${CX},${CY} ${px},${CY} ${px},${py}`}
                    fill="url(#triangleGrad)"
                    stroke="#818cf8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Tangent Projection Line to tan axis */}
                {showTanCot && tanVal !== null && Math.abs(tanVal) <= 2.5 && (
                  <g>
                    <line x1={CX} y1={CY} x2={tanX} y2={tanY} stroke="#c084fc" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
                    <circle cx={tanX} cy={tanY} r="4" fill="#a855f7" />
                    <text x={tanX + 6} y={tanY + 4} fill="#d8b4fe" fontSize="9" fontWeight="bold">
                      T(1, {tanVal.toFixed(2)})
                    </text>
                  </g>
                )}

                {/* Cotangent Projection Line to cot axis */}
                {showTanCot && cotVal !== null && Math.abs(cotVal) <= 2.5 && (
                  <g>
                    <line x1={CX} y1={CY} x2={cotX} y2={cotY} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
                    <circle cx={cotX} cy={cotY} r="4" fill="#f59e0b" />
                    <text x={cotX} y={cotY - 6} fill="#fde68a" fontSize="9" fontWeight="bold" textAnchor="middle">
                      C({cotVal.toFixed(2)}, 1)
                    </text>
                  </g>
                )}

                {/* Projection Lines to Cosine and Sine axes */}
                {showAxesDetails && (
                  <>
                    {/* Vertical line from M to cos-axis (shows sin length) */}
                    <line x1={px} y1={py} x2={px} y2={CY} stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="3 2" />
                    {/* Horizontal line from M to sin-axis (shows cos length) */}
                    <line x1={px} y1={py} x2={CX} y2={py} stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3 2" />

                    {/* Adjacent side (cos) along x-axis */}
                    <line x1={CX} y1={CY} x2={px} y2={CY} stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
                    {/* Opposite side (sin) vertical */}
                    <line x1={px} y1={CY} x2={px} y2={py} stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" />

                    {/* Right angle marker at (px, CY) */}
                    <rect
                      x={cosVal >= 0 ? px - 7 : px}
                      y={sinVal >= 0 ? CY - 7 : CY}
                      width="7"
                      height="7"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                  </>
                )}

                {/* Hypotenuse Vector OM (R = 1) */}
                <line x1={CX} y1={CY} x2={px} y2={py} stroke="#a855f7" strokeWidth="3.5" strokeLinecap="round" />

                {/* Origin Point O(0,0) */}
                <circle cx={CX} cy={CY} r="3.5" fill="#f8fafc" />
                <text x={CX - 12} y={CY + 14} fill="#cbd5e1" fontSize="10" fontWeight="bold">O</text>

                {/* Moving Point M(cos θ, sin θ) */}
                <circle cx={px} cy={py} r="7" fill="#38bdf8" filter="url(#glow-cyan)" />
                <circle cx={px} cy={py} r="4" fill="#ffffff" />
                <text
                  x={px + (cosVal >= 0 ? 10 : -10)}
                  y={py + (sinVal >= 0 ? -10 : 16)}
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="black"
                  textAnchor={cosVal >= 0 ? 'start' : 'end'}
                >
                  M({cosVal.toFixed(2)}, {sinVal.toFixed(2)})
                </text>
              </svg>
            </div>

            {/* Slider & Animation Controls */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlaying((prev) => !prev)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer',
                      isPlaying
                        ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md',
                    )}
                  >
                    {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                    <span>{isPlaying ? 'Tạm Dừng' : 'Quay Tự Động'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAngleDeg(0)
                      setIsPlaying(false)
                    }}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-all cursor-pointer"
                    title="Đặt lại về 0°"
                  >
                    <RotateCcw className="size-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs text-slate-400">Góc quay:</span>
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-200 text-xs font-black border border-indigo-400/30">
                    θ = {Math.round(normalizedDeg)}°
                  </span>
                  <span className="text-xs text-amber-300 font-bold">
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
                  setAngleDeg(parseInt(e.target.value, 10))
                  setIsPlaying(false)
                }}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Live Real-time Values Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
              <div className="rounded-2xl bg-rose-500/15 p-2.5 border border-rose-500/30">
                <div className="text-[10px] uppercase font-bold text-rose-300 flex items-center justify-between">
                  <span>sin(θ) [Trục Đỏ]:</span>
                  <span className="font-mono">{sinVal >= 0 ? '+' : '−'}</span>
                </div>
                <div className="font-mono font-black text-rose-200 text-sm mt-0.5 truncate">
                  {matchedSpecial ? matchedSpecial.sinExact.replace(/\\/g, '') : sinVal.toFixed(4)}
                </div>
                <div className="text-[10px] text-rose-300/70 font-mono">≈ {sinVal.toFixed(3)}</div>
              </div>

              <div className="rounded-2xl bg-sky-500/15 p-2.5 border border-sky-500/30">
                <div className="text-[10px] uppercase font-bold text-sky-300 flex items-center justify-between">
                  <span>cos(θ) [Trục Xanh]:</span>
                  <span className="font-mono">{cosVal >= 0 ? '+' : '−'}</span>
                </div>
                <div className="font-mono font-black text-sky-200 text-sm mt-0.5 truncate">
                  {matchedSpecial ? matchedSpecial.cosExact.replace(/\\/g, '') : cosVal.toFixed(4)}
                </div>
                <div className="text-[10px] text-sky-300/70 font-mono">≈ {cosVal.toFixed(3)}</div>
              </div>

              <div className="rounded-2xl bg-purple-500/15 p-2.5 border border-purple-500/30">
                <div className="text-[10px] uppercase font-bold text-purple-300 flex items-center justify-between">
                  <span>tan(θ) = sin/cos:</span>
                  <span className="font-mono">{tanVal !== null && tanVal >= 0 ? '+' : '−'}</span>
                </div>
                <div className="font-mono font-black text-purple-200 text-sm mt-0.5 truncate">
                  {tanVal !== null ? (matchedSpecial ? matchedSpecial.tanExact.replace(/\\/g, '') : tanVal.toFixed(3)) : 'Không xác định'}
                </div>
                <div className="text-[10px] text-purple-300/70 font-mono">{tanVal !== null ? `≈ ${tanVal.toFixed(3)}` : 'θ = 90°, 270°'}</div>
              </div>

              <div className="rounded-2xl bg-amber-500/15 p-2.5 border border-amber-500/30">
                <div className="text-[10px] uppercase font-bold text-amber-300 flex items-center justify-between">
                  <span>cot(θ) = cos/sin:</span>
                  <span className="font-mono">{cotVal !== null && cotVal >= 0 ? '+' : '−'}</span>
                </div>
                <div className="font-mono font-black text-amber-200 text-sm mt-0.5 truncate">
                  {cotVal !== null ? (matchedSpecial ? matchedSpecial.cotExact.replace(/\\/g, '') : cotVal.toFixed(3)) : 'Không xác định'}
                </div>
                <div className="text-[10px] text-amber-300/70 font-mono">{cotVal !== null ? `≈ ${cotVal.toFixed(3)}` : 'θ = 0°, 180°'}</div>
              </div>
            </div>

            {/* Pythagoras Live Verification */}
            <div className="flex items-center justify-between rounded-2xl bg-emerald-950/40 p-2.5 border border-emerald-500/30 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span className="font-extrabold text-emerald-200">
                  Kiểm chứng hằng đẳng thức Pythagoras:
                </span>
              </div>
              <div className="font-mono font-black text-emerald-300 text-sm">
                sin²(θ) + cos²(θ) = {(sinVal * sinVal + cosVal * cosVal).toFixed(3)} ≡ 1
              </div>
            </div>
          </div>
        )}

        {/* ── RIGHT / SECONDARY: WAVE GRAPHER & FORMULAS (5 cols or full) ── */}
        <div
          className={cn(
            'flex flex-col gap-4',
            viewMode === 'circle' ? 'hidden' : viewMode === 'all' ? 'lg:col-span-5' : 'lg:col-span-12',
          )}
        >
          {/* 1. Synchronized Wave Grapher */}
          {(viewMode === 'all' || viewMode === 'wave') && (
            <div className="rounded-3xl bg-slate-950/60 p-4 border border-white/10 shadow-inner space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Waves className="size-4 text-sky-400" />
                  <span className="text-xs font-bold text-sky-200">
                    Máy Vẽ Sóng Lượng Giác Đồng Bộ (Wave Grapher)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="flex items-center gap-1 text-rose-300 font-bold">
                    <span className="size-2 rounded-full bg-rose-500 inline-block" />
                    sin(x)
                  </span>
                  <span className="flex items-center gap-1 text-sky-300 font-bold">
                    <span className="size-2 rounded-full bg-sky-400 inline-block" />
                    cos(x)
                  </span>
                </div>
              </div>

              {/* Wave SVG Graph */}
              <div className="w-full bg-slate-900/90 rounded-2xl p-2 border border-slate-800">
                <svg viewBox="0 0 360 140" className="w-full h-32 select-none font-sans">
                  {/* Grid Lines */}
                  <line x1="20" y1="70" x2="340" y2="70" stroke="#475569" strokeWidth="1.5" />
                  <line x1="20" y1="20" x2="340" y2="20" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="20" y1="120" x2="340" y2="120" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Y Axis Labels */}
                  <text x="12" y="24" fill="#94a3b8" fontSize="9">+1</text>
                  <text x="12" y="74" fill="#94a3b8" fontSize="9">0</text>
                  <text x="12" y="124" fill="#94a3b8" fontSize="9">-1</text>

                  {/* X Axis Radian Ticks */}
                  <text x="20" y="85" fill="#94a3b8" fontSize="8">0</text>
                  <text x="100" y="85" fill="#94a3b8" fontSize="8">π/2</text>
                  <text x="180" y="85" fill="#94a3b8" fontSize="8">π</text>
                  <text x="260" y="85" fill="#94a3b8" fontSize="8">3π/2</text>
                  <text x="335" y="85" fill="#94a3b8" fontSize="8">2π</text>

                  {/* Cosine Wave (Cyan) */}
                  <path
                    d={Array.from({ length: 321 }).reduce((acc: string, _, i) => {
                      const deg = i * (360 / 320)
                      const x = 20 + i
                      const y = 70 - 50 * Math.cos((deg * Math.PI) / 180)
                      return i === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`
                    }, '')}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeOpacity="0.85"
                  />

                  {/* Sine Wave (Rose) */}
                  <path
                    d={Array.from({ length: 321 }).reduce((acc: string, _, i) => {
                      const deg = i * (360 / 320)
                      const x = 20 + i
                      const y = 70 - 50 * Math.sin((deg * Math.PI) / 180)
                      return i === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`
                    }, '')}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2.5"
                    strokeOpacity="0.85"
                  />

                  {/* Synchronized Tracking Cursor at angleDeg */}
                  {(() => {
                    const cursorX = 20 + (normalizedDeg / 360) * 320
                    const cursorSinY = 70 - 50 * sinVal
                    const cursorCosY = 70 - 50 * cosVal
                    return (
                      <g>
                        {/* Vertical Tracking Line */}
                        <line x1={cursorX} y1={10} x2={cursorX} y2={130} stroke="#facc15" strokeWidth="1.5" strokeDasharray="3 2" />
                        {/* Sine Wave Cursor Point */}
                        <circle cx={cursorX} cy={cursorSinY} r="5" fill="#f43f5e" />
                        <circle cx={cursorX} cy={cursorSinY} r="2.5" fill="#ffffff" />
                        {/* Cosine Wave Cursor Point */}
                        <circle cx={cursorX} cy={cursorCosY} r="5" fill="#38bdf8" />
                        <circle cx={cursorX} cy={cursorCosY} r="2.5" fill="#ffffff" />
                      </g>
                    )
                  })()}
                </svg>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Chu kỳ $T = 2\pi$ ($360^\circ$)</span>
                <span>Biên độ $A = 1$</span>
              </div>
            </div>
          )}

          {/* 2. Breakthrough Formula & Grade 11 Demo */}
          {(viewMode === 'all' || viewMode === 'formula') && (
            <div className="rounded-3xl bg-slate-950/60 p-4 border border-white/10 shadow-inner space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <Calculator className="size-4 text-indigo-400" />
                  <span className="text-xs font-extrabold text-indigo-200 uppercase tracking-wider">
                    Bảng Công Thức Lượng Giác & Bài Toán Lớp 11
                  </span>
                </div>
              </div>

              {/* Core Double Angle Formulas */}
              <div className="rounded-2xl bg-white/5 p-3 border border-white/10 space-y-2 text-xs">
                <span className="font-extrabold text-amber-300 block text-[11px] uppercase tracking-wide">
                  ⭐ Công thức nhân đôi trọng tâm ASMO:
                </span>
                <div className="space-y-1 text-slate-200 leading-relaxed font-mono">
                  <div>
                    <AsmoFormula text="• $\cos(2x) = 1 - 2\sin^2(x) = 2\cos^2(x) - 1 = \cos^2(x) - \sin^2(x)$" />
                  </div>
                  <div>
                    <AsmoFormula text="• $\sin(2x) = 2\sin(x)\cos(x)$" />
                  </div>
                  <div>
                    <AsmoFormula text="• $\tan(2x) = \frac{2\tan(x)}{1 - \tan^2(x)}$" />
                  </div>
                </div>
              </div>

              {/* Grade 11 Exemplar Problem Breakdown */}
              <div className="rounded-2xl bg-indigo-950/60 p-3.5 border border-indigo-500/30 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-indigo-300 text-xs">
                    <AsmoFormula text="📘 Bài Toán Lớp 11: Cho $\sin(x) = \frac{1}{3}$, Tính $\cos(2x)$" />
                  </span>
                  <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    Đáp số: 7/9
                  </span>
                </div>

                <div className="space-y-1.5 text-slate-300 leading-relaxed">
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-indigo-400 shrink-0">B1:</span>
                    <span>
                      <AsmoFormula text="Xác định công thức liên hệ trực tiếp: $\cos(2x) = 1 - 2\sin^2(x)$." />
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-indigo-400 shrink-0">B2:</span>
                    <span>
                      <AsmoFormula text="Thay số $\sin(x) = \frac{1}{3} \Rightarrow \cos(2x) = 1 - 2 \cdot \left(\frac{1}{3}\right)^2 = 1 - \frac{2}{9}$." />
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-indigo-400 shrink-0">B3:</span>
                    <span>
                      <AsmoFormula text="Kết luận: $\cos(2x) = \frac{7}{9} \approx 0.778$." />
                    </span>
                  </div>
                </div>

                {/* Interactive Value Tester */}
                <div className="pt-2 border-t border-indigo-500/20">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Thử nghiệm thay đổi $\sin(x)$:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      sin(x) = {demoSinVal.toFixed(3)} ➔ cos(2x) = {computedCos2x.toFixed(3)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="1"
                    value={Math.round(demoSinVal * 100)}
                    onChange={(e) => setDemoSinVal(parseInt(e.target.value, 10) / 100)}
                    className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER BAR ── */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/10">
        <span className="flex items-center gap-1.5 text-indigo-300 font-bold">
          <Sparkles className="size-3.5 text-amber-400" />
          Phòng Thí Nghiệm Đồ Họa Lượng Giác Chuẩn Olympic ASMO & Sách Giáo Khoa Mới
        </span>
        <span className="font-mono text-slate-500">KaTeX + SVG Engine 360°</span>
      </div>
    </div>
  )
}
