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
  desc?: string
}

export const AI_STUDIO_STYLES: AiStudioStyle[] = [
  {
    id: 'clay',
    label: 'Đất Nặn',
    buttonActionText: 'Vẽ theo phong cách Đất Nặn',
    img: '/assets/optimized/art-style-clay.webp',
  },
  {
    id: 'watercolor',
    label: 'Màu Nước',
    buttonActionText: 'Vẽ theo phong cách Màu Nước',
    img: '/assets/optimized/art-style-watercolor.webp',
  },
  {
    id: 'cartoon',
    label: 'Hoạt Hình',
    buttonActionText: 'Vẽ theo phong cách Hoạt Hình',
    img: '/assets/optimized/art-style-cartoon.webp',
  },
  {
    id: 'crayon',
    label: 'Bút Sáp',
    buttonActionText: 'Vẽ theo phong cách Bút Sáp',
    img: '/assets/optimized/art-style-crayon.webp',
  },
  {
    id: 'sketch',
    label: 'Tranh Chì',
    buttonActionText: 'Vẽ theo phong cách Tranh Chì',
    img: '/assets/optimized/art-style-sketch.webp',
  },
  {
    id: 'chibi',
    label: 'Chibi',
    buttonActionText: 'Vẽ theo phong cách Chibi',
    img: '/assets/optimized/art-style-chibi.webp',
  },
  {
    id: '3d',
    label: '3D Sống Động',
    buttonActionText: 'Vẽ theo phong cách 3D Sống Động',
    img: '/assets/optimized/art-style-3D.webp',
  },
  {
    id: 'anime',
    label: 'Anime',
    buttonActionText: 'Vẽ theo phong cách Anime',
    img: '/assets/optimized/art-style-anime.webp',
  },
  {
    id: 'comic',
    label: 'Truyện Tranh',
    buttonActionText: 'Vẽ theo phong cách Truyện Tranh',
    img: '/assets/optimized/art-style-comic.webp',
  },
  {
    id: 'pixel',
    label: 'Pixel Art',
    buttonActionText: 'Vẽ theo phong cách Pixel Art',
    img: '/assets/optimized/art-style-pixel.webp',
  },
  {
    id: 'fabric',
    label: 'Vải Nỉ',
    buttonActionText: 'Vẽ theo phong cách Vải Nỉ',
    img: '/assets/optimized/art-style-farbic.webp',
  },
  {
    id: 'manhwa',
    label: 'Manhwa',
    buttonActionText: 'Vẽ theo phong cách Manhwa',
    img: '/assets/optimized/art-style-manhwa.webp',
  },
  {
    id: 'manga',
    label: 'Manga',
    buttonActionText: 'Vẽ theo phong cách Manga',
    img: '/assets/optimized/art-style-manga.webp',
  },
  {
    id: 'semirealistic',
    label: 'Bán Tả Thực',
    buttonActionText: 'Vẽ theo phong cách Bán Tả Thực',
    img: '/assets/optimized/art-style-semirealistic.webp',
  },
]

export const AI_STUDIO_IDEA_SUGGESTIONS = [
  'Mèo Aiki phiêu lưu',
  'Khu rừng kỳ diệu',
  'Lâu đài trên mây',
  'Robot thám hiểm',
  'Ngôi nhà bánh kẹo',
] as const

