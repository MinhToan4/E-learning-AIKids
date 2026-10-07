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
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700">
            Danh sách câu hỏi trắc nghiệm ({questions.length})
          </label>
          {!readOnly && (
            <button
              type="button"
              onClick={handleAddQuestion}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-black text-brand-800 hover:bg-brand-100 transition cursor-pointer shadow-2xs"
            >
              <Plus size={14} />
              <span>Thêm câu hỏi mới</span>
            </button>
          )}
        </div>

        {questions.map((q, qIdx) => {
          const qLayout = q.layoutMode || (q.optionImages?.some(Boolean) ? 'cards' : 'split')
          const optionImages = q.optionImages || []

          const updateQuestion = (patch: Partial<typeof q>) => {
            const nextQs = [...questions]
            nextQs[qIdx] = { ...nextQs[qIdx], ...patch }
            onChange({ questions: nextQs })
          }

          const handleAddOptionToQuestion = () => {
            if (readOnly) return
            const nextOpts = [...q.options, `Phương án ${String.fromCharCode(65 + q.options.length)}`]
            const nextImages = [...optionImages, '']
            updateQuestion({ options: nextOpts, optionImages: nextImages })
            showToast?.(`Đã thêm Phương án ${String.fromCharCode(65 + q.options.length)}!`, 'success')
          }

          const handleRemoveOptionFromQuestion = (optIdx: number) => {
            if (readOnly || q.options.length <= 2) return
            const nextOpts = q.options.filter((_, i) => i !== optIdx)
            const nextImages = optionImages.filter((_, i) => i !== optIdx)
            let nextCorrect = q.correctIndex
            if (nextCorrect === optIdx) nextCorrect = 0
            else if (nextCorrect > optIdx) nextCorrect -= 1
            updateQuestion({ options: nextOpts, optionImages: nextImages, correctIndex: nextCorrect })
          }

          return (
            <div
              key={q.id || qIdx}
              className="rounded-3xl border-2 border-slate-200 bg-white p-5 space-y-4 shadow-clay-xs hover:border-slate-300 transition"
            >
              {/* Header Câu Hỏi */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-sky-600 text-white text-xs font-black tracking-wide shadow-2xs">
                    CÂU HỎI #{qIdx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    ({q.options.length} phương án)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Bộ chọn Layout riêng cho từng câu hỏi */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      disabled={readOnly}
                      onClick={() => updateQuestion({ layoutMode: 'cards' })}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer select-none',
                        qLayout === 'cards'
                          ? 'bg-sky-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-white'
                      )}
                      title="Mỗi phương án là 1 thẻ card có ảnh riêng (như Confirm Block)"
                    >
                      🔲 Thẻ Card
                    </button>
                    <button
                      type="button"
                      disabled={readOnly}
                      onClick={() => updateQuestion({ layoutMode: 'split' })}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer select-none',
                        qLayout === 'split'
                          ? 'bg-sky-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-white'
                      )}
                      title="Ảnh tình huống bên trái, câu hỏi & đáp án bên phải"
                    >
                      🌓 Ảnh trái - Câu hỏi phải
                    </button>
                    <button
                      type="button"
                      disabled={readOnly}
                      onClick={() => updateQuestion({ layoutMode: 'list' })}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer select-none',
                        qLayout === 'list'
                          ? 'bg-sky-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-white'
                      )}
                      title="Danh sách lựa chọn dạng chữ xếp dọc"
                    >
                      📋 Dọc
                    </button>
                  </div>

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="Xóa câu hỏi này"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* ── BỐ CỤC 1: SPLIT (ẢNH BÊN TRÁI, CÂU HỎI & ĐÁP ÁN BÊN PHẢI) ── */}
              {qLayout === 'split' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  {/* Cột trái: Ảnh tình huống câu hỏi */}
                  <div className="lg:col-span-5 rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/40 p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-black uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
                        <ImageIcon size={15} className="text-sky-600" />
                        <span>Ảnh Tình Huống Câu Hỏi *</span>
                      </label>
                      {q.visualUrl && !readOnly && (
                        <button
                          type="button"
                          onClick={() => updateQuestion({ visualUrl: '' })}
                          className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          Xóa ảnh
                        </button>
                      )}
                    </div>

                    {q.visualUrl ? (
                      <div className="relative group overflow-hidden rounded-2xl border-2 border-sky-300 bg-white shadow-2xs">
                        <div className="aspect-[4/3] sm:aspect-[16/10] w-full max-h-[260px] bg-slate-100 flex items-center justify-center overflow-hidden">
                          <img
                            src={q.visualUrl}
                            alt="Ảnh minh họa câu hỏi"
                            className="size-full object-contain p-2"
                          />
                        </div>
                        {!readOnly && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-md cursor-pointer hover:bg-slate-50">
                              <Upload size={13} />
                              <span>Đổi ảnh</span>
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
                                      updateQuestion({ visualUrl: res.url })
                                      showToast?.('Đổi ảnh câu hỏi thành công!', 'success')
                                    }
                                  } finally {
                                    setUploadingQIdx(null)
                                  }
                                }}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-7 px-4 text-center rounded-2xl bg-white border-2 border-dashed border-sky-300">
                        <div className="grid size-12 place-items-center rounded-2xl bg-sky-100 text-sky-700 mb-2 shadow-2xs">
                          <Upload size={22} />
                        </div>
                        <p className="text-xs font-black text-slate-800 mb-0.5">Tải ảnh tình huống bên trái</p>
                        <p className="text-[11px] font-semibold text-slate-500 mb-3">Hình minh họa hoặc sơ đồ để học sinh quan sát</p>
                        {!readOnly && (
                          <label className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 text-xs font-black shadow-xs cursor-pointer active:scale-95 transition">
                            <Upload size={14} />
                            <span>{uploadingQIdx === qIdx ? 'Đang tải lên…' : 'Chọn ảnh từ máy'}</span>
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
                                    updateQuestion({ visualUrl: res.url })
                                    showToast?.('Tải ảnh câu hỏi thành công!', 'success')
                                  }
                                } finally {
                                  setUploadingQIdx(null)
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Cột phải: Đề bài & Danh sách phương án */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="rounded-2xl border-2 border-slate-200 bg-slate-50/60 p-3.5 space-y-1">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                        Nội dung câu hỏi *
                      </label>
                      <input
                        type="text"
                        value={q.prompt}
                        disabled={readOnly}
                        onChange={(e) => updateQuestion({ prompt: e.target.value })}
                        placeholder="VD: Trong 4 Chìa Khóa, chìa nào quyết định bức tranh vẽ AI hoặc CÁI GÌ?"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 shadow-2xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                          Các phương án lựa chọn ({q.options.length})
                        </label>
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={handleAddOptionToQuestion}
                            className="inline-flex items-center gap-1 text-xs font-black text-sky-700 hover:text-sky-900 cursor-pointer"
                          >
                            <Plus size={13} />
                            <span>Thêm phương án</span>
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = q.correctIndex === optIdx
                          const optLetter = String.fromCharCode(65 + optIdx)

                          return (
                            <div
                              key={optIdx}
                              className={cn(
                                'flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl border-2 transition shadow-2xs',
                                isCorrect
                                  ? 'border-mint-500 bg-mint-50/80 ring-2 ring-mint-300/80'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              )}
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <span className={cn(
                                  'size-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 shadow-2xs',
                                  isCorrect ? 'bg-mint-600 text-white' : 'bg-slate-100 text-slate-700 border border-slate-300'
                                )}>
                                  {optLetter}
                                </span>
                                <input
                                  type="text"
                                  value={opt}
                                  disabled={readOnly}
                                  onChange={(e) => {
                                    const nextOpts = [...q.options]
                                    nextOpts[optIdx] = e.target.value
                                    updateQuestion({ options: nextOpts })
                                  }}
                                  placeholder={`Phương án ${optLetter}...`}
                                  className="flex-1 bg-transparent px-2 py-1 text-xs font-bold text-slate-900 outline-none"
                                />
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                                <button
                                  type="button"
                                  disabled={readOnly}
                                  onClick={() => updateQuestion({ correctIndex: optIdx })}
                                  className={cn(
                                    'px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1 shadow-2xs',
                                    isCorrect
                                      ? 'bg-mint-600 text-white'
                                      : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-mint-50 hover:text-mint-700 hover:border-mint-300'
                                  )}
                                >
                                  {isCorrect ? (
                                    <>
                                      <CheckCircle2 size={13} className="stroke-[3]" />
                                      <span>ĐÁP ÁN ĐÚNG</span>
                                    </>
                                  ) : (
                                    <span>Chọn làm đáp án đúng</span>
                                  )}
                                </button>
                                {q.options.length > 2 && !readOnly && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOptionFromQuestion(optIdx)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                    title="Xóa phương án này"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── BỐ CỤC 2 & 3: CARDS (LƯỚI THẺ CARD WYSIWYG) HOẶC LIST (DANH SÁCH DỌC) ── */}
              {qLayout !== 'split' && (
                <>
                  {/* Đề bài câu hỏi */}
                  <div className="rounded-2xl border-2 border-slate-200 bg-slate-50/60 p-4 space-y-1.5">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                      Nội dung câu hỏi trắc nghiệm *
                    </label>
                    <input
                      type="text"
                      value={q.prompt}
                      disabled={readOnly}
                      onChange={(e) => updateQuestion({ prompt: e.target.value })}
                      placeholder="VD: Trong 4 Chìa Khóa, chìa nào quyết định bức tranh vẽ AI hoặc CÁI GÌ?"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 shadow-2xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                    />
                  </div>

                  {/* Lưới các phương án lựa chọn */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                        {qLayout === 'cards'
                          ? `Các thẻ lựa chọn (${q.options.length} thẻ — tích chọn thẻ đúng)`
                          : `Danh sách phương án (${q.options.length})`}
                      </label>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={handleAddOptionToQuestion}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-brand-300 bg-brand-50 px-3 py-1 text-xs font-black text-brand-800 hover:bg-brand-100 transition cursor-pointer shadow-2xs"
                        >
                          <Plus size={14} />
                          <span>Thêm phương án</span>
                        </button>
                      )}
                    </div>

                    {qLayout === 'cards' ? (
                      /* LƯỚI THẺ CARD CHUẨN WYSIWYG KHỚP CONFIRM BLOCK */
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = q.correctIndex === optIdx
                          const optLetter = String.fromCharCode(65 + optIdx)
                          const optImage = optionImages[optIdx] || ''

                          return (
                            <div
                              key={optIdx}
                              className={cn(
                                'group flex flex-col justify-between rounded-2xl border-2 p-3.5 transition-all duration-150 shadow-2xs',
                                isCorrect
                                  ? 'border-mint-500 bg-mint-50/80 ring-2 ring-mint-300/80'
                                  : 'border-slate-200 bg-white hover:border-brand-300'
                              )}
                            >
                              {/* Header Thẻ: Chữ cái + Nút xóa */}
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <span
                                  className={cn(
                                    'px-2.5 py-0.5 rounded-lg text-xs font-black tracking-wider uppercase',
                                    isCorrect ? 'bg-mint-600 text-white' : 'bg-slate-100 text-slate-800'
                                  )}
                                >
                                  Phương án {optLetter}
                                </span>

                                {q.options.length > 2 && !readOnly && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOptionFromQuestion(optIdx)}
                                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                    title="Xóa phương án này"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>

                              {/* Vùng hình ảnh của phương án (WYSIWYG preview) */}
                              <div className="relative mb-2.5 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 min-h-[110px] max-h-[140px] flex items-center justify-center">
                                {optImage ? (
                                  <>
                                    <img
                                      src={optImage}
                                      alt={`Minh họa ${optLetter}`}
                                      className="size-full object-contain p-2"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                      }}
                                    />
                                    {!readOnly && (
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <label className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-slate-800 shadow-sm cursor-pointer hover:bg-slate-50">
                                          <Upload size={12} />
                                          <span>Đổi ảnh</span>
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
                                                  const nextImages = [...optionImages]
                                                  nextImages[optIdx] = res.url
                                                  updateQuestion({ optionImages: nextImages })
                                                  showToast?.('Đổi ảnh thành công!', 'success')
                                                }
                                              } finally {
                                                setUploadingQIdx(null)
                                              }
                                            }}
                                          />
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const nextImages = [...optionImages]
                                            nextImages[optIdx] = ''
                                            updateQuestion({ optionImages: nextImages })
                                          }}
                                          className="rounded-lg bg-rose-600 px-2 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-rose-700 cursor-pointer"
                                        >
                                          Xóa ảnh
                                        </button>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="flex flex-col items-center justify-center p-3 text-center">
                                    <ImageIcon size={22} className="text-slate-300 mb-1" />
                                    <p className="text-[11px] font-bold text-slate-400">Chưa có ảnh minh họa</p>
                                    {!readOnly && (
                                      <label className="mt-1.5 inline-flex items-center gap-1 rounded-lg bg-white border border-slate-300 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer">
                                        <Upload size={12} />
                                        <span>Tải ảnh lên</span>
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
                                                const nextImages = [...optionImages]
                                                nextImages[optIdx] = res.url
                                                updateQuestion({ optionImages: nextImages })
                                                showToast?.('Đã tải ảnh lên!', 'success')
                                              }
                                            } finally {
                                              setUploadingQIdx(null)
                                            }
                                          }}
                                        />
                                      </label>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Nội dung chữ của phương án */}
                              <input
                                type="text"
                                value={opt}
                                disabled={readOnly}
                                onChange={(e) => {
                                  const nextOpts = [...q.options]
                                  nextOpts[optIdx] = e.target.value
                                  updateQuestion({ options: nextOpts })
                                }}
                                placeholder={`Nội dung phương án ${optLetter}...`}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-brand-500 focus:bg-white transition mb-3"
                              />

                              {/* Nút Chọn Làm Đáp Án Đúng (To & Rõ) */}
                              <button
                                type="button"
                                disabled={readOnly}
                                onClick={() => updateQuestion({ correctIndex: optIdx })}
                                className={cn(
                                  'w-full py-2 px-3 rounded-xl text-xs font-black border transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs',
                                  isCorrect
                                    ? 'bg-mint-500 text-white border-mint-600 shadow-clay-xs'
                                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-brand-50 hover:text-brand-800 hover:border-brand-300'
                                )}
                              >
                                {isCorrect ? (
                                  <>
                                    <CheckCircle2 size={14} className="stroke-[3]" />
                                    <span>✓ ĐÂY LÀ ĐÁP ÁN ĐÚNG</span>
                                  </>
                                ) : (
                                  <span>Chọn làm đáp án đúng</span>
                                )}
                              </button>
                            </div>
                          )
                        })}

                        {/* Thẻ Thêm phương án nhanh dạng card nét đứt */}
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={handleAddOptionToQuestion}
                            className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-4 text-center text-slate-500 hover:border-brand-400 hover:bg-brand-50/40 hover:text-brand-700 transition cursor-pointer active:scale-95"
                          >
                            <div className="grid size-10 place-items-center rounded-xl bg-white border border-slate-200 shadow-2xs">
                              <Plus size={20} />
                            </div>
                            <span className="text-xs font-black">Thêm Phương Án Lựa Chọn</span>
                            <span className="text-[10px] font-semibold text-slate-400">Hỗ trợ 2-4 phương án A/B/C/D</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      /* DẠNG LIST DỌC */
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = q.correctIndex === optIdx
                          const optLetter = String.fromCharCode(65 + optIdx)

                          return (
                            <div
                              key={optIdx}
                              className={cn(
                                'flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 rounded-xl border-2 transition shadow-2xs',
                                isCorrect
                                  ? 'border-mint-500 bg-mint-50/80 ring-2 ring-mint-300/80'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              )}
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <span className={cn(
                                  'size-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 shadow-2xs',
                                  isCorrect ? 'bg-mint-600 text-white' : 'bg-slate-100 text-slate-700 border border-slate-300'
                                )}>
                                  {optLetter}
                                </span>
                                <input
                                  type="text"
                                  value={opt}
                                  disabled={readOnly}
                                  onChange={(e) => {
                                    const nextOpts = [...q.options]
                                    nextOpts[optIdx] = e.target.value
                                    updateQuestion({ options: nextOpts })
                                  }}
                                  placeholder={`Nội dung phương án ${optLetter}...`}
                                  className="flex-1 bg-transparent px-2 py-1 text-xs font-bold text-slate-900 outline-none"
                                />
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                                <button
                                  type="button"
                                  disabled={readOnly}
                                  onClick={() => updateQuestion({ correctIndex: optIdx })}
                                  className={cn(
                                    'px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1 shadow-2xs',
                                    isCorrect
                                      ? 'bg-mint-600 text-white'
                                      : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-mint-50 hover:text-mint-700 hover:border-mint-300'
                                  )}
                                >
                                  {isCorrect ? (
                                    <>
                                      <CheckCircle2 size={13} className="stroke-[3]" />
                                      <span>ĐÁP ÁN ĐÚNG</span>
                                    </>
                                  ) : (
                                    <span>Chọn làm đáp án đúng</span>
                                  )}
                                </button>
                                {q.options.length > 2 && !readOnly && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOptionFromQuestion(optIdx)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                    title="Xóa phương án này"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Lời giải thích khi bé trả lời đúng */}
              <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-4 space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-900">
                  <Lightbulb size={15} className="text-amber-600" />
                  <span>Giải thích vì sao đáp án đúng (Explanation)</span>
                </label>
                <textarea
                  rows={2}
                  value={q.explanation || ''}
                  disabled={readOnly}
                  onChange={(e) => updateQuestion({ explanation: e.target.value })}
                  placeholder="Lời giải thích xuất hiện khi học sinh trả lời đúng câu hỏi này..."
                  className="w-full rounded-xl border border-amber-200 bg-white p-3 text-xs font-bold text-slate-800 shadow-2xs outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition"
                />
              </div>
            </div>
          )
        })}

        {!readOnly && (
          <button
            type="button"
            onClick={handleAddQuestion}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/40 py-4 text-xs font-black text-sky-800 hover:border-brand-500 hover:bg-sky-50 transition cursor-pointer active:scale-95 shadow-2xs"
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
