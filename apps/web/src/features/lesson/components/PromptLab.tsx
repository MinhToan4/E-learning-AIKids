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
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-base font-black text-slate-700">
          1. Prompt yếu
          <input
            className="min-h-12 rounded-2xl border-4 border-slate-200 px-4 font-bold text-slate-700 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none transition-all"
            value={value.weak}
            maxLength={30}
            placeholder="Ví dụ: Vẽ mèo"
            onChange={(event) => field('weak', event.target.value)}
          />
          <span className="text-sm font-bold text-slate-500">Chỉ 1–2 từ, còn thiếu thông tin.</span>
        </label>
        <label className="flex flex-col gap-2 text-base font-black text-slate-700">
          2. Prompt trung bình
          <input
            className="min-h-12 rounded-2xl border-4 border-slate-200 px-4 font-bold text-slate-700 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none transition-all"
            value={value.medium}
            maxLength={180}
            placeholder="Ví dụ: Vẽ một chú mèo cam đang chơi."
            onChange={(event) => field('medium', event.target.value)}
          />
          <span className="text-sm font-bold text-slate-500">Một câu có đối tượng và hành động.</span>
        </label>
      </div>

      <fieldset className="rounded-[2rem] border-[6px] border-sky-200 bg-sky-50 shadow-clay p-4 sm:p-6 flex flex-col gap-4">
        <div>
          <legend className="px-2 font-display text-2xl font-black text-sky-800">3. Lắp prompt tốt · đủ 4 mảnh</legend>
          <p className="mt-1 text-base font-bold text-sky-600/80 px-2">
            Chọn một mảnh ở mỗi trạm. Con có thể đổi mảnh cho đến khi prompt đúng ý.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Top side: Live Preview */}
          <div className="flex flex-col gap-3 min-w-0">
            <div className="flex items-center justify-between gap-3 px-1">
              <strong className="text-base font-black text-sky-900">Xem trước</strong>
              <span className="rounded-full bg-white border-2 border-sky-200 px-3 py-1 text-sm font-black text-sky-700 shadow-sm">
                {filledPartsCount}/4 mảnh
              </span>
            </div>
            
            <div className="relative aspect-[21/9] sm:aspect-video overflow-hidden rounded-[2rem] bg-slate-800 border-[8px] sm:border-[12px] border-slate-700 shadow-xl">
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
            <div className="flex gap-3 overflow-x-auto pb-4 pt-1 px-1 -mx-1 hide-scrollbar">
              {PROMPT_PARTS.map(({ key, label, tone }, index) => {
                const isActive = activeTab === key
                const hasValue = !!value[key]
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    className={`flex-shrink-0 flex items-center gap-2.5 rounded-2xl px-5 py-3 text-[15px] font-black transition-all border-2 active:border-b-2 active:translate-y-1 ${
                      isActive 
                        ? 'bg-brand-500 border-brand-700 border-b-2 translate-y-1 text-white shadow-inner'
                        : hasValue
                          ? 'bg-brand-50 border-brand-300 border-b-[6px] text-brand-700 hover:bg-brand-100 hover:-translate-y-1'
                          : 'bg-white border-slate-200 border-b-[6px] text-slate-500 hover:bg-slate-50 hover:-translate-y-1'
                    }`}
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm shadow-sm ${
                      isActive 
                        ? 'bg-white border-transparent text-brand-600' 
                        : hasValue 
                          ? 'bg-white border-brand-300 text-brand-600' 
                          : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}>
                      {index + 1}
                    </span>
                    {label}
                  </button>
                )
              })}
            </div>

            {/* Active Tab Content */}
            <div className="flex flex-col gap-4 rounded-3xl border-4 border-slate-200 bg-white p-5 shadow-sm min-h-[200px]">
              <div>
                <strong className="text-xl font-black text-slate-800">{activePart.label}</strong>
                <p className="text-base font-bold text-slate-500">{activePart.hint}</p>
              </div>

              <div
                className={`flex min-h-14 items-center rounded-2xl border-4 border-dashed p-4 text-base font-black ${value[activeTab] ? activePart.tone : 'border-slate-200 bg-slate-50 text-slate-400'}`}
                aria-live="polite"
              >
                {value[activeTab] || `Chưa có mảnh ${activePart.label.toLocaleLowerCase('vi-VN')}`}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 mt-auto">
                {availableChoices.map((choice) => {
                  const isSelected = value[activeTab] === choice;
                  return (
                    <button
                      key={choice}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        field(activeTab, choice)
                        const currentIndex = PROMPT_PARTS.findIndex(p => p.key === activeTab)
                        if (currentIndex < PROMPT_PARTS.length - 1) {
                          setActiveTab(PROMPT_PARTS[currentIndex + 1].key)
                        }
                      }}
                      className={`min-h-14 rounded-2xl px-4 py-3 text-left text-sm font-black transition-all ${
                        isSelected
                          ? activePart.tone + ' border-2 border-b-2 translate-y-1'
                          : 'bg-white border-2 border-b-[6px] border-slate-200 text-slate-700 hover:-translate-y-1 hover:border-brand-300 hover:shadow-md'
                      }`}
                    >
                      {choice}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      <label className="flex flex-col gap-2 text-base font-black text-slate-700">
        Vì sao prompt 3 tốt hơn?
        <textarea
          className="min-h-24 rounded-2xl border-4 border-slate-200 p-4 font-bold text-slate-700 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none transition-all"
          value={value.explanation}
          maxLength={500}
          placeholder="Prompt 3 giúp AI hiểu rõ…"
          onChange={(event) => field('explanation', event.target.value)}
        />
      </label>
    </div>
  )
}
