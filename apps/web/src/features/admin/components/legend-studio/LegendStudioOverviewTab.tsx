import { useState, useMemo, type ComponentType } from 'react'
import {
  Archive,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Gift,
  History,
  LayoutGrid,
  List,
  Network,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  UploadCloud,
  X,
  Layers,
  Image,
  Tag,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import type { AuditEntry, ContentType, LifecycleAction, StudioItem } from './types'
import { studioEditLabel, studioStatusLabel } from './constants'

export type AssignmentInfo =
  | { type: 'level'; level: number; label: string }
  | { type: 'storybook'; label: string }
  | { type: 'event'; label: string }
  | { type: 'action'; label: string }
  | { type: 'unassigned'; label: string }

export function getItemAssignment(item: StudioItem): AssignmentInfo {
  if (item.contentType === 'chapter') {
    return { type: 'storybook', label: `Storybook ${String(item.content?.slug ?? item.code)}` }
  }
  if (item.contentType === 'event') {
    return { type: 'event', label: `Sự kiện ${item.name || item.code}` }
  }
  if (item.contentType === 'achievement') {
    return { type: 'action', label: `Achievement · ${String(item.unlockRule?.metric ?? item.code)}` }
  }

  // Reward content items
  const ruleType = item.unlockRule?.type
  const ruleVal = item.unlockRule?.value

  if (ruleType === 'xp_level') {
    const lvl = Number(ruleVal)
    if (Number.isInteger(lvl) && lvl >= 1 && lvl <= 100) {
      return { type: 'level', level: lvl, label: `Level ${lvl}` }
    }
  }
  if (ruleType === 'storybook_sticker') {
    return { type: 'storybook', label: `Storybook ${String(ruleVal ?? '')}` }
  }
  if (ruleType === 'event') {
    return { type: 'event', label: `Sự kiện ${String(ruleVal ?? '')}` }
  }
  if (ruleType === 'action' || ruleType === 'achievement') {
    return { type: 'action', label: `Action · ${String(item.unlockRule?.metric ?? ruleVal ?? '')}` }
  }

  return { type: 'unassigned', label: 'Chưa gán' }
}

export type AssetKindFilter =
  | 'all'
  | 'frame'
  | 'avatar'
  | 'companion'
  | 'effect'
  | 'title'
  | 'background'
  | 'perk'
  | 'chapter'
  | 'event'
  | 'achievement'

export type AssetStatusFilter =
  | 'all'
  | 'published'
  | 'draft'
  | 'unassigned'
  | 'review'
  | 'retired'

export interface LegendStudioOverviewTabProps {
  items: StudioItem[]
  filteredItems?: StudioItem[]
  visibleItems?: StudioItem[]
  filter?: ContentType | 'all'
  onFilterChange?: (filter: ContentType | 'all') => void
  libraryQuery?: string
  onLibraryQueryChange?: (query: string) => void
  libraryStatus?: StudioItem['status'] | 'all'
  onLibraryStatusChange?: (status: StudioItem['status'] | 'all') => void
  libraryPage?: number
  libraryPageCount?: number
  onPageChange?: (page: number | ((prev: number) => number)) => void
  onStartEditing: (item: StudioItem) => void
  onRequestLifecycle: (item: StudioItem, action: LifecycleAction) => void
  onShowAudit: (item: StudioItem) => void
  auditPanel: { itemId: string; entries: AuditEntry[] } | null
  onOpenCreateMenu: () => void
  StudioArtwork: ComponentType<{ item: StudioItem; meaningful?: boolean }>
  onNavigateToMap?: (level?: number) => void
  onAssignToLevel?: (item: StudioItem, level: number) => Promise<void>
}

const KIND_FILTER_OPTIONS: Array<{ key: AssetKindFilter; label: string; icon: typeof Gift }> = [
  { key: 'all', label: 'Tất cả', icon: Layers },
  { key: 'frame', label: 'Khung', icon: Sparkles },
  { key: 'avatar', label: 'Avatar', icon: Image },
  { key: 'companion', label: 'Bạn đồng hành', icon: Gift },
  { key: 'effect', label: 'Hiệu ứng', icon: Sparkles },
  { key: 'title', label: 'Danh hiệu', icon: Tag },
  { key: 'background', label: 'Hình nền', icon: Image },
  { key: 'perk', label: 'Huy hiệu', icon: Gift },
  { key: 'chapter', label: 'Storybook', icon: BookOpen },
  { key: 'event', label: 'Sự kiện', icon: CalendarDays },
  { key: 'achievement', label: 'Achievement', icon: Network },
]

export function LegendStudioOverviewTab({
  items,
  filter = 'all',
  onFilterChange,
  libraryQuery = '',
  onLibraryQueryChange,
  libraryStatus = 'all',
  onStartEditing,
  onRequestLifecycle,
  onShowAudit,
  auditPanel,
  onOpenCreateMenu,
  StudioArtwork,
  onNavigateToMap,
  onAssignToLevel,
}: LegendStudioOverviewTabProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [kindFilter, setKindFilter] = useState<AssetKindFilter>('all')
  const [statusFilter, setStatusFilter] = useState<AssetStatusFilter>('all')
  const [localSearch, setLocalSearch] = useState(libraryQuery)
  const [localPage, setLocalPage] = useState(1)

  // Quick Assign Modal state
  const [assigningItem, setAssigningItem] = useState<StudioItem | null>(null)
  const [targetLevel, setTargetLevel] = useState<number>(1)
  const [assignBusy, setAssignBusy] = useState(false)

  // Synchronize search query
  const handleSearchChange = (val: string) => {
    setLocalSearch(val)
    setLocalPage(1)
    onLibraryQueryChange?.(val)
  }

  // Count unassigned items
  const unassignedCount = useMemo(() => {
    return items.filter((item) => getItemAssignment(item).type === 'unassigned').length
  }, [items])

  // Effective filtering
  const effectiveFilteredItems = useMemo(() => {
    const q = localSearch.trim().toLowerCase()
    return items.filter((item) => {
      // 1. Kind filter
      if (kindFilter !== 'all') {
        if (kindFilter === 'chapter') {
          if (item.contentType !== 'chapter') return false
        } else if (kindFilter === 'event') {
          if (item.contentType !== 'event' && item.kind !== 'event_ticket') return false
        } else if (kindFilter === 'achievement') {
          if (item.contentType !== 'achievement') return false
        } else if (kindFilter === 'background') {
          if (item.kind !== 'background' && item.kind !== 'theme') return false
        } else {
          if (item.kind !== kindFilter) return false
        }
      } else if (filter !== 'all') {
        if (item.contentType !== filter) return false
      }

      // 2. Status filter
      const assignment = getItemAssignment(item)
      if (statusFilter === 'unassigned') {
        if (assignment.type !== 'unassigned') return false
      } else if (statusFilter !== 'all') {
        if (item.status !== statusFilter) return false
      } else if (libraryStatus !== 'all') {
        if (item.status !== libraryStatus) return false
      }

      // 3. Search query
      if (!q) return true
      return [item.code, item.name, item.kind ?? '', item.description]
        .some((val) => (val ?? '').toLowerCase().includes(q))
    })
  }, [items, kindFilter, filter, statusFilter, libraryStatus, localSearch])

  // Pagination
  const pageSize = viewMode === 'grid' ? 24 : 20
  const pageCount = Math.max(1, Math.ceil(effectiveFilteredItems.length / pageSize))
  const displayedItems = useMemo(() => {
    const start = (localPage - 1) * pageSize
    return effectiveFilteredItems.slice(start, start + pageSize)
  }, [effectiveFilteredItems, localPage, pageSize])

  const openAssignModal = (item: StudioItem) => {
    setAssigningItem(item)
    const existing = getItemAssignment(item)
    setTargetLevel(existing.type === 'level' ? existing.level : 1)
  }

  const handleConfirmAssign = async () => {
    if (!assigningItem) return
    setAssignBusy(true)
    try {
      if (onAssignToLevel) {
        await onAssignToLevel(assigningItem, targetLevel)
      } else {
        onStartEditing(assigningItem)
      }
      setAssigningItem(null)
    } finally {
      setAssignBusy(false)
    }
  }

  const renderRarityBadge = (rarity: string) => {
    const r = (rarity || 'common').toLowerCase()
    if (r === 'legendary') {
      return <span className="rounded-md border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-[10px] font-black uppercase text-amber-800 shadow-xs">Legendary</span>
    }
    if (r === 'epic') {
      return <span className="rounded-md border border-purple-300 bg-purple-100 px-1.5 py-0.5 text-[10px] font-black uppercase text-purple-800 shadow-xs">Epic</span>
    }
    if (r === 'rare') {
      return <span className="rounded-md border border-sky-300 bg-sky-100 px-1.5 py-0.5 text-[10px] font-black uppercase text-sky-800 shadow-xs">Rare</span>
    }
    return <span className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">Common</span>
  }

  const renderStatusBadge = (item: StudioItem) => {
    if (item.status === 'published') {
      return <span className="rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-700">Published</span>
    }
    if (item.status === 'draft') {
      return <span className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-700">Draft</span>
    }
    if (item.status === 'review') {
      return <span className="rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-extrabold text-blue-700">Review</span>
    }
    return <span className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">Retired</span>
  }

  return (
    <div className="space-y-4">
      {/* Studio Asset Gallery Header & Actions */}
      <section className="ui-card overflow-hidden border border-border shadow-xs">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-white px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-brand-600">Thư viện Tài nguyên Đồ họa</p>
            <h2 className="font-display text-2xl text-slate-900">Visual Asset Gallery & Manager</h2>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-xl border border-border bg-slate-100 p-1" role="group" aria-label="Chế độ hiển thị">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition ${
                  viewMode === 'grid' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Lưới thẻ Visual (Grid)"
              >
                <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Lưới thẻ</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition ${
                  viewMode === 'list' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Bảng danh sách (List)"
              >
                <List className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Danh sách</span>
              </button>
            </div>

            <Button onClick={onOpenCreateMenu} className="flex items-center gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" aria-hidden="true" /> Tạo mới
            </Button>
          </div>
        </header>

        {/* Smart Filters Bar */}
        <div className="space-y-3 bg-slate-50/70 p-4">
          {/* Row 1: Search & Status Filter */}
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                className="field-input h-11 w-full rounded-xl border-border bg-white pl-10 text-sm shadow-xs focus:border-brand-500"
                value={localSearch}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Tìm nhanh theo tên, mã code hoặc mô tả asset…"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Xóa tìm kiếm"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Quick Status Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {([
                ['all', 'Tất cả trạng thái'],
                ['published', 'Đang phát hành'],
                ['draft', 'Bản nháp'],
                ['unassigned', `⚪ Chưa gán (${unassignedCount})`],
              ] as const).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setStatusFilter(val)
                    setLocalPage(1)
                  }}
                  className={`h-11 rounded-xl px-3.5 text-xs font-bold transition ${
                    statusFilter === val
                      ? val === 'unassigned'
                        ? 'border border-amber-400 bg-amber-50 text-amber-900 shadow-xs'
                        : 'border border-brand-500 bg-brand-50 text-brand-700 shadow-xs'
                      : 'border border-border bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Smart Kind Filter Bar */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="mr-1 font-bold text-slate-500">Loại asset:</span>
            {KIND_FILTER_OPTIONS.map(({ key, label, icon: Icon }) => {
              const count = items.filter((item) => {
                if (key === 'all') return true
                if (key === 'chapter') return item.contentType === 'chapter'
                if (key === 'event') return item.contentType === 'event' || item.kind === 'event_ticket'
                if (key === 'achievement') return item.contentType === 'achievement'
                if (key === 'background') return item.kind === 'background' || item.kind === 'theme'
                return item.kind === key
              }).length

              const isActive = kindFilter === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setKindFilter(key)
                    setLocalPage(1)
                    if (onFilterChange) {
                      if (key === 'chapter' || key === 'event' || key === 'achievement') {
                        onFilterChange(key)
                      } else {
                        onFilterChange('all')
                      }
                    }
                  }}
                  className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 font-bold transition ${
                    isActive
                      ? 'border-brand-500 bg-brand-600 text-white shadow-xs'
                      : 'border-border bg-white text-slate-600 hover:border-brand-300 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} aria-hidden="true" />
                  <span>{label}</span>
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isActive ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Results Info Bar */}
        <div className="flex items-center justify-between border-b border-border bg-slate-50/40 px-5 py-2.5 text-xs text-muted">
          <span>
            Hiển thị <strong className="font-bold text-slate-800">{displayedItems.length}</strong> / {effectiveFilteredItems.length} tài nguyên đồ họa
            {statusFilter === 'unassigned' && ' (Chưa được gán vào mốc nào)'}
          </span>
          <span>Trang {localPage} / {pageCount}</span>
        </div>

        {/* Empty State */}
        {displayedItems.length === 0 && (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Layers className="h-7 w-7" />
            </div>
            <h3 className="mt-3 text-base font-extrabold text-slate-800">Không tìm thấy tài sản phù hợp</h3>
            <p className="mt-1 text-xs text-muted">Hãy thử xóa bộ lọc tìm kiếm hoặc tạo một asset đồ họa mới.</p>
            <div className="mt-4 flex justify-center gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setKindFilter('all')
                  setStatusFilter('all')
                  handleSearchChange('')
                }}
              >
                Xóa tất cả bộ lọc
              </Button>
              <Button onClick={onOpenCreateMenu}>+ Tạo asset mới</Button>
            </div>
          </div>
        )}

        {/* VIEW MODE: GRID (Visual Cards) */}
        {viewMode === 'grid' && displayedItems.length > 0 && (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6">
            {displayedItems.map((item) => {
              const assignment = getItemAssignment(item)
              return (
                <article
                  key={item.id}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
                >
                  <div>
                    {/* Artwork Container with Hover Zoom */}
                    <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50/80 p-3 transition group-hover:bg-slate-100/60">
                      {/* Rarity Tag at top-left */}
                      <div className="absolute left-2.5 top-2.5 z-10">
                        {renderRarityBadge(item.rarity)}
                      </div>

                      {/* Status Tag at top-right */}
                      <div className="absolute right-2.5 top-2.5 z-10">
                        {renderStatusBadge(item)}
                      </div>

                      {/* Centered Artwork with Hover Zoom */}
                      <div className="flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        {item.contentType === 'reward' ? (
                          <StudioArtwork item={item} meaningful />
                        ) : item.contentType === 'chapter' ? (
                          <BookOpen className="h-12 w-12 text-indigo-500" aria-hidden="true" />
                        ) : (
                          <CalendarDays className="h-12 w-12 text-amber-500" aria-hidden="true" />
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between gap-1 text-[10px]">
                        <span className="font-black uppercase tracking-wider text-brand-600">
                          {item.kind ? item.kind : item.contentType}
                        </span>
                        <span className="font-mono text-slate-400">v{item.version}</span>
                      </div>

                      <h3 className="mt-1 truncate text-sm font-extrabold text-slate-900" title={item.name}>
                        {item.name}
                      </h3>

                      <p className="truncate font-mono text-[11px] text-slate-400" title={item.code}>
                        {item.code}
                      </p>

                      <p className="mt-1 line-clamp-1 text-xs text-muted" title={item.description}>
                        {item.description || 'Chưa có mô tả'}
                      </p>
                    </div>

                    {/* Assignment Inspector (Designer Feature) */}
                    <div className="mt-3 border-t border-slate-100 pt-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-slate-500">Mốc gán:</span>
                        {assignment.type === 'level' ? (
                          <button
                            type="button"
                            onClick={() => onNavigateToMap?.(assignment.level)}
                            title={`Xem trên Cây tiến trình (Level ${assignment.level})`}
                            className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 hover:border-emerald-300"
                          >
                            <Target className="h-3 w-3" />
                            Level {assignment.level}
                          </button>
                        ) : assignment.type === 'storybook' ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                            <BookOpen className="h-3 w-3" />
                            {assignment.label}
                          </span>
                        ) : assignment.type === 'event' ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                            <CalendarDays className="h-3 w-3" />
                            {assignment.label}
                          </span>
                        ) : assignment.type === 'action' ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-700">
                            <Network className="h-3 w-3" />
                            {assignment.label}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                              ⚪ Chưa gán
                            </span>
                            <button
                              type="button"
                              onClick={() => openAssignModal(item)}
                              title="Gán nhanh vào Level trên Cây tiến trình"
                              className="rounded-md border border-brand-300 bg-brand-50 px-1.5 py-0.5 text-[10px] font-black text-brand-700 hover:bg-brand-100 transition"
                            >
                              + Gán Level
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Toolbar */}
                  <div className="mt-3 flex items-center justify-end gap-1 border-t border-slate-100 pt-2 text-slate-500">
                    <button
                      type="button"
                      onClick={() => onStartEditing(item)}
                      className="rounded-lg p-1.5 transition hover:bg-brand-50 hover:text-brand-700"
                      title={studioEditLabel(item)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    {item.source === 'studio' && item.status === 'draft' && (
                      <>
                        <button
                          type="button"
                          onClick={() => void onRequestLifecycle(item, 'review')}
                          className="rounded-lg p-1.5 transition hover:bg-blue-50 hover:text-blue-700"
                          title="Gửi reviewer duyệt"
                        >
                          <UploadCloud className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void onRequestLifecycle(item, 'publish')}
                          className="rounded-lg p-1.5 text-emerald-600 transition hover:bg-emerald-50 hover:text-emerald-800"
                          title="Phát hành ngay"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}

                    {item.source === 'studio' && (item.status === 'review' || item.status === 'scheduled') && (
                      <>
                        <button
                          type="button"
                          onClick={() => void onRequestLifecycle(item, 'publish')}
                          className="rounded-lg p-1.5 text-emerald-600 transition hover:bg-emerald-50 hover:text-emerald-800"
                          title="Phát hành ngay"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void onRequestLifecycle(item, 'revert')}
                          className="rounded-lg p-1.5 transition hover:bg-slate-100 hover:text-slate-700"
                          title="Trả về nháp"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}

                    {item.source === 'studio' && (
                      <button
                        type="button"
                        onClick={() => void onRequestLifecycle(item, 'archive')}
                        className="rounded-lg p-1.5 transition hover:bg-rose-50 hover:text-rose-600"
                        title={item.status === 'published' ? 'Archive bản chính thức' : 'Archive bản nháp'}
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {item.source === 'studio' && (
                      <button
                        type="button"
                        onClick={() => void onShowAudit(item)}
                        className="rounded-lg p-1.5 transition hover:bg-slate-100 hover:text-slate-700"
                        title="Lịch sử audit"
                      >
                        <History className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Inline Audit Panel if active for this item */}
                  {auditPanel?.itemId === item.id && (
                    <div className="mt-2 rounded-xl bg-slate-50 p-2.5 text-[11px]">
                      <strong className="block text-slate-800">Lịch sử thay đổi</strong>
                      {auditPanel.entries.length ? auditPanel.entries.slice(0, 3).map((entry) => (
                        <p key={entry.id} className="mt-1 text-slate-600">
                          {entry.createdAt} · {entry.actorName ?? 'Hệ thống'} · {entry.action}
                        </p>
                      )) : (
                        <p className="mt-1 text-muted">Chưa có sự kiện audit.</p>
                      )}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}

        {/* VIEW MODE: LIST (Table view) */}
        {viewMode === 'list' && displayedItems.length > 0 && (
          <div className="divide-y divide-border">
            {displayedItems.map((item) => {
              const assignment = getItemAssignment(item)
              return (
                <article key={item.id} className="grid gap-3 px-5 py-3.5 sm:grid-cols-[56px_1fr_auto] sm:items-center">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {item.contentType === 'reward' ? (
                      <StudioArtwork item={item} />
                    ) : item.contentType === 'chapter' ? (
                      <BookOpen className="h-6 w-6 text-indigo-500" aria-hidden="true" />
                    ) : (
                      <CalendarDays className="h-6 w-6 text-amber-500" aria-hidden="true" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-slate-900">{item.name}</h3>
                      {renderRarityBadge(item.rarity)}
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-black uppercase text-brand-700">
                        {item.kind ? item.kind : item.contentType}
                      </span>
                      {assignment.type === 'level' ? (
                        <button
                          type="button"
                          onClick={() => onNavigateToMap?.(assignment.level)}
                          className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                        >
                          🎯 Level {assignment.level}
                        </button>
                      ) : assignment.type === 'unassigned' ? (
                        <button
                          type="button"
                          onClick={() => openAssignModal(item)}
                          className="rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 hover:bg-amber-100"
                        >
                          ⚪ Chưa gán [+ Gán Level]
                        </button>
                      ) : (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                          {assignment.label}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-muted">{item.code} · v{item.version}</p>
                    <p className="line-clamp-1 text-sm text-muted">{item.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span className="text-xs font-bold">
                      {renderStatusBadge(item)}
                    </span>
                    <Button variant="secondary" onClick={() => onStartEditing(item)}>
                      <Pencil className="h-3.5 w-3.5" /> Sửa
                    </Button>
                    {item.source === 'studio' && item.status === 'draft' && (
                      <>
                        <Button variant="secondary" onClick={() => void onRequestLifecycle(item, 'review')}>
                          Duyệt
                        </Button>
                        <Button onClick={() => void onRequestLifecycle(item, 'publish')}>
                          Phát hành
                        </Button>
                        <Button variant="ghost" className="text-danger" onClick={() => void onRequestLifecycle(item, 'archive')}>
                          <Archive className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    {item.source === 'studio' && item.status === 'published' && (
                      <Button variant="secondary" className="text-danger" onClick={() => void onRequestLifecycle(item, 'archive')}>
                        <Archive className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {item.source === 'studio' && (
                      <Button variant="ghost" onClick={() => void onShowAudit(item)}>
                        <History className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {pageCount > 1 && (
          <footer className="flex items-center justify-between border-t border-border bg-slate-50/50 p-4">
            <span className="text-xs text-muted">
              Đang ở trang <strong>{localPage}</strong> / {pageCount} ({effectiveFilteredItems.length} kết quả)
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={localPage === 1}
                onClick={() => setLocalPage((p) => Math.max(1, p - 1))}
              >
                Trang trước
              </Button>
              <Button
                variant="secondary"
                disabled={localPage >= pageCount}
                onClick={() => setLocalPage((p) => Math.min(pageCount, p + 1))}
              >
                Trang sau
              </Button>
            </div>
          </footer>
        )}
      </section>

      {/* QUICK ASSIGN LEVEL MODAL */}
      {assigningItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Gán phần thưởng vào Level"
          onClick={(e) => {
            if (e.target === e.currentTarget && !assignBusy) setAssigningItem(null)
          }}
        >
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-brand-600">Gán vào Cây tiến trình</p>
                <h3 className="font-display text-lg">Gán thưởng vào Level</h3>
              </div>
              <button
                type="button"
                disabled={assignBusy}
                onClick={() => setAssigningItem(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                <StudioArtwork item={assigningItem} meaningful />
              </div>
              <div className="min-w-0">
                <h4 className="truncate text-sm font-extrabold text-slate-900">{assigningItem.name}</h4>
                <p className="font-mono text-xs text-muted">{assigningItem.code}</p>
                <div className="mt-1 flex gap-1">
                  {renderRarityBadge(assigningItem.rarity)}
                  <span className="rounded bg-brand-50 px-1 text-[10px] font-bold text-brand-700">{assigningItem.kind}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block text-sm font-bold text-slate-800">
                Mục tiêu Level mở khóa (1–100):
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  disabled={assignBusy}
                  className="field-input mt-1.5 h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-bold shadow-xs focus:border-brand-500"
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                />
              </label>

              {/* Quick Level Suggestion Buttons */}
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-muted self-center mr-1">Gợi ý mốc:</span>
                {[1, 5, 10, 15, 20, 25, 30, 50, 75, 100].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setTargetLevel(lvl)}
                    className={`rounded-lg px-2 py-1 text-xs font-bold transition ${
                      targetLevel === lvl
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    L{lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button
                variant="secondary"
                disabled={assignBusy}
                onClick={() => {
                  setAssigningItem(null)
                  onStartEditing(assigningItem)
                }}
                className="flex-1"
              >
                Mở form đầy đủ
              </Button>
              <Button
                disabled={assignBusy}
                onClick={() => void handleConfirmAssign()}
                className="flex-[1.5]"
              >
                {assignBusy ? 'Đang lưu…' : `Lưu gán vào Level ${targetLevel}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
