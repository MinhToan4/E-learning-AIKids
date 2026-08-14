/**
 * LectureDrawer — Slide-in drawer để tạo/chỉnh sửa bài học (lecture).
 *
 * WHY slide-in drawer:
 * - Giáo viên thấy danh sách bài học bên trái trong khi chỉnh sửa bên phải
 * - Không mất context khi chỉnh sửa
 * - Light theme đồng bộ với hệ thống UI
 *
 * Sections (tab ngang):
 *   1. Cơ bản — tiêu đề, skill, hook, goals, video
 *   2. Kiến thức — concept, example
 *   3. Trò chơi — game selector + questionCount + config
 *   4. Sáng tạo — practice kind + instruction
 *   5. Thử tài — check question, options, answer
 */
import { useState, useCallback, useEffect, useId, useRef } from 'react'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { AdventureModal } from '@/shared/components/ui/AdventureModal'
import { X, CheckCircle2, Circle, Youtube, BookOpen, Gamepad2, Palette, HelpCircle, BookMarked, Target, Lightbulb, Eye, Plus, Trash2, ChevronUp, ChevronDown, BrainCircuit, ScanSearch, ListChecks, PanelsTopLeft, Scale, BookmarkCheck } from 'lucide-react'
import { api } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { useToast } from '@/shared/hooks/useToast'
import {
  GAME_OPTIONS, PRACTICE_OPTIONS, GAME_DIFFICULTIES,
  buildLectureGameConfig, lectureDraftReadiness,
  serializeLectureGameConfig, slugifyAuthoringId,
  type LectureDraft,
  type LearnCardDraft,
} from '../lib/authoring'
import { GameSelector } from './GameSelector'
import { QuizQuestionBuilder, type EditableQuestion } from './QuizQuestionBuilder'
import { CatalogGameBuilder } from './CatalogGameBuilder'
import { QuestionBankPicker } from './QuestionBankPicker'
import { CheckQuestionBuilder } from './CheckQuestionBuilder'
import { CurriculumGame } from '@/features/lesson/components/CurriculumGame'
import type { CurriculumGameConfig } from '@/features/lesson/lib/curriculum-game'

type Props = {
  courseId: string
  lecture: LectureDraft | null      // null = create new
  onSaved: () => void
  onClose: () => void
  // WHY: inline=true → hiển thị trong main panel (không phải overlay).
  // Master-detail layout: sidebar trái, editor phải inline.
  inline?: boolean
  // WHY: archived + archive/restore callback để giáo viên ẩn/hiện bài từ trong editor.
  archived?: boolean
  onArchive?: () => void
  onRestore?: () => void
  // WHY: readOnly=true cho global system courses — chỉ xem, không được gọm PATCH/DELETE.
  // Ngăn chặn 403 bằng cách ẩn mọi nút thực hiện action.
  readOnly?: boolean
  onDirtyChange?: (dirty: boolean) => void
}

type Section = 'basics' | 'content' | 'game' | 'practice' | 'check'

const SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'basics', label: 'Thông tin trạm', icon: <BookOpen size={14} /> },
  { id: 'content', label: 'Khám phá', icon: <BookOpen size={14} /> },
  { id: 'game', label: 'Thử cùng Mee', icon: <Gamepad2 size={14} /> },
  { id: 'practice', label: 'Tự tay làm', icon: <Palette size={14} /> },
  { id: 'check', label: 'Thử thách', icon: <HelpCircle size={14} /> },
]

const SELF_CONTAINED_QUIZ_GAMES = ['math-kids']
const CATALOG_GAMES = ['data-runner', 'truth-patrol']

function goalLines(value: string) {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
}

const LEARN_KIND_OPTIONS: Array<{ id: LearnCardDraft['kind']; label: string }> = [
  { id: 'concept', label: 'Khái niệm' },
  { id: 'example', label: 'Ví dụ đời sống' },
  { id: 'compare', label: 'So sánh' },
  { id: 'steps', label: 'Từng bước' },
  { id: 'storyboard', label: 'Storyboard' },
  { id: 'remember', label: 'Ghi nhớ' },
]

const LEARN_LAYOUT_OPTIONS: Array<{ id: LearnCardDraft['layout']; label: string; description: string }> = [
  { id: 'text', label: 'Đọc tập trung', description: 'Một cột, phù hợp giải thích ý chính.' },
  { id: 'split', label: 'Chữ + ví dụ', description: 'Hai cột trên màn hình lớn.' },
  { id: 'visual-grid', label: 'Lưới ví dụ', description: '2–3 ô để so sánh hoặc phân loại.' },
  { id: 'storyboard', label: 'Storyboard', description: 'Các khung cảnh theo trình tự.' },
]

const LEARN_KIND_PRESENTATION = {
  concept: { label: 'Khái niệm', icon: BrainCircuit, tone: 'border-sun-200 bg-sun-50 text-sun-800' },
  example: { label: 'Ví dụ đời sống', icon: ScanSearch, tone: 'border-mint-200 bg-mint-50 text-mint-800' },
  compare: { label: 'So sánh', icon: Scale, tone: 'border-sky-200 bg-sky-50 text-sky-800' },
  steps: { label: 'Từng bước', icon: ListChecks, tone: 'border-brand-200 bg-brand-50 text-brand-800' },
  storyboard: { label: 'Storyboard', icon: PanelsTopLeft, tone: 'border-coral-200 bg-coral-50 text-coral-800' },
  remember: { label: 'Ghi nhớ', icon: BookmarkCheck, tone: 'border-sun-200 bg-white text-sun-800' },
} satisfies Record<LearnCardDraft['kind'], { label: string; icon: typeof Lightbulb; tone: string }>

function defaultLearnCards(concept = '', example = ''): LearnCardDraft[] {
  return [
    { id: 'concept', title: 'Khám phá ý chính', body: concept, tip: '', kind: 'concept', layout: 'text', visualItems: [] },
    { id: 'example', title: 'Ví dụ để hiểu rõ', body: example, tip: '', kind: 'example', layout: 'split', visualItems: [] },
  ]
}

function normalizeLearnKind(value: unknown, index: number): LearnCardDraft['kind'] {
  if (value === 'concept' || value === 'example' || value === 'compare' || value === 'steps' || value === 'storyboard' || value === 'remember') return value
  if (value === 'guided-practice') return 'steps'
  if (value === 'artifact') return 'remember'
  return index === 0 ? 'concept' : 'example'
}

function normalizeLearnLayout(value: unknown, hasVisualItems: boolean, kind: LearnCardDraft['kind']): LearnCardDraft['layout'] {
  if (value === 'text' || value === 'split' || value === 'visual-grid' || value === 'storyboard') return value
  if (kind === 'storyboard') return 'storyboard'
  return hasVisualItems ? 'split' : 'text'
}

function normalizeLectureDraft(draft: LectureDraft): LectureDraft {
  const sourceCards = draft.learnCards?.length ? draft.learnCards : defaultLearnCards(draft.concept, draft.example)
  return {
    ...draft,
    practiceConfigText: draft.practiceConfigText ?? '',
    learnCards: sourceCards.map((card, index) => {
      const visualItems = Array.isArray(card.visualItems) ? card.visualItems : []
      const kind = normalizeLearnKind(card.kind, index)
      return {
        ...card,
        id: card.id || `learn-${index + 1}`,
        title: card.title || `Khối khám phá ${index + 1}`,
        body: card.body || '',
        tip: card.tip ?? '',
        kind,
        layout: normalizeLearnLayout(card.layout, visualItems.length > 0, kind),
        visualItems,
      }
    }),
  }
}

function StudentBasicsPreview({ draft }: { draft: LectureDraft }) {
  const goals = goalLines(draft.goalsText)
  return (
    <aside className="ui-card h-fit p-4 lg:sticky lg:top-4" aria-label="Xem trước thông tin trạm trên màn học sinh">
      <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-sky-700"><Eye size={16} /> Học sinh sẽ thấy</p>
      <div className="mt-3 rounded-3xl border-2 border-brand-200 bg-brand-50 p-5 text-center shadow-sm">
        <p className="font-display text-xl leading-tight text-brand-800">{draft.hook.trim() || 'Câu hỏi khởi động sẽ xuất hiện tại đây'}</p>
      </div>
      <div className="mt-4 rounded-2xl border-2 border-border bg-white p-4">
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-coral-600"><Target size={16} /> Hôm nay con sẽ</p>
        <ol className="mt-3 grid gap-2">
          {(goals.length ? goals : ['Mục tiêu 1', 'Mục tiêu 2', 'Mục tiêu 3']).slice(0, 4).map((goal, index) => (
            <li key={`${index}-${goal}`} className="flex items-start gap-2 rounded-xl border border-coral-200 bg-coral-50 px-3 py-2 text-sm font-bold text-text">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-xs text-coral-700">{index + 1}</span>
              <span>{goal}</span>
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-3 text-xs font-semibold leading-relaxed text-muted">Nên dùng một câu hỏi tò mò và 3 mục tiêu có thể quan sát được. Mỗi mục tiêu bắt đầu bằng động từ: nhận biết, giải thích, tạo, so sánh hoặc tự kiểm tra.</p>
    </aside>
  )
}

function StudentLearnPreview({ draft }: { draft: LectureDraft }) {
  const cards = draft.learnCards.length ? draft.learnCards : defaultLearnCards(draft.concept, draft.example)
  return (
    <aside className="ui-card h-fit p-4 lg:sticky lg:top-4" aria-label="Xem trước nội dung khám phá trên màn học sinh">
      <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-sky-700"><Eye size={16} /> Xem trước phần Khám phá</p>
      <div className="mt-3 grid gap-3">
        {cards.map((card, index) => {
          const presentation = LEARN_KIND_PRESENTATION[card.kind] ?? LEARN_KIND_PRESENTATION.example
          const KindIcon = presentation.icon
          const hasVisuals = card.visualItems.length > 0
          return (
          <article key={card.id} className={`rounded-2xl border-2 p-4 shadow-sm ${presentation.tone} ${card.layout === 'split' && hasVisuals ? 'sm:grid sm:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] sm:gap-3' : ''}`}>
            <div>
            <div className="flex items-center justify-between gap-2">
              <span className="grid size-10 place-items-center rounded-xl bg-white/80"><KindIcon size={21} aria-hidden="true" /></span>
              <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide">{presentation.label}</span>
            </div>
            <h3 className="mt-2 font-display text-lg">{card.title}</h3>
            <p className="mt-1 whitespace-pre-line text-sm font-semibold leading-relaxed text-text">{card.body.trim() || 'Nội dung của khối sẽ hiển thị ở đây.'}</p>
            {card.tip && <p className="mt-3 rounded-xl border border-current/20 bg-white/80 px-3 py-2 text-xs font-bold">Ghi nhớ: {card.tip}</p>}
            </div>
            {(hasVisuals || card.layout !== 'text') && (
              <div className={`mt-3 grid gap-2 ${card.layout === 'split' ? 'content-center sm:mt-0' : ''} ${card.layout === 'storyboard' ? 'grid-cols-2' : card.layout === 'visual-grid' ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                {!hasVisuals && <div className="col-span-full rounded-xl border border-dashed border-current/30 bg-white/60 p-3 text-center text-xs font-bold">Thêm các ô ví dụ để thấy layout {LEARN_LAYOUT_OPTIONS.find((option) => option.id === card.layout)?.label.toLocaleLowerCase('vi')}</div>}
                {card.visualItems.map((item, itemIndex) => (
                  <div key={`${item.label}-${itemIndex}`} className={`rounded-xl border border-current/20 bg-white/80 p-3 ${card.layout === 'storyboard' ? 'relative pt-8' : ''}`}>
                    {card.layout === 'storyboard' && <span className="absolute left-2 top-2 grid size-5 place-items-center rounded-full bg-current text-[10px] text-white">{itemIndex + 1}</span>}
                    <strong className="block text-xs">{item.label || `Ví dụ ${itemIndex + 1}`}</strong>
                    <span className="mt-1 block text-xs font-semibold text-text">{item.text}</span>
                  </div>
                ))}
              </div>
            )}
          </article>
        )})}
      </div>
      <div className="mt-3 rounded-xl bg-sky-50 px-3 py-3 text-xs font-semibold leading-relaxed text-sky-900">
        <strong>Cách viết đúng:</strong> giải thích một ý trong 2–4 câu; ví dụ phải có nhân vật hoặc tình huống cụ thể; tránh định nghĩa dài và thuật ngữ chưa được giải thích.
      </div>
    </aside>
  )
}

function practiceKindLabel(kind: string) {
  return PRACTICE_OPTIONS.find((option) => option.id === kind)?.label ?? 'Kiểu thực hành cũ'
}

function PracticeKindPreview({ draft, compact = false }: { draft: LectureDraft; compact?: boolean }) {
  const orderingCards = goalLines(draft.practiceConfigText).map((line, index) => {
    const [title, ...description] = line.split('|')
    return { title: title?.trim() || `Bước ${index + 1}`, description: description.join('|').trim() }
  })
  const shell = 'rounded-2xl border-2 border-mint-200 bg-white p-4 shadow-sm'
  const input = 'min-h-11 w-full rounded-xl border-2 border-border bg-page px-3 text-sm font-semibold text-muted'

  return (
    <section className="rounded-3xl border-2 border-mint-200 bg-mint-50 p-4" aria-label={`Xem trước kiểu thực hành ${practiceKindLabel(draft.practiceKind)}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-mint-700">Học sinh sẽ thao tác</p>
          <h4 className="mt-1 font-display text-lg text-text">{practiceKindLabel(draft.practiceKind)}</h4>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-mint-800">Preview trực tiếp</span>
      </div>

      {draft.practiceKind === 'intro' && <div className={shell}>
        <p className="font-extrabold text-text">Nhiệm vụ làm quen</p>
        <p className="mt-2 text-sm font-semibold text-muted">{draft.practiceInstruction || 'Đọc nhiệm vụ ngắn và xác nhận con đã sẵn sàng.'}</p>
        <button type="button" disabled className="mt-4 min-h-11 rounded-xl bg-brand-600 px-5 font-extrabold text-white">Con đã sẵn sàng</button>
      </div>}

      {(draft.practiceKind === 'journal' || draft.practiceKind === 'reflect') && <div className={shell}>
        <p className="font-extrabold text-text">{draft.practiceKind === 'reflect' ? 'Con tự nhìn lại sản phẩm' : 'Sổ tay thực hành của con'}</p>
        <p className="mt-1 text-sm font-semibold text-muted">{draft.reflectionPrompt || 'Con quan sát được gì và vì sao con nghĩ như vậy?'}</p>
        <textarea readOnly className={`${input} mt-3 min-h-28 p-3`} placeholder="Con viết câu trả lời tại đây…" />
      </div>}

      {draft.practiceKind === 'sketch' && <div className={shell}>
        <p className="font-extrabold text-text">Bảng phác thảo</p>
        <div className="mt-3 grid min-h-40 place-items-center rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 text-center">
          <div><span className="text-4xl" aria-hidden="true">✏️</span><p className="mt-2 text-sm font-bold text-brand-700">Vẽ bằng bút, tẩy và chọn màu</p></div>
        </div>
      </div>}

      {draft.practiceKind === 'character' && <div className={shell}>
        <p className="font-extrabold text-text">Xưởng tạo nhân vật</p>
        <div className="mt-3 flex flex-wrap gap-2">{['🐱 Mèo', '🤖 Robot', '🦊 Cáo'].map((item) => <span key={item} className="rounded-xl border-2 border-brand-200 bg-brand-50 px-3 py-2 text-sm font-bold">{item}</span>)}</div>
        <div className="mt-2 flex flex-wrap gap-2">{['Tò mò', 'Can đảm', 'Vui tính'].map((item) => <span key={item} className="rounded-full bg-sun-100 px-3 py-1 text-xs font-bold">{item}</span>)}</div>
        <input readOnly className={`${input} mt-3`} placeholder="Biệt danh an toàn của nhân vật" />
      </div>}

      {draft.practiceKind === 'style' && <div className={shell}>
        <p className="font-extrabold text-text">So sánh và chọn phong cách</p>
        <div className="mt-3 grid grid-cols-3 gap-2">{['🖍️ Màu sáp', '🎨 Cắt giấy', '✒️ Nét mực'].map((item, index) => <div key={item} className={`rounded-xl border-2 p-3 text-center text-xs font-bold ${index === 0 ? 'border-brand-500 bg-brand-50' : 'border-border'}`}>{item}</div>)}</div>
      </div>}

      {draft.practiceKind === 'ai_pick' && <div className={shell}>
        <p className="font-extrabold text-text">Mô tả ý tưởng và chọn tham chiếu an toàn</p>
        <textarea readOnly className={`${input} mt-3 min-h-24 p-3`} placeholder="Con muốn tạo điều gì? Chi tiết quan trọng là gì?" />
        <div className="mt-3 grid grid-cols-3 gap-2">{['🖼️ Tư liệu 1', '🌈 Tư liệu 2', '🧩 Tư liệu 3'].map((item) => <div key={item} className="rounded-xl border-2 border-border bg-page p-3 text-center text-xs font-bold">{item}</div>)}</div>
      </div>}

      {draft.practiceKind === 'story' && <div className={shell}>
        <p className="font-extrabold text-text">Chọn ba nhịp của câu chuyện</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">{[['1', 'Mở đầu'], ['2', 'Sự cố'], ['3', 'Kết thúc']].map(([number, label]) => <div key={number} className="rounded-xl border-2 border-brand-200 bg-brand-50 p-3"><span className="text-xs font-extrabold text-brand-600">NHỊP {number}</span><p className="mt-1 text-sm font-bold">{label}</p><span className="mt-2 block rounded-lg bg-white px-2 py-2 text-xs text-muted">Chọn một thẻ…</span></div>)}</div>
      </div>}

      {draft.practiceKind === 'video' && <div className={shell}>
        <p className="font-extrabold text-text">Kế hoạch cảnh video</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">{['🎬 Cảnh mở', '🏃 Chuyển động', '✨ Cảnh kết'].map((item, index) => <div key={item} className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3 text-sm font-bold"><span className="block text-xs text-sky-700">CẢNH {index + 1}</span>{item}<span className="mt-2 block text-xs font-semibold text-muted">Mô tả hành động…</span></div>)}</div>
      </div>}

      {draft.practiceKind === 'palette' && <div className={shell}>
        <p className="font-extrabold text-text">Chọn ba màu và giải thích thông điệp</p>
        <div className="mt-3 flex gap-3">{['#6d5dfc', '#ff7a90', '#43d6b3'].map((color) => <span key={color} className="size-12 rounded-2xl border-4 border-white shadow-sm" style={{ backgroundColor: color }} />)}</div>
        <textarea readOnly className={`${input} mt-3 min-h-20 p-3`} placeholder="Vì sao các màu này phù hợp với sản phẩm?" />
      </div>}

      {draft.practiceKind === 'ordering' && <div className={shell}>
        <p className="font-extrabold text-text">Kéo thả để sắp xếp đúng trình tự</p>
        <div className="mt-3 grid gap-2">{(orderingCards.length ? orderingCards : [{ title: 'Thẻ 1', description: 'Nhập ít nhất ba thẻ ở phần cấu hình.' }, { title: 'Thẻ 2', description: 'Các thẻ sẽ được đảo khi học sinh bắt đầu.' }, { title: 'Thẻ 3', description: 'Học sinh kéo thả về đúng thứ tự.' }]).slice(0, compact ? 3 : 6).map((card, index) => <div key={`${card.title}-${index}`} className="flex items-center gap-3 rounded-xl border-2 border-border bg-page px-3 py-2"><span className="text-lg text-muted">⠿</span><span className="grid size-7 place-items-center rounded-lg bg-brand-100 text-xs font-extrabold text-brand-700">{index + 1}</span><div><p className="text-sm font-extrabold">{card.title}</p>{card.description && <p className="text-xs font-semibold text-muted">{card.description}</p>}</div></div>)}</div>
      </div>}
    </section>
  )
}

function FullStationPreview({ draft, gameConfig }: { draft: LectureDraft; gameConfig: CurriculumGameConfig }) {
  const [previewSection, setPreviewSection] = useState<Section>('basics')
  const goals = goalLines(draft.goalsText)
  const steps = goalLines(draft.practiceStepsText)
  const criteria = goalLines(draft.successCriteriaText)
  return (
    <div className="text-left">
      <nav className="mb-4 flex gap-2 overflow-x-auto rounded-2xl border border-border bg-white p-2" aria-label="Chọn phần muốn xem trước">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setPreviewSection(section.id)}
            aria-current={previewSection === section.id ? 'page' : undefined}
            className={cn(
              'flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-extrabold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus',
              previewSection === section.id ? 'bg-brand-600 text-white shadow-press' : 'text-muted hover:bg-brand-50 hover:text-brand-700',
            )}
          >
            {section.icon}{section.label}
          </button>
        ))}
      </nav>

      <div className="station-preview-scroll grid gap-4 overflow-y-auto pr-1">
      {previewSection === 'basics' && <section className="rounded-3xl border-2 border-brand-200 bg-brand-50 p-5 text-center">
        <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">Câu hỏi mở trạm</p>
        <h3 className="mt-2 font-display text-2xl text-brand-900">{draft.hook.trim() || 'Chưa có câu hỏi khởi động'}</h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {(goals.length ? goals : ['Chưa có mục tiêu học tập']).map((goal, index) => (
            <div key={`${index}-${goal}`} className="rounded-2xl bg-white px-3 py-3 text-sm font-bold text-text shadow-sm">
              <span className="mr-2 text-coral-600">{index + 1}.</span>{goal}
            </div>
          ))}
        </div>
      </section>}

      {previewSection === 'content' && <StudentLearnPreview draft={draft} />}

      {previewSection === 'game' && (
        <div className="ui-card p-5">
          <div className="mb-4">
            <div className="companion-bubble" style={{ maxWidth: 'none', width: '100%' }}>
              <p className="text-sm font-bold">{draft.gameInstruction || 'Chơi một lượt để ghi nhớ ý chính của bài!'}</p>
            </div>
          </div>
          <CurriculumGame
            gameType={draft.gameType}
            gameConfig={gameConfig}
            instruction={draft.gameInstruction}
            outcome={draft.gameOutcome}
            onComplete={() => undefined}
          />
          <p className="mt-4 rounded-xl bg-sun-50 px-3 py-3 text-center text-xs font-semibold text-sun-900">Chế độ xem trước: giáo viên có thể chơi thử, nhưng kết quả không được ghi vào tiến độ học sinh.</p>
        </div>
      )}

      {previewSection === 'practice' && <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,.85fr)]">
        <div className="grid gap-4">
        <section className="rounded-3xl border-2 border-mint-200 bg-mint-50 p-5">
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-mint-700"><Palette size={16} /> Tự tay làm</p>
          <h3 className="mt-2 font-display text-xl text-text">{draft.product || 'Chưa đặt tên sản phẩm'}</h3>
          <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-relaxed text-text">{draft.practiceInstruction || 'Chưa có hướng dẫn thực hành.'}</p>
          {steps.length > 0 && <ol className="mt-3 grid gap-2">{steps.map((step, index) => <li key={step} className="rounded-xl bg-white px-3 py-2 text-xs font-bold"><span className="mr-2 text-mint-700">{index + 1}.</span>{step}</li>)}</ol>}
          {criteria.length > 0 && <div className="mt-3 rounded-xl border border-mint-200 bg-white p-3 text-xs font-semibold"><strong>Con tự kiểm tra:</strong> {criteria.join(' · ')}</div>}
        </section>
        <PracticeKindPreview draft={draft} />
        </div>
        <aside className="rounded-3xl border-2 border-border bg-white p-5">
          <p className="text-xs font-extrabold uppercase tracking-wide text-muted">Sau khi làm xong</p>
          <p className="mt-3 text-sm font-bold leading-relaxed text-text">Câu hỏi nhìn lại: {draft.reflectionPrompt || 'Chưa có câu hỏi giúp học sinh tự nhìn lại sản phẩm.'}</p>
          <p className="mt-3 rounded-xl bg-sun-50 px-3 py-3 text-xs font-semibold text-sun-900">Sản phẩm được lưu riêng tư và chỉ chia sẻ khi có luồng duyệt phù hợp.</p>
        </aside>
      </div>}

      {previewSection === 'check' && <section className="rounded-3xl border-2 border-coral-200 bg-coral-50 p-5">
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-coral-700"><HelpCircle size={16} /> Thử thách cuối trạm</p>
        <p className="mt-2 text-sm font-bold text-text">{draft.checkQuestions.length || (draft.checkQuestion ? 1 : 0)} câu hỏi kiểm tra · Học sinh cần hoàn thành trước khi nhận thưởng.</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {(draft.checkQuestions.length ? draft.checkQuestions : draft.checkQuestion ? [{ prompt: draft.checkQuestion, options: [draft.checkOption1, draft.checkOption2, draft.checkOption3].filter(Boolean), answer: Number(draft.correctIndex), explain: draft.checkExplain }] : []).map((question, index) => (
            <article key={`${index}-${question.prompt}`} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="font-extrabold text-text">{index + 1}. {question.prompt}</p>
              <div className="mt-3 grid gap-2">{question.options.map((option, optionIndex) => <div key={`${optionIndex}-${option}`} className="rounded-xl border border-border px-3 py-2 text-sm font-semibold">{String.fromCharCode(65 + optionIndex)}. {option}</div>)}</div>
              {question.explain && <p className="mt-3 text-xs font-semibold text-muted">Phản hồi sau khi trả lời: {question.explain}</p>}
            </article>
          ))}
        </div>
      </section>}
      </div>
    </div>
  )
}

function emptyDraft(): LectureDraft {
  return {
    id: '', title: '', skill: '', hook: '',
    practiceKind: 'journal', videoUrl: '',
    concept: '', example: '', learnCards: defaultLearnCards(),
    reward: '', duration: '',
    goalsText: '',
    gameType: 'math-kids',
    gameMode: 'required',
    gameAllowedTypes: ['math-kids'],
    gameDifficulty: 'steady',
    gameInstruction: '',
    gameOutcome: '',
    gameCardsText: '',
    gameStructuredText: '',
    // WHY: 6 là số câu hỏi mặc định hợp lý cho 1 bài học.
    // Giáo viên có thể chỉnh từ 1–30 tuỳ độ khó bài.
    questionCount: 6,
    practiceInstruction: '',
    product: '',
    practiceStepsText: '',
    successCriteriaText: '',
    reflectionPrompt: '',
    practiceConfigText: '',
    checkQuestions: [],
    checkQuestion: '', checkOption1: '', checkOption2: '', checkOption3: '',
    correctIndex: '0', checkExplain: '',
  }
}

export function LectureDrawer({ courseId, lecture, onSaved, onClose, inline = false, archived = false, onArchive, onRestore, readOnly = false, onDirtyChange }: Props) {
  const initialDraftRef = useRef(normalizeLectureDraft(lecture ?? emptyDraft()))
  const [draft, setDraft] = useState<LectureDraft>(() => initialDraftRef.current)
  const [activeSection, setActiveSection] = useState<Section>('basics')
  const [quizQuestions, setQuizQuestions] = useState<EditableQuestion[]>([])
  const [showBankPicker, setShowBankPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  const [showFullPreview, setShowFullPreview] = useState(false)
  const draftStorageKey = `aikids:teacher-lecture-draft:${courseId}:${lecture?.id || 'new'}`
  const [recovery, setRecovery] = useState<{ savedAt: string; draft: LectureDraft } | null>(() => {
    if (readOnly) return null
    try {
      const raw = window.sessionStorage.getItem(draftStorageKey)
      if (!raw) return null
      const parsed = JSON.parse(raw) as { savedAt?: string; draft?: LectureDraft }
      return parsed.savedAt && parsed.draft ? { savedAt: parsed.savedAt, draft: normalizeLectureDraft(parsed.draft) } : null
    } catch { return null }
  })
  const { showToast } = useToast()
  const uid = useId()

  const isEdit = !!lecture
  const readiness = lectureDraftReadiness(draft)
  const dirty = !readOnly && JSON.stringify(draft) !== JSON.stringify(initialDraftRef.current)

  useEffect(() => {
    onDirtyChange?.(dirty)
    return () => onDirtyChange?.(false)
  }, [dirty, onDirtyChange])

  useEffect(() => {
    if (!dirty) return
    const protectDraft = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', protectDraft)
    return () => window.removeEventListener('beforeunload', protectDraft)
  }, [dirty])

  useEffect(() => {
    if (readOnly || !dirty || recovery) return
    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem(draftStorageKey, JSON.stringify({ savedAt: new Date().toISOString(), draft }))
    }, 600)
    return () => window.clearTimeout(timer)
  }, [draft, dirty, draftStorageKey, readOnly, recovery])

  const requestClose = useCallback(() => {
    if (dirty) setConfirmClose(true)
    else onClose()
  }, [dirty, onClose])

  const set = useCallback(<K extends keyof LectureDraft>(key: K, value: LectureDraft[K]) => {
    if (readOnly) return
    setDraft((prev) => {
      const next = { ...prev, [key]: value }
      // Auto-generate slug từ title nếu đang tạo mới và chưa có id
      if (key === 'title' && !isEdit && !prev.id.trim()) {
        next.id = slugifyAuthoringId(value as string)
      }
      return next
    })
  }, [isEdit, readOnly])

  const updateLearnCard = useCallback((index: number, patch: Partial<LearnCardDraft>) => {
    if (readOnly) return
    setDraft((previous) => {
      const learnCards = previous.learnCards.map((card, cardIndex) => cardIndex === index ? { ...card, ...patch } : card)
      const conceptCard = learnCards.find((card) => card.kind === 'concept')
      const exampleCard = learnCards.find((card) => card.kind === 'example')
      return { ...previous, learnCards, concept: conceptCard?.body ?? previous.concept, example: exampleCard?.body ?? previous.example }
    })
  }, [readOnly])

  const addLearnCard = useCallback(() => {
    if (readOnly) return
    setDraft((previous) => ({
      ...previous,
      learnCards: [...previous.learnCards, {
        id: `learn-${Date.now().toString(36)}`,
        title: 'Khối khám phá mới',
        body: '',
        tip: '',
        kind: 'example',
        layout: 'text',
        visualItems: [],
      }],
    }))
  }, [readOnly])

  const moveLearnCard = useCallback((index: number, direction: -1 | 1) => {
    if (readOnly) return
    setDraft((previous) => {
      const target = index + direction
      if (target < 0 || target >= previous.learnCards.length) return previous
      const learnCards = [...previous.learnCards]
      const current = learnCards[index]
      const adjacent = learnCards[target]
      if (!current || !adjacent) return previous
      learnCards[index] = adjacent
      learnCards[target] = current
      return { ...previous, learnCards }
    })
  }, [readOnly])

  const removeLearnCard = useCallback((index: number) => {
    if (readOnly) return
    setDraft((previous) => previous.learnCards.length <= 2
      ? previous
      : { ...previous, learnCards: previous.learnCards.filter((_, cardIndex) => cardIndex !== index) })
  }, [readOnly])

  const updateLearnVisualItem = useCallback((cardIndex: number, itemIndex: number, patch: Partial<LearnCardDraft['visualItems'][number]>) => {
    if (readOnly) return
    setDraft((previous) => ({
      ...previous,
      learnCards: previous.learnCards.map((card, index) => index !== cardIndex ? card : {
        ...card,
        visualItems: card.visualItems.map((item, visualIndex) => visualIndex === itemIndex ? { ...item, ...patch } : item),
      }),
    }))
  }, [readOnly])

  const addLearnVisualItem = useCallback((cardIndex: number) => {
    if (readOnly) return
    const tones: NonNullable<LearnCardDraft['visualItems'][number]['tone']>[] = ['sky', 'mint', 'sun', 'coral', 'brand']
    setDraft((previous) => ({
      ...previous,
      learnCards: previous.learnCards.map((card, index) => index !== cardIndex ? card : {
        ...card,
        visualItems: [...card.visualItems, {
          label: `Ví dụ ${card.visualItems.length + 1}`,
          text: '',
          tone: tones[card.visualItems.length % tones.length],
        }],
      }),
    }))
  }, [readOnly])

  const removeLearnVisualItem = useCallback((cardIndex: number, itemIndex: number) => {
    if (readOnly) return
    setDraft((previous) => ({
      ...previous,
      learnCards: previous.learnCards.map((card, index) => index !== cardIndex ? card : {
        ...card,
        visualItems: card.visualItems.filter((_, visualIndex) => visualIndex !== itemIndex),
      }),
    }))
  }, [readOnly])

  // Xác định game hiện tại cần cấu hình gì
  const activeGameTypes = draft.gameMode === 'student_choice' ? draft.gameAllowedTypes : [draft.gameType]
  const needsQuizConfig = activeGameTypes.some((t) => SELF_CONTAINED_QUIZ_GAMES.includes(t))
  const needsCatalogConfig = activeGameTypes.some((t) => CATALOG_GAMES.includes(t))
  const catalogGameType = activeGameTypes.find((t) => CATALOG_GAMES.includes(t)) as 'data-runner' | 'truth-patrol' | undefined

  // WHY: quizQuestions được truyền vào buildLectureGameConfig để lưu DB
  // (không tách state, không share giữa các bài học)
  function buildGameConfigForSave() {
    const questionsForSave = needsQuizConfig && quizQuestions.length > 0
      ? quizQuestions.map((q) => ({
          id: q.id,
          prompt: q.prompt,
          options: q.options,
          answer: q.answer,
          why: q.explanation,
        }))
      : undefined
    return buildLectureGameConfig(draft, questionsForSave)
  }

  async function handleSave() {
    if (readOnly) return
    const missing = readiness.steps.flatMap((s) => s.missing)
    if (missing.length > 0) {
      const firstIncomplete = readiness.steps.find((step) => !step.complete)
      if (firstIncomplete?.id === 'basics') setActiveSection('basics')
      else if (firstIncomplete?.id === 'content') setActiveSection('content')
      else if (firstIncomplete?.id === 'game') setActiveSection('game')
      else if (firstIncomplete?.id === 'practice') setActiveSection('practice')
      else if (firstIncomplete?.id === 'check') setActiveSection('check')
      showToast(`Còn thiếu: ${missing.slice(0, 3).join(', ')}`, 'error')
      return
    }

    setSaving(true)
    try {
      const gameConfig = buildGameConfigForSave()
      const payload = {
        courseId,
        id: draft.id,
        title: draft.title,
        skill: draft.skill,
        hook: draft.hook,
        goals: draft.goalsText.split('\n').map((s) => s.trim()).filter(Boolean),
        concept: draft.concept,
        example: draft.example,
        learnCards: draft.learnCards,
        videoUrl: draft.videoUrl || null,
        reward: draft.reward,
        duration: draft.duration,
        practiceKind: draft.practiceKind,
        gameType: draft.gameType,
        gameConfig,
        gameInstruction: draft.gameInstruction,
        gameOutcome: draft.gameOutcome,
        gameCards: draft.gameCardsText.split('\n').map((s) => s.trim()).filter(Boolean),
        practiceInstruction: draft.practiceInstruction,
        product: draft.product,
        practiceSteps: draft.practiceStepsText.split('\n').map((s) => s.trim()).filter(Boolean),
        successCriteria: draft.successCriteriaText.split('\n').map((s) => s.trim()).filter(Boolean),
        reflectionPrompt: draft.reflectionPrompt,
        practiceConfig: draft.practiceKind === 'ordering' ? {
          activityType: 'ordering',
          prompt: draft.practiceInstruction,
          cards: draft.practiceConfigText.split(/\r?\n/).map((line, index) => {
            const [title, ...description] = line.split('|')
            return { id: `card-${index + 1}`, title: title?.trim() ?? '', description: description.join('|').trim() }
          }).filter((card) => card.title && card.description),
        } : undefined,
        // WHY: checkQuestions thay thế check fields cũ — nhiều câu, nhiều đáp án
        checkQuestions: draft.checkQuestions,
        checkQuestion: draft.checkQuestions[0]?.prompt ?? draft.checkQuestion,
        checkOptions: draft.checkQuestions.length > 0
          ? draft.checkQuestions[0].options
          : [draft.checkOption1, draft.checkOption2, draft.checkOption3],
        correctIndex: draft.checkQuestions.length > 0
          ? draft.checkQuestions[0].answer
          : parseInt(draft.correctIndex) || 0,
        checkExplain: draft.checkQuestions[0]?.explain ?? draft.checkExplain,
      }

      if (isEdit) {
        await api(`/api/teacher/lectures/${lecture.id}`, {
          method: 'PATCH', body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        })
        showToast('✅ Đã cập nhật bài học!', 'success')
      } else {
        await api('/api/teacher/lectures', {
          method: 'POST', body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        })
        showToast('✅ Đã tạo bài học mới!', 'success')
      }
      onSaved()
      window.sessionStorage.removeItem(draftStorageKey)
      onClose()
    } catch (err) {
      showToast(`Lỗi: ${err instanceof Error ? err.message : 'Không thể lưu'}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Sync quizQuestions từ existing gameConfig khi load lecture
  useState(() => {
    if (lecture) {
      try {
        const cfg = JSON.parse(lecture.gameStructuredText || '{}') as Record<string, unknown>
        if (Array.isArray(cfg.quizQuestions)) {
          const questions = (cfg.quizQuestions as Record<string, unknown>[]).map((q, i): EditableQuestion => ({
            id: typeof q.id === 'string' ? q.id : `q-${i}`,
            prompt: typeof q.prompt === 'string' ? q.prompt : '',
            options: Array.isArray(q.options) ? q.options as string[] : ['', ''],
            answer: typeof q.answer === 'number' ? q.answer : 0,
            explanation: typeof q.why === 'string' ? q.why : '',
            imageUrl: null,
            tags: [],
            ageMin: 6, ageMax: 11, difficulty: 'steady',
          }))
          if (questions.length > 0) setQuizQuestions(questions)
        }
      } catch {
        // Ignore parse errors — fallback về rỗng
      }
    }
  })

  const sectionStatus = (sectionId: Section) => {
    const step = readiness.steps.find((s) => {
      if (sectionId === 'basics') return s.id === 'basics'
      if (sectionId === 'content') return s.id === 'content'
      if (sectionId === 'game') return s.id === 'game'
      if (sectionId === 'practice') return s.id === 'practice'
      if (sectionId === 'check') return s.id === 'check'
      return false
    })
    return step?.complete ?? false
  }

  const sectionMissing = (sectionId: Section) => {
    const stepId = sectionId === 'basics' ? 'basics' : sectionId === 'content' ? 'content' : sectionId === 'game' ? 'game' : sectionId === 'practice' ? 'practice' : 'check'
    return readiness.steps.find((step) => step.id === stepId)?.missing ?? []
  }

  // WHY: inline=true → không có backdrop, không fixed position.
  // Container fill 100% chiều cao parent (main panel trong TeacherPage).
  const containerStyle: React.CSSProperties = inline ? {
    display: 'flex', flexDirection: 'column', height: '100%',
    background: '#f8fafc', overflow: 'hidden',
    borderRadius: '1rem', border: '1px solid #e2e8f0',
  } : {
    position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 401,
    width: '100%', maxWidth: '700px',
    background: '#f8fafc',
    borderLeft: '1px solid #e2e8f0',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    boxShadow: '-20px 0 60px rgba(15,23,42,0.15)',
  }

  const body = (
    <>
      <div style={containerStyle}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#fff',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a' }}>
                {readOnly ? 'Xem trạm học' : isEdit ? 'Chỉnh sửa trạm học' : 'Tạo trạm học mới'}
              </div>
              {readOnly && (
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.375rem', padding: '0.125rem 0.5rem' }}>
                  Chỉ xem
                </span>
              )}
              {!readOnly && isEdit && archived && (
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#ea580c', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '0.375rem', padding: '0.125rem 0.5rem' }}>
                  Đang ẩn
                </span>
              )}
            </div>
            {draft.title && (
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.125rem' }}>
                {draft.title}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowFullPreview(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-extrabold text-brand-700 hover:bg-brand-100"
            >
              <Eye size={14} /> Xem toàn bộ
            </button>
            {/* Progress indicator — chỉ có nghĩa khi edit/create, ẩn khi chỉ xem */}
            {!readOnly && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#64748b' }}>
                <span style={{ color: readiness.complete ? '#10b981' : '#f97316', fontWeight: 700 }}>
                  {readiness.completed}/{readiness.total}
                </span>
                <span>bước</span>
              </div>
            )}
            {/* WHY: Ẩn archive buttons hoàn toàn khi readOnly=true — tránh 403. */}
            {!readOnly && isEdit && (
              archived ? (
                <button
                  type="button"
                  onClick={onRestore}
                  style={{ padding: '0.375rem 0.75rem', border: '1px solid #6ee7b7', background: '#ecfdf5', borderRadius: '0.5rem', color: '#059669', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  ↩ Khôi phục
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onArchive}
                  style={{ padding: '0.375rem 0.75rem', border: '1px solid #fca5a5', background: '#fff1f2', borderRadius: '0.5rem', color: '#dc2626', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  🗃 Ẩn bài
                </button>
              )
            )}
            <button
              type="button"
              id={`${uid}-drawer-close`}
              onClick={requestClose}
              style={{ padding: '0.5rem', border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '0.5rem', color: '#64748b', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Section tabs */}
        <div style={{
          display: 'flex', overflowX: 'auto', padding: '0 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#fff',
          flexShrink: 0,
          scrollbarWidth: 'none',
        }}>
          {SECTIONS.map((section) => {
            const isActive = activeSection === section.id
            const complete = sectionStatus(section.id)
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.75rem 1rem', border: 'none', background: 'transparent',
                  color: isActive ? '#6366f1' : '#64748b',
                  fontSize: '0.875rem', fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                {complete
                  ? <CheckCircle2 size={13} color="#10b981" />
                  : <Circle size={13} color={isActive ? '#6366f1' : '#cbd5e1'} />
                }
                {section.label}
                {!complete && sectionMissing(section.id).length > 0 && (
                  <span className="grid min-w-5 place-items-center rounded-full bg-sun-100 px-1 text-[10px] font-extrabold text-warning">{sectionMissing(section.id).length}</span>
                )}
              </button>
            )
          })}
        </div>

        {recovery && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sun-200 bg-sun-50 px-6 py-3 text-sm">
            <div><strong className="text-sun-900">Có bản nháp chưa lưu</strong><span className="ml-2 text-muted">lúc {new Date(recovery.savedAt).toLocaleString('vi-VN')}</span></div>
            <div className="flex gap-2">
              <button type="button" className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-bold" onClick={() => { window.sessionStorage.removeItem(draftStorageKey); setRecovery(null) }}>Bỏ bản nháp</button>
              <button type="button" className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-extrabold text-white" onClick={() => { setDraft(recovery.draft); setRecovery(null); showToast('Đã khôi phục nội dung đang soạn', 'success') }}>Khôi phục</button>
            </div>
          </div>
        )}

        {/* Content area — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', background: '#f8fafc' }}>
          {sectionMissing(activeSection).length > 0 && !readOnly && (
            <div className="mb-4 rounded-xl border border-sun-200 bg-sun-50 p-3" role="status">
              <p className="text-sm font-extrabold text-warning">Cần bổ sung trước khi lưu</p>
              <ul className="mt-2 grid gap-1 text-xs font-semibold text-text">
                {sectionMissing(activeSection).map((message) => <li key={message} className="flex gap-2"><span aria-hidden="true">•</span><span>{message}</span></li>)}
              </ul>
            </div>
          )}

          {/* ── BASICS ── */}
          {activeSection === 'basics' && (
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(19rem,.85fr)]">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-3 text-sm font-semibold leading-relaxed text-sky-900">
                <strong>Thông tin trạm định hướng toàn bộ bài học.</strong> Câu hỏi khởi động, mục tiêu, game, thực hành và thử thách phải cùng kiểm tra một nội dung.
              </div>
              <FormRow label="Tên trạm học *">
                <input
                  type="text" id={`${uid}-title`}
                  value={draft.title}
                  readOnly={readOnly}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="VD: AI học từ dữ liệu như thế nào?"
                  style={inputStyle}
                />
              </FormRow>
              <FormRow label="Đường dẫn (slug) *" hint="Tự động từ tên, có thể chỉnh">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>/</span>
                  <input
                    type="text" id={`${uid}-slug`}
                    value={draft.id}
                    readOnly={readOnly}
                    onChange={(e) => set('id', e.target.value)}
                    placeholder="ten-bai-hoc"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
                {draft.id && !/^[a-z0-9-]{3,64}$/.test(draft.id) && (
                  <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                    ⚠️ Chỉ dùng chữ thường, số và gạch ngang (3–64 ký tự)
                  </div>
                )}
              </FormRow>
              <FormRow label="Kỹ năng trọng tâm *">
                <input
                  type="text" value={draft.skill}
                  readOnly={readOnly}
                  onChange={(e) => set('skill', e.target.value)}
                  placeholder="VD: Hiểu cách AI học từ dữ liệu"
                  style={inputStyle}
                />
              </FormRow>
              <FormRow label="Câu hỏi khởi động *" hint="Hook kích thích tò mò">
                <textarea
                  value={draft.hook}
                  readOnly={readOnly}
                  onChange={(e) => set('hook', e.target.value)}
                  placeholder="VD: Làm thế nào một cỗ máy có thể nhận ra khuôn mặt bạn?"
                  rows={3} style={textareaStyle}
                />
              </FormRow>
              <FormRow label="Hôm nay con sẽ đạt được gì? *" hint="Mỗi mục tiêu 1 dòng">
                <textarea
                  value={draft.goalsText}
                  readOnly={readOnly}
                  onChange={(e) => set('goalsText', e.target.value)}
                  placeholder={"Hiểu AI học từ dữ liệu\nPhân biệt dữ liệu tốt và xấu\nBiết tại sao dữ liệu đa dạng quan trọng"}
                  rows={4} style={textareaStyle}
                />
              </FormRow>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <FormRow label="Thời lượng">
                  <input type="text" readOnly={readOnly} value={draft.duration} onChange={(e) => set('duration', e.target.value)} placeholder="VD: 30 phút" style={inputStyle} />
                </FormRow>
                <FormRow label="Phần thưởng">
                  <input type="text" readOnly={readOnly} value={draft.reward} onChange={(e) => set('reward', e.target.value)} placeholder="VD: Huy hiệu Nhà Khoa Học" style={inputStyle} />
                </FormRow>
              </div>
              <FormRow label="Video bài học">
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Youtube size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                  <input
                    type="url" readOnly={readOnly} value={draft.videoUrl}
                    onChange={(e) => set('videoUrl', e.target.value)}
                    placeholder="https://youtube.com/..."
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
              </FormRow>
              </div>
              <StudentBasicsPreview draft={draft} />
            </div>
          )}

          {/* ── CONTENT ── */}
          {activeSection === 'content' && (
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,.95fr)]">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="rounded-xl border border-sun-200 bg-sun-50 px-3 py-3 text-sm font-semibold leading-relaxed text-sun-900">
                <strong>Mỗi khối là một màn đọc ngắn của học sinh.</strong> Chọn loại nội dung, layout và sắp thứ tự theo mạch: hiểu ý chính → xem ví dụ → tự ghi nhớ.
              </div>
              {draft.learnCards.map((card, index) => (
                <section key={card.id} className="rounded-2xl border-2 border-border bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-extrabold text-text">Khối {index + 1}</p>
                    <div className="flex gap-1">
                      <button type="button" disabled={readOnly || index === 0} onClick={() => moveLearnCard(index, -1)} className="grid size-10 place-items-center rounded-xl border border-border text-muted disabled:opacity-30" aria-label={`Đưa khối ${index + 1} lên`}><ChevronUp size={17} /></button>
                      <button type="button" disabled={readOnly || index === draft.learnCards.length - 1} onClick={() => moveLearnCard(index, 1)} className="grid size-10 place-items-center rounded-xl border border-border text-muted disabled:opacity-30" aria-label={`Đưa khối ${index + 1} xuống`}><ChevronDown size={17} /></button>
                      <button type="button" disabled={readOnly || draft.learnCards.length <= 2} onClick={() => removeLearnCard(index)} className="grid size-10 place-items-center rounded-xl border border-border text-danger disabled:opacity-30" aria-label={`Xóa khối ${index + 1}`}><Trash2 size={17} /></button>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-extrabold text-text">Loại nội dung
                      <select disabled={readOnly} value={card.kind} onChange={(event) => updateLearnCard(index, { kind: event.target.value as LearnCardDraft['kind'] })} style={{ ...inputStyle, marginTop: '0.35rem' }}>
                        {LEARN_KIND_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-extrabold text-text">Cách trình bày
                      <select disabled={readOnly} value={card.layout} onChange={(event) => updateLearnCard(index, { layout: event.target.value as LearnCardDraft['layout'] })} style={{ ...inputStyle, marginTop: '0.35rem' }}>
                        {LEARN_LAYOUT_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                      </select>
                    </label>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-muted">{LEARN_LAYOUT_OPTIONS.find((option) => option.id === card.layout)?.description}</p>
                  <label className="mt-3 block text-xs font-extrabold text-text">Tiêu đề khối
                    <input readOnly={readOnly} value={card.title} onChange={(event) => updateLearnCard(index, { title: event.target.value })} style={{ ...inputStyle, marginTop: '0.35rem' }} />
                  </label>
                  <label className="mt-3 block text-xs font-extrabold text-text">Nội dung học sinh đọc
                    <textarea readOnly={readOnly} value={card.body} onChange={(event) => updateLearnCard(index, { body: event.target.value })} rows={5} style={{ ...textareaStyle, marginTop: '0.35rem' }} placeholder="Giải thích một ý rõ ràng trong 2–4 câu..." />
                  </label>
                  <label className="mt-3 block text-xs font-extrabold text-text">Câu ghi nhớ
                    <input readOnly={readOnly} value={card.tip} onChange={(event) => updateLearnCard(index, { tip: event.target.value })} style={{ ...inputStyle, marginTop: '0.35rem' }} placeholder="Một câu ngắn để học sinh nhớ ý chính" />
                  </label>
                  {(card.layout === 'split' || card.layout === 'visual-grid' || card.layout === 'storyboard') && (
                    <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50/60 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-extrabold text-text">Các ô ví dụ trực quan</p>
                          <p className="mt-1 text-xs font-semibold text-muted">Mỗi ô gồm một tên ngắn và phần giải thích. Thứ tự bên dưới là thứ tự học sinh xem.</p>
                        </div>
                        {!readOnly && <button type="button" onClick={() => addLearnVisualItem(index)} className="flex min-h-10 items-center gap-1 rounded-xl border border-sky-300 bg-white px-3 text-xs font-extrabold text-sky-700"><Plus size={15} /> Thêm ô</button>}
                      </div>
                      {card.visualItems.length === 0 ? (
                        <div className="mt-3 rounded-xl border border-dashed border-sky-300 bg-white px-3 py-4 text-center text-xs font-bold text-muted">Chưa có ô ví dụ. Chọn “Thêm ô” để bắt đầu.</div>
                      ) : (
                        <div className="mt-3 grid gap-2">
                          {card.visualItems.map((item, itemIndex) => (
                            <div key={`${card.id}-visual-${itemIndex}`} className="grid gap-2 rounded-xl border border-border bg-white p-3 sm:grid-cols-[minmax(8rem,.42fr)_minmax(0,1fr)_2.5rem]">
                              <label className="text-[11px] font-extrabold text-muted">Tên ô
                                <input readOnly={readOnly} value={item.label} onChange={(event) => updateLearnVisualItem(index, itemIndex, { label: event.target.value })} style={{ ...inputStyle, minHeight: '2.5rem', marginTop: '0.25rem' }} placeholder="Ví dụ: Chọn ý" />
                              </label>
                              <label className="text-[11px] font-extrabold text-muted">Nội dung ngắn
                                <textarea readOnly={readOnly} value={item.text} onChange={(event) => updateLearnVisualItem(index, itemIndex, { text: event.target.value })} rows={2} style={{ ...textareaStyle, minHeight: '2.5rem', marginTop: '0.25rem' }} placeholder="Học sinh cần nhìn thấy điều gì?" />
                              </label>
                              {!readOnly && <button type="button" onClick={() => removeLearnVisualItem(index, itemIndex)} className="mt-5 grid size-10 place-items-center rounded-xl border border-border text-danger" aria-label={`Xóa ô ${itemIndex + 1}`}><Trash2 size={16} /></button>}
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="mt-2 text-xs font-semibold text-muted">Gợi ý: “Chữ + ví dụ” dùng 1–3 ô xếp dọc; “Lưới ví dụ” dùng 2–4 ô; “Storyboard” dùng 3–6 khung theo trình tự.</p>
                    </div>
                  )}
                </section>
              ))}
              {!readOnly && <button type="button" onClick={addLearnCard} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sky-300 bg-sky-50 px-4 text-sm font-extrabold text-sky-700"><Plus size={18} /> Thêm khối Khám phá</button>}
              </div>
              <StudentLearnPreview draft={draft} />
            </div>
          )}

          {/* ── GAME ── */}
          {activeSection === 'game' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Game selector */}
              <div>
                <div style={sectionLabelStyle}>Chọn hoạt động Thử cùng Mee</div>
                <GameSelector
                  disabled={readOnly}
                  gameType={draft.gameType}
                  gameMode={draft.gameMode}
                  gameAllowedTypes={draft.gameAllowedTypes}
                  onChangeGameType={(t) => set('gameType', t)}
                  onChangeGameMode={(m) => set('gameMode', m)}
                  onChangeAllowedTypes={(types) => set('gameAllowedTypes', types)}
                />
              </div>

              {/* Difficulty */}
              <FormRow label="Độ khó">
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {GAME_DIFFICULTIES.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      disabled={readOnly}
                      onClick={() => set('gameDifficulty', d.id as 'gentle' | 'steady' | 'challenge')}
                      style={{
                        flex: 1, padding: '0.5rem 0.25rem', borderRadius: '0.625rem', cursor: readOnly ? 'default' : 'pointer', transition: 'all 0.2s',
                        background: draft.gameDifficulty === d.id ? '#ede9fe' : '#fff',
                        color: draft.gameDifficulty === d.id ? '#6d28d9' : '#64748b',
                        fontSize: '0.8125rem', fontWeight: draft.gameDifficulty === d.id ? 700 : 500,
                        border: draft.gameDifficulty === d.id ? '1.5px solid #8b5cf6' : '1.5px solid #e2e8f0',
                      }}
                    >
                      <div>{d.label}</div>
                      <div style={{ fontSize: '0.6875rem', opacity: 0.7 }}>{d.description}</div>
                    </button>
                  ))}
                </div>
              </FormRow>

              {/* Hướng dẫn và mục tiêu */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <FormRow label="Hướng dẫn chơi *">
                  <textarea readOnly={readOnly} value={draft.gameInstruction} onChange={(e) => set('gameInstruction', e.target.value)} placeholder="Học sinh cần làm gì trong game?" rows={3} style={textareaStyle} />
                </FormRow>
                <FormRow label="Mục tiêu game *">
                  <textarea readOnly={readOnly} value={draft.gameOutcome} onChange={(e) => set('gameOutcome', e.target.value)} placeholder="Học sinh đạt được gì khi chơi?" rows={3} style={textareaStyle} />
                </FormRow>
              </div>

              {/* ── Math-kids: question count + quiz builder ── */}
              {needsQuizConfig && (
                <div>
                  {/* WHY: questionCount per-bài — bài dễ dùng ít câu, bài khó dùng nhiều câu */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={sectionLabelStyle}>Câu hỏi trắc nghiệm (AI Quiz)</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        Số câu:
                        <input
                          type="number"
                          readOnly={readOnly}
                          min={1} max={30}
                          value={draft.questionCount}
                          onChange={(e) => set('questionCount', Math.max(1, Math.min(30, parseInt(e.target.value) || 6)))}
                          style={{
                            width: '4rem', padding: '0.25rem 0.5rem',
                            border: '1.5px solid #e2e8f0', borderRadius: '0.375rem',
                            fontSize: '0.875rem', textAlign: 'center',
                            background: '#fff', color: '#0f172a',
                            outline: 'none',
                          }}
                        />
                      </label>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => setShowBankPicker(true)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.375rem',
                            padding: '0.375rem 0.875rem', borderRadius: '0.5rem',
                            background: '#ede9fe', color: '#6d28d9',
                            fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                            border: '1px solid #c4b5fd',
                          }}
                        >
                          <BookMarked size={13} /> Chọn từ ngân hàng
                        </button>
                      )}
                    </div>
                  </div>
                  <QuizQuestionBuilder
                    readOnly={readOnly}
                    questions={quizQuestions}
                    onChange={setQuizQuestions}
                  />
                </div>
              )}

              {/* ── Catalog game config ── */}
              {needsCatalogConfig && catalogGameType && (
                <div>
                  <div style={sectionLabelStyle}>
                    Cấu hình {catalogGameType === 'data-runner' ? '🏃 Data Runner' : '🚀 Truth Patrol'}
                  </div>
                  <CatalogGameBuilder
                    readOnly={readOnly}
                    gameType={catalogGameType}
                    value={draft.gameStructuredText}
                    onChange={(raw) => set('gameStructuredText', raw)}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── PRACTICE ── */}
          {activeSection === 'practice' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '0.625rem', fontSize: '0.8125rem', color: '#065f46' }}>
                <strong>Tự tay làm phải dùng kiến thức vừa học.</strong> Học sinh cần biết làm gì, tạo ra sản phẩm nào, tự kiểm tra theo tiêu chí nào và lưu sản phẩm riêng tư.
              </div>
              <FormRow label="Kiểu thực hành *">
                {!PRACTICE_OPTIONS.some((option) => option.id === draft.practiceKind) && (
                  <div className="mb-3 rounded-xl border border-sun-200 bg-sun-50 px-4 py-3 text-sm font-semibold text-sun-900" role="alert">
                    Kiểu cũ <strong>{draft.practiceKind}</strong> chưa có trình biên soạn dữ liệu an toàn. Hãy chọn một kiểu được hỗ trợ bên dưới trước khi lưu lại trạm.
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.5rem' }}>
                  {PRACTICE_OPTIONS.map((opt) => {
                    const active = draft.practiceKind === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={readOnly}
                        onClick={() => set('practiceKind', opt.id)}
                        style={{
                          padding: '0.625rem 0.75rem', borderRadius: '0.625rem', cursor: readOnly ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.15s',
                          background: active ? '#ede9fe' : '#fff',
                          border: active ? '1.5px solid #8b5cf6' : '1.5px solid #e2e8f0',
                          color: active ? '#6d28d9' : '#475569',
                        }}
                      >
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{opt.label}</div>
                        <div style={{ fontSize: '0.6875rem', opacity: 0.7, marginTop: '0.125rem' }}>{opt.description}</div>
                      </button>
                    )
                  })}
                </div>
              </FormRow>
              <PracticeKindPreview draft={draft} compact />
              <FormRow label="Hướng dẫn thực hành *">
                <textarea readOnly={readOnly} value={draft.practiceInstruction} onChange={(e) => set('practiceInstruction', e.target.value)} placeholder="Mô tả nhiệm vụ học sinh cần làm..." rows={4} style={textareaStyle} />
              </FormRow>
              <FormRow label="Sản phẩm học sinh tạo ra *">
                <input type="text" readOnly={readOnly} value={draft.product} onChange={(e) => set('product', e.target.value)} placeholder="VD: Bức tranh về AI trong tương lai" style={inputStyle} />
              </FormRow>
              {draft.practiceKind === 'ordering' && (
                <FormRow label="Các thẻ cần sắp xếp *">
                  <textarea
                    readOnly={readOnly}
                    value={draft.practiceConfigText}
                    onChange={(e) => set('practiceConfigText', e.target.value)}
                    placeholder={'Mỗi dòng theo mẫu: Tiêu đề | Mô tả\nNhận nhiều ví dụ | AI xem dữ liệu đã chuẩn bị.\nTìm mẫu | AI tìm dấu hiệu thường lặp lại.\nCon người kiểm tra | Con người xem bằng chứng trước khi dùng.'}
                    rows={7}
                    style={textareaStyle}
                  />
                  <p className="mt-2 text-xs font-semibold text-muted">Thứ tự giáo viên nhập là đáp án đúng. Học sinh sẽ nhận danh sách đã đảo và kéo thả để sắp xếp.</p>
                </FormRow>
              )}
              <FormRow label="Các bước học sinh thực hiện *">
                <textarea readOnly={readOnly} value={draft.practiceStepsText} onChange={(e) => set('practiceStepsText', e.target.value)} placeholder={'Mỗi dòng là một bước ngắn, ví dụ:\nNhắc lại dấu hiệu vừa học\nTạo bản đầu tiên\nĐối chiếu và sửa sản phẩm\nKiểm tra riêng tư trước khi lưu'} rows={6} style={textareaStyle} />
              </FormRow>
              <FormRow label="Tiêu chí sản phẩm đạt chuẩn *">
                <textarea readOnly={readOnly} value={draft.successCriteriaText} onChange={(e) => set('successCriteriaText', e.target.value)} placeholder={'Mỗi dòng là một tiêu chí học sinh tự kiểm tra\nSản phẩm thể hiện đúng kiến thức của trạm\nCó bằng chứng hoặc lý do lựa chọn\nKhông chứa thông tin riêng tư'} rows={5} style={textareaStyle} />
              </FormRow>
              <FormRow label="Câu hỏi nhìn lại *">
                <input type="text" readOnly={readOnly} value={draft.reflectionPrompt} onChange={(e) => set('reflectionPrompt', e.target.value)} placeholder="Con đã sửa điểm nào sau khi tự kiểm tra? Vì sao?" style={inputStyle} />
              </FormRow>
            </div>
          )}

          {/* ── CHECK ── */}
          {activeSection === 'check' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                padding: '0.75rem 1rem',
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '0.625rem',
                fontSize: '0.8125rem',
                color: '#0369a1',
              }}>
                <strong>Thử thách cuối trạm</strong> kiểm tra học sinh đã đạt đúng các mục tiêu phía trên.
                Mỗi câu hỏi có thể có từ <strong>2–6 đáp án</strong>. Câu hỏi trong game được cấu hình ở phần <strong>Thử cùng Mee</strong>.
              </div>

              {/* Multi-question check builder */}
              <CheckQuestionBuilder
                readOnly={readOnly}
                questions={draft.checkQuestions}
                onChange={(qs) => set('checkQuestions', qs)}
              />
            </div>
          )}
        </div>

        {/* Footer — Save button */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e2e8f0',
          background: '#fff',
          flexShrink: 0,
        }}>
          {!readOnly && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {readiness.complete
                ? <CheckCircle2 size={14} color="#10b981" />
                : <Circle size={14} color="#f97316" />
              }
              <span style={{ fontSize: '0.8125rem', color: readiness.complete ? '#10b981' : '#f97316' }}>
                {readiness.complete ? 'Sẵn sàng lưu!' : `Còn ${readiness.total - readiness.completed} bước chưa hoàn thành`}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {/* WHY: readOnly=true — ẩn hoàn toàn footer action để tránh gọi PATCH/DELETE vào system courses. */}
            {!readOnly ? (
              <>
                <button
                  type="button"
                  onClick={requestClose}
                  style={{ padding: '0.625rem 1.25rem', borderRadius: '0.625rem', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  id={`${uid}-save-lecture`}
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '0.625rem 1.5rem', borderRadius: '0.625rem', border: 'none',
                    background: readiness.complete ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#c7d2fe',
                    color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1, transition: 'all 0.2s',
                  }}
                >
                  {saving ? 'Đang lưu...' : isEdit ? 'Lưu trạm học' : 'Tạo trạm học'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={requestClose}
                style={{ padding: '0.625rem 1.5rem', borderRadius: '0.625rem', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Question bank picker modal */}
      {showBankPicker && (
        <QuestionBankPicker
          selectedIds={quizQuestions.map((q) => q.id)}
          onSelect={(newQuestions) => setQuizQuestions((prev) => [...prev, ...newQuestions])}
          onClose={() => setShowBankPicker(false)}
        />
      )}
      <ConfirmDialog
        open={confirmClose}
        title="Bỏ các thay đổi chưa lưu?"
        description="Nội dung vừa chỉnh trong trạm sẽ bị mất. Con trỏ và dữ liệu đã lưu trước đó vẫn được giữ nguyên."
        confirmLabel="Bỏ thay đổi"
        cancelLabel="Tiếp tục soạn"
        danger
        onCancel={() => setConfirmClose(false)}
        onConfirm={() => { window.sessionStorage.removeItem(draftStorageKey); setConfirmClose(false); onDirtyChange?.(false); onClose() }}
      />
      <AdventureModal
        open={showFullPreview}
        tone="guidance"
        eyebrow="Xem trước như học sinh"
        title={draft.title || 'Trạm học chưa có tên'}
        description="Toàn bộ hành trình trong một trạm: mở bài → khám phá → chơi → thực hành → thử thách."
        showMascot={false}
        className="station-preview-modal"
        onClose={() => setShowFullPreview(false)}
        actions={<button type="button" className="btn-primary" onClick={() => setShowFullPreview(false)}>Tiếp tục biên soạn</button>}
      >
        <FullStationPreview draft={draft} gameConfig={buildGameConfigForSave()} />
      </AdventureModal>
    </>
  )

  // inline mode: render trực tiếp, không có backdrop
  if (inline) return body

  // overlay mode: thêm backdrop bên ngoài
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 400,
          background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(3px)',
        }}
      />
      {body}
    </>
  )
}

// ─── Helper components ─────────────────────────────────────────────────────────
function FormRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>{label}</span>
        {hint && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{hint}</span>}
      </div>
      {children}
    </label>
  )
}

// ─── Styles ─ Light theme ──────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.625rem 0.75rem', borderRadius: '0.625rem',
  border: '1.5px solid #e2e8f0', background: '#fff',
  color: '#0f172a', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
}
const textareaStyle: React.CSSProperties = {
  ...inputStyle, resize: 'vertical', lineHeight: 1.6,
}
const sectionLabelStyle: React.CSSProperties = {
  fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem',
}
