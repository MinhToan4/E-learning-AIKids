import React from 'react'
import { AlertTriangle, CheckCircle2, Smile, UserCheck } from 'lucide-react'
import type { OfficialStudent } from '../tabs/AdminOfficialProgramTab'

export interface AdminStuckRadarViewProps {
  stuckStudents: OfficialStudent[]
  onSendCheerSticker: (student: OfficialStudent) => void
  onOpenAssignMentorModal: (student: OfficialStudent) => void
}

export function AdminStuckRadarView({
  stuckStudents,
  onSendCheerSticker,
  onOpenAssignMentorModal,
}: AdminStuckRadarViewProps) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-600">
            <AlertTriangle className="w-4 h-4" />
            <span>Phân Khu 3: School Stuck Radar & Interventions</span>
          </div>
          <h3 className="text-base font-black text-slate-900 mt-0.5">
            🚨 Radar Kẹt Bài & Can Thiệp Sư Phạm Toàn Trường
          </h3>
        </div>
        <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
          {stuckStudents.length} trường hợp cần can thiệp
        </span>
      </div>

      {stuckStudents.length === 0 ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-black text-slate-900">
            Tuyệt vời! 100% học sinh đang duy trì nhịp học thuận lợi
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Không có học sinh nào bị kẹt bài quá 48 giờ. Toàn bộ tiến độ các trạm đang diễn ra suôn sẻ.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {stuckStudents.map((student) => (
            <div
              key={student.id}
              className="py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-slate-50/60 p-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 font-black flex items-center justify-center text-sm shadow-2xs">
                  {student.nickname.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{student.nickname}</span>
                    <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      Lv{student.level}
                    </span>
                    <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-full">
                      {student.currentQuest || 'Trạm chưa rõ'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lý do:{' '}
                    <strong className="text-slate-700 font-medium">
                      {student.supportReason || 'Gặp trở ngại khi thực hành trạm'}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => onSendCheerSticker(student)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Smile className="w-3.5 h-3.5 text-amber-500" />
                  <span>Gửi sticker động viên</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenAssignMentorModal(student)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-brand-500 hover:bg-brand-600 text-white shadow-2xs transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Gán Mentor hỗ trợ</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
