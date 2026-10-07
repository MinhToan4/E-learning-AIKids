import { designerAssets } from '@/shared/config/assets'

export interface HomeIslandTheme {
  islandNumber: number
  islandName: string
  shortName: string
  scene: string
  cardBg: string
  borderColor: string
  accentColor: string
  badgeBg: string
  badgeText: string
  badgeBorder: string
  buttonGradient: string
  pillBorder: string
}

export const HOME_ISLAND_THEMES: Record<number, HomeIslandTheme> = {
  0: {
    islandNumber: 0,
    islandName: 'Đảo Tiên Quyết',
    shortName: '10 Quy tắc vàng',
    scene: designerAssets.worldScenes.aiValley,
    cardBg: 'bg-gradient-to-br from-violet-50/90 via-purple-50/40 to-white',
    borderColor: 'border-purple-200/90',
    accentColor: '#7c3aed',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-900',
    badgeBorder: 'border-purple-200/90',
    buttonGradient: 'from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:to-violet-700',
    pillBorder: 'border-purple-200/90',
  },
  1: {
    islandNumber: 1,
    islandName: 'Đảo Khám Phá',
    shortName: 'Bốn chìa khóa vàng',
    scene: designerAssets.worldScenes.promptKeys,
    cardBg: 'bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white',
    borderColor: 'border-emerald-200/90',
    accentColor: '#059669',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    badgeBorder: 'border-emerald-200/90',
    buttonGradient: 'from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600',
    pillBorder: 'border-emerald-200/90',
  },
  2: {
    islandNumber: 2,
    islandName: 'Đảo Họa Sĩ',
    shortName: 'Tớ là hoạ sĩ',
    scene: designerAssets.worldScenes.creativeMountain,
    cardBg: 'bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white',
    borderColor: 'border-amber-200/90',
    accentColor: '#ea580c',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-200/90',
    buttonGradient: 'from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600',
    pillBorder: 'border-amber-200/90',
  },
  3: {
    islandNumber: 3,
    islandName: 'Đảo Nhân Vật',
    shortName: 'Biệt đội nhân vật',
    scene: designerAssets.worldScenes.characterLab,
    cardBg: 'bg-gradient-to-br from-sky-50/90 via-blue-50/40 to-white',
    borderColor: 'border-sky-200/90',
    accentColor: '#0284c7',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-900',
    badgeBorder: 'border-sky-200/90',
    buttonGradient: 'from-sky-500 via-blue-500 to-sky-600 hover:from-sky-600 hover:to-blue-600',
    pillBorder: 'border-sky-200/90',
  },
  4: {
    islandNumber: 4,
    islandName: 'Đảo Truyện Tranh',
    shortName: 'Vương quốc truyện tranh',
    scene: designerAssets.worldScenes.storyIsland,
    cardBg: 'bg-gradient-to-br from-pink-50/90 via-rose-50/40 to-white',
    borderColor: 'border-pink-200/90',
    accentColor: '#db2777',
    badgeBg: 'bg-pink-100',
    badgeText: 'text-pink-900',
    badgeBorder: 'border-pink-200/90',
    buttonGradient: 'from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600',
    pillBorder: 'border-pink-200/90',
  },
  5: {
    islandNumber: 5,
    islandName: 'Đảo Trò Chơi',
    shortName: 'Đấu trường trò chơi',
    scene: designerAssets.worldScenes.gameArena,
    cardBg: 'bg-gradient-to-br from-indigo-50/90 via-purple-50/40 to-white',
    borderColor: 'border-indigo-200/90',
    accentColor: '#4f46e5',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-900',
    badgeBorder: 'border-indigo-200/90',
    buttonGradient: 'from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-600',
    pillBorder: 'border-indigo-200/90',
  },
}

export function getHomeIslandTheme(islandNumber?: number): HomeIslandTheme {
  const num = typeof islandNumber === 'number' && islandNumber in HOME_ISLAND_THEMES ? islandNumber : 2
  return HOME_ISLAND_THEMES[num]
}
