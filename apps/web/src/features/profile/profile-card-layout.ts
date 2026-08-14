export const PROFILE_CARD_LAYOUT_CODE = 'system-profile-card-layout'

export type ProfileCardSlot = { scalePercent: number; offsetXPercent: number; offsetYPercent: number; layer: number }
export type ProfileCardLayout = {
  canvasWidth: number
  canvasHeight: number
  bindings: { avatarToFrame: boolean; effectToFrame: boolean; companionToFrame: boolean }
  slots: { frame: ProfileCardSlot; avatar: ProfileCardSlot; effect: ProfileCardSlot; companion: ProfileCardSlot; name: ProfileCardSlot; level: ProfileCardSlot; title: ProfileCardSlot }
}

export const DEFAULT_PROFILE_CARD_LAYOUT: ProfileCardLayout = {
  canvasWidth: 900,
  canvasHeight: 240,
  bindings: { avatarToFrame: true, effectToFrame: true, companionToFrame: false },
  slots: {
    effect: { scalePercent: 100, offsetXPercent: 0, offsetYPercent: 0, layer: 10 },
    avatar: { scalePercent: 100, offsetXPercent: 0, offsetYPercent: 0, layer: 20 },
    frame: { scalePercent: 100, offsetXPercent: 0, offsetYPercent: 0, layer: 30 },
    companion: { scalePercent: 100, offsetXPercent: 0, offsetYPercent: 0, layer: 40 },
    name: { scalePercent: 100, offsetXPercent: 0, offsetYPercent: 0, layer: 50 },
    level: { scalePercent: 100, offsetXPercent: 0, offsetYPercent: 0, layer: 51 },
    title: { scalePercent: 100, offsetXPercent: 0, offsetYPercent: 0, layer: 60 },
  },
}

export function profileCardSlotStyle(slot: ProfileCardSlot) {
  return { transform: `translate(${slot.offsetXPercent}%, ${slot.offsetYPercent}%) scale(${slot.scalePercent / 100})`, zIndex: slot.layer }
}

export function normalizeProfileCardLayout(value?: Partial<ProfileCardLayout>): ProfileCardLayout {
  const incoming = value?.slots as Partial<ProfileCardLayout['slots']> | undefined
  const slots = Object.fromEntries((Object.keys(DEFAULT_PROFILE_CARD_LAYOUT.slots) as Array<keyof ProfileCardLayout['slots']>).map((key) => [key, {
    ...DEFAULT_PROFILE_CARD_LAYOUT.slots[key],
    ...(incoming?.[key] ?? {}),
  }])) as unknown as ProfileCardLayout['slots']
  const bindings = { ...DEFAULT_PROFILE_CARD_LAYOUT.bindings, ...(value?.bindings ?? {}) }
  if (bindings.avatarToFrame) slots.avatar = { ...slots.avatar, offsetXPercent: slots.frame.offsetXPercent, offsetYPercent: slots.frame.offsetYPercent }
  if (bindings.effectToFrame) slots.effect = { ...slots.effect, offsetXPercent: slots.frame.offsetXPercent, offsetYPercent: slots.frame.offsetYPercent }
  if (bindings.companionToFrame) slots.companion = { ...slots.companion, offsetXPercent: slots.frame.offsetXPercent, offsetYPercent: slots.frame.offsetYPercent }
  return {
    canvasWidth: Number(value?.canvasWidth ?? DEFAULT_PROFILE_CARD_LAYOUT.canvasWidth),
    canvasHeight: Number(value?.canvasHeight ?? DEFAULT_PROFILE_CARD_LAYOUT.canvasHeight),
    bindings,
    slots,
  }
}
