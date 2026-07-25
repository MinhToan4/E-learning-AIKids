import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Brush,
  Circle,
  Download,
  Eraser,
  Pipette,
  PaintBucket,
  RotateCcw,
  RotateCw,
  Sparkles,
  Square,
  Trash2,
  Upload,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { api } from '@/shared/lib/api'
import {
  fetchCreativeDownload,
  generateCreativeImage,
} from '@/shared/lib/creative-api'
import {
  buildArtGenerationPrompt,
  isArtStyleId,
} from '@aikids/domain'
import { ART_STYLES } from '../lib/workshop-types'
import type { WorkshopStep } from '../lib/workshop-types'

type Tool = 'brush' | 'eraser' | 'bucket' | 'eyedropper' | 'rect' | 'circle'

type Props = {
  selectedStyle: string
  onBack: (step: WorkshopStep) => void
  onSaved: (imageUrl: string) => void
}

const PALETTE = [
  '#1e2740', '#ffffff', '#6d5efc', '#3dbfff', '#3ed9a0',
  '#ffc94a', '#ff7b93', '#ff6b35', '#2ecc71', '#e74c3c',
]

const MAX_HISTORY = 30

export function WorkshopCanvas({ selectedStyle, onBack, onSaved }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [tool, setTool] = useState<Tool>('brush')
  const [color, setColor] = useState('#1e2740')
  const [brushSize, setBrushSize] = useState(8)
  const [isDrawing, setIsDrawing] = useState(false)
  const [undoStack, setUndoStack] = useState<ImageData[]>([])
  const [redoStack, setRedoStack] = useState<ImageData[]>([])

  const [aiState, setAiState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [aiUrl, setAiUrl] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const lastPos = useRef({ x: 0, y: 0 })
  const startPos = useRef({ x: 0, y: 0 })
  const backupData = useRef<ImageData | null>(null)

  const styleName = ART_STYLES.find((s) => s.id === selectedStyle)?.label ?? 'M├áu N╞░ß╗¢c'

  // ΓöÇΓöÇ Canvas init ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { width, height } = container.getBoundingClientRect()
    canvas.width = Math.floor(width)
    canvas.height = Math.floor(height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  // ΓöÇΓöÇ Helpers ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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

  // ΓöÇΓöÇ Pointer events ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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
      ctx.lineWidth = 2
      ctx.beginPath()
      if (tool === 'rect') {
        ctx.strokeRect(startPos.current.x, startPos.current.y, x - startPos.current.x, y - startPos.current.y)
      } else {
        const rx = Math.abs(x - startPos.current.x) / 2
        const ry = Math.abs(y - startPos.current.y) / 2
        ctx.ellipse(startPos.current.x + (x - startPos.current.x) / 2, startPos.current.y + (y - startPos.current.y) / 2, rx, ry, 0, 0, Math.PI * 2)
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

  // ΓöÇΓöÇ Flood fill ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  function floodFill(startX: number, startY: number, fillHex: string) {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imgData.data
    const w = canvas.width

    function idx(x: number, y: number) { return (y * w + x) * 4 }
    const si = idx(startX, startY)
    const sr = data[si]!, sg = data[si + 1]!, sb = data[si + 2]!

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
      data[i] = fr; data[i + 1] = fg; data[i + 2] = fb; data[i + 3] = 255
      stack.push({ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 })
    }
    ctx.putImageData(imgData, 0, 0)
  }

  // ΓöÇΓöÇ Upload ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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
        const ratio = Math.max(canvas.width / img.width, canvas.height / img.height)
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

  // ΓöÇΓöÇ AI generate ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const generateAI = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setAiState('loading')
    setAiError(null)
    const imageDataUrl = canvas.toDataURL('image/png')
    try {
      const styleId = isArtStyleId(selectedStyle) ? selectedStyle : 'clay'
      const url = await generateCreativeImage({
        prompt: buildArtGenerationPrompt(styleId),
        imageDataUrl,
      })
      setAiUrl(url)
      setAiState('done')
    } catch (err) {
      setAiState('error')
      setAiError(err instanceof Error ? err.message : 'Lß╗ùi kh├┤ng x├íc ─æß╗ïnh')
    }
  }, [selectedStyle])

  // ΓöÇΓöÇ Save to backpack ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  async function saveToBackpack() {
    if (!aiUrl) return
    setSaving(true)
    try {
      await api('/api/media/promote', {
        method: 'POST',
        body: JSON.stringify({ url: aiUrl, purpose: 'creative_workshop', creativeKind: 'art' }),
      })
      onSaved(aiUrl)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Ch╞░a l╞░u ─æ╞░ß╗úc')
    } finally {
      setSaving(false)
    }
  }

  // ΓöÇΓöÇ Download ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  async function download() {
    if (!aiUrl) return
    try {
      const blobUrl = URL.createObjectURL(await fetchCreativeDownload(aiUrl))
      const anchor = document.createElement('a')
      anchor.href = blobUrl
      anchor.download = `aikid-art-${Date.now()}.jpg`
      anchor.click()
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
    } catch {
      window.open(aiUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // ΓöÇΓöÇ Toolbar items ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const tools = [
    { id: 'brush' as Tool, icon: <Brush size={18} />, label: 'B├║t vß║╜' },
    { id: 'eraser' as Tool, icon: <Eraser size={18} />, label: 'Tß║⌐y' },
    { id: 'bucket' as Tool, icon: <PaintBucket size={18} />, label: 'T├┤ m├áu' },
    { id: 'rect' as Tool, icon: <Square size={18} />, label: 'H├¼nh vu├┤ng' },
    { id: 'circle' as Tool, icon: <Circle size={18} />, label: 'H├¼nh tr├▓n' },
    { id: 'eyedropper' as Tool, icon: <Pipette size={18} />, label: 'H├║t m├áu' },
  ]

  return (
    // overflow:hidden required ΓÇö parent must have known height for h-full to work (CSS spec)
    <div className="flex h-full flex-col overflow-hidden">
      {/* ΓöÇΓöÇ Top header bar ΓöÇΓöÇ */}
      <div className="w-full max-w-[1440px] mx-auto px-1 pt-2 sm:pt-3 shrink-0">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-white px-4 py-2.5 shadow-sm">
          <button
            type="button"
            onClick={() => onBack('style')}
            className="text-xs sm:text-sm font-extrabold text-brand-600 hover:text-brand-700 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
          >
            ΓåÉ Chß╗ìn phong c├ích
          </button>
          <span className="text-xs sm:text-sm font-extrabold text-text">
            Vß║╜ tranh ┬╖ <span className="text-brand-600 font-black">{styleName}</span>
          </span>
        </div>
      </div>

      {/* ΓöÇΓöÇ Main workspace grid: max-w-[1440px] aligned with AppShell layout ΓöÇΓöÇ */}
      <div className="mx-auto flex w-full max-w-[1440px] min-h-0 flex-1 flex-col p-2 sm:p-3">
        <div className="grid min-h-0 flex-1 w-full gap-3 sm:gap-4 lg:grid-cols-2">
        {/* ΓöÇΓöÇ Left: Drawing panel ΓöÇΓöÇ */}
        <div className="ui-card flex min-h-0 flex-col overflow-hidden">
          {/* Compact toolbar ΓÇö single row */}
          <div className="flex items-center gap-2 border-b border-border px-2 py-1.5 flex-wrap">
            {/* Tool buttons */}
            <div className="flex gap-1">
              {tools.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  title={t.label}
                  aria-label={t.label}
                  aria-pressed={tool === t.id}
                  onClick={() => setTool(t.id)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg border transition',
                    tool === t.id
                      ? 'border-brand-500 bg-brand-50 text-brand-600'
                      : 'border-border bg-white text-muted hover:border-brand-300',
                  )}
                >
                  {t.icon}
                </button>
              ))}
            </div>

            {/* History + upload */}
            <div className="flex gap-1">
              <button type="button" onClick={undo} disabled={undoStack.length === 0} aria-label="Ho├án t├íc"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-muted transition hover:border-brand-300 disabled:opacity-40">
                <RotateCcw size={14} />
              </button>
              <button type="button" onClick={redo} disabled={redoStack.length === 0} aria-label="L├ám lß║íi"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-muted transition hover:border-brand-300 disabled:opacity-40">
                <RotateCw size={14} />
              </button>
              <button type="button" onClick={clearCanvas} aria-label="X├│a sß║ích"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-danger transition hover:border-danger">
                <Trash2 size={14} />
              </button>
              <button type="button" onClick={() => fileRef.current?.click()} aria-label="Tß║úi ß║únh l├¬n"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-muted transition hover:border-brand-300">
                <Upload size={14} />
              </button>
            </div>

            {/* Color palette + brush size */}
            <div className="flex items-center gap-1.5 ml-auto">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`M├áu ${c}`}
                  className={cn(
                    'h-5 w-5 rounded-full border-2 transition',
                    color === c ? 'border-text scale-125' : 'border-white hover:scale-110',
                  )}
                  style={{ background: c }}
                />
              ))}
              <label className="relative h-5 w-5 cursor-pointer rounded-full border-2 border-border overflow-hidden" title="Chß╗ìn m├áu kh├íc">
                <span className="block h-full w-full rounded-full" style={{ background: 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)' }} />
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label="Chß╗ìn m├áu t├╣y ├╜" />
              </label>
              <input
                type="range" min={2} max={40} value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-16 accent-brand-500"
                aria-label="K├¡ch th╞░ß╗¢c b├║t"
              />
            </div>
          </div>

          {/* Canvas ΓÇö absolute fill so it always takes all space */}
          <div ref={containerRef} className="relative min-h-0 flex-1">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full touch-none bg-white"
              style={{
                cursor:
                  tool === 'eraser' ? 'cell'
                    : tool === 'eyedropper' ? 'crosshair'
                      : 'default',
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            />
          </div>

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </div>

        {/* ΓöÇΓöÇ Right: AI result panel ΓöÇΓöÇ */}
        <div className="ui-card flex min-h-0 flex-col">
          <div className="flex items-center justify-between border-b border-border p-3">
            <p className="text-sm font-extrabold text-text">AI vß║╜ lß║íi ┬╖ {styleName}</p>
            {aiState === 'done' && (
              <div className="flex gap-2">
                <button type="button" onClick={generateAI} aria-label="L├ám lß║íi ß║únh AI"
                  className="rounded-btn border border-border px-3 py-1.5 text-xs font-bold text-muted hover:border-brand-300">
                  <RotateCcw size={12} className="mr-1 inline" /> L├ám lß║íi
                </button>
                <button type="button" onClick={download} aria-label="Tß║úi ß║únh vß╗ü"
                  className="rounded-btn border border-border px-3 py-1.5 text-xs font-bold text-muted hover:border-brand-300">
                  <Download size={12} className="mr-1 inline" /> Tß║úi vß╗ü
                </button>
              </div>
            )}
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center bg-bg p-4">
            {aiState === 'idle' && (
              <div className="flex flex-col items-center gap-4 text-center">
                <Sparkles size={48} className="text-brand-300" />
                <p className="max-w-[200px] text-sm font-semibold text-muted">
                  Vß║╜ xong rß╗ôi bß║Ñm <strong className="text-brand-600">AI Vß║╜ Lß║íi</strong> ─æß╗â xem ph├⌐p thuß║¡t!
                </p>
                <button type="button" onClick={generateAI}
                  className="ui-btn ui-btn-primary gap-2">
                  <Sparkles size={18} /> AI Vß║╜ Lß║íi
                </button>
              </div>
            )}

            {aiState === 'loading' && (
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500" role="status" aria-label="─Éang tß║ío ß║únh" />
                <p className="font-display text-lg text-brand-600">AI ─æang vß║╜ΓÇª</p>
                <p className="text-xs text-muted">B├⌐ ─æß╗úi ch├║t nh├⌐!</p>
              </div>
            )}

            {aiState === 'error' && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-coral-200 bg-coral-50 p-6 text-center">
                <p className="font-bold text-danger">Ch╞░a vß║╜ ─æ╞░ß╗úc</p>
                <p className="text-sm text-muted">{aiError}</p>
                <button type="button" onClick={generateAI}
                  className="ui-btn ui-btn-secondary text-sm">
                  Thß╗¡ lß║íi
                </button>
              </div>
            )}

            {aiState === 'done' && aiUrl && (
              <div className="flex h-full w-full flex-col gap-3">
                <img
                  src={aiUrl}
                  alt="Tranh AI ─æ├ú vß║╜"
                  className="min-h-0 flex-1 rounded-2xl object-contain"
                />
                <button
                  type="button"
                  onClick={saveToBackpack}
                  disabled={saving}
                  className="ui-btn ui-btn-primary w-full gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                  {saving ? '─Éang l╞░uΓÇª' : 'L╞░u v├áo Ba l├┤'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)
}
