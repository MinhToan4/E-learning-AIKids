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
}

export const SPECIAL_ANGLES: SpecialAngle[] = [
  { deg: 0, radKatex: '0', sinExact: '0', cosExact: '1', tanExact: '0', cotExact: '\\text{KXD}' },
  { deg: 30, radKatex: '\\frac{\\pi}{6}', sinExact: '\\frac{1}{2}', cosExact: '\\frac{\\sqrt{3}}{2}', tanExact: '\\frac{\\sqrt{3}}{3}', cotExact: '\\sqrt{3}' },
  { deg: 45, radKatex: '\\frac{\\pi}{4}', sinExact: '\\frac{\\sqrt{2}}{2}', cosExact: '\\frac{\\sqrt{2}}{2}', tanExact: '1', cotExact: '1' },
  { deg: 60, radKatex: '\\frac{\\pi}{3}', sinExact: '\\frac{\\sqrt{3}}{2}', cosExact: '\\frac{1}{2}', tanExact: '\\sqrt{3}', cotExact: '\\frac{\\sqrt{3}}{3}' },
  { deg: 90, radKatex: '\\frac{\\pi}{2}', sinExact: '1', cosExact: '0', tanExact: '\\text{KXD}', cotExact: '0' },
  { deg: 120, radKatex: '\\frac{2\\pi}{3}', sinExact: '\\frac{\\sqrt{3}}{2}', cosExact: '-\\frac{1}{2}', tanExact: '-\\sqrt{3}', cotExact: '-\\frac{\\sqrt{3}}{3}' },
  { deg: 135, radKatex: '\\frac{3\\pi}{4}', sinExact: '\\frac{\\sqrt{2}}{2}', cosExact: '-\\frac{\\sqrt{2}}{2}', tanExact: '-1', cotExact: '-1' },
  { deg: 150, radKatex: '\\frac{5\\pi}{6}', sinExact: '\\frac{1}{2}', cosExact: '-\\frac{\\sqrt{3}}{2}', tanExact: '-\\frac{\\sqrt{3}}{3}', cotExact: '-\\sqrt{3}' },
  { deg: 180, radKatex: '\\pi', sinExact: '0', cosExact: '-1', tanExact: '0', cotExact: '\\text{KXD}' },
  { deg: 270, radKatex: '\\frac{3\\pi}{2}', sinExact: '-1', cosExact: '0', tanExact: '\\text{KXD}', cotExact: '0' },
  { deg: 360, radKatex: '2\\pi', sinExact: '0', cosExact: '1', tanExact: '0', cotExact: '\\text{KXD}' },
]

export type AsmoTrigLabProps = {
  className?: string
  initialAngle?: number
}

export function AsmoTrigLabVisualizer({ className, initialAngle = 30 }: AsmoTrigLabProps) {
  const [angleDeg, setAngleDeg] = useState(initialAngle)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState<LabTabMode>('circle')
  const [showAxesDetails, setShowAxesDetails] = useState(true)
  const [showTanCot, setShowTanCot] = useState(false)
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
        'relative w-full rounded-3xl overflow-hidden bg-white border-2 border-brand-200 shadow-clay p-4 sm:p-6 text-slate-800 flex flex-col gap-4',
        className,
      )}
    >
      {/* ── TOP HEADER & TAB SWITCHER BAR ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        {/* Title & Brand Badge */}
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 border-2 border-brand-300 shadow-xs shrink-0">
            <Compass className="size-6 text-brand-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Phòng Thí Nghiệm Lượng Giác ASMO
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 border border-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Interactive Lab
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Đường tròn đơn vị · Máy vẽ sóng sin/cos · Công thức nhân đôi Lớp 11
            </p>
          </div>
        </div>

        {/* 3 Clear Distinct Tab Switcher */}
        <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/90 shrink-0 self-start md:self-auto shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('circle')}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none',
              activeTab === 'circle'
                ? 'bg-brand-500 text-white shadow-sm ring-2 ring-brand-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60',
            )}
          >
            <Compass className="size-3.5" />
            <span>Đường Tròn Đơn Vị</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wave')}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none',
              activeTab === 'wave'
                ? 'bg-brand-500 text-white shadow-sm ring-2 ring-brand-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60',
            )}
          >
            <Waves className="size-3.5" />
            <span>Sóng Lượng Giác</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('formula')}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none',
              activeTab === 'formula'
                ? 'bg-brand-500 text-white shadow-sm ring-2 ring-brand-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60',
            )}
          >
            <Calculator className="size-3.5" />
            <span>Công Thức Lớp 11</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: ĐƯỜNG TRÒN ĐƠN VỊ (MẶC ĐỊNH & TRỌNG TÂM) ── */}
      {activeTab === 'circle' && (
        <div className="flex flex-col gap-4">
          {/* Quick Special Angles Ribbon with KaTeX */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none border-b border-slate-100">
            <span className="text-xs font-extrabold text-slate-600 shrink-0 mr-1 flex items-center gap-1">
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
                    setAngleDeg(spec.deg)
                    setIsPlaying(false)
                  }}
                  className={cn(
                    'shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer border select-none',
                    isSelected
                      ? 'bg-brand-500 text-white border-brand-600 shadow-xs ring-2 ring-brand-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300',
                  )}
                >
                  <span>{spec.deg}°</span>
                  <span className={cn('text-[11px]', isSelected ? 'text-brand-100' : 'text-slate-500')}>
                    (<AsmoFormula text={`$${spec.radKatex}$`} className="inline-block" />)
                  </span>
                </button>
              )
            })}
          </div>

          {/* Main Grid: Left SVG Canvas & Right Value Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* ── LEFT: UNIT CIRCLE SVG CANVAS (7 cols) ── */}
            <div className="lg:col-span-7 flex flex-col gap-3 rounded-3xl bg-slate-50/70 p-4 border-2 border-slate-200/80 shadow-xs">
              {/* Header inside canvas */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    🎯 Đường Tròn Lượng Giác (R = 1)
                  </span>
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-black text-brand-700 border border-brand-300">
                    Góc Phần Tư {quadrant}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowAxesDetails((prev) => !prev)}
                    className={cn(
                      'px-2 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer select-none',
                      showAxesDetails
                        ? 'bg-brand-50 text-brand-700 border-brand-300'
                        : 'bg-white text-slate-500 border-slate-200',
                    )}
                  >
                    Chiếu sin/cos
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTanCot((prev) => !prev)}
                    className={cn(
                      'px-2 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer select-none',
                      showTanCot
                        ? 'bg-purple-50 text-purple-700 border-purple-300'
                        : 'bg-white text-slate-500 border-slate-200',
                    )}
                  >
                    Trục tan/cot
                  </button>
                </div>
              </div>

              {/* Unit Circle SVG */}
              <div className="relative w-full flex items-center justify-center py-2 bg-white rounded-2xl border border-slate-200/80 shadow-inner">
                <svg viewBox="0 0 320 320" className="w-full max-w-[310px] aspect-square select-none font-sans">
                  <defs>
                    {/* Glowing Filters */}
                    <filter id="glow-circle-cyan" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id="triangleGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#e11d48" stopOpacity="0.15" />
                    </linearGradient>
                  </defs>

                  {/* 4 Quadrants Background Soft Tint */}
                  <rect x={CX} y={CY - R} width={R} height={R} fill="#e0f2fe" fillOpacity="0.35" />
                  <rect x={CX - R} y={CY - R} width={R} height={R} fill="#f3e8ff" fillOpacity="0.35" />
                  <rect x={CX - R} y={CY} width={R} height={R} fill="#ffe4e6" fillOpacity="0.35" />
                  <rect x={CX} y={CY} width={R} height={R} fill="#ecfdf5" fillOpacity="0.35" />

                  {/* Quadrant Text Labels */}
                  <text x={CX + R / 2} y={CY - R / 2} fill="#0284c7" fontSize="10" fontWeight="bold" opacity="0.6" textAnchor="middle">Góc I (+,+)</text>
                  <text x={CX - R / 2} y={CY - R / 2} fill="#7c3aed" fontSize="10" fontWeight="bold" opacity="0.6" textAnchor="middle">Góc II (-,+)</text>
                  <text x={CX - R / 2} y={CY + R / 2} fill="#e11d48" fontSize="10" fontWeight="bold" opacity="0.6" textAnchor="middle">Góc III (-,-)</text>
                  <text x={CX + R / 2} y={CY + R / 2} fill="#059669" fontSize="10" fontWeight="bold" opacity="0.6" textAnchor="middle">Góc IV (+,-)</text>

                  {/* Unit Circle (R = 100) */}
                  <circle cx={CX} cy={CY} r={R} fill="none" stroke="#cbd5e1" strokeWidth="2.5" />
                  <circle cx={CX} cy={CY} r={R} fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="4 4" opacity="0.7" />

                  {/* Tangent Axis (Vertical at x = 1 -> X = CX + R = 260) */}
                  {showTanCot && (
                    <g opacity="0.85">
                      <line x1={tanX} y1={20} x2={tanX} y2={300} stroke="#9333ea" strokeWidth="2" strokeDasharray="3 3" />
                      <text x={tanX + 5} y={35} fill="#7e22ce" fontSize="10" fontWeight="bold">Trục tan</text>
                    </g>
                  )}

                  {/* Cotangent Axis (Horizontal at y = 1 -> Y = CY - R = 60) */}
                  {showTanCot && (
                    <g opacity="0.85">
                      <line x1={20} y1={cotY} x2={300} y2={cotY} stroke="#d97706" strokeWidth="2" strokeDasharray="3 3" />
                      <text x={280} y={cotY - 6} fill="#b45309" fontSize="10" fontWeight="bold">Trục cot</text>
                    </g>
                  )}

                  {/* Cosine Axis (X-axis, Sky Blue) */}
                  <line x1={15} y1={CY} x2={305} y2={CY} stroke="#0284c7" strokeWidth="2.5" />
                  <polygon points="305,156 315,160 305,164" fill="#0284c7" />
                  <text x={298} y={150} fill="#0369a1" fontSize="11" fontWeight="bold">cos (x)</text>

                  {/* Sine Axis (Y-axis, Coral Red) */}
                  <line x1={CX} y1={305} x2={CX} y2={15} stroke="#e11d48" strokeWidth="2.5" />
                  <polygon points="156,15 160,5 164,15" fill="#e11d48" />
                  <text x={168} y={20} fill="#be123c" fontSize="11" fontWeight="bold">sin (y)</text>

                  {/* Ticks on axes */}
                  <text x={CX + R} y={CY + 15} fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle">+1</text>
                  <text x={CX - R} y={CY + 15} fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle">-1</text>
                  <text x={CX - 10} y={CY - R + 4} fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="end">+1</text>
                  <text x={CX - 10} y={CY + R + 4} fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="end">-1</text>

                  {/* Angle Arc from 0 to theta */}
                  {angleDeg > 0 && (
                    <path
                      d={`M ${CX + 28},${CY} A 28,28 0 ${angleDeg > 180 ? 1 : 0},0 ${CX + 28 * Math.cos(rad)},${CY - 28 * Math.sin(rad)}`}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                    />
                  )}
                  <text
                    x={CX + 38 * Math.cos(rad / 2)}
                    y={CY - 38 * Math.sin(rad / 2) + 4}
                    fill="#b45309"
                    fontSize="10"
                    fontWeight="extrabold"
                    textAnchor="middle"
                  >
                    {Math.round(normalizedDeg)}°
                  </text>

                  {/* Shaded Projection Right Triangle */}
                  {showAxesDetails && (
                    <polygon
                      points={`${CX},${CY} ${px},${CY} ${px},${py}`}
                      fill="url(#triangleGradLight)"
                      stroke="#6366f1"
                      strokeWidth="1.5"
                      strokeDasharray="3 2"
                    />
                  )}

                  {/* Tangent Projection Line to tan axis */}
                  {showTanCot && tanVal !== null && Math.abs(tanVal) <= 2.5 && (
                    <g>
                      <line x1={CX} y1={CY} x2={tanX} y2={tanY} stroke="#9333ea" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
                      <circle cx={tanX} cy={tanY} r="4.5" fill="#7e22ce" />
                      <text x={tanX + 6} y={tanY + 4} fill="#6b21a8" fontSize="9" fontWeight="bold">
                        T(1, {tanVal.toFixed(2)})
                      </text>
                    </g>
                  )}

                  {/* Cotangent Projection Line to cot axis */}
                  {showTanCot && cotVal !== null && Math.abs(cotVal) <= 2.5 && (
                    <g>
                      <line x1={CX} y1={CY} x2={cotX} y2={cotY} stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
                      <circle cx={cotX} cy={cotY} r="4.5" fill="#b45309" />
                      <text x={cotX} y={cotY - 6} fill="#92400e" fontSize="9" fontWeight="bold" textAnchor="middle">
                        C({cotVal.toFixed(2)}, 1)
                      </text>
                    </g>
                  )}

                  {/* Projection Lines to Cosine and Sine axes */}
                  {showAxesDetails && (
                    <>
                      {/* Vertical line from M to cos-axis (shows sin length) */}
                      <line x1={px} y1={py} x2={px} y2={CY} stroke="#e11d48" strokeWidth="2.5" strokeDasharray="3 2" />
                      {/* Horizontal line from M to sin-axis (shows cos length) */}
                      <line x1={px} y1={py} x2={CX} y2={py} stroke="#0284c7" strokeWidth="2.5" strokeDasharray="3 2" />

                      {/* Adjacent side (cos) along x-axis */}
                      <line x1={CX} y1={CY} x2={px} y2={CY} stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
                      {/* Opposite side (sin) vertical */}
                      <line x1={px} y1={CY} x2={px} y2={py} stroke="#e11d48" strokeWidth="4" strokeLinecap="round" />

                      {/* Right angle marker at (px, CY) */}
                      <rect
                        x={cosVal >= 0 ? px - 7 : px}
                        y={sinVal >= 0 ? CY - 7 : CY}
                        width="7"
                        height="7"
                        fill="none"
                        stroke="#64748b"
                        strokeWidth="1"
                      />
                    </>
                  )}

                  {/* Hypotenuse Vector OM (Radius R = 1) */}
                  <line x1={CX} y1={CY} x2={px} y2={py} stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round" />

                  {/* Origin Point O(0,0) */}
                  <circle cx={CX} cy={CY} r="4" fill="#1e293b" />
                  <text x={CX - 12} y={CY + 14} fill="#475569" fontSize="10" fontWeight="extrabold">O</text>

                  {/* Moving Point M(cos α, sin α) */}
                  <circle cx={px} cy={py} r="8" fill="#0284c7" filter="url(#glow-circle-cyan)" />
                  <circle cx={px} cy={py} r="4.5" fill="#ffffff" />
                  <text
                    x={px + (cosVal >= 0 ? 10 : -10)}
                    y={py + (sinVal >= 0 ? -10 : 16)}
                    fill="#0f172a"
                    fontSize="11"
                    fontWeight="900"
                    textAnchor={cosVal >= 0 ? 'start' : 'end'}
                    className="drop-shadow-xs"
                  >
                    M({cosVal.toFixed(2)}, {sinVal.toFixed(2)})
                  </text>
                </svg>
              </div>

              {/* Slider & Control Toolbar */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between gap-3">
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
                        setAngleDeg(0)
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
                    <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 text-xs font-black border border-amber-300">
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
                    setAngleDeg(parseInt(e.target.value, 10))
                    setIsPlaying(false)
                  }}
                  className="w-full accent-brand-500 cursor-pointer h-2.5 bg-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* ── RIGHT: VALUE CARDS & MEE CAT TIPS (5 cols) ── */}
            <div className="lg:col-span-5 flex flex-col gap-3.5">
              {/* 🔴 CARD 1: SINE (ĐỘ CAO ĐỨNG) */}
              <div className="rounded-2xl bg-rose-50 border-2 border-rose-200/90 p-3.5 shadow-sm">
                <div className="flex items-center justify-between text-xs font-extrabold text-rose-800">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-rose-500" />
                    <AsmoFormula text="🔴 Trục đứng $\sin(\alpha)$ (Chiều cao):" />
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-rose-200/60 font-mono text-[11px]">
                    Dấu: {sinVal >= 0 ? '+' : '−'}
                  </span>
                </div>
                <div className="mt-1.5 flex items-baseline justify-between gap-2">
                  <div className="text-lg font-black text-rose-700 font-mono">
                    <AsmoFormula
                      text={`$\\sin(${Math.round(normalizedDeg)}^\\circ) = ${matchedSpecial ? matchedSpecial.sinExact : sinVal.toFixed(4)}$`}
                    />
                  </div>
                  <div className="text-xs font-bold text-rose-600 font-mono">
                    ≈ {sinVal.toFixed(3)}
                  </div>
                </div>
                <div className="text-[11px] text-rose-600/80 mt-1 font-medium">
                  <AsmoFormula text="Độ cao đứng của điểm $M$ so với trục hoành" />
                </div>
              </div>

              {/* 🔵 CARD 2: COSINE (ĐỘ RỘNG NGANG) */}
              <div className="rounded-2xl bg-sky-50 border-2 border-sky-200/90 p-3.5 shadow-sm">
                <div className="flex items-center justify-between text-xs font-extrabold text-sky-800">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-sky-500" />
                    <AsmoFormula text="🔵 Trục ngang $\cos(\alpha)$ (Độ rộng):" />
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-sky-200/60 font-mono text-[11px]">
                    Dấu: {cosVal >= 0 ? '+' : '−'}
                  </span>
                </div>
                <div className="mt-1.5 flex items-baseline justify-between gap-2">
                  <div className="text-lg font-black text-sky-700 font-mono">
                    <AsmoFormula
                      text={`$\\cos(${Math.round(normalizedDeg)}^\\circ) = ${matchedSpecial ? matchedSpecial.cosExact : cosVal.toFixed(4)}$`}
                    />
                  </div>
                  <div className="text-xs font-bold text-sky-600 font-mono">
                    ≈ {cosVal.toFixed(3)}
                  </div>
                </div>
                <div className="text-[11px] text-sky-600/80 mt-1 font-medium">
                  <AsmoFormula text="Độ rộng ngang từ gốc $O$ đến hình chiếu của $M$" />
                </div>
              </div>

              {/* 🟣 CARD 3: TANGENT & COTANGENT (GRID 2 COLS) */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-2xl bg-purple-50 border-2 border-purple-200/80 p-3 shadow-xs">
                  <div className="text-[11px] font-extrabold text-purple-800">
                    <AsmoFormula text="$\tan(\alpha) = \frac{\sin}{\cos}$:" />
                  </div>
                  <div className="mt-1 font-mono font-black text-purple-900 text-sm truncate">
                    {tanVal !== null ? (
                      <AsmoFormula text={`$${matchedSpecial ? matchedSpecial.tanExact : tanVal.toFixed(3)}$`} />
                    ) : (
                      <span className="text-xs text-rose-600">Không XĐ</span>
                    )}
                  </div>
                  <div className="text-[10px] text-purple-600/80 font-mono mt-0.5">
                    {tanVal !== null ? `≈ ${tanVal.toFixed(3)}` : 'Góc 90°, 270°'}
                  </div>
                </div>

                <div className="rounded-2xl bg-amber-50 border-2 border-amber-200/80 p-3 shadow-xs">
                  <div className="text-[11px] font-extrabold text-amber-800">
                    <AsmoFormula text="$\cot(\alpha) = \frac{\cos}{\sin}$:" />
                  </div>
                  <div className="mt-1 font-mono font-black text-amber-900 text-sm truncate">
                    {cotVal !== null ? (
                      <AsmoFormula text={`$${matchedSpecial ? matchedSpecial.cotExact : cotVal.toFixed(3)}$`} />
                    ) : (
                      <span className="text-xs text-rose-600">Không XĐ</span>
                    )}
                  </div>
                  <div className="text-[10px] text-amber-600/80 font-mono mt-0.5">
                    {cotVal !== null ? `≈ ${cotVal.toFixed(3)}` : 'Góc 0°, 180°'}
                  </div>
                </div>
              </div>

              {/* 🐱 MEE CAT SECRET TIP CARD */}
              <div className="rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-200 p-3.5 shadow-sm flex items-start gap-2.5">
                <div className="text-xl shrink-0">🐱</div>
                <div className="text-xs text-slate-800 leading-relaxed">
                  <span className="font-extrabold text-amber-900 block mb-0.5">
                    Bí kíp Mèo Mee ghi nhớ nhanh:
                  </span>
                  <span>
                    <strong>"Sin đứng, Cos nằm"</strong> ·{' '}
                    <strong>Nhất cả (+,+), Nhì sin (-,+), Tam tan (-,-), Tứ cos (+,-)</strong>
                  </span>
                </div>
              </div>

              {/* 🟢 PYTHAGORAS IDENTITY VERIFICATION */}
              <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-3 border-2 border-emerald-200 text-xs shadow-xs">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span className="font-extrabold text-emerald-900">
                    Hằng đẳng thức Pythagoras:
                  </span>
                </div>
                <div className="font-mono font-black text-emerald-800 text-xs sm:text-sm">
                  <AsmoFormula text="$\sin^2 + \cos^2 = 1.000 \equiv 1$" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: SÓNG LƯỢNG GIÁC (WAVE GRAPHER) ── */}
      {activeTab === 'wave' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-3xl bg-slate-50/70 p-5 border-2 border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-sky-100 border border-sky-300 text-sky-700 flex items-center justify-center">
                  <Waves className="size-4.5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Máy Vẽ Sóng Lượng Giác Đồng Bộ (Wave Grapher)
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Quan sát đường tròn đơn vị mở rộng thành đồ thị hình sin & cos theo thời gian
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
                  <span className="size-2.5 rounded-full bg-rose-500 inline-block" />
                  <AsmoFormula text="$\sin(x)$ (Đỏ san hô)" />
                </span>
                <span className="inline-flex items-center gap-1.5 font-extrabold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-200">
                  <span className="size-2.5 rounded-full bg-sky-500 inline-block" />
                  <AsmoFormula text="$\cos(x)$ (Xanh dương)" />
                </span>
              </div>
            </div>

            {/* Wave SVG Graph */}
            <div className="w-full bg-white rounded-2xl p-3 border-2 border-slate-200 shadow-inner">
              <svg viewBox="0 0 360 150" className="w-full h-44 sm:h-52 select-none font-sans">
                {/* Grid Lines */}
                <line x1="25" y1="75" x2="345" y2="75" stroke="#cbd5e1" strokeWidth="2" />
                <line x1="25" y1="25" x2="345" y2="25" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="25" y1="125" x2="345" y2="125" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="3 3" />

                {/* Y Axis Labels */}
                <text x="12" y="29" fill="#64748b" fontSize="10" fontWeight="bold">+1</text>
                <text x="14" y="79" fill="#64748b" fontSize="10" fontWeight="bold">0</text>
                <text x="12" y="129" fill="#64748b" fontSize="10" fontWeight="bold">-1</text>

                {/* X Axis Radian Ticks */}
                <text x="25" y="93" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle">0</text>
                <text x="105" y="93" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle">π/2</text>
                <text x="185" y="93" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle">π</text>
                <text x="265" y="93" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle">3π/2</text>
                <text x="345" y="93" fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle">2π</text>

                {/* Cosine Wave (Sky Blue) */}
                <path
                  d={Array.from({ length: 321 }).reduce((acc: string, _, i) => {
                    const deg = i * (360 / 320)
                    const x = 25 + i
                    const y = 75 - 50 * Math.cos((deg * Math.PI) / 180)
                    return i === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`
                  }, '')}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="3"
                />

                {/* Sine Wave (Rose Coral) */}
                <path
                  d={Array.from({ length: 321 }).reduce((acc: string, _, i) => {
                    const deg = i * (360 / 320)
                    const x = 25 + i
                    const y = 75 - 50 * Math.sin((deg * Math.PI) / 180)
                    return i === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`
                  }, '')}
                  fill="none"
                  stroke="#e11d48"
                  strokeWidth="3"
                />

                {/* Synchronized Tracking Cursor at normalizedDeg */}
                {(() => {
                  const cursorX = 25 + (normalizedDeg / 360) * 320
                  const cursorSinY = 75 - 50 * sinVal
                  const cursorCosY = 75 - 50 * cosVal
                  return (
                    <g>
                      {/* Vertical Tracking Line */}
                      <line x1={cursorX} y1={15} x2={cursorX} y2={135} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
                      {/* Sine Wave Cursor Point */}
                      <circle cx={cursorX} cy={cursorSinY} r="6" fill="#e11d48" />
                      <circle cx={cursorX} cy={cursorSinY} r="3" fill="#ffffff" />
                      {/* Cosine Wave Cursor Point */}
                      <circle cx={cursorX} cy={cursorCosY} r="6" fill="#0284c7" />
                      <circle cx={cursorX} cy={cursorCosY} r="3" fill="#ffffff" />
                    </g>
                  )
                })()}
              </svg>
            </div>

            {/* Slider Controls for Wave */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
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
                  <span>{isPlaying ? 'Tạm Dừng' : 'Chạy Quét Sóng'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAngleDeg(0)
                    setIsPlaying(false)
                  }}
                  className="p-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 transition-all cursor-pointer"
                  title="Đặt lại về 0°"
                >
                  <RotateCcw className="size-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <div className="text-slate-600 font-bold">
                  <AsmoFormula text={`Góc $x = ${Math.round(normalizedDeg)}^\\circ$ (${(rad / Math.PI).toFixed(2)}\\pi\\text{ rad})`} />
                </div>
                <span className="font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                  sin(x) = {sinVal.toFixed(3)}
                </span>
                <span className="font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                  cos(x) = {cosVal.toFixed(3)}
                </span>
              </div>
            </div>

            {/* Wave Characteristics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="rounded-2xl bg-white border border-slate-200 p-3 shadow-xs text-xs">
                <span className="font-extrabold text-slate-700 block mb-1">
                  🔄 Chu Kỳ Tuần Hoàn:
                </span>
                <div className="text-slate-600">
                  <AsmoFormula text="$T = 2\pi$ ($360^\circ$). Sau mỗi $2\pi$, dạng sóng lặp lại hoàn toàn như cũ." />
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-3 shadow-xs text-xs">
                <span className="font-extrabold text-slate-700 block mb-1">
                  ↕️ Biên Độ Dao Động:
                </span>
                <div className="text-slate-600">
                  <AsmoFormula text="$A = 1$. Giá trị cực đại $+1$ và cực tiểu $-1$." />
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-3 shadow-xs text-xs">
                <span className="font-extrabold text-slate-700 block mb-1">
                  ↔️ Độ Lệch Pha:
                </span>
                <div className="text-slate-600">
                  <AsmoFormula text="$\cos(x) = \sin(x + \frac{\pi}{2})$ (sớm pha hơn $\sin(x)$ góc $90^\circ$)." />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: CÔNG THỨC NHÂN ĐÔI & BÀI TOÁN LỚP 11 ── */}
      {activeTab === 'formula' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-3xl bg-slate-50/70 p-5 border-2 border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <div className="size-8 rounded-xl bg-brand-100 border border-brand-300 text-brand-700 flex items-center justify-center">
                <Calculator className="size-4.5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Bảng Công Thức Lượng Giác & Bài Toán Mẫu Lớp 11
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Hệ thống công thức nhân đôi trọng tâm và phân tích phương pháp giải 3 bước
                </p>
              </div>
            </div>

            {/* Core Double Angle Formulas Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white border-2 border-amber-200 p-3.5 shadow-xs space-y-1.5">
                <span className="font-extrabold text-amber-900 text-xs block uppercase tracking-wider">
                  <AsmoFormula text="⭐ Công thức $\cos(2x)$" />
                </span>
                <div className="text-xs text-slate-800 space-y-1 font-mono">
                  <AsmoFormula text="• $\cos(2x) = 1 - 2\sin^2(x)$" />
                  <AsmoFormula text="• $\cos(2x) = 2\cos^2(x) - 1$" />
                  <AsmoFormula text="• $\cos(2x) = \cos^2(x) - \sin^2(x)$" />
                </div>
              </div>

              <div className="rounded-2xl bg-white border-2 border-rose-200 p-3.5 shadow-xs space-y-1.5">
                <span className="font-extrabold text-rose-900 text-xs block uppercase tracking-wider">
                  <AsmoFormula text="⭐ Công thức $\sin(2x)$" />
                </span>
                <div className="text-xs text-slate-800 space-y-1 font-mono">
                  <AsmoFormula text="• $\sin(2x) = 2\sin(x)\cos(x)$" />
                  <AsmoFormula text="• $\sin(x)\cos(x) = \frac{1}{2}\sin(2x)$" />
                </div>
              </div>

              <div className="rounded-2xl bg-white border-2 border-purple-200 p-3.5 shadow-xs space-y-1.5">
                <span className="font-extrabold text-purple-900 text-xs block uppercase tracking-wider">
                  <AsmoFormula text="⭐ Công thức $\tan(2x)$" />
                </span>
                <div className="text-xs text-slate-800 space-y-1 font-mono">
                  <AsmoFormula text="• $\tan(2x) = \frac{2\tan(x)}{1 - \tan^2(x)}$" />
                </div>
              </div>
            </div>

            {/* Exemplar Problem Breakdown Card */}
            <div className="rounded-2xl bg-white border-2 border-brand-200 p-4 shadow-sm space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="font-black text-brand-800 text-xs sm:text-sm">
                  <AsmoFormula text="📘 Bài Toán Mẫu Lớp 11: Cho $\sin(x) = \frac{1}{3}$, Tính $\cos(2x)$" />
                </span>
                <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-[11px] font-black text-amber-900 border border-amber-300">
                  Đáp số: 7/9
                </span>
              </div>

              <div className="space-y-2 text-slate-700 leading-relaxed">
                <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-black text-brand-700 shrink-0 bg-brand-100 px-2 py-0.5 rounded-md text-[11px]">
                    B1 (Phân tích)
                  </span>
                  <div>
                    <AsmoFormula text="Xác định công thức liên hệ trực tiếp không cần qua $\cos(x)$: $\cos(2x) = 1 - 2\sin^2(x)$." />
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-black text-brand-700 shrink-0 bg-brand-100 px-2 py-0.5 rounded-md text-[11px]">
                    B2 (Thay số)
                  </span>
                  <div>
                    <AsmoFormula text="Thay $\sin(x) = \frac{1}{3} \Rightarrow \cos(2x) = 1 - 2 \cdot \left(\frac{1}{3}\right)^2 = 1 - 2 \cdot \frac{1}{9} = 1 - \frac{2}{9}$." />
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-black text-emerald-700 shrink-0 bg-emerald-100 px-2 py-0.5 rounded-md text-[11px]">
                    B3 (Kết luận)
                  </span>
                  <div>
                    <AsmoFormula text="Quy đồng và kết luận: $\cos(2x) = \frac{7}{9} \approx 0.778$." />
                  </div>
                </div>
              </div>

              {/* Interactive Sandbox Slider */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">
                    🔬 Thử nghiệm kéo thay đổi giá trị $\sin(x)$:
                  </span>
                  <div className="font-mono text-brand-800 font-extrabold bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-200">
                    <AsmoFormula text={`$\\sin(x) = ${demoSinVal.toFixed(2)}$ ➔ $\\cos(2x) = ${computedCos2x.toFixed(3)}$`} />
                  </div>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="1"
                  value={Math.round(demoSinVal * 100)}
                  onChange={(e) => setDemoSinVal(parseInt(e.target.value, 10) / 100)}
                  className="w-full accent-brand-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>-1.00</span>
                  <span>0.00</span>
                  <span>+1.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER BAR ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 pt-3 border-t border-slate-200">
        <span className="inline-flex items-center gap-1.5 text-brand-700 font-bold">
          <Sparkles className="size-3.5 text-amber-500" />
          Phòng Thí Nghiệm Đồ Họa Lượng Giác Chuẩn Olympic ASMO & Sách Giáo Khoa Mới
        </span>
        <span className="font-mono text-slate-400 text-[11px]">
          KaTeX Mathematical Typography + SVG 360°
        </span>
      </div>
    </div>
  )
}
