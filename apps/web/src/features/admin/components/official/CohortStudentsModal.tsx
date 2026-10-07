import React from 'react'
import { X } from 'lucide-react'
import type { OfficialStudent } from '../tabs/AdminOfficialProgramTab'

export interface CohortStudentsModalProps {
  cohort: 'preschool' | 'primary' | 'junior'
  students: OfficialStudent[]
  onClose: () => void
}

export function CohortStudentsModal({ cohort, students, onClose }: CohortStudentsModalProps) {
  const cohortTitle =
    cohort === 'preschool'
      ? 'Mầm Non (4-6)'
      : cohort === 'primary'
        ? 'Tiểu Học (7-9)'
        : 'Thiếu Nhi (10-12)'

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200/80 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-brand-600">
              Phân Hệ Chương Trình Chính Thức
            </span>
            <h3 className="text-base font-black text-slate-900 mt-0.5">
              Danh Sách Học Sinh - Khối {cohortTitle}
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

        <div className="mt-4 max-h-80 overflow-y-auto divide-y divide-slate-100 pr-1">
          {students.map((student) => (
            <div key={student.id} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                  {student.nickname.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{student.nickname}</p>
                  <p className="text-[11px] text-slate-500">
                    {student.currentQuest} · {student.xp} XP
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {student.hasSafetyBadge && (
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    🛡️ Đạt 10 Quy Tắc Vàng
                  </span>
                )}
                <span className="text-xs font-mono text-slate-400">Lv{student.level}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
