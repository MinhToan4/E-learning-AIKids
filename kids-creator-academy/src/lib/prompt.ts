import type { PromptParts, PromptSlotKey } from '@/types'

export const SLOT_LABELS: Record<PromptSlotKey, string> = {
  character: 'Nhân vật',
  action: 'Hành động',
  environment: 'Bối cảnh',
  mood: 'Cảm xúc',
  style: 'Phong cách',
}

export function assemblePrompt(parts: PromptParts): string {
  const bits: string[] = []
  if (parts.character) bits.push(parts.character.label)
  if (parts.action) bits.push(parts.action.label)
  if (parts.environment) bits.push(`ở ${parts.environment.label}`)
  if (parts.mood) bits.push(`cảm giác ${parts.mood.label}`)
  if (parts.style) bits.push(`phong cách ${parts.style.label}`)
  if (parts.freeText?.trim()) bits.push(parts.freeText.trim())

  if (bits.length === 0) return 'Hãy ghép thẻ để tạo câu mô tả nhé!'
  return bits.join(', ') + '.'
}

export function missingSlots(parts: PromptParts): PromptSlotKey[] {
  const required: PromptSlotKey[] = [
    'character',
    'action',
    'environment',
    'mood',
    'style',
  ]
  return required.filter((key) => !parts[key])
}

export function missingSlotHint(parts: PromptParts): string | null {
  const missing = missingSlots(parts)
  if (missing.length === 0) return null
  const first = missing[0]
  const hints: Record<PromptSlotKey, string> = {
    character: 'Thêm nhân vật để AI biết ai là ngôi sao câu chuyện nhé!',
    action: 'Thêm hành động để câu chuyện sống động hơn nhé!',
    environment: 'Thêm bối cảnh để AI hiểu nhân vật đang ở đâu nhé!',
    mood: 'Thêm cảm xúc để bức tranh có hồn nhé!',
    style: 'Chọn phong cách vẽ để bức tranh đồng bộ nhé!',
  }
  return hints[first]
}
