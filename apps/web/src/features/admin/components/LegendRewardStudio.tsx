import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AlertTriangle, Archive, ArrowDown, ArrowUp, BookOpen, CalendarDays, CheckCircle2, Gift, History, LayoutTemplate, Link2, List, Map as MapIcon, Network, PackageOpen, Pencil, Plus, RotateCcw, Search, Settings2, Trash2, UploadCloud, X } from 'lucide-react'
import { gamificationApi, legendStudioApi } from '@/shared/lib/gamification-api'
import { ApiError } from '@/shared/lib/api'
import { uploadCmsImage } from '@/shared/lib/media-api'
import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { RewardPackAdmin } from './RewardPackAdmin'
import { buildRewardConfigMap, type ConfigChannel } from '../lib/reward-config-map'
import { getResolvedRewardAssetUrl } from '@/features/rewards/reward-assets'
import { REWARD_CATALOG } from '@/shared/lib/creation/rewards'
import { rewardTitleAsset } from '@/features/rewards/title-assets'
import { achievementBadgeAsset, rewardBadgeThumbnail } from '@/features/achievements/achievement-badge-assets'
import { ACHIEVEMENT_METRIC_REGISTRY, achievementEvolutionTier, resolveAchievementMetric } from '@/features/achievements/achievement-config'
import type { AchievementRow } from '@/shared/lib/api'
import { PROFILE_CARD_LAYOUT_CODE } from '@/features/profile/profile-card-layout'
import { ProfileCardLayoutEditor } from './ProfileCardLayoutEditor'
import { STORYBOOK_PAGES, type StorybookPage } from '@/features/storybook/storybook-data'
import { BookSpread } from '@/features/storybook/components/BookSpread'
import { storybookChapter } from '@/shared/lib/creation/storybook'

const RewardMappingWorkspace = lazy(() => import('./RewardMappingWorkspace').then((module) => ({ default: module.RewardMappingWorkspace })))

type ContentType = 'reward' | 'chapter' | 'event' | 'achievement'
type ChapterEditorFocus = 'cover' | 'left' | 'stickerPage' | 'stickers'
type LifecycleAction = 'review' | 'publish' | 'revert' | 'archive'
type DependencyReport = { canDelete: boolean; references: Array<{ type: string; label: string }> }
type AuditEntry = { id: string; action: string; actorName?: string; createdAt: string; summary?: string }
export type StudioItem = {
  id: string
  contentType: ContentType
  code: string
  version: number
  status: 'draft' | 'review' | 'scheduled' | 'published' | 'retired'
  name: string
  description: string
  kind?: string | null
  rarity: string
  assets: { thumbnailUrl?: string; imageUrl?: string; overlayUrl?: string; animationUrl?: string; coverUrl?: string; leftBackgroundUrl?: string; stickerPageUrl?: string; stickerSheetUrl?: string }
  displayConfig: Record<string, unknown>
  unlockRule: Record<string, unknown>
  content: Record<string, unknown>
  updatedAt?: string
  source?: 'studio' | 'legacy' | 'runtime'
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
  flexibleHeight?: boolean
  formats: string[]
  maxMb: number
  transparent: boolean
  layer: number
  slot: string
  safeArea: string
  combinesWith: string
}

export const assetSpecs: Record<RewardKind, AssetSpec> = {
  background: { label: 'Nền thẻ hồ sơ', width: 1500, height: 400, formats: ['image/webp', 'image/jpeg', 'image/png'], maxMb: 3, transparent: false, layer: 0, slot: 'profile_background', safeArea: 'Giữ chủ thể ngoài vùng giữa 60%', combinesWith: 'Avatar + Frame + Companion + Effect + Title' },
  avatar: { label: 'Avatar', width: 1200, height: 1200, formats: ['image/webp', 'image/png', 'image/jpeg'], maxMb: 2, transparent: false, layer: 20, slot: 'profile_avatar', safeArea: 'Mặt nằm trong vòng tròn giữa 72%', combinesWith: 'Background + Frame + Companion + Effect' },
  frame: { label: 'Khung avatar', width: 1024, height: 1024, formats: ['image/png', 'image/webp'], maxMb: 2, transparent: true, layer: 30, slot: 'avatar_frame', safeArea: 'Giữa ảnh phải trong suốt tối thiểu 58%', combinesWith: 'Background + Avatar + 1 Companion + 1 Effect' },
  companion: { label: 'Bạn đồng hành', width: 512, height: 512, formats: ['image/png', 'image/webp'], maxMb: 1.5, transparent: true, layer: 40, slot: 'avatar_companion', safeArea: 'Nhân vật trong 90%, chừa 5% mỗi cạnh', combinesWith: 'Background + Avatar + Frame + Effect' },
  effect: { label: 'Hiệu ứng', width: 1200, height: 1200, formats: ['video/webm', 'image/webp', 'image/png'], maxMb: 4, transparent: true, layer: 50, slot: 'avatar_effect', safeArea: 'Không che vùng mặt ở giữa 50%', combinesWith: 'Background + Avatar + Frame + Companion' },
  title: { label: 'Khung danh hiệu', width: 1200, height: 320, flexibleHeight: true, formats: ['image/png', 'image/webp', 'image/svg+xml'], maxMb: 1.5, transparent: true, layer: 60, slot: 'profile_title', safeArea: 'Chiều rộng cố định 1200px; chiều cao theo artwork, chừa vùng chữ giữa', combinesWith: 'Nền trang + nền thẻ; nằm dưới thẻ hồ sơ' },
  theme: { label: 'Nền toàn trang cá nhân', width: 2540, height: 1300, formats: ['image/png', 'image/svg+xml'], maxMb: 4, transparent: false, layer: 10, slot: 'profile_theme', safeArea: 'Giữ nội dung chính trong vùng giữa; chừa khoảng trống cho thẻ hồ sơ', combinesWith: 'Nền thẻ + Frame + Title; chỉ áp dụng trong trang cá nhân' },
  event_ticket: { label: 'Vé / banner sự kiện', width: 1200, height: 675, formats: ['image/webp', 'image/jpeg', 'image/png'], maxMb: 2, transparent: false, layer: 0, slot: 'event_card', safeArea: 'Chừa 20% bên trái cho tên và thời gian', combinesWith: 'Dùng độc lập trong card sự kiện' },
  perk: { label: 'Biểu tượng đặc quyền', width: 512, height: 512, formats: ['image/png', 'image/webp'], maxMb: 1, transparent: true, layer: 60, slot: 'perk_badge', safeArea: 'Icon trong 80% vùng giữa', combinesWith: 'Hiển thị độc lập ở ba lô và badge' },
}

export const assetDimensionLabel = (spec: Pick<AssetSpec, 'width' | 'height' | 'flexibleHeight'>) =>
  spec.flexibleHeight ? `${spec.width}px ngang × cao tự do` : `${spec.width}×${spec.height}px`

export const isAssetDimensionValid = (spec: Pick<AssetSpec, 'width' | 'height' | 'flexibleHeight'>, width: number, height: number) =>
  width === spec.width && (spec.flexibleHeight ? height > 0 : height === spec.height)

export const compareLevelUnlockRules = (
  left: Pick<StudioItem, 'unlockRule' | 'name'>,
  right: Pick<StudioItem, 'unlockRule' | 'name'>,
) => {
  const levelDifference = Number(left.unlockRule.value) - Number(right.unlockRule.value)
  return levelDifference || left.name.localeCompare(right.name, 'vi')
}

export const isVisibleOnPublishedMap = (item: Pick<StudioItem, 'source' | 'status'>) =>
  item.source !== 'studio' || item.status === 'published'

const storybookThemePresets = STORYBOOK_PAGES.map((page) => ({
  key: page.slug.toLowerCase(),
  label: page.title,
  emoji: page.emoji,
  colors: page.colors,
  coverUrl: page.coverUrl ?? '',
  leftBackgroundUrl: page.leftBackgroundUrl ?? '',
  stickerPageUrl: page.stickerPageUrl ?? '',
  stickerSheetUrl: page.stickerSheetUrl ?? '',
}))

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

function studioArtwork(item: StudioItem): string | undefined {
  return item.assets.imageUrl ?? item.assets.thumbnailUrl
    ?? (item.contentType === 'reward' ? rewardTitleAsset(item.code) ?? getResolvedRewardAssetUrl(item.code) : item.assets.coverUrl)
}

function ChapterBookMapPreview({ item, onEdit, lifecycleActions }: { item: StudioItem; onEdit: (focus: ChapterEditorFocus) => void; lifecycleActions?: ReactNode }) {
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
        <span className={`rounded-full px-3 py-1 text-xs font-black ${item.source === 'legacy' ? 'bg-amber-100 text-amber-900' : 'bg-mint-50 text-success'}`}>{item.source === 'legacy' ? 'Chưa đưa vào Studio' : studioStatusLabel(item)}</span>
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
                  return <span key={String(sticker?.id ?? index)} className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-amber-200 bg-white/85 text-lg shadow-sm">{imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-contain" /> : String(sticker?.icon ?? '✦')}</span>
                })}
              </div>
            )}
            <button type="button" className={editButtonClass} onClick={() => onEdit('stickerPage')} aria-label={`Sửa nền trang sticker ${item.name}`}>Sửa nền trang sticker</button>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => onEdit('stickers')} className="flex min-h-11 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-extrabold text-white shadow-sm hover:bg-brand-700"><Pencil className="h-4 w-4" aria-hidden="true" /> Sửa 9 sticker</button>
        <button type="button" onClick={() => onEdit('left')} className="min-h-11 rounded-xl border border-border bg-white px-4 text-sm font-extrabold text-brand-700 hover:bg-brand-50">Sửa nội dung chương</button>
        {lifecycleActions}
      </div>
    </article>
  )
}

function ChapterStickerArtwork({
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

function legacyRewardStudioItems(studioItems: readonly StudioItem[]): StudioItem[] {
  const studioCodes = new Set(studioItems.map((item) => item.code))
  return REWARD_CATALOG
    .filter((reward) => !studioCodes.has(reward.id))
    .map((reward): StudioItem => ({
      id: `legacy:${reward.id}`,
      contentType: 'reward',
      code: reward.id,
      version: 0,
      status: 'published',
      source: 'legacy',
      name: reward.name,
      description: reward.description,
      kind: reward.kind,
      rarity: 'common',
      assets: {},
      displayConfig: reward.equipValue ? { equipValue: reward.equipValue } : {},
      unlockRule: { type: reward.unlock.type, value: reward.unlock.value },
      content: reward.eventKey ? { eventKey: reward.eventKey } : {},
    }))
}

function legacyStorybookStudioItems(studioItems: readonly StudioItem[]): StudioItem[] {
  const studioChapterCodes = new Set(
    studioItems
      .filter((item) => item.contentType === 'chapter')
      .map((item) => item.code.toUpperCase()),
  )
  return STORYBOOK_PAGES
    .filter((page) => !studioChapterCodes.has(page.slug.toUpperCase()))
    .map((page): StudioItem => {
      const definition = storybookChapter(page.slug)
      return {
        id: `legacy:storybook:${page.slug}`,
        contentType: 'chapter',
        code: page.slug,
        version: 0,
        status: 'published',
        source: 'legacy',
        name: page.title,
        description: page.story,
        rarity: 'common',
        assets: {
          coverUrl: page.coverUrl,
          leftBackgroundUrl: page.leftBackgroundUrl,
          stickerPageUrl: page.stickerPageUrl,
          stickerSheetUrl: page.stickerSheetUrl,
        },
        displayConfig: {
          group: page.group,
          emoji: page.emoji,
          colors: page.colors,
        },
        unlockRule: { type: 'storybook_sticker', value: `${page.slug}-S9` },
        content: {
          slug: page.slug,
          story: page.story,
          rewardId: page.rewardId ?? definition?.rewardId,
          stickers: page.stickers,
          migratedFrom: 'storybook_catalog',
        },
      }
    })
}

function runtimeAchievementItems(rows: readonly AchievementRow[]): StudioItem[] {
  return rows.map((achievement): StudioItem => {
    const artwork = achievement.imageUrl ?? achievement.milestones?.[0]?.imageUrl ?? achievementBadgeAsset(achievement)
    return {
    id: `runtime:${achievement.type}`,
    contentType: 'achievement',
    code: achievement.type,
    version: 0,
    status: 'published',
    source: 'runtime',
    name: achievement.title,
    description: achievement.description,
    kind: 'perk',
    rarity: 'common',
    assets: artwork ? { imageUrl: artwork } : {},
    displayConfig: {},
    unlockRule: { type: 'action', metric: achievement.type, target: achievement.requiredValue },
    content: {
      requirements: { metric: achievement.type, operator: 'gte', target: achievement.requiredValue },
      points: achievement.points,
      category: achievement.category ?? 'other',
      milestones: (achievement.milestones ?? []).map((milestone, index) => ({
        ...milestone,
        label: achievementEvolutionTier(index).label,
        metric: resolveAchievementMetric(milestone.metric ?? achievement.type),
        operator: milestone.operator ?? 'gte',
        imageUrl: milestone.imageUrl ?? achievementBadgeAsset({
          ...achievement,
          requiredValue: milestone.threshold,
          rewardAssetId: milestone.rewardAssetId,
          milestones: undefined,
        }),
      })),
      rewardLabel: achievement.rewardLabel,
      rewardAssetId: achievement.rewardAssetId,
    },
    }
  })
}

export const studioAchievementCode = (runtimeCode: string) => runtimeCode.replace(/^achievement\./, '')

const achievementFamilyLabels: Record<string, string> = {
  learning: 'Học tập', habit: 'Thói quen', creativity: 'Sáng tạo', creative: 'Sáng tạo', social: 'Hợp tác',
  safety: 'An toàn', exploration: 'Khám phá', mastery: 'Chinh phục', stars: 'Ngôi sao',
  discovery: 'Khám phá', challenge: 'Thử thách', records: 'Kỷ lục', progress: 'Tiến bộ', other: 'Khác',
}

function achievementFamilyLabel(category: unknown): string {
  const key = typeof category === 'string' && category.trim() ? category : 'other'
  return achievementFamilyLabels[key] ?? key.replaceAll('_', ' ')
}

function studioStatusLabel(item: StudioItem): string {
  if (item.source === 'legacy') return 'Legacy'
  if (item.source === 'runtime') return 'Runtime'
  return { draft: 'Bản nháp', review: 'Chờ duyệt', scheduled: 'Đã lên lịch', published: 'Đang phát hành', retired: 'Đã archive · chờ xóa' }[item.status]
}

function studioEditLabel(item: StudioItem): string {
  if (item.source === 'legacy' || item.source === 'runtime') return 'Đưa vào Studio'
  if (item.status === 'published' || item.status === 'retired') return 'Chỉnh sửa'
  if (item.status === 'review' || item.status === 'scheduled') return 'Cập nhật bản duyệt'
  return 'Sửa bản nháp'
}

export function studioAssetPreviewKind(url: string): 'image' | 'video' | 'config' {
  let pathname = url.toLowerCase()
  try { pathname = new URL(url, 'https://cms.local').pathname.toLowerCase() } catch { /* use raw value */ }
  if (pathname.endsWith('.webm')) return 'video'
  if (pathname.endsWith('.json')) return 'config'
  return 'image'
}

function StudioArtwork({ item, meaningful = false }: { item: StudioItem; meaningful?: boolean }) {
  const [failed, setFailed] = useState(false)
  const src = studioArtwork(item) ?? (item.kind === 'title' ? rewardBadgeThumbnail(item.code) : undefined)
  if (!src || failed) return <Gift className="h-7 w-7 text-brand-500" aria-hidden="true" />
  if (studioAssetPreviewKind(src) === 'config') return <Settings2 className="h-7 w-7 text-brand-500" aria-label={meaningful ? item.name : undefined} />
  const isCover = item.kind === 'background' || item.kind === 'theme' || item.kind === 'avatar' || item.kind === 'event_ticket'
  return <img src={src} alt={meaningful ? item.name : ''} loading="lazy" onError={() => setFailed(true)} className={`h-full w-full ${isCover ? 'object-cover' : 'object-contain'}`} />
}

function ChapterStickerPreview({ item }: { item: StudioItem }) {
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

const stickerMetrics = [
  { value: 'lessons_completed', label: 'Bài học đã hoàn thành', unit: 'bài', source: 'LMS' },
  { value: 'courses_completed', label: 'Khóa học đã hoàn thành', unit: 'khóa', source: 'LMS' },
  { value: 'stars', label: 'Tổng số sao học tập', unit: 'sao', source: 'LMS' },
  { value: 'streak', label: 'Chuỗi ngày học liên tiếp', unit: 'ngày', source: 'Gamification' },
  { value: 'xp', label: 'Tổng XP hệ sinh thái', unit: 'XP', source: 'Gamification' },
  { value: 'level', label: 'Cấp XP', unit: 'cấp', source: 'Gamification' },
] as const

const emptyForm = () => ({
  contentType: 'reward' as ContentType,
  code: '',
  name: '',
  description: '',
  kind: 'frame',
  rarity: 'common',
  assetUrl: '',
  thumbnailUrl: '',
  unlockType: 'xp_level',
  unlockValue: '1',
  chapterSlug: 'P09',
  chapterGroup: 'learning',
  chapterEmoji: '📖',
  chapterColorStart: '#4338CA',
  chapterColorEnd: '#F59E0B',
  chapterTheme: 'custom',
  chapterStory: '',
  chapterCoverUrl: '',
  chapterLeftBackgroundUrl: '',
  chapterStickerPageUrl: '',
  chapterStickerSheetUrl: '',
  chapterButtonUrl: '',
  stickerButtonUrl: '',
  helpButtonUrl: '',
  claimButtonUrl: '',
  previousButtonUrl: '',
  nextButtonUrl: '',
  chapterRewardId: '',
  chapterStickersJson: JSON.stringify(Array.from({ length: 9 }, (_, index) => ({
    id: `P09-S${index + 1}`,
    name: index === 8 ? 'Boss huyền thoại' : `Sticker ${index + 1}`,
    icon: index === 8 ? '🏆' : '⭐',
    hint: index === 8 ? 'Hoàn thành 8 sticker thường' : 'Mô tả điều kiện mở khóa',
    boss: index === 8,
    unlockRule: index === 8
      ? { metric: 'chapter_regular_stickers', operator: 'gte', target: 8 }
      : { metric: 'lessons_completed', operator: 'gte', target: index + 1 },
  })), null, 2),
  eventStartsAt: '',
  eventEndsAt: '',
  achievementCategory: 'learning',
  achievementMetric: 'lessons_completed',
  achievementMilestonesJson: JSON.stringify([
    { label: 'Mầm non', description: 'Bắt đầu hành trình', metric: 'lessons_completed', operator: 'gte', threshold: 1, imageUrl: '', points: 10, rewardLabel: '', rewardAssetId: '' },
  ], null, 2),
  displayJson: displayTemplate('frame'),
  contentJson: '{}',
})

export function LegendRewardStudio() {
  const [items, setItems] = useState<StudioItem[]>([])
  const [filter, setFilter] = useState<ContentType | 'all'>('all')
  const [libraryQuery, setLibraryQuery] = useState('')
  const [libraryStatus, setLibraryStatus] = useState<StudioItem['status'] | 'all'>('published')
  const [libraryPage, setLibraryPage] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [view, setView] = useState<'library' | 'map' | 'designer' | 'profile-card'>('map')
  const [designerMode, setDesignerMode] = useState<'single' | 'pack'>('single')
  const [mapChannel, setMapChannel] = useState<ConfigChannel | 'all'>('level')
  const [mapRewardKind, setMapRewardKind] = useState<string>('all')
  const [mapQuery, setMapQuery] = useState('')
  const [mapPage, setMapPage] = useState(1)
  const [mapDisplay, setMapDisplay] = useState<'tree' | 'table'>('tree')
  const [selectedTreeKey, setSelectedTreeKey] = useState('level:1')
  const [mappingBuilderOpen, setMappingBuilderOpen] = useState(false)
  const [mappingBuilderLevel, setMappingBuilderLevel] = useState<number>()
  const [selectedReward, setSelectedReward] = useState<StudioItem | null>(null)
  const [editingItem, setEditingItem] = useState<StudioItem | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [assetInfo, setAssetInfo] = useState('')
  const [assetUploadError, setAssetUploadError] = useState('')
  const [thumbnailUploading, setThumbnailUploading] = useState(false)
  const [thumbnailUploadError, setThumbnailUploadError] = useState('')
  const [chapterUploading, setChapterUploading] = useState('')
  const [chapterEditorFocus, setChapterEditorFocus] = useState<ChapterEditorFocus | null>(null)
  const [storybookPreviewMode, setStorybookPreviewMode] = useState<'locked' | 'complete'>('locked')
  const [milestoneUploading, setMilestoneUploading] = useState<number | null>(null)
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [migrationProgress, setMigrationProgress] = useState('')
  const [profileLayoutItem, setProfileLayoutItem] = useState<StudioItem>()
  const [pendingLifecycle, setPendingLifecycle] = useState<{ item: StudioItem; action: LifecycleAction; dependencies?: DependencyReport } | null>(null)
  const [auditPanel, setAuditPanel] = useState<{ itemId: string; entries: AuditEntry[] } | null>(null)
  const selectedSpec = assetSpecs[form.kind as RewardKind] ?? assetSpecs.frame
  const fieldClass = 'field-input mt-2 min-h-12 w-full border-2 border-slate-200 bg-white px-4 text-base shadow-sm focus:border-brand-500'
  const openDesigner = (mode: 'single' | 'pack') => {
    setDesignerMode(mode)
    setView('designer')
  }
  const openLevelMapping = (level: number) => {
    setMappingBuilderLevel(level)
    setMappingBuilderOpen(true)
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => document.getElementById('reward-mapping-builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' })))
  }

  useEffect(() => {
    if (view !== 'designer' || form.contentType !== 'chapter' || !chapterEditorFocus) return
    let secondFrame = 0
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        document.getElementById(`chapter-editor-${chapterEditorFocus}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setChapterEditorFocus(null)
      })
    })
    return () => {
      window.cancelAnimationFrame(firstFrame)
      window.cancelAnimationFrame(secondFrame)
    }
  }, [chapterEditorFocus, form.contentType, view])

  const createNew = (contentType: ContentType) => {
    setEditingItem(null)
    setForm({ ...emptyForm(), contentType })
    setPreviewUrl('')
    setAssetInfo('')
    setAssetUploadError('')
    setMessage('')
    setShowCreateMenu(false)
    openDesigner('single')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const load = useCallback(async () => {
    try {
      const [result, achievementsResult] = await Promise.all([
        legendStudioApi.list<{ items: StudioItem[] }>(),
        gamificationApi.achievements().catch(() => ({ achievements: [] })),
      ])
      const allStudioItems = result.items.map((item) => ({ ...item, source: 'studio' as const }))
      const layoutItems = allStudioItems.filter((item) => item.code === PROFILE_CARD_LAYOUT_CODE).sort((left, right) => right.version - left.version)
      setProfileLayoutItem(layoutItems[0])
      const studioItems = allStudioItems.filter((item) => item.code !== PROFILE_CARD_LAYOUT_CODE)
      const studioAchievementCodes = new Set(studioItems.filter((item) => item.contentType === 'achievement').map((item) => item.code))
      setItems([
        ...studioItems,
        ...legacyRewardStudioItems(studioItems),
        ...legacyStorybookStudioItems(studioItems),
        ...runtimeAchievementItems(achievementsResult.achievements).filter((item) => !studioAchievementCodes.has(studioAchievementCode(item.code))),
      ])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không tải được Legend Studio.')
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const counts = useMemo(() => ({
    draft: items.filter((item) => item.source === 'studio' && item.status === 'draft').length,
    review: items.filter((item) => item.source === 'studio' && item.status === 'review').length,
    published: items.filter((item) => item.source === 'studio' && item.status === 'published').length,
  }), [items])
  const sourceCounts = useMemo(() => ({
    studio: items.filter((item) => item.source === 'studio').length,
    legacy: items.filter((item) => item.source === 'legacy').length,
    legacyRewards: items.filter((item) => item.source === 'legacy' && item.contentType === 'reward').length,
    runtime: items.filter((item) => item.source === 'runtime').length,
  }), [items])
  const legacyMigrationIssues = useMemo(() => items
    .filter((item) => item.source === 'legacy' && item.contentType === 'reward')
    .flatMap((item) => {
      const issues: string[] = []
      if (!kindOptions.includes(item.kind as RewardKind)) issues.push(`${item.code}: loại asset không hỗ trợ`)
      if (!studioArtwork(item)) issues.push(`${item.code}: thiếu ảnh fallback`)
      return issues
    }), [items])
  const filteredItems = useMemo(() => {
    const query = libraryQuery.trim().toLocaleLowerCase('vi')
    return items.filter((item) => {
      if (filter !== 'all' && item.contentType !== filter) return false
      if (libraryStatus !== 'all' && item.status !== libraryStatus) return false
      if (!query) return true
      return [item.code, item.name, item.kind ?? '', item.description]
        .some((value) => value.toLocaleLowerCase('vi').includes(query))
    })
  }, [filter, items, libraryQuery, libraryStatus])
  const libraryPageSize = 20
  const libraryPageCount = Math.max(1, Math.ceil(filteredItems.length / libraryPageSize))
  const visibleItems = useMemo(
    () => filteredItems.slice((libraryPage - 1) * libraryPageSize, libraryPage * libraryPageSize),
    [filteredItems, libraryPage],
  )
  useEffect(() => { setLibraryPage(1) }, [filter, libraryQuery, libraryStatus])
  const configMap = useMemo(() => buildRewardConfigMap(items), [items])
  const adminConfigMap = useMemo(() => {
    const byCode = new Map<string, (typeof configMap)[number]>()
    for (const row of configMap) {
      const key = `${row.item.contentType}:${row.item.code}`
      const current = byCode.get(key)
      if (!current || row.item.version > current.item.version) byCode.set(key, row)
    }
    return [...byCode.values()]
  }, [configMap])
  const mapRewardKinds = useMemo(() => {
    const counts = new Map<string, number>()
    for (const row of adminConfigMap) {
      const kind = row.item.kind ?? row.item.contentType
      counts.set(kind, (counts.get(kind) ?? 0) + 1)
    }
    return [...counts.entries()].sort(([left], [right]) => left.localeCompare(right, 'vi'))
  }, [adminConfigMap])
  const filteredConfigMap = useMemo(() => {
    const query = mapQuery.trim().toLocaleLowerCase('vi')
    return adminConfigMap.filter((row) => {
      if (mapChannel !== 'all' && row.channel !== mapChannel) return false
      if (mapRewardKind !== 'all' && (row.item.kind ?? row.item.contentType) !== mapRewardKind) return false
      if (!query) return true
      return [row.item.code, row.item.name, row.trigger, ...row.rewardIds]
        .some((value) => value.toLocaleLowerCase('vi').includes(query))
    }).sort((left, right) => {
      if (left.channel === 'level' && right.channel === 'level') return compareLevelUnlockRules(left.item, right.item)
      return left.item.name.localeCompare(right.item.name, 'vi')
    })
  }, [adminConfigMap, mapChannel, mapQuery, mapRewardKind])
  const mapPageSize = 25
  const mapPageCount = Math.max(1, Math.ceil(filteredConfigMap.length / mapPageSize))
  const visibleConfigMap = useMemo(
    () => filteredConfigMap.slice((mapPage - 1) * mapPageSize, mapPage * mapPageSize),
    [filteredConfigMap, mapPage],
  )
  useEffect(() => { setMapPage(1) }, [mapChannel, mapQuery, mapRewardKind])
  const configErrors = configMap.reduce((total, row) => total + row.issues.filter((issue) => issue.severity === 'error').length, 0)
  const configWarnings = configMap.reduce((total, row) => total + row.issues.filter((issue) => issue.severity === 'warning').length, 0)
  const configNotes = configMap.reduce((total, row) => total + row.issues.filter((issue) => issue.severity === 'info').length, 0)
  const selectedRewardRows = useMemo(() => selectedReward
    ? configMap.filter((row) => row.item.contentType === 'reward' && row.item.code === selectedReward.code)
      .sort((left, right) => right.item.version - left.item.version)
    : [], [configMap, selectedReward])
  const levelTreeGroups = useMemo(() => {
    const groups = new Map<number, typeof filteredConfigMap>()
    for (const row of filteredConfigMap) {
      if (row.channel !== 'level') continue
      const level = Number(row.item.unlockRule.value)
      const band = Math.floor((level - 1) / 10) * 10 + 1
      groups.set(band, [...(groups.get(band) ?? []), row])
    }
    return [...groups.entries()]
      .map(([band, rows]) => [band, [...rows].sort((left, right) => compareLevelUnlockRules(left.item, right.item))] as const)
      .sort(([left], [right]) => left - right)
  }, [filteredConfigMap])
  const otherTreeGroups = useMemo(() => {
    const groups = new Map<string, { channel: ConfigChannel; title: string; rows: typeof filteredConfigMap }>()
    for (const row of filteredConfigMap) {
      if (row.channel === 'level' || row.channel === 'unconfigured') continue
      const reference = String(row.item.unlockRule.value ?? row.item.unlockRule.metric ?? row.item.code)
      const chapter = reference.match(/^(P\d{2})-/)?.[1]
      const actionCategory = row.channel === 'action' ? String(row.item.content.category ?? 'other') : ''
      const key = row.channel === 'storybook' ? `storybook:${chapter ?? 'other'}` : row.channel === 'action' ? `action:${actionCategory}` : `${row.channel}:${reference}`
      const title = row.channel === 'storybook'
        ? chapter ? `Storybook ${chapter}` : 'Storybook khác'
        : row.channel === 'event' ? `Sự kiện · ${reference}` : `Achievement · ${achievementFamilyLabel(actionCategory)}`
      const current = groups.get(key) ?? { channel: row.channel, title, rows: [] }
      current.rows.push(row)
      groups.set(key, current)
    }
    return [...groups.values()]
      .map((group) => ({ ...group, rows: [...group.rows].sort((left, right) => Number(right.item.contentType === 'chapter') - Number(left.item.contentType === 'chapter')) }))
      .sort((left, right) => Number(left.title.includes('khác')) - Number(right.title.includes('khác')) || left.title.localeCompare(right.title, 'vi'))
  }, [filteredConfigMap])
  const treeNavigationGroups = useMemo(() => [
    ...levelTreeGroups.map(([band, rows]) => ({
      key: `level:${band}`,
      title: `Level ${band}–${Math.min(100, band + 9)}`,
      subtitle: `${rows.length} phần thưởng`,
      channel: 'level' as ConfigChannel,
      rows,
    })),
    ...otherTreeGroups.map((group, index) => ({
      key: `${group.channel}:${group.title}:${index}`,
      title: group.title,
      subtitle: `${group.rows.length} cấu hình`,
      channel: group.channel,
      rows: group.rows,
    })),
  ], [levelTreeGroups, otherTreeGroups])
  const levelNavigationGroups = treeNavigationGroups.filter((group) => group.channel === 'level')
  const requirementNavigationGroups = treeNavigationGroups.filter((group) => group.channel !== 'level')
  const selectedTreeGroup = treeNavigationGroups.find((group) => group.key === selectedTreeKey) ?? treeNavigationGroups[0]
  const selectedTreeMilestones = useMemo(() => {
    if (!selectedTreeGroup) return []
    const groups = new Map<string, typeof selectedTreeGroup.rows>()
    for (const row of selectedTreeGroup.rows) {
      const key = selectedTreeGroup.channel === 'level'
        ? `Level ${String(row.item.unlockRule.value)}`
        : row.trigger
      groups.set(key, [...(groups.get(key) ?? []), row])
    }
    return [...groups.entries()]
  }, [selectedTreeGroup])
  useEffect(() => {
    if (treeNavigationGroups.length && !treeNavigationGroups.some((group) => group.key === selectedTreeKey)) {
      setSelectedTreeKey(treeNavigationGroups[0].key)
    }
  }, [selectedTreeKey, treeNavigationGroups])
  const chapterStickers = useMemo(() => {
    try {
      return JSON.parse(form.chapterStickersJson) as Array<{
        id: string
        name: string
        icon: string
        hint: string
        boss?: boolean
        imageUrl?: string
        placeholderUrl?: string
        sheetIndex?: number
        unlockRule?: { metric?: string; operator?: string; target?: number }
      }>
    } catch {
      return []
    }
  }, [form.chapterStickersJson])
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

  const updateChapterSticker = (index: number, patch: Record<string, unknown>) => {
    const stickers = [...chapterStickers]
    stickers[index] = { ...stickers[index], ...patch }
    setForm((current) => ({ ...current, chapterStickersJson: JSON.stringify(stickers, null, 2) }))
  }

  const startEditing = (item: StudioItem, chapterFocus?: ChapterEditorFocus) => {
    const isChapter = item.contentType === 'chapter'
    const isEvent = item.contentType === 'event'
    const catalogChapter = isChapter ? STORYBOOK_PAGES.find((page) => page.slug === String(item.content.slug ?? item.code).toUpperCase()) : undefined
    const itemStickers = Array.isArray(item.content.stickers) ? item.content.stickers : []
    const resolvedChapterStickers = catalogChapter
      ? catalogChapter.stickers.map((catalogSticker, index) => ({
          ...catalogSticker,
          ...(itemStickers[index] && typeof itemStickers[index] === 'object' ? itemStickers[index] : {}),
        }))
      : itemStickers
    const rewardKind = item.kind && kindOptions.includes(item.kind as RewardKind) ? item.kind as RewardKind : 'frame'
    setEditingItem(item)
    setMessage('')
    setAssetUploadError('')
    setForm({
      ...emptyForm(),
      contentType: item.contentType,
      code: item.source === 'runtime' && item.contentType === 'achievement' ? studioAchievementCode(item.code) : item.code,
      name: item.name,
      description: item.description,
      kind: rewardKind,
      rarity: item.rarity,
      assetUrl: item.assets.imageUrl ?? item.assets.thumbnailUrl ?? studioArtwork(item) ?? '',
      thumbnailUrl: item.assets.thumbnailUrl && item.assets.thumbnailUrl !== item.assets.imageUrl ? item.assets.thumbnailUrl : (item.assets.thumbnailUrl ?? ''),
      unlockType: typeof item.unlockRule.type === 'string' ? item.unlockRule.type : 'xp_level',
      unlockValue: String(item.unlockRule.value ?? '1'),
      chapterSlug: String(item.content.slug ?? item.code).toUpperCase(),
      chapterGroup: String(item.content.group ?? 'learning'),
      chapterEmoji: String(item.displayConfig.emoji ?? '📖'),
      chapterColorStart: Array.isArray(item.displayConfig.colors) ? String(item.displayConfig.colors[0] ?? '#4338CA') : '#4338CA',
      chapterColorEnd: Array.isArray(item.displayConfig.colors) ? String(item.displayConfig.colors[1] ?? '#F59E0B') : '#F59E0B',
      chapterTheme: String(item.displayConfig.themeKey ?? 'custom'),
      chapterStory: String(item.content.story ?? ''),
      chapterCoverUrl: item.assets.coverUrl ?? String(item.displayConfig.coverUrl ?? catalogChapter?.coverUrl ?? ''),
      chapterLeftBackgroundUrl: item.assets.leftBackgroundUrl ?? String(item.displayConfig.leftBackgroundUrl ?? catalogChapter?.leftBackgroundUrl ?? ''),
      chapterStickerPageUrl: item.assets.stickerPageUrl ?? String(item.displayConfig.stickerPageUrl ?? catalogChapter?.stickerPageUrl ?? ''),
      chapterStickerSheetUrl: item.assets.stickerSheetUrl ?? String(item.displayConfig.stickerSheetUrl ?? catalogChapter?.stickerSheetUrl ?? ''),
      chapterButtonUrl: String((item.content.buttonAssets as Record<string, unknown> | undefined)?.chapterTabUrl ?? ''),
      stickerButtonUrl: String((item.content.buttonAssets as Record<string, unknown> | undefined)?.stickerTabUrl ?? ''),
      helpButtonUrl: String((item.content.buttonAssets as Record<string, unknown> | undefined)?.helpUrl ?? ''),
      claimButtonUrl: String((item.content.buttonAssets as Record<string, unknown> | undefined)?.claimUrl ?? ''),
      previousButtonUrl: String((item.content.buttonAssets as Record<string, unknown> | undefined)?.previousUrl ?? ''),
      nextButtonUrl: String((item.content.buttonAssets as Record<string, unknown> | undefined)?.nextUrl ?? ''),
      chapterRewardId: String(item.content.rewardId ?? ''),
      chapterStickersJson: isChapter ? JSON.stringify(resolvedChapterStickers, null, 2) : emptyForm().chapterStickersJson,
      eventStartsAt: isEvent ? String(item.content.startsAt ?? '') : '',
      eventEndsAt: isEvent ? String(item.content.endsAt ?? '') : '',
      achievementCategory: String(item.content.category ?? 'learning'),
      achievementMetric: resolveAchievementMetric(String((item.content.requirements as Record<string, unknown> | undefined)?.metric ?? item.unlockRule.metric ?? item.code)),
      achievementMilestonesJson: item.contentType === 'achievement' ? JSON.stringify(item.content.milestones ?? [], null, 2) : emptyForm().achievementMilestonesJson,
      displayJson: JSON.stringify(item.contentType === 'reward'
        ? { ...JSON.parse(displayTemplate(rewardKind)) as Record<string, unknown>, ...item.displayConfig }
        : item.displayConfig ?? {}, null, 2),
      contentJson: isChapter ? '{}' : JSON.stringify(item.content ?? {}, null, 2),
    })
    setPreviewUrl(item.assets.imageUrl ?? studioArtwork(item) ?? '')
    setAssetInfo('')
    setChapterEditorFocus(chapterFocus ?? null)
    openDesigner('single')
    if (!chapterFocus) window.scrollTo({ top: 0, behavior: 'smooth' })
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
      if (!allowed.includes(file.type)) {
        throw new Error('Ảnh icon / preview chỉ nhận file PNG, WebP, JPG hoặc SVG.')
      }
      if (file.size > 3 * 1024 * 1024) {
        throw new Error('Ảnh icon / preview cho phép tối đa 3 MB.')
      }
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

  const uploadChapterMedia = async (file: File, target: 'cover' | 'left' | 'stickerPage' | 'stickerSheet' | 'chapterButton' | 'stickerButton' | 'helpButton' | 'claimButton' | 'previousButton' | 'nextButton' | number, placeholder = false) => {
    const allowed = ['image/png', 'image/webp', 'image/jpeg', 'image/svg+xml']
    if (!allowed.includes(file.type)) {
      setMessage('Ảnh Storybook chỉ nhận PNG, WebP, JPG hoặc SVG.')
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      setMessage('Mỗi ảnh Storybook tối đa 4 MB.')
      return
    }
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

  const create = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      if (form.contentType === 'achievement') {
        if (achievementMilestones.length === 0) throw new Error('Achievement cần ít nhất một mốc tiến hoá.')
        const thresholds = achievementMilestones.map((milestone) => Number(milestone.threshold))
        if (thresholds.some((threshold, index) => !Number.isFinite(threshold) || threshold < 1 || (index > 0 && threshold <= thresholds[index - 1]))) {
          throw new Error('Ngưỡng các mốc phải là số dương, không trùng và tăng dần theo thứ tự tiến hoá.')
        }
        if (achievementMilestones.some((milestone) => !milestone.label.trim() || !milestone.description?.trim())) {
          throw new Error('Mỗi mốc cần có tên và mô tả hiển thị cho trẻ.')
        }
      }
      const createdType = form.contentType
      const displayConfig = form.contentType === 'chapter'
        ? {
            emoji: form.chapterEmoji,
            colors: [form.chapterColorStart, form.chapterColorEnd],
            themeKey: form.chapterTheme,
            layout: 'book_spread',
            coverUrl: form.chapterCoverUrl,
            leftBackgroundUrl: form.chapterLeftBackgroundUrl,
            stickerPageUrl: form.chapterStickerPageUrl,
            stickerSheetUrl: form.chapterStickerSheetUrl,
          }
        : JSON.parse(form.displayJson) as Record<string, unknown>
      const content = form.contentType === 'chapter'
        ? {
            slug: form.chapterSlug.toUpperCase(),
            group: form.chapterGroup,
            story: form.chapterStory,
            rewardId: form.chapterRewardId,
            stickers: JSON.parse(form.chapterStickersJson) as unknown[],
            buttonAssets: {
              chapterTabUrl: form.chapterButtonUrl,
              stickerTabUrl: form.stickerButtonUrl,
              helpUrl: form.helpButtonUrl,
              claimUrl: form.claimButtonUrl,
              previousUrl: form.previousButtonUrl,
              nextUrl: form.nextButtonUrl,
            },
          }
          : form.contentType === 'event'
          ? {
              ...JSON.parse(form.contentJson) as Record<string, unknown>,
              startsAt: form.eventStartsAt,
              endsAt: form.eventEndsAt,
            }
          : form.contentType === 'achievement'
            ? {
                category: form.achievementCategory,
                requirements: { metric: form.achievementMetric, operator: 'gte' },
                milestones: (JSON.parse(form.achievementMilestonesJson) as Array<Record<string, unknown>>).map((milestone, index) => ({
                  ...milestone,
                  label: achievementEvolutionTier(index).label,
                  metric: form.achievementMetric,
                })),
              }
          : JSON.parse(form.contentJson) as Record<string, unknown>
      const updatesExistingVersion = editingItem && (editingItem.status === 'draft' || editingItem.status === 'review')
      const payload = {
          contentType: form.contentType,
          code: form.code,
          name: form.name,
          description: form.description,
          kind: form.contentType === 'reward' ? form.kind : null,
          rarity: form.rarity,
          assets: form.contentType === 'chapter'
            ? {
                thumbnailUrl: form.chapterCoverUrl || form.chapterLeftBackgroundUrl,
                coverUrl: form.chapterCoverUrl,
                leftBackgroundUrl: form.chapterLeftBackgroundUrl,
                stickerPageUrl: form.chapterStickerPageUrl,
                stickerSheetUrl: form.chapterStickerSheetUrl,
              }
            : (form.assetUrl || form.thumbnailUrl)
              ? {
                  thumbnailUrl: form.thumbnailUrl || form.assetUrl,
                  imageUrl: form.assetUrl || form.thumbnailUrl,
                  previewUrl: form.thumbnailUrl || form.assetUrl,
                }
              : {},
          displayConfig,
          unlockRule: form.contentType === 'achievement'
            ? { type: 'action', metric: form.achievementMetric, value: form.achievementMetric }
            : { type: form.unlockType, value: form.unlockValue },
          content,
        }
      if (updatesExistingVersion) await legendStudioApi.update(editingItem.id, payload)
      else await legendStudioApi.create(payload)
      setForm(emptyForm())
      setEditingItem(null)
      setPreviewUrl('')
      setAssetInfo('')
      setFilter(createdType)
      setView('library')
      setMessage(updatesExistingVersion ? 'Đã cập nhật bản nháp hiện tại.' : editingItem ? 'Đã tạo bản chỉnh sửa dưới dạng nháp. Bản đang phát hành chưa bị thay đổi.' : 'Đã tạo bản nháp. Hãy preview trước khi phát hành.')
      await load()
    } catch (error) {
      setMessage(error instanceof SyntaxError
        ? 'JSON cấu hình chưa hợp lệ.'
        : error instanceof Error ? error.message : 'Không tạo được nội dung.')
    } finally {
      setBusy(false)
    }
  }

  const requestLifecycle = async (item: StudioItem, action: LifecycleAction) => {
    if (action !== 'archive') {
      setPendingLifecycle({ item, action })
      return
    }
    setBusy(true)
    try {
      const dependencies = await legendStudioApi.dependencies<DependencyReport>(item.id)
      setPendingLifecycle({ item, action, dependencies })
    } catch (error) {
      const isAuthError = error instanceof ApiError && [401, 403].includes(error.status)
      if (isAuthError) setMessage(error.message || 'Bạn không có quyền thực hiện thao tác này.')
      else setPendingLifecycle({ item, action })
    } finally { setBusy(false) }
  }

  const executeLifecycle = async () => {
    if (!pendingLifecycle) return
    const { item, action } = pendingLifecycle
    setBusy(true)
    try {
      if (action === 'archive') await legendStudioApi.archive(item.id)
      else if (action === 'revert') await legendStudioApi.revertToDraft(item.id)
      else if (action === 'review') await legendStudioApi.update(item.id, { status: 'review' })
      else await legendStudioApi.transition(item.id, action)
      if (action === 'review') setMessage('Đã gửi reviewer duyệt.')
      if (action === 'publish') setMessage('Đã phát hành version lên production.')
      if (action === 'archive') setMessage('Đã archive version. Nội dung được giữ trong lịch sử và chờ hệ thống xóa hoàn toàn sau 3 ngày; inventory đã cấp không bị ảnh hưởng.')
      if (action === 'revert') setMessage('Đã trả version về bản nháp để chỉnh sửa tiếp.')
      setPendingLifecycle(null)
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thực hiện được thao tác.')
    } finally { setBusy(false) }
  }

  const showItemAudit = async (item: StudioItem) => {
    setBusy(true)
    try {
      const result = await legendStudioApi.audit<{ entries: AuditEntry[] }>(item.id)
      setAuditPanel({ itemId: item.id, entries: result.entries ?? [] })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không tải được lịch sử thay đổi.')
    } finally { setBusy(false) }
  }

  const migrateLegacyRewards = async () => {
    const legacyItems = items.filter((item) => item.source === 'legacy' && item.contentType === 'reward')
    if (!legacyItems.length) return
    setBusy(true)
    setMessage('')
    let migrated = 0
    const failed: string[] = []
    for (const item of legacyItems) {
      setMigrationProgress(`${migrated + failed.length + 1}/${legacyItems.length} · ${item.name}`)
      try {
        const kind = kindOptions.includes(item.kind as RewardKind) ? item.kind as RewardKind : 'perk'
        const assetUrl = studioArtwork(item)
        await legendStudioApi.create({
            contentType: 'reward', code: item.code, name: item.name, description: item.description,
            kind, rarity: item.rarity,
            assets: assetUrl ? { thumbnailUrl: assetUrl, imageUrl: assetUrl } : {},
            displayConfig: { ...JSON.parse(displayTemplate(kind)) as Record<string, unknown>, ...item.displayConfig },
            unlockRule: item.unlockRule,
            content: { ...item.content, migratedFrom: 'legacy_reward_catalog' },
          })
        migrated += 1
      } catch { failed.push(item.code) }
    }
    setMigrationProgress('')
    setBusy(false)
    setMessage(failed.length
      ? `Đã tạo ${migrated} draft; ${failed.length} mục chưa migrate: ${failed.join(', ')}.`
      : `Đã đưa đủ ${migrated} reward legacy vào Studio dưới dạng draft. Hãy review trước khi publish.`)
    await load()
  }

  const migrateRuntimeAchievements = async () => {
    const runtimeItems = items.filter((item) => item.source === 'runtime' && item.contentType === 'achievement')
    if (!runtimeItems.length) return
    setBusy(true)
    setMessage('')
    setMigrationProgress(`Đang nhập ${runtimeItems.length} mục…`)
    try {
      const payload = runtimeItems.map((item) => {
        const assetUrl = studioArtwork(item)
        const metric = resolveAchievementMetric(String(item.unlockRule.metric ?? item.code))
        return {
          runtimeKey: item.code,
          code: studioAchievementCode(item.code), name: item.name, description: item.description,
          assets: assetUrl ? { thumbnailUrl: assetUrl, imageUrl: assetUrl } : {},
          displayConfig: item.displayConfig,
          unlockRule: { type: 'action', metric, value: metric },
          content: item.content,
        }
      })
      const result = await legendStudioApi.importRuntimeAchievements(payload)
      setMessage(`Đã tạo ${result.created} draft achievement${result.skipped ? `; bỏ qua ${result.skipped} mã đã có trong Studio` : ''}. Runtime production không bị thay đổi.`)
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? `Không import được Runtime Achievement: ${error.message}` : 'Không import được Runtime Achievement.')
    } finally {
      setMigrationProgress('')
      setBusy(false)
    }
  }

  const lifecycleDialog = pendingLifecycle ? (() => {
    const { item, action, dependencies } = pendingLifecycle
    if (action === 'archive') return {
      title: `Archive ${item.name} v${item.version}?`,
      description: `Version sẽ ngừng hiển thị và được lưu trong lịch sử 3 ngày trước khi hệ thống xóa hoàn toàn. Người học đã sở hữu vẫn giữ phần quà. ${dependencies?.references.length ? `${dependencies.references.length} liên kết đang dùng sẽ được giữ trong audit để kiểm tra.` : 'Không phát hiện dependency đang dùng.'}`,
      label: 'Archive trong 3 ngày', danger: true,
    }
    if (action === 'publish') return {
      title: `Phát hành ${item.code} v${item.version} ngay?`,
      description: 'Version này sẽ trở thành bản production và thay thế version đang chạy cùng mã. Requirement và reward liên kết sẽ có hiệu lực ngay.',
      label: 'Phát hành ngay', danger: false,
    }
    if (action === 'review') return { title: 'Gửi reviewer duyệt?', description: 'Bản nháp sẽ khóa ở trạng thái chờ duyệt. Reviewer có thể phát hành hoặc trả lại bản nháp.', label: 'Gửi duyệt', danger: false }
    return { title: 'Trả version về bản nháp?', description: 'Version sẽ rời hàng chờ duyệt để tiếp tục chỉnh sửa. Production hiện tại không bị ảnh hưởng.', label: 'Trả về nháp', danger: false }
  })() : null

  const mapLifecycleActions = (item: StudioItem, hasBlockingError = false) => (
    <div className="mt-2 flex flex-wrap gap-1.5">
      <button type="button" onClick={() => startEditing(item)} className="flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-xs font-extrabold text-brand-700 hover:bg-brand-50">
        {item.status === 'published' ? <UploadCloud className="h-3.5 w-3.5" aria-hidden="true" /> : <Pencil className="h-3.5 w-3.5" aria-hidden="true" />}
        {studioEditLabel(item)}
      </button>
      {item.source === 'studio' && item.status === 'draft' && <>
        <button type="button" disabled={hasBlockingError || busy} title={hasBlockingError ? 'Sửa lỗi cấu hình trước khi phát hành' : 'Phát hành version nháp này ngay'} onClick={() => void requestLifecycle(item, 'publish')} className="flex min-h-10 items-center gap-1.5 rounded-lg bg-brand-600 px-2 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Phát hành nháp</button>
        <button type="button" disabled={busy} onClick={() => void requestLifecycle(item, 'archive')} className="flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-xs font-extrabold text-danger hover:bg-coral-50"><Archive className="h-3.5 w-3.5" aria-hidden="true" /> Archive</button>
      </>}
      {item.source === 'studio' && (item.status === 'review' || item.status === 'scheduled') && <button type="button" disabled={hasBlockingError || busy} onClick={() => void requestLifecycle(item, 'publish')} className="flex min-h-10 items-center gap-1.5 rounded-lg bg-brand-600 px-2 text-xs font-extrabold text-white disabled:opacity-40"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Phát hành</button>}
      {item.source === 'studio' && item.status === 'published' && <button type="button" disabled={busy} onClick={() => void requestLifecycle(item, 'archive')} className="flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-xs font-extrabold text-danger hover:bg-coral-50"><Archive className="h-3.5 w-3.5" aria-hidden="true" /> Archive bản chính thức</button>}
    </div>
  )
  const renderTreeNavigationButton = (group: (typeof treeNavigationGroups)[number]) => {
    const active = selectedTreeGroup?.key === group.key
    const hasError = group.rows.some((row) => row.issues.some((issue) => issue.severity === 'error'))
    const draftCount = group.rows.filter((row) => row.item.status === 'draft').length
    return <button key={group.key} type="button" onClick={() => setSelectedTreeKey(group.key)} aria-current={active ? 'true' : undefined} className={`flex min-h-14 w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus ${active ? 'bg-brand-600 text-white shadow-md' : 'hover:bg-brand-50'}`}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black ${active ? 'bg-white/20 text-white' : group.channel === 'level' ? 'bg-brand-50 text-brand-700' : 'bg-sky-50 text-sky-700'}`}>
        {group.channel === 'level' ? group.title.match(/\d+/)?.[0] : group.channel === 'storybook' ? <BookOpen className="h-4 w-4" /> : group.channel === 'event' ? <CalendarDays className="h-4 w-4" /> : <Network className="h-4 w-4" />}
      </span>
      <span className="min-w-0 flex-1"><strong className="block truncate text-sm">{group.title}</strong><span className={`block text-[11px] ${active ? 'text-white/80' : 'text-muted'}`}>{group.subtitle}{draftCount ? ` · ${draftCount} nháp` : ''}</span></span>
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${hasError ? 'bg-coral-500' : draftCount ? 'bg-amber-400' : 'bg-mint-500'}`} aria-label={hasError ? 'Có lỗi' : draftCount ? 'Có bản nháp' : 'Hợp lệ'} />
    </button>
  }

  return (
    <div className="space-y-5">
      <section className="ui-card flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4" aria-label="Tổng quan trạng thái catalog">
        <div className="mr-auto">
          <p className="text-xs font-black uppercase tracking-wider text-brand-600">Catalog reward</p>
          <p className="font-display text-xl">{items.length} cấu hình</p>
        </div>
        <div className="flex items-center gap-2 text-sm"><span className="h-2.5 w-2.5 rounded-full bg-mint-500" /><strong>{sourceCounts.studio}</strong><span className="text-muted">Studio</span></div>
        <div className="flex items-center gap-2 text-sm"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><strong>{sourceCounts.legacy}</strong><span className="text-muted">Legacy cần migrate</span></div>
        <div className="flex items-center gap-2 text-sm"><span className="h-2.5 w-2.5 rounded-full bg-brand-500" /><strong>{sourceCounts.runtime}</strong><span className="text-muted">Achievement runtime</span></div>
        {(counts.draft > 0 || counts.review > 0) && <div className="text-sm text-muted"><strong>{counts.draft}</strong> nháp · <strong>{counts.review}</strong> chờ duyệt</div>}
      </section>

      <nav className="ui-card grid grid-cols-1 gap-1 p-2 sm:grid-cols-2 xl:grid-cols-4" aria-label="Chế độ Legend Studio">
        <button type="button" onClick={() => setView('map')} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-black ${view === 'map' ? 'bg-brand-600 text-white shadow-md' : 'text-muted hover:bg-brand-50'}`}>
          <MapIcon className="h-5 w-5" aria-hidden="true" /> Bản đồ cấu hình
        </button>
        <button type="button" onClick={() => setView('library')} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-black ${view === 'library' ? 'bg-brand-600 text-white shadow-md' : 'text-muted hover:bg-brand-50'}`}>
          <Archive className="h-5 w-5" aria-hidden="true" /> Kho nội dung
        </button>
        <button type="button" onClick={() => openDesigner('single')} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-black ${view === 'designer' ? 'bg-brand-600 text-white shadow-md' : 'text-muted hover:bg-brand-50'}`}>
          <UploadCloud className="h-5 w-5" aria-hidden="true" /> Designer Workspace
        </button>
        <button type="button" onClick={() => setView('profile-card')} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-black ${view === 'profile-card' ? 'bg-sky-600 text-white shadow-md' : 'text-muted hover:bg-sky-50'}`}>
          <LayoutTemplate className="h-5 w-5" aria-hidden="true" /> Profile Card Editor
        </button>
      </nav>

      <section className="ui-card p-4" aria-label="Thêm nội dung mới">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-black uppercase tracking-wider text-brand-600">Catalog thống nhất</p><h2 className="font-display text-xl">Thêm mới asset hoặc cấu hình</h2></div>
          <Button onClick={() => setShowCreateMenu((open) => !open)} aria-expanded={showCreateMenu}><Plus className="h-5 w-5" aria-hidden="true" /> Thêm mới</Button>
        </div>
        {showCreateMenu && <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {([
            ['reward', Gift, 'Reward / vật phẩm', 'Frame, nền, title, companion, effect…'],
            ['achievement', Network, 'Achievement tiến hoá', 'Action, metric và các mốc dùng chung'],
            ['chapter', BookOpen, 'Storybook chapter', 'Bìa, nội dung, sticker và quà boss'],
            ['event', CalendarDays, 'Sự kiện', 'Banner, lịch, rule tham gia và reward pool'],
          ] as const).map(([type, Icon, title, description]) => <button key={type} type="button" onClick={() => createNew(type)} className="min-h-28 rounded-2xl border-2 border-border bg-white p-4 text-left transition hover:border-brand-400 hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"><Icon className="h-6 w-6 text-brand-600" aria-hidden="true" /><strong className="mt-3 block">{title}</strong><span className="mt-1 block text-xs text-muted">{description}</span></button>)}
        </div>}
      </section>

      {view === 'designer' && (
        <section className="ui-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-xs font-black uppercase tracking-wider text-brand-600">Không cần SSH</p><h2 className="font-display text-2xl">Designer Workspace</h2><p className="text-sm text-muted">Tạo hoặc thay một asset; import ZIP khi cần phát hành cả bộ reward và achievement.</p></div>
            <div className="flex rounded-xl border border-border bg-slate-50 p-1" role="group" aria-label="Cách đưa asset vào CMS">
              <button type="button" onClick={() => setDesignerMode('single')} className={`flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-extrabold ${designerMode === 'single' ? 'bg-brand-600 text-white' : 'text-muted'}`}><Pencil className="h-4 w-4" aria-hidden="true" /> Một asset</button>
              <button type="button" onClick={() => setDesignerMode('pack')} className={`flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-extrabold ${designerMode === 'pack' ? 'bg-brand-600 text-white' : 'text-muted'}`}><PackageOpen className="h-4 w-4" aria-hidden="true" /> Import ZIP</button>
            </div>
          </div>
          <ol className="mt-4 grid gap-2 text-sm sm:grid-cols-4" aria-label="Quy trình designer">
            {['1. Chọn template', '2. Upload & kiểm tra', '3. Lưu draft', '4. Reviewer publish'].map((step) => <li key={step} className="rounded-xl bg-brand-50 px-3 py-2 font-bold text-brand-700">{step}</li>)}
          </ol>
        </section>
      )}

      {view === 'designer' && designerMode === 'pack' && <RewardPackAdmin />}

      {view === 'profile-card' && <ProfileCardLayoutEditor item={profileLayoutItem} onChanged={load} />}

      {view === 'map' && (
        <section className="space-y-4">
          <header className="ui-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-brand-600">Kiểm tra cấu hình</p>
                <h2 className="font-display text-2xl">Bản đồ điều kiện & phần thưởng</h2>
                <p className="mt-1 max-w-3xl text-sm text-muted">Đối chiếu một nơi: nội dung nào được mở bởi level, sự kiện, Storybook hay action; quà đầu ra là gì và cấu hình nào cần sửa trước khi phát hành.</p>
              </div>
              <div className="flex flex-wrap gap-2"><Button onClick={() => { setMappingBuilderLevel(undefined); setMappingBuilderOpen((open) => !open) }}><Link2 className="h-4 w-4" /> Gắn phần quà</Button><Button variant="secondary" onClick={() => void load()} disabled={busy}>↻ Kiểm tra lại</Button></div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-5">
              <div className="rounded-2xl bg-slate-50 p-4"><strong className="text-2xl">{configMap.length}</strong><span className="block text-xs text-muted">cấu hình</span></div>
              <div className="rounded-2xl bg-mint-100 p-4 text-success"><strong className="text-2xl">{configMap.filter((row) => row.issues.every((issue) => issue.severity === 'info')).length}</strong><span className="block text-xs">đạt kiểm tra</span></div>
              <div className="rounded-2xl bg-coral-50 p-4 text-danger"><strong className="text-2xl">{configErrors}</strong><span className="block text-xs">lỗi chặn publish</span></div>
              <div className="rounded-2xl bg-amber-50 p-4 text-amber-800"><strong className="text-2xl">{configWarnings}</strong><span className="block text-xs">cảnh báo</span></div>
              <div className="rounded-2xl bg-sky-50 p-4 text-sky-800"><strong className="text-2xl">{configNotes}</strong><span className="block text-xs">ghi chú hệ thống</span></div>
            </div>
            <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
              <p className="rounded-xl bg-mint-50 px-3 py-2 text-emerald-900"><strong>Đang phát hành → Tạo bản chỉnh sửa:</strong> bản hiện tại vẫn chạy cho tới khi bản mới được duyệt và publish.</p>
              <p className="rounded-xl bg-brand-50 px-3 py-2 text-brand-900"><strong>Bản nháp → Sửa bản nháp:</strong> cập nhật trực tiếp vì nội dung này chưa đến tay người dùng.</p>
            </div>
            {sourceCounts.legacyRewards > 0 && <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
              <AlertTriangle className="h-6 w-6 shrink-0 text-amber-700" aria-hidden="true" />
              <div className="min-w-48 flex-1"><strong>{sourceCounts.legacyRewards} reward legacy chưa thuộc Studio</strong><p className="text-xs text-amber-900">Migrate sẽ giữ nguyên code, rule, ảnh fallback và tạo draft có template slot/layer chuẩn. Không tự publish.</p>{legacyMigrationIssues.length === 0 ? <p className="mt-1 text-xs font-extrabold text-emerald-800">✓ Đủ loại asset và ảnh để tạo draft</p> : <p className="mt-1 text-xs font-extrabold text-danger">{legacyMigrationIssues.length} lỗi cần xử lý trước khi migrate</p>}</div>
              <Button variant="secondary" disabled={busy || legacyMigrationIssues.length > 0} onClick={() => { if (window.confirm(`Tạo ${sourceCounts.legacyRewards} bản nháp Studio từ legacy catalog? Thao tác này không publish.`)) void migrateLegacyRewards() }}><UploadCloud className="h-4 w-4" aria-hidden="true" /> {migrationProgress || `Migrate ${sourceCounts.legacyRewards} mục`}</Button>
            </div>}
            {sourceCounts.runtime > 0 && <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50 p-4"><Network className="h-6 w-6 shrink-0 text-sky-700" aria-hidden="true" /><div className="min-w-48 flex-1"><strong>{sourceCounts.runtime} Runtime Achievement chưa có bản Studio</strong><p className="text-xs text-sky-900">Tạo toàn bộ thành draft để quản lý ảnh, milestone và version. Không tự publish.</p></div><Button variant="secondary" disabled={busy} onClick={() => { if (window.confirm(`Tạo ${sourceCounts.runtime} bản nháp Studio từ Runtime Achievement? Production hiện tại không bị thay đổi.`)) void migrateRuntimeAchievements() }}><UploadCloud className="h-4 w-4" /> {migrationProgress || `Đưa cả ${sourceCounts.runtime} mục vào Studio`}</Button></div>}
          </header>

          {mappingBuilderOpen && <div id="reward-mapping-builder" className="relative scroll-mt-4"><button type="button" onClick={() => { setMappingBuilderOpen(false); setMappingBuilderLevel(undefined) }} className="absolute right-4 top-4 z-30 flex min-h-11 items-center gap-2 rounded-xl bg-white px-3 text-sm font-extrabold text-muted shadow-sm"><X className="h-4 w-4" /> Đóng</button><Suspense fallback={<section className="ui-card p-8 text-center text-sm font-bold text-muted">Đang mở trình gắn quà…</section>}><RewardMappingWorkspace items={items} onChanged={load} getArtwork={studioArtwork} builderOnly initialLevel={mappingBuilderLevel} /></Suspense></div>}

          <div className={`ui-card grid gap-3 p-4 ${mapDisplay === 'table' ? 'lg:grid-cols-[minmax(220px,1fr)_2fr]' : ''}`}>
            <input className="field-input min-h-12" value={mapQuery} onChange={(event) => setMapQuery(event.target.value)} placeholder="Tìm mã, tên, action hoặc reward…" aria-label="Tìm trong bản đồ cấu hình" />
            {mapDisplay === 'table' && <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc theo kênh mở khóa">
              {([
                ['all', 'Tất cả'], ['level', 'Theo level'], ['event', 'Theo sự kiện'],
                ['storybook', 'Storybook'], ['action', 'Action / Achievement'], ['unconfigured', 'Chưa cấu hình'],
              ] as const).map(([value, label]) => (
                <button key={value} type="button" onClick={() => setMapChannel(value)} className={`min-h-11 rounded-xl px-3 py-2 text-xs font-extrabold ${mapChannel === value ? 'bg-brand-600 text-white' : 'bg-slate-100 text-muted hover:bg-brand-50'}`}>
                  {label} · {value === 'all' ? adminConfigMap.length : adminConfigMap.filter((row) => row.channel === value).length}
                </button>
              ))}
            </div>}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <p className="text-sm font-bold text-muted">Chọn cách xem phù hợp với công việc đang làm.</p>
            <div className="flex rounded-xl border border-border bg-white p-1" role="group" aria-label="Kiểu hiển thị bản đồ">
              <button type="button" onClick={() => { setMapDisplay('tree'); if (!['level', 'action', 'storybook', 'event'].includes(mapChannel)) setMapChannel('level') }} className={`flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-extrabold ${mapDisplay === 'tree' ? 'bg-brand-600 text-white' : 'text-muted'}`}><Network className="h-4 w-4" aria-hidden="true" /> Cây phần thưởng</button>
              <button type="button" onClick={() => setMapDisplay('table')} className={`flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-extrabold ${mapDisplay === 'table' ? 'bg-brand-600 text-white' : 'text-muted'}`}><List className="h-4 w-4" aria-hidden="true" /> Bảng kiểm tra</button>
            </div>
          </div>

          {mapDisplay === 'tree' && (
            <div className="grid items-start gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="ui-card overflow-hidden lg:sticky lg:top-4" aria-label="Điều hướng cây phần thưởng">
                <div className="border-b border-border bg-gradient-to-br from-brand-50 to-sky-50 p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-brand-600">Xem theo requirement</p>
                  <h3 className="mt-1 font-display text-xl">Danh mục cây</h3>
                  <div className="mt-3 grid grid-cols-2 gap-2" role="group" aria-label="Menu loại requirement">
                    {([
                      ['level', 'Level', MapIcon],
                      ['action', 'Achievement', Network],
                      ['storybook', 'Storybook', BookOpen],
                      ['event', 'Event', CalendarDays],
                    ] as const).map(([channel, label, Icon]) => {
                      const count = adminConfigMap.filter((row) => row.channel === channel).length
                      return <button key={channel} type="button" onClick={() => setMapChannel(channel)} className={`flex min-h-16 flex-col items-start justify-center rounded-xl px-3 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus ${mapChannel === channel ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-brand-900 hover:bg-brand-50'}`}><Icon className="mb-1 h-4 w-4" aria-hidden="true" /><strong className="text-xs">{label}</strong><span className={`text-[10px] ${mapChannel === channel ? 'text-white/75' : 'text-muted'}`}>{count} cấu hình</span></button>
                    })}
                  </div>
                </div>
                <nav className="max-h-[70vh] space-y-1 overflow-y-auto p-2" aria-label="Các chặng và nhóm điều kiện">
                  {levelNavigationGroups.length > 0 && <p className="px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-widest text-muted">Các chặng Level</p>}
                  {levelNavigationGroups.map(renderTreeNavigationButton)}
                  {requirementNavigationGroups.length > 0 && <p className="px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-widest text-muted">Các nhóm {mapChannel === 'action' ? 'Achievement' : mapChannel === 'storybook' ? 'Storybook' : 'Event'}</p>}
                  {requirementNavigationGroups.map(renderTreeNavigationButton)}
                  {treeNavigationGroups.length === 0 && <p className="p-5 text-center text-sm text-muted">Không có nhánh phù hợp bộ lọc.</p>}
                </nav>
              </aside>

              <section className="ui-card min-w-0 overflow-hidden" aria-live="polite">
                {selectedTreeGroup ? <>
                  <header className="flex flex-wrap items-center gap-3 border-b border-border bg-white p-5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 font-display text-white shadow-sm">{selectedTreeGroup.channel === 'level' ? selectedTreeGroup.title.match(/\d+/)?.[0] : <Network className="h-5 w-5" />}</span>
                    <div className="min-w-0 flex-1"><p className="text-xs font-black uppercase tracking-wider text-brand-600">Cây phần thưởng</p><h3 className="font-display text-2xl">{selectedTreeGroup.title}</h3><p className="text-xs text-muted">{selectedTreeGroup.subtitle} · xếp theo thứ tự requirement</p></div>
                    <span className="rounded-full bg-mint-50 px-3 py-1 text-xs font-black text-success">{selectedTreeGroup.rows.filter((row) => row.issues.every((issue) => issue.severity !== 'error')).length}/{selectedTreeGroup.rows.length} hợp lệ</span>
                    <div className="basis-full border-t border-border pt-3"><p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted">Lọc theo loại reward</p><div className="flex flex-wrap gap-1.5" role="group" aria-label="Lọc theo loại phần quà"><button type="button" onClick={() => setMapRewardKind('all')} className={`min-h-9 rounded-lg px-2.5 text-[11px] font-black ${mapRewardKind === 'all' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-brand-700'}`}>Tất cả · {adminConfigMap.length}</button>{mapRewardKinds.map(([kind, count]) => <button key={kind} type="button" onClick={() => setMapRewardKind(kind)} className={`min-h-9 rounded-lg px-2.5 text-[11px] font-black ${mapRewardKind === kind ? 'bg-brand-600 text-white' : 'bg-slate-100 text-muted hover:bg-brand-50'}`}>{kind} · {count}</button>)}</div></div>
                  </header>
                  <div className="p-4 sm:p-6">
                    {selectedTreeMilestones.map(([milestone, rows], milestoneIndex) => (
                      <div key={milestone} className="relative grid grid-cols-[48px_minmax(0,1fr)] gap-3 pb-6 last:pb-0">
                        {milestoneIndex < selectedTreeMilestones.length - 1 && <span className="absolute bottom-0 left-[23px] top-10 w-0.5 bg-brand-100" aria-hidden="true" />}
                        <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-white bg-brand-600 text-xs font-black text-white shadow-clay">{selectedTreeGroup.channel === 'level' ? milestone.replace('Level ', '') : milestoneIndex + 1}</span>
                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2"><h4 className="font-extrabold text-brand-900">{milestone}</h4><span className="rounded-full bg-brand-50 px-2 py-1 text-[10px] font-black text-brand-700">{rows.length} phần quà</span>{selectedTreeGroup.channel === 'level' && <button type="button" onClick={() => openLevelMapping(Number(milestone.replace('Level ', '')))} className="ml-auto flex min-h-10 items-center gap-1.5 rounded-xl border border-brand-200 bg-white px-3 text-xs font-extrabold text-brand-700 shadow-sm hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"><Plus className="h-4 w-4" aria-hidden="true" /> Chỉnh mốc</button>}</div>
                          <div className="grid gap-2 xl:grid-cols-2">
                            {rows.map((row) => row.item.contentType === 'chapter' ? (
                              <ChapterBookMapPreview key={row.item.id} item={row.item} onEdit={(focus) => startEditing(row.item, focus)} lifecycleActions={mapLifecycleActions(row.item, row.issues.some((issue) => issue.severity === 'error'))} />
                            ) : (
                              <article key={row.item.id} className="rounded-2xl border border-border bg-white p-3 shadow-sm transition hover:border-brand-300 hover:shadow-clay">
                                <div className="grid grid-cols-[56px_minmax(0,1fr)_auto] gap-3">
                                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-brand-50"><StudioArtwork item={row.item} meaningful /></div>
                                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${row.item.status === 'published' ? 'bg-mint-50 text-success' : 'bg-brand-50 text-brand-700'}`}>{studioStatusLabel(row.item)}</span><span className="text-[10px] font-black uppercase text-muted">{row.item.kind ?? row.item.contentType}</span></div><h5 className="mt-1 truncate font-extrabold">{row.item.name}</h5><code className="block truncate text-[11px] text-muted">{row.item.code}</code></div>
                                  {row.issues.some((issue) => issue.severity !== 'info') ? <AlertTriangle className="h-5 w-5 text-amber-700" aria-label="Có vấn đề cấu hình" /> : <CheckCircle2 className="h-5 w-5 text-success" aria-label="Hợp lệ" />}
                                </div>
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
                                  {row.item.contentType === 'reward' ? <button type="button" onClick={() => setSelectedReward(row.item)} className="min-h-10 rounded-lg px-2 text-xs font-extrabold text-sky-700 hover:bg-sky-50">Xem chi tiết & lịch sử</button> : <span className="text-xs text-muted">{row.item.description}</span>}
                                  {mapLifecycleActions(row.item, row.issues.some((issue) => issue.severity === 'error'))}
                                </div>
                              </article>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </> : <div className="p-12 text-center text-muted">Không có cấu hình phù hợp bộ lọc.</div>}
              </section>
            </div>
          )}

          {mapDisplay === 'table' && <div className="ui-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3 text-sm text-muted">
              <span>Hiển thị <strong>{visibleConfigMap.length}</strong> / {filteredConfigMap.length} cấu hình</span>
              <span>Trang {mapPage}/{mapPageCount}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-muted">
                  <tr><th className="p-4">Nội dung</th><th className="p-4">Kênh</th><th className="p-4">Trigger / action</th><th className="p-4">Quà đầu ra</th><th className="p-4">Trạng thái kiểm tra</th><th className="p-4">Thao tác</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visibleConfigMap.map((row) => (
                    <tr key={row.item.id} className="align-top">
                      <td className="p-4"><strong>{row.item.name}</strong><code className="mt-1 block text-xs text-muted">{row.item.code} · v{row.item.version} · {row.item.status}</code></td>
                      <td className="p-4"><span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-black text-brand-700">{row.channel}</span></td>
                      <td className="p-4 font-bold">{row.trigger}</td>
                      <td className="p-4">{row.item.contentType === 'reward' ? <span className="text-muted">Chính reward này</span> : row.rewardIds.length ? row.rewardIds.map((id) => <code key={id} className="mb-1 block break-all">{id}</code>) : <span className="font-bold text-amber-700">Chưa gắn quà</span>}</td>
                      <td className="p-4">
                        {row.issues.every((issue) => issue.severity === 'info') ? <><span className="font-extrabold text-success">✓ Hợp lệ</span>{row.issues.map((issue, index) => <p key={`${issue.message}-${index}`} className="mt-1 text-xs text-sky-700">ℹ {issue.message}</p>)}</> : (
                          <ul className="space-y-1">
                            {row.issues.map((issue, index) => <li key={`${issue.message}-${index}`} className={issue.severity === 'error' ? 'font-bold text-danger' : issue.severity === 'warning' ? 'text-amber-800' : 'text-sky-700'}>{issue.severity === 'error' ? '✕' : issue.severity === 'warning' ? '⚠' : 'ℹ'} {issue.message}</li>)}
                          </ul>
                        )}
                      </td>
                      <td className="p-4">{mapLifecycleActions(row.item, row.issues.some((issue) => issue.severity === 'error'))}</td>
                    </tr>
                  ))}
                  {visibleConfigMap.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted">Không có cấu hình phù hợp bộ lọc.</td></tr>}
                </tbody>
              </table>
            </div>
            {filteredConfigMap.length > mapPageSize && (
              <footer className="flex items-center justify-end gap-2 border-t border-border p-4">
                <Button variant="secondary" disabled={mapPage === 1} onClick={() => setMapPage((page) => Math.max(1, page - 1))}>Trang trước</Button>
                <Button variant="secondary" disabled={mapPage === mapPageCount} onClick={() => setMapPage((page) => Math.min(mapPageCount, page + 1))}>Trang sau</Button>
              </footer>
            )}
          </div>}
          {selectedReward && <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-border bg-white p-5 shadow-2xl" aria-label={`Chi tiết điều kiện của ${selectedReward.name}`}><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-50"><StudioArtwork item={selectedReward} meaningful /></div><div className="min-w-0"><p className="text-xs font-black uppercase text-brand-600">Phần quà → Điều kiện</p><h3 className="truncate font-display text-xl">{selectedReward.name}</h3><code className="text-xs text-muted">{selectedReward.code}</code></div></div><button type="button" onClick={() => setSelectedReward(null)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-slate-100" aria-label="Đóng chi tiết"><X className="h-5 w-5" /></button></div><div className="mt-6"><h4 className="font-extrabold">Lịch sử upload & phiên bản</h4><p className="mt-1 text-xs text-muted">Cây chính chỉ hiển thị bản đang phát hành. Nháp, chờ duyệt và bản đã ngừng được quản lý tại đây.</p><div className="mt-3 space-y-3">{selectedRewardRows.map((row) => <article key={row.item.id} className="rounded-2xl border border-border p-4"><div className="flex items-center justify-between gap-2"><span className="rounded-full bg-brand-50 px-2 py-1 text-[10px] font-black uppercase text-brand-700">{row.channel}</span><span className={`text-xs font-black ${row.item.status === 'published' ? 'text-success' : 'text-brand-600'}`}>{studioStatusLabel(row.item)} · v{row.item.version}</span></div><p className="mt-3 font-extrabold">{row.trigger}</p><p className="mt-1 text-xs text-muted">{row.item.unlockRule.metric ? `Metric: ${String(row.item.unlockRule.metric)} · ` : ''}Giá trị: {String(row.item.unlockRule.value ?? '—')}</p>{mapLifecycleActions(row.item, row.issues.some((issue) => issue.severity === 'error'))}</article>)}</div></div><Button className="mt-5 w-full" onClick={() => { setSelectedReward(null); setMappingBuilderOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><Link2 className="h-4 w-4" /> Chỉnh sửa liên kết</Button></aside>}
          <p className="px-2 text-xs text-muted">Bản đồ dùng catalog admin từ StoryMee Hub để kiểm tra chéo. Việc cấp quà và xác thực action vẫn do core-gamification-api quyết định.</p>
        </section>
      )}

      {view === 'library' && (
        <section className="ui-card overflow-hidden">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-brand-600">Quản lý catalog & version</p>
              <h2 className="font-display text-2xl">Kho nội dung phát hành</h2>
            </div>
            <Button onClick={() => setShowCreateMenu(true)}><Plus className="h-5 w-5" aria-hidden="true" /> Thêm mới mọi loại</Button>
          </header>
          <div className="grid gap-3 border-b border-border bg-slate-50/70 p-4 lg:grid-cols-[minmax(240px,1fr)_220px]">
            <label className="relative block">
              <span className="sr-only">Tìm trong kho nội dung</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input className="field-input min-h-12 w-full pl-12" value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} placeholder="Tìm tên, mã hoặc loại reward…" />
            </label>
            <label className="relative block">
              <span className="sr-only">Lọc trạng thái</span>
              <Settings2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true" />
              <select className="field-input min-h-12 w-full pl-12" value={libraryStatus} onChange={(event) => setLibraryStatus(event.target.value as StudioItem['status'] | 'all')}>
                <option value="all">Mọi trạng thái</option><option value="published">Đang phát hành</option><option value="draft">Bản nháp</option><option value="review">Chờ duyệt</option><option value="scheduled">Đã lên lịch</option><option value="retired">Đã archive · chờ xóa</option>
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-2 border-b border-border px-4 py-3">
            {([
              ['all', 'Tất cả', Archive],
              ['reward', 'Reward', Gift],
              ['chapter', 'Storybook', BookOpen],
              ['event', 'Sự kiện', CalendarDays],
              ['achievement', 'Achievement', Network],
            ] as const).map(([value, label, Icon]) => (
              <button key={value} type="button" onClick={() => setFilter(value)} className={`flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-extrabold transition ${filter === value ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-border bg-white text-muted hover:border-brand-300'}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{label}</span>
                <span className="rounded-lg bg-white px-2 py-0.5 text-xs">{value === 'all' ? items.length : items.filter((item) => item.contentType === value).length}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between border-b border-border px-5 py-3 text-sm text-muted">
            <span>Hiển thị <strong className="text-text">{visibleItems.length}</strong> / {filteredItems.length} kết quả</span>
            <span>Trang {libraryPage}/{libraryPageCount}</span>
          </div>
          <div className="divide-y divide-border">
            {visibleItems.length === 0 && <p className="p-10 text-center text-muted">Chưa có nội dung trong mục này. Hãy tạo version đầu tiên.</p>}
            {visibleItems.map((item) => (
              <article key={item.id} className="grid gap-3 px-5 py-3 sm:grid-cols-[52px_1fr_auto] sm:items-center">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-brand-50">
                  {item.contentType === 'reward' ? <StudioArtwork item={item} /> : item.contentType === 'chapter' ? <BookOpen className="h-5 w-5 text-brand-600" aria-hidden="true" /> : <CalendarDays className="h-5 w-5 text-brand-600" aria-hidden="true" />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold">{item.name}</h3>
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-black">{item.contentType}</span>
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-700">{item.rarity}</span>
                  </div>
                  <p className="font-mono text-xs text-muted">{item.code} · v{item.version}</p>
                  <p className="line-clamp-1 text-sm text-muted">{item.description}</p>
                  <details className="mt-2 text-xs text-muted">
                    <summary className="cursor-pointer font-bold text-brand-600">Xem cấu hình & điều kiện</summary>
                    <pre className="mt-2 max-h-40 overflow-auto rounded-xl bg-slate-100 p-3">{JSON.stringify({ unlockRule: item.unlockRule, displayConfig: item.displayConfig, content: item.content }, null, 2)}</pre>
                  </details>
                </div>
                <div className="flex flex-wrap gap-2 sm:max-w-40 sm:justify-end">
                  <span className={`w-full text-right text-xs font-black ${
                    item.status === 'published' ? 'text-success' : item.status === 'retired' ? 'text-muted' : 'text-brand-600'
                  }`}>{studioStatusLabel(item)} · v{item.version}</span>
                  <Button variant="secondary" onClick={() => startEditing(item)}><Pencil className="h-4 w-4" aria-hidden="true" /> {studioEditLabel(item)}</Button>
                  {item.source === 'studio' && item.status === 'draft' && <><Button variant="secondary" onClick={() => void requestLifecycle(item, 'review')}>Gửi reviewer duyệt</Button><Button variant="ghost" className="text-danger" onClick={() => void requestLifecycle(item, 'archive')}><Archive className="h-4 w-4" aria-hidden="true" /> Archive bản nháp</Button></>}
                  {item.source === 'studio' && (item.status === 'review' || item.status === 'scheduled') && <><Button onClick={() => void requestLifecycle(item, 'publish')}><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Phát hành ngay</Button><Button variant="secondary" onClick={() => void requestLifecycle(item, 'revert')}><RotateCcw className="h-4 w-4" aria-hidden="true" /> Trả về nháp</Button></>}
                  {item.source === 'studio' && item.status === 'published' && <Button variant="secondary" className="text-danger" onClick={() => void requestLifecycle(item, 'archive')}><Archive className="h-4 w-4" aria-hidden="true" /> Archive bản chính thức</Button>}
                  {item.source === 'studio' && <Button variant="ghost" onClick={() => void showItemAudit(item)}><History className="h-4 w-4" aria-hidden="true" /> Lịch sử</Button>}
                </div>
                {auditPanel?.itemId === item.id && <div className="rounded-xl bg-slate-50 p-3 text-xs sm:col-start-2 sm:col-end-4"><strong>Lịch sử thay đổi</strong>{auditPanel.entries.length ? auditPanel.entries.map((entry) => <p key={entry.id} className="mt-2">{entry.createdAt} · {entry.actorName ?? 'Hệ thống'} · {entry.action}{entry.summary ? ` — ${entry.summary}` : ''}</p>) : <p className="mt-2 text-muted">Chưa có sự kiện audit.</p>}</div>}
              </article>
            ))}
          </div>
          {filteredItems.length > libraryPageSize && (
            <footer className="flex items-center justify-end gap-2 border-t border-border p-4">
              <Button variant="secondary" disabled={libraryPage === 1} onClick={() => setLibraryPage((page) => Math.max(1, page - 1))}>Trang trước</Button>
              <Button variant="secondary" disabled={libraryPage === libraryPageCount} onClick={() => setLibraryPage((page) => Math.min(libraryPageCount, page + 1))}>Trang sau</Button>
            </footer>
          )}
        </section>
      )}

      {view === 'designer' && designerMode === 'single' && (
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(520px,640px)]">
          <form onSubmit={(event) => void create(event)} className="ui-card order-2 space-y-5 p-5 xl:order-1">
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
                      ['cover', 'Ảnh bìa chapter', 'Tỉ lệ 4:3 · 1600×1200', form.chapterCoverUrl],
                      ['left', 'Background trang trái', 'Tỉ lệ 4:3 · ưu tiên vùng chữ', form.chapterLeftBackgroundUrl],
                      ['stickerPage', 'Nền trang sticker', 'Texture sáng, không làm chìm sticker', form.chapterStickerPageUrl],
                      ['stickerSheet', 'Sheet 9 sticker', 'Lưới 3×3 dùng giống frontend', form.chapterStickerSheetUrl],
                    ] as const).map(([target, label, hint, url]) => (
                      <label id={`chapter-editor-${target}`} key={target} className="scroll-mt-6 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-amber-300 bg-white p-3 text-center hover:border-amber-500">
                        <span className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-amber-50">
                          {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <span className="text-4xl">🖼️</span>}
                        </span>
                        <span className="mt-2 block text-sm font-extrabold">{chapterUploading === target ? 'Đang tải…' : label}</span>
                        <span className="block text-[10px] text-muted">{hint}</span>
                        <input type="file" accept=".png,.webp,.jpg,.jpeg,.svg" className="sr-only" disabled={Boolean(chapterUploading)} onChange={(event) => {
                          const file = event.target.files?.[0]
                          if (file) void uploadChapterMedia(file, target)
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
                          <input type="file" accept=".png,.webp,.jpg,.jpeg,.svg" className="sr-only" disabled={Boolean(chapterUploading)} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadChapterMedia(file, target) }} />
                        </label>
                      ))}
                    </div>
                  </div>
                  <label className="block text-sm font-bold">Lời kể của chapter
                    <textarea required className={`${fieldClass} min-h-36 py-3`} placeholder="Đoạn dẫn truyện hiển thị trên trang trái…" value={form.chapterStory} onChange={(event) => setForm({ ...form, chapterStory: event.target.value })} />
                  </label>
                  <label className="block text-sm font-bold">Reward hoàn thành chapter
                    <select required className={fieldClass} value={form.chapterRewardId} onChange={(event) => setForm({ ...form, chapterRewardId: event.target.value })}>
                      <option value="">Chọn reward đã publish</option>
                      {items.filter((item) => item.contentType === 'reward' && item.status === 'published').map((item) => (
                        <option key={item.id} value={item.code}>{item.name} · {item.code}</option>
                      ))}
                    </select>
                    <span className="mt-1 block text-[10px] text-muted">Boss sticker sẽ cấp reward này sau khi đủ 8 sticker thường.</span>
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
                                if (file) void uploadChapterMedia(file, index, true)
                              }} />
                            </label>
                            <label className="cursor-pointer rounded-xl border-2 border-dashed border-emerald-300 p-2 text-center">
                              <span className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-emerald-50">
                                <ChapterStickerArtwork sticker={sticker} index={index} sheetUrl={form.chapterStickerSheetUrl} />
                              </span>
                              <span className="mt-1 block text-[10px] font-bold">{chapterUploading === `sticker-${index}-art` ? 'Đang tải…' : sticker.imageUrl ? 'Ảnh riêng · bấm để thay' : 'Ảnh từ sheet · bấm để thay'}</span>
                              <input type="file" accept=".png,.webp,.svg" className="sr-only" disabled={Boolean(chapterUploading)} onChange={(event) => {
                                const file = event.target.files?.[0]
                                if (file) void uploadChapterMedia(file, index)
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
                            <div className="rounded-xl bg-slate-50 p-3 text-xs"><strong>{ACHIEVEMENT_METRIC_REGISTRY.find((metric) => metric.value === form.achievementMetric)?.label}</strong><span className="mt-1 block text-muted">Metric: <code>{form.achievementMetric}</code> · Event: <code>{ACHIEVEMENT_METRIC_REGISTRY.find((metric) => metric.value === form.achievementMetric)?.event}</code></span></div>
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
              {form.contentType !== 'chapter' && form.contentType !== 'achievement' && <label className="block min-h-40 cursor-pointer rounded-2xl border-2 border-dashed border-brand-400 bg-white p-8 text-center shadow-sm hover:border-brand-600 hover:bg-brand-50/30">
                <UploadCloud className="mx-auto h-9 w-9 text-brand-600" aria-hidden="true" />
                <span className="mt-3 block text-base font-extrabold">{uploading ? 'Đang kiểm tra và tải lên…' : editingItem ? 'Tải asset mới cho version này' : 'Chọn file đúng template để preview'}</span>
                <span className="mt-1 block text-sm text-muted">{form.contentType === 'reward' ? `${assetDimensionLabel(selectedSpec)} · tối đa ${selectedSpec.maxMb} MB` : 'PNG, WebP, JPG, JSON hoặc WebM'}</span>
                <input type="file" accept={form.contentType === 'reward' ? selectedSpec.formats.join(',') : '.png,.webp,.jpg,.jpeg,.svg,.json,.webm'} className="sr-only" disabled={uploading} onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.currentTarget.value = ''
                  if (file) {
                    void uploadAsset(file)
                  }
                }} />
              </label>}
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
                      <button
                        type="button"
                        onClick={() => setForm((curr) => ({ ...curr, thumbnailUrl: '' }))}
                        className="text-xs font-bold text-danger hover:underline"
                      >
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
                  {thumbnailUploadError && (
                    <p className="mt-2 text-xs font-bold text-danger">{thumbnailUploadError}</p>
                  )}
                </div>
              )}
            </section>

            {form.contentType !== 'achievement' && <section className="space-y-4 rounded-3xl border border-border bg-slate-50/70 p-4">
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
            </section>}

            {form.contentType !== 'chapter' && form.contentType !== 'achievement' && <details className="rounded-3xl border border-border bg-slate-50/70 p-4">
              <summary className="cursor-pointer font-extrabold">4. Cấu hình nâng cao (JSON)</summary>
              <label className="mt-4 block text-xs font-bold">Display JSON
                <textarea className={`${fieldClass} min-h-40 py-3 font-mono text-xs`} value={form.displayJson} onChange={(event) => setForm({ ...form, displayJson: event.target.value })} />
              </label>
              <label className="mt-3 block text-xs font-bold">Chapter / Event JSON
                <textarea className={`${fieldClass} min-h-32 py-3 font-mono text-xs`} value={form.contentJson} onChange={(event) => setForm({ ...form, contentJson: event.target.value })} />
              </label>
            </details>}
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => { setEditingItem(null); setForm(emptyForm()); setPreviewUrl(''); setAssetInfo(''); setAssetUploadError(''); setThumbnailUploadError(''); setMessage(''); setView('map') }} className="flex-1">Hủy</Button>
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
                    {/* Icon preview box */}
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
      )}
      {message && <p className="rounded-2xl bg-brand-50 p-3 text-sm font-bold text-brand-700" aria-live="polite">{message}</p>}
      <ConfirmDialog
        open={Boolean(pendingLifecycle)}
        danger={lifecycleDialog?.danger}
        title={lifecycleDialog?.title ?? 'Xác nhận thao tác'}
        description={lifecycleDialog?.description}
        confirmLabel={lifecycleDialog?.label}
        onConfirm={() => void executeLifecycle()}
        onCancel={() => setPendingLifecycle(null)}
      />
    </div>
  )
}
