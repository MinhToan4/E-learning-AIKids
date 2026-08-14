import { environment } from '@/shared/config/environment'

const STORYBOOK_ID = /^[A-Z0-9]+(?:-[A-Z0-9]+)*-S[1-9]$/i

export function uniqueStorybookIds(values: readonly unknown[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const value of values) {
    if (typeof value !== 'string') continue
    const id = value.trim()
    if (!STORYBOOK_ID.test(id) || seen.has(id)) continue
    seen.add(id)
    result.push(id)
  }
  return result
}

export function uniqueRewardIds(values: readonly unknown[]): string[] {
  return [...new Set(values.flatMap((value) => {
    if (typeof value !== 'string') return []
    const id = value.trim()
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) ? [id] : []
  }))]
}

/** Reject executable/data URLs while preserving Hub-issued HTTPS or same-origin paths. */
export function safeStorybookAssetUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined
  const candidate = value.trim()
  if (candidate.startsWith('/') && !candidate.startsWith('//')) {
    const relative = new URL(candidate, 'https://storybook.local')
    return `${relative.pathname}${relative.search}${relative.hash}`
  }
  try {
    const url = new URL(candidate)
    return url.origin === environment.storagePublicUrl ? url.toString() : undefined
  } catch {
    return undefined
  }
}

export function safeChapterColors(value: unknown, fallback: [string, string]): [string, string] {
  if (!Array.isArray(value) || value.length !== 2) return fallback
  return value.every((color) => typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color))
    ? [value[0] as string, value[1] as string]
    : fallback
}
