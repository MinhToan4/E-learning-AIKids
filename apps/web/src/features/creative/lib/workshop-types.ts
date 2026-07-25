/**
 * Creative Workshop ΓÇö shared types.
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
  { id: 'watercolor', label: 'M├áu N╞░ß╗¢c', img: '/assets/optimized/art-style-watercolor.jpg' },
  { id: 'cartoon', label: 'Hoß║ít H├¼nh', img: '/assets/optimized/art-style-cartoon.jpg' },
  { id: 'crayon', label: 'B├║t S├íp', img: '/assets/optimized/art-style-crayon.jpg' },
  { id: 'anime', label: 'Anime', img: '/assets/optimized/art-style-anime.jpg' },
  { id: 'manga', label: 'Manga', img: '/assets/optimized/art-style-manga.jpg' },
  { id: 'comic', label: 'Truyß╗çn Tranh', img: '/assets/optimized/art-style-comic.jpg' },
  { id: 'sketch', label: 'Tranh Ch├¼', img: '/assets/optimized/art-style-sketch.jpg' },
  { id: '3d', label: '3D', img: '/assets/optimized/art-style-3D.jpg' },
  { id: 'pixel', label: 'Pixel', img: '/assets/optimized/art-style-pixel.jpg' },
  { id: 'chibi', label: 'Chibi', img: '/assets/optimized/art-style-chibi.jpg' },
  { id: 'clay', label: '─Éß║Ñt S├⌐t', img: '/assets/optimized/art-style-clay.jpg' },
  { id: 'fabric', label: 'Vß║úi Nß╗ë', img: '/assets/optimized/art-style-farbic.jpg' },
  { id: 'manhwa', label: 'Manhwa', img: '/assets/optimized/art-style-manhwa.jpg' },
  { id: 'semirealistic', label: 'B├ín Tß║ú Thß╗▒c', img: '/assets/optimized/art-style-semirealistic.jpg' },
]

export const STORY_GENRES = [
  { id: 'adventure', label: 'ΓÜö∩╕Å Phi├¬u l╞░u', desc: 'H├ánh tr├¼nh kh├ím ph├í thß║┐ giß╗¢i kß╗│ b├¡' },
  { id: 'fantasy', label: '≡ƒºÖ Kß╗│ ß║úo', desc: 'Ph├⌐p thuß║¡t, rß╗ông v├á nhß╗»ng ─æiß╗üu diß╗çu kß╗│' },
  { id: 'comedy', label: '≡ƒÿä H├ái h╞░ß╗¢c', desc: 'Nhß╗»ng c├óu chuyß╗çn vui vß║╗, bß║Ñt ngß╗¥' },
  { id: 'mystery', label: '≡ƒöì B├¡ ß║⌐n', desc: 'Giß║úi m├ú manh mß╗æi, t├¼m ra sß╗▒ thß║¡t' },
  { id: 'scifi', label: '≡ƒÜÇ Khoa hß╗ìc viß╗àn t╞░ß╗ƒng', desc: 'Robot, kh├┤ng gian v├á c├┤ng nghß╗ç t╞░╞íng lai' },
  { id: 'nature', label: '≡ƒî┐ Thi├¬n nhi├¬n', desc: '─Éß╗Öng vß║¡t, rß╗½ng v├á ─æß║íi d╞░╞íng' },
]
