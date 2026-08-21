import { useState, useMemo } from 'react'
import { Sparkles, RefreshCw, Star, Minus, Plus } from 'lucide-react'
import { AsmoInteractiveAppleTreeCanvas } from './AsmoInteractiveAppleTreeCanvas'
import { cn } from '@/shared/lib/cn'

export type ArithmeticVisualizerMode =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'make10'
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
    }
  }, [topicId, level, forcedMode])

  // ══════════════════════════════════════════════════════════════════════════
  // 1. MODE: ADDITION (THÊM QUẢ TÁO 🍎 RƠI VÀO GIỎ)
  // ══════════════════════════════════════════════════════════════════════════
  const [applesBasketA, setApplesBasketA] = useState<number>(4)
  const [applesBasketB, setApplesBasketB] = useState<number>(3)

  const totalApples = applesBasketA + applesBasketB

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
  // 2. MODE: SUBTRACTION (NỔ BÓNG BAY 🎈 & BỚT KẸO)
  // ══════════════════════════════════════════════════════════════════════════
  const initialBalloons = [
    { id: 1, color: 'bg-rose-500', emoji: '🎈' },
    { id: 2, color: 'bg-amber-500', emoji: '🎈' },
    { id: 3, color: 'bg-emerald-500', emoji: '🎈' },
    { id: 4, color: 'bg-sky-500', emoji: '🎈' },
    { id: 5, color: 'bg-purple-500', emoji: '🎈' },
    { id: 6, color: 'bg-pink-500', emoji: '🎈' },
    { id: 7, color: 'bg-indigo-500', emoji: '🎈' },
    { id: 8, color: 'bg-teal-500', emoji: '🎈' },
    { id: 9, color: 'bg-orange-500', emoji: '🎈' },
    { id: 10, color: 'bg-lime-500', emoji: '🎈' },
  ]
  const [poppedBalloonIds, setPoppedBalloonIds] = useState<number[]>([1, 2, 3]) // Default 3 popped
  const remainingBalloonsCount = initialBalloons.length - poppedBalloonIds.length

  const handlePopBalloon = (id: number) => {
    if (poppedBalloonIds.includes(id)) {
      setPoppedBalloonIds(poppedBalloonIds.filter((bId) => bId !== id))
    } else {
      setPoppedBalloonIds([...poppedBalloonIds, id])
    }
  }

  const resetBalloons = () => {
    setPoppedBalloonIds([])
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 3. MODE: MULTIPLICATION (XẾP KHAY BÁNH HÀNG × CỘT)
  // ══════════════════════════════════════════════════════════════════════════
  const [multRows, setMultRows] = useState<number>(3)
  const [multCols, setMultCols] = useState<number>(4)
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null)
  const totalCakes = multRows * multCols

  // ══════════════════════════════════════════════════════════════════════════
  // 4. MODE: DIVISION (CHIA ĐỀU 12 KẸO VÀO 3 ĐĨA)
  // ══════════════════════════════════════════════════════════════════════════
  const [totalCandies, setTotalCandies] = useState<number>(12)
  const [platesCount, setPlatesCount] = useState<number>(3)

  const candiesPerPlate = Math.floor(totalCandies / platesCount)
  const remainderCandies = totalCandies % platesCount

  // ══════════════════════════════════════════════════════════════════════════
  // 5. MODE: MAKE-10 (GHÉP CẶP 10 BẮN TIM CHÚC MỪNG)
  // ══════════════════════════════════════════════════════════════════════════
  const initialBubbles = [
    { id: 1, val: 1, gradient: 'bg-gradient-to-br from-rose-400 to-rose-600 text-white' },
    { id: 2, val: 3, gradient: 'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950' },
    { id: 3, val: 5, gradient: 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white' },
    { id: 4, val: 7, gradient: 'bg-gradient-to-br from-sky-400 to-sky-600 text-white' },
    { id: 5, val: 9, gradient: 'bg-gradient-to-br from-purple-400 to-purple-600 text-white' },
  ]
  const [selectedBubbleIds, setSelectedBubbleIds] = useState<number[]>([])
  const [pairedPairs, setPairedPairs] = useState<Array<[number, number]>>([])

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
  // 6. MODE: COLUMN ADDITION WITH CARRY
  // ══════════════════════════════════════════════════════════════════════════
  const [boxOnes, setBoxOnes] = useState<number>(8) // Target: 8 (48 + 37 = 85)
  const [boxTens, setBoxTens] = useState<number>(3) // Target: 3

  const onesSum = boxOnes + 7
  const hasCarry = onesSum >= 10
  const onesDigitResult = onesSum % 10
  const carryValue = hasCarry ? 1 : 0
  const tensSum = 4 + boxTens + carryValue
  const isLvl2Correct = boxOnes === 8 && boxTens === 3 && tensSum === 8 && onesDigitResult === 5

  // ══════════════════════════════════════════════════════════════════════════
  // 7. MODE: GAUSS RAINBOW SEQUENCE
  // ══════════════════════════════════════════════════════════════════════════
  const [gaussActivePairsCount, setGaussActivePairsCount] = useState<number>(10) // 1 to 10
  const gaussNumbers = Array.from({ length: 20 }, (_, i) => i + 1)
  const rainbowColors = [
    '#f43f5e', '#fb923c', '#eab308', '#10b981', '#06b6d4',
    '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f43f5e',
  ]

  return (
    <div className={cn('relative w-full rounded-3xl overflow-hidden bg-white border-2 border-brand-200 shadow-clay p-4 sm:p-6 text-slate-800 flex flex-col justify-between min-h-[380px]', className)}>
      {/* ── TOP NAV & INTERACTIVE MODE SELECTOR ── */}
      <div className="border-b border-slate-200 pb-3.5 mb-3.5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 border border-amber-300/80 shadow-xs">
              <Sparkles className="size-5" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight block">
                Phép Tính Vui Nhộn &amp; Trực Quan Sư Phạm Tiểu Học
              </span>
              <span className="text-xs text-slate-600 font-medium">
                {activeMode === 'addition' && '🍎 Phép Cộng Thần Tốc: Thả táo vào giỏ & Nhảy số sinh động'}
                {activeMode === 'subtraction' && '🎈 Phép Trừ Thông Minh: Bấm nổ bóng bay & Bớt kẹo'}
                {activeMode === 'multiplication' && '🍰 Phép Nhân Sắc Màu: Xếp khay bánh theo hàng & cột'}
                {activeMode === 'division' && '🍽️ Phép Chia Chia Đều: Chia kẹo vào các đĩa xinh xắn'}
                {activeMode === 'make10' && 'Level 1: 🎈 Bí kíp ghép cặp 10 siêu tốc'}
                {activeMode === 'column' && 'Level 2: 🧩 Điền chữ số bí ẩn & Phép cộng có nhớ'}
                {activeMode === 'gauss' && 'Level 3: 🌈 Cầu vồng Gauss & Dãy số cách đều'}
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer border border-slate-200 shadow-2xs active:scale-95"
            >
              <RefreshCw className="size-3.5 text-slate-600" />
              <span>Trả Táo Về Cây</span>
            </button>
          )}

          {activeMode === 'make10' && (
            <button
              type="button"
              onClick={resetLevel1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer border border-slate-200 shadow-2xs active:scale-95"
            >
              <RefreshCw className="size-3.5 text-slate-600" />
              <span>Ghép Lại</span>
            </button>
          )}

          {activeMode === 'subtraction' && (
            <button
              type="button"
              onClick={resetBalloons}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer border border-slate-200 shadow-2xs active:scale-95"
            >
              <RefreshCw className="size-3.5 text-slate-600" />
              <span>Bơm Lại Bóng</span>
            </button>
          )}
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveMode('addition')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border',
              activeMode === 'addition'
                ? 'bg-rose-500 text-white shadow-xs border-rose-600 ring-2 ring-rose-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 shadow-2xs',
            )}
          >
            <span>🍎</span>
            <span>Cộng Táo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('subtraction')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border',
              activeMode === 'subtraction'
                ? 'bg-amber-500 text-white shadow-xs border-amber-600 ring-2 ring-amber-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 shadow-2xs',
            )}
          >
            <span>🎈</span>
            <span>Trừ Bóng Bay</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('multiplication')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border',
              activeMode === 'multiplication'
                ? 'bg-emerald-500 text-white shadow-xs border-emerald-600 ring-2 ring-emerald-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 shadow-2xs',
            )}
          >
            <span>🍰</span>
            <span>Nhân Khay Bánh</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('division')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border',
              activeMode === 'division'
                ? 'bg-sky-500 text-white shadow-xs border-sky-600 ring-2 ring-sky-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 shadow-2xs',
            )}
          >
            <span>🍽️</span>
            <span>Chia Kẹo Đều</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('make10')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border',
              activeMode === 'make10'
                ? 'bg-indigo-600 text-white shadow-xs border-indigo-700 ring-2 ring-indigo-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 shadow-2xs',
            )}
          >
            <span>🔟</span>
            <span>Kết Bạn 10</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('column')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border',
              activeMode === 'column'
                ? 'bg-purple-600 text-white shadow-xs border-purple-700 ring-2 ring-purple-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 shadow-2xs',
            )}
          >
            <span>🧮</span>
            <span>Cột Dọc Có Nhớ</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('gauss')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border',
              activeMode === 'gauss'
                ? 'bg-pink-500 text-white shadow-xs border-pink-600 ring-2 ring-pink-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 shadow-2xs',
            )}
          >
            <span>🌈</span>
            <span>Cầu Vồng Gauss</span>
          </button>
        </div>
      </div>

      {/* ── MAIN INTERACTIVE WORKSPACE ── */}
      <div className="flex-1 flex flex-col items-center justify-center my-2 w-full">
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

        {/* ── 2. MODE: SUBTRACTION (NỔ BÓNG BAY 🎈 & BỚT KẸO) ── */}
        {activeMode === 'subtraction' && (
          <div className="w-full max-w-lg flex flex-col items-center space-y-3.5">
            <div className="text-center w-full">
              <span className="text-xs sm:text-sm font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-2xl inline-block shadow-2xs">
                🐱 Mèo Mee: &quot;Bé hãy bấm vào từng quả bóng bay để làm nổ chúng 💥 và xem phép trừ nhé!&quot;
              </span>
            </div>

            {/* Balloon Sky */}
            <div className="w-full bg-sky-50/80 border-2 border-sky-200 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col items-center space-y-3 sm:space-y-4">
              <div className="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap">
                {initialBalloons.map((b) => {
                  const isPopped = poppedBalloonIds.includes(b.id)
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handlePopBalloon(b.id)}
                      className={cn(
                        'size-14 sm:size-16 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer border-2 border-white shadow-md',
                        isPopped
                          ? 'bg-slate-200 border-slate-300 opacity-40 scale-90'
                          : 'shadow-clay hover:scale-110 active:scale-95 ring-2 ring-white/60',
                        !isPopped && b.color,
                      )}
                    >
                      <span className="text-2xl sm:text-3xl select-none">{isPopped ? '💥' : b.emoji}</span>
                      <span className={cn('text-xs font-black', isPopped ? 'text-slate-600' : 'text-white')}>{b.id}</span>
                    </button>
                  )
                })}
              </div>

              <div className="text-xs sm:text-sm text-slate-700 flex items-center justify-center gap-4 bg-white px-4 py-2 rounded-2xl border border-sky-200 shadow-2xs font-medium">
                <span>Ban đầu: <strong className="text-slate-900 font-bold">10 quả</strong></span>
                <span>Đã nổ: <strong className="text-rose-600 font-bold">{poppedBalloonIds.length} quả 💥</strong></span>
                <span>Còn lại: <strong className="text-emerald-600 font-bold">{remainingBalloonsCount} quả 🎈</strong></span>
              </div>
            </div>

            {/* Quick Result Card */}
            <div className="w-full bg-emerald-50 border-2 border-emerald-300 text-emerald-900 font-bold p-3 rounded-2xl text-center shadow-xs">
              <span className="text-xs text-emerald-800 font-extrabold block mb-1">
                🎈 Phép trừ trực quan thời gian thực:
              </span>
              <div className="font-mono font-black text-emerald-950 text-lg sm:text-xl">
                10 - {poppedBalloonIds.length} = {remainingBalloonsCount} (quả bóng còn bay)
              </div>
            </div>
          </div>
        )}

        {/* ── 3. MODE: MULTIPLICATION (XẾP KHAY BÁNH HÀNG × CỘT) ── */}
        {activeMode === 'multiplication' && (
          <div className="w-full max-w-lg flex flex-col items-center space-y-3.5">
            <div className="text-center w-full">
              <span className="text-xs sm:text-sm font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-2xl inline-block shadow-2xs">
                🐱 Mèo Mee: &quot;Phép nhân là phép cộng các hàng bánh bằng nhau: 3 × 4 = 12 chiếc bánh!&quot;
              </span>
            </div>

            {/* Grid Controls */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-700 font-bold">Số hàng:</span>
                <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-amber-300 shadow-2xs">
                  <button
                    type="button"
                    aria-label="Bớt hàng bánh"
                    disabled={multRows <= 1}
                    onClick={() => setMultRows((r) => (r > 1 ? r - 1 : 1))}
                    className="size-7 sm:size-8 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-black flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="size-3.5 sm:size-4 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center font-display font-black text-sm sm:text-base text-amber-900 select-none">{multRows}</span>
                  <button
                    type="button"
                    aria-label="Thêm hàng bánh"
                    disabled={multRows >= 6}
                    onClick={() => setMultRows((r) => (r < 6 ? r + 1 : 6))}
                    className="size-7 sm:size-8 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-black flex items-center justify-center shadow-xs transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="size-3.5 sm:size-4 stroke-[3]" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-700 font-bold">Số cột:</span>
                <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-emerald-300 shadow-2xs">
                  <button
                    type="button"
                    aria-label="Bớt cột bánh"
                    disabled={multCols <= 1}
                    onClick={() => setMultCols((c) => (c > 1 ? c - 1 : 1))}
                    className="size-7 sm:size-8 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="size-3.5 sm:size-4 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center font-display font-black text-sm sm:text-base text-emerald-900 select-none">{multCols}</span>
                  <button
                    type="button"
                    aria-label="Thêm cột bánh"
                    disabled={multCols >= 6}
                    onClick={() => setMultCols((c) => (c < 6 ? c + 1 : 6))}
                    className="size-7 sm:size-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center justify-center shadow-xs transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="size-3.5 sm:size-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Cake Tray Grid */}
            <div className="bg-amber-50/80 border-2 border-amber-200 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col items-center space-y-2.5">
              <div
                className="grid gap-2 select-none"
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
                          'size-12 sm:size-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl transition-all shadow-xs border cursor-pointer',
                          isRowLit
                            ? 'bg-amber-300 border-amber-400 scale-105 ring-2 ring-amber-400 shadow-md'
                            : 'bg-white border-amber-200 hover:bg-amber-100/60',
                        )}
                      >
                        {r % 2 === 0 ? '🍰' : '🍓'}
                      </button>
                    )
                  }),
                )}
              </div>
              <span className="text-xs font-bold text-amber-900 bg-amber-100/80 px-3 py-1 rounded-xl border border-amber-200">
                {multRows} hàng × {multCols} cột bánh = {totalCakes} chiếc bánh
              </span>
            </div>

            {/* Quick Result Card */}
            <div className="w-full bg-emerald-50 border-2 border-emerald-300 text-emerald-900 font-bold p-3 rounded-2xl text-center shadow-xs">
              <span className="text-xs text-emerald-800 font-extrabold block mb-1">
                🍰 Bảng nhân trực quan:
              </span>
              <div className="font-mono font-black text-emerald-950 text-lg sm:text-xl">
                {multRows} × {multCols} = {totalCakes} chiếc bánh ({Array.from({ length: multRows }).map(() => multCols).join(' + ')})
              </div>
            </div>
          </div>
        )}

        {/* ── 4. MODE: DIVISION (CHIA ĐỀU 12 KẸO VÀO 3 ĐĨA) ── */}
        {activeMode === 'division' && (
          <div className="w-full max-w-lg flex flex-col items-center space-y-3.5">
            <div className="text-center w-full">
              <span className="text-xs sm:text-sm font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-2xl inline-block shadow-2xs">
                🐱 Mèo Mee: &quot;Chia đều 12 cái kẹo vào 3 chiếc đĩa, mỗi bạn nhận được đúng 4 cái kẹo!&quot;
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-700 font-bold">Số kẹo 🍬:</span>
                <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-rose-300 shadow-2xs">
                  <button
                    type="button"
                    aria-label="Bớt kẹo"
                    disabled={totalCandies <= 3}
                    onClick={() => setTotalCandies((c) => (c > 3 ? c - 1 : 3))}
                    className="size-7 sm:size-8 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-black flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="size-3.5 sm:size-4 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center font-display font-black text-sm sm:text-base text-rose-900 select-none">{totalCandies}</span>
                  <button
                    type="button"
                    aria-label="Thêm kẹo"
                    disabled={totalCandies >= 24}
                    onClick={() => setTotalCandies((c) => (c < 24 ? c + 1 : 24))}
                    className="size-7 sm:size-8 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black flex items-center justify-center shadow-xs transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="size-3.5 sm:size-4 stroke-[3]" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-700 font-bold">Số đĩa 🍽️:</span>
                <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-sky-300 shadow-2xs">
                  <button
                    type="button"
                    aria-label="Bớt đĩa"
                    disabled={platesCount <= 2}
                    onClick={() => setPlatesCount((p) => (p > 2 ? p - 1 : 2))}
                    className="size-7 sm:size-8 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 font-black flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="size-3.5 sm:size-4 stroke-[3]" />
                  </button>
                  <span className="w-6 text-center font-display font-black text-sm sm:text-base text-sky-900 select-none">{platesCount}</span>
                  <button
                    type="button"
                    aria-label="Thêm đĩa"
                    disabled={platesCount >= 6}
                    onClick={() => setPlatesCount((p) => (p < 6 ? p + 1 : 6))}
                    className="size-7 sm:size-8 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-black flex items-center justify-center shadow-xs transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="size-3.5 sm:size-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Plates Display */}
            <div className="w-full flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
              {Array.from({ length: platesCount }).map((_, pIdx) => (
                <div
                  key={`plate-${pIdx}`}
                  className="size-24 sm:size-28 rounded-full bg-sky-50 border-2 border-sky-300 shadow-md flex flex-col items-center justify-center p-2 relative transition-all"
                >
                  <span className="text-[10px] sm:text-xs font-black text-sky-800 -mt-1">Đĩa {pIdx + 1}</span>
                  <div className="flex items-center justify-center gap-1 flex-wrap mt-0.5 max-w-[80px]">
                    {Array.from({ length: candiesPerPlate }).map((_, cIdx) => (
                      <span key={`candy-${pIdx}-${cIdx}`} className="text-sm sm:text-base select-none">
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

            {/* Remainder Candies if any */}
            {remainderCandies > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 px-3.5 py-1.5 rounded-2xl text-xs font-bold text-amber-900 shadow-2xs">
                <span>🍬 Kẹo thừa chưa chia đủ (Số dư):</span>
                <span className="font-mono font-black text-amber-700">{remainderCandies} cái</span>
              </div>
            )}

            {/* Quick Result Card */}
            <div className="w-full bg-emerald-50 border-2 border-emerald-300 text-emerald-900 font-bold p-3 rounded-2xl text-center shadow-xs">
              <span className="text-xs text-emerald-800 font-extrabold block mb-1">
                🍽️ Kết quả phép chia chia đều:
              </span>
              <div className="font-mono font-black text-emerald-950 text-lg sm:text-xl">
                {totalCandies} : {platesCount} = {candiesPerPlate} {remainderCandies > 0 ? `(dư ${remainderCandies})` : '(chia hết)'}
              </div>
            </div>
          </div>
        )}

        {/* ── 5. MODE: MAKE-10 PAIR MATCHING (LEVEL 1) ── */}
        {activeMode === 'make10' && (
          <div className="w-full max-w-lg flex flex-col items-center space-y-4">
            <div className="text-center w-full space-y-1.5">
              <span className="text-xs sm:text-sm font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-2xl inline-block shadow-2xs">
                🐱 Mèo Mee: &quot;Bấm chọn 2 quả bóng có tổng bằng 10 để ghép cặp nào!&quot;
              </span>
              <div className="text-base sm:text-xl font-black font-mono tracking-wide text-slate-900 bg-slate-100 px-4 py-1.5 rounded-2xl border border-slate-200 shadow-inner inline-block">
                1 + 3 + 5 + 7 + 9 = ?
              </div>
            </div>

            {/* Giant Colorful Balloons */}
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
                      'relative size-16 sm:size-20 rounded-full flex flex-col items-center justify-center font-black text-2xl sm:text-3xl shadow-clay transition-all duration-300 cursor-pointer border-4 border-white active:scale-95',
                      bubble.gradient,
                      isSelected && 'ring-4 ring-amber-400 scale-110 animate-bounce',
                      isPaired && 'ring-4 ring-emerald-500 scale-95 opacity-80',
                      !isPaired && !isSelected && 'hover:scale-105',
                    )}
                  >
                    <span className="drop-shadow-sm">{bubble.val}</span>
                    <span className="text-[10px] sm:text-xs opacity-90 font-bold -mt-1">🎈</span>
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
            <div className="w-full grid grid-cols-2 gap-2.5 text-xs sm:text-sm">
              <div className={cn('p-3 rounded-2xl border-2 transition-all text-center shadow-2xs', pairedPairs.some(([a, b]) => (a === 1 && b === 5) || (a === 5 && b === 1)) ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600')}>
                <span className="font-extrabold block text-xs">Cặp số (1 + 9)</span>
                <span className="font-mono font-black text-sm sm:text-base">
                  {pairedPairs.some(([a, b]) => (a === 1 && b === 5) || (a === 5 && b === 1)) ? '🌟 = 10 (Đã ghép)' : 'Chưa ghép (1 và 9)'}
                </span>
              </div>
              <div className={cn('p-3 rounded-2xl border-2 transition-all text-center shadow-2xs', pairedPairs.some(([a, b]) => (a === 2 && b === 4) || (a === 4 && b === 2)) ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600')}>
                <span className="font-extrabold block text-xs">Cặp số (3 + 7)</span>
                <span className="font-mono font-black text-sm sm:text-base">
                  {pairedPairs.some(([a, b]) => (a === 2 && b === 4) || (a === 4 && b === 2)) ? '🌟 = 10 (Đã ghép)' : 'Chưa ghép (3 và 7)'}
                </span>
              </div>
            </div>

            {/* Quick Result Card */}
            <div className="w-full bg-emerald-50 border-2 border-emerald-300 text-emerald-900 font-bold p-3 rounded-2xl text-center shadow-xs">
              <span className="text-xs text-emerald-800 font-extrabold block mb-1">
                🌈 Phép tính gộp thông minh:
              </span>
              <div className="font-mono font-black text-emerald-950 text-sm sm:text-base">
                (1 + 9) + (3 + 7) + 5 = 10 + 10 + 5 = 25
              </div>
            </div>
          </div>
        )}

        {/* ── 6. MODE: COLUMN ADDITION (LEVEL 2) ── */}
        {activeMode === 'column' && (
          <div className="w-full max-w-md flex flex-col items-center space-y-3.5">
            <div className="text-center w-full">
              <span className="text-xs sm:text-sm font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-2xl inline-block shadow-2xs">
                🐱 Mèo Mee: &quot;Chọn các chữ số để phép tính 4☐ + ☐7 = 85 chính xác nhé!&quot;
              </span>
            </div>

            {/* Interactive Column Board */}
            <div className="w-full bg-slate-50 rounded-3xl border-2 border-indigo-200 p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-black text-slate-600 border-b border-slate-200 pb-2 mb-3">
                <span className="w-24 text-center uppercase tracking-wider text-indigo-700">Hàng Chục</span>
                <span className="w-24 text-center uppercase tracking-wider text-amber-700">Hàng Đơn Vị</span>
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
            <div className="w-full grid grid-cols-2 gap-3 text-xs sm:text-sm">
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
                    <Plus className="size-3.5 sm:size-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Result Card */}
            <div className={cn('w-full rounded-2xl p-3 text-center text-xs sm:text-sm font-bold transition-all border-2 shadow-xs', isLvl2Correct ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-amber-50 border-amber-300 text-amber-900')}>
              {isLvl2Correct ? (
                <span>🎉 CHÍNH XÁC: 48 + 37 = 85 (8 + 7 = 15 nhớ 1; 4 + 3 + 1 = 8)</span>
              ) : (
                <span>Hãy điều chỉnh để tổng bằng đúng 85 (Hiện tại: {tensSum}{onesDigitResult})</span>
              )}
            </div>
          </div>
        )}

        {/* ── 7. MODE: GAUSS RAINBOW SEQUENCE (LEVEL 3) ── */}
        {activeMode === 'gauss' && (
          <div className="w-full max-w-lg flex flex-col items-center space-y-3.5">
            <div className="text-center w-full">
              <span className="text-xs sm:text-sm font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-2xl inline-block shadow-2xs">
                🐱 Mèo Mee: &quot;Bí mật của thần đồng Gauss: Ghép số đầu với số cuối để tạo thành các cặp có tổng bằng 21!&quot;
              </span>
            </div>

            {/* Rainbow SVG Arcs & Number Cards */}
            <div className="w-full bg-slate-50 rounded-3xl border-2 border-indigo-200 p-3 sm:p-4 shadow-xs">
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
                      {/* Pair Sum Badge on top of the largest visible arc */}
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
              <div className="mt-2.5 flex items-center justify-between gap-3 bg-white px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs shadow-2xs">
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
              <span className="text-xs text-emerald-800 font-extrabold block mb-1">
                🌟 Công thức Gauss tổng quát:
              </span>
              <div className="font-mono font-black text-emerald-950 text-sm sm:text-base">
                S = (20 × 21) : 2 = 10 × 21 = 210
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER BAR ── */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-200 mt-2">
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
