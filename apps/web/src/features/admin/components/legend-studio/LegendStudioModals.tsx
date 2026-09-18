import type { ComponentType, ReactNode } from 'react'
import { BookOpen, CalendarDays, Gift, Link2, Network, Plus, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import type { ContentType, LifecycleAction, StudioItem } from './types'
import { studioStatusLabel } from './constants'

export interface CreateMenuProps {
  showCreateMenu: boolean
  onToggle: () => void
  onCreateNew: (type: ContentType) => void
}

export function CreateMenuModal({
  showCreateMenu,
  onToggle,
  onCreateNew,
}: CreateMenuProps) {
  if (!showCreateMenu) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Thêm nội dung mới"
      onClick={(e) => {
        if (e.target === e.currentTarget) onToggle()
      }}
    >
      <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-brand-600">Tạo nội dung mới</p>
            <h2 className="font-display text-xl">Chọn loại tài sản hoặc cấu hình</h2>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Đóng cửa sổ"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {([
            ['reward', Gift, 'Reward / Vật phẩm', 'Frame, avatar, nền, title, companion, effect…'],
            ['achievement', Network, 'Achievement tiến hoá', 'Action, metric và các mốc dùng chung'],
            ['chapter', BookOpen, 'Storybook chapter', 'Bìa, nội dung, sticker và quà boss'],
            ['event', CalendarDays, 'Sự kiện', 'Banner, lịch, rule tham gia và reward pool'],
          ] as const).map(([type, Icon, title, description]) => (
            <button
              key={type}
              type="button"
              onClick={() => onCreateNew(type)}
              className="group flex flex-col rounded-2xl border-2 border-slate-200 bg-white p-4 text-left transition hover:border-brand-500 hover:bg-brand-50/50 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <strong className="mt-3 block text-sm font-extrabold text-slate-900">{title}</strong>
              <span className="mt-1 block text-xs text-muted leading-relaxed">{description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}


export interface SelectedRewardDrawerProps {
  selectedReward: StudioItem | null
  onClose: () => void
  selectedRewardRows: Array<{
    item: StudioItem
    channel: string
    trigger: string
    issues: Array<{ severity: string; message: string }>
  }>
  onOpenMappingBuilder: () => void
  renderLifecycleActions: (item: StudioItem, hasBlockingError?: boolean) => ReactNode
  StudioArtwork: ComponentType<{ item: StudioItem; meaningful?: boolean }>
}

export function SelectedRewardDrawer({
  selectedReward,
  onClose,
  selectedRewardRows,
  onOpenMappingBuilder,
  renderLifecycleActions,
  StudioArtwork,
}: SelectedRewardDrawerProps) {
  if (!selectedReward) return null

  return (
    <aside
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-border bg-white p-5 shadow-2xl"
      aria-label={`Chi tiết điều kiện của ${selectedReward.name}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-50">
            <StudioArtwork item={selectedReward} meaningful />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase text-brand-600">Phần quà → Điều kiện</p>
            <h3 className="truncate font-display text-xl">{selectedReward.name}</h3>
            <code className="text-xs text-muted">{selectedReward.code}</code>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-slate-100"
          aria-label="Đóng chi tiết"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-6">
        <h4 className="font-extrabold">Lịch sử upload & phiên bản</h4>
        <p className="mt-1 text-xs text-muted">
          Cây chính chỉ hiển thị bản đang phát hành. Nháp, chờ duyệt và bản đã ngừng được quản lý tại đây.
        </p>
        <div className="mt-3 space-y-3">
          {selectedRewardRows.map((row) => (
            <article key={row.item.id} className="rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-brand-50 px-2 py-1 text-[10px] font-black uppercase text-brand-700">
                  {row.channel}
                </span>
                <span className={`text-xs font-black ${row.item.status === 'published' ? 'text-success' : 'text-brand-600'}`}>
                  {studioStatusLabel(row.item)} · v{row.item.version}
                </span>
              </div>
              <p className="mt-3 font-extrabold">{row.trigger}</p>
              <p className="mt-1 text-xs text-muted">
                {row.item.unlockRule.metric ? `Metric: ${String(row.item.unlockRule.metric)} · ` : ''}
                Giá trị: {String(row.item.unlockRule.value ?? '—')}
              </p>
              {renderLifecycleActions(row.item, row.issues.some((issue) => issue.severity === 'error'))}
            </article>
          ))}
        </div>
      </div>
      <Button
        className="mt-5 w-full"
        onClick={() => {
          onClose()
          onOpenMappingBuilder()
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      >
        <Link2 className="h-4 w-4" /> Chỉnh sửa liên kết
      </Button>
    </aside>
  )
}

export interface LifecycleConfirmModalProps {
  pendingLifecycle: { item: StudioItem; action: LifecycleAction; dependencies?: { canDelete: boolean; references: Array<{ type: string; label: string }> } } | null
  onConfirm: () => void
  onCancel: () => void
}

export function LifecycleConfirmModal({
  pendingLifecycle,
  onConfirm,
  onCancel,
}: LifecycleConfirmModalProps) {
  const dialog = pendingLifecycle ? (() => {
    const { item, action, dependencies } = pendingLifecycle
    if (action === 'archive') {
      return {
        title: `Archive ${item.name} v${item.version}?`,
        description: `Version sẽ ngừng hiển thị và được lưu trong lịch sử 3 ngày trước khi hệ thống xóa hoàn toàn. Người học đã sở hữu vẫn giữ phần quà. ${
          dependencies?.references.length
            ? `${dependencies.references.length} liên kết đang dùng sẽ được giữ trong audit để kiểm tra.`
            : 'Không phát hiện dependency đang dùng.'
        }`,
        label: 'Archive trong 3 ngày',
        danger: true,
      }
    }
    if (action === 'publish') {
      return {
        title: `Phát hành ${item.code} v${item.version} ngay?`,
        description: 'Version này sẽ trở thành bản production và thay thế version đang chạy cùng mã. Requirement và reward liên kết sẽ có hiệu lực ngay.',
        label: 'Phát hành ngay',
        danger: false,
      }
    }
    if (action === 'review') {
      return {
        title: 'Gửi reviewer duyệt?',
        description: 'Bản nháp sẽ khóa ở trạng thái chờ duyệt. Reviewer có thể phát hành hoặc trả lại bản nháp.',
        label: 'Gửi duyệt',
        danger: false,
      }
    }
    return {
      title: 'Trả version về bản nháp?',
      description: 'Version sẽ rời hàng chờ duyệt để tiếp tục chỉnh sửa. Production hiện tại không bị ảnh hưởng.',
      label: 'Trả về nháp',
      danger: false,
    }
  })() : null

  return (
    <ConfirmDialog
      open={Boolean(pendingLifecycle)}
      danger={dialog?.danger}
      title={dialog?.title ?? 'Xác nhận thao tác'}
      description={dialog?.description}
      confirmLabel={dialog?.label}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
