/**
 * Designer asset catalog — Soft Clay language: warm, handmade, non–plastic-neon.
 * Single source of truth for all FE static asset paths.
 * - All art-style thumbnails → /assets/optimized/ (80–200 KB each)
 * - All lobby/brand images → /assets/optimized/ where available
 * - FE chrome only; course/quest truth lives in SQL/API.
 */
import type { ArtStyleId } from '@/shared/lib/creation/creative'

export const designerAssets = {
  brand: {
    logo: '/assets/designer/brand/logo.svg',
    /** Optimized mascot (333 KB) — raw 6.9 MB files removed */
    mascot: '/assets/optimized/brand-mascot.webp',
    /** Original orange Mee from Figma node 272:44, reserved for modal guidance. */
    modalMascot: '/assets/designer/brand/modal-cat-original.webp',
    playLearn: '/assets/designer/brand/lets_play_and_learn.svg',
    cosmic: '/assets/designer/brand/cosmic_bg.svg',
  },
  companions: {
    cloud: '/assets/designer/companions/paco-cloud-companion.png',
    leaf: '/assets/designer/companions/paco-leaf-companion.png',
    sea: '/assets/designer/companions/paco-sea-companion.png',
    fire: '/assets/designer/companions/paco-fire-companion.png',
  },
  lobby: {
    bgHome: '/assets/designer/lobby/bg-home.webp',
    bgLogin: '/assets/optimized/lobby-bg-login.webp',
    bgCharacter: '/assets/optimized/lobby-bg-character.webp',
    bgArt: '/assets/designer/lobby/bg-art.webp',
    cardArt: '/assets/optimized/lobby-card_art.webp',
    cardMee: '/assets/optimized/lobby-card_mee.webp',
    cardDiary: '/assets/optimized/lobby-card_diary.webp',
    artComic: '/assets/optimized/lobby-art-comic.webp',
    artImage: '/assets/optimized/lobby-art-image.webp',
    artVideo: '/assets/optimized/lobby-art-video.webp',
    titleHome: '/assets/designer/lobby/title-home-vn.webp',
    titleArt: '/assets/designer/lobby/title-art-vn.webp',
    homeCharacter: '/assets/optimized/lobby-home-character.webp',
    homeExplore: '/assets/optimized/lobby-home-explore.webp',
    mii: '/assets/optimized/lobby-mii-character.webp',
    girl: '/assets/designer/lobby/girl-character.webp',
    /** character-feature raw files removed; use optimized mascot as fallback */
    characterFeature: '/assets/optimized/brand-mascot.webp',
  },
  /** Full AIkid art-style pack (filenames match designer export, including farbic typo). */
  styles: {
    watercolor: '/assets/optimized/art-style-watercolor.webp',
    cartoon: '/assets/optimized/art-style-cartoon.webp',
    crayon: '/assets/optimized/art-style-crayon.webp',
    anime: '/assets/optimized/art-style-anime.webp',
    manga: '/assets/optimized/art-style-manga.webp',
    comic: '/assets/optimized/art-style-comic.webp',
    sketch: '/assets/optimized/art-style-sketch.webp',
    '3d': '/assets/optimized/art-style-3D.webp',
    pixel: '/assets/optimized/art-style-pixel.webp',
    chibi: '/assets/optimized/art-style-chibi.webp',
    clay: '/assets/optimized/art-style-clay.webp',
    fabric: '/assets/optimized/art-style-farbic.webp',
    manhwa: '/assets/optimized/art-style-manhwa.webp',
    semirealistic: '/assets/optimized/art-style-semirealistic.webp',
  } satisfies Record<ArtStyleId, string>,
  course: {
    /** designer/hub deleted — use optimized lobby versions instead */
    comic: '/assets/optimized/lobby-art-comic.webp',
    safety: '/assets/optimized/lobby-card_diary.webp',
    voice: '/assets/optimized/lobby-art-video.webp',
    robot: '/assets/optimized/lobby-card_mee.webp',
    /** Legacy root covers (also used as fallbacks) */
    comicAlt: '/assets/course-comic.webp',
    robotAlt: '/assets/course-robot.webp',
    safetyAlt: '/assets/course-safety.webp',
    voiceAlt: '/assets/course-voice.webp',
  },
  workshop: {
    character: '/assets/optimized/lobby-home-character.webp',
    style: '/assets/optimized/art-style-clay.webp',
    comic: '/assets/optimized/lobby-art-comic.webp',
    mee: '/assets/optimized/lobby-card_mee.webp',
  },
  game: {
    /** Original StoryMee game companion, generated for the encouraging play loop. */
    coach: '/assets/game/mii-game-coach.webp',
    map: '/assets/game/idea-island-map.webp',
    mapSmall: '/assets/game/idea-island-map-960.webp',
  },
  worldScenes: {
    aiValley: '/assets/aikid-ui/world-scenes/scene-ai-valley-generated.png',
    storyIsland: '/assets/aikid-ui/world-scenes/scene-story-island-generated.png',
    creativeMountain: '/assets/aikid-ui/world-scenes/scene-creative-mountain-generated.png',
  },
  asmoScenes: {
    appleForest: '/assets/asmo-scenes/scene_apple_forest.png',
    sweetBakery: '/assets/asmo-scenes/scene_sweet_bakery.png',
    pizzaOcean: '/assets/asmo-scenes/scene_pizza_ocean.png',
    clockMountain: '/assets/asmo-scenes/scene_clock_mountain.png',
    crystalOlympic: '/assets/asmo-scenes/scene_crystal_olympic.png',
  },
  worldLibrary: {
    aikidOfficial: '/assets/optimized/world-library/aikid-official-world.png',
    school: '/assets/optimized/world-library/school-world.png',
    creator: '/assets/optimized/world-library/creator-world.png',
  },
  programs: {
    aiFoundation: '/assets/optimized/programs/aikid-ai-foundation.png',
    creativeFoundationsL1: '/assets/optimized/programs/aikids-creative-foundations-l1.jpg',
    creativeStudioL2: '/assets/optimized/programs/aikids-creative-studio-l2.jpg',
    roboticsFirstLab: '/assets/optimized/programs/robotics-first-lab.png',
    tinyFilmStudio: '/assets/optimized/programs/tiny-film-studio.png',
  },
  storybook: {
    chapterBackgrounds: [
      '/assets/designer/storybook/chapter-01.webp',
      '/assets/designer/storybook/chapter-02.webp',
      '/assets/designer/storybook/chapter-03.webp',
      '/assets/designer/storybook/chapter-04.webp',
      '/assets/designer/storybook/chapter-05.webp',
      '/assets/designer/storybook/chapter-06-forest-v2.webp',
      '/assets/designer/storybook/chapter-07.webp',
      '/assets/designer/storybook/chapter-08.webp',
    ],
    chapterTabs: [
      '/assets/designer/storybook/tabs/chapter-01.webp',
      '/assets/designer/storybook/tabs/chapter-02.webp',
      '/assets/designer/storybook/tabs/chapter-03.webp',
      '/assets/designer/storybook/tabs/chapter-04.webp',
      '/assets/designer/storybook/tabs/chapter-05.webp',
      '/assets/designer/storybook/tabs/chapter-06.webp',
      '/assets/designer/storybook/tabs/chapter-07.webp',
      '/assets/designer/storybook/tabs/chapter-08.webp',
    ],
  },
  community: {
    islands: {
      gallery: '/assets/designer/community/community-island-gallery-v1.png',
      honor: '/assets/designer/community/community-island-honor-v1.png',
      interaction: '/assets/designer/community/community-island-interaction-v1.png',
    },
  },
  achievementExperience: {
    progressValley: '/assets/designer/achievements/progress-valley-v2.webp',
    badgeCabinet: '/assets/designer/achievements/badge-cabinet-v2.webp',
  },
  /** Decorative chrome (badges, maps) — designer Soft Clay */
  chrome: {
    badges: '/assets/ui-badges.webp',
    mascotHero: '/assets/mascot-hero.webp',
    mascotMap: '/assets/mascot-map.webp',
    adventureMap: '/assets/adventure-map.webp',
    storyWorkshop: '/assets/story-workshop.webp',
    /** Leaderboard / class celebration hero */
    podium: '/assets/optimized/lobby-home-explore.webp',
  },
} as const

/**
 * Shared artwork resolver for program cards across learner, parent and CMS.
 * Backend-owned artwork remains authoritative for custom programs; official
 * program IDs receive stable local fallbacks so every role sees the same art.
 */
export function programArtworkHint(input: {
  id?: string | null
  title?: string | null
  imageUrl?: string | null
}): string {
  const value = `${input.id ?? ''} ${input.title ?? ''}`.toLocaleLowerCase('vi')
  if (value.includes('creative-foundations-l1') || value.includes('sáng tạo cùng ai')) {
    return designerAssets.programs.creativeFoundationsL1
  }
  if (value.includes('creative-studio-l2') || value.includes('xưởng sáng tạo ai')) {
    return designerAssets.programs.creativeStudioL2
  }
  if (value.includes('robot')) return designerAssets.programs.roboticsFirstLab
  if (value.includes('tiny-film') || value.includes('phim tí hon')) return designerAssets.programs.tinyFilmStudio
  if (value.includes('ai-foundation') || value.includes('ai bạn') || value.includes('thung lũng ai')) {
    return designerAssets.programs.aiFoundation
  }
  if (input.imageUrl?.startsWith('/')) return input.imageUrl
  return designerAssets.programs.aiFoundation
}

export function styleImage(id: ArtStyleId): string {
  return designerAssets.styles[id]
}

export function courseCoverHint(input: {
  courseKey?: string | null
  ageTrack?: string | null
  coverImage?: string | null
}): string {
  if (
    input.coverImage &&
    input.coverImage.trim() &&
    input.coverImage.startsWith('/') &&
    !input.coverImage.includes('/designer/hub/')
  ) {
    return input.coverImage
  }
  const key = input.courseKey ?? 'K1'
  if (key === 'K1') return designerAssets.chrome.adventureMap
  if (key === 'K2') return designerAssets.workshop.character
  if (key === 'K3') return designerAssets.chrome.storyWorkshop
  if (key === 'K4') return designerAssets.course.comic
  if (key === 'K5') return designerAssets.chrome.podium
  if (key === 'K6') return designerAssets.course.voice
  return designerAssets.chrome.adventureMap
}
