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
  const [pythSideA, setPythSideA] = useState<number>(level === 1 ? 6 : level === 2 ? 3 : 9)
  const [pythSideB, setPythSideB] = useState<number>(level === 1 ? 8 : level === 2 ? 4 : 12)

  // Dice target sum for Combinatorics
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
            {/* 1. ALGEBRA & VIÈTE                                                */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {topicId === 'algebra-viete' && (
              <div className="w-full space-y-3">
                {level === 1 ? (
                  /* Level 1: Difference of Squares (x+3)^2 - (x-3)^2 */
                  <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                      <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                        <span className="size-2 rounded-full bg-indigo-600" />
                        <AsmoFormula text="Mô hình hình học Hằng đẳng thức $(x+3)^2 - (x-3)^2$" />
                      </span>
                      <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                        <AsmoFormula text="$a^2 - b^2 = (a-b)(a+b) = 12x$" />
                      </span>
                    </div>

                    <svg viewBox="0 0 460 200" className="w-full max-h-52 select-none font-sans">
                      <defs>
                        <linearGradient id="vieteTileA" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#4338ca" stopOpacity="0.9" />
                        </linearGradient>
                        <linearGradient id="vieteTileDiff" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
                          <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
                        </linearGradient>
                      </defs>

                      {/* Large Square (x+3)^2 */}
                      <rect x="50" y="20" width="160" height="160" rx="8" fill="url(#vieteTileA)" stroke="#312e81" strokeWidth="2" />
                      <text x="130" y="105" fill="#ffffff" fontSize="14" fontWeight="900" textAnchor="middle">
                        Hình vuông lớn: (x+3)²
                      </text>

                      {/* Inner Square (x-3)^2 cut out */}
                      <rect x="50" y="80" width="100" height="100" rx="6" fill="#f43f5e" fillOpacity="0.4" stroke="#e11d48" strokeWidth="2" strokeDasharray="4 3" />
                      <text x="100" y="135" fill="#ffe4e6" fontSize="11" fontWeight="bold" textAnchor="middle">
                        (x-3)²
                      </text>

                      {/* Arrow to decomposed rectangles */}
                      <path d="M 230,100 L 260,100" stroke="#6366f1" strokeWidth="3" markerEnd="url(#arrow)" />
                      <text x="245" y="90" fill="#4338ca" fontSize="18" fontWeight="black" textAnchor="middle">=</text>

                      {/* Resulting Rectangle 6 * 2x = 12x */}
                      <rect x="280" y="35" width="140" height="130" rx="8" fill="url(#vieteTileDiff)" stroke="#047857" strokeWidth="2" />
                      <text x="350" y="90" fill="#ffffff" fontSize="14" fontWeight="900" textAnchor="middle">
                        6 × 2x
                      </text>
                      <text x="350" y="115" fill="#d1fae5" fontSize="16" fontWeight="black" textAnchor="middle">
                        = 12x
                      </text>
                      <text x="350" y="145" fill="#a7f3d0" fontSize="11" fontWeight="bold" textAnchor="middle">
                        (Chọn đáp án B)
                      </text>
                    </svg>
                  </div>
                ) : level === 2 ? (
                  /* Level 2: Parabola y = x^2 - 5x + 3 & Viete S=5, P=3 */
                  <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                      <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                        <span className="size-2 rounded-full bg-indigo-600" />
                        <AsmoFormula text="Đồ thị Parabol $y = x^2 - 5x + 3$ & Toạ độ Nghiệm Viète" />
                      </span>
                      <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                        <AsmoFormula text="$S = 5, P = 3 \implies x_1^2 + x_2^2 = 19$" />
                      </span>
                    </div>

                    <svg viewBox="0 0 460 200" className="w-full max-h-52 select-none font-sans">
                      <defs>
                        <linearGradient id="vieteParabolaGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>

                      {/* Grid & Axes */}
                      <line x1="30" y1="140" x2="430" y2="140" stroke="#cbd5e1" strokeWidth="2" />
                      <line x1="90" y1="15" x2="90" y2="185" stroke="#cbd5e1" strokeWidth="2" />
                      <polygon points="430,136 440,140 430,144" fill="#64748b" />
                      <polygon points="86,15 90,5 94,15" fill="#64748b" />
                      <text x="432" y="156" fill="#475569" fontSize="12" fontWeight="bold">x</text>
                      <text x="72" y="18" fill="#475569" fontSize="12" fontWeight="bold">y</text>
                      <text x="76" y="154" fill="#64748b" fontSize="11" fontWeight="bold">O</text>

                      {/* Axis of Symmetry */}
                      <line x1="230" y1="20" x2="230" y2="180" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 3" />
                      <text x="235" y="32" fill="#7e22ce" fontSize="10" fontWeight="bold">Trục đối xứng x = S/2 = 2.5</text>

                      <path d="M 125,140 Q 230,235 335,140 Z" fill="url(#vieteParabolaGrad2)" />

                      {/* Parabola Curve */}
                      <path d="M 70,30 Q 230,240 390,30" fill="none" stroke="#4f46e5" strokeWidth="3.5" strokeLinecap="round" />

                      {/* Roots */}
                      <circle cx="125" cy="140" r="5.5" fill="#e11d48" />
                      <text x="115" y="160" fill="#be123c" fontSize="12" fontWeight="extrabold">x₁ ≈ 0.70</text>
                      <circle cx="335" cy="140" r="5.5" fill="#059669" />
                      <text x="325" y="160" fill="#047857" fontSize="12" fontWeight="extrabold">x₂ ≈ 4.30</text>

                      {/* Vertex */}
                      <circle cx="230" cy="172" r="5" fill="#f59e0b" />
                      <text x="238" y="185" fill="#b45309" fontSize="11" fontWeight="bold">Đỉnh I(2.5, -3.25)</text>
                    </svg>
                  </div>
                ) : (
                  /* Level 3: Higher order Viète M = x1/x2 + x2/x1 = 16 */
                  <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                    <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                      <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                        <span className="size-2 rounded-full bg-indigo-600" />
                        <AsmoFormula text="Phương trình $2x^2 - 6x + 1 = 0$ & Phân thức đối xứng" />
                      </span>
                      <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <AsmoFormula text="$S = 3, P = 0.5 \implies M = 16$" />
                      </span>
                    </div>

                    <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 my-2">
                      <div className="p-3 bg-white rounded-xl border border-indigo-200 text-center shadow-2xs">
                        <div className="text-[11px] text-slate-500 font-bold uppercase">1. Định lý Viète</div>
                        <div className="text-sm font-black text-indigo-900 mt-1">
                          <AsmoFormula text="$S = 3, P = \frac{1}{2}$" />
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-indigo-200 text-center shadow-2xs">
                        <div className="text-[11px] text-slate-500 font-bold uppercase">2. Quy đồng mẫu</div>
                        <div className="text-sm font-black text-indigo-900 mt-1">
                          <AsmoFormula text="$M = \frac{S^2 - 2P}{P}$" />
                        </div>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-center shadow-2xs">
                        <div className="text-[11px] text-emerald-800 font-bold uppercase">3. Kết quả (Đáp án B)</div>
                        <div className="text-base font-black text-emerald-950 mt-1">
                          <AsmoFormula text="$M = \frac{9-1}{0.5} = 16$" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* 2. PYTHAGORAS & GEOMETRY                                          */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {topicId === 'pythagoras-geometry' && (
              <div className="w-full space-y-3">
                <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                  <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                    <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                      <span className="size-2 rounded-full bg-indigo-600" />
                      <AsmoFormula
                        text={
                          level === 1
                            ? 'Tam giác vuông $a=6, b=8 \\implies c=10\\text{ cm}$'
                            : level === 2
                            ? 'Khoảng cách hai điểm toạ độ Oxy $A(1,2) \\to B(4,6)$'
                            : 'Tam giác vuông $a=9, b=12$ & Đường cao $h = 7.2\\text{ cm}$'
                        }
                      />
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      <AsmoFormula text="$a^2 + b^2 = c^2$" />
                    </span>
                  </div>

                  {level === 2 ? (
                    /* Level 2: Oxy coordinate plane */
                    <svg viewBox="0 0 460 210" className="w-full max-h-52 select-none font-sans">
                      <line x1="40" y1="170" x2="420" y2="170" stroke="#cbd5e1" strokeWidth="2" />
                      <line x1="80" y1="20" x2="80" y2="190" stroke="#cbd5e1" strokeWidth="2" />
                      <polygon points="420,166 430,170 420,174" fill="#64748b" />
                      <polygon points="76,20 80,10 84,20" fill="#64748b" />
                      <text x="422" y="184" fill="#475569" fontSize="12" fontWeight="bold">x</text>
                      <text x="65" y="20" fill="#475569" fontSize="12" fontWeight="bold">y</text>

                      {/* Right triangle on Oxy: A(1, 2) -> (140, 130), B(4, 6) -> (320, 50), C(4, 2) -> (320, 130) */}
                      <polygon points="140,130 320,130 320,50" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2" />
                      <line x1="140" y1="130" x2="320" y2="130" stroke="#0284c7" strokeWidth="3" />
                      <line x1="320" y1="130" x2="320" y2="50" stroke="#0284c7" strokeWidth="3" />
                      <line x1="140" y1="130" x2="320" y2="50" stroke="#d97706" strokeWidth="4" />

                      <circle cx="140" cy="130" r="5" fill="#4f46e5" />
                      <text x="125" y="148" fill="#312e81" fontSize="12" fontWeight="bold">A(1,2)</text>
                      <circle cx="320" cy="50" r="5" fill="#4f46e5" />
                      <text x="330" y="48" fill="#312e81" fontSize="12" fontWeight="bold">B(4,6)</text>

                      <text x="230" y="145" fill="#0369a1" fontSize="11" fontWeight="bold" textAnchor="middle">Δx = 3</text>
                      <text x="340" y="95" fill="#0369a1" fontSize="11" fontWeight="bold">Δy = 4</text>
                      <text x="215" y="80" fill="#b45309" fontSize="13" fontWeight="black">d(AB) = 5</text>
                    </svg>
                  ) : (
                    /* Level 1 & 3: Right Triangle & Altitude */
                    <svg viewBox="0 0 460 210" className="w-full max-h-52 select-none font-sans">
                      <defs>
                        <linearGradient id="pythTriGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#c084fc" stopOpacity="0.1" />
                        </linearGradient>
                      </defs>

                      <polygon points="80,160 360,160 80,40" fill="url(#pythTriGrad2)" stroke="#4f46e5" strokeWidth="3" />
                      <rect x="80" y="142" width="18" height="18" fill="none" stroke="#f59e0b" strokeWidth="2" />
                      <circle cx="89" cy="151" r="2.5" fill="#f59e0b" />

                      <line x1="80" y1="160" x2="80" y2="40" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
                      <text x="65" y="105" fill="#0369a1" fontSize="13" fontWeight="900" textAnchor="end">
                        a = {pythSideA} cm
                      </text>

                      <line x1="80" y1="160" x2="360" y2="160" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
                      <text x="220" y="184" fill="#0369a1" fontSize="13" fontWeight="900" textAnchor="middle">
                        Cạnh góc vuông b = {pythSideB} cm
                      </text>

                      <line x1="80" y1="40" x2="360" y2="160" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
                      <text x="235" y="90" fill="#b45309" fontSize="14" fontWeight="900">
                        c = {pythC.toFixed(1)} cm
                      </text>

                      {level === 3 && (
                        <>
                          <line x1="80" y1="160" x2="142" y2="67" stroke="#e11d48" strokeWidth="2.5" strokeDasharray="4 3" />
                          <circle cx="142" cy="67" r="4" fill="#e11d48" />
                          <text x="120" y="125" fill="#be123c" fontSize="11" fontWeight="bold">
                            h = {pythAltitude.toFixed(1)} cm
                          </text>
                        </>
                      )}

                      <text x="75" y="32" fill="#1e293b" fontSize="12" fontWeight="bold">A</text>
                      <text x="65" y="172" fill="#1e293b" fontSize="12" fontWeight="bold">C (90°)</text>
                      <text x="370" y="165" fill="#1e293b" fontSize="12" fontWeight="bold">B</text>
                    </svg>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* 3. ALGEBRAIC IDENTITIES & POLYNOMIALS                             */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {topicId === 'algebra-polynomials' && (
              <div className="w-full space-y-3">
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

                    <div className="flex flex-col gap-2 font-mono text-xs max-w-xs">
                      {level === 1 ? (
                        <>
                          <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-200 text-indigo-900 font-bold">
                            <AsmoFormula text="$P = [(2x+1) - (2x-1)][(2x+1) + (2x-1)]$" />
                          </div>
                          <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200 text-emerald-900 font-bold">
                            <AsmoFormula text="$= 2 \times 4x = 8x \implies \text{Chọn B}$" />
                          </div>
                        </>
                      ) : level === 2 ? (
                        <>
                          <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-200 text-indigo-900 font-bold">
                            <AsmoFormula text="$x^2 - 7x + 12 = (x-3)(x-4) = 0$" />
                          </div>
                          <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200 text-emerald-900 font-bold">
                            <AsmoFormula text="$x_1 = 3, x_2 = 4 \implies x_1+x_2 = 7$" />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-200 text-indigo-900 font-bold">
                            <AsmoFormula text="$A = (x-3)^2 + 5 \ge 5$" />
                          </div>
                          <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200 text-emerald-900 font-bold">
                            <AsmoFormula text="$A_{\min} = 5 \text{ khi } x = 3 \implies \text{Chọn B}$" />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* 4. SPATIAL GEOMETRY & POLYHEDRON                                  */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {topicId === 'spatial-polyhedron' && (
              <div className="w-full space-y-3">
                <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                  <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                    <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                      <span className="size-2 rounded-full bg-indigo-600" />
                      Thể tích khối chóp &amp; Định lý Euler đa diện
                    </span>
                    <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                      <AsmoFormula text={level === 1 ? '$a_3 = 40$' : level === 2 ? '$V = 48\\text{ cm}^3$' : '$E = 30\\text{ cạnh}$'} />
                    </span>
                  </div>

                  {level === 2 ? (
                    <svg viewBox="0 0 460 200" className="w-full max-h-52 select-none font-sans">
                      <defs>
                        <linearGradient id="pyrFaceLeft2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.1" />
                        </linearGradient>
                        <linearGradient id="pyrFaceRight2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#c084fc" stopOpacity="0.1" />
                        </linearGradient>
                      </defs>

                      <line x1="130" y1="135" x2="180" y2="105" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />
                      <line x1="180" y1="105" x2="380" y2="105" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />
                      <line x1="230" y1="25" x2="180" y2="105" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />

                      <polygon points="230,25 130,135 330,135" fill="url(#pyrFaceLeft2)" stroke="#4f46e5" strokeWidth="2.5" />
                      <polygon points="230,25 330,135 380,105" fill="url(#pyrFaceRight2)" stroke="#9333ea" strokeWidth="2.5" />
                      <line x1="130" y1="135" x2="330" y2="135" stroke="#4f46e5" strokeWidth="2.5" />
                      <line x1="330" y1="135" x2="380" y2="105" stroke="#9333ea" strokeWidth="2.5" />

                      <line x1="230" y1="25" x2="255" y2="120" stroke="#e11d48" strokeWidth="3" strokeDasharray="4 3" />
                      <circle cx="255" cy="120" r="4.5" fill="#e11d48" />
                      <text x="268" y="75" fill="#be123c" fontSize="12" fontWeight="bold">h = 4 cm</text>

                      <circle cx="230" cy="25" r="4.5" fill="#f59e0b" />
                      <text x="230" y="18" fill="#b45309" fontSize="13" fontWeight="900" textAnchor="middle">S</text>
                      <text x="115" y="145" fill="#1e293b" fontSize="12" fontWeight="bold">A</text>
                      <text x="340" y="148" fill="#1e293b" fontSize="12" fontWeight="bold">B</text>
                      <text x="390" y="108" fill="#1e293b" fontSize="12" fontWeight="bold">C</text>
                      <text x="165" y="105" fill="#64748b" fontSize="12" fontWeight="bold">D</text>
                      <text x="230" y="156" fill="#4f46e5" fontSize="12" fontWeight="bold" textAnchor="middle">Đáy vuông a = 6 cm</text>
                    </svg>
                  ) : level === 3 ? (
                    <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 my-2">
                      <div className="p-3 bg-white rounded-xl border border-indigo-200 text-center shadow-2xs">
                        <div className="text-[11px] text-slate-500 font-bold uppercase">1. Số Đỉnh &amp; Mặt</div>
                        <div className="text-sm font-black text-indigo-900 mt-1">
                          <AsmoFormula text="$V = 12, F = 20$" />
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-indigo-200 text-center shadow-2xs">
                        <div className="text-[11px] text-slate-500 font-bold uppercase">2. Định lý Euler</div>
                        <div className="text-sm font-black text-indigo-900 mt-1">
                          <AsmoFormula text="$V - E + F = 2$" />
                        </div>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-center shadow-2xs">
                        <div className="text-[11px] text-emerald-800 font-bold uppercase">3. Số Cạnh (Đáp án B)</div>
                        <div className="text-base font-black text-emerald-950 mt-1">
                          <AsmoFormula text="$E = 12 + 20 - 2 = 30$" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                      <div className="p-3 bg-white rounded-xl border border-indigo-200 text-center shadow-2xs">
                        <div className="text-[11px] text-slate-500 font-bold uppercase">Công thức số hạng tổng quát</div>
                        <div className="text-sm font-black text-indigo-900 mt-1">
                          <AsmoFormula text="$T_{k+1} = C_5^k x^{5-k} 2^k$" />
                        </div>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-center shadow-2xs">
                        <div className="text-[11px] text-emerald-800 font-bold uppercase">Hệ số của $x^3$ ($k=2$)</div>
                        <div className="text-sm font-black text-emerald-950 mt-1">
                          <AsmoFormula text="$a_3 = C_5^2 \cdot 2^2 = 10 \times 4 = 40$" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* 5. EXPONENT & LOGARITHM                                           */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {topicId === 'exp-logarithm' && (
              <div className="w-full space-y-3">
                <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                  <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                    <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                      <span className="size-2 rounded-full bg-indigo-600" />
                      <AsmoFormula text="Đồ thị hàm số mũ $y = 2^x$ và Logarit $y = \log_2 x$" />
                    </span>
                    <span className="text-[11px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                      <AsmoFormula text="Đối xứng qua $y = x$" />
                    </span>
                  </div>

                  <svg viewBox="0 0 460 200" className="w-full max-h-52 select-none font-sans">
                    <line x1="40" y1="160" x2="420" y2="160" stroke="#cbd5e1" strokeWidth="2" />
                    <line x1="90" y1="15" x2="90" y2="185" stroke="#cbd5e1" strokeWidth="2" />
                    <polygon points="420,156 430,160 420,164" fill="#64748b" />
                    <polygon points="86,15 90,5 94,15" fill="#64748b" />
                    <text x="422" y="174" fill="#475569" fontSize="12" fontWeight="bold">x</text>
                    <text x="72" y="18" fill="#475569" fontSize="12" fontWeight="bold">y</text>

                    <line x1="60" y1="190" x2="330" y2="20" stroke="#818cf8" strokeWidth="2" strokeDasharray="4 3" />
                    <text x="335" y="25" fill="#6366f1" fontSize="11" fontWeight="bold">y = x</text>

                    <path d="M 40,158 Q 160,155 240,25" fill="none" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
                    <text x="185" y="45" fill="#0369a1" fontSize="13" fontWeight="900">y = 2ˣ</text>

                    <path d="M 94,190 Q 100,80 390,30" fill="none" stroke="#d97706" strokeWidth="3.5" strokeLinecap="round" />
                    <text x="325" y="55" fill="#b45309" fontSize="13" fontWeight="900">y = log₂x</text>

                    <circle cx="90" cy="120" r="5" fill="#0284c7" />
                    <text x="50" y="123" fill="#0369a1" fontSize="11" fontWeight="bold">(0, 1)</text>

                    <circle cx="130" cy="160" r="5" fill="#d97706" />
                    <text x="125" y="178" fill="#b45309" fontSize="11" fontWeight="bold">(1, 0)</text>
                  </svg>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* 6. COMBINATORICS & PROBABILITY                                    */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {topicId === 'combinatorics-probability' && (
              <div className="w-full space-y-3">
                <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                  <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                    <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                      <span className="size-2 rounded-full bg-indigo-600" />
                      <AsmoFormula
                        text={
                          level === 1
                            ? 'Chỉnh hợp chọn ban cán sự $A_{10}^2 = 90$'
                            : level === 2
                            ? 'Ma trận 36 biến cố gieo 2 con xúc xắc'
                            : 'Nguyên lý Dirichlet bốc bi xấu nhất $N = 10$'
                        }
                      />
                    </span>
                    <span className="text-[11px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300 font-bold">
                      <AsmoFormula text={level === 1 ? '$A_{10}^2 = 90$' : level === 2 ? 'P = 6/36 = 1/6' : '$N_{\\min} = 10$'} />
                    </span>
                  </div>

                  {level === 2 ? (
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
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                      <div className="p-3 bg-white rounded-xl border border-indigo-200 text-center shadow-2xs">
                        <div className="text-[11px] text-slate-500 font-bold uppercase">Phương pháp</div>
                        <div className="text-sm font-black text-indigo-900 mt-1">
                          <AsmoFormula text={level === 1 ? '$A_{10}^2 = 10 \\times 9$' : '$N = 3 \\times (4-1) + 1$'} />
                        </div>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-center shadow-2xs">
                        <div className="text-[11px] text-emerald-800 font-bold uppercase">Kết quả (Đáp án B)</div>
                        <div className="text-sm font-black text-emerald-950 mt-1">
                          <AsmoFormula text={level === 1 ? '$90\\text{ cách}$' : '$10\\text{ viên bi}$'} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* 7. NUMBER THEORY                                                  */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            {topicId === 'number-theory-divisibility' && (
              <div className="w-full space-y-3">
                <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 flex flex-col items-center justify-center shadow-2xs">
                  <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                    <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
                      <span className="size-2 rounded-full bg-indigo-600" />
                      <AsmoFormula
                        text={
                          level === 1
                            ? 'Chu kỳ tận cùng $2^n$ & Phép chia Modulo 4'
                            : level === 2
                            ? 'Nhóm tổng luỹ thừa $3^1 + 3^2 + 3^3 + 3^4 = 120 \\vdots 5$'
                            : 'Phân tích nhân tử $n^5 - n \\vdots 30$'
                        }
                      />
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      <AsmoFormula text={level === 1 ? '$2^{2024} \\equiv 6 \\pmod{10}$' : level === 2 ? '$S \\equiv 0 \\pmod 5$' : '$n^5 - n \\vdots 30$'} />
                    </span>
                  </div>

                  {level === 1 ? (
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
                        <span className="size-8 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-white text-sm ring-2 ring-emerald-300 shadow-sm">
                          2⁴ = 6
                        </span>
                      </div>
                    </div>
                  ) : level === 2 ? (
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                      <div className="p-3 bg-white rounded-xl border border-indigo-200 text-center shadow-2xs">
                        <div className="text-[11px] text-slate-500 font-bold uppercase">Nhóm 4 số hạng</div>
                        <div className="text-sm font-black text-indigo-900 mt-1">
                          <AsmoFormula text="$3^1 + 3^2 + 3^3 + 3^4 = 120 \\vdots 5$" />
                        </div>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-center shadow-2xs">
                        <div className="text-[11px] text-emerald-800 font-bold uppercase">Số dư (Đáp án A)</div>
                        <div className="text-sm font-black text-emerald-950 mt-1">
                          <AsmoFormula text="$2024 \\vdots 4 \\implies S \\equiv 0 \\pmod 5$" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                      <div className="p-3 bg-white rounded-xl border border-indigo-200 text-center shadow-2xs">
                        <div className="text-[11px] text-slate-500 font-bold uppercase">Phân tích Fermat</div>
                        <div className="text-sm font-black text-indigo-900 mt-1">
                          <AsmoFormula text="$n(n-1)(n+1)(n^2+1)$" />
                        </div>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-center shadow-2xs">
                        <div className="text-[11px] text-emerald-800 font-bold uppercase">Kết luận (Đáp án C)</div>
                        <div className="text-sm font-black text-emerald-950 mt-1">
                          <AsmoFormula text="$\\vdots 6 \\text{ và } \\vdots 5 \\implies \\vdots 30$" />
                        </div>
                      </div>
                    </div>
                  )}
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
                </div>
              )}
              {topicId === 'combinatorics-probability' && (
                <div className="space-y-2">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <AsmoFormula text="• Chỉnh hợp: $A_n^k = \frac{n!}{(n-k)!}$" />
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
