import React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import type { ClassInfo } from './types'

export interface AddStudentModalProps {
  show: boolean
  onClose: () => void
  classInfo: ClassInfo
  newStudentNickname: string
  setNewStudentNickname: (name: string) => void
  handleAddStudent: (e: React.FormEvent) => Promise<void>
  submittingStudent: boolean
}

export function AddStudentModal({
  show,
  onClose,
  classInfo,
  newStudentNickname,
  setNewStudentNickname,
  handleAddStudent,
  submittingStudent,
}: AddStudentModalProps) {
  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-student-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-3xl border border-border bg-white p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-brand-600">THÊM HỌC SINH</p>
            <h3 id="add-student-title" className="font-display text-lg text-slate-900">
              Ghi danh học sinh vào lớp
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={(e) => void handleAddStudent(e)} className="space-y-4">
          <label className="block text-sm font-bold text-slate-800">
            Biệt danh học sinh
            <input
              type="text"
              required
              placeholder="Ví dụ: Bé Bo, Minh Quân, Bắp Nhí…"
              value={newStudentNickname}
              onChange={(e) => setNewStudentNickname(e.target.value)}
              className="mt-1.5 w-full min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none transition focus:border-brand-400"
              autoFocus
            />
          </label>

          <p className="text-xs text-muted">
            Hệ thống sẽ liên kết tài khoản học sinh tương ứng với biệt danh này vào lớp {classInfo.name}.
          </p>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={submittingStudent}
              className="w-full sm:w-auto h-11 px-5 whitespace-nowrap inline-flex items-center justify-center"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submittingStudent}
              className="w-full sm:w-auto h-11 px-5 whitespace-nowrap inline-flex items-center justify-center"
            >
              {submittingStudent ? 'Đang thêm…' : 'Thêm vào lớp'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
