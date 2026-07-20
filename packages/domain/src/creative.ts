/**
 * Pure catalogs for AIkid xưởng-sáng-tạo mechanics inside courses.
 * Style/character options are domain truth; FE maps ids → designer image paths.
 */

export type ArtStyleId =
  | 'watercolor'
  | 'cartoon'
  | 'crayon'
  | 'anime'
  | 'manga'
  | 'comic'
  | 'sketch'
  | '3d'
  | 'pixel'
  | 'chibi'
  | 'clay'
  | 'fabric'
  | 'manhwa'
  | 'semirealistic'

export type ArtStyleDef = {
  id: ArtStyleId
  labelVi: string
  /** Soft-clay kid-safe one-liner */
  tip: string
}

/** Full art-style set mirrored from AIkid art constants (labels only). */
export const ART_STYLES: ArtStyleDef[] = [
  { id: 'watercolor', labelVi: 'Màu nước', tip: 'Mềm, loang nhẹ như màu nước' },
  { id: 'cartoon', labelVi: 'Hoạt hình', tip: 'Nét rõ, vui, dễ đọc' },
  { id: 'crayon', labelVi: 'Bút sáp', tip: 'Vân sáp ấm, không bóng nhựa' },
  { id: 'anime', labelVi: 'Anime', tip: 'Mắt to, màu tươi vừa phải' },
  { id: 'manga', labelVi: 'Manga', tip: 'Đen trắng / nét truyện giấy' },
  { id: 'comic', labelVi: 'Truyện tranh', tip: 'Khung truyện, bóng đơn giản' },
  { id: 'sketch', labelVi: 'Tranh chì', tip: 'Nét chì mềm, phác thảo' },
  { id: '3d', labelVi: '3D clay', tip: 'Khối tròn clay — không chrome kim loại' },
  { id: 'pixel', labelVi: 'Pixel', tip: 'Ô vuông dễ thương' },
  { id: 'chibi', labelVi: 'Chibi', tip: 'Đầu to, thân nhỏ, siêu dễ thương' },
  { id: 'clay', labelVi: 'Đất sét', tip: 'Soft clay handmade' },
  { id: 'fabric', labelVi: 'Vải nỉ', tip: 'Chất liệu vải mềm' },
  { id: 'manhwa', labelVi: 'Manhwa', tip: 'Truyện tranh Hàn ấm' },
  { id: 'semirealistic', labelVi: 'Bán tả thực', tip: 'Gần thật nhưng vẫn dễ thương' },
]

const STYLE_IDS = new Set(ART_STYLES.map((s) => s.id))

export function isArtStyleId(value: string): value is ArtStyleId {
  return STYLE_IDS.has(value as ArtStyleId)
}

export function assertArtStyleId(value: string): ArtStyleId {
  if (!isArtStyleId(value)) {
    throw new CreativeError(`Phong cách không hợp lệ: ${value}`)
  }
  return value
}

export function getArtStyle(id: ArtStyleId): ArtStyleDef {
  return ART_STYLES.find((s) => s.id === id)!
}

/** Character shape choices — simplified from AIkid character questions. */
export const CHARACTER_SHAPES = [
  { id: 'animal', labelVi: 'Con vật', emoji: '🐱' },
  { id: 'robot', labelVi: 'Robot', emoji: '🤖' },
  { id: 'human', labelVi: 'Bạn nhỏ', emoji: '🧒' },
  { id: 'creature', labelVi: 'Sinh vật lạ', emoji: '🐉' },
  { id: 'object', labelVi: 'Đồ vật sống', emoji: '⭐' },
] as const

export type CharacterShapeId = (typeof CHARACTER_SHAPES)[number]['id']

export const CHARACTER_VIBES = [
  { id: 'cute', labelVi: 'Đáng yêu', emoji: '🥰' },
  { id: 'brave', labelVi: 'Dũng cảm', emoji: '💪' },
  { id: 'curious', labelVi: 'Tò mò', emoji: '🧐' },
  { id: 'funny', labelVi: 'Hài hước', emoji: '😄' },
] as const

export type CharacterVibeId = (typeof CHARACTER_VIBES)[number]['id']

export function isCharacterShapeId(v: string): v is CharacterShapeId {
  return CHARACTER_SHAPES.some((s) => s.id === v)
}

export function isCharacterVibeId(v: string): v is CharacterVibeId {
  return CHARACTER_VIBES.some((s) => s.id === v)
}

export function buildCharacterLabel(parts: {
  name: string
  shapeId?: string
  vibeId?: string
}): string {
  const shape = CHARACTER_SHAPES.find((s) => s.id === parts.shapeId)
  const vibe = CHARACTER_VIBES.find((s) => s.id === parts.vibeId)
  return [parts.name.trim(), shape?.labelVi, vibe?.labelVi]
    .filter(Boolean)
    .join(' · ')
}

export class CreativeError extends Error {
  readonly statusCode = 400
  constructor(message: string) {
    super(message)
    this.name = 'CreativeError'
  }
}
