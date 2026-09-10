import { cn } from '@/shared/lib/cn'
import { AsmoFormula } from '@/features/asmo/components/AsmoFormula'
import type { AsmoStudioAnalyticsTabProps } from './types'
import { INITIAL_SUBMISSIONS, INITIAL_COMMON_MISTAKES } from './constants'

export function AsmoStudioAnalyticsTab({
  submissions = INITIAL_SUBMISSIONS,
  commonMistakes = INITIAL_COMMON_MISTAKES,
}: AsmoStudioAnalyticsTabProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Quick Analytics Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-4 rounded-3xl border-2 border-border/80 bg-surface p-5 shadow-clay">
          <div className="flex size-13 shrink-0 items-center justify-center rounded-2xl border-2 border-brand-200 bg-brand-50 text-brand-600 text-2xl shadow-clay">
            📝
          </div>
          <div>
            <p className="text-xs font-bold text-muted uppercase">Tổng lượt nộp bài</p>
            <p className="font-display text-2xl font-black text-text">1,428</p>
            <p className="text-[11px] text-emerald-600 font-bold">+18.5% tuần qua</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-3xl border-2 border-border/80 bg-surface p-5 shadow-clay">
          <div className="flex size-13 shrink-0 items-center justify-center rounded-2xl border-2 border-emerald-200 bg-emerald-50 text-emerald-600 text-2xl shadow-clay">
            🏆
          </div>
          <div>
            <p className="text-xs font-bold text-muted uppercase">Tỷ lệ đạt chuẩn</p>
            <p className="font-display text-2xl font-black text-emerald-600">78.4%</p>
            <p className="text-[11px] text-muted font-bold">1,120 học sinh đậu</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-3xl border-2 border-border/80 bg-surface p-5 shadow-clay">
          <div className="flex size-13 shrink-0 items-center justify-center rounded-2xl border-2 border-sky-200 bg-sky-50 text-sky-600 text-2xl shadow-clay">
            📊
          </div>
          <div>
            <p className="text-xs font-bold text-muted uppercase">Điểm TB toàn sàn</p>
            <p className="font-display text-2xl font-black text-sky-600">76.2 / 100</p>
            <p className="text-[11px] text-muted font-bold">Điểm cao nhất: 100</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-3xl border-2 border-border/80 bg-surface p-5 shadow-clay">
          <div className="flex size-13 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-200 bg-amber-50 text-amber-600 text-2xl shadow-clay">
            ⏱️
          </div>
          <div>
            <p className="text-xs font-bold text-muted uppercase">Thời gian làm bài TB</p>
            <p className="font-display text-2xl font-black text-amber-600">38.5 phút</p>
            <p className="text-[11px] text-muted font-bold">Quy định: 60 phút</p>
          </div>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="rounded-3xl border-2 border-border/80 bg-surface p-5 shadow-clay">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h3 className="font-display text-base font-black text-text">
              Lượt Nộp Bài Gần Đây Của Học Sinh
            </h3>
          </div>
          <span className="text-xs text-muted font-bold">Cập nhật thời gian thực</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-border/80 text-muted font-black uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Học sinh</th>
                <th className="pb-3">Đề thi</th>
                <th className="pb-3">Điểm số</th>
                <th className="pb-3">Tỷ lệ đúng</th>
                <th className="pb-3">Kết quả</th>
                <th className="pb-3">Thời gian</th>
                <th className="pb-3 pr-2 text-right">Thời điểm nộp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-brand-50/40 transition-colors">
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-black text-[11px]">
                        {sub.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-text">{sub.studentName}</p>
                        <p className="text-[10px] text-muted">Lớp {sub.studentGrade}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <p className="font-bold text-text line-clamp-1 max-w-[280px]">
                      {sub.examTitle}
                    </p>
                    <span className="text-[10px] text-muted">
                      {sub.subject === 'math' ? 'Toán' : sub.subject === 'science' ? 'Khoa Học' : 'Tiếng Anh'}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className="font-black text-text text-sm">{sub.score}</span>
                    <span className="text-muted"> / {sub.totalPoints}</span>
                  </td>
                  <td className="py-3.5 font-black text-brand-600">
                    {sub.scorePct}%
                  </td>
                  <td className="py-3.5">
                    <span
                      className={cn(
                        'rounded-xl px-2.5 py-0.5 text-[11px] font-black border',
                        sub.isPassed
                          ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                          : 'border-rose-300 bg-rose-100 text-rose-800',
                      )}
                    >
                      {sub.isPassed ? '✓ Đạt chuẩn' : '✗ Chưa đạt'}
                    </span>
                  </td>
                  <td className="py-3.5 font-bold text-muted">
                    {sub.durationMinutes} phút
                  </td>
                  <td className="py-3.5 pr-2 text-right font-bold text-muted">
                    {sub.submittedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Common Mistakes */}
      <div className="rounded-3xl border-2 border-border/80 bg-surface p-5 shadow-clay">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <div>
              <h3 className="font-display text-base font-black text-text">
                Top Câu Hỏi Học Sinh Hay Làm Sai (Bẫy Toán Học)
              </h3>
              <p className="text-xs text-muted">Phân tích để giáo viên điều chỉnh bài giảng ôn tập</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commonMistakes.map((mistake) => (
            <div
              key={mistake.questionId}
              className="flex flex-col justify-between gap-3 rounded-2xl border-2 border-border/80 bg-white p-4 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-lg bg-rose-100 border border-rose-200 px-2 py-0.5 text-[10px] font-black text-rose-800">
                    Tỷ lệ sai: {mistake.wrongRatePct}% ({mistake.wrongAttemptsCount} lượt)
                  </span>
                  <span className="text-[10px] font-bold text-muted">{mistake.examCode}</span>
                </div>

                <h4 className="mt-2 text-xs font-black text-brand-700">
                  Chuyên đề: {mistake.topicName}
                </h4>

                <div className="mt-1 rounded-xl bg-slate-50 p-2.5 text-xs text-text border border-border/40 font-medium">
                  <AsmoFormula text={mistake.questionText} />
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-2.5">
                <p className="text-[11px] font-bold text-amber-900 leading-snug">
                  💡 <strong>Phân tích bẫy tư duy:</strong> {mistake.commonPitfall}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
