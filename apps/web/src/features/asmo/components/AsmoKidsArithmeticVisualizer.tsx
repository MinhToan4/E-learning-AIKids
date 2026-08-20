import { useState, useMemo } from 'react'
import { Sparkles, RefreshCw, CheckCircle2, Star, Heart, Lightbulb, Zap, Award } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { AsmoFormula } from './AsmoFormula'

type Props = {
  level: 1 | 2 | 3
  className?: string
}

export function AsmoKidsArithmeticVisualizer({ level, className }: Props) {
  // ── LEVEL 1: BUBBLE MAKE-10 PAIRING ──
  const initialBubbles = [
    { id: 1, val: 1, color: 'from-pink-500 to-rose-500', border: 'border-pink-300' },
    { id: 2, val: 3, color: 'from-amber-400 to-orange-500', border: 'border-amber-300' },
    { id: 3, val: 5, color: 'from-emerald-400 to-teal-500', border: 'border-emerald-300' },
    { id: 4, val: 7, color: 'from-cyan-400 to-blue-500', border: 'border-cyan-300' },
    { id: 5, val: 9, color: 'from-purple-500 to-indigo-600', border: 'border-purple-300' },
  ]
  const [selectedBubbleIds, setSelectedBubbleIds] = useState<number[]>([])
  const [pairedPairs, setPairedPairs] = useState<Array<[number, number]>>([])

  const handleBubbleClick = (id: number) => {
    // If already paired, ignore
    if (pairedPairs.some(([a, b]) => a === id || b === id)) return

    if (selectedBubbleIds.includes(id)) {
      setSelectedBubbleIds(selectedBubbleIds.filter((bId) => bId !== id))
      return
    }

    if (selectedBubbleIds.length === 0) {
      setSelectedBubbleIds([id])
    } else if (selectedBubbleIds.length === 1) {
      const firstId = selectedBubbleIds[0]
      const firstVal = initialBubbles.find((b) => b.id === firstId)!.val
      const secondVal = initialBubbles.find((b) => b.id === id)!.val

      if (firstVal + secondVal === 10) {
        setPairedPairs([...pairedPairs, [firstId, id]])
        setSelectedBubbleIds([])
      } else {
        // Not 10, just select the new one
        setSelectedBubbleIds([id])
      }
    }
  }

  const resetLevel1 = () => {
    setSelectedBubbleIds([])
    setPairedPairs([])
  }

  // ── LEVEL 2: COLUMN ADDITION WITH CARRY ──
  const [boxOnes, setBoxOnes] = useState<number>(8) // Target: 8 (48 + 37 = 85)
  const [boxTens, setBoxTens] = useState<number>(3) // Target: 3

  const onesSum = boxOnes + 7
  const hasCarry = onesSum >= 10
  const onesDigitResult = onesSum % 10
  const carryValue = hasCarry ? 1 : 0
  const tensSum = 4 + boxTens + carryValue
  const isLvl2Correct = boxOnes === 8 && boxTens === 3 && tensSum === 8 && onesDigitResult === 5

  // ── LEVEL 3: GAUSS RAINBOW SEQUENCE ──
  const [gaussActivePairsCount, setGaussActivePairsCount] = useState<number>(10) // 1 to 10
  const gaussNumbers = Array.from({ length: 20 }, (_, i) => i + 1)
  const rainbowColors = [
    '#f43f5e', '#fb923c', '#facc15', '#4ade80', '#2dd4bf',
    '#38bdf8', '#818cf8', '#a855f7', '#ec4899', '#f43f5e'
  ]

  return (
    <div className={cn('relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border border-slate-700/60 shadow-xl p-4 sm:p-6 text-white flex flex-col justify-between min-h-[420px]', className)}>
      {/* ── HEADER BAR ── */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-2xl bg-amber-500/30 text-amber-300 border border-amber-400/40 shadow-inner">
            <Sparkles className="size-4.5" />
          </div>
          <div>
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">
              Phép Tính Vui Nhộn &amp; Trực Quan Sư Phạm Tiểu Học
            </span>
            <span className="text-[11px] text-slate-300 font-medium">
              {level === 1 && 'Level 1: 🎈 Bí kíp ghép cặp 10 siêu tốc'}
              {level === 2 && 'Level 2: 🧩 Điền chữ số bí ẩn & Phép cộng có nhớ'}
              {level === 3 && 'Level 3: 🌈 Cầu vồng Gauss & Dãy số cách đều'}
            </span>
          </div>
        </div>

        {level === 1 && (
          <button
            type="button"
            onClick={resetLevel1}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-200 transition-all cursor-pointer border border-white/10"
          >
            <RefreshCw className="size-3" />
            <span>Ghép Lại</span>
          </button>
        )}
      </div>

      {/* ── MAIN INTERACTIVE WORKSPACE ── */}
      <div className="flex-1 flex flex-col items-center justify-center my-2">
        {/* ── LEVEL 1: BUBBLE MAKE-10 PAIR MATCHING ── */}
        {level === 1 && (
          <div className="w-full max-w-lg flex flex-col items-center space-y-4">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-amber-200">
                🐱 Mèo Mee: &quot;Bấm chọn 2 quả bóng có tổng bằng 10 để ghép cặp nào!&quot;
              </span>
              <div className="text-sm sm:text-base font-black font-mono tracking-wide text-white">
                1 + 3 + 5 + 7 + 9 = ?
              </div>
            </div>

            {/* Bubble Buttons */}
            <div className="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap">
              {initialBubbles.map((bubble) => {
                const isSelected = selectedBubbleIds.includes(bubble.id)
                const isPaired = pairedPairs.some(([a, b]) => a === bubble.id || b === bubble.id)
                return (
                  <button
                    key={bubble.id}
                    type="button"
                    onClick={() => handleBubbleClick(bubble.id)}
                    className={cn(
                      'relative size-14 sm:size-16 rounded-full flex flex-col items-center justify-center font-black text-xl shadow-lg transition-all duration-300 cursor-pointer border-2',
                      bubble.color,
                      bubble.border,
                      isSelected && 'scale-110 ring-4 ring-yellow-300 animate-pulse',
                      isPaired && 'opacity-60 ring-2 ring-emerald-400 grayscale-20 scale-95',
                      !isPaired && !isSelected && 'hover:scale-105 active:scale-95'
                    )}
                  >
                    <span className="text-white drop-shadow-md">{bubble.val}</span>
                    <span className="text-[9px] text-white/90 font-bold -mt-1">🎈</span>
                    {isPaired && (
                      <span className="absolute -top-1 -right-1 size-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] text-white border border-white">
                        ✓
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Paired Feedback Status */}
            <div className="w-full grid grid-cols-2 gap-2 text-xs">
              <div className={cn('p-2.5 rounded-2xl border transition-all text-center', pairedPairs.some(([a, b]) => (a === 1 && b === 5) || (a === 5 && b === 1)) ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-400')}>
                <span className="font-bold block text-[11px]">Cặp số (1 + 9)</span>
                <span className="font-mono font-black text-sm">
                  {pairedPairs.some(([a, b]) => (a === 1 && b === 5) || (a === 5 && b === 1)) ? '🌟 = 10 (Đã ghép)' : 'Chưa ghép (1 và 9)'}
                </span>
              </div>
              <div className={cn('p-2.5 rounded-2xl border transition-all text-center', pairedPairs.some(([a, b]) => (a === 2 && b === 4) || (a === 4 && b === 2)) ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-400')}>
                <span className="font-bold block text-[11px]">Cặp số (3 + 7)</span>
                <span className="font-mono font-black text-sm">
                  {pairedPairs.some(([a, b]) => (a === 2 && b === 4) || (a === 4 && b === 2)) ? '🌟 = 10 (Đã ghép)' : 'Chưa ghép (3 và 7)'}
                </span>
              </div>
            </div>

            {/* Calculation summary banner */}
            <div className="w-full bg-indigo-900/60 border border-indigo-400/30 rounded-2xl p-3 text-center space-y-1">
              <span className="text-xs text-indigo-200 font-bold block">
                🌈 Phép tính gộp thông minh:
              </span>
              <div className="font-mono font-black text-emerald-300 text-sm sm:text-base">
                (1 + 9) + (3 + 7) + 5 = 10 + 10 + 5 = 25
              </div>
            </div>
          </div>
        )}

        {/* ── LEVEL 2: COLUMN ADDITION WITH ANIMATED CARRY ── */}
        {level === 2 && (
          <div className="w-full max-w-md flex flex-col items-center space-y-3">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-amber-200">
                🐱 Mèo Mee: &quot;Chọn các chữ số để phép tính $4\square + \square 7 = 85$ chính xác nhé!&quot;
              </span>
            </div>

            {/* Interactive Column Board */}
            <div className="w-full bg-slate-900/90 rounded-2xl border-2 border-indigo-500/40 p-4 shadow-xl">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-400 border-b border-white/10 pb-2 mb-3">
                <span className="w-20 text-center uppercase tracking-wider text-indigo-300">Hàng Chục</span>
                <span className="w-20 text-center uppercase tracking-wider text-amber-300">Hàng Đơn Vị</span>
              </div>

              {/* Carry Indicator */}
              <div className="flex items-center justify-between mb-2">
                <div className="w-20 flex justify-center">
                  {hasCarry ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] shadow-sm animate-bounce">
                      +1 (Nhớ)
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-600 font-mono">0</span>
                  )}
                </div>
                <div className="w-20 text-center text-[11px] text-slate-500">
                  {hasCarry ? 'Có nhớ 1 ➔' : 'Không nhớ'}
                </div>
              </div>

              {/* Row 1: 4 and [boxOnes] */}
              <div className="flex items-center justify-between font-mono font-black text-2xl mb-2">
                <span className="w-20 text-center text-slate-200">4</span>
                <div className="w-20 flex justify-center">
                  <div className="relative">
                    <button
                      type="button"
                      className="size-10 rounded-xl bg-amber-500/30 border-2 border-amber-400 text-amber-300 flex items-center justify-center font-bold text-xl shadow-md"
                    >
                      {boxOnes}
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: [boxTens] and 7 with + sign */}
              <div className="flex items-center justify-between font-mono font-black text-2xl border-b-2 border-white/40 pb-2 mb-2 relative">
                <span className="absolute -left-1 top-1 text-indigo-400 font-bold text-xl">+</span>
                <div className="w-20 flex justify-center">
                  <button
                    type="button"
                    className="size-10 rounded-xl bg-indigo-500/30 border-2 border-indigo-400 text-indigo-300 flex items-center justify-center font-bold text-xl shadow-md"
                  >
                    {boxTens}
                  </button>
                </div>
                <span className="w-20 text-center text-slate-200">7</span>
              </div>

              {/* Result Row: tensSum and onesDigitResult */}
              <div className="flex items-center justify-between font-mono font-black text-2xl pt-1">
                <span className={cn('w-20 text-center', tensSum === 8 ? 'text-emerald-400' : 'text-rose-400')}>
                  {tensSum}
                </span>
                <span className={cn('w-20 text-center', onesDigitResult === 5 ? 'text-emerald-400' : 'text-rose-400')}>
                  {onesDigitResult}
                </span>
              </div>
            </div>

            {/* Stepper Controls for Mystery Boxes */}
            <div className="w-full grid grid-cols-2 gap-3 text-xs">
              {/* Stepper Box Ones */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 flex flex-col items-center space-y-1.5">
                <span className="font-bold text-amber-300">Chữ số hàng đơn vị (4☐):</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBoxOnes((prev) => (prev > 0 ? prev - 1 : 9))}
                    className="size-7 rounded-lg bg-white/10 hover:bg-white/20 font-bold text-base cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono font-black text-base text-amber-200">{boxOnes}</span>
                  <button
                    type="button"
                    onClick={() => setBoxOnes((prev) => (prev < 9 ? prev + 1 : 0))}
                    className="size-7 rounded-lg bg-white/10 hover:bg-white/20 font-bold text-base cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Stepper Box Tens */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 flex flex-col items-center space-y-1.5">
                <span className="font-bold text-indigo-300">Chữ số hàng chục (☐7):</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBoxTens((prev) => (prev > 0 ? prev - 1 : 9))}
                    className="size-7 rounded-lg bg-white/10 hover:bg-white/20 font-bold text-base cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono font-black text-base text-indigo-200">{boxTens}</span>
                  <button
                    type="button"
                    onClick={() => setBoxTens((prev) => (prev < 9 ? prev + 1 : 0))}
                    className="size-7 rounded-lg bg-white/10 hover:bg-white/20 font-bold text-base cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Validation Banner */}
            <div className={cn('w-full rounded-2xl p-2.5 text-center text-xs font-bold transition-all border', isLvl2Correct ? 'bg-emerald-900/60 border-emerald-400 text-emerald-200 shadow-md' : 'bg-slate-800/60 border-slate-700 text-slate-400')}>
              {isLvl2Correct ? (
                <span>🎉 CHÍNH XÁC: 48 + 37 = 85 (8 + 7 = 15 nhớ 1; 4 + 3 + 1 = 8)</span>
              ) : (
                <span>Hãy điều chỉnh để tổng bằng đúng 85 (Hiện tại: {tensSum}{onesDigitResult})</span>
              )}
            </div>
          </div>
        )}

        {/* ── LEVEL 3: GAUSS RAINBOW SEQUENCE VISUALIZER ── */}
        {level === 3 && (
          <div className="w-full max-w-lg flex flex-col items-center space-y-3">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-amber-200">
                🐱 Mèo Mee: &quot;Bí mật của thần đồng Gauss: Ghép số đầu với số cuối để tạo thành các cặp có tổng bằng 21!&quot;
              </span>
            </div>

            {/* Rainbow SVG Arcs & Number Cards */}
            <div className="w-full bg-slate-900/90 rounded-2xl border border-indigo-500/30 p-3 sm:p-4">
              <svg viewBox="0 0 400 130" className="w-full select-none">
                <defs>
                  {rainbowColors.map((color, idx) => (
                    <linearGradient key={`grad-${idx}`} id={`rainbowGrad-${idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                      <stop offset="100%" stopColor={color} stopOpacity="0.8" />
                    </linearGradient>
                  ))}
                </defs>

                {/* Draw Rainbow Arcs */}
                {Array.from({ length: gaussActivePairsCount }).map((_, i) => {
                  const leftIdx = i
                  const rightIdx = 19 - i
                  const x1 = 15 + leftIdx * 19.5
                  const x2 = 15 + rightIdx * 19.5
                  const height = 20 + (9 - i) * 8
                  const color = rainbowColors[i % rainbowColors.length]

                  return (
                    <g key={`arc-${i}`}>
                      <path
                        d={`M ${x1},100 C ${x1},${100 - height} ${x2},${100 - height} ${x2},100`}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeDasharray={i < gaussActivePairsCount ? 'none' : '3 3'}
                        className="transition-all duration-300"
                      />
                      {/* Pair Sum Badge on top of the largest visible arc */}
                      {i === 0 && (
                        <g>
                          <rect x="180" y="10" width="40" height="18" rx="6" fill="#1e1b4b" stroke="#facc15" strokeWidth="1.5" />
                          <text x="200" y="23" fill="#fde047" fontSize="11" fontWeight="bold" textAnchor="middle">
                            21
                          </text>
                        </g>
                      )}
                    </g>
                  )
                })}

                {/* Number dots at bottom */}
                {gaussNumbers.map((num, i) => {
                  const x = 15 + i * 19.5
                  const isOuter = i === 0 || i === 19
                  return (
                    <g key={`num-${num}`}>
                      <circle cx={x} cy="108" r="8" fill={isOuter ? '#6366f1' : '#1e293b'} stroke="#94a3b8" strokeWidth="1" />
                      <text x={x} y="112" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                        {num}
                      </text>
                    </g>
                  )
                })}
              </svg>

              {/* Slider to expand pairs */}
              <div className="mt-2 flex items-center justify-between gap-3 bg-white/5 px-3 py-2 rounded-xl border border-white/10 text-xs">
                <span className="font-bold text-slate-300">Số cặp ghép nối: {gaussActivePairsCount}/10</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={gaussActivePairsCount}
                  onChange={(e) => setGaussActivePairsCount(parseInt(e.target.value, 10))}
                  className="flex-1 accent-indigo-500 cursor-pointer"
                />
                <span className="font-mono font-bold text-amber-300">{gaussActivePairsCount * 21}</span>
              </div>
            </div>

            {/* Formula Banner */}
            <div className="w-full bg-indigo-900/60 border border-indigo-400/30 rounded-2xl p-3 text-center space-y-1">
              <span className="text-xs text-indigo-200 font-bold block">
                🌟 Công thức Gauss tổng quát:
              </span>
              <div className="font-mono font-black text-amber-300 text-sm sm:text-base">
                S = (20 × 21) : 2 = 10 × 21 = 210
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER BAR ── */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/10">
        <span className="flex items-center gap-1 text-amber-300 font-bold">
          <Star className="size-3 text-amber-400 fill-amber-400" />
          Mô hình Trực Quan Sư Phạm AI Mèo Mee
        </span>
        <span className="font-mono text-emerald-400 font-bold">100% Kid-Friendly Interactive</span>
      </div>
    </div>
  )
}
