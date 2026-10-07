import React from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import type { StudentRow, ClassInfo } from './types'

export interface RemoveStudentModalProps {
  removeTarget: StudentRow | null
  onClose: () => void
  classInfo: ClassInfo
  handleRemoveStudent: () => Promise<void>
  removingStudent: boolean
}

export function RemoveStudentModal({
  removeTarget,
  onClose,
  classInfo,
  handleRemoveStudent,
  removingStudent,
}: RemoveStudentModalProps) {
  if (!removeTarget) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="remove-student-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-3xl border border-border bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3 text-danger">
          <Trash2 className="h-6 w-6" />
          <h3 id="remove-student-title" className="font-display text-lg text-slate-900">
            Xác nhận gỡ học sinh
          </h3>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Bạn có chắc chắn muốn gỡ học sinh{' '}
          <strong className="text-slate-900">{removeTarget.nickname || removeTarget.id}</strong> khỏi lớp{' '}
          <strong className="text-slate-900">{classInfo.name}</strong> không?
        </p>
        <p className="text-xs text-muted">
          Lưu ý: Thao tác này chỉ hủy liên kết của bé với lớp học hiện tại, không xóa tài khoản hay dữ liệu tiến độ của bé.
        </p>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 w-full">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={removingStudent}
            className="w-full sm:w-auto h-11 px-5 whitespace-nowrap inline-flex items-center justify-center"
          >
            Hủy
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto h-11 px-5 bg-danger text-white hover:bg-rose-700 whitespace-nowrap inline-flex items-center justify-center"
            onClick={() => void handleRemoveStudent()}
            disabled={removingStudent}
          >
            {removingStudent ? 'Đang gỡ…' : 'Gỡ khỏi lớp'}
          </Button>
        </div>
      </div>
    </div>
  )
}
