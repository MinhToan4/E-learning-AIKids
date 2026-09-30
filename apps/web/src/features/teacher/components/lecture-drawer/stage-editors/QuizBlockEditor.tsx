import React from 'react'
import { BrainCircuit, Trash2, Plus } from 'lucide-react'
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

  const handleAddQuestion = () => {
    if (readOnly) return
    const nextQs = [...questions]
    nextQs.push({
      id: `q-${Date.now().toString(36)}`,
      prompt: 'Câu hỏi mới?',
      options: ['Đáp án đúng', 'Đáp án sai'],
      correctIndex: 0,
      explanation: 'Giải thích đáp án đúng...',
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
    <div className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-xs">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <span className="grid size-8 place-items-center rounded-lg bg-sky-100 text-sky-800">
          <BrainCircuit size={18} />
        </span>
        <div>
          <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
            Thử Tài Trắc Nghiệm (Quiz Block)
          </h4>
          <p className="text-[11px] font-semibold text-slate-500">
            Kiểm tra mức độ tiếp thu và khắc sâu kiến thức sau video bài học
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-black uppercase text-slate-700">Tiêu đề bài test</label>
          <input
            type="text"
            value={quiz.title || ''}
            disabled={readOnly}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="VD: Thử tài 4 Chìa Khóa Vàng"
            className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-bold text-text"
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase text-slate-700">
            Điểm đạt tối thiểu (câu)
          </label>
          <input
            type="number"
            value={quiz.passScore ?? 1}
            disabled={readOnly}
            onChange={(e) => onChange({ passScore: parseInt(e.target.value, 10) || 1 })}
            className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text"
          />
        </div>
      </div>

      {/* Danh sách câu hỏi */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-black uppercase text-slate-700">
            Danh sách câu hỏi trắc nghiệm ({questions.length})
          </label>
          {!readOnly && (
            <button
              type="button"
              onClick={handleAddQuestion}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800 cursor-pointer"
            >
              <Plus size={14} />
              <span>Thêm câu hỏi</span>
            </button>
          )}
        </div>

        {questions.map((q, qIdx) => (
          <div
            key={q.id || qIdx}
            className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <span className="text-xs font-black text-slate-800">Câu hỏi #{qIdx + 1}</span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(qIdx)}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  title="Xóa câu hỏi này"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            <input
              type="text"
              value={q.prompt}
              disabled={readOnly}
              onChange={(e) => {
                const nextQs = [...questions]
                nextQs[qIdx] = { ...nextQs[qIdx], prompt: e.target.value }
                onChange({ questions: nextQs })
              }}
              placeholder="Nội dung câu hỏi..."
              className="w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold"
            />

            {/* Ảnh minh họa câu hỏi nếu có */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={q.visualUrl || ''}
                disabled={readOnly}
                onChange={(e) => {
                  const nextQs = [...questions]
                  nextQs[qIdx] = { ...nextQs[qIdx], visualUrl: e.target.value }
                  onChange({ questions: nextQs })
                }}
                placeholder="URL ảnh minh họa (tùy chọn)..."
                className="flex-1 rounded-lg border border-border bg-white px-2 py-1 text-[11px] font-mono"
              />
              {!readOnly && (
                <label className="flex items-center gap-1 rounded-lg bg-sky-50 border border-sky-200 px-2 py-1 text-[11px] font-bold text-sky-800 hover:bg-sky-100 cursor-pointer shrink-0">
                  <span>🖼️ Ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      try {
                        const res = await uploadCmsCourseMedia({
                          file,
                          purpose: 'island_quiz_visual',
                          questId,
                        })
                        if (res?.url) {
                          const nextQs = [...questions]
                          nextQs[qIdx] = { ...nextQs[qIdx], visualUrl: res.url }
                          onChange({ questions: nextQs })
                          showToast?.('Đã tải ảnh câu hỏi lên!', 'success')
                        }
                      } catch (err) {
                        showToast?.(
                          `Lỗi tải ảnh: ${err instanceof Error ? err.message : 'Không xác định'}`,
                          'error'
                        )
                      }
                    }}
                  />
                </label>
              )}
            </div>

            {/* Các phương án lựa chọn */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-600">
                  Phương án lựa chọn (chọn tròn để đặt đáp án đúng):
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
                    className="text-[10px] font-bold text-sky-700 hover:text-sky-900 cursor-pointer"
                  >
                    + Thêm phương án
                  </button>
                )}
              </div>

              {q.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`quiz-correct-${qIdx}`}
                    checked={q.correctIndex === optIdx}
                    disabled={readOnly}
                    onChange={() => {
                      const nextQs = [...questions]
                      nextQs[qIdx] = { ...nextQs[qIdx], correctIndex: optIdx }
                      onChange({ questions: nextQs })
                    }}
                    title="Chọn làm đáp án đúng"
                    className="size-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
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
                    className={cn(
                      'flex-1 rounded-lg border bg-white px-2 py-1 text-xs font-semibold',
                      q.correctIndex === optIdx
                        ? 'border-emerald-400 bg-emerald-50/50 text-emerald-950 font-bold'
                        : 'border-border text-text'
                    )}
                  />
                  {q.options.length > 2 && !readOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextQs = [...questions]
                        const nextOpts = nextQs[qIdx].options.filter((_, i) => i !== optIdx)
                        let nextCorr = nextQs[qIdx].correctIndex
                        if (nextCorr === optIdx) nextCorr = 0
                        else if (nextCorr > optIdx) nextCorr -= 1
                        nextQs[qIdx] = { ...nextQs[qIdx], options: nextOpts, correctIndex: nextCorr }
                        onChange({ questions: nextQs })
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Xóa phương án"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <input
              type="text"
              value={q.explanation || ''}
              disabled={readOnly}
              onChange={(e) => {
                const nextQs = [...questions]
                nextQs[qIdx] = { ...nextQs[qIdx], explanation: e.target.value }
                onChange({ questions: nextQs })
              }}
              placeholder="Lời giải thích khi trả lời..."
              className="w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-[11px] text-slate-600"
            />
          </div>
        ))}
        {questions.length === 0 && (
          <p className="text-xs text-slate-400 italic">Chưa có câu hỏi trắc nghiệm nào.</p>
        )}
      </div>
    </div>
  )
}

export { QuizBlockEditor as Stage4QuizEditor }
