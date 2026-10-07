import React from 'react'
import {
  Users,
  Award,
  BookOpen,
  Palette,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import type { ClassStats, StudentRow } from './types'

export interface ClassStatsTabProps {
  stats: ClassStats | null
  students: StudentRow[]
  handleOpenProgress: (studentId: string) => Promise<void>
}

export function ClassStatsTab({
  stats,
  students,
  handleOpenProgress,
}: ClassStatsTabProps) {
  return (
    <div className="space-y-6">
      {/* 4 Stat Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="ui-card p-4 border border-border bg-white shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Học sinh</span>
            <Users className="h-4 w-4 text-sky-500" />
          </div>
          <p className="text-2xl font-display text-slate-900">{stats?.studentCount ?? students.length}</p>
          <p className="text-xs text-muted">Trong danh sách lớp</p>
        </div>

        <div className="ui-card p-4 border border-border bg-white shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Trạm hoàn thành</span>
            <Award className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-display text-slate-900">{stats?.totalCompletedQuests ?? 0}</p>
          <p className="text-xs text-muted">Lượt bài hoàn thành</p>
        </div>

        <div className="ui-card p-4 border border-border bg-white shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Bài học đang mở</span>
            <BookOpen className="h-4 w-4 text-mint-500" />
          </div>
          <p className="text-2xl font-display text-slate-900">{stats?.openQuestCount ?? 8}</p>
          <p className="text-xs text-muted">Trạm sẵn sàng trải nghiệm</p>
        </div>

        <div className="ui-card p-4 border border-border bg-white shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Sản phẩm</span>
            <Palette className="h-4 w-4 text-coral-500" />
          </div>
          <p className="text-2xl font-display text-slate-900">{stats?.projectCount ?? 0}</p>
          <p className="text-xs text-muted">Tác phẩm sáng tạo</p>
        </div>
      </div>

      {/* Montessori Pedagogical Support Section */}
      <section className="ui-card border border-border shadow-xs overflow-hidden">
        <div className="border-b border-border bg-amber-50/50 px-5 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h2 className="font-display text-base text-slate-900">
              Học sinh cần hỗ trợ sư phạm & Khuyến nghị Montessori
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted">
            Phương pháp Montessori tôn trọng nhịp độ tự nhiên của trẻ: Không hối thúc, đồng hành quan sát và chỉ can thiệp tối thiểu khi trẻ gặp bế tắc.
          </p>
        </div>

        {(() => {
          const supportStudents = (stats?.students ?? []).filter((s) => s.needsSupport)

          if (supportStudents.length === 0) {
            return (
              <div className="p-8 text-center space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="font-bold text-slate-800">Tất cả học sinh đang tiến bộ thuận lợi!</p>
                <p className="text-xs text-muted max-w-md mx-auto">
                  Không có học sinh nào bị kẹt tại các trạm học. Tiếp tục khuyến khích các em tự do khám phá và sáng tạo.
                </p>
              </div>
            )
          }

          return (
            <div className="divide-y divide-border/60">
              {supportStudents.map((st) => (
                <article key={st.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{st.nickname || 'Học sinh'}</span>
                      <span className="rounded-lg bg-purple-50 px-2 py-0.5 text-xs font-black text-purple-700 border border-purple-200">
                        Lv{st.level}
                      </span>
                      <span className="text-xs text-muted font-mono">ID: {st.id.slice(0, 8)}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span>
                        Trạm đang học:{' '}
                        <strong className="text-slate-800">
                          {st.currentQuest || 'Đang ở bước khởi đầu'}
                        </strong>
                        {st.currentPhase && ` (${st.currentPhase})`}
                      </span>
                      <span>
                        Hoạt động gần nhất:{' '}
                        <strong>
                          {st.lastActiveAt ? new Date(st.lastActiveAt).toLocaleString('vi-VN') : 'Chưa ghi nhận'}
                        </strong>
                      </span>
                    </div>

                    {/* Montessori Pedagogical Recommendation */}
                    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-2.5 text-xs text-amber-900">
                      <p className="font-bold flex items-center gap-1.5">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                        <span>Khuyến nghị sư phạm:</span>
                      </p>
                      <p className="mt-0.5 leading-relaxed">
                        {st.supportReason ||
                          'Bé có thể đang phân vân trong phần thử thách. Thầy/Cô nên hỏi mở: "Con đang muốn nhân vật của mình làm gì tiếp theo nè?" để khơi gợi ý tưởng.'}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Button
                      variant="secondary"
                      className="!text-xs !min-h-9"
                      onClick={() => void handleOpenProgress(st.id)}
                    >
                      🔍 Xem chi tiết lộ trình
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )
        })()}
      </section>
    </div>
  )
}
