import { useState, useMemo } from 'react'
import { AsmoFormula } from './AsmoFormula'
import { AsmoTrigLabVisualizer } from './AsmoTrigLabVisualizer'
import { AsmoKidsArithmeticVisualizer } from './AsmoKidsArithmeticVisualizer'
import {
  Sparkles,
  Compass,
  Calculator,
  RotateCcw,
  CheckCircle2,
  Box,
  Layers,
  Zap,
  Lightbulb,
  Maximize2,
  Share2,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export type AsmoMathVisualizerProps = {
  topicId: string
  level: 1 | 2 | 3
  className?: string
  externalAngle?: number
  externalTab?: 'diagram' | 'formula' | 'circle' | 'wave'
  highlightTarget?: string | null
  activeAction?: string | null
  onAngleChange?: (deg: number) => void
  demoSinValue?: number
}

export function AsmoMathVisualizer({
  topicId,
  level,
  className,
  externalAngle,
  externalTab,
  highlightTarget,
  activeAction,
  onAngleChange,
  demoSinValue,
}: AsmoMathVisualizerProps) {
  const [activeTab, setActiveTab] = useState<'diagram' | 'formula'>(
    externalTab === 'formula' ? 'formula' : 'diagram',
  )

  // ── TOPIC SPECIFIC LOCAL STATES ──
  // Pythagoras state
  const [pythSideA, setPythSideA] = useState<number>(level === 1 ? 6 : level === 2 ? 3 : 9)
  const [pythSideB, setPythSideB] = useState<number>(level === 1 ? 8 : level === 2 ? 4 : 12)

  // Number theory power base
  const [numPowerBase, setNumPowerBase] = useState<number>(2)

  // Dice target sum
  const [diceTargetSum, setDiceTargetSum] = useState<number>(7)

  // 1. Elementary Arithmetic -> Render AsmoKidsArithmeticVisualizer
  if (
    topicId === 'elementary-arithmetic' ||
    topicId === 'elem-addition' ||
    topicId === 'elem-subtraction' ||
    topicId === 'elem-multiplication' ||
    topicId === 'elem-division'
  ) {
    return <AsmoKidsArithmeticVisualizer topicId={topicId} level={level} className={className} />
  }

  // 2. Trigonometry -> Render AsmoTrigLabVisualizer with interactive lab props
  if (topicId === 'trigonometry') {
    return (
      <AsmoTrigLabVisualizer
        level={level}
        initialAngle={level === 1 ? 150 : level === 2 ? 30 : 7.5}
        externalAngle={externalAngle}
        externalTab={externalTab as 'circle' | 'wave' | 'formula'}
        highlightTarget={highlightTarget as any}
        onAngleChange={onAngleChange}
        demoSinValue={demoSinValue}
        className={className}
      />
    )
  }

  // Pythagoras calculations
  const pythC = Math.sqrt(pythSideA * pythSideA + pythSideB * pythSideB)
  const pythAltitude = (pythSideA * pythSideB) / pythC

  return (
    <div
      className={cn(
        'relative w-full rounded-3xl bg-white border-2 border-brand-200 shadow-clay p-4 sm:p-6 text-slate-800 flex flex-col justify-between min-h-[420px] transition-all',
        className,
      )}
    >
      {/* ── TOP BAR: TOPIC HEADER & TAB SWITCHER ── */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-xs">
            <Compass className="size-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-indigo-950 uppercase tracking-wider">
                Mô Phỏng Toán Học Tương Tác
              </span>
              <span className="inline-flex items-center rounded-full bg-brand-50 border border-brand-200 px-2 py-0.2 text-[10px] font-black text-brand-700">
                Level {level}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold">
              Chuyên đề ASMO: <strong className="text-slate-700">{topicId}</strong>
            </span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('diagram')}
            className={cn(
              'px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer select-none',
              activeTab === 'diagram'
                ? 'bg-white text-indigo-900 shadow-sm ring-1 ring-indigo-200'
                : 'text-slate-600 hover:text-slate-900',
            )}
          >
            Đồ thị &amp; Hình học
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('formula')}
            className={cn(
              'px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer select-none',
              activeTab === 'formula'
                ? 'bg-white text-indigo-900 shadow-sm ring-1 ring-indigo-200'
                : 'text-slate-600 hover:text-slate-900',
            )}
          >
            Công thức KaTeX
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col justify-center my-1 space-y-3">
        {activeTab === 'diagram' ? (
          <div className="w-full flex flex-col items-center justify-center space-y-3">
            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* 1. ALGEBRA & VIÈTE (ĐẠI SỐ VIÈTE & PHƯƠNG TRÌNH BẬC HAI)          */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {topicId === 'algebra-viete' && (
              <div className="w-full space-y-3">
                {/* Full-Column Big SVG Diagram */}
                <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                  <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                    <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                      <span className="size-2 rounded-full bg-indigo-600" />
                      Đồ thị Parabol $y = x^2 - 5x + 3$ &amp; Toạ độ Nghiệm Viète
                    </span>
                    <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                      $\Delta = 13 &gt; 0$ (2 nghiệm)
                    </span>
                  </div>

                  <svg viewBox="0 0 460 200" className="w-full max-h-52 select-none font-sans">
                    <defs>
                      <linearGradient id="vieteParabolaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>

                    {/* Coordinate Grid Lines */}
                    <line x1="30" y1="140" x2="430" y2="140" stroke="#cbd5e1" strokeWidth="2" />
                    <line x1="90" y1="15" x2="90" y2="185" stroke="#cbd5e1" strokeWidth="2" />
                    {/* Axis Arrows */}
                    <polygon points="430,136 440,140 430,144" fill="#64748b" />
                    <polygon points="86,15 90,5 94,15" fill="#64748b" />
                    <text x="432" y="156" fill="#475569" fontSize="12" fontWeight="bold">x</text>
                    <text x="72" y="18" fill="#475569" fontSize="12" fontWeight="bold">y</text>
                    <text x="76" y="154" fill="#64748b" fontSize="11" fontWeight="bold">O</text>

                    {/* Axis of Symmetry x = 2.5 (X = 230) */}
                    <line x1="230" y1="20" x2="230" y2="180" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 3" />
                    <text x="235" y="32" fill="#7e22ce" fontSize="10" fontWeight="bold">Trục đối xứng x = S/2 = 2.5</text>

                    {/* Shaded Area under parabola between roots */}
                    <path
                      d="M 125,140 Q 230,235 335,140 Z"
                      fill="url(#vieteParabolaGrad)"
                    />

                    {/* Parabola Curve y = x^2 - 5x + 3 */}
                    <path
                      d="M 70,30 Q 230,240 390,30"
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Root x1 (cx=125, cy=140) */}
                    <line x1="125" y1="135" x2="125" y2="145" stroke="#e11d48" strokeWidth="2" />
                    <circle cx="125" cy="140" r="5.5" fill="#e11d48" />
                    <text x="115" y="160" fill="#be123c" fontSize="12" fontWeight="extrabold">x₁ ≈ 0.70</text>

                    {/* Root x2 (cx=335, cy=140) */}
                    <line x1="335" y1="135" x2="335" y2="145" stroke="#059669" strokeWidth="2" />
                    <circle cx="335" cy="140" r="5.5" fill="#059669" />
                    <text x="325" y="160" fill="#047857" fontSize="12" fontWeight="extrabold">x₂ ≈ 4.30</text>

                    {/* Vertex I(2.5, -3.25) -> cx=230, cy=172 */}
                    <circle cx="230" cy="172" r="5" fill="#f59e0b" />
                    <text x="238" y="185" fill="#b45309" fontSize="11" fontWeight="bold">Đỉnh I(2.5, -3.25)</text>

                    {/* y-intercept (0, 3) -> cx=90, cy=105 */}
                    <circle cx="90" cy="105" r="4" fill="#0284c7" />
                    <text x="96" y="108" fill="#0369a1" fontSize="10" fontWeight="bold">c = 3 (Tung độ gốc)</text>
                  </svg>
                </div>

                {/* 1-Line Mee Cat Ribbon (~32px) */}
                <div className="rounded-xl bg-amber-50/90 border border-amber-200 px-3 py-1.5 text-xs text-amber-900 flex items-center justify-between gap-2 shadow-2xs flex-wrap">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="text-sm">🐱</span>
                    <span className="font-extrabold text-amber-950">Bí kíp Mèo Mee:</span>
                    <span>
                      <strong>"S = -b/a (Tổng), P = c/a (Tích)"</strong> · Đưa mọi biểu thức đối xứng về S và P không cần tính nghiệm lẻ!
                    </span>
                  </div>
                  <div className="text-[11px] font-mono font-bold text-amber-900 bg-white/90 px-2 py-0.5 rounded-lg border border-amber-200 shrink-0">
                    <AsmoFormula text="$x_1^2 + x_2^2 = S^2 - 2P = 5^2 - 2(3) = 19$" />
                  </div>
                </div>

                {/* KaTeX 2-Column Grid Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div
                    className={cn(
                      'rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/70 border-2 border-indigo-200 p-4 shadow-sm transition-all',
                      activeAction?.includes('viete') || highlightTarget === 'viete'
                        ? 'ring-4 ring-indigo-300 border-indigo-500 scale-[1.01]'
                        : 'hover:border-indigo-300',
                    )}
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-indigo-900 mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-indigo-600 animate-pulse" />
                        Hệ Thức Viète Cơ Bản ($S$ &amp; $P$)
                      </span>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-indigo-200 text-indigo-700">
                        a = 1, b = -5, c = 3
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="font-bold text-emerald-800 bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                        <AsmoFormula text="• Tổng 2 nghiệm: $S = x_1 + x_2 = -\frac{b}{a} = 5$" />
                      </div>
                      <div className="font-bold text-amber-800 bg-amber-50/80 p-2 rounded-xl border border-amber-200">
                        <AsmoFormula text="• Tích 2 nghiệm: $P = x_1 \cdot x_2 = \frac{c}{a} = 3$" />
                      </div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/70 border-2 border-emerald-200 p-4 shadow-sm transition-all',
                      activeAction?.includes('viete') || highlightTarget === 'viete'
                        ? 'ring-4 ring-emerald-300 border-emerald-500 scale-[1.01]'
                        : 'hover:border-emerald-300',
                    )}
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-emerald-900 mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-emerald-600 animate-pulse" />
                        Biến Đổi Đối Xứng Chuẩn Olympic
                      </span>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-emerald-200 text-emerald-700">
                        S = x₁ + x₂ = 5
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="bg-white/90 p-2 rounded-xl border border-emerald-200 font-mono text-emerald-900 font-bold">
                        <AsmoFormula text="$x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1 x_2 = S^2 - 2P = 25 - 6 = 19$" />
                      </div>
                      <div className="bg-white/90 p-2 rounded-xl border border-emerald-200 font-mono text-indigo-900 font-bold">
                        <AsmoFormula text="$\frac{x_1}{x_2} + \frac{x_2}{x_1} = \frac{S^2 - 2P}{P} = \frac{3^2 - 2(0.5)}{0.5} = 16$" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* 2. PYTHAGORAS & GEOMETRY (HÌNH HỌC PYTAGO & TAM GIÁC VUÔNG)        */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {topicId === 'pythagoras-geometry' && (
              <div className="w-full space-y-3">
                {/* Full-Column Big SVG Diagram */}
                <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                  <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                    <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                      <span className="size-2 rounded-full bg-indigo-600" />
                      Mô Hình Hình Học Tam Giác Vuông &amp; Đường Cao $h$
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      $a^2 + b^2 = c^2$ ({pythSideA}² + {pythSideB}² = {pythC.toFixed(0)}²)
                    </span>
                  </div>

                  <svg viewBox="0 0 460 210" className="w-full max-h-52 select-none font-sans">
                    <defs>
                      <linearGradient id="pythTriGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#c084fc" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>

                    {/* Right Triangle: C at (80, 160), B at (360, 160), A at (80, 40) */}
                    <polygon
                      points="80,160 360,160 80,40"
                      fill="url(#pythTriGrad)"
                      stroke="#4f46e5"
                      strokeWidth="3"
                    />

                    {/* Right angle symbol at C(80, 160) */}
                    <rect x="80" y="142" width="18" height="18" fill="none" stroke="#f59e0b" strokeWidth="2" />
                    <circle cx="89" cy="151" r="2.5" fill="#f59e0b" />

                    {/* Side a (Vertical AC: a = pythSideA cm) */}
                    <line x1="80" y1="160" x2="80" y2="40" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
                    <text x="65" y="105" fill="#0369a1" fontSize="13" fontWeight="900" textAnchor="end">
                      a = {pythSideA} cm
                    </text>

                    {/* Side b (Horizontal CB: b = pythSideB cm) */}
                    <line x1="80" y1="160" x2="360" y2="160" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
                    <text x="220" y="184" fill="#0369a1" fontSize="13" fontWeight="900" textAnchor="middle">
                      Cạnh góc vuông b = {pythSideB} cm
                    </text>

                    {/* Hypotenuse c (AB: c = pythC cm) */}
                    <line x1="80" y1="40" x2="360" y2="160" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
                    <text x="235" y="90" fill="#b45309" fontSize="14" fontWeight="900">
                      c = {pythC.toFixed(1)} cm
                    </text>

                    {/* Altitude CH: from (80,160) perpendicular to AB */}
                    <line x1="80" y1="160" x2="142" y2="67" stroke="#e11d48" strokeWidth="2.5" strokeDasharray="4 3" />
                    <circle cx="142" cy="67" r="4" fill="#e11d48" />
                    <text x="120" y="125" fill="#be123c" fontSize="11" fontWeight="bold">
                      h = {pythAltitude.toFixed(1)} cm
                    </text>

                    {/* Vertices Labels */}
                    <text x="75" y="32" fill="#1e293b" fontSize="12" fontWeight="bold">A</text>
                    <text x="65" y="172" fill="#1e293b" fontSize="12" fontWeight="bold">C (90°)</text>
                    <text x="370" y="165" fill="#1e293b" fontSize="12" fontWeight="bold">B</text>
                  </svg>
                </div>

                {/* 1-Line Mee Cat Ribbon (~32px) */}
                <div className="rounded-xl bg-amber-50/90 border border-amber-200 px-3 py-1.5 text-xs text-amber-900 flex items-center justify-between gap-2 shadow-2xs flex-wrap">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="text-sm">🐱</span>
                    <span className="font-extrabold text-amber-950">Bí kíp Mèo Mee:</span>
                    <span>
                      <strong>"Bộ ba Pytago vàng: (3,4,5), (5,12,13), (6,8,10), (9,12,15)"</strong> · Đường cao h = (a × b)/c
                    </span>
                  </div>
                  <div className="text-[11px] font-mono font-bold text-amber-900 bg-white/90 px-2 py-0.5 rounded-lg border border-amber-200 shrink-0">
                    <AsmoFormula text={`$c = \\sqrt{${pythSideA}^2 + ${pythSideB}^2} = ${pythC.toFixed(0)}\\text{ cm}$`} />
                  </div>
                </div>

                {/* KaTeX 2-Column Grid Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div
                    className={cn(
                      'rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/70 border-2 border-indigo-200 p-4 shadow-sm transition-all',
                      activeAction?.includes('pyth') || highlightTarget === 'pythagoras'
                        ? 'ring-4 ring-indigo-300 border-indigo-500 scale-[1.01]'
                        : 'hover:border-indigo-300',
                    )}
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-indigo-900 mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-indigo-600 animate-pulse" />
                        Định Lý Pytago Thuận &amp; Cạnh Huyền
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setPythSideA((prev) => (prev === 6 ? 9 : prev === 9 ? 3 : 6))
                            setPythSideB((prev) => (prev === 8 ? 12 : prev === 12 ? 4 : 8))
                          }}
                          className="px-2 py-0.5 bg-white text-indigo-700 rounded-md border border-indigo-200 text-[10px] font-bold hover:bg-indigo-50 cursor-pointer"
                        >
                          Đổi Bộ Ba ⟳
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="bg-white/90 p-2 rounded-xl border border-indigo-200 font-mono text-indigo-900 font-bold">
                        <AsmoFormula text={`$c^2 = a^2 + b^2 = ${pythSideA}^2 + ${pythSideB}^2 = ${pythSideA * pythSideA + pythSideB * pythSideB}$`} />
                      </div>
                      <div className="bg-emerald-50/90 p-2 rounded-xl border border-emerald-200 font-mono text-emerald-900 font-bold">
                        <AsmoFormula text={`$\\Rightarrow c = \\sqrt{${pythSideA * pythSideA + pythSideB * pythSideB}} = ${pythC.toFixed(1)}\\text{ cm}$`} />
                      </div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/70 border-2 border-amber-200 p-4 shadow-sm transition-all',
                      activeAction?.includes('pyth') || highlightTarget === 'pythagoras'
                        ? 'ring-4 ring-amber-300 border-amber-500 scale-[1.01]'
                        : 'hover:border-amber-300',
                    )}
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-amber-900 mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-amber-600 animate-pulse" />
                        Đường Cao &amp; Khoảng Cách Toạ Độ Oxy
                      </span>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-amber-200 text-amber-800">
                        h = ab / c
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="bg-white/90 p-2 rounded-xl border border-amber-200 font-mono text-amber-900 font-bold">
                        <AsmoFormula text={`$h = \\frac{a \\cdot b}{c} = \\frac{${pythSideA} \\times ${pythSideB}}{${pythC.toFixed(1)}} = ${pythAltitude.toFixed(2)}\\text{ cm}$`} />
                      </div>
                      <div className="bg-white/90 p-2 rounded-xl border border-amber-200 font-mono text-indigo-900 font-bold">
                        <AsmoFormula text="$d(A,B) = \sqrt{(4-1)^2 + (6-2)^2} = \sqrt{3^2 + 4^2} = 5$" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* 3. ALGEBRAIC IDENTITIES (HẰNG ĐẲNG THỨC & ĐA THỨC)               */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {topicId === 'algebra-polynomials' && (
              <div className="w-full space-y-3">
                {/* Full-Column Big SVG / Tile Area */}
                <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                  <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                    <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                      <span className="size-2 rounded-full bg-indigo-600" />
                      Mô hình diện tích (a + b)² &amp; Khai triển Đại số
                    </span>
                    <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                      (a+b)² = a² + 2ab + b²
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-8 py-2 flex-wrap">
                    {/* Visual 2D Tile Model */}
                    <div className="size-36 grid grid-cols-3 grid-rows-3 gap-1 p-1.5 bg-slate-200/80 rounded-2xl border-2 border-indigo-300 shadow-sm">
                      <div className="col-span-2 row-span-2 bg-indigo-500 rounded-xl flex items-center justify-center font-black text-white text-base shadow-2xs">
                        a²
                      </div>
                      <div className="col-span-1 row-span-2 bg-amber-400 rounded-xl flex items-center justify-center font-bold text-amber-950 text-xs shadow-2xs">
                        ab
                      </div>
                      <div className="col-span-2 row-span-1 bg-amber-400 rounded-xl flex items-center justify-center font-bold text-amber-950 text-xs shadow-2xs">
                        ab
                      </div>
                      <div className="col-span-1 row-span-1 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-2xs">
                        b²
                      </div>
                    </div>

                    {/* Identity Quick Cards */}
                    <div className="flex flex-col gap-2 font-mono text-xs max-w-xs">
                      <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-200 text-indigo-900 font-bold">
                        <AsmoFormula text="$(a + b)^2 = a^2 + 2ab + b^2$" />
                      </div>
                      <div className="bg-rose-50 p-2 rounded-xl border border-rose-200 text-rose-900 font-bold">
                        <AsmoFormula text="$(a - b)^2 = a^2 - 2ab + b^2$" />
                      </div>
                      <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200 text-emerald-900 font-bold">
                        <AsmoFormula text="$a^2 - b^2 = (a - b)(a + b)$" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1-Line Mee Cat Ribbon (~32px) */}
                <div className="rounded-xl bg-amber-50/90 border border-amber-200 px-3 py-1.5 text-xs text-amber-900 flex items-center justify-between gap-2 shadow-2xs flex-wrap">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="text-sm">🐱</span>
                    <span className="font-extrabold text-amber-950">Bí kíp Mèo Mee:</span>
                    <span>
                      <strong>"Hiệu hai bình phương a² - b² = (a-b)(a+b)"</strong> · Hoàn thành bình phương $(x-x_0)^2 + M$ tìm cực trị!
                    </span>
                  </div>
                  <div className="text-[11px] font-mono font-bold text-amber-900 bg-white/90 px-2 py-0.5 rounded-lg border border-amber-200 shrink-0">
                    <AsmoFormula text="$P = (2x+1)^2 - (2x-1)^2 = 8x$" />
                  </div>
                </div>

                {/* KaTeX 2-Column Grid Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div
                    className={cn(
                      'rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/70 border-2 border-indigo-200 p-4 shadow-sm transition-all',
                      activeAction?.includes('poly') || highlightTarget === 'polynomials'
                        ? 'ring-4 ring-indigo-300 border-indigo-500 scale-[1.01]'
                        : 'hover:border-indigo-300',
                    )}
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-indigo-900 mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-indigo-600 animate-pulse" />
                        Rút Gọn &amp; Tách Hạng Tử Bậc Hai
                      </span>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-indigo-200 text-indigo-700">
                        x² - 7x + 12
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="bg-white/90 p-2 rounded-xl border border-indigo-200 font-mono text-indigo-900 font-bold">
                        <AsmoFormula text="$P = [(2x+1) - (2x-1)][(2x+1) + (2x-1)] = 2 \times 4x = 8x$" />
                      </div>
                      <div className="bg-emerald-50/90 p-2 rounded-xl border border-emerald-200 font-mono text-emerald-900 font-bold">
                        <AsmoFormula text="$x^2 - 7x + 12 = (x-3)(x-4) = 0 \Rightarrow x_1 + x_2 = 7$" />
                      </div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/70 border-2 border-emerald-200 p-4 shadow-sm transition-all',
                      activeAction?.includes('poly') || highlightTarget === 'polynomials'
                        ? 'ring-4 ring-emerald-300 border-emerald-500 scale-[1.01]'
                        : 'hover:border-emerald-300',
                    )}
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-emerald-900 mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-emerald-600 animate-pulse" />
                        Cực Trị Đa Thức (GTNN / GTLN)
                      </span>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-emerald-200 text-emerald-700">
                        A_min = 5
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="bg-white/90 p-2 rounded-xl border border-emerald-200 font-mono text-emerald-900 font-bold">
                        <AsmoFormula text="$A = x^2 - 6x + 14 = (x - 3)^2 + 5 \ge 5$" />
                      </div>
                      <div className="bg-white/90 p-2 rounded-xl border border-emerald-200 font-mono text-indigo-900 font-bold">
                        <AsmoFormula text="$\Rightarrow A_{\min} = 5 \quad (\text{khi } x = 3)$" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* 4. SPATIAL POLYHEDRON (HÌNH HỌC KHÔNG GIAN & KHỐI ĐA DIỆN)        */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {topicId === 'spatial-polyhedron' && (
              <div className="w-full space-y-3">
                {/* Full-Column Big SVG Diagram */}
                <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                  <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                    <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                      <span className="size-2 rounded-full bg-indigo-600" />
                      Thể tích khối chóp $S.ABCD$ &amp; Định lý Euler đa diện
                    </span>
                    <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                      <AsmoFormula text="$V = \frac{1}{3}Bh = 48\text{ cm}^3$" />
                    </span>
                  </div>

                  <svg viewBox="0 0 460 200" className="w-full max-h-52 select-none font-sans">
                    <defs>
                      <linearGradient id="pyrFaceLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity="0.1" />
                      </linearGradient>
                      <linearGradient id="pyrFaceRight" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#c084fc" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#c084fc" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>

                    {/* Isometric Pyramid S.ABCD: S(230,25), A(130,135), B(330,135), C(380,105), D(180,105), Base Center O(255, 120) */}
                    <line x1="130" y1="135" x2="180" y2="105" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />
                    <line x1="180" y1="105" x2="380" y2="105" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />
                    <line x1="230" y1="25" x2="180" y2="105" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />

                    {/* Visible Faces: SAB, SBC */}
                    <polygon points="230,25 130,135 330,135" fill="url(#pyrFaceLeft)" stroke="#4f46e5" strokeWidth="2.5" />
                    <polygon points="230,25 330,135 380,105" fill="url(#pyrFaceRight)" stroke="#9333ea" strokeWidth="2.5" />
                    <line x1="130" y1="135" x2="330" y2="135" stroke="#4f46e5" strokeWidth="2.5" />
                    <line x1="330" y1="135" x2="380" y2="105" stroke="#9333ea" strokeWidth="2.5" />

                    {/* Height line SO from S(230,25) to O(255,120) */}
                    <line x1="230" y1="25" x2="255" y2="120" stroke="#e11d48" strokeWidth="3" strokeDasharray="4 3" />
                    <circle cx="255" cy="120" r="4.5" fill="#e11d48" />
                    <text x="268" y="75" fill="#be123c" fontSize="12" fontWeight="bold">h = 4 cm</text>

                    {/* Labels */}
                    <circle cx="230" cy="25" r="4.5" fill="#f59e0b" />
                    <text x="230" y="18" fill="#b45309" fontSize="13" fontWeight="900" textAnchor="middle">S (Đỉnh)</text>
                    <text x="115" y="145" fill="#1e293b" fontSize="12" fontWeight="bold">A</text>
                    <text x="340" y="148" fill="#1e293b" fontSize="12" fontWeight="bold">B</text>
                    <text x="390" y="108" fill="#1e293b" fontSize="12" fontWeight="bold">C</text>
                    <text x="165" y="105" fill="#64748b" fontSize="12" fontWeight="bold">D</text>
                    <text x="230" y="156" fill="#4f46e5" fontSize="12" fontWeight="bold" textAnchor="middle">Đáy vuông a = 6 cm</text>
                  </svg>
                </div>

                {/* 1-Line Mee Cat Ribbon (~32px) */}
                <div className="rounded-xl bg-amber-50/90 border border-amber-200 px-3 py-1.5 text-xs text-amber-900 flex items-center justify-between gap-2 shadow-2xs flex-wrap">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="text-sm">🐱</span>
                    <span className="font-extrabold text-amber-950">Bí kíp Mèo Mee:</span>
                    <span>
                      <strong>"Khối chóp V = ⅓ B·h · Khối đa diện Euler V - E + F = 2"</strong> · Khai triển nhị thức Newton (x+2)⁵ với hệ số C(5, k) × 2ᵏ
                    </span>
                  </div>
                  <div className="text-[11px] font-mono font-bold text-amber-900 bg-white/90 px-2 py-0.5 rounded-lg border border-amber-200 shrink-0">
                    <AsmoFormula text="$V = \frac{1}{3} \times 36 \times 4 = 48\text{ cm}^3 \quad | \quad E = 30$" />
                  </div>
                </div>

                {/* KaTeX 2-Column Grid Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div
                    className={cn(
                      'rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/70 border-2 border-indigo-200 p-4 shadow-sm transition-all',
                      activeAction?.includes('polyh') || highlightTarget === 'polyhedron'
                        ? 'ring-4 ring-indigo-300 border-indigo-500 scale-[1.01]'
                        : 'hover:border-indigo-300',
                    )}
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-indigo-900 mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-indigo-600 animate-pulse" />
                        Thể Tích Khối Chóp Tứ Giác Đều
                      </span>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-indigo-200 text-indigo-700">
                        V = ⅓ B·h
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="bg-white/90 p-2 rounded-xl border border-indigo-200 font-mono text-indigo-900 font-bold">
                        <AsmoFormula text="$B = a^2 = 6^2 = 36\text{ cm}^2, \quad h = 4\text{ cm}$" />
                      </div>
                      <div className="bg-emerald-50/90 p-2 rounded-xl border border-emerald-200 font-mono text-emerald-900 font-bold">
                        <AsmoFormula text="$V = \frac{1}{3} \times 36 \times 4 = 48\text{ cm}^3$" />
                      </div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/70 border-2 border-amber-200 p-4 shadow-sm transition-all',
                      activeAction?.includes('polyh') || highlightTarget === 'polyhedron'
                        ? 'ring-4 ring-amber-300 border-amber-500 scale-[1.01]'
                        : 'hover:border-amber-300',
                    )}
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-amber-900 mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-amber-600 animate-pulse" />
                        Định lý Euler đa diện &amp; Newton
                      </span>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-amber-200 text-amber-800">
                        V - E + F = 2
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="bg-white/90 p-2 rounded-xl border border-amber-200 font-mono text-amber-900 font-bold">
                        <AsmoFormula text="$E = V + F - 2 = 12 + 20 - 2 = 30\text{ cạnh}$" />
                      </div>
                      <div className="bg-white/90 p-2 rounded-xl border border-amber-200 font-mono text-indigo-900 font-bold">
                        <AsmoFormula text="$(x+2)^5 \Rightarrow a_3 = C_5^2 \cdot 2^2 = 10 \times 4 = 40$" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* 5. EXPONENT & LOGARITHM (MŨ & LOGARIT)                            */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {topicId === 'exp-logarithm' && (
              <div className="w-full space-y-3">
                {/* Full-Column Big SVG Diagram */}
                <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                  <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                    <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                      <span className="size-2 rounded-full bg-indigo-600" />
                      Đồ thị đối xứng qua đường thẳng $y = x$: Hàm số mũ $y = 2^x$ và Logarit $y = \log_2 x$
                    </span>
                    <span className="text-[11px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                      $y = 2^x \leftrightarrow y = \log_2 x$
                    </span>
                  </div>

                  <svg viewBox="0 0 460 200" className="w-full max-h-52 select-none font-sans">
                    {/* Axes */}
                    <line x1="40" y1="160" x2="420" y2="160" stroke="#cbd5e1" strokeWidth="2" />
                    <line x1="90" y1="15" x2="90" y2="185" stroke="#cbd5e1" strokeWidth="2" />
                    <polygon points="420,156 430,160 420,164" fill="#64748b" />
                    <polygon points="86,15 90,5 94,15" fill="#64748b" />
                    <text x="422" y="174" fill="#475569" fontSize="12" fontWeight="bold">x</text>
                    <text x="72" y="18" fill="#475569" fontSize="12" fontWeight="bold">y</text>
                    <text x="76" y="174" fill="#64748b" fontSize="11" fontWeight="bold">O</text>

                    {/* Symmetry Line y = x (Indigo dashed) */}
                    <line x1="60" y1="190" x2="330" y2="20" stroke="#818cf8" strokeWidth="2" strokeDasharray="4 3" />
                    <text x="335" y="25" fill="#6366f1" fontSize="11" fontWeight="bold">y = x</text>

                    {/* Exponential Curve y = 2^x (Sky Blue) */}
                    <path
                      d="M 40,158 Q 160,155 240,25"
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <text x="185" y="45" fill="#0369a1" fontSize="13" fontWeight="900">
                      y = 2ˣ
                    </text>

                    {/* Logarithm Curve y = log2(x) (Amber) */}
                    <path
                      d="M 94,190 Q 100,80 390,30"
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <text x="325" y="55" fill="#b45309" fontSize="13" fontWeight="900">
                      y = log₂x
                    </text>

                    {/* Key points: (0, 1) and (1, 0) */}
                    <circle cx="90" cy="120" r="5" fill="#0284c7" />
                    <text x="50" y="123" fill="#0369a1" fontSize="11" fontWeight="bold">(0, 1)</text>

                    <circle cx="130" cy="160" r="5" fill="#d97706" />
                    <text x="125" y="178" fill="#b45309" fontSize="11" fontWeight="bold">(1, 0)</text>

                    {/* Matching points (1, 2) and (2, 1) */}
                    <circle cx="130" cy="80" r="4.5" fill="#0284c7" />
                    <circle cx="170" cy="120" r="4.5" fill="#d97706" />
                    <line x1="130" y1="80" x2="170" y2="120" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="2 2" />
                  </svg>
                </div>

                {/* 1-Line Mee Cat Ribbon (~32px) */}
                <div className="rounded-xl bg-amber-50/90 border border-amber-200 px-3 py-1.5 text-xs text-amber-900 flex items-center justify-between gap-2 shadow-2xs flex-wrap">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="text-sm">🐱</span>
                    <span className="font-extrabold text-amber-950">Bí kíp Mèo Mee:</span>
                    <span>
                      <strong>"Hàm số mũ $y=a^x$ và $y=\log_a x$ đối xứng qua $y=x$"</strong> · Đặt ẩn phụ $t = a^x &gt; 0$ giải phương trình bậc hai
                    </span>
                  </div>
                  <div className="text-[11px] font-mono font-bold text-amber-900 bg-white/90 px-2 py-0.5 rounded-lg border border-amber-200 shrink-0">
                    <AsmoFormula text="$K = \log_2(32) + \log_3(81) = 5 + 4 = 9$" />
                  </div>
                </div>

                {/* KaTeX 2-Column Grid Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div
                    className={cn(
                      'rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100/70 border-2 border-sky-200 p-4 shadow-sm transition-all',
                      activeAction?.includes('log') || highlightTarget === 'logarithm'
                        ? 'ring-4 ring-sky-300 border-sky-500 scale-[1.01]'
                        : 'hover:border-sky-300',
                    )}
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-sky-900 mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-sky-600 animate-pulse" />
                        Tính Giá Trị Biểu Thức Logarit
                      </span>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-sky-200 text-sky-700">
                        K = 5 + 4 = 9
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="bg-white/90 p-2 rounded-xl border border-sky-200 font-mono text-sky-900 font-bold">
                        <AsmoFormula text="$\log_2(32) = \log_2(2^5) = 5, \quad \log_3(81) = \log_3(3^4) = 4$" />
                      </div>
                      <div className="bg-emerald-50/90 p-2 rounded-xl border border-emerald-200 font-mono text-emerald-900 font-bold">
                        <AsmoFormula text="$K = \log_2(32) + \log_3(81) = 9$" />
                      </div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/70 border-2 border-indigo-200 p-4 shadow-sm transition-all',
                      activeAction?.includes('log') || highlightTarget === 'logarithm'
                        ? 'ring-4 ring-indigo-300 border-indigo-500 scale-[1.01]'
                        : 'hover:border-indigo-300',
                    )}
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-indigo-900 mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-indigo-600 animate-pulse" />
                        Phương Trình Mũ Bậc Hai ($t = 2^x$)
                      </span>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-indigo-200 text-indigo-700">
                        {'S = {1, 2}'}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="bg-white/90 p-2 rounded-xl border border-indigo-200 font-mono text-indigo-900 font-bold">
                        <AsmoFormula text="$4^x - 6 \cdot 2^x + 8 = 0 \Leftrightarrow t^2 - 6t + 8 = 0$" />
                      </div>
                      <div className="bg-white/90 p-2 rounded-xl border border-indigo-200 font-mono text-indigo-900 font-bold">
                        <AsmoFormula text="$t \in \{2, 4\} \Rightarrow 2^x = 2 \text{ hoặc } 2^x = 4 \Rightarrow x \in \{1, 2\}$" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* 6. COMBINATORICS & PROBABILITY (TỔ HỢP & XÁC SUẤT)                */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {topicId === 'combinatorics-probability' && (
              <div className="w-full space-y-3">
                {/* Full-Column Big SVG / Grid Container */}
                <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                  <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                    <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                      <span className="size-2 rounded-full bg-indigo-600" />
                      Ma trận 36 biến cố gieo 2 con xúc xắc
                    </span>
                    <span className="text-[11px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300 font-bold">
                      🎲 6 ô Vàng có Tổng = {diceTargetSum}
                    </span>
                  </div>

                  <div className="w-full max-w-sm grid grid-cols-6 gap-1.5 p-2 bg-slate-200/70 rounded-2xl border border-slate-300 shadow-inner">
                    {Array.from({ length: 6 }).map((_, r) =>
                      Array.from({ length: 6 }).map((_, c) => {
                        const sum = r + 1 + (c + 1)
                        const isTarget = sum === diceTargetSum
                        return (
                          <div
                            key={`dice-${r}-${c}`}
                            onClick={() => setDiceTargetSum(sum)}
                            className={cn(
                              'py-1.5 rounded-xl font-mono text-xs text-center font-black transition-all cursor-pointer select-none',
                              isTarget
                                ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-500 shadow-sm scale-[1.05]'
                                : 'bg-white text-slate-700 hover:bg-indigo-50 border border-slate-200 shadow-2xs',
                            )}
                            title={`Xúc xắc 1: ${r + 1}, Xúc xắc 2: ${c + 1} -> Tổng = ${sum}`}
                          >
                            {r + 1}+{c + 1}
                          </div>
                        )
                      }),
                    )}
                  </div>
                </div>

                {/* 1-Line Mee Cat Ribbon (~32px) */}
                <div className="rounded-xl bg-amber-50/90 border border-amber-200 px-3 py-1.5 text-xs text-amber-900 flex items-center justify-between gap-2 shadow-2xs flex-wrap">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="text-sm">🐱</span>
                    <span className="font-extrabold text-amber-950">Bí kíp Mèo Mee:</span>
                    <span>
                      <strong>"Phân biệt Chỉnh hợp An² (có thứ tự) vs Tổ hợp Cn² (không thứ tự)"</strong> · Dirichlet bốc bi xấu nhất $m(k-1)+1$
                    </span>
                  </div>
                  <div className="text-[11px] font-mono font-bold text-amber-900 bg-white/90 px-2 py-0.5 rounded-lg border border-amber-200 shrink-0">
                    <AsmoFormula text="$P(\text{Tổng}=7) = \frac{6}{36} = \frac{1}{6} \approx 16.67\%$" />
                  </div>
                </div>

                {/* KaTeX 2-Column Grid Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div
                    className={cn(
                      'rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/70 border-2 border-amber-200 p-4 shadow-sm transition-all',
                      activeAction?.includes('comb') || highlightTarget === 'probability'
                        ? 'ring-4 ring-amber-300 border-amber-500 scale-[1.01]'
                        : 'hover:border-amber-300',
                    )}
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-amber-900 mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-amber-600 animate-pulse" />
                        Xác Suất Gieo 2 Con Xúc Xắc
                      </span>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-amber-200 text-amber-800">
                        n(Ω) = 36
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="bg-white/90 p-2 rounded-xl border border-amber-200 font-mono text-amber-900 font-bold">
                        <AsmoFormula text="$A = \{(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)\} \Rightarrow n(A) = 6$" />
                      </div>
                      <div className="bg-emerald-50/90 p-2 rounded-xl border border-emerald-200 font-mono text-emerald-900 font-bold">
                        <AsmoFormula text="$P(A) = \frac{n(A)}{n(\Omega)} = \frac{6}{36} = \frac{1}{6} \approx 16.67\%$" />
                      </div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/70 border-2 border-indigo-200 p-4 shadow-sm transition-all',
                      activeAction?.includes('comb') || highlightTarget === 'probability'
                        ? 'ring-4 ring-indigo-300 border-indigo-500 scale-[1.01]'
                        : 'hover:border-indigo-300',
                    )}
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-indigo-900 mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-indigo-600 animate-pulse" />
                        Chỉnh Hợp &amp; Nguyên Lý Dirichlet
                      </span>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-indigo-200 text-indigo-700">
                        A₁₀² = 90
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="bg-white/90 p-2 rounded-xl border border-indigo-200 font-mono text-indigo-900 font-bold">
                        <AsmoFormula text="$A_{10}^2 = \frac{10!}{(10-2)!} = 10 \times 9 = 90\text{ (cách chọn)}$" />
                      </div>
                      <div className="bg-white/90 p-2 rounded-xl border border-indigo-200 font-mono text-indigo-900 font-bold">
                        <AsmoFormula text="$N_{\min} = 3 \times (4 - 1) + 1 = 10\text{ viên bi (Dirichlet)}$" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* 7. NUMBER THEORY (SỐ HỌC & TÍNH CHIA HẾT)                          */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {topicId === 'number-theory-divisibility' && (
              <div className="w-full space-y-3">
                {/* Full-Column Big SVG / Cycle Container */}
                <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                  <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                    <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                      <span className="size-2 rounded-full bg-indigo-600" />
                      Chu kỳ tận cùng 2ⁿ &amp; Phép chia Modulo 4
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      <AsmoFormula text="$2^{2024} \equiv 2^4 \equiv 6 \pmod{10}$" />
                    </span>
                  </div>

                  {/* Cyclic Wheel UI */}
                  <div className="flex items-center justify-center gap-2 py-3 flex-wrap">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border-2 border-indigo-200 shadow-xs">
                      <span className="size-8 rounded-xl bg-indigo-100 flex items-center justify-center font-black text-indigo-800 text-sm">
                        2¹ = 2
                      </span>
                      <span className="text-slate-400 font-bold">➔</span>
                      <span className="size-8 rounded-xl bg-indigo-100 flex items-center justify-center font-black text-indigo-800 text-sm">
                        2² = 4
                      </span>
                      <span className="text-slate-400 font-bold">➔</span>
                      <span className="size-8 rounded-xl bg-indigo-100 flex items-center justify-center font-black text-indigo-800 text-sm">
                        2³ = 8
                      </span>
                      <span className="text-slate-400 font-bold">➔</span>
                      <span className="size-8 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-white text-sm ring-2 ring-emerald-300 shadow-sm animate-bounce">
                        2⁴ = 6
                      </span>
                    </div>
                  </div>
                </div>

                {/* 1-Line Mee Cat Ribbon (~32px) */}
                <div className="rounded-xl bg-amber-50/90 border border-amber-200 px-3 py-1.5 text-xs text-amber-900 flex items-center justify-between gap-2 shadow-2xs flex-wrap">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="text-sm">🐱</span>
                    <span className="font-extrabold text-amber-950">Bí kíp Mèo Mee:</span>
                    <span>
                      <strong>"Chu kỳ chữ số tận cùng của 2, 3, 7, 8 có độ dài T = 4"</strong> · Lấy số mũ chia cho 4 tìm số dư!
                    </span>
                  </div>
                  <div className="text-[11px] font-mono font-bold text-amber-900 bg-white/90 px-2 py-0.5 rounded-lg border border-amber-200 shrink-0">
                    <AsmoFormula text="$2024 = 4 \times 506 + 0 \Rightarrow 2^{2024} \equiv 6 \pmod{10}$" />
                  </div>
                </div>

                {/* KaTeX 2-Column Grid Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div
                    className={cn(
                      'rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/70 border-2 border-indigo-200 p-4 shadow-sm transition-all',
                      activeAction?.includes('num') || highlightTarget === 'number-theory'
                        ? 'ring-4 ring-indigo-300 border-indigo-500 scale-[1.01]'
                        : 'hover:border-indigo-300',
                    )}
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-indigo-900 mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-indigo-600 animate-pulse" />
                        Chữ Số Tận Cùng &amp; Chu Kỳ Luỹ Thừa
                      </span>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-indigo-200 text-indigo-700">
                        2²⁰²⁴ ≡ 6
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="bg-white/90 p-2 rounded-xl border border-indigo-200 font-mono text-indigo-900 font-bold">
                        <AsmoFormula text="• Số mũ: $2024 : 4 = 506\text{ (dư 0)} \equiv 4 \pmod 4$" />
                      </div>
                      <div className="bg-emerald-50/90 p-2 rounded-xl border border-emerald-200 font-mono text-emerald-900 font-bold">
                        <AsmoFormula text="• Tận cùng: $2^{2024} \equiv 2^4 = 16 \equiv 6 \pmod{10}$" />
                      </div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/70 border-2 border-emerald-200 p-4 shadow-sm transition-all',
                      activeAction?.includes('num') || highlightTarget === 'number-theory'
                        ? 'ring-4 ring-emerald-300 border-emerald-500 scale-[1.01]'
                        : 'hover:border-emerald-300',
                    )}
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-emerald-900 mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-emerald-600 animate-pulse" />
                        Nhóm Dãy Số Chia Hết &amp; Định Lý Fermat
                      </span>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-emerald-200 text-emerald-700">
                        n⁵ - n ⋮ 30
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="bg-white/90 p-2 rounded-xl border border-emerald-200 font-mono text-emerald-900 font-bold">
                        <AsmoFormula text="$(3^1 + 3^2 + 3^3 + 3^4) = 120 = 5 \times 24 \Rightarrow S \equiv 0 \pmod 5$" />
                      </div>
                      <div className="bg-white/90 p-2 rounded-xl border border-emerald-200 font-mono text-indigo-900 font-bold">
                        <AsmoFormula text="$n^5 - n = n(n-1)(n+1)(n^2+1) \vdots 6 \text{ và } \vdots 5 \Rightarrow \vdots 30$" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── FORMULA TAB: DETAILED KATEX THEOREMS ── */
          <div className="w-full space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <h5 className="font-extrabold text-indigo-950 uppercase tracking-wider text-xs flex items-center gap-2">
              <Calculator className="size-4 text-indigo-600" />
              Định lý &amp; Công thức trọng tâm ASMO:
            </h5>
            <div className="space-y-2 text-slate-700 leading-relaxed">
              {topicId === 'algebra-viete' && (
                <div className="space-y-2">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Hệ thức Viète bậc 2: $x_1 + x_2 = -\frac{b}{a}$, $x_1 x_2 = \frac{c}{a}$" />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Tổng bình phương: $x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1 x_2 = S^2 - 2P$" />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Tổng phân thức đối xứng: $\frac{x_1}{x_2} + \frac{x_2}{x_1} = \frac{S^2 - 2P}{P}$" />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Tổng lập phương: $x_1^3 + x_2^3 = S^3 - 3SP$" />
                  </div>
                </div>
              )}
              {topicId === 'pythagoras-geometry' && (
                <div className="space-y-2">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Định lý Pytago: $a^2 + b^2 = c^2 \Rightarrow c = \sqrt{a^2 + b^2}$" />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Đường cao tam giác vuông: $h = \frac{a \cdot b}{c}$ và $\frac{1}{h^2} = \frac{1}{a^2} + \frac{1}{b^2}$" />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Khoảng cách toạ độ: $d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$" />
                  </div>
                </div>
              )}
              {topicId === 'algebra-polynomials' && (
                <div className="space-y-2">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• $(a + b)^2 = a^2 + 2ab + b^2$" />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• $a^2 - b^2 = (a - b)(a + b)$" />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• $(a + b)^3 = a^3 + 3a^2b + 3ab^2 + b^3$" />
                  </div>
                </div>
              )}
              {topicId === 'spatial-polyhedron' && (
                <div className="space-y-2">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Nhị thức Newton: $(a+b)^n = \sum_{k=0}^n C_n^k a^{n-k} b^k$" />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Thể tích khối chóp: $V = \frac{1}{3} S_{\text{đáy}} \cdot h$" />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Định lý Euler đa diện lồi: $V - E + F = 2$" />
                  </div>
                </div>
              )}
              {topicId === 'exp-logarithm' && (
                <div className="space-y-2">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• $\log_a(xy) = \log_a x + \log_a y$" />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• $\log_a(x^k) = k\log_a x$" />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Đổi cơ số: $\log_a b = \frac{\log_c b}{\log_c a}$" />
                  </div>
                </div>
              )}
              {topicId === 'combinatorics-probability' && (
                <div className="space-y-2">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Chỉnh hợp: $A_n^k = \frac{n!}{(n-k)!}$" />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Tổ hợp: $C_n^k = \frac{n!}{k!(n-k)!}$" />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Xác suất: $P(A) = \frac{n(A)}{n(\Omega)}$" />
                  </div>
                </div>
              )}
              {topicId === 'number-theory-divisibility' && (
                <div className="space-y-2">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Định lý nhỏ Fermat: $a^{p-1} \equiv 1 \pmod p$" />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Tính chia hết: $a \vdots m, b \vdots m \Rightarrow (a + b) \vdots m$" />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Chu kỳ luỹ thừa: $a^{k \cdot T + r} \equiv a^r \pmod{10}$" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER INFO ── */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100 flex-wrap gap-2">
        <span className="flex items-center gap-1 text-indigo-700 font-bold">
          <Sparkles className="size-3.5 text-amber-500" />
          Mô hình Toán Học Chuẩn KaTeX ASMO
        </span>
        <span className="font-mono text-slate-400">100% Valid Math Spec</span>
      </div>
    </div>
  )
}
