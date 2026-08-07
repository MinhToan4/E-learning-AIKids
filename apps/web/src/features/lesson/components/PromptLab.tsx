import { useState } from 'react'

export type PromptLabValue = {
  weak: string
  medium: string
  role: string
  task: string
  context: string
  format: string
  explanation: string
}

export const EMPTY_PROMPT_LAB: PromptLabValue = {
  weak: '',
  medium: '',
  role: '',
  task: '',
  context: '',
  format: '',
  explanation: '',
}

export function promptLabError(value: PromptLabValue): string | null {
  if (value.weak.trim().length < 1) return 'Viết prompt yếu từ 1–2 từ nhé!'
  if (value.medium.trim().length < 8) return 'Prompt trung bình cần là một câu rõ ý nhé!'
  if ([value.role, value.task, value.context, value.format].some((part) => part.trim().length < 4)) {
    return 'Điền đủ 4 phần của prompt tốt: vai trò, nhiệm vụ, ngữ cảnh và định dạng nhé!'
  }
  if (value.explanation.trim().length < 12) {
    return 'Giải thích ngắn vì sao prompt 3 tốt hơn nhé!'
  }
  return null
}

export function strongPrompt(value: PromptLabValue): string {
  return [value.role, value.task, value.context, value.format]
    .map((part) => part.trim())
    .filter(Boolean)
    .join('. ')
}

type StrongPromptKey = 'role' | 'task' | 'context' | 'format'

const PROMPT_PARTS: Array<{
  key: StrongPromptKey
  label: string
  hint: string
  tone: string
  choices: string[]
}> = [
  {
    key: 'role',
    label: 'Vai trò',
    hint: 'AI sẽ hóa thân thành ai?',
    tone: 'border-brand-200 bg-brand-50 text-brand-700',
    choices: [
      'Hãy đóng vai một họa sĩ minh họa cho trẻ em',
      'Hãy đóng vai một người kể chuyện sáng tạo',
      'Hãy đóng vai một trợ lý học tập thân thiện',
    ],
  },
  {
    key: 'task',
    label: 'Nhiệm vụ',
    hint: 'AI cần làm điều gì?',
    tone: 'border-sky-200 bg-sky-50 text-sky-700',
    choices: [
      'Vẽ một chú mèo cam đang chơi bóng',
      'Viết một câu chuyện ngắn về tình bạn',
      'Giải thích ý tưởng bằng từ ngữ dễ hiểu',
    ],
  },
  {
    key: 'context',
    label: 'Ngữ cảnh',
    hint: 'Sản phẩm dành cho ai, ở đâu?',
    tone: 'border-mint-200 bg-mint-50 text-mint-700',
    choices: [
      'Dành cho học sinh 8–11 tuổi',
      'Trong một khu vườn đầy hoa và ánh nắng',
      'Dùng ngôn ngữ tích cực, an toàn và dễ hiểu',
    ],
  },
  {
    key: 'format',
    label: 'Định dạng',
    hint: 'Kết quả cần trông như thế nào?',
    tone: 'border-sun-200 bg-sun-50 text-sun-700',
    choices: [
      'Trình bày thành 3 ý ngắn gọn',
      'Tranh màu nước, khung vuông, màu ấm',
      'Một đoạn văn dưới 80 từ và có tiêu đề',
    ],
  },
]

export function PromptLab({
  value,
  onChange,
}: {
  value: PromptLabValue
  onChange: (value: PromptLabValue) => void
}) {
  const [activeTab, setActiveTab] = useState<StrongPromptKey>('role')

  const field = (key: keyof PromptLabValue, next: string) =>
    onChange({ ...value, [key]: next })

  const filledPartsCount = [value.role, value.task, value.context, value.format].filter((part) => part.trim()).length

  const activePart = PROMPT_PARTS.find((p) => p.key === activeTab)!
  const mediumChoice = activeTab === 'task' && value.medium.trim().length >= 8
    ? value.medium.trim()
    : null
  const availableChoices = mediumChoice
    ? [mediumChoice, ...activePart.choices.filter((choice) => choice !== mediumChoice)]
    : activePart.choices

  return (
    <div className="flex flex-col gap-4" data-testid="prompt-lab">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-bold">
          1. Prompt yếu
          <input
            className="min-h-11 rounded-xl border-2 border-border px-3 font-normal"
            value={value.weak}
            maxLength={30}
            placeholder="Ví dụ: Vẽ mèo"
            onChange={(event) => field('weak', event.target.value)}
          />
          <span className="text-xs font-normal text-muted">Chỉ 1–2 từ, còn thiếu thông tin.</span>
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold">
          2. Prompt trung bình
          <input
            className="min-h-11 rounded-xl border-2 border-border px-3 font-normal"
            value={value.medium}
            maxLength={180}
            placeholder="Ví dụ: Vẽ một chú mèo cam đang chơi."
            onChange={(event) => field('medium', event.target.value)}
          />
          <span className="text-xs font-normal text-muted">Một câu có đối tượng và hành động.</span>
        </label>
      </div>

      <fieldset className="rounded-3xl border-2 border-brand-100 bg-brand-50/40 p-4 sm:p-5 flex flex-col gap-4">
        <div>
          <legend className="px-2 font-display text-lg">3. Lắp prompt tốt · đủ 4 mảnh</legend>
          <p className="mt-1 text-sm text-muted px-2">
            Chọn một mảnh ở mỗi trạm. Con có thể đổi mảnh cho đến khi prompt đúng ý.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Top side: Live Preview */}
          <div className="flex flex-col gap-3 min-w-0">
            <div className="flex items-center justify-between gap-3 px-1">
              <strong className="font-bold text-sm text-text">Xem trước</strong>
              <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-extrabold text-brand-700">
                {filledPartsCount}/4 mảnh
              </span>
            </div>
            
            <div className="relative aspect-[21/9] sm:aspect-video overflow-hidden rounded-2xl bg-surface border-4 border-white shadow-clay">
              <img
                src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Live preview"
                className={`h-full w-full object-cover transition-all duration-700 ease-in-out ${
                  filledPartsCount === 0 ? 'blur-2xl grayscale' :
                  filledPartsCount === 1 ? 'blur-lg grayscale-50' :
                  filledPartsCount === 2 ? 'blur-md grayscale-[25%]' :
                  filledPartsCount === 3 ? 'blur-sm grayscale-[10%]' :
                  'blur-none grayscale-0 scale-105 animate-in zoom-in-95 duration-500'
                }`}
              />
              {/* Overlay Prompt Text */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
                <p className="text-sm font-medium leading-snug text-white line-clamp-3">
                  {strongPrompt(value) || 'Chọn các mảnh để xem kết quả...'}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom side: Tab UI */}
          <div className="flex flex-col gap-3 min-w-0">
            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {PROMPT_PARTS.map(({ key, label, tone }, index) => {
                const isActive = activeTab === key
                const hasValue = !!value[key]
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    className={`flex-shrink-0 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                      isActive 
                        ? 'bg-white shadow-sm ring-2 ring-brand-300 text-brand-700'
                        : hasValue
                          ? 'bg-white text-text border border-border hover:bg-brand-50'
                          : 'bg-surface text-muted border border-transparent hover:bg-border/50 hover:text-text'
                    }`}
                  >
                    <span className={`flex h-6 w-6 items-center justify-center rounded-md border text-xs ${hasValue ? tone : 'bg-surface border-border text-muted'}`}>
                      {index + 1}
                    </span>
                    {label}
                  </button>
                )
              })}
            </div>

            {/* Active Tab Content */}
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm min-h-[180px]">
              <div>
                <strong className="text-base text-text">{activePart.label}</strong>
                <p className="text-sm text-muted">{activePart.hint}</p>
              </div>

              <div
                className={`flex min-h-12 items-center rounded-xl border-2 border-dashed p-3 text-sm font-bold ${value[activeTab] ? activePart.tone : 'border-border bg-surface text-muted'}`}
                aria-live="polite"
              >
                {value[activeTab] || `Chưa có mảnh ${activePart.label.toLocaleLowerCase('vi-VN')}`}
              </div>

              <div className="grid gap-2 sm:grid-cols-2 mt-auto">
                {availableChoices.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    aria-pressed={value[activeTab] === choice}
                    onClick={() => {
                      field(activeTab, choice)
                      // Auto advance to next tab if not the last one
                      const currentIndex = PROMPT_PARTS.findIndex(p => p.key === activeTab)
                      if (currentIndex < PROMPT_PARTS.length - 1) {
                        setActiveTab(PROMPT_PARTS[currentIndex + 1].key)
                      }
                    }}
                    className={`min-h-11 rounded-xl border px-4 py-2 text-left text-sm font-bold transition-all active:scale-[0.98] ${
                      value[activeTab] === choice
                        ? activePart.tone + ' scale-[1.02] shadow-sm'
                        : 'border-border bg-white text-text hover:border-brand-200 hover:bg-brand-50'
                    }`}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      <label className="flex flex-col gap-1 text-sm font-bold">
        Vì sao prompt 3 tốt hơn?
        <textarea
          className="min-h-24 rounded-xl border-2 border-border p-3 font-normal"
          value={value.explanation}
          maxLength={500}
          placeholder="Prompt 3 giúp AI hiểu rõ…"
          onChange={(event) => field('explanation', event.target.value)}
        />
      </label>
    </div>
  )
}
