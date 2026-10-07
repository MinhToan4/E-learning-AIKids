import React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'

export interface ClassSettingsModalProps {
  show: boolean
  onClose: () => void
  classForm: { name: string; code: string }
  setClassForm: React.Dispatch<React.SetStateAction<{ name: string; code: string }>>
  handleSaveClassSettings: (e: React.FormEvent) => Promise<void>
  savingClass: boolean
}

export function ClassSettingsModal({
  show,
  onClose,
  classForm,
  setClassForm,
  handleSaveClassSettings,
  savingClass,
}: ClassSettingsModalProps) {
  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="class-settings-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-3xl border border-border bg-white p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-brand-600">CÀI ĐẶT LỚP HỌC</p>
            <h3 id="class-settings-title" className="font-display text-lg text-slate-900">
              Đổi tên & mã mời lớp
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

        <form onSubmit={(e) => void handleSaveClassSettings(e)} className="space-y-4">
          <label className="block text-sm font-bold text-slate-800">
            Tên lớp học
            <input
              type="text"
              required
              minLength={2}
              value={classForm.name}
              onChange={(e) => setClassForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1.5 w-full min-h-11 rounded-xl border-2 border-border bg-white px-3 text-sm outline-none transition focus:border-brand-400"
            />
          </label>

          <label className="block text-sm font-bold text-slate-800">
            Mã lớp (Chữ in hoa và số)
            <input
              type="text"
              required
              minLength={3}
              pattern="[A-Za-z0-9-]+"
              value={classForm.code}
              onChange={(e) => setClassForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              className="mt-1.5 w-full min-h-11 rounded-xl border-2 border-border bg-white px-3 font-mono text-sm uppercase outline-none transition focus:border-brand-400"
            />
          </label>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={savingClass}
              className="w-full sm:w-auto h-11 px-5 whitespace-nowrap inline-flex items-center justify-center"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={savingClass}
              className="w-full sm:w-auto h-11 px-5 whitespace-nowrap inline-flex items-center justify-center"
            >
              {savingClass ? 'Đang lưu…' : 'Lưu cài đặt'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
