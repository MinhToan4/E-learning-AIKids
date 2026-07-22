import { validateChildText } from '@aikids/domain'

type InspectionFailureReason =
  | 'payload_too_large'
  | 'too_deep'
  | 'too_many_fields'
  | 'text_too_long'
  | 'unsafe_text'

export type PracticePayloadInspection =
  | { ok: true }
  | {
      ok: false
      reason: InspectionFailureReason
      message: string
      safetyReason?: string
    }

const MAX_PAYLOAD_CHARS = 2_500_000
const MAX_DEPTH = 8
const MAX_FIELDS = 500
const MAX_CHILD_TEXT_CHARS = 4_000

/**
 * `chips` is sent as `prompt` by the existing web client. Every other request
 * must match the quest configuration so a cheap journal lesson cannot be used
 * to trigger an image/video generation job.
 */
export function practiceKindMatchesQuest(
  requestedKind: string,
  questPracticeKind: string,
): boolean {
  if (questPracticeKind === 'chips') {
    return requestedKind === 'chips' || requestedKind === 'prompt'
  }
  return requestedKind === questPracticeKind
}

function isOpaqueMachineField(key: string): boolean {
  const normalized = key.toLowerCase()
  return (
    normalized === 'id' ||
    normalized.endsWith('id') ||
    normalized.endsWith('ids') ||
    normalized.endsWith('url') ||
    normalized.endsWith('dataurl') ||
    normalized === 'sketchdataurl'
  )
}

/**
 * Inspect every child-authored string, including nested story/comic/video
 * fields. Machine identifiers and data URLs are validated by their dedicated
 * handlers and are intentionally excluded from prose filtering here.
 */
export function inspectPracticePayload(
  payload: Record<string, unknown>,
): PracticePayloadInspection {
  let serialized: string
  try {
    serialized = JSON.stringify(payload)
  } catch {
    return {
      ok: false,
      reason: 'payload_too_large',
      message: 'Dữ liệu thực hành chưa hợp lệ.',
    }
  }
  if (serialized.length > MAX_PAYLOAD_CHARS) {
    return {
      ok: false,
      reason: 'payload_too_large',
      message: 'Bài thực hành quá lớn. Hãy lưu ít nội dung hơn nhé!',
    }
  }

  let fields = 0
  const visit = (
    value: unknown,
    key: string,
    depth: number,
  ): PracticePayloadInspection => {
    if (depth > MAX_DEPTH) {
      return {
        ok: false,
        reason: 'too_deep',
        message: 'Dữ liệu thực hành có quá nhiều lớp.',
      }
    }
    fields += 1
    if (fields > MAX_FIELDS) {
      return {
        ok: false,
        reason: 'too_many_fields',
        message: 'Bài thực hành có quá nhiều mục.',
      }
    }

    if (typeof value === 'string') {
      if (isOpaqueMachineField(key)) return { ok: true }
      if (value.length > MAX_CHILD_TEXT_CHARS) {
        return {
          ok: false,
          reason: 'text_too_long',
          message: 'Một phần nội dung đang quá dài.',
        }
      }
      if (!value.trim()) return { ok: true }
      const safe = validateChildText(value)
      if (!safe.ok) {
        return {
          ok: false,
          reason: 'unsafe_text',
          safetyReason: safe.reason ?? 'unsafe',
          message: safe.message ?? 'Nội dung này chưa phù hợp với bài học.',
        }
      }
      return { ok: true }
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        const result = visit(item, key, depth + 1)
        if (!result.ok) return result
      }
      return { ok: true }
    }

    if (value && typeof value === 'object') {
      for (const [childKey, childValue] of Object.entries(value)) {
        const result = visit(childValue, childKey, depth + 1)
        if (!result.ok) return result
      }
    }
    return { ok: true }
  }

  return visit(payload, 'payload', 0)
}
