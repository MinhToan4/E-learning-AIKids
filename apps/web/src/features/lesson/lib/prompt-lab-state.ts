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
