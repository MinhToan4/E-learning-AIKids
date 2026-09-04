import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Shield,
  AlertCircle,
  Sparkles,
  Infinity as InfinityIcon,
} from 'lucide-react'
import { api } from '@/shared/lib/api'
import { useToast } from '@/shared/hooks/useToast'
import { ToastContainer } from '@/shared/components/ui/Toast'
import { cn } from '@/shared/lib/cn'
import type { PlanDef } from '../pages/AdminPage'

export type PlanEditorModalProps = {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  plan: PlanDef | null
  subscriberCount: number
}

function formatVnd(minor: number): string {
  if (minor <= 0) return 'Miễn phí'
  return `${minor.toLocaleString('vi-VN')}₫/tháng`
}

export function PlanEditorModal({
  isOpen,
  onClose,
  onSaved,
  plan,
  subscriberCount,
}: PlanEditorModalProps) {
  const { toasts, showToast, dismissToast } = useToast()

  // Form states
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [amountMinor, setAmountMinor] = useState<number>(0)
  const [monthlyCreateCredits, setMonthlyCreateCredits] = useState<number>(10)
  const [maxChildren, setMaxChildren] = useState<number>(1)
  const [maxOpenCoursesPerChild, setMaxOpenCoursesPerChild] = useState<number>(1)
  const [badge, setBadge] = useState('')
  const [tagline, setTagline] = useState('')
  const [features, setFeatures] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)
  const [applyToExistingSubscribers, setApplyToExistingSubscribers] = useState(false)
  const [grantBonusDelta, setGrantBonusDelta] = useState(false)

  // Feature editing state
  const [newFeatureText, setNewFeatureText] = useState('')
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editingText, setEditingText] = useState('')

  // UI state
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const isEditing = !!plan
  const initialCredits = plan ? (plan.monthlyCreateCredits ?? 0) : 0
  const creditDelta = Math.max(0, Number(monthlyCreateCredits) - initialCredits)

  // Reset/sync form values when modal opens or plan changes
  useEffect(() => {
    if (!isOpen) return
    if (plan) {
      setId(plan.id)
      setName(plan.name)
      setAmountMinor(plan.amountMinor ?? 0)
      setMonthlyCreateCredits(plan.monthlyCreateCredits ?? 10)
      setMaxChildren(plan.maxChildren ?? 1)
      setMaxOpenCoursesPerChild(plan.maxOpenCoursesPerChild ?? 1)
      setBadge(plan.badge ?? '')
      setTagline(plan.tagline ?? '')
      setFeatures(Array.isArray(plan.features) ? [...plan.features] : [])
      setIsActive(plan.isActive !== false)
    } else {
      setId('')
      setName('')
      setAmountMinor(0)
      setMonthlyCreateCredits(10)
      setMaxChildren(1)
      setMaxOpenCoursesPerChild(1)
      setBadge('')
      setTagline('')
      setFeatures([
        'Truy cập đầy đủ kho học liệu hoạt hình AI',
        'Tạo nhiệm vụ học tập tương tác cá nhân hóa',
        'Báo cáo tiến độ học tập chi tiết hàng tuần',
      ])
      setIsActive(true)
    }
    setApplyToExistingSubscribers(false)
    setGrantBonusDelta(false)
    setNewFeatureText('')
    setEditingIdx(null)
    setEditingText('')
    setErrorMsg(null)
  }, [isOpen, plan])

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, submitting])

  if (!isOpen) return null

  // Feature handlers
  function handleAddFeature() {
    const text = newFeatureText.trim()
    if (!text) return
    setFeatures((prev) => [...prev, text])
    setNewFeatureText('')
  }

  function handleRemoveFeature(index: number) {
    setFeatures((prev) => prev.filter((_, i) => i !== index))
    if (editingIdx === index) {
      setEditingIdx(null)
      setEditingText('')
    }
  }

  function handleStartEditFeature(index: number) {
    setEditingIdx(index)
    setEditingText(features[index] ?? '')
  }

  function handleSaveEditFeature(index: number) {
    const text = editingText.trim()
    if (!text) {
      handleRemoveFeature(index)
    } else {
      setFeatures((prev) => prev.map((f, i) => (i === index ? text : f)))
    }
    setEditingIdx(null)
    setEditingText('')
  }

  // Submit handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)

    const cleanId = id.trim().toLowerCase()
    const cleanName = name.trim()

    if (!cleanId) {
      const err = 'Mã gói (id) không được để trống'
      setErrorMsg(err)
      showToast(err, 'error')
      return
    }

    if (!cleanName) {
      const err = 'Tên gói bán không được để trống'
      setErrorMsg(err)
      showToast(err, 'error')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        id: cleanId,
        name: cleanName,
        currency: 'vnd',
        amountMinor: Number(amountMinor) || 0,
        monthlyCreateCredits: Number(monthlyCreateCredits) || 0,
        maxChildren: Number(maxChildren) || 1,
        maxOpenCoursesPerChild: Number(maxOpenCoursesPerChild) || 1,
        badge: badge.trim() || null,
        tagline: tagline.trim() || null,
        features: features.map((f) => f.trim()).filter(Boolean),
        isActive,
        applyToExistingSubscribers: isEditing ? applyToExistingSubscribers : false,
        grantBonusDelta: isEditing && applyToExistingSubscribers && creditDelta > 0 ? grantBonusDelta : false,
      }

      const res = await api<{ message?: string }>('/api/admin/billing/plans', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      if (isEditing && applyToExistingSubscribers && subscriberCount > 0) {
        showToast(
          `Đã cập nhật gói ${cleanName} và nâng cấp cho ${subscriberCount} phụ huynh!`,
          'success',
        )
      } else {
        showToast(res?.message || `Đã lưu gói bán ${cleanName} thành công!`, 'success')
      }

      onSaved()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu gói bán. Vui lòng thử lại!'
      setErrorMsg(msg)
      showToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-text/40 p-3 sm:p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-editor-title"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border-2 border-border/80 bg-surface shadow-clay animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-border/70 px-6 py-5 bg-gradient-to-r from-brand-50/50 via-surface to-amber-50/40">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl border-2 border-brand-200 bg-brand-100 text-2xl shadow-clay">
              📦
            </span>
            <div>
              <h2 id="plan-editor-title" className="font-display text-xl font-black text-text sm:text-2xl">
                {isEditing ? `Chỉnh sửa gói bán: ${plan.name}` : 'Tạo gói bán mới'}
              </h2>
              <p className="text-xs font-bold text-muted">
                {isEditing
                  ? `Mã: ${plan.id} • Phiên bản: v${plan.version ?? 1}`
                  : 'Cấu hình định mức quyền lợi và chính sách giá cho gói học AI'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-2xl border-2 border-border/80 p-2 text-muted transition hover:bg-page hover:text-text active:scale-95 disabled:opacity-50 cursor-pointer"
            aria-label="Đóng cửa sổ"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto p-6 gap-5">
          {errorMsg && (
            <div className="flex items-center gap-2.5 rounded-2xl border-2 border-coral-200 bg-coral-50 p-3.5 text-xs font-bold text-danger">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Row 1: ID & Name */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">
                Mã gói (ID) <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                disabled={isEditing || submitting}
                placeholder="vd: standard, pro_family"
                className={cn(
                  'w-full rounded-2xl border-2 border-border/80 bg-page px-3.5 py-2.5 text-sm font-bold text-text outline-none transition focus:border-brand-500 focus:bg-surface',
                  isEditing && 'opacity-60 cursor-not-allowed bg-page/70',
                )}
                required
              />
              <p className="mt-1 text-[11px] text-muted">
                {isEditing ? 'Mã định danh gói không thể thay đổi sau khi tạo.' : 'Dùng chữ thường, không dấu, không khoảng trắng.'}
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">
                Tên hiển thị <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                placeholder="vd: Gói Gia Đình Tiêu Chuẩn"
                className="w-full rounded-2xl border-2 border-border/80 bg-page px-3.5 py-2.5 text-sm font-bold text-text outline-none transition focus:border-brand-500 focus:bg-surface"
                required
              />
              <p className="mt-1 text-[11px] text-muted">Tên gói xuất hiện trên bảng giá và trang phụ huynh.</p>
            </div>
          </div>

          {/* Row 2: Badge & Tagline */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">
                Nhãn nổi bật (Badge)
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                disabled={submitting}
                placeholder="vd: HOT, Phổ biến, Tiết kiệm 30%"
                className="w-full rounded-2xl border-2 border-border/80 bg-page px-3.5 py-2.5 text-sm font-bold text-text outline-none transition focus:border-brand-500 focus:bg-surface"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">
                Khẩu hiệu / Mô tả ngắn (Tagline)
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                disabled={submitting}
                placeholder="vd: Dành cho gia đình từ 2 bé trở lên"
                className="w-full rounded-2xl border-2 border-border/80 bg-page px-3.5 py-2.5 text-sm font-bold text-text outline-none transition focus:border-brand-500 focus:bg-surface"
              />
            </div>
          </div>

          {/* Row 3: Price */}
          <div className="rounded-2xl border-2 border-border/80 bg-gradient-to-br from-page to-surface p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-muted">
                Giá bán hàng tháng (VND)
              </label>
              <span className="text-base font-black text-brand-600">
                {formatVnd(amountMinor)}
              </span>
            </div>
            <input
              type="number"
              min={0}
              step={1000}
              value={amountMinor}
              onChange={(e) => setAmountMinor(Math.max(0, parseInt(e.target.value, 10) || 0))}
              disabled={submitting}
              className="w-full rounded-2xl border-2 border-border/80 bg-surface px-3.5 py-2.5 text-sm font-bold text-text outline-none transition focus:border-brand-500"
            />
            {/* Quick Price Buttons */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {[0, 49000, 99000, 199000, 299000, 499000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmountMinor(val)}
                  className={cn(
                    'rounded-xl border border-border/80 px-2.5 py-1 text-xs font-bold transition hover:bg-brand-50 hover:text-brand-700 cursor-pointer',
                    amountMinor === val ? 'bg-brand-500 font-black text-white border-brand-500' : 'bg-surface text-muted',
                  )}
                >
                  {val === 0 ? '0₫ (Free)' : `${(val / 1000).toLocaleString('vi-VN')}k`}
                </button>
              ))}
            </div>
          </div>

          {/* Row 4: Quota Group */}
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-muted">
              Định mức quyền lợi gói
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              {/* Credits */}
              <div className="rounded-2xl border-2 border-border/80 bg-page p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-black text-text">
                    <Sparkles className="size-3.5 text-brand-500" />
                    <span>Lượt tạo AI / tháng</span>
                  </div>
                  <p className="text-[11px] text-muted mt-0.5">Số lượt AI cấp mới mỗi chu kỳ</p>
                </div>
                <input
                  type="number"
                  min={0}
                  value={monthlyCreateCredits}
                  onChange={(e) => setMonthlyCreateCredits(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  disabled={submitting}
                  className="mt-3 w-full rounded-xl border border-border/80 bg-surface px-3 py-1.5 text-sm font-black text-brand-600 outline-none focus:border-brand-500"
                />
              </div>

              {/* Max Children */}
              <div className="rounded-2xl border-2 border-border/80 bg-page p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-black text-text">
                    <span>👶</span>
                    <span>Số hồ sơ trẻ tối đa</span>
                  </div>
                  <p className="text-[11px] text-muted mt-0.5">Hồ sơ con trong tài khoản</p>
                </div>
                <input
                  type="number"
                  min={1}
                  value={maxChildren}
                  onChange={(e) => setMaxChildren(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  disabled={submitting}
                  className="mt-3 w-full rounded-xl border border-border/80 bg-surface px-3 py-1.5 text-sm font-black text-brand-600 outline-none focus:border-brand-500"
                />
              </div>

              {/* Max Courses per Child */}
              <div className="rounded-2xl border-2 border-border/80 bg-page p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-text">📚 Khóa học mở/trẻ</span>
                    <button
                      type="button"
                      onClick={() => setMaxOpenCoursesPerChild(maxOpenCoursesPerChild >= 999 ? 1 : 999)}
                      className={cn(
                        'flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-black transition cursor-pointer',
                        maxOpenCoursesPerChild >= 999
                          ? 'bg-brand-500 text-white shadow-sm'
                          : 'bg-border/60 text-muted hover:bg-border',
                      )}
                    >
                      <InfinityIcon className="size-3" />
                      <span>{maxOpenCoursesPerChild >= 999 ? 'Đang bật ∞' : 'Không giới hạn'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-muted mt-0.5">
                    {maxOpenCoursesPerChild >= 999 ? 'Không giới hạn khóa học' : 'Số khóa song song'}
                  </p>
                </div>
                <input
                  type="number"
                  min={1}
                  value={maxOpenCoursesPerChild}
                  onChange={(e) => setMaxOpenCoursesPerChild(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  disabled={submitting}
                  className="mt-3 w-full rounded-xl border border-border/80 bg-surface px-3 py-1.5 text-sm font-black text-brand-600 outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Row 5: Features List */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-muted">
                Danh sách quyền lợi ({features.length})
              </label>
            </div>

            <div className="space-y-2">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-2xl border border-border/80 bg-page p-2.5 transition hover:border-brand-200"
                >
                  <span className="text-success text-xs font-black shrink-0">✓</span>
                  {editingIdx === idx ? (
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSaveEditFeature(idx)
                        } else if (e.key === 'Escape') {
                          setEditingIdx(null)
                        }
                      }}
                      autoFocus
                      className="flex-1 rounded-lg border border-brand-400 bg-surface px-2.5 py-1 text-xs font-bold text-text outline-none"
                    />
                  ) : (
                    <span className="flex-1 text-xs font-bold text-text">{feat}</span>
                  )}

                  <div className="flex items-center gap-1 shrink-0">
                    {editingIdx === idx ? (
                      <button
                        type="button"
                        onClick={() => handleSaveEditFeature(idx)}
                        className="rounded-lg p-1.5 text-success hover:bg-success/10 transition cursor-pointer"
                        title="Lưu"
                      >
                        <Check className="size-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartEditFeature(idx)}
                        className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-text transition cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="rounded-lg p-1.5 text-muted hover:bg-coral-50 hover:text-danger transition cursor-pointer"
                      title="Xóa quyền lợi"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add new feature bar */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddFeature()
                    }
                  }}
                  placeholder="Nhập quyền lợi mới rồi bấm thêm..."
                  disabled={submitting}
                  className="flex-1 rounded-2xl border-2 border-border/80 bg-page px-3.5 py-2 text-xs font-bold text-text outline-none focus:border-brand-500 focus:bg-surface"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  disabled={!newFeatureText.trim() || submitting}
                  className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-border/80 bg-surface px-4 py-2 text-xs font-black text-text shadow-sm transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 active:scale-95 disabled:opacity-40 cursor-pointer shrink-0"
                >
                  <Plus className="size-3.5" />
                  <span>Thêm quyền lợi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Row 6: Toggle Active */}
          <div className="flex items-center justify-between rounded-2xl border-2 border-border/80 bg-page p-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-text">
                Trạng thái mở bán gói
              </p>
              <p className="text-xs text-muted mt-0.5">
                {isActive
                  ? '🟢 Đang mở bán: Xuất hiện trên bảng giá cho phụ huynh đăng ký.'
                  : '⚪ Tạm ẩn: Khách hàng mới không thấy gói này.'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={isActive}
                disabled={plan?.id === 'free' || submitting}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-sm" />
            </label>
          </div>

          {/* Row 7: KHU VỰC CHÍNH SÁCH BẢO TOÀN & NÂNG CẤP KHÁCH HÀNG (Grandfathering & Upgrade Policy) */}
          {isEditing && (
            <div className="rounded-2xl border-2 border-sky-200 bg-sky-50/70 p-4.5 shadow-sm space-y-3">
              {/* Header Box */}
              <div className="flex items-start gap-2.5">
                <Shield className="size-5 text-sky-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-sky-900">
                    Chính sách bảo toàn quyền lợi (Grandfathering Policy)
                  </h4>
                  <p className="text-xs font-medium text-sky-800 mt-1 leading-relaxed">
                    🛡️ <span className="font-bold">Nguyên tắc bảo toàn:</span> Hợp đồng và giá tiền đã thanh toán của khách hàng cũ sẽ không bao giờ bị cắt giảm hoặc truy thu thêm.
                  </p>
                </div>
              </div>

              {/* Subscriber count pill */}
              <div className="rounded-xl border border-sky-200 bg-white/80 px-3.5 py-2 text-xs font-bold text-sky-900 flex items-center justify-between">
                <span>Số lượng thuê bao hiện tại:</span>
                <span className="rounded-full bg-sky-100 px-2.5 py-0.5 font-black text-sky-700">
                  {subscriberCount} phụ huynh đang hoạt động
                </span>
              </div>

              {/* Checkbox 1: Apply to existing subscribers */}
              <label className="flex items-start gap-3 rounded-xl border border-sky-200 bg-white/90 p-3 text-xs font-bold text-text hover:bg-white transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyToExistingSubscribers}
                  onChange={(e) => setApplyToExistingSubscribers(e.target.checked)}
                  disabled={submitting}
                  className="mt-0.5 size-4 rounded border-border text-brand-600 focus:ring-brand-500"
                />
                <div className="flex-1">
                  <span className="text-text font-black">
                    Nâng cấp quyền lợi gói mới cho các khách hàng đang dùng gói này
                  </span>
                  <p className="text-[11px] text-muted mt-0.5 font-normal">
                    Áp dụng định mức mới (lượt tạo AI, số trẻ, số khóa học) cho toàn bộ {subscriberCount} phụ huynh đang có gói hoạt động.
                  </p>
                </div>
              </label>

              {/* Checkbox 2: Grant bonus delta if monthly credits increased */}
              {applyToExistingSubscribers && creditDelta > 0 && (
                <label className="flex items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50/90 p-3 text-xs font-bold text-emerald-950 hover:bg-emerald-50 transition cursor-pointer animate-in fade-in">
                  <input
                    type="checkbox"
                    checked={grantBonusDelta}
                    onChange={(e) => setGrantBonusDelta(e.target.checked)}
                    disabled={submitting}
                    className="mt-0.5 size-4 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <span className="font-black text-emerald-900 flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-emerald-600" />
                      Tặng thêm ngay +{creditDelta} lượt tạo AI vào số dư hiện tại của khách hàng
                    </span>
                    <p className="text-[11px] text-emerald-800 mt-0.5 font-normal">
                      Cộng trực tiếp phần chênh lệch (+{creditDelta} lượt) vào ví số dư còn lại của từng khách hàng và ghi sổ cái minh bạch.
                    </p>
                  </div>
                </label>
              )}
            </div>
          )}

          {/* Modal Footer Buttons */}
          <div className="mt-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t-2 border-border/60 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="w-full sm:w-auto rounded-2xl border-2 border-border/80 bg-surface px-5 py-2.5 text-xs font-black text-muted transition hover:bg-page hover:text-text active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-95 px-6 py-2.5 text-xs font-black text-white shadow-clay transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Check className="size-4" />
                  <span>{isEditing ? 'Lưu cập nhật gói' : 'Tạo gói bán ngay'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* In-modal Toasts */}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </div>,
    document.body,
  )
}
