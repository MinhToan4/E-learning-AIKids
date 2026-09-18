import React from 'react'
import {
  BookOpen,
  Clapperboard,
  Plus,
  ChevronUp,
  ChevronDown,
  Trash2,
  Eye,
  BrainCircuit,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { LectureVideo } from '@/features/lesson/components/LectureVideo'
import type { LessonFormat, LectureDraft, LearnCardDraft } from '../../lib/authoring'

export const LEARN_KIND_OPTIONS: Array<{ id: LearnCardDraft['kind']; label: string }> = [
  { id: 'concept', label: 'Khái niệm' },
  { id: 'example', label: 'Ví dụ đời sống' },
  { id: 'compare', label: 'So sánh' },
  { id: 'steps', label: 'Từng bước' },
  { id: 'storyboard', label: 'Storyboard' },
  { id: 'remember', label: 'Ghi nhớ' },
  { id: 'situation', label: 'Tình huống' },
  { id: 'aiki-riddle', label: 'Câu đố của AIKI' },
  { id: 'rule', label: 'Quy tắc' },
  { id: 'explanation', label: 'Giải thích' },
  { id: 'closing', label: 'Chốt' },
]

export const LEARN_LAYOUT_OPTIONS: Array<{ id: LearnCardDraft['layout']; label: string; icon: string; description: string }> = [
  { id: 'text', label: '1 Cột Tập Trung', icon: '📖', description: 'Một cột, phù hợp giải thích ý chính & đọc tập trung.' },
  { id: 'split', label: '2 Cột Chữ + Media', icon: '📰', description: 'Hai cột trên màn hình lớn: Chữ bên trái, ảnh bên phải.' },
  { id: 'visual-grid', label: 'Lưới 3 Ô Thẻ', icon: '🍱', description: '2–3 ô để so sánh hoặc phân loại ý tưởng.' },
  { id: 'storyboard', label: 'Chuỗi Storyboard', icon: '🎬', description: 'Các khung cảnh tranh vẽ diễn hoạt theo trình tự.' },
]

export interface LectureDrawerContentTabProps {
  readOnly?: boolean
  draft: LectureDraft
  uploadingStageMedia: string | null
  setLessonFormat: (format: LessonFormat) => void
  applyAikiRuleTemplate: () => void
  addLearnCard: () => void
  removeLearnCard: (idx: number) => void
  moveLearnCard: (idx: number, dir: number) => void
  updateLearnCard: (idx: number, patch: Partial<LearnCardDraft>) => void
  uploadLearnCardMedia: (cardIdx: number, field: 'imageUrl' | 'videoUrl', file: File) => Promise<void>
  sidePreview?: React.ReactNode
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  border: '1.5px solid #e2e8f0',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  color: '#0f172a',
  background: '#fff',
  outline: 'none',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical',
  lineHeight: 1.5,
  fontFamily: 'inherit',
}

export function LectureDrawerContentTab({
  readOnly = false,
  draft,
  uploadingStageMedia,
  setLessonFormat,
  applyAikiRuleTemplate,
  addLearnCard,
  removeLearnCard,
  moveLearnCard,
  updateLearnCard,
  uploadLearnCardMedia,
  sidePreview,
}: LectureDrawerContentTabProps) {
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,.95fr)]">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/50 p-4 shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-wide text-brand-800">Dạng bài học</p>
          <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={readOnly}
              onClick={() => setLessonFormat('standard')}
              className="flex flex-col items-start rounded-xl border-2 p-3 text-left transition border-brand-500 bg-white shadow-sm ring-2 ring-brand-200"
            >
              <span className="flex items-center gap-2 text-sm font-extrabold text-text">
                <BookOpen size={16} className="text-brand-600" /> Khám phá tự do
              </span>
              <span className="mt-1 text-xs text-muted">Tự do thêm bớt và sắp xếp các khối Khái niệm, Ví dụ, So sánh...</span>
            </button>

            <button
              type="button"
              disabled={readOnly}
              onClick={() => {
                setLessonFormat('aiki-rule-5steps')
                applyAikiRuleTemplate()
              }}
              className="flex flex-col items-start rounded-xl border-2 p-3 text-left transition border-border bg-white/60 hover:bg-white"
            >
              <span className="flex items-center gap-2 text-sm font-extrabold text-text">
                <Clapperboard size={16} className="text-brand-600" /> Quy tắc AIKI (5 chặng)
              </span>
              <span className="mt-1 text-xs text-muted">Mạch chuẩn: Tình huống ➔ Câu đố ➔ Quy tắc ➔ Giải thích ➔ Chốt. Có Video & Mèo AIKI.</span>
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-sun-200 bg-sun-50 px-3.5 py-3 text-xs font-bold leading-relaxed text-sun-900">
          <strong>Mỗi khối là một màn đọc ngắn của học sinh.</strong> Chọn loại nội dung, layout và sắp thứ tự theo mạch: hiểu ý chính → xem ví dụ → tự ghi nhớ.
        </div>

        {draft.learnCards.map((card, index) => (
          <section key={card.id} className="rounded-2xl border-2 border-border bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-extrabold text-text">Khối {index + 1}: {card.title}</p>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={readOnly || index === 0}
                  onClick={() => moveLearnCard(index, -1)}
                  className="grid size-10 place-items-center rounded-xl border border-border text-muted disabled:opacity-30"
                  aria-label={`Đưa khối ${index + 1} lên`}
                >
                  <ChevronUp size={17} />
                </button>
                <button
                  type="button"
                  disabled={readOnly || index === draft.learnCards.length - 1}
                  onClick={() => moveLearnCard(index, 1)}
                  className="grid size-10 place-items-center rounded-xl border border-border text-muted disabled:opacity-30"
                  aria-label={`Đưa khối ${index + 1} xuống`}
                >
                  <ChevronDown size={17} />
                </button>
                <button
                  type="button"
                  disabled={readOnly || draft.learnCards.length <= 2}
                  onClick={() => removeLearnCard(index)}
                  className="grid size-10 place-items-center rounded-xl border border-border text-danger disabled:opacity-30"
                  aria-label={`Xóa khối ${index + 1}`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-extrabold text-text">
                Loại nội dung
                <select
                  disabled={readOnly}
                  value={card.kind}
                  onChange={(event) => updateLearnCard(index, { kind: event.target.value as LearnCardDraft['kind'] })}
                  style={{ ...inputStyle, marginTop: '0.35rem' }}
                >
                  {LEARN_KIND_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-extrabold text-text">
                Cách trình bày
                <select
                  disabled={readOnly}
                  value={card.layout}
                  onChange={(event) => updateLearnCard(index, { layout: event.target.value as LearnCardDraft['layout'] })}
                  style={{ ...inputStyle, marginTop: '0.35rem' }}
                >
                  {LEARN_LAYOUT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="mt-1 text-xs font-semibold text-muted">
              {LEARN_LAYOUT_OPTIONS.find((option) => option.id === card.layout)?.description}
            </p>

            <label className="mt-3 block text-xs font-extrabold text-text">
              Tiêu đề khối
              <input
                readOnly={readOnly}
                value={card.title}
                onChange={(event) => updateLearnCard(index, { title: event.target.value })}
                style={{ ...inputStyle, marginTop: '0.35rem' }}
              />
            </label>

            <label className="mt-3 block text-xs font-extrabold text-text">
              Nội dung học sinh đọc
              <textarea
                readOnly={readOnly}
                value={card.body}
                onChange={(event) => updateLearnCard(index, { body: event.target.value })}
                rows={4}
                style={{ ...textareaStyle, marginTop: '0.35rem' }}
                placeholder="Giải thích một ý rõ ràng trong 2–4 câu..."
              />
            </label>

            <label className="mt-3 block text-xs font-extrabold text-text">
              Câu ghi nhớ
              <input
                readOnly={readOnly}
                value={card.tip}
                onChange={(event) => updateLearnCard(index, { tip: event.target.value })}
                style={{ ...inputStyle, marginTop: '0.35rem' }}
                placeholder="Một câu ngắn để học sinh nhớ ý chính"
              />
            </label>

            <div className="mt-3 grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2">
              <label className="text-[11px] font-extrabold text-muted">
                Video chính của phần
                <input
                  type="url"
                  readOnly={readOnly}
                  value={card.videoUrl ?? ''}
                  onChange={(event) => updateLearnCard(index, { videoUrl: event.target.value })}
                  style={{ ...inputStyle, marginTop: '0.25rem' }}
                  placeholder="https://cdn.example.com/video.mp4 hoặc YouTube"
                />
                {!readOnly && (
                  <span className="mt-2 flex min-h-11 cursor-pointer items-center justify-center rounded-xl border-2 border-brand-200 bg-white px-3 text-xs font-extrabold text-brand-700">
                    <Clapperboard size={16} className="mr-2" aria-hidden="true" />
                    {uploadingStageMedia === `${index}:videoUrl` ? 'Đang tải video…' : 'Tải video lên'}
                    <input
                      className="sr-only"
                      type="file"
                      accept="video/mp4,video/webm"
                      disabled={uploadingStageMedia !== null}
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) void uploadLearnCardMedia(index, 'videoUrl', file)
                        event.currentTarget.value = ''
                      }}
                    />
                  </span>
                )}
              </label>

              <label className="text-[11px] font-extrabold text-muted">
                Ảnh chính của phần
                <input
                  type="url"
                  readOnly={readOnly}
                  value={card.imageUrl ?? ''}
                  onChange={(event) => updateLearnCard(index, { imageUrl: event.target.value })}
                  style={{ ...inputStyle, marginTop: '0.25rem' }}
                  placeholder="https://cdn.example.com/image.webp"
                />
                {!readOnly && (
                  <span className="mt-2 flex min-h-11 cursor-pointer items-center justify-center rounded-xl border-2 border-brand-200 bg-white px-3 text-xs font-extrabold text-brand-700">
                    <Eye size={16} className="mr-2" aria-hidden="true" />
                    {uploadingStageMedia === `${index}:imageUrl` ? 'Đang tải ảnh…' : 'Tải ảnh lên'}
                    <input
                      className="sr-only"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      disabled={uploadingStageMedia !== null}
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) void uploadLearnCardMedia(index, 'imageUrl', file)
                        event.currentTarget.value = ''
                      }}
                    />
                  </span>
                )}
              </label>

              {card.videoUrl && (
                <div className="sm:col-span-2 overflow-hidden rounded-xl border border-border">
                  <LectureVideo title={card.title} url={card.videoUrl} />
                </div>
              )}

              {card.imageUrl && !card.videoUrl && (
                <div className="sm:col-span-2 overflow-hidden rounded-xl border border-border">
                  <img
                    src={card.imageUrl}
                    alt={card.imageAlt || card.title}
                    className="aspect-video w-full rounded-xl object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {card.kind === 'aiki-riddle' && (
              <div className="mt-3 rounded-2xl border-2 border-amber-300 bg-amber-50/80 p-4">
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900">
                  <BrainCircuit size={16} className="text-amber-700" />
                  🖼️ Hình ảnh phương án lựa chọn (A và B)
                </p>
                <p className="mt-1 text-xs font-medium text-amber-800">
                  Học sinh nhìn vào hình minh họa để đối chiếu giải pháp trước khi chọn đáp án chính xác.
                </p>
              </div>
            )}
          </section>
        ))}

        {!readOnly && (
          <Button type="button" variant="secondary" onClick={addLearnCard} className="gap-2">
            <Plus size={16} /> Thêm khối nội dung mới
          </Button>
        )}
      </div>

      {sidePreview}
    </div>
  )
}
