import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { CourseOption, TeacherOption, MasterClassItem } from '../tabs/AdminClassesDirectory'

export interface CreateClassModalProps {
  courses: CourseOption[]
  teachers: TeacherOption[]
  onClose: () => void
  onSubmit: (cls: Omit<MasterClassItem, 'id' | 'completionRate'>) => void
}

export function CreateClassModal({ courses, teachers, onClose, onSubmit }: CreateClassModalProps) {
  const [name, setName] = useState('')
  const [code, setCode] = useState(() => `AIKI-${Math.floor(100 + Math.random() * 900)}`)
  const [courseId, setCourseId] = useState(courses[0]?.id || '')
  const [teacherId, setTeacherId] = useState('')
  const [capacity, setCapacity] = useState(25)
  const [status, setStatus] = useState<'active' | 'upcoming'>('active')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !code.trim()) return

    const matchedCourse = courses.find((c) => c.id === courseId)
    const matchedTeacher = teachers.find((t) => t.id === teacherId)

    onSubmit({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      courseId: courseId || null,
      courseName: matchedCourse ? matchedCourse.title : 'Chương trình AI',
      subjectBadge: matchedCourse?.category || 'Chương trình AI',
      teacherId: teacherId || null,
      teacherName: matchedTeacher ? matchedTeacher.nickname : null,
      teacherEmail: matchedTeacher ? matchedTeacher.email : null,
      studentCount: 0,
      capacity,
      status,
    })
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200/80 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-brand-600">
              Quản Trị Toàn Trường (School ERP)
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">Khởi tạo Lớp học mới</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên lớp học <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Lớp Sáng Tạo Nhí 4A"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mã lớp (Code) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="AIKI-101"
                className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sĩ số tối đa</label>
              <input
                type="number"
                min={1}
                max={100}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Khóa học gán</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.category || 'Khóa học'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Giáo viên phụ trách
            </label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">-- Chưa phân công ngay --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nickname || 'Giáo viên'} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái ban đầu</label>
            <div className="flex items-center gap-3 mt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                  className="text-brand-500 focus:ring-brand-500"
                />
                <span>Đang hoạt động (Mở tuyển sinh)</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="upcoming"
                  checked={status === 'upcoming'}
                  onChange={() => setStatus('upcoming')}
                  className="text-brand-500 focus:ring-brand-500"
                />
                <span>Sắp mở (Dự bị)</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Khởi tạo Lớp học
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
