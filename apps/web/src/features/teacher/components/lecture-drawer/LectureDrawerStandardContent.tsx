import React from 'react'
import {
  BookOpen,
  Clapperboard,
  ChevronUp,
  ChevronDown,
  Trash2,
  Eye,
  BrainCircuit,
  Plus,
  Lightbulb,
} from 'lucide-react'
import type { LectureDraft, LessonFormat, LearnCardDraft, StageBlockItem } from '../../lib/authoring'
import { getStageBlocks } from '../../lib/authoring'
import {
  LEARN_KIND_OPTIONS,
  LEARN_LAYOUT_OPTIONS,
  AVAILABLE_MODULES,
  inputStyle,
  textareaStyle,
} from './lecture-drawer-constants'
import { cn } from '@/shared/lib/cn'
import { LectureVideo } from '@/features/lesson/components/LectureVideo'
import { StageBlockItemCard } from '../StageBlockItemCard'
import { LectureDrawerGameTab } from './LectureDrawerGameTab'
import { LectureDrawerExerciseTab } from './LectureDrawerExerciseTab'
import { PracticeKindPreview } from './StudentStagePreview'
import { StudentLearnPreview } from './PracticeWorkflowStepsAccordion'
import type { EditableQuestion } from '../QuizQuestionBuilder'
import type { Section } from './LectureDrawerHeader'

export interface LectureDrawerStandardContentProps {
  readOnly: boolean
  draft: LectureDraft
  deferredDraft: LectureDraft
  activeSection: Section
  lessonFormat: LessonFormat
  setLessonFormat: (format: LessonFormat) => void
  applyAikiRuleTemplate: () => void
  set: <K extends keyof LectureDraft>(key: K, value: LectureDraft[K]) => void
  quizQuestions: EditableQuestion[]
  setQuizQuestions: React.Dispatch<React.SetStateAction<EditableQuestion[]>>
  setShowBankPicker: (show: boolean) => void
  moveLearnCard: (index: number, direction: -1 | 1) => void
  removeLearnCard: (index: number) => void
  updateLearnCard: (index: number, patch: Partial<LearnCardDraft>) => void
  uploadingStageMedia: string | null
  uploadLearnCardMedia: (
    index: number,
    field: 'videoUrl' | 'imageUrl' | 'audioUrl' | 'optionImageA' | 'optionImageB' | 'compareLeft' | 'compareRight',
    file: File
  ) => Promise<void>
  addLearnCard: () => void
  handleAddModule: (blockId: string, explicitStageIndex?: number, insertIndex?: number) => void
  moveBlock: (stageIndex: number, blockIndex: number, direction: -1 | 1) => void
  removeBlock: (stageIndex: number, blockId: string) => void
  updateStageBlocks: (stageIndex: number, newBlocks: StageBlockItem[]) => void
  updateBlockItem: (stageIndex: number, blockId: string, blockPatch: Partial<StageBlockItem>) => void
  uploadAdditionalImageItem: (stageIndex: number, imgIndex: number, file: File) => Promise<void>
  previewAikiVoice: (index: number, text: string) => void
  previewSpeakingIndex: number | null
  courseId: string
  showToast: (message: string, tone?: 'success' | 'error' | 'info') => void
  isDragOver: boolean
  setIsDragOver: (over: boolean) => void
  draggingBlockIdx: number | null
  setDraggingBlockIdx: (idx: number | null) => void
  dragOverBlockIdx: number | null
  setDragOverBlockIdx: (idx: number | null) => void
  isTrashDragOver: boolean
  setIsTrashDragOver: (over: boolean) => void
}

/**
 * LectureDrawerStandardContent — Di chuyển các tab legacy standard: content, game, practice, check.
 */
export function LectureDrawerStandardContent({
  readOnly,
  draft,
  deferredDraft,
  activeSection,
  lessonFormat,
  setLessonFormat,
  applyAikiRuleTemplate,
  set,
  quizQuestions,
  setQuizQuestions,
  setShowBankPicker,
  moveLearnCard,
  removeLearnCard,
  updateLearnCard,
  uploadingStageMedia,
  uploadLearnCardMedia,
  addLearnCard,
  handleAddModule,
  moveBlock,
  removeBlock,
  updateStageBlocks,
  updateBlockItem,
  uploadAdditionalImageItem,
  previewAikiVoice,
  previewSpeakingIndex,
  courseId,
  showToast,
  isDragOver,
  setIsDragOver,
  draggingBlockIdx,
  setDraggingBlockIdx,
  dragOverBlockIdx,
  setDragOverBlockIdx,
  isTrashDragOver,
  setIsTrashDragOver,
}: LectureDrawerStandardContentProps) {
  if (activeSection === 'content') {
    return (
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,.95fr)]">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/50 p-4 shadow-sm">
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-800">
              Dạng bài học
            </p>
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
                <span className="mt-1 text-xs text-muted">
                  Tự do thêm bớt và sắp xếp các khối Khái niệm, Ví dụ, So sánh...
                </span>
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
                <span className="mt-1 text-xs text-muted">
                  Mạch chuẩn: Tình huống · Câu đố · Quy tắc · Giải thích · Chốt. Có Video &amp; Giọng đọc.
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-sun-200 bg-sun-50 px-3.5 py-3 text-xs font-bold leading-relaxed text-sun-900">
            <strong>Mỗi khối là một màn đọc ngắn của học sinh.</strong> Chọn loại nội dung, layout và
            sắp thứ tự theo mạch: hiểu ý chính · xem ví dụ · tự ghi nhớ.
          </div>

          {draft.learnCards.map((card, index) => {
            const stageBlocks = getStageBlocks(card, index)

            return (
              <section
                key={card.id}
                className="rounded-2xl border-2 border-border bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-extrabold text-text">
                    Khối {index + 1}: {card.title}
                  </p>
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
                      onChange={(event) =>
                        updateLearnCard(index, {
                          kind: event.target.value as LearnCardDraft['kind'],
                        })
                      }
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
                      onChange={(event) =>
                        updateLearnCard(index, {
                          layout: event.target.value as LearnCardDraft['layout'],
                        })
                      }
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
                        {uploadingStageMedia === `${index}:videoUrl`
                          ? 'Đang tải video…'
                          : 'Tải video lên'}
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

                {/* Khối tải 2 tranh phương án A và B cho Chặng 2 (aiki-riddle) */}
                {card.kind === 'aiki-riddle' && (
                  <div className="mt-3 rounded-2xl border-2 border-amber-300 bg-amber-50/80 p-4">
                    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900">
                      <BrainCircuit size={16} className="text-amber-700" />
                      🖼️ Hình ảnh 2 bức tranh cho phương án lựa chọn (A và B)
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-amber-200 bg-white p-3 shadow-xs">
                        <span className="text-xs font-black text-amber-950">Ảnh A: Bức tranh của Zico</span>
                        <input
                          type="url"
                          readOnly={readOnly}
                          value={card.optionImages?.[0] ?? ''}
                          onChange={(event) => {
                            const next = [...(card.optionImages || ['', ''])]
                            next[0] = event.target.value
                            updateLearnCard(index, { optionImages: next })
                          }}
                          style={{ ...inputStyle, marginTop: '0.35rem' }}
                          placeholder="https://cdn.example.com/zico-hero.webp"
                        />
                      </div>
                      <div className="rounded-xl border border-sky-200 bg-white p-3 shadow-xs">
                        <span className="text-xs font-black text-sky-950">Ảnh B: Bức tranh của Sonet</span>
                        <input
                          type="url"
                          readOnly={readOnly}
                          value={card.optionImages?.[1] ?? ''}
                          onChange={(event) => {
                            const next = [...(card.optionImages || ['', ''])]
                            next[1] = event.target.value
                            updateLearnCard(index, { optionImages: next })
                          }}
                          style={{ ...inputStyle, marginTop: '0.35rem' }}
                          placeholder="https://cdn.example.com/sonet-hero.webp"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )
          })}

          {!readOnly && (
            <button
              type="button"
              onClick={addLearnCard}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sky-300 bg-sky-50 px-4 text-sm font-extrabold text-sky-700 cursor-pointer hover:bg-sky-100"
            >
              <Plus size={18} /> Thêm khối Khám phá
            </button>
          )}
        </div>
        <StudentLearnPreview draft={deferredDraft} />
      </div>
    )
  }

  if (activeSection === 'game') {
    return (
      <LectureDrawerGameTab
        readOnly={readOnly}
        draft={draft}
        quizQuestions={quizQuestions}
        onChangeDraft={set}
        onChangeQuizQuestions={setQuizQuestions}
        onOpenBankPicker={() => setShowBankPicker(true)}
      />
    )
  }

  if (activeSection === 'practice' || activeSection === 'check') {
    return (
      <LectureDrawerExerciseTab
        readOnly={readOnly}
        draft={draft}
        activeSubSection={activeSection as 'practice' | 'check'}
        onChangeDraft={set}
        practicePreview={<PracticeKindPreview draft={draft} compact />}
      />
    )
  }

  return null
}
