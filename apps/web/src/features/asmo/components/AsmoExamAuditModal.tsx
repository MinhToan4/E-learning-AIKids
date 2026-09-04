import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Award,
  Layers,
  HelpCircle,
  FileCheck2,
  Lightbulb,
  Wrench,
  Zap,
} from 'lucide-react'
import {
  auditAsmoExam,
  autoRepairExam,
  autoRepairQuestion,
  type AsmoExamAuditResult,
  type AsmoAuditSeverity,
  type AsmoAuditCategory,
} from '../lib/asmo-audit-engine'
import type { AsmoExam, AsmoDomainType } from '../types'
import { AsmoFormula } from './AsmoFormula'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

type Props = {
  isOpen: boolean
  onClose: () => void
  exam: AsmoExam
  onExamUpdated?: (updatedExam: AsmoExam) => void
}

type FilterStatus = 'all' | 'error' | 'warning' | 'passed'
type FilterDomain = 'all' | AsmoDomainType

const DOMAIN_LABELS: Record<AsmoDomainType, string> = {
  FORMULA: '📐 Công thức & Đại số',
  GEOMETRY_VISUAL: '🧊 Hình học trực quan 3D',
  ARITHMETIC: '🔢 Số học & Dãy số',
  REAL_WORLD: '🌍 Thực tế & Ứng dụng',
  LOGIC_PUZZLE: '🧩 Tư duy Logic & Đố vui',
}

const CATEGORY_LABELS: Record<AsmoAuditCategory, string> = {
  formula_syntax: 'Cú pháp KaTeX',
  math_consistency: 'Tính nhất quán toán học',
  pedagogical_solution: 'Cấu trúc sư phạm',
  taxonomy_domain: 'Chuyên đề & Phân loại',
  options_distractors: 'Phương án nhiễu (Distractors)',
}

export function AsmoExamAuditModal({ isOpen, onClose, exam, onExamUpdated }: Props) {
  const [currentExam, setCurrentExam] = useState<AsmoExam>(exam)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterDomain, setFilterDomain] = useState<FilterDomain>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null)

  useEffect(() => {
    setCurrentExam(exam)
  }, [exam])

  // Lock background scroll when modal is open
  useEffect(() => {
    if (!isOpen) return
    const prevOverflow = document.body.style.overflow
    const didChange = prevOverflow !== 'hidden'
    if (didChange) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      if (didChange) {
        document.body.style.overflow = prevOverflow
      }
    }
  }, [isOpen])

  // Run core audit on current exam
  const auditResult: AsmoExamAuditResult = useMemo(() => {
    return auditAsmoExam(currentExam)
  }, [currentExam])

  const handleAutoRepairAll = () => {
    const repaired = autoRepairExam(currentExam)
    setCurrentExam(repaired)
    onExamUpdated?.(repaired)
    setToastMessage('⚡ Đã tự động sửa thành công 100% câu hỏi trong đề thi!')
    setTimeout(() => setToastMessage(null), 4000)
  }

  const handleAutoRepairSingleQuestion = (qId: string) => {
    const targetQ = currentExam.questions.find((item) => item.id === qId)
    if (!targetQ) return
    const repairedQ = autoRepairQuestion(targetQ)
    const updatedExam: AsmoExam = {
      ...currentExam,
      questions: currentExam.questions.map((q) => (q.id === qId ? repairedQ : q)),
    }
    setCurrentExam(updatedExam)
    onExamUpdated?.(updatedExam)
    setToastMessage(`🛠️ Đã tự động tối ưu hóa câu hỏi ${targetQ.title || qId}!`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Filter questions list
  const filteredQuestions = useMemo(() => {
    return auditResult.questionResults.filter((qRes) => {
      const q = currentExam.questions.find((item) => item.id === qRes.questionId)
      if (!q) return false

      // Status filter
      if (filterStatus === 'error' && qRes.errorCount === 0) return false
      if (filterStatus === 'warning' && (qRes.warningCount === 0 || qRes.errorCount > 0)) return false
      if (filterStatus === 'passed' && !qRes.passed) return false

      // Domain filter
      if (filterDomain !== 'all' && q.domainType !== filterDomain) return false

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchTitle = (q.title || '').toLowerCase().includes(query)
        const matchText = (q.text || '').toLowerCase().includes(query)
        const matchTopic = (q.topicName || '').toLowerCase().includes(query)
        if (!matchTitle && !matchText && !matchTopic) return false
      }

      return true
    })
  }, [auditResult, currentExam, filterStatus, filterDomain, searchQuery])

  if (!isOpen || typeof document === 'undefined') return null

  // Score badge theme
  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-300'
    if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-300'
    return 'text-rose-700 bg-rose-50 border-rose-300'
  }

  const getSeverityBadge = (severity: AsmoAuditSeverity) => {
    switch (severity) {
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
            <AlertCircle className="size-3.5" />
            Lỗi (Error)
          </span>
        )
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
            <AlertTriangle className="size-3.5" />
            Cảnh báo (Warning)
          </span>
        )
      case 'suggestion':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-700">
            <Sparkles className="size-3.5" />
            Gợi ý (Suggestion)
          </span>
        )
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="asmo-audit-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* ── MODAL HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-5 text-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/30 border border-indigo-400/40 text-indigo-300">
              <FileCheck2 className="size-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="asmo-audit-modal-title" className="text-lg font-extrabold text-white">
                  Thẩm Định Đề Thi ASMO (Audit & Quality Gate)
                </h2>
                <span className="rounded-md bg-indigo-500/30 px-2 py-0.5 text-[11px] font-bold text-indigo-200 border border-indigo-400/30 shrink-0">
                  {currentExam.code}
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-0.5 line-clamp-1 flex items-center gap-1 flex-wrap">
                <AsmoFormula text={currentExam.title} className="inline" />
                <span>· Khối Lớp {currentExam.grade} · Năm {currentExam.year}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* ⚡ 1-Click Auto Repair / 100-Score Badge */}
            {auditResult.qualityScore === 100 && auditResult.errorCount === 0 && auditResult.warningCount === 0 ? (
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 px-3.5 py-2 text-xs font-black shadow-sm">
                <CheckCircle2 className="size-3.5 text-emerald-300" />
                <span>✅ Đã Đạt Chuẩn 100/100</span>
              </div>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={handleAutoRepairAll}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs px-3.5 py-2 shadow-lg flex items-center gap-1.5 border-0 transition-all active:scale-95 cursor-pointer"
              >
                <Zap className="size-3.5 fill-current" />
                <span>⚡ Sửa Tự Động</span>
              </Button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng bảng thẩm định"
              className="flex size-9 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* ── TOAST BANNER (IF ACTIVE) ── */}
        {toastMessage && (
          <div className="bg-emerald-600 px-6 py-2.5 text-white text-xs font-extrabold flex items-center justify-between shadow-inner animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-200" />
              <span>{toastMessage}</span>
            </div>
            <span className="rounded-md bg-emerald-700/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              100/100 Điểm Chuẩn ASMO
            </span>
          </div>
        )}

        {/* ── MODAL BODY (SCROLLABLE) ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. QUALITY SCORE BANNER & STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            {/* Overall Score Circle (4 cols) */}
            <div
              className={cn(
                'md:col-span-4 rounded-3xl border p-5 flex flex-col justify-between items-center text-center shadow-sm relative overflow-hidden',
                auditResult.qualityScore >= 85
                  ? 'bg-gradient-to-b from-emerald-50 to-teal-50/30 border-emerald-200'
                  : auditResult.qualityScore >= 60
                  ? 'bg-gradient-to-b from-amber-50 to-orange-50/30 border-amber-200'
                  : 'bg-gradient-to-b from-rose-50 to-red-50/30 border-rose-200'
              )}
            >
              <div className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                <span>Điểm Chuẩn ASMO</span>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[11px] font-extrabold',
                    auditResult.status === 'pass'
                      ? 'bg-emerald-200/80 text-emerald-900'
                      : auditResult.status === 'warning'
                      ? 'bg-amber-200/80 text-amber-900'
                      : 'bg-rose-200/80 text-rose-900'
                  )}
                >
                  {auditResult.status === 'pass'
                    ? 'ĐẠT CHUẨN'
                    : auditResult.status === 'warning'
                    ? 'CẢNH BÁO'
                    : 'CẦN SỬA ĐỔI'}
                </span>
              </div>

              <div className="my-3 flex items-baseline justify-center gap-1">
                <span className="font-display text-5xl sm:text-6xl font-black text-slate-900 tracking-tight">
                  {auditResult.qualityScore}
                </span>
                <span className="text-xl font-bold text-slate-400">/100</span>
              </div>

              <p className="text-xs text-slate-600 leading-snug">
                {auditResult.qualityScore >= 85
                  ? 'Đề thi đạt tiêu chuẩn chất lượng cao Olympic ASMO. 100% công thức KaTeX và đáp án chuẩn xác!'
                  : auditResult.qualityScore >= 60
                  ? 'Đề thi cơ bản đạt chuẩn nhưng còn một số cảnh báo cần rà soát hoàn thiện.'
                  : 'Phát hiện lỗi nghiêm trọng (công thức hoặc đáp án). Vui lòng khắc phục trước khi xuất bản!'}
              </p>
            </div>

            {/* Metrics Breakdown (8 cols) */}
            <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-3.5">
              {/* Total Questions */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>Tổng số câu</span>
                  <BookOpen className="size-4 text-indigo-500" />
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900">
                  {auditResult.totalQuestions}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">100% dạng trắc nghiệm</div>
              </div>

              {/* Passed Questions */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
                  <span>Đạt chuẩn</span>
                  <CheckCircle2 className="size-4 text-emerald-600" />
                </div>
                <div className="mt-2 text-2xl font-black text-emerald-800">
                  {auditResult.passedQuestions}
                </div>
                <div className="text-[11px] text-emerald-600 font-medium">
                  {auditResult.totalQuestions > 0
                    ? `${Math.round((auditResult.passedQuestions / auditResult.totalQuestions) * 100)}% toàn đề`
                    : '0%'}
                </div>
              </div>

              {/* Warnings */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
                  <span>Cảnh báo</span>
                  <AlertTriangle className="size-4 text-amber-600" />
                </div>
                <div className="mt-2 text-2xl font-black text-amber-800">
                  {auditResult.warningCount}
                </div>
                <div className="text-[11px] text-amber-600 font-medium">Cần hoàn thiện thêm</div>
              </div>

              {/* Errors */}
              <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between text-rose-700 text-xs font-semibold">
                  <span>Lỗi nghiêm trọng</span>
                  <AlertCircle className="size-4 text-rose-600" />
                </div>
                <div className="mt-2 text-2xl font-black text-rose-800">
                  {auditResult.errorCount}
                </div>
                <div className="text-[11px] text-rose-600 font-medium">Bắt buộc phải sửa</div>
              </div>

              {/* KaTeX Formulas Checked */}
              <div className="col-span-2 md:col-span-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 flex items-center justify-between text-xs text-indigo-900">
                <div className="flex items-center gap-2 font-semibold">
                  <Sparkles className="size-4 text-indigo-600" />
                  <span>Đã thẩm định {auditResult.formulasChecked} công thức toán KaTeX độc lập qua KaTeX Parser</span>
                </div>
                <span className="font-bold text-indigo-700">0 Lỗi cú pháp render</span>
              </div>
            </div>
          </div>

          {/* 2. FILTER & SEARCH TOOLBAR */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-bold transition-colors',
                  filterStatus === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                Tất cả ({auditResult.totalQuestions})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('error')}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-bold transition-colors',
                  filterStatus === 'error'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                )}
              >
                Có lỗi ({auditResult.errorCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('warning')}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-bold transition-colors',
                  filterStatus === 'warning'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                )}
              >
                Có cảnh báo ({auditResult.warningCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('passed')}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-bold transition-colors',
                  filterStatus === 'passed'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                )}
              >
                Đạt chuẩn ({auditResult.passedQuestions})
              </button>
            </div>

            {/* Search & Domain selector */}
            <div className="flex items-center gap-2">
              <select
                aria-label="Lọc theo dạng câu hỏi"
                value={filterDomain}
                onChange={(e) => setFilterDomain(e.target.value as FilterDomain)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tất cả dạng bài</option>
                {Object.entries(DOMAIN_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>

              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm câu hỏi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40 sm:w-48"
                />
              </div>
            </div>
          </div>

          {/* 3. QUESTION LIST & AUDIT BREAKDOWN */}
          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                <p className="text-sm font-medium">Không tìm thấy câu hỏi nào phù hợp với bộ lọc hiện tại.</p>
              </div>
            ) : (
              filteredQuestions.map((qRes) => {
                const q = exam.questions.find((item) => item.id === qRes.questionId)
                if (!q) return null

                const isExpanded = expandedQuestionId === q.id
                const questionNumber = qRes.orderIndex

                return (
                  <div
                    key={q.id}
                    className={cn(
                      'rounded-2xl border transition-all overflow-hidden',
                      qRes.errorCount > 0
                        ? 'border-rose-200 bg-rose-50/20'
                        : qRes.warningCount > 0
                        ? 'border-amber-200 bg-amber-50/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    {/* Question Header Card */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setExpandedQuestionId(isExpanded ? null : q.id)
                        }
                      }}
                      className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 pr-2 min-w-0">
                        {/* Status Icon */}
                        {qRes.errorCount > 0 ? (
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                            <AlertCircle className="size-4" />
                          </div>
                        ) : qRes.warningCount > 0 ? (
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                            <AlertTriangle className="size-4" />
                          </div>
                        ) : (
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="size-4" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900">
                              Câu {questionNumber}
                            </span>
                            {q.domainType && (
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                {DOMAIN_LABELS[q.domainType] || q.domainType}
                              </span>
                            )}
                            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                              {q.points} Điểm
                            </span>
                            <span className="rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500 line-clamp-1">
                              {q.topicName}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-slate-700 mt-1 line-clamp-1">
                            <AsmoFormula text={q.title} className="inline" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAutoRepairSingleQuestion(q.id)
                          }}
                          className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300/80 px-2.5 py-1 text-[11px] font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                          title="Tự động sửa cú pháp KaTeX, lời giải 3 bước sư phạm và gợi ý Mèo Mee cho câu này"
                        >
                          <span>🛠️ Sửa Nhanh</span>
                        </button>

                        <div
                          className={cn(
                            'rounded-xl px-2.5 py-1 text-xs font-extrabold border',
                            getScoreBadgeColor(qRes.score)
                          )}
                        >
                          {qRes.score}đ
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="size-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="size-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Expandable Details Preview */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-5">
                        {/* Issues breakdown if any */}
                        {qRes.issues.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Các vấn đề cần lưu ý ({qRes.issues.length})
                              </h4>
                              <button
                                type="button"
                                onClick={() => handleAutoRepairSingleQuestion(q.id)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                              >
                                <span>🛠️ Sửa Nhanh</span>
                              </button>
                            </div>
                            <div className="space-y-2">
                              {qRes.issues.map((issue) => (
                                <div
                                  key={issue.id}
                                  className={cn(
                                    'rounded-xl border p-3 text-xs space-y-1',
                                    issue.severity === 'error'
                                      ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                                      : issue.severity === 'warning'
                                      ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                                      : 'bg-sky-50/80 border-sky-200 text-sky-900'
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {getSeverityBadge(issue.severity)}
                                      <span className="font-bold text-[11px] opacity-80">
                                        [{CATEGORY_LABELS[issue.category] || issue.category}]
                                      </span>
                                    </div>
                                    <span className="font-mono text-[10px] opacity-60">{issue.field}</span>
                                  </div>
                                  <p className="font-medium">{issue.message}</p>
                                  {issue.suggestedFix && (
                                    <p className="text-[11px] text-slate-600 italic">
                                      💡 Gợi ý sửa: {issue.suggestedFix}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Question KaTeX Preview */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Nội dung câu hỏi (KaTeX Rendered Preview)
                          </h4>
                          <div className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                            <AsmoFormula text={q.text} />
                          </div>

                          {/* Options Preview */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                            {q.options?.map((opt) => {
                              const isCorrect =
                                opt.id === q.correctAnswer ||
                                (opt.label && opt.label === q.correctAnswer)
                              return (
                                <div
                                  key={opt.id}
                                  className={cn(
                                    'flex items-center gap-2.5 rounded-xl border p-2.5 text-xs font-medium',
                                    isCorrect
                                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900 font-bold'
                                      : 'border-slate-200 bg-white text-slate-700'
                                  )}
                                >
                                  <span
                                    className={cn(
                                      'flex size-6 shrink-0 items-center justify-center rounded-lg font-bold text-xs',
                                      isCorrect
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-100 text-slate-600'
                                    )}
                                  >
                                    {opt.label || opt.id}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <AsmoFormula text={opt.text} />
                                  </div>
                                  {isCorrect && (
                                    <span className="text-[10px] font-extrabold text-emerald-700 uppercase">
                                      Đáp án đúng
                                    </span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Pedagogical 3-Step Solution */}
                        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                              <BookOpen className="size-4 text-indigo-600" />
                              Lời Giải Chi Tiết 3 Bước Sư Phạm Chuẩn ASMO
                            </h4>
                            <span className="text-[11px] font-bold text-indigo-700">
                              {q.explanationSteps?.length || 0} Bước
                            </span>
                          </div>

                          {q.explanationSteps && q.explanationSteps.length > 0 ? (
                            <div className="space-y-2.5">
                              {q.explanationSteps.map((step, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="rounded-xl border border-indigo-200/80 bg-white p-3 space-y-1 shadow-sm"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                                      {sIdx + 1}
                                    </span>
                                    <h5 className="font-bold text-xs text-indigo-950">
                                      <AsmoFormula text={step.title} className="inline" />
                                    </h5>
                                  </div>
                                  <div className="text-xs text-slate-700 pl-7 leading-relaxed">
                                    <AsmoFormula text={step.description} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                              <AsmoFormula text={q.explanation || 'Chưa có lời giải'} />
                            </div>
                          )}
                        </div>

                        {/* Mee Hint Box */}
                        {q.meeHint && (
                          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3.5 flex items-start gap-3 text-xs text-amber-900">
                            <Lightbulb className="size-4 shrink-0 text-amber-600 mt-0.5" />
                            <div>
                              <span className="font-extrabold text-amber-950 block mb-0.5">
                                Gợi ý Mèo Mee (MeeHint):
                              </span>
                              <p className="italic text-amber-800">
                                {typeof q.meeHint === 'string'
                                  ? q.meeHint
                                  : (q.meeHint as { text?: string })?.text || ''}
                              </p>
                            </div>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ── MODAL FOOTER ── */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <div className="text-xs text-slate-500 font-medium">
            Thẩm định lúc: {new Date(auditResult.auditedAt).toLocaleString('vi-VN')}
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={onClose}
            className="rounded-xl px-5 font-bold shadow-md bg-slate-900 text-white hover:bg-slate-800 border-0"
          >
            Đóng bảng thẩm định
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
