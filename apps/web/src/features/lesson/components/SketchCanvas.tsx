import { useEffect, useRef, useState } from 'react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

/**
 * In-lesson drawing only — exports PNG data URL for practiceKind=sketch.
 * Not a free photo uploader.
 */
export function SketchCanvas({
  onChange,
  className,
}: {
  onChange: (dataUrl: string | null) => void
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [color, setColor] = useState('#1e2740')
  const [hasStroke, setHasStroke] = useState(false)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    // Soft paper background
    ctx.fillStyle = '#fffef8'
    ctx.fillRect(0, 0, c.width, c.height)
    onChange(null)
    setHasStroke(false)
  }, [onChange])

  function pos(
    e: React.MouseEvent | React.TouchEvent,
  ): { x: number; y: number } | null {
    const c = canvasRef.current
    if (!c) return null
    const r = c.getBoundingClientRect()
    const scaleX = c.width / r.width
    const scaleY = c.height / r.height
    if ('touches' in e) {
      const t = e.touches[0]
      if (!t) return null
      return {
        x: (t.clientX - r.left) * scaleX,
        y: (t.clientY - r.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - r.left) * scaleX,
      y: (e.clientY - r.top) * scaleY,
    }
  }

  function start(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    const p = pos(e)
    const c = canvasRef.current
    const ctx = c?.getContext('2d')
    if (!p || !ctx) return
    drawing.current = true
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    ctx.strokeStyle = color
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  function move(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current) return
    e.preventDefault()
    const p = pos(e)
    const c = canvasRef.current
    const ctx = c?.getContext('2d')
    if (!p || !ctx) return
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    setHasStroke(true)
  }

  function end() {
    if (!drawing.current) return
    drawing.current = false
    const c = canvasRef.current
    if (!c || !hasStroke) {
      // hasStroke may lag one frame — export if path drawn
      try {
        const url = c?.toDataURL('image/png')
        if (url && url.length > 500) onChange(url)
      } catch {
        onChange(null)
      }
      return
    }
    try {
      onChange(c.toDataURL('image/png'))
    } catch {
      onChange(null)
    }
  }

  function clear() {
    const c = canvasRef.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    ctx.fillStyle = '#fffef8'
    ctx.fillRect(0, 0, c.width, c.height)
    setHasStroke(false)
    onChange(null)
  }

  // Flush export when stroke ends via mouseup outside
  useEffect(() => {
    const up = () => {
      if (drawing.current) end()
    }
    window.addEventListener('mouseup', up)
    window.addEventListener('touchend', up)
    return () => {
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchend', up)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStroke])

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <p className="text-sm font-extrabold">Vẽ trong bài (canvas)</p>
      <p className="text-xs text-muted">
        Chỉ nét vẽ tại đây mới lưu vào ba lô làm ref — không chọn ảnh từ máy.
      </p>
      <canvas
        ref={canvasRef}
        width={480}
        height={320}
        className="max-w-full touch-none rounded-2xl border-2 border-border bg-[#fffef8] shadow-soft"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
      <div className="flex flex-wrap items-center gap-2">
        {['#1e2740', '#6d5efc', '#ff7b93', '#3ed9a0', '#ffc94a'].map((c) => (
          <button
            key={c}
            type="button"
            className={cn(
              'h-8 w-8 rounded-full border-2',
              color === c ? 'border-brand-600 scale-110' : 'border-border',
            )}
            style={{ backgroundColor: c }}
            onClick={() => setColor(c)}
            aria-label={`Màu ${c}`}
          />
        ))}
        <Button type="button" variant="ghost" className="!min-h-9 !text-xs" onClick={clear}>
          Xóa canvas
        </Button>
      </div>
    </div>
  )
}
