import { useState, useMemo } from 'react'
import { Sparkles, RefreshCw, Star, Minus, Plus, Volume2, Heart } from 'lucide-react'
import { AsmoInteractiveAppleTreeCanvas, speakVietnamese } from './AsmoInteractiveAppleTreeCanvas'
import { AsmoFormula } from './AsmoFormula'
import { renderBalanceScaleSvg } from './AsmoDiagramEngine'
import { cn } from '@/shared/lib/cn'

export type ArithmeticVisualizerMode =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'make10'
  | 'pizza_fraction'
  | 'balance_scale'
  | 'cube_3d'
  | 'column'
  | 'gauss'

type Props = {
  level?: 1 | 2 | 3
  topicId?: string
  mode?: ArithmeticVisualizerMode
  className?: string
}

export function AsmoKidsArithmeticVisualizer({ level = 1, topicId, mode: forcedMode, className }: Props) {
  // Determine active mode based on topicId, level or user selection
  const defaultMode = useMemo<ArithmeticVisualizerMode>(() => {
    if (forcedMode) return forcedMode
    if (topicId === 'elem-addition') return 'addition'
    if (topicId === 'elem-subtraction') return 'subtraction'
    if (topicId === 'elem-multiplication') return 'multiplication'
    if (topicId === 'elem-division') return 'division'
    if (topicId === 'elem-fraction' || topicId === 'pizza_fraction') return 'pizza_fraction'
    if (topicId === 'elem-balance' || topicId === 'balance_scale') return 'balance_scale'
    if (topicId === 'elem-cube' || topicId === 'cube_3d') return 'cube_3d'
    if (level === 2) return 'column'
    if (level === 3) return 'gauss'
    return 'make10'
  }, [forcedMode, topicId, level])

  const [activeMode, setActiveMode] = useState<ArithmeticVisualizerMode>(defaultMode)

  // Sync mode if topicId changes
  useMemo(() => {
    if (forcedMode) {
      setActiveMode(forcedMode)
    } else if (topicId === 'elem-addition') {
      setActiveMode(level === 2 ? 'column' : level === 3 ? 'gauss' : 'addition')
    } else if (topicId === 'elem-subtraction') {
      setActiveMode('subtraction')
    } else if (topicId === 'elem-multiplication') {
      setActiveMode('multiplication')
    } else if (topicId === 'elem-division') {
      setActiveMode('division')
    } else if (topicId === 'elem-fraction' || topicId === 'pizza_fraction') {
      setActiveMode('pizza_fraction')
    } else if (topicId === 'elem-balance' || topicId === 'balance_scale') {
      setActiveMode('balance_scale')
    } else if (topicId === 'elem-cube' || topicId === 'cube_3d') {
      setActiveMode('cube_3d')
    }
  }, [topicId, level, forcedMode])

  // ══════════════════════════════════════════════════════════════════════════
  // 1. MODE: ADDITION (VƯỜN TÁO MẸ & 2 GIỎ MÂY 3D)
  // ══════════════════════════════════════════════════════════════════════════
  const [applesBasketA, setApplesBasketA] = useState<number>(4)
  const [applesBasketB, setApplesBasketB] = useState<number>(3)

  const handleAddApple = (basket: 'A' | 'B') => {
    if (basket === 'A') {
      setApplesBasketA((prev) => (prev < 10 ? prev + 1 : 10))
    } else {
      setApplesBasketB((prev) => (prev < 10 ? prev + 1 : 10))
    }
  }

  const handleSubApple = (basket: 'A' | 'B') => {
    if (basket === 'A') {
      setApplesBasketA((prev) => (prev > 0 ? prev - 1 : 0))
    } else {
      setApplesBasketB((prev) => (prev > 0 ? prev - 1 : 0))
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 2. MODE: SUBTRACTION (NỔ BÓNG BAY 🎈 & BẢNG TÍNH MONTESSORI)
  // ══════════════════════════════════════════════════════════════════════════
  const initialBalloons = useMemo(() => [
    { id: 1, color: 'from-rose-400 to-rose-600 border-rose-300 text-white', shadow: 'shadow-rose-300/50', emoji: '🎈' },
    { id: 2, color: 'from-amber-400 to-amber-600 border-amber-300 text-white', shadow: 'shadow-amber-300/50', emoji: '🎈' },
    { id: 3, color: 'from-emerald-400 to-emerald-600 border-emerald-300 text-white', shadow: 'shadow-emerald-300/50', emoji: '🎈' },
    { id: 4, color: 'from-sky-400 to-sky-600 border-sky-300 text-white', shadow: 'shadow-sky-300/50', emoji: '🎈' },
    { id: 5, color: 'from-purple-400 to-purple-600 border-purple-300 text-white', shadow: 'shadow-purple-300/50', emoji: '🎈' },
    { id: 6, color: 'from-pink-400 to-pink-600 border-pink-300 text-white', shadow: 'shadow-pink-300/50', emoji: '🎈' },
    { id: 7, color: 'from-indigo-400 to-indigo-600 border-indigo-300 text-white', shadow: 'shadow-indigo-300/50', emoji: '🎈' },
    { id: 8, color: 'from-teal-400 to-teal-600 border-teal-300 text-white', shadow: 'shadow-teal-300/50', emoji: '🎈' },
    { id: 9, color: 'from-orange-400 to-orange-600 border-orange-300 text-white', shadow: 'shadow-orange-300/50', emoji: '🎈' },
    { id: 10, color: 'from-lime-400 to-lime-600 border-lime-300 text-white', shadow: 'shadow-lime-300/50', emoji: '🎈' },
  ], [])

  const [poppedBalloonIds, setPoppedBalloonIds] = useState<number[]>([1, 2, 3])
  const [popAnimId, setPopAnimId] = useState<number | null>(null)
  const remainingBalloonsCount = initialBalloons.length - poppedBalloonIds.length

  const handlePopBalloon = (id: number) => {
    if (poppedBalloonIds.includes(id)) {
      setPoppedBalloonIds(poppedBalloonIds.filter((bId) => bId !== id))
    } else {
      setPopAnimId(id)
      setTimeout(() => setPopAnimId(null), 800)
      setPoppedBalloonIds([...poppedBalloonIds, id])
    }
  }

  const resetBalloons = () => {
    setPoppedBalloonIds([])
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 3. MODE: MULTIPLICATION (KHAY BÁNH CUPCAKE HÀNG × CỘT)
  // ══════════════════════════════════════════════════════════════════════════
  const [multRows, setMultRows] = useState<number>(3)
  const [multCols, setMultCols] = useState<number>(4)
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null)
  const totalCakes = multRows * multCols

  // ══════════════════════════════════════════════════════════════════════════
  // 4. MODE: DIVISION (ĐĨA SỨ KẸO MÚT CHIA ĐỀU 🍬 🍽️)
  // ══════════════════════════════════════════════════════════════════════════
  const [totalCandies, setTotalCandies] = useState<number>(12)
  const [platesCount, setPlatesCount] = useState<number>(3)

  const candiesPerPlate = Math.floor(totalCandies / platesCount)
  const remainderCandies = totalCandies % platesCount

  // ══════════════════════════════════════════════════════════════════════════
  // 5. MODE: MAKE-10 (CẦU VỒNG BẠN THÂN PHÁT SÁNG & BẮN TIM 💖)
  // ══════════════════════════════════════════════════════════════════════════
  const initialBubbles = useMemo(() => [
    { id: 1, val: 1, fruit: '🍎', gradient: 'from-rose-500 to-pink-600 text-white', border: 'border-rose-300' },
    { id: 2, val: 3, fruit: '🍋', gradient: 'from-amber-400 to-yellow-500 text-slate-950', border: 'border-amber-300' },
    { id: 3, val: 5, fruit: '🍇', gradient: 'from-purple-500 to-indigo-600 text-white', border: 'border-purple-300' },
    { id: 4, val: 7, fruit: '🍋', gradient: 'from-yellow-400 to-amber-500 text-slate-950', border: 'border-yellow-300' },
    { id: 5, val: 9, fruit: '🍎', gradient: 'from-rose-500 to-pink-600 text-white', border: 'border-rose-300' },
  ], [])

  const [selectedBubbleIds, setSelectedBubbleIds] = useState<number[]>([])
  const [pairedPairs, setPairedPairs] = useState<Array<[number, number]>>([])
  const [heartAnim, setHeartAnim] = useState<boolean>(false)

  const handleBubbleClick = (id: number) => {
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
        setHeartAnim(true)
        setTimeout(() => setHeartAnim(false), 1200)
      } else {
        setSelectedBubbleIds([id])
      }
    }
  }

  const resetLevel1 = () => {
    setSelectedBubbleIds([])
    setPairedPairs([])
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 6. MODE: PIZZA FRACTION (PHÂN SỐ PIZZA CẮT LÁT)
  // ══════════════════════════════════════════════════════════════════════════
  const [pizzaSlices, setPizzaSlices] = useState<number>(8)
  const [pizzaShaded, setPizzaShaded] = useState<number>(3)

  // ══════════════════════════════════════════════════════════════════════════
  // 7. MODE: BALANCE SCALE (CÂN THĂNG BẰNG SOFT CLAY)
  // ══════════════════════════════════════════════════════════════════════════
  const [scaleLeft, setScaleLeft] = useState<number>(2)
  const [scaleRight, setScaleRight] = useState<number>(6)

  // ══════════════════════════════════════════════════════════════════════════
  // 8. MODE: 3D CUBE (KHỐI LẬP PHƯƠNG MONTESSORI)
  // ══════════════════════════════════════════════════════════════════════════
  const [cubeLayers, setCubeLayers] = useState<number[]>([4, 2, 1])

  // ══════════════════════════════════════════════════════════════════════════
  // 9. MODE: COLUMN ADDITION WITH CARRY
  // ══════════════════════════════════════════════════════════════════════════
  const [boxOnes, setBoxOnes] = useState<number>(8)
  const [boxTens, setBoxTens] = useState<number>(3)

  const onesSum = boxOnes + 7
  const hasCarry = onesSum >= 10
  const onesDigitResult = onesSum % 10
  const carryValue = hasCarry ? 1 : 0
  const tensSum = 4 + boxTens + carryValue
  const isLvl2Correct = boxOnes === 8 && boxTens === 3 && tensSum === 8 && onesDigitResult === 5

  // ══════════════════════════════════════════════════════════════════════════
  // 10. MODE: GAUSS RAINBOW SEQUENCE
  // ══════════════════════════════════════════════════════════════════════════
  const [gaussActivePairsCount, setGaussActivePairsCount] = useState<number>(10)
  const gaussNumbers = Array.from({ length: 20 }, (_, i) => i + 1)
  const rainbowColors = [
    '#f43f5e', '#fb923c', '#eab308', '#10b981', '#06b6d4',
    '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f43f5e',
  ]

  return (
    <div className={cn('relative w-full rounded-3xl overflow-hidden bg-white border-2 border-brand-100 shadow-clay p-3 sm:p-5 text-slate-800 flex flex-col justify-between min-h-[380px] select-none', className)}>
      {/* ── TOP NAV & INTERACTIVE MODE SELECTOR ── */}
      <div className="border-b border-slate-100 pb-3 mb-3 space-y-2.5 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-clay shrink-0">
              <Sparkles className="size-5 animate-spin" />
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight block truncate">
                Phép Tính Vui Nhộn &amp; Trực Quan Sư Phạm Tiểu Học
              </span>
              <span className="text-[11px] text-slate-500 font-bold block truncate">
                {activeMode === 'addition' && '🍎 Phép Cộng: Thả táo vào giỏ & Nhảy số sinh động'}
                {activeMode === 'subtraction' && '🎈 Phép Trừ: Bấm nổ bóng bay & Bớt số lượng'}
                {activeMode === 'multiplication' && '🍰 Phép Nhân: Xếp khay bánh theo Hàng × Cột'}
                {activeMode === 'division' && '🍽️ Phép Chia: Chia đều kẹo mút vào các đĩa sứ'}
                {activeMode === 'make10' && 'Level 1: 🎈 Bí Kíp Ghép Cặp 10 Tính Nhẩm Thần Tốc'}
                {activeMode === 'pizza_fraction' && '🍕 Phân Số: Cắt lát bánh pizza trực quan'}
                {activeMode === 'balance_scale' && '⚖️ Cân Thăng Bằng: Cân đĩa bập bênh quả ngọt'}
                {activeMode === 'cube_3d' && '🧊 Khối Lập Phương: Đếm hình theo từng tầng'}
                {activeMode === 'column' && '🧮 Cột Dọc: Phép tính có nhớ / có mượn'}
                {activeMode === 'gauss' && '🌈 Chuỗi Gauss: Dãy số cách đều thần đồng'}
              </span>
            </div>
          </div>

          {/* Quick Action Reset */}
          {activeMode === 'addition' && (
            <button
              type="button"
              onClick={() => {
                setApplesBasketA(0)
                setApplesBasketB(0)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <RefreshCw className="size-3.5 text-brand-600" />
              <span>Trả Táo Về Cây</span>
            </button>
          )}

          {activeMode === 'make10' && (
            <button
              type="button"
              onClick={resetLevel1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <RefreshCw className="size-3.5 text-purple-600" />
              <span>Ghép Lại</span>
            </button>
          )}

          {activeMode === 'subtraction' && (
            <button
              type="button"
              onClick={resetBalloons}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <RefreshCw className="size-3.5 text-sky-600" />
              <span>Bơm Lại Bóng</span>
            </button>
          )}
        </div>

        {/* Mode Switcher Tabs Hallmark UI */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'addition' as const, emoji: '🍎', label: 'Cộng Táo', color: 'bg-rose-500 text-white shadow-clay border-rose-600' },
            { id: 'subtraction' as const, emoji: '🎈', label: 'Trừ Bóng Bay', color: 'bg-amber-500 text-white shadow-clay border-amber-600' },
            { id: 'multiplication' as const, emoji: '🍰', label: 'Nhân Khay Bánh', color: 'bg-emerald-500 text-white shadow-clay border-emerald-600' },
            { id: 'division' as const, emoji: '🍽️', label: 'Chia Kẹo Đều', color: 'bg-sky-500 text-white shadow-clay border-sky-600' },
            { id: 'make10' as const, emoji: '🔟', label: 'Kết Bạn 10', color: 'bg-indigo-600 text-white shadow-clay border-indigo-700' },
            { id: 'pizza_fraction' as const, emoji: '🍕', label: 'Phân Số Pizza', color: 'bg-orange-500 text-white shadow-clay border-orange-600' },
            { id: 'balance_scale' as const, emoji: '⚖️', label: 'Cân Thăng Bằng', color: 'bg-teal-600 text-white shadow-clay border-teal-700' },
            { id: 'cube_3d' as const, emoji: '🧊', label: 'Khối Lập Phương', color: 'bg-purple-600 text-white shadow-clay border-purple-700' },
            { id: 'column' as const, emoji: '🧮', label: 'Cột Dọc', color: 'bg-indigo-500 text-white shadow-clay border-indigo-600' },
            { id: 'gauss' as const, emoji: '🌈', label: 'Cầu Vồng Gauss', color: 'bg-pink-500 text-white shadow-clay border-pink-600' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveMode(tab.id)}
              className={cn(
                'px-3 py-1.5 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border-2 select-none active:scale-95',
                activeMode === tab.id
                  ? tab.color
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-2xs',
              )}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN INTERACTIVE WORKSPACE ── */}
      <div className="flex-1 flex flex-col items-center justify-center my-1 w-full">
        {/* ── 1. MODE: ADDITION (VƯỜN CÂY TÁO TƯƠNG TÁC KÉO THẢ TÁO VÀO GIỎ) ── */}
        {activeMode === 'addition' && (
          <div className="w-full max-w-xl">
            <AsmoInteractiveAppleTreeCanvas
              applesA={applesBasketA}
              applesB={applesBasketB}
              onAddApple={handleAddApple}
              onSubApple={handleSubApple}
              onReset={() => {
                setApplesBasketA(0)
                setApplesBasketB(0)
              }}
              title="Phép Cộng Thần Tốc: Vườn Táo &amp; Hai Giỏ Mây 3D"
              meeQuote="🐱 Mèo Mee: Bé hãy chạm vào quả táo trên cây hoặc kéo thả vào giỏ nhé!"
            />
          </div>
        )}

        {/* ── 2. MODE: SUBTRACTION (NỔ BÓNG BAY 🎈 & BẢNG TÍNH MONTESSORI) ── */}
        {activeMode === 'subtraction' && (
          <div className="w-full max-w-lg flex flex-col items-center space-y-3">
            {/* Balloon Sky Container */}
            <div className="w-full bg-gradient-to-b from-sky-100/90 via-sky-50/70 to-mint-50/80 border-2 border-sky-200 rounded-3xl p-4 sm:p-5 shadow-clay flex flex-col items-center space-y-3 relative overflow-hidden">
              <div className="absolute top-2 left-4 text-xl opacity-75 animate-pulse select-none">☁️</div>
              <div className="absolute top-3 right-6 text-lg opacity-70 animate-pulse select-none">☁️</div>

              {/* 10 Giant Soft Clay Balloons */}
              <div className="grid grid-cols-5 gap-2.5 sm:gap-3.5 z-10 w-full justify-items-center">
                {initialBalloons.map((b) => {
                  const isPopped = poppedBalloonIds.includes(b.id)
                  const isAnimating = popAnimId === b.id
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handlePopBalloon(b.id)}
                      className={cn(
                        'relative size-14 sm:size-16 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer border-3 select-none active:scale-90',
                        isPopped
                          ? 'bg-slate-200/80 border-slate-300 text-slate-400 opacity-40 scale-85 shadow-none'
                          : cn('bg-gradient-to-br shadow-clay hover:scale-110 active:scale-95', b.color, b.shadow),
                        isAnimating && 'animate-ping',
                      )}
                    >
                      <span className="text-2xl sm:text-3xl select-none leading-none">
                        {isPopped ? '💥' : b.emoji}
                      </span>
                      <span className={cn('text-[11px] font-black leading-none mt-0.5', isPopped ? 'text-slate-500' : 'text-white drop-shadow-xs')}>
                        {b.id}
                      </span>

                      {!isPopped && (
                        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0.5 h-2.5 bg-slate-400/80 pointer-events-none" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Sub-counter badge */}
              <div className="z-10 flex items-center justify-center gap-3 bg-white/95 px-4 py-1.5 rounded-full border border-sky-200 shadow-2xs text-xs font-black text-slate-800">
                <span>🎈 Ban đầu: <strong>10 quả</strong></span>
                <span>💥 Nổ: <strong className="text-rose-600">{poppedBalloonIds.length}</strong></span>
                <span>✨ Còn: <strong className="text-emerald-600">{remainingBalloonsCount}</strong></span>
              </div>
            </div>

            {/* Giant Montessori Toy Calculation Board */}
            <div className="w-full bg-white border-2 border-brand-100 rounded-3xl p-3.5 sm:p-4 text-center shadow-clay space-y-2">
              <span className="text-[11px] font-black uppercase text-sky-700 tracking-wider block">
                Phép trừ trực quan thời gian thực
              </span>
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap select-none my-0.5">
                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-sky-50 border-2 border-sky-200 text-sky-800 shadow-clay">
                  <span className="text-2xl sm:text-3xl">🎈</span>
                  <span className="font-display font-black text-2xl sm:text-3xl text-sky-800">10</span>
                </div>

                <div className="size-9 sm:size-11 rounded-2xl bg-sun-100 text-sun-800 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-clay border-2 border-sun-200">
                  −
                </div>

                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-700 shadow-clay">
                  <span className="text-2xl sm:text-3xl">💥</span>
                  <span className="font-display font-black text-2xl sm:text-3xl text-rose-700">{poppedBalloonIds.length}</span>
                </div>

                <div className="size-9 sm:size-11 rounded-2xl bg-sun-100 text-sun-800 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-clay border-2 border-sun-200">
                  =
                </div>

                <div className={cn(
                  'flex items-center gap-2 px-4 sm:px-5 py-2 rounded-2xl bg-brand-500 text-white font-black text-2xl sm:text-3xl shadow-clay border-2 border-brand-600 transition-all duration-300',
                  remainingBalloonsCount > 0 && 'scale-105 ring-4 ring-brand-200 animate-pulse',
                )}>
                  <span className="font-display font-black text-2xl sm:text-3xl text-white">{remainingBalloonsCount}</span>
                  <span className="text-xl sm:text-2xl animate-bounce">🎈</span>
                </div>
              </div>

              <div className="font-mono font-bold text-xs text-slate-500">
                10 − {poppedBalloonIds.length} = <span className="text-sky-600 font-black underline">{remainingBalloonsCount} quả bóng</span> còn bay
              </div>
            </div>
          </div>
        )}

        {/* ── 3. MODE: MULTIPLICATION (KHAY BÁNH CUPCAKE HÀNG × CỘT) ── */}
        {activeMode === 'multiplication' && (
          <div className="w-full max-w-lg flex flex-col items-center space-y-3">
            {/* Tactile Grid Stepper Controls */}
            <div className="w-full flex items-center justify-center gap-3 sm:gap-6 bg-amber-50/90 border-2 border-amber-200 px-4 py-2 rounded-2xl text-xs shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-800 font-black">Số hàng:</span>
                <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border-2 border-amber-300 shadow-2xs">
                  <button
                    type="button"
                    aria-label="Bớt hàng bánh"
                    disabled={multRows <= 1}
                    onClick={() => setMultRows((r) => (r > 1 ? r - 1 : 1))}
                    className="size-7 sm:size-8 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-black flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="size-3.5 sm:size-4 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center font-display font-black text-sm sm:text-base text-amber-950 select-none">{multRows}</span>
                  <button
                    type="button"
                    aria-label="Thêm hàng bánh"
                    disabled={multRows >= 5}
                    onClick={() => setMultRows((r) => (r < 5 ? r + 1 : 5))}
                    className="size-7 sm:size-8 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-black flex items-center justify-center shadow-clay transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="size-3.5 sm:size-4 stroke-[3]" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-800 font-black">Số cột:</span>
                <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border-2 border-emerald-300 shadow-2xs">
                  <button
                    type="button"
                    aria-label="Bớt cột bánh"
                    disabled={multCols <= 1}
                    onClick={() => setMultCols((c) => (c > 1 ? c - 1 : 1))}
                    className="size-7 sm:size-8 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="size-3.5 sm:size-4 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center font-display font-black text-sm sm:text-base text-emerald-950 select-none">{multCols}</span>
                  <button
                    type="button"
                    aria-label="Thêm cột bánh"
                    disabled={multCols >= 5}
                    onClick={() => setMultCols((c) => (c < 5 ? c + 1 : 5))}
                    className="size-7 sm:size-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center justify-center shadow-clay transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="size-3.5 sm:size-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Soft Clay Cupcake Tray */}
            <div className="w-full bg-gradient-to-b from-amber-100/90 via-amber-50/70 to-orange-50/80 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 shadow-clay flex flex-col items-center space-y-2">
              <div
                className="grid gap-2 sm:gap-3 select-none"
                style={{
                  gridTemplateColumns: `repeat(${multCols}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: multRows }).map((_, r) =>
                  Array.from({ length: multCols }).map((_, c) => {
                    const isRowLit = highlightedRow === r
                    return (
                      <button
                        key={`cake-${r}-${c}`}
                        type="button"
                        onMouseEnter={() => setHighlightedRow(r)}
                        onMouseLeave={() => setHighlightedRow(null)}
                        className={cn(
                          'size-12 sm:size-14 rounded-2xl flex flex-col items-center justify-center text-2xl sm:text-3xl transition-all duration-200 shadow-clay border-2 cursor-pointer',
                          isRowLit
                            ? 'bg-amber-300 border-amber-400 scale-110 ring-4 ring-amber-300 animate-bounce'
                            : 'bg-white border-amber-200 hover:scale-105 hover:bg-amber-50',
                        )}
                      >
                        <span>{r % 2 === 0 ? '🍰' : '🧁'}</span>
                      </button>
                    )
                  }),
                )}
              </div>
            </div>

            {/* Giant Montessori Toy Calculation Board */}
            <div className="w-full bg-white border-2 border-brand-100 rounded-3xl p-3.5 sm:p-4 text-center shadow-clay space-y-2">
              <span className="text-[11px] font-black uppercase text-amber-700 tracking-wider block">
                Bảng nhân trực quan
              </span>
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap select-none my-0.5">
                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-800 shadow-clay">
                  <span className="text-2xl sm:text-3xl">🥞</span>
                  <span className="font-display font-black text-2xl sm:text-3xl text-amber-800">{multRows} hàng</span>
                </div>

                <div className="size-9 sm:size-11 rounded-2xl bg-sun-100 text-sun-800 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-clay border-2 border-sun-200">
                  ×
                </div>

                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-800 shadow-clay">
                  <span className="text-2xl sm:text-3xl">🧁</span>
                  <span className="font-display font-black text-2xl sm:text-3xl text-emerald-800">{multCols} cột</span>
                </div>

                <div className="size-9 sm:size-11 rounded-2xl bg-sun-100 text-sun-800 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-clay border-2 border-sun-200">
                  =
                </div>

                <div className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-2xl bg-brand-500 text-white font-black text-2xl sm:text-3xl shadow-clay border-2 border-brand-600 transition-all duration-300">
                  <span className="font-display font-black text-2xl sm:text-3xl text-white">{totalCakes}</span>
                  <span className="text-xl sm:text-2xl animate-bounce">🍰</span>
                </div>
              </div>

              <div className="font-mono font-bold text-xs text-slate-500">
                {multRows} × {multCols} = <span className="text-amber-700 font-black underline">{totalCakes} chiếc bánh</span> thơm ngon
              </div>
            </div>
          </div>
        )}

        {/* ── 4. MODE: DIVISION (ĐĨA SỨ KẸO MÚT CHIA ĐỀU 🍬 🍽️) ── */}
        {activeMode === 'division' && (
          <div className="w-full max-w-lg flex flex-col items-center space-y-3">
            {/* Tactile Division Stepper Controls */}
            <div className="w-full flex items-center justify-center gap-3 sm:gap-6 bg-sky-50/90 border-2 border-sky-200 px-4 py-2 rounded-2xl text-xs shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-800 font-black">Số kẹo 🍬:</span>
                <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border-2 border-rose-300 shadow-2xs">
                  <button
                    type="button"
                    aria-label="Bớt kẹo"
                    disabled={totalCandies <= 4}
                    onClick={() => setTotalCandies((c) => (c > 4 ? c - 1 : 4))}
                    className="size-7 sm:size-8 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-black flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="size-3.5 sm:size-4 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center font-display font-black text-sm sm:text-base text-rose-950 select-none">{totalCandies}</span>
                  <button
                    type="button"
                    aria-label="Thêm kẹo"
                    disabled={totalCandies >= 24}
                    onClick={() => setTotalCandies((c) => (c < 24 ? c + 1 : 24))}
                    className="size-7 sm:size-8 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black flex items-center justify-center shadow-clay transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="size-3.5 sm:size-4 stroke-[3]" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-800 font-black">Số đĩa 🍽️:</span>
                <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border-2 border-sky-300 shadow-2xs">
                  <button
                    type="button"
                    aria-label="Bớt đĩa"
                    disabled={platesCount <= 2}
                    onClick={() => setPlatesCount((p) => (p > 2 ? p - 1 : 2))}
                    className="size-7 sm:size-8 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 font-black flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="size-3.5 sm:size-4 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center font-display font-black text-sm sm:text-base text-sky-950 select-none">{platesCount}</span>
                  <button
                    type="button"
                    aria-label="Thêm đĩa"
                    disabled={platesCount >= 6}
                    onClick={() => setPlatesCount((p) => (p < 6 ? p + 1 : 6))}
                    className="size-7 sm:size-8 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-black flex items-center justify-center shadow-clay transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="size-3.5 sm:size-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Porcelain Plates Stage */}
            <div className="w-full bg-gradient-to-b from-sky-50/90 via-teal-50/70 to-emerald-50/80 border-2 border-sky-200 rounded-3xl p-4 sm:p-5 shadow-clay flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
              {Array.from({ length: platesCount }).map((_, pIdx) => (
                <div
                  key={`plate-${pIdx}`}
                  className="size-24 sm:size-28 rounded-full bg-white border-3 border-sky-300 shadow-clay flex flex-col items-center justify-center p-2 relative transition-all hover:scale-105"
                >
                  <span className="text-[10px] sm:text-xs font-black text-sky-800 -mt-1">Đĩa {pIdx + 1}</span>
                  <div className="flex items-center justify-center gap-1 flex-wrap mt-0.5 max-w-[80px]">
                    {Array.from({ length: candiesPerPlate }).map((_, cIdx) => (
                      <span key={`candy-${pIdx}-${cIdx}`} className="text-base sm:text-lg select-none animate-in zoom-in-50">
                        🍬
                      </span>
                    ))}
                  </div>
                  <span className="text-[11px] font-mono font-black text-sky-900 mt-0.5">
                    {candiesPerPlate} cái
                  </span>
                </div>
              ))}
            </div>

            {/* Remainder candies dish */}
            {remainderCandies > 0 && (
              <div className="flex items-center gap-2 bg-amber-100/80 border-2 border-amber-300 px-4 py-1.5 rounded-full text-xs font-black text-amber-900 shadow-2xs">
                <span>🍬 Kẹo thừa chưa chia đủ:</span>
                <span className="font-mono font-black text-amber-800">{remainderCandies} cái</span>
              </div>
            )}

            {/* Giant Montessori Toy Calculation Board */}
            <div className="w-full bg-white border-2 border-brand-100 rounded-3xl p-3.5 sm:p-4 text-center shadow-clay space-y-2">
              <span className="text-[11px] font-black uppercase text-sky-700 tracking-wider block">
                Kết quả phép chia chia đều
              </span>
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap select-none my-0.5">
                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 shadow-clay">
                  <span className="text-2xl sm:text-3xl">🍬</span>
                  <span className="font-display font-black text-2xl sm:text-3xl text-rose-800">{totalCandies}</span>
                </div>

                <div className="size-9 sm:size-11 rounded-2xl bg-sun-100 text-sun-800 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-clay border-2 border-sun-200">
                  ÷
                </div>

                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-sky-50 border-2 border-sky-200 text-sky-800 shadow-clay">
                  <span className="text-2xl sm:text-3xl">🍽️</span>
                  <span className="font-display font-black text-2xl sm:text-3xl text-sky-800">{platesCount} đĩa</span>
                </div>

                <div className="size-9 sm:size-11 rounded-2xl bg-sun-100 text-sun-800 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-clay border-2 border-sun-200">
                  =
                </div>

                <div className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-2xl bg-brand-500 text-white font-black text-2xl sm:text-3xl shadow-clay border-2 border-brand-600 transition-all duration-300">
                  <span className="font-display font-black text-2xl sm:text-3xl text-white">{candiesPerPlate}</span>
                  <span className="text-xs font-black uppercase text-white/90">🍬 / đĩa</span>
                </div>
              </div>

              <div className="font-mono font-bold text-xs text-slate-500">
                {totalCandies} ÷ {platesCount} = <span className="text-rose-700 font-black underline">{candiesPerPlate} kẹo mỗi đĩa</span> {remainderCandies > 0 ? `(dư ${remainderCandies})` : '(chia hết)'}
              </div>
            </div>
          </div>
        )}

        {/* ── 5. MODE: MAKE-10 PAIR MATCHING ── */}
        {activeMode === 'make10' && (
          <div className="w-full max-w-lg flex flex-col items-center space-y-3 relative">
            {heartAnim && (
              <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none animate-ping text-5xl">
                💖 ✨ 🌈
              </div>
            )}

            <div className="text-center font-bold text-xs text-indigo-900 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-xl">
              Bí kíp ghép cặp 10 siêu tốc: 1 + 3 + 5 + 7 + 9 = ?
            </div>

            {/* Giant Tactile Number Bubbles */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap py-2">
              {initialBubbles.map((bubble) => {
                const isSelected = selectedBubbleIds.includes(bubble.id)
                const isPaired = pairedPairs.some(([a, b]) => a === bubble.id || b === bubble.id)
                return (
                  <button
                    key={bubble.id}
                    type="button"
                    onClick={() => handleBubbleClick(bubble.id)}
                    className={cn(
                      'relative size-16 sm:size-20 rounded-full flex flex-col items-center justify-center font-black text-2xl sm:text-3xl shadow-clay transition-all duration-300 cursor-pointer border-4 border-white select-none active:scale-95',
                      bubble.gradient,
                      isSelected && 'ring-4 ring-amber-400 scale-110 animate-bounce',
                      isPaired && 'ring-4 ring-emerald-500 scale-95 opacity-80',
                      !isPaired && !isSelected && 'hover:scale-105',
                    )}
                  >
                    <span className="drop-shadow-sm leading-none">{bubble.val}</span>
                    <span className="text-xs opacity-90 leading-none mt-0.5">{bubble.fruit}</span>
                    {isPaired && (
                      <span className="absolute -top-1 -right-1 size-6 bg-emerald-500 rounded-full flex items-center justify-center text-xs text-white border-2 border-white shadow-xs font-black">
                        ✓
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Paired Feedback Status */}
            <div className="w-full grid grid-cols-2 gap-2.5 text-xs">
              <div className={cn('p-3 rounded-2xl border-2 transition-all text-center shadow-2xs', pairedPairs.some(([a, b]) => (a === 1 && b === 5) || (a === 5 && b === 1)) ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600')}>
                <span className="font-black block text-xs">Cặp số (1 + 9)</span>
                <span className="font-mono font-black text-xs sm:text-sm">
                  {pairedPairs.some(([a, b]) => (a === 1 && b === 5) || (a === 5 && b === 1)) ? '🌟 = 10 (Đã ghép)' : 'Chưa ghép (1 và 9)'}
                </span>
              </div>
              <div className={cn('p-3 rounded-2xl border-2 transition-all text-center shadow-2xs', pairedPairs.some(([a, b]) => (a === 2 && b === 4) || (a === 4 && b === 2)) ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600')}>
                <span className="font-black block text-xs">Cặp số (3 + 7)</span>
                <span className="font-mono font-black text-xs sm:text-sm">
                  {pairedPairs.some(([a, b]) => (a === 2 && b === 4) || (a === 4 && b === 2)) ? '🌟 = 10 (Đã ghép)' : 'Chưa ghép (3 và 7)'}
                </span>
              </div>
            </div>

            {/* Giant Calculation Board */}
            <div className="w-full bg-emerald-50 border-2 border-emerald-300 text-emerald-950 font-bold p-3 rounded-2xl text-center shadow-clay space-y-1">
              <div className="font-mono font-black text-emerald-950 text-sm sm:text-base">
                (1 + 9) + (3 + 7) + 5 = 10 + 10 + 5 = <span className="text-emerald-700 font-black underline">25</span>
              </div>
            </div>
          </div>
        )}

        {/* ── 6. MODE: PIZZA FRACTION (Trạm 6) ── */}
        {activeMode === 'pizza_fraction' && (
          <div className="w-full max-w-md space-y-3.5 flex flex-col items-center">
            {/* Slice Count Stepper */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs bg-white p-3 rounded-2xl border-2 border-brand-100 shadow-clay w-full">
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-700">Số lát:</span>
                {[4, 6, 8, 10].map((num) => (
                  <button
                    key={`vis-slice-btn-${num}`}
                    type="button"
                    onClick={() => {
                      setPizzaSlices(num)
                      if (pizzaShaded > num) setPizzaShaded(num)
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
                <span className="font-black text-slate-700">Đã chọn:</span>
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border-2 border-emerald-300 shadow-2xs">
                  <button
                    type="button"
                    aria-label="Bớt lát pizza"
                    disabled={pizzaShaded <= 0}
                    onClick={() => setPizzaShaded((s) => (s > 0 ? s - 1 : 0))}
                    className="size-8 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="size-4 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center font-display font-black text-sm text-emerald-950 select-none">{pizzaShaded}</span>
                  <button
                    type="button"
                    aria-label="Thêm lát pizza"
                    disabled={pizzaShaded >= pizzaSlices}
                    onClick={() => setPizzaShaded((s) => (s < pizzaSlices ? s + 1 : pizzaSlices))}
                    className="size-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black flex items-center justify-center shadow-clay transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="size-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>

            {/* SVG Pizza Pie Soft Clay */}
            <div className="relative p-3 bg-gradient-to-b from-amber-50 to-orange-50 rounded-full border-4 border-amber-200 shadow-clay">
              <svg viewBox="0 0 160 160" className="size-44 select-none drop-shadow-md cursor-pointer overflow-visible">
                <circle cx="80" cy="80" r="72" fill="#d97706" stroke="#92400e" strokeWidth="4" />
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
                      key={`vis-slice-${i}`}
                      d={d}
                      fill={isShaded ? '#ef4444' : '#fef08a'}
                      stroke="#92400e"
                      strokeWidth="2"
                      onClick={() => {
                        if (isShaded) setPizzaShaded(i)
                        else setPizzaShaded(i + 1)
                      }}
                      className="transition-all duration-200 hover:opacity-85 active:scale-98"
                    />
                  )
                })}
                <circle cx="80" cy="80" r="5" fill="#78350f" />
              </svg>
            </div>

            {/* KaTeX Fraction Board */}
            <div className="w-full bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-3.5 text-center font-display font-extrabold text-emerald-950 text-base shadow-clay">
              <AsmoFormula text={`Phân số biểu thị: $\\frac{${pizzaShaded}}{${pizzaSlices}}$ chiếc bánh pizza 🍕`} />
            </div>
          </div>
        )}

        {/* ── 7. MODE: BALANCE SCALE (Trạm 7) ── */}
        {activeMode === 'balance_scale' && (
          <div className="w-full max-w-lg space-y-3.5 flex flex-col items-center">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-white p-3.5 rounded-2xl border-2 border-brand-200 shadow-2xs w-full">
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-800">Đĩa Trái (Dưa 🍉):</span>
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border-2 border-emerald-300 shadow-2xs">
                  <button
                    type="button"
                    aria-label="Bớt dưa"
                    disabled={scaleLeft <= 1}
                    onClick={() => setScaleLeft((s) => (s > 1 ? s - 1 : 1))}
                    className="size-8 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="size-4 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center font-display font-black text-sm text-emerald-950 select-none">{scaleLeft}</span>
                  <button
                    type="button"
                    aria-label="Thêm dưa"
                    disabled={scaleLeft >= 5}
                    onClick={() => setScaleLeft((s) => (s < 5 ? s + 1 : 5))}
                    className="size-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black flex items-center justify-center shadow-clay transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="size-4 stroke-[3]" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-black text-slate-800">Đĩa Phải (Táo 🍎):</span>
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border-2 border-rose-300 shadow-2xs">
                  <button
                    type="button"
                    aria-label="Bớt táo"
                    disabled={scaleRight <= 1}
                    onClick={() => setScaleRight((r) => (r > 1 ? r - 1 : 1))}
                    className="size-8 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-black flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="size-4 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center font-display font-black text-sm text-rose-950 select-none">{scaleRight}</span>
                  <button
                    type="button"
                    aria-label="Thêm táo"
                    disabled={scaleRight >= 15}
                    onClick={() => setScaleRight((r) => (r < 15 ? r + 1 : 15))}
                    className="size-8 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black flex items-center justify-center shadow-clay transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="size-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full">
              {renderBalanceScaleSvg({
                left: { emoji: '🍉', text: `${scaleLeft} Quả Dưa` },
                right: { emoji: '🍎', text: `${scaleRight} Quả Táo` },
                tilt: scaleLeft * 3 === scaleRight ? 'equal' : scaleLeft * 3 > scaleRight ? 'left' : 'right',
                label: `Đĩa trái: ${scaleLeft} Dưa — Đĩa phải: ${scaleRight} Táo`,
              })}
            </div>

            {/* Giant Calculation Board */}
            <div className="w-full bg-white border-2 border-brand-100 rounded-3xl p-3.5 sm:p-4 text-center shadow-clay space-y-2">
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap select-none my-0.5">
                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-800 shadow-clay">
                  <span className="text-2xl sm:text-3xl">🍉</span>
                  <span className="font-display font-black text-2xl sm:text-3xl text-emerald-800">{scaleLeft} dưa</span>
                </div>

                <div className="size-9 sm:size-11 rounded-2xl bg-sun-100 text-sun-800 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-clay border-2 border-sun-200">
                  {scaleLeft * 3 === scaleRight ? '=' : scaleLeft * 3 > scaleRight ? '>' : '<'}
                </div>

                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 shadow-clay">
                  <span className="text-2xl sm:text-3xl">🍎</span>
                  <span className="font-display font-black text-2xl sm:text-3xl text-rose-800">{scaleRight} táo</span>
                </div>
              </div>

              <div className="font-mono font-bold text-xs text-slate-500">
                {scaleLeft * 3 === scaleRight ? (
                  <span className="text-emerald-700 font-black">⚖️ Cân thăng bằng: {scaleLeft} dưa = {scaleRight} táo (1 dưa = 3 táo)</span>
                ) : scaleLeft * 3 > scaleRight ? (
                  <span className="text-amber-700 font-black">⚖️ Đĩa trái nặng hơn!</span>
                ) : (
                  <span className="text-rose-700 font-black">⚖️ Đĩa phải nặng hơn!</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── 8. MODE: 3D CUBE (Trạm 8) ── */}
        {activeMode === 'cube_3d' && (
          <div className="w-full max-w-lg space-y-4 text-center">
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
                        const next = [...cubeLayers]
                        next[tier.idx] = Math.max(0, next[tier.idx] - 1)
                        setCubeLayers(next)
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
                        const next = [...cubeLayers]
                        next[tier.idx] = Math.min(6, next[tier.idx] + 1)
                        setCubeLayers(next)
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
              {cubeLayers[2] > 0 && (
                <div className="flex items-center justify-center gap-1.5 animate-in zoom-in-50">
                  {Array.from({ length: cubeLayers[2] }).map((_, i) => (
                    <div key={`vis-t3-${i}`} className="size-10 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 text-white font-black text-xs flex items-center justify-center shadow-clay border-2 border-pink-300">
                      🧊
                    </div>
                  ))}
                </div>
              )}
              {cubeLayers[1] > 0 && (
                <div className="flex items-center justify-center gap-1.5 animate-in zoom-in-50">
                  {Array.from({ length: cubeLayers[1] }).map((_, i) => (
                    <div key={`vis-t2-${i}`} className="size-10 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-500 text-white font-black text-xs flex items-center justify-center shadow-clay border-2 border-purple-300">
                      🧊
                    </div>
                  ))}
                </div>
              )}
              {cubeLayers[0] > 0 && (
                <div className="flex items-center justify-center gap-1.5 animate-in zoom-in-50">
                  {Array.from({ length: cubeLayers[0] }).map((_, i) => (
                    <div key={`vis-t1-${i}`} className="size-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-600 text-white font-black text-xs flex items-center justify-center shadow-clay border-2 border-indigo-300">
                      🧊
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Giant Montessori Toy Calculation Board */}
            <div className="w-full bg-white border-2 border-brand-100 rounded-3xl p-3.5 sm:p-4 text-center shadow-clay space-y-2">
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap select-none my-0.5">
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-indigo-50 border-2 border-indigo-200 text-indigo-900 shadow-clay">
                  <span className="font-display font-black text-xl text-indigo-900">{cubeLayers[0]} (dưới)</span>
                </div>
                <span className="font-black text-xl text-indigo-500">+</span>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-purple-50 border-2 border-purple-200 text-purple-900 shadow-clay">
                  <span className="font-display font-black text-xl text-purple-900">{cubeLayers[1]} (giữa)</span>
                </div>
                <span className="font-black text-xl text-purple-500">+</span>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-pink-50 border-2 border-pink-200 text-pink-900 shadow-clay">
                  <span className="font-display font-black text-xl text-pink-900">{cubeLayers[2]} (trên)</span>
                </div>
                <span className="font-black text-xl text-indigo-500">=</span>
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-brand-500 text-white font-black text-2xl shadow-clay border-2 border-brand-600">
                  <span className="font-display font-black text-2xl text-white">{cubeLayers[0] + cubeLayers[1] + cubeLayers[2]}</span>
                  <span className="text-lg animate-bounce">🧊</span>
                </div>
              </div>
              <div className="font-mono font-bold text-xs text-slate-500">
                Tổng cộng = {cubeLayers[0]} + {cubeLayers[1]} + {cubeLayers[2]} = <span className="text-indigo-700 font-black underline">{cubeLayers[0] + cubeLayers[1] + cubeLayers[2]} khối lập phương</span>
              </div>
            </div>
          </div>
        )}

        {/* ── 9. MODE: COLUMN ADDITION ── */}
        {activeMode === 'column' && (
          <div className="w-full max-w-md flex flex-col items-center space-y-3">
            <div className="w-full bg-slate-50 rounded-3xl border-2 border-indigo-200 p-4 sm:p-5 shadow-clay">
              <div className="flex items-center justify-between text-xs font-black text-slate-600 border-b border-slate-200 pb-2 mb-3">
                <span className="w-24 text-center uppercase tracking-wider text-indigo-700 font-black">Hàng Chục</span>
                <span className="w-24 text-center uppercase tracking-wider text-amber-700 font-black">Hàng Đơn Vị</span>
              </div>

              {/* Carry Indicator */}
              <div className="flex items-center justify-between mb-2">
                <div className="w-24 flex justify-center">
                  {hasCarry ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-xs animate-bounce">
                      +1 (Nhớ)
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-mono font-bold">0</span>
                  )}
                </div>
                <div className="w-24 text-center text-xs font-bold text-slate-500">
                  {hasCarry ? 'Có nhớ 1 ➔' : 'Không nhớ'}
                </div>
              </div>

              {/* Row 1: 4 and [boxOnes] */}
              <div className="flex items-center justify-between font-mono font-black text-2xl sm:text-3xl mb-2">
                <span className="w-24 text-center text-slate-800">4</span>
                <div className="w-24 flex justify-center">
                  <div className="size-11 sm:size-12 rounded-2xl bg-amber-100 border-2 border-amber-400 text-amber-900 flex items-center justify-center font-bold text-xl sm:text-2xl shadow-xs">
                    {boxOnes}
                  </div>
                </div>
              </div>

              {/* Row 2: [boxTens] and 7 with + sign */}
              <div className="flex items-center justify-between font-mono font-black text-2xl sm:text-3xl border-b-2 border-slate-300 pb-2.5 mb-2.5 relative">
                <span className="absolute left-1 top-2 text-indigo-600 font-black text-2xl">+</span>
                <div className="w-24 flex justify-center">
                  <div className="size-11 sm:size-12 rounded-2xl bg-indigo-100 border-2 border-indigo-400 text-indigo-900 flex items-center justify-center font-bold text-xl sm:text-2xl shadow-xs">
                    {boxTens}
                  </div>
                </div>
                <span className="w-24 text-center text-slate-800">7</span>
              </div>

              {/* Result Row: tensSum and onesDigitResult */}
              <div className="flex items-center justify-between font-mono font-black text-2xl sm:text-3xl pt-1">
                <span className={cn('w-24 text-center', tensSum === 8 ? 'text-emerald-600' : 'text-rose-500')}>
                  {tensSum}
                </span>
                <span className={cn('w-24 text-center', onesDigitResult === 5 ? 'text-emerald-600' : 'text-rose-500')}>
                  {onesDigitResult}
                </span>
              </div>
            </div>

            {/* Stepper Controls */}
            <div className="w-full grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex flex-col items-center space-y-1.5 shadow-2xs">
                <span className="font-bold text-amber-800">Chữ số đơn vị (4☐):</span>
                <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-amber-300 shadow-2xs">
                  <button
                    type="button"
                    aria-label="Bớt đơn vị"
                    onClick={() => setBoxOnes((prev) => (prev > 0 ? prev - 1 : 9))}
                    className="size-7 sm:size-8 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-black flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                  >
                    <Minus className="size-3.5 sm:size-4 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center font-display font-black text-sm sm:text-base text-amber-900 select-none">{boxOnes}</span>
                  <button
                    type="button"
                    aria-label="Thêm đơn vị"
                    onClick={() => setBoxOnes((prev) => (prev < 9 ? prev + 1 : 0))}
                    className="size-7 sm:size-8 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-black flex items-center justify-center shadow-xs transition-all active:scale-90 cursor-pointer"
                  >
                    <Plus className="size-3.5 sm:size-4 stroke-[3]" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex flex-col items-center space-y-1.5 shadow-2xs">
                <span className="font-bold text-indigo-800">Chữ số hàng chục (☐7):</span>
                <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-indigo-300 shadow-2xs">
                  <button
                    type="button"
                    aria-label="Bớt hàng chục"
                    onClick={() => setBoxTens((prev) => (prev > 0 ? prev - 1 : 9))}
                    className="size-7 sm:size-8 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-black flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                  >
                    <Minus className="size-3.5 sm:size-4 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center font-display font-black text-sm sm:text-base text-indigo-900 select-none">{boxTens}</span>
                  <button
                    type="button"
                    aria-label="Thêm hàng chục"
                    onClick={() => setBoxTens((prev) => (prev < 9 ? prev + 1 : 0))}
                    className="size-7 sm:size-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black flex items-center justify-center shadow-xs transition-all active:scale-90 cursor-pointer"
                  >
                    <Plus className="size-3.5 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Result Card */}
            <div className={cn('w-full rounded-2xl p-3 text-center text-xs sm:text-sm font-bold transition-all border-2 shadow-xs', isLvl2Correct ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-amber-50 border-amber-300 text-amber-900')}>
              {isLvl2Correct ? (
                <span>🎉 CHÍNH XÁC: 48 + 37 = 85 (8 + 7 = 15 nhớ 1; 4 + 3 + 1 = 8)</span>
              ) : (
                <span>Hãy điều chỉnh để tổng bằng đúng 85 (Hiện tại: {tensSum}{onesDigitResult})</span>
              )}
            </div>
          </div>
        )}

        {/* ── 10. MODE: GAUSS RAINBOW SEQUENCE ── */}
        {activeMode === 'gauss' && (
          <div className="w-full max-w-lg flex flex-col items-center space-y-3">
            <div className="w-full bg-slate-50 rounded-3xl border-2 border-indigo-200 p-3 sm:p-4 shadow-clay">
              <span className="text-[11px] font-black text-indigo-900 uppercase tracking-wider block mb-1 text-center">
                Bí mật của thần đồng Gauss
              </span>
              <svg viewBox="0 0 400 130" className="w-full select-none">
                <defs>
                  {rainbowColors.map((color, idx) => (
                    <linearGradient key={`grad-${idx}`} id={`rainbowGrad-${idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                      <stop offset="100%" stopColor={color} stopOpacity="0.9" />
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
                        strokeWidth="2.5"
                        strokeDasharray={i < gaussActivePairsCount ? 'none' : '3 3'}
                        className="transition-all duration-300"
                      />
                      {i === 0 && (
                        <g>
                          <rect x="180" y="10" width="40" height="18" rx="6" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />
                          <text x="200" y="23" fill="#4338ca" fontSize="11" fontWeight="bold" textAnchor="middle">
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
                      <circle cx={x} cy="108" r="8.5" fill={isOuter ? '#4f46e5' : '#e2e8f0'} stroke={isOuter ? '#4338ca' : '#cbd5e1'} strokeWidth="1" />
                      <text x={x} y="112" fill={isOuter ? '#ffffff' : '#1e293b'} fontSize="9" fontWeight="bold" textAnchor="middle">
                        {num}
                      </text>
                    </g>
                  )
                })}
              </svg>

              {/* Slider to expand pairs */}
              <div className="mt-2 flex items-center justify-between gap-3 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 text-xs shadow-2xs">
                <span className="font-bold text-slate-700">Số cặp ghép nối: {gaussActivePairsCount}/10</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={gaussActivePairsCount}
                  onChange={(e) => setGaussActivePairsCount(parseInt(e.target.value, 10))}
                  className="flex-1 accent-indigo-600 cursor-pointer"
                />
                <span className="font-mono font-black text-indigo-700 text-sm">{gaussActivePairsCount * 21}</span>
              </div>
            </div>

            {/* Quick Result Card */}
            <div className="w-full bg-emerald-50 border-2 border-emerald-300 text-emerald-900 font-bold p-3 rounded-2xl text-center shadow-xs">
              <span className="text-xs text-emerald-800 font-black block mb-0.5">
                Công thức Gauss tổng quát:
              </span>
              <div className="font-mono font-black text-emerald-950 text-sm sm:text-base">
                S = (20 × 21) : 2 = 10 × 21 = <span className="text-emerald-700 font-black underline">210</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER BAR ── */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2.5 border-t border-slate-100 mt-2">
        <span className="flex items-center gap-1.5 text-amber-600 font-bold">
          <Star className="size-3.5 text-amber-500 fill-amber-500" />
          Mô hình Trực Quan Sư Phạm AI Mèo Mee
        </span>
        <span className="font-mono text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold shadow-2xs">
          100% Kid-Friendly Interactive
        </span>
      </div>
    </div>
  )
}
