import React, { useState } from 'react'
import { Plus, Trash2, BookOpen, FileText, CheckCircle2, Sparkles, CheckSquare } from 'lucide-react'
import type {
  CreativeNotebookConfig,
  CreativeNotebookField,
  CreativeNotebookChecklistItem,
} from '../../../../shared/lib/api'

interface CreativeNotebookEditorProps {
  notebookConfig?: CreativeNotebookConfig
  onChange: (config: CreativeNotebookConfig) => void
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void
}

const FALLBACK_CONFIG: CreativeNotebookConfig = {
  notebookTitle: 'Sổ Tay Sáng Tạo Ba Lô',
  akiAdvice: 'Hãy viết bằng chính suy nghĩ của cậu! Cốt truyện này là của riêng cậu!',
  sampleHelperTitle: 'Kịch bản câu chuyện mẫu',
  sampleTemplate:
    'Ý tưởng: Một ngày đẹp trời tớ phát hiện ra bí mật trong khu vườn...\nChi tiết: Tớ cùng bạn sóc tìm thấy chiếc chìa khóa vàng...\nKết thúc: Mở ra chiếc rương đầy hạt dẻ nướng thơm lừng!',
  backpackCategory: 'notebook',
  backpackTag: 'Sổ tay sáng tạo',
  challengeSummary: [
    'Xác định ý tưởng trọng tâm',
    'Hoàn thiện các ô chi tiết',
    'Cất vào Ba Lô của bé',
  ],
  fields: [
    {
      id: 'sec-1',
      label: '1. Khởi đầu câu chuyện / Ý tưởng chính',
      placeholder: 'Gõ ý tưởng của bé...',
      rows: 3,
    },
    {
      id: 'sec-2',
      label: '2. Chi tiết và diễn biến chính',
      placeholder: 'Có chuyện gì đặc biệt xảy ra tiếp theo?...',
      rows: 3,
    },
    {
      id: 'sec-3',
      label: '3. Kết thúc & Cảm xúc đáng nhớ',
      placeholder: 'Bài học hoặc cảm xúc cất Ba Lô...',
      rows: 3,
    },
  ],
}

export function CreativeNotebookEditor({
  notebookConfig,
  onChange,
  showToast,
}: CreativeNotebookEditorProps) {
  const currentConfig: CreativeNotebookConfig = notebookConfig || FALLBACK_CONFIG
  const fields = currentConfig.fields || FALLBACK_CONFIG.fields || []
  const challengeSummary = currentConfig.challengeSummary || []
  const checklist = currentConfig.checklist || []

  const updateConfig = (patch: Partial<CreativeNotebookConfig>) => {
    onChange({
      ...currentConfig,
      ...patch,
    })
  }

  // Quản lý fields
  const handleUpdateField = (index: number, patch: Partial<CreativeNotebookField>) => {
    const nextFields = [...fields]
    nextFields[index] = { ...nextFields[index], ...patch }
    updateConfig({ fields: nextFields })
  }

  const handleAddField = () => {
    const newField: CreativeNotebookField = {
      id: `field-${Date.now()}`,
      label: `Ô ${fields.length + 1}: Tiêu đề mới`,
      placeholder: 'Hướng dẫn câu trả lời cho bé...',
      prefix: '',
      badge: '',
      helperTip: '',
      rows: 3,
    }
    updateConfig({ fields: [...fields, newField] })
    showToast('Đã thêm ô nhập liệu mới vào sổ tay!', 'info')
  }

  const handleRemoveField = (index: number) => {
    if (fields.length <= 1) {
      showToast('Sổ tay cần tối thiểu 1 ô nhập liệu!', 'error')
      return
    }
    const nextFields = fields.filter((_, i) => i !== index)
    updateConfig({ fields: nextFields })
    showToast('Đã xóa ô nhập liệu.', 'info')
  }

  // Quản lý challengeSummary
  const handleAddSummary = () => {
    updateConfig({
      challengeSummary: [...challengeSummary, 'Mục tiêu thử thách mới'],
    })
  }

  const handleUpdateSummary = (index: number, val: string) => {
    const next = [...challengeSummary]
    next[index] = val
    updateConfig({ challengeSummary: next })
  }

  const handleRemoveSummary = (index: number) => {
    updateConfig({
      challengeSummary: challengeSummary.filter((_, i) => i !== index),
    })
  }

  // Quản lý checklist
  const handleAddChecklistItem = () => {
    const newItem: CreativeNotebookChecklistItem = {
      id: `cl-${Date.now()}`,
      label: `Tiêu chí kiểm tra mới ${checklist.length + 1}`,
      hint: '',
    }
    updateConfig({ checklist: [...checklist, newItem] })
    showToast('Đã thêm tiêu chí kiểm tra mới!', 'info')
  }

  const handleUpdateChecklistItem = (
    index: number,
    patch: Partial<CreativeNotebookChecklistItem>
  ) => {
    const next = [...checklist]
    next[index] = { ...next[index], ...patch }
    updateConfig({ checklist: next })
  }

  const handleRemoveChecklistItem = (index: number) => {
    updateConfig({
      checklist: checklist.filter((_, i) => i !== index),
    })
  }

  return (
    <div
      data-testid="creative-notebook-editor"
      className="space-y-4 rounded-2xl bg-amber-50/50 p-4 border border-amber-200 text-left"
    >
      <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎒</span>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-amber-950">
              CẤU HÌNH SỔ TAY SÁNG TẠO BA LÔ (TEXT ENGINE)
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Chế độ bài học dạng viết văn/hồ sơ/luật chơi không tạo ảnh AI
            </p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
          Text Engine
        </span>
      </div>

      {/* 1. Tiêu đề sổ tay & Lời dặn AKI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-black text-slate-700 mb-1">
            Tiêu đề Sổ tay Ba Lô:
          </label>
          <input
            type="text"
            value={currentConfig.notebookTitle || ''}
            onChange={(e) => updateConfig({ notebookTitle: e.target.value })}
            placeholder="Ví dụ: Hồ sơ nhân vật của tớ..."
            className="w-full rounded-xl bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 font-bold focus:border-amber-400 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-700 mb-1">
            Phân loại Ba Lô (Category / Tag):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentConfig.backpackCategory || ''}
              onChange={(e) => updateConfig({ backpackCategory: e.target.value })}
              placeholder="Category: character-dna / story..."
              className="flex-1 rounded-xl bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:border-amber-400 focus:outline-hidden"
            />
            <input
              type="text"
              value={currentConfig.backpackTag || ''}
              onChange={(e) => updateConfig({ backpackTag: e.target.value })}
              placeholder="Tag nhãn..."
              className="flex-1 rounded-xl bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:border-amber-400 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-black text-slate-700 mb-1">
          Lời dặn dò của AKI (Hiển thị đầu bài):
        </label>
        <textarea
          rows={2}
          value={currentConfig.akiAdvice || ''}
          onChange={(e) => updateConfig({ akiAdvice: e.target.value })}
          placeholder="Lời dặn chân thành từ kịch bản bài học..."
          className="w-full rounded-xl bg-white border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-amber-400 focus:outline-hidden"
        />
      </div>

      {/* 2. Câu mẫu kịch bản chuẩn (Sample Template Modal) */}
      <div className="rounded-xl bg-white/90 border border-slate-200 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-black text-slate-800">
            <BookOpen size={14} className="text-amber-600" />
            <span>Kịch bản câu mẫu cho học sinh tham khảo:</span>
          </label>
          <input
            type="text"
            value={currentConfig.sampleHelperTitle || ''}
            onChange={(e) => updateConfig({ sampleHelperTitle: e.target.value })}
            placeholder="Tiêu đề popup mẫu..."
            className="rounded-lg bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] text-slate-700 font-bold"
          />
        </div>
        <textarea
          rows={4}
          value={currentConfig.sampleTemplate || ''}
          onChange={(e) => updateConfig({ sampleTemplate: e.target.value })}
          placeholder="Nội dung kịch bản câu chuyện mẫu..."
          className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-800 font-mono focus:bg-white focus:border-amber-400 focus:outline-hidden"
        />
      </div>

      {/* 3. Danh sách các ô nhập liệu (Fields) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 flex items-center gap-1">
            <FileText size={14} className="text-indigo-600" />
            <span>Danh sách các ô thông minh ({fields.length} ô):</span>
          </span>
          <button
            type="button"
            onClick={handleAddField}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={13} />
            <span>Thêm ô</span>
          </button>
        </div>

        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {fields.map((field, idx) => (
            <div
              key={field.id || idx}
              className="flex items-start gap-2 rounded-xl bg-white border border-slate-200 p-2.5 shadow-2xs"
            >
              <span className="size-6 rounded-md bg-amber-100 text-amber-900 flex items-center justify-center text-xs font-black shrink-0 mt-1">
                {idx + 1}
              </span>
              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => handleUpdateField(idx, { label: e.target.value })}
                  placeholder="Nhãn của ô (VD: 1. Ai làm gì?)..."
                  className="w-full rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs text-slate-800 font-bold focus:bg-white focus:border-amber-400 focus:outline-hidden"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    value={field.prefix || ''}
                    onChange={(e) => handleUpdateField(idx, { prefix: e.target.value })}
                    placeholder="Tiền tố cố định (prefix: e.g. Tên: )..."
                    className="w-full rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs text-slate-700 focus:bg-white focus:border-amber-400 focus:outline-hidden"
                  />
                  <input
                    type="text"
                    value={field.badge || ''}
                    onChange={(e) => handleUpdateField(idx, { badge: e.target.value })}
                    placeholder="Nhãn nhỏ (badge: e.g. Quan trọng, Hỏi người nhà)..."
                    className="w-full rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs text-slate-700 focus:bg-white focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
                <input
                  type="text"
                  value={field.helperTip || ''}
                  onChange={(e) => handleUpdateField(idx, { helperTip: e.target.value })}
                  placeholder="Mẹo sư phạm (helperTip: e.g. 💡 Đừng bỏ trống ô này...)..."
                  className="w-full rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs text-slate-700 focus:bg-white focus:border-amber-400 focus:outline-hidden"
                />
                <input
                  type="text"
                  value={field.placeholder || ''}
                  onChange={(e) => handleUpdateField(idx, { placeholder: e.target.value })}
                  placeholder="Gợi ý placeholder..."
                  className="w-full rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs text-slate-600 focus:bg-white focus:border-amber-400 focus:outline-hidden"
                />
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <select
                  value={field.rows || 3}
                  onChange={(e) => handleUpdateField(idx, { rows: Number(e.target.value) })}
                  className="rounded-lg bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-700 font-bold"
                >
                  <option value={1}>1 dòng</option>
                  <option value={2}>2 dòng</option>
                  <option value={3}>3 dòng</option>
                  <option value={4}>4 dòng</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveField(idx)}
                  className="size-6 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                  title="Xóa ô này"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Tiêu chí tự kiểm tra (Checklist) */}
      <div className="space-y-1.5 pt-1 rounded-xl bg-white/80 border border-emerald-200 p-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <CheckSquare size={14} className="text-emerald-600" />
            <span>Tiêu chí tự kiểm tra ({checklist.length} tiêu chí):</span>
          </label>
          <button
            type="button"
            onClick={handleAddChecklistItem}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[11px] shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={12} />
            <span>Thêm tiêu chí</span>
          </button>
        </div>
        <div className="space-y-1.5 pt-1">
          {checklist.map((item, cIdx) => (
            <div
              key={item.id || cIdx}
              className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200"
            >
              <span className="size-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-[11px] font-black shrink-0">
                {cIdx + 1}
              </span>
              <input
                type="text"
                value={item.label}
                onChange={(e) => handleUpdateChecklistItem(cIdx, { label: e.target.value })}
                placeholder="Tên tiêu chí (VD: Đủ 3 cổng: Bình thường...)..."
                className="flex-1 rounded-md bg-white border border-slate-200 px-2 py-1 text-xs text-slate-800 font-bold focus:border-emerald-400 focus:outline-hidden"
              />
              <input
                type="text"
                value={item.hint || ''}
                onChange={(e) => handleUpdateChecklistItem(cIdx, { hint: e.target.value })}
                placeholder="Gợi ý thêm..."
                className="w-1/3 rounded-md bg-white border border-slate-200 px-2 py-1 text-xs text-slate-600 focus:border-emerald-400 focus:outline-hidden hidden sm:block"
              />
              <button
                type="button"
                onClick={() => handleRemoveChecklistItem(cIdx)}
                className="size-6 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center text-xs cursor-pointer"
                title="Xóa tiêu chí này"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Tóm tắt mục tiêu / Thử thách (Challenge Summary) */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-slate-700 flex items-center gap-1">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Gạch đầu dòng thử thách ({challengeSummary.length} mục tiêu):</span>
          </label>
          <button
            type="button"
            onClick={handleAddSummary}
            className="text-[11px] text-indigo-600 hover:underline font-bold cursor-pointer"
          >
            + Thêm mục tiêu
          </button>
        </div>
        <div className="space-y-1">
          {challengeSummary.map((sum, sIdx) => (
            <div key={sIdx} className="flex items-center gap-1.5">
              <span className="text-emerald-600 text-xs">✓</span>
              <input
                type="text"
                value={sum}
                onChange={(e) => handleUpdateSummary(sIdx, e.target.value)}
                className="flex-1 rounded-lg bg-white border border-slate-200 px-2 py-0.5 text-xs text-slate-800"
              />
              <button
                type="button"
                onClick={() => handleRemoveSummary(sIdx)}
                className="size-5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
