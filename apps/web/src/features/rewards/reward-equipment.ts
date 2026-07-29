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

export function profileCardStyle(themeId?: string): CSSProperties {
  if (themeId === 'background-ai-gate') return { background: 'linear-gradient(135deg,#6b46c1,#f6e05e)' }
  if (themeId === 'background-ocean-artist') return { background: 'radial-gradient(circle at 80% 20%,#fb7185,transparent 28%),linear-gradient(135deg,#e0f2fe,#38bdf8)' }
  if (themeId === 'background-forest-guardian') return { background: 'radial-gradient(circle at 85% 20%,#a3e635,transparent 25%),linear-gradient(135deg,#dcfce7,#166534)', color: 'white' }
  if (themeId === 'theme-paco-workshop') return { background: 'radial-gradient(circle at 82% 18%,#fcd34d,transparent 24%),linear-gradient(135deg,#fff7ed,#fed7aa)' }
  if (themeId === 'theme-community-legend') return { background: 'radial-gradient(circle at 82% 18%,#f9a8d4,transparent 26%),linear-gradient(135deg,#fdf2f8,#fce7f3)' }
  if (themeId === 'theme-workshop') {
    return {
      background:
        'radial-gradient(circle at 85% 20%,rgba(251,191,36,.28),transparent 25%),linear-gradient(135deg,#fff7ed,#ffedd5,#fff)',
    }
  }
  if (themeId === 'theme-legend') {
    return {
      background:
        'radial-gradient(circle at 85% 18%,rgba(250,204,21,.2),transparent 25%),linear-gradient(135deg,#312e81,#6d28d9)',
      color: 'white',
    }
  }
  return {
    background:
      'radial-gradient(circle at 85% 15%,rgba(61,191,255,.18),transparent 28%),linear-gradient(135deg,#f5f3ff,#f1faff,#fffbec)',
  }
}
