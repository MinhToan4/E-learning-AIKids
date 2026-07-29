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

export function PromptLab({
  value,
  onChange,
}: {
  value: PromptLabValue
  onChange: (value: PromptLabValue) => void
}) {
  const field = (key: keyof PromptLabValue, next: string) =>
    onChange({ ...value, [key]: next })

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

      <fieldset className="rounded-2xl border-2 border-brand-100 bg-brand-50/40 p-4">
        <legend className="px-2 font-display text-lg">3. Prompt tốt · cấu trúc 4 phần</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {([
            ['role', 'Vai trò', 'Hãy đóng vai họa sĩ minh họa cho trẻ em'],
            ['task', 'Nhiệm vụ', 'Vẽ một chú mèo cam đang chơi bóng'],
            ['context', 'Ngữ cảnh', 'Trong khu vườn đầy hoa, không dùng chữ'],
            ['format', 'Định dạng', 'Tranh màu nước, khung vuông, màu ấm'],
          ] as const).map(([key, label, placeholder]) => (
            <label key={key} className="flex flex-col gap-1 text-sm font-bold">
              {label}
              <textarea
                className="min-h-20 rounded-xl border-2 border-border bg-white p-3 font-normal"
                value={value[key]}
                maxLength={240}
                placeholder={placeholder}
                onChange={(event) => field(key, event.target.value)}
              />
            </label>
          ))}
        </div>
        <div className="mt-3 rounded-xl bg-white p-3 text-sm">
          <strong>Prompt hoàn chỉnh:</strong>{' '}
          {strongPrompt(value) || 'Điền 4 phần để xem prompt được ghép lại.'}
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
