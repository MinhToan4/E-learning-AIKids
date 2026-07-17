import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Undo2,
  Redo2,
  Trash2,
  Eye,
  Save,
  Layers,
  ArrowUp,
  ArrowDown,
  Move,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { useDemoStore } from '@/store/demo-store'
import { STICKERS } from '@/data/mock'
import { validateChildText } from '@/lib/safety'
import type { ComicElement } from '@/types'
import { cn } from '@/lib/cn'

export function ComicStudioPage() {
  const navigate = useNavigate()
  const isMobile = useIsNarrow()
  const page = useDemoStore((s) => s.comicPages[0])
  const assets = useDemoStore((s) => s.backpackAssets)
  const selectedId = useDemoStore((s) => s.selectedComicElementId)
  const placeAssetId = useDemoStore((s) => s.placeAssetId)
  const addComicElement = useDemoStore((s) => s.addComicElement)
  const updateComicElement = useDemoStore((s) => s.updateComicElement)
  const removeComicElement = useDemoStore((s) => s.removeComicElement)
  const setSelectedComicElement = useDemoStore((s) => s.setSelectedComicElement)
  const setPlaceAssetId = useDemoStore((s) => s.setPlaceAssetId)
  const undoComic = useDemoStore((s) => s.undoComic)
  const redoComic = useDemoStore((s) => s.redoComic)
  const autoLayoutComic = useDemoStore((s) => s.autoLayoutComic)
  const pushComicHistory = useDemoStore((s) => s.pushComicHistory)
  const completeQuest = useDemoStore((s) => s.completeQuest)
  const addToast = useDemoStore((s) => s.addToast)
  const project = useDemoStore((s) => s.currentProject)

  const [previewOpen, setPreviewOpen] = useState(false)
  const [bubbleText, setBubbleText] = useState('Xin chào!')
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const trayAssets = useMemo(
    () => assets.filter((a) => a.type === 'character' || a.type === 'badge'),
    [assets],
  )

  const selected = page.elements.find((e) => e.id === selectedId)

  const placeIntoPanel = (panelId: string, assetThumb?: string, type: ComicElement['type'] = 'image') => {
    const content =
      type === 'bubble'
        ? bubbleText.slice(0, 80)
        : type === 'sticker'
          ? assetThumb ?? '⭐'
          : assetThumb ?? project.cover
    const el: ComicElement = {
      id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      panelId,
      x: 16,
      y: type === 'bubble' ? 110 : 16,
      width: type === 'bubble' ? 130 : type === 'sticker' ? 48 : 110,
      height: type === 'bubble' ? 56 : type === 'sticker' ? 48 : 110,
      rotation: 0,
      zIndex: page.elements.length + 1,
      content,
      color: type === 'bubble' ? '#24304A' : undefined,
    }
    addComicElement(el)
    addToast({ type: 'success', title: `Đã thêm vào ${panelId.replace('p', 'khung ')}` })
  }

  if (isMobile) {
    return (
      <Card className="text-center">
        <h1 className="font-display text-2xl font-semibold">Xưởng truyện tranh</h1>
        <p className="mt-3 text-muted">
          Dùng tablet hoặc máy tính để sáng tạo dễ hơn. Màn hình nhỏ có thể xem portfolio.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button onClick={() => navigate('/portfolio/star-cat')}>Xem portfolio</Button>
          <Button variant="secondary" onClick={() => navigate('/world')}>
            Về bản đồ
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold md:text-3xl">Xưởng truyện tranh</h1>
          <p className="text-sm text-muted">{project.title} · Autosave cục bộ</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={undoComic}>
            <Undo2 className="size-4" aria-hidden />
            Undo
          </Button>
          <Button variant="secondary" size="sm" onClick={redoComic}>
            <Redo2 className="size-4" aria-hidden />
            Redo
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setPreviewOpen(true)}>
            <Eye className="size-4" aria-hidden />
            Xem trước
          </Button>
          <Button
            size="sm"
            onClick={() => {
              completeQuest('comic', 100)
              addToast({ type: 'success', title: 'Đã lưu truyện tranh!' })
              navigate('/studio/video')
            }}
          >
            <Save className="size-4" aria-hidden />
            Lưu & làm video
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr_240px]">
        <Card className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Khay asset</h2>
          {trayAssets.length === 0 ? (
            <p className="text-sm text-muted">Chưa có nhân vật. Hãy tạo ở Xưởng Prompt.</p>
          ) : (
            trayAssets.map((a) => (
              <div key={a.id} className="rounded-2xl border border-border p-2">
                <img src={a.thumbnail} alt={a.name} className="h-20 w-full rounded-xl object-cover" />
                <p className="mt-1 text-xs font-bold">{a.name}</p>
                <div className="mt-2 flex gap-1">
                  <Button
                    size="sm"
                    variant={placeAssetId === a.id ? 'primary' : 'soft'}
                    className="flex-1"
                    onClick={() => setPlaceAssetId(placeAssetId === a.id ? null : a.id)}
                  >
                    Chọn
                  </Button>
                </div>
              </div>
            ))
          )}
          <div className="border-t border-border pt-3">
            <p className="mb-2 text-sm font-bold">Sticker</p>
            <div className="flex flex-wrap gap-2">
              {STICKERS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="min-h-12 min-w-12 cursor-pointer rounded-xl border border-border bg-white text-xl shadow-soft"
                  onClick={() => setPlaceAssetId(`sticker:${s.content}`)}
                  aria-label={`Chọn sticker ${s.label}`}
                >
                  {s.content}
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-bold">Lời thoại (≤80)</span>
            <input
              value={bubbleText}
              maxLength={80}
              onChange={(e) => setBubbleText(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-border px-3 text-sm font-semibold outline-none focus:border-brand-500"
            />
          </label>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              const check = validateChildText(bubbleText)
              if (!check.ok) {
                addToast({ type: 'warning', title: check.message ?? 'Chữ chưa an toàn' })
                return
              }
              setPlaceAssetId('bubble')
              addToast({ type: 'info', title: 'Chọn khung để đặt bong bóng thoại' })
            }}
          >
            Thêm bong bóng
          </Button>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Canvas 4 khung</h2>
            <Button size="sm" variant="soft" onClick={autoLayoutComic}>
              Tự sắp xếp
            </Button>
          </div>
          {placeAssetId ? (
            <p className="mb-3 rounded-xl bg-sun-100 px-3 py-2 text-sm font-semibold" aria-live="polite">
              Đang chọn asset — bấm “Đặt vào đây” trên một khung.
            </p>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            {page.panels.map((panel) => {
              const els = page.elements
                .filter((e) => e.panelId === panel.id)
                .sort((a, b) => a.zIndex - b.zIndex)
              return (
                <div
                  key={panel.id}
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl border-2 border-border bg-gradient-to-br from-sky-50 to-brand-50"
                >
                  <div className="absolute left-2 top-2 z-20 rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold">
                    {panel.label}
                  </div>
                  {placeAssetId ? (
                    <button
                      type="button"
                      className="absolute bottom-2 right-2 z-20 min-h-11 cursor-pointer rounded-xl bg-brand-500 px-3 text-xs font-bold text-white shadow-soft"
                      onClick={() => {
                        if (placeAssetId === 'bubble') placeIntoPanel(panel.id, bubbleText, 'bubble')
                        else if (placeAssetId.startsWith('sticker:'))
                          placeIntoPanel(panel.id, placeAssetId.replace('sticker:', ''), 'sticker')
                        else {
                          const asset = trayAssets.find((a) => a.id === placeAssetId)
                          placeIntoPanel(panel.id, asset?.thumbnail ?? project.cover, 'image')
                        }
                        setPlaceAssetId(null)
                      }}
                    >
                      Đặt vào đây
                    </button>
                  ) : null}
                  {els.map((el) => (
                    <div
                      key={el.id}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setSelectedComicElement(el.id)
                        if (selectedId === el.id) {
                          const step = e.shiftKey ? 8 : 4
                          if (e.key === 'ArrowLeft') updateComicElement(el.id, { x: el.x - step })
                          if (e.key === 'ArrowRight') updateComicElement(el.id, { x: el.x + step })
                          if (e.key === 'ArrowUp') updateComicElement(el.id, { y: el.y - step })
                          if (e.key === 'ArrowDown') updateComicElement(el.id, { y: el.y + step })
                          if (e.key === 'Delete' || e.key === 'Backspace') removeComicElement(el.id)
                        }
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        setSelectedComicElement(el.id)
                        setDragId(el.id)
                        const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect()
                        setDragOffset({
                          x: e.clientX - rect.left - el.x,
                          y: e.clientY - rect.top - el.y,
                        })
                        pushComicHistory()
                      }}
                      onMouseMove={(e) => {
                        if (dragId !== el.id) return
                        const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect()
                        updateComicElement(el.id, {
                          x: Math.max(0, Math.min(rect.width - el.width, e.clientX - rect.left - dragOffset.x)),
                          y: Math.max(0, Math.min(rect.height - el.height, e.clientY - rect.top - dragOffset.y)),
                        })
                      }}
                      onMouseUp={() => setDragId(null)}
                      onMouseLeave={() => setDragId(null)}
                      className={cn(
                        'absolute cursor-move select-none',
                        selectedId === el.id && 'ring-2 ring-brand-500 ring-offset-2',
                      )}
                      style={{
                        left: el.x,
                        top: el.y,
                        width: el.width,
                        height: el.height,
                        transform: `rotate(${el.rotation}deg)`,
                        zIndex: el.zIndex,
                      }}
                      aria-label={`${el.type} trong ${panel.label}`}
                    >
                      {el.type === 'image' ? (
                        <img src={el.content} alt="" className="size-full rounded-xl object-cover" draggable={false} />
                      ) : el.type === 'bubble' ? (
                        <div className="flex size-full items-center justify-center rounded-2xl border-2 border-text bg-white px-2 text-center text-xs font-bold shadow-soft">
                          {el.content}
                        </div>
                      ) : (
                        <div className="flex size-full items-center justify-center text-3xl">{el.content}</div>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Thuộc tính</h2>
          {!selected ? (
            <p className="text-sm text-muted">Chọn một phần tử trên canvas.</p>
          ) : (
            <>
              <p className="text-sm font-bold capitalize">{selected.type}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    updateComicElement(selected.id, { zIndex: selected.zIndex + 1 })
                  }
                >
                  <ArrowUp className="size-4" aria-hidden />
                  Lên lớp
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    updateComicElement(selected.id, {
                      zIndex: Math.max(1, selected.zIndex - 1),
                    })
                  }
                >
                  <ArrowDown className="size-4" aria-hidden />
                  Xuống lớp
                </Button>
              </div>
              <label className="block text-sm font-bold">
                Kích thước
                <input
                  type="range"
                  min={40}
                  max={180}
                  value={selected.width}
                  onChange={(e) => {
                    const w = Number(e.target.value)
                    updateComicElement(selected.id, { width: w, height: selected.type === 'bubble' ? Math.max(40, w * 0.45) : w })
                  }}
                  className="mt-2 w-full"
                />
              </label>
              <label className="block text-sm font-bold">
                Xoay (giới hạn ±30°)
                <input
                  type="range"
                  min={-30}
                  max={30}
                  value={selected.rotation}
                  onChange={(e) =>
                    updateComicElement(selected.id, { rotation: Number(e.target.value) })
                  }
                  className="mt-2 w-full"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => updateComicElement(selected.id, { x: selected.x - 8 })}
                >
                  <Move className="size-4" aria-hidden />
                  Trái
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => updateComicElement(selected.id, { x: selected.x + 8 })}
                >
                  Phải
                </Button>
              </div>
              <Button
                variant="danger"
                fullWidth
                onClick={() => removeComicElement(selected.id)}
              >
                <Trash2 className="size-4" aria-hidden />
                Xóa (có undo)
              </Button>
            </>
          )}
          <div className="rounded-xl bg-bg p-3 text-xs text-muted">
            <Layers className="mb-1 size-4" aria-hidden />
            Bàn phím: mũi tên di chuyển · Delete xóa · Tab chọn
          </div>
        </Card>
      </div>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Xem trước truyện" className="max-w-3xl">
        <div className="grid grid-cols-2 gap-3">
          {page.panels.map((panel) => {
            const els = page.elements
              .filter((e) => e.panelId === panel.id)
              .sort((a, b) => a.zIndex - b.zIndex)
            return (
              <div
                key={panel.id}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-sky-50"
              >
                {els.map((el) => (
                  <div
                    key={el.id}
                    className="absolute"
                    style={{
                      left: el.x,
                      top: el.y,
                      width: el.width,
                      height: el.height,
                      transform: `rotate(${el.rotation}deg)`,
                      zIndex: el.zIndex,
                    }}
                  >
                    {el.type === 'image' ? (
                      <img src={el.content} alt="" className="size-full rounded-lg object-cover" />
                    ) : el.type === 'bubble' ? (
                      <div className="flex size-full items-center justify-center rounded-xl border bg-white p-1 text-center text-[10px] font-bold">
                        {el.content}
                      </div>
                    ) : (
                      <div className="text-2xl">{el.content}</div>
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </Modal>
    </div>
  )
}

function useIsNarrow() {
  const [narrow, setNarrow] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  )
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return narrow
}
