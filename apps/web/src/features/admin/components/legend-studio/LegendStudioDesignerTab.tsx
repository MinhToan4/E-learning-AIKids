import { useMemo, useState, useRef, type FormEvent, type DragEvent } from 'react'
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  Gift,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  LayoutTemplate,
  Pencil,
  Plus,
  Rocket,
  RotateCcw,
  Settings2,
  Sparkles,
  Tag,
  Trash2,
  UploadCloud,
  User as UserIcon,
  X,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { BookSpread } from '@/features/storybook/components/BookSpread'
import type { StorybookPage } from '@/features/storybook/storybook-data'
import { ACHIEVEMENT_METRIC_REGISTRY, achievementEvolutionTier } from '@/features/achievements/achievement-config'
import { uploadCmsImage } from '@/shared/lib/media-api'
import type { AssetSpec, ChapterStickerItem, ContentType, RewardKind, StudioFormState, StudioItem } from './types'
import {
  assetDimensionLabel,
  assetSpecs,
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
  onPublishNow?: () => Promise<void>
}

function slugifyVietnamese(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 36)
}

const RARITY_OPTIONS = [
  { value: 'common', label: 'Common', color: 'border-slate-300 bg-slate-100 text-slate-700' },
  { value: 'rare', label: 'Rare', color: 'border-sky-300 bg-sky-100 text-sky-800' },
  { value: 'epic', label: 'Epic', color: 'border-purple-300 bg-purple-100 text-purple-800' },
  { value: 'legendary', label: 'Legendary', color: 'border-amber-300 bg-amber-100 text-amber-900 font-bold' },
] as const

const DEFAULT_AVATAR = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="128" fill="#dbeafe"/><circle cx="128" cy="105" r="52" fill="#f6c89f"/><path d="M72 104c0-67 112-72 112 2-25-3-46-19-58-38-11 22-31 34-54 36Z" fill="#4338ca"/><circle cx="108" cy="108" r="6" fill="#1e293b"/><circle cx="148" cy="108" r="6" fill="#1e293b"/><path d="M108 137c13 13 28 13 41 0" fill="none" stroke="#b45309" stroke-width="6" stroke-linecap="round"/><path d="M55 256c5-63 39-92 73-92s68 29 73 92" fill="#60a5fa"/></svg>')}`

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
  onPublishNow,
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
  const [previewTab, setPreviewTab] = useState<'student_card' | 'raw_asset'>('student_card')
  const [isDragOver, setIsDragOver] = useState(false)
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(Boolean(editingItem))

  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Handle Drag and Drop
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void uploadAsset(file)
  }

  // Auto-slugify name to code
  const handleNameChange = (nameVal: string) => {
    if (!editingItem && !codeManuallyEdited) {
      const generated = slugifyVietnamese(nameVal)
      setForm((cur) => ({ ...cur, name: nameVal, code: generated }))
    } else {
      setForm((cur) => ({ ...cur, name: nameVal }))
    }
  }

  const activeAssetSrc = form.assetUrl || previewUrl

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(420px,1fr)_minmax(460px,560px)]">
      {/* CỘT TRÁI: FORM NHẬP THÔNG SỐ GỌN GÀNG */}
      <form onSubmit={onSubmit} className="ui-card space-y-5 p-6 border border-border shadow-xs">
        {/* Header & Status Indicator */}
        <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${editingItem ? 'bg-amber-500' : 'bg-brand-600'}`} />
              <p className="text-xs font-black uppercase tracking-wider text-brand-600">
                {editingItem ? `Đang sửa: ${editingItem.code}` : 'Thiết kế mới'}
              </p>
            </div>
            <h2 className="mt-1 font-display text-2xl text-slate-900">
              {editingItem ? editingItem.name : 'Tạo Tài sản Đồ họa'}
            </h2>
          </div>
          {editingItem && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              v{editingItem.version} · {editingItem.status}
            </span>
          )}
        </div>

        {/* 1. Chọn loại nội dung & loại vật phẩm */}
        <section className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
              Loại nội dung
              <select
                disabled={Boolean(editingItem)}
                className={`${fieldClass} mt-1 h-11 text-sm font-bold`}
                value={form.contentType}
                onChange={(event) => setForm({ ...form, contentType: event.target.value as ContentType })}
              >
                <option value="reward">Phần thưởng / Vật phẩm</option>
                <option value="chapter">Chapter Storybook</option>
                <option value="event">Sự kiện</option>
                <option value="achievement">Achievement tiến hoá</option>
              </select>
            </label>

            {form.contentType === 'reward' && (
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Loại vật phẩm (Slot)
                <select
                  className={`${fieldClass} mt-1 h-11 text-sm font-bold`}
                  value={form.kind}
                  onChange={(event) => {
                    const kind = event.target.value as RewardKind
                    setForm({ ...form, kind, displayJson: displayTemplate(kind), assetUrl: '' })
                    setPreviewUrl('')
                    setAssetInfo('')
                    setAssetUploadError('')
                  }}
                >
                  {kindOptions.map((k) => (
                    <option key={k} value={k}>
                      {assetSpecs[k]?.label ?? k}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {/* Standard Spec Badge displayed directly next to/under the selection */}
          {form.contentType === 'reward' && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-200 bg-brand-50/70 px-3.5 py-2 text-xs">
              <span className="font-extrabold text-brand-900">
                Chuẩn: {selectedSpec.label}
              </span>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="rounded-md bg-white px-2 py-0.5 font-bold text-brand-800 shadow-2xs">
                  {assetDimensionLabel(selectedSpec)}
                </span>
                <span className="rounded-md bg-white px-2 py-0.5 text-slate-600 shadow-2xs">
                  {selectedSpec.formats.map((f) => f.split('/')[1].toUpperCase()).join('/')}
                </span>
                <span className="rounded-md bg-white px-2 py-0.5 text-slate-600 shadow-2xs">
                  &lt; {selectedSpec.maxMb}MB
                </span>
                {selectedSpec.transparent && (
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800">
                    Nền trong suốt
                  </span>
                )}
              </div>
            </div>
          )}
        </section>

        {/* 2. Tên hiển thị & Mã định danh (Auto Slug) */}
        <section className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
              Tên hiển thị
              <input
                required
                className={`${fieldClass} mt-1 h-11 text-sm font-semibold`}
                placeholder="Ví dụ: Khung Dải Ngân Hà"
                value={form.name}
                onChange={(event) => handleNameChange(event.target.value)}
              />
            </label>

            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
              Mã code định danh
              <input
                required
                minLength={3}
                disabled={Boolean(editingItem)}
                className={`${fieldClass} mt-1 h-11 font-mono text-sm ${editingItem ? 'bg-slate-100 text-muted' : ''}`}
                placeholder="frame-dai-ngan-ha"
                value={form.code}
                onChange={(event) => {
                  setCodeManuallyEdited(true)
                  setForm({ ...form, code: event.target.value })
                }}
              />
            </label>
          </div>

          {/* 3. Độ hiếm (Rarity Chips) */}
          {form.contentType === 'reward' && (
            <div>
              <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-2">
                Độ hiếm (Rarity)
              </span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {RARITY_OPTIONS.map((opt) => {
                  const isSelected = form.rarity === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, rarity: opt.value })}
                      className={`h-10 rounded-xl border-2 px-3 text-xs font-bold transition ${
                        isSelected
                          ? `${opt.color} ring-2 ring-brand-500 shadow-xs`
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 4. Mục gán nhanh mở khóa (Level, Storybook... hoặc để trống) */}
          {form.contentType === 'reward' && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Gán điều kiện mở khóa
              </span>
              <div className="mt-2.5 grid gap-3 sm:grid-cols-[160px_1fr]">
                <select
                  className={`${fieldClass} h-11 text-xs font-bold`}
                  value={form.unlockType}
                  onChange={(e) => {
                    const val = e.target.value
                    setForm({
                      ...form,
                      unlockType: val,
                      unlockValue: val === 'unconfigured' ? '' : val === 'xp_level' && !form.unlockValue ? '1' : form.unlockValue,
                    })
                  }}
                >
                  <option value="xp_level">🎯 Theo Level (1–100)</option>
                  <option value="storybook_sticker">📖 Storybook</option>
                  <option value="event">📅 Sự kiện</option>
                  <option value="unconfigured">⚪ Gán sau (Cây level)</option>
                </select>

                {form.unlockType === 'xp_level' && (
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      className={`${fieldClass} h-11 text-sm font-bold`}
                      placeholder="Nhập Level (vd: 5)"
                      value={form.unlockValue}
                      onChange={(e) => setForm({ ...form, unlockValue: e.target.value })}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      Level 1–100
                    </span>
                  </div>
                )}

                {form.unlockType === 'storybook_sticker' && (
                  <input
                    className={`${fieldClass} h-11 text-sm`}
                    placeholder="Mã sticker (vd: P09-S1)"
                    value={form.unlockValue}
                    onChange={(e) => setForm({ ...form, unlockValue: e.target.value })}
                  />
                )}

                {form.unlockType === 'event' && (
                  <input
                    className={`${fieldClass} h-11 text-sm`}
                    placeholder="Mã sự kiện (vd: summer-quest-2026)"
                    value={form.unlockValue}
                    onChange={(e) => setForm({ ...form, unlockValue: e.target.value })}
                  />
                )}

                {form.unlockType === 'unconfigured' && (
                  <div className="flex items-center rounded-xl bg-slate-100 px-3 text-xs text-muted">
                    Sẽ hiển thị trong mục "⚪ Chưa gán" trên Kho tài sản để gán sau.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. Mô tả ngắn */}
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
            Mô tả ngắn
            <textarea
              className={`${fieldClass} mt-1 min-h-20 py-2.5 text-sm`}
              placeholder="Mô tả ngắn gọn về phần thưởng hoặc cách bé nhận được…"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </label>
        </section>

        {/* Special Content Type Editors */}
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
          <section className="space-y-3 rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
            <h4 className="text-xs font-extrabold uppercase text-sky-900">Thời gian diễn ra sự kiện</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-bold text-slate-700">
                Bắt đầu
                <input
                  required
                  type="datetime-local"
                  className={`${fieldClass} h-10 text-sm`}
                  value={form.eventStartsAt}
                  onChange={(e) => setForm({ ...form, eventStartsAt: e.target.value })}
                />
              </label>
              <label className="text-xs font-bold text-slate-700">
                Kết thúc
                <input
                  required
                  type="datetime-local"
                  className={`${fieldClass} h-10 text-sm`}
                  value={form.eventEndsAt}
                  onChange={(e) => setForm({ ...form, eventEndsAt: e.target.value })}
                />
              </label>
            </div>
          </section>
        )}

        {form.contentType === 'achievement' && (
          <section className="space-y-4 rounded-2xl border border-border bg-slate-50/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Các mốc tiến hoá của Danh hiệu</h4>
                <p className="text-xs text-muted">Trẻ giữ tiến độ và nhận hình thái mới khi vượt ngưỡng.</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setAchievementMilestones([...achievementMilestones, {
                  label: achievementEvolutionTier(achievementMilestones.length).label,
                  description: '',
                  metric: form.achievementMetric,
                  operator: 'gte',
                  threshold: (achievementMilestones.at(-1)?.threshold ?? 0) + 1,
                  imageUrl: '',
                  points: 10,
                }])}
              >
                <Plus className="h-4 w-4" /> Thêm mốc
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-bold text-slate-700">
                Nhóm danh hiệu
                <select
                  className={`${fieldClass} h-10 text-sm`}
                  value={form.achievementCategory}
                  onChange={(e) => setForm({ ...form, achievementCategory: e.target.value })}
                >
                  {Object.entries(achievementFamilyLabels).filter(([k]) => k !== 'other').map(([k, label]) => (
                    <option key={k} value={k}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-bold text-slate-700">
                Metric đo lường
                <select
                  required
                  className={`${fieldClass} h-10 text-sm`}
                  value={form.achievementMetric}
                  onChange={(e) => {
                    const metric = e.target.value
                    setForm((cur) => ({
                      ...cur,
                      achievementMetric: metric,
                      achievementMilestonesJson: JSON.stringify(achievementMilestones.map((m) => ({ ...m, metric })), null, 2),
                    }))
                  }}
                >
                  {ACHIEVEMENT_METRIC_REGISTRY.map((m) => (
                    <option key={m.value} value={m.value}>{m.label} ({m.source})</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="space-y-3">
              {achievementMilestones.map((milestone, index) => (
                <div key={`${index}-${milestone.label}`} className="rounded-xl border border-slate-200 bg-white p-3 text-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <span className="font-extrabold text-brand-700">
                      Mốc {index + 1}: {achievementEvolutionTier(index).label}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => {
                          const next = [...achievementMilestones];
                          [next[index - 1], next[index]] = [next[index], next[index - 1]];
                          setAchievementMilestones(next)
                        }}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === achievementMilestones.length - 1}
                        onClick={() => {
                          const next = [...achievementMilestones];
                          [next[index + 1], next[index]] = [next[index], next[index + 1]];
                          setAchievementMilestones(next)
                        }}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={achievementMilestones.length === 1}
                        onClick={() => setAchievementMilestones(achievementMilestones.filter((_, pos) => pos !== index))}
                        className="rounded p-1 text-danger hover:bg-rose-50 disabled:opacity-30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <input
                      type="number"
                      min={1}
                      className={`${fieldClass} h-9 text-xs`}
                      placeholder="Ngưỡng đạt"
                      value={milestone.threshold}
                      onChange={(e) => updateAchievementMilestone(index, { threshold: Number(e.target.value) || 1 })}
                    />
                    <input
                      className={`${fieldClass} h-9 text-xs`}
                      placeholder="Mô tả mốc"
                      value={milestone.description ?? ''}
                      onChange={(e) => updateAchievementMilestone(index, { description: e.target.value })}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Collapsible Advanced JSON */}
        {form.contentType !== 'chapter' && form.contentType !== 'achievement' && (
          <details className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs">
            <summary className="cursor-pointer font-bold text-slate-600 hover:text-slate-900">
              Cấu hình nâng cao (JSON Payload)
            </summary>
            <div className="mt-3 space-y-3">
              <label className="block font-mono">
                Display JSON
                <textarea
                  className={`${fieldClass} mt-1 min-h-28 py-2 font-mono text-xs`}
                  value={form.displayJson}
                  onChange={(e) => setForm({ ...form, displayJson: e.target.value })}
                />
              </label>
              <label className="block font-mono">
                Content JSON
                <textarea
                  className={`${fieldClass} mt-1 min-h-24 py-2 font-mono text-xs`}
                  value={form.contentJson}
                  onChange={(e) => setForm({ ...form, contentJson: e.target.value })}
                />
              </label>
            </div>
          </details>
        )}

        {/* 1-Click Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setEditingItem(null)
              setForm(emptyForm())
              setPreviewUrl('')
              setAssetInfo('')
              setAssetUploadError('')
              setThumbnailUploadError('')
              setMessage('')
              onCancel()
            }}
            className="flex-1"
          >
            Hủy
          </Button>

          {/* Lưu bản nháp */}
          <Button
            type="submit"
            variant="secondary"
            disabled={busy || uploading || Boolean(assetUploadError)}
            className="flex-[1.5] border-2 border-brand-200 bg-brand-50 font-extrabold text-brand-800 hover:bg-brand-100"
          >
            {editingItem?.status === 'published' ? 'Lưu bản nháp mới' : 'Lưu bản nháp'}
          </Button>

          {/* Phát hành ngay */}
          <Button
            type="button"
            disabled={busy || uploading || Boolean(assetUploadError)}
            onClick={async () => {
              if (onPublishNow) {
                await onPublishNow()
              } else {
                // Submit form directly
                const formEl = document.querySelector('form')
                formEl?.requestSubmit()
              }
            }}
            className="flex-[2] bg-emerald-600 font-extrabold text-white shadow-sm hover:bg-emerald-700"
          >
            <Rocket className="h-4 w-4" aria-hidden="true" />
            <span>Phát hành ngay</span>
          </Button>
        </div>
      </form>

      {/* CỘT PHẢI: LIVE PREVIEW CANVAS & INSTANT DROPZONE */}
      <aside className="space-y-4 lg:sticky lg:top-5">
        <section className="ui-card overflow-hidden border border-border p-5 shadow-xs">
          {/* Header & Preview Mode Switcher */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-brand-600">Khung Live Preview</p>
              <h3 className="font-display text-lg text-slate-900">Xem trước Trực quan</h3>
            </div>

            {form.contentType === 'reward' && (
              <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-bold" role="group">
                <button
                  type="button"
                  onClick={() => setPreviewTab('student_card')}
                  className={`rounded-md px-2.5 py-1 transition ${
                    previewTab === 'student_card' ? 'bg-white text-brand-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Thẻ học sinh
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('raw_asset')}
                  className={`rounded-md px-2.5 py-1 transition ${
                    previewTab === 'raw_asset' ? 'bg-white text-brand-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Asset gốc
                </button>
              </div>
            )}
          </div>

          {/* INSTANT DRAG & DROP UPLOAD DROPZONE */}
          {form.contentType !== 'chapter' && form.contentType !== 'achievement' && (
            <div className="mt-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
                  isDragOver
                    ? 'border-brand-600 bg-brand-50 scale-[1.01]'
                    : assetUploadError
                      ? 'border-rose-400 bg-rose-50/50'
                      : activeAssetSrc
                        ? 'border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/60'
                        : 'border-slate-300 bg-slate-50/60 hover:border-brand-400 hover:bg-brand-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={form.contentType === 'reward' ? selectedSpec.formats.join(',') : '.png,.webp,.jpg,.jpeg,.svg,.json,.webm'}
                  className="sr-only"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    e.currentTarget.value = ''
                    if (f) void uploadAsset(f)
                  }}
                />

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-600 shadow-xs">
                  <UploadCloud className="h-5 w-5" aria-hidden="true" />
                </div>

                <div className="mt-2">
                  <p className="text-xs font-extrabold text-slate-800">
                    {uploading ? 'Đang kiểm tra & tải lên…' : 'Kéo thả file ảnh vào đây hoặc bấm để chọn'}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {form.contentType === 'reward'
                      ? `${assetDimensionLabel(selectedSpec)} · tối đa ${selectedSpec.maxMb}MB`
                      : 'PNG, WebP, JPG, JSON hoặc WebM'}
                  </p>
                </div>
              </div>

              {/* Real-time Pixel Inspection Badge */}
              {assetInfo && !assetUploadError && (
                <div className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="truncate">{assetInfo}</span>
                </div>
              )}

              {/* Error Notice */}
              {assetUploadError && (
                <div className="mt-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
                  <div className="flex items-center gap-2 font-extrabold">
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                    <span>Lỗi kiểm tra kích thước / định dạng:</span>
                  </div>
                  <p className="mt-1 font-medium">{assetUploadError}</p>
                </div>
              )}
            </div>
          )}

          {/* LIVE PREVIEW CANVAS */}
          <div className="mt-4">
            {form.contentType === 'chapter' ? (
              <div className="space-y-3">
                <div className="flex rounded-xl border border-border bg-slate-50 p-1" role="group">
                  <button
                    type="button"
                    onClick={() => setStorybookPreviewMode('locked')}
                    className={`min-h-9 flex-1 rounded-lg px-3 text-xs font-extrabold ${storybookPreviewMode === 'locked' ? 'bg-white text-brand-700 shadow-xs' : 'text-muted'}`}
                  >
                    Chưa mở sticker
                  </button>
                  <button
                    type="button"
                    onClick={() => setStorybookPreviewMode('complete')}
                    className={`min-h-9 flex-1 rounded-lg px-3 text-xs font-extrabold ${storybookPreviewMode === 'complete' ? 'bg-white text-brand-700 shadow-xs' : 'text-muted'}`}
                  >
                    Đã hoàn thành
                  </button>
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
            ) : previewTab === 'student_card' && form.contentType === 'reward' ? (
              /* PHÔI THẺ HỌC SINH MOCKUP */
              <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-lg">
                {/* Profile Card Header / Background */}
                <div className="relative h-28 w-full overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                  {form.kind === 'background' && activeAssetSrc ? (
                    <img src={activeAssetSrc} alt="Background" className="h-full w-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-3xs" />
                  )}
                  <div className="absolute right-3 top-3 rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-black text-slate-800 backdrop-blur-xs">
                    THẺ HỌC SINH
                  </div>
                </div>

                {/* Avatar Slot with Frame, Effect, and Companion layers */}
                <div className="relative -mt-12 px-6 pb-6 text-center">
                  <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
                    {/* Base Kid Avatar */}
                    <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-amber-100 shadow-md">
                      {form.kind === 'avatar' && activeAssetSrc ? (
                        <img src={activeAssetSrc} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <img src={DEFAULT_AVATAR} alt="Default Avatar" className="h-full w-full object-cover" />
                      )}
                    </div>

                    {/* Frame Layer */}
                    {form.kind === 'frame' && activeAssetSrc && (
                      <div className="pointer-events-none absolute inset-0 -m-2 flex items-center justify-center">
                        <img src={activeAssetSrc} alt="Frame" className="h-full w-full object-contain scale-110" />
                      </div>
                    )}

                    {/* Effect Layer */}
                    {form.kind === 'effect' && activeAssetSrc && (
                      <div className="pointer-events-none absolute inset-0 -m-3 flex items-center justify-center animate-pulse">
                        <img src={activeAssetSrc} alt="Effect" className="h-full w-full object-contain" />
                      </div>
                    )}

                    {/* Companion Layer (Bottom-right corner) */}
                    {form.kind === 'companion' && activeAssetSrc && (
                      <div className="absolute -bottom-1 -right-2 h-11 w-11 rounded-full border-2 border-white bg-white p-0.5 shadow-md">
                        <img src={activeAssetSrc} alt="Companion" className="h-full w-full object-contain" />
                      </div>
                    )}
                  </div>

                  {/* Student Name */}
                  <h4 className="mt-2 text-base font-extrabold text-slate-900">Bé Minh Anh</h4>

                  {/* Title / Badge Slot */}
                  <div className="mt-1 flex justify-center">
                    {form.kind === 'title' && activeAssetSrc ? (
                      <div className="h-8 max-w-[200px] overflow-hidden">
                        <img src={activeAssetSrc} alt="Title" className="h-full w-full object-contain" />
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                        <Sparkles className="h-3 w-3 text-amber-600" />
                        Nhà Khám Phá Nhí
                      </span>
                    )}
                  </div>

                  {/* Mock Level & XP bar */}
                  <div className="mt-3 rounded-2xl bg-slate-50 p-2.5 text-left border border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Cấp độ: Level 12</span>
                      <span className="text-brand-600">3,450 / 4,000 XP</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full w-4/5 rounded-full bg-brand-500" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* RAW ASSET CANVAS VIEW */
              <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border-2 border-slate-200 bg-slate-100 p-6">
                {activeAssetSrc ? (
                  studioAssetPreviewKind(activeAssetSrc) === 'video' ? (
                    <video src={activeAssetSrc} autoPlay loop muted className="h-full w-full object-contain" />
                  ) : studioAssetPreviewKind(activeAssetSrc) === 'config' ? (
                    <div className="text-center text-brand-700">
                      <Settings2 className="mx-auto h-12 w-12" />
                      <span className="mt-2 block text-xs font-bold">Theme JSON Config</span>
                    </div>
                  ) : (
                    <img
                      src={activeAssetSrc}
                      alt="Raw Asset Preview"
                      className={`h-full w-full ${selectedSpec.transparent ? 'object-contain' : 'object-cover rounded-2xl'}`}
                    />
                  )
                ) : (
                  <div className="text-center text-slate-400">
                    <ImageIcon className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-2 text-xs font-bold">Chưa tải ảnh asset</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Thumbnail Slot */}
          {form.contentType === 'reward' && (
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {form.thumbnailUrl || activeAssetSrc ? (
                    <img src={form.thumbnailUrl || activeAssetSrc} alt="Thumbnail" className="h-full w-full object-cover" />
                  ) : (
                    <Gift className="h-5 w-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <span className="block text-xs font-extrabold text-slate-800">Ảnh Icon / Ba lô</span>
                  <span className="block text-[10px] text-muted">
                    {form.thumbnailUrl ? 'Dùng icon riêng' : 'Tự lấy từ ảnh chính'}
                  </span>
                </div>
              </div>

              <label className="flex h-8 cursor-pointer items-center gap-1 rounded-lg border border-brand-200 bg-white px-2.5 text-xs font-bold text-brand-700 shadow-2xs hover:bg-brand-50">
                <Pencil className="h-3 w-3" />
                <span>{form.thumbnailUrl ? 'Đổi icon' : 'Tải icon riêng'}</span>
                <input
                  type="file"
                  accept=".png,.webp,.jpg,.jpeg,.svg"
                  className="sr-only"
                  disabled={thumbnailUploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    e.currentTarget.value = ''
                    if (f) void uploadThumbnail(f)
                  }}
                />
              </label>
            </div>
          )}
        </section>
      </aside>
    </div>
  )
}
