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

  const styleName = ART_STYLES.find((s) => s.id === selectedStyle)?.label ?? 'Màu Nước'

  // ── Canvas init + ResizeObserver ────────────────────────────
  // willReadFrequently: true avoids repeated getImageData slowness (browser warning)
  // ResizeObserver keeps canvas buffer in sync with CSS layout so getCoords()
  // scale is always correct — prevents cursor/pen offset on window resize.
  //
  // paintedRef: HTML <canvas> starts with width=300 height=150 and uninitialized
  // (transparent = black in JPEG) pixels. We must NOT save those pixels on the first
  // resize tick. Only preserve after we have done our first proper white fill.
  const paintedRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    function initSize() {
      const ctx = canvas!.getContext('2d', { willReadFrequently: true })
      if (!ctx) return
      const { width, height } = container!.getBoundingClientRect()
      const w = Math.floor(width)
      const h = Math.floor(height)
      if (canvas!.width === w && canvas!.height === h) return // already correct
      // Only preserve drawing after the canvas has been properly initialised.
      // On the very first resize tick, canvas.width/height are the browser defaults
      // (300×150) and the pixels are uninitialized transparent → rendered as black
      // in JPEG. Saving and restoring those would stamp a black rect over the white fill.
      const saved = paintedRef.current
        ? ctx.getImageData(0, 0, canvas!.width, canvas!.height)
        : null
      canvas!.width = w
      canvas!.height = h
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
      if (saved) ctx.putImageData(saved, 0, 0)
      paintedRef.current = true // canvas is now properly initialised
    }

    initSize()
    const ro = new ResizeObserver(initSize)
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  // ── Helpers ──────────────────────────────────────────────────
  function getCtx() {
    // Must pass the same options as init so browser reuses the same context
    return canvasRef.current?.getContext('2d', { willReadFrequently: true }) ?? null
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
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    // Scale CSS clientX/Y → canvas buffer coordinates.
    // When the canvas CSS size ≠ buffer size (browser zoom, responsive resize)
    // this ratio corrects the mapping so the pen lands exactly under the cursor.
    const scaleX = canvas.width  / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top)  * scaleY,
    }
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

  // ── Flood fill ───────────────────────────────────────────────
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

  // ── AI generate ──────────────────────────────────────────────
  // Flow: compress canvas → JPEG (stay < 2.5 MB sketch limit) →
  //   POST /api/creative/sketch → receive assetId →
  //   POST /api/creative/create with kind + prompt + assetIds
  const generateAI = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setAiState('loading')
    setAiError(null)

    try {
      // Step 1: Compress to JPEG (quality 0.82 ≈ 300–600 KB for typical canvas)
      // PNG base64 can be 2–5 MB and will hit Fastify's 1 MB body limit (413).
      const sketchDataUrl = canvas.toDataURL('image/jpeg', 0.82)

      // Step 2: Upload sketch — BE stores it and returns assetId
      const sketchRes = await api<{ asset: { id: string; url: string } }>(
        '/api/creative/sketch',
        {
          method: 'POST',
          body: JSON.stringify({
            title: `Phác thảo ${styleName}`,
            sketchDataUrl,
          }),
        },
      )
      const assetId = sketchRes.asset.id

      // Step 3: Ask AI to redraw using the uploaded sketch as reference.
      // AbortSignal.timeout(110_000): Vidtory image generation takes ~60-90s;
      // give 110s so we don't abort before Vidtory completes.
      //
      // NOTE: We do NOT send a free-text `prompt` here — the BE's validateChildText
      // enforces an 80-char child-safety limit on user-typed prompts. Our auto-generated
      // strings easily exceed that. The BE builds the full Vidtory prompt via
      // buildCreativePrompt(kind, title, idea, details) using title + styleId.
      //
      // styleId mapping: BE creative-prompts.ts đã được mở rộng để hỗ trợ đủ 14 phong cách.
      // Mọi style từ FE đều có id tương ứng, không có style nào được để undefined.
      type BEStyleId = 'watercolor' | 'cartoon' | 'crayon' | 'anime' | 'manga' | 'comic' | 'sketch' | '3d' | 'pixel' | 'chibi' | 'clay' | 'fabric' | 'manhwa' | 'semirealistic' | 'paper-cut'
      const BE_STYLE_MAP: Record<string, BEStyleId> = {
        watercolor:    'watercolor',
        cartoon:       'cartoon',
        crayon:        'crayon',
        anime:         'anime',
        manga:         'manga',
        comic:         'comic',
        sketch:        'sketch',
        '3d':          '3d',
        pixel:         'pixel',
        chibi:         'chibi',
        clay:          'clay',
        fabric:        'fabric',
        manhwa:        'manhwa',
        semirealistic: 'semirealistic',
        'paper-cut':   'paper-cut',
      }
      // Nếu user chọn style không rõ, fallback về clay để an toàn.
      const styleId: BEStyleId = BE_STYLE_MAP[selectedStyle] ?? 'clay'

      const createRes = await api<{ asset: { id: string; url: string } }>(
        '/api/creative/create',
        {
          method: 'POST',
          signal: AbortSignal.timeout(110_000),
          body: JSON.stringify({
            kind: 'art',
            title: `Tranh ${styleName} của con`,
            // No prompt — BE uses fallback: "Tác phẩm thiếu nhi: Tranh ${styleName} của con"
            details: {
              styleId,
              // preserve bị bỏ: prompt mới bảo AI dùng sketch làm concept hint,
              // không phải cải thiện nét vẽ → không cần "preserve" constraint.
            },
            assetIds: [assetId],
          }),
        },
      )

      const url = createRes.asset?.url ?? null
      if (!url) throw new Error('Chưa nhận được ảnh từ AI.')
      setAiUrl(url)
      setAiState('done')
    } catch (err) {
      setAiState('error')
      setAiError(err instanceof Error ? err.message : 'Lỗi không xác định')
    }
  // selectedStyle phải có trong deps: closure dùng selectedStyle để tra BE_STYLE_MAP.
  // Nếu thiếu → stale closure → styleId luôn undefined → BE fallback sang 'clay'.
  }, [styleName, selectedStyle])

  // ── Save to backpack ─────────────────────────────────────────
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
      setAiError(err instanceof Error ? err.message : 'Chưa lưu được')
    } finally {
      setSaving(false)
    }
  }

  // ── Download ─────────────────────────────────────────────────
  // Lý do dùng fetch → Blob: thuộc tính `download` trên thẻ <a> chỉ hoạt động
  // với same-origin URL. aiUrl là cross-origin (CDN/Supabase) nên browser bỏ qua
  // `download` và điều hướng thẳng đến URL thay vì tải file.
  // Giải pháp: kéo ảnh về local memory (Blob) → tạo blob:// URL (same-origin)
  // → trigger click → revoke URL ngay để tránh memory leak.
  async function download() {
    if (!aiUrl) return
    try {
      const res = await fetch(aiUrl)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `aikid-art-${Date.now()}.jpg`
      a.click()
      // Revoke sau 60s — đủ để browser hoàn thành download
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
    } catch {
      // Fallback: mở trong tab mới thay vì điều hướng trang hiện tại
      window.open(aiUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // ── Toolbar items ────────────────────────────────────────────
  const tools = [
    { id: 'brush' as Tool, icon: <Brush size={18} />, label: 'Bút vẽ' },
    { id: 'eraser' as Tool, icon: <Eraser size={18} />, label: 'Tẩy' },
    { id: 'bucket' as Tool, icon: <PaintBucket size={18} />, label: 'Tô màu' },
    { id: 'rect' as Tool, icon: <Square size={18} />, label: 'Hình vuông' },
    { id: 'circle' as Tool, icon: <Circle size={18} />, label: 'Hình tròn' },
    { id: 'eyedropper' as Tool, icon: <Pipette size={18} />, label: 'Hút màu' },
  ]

  return (
    // overflow:hidden required — parent must have known height for h-full to work (CSS spec)
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Top header bar ── */}
      <div className="w-full max-w-[1440px] mx-auto px-1 pt-2 sm:pt-3 shrink-0">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-white px-4 py-2.5 shadow-sm">
          <button
            type="button"
            onClick={() => onBack('style')}
            className="text-xs sm:text-sm font-extrabold text-brand-600 hover:text-brand-700 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
          >
            ← Chọn phong cách
          </button>
          <span className="text-xs sm:text-sm font-extrabold text-text">
            Vẽ tranh · <span className="text-brand-600 font-black">{styleName}</span>
          </span>
        </div>
      </div>

      {/* ── Main workspace grid: max-w-[1440px] aligned with AppShell layout ── */}
      <div className="mx-auto flex w-full max-w-[1440px] min-h-0 flex-1 flex-col p-2 sm:p-3">
        <div className="grid min-h-0 flex-1 w-full gap-3 sm:gap-4 lg:grid-cols-2">
        {/* ── Left: Drawing panel ── */}
        <div className="ui-card flex min-h-0 flex-col overflow-hidden">
          {/* Compact toolbar — single row */}
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
              <button type="button" onClick={undo} disabled={undoStack.length === 0} aria-label="Hoàn tác"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-muted transition hover:border-brand-300 disabled:opacity-40">
                <RotateCcw size={14} />
              </button>
              <button type="button" onClick={redo} disabled={redoStack.length === 0} aria-label="Làm lại"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-muted transition hover:border-brand-300 disabled:opacity-40">
                <RotateCw size={14} />
              </button>
              <button type="button" onClick={clearCanvas} aria-label="Xóa sạch"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-danger transition hover:border-danger">
                <Trash2 size={14} />
              </button>
              <button type="button" onClick={() => fileRef.current?.click()} aria-label="Tải ảnh lên"
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
                  aria-label={`Màu ${c}`}
                  className={cn(
                    'h-5 w-5 rounded-full border-2 transition',
                    color === c ? 'border-text scale-125' : 'border-white hover:scale-110',
                  )}
                  style={{ background: c }}
                />
              ))}
              <label className="relative h-5 w-5 cursor-pointer rounded-full border-2 border-border overflow-hidden" title="Chọn màu khác">
                <span className="block h-full w-full rounded-full" style={{ background: 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)' }} />
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label="Chọn màu tùy ý" />
              </label>
              <input
                type="range" min={2} max={40} value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-16 accent-brand-500"
                aria-label="Kích thước bút"
              />
            </div>
          </div>

          {/* Canvas — absolute fill so it always takes all space */}
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

        {/* ── Right: AI result panel ── */}
        <div className="ui-card flex min-h-0 flex-col">
          <div className="flex items-center justify-between border-b border-border p-3">
            <p className="text-sm font-extrabold text-text">AI vẽ lại · {styleName}</p>
            {aiState === 'done' && (
              <div className="flex gap-2">
                <button type="button" onClick={generateAI} aria-label="Làm lại ảnh AI"
                  className="rounded-btn border border-border px-3 py-1.5 text-xs font-bold text-muted hover:border-brand-300">
                  <RotateCcw size={12} className="mr-1 inline" /> Làm lại
                </button>
                <button type="button" onClick={download} aria-label="Tải ảnh về"
                  className="rounded-btn border border-border px-3 py-1.5 text-xs font-bold text-muted hover:border-brand-300">
                  {/* Download icon — phân biệt với nút Làm lại (RotateCcw) */}
                  <Download size={12} className="mr-1 inline" /> Tải về
                </button>
              </div>
            )}
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center bg-bg p-4">
            {aiState === 'idle' && (
              <div className="flex flex-col items-center gap-4 text-center">
                <Sparkles size={48} className="text-brand-300" />
                <p className="max-w-[200px] text-sm font-semibold text-muted">
                  Vẽ xong rồi bấm <strong className="text-brand-600">AI Vẽ Lại</strong> để xem phép thuật!
                </p>
                <button type="button" onClick={generateAI}
                  className="ui-btn ui-btn-primary gap-2">
                  <Sparkles size={18} /> AI Vẽ Lại
                </button>
              </div>
            )}

            {aiState === 'loading' && (
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500" role="status" aria-label="Đang tạo ảnh" />
                <p className="font-display text-lg text-brand-600">AI đang vẽ…</p>
                <p className="text-xs text-muted">Bé đợi chút nhé!</p>
              </div>
            )}

            {aiState === 'error' && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-coral-200 bg-coral-50 p-6 text-center">
                <p className="font-bold text-danger">Chưa vẽ được</p>
                <p className="text-sm text-muted">{aiError}</p>
                <button type="button" onClick={generateAI}
                  className="ui-btn ui-btn-secondary text-sm">
                  Thử lại
                </button>
              </div>
            )}

            {aiState === 'done' && aiUrl && (
              <div className="flex h-full w-full flex-col gap-3">
                <img
                  src={aiUrl}
                  alt="Tranh AI đã vẽ"
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
                  {saving ? 'Đang lưu…' : 'Lưu vào Ba lô'}
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
