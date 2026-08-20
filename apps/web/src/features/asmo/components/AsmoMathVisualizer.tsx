import { useState } from 'react'
import { AsmoFormula } from './AsmoFormula'
import { Sparkles, Sliders, RefreshCw, Compass, Layers, Calculator } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

type Props = {
  topicId: string
  level: 1 | 2 | 3
  className?: string
}

export function AsmoMathVisualizer({ topicId, level, className }: Props) {
  const [sliderVal, setSliderVal] = useState(level === 1 ? 30 : level === 2 ? 45 : 60)
  const [activeTab, setActiveTab] = useState<'diagram' | 'formula'>('diagram')

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
              'px-2.5 py-1 rounded-xl text-xs font-bold transition-all',
              activeTab === 'diagram' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/10 text-slate-300 hover:bg-white/20'
            )}
          >
            Đồ thị & Hình học
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('formula')}
            className={cn(
              'px-2.5 py-1 rounded-xl text-xs font-bold transition-all',
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

            {/* 2. Trigonometry */}
            {topicId === 'trigonometry' && (
              <div className="w-full max-w-md flex flex-col items-center space-y-3">
                <svg viewBox="0 0 240 200" className="w-full max-h-48 select-none font-bold">
                  {/* Unit circle */}
                  <circle cx="120" cy="100" r="70" fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
                  {/* Axes */}
                  <line x1="20" y1="100" x2="220" y2="100" stroke="#64748b" strokeWidth="1.5" />
                  <line x1="120" y1="10" x2="120" y2="190" stroke="#64748b" strokeWidth="1.5" />
                  <text x="215" y="115" fill="#94a3b8" fontSize="11">cos</text>
                  <text x="125" y="20" fill="#94a3b8" fontSize="11">sin</text>

                  {/* Radius vector at angle alpha */}
                  {(() => {
                    const rad = (sliderVal * Math.PI) / 180
                    const px = 120 + 70 * Math.cos(rad)
                    const py = 100 - 70 * Math.sin(rad)
                    return (
                      <g>
                        {/* Sector arc */}
                        <path
                          d={`M 150,100 A 30,30 0 0,0 ${120 + 30 * Math.cos(rad)},${100 - 30 * Math.sin(rad)}`}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="2"
                        />
                        <text x="145" y="90" fill="#fcd34d" fontSize="11">{sliderVal}°</text>

                        {/* Projections */}
                        <line x1={px} y1={py} x2={px} y2="100" stroke="#ef4444" strokeWidth="2" strokeDasharray="2 2" />
                        <line x1={px} y1={py} x2="120" y2={py} stroke="#38bdf8" strokeWidth="2" strokeDasharray="2 2" />

                        {/* Radius line */}
                        <line x1="120" y1="100" x2={px} y2={py} stroke="#a855f7" strokeWidth="3" />
                        <circle cx={px} cy={py} r="5" fill="#38bdf8" />
                      </g>
                    )
                  })()}
                </svg>

                {/* Angle Slider Control */}
                <div className="w-full flex items-center justify-between gap-3 bg-white/10 px-3 py-2 rounded-2xl border border-white/10">
                  <span className="text-xs font-bold text-slate-300">Góc quay: {sliderVal}°</span>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="15"
                    value={sliderVal}
                    onChange={(e) => setSliderVal(parseInt(e.target.value, 10))}
                    className="flex-1 accent-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-amber-300">
                    sin={Math.sin((sliderVal * Math.PI) / 180).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* 3. Exponential & Logarithm */}
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

            {/* 4. Combinatorics & Probability */}
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

            {/* 5. Number Theory & Divisibility */}
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
              Định lý & Công thức trọng tâm ASMO:
            </h5>
            <div className="space-y-2 text-slate-200 leading-relaxed">
              {topicId === 'algebra-viete' && (
                <div className="space-y-1.5">
                  <div><AsmoFormula text="• Hệ thức Viète bậc 2: $x_1 + x_2 = -\frac{b}{a}$, $x_1 x_2 = \frac{c}{a}$" /></div>
                  <div><AsmoFormula text="• Tổng bình phương: $x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1 x_2 = S^2 - 2P$" /></div>
                  <div><AsmoFormula text="• Tổng lập phương: $x_1^3 + x_2^3 = S^3 - 3SP$" /></div>
                </div>
              )}
              {topicId === 'trigonometry' && (
                <div className="space-y-1.5">
                  <div><AsmoFormula text="• $\sin^2(x) + \cos^2(x) = 1$" /></div>
                  <div><AsmoFormula text="• $\sin(2x) = 2\sin(x)\cos(x)$" /></div>
                  <div><AsmoFormula text="• $1 + \cos(2x) = 2\cos^2(x)$, $1 - \cos(2x) = 2\sin^2(x)$" /></div>
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
