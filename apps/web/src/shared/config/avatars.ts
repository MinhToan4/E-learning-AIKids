/**
 * Student avatar catalog — Soft Clay / designer-backed where possible.
 * IDs are stable (stored on User.avatarId). Emoji is always a safe fallback.
 */
import { designerAssets } from './assets'

export type AvatarOption = {
  id: string
  label: string
  emoji: string
  /** Optional designer image for richer chrome */
  image?: string
}

export const STUDENT_AVATARS: readonly AvatarOption[] = [
  {
    id: 'avatar-robot',
    label: 'Robot',
    emoji: '🤖',
    image: designerAssets.lobby.mii,
  },
  {
    id: 'avatar-cat',
    label: 'Mèo',
    emoji: '🐱',
    image: designerAssets.lobby.girl,
  },
  {
    id: 'avatar-star',
    label: 'Sao',
    emoji: '⭐',
    image: designerAssets.brand.mascot,
  },
  {
    id: 'avatar-dragon',
    label: 'Rồng',
    emoji: '🐉',
    image: designerAssets.lobby.cardMee,
  },
  {
    id: 'avatar-fox',
    label: 'Cáo',
    emoji: '🦊',
    image: designerAssets.lobby.homeCharacter,
  },
  {
    id: 'avatar-owl',
    label: 'Cú',
    emoji: '🦉',
    image: designerAssets.lobby.characterFeature,
  },
  {
    id: 'avatar-bear',
    label: 'Gấu',
    emoji: '🐻',
    image: designerAssets.lobby.cardMee,
  },
  {
    id: 'avatar-unicorn',
    label: 'Kỳ lân',
    emoji: '🦄',
    image: designerAssets.workshop.character,
  },
  {
    id: 'avatar-rocket',
    label: 'Tên lửa',
    emoji: '🚀',
    image: designerAssets.lobby.homeExplore,
  },
  {
    id: 'avatar-artist',
    label: 'Họa sĩ',
    emoji: '🎨',
    image: designerAssets.lobby.cardArt,
  },
  {
    id: 'avatar-comic',
    label: 'Truyện',
    emoji: '📚',
    image: designerAssets.course.comic,
  },
  {
    id: 'avatar-film',
    label: 'Phim',
    emoji: '🎬',
    image: designerAssets.course.voice,
  },
] as const

const byId = new Map(STUDENT_AVATARS.map((a) => [a.id, a]))

export function getAvatar(id: string | null | undefined): AvatarOption {
  if (id && byId.has(id)) return byId.get(id)!
  return STUDENT_AVATARS[0]!
}

export function avatarEmoji(id: string | null | undefined): string {
  return getAvatar(id).emoji
}

export function avatarImage(id: string | null | undefined): string | undefined {
  return getAvatar(id).image
}
