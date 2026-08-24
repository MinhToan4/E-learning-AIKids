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

// ══════════════════════════════════════════════════════════════════════════════
// 🍎 FLAT SOFT CLAY VECTOR APPLE ILLUSTRATIONS (AI KIDS ART STYLE)
// ══════════════════════════════════════════════════════════════════════════════

export function FlatClayRedApple({
  className = 'size-10 sm:size-12',
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('shrink-0 select-none overflow-visible filter drop-shadow-sm', className)}
      {...props}
    >
      <defs>
        <radialGradient id="redAppleGrad" cx="36%" cy="32%" r="66%">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="40%" stopColor="#f43f5e" />
          <stop offset="80%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#be123c" />
        </radialGradient>
        <linearGradient id="redStemGrad" x1="0" y1="1" x2="0.6" y2="0">
          <stop offset="0%" stopColor="#502409" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <linearGradient id="redLeafGrad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#4d7c0f" />
          <stop offset="60%" stopColor="#84cc16" />
          <stop offset="100%" stopColor="#bef264" />
        </linearGradient>
      </defs>
      {/* Soft Clay Bottom Shadow */}
      <ellipse cx="50" cy="92" rx="30" ry="6" fill="#000000" opacity="0.14" />
      {/* Stem */}
      <path
        d="M 50 32 C 51 22, 57 14, 62 10 C 60 10, 54 18, 47 30 Z"
        fill="url(#redStemGrad)"
        stroke="#3f1a06"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Leaf */}
      <path
        d="M 53 24 C 63 17, 76 21, 79 30 C 72 32, 60 30, 53 24 Z"
        fill="url(#redLeafGrad)"
        stroke="#365314"
        strokeWidth="1.2"
      />
      <path
        d="M 55 24 C 63 24, 71 27, 77 30"
        stroke="#ecfccb"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Apple Body - Plump soft clay shape */}
      <path
        d="M 50 34 C 36 24, 15 28, 14 54 C 13 74, 32 90, 48 90 C 49 90, 50 88, 50 88 C 50 88, 51 90, 52 90 C 68 90, 87 74, 86 54 C 85 28, 64 24, 50 34 Z"
        fill="url(#redAppleGrad)"
        stroke="#9f1239"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Top clay dimple */}
      <path
        d="M 44 33 C 48 37, 52 37, 56 33"
        stroke="#881337"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      {/* Soft Clay Highlight (Curved glossy sheen) */}
      <path
        d="M 27 42 C 24 50, 24 64, 30 72"
        stroke="#ffffff"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />
      <circle cx="28" cy="38" r="3.2" fill="#ffffff" opacity="0.5" />
    </svg>
  )
}

export function FlatClayGreenApple({
  className = 'size-10 sm:size-12',
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('shrink-0 select-none overflow-visible filter drop-shadow-sm', className)}
      {...props}
    >
      <defs>
        <radialGradient id="greenAppleGrad" cx="36%" cy="32%" r="66%">
          <stop offset="0%" stopColor="#bef264" />
          <stop offset="40%" stopColor="#84cc16" />
          <stop offset="80%" stopColor="#65a30d" />
          <stop offset="100%" stopColor="#4d7c0f" />
        </radialGradient>
        <linearGradient id="greenStemGrad" x1="0" y1="1" x2="0.6" y2="0">
          <stop offset="0%" stopColor="#502409" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <linearGradient id="greenLeafGrad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="60%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#86efac" />
        </linearGradient>
      </defs>
      {/* Soft Clay Bottom Shadow */}
      <ellipse cx="50" cy="92" rx="30" ry="6" fill="#000000" opacity="0.14" />
      {/* Stem */}
      <path
        d="M 50 32 C 51 22, 57 14, 62 10 C 60 10, 54 18, 47 30 Z"
        fill="url(#greenStemGrad)"
        stroke="#3f1a06"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Leaf */}
      <path
        d="M 53 24 C 63 17, 76 21, 79 30 C 72 32, 60 30, 53 24 Z"
        fill="url(#greenLeafGrad)"
        stroke="#14532d"
        strokeWidth="1.2"
      />
      <path
        d="M 55 24 C 63 24, 71 27, 77 30"
        stroke="#dcfce7"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Apple Body - Plump soft clay shape */}
      <path
        d="M 50 34 C 36 24, 15 28, 14 54 C 13 74, 32 90, 48 90 C 49 90, 50 88, 50 88 C 50 88, 51 90, 52 90 C 68 90, 87 74, 86 54 C 85 28, 64 24, 50 34 Z"
        fill="url(#greenAppleGrad)"
        stroke="#3f6212"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Top clay dimple */}
      <path
        d="M 44 33 C 48 37, 52 37, 56 33"
        stroke="#365314"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      {/* Soft Clay Highlight (Curved glossy sheen) */}
      <path
        d="M 27 42 C 24 50, 24 64, 30 72"
        stroke="#ffffff"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />
      <circle cx="28" cy="38" r="3.2" fill="#ffffff" opacity="0.5" />
    </svg>
  )
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

// ══════════════════════════════════════════════════════════════════════════════
// 🌳 EXPANSIVE TREE CANOPY APPLE POSITIONS (20 ORGANIC LOCATIONS ON WIDE TREE)
// ══════════════════════════════════════════════════════════════════════════════
const RED_APPLE_POSITIONS = [
  { top: '18%', left: '16%', rot: '-6deg', delay: '0ms' },
  { top: '28%', left: '14%', rot: '4deg', delay: '120ms' },
  { top: '40%', left: '18%', rot: '-8deg', delay: '240ms' },
  { top: '20%', left: '26%', rot: '5deg', delay: '180ms' },
  { top: '34%', left: '25%', rot: '-4deg', delay: '60ms' },
  { top: '46%', left: '27%', rot: '7deg', delay: '300ms' },
  { top: '16%', left: '36%', rot: '-5deg', delay: '150ms' },
  { top: '28%', left: '34%', rot: '6deg', delay: '210ms' },
  { top: '42%', left: '36%', rot: '-3deg', delay: '90ms' },
  { top: '24%', left: '44%', rot: '4deg', delay: '270ms' },
]

const GREEN_APPLE_POSITIONS = [
  { top: '24%', left: '56%', rot: '-4deg', delay: '50ms' },
  { top: '16%', left: '64%', rot: '5deg', delay: '190ms' },
  { top: '28%', left: '66%', rot: '-6deg', delay: '110ms' },
  { top: '42%', left: '64%', rot: '7deg', delay: '260ms' },
  { top: '20%', left: '74%', rot: '-5deg', delay: '80ms' },
  { top: '34%', left: '75%', rot: '6deg', delay: '220ms' },
  { top: '46%', left: '73%', rot: '-7deg', delay: '140ms' },
  { top: '18%', left: '84%', rot: '4deg', delay: '310ms' },
  { top: '28%', left: '86%', rot: '-5deg', delay: '170ms' },
  { top: '40%', left: '82%', rot: '6deg', delay: '250ms' },
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
    backgroundImage: `repeating-linear-gradient(45deg, rgba(217, 119, 6, 0.08) 0px, rgba(217, 119, 6, 0.08) 6px, transparent 6px, transparent 12px), repeating-linear-gradient(-45deg, rgba(217, 119, 6, 0.08) 0px, rgba(217, 119, 6, 0.08) 6px, transparent 6px, transparent 12px)`,
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
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <FlatClayRedApple className="size-7 sm:size-8 shrink-0 animate-bounce" />
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
          2. TÁN CÂY TÁO MẸ 🌳 SOFT CLAY (EXPANSIVE CANOPY DROP ZONE 2 CHIỀU)
      ══════════════════════════════════════════════════════════════════════ */}
      <div
        onDragOver={handleDragOverTree}
        onDragLeave={handleDragLeaveTree}
        onDrop={handleDropOnTree}
        className={cn(
          'relative w-full max-w-4xl h-84 sm:h-96 md:h-[420px] rounded-3xl overflow-hidden bg-gradient-to-b from-sky-100/90 via-sky-50/70 to-mint-50/80 border-2 border-brand-100 shadow-inner flex items-center justify-center p-2 transition-all duration-300',
          isDragOverTree && 'ring-4 ring-emerald-400 bg-emerald-100/60 shadow-lg',
        )}
      >
        {/* Tree Header Counter Badge */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-xs sm:text-sm font-black text-slate-900 bg-white/95 backdrop-blur-xs px-4 py-1.5 rounded-full border-2 border-brand-100 shadow-clay z-20 whitespace-nowrap flex items-center gap-1.5">
          <span>🌳 Cây Táo Mẹ:</span>
          <FlatClayRedApple className="size-4.5 inline-block" />
          <span>{remainingTreeRed} quả đỏ</span>
          <span className="text-slate-300">•</span>
          <FlatClayGreenApple className="size-4.5 inline-block" />
          <span>{remainingTreeGreen} quả xanh</span>
        </div>

        {/* Tree Drop Zone Overlay Indicator when dragged from basket */}
        {isDragOverTree && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 text-emerald-800 text-xs sm:text-sm font-black px-4 py-1.5 rounded-full shadow-clay border-2 border-emerald-300 z-30 animate-pulse flex items-center gap-1.5">
            <span>🌳</span>
            <span>Thả tay để trả táo về tán cây mẹ!</span>
          </div>
        )}

        {/* Tree Mother Soft Clay 2.5D Diorama Image (Wide Screen) */}
        <img
          src={designerAssets.asmoScenes.treeMother}
          alt="Cây Táo Mẹ Soft Clay 2.5D"
          className="absolute inset-0 w-full h-full object-contain object-bottom pointer-events-none drop-shadow-md select-none z-0"
        />

        {/* Tree Interactive Layer: Large Hanging Apples Spread Widely */}
        <div className="relative w-full h-full z-10">
          {/* 🍎 RED APPLES CLUSTER (EXPANSIVE LEFT CANOPY: 14%..44%) */}
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
                aria-label={`Hái quả táo đỏ số ${id + 1}`}
                className={cn(
                  'absolute select-none transition-all duration-200 cursor-grab active:cursor-grabbing',
                  'hover:scale-125 active:scale-95 drop-shadow-md hover:drop-shadow-xl',
                  'flex items-center justify-center p-1 rounded-full',
                  'hover:ring-4 hover:ring-coral-400 hover:bg-white/40 active:scale-90',
                  draggingItem?.source === 'tree' && draggingItem?.type === 'A' && draggingItem?.id === id && 'opacity-70 scale-110',
                )}
              >
                <FlatClayRedApple className="size-10 sm:size-12 pointer-events-none drop-shadow-sm" />
              </button>
            )
          })}

          {/* 🍏 GREEN APPLES CLUSTER (EXPANSIVE RIGHT CANOPY: 56%..86%) */}
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
                aria-label={`Hái quả táo xanh số ${id + 1}`}
                className={cn(
                  'absolute select-none transition-all duration-200 cursor-grab active:cursor-grabbing',
                  'hover:scale-125 active:scale-95 drop-shadow-md hover:drop-shadow-xl',
                  'flex items-center justify-center p-1 rounded-full',
                  'hover:ring-4 hover:ring-mint-400 hover:bg-white/40 active:scale-90',
                  draggingItem?.source === 'tree' && draggingItem?.type === 'B' && draggingItem?.id === id && 'opacity-70 scale-110',
                )}
              >
                <FlatClayGreenApple className="size-10 sm:size-12 pointer-events-none drop-shadow-sm" />
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
          3. HAI CHIẾC GIỎ SOFT CLAY TINH TẾ (MINIMALIST ELEGANT CARDS)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-1">
        {/* 🧺 CHIẾC GIỎ A: TÁO ĐỎ */}
        <div
          onDragOver={(e) => handleDragOverBasket(e, 'A')}
          onDragLeave={() => handleDragLeaveBasket('A')}
          onDrop={(e) => handleDropOnBasket(e, 'A')}
          className={cn(
            'w-full flex flex-col rounded-3xl border-3 shadow-clay transition-all duration-300 relative overflow-hidden select-none',
            isDragOverA
              ? 'ring-4 ring-coral-300 border-coral-400 bg-coral-100/90 shadow-md'
              : 'border-coral-200 bg-gradient-to-b from-coral-50/80 to-amber-50/40',
          )}
        >
          {/* Wicker Weave Texture Layer */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40 rounded-3xl"
            style={wovenTextureStyle}
          />

          {/* MIỆNG GIỎ MÂY TRE ĐAN HIỂN THỊ SỐ LƯỢNG TINH GỌN */}
          <div className="relative z-10 w-full bg-coral-100/90 border-b-2 border-coral-200 px-3.5 sm:px-4 py-2.5 flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <ShoppingBasket className="size-4 text-coral-800 shrink-0" />
              <span className="text-xs sm:text-sm font-black text-coral-900 tracking-tight truncate">
                Giỏ A (Táo Đỏ):
              </span>
              <FlatClayRedApple className="size-4.5 inline-block shrink-0" />
            </div>
            <span className="whitespace-nowrap px-3 py-1 rounded-full font-black text-xs min-w-max flex items-center gap-1 text-coral-900 bg-white/95 border border-coral-300 shadow-2xs shrink-0">
              {applesA} / {maxApplesPerBasket} <FlatClayRedApple className="size-3.5 inline-block" />
            </span>
          </div>

          {/* LÒNG GIỎ CHỨA TÁO KÉO THẢ & CHẠM 2 CHIỀU */}
          <div
            className={cn(
              'relative z-10 w-full min-h-28 sm:min-h-32 p-3 sm:p-4 flex items-center justify-center flex-wrap gap-2 sm:gap-3 transition-colors',
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
                  aria-label={`Trả quả táo đỏ số ${id + 1} về cây`}
                  className={cn(
                    'animate-in zoom-in-50 duration-200 select-none hover:scale-125 active:scale-95 transition-transform cursor-grab active:cursor-grabbing p-0.5 filter drop-shadow-sm',
                    draggingItem?.source === 'basket' && draggingItem?.type === 'A' && draggingItem?.id === id && 'opacity-70 scale-110',
                  )}
                >
                  <FlatClayRedApple className="size-10 sm:size-12 pointer-events-none drop-shadow-sm" />
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

        {/* 🧺 CHIẾC GIỎ B: TÁO XANH */}
        <div
          onDragOver={(e) => handleDragOverBasket(e, 'B')}
          onDragLeave={() => handleDragLeaveBasket('B')}
          onDrop={(e) => handleDropOnBasket(e, 'B')}
          className={cn(
            'w-full flex flex-col rounded-3xl border-3 shadow-clay transition-all duration-300 relative overflow-hidden select-none',
            isDragOverB
              ? 'ring-4 ring-mint-300 border-mint-400 bg-mint-100/90 shadow-md'
              : 'border-mint-200 bg-gradient-to-b from-mint-50/80 to-emerald-50/40',
          )}
        >
          {/* Wicker Weave Texture Layer */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40 rounded-3xl"
            style={wovenTextureStyle}
          />

          {/* MIỆNG GIỎ MÂY TRE ĐAN HIỂN THỊ SỐ LƯỢNG TINH GỌN */}
          <div className="relative z-10 w-full bg-mint-100/90 border-b-2 border-mint-200 px-3.5 sm:px-4 py-2.5 flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <ShoppingBasket className="size-4 text-mint-800 shrink-0" />
              <span className="text-xs sm:text-sm font-black text-mint-900 tracking-tight truncate">
                Giỏ B (Táo Xanh):
              </span>
              <FlatClayGreenApple className="size-4.5 inline-block shrink-0" />
            </div>
            <span className="whitespace-nowrap px-3 py-1 rounded-full font-black text-xs min-w-max flex items-center gap-1 text-mint-900 bg-white/95 border border-mint-300 shadow-2xs shrink-0">
              {applesB} / {maxApplesPerBasket} <FlatClayGreenApple className="size-3.5 inline-block" />
            </span>
          </div>

          {/* LÒNG GIỎ CHỨA TÁO KÉO THẢ & CHẠM 2 CHIỀU */}
          <div
            className={cn(
              'relative z-10 w-full min-h-28 sm:min-h-32 p-3 sm:p-4 flex items-center justify-center flex-wrap gap-2 sm:gap-3 transition-colors',
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
                  aria-label={`Trả quả táo xanh số ${id + 1} về cây`}
                  className={cn(
                    'animate-in zoom-in-50 duration-200 select-none hover:scale-125 active:scale-95 transition-transform cursor-grab active:cursor-grabbing p-0.5 filter drop-shadow-sm',
                    draggingItem?.source === 'basket' && draggingItem?.type === 'B' && draggingItem?.id === id && 'opacity-70 scale-110',
                  )}
                >
                  <FlatClayGreenApple className="size-10 sm:size-12 pointer-events-none drop-shadow-sm" />
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
            <div className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl bg-coral-50 border-2 border-coral-200 text-coral-700 shadow-clay">
              <FlatClayRedApple className="size-7 sm:size-8 shrink-0" />
              <span className="font-display font-black text-2xl sm:text-3xl text-coral-700">
                {applesA}
              </span>
            </div>

            {/* Dấu Cộng Khổng Lồ */}
            <div className="size-10 sm:size-12 rounded-2xl bg-sun-100 text-sun-800 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-clay border-2 border-sun-200">
              +
            </div>

            {/* Khối Giỏ B */}
            <div className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl bg-mint-50 border-2 border-mint-200 text-mint-700 shadow-clay">
              <FlatClayGreenApple className="size-7 sm:size-8 shrink-0" />
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
