import React, { useState } from 'react'
import { Sparkles, Wand2, Lightbulb, BookOpen, Check } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import type { LectureDraft } from '../../lib/authoring'

export interface LectureDrawerAiAssistantTabProps {
  readOnly?: boolean
  draft: LectureDraft
  courseId: string
  onApplyGeneratedContent?: (patch: Partial<LectureDraft>) => void
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void
}

export function LectureDrawerAiAssistantTab({
  readOnly = false,
  draft,
  courseId: _courseId,
  onApplyGeneratedContent,
  showToast,
}: LectureDrawerAiAssistantTabProps) {
  const [promptQuery, setPromptQuery] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastSuggestedConcept, setLastSuggestedConcept] = useState<string | null>(null)

  const handleGenerateHook = () => {
    if (readOnly) return
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      const hookSuggestion = `Bạn có biết ${draft.title || 'khái niệm này'} hoạt động như thế nào trong thế giới thực không? Cùng Mèo Mee khám phá ngay nhé!`
      setLastSuggestedConcept(hookSuggestion)
      showToast('Đã tạo gợi ý mở đầu bài học!', 'success')
    }, 500)
  }

  const handleApplyHook = () => {
    if (!lastSuggestedConcept || !onApplyGeneratedContent) return
    onApplyGeneratedContent({
      hook: lastSuggestedConcept,
    })
    showToast('Đã áp dụng mở đầu vào trạm học!', 'success')
    setLastSuggestedConcept(null)
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <span className="flex size-8 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
          <Wand2 size={18} />
        </span>
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">Trợ Lý Giáo Viên AI (Mee Studio Assistant)</h3>
          <p className="text-xs text-slate-500">Tự động gợi ý mở đầu bài học, câu đố và kịch bản tương tác</p>
        </div>
      </div>

      <div className="rounded-xl bg-brand-50/60 border border-brand-200 p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-900">
          <Lightbulb size={14} className="text-amber-500" />
          <span>Gợi ý mở đầu thu hút (Hook generator)</span>
        </div>
        <p className="text-xs text-slate-600">
          Dựa trên tiêu đề trạm <strong>&quot;{draft.title || 'Chưa đặt tên'}&quot;</strong>, AI sẽ đề xuất câu hỏi gợi mở cho học sinh lứa tuổi tiểu học.
        </p>
        <Button
          type="button"
          disabled={readOnly || isGenerating || !draft.title}
          onClick={handleGenerateHook}
          className="gap-1.5 text-xs font-bold"
        >
          <Sparkles size={13} />
          {isGenerating ? 'Đang tạo...' : 'Tạo mở đầu bài học'}
        </Button>

        {lastSuggestedConcept && (
          <div className="mt-3 rounded-xl border border-brand-200 bg-white p-3 space-y-2 animate-fade-up">
            <p className="text-xs font-semibold text-slate-800 italic">&ldquo;{lastSuggestedConcept}&rdquo;</p>
            <Button
              type="button"
              variant="secondary"
              onClick={handleApplyHook}
              className="gap-1 text-xs font-bold"
            >
              <Check size={13} /> Áp dụng vào trạm
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2 pt-2">
        <label className="block text-xs font-bold text-slate-700">Yêu cầu trợ lý AI hỗ trợ nội dung khác:</label>
        <textarea
          readOnly={readOnly}
          value={promptQuery}
          onChange={(e) => setPromptQuery(e.target.value)}
          placeholder="VD: Gợi ý 3 ví dụ sinh động về nhận diện hình ảnh cho học sinh lớp 3..."
          rows={3}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
        />
        <div className="flex justify-end">
          <Button
            type="button"
            disabled={readOnly || !promptQuery.trim()}
            onClick={() => {
              showToast('Tính năng đang được kích hoạt cùng Mee AI Studio', 'info')
            }}
            className="gap-1.5 text-xs font-bold"
          >
            <BookOpen size={13} /> Gửi yêu cầu
          </Button>
        </div>
      </div>
    </div>
  )
}
