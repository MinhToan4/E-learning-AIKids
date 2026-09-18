import { lazy, Suspense, useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react'
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  LayoutGrid,
  LayoutList,
  Link2,
  List,
  Map as MapIcon,
  Network,
  Plus,
  RotateCcw,
  Search,
  UploadCloud,
  X,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { legendStudioApi } from '@/shared/lib/gamification-api'
import { buildRewardConfigMap, type ConfigChannel } from '../../lib/reward-config-map'
import type { ChapterEditorFocus, RewardKind, StudioItem } from './types'
import {
  compareLevelUnlockRules,
  displayTemplate,
  kindOptions,
  studioAchievementCode,
  studioArtwork,
  achievementFamilyLabel,
} from './constants'
import { ChapterBookMapPreview } from './LegendStudioChapterEditor'
import { SelectedRewardDrawer } from './LegendStudioModals'
import { resolveAchievementMetric } from '@/features/achievements/achievement-config'

export const FIXED_LEVEL_BANDS = [1, 11, 21, 31, 41, 51, 61, 71, 81, 91] as const

export const LEVEL_ALLOWED_KINDS = new Set<string>([
  'avatar',
  'background',
  'companion',
  'effect',
  'frame',
  'perk',
  'theme',
  'title',
])

export const KIND_DISPLAY_LABELS: Record<string, string> = {
  all: 'Tất cả',
  frame: 'Khung',
  avatar: 'Avatar',
  effect: 'Hiệu ứng',
  companion: 'Bạn đồng hành',
  title: 'Danh hiệu',
  theme: 'Chủ đề',
  perk: 'Đặc quyền',
  background: 'Hình nền',
  chapter: 'Storybook',
  event: 'Sự kiện',
  achievement: 'Achievement',
}

const RewardMappingWorkspace = lazy(() =>
  import('../RewardMappingWorkspace').then((m) => ({ default: m.RewardMappingWorkspace }))
)

export interface LegendStudioMapViewProps {
  items: StudioItem[]
  busy: boolean
  onReload: () => Promise<void>
  onStartEditing: (item: StudioItem, chapterFocus?: ChapterEditorFocus) => void
  renderLifecycleActions: (item: StudioItem, hasBlockingError?: boolean) => ReactNode
  StudioArtwork: ComponentType<{ item: StudioItem; meaningful?: boolean }>
  setMessage: (msg: string) => void
}

export function LegendStudioMapView({
  items,
  busy,
  onReload,
  onStartEditing,
  renderLifecycleActions,
  StudioArtwork,
  setMessage,
}: LegendStudioMapViewProps) {
  const [mapChannel, setMapChannel] = useState<ConfigChannel | 'all'>('level')
  const [mapRewardKind, setMapRewardKind] = useState<string>('all')
  const [mapQuery, setMapQuery] = useState('')
  const [mapPage, setMapPage] = useState(1)
  const [mapDisplay, setMapDisplay] = useState<'tree' | 'table'>('tree')
  const [selectedTreeKey, setSelectedTreeKey] = useState('level:1')
  const [mappingBuilderOpen, setMappingBuilderOpen] = useState(false)
  const [mappingBuilderLevel, setMappingBuilderLevel] = useState<number>()
  const [selectedReward, setSelectedReward] = useState<StudioItem | null>(null)
  const [migrationProgress, setMigrationProgress] = useState('')

  // Studio Design Ops States
  const [showAllLevels, setShowAllLevels] = useState(true)
  const [cardDensity, setCardDensity] = useState<'grid' | 'list'>('grid')
  const [quickJumpInput, setQuickJumpInput] = useState('')
  const [legacyBannerCollapsed, setLegacyBannerCollapsed] = useState(true)
  const [runtimeBannerCollapsed, setRuntimeBannerCollapsed] = useState(true)
  const [highlightedMilestone, setHighlightedMilestone] = useState<number | null>(null)

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

  const channelScopedRows = useMemo(() => {
    if (mapChannel === 'all') return adminConfigMap
    return adminConfigMap.filter((row) => row.channel === mapChannel)
  }, [adminConfigMap, mapChannel])

  const mapRewardKinds = useMemo(() => {
    const kindCounts = new Map<string, number>()
    for (const row of channelScopedRows) {
      const kind = row.item.kind ?? row.item.contentType
      if (mapChannel === 'level' && !LEVEL_ALLOWED_KINDS.has(kind)) {
        continue
      }
      kindCounts.set(kind, (kindCounts.get(kind) ?? 0) + 1)
    }
    return [...kindCounts.entries()].sort(([left], [right]) => left.localeCompare(right, 'vi'))
  }, [channelScopedRows, mapChannel])

  useEffect(() => {
    if (mapRewardKind !== 'all') {
      const exists = mapRewardKinds.some(([kind]) => kind === mapRewardKind)
      if (!exists) {
        setMapRewardKind('all')
      }
    }
  }, [mapRewardKinds, mapRewardKind])

  const handleToggleKindFilter = (kind: string) => {
    setMapRewardKind((current) => (current === kind ? 'all' : kind))
  }

  const handleResetFilters = () => {
    setMapRewardKind('all')
    setMapQuery('')
  }

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
    // Always initialize all 10 fixed level bands so they never disappear from the sidebar
    for (const band of FIXED_LEVEL_BANDS) {
      groups.set(band, [])
    }
    for (const row of filteredConfigMap) {
      if (row.channel !== 'level') continue
      const level = Number(row.item.unlockRule.value)
      if (isNaN(level) || level < 1) continue
      const band = Math.floor((Math.min(100, level) - 1) / 10) * 10 + 1
      const currentRows = groups.get(band) ?? []
      currentRows.push(row)
      groups.set(band, currentRows)
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

  const levelNavigationGroups = useMemo(
    () => treeNavigationGroups.filter((group) => group.channel === 'level'),
    [treeNavigationGroups],
  )
  const requirementNavigationGroups = useMemo(
    () => treeNavigationGroups.filter((group) => group.channel !== 'level'),
    [treeNavigationGroups],
  )
  const selectedTreeGroup = useMemo(() => {
    const activeGroups = mapChannel === 'level' ? levelNavigationGroups : requirementNavigationGroups
    return activeGroups.find((group) => group.key === selectedTreeKey) ?? activeGroups[0] ?? treeNavigationGroups[0]
  }, [mapChannel, levelNavigationGroups, requirementNavigationGroups, selectedTreeKey, treeNavigationGroups])

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

  // Current Level Band details (e.g. 21 to 30)
  const currentBandInfo = useMemo(() => {
    if (!selectedTreeGroup || selectedTreeGroup.channel !== 'level') return null
    const match = selectedTreeGroup.title.match(/Level\s+(\d+)–(\d+)/)
    if (!match) return null
    const start = Number(match[1])
    const end = Number(match[2])
    const levels: number[] = []
    for (let l = start; l <= end; l++) {
      levels.push(l)
    }
    return { start, end, levels }
  }, [selectedTreeGroup])

  // Map of level -> rows for the selected group
  const currentBandLevelRowsMap = useMemo(() => {
    if (!selectedTreeGroup || selectedTreeGroup.channel !== 'level') {
      return new Map<number, typeof selectedTreeGroup.rows>()
    }
    const map = new Map<number, typeof selectedTreeGroup.rows>()
    for (const row of selectedTreeGroup.rows) {
      const lvl = Number(row.item.unlockRule.value)
      if (!isNaN(lvl)) {
        map.set(lvl, [...(map.get(lvl) ?? []), row])
      }
    }
    return map
  }, [selectedTreeGroup])

  useEffect(() => {
    const activeGroups = mapChannel === 'level' ? levelNavigationGroups : requirementNavigationGroups
    if (activeGroups.length && !activeGroups.some((group) => group.key === selectedTreeKey)) {
      setSelectedTreeKey(activeGroups[0].key)
    }
  }, [mapChannel, levelNavigationGroups, requirementNavigationGroups, selectedTreeKey])

  const openLevelMapping = (level: number) => {
    setMappingBuilderLevel(level)
    setMappingBuilderOpen(true)
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() =>
        document.getElementById('reward-mapping-builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      )
    )
  }

  const handleQuickJump = (lvlInput: string) => {
    const lvl = parseInt(lvlInput.trim(), 10)
    if (isNaN(lvl) || lvl < 1) return
    const clampedLvl = Math.min(100, Math.max(1, lvl))
    const band = Math.floor((clampedLvl - 1) / 10) * 10 + 1
    setShowAllLevels(true)
    setMapChannel('level')
    setSelectedTreeKey(`level:${band}`)
    setHighlightedMilestone(clampedLvl)

    setTimeout(() => {
      const el = document.getElementById(`milestone-level-${clampedLvl}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 120)

    setTimeout(() => {
      setHighlightedMilestone(null)
    }, 2500)
  }

  const handlePacerClick = (lvl: number) => {
    setShowAllLevels(true)
    setHighlightedMilestone(lvl)
    const el = document.getElementById(`milestone-level-${lvl}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    setTimeout(() => {
      setHighlightedMilestone(null)
    }, 2000)
  }

  const migrateLegacyRewards = async () => {
    const legacyItems = items.filter((item) => item.source === 'legacy' && item.contentType === 'reward')
    if (!legacyItems.length) return
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
    setMessage(failed.length
      ? `Đã tạo ${migrated} draft; ${failed.length} mục chưa migrate: ${failed.join(', ')}.`
      : `Đã đưa đủ ${migrated} reward legacy vào Studio dưới dạng draft. Hãy review trước khi publish.`)
    await onReload()
  }

  const migrateRuntimeAchievements = async () => {
    const runtimeItems = items.filter((item) => item.source === 'runtime' && item.contentType === 'achievement')
    if (!runtimeItems.length) return
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
      await onReload()
    } catch (error) {
      setMessage(error instanceof Error ? `Không import được Runtime Achievement: ${error.message}` : 'Không import được Runtime Achievement.')
    } finally {
      setMigrationProgress('')
    }
  }

  const renderRewardCard = (row: (typeof filteredConfigMap)[number]) => {
    const hasError = row.issues.some((issue) => issue.severity === 'error')
    const hasWarning = row.issues.some((issue) => issue.severity === 'warning')

    if (row.item.contentType === 'chapter') {
      return (
        <ChapterBookMapPreview
          key={row.item.id}
          item={row.item}
          onEdit={(focus) => onStartEditing(row.item, focus)}
          lifecycleActions={renderLifecycleActions(row.item, hasError)}
        />
      )
    }

    if (cardDensity === 'list') {
      return (
        <article
          key={row.item.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white px-3 py-2 transition hover:border-brand-400 hover:bg-slate-50/60"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
              <StudioArtwork item={row.item} meaningful />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h5 className="truncate text-xs font-bold text-slate-900" title={row.item.name}>{row.item.name}</h5>
                <code className="hidden truncate font-mono text-[10px] text-slate-400 sm:inline" title={row.item.code}>{row.item.code}</code>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="font-mono uppercase text-slate-500 font-semibold">{row.item.kind ?? row.item.contentType}</span>
                <span className="text-slate-300">·</span>
                <span className={`font-semibold ${row.item.status === 'published' ? 'text-emerald-700' : row.item.status === 'draft' ? 'text-amber-700' : 'text-slate-600'}`}>
                  {row.item.status === 'published' ? 'Published' : row.item.status === 'draft' ? 'Draft' : row.item.status}
                </span>
                <span className="text-slate-300">·</span>
                <span className="font-mono text-slate-400">v{row.item.version}</span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {hasError ? (
              <AlertTriangle className="h-4 w-4 text-rose-600" aria-label="Lỗi chặn" />
            ) : hasWarning ? (
              <AlertTriangle className="h-4 w-4 text-amber-600" aria-label="Cảnh báo" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-label="Hợp lệ" />
            )}

            {row.item.contentType === 'reward' && (
              <button
                type="button"
                onClick={() => setSelectedReward(row.item)}
                className="hidden text-xs font-semibold text-brand-600 hover:underline sm:inline"
              >
                Chi tiết
              </button>
            )}

            <div className="scale-90 origin-right">
              {renderLifecycleActions(row.item, hasError)}
            </div>
          </div>
        </article>
      )
    }

    // Default: Compact Grid Card
    return (
      <article
        key={row.item.id}
        className="group relative flex flex-col justify-between rounded-lg border border-border bg-white p-2.5 transition hover:border-brand-400 hover:shadow-xs"
      >
        <div className="flex items-start gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50 transition group-hover:scale-105">
            <StudioArtwork item={row.item} meaningful />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <h5 className="truncate text-xs font-bold text-slate-900" title={row.item.name}>
                {row.item.name}
              </h5>
              {hasError ? (
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-600" aria-label="Lỗi chặn" />
              ) : hasWarning ? (
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-label="Cảnh báo" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-label="Hợp lệ" />
              )}
            </div>

            <code className="block truncate font-mono text-[10px] text-slate-500" title={row.item.code}>
              {row.item.code}
            </code>

            <div className="mt-1 flex flex-wrap items-center gap-1">
              <span className="rounded bg-slate-100 px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase text-slate-600">
                {row.item.kind ?? row.item.contentType}
              </span>
              <span
                className={`rounded border px-1.5 py-0.2 text-[9px] font-semibold ${
                  row.item.status === 'published'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : row.item.status === 'draft'
                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : 'border-slate-200 bg-slate-100 text-slate-600'
                }`}
              >
                {row.item.status === 'published' ? 'Published' : row.item.status === 'draft' ? 'Draft' : row.item.status}
              </span>
              <span className="font-mono text-[9px] text-slate-400">v{row.item.version}</span>
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-1.5 border-t border-slate-100 pt-2 text-xs">
          {row.item.contentType === 'reward' ? (
            <button
              type="button"
              onClick={() => setSelectedReward(row.item)}
              className="text-[11px] font-semibold text-brand-600 hover:text-brand-800 hover:underline"
            >
              Chi tiết & lịch sử
            </button>
          ) : (
            <span className="truncate text-[10px] text-muted max-w-[140px]">{row.item.description || '—'}</span>
          )}
          <div className="shrink-0 scale-90 origin-right">
            {renderLifecycleActions(row.item, hasError)}
          </div>
        </div>
      </article>
    )
  }

  return (
    <section className="space-y-3">
      {/* Studio Header & Inline Stat Bar */}
      <header className="ui-card space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded border border-brand-200 bg-brand-50 px-2 py-0.5 font-mono text-[10px] font-bold text-brand-700">
                STUDIO DESIGN OPS
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Cây Phần Thưởng & Bản Đồ Mở Khóa</h2>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              Quản trị nhịp độ phân bổ phần thưởng (progression rhythm), đối chiếu điều kiện mở khóa Level, Storybook, Achievement & Event.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => { setMappingBuilderLevel(undefined); setMappingBuilderOpen((o) => !o) }}>
              <Link2 className="h-3.5 w-3.5 mr-1" /> Gán phần quà
            </Button>
            <Button variant="secondary" onClick={() => void onReload()} disabled={busy}>
              ↻ Kiểm tra lại
            </Button>
          </div>
        </div>

        {/* Slender Inline Stat Bar */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border border-border bg-slate-50/60 px-3 py-2 text-xs">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="font-mono font-bold text-slate-900">{configMap.length}</span>
              <span className="text-slate-500">cấu hình</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-mono font-bold">{configMap.filter((row) => row.issues.every((issue) => issue.severity === 'info')).length}</span>
              <span>đạt chuẩn</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 font-medium text-rose-700">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="font-mono font-bold">{configErrors}</span>
              <span>lỗi chặn</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 font-medium text-amber-700">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="font-mono font-bold">{configWarnings}</span>
              <span>cảnh báo</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 font-medium text-sky-700">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              <span className="font-mono font-bold">{configNotes}</span>
              <span>ghi chú</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted">
            <Info className="h-3.5 w-3.5 text-brand-500 shrink-0" />
            <span>Draft: sửa trực tiếp · Published: tạo bản chỉnh sửa an toàn</span>
          </div>
        </div>

        {/* Collapsible Legacy Migration Banner */}
        {sourceCounts.legacyRewards > 0 && (
          <div className="rounded-lg border border-amber-300 bg-amber-50/70 p-2.5 text-xs text-amber-900">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <span className="font-semibold">{sourceCounts.legacyRewards} reward legacy chưa vào Studio</span>
                {legacyMigrationIssues.length === 0 ? (
                  <span className="text-[11px] font-bold text-emerald-700">(Đủ điều kiện migrate)</span>
                ) : (
                  <span className="text-[11px] font-bold text-rose-600">({legacyMigrationIssues.length} lỗi cấu hình)</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  disabled={busy || legacyMigrationIssues.length > 0}
                  onClick={() => {
                    if (window.confirm(`Tạo ${sourceCounts.legacyRewards} bản nháp Studio từ legacy catalog? Thao tác này không publish.`)) void migrateLegacyRewards()
                  }}
                  className="h-7 px-2.5 text-xs"
                >
                  <UploadCloud className="h-3.5 w-3.5 mr-1" /> {migrationProgress || `Migrate ${sourceCounts.legacyRewards} mục`}
                </Button>
                <button
                  type="button"
                  onClick={() => setLegacyBannerCollapsed((c) => !c)}
                  className="rounded p-1 text-amber-800 hover:bg-amber-100"
                  aria-label={legacyBannerCollapsed ? 'Mở rộng chi tiết' : 'Thu gọn'}
                >
                  {legacyBannerCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {!legacyBannerCollapsed && (
              <div className="mt-2 border-t border-amber-200/60 pt-2 text-[11px] space-y-1">
                <p>Migrate sẽ giữ nguyên code, rule, ảnh fallback và tạo draft có template slot/layer chuẩn. Không tự publish.</p>
                {legacyMigrationIssues.length > 0 && (
                  <ul className="list-disc pl-4 text-rose-700">
                    {legacyMigrationIssues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* Collapsible Runtime Migration Banner */}
        {sourceCounts.runtime > 0 && (
          <div className="rounded-lg border border-sky-200 bg-sky-50/70 p-2.5 text-xs text-sky-900">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 shrink-0 text-sky-600" />
                <span className="font-semibold">{sourceCounts.runtime} Runtime Achievement chưa có bản Studio</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm(`Tạo ${sourceCounts.runtime} bản nháp Studio từ Runtime Achievement? Production hiện tại không bị thay đổi.`)) void migrateRuntimeAchievements()
                  }}
                  className="h-7 px-2.5 text-xs"
                >
                  <UploadCloud className="h-3.5 w-3.5 mr-1" /> {migrationProgress || `Nhập ${sourceCounts.runtime} mục`}
                </Button>
                <button
                  type="button"
                  onClick={() => setRuntimeBannerCollapsed((c) => !c)}
                  className="rounded p-1 text-sky-800 hover:bg-sky-100"
                  aria-label={runtimeBannerCollapsed ? 'Mở rộng chi tiết' : 'Thu gọn'}
                >
                  {runtimeBannerCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {!runtimeBannerCollapsed && (
              <p className="mt-2 border-t border-sky-200/60 pt-2 text-[11px]">
                Tạo toàn bộ thành draft để quản lý ảnh, milestone và version. Không tự publish. Runtime production không bị thay đổi.
              </p>
            )}
          </div>
        )}
      </header>

      {/* Mapping Workspace Modal Drawer */}
      {mappingBuilderOpen && (
        <div id="reward-mapping-builder" className="relative scroll-mt-4">
          <button
            type="button"
            onClick={() => { setMappingBuilderOpen(false); setMappingBuilderLevel(undefined) }}
            className="absolute right-4 top-4 z-30 flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-white px-3 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <X className="h-3.5 w-3.5" /> Đóng
          </button>
          <Suspense fallback={<section className="ui-card p-6 text-center text-xs font-bold text-muted">Đang tải trình gắn phần quà…</section>}>
            <RewardMappingWorkspace items={items} onChanged={onReload} getArtwork={(i: StudioItem) => studioArtwork(i)} builderOnly initialLevel={mappingBuilderLevel} />
          </Suspense>
        </div>
      )}

      {/* Unified Toolbar matching Kho nội dung & Design Workspace */}
      <div className="ui-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-slate-50/70 p-4">
          <label className="relative flex-1 min-w-[240px]">
            <span className="sr-only">Tìm kiếm cấu hình</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              className="field-input min-h-12 w-full pl-12 pr-10 text-sm"
              value={mapQuery}
              onChange={(event) => setMapQuery(event.target.value)}
              placeholder="Tìm theo mã, tên, trigger hoặc reward ID…"
              aria-label="Tìm kiếm cấu hình"
            />
            {mapQuery && (
              <button
                type="button"
                onClick={() => setMapQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </label>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle: Tree vs Table */}
            <div className="flex rounded-xl border border-border bg-slate-100 p-1" role="group" aria-label="Chế độ hiển thị">
              <button
                type="button"
                onClick={() => {
                  setMapDisplay('tree')
                  if (!['level', 'action', 'storybook', 'event'].includes(mapChannel)) setMapChannel('level')
                }}
                className={`flex min-h-10 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                  mapDisplay === 'tree' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Network className="h-3.5 w-3.5" /> Cây trực quan
              </button>
              <button
                type="button"
                onClick={() => setMapDisplay('table')}
                className={`flex min-h-10 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                  mapDisplay === 'table' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="h-3.5 w-3.5" /> Bảng dữ liệu
              </button>
            </div>

            {/* Density Toggle in Tree Mode */}
            {mapDisplay === 'tree' && (
              <div className="flex rounded-xl border border-border bg-slate-100 p-1" role="group" aria-label="Mật độ hiển thị">
                <button
                  type="button"
                  title="Dạng lưới thẻ (Grid)"
                  onClick={() => setCardDensity('grid')}
                  className={`flex min-h-10 w-10 items-center justify-center rounded-lg transition ${
                    cardDensity === 'grid' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Dạng danh sách hàng (List)"
                  onClick={() => setCardDensity('list')}
                  className={`flex min-h-10 w-10 items-center justify-center rounded-lg transition ${
                    cardDensity === 'list' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LayoutList className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Channel Filter Bar */}
      {mapDisplay === 'table' && (
        <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-white p-3 text-xs" role="group" aria-label="Lọc theo kênh mở khóa">
          {([
            ['all', 'Tất cả'], ['level', 'Theo level'], ['event', 'Sự kiện'],
            ['storybook', 'Storybook'], ['action', 'Achievement'], ['unconfigured', 'Chưa cấu hình'],
          ] as const).map(([value, label]) => {
            const count = value === 'all' ? adminConfigMap.length : adminConfigMap.filter((row) => row.channel === value).length
            return (
              <button
                key={value}
                type="button"
                onClick={() => setMapChannel(value)}
                className={`flex min-h-10 items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-extrabold transition ${
                  mapChannel === value
                    ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-xs'
                    : 'border-border bg-white text-muted hover:border-brand-300'
                }`}
              >
                <span>{label}</span>
                <span className={`rounded-lg px-2 py-0.5 text-xs border ${
                  mapChannel === value ? 'border-brand-200 bg-white font-bold text-brand-700' : 'border-border/50 bg-slate-100 text-muted'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* MAIN TREE VIEW (High-Density Studio Layout) */}
      {mapDisplay === 'tree' && (
        <div className="grid items-start gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* HIGH-DENSITY SIDEBAR */}
          <aside className="ui-card overflow-hidden lg:sticky lg:top-4" aria-label="Điều hướng cây phần thưởng">
            {/* Segmented Tabs for Requirement Categories */}
            <div className="border-b border-border bg-slate-50/70 p-2.5">
              <div className="grid grid-cols-4 gap-1 rounded-lg bg-slate-200/70 p-1" role="tablist">
                {([
                  ['level', 'Level', MapIcon],
                  ['action', 'Achieve', Network],
                  ['storybook', 'Story', BookOpen],
                  ['event', 'Event', CalendarDays],
                ] as const).map(([channel, label, Icon]) => {
                  const count = adminConfigMap.filter((row) => row.channel === channel).length
                  const isActive = mapChannel === channel
                  return (
                    <button
                      key={channel}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        setMapChannel(channel)
                        if (channel === 'level' && levelNavigationGroups[0]) {
                          setSelectedTreeKey(levelNavigationGroups[0].key)
                        } else {
                          const firstOther = treeNavigationGroups.find((g) => g.channel === channel)
                          if (firstOther) setSelectedTreeKey(firstOther.key)
                        }
                      }}
                      className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-md text-[11px] font-bold transition ${
                        isActive
                          ? 'bg-white text-brand-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 mb-0.5" />
                      <span className="truncate">{label}</span>
                      <span className="font-mono text-[10px] text-muted">({count})</span>
                    </button>
                  )
                })}
              </div>

              {/* Quick Jump Input for Level Channel */}
              {mapChannel === 'level' && (
                <div className="mt-2 flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={quickJumpInput}
                    onChange={(e) => setQuickJumpInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleQuickJump(quickJumpInput)
                      }
                    }}
                    placeholder="Nhảy đến level (vd: 25)..."
                    aria-label="Nhập level cần nhảy tới"
                    className="flex-1 rounded-md border border-border bg-white px-2.5 py-1 text-xs placeholder:text-slate-400 focus:border-brand-500 focus:outline-none"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => handleQuickJump(quickJumpInput)}
                    className="h-7 px-2 text-xs font-bold"
                  >
                    Đi
                  </Button>
                </div>
              )}
            </div>

            {/* Navigation Band List */}
            <nav className="max-h-[68vh] space-y-1 overflow-y-auto p-2" aria-label="Các chặng và nhóm điều kiện">
              {mapChannel === 'level' && levelNavigationGroups.length > 0 && (
                <div className="space-y-1">
                  {levelNavigationGroups.map((group) => {
                    const active = selectedTreeGroup?.key === group.key
                    const hasError = group.rows.some((row) => row.issues.some((issue) => issue.severity === 'error'))
                    const draftCount = group.rows.filter((row) => row.item.status === 'draft').length
                    const filledLevels = new Set(group.rows.map((r) => Number(r.item.unlockRule.value))).size

                    return (
                      <button
                        key={group.key}
                        type="button"
                        onClick={() => setSelectedTreeKey(group.key)}
                        aria-current={active ? 'true' : undefined}
                        className={`w-full rounded-lg px-2.5 py-2 text-left transition border ${
                          active
                            ? 'border-brand-500 bg-brand-50/80 text-brand-900 font-semibold shadow-xs'
                            : 'border-transparent text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold tracking-tight">{group.title}</span>
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${
                              hasError ? 'bg-rose-500' : draftCount ? 'bg-amber-400' : group.rows.length > 0 ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                            aria-label={hasError ? 'Có lỗi' : draftCount ? 'Có bản nháp' : 'Hợp lệ'}
                          />
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-1 text-[11px] text-muted">
                          <span>{group.rows.length} quà {draftCount ? `· ${draftCount} nháp` : ''}</span>
                          <span className="font-mono text-[10px]">{filledLevels}/10 mốc</span>
                        </div>
                        {/* Mini Progression Bar */}
                        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full transition-all ${
                              hasError ? 'bg-rose-400' : draftCount ? 'bg-amber-400' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, filledLevels * 10)}%` }}
                          />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {mapChannel !== 'level' && requirementNavigationGroups.length > 0 && (
                <div className="space-y-1">
                  {requirementNavigationGroups.map((group) => {
                    const active = selectedTreeGroup?.key === group.key
                    const hasError = group.rows.some((row) => row.issues.some((issue) => issue.severity === 'error'))
                    const draftCount = group.rows.filter((row) => row.item.status === 'draft').length

                    return (
                      <button
                        key={group.key}
                        type="button"
                        onClick={() => setSelectedTreeKey(group.key)}
                        aria-current={active ? 'true' : undefined}
                        className={`w-full rounded-lg px-2.5 py-2 text-left transition border ${
                          active
                            ? 'border-brand-500 bg-brand-50/80 text-brand-900 font-semibold shadow-xs'
                            : 'border-transparent text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-bold tracking-tight">{group.title}</span>
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${
                              hasError ? 'bg-rose-500' : draftCount ? 'bg-amber-400' : 'bg-emerald-500'
                            }`}
                            aria-label={hasError ? 'Có lỗi' : draftCount ? 'Có bản nháp' : 'Hợp lệ'}
                          />
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-muted">
                          <span>{group.subtitle}{draftCount ? ` · ${draftCount} nháp` : ''}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {levelNavigationGroups.length === 0 && requirementNavigationGroups.length === 0 && (
                <p className="p-4 text-center text-xs text-muted">Không có nhánh phù hợp bộ lọc.</p>
              )}
            </nav>
          </aside>

          {/* MAIN STAGE / CONTENT AREA */}
          <section className="ui-card min-w-0 overflow-hidden" aria-live="polite">
            {/* PERSISTENT HEADER & FILTER BAR: Always visible to prevent deadlock */}
            <header className="border-b border-border bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 font-mono text-sm font-bold text-white shadow-xs">
                    {selectedTreeGroup?.channel === 'level' ? selectedTreeGroup.title.match(/\d+/)?.[0] : <Network className="h-4 w-4" />}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {selectedTreeGroup ? selectedTreeGroup.title : 'Cây tiến trình'}
                      </h3>
                      {selectedTreeGroup && (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                          {selectedTreeGroup.rows.filter((row) => row.issues.every((issue) => issue.severity !== 'error')).length}/{selectedTreeGroup.rows.length} hợp lệ
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted">
                      {selectedTreeGroup ? `${selectedTreeGroup.subtitle} · xếp theo thứ tự unlock` : 'Chọn nhánh bên trái để xem chi tiết'}
                    </p>
                  </div>
                </div>

                {/* Reset Filters Quick Button if filter or query is active */}
                {(mapRewardKind !== 'all' || mapQuery) && (
                  <Button
                    variant="secondary"
                    onClick={handleResetFilters}
                    className="h-8 gap-1.5 px-3 text-xs font-bold text-slate-700 hover:border-brand-300 hover:text-brand-700"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Xóa bộ lọc
                  </Button>
                )}
              </div>

              {/* Persistent Kind Filter Bar with Kho nội dung styling */}
              <div className="mt-3 flex flex-wrap items-center gap-2 pt-3 border-t border-border" role="group" aria-label="Lọc theo loại phần quà">
                <button
                  type="button"
                  onClick={() => setMapRewardKind('all')}
                  className={`flex min-h-10 items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-extrabold transition ${
                    mapRewardKind === 'all'
                      ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-xs'
                      : 'border-border bg-white text-muted hover:border-brand-300'
                  }`}
                >
                  <span>Tất cả</span>
                  <span
                    className={`rounded-lg px-2 py-0.5 text-xs border ${
                      mapRewardKind === 'all'
                        ? 'border-brand-200 bg-white font-bold text-brand-700'
                        : 'border-border/50 bg-slate-100 text-muted'
                    }`}
                  >
                    {channelScopedRows.length}
                  </span>
                </button>
                {mapRewardKinds.map(([kind, count]) => {
                  const isActive = mapRewardKind === kind
                  return (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => handleToggleKindFilter(kind)}
                      className={`flex min-h-10 items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-extrabold transition ${
                        isActive
                          ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-xs'
                          : 'border-border bg-white text-muted hover:border-brand-300'
                      }`}
                    >
                      <span>{KIND_DISPLAY_LABELS[kind] ?? kind.toUpperCase()}</span>
                      <span
                        className={`rounded-lg px-2 py-0.5 text-xs border ${
                          isActive
                            ? 'border-brand-200 bg-white font-bold text-brand-700'
                            : 'border-border/50 bg-slate-100 text-muted'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </header>

            {selectedTreeGroup ? (
              <>
                {/* BAND MILESTONE PACER STRIP (For Level Channel) */}
                {selectedTreeGroup.channel === 'level' && currentBandInfo && (
                  <div className="border-b border-border bg-slate-50/80 px-4 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                        <span className="mr-1 shrink-0 font-mono text-[11px] font-bold uppercase tracking-wider text-muted">
                          Nhịp độ chặng:
                        </span>
                        {currentBandInfo.levels.map((lvl) => {
                          const rows = currentBandLevelRowsMap.get(lvl) ?? []
                          const hasError = rows.some((r) => r.issues.some((i) => i.severity === 'error'))
                          const hasDraft = rows.some((r) => r.item.status === 'draft')
                          const isPublished = rows.length > 0 && !hasDraft && !hasError

                          let statusClass = 'border-dashed border-slate-300 bg-white text-slate-400 hover:border-brand-400 hover:text-brand-600'
                          let dotClass = 'bg-slate-300'
                          let titleHint = `Level ${lvl}: Chưa có quà (Mốc trống)`

                          if (hasError) {
                            statusClass = 'border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100'
                            dotClass = 'bg-rose-500'
                            titleHint = `Level ${lvl}: ${rows.length} quà (Có lỗi)`
                          } else if (hasDraft) {
                            statusClass = 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                            dotClass = 'bg-amber-500'
                            titleHint = `Level ${lvl}: ${rows.length} quà (Có nháp)`
                          } else if (isPublished) {
                            statusClass = 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                            dotClass = 'bg-emerald-500'
                            titleHint = `Level ${lvl}: ${rows.length} quà (Đã phát hành)`
                          }

                          const isHighlighted = highlightedMilestone === lvl

                          return (
                            <button
                              key={lvl}
                              type="button"
                              title={titleHint}
                              aria-label={titleHint}
                              onClick={() => handlePacerClick(lvl)}
                              className={`flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-xs font-semibold transition ${statusClass} ${
                                isHighlighted ? 'scale-105 shadow-xs ring-2 ring-brand-500' : ''
                              }`}
                            >
                              <span>{lvl}</span>
                              <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
                            </button>
                          )
                        })}
                      </div>

                      {/* Full Progression Rhythm Toggle */}
                      <label className="flex cursor-pointer select-none items-center gap-1.5 text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={showAllLevels}
                          onChange={(e) => setShowAllLevels(e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="font-semibold">Hiện toàn bộ mốc trống</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* MILESTONES & REWARDS LIST */}
                <div className="p-4">
                  {/* LEVEL PROGRESSION VIEW */}
                  {selectedTreeGroup.channel === 'level' && currentBandInfo ? (
                    <div className="space-y-4">
                      {/* Notice banner if current band has 0 items for active filter */}
                      {selectedTreeGroup.rows.length === 0 && mapRewardKind !== 'all' && (
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                            <span>Chặng này chưa có phần thưởng loại <strong>{KIND_DISPLAY_LABELS[mapRewardKind] ?? mapRewardKind.toUpperCase()}</strong> nào.</span>
                          </div>
                          <Button
                            variant="secondary"
                            onClick={handleResetFilters}
                            className="h-7 border-amber-300 bg-white px-2.5 text-xs font-bold hover:bg-amber-100"
                          >
                            <RotateCcw className="mr-1 h-3 w-3" /> Xóa bộ lọc
                          </Button>
                        </div>
                      )}

                      {/* If !showAllLevels and 0 items in current band: show empty state */}
                      {selectedTreeGroup.rows.length === 0 && !showAllLevels ? (
                        <div className="py-12 text-center space-y-3">
                          <p className="text-xs font-semibold text-muted">
                            Chặng {selectedTreeGroup.title} chưa có phần thưởng nào phù hợp bộ lọc.
                          </p>
                          <Button
                            variant="secondary"
                            onClick={handleResetFilters}
                          >
                            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Xóa bộ lọc
                          </Button>
                        </div>
                      ) : (
                        currentBandInfo.levels.map((lvl, index) => {
                          const rows = currentBandLevelRowsMap.get(lvl) ?? []
                          const isEmpty = rows.length === 0

                          if (isEmpty && !showAllLevels) return null

                          const isHighlighted = highlightedMilestone === lvl

                          if (isEmpty) {
                            // Empty Milestone Slot
                            return (
                              <div
                                key={`empty-level-${lvl}`}
                                id={`milestone-level-${lvl}`}
                                className={`relative grid grid-cols-[36px_minmax(0,1fr)] gap-3 transition ${
                                  isHighlighted ? 'rounded-lg bg-brand-50/40 p-1 ring-2 ring-brand-500/50' : ''
                                }`}
                              >
                                {index < currentBandInfo.levels.length - 1 && (
                                  <span className="absolute bottom-0 left-[17px] top-8 w-0.5 bg-slate-200" aria-hidden="true" />
                                )}
                                <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 font-mono text-xs font-bold text-slate-400">
                                  {lvl}
                                </span>
                                <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-200 bg-slate-50/40 px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-600">Level {lvl}</span>
                                    <span className="text-[11px] italic text-slate-400">Chưa có phần thưởng</span>
                                  </div>
                                  <Button
                                    variant="secondary"
                                    onClick={() => openLevelMapping(lvl)}
                                    className="h-7 border-brand-200 px-2.5 text-xs font-semibold text-brand-700 hover:border-brand-400 hover:bg-brand-50"
                                  >
                                    <Plus className="h-3 w-3 mr-1" /> Gán quà cho Level {lvl}
                                  </Button>
                                </div>
                              </div>
                            )
                          }

                          // Milestone with rewards
                          return (
                            <div
                              key={`milestone-level-${lvl}`}
                              id={`milestone-level-${lvl}`}
                              className={`relative grid grid-cols-[36px_minmax(0,1fr)] gap-3 transition ${
                                isHighlighted ? 'rounded-lg bg-brand-50/40 p-1 ring-2 ring-brand-500/50' : ''
                              }`}
                            >
                              {index < currentBandInfo.levels.length - 1 && (
                                <span className="absolute bottom-0 left-[17px] top-8 w-0.5 bg-slate-200" aria-hidden="true" />
                              )}
                              <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-brand-600 bg-brand-600 font-mono text-xs font-bold text-white shadow-xs">
                                {lvl}
                              </span>
                              <div className="min-w-0">
                                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-bold text-slate-900">Level {lvl}</h4>
                                    <span className="rounded-md border border-brand-100 bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                                      {rows.length} phần quà
                                    </span>
                                  </div>
                                  <Button
                                    variant="secondary"
                                    onClick={() => openLevelMapping(lvl)}
                                    className="h-6 px-2 text-[11px] font-semibold text-brand-700 hover:bg-brand-50"
                                  >
                                    <Plus className="h-3 w-3 mr-1" aria-hidden="true" /> Chỉnh mốc
                                  </Button>
                                </div>

                                <div className={cardDensity === 'grid' ? 'grid gap-2 xl:grid-cols-2' : 'space-y-1.5'}>
                                  {rows.map(renderRewardCard)}
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  ) : (
                    /* OTHER CHANNELS (Storybook, Achievement, Event) */
                    selectedTreeMilestones.length > 0 ? (
                      <div className="space-y-5">
                        {selectedTreeMilestones.map(([milestone, rows], milestoneIndex) => (
                          <div key={milestone} className="relative grid grid-cols-[36px_minmax(0,1fr)] gap-3">
                            {milestoneIndex < selectedTreeMilestones.length - 1 && (
                              <span className="absolute bottom-0 left-[17px] top-8 w-0.5 bg-slate-200" aria-hidden="true" />
                            )}
                            <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-brand-600 bg-brand-600 font-mono text-xs font-bold text-white shadow-xs">
                              {milestoneIndex + 1}
                            </span>
                            <div className="min-w-0">
                              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-slate-900">{milestone}</h4>
                                  <span className="rounded-md border border-brand-100 bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                                    {rows.length} cấu hình
                                  </span>
                                </div>
                              </div>
                              <div className={cardDensity === 'grid' ? 'grid gap-2 xl:grid-cols-2' : 'space-y-1.5'}>
                                {rows.map(renderRewardCard)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center space-y-3">
                        <p className="text-xs font-semibold text-muted">
                          Không có cấu hình phù hợp bộ lọc trong mục này.
                        </p>
                        {(mapRewardKind !== 'all' || mapQuery) && (
                          <Button
                            variant="secondary"
                            onClick={handleResetFilters}
                          >
                            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Xóa bộ lọc
                          </Button>
                        )}
                      </div>
                    )
                  )}
                </div>
              </>
            ) : (
              <div className="py-12 text-center space-y-3">
                <p className="text-xs font-semibold text-muted">
                  Không có cấu hình phù hợp bộ lọc.
                </p>
                {(mapRewardKind !== 'all' || mapQuery) && (
                  <Button
                    variant="secondary"
                    onClick={handleResetFilters}
                  >
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Xóa bộ lọc
                  </Button>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TABLE DATA VIEW (Clean, High-Density Table) */}
      {mapDisplay === 'table' && (
        <div className="ui-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border bg-slate-50/70 px-4 py-2.5 text-xs text-muted">
            <span>Hiển thị <strong>{visibleConfigMap.length}</strong> / {filteredConfigMap.length} cấu hình</span>
            <span className="font-mono">Trang {mapPage}/{mapPageCount}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead className="border-b border-border bg-slate-100 font-mono text-[11px] uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="p-3">Nội dung</th>
                  <th className="p-3">Kênh</th>
                  <th className="p-3">Trigger / Điều kiện</th>
                  <th className="p-3">Quà đầu ra</th>
                  <th className="p-3">Kiểm tra</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visibleConfigMap.map((row) => {
                  const hasError = row.issues.some((issue) => issue.severity === 'error')
                  return (
                    <tr key={row.item.id} className="align-top hover:bg-slate-50/60">
                      <td className="p-3">
                        <strong className="text-slate-900">{row.item.name}</strong>
                        <code className="mt-0.5 block font-mono text-[10px] text-slate-400">
                          {row.item.code} · v{row.item.version} · {row.item.status}
                        </code>
                      </td>
                      <td className="p-3">
                        <span className="rounded border border-brand-100 bg-brand-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-brand-700">
                          {row.channel}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{row.trigger}</td>
                      <td className="p-3">
                        {row.item.contentType === 'reward' ? (
                          <span className="text-muted">Chính reward này</span>
                        ) : row.rewardIds.length ? (
                          row.rewardIds.map((id) => <code key={id} className="mb-0.5 block font-mono text-[10px] text-slate-600">{id}</code>)
                        ) : (
                          <span className="font-semibold text-amber-700">Chưa gắn quà</span>
                        )}
                      </td>
                      <td className="p-3">
                        {row.issues.every((issue) => issue.severity === 'info') ? (
                          <>
                            <span className="font-bold text-emerald-700">✓ Hợp lệ</span>
                            {row.issues.map((issue, index) => (
                              <p key={`${issue.message}-${index}`} className="mt-0.5 text-[10px] text-sky-700">ℹ {issue.message}</p>
                            ))}
                          </>
                        ) : (
                          <ul className="space-y-0.5 text-[11px]">
                            {row.issues.map((issue, index) => (
                              <li
                                key={`${issue.message}-${index}`}
                                className={issue.severity === 'error' ? 'font-bold text-rose-600' : issue.severity === 'warning' ? 'text-amber-700' : 'text-sky-700'}
                              >
                                {issue.severity === 'error' ? '✕' : issue.severity === 'warning' ? '⚠' : 'ℹ'} {issue.message}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex scale-90 origin-right">
                          {renderLifecycleActions(row.item, hasError)}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {visibleConfigMap.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-muted">
                      <p>Không có cấu hình phù hợp bộ lọc.</p>
                      {(mapRewardKind !== 'all' || mapQuery || mapChannel !== 'all') && (
                        <Button
                          variant="secondary"
                          onClick={() => {
                            handleResetFilters()
                            setMapChannel('all')
                          }}
                          className="mt-2"
                        >
                          <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Xóa bộ lọc
                        </Button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filteredConfigMap.length > 25 && (
            <footer className="flex items-center justify-end gap-2 border-t border-border bg-slate-50/50 p-3">
              <Button variant="secondary" disabled={mapPage === 1} onClick={() => setMapPage((page) => Math.max(1, page - 1))}>
                Trang trước
              </Button>
              <Button variant="secondary" disabled={mapPage === mapPageCount} onClick={() => setMapPage((page) => Math.min(mapPageCount, page + 1))}>
                Trang sau
              </Button>
            </footer>
          )}
        </div>
      )}

      {/* Selected Reward Detail Drawer */}
      <SelectedRewardDrawer
        selectedReward={selectedReward}
        onClose={() => setSelectedReward(null)}
        selectedRewardRows={selectedRewardRows}
        onOpenMappingBuilder={() => setMappingBuilderOpen(true)}
        renderLifecycleActions={renderLifecycleActions}
        StudioArtwork={StudioArtwork}
      />
      <p className="px-2 text-[11px] text-muted">
        Bản đồ dùng catalog admin từ StoryMee Hub để kiểm tra chéo. Việc cấp quà và xác thực action vẫn do core-gamification-api quyết định.
      </p>
    </section>
  )
}
