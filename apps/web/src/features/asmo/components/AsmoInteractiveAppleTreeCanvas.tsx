import { useState, useEffect } from 'react'
import { Sparkles, RefreshCw, ShoppingBasket, Volume2, ArrowRight, Star } from 'lucide-react'
import { designerAssets } from '@/shared/config/assets'
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
  onNextPhase?: () => void
  title?: string
  instruction?: string
  meeQuote?: string
  showFormulaBar?: boolean
  showResetButton?: boolean
  className?: string
}

export function speakVietnamese(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  try {
    window.speechSynthesis.cancel()
    const cleanText = text
      .replace(/[\$#\*`~_]/g, '')
      .replace(/🍎/g, ' táo đỏ ')
      .replace(/🍏/g, ' táo xanh ')
      .replace(/🧺/g, ' giỏ ')
      .replace(/✨/g, '')
      .replace(/🎉/g, '')
      .trim()
    const utterance = new SpeechSynthesisUtterance(cleanText || text)
    utterance.lang = 'vi-VN'
    utterance.rate = 0.95
    utterance.pitch = 1.15
    window.speechSynthesis.speak(utterance)
  } catch {
    // Ignore speech errors gracefully
  }
}

// Organic pre-defined positions for hanging apples on the 2D flat soft clay mother tree canopy
const RED_APPLE_POSITIONS = [
  { top: '18%', left: '38%', rot: '-4deg', delay: '0ms' },
  { top: '22%', left: '30%', rot: '6deg', delay: '120ms' },
  { top: '30%', left: '25%', rot: '-8deg', delay: '240ms' },
  { top: '38%', left: '28%', rot: '5deg', delay: '180ms' },
  { top: '28%', left: '36%', rot: '-5deg', delay: '60ms' },
  { top: '46%', left: '24%', rot: '7deg', delay: '300ms' },
  { top: '48%', left: '32%', rot: '-3deg', delay: '150ms' },
  { top: '40%', left: '38%', rot: '6deg', delay: '210ms' },
  { top: '48%', left: '40%', rot: '-6deg', delay: '90ms' },
  { top: '22%', left: '44%', rot: '4deg', delay: '270ms' },
]

const GREEN_APPLE_POSITIONS = [
  { top: '18%', left: '58%', rot: '4deg', delay: '50ms' },
  { top: '22%', left: '66%', rot: '-6deg', delay: '190ms' },
  { top: '30%', left: '72%', rot: '8deg', delay: '110ms' },
  { top: '38%', left: '68%', rot: '-5deg', delay: '260ms' },
  { top: '28%', left: '60%', rot: '6deg', delay: '80ms' },
  { top: '46%', left: '72%', rot: '-7deg', delay: '220ms' },
  { top: '48%', left: '64%', rot: '5deg', delay: '140ms' },
  { top: '40%', left: '58%', rot: '-4deg', delay: '310ms' },
  { top: '48%', left: '56%', rot: '5deg', delay: '170ms' },
  { top: '22%', left: '52%', rot: '-5deg', delay: '250ms' },
]

function createInitialAppleIds(count: number, max: number): number[] {
  const clamped = Math.max(0, Math.min(count, max))
  return Array.from({ length: clamped }, (_, i) => i)
}

export function AsmoInteractiveAppleTreeCanvas({
  applesA: controlledA,
  applesB: controlledB,
  maxApplesPerBasket = 10,
  onAddApple,
  onSubApple,
  onSetApples,
  onReset,
  onNextPhase,
  title,
  instruction,
  meeQuote,
  showFormulaBar = true,
  showResetButton = true,
  className,
}: AsmoInteractiveAppleTreeCanvasProps) {
  // Unique item identity tracking (ID 0..9 per basket type)
  const initialCountA = controlledA !== undefined ? controlledA : 4
  const initialCountB = controlledB !== undefined ? controlledB : 3

  const [basketRedAppleIds, setBasketRedAppleIds] = useState<number[]>(() =>
    createInitialAppleIds(initialCountA, maxApplesPerBasket),
  )
  const [basketGreenAppleIds, setBasketGreenAppleIds] = useState<number[]>(() =>
    createInitialAppleIds(initialCountB, maxApplesPerBasket),
  )

  // Synchronize when controlled props change from parent
  useEffect(() => {
    if (controlledA !== undefined) {
      setBasketRedAppleIds((prev) => {
        const targetCount = Math.max(0, Math.min(controlledA, maxApplesPerBasket))
        if (prev.length === targetCount) return prev
        if (targetCount === 0) return []
        if (targetCount < prev.length) {
          return prev.slice(0, targetCount)
        }
        const available: number[] = []
        for (let i = 0; i < maxApplesPerBasket; i++) {
          if (!prev.includes(i)) available.push(i)
        }
        const needed = targetCount - prev.length
        return [...prev, ...available.slice(0, needed)]
      })
    }
  }, [controlledA, maxApplesPerBasket])

  useEffect(() => {
    if (controlledB !== undefined) {
      setBasketGreenAppleIds((prev) => {
        const targetCount = Math.max(0, Math.min(controlledB, maxApplesPerBasket))
        if (prev.length === targetCount) return prev
        if (targetCount === 0) return []
        if (targetCount < prev.length) {
          return prev.slice(0, targetCount)
        }
        const available: number[] = []
        for (let i = 0; i < maxApplesPerBasket; i++) {
          if (!prev.includes(i)) available.push(i)
        }
        const needed = targetCount - prev.length
        return [...prev, ...available.slice(0, needed)]
      })
    }
  }, [controlledB, maxApplesPerBasket])

  const applesA = controlledA !== undefined ? controlledA : basketRedAppleIds.length
  const applesB = controlledB !== undefined ? controlledB : basketGreenAppleIds.length

  // Interaction visual effects & Drag-and-Drop state
  const [isDragOverA, setIsDragOverA] = useState<boolean>(false)
  const [isDragOverB, setIsDragOverB] = useState<boolean>(false)
  const [isDragOverTree, setIsDragOverTree] = useState<boolean>(false)
  const [draggingItem, setDraggingItem] = useState<{
    source: 'tree' | 'basket'
    type: AppleBasketType
    id?: number
  } | null>(null)
  const [sparkleAnim, setSparkleAnim] = useState<{ x: number; y: number; id: number } | null>(null)

  const totalApples = applesA + applesB
  const remainingTreeRed = Math.max(0, maxApplesPerBasket - basketRedAppleIds.length)
  const remainingTreeGreen = Math.max(0, maxApplesPerBasket - basketGreenAppleIds.length)

  // ── Feedback Effect Helper ──
  const triggerSparkleEffect = (x: number, y: number) => {
    setSparkleAnim({ x, y, id: Date.now() })
    setTimeout(() => setSparkleAnim(null), 900)
  }

  // ── Item-Based State Mutation Handlers ──
  const handleAddAppleWithId = (basket: AppleBasketType, id: number) => {
    if (basket === 'A') {
      if (basketRedAppleIds.includes(id) || basketRedAppleIds.length >= maxApplesPerBasket) return
      const nextIds = [...basketRedAppleIds, id]
      setBasketRedAppleIds(nextIds)
      if (onAddApple) {
        onAddApple('A')
      } else if (onSetApples) {
        onSetApples('A', nextIds.length)
      }
      triggerSparkleEffect(25, 75)
    } else {
      if (basketGreenAppleIds.includes(id) || basketGreenAppleIds.length >= maxApplesPerBasket) return
      const nextIds = [...basketGreenAppleIds, id]
      setBasketGreenAppleIds(nextIds)
      if (onAddApple) {
        onAddApple('B')
      } else if (onSetApples) {
        onSetApples('B', nextIds.length)
      }
      triggerSparkleEffect(75, 75)
    }
  }

  const handleSubAppleWithId = (basket: AppleBasketType, id: number) => {
    if (basket === 'A') {
      if (!basketRedAppleIds.includes(id)) return
      const nextIds = basketRedAppleIds.filter((item) => item !== id)
      setBasketRedAppleIds(nextIds)
      if (onSubApple) {
        onSubApple('A')
      } else if (onSetApples) {
        onSetApples('A', nextIds.length)
      }
      triggerSparkleEffect(30, 35)
    } else {
      if (!basketGreenAppleIds.includes(id)) return
      const nextIds = basketGreenAppleIds.filter((item) => item !== id)
      setBasketGreenAppleIds(nextIds)
      if (onSubApple) {
        onSubApple('B')
      } else if (onSetApples) {
        onSetApples('B', nextIds.length)
      }
      triggerSparkleEffect(70, 35)
    }
  }

  // Fallback triggers if called without specific ID
  const handleAddApple = (basket: AppleBasketType) => {
    if (basket === 'A') {
      if (basketRedAppleIds.length >= maxApplesPerBasket) return
      let nextId = -1
      for (let i = 0; i < maxApplesPerBasket; i++) {
        if (!basketRedAppleIds.includes(i)) {
          nextId = i
          break
        }
      }
      if (nextId === -1) return
      handleAddAppleWithId('A', nextId)
    } else {
      if (basketGreenAppleIds.length >= maxApplesPerBasket) return
      let nextId = -1
      for (let i = 0; i < maxApplesPerBasket; i++) {
        if (!basketGreenAppleIds.includes(i)) {
          nextId = i
          break
        }
      }
      if (nextId === -1) return
      handleAddAppleWithId('B', nextId)
    }
  }

  const handleSubApple = (basket: AppleBasketType) => {
    if (basket === 'A') {
      if (basketRedAppleIds.length === 0) return
      const lastId = basketRedAppleIds[basketRedAppleIds.length - 1]
      handleSubAppleWithId('A', lastId)
    } else {
      if (basketGreenAppleIds.length === 0) return
      const lastId = basketGreenAppleIds[basketGreenAppleIds.length - 1]
      handleSubAppleWithId('B', lastId)
    }
  }

  const handleResetAll = () => {
    setBasketRedAppleIds([])
    setBasketGreenAppleIds([])
    if (onReset) {
      onReset()
    } else if (onSetApples) {
      onSetApples('A', 0)
      onSetApples('B', 0)
    }
    triggerSparkleEffect(50, 40)
  }

  // ── Drag & Drop Handlers: Tree ➔ Basket (Chiều 1) ──
  const handleTreeAppleDragStart = (e: React.DragEvent, basketType: AppleBasketType, id: number) => {
    e.dataTransfer.setData('source', 'tree')
    e.dataTransfer.setData('appleType', basketType)
    e.dataTransfer.setData('appleId', String(id))
    e.dataTransfer.effectAllowed = 'copyMove'
    setDraggingItem({ source: 'tree', type: basketType, id })
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
    const source = e.dataTransfer.getData('source') || draggingItem?.source
    const appleType = (e.dataTransfer.getData('appleType') as AppleBasketType) || draggingItem?.type
    const rawId = e.dataTransfer.getData('appleId')
    const id = rawId !== '' ? Number(rawId) : draggingItem?.id

    if (source === 'tree') {
      const targetBasket = appleType || basket
      if (typeof id === 'number' && !isNaN(id)) {
        handleAddAppleWithId(targetBasket, id)
      } else {
        handleAddApple(targetBasket)
      }
    }
    setDraggingItem(null)
  }

  // ── Drag & Drop Handlers: Basket ➔ Tree (Chiều 2) ──
  const handleBasketAppleDragStart = (e: React.DragEvent, basketType: AppleBasketType, id: number) => {
    e.dataTransfer.setData('source', 'basket')
    e.dataTransfer.setData('appleType', basketType)
    e.dataTransfer.setData('appleId', String(id))
    e.dataTransfer.effectAllowed = 'move'
    setDraggingItem({ source: 'basket', type: basketType, id })
  }

  const handleDragOverTree = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOverTree(true)
  }

  const handleDragLeaveTree = () => {
    setIsDragOverTree(false)
  }

  const handleDropOnTree = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOverTree(false)
    const source = e.dataTransfer.getData('source') || draggingItem?.source
    const appleType = (e.dataTransfer.getData('appleType') as AppleBasketType) || draggingItem?.type
    const rawId = e.dataTransfer.getData('appleId')
    const id = rawId !== '' ? Number(rawId) : draggingItem?.id

    if (source === 'basket') {
      const targetBasket = appleType || 'A'
      if (typeof id === 'number' && !isNaN(id)) {
        handleSubAppleWithId(targetBasket, id)
      } else {
        handleSubApple(targetBasket)
      }
    }
    setDraggingItem(null)
  }

  const handleDragEnd = () => {
    setDraggingItem(null)
    setIsDragOverA(false)
    setIsDragOverB(false)
    setIsDragOverTree(false)
  }

  // Subtle woven wicker background styling
  const wovenTextureStyle = {
    backgroundImage: `repeating-linear-gradient(45deg, rgba(217, 119, 6, 0.09) 0px, rgba(217, 119, 6, 0.09) 6px, transparent 6px, transparent 12px), repeating-linear-gradient(-45deg, rgba(217, 119, 6, 0.09) 0px, rgba(217, 119, 6, 0.09) 6px, transparent 6px, transparent 12px)`,
  }

  return (
    <div
      className={cn(
        'relative w-full rounded-3xl overflow-hidden bg-white border-2 border-brand-100 shadow-clay p-3 sm:p-5 text-slate-800 flex flex-col items-center space-y-3 sm:space-y-4 select-none',
        className,
      )}
    >
      {/* ══════════════════════════════════════════════════════════════════════
          1. THANH NHIỆM VỤ HOẠT HÌNH TINH GỌN DUY NHẤT (STREAMLINED MISSION BAR)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2.5 px-3.5 sm:px-4 py-2.5 rounded-2xl bg-brand-50/80 border-2 border-brand-100 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-xl sm:text-2xl shrink-0 animate-bounce">🍎</span>
          <div className="min-w-0 flex-1 space-y-0.5">
            {title && !title.includes('Vườn Cây Táo Mẹ: Thao Tác') && title !== instruction && (
              <span className="text-xs font-black text-brand-900 block truncate">
                {title}
              </span>
            )}
            <p className="text-xs sm:text-sm font-black text-slate-800 tracking-tight leading-snug">
              {instruction || title || '🍎 Chạm hoặc kéo táo vào giỏ để gộp thành 10 nhé! 🧺'}
            </p>
            {meeQuote && meeQuote !== instruction && meeQuote !== title && (
              <span className="text-[11px] font-bold text-slate-600 block">
                {meeQuote}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Nút Loa 🔊 Phát Giọng Nói Mèo Mee */}
          <button
            type="button"
            onClick={() =>
              speakVietnamese(
                instruction ||
                  meeQuote ||
                  title ||
                  '🍎 Chạm hoặc kéo táo vào giỏ để gộp thành 10 nhé! 🧺',
              )
            }
            title="Nghe Mèo Mee đọc hướng dẫn"
            aria-label="Phát âm thanh giọng nói"
            className="flex items-center justify-center size-8 sm:size-9 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white shadow-clay transition-all active:scale-90 cursor-pointer"
          >
            <Volume2 className="size-4 stroke-[2.5]" />
          </button>

          {/* Nút Đặt Lại 🔄 */}
          {showResetButton && (
            <button
              type="button"
              onClick={handleResetAll}
              title="Đặt lại thao tác (Đưa tất cả táo về lại cây)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-extrabold bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <RefreshCw className="size-3.5 text-brand-600" />
              <span className="hidden xs:inline">Đặt lại thao tác</span>
              <span className="xs:hidden">Đặt lại</span>
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. TÁN CÂY TÁO MẸ 🌳 SOFT CLAY (DROP ZONE 2 CHIỀU ĐÓN TÁO VỀ)
      ══════════════════════════════════════════════════════════════════════ */}
      <div
        onDragOver={handleDragOverTree}
        onDragLeave={handleDragLeaveTree}
        onDrop={handleDropOnTree}
        className={cn(
          'relative w-full max-w-2xl h-72 sm:h-80 md:h-96 rounded-3xl overflow-hidden bg-gradient-to-b from-sky-100/90 via-sky-50/70 to-mint-50/80 border-2 border-brand-100 shadow-inner flex items-center justify-center p-2 transition-all duration-300',
          isDragOverTree && 'ring-4 ring-emerald-400 bg-emerald-100/60 shadow-lg',
        )}
      >
        {/* Floating Clouds & Sky Accents */}
        <div className="absolute top-2 left-6 text-2xl opacity-80 animate-pulse select-none">☁️</div>
        <div className="absolute top-4 right-8 text-xl opacity-75 animate-pulse select-none">☁️</div>
        <div className="absolute top-10 left-1/4 text-sm opacity-60 select-none">✨</div>
        <div className="absolute top-8 right-1/4 text-sm opacity-60 select-none">✨</div>

        {/* Tree Header Counter Badge */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-xs sm:text-sm font-black text-slate-900 bg-white/95 backdrop-blur-xs px-4 py-1.5 rounded-full border-2 border-brand-100 shadow-clay z-20 whitespace-nowrap">
          🌳 Cây Táo Mẹ: 🍎 {remainingTreeRed} quả đỏ • 🍏 {remainingTreeGreen} quả xanh
        </div>

        {/* Tree Drop Zone Overlay Indicator when dragged from basket */}
        {isDragOverTree && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 text-emerald-800 text-xs sm:text-sm font-black px-4 py-1.5 rounded-full shadow-clay border-2 border-emerald-300 z-30 animate-pulse flex items-center gap-1.5">
            <span>🌳</span>
            <span>Thả tay để trả táo về tán cây mẹ!</span>
          </div>
        )}

        {/* Tree Mother Soft Clay 2.5D Diorama Image */}
        <img
          src={designerAssets.asmoScenes.treeMother}
          alt="Cây Táo Mẹ Soft Clay 2.5D"
          className="absolute inset-0 w-full h-full object-contain object-bottom pointer-events-none drop-shadow-md select-none z-0"
        />

        {/* Tree Interactive Layer: Large Hanging Apples */}
        <div className="relative w-full h-full z-10">
          {/* 🍎 RED APPLES CLUSTER (LEFT CANOPY) */}
          {RED_APPLE_POSITIONS.slice(0, maxApplesPerBasket).map((pos, id) => {
            if (basketRedAppleIds.includes(id)) return null
            return (
              <button
                key={`tree-red-apple-${id}`}
                type="button"
                draggable
                onDragStart={(e) => handleTreeAppleDragStart(e, 'A', id)}
                onDragEnd={handleDragEnd}
                onClick={() => handleAddAppleWithId('A', id)}
                style={{
                  top: pos.top,
                  left: pos.left,
                  transform: `rotate(${pos.rot})`,
                  animationDelay: pos.delay,
                }}
                title="Chạm hoặc kéo vào Giỏ A để hái táo đỏ 🍎"
                className={cn(
                  'absolute select-none transition-all duration-200 cursor-grab active:cursor-grabbing',
                  'hover:scale-130 active:scale-95 drop-shadow-md hover:drop-shadow-xl',
                  'flex items-center justify-center text-3xl sm:text-4xl p-1 rounded-full',
                  'hover:ring-4 hover:ring-coral-400 hover:bg-white/50 active:scale-90',
                  draggingItem?.source === 'tree' && draggingItem?.type === 'A' && draggingItem?.id === id && 'opacity-70 scale-110',
                )}
              >
                🍎
              </button>
            )
          })}

          {/* 🍏 GREEN APPLES CLUSTER (RIGHT CANOPY) */}
          {GREEN_APPLE_POSITIONS.slice(0, maxApplesPerBasket).map((pos, id) => {
            if (basketGreenAppleIds.includes(id)) return null
            return (
              <button
                key={`tree-green-apple-${id}`}
                type="button"
                draggable
                onDragStart={(e) => handleTreeAppleDragStart(e, 'B', id)}
                onDragEnd={handleDragEnd}
                onClick={() => handleAddAppleWithId('B', id)}
                style={{
                  top: pos.top,
                  left: pos.left,
                  transform: `rotate(${pos.rot})`,
                  animationDelay: pos.delay,
                }}
                title="Chạm hoặc kéo vào Giỏ B để hái táo xanh 🍏"
                className={cn(
                  'absolute select-none transition-all duration-200 cursor-grab active:cursor-grabbing',
                  'hover:scale-130 active:scale-95 drop-shadow-md hover:drop-shadow-xl',
                  'flex items-center justify-center text-3xl sm:text-4xl p-1 rounded-full',
                  'hover:ring-4 hover:ring-mint-400 hover:bg-white/50 active:scale-90',
                  draggingItem?.source === 'tree' && draggingItem?.type === 'B' && draggingItem?.id === id && 'opacity-70 scale-110',
                )}
              >
                🍏
              </button>
            )
          })}

          {/* If all apples on tree are picked */}
          {remainingTreeRed === 0 && remainingTreeGreen === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="bg-white/95 text-slate-900 font-black text-xs sm:text-sm px-5 py-2.5 rounded-2xl shadow-clay border-2 border-brand-100 animate-bounce">
                🎉 Bé đã hái hết táo trên cây vào 2 chiếc giỏ xinh xắn!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          3. HAI CHIẾC GIỎ MÂY ĐAN 3D VỮNG CHÃI (STABLE BASKETS - NO BOUNCE / NO PEDESTAL)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-1">
        {/* 🧺 CHIẾC GIỎ MÂY A: TÁO ĐỎ 🍎 (NƠ ĐỎ 🎀) */}
        <div
          onDragOver={(e) => handleDragOverBasket(e, 'A')}
          onDragLeave={() => handleDragLeaveBasket('A')}
          onDrop={(e) => handleDropOnBasket(e, 'A')}
          className="relative flex flex-col items-center select-none"
        >
          {/* QUAI GIỎ MÂY UỐN VÒM VỚI NƠ ĐỎ 🎀 */}
          <div className="relative w-44 sm:w-52 h-14 sm:h-16 flex items-center justify-center -mb-3 z-10 pointer-events-none">
            <svg
              viewBox="0 0 200 80"
              className="w-full h-full drop-shadow-md overflow-visible"
            >
              <defs>
                <linearGradient id="handleGradA" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#b45309" />
                  <stop offset="30%" stopColor="#fbbf24" />
                  <stop offset="70%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#92400e" />
                </linearGradient>
              </defs>
              <path
                d="M 20,80 Q 100,-15 180,80"
                fill="none"
                stroke="url(#handleGradA)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M 20,80 Q 100,-15 180,80"
                fill="none"
                stroke="#78350f"
                strokeWidth="3"
                strokeDasharray="6 6"
                strokeLinecap="round"
              />
            </svg>

            {/* Chiếc Nơ Ruy Băng Đỏ 🎀 ở Đỉnh Quai Giỏ A */}
            <div className="absolute -top-1 sm:-top-2 flex items-center justify-center size-9 sm:size-10 rounded-full bg-coral-500 border-2 border-white shadow-md select-none">
              <span className="text-xl sm:text-2xl -mt-0.5">🎀</span>
            </div>
          </div>

          {/* THÀNH GIỎ MÂY ĐAN 3D VỮNG CHÃI TRÊN MẶT ĐẤT */}
          <div
            className={cn(
              'w-full flex flex-col items-center rounded-t-2xl rounded-b-[2.5rem] border-4 shadow-clay transition-all duration-300 relative overflow-hidden',
              isDragOverA
                ? 'ring-2 ring-coral-300 border-coral-400 bg-coral-100/90 shadow-md'
                : 'border-coral-200/90 bg-gradient-to-b from-coral-50/70 via-amber-50/40 to-orange-50/60',
            )}
          >
            {/* Wicker Weave Texture Layer */}
            <div
              className="absolute inset-0 pointer-events-none opacity-40 rounded-t-2xl rounded-b-[2.5rem]"
              style={wovenTextureStyle}
            />

            {/* MIỆNG GIỎ MÂY TRE ĐAN HIỂN THỊ SỐ LƯỢNG TINH GỌN */}
            <div className="relative z-10 w-full bg-coral-100/90 border-b-2 border-coral-200 px-3.5 sm:px-4 py-2 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <ShoppingBasket className="size-4 text-coral-800 shrink-0" />
                <span className="text-xs sm:text-sm font-black text-coral-900 tracking-tight truncate">
                  Giỏ A (Táo Đỏ): 🍎
                </span>
              </div>
              <span className="whitespace-nowrap px-3 py-1 rounded-full font-black text-xs min-w-max flex items-center gap-1.5 text-coral-900 bg-white/95 border border-coral-300 shadow-2xs shrink-0">
                {applesA} / {maxApplesPerBasket} 🍎
              </span>
            </div>

            {/* LÒNG GIỎ CHỨA TÁO KÉO THẢ & CHẠM 2 CHIỀU */}
            <div
              className={cn(
                'relative z-10 w-full min-h-28 sm:min-h-32 p-3 sm:p-4 flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 transition-colors',
                isDragOverA && 'bg-coral-100/60',
              )}
            >
              {basketRedAppleIds.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-2 text-coral-400 space-y-1">
                  <span className="text-2xl sm:text-3xl opacity-80">🧺</span>
                  <span className="text-xs font-black text-coral-700 italic">
                    Chạm hoặc kéo táo đỏ 🍎 vào giỏ A
                  </span>
                </div>
              ) : (
                basketRedAppleIds.map((id) => (
                  <button
                    key={`basket-apple-a-${id}`}
                    type="button"
                    draggable
                    onDragStart={(e) => handleBasketAppleDragStart(e, 'A', id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleSubAppleWithId('A', id)}
                    title="Chạm hoặc kéo về cây để trả táo đỏ 🍎"
                    className={cn(
                      'text-3xl sm:text-4xl animate-in zoom-in-50 duration-200 select-none hover:scale-125 active:scale-95 transition-transform cursor-grab active:cursor-grabbing p-0.5 filter drop-shadow-sm',
                      draggingItem?.source === 'basket' && draggingItem?.type === 'A' && draggingItem?.id === id && 'opacity-70 scale-110',
                    )}
                  >
                    🍎
                  </button>
                ))
              )}
            </div>

            {/* Dragging Feedback Indicator */}
            {isDragOverA && (
              <div className="relative z-10 w-full text-center pb-2 text-xs font-black text-coral-800 animate-pulse">
                ✨ Thả tay để cho táo đỏ vào Giỏ A!
              </div>
            )}
          </div>
        </div>

        {/* 🧺 CHIẾC GIỎ MÂY B: TÁO XANH 🍏 (NƠ XANH LÁ 🎗️) */}
        <div
          onDragOver={(e) => handleDragOverBasket(e, 'B')}
          onDragLeave={() => handleDragLeaveBasket('B')}
          onDrop={(e) => handleDropOnBasket(e, 'B')}
          className="relative flex flex-col items-center select-none"
        >
          {/* QUAI GIỎ MÂY UỐN VÒM VỚI NƠ XANH LÁ 🎗️ */}
          <div className="relative w-44 sm:w-52 h-14 sm:h-16 flex items-center justify-center -mb-3 z-10 pointer-events-none">
            <svg
              viewBox="0 0 200 80"
              className="w-full h-full drop-shadow-md overflow-visible"
            >
              <defs>
                <linearGradient id="handleGradB" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#b45309" />
                  <stop offset="30%" stopColor="#fbbf24" />
                  <stop offset="70%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#92400e" />
                </linearGradient>
              </defs>
              <path
                d="M 20,80 Q 100,-15 180,80"
                fill="none"
                stroke="url(#handleGradB)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M 20,80 Q 100,-15 180,80"
                fill="none"
                stroke="#78350f"
                strokeWidth="3"
                strokeDasharray="6 6"
                strokeLinecap="round"
              />
            </svg>

            {/* Chiếc Nơ Ruy Băng Xanh Lá 🎗️ ở Đỉnh Quai Giỏ B */}
            <div className="absolute -top-1 sm:-top-2 flex items-center justify-center size-9 sm:size-10 rounded-full bg-mint-600 border-2 border-white shadow-md select-none">
              <span className="text-xl sm:text-2xl -mt-0.5">🎗️</span>
            </div>
          </div>

          {/* THÀNH GIỎ MÂY ĐAN 3D VỮNG CHÃI TRÊN MẶT ĐẤT */}
          <div
            className={cn(
              'w-full flex flex-col items-center rounded-t-2xl rounded-b-[2.5rem] border-4 shadow-clay transition-all duration-300 relative overflow-hidden',
              isDragOverB
                ? 'ring-2 ring-mint-300 border-mint-400 bg-mint-100/90 shadow-md'
                : 'border-mint-200/90 bg-gradient-to-b from-mint-50/70 via-emerald-50/40 to-teal-50/60',
            )}
          >
            {/* Wicker Weave Texture Layer */}
            <div
              className="absolute inset-0 pointer-events-none opacity-40 rounded-t-2xl rounded-b-[2.5rem]"
              style={wovenTextureStyle}
            />

            {/* MIỆNG GIỎ MÂY TRE ĐAN HIỂN THỊ SỐ LƯỢNG TINH GỌN */}
            <div className="relative z-10 w-full bg-mint-100/90 border-b-2 border-mint-200 px-3.5 sm:px-4 py-2 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <ShoppingBasket className="size-4 text-mint-800 shrink-0" />
                <span className="text-xs sm:text-sm font-black text-mint-900 tracking-tight truncate">
                  Giỏ B (Táo Xanh): 🍏
                </span>
              </div>
              <span className="whitespace-nowrap px-3 py-1 rounded-full font-black text-xs min-w-max flex items-center gap-1.5 text-mint-900 bg-white/95 border border-mint-300 shadow-2xs shrink-0">
                {applesB} / {maxApplesPerBasket} 🍏
              </span>
            </div>

            {/* LÒNG GIỎ CHỨA TÁO KÉO THẢ & CHẠM 2 CHIỀU */}
            <div
              className={cn(
                'relative z-10 w-full min-h-28 sm:min-h-32 p-3 sm:p-4 flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 transition-colors',
                isDragOverB && 'bg-mint-100/60',
              )}
            >
              {basketGreenAppleIds.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-2 text-mint-400 space-y-1">
                  <span className="text-2xl sm:text-3xl opacity-80">🧺</span>
                  <span className="text-xs font-black text-mint-700 italic">
                    Chạm hoặc kéo táo xanh 🍏 vào giỏ B
                  </span>
                </div>
              ) : (
                basketGreenAppleIds.map((id) => (
                  <button
                    key={`basket-apple-b-${id}`}
                    type="button"
                    draggable
                    onDragStart={(e) => handleBasketAppleDragStart(e, 'B', id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleSubAppleWithId('B', id)}
                    title="Chạm hoặc kéo về cây để trả táo xanh 🍏"
                    className={cn(
                      'text-3xl sm:text-4xl animate-in zoom-in-50 duration-200 select-none hover:scale-125 active:scale-95 transition-transform cursor-grab active:cursor-grabbing p-0.5 filter drop-shadow-sm',
                      draggingItem?.source === 'basket' && draggingItem?.type === 'B' && draggingItem?.id === id && 'opacity-70 scale-110',
                    )}
                  >
                    🍏
                  </button>
                ))
              )}
            </div>

            {/* Dragging Feedback Indicator */}
            {isDragOverB && (
              <div className="relative z-10 w-full text-center pb-2 text-xs font-black text-mint-800 animate-pulse">
                ✨ Thả tay để cho táo xanh vào Giỏ B!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sparkle Popup Effect */}
      {sparkleAnim && (
        <div
          className="absolute pointer-events-none text-3xl sm:text-4xl animate-ping z-30"
          style={{ top: `${sparkleAnim.y}%`, left: `${sparkleAnim.x}%` }}
        >
          ✨
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          4. BẢNG TÍNH ĐỒ CHƠI MONTESSORI KHỔNG LỒ & HIỆU ỨNG CHÚC MỪNG
      ══════════════════════════════════════════════════════════════════════ */}
      {showFormulaBar && (
        <div className="w-full bg-white border-2 border-brand-100 rounded-3xl p-4 sm:p-5 text-center shadow-clay space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase text-brand-700 tracking-wider">
            <Sparkles className="size-4 text-sun-500 animate-spin" />
            <span>✨ TỔNG SỐ TÁO TRONG CẢ 2 GIỎ:</span>
          </div>

          {/* KHỐI PHÉP TÍNH ĐỒ CHƠI GỖ KHỔNG LỒ (GIANT MONTESSORI WOODEN BLOCKS) */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap select-none my-1">
            {/* Khối Giỏ A */}
            <div className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-2xl bg-coral-50 border-2 border-coral-200 text-coral-700 shadow-clay">
              <span className="text-2xl sm:text-3xl">🍎</span>
              <span className="font-display font-black text-2xl sm:text-3xl text-coral-700">
                {applesA}
              </span>
            </div>

            {/* Dấu Cộng Khổng Lồ */}
            <div className="size-10 sm:size-12 rounded-2xl bg-sun-100 text-sun-800 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-clay border-2 border-sun-200">
              +
            </div>

            {/* Khối Giỏ B */}
            <div className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-2xl bg-mint-50 border-2 border-mint-200 text-mint-700 shadow-clay">
              <span className="text-2xl sm:text-3xl">🍏</span>
              <span className="font-display font-black text-2xl sm:text-3xl text-mint-700">
                {applesB}
              </span>
            </div>

            {/* Dấu Bằng Khổng Lồ */}
            <div className="size-10 sm:size-12 rounded-2xl bg-sun-100 text-sun-800 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-clay border-2 border-sun-200">
              =
            </div>

            {/* Khối Kết Quả Phát Sáng */}
            <div
              className={cn(
                'flex items-center gap-2 px-4 sm:px-5 py-2 rounded-2xl bg-brand-500 text-white font-black text-3xl shadow-clay border-2 border-brand-600 transition-all duration-300',
                totalApples === 10 && 'scale-110 ring-4 ring-brand-300 animate-pulse',
              )}
            >
              <span className="font-display font-black text-3xl sm:text-4xl text-white">
                {totalApples}
              </span>
              <span className="text-2xl animate-bounce">✨</span>
            </div>
          </div>

          {/* Nút Chuyển Bước Tiếp Theo ➔ */}
          {onNextPhase && (
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={onNextPhase}
                className={cn(
                  'group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl font-extrabold text-sm sm:text-base transition-all duration-300 cursor-pointer shadow-clay active:scale-95 bg-brand-500 hover:bg-brand-600 text-white border-2 border-brand-600',
                  totalApples > 0 && 'ring-4 ring-brand-200/80 animate-pop',
                )}
              >
                <Star className="size-4 text-sun-300 fill-sun-300 animate-spin" />
                <span>⭐ Chuyển Bước Tiếp Theo</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
