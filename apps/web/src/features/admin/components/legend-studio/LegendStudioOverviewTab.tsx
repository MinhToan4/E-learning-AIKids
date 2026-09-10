import { Archive, BookOpen, CalendarDays, CheckCircle2, Gift, History, Network, Pencil, RotateCcw, Search, Settings2 } from 'lucide-react'
import type { ComponentType } from 'react'
import { Button } from '@/shared/components/ui/Button'
import type { AuditEntry, ContentType, LifecycleAction, StudioItem } from './types'
import { studioEditLabel, studioStatusLabel } from './constants'

export interface LegendStudioOverviewTabProps {
  items: StudioItem[]
  filteredItems: StudioItem[]
  visibleItems: StudioItem[]
  filter: ContentType | 'all'
  onFilterChange: (filter: ContentType | 'all') => void
  libraryQuery: string
  onLibraryQueryChange: (query: string) => void
  libraryStatus: StudioItem['status'] | 'all'
  onLibraryStatusChange: (status: StudioItem['status'] | 'all') => void
  libraryPage: number
  libraryPageCount: number
  onPageChange: (page: number | ((prev: number) => number)) => void
  onStartEditing: (item: StudioItem) => void
  onRequestLifecycle: (item: StudioItem, action: LifecycleAction) => void
  onShowAudit: (item: StudioItem) => void
  auditPanel: { itemId: string; entries: AuditEntry[] } | null
  onOpenCreateMenu: () => void
  StudioArtwork: ComponentType<{ item: StudioItem; meaningful?: boolean }>
}

export function LegendStudioOverviewTab({
  items,
  filteredItems,
  visibleItems,
  filter,
  onFilterChange,
  libraryQuery,
  onLibraryQueryChange,
  libraryStatus,
  onLibraryStatusChange,
  libraryPage,
  libraryPageCount,
  onPageChange,
  onStartEditing,
  onRequestLifecycle,
  onShowAudit,
  auditPanel,
  onOpenCreateMenu,
  StudioArtwork,
}: LegendStudioOverviewTabProps) {
  return (
    <section className="ui-card overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-brand-600">Quản lý catalog & version</p>
          <h2 className="font-display text-2xl">Kho nội dung phát hành</h2>
        </div>
        <Button onClick={onOpenCreateMenu}>+ Thêm mới mọi loại</Button>
      </header>
      <div className="grid gap-3 border-b border-border bg-slate-50/70 p-4 lg:grid-cols-[minmax(240px,1fr)_220px]">
        <label className="relative block">
          <span className="sr-only">Tìm trong kho nội dung</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            className="field-input min-h-12 w-full pl-12"
            value={libraryQuery}
            onChange={(event) => onLibraryQueryChange(event.target.value)}
            placeholder="Tìm tên, mã hoặc loại reward…"
          />
        </label>
        <label className="relative block">
          <span className="sr-only">Lọc trạng thái</span>
          <Settings2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true" />
          <select
            className="field-input min-h-12 w-full pl-12"
            value={libraryStatus}
            onChange={(event) => onLibraryStatusChange(event.target.value as StudioItem['status'] | 'all')}
          >
            <option value="all">Mọi trạng thái</option>
            <option value="published">Đang phát hành</option>
            <option value="draft">Bản nháp</option>
            <option value="review">Chờ duyệt</option>
            <option value="scheduled">Đã lên lịch</option>
            <option value="retired">Đã archive · chờ xóa</option>
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
          <button
            key={value}
            type="button"
            onClick={() => onFilterChange(value)}
            className={`flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-extrabold transition ${
              filter === value
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-border bg-white text-muted hover:border-brand-300'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{label}</span>
            <span className="rounded-lg bg-white px-2 py-0.5 text-xs">
              {value === 'all' ? items.length : items.filter((item) => item.contentType === value).length}
            </span>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between border-b border-border px-5 py-3 text-sm text-muted">
        <span>Hiển thị <strong className="text-text">{visibleItems.length}</strong> / {filteredItems.length} kết quả</span>
        <span>Trang {libraryPage}/{libraryPageCount}</span>
      </div>
      <div className="divide-y divide-border">
        {visibleItems.length === 0 && (
          <p className="p-10 text-center text-muted">Chưa có nội dung trong mục này. Hãy tạo version đầu tiên.</p>
        )}
        {visibleItems.map((item) => (
          <article key={item.id} className="grid gap-3 px-5 py-3 sm:grid-cols-[52px_1fr_auto] sm:items-center">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-brand-50">
              {item.contentType === 'reward' ? (
                <StudioArtwork item={item} />
              ) : item.contentType === 'chapter' ? (
                <BookOpen className="h-5 w-5 text-brand-600" aria-hidden="true" />
              ) : (
                <CalendarDays className="h-5 w-5 text-brand-600" aria-hidden="true" />
              )}
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
                <pre className="mt-2 max-h-40 overflow-auto rounded-xl bg-slate-100 p-3">
                  {JSON.stringify({ unlockRule: item.unlockRule, displayConfig: item.displayConfig, content: item.content }, null, 2)}
                </pre>
              </details>
            </div>
            <div className="flex flex-wrap gap-2 sm:max-w-40 sm:justify-end">
              <span className={`w-full text-right text-xs font-black ${
                item.status === 'published' ? 'text-success' : item.status === 'retired' ? 'text-muted' : 'text-brand-600'
              }`}>
                {studioStatusLabel(item)} · v{item.version}
              </span>
              <Button variant="secondary" onClick={() => onStartEditing(item)}>
                <Pencil className="h-4 w-4" aria-hidden="true" /> {studioEditLabel(item)}
              </Button>
              {item.source === 'studio' && item.status === 'draft' && (
                <>
                  <Button variant="secondary" onClick={() => void onRequestLifecycle(item, 'review')}>
                    Gửi reviewer duyệt
                  </Button>
                  <Button variant="ghost" className="text-danger" onClick={() => void onRequestLifecycle(item, 'archive')}>
                    <Archive className="h-4 w-4" aria-hidden="true" /> Archive bản nháp
                  </Button>
                </>
              )}
              {item.source === 'studio' && (item.status === 'review' || item.status === 'scheduled') && (
                <>
                  <Button onClick={() => void onRequestLifecycle(item, 'publish')}>
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Phát hành ngay
                  </Button>
                  <Button variant="secondary" onClick={() => void onRequestLifecycle(item, 'revert')}>
                    <RotateCcw className="h-4 w-4" aria-hidden="true" /> Trả về nháp
                  </Button>
                </>
              )}
              {item.source === 'studio' && item.status === 'published' && (
                <Button variant="secondary" className="text-danger" onClick={() => void onRequestLifecycle(item, 'archive')}>
                  <Archive className="h-4 w-4" aria-hidden="true" /> Archive bản chính thức
                </Button>
              )}
              {item.source === 'studio' && (
                <Button variant="ghost" onClick={() => void onShowAudit(item)}>
                  <History className="h-4 w-4" aria-hidden="true" /> Lịch sử
                </Button>
              )}
            </div>
            {auditPanel?.itemId === item.id && (
              <div className="rounded-xl bg-slate-50 p-3 text-xs sm:col-start-2 sm:col-end-4">
                <strong>Lịch sử thay đổi</strong>
                {auditPanel.entries.length ? auditPanel.entries.map((entry) => (
                  <p key={entry.id} className="mt-2">
                    {entry.createdAt} · {entry.actorName ?? 'Hệ thống'} · {entry.action}
                    {entry.summary ? ` — ${entry.summary}` : ''}
                  </p>
                )) : (
                  <p className="mt-2 text-muted">Chưa có sự kiện audit.</p>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
      {filteredItems.length > 20 && (
        <footer className="flex items-center justify-end gap-2 border-t border-border p-4">
          <Button variant="secondary" disabled={libraryPage === 1} onClick={() => onPageChange((page) => Math.max(1, page - 1))}>Trang trước</Button>
          <Button variant="secondary" disabled={libraryPage === libraryPageCount} onClick={() => onPageChange((page) => Math.min(libraryPageCount, page + 1))}>Trang sau</Button>
        </footer>
      )}
    </section>
  )
}
