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
]

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
  displayJson: '{\n  "glowColor": "#A78BFA",\n  "intensity": 0.6\n}',
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

  const uploadAsset = async (file: File) => {
    setUploading(true)
    setMessage('')
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('purpose', 'legend_reward_design')
      const result = await api<{ asset: { url: string } }>('/api/media/upload', {
        method: 'POST',
        body,
      })
      setForm((current) => ({ ...current, assetUrl: result.asset.url }))
      setPreviewUrl(result.asset.url)
      setMessage('Đã tải asset lên StoryMee Media. Preview đã được cập nhật.')
    } catch (error) {
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
      const displayConfig = JSON.parse(form.displayJson) as Record<string, unknown>
      const content = JSON.parse(form.contentJson) as Record<string, unknown>
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
                <select className="field-input mt-1 w-full bg-white" value={form.contentType} onChange={(event) => setForm({ ...form, contentType: event.target.value as ContentType })}>
                  <option value="reward">Reward / vật phẩm</option><option value="chapter">Chapter Storybook</option><option value="event">Sự kiện</option>
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-bold">Mã định danh
                  <input required minLength={3} className="field-input mt-1 w-full bg-white" placeholder="frame-galaxy" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
                </label>
                <label className="text-sm font-bold">Độ hiếm
                  <select className="field-input mt-1 w-full bg-white" value={form.rarity} onChange={(event) => setForm({ ...form, rarity: event.target.value })}>
                    <option value="common">Common</option><option value="rare">Rare</option><option value="epic">Epic</option><option value="legendary">Legendary</option>
                  </select>
                </label>
              </div>
              <label className="block text-sm font-bold">Tên hiển thị
                <input required className="field-input mt-1 w-full bg-white" placeholder="Ví dụ: Khung Dải Ngân Hà" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </label>
              <label className="block text-sm font-bold">Mô tả
                <textarea className="field-input mt-1 min-h-24 w-full bg-white" placeholder="Mô tả giá trị và cách trẻ nhận phần thưởng…" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
              </label>
            </section>

            <section className="space-y-4 rounded-3xl border border-border bg-slate-50/70 p-4">
              <h3 className="font-extrabold">2. Asset thiết kế</h3>
              {form.contentType === 'reward' && (
                <label className="block text-sm font-bold">Loại vật phẩm
                  <select className="field-input mt-1 w-full bg-white" value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value })}>
                    {kindOptions.map((kind) => <option key={kind} value={kind}>{kind}</option>)}
                  </select>
                </label>
              )}
              <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-brand-200 bg-white p-5 text-center hover:border-brand-500">
                <span className="block text-3xl">☁️</span>
                <span className="mt-2 block text-sm font-extrabold">{uploading ? 'Đang tải và xử lý…' : 'Chọn file để tải lên & preview'}</span>
                <span className="block text-xs text-muted">PNG, WebP, JPG, SVG, JSON hoặc WebM</span>
                <input type="file" accept=".png,.webp,.jpg,.jpeg,.svg,.json,.webm" className="sr-only" disabled={uploading} onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) {
                    setPreviewUrl(URL.createObjectURL(file))
                    void uploadAsset(file)
                  }
                }} />
              </label>
              <p className="break-all rounded-xl bg-white p-3 text-xs text-muted">{form.assetUrl || 'Chưa có URL asset — preview tạm sẽ xuất hiện ngay khi chọn file.'}</p>
            </section>

            <section className="space-y-4 rounded-3xl border border-border bg-slate-50/70 p-4">
              <h3 className="font-extrabold">3. Điều kiện mở khóa</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-bold">Điều kiện
                  <select className="field-input mt-1 w-full bg-white" value={form.unlockType} onChange={(event) => setForm({ ...form, unlockType: event.target.value })}>
                    <option value="xp_level">XP level</option><option value="storybook_sticker">Tiến độ Storybook</option><option value="event">Tham gia sự kiện</option>
                  </select>
                </label>
                <label className="text-sm font-bold">Giá trị
                  <input className="field-input mt-1 w-full bg-white" value={form.unlockValue} onChange={(event) => setForm({ ...form, unlockValue: event.target.value })} />
                </label>
              </div>
            </section>

            <details className="rounded-3xl border border-border bg-slate-50/70 p-4">
              <summary className="cursor-pointer font-extrabold">4. Cấu hình nâng cao (JSON)</summary>
              <label className="mt-4 block text-xs font-bold">Display JSON
                <textarea className="field-input mt-1 min-h-32 w-full bg-white font-mono text-xs" value={form.displayJson} onChange={(event) => setForm({ ...form, displayJson: event.target.value })} />
              </label>
              <label className="mt-3 block text-xs font-bold">Chapter/Event JSON
                <textarea className="field-input mt-1 min-h-24 w-full bg-white font-mono text-xs" value={form.contentJson} onChange={(event) => setForm({ ...form, contentJson: event.target.value })} />
              </label>
            </details>
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
            <div className="rounded-2xl border border-border p-4 text-sm">
              <p><strong>Nhóm:</strong> {form.contentType === 'reward' ? `Reward · ${form.kind}` : form.contentType === 'chapter' ? 'Storybook chapter' : 'Sự kiện'}</p>
              <p className="mt-1"><strong>Mở khóa:</strong> {form.unlockType} = {form.unlockValue}</p>
              <p className="mt-1 break-all"><strong>Mã:</strong> {form.code || 'chưa nhập'}</p>
            </div>
            <p className="text-xs text-muted">Preview tạm xuất hiện ngay khi chọn file; URL chính thức được thay thế sau khi upload thành công.</p>
          </aside>
        </div>
      )}
      {message && <p className="rounded-2xl bg-brand-50 p-3 text-sm font-bold text-brand-700" aria-live="polite">{message}</p>}
    </div>
  )
}
