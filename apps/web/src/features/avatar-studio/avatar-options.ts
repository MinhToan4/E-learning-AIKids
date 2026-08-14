export const AVATAR_CATEGORIES = [
  { id: 'hair', label: 'Kiểu tóc' },
  { id: 'hairColor', label: 'Màu tóc' },
  { id: 'skin', label: 'Màu da' },
  { id: 'face', label: 'Khuôn mặt' },
  { id: 'eyes', label: 'Đôi mắt' },
  { id: 'expression', label: 'Biểu cảm' },
  { id: 'outfit', label: 'Trang phục' },
  { id: 'accessory', label: 'Phụ kiện' },
  { id: 'shoes', label: 'Giày' },
  { id: 'hat', label: 'Mũ' },
] as const

export type AvatarCategory = typeof AVATAR_CATEGORIES[number]['id']
export type AvatarSelection = Record<AvatarCategory, number>

export const AVATAR_OPTION_COUNTS: Record<AvatarCategory, number> = {
  hair: 2,
  hairColor: 6,
  skin: 6,
  face: 4,
  eyes: 2,
  expression: 5,
  outfit: 2,
  accessory: 6,
  shoes: 2,
  hat: 2,
}

export const DEFAULT_AVATAR_SELECTION: AvatarSelection = {
  hair: 0,
  hairColor: 1,
  skin: 2,
  face: 0,
  eyes: 0,
  expression: 0,
  outfit: 0,
  accessory: 0,
  shoes: 0,
  hat: 0,
}

export function randomAvatarSelection(random = Math.random): AvatarSelection {
  return Object.fromEntries(
    AVATAR_CATEGORIES.map(({ id }) => [id, Math.floor(random() * AVATAR_OPTION_COUNTS[id])]),
  ) as AvatarSelection
}
