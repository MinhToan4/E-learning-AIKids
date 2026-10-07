import React from 'react'
import { BrainCircuit, Trash2, Plus, Upload, Image as ImageIcon, Lightbulb, CheckCircle2 } from 'lucide-react'
import type { LessonSixStageJourney } from '@/shared/lib/api'
import { uploadCmsCourseMedia } from '@/shared/lib/media-api'
import { cn } from '@/shared/lib/cn'

export interface QuizBlockEditorProps {
  quiz: LessonSixStageJourney['stage4_quiz']
  onChange: (patch: Partial<LessonSixStageJourney['stage4_quiz']>) => void
  readOnly?: boolean
  questId?: string
  showToast?: (message: string, tone?: 'success' | 'error' | 'info') => void
}

/**
 * QuizBlockEditor — Form soạn thảo Chặng Trắc Nghiệm Thử Tài (Stage 4 / Quiz Block).
 * Trình bày dạng thẻ Hallmark Soft Clay WYSIWYG khớp 100% với trải nghiệm của học sinh.
 * Quản lý: Tiêu đề bài test, điểm đạt tối thiểu, danh sách câu hỏi, phương án, đáp án đúng & giải thích.
 */
export function QuizBlockEditor({
  quiz,
  onChange,
  readOnly = false,
  questId,
  showToast,
}: QuizBlockEditorProps) {
  const questions = quiz.questions || []
  const [uploadingQIdx, setUploadingQIdx] = React.useState<number | null>(null)

  const handleAddQuestion = () => {
    if (readOnly) return
    const nextQs = [...questions]
    nextQs.push({
      id: `q-${Date.now().toString(36)}`,
      prompt: 'Câu hỏi mới?',
      options: ['Đáp án đúng', 'Đáp án sai'],
      correctIndex: 0,
      explanation: 'Giải thích vì sao đáp án này chính xác...',
    })
    onChange({ questions: nextQs })
    showToast?.('Đã thêm câu hỏi trắc nghiệm mới!', 'success')
  }

  const handleRemoveQuestion = (idx: number) => {
    if (readOnly) return
    const nextQs = questions.filter((_, i) => i !== idx)
    onChange({ questions: nextQs })
  }

  return (
    <div className="space-y-5 rounded-3xl border-2 border-brand-200 bg-white p-5 shadow-clay-xs">
      {/* Header Chặng */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-sky-500 text-white shadow-xs">
            <BrainCircuit size={20} />
          </span>
          <div>
            <h4 className="text-sm font-black text-slate-900 tracking-wide">
              Thử Tài Trắc Nghiệm (Quiz Block)
            </h4>
            <p className="text-xs font-semibold text-slate-500">
              Bộ câu hỏi trắc nghiệm tương tác kiểm tra mức độ tiếp thu kiến thức sau video
            </p>
          </div>
        </div>
        <span className="rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-black text-sky-800">
          {questions.length} câu hỏi
        </span>
      </div>

      {/* Cấu hình chung của Bài Test */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50/60 p-4">
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
            Tiêu đề bài kiểm tra
          </label>
          <input
            type="text"
            value={quiz.title || ''}
            disabled={readOnly}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="VD: Thử tài 4 Chìa Khóa Vàng"
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 shadow-2xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
            Điểm đạt tối thiểu để qua chặng (số câu đúng)
          </label>
          <input
            type="number"
            min={1}
            max={Math.max(questions.length, 1)}
            value={quiz.passScore ?? 1}
            disabled={readOnly}
            onChange={(e) => onChange({ passScore: parseInt(e.target.value, 10) || 1 })}
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 shadow-2xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
          />
        </div>
      </div>

      {/* Danh sách câu hỏi dạng thẻ WYSIWYG */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700">
            Danh sách câu hỏi ({questions.length})
          </label>
          {!readOnly && (
            <button
              type="button"
              onClick={handleAddQuestion}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-300 bg-brand-50 px-3 py-1 text-xs font-black text-brand-800 hover:bg-brand-100 transition cursor-pointer shadow-2xs"
            >
              <Plus size={14} />
              <span>Thêm câu hỏi mới</span>
            </button>
          )}
        </div>

        {questions.map((q, qIdx) => (
          <div
            key={q.id || qIdx}
            className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-3.5 shadow-2xs hover:border-slate-300 transition"
          >
            {/* Header Câu Hỏi */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <span className="px-2.5 py-0.5 rounded-lg bg-sky-100 text-sky-900 text-xs font-black tracking-wide">
                Câu hỏi #{qIdx + 1}
              </span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(qIdx)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                  title="Xóa câu hỏi này"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>

            {/* Đề bài câu hỏi */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                Nội dung câu hỏi *
              </label>
              <input
                type="text"
                value={q.prompt}
                disabled={readOnly}
                onChange={(e) => {
                  const nextQs = [...questions]
                  nextQs[qIdx] = { ...nextQs[qIdx], prompt: e.target.value }
                  onChange({ questions: nextQs })
                }}
                placeholder="VD: Trong 4 Chìa Khóa, chìa nào quyết định bức tranh vẽ AI hoặc CÁI GÌ?"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-brand-500 focus:bg-white transition"
              />
            </div>

            {/* Ảnh minh họa câu hỏi nếu có */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={q.visualUrl || ''}
                  disabled={readOnly}
                  onChange={(e) => {
                    const nextQs = [...questions]
                    nextQs[qIdx] = { ...nextQs[qIdx], visualUrl: e.target.value }
                    onChange({ questions: nextQs })
                  }}
                  placeholder="URL ảnh minh họa cho câu hỏi (tùy chọn)..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-mono text-slate-700 outline-none focus:border-brand-500 focus:bg-white transition"
                />
              </div>
              {!readOnly && (
                <label className="inline-flex items-center gap-1 rounded-xl bg-sky-50 border border-sky-200 px-3 py-1.5 text-xs font-bold text-sky-800 hover:bg-sky-100 cursor-pointer shadow-2xs shrink-0">
                  <Upload size={13} />
                  <span>{uploadingQIdx === qIdx ? 'Đang tải…' : 'Tải ảnh'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingQIdx !== null}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setUploadingQIdx(qIdx)
                      try {
                        const res = await uploadCmsCourseMedia({ file, purpose: 'island_quiz_visual', questId })
                        if (res?.url) {
                          const nextQs = [...questions]
                          nextQs[qIdx] = { ...nextQs[qIdx], visualUrl: res.url }
                          onChange({ questions: nextQs })
                          showToast?.('Đã tải ảnh câu hỏi lên!', 'success')
                        }
                      } finally {
                        setUploadingQIdx(null)
                      }
                    }}
                  />
                </label>
              )}
            </div>

            {/* Các phương án lựa chọn WYSIWYG */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Các phương án lựa chọn (Click chọn nút để đặt đáp án đúng):
                </p>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextQs = [...questions]
                      const nextOpts = [...nextQs[qIdx].options, 'Phương án mới']
                      nextQs[qIdx] = { ...nextQs[qIdx], options: nextOpts }
                      onChange({ questions: nextQs })
                    }}
                    className="text-[11px] font-bold text-sky-700 hover:text-sky-900 cursor-pointer"
                  >
                    + Thêm phương án
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.options.map((opt, optIdx) => {
                  const isOptCorrect = q.correctIndex === optIdx
                  const optLetter = String.fromCharCode(65 + optIdx)

                  return (
                    <div
                      key={optIdx}
                      className={cn(
                        'flex items-center gap-2 rounded-xl border-2 p-2 transition shadow-2xs',
                        isOptCorrect
                          ? 'border-mint-500 bg-mint-50/80 ring-2 ring-mint-300/70'
                          : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                      )}
                    >
                      {/* Nút radio chọn đáp án đúng */}
                      <button
                        type="button"
                        disabled={readOnly}
                        onClick={() => {
                          const nextQs = [...questions]
                          nextQs[qIdx] = { ...nextQs[qIdx], correctIndex: optIdx }
                          onChange({ questions: nextQs })
                        }}
                        className={cn(
                          'flex items-center justify-center size-6 rounded-lg text-xs font-black shrink-0 transition cursor-pointer',
                          isOptCorrect
                            ? 'bg-mint-600 text-white shadow-xs'
                            : 'bg-white border border-slate-300 text-slate-600 hover:border-mint-400'
                        )}
                        title={isOptCorrect ? 'Đây là đáp án đúng' : 'Click để chọn làm đáp án đúng'}
                      >
                        {optLetter}
                      </button>

                      {/* Text phương án */}
                      <input
                        type="text"
                        value={opt}
                        disabled={readOnly}
                        onChange={(e) => {
                          const nextQs = [...questions]
                          const nextOpts = [...nextQs[qIdx].options]
                          nextOpts[optIdx] = e.target.value
                          nextQs[qIdx] = { ...nextQs[qIdx], options: nextOpts }
                          onChange({ questions: nextQs })
                        }}
                        placeholder={`Phương án ${optLetter}...`}
                        className="flex-1 bg-transparent px-1 py-0.5 text-xs font-bold text-slate-800 outline-none"
                      />

                      {/* Badge đúng / sai */}
                      {isOptCorrect && (
                        <span className="flex items-center gap-0.5 text-[10px] font-black text-mint-700 bg-mint-100/90 px-2 py-0.5 rounded-md shrink-0">
                          <CheckCircle2 size={12} className="stroke-[3]" />
                          <span>ĐÚNG</span>
                        </span>
                      )}

                      {/* Nút xóa phương án nếu > 2 options */}
                      {q.options.length > 2 && !readOnly && (
                        <button
                          type="button"
                          onClick={() => {
                            const nextQs = [...questions]
                            const nextOpts = nextQs[qIdx].options.filter((_, i) => i !== optIdx)
                            let nextCorrect = nextQs[qIdx].correctIndex
                            if (nextCorrect === optIdx) nextCorrect = 0
                            else if (nextCorrect > optIdx) nextCorrect -= 1
                            nextQs[qIdx] = { ...nextQs[qIdx], options: nextOpts, correctIndex: nextCorrect }
                            onChange({ questions: nextQs })
                          }}
                          className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer shrink-0"
                          title="Xóa phương án này"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Lời giải thích đáp án */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-2.5">
              <label className="flex items-center gap-1 text-[11px] font-black uppercase text-amber-900 mb-1">
                <Lightbulb size={13} className="text-amber-600" />
                <span>Giải thích vì sao đáp án đúng (Explanation)</span>
              </label>
              <textarea
                rows={2}
                value={q.explanation || ''}
                disabled={readOnly}
                onChange={(e) => {
                  const nextQs = [...questions]
                  nextQs[qIdx] = { ...nextQs[qIdx], explanation: e.target.value }
                  onChange({ questions: nextQs })
                }}
                placeholder="Lời giải thích xuất hiện khi học sinh hoàn thành câu hỏi..."
                className="w-full rounded-lg border border-amber-200 bg-white p-2 text-xs font-semibold text-slate-800 outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>
        ))}

        {!readOnly && (
          <button
            type="button"
            onClick={handleAddQuestion}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/40 py-3.5 text-xs font-black text-sky-800 hover:border-brand-500 hover:bg-sky-50 transition cursor-pointer active:scale-95"
          >
            <Plus size={16} />
            <span>Thêm Câu Hỏi Trắc Nghiệm Mới</span>
          </button>
        )}
      </div>
    </div>
  )
}

export { QuizBlockEditor as Stage4QuizEditor }
