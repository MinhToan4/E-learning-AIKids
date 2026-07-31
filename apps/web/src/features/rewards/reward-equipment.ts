import type { CSSProperties } from 'react'
import type { RewardKind } from '@/shared/lib/creation/rewards'

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

export function syncRewardEquipment(
  userId: string,
  equipment: RewardEquipment,
): RewardEquipment {
  localStorage.setItem(key(userId), JSON.stringify(equipment))
  applyRewardEquipment(equipment)
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

export function profilePageThemeStyle(themeId?: string): CSSProperties {
  if (themeId === 'theme-paco-workshop') {
    return {
      background:
        'radial-gradient(circle at 82% 18%,rgba(252,211,77,.32),transparent 24rem),linear-gradient(135deg,#fff7ed,#fed7aa)',
    }
  }
  if (themeId === 'theme-community-legend') {
    return {
      background:
        'radial-gradient(circle at 82% 18%,rgba(249,168,212,.35),transparent 26rem),linear-gradient(135deg,#fdf2f8,#fce7f3)',
    }
  }
  if (themeId === 'theme-workshop') {
    return {
      background:
        'radial-gradient(circle at 15% 20%,rgba(251,191,36,.24),transparent 24rem),radial-gradient(circle at 85% 75%,rgba(249,115,22,.18),transparent 26rem),linear-gradient(135deg,#fff7ed,#ffedd5)',
    }
  }
  if (themeId === 'theme-legend') {
    return {
      background:
        'radial-gradient(circle at 20% 15%,rgba(124,58,237,.28),transparent 26rem),radial-gradient(circle at 80% 80%,rgba(250,204,21,.2),transparent 24rem),linear-gradient(135deg,#ede9fe,#fff7d6)',
    }
  }
  return {
    background:
      'radial-gradient(circle at 85% 15%,rgba(61,191,255,.16),transparent 28rem),linear-gradient(135deg,#f5f3ff,#f1faff,#fffbec)',
  }
}

export function profileCardBackgroundStyle(backgroundId?: string): CSSProperties {
  if (backgroundId === 'background-ai-gate') return { background: 'linear-gradient(135deg,#6b46c1,#f6e05e)' }
  if (backgroundId === 'background-ocean-artist') return { background: 'radial-gradient(circle at 80% 20%,#fb7185,transparent 28%),linear-gradient(135deg,#e0f2fe,#38bdf8)' }
  if (backgroundId === 'background-forest-guardian') return { background: 'radial-gradient(circle at 85% 20%,#a3e635,transparent 25%),linear-gradient(135deg,#dcfce7,#166534)', color: 'white' }
  return {
    background:
      'radial-gradient(circle at 85% 15%,rgba(61,191,255,.18),transparent 28%),linear-gradient(135deg,#f5f3ff,#f1faff,#fffbec)',
  }
}

export type ProfileCardBackgroundTone = 'light' | 'dark'

export function profileCardBackgroundTone(backgroundId?: string): ProfileCardBackgroundTone {
  return new Set([
    'background-ai-gate',
    'background-forest-guardian',
  ]).has(backgroundId ?? '')
    ? 'dark'
    : 'light'
}

export function getRewardAssetUrl(rewardId: string): string | undefined {
  const map: Record<string, string> = {
    'frame-rainbow': '/assets/rewards/frame-rainbow.svg',
    'frame-galaxy': '/assets/rewards/frame-galaxy.svg',
    'frame-cloud-summer': '/assets/rewards/frame-cloud-summer.svg',
    'frame-language-kingdom': '/assets/rewards/frame-language-kingdom.svg',
    'frame-summit-gold': '/assets/rewards/frame-summit-gold.svg',
    'frame-galaxy-storyteller': '/assets/rewards/frame-galaxy-storyteller.svg',
    'avatar-paco-blue': '/assets/rewards/paco-blue-companion.svg',
    'perk-sticker-sparkle': '/assets/rewards/effect-sparkle.svg',
    'background-ai-gate': '/assets/rewards/bg-ai-gate.svg',
    'theme-workshop': '/assets/rewards/theme-workshop.svg',
    'theme-legend': '/assets/rewards/theme-legend.svg',
    'title-first-light': '/assets/rewards/title-first-light.svg',
  }
  return map[rewardId]
}
