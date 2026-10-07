import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { TeacherOption, MasterClassItem } from '../tabs/AdminClassesDirectory'

export interface AssignTeacherModalProps {
  targetClass: MasterClassItem
  teachers: TeacherOption[]
  onClose: () => void
  onSubmit: (teacherId: string | null) => void
}

export function AssignTeacherModal({ targetClass, teachers, onClose, onSubmit }: AssignTeacherModalProps) {
  const [selectedId, setSelectedId] = useState(targetClass.teacherId || '')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return createPortal(
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
            <span className="text-[11px] font-black uppercase tracking-wider text-brand-600">
              Phân Bổ Nhân Sự ERP
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">Phân công Giáo viên</h3>
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
            <p className="text-xs text-slate-500 font-medium">Lớp học được chọn:</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{targetClass.name}</p>
            <p className="text-xs font-mono text-slate-600 mt-0.5">Mã: {targetClass.code}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Chọn Giáo viên phụ trách:
            </label>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              <label
                className={cn(
                  'flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all',
                  selectedId === ''
                    ? 'border-amber-400 bg-amber-50/60'
                    : 'border-slate-200 hover:bg-slate-50',
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                    ∅
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Để trống (Chưa phân công)</p>
                    <p className="text-[11px] text-slate-500">Lớp sẽ ở trạng thái chờ giáo viên</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="assignTeacher"
                  checked={selectedId === ''}
                  onChange={() => setSelectedId('')}
                  className="text-brand-500"
                />
              </label>

              {teachers.map((t) => {
                const isSelected = selectedId === t.id
                return (
                  <label
                    key={t.id}
                    className={cn(
                      'flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all',
                      isSelected
                        ? 'border-brand-500 bg-brand-50/60'
                        : 'border-slate-200 hover:bg-slate-50',
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">
                        {(t.nickname || 'G').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{t.nickname || 'Giáo viên'}</p>
                        {t.email && <p className="text-[11px] text-slate-500">{t.email}</p>}
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="assignTeacher"
                      checked={isSelected}
                      onChange={() => setSelectedId(t.id)}
                      className="text-brand-500"
                    />
                  </label>
                )
              })}
            </div>
          </div>

          <div className="pt-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => onSubmit(selectedId ? selectedId : null)}
              className="px-4 py-2 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Lưu phân công
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
