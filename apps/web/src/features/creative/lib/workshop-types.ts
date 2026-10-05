/**
 * Creative Workshop — shared types.
 * All workshop steps are TSX-native; no HTML files or iframes needed.
 */

export type WorkshopStep =
  | 'hub'
  | 'style'
  | 'canvas'
  | 'character'
  | 'story-mode'
  | 'story-genre'
  | 'story-idea'
  | 'story-library'

export type ArtStyleEntry = {
  id: string
  label: string
  img: string
}

export const ART_STYLES: ArtStyleEntry[] = [
  { id: 'watercolor', label: 'Màu Nước', img: '/assets/optimized/art-style-watercolor.webp' },
  { id: 'cartoon', label: 'Hoạt Hình', img: '/assets/optimized/art-style-cartoon.webp' },
  { id: 'crayon', label: 'Bút Sáp', img: '/assets/optimized/art-style-crayon.webp' },
  { id: 'anime', label: 'Anime', img: '/assets/optimized/art-style-anime.webp' },
  { id: 'manga', label: 'Manga', img: '/assets/optimized/art-style-manga.webp' },
  { id: 'comic', label: 'Truyện Tranh', img: '/assets/optimized/art-style-comic.webp' },
  { id: 'sketch', label: 'Tranh Chì', img: '/assets/optimized/art-style-sketch.webp' },
  { id: '3d', label: '3D', img: '/assets/optimized/art-style-3D.webp' },
  { id: 'pixel', label: 'Pixel', img: '/assets/optimized/art-style-pixel.webp' },
  { id: 'chibi', label: 'Chibi', img: '/assets/optimized/art-style-chibi.webp' },
  { id: 'clay', label: 'Đất Sét', img: '/assets/optimized/art-style-clay.webp' },
  { id: 'fabric', label: 'Vải Nỉ', img: '/assets/optimized/art-style-farbic.webp' },
  { id: 'manhwa', label: 'Manhwa', img: '/assets/optimized/art-style-manhwa.webp' },
  { id: 'semirealistic', label: 'Bán Tả Thực', img: '/assets/optimized/art-style-semirealistic.webp' },
]

export const STORY_GENRES = [
  { id: 'adventure', label: '⚔️ Phiêu lưu', desc: 'Hành trình khám phá thế giới kỳ bí' },
  { id: 'fantasy', label: '🧙 Kỳ ảo', desc: 'Phép thuật, rồng và những điều diệu kỳ' },
  { id: 'comedy', label: '😄 Hài hước', desc: 'Những câu chuyện vui vẻ, bất ngờ' },
  { id: 'mystery', label: '🔍 Bí ẩn', desc: 'Giải mã manh mối, tìm ra sự thật' },
  { id: 'scifi', label: '🚀 Khoa học viễn tưởng', desc: 'Robot, không gian và công nghệ tương lai' },
  { id: 'nature', label: '🌿 Thiên nhiên', desc: 'Động vật, rừng và đại dương' },
]

export interface AiStudioStyle {
  id: string
  label: string
  buttonActionText: string
  img: string
  desc: string
}

export const AI_STUDIO_STYLES: AiStudioStyle[] = [
  {
    id: 'clay',
    label: 'Đất Nặn 3D',
    buttonActionText: '🎨 Vẽ theo phong cách Đất Nặn 3D',
    img: '/assets/optimized/art-style-clay.webp',
    desc: 'Khối đất nặn tròn xoe, ấm áp, ngộ nghĩnh',
  },
  {
    id: 'watercolor',
    label: 'Màu Nước Pastel',
    buttonActionText: '🎨 Vẽ theo phong cách Màu Nước Pastel',
    img: '/assets/optimized/art-style-watercolor.webp',
    desc: 'Màu loang trong trẻo, êm dịu trên giấy vẽ',
  },
  {
    id: 'cartoon',
    label: 'Hoạt Hình 3D',
    buttonActionText: '🎨 Vẽ theo phong cách Hoạt Hình 3D',
    img: '/assets/optimized/art-style-cartoon.webp',
    desc: 'Nét vẽ hoạt hình sống động, màu sắc tươi vui',
  },
  {
    id: 'sketch',
    label: 'Tranh Chì Màu',
    buttonActionText: '🎨 Vẽ theo phong cách Tranh Chì Màu',
    img: '/assets/optimized/art-style-sketch.webp',
    desc: 'Nét phác chì mộc mạc, đáng yêu và gần gũi',
  },
]

export const AI_STUDIO_IDEA_SUGGESTIONS = [
  'Mèo Aiki phiêu lưu',
  'Khu rừng kỳ diệu',
  'Lâu đài trên mây',
  'Robot thám hiểm',
  'Ngôi nhà bánh kẹo',
] as const

