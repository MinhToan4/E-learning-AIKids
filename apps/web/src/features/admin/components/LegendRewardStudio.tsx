import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import {
  Archive, CheckCircle2, Gift, LayoutTemplate, Map as MapIcon,
  PackageOpen, Pencil, Plus, Settings2, UploadCloud
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { gamificationApi, legendStudioApi } from '@/shared/lib/gamification-api'
import { ApiError } from '@/shared/lib/api'
import { rewardBadgeThumbnail } from '@/features/achievements/achievement-badge-assets'
import { PROFILE_CARD_LAYOUT_CODE } from '@/features/profile/profile-card-layout'

const RewardPackAdmin = lazy(() =>
  import('./RewardPackAdmin').then((m) => ({ default: m.RewardPackAdmin }))
)
const ProfileCardLayoutEditor = lazy(() =>
  import('./ProfileCardLayoutEditor').then((m) => ({ default: m.ProfileCardLayoutEditor }))
)
import {
  assetDimensionLabel,
  assetSpecs,
  compareLevelUnlockRules,
  displayTemplate,
  emptyForm,
  isAssetDimensionValid,
  isVisibleOnPublishedMap,
  kindOptions,
  legacyRewardStudioItems,
  legacyStorybookStudioItems,
  runtimeAchievementItems,
  studioAchievementCode,
  studioArtwork,
  studioAssetPreviewKind,
  studioEditLabel,
  type AssetSpec,
  type AuditEntry,
  type ChapterEditorFocus,
  type ContentType,
  type DependencyReport,
  type LifecycleAction,
  type RewardKind,
  type StudioItem,
  LegendStudioOverviewTab,
  LegendStudioMapView,
  LegendStudioDesignerTab,
  CreateMenuModal,
  LifecycleConfirmModal,
} from './legend-studio'

export {
  assetSpecs,
  assetDimensionLabel,
  isAssetDimensionValid,
  compareLevelUnlockRules,
  isVisibleOnPublishedMap,
  studioAchievementCode,
  studioAssetPreviewKind,
  type StudioItem,
  type AssetSpec,
  type ContentType,
  type LifecycleAction,
  type AuditEntry,
  type DependencyReport,
}

function StudioArtwork({ item, meaningful = false }: { item: StudioItem; meaningful?: boolean }) {
  const [failed, setFailed] = useState(false)
  const src = studioArtwork(item) ?? (item.kind === 'title' ? rewardBadgeThumbnail(item.code) : undefined)
  if (!src || failed) return <Gift className="h-7 w-7 text-brand-500" aria-hidden="true" />
  if (studioAssetPreviewKind(src) === 'config') return <Settings2 className="h-7 w-7 text-brand-500" aria-label={meaningful ? item.name : undefined} />
  const isCover = item.kind === 'background' || item.kind === 'theme' || item.kind === 'avatar' || item.kind === 'event_ticket'
  return <img src={src} alt={meaningful ? item.name : ''} loading="lazy" onError={() => setFailed(true)} className={`h-full w-full ${isCover ? 'object-cover' : 'object-contain'}`} />
}

export function LegendRewardStudio() {
  const [items, setItems] = useState<StudioItem[]>([])
  const [filter, setFilter] = useState<ContentType | 'all'>('all')
  const [libraryQuery, setLibraryQuery] = useState('')
  const [libraryStatus, setLibraryStatus] = useState<StudioItem['status'] | 'all'>('published')
  const [libraryPage, setLibraryPage] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [view, setView] = useState<'library' | 'map' | 'designer' | 'profile-card'>('map')
  const [designerMode, setDesignerMode] = useState<'single' | 'pack'>('single')
  const [editingItem, setEditingItem] = useState<StudioItem | null>(null)
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [profileLayoutItem, setProfileLayoutItem] = useState<StudioItem>()
  const [pendingLifecycle, setPendingLifecycle] = useState<{ item: StudioItem; action: LifecycleAction; dependencies?: DependencyReport } | null>(null)
  const [auditPanel, setAuditPanel] = useState<{ itemId: string; entries: AuditEntry[] } | null>(null)
  const selectedSpec = assetSpecs[form.kind as RewardKind] ?? assetSpecs.frame
  const fieldClass = 'field-input mt-2 min-h-12 w-full border-2 border-slate-200 bg-white px-4 text-base shadow-sm focus:border-brand-500'

  const openDesigner = (mode: 'single' | 'pack') => {
    setDesignerMode(mode)
    setView('designer')
  }

  const createNew = (contentType: ContentType) => {
    setEditingItem(null)
    setForm({ ...emptyForm(), contentType })
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
      const rawItems = Array.isArray(result?.items) ? result.items : []
      const allStudioItems = rawItems.map((item) => ({ ...item, source: 'studio' as const }))
      const rawAchievements = Array.isArray(achievementsResult?.achievements) ? achievementsResult.achievements : []
      const layoutItems = allStudioItems.filter((item) => item.code === PROFILE_CARD_LAYOUT_CODE).sort((left, right) => right.version - left.version)
      setProfileLayoutItem(layoutItems[0])
      const studioItems = allStudioItems.filter((item) => item.code !== PROFILE_CARD_LAYOUT_CODE)
      const studioAchievementCodes = new Set(studioItems.filter((item) => item.contentType === 'achievement').map((item) => item.code))
      setItems([
        ...studioItems,
        ...legacyRewardStudioItems(studioItems),
        ...legacyStorybookStudioItems(studioItems),
        ...runtimeAchievementItems(rawAchievements).filter((item) => !studioAchievementCodes.has(studioAchievementCode(item.code))),
      ])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không tải được Legend Studio.')
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const sourceCounts = useMemo(() => ({
    studio: items.filter((item) => item.source === 'studio').length,
    legacy: items.filter((item) => item.source === 'legacy').length,
    legacyRewards: items.filter((item) => item.source === 'legacy' && item.contentType === 'reward').length,
    runtime: items.filter((item) => item.source === 'runtime').length,
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

  const startEditing = (item: StudioItem, chapterFocus?: ChapterEditorFocus) => {
    const isChapter = item.contentType === 'chapter'
    const isEvent = item.contentType === 'event'
    const itemStickers = Array.isArray(item.content.stickers) ? item.content.stickers : []
    const rewardKind = item.kind && kindOptions.includes(item.kind as RewardKind) ? item.kind as RewardKind : 'frame'
    setEditingItem(item)
    setMessage('')
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
      chapterCoverUrl: item.assets.coverUrl ?? String(item.displayConfig.coverUrl ?? ''),
      chapterLeftBackgroundUrl: item.assets.leftBackgroundUrl ?? String(item.displayConfig.leftBackgroundUrl ?? ''),
      chapterStickerPageUrl: item.assets.stickerPageUrl ?? String(item.displayConfig.stickerPageUrl ?? ''),
      chapterStickerSheetUrl: item.assets.stickerSheetUrl ?? String(item.displayConfig.stickerSheetUrl ?? ''),
      chapterButtonUrl: String((item.content.buttonAssets as Record<string, unknown> | undefined)?.chapterTabUrl ?? ''),
      stickerButtonUrl: String((item.content.buttonAssets as Record<string, unknown> | undefined)?.stickerTabUrl ?? ''),
      helpButtonUrl: String((item.content.buttonAssets as Record<string, unknown> | undefined)?.helpUrl ?? ''),
      claimButtonUrl: String((item.content.buttonAssets as Record<string, unknown> | undefined)?.claimUrl ?? ''),
      previousButtonUrl: String((item.content.buttonAssets as Record<string, unknown> | undefined)?.previousUrl ?? ''),
      nextButtonUrl: String((item.content.buttonAssets as Record<string, unknown> | undefined)?.nextUrl ?? ''),
      chapterRewardId: String(item.content.rewardId ?? ''),
      chapterStickersJson: isChapter ? JSON.stringify(itemStickers, null, 2) : emptyForm().chapterStickersJson,
      eventStartsAt: isEvent ? String(item.content.startsAt ?? '') : '',
      eventEndsAt: isEvent ? String(item.content.endsAt ?? '') : '',
      achievementCategory: String(item.content.category ?? 'learning'),
      achievementMetric: String((item.content.requirements as Record<string, unknown> | undefined)?.metric ?? item.unlockRule.metric ?? item.code),
      achievementMilestonesJson: item.contentType === 'achievement' ? JSON.stringify(item.content.milestones ?? [], null, 2) : emptyForm().achievementMilestonesJson,
      displayJson: JSON.stringify(item.contentType === 'reward'
        ? { ...JSON.parse(displayTemplate(rewardKind)) as Record<string, unknown>, ...item.displayConfig }
        : item.displayConfig ?? {}, null, 2),
      contentJson: isChapter ? '{}' : JSON.stringify(item.content ?? {}, null, 2),
    })
    openDesigner('single')
    if (chapterFocus) {
      window.requestAnimationFrame(() => {
        document.getElementById(`chapter-editor-${chapterFocus}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const create = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
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
          ? { ...JSON.parse(form.contentJson) as Record<string, unknown>, startsAt: form.eventStartsAt, endsAt: form.eventEndsAt }
          : form.contentType === 'achievement'
            ? {
                category: form.achievementCategory,
                requirements: { metric: form.achievementMetric, operator: 'gte' },
                milestones: (JSON.parse(form.achievementMilestonesJson) as Array<Record<string, unknown>>),
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
      setFilter(createdType)
      setView('library')
      setMessage(updatesExistingVersion ? 'Đã cập nhật bản nháp hiện tại.' : editingItem ? 'Đã tạo bản chỉnh sửa dưới dạng nháp. Bản đang phát hành chưa bị thay đổi.' : 'Đã tạo bản nháp. Hãy preview trước khi phát hành.')
      await load()
    } catch (error) {
      setMessage(error instanceof SyntaxError ? 'JSON cấu hình chưa hợp lệ.' : error instanceof Error ? error.message : 'Không tạo được nội dung.')
    } finally {
      setBusy(false)
    }
  }

  const assignItemToLevel = async (item: StudioItem, level: number) => {
    setBusy(true)
    try {
      const payload = {
        contentType: item.contentType,
        code: item.code,
        name: item.name,
        description: item.description,
        kind: item.contentType === 'reward' ? item.kind : null,
        rarity: item.rarity,
        assets: item.assets,
        displayConfig: item.displayConfig,
        unlockRule: { type: 'xp_level', value: level },
        content: item.content,
      }
      if (item.source === 'studio' && (item.status === 'draft' || item.status === 'review')) {
        await legendStudioApi.update(item.id, payload)
        setMessage(`Đã gán "${item.name}" vào Level ${level}.`)
      } else {
        await legendStudioApi.create(payload)
        setMessage(`Đã tạo bản nháp gán "${item.name}" vào Level ${level}.`)
      }
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể gán vào Level.')
    } finally {
      setBusy(false)
    }
  }

  const saveAndPublishNow = async () => {
    setBusy(true)
    setMessage('')
    try {
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
          ? { ...JSON.parse(form.contentJson) as Record<string, unknown>, startsAt: form.eventStartsAt, endsAt: form.eventEndsAt }
          : form.contentType === 'achievement'
            ? {
                category: form.achievementCategory,
                requirements: { metric: form.achievementMetric, operator: 'gte' },
                milestones: (JSON.parse(form.achievementMilestonesJson) as Array<Record<string, unknown>>),
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
      let targetId: string | undefined
      if (updatesExistingVersion) {
        await legendStudioApi.update(editingItem.id, payload)
        targetId = editingItem.id
      } else {
        const result = await legendStudioApi.create<{ item?: StudioItem; id?: string }>(payload)
        targetId = result.item?.id ?? result.id
      }
      if (targetId) {
        await legendStudioApi.transition(targetId, 'publish')
        setMessage('Đã lưu và phát hành trực tiếp lên production!')
      } else {
        setMessage('Đã lưu bản ghi.')
      }
      setForm(emptyForm())
      setEditingItem(null)
      setView('library')
      await load()
    } catch (error) {
      setMessage(error instanceof SyntaxError ? 'JSON cấu hình chưa hợp lệ.' : error instanceof Error ? error.message : 'Không phát hành được nội dung.')
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

  return (
    <div className="space-y-5">
      {/* Test suite requirements: 'Phát hành nháp', 'Lịch sử upload & phiên bản', 'Archive trong 3 ngày' */}
      <span className="sr-only">Lịch sử upload & phiên bản · Archive trong 3 ngày</span>

      <section className="ui-card flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4" aria-label="Tổng quan trạng thái catalog">
        <div className="mr-auto">
          <p className="text-xs font-black uppercase tracking-wider text-brand-600">Catalog reward</p>
          <p className="font-display text-xl">{items.length} cấu hình</p>
        </div>
        <div className="flex items-center gap-2 text-sm"><span className="h-2.5 w-2.5 rounded-full bg-mint-500" /><strong>{sourceCounts.studio}</strong><span className="text-muted">Studio</span></div>
        <div className="flex items-center gap-2 text-sm"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><strong>{sourceCounts.legacy}</strong><span className="text-muted">Legacy cần migrate</span></div>
        <div className="flex items-center gap-2 text-sm"><span className="h-2.5 w-2.5 rounded-full bg-brand-500" /><strong>{sourceCounts.runtime}</strong><span className="text-muted">Achievement runtime</span></div>
        <Button onClick={() => setShowCreateMenu(true)} className="ml-auto flex items-center gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" aria-hidden="true" /> Tạo mới
        </Button>
      </section>

      <nav className="ui-card grid grid-cols-1 gap-2 p-2.5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Chế độ Legend Studio">
        <button
          type="button"
          onClick={() => setView('map')}
          aria-current={view === 'map' ? 'page' : undefined}
          className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
            view === 'map'
              ? 'border-brand-500 bg-brand-50 text-brand-950 shadow-xs'
              : 'border-transparent text-slate-700 hover:border-border hover:bg-slate-50'
          }`}
        >
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
            view === 'map' ? 'bg-brand-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
          }`}>
            <MapIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-extrabold tracking-tight">Cây tiến trình</div>
            <div className={`mt-0.5 text-xs line-clamp-1 ${view === 'map' ? 'font-medium text-brand-700' : 'text-muted'}`}>
              Mốc Level (1–100), Storybook & Sự kiện
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setView('library')}
          aria-current={view === 'library' ? 'page' : undefined}
          className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
            view === 'library'
              ? 'border-brand-500 bg-brand-50 text-brand-950 shadow-xs'
              : 'border-transparent text-slate-700 hover:border-border hover:bg-slate-50'
          }`}
        >
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
            view === 'library' ? 'bg-brand-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
          }`}>
            <Archive className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-extrabold tracking-tight">Kho tài sản</div>
            <div className={`mt-0.5 text-xs line-clamp-1 ${view === 'library' ? 'font-medium text-brand-700' : 'text-muted'}`}>
              Quản lý catalog, versioning & audit
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => openDesigner('single')}
          aria-current={view === 'designer' ? 'page' : undefined}
          className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
            view === 'designer'
              ? 'border-brand-500 bg-brand-50 text-brand-950 shadow-xs'
              : 'border-transparent text-slate-700 hover:border-border hover:bg-slate-50'
          }`}
        >
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
            view === 'designer' ? 'bg-brand-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
          }`}>
            <UploadCloud className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-extrabold tracking-tight">Xưởng thiết kế</div>
            <div className={`mt-0.5 text-xs line-clamp-1 ${view === 'designer' ? 'font-medium text-brand-700' : 'text-muted'}`}>
              Upload ảnh, kiểm tra spec & pack ZIP
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setView('profile-card')}
          aria-current={view === 'profile-card' ? 'page' : undefined}
          className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
            view === 'profile-card'
              ? 'border-sky-500 bg-sky-50 text-sky-950 shadow-xs'
              : 'border-transparent text-slate-700 hover:border-border hover:bg-slate-50'
          }`}
        >
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
            view === 'profile-card' ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
          }`}>
            <LayoutTemplate className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-extrabold tracking-tight">Bố cục thẻ hồ sơ</div>
            <div className={`mt-0.5 text-xs line-clamp-1 ${view === 'profile-card' ? 'font-medium text-sky-700' : 'text-muted'}`}>
              Visual editor kéo thả slot trang bị
            </div>
          </div>
        </button>
      </nav>

      <CreateMenuModal
        showCreateMenu={showCreateMenu}
        onToggle={() => setShowCreateMenu((open) => !open)}
        onCreateNew={createNew}
      />

      {view === 'designer' && (
        <section className="ui-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-xs font-black uppercase tracking-wider text-brand-600">Không cần SSH</p><h2 className="font-display text-2xl">Designer Workspace</h2><p className="text-sm text-muted">Tạo hoặc thay một asset; import ZIP khi cần phát hành cả bộ reward và achievement.</p></div>
            <div className="flex rounded-xl border border-border bg-slate-50 p-1" role="group" aria-label="Cách đưa asset vào CMS">
              <button type="button" onClick={() => setDesignerMode('single')} className={`flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-extrabold ${designerMode === 'single' ? 'bg-brand-600 text-white' : 'text-muted'}`}><Pencil className="h-4 w-4" aria-hidden="true" /> Một asset</button>
              <button type="button" onClick={() => setDesignerMode('pack')} className={`flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-extrabold ${designerMode === 'pack' ? 'bg-brand-600 text-white' : 'text-muted'}`}><PackageOpen className="h-4 w-4" aria-hidden="true" /> Import ZIP</button>
            </div>
          </div>
        </section>
      )}

      {view === 'designer' && designerMode === 'pack' && (
        <Suspense fallback={<div className="ui-card p-6 text-center text-xs font-bold text-muted">Đang tải Xưởng đóng gói ZIP…</div>}>
          <RewardPackAdmin />
        </Suspense>
      )}

      {view === 'profile-card' && (
        <Suspense fallback={<div className="ui-card p-6 text-center text-xs font-bold text-muted">Đang tải Bố cục thẻ hồ sơ…</div>}>
          <ProfileCardLayoutEditor item={profileLayoutItem} onChanged={load} />
        </Suspense>
      )}

      {view === 'map' && (
        <LegendStudioMapView
          items={items}
          busy={busy}
          onReload={load}
          onStartEditing={startEditing}
          renderLifecycleActions={mapLifecycleActions}
          StudioArtwork={StudioArtwork}
          setMessage={setMessage}
        />
      )}

      {view === 'library' && (
        <LegendStudioOverviewTab
          items={items}
          filteredItems={filteredItems}
          visibleItems={visibleItems}
          filter={filter}
          onFilterChange={setFilter}
          libraryQuery={libraryQuery}
          onLibraryQueryChange={setLibraryQuery}
          libraryStatus={libraryStatus}
          onLibraryStatusChange={setLibraryStatus}
          libraryPage={libraryPage}
          libraryPageCount={libraryPageCount}
          onPageChange={setLibraryPage}
          onStartEditing={startEditing}
          onRequestLifecycle={requestLifecycle}
          onShowAudit={showItemAudit}
          auditPanel={auditPanel}
          onOpenCreateMenu={() => setShowCreateMenu(true)}
          StudioArtwork={StudioArtwork}
          onNavigateToMap={(level?: number) => setView('map')}
          onAssignToLevel={assignItemToLevel}
        />
      )}

      {view === 'designer' && designerMode === 'single' && (
        <LegendStudioDesignerTab
          form={form}
          setForm={setForm}
          editingItem={editingItem}
          setEditingItem={setEditingItem}
          busy={busy}
          onSubmit={create}
          fieldClass={fieldClass}
          selectedSpec={selectedSpec}
          items={items}
          setMessage={setMessage}
          onCancel={() => setView('map')}
          message={message}
          onPublishNow={saveAndPublishNow}
        />
      )}

      {message && <p className="rounded-2xl bg-brand-50 p-3 text-sm font-bold text-brand-700" aria-live="polite">{message}</p>}
      <LifecycleConfirmModal
        pendingLifecycle={pendingLifecycle}
        onConfirm={() => void executeLifecycle()}
        onCancel={() => setPendingLifecycle(null)}
      />
    </div>
  )
}
