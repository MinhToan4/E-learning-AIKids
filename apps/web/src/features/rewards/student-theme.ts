import type { CSSProperties } from 'react'
import { getSharedLevelRewardAssetId } from './reward-assets'

export function readStudentTheme(userId: string): string | undefined {
  try {
    const equipment = JSON.parse(
      localStorage.getItem(`aikids.reward-equipment.${userId}`) ?? '{}',
    ) as { theme?: string }
    return equipment.theme
  } catch {
    return undefined
  }
}

export function profilePageThemeStyle(themeId?: string): CSSProperties {
  const sharedAsset = getSharedLevelRewardAssetId(themeId)
  if (sharedAsset === 'background-cloud-garden') return {
    backgroundColor: '#f1faff',
    backgroundImage: [
      'radial-gradient(circle at 12% 8%,rgba(61,191,255,.22) 0 7rem,transparent 7.2rem)',
      'radial-gradient(circle at 88% 22%,rgba(255,201,74,.2) 0 8rem,transparent 8.2rem)',
      'linear-gradient(180deg,#eefaff 0%,#f8f5ff 54%,#fffbed 100%)',
    ].join(','),
    backgroundAttachment: 'scroll',
  }
  if (sharedAsset === 'background-star-library') return {
    backgroundColor: '#f5f3ff',
    backgroundImage: [
      'radial-gradient(circle,rgba(109,94,252,.16) 1.5px,transparent 1.8px)',
      'radial-gradient(circle at 84% 12%,rgba(255,201,74,.24),transparent 18rem)',
      'linear-gradient(180deg,#f3f0ff,#fff9e8)',
    ].join(','),
    backgroundPosition: '0 0,center,center',
    backgroundSize: '32px 32px,auto,auto',
  }
  if (sharedAsset === 'background-ocean-ideas') return {
    backgroundColor: '#effbff',
    backgroundImage: 'linear-gradient(160deg,#e8faff 0%,#eef6ff 48%,#f7f2ff 100%)',
  }
  if (sharedAsset === 'background-magical-forest') return {
    backgroundColor: '#effcf6',
    backgroundImage: [
      'radial-gradient(circle at 8% 18%,rgba(62,217,160,.2),transparent 18rem)',
      'radial-gradient(circle at 92% 72%,rgba(255,201,74,.16),transparent 20rem)',
      'linear-gradient(180deg,#edfcf6,#f7fbef)',
    ].join(','),
  }
  if (sharedAsset === 'background-future-workshop') return {
    backgroundColor: '#eefaff',
    backgroundImage: [
      'linear-gradient(rgba(61,191,255,.07) 1px,transparent 1px)',
      'linear-gradient(90deg,rgba(61,191,255,.07) 1px,transparent 1px)',
      'linear-gradient(160deg,#eefaff,#fff8e5)',
    ].join(','),
    backgroundSize: '48px 48px,48px 48px,auto',
  }
  if (sharedAsset === 'background-colorful-city') return {
    backgroundColor: '#fff7f8',
    backgroundImage: 'linear-gradient(160deg,#fff3f6 0%,#f4f1ff 52%,#eefaff 100%)',
  }
  if (sharedAsset === 'background-community-legend') return {
    backgroundColor: '#fff4f8',
    backgroundImage: 'linear-gradient(160deg,#fff0f5,#f5f0ff 50%,#effaff)',
  }
  if (sharedAsset === 'background-paco-cosmic') return {
    backgroundColor: '#f3f0ff',
    backgroundImage: [
      'radial-gradient(circle,rgba(109,94,252,.15) 1.5px,transparent 1.8px)',
      'linear-gradient(180deg,#f0edff,#f8f5ff)',
    ].join(','),
    backgroundSize: '36px 36px,auto',
  }
  if (sharedAsset === 'background-paco-workshop') return {
    backgroundColor: '#fff8e8',
    backgroundImage: 'linear-gradient(160deg,#fff8e7,#eefaff 55%,#f5f1ff)',
  }
  if (themeId === 'theme-paco-workshop') {
    return {
      backgroundColor: '#eefaff',
      backgroundImage: [
        'radial-gradient(circle at 8% 9%,rgba(56,189,248,.30) 0 7rem,transparent 7.2rem)',
        'radial-gradient(circle at 92% 12%,rgba(250,204,21,.30) 0 9rem,transparent 9.2rem)',
        'radial-gradient(circle at 88% 82%,rgba(251,146,60,.20) 0 11rem,transparent 11.2rem)',
        'radial-gradient(circle,rgba(14,165,233,.18) 1.5px,transparent 1.8px)',
        'linear-gradient(rgba(14,165,233,.06) 1px,transparent 1px)',
        'linear-gradient(90deg,rgba(14,165,233,.06) 1px,transparent 1px)',
        'linear-gradient(145deg,#effbff 0%,#fff9df 52%,#fff0dc 100%)',
      ].join(','),
      backgroundPosition: 'center',
      backgroundSize: 'auto,auto,auto,24px 24px,48px 48px,48px 48px,auto',
      boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.72)',
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
