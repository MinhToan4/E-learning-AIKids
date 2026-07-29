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

  const load = useCallback(async () => {
    try {
      const suffix = filter === 'all' ? '' : `?type=${filter}`
      const result = await api<{ items: StudioItem[] }>(`/api/admin/legend-studio${suffix}`)
      setItems(result.items)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không tải được Legend Studio.')
    }
  }, [filter])

  useEffect(() => { void load() }, [load])

  const counts = useMemo(() => ({
    draft: items.filter((item) => item.status === 'draft').length,
    review: items.filter((item) => item.status === 'review').length,
    published: items.filter((item) => item.status === 'published').length,
  }), [items])

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
      setMessage('Đã tải asset lên StoryMee Media.')
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

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <form onSubmit={(event) => void create(event)} className="ui-card space-y-4 p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-brand-600">Tạo version mới</p>
            <h2 className="font-display text-2xl">Thiết kế nội dung</h2>
          </div>
          <label className="block text-sm font-bold">Loại
            <select className="field-input mt-1 w-full" value={form.contentType} onChange={(event) => setForm({ ...form, contentType: event.target.value as ContentType })}>
              <option value="reward">Reward / vật phẩm</option>
              <option value="chapter">Chapter huyền thoại</option>
              <option value="event">Sự kiện</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-bold">Mã
              <input required minLength={3} className="field-input mt-1 w-full" placeholder="frame-galaxy" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
            </label>
            <label className="text-sm font-bold">Độ hiếm
              <select className="field-input mt-1 w-full" value={form.rarity} onChange={(event) => setForm({ ...form, rarity: event.target.value })}>
                <option value="common">Common</option><option value="rare">Rare</option>
                <option value="epic">Epic</option><option value="legendary">Legendary</option>
              </select>
            </label>
          </div>
          <label className="block text-sm font-bold">Tên
            <input required className="field-input mt-1 w-full" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label className="block text-sm font-bold">Mô tả
            <textarea className="field-input mt-1 min-h-20 w-full" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </label>
          {form.contentType === 'reward' && (
            <label className="block text-sm font-bold">Loại vật phẩm
              <select className="field-input mt-1 w-full" value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value })}>
                {kindOptions.map((kind) => <option key={kind} value={kind}>{kind}</option>)}
              </select>
            </label>
          )}
          <label className="block text-sm font-bold">Asset thiết kế
            <input
              type="file"
              accept=".png,.webp,.jpg,.jpeg,.svg,.json,.webm"
              className="mt-1 block w-full text-xs"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void uploadAsset(file)
              }}
            />
          </label>
          {form.assetUrl && (
            <div className="rounded-2xl bg-brand-50 p-3">
              <img src={form.assetUrl} alt="Preview asset" className="mx-auto max-h-36 rounded-xl object-contain" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-bold">Điều kiện
              <select className="field-input mt-1 w-full" value={form.unlockType} onChange={(event) => setForm({ ...form, unlockType: event.target.value })}>
                <option value="xp_level">XP level</option>
                <option value="storybook_sticker">Sticker</option>
                <option value="event">Sự kiện</option>
              </select>
            </label>
            <label className="text-sm font-bold">Giá trị
              <input className="field-input mt-1 w-full" value={form.unlockValue} onChange={(event) => setForm({ ...form, unlockValue: event.target.value })} />
            </label>
          </div>
          <details className="rounded-2xl border border-border p-3">
            <summary className="cursor-pointer text-sm font-extrabold">Cấu hình nâng cao</summary>
            <label className="mt-3 block text-xs font-bold">Display JSON
              <textarea className="field-input mt-1 min-h-32 w-full font-mono text-xs" value={form.displayJson} onChange={(event) => setForm({ ...form, displayJson: event.target.value })} />
            </label>
            <label className="mt-3 block text-xs font-bold">Chapter/Event JSON
              <textarea className="field-input mt-1 min-h-24 w-full font-mono text-xs" value={form.contentJson} onChange={(event) => setForm({ ...form, contentJson: event.target.value })} />
            </label>
          </details>
          <Button type="submit" disabled={busy || uploading} className="w-full">Lưu bản nháp</Button>
        </form>

        <section className="ui-card overflow-hidden">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-brand-600">Catalog có version</p>
              <h2 className="font-display text-2xl">Reward · Huyền thoại · Sự kiện</h2>
            </div>
            <select className="field-input" value={filter} onChange={(event) => setFilter(event.target.value as ContentType | 'all')}>
              <option value="all">Tất cả</option><option value="reward">Reward</option>
              <option value="chapter">Chapter</option><option value="event">Sự kiện</option>
            </select>
          </header>
          <div className="divide-y divide-border">
            {items.length === 0 && <p className="p-8 text-center text-muted">Chưa có nội dung. Hãy tạo version đầu tiên.</p>}
            {items.map((item) => (
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
      </div>
      {message && <p className="rounded-2xl bg-brand-50 p-3 text-sm font-bold text-brand-700" aria-live="polite">{message}</p>}
    </div>
  )
}
