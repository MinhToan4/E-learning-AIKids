import React, { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Eye,
  PanelRightClose,
  PanelRightOpen,
  Smartphone,
  Target,
} from 'lucide-react'
import {
  goalLines,
  LEARN_KIND_PRESENTATION,
  LEARN_LAYOUT_OPTIONS,
} from './lecture-drawer-constants'
import { type LectureDraft, defaultLearnCards } from '../../lib/authoring'
import { type SixStageWorkflowStep } from '@/shared/lib/api'

export function CollapsedPreviewRail({
  onExpand,
  label = 'HỌC SINH SẼ THẤY',
}: {
  onExpand: () => void
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onExpand}
      className="w-14 shrink-0 sticky top-4 h-[calc(100vh-10rem)] min-h-[420px] rounded-3xl border-2 border-sky-200 bg-white/95 shadow-clay-xs hover:border-sky-400 hover:bg-sky-50/60 cursor-pointer flex flex-col items-center justify-between py-4 px-1 select-none group transition-all"
      title="Mở rộng xem trước màn học sinh"
      aria-label="Mở rộng xem trước màn học sinh"
    >
      {/* Đỉnh: Nút PanelRightOpen màu sky */}
      <span className="flex size-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-100 group-hover:scale-110 shadow-2xs transition">
        <PanelRightOpen size={16} />
      </span>

      {/* Thân giữa: Icon Eye + Dòng chữ dọc mềm mại HỌC SINH SẼ THẤY */}
      <div className="flex flex-col items-center gap-2 text-sky-800">
        <Eye size={16} className="text-sky-600 group-hover:scale-110 transition shrink-0" />
        <span
          className="text-[10px] font-black tracking-widest text-sky-900 group-hover:text-sky-700 transition"
          style={{ writingMode: 'vertical-rl' }}
        >
          {label}
        </span>
      </div>

      {/* Đáy: Icon Smartphone + chữ PREVIEW */}
      <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-sky-600 transition">
        <Smartphone size={13} className="shrink-0" />
        <span className="text-[9px] font-black tracking-wider">PREVIEW</span>
      </div>
    </button>
  )
}

export const StudentBasicsPreview = React.memo(function StudentBasicsPreview({
  draft,
  onCollapse,
}: {
  draft: LectureDraft
  onCollapse?: () => void
}) {
  const goals = goalLines(draft.goalsText)
  return (
    <aside
      className="ui-card h-fit p-4 lg:sticky lg:top-4"
      aria-label="Xem trước thông tin trạm trên màn học sinh"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-sky-700">
          <Eye size={16} /> Học sinh sẽ thấy
        </p>
        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg transition cursor-pointer"
            title="Thu gọn cột xem trước"
          >
            <PanelRightClose size={13} />
            <span>Thu gọn</span>
          </button>
        )}
      </div>
      <div className="mt-3 rounded-3xl border-2 border-brand-200 bg-brand-50 p-5 text-center shadow-sm">
        <p className="font-display text-xl leading-tight text-brand-800">
          {draft.hook.trim() || 'Câu hỏi khởi động sẽ xuất hiện tại đây'}
        </p>
      </div>
      <div className="mt-4 rounded-2xl border-2 border-border bg-white p-4">
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-coral-600">
          <Target size={16} /> Hôm nay con sẽ
        </p>
        <ol className="mt-3 grid gap-2">
          {(goals.length ? goals : ['Mục tiêu 1', 'Mục tiêu 2', 'Mục tiêu 3'])
            .slice(0, 4)
            .map((goal, index) => (
              <li
                key={`${index}-${goal}`}
                className="flex items-start gap-2 rounded-xl border border-coral-200 bg-coral-50 px-3 py-2 text-sm font-bold text-text"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-xs text-coral-700">
                  {index + 1}
                </span>
                <span>{goal}</span>
              </li>
            ))}
        </ol>
      </div>
      <p className="mt-3 text-xs font-semibold leading-relaxed text-muted">
        Nên dùng một câu hỏi tò mò và 3 mục tiêu có thể quan sát được. Mỗi mục tiêu bắt đầu bằng
        động từ: nhận biết, giải thích, tạo, so sánh hoặc tự kiểm tra.
      </p>
    </aside>
  )
})

export const StudentLearnPreview = React.memo(function StudentLearnPreview({
  draft,
}: {
  draft: LectureDraft
}) {
  const cards = draft.learnCards.length
    ? draft.learnCards
    : defaultLearnCards(draft.concept, draft.example)
  return (
    <aside
      className="ui-card h-fit p-4 lg:sticky lg:top-4"
      aria-label="Xem trước nội dung khám phá trên màn học sinh"
    >
      <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-sky-700">
        <Eye size={16} /> Xem trước phần Khám phá
      </p>
      <div className="mt-3 grid gap-3">
        {cards.map((card) => {
          const presentation = LEARN_KIND_PRESENTATION[card.kind] ?? LEARN_KIND_PRESENTATION.example
          const KindIcon = presentation.icon
          const hasVisuals = card.visualItems.length > 0
          return (
            <article
              key={card.id}
              className={`rounded-2xl border-2 p-4 shadow-sm ${presentation.tone} ${
                card.layout === 'split' && hasVisuals
                  ? 'sm:grid sm:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] sm:gap-3'
                  : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="grid size-10 place-items-center rounded-xl bg-white/80">
                    <KindIcon size={21} aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide">
                    {presentation.label}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-lg">{card.title}</h3>
                <p className="mt-1 whitespace-pre-line text-sm font-semibold leading-relaxed text-text">
                  {card.body.trim() || 'Nội dung của khối sẽ hiển thị ở đây.'}
                </p>
                {card.tip && (
                  <p className="mt-3 rounded-xl border border-current/20 bg-white/80 px-3 py-2 text-xs font-bold">
                    Ghi nhớ: {card.tip}
                  </p>
                )}
              </div>
              {(hasVisuals || card.layout !== 'text') && (
                <div
                  className={`mt-3 grid gap-2 ${
                    card.layout === 'split' ? 'content-center sm:mt-0' : ''
                  } ${
                    card.layout === 'storyboard'
                      ? 'grid-cols-2'
                      : card.layout === 'visual-grid'
                      ? 'sm:grid-cols-2'
                      : 'grid-cols-1'
                  }`}
                >
                  {!hasVisuals && (
                    <div className="col-span-full rounded-xl border border-dashed border-current/30 bg-white/60 p-3 text-center text-xs font-bold">
                      Thêm các ô ví dụ để thấy layout{' '}
                      {LEARN_LAYOUT_OPTIONS.find(
                        (option) => option.id === card.layout,
                      )?.label.toLocaleLowerCase('vi')}
                    </div>
                  )}
                  {card.visualItems.map((item, itemIndex) => (
                    <div
                      key={`${item.label}-${itemIndex}`}
                      className={`rounded-xl border border-current/20 bg-white/80 p-3 ${
                        card.layout === 'storyboard' ? 'relative pt-8' : ''
                      }`}
                    >
                      {card.layout === 'storyboard' && (
                        <span className="absolute left-2 top-2 grid size-5 place-items-center rounded-full bg-current text-[10px] text-white">
                          {itemIndex + 1}
                        </span>
                      )}
                      <strong className="block text-xs">{item.label || `Ví dụ ${itemIndex + 1}`}</strong>
                      <span className="mt-1 block text-xs font-semibold text-text">{item.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </article>
          )
        })}
      </div>
      <div className="mt-3 rounded-xl bg-sky-50 px-3 py-3 text-xs font-semibold leading-relaxed text-sky-900">
        <strong>Cách viết đúng:</strong> giải thích một ý trong 2–4 câu; ví dụ phải có nhân vật hoặc
        tình huống cụ thể; tránh định nghĩa dài và thuật ngữ chưa được giải thích.
      </div>
    </aside>
  )
})

export const PracticeWorkflowStepsAccordion = React.memo(
  function PracticeWorkflowStepsAccordion({
    workflowSteps,
    onChange,
  }: {
    workflowSteps: SixStageWorkflowStep[]
    onChange: (steps: SixStageWorkflowStep[]) => void
  }) {
    const [isOpen, setIsOpen] = useState(false)

    const handleUpdateStep = (idx: number, patch: Partial<SixStageWorkflowStep>) => {
      const nextSteps = [...workflowSteps]
      nextSteps[idx] = { ...nextSteps[idx], ...patch }
      onChange(nextSteps)
    }

    return (
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition-all">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between p-3.5 bg-slate-50/80 hover:bg-slate-100/90 transition cursor-pointer text-left gap-3"
          aria-expanded={isOpen}
        >
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                💬 Lời thoại &amp; Gợi ý từng lượt của AIKI (Nâng cao)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {workflowSteps.length} lượt
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-normal">
              Gợi ý câu lệnh nhanh xuất hiện trên thanh prompt (&apos;Chạm để thử ngay&apos;) và lời
              thoại động viên của AIKI qua các lượt vẽ của bé.
            </p>
          </div>
          <div className="text-slate-400 shrink-0 p-1">
            {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>
        </button>

        {isOpen && (
          <div className="p-3.5 border-t border-slate-200 space-y-3 bg-slate-50/40 animate-in fade-in duration-150">
            {workflowSteps.map((ws, wsIdx) => (
              <div
                key={ws.step || wsIdx}
                className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-brand-900">
                    Bước {ws.step}: {ws.title || `Lượt ${ws.step}`}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Lượt vẽ {ws.step}/4
                  </span>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                    Tên bước kịch bản
                  </label>
                  <input
                    type="text"
                    value={ws.title}
                    onChange={(e) => handleUpdateStep(wsIdx, { title: e.target.value })}
                    placeholder="Tên bước..."
                    className="w-full rounded-lg border border-border bg-page px-2.5 py-1.5 text-xs font-semibold text-text"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                    Câu lệnh gợi ý nhanh (&apos;Chạm để thử ngay&apos;)
                  </label>
                  <input
                    type="text"
                    value={ws.quickPrompt}
                    onChange={(e) => handleUpdateStep(wsIdx, { quickPrompt: e.target.value })}
                    placeholder="Từ khóa / Câu lệnh mẫu khởi đầu..."
                    className="w-full rounded-lg border border-border bg-page px-2.5 py-1.5 text-xs font-mono text-text"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                    Lời thoại AIKI động viên bé
                  </label>
                  <textarea
                    rows={2}
                    value={ws.akiSpeech}
                    onChange={(e) => handleUpdateStep(wsIdx, { akiSpeech: e.target.value })}
                    placeholder="Lời thoại AIKI hướng dẫn..."
                    className="w-full rounded-lg border border-border bg-page p-2 text-xs italic text-text"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  },
)
