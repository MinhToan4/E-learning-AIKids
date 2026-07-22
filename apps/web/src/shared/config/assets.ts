/**
 * Designer asset catalog — source: Documents/AIkid (new-lobby-page + SVG PNG_backup + AIkidApp public)
 * Soft Clay language: warm, handmade, non–plastic-neon.
 * FE chrome only; course/quest truth lives in SQL/API.
 */
import type { ArtStyleId } from '@aikids/domain'

export const designerAssets = {
  brand: {
    logo: '/assets/designer/brand/logo.svg',
    mascot: '/assets/optimized/brand-mascot.png',
    playLearn: '/assets/designer/brand/lets_play_and_learn.svg',
    cosmic: '/assets/designer/brand/cosmic_bg.svg',
  },
  lobby: {
    bgHome: '/assets/designer/lobby/bg-home.png',
    bgLogin: '/assets/designer/lobby/bg-login.jpeg',
    bgCharacter: '/assets/designer/lobby/bg-character.png',
    bgArt: '/assets/designer/lobby/bg-art.png',
    cardArt: '/assets/optimized/lobby-card_art.jpg',
    cardMee: '/assets/optimized/lobby-card_mee.jpg',
    cardDiary: '/assets/optimized/lobby-card_diary.jpg',
    artComic: '/assets/optimized/lobby-art-comic.jpg',
    artImage: '/assets/optimized/lobby-art-image.jpg',
    artVideo: '/assets/optimized/lobby-art-video.jpg',
    titleHome: '/assets/designer/lobby/title-home-vn.png',
    titleArt: '/assets/designer/lobby/title-art-vn.png',
    homeCharacter: '/assets/optimized/lobby-home-character.jpg',
    homeExplore: '/assets/optimized/lobby-home-explore.jpg',
    mii: '/assets/designer/lobby/mii-character.png',
    girl: '/assets/designer/lobby/girl-character.png',
    characterFeature: '/assets/designer/lobby/character-feature-test.png',
  },
  hub: {
    artComic: '/assets/optimized/lobby-art-comic.jpg',
    artImage: '/assets/optimized/lobby-art-image.jpg',
    cardArt: '/assets/optimized/lobby-card_art.jpg',
    cardMee: '/assets/optimized/lobby-card_mee.jpg',
    homeCharacter: '/assets/optimized/lobby-home-character.jpg',
  },
  /** Full AIkid art-style pack (filenames match designer export, including farbic typo). */
  styles: {
    watercolor: '/assets/optimized/art-style-watercolor.jpg',
    cartoon: '/assets/optimized/art-style-cartoon.jpg',
    crayon: '/assets/optimized/art-style-crayon.jpg',
    anime: '/assets/optimized/art-style-anime.jpg',
    manga: '/assets/optimized/art-style-manga.jpg',
    comic: '/assets/optimized/art-style-comic.jpg',
    sketch: '/assets/optimized/art-style-sketch.jpg',
    '3d': '/assets/optimized/art-style-3D.jpg',
    pixel: '/assets/optimized/art-style-pixel.jpg',
    chibi: '/assets/optimized/art-style-chibi.jpg',
    clay: '/assets/optimized/art-style-clay.jpg',
    fabric: '/assets/optimized/art-style-farbic.jpg',
    manhwa: '/assets/optimized/art-style-manhwa.jpg',
    semirealistic: '/assets/optimized/art-style-semirealistic.jpg',
  } satisfies Record<ArtStyleId, string>,
  course: {
    comic: '/assets/designer/hub/art-comic.jpeg',
    safety: '/assets/designer/lobby/card_diary.jpeg',
    voice: '/assets/designer/lobby/art-video.jpeg',
    robot: '/assets/designer/lobby/card_mee.jpeg',
    /** Legacy root covers (also used as fallbacks) */
    comicAlt: '/assets/course-comic.jpg',
    robotAlt: '/assets/course-robot.jpg',
    safetyAlt: '/assets/course-safety.jpg',
    voiceAlt: '/assets/course-voice.jpg',
  },
  workshop: {
    character: '/assets/designer/lobby/home-character.jpeg',
    style: '/assets/designer/styles/art-style-clay.jpeg',
    comic: '/assets/designer/lobby/art-comic.jpeg',
    mee: '/assets/designer/lobby/card_mee.jpeg',
  },
  /** Decorative chrome (badges, maps) — designer Soft Clay */
  chrome: {
    badges: '/assets/ui-badges.jpg',
    mascotHero: '/assets/mascot-hero.jpg',
    mascotMap: '/assets/mascot-map.jpg',
    adventureMap: '/assets/adventure-map.jpg',
    storyWorkshop: '/assets/story-workshop.jpg',
    /** Leaderboard / class celebration hero */
    podium: '/assets/designer/lobby/home-explore.jpeg',
  },
} as const

export function styleImage(id: ArtStyleId): string {
  return designerAssets.styles[id]
}

/** Pick a course cover image from ageTrack/courseKey heuristics (FE chrome only) */
export function courseCoverHint(input: {
  courseKey?: string | null
  ageTrack?: string | null
  coverImage?: string | null
}): string {
  if (input.coverImage) return input.coverImage
  const key = input.courseKey ?? 'K1'
  if (key === 'K4' || key === 'K3') return designerAssets.course.comic
  if (key === 'K5' || key === 'K6') return designerAssets.course.voice
  if (key === 'K2') return designerAssets.course.robot
  return designerAssets.course.safety
}
