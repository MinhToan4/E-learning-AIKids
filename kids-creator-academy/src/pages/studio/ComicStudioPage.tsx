import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Undo2,
  Redo2,
  Trash2,
  Eye,
  Save,
  ArrowUp,
  ArrowDown,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { useDemoStore } from '@/store/demo-store'
import { STICKERS } from '@/data/mock'
import { storyToPanelHints } from '@/lib/flow'
import { validateChildText } from '@/lib/safety'
import type { ComicElement } from '@/types'
import { cn } from '@/lib/cn'

/**
 * 4-panel comic studio — consistent control sizes, clear steps.
 * Mobile: simplified place-by-tap (no free drag) so flow still works.
 */
export function ComicStudioPage() {
  const navigate = useNavigate()
  const narrow = useIsNarrow(900)
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
  const setCurrentQuest = useDemoStore((s) => s.setCurrentQuest)
  const addToast = useDemoStore((s) => s.addToast)
  const addStars = useDemoStore((s) => s.addStars)
  const project = useDemoStore((s) => s.currentProject)
  const storyOutline = useDemoStore((s) => s.storyOutline)

  const [previewOpen, setPreviewOpen] = useState(false)
  const panelHints = useMemo(() => storyToPanelHints(storyOutline), [storyOutline])
  const [bubbleText, setBubbleText] = useState('Xin chào!')
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const trayAssets = useMemo(
    () => assets.filter((a) => a.type === 'character' || a.type === 'badge'),
    [assets],
  )
  const cover = project.cover
  const selected = page.elements.find((e) => e.id === selectedId)
  const panelsWithContent = page.panels.filter((p) =>
    page.elements.some((e) => e.panelId === p.id),
  ).length

  const placeIntoPanel = (
    panelId: string,
    assetThumb?: string,
    type: ComicElement['type'] = 'image',
  ) => {
    const content =
      type === 'bubble'
        ? bubbleText.slice(0, 80)
        : type === 'sticker'
          ? (assetThumb ?? '⭐')
          : (assetThumb ?? cover)
    const el: ComicElement = {
      id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      panelId,
      x: 12,
      y: type === 'bubble' ? 100 : 12,
      width: type === 'bubble' ? 140 : type === 'sticker' ? 52 : 120,
      height: type === 'bubble' ? 60 : type === 'sticker' ? 52 : 120,
      rotation: 0,
      zIndex: page.elements.length + 1,
      content,
    }
    addComicElement(el)
    addToast({
      type: 'success',
      title: `Đã thêm vào ${panelId.replace('p', 'khung ')}`,
    })
  }

  const saveAndVideo = () => {
    useDemoStore.getState().markPracticeDone('comic')
    addStars(15)
    setCurrentQuest('comic')
    addToast({
      type: 'success',
      title: 'Đã lưu truyện 4 khung!',
      description: 'Làm trắc nghiệm ngắn, rồi mở studio video.',
    })
    navigate('/lesson/comic?step=quiz')
  }

  const fillAllQuick = () => {
    const thumb = trayAssets[0]?.thumbnail ?? cover
    page.panels.forEach((p, i) => {
      const has = page.elements.some((e) => e.panelId === p.id && e.type === 'image')
      if (!has) {
        const el: ComicElement = {
          id: `el-auto-${i}-${Date.now()}`,
          type: 'image',
          panelId: p.id,
          x: 16,
          y: 16,
          width: 130,
          height: 130,
          rotation: 0,
          zIndex: 1,
          content: thumb,
        }
        addComicElement(el)
      }
    })
    addToast({ type: 'success', title: 'Đã xếp ảnh vào 4 khung' })
  }

  return (
    <div className="stage-shell space-y-4 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-500">Nhiệm vụ · Truyện 4 khung</p>
          <h1 className="font-display text-2xl text-text sm:text-3xl">
            Xếp ảnh vào truyện
          </h1>
          <p className="text-sm text-muted">
            {project.title} · {panelsWithContent}/4 khung có nội dung
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={undoComic}>
            <Undo2 className="size-4" aria-hidden />
            Hoàn tác
          </Button>
          <Button variant="secondary" size="sm" onClick={redoComic}>
            <Redo2 className="size-4" aria-hidden />
            Làm lại
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setPreviewOpen(true)}>
            <Eye className="size-4" aria-hidden />
            Xem trước
          </Button>
          <Button size="sm" onClick={saveAndVideo}>
            <Save className="size-4" aria-hidden />
            Xong · Làm video
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-brand-100 bg-brand-50 px-4 py-3 text-sm font-semibold text-text">
        <strong>Cách làm:</strong> 1) Chọn ảnh bên trái → 2) Bấm “Đặt” trên khung → 3)
        Thêm lời thoại nếu muốn → 4) Bấm <strong>Xong · Làm video</strong>
      </div>

      {/* Story guide from previous step */}
      {(storyOutline.opening || storyOutline.problem || storyOutline.ending) && (
        <div className="rounded-[1.25rem] border-2 border-sun-400/50 bg-sun-100/60 p-3 sm:p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-text">
              📜 Cốt truyện: {storyOutline.title || 'Truyện của con'}
            </p>
            <Button
              size="sm"
              variant="soft"
              onClick={() => navigate('/studio/story')}
            >
              Sửa cốt truyện
            </Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {panelHints.map((h) => (
              <div
                key={h.panel}
                className="rounded-xl border border-white bg-white/90 px-3 py-2 text-xs font-semibold shadow-soft"
              >
                <span className="font-bold text-brand-600">
                  Khung {h.panel} · {h.label}
                </span>
                <p className="mt-1 line-clamp-2 text-text">{h.beat}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className={cn(
          'grid gap-4',
          narrow ? 'grid-cols-1' : 'lg:grid-cols-[240px_1fr_220px]',
        )}
      >
        {/* Tray */}
        <Card className="space-y-3">
          <h2 className="text-base font-bold text-text">1. Chọn thứ để đặt</h2>
          {trayAssets.length === 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted">Chưa có ảnh nhân vật trong ba lô.</p>
              <Button
                size="sm"
                variant="secondary"
                fullWidth
                onClick={() => navigate('/studio/prompt')}
              >
                Tạo ảnh trước
              </Button>
              <Button size="sm" fullWidth onClick={fillAllQuick}>
                <Plus className="size-4" aria-hidden />
                Dùng ảnh bìa vào 4 khung
              </Button>
            </div>
          ) : (
            trayAssets.map((a) => (
              <div
                key={a.id}
                className={cn(
                  'rounded-2xl border-2 p-2',
                  placeAssetId === a.id
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-border',
                )}
              >
                <img
                  src={a.thumbnail}
                  alt={a.name}
                  className="h-24 w-full rounded-xl object-cover"
                />
                <p className="mt-1 truncate text-sm font-bold">{a.name}</p>
                <Button
                  size="sm"
                  className="mt-2 w-full"
                  variant={placeAssetId === a.id ? 'primary' : 'secondary'}
                  onClick={() =>
                    setPlaceAssetId(placeAssetId === a.id ? null : a.id)
                  }
                >
                  {placeAssetId === a.id ? 'Đang chọn' : 'Chọn ảnh này'}
                </Button>
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
                  className={cn(
                    'flex size-12 cursor-pointer items-center justify-center rounded-xl border-2 bg-white text-xl',
                    placeAssetId === `sticker:${s.content}`
                      ? 'border-brand-500'
                      : 'border-border',
                  )}
                  onClick={() => setPlaceAssetId(`sticker:${s.content}`)}
                  aria-label={s.label}
                >
                  {s.content}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-bold">Lời thoại</span>
            <input
              value={bubbleText}
              maxLength={80}
              onChange={(e) => setBubbleText(e.target.value)}
              className="min-h-11 w-full rounded-xl border-2 border-border px-3 text-sm font-semibold outline-none focus:border-brand-500"
            />
          </label>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              const check = validateChildText(bubbleText)
              if (!check.ok) {
                addToast({
                  type: 'warning',
                  title: check.message ?? 'Chữ chưa an toàn',
                })
                return
              }
              setPlaceAssetId('bubble')
              addToast({
                type: 'info',
                title: 'Chạm “Đặt” trên một khung',
              })
            }}
          >
            Chọn bong bóng thoại
          </Button>
          <Button variant="soft" fullWidth onClick={fillAllQuick}>
            Tự xếp ảnh vào 4 khung
          </Button>
        </Card>

        {/* Canvas */}
        <Card className="p-3 sm:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-text">2. Bốn khung truyện</h2>
            <Button size="sm" variant="soft" onClick={autoLayoutComic}>
              Tự sắp xếp
            </Button>
          </div>
          {placeAssetId ? (
            <p
              className="mb-3 rounded-xl bg-sun-100 px-3 py-2 text-sm font-bold"
              aria-live="polite"
            >
              Đang cầm một vật — bấm nút <strong>Đặt</strong> trên khung muốn dùng.
            </p>
          ) : (
            <p className="mb-3 text-sm text-muted">
              Chọn ảnh bên trái, rồi bấm Đặt trên từng khung.
            </p>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {page.panels.map((panel, panelIdx) => {
              const els = page.elements
                .filter((e) => e.panelId === panel.id)
                .sort((a, b) => a.zIndex - b.zIndex)
              const hint = panelHints[panelIdx]
              return (
                <div
                  key={panel.id}
                  className="relative min-h-[200px] overflow-hidden rounded-2xl border-2 border-border bg-gradient-to-br from-sky-50 to-brand-50 sm:aspect-[4/3] sm:min-h-0"
                >
                  <div className="absolute left-2 top-2 z-20 max-w-[85%] rounded-full bg-white px-2.5 py-1 text-xs font-bold shadow-soft">
                    {panel.label}
                    {hint ? (
                      <span className="ml-1 font-semibold text-muted">· {hint.label}</span>
                    ) : null}
                  </div>
                  {hint && els.length === 0 ? (
                    <p className="pointer-events-none absolute inset-x-3 top-10 z-10 line-clamp-2 rounded-xl bg-white/80 px-2 py-1 text-center text-[11px] font-semibold text-muted">
                      Gợi ý: {hint.beat}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    className={cn(
                      'absolute bottom-2 right-2 z-20 min-h-11 cursor-pointer rounded-xl px-3 text-sm font-bold text-white shadow-soft',
                      placeAssetId ? 'bg-brand-500' : 'bg-brand-500/70',
                    )}
                    onClick={() => {
                      if (!placeAssetId) {
                        // One-tap place default character/cover
                        const thumb = trayAssets[0]?.thumbnail ?? cover
                        placeIntoPanel(panel.id, thumb, 'image')
                        return
                      }
                      if (placeAssetId === 'bubble')
                        placeIntoPanel(panel.id, bubbleText, 'bubble')
                      else if (placeAssetId.startsWith('sticker:'))
                        placeIntoPanel(
                          panel.id,
                          placeAssetId.replace('sticker:', ''),
                          'sticker',
                        )
                      else {
                        const asset = trayAssets.find((a) => a.id === placeAssetId)
                        placeIntoPanel(
                          panel.id,
                          asset?.thumbnail ?? cover,
                          'image',
                        )
                      }
                      setPlaceAssetId(null)
                    }}
                  >
                    Đặt
                  </button>
                  {els.length === 0 ? (
                    <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm font-semibold text-muted">
                      Khung trống
                    </p>
                  ) : null}
                  {els.map((el) => (
                    <div
                      key={el.id}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ')
                          setSelectedComicElement(el.id)
                        if (selectedId === el.id) {
                          const step = e.shiftKey ? 8 : 4
                          if (e.key === 'ArrowLeft')
                            updateComicElement(el.id, { x: el.x - step })
                          if (e.key === 'ArrowRight')
                            updateComicElement(el.id, { x: el.x + step })
                          if (e.key === 'ArrowUp')
                            updateComicElement(el.id, { y: el.y - step })
                          if (e.key === 'ArrowDown')
                            updateComicElement(el.id, { y: el.y + step })
                          if (e.key === 'Delete' || e.key === 'Backspace')
                            removeComicElement(el.id)
                        }
                      }}
                      onMouseDown={(e) => {
                        if (narrow) {
                          setSelectedComicElement(el.id)
                          return
                        }
                        e.stopPropagation()
                        setSelectedComicElement(el.id)
                        setDragId(el.id)
                        const rect = (
                          e.currentTarget.parentElement as HTMLElement
                        ).getBoundingClientRect()
                        setDragOffset({
                          x: e.clientX - rect.left - el.x,
                          y: e.clientY - rect.top - el.y,
                        })
                        pushComicHistory()
                      }}
                      onMouseMove={(e) => {
                        if (dragId !== el.id || narrow) return
                        const rect = (
                          e.currentTarget.parentElement as HTMLElement
                        ).getBoundingClientRect()
                        updateComicElement(el.id, {
                          x: Math.max(
                            0,
                            Math.min(
                              rect.width - el.width,
                              e.clientX - rect.left - dragOffset.x,
                            ),
                          ),
                          y: Math.max(
                            0,
                            Math.min(
                              rect.height - el.height,
                              e.clientY - rect.top - dragOffset.y,
                            ),
                          ),
                        })
                      }}
                      onMouseUp={() => setDragId(null)}
                      onMouseLeave={() => setDragId(null)}
                      className={cn(
                        'absolute select-none',
                        narrow ? 'cursor-pointer' : 'cursor-move',
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
                    >
                      {el.type === 'image' ? (
                        <img
                          src={el.content}
                          alt=""
                          className="size-full rounded-xl object-cover"
                          draggable={false}
                        />
                      ) : el.type === 'bubble' ? (
                        <div className="flex size-full items-center justify-center rounded-2xl border-2 border-text bg-white px-2 text-center text-xs font-bold shadow-soft">
                          {el.content}
                        </div>
                      ) : (
                        <div className="flex size-full items-center justify-center text-3xl">
                          {el.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Properties — only when not super narrow, or below */}
        <Card className="space-y-3">
          <h2 className="text-base font-bold text-text">3. Chỉnh (tuỳ chọn)</h2>
          {!selected ? (
            <p className="text-sm text-muted">Chạm một vật trên khung để chỉnh.</p>
          ) : (
            <>
              <p className="text-sm font-bold capitalize text-text">{selected.type}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    updateComicElement(selected.id, { zIndex: selected.zIndex + 1 })
                  }
                >
                  <ArrowUp className="size-4" aria-hidden />
                  Lên
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
                  Xuống
                </Button>
              </div>
              <label className="block text-sm font-bold">
                Cỡ
                <input
                  type="range"
                  min={48}
                  max={200}
                  value={selected.width}
                  onChange={(e) => {
                    const w = Number(e.target.value)
                    updateComicElement(selected.id, {
                      width: w,
                      height:
                        selected.type === 'bubble' ? Math.max(40, w * 0.45) : w,
                    })
                  }}
                  className="mt-2 w-full"
                />
              </label>
              <Button
                variant="danger"
                fullWidth
                onClick={() => removeComicElement(selected.id)}
              >
                <Trash2 className="size-4" aria-hidden />
                Xóa (có hoàn tác)
              </Button>
            </>
          )}
          <Button fullWidth size="lg" onClick={saveAndVideo}>
            Xong · Làm video
          </Button>
        </Card>
      </div>

      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Xem trước truyện"
        className="max-w-3xl"
      >
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
                      <img
                        src={el.content}
                        alt=""
                        className="size-full rounded-lg object-cover"
                      />
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

function useIsNarrow(breakpoint = 900) {
  const [narrow, setNarrow] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false,
  )
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < breakpoint)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [breakpoint])
  return narrow
}
