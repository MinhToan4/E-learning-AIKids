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
  Info,
  AlertTriangle,
  Sliders,
  Check,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export type AsmoMathVisualizerProps = {
  topicId: string
  level: 1 | 2 | 3
  className?: string
  activeStep?: 1 | 2 | 3
  onStepChange?: (step: 1 | 2 | 3) => void
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
  activeStep = 1,
  onStepChange,
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

  // Pythagoras state
  const [pythSideA, setPythSideA] = useState<number>(level === 1 ? 6 : level === 2 ? 3 : 6)
  const [pythSideB, setPythSideB] = useState<number>(level === 1 ? 8 : level === 2 ? 4 : 8)

  // Dice target sum for Combinatorics
  const [diceTargetSum, setDiceTargetSum] = useState<number>(7)

  // Parameter m state for Viete Level 3
  const [vieteM, setVieteM] = useState<number>(1) // 1 (<2, 2 roots), 2 (=2, 1 root), 3 (>2, 0 roots)

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

  // 2. Trigonometry -> Render AsmoTrigLabVisualizer
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
            {/* 1. EXPONENT & LOGARITHM (exp-logarithm)                           */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {topicId === 'exp-logarithm' && (
              <div className="w-full space-y-3">
                {level === 1 ? (
                  /* Level 1: Logarithmic Scale Ruler: 2^5 = 32 <=> log_2(32) = 5 & 3^4 = 81 <=> log_3(81) = 4 => 5+4=9 */
                  <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2 flex-wrap gap-1">
                      <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                        <span className="size-2 rounded-full bg-indigo-600" />
                        <AsmoFormula text="Thước đo Logarit luỹ thừa $2^5 = 32 \Leftrightarrow \log_2(32) = 5$ & $3^4 = 81 \Leftrightarrow \log_3(81) = 4$" />
                      </span>
                      <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                        <AsmoFormula text="$K = \log_2(32) + \log_3(81) = 5 + 4 = 9$" />
                      </span>
                    </div>

                    <svg viewBox="0 0 480 205" className="w-full max-h-52 select-none font-sans">
                      <defs>
                        <linearGradient id="logGradBase2" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.9" />
                        </linearGradient>
                        <linearGradient id="logGradBase3" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
                        </linearGradient>
                      </defs>

                      {/* Ruler 1: Base 2 (2^1=2 to 2^5=32) */}
                      <rect x="40" y="25" width="400" height="42" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
                      <rect x="40" y="25" width="360" height="42" rx="10" fill="url(#logGradBase2)" fillOpacity="0.2" />

                      {/* Base 2 ticks */}
                      {[
                        { exp: 1, val: 2, x: 100 },
                        { exp: 2, val: 4, x: 170 },
                        { exp: 3, val: 8, x: 245 },
                        { exp: 4, val: 16, x: 320 },
                        { exp: 5, val: 32, x: 400 },
                      ].map((t) => (
                        <g key={`log2-${t.exp}`}>
                          <line x1={t.x} y1="25" x2={t.x} y2="40" stroke="#3b82f6" strokeWidth={t.exp === 5 ? '3' : '1.5'} />
                          <foreignObject x={t.x - 30} y="44" width="60" height="20" className="overflow-visible">
                            <div className="flex items-center justify-center text-[10px] font-bold text-blue-900 leading-none">
                              <AsmoFormula text={`$2^${t.exp}=${t.val}$`} />
                            </div>
                          </foreignObject>
                          <text x={t.x} y="20" fill="#2563eb" fontSize="11" fontWeight="900" textAnchor="middle">
                            {t.exp}
                          </text>
                        </g>
                      ))}
                      <text x="48" y="50" fill="#1d4ed8" fontSize="12" fontWeight="900">
                        log₂
                      </text>

                      {/* Ruler 2: Base 3 (3^1=3 to 3^4=81) */}
                      <rect x="40" y="90" width="400" height="42" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
                      <rect x="40" y="90" width="360" height="42" rx="10" fill="url(#logGradBase3)" fillOpacity="0.2" />

                      {/* Base 3 ticks */}
                      {[
                        { exp: 1, val: 3, x: 110 },
                        { exp: 2, val: 9, x: 200 },
                        { exp: 3, val: 27, x: 300 },
                        { exp: 4, val: 81, x: 400 },
                      ].map((t) => (
                        <g key={`log3-${t.exp}`}>
                          <line x1={t.x} y1="90" x2={t.x} y2="105" stroke="#059669" strokeWidth={t.exp === 4 ? '3' : '1.5'} />
                          <foreignObject x={t.x - 30} y="109" width="60" height="20" className="overflow-visible">
                            <div className="flex items-center justify-center text-[10px] font-bold text-emerald-900 leading-none">
                              <AsmoFormula text={`$3^${t.exp}=${t.val}$`} />
                            </div>
                          </foreignObject>
                          <text x={t.x} y="85" fill="#059669" fontSize="11" fontWeight="900" textAnchor="middle">
                            {t.exp}
                          </text>
                        </g>
                      ))}
                      <text x="48" y="115" fill="#047857" fontSize="12" fontWeight="900">
                        log₃
                      </text>

                      {/* Summation Connector Badge */}
                      <foreignObject x="70" y="148" width="340" height="42" className="overflow-visible">
                        <div className="flex items-center justify-center h-full px-3 py-1.5 rounded-xl bg-indigo-50 border-2 border-indigo-300 text-indigo-950 font-bold text-xs shadow-xs">
                          <AsmoFormula text="$K = \log_2(32) + \log_3(81) = 5 + 4 = 9 \implies \text{Chọn C}$" />
                        </div>
                      </foreignObject>
                    </svg>
                  </div>
                ) : level === 2 ? (
                  /* Level 2: Parabola of auxiliary substitution t = 2^x with roots t1=1 => x=0 and t2=4 => x=2 */
                  <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2 flex-wrap gap-1">
                      <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                        <span className="size-2 rounded-full bg-indigo-600" />
                        <AsmoFormula text="Đồ thị Parabol ẩn phụ $t = 2^x$ & Quan hệ $x = \log_2 t$" />
                      </span>
                      <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <AsmoFormula text="$t_1 = 1 \Rightarrow x = 0; \quad t_2 = 4 \Rightarrow x = 2$" />
                      </span>
                    </div>

                    <svg viewBox="0 0 480 205" className="w-full max-h-52 select-none font-sans">
                      {/* Invalid Region t <= 0 Shaded */}
                      <rect x="30" y="15" width="70" height="160" fill="#fee2e2" fillOpacity="0.4" stroke="#fca5a5" strokeDasharray="3 3" />
                      <text x="65" y="95" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle">
                        t ≤ 0 (Loại)
                      </text>

                      {/* Axes */}
                      <line x1="30" y1="135" x2="445" y2="135" stroke="#94a3b8" strokeWidth="2" />
                      <line x1="100" y1="15" x2="100" y2="175" stroke="#94a3b8" strokeWidth="2" />
                      <polygon points="445,131 455,135 445,139" fill="#64748b" />
                      <polygon points="96,15 100,5 104,15" fill="#64748b" />
                      <text x="445" y="152" fill="#475569" fontSize="12" fontWeight="bold">t (t = 2ˣ &gt; 0)</text>
                      <text x="76" y="20" fill="#475569" fontSize="12" fontWeight="bold">f(t)</text>
                      <text x="86" y="148" fill="#64748b" fontSize="11" fontWeight="bold">O</text>

                      {/* Parabola f(t) = t^2 - 5t + 4 (roots at t=1, t=4) */}
                      <path d="M 120,30 Q 230,225 340,30" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />

                      {/* Root t1 = 1 => x = 0 */}
                      <circle cx="150" cy="135" r="5.5" fill="#059669" />
                      <text x="150" y="155" fill="#065f46" fontSize="11" fontWeight="black" textAnchor="middle">
                        t₁ = 1
                      </text>
                      <rect x="110" y="160" width="80" height="22" rx="6" fill="#ecfdf5" stroke="#a7f3d0" />
                      <text x="150" y="175" fill="#047857" fontSize="10" fontWeight="bold" textAnchor="middle">
                        ⇒ x = log₂1 = 0
                      </text>

                      {/* Root t2 = 4 => x = 2 */}
                      <circle cx="310" cy="135" r="5.5" fill="#0284c7" />
                      <text x="310" y="155" fill="#0369a1" fontSize="11" fontWeight="black" textAnchor="middle">
                        t₂ = 4
                      </text>
                      <rect x="270" y="160" width="80" height="22" rx="6" fill="#f0f9ff" stroke="#bae6fd" />
                      <text x="310" y="175" fill="#0284c7" fontSize="10" fontWeight="bold" textAnchor="middle">
                        ⇒ x = log₂4 = 2
                      </text>

                      {/* Exponential & Log curves thumbnail overlay with explicit y = 2ˣ and y = log₂x */}
                      <g transform="translate(360, 20)">
                        <rect width="105" height="75" rx="8" fill="#ffffff" stroke="#e2e8f0" />
                        <path d="M 10,65 Q 40,60 85,15" fill="none" stroke="#0284c7" strokeWidth="2" />
                        <text x="45" y="25" fill="#0284c7" fontSize="9" fontWeight="bold">y = 2ˣ</text>
                        <path d="M 30,70 Q 40,40 95,30" fill="none" stroke="#d97706" strokeWidth="2" />
                        <text x="60" y="55" fill="#d97706" fontSize="9" fontWeight="bold">y = log₂x</text>
                      </g>
                    </svg>
                  </div>
                ) : (
                  /* Level 3: Logarithmic equation log2(x-1) + log2(x+2) = 2 intersecting y = 2 at x = 2 with vertical asymptote x = 1 and rejection of x = -3 */
                  <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2 flex-wrap gap-1">
                      <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                        <span className="size-2 rounded-full bg-indigo-600" />
                        <AsmoFormula text="Đồ thị $\log_2(x-1) + \log_2(x+2) = 2$ & Tiệm cận đứng $x = 1$" />
                      </span>
                      <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <AsmoFormula text="$x = 2\text{ (nhận)}, \quad x = -3\text{ (loại vì } x \le 1\text{)}$" />
                      </span>
                    </div>

                    <svg viewBox="0 0 480 205" className="w-full max-h-52 select-none font-sans">
                      {/* Invalid Region x <= 1 Shaded Red */}
                      <rect x="30" y="15" width="170" height="170" fill="#fee2e2" fillOpacity="0.45" />
                      <line x1="200" y1="15" x2="200" y2="185" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 3" />
                      <text x="110" y="45" fill="#dc2626" fontSize="10" fontWeight="bold">
                        ĐKXĐ: x &gt; 1 (Vùng gạch đỏ bị loại)
                      </text>

                      {/* Axes */}
                      <line x1="30" y1="135" x2="450" y2="135" stroke="#94a3b8" strokeWidth="2" />
                      <line x1="130" y1="15" x2="130" y2="185" stroke="#94a3b8" strokeWidth="2" />
                      <polygon points="450,131 460,135 450,139" fill="#64748b" />
                      <polygon points="126,15 130,5 134,15" fill="#64748b" />
                      <text x="450" y="150" fill="#475569" fontSize="12" fontWeight="bold">x</text>
                      <text x="115" y="20" fill="#475569" fontSize="12" fontWeight="bold">y</text>
                      <text x="118" y="148" fill="#64748b" fontSize="11" fontWeight="bold">O</text>

                      {/* Asymptote label */}
                      <text x="205" y="25" fill="#b91c1c" fontSize="10" fontWeight="900">
                        Tiệm cận x = 1
                      </text>

                      {/* Horizontal target line y = 2 */}
                      <line x1="50" y1="75" x2="440" y2="75" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 3" />
                      <text x="420" y="68" fill="#d97706" fontSize="11" fontWeight="bold">
                        y = 2
                      </text>

                      {/* Function curve y = log2((x-1)(x+2)) for x > 1 */}
                      <path d="M 210,180 Q 230,105 280,75 T 440,35" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
                      <text x="320" y="45" fill="#1d4ed8" fontSize="11" fontWeight="bold">
                        y = log₂[(x-1)(x+2)]
                      </text>

                      {/* Intersection Root x = 2 */}
                      <circle cx="280" cy="75" r="6" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                      <line x1="280" y1="75" x2="280" y2="135" stroke="#059669" strokeWidth="1.5" strokeDasharray="3 2" />
                      <text x="280" y="152" fill="#047857" fontSize="12" fontWeight="black" textAnchor="middle">
                        x = 2 (Nhận ✓)
                      </text>

                      {/* Rejected False Root x = -3 */}
                      <circle cx="60" cy="75" r="6" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />
                      <line x1="60" y1="75" x2="60" y2="135" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="3 2" />
                      <text x="60" y="152" fill="#be123c" fontSize="11" fontWeight="black" textAnchor="middle">
                        x = -3 (Loại ✗)
                      </text>
                    </svg>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* 2. SPATIAL GEOMETRY & POLYHEDRON (spatial-polyhedron)              */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {topicId === 'spatial-polyhedron' && (
              <div className="w-full space-y-3">
                {level === 1 ? (
                  /* Level 1: Regular Square Pyramid S.ABCD Isometric (a=6, h=4 => V = 48 cm3) */
                  <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2 flex-wrap gap-1">
                      <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                        <span className="size-2 rounded-full bg-indigo-600" />
                        Thể tích khối chóp tứ giác đều S.ABCD &amp; Định lý Euler đa diện
                      </span>
                      <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                        <AsmoFormula text="$V = \frac{1}{3} S_{\text{đáy}} \cdot h = \frac{1}{3} \times 6^2 \times 4 = 48\text{ cm}^3$" />
                      </span>
                    </div>

                    <svg viewBox="0 0 480 205" className="w-full max-h-52 select-none font-sans">
                      <defs>
                        <linearGradient id="pyrFaceLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.2" />
                        </linearGradient>
                        <linearGradient id="pyrFaceRight" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#9333ea" stopOpacity="0.2" />
                        </linearGradient>
                      </defs>

                      {/* Hidden base lines */}
                      <line x1="130" y1="140" x2="190" y2="105" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />
                      <line x1="190" y1="105" x2="390" y2="105" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />
                      <line x1="240" y1="25" x2="190" y2="105" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />

                      {/* Altitude SO and center O */}
                      <line x1="240" y1="25" x2="265" y2="122" stroke="#e11d48" strokeWidth="3" strokeDasharray="4 3" />
                      <circle cx="265" cy="122" r="4" fill="#e11d48" />
                      <text x="278" y="75" fill="#be123c" fontSize="12" fontWeight="bold">h = 4 cm</text>
                      <text x="268" y="138" fill="#be123c" fontSize="10" fontWeight="bold">O</text>

                      {/* Front Pyramidal faces */}
                      <polygon points="240,25 130,140 330,140" fill="url(#pyrFaceLeft)" stroke="#4f46e5" strokeWidth="2.5" />
                      <polygon points="240,25 330,140 390,105" fill="url(#pyrFaceRight)" stroke="#9333ea" strokeWidth="2.5" />
                      <line x1="130" y1="140" x2="330" y2="140" stroke="#4f46e5" strokeWidth="2.5" />
                      <line x1="330" y1="140" x2="390" y2="105" stroke="#9333ea" strokeWidth="2.5" />

                      {/* Vertices */}
                      <circle cx="240" cy="25" r="5" fill="#f59e0b" />
                      <text x="240" y="16" fill="#b45309" fontSize="13" fontWeight="900" textAnchor="middle">S</text>
                      <text x="115" y="150" fill="#1e293b" fontSize="12" fontWeight="bold">A</text>
                      <text x="340" y="152" fill="#1e293b" fontSize="12" fontWeight="bold">B</text>
                      <text x="400" y="108" fill="#1e293b" fontSize="12" fontWeight="bold">C</text>
                      <text x="175" y="105" fill="#64748b" fontSize="12" fontWeight="bold">D</text>
                      <text x="230" y="160" fill="#4f46e5" fontSize="12" fontWeight="bold" textAnchor="middle">
                        Đáy hình vuông a = 6 cm
                      </text>
                    </svg>

                    {/* 🟢 KHUNG THẺ KẾT QUẢ NHANH */}
                    <div className="w-full bg-emerald-50 border-2 border-emerald-300 text-emerald-900 font-bold p-3 rounded-2xl text-center shadow-xs mt-3">
                      <AsmoFormula text="V = \frac{1}{3} S_{\text{đáy}} \cdot h = \frac{1}{3} \cdot 6^2 \cdot 4 = 48\text{ cm}^3 \implies \text{Chọn B}" />
                    </div>
                  </div>
                ) : level === 2 ? (
                  /* Level 2: 5-level Pascal Triangle & Binomial Expansion (x+2)^5 => a3 = C_5^2 * 4 = 40 */
                  <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2 flex-wrap gap-1">
                      <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                        <span className="size-2 rounded-full bg-indigo-600" />
                        <AsmoFormula text="Tam giác Pascal 5 tầng & Khai triển Nhị thức Newton $(x+2)^5$" />
                      </span>
                      <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <AsmoFormula text="$a_3 = C_5^2 \cdot 2^2 = 10 \times 4 = 40$" />
                      </span>
                    </div>

                    <svg viewBox="0 0 480 205" className="w-full max-h-52 select-none font-sans">
                      {/* Pascal Triangle Rows 0 to 5 */}
                      {[
                        { row: 0, items: [1], y: 22 },
                        { row: 1, items: [1, 1], y: 50 },
                        { row: 2, items: [1, 2, 1], y: 78 },
                        { row: 3, items: [1, 3, 3, 1], y: 106 },
                        { row: 4, items: [1, 4, 6, 4, 1], y: 134 },
                        { row: 5, items: [1, 5, 10, 10, 5, 1], y: 165 },
                      ].map((r) => {
                        const count = r.items.length
                        const startX = 240 - ((count - 1) * 44) / 2
                        return (
                          <g key={`pasc-row-${r.row}`}>
                            <text x="35" y={r.y + 4} fill="#94a3b8" fontSize="10" fontWeight="bold">
                              n = {r.row}
                            </text>
                            {r.items.map((val, idx) => {
                              const x = startX + idx * 44
                              const isTarget = r.row === 5 && (idx === 2 || idx === 3)
                              return (
                                <g key={`pasc-node-${r.row}-${idx}`}>
                                  <rect
                                    x={x - 16}
                                    y={r.y - 12}
                                    width="32"
                                    height="24"
                                    rx="7"
                                    fill={isTarget ? '#10b981' : '#ffffff'}
                                    stroke={isTarget ? '#059669' : '#cbd5e1'}
                                    strokeWidth={isTarget ? '2' : '1'}
                                  />
                                  <text
                                    x={x}
                                    y={r.y + 4}
                                    fill={isTarget ? '#ffffff' : '#1e293b'}
                                    fontSize={isTarget ? '12' : '11'}
                                    fontWeight="black"
                                    textAnchor="middle"
                                  >
                                    {val}
                                  </text>
                                </g>
                              )
                            })}
                          </g>
                        )
                      })}
                      {/* Highlighted Arrow to C_5^2 = 10 */}
                      <text x="240" y="196" fill="#047857" fontSize="11" fontWeight="bold" textAnchor="middle">
                        ★ C₅² = 10 (Hệ số nhị thức) ⇒ a₃ = 10 × 2² = 40 (Chọn B)
                      </text>
                    </svg>

                    {/* 🟢 KHUNG THẺ KẾT QUẢ NHANH */}
                    <div className="w-full bg-emerald-50 border-2 border-emerald-300 text-emerald-900 font-bold p-3 rounded-2xl text-center shadow-xs mt-3">
                      <AsmoFormula text="(x+2)^5 \implies a_3 = C_5^2 \cdot 2^2 = 10 \times 4 = 40 \implies \text{Chọn B}" />
                    </div>
                  </div>
                ) : (
                  /* Level 3: Regular Icosahedron (20-face Platonic Solid) Euler Characteristic V - E + F = 2 => E = 30 */
                  <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2 flex-wrap gap-1">
                      <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                        <span className="size-2 rounded-full bg-indigo-600" />
                        <AsmoFormula text="Khối 20 mặt đều (Icosahedron) & Định lý Euler đa diện" />
                      </span>
                      <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <AsmoFormula text="$V - E + F = 2 \implies E = 12 + 20 - 2 = 30$" />
                      </span>
                    </div>

                    <svg viewBox="0 0 480 205" className="w-full max-h-52 select-none font-sans">
                      <defs>
                        <linearGradient id="icoFace1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="#4338ca" stopOpacity="0.4" />
                        </linearGradient>
                        <linearGradient id="icoFace2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
                        </linearGradient>
                        <linearGradient id="icoFace3" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="#7e22ce" stopOpacity="0.4" />
                        </linearGradient>
                      </defs>

                      {/* 3D Isometric Icosahedron projected triangles */}
                      <g transform="translate(110, 100)">
                        {/* Outer polygon edges */}
                        <polygon points="0,-75 65,-38 65,38 0,75 -65,38 -65,-38" fill="none" stroke="#6366f1" strokeWidth="2" />
                        
                        {/* Inner icosahedral triangles */}
                        <polygon points="0,-75 0,-25 65,-38" fill="url(#icoFace1)" stroke="#4338ca" strokeWidth="1.5" />
                        <polygon points="65,-38 0,-25 45,20" fill="url(#icoFace2)" stroke="#0369a1" strokeWidth="1.5" />
                        <polygon points="65,-38 45,20 65,38" fill="url(#icoFace3)" stroke="#7e22ce" strokeWidth="1.5" />
                        <polygon points="0,75 45,20 65,38" fill="url(#icoFace1)" stroke="#4338ca" strokeWidth="1.5" />
                        <polygon points="0,75 -45,20 45,20" fill="url(#icoFace2)" stroke="#0369a1" strokeWidth="1.5" />
                        <polygon points="0,75 -65,38 -45,20" fill="url(#icoFace3)" stroke="#7e22ce" strokeWidth="1.5" />
                        <polygon points="-65,38 -65,-38 -45,20" fill="url(#icoFace1)" stroke="#4338ca" strokeWidth="1.5" />
                        <polygon points="-65,-38 0,-25 -45,20" fill="url(#icoFace2)" stroke="#0369a1" strokeWidth="1.5" />
                        <polygon points="-65,-38 0,-75 0,-25" fill="url(#icoFace3)" stroke="#7e22ce" strokeWidth="1.5" />
                        <polygon points="0,-25 45,20 -45,20" fill="#6366f1" fillOpacity="0.7" stroke="#312e81" strokeWidth="2" />

                        {/* Vertices Golden Nodes */}
                        {[
                          { x: 0, y: -75 },
                          { x: 65, y: -38 },
                          { x: 65, y: 38 },
                          { x: 0, y: 75 },
                          { x: -65, y: 38 },
                          { x: -65, y: -38 },
                          { x: 0, y: -25 },
                          { x: 45, y: 20 },
                          { x: -45, y: 20 },
                        ].map((pt, i) => (
                          <circle key={`ico-v-${i}`} cx={pt.x} cy={pt.y} r="3.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                        ))}
                      </g>

                      {/* Euler Formula Statistics Card on right */}
                      <g transform="translate(245, 20)">
                        <rect width="215" height="165" rx="14" fill="#ffffff" stroke="#e0e7ff" strokeWidth="1.5" />
                        <text x="107" y="24" fill="#312e81" fontSize="12" fontWeight="900" textAnchor="middle">
                          ĐỊNH LÝ EULER ĐA DIỆN LỒI
                        </text>
                        <line x1="15" y1="32" x2="200" y2="32" stroke="#e2e8f0" />

                        <text x="20" y="55" fill="#475569" fontSize="11" fontWeight="bold">• Số đỉnh (Vertices):</text>
                        <text x="195" y="55" fill="#4f46e5" fontSize="12" fontWeight="black" textAnchor="end">V = 12</text>

                        <text x="20" y="80" fill="#475569" fontSize="11" fontWeight="bold">• Số mặt (Faces):</text>
                        <text x="195" y="80" fill="#0284c7" fontSize="12" fontWeight="black" textAnchor="end">F = 20</text>

                        <rect x="15" y="95" width="185" height="30" rx="8" fill="#eef2ff" stroke="#c7d2fe" />
                        <text x="107" y="115" fill="#3730a3" fontSize="12" fontWeight="900" textAnchor="middle">
                          V - E + F = 2
                        </text>

                        <text x="107" y="148" fill="#047857" fontSize="12" fontWeight="900" textAnchor="middle">
                          ⇒ E = 12 + 20 - 2 = 30 cạnh
                        </text>
                      </g>
                    </svg>

                    {/* 🟢 KHUNG THẺ KẾT QUẢ NHANH */}
                    <div className="w-full bg-emerald-50 border-2 border-emerald-300 text-emerald-900 font-bold p-3 rounded-2xl text-center shadow-xs mt-3">
                      <AsmoFormula text="E = V + F - 2 = 12 + 20 - 2 = 30\text{ cạnh} \implies \text{Chọn B}" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* 3. ALGEBRA & VIÈTE (algebra-viete)                                 */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {topicId === 'algebra-viete' && (
              <div className="w-full space-y-3">
                {level === 1 ? (
                  /* Level 1: Parabola y = x^2 - 5x + 3 with roots x1, x2, S=5, P=3 => x1^2 + x2^2 = 19 */
                  <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2 flex-wrap gap-1">
                      <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                        <span className="size-2 rounded-full bg-indigo-600" />
                        Đồ thị Parabol y = x² - 5x + 3 &amp; Nghiệm Viète
                      </span>
                      <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                        <AsmoFormula text="$S = 5, P = 3 \implies x_1^2 + x_2^2 = S^2 - 2P = 19$" />
                      </span>
                    </div>

                    <svg viewBox="0 0 480 205" className="w-full max-h-52 select-none font-sans">
                      {/* Axes */}
                      <line x1="30" y1="135" x2="450" y2="135" stroke="#94a3b8" strokeWidth="2" />
                      <line x1="80" y1="15" x2="80" y2="185" stroke="#94a3b8" strokeWidth="2" />
                      <polygon points="450,131 460,135 450,139" fill="#64748b" />
                      <polygon points="76,15 80,5 84,15" fill="#64748b" />
                      <text x="450" y="150" fill="#475569" fontSize="12" fontWeight="bold">x</text>
                      <text x="65" y="20" fill="#475569" fontSize="12" fontWeight="bold">y</text>
                      <text x="68" y="148" fill="#64748b" fontSize="11" fontWeight="bold">O</text>

                      {/* Axis of Symmetry x = S/2 = 2.5 */}
                      <line x1="220" y1="20" x2="220" y2="180" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 3" />
                      <text x="225" y="30" fill="#7e22ce" fontSize="10" fontWeight="bold">Trục đối xứng x = 2.5</text>

                      {/* Parabola Curve */}
                      <path d="M 70,25 Q 220,235 370,25" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />

                      {/* Roots */}
                      <circle cx="115" cy="135" r="5.5" fill="#e11d48" />
                      <text x="105" y="155" fill="#be123c" fontSize="11" fontWeight="extrabold">x₁ ≈ 0.70</text>
                      <circle cx="325" cy="135" r="5.5" fill="#059669" />
                      <text x="315" y="155" fill="#047857" fontSize="11" fontWeight="extrabold">x₂ ≈ 4.30</text>

                      {/* Vertex */}
                      <circle cx="220" cy="168" r="4.5" fill="#f59e0b" />
                      <text x="228" y="180" fill="#b45309" fontSize="10" fontWeight="bold">Đỉnh I(2.5, -3.25)</text>

                      {/* Viète Card on top-right */}
                      <g transform="translate(355, 30)">
                        <rect width="115" height="70" rx="10" fill="#ffffff" stroke="#c7d2fe" strokeWidth="1.5" />
                        <text x="10" y="20" fill="#4338ca" fontSize="10" fontWeight="bold">S = x₁+x₂ = 5</text>
                        <text x="10" y="38" fill="#4338ca" fontSize="10" fontWeight="bold">P = x₁x₂ = 3</text>
                        <text x="10" y="58" fill="#047857" fontSize="11" fontWeight="900">x₁²+x₂² = 19</text>
                      </g>
                    </svg>
                  </div>
                ) : level === 2 ? (
                  /* Level 2: Parabola y = x^2 - 4x + 1 with roots x1, x2 => x1/x2 + x2/x1 = 14 */
                  <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2 flex-wrap gap-1">
                      <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                        <span className="size-2 rounded-full bg-indigo-600" />
                        Đồ thị Parabol y = x² - 4x + 1 &amp; Phân thức đối xứng
                      </span>
                      <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <AsmoFormula text="$S = 4, P = 1 \implies M = \frac{S^2-2P}{P} = 14$" />
                      </span>
                    </div>

                    <svg viewBox="0 0 480 205" className="w-full max-h-52 select-none font-sans">
                      {/* Axes */}
                      <line x1="30" y1="135" x2="450" y2="135" stroke="#94a3b8" strokeWidth="2" />
                      <line x1="80" y1="15" x2="80" y2="185" stroke="#94a3b8" strokeWidth="2" />
                      <polygon points="450,131 460,135 450,139" fill="#64748b" />
                      <polygon points="76,15 80,5 84,15" fill="#64748b" />
                      <text x="450" y="150" fill="#475569" fontSize="12" fontWeight="bold">x</text>
                      <text x="65" y="20" fill="#475569" fontSize="12" fontWeight="bold">y</text>
                      <text x="68" y="148" fill="#64748b" fontSize="11" fontWeight="bold">O</text>

                      {/* Axis of Symmetry x = 2 */}
                      <line x1="200" y1="20" x2="200" y2="180" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 3" />
                      <text x="205" y="30" fill="#7e22ce" fontSize="10" fontWeight="bold">Trục x = 2</text>

                      {/* Parabola Curve y = x^2 - 4x + 1 */}
                      <path d="M 60,30 Q 200,225 340,30" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />

                      {/* Roots */}
                      <circle cx="105" cy="135" r="5" fill="#e11d48" />
                      <text x="95" y="153" fill="#be123c" fontSize="10" fontWeight="extrabold">x₁ = 2-√3</text>
                      <circle cx="295" cy="135" r="5" fill="#059669" />
                      <text x="285" y="153" fill="#047857" fontSize="10" fontWeight="extrabold">x₂ = 2+√3</text>

                      {/* Formula Card */}
                      <g transform="translate(340, 25)">
                        <rect width="130" height="85" rx="10" fill="#ffffff" stroke="#c7d2fe" strokeWidth="1.5" />
                        <text x="12" y="20" fill="#4338ca" fontSize="10" fontWeight="bold">S = 4, P = 1</text>
                        <text x="12" y="38" fill="#4338ca" fontSize="10" fontWeight="bold">x₁/x₂ + x₂/x₁</text>
                        <text x="12" y="56" fill="#312e81" fontSize="10" fontWeight="bold">= (S² - 2P)/P</text>
                        <text x="12" y="75" fill="#047857" fontSize="12" fontWeight="900">= 14 (Chọn B)</text>
                      </g>
                    </svg>
                  </div>
                ) : (
                  /* Level 3: Family of Parabolas shifting with parameter m: Delta' = (m-1)^2 - (m^2-3) = 4 - 2m > 0 => m < 2 */
                  <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2 flex-wrap gap-1">
                      <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                        <span className="size-2 rounded-full bg-indigo-600" />
                        <AsmoFormula text="Họ Parabol theo tham số $m$ & Điều kiện 2 nghiệm $\Delta' = 4 - 2m > 0 \Rightarrow m < 2$" />
                      </span>
                      <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <AsmoFormula text="$\Delta' = (m-1)^2 - (m^2-3) = 4 - 2m > 0 \iff m < 2$" />
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-600">Chọn tham số m:</span>
                      {[
                        { val: 1, label: 'm = 1 (< 2): 2 Nghiệm', color: 'bg-indigo-600 text-white' },
                        { val: 2, label: 'm = 2 (= 2): Tiếp xúc (1 nghiệm)', color: 'bg-amber-500 text-white' },
                        { val: 3, label: 'm = 3 (> 2): Vô nghiệm', color: 'bg-rose-500 text-white' },
                      ].map((item) => (
                        <button
                          key={`m-btn-${item.val}`}
                          type="button"
                          onClick={() => setVieteM(item.val)}
                          className={cn(
                            'px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer',
                            vieteM === item.val
                              ? `${item.color} shadow-xs scale-105`
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100',
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <svg viewBox="0 0 480 180" className="w-full max-h-48 select-none font-sans">
                      {/* Axes */}
                      <line x1="30" y1="120" x2="450" y2="120" stroke="#94a3b8" strokeWidth="2" />
                      <line x1="80" y1="15" x2="80" y2="165" stroke="#94a3b8" strokeWidth="2" />
                      <polygon points="450,116 460,120 450,124" fill="#64748b" />
                      <polygon points="76,15 80,5 84,15" fill="#64748b" />
                      <text x="450" y="136" fill="#475569" fontSize="12" fontWeight="bold">x</text>
                      <text x="65" y="20" fill="#475569" fontSize="12" fontWeight="bold">y</text>

                      {/* Parabola 1: m = 1 (2 roots, cuts x-axis) */}
                      <path
                        d="M 90,20 Q 200,195 310,20"
                        fill="none"
                        stroke="#4f46e5"
                        strokeWidth={vieteM === 1 ? '3.5' : '1.5'}
                        strokeOpacity={vieteM === 1 ? '1' : '0.3'}
                      />
                      {vieteM === 1 && (
                        <>
                          <circle cx="125" cy="120" r="5" fill="#4f46e5" />
                          <circle cx="275" cy="120" r="5" fill="#4f46e5" />
                          <text x="200" y="160" fill="#4338ca" fontSize="11" fontWeight="bold" textAnchor="middle">
                            m = 1: Δ' = 2 &gt; 0 ⇒ 2 nghiệm phân biệt
                          </text>
                        </>
                      )}

                      {/* Parabola 2: m = 2 (1 tangent root at x=1) */}
                      <path
                        d="M 120,20 Q 210,120 300,20"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth={vieteM === 2 ? '3.5' : '1.5'}
                        strokeDasharray={vieteM === 2 ? 'none' : '4 3'}
                        strokeOpacity={vieteM === 2 ? '1' : '0.3'}
                      />
                      {vieteM === 2 && (
                        <>
                          <circle cx="210" cy="120" r="5" fill="#f59e0b" />
                          <text x="210" y="150" fill="#b45309" fontSize="11" fontWeight="bold" textAnchor="middle">
                            m = 2: Δ' = 0 ⇒ Nghiệm kép x = 1
                          </text>
                        </>
                      )}

                      {/* Parabola 3: m = 3 (0 roots, above x-axis) */}
                      <path
                        d="M 130,20 Q 220,60 310,20"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth={vieteM === 3 ? '3.5' : '1.5'}
                        strokeDasharray={vieteM === 3 ? 'none' : '3 3'}
                        strokeOpacity={vieteM === 3 ? '1' : '0.3'}
                      />
                      {vieteM === 3 && (
                        <text x="220" y="150" fill="#dc2626" fontSize="11" fontWeight="bold" textAnchor="middle">
                          m = 3: Δ' = -2 &lt; 0 ⇒ Vô nghiệm
                        </text>
                      )}

                      {/* Conclusion Badge */}
                      <g transform="translate(340, 20)">
                        <rect width="130" height="60" rx="8" fill="#eef2ff" stroke="#c7d2fe" />
                        <text x="65" y="25" fill="#312e81" fontSize="11" fontWeight="bold" textAnchor="middle">
                          ĐK có 2 nghiệm:
                        </text>
                        <text x="65" y="46" fill="#047857" fontSize="13" fontWeight="900" textAnchor="middle">
                          m &lt; 2 (Chọn B)
                        </text>
                      </g>
                    </svg>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* 4. PYTHAGORAS & GEOMETRY (pythagoras-geometry)                     */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {topicId === 'pythagoras-geometry' && (
              <div className="w-full space-y-3">
                {level === 1 ? (
                  /* Level 1: Right triangle sides 6, 8, 10 and altitude h = 4.8 cm */
                  <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2 flex-wrap gap-1">
                      <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                        <span className="size-2 rounded-full bg-indigo-600" />
                        <AsmoFormula text="Tam giác vuông $a=6, b=8, c=10\text{ cm}$ & Đường cao $h = 4.8\text{ cm}$" />
                      </span>
                      <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <AsmoFormula text="$c = \sqrt{6^2+8^2}=10\text{ cm}, \quad h = \frac{a \cdot b}{c} = 4.8\text{ cm}$" />
                      </span>
                    </div>

                    <svg viewBox="0 0 480 205" className="w-full max-h-52 select-none font-sans">
                      <defs>
                        <linearGradient id="pythGradL1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#c084fc" stopOpacity="0.1" />
                        </linearGradient>
                      </defs>

                      {/* Triangle ABC right angled at C */}
                      <polygon points="80,160 380,160 80,30" fill="url(#pythGradL1)" stroke="#4f46e5" strokeWidth="3" />
                      
                      {/* Right Angle Square at C(80, 160) */}
                      <rect x="80" y="142" width="18" height="18" fill="none" stroke="#f59e0b" strokeWidth="2" />
                      <circle cx="89" cy="151" r="2.5" fill="#f59e0b" />

                      {/* Leg a = 6 cm */}
                      <line x1="80" y1="160" x2="80" y2="30" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
                      <text x="65" y="100" fill="#0369a1" fontSize="13" fontWeight="900" textAnchor="end">
                        Cạnh góc vuông a = 6 cm
                      </text>

                      {/* Leg b = 8 cm */}
                      <line x1="80" y1="160" x2="380" y2="160" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
                      <text x="230" y="184" fill="#0369a1" fontSize="13" fontWeight="900" textAnchor="middle">
                        Cạnh góc vuông b = 8 cm
                      </text>

                      {/* Hypotenuse c = 10 cm */}
                      <line x1="80" y1="30" x2="380" y2="160" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
                      <text x="250" y="85" fill="#b45309" fontSize="14" fontWeight="900">
                        Cạnh huyền c = 10 cm
                      </text>

                      {/* Altitude h = 4.8 cm */}
                      <line x1="80" y1="160" x2="150" y2="60" stroke="#e11d48" strokeWidth="2.5" strokeDasharray="4 3" />
                      <circle cx="150" cy="60" r="4" fill="#e11d48" />
                      <text x="135" y="125" fill="#be123c" fontSize="12" fontWeight="bold">
                        h = 4.8 cm
                      </text>

                      {/* Vertex Labels */}
                      <text x="75" y="22" fill="#1e293b" fontSize="12" fontWeight="bold">A</text>
                      <text x="65" y="172" fill="#1e293b" fontSize="12" fontWeight="bold">C (90°)</text>
                      <text x="390" y="165" fill="#1e293b" fontSize="12" fontWeight="bold">B</text>
                    </svg>
                  </div>
                ) : level === 2 ? (
                  /* Level 2: Oxy coordinate plane distance between A(1,2) and B(4,6) => d = 5 */
                  <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2 flex-wrap gap-1">
                      <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                        <span className="size-2 rounded-full bg-indigo-600" />
                        <AsmoFormula text="Khoảng cách hai điểm toạ độ Oxy $A(1,2) \to B(4,6) \Rightarrow d = \sqrt{3^2+4^2}=5$" />
                      </span>
                      <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <AsmoFormula text="$d = \sqrt{\Delta x^2 + \Delta y^2} = \sqrt{3^2 + 4^2} = 5$" />
                      </span>
                    </div>

                    <svg viewBox="0 0 480 205" className="w-full max-h-52 select-none font-sans">
                      {/* Grid lines */}
                      <line x1="40" y1="165" x2="440" y2="165" stroke="#94a3b8" strokeWidth="2" />
                      <line x1="80" y1="20" x2="80" y2="185" stroke="#94a3b8" strokeWidth="2" />
                      <polygon points="440,161 450,165 440,169" fill="#64748b" />
                      <polygon points="76,20 80,10 84,20" fill="#64748b" />
                      <text x="442" y="180" fill="#475569" fontSize="12" fontWeight="bold">x</text>
                      <text x="65" y="20" fill="#475569" fontSize="12" fontWeight="bold">y</text>
                      <text x="68" y="178" fill="#64748b" fontSize="11" fontWeight="bold">O</text>

                      {/* Right triangle on Oxy: A(1, 2) -> (140, 130), B(4, 6) -> (320, 50), C(4, 2) -> (320, 130) */}
                      <polygon points="140,130 320,130 320,50" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2" />
                      <line x1="140" y1="130" x2="320" y2="130" stroke="#0284c7" strokeWidth="3" />
                      <line x1="320" y1="130" x2="320" y2="50" stroke="#0284c7" strokeWidth="3" />
                      <line x1="140" y1="130" x2="320" y2="50" stroke="#d97706" strokeWidth="4" />

                      <circle cx="140" cy="130" r="5.5" fill="#4f46e5" />
                      <text x="125" y="148" fill="#312e81" fontSize="12" fontWeight="bold">A(1,2)</text>
                      <circle cx="320" cy="50" r="5.5" fill="#4f46e5" />
                      <text x="330" y="48" fill="#312e81" fontSize="12" fontWeight="bold">B(4,6)</text>

                      <text x="230" y="146" fill="#0369a1" fontSize="12" fontWeight="bold" textAnchor="middle">Δx = 3</text>
                      <text x="345" y="95" fill="#0369a1" fontSize="12" fontWeight="bold">Δy = 4</text>
                      <text x="215" y="80" fill="#b45309" fontSize="14" fontWeight="black">d(AB) = 5 (Chọn B)</text>
                    </svg>
                  </div>
                ) : (
                  /* Level 3: Rhombus with orthogonal diagonals d1=12, d2=16 => 4 right triangles (6,8,10) => side a = 10 */
                  <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2 flex-wrap gap-1">
                      <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                        <span className="size-2 rounded-full bg-indigo-600" />
                        <AsmoFormula text="Hình thoi 2 đường chéo $d_1=12, d_2=16 \Rightarrow$ 4 tam giác vuông $(6,8,10) \Rightarrow$ Cạnh $a = 10\text{ cm}$" />
                      </span>
                      <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <AsmoFormula text="$a = \sqrt{6^2 + 8^2} = 10\text{ cm}$" />
                      </span>
                    </div>

                    <svg viewBox="0 0 480 205" className="w-full max-h-52 select-none font-sans">
                      <defs>
                        <linearGradient id="rhombusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.15" />
                        </linearGradient>
                      </defs>

                      {/* Rhombus ABCD centered at (240, 100) */}
                      {/* Diagonals: Horizontal d1 = 12 (dx = 100 px => 6 cm), Vertical d2 = 16 (dy = 75 px => 8 cm) */}
                      <polygon points="240,25 350,100 240,175 130,100" fill="url(#rhombusGrad)" stroke="#4f46e5" strokeWidth="3" />

                      {/* Diagonals */}
                      <line x1="130" y1="100" x2="350" y2="100" stroke="#0284c7" strokeWidth="2.5" strokeDasharray="4 3" />
                      <line x1="240" y1="25" x2="240" y2="175" stroke="#0284c7" strokeWidth="2.5" strokeDasharray="4 3" />

                      {/* Center right angle markers */}
                      <rect x="240" y="85" width="15" height="15" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                      <circle cx="240" cy="100" r="4" fill="#0284c7" />
                      <text x="248" y="116" fill="#0369a1" fontSize="11" fontWeight="bold">O (90°)</text>

                      {/* Labels */}
                      <text x="240" y="16" fill="#1e293b" fontSize="12" fontWeight="bold" textAnchor="middle">A</text>
                      <text x="360" y="105" fill="#1e293b" fontSize="12" fontWeight="bold">B</text>
                      <text x="240" y="190" fill="#1e293b" fontSize="12" fontWeight="bold" textAnchor="middle">C</text>
                      <text x="115" y="105" fill="#1e293b" fontSize="12" fontWeight="bold">D</text>

                      <text x="185" y="93" fill="#0369a1" fontSize="11" fontWeight="bold">6 cm</text>
                      <text x="285" y="93" fill="#0369a1" fontSize="11" fontWeight="bold">6 cm</text>
                      <text x="246" y="60" fill="#0369a1" fontSize="11" fontWeight="bold">8 cm</text>
                      <text x="246" y="145" fill="#0369a1" fontSize="11" fontWeight="bold">8 cm</text>

                      {/* Outer sides a = 10 */}
                      <text x="305" y="55" fill="#b45309" fontSize="13" fontWeight="900">a = 10 cm</text>
                      <text x="165" y="55" fill="#b45309" fontSize="13" fontWeight="900">a = 10 cm</text>
                    </svg>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* 5. ALGEBRAIC IDENTITIES & POLYNOMIALS (algebra-polynomials)        */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {topicId === 'algebra-polynomials' && (
              <div className="w-full space-y-3">
                {level === 1 ? (
                  /* Level 1: 2D Tile Area Model (a+b)^2 = a^2 + 2ab + b^2 */
                  <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2 flex-wrap gap-1">
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
                      <div className="size-40 grid grid-cols-3 grid-rows-3 gap-1.5 p-2 bg-slate-200/90 rounded-2xl border-2 border-indigo-300 shadow-sm">
                        <div className="col-span-2 row-span-2 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-2xs">
                          a²
                        </div>
                        <div className="col-span-1 row-span-2 bg-amber-400 rounded-xl flex items-center justify-center font-bold text-amber-950 text-sm shadow-2xs">
                          ab
                        </div>
                        <div className="col-span-2 row-span-1 bg-amber-400 rounded-xl flex items-center justify-center font-bold text-amber-950 text-sm shadow-2xs">
                          ab
                        </div>
                        <div className="col-span-1 row-span-1 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-2xs">
                          b²
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 font-mono text-xs max-w-xs">
                        <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-200 text-indigo-900 font-bold">
                          <AsmoFormula text="• Tổng các ô diện tích: $a^2 + ab + ab + b^2$" />
                        </div>
                        <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-emerald-900 font-bold">
                          <AsmoFormula text="$= a^2 + 2ab + b^2 = (a+b)^2$" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : level === 2 ? (
                  /* Level 2: Geometric Difference of Two Squares (2x+1)^2 - (2x-1)^2 = 8x */
                  <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2 flex-wrap gap-1">
                      <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                        <span className="size-2 rounded-full bg-indigo-600" />
                        <AsmoFormula text="Biểu diễn hình học hiệu 2 hình vuông $(2x+1)^2 - (2x-1)^2 = 8x$" />
                      </span>
                      <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                        <AsmoFormula text="$a^2 - b^2 = (a-b)(a+b) = 2 \times 4x = 8x$" />
                      </span>
                    </div>

                    <svg viewBox="0 0 480 195" className="w-full max-h-52 select-none font-sans">
                      {/* Large Square (2x+1)^2 */}
                      <rect x="40" y="20" width="150" height="150" rx="8" fill="#4f46e5" fillOpacity="0.85" stroke="#312e81" strokeWidth="2" />
                      <text x="115" y="95" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle">
                        (2x + 1)²
                      </text>

                      {/* Inner Cut-out (2x-1)^2 */}
                      <rect x="40" y="70" width="100" height="100" rx="6" fill="#f43f5e" fillOpacity="0.4" stroke="#e11d48" strokeWidth="2" strokeDasharray="4 3" />
                      <text x="90" y="125" fill="#ffe4e6" fontSize="11" fontWeight="bold" textAnchor="middle">
                        (2x - 1)²
                      </text>

                      {/* Arrow */}
                      <line x1="210" y1="95" x2="245" y2="95" stroke="#6366f1" strokeWidth="3" />
                      <polygon points="245,91 255,95 245,99" fill="#6366f1" />

                      {/* Resulting Rectangles */}
                      <rect x="270" y="30" width="160" height="130" rx="8" fill="#059669" fillOpacity="0.9" stroke="#065f46" strokeWidth="2" />
                      <text x="350" y="80" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle">
                        Hiệu 2 bình phương:
                      </text>
                      <text x="350" y="105" fill="#d1fae5" fontSize="16" fontWeight="black" textAnchor="middle">
                        2 × 4x = 8x
                      </text>
                      <text x="350" y="135" fill="#a7f3d0" fontSize="11" fontWeight="bold" textAnchor="middle">
                        (Chọn đáp án B)
                      </text>
                    </svg>
                  </div>
                ) : (
                  /* Level 3: Parabola Vertex Minimum y = x^2 - 6x + 14 = (x-3)^2 + 5 => A_min = 5 */
                  <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2 flex-wrap gap-1">
                      <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                        <span className="size-2 rounded-full bg-indigo-600" />
                        <AsmoFormula text="Đồ thị Parabol $y = x^2 - 6x + 14 = (x-3)^2 + 5$ & Đỉnh $I(3, 5)$" />
                      </span>
                      <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <AsmoFormula text="$A_{\min} = 5 \text{ khi } x = 3$" />
                      </span>
                    </div>

                    <svg viewBox="0 0 480 205" className="w-full max-h-52 select-none font-sans">
                      {/* Axes */}
                      <line x1="30" y1="160" x2="450" y2="160" stroke="#94a3b8" strokeWidth="2" />
                      <line x1="80" y1="15" x2="80" y2="185" stroke="#94a3b8" strokeWidth="2" />
                      <polygon points="450,156 460,160 450,164" fill="#64748b" />
                      <polygon points="76,15 80,5 84,15" fill="#64748b" />
                      <text x="450" y="176" fill="#475569" fontSize="12" fontWeight="bold">x</text>
                      <text x="65" y="20" fill="#475569" fontSize="12" fontWeight="bold">y</text>
                      <text x="68" y="172" fill="#64748b" fontSize="11" fontWeight="bold">O</text>

                      {/* Minimum horizontal tangent y = 5 */}
                      <line x1="40" y1="90" x2="440" y2="90" stroke="#10b981" strokeWidth="2" strokeDasharray="4 3" />
                      <text x="410" y="82" fill="#047857" fontSize="11" fontWeight="bold">y = 5 (Min)</text>

                      {/* Parabola Curve y = (x-3)^2 + 5 */}
                      <path d="M 100,20 Q 230,160 360,20" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />

                      {/* Axis of symmetry x = 3 */}
                      <line x1="230" y1="20" x2="230" y2="160" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="3 3" />

                      {/* Vertex I(3, 5) */}
                      <circle cx="230" cy="90" r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                      <text x="230" y="112" fill="#b45309" fontSize="12" fontWeight="black" textAnchor="middle">
                        Đỉnh I(3, 5) ⇒ A_min = 5
                      </text>
                    </svg>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* 6. COMBINATORICS & PROBABILITY (combinatorics-probability)        */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {topicId === 'combinatorics-probability' && (
              <div className="w-full space-y-3">
                {level === 1 || level === 2 ? (
                  /* Level 1 & Level 2: Dice Matrix 6x6 & Permutation Tree */
                  <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2 flex-wrap gap-1">
                      <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                        <span className="size-2 rounded-full bg-indigo-600" />
                        {level === 1
                          ? 'Ma trận 36 biến cố gieo 2 con xúc xắc & Tổng bằng 7'
                          : 'Ma trận 36 biến cố & Sơ đồ cây chọn 2 người trong 10 người'}
                      </span>
                      <span className="text-[11px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300 font-bold">
                        <AsmoFormula text={level === 1 ? 'P = 6/36 = 1/6' : '$A_{10}^2 = 90\\text{ cách}$'} />
                      </span>
                    </div>

                    {level === 1 ? (
                      /* 6x6 Dice Matrix */
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
                              >
                                {r + 1}+{c + 1}
                              </div>
                            )
                          }),
                        )}
                      </div>
                    ) : (
                      /* Level 2: Permutation Tree Diagram A_10^2 = 90 */
                      <svg viewBox="0 0 480 195" className="w-full max-h-52 select-none font-sans">
                        {/* Root */}
                        <rect x="20" y="80" width="90" height="35" rx="10" fill="#4f46e5" />
                        <text x="65" y="102" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                          10 Học Sinh
                        </text>

                        {/* Stage 1: Class President (10 ways) */}
                        <line x1="110" y1="97" x2="160" y2="40" stroke="#6366f1" strokeWidth="2" />
                        <line x1="110" y1="97" x2="160" y2="97" stroke="#6366f1" strokeWidth="2" />
                        <line x1="110" y1="97" x2="160" y2="155" stroke="#6366f1" strokeWidth="2" />

                        <rect x="160" y="25" width="120" height="30" rx="8" fill="#e0e7ff" stroke="#6366f1" />
                        <text x="220" y="44" fill="#312e81" fontSize="10" fontWeight="bold" textAnchor="middle">
                          Lớp trưởng (10 cách)
                        </text>

                        <rect x="160" y="82" width="120" height="30" rx="8" fill="#e0e7ff" stroke="#6366f1" />
                        <text x="220" y="101" fill="#312e81" fontSize="10" fontWeight="bold" textAnchor="middle">
                          • Bạn thứ 1, 2, ... 10
                        </text>

                        {/* Stage 2: Vice President (9 ways) */}
                        <line x1="280" y1="40" x2="330" y2="40" stroke="#10b981" strokeWidth="2" />
                        <line x1="280" y1="97" x2="330" y2="97" stroke="#10b981" strokeWidth="2" />

                        <rect x="330" y="25" width="130" height="30" rx="8" fill="#ecfdf5" stroke="#10b981" />
                        <text x="395" y="44" fill="#065f46" fontSize="10" fontWeight="bold" textAnchor="middle">
                          Lớp phó (9 cách còn lại)
                        </text>

                        {/* Total outcome */}
                        <rect x="220" y="140" width="240" height="40" rx="10" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
                        <text x="340" y="165" fill="#78350f" fontSize="13" fontWeight="900" textAnchor="middle">
                          A₁₀² = 10 × 9 = 90 cách (Chọn B)
                        </text>
                      </svg>
                    )}
                  </div>
                ) : (
                  /* Level 3: 3 Urns (Red, Blue, Yellow) Worst Case (3,3,3) + 1 = 10 */
                  <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2 flex-wrap gap-1">
                      <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                        <span className="size-2 rounded-full bg-indigo-600" />
                        <AsmoFormula text="Nguyên lý Dirichlet 3 Hộp bi xấu nhất: $(3, 3, 3) + 1 = 10\text{ viên bi}$" />
                      </span>
                      <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <AsmoFormula text="$N_{\min} = 3 \times (4-1) + 1 = 10$" />
                      </span>
                    </div>

                    <svg viewBox="0 0 480 195" className="w-full max-h-52 select-none font-sans">
                      {/* Box 1: Red */}
                      <rect x="30" y="30" width="100" height="90" rx="12" fill="#fee2e2" stroke="#ef4444" strokeWidth="2" />
                      <text x="80" y="50" fill="#b91c1c" fontSize="11" fontWeight="bold" textAnchor="middle">Bi Đỏ (10)</text>
                      <circle cx="60" cy="75" r="7" fill="#ef4444" />
                      <circle cx="80" cy="75" r="7" fill="#ef4444" />
                      <circle cx="100" cy="75" r="7" fill="#ef4444" />
                      <text x="80" y="105" fill="#991b1b" fontSize="11" fontWeight="900" textAnchor="middle">Lấy 3 viên</text>

                      {/* Box 2: Blue */}
                      <rect x="150" y="30" width="100" height="90" rx="12" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
                      <text x="200" y="50" fill="#0369a1" fontSize="11" fontWeight="bold" textAnchor="middle">Bi Xanh (8)</text>
                      <circle cx="180" cy="75" r="7" fill="#0284c7" />
                      <circle cx="200" cy="75" r="7" fill="#0284c7" />
                      <circle cx="220" cy="75" r="7" fill="#0284c7" />
                      <text x="200" y="105" fill="#075985" fontSize="11" fontWeight="900" textAnchor="middle">Lấy 3 viên</text>

                      {/* Box 3: Yellow */}
                      <rect x="270" y="30" width="100" height="90" rx="12" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
                      <text x="320" y="50" fill="#b45309" fontSize="11" fontWeight="bold" textAnchor="middle">Bi Vàng (6)</text>
                      <circle cx="300" cy="75" r="7" fill="#f59e0b" />
                      <circle cx="320" cy="75" r="7" fill="#f59e0b" />
                      <circle cx="340" cy="75" r="7" fill="#f59e0b" />
                      <text x="320" y="105" fill="#92400e" fontSize="11" fontWeight="900" textAnchor="middle">Lấy 3 viên</text>

                      {/* 10th Ball */}
                      <circle cx="425" cy="75" r="18" fill="#10b981" stroke="#059669" strokeWidth="3" />
                      <text x="425" y="80" fill="#ffffff" fontSize="13" fontWeight="black" textAnchor="middle">+1</text>
                      <text x="425" y="110" fill="#047857" fontSize="10" fontWeight="bold" textAnchor="middle">Viên thứ 10</text>

                      {/* Result Box */}
                      <rect x="50" y="140" width="380" height="40" rx="10" fill="#ecfdf5" stroke="#10b981" strokeWidth="2" />
                      <text x="240" y="165" fill="#064e3b" fontSize="13" fontWeight="900" textAnchor="middle">
                        Xấu nhất: (3 + 3 + 3) + 1 = 10 viên bi (Chọn B)
                      </text>
                    </svg>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* 7. NUMBER THEORY (number-theory-divisibility)                      */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {topicId === 'number-theory-divisibility' && (
              <div className="w-full space-y-3">
                {level === 1 ? (
                  /* Level 1: 4-step modulo cycle wheel (2 -> 4 -> 8 -> 6) and 2024 mod 4 => 6 */
                  <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2 flex-wrap gap-1">
                      <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                        <span className="size-2 rounded-full bg-indigo-600" />
                        Chu kỳ tận cùng 2ⁿ &amp; Phép chia Modulo 4
                      </span>
                      <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <AsmoFormula text="$2^{2024} \equiv 2^4 \equiv 6 \pmod{10}$" />
                      </span>
                    </div>

                    <svg viewBox="0 0 480 195" className="w-full max-h-52 select-none font-sans">
                      {/* Cycle Dial */}
                      <g transform="translate(130, 95)">
                        <circle cx="0" cy="0" r="65" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
                        
                        {/* Step 1: 2^1 = 2 */}
                        <circle cx="0" cy="-65" r="18" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2" />
                        <text x="0" y="-60" fill="#312e81" fontSize="12" fontWeight="900" textAnchor="middle">2¹=2</text>

                        {/* Step 2: 2^2 = 4 */}
                        <circle cx="65" cy="0" r="18" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2" />
                        <text x="65" y="5" fill="#312e81" fontSize="12" fontWeight="900" textAnchor="middle">2²=4</text>

                        {/* Step 3: 2^3 = 8 */}
                        <circle cx="0" cy="65" r="18" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2" />
                        <text x="0" y="70" fill="#312e81" fontSize="12" fontWeight="900" textAnchor="middle">2³=8</text>

                        {/* Step 4: 2^4 = 6 (Target) */}
                        <circle cx="-65" cy="0" r="22" fill="#10b981" stroke="#059669" strokeWidth="3" />
                        <text x="-65" y="5" fill="#ffffff" fontSize="13" fontWeight="black" textAnchor="middle">2⁴=6</text>

                        <text x="0" y="5" fill="#6366f1" fontSize="11" fontWeight="bold" textAnchor="middle">Chu kỳ T=4</text>
                      </g>

                      {/* Right calculation box */}
                      <g transform="translate(260, 25)">
                        <rect width="190" height="145" rx="12" fill="#ffffff" stroke="#c7d2fe" strokeWidth="1.5" />
                        <text x="95" y="25" fill="#312e81" fontSize="12" fontWeight="900" textAnchor="middle">
                          PHÉP CHIA MODULO 4
                        </text>
                        <line x1="15" y1="35" x2="175" y2="35" stroke="#e2e8f0" />
                        
                        <text x="20" y="60" fill="#475569" fontSize="11" fontWeight="bold">• Số mũ: 2024</text>
                        <text x="20" y="85" fill="#475569" fontSize="11" fontWeight="bold">• 2024 ÷ 4 = 506 (dư 0)</text>
                        <text x="20" y="110" fill="#047857" fontSize="11" fontWeight="bold">• Rơi vào bước thứ 4: tận cùng 6</text>

                        <rect x="15" y="118" width="160" height="22" rx="6" fill="#ecfdf5" />
                        <text x="95" y="133" fill="#065f46" fontSize="11" fontWeight="black" textAnchor="middle">
                          Đáp án: 6 (Chọn C)
                        </text>
                      </g>
                    </svg>
                  </div>
                ) : level === 2 ? (
                  /* Level 2: Grouping brackets (1+2) + 2^2(1+2) + ... divisible by 3 */
                  <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2 flex-wrap gap-1">
                      <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                        <span className="size-2 rounded-full bg-indigo-600" />
                        <AsmoFormula text="Sơ đồ ghép cặp nhóm luỹ thừa $(1+2) + 2^2(1+2) + \dots \,\vdots\, 3$" />
                      </span>
                      <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <AsmoFormula text="$S = (1+2) \times Q = 3Q \,\vdots\, 3$" />
                      </span>
                    </div>

                    <svg viewBox="0 0 480 195" className="w-full max-h-52 select-none font-sans">
                      {/* Group 1 */}
                      <rect x="30" y="30" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" strokeWidth="2" />
                      <text x="90" y="55" fill="#312e81" fontSize="11" fontWeight="bold" textAnchor="middle">Nhóm 1</text>
                      <text x="90" y="75" fill="#4338ca" fontSize="12" fontWeight="black" textAnchor="middle">(1 + 2) = 3</text>

                      {/* Plus */}
                      <text x="165" y="70" fill="#64748b" fontSize="16" fontWeight="bold">+</text>

                      {/* Group 2 */}
                      <rect x="180" y="30" width="130" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" strokeWidth="2" />
                      <text x="245" y="55" fill="#312e81" fontSize="11" fontWeight="bold" textAnchor="middle">Nhóm 2</text>
                      <text x="245" y="75" fill="#4338ca" fontSize="12" fontWeight="black" textAnchor="middle">2²(1 + 2) = 3×4</text>

                      {/* Plus dots */}
                      <text x="325" y="70" fill="#64748b" fontSize="16" fontWeight="bold">+ ...</text>

                      {/* Factorization banner */}
                      <foreignObject x="30" y="122" width="420" height="50" className="overflow-visible">
                        <div className="flex items-center justify-center h-full px-3 py-1.5 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 font-bold text-xs shadow-xs">
                          <AsmoFormula text="$S = 3 \times (1 + 2^2 + 2^4 + \dots) \,\vdots\, 3 \text{ (Số dư = 0)} \implies \text{Chọn A}$" />
                        </div>
                      </foreignObject>
                    </svg>
                  </div>
                ) : (
                  /* Level 3: 5 Consecutive Integers Number Axis (n-2)(n-1)n(n+1)(n+2) divisible by 30 */
                  <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2 flex-wrap gap-1">
                      <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                        <span className="size-2 rounded-full bg-indigo-600" />
                        <AsmoFormula text="Trục số 5 số nguyên liên tiếp $(n-2)(n-1)n(n+1)(n+2) \,\vdots\, 30$" />
                      </span>
                      <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <AsmoFormula text="$n^5 - n \,\vdots\, 30 \text{ với mọi } n \in \mathbb{Z}$" />
                      </span>
                    </div>

                    <svg viewBox="0 0 480 195" className="w-full max-h-52 select-none font-sans">
                      {/* Number Axis */}
                      <line x1="30" y1="80" x2="450" y2="80" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
                      <polygon points="450,76 460,80 450,84" fill="#64748b" />

                      {/* 5 consecutive points */}
                      {[
                        { label: 'n - 2', x: 80, div: 'Bội của 2' },
                        { label: 'n - 1', x: 155, div: 'Bội của 3' },
                        { label: 'n', x: 230, div: 'Bội của 5' },
                        { label: 'n + 1', x: 305, div: 'Bội của 2' },
                        { label: 'n + 2', x: 380, div: 'Bội của 3' },
                      ].map((pt, i) => (
                        <g key={`axis-pt-${i}`}>
                          <circle cx={pt.x} cy="80" r="8" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
                          <text x={pt.x} y="62" fill="#312e81" fontSize="12" fontWeight="900" textAnchor="middle">
                            {pt.label}
                          </text>
                          <rect x={pt.x - 32} y="95" width="64" height="20" rx="6" fill="#e0e7ff" />
                          <text x={pt.x} y="109" fill="#4338ca" fontSize="9" fontWeight="bold" textAnchor="middle">
                            {pt.div}
                          </text>
                        </g>
                      ))}

                      {/* Divisibility Summary Box */}
                      <foreignObject x="30" y="125" width="420" height="50" className="overflow-visible">
                        <div className="flex items-center justify-center h-full px-3 py-1.5 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 font-bold text-xs shadow-xs">
                          <AsmoFormula text="Tích 5 số nguyên liên tiếp chia hết cho 2, 3 và 5 $\implies n^5 - n \,\vdots\, 30 \implies \text{Chọn C}$" />
                        </div>
                      </foreignObject>
                    </svg>
                  </div>
                )}
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
                    <AsmoFormula text="• Biệt thức thu gọn: $\Delta' = b'^2 - ac > 0$ có 2 nghiệm phân biệt." />
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
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Hình thoi: 2 đường chéo vuông góc tại trung điểm $a = \sqrt{(d_1/2)^2 + (d_2/2)^2}$" />
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
                    <AsmoFormula text="• Cực trị bậc hai: $A = a(x - x_0)^2 + M \ge M \Rightarrow A_{\min} = M$" />
                  </div>
                </div>
              )}
              {topicId === 'spatial-polyhedron' && (
                <div className="space-y-2">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Thể tích khối chóp: $V = \frac{1}{3} S_{\text{đáy}} \cdot h$" />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Nhị thức Newton: $(a+b)^n = \sum_{k=0}^n C_n^k a^{n-k} b^k$" />
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
                    <AsmoFormula text="• Đặt ẩn phụ phương trình mũ: $t = a^x > 0 \Rightarrow a^{2x} = t^2$" />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• ĐKXĐ logarit: $\log_a f(x)$ xác định $\iff f(x) > 0$" />
                  </div>
                </div>
              )}
              {topicId === 'combinatorics-probability' && (
                <div className="space-y-2">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Xác suất cổ điển: $P(A) = \frac{n(A)}{n(\Omega)}$" />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Chỉnh hợp: $A_n^k = \frac{n!}{(n-k)!}$ (có phân biệt thứ tự)" />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Nguyên lý Dirichlet xấu nhất: $N_{\min} = m(k - 1) + 1$" />
                  </div>
                </div>
              )}
              {topicId === 'number-theory-divisibility' && (
                <div className="space-y-2">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Chu kỳ luỹ thừa: $a^{k \cdot T + r} \equiv a^r \pmod{10}$" />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Nhóm thừa số chung: $S = (1+a) + a^2(1+a) + \dots = (1+a) \cdot Q \,\vdots\, (1+a)$" />
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Tích 5 số nguyên liên tiếp chia hết cho $5! = 120 \,\vdots\, 30$" />
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
