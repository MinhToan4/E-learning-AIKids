import React from 'react'
import { BrainCircuit, Plus } from 'lucide-react'
import type { LessonSixStageJourney } from '@/shared/lib/api'
import { InteractiveQuestionBlockEditor } from '../../stage-block-editors/InteractiveQuestionBlockEditor'

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
 * Tái sử dụng InteractiveQuestionBlockEditor dùng chung cho mọi khối trắc nghiệm.
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
      options: ['Phương án A (Đáp án đúng)', 'Phương án B'],
      optionImages: ['', ''],
      correctIndex: 0,
      layoutMode: 'split',
      visualUrl: (quiz as any)?.posterUrl || '',
      explanation: 'Giải thích vì sao đáp án này chính xác...',
    })
    onChange({ questions: nextQs })
    showToast?.('Đã thêm câu hỏi trắc nghiệm mới!', 'success')
  }

  const handleRemoveQuestion = (idx: number) => {
    if (readOnly) return
    const nextQs = questions.filter((_, i) => i !== idx)
    onChange({ questions: nextQs })
    showToast?.('Đã xóa câu hỏi!', 'info')
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
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700">
            Danh sách câu hỏi trắc nghiệm ({questions.length})
          </label>
          {!readOnly && (
            <button
              type="button"
              onClick={handleAddQuestion}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-black text-brand-800 hover:bg-brand-100 transition cursor-pointer shadow-2xs active:scale-95"
            >
              <Plus size={14} />
              <span>Thêm câu hỏi mới</span>
            </button>
          )}
        </div>

        {questions.map((q, qIdx) => (
          <InteractiveQuestionBlockEditor
            key={q.id || `q-${qIdx}`}
            question={{
              id: q.id,
              prompt: q.prompt,
              layoutMode: q.layoutMode || (q.optionImages?.some(Boolean) ? 'cards' : 'split'),
              visualUrl: q.visualUrl || (quiz as any)?.posterUrl || '',
              options: q.options.map((optText, optIdx) => ({
                id: `opt-${optIdx}`,
                text: optText,
                imageUrl: q.optionImages?.[optIdx] || '',
              })),
              correctIndex: q.correctIndex,
              explanation: q.explanation || '',
            }}
            onChange={(patch) => {
              const nextQs = [...questions]
              const current = nextQs[qIdx]
              const updated: any = { ...current }
              if (patch.prompt !== undefined) updated.prompt = patch.prompt
              if (patch.layoutMode !== undefined) updated.layoutMode = patch.layoutMode
              if (patch.visualUrl !== undefined) updated.visualUrl = patch.visualUrl
              if (patch.explanation !== undefined) updated.explanation = patch.explanation
              if (patch.correctIndex !== undefined) updated.correctIndex = patch.correctIndex
              if (patch.options !== undefined) {
                updated.options = patch.options.map((o) => o.text)
                updated.optionImages = patch.options.map((o) => o.imageUrl || '')
              }
              nextQs[qIdx] = updated
              onChange({ questions: nextQs })
            }}
            readOnly={readOnly}
            questId={questId}
            showToast={showToast}
            questionNumber={qIdx + 1}
            onRemoveQuestion={questions.length > 1 ? () => handleRemoveQuestion(qIdx) : undefined}
          />
        ))}
      </div>
    </div>
  )
}
