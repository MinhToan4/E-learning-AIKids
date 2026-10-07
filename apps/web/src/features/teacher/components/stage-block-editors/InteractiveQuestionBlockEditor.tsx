import React, { useState } from 'react'
import {
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Lightbulb,
} from 'lucide-react'
import { uploadCmsCourseMedia } from '@/shared/lib/media-api'
import { cn } from '@/shared/lib/cn'
import { CmsImageUploader } from './CmsImageUploader'

export interface InteractiveQuestionOption {
  id?: string
  text: string
  imageUrl?: string
}

export interface InteractiveQuestionData {
  id?: string
  prompt: string
  layoutMode?: 'cards' | 'split' | 'list'
  visualUrl?: string
  options: InteractiveQuestionOption[]
  correctIndex: number
  explanation?: string
}

export interface InteractiveQuestionBlockEditorProps {
  question: InteractiveQuestionData
  onChange: (patch: Partial<InteractiveQuestionData>) => void
  readOnly?: boolean
  questId?: string
  showToast?: (message: string, tone?: 'success' | 'error' | 'info') => void
  questionNumber?: number
  onRemoveQuestion?: () => void
  customBadge?: string
  customTitle?: string
}

/**
 * InteractiveQuestionBlockEditor — Khối câu hỏi trắc nghiệm / xác nhận mục tiêu dùng chung.
 * Chuẩn WYSIWYG Hallmark Soft Clay, hỗ trợ 3 bố cục: Thẻ Card, Split 50/50, Danh sách dọc.
 * Dùng chung cho:
 * 1. Khối kéo-thả (Drag & Drop Block) trên Canvas bài giảng.
 * 2. Chặng 2 (Xác nhận mục tiêu - Confirm Block).
 * 3. Chặng 4 (Thử tài trắc nghiệm - Quiz Block).
 */
export function InteractiveQuestionBlockEditor({
  question,
  onChange,
  readOnly = false,
  questId,
  showToast,
  questionNumber,
  onRemoveQuestion,
  customBadge,
  customTitle,
}: InteractiveQuestionBlockEditorProps) {
  const options = question.options || []
  const layoutMode = question.layoutMode || 'cards'
  const [uploadingVisual, setUploadingVisual] = useState(false)
  const [uploadingOptIdx, setUploadingOptIdx] = useState<number | null>(null)

  const handleAddOption = () => {
    if (readOnly) return
    const nextOpts = [...options]
    const optLetter = String.fromCharCode(65 + nextOpts.length)
    nextOpts.push({
      id: `opt-${Date.now().toString(36)}-${nextOpts.length}`,
      text: `Phương án ${optLetter}`,
      imageUrl: '',
    })
    onChange({ options: nextOpts })
    showToast?.(`Đã thêm Phương án ${optLetter}!`, 'success')
  }

  const handleRemoveOption = (optIdx: number) => {
    if (readOnly || options.length <= 2) return
    const nextOpts = options.filter((_, i) => i !== optIdx)
    let nextCorrect = question.correctIndex
    if (nextCorrect === optIdx) nextCorrect = 0
    else if (nextCorrect > optIdx) nextCorrect -= 1
    onChange({ options: nextOpts, correctIndex: nextCorrect })
  }

  return (
    <div className="rounded-3xl border-2 border-slate-200 bg-white p-5 space-y-4 shadow-clay-xs hover:border-slate-300 transition">
      {/* Header Khối Câu Hỏi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-sky-600 text-white text-xs font-black tracking-wide shadow-2xs">
            {customBadge || (questionNumber ? `CÂU HỎI #${questionNumber}` : 'CÂU HỎI TRẮC NGHIỆM')}
          </span>
          <span className="text-xs font-bold text-slate-500">
            ({options.length} phương án)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Bộ chọn Layout 3 chế độ */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              disabled={readOnly}
              onClick={() => onChange({ layoutMode: 'cards', visualUrl: '' })}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer select-none',
                layoutMode === 'cards'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-white'
              )}
              title="Mỗi phương án là 1 thẻ card độc lập có ảnh riêng (lưới thẻ)"
            >
              🔲 Thẻ Card
            </button>
            <button
              type="button"
              disabled={readOnly}
              onClick={() => onChange({ layoutMode: 'split' })}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer select-none',
                layoutMode === 'split'
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
              onClick={() => onChange({ layoutMode: 'list' })}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer select-none',
                layoutMode === 'list'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-white'
              )}
              title="Danh sách phương án dạng chữ xếp dọc"
            >
              📋 Dọc
            </button>
          </div>

          {onRemoveQuestion && !readOnly && (
            <button
              type="button"
              onClick={onRemoveQuestion}
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
              title="Xóa câu hỏi này"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* ── BỐ CỤC 1: SPLIT (ẢNH BÊN TRÁI, CÂU HỎI & ĐÁP ÁN BÊN PHẢI) ── */}
      {layoutMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Cột trái: Ảnh tình huống câu hỏi */}
          <div className="lg:col-span-5 rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/40 p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
                <ImageIcon size={15} className="text-sky-600" />
                <span>Ảnh Tình Huống Câu Hỏi *</span>
              </label>
              {question.visualUrl && !readOnly && (
                <button
                  type="button"
                  onClick={() => onChange({ visualUrl: '' })}
                  className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Xóa ảnh
                </button>
              )}
            </div>

            <CmsImageUploader
              label="Ảnh Tình Huống / Minh Họa (Cột Trái)"
              sublabel="Hình ảnh hoặc sơ đồ để học sinh quan sát trả lời"
              icon="🖼️"
              imageUrl={question.visualUrl}
              imageAlt="Ảnh minh họa câu hỏi"
              readOnly={readOnly}
              isUploading={uploadingVisual}
              tone="sky"
              aspectRatio="16/10"
              maxHeight="260px"
              showUrlInput={true}
              onImageChange={(url) => onChange({ visualUrl: url })}
              onUploadFile={async (file) => {
                setUploadingVisual(true)
                try {
                  const res = await uploadCmsCourseMedia({ file, purpose: 'quiz_visual', questId })
                  if (res?.url) {
                    onChange({ visualUrl: res.url })
                    showToast?.('Tải ảnh câu hỏi thành công!', 'success')
                  }
                } finally {
                  setUploadingVisual(false)
                }
              }}
              urlPlaceholder="https://... hoặc /assets/..."
            />
          </div>

          {/* Cột phải: Đề bài & Danh sách phương án */}
          <div className="lg:col-span-7 space-y-3">
            <div className="rounded-2xl border-2 border-slate-200 bg-slate-50/60 p-3.5 space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                {customTitle || 'Nội dung câu hỏi *'}
              </label>
              <input
                type="text"
                value={question.prompt}
                disabled={readOnly}
                onChange={(e) => onChange({ prompt: e.target.value })}
                placeholder="VD: Trong 4 Chìa Khóa, chìa nào quyết định bức tranh vẽ AI hoặc CÁI GÌ?"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 shadow-2xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Các phương án lựa chọn ({options.length})
                </label>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="inline-flex items-center gap-1 text-xs font-black text-sky-700 hover:text-sky-900 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Thêm phương án</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {options.map((opt, optIdx) => {
                  const isCorrect = question.correctIndex === optIdx
                  const optLetter = String.fromCharCode(65 + optIdx)

                  return (
                    <div
                      key={opt.id || optIdx}
                      className={cn(
                        'flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl border-2 transition shadow-2xs',
                        isCorrect
                          ? 'border-mint-500 bg-mint-50/80 ring-2 ring-mint-300/80'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      )}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span
                          className={cn(
                            'size-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 shadow-2xs',
                            isCorrect
                              ? 'bg-mint-600 text-white'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          )}
                        >
                          {optLetter}
                        </span>
                        <input
                          type="text"
                          value={opt.text}
                          disabled={readOnly}
                          onChange={(e) => {
                            const nextOpts = [...options]
                            nextOpts[optIdx] = { ...opt, text: e.target.value }
                            onChange({ options: nextOpts })
                          }}
                          placeholder={`Phương án ${optLetter}...`}
                          className="flex-1 bg-transparent px-2 py-1 text-xs font-bold text-slate-900 outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          disabled={readOnly}
                          onClick={() => onChange({ correctIndex: optIdx })}
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
                        {options.length > 2 && !readOnly && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(optIdx)}
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
      {layoutMode !== 'split' && (
        <>
          {/* Đề bài câu hỏi */}
          <div className="rounded-2xl border-2 border-slate-200 bg-slate-50/60 p-4 space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              {customTitle || 'Nội dung câu hỏi trắc nghiệm *'}
            </label>
            <input
              type="text"
              value={question.prompt}
              disabled={readOnly}
              onChange={(e) => onChange({ prompt: e.target.value })}
              placeholder="VD: Trong 4 Chìa Khóa, chìa nào quyết định bức tranh vẽ AI hoặc CÁI GÌ?"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 shadow-2xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
            />
          </div>

          {/* Lưới các phương án lựa chọn */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                {layoutMode === 'cards'
                  ? `Các thẻ lựa chọn (${options.length} thẻ — tích chọn thẻ đúng)`
                  : `Danh sách phương án (${options.length})`}
              </label>
              {!readOnly && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-brand-300 bg-brand-50 px-3 py-1 text-xs font-black text-brand-800 hover:bg-brand-100 transition cursor-pointer shadow-2xs"
                >
                  <Plus size={14} />
                  <span>Thêm phương án</span>
                </button>
              )}
            </div>

            {layoutMode === 'cards' ? (
              /* LƯỚI THẺ CARD CHUẨN WYSIWYG KHỚP CONFIRM BLOCK */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {options.map((opt, optIdx) => {
                  const isCorrect = question.correctIndex === optIdx
                  const optLetter = String.fromCharCode(65 + optIdx)

                  return (
                    <div
                      key={opt.id || optIdx}
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

                        {options.length > 2 && !readOnly && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(optIdx)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            title="Xóa phương án này"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      {/* Vùng hình ảnh của phương án (WYSIWYG preview nếu có ảnh, hoặc nút gắn ảnh tùy chọn) */}
                      <CmsImageUploader
                        compact={true}
                        imageUrl={opt.imageUrl}
                        imageAlt={`Minh họa ${optLetter}`}
                        readOnly={readOnly}
                        isUploading={uploadingOptIdx === optIdx}
                        tone="sky"
                        onImageChange={(url) => {
                          const nextOpts = [...options]
                          nextOpts[optIdx] = { ...opt, imageUrl: url }
                          onChange({ options: nextOpts })
                        }}
                        onUploadFile={async (file) => {
                          setUploadingOptIdx(optIdx)
                          try {
                            const res = await uploadCmsCourseMedia({ file, purpose: 'quiz_option_image', questId })
                            if (res?.url) {
                              const nextOpts = [...options]
                              nextOpts[optIdx] = { ...opt, imageUrl: res.url }
                              onChange({ options: nextOpts })
                              showToast?.('Đã tải ảnh thẻ lên!', 'success')
                            }
                          } finally {
                            setUploadingOptIdx(null)
                          }
                        }}
                      />

                      {/* Nội dung chữ của phương án */}
                      <input
                        type="text"
                        value={opt.text}
                        disabled={readOnly}
                        onChange={(e) => {
                          const nextOpts = [...options]
                          nextOpts[optIdx] = { ...opt, text: e.target.value }
                          onChange({ options: nextOpts })
                        }}
                        placeholder={`Nội dung phương án ${optLetter}...`}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-brand-500 focus:bg-white transition mb-3"
                      />

                      {/* Nút Chọn Làm Đáp Án Đúng (To & Rõ) */}
                      <button
                        type="button"
                        disabled={readOnly}
                        onClick={() => onChange({ correctIndex: optIdx })}
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
                    onClick={handleAddOption}
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
                {options.map((opt, optIdx) => {
                  const isCorrect = question.correctIndex === optIdx
                  const optLetter = String.fromCharCode(65 + optIdx)

                  return (
                    <div
                      key={opt.id || optIdx}
                      className={cn(
                        'flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 rounded-xl border-2 transition shadow-2xs',
                        isCorrect
                          ? 'border-mint-500 bg-mint-50/80 ring-2 ring-mint-300/80'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      )}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span
                          className={cn(
                            'size-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 shadow-2xs',
                            isCorrect
                              ? 'bg-mint-600 text-white'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          )}
                        >
                          {optLetter}
                        </span>
                        <input
                          type="text"
                          value={opt.text}
                          disabled={readOnly}
                          onChange={(e) => {
                            const nextOpts = [...options]
                            nextOpts[optIdx] = { ...opt, text: e.target.value }
                            onChange({ options: nextOpts })
                          }}
                          placeholder={`Nội dung phương án ${optLetter}...`}
                          className="flex-1 bg-transparent px-2 py-1 text-xs font-bold text-slate-900 outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          disabled={readOnly}
                          onClick={() => onChange({ correctIndex: optIdx })}
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
                        {options.length > 2 && !readOnly && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(optIdx)}
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
          value={question.explanation || ''}
          disabled={readOnly}
          onChange={(e) => onChange({ explanation: e.target.value })}
          placeholder="Lời giải thích xuất hiện khi học sinh trả lời đúng câu hỏi này..."
          className="w-full rounded-xl border border-amber-200 bg-white p-3 text-xs font-bold text-slate-800 shadow-2xs outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition"
        />
      </div>
    </div>
  )
}
