/**
 * Map 0 / 1 / N media URLs (or Vidtory media IDs) to Generative Core fields.
 * - 0 → text-only
 * - 1 → refImageUrl
 * - N → startImages (optional primaryRef = first for APIs that want both)
 */

export type MediaRefInput = string

export interface ImageGenRefs {
  /** true when no media attached */
  textOnly: boolean
  refImageUrl?: string
  startImages?: string[]
}

export interface VideoGenRefs {
  textOnly: boolean
  /** situational: has any ref → i2v else t2v (caller may still force) */
  hasRef: boolean
  refImageUrl?: string
  startImages?: string[]
}

function clean(urls: MediaRefInput[]): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const raw of urls) {
    const u = String(raw ?? '').trim()
    if (!u || seen.has(u)) continue
    seen.add(u)
    out.push(u)
  }
  return out
}

/**
 * Image generation field mapping.
 * n=1 → only refImageUrl; n≥2 → startImages (and primary as refImageUrl for style tools).
 */
export function buildImageGenRefs(urls: MediaRefInput[]): ImageGenRefs {
  const list = clean(urls)
  if (list.length === 0) return { textOnly: true }
  if (list.length === 1) {
    return { textOnly: false, refImageUrl: list[0] }
  }
  return {
    textOnly: false,
    refImageUrl: list[0],
    startImages: list,
  }
}

/**
 * Video generation field mapping.
 * n=1 → refImageUrl (i2v still)
 * n≥2 → startImages + refImageUrl = first (primary keyframe)
 */
export function buildVideoGenRefs(urls: MediaRefInput[]): VideoGenRefs {
  const list = clean(urls)
  if (list.length === 0) {
    return { textOnly: true, hasRef: false }
  }
  if (list.length === 1) {
    return {
      textOnly: false,
      hasRef: true,
      refImageUrl: list[0],
    }
  }
  return {
    textOnly: false,
    hasRef: true,
    refImageUrl: list[0],
    startImages: list,
  }
}

/** Metadata template for Vidtory media.upload (merchant-shared key isolation). */
export function buildVidtoryUploadMetadata(input: {
  userId: string
  purpose?: string
  questId?: string | null
  assetId?: string | null
  tenant?: string
}): Record<string, string> {
  const meta: Record<string, string> = {
    aikids_tenant: input.tenant ?? 'aikids',
    aikids_user_id: input.userId,
  }
  if (input.purpose) meta.aikids_purpose = input.purpose
  if (input.questId) meta.aikids_quest_id = input.questId
  if (input.assetId) meta.aikids_asset_id = input.assetId
  return meta
}

/** Purposes that mean free-form / off-curriculum upload — never allow as gen ref. */
export const BLOCKED_REF_PURPOSES = [
  'backpack_upload',
  'student_upload',
  'free_upload',
  'camera_roll',
] as const

/**
 * Workshop creations may be used as references in later creative steps.
 * An explicit marker keeps camera-roll/free-upload content out of child AI flows.
 */
export function isCreativeWorkshopAsset(meta?: Record<string, unknown> | null): boolean {
  if (!meta || meta.purpose !== 'creative_workshop') return false
  return (
    meta.creativeKind === 'character' ||
    meta.creativeKind === 'art' ||
    meta.creativeKind === 'comic' ||
    meta.creativeKind === 'video'
  )
}

/**
 * Generative providers can read an absolute HTTP(S) URL or an inline image.
 * Relative UI assets are intentionally rejected: they are browser-local and
 * caused opaque provider failures when they escaped the reference picker.
 */
export function isUsableImageReference(raw: unknown): raw is string {
  if (typeof raw !== 'string') return false
  const value = raw.trim()
  if (/^https?:\/\/[^\s]+$/i.test(value)) return true
  return /^data:image\/(png|jpe?g|webp);base64,[a-z0-9+/=\s]+$/i.test(value)
}

/**
 * Only course-created artifacts may be used as AI refs:
 * drawn/generated/completed inside a quest — not arbitrary student photos.
 */
export function isCourseCreatedAsset(input: {
  questId?: string | null
  type: string
  meta?: Record<string, unknown> | null
}): boolean {
  const meta = input.meta ?? {}
  const purpose = String(meta.purpose ?? '')
  if (
    (BLOCKED_REF_PURPOSES as readonly string[]).includes(purpose) ||
    meta.allowArbitraryUpload === true
  ) {
    return false
  }
  // Linked to a lesson station
  if (input.questId) return true
  // Explicit course-generation markers
  if (
    meta.generationMode != null ||
    meta.kind === 'ai_pick' ||
    meta.kind === 'comic' ||
    meta.kind === 'character' ||
    meta.kind === 'sketch' ||
    meta.styleId != null ||
    meta.courseCreated === true ||
    meta.purpose === 'course_sketch'
  ) {
    return true
  }
  // Practice product types only when marked from pipeline
  if (
    (input.type === 'character' ||
      input.type === 'panel' ||
      input.type === 'sticker') &&
    (meta.provider === 'vidtory' || meta.prompt != null)
  ) {
    return true
  }
  return false
}

/**
 * Validate in-lesson sketch payload: must be PNG/JPEG/WebP data URL, size-capped.
 * Rejects raw file uploads disguised as sketch (no http remote arbitrary photos here).
 */
export function parseCourseSketchDataUrl(
  raw: unknown,
  opts?: { maxBytes?: number },
):
  | { ok: true; dataUrl: string; mime: string; approxBytes: number }
  | { ok: false; message: string } {
  if (typeof raw !== 'string' || !raw.trim()) {
    return { ok: false, message: 'Chưa có nét vẽ — hãy vẽ trên canvas trong bài.' }
  }
  const s = raw.trim()
  const m = /^data:(image\/(png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=\s]+)$/i.exec(
    s,
  )
  if (!m) {
    return {
      ok: false,
      message:
        'Sketch phải là ảnh vẽ trong bài (data URL png/jpeg/webp), không dán ảnh ngoài.',
    }
  }
  const mime = m[1]!.toLowerCase().replace('image/jpg', 'image/jpeg')
  const b64 = m[3]!.replace(/\s/g, '')
  // base64 length * 0.75 ≈ bytes
  const approxBytes = Math.floor((b64.length * 3) / 4)
  const max = opts?.maxBytes ?? 3 * 1024 * 1024
  if (approxBytes <= 0 || approxBytes > max) {
    return {
      ok: false,
      message: 'Ảnh vẽ quá lớn hoặc rỗng (tối đa ~3MB).',
    }
  }
  // Require minimal content (avoid empty white 1x1 abuse as “photo”)
  if (approxBytes < 200) {
    return { ok: false, message: 'Hãy vẽ thêm vài nét trên canvas nhé!' }
  }
  return {
    ok: true,
    dataUrl: `data:${mime};base64,${b64}`,
    mime,
    approxBytes,
  }
}
