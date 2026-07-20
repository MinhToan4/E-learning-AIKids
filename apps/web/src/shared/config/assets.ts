/**
 * Designer asset catalog — source: Documents/AIkid (new-lobby-page + SVG PNG_backup + AIkidApp public)
 * Soft Clay language: warm, handmade, non–plastic-neon.
 * FE chrome only; course/quest truth lives in SQL/API.
 */
import type { ArtStyleId } from '@aikids/domain'

export const designerAssets = {
  brand: {
    logo: '/assets/designer/brand/logo.svg',
    mascot: '/assets/designer/brand/mascot.png',
    playLearn: '/assets/designer/brand/lets_play_and_learn.svg',
    cosmic: '/assets/designer/brand/cosmic_bg.svg',
  },
  lobby: {
    bgHome: '/assets/designer/lobby/bg-home.png',
    bgLogin: '/assets/designer/lobby/bg-login.jpeg',
    bgCharacter: '/assets/designer/lobby/bg-character.png',
    bgArt: '/assets/designer/lobby/bg-art.png',
    cardArt: '/assets/designer/lobby/card_art.jpeg',
    cardMee: '/assets/designer/lobby/card_mee.jpeg',
    cardDiary: '/assets/designer/lobby/card_diary.jpeg',
    artComic: '/assets/designer/lobby/art-comic.jpeg',
    artImage: '/assets/designer/lobby/art-image.jpeg',
    artVideo: '/assets/designer/lobby/art-video.jpeg',
    titleHome: '/assets/designer/lobby/title-home-vn.png',
    titleArt: '/assets/designer/lobby/title-art-vn.png',
    homeCharacter: '/assets/designer/lobby/home-character.jpeg',
    homeExplore: '/assets/designer/lobby/home-explore.jpeg',
    mii: '/assets/designer/lobby/mii-character.png',
    girl: '/assets/designer/lobby/girl-character.png',
    characterFeature: '/assets/designer/lobby/character-feature-test.png',
  },
  hub: {
    artComic: '/assets/designer/hub/art-comic.jpeg',
    artImage: '/assets/designer/hub/art-image.jpeg',
    cardArt: '/assets/designer/hub/card_art.jpeg',
    cardMee: '/assets/designer/hub/card_mee.jpeg',
    homeCharacter: '/assets/designer/hub/home-character.jpeg',
  },
  /** Full AIkid art-style pack (filenames match designer export, including farbic typo). */
  styles: {
    watercolor: '/assets/designer/styles/art-style-watercolor.jpeg',
    cartoon: '/assets/designer/styles/art-style-cartoon.jpeg',
    crayon: '/assets/designer/styles/art-style-crayon.jpeg',
    anime: '/assets/designer/styles/art-style-anime.jpeg',
    manga: '/assets/designer/styles/art-style-manga.jpeg',
    comic: '/assets/designer/styles/art-style-comic.jpeg',
    sketch: '/assets/designer/styles/art-style-sketch.jpeg',
    '3d': '/assets/designer/styles/art-style-3D.jpeg',
    pixel: '/assets/designer/styles/art-style-pixel.jpeg',
    chibi: '/assets/designer/styles/art-style-chibi.jpeg',
    clay: '/assets/designer/styles/art-style-clay.jpeg',
    fabric: '/assets/designer/styles/art-style-farbic.jpeg',
    manhwa: '/assets/designer/styles/art-style-manhwa.jpeg',
    semirealistic: '/assets/designer/styles/art-style-semirealistic.jpeg',
  } satisfies Record<ArtStyleId, string>,
  course: {
    comic: '/assets/designer/hub/art-comic.jpeg',
    safety: '/assets/designer/lobby/card_diary.jpeg',
    voice: '/assets/designer/lobby/art-video.jpeg',
    robot: '/assets/designer/lobby/card_mee.jpeg',
  },
  workshop: {
    character: '/assets/designer/lobby/home-character.jpeg',
    style: '/assets/designer/styles/art-style-clay.jpeg',
    comic: '/assets/designer/lobby/art-comic.jpeg',
    mee: '/assets/designer/lobby/card_mee.jpeg',
  },
} as const

export function styleImage(id: ArtStyleId): string {
  return designerAssets.styles[id]
}
