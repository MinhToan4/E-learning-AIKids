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
  /** Kid-facing guidance shown in the lesson UI. */
  tip: string
  /** Provider-neutral generation language sent through StoryMee Core Job. */
  promptDescriptor: string
}

/** Full art-style set mirrored from AIkid art constants (labels only). */
export const ART_STYLES: ArtStyleDef[] = [
  { id: 'watercolor', labelVi: 'Màu nước', tip: 'Mềm, loang nhẹ như màu nước', promptDescriptor: 'watercolor on cold-pressed paper, translucent wet-on-wet washes, soft pigment blooms and visible paper grain' },
  { id: 'cartoon', labelVi: 'Hoạt hình', tip: 'Nét rõ, vui, dễ đọc', promptDescriptor: 'classic 2D cartoon, clean bold outlines, flat vibrant colors, playful proportions and gentle cel shading' },
  { id: 'crayon', labelVi: 'Bút sáp', tip: 'Vân sáp ấm, không bóng nhựa', promptDescriptor: 'hand-drawn wax crayon, visible wax grain, imperfect strokes, warm analog colors and matte paper texture' },
  { id: 'anime', labelVi: 'Anime', tip: 'Mắt to, màu tươi vừa phải', promptDescriptor: 'high-quality child-friendly anime, crisp linework, expressive eyes, balanced cel shading and bright colors' },
  { id: 'manga', labelVi: 'Manga', tip: 'Đen trắng / nét truyện giấy', promptDescriptor: 'black-and-white manga, crisp pen-and-ink linework, screentone shading, crosshatching and expressive composition' },
  { id: 'comic', labelVi: 'Truyện tranh', tip: 'Khung truyện, bóng đơn giản', promptDescriptor: 'color comic-book illustration, bold ink outlines, flat color fields, halftone texture and dynamic readable composition' },
  { id: 'sketch', labelVi: 'Tranh chì', tip: 'Nét chì mềm, phác thảo', promptDescriptor: 'detailed graphite pencil sketch, visible pencil grain, soft blending, careful crosshatching and sketchbook paper' },
  { id: '3d', labelVi: '3D clay', tip: 'Khối tròn clay — không chrome kim loại', promptDescriptor: 'stylized 3D animation render, smooth rounded geometry, matte colors, soft studio lighting and gentle ambient occlusion' },
  { id: 'pixel', labelVi: 'Pixel', tip: 'Ô vuông dễ thương', promptDescriptor: '16-bit pixel art, crisp hard pixel edges, no anti-aliasing, limited palette, dithering and a friendly retro game aesthetic' },
  { id: 'chibi', labelVi: 'Chibi', tip: 'Đầu to, thân nhỏ, siêu dễ thương', promptDescriptor: 'kawaii chibi, oversized round head, tiny body, sparkling expressive eyes, rosy cheeks and a soft pastel palette' },
  { id: 'clay', labelVi: 'Đất sét', tip: 'Soft clay handmade', promptDescriptor: 'handmade claymation, matte plasticine, subtle fingerprints and tool marks, warm diorama lighting and rounded forms' },
  { id: 'fabric', labelVi: 'Vải nỉ', tip: 'Chất liệu vải mềm', promptDescriptor: 'felt-fabric applique, fuzzy wool texture, visible blanket stitching, layered textile shapes and a cozy handmade palette' },
  { id: 'manhwa', labelVi: 'Manhwa', tip: 'Truyện tranh Hàn ấm', promptDescriptor: 'modern child-friendly manhwa webtoon, delicate linework, polished full color, luminous shading and expressive faces' },
  { id: 'semirealistic', labelVi: 'Bán tả thực', tip: 'Gần thật nhưng vẫn dễ thương', promptDescriptor: 'semi-realistic digital illustration, stylized proportions, painterly shading, natural soft light and refined texture detail' },
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

export function buildArtGenerationPrompt(id: ArtStyleId): string {
  const style = getArtStyle(id)
  return [
    'Study the child-provided reference sketch and identify its main subjects, approximate composition, colors and story.',
    `Recreate that same idea as a polished ${style.promptDescriptor}.`,
    'Keep the subjects and composition recognizable while improving clarity, detail and finish like a skilled children’s-book illustrator.',
    'Child-safe and wholesome for ages 6-15; friendly mood; no violence, frightening imagery, adult content, text, watermark or border.',
  ].join(' ')
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
