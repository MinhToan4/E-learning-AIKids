import type { CSSProperties } from 'react'
import aiGate from '@/assets/rewards/backgrounds/generated/profile-edge-ai-gate.webp'
import forest from '@/assets/rewards/backgrounds/generated/profile-edge-forest.webp'
import island from '@/assets/rewards/backgrounds/generated/profile-edge-island.webp'
import ocean from '@/assets/rewards/backgrounds/generated/profile-edge-ocean.webp'
import playground from '@/assets/rewards/backgrounds/generated/profile-edge-playground.webp'
import stars from '@/assets/rewards/backgrounds/generated/profile-edge-stars.webp'
import { getSharedLevelRewardAssetId } from './reward-assets'

type EdgeBackground = {
  image: string
  color: string
  tone: 'light' | 'dark'
}

const edgeBackgrounds = {
  sunrise: { image: aiGate, color: '#f7e8e5', tone: 'light' },
  forest: { image: forest, color: '#f5f3dc', tone: 'light' },
  island: { image: island, color: '#f8ddbd', tone: 'light' },
  ocean: { image: ocean, color: '#daf8f7', tone: 'light' },
  playground: { image: playground, color: '#fff8e8', tone: 'light' },
  stars: { image: stars, color: '#50489d', tone: 'dark' },
} satisfies Record<string, EdgeBackground>

function edgeBackgroundFor(rewardId?: string): EdgeBackground {
  const sharedAsset = getSharedLevelRewardAssetId(rewardId)
  const logicalId = sharedAsset ?? rewardId ?? ''

  if (logicalId === 'background-ai-gate') return edgeBackgrounds.sunrise
  if (logicalId === 'background-ocean-artist' || logicalId === 'background-ocean-ideas') {
    return edgeBackgrounds.ocean
  }
  if (logicalId === 'background-forest-guardian' || logicalId === 'background-magical-forest') {
    return edgeBackgrounds.forest
  }
  if (logicalId === 'background-star-library' || logicalId === 'background-paco-cosmic' || logicalId === 'theme-legend') {
    return edgeBackgrounds.stars
  }
  if (logicalId === 'background-community-legend' || logicalId === 'theme-community-legend') {
    return edgeBackgrounds.island
  }
  if (logicalId === 'background-cloud-garden') return edgeBackgrounds.sunrise
  return edgeBackgrounds.playground
}

export function profileCardEdgeBackgroundStyle(rewardId?: string): CSSProperties {
  const background = edgeBackgroundFor(rewardId)
  return {
    backgroundColor: background.color,
    backgroundImage: `url("${background.image}")`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  }
}

export function profilePageEdgeBackgroundStyle(rewardId?: string): CSSProperties {
  const background = edgeBackgroundFor(rewardId)
  return {
    backgroundColor: background.color,
    backgroundImage: [
      `url("${background.image}")`,
      `linear-gradient(180deg,${background.color} 0%,#f8f6ff 72%)`,
    ].join(','),
    backgroundPosition: 'top center,center',
    backgroundRepeat: 'no-repeat,no-repeat',
    backgroundSize: 'max(100%, 76rem) auto,cover',
    backgroundAttachment: 'scroll',
  }
}

export function profileEdgeBackgroundTone(rewardId?: string): 'light' | 'dark' {
  return edgeBackgroundFor(rewardId).tone
}
