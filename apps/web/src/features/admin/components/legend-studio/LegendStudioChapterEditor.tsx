import { useMemo, type ReactNode } from 'react'
import { Pencil } from 'lucide-react'
import type { ChapterEditorFocus, ChapterStickerItem, StudioFormState, StudioItem } from './types'
import { legacyRewardStudioItems, stickerMetrics, storybookThemePresets, studioStatusLabel } from './constants'
import { BookSpread } from '@/features/storybook/components/BookSpread'
import type { StorybookPage } from '@/features/storybook/storybook-data'

export function ChapterBookMapPreview({
  item,
  onEdit,
  lifecycleActions,
}: {
  item: StudioItem
  onEdit: (focus: ChapterEditorFocus) => void
  lifecycleActions?: ReactNode
}) {
  const colors = Array.isArray(item.displayConfig.colors) ? item.displayConfig.colors.map(String) : ['#4338CA', '#F59E0B']
  const stickers = Array.isArray(item.content.stickers)
    ? item.content.stickers.filter((sticker): sticker is Record<string, unknown> => Boolean(sticker && typeof sticker === 'object')).slice(0, 9)
    : []
  const editButtonClass = 'absolute inset-0 flex min-h-11 items-end justify-center rounded-xl bg-slate-950/0 p-2 text-xs font-extrabold text-transparent transition-colors hover:bg-slate-950/35 hover:text-white focus-visible:bg-slate-950/35 focus-visible:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600'

  return (
    <article className="rounded-3xl border border-border bg-gradient-to-br from-amber-50 via-white to-sky-50 p-4 shadow-sm sm:col-span-2 xl:col-span-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-brand-600">Chapter canvas · {item.code}</p>
          <h4 className="font-display text-xl font-extrabold">{item.name}</h4>
          <p className="text-xs text-muted">Chạm đúng vùng cần thay ảnh; CMS sẽ mở đúng phần cấu hình.</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${item.source === 'legacy' ? 'bg-amber-100 text-amber-900' : 'bg-mint-50 text-success'}`}>
          {item.source === 'legacy' ? 'Chưa đưa vào Studio' : studioStatusLabel(item)}
        </span>
      </div>
      <div className="grid gap-3 lg:grid-cols-[140px_minmax(0,1fr)]">
        <div className="relative overflow-hidden rounded-2xl border-2 border-white bg-brand-50 shadow-clay">
          <div className="aspect-[4/3] bg-cover bg-center" style={item.assets.coverUrl ? { backgroundImage: `url("${item.assets.coverUrl}")` } : { background: `linear-gradient(145deg, ${colors[0]}, ${colors[1]})` }}>
            {!item.assets.coverUrl && <span className="flex h-full items-center justify-center text-4xl" aria-hidden="true">{String(item.displayConfig.emoji ?? '📖')}</span>}
          </div>
          <button type="button" className={editButtonClass} onClick={() => onEdit('cover')} aria-label={`Sửa bìa ${item.name}`}>Sửa bìa</button>
        </div>
        <div className="relative grid min-h-48 grid-cols-2 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-clay before:absolute before:inset-y-0 before:left-1/2 before:z-10 before:w-px before:bg-slate-300" aria-label={`Xem trước cuốn sách ${item.name}`}>
          <div className="relative min-w-0 bg-cover bg-center p-4" style={item.assets.leftBackgroundUrl ? { backgroundImage: `url("${item.assets.leftBackgroundUrl}")` } : { background: `linear-gradient(145deg, ${colors[0]}, ${colors[1]})` }}>
            <div className="max-w-[75%] rounded-xl bg-white/85 p-2 shadow-sm backdrop-blur-sm">
              <p className="line-clamp-1 text-xs font-black text-brand-700">{item.name}</p>
              <p className="mt-1 line-clamp-3 text-[10px] leading-relaxed text-slate-700">{String(item.content.story ?? item.description)}</p>
            </div>
            <button type="button" className={editButtonClass} onClick={() => onEdit('left')} aria-label={`Sửa background trang trái ${item.name}`}>Sửa background</button>
          </div>
          <div className="relative min-w-0 bg-amber-50 bg-cover bg-center p-3" style={item.assets.stickerPageUrl ? { backgroundImage: `url("${item.assets.stickerPageUrl}")` } : undefined}>
            {item.assets.stickerSheetUrl ? (
              <img src={item.assets.stickerSheetUrl} alt="" className="h-full w-full object-contain" />
            ) : (
              <div className="grid h-full grid-cols-3 content-center gap-1.5" aria-hidden="true">
                {Array.from({ length: 9 }, (_, index) => {
                  const sticker = stickers[index]
                  const imageUrl = sticker ? String(sticker.imageUrl ?? '') : ''
                  return (
                    <span key={String(sticker?.id ?? index)} className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-amber-200 bg-white/85 text-lg shadow-sm">
                      {imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-contain" /> : String(sticker?.icon ?? '✦')}
                    </span>
                  )
                })}
              </div>
            )}
            <button type="button" className={editButtonClass} onClick={() => onEdit('stickerPage')} aria-label={`Sửa nền trang sticker ${item.name}`}>Sửa nền trang sticker</button>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => onEdit('stickers')} className="flex min-h-11 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-extrabold text-white shadow-sm hover:bg-brand-700">
          <Pencil className="h-4 w-4" aria-hidden="true" /> Sửa 9 sticker
        </button>
        <button type="button" onClick={() => onEdit('left')} className="min-h-11 rounded-xl border border-border bg-white px-4 text-sm font-extrabold text-brand-700 hover:bg-brand-50">
          Sửa nội dung chương
        </button>
        {lifecycleActions}
      </div>
    </article>
  )
}

export function ChapterStickerArtwork({
  sticker,
  index,
  sheetUrl,
  locked = false,
}: {
  sticker: { imageUrl?: string; placeholderUrl?: string; icon?: string; sheetIndex?: number }
  index: number
  sheetUrl: string
  locked?: boolean
}) {
  const directUrl = String(locked ? sticker.placeholderUrl ?? '' : sticker.imageUrl ?? '')
  if (directUrl) return <img src={directUrl} alt="" className={`h-full w-full object-contain ${locked ? 'opacity-70' : ''}`} />
  if (sheetUrl) {
    const sheetIndex = Number.isFinite(Number(sticker.sheetIndex)) ? Number(sticker.sheetIndex) : index
    return (
      <span
        className={`block h-full w-full bg-[length:300%_300%] bg-no-repeat ${locked ? 'opacity-60 [filter:brightness(0)_saturate(100%)_opacity(.24)]' : ''}`}
        style={{
          backgroundImage: `url("${sheetUrl}")`,
          backgroundPosition: `${(sheetIndex % 3) * 50}% ${Math.floor(sheetIndex / 3) * 50}%`,
        }}
        aria-hidden="true"
      />
    )
  }
  return <span className={locked ? 'text-3xl opacity-30' : 'text-3xl'} aria-hidden="true">{locked ? '❔' : String(sticker.icon ?? '⭐')}</span>
}

export function ChapterStickerPreview({ item }: { item: StudioItem }) {
  if (item.contentType !== 'chapter') return null
  const stickers = Array.isArray(item.content.stickers)
    ? item.content.stickers as Array<Record<string, unknown>>
    : []
  const sheet = item.assets.stickerPageUrl
  return (
    <div className="mt-2 flex items-center gap-2 rounded-xl bg-amber-50/80 p-2">
      {sheet
        ? <img src={sheet} alt={`Bảng sticker ${item.name}`} loading="lazy" className="h-14 w-14 rounded-lg object-cover" />
        : <div className="grid h-14 w-14 grid-cols-3 gap-0.5 rounded-lg bg-white p-1" aria-hidden="true">
            {stickers.slice(0, 9).map((sticker, index) => <span key={String(sticker.id ?? index)} className="flex items-center justify-center text-xs">{String(sticker.icon ?? '⭐')}</span>)}
          </div>}
      <div className="min-w-0">
        <p className="text-xs font-extrabold text-amber-950">{stickers.length}/9 sticker</p>
        <p className="line-clamp-2 text-[11px] text-amber-900">{stickers.map((sticker) => String(sticker.name ?? '')).filter(Boolean).join(' · ')}</p>
      </div>
    </div>
  )
}

export interface LegendStudioChapterEditorProps {
  form: StudioFormState
  setForm: React.Dispatch<React.SetStateAction<StudioFormState>>
  fieldClass: string
  chapterUploading: string
  onUploadChapterMedia: (
    file: File,
    target: 'cover' | 'left' | 'stickerPage' | 'stickerSheet' | 'chapterButton' | 'stickerButton' | 'helpButton' | 'claimButton' | 'previousButton' | 'nextButton' | number,
    placeholder?: boolean,
  ) => void
  chapterStickers: ChapterStickerItem[]
  updateChapterSticker: (index: number, patch: Record<string, unknown>) => void
  items: StudioItem[]
  storybookPreviewMode: 'locked' | 'complete'
  setStorybookPreviewMode: (mode: 'locked' | 'complete') => void
}

export function LegendStudioChapterEditor({
  form,
  setForm,
  fieldClass,
  chapterUploading,
  onUploadChapterMedia,
  chapterStickers,
  updateChapterSticker,
  items,
  storybookPreviewMode,
  setStorybookPreviewMode,
}: LegendStudioChapterEditorProps) {
  const chapterPreviewPage = useMemo<StorybookPage>(() => ({
    slug: form.chapterSlug || 'P00',
    title: form.name || 'Tên chapter',
    group: form.chapterGroup as StorybookPage['group'],
    emoji: form.chapterEmoji || '📖',
    colors: [form.chapterColorStart, form.chapterColorEnd],
    story: form.chapterStory || 'Lời kể của chapter sẽ hiển thị trên trang trái.',
    coverUrl: form.chapterCoverUrl || undefined,
    leftBackgroundUrl: form.chapterLeftBackgroundUrl || undefined,
    stickerPageUrl: form.chapterStickerPageUrl || undefined,
    stickerSheetUrl: form.chapterStickerSheetUrl || undefined,
    rewardId: form.chapterRewardId || undefined,
    themeKey: form.chapterTheme,
    buttonAssets: {
      chapterTabUrl: form.chapterButtonUrl || undefined,
      stickerTabUrl: form.stickerButtonUrl || undefined,
      helpUrl: form.helpButtonUrl || undefined,
      claimUrl: form.claimButtonUrl || undefined,
      previousUrl: form.previousButtonUrl || undefined,
      nextUrl: form.nextButtonUrl || undefined,
    },
    stickers: chapterStickers,
  }), [chapterStickers, form])

  const chapterPreviewEarned = useMemo(
    () => new Set(storybookPreviewMode === 'complete' ? chapterStickers.map((sticker) => sticker.id) : []),
    [chapterStickers, storybookPreviewMode],
  )

  return (
    <>
      <div className="rounded-2xl border-2 border-amber-300 bg-[#fff9df] p-4">
        <p className="text-xs font-black uppercase tracking-wider text-amber-800">Storybook Chapter Template</p>
        <p className="mt-1 text-sm text-amber-950">Một chapter gồm bìa / trang trái, nội dung truyện, bảng 9 sticker ở trang phải và quà hoàn thành. Không dùng layer / slot của reward.</p>
      </div>
      <div>
        <div className="flex items-end justify-between gap-3">
          <div><h4 className="font-extrabold">Chọn theme giống frontend</h4><p className="text-xs text-muted">Chọn mẫu có sẵn rồi thay từng ảnh hoặc màu nếu cần.</p></div>
          <button type="button" onClick={() => setForm((current) => ({ ...current, chapterTheme: 'custom' }))} className={`min-h-10 rounded-xl px-3 text-xs font-extrabold ${form.chapterTheme === 'custom' ? 'bg-brand-600 text-white' : 'bg-white text-brand-700'}`}>Tự thiết kế</button>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          {storybookThemePresets.map((theme) => (
            <button key={theme.key} type="button" onClick={() => setForm((current) => ({
              ...current,
              chapterTheme: theme.key,
              chapterEmoji: theme.emoji,
              chapterColorStart: theme.colors[0],
              chapterColorEnd: theme.colors[1],
              chapterCoverUrl: theme.coverUrl,
              chapterLeftBackgroundUrl: theme.leftBackgroundUrl,
              chapterStickerPageUrl: theme.stickerPageUrl,
              chapterStickerSheetUrl: theme.stickerSheetUrl,
            }))} className={`overflow-hidden rounded-2xl border-2 text-left ${form.chapterTheme === theme.key ? 'border-brand-500 bg-brand-50' : 'border-border bg-white'}`}>
              <span className="flex aspect-[4/3] items-center justify-center bg-cover bg-center text-3xl" style={theme.coverUrl ? { backgroundImage: `url("${theme.coverUrl}")` } : { background: `linear-gradient(145deg, ${theme.colors[0]}, ${theme.colors[1]})` }}>{theme.coverUrl ? '' : theme.emoji}</span>
              <span className="block truncate px-2 py-2 text-[11px] font-extrabold">{theme.label}</span>
            </button>
          ))}
        </div>
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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {([
          ['cover', 'Ảnh bìa chapter', 'Tỉ lệ 4:3 · Chuẩn 1600×1200 px (hoặc 960×716)', form.chapterCoverUrl],
          ['left', 'Background trang trái', 'Tỉ lệ 4:3 · Chuẩn 1600×1200 px (hoặc 960×716)', form.chapterLeftBackgroundUrl],
          ['stickerPage', 'Nền trang sticker', 'Tỉ lệ 4:3 · Chuẩn 1600×1200 px (texture sáng)', form.chapterStickerPageUrl],
          ['stickerSheet', 'Sheet 9 sticker', 'Tỉ lệ 1:1 vuông · Chuẩn 1200×1200 px (lưới 3×3)', form.chapterStickerSheetUrl],
        ] as const).map(([target, label, hint, url]) => (
          <label id={`chapter-editor-${target}`} key={target} className="scroll-mt-6 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-amber-300 bg-white p-3 text-center hover:border-amber-500">
            <span className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-amber-50">
              {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <span className="text-4xl">🖼️</span>}
            </span>
            <span className="mt-2 block text-sm font-extrabold">{chapterUploading === target ? 'Đang tải…' : label}</span>
            <span className="block text-[10px] text-muted">{hint}</span>
            <input type="file" accept=".png,.webp,.jpg,.jpeg,.svg" className="sr-only" disabled={Boolean(chapterUploading)} onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void onUploadChapterMedia(file, target)
            }} />
          </label>
        ))}
      </div>
      <div>
        <h4 className="font-extrabold">Ảnh button và điều hướng</h4>
        <p className="text-xs text-muted">Không bắt buộc. Nếu để trống, frontend dùng button chuẩn của hệ thống.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {([
            ['chapterButton', 'Tab Nội dung', form.chapterButtonUrl],
            ['stickerButton', 'Tab Sticker', form.stickerButtonUrl],
            ['helpButton', 'Nút trợ giúp', form.helpButtonUrl],
            ['claimButton', 'Nút nhận quà', form.claimButtonUrl],
            ['previousButton', 'Nút chương trước', form.previousButtonUrl],
            ['nextButton', 'Nút chương sau', form.nextButtonUrl],
          ] as const).map(([target, label, url]) => (
            <label key={target} className="cursor-pointer rounded-2xl border-2 border-dashed border-sky-200 bg-white p-3">
              <span className="flex h-16 items-center justify-center overflow-hidden rounded-xl bg-sky-50">
                {url ? <img src={url} alt="" className="h-full w-full object-contain" /> : <span className="rounded-xl bg-white px-4 py-2 text-xs font-extrabold shadow-sm">{label}</span>}
              </span>
              <span className="mt-2 block text-center text-xs font-extrabold">{chapterUploading === target ? 'Đang tải…' : `Thay ${label.toLowerCase()}`}</span>
              <input type="file" accept=".png,.webp,.jpg,.jpeg,.svg" className="sr-only" disabled={Boolean(chapterUploading)} onChange={(event) => { const file = event.target.files?.[0]; if (file) void onUploadChapterMedia(file, target) }} />
            </label>
          ))}
        </div>
      </div>
      <label className="block text-sm font-bold">Lời kể của chapter
        <textarea required className={`${fieldClass} min-h-36 py-3`} placeholder="Đoạn dẫn truyện hiển thị trên trang trái…" value={form.chapterStory} onChange={(event) => setForm({ ...form, chapterStory: event.target.value })} />
      </label>
      <label className="block text-sm font-bold">Reward hoàn thành chapter
        <select className={fieldClass} value={form.chapterRewardId} onChange={(event) => setForm({ ...form, chapterRewardId: event.target.value })}>
          <option value="">Không gắn reward (Tùy chọn)</option>
          {form.chapterRewardId && !items.some((item) => item.contentType === 'reward' && item.code === form.chapterRewardId) && (
            <option value={form.chapterRewardId}>{form.chapterRewardId} (Hiện tại)</option>
          )}
          {(items.some((item) => item.contentType === 'reward')
            ? items.filter((item) => item.contentType === 'reward')
            : legacyRewardStudioItems([])
          ).map((item) => (
            <option key={item.id} value={item.code}>
              {item.name} · {item.code}{item.status !== 'published' ? ` (${item.status})` : ''}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-[10px] text-muted">Boss sticker sẽ cấp reward này sau khi đủ 8 sticker thường. Không bắt buộc nếu chapter chỉ dùng sticker S9.</span>
      </label>
      <div id="chapter-editor-stickers" className="scroll-mt-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h4 className="font-extrabold">9 sticker và khuôn placeholder</h4>
            <p className="text-xs text-muted">CMS tự lấy ảnh thật từ sheet 3×3 của chapter. Upload PNG / SVG chỉ khi muốn ghi đè riêng một sticker hoặc khuôn.</p>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900">{form.chapterStickerSheetUrl ? '9/9 có ảnh từ sheet' : `${chapterStickers.filter((sticker) => sticker.imageUrl).length}/9 có ảnh`}</span>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {chapterStickers.map((sticker, index) => (
            <article key={sticker.id || index} className={`rounded-2xl border-2 bg-white p-4 ${sticker.boss ? 'border-violet-300' : 'border-amber-200'}`}>
              <div className="flex items-center justify-between">
                <p className="font-extrabold">{sticker.boss ? '🏆 Boss sticker' : `Sticker ${index + 1}`}</p>
                <code className="text-[10px] text-muted">{sticker.id}</code>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-2 text-center">
                  <span className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                    <ChapterStickerArtwork sticker={sticker} index={index} sheetUrl={form.chapterStickerSheetUrl} locked />
                  </span>
                  <span className="mt-1 block text-[10px] font-bold">{chapterUploading === `sticker-${index}-placeholder` ? 'Đang tải…' : sticker.placeholderUrl ? 'Khuôn riêng · bấm để thay' : 'Khuôn từ sheet · bấm để thay'}</span>
                  <input type="file" accept=".png,.webp,.svg" className="sr-only" disabled={Boolean(chapterUploading)} onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void onUploadChapterMedia(file, index, true)
                  }} />
                </label>
                <label className="cursor-pointer rounded-xl border-2 border-dashed border-emerald-300 p-2 text-center">
                  <span className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-emerald-50">
                    <ChapterStickerArtwork sticker={sticker} index={index} sheetUrl={form.chapterStickerSheetUrl} />
                  </span>
                  <span className="mt-1 block text-[10px] font-bold">{chapterUploading === `sticker-${index}-art` ? 'Đang tải…' : sticker.imageUrl ? 'Ảnh riêng · bấm để thay' : 'Ảnh từ sheet · bấm để thay'}</span>
                  <input type="file" accept=".png,.webp,.svg" className="sr-only" disabled={Boolean(chapterUploading)} onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void onUploadChapterMedia(file, index)
                  }} />
                </label>
              </div>
              <input className={`${fieldClass} min-h-10 text-sm`} value={sticker.name} onChange={(event) => updateChapterSticker(index, { name: event.target.value })} aria-label={`Tên sticker ${index + 1}`} />
              {sticker.boss ? (
                <div className="mt-2 rounded-xl bg-violet-50 p-3 text-xs text-violet-900">
                  <strong>Điều kiện hệ thống:</strong> tự động claim sau khi trẻ có đủ 8 sticker thường của chapter.
                </div>
              ) : (
                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-brand-600">Điều kiện máy thực thi</p>
                  <div className="grid gap-2 sm:grid-cols-[1fr_100px]">
                    <select
                      className={`${fieldClass} min-h-10 text-sm`}
                      value={sticker.unlockRule?.metric || 'lessons_completed'}
                      onChange={(event) => {
                        const metric = event.target.value
                        const definition = stickerMetrics.find((item) => item.value === metric)
                        const target = sticker.unlockRule?.target || 1
                        updateChapterSticker(index, {
                          unlockRule: { metric, operator: 'gte', target },
                          hint: `Đạt ${target} ${definition?.unit || ''} ${definition?.label.toLowerCase() || ''}`.trim(),
                        })
                      }}
                      aria-label={`Metric sticker ${index + 1}`}
                    >
                      {stickerMetrics.map((metric) => <option key={metric.value} value={metric.value}>{metric.label} · {metric.source}</option>)}
                    </select>
                    <input
                      type="number"
                      min={1}
                      className={`${fieldClass} min-h-10 text-sm`}
                      value={sticker.unlockRule?.target || 1}
                      onChange={(event) => {
                        const target = Math.max(1, Number(event.target.value))
                        const metric = sticker.unlockRule?.metric || 'lessons_completed'
                        const definition = stickerMetrics.find((item) => item.value === metric)
                        updateChapterSticker(index, {
                          unlockRule: { metric, operator: 'gte', target },
                          hint: `Đạt ${target} ${definition?.unit || ''} ${definition?.label.toLowerCase() || ''}`.trim(),
                        })
                      }}
                      aria-label={`Mục tiêu sticker ${index + 1}`}
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-muted">Nguồn được đồng bộ tự động; rule dùng phép so sánh ≥.</p>
                </div>
              )}
              <label className="mt-2 block text-[10px] font-bold text-muted">Mô tả cho trẻ
                <input className={`${fieldClass} min-h-10 text-sm`} value={sticker.hint} onChange={(event) => updateChapterSticker(index, { hint: event.target.value })} aria-label={`Điều kiện sticker ${index + 1}`} />
              </label>
            </article>
          ))}
        </div>
        <details className="mt-3 rounded-xl border border-border p-3">
          <summary className="cursor-pointer text-xs font-bold">JSON nâng cao của sticker</summary>
          <textarea required className={`${fieldClass} min-h-64 py-3 font-mono text-xs`} value={form.chapterStickersJson} onChange={(event) => setForm({ ...form, chapterStickersJson: event.target.value })} />
        </details>
      </div>
    </>
  )
}
