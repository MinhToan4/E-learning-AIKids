import React from 'react'
import { Users } from 'lucide-react'
import type { OfficialStudent, OfficialTeacher } from '../tabs/AdminOfficialProgramTab'

export interface AdminCohortsMentorsViewProps {
  teachers: OfficialTeacher[]
  preschoolStudents: OfficialStudent[]
  primaryStudents: OfficialStudent[]
  juniorStudents: OfficialStudent[]
  cohortMentors: Record<string, string>
  onAssignCohortMentor: (cohort: 'preschool' | 'primary' | 'junior', teacherId: string) => void
  onOpenCohortModal: (cohort: 'preschool' | 'primary' | 'junior') => void
}

export function AdminCohortsMentorsView({
  teachers,
  preschoolStudents,
  primaryStudents,
  juniorStudents,
  cohortMentors,
  onAssignCohortMentor,
  onOpenCohortModal,
}: AdminCohortsMentorsViewProps) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-purple-600">
            <Users className="w-4 h-4" />
            <span>Phân Khu 2: Age Cohorts & Mentors</span>
          </div>
          <h3 className="text-base font-black text-slate-900 mt-0.5">
            👥 Phân Bổ Khối Tuổi & Phân Công Mentor Đồng Hành
          </h3>
        </div>
        <span className="text-xs font-medium text-slate-500">
          Giáo viên thực tế sẵn sàng: <strong className="text-slate-900">{teachers.length} người</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Khối Mầm Non */}
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/30 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🐥</span>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Khối Mầm Non (4-6 tuổi)</h4>
                  <p className="text-[11px] text-amber-700 font-medium">Khám phá trực quan & làm quen AIKI</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{preschoolStudents.length}</span>
              <span className="text-xs font-semibold text-slate-600">học sinh đang theo học</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Tập trung tương tác giọng nói, thị giác và hình thành phản xạ số văn minh.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-100 space-y-2">
            <label className="block text-[11px] font-bold text-slate-700">
              Mentor đồng hành phụ trách khối:
            </label>
            <select
              value={cohortMentors.preschool}
              onChange={(e) => onAssignCohortMentor('preschool', e.target.value)}
              className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">-- Chọn Mentor đồng hành --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nickname} ({t.role})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => onOpenCohortModal('preschool')}
              className="w-full py-1.5 text-xs font-bold text-amber-800 bg-amber-100/70 hover:bg-amber-200/70 rounded-xl transition-colors cursor-pointer text-center"
            >
              Xem danh sách ({preschoolStudents.length} bạn)
            </button>
          </div>
        </div>

        {/* Khối Tiểu Học */}
        <div className="rounded-2xl border border-sky-200/80 bg-sky-50/30 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Khối Tiểu Học (7-9 tuổi)</h4>
                  <p className="text-[11px] text-sky-700 font-medium">10 Quy Tắc Vàng, tư duy logic & đố vui</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{primaryStudents.length}</span>
              <span className="text-xs font-semibold text-slate-600">học sinh đang theo học</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Làm chủ quy chuẩn an toàn AI, tham gia xưởng vẽ và đấu trường mini-game.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-sky-100 space-y-2">
            <label className="block text-[11px] font-bold text-slate-700">
              Mentor đồng hành phụ trách khối:
            </label>
            <select
              value={cohortMentors.primary}
              onChange={(e) => onAssignCohortMentor('primary', e.target.value)}
              className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="">-- Chọn Mentor đồng hành --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nickname} ({t.role})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => onOpenCohortModal('primary')}
              className="w-full py-1.5 text-xs font-bold text-sky-800 bg-sky-100/70 hover:bg-sky-200/70 rounded-xl transition-colors cursor-pointer text-center"
            >
              Xem danh sách ({primaryStudents.length} bạn)
            </button>
          </div>
        </div>

        {/* Khối Thiếu Nhi */}
        <div className="rounded-2xl border border-purple-200/80 bg-purple-50/30 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧠</span>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Khối Thiếu Nhi (10-12 tuổi)</h4>
                  <p className="text-[11px] text-purple-700 font-medium">Sáng tạo Prompts, Comic & Game</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{juniorStudents.length}</span>
              <span className="text-xs font-semibold text-slate-600">học sinh đang theo học</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Lập trình trợ lý AI, tạo hoạt hình số và chuẩn bị đề tài Đảo Vũ Trụ Tốt Nghiệp.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-100 space-y-2">
            <label className="block text-[11px] font-bold text-slate-700">
              Mentor đồng hành phụ trách khối:
            </label>
            <select
              value={cohortMentors.junior}
              onChange={(e) => onAssignCohortMentor('junior', e.target.value)}
              className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="">-- Chọn Mentor đồng hành --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nickname} ({t.role})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => onOpenCohortModal('junior')}
              className="w-full py-1.5 text-xs font-bold text-purple-800 bg-purple-100/70 hover:bg-purple-200/70 rounded-xl transition-colors cursor-pointer text-center"
            >
              Xem danh sách ({juniorStudents.length} bạn)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
