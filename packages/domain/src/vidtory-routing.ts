/**
 * Pure rules for Vidtory model load-balancing (admin-configured weights).
 * Weights are relative (e.g. 40 + 60); they need not sum to 100 but must be > 0.
 * modelId is free-text (merchant catalog changes over time).
 */

export type ImageAspectRatio =
  | 'IMAGE_ASPECT_RATIO_SQUARE'
  | 'IMAGE_ASPECT_RATIO_LANDSCAPE'
  | 'IMAGE_ASPECT_RATIO_PORTRAIT'
  | 'IMAGE_ASPECT_RATIO_PORTRAIT_THREE_FOUR'
  | 'IMAGE_ASPECT_RATIO_LANDSCAPE_FOUR_THREE'

export type VideoAspectRatio =
  | 'VIDEO_ASPECT_RATIO_LANDSCAPE'
  | 'VIDEO_ASPECT_RATIO_PORTRAIT'

export type VideoMode = 't2v' | 'i2v' | 'r2v' | 'seedance'

export type ImageResolution = '1K' | '2K' | '4K'

export const DEFAULT_VIDTORY_BASE_URL = 'https://bapi.vidtory.net'

export interface ModelWeight {
  /** Vidtory modelId — admin types freely (catalog changes) */
  modelId: string
  /**
   * Relative weight across modelIds (e.g. 40 + 60 = 40% / 60% traffic).
   * NOT used to split t2v vs i2v — mode is chosen by context (ref image or not).
   */
  weight: number
  /** Admin-facing label */
  label?: string
  /** Soft-disable without deleting from list */
  enabled?: boolean
}

export interface ImageRoutingConfig {
  aspectRatio: ImageAspectRatio
  resolution: ImageResolution
  /** Optional default mode e.g. comfyui */
  mode?: string
  models: ModelWeight[]
}

export interface VideoRoutingConfig {
  aspectRatio: VideoAspectRatio
  duration: number
  /**
   * Optional merchant default; runtime still auto-picks:
   * ref image present → i2v, pure text → t2v.
   */
  mode?: VideoMode
  models: ModelWeight[]
}

export interface VidtoryRoutingConfig {
  /** API base URL (default https://bapi.vidtory.net) — admin editable */
  baseURL: string
  image: ImageRoutingConfig
  video: VideoRoutingConfig
}

/** SDK defaults — weight % is across modelIds only; mode is situational */
export const DEFAULT_VIDTORY_ROUTING: VidtoryRoutingConfig = {
  baseURL: DEFAULT_VIDTORY_BASE_URL,
  image: {
    aspectRatio: 'IMAGE_ASPECT_RATIO_LANDSCAPE',
    resolution: '1K',
    models: [
      {
        modelId: 'gemini-3.1-flash-image-preview',
        weight: 100,
        label: 'Gemini Flash Image (SDK default)',
        enabled: true,
      },
    ],
  },
  video: {
    aspectRatio: 'VIDEO_ASPECT_RATIO_LANDSCAPE',
    duration: 6,
    models: [
      {
        modelId: 'veo-3.1-fast-generate-001',
        weight: 100,
        label: 'Veo 3.1 Fast (SDK default)',
        enabled: true,
      },
    ],
  },
}

const IMAGE_AR: ImageAspectRatio[] = [
  'IMAGE_ASPECT_RATIO_SQUARE',
  'IMAGE_ASPECT_RATIO_LANDSCAPE',
  'IMAGE_ASPECT_RATIO_PORTRAIT',
  'IMAGE_ASPECT_RATIO_PORTRAIT_THREE_FOUR',
  'IMAGE_ASPECT_RATIO_LANDSCAPE_FOUR_THREE',
]
const VIDEO_AR: VideoAspectRatio[] = [
  'VIDEO_ASPECT_RATIO_LANDSCAPE',
  'VIDEO_ASPECT_RATIO_PORTRAIT',
]
const VIDEO_MODES: VideoMode[] = ['t2v', 'i2v', 'r2v', 'seedance']
const RESOLUTIONS: ImageResolution[] = ['1K', '2K', '4K']

export type RoutingValidation =
  | { ok: true; config: VidtoryRoutingConfig }
  | { ok: false; message: string }

function parseModels(
  raw: unknown,
  kind: 'image' | 'video',
): { ok: true; models: ModelWeight[] } | { ok: false; message: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, message: `${kind}: cần ít nhất 1 model` }
  }
  const models: ModelWeight[] = []
  for (const row of raw) {
    if (!row || typeof row !== 'object') {
      return { ok: false, message: `${kind}: model không hợp lệ` }
    }
    const m = row as Record<string, unknown>
    const modelId = String(m.modelId ?? '').trim()
    if (!modelId || modelId.length > 120) {
      return { ok: false, message: `${kind}: modelId bắt buộc (≤120 ký tự)` }
    }
    const weight = Number(m.weight)
    if (!Number.isFinite(weight) || weight < 0 || weight > 10_000) {
      return {
        ok: false,
        message: `${kind}: weight của ${modelId} phải từ 0–10000`,
      }
    }
    models.push({
      modelId,
      weight,
      label: typeof m.label === 'string' ? m.label.slice(0, 80) : undefined,
      enabled: m.enabled === false ? false : true,
    })
  }
  const active = models.filter((m) => m.enabled !== false && m.weight > 0)
  if (active.length === 0) {
    return {
      ok: false,
      message: `${kind}: cần ≥1 model bật với weight > 0`,
    }
  }
  return { ok: true, models }
}

function normalizeBaseURL(raw: unknown): string {
  const s = String(raw ?? DEFAULT_VIDTORY_BASE_URL).trim().replace(/\/$/, '')
  if (!s) return DEFAULT_VIDTORY_BASE_URL
  try {
    const u = new URL(s)
    if (u.protocol !== 'https:' && u.protocol !== 'http:') {
      return DEFAULT_VIDTORY_BASE_URL
    }
    return u.origin + (u.pathname === '/' ? '' : u.pathname).replace(/\/$/, '')
  } catch {
    return DEFAULT_VIDTORY_BASE_URL
  }
}

/** Validate + normalize admin payload */
export function validateVidtoryRouting(raw: unknown): RoutingValidation {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, message: 'Cấu hình rỗng' }
  }
  const o = raw as Record<string, unknown>
  const img = o.image as Record<string, unknown> | undefined
  const vid = o.video as Record<string, unknown> | undefined
  if (!img || !vid) {
    return { ok: false, message: 'Thiếu khối image hoặc video' }
  }

  const baseURL = normalizeBaseURL(o.baseURL)

  const imageAr = String(img.aspectRatio ?? '') as ImageAspectRatio
  if (!IMAGE_AR.includes(imageAr)) {
    return { ok: false, message: 'image.aspectRatio không hỗ trợ' }
  }
  const resolution = String(img.resolution ?? '1K') as ImageResolution
  if (!RESOLUTIONS.includes(resolution)) {
    return { ok: false, message: 'image.resolution phải là 1K|2K|4K' }
  }
  const imgModels = parseModels(img.models, 'image')
  if (!imgModels.ok) return imgModels

  const videoAr = String(vid.aspectRatio ?? '') as VideoAspectRatio
  if (!VIDEO_AR.includes(videoAr)) {
    return { ok: false, message: 'video.aspectRatio không hỗ trợ' }
  }
  const duration = Number(vid.duration ?? 6)
  if (!Number.isFinite(duration) || duration < 1 || duration > 30) {
    return { ok: false, message: 'video.duration phải 1–30 giây' }
  }
  let mode: VideoMode | undefined
  if (vid.mode != null && String(vid.mode).trim() !== '') {
    const m = String(vid.mode) as VideoMode
    if (!VIDEO_MODES.includes(m)) {
      return { ok: false, message: 'video.mode phải là t2v|i2v|r2v|seedance' }
    }
    mode = m
  }
  const vidModels = parseModels(vid.models, 'video')
  if (!vidModels.ok) return vidModels

  return {
    ok: true,
    config: {
      baseURL,
      image: {
        aspectRatio: imageAr,
        resolution,
        mode: typeof img.mode === 'string' ? img.mode : undefined,
        models: imgModels.models,
      },
      video: {
        aspectRatio: videoAr,
        duration,
        mode,
        models: vidModels.models,
      },
    },
  }
}

/**
 * Weighted random pick among enabled models with weight > 0.
 * `rng` is injectable for tests (returns [0, 1)).
 */
export function pickWeightedModel(
  models: ModelWeight[],
  rng: () => number = Math.random,
): ModelWeight {
  const active = models.filter((m) => m.enabled !== false && m.weight > 0)
  if (active.length === 0) {
    throw new Error('Không có model khả dụng (weight > 0)')
  }
  const total = active.reduce((s, m) => s + m.weight, 0)
  let roll = rng() * total
  if (roll < 0) roll = 0
  if (roll >= total) roll = total - Number.EPSILON
  let acc = 0
  for (const m of active) {
    acc += m.weight
    if (roll < acc) return m
  }
  return active[active.length - 1]!
}

/**
 * Situational mode — NOT weight-based:
 * - has ref image → i2v
 * - pure text → t2v
 */
export function resolveVideoMode(hasRefImage: boolean): VideoMode {
  return hasRefImage ? 'i2v' : 't2v'
}

/** Percent display for admin UI (normalized). */
export function modelWeightPercents(
  models: ModelWeight[],
): Array<ModelWeight & { percent: number }> {
  const active = models.filter((m) => m.enabled !== false && m.weight > 0)
  const total = active.reduce((s, m) => s + m.weight, 0) || 1
  return models.map((m) => ({
    ...m,
    percent:
      m.enabled === false || m.weight <= 0
        ? 0
        : Math.round((m.weight / total) * 1000) / 10,
  }))
}
