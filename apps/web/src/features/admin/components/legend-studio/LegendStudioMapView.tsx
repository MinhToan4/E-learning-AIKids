import { lazy, Suspense, useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react'
import {
  AlertTriangle, BookOpen, CalendarDays, CheckCircle2, Link2, List,
  Map as MapIcon, Network, Plus, UploadCloud, X
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

  const mapRewardKinds = useMemo(() => {
    const kindCounts = new Map<string, number>()
    for (const row of adminConfigMap) {
      const kind = row.item.kind ?? row.item.contentType
      kindCounts.set(kind, (kindCounts.get(kind) ?? 0) + 1)
    }
    return [...kindCounts.entries()].sort(([left], [right]) => left.localeCompare(right, 'vi'))
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

  const openLevelMapping = (level: number) => {
    setMappingBuilderLevel(level)
    setMappingBuilderOpen(true)
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => document.getElementById('reward-mapping-builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' })))
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

  const renderTreeNavButton = (group: (typeof levelNavigationGroups)[number]) => {
    const active = selectedTreeGroup?.key === group.key
    const hasError = group.rows.some((row) => row.issues.some((issue) => issue.severity === 'error'))
    const draftCount = group.rows.filter((row) => row.item.status === 'draft').length
    return (
      <button
        key={group.key}
        type="button"
        onClick={() => setSelectedTreeKey(group.key)}
        aria-current={active ? 'true' : undefined}
        className={`flex min-h-14 w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus ${active ? 'bg-brand-600 text-white shadow-md' : 'hover:bg-brand-50'}`}
      >
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black ${active ? 'bg-white/20 text-white' : group.channel === 'level' ? 'bg-brand-50 text-brand-700' : 'bg-sky-50 text-sky-700'}`}>
          {group.channel === 'level' ? group.title.match(/\d+/)?.[0] : group.channel === 'storybook' ? <BookOpen className="h-4 w-4" /> : group.channel === 'event' ? <CalendarDays className="h-4 w-4" /> : <Network className="h-4 w-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <strong className="block truncate text-sm">{group.title}</strong>
          <span className={`block text-[11px] ${active ? 'text-white/80' : 'text-muted'}`}>{group.subtitle}{draftCount ? ` · ${draftCount} nháp` : ''}</span>
        </span>
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${hasError ? 'bg-coral-500' : draftCount ? 'bg-amber-400' : 'bg-mint-500'}`} aria-label={hasError ? 'Có lỗi' : draftCount ? 'Có bản nháp' : 'Hợp lệ'} />
      </button>
    )
  }

  return (
    <section className="space-y-4">
      <header className="ui-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-brand-600">Kiểm tra cấu hình</p>
            <h2 className="font-display text-2xl">Bản đồ điều kiện & phần thưởng</h2>
            <p className="mt-1 max-w-3xl text-sm text-muted">Đối chiếu một nơi: nội dung nào được mở bởi level, sự kiện, Storybook hay action; quà đầu ra là gì và cấu hình nào cần sửa trước khi phát hành.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => { setMappingBuilderLevel(undefined); setMappingBuilderOpen((o) => !o) }}><Link2 className="h-4 w-4" /> Gắn phần quà</Button>
            <Button variant="secondary" onClick={() => void onReload()} disabled={busy}>↻ Kiểm tra lại</Button>
          </div>
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
          <div className="min-w-48 flex-1">
            <strong>{sourceCounts.legacyRewards} reward legacy chưa thuộc Studio</strong>
            <p className="text-xs text-amber-900">Migrate sẽ giữ nguyên code, rule, ảnh fallback và tạo draft có template slot/layer chuẩn. Không tự publish.</p>
            {legacyMigrationIssues.length === 0 ? <p className="mt-1 text-xs font-extrabold text-emerald-800">✓ Đủ loại asset và ảnh để tạo draft</p> : <p className="mt-1 text-xs font-extrabold text-danger">{legacyMigrationIssues.length} lỗi cần xử lý trước khi migrate</p>}
          </div>
          <Button variant="secondary" disabled={busy || legacyMigrationIssues.length > 0} onClick={() => {
            if (window.confirm(`Tạo ${sourceCounts.legacyRewards} bản nháp Studio từ legacy catalog? Thao tác này không publish.`)) void migrateLegacyRewards()
          }}>
            <UploadCloud className="h-4 w-4" aria-hidden="true" /> {migrationProgress || `Migrate ${sourceCounts.legacyRewards} mục`}
          </Button>
        </div>}
        {sourceCounts.runtime > 0 && <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50 p-4">
          <Network className="h-6 w-6 shrink-0 text-sky-700" aria-hidden="true" />
          <div className="min-w-48 flex-1">
            <strong>{sourceCounts.runtime} Runtime Achievement chưa có bản Studio</strong>
            <p className="text-xs text-sky-900">Tạo toàn bộ thành draft để quản lý ảnh, milestone và version. Không tự publish.</p>
          </div>
          <Button variant="secondary" disabled={busy} onClick={() => {
            if (window.confirm(`Tạo ${sourceCounts.runtime} bản nháp Studio từ Runtime Achievement? Production hiện tại không bị thay đổi.`)) void migrateRuntimeAchievements()
          }}>
            <UploadCloud className="h-4 w-4" /> {migrationProgress || `Đưa cả ${sourceCounts.runtime} mục vào Studio`}
          </Button>
        </div>}
      </header>

      {mappingBuilderOpen && (
        <div id="reward-mapping-builder" className="relative scroll-mt-4">
          <button type="button" onClick={() => { setMappingBuilderOpen(false); setMappingBuilderLevel(undefined) }} className="absolute right-4 top-4 z-30 flex min-h-11 items-center gap-2 rounded-xl bg-white px-3 text-sm font-extrabold text-muted shadow-sm">
            <X className="h-4 w-4" /> Đóng
          </button>
          <Suspense fallback={<section className="ui-card p-8 text-center text-sm font-bold text-muted">Đang mở trình gắn quà…</section>}>
            <RewardMappingWorkspace items={items} onChanged={onReload} getArtwork={(i: StudioItem) => studioArtwork(i)} builderOnly initialLevel={mappingBuilderLevel} />
          </Suspense>
        </div>
      )}

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
                  return (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => setMapChannel(channel)}
                      className={`flex min-h-16 flex-col items-start justify-center rounded-xl px-3 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus ${mapChannel === channel ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-brand-900 hover:bg-brand-50'}`}
                    >
                      <Icon className="mb-1 h-4 w-4" aria-hidden="true" />
                      <strong className="text-xs">{label}</strong>
                      <span className={`text-[10px] ${mapChannel === channel ? 'text-white/75' : 'text-muted'}`}>{count} cấu hình</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <nav className="max-h-[70vh] space-y-1 overflow-y-auto p-2" aria-label="Các chặng và nhóm điều kiện">
              {levelNavigationGroups.length > 0 && <p className="px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-widest text-muted">Các chặng Level</p>}
              {levelNavigationGroups.map(renderTreeNavButton)}
              {requirementNavigationGroups.length > 0 && <p className="px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-widest text-muted">Các nhóm {mapChannel === 'action' ? 'Achievement' : mapChannel === 'storybook' ? 'Storybook' : 'Event'}</p>}
              {requirementNavigationGroups.map(renderTreeNavButton)}
              {levelNavigationGroups.length === 0 && requirementNavigationGroups.length === 0 && <p className="p-5 text-center text-sm text-muted">Không có nhánh phù hợp bộ lọc.</p>}
            </nav>
          </aside>

          <section className="ui-card min-w-0 overflow-hidden" aria-live="polite">
            {selectedTreeGroup ? (
              <>
                <header className="flex flex-wrap items-center gap-3 border-b border-border bg-white p-5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 font-display text-white shadow-sm">
                    {selectedTreeGroup.channel === 'level' ? selectedTreeGroup.title.match(/\d+/)?.[0] : <Network className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase tracking-wider text-brand-600">Cây phần thưởng</p>
                    <h3 className="font-display text-2xl">{selectedTreeGroup.title}</h3>
                    <p className="text-xs text-muted">{selectedTreeGroup.subtitle} · xếp theo thứ tự requirement</p>
                  </div>
                  <span className="rounded-full bg-mint-50 px-3 py-1 text-xs font-black text-success">
                    {selectedTreeGroup.rows.filter((row) => row.issues.every((issue) => issue.severity !== 'error')).length}/{selectedTreeGroup.rows.length} hợp lệ
                  </span>
                  <div className="basis-full border-t border-border pt-3">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted">Lọc theo loại reward</p>
                    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Lọc theo loại phần quà">
                      <button
                        type="button"
                        onClick={() => setMapRewardKind('all')}
                        className={`min-h-9 rounded-lg px-2.5 text-[11px] font-black ${mapRewardKind === 'all' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-brand-700'}`}
                      >
                        Tất cả · {adminConfigMap.length}
                      </button>
                      {mapRewardKinds.map(([kind, count]) => (
                        <button
                          key={kind}
                          type="button"
                          onClick={() => setMapRewardKind(kind)}
                          className={`min-h-9 rounded-lg px-2.5 text-[11px] font-black ${mapRewardKind === kind ? 'bg-brand-600 text-white' : 'bg-slate-100 text-muted hover:bg-brand-50'}`}
                        >
                          {kind} · {count}
                        </button>
                      ))}
                    </div>
                  </div>
                </header>
                <div className="p-4 sm:p-6">
                  {selectedTreeMilestones.map(([milestone, rows], milestoneIndex) => (
                    <div key={milestone} className="relative grid grid-cols-[48px_minmax(0,1fr)] gap-3 pb-6 last:pb-0">
                      {milestoneIndex < selectedTreeMilestones.length - 1 && <span className="absolute bottom-0 left-[23px] top-10 w-0.5 bg-brand-100" aria-hidden="true" />}
                      <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-white bg-brand-600 text-xs font-black text-white shadow-clay">
                        {selectedTreeGroup.channel === 'level' ? milestone.replace('Level ', '') : milestoneIndex + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h4 className="font-extrabold text-brand-900">{milestone}</h4>
                          <span className="rounded-full bg-brand-50 px-2 py-1 text-[10px] font-black text-brand-700">{rows.length} phần quà</span>
                          {selectedTreeGroup.channel === 'level' && (
                            <button
                              type="button"
                              onClick={() => openLevelMapping(Number(milestone.replace('Level ', '')))}
                              className="ml-auto flex min-h-10 items-center gap-1.5 rounded-xl border border-brand-200 bg-white px-3 text-xs font-extrabold text-brand-700 shadow-sm hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
                            >
                              <Plus className="h-4 w-4" aria-hidden="true" /> Chỉnh mốc
                            </button>
                          )}
                        </div>
                        <div className="grid gap-2 xl:grid-cols-2">
                          {rows.map((row) => row.item.contentType === 'chapter' ? (
                            <ChapterBookMapPreview
                              key={row.item.id}
                              item={row.item}
                              onEdit={(focus) => onStartEditing(row.item, focus)}
                              lifecycleActions={renderLifecycleActions(row.item, row.issues.some((issue) => issue.severity === 'error'))}
                            />
                          ) : (
                            <article key={row.item.id} className="rounded-2xl border border-border bg-white p-3 shadow-sm transition hover:border-brand-300 hover:shadow-clay">
                              <div className="grid grid-cols-[56px_minmax(0,1fr)_auto] gap-3">
                                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-brand-50">
                                  <StudioArtwork item={row.item} meaningful />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${row.item.status === 'published' ? 'bg-mint-50 text-success' : 'bg-brand-50 text-brand-700'}`}>
                                      {row.item.status === 'published' ? 'Đang phát hành' : row.item.status}
                                    </span>
                                    <span className="text-[10px] font-black uppercase text-muted">{row.item.kind ?? row.item.contentType}</span>
                                  </div>
                                  <h5 className="mt-1 truncate font-extrabold">{row.item.name}</h5>
                                  <code className="block truncate text-[11px] text-muted">{row.item.code}</code>
                                </div>
                                {row.issues.some((issue) => issue.severity !== 'info') ? <AlertTriangle className="h-5 w-5 text-amber-700" aria-label="Có vấn đề cấu hình" /> : <CheckCircle2 className="h-5 w-5 text-success" aria-label="Hợp lệ" />}
                              </div>
                              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
                                {row.item.contentType === 'reward' ? (
                                  <button type="button" onClick={() => setSelectedReward(row.item)} className="min-h-10 rounded-lg px-2 text-xs font-extrabold text-sky-700 hover:bg-sky-50">
                                    Xem chi tiết & lịch sử
                                  </button>
                                ) : (
                                  <span className="text-xs text-muted">{row.item.description}</span>
                                )}
                                {renderLifecycleActions(row.item, row.issues.some((issue) => issue.severity === 'error'))}
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-muted">Không có cấu hình phù hợp bộ lọc.</div>
            )}
          </section>
        </div>
      )}

      {mapDisplay === 'table' && (
        <div className="ui-card overflow-hidden">
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
                    <td className="p-4">{renderLifecycleActions(row.item, row.issues.some((issue) => issue.severity === 'error'))}</td>
                  </tr>
                ))}
                {visibleConfigMap.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted">Không có cấu hình phù hợp bộ lọc.</td></tr>}
              </tbody>
            </table>
          </div>
          {filteredConfigMap.length > 25 && (
            <footer className="flex items-center justify-end gap-2 border-t border-border p-4">
              <Button variant="secondary" disabled={mapPage === 1} onClick={() => setMapPage((page) => Math.max(1, page - 1))}>Trang trước</Button>
              <Button variant="secondary" disabled={mapPage === mapPageCount} onClick={() => setMapPage((page) => Math.min(mapPageCount, page + 1))}>Trang sau</Button>
            </footer>
          )}
        </div>
      )}

      <SelectedRewardDrawer
        selectedReward={selectedReward}
        onClose={() => setSelectedReward(null)}
        selectedRewardRows={selectedRewardRows}
        onOpenMappingBuilder={() => setMappingBuilderOpen(true)}
        renderLifecycleActions={renderLifecycleActions}
        StudioArtwork={StudioArtwork}
      />
      <p className="px-2 text-xs text-muted">Bản đồ dùng catalog admin từ StoryMee Hub để kiểm tra chéo. Việc cấp quà và xác thực action vẫn do core-gamification-api quyết định.</p>
    </section>
  )
}
