export const MEE_RIVE_CONTRACT = {
  artboard: 'Mee',
  stateMachine: 'Mee Controller',
  inputs: {
    motion: 'motion',
    equip: 'equip',
    category: 'category',
  },
  motionValues: {
    idle: 0,
    inspect: 1,
    celebrate: 2,
  },
} as const

export const MEE_RIVE_SAMPLE = {
  src: 'https://public.rive.app/community/runtime-files/2195-4346-avatar-pack-use-case.riv',
  artboard: 'Avatar 1',
  stateMachine: 'avatar',
} as const

export type MeeCategory = 'body' | 'eyes' | 'hair' | 'shirt' | 'pants' | 'accessory'

export const MEE_CATEGORIES: ReadonlyArray<{ id: MeeCategory; label: string; value: number }> = [
  { id: 'body', label: 'Cơ thể', value: 0 },
  { id: 'eyes', label: 'Mắt', value: 1 },
  { id: 'hair', label: 'Tóc', value: 2 },
  { id: 'shirt', label: 'Áo', value: 3 },
  { id: 'pants', label: 'Quần', value: 4 },
  { id: 'accessory', label: 'Phụ kiện', value: 5 },
]

export type MeeRiveSelection = { category: MeeCategory; option: number; swatch: number }
