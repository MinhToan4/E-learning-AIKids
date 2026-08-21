import { useState, useMemo } from 'react'
import { Sparkles, Minus, Plus, RefreshCw, ShoppingBasket } from 'lucide-react'
import { AsmoFormula } from './AsmoFormula'
import { cn } from '@/shared/lib/cn'

export type AppleBasketType = 'A' | 'B'

export type AsmoInteractiveAppleTreeCanvasProps = {
  applesA?: number
  applesB?: number
  maxApplesPerBasket?: number
  onAddApple?: (basket: AppleBasketType) => void
  onSubApple?: (basket: AppleBasketType) => void
  onSetApples?: (basket: AppleBasketType, count: number) => void
  onReset?: () => void
  title?: string
  instruction?: string
  meeQuote?: string
  showFormulaBar?: boolean
  showResetButton?: boolean
  className?: string
}

// Organic pre-defined positions for hanging apples on the tree canopy
const RED_APPLE_POSITIONS = [
  { top: '22%', left: '16%', rot: '-6deg', delay: '0ms' },
  { top: '35%', left: '11%', rot: '8deg', delay: '120ms' },
  { top: '28%', left: '26%', rot: '-4deg', delay: '240ms' },
  { top: '48%', left: '18%', rot: '5deg', delay: '180ms' },
  { top: '16%', left: '32%', rot: '-8deg', delay: '60ms' },
  { top: '38%', left: '34%', rot: '7deg', delay: '300ms' },
  { top: '56%', left: '29%', rot: '-3deg', delay: '150ms' },
  { top: '26%', left: '42%', rot: '6deg', delay: '210ms' },
  { top: '46%', left: '44%', rot: '-5deg', delay: '90ms' },
  { top: '64%', left: '39%', rot: '4deg', delay: '270ms' },
]

const GREEN_APPLE_POSITIONS = [
  { top: '20%', left: '54%', rot: '5deg', delay: '50ms' },
  { top: '34%', left: '58%', rot: '-7deg', delay: '190ms' },
  { top: '18%', left: '68%', rot: '6deg', delay: '110ms' },
  { top: '42%', left: '69%', rot: '-4deg', delay: '260ms' },
  { top: '28%', left: '80%', rot: '8deg', delay: '80ms' },
  { top: '52%', left: '58%', rot: '-6deg', delay: '220ms' },
  { top: '48%', left: '82%', rot: '5deg', delay: '140ms' },
  { top: '62%', left: '72%', rot: '-8deg', delay: '310ms' },
  { top: '38%', left: '49%', rot: '4deg', delay: '170ms' },
  { top: '58%', left: '48%', rot: '-5deg', delay: '250ms' },
]

export function AsmoInteractiveAppleTreeCanvas({
  applesA: controlledA,
  applesB: controlledB,
  maxApplesPerBasket = 10,
  onAddApple,
  onSubApple,
  onSetApples,
  onReset,
  title,
  instruction,
  meeQuote = '🐱 Mèo Mee: Bé hãy chạm vào quả táo trên cây hoặc kéo thả vào giỏ nhé!',
  showFormulaBar = true,
  showResetButton = true,
  className,
}: AsmoInteractiveAppleTreeCanvasProps) {
  // Support both controlled & uncontrolled states
  const [internalA, setInternalA] = useState<number>(4)
  const [internalB, setInternalB] = useState<number>(3)

  const applesA = controlledA !== undefined ? controlledA : internalA
  const applesB = controlledB !== undefined ? controlledB : internalB

  // Interaction visual effects
  const [isDragOverA, setIsDragOverA] = useState<boolean>(false)
  const [isDragOverB, setIsDragOverB] = useState<boolean>(false)
  const [justDroppedA, setJustDroppedA] = useState<boolean>(false)
  const [justDroppedB, setJustDroppedB] = useState<boolean>(false)
  const [draggingType, setDraggingType] = useState<AppleBasketType | null>(null)
  const [sparkleAnim, setSparkleAnim] = useState<{ x: number; y: number; id: number } | null>(null)

  const totalApples = applesA + applesB
  const remainingTreeRed = Math.max(0, maxApplesPerBasket - applesA)
  const remainingTreeGreen = Math.max(0, maxApplesPerBasket - applesB)

  // ── Handlers ──
  const handleAddApple = (basket: AppleBasketType) => {
    if (basket === 'A') {
      if (applesA >= maxApplesPerBasket) return
      if (onAddApple) {
        onAddApple('A')
      } else if (onSetApples) {
        onSetApples('A', applesA + 1)
      } else {
        setInternalA((prev) => Math.min(prev + 1, maxApplesPerBasket))
      }
      triggerDropEffect('A')
    } else {
      if (applesB >= maxApplesPerBasket) return
      if (onAddApple) {
        onAddApple('B')
      } else if (onSetApples) {
        onSetApples('B', applesB + 1)
      } else {
        setInternalB((prev) => Math.min(prev + 1, maxApplesPerBasket))
      }
      triggerDropEffect('B')
    }
  }

  const handleSubApple = (basket: AppleBasketType) => {
    if (basket === 'A') {
      if (applesA <= 0) return
      if (onSubApple) {
        onSubApple('A')
      } else if (onSetApples) {
        onSetApples('A', applesA - 1)
      } else {
        setInternalA((prev) => Math.max(prev - 1, 0))
      }
    } else {
      if (applesB <= 0) return
      if (onSubApple) {
        onSubApple('B')
      } else if (onSetApples) {
        onSetApples('B', applesB - 1)
      } else {
        setInternalB((prev) => Math.max(prev - 1, 0))
      }
    }
  }

  const handleResetAll = () => {
    if (onReset) {
      onReset()
    } else if (onSetApples) {
      onSetApples('A', 0)
      onSetApples('B', 0)
    } else {
      setInternalA(0)
      setInternalB(0)
    }
  }

  const triggerDropEffect = (basket: AppleBasketType) => {
    if (basket === 'A') {
      setJustDroppedA(true)
      setTimeout(() => setJustDroppedA(false), 700)
    } else {
      setJustDroppedB(true)
      setTimeout(() => setJustDroppedB(false), 700)
    }
    setSparkleAnim({ x: basket === 'A' ? 25 : 75, y: 70, id: Date.now() })
    setTimeout(() => setSparkleAnim(null), 900)
  }

  // ── Drag & Drop Handlers ──
  const handleDragStart = (e: React.DragEvent, basketType: AppleBasketType) => {
    e.dataTransfer.setData('text/plain', basketType)
    e.dataTransfer.effectAllowed = 'copyMove'
    setDraggingType(basketType)
  }

  const handleDragEnd = () => {
    setDraggingType(null)
    setIsDragOverA(false)
    setIsDragOverB(false)
  }

  const handleDragOverBasket = (e: React.DragEvent, basket: AppleBasketType) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    if (basket === 'A') {
      setIsDragOverA(true)
      setIsDragOverB(false)
    } else {
      setIsDragOverB(true)
      setIsDragOverA(false)
    }
  }

  const handleDragLeaveBasket = (basket: AppleBasketType) => {
    if (basket === 'A') setIsDragOverA(false)
    if (basket === 'B') setIsDragOverB(false)
  }

  const handleDropOnBasket = (e: React.DragEvent, basket: AppleBasketType) => {
    e.preventDefault()
    setIsDragOverA(false)
    setIsDragOverB(false)
    const draggedBasket = (e.dataTransfer.getData('text/plain') as AppleBasketType) || draggingType
    if (draggedBasket === basket || !draggedBasket) {
      handleAddApple(basket)
    } else {
      // If kid drops red into basket A or green into basket B
      handleAddApple(draggedBasket)
    }
    setDraggingType(null)
  }

  // KaTeX formula string
  const formulaLatex = useMemo(() => {
    return `\\text{Giỏ A } (\\mathbf{${applesA}}) + \\text{Giỏ B } (\\mathbf{${applesB}}) = \\mathbf{${totalApples}}`
  }, [applesA, applesB, totalApples])

  return (
    <div
      className={cn(
        'relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-sky-100/90 via-emerald-50/70 to-amber-50/80 border-2 border-emerald-300 shadow-clay p-4 sm:p-6 text-slate-800 flex flex-col items-center space-y-4 select-none',
        className,
      )}
    >
      {/* ── HEADER / MEE INSTRUCTION BAR ── */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2.5 pb-1 border-b border-emerald-200/60">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xs border border-emerald-600">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-tight">
              {title || 'Vườn Cây Táo Mẹ & Kéo Thả Táo Vào Giỏ'}
            </h3>
            {instruction ? (
              <p className="text-xs text-slate-600 font-semibold">{instruction}</p>
            ) : (
              <span className="text-xs text-emerald-800 font-bold">
                Mô hình trực quan chuẩn sư phạm ASMO Cấp 1
              </span>
            )}
          </div>
        </div>

        {showResetButton && (
          <button
            type="button"
            onClick={handleResetAll}
            title="Đặt lại thao tác (Đưa tất cả táo về lại cây)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-white hover:bg-slate-100 text-slate-700 transition-all cursor-pointer border border-emerald-300 shadow-2xs active:scale-95 shrink-0"
          >
            <RefreshCw className="size-3.5 text-emerald-600" />
            <span>Đặt lại thao tác</span>
          </button>
        )}
      </div>

      {/* MEE PROMPT BANNER */}
      <div className="w-full text-center">
        <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-900 bg-amber-100/90 border border-amber-300/80 px-4 py-1.5 rounded-2xl shadow-2xs">
          <span>{meeQuote}</span>
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          1. TÁN CÂY TÁO MẸ 🌳 SOFT CLAY HOẠT HÌNH
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="relative w-full max-w-xl h-56 sm:h-64 rounded-3xl overflow-hidden bg-gradient-to-b from-sky-200/60 to-emerald-100/80 border-2 border-emerald-200 shadow-inner flex items-center justify-center p-2">
        {/* Floating Clouds & Sky Accents */}
        <div className="absolute top-2 left-6 text-2xl opacity-75 animate-pulse select-none">☁️</div>
        <div className="absolute top-4 right-8 text-xl opacity-70 animate-pulse select-none">☁️</div>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-black text-emerald-800 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full border border-emerald-200 shadow-2xs z-20 whitespace-nowrap">
          🌳 Cây Táo Mẹ: 🍎 {remainingTreeRed} quả đỏ • 🍏 {remainingTreeGreen} quả xanh
        </div>

        {/* Tree Trunk & Branches (Soft Clay SVG Canvas) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          viewBox="0 0 600 260"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="40%" stopColor="#92400e" />
              <stop offset="80%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="canopyGrad1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="canopyGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="60%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            <filter id="softShadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#064e3b" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Grass Meadow Base */}
          <path
            d="M 0,220 Q 150,200 300,225 T 600,215 L 600,260 L 0,260 Z"
            fill="#a7f3d0"
            opacity="0.9"
          />
          <path
            d="M 0,235 Q 200,220 400,240 T 600,230 L 600,260 L 0,260 Z"
            fill="#6ee7b7"
            opacity="0.95"
          />

          {/* Wooden Trunk */}
          <path
            d="M 285,130 C 285,170 260,200 240,260 L 360,260 C 340,200 315,170 315,130 Z"
            fill="url(#trunkGrad)"
            filter="url(#softShadow)"
          />
          {/* Main Branches */}
          <path
            d="M 290,140 Q 230,120 160,110 Q 150,115 160,125 Q 240,135 295,150 Z"
            fill="url(#trunkGrad)"
          />
          <path
            d="M 310,140 Q 370,120 440,110 Q 450,115 440,125 Q 360,135 305,150 Z"
            fill="url(#trunkGrad)"
          />

          {/* Soft Clay Fluffy Canopy Clouds (Behind) */}
          <circle cx="160" cy="110" r="75" fill="url(#canopyGrad1)" filter="url(#softShadow)" />
          <circle cx="440" cy="110" r="75" fill="url(#canopyGrad2)" filter="url(#softShadow)" />
          <circle cx="300" cy="80" r="85" fill="url(#canopyGrad1)" filter="url(#softShadow)" />
          <circle cx="230" cy="95" r="70" fill="url(#canopyGrad2)" />
          <circle cx="370" cy="95" r="70" fill="url(#canopyGrad1)" />
          <circle cx="110" cy="125" r="55" fill="url(#canopyGrad2)" />
          <circle cx="490" cy="125" r="55" fill="url(#canopyGrad1)" />

          {/* Flowers on Meadow */}
          <circle cx="80" cy="245" r="5" fill="#f43f5e" />
          <circle cx="95" cy="250" r="4" fill="#fbbf24" />
          <circle cx="520" cy="246" r="5" fill="#ec4899" />
          <circle cx="505" cy="252" r="4" fill="#fbbf24" />
        </svg>

        {/* Tree Interactive Layer: Hanging Apples */}
        <div className="relative w-full h-full z-10">
          {/* 🍎 RED APPLES CLUSTER (LEFT CANOPY) */}
          {RED_APPLE_POSITIONS.slice(0, remainingTreeRed).map((pos, idx) => (
            <button
              key={`tree-red-apple-${idx}`}
              type="button"
              draggable
              onDragStart={(e) => handleDragStart(e, 'A')}
              onDragEnd={handleDragEnd}
              onClick={() => handleAddApple('A')}
              style={{
                top: pos.top,
                left: pos.left,
                transform: `rotate(${pos.rot})`,
                animationDelay: pos.delay,
              }}
              title="Chạm hoặc kéo vào Giỏ A để hái táo đỏ 🍎"
              className={cn(
                'absolute select-none transition-all duration-200 cursor-grab active:cursor-grabbing',
                'hover:scale-130 active:scale-95 drop-shadow-md hover:drop-shadow-lg',
                'flex items-center justify-center text-2xl sm:text-3xl p-1 rounded-full',
                'hover:ring-2 hover:ring-rose-400 hover:bg-white/40',
                draggingType === 'A' && 'opacity-70',
              )}
            >
              🍎
            </button>
          ))}

          {/* 🍏 GREEN APPLES CLUSTER (RIGHT CANOPY) */}
          {GREEN_APPLE_POSITIONS.slice(0, remainingTreeGreen).map((pos, idx) => (
            <button
              key={`tree-green-apple-${idx}`}
              type="button"
              draggable
              onDragStart={(e) => handleDragStart(e, 'B')}
              onDragEnd={handleDragEnd}
              onClick={() => handleAddApple('B')}
              style={{
                top: pos.top,
                left: pos.left,
                transform: `rotate(${pos.rot})`,
                animationDelay: pos.delay,
              }}
              title="Chạm hoặc kéo vào Giỏ B để hái táo xanh 🍏"
              className={cn(
                'absolute select-none transition-all duration-200 cursor-grab active:cursor-grabbing',
                'hover:scale-130 active:scale-95 drop-shadow-md hover:drop-shadow-lg',
                'flex items-center justify-center text-2xl sm:text-3xl p-1 rounded-full',
                'hover:ring-2 hover:ring-emerald-400 hover:bg-white/40',
                draggingType === 'B' && 'opacity-70',
              )}
            >
              🍏
            </button>
          ))}

          {/* If all apples on tree are picked */}
          {remainingTreeRed === 0 && remainingTreeGreen === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white/95 text-emerald-900 font-black text-xs sm:text-sm px-4 py-2 rounded-2xl shadow-clay border-2 border-emerald-300 animate-bounce">
                🎉 Bé đã hái hết táo trên cây vào 2 chiếc giỏ xinh xắn!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. HAI CHIẾC GIỎ MÂY SOFT CLAY 3D (GIỎ ĐỎ A & GIỎ XANH B)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {/* 🧺 GIỎ A: TÁO ĐỎ 🍎 */}
        <div
          onDragOver={(e) => handleDragOverBasket(e, 'A')}
          onDragLeave={() => handleDragLeaveBasket('A')}
          onDrop={(e) => handleDropOnBasket(e, 'A')}
          className={cn(
            'border-2 border-rose-300 bg-rose-50/90 rounded-3xl p-4 shadow-clay flex flex-col items-center space-y-3 transition-all duration-300 relative',
            isDragOverA && 'ring-4 ring-amber-400 scale-105 bg-rose-100/95 shadow-xl',
            justDroppedA && 'animate-bounce ring-2 ring-rose-400',
          )}
        >
          {/* Header & +/- Buttons */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5">
              <ShoppingBasket className="size-4 text-rose-600 shrink-0" />
              <span className="text-xs sm:text-sm font-black text-rose-900">
                Giỏ A (Táo Đỏ): 🍎
              </span>
            </div>

            <div className="flex items-center gap-1 bg-white/95 p-1 rounded-2xl border-2 border-rose-200 shadow-2xs">
              <button
                type="button"
                aria-label="Bớt táo đỏ giỏ A"
                disabled={applesA <= 0}
                onClick={() => handleSubApple('A')}
                className="size-7 sm:size-8 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-black flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
              >
                <Minus className="size-3.5 sm:size-4 stroke-[3]" />
              </button>
              <span className="w-7 text-center font-display font-black text-sm sm:text-base text-rose-950 select-none">
                {applesA}
              </span>
              <button
                type="button"
                aria-label="Thêm táo đỏ giỏ A"
                disabled={applesA >= maxApplesPerBasket}
                onClick={() => handleAddApple('A')}
                className="size-7 sm:size-8 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black flex items-center justify-center shadow-xs transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
              >
                <Plus className="size-3.5 sm:size-4 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Apples Containment Area */}
          <div
            className={cn(
              'flex items-center justify-center gap-1.5 flex-wrap min-h-20 p-2.5 bg-white/90 border border-rose-200 rounded-2xl w-full shadow-inner transition-colors',
              isDragOverA && 'bg-rose-100/70 border-rose-400',
            )}
          >
            {applesA === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-2 text-rose-400">
                <span className="text-lg">🧺</span>
                <span className="text-[11px] font-bold italic">
                  Chạm hoặc kéo táo đỏ 🍎 vào giỏ A
                </span>
              </div>
            ) : (
              Array.from({ length: applesA }).map((_, i) => (
                <button
                  key={`basket-apple-a-${i}`}
                  type="button"
                  onClick={() => handleSubApple('A')}
                  title="Chạm để bớt táo đỏ về lại cây 🍎"
                  className="text-2xl sm:text-3xl animate-in zoom-in-50 duration-200 select-none hover:scale-125 transition-transform cursor-pointer p-0.5"
                >
                  🍎
                </button>
              ))
            )}
          </div>

          {isDragOverA && (
            <div className="text-[11px] font-extrabold text-rose-700 animate-pulse">
              ✨ Thả tay để cho táo vào Giỏ A!
            </div>
          )}
        </div>

        {/* 🧺 GIỎ B: TÁO XANH 🍏 */}
        <div
          onDragOver={(e) => handleDragOverBasket(e, 'B')}
          onDragLeave={() => handleDragLeaveBasket('B')}
          onDrop={(e) => handleDropOnBasket(e, 'B')}
          className={cn(
            'border-2 border-emerald-300 bg-emerald-50/90 rounded-3xl p-4 shadow-clay flex flex-col items-center space-y-3 transition-all duration-300 relative',
            isDragOverB && 'ring-4 ring-amber-400 scale-105 bg-emerald-100/95 shadow-xl',
            justDroppedB && 'animate-bounce ring-2 ring-emerald-400',
          )}
        >
          {/* Header & +/- Buttons */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5">
              <ShoppingBasket className="size-4 text-emerald-600 shrink-0" />
              <span className="text-xs sm:text-sm font-black text-emerald-900">
                Giỏ B (Táo Xanh): 🍏
              </span>
            </div>

            <div className="flex items-center gap-1 bg-white/95 p-1 rounded-2xl border-2 border-emerald-200 shadow-2xs">
              <button
                type="button"
                aria-label="Bớt táo xanh giỏ B"
                disabled={applesB <= 0}
                onClick={() => handleSubApple('B')}
                className="size-7 sm:size-8 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-black flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
              >
                <Minus className="size-3.5 sm:size-4 stroke-[3]" />
              </button>
              <span className="w-7 text-center font-display font-black text-sm sm:text-base text-emerald-950 select-none">
                {applesB}
              </span>
              <button
                type="button"
                aria-label="Thêm táo xanh giỏ B"
                disabled={applesB >= maxApplesPerBasket}
                onClick={() => handleAddApple('B')}
                className="size-7 sm:size-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center justify-center shadow-xs transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
              >
                <Plus className="size-3.5 sm:size-4 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Apples Containment Area */}
          <div
            className={cn(
              'flex items-center justify-center gap-1.5 flex-wrap min-h-20 p-2.5 bg-white/90 border border-emerald-200 rounded-2xl w-full shadow-inner transition-colors',
              isDragOverB && 'bg-emerald-100/70 border-emerald-400',
            )}
          >
            {applesB === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-2 text-emerald-500">
                <span className="text-lg">🧺</span>
                <span className="text-[11px] font-bold italic">
                  Chạm hoặc kéo táo xanh 🍏 vào giỏ B
                </span>
              </div>
            ) : (
              Array.from({ length: applesB }).map((_, i) => (
                <button
                  key={`basket-apple-b-${i}`}
                  type="button"
                  onClick={() => handleSubApple('B')}
                  title="Chạm để bớt táo xanh về lại cây 🍏"
                  className="text-2xl sm:text-3xl animate-in zoom-in-50 duration-200 select-none hover:scale-125 transition-transform cursor-pointer p-0.5"
                >
                  🍏
                </button>
              ))
            )}
          </div>

          {isDragOverB && (
            <div className="text-[11px] font-extrabold text-emerald-700 animate-pulse">
              ✨ Thả tay để cho táo vào Giỏ B!
            </div>
          )}
        </div>
      </div>

      {/* Sparkle Popup Effect */}
      {sparkleAnim && (
        <div
          className="absolute pointer-events-none text-2xl sm:text-3xl animate-ping z-30"
          style={{ top: `${sparkleAnim.y}%`, left: `${sparkleAnim.x}%` }}
        >
          ✨
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          3. THANH PHÉP TÍNH THỜI GIAN THỰC (KATEX & SUMMARY)
      ══════════════════════════════════════════════════════════════════════ */}
      {showFormulaBar && (
        <div className="w-full bg-white/95 border-2 border-emerald-300 rounded-3xl p-3.5 sm:p-4 text-center shadow-clay space-y-2">
          <div className="flex items-center justify-center gap-1 text-xs font-black uppercase text-emerald-800 tracking-wider">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>🌟 Tổng số táo trong cả 2 giỏ:</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base font-bold text-slate-800">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 font-extrabold shadow-2xs">
              🍎 Giỏ A ({applesA} quả)
            </span>
            <span className="text-lg font-black text-slate-400">+</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-extrabold shadow-2xs">
              🍏 Giỏ B ({applesB} quả)
            </span>
            <span className="text-lg font-black text-slate-400">=</span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-2xl bg-amber-100 border-2 border-amber-400 text-amber-950 font-black text-base sm:text-lg shadow-clay">
              <span>🌟</span>
              <span>{totalApples} quả táo tổng cộng</span>
              <span className="text-xs font-bold text-amber-800">({totalApples} quả táo thơm ngon)</span>
            </span>
          </div>

          {/* KaTeX Standard Display */}
          <div className="pt-1 text-xs sm:text-sm text-emerald-900 font-semibold">
            <AsmoFormula text={`$$${formulaLatex}$$`} />
          </div>
        </div>
      )}
    </div>
  )
}
