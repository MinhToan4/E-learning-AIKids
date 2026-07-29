import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '@/shared/lib/api'
import { Button } from '@/shared/components/ui/Button'

type ContentType = 'reward' | 'chapter' | 'event'
type StudioItem = {
  id: string
  contentType: ContentType
  code: string
  version: number
  status: 'draft' | 'review' | 'scheduled' | 'published' | 'retired'
  name: string
  description: string
  kind?: string | null
  rarity: string
  assets: { thumbnailUrl?: string; imageUrl?: string; overlayUrl?: string; animationUrl?: string }
  displayConfig: Record<string, unknown>
  unlockRule: Record<string, unknown>
  content: Record<string, unknown>
  updatedAt?: string
}

const kindOptions = [
  'frame', 'background', 'companion', 'effect', 'theme', 'title',
  'event_ticket', 'perk', 'avatar',
] as const
type RewardKind = typeof kindOptions[number]

type AssetSpec = {
  label: string
  width: number
  height: number
  formats: string[]
  maxMb: number
  transparent: boolean
  layer: number
  slot: string
  safeArea: string
  combinesWith: string
}

const assetSpecs: Record<RewardKind, AssetSpec> = {
  background: { label: 'Background hồ sơ', width: 1600, height: 1200, formats: ['image/webp', 'image/jpeg', 'image/png'], maxMb: 3, transparent: false, layer: 0, slot: 'profile_background', safeArea: 'Giữ chủ thể ngoài vùng giữa 60%', combinesWith: 'Avatar + Frame + Companion + Effect + Title' },
  avatar: { label: 'Avatar', width: 1024, height: 1024, formats: ['image/webp', 'image/png', 'image/jpeg'], maxMb: 2, transparent: false, layer: 20, slot: 'profile_avatar', safeArea: 'Mặt nằm trong vòng tròn giữa 72%', combinesWith: 'Background + Frame + Companion + Effect' },
  frame: { label: 'Khung avatar', width: 1024, height: 1024, formats: ['image/png', 'image/webp'], maxMb: 2, transparent: true, layer: 30, slot: 'avatar_frame', safeArea: 'Giữa ảnh phải trong suốt tối thiểu 58%', combinesWith: 'Background + Avatar + 1 Companion + 1 Effect' },
  companion: { label: 'Bạn đồng hành', width: 512, height: 512, formats: ['image/png', 'image/webp'], maxMb: 1.5, transparent: true, layer: 40, slot: 'avatar_companion', safeArea: 'Nhân vật trong 90%, chừa 5% mỗi cạnh', combinesWith: 'Background + Avatar + Frame + Effect' },
  effect: { label: 'Hiệu ứng', width: 1024, height: 1024, formats: ['video/webm', 'image/webp', 'image/png'], maxMb: 4, transparent: true, layer: 50, slot: 'avatar_effect', safeArea: 'Không che vùng mặt ở giữa 50%', combinesWith: 'Background + Avatar + Frame + Companion' },
  title: { label: 'Khung danh hiệu', width: 1200, height: 320, formats: ['image/png', 'image/webp'], maxMb: 1.5, transparent: true, layer: 60, slot: 'profile_title', safeArea: 'Chừa vùng chữ giữa 70% × 55%', combinesWith: 'Theme + Background; nằm dưới profile card' },
  theme: { label: 'Theme trang cá nhân', width: 1600, height: 1200, formats: ['application/json'], maxMb: 0.5, transparent: false, layer: 10, slot: 'profile_theme', safeArea: 'JSON token màu; không nhúng ảnh base64', combinesWith: 'Background + Frame + Title; theme chỉ điều khiển màu/font' },
  event_ticket: { label: 'Vé / banner sự kiện', width: 1200, height: 675, formats: ['image/webp', 'image/jpeg', 'image/png'], maxMb: 2, transparent: false, layer: 0, slot: 'event_card', safeArea: 'Chừa 20% bên trái cho tên và thời gian', combinesWith: 'Dùng độc lập trong card sự kiện' },
  perk: { label: 'Biểu tượng đặc quyền', width: 512, height: 512, formats: ['image/png', 'image/webp'], maxMb: 1, transparent: true, layer: 60, slot: 'perk_badge', safeArea: 'Icon trong 80% vùng giữa', combinesWith: 'Hiển thị độc lập ở ba lô và badge' },
}

const displayTemplate = (kind: RewardKind) => {
  const spec = assetSpecs[kind]
  return JSON.stringify({
    slot: spec.slot,
    layer: spec.layer,
    canvas: { width: spec.width, height: spec.height },
    transparent: spec.transparent,
    fit: 'contain',
    glowColor: '#A78BFA',
    intensity: 0.6,
  }, null, 2)
}

const emptyForm = () => ({
  contentType: 'reward' as ContentType,
  code: '',
  name: '',
  description: '',
  kind: 'frame',
  rarity: 'common',
  assetUrl: '',
  unlockType: 'xp_level',
  unlockValue: '1',
  chapterSlug: 'P09',
  chapterGroup: 'learning',
  chapterEmoji: '📖',
  chapterColorStart: '#4338CA',
  chapterColorEnd: '#F59E0B',
  chapterStory: '',
  chapterStickersJson: JSON.stringify(Array.from({ length: 9 }, (_, index) => ({
    id: `P09-S${index + 1}`,
    name: index === 8 ? 'Boss huyền thoại' : `Sticker ${index + 1}`,
    icon: index === 8 ? '🏆' : '⭐',
    hint: index === 8 ? 'Hoàn thành 8 sticker thường' : 'Mô tả điều kiện mở khóa',
    boss: index === 8,
  })), null, 2),
  eventStartsAt: '',
  eventEndsAt: '',
  displayJson: displayTemplate('frame'),
  contentJson: '{}',
})

export function LegendRewardStudio() {
  const [items, setItems] = useState<StudioItem[]>([])
  const [filter, setFilter] = useState<ContentType | 'all'>('all')
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [view, setView] = useState<'library' | 'create'>('library')
  const [previewUrl, setPreviewUrl] = useState('')
  const [assetInfo, setAssetInfo] = useState('')
  const selectedSpec = assetSpecs[form.kind as RewardKind] ?? assetSpecs.frame
  const fieldClass = 'field-input mt-2 min-h-12 w-full border-2 border-slate-200 bg-white px-4 text-base shadow-sm focus:border-brand-500'

  const load = useCallback(async () => {
    try {
      const result = await api<{ items: StudioItem[] }>('/api/admin/legend-studio')
      setItems(result.items)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không tải được Legend Studio.')
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const counts = useMemo(() => ({
    draft: items.filter((item) => item.status === 'draft').length,
    review: items.filter((item) => item.status === 'review').length,
    published: items.filter((item) => item.status === 'published').length,
  }), [items])
  const visibleItems = useMemo(
    () => filter === 'all' ? items : items.filter((item) => item.contentType === filter),
    [filter, items],
  )

  const inspectAsset = async (file: File) => {
    if (form.contentType !== 'reward') {
      const allowed = ['image/png', 'image/webp', 'image/jpeg', 'application/json', 'video/webm']
      if (!allowed.includes(file.type)) throw new Error('Chapter/Event chỉ nhận PNG, WebP, JPG, JSON hoặc WebM.')
      if (file.size > 6 * 1024 * 1024) throw new Error('Asset Chapter/Event tối đa 6 MB.')
      return `${file.name} · ${(file.size / 1024).toFixed(0)} KB · định dạng hợp lệ`
    }
    const spec = selectedSpec
    if (!spec.formats.includes(file.type)) {
      throw new Error(`Sai định dạng. ${spec.label} chỉ nhận: ${spec.formats.map((format) => format.split('/')[1].toUpperCase()).join(', ')}.`)
    }
    if (file.size > spec.maxMb * 1024 * 1024) {
      throw new Error(`File vượt quá ${spec.maxMb} MB theo template ${spec.label}.`)
    }
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      return `${file.name} · ${(file.size / 1024).toFixed(0)} KB · định dạng hợp lệ`
    }
    const dimensions = await new Promise<{ width: number; height: number; hasTransparency: boolean }>((resolve, reject) => {
      const image = new Image()
      const objectUrl = URL.createObjectURL(file)
      image.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 64
        canvas.height = 64
        const context = canvas.getContext('2d')
        context?.drawImage(image, 0, 0, 64, 64)
        const pixels = context?.getImageData(0, 0, 64, 64).data
        let hasTransparency = false
        if (pixels) {
          for (let index = 3; index < pixels.length; index += 4) {
            if (pixels[index] < 250) {
              hasTransparency = true
              break
            }
          }
        }
        URL.revokeObjectURL(objectUrl)
        resolve({ width: image.naturalWidth, height: image.naturalHeight, hasTransparency })
      }
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Không đọc được kích thước ảnh.'))
      }
      image.src = objectUrl
    })
    if (dimensions.width !== spec.width || dimensions.height !== spec.height) {
      throw new Error(`Sai kích thước ${dimensions.width}×${dimensions.height}px. Template ${spec.label} yêu cầu đúng ${spec.width}×${spec.height}px.`)
    }
    if (spec.transparent && !dimensions.hasTransparency) {
      throw new Error(`${spec.label} bắt buộc có nền trong suốt để ghép với các reward khác.`)
    }
    return `${file.name} · ${dimensions.width}×${dimensions.height}px · ${(file.size / 1024).toFixed(0)} KB · đạt chuẩn`
  }

  const uploadAsset = async (file: File) => {
    setUploading(true)
    setMessage('')
    try {
      const inspection = await inspectAsset(file)
      setAssetInfo(inspection)
      const body = new FormData()
      body.append('file', file)
      body.append('purpose', 'legend_reward_design')
      const result = await api<{ asset: { url: string } }>('/api/media/upload', {
        method: 'POST',
        body,
      })
      setForm((current) => ({ ...current, assetUrl: result.asset.url }))
      setPreviewUrl(result.asset.url)
      setMessage('Asset đạt chuẩn và đã tải lên StoryMee Media. Preview đã được cập nhật.')
    } catch (error) {
      setAssetInfo('')
      setPreviewUrl('')
      setMessage(error instanceof Error ? error.message : 'Không tải được asset.')
    } finally {
      setUploading(false)
    }
  }

  const create = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const createdType = form.contentType
      const displayConfig = form.contentType === 'chapter'
        ? { emoji: form.chapterEmoji, colors: [form.chapterColorStart, form.chapterColorEnd], layout: 'book_spread' }
        : JSON.parse(form.displayJson) as Record<string, unknown>
      const content = form.contentType === 'chapter'
        ? {
            slug: form.chapterSlug.toUpperCase(),
            group: form.chapterGroup,
            story: form.chapterStory,
            stickers: JSON.parse(form.chapterStickersJson) as unknown[],
          }
        : form.contentType === 'event'
          ? {
              ...JSON.parse(form.contentJson) as Record<string, unknown>,
              startsAt: form.eventStartsAt,
              endsAt: form.eventEndsAt,
            }
          : JSON.parse(form.contentJson) as Record<string, unknown>
      await api('/api/admin/legend-studio', {
        method: 'POST',
        body: JSON.stringify({
          contentType: form.contentType,
          code: form.code,
          name: form.name,
          description: form.description,
          kind: form.contentType === 'reward' ? form.kind : null,
          rarity: form.rarity,
          assets: form.assetUrl
            ? { thumbnailUrl: form.assetUrl, imageUrl: form.assetUrl }
            : {},
          displayConfig,
          unlockRule: { type: form.unlockType, value: form.unlockValue },
          content,
        }),
      })
      setForm(emptyForm())
      setPreviewUrl('')
      setAssetInfo('')
      setFilter(createdType)
      setView('library')
      setMessage('Đã tạo bản nháp. Hãy preview trước khi phát hành.')
      await load()
    } catch (error) {
      setMessage(error instanceof SyntaxError
        ? 'JSON cấu hình chưa hợp lệ.'
        : error instanceof Error ? error.message : 'Không tạo được nội dung.')
    } finally {
      setBusy(false)
    }
  }

  const transition = async (item: StudioItem, action: 'review' | 'publish' | 'retire') => {
    setBusy(true)
    try {
      if (action === 'review') {
        await api(`/api/admin/legend-studio/${item.id}`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'review' }),
        })
      } else {
        await api(`/api/admin/legend-studio/${item.id}/${action}`, { method: 'POST' })
      }
      setMessage(action === 'publish' ? 'Đã phát hành lên production.' : action === 'retire' ? 'Đã ngừng phát hành.' : 'Đã gửi duyệt.')
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không cập nhật được trạng thái.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-3">
        {[
          ['Bản nháp', counts.draft, '📝'],
          ['Chờ duyệt', counts.review, '👀'],
          ['Đang phát hành', counts.published, '🚀'],
        ].map(([label, value, icon]) => (
          <div key={String(label)} className="ui-card p-4">
            <p className="text-2xl">{icon}</p>
            <p className="font-display text-3xl text-brand-600">{value}</p>
            <p className="text-xs font-bold text-muted">{label}</p>
          </div>
        ))}
      </section>

      <nav className="ui-card flex flex-wrap gap-2 p-2" aria-label="Chế độ Legend Studio">
        <button type="button" onClick={() => setView('library')} className={`flex-1 rounded-2xl px-5 py-3 text-sm font-black ${view === 'library' ? 'bg-brand-600 text-white shadow-md' : 'text-muted hover:bg-brand-50'}`}>
          📚 Kho nội dung
        </button>
        <button type="button" onClick={() => setView('create')} className={`flex-1 rounded-2xl px-5 py-3 text-sm font-black ${view === 'create' ? 'bg-brand-600 text-white shadow-md' : 'text-muted hover:bg-brand-50'}`}>
          ＋ Tạo thiết kế mới
        </button>
      </nav>

      {view === 'library' && (
        <section className="ui-card overflow-hidden">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-brand-600">Quản lý catalog & version</p>
              <h2 className="font-display text-2xl">Kho nội dung phát hành</h2>
            </div>
            <Button onClick={() => setView('create')}>＋ Tạo nội dung</Button>
          </header>
          <div className="grid gap-3 border-b border-border bg-slate-50/70 p-4 sm:grid-cols-4">
            {([
              ['all', 'Tất cả', '🗂️'],
              ['reward', 'Rewards', '🎁'],
              ['chapter', 'Storybook', '📖'],
              ['event', 'Sự kiện', '🎪'],
            ] as const).map(([value, label, icon]) => (
              <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-2xl border p-4 text-left transition ${filter === value ? 'border-brand-500 bg-white shadow-md ring-2 ring-brand-100' : 'border-border bg-white/70 hover:border-brand-300'}`}>
                <span className="text-2xl">{icon}</span>
                <span className="mt-2 block font-extrabold">{label}</span>
                <span className="text-xs text-muted">{value === 'all' ? items.length : items.filter((item) => item.contentType === value).length} nội dung</span>
              </button>
            ))}
          </div>
          <div className="divide-y divide-border">
            {visibleItems.length === 0 && <p className="p-10 text-center text-muted">Chưa có nội dung trong mục này. Hãy tạo version đầu tiên.</p>}
            {visibleItems.map((item) => (
              <article key={item.id} className="grid gap-4 p-4 sm:grid-cols-[72px_1fr_auto] sm:items-center">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-brand-50 text-3xl">
                  {item.assets?.thumbnailUrl
                    ? <img src={item.assets.thumbnailUrl} alt="" className="h-full w-full object-contain" />
                    : item.contentType === 'reward' ? '🎁' : item.contentType === 'chapter' ? '📖' : '🎪'}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold">{item.name}</h3>
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-black">{item.contentType}</span>
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-700">{item.rarity}</span>
                  </div>
                  <p className="font-mono text-xs text-muted">{item.code} · v{item.version}</p>
                  <p className="line-clamp-2 text-xs text-muted">{item.description}</p>
                  <details className="mt-2 text-xs text-muted">
                    <summary className="cursor-pointer font-bold text-brand-600">Xem cấu hình & điều kiện</summary>
                    <pre className="mt-2 max-h-40 overflow-auto rounded-xl bg-slate-100 p-3">{JSON.stringify({ unlockRule: item.unlockRule, displayConfig: item.displayConfig, content: item.content }, null, 2)}</pre>
                  </details>
                </div>
                <div className="flex flex-wrap gap-2 sm:max-w-40 sm:justify-end">
                  <span className={`w-full text-right text-xs font-black ${
                    item.status === 'published' ? 'text-success' : item.status === 'retired' ? 'text-muted' : 'text-brand-600'
                  }`}>{item.status}</span>
                  {item.status === 'draft' && <Button variant="secondary" onClick={() => void transition(item, 'review')}>Gửi duyệt</Button>}
                  {(item.status === 'review' || item.status === 'scheduled') && <Button onClick={() => void transition(item, 'publish')}>Phát hành</Button>}
                  {item.status === 'published' && <Button variant="secondary" onClick={() => void transition(item, 'retire')}>Ngừng</Button>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {view === 'create' && (
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <form onSubmit={(event) => void create(event)} className="ui-card order-2 space-y-5 p-5 xl:order-1">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-brand-600">Tạo version mới</p>
              <h2 className="font-display text-2xl">Thiết kế nội dung</h2>
              <p className="text-sm text-muted">Mỗi nhóm thông tin được tách riêng để dễ kiểm tra trước khi lưu.</p>
            </div>

            <section className="space-y-4 rounded-3xl border border-border bg-slate-50/70 p-4">
              <h3 className="font-extrabold">1. Thông tin cơ bản</h3>
              <label className="block text-sm font-bold">Loại nội dung
                <select className={fieldClass} value={form.contentType} onChange={(event) => setForm({ ...form, contentType: event.target.value as ContentType })}>
                  <option value="reward">Reward / vật phẩm</option><option value="chapter">Chapter Storybook</option><option value="event">Sự kiện</option>
                </select>
              </label>
              <div className={`grid gap-3 ${form.contentType === 'reward' ? 'sm:grid-cols-2' : ''}`}>
                <label className="text-sm font-bold">Mã định danh
                  <input required minLength={3} className={fieldClass} placeholder={form.contentType === 'reward' ? 'frame-galaxy' : form.contentType === 'chapter' ? 'P09' : 'summer-creative-2026'} value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
                </label>
                {form.contentType === 'reward' && <label className="text-sm font-bold">Độ hiếm
                  <select className={fieldClass} value={form.rarity} onChange={(event) => setForm({ ...form, rarity: event.target.value })}>
                    <option value="common">Common</option><option value="rare">Rare</option><option value="epic">Epic</option><option value="legendary">Legendary</option>
                  </select>
                </label>}
              </div>
              <label className="block text-sm font-bold">Tên hiển thị
                <input required className={fieldClass} placeholder="Ví dụ: Khung Dải Ngân Hà" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </label>
              <label className="block text-sm font-bold">Mô tả
                <textarea className={`${fieldClass} min-h-32 py-3`} placeholder="Mô tả giá trị và cách trẻ nhận phần thưởng…" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
              </label>
            </section>

            <section className="space-y-4 rounded-3xl border border-border bg-slate-50/70 p-4">
              <h3 className="font-extrabold">
                {form.contentType === 'reward' ? '2. Asset reward' : form.contentType === 'chapter' ? '2. Nội dung cuốn sách' : '2. Nội dung sự kiện'}
              </h3>
              {form.contentType === 'chapter' && (
                <>
                  <div className="rounded-2xl border-2 border-amber-300 bg-[#fff9df] p-4">
                    <p className="text-xs font-black uppercase tracking-wider text-amber-800">Storybook Chapter Template</p>
                    <p className="mt-1 text-sm text-amber-950">Một chapter gồm bìa/trang trái, nội dung truyện, bảng 9 sticker ở trang phải và quà hoàn thành. Không dùng layer/slot của reward.</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="text-sm font-bold">Mã trang
                      <input required pattern="P[0-9]{2}" className={fieldClass} value={form.chapterSlug} onChange={(event) => setForm({ ...form, chapterSlug: event.target.value.toUpperCase() })} />
                    </label>
                    <label className="text-sm font-bold">Nhóm hành trình
                      <select className={fieldClass} value={form.chapterGroup} onChange={(event) => setForm({ ...form, chapterGroup: event.target.value })}>
                        <option value="learning">Học tập</option><option value="creative">Sáng tạo</option><option value="milestone">Cột mốc</option><option value="social">Kết nối</option>
                      </select>
                    </label>
                    <label className="text-sm font-bold">Biểu tượng
                      <input className={fieldClass} value={form.chapterEmoji} onChange={(event) => setForm({ ...form, chapterEmoji: event.target.value })} />
                    </label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm font-bold">Màu trang trái
                      <input type="color" className={`${fieldClass} p-2`} value={form.chapterColorStart} onChange={(event) => setForm({ ...form, chapterColorStart: event.target.value })} />
                    </label>
                    <label className="text-sm font-bold">Màu chuyển sắc
                      <input type="color" className={`${fieldClass} p-2`} value={form.chapterColorEnd} onChange={(event) => setForm({ ...form, chapterColorEnd: event.target.value })} />
                    </label>
                  </div>
                  <label className="block text-sm font-bold">Lời kể của chapter
                    <textarea required className={`${fieldClass} min-h-36 py-3`} placeholder="Đoạn dẫn truyện hiển thị trên trang trái…" value={form.chapterStory} onChange={(event) => setForm({ ...form, chapterStory: event.target.value })} />
                  </label>
                  <label className="block text-sm font-bold">9 sticker và điều kiện
                    <textarea required className={`${fieldClass} min-h-64 py-3 font-mono text-xs`} value={form.chapterStickersJson} onChange={(event) => setForm({ ...form, chapterStickersJson: event.target.value })} />
                  </label>
                </>
              )}
              {form.contentType === 'event' && (
                <>
                  <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-4 text-sm">
                    Event Builder quản lý banner, thời gian diễn ra, luật tham gia và reward pool; không sử dụng cấu trúc trang sách hoặc layer avatar.
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm font-bold">Bắt đầu
                      <input required type="datetime-local" className={fieldClass} value={form.eventStartsAt} onChange={(event) => setForm({ ...form, eventStartsAt: event.target.value })} />
                    </label>
                    <label className="text-sm font-bold">Kết thúc
                      <input required type="datetime-local" className={fieldClass} value={form.eventEndsAt} onChange={(event) => setForm({ ...form, eventEndsAt: event.target.value })} />
                    </label>
                  </div>
                </>
              )}
              {form.contentType === 'reward' && (
                <label className="block text-sm font-bold">Loại vật phẩm
                  <select className={fieldClass} value={form.kind} onChange={(event) => {
                    const kind = event.target.value as RewardKind
                    setForm({ ...form, kind, displayJson: displayTemplate(kind), assetUrl: '' })
                    setPreviewUrl('')
                    setAssetInfo('')
                  }}>
                    {kindOptions.map((kind) => <option key={kind} value={kind}>{assetSpecs[kind].label}</option>)}
                  </select>
                </label>
              )}
              {form.contentType === 'reward' && (
                <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/70 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-brand-600">Template bắt buộc</p>
                      <h4 className="mt-1 text-lg font-extrabold">{selectedSpec.label}</h4>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-brand-700">{selectedSpec.width} × {selectedSpec.height}px</span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <p className="rounded-xl bg-white p-3 text-sm"><strong>Định dạng:</strong><br />{selectedSpec.formats.map((format) => format.split('/')[1].toUpperCase()).join(' · ')}</p>
                    <p className="rounded-xl bg-white p-3 text-sm"><strong>Dung lượng:</strong><br />Tối đa {selectedSpec.maxMb} MB</p>
                    <p className="rounded-xl bg-white p-3 text-sm"><strong>Nền:</strong><br />{selectedSpec.transparent ? 'Bắt buộc trong suốt' : 'Được phép phủ toàn bộ nền'}</p>
                    <p className="rounded-xl bg-white p-3 text-sm"><strong>Safe area:</strong><br />{selectedSpec.safeArea}</p>
                  </div>
                  <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
                    <strong>Ghép lớp:</strong> {selectedSpec.combinesWith}<br />
                    <span className="text-xs">Slot <code>{selectedSpec.slot}</code> · layer {selectedSpec.layer}. Mỗi profile chỉ dùng tối đa một asset cho mỗi slot.</span>
                  </div>
                </div>
              )}
              <label className="block min-h-40 cursor-pointer rounded-2xl border-2 border-dashed border-brand-400 bg-white p-8 text-center shadow-sm hover:border-brand-600 hover:bg-brand-50/30">
                <span className="block text-4xl">☁️</span>
                <span className="mt-3 block text-base font-extrabold">{uploading ? 'Đang kiểm tra và tải lên…' : 'Chọn file đúng template để preview'}</span>
                <span className="mt-1 block text-sm text-muted">{form.contentType === 'reward' ? `${selectedSpec.width}×${selectedSpec.height}px · tối đa ${selectedSpec.maxMb} MB` : 'PNG, WebP, JPG, JSON hoặc WebM'}</span>
                <input type="file" accept=".png,.webp,.jpg,.jpeg,.svg,.json,.webm" className="sr-only" disabled={uploading} onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) {
                    setPreviewUrl(URL.createObjectURL(file))
                    void uploadAsset(file)
                  }
                }} />
              </label>
              {assetInfo && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">✓ {assetInfo}</p>}
              <p className="break-all rounded-xl bg-white p-3 text-xs text-muted">{form.assetUrl || 'Chưa có URL asset — preview tạm sẽ xuất hiện ngay khi chọn file.'}</p>
            </section>

            <section className="space-y-4 rounded-3xl border border-border bg-slate-50/70 p-4">
              <h3 className="font-extrabold">3. Điều kiện mở khóa</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-bold">Điều kiện
                  <select className={fieldClass} value={form.unlockType} onChange={(event) => setForm({ ...form, unlockType: event.target.value })}>
                    <option value="xp_level">XP level</option><option value="storybook_sticker">Tiến độ Storybook</option><option value="event">Tham gia sự kiện</option>
                  </select>
                </label>
                <label className="text-sm font-bold">Giá trị
                  <input className={fieldClass} value={form.unlockValue} onChange={(event) => setForm({ ...form, unlockValue: event.target.value })} />
                </label>
              </div>
            </section>

            {form.contentType !== 'chapter' && <details className="rounded-3xl border border-border bg-slate-50/70 p-4">
              <summary className="cursor-pointer font-extrabold">4. Cấu hình nâng cao (JSON)</summary>
              <label className="mt-4 block text-xs font-bold">Display JSON
                <textarea className={`${fieldClass} min-h-40 py-3 font-mono text-xs`} value={form.displayJson} onChange={(event) => setForm({ ...form, displayJson: event.target.value })} />
              </label>
              <label className="mt-3 block text-xs font-bold">Chapter/Event JSON
                <textarea className={`${fieldClass} min-h-32 py-3 font-mono text-xs`} value={form.contentJson} onChange={(event) => setForm({ ...form, contentJson: event.target.value })} />
              </label>
            </details>}
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setView('library')} className="flex-1">Hủy</Button>
              <Button type="submit" disabled={busy || uploading} className="flex-[2]">Lưu bản nháp</Button>
            </div>
          </form>

          <aside className="ui-card order-1 space-y-4 p-5 xl:order-2 xl:sticky xl:top-5">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-brand-600">Preview trực tiếp</p>
              <h2 className="font-display text-xl">Trẻ sẽ nhìn thấy</h2>
            </div>
            {form.contentType === 'chapter' ? (
              <div className="overflow-hidden rounded-3xl border-[6px] border-amber-900 bg-[#fff9df] shadow-inner">
                <div className="grid min-h-80 grid-cols-2">
                  <div className="relative flex flex-col justify-end overflow-hidden p-5 text-left text-white" style={{ background: `linear-gradient(145deg, ${form.chapterColorStart}, ${form.chapterColorEnd})` }}>
                    <span className="absolute right-2 top-2 text-6xl opacity-25">{form.chapterEmoji}</span>
                    <p className="relative text-[10px] font-black uppercase">{form.chapterSlug} · {form.chapterGroup}</p>
                    <h3 className="relative mt-1 font-display text-xl">{form.name || 'Tên chapter'}</h3>
                    <p className="relative mt-2 line-clamp-5 text-xs font-semibold text-white/90">{form.chapterStory || 'Lời kể của chapter sẽ hiển thị trên trang trái.'}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 bg-[radial-gradient(circle_at_center,#fffdf3,#f7edc9)] p-3">
                    {Array.from({ length: 9 }, (_, index) => (
                      <div key={index} className={`flex min-h-16 flex-col items-center justify-center rounded-xl border p-1 ${index === 8 ? 'border-violet-200 bg-violet-50' : 'border-dashed border-amber-200 bg-white/80'}`}>
                        <span className="text-xl">{index === 8 ? '🏆' : '⭐'}</span>
                        <span className="text-[8px] font-bold">{index === 8 ? 'Boss' : `Sticker ${index + 1}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-violet-100 via-sky-50 to-amber-50 p-5 text-center shadow-inner">
              <div className="mx-auto flex aspect-square max-w-56 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-white/70 shadow-lg">
                {previewUrl
                  ? previewUrl.toLowerCase().includes('.webm')
                    ? <video src={previewUrl} autoPlay loop muted className="h-full w-full object-contain" />
                    : <img src={previewUrl} alt="Preview asset vừa tải" className="h-full w-full object-contain" />
                  : <div className="px-4 text-muted"><span className="block text-5xl">🖼️</span><span className="mt-3 block text-sm font-bold">Chọn asset để xem ngay tại đây</span></div>}
              </div>
              <span className="mt-4 inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-black uppercase text-brand-700 shadow">{form.rarity}</span>
              <h3 className="mt-2 font-display text-xl">{form.name || 'Tên nội dung'}</h3>
              <p className="mt-1 text-xs text-muted">{form.description || 'Mô tả sẽ hiển thị tại đây.'}</p>
              </div>
            )}
            <div className="rounded-2xl border border-border p-4 text-sm">
              <p><strong>Nhóm:</strong> {form.contentType === 'reward' ? `Reward · ${form.kind}` : form.contentType === 'chapter' ? 'Storybook chapter' : 'Sự kiện'}</p>
              <p className="mt-1"><strong>Mở khóa:</strong> {form.unlockType} = {form.unlockValue}</p>
              <p className="mt-1 break-all"><strong>Mã:</strong> {form.code || 'chưa nhập'}</p>
            </div>
            {form.contentType === 'reward' && (
              <div className="rounded-2xl border border-border p-4">
                <h3 className="text-sm font-extrabold">Cấu trúc ghép reward</h3>
                <div className="mt-3 space-y-2 text-xs">
                  {[
                    ['60', 'Danh hiệu / badge', 'bg-amber-100'],
                    ['50', 'Hiệu ứng glow / animation', 'bg-fuchsia-100'],
                    ['40', 'Paco / bạn đồng hành', 'bg-sky-100'],
                    ['30', 'Khung avatar trong suốt', 'bg-violet-100'],
                    ['20', 'Avatar của trẻ', 'bg-emerald-100'],
                    ['10', 'Theme màu và typography', 'bg-slate-100'],
                    ['0', 'Background profile', 'bg-orange-100'],
                  ].map(([layer, label, color]) => (
                    <div key={layer} className={`flex items-center justify-between rounded-lg px-3 py-2 ${color}`}>
                      <span className="font-bold">{label}</span><code>layer {layer}</code>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted">Frame, effect và companion phải có nền trong suốt. Background là lớp duy nhất được phủ kín canvas. Mỗi slot chỉ trang bị một reward.</p>
              </div>
            )}
            <p className="text-xs text-muted">Preview tạm xuất hiện ngay khi chọn file; URL chính thức được thay thế sau khi upload thành công.</p>
          </aside>
        </div>
      )}
      {message && <p className="rounded-2xl bg-brand-50 p-3 text-sm font-bold text-brand-700" aria-live="polite">{message}</p>}
    </div>
  )
}
