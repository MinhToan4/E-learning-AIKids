import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  Brush,
  CheckCircle2,
  Circle,
  Download,
  Eraser,
  PaintBucket,
  Pipette,
  RotateCcw,
  RotateCw,
  Sparkles,
  Square,
  Trash2,
  Upload,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import {
  fetchCreativeDownload,
  generateCreativeImage,
  saveCreativeArt,
} from '@/shared/lib/creative-api'
import {
  buildArtGenerationPrompt,
  isArtStyleId,
  type ArtStyleId,
} from '@/shared/lib/creation/creative'
import { ConsentGate } from '@/shared/components/ConsentGate'
import { designerAssets } from '@/shared/config/assets'
import {
  AI_STUDIO_IDEA_SUGGESTIONS,
  AI_STUDIO_STYLES,
  type WorkshopStep,
} from '../lib/workshop-types'

type Tool = 'brush' | 'eraser' | 'bucket' | 'eyedropper' | 'rect' | 'circle'

export interface StudioCreationItem {
  id: string
  url: string
  styleName: string
  title: string
  createdAt: number
}

type Props = {
  selectedStyle?: string
  onBack?: (step?: WorkshopStep) => void
  onSaved?: (imageUrl: string) => void
}

const WARM_PASTEL_PALETTE = [
  { name: 'Đen than', hex: '#1E293B' },
  { name: 'Trắng kem', hex: '#FFFFFF' },
  { name: 'Cam Aiki', hex: '#FF7B35' },
  { name: 'Vàng nắng', hex: '#FBBF24' },
  { name: 'Đất nặn', hex: '#D97706' },
  { name: 'Hồng đào pastel', hex: '#FDA4AF' },
  { name: 'Đỏ dâu', hex: '#EF4444' },
  { name: 'Xanh bơ mint', hex: '#34D399' },
  { name: 'Xanh mây pastel', hex: '#38BDF8' },
  { name: 'Tím lavender', hex: '#A78BFA' },
  { name: 'Nâu socola', hex: '#78350F' },
]

const MAX_HISTORY = 30
const STORAGE_KEY_RECENT = 'aikids_studio_recent_creations'

export function formatAiErrorMessage(error: string | null): string {
  if (!error) return 'Đã có lỗi xảy ra khi tạo tranh.'
  const lower = error.toLowerCase()
  if (lower.includes('child-safe') || error.includes('CHILD_CONTENT_UNSAFE')) {
    return 'Ý tưởng của bé có từ ngữ chưa phù hợp với không gian sáng tạo an toàn. Bé hãy thử miêu tả những điều vui tươi, đáng yêu khác nhé!'
  }
  return error
}

export function WorkshopCanvas({
  selectedStyle: propSelectedStyle,
  onBack,
  onSaved,
}: Props) {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Style state: Default is Soft Clay ('clay')
  const [activeStyle, setActiveStyle] = useState<string>(() => {
    return propSelectedStyle && AI_STUDIO_STYLES.some((s) => s.id === propSelectedStyle)
      ? propSelectedStyle
      : 'clay'
  })

  // Idea state
  const [ideaPrompt, setIdeaPrompt] = useState('')

  // Tool state
  const [tool, setTool] = useState<Tool>('brush')
  const [color, setColor] = useState('#FF7B35')
  const [brushSize, setBrushSize] = useState(8)
  const [isDrawing, setIsDrawing] = useState(false)
  const [undoStack, setUndoStack] = useState<ImageData[]>([])
  const [redoStack, setRedoStack] = useState<ImageData[]>([])

  // AI state
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [aiUrl, setAiUrl] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Recent generated images in this session
  const [recentCreations, setRecentCreations] = useState<StudioCreationItem[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(STORAGE_KEY_RECENT)
      return stored ? (JSON.parse(stored) as StudioCreationItem[]) : []
    } catch {
      return []
    }
  })

  const lastPos = useRef({ x: 0, y: 0 })
  const startPos = useRef({ x: 0, y: 0 })
  const backupData = useRef<ImageData | null>(null)

  const currentStyleObj =
    AI_STUDIO_STYLES.find((s) => s.id === activeStyle) || AI_STUDIO_STYLES[0]!

  // ── Canvas init ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { width, height } = container.getBoundingClientRect()
    canvas.width = Math.max(300, Math.floor(width))
    canvas.height = Math.max(300, Math.floor(height))
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  // ── Helpers ──────────────────────────────────────────────────
  function getCtx() {
    return canvasRef.current?.getContext('2d') ?? null
  }

  function saveHistory() {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setUndoStack((prev) => {
      const next = [...prev, data]
      return next.length > MAX_HISTORY ? next.slice(1) : next
    })
    setRedoStack([])
  }

  function restoreImageData(data: ImageData) {
    const ctx = getCtx()
    if (!ctx) return
    ctx.putImageData(data, 0, 0)
  }

  function undo() {
    if (undoStack.length === 0) return
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    const current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setRedoStack((p) => [...p, current])
    const prev = undoStack[undoStack.length - 1]!
    restoreImageData(prev)
    setUndoStack((p) => p.slice(0, -1))
  }

  function redo() {
    if (redoStack.length === 0) return
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    const current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setUndoStack((p) => [...p, current])
    const next = redoStack[redoStack.length - 1]!
    restoreImageData(next)
    setRedoStack((p) => p.slice(0, -1))
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    saveHistory()
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  // ── Pointer events ───────────────────────────────────────────
  function getCoords(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = getCtx()
    const canvas = canvasRef.current
    if (!ctx || !canvas) return
    const { x, y } = getCoords(e)

    if (tool === 'eyedropper') {
      const px = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data
      const hex = `#${px[0]!.toString(16).padStart(2, '0')}${px[1]!.toString(16).padStart(2, '0')}${px[2]!.toString(16).padStart(2, '0')}`
      setColor(hex)
      setTool('brush')
      return
    }

    if (tool === 'bucket') {
      saveHistory()
      floodFill(Math.round(x), Math.round(y), color)
      return
    }

    saveHistory()
    setIsDrawing(true)
    lastPos.current = { x, y }
    startPos.current = { x, y }

    if (tool === 'rect' || tool === 'circle') {
      backupData.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    } else {
      ctx.beginPath()
      ctx.arc(x, y, (tool === 'eraser' ? brushSize * 2 : brushSize) / 2, 0, Math.PI * 2)
      ctx.fillStyle = tool === 'eraser' ? '#ffffff' : color
      ctx.fill()
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing) return
    const ctx = getCtx()
    const canvas = canvasRef.current
    if (!ctx || !canvas) return
    const { x, y } = getCoords(e)

    if (tool === 'rect' || tool === 'circle') {
      if (!backupData.current) return
      ctx.putImageData(backupData.current, 0, 0)
      ctx.strokeStyle = color
      ctx.lineWidth = brushSize
      ctx.beginPath()
      if (tool === 'rect') {
        ctx.strokeRect(startPos.current.x, startPos.current.y, x - startPos.current.x, y - startPos.current.y)
      } else {
        const rx = Math.abs(x - startPos.current.x) / 2
        const ry = Math.abs(y - startPos.current.y) / 2
        ctx.ellipse(
          startPos.current.x + (x - startPos.current.x) / 2,
          startPos.current.y + (y - startPos.current.y) / 2,
          rx,
          ry,
          0,
          0,
          Math.PI * 2,
        )
        ctx.stroke()
      }
      return
    }

    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(x, y)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = tool === 'eraser' ? brushSize * 2 : brushSize
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
    ctx.stroke()
    lastPos.current = { x, y }
  }

  function onPointerUp() {
    setIsDrawing(false)
    backupData.current = null
  }

  // ── Flood fill ───────────────────────────────────────────────
  function floodFill(startX: number, startY: number, fillHex: string) {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imgData.data
    const w = canvas.width

    function idx(x: number, y: number) {
      return (y * w + x) * 4
    }
    const si = idx(startX, startY)
    const sr = data[si]!
    const sg = data[si + 1]!
    const sb = data[si + 2]!

    const fr = parseInt(fillHex.slice(1, 3), 16)
    const fg = parseInt(fillHex.slice(3, 5), 16)
    const fb = parseInt(fillHex.slice(5, 7), 16)

    if (sr === fr && sg === fg && sb === fb) return

    const stack = [{ x: startX, y: startY }]
    while (stack.length) {
      const { x, y } = stack.pop()!
      if (x < 0 || x >= w || y < 0 || y >= canvas.height) continue
      const i = idx(x, y)
      if (data[i] !== sr || data[i + 1] !== sg || data[i + 2] !== sb) continue
      data[i] = fr
      data[i + 1] = fg
      data[i + 2] = fb
      data[i + 3] = 255
      stack.push({ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 })
    }
    ctx.putImageData(imgData, 0, 0)
  }

  // ── Upload ───────────────────────────────────────────────────
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    saveHistory()
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const ratio = Math.min(canvas.width / img.width, canvas.height / img.height)
        const sw = img.width * ratio
        const sh = img.height * ratio
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, (canvas.width - sw) / 2, (canvas.height - sh) / 2, sw, sh)
      }
      img.src = ev.target!.result as string
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // ── AI generate ──────────────────────────────────────────────
  const generateAI = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setAiState('loading')
    setAiError(null)
    setSaveSuccess(false)
    const imageDataUrl = canvas.toDataURL('image/png')
    try {
      const styleId = isArtStyleId(activeStyle) ? (activeStyle as ArtStyleId) : 'clay'
      const prompt = buildArtGenerationPrompt(styleId, ideaPrompt)
      const url = await generateCreativeImage({
        prompt,
        imageDataUrl,
        aspectRatio: '4:3',
        modelId: 'NARWHAL',
        provider: 'gflow',
      })
      setAiUrl(url)
      setAiState('done')

      // Record into recent creations list so child can review immediately
      const newCreation: StudioCreationItem = {
        id: `creation-${Date.now()}`,
        url,
        styleName: currentStyleObj.label,
        title: ideaPrompt.trim() || `Tranh ${currentStyleObj.label}`,
        createdAt: Date.now(),
      }
      setRecentCreations((prev) => {
        const next = [newCreation, ...prev.filter((c) => c.url !== url)].slice(0, 10)
        try {
          localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(next))
        } catch {
          // LocalStorage write fail non-blocking
        }
        return next
      })
    } catch (err) {
      setAiState('error')
      setAiError(err instanceof Error ? err.message : 'Lỗi không xác định')
    }
  }, [activeStyle, ideaPrompt, currentStyleObj.label])

  // ── Save to backpack and profile ─────────────────────────────
  async function handleSaveToBackpack() {
    if (!aiUrl) return
    setSaving(true)
    setSaveSuccess(false)
    try {
      const title = ideaPrompt.trim()
        ? `Tranh ${currentStyleObj.label}: ${ideaPrompt.trim()}`
        : `Bức tranh phong cách ${currentStyleObj.label}`

      await saveCreativeArt({
        title,
        url: aiUrl,
        kind: 'art',
        creativeKind: 'art',
      })

      setSaveSuccess(true)
      onSaved?.(aiUrl)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Chưa lưu được tác phẩm')
    } finally {
      setSaving(false)
    }
  }

  // ── Download ─────────────────────────────────────────────────
  async function handleDownload() {
    if (!aiUrl) return
    try {
      const blob = await fetchCreativeDownload(aiUrl)
      const blobUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = blobUrl
      anchor.download = `aikid-art-${Date.now()}.png`
      anchor.click()
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
    } catch {
      window.open(aiUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // ── Start new drawing ────────────────────────────────────────
  function handleStartNew() {
    clearCanvas()
    setAiUrl(null)
    setAiState('idle')
    setAiError(null)
    setSaveSuccess(false)
  }

  // ── Toolbar items ────────────────────────────────────────────
  const tools = [
    { id: 'brush' as Tool, icon: <Brush size={16} />, label: 'Bút vẽ' },
    { id: 'eraser' as Tool, icon: <Eraser size={16} />, label: 'Tẩy' },
    { id: 'bucket' as Tool, icon: <PaintBucket size={16} />, label: 'Tô màu' },
    { id: 'rect' as Tool, icon: <Square size={16} />, label: 'Hình vuông' },
    { id: 'circle' as Tool, icon: <Circle size={16} />, label: 'Hình tròn' },
    { id: 'eyedropper' as Tool, icon: <Pipette size={16} />, label: 'Hút màu' },
  ]

  return (
    <div className="flex flex-col gap-4 sm:gap-5 w-full">
      {/* ── 1. KHỐI CHỌN PHONG CÁCH VẼ TRỰC QUAN (TOÀN BỘ 4 CARD HIỂN THỊ ĐẦY ĐỦ 100%) ── */}
      <section
        className="rounded-3xl border-2 border-orange-200/90 bg-gradient-to-r from-orange-50/70 via-amber-50/60 to-yellow-50/70 p-3 sm:p-3.5 shadow-clay flex flex-col gap-2.5"
        aria-label="Chọn phong cách vẽ"
      >
        <div className="flex items-center justify-between px-1">
          <span className="text-xs sm:text-sm font-black text-orange-950 uppercase tracking-wider flex items-center gap-1.5">
            <span>🎨 Chọn phong cách vẽ:</span>
          </span>
          <span className="text-[11px] font-bold text-orange-700 bg-white/90 px-2.5 py-0.5 rounded-full border border-orange-200/80 shadow-2xs">
            Đang chọn: <span className="text-orange-950 font-black">{currentStyleObj.label}</span>
          </span>
        </div>

        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5"
          role="radiogroup"
          aria-label="Danh sách phong cách vẽ"
        >
          {AI_STUDIO_STYLES.map((style) => {
            const isSelected = activeStyle === style.id
            return (
              <button
                key={style.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`Phong cách ${style.label}: ${style.desc}`}
                onClick={() => setActiveStyle(style.id)}
                className={cn(
                  'flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-2xl border-2 transition-all cursor-pointer select-none text-left active:scale-95 relative overflow-hidden',
                  isSelected
                    ? 'border-orange-500 bg-white text-orange-950 font-black shadow-clay ring-2 ring-orange-300 scale-[1.01]'
                    : 'border-orange-200/80 bg-white/80 hover:bg-white text-slate-700 hover:border-orange-300 font-bold shadow-2xs',
                )}
              >
                <img
                  src={style.img}
                  alt={style.label}
                  className="w-8 h-8 rounded-xl object-cover border border-white shadow-2xs shrink-0"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <span
                    className={cn(
                      'text-xs sm:text-sm font-black leading-tight truncate',
                      isSelected ? 'text-orange-950' : 'text-slate-800',
                    )}
                  >
                    {style.label}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 leading-tight truncate">
                    {style.desc}
                  </span>
                </div>
                {isSelected ? (
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-xs shrink-0"
                    aria-hidden="true"
                  />
                ) : (
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-orange-100 shrink-0"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Main Workspace Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* ── CỘT TRÁI: Khung vẽ Canvas & Công cụ (7/12 cols) ── */}
        <section
          className="lg:col-span-7 flex flex-col rounded-3xl border-2 border-orange-200/90 bg-white shadow-clay overflow-hidden"
          aria-label="Khung vẽ Canvas"
        >
          {/* Header thanh công cụ vẽ: Bút, Tẩy, Tô, Hình, Kích thước */}
          <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 border-b border-orange-100 bg-orange-50/30 flex-wrap">
            {/* Nhóm công cụ vẽ */}
            <div className="flex items-center gap-1">
              {tools.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  title={t.label}
                  aria-label={t.label}
                  aria-pressed={tool === t.id}
                  onClick={() => setTool(t.id)}
                  className={cn(
                    'flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border transition-all cursor-pointer select-none active:scale-95',
                    tool === t.id
                      ? 'border-orange-500 bg-orange-500 text-white shadow-soft font-black'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50/50',
                  )}
                >
                  {t.icon}
                </button>
              ))}
            </div>

            {/* Lịch sử vẽ: Hoàn tác, Làm lại, Xóa, Tải ảnh */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={undo}
                disabled={undoStack.length === 0}
                aria-label="Hoàn tác"
                title="Hoàn tác nét vẽ"
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-orange-300 disabled:opacity-40 cursor-pointer active:scale-95"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={redoStack.length === 0}
                aria-label="Làm lại"
                title="Làm lại nét vẽ"
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-orange-300 disabled:opacity-40 cursor-pointer active:scale-95"
              >
                <RotateCw size={15} />
              </button>
              <button
                type="button"
                onClick={clearCanvas}
                aria-label="Xóa tất cả"
                title="Xóa tất cả trên bảng vẽ"
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 cursor-pointer active:scale-95"
              >
                <Trash2 size={15} />
              </button>

              <ConsentGate cap="allowPhoto" mode="inline">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  aria-label="Tải ảnh phác thảo từ máy lên"
                  title="Tải ảnh phác thảo từ máy lên"
                  className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-800 transition hover:bg-amber-100 cursor-pointer active:scale-95"
                >
                  <Upload size={15} />
                </button>
              </ConsentGate>
            </div>

            {/* Kích thước cọ */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[11px] font-extrabold text-slate-500 hidden sm:inline">
                Cọ {brushSize}px
              </span>
              <input
                type="range"
                min={2}
                max={40}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-16 sm:w-20 accent-orange-500 cursor-pointer"
                aria-label="Chọn kích thước nét cọ"
              />
            </div>
          </div>

          {/* 3. Bảng màu Pastel Warm Tone tươi sáng */}
          <div className="flex items-center gap-1.5 p-2 px-3 border-b border-orange-100 bg-white overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 shrink-0 mr-1">
              Màu sắc:
            </span>
            {WARM_PASTEL_PALETTE.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setColor(c.hex)}
                aria-label={`Màu ${c.name}`}
                title={c.name}
                className={cn(
                  'h-6 w-6 rounded-full border-2 transition-transform cursor-pointer shrink-0 shadow-2xs',
                  color === c.hex
                    ? 'border-slate-800 scale-125 ring-2 ring-orange-300'
                    : 'border-white hover:scale-110',
                )}
                style={{ backgroundColor: c.hex }}
              />
            ))}
            <label
              className="relative h-6 w-6 cursor-pointer rounded-full border-2 border-slate-300 overflow-hidden shrink-0 shadow-2xs ml-1"
              title="Chọn màu tự do"
            >
              <span
                className="block h-full w-full rounded-full"
                style={{
                  background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
                }}
              />
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="Chọn màu tùy ý"
              />
            </label>
          </div>

          {/* 4. Khung Canvas vẽ */}
          <div
            ref={containerRef}
            className="relative w-full h-[360px] sm:h-[430px] bg-white cursor-crosshair overflow-hidden touch-none"
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full touch-none"
              style={{
                cursor:
                  tool === 'eraser'
                    ? 'cell'
                    : tool === 'eyedropper'
                      ? 'crosshair'
                      : 'crosshair',
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            />
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </section>

        {/* ── CỘT PHẢI: Ý tưởng, Nút Tạo Tranh Tương Thích & Khung Kết Quả (5/12 cols) ── */}
        <section
          className="lg:col-span-5 flex flex-col gap-4"
          aria-label="Cài đặt tạo tranh AI"
        >
          {/* GỢI Ý Ý TƯỞNG ("Bé muốn vẽ điều gì?") */}
          <div className="rounded-3xl border-2 border-amber-200/90 bg-white p-4 shadow-clay flex flex-col gap-2.5">
            <h2 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>✨ Bé muốn vẽ điều gì?</span>
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                {currentStyleObj.label}
              </span>
            </h2>

            <div className="relative">
              <textarea
                rows={3}
                value={ideaPrompt}
                onChange={(e) => setIdeaPrompt(e.target.value)}
                placeholder="Ví dụ: Mèo Aiki đang phiêu lưu qua dải ngân hà lấp lánh, xung quanh là các vì sao và hành tinh kẹo ngọt đáng yêu..."
                className="w-full px-3.5 py-2.5 pr-9 rounded-2xl border-2 border-amber-200 bg-amber-50/30 text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-inner resize-none min-h-[72px] leading-relaxed"
                aria-label="Ý tưởng tranh của bé"
              />
              {ideaPrompt.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => setIdeaPrompt('')}
                  title="Xóa nhanh ý tưởng"
                  aria-label="Xóa nhanh ý tưởng"
                  className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-amber-200/80 hover:bg-rose-100 hover:text-rose-600 text-slate-600 flex items-center justify-center text-xs font-black transition-all cursor-pointer active:scale-95 shadow-2xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Các chip gợi ý nhanh 1 chạm */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider shrink-0">
                Gợi ý 1 chạm:
              </span>
              {AI_STUDIO_IDEA_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setIdeaPrompt(suggestion)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* NÚT HÀNH ĐỘNG CHÍNH: Tương thích động theo từng phong cách */}
          <button
            type="button"
            onClick={generateAI}
            disabled={aiState === 'loading'}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm sm:text-base shadow-clay hover:scale-[1.01] active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none"
            aria-label={currentStyleObj.buttonActionText}
          >
            <Sparkles className="w-5 h-5 shrink-0" />
            <span>{currentStyleObj.buttonActionText}</span>
          </button>

          {/* KHUNG TRẠNG THÁI & KẾT QUẢ AI */}
          <div className="rounded-3xl border-2 border-orange-200/90 bg-white p-4 shadow-clay flex flex-col gap-3 min-h-[220px] justify-center items-center">
            {/* TRẠNG THÁI IDLE */}
            {aiState === 'idle' && (
              <div className="flex flex-col items-center gap-3 p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center border-2 border-white shadow-soft">
                  <img
                    src={designerAssets.catPoses.guide}
                    alt="Mèo Aiki"
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">
                    Sẵn sàng hô biến bức tranh!
                  </p>
                  <p className="text-xs text-slate-500 font-semibold max-w-xs mt-1">
                    Bé vẽ phác thảo ở khung bên trái rồi bấm nút{' '}
                    <strong className="text-orange-600">“{currentStyleObj.buttonActionText}”</strong> nhé!
                  </p>
                </div>
              </div>
            )}

            {/* TRẠNG THÁI LOADING (Animation Soft Clay vui nhộn) */}
            {aiState === 'loading' && (
              <div className="flex flex-col items-center gap-3.5 p-4 text-center">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <img
                    src={designerAssets.catPoses.guide}
                    alt="Mèo Aiki đang vung cọ vẽ"
                    className="w-16 h-16 object-contain animate-bounce drop-shadow-md"
                  />
                  <div className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
                </div>
                <div>
                  <p className="font-display text-base sm:text-lg font-black text-orange-600">
                    Mèo Aiki đang vung cọ vẽ... Bé chờ xíu nhé!
                  </p>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    Phép thuật AI đang hoàn thiện kiệt tác theo phong cách {currentStyleObj.label}...
                  </p>
                </div>
              </div>
            )}

            {/* TRẠNG THÁI LỖI */}
            {aiState === 'error' && (
              <div className="flex flex-col items-center gap-3 p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xl font-bold border border-rose-200 shadow-2xs">
                  ⚠️
                </div>
                <p className="font-black text-rose-600 text-sm">Chưa vẽ được bức tranh này</p>
                <p className="text-xs text-slate-600 max-w-xs leading-relaxed font-semibold">
                  {formatAiErrorMessage(aiError)}
                </p>
                <button
                  type="button"
                  onClick={generateAI}
                  className="px-4 py-2 rounded-2xl bg-orange-500 text-white font-black text-xs shadow-soft hover:bg-orange-600 cursor-pointer active:scale-95"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* TRẠNG THÁI HOÀN THÀNH (Hiển thị kết quả trong khung tranh Soft Clay) */}
            {aiState === 'done' && aiUrl && (
              <div className="flex flex-col gap-3.5 w-full">
                {/* Khung tranh Soft Clay */}
                <div className="relative rounded-2xl border-4 border-amber-300 bg-amber-50/50 p-2 shadow-clay overflow-hidden group">
                  <img
                    src={aiUrl}
                    alt="Tác phẩm hoàn thành"
                    className="w-full max-h-[360px] object-contain rounded-xl bg-white"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-black text-slate-800 shadow-2xs border border-white">
                    {currentStyleObj.label}
                  </span>
                </div>

                {/* Thông báo đã lưu thành công */}
                {saveSuccess && (
                  <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span className="text-xs font-black">
                        Đã lưu vào Ba Lô &amp; Hồ Sơ thành công! 🎉
                      </span>
                    </div>
                    <Link
                      to="/profile"
                      className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[11px] font-black hover:bg-emerald-700 shadow-2xs shrink-0"
                    >
                      Xem Hồ sơ
                    </Link>
                  </div>
                )}

                {/* Các nút hành động */}
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveToBackpack}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs sm:text-sm shadow-soft active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {saving ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    <span>{saving ? 'Đang lưu vào Ba Lô…' : 'Lưu vào Ba Lô & Hồ Sơ'}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-black text-xs shadow-2xs active:scale-95 transition-all cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Tải ảnh về máy</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleStartNew}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl border-2 border-orange-200 bg-orange-50/80 hover:bg-orange-100 text-orange-800 font-black text-xs shadow-2xs active:scale-95 transition-all cursor-pointer"
                    >
                      <RotateCcw size={14} />
                      <span>Vẽ tranh mới</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── 5. PHẦN LƯU LẠI NHỮNG ẢNH GENERATE ĐỂ XEM LẠI NGAY ("Tranh vừa tạo của bé") ── */}
      {recentCreations.length > 0 && (
        <section
          className="rounded-3xl border-2 border-orange-200/90 bg-white p-4 sm:p-5 shadow-clay flex flex-col gap-3"
          aria-label="Tranh vừa tạo của bé"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>🖼️ Tranh vừa tạo của bé ({recentCreations.length})</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-500">
              Nhấn vào tranh để xem lại to rõ
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {recentCreations.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setAiUrl(item.url)
                  setAiState('done')
                  setSaveSuccess(false)
                }}
                className={cn(
                  'group relative flex flex-col items-center rounded-2xl border-2 p-1.5 transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95',
                  aiUrl === item.url
                    ? 'border-orange-500 bg-orange-50/80 shadow-clay ring-2 ring-orange-300'
                    : 'border-slate-200 bg-slate-50/80 hover:border-orange-300',
                )}
                style={{ width: '110px' }}
              >
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-white border border-slate-100 shadow-2xs mb-1">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] font-black text-slate-800 truncate w-full text-center">
                  {item.title}
                </span>
                <span className="text-[9px] font-bold text-orange-600 truncate w-full text-center">
                  {item.styleName}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
