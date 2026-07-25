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
  { id: 'watercolor', label: 'Màu Nước', img: '/assets/optimized/art-style-watercolor.jpg' },
  { id: 'cartoon', label: 'Hoạt Hình', img: '/assets/optimized/art-style-cartoon.jpg' },
  { id: 'crayon', label: 'Bút Sáp', img: '/assets/optimized/art-style-crayon.jpg' },
  { id: 'anime', label: 'Anime', img: '/assets/optimized/art-style-anime.jpg' },
  { id: 'manga', label: 'Manga', img: '/assets/optimized/art-style-manga.jpg' },
  { id: 'comic', label: 'Truyện Tranh', img: '/assets/optimized/art-style-comic.jpg' },
  { id: 'sketch', label: 'Tranh Chì', img: '/assets/optimized/art-style-sketch.jpg' },
  { id: '3d', label: '3D', img: '/assets/optimized/art-style-3D.jpg' },
  { id: 'pixel', label: 'Pixel', img: '/assets/optimized/art-style-pixel.jpg' },
  { id: 'chibi', label: 'Chibi', img: '/assets/optimized/art-style-chibi.jpg' },
  { id: 'clay', label: 'Đất Sét', img: '/assets/optimized/art-style-clay.jpg' },
  { id: 'fabric', label: 'Vải Nỉ', img: '/assets/optimized/art-style-farbic.jpg' },
  { id: 'manhwa', label: 'Manhwa', img: '/assets/optimized/art-style-manhwa.jpg' },
  { id: 'semirealistic', label: 'Bán Tả Thực', img: '/assets/optimized/art-style-semirealistic.jpg' },
]

export const STORY_GENRES = [
  { id: 'adventure', label: '⚔️ Phiêu lưu', desc: 'Hành trình khám phá thế giới kỳ bí' },
  { id: 'fantasy', label: '🧙 Kỳ ảo', desc: 'Phép thuật, rồng và những điều diệu kỳ' },
  { id: 'comedy', label: '😄 Hài hước', desc: 'Những câu chuyện vui vẻ, bất ngờ' },
  { id: 'mystery', label: '🔍 Bí ẩn', desc: 'Giải mã manh mối, tìm ra sự thật' },
  { id: 'scifi', label: '🚀 Khoa học viễn tưởng', desc: 'Robot, không gian và công nghệ tương lai' },
  { id: 'nature', label: '🌿 Thiên nhiên', desc: 'Động vật, rừng và đại dương' },
]
