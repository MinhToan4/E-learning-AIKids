import React, { useState, useEffect } from 'react'
import {
  Compass,
  X,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Star,
  RotateCcw,
  Check,
  Film,
  HelpCircle,
  MessageCircleQuestion,
  Palette,
  Trophy,
  Target,
  BookOpen,
  Lightbulb,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { JourneyStageDefinition } from '@/features/teacher/lib/authoring'
import { STANDARD_ISLAND_6_STAGES } from '@/features/teacher/lib/authoring'

export interface CustomStagesManagerModalProps {
  isOpen: boolean
  onClose: () => void
  currentStages: JourneyStageDefinition[]
  starAllocation: number[]
  onApply: (newStages: JourneyStageDefinition[], newStarAllocation: number[]) => void
  readOnly?: boolean
  showToast?: (message: string, tone?: 'success' | 'error' | 'info') => void
}

const STAGE_TYPE_OPTIONS = [
  { value: 'GOAL', label: '🎯 Mục tiêu bài học (Goal Card)', icon: Target, defaultTitle: 'Mục tiêu', defaultIcon: 'Target' },
  { value: 'CONFIRM', label: '❓ Khởi động & Xác nhận (A/B Quiz)', icon: HelpCircle, defaultTitle: 'Xác nhận', defaultIcon: 'HelpCircle' },
  { value: 'VIDEO', label: '🎬 Video bài giảng (Cinema Video)', icon: Film, defaultTitle: 'Video bài giảng', defaultIcon: 'Film' },
  { value: 'QUIZ', label: '🧩 Câu hỏi trắc nghiệm (Quiz Challenge)', icon: MessageCircleQuestion, defaultTitle: 'Trắc nghiệm', defaultIcon: 'MessageCircleQuestion' },
  { value: 'PRACTICE', label: '🎨 Thực hành vẽ AI Studio (Practice)', icon: Palette, defaultTitle: 'Thực hành', defaultIcon: 'Palette' },
  { value: 'REWARD', label: '🏆 Về đích & Trao sao (Reward Completion)', icon: Trophy, defaultTitle: 'Kết thúc', defaultIcon: 'Trophy' },
]

const ICON_OPTIONS = [
  { value: 'Target', label: '🎯 Mục tiêu', icon: Target },
  { value: 'HelpCircle', label: '❓ Hỏi đáp', icon: HelpCircle },
  { value: 'Film', label: '🎬 Video', icon: Film },
  { value: 'MessageCircleQuestion', label: '🧩 Trắc nghiệm', icon: MessageCircleQuestion },
  { value: 'Palette', label: '🎨 Thực hành', icon: Palette },
  { value: 'Trophy', label: '🏆 Cúp vàng', icon: Trophy },
  { value: 'Compass', label: '🧭 La bàn', icon: Compass },
  { value: 'BookOpen', label: '📖 Sách mở', icon: BookOpen },
  { value: 'Lightbulb', label: '💡 Ý tưởng', icon: Lightbulb },
]

export function CustomStagesManagerModal({
  isOpen,
  onClose,
  currentStages,
  starAllocation,
  onApply,
  readOnly = false,
  showToast,
}: CustomStagesManagerModalProps) {
  const [stages, setStages] = useState<JourneyStageDefinition[]>([])
  const [stars, setStars] = useState<number[]>([])

  useEffect(() => {
    if (isOpen) {
      const initialStages =
        Array.isArray(currentStages) && currentStages.length >= 3
          ? currentStages.map((s, idx) => ({
              ...s,
              index: idx,
              type: (s as any).type || (idx === 0 ? 'GOAL' : idx === 1 ? 'CONFIRM' : idx === 2 ? 'VIDEO' : idx === 3 ? 'QUIZ' : idx === 4 ? 'PRACTICE' : 'REWARD'),
            }))
          : STANDARD_ISLAND_6_STAGES.map((s, idx) => ({
              ...s,
              index: idx,
              type: idx === 0 ? 'GOAL' : idx === 1 ? 'CONFIRM' : idx === 2 ? 'VIDEO' : idx === 3 ? 'QUIZ' : idx === 4 ? 'PRACTICE' : 'REWARD',
            }))
      setStages(initialStages)
      setStars(Array.isArray(starAllocation) && starAllocation.length > 0 ? [...starAllocation] : [2, 3, 4])
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleMove = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction
    if (targetIdx < 0 || targetIdx >= stages.length) return
    const nextStages = [...stages]
    const temp = nextStages[index]
    nextStages[index] = nextStages[targetIdx]
    nextStages[targetIdx] = temp

    // Re-index
    const reindexed = nextStages.map((st, idx) => ({
      ...st,
      index: idx,
      title: st.title.replace(/^\d+\.\s*/, `${idx + 1}. `),
    }))
    setStages(reindexed)

    // Re-map stars
    const nextStars = stars.map((sIdx) => {
      if (sIdx === index) return targetIdx
      if (sIdx === targetIdx) return index
      return sIdx
    }).sort((a, b) => a - b)
    setStars(nextStars)
  }

  const handleUpdate = (index: number, patch: Partial<JourneyStageDefinition> & { type?: string }) => {
    setStages((prev) =>
      prev.map((s, idx) => {
        if (idx !== index) return s
        const updated = { ...s, ...patch }
        return updated
      })
    )
  }

  const handleRemove = (index: number) => {
    if (stages.length <= 3) {
      showToast?.('Hải trình bài học cần tối thiểu 3 chặng để đảm bảo chất lượng học tập!', 'error')
      return
    }
    const nextStages = stages
      .filter((_, idx) => idx !== index)
      .map((st, idx) => ({
        ...st,
        index: idx,
        title: st.title.replace(/^\d+\.\s*/, `${idx + 1}. `),
      }))
    setStages(nextStages)

    // Update stars: remove deleted index and shift subsequent indices down
    const nextStars = stars
      .filter((sIdx) => sIdx !== index)
      .map((sIdx) => (sIdx > index ? sIdx - 1 : sIdx))
      .sort((a, b) => a - b)
    setStars(nextStars)
  }

  const handleAdd = () => {
    if (stages.length >= 7) {
      showToast?.('Hải trình bài học tối đa 7 chặng để tránh quá tải cho học sinh!', 'error')
      return
    }
    const newIdx = stages.length
    const newStage: JourneyStageDefinition & { type?: string } = {
      id: `custom-stage-${Date.now()}-${newIdx}`,
      index: newIdx,
      title: `${newIdx + 1}. Khám phá mới`,
      shortTitle: 'Khám phá',
      iconName: 'Compass',
      desc: 'Nội dung chặng học bổ sung',
      type: 'GOAL',
    }
    setStages([...stages, newStage])
    showToast?.(`Đã thêm Chặng ${newIdx + 1}`, 'info')
  }

  const handleToggleStar = (index: number) => {
    if (stars.includes(index)) {
      setStars(stars.filter((idx) => idx !== index))
    } else {
      if (stars.length >= 3) {
        showToast?.(
          `Bài học tối đa 3 Sao. Đang chọn ở Chặng ${stars.map((s) => s + 1).join(', ')}. Hãy bỏ bớt 1 chặng trước nhé!`,
          'error'
        )
        return
      }
      setStars([...stars, index].sort((a, b) => a - b))
    }
  }

  const handleResetToStandard = () => {
    const std = STANDARD_ISLAND_6_STAGES.map((s, idx) => ({
      ...s,
      index: idx,
      type: idx === 0 ? 'GOAL' : idx === 1 ? 'CONFIRM' : idx === 2 ? 'VIDEO' : idx === 3 ? 'QUIZ' : idx === 4 ? 'PRACTICE' : 'REWARD',
    }))
    setStages(std)
    setStars([2, 3, 4])
    showToast?.('Đã khôi phục chuẩn sư phạm 6 chặng AIKids!', 'info')
  }

  const handleApply = () => {
    if (stages.length < 3) {
      showToast?.('Hải trình cần tối thiểu 3 chặng!', 'error')
      return
    }
    onApply(stages, stars)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl border-2 border-brand-200 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-brand-50 via-white to-brand-50/50 border-b border-brand-100 shrink-0">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-brand-600 text-white shadow-xs">
              <Compass size={22} />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Quản lý &amp; Tùy biến các bước học (Hải trình 3 – 7 chặng)
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                Tùy chỉnh số lượng, thứ tự, tiêu đề, loại chặng và phân bổ sao theo nhu cầu sư phạm
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-slate-50/90 border-b border-slate-200 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Tổng số chặng:</span>
            <span className="rounded-full bg-brand-100 border border-brand-300 px-2.5 py-0.5 font-black text-brand-900">
              {stages.length} chặng (Cho phép: 3 – 7)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Phân bổ sao:</span>
            <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 font-black text-amber-950">
              ⭐ {stars.length}/3 Sao (Chặng {stars.length > 0 ? stars.map((s) => s + 1).join(', ') : 'Chưa chọn'})
            </span>
          </div>
        </div>

        {/* Stage List Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 custom-scrollbar bg-slate-50/40">
          {stages.map((stage, idx) => {
            const isFirst = idx === 0
            const isLast = idx === stages.length - 1
            const isStarAwarded = stars.includes(idx)
            const currentType = (stage as any).type || (idx === 0 ? 'GOAL' : idx === 1 ? 'CONFIRM' : idx === 2 ? 'VIDEO' : idx === 3 ? 'QUIZ' : idx === 4 ? 'PRACTICE' : 'REWARD')

            return (
              <div
                key={stage.id || `stage-${idx}`}
                className={cn(
                  'flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3.5 rounded-2xl border-2 transition-all shadow-clay-xs',
                  isStarAwarded
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-slate-200 bg-white hover:border-brand-200'
                )}
              >
                {/* Reorder Arrows & Number Badge */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={isFirst || readOnly}
                      onClick={() => handleMove(idx, -1)}
                      className={cn(
                        'p-1 rounded-md border text-slate-600 transition',
                        isFirst || readOnly
                          ? 'opacity-30 cursor-not-allowed border-transparent'
                          : 'hover:bg-brand-50 hover:text-brand-700 border-slate-200 cursor-pointer'
                      )}
                      title="Di chuyển lên trên"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={isLast || readOnly}
                      onClick={() => handleMove(idx, 1)}
                      className={cn(
                        'p-1 rounded-md border text-slate-600 transition',
                        isLast || readOnly
                          ? 'opacity-30 cursor-not-allowed border-transparent'
                          : 'hover:bg-brand-50 hover:text-brand-700 border-slate-200 cursor-pointer'
                      )}
                      title="Di chuyển xuống dưới"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  <span className="grid size-7 place-items-center rounded-xl bg-brand-600 text-white font-black text-xs shrink-0 shadow-2xs">
                    {idx + 1}
                  </span>
                </div>

                {/* Form Fields: Tên chặng, Tên ngắn, Loại chặng, Biểu tượng */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 flex-1 min-w-0">
                  {/* Tên chặng đầy đủ */}
                  <div className="sm:col-span-5 min-w-0">
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-0.5">
                      Tiêu đề chặng
                    </label>
                    <input
                      type="text"
                      disabled={readOnly}
                      value={stage.title}
                      onChange={(e) => handleUpdate(idx, { title: e.target.value })}
                      placeholder="VD: 1. Mục tiêu bài học"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 shadow-2xs outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200 transition"
                    />
                  </div>

                  {/* Tên ngắn tab */}
                  <div className="sm:col-span-2 min-w-0">
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-0.5">
                      Tab ngắn
                    </label>
                    <input
                      type="text"
                      disabled={readOnly}
                      value={stage.shortTitle || ''}
                      onChange={(e) => handleUpdate(idx, { shortTitle: e.target.value })}
                      placeholder="VD: Mục tiêu"
                      className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 shadow-2xs outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200 transition"
                    />
                  </div>

                  {/* Loại chặng */}
                  <div className="sm:col-span-3 min-w-0">
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-0.5">
                      Loại khối
                    </label>
                    <select
                      disabled={readOnly}
                      value={currentType}
                      onChange={(e) => {
                        const opt = STAGE_TYPE_OPTIONS.find((o) => o.value === e.target.value)
                        handleUpdate(idx, {
                          type: e.target.value,
                          iconName: opt?.defaultIcon || stage.iconName,
                        })
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-900 shadow-2xs outline-none focus:border-brand-500 transition"
                    >
                      {STAGE_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Biểu tượng */}
                  <div className="sm:col-span-2 min-w-0">
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-0.5">
                      Icon
                    </label>
                    <select
                      disabled={readOnly}
                      value={stage.iconName || 'Target'}
                      onChange={(e) => handleUpdate(idx, { iconName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-900 shadow-2xs outline-none focus:border-brand-500 transition"
                    >
                      {ICON_OPTIONS.map((ico) => (
                        <option key={ico.value} value={ico.value}>
                          {ico.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right Actions: Toggle Star & Delete */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    disabled={readOnly}
                    onClick={() => handleToggleStar(idx)}
                    className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shadow-2xs select-none',
                      isStarAwarded
                        ? 'bg-amber-400 text-amber-950 border border-amber-500 shadow-clay-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300'
                    )}
                    title={isStarAwarded ? 'Bấm để hủy tặng sao ở chặng này' : 'Bấm để tặng 1 Sao ở chặng này (tối đa 3 sao)'}
                  >
                    <Star
                      size={13}
                      className={cn(isStarAwarded ? 'fill-amber-950 text-amber-950' : 'text-slate-400')}
                    />
                    <span>{isStarAwarded ? '⭐ 1 Sao' : '+ Sao'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={stages.length <= 3 || readOnly}
                    onClick={() => handleRemove(idx)}
                    className={cn(
                      'p-1.5 rounded-xl border transition',
                      stages.length <= 3 || readOnly
                        ? 'opacity-30 cursor-not-allowed border-transparent text-slate-300'
                        : 'border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 cursor-pointer'
                    )}
                    title={stages.length <= 3 ? 'Hải trình cần tối thiểu 3 chặng' : 'Xóa chặng này'}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-white border-t border-slate-200 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={stages.length >= 7 || readOnly}
              onClick={handleAdd}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition shadow-2xs',
                stages.length >= 7 || readOnly
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200'
                  : 'bg-brand-50 border-2 border-brand-300 text-brand-800 hover:bg-brand-100 active:scale-95 cursor-pointer'
              )}
            >
              <Plus size={15} />
              <span>Thêm chặng mới ({stages.length}/7)</span>
            </button>

            <button
              type="button"
              disabled={readOnly}
              onClick={handleResetToStandard}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Khôi phục 6 chặng chuẩn</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="button"
              disabled={readOnly}
              onClick={handleApply}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black text-white bg-brand-600 hover:bg-brand-700 shadow-clay-xs active:scale-95 transition cursor-pointer"
            >
              <Check size={14} />
              <span>Áp dụng cấu trúc chặng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
