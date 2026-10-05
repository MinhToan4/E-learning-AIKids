import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Pencil, UserPlus, X } from 'lucide-react'
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

export const POPULAR_AVATARS = [
  { id: 'avatar-cat', label: 'Mèo AIKI', emoji: '🐱' },
  { id: 'avatar-robot', label: 'Robot', emoji: '🤖' },
  { id: 'avatar-bear', label: 'Gấu', emoji: '🐻' },
  { id: 'avatar-dragon', label: 'Khủng long', emoji: '🐉' },
  { id: 'avatar-fox', label: 'Cáo', emoji: '🦊' },
  { id: 'avatar-owl', label: 'Cú', emoji: '🦉' },
  { id: 'avatar-unicorn', label: 'Kỳ lân', emoji: '🦄' },
  { id: 'avatar-star', label: 'Sao', emoji: '⭐' },
]

export function avatarEmoji(id: string | null) {
  return avatarEmojiFromCatalog(id)
}

// ── 3 Thẻ chọn nhóm tuổi lớn (Pills) dễ nhìn cho Ba / Mẹ
export const AGE_PILLS = [
  {
    value: '6-8',
    title: 'Lớp 1-2',
    subtitle: '(6-8 tuổi)',
  },
  {
    value: '8-11',
    title: 'Lớp 3-5',
    subtitle: '(9-11 tuổi)',
  },
  {
    value: '13-15',
    title: 'Lớp 6-9',
    subtitle: '(12-15 tuổi)',
  },
]

// ── Fallback age bands để tương thích
export const FALLBACK_AGE_BANDS = [
  { value: '6-8', label: 'Lớp 1-2 (6–8 tuổi)' },
  { value: '8-11', label: 'Lớp 3-5 (9–11 tuổi)' },
  { value: '13-15', label: 'Lớp 6-9 (12–15 tuổi)' },
]

// ── Edit Child Modal — Full-screen — Tên, Nhóm tuổi, Avatar ────
export function EditChildModal({
  child,
  isOpen,
  referenceChildId: _referenceChildId,
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
  const [avatarId, setAvatarId] = useState('avatar-cat')
  const [saving, setSaving] = useState(false)

  // Khi mở modal, điền sẵn giá trị hiện tại (nếu đang sửa)
  useEffect(() => {
    if (isOpen) {
      setNickname(child?.nickname ?? '')
      const currentBand = child?.ageBand ?? '8-11'
      // Chuẩn hóa về 3 nhóm tuổi
      if (currentBand === '6-8') setAgeBand('6-8')
      else if (currentBand === '13-15' || currentBand === '12-15') setAgeBand('13-15')
      else setAgeBand('8-11')

      setAvatarId(child?.avatarId ?? 'avatar-cat')
    }
  }, [isOpen, child])

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
      onError('Vui lòng nhập tên hiển thị cho con.')
      return
    }
    setSaving(true)
    try {
      if (child) {
        await api(`/api/parent/children/${child.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            nickname: nickname.trim(),
            avatarId,
            ageBand,
          }),
        })
      } else {
        await api<{ child: { id: string } }>('/api/parent/children', {
          method: 'POST',
          body: JSON.stringify({
            nickname: nickname.trim(),
            avatarId,
            ageBand,
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

          {/* 1. Nhóm tuổi — 3 Thẻ chọn lớn (Pills) dễ nhìn */}
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-800">
              Nhóm tuổi học tập
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {AGE_PILLS.map((pill) => {
                const isSelected = ageBand === pill.value
                return (
                  <button
                    key={pill.value}
                    type="button"
                    onClick={() => setAgeBand(pill.value)}
                    className={cn(
                      'flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all cursor-pointer min-h-[58px] text-center select-none',
                      isSelected
                        ? 'border-brand-500 bg-amber-50/90 text-brand-950 ring-2 ring-brand-300 font-black shadow-clay scale-[1.02]'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-amber-50/40 hover:border-amber-200 text-slate-700 font-bold',
                    )}
                  >
                    <span className="text-sm font-black tracking-tight">{pill.title}</span>
                    <span className={cn('text-xs mt-0.5', isSelected ? 'text-amber-800 font-bold' : 'text-slate-500 font-medium')}>
                      {pill.subtitle}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="mt-1.5 text-xs text-muted">
              Hệ thống sẽ gợi ý các bài học và thử thách Olympic vừa vặn theo lứa tuổi của con.
            </p>
          </div>

          {/* 2. Avatar nhân vật ngộ nghĩnh — Kích thước to rõ h-14 w-14 chạm là chọn */}
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-800">
              Chọn nhân vật đại diện cho con
            </label>
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
              {POPULAR_AVATARS.map((a) => {
                const isSelected = avatarId === a.id
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAvatarId(a.id)}
                    className={cn(
                      'flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all cursor-pointer min-h-[72px] sm:min-h-[80px] select-none',
                      isSelected
                        ? 'border-brand-500 bg-amber-50/90 ring-2 ring-brand-300 shadow-clay scale-105'
                        : 'border-slate-200 bg-slate-50/80 hover:bg-amber-50/40 hover:border-amber-200',
                    )}
                  >
                    <span className="text-2xl sm:text-3xl leading-none">{a.emoji}</span>
                    <span className="mt-1 text-[11px] font-extrabold text-slate-700 truncate max-w-full">
                      {a.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Actions — cố định cuối form */}
          <div className="flex flex-col-reverse sm:flex-row flex-shrink-0 gap-2.5 sm:gap-3 pt-2 pb-1 w-full">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="w-full sm:w-auto h-12 px-5 whitespace-nowrap inline-flex items-center justify-center rounded-2xl font-bold cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="w-full sm:flex-1 h-12 px-6 whitespace-nowrap inline-flex items-center justify-center rounded-2xl font-black shadow-clay bg-gradient-to-r from-brand-500 via-purple-600 to-brand-600 hover:opacity-95 text-white text-sm sm:text-base cursor-pointer"
            >
              {saving ? 'Đang lưu…' : child ? 'Lưu hồ sơ' : 'Tạo hồ sơ và Cho con học ngay'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
