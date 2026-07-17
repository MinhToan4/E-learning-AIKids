export interface SafetyResult {
  ok: boolean
  reason?: string
  message?: string
}

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
const PHONE_RE = /(?:\+?84|0)\s?\d{2,3}[\s.-]?\d{3}[\s.-]?\d{3,4}/
const URL_RE = /https?:\/\/|www\./i

function normalizeVi(input: string): string {
  return input
    .normalize('NFC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function includesAny(text: string, phrases: string[]): boolean {
  return phrases.some((p) => text.includes(p))
}

export function validateChildText(input: string): SafetyResult {
  const raw = input.trim()
  if (!raw) return { ok: true }
  const text = normalizeVi(raw)

  if (raw.length > 80) {
    return {
      ok: false,
      reason: 'too_long',
      message: 'Câu của con hơi dài. Hãy viết tối đa 80 ký tự nhé!',
    }
  }

  if (EMAIL_RE.test(raw) || PHONE_RE.test(raw)) {
    return {
      ok: false,
      reason: 'pii',
      message:
        'Mình không dùng email hoặc số điện thoại trong câu chuyện nhé. Hãy chọn chi tiết tưởng tượng!',
    }
  }

  if (URL_RE.test(raw)) {
    return {
      ok: false,
      reason: 'url',
      message: 'Không cần dán liên kết. Hãy mô tả bằng từ của con nhé!',
    }
  }

  if (
    includesAny(text, [
      'trường',
      'truong',
      'địa chỉ',
      'dia chi',
      'số nhà',
      'so nha',
    ])
  ) {
    return {
      ok: false,
      reason: 'pii_place',
      message:
        'Mình không dùng tên trường hoặc địa chỉ thật. Con có thể chọn một nơi tưởng tượng!',
    }
  }

  if (
    includesAny(text, [
      'messi',
      'ronaldo',
      'elon',
      'taylor swift',
      'bts',
      'blackpink',
      'spiderman',
      'mickey',
      'pokemon',
      'pikachu',
      'disney',
      'minion',
    ])
  ) {
    return {
      ok: false,
      reason: 'real_person',
      message:
        'Hãy dùng nhân vật tưởng tượng thay vì người thật hoặc nhân vật nổi tiếng nhé!',
    }
  }

  if (
    includesAny(text, [
      'giết',
      'giet',
      'súng',
      'sung',
      'tự tử',
      'tu tu',
      'tự hại',
      'tu hai',
    ])
  ) {
    return {
      ok: false,
      reason: 'unsafe',
      message:
        'Câu chuyện của mình cần an toàn và thân thiện. Hãy chọn hành động vui và an toàn nhé!',
    }
  }

  return { ok: true }
}

export function isNicknameSafe(nickname: string): SafetyResult {
  if (!nickname.trim()) {
    return {
      ok: false,
      reason: 'empty',
      message: 'Hãy chọn hoặc nhập biệt danh nhé!',
    }
  }
  if (nickname.length > 16) {
    return {
      ok: false,
      reason: 'too_long',
      message: 'Biệt danh tối đa 16 ký tự nhé!',
    }
  }
  return validateChildText(nickname)
}
