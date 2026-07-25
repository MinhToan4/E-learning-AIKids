/**
 * Pure catalogs for AIkid x╞░ß╗ƒng-s├íng-tß║ío mechanics inside courses.
 * Style/character options are domain truth; FE maps ids ΓåÆ designer image paths.
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
  { id: 'watercolor', labelVi: 'M├áu n╞░ß╗¢c', tip: 'Mß╗üm, loang nhß║╣ nh╞░ m├áu n╞░ß╗¢c', promptDescriptor: 'watercolor on cold-pressed paper, translucent wet-on-wet washes, soft pigment blooms and visible paper grain' },
  { id: 'cartoon', labelVi: 'Hoß║ít h├¼nh', tip: 'N├⌐t r├╡, vui, dß╗à ─æß╗ìc', promptDescriptor: 'classic 2D cartoon, clean bold outlines, flat vibrant colors, playful proportions and gentle cel shading' },
  { id: 'crayon', labelVi: 'B├║t s├íp', tip: 'V├ón s├íp ß║Ñm, kh├┤ng b├│ng nhß╗▒a', promptDescriptor: 'hand-drawn wax crayon, visible wax grain, imperfect strokes, warm analog colors and matte paper texture' },
  { id: 'anime', labelVi: 'Anime', tip: 'Mß║»t to, m├áu t╞░╞íi vß╗½a phß║úi', promptDescriptor: 'high-quality child-friendly anime, crisp linework, expressive eyes, balanced cel shading and bright colors' },
  { id: 'manga', labelVi: 'Manga', tip: '─Éen trß║»ng / n├⌐t truyß╗çn giß║Ñy', promptDescriptor: 'black-and-white manga, crisp pen-and-ink linework, screentone shading, crosshatching and expressive composition' },
  { id: 'comic', labelVi: 'Truyß╗çn tranh', tip: 'Khung truyß╗çn, b├│ng ─æ╞ín giß║ún', promptDescriptor: 'color comic-book illustration, bold ink outlines, flat color fields, halftone texture and dynamic readable composition' },
  { id: 'sketch', labelVi: 'Tranh ch├¼', tip: 'N├⌐t ch├¼ mß╗üm, ph├íc thß║úo', promptDescriptor: 'detailed graphite pencil sketch, visible pencil grain, soft blending, careful crosshatching and sketchbook paper' },
  { id: '3d', labelVi: '3D clay', tip: 'Khß╗æi tr├▓n clay ΓÇö kh├┤ng chrome kim loß║íi', promptDescriptor: 'stylized 3D animation render, smooth rounded geometry, matte colors, soft studio lighting and gentle ambient occlusion' },
  { id: 'pixel', labelVi: 'Pixel', tip: '├ö vu├┤ng dß╗à th╞░╞íng', promptDescriptor: '16-bit pixel art, crisp hard pixel edges, no anti-aliasing, limited palette, dithering and a friendly retro game aesthetic' },
  { id: 'chibi', labelVi: 'Chibi', tip: '─Éß║ºu to, th├ón nhß╗Å, si├¬u dß╗à th╞░╞íng', promptDescriptor: 'kawaii chibi, oversized round head, tiny body, sparkling expressive eyes, rosy cheeks and a soft pastel palette' },
  { id: 'clay', labelVi: '─Éß║Ñt s├⌐t', tip: 'Soft clay handmade', promptDescriptor: 'handmade claymation, matte plasticine, subtle fingerprints and tool marks, warm diorama lighting and rounded forms' },
  { id: 'fabric', labelVi: 'Vß║úi nß╗ë', tip: 'Chß║Ñt liß╗çu vß║úi mß╗üm', promptDescriptor: 'felt-fabric applique, fuzzy wool texture, visible blanket stitching, layered textile shapes and a cozy handmade palette' },
  { id: 'manhwa', labelVi: 'Manhwa', tip: 'Truyß╗çn tranh H├án ß║Ñm', promptDescriptor: 'modern child-friendly manhwa webtoon, delicate linework, polished full color, luminous shading and expressive faces' },
  { id: 'semirealistic', labelVi: 'B├ín tß║ú thß╗▒c', tip: 'Gß║ºn thß║¡t nh╞░ng vß║½n dß╗à th╞░╞íng', promptDescriptor: 'semi-realistic digital illustration, stylized proportions, painterly shading, natural soft light and refined texture detail' },
]

const STYLE_IDS = new Set(ART_STYLES.map((s) => s.id))

export function isArtStyleId(value: string): value is ArtStyleId {
  return STYLE_IDS.has(value as ArtStyleId)
}

export function assertArtStyleId(value: string): ArtStyleId {
  if (!isArtStyleId(value)) {
    throw new CreativeError(`Phong c├ích kh├┤ng hß╗úp lß╗ç: ${value}`)
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
    'Keep the subjects and composition recognizable while improving clarity, detail and finish like a skilled childrenΓÇÖs-book illustrator.',
    'Child-safe and wholesome for ages 6-15; friendly mood; no violence, frightening imagery, adult content, text, watermark or border.',
  ].join(' ')
}

/** Character shape choices ΓÇö simplified from AIkid character questions. */
export const CHARACTER_SHAPES = [
  { id: 'animal', labelVi: 'Con vß║¡t', emoji: '≡ƒÉ▒' },
  { id: 'robot', labelVi: 'Robot', emoji: '≡ƒñû' },
  { id: 'human', labelVi: 'Bß║ín nhß╗Å', emoji: '≡ƒºÆ' },
  { id: 'creature', labelVi: 'Sinh vß║¡t lß║í', emoji: '≡ƒÉë' },
  { id: 'object', labelVi: '─Éß╗ô vß║¡t sß╗æng', emoji: 'Γ¡É' },
] as const

export type CharacterShapeId = (typeof CHARACTER_SHAPES)[number]['id']

export const CHARACTER_VIBES = [
  { id: 'cute', labelVi: '─É├íng y├¬u', emoji: '≡ƒÑ░' },
  { id: 'brave', labelVi: 'D┼⌐ng cß║úm', emoji: '≡ƒÆ¬' },
  { id: 'curious', labelVi: 'T├▓ m├▓', emoji: '≡ƒºÉ' },
  { id: 'funny', labelVi: 'H├ái h╞░ß╗¢c', emoji: '≡ƒÿä' },
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
    .join(' ┬╖ ')
}

export class CreativeError extends Error {
  readonly statusCode = 400
  constructor(message: string) {
    super(message)
    this.name = 'CreativeError'
  }
}
