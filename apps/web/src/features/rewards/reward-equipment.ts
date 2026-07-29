import type { RewardKind } from '@aikids/domain'
import type { CSSProperties } from 'react'

export type RewardEquipment = Partial<Record<RewardKind, string>>

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

export function applyRewardEquipment(equipment: RewardEquipment): void {
  if (equipment.theme) {
    document.documentElement.dataset.rewardTheme = equipment.theme
  } else {
    delete document.documentElement.dataset.rewardTheme
  }
  document.documentElement.dataset.stickerEffect =
    equipment.perk === 'perk-sticker-sparkle' ? 'sparkle' : ''
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
  return {}
}
