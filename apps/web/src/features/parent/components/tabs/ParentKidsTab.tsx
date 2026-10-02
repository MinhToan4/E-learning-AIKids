import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import {
  Baby,
  BookOpen,
  Pencil,
  Plus,
  QrCode,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { LoadingSkeleton } from '@/features/parent/components/ParentStatCard'
import { EditChildModal, avatarEmoji } from '@/features/parent/components/EditChildModal'
import { StudentQrCardModal } from '@/features/parent/components/StudentQrCardModal'
import type { Child, HouseholdSub } from '@/features/parent/types/parent.types'

export function ParentKidsTab() {
  const [kids, setKids] = useState<Child[]>([])
  const [sub, setSub] = useState<HouseholdSub | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null)
  const [editTarget, setEditTarget] = useState<Child | null | undefined>(undefined)
  const [qrModalTarget, setQrModalTarget] = useState<Child | null>(null)
  const { toasts, showToast, dismissToast } = useToast()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const loadKids = useCallback(async () => {
    try {
      const data = await api<{
        children: Child[]
        subscription: HouseholdSub
      }>('/api/parent/children')
      setKids(data.children)
      setSub(data.subscription)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lỗi tải dữ liệu', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void loadKids()
  }, [loadKids])

  const maxKids = sub?.maxChildren ?? 5
  const seatsLeft = sub?.seatsRemaining ?? Math.max(0, maxKids - kids.length)

  useEffect(() => {
    if (searchParams.get('action') === 'new' && editTarget === undefined && seatsLeft > 0) {
      setEditTarget(null)
      // Xóa query param để không lặp lại khi đóng modal
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('action')
      setSearchParams(nextParams, { replace: true })
    }
  }, [searchParams, editTarget, seatsLeft, setSearchParams])

  useEffect(() => {
    const handleReload = () => void loadKids()
    window.addEventListener('parent:reload-data', handleReload)
    return () => window.removeEventListener('parent:reload-data', handleReload)
  }, [loadKids])

  async function deleteChild(childId: string) {
    try {
      await api(`/api/parent/children/${childId}`, { method: 'DELETE' })
      showToast('Tài khoản con đã được tạm khóa.', 'success')
      await loadKids()
      setDeleteTarget(null)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Lỗi', 'error')
      setDeleteTarget(null)
    }
  }

  async function updateConsent(
    child: Child,
    capability: 'allowAiCreate' | 'allowPhoto' | 'allowExport',
    enabled: boolean,
  ) {
    try {
      await api(`/api/parent/children/${child.id}/consent`, {
        method: 'PATCH',
        body: JSON.stringify({
          [capability]: enabled,
          policyVersion: 'aikids-child-safety-v1',
          locale: 'vi-VN',
        }),
      })
      setKids((prev) =>
        prev.map((item) => (item.id === child.id ? { ...item, [capability]: enabled } : item)),
      )
      showToast('Đã cập nhật quyền an toàn cho con.', 'success')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không cập nhật được quyền', 'error')
    }
  }

  if (loading) return <LoadingSkeleton count={3} />

  return (
    <div className="flex flex-col gap-4">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header: Tinh gọn súc tích */}
      <header className="rounded-3xl border-2 border-cream-300 bg-gradient-to-b from-cream-50 via-sun-50/40 to-white p-5 sm:p-6 shadow-clay text-text">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-900">
              <Users size={14} className="text-brand-600" /> Hồ sơ của con
            </span>
            <span className="rounded-full bg-cream-100 px-3 py-1.5 text-xs font-black text-brand-700 border border-cream-300">
              {kids.filter((k) => k.active !== false).length}/{maxKids} ghế
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/parent/plan"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 h-11 text-xs font-black text-amber-900 shadow-soft hover:bg-amber-100 transition whitespace-nowrap"
            >
              Đổi gói / Mở ghế
            </Link>
            <Button
              onClick={() => setEditTarget(null)}
              disabled={seatsLeft <= 0}
              className="!text-xs h-11 px-4 font-black shadow-clay whitespace-nowrap"
            >
              + Thêm con
            </Button>
          </div>
        </div>
        <p className="sr-only">Quản lý danh tính, quyền an toàn và hồ sơ học của con</p>
      </header>

      {/* Grid of child cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kids.length === 0 && (
          <div className="ui-card p-6 text-center sm:col-span-2 xl:col-span-3">
            <Baby className="mx-auto text-brand-500" size={36} aria-hidden="true" />
            <p className="mt-2 font-bold">Chưa có con nào</p>
            <p className="text-sm text-muted">Nhấn "Thêm con" để bắt đầu</p>
          </div>
        )}
        {kids.map((k) => {
          const courseCount = (k as unknown as { openCourses?: number }).openCourses ?? 2
          return (
            <div
              key={k.id}
              className={cn(
                'flex flex-col gap-3.5 p-4 sm:p-5 transition rounded-3xl border-2 border-cream-300 shadow-clay bg-gradient-to-b from-white via-cream-50/30 to-white text-text w-full min-w-0',
                !k.active && 'opacity-50',
              )}
            >
              {/* Card Header: Avatar, Name, Level & Quick Actions */}
              <div className="flex items-start gap-3.5">
                <div className="relative">
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-b from-sun-100 to-cream-100 text-3xl shadow-soft border-2 border-cream-200">
                    {avatarEmoji(k.avatarId)}
                  </div>
                  <span className="absolute -bottom-1.5 -right-1.5 rounded-full border-2 border-white bg-amber-400 px-1.5 py-0.2 text-[9px] font-black text-amber-950 shadow-soft">
                    Lv.{k.level || 1}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-black text-text leading-tight truncate">{k.nickname}</h3>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditTarget(k)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-muted hover:bg-cream-100 hover:text-text transition"
                        title="Chỉnh sửa hồ sơ"
                        aria-label="Chỉnh sửa hồ sơ con"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(k)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-muted hover:bg-coral-50 hover:text-coral-600 transition"
                        title="Tạm khóa"
                        aria-label="Tạm khóa hồ sơ con"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-muted font-bold mt-0.5">{k.ageBand || 'Chưa đặt nhóm tuổi'}</p>

                  {/* Level XP Bar */}
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-cream-200/80 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(10, ((k.xp % 1000) / 1000) * 100))}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-brand-700">
                      Cấp {k.level || 1} · {k.xp || 0} XP
                    </span>
                  </div>

                  <p className="mt-1.5 text-[11px] font-bold text-mint-700">
                    Vào học qua phiên đăng nhập của Ba / Mẹ
                  </p>
                </div>
              </div>

              {/* 3 Quick Stat Badges */}
              <div className="grid grid-cols-3 gap-2 bg-cream-50/80 rounded-2xl p-2 border border-cream-200 shadow-soft">
                <div className="flex flex-col items-center text-center">
                  <span className="text-[9px] uppercase font-black text-muted">Hoàn thành</span>
                  <span className="text-xs font-black text-text">{k.completedQuests ?? 0}</span>
                </div>
                <div className="flex flex-col items-center text-center border-l border-r border-cream-200">
                  <span className="text-[9px] uppercase font-black text-muted">Tích lũy</span>
                  <span className="text-xs font-black text-text">{k.totalStars ?? 0}</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-[9px] uppercase font-black text-muted">Mở khóa</span>
                  <span className="text-xs font-black text-text">{courseCount}</span>
                </div>
              </div>

              {/* Tinh gọn: Quyền an toàn trực quan, không tooltip hay accordion */}
              <div className="rounded-2xl border border-cream-300/80 bg-white/90 p-3 shadow-soft space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-black uppercase tracking-wider text-brand-800">
                    Quyền an toàn
                  </p>
                  <ShieldCheck size={14} className="text-mint-600" />
                </div>
                <div className="grid gap-2 text-xs">
                  <label className="flex items-center gap-2.5 rounded-xl bg-cream-50/60 px-3 py-2 min-h-[44px] border border-cream-200 hover:border-brand-200 transition cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="accent-brand-500 rounded h-4 w-4 shrink-0"
                      checked={Boolean(k.allowAiCreate)}
                      onChange={(event) => void updateConsent(k, 'allowAiCreate', event.target.checked)}
                    />
                    <span className="font-bold text-text text-xs">
                      Phòng sáng tạo AI
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 rounded-xl bg-cream-50/60 px-3 py-2 min-h-[44px] border border-cream-200 hover:border-brand-200 transition cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="accent-brand-500 rounded h-4 w-4 shrink-0"
                      checked={Boolean(k.allowPhoto)}
                      onChange={(event) => void updateConsent(k, 'allowPhoto', event.target.checked)}
                    />
                    <span className="font-bold text-text text-xs">
                      Dùng ảnh & camera
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 rounded-xl bg-cream-50/60 px-3 py-2 min-h-[44px] border border-cream-200 hover:border-brand-200 transition cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="accent-brand-500 rounded h-4 w-4 shrink-0"
                      checked={!Boolean(k.allowExport)}
                      onChange={(event) => void updateConsent(k, 'allowExport', !event.target.checked)}
                    />
                    <span className="font-bold text-text text-xs">
                      Tắt xuất / chia sẻ
                    </span>
                  </label>
                </div>
              </div>

              {/* 3 Main Action Buttons: Touch-friendly */}
              <div className="mt-auto pt-2 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/parent/learning?childId=${encodeURIComponent(k.id)}`}
                    className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl bg-brand-500 py-2 px-3 text-xs font-black text-white shadow-clay transition hover:bg-brand-600 active:scale-95 text-center whitespace-nowrap"
                  >
                    <BookOpen size={14} className="shrink-0" />
                    <span>Xem học tập</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => navigate('/kids')}
                    className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border-2 border-brand-200 bg-brand-50/70 py-2 px-3 text-xs font-black text-brand-700 shadow-soft transition hover:bg-brand-100 active:scale-95 text-center whitespace-nowrap"
                  >
                    <UserCheck size={14} className="shrink-0" />
                    <span>Đổi sang bé</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setQrModalTarget(k)}
                  className="w-full flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border border-cream-300 bg-white py-2 px-3 text-xs font-black text-slate-700 shadow-soft transition hover:text-text hover:bg-cream-50 active:scale-95 whitespace-nowrap"
                >
                  <QrCode size={14} className="shrink-0 text-brand-600" />
                  <span>Thẻ QR học sinh</span>
                </button>
              </div>
            </div>
          )
        })}

        {/* Empty Seat Slot Card */}
        {seatsLeft > 0 && (
          <div className="flex flex-col justify-center items-center text-center p-6 rounded-3xl border-2 border-dashed border-brand-300 bg-brand-50/30 transition hover:bg-brand-50/50 shadow-soft min-h-[300px]">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-soft border border-brand-100 mb-3">
              <Plus size={22} className="text-brand-500" />
            </div>
            <h3 className="font-display text-base font-black text-brand-800 mb-1">
              Ghế học sinh còn trống ({seatsLeft} ghế)
            </h3>
            <p className="text-xs text-muted mb-4 leading-relaxed px-4 max-w-xs">
              Thêm hồ sơ cho bé tiếp theo trong gia đình để cùng tham gia lộ trình học tập.
            </p>
            <Button onClick={() => setEditTarget(null)} className="!text-xs font-black shadow-clay">
              + Thêm con ngay
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Tạm khóa hồ sơ của con?"
        description="Con sẽ chưa thể vào học, nhưng toàn bộ tiến trình và sản phẩm vẫn được giữ để khôi phục sau."
        confirmLabel="Tạm khóa hồ sơ"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) void deleteChild(deleteTarget.id)
        }}
      />

      {/* EditChildModal — full-screen, triggered bằng nút bút chì */}
      <EditChildModal
        child={editTarget ?? null}
        isOpen={editTarget !== undefined}
        referenceChildId={kids[0]?.id}
        onClose={() => setEditTarget(undefined)}
        onSuccess={async () => {
          setEditTarget(undefined)
          showToast(editTarget ? 'Đã cập nhật hồ sơ con!' : 'Đã tạo tài khoản con!', 'success')
          await loadKids()
        }}
        onError={(e) => showToast(e, 'error')}
      />

      {/* StudentQrCardModal — hiển thị thẻ học sinh & mã QR đăng nhập nhanh */}
      <StudentQrCardModal
        child={qrModalTarget}
        isOpen={qrModalTarget !== null}
        onClose={() => setQrModalTarget(null)}
      />
    </div>
  )
}

export { ParentKidsTab as KidsTab }
