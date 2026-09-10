import {
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Wrench,
  Eye,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import type { AsmoStudioAuditTabProps } from './types'

export function AsmoStudioAuditTab({
  exams,
  auditResults,
  healthScore,
  auditBreakdown,
  auditTimestamp,
  isAuditingAll,
  isRepairingAll,
  repairingExamId,
  repairedExamIds,
  onRunFullAudit,
  onRepairAllExams,
  onQuickRepair,
  onOpenAuditDetail,
}: AsmoStudioAuditTabProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Health Score & Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Health Card */}
        <div className="flex flex-col justify-between gap-4 rounded-3xl border-2 border-border/80 bg-gradient-to-br from-emerald-50 via-teal-50 to-white p-6 shadow-clay md:col-span-1">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-xl border border-emerald-300 bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800">
                HỆ THỐNG KIỂM ĐỊNH
              </span>
              <span className="text-xs text-muted font-bold">Lần quét: {auditTimestamp}</span>
            </div>
            <h3 className="mt-3 font-display text-lg font-black text-text">
              Chỉ số sức khỏe KaTeX & Sư phạm
            </h3>
          </div>

          <div className="flex items-end gap-3 my-2">
            <span className="font-display text-5xl font-black text-emerald-600">
              {healthScore}
            </span>
            <span className="text-lg font-black text-muted pb-1">/ 100</span>
            <span
              className={cn(
                'mb-1 ml-auto rounded-xl px-3 py-1 text-xs font-black border',
                healthScore >= 90
                  ? 'border-emerald-300 bg-emerald-500 text-white shadow-clay'
                  : healthScore >= 75
                    ? 'border-amber-300 bg-amber-500 text-white shadow-clay'
                    : 'border-rose-300 bg-rose-500 text-white shadow-clay',
              )}
            >
              {healthScore >= 90 ? 'Xuất sắc' : healthScore >= 75 ? 'Đạt chuẩn' : 'Cần tối ưu'}
            </span>
          </div>

          <div className="w-full bg-emerald-100 rounded-full h-3 overflow-hidden border border-emerald-200">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${healthScore}%` }}
            />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <Button
              type="button"
              onClick={onRunFullAudit}
              disabled={isAuditingAll || isRepairingAll}
              className="w-full gap-2 rounded-2xl border-2 border-emerald-600 bg-emerald-600 font-black text-white shadow-clay hover:bg-emerald-700"
            >
              <RotateCcw className={cn('size-4', isAuditingAll && 'animate-spin')} />
              {isAuditingAll ? 'Đang phân tích cú pháp…' : 'Quét lại toàn bộ ngân hàng đề'}
            </Button>

            <Button
              type="button"
              onClick={onRepairAllExams}
              disabled={isRepairingAll || isAuditingAll}
              className="w-full gap-2 rounded-2xl border-2 border-amber-500 bg-gradient-to-r from-amber-500 to-orange-500 font-black text-white shadow-clay hover:from-amber-600 hover:to-orange-600 cursor-pointer"
              title="Tự động chuẩn hóa KaTeX và bổ sung 3 bước sư phạm cho toàn bộ 20 đề tiêu biểu"
            >
              <Sparkles className={cn('size-4', isRepairingAll && 'animate-spin')} />
              {isRepairingAll ? 'Đang chuẩn hóa…' : `⚡ Sửa nhanh tất cả (${Math.min(exams.length, 20)} đề)`}
            </Button>
          </div>
        </div>

        {/* Breakdown Categories */}
        <div className="grid grid-cols-2 gap-3 md:col-span-2">
          <div className="flex flex-col justify-between rounded-3xl border-2 border-border/80 bg-surface p-4 shadow-clay">
            <div className="flex items-center gap-2 text-indigo-600">
              <span className="text-xl">📐</span>
              <p className="text-xs font-black uppercase tracking-wider">Cú pháp KaTeX</p>
            </div>
            <div className="my-2">
              <p className="font-display text-2xl font-black text-text">
                {auditBreakdown.katexErrors === 0 ? (
                  <span className="text-emerald-600 flex items-center gap-1 text-xl">
                    <CheckCircle2 className="size-5" /> Chuẩn 100%
                  </span>
                ) : (
                  <span className="text-rose-600">{auditBreakdown.katexErrors} lỗi</span>
                )}
              </p>
              <p className="text-[11px] text-muted">Dấu ngoặc, \frac, inline $...$</p>
            </div>
            <span className="text-[10px] font-bold text-indigo-700">Strict mode compliant</span>
          </div>

          <div className="flex flex-col justify-between rounded-3xl border-2 border-border/80 bg-surface p-4 shadow-clay">
            <div className="flex items-center gap-2 text-amber-600">
              <span className="text-xl">🔢</span>
              <p className="text-xs font-black uppercase tracking-wider">Tính nhất quán</p>
            </div>
            <div className="my-2">
              <p className="font-display text-2xl font-black text-text">
                {auditBreakdown.mathInconsistencies === 0 ? (
                  <span className="text-emerald-600 flex items-center gap-1 text-xl">
                    <CheckCircle2 className="size-5" /> Hoàn hảo
                  </span>
                ) : (
                  <span className="text-amber-600">{auditBreakdown.mathInconsistencies} cảnh báo</span>
                )}
              </p>
              <p className="text-[11px] text-muted">Không trùng đáp án, distractor chuẩn</p>
            </div>
            <span className="text-[10px] font-bold text-amber-700">Không có đáp án rác/dummy</span>
          </div>

          <div className="flex flex-col justify-between rounded-3xl border-2 border-border/80 bg-surface p-4 shadow-clay">
            <div className="flex items-center gap-2 text-emerald-600">
              <span className="text-xl">🐾</span>
              <p className="text-xs font-black uppercase tracking-wider">Cấu trúc sư phạm</p>
            </div>
            <div className="my-2">
              <p className="font-display text-2xl font-black text-text">
                {auditBreakdown.pedagogicalWarnings === 0 ? (
                  <span className="text-emerald-600 flex items-center gap-1 text-xl">
                    <CheckCircle2 className="size-5" /> Đủ 3 bước
                  </span>
                ) : (
                  <span className="text-amber-600">{auditBreakdown.pedagogicalWarnings} thiếu bước</span>
                )}
              </p>
              <p className="text-[11px] text-muted">Phân tích · Công thức · Kết luận</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-700">Mèo Mee hint định hướng</span>
          </div>

          <div className="flex flex-col justify-between rounded-3xl border-2 border-border/80 bg-surface p-4 shadow-clay">
            <div className="flex items-center gap-2 text-sky-600">
              <span className="text-xl">🏷️</span>
              <p className="text-xs font-black uppercase tracking-wider">Domain & 3D Spec</p>
            </div>
            <div className="my-2">
              <p className="font-display text-2xl font-black text-text">
                {auditBreakdown.taxonomyIssues === 0 ? (
                  <span className="text-emerald-600 flex items-center gap-1 text-xl">
                    <CheckCircle2 className="size-5" /> Chuẩn hoá
                  </span>
                ) : (
                  <span className="text-amber-600">{auditBreakdown.taxonomyIssues} vấn đề</span>
                )}
              </p>
              <p className="text-[11px] text-muted">Khớp topicCode & VisualSpec</p>
            </div>
            <span className="text-[10px] font-bold text-sky-700">5 Phân loại Olympic</span>
          </div>
        </div>
      </div>

      {/* Audit Exams Table */}
      <div className="rounded-3xl border-2 border-border/80 bg-surface p-5 shadow-clay">
        <h3 className="font-display text-base font-black text-text mb-4">
          Kết Quả Kiểm Định Từng Đề Thi ({auditResults.length} đề tiêu biểu)
        </h3>

        <div className="space-y-3">
          {auditResults.map(({ exam, result }) => (
            <div
              key={exam.id}
              className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border-2 border-border/80 bg-white p-4 shadow-sm hover:shadow-clay transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-2xl font-black text-sm border shadow-sm',
                    result.qualityScore >= 90
                      ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                      : result.qualityScore >= 75
                        ? 'border-amber-300 bg-amber-100 text-amber-800'
                        : 'border-rose-300 bg-rose-100 text-rose-800',
                  )}
                >
                  {result.qualityScore}%
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-muted">{exam.code}</span>
                    <span className="rounded-lg bg-brand-50 px-2 py-0.2 text-[10px] font-black text-brand-700">
                      {exam.questions.length} câu hỏi
                    </span>
                    <span className="text-[11px] text-muted">
                      {result.formulasChecked} công thức KaTeX
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-text line-clamp-1">{exam.title}</h4>
                </div>
              </div>

              {/* Badges & Actions */}
              <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                {result.errorCount > 0 && (
                  <span className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-700">
                    <AlertCircle className="size-3.5" />
                    {result.errorCount} lỗi
                  </span>
                )}
                {result.warningCount > 0 && (
                  <span className="flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700">
                    <AlertTriangle className="size-3.5" />
                    {result.warningCount} cảnh báo
                  </span>
                )}
                {result.errorCount === 0 && result.warningCount === 0 && (
                  <span className="flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                    <CheckCircle2 className="size-3.5" />
                    Hoàn hảo
                  </span>
                )}

                {/* Quick Repair Button */}
                {repairedExamIds.has(exam.id) ? (
                  <button
                    type="button"
                    onClick={() => onQuickRepair(exam)}
                    disabled={repairingExamId === exam.id}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800 shadow-sm transition-all hover:bg-emerald-100 cursor-pointer disabled:opacity-60"
                    title="Đề thi đã được chuẩn hóa KaTeX và lời giải 3 bước. Nhấp để chuẩn hóa lại nếu cần."
                  >
                    {repairingExamId === exam.id ? (
                      <>
                        <RotateCcw className="size-3 animate-spin text-emerald-700" />
                        <span>Đang chuẩn hóa...</span>
                      </>
                    ) : (
                      <>
                        <span>✅ Đã chuẩn hóa</span>
                      </>
                    )}
                  </button>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={repairingExamId === exam.id}
                    onClick={() => onQuickRepair(exam)}
                    className={cn(
                      'gap-1.5 rounded-xl border text-xs font-black shadow-sm transition-all cursor-pointer',
                      repairingExamId === exam.id
                        ? 'border-amber-400 bg-amber-100 text-amber-900 opacity-80'
                        : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100',
                    )}
                    title="Tự động chuẩn hóa KaTeX và bổ sung 3 bước sư phạm"
                  >
                    {repairingExamId === exam.id ? (
                      <>
                        <RotateCcw className="size-3 animate-spin text-amber-700" />
                        <span>Đang chuẩn hóa...</span>
                      </>
                    ) : (
                      <>
                        <Wrench className="size-3" />
                        <span>Sửa nhanh KaTeX</span>
                      </>
                    )}
                  </Button>
                )}

                {/* Audit Details Modal Trigger */}
                <Button
                  type="button"
                  onClick={() => onOpenAuditDetail(exam)}
                  className="gap-1 rounded-xl border-2 border-brand-600 bg-brand-500 text-xs font-black text-white hover:bg-brand-600 shadow-clay"
                >
                  <Eye className="size-3" />
                  <span>Xem lỗi chi tiết</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
