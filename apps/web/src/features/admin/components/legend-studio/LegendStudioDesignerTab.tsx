import { useMemo, useState, type FormEvent } from 'react'
import { AlertTriangle, ArrowDown, ArrowUp, Gift, Pencil, Plus, Settings2, Trash2, UploadCloud } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { BookSpread } from '@/features/storybook/components/BookSpread'
import type { StorybookPage } from '@/features/storybook/storybook-data'
import { ACHIEVEMENT_METRIC_REGISTRY, achievementEvolutionTier } from '@/features/achievements/achievement-config'
import { uploadCmsImage } from '@/shared/lib/media-api'
import type { AssetSpec, ChapterStickerItem, ContentType, RewardKind, StudioFormState, StudioItem } from './types'
import {
  assetDimensionLabel,
  achievementFamilyLabel,
  achievementFamilyLabels,
  displayTemplate,
  emptyForm,
  isAssetDimensionValid,
  kindOptions,
  studioAssetPreviewKind,
} from './constants'
import { LegendStudioChapterEditor } from './LegendStudioChapterEditor'

export interface LegendStudioDesignerTabProps {
  form: StudioFormState
  setForm: React.Dispatch<React.SetStateAction<StudioFormState>>
  editingItem: StudioItem | null
  setEditingItem: (item: StudioItem | null) => void
  busy: boolean
  onSubmit: (event: FormEvent) => void
  fieldClass: string
  selectedSpec: AssetSpec
  items: StudioItem[]
  setMessage: (msg: string) => void
  onCancel: () => void
  message: string
}

export function LegendStudioDesignerTab({
  form,
  setForm,
  editingItem,
  setEditingItem,
  busy,
  onSubmit,
  fieldClass,
  selectedSpec,
  items,
  setMessage,
  onCancel,
  message,
}: LegendStudioDesignerTabProps) {
  const [uploading, setUploading] = useState(false)
  const [thumbnailUploading, setThumbnailUploading] = useState(false)
  const [assetInfo, setAssetInfo] = useState('')
  const [assetUploadError, setAssetUploadError] = useState('')
  const [thumbnailUploadError, setThumbnailUploadError] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [chapterUploading, setChapterUploading] = useState('')
  const [milestoneUploading, setMilestoneUploading] = useState<number | null>(null)
  const [storybookPreviewMode, setStorybookPreviewMode] = useState<'locked' | 'complete'>('locked')

  const chapterStickers = useMemo<ChapterStickerItem[]>(() => {
    try {
      return JSON.parse(form.chapterStickersJson) as ChapterStickerItem[]
    } catch {
      return []
    }
  }, [form.chapterStickersJson])

  const chapterPreviewPage: StorybookPage = {
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
  }

  const chapterPreviewEarned = new Set(storybookPreviewMode === 'complete' ? chapterStickers.map((sticker) => sticker.id) : [])

  const achievementMilestones = useMemo(() => {
    try {
      return JSON.parse(form.achievementMilestonesJson) as Array<{
        label: string; description?: string; metric?: string; operator?: string; threshold: number
        imageUrl?: string; points?: number; rewardLabel?: string; rewardAssetId?: string
      }>
    } catch { return [] }
  }, [form.achievementMilestonesJson])

  const setAchievementMilestones = (milestones: typeof achievementMilestones) => {
    setForm((current) => ({ ...current, achievementMilestonesJson: JSON.stringify(milestones, null, 2) }))
  }

  const updateAchievementMilestone = (index: number, patch: Partial<(typeof achievementMilestones)[number]>) => {
    setAchievementMilestones(achievementMilestones.map((milestone, position) => position === index ? { ...milestone, ...patch } : milestone))
  }

  const updateChapterSticker = (index: number, patch: Record<string, unknown>) => {
    const stickers = [...chapterStickers]
    stickers[index] = { ...stickers[index], ...patch }
    setForm((current) => ({ ...current, chapterStickersJson: JSON.stringify(stickers, null, 2) }))
  }

  const inspectAsset = async (file: File) => {
    if (form.contentType !== 'reward') {
      const allowed = ['image/png', 'image/webp', 'image/jpeg', 'application/json', 'video/webm']
      if (!allowed.includes(file.type)) throw new Error('Chapter / Event chỉ nhận PNG, WebP, JPG, JSON hoặc WebM.')
      if (file.size > 6 * 1024 * 1024) throw new Error('Asset Chapter / Event tối đa 6 MB.')
      return `${file.name} · ${(file.size / 1024).toFixed(0)} KB · định dạng hợp lệ`
    }
    const spec = selectedSpec
    const acceptedFormats = spec.formats.map((format) => format.split('/')[1].toUpperCase()).join(', ')
    const actualFormat = file.type || file.name.split('.').pop()?.toUpperCase() || 'không xác định'
    if (!spec.formats.includes(file.type)) {
      throw new Error(`Sai định dạng: file đang là ${actualFormat}. ${spec.label} chỉ nhận ${acceptedFormats}.`)
    }
    if (file.size > spec.maxMb * 1024 * 1024) {
      throw new Error(`File quá lớn: ${(file.size / 1024 / 1024).toFixed(2)} MB. ${spec.label} cho phép tối đa ${spec.maxMb} MB.`)
    }
    if (!file.type.startsWith('image/')) {
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
        reject(new Error(`Không đọc được ảnh hoặc file đã hỏng. Hãy xuất lại ${acceptedFormats} với ${assetDimensionLabel(spec)}.`))
      }
      image.src = objectUrl
    })
    if (!isAssetDimensionValid(spec, dimensions.width, dimensions.height)) {
      throw new Error(`Sai kích thước ${dimensions.width}×${dimensions.height}px. Template ${spec.label} yêu cầu ${assetDimensionLabel(spec)}.`)
    }
    if (spec.transparent && !dimensions.hasTransparency) {
      throw new Error(`Ảnh ${dimensions.width}×${dimensions.height}px đúng size nhưng không có nền trong suốt. ${spec.label} bắt buộc transparency để ghép layer.`)
    }
    return `${file.name} · ${dimensions.width}×${dimensions.height}px · ${(file.size / 1024).toFixed(0)} KB · đạt chuẩn`
  }

  const uploadAsset = async (file: File) => {
    setUploading(true)
    setMessage('')
    setAssetUploadError('')
    try {
      const inspection = await inspectAsset(file)
      setAssetInfo(inspection)
      const asset = await uploadCmsImage({ file, purpose: 'legend_reward_design' })
      setForm((current) => ({ ...current, assetUrl: asset.url }))
      setPreviewUrl(asset.url)
      setMessage('Asset đạt chuẩn và đã tải lên StoryMee Media. Preview đã được cập nhật.')
    } catch (error) {
      setAssetInfo('')
      setPreviewUrl('')
      const reason = error instanceof Error ? error.message : 'Không tải được asset.'
      setAssetUploadError(reason)
      setMessage(`${reason} File chưa được upload; version vẫn đang dùng asset cũ.`)
    } finally {
      setUploading(false)
    }
  }

  const uploadThumbnail = async (file: File) => {
    setThumbnailUploading(true)
    setThumbnailUploadError('')
    try {
      const allowed = ['image/png', 'image/webp', 'image/jpeg', 'image/svg+xml']
      if (!allowed.includes(file.type)) throw new Error('Ảnh icon / preview chỉ nhận file PNG, WebP, JPG hoặc SVG.')
      if (file.size > 3 * 1024 * 1024) throw new Error('Ảnh icon / preview cho phép tối đa 3 MB.')
      const asset = await uploadCmsImage({ file, purpose: 'legend_reward_thumbnail' })
      setForm((current) => ({ ...current, thumbnailUrl: asset.url }))
      setMessage('Đã tải ảnh icon / preview đại diện thành công.')
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Không tải được ảnh icon / preview.'
      setThumbnailUploadError(reason)
      setMessage(reason)
    } finally {
      setThumbnailUploading(false)
    }
  }

  const uploadChapterMedia = async (
    file: File,
    target: 'cover' | 'left' | 'stickerPage' | 'stickerSheet' | 'chapterButton' | 'stickerButton' | 'helpButton' | 'claimButton' | 'previousButton' | 'nextButton' | number,
    placeholder = false,
  ) => {
    const allowed = ['image/png', 'image/webp', 'image/jpeg', 'image/svg+xml']
    if (!allowed.includes(file.type)) { setMessage('Ảnh Storybook chỉ nhận PNG, WebP, JPG hoặc SVG.'); return }
    if (file.size > 4 * 1024 * 1024) { setMessage('Mỗi ảnh Storybook tối đa 4 MB.'); return }
    const key = typeof target === 'number' ? `sticker-${target}-${placeholder ? 'placeholder' : 'art'}` : target
    setChapterUploading(key)
    setMessage('')
    try {
      const asset = await uploadCmsImage({ file, purpose: 'storybook_chapter_design' })
      if (target === 'cover') setForm((current) => ({ ...current, chapterCoverUrl: asset.url }))
      else if (target === 'left') setForm((current) => ({ ...current, chapterLeftBackgroundUrl: asset.url }))
      else if (target === 'stickerPage') setForm((current) => ({ ...current, chapterStickerPageUrl: asset.url }))
      else if (target === 'stickerSheet') setForm((current) => ({ ...current, chapterStickerSheetUrl: asset.url }))
      else if (target === 'chapterButton') setForm((current) => ({ ...current, chapterButtonUrl: asset.url }))
      else if (target === 'stickerButton') setForm((current) => ({ ...current, stickerButtonUrl: asset.url }))
      else if (target === 'helpButton') setForm((current) => ({ ...current, helpButtonUrl: asset.url }))
      else if (target === 'claimButton') setForm((current) => ({ ...current, claimButtonUrl: asset.url }))
      else if (target === 'previousButton') setForm((current) => ({ ...current, previousButtonUrl: asset.url }))
      else if (target === 'nextButton') setForm((current) => ({ ...current, nextButtonUrl: asset.url }))
      else {
        setForm((current) => {
          const stickers = JSON.parse(current.chapterStickersJson) as Array<Record<string, unknown>>
          stickers[target] = { ...stickers[target], [placeholder ? 'placeholderUrl' : 'imageUrl']: asset.url }
          return { ...current, chapterStickersJson: JSON.stringify(stickers, null, 2) }
        })
      }
      setMessage('Đã tải ảnh Storybook và cập nhật preview.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không tải được ảnh Storybook.')
    } finally {
      setChapterUploading('')
    }
  }

  const uploadMilestoneImage = async (file: File, index: number) => {
    if (!['image/png', 'image/webp', 'image/jpeg', 'image/svg+xml'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setMessage('Ảnh mốc tiến hoá chỉ nhận PNG, WebP, JPG hoặc SVG và tối đa 2 MB.')
      return
    }
    setMilestoneUploading(index)
    try {
      const asset = await uploadCmsImage({ file, purpose: 'achievement_milestone_design' })
      updateAchievementMilestone(index, { imageUrl: asset.url })
      setMessage(`Đã cập nhật ảnh cho mốc ${index + 1}.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không tải được ảnh mốc tiến hoá.')
    } finally { setMilestoneUploading(null) }
  }

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(520px,640px)]">
      <form onSubmit={onSubmit} className="ui-card order-2 space-y-5 p-5 xl:order-1">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-brand-600">{editingItem ? `Đang sửa ${editingItem.code}` : 'Tạo cấu hình mới'}</p>
          <h2 className="font-display text-2xl">{editingItem ? editingItem.name : 'Thiết kế nội dung'}</h2>
          <p className="text-sm text-muted">{editingItem?.status === 'published' || editingItem?.status === 'retired' ? 'Bản đã phát hành là bất biến. Khi lưu, hệ thống tạo một version nháp mới cùng mã.' : editingItem ? 'Các thay đổi sẽ cập nhật version chưa phát hành hiện tại.' : 'Mỗi nhóm thông tin được tách riêng để dễ kiểm tra trước khi lưu.'}</p>
        </div>

        <section className="space-y-4 rounded-3xl border border-border bg-slate-50/70 p-4">
          <h3 className="font-extrabold">1. Thông tin cơ bản</h3>
          <label className="block text-sm font-bold">Loại nội dung
            <select disabled={Boolean(editingItem)} className={fieldClass} value={form.contentType} onChange={(event) => setForm({ ...form, contentType: event.target.value as ContentType })}>
              <option value="reward">Reward / vật phẩm</option><option value="achievement">Achievement tiến hoá</option><option value="chapter">Chapter Storybook</option><option value="event">Sự kiện</option>
            </select>
          </label>
          <div className={`grid gap-3 ${form.contentType === 'reward' ? 'sm:grid-cols-2' : ''}`}>
            <label className="text-sm font-bold">Mã định danh
              <input required minLength={3} disabled={Boolean(editingItem)} className={fieldClass} placeholder={form.contentType === 'reward' ? 'frame-galaxy' : form.contentType === 'chapter' ? 'P09' : 'summer-creative-2026'} value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
              {editingItem && <span className="mt-1 block text-xs text-muted">Mã được giữ cố định để bảo toàn liên kết inventory.</span>}
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
            {form.contentType === 'reward' ? '2. Asset reward' : form.contentType === 'achievement' ? '2. Các mốc tiến hoá' : form.contentType === 'chapter' ? '2. Nội dung cuốn sách' : '2. Nội dung sự kiện'}
          </h3>
          {form.contentType === 'chapter' && (
            <LegendStudioChapterEditor
              form={form}
              setForm={setForm}
              fieldClass={fieldClass}
              chapterUploading={chapterUploading}
              onUploadChapterMedia={uploadChapterMedia}
              chapterStickers={chapterStickers}
              updateChapterSticker={updateChapterSticker}
              items={items}
              storybookPreviewMode={storybookPreviewMode}
              setStorybookPreviewMode={setStorybookPreviewMode}
            />
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
          {form.contentType === 'achievement' && (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-brand-200 bg-brand-50 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-brand-700">Một danh hiệu · nhiều hình thái</p>
                <p className="mt-1 text-sm text-brand-950">Mỗi mốc bên dưới là một cấp tiến hoá của cùng danh hiệu. Trẻ giữ tiến độ liên tục; khi đạt ngưỡng mới, ảnh, mô tả và quà của mốc đó được mở.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-bold">Nhóm danh hiệu
                  <select className={fieldClass} value={form.achievementCategory} onChange={(event) => setForm({ ...form, achievementCategory: event.target.value })}>
                    {Object.entries(achievementFamilyLabels).filter(([key]) => key !== 'other').map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </select>
                </label>
                <label className="text-sm font-bold">Action / metric theo dõi
                  <select required className={fieldClass} value={form.achievementMetric} onChange={(event) => {
                    const metric = event.target.value
                    setForm((current) => ({
                      ...current,
                      achievementMetric: metric,
                      achievementMilestonesJson: JSON.stringify(achievementMilestones.map((milestone) => ({ ...milestone, metric })), null, 2),
                    }))
                  }}>
                    {ACHIEVEMENT_METRIC_REGISTRY.map((metric) => <option key={metric.value} value={metric.value}>{metric.label} · {metric.unit} · {metric.source}</option>)}
                  </select>
                  <span className="mt-1 block text-xs text-muted">Chọn dữ liệu hệ thống cần đếm. Metric này dùng chung cho toàn bộ các mốc của danh hiệu.</span>
                </label>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h4 className="font-extrabold">Lộ trình tiến hoá</h4><p className="text-xs text-muted">Sắp xếp từ ngưỡng thấp đến cao. Mỗi mốc cần ảnh và requirement riêng.</p></div>
                <Button type="button" variant="secondary" onClick={() => setAchievementMilestones([...achievementMilestones, { label: achievementEvolutionTier(achievementMilestones.length).label, description: '', metric: form.achievementMetric, operator: 'gte', threshold: (achievementMilestones.at(-1)?.threshold ?? 0) + 1, imageUrl: '', points: 10, rewardLabel: '', rewardAssetId: '' }])}><Plus className="h-4 w-4" aria-hidden="true" /> Thêm mốc</Button>
              </div>
              <div className="space-y-3">
                {achievementMilestones.map((milestone, index) => (
                  <article key={`${index}-${milestone.label}`} className="grid gap-4 rounded-2xl border-2 border-slate-200 bg-white p-4 md:grid-cols-[140px_1fr]">
                    <label className="cursor-pointer text-center">
                      <span className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50">
                        {milestone.imageUrl ? <img src={milestone.imageUrl} alt={`Mốc ${index + 1}: ${milestone.label}`} className="h-full w-full object-contain" /> : <Gift className="h-10 w-10 text-brand-400" aria-hidden="true" />}
                      </span>
                      <span className="mt-2 block text-xs font-extrabold text-brand-700">{milestoneUploading === index ? 'Đang tải…' : milestone.imageUrl ? 'Thay ảnh mốc' : 'Tải ảnh mốc'}</span>
                      <span className="block text-[10px] text-muted">PNG/WebP/SVG · ≤ 2 MB</span>
                      <input type="file" accept=".png,.webp,.jpg,.jpeg,.svg" className="sr-only" disabled={milestoneUploading !== null} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadMilestoneImage(file, index) }} />
                    </label>
                    <div className="min-w-0 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-black text-white">{index + 1}</span>
                        <div className="min-h-12 flex-1 rounded-xl border-2 border-brand-200 bg-brand-50 px-4 py-3">
                          <strong className="text-brand-900">{achievementEvolutionTier(index).label}</strong>
                          <span className="ml-2 text-xs font-bold text-brand-600">Cấp tiến hoá dùng chung</span>
                        </div>
                        <button type="button" className="rounded-lg p-2 text-muted hover:bg-slate-100 disabled:opacity-30" disabled={index === 0} onClick={() => { const next = [...achievementMilestones]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; setAchievementMilestones(next) }} aria-label="Đưa mốc lên"><ArrowUp className="h-4 w-4" /></button>
                        <button type="button" className="rounded-lg p-2 text-muted hover:bg-slate-100 disabled:opacity-30" disabled={index === achievementMilestones.length - 1} onClick={() => { const next = [...achievementMilestones]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; setAchievementMilestones(next) }} aria-label="Đưa mốc xuống"><ArrowDown className="h-4 w-4" /></button>
                        <button type="button" className="rounded-lg p-2 text-danger hover:bg-coral-50 disabled:opacity-30" disabled={achievementMilestones.length === 1} onClick={() => setAchievementMilestones(achievementMilestones.filter((_, position) => position !== index))} aria-label="Xoá mốc"><Trash2 className="h-4 w-4" /></button>
                      </div>
                      <textarea required className={`${fieldClass} min-h-20 py-3`} aria-label={`Mô tả mốc ${index + 1}`} value={milestone.description ?? ''} onChange={(event) => updateAchievementMilestone(index, { description: event.target.value })} placeholder="Mô tả hình thái và lời chúc khi trẻ đạt mốc…" />
                      <div className="grid gap-3 sm:grid-cols-[1fr_150px_110px]">
                        <div className="rounded-xl bg-slate-50 p-3 text-xs"><strong>{ACHIEVEMENT_METRIC_REGISTRY.find((metric) => metric.value === form.achievementMetric)?.label}</strong><span className="mt-1 block text-muted">Metric: <code>{form.achievementMetric}</code></span></div>
                        <label className="text-xs font-bold">Điều kiện<select className={`${fieldClass} min-h-10 text-sm`} value={milestone.operator ?? 'gte'} onChange={(event) => updateAchievementMilestone(index, { operator: event.target.value })}><option value="gte">≥ đạt ít nhất</option><option value="eq">= đúng bằng</option></select></label>
                        <label className="text-xs font-bold">Ngưỡng<input required type="number" min={1} className={`${fieldClass} min-h-10 text-sm`} value={milestone.threshold} onChange={(event) => updateAchievementMilestone(index, { threshold: Math.max(1, Number(event.target.value)) })} /></label>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <label className="text-xs font-bold">Điểm thưởng<input type="number" min={0} className={`${fieldClass} min-h-10 text-sm`} value={milestone.points ?? 0} onChange={(event) => updateAchievementMilestone(index, { points: Math.max(0, Number(event.target.value)) })} /></label>
                        <label className="text-xs font-bold">Tên quà (tuỳ chọn)<input className={`${fieldClass} min-h-10 text-sm`} value={milestone.rewardLabel ?? ''} onChange={(event) => updateAchievementMilestone(index, { rewardLabel: event.target.value })} /></label>
                        <label className="text-xs font-bold">Reward asset ID<input className={`${fieldClass} min-h-10 text-sm`} value={milestone.rewardAssetId ?? ''} onChange={(event) => updateAchievementMilestone(index, { rewardAssetId: event.target.value })} /></label>
                      </div>
                      <p className="rounded-xl bg-mint-50 px-3 py-2 text-xs font-bold text-emerald-900">Khi {form.achievementMetric} {milestone.operator === 'eq' ? '=' : '≥'} {milestone.threshold} → mở “{achievementEvolutionTier(index).label}”{milestone.points ? ` +${milestone.points} điểm` : ''}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
          {form.contentType === 'reward' && (
            <label className="block text-sm font-bold">Loại vật phẩm
              <select className={fieldClass} value={form.kind} onChange={(event) => {
                const kind = event.target.value as RewardKind
                setForm({ ...form, kind, displayJson: displayTemplate(kind), assetUrl: '' })
                setPreviewUrl('')
                setAssetInfo('')
                setAssetUploadError('')
              }}>
                {kindOptions.map((kind) => <option key={kind} value={kind}>{selectedSpec.label}</option>)}
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
                <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-brand-700">{assetDimensionLabel(selectedSpec)}</span>
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
          {form.contentType !== 'chapter' && form.contentType !== 'achievement' && (
            <label className="block min-h-40 cursor-pointer rounded-2xl border-2 border-dashed border-brand-400 bg-white p-8 text-center shadow-sm hover:border-brand-600 hover:bg-brand-50/30">
              <UploadCloud className="mx-auto h-9 w-9 text-brand-600" aria-hidden="true" />
              <span className="mt-3 block text-base font-extrabold">{uploading ? 'Đang kiểm tra và tải lên…' : editingItem ? 'Tải asset mới cho version này' : 'Chọn file đúng template để preview'}</span>
              <span className="mt-1 block text-sm text-muted">{form.contentType === 'reward' ? `${assetDimensionLabel(selectedSpec)} · tối đa ${selectedSpec.maxMb} MB` : 'PNG, WebP, JPG, JSON hoặc WebM'}</span>
              <input type="file" accept={form.contentType === 'reward' ? selectedSpec.formats.join(',') : '.png,.webp,.jpg,.jpeg,.svg,.json,.webm'} className="sr-only" disabled={uploading} onChange={(event) => {
                const file = event.target.files?.[0]
                event.currentTarget.value = ''
                if (file) void uploadAsset(file)
              }} />
            </label>
          )}
          {form.contentType !== 'chapter' && form.contentType !== 'achievement' && assetUploadError && (
            <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 text-rose-900" role="alert" aria-live="assertive">
              <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /><div><p className="font-extrabold">Upload chưa thành công</p><p className="mt-1 text-sm font-bold">{assetUploadError}</p></div></div>
              {form.contentType === 'reward' && <p className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-xs font-bold">Yêu cầu: {selectedSpec.formats.map((format) => format.split('/')[1].toUpperCase()).join(' / ')} · {assetDimensionLabel(selectedSpec)} · tối đa {selectedSpec.maxMb} MB · {selectedSpec.transparent ? 'nền trong suốt' : 'không bắt buộc nền trong suốt'}.</p>}
              <p className="mt-2 text-xs font-semibold">File chưa được đưa lên Storage. Chọn lại file sau khi sửa; bạn có thể chọn lại chính file vừa chọn.</p>
            </div>
          )}
          {form.contentType !== 'chapter' && form.contentType !== 'achievement' && !assetUploadError && message.includes('đã tải lên') && (
            <p className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800" role="status" aria-live="polite">✓ {message}</p>
          )}
          {form.contentType !== 'chapter' && form.contentType !== 'achievement' && assetInfo && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">✓ {assetInfo}</p>}
          {form.contentType !== 'chapter' && form.contentType !== 'achievement' && <p className="break-all rounded-xl bg-white p-3 text-xs text-muted">{form.assetUrl || 'Chưa có URL asset — preview tạm sẽ xuất hiện ngay khi chọn file.'}</p>}
          {form.contentType !== 'chapter' && form.contentType !== 'achievement' && (
            <div className="rounded-2xl border border-brand-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-extrabold text-brand-900">Ảnh icon / preview đại diện (Thumbnail)</h4>
                  <p className="text-xs text-muted">Hiển thị trong Ba lô, danh mục phần thưởng và cây mở khóa.</p>
                </div>
                {form.thumbnailUrl && (
                  <button type="button" onClick={() => setForm((curr) => ({ ...curr, thumbnailUrl: '' }))} className="text-xs font-bold text-danger hover:underline">
                    Xóa icon riêng (dùng ảnh chính)
                  </button>
                )}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner">
                  {form.thumbnailUrl || form.assetUrl ? (
                    <img src={form.thumbnailUrl || form.assetUrl} alt="Thumbnail preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl">🎁</span>
                  )}
                </div>
                <label className="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-brand-300 bg-white px-4 text-xs font-extrabold text-brand-700 shadow-sm transition hover:bg-brand-50">
                  <UploadCloud className="h-4 w-4" aria-hidden="true" />
                  <span>{thumbnailUploading ? 'Đang tải icon…' : form.thumbnailUrl ? 'Thay đổi ảnh icon / preview' : 'Tải ảnh icon / preview riêng (512×512)'}</span>
                  <input
                    type="file"
                    accept=".png,.webp,.jpg,.jpeg,.svg"
                    className="sr-only"
                    disabled={thumbnailUploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      event.currentTarget.value = ''
                      if (file) void uploadThumbnail(file)
                    }}
                  />
                </label>
              </div>
              {thumbnailUploadError && <p className="mt-2 text-xs font-bold text-danger">{thumbnailUploadError}</p>}
            </div>
          )}
        </section>

        {form.contentType !== 'achievement' && (
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
        )}

        {form.contentType !== 'chapter' && form.contentType !== 'achievement' && (
          <details className="rounded-3xl border border-border bg-slate-50/70 p-4">
            <summary className="cursor-pointer font-extrabold">4. Cấu hình nâng cao (JSON)</summary>
            <label className="mt-4 block text-xs font-bold">Display JSON
              <textarea className={`${fieldClass} min-h-40 py-3 font-mono text-xs`} value={form.displayJson} onChange={(event) => setForm({ ...form, displayJson: event.target.value })} />
            </label>
            <label className="mt-3 block text-xs font-bold">Chapter / Event JSON
              <textarea className={`${fieldClass} min-h-32 py-3 font-mono text-xs`} value={form.contentJson} onChange={(event) => setForm({ ...form, contentJson: event.target.value })} />
            </label>
          </details>
        )}
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => { setEditingItem(null); setForm(emptyForm()); setPreviewUrl(''); setAssetInfo(''); setAssetUploadError(''); setThumbnailUploadError(''); setMessage(''); onCancel() }} className="flex-1">Hủy</Button>
          <Button type="submit" disabled={busy || uploading || thumbnailUploading || Boolean(assetUploadError)} className="flex-[2]">{assetUploadError ? 'Sửa lỗi upload trước khi lưu' : editingItem?.status === 'published' || editingItem?.status === 'retired' ? 'Lưu thành bản nháp mới' : editingItem ? 'Lưu thay đổi bản nháp' : 'Lưu bản nháp'}</Button>
        </div>
      </form>

      <aside className="ui-card order-1 space-y-4 p-5 xl:order-2 xl:sticky xl:top-5">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-brand-600">Preview trực tiếp</p>
          <h2 className="font-display text-xl">Trẻ sẽ nhìn thấy</h2>
        </div>
        {form.contentType === 'chapter' ? (
          <div className="space-y-3">
            <div className="flex rounded-xl border border-border bg-slate-50 p-1" role="group" aria-label="Trạng thái preview Storybook">
              <button type="button" onClick={() => setStorybookPreviewMode('locked')} className={`min-h-10 flex-1 rounded-lg px-3 text-xs font-extrabold ${storybookPreviewMode === 'locked' ? 'bg-white text-brand-700 shadow-sm' : 'text-muted'}`}>Chưa mở sticker</button>
              <button type="button" onClick={() => setStorybookPreviewMode('complete')} className={`min-h-10 flex-1 rounded-lg px-3 text-xs font-extrabold ${storybookPreviewMode === 'complete' ? 'bg-white text-brand-700 shadow-sm' : 'text-muted'}`}>Đã hoàn thành</button>
            </div>
            <div className="overflow-hidden rounded-3xl bg-slate-100 p-2">
              <BookSpread
                page={chapterPreviewPage}
                pages={[chapterPreviewPage]}
                pageIndex={0}
                onPageChange={() => undefined}
                earned={chapterPreviewEarned}
                ownedRewards={new Set<string>()}
              />
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-violet-100 via-sky-50 to-amber-50 p-5 text-center shadow-inner">
            {form.contentType === 'reward' && (form.kind === 'background' || form.kind === 'theme' || form.kind === 'title' || form.kind === 'event_ticket') ? (
              <div className="space-y-3">
                <div className="mx-auto w-full overflow-hidden rounded-2xl border-4 border-white bg-white/70 shadow-lg">
                  <div className={`w-full ${form.kind === 'background' ? 'aspect-[15/4]' : form.kind === 'title' ? 'aspect-[1200/320]' : form.kind === 'event_ticket' ? 'aspect-[16/9]' : 'aspect-[2540/1300]'} flex items-center justify-center overflow-hidden bg-slate-100`}>
                    {(form.assetUrl || previewUrl) ? (
                      studioAssetPreviewKind(form.assetUrl || previewUrl) === 'config' ? (
                        <div className="px-5 text-brand-700"><Settings2 className="mx-auto h-10 w-10" aria-hidden="true" /><span className="mt-2 block text-xs font-black">Theme JSON</span></div>
                      ) : (
                        <img src={form.assetUrl || previewUrl} alt="Preview asset vừa tải" className={`h-full w-full ${selectedSpec.transparent ? 'object-contain p-2' : 'object-cover'}`} />
                      )
                    ) : (
                      <div className="p-4 text-muted"><span className="block text-3xl">🖼️</span><span className="mt-1 block text-xs font-bold">Chưa chọn asset</span></div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/90 p-3 text-left shadow-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-brand-200 bg-white shadow-inner">
                      {form.thumbnailUrl || form.assetUrl || previewUrl ? (
                        <img src={form.thumbnailUrl || form.assetUrl || previewUrl} alt="Icon đại diện" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xl">🎁</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <strong className="block truncate text-xs font-extrabold text-brand-950">Icon đại diện</strong>
                      <span className="block text-[11px] text-muted">{form.thumbnailUrl ? 'Dùng icon riêng' : 'Tự lấy từ ảnh chính'}</span>
                    </div>
                  </div>
                  <label className="flex min-h-9 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-xl bg-brand-50 px-2.5 text-xs font-black text-brand-700 hover:bg-brand-100">
                    <Pencil className="h-3 w-3" aria-hidden="true" />
                    <span>Sửa icon</span>
                    <input
                      type="file"
                      accept=".png,.webp,.jpg,.jpeg,.svg"
                      className="sr-only"
                      disabled={thumbnailUploading}
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        event.currentTarget.value = ''
                        if (file) void uploadThumbnail(file)
                      }}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="mx-auto flex aspect-square max-w-56 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-white/70 shadow-lg">
                {previewUrl
                  ? studioAssetPreviewKind(previewUrl) === 'video'
                    ? <video src={previewUrl} autoPlay loop muted className="h-full w-full object-contain" />
                    : studioAssetPreviewKind(previewUrl) === 'config'
                      ? <div className="px-5 text-brand-700"><Settings2 className="mx-auto h-14 w-14" aria-hidden="true" /><span className="mt-3 block text-sm font-black">Theme JSON đã tải lên</span><span className="mt-1 block text-xs text-muted">Màu và token được áp dụng khi preview hồ sơ.</span></div>
                      : <img src={previewUrl} alt="Preview asset vừa tải" className={`h-full w-full ${selectedSpec.transparent ? 'object-contain' : 'object-cover'}`} />
                  : <div className="px-4 text-muted"><span className="block text-5xl">🖼️</span><span className="mt-3 block text-sm font-bold">Chọn asset để xem ngay tại đây</span></div>}
              </div>
            )}
            {form.contentType === 'reward' && !(form.kind === 'background' || form.kind === 'theme' || form.kind === 'title' || form.kind === 'event_ticket') && (
              <label className="mt-3 inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-brand-200 bg-white/90 px-3 text-xs font-extrabold text-brand-700 shadow-sm transition hover:bg-brand-50">
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{form.thumbnailUrl ? 'Đổi ảnh icon / preview' : 'Sửa ảnh icon / preview'}</span>
                <input
                  type="file"
                  accept=".png,.webp,.jpg,.jpeg,.svg"
                  className="sr-only"
                  disabled={thumbnailUploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    event.currentTarget.value = ''
                    if (file) void uploadThumbnail(file)
                  }}
                />
              </label>
            )}
            <span className="mt-4 inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-black uppercase text-brand-700 shadow">{form.rarity}</span>
            <h3 className="mt-2 font-display text-xl">{form.name || 'Tên nội dung'}</h3>
            <p className="mt-1 text-xs text-muted">{form.description || 'Mô tả sẽ hiển thị tại đây.'}</p>
          </div>
        )}
        <div className="rounded-2xl border border-border p-4 text-sm">
          <p><strong>Nhóm:</strong> {form.contentType === 'reward' ? `Reward · ${form.kind}` : form.contentType === 'achievement' ? `Achievement · ${achievementFamilyLabel(form.achievementCategory)}` : form.contentType === 'chapter' ? 'Storybook chapter' : 'Sự kiện'}</p>
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
                ['10', 'Nền toàn trang cá nhân', 'bg-slate-100'],
                ['0', 'Nền thẻ hồ sơ', 'bg-orange-100'],
              ].map(([layer, label, color]) => (
                <div key={layer} className={`flex items-center justify-between rounded-lg px-3 py-2 ${color}`}>
                  <span className="font-bold">{label}</span><code>layer {layer}</code>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">Frame, effect và companion phải có nền trong suốt. Nền thẻ hồ sơ là lớp duy nhất phủ kín card; nền trang chỉ phủ khu vực trang cá nhân. Mỗi slot chỉ trang bị một reward.</p>
          </div>
        )}
        <p className="text-xs text-muted">Preview tạm xuất hiện ngay khi chọn file; URL chính thức được thay thế sau khi upload thành công.</p>
      </aside>
    </div>
  )
}
