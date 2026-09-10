import {
  Search,
  Clock,
  Award,
  BookOpen,
  Edit3,
  Eye,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Paginator } from '@/shared/components/ui/Paginator'
import { cn } from '@/shared/lib/cn'
import type { AsmoSubject } from '@/features/asmo/types'
import type { AsmoStudioExamsTabProps } from './types'

export function AsmoStudioExamsTab({
  exams,
  filteredExams,
  paginatedExams,
  metrics,
  searchQuery,
  onSearchChange,
  filterSubject,
  onFilterSubjectChange,
  filterGrade,
  onFilterGradeChange,
  filterStatus,
  onFilterStatusChange,
  onResetFilters,
  onTogglePublish,
  onEditExam,
  onOpenQuestions,
  examPage,
  examTotalPages,
  onPrevPage,
  onNextPage,
  onGoToPage,
}: AsmoStudioExamsTabProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-4 rounded-3xl border-2 border-border/80 bg-gradient-to-br from-brand-50 to-white p-5 shadow-clay">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border-2 border-brand-200 bg-brand-100 text-brand-600 text-2xl shadow-clay">
            📚
          </div>
          <div>
            <p className="text-xs font-bold text-muted uppercase tracking-wider">Tổng số đề</p>
            <p className="font-display text-2xl font-black text-text">{metrics.totalExams}</p>
            <p className="text-[11px] text-brand-700 font-medium">Toán · Khoa học · Tiếng Anh</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-3xl border-2 border-border/80 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-clay">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border-2 border-emerald-200 bg-emerald-100 text-emerald-600 text-2xl shadow-clay">
            🟢
          </div>
          <div>
            <p className="text-xs font-bold text-muted uppercase tracking-wider">Đang mở</p>
            <p className="font-display text-2xl font-black text-emerald-600">{metrics.publishedCount}</p>
            <p className="text-[11px] text-emerald-700 font-medium">Sẵn sàng cho học sinh thi</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-3xl border-2 border-border/80 bg-gradient-to-br from-amber-50 to-white p-5 shadow-clay">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-200 bg-amber-100 text-amber-600 text-2xl shadow-clay">
            📝
          </div>
          <div>
            <p className="text-xs font-bold text-muted uppercase tracking-wider">Bản nháp</p>
            <p className="font-display text-2xl font-black text-amber-600">{metrics.draftCount}</p>
            <p className="text-[11px] text-amber-700 font-medium">Đang hiệu đính & chuẩn hóa</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-3xl border-2 border-border/80 bg-gradient-to-br from-sky-50 to-white p-5 shadow-clay">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border-2 border-sky-200 bg-sky-100 text-sky-600 text-2xl shadow-clay">
            🎯
          </div>
          <div>
            <p className="text-xs font-bold text-muted uppercase tracking-wider">Điểm trung bình</p>
            <p className="font-display text-2xl font-black text-sky-600">{metrics.avgPassScore} <span className="text-sm font-bold text-muted">/100</span></p>
            <p className="text-[11px] text-sky-700 font-medium">Quy chuẩn điểm đỗ ASMO</p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3 rounded-3xl border-2 border-border/80 bg-surface p-4 shadow-clay">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã đề…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-2xl border-2 border-border/80 bg-white py-2 pl-9 pr-3 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
            />
          </div>

          {/* Subject Filter */}
          <select
            aria-label="Lọc theo môn học"
            value={filterSubject}
            onChange={(e) => onFilterSubjectChange(e.target.value as 'all' | AsmoSubject)}
            className="rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-black text-text focus:border-brand-400 focus:outline-none"
          >
            <option value="all">Tất cả môn học</option>
            <option value="math">📐 Toán Olympic</option>
            <option value="science">🔬 Khoa Học</option>
            <option value="english">🔤 Tiếng Anh</option>
          </select>

          {/* Grade Filter */}
          <select
            aria-label="Lọc theo khối lớp"
            value={filterGrade}
            onChange={(e) =>
              onFilterGradeChange(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className="rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-black text-text focus:border-brand-400 focus:outline-none"
          >
            <option value="all">Tất cả khối lớp</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
              <option key={g} value={g}>
                Lớp {g}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            aria-label="Lọc theo trạng thái"
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value as 'all' | 'published' | 'draft')}
            className="rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-black text-text focus:border-brand-400 focus:outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">🟢 Đang mở (Published)</option>
            <option value="draft">🟡 Bản nháp (Draft)</option>
          </select>
        </div>

        <div className="text-xs font-bold text-muted self-end sm:self-center">
          Hiển thị <span className="text-text font-black">{paginatedExams.length}</span> / {filteredExams.length} đề thi (Tổng {exams.length})
        </div>
      </div>

      {/* Exams List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredExams.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border/80 p-12 text-center text-muted">
            <p className="text-base font-bold">Không tìm thấy đề thi phù hợp với bộ lọc.</p>
            <Button
              variant="secondary"
              onClick={onResetFilters}
              className="mt-3 rounded-2xl font-bold text-xs"
            >
              Đặt lại bộ lọc
            </Button>
          </div>
        ) : (
          paginatedExams.map((exam) => (
            <div
              key={exam.id}
              className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 rounded-3xl border-2 border-border/80 bg-surface p-5 shadow-clay transition-all hover:border-brand-200"
            >
              <div className="flex items-start gap-4 flex-1">
                <div
                  className={cn(
                    'flex size-13 shrink-0 items-center justify-center rounded-2xl border-2 text-xl shadow-clay font-black',
                    exam.subject === 'math'
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                      : exam.subject === 'science'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-orange-200 bg-orange-50 text-orange-700',
                  )}
                >
                  {exam.subject === 'math' ? '📐' : exam.subject === 'science' ? '🔬' : '🔤'}
                </div>

                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-xl border border-border/80 bg-white px-2.5 py-0.5 text-[11px] font-black text-muted">
                      {exam.code}
                    </span>
                    <span
                      className={cn(
                        'rounded-xl px-2.5 py-0.5 text-[11px] font-black border',
                        exam.subject === 'math'
                          ? 'border-indigo-200 bg-indigo-100 text-indigo-800'
                          : exam.subject === 'science'
                            ? 'border-emerald-200 bg-emerald-100 text-emerald-800'
                            : 'border-orange-200 bg-orange-100 text-orange-800',
                      )}
                    >
                      {exam.subject === 'math' ? 'Toán' : exam.subject === 'science' ? 'Khoa Học' : 'Tiếng Anh'} · Lớp {exam.grade}
                    </span>
                    <span className="rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                      {exam.round} · {exam.year}
                    </span>
                    <span
                      className={cn(
                        'rounded-xl px-2.5 py-0.5 text-[11px] font-black border',
                        exam.isPublished
                          ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                          : 'border-slate-300 bg-slate-100 text-slate-600',
                      )}
                    >
                      {exam.isPublished ? '● Đang mở' : '○ Bản nháp'}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-text line-clamp-1">{exam.title}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1 font-bold">
                      <Clock className="size-3.5 text-brand-500" />
                      Thời lượng: <strong className="text-text">{exam.durationMinutes} phút</strong>
                    </span>
                    <span className="flex items-center gap-1 font-bold">
                      <Award className="size-3.5 text-amber-500" />
                      Điểm đạt: <strong className="text-text">{exam.passScore}</strong> / {exam.totalPoints}
                    </span>
                    <span className="flex items-center gap-1 font-bold">
                      <BookOpen className="size-3.5 text-indigo-500" />
                      Số câu hỏi: <strong className="text-text">{exam.questions?.length ?? 0} câu</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                {/* Toggle publish button */}
                <button
                  type="button"
                  onClick={() => onTogglePublish(exam.id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-2xl border-2 px-3 py-2 text-xs font-black transition-all shadow-clay cursor-pointer',
                    exam.isPublished
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200',
                  )}
                  title={exam.isPublished ? 'Chuyển sang bản nháp' : 'Kích hoạt mở đề thi'}
                >
                  {exam.isPublished ? (
                    <>
                      <ToggleRight className="size-4 text-emerald-600" />
                      <span>Đang mở</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="size-4 text-slate-500" />
                      <span>Bản nháp</span>
                    </>
                  )}
                </button>

                {/* Regulation Modal button */}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onEditExam(exam)}
                  className="gap-1.5 rounded-2xl border-2 border-border/80 bg-white font-black shadow-clay hover:bg-amber-50 text-xs"
                >
                  <Edit3 className="size-3.5 text-amber-600" />
                  <span>Chỉnh quy chế</span>
                </Button>

                {/* Question details drawer/modal */}
                <Button
                  type="button"
                  onClick={() => onOpenQuestions(exam)}
                  className="gap-1.5 rounded-2xl border-2 border-brand-600 bg-brand-500 font-black text-white shadow-clay hover:bg-brand-600 text-xs"
                >
                  <Eye className="size-3.5" />
                  <span>Chi tiết câu hỏi ({exam.questions?.length ?? 0})</span>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {filteredExams.length > 0 && (
        <Paginator
          page={examPage}
          totalPages={examTotalPages}
          totalItems={filteredExams.length}
          pageSize={12}
          onPrev={onPrevPage}
          onNext={onNextPage}
          onGoTo={onGoToPage}
          className="rounded-3xl border-2 border-border/80 bg-surface shadow-clay"
        />
      )}
    </div>
  )
}
