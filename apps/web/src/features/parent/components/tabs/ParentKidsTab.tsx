import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import {
  Baby,
  BookOpen,
  Gamepad2,
  KeyRound,
  Lock,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { useToast } from '@/shared/hooks/useToast'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { ConsentTooltip } from '@/features/parent/components/ConsentTooltip'
import { LoadingSkeleton } from '@/features/parent/components/ParentStatCard'
import { EditChildModal, avatarEmoji } from '@/features/parent/components/EditChildModal'
import { StudentQrCardModal } from '@/features/parent/components/StudentQrCardModal'
import type { Child, ConsentEvent, HouseholdSub } from '@/features/parent/types/parent.types'

export function ParentKidsTab() {
  const [kids, setKids] = useState<Child[]>([])
  const [sub, setSub] = useState<HouseholdSub | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null)
  const [consentHistoryChild, setConsentHistoryChild] = useState<string | null>(null)
  const [consentHistory, setConsentHistory] = useState<Record<string, ConsentEvent[]>>({})
  const [consentHistoryLoading, setConsentHistoryLoading] = useState(false)
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
      setConsentHistory((prev) => {
        const next = { ...prev }
        delete next[child.id]
        return next
      })
      showToast('Đã cập nhật quyền an toàn cho con.', 'success')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không cập nhật được quyền', 'error')
    }
  }

  async function toggleConsentHistory(childId: string) {
    if (consentHistoryChild === childId) {
      setConsentHistoryChild(null)
      return
    }
    setConsentHistoryChild(childId)
    if (consentHistory[childId]) return
    setConsentHistoryLoading(true)
    try {
      const result = await api<{ events: ConsentEvent[] }>(
        `/api/parent/children/${childId}/consent/events`,
      )
      setConsentHistory((prev) => ({ ...prev, [childId]: result.events }))
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không tải được lịch sử quyền', 'error')
    } finally {
      setConsentHistoryLoading(false)
    }
  }

  if (loading) return <LoadingSkeleton count={3} />

  return (
    <div className="flex flex-col gap-4">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header Cockpit */}
      <header className="rounded-3xl border-2 border-cream-300 bg-gradient-to-b from-cream-50 via-sun-50/40 to-white p-5 sm:p-6 shadow-clay text-text">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-300/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-0.5 text-xs font-black text-amber-900">
              <Sparkles size={12} className="text-amber-600" /> 👨‍👩‍👧‍👦 Góc Phụ Huynh & Gia Đình
            </span>
            <span className="rounded-full bg-cream-100 px-2.5 py-0.5 text-xs font-black text-brand-700">
              Hồ sơ con ({kids.filter((k) => k.active !== false).length}/{maxKids} ghế)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/parent/plan"
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-black text-amber-900 shadow-soft hover:bg-amber-100 transition"
            >
              ⭐ Đổi gói / Mở thêm ghế
            </Link>
            <Button
              onClick={() => setEditTarget(null)}
              disabled={seatsLeft <= 0}
              className="!text-xs !min-h-9 font-black shadow-clay"
            >
              + Thêm con
            </Button>
          </div>
        </div>

        <h1 className="font-display text-2xl font-black text-text mt-3 sm:text-3xl">
          Quản lý tài khoản các con
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1 max-w-3xl leading-relaxed">
          Quản lý danh tính, mã PIN, quyền an toàn và cách con đăng nhập. Tiến trình và chương trình học được quản lý riêng tại Trung tâm học tập.
        </p>

        {/* Family Safety Shield & Seat Meter */}
        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-cream-300/80 bg-white/80 p-4 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-mint-600" />
              <p className="text-xs font-black text-mint-800">
                🛡️ 100% tài khoản đã được bảo vệ mã PIN & kiểm duyệt AI an toàn
              </p>
            </div>
            {sub && (
              <span className="text-xs font-bold text-muted">
                Gói {sub.planName} · Còn {seatsLeft} ghế trống
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {Array.from({ length: maxKids }).map((_, i) => {
              const k = kids.filter((child) => child.active !== false)[i]
              if (k) {
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-2xl bg-cream-50 px-3 py-1.5 shadow-soft border border-cream-200"
                    title={k.nickname || 'Bé'}
                  >
                    <span className="text-xl">{avatarEmoji(k.avatarId)}</span>
                    <span className="text-xs font-black max-w-[5rem] truncate text-text">{k.nickname}</span>
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[10px] font-black text-amber-900">
                      Lv.{k.level || 1}
                    </span>
                  </div>
                )
              }
              return (
                <div
                  key={i}
                  className="flex items-center gap-1.5 rounded-2xl bg-white/60 px-3 py-1.5 border-2 border-dashed border-cream-300 opacity-70"
                >
                  <div className="w-5 h-5 rounded-full bg-cream-100 flex items-center justify-center text-xs text-muted">
                    <Plus size={12} />
                  </div>
                  <span className="text-xs font-bold text-muted">Ghế trống</span>
                </div>
              )
            })}
          </div>
        </div>
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
                'flex flex-col gap-3.5 p-5 transition rounded-3xl border-2 border-cream-300 shadow-clay bg-gradient-to-b from-white via-cream-50/30 to-white text-text',
                !k.active && 'opacity-50',
              )}
            >
              {/* Card Header: Avatar, Name, Level & Quick Actions */}
              <div className="flex items-start gap-3.5">
                <div className="relative">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-b from-sun-100 to-cream-100 text-4xl shadow-soft border-2 border-cream-200">
                    {avatarEmoji(k.avatarId)}
                  </div>
                  <span className="absolute -bottom-2 -right-2 rounded-full border-2 border-white bg-amber-400 px-1.5 py-0.5 text-[10px] font-black text-amber-950 shadow-soft">
                    Lv.{k.level || 1}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-black text-text leading-tight truncate">{k.nickname}</h3>
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
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2 flex-1 bg-cream-200/80 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(10, ((k.xp % 1000) / 1000) * 100))}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-brand-700">
                      Cấp {k.level || 1} · {k.xp || 0} XP
                    </span>
                  </div>

                  {/* PIN Safety status */}
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-bold">
                    {k.hasPin ? (
                      <button
                        type="button"
                        onClick={() => setEditTarget(k)}
                        className="inline-flex items-center gap-1 text-mint-700 hover:underline"
                      >
                        <Lock size={12} className="text-mint-600" />
                        <span>🔒 Đã có mã PIN (Bảo vệ an toàn)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditTarget(k)}
                        className="inline-flex items-center gap-1 text-amber-800 hover:underline"
                      >
                        <KeyRound size={12} className="text-amber-600" />
                        <span>⚠️ Chưa tạo mã PIN</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 3 Quick Stat Badges */}
              <div className="grid grid-cols-3 gap-2 bg-cream-50/80 rounded-2xl p-2.5 border border-cream-200 shadow-soft">
                <div className="flex flex-col items-center text-center">
                  <span className="text-[10px] uppercase font-black text-muted">Hoàn thành</span>
                  <span className="text-xs font-black text-text">🚀 {k.completedQuests ?? 0} trạm</span>
                </div>
                <div className="flex flex-col items-center text-center border-l border-r border-cream-200">
                  <span className="text-[10px] uppercase font-black text-muted">Tích lũy</span>
                  <span className="text-xs font-black text-text">⭐ {k.totalStars ?? 0} sao</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-[10px] uppercase font-black text-muted">Mở khóa</span>
                  <span className="text-xs font-black text-text">📚 {courseCount} vùng học</span>
                </div>
              </div>

              {/* Safety Control Board */}
              <div className="rounded-2xl border border-cream-300/80 bg-white/90 p-3 shadow-soft space-y-2">
                <p className="text-[11px] font-black uppercase tracking-wider text-brand-800">
                  Bảng điều khiển quyền an toàn
                </p>
                <div className="grid gap-1.5 text-xs">
                  <label className="flex items-start gap-2.5 rounded-xl bg-cream-50/60 px-2.5 py-2 border border-cream-200 hover:border-brand-200 transition cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 accent-brand-500"
                      checked={Boolean(k.allowAiCreate)}
                      onChange={(event) => void updateConsent(k, 'allowAiCreate', event.target.checked)}
                    />
                    <span className="flex-1">
                      <span className="flex items-center gap-1 font-bold text-text">
                        🤖 Phòng sáng tạo AI
                        <ConsentTooltip
                          badge="🤖 Nội dung AI được kiểm duyệt tự động"
                          on="Con vào được Studio AI, tạo câu chuyện & nhân vật."
                          off="Nút 'Tạo với AI' bị ẩn hoàn toàn với con."
                        />
                      </span>
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 rounded-xl bg-cream-50/60 px-2.5 py-2 border border-cream-200 hover:border-brand-200 transition cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 accent-brand-500"
                      checked={Boolean(k.allowPhoto)}
                      onChange={(event) => void updateConsent(k, 'allowPhoto', event.target.checked)}
                    />
                    <span className="flex-1">
                      <span className="flex items-center gap-1 font-bold text-text">
                        📷 Cho phép dùng ảnh & camera
                        <ConsentTooltip
                          badge="📷 Ảnh chỉ lưu trong ứng dụng, không chia sẻ ra ngoài"
                          on="Con dùng được camera & thư viện ảnh thiết bị."
                          off="Chỉ dùng ảnh có sẵn trong thư viện hệ thống."
                        />
                      </span>
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 rounded-xl bg-cream-50/60 px-2.5 py-2 border border-cream-200 hover:border-brand-200 transition cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 accent-brand-500"
                      checked={!Boolean(k.allowExport)}
                      onChange={(event) => void updateConsent(k, 'allowExport', !event.target.checked)}
                    />
                    <span className="flex-1">
                      <span className="flex items-center gap-1 font-bold text-text">
                        📤 Tắt xuất / chia sẻ
                        <ConsentTooltip
                          badge="📤 Mọi chia sẻ vẫn cần phụ huynh duyệt"
                          on="Nút chia sẻ bị ẩn hoàn toàn — con không thể chia sẻ."
                          off="Con thấy nút chia sẻ, phụ huynh duyệt từng lần."
                          onLabel="ĐÃ TẮT"
                          offLabel="ĐANG BẬT"
                        />
                      </span>
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted bg-cream-100/60 px-2.5 py-1.5 rounded-xl border border-cream-200">
                  ⏱️ 45 phút / ngày · Nhắc nghỉ mắt 20 phút
                </div>
              </div>

              {/* Consent history toggle */}
              <div className="flex flex-col">
                <button
                  type="button"
                  className="text-left text-[11px] font-black text-brand-600 hover:underline w-fit"
                  onClick={() => void toggleConsentHistory(k.id)}
                  aria-expanded={consentHistoryChild === k.id}
                >
                  {consentHistoryChild === k.id ? 'Ẩn lịch sử thay đổi quyền' : 'Xem lịch sử thay đổi quyền'}
                </button>
                {consentHistoryChild === k.id && (
                  <div
                    className="mt-2 rounded-xl border border-cream-300 bg-cream-50/80 p-2.5 text-[11px]"
                    role="region"
                    aria-label="Lịch sử quyền an toàn"
                  >
                    {consentHistoryLoading && !consentHistory[k.id] ? (
                      <p className="text-muted">Đang tải lịch sử...</p>
                    ) : consentHistory[k.id]?.length ? (
                      <ol className="flex flex-col gap-1.5">
                        {consentHistory[k.id].map((event) => (
                          <li
                            key={event.id}
                            className="rounded-lg bg-white px-2 py-1.5 shadow-soft border border-cream-200"
                          >
                            <p className="font-bold text-text">
                              {new Date(event.createdAt).toLocaleString('vi-VN')}
                            </p>
                            <p className="text-muted">
                              Chính sách {event.policyVersion} · {event.method}
                            </p>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-muted">Chưa có bản ghi thay đổi.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-auto pt-2 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/parent/learning?childId=${encodeURIComponent(k.id)}`}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-brand-500 py-2.5 px-3 text-xs font-black text-white shadow-clay transition hover:bg-brand-600 active:scale-95 text-center"
                  >
                    <BookOpen size={15} />
                    <span>Xem học tập</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => navigate('/kids')}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border-2 border-brand-200 bg-brand-50/70 py-2.5 px-3 text-xs font-black text-brand-700 shadow-soft transition hover:bg-brand-100 active:scale-95 text-center"
                  >
                    <span>🚀 Chuyển sang con</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setQrModalTarget(k)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-2xl border border-cream-300 bg-white py-2 px-3 text-xs font-black text-muted shadow-soft transition hover:text-text hover:bg-cream-50 active:scale-95"
                >
                  <span>📲 Thẻ QR học sinh</span>
                </button>
              </div>
            </div>
          )
        })}

        {/* Empty Seat Slot Card */}
        {seatsLeft > 0 && (
          <div className="flex flex-col justify-center items-center text-center p-6 rounded-3xl border-2 border-dashed border-brand-300 bg-brand-50/30 transition hover:bg-brand-50/50 shadow-soft min-h-[360px]">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-soft border border-brand-100 mb-4">
              <Plus size={24} className="text-brand-500" />
            </div>
            <h3 className="font-display text-lg font-black text-brand-800 mb-1">
              ➕ Ghế học sinh còn trống ({seatsLeft} ghế)
            </h3>
            <p className="text-xs text-muted mb-5 leading-relaxed px-4 max-w-xs">
              Gói học của gia đình còn {seatsLeft} ghế chưa dùng. Thêm hồ sơ cho bé tiếp theo để học cùng nhau!
            </p>
            <Button onClick={() => setEditTarget(null)} className="!text-xs font-black shadow-clay">
              + Thêm con ngay
            </Button>
          </div>
        )}
      </div>

      {/* 3 Login Methods Guide */}
      <div className="mt-6 rounded-3xl border-2 border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-sun-50/50 to-orange-50/80 p-5 sm:p-6 shadow-soft text-text">
        <h3 className="font-display text-lg sm:text-xl font-black text-amber-950 mb-3 flex items-center gap-2">
          <Gamepad2 size={22} className="text-amber-600" />
          Hướng dẫn 3 cách cho con vào học
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="bg-white/85 rounded-2xl p-4 border border-amber-100 shadow-soft">
            <div className="text-2xl mb-2">📲</div>
            <p className="font-black text-sm text-amber-950 mb-1">1. Quét mã QR thẻ học sinh</p>
            <p className="text-xs text-muted leading-relaxed font-bold">
              Bấm "Thẻ QR học sinh" ở trên. Con dùng iPad hoặc điện thoại quét để đăng nhập tức thì không cần mật khẩu.
            </p>
          </div>
          <div className="bg-white/80 rounded-2xl p-4 border border-amber-100 shadow-soft">
            <div className="text-2xl mb-2">🚀</div>
            <p className="font-black text-sm text-amber-950 mb-1">2. Chuyển chế độ thiết bị chung</p>
            <p className="text-xs text-muted leading-relaxed font-bold">
              Ba / Mẹ bấm "Chuyển sang con" trên máy này. Giao diện quản lý phụ huynh sẽ tự động khóa bằng PIN an toàn.
            </p>
          </div>
          <div className="bg-white/80 rounded-2xl p-4 border border-amber-100 shadow-soft">
            <div className="text-2xl mb-2">🔢</div>
            <p className="font-black text-sm text-amber-950 mb-1">3. Chọn tên & nhập mã PIN</p>
            <p className="text-xs text-muted leading-relaxed font-bold">
              Khi mở ứng dụng, con tự chọn tên mình và nhập mã PIN 4-6 số đã cài đặt để vào không gian học tập riêng.
            </p>
          </div>
        </div>
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
