import React from 'react'
import { X } from 'lucide-react'
import type { OfficialStudent, OfficialTeacher } from '../tabs/AdminOfficialProgramTab'

export interface AssignStuckMentorModalProps {
  targetStudent: OfficialStudent
  teachers: OfficialTeacher[]
  selectedMentorId: string
  onChangeSelectedMentorId: (id: string) => void
  onClose: () => void
  onSubmit: () => void
}

export function AssignStuckMentorModal({
  targetStudent,
  teachers,
  selectedMentorId,
  onChangeSelectedMentorId,
  onClose,
  onSubmit,
}: AssignStuckMentorModalProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200/80 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-600">
              Can Thiệp Sư Phạm Kịp Thời
            </span>
            <h3 className="text-base font-black text-slate-900 mt-0.5">
              Gán Mentor Hỗ Trợ Gỡ Kẹt Bài
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3">
            <p className="text-xs text-slate-500 font-medium">Học sinh kẹt bài:</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{targetStudent.nickname}</p>
            <p className="text-xs text-rose-600 mt-0.5">
              Vấn đề: {targetStudent.supportReason || 'Đang kẹt trạm'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Chọn Giáo Viên / Mentor can thiệp:
            </label>
            <select
              value={selectedMentorId}
              onChange={(e) => onChangeSelectedMentorId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nickname} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="px-4 py-1.5 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Xác nhận gán Mentor
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
