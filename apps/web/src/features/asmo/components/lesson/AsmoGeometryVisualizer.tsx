import React from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { AsmoFormula } from '../AsmoFormula'
import { FlatClayCube } from '../AsmoFlatClayIcons'
import { renderMatchstickFigureSvg } from '../AsmoDiagramEngine'

export interface AsmoGeometryVisualizerProps {
  visualType: string
  pizzaSlices?: number
  setPizzaSlices?: (slices: number) => void
  pizzaShaded?: number
  setPizzaShaded?: (updater: number | ((prev: number) => number)) => void
  cubeLayers?: number[]
  setCubeLayers?: (layers: number[]) => void
}

export function isGeometryVisualType(type: string): boolean {
  return (
    type === 'perimeter_area' ||
    type === 'cube_3d' ||
    type === 'pizza_fraction' ||
    type === 'compare_fractions' ||
    type === 'fraction_add_sub' ||
    type === 'fraction_of_number' ||
    type === 'matchstick'
  )
}

export function AsmoGeometryVisualizer({
  visualType,
  pizzaSlices = 8,
  setPizzaSlices,
  pizzaShaded = 3,
  setPizzaShaded,
  cubeLayers = [3, 2, 1],
  setCubeLayers,
}: AsmoGeometryVisualizerProps) {
  // ── 1. Pizza Fraction Visualizer ──
  if (
    visualType === 'pizza_fraction' ||
    visualType === 'compare_fractions' ||
    visualType === 'fraction_add_sub' ||
    visualType === 'fraction_of_number'
  ) {
    return (
      <div className="w-full max-w-md space-y-4 flex flex-col items-center">
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs bg-white p-3 rounded-2xl border-2 border-brand-100 shadow-clay">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-700">Số lát cắt:</span>
            {[4, 6, 8, 10].map((num) => (
              <button
                key={`slice-btn-${num}`}
                type="button"
                onClick={() => {
                  setPizzaSlices?.(num)
                  if (setPizzaShaded && pizzaShaded > num) setPizzaShaded(num)
                }}
                className={cn(
                  'px-2.5 py-1 rounded-xl font-black text-xs cursor-pointer border-2 transition-all active:scale-95',
                  pizzaSlices === num
                    ? 'bg-brand-500 text-white border-brand-600 shadow-clay'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs',
                )}
              >
                {num}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <span className="font-black text-slate-700">Đã lấy:</span>
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border-2 border-emerald-300 shadow-2xs">
              <button
                type="button"
                aria-label="Bớt lát pizza"
                disabled={pizzaShaded <= 0}
                onClick={() => setPizzaShaded?.((s) => (s > 0 ? s - 1 : 0))}
                className="size-8 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
              >
                <Minus className="size-4 stroke-[3]" />
              </button>
              <span className="w-6 text-center font-display font-black text-sm text-emerald-950 select-none">
                {pizzaShaded}
              </span>
              <button
                type="button"
                aria-label="Thêm lát pizza"
                disabled={pizzaShaded >= pizzaSlices}
                onClick={() => setPizzaShaded?.((s) => (s < pizzaSlices ? s + 1 : pizzaSlices))}
                className="size-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black flex items-center justify-center shadow-clay transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
              >
                <Plus className="size-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>

        {/* SVG Pizza Pie Soft Clay */}
        <div className="relative p-3 bg-gradient-to-b from-amber-50 to-orange-50 rounded-full border-4 border-amber-200 shadow-clay">
          <svg viewBox="0 0 160 160" className="size-48 select-none drop-shadow-md cursor-pointer overflow-visible">
            <defs>
              <filter id="pizzaShadowExp" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#78350f" floodOpacity="0.25" />
              </filter>
            </defs>
            <circle cx="80" cy="80" r="72" fill="#d97706" stroke="#92400e" strokeWidth="4" filter="url(#pizzaShadowExp)" />
            <circle cx="80" cy="80" r="66" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
            {Array.from({ length: pizzaSlices }).map((_, i) => {
              const startAngle = (i * 360) / pizzaSlices
              const endAngle = ((i + 1) * 360) / pizzaSlices
              const isShaded = i < pizzaShaded

              const x1 = 80 + 64 * Math.cos(((startAngle - 90) * Math.PI) / 180)
              const y1 = 80 + 64 * Math.sin(((startAngle - 90) * Math.PI) / 180)
              const x2 = 80 + 64 * Math.cos(((endAngle - 90) * Math.PI) / 180)
              const y2 = 80 + 64 * Math.sin(((endAngle - 90) * Math.PI) / 180)

              const largeArc = endAngle - startAngle > 180 ? 1 : 0
              const d = `M 80,80 L ${x1},${y1} A 64,64 0 ${largeArc},1 ${x2},${y2} Z`

              return (
                <path
                  key={`slice-${i}`}
                  d={d}
                  fill={isShaded ? '#ef4444' : '#fef08a'}
                  stroke="#92400e"
                  strokeWidth="2"
                  onClick={() => {
                    if (setPizzaShaded) {
                      if (isShaded) {
                        setPizzaShaded(i)
                      } else {
                        setPizzaShaded(i + 1)
                      }
                    }
                  }}
                  className="transition-all duration-200 hover:opacity-85 active:scale-98"
                />
              )
            })}
            <circle cx="80" cy="80" r="5" fill="#78350f" />
          </svg>
        </div>

        <div className="w-full bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-3.5 text-center font-display font-extrabold text-emerald-950 text-base shadow-clay">
          <AsmoFormula text={`Phân số biểu thị: $\\frac{${pizzaShaded}}{${pizzaSlices}}$ chiếc bánh pizza 🍕`} />
        </div>
      </div>
    )
  }

  // ── 2. Perimeter & Area Visualizer ──
  if (visualType === 'perimeter_area') {
    return (
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="bg-white p-4 rounded-3xl border-2 border-teal-200 shadow-sm space-y-3">
          <div className="text-xs font-black text-teal-900 uppercase">
            Hình Chữ Nhật: Chiều Dài 4m × Chiều Rộng 3m
          </div>

          {/* SVG Grid Rectangle */}
          <svg viewBox="0 0 160 120" className="w-48 mx-auto select-none drop-shadow-xs">
            <rect x="10" y="10" width="140" height="90" fill="#ccfbf1" stroke="#0f766e" strokeWidth="3" rx="4" />
            {/* Grid lines */}
            {Array.from({ length: 3 }).map((_, i) => (
              <line key={`gl-x-${i}`} x1={10 + (i + 1) * 35} y1="10" x2={10 + (i + 1) * 35} y2="100" stroke="#0d9488" strokeWidth="1" strokeDasharray="2 2" />
            ))}
            {Array.from({ length: 2 }).map((_, i) => (
              <line key={`gl-y-${i}`} x1="10" y1={10 + (i + 1) * 30} x2="150" y2={10 + (i + 1) * 30} stroke="#0d9488" strokeWidth="1" strokeDasharray="2 2" />
            ))}
            <text x="80" y="8" fill="#0f766e" fontSize="10" fontWeight="900" textAnchor="middle">4m (Dài)</text>
            <text x="5" y="58" fill="#0f766e" fontSize="10" fontWeight="900" textAnchor="middle" transform="rotate(-90 5 58)">3m (Rộng)</text>
          </svg>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-2 text-teal-950">
              <span className="block text-[10px] text-teal-700 uppercase">Chu vi (P):</span>
              <span>(4 + 3) × 2 = 14m</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 text-emerald-950">
              <span className="block text-[10px] text-emerald-700 uppercase">Diện tích (S):</span>
              <span>4 × 3 = 12m²</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── 3. 3D Cube Visualizer ──
  if (visualType === 'cube_3d') {
    return (
      <div className="w-full max-w-lg space-y-4 text-center">
        {/* Layer Controls */}
        <div className="grid grid-cols-3 gap-2.5 bg-indigo-50/80 p-3 rounded-2xl border-2 border-indigo-200 shadow-2xs">
          {[
            { label: 'Tầng 1 (Dưới)', idx: 0 },
            { label: 'Tầng 2 (Giữa)', idx: 1 },
            { label: 'Tầng 3 (Trên)', idx: 2 },
          ].map((tier) => (
            <div key={tier.label} className="flex flex-col items-center gap-1.5 bg-white p-2 rounded-2xl border-2 border-indigo-100 shadow-xs">
              <span className="text-[11px] font-black text-slate-700">{tier.label}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={`Bớt khối ${tier.label}`}
                  disabled={cubeLayers[tier.idx] <= 0}
                  onClick={() => {
                    if (setCubeLayers) {
                      const next = [...cubeLayers]
                      next[tier.idx] = Math.max(0, next[tier.idx] - 1)
                      setCubeLayers(next)
                    }
                  }}
                  className="size-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black flex items-center justify-center disabled:opacity-30 cursor-pointer active:scale-90"
                >
                  <Minus className="size-3.5 stroke-[3]" />
                </button>
                <span className="w-5 text-center font-display font-black text-sm text-indigo-950">
                  {cubeLayers[tier.idx]}
                </span>
                <button
                  type="button"
                  aria-label={`Thêm khối ${tier.label}`}
                  disabled={cubeLayers[tier.idx] >= 6}
                  onClick={() => {
                    if (setCubeLayers) {
                      const next = [...cubeLayers]
                      next[tier.idx] = Math.min(6, next[tier.idx] + 1)
                      setCubeLayers(next)
                    }
                  }}
                  className="size-7 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black flex items-center justify-center disabled:opacity-30 cursor-pointer active:scale-90"
                >
                  <Plus className="size-3.5 stroke-[3]" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Isometric 2D Flat Soft Clay Layer Stacking Illustration */}
        <div className="p-4 bg-gradient-to-b from-indigo-100/90 via-indigo-50/70 to-purple-50/80 rounded-3xl border-2 border-indigo-200 shadow-clay flex flex-col items-center justify-center gap-2">
          {/* Tier 3 (Top) */}
          {cubeLayers[2] > 0 && (
            <div className="flex items-center justify-center gap-1.5 animate-in zoom-in-50">
              {Array.from({ length: cubeLayers[2] }).map((_, i) => (
                <FlatClayCube key={`t3-${i}`} size={36} color="pink" />
              ))}
            </div>
          )}
          {/* Tier 2 (Middle) */}
          {cubeLayers[1] > 0 && (
            <div className="flex items-center justify-center gap-1.5 animate-in zoom-in-50">
              {Array.from({ length: cubeLayers[1] }).map((_, i) => (
                <FlatClayCube key={`t2-${i}`} size={36} color="purple" />
              ))}
            </div>
          )}
          {/* Tier 1 (Bottom) */}
          {cubeLayers[0] > 0 && (
            <div className="flex items-center justify-center gap-1.5 animate-in zoom-in-50">
              {Array.from({ length: cubeLayers[0] }).map((_, i) => (
                <FlatClayCube key={`t1-${i}`} size={36} color="indigo" />
              ))}
            </div>
          )}
        </div>

        {/* Giant Montessori Toy Calculation Board */}
        <div className="w-full bg-white border-2 border-brand-100 rounded-3xl p-3.5 sm:p-4 text-center shadow-clay space-y-2">
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap select-none my-0.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-indigo-50 border-2 border-indigo-200 text-indigo-900 shadow-clay">
              <FlatClayCube size={22} color="indigo" />
              <span className="font-display font-black text-xl text-indigo-900">{cubeLayers[0]} (dưới)</span>
            </div>
            <span className="font-black text-xl text-indigo-500">+</span>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-purple-50 border-2 border-purple-200 text-purple-900 shadow-clay">
              <FlatClayCube size={22} color="purple" />
              <span className="font-display font-black text-xl text-purple-900">{cubeLayers[1]} (giữa)</span>
            </div>
            <span className="font-black text-xl text-purple-500">+</span>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-pink-50 border-2 border-pink-200 text-pink-900 shadow-clay">
              <FlatClayCube size={22} color="pink" />
              <span className="font-display font-black text-xl text-pink-900">{cubeLayers[2]} (trên)</span>
            </div>
            <span className="font-black text-xl text-indigo-500">=</span>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-brand-500 text-white font-black text-2xl shadow-clay border-2 border-brand-600">
              <span className="font-display font-black text-2xl text-white">{cubeLayers[0] + cubeLayers[1] + cubeLayers[2]}</span>
              <FlatClayCube size={24} color="rose" className="animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── 4. Matchstick Visualizer ──
  if (visualType === 'matchstick') {
    return (
      <div className="w-full max-w-md space-y-3 text-center">
        <div className="bg-white p-4 rounded-3xl border-2 border-amber-200 shadow-sm space-y-3">
          <div className="text-xs font-black text-amber-900 uppercase">
            Xếp 3 Ô Vuông Nối Tiếp Cần 10 Que Diêm
          </div>
          <div className="flex justify-center">
            {renderMatchstickFigureSvg('square_flag', 6, { className: 'w-48 h-24' })}
          </div>
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-xs font-bold text-amber-950">
            <AsmoFormula text="Quy luật: Ô đầu tiên cần 4 que, mỗi ô tiếp theo cần thêm 3 que $\rightarrow 4 + 3 + 3 = 10$ que diêm!" />
          </div>
        </div>
      </div>
    )
  }

  return null
}
