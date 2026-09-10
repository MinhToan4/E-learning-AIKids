import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import type {
  AsmoSubject,
  AsmoGrade,
  AsmoTemplateKey,
} from '@/features/asmo/types'
import { AsmoFormula } from '@/features/asmo/components/AsmoFormula'
import type {
  AsmoCurriculumWeekItem,
  CurriculumWeekEditModalProps,
  CurriculumImportModalProps,
  CurriculumGeneratorPreviewModalProps,
  RegulationEditModalProps,
  QuestionsDetailModalProps,
} from './types'
import { TEMPLATE_3D_LABELS } from './constants'
import { validateCurriculumJson } from './curriculum-utils'

/* ── 1. REGULATION EDIT MODAL ── */
export function AsmoRegulationEditModal({
  isOpen,
  exam,
  onClose,
  onSave,
}: RegulationEditModalProps) {
  if (!isOpen || !exam || typeof document === 'undefined') return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-lg rounded-3xl border-2 border-border/80 bg-surface p-6 shadow-clay animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b-2 border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            <h3 className="font-display text-lg font-black text-text">
              Chỉnh Quy Chế Phòng Thi
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted hover:bg-slate-100 hover:text-text cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={onSave} className="mt-4 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-muted uppercase">Tên đề thi</label>
            <input
              name="title"
              defaultValue={exam.title}
              required
              className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted uppercase">Vòng thi (Round)</label>
              <input
                name="round"
                defaultValue={exam.round}
                required
                className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted uppercase">Năm tổ chức</label>
              <input
                type="number"
                name="year"
                defaultValue={exam.year}
                required
                className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted uppercase">Thời lượng (phút)</label>
              <input
                type="number"
                name="durationMinutes"
                defaultValue={exam.durationMinutes}
                required
                min={10}
                max={180}
                className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted uppercase">Điểm đỗ (Pass)</label>
              <input
                type="number"
                name="passScore"
                defaultValue={exam.passScore}
                required
                min={1}
                className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted uppercase">Tổng điểm</label>
              <input
                type="number"
                name="totalPoints"
                defaultValue={exam.totalPoints}
                required
                min={10}
                className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted uppercase">Mô tả đề thi</label>
            <textarea
              name="description"
              defaultValue={exam.description}
              rows={3}
              className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
            />
          </div>

          <div className="mt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="rounded-2xl font-bold"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="rounded-2xl border-2 border-brand-600 bg-brand-500 font-black text-white shadow-clay hover:bg-brand-600"
            >
              Lưu quy chế
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

/* ── 2. QUESTIONS DETAIL MODAL ── */
export function AsmoQuestionsDetailModal({
  isOpen,
  exam,
  onClose,
}: QuestionsDetailModalProps) {
  if (!isOpen || !exam || typeof document === 'undefined') return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl border-2 border-border/80 bg-surface shadow-clay animate-in zoom-in-95 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-border/80 bg-gradient-to-r from-brand-50 to-white px-6 py-4">
          <div>
            <span className="rounded-xl border border-brand-200 bg-brand-100 px-2.5 py-0.5 text-xs font-black text-brand-800">
              {exam.code}
            </span>
            <h3 className="mt-1 font-display text-lg font-black text-text">
              Chi Tiết Câu Hỏi & Đáp Án KaTeX ({exam.questions?.length ?? 0} câu)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted hover:bg-slate-100 hover:text-text cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Questions Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {exam.questions && exam.questions.length > 0 ? (
            exam.questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="rounded-3xl border-2 border-border/80 bg-white p-5 shadow-sm space-y-4"
              >
                {/* Question Title & Meta */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-xl bg-brand-500 font-black text-xs text-white shadow-sm">
                      {idx + 1}
                    </span>
                    <span className="font-display font-black text-sm text-text">
                      {q.title || `Câu hỏi ${idx + 1}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                      {q.topicName || q.topicCode}
                    </span>
                    <span className="rounded-lg bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-black text-amber-700">
                      {q.points} điểm
                    </span>
                  </div>
                </div>

                {/* Question Text with KaTeX */}
                <div className="rounded-2xl border-2 border-slate-100 bg-slate-50/70 p-4 text-sm text-text leading-relaxed">
                  <AsmoFormula text={q.text} />
                </div>

                {/* Options List */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt) => {
                      const isCorrect =
                        opt.id.trim().toUpperCase() === q.correctAnswer?.trim().toUpperCase() ||
                        opt.label.trim().toUpperCase() === q.correctAnswer?.trim().toUpperCase()

                      return (
                        <div
                          key={opt.id}
                          className={cn(
                            'flex items-center gap-3 rounded-2xl border-2 p-3 text-xs font-bold transition-all',
                            isCorrect
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-900 shadow-sm'
                              : 'border-border/60 bg-white text-text',
                          )}
                        >
                          <span
                            className={cn(
                              'flex size-7 shrink-0 items-center justify-center rounded-xl text-xs font-black border',
                              isCorrect
                                ? 'border-emerald-400 bg-emerald-500 text-white'
                                : 'border-slate-300 bg-slate-100 text-slate-700',
                            )}
                          >
                            {opt.label}
                          </span>
                          <div className="flex-1">
                            <AsmoFormula text={opt.text} />
                          </div>
                          {isCorrect && (
                            <span className="rounded-lg bg-emerald-200 px-2 py-0.5 text-[10px] font-black text-emerald-900">
                              Đáp án đúng
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Mèo Mee Hint */}
                {q.meeHint && (
                  <div className="flex items-start gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-3.5 shadow-sm">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-xl shadow-clay">
                      🐱
                    </div>
                    <div className="flex-1 text-xs">
                      <span className="font-black text-amber-900">Mèo Mee Định Hướng:</span>
                      <p className="mt-0.5 font-bold text-amber-800 leading-relaxed">
                        {typeof q.meeHint === 'string'
                          ? q.meeHint
                          : (q.meeHint as { text?: string })?.text}
                      </p>
                    </div>
                  </div>
                )}

                {/* Pedagogical Explanation Steps (KaTeX) */}
                {q.explanationSteps && q.explanationSteps.length > 0 ? (
                  <div className="space-y-2 rounded-2xl border-2 border-indigo-100 bg-indigo-50/40 p-4">
                    <p className="text-xs font-black uppercase text-indigo-900 tracking-wider">
                      Lời giải sư phạm 3 bước (KaTeX chuẩn hóa):
                    </p>
                    <div className="space-y-2 text-xs">
                      {q.explanationSteps.map((step) => (
                        <div
                          key={step.stepIndex}
                          className="rounded-xl border border-indigo-200 bg-white p-3 shadow-xs"
                        >
                          <p className="font-black text-indigo-700">{step.title}</p>
                          <div className="mt-1 text-text leading-relaxed">
                            <AsmoFormula text={step.description} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : q.explanation ? (
                  <div className="rounded-2xl border-2 border-border/80 bg-slate-50 p-4 text-xs">
                    <p className="font-black text-brand-700">Lời giải chi tiết:</p>
                    <div className="mt-1 text-text leading-relaxed">
                      <AsmoFormula text={q.explanation} />
                    </div>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-border/80 p-8 text-center text-muted text-sm font-bold">
              Chưa có câu hỏi trong đề này.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end border-t-2 border-border/80 bg-white px-6 py-3">
          <Button
            type="button"
            onClick={onClose}
            className="rounded-2xl font-black"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/* ── 3. CURRICULUM WEEK EDIT / CREATE MODAL ── */
export function CurriculumWeekEditModal({
  isOpen,
  onClose,
  initialData,
  isNew = false,
  onSave,
}: CurriculumWeekEditModalProps) {
  const [title, setTitle] = useState(initialData.title)
  const [week, setWeek] = useState(initialData.week)
  const [subject, setSubject] = useState<AsmoSubject>(initialData.subject)
  const [grade, setGrade] = useState<AsmoGrade>(initialData.grade)
  const [topic, setTopic] = useState(initialData.topic)
  const [summary, setSummary] = useState(initialData.summary)
  const [keyCompetencies, setKeyCompetencies] = useState<string[]>(initialData.keyCompetencies || [])
  const [newTagInput, setNewTagInput] = useState('')
  const [visualTemplate, setVisualTemplate] = useState<AsmoTemplateKey | ''>(
    initialData.visualTemplate || '',
  )
  const [quote, setQuote] = useState(initialData.meeTip?.quote || '')
  const [storyAdvice, setStoryAdvice] = useState(initialData.meeTip?.storyAdvice || '')

  if (!isOpen || typeof document === 'undefined') return null

  const handleAddTag = () => {
    const trimmed = newTagInput.trim()
    if (trimmed && !keyCompetencies.includes(trimmed)) {
      setKeyCompetencies([...keyCompetencies, trimmed])
      setNewTagInput('')
    }
  }

  const handleRemoveTag = (indexToRemove: number) => {
    setKeyCompetencies(keyCompetencies.filter((_, idx) => idx !== indexToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...initialData,
      title,
      week,
      subject,
      grade,
      topic,
      summary,
      keyCompetencies,
      visualTemplate: visualTemplate ? (visualTemplate as AsmoTemplateKey) : undefined,
      meeTip: quote || storyAdvice ? { quote, storyAdvice } : undefined,
    })
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-2xl rounded-3xl border-2 border-border/80 bg-surface p-6 shadow-clay animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b-2 border-border/80 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{isNew ? '➕' : '✏️'}</span>
            <div>
              <h3 className="font-display text-lg font-black text-text">
                {isNew ? 'Thêm Tuần Học Mới' : 'Chỉnh Sửa Tuần Học'}
              </h3>
              <p className="text-xs text-muted font-bold">
                {isNew ? 'Khởi tạo cấu trúc tuần học chuẩn ASMO' : `Tuần ${week}: ${title || 'Chưa đặt tên'}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted hover:bg-slate-100 hover:text-text cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-black text-muted uppercase">Tiêu đề tuần học</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ví dụ: Đếm Khối Lập Phương 3D & Không Gian Đa Chiều"
                className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-muted uppercase">Tuần số (Week)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={week}
                onChange={(e) => setWeek(Number(e.target.value))}
                required
                className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black text-muted uppercase">Môn học</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as AsmoSubject)}
                className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none cursor-pointer"
              >
                <option value="math">📐 Toán Olympic</option>
                <option value="science">🔬 Khoa Học Tự Nhiên</option>
                <option value="english">🔤 Tiếng Anh Học Thuật</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-muted uppercase">Khối lớp</label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value) as AsmoGrade)}
                className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                  <option key={g} value={g}>
                    Lớp {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-muted uppercase">Mã chuyên đề (Topic)</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                placeholder="ASMO-MATH-G1-W01"
                className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-muted uppercase">Tóm tắt nội dung sư phạm</label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Tóm tắt trọng tâm bài học và mục tiêu hình thành tư duy..."
              className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Key Competencies Chip Manager */}
          <div>
            <label className="block text-xs font-black text-muted uppercase mb-1">
              Năng lực trọng tâm (Key Competencies)
            </label>
            <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border-2 border-border/80 bg-white p-2.5 min-h-[44px]">
              {keyCompetencies.map((tag, idx) => (
                <span
                  key={`${tag}-${idx}`}
                  className="inline-flex items-center gap-1 rounded-xl border border-brand-200 bg-brand-50 px-2 py-1 text-xs font-bold text-brand-800 shadow-xs"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="text-brand-500 hover:text-red-500 ml-0.5 cursor-pointer font-black"
                    title={`Xóa "${tag}"`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Thêm năng lực..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  className="rounded-xl border border-border/80 px-2 py-1 text-xs font-medium text-text focus:border-brand-400 focus:outline-none"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddTag}
                  className="rounded-xl text-xs py-1 px-2.5 font-bold"
                >
                  + Thêm
                </Button>
              </div>
            </div>
          </div>

          {/* Visual Template Dropdown */}
          <div>
            <label className="block text-xs font-black text-muted uppercase mb-1">
              Mẫu 3D Lab tương tác (Visual Template)
            </label>
            <select
              value={visualTemplate}
              onChange={(e) => setVisualTemplate(e.target.value as AsmoTemplateKey | '')}
              className="w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none cursor-pointer"
            >
              <option value="">Không sử dụng mô hình 3D (Lý thuyết cơ bản)</option>
              {Object.entries(TEMPLATE_3D_LABELS).map(([k, meta]) => (
                <option key={k} value={k}>
                  {meta.icon} {meta.label} — {meta.desc}
                </option>
              ))}
            </select>
          </div>

          {/* Mèo Mee Tips Section */}
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-3.5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐱</span>
              <span className="text-xs font-black text-amber-900 uppercase">
                Bí Kíp & Lời Khuyên Mèo Mee
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-amber-800">
                Câu khẩu hiệu Mèo Mee (Quote)
              </label>
              <input
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Ví dụ: Nhìn hình vẽ kỹ, chớ vội tính ngay; đếm từng góc cạnh, lời giải mở ra tay!"
                className="mt-1 w-full rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-amber-800">
                Lời khuyên tư duy & Mẹo nhận diện bẫy (Story Advice)
              </label>
              <textarea
                rows={2}
                value={storyAdvice}
                onChange={(e) => setStoryAdvice(e.target.value)}
                placeholder="Ví dụ: Đánh số thứ tự các khối theo từng tầng từ dưới lên để không bỏ sót..."
                className="mt-1 w-full rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-text focus:border-brand-400 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t-2 border-border/80 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="rounded-2xl font-black text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs shadow-clay"
            >
              {isNew ? 'Tạo tuần học' : 'Lưu tuần học'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

/* ── 4. CURRICULUM IMPORT MODAL ── */
export function CurriculumImportModal({
  isOpen,
  onClose,
  onImport,
  onDownloadTemplate,
}: CurriculumImportModalProps) {
  const [jsonText, setJsonText] = useState('')
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [validData, setValidData] = useState<AsmoCurriculumWeekItem[] | null>(null)

  if (!isOpen || typeof document === 'undefined') return null

  const handleJsonChange = (text: string) => {
    setJsonText(text)
    if (!text.trim()) {
      setValidationError(null)
      setValidData(null)
      return
    }
    const res = validateCurriculumJson(text)
    if (res.isValid && res.data) {
      setValidationError(null)
      setValidData(res.data)
    } else {
      setValidationError(res.error || 'Dữ liệu JSON không hợp lệ')
      setValidData(null)
    }
  }

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        handleJsonChange(content)
      }
      reader.readAsText(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        handleJsonChange(content)
      }
      reader.readAsText(file)
    }
  }

  const handleConfirm = () => {
    if (!validData || validData.length === 0) {
      const res = validateCurriculumJson(jsonText)
      if (!res.isValid || !res.data) {
        setValidationError(res.error || 'Vui lòng kiểm tra lại cấu trúc JSON!')
        return
      }
      onImport(res.data, importMode)
    } else {
      onImport(validData, importMode)
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-xl rounded-3xl border-2 border-border/80 bg-surface p-6 shadow-clay animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b-2 border-border/80 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📥</span>
            <div>
              <h3 className="font-display text-lg font-black text-text">
                Nhập Lộ Trình Học ASMO (Import JSON)
              </h3>
              <p className="text-xs text-muted font-bold">
                Nạp danh sách các tuần chuyên đề tự động từ file JSON
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted hover:bg-slate-100 hover:text-text cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/50 p-5 text-center transition-all hover:bg-sky-50"
          >
            <Upload className="size-8 text-sky-500 mb-2" />
            <p className="text-xs font-black text-sky-900">
              Kéo thả file <code className="rounded bg-sky-200/80 px-1 py-0.5">.json</code> vào đây
            </p>
            <p className="text-[11px] text-muted font-medium mt-1">hoặc</p>
            <label className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-white px-3 py-1 text-xs font-black text-sky-700 shadow-xs cursor-pointer hover:bg-sky-50">
              <span>Chọn file từ máy</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Paste JSON Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-black text-muted uppercase">
                Hoặc dán chuỗi JSON trực tiếp
              </label>
              <button
                type="button"
                onClick={onDownloadTemplate}
                className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download className="size-3" />
                <span>Tải mẫu JSON chuẩn</span>
              </button>
            </div>
            <textarea
              rows={6}
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              placeholder="[&#10;  {&#10;    &quot;week&quot;: 1,&#10;    &quot;subject&quot;: &quot;math&quot;,&#10;    &quot;grade&quot;: 1,&#10;    &quot;title&quot;: &quot;Đếm Khối Lập Phương 3D&quot;&#10;  }&#10;]"
              className="w-full font-mono rounded-2xl border-2 border-border/80 bg-white p-3 text-xs font-medium text-text focus:border-brand-400 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Schema Validator Status */}
          {validationError && (
            <div className="flex items-start gap-2.5 rounded-2xl border-2 border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700 animate-in fade-in">
              <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-600" />
              <span>{validationError}</span>
            </div>
          )}

          {validData && (
            <div className="flex items-center gap-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-3 text-xs font-black text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              <span>Dữ liệu hợp lệ! Đã phát hiện {validData.length} tuần học sẵn sàng nạp.</span>
            </div>
          )}

          {/* Mode Selector */}
          <div className="rounded-2xl border-2 border-border/80 bg-slate-50 p-3">
            <span className="block text-xs font-black text-muted uppercase mb-2">
              Chế độ nạp dữ liệu:
            </span>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-text cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="accent-brand-500"
                />
                <span>Ghi đè toàn bộ lộ trình</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-text cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="append"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                  className="accent-brand-500"
                />
                <span>Gộp thêm vào lộ trình hiện có</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 border-t-2 border-border/80 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="rounded-2xl font-black text-xs"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={Boolean(validationError) || !jsonText.trim()}
              className="rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-black text-xs shadow-clay cursor-pointer"
            >
              Xác nhận Nhập Lộ Trình
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/* ── 5. CURRICULUM GENERATOR PREVIEW MODAL ── */
export function CurriculumGeneratorPreviewModal({
  isOpen,
  onClose,
  week,
  initialGenerated,
  onApply,
}: CurriculumGeneratorPreviewModalProps) {
  const [quote, setQuote] = useState(initialGenerated.quote)
  const [storyAdvice, setStoryAdvice] = useState(initialGenerated.storyAdvice)
  const [solutionSteps, setSolutionSteps] = useState<string[]>(initialGenerated.solutionSteps)
  const [commonPitfall, setCommonPitfall] = useState(initialGenerated.commonPitfall)

  if (!isOpen || typeof document === 'undefined') return null

  const handleStepChange = (index: number, val: string) => {
    const next = [...solutionSteps]
    next[index] = val
    setSolutionSteps(next)
  }

  const handleConfirmApply = () => {
    onApply({
      quote,
      storyAdvice,
      solutionSteps,
      commonPitfall,
    })
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-2xl rounded-3xl border-2 border-border/80 bg-surface p-6 shadow-clay animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b-2 border-border/80 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🪄</span>
            <div>
              <h3 className="font-display text-lg font-black text-text">
                Xem Trước & Tinh Chỉnh Bí Kíp Sư Phạm (Smart Generator)
              </h3>
              <p className="text-xs text-muted font-bold">
                Tuần {week.week}: {week.title} · Lớp {week.grade} ·{' '}
                {week.subject === 'math' ? 'Toán' : week.subject === 'science' ? 'Khoa Học' : 'Tiếng Anh'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted hover:bg-slate-100 hover:text-text cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {/* Quote Section */}
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐱</span>
              <label className="text-xs font-black text-amber-900 uppercase">
                Câu khẩu hiệu truyền cảm hứng Mèo Mee
              </label>
            </div>
            <input
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
            />
          </div>

          {/* Story Advice Section */}
          <div>
            <label className="block text-xs font-black text-muted uppercase mb-1">
              Lời khuyên tư duy & Chiến thuật giải nhanh
            </label>
            <textarea
              rows={2}
              value={storyAdvice}
              onChange={(e) => setStoryAdvice(e.target.value)}
              className="w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none leading-relaxed"
            />
          </div>

          {/* 3 Solution Steps with KaTeX Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-indigo-900 uppercase tracking-wider">
                Hướng dẫn giải 3 bước chuẩn ASMO (Hỗ trợ KaTeX)
              </label>
              <span className="rounded-lg bg-indigo-100 text-indigo-800 px-2 py-0.5 text-[10px] font-black">
                KaTeX Live Preview
              </span>
            </div>

            {solutionSteps.map((step, idx) => (
              <div
                key={idx}
                className="rounded-2xl border-2 border-indigo-100 bg-indigo-50/40 p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-800">
                    Bước {idx + 1}
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={step}
                  onChange={(e) => handleStepChange(idx, e.target.value)}
                  className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-text focus:border-brand-400 focus:outline-none"
                />
                <div className="rounded-xl border border-indigo-200/80 bg-white/90 p-2.5 text-xs">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase block mb-0.5">
                    Hiển thị công thức:
                  </span>
                  <AsmoFormula text={step} />
                </div>
              </div>
            ))}
          </div>

          {/* Common Pitfall */}
          <div>
            <label className="block text-xs font-black text-amber-900 uppercase mb-1">
              Bẫy tư duy học sinh thường gặp
            </label>
            <textarea
              rows={2}
              value={commonPitfall}
              onChange={(e) => setCommonPitfall(e.target.value)}
              className="w-full rounded-2xl border-2 border-amber-200 bg-amber-50/40 px-3 py-2 text-xs font-bold text-amber-900 focus:border-brand-400 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 border-t-2 border-border/80 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="rounded-2xl font-black text-xs"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleConfirmApply}
              className="rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs shadow-clay flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="size-4" />
              <span>Áp dụng vào tuần học</span>
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
