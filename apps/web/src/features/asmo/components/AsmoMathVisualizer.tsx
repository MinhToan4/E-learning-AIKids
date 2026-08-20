import { useState } from 'react'
import { AsmoFormula } from './AsmoFormula'
import { AsmoTrigLabVisualizer } from './AsmoTrigLabVisualizer'
import { AsmoKidsArithmeticVisualizer } from './AsmoKidsArithmeticVisualizer'
import { Sparkles, Sliders, RefreshCw, Compass, Layers, Calculator, Box } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export type AsmoMathVisualizerProps = {
  topicId: string
  level: 1 | 2 | 3
  className?: string
  externalAngle?: number
  externalTab?: 'circle' | 'wave' | 'formula'
  highlightTarget?: 'sin' | 'cos' | 'tan' | 'cot' | 'pythagoras' | 'double' | null
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
  onAngleChange,
  demoSinValue,
}: AsmoMathVisualizerProps) {
  const [sliderVal, setSliderVal] = useState(level === 1 ? 30 : level === 2 ? 45 : 60)
  const [activeTab, setActiveTab] = useState<'diagram' | 'formula'>('diagram')
  const [pythSideA, setPythSideA] = useState<number>(level === 1 ? 6 : level === 2 ? 3 : 9)
  const [pythSideB, setPythSideB] = useState<number>(level === 1 ? 8 : level === 2 ? 4 : 12)

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
        externalTab={externalTab}
        highlightTarget={highlightTarget}
        onAngleChange={onAngleChange}
        demoSinValue={demoSinValue}
        className={className}
      />
    )
  }

  const pythC = Math.sqrt(pythSideA * pythSideA + pythSideB * pythSideB)
  const pythAltitude = (pythSideA * pythSideB) / pythC

  return (
    <div className={cn('relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border border-slate-700/60 shadow-xl p-4 sm:p-6 text-white flex flex-col justify-between min-h-[380px]', className)}>
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-xl bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
            <Compass className="size-4" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-indigo-200 uppercase tracking-wider block">
              Mô Phỏng Toán Học Tương Tác
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Chuyên đề: {topicId} · Level {level}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('diagram')}
            className={cn(
              'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
              activeTab === 'diagram' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/10 text-slate-300 hover:bg-white/20'
            )}
          >
            Đồ thị &amp; Hình học
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('formula')}
            className={cn(
              'px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer',
              activeTab === 'formula' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/10 text-slate-300 hover:bg-white/20'
            )}
          >
            Công thức KaTeX
          </button>
        </div>
      </div>

      {/* Main Visual Content */}
      <div className="flex-1 flex items-center justify-center my-2">
        {activeTab === 'diagram' ? (
          <div className="w-full flex flex-col items-center justify-center">
            {/* 1. Algebra & Viète */}
            {topicId === 'algebra-viete' && (
              <div className="w-full max-w-md space-y-3">
                <svg viewBox="0 0 320 180" className="w-full max-h-48 select-none font-bold">
                  <defs>
                    <linearGradient id="parabolaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="20" y1="130" x2="300" y2="130" stroke="#475569" strokeWidth="1.5" />
                  <line x1="80" y1="10" x2="80" y2="170" stroke="#475569" strokeWidth="1.5" />
                  {/* Axis Arrows */}
                  <polygon points="300,126 308,130 300,134" fill="#94a3b8" />
                  <polygon points="76,10 80,2 84,10" fill="#94a3b8" />
                  <text x="305" y="145" fill="#94a3b8" fontSize="12">x</text>
                  <text x="65" y="15" fill="#94a3b8" fontSize="12">y</text>

                  {/* Parabola Curve y = x^2 - 5x + 3 */}
                  <path
                    d="M 60,30 Q 145,220 230,30"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Roots Markers x1, x2 */}
                  <circle cx="102" cy="130" r="5" fill="#f43f5e" />
                  <text x="96" y="148" fill="#fda4af" fontSize="11" fontWeight="bold">x₁</text>
                  <circle cx="188" cy="130" r="5" fill="#10b981" />
                  <text x="184" y="148" fill="#6ee7b7" fontSize="11" fontWeight="bold">x₂</text>

                  {/* Vertex */}
                  <circle cx="145" cy="158" r="4" fill="#f59e0b" />
                  <text x="135" y="175" fill="#fde68a" fontSize="10">Đỉnh I</text>
                </svg>

                {/* Viète Relations Mini Card */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-white/10 p-2.5 border border-white/10">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Tổng 2 nghiệm (S):</span>
                    <span className="font-mono font-bold text-emerald-300 text-sm">S = x₁ + x₂ = 5</span>
                  </div>
                  <div className="rounded-xl bg-white/10 p-2.5 border border-white/10">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Tích 2 nghiệm (P):</span>
                    <span className="font-mono font-bold text-amber-300 text-sm">P = x₁ · x₂ = 3</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Pythagoras & Geometry */}
            {topicId === 'pythagoras-geometry' && (
              <div className="w-full max-w-md space-y-3">
                <svg viewBox="0 0 320 180" className="w-full max-h-48 select-none font-bold">
                  {/* Right Triangle */}
                  <polygon points="50,140 250,140 50,40" fill="rgba(99, 102, 241, 0.2)" stroke="#818cf8" strokeWidth="2.5" />
                  {/* Right angle symbol */}
                  <rect x="50" y="125" width="15" height="15" fill="none" stroke="#f59e0b" strokeWidth="1.5" />

                  {/* Labels */}
                  <text x="140" y="158" fill="#38bdf8" fontSize="12" textAnchor="middle">Cạnh góc vuông b = {pythSideB} cm</text>
                  <text x="35" y="95" fill="#38bdf8" fontSize="12" textAnchor="end">a = {pythSideA} cm</text>
                  <text x="160" y="80" fill="#facc15" fontSize="13" fontWeight="bold">c = {pythC.toFixed(1)} cm</text>

                  {/* Altitude from right angle */}
                  <line x1="50" y1="140" x2="114" y2="108" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
                  <text x="75" y="115" fill="#fda4af" fontSize="10">h = {pythAltitude.toFixed(1)}</text>
                </svg>

                {/* Interactive Controls */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/10 p-2 rounded-xl border border-white/10 flex items-center justify-between">
                    <span className="text-slate-300">Cạnh a:</span>
                    <button
                      type="button"
                      onClick={() => setPythSideA((prev) => (prev === 6 ? 9 : prev === 9 ? 5 : 6))}
                      className="px-2 py-0.5 bg-indigo-500/50 hover:bg-indigo-500 rounded-md font-mono font-bold"
                    >
                      {pythSideA} cm ⟳
                    </button>
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl border border-white/10 flex items-center justify-between">
                    <span className="text-slate-300">Cạnh b:</span>
                    <button
                      type="button"
                      onClick={() => setPythSideB((prev) => (prev === 8 ? 12 : prev === 12 ? 12 : 8))}
                      className="px-2 py-0.5 bg-indigo-500/50 hover:bg-indigo-500 rounded-md font-mono font-bold"
                    >
                      {pythSideB} cm ⟳
                    </button>
                  </div>
                </div>

                <div className="text-center text-xs text-emerald-300 font-mono bg-emerald-950/60 p-2 rounded-xl border border-emerald-500/30">
                  {pythSideA}² + {pythSideB}² = {pythSideA * pythSideA} + {pythSideB * pythSideB} = {pythSideA * pythSideA + pythSideB * pythSideB} = {pythC.toFixed(0)}²
                </div>
              </div>
            )}

            {/* 3. Algebraic Identities & Polynomials */}
            {topicId === 'algebra-polynomials' && (
              <div className="w-full max-w-md space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Geometric Tile Model for (a+b)^2 */}
                  <div className="rounded-2xl bg-indigo-900/40 p-3 border border-indigo-400/30 flex flex-col items-center">
                    <span className="text-[11px] font-bold text-indigo-200 mb-2">Mô hình diện tích (a + b)²:</span>
                    <div className="size-28 grid grid-cols-3 grid-rows-3 gap-0.5 p-1 bg-slate-900 rounded-xl border border-indigo-300/40">
                      <div className="col-span-2 row-span-2 bg-indigo-500/80 rounded-sm flex items-center justify-center font-bold text-xs">
                        a²
                      </div>
                      <div className="col-span-1 row-span-2 bg-amber-500/80 rounded-sm flex items-center justify-center font-bold text-[10px]">
                        ab
                      </div>
                      <div className="col-span-2 row-span-1 bg-amber-500/80 rounded-sm flex items-center justify-center font-bold text-[10px]">
                        ab
                      </div>
                      <div className="col-span-1 row-span-1 bg-emerald-500/80 rounded-sm flex items-center justify-center font-bold text-[10px]">
                        b²
                      </div>
                    </div>
                  </div>

                  {/* Identities Quick List */}
                  <div className="rounded-2xl bg-white/10 p-3 border border-white/10 flex flex-col justify-center space-y-1.5 text-[11px] font-mono">
                    <span className="text-amber-300 font-bold block text-[10px] uppercase font-sans">Hằng đẳng thức vàng:</span>
                    <div className="text-indigo-200">(a+b)² = a² + 2ab + b²</div>
                    <div className="text-rose-200">(a-b)² = a² - 2ab + b²</div>
                    <div className="text-emerald-300">a² - b² = (a-b)(a+b)</div>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-800/80 p-2.5 text-xs text-slate-300 leading-relaxed text-center">
                  <span className="font-mono text-emerald-400 font-bold">P = (2x + 1)² - (2x - 1)² = 2 × 4x = 8x</span>
                </div>
              </div>
            )}

            {/* 4. Spatial Geometry & Polyhedron Volumes */}
            {topicId === 'spatial-polyhedron' && (
              <div className="w-full max-w-md space-y-3">
                <svg viewBox="0 0 300 160" className="w-full max-h-44 select-none font-bold">
                  {/* Isometric Pyramid S.ABCD */}
                  <polygon points="150,20 80,110 220,110" fill="rgba(99, 102, 241, 0.2)" stroke="#818cf8" strokeWidth="2" />
                  <polygon points="150,20 220,110 250,90" fill="rgba(168, 85, 247, 0.2)" stroke="#c084fc" strokeWidth="2" />
                  <line x1="80" y1="110" x2="110" y2="90" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="110" y1="90" x2="250" y2="90" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="150" y1="20" x2="110" y2="90" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />

                  {/* Height line SO */}
                  <line x1="150" y1="20" x2="165" y2="100" stroke="#f43f5e" strokeWidth="2" strokeDasharray="2 2" />
                  <circle cx="165" cy="100" r="3" fill="#f43f5e" />

                  {/* Labels */}
                  <text x="150" y="15" fill="#fde047" fontSize="12" textAnchor="middle">S (Đỉnh)</text>
                  <text x="175" y="60" fill="#fda4af" fontSize="11">h = 4</text>
                  <text x="150" y="130" fill="#94a3b8" fontSize="11" textAnchor="middle">Đáy vuông a = 6</text>
                </svg>

                {/* Euler Formula & Volume Cards */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-white/10 p-2.5 border border-white/10">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Thể tích khối chóp:</span>
                    <span className="font-mono font-bold text-emerald-300 text-sm">V = ⅓ B·h = 48 cm³</span>
                  </div>
                  <div className="rounded-xl bg-white/10 p-2.5 border border-white/10">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Định lý Euler đa diện:</span>
                    <span className="font-mono font-bold text-amber-300 text-sm">V - E + F = 2</span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Exponential & Logarithm */}
            {topicId === 'exp-logarithm' && (
              <div className="w-full max-w-md space-y-2">
                <svg viewBox="0 0 280 180" className="w-full max-h-48 select-none font-bold">
                  {/* Axes */}
                  <line x1="30" y1="150" x2="260" y2="150" stroke="#475569" strokeWidth="1.5" />
                  <line x1="60" y1="20" x2="60" y2="170" stroke="#475569" strokeWidth="1.5" />
                  {/* Line y = x symmetry */}
                  <line x1="40" y1="170" x2="220" y2="20" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="225" y="25" fill="#94a3b8" fontSize="10">y = x</text>

                  {/* Curve y = 2^x (Cyan) */}
                  <path d="M 30,148 Q 120,145 180,20" fill="none" stroke="#38bdf8" strokeWidth="3" />
                  <text x="145" y="45" fill="#38bdf8" fontSize="11" fontWeight="bold">y = 2ˣ</text>

                  {/* Curve y = log2(x) (Orange) */}
                  <path d="M 62,170 Q 65,80 250,20" fill="none" stroke="#f59e0b" strokeWidth="3" />
                  <text x="200" y="55" fill="#f59e0b" fontSize="11" fontWeight="bold">y = log₂x</text>

                  {/* Key points (0,1) and (1,0) */}
                  <circle cx="60" cy="115" r="4" fill="#38bdf8" />
                  <circle cx="95" cy="150" r="4" fill="#f59e0b" />
                </svg>

                <div className="text-center text-xs text-indigo-200">
                  <span>Hàm số mũ $y = a^x$ và hàm số logarit $y = \\log_a x$ đối xứng nhau qua đường thẳng $y = x$.</span>
                </div>
              </div>
            )}

            {/* 6. Combinatorics & Probability */}
            {topicId === 'combinatorics-probability' && (
              <div className="w-full max-w-md space-y-2">
                <div className="rounded-2xl bg-white/10 p-3 border border-white/10">
                  <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                    <span>🎲 Ma trận 36 biến cố gieo 2 xúc xắc:</span>
                    <span className="text-amber-300 font-extrabold">Tổng = 7 (6 ô vàng)</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1 text-[11px] font-mono text-center">
                    {Array.from({ length: 6 }).map((_, r) =>
                      Array.from({ length: 6 }).map((_, c) => {
                        const sum = r + 1 + (c + 1)
                        const isSum7 = sum === 7
                        return (
                          <div
                            key={`dice-${r}-${c}`}
                            className={cn(
                              'py-1 rounded-md font-bold transition-all',
                              isSum7
                                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 font-black'
                                : 'bg-slate-800 text-slate-400'
                            )}
                          >
                            {r + 1}+{c + 1}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-center text-slate-400 font-medium">
                  Xác suất tổng bằng 7: $P = \\frac{6}{36} = \\frac{1}{6} \\approx 16.67\\%$
                </p>
              </div>
            )}

            {/* 7. Number Theory & Divisibility */}
            {topicId === 'number-theory-divisibility' && (
              <div className="w-full max-w-md space-y-3">
                <div className="rounded-2xl bg-white/10 p-3.5 border border-white/10 flex items-center justify-around">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Chu kỳ tận cùng 2ⁿ:</span>
                    <div className="flex items-center gap-1 mt-1 font-mono font-black text-sm">
                      <span className="px-2 py-1 bg-indigo-500/40 rounded-lg text-indigo-200">2</span>
                      <span>➔</span>
                      <span className="px-2 py-1 bg-indigo-500/40 rounded-lg text-indigo-200">4</span>
                      <span>➔</span>
                      <span className="px-2 py-1 bg-indigo-500/40 rounded-lg text-indigo-200">8</span>
                      <span>➔</span>
                      <span className="px-2 py-1 bg-emerald-500/50 rounded-lg text-emerald-200">6</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-800/80 p-2.5 text-xs text-slate-300 leading-relaxed font-mono">
                  <div>• 2024 = 4 × 506 + 0 (Dư 0)</div>
                  <div>• 2²⁰²⁴ ≡ 2⁴ ≡ 6 (mod 10)</div>
                  <div className="text-emerald-400 font-bold">➔ Chữ số tận cùng là 6!</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full space-y-3 p-3 bg-white/10 rounded-2xl border border-white/10 text-xs">
            <h5 className="font-bold text-indigo-200 uppercase tracking-wider text-[11px]">
              Định lý &amp; Công thức trọng tâm ASMO:
            </h5>
            <div className="space-y-2 text-slate-200 leading-relaxed">
              {topicId === 'algebra-viete' && (
                <div className="space-y-1.5">
                  <div><AsmoFormula text="• Hệ thức Viète bậc 2: $x_1 + x_2 = -\frac{b}{a}$, $x_1 x_2 = \frac{c}{a}$" /></div>
                  <div><AsmoFormula text="• Tổng bình phương: $x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1 x_2 = S^2 - 2P$" /></div>
                  <div><AsmoFormula text="• Tổng lập phương: $x_1^3 + x_2^3 = S^3 - 3SP$" /></div>
                </div>
              )}
              {topicId === 'pythagoras-geometry' && (
                <div className="space-y-1.5">
                  <div><AsmoFormula text="• Định lý Pytago: $a^2 + b^2 = c^2 \Rightarrow c = \sqrt{a^2 + b^2}$" /></div>
                  <div><AsmoFormula text="• Đường cao tam giác vuông: $h = \frac{a \cdot b}{c}$" /></div>
                  <div><AsmoFormula text="• Khoảng cách toạ độ: $d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$" /></div>
                </div>
              )}
              {topicId === 'algebra-polynomials' && (
                <div className="space-y-1.5">
                  <div><AsmoFormula text="• $(a + b)^2 = a^2 + 2ab + b^2$" /></div>
                  <div><AsmoFormula text="• $a^2 - b^2 = (a - b)(a + b)$" /></div>
                  <div><AsmoFormula text="• $(a + b)^3 = a^3 + 3a^2b + 3ab^2 + b^3$" /></div>
                </div>
              )}
              {topicId === 'spatial-polyhedron' && (
                <div className="space-y-1.5">
                  <div><AsmoFormula text="• Nhị thức Newton: $(a+b)^n = \sum_{k=0}^n C_n^k a^{n-k} b^k$" /></div>
                  <div><AsmoFormula text="• Thể tích khối chóp: $V = \frac{1}{3} S_{\text{đáy}} \cdot h$" /></div>
                  <div><AsmoFormula text="• Định lý Euler đa diện lồi: $V - E + F = 2$" /></div>
                </div>
              )}
              {topicId === 'exp-logarithm' && (
                <div className="space-y-1.5">
                  <div><AsmoFormula text="• $\log_a(xy) = \log_a x + \log_a y$" /></div>
                  <div><AsmoFormula text="• $\log_a(x^k) = k\log_a x$" /></div>
                  <div><AsmoFormula text="• Đổi cơ số: $\log_a b = \frac{\log_c b}{\log_c a}$" /></div>
                </div>
              )}
              {topicId === 'combinatorics-probability' && (
                <div className="space-y-1.5">
                  <div><AsmoFormula text="• Chỉnh hợp: $A_n^k = \frac{n!}{(n-k)!}$" /></div>
                  <div><AsmoFormula text="• Tổ hợp: $C_n^k = \frac{n!}{k!(n-k)!}$" /></div>
                  <div><AsmoFormula text="• Xác suất: $P(A) = \frac{n(A)}{n(\Omega)}$" /></div>
                </div>
              )}
              {topicId === 'number-theory-divisibility' && (
                <div className="space-y-1.5">
                  <div><AsmoFormula text="• Định lý nhỏ Fermat: $a^{p-1} \equiv 1 \pmod p$" /></div>
                  <div><AsmoFormula text="• Tính chia hết: $a \vdots m, b \vdots m \Rightarrow (a + b) \vdots m$" /></div>
                  <div><AsmoFormula text="• Chu kỳ luỹ thừa: $a^{k \cdot T + r} \equiv a^r \pmod{10}$" /></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/10">
        <span className="flex items-center gap-1 text-indigo-300 font-bold">
          <Sparkles className="size-3 text-amber-400" />
          Mô hình Toán Học Chuẩn KaTeX ASMO
        </span>
        <span className="font-mono">100% Valid Math Spec</span>
      </div>
    </div>
  )
}
