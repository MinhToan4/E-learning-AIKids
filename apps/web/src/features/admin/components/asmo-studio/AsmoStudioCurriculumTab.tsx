import {
  Plus,
  Sparkles,
  Upload,
  Download,
  RotateCcw,
  BookOpen,
  Edit3,
  Wand2,
  Trash2,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import type { AsmoSubject } from '@/features/asmo/types'
import type { AsmoStudioCurriculumTabProps } from './types'
import { TEMPLATE_3D_LABELS } from './constants'

export function AsmoStudioCurriculumTab({
  curriculumWeeks,
  filteredWeeks,
  curriculumSubject,
  onCurriculumSubjectChange,
  curriculumGrade,
  onCurriculumGradeChange,
  onOpenCreateWeek,
  onGenerateAllTips,
  onOpenImportModal,
  onExportCurriculum,
  onResetCurriculum,
  onEditWeek,
  onPreviewGen,
  onDeleteWeek,
}: AsmoStudioCurriculumTabProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 rounded-3xl border-2 border-border/80 bg-surface p-5 shadow-clay">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-black uppercase text-brand-600 tracking-wider">
              Lộ Trình Học Chuẩn ASMO
            </span>
            {/* Subject Filter */}
            <select
              aria-label="Lọc lộ trình theo môn"
              value={curriculumSubject}
              onChange={(e) => onCurriculumSubjectChange(e.target.value as 'all' | AsmoSubject)}
              className="rounded-2xl border-2 border-border/80 bg-white px-3 py-1.5 text-xs font-black text-text focus:border-brand-400 focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả môn</option>
              <option value="math">📐 Toán Olympic</option>
              <option value="science">🔬 Khoa Học Tự Nhiên</option>
              <option value="english">🔤 Tiếng Anh Học Thuật</option>
            </select>

            {/* Grade Filter */}
            <select
              aria-label="Lọc lộ trình theo lớp"
              value={curriculumGrade}
              onChange={(e) =>
                onCurriculumGradeChange(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="rounded-2xl border-2 border-border/80 bg-white px-3 py-1.5 text-xs font-black text-text focus:border-brand-400 focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả khối lớp</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                <option key={g} value={g}>
                  Lớp {g}
                </option>
              ))}
            </select>
          </div>

          {/* Data & Generator Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={onOpenCreateWeek}
              className="rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs px-3.5 py-2 shadow-clay flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="size-4" />
              <span>+ Thêm tuần mới</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={onGenerateAllTips}
              className="rounded-2xl border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-black text-xs px-3 py-2 shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="size-4 text-purple-600" />
              <span>⚡ Sinh Tips toàn bộ lộ trình</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={onOpenImportModal}
              className="rounded-2xl border-2 border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 font-black text-xs px-3 py-2 shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="size-4 text-sky-600" />
              <span>📥 Nhập Lộ trình (Import JSON)</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={onExportCurriculum}
              className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black text-xs px-3 py-2 shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="size-4 text-emerald-600" />
              <span>📤 Xuất Lộ trình (Export JSON)</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={onResetCurriculum}
              className="rounded-2xl text-muted hover:bg-slate-100 hover:text-text font-black text-xs px-2.5 py-2 flex items-center gap-1 cursor-pointer"
              title="Khôi phục về danh sách lộ trình gốc"
            >
              <RotateCcw className="size-3.5" />
              <span>Khôi phục mặc định</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
          <div className="text-muted font-bold">
            Đang hiển thị <strong className="text-text">{filteredWeeks.length}</strong> / {curriculumWeeks.length} tuần chuyên đề
          </div>
        </div>
      </div>

      {/* Curriculum Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredWeeks.map((weekItem) => {
          const templateInfo = weekItem.visualTemplate
            ? TEMPLATE_3D_LABELS[weekItem.visualTemplate]
            : null

          return (
            <div
              key={`${weekItem.subject}-${weekItem.grade}-${weekItem.week}-${weekItem.topic}`}
              className="flex flex-col justify-between gap-4 rounded-3xl border-2 border-border/80 bg-surface p-5 shadow-clay hover:border-brand-200 transition-all"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-9 items-center justify-center rounded-2xl border-2 border-brand-200 bg-brand-500 font-display text-xs font-black text-white shadow-clay">
                      T{weekItem.week}
                    </span>
                    <span
                      className={cn(
                        'rounded-xl px-2.5 py-0.5 text-[11px] font-black border',
                        weekItem.subject === 'math'
                          ? 'border-indigo-200 bg-indigo-50 text-indigo-800'
                          : weekItem.subject === 'science'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-orange-200 bg-orange-50 text-orange-800',
                      )}
                    >
                      {weekItem.subject === 'math'
                        ? 'Toán'
                        : weekItem.subject === 'science'
                          ? 'Khoa Học'
                          : 'Tiếng Anh'}{' '}
                      · Lớp {weekItem.grade}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-muted">
                    Mã: {weekItem.topic}
                  </span>
                </div>

                <h3 className="font-display text-base font-black text-text">
                  {weekItem.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  {weekItem.summary}
                </p>

                {/* Key Competencies Chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-muted uppercase">Trọng tâm:</span>
                  {weekItem.keyCompetencies.map((comp) => (
                    <span
                      key={comp}
                      className="rounded-xl border border-brand-200 bg-brand-50/70 px-2 py-0.5 text-[11px] font-bold text-brand-800 shadow-sm"
                    >
                      {comp}
                    </span>
                  ))}
                </div>

                {/* 3D Template Badge */}
                {templateInfo ? (
                  <div className="flex items-center gap-3 rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-3 shadow-sm">
                    <span className="text-2xl">{templateInfo.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-amber-900">
                          {templateInfo.label}
                        </span>
                        <span className="rounded-lg bg-amber-200 px-1.5 py-0.2 text-[10px] font-black text-amber-900">
                          3D LAB
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800 font-medium">
                        {templateInfo.desc}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-muted italic">
                    <BookOpen className="size-3.5" />
                    <span>Bài học lý thuyết & giải bài tập Olympic tổng hợp</span>
                  </div>
                )}

                {/* Mèo Mee Tips Box (nếu có) */}
                {weekItem.meeTip && (
                  <div className="flex items-start gap-2.5 rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-3 shadow-xs">
                    <span className="text-xl shrink-0">🐱</span>
                    <div className="flex-1 text-xs">
                      <p className="font-black text-amber-900 italic">
                        "{weekItem.meeTip.quote}"
                      </p>
                      <p className="mt-1 text-amber-800 font-medium leading-relaxed">
                        {weekItem.meeTip.storyAdvice}
                      </p>
                    </div>
                  </div>
                )}

                {/* Lời giải 3 bước ASMO (nếu có) */}
                {weekItem.solutionSteps && weekItem.solutionSteps.length > 0 && (
                  <div className="space-y-1.5 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-indigo-900 text-[11px] uppercase tracking-wider">
                        💡 Khung giải 3 bước ASMO:
                      </span>
                      <span className="rounded-md bg-indigo-200 px-1.5 py-0.2 text-[10px] font-black text-indigo-900">
                        KaTeX
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-800 font-bold truncate">
                      {weekItem.solutionSteps[0]}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions Toolbar on each card */}
              <div className="flex items-center justify-between border-t border-border/70 pt-3 mt-1">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onEditWeek(weekItem)}
                    className="rounded-xl border-2 border-brand-200 text-brand-700 hover:bg-brand-50 font-bold text-xs px-2.5 py-1 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="size-3.5" />
                    <span>Sửa tuần học</span>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onPreviewGen(weekItem)}
                    className="rounded-xl border-2 border-purple-200 bg-purple-50/60 text-purple-700 hover:bg-purple-100 font-bold text-xs px-2.5 py-1 flex items-center gap-1 cursor-pointer"
                  >
                    <Wand2 className="size-3.5 text-purple-600" />
                    <span>🪄 Sinh Tips & Lời giải</span>
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onDeleteWeek(weekItem)}
                  className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 font-bold text-xs px-2 py-1 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                  <span>Xóa tuần</span>
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
