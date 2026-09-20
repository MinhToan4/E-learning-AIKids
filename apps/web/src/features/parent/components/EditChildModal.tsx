import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { BookOpen, Palette, Pencil, UserPlus, Video, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import {
  STUDENT_AVATARS,
  avatarEmoji as avatarEmojiFromCatalog,
} from '@/shared/config/avatars'
import type { Child } from '@/features/parent/types/parent.types'

export const AVATARS = STUDENT_AVATARS.map((a) => ({
  id: a.id,
  emoji: a.emoji,
  label: a.label,
  image: a.image,
}))

export function avatarEmoji(id: string | null) {
  return avatarEmojiFromCatalog(id)
}

// ── Fallback age bands — dùng khi chưa có con nào hoặc API chưa trả về kịp
export const FALLBACK_AGE_BANDS = [
  { value: '8-11', label: '8–11 tuổi' },
  { value: '9-12', label: '9–12 tuổi' },
  { value: '13-15', label: '13–15 tuổi' },
]

// ── Edit Child Modal — Full-screen — tên, avatar, mục tiêu, PIN ────
// Ba / Mẹ bấm ✏️ → modal này mở toàn màn hình, bao gồm cả đổi PIN
export function EditChildModal({
  child,
  isOpen,
  referenceChildId, // id của con đầu tiên để fetch danh sách nhóm tuổi từ courses thực tế
  onClose,
  onSuccess,
  onError,
}: {
  child: Child | null // null = tạo mới
  isOpen: boolean
  referenceChildId?: string
  onClose: () => void
  onSuccess: () => void
  onError: (msg: string) => void
}) {
  const [nickname, setNickname] = useState('')
  const [ageBand, setAgeBand] = useState('8-11')
  const [avatarId, setAvatarId] = useState('avatar-robot')
  const [goal, setGoal] = useState('comic')
  const [pin, setPin] = useState('')
  const [saving, setSaving] = useState(false)
  // Danh sách nhóm tuổi lấy động từ API courses; fallback về hằng số nếu không có data
  const [ageBandOptions, setAgeBandOptions] = useState(FALLBACK_AGE_BANDS)

  // Khi mở modal, điền sẵn giá trị hiện tại (nếu đang sửa)
  useEffect(() => {
    if (isOpen) {
      setNickname(child?.nickname ?? '')
      setAgeBand(child?.ageBand ?? '8-11')
      setAvatarId(child?.avatarId ?? 'avatar-robot')
      setGoal('comic')
      setPin('')
    }
  }, [isOpen, child])

  // WHY: Load nhóm tuổi động từ danh sách courses thực tế thay vì hardcode.
  // Dùng referenceChildId (thường là con đầu tiên) để gọi endpoint có sẵn.
  // Nếu không có child nào hoặc API lỗi → giữ nguyên FALLBACK_AGE_BANDS, không crash.
  useEffect(() => {
    if (!isOpen || !referenceChildId) return
    const controller = new AbortController()
    void (async () => {
      try {
        const data = await api<{
          courses: Array<{ ageLabel: string; ageTrack: string }>
        }>(`/api/parent/children/${referenceChildId}/courses`, { signal: controller.signal })
        const seen = new Map<string, string>()
        for (const course of data.courses) {
          // Dùng cùng logic courseAgeGroupId: ưu tiên ageTrack, fallback ageLabel
          const id = (course.ageTrack?.trim() || course.ageLabel?.trim()) || ''
          const label = course.ageLabel?.trim() || id
          if (id && label && !seen.has(id)) seen.set(id, label)
        }
        if (seen.size > 0) {
          // Sắp xếp theo số tuổi nhỏ nhất trong label (giống buildCourseAgeGroups)
          const sorted = [...seen.entries()]
            .map(([value, label]) => ({ value, label }))
            .sort((a, b) => {
              const na = Number(a.label.match(/\d+/)?.[0] ?? 999)
              const nb = Number(b.label.match(/\d+/)?.[0] ?? 999)
              return na - nb || a.label.localeCompare(b.label, 'vi')
            })
          setAgeBandOptions(sorted)
        }
      } catch {
        // Fetch thất bại hoặc bị abort → giữ nguyên fallback, không hiện lỗi
      }
    })()
    return () => controller.abort()
  }, [isOpen, referenceChildId])

  // Khóa scroll nền khi modal mở
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Đóng khi nhấn Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!nickname.trim()) {
      onError('Vui lòng nhập tên hiển thị.')
      return
    }
    if (!child) {
      if (!pin || !/^\d{6}$/.test(pin)) {
        onError('Mã PIN cần đúng 6 chữ số để con đăng nhập vào học.')
        return
      }
    } else {
      if (pin && !/^\d{6}$/.test(pin)) {
        onError('Mã PIN cần đủ 6 chữ số, hoặc để trống.')
        return
      }
    }
    setSaving(true)
    try {
      if (child) {
        // Cập nhật hồ sơ con; PIN có contract riêng để không bị bỏ qua ở
        // gateway adapter và để backend áp dụng rate-limit/step-up policy.
        await api(`/api/parent/children/${child.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            nickname: nickname.trim(),
            avatarId,
            ageBand,
          }),
        })
        if (pin) {
          await api(`/api/parent/children/${child.id}/pin`, {
            method: 'POST',
            body: JSON.stringify({ pin }),
          })
        }
      } else {
        await api<{ child: { id: string } }>('/api/parent/children', {
          method: 'POST',
          body: JSON.stringify({
            nickname: nickname.trim(),
            avatarId,
            ageBand,
            goal,
            // Gửi PIN kèm lúc tạo nếu Ba / Mẹ đặt ngay
            ...(pin ? { pin } : {}),
          }),
        })
      }
      onSuccess()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Lỗi')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return createPortal(
    // Backdrop toàn màn hình — render ra document.body để thoát AppShell stacking context
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex w-full max-w-lg flex-col rounded-3xl bg-white shadow-2xl" style={{ maxHeight: '90dvh' }}>
        {/* Header — cố định */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="flex items-center gap-2 font-display text-xl">
            {child ? (
              <>
                <Pencil size={20} aria-hidden="true" />
                Chỉnh sửa — {child.nickname}
              </>
            ) : (
              <>
                <UserPlus size={20} aria-hidden="true" />
                Thêm con mới
              </>
            )}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted transition hover:bg-brand-50"
            aria-label="Đóng"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Body — cuộn được khi nội dung dài */}
        <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-5 overflow-y-auto px-6 py-5">
          {/* Tên hiển thị */}
          <div>
            <label className="mb-1 block text-sm font-bold" htmlFor="edit-nickname">
              Tên hiển thị
            </label>
            <input
              id="edit-nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="VD: MựcCon, Bé An…"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold" htmlFor="edit-age-band">
              Nhóm tuổi học tập
            </label>
            <select
              id="edit-age-band"
              value={ageBandOptions.some((o) => o.value === ageBand) ? ageBand : ageBandOptions[0]?.value ?? ageBand}
              onChange={(e) => setAgeBand(e.target.value)}
              className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-sm"
            >
              {ageBandOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted">Hệ thống gợi ý nội dung phù hợp theo nhóm tuổi này.</p>
          </div>

          {/* Avatar */}
          <div>
            <label className="mb-2 block text-sm font-bold">Avatar</label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAvatarId(a.id)}
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition',
                    avatarId === a.id
                      ? 'bg-brand-100 ring-2 ring-brand-500 scale-110'
                      : 'bg-brand-50 hover:bg-brand-100',
                  )}
                >
                  {a.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Mục tiêu (chỉ khi tạo mới) */}
          {!child && (
            <div>
              <label className="mb-2 block text-sm font-bold">Mục tiêu sáng tạo</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'comic', label: 'Truyện tranh', color: 'bg-sky-50', icon: BookOpen },
                  { value: 'video', label: 'Video', color: 'bg-mint-50', icon: Video },
                  { value: 'character', label: 'Nhân vật', color: 'bg-sun-50', icon: Palette },
                ].map((g) => {
                  const GoalIcon = g.icon
                  return (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setGoal(g.value)}
                      className={cn(
                        'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition',
                        goal === g.value ? 'bg-brand-100 ring-2 ring-brand-500' : `${g.color} hover:ring-1 hover:ring-brand-300`,
                      )}
                    >
                      <GoalIcon size={17} aria-hidden="true" />
                      {g.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Đổi mã PIN — field nhập bình thường */}
          <div className="rounded-2xl border border-border bg-brand-50/40 p-4">
            <label className="mb-1 block text-sm font-bold" htmlFor="edit-pin">
              {child?.hasPin ? 'Đổi mã PIN (tùy chọn)' : 'Mã PIN đăng nhập (6 số) *'}
            </label>
            <input
              id="edit-pin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full max-w-[14rem] rounded-xl border border-brand-200 px-3 py-2.5 font-mono tracking-[0.4em] text-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="••••••"
            />
            <p className="mt-1.5 text-xs text-muted">
              {child?.hasPin
                ? 'Nhập PIN mới để đổi. Để trống nếu không muốn thay đổi.'
                : '6 chữ số. Con dùng để đăng nhập vào học và giữ riêng tư giữa các bé.'}
            </p>
          </div>

          {/* Actions — cố định cuối form */}
          <div className="flex flex-shrink-0 gap-3 pb-1">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Đang lưu…' : child ? 'Lưu thay đổi' : 'Tạo tài khoản'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
