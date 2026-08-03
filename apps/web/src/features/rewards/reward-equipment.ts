import type { CSSProperties } from 'react'
import type { RewardKind } from '@/shared/lib/creation/rewards'
import { getGeneratedRewardAssetUrl, getResolvedRewardAssetUrl } from './reward-assets'
import {
  profileCardEdgeBackgroundStyle,
  profileEdgeBackgroundTone,
} from './profile-backgrounds'
export { profilePageThemeStyle } from './student-theme'
export { getGeneratedRewardAssetUrl } from './reward-assets'

export type RewardEquipment = Partial<Record<RewardKind, string>>

const equipmentKinds = new Set<RewardKind>([
  'avatar', 'frame', 'theme', 'event_ticket', 'perk', 'title', 'companion', 'effect', 'background',
])

export function rewardEquipmentFromRows(
  rows: ReadonlyArray<{ kind: RewardKind; rewardId: string }>,
): RewardEquipment {
  const equipment: RewardEquipment = {}
  for (const row of rows) {
    if (!equipmentKinds.has(row.kind) || !row.rewardId.trim()) continue
    equipment[row.kind] = row.rewardId
  }
  return equipment
}

const key = (userId: string) => `aikids.reward-equipment.${userId}`

export function readRewardEquipment(userId: string): RewardEquipment {
  try {
    return JSON.parse(localStorage.getItem(key(userId)) ?? '{}') as RewardEquipment
  } catch {
    return {}
  }
}

export function equipReward(
  userId: string,
  kind: RewardKind,
  rewardId: string,
): RewardEquipment {
  const next = { ...readRewardEquipment(userId), [kind]: rewardId }
  localStorage.setItem(key(userId), JSON.stringify(next))
  applyRewardEquipment(next)
  window.dispatchEvent(new CustomEvent('aikids:reward-equipped', { detail: next }))
  return next
}

export function unequipReward(userId: string, kind: RewardKind): RewardEquipment {
  const next = { ...readRewardEquipment(userId) }
  delete next[kind]
  localStorage.setItem(key(userId), JSON.stringify(next))
  applyRewardEquipment(next)
  window.dispatchEvent(new CustomEvent('aikids:reward-equipped', { detail: next }))
  return next
}

export function syncRewardEquipment(
  userId: string,
  equipment: RewardEquipment,
): RewardEquipment {
  localStorage.setItem(key(userId), JSON.stringify(equipment))
  applyRewardEquipment(equipment)
  window.dispatchEvent(new CustomEvent('aikids:reward-equipped', { detail: equipment }))
  return equipment
}

export function applyRewardEquipment(equipment: RewardEquipment): void {
  document.documentElement.dataset.stickerEffect =
    equipment.effect === 'perk-sticker-sparkle' ? 'sparkle' : ''
}

export function rewardFrameStyle(frameId?: string): CSSProperties {
  if (frameId === 'frame-rainbow') {
    return {
      padding: 6,
      background: 'conic-gradient(#fb7185,#fbbf24,#4ade80,#38bdf8,#a78bfa,#fb7185)',
      boxShadow: '0 8px 30px rgba(56,189,248,.3)',
    }
  }
  if (frameId === 'frame-galaxy') {
    return {
      padding: 7,
      background: 'conic-gradient(#312e81,#7c3aed,#fbbf24,#1e1b4b,#312e81)',
      boxShadow: '0 0 0 4px #ede9fe, 0 10px 35px rgba(76,29,149,.45)',
    }
  }
  if (frameId === 'frame-cloud-summer') {
    return {
      padding: 7,
      background: 'linear-gradient(135deg,#bae6fd,#fff,#fef08a,#bae6fd)',
      boxShadow: '0 8px 30px rgba(14,165,233,.28)',
    }
  }
  if (frameId === 'frame-language-kingdom') {
    return { padding: 7, background: 'conic-gradient(#166534,#fbbf24,#166534)', boxShadow: '0 8px 30px rgba(22,101,52,.3)' }
  }
  if (frameId === 'frame-summit-gold') {
    return { padding: 7, background: 'linear-gradient(135deg,#78350f,#fbbf24,#fff7ed)', boxShadow: '0 8px 30px rgba(120,53,15,.32)' }
  }
  if (frameId === 'frame-galaxy-storyteller') {
    return { padding: 7, background: 'conic-gradient(#312e81,#c084fc,#fbbf24,#312e81)', boxShadow: '0 0 25px rgba(192,132,252,.55)' }
  }
  return {}
}

export function rewardLevelBadgeStyle(frameId?: string): CSSProperties {
  if (frameId === 'frame-rainbow') {
    return {
      background: 'linear-gradient(90deg,#fb7185,#fbbf24,#38bdf8,#8b5cf6)',
      boxShadow: '0 6px 18px rgba(56,189,248,.28)',
    }
  }
  if (frameId === 'frame-galaxy') {
    return {
      background: 'linear-gradient(90deg,#312e81,#7c3aed,#312e81)',
      boxShadow: '0 0 0 3px #ede9fe, 0 7px 20px rgba(76,29,149,.38)',
    }
  }
  if (frameId === 'frame-language-kingdom') {
    return {
      background: 'linear-gradient(90deg,#166534,#22c55e,#ca8a04)',
      boxShadow: '0 6px 18px rgba(22,101,52,.3)',
    }
  }
  if (frameId === 'frame-summit-gold') {
    return {
      background: 'linear-gradient(90deg,#78350f,#d97706,#fbbf24)',
      boxShadow: '0 6px 18px rgba(120,53,15,.32)',
    }
  }
  if (frameId === 'frame-galaxy-storyteller') {
    return {
      background: 'linear-gradient(90deg,#312e81,#8b5cf6,#db2777)',
      boxShadow: '0 6px 20px rgba(139,92,246,.4)',
    }
  }
  return {
    background: 'var(--color-brand-600)',
    boxShadow: 'var(--shadow-soft)',
  }
}

export function profileCardBackgroundStyle(backgroundId?: string): CSSProperties {
  return profileCardEdgeBackgroundStyle(backgroundId)
}

export type ProfileCardBackgroundTone = 'light' | 'dark'

export function profileCardBackgroundTone(backgroundId?: string): ProfileCardBackgroundTone {
  return profileEdgeBackgroundTone(backgroundId)
}

export function getRewardAssetUrl(rewardId: string): string | undefined {
  return getResolvedRewardAssetUrl(rewardId)
}
