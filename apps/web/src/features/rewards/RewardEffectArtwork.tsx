import { useId } from 'react'
import { getSharedLevelRewardAssetId } from './reward-assets'

export type RewardEffectVisual = 'stardust' | 'rainbow' | 'fireflies' | 'bubbles'

export function effectVisualForReward(rewardId?: string): RewardEffectVisual {
  const assetId = getSharedLevelRewardAssetId(rewardId)
  if (rewardId === 'perk-sticker-sparkle' || assetId === 'effect-sunrise') return 'stardust'
  if (assetId === 'effect-rainbow') return 'rainbow'
  if (assetId === 'effect-galaxy') return 'fireflies'
  return 'bubbles'
}

export function effectAuraClassForReward(rewardId?: string): string {
  const visual = effectVisualForReward(rewardId)
  if (visual === 'rainbow') return 'shadow-[0_0_20px_8px_rgba(56,189,248,.22)]'
  if (visual === 'fireflies') return 'shadow-[0_0_20px_8px_rgba(62,217,160,.22)]'
  if (visual === 'bubbles') return 'shadow-[0_0_20px_8px_rgba(244,114,182,.2)]'
  return 'shadow-[0_0_20px_8px_rgba(251,191,36,.24)]'
}

export function RewardEffectArtwork({
  rewardId,
  large = false,
  className,
}: {
  rewardId?: string
  large?: boolean
  className?: string
}) {
  const visual = effectVisualForReward(rewardId)
  const id = useId().replace(/:/g, '')
  const size = className ?? (large ? 'h-32 w-32' : 'h-16 w-16')

  return (
    <svg
      viewBox="0 0 96 96"
      className={size}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`effect-rainbow-${id}`} x1="18" y1="72" x2="78" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF7B93" />
          <stop offset=".34" stopColor="#FFC94A" />
          <stop offset=".67" stopColor="#3ED9A0" />
          <stop offset="1" stopColor="#6D5EFC" />
        </linearGradient>
        <radialGradient id={`effect-bubble-${id}`} cx="0" cy="0" r="1" gradientTransform="translate(36 34) rotate(45) scale(34)">
          <stop stopColor="white" stopOpacity=".9" />
          <stop offset=".45" stopColor="#E0F2FE" stopOpacity=".45" />
          <stop offset="1" stopColor="#A78BFA" stopOpacity=".18" />
        </radialGradient>
      </defs>

      {visual === 'stardust' && (
        <g fill="#FFC94A" stroke="#A66B12" strokeWidth="1.2" strokeLinejoin="round">
          <path d="M48 13l3.6 10.4L62 27l-10.4 3.6L48 41l-3.6-10.4L34 27l10.4-3.6L48 13z" />
          <path d="M23 42l2.4 6.6L32 51l-6.6 2.4L23 60l-2.4-6.6L14 51l6.6-2.4L23 42z" />
          <path d="M72 46l2.8 7.2L82 56l-7.2 2.8L72 66l-2.8-7.2L62 56l7.2-2.8L72 46z" />
          <circle cx="36" cy="70" r="3" fill="#6D5EFC" stroke="none" />
          <circle cx="63" cy="75" r="2.5" fill="#3DBFFF" stroke="none" />
        </g>
      )}

      {visual === 'rainbow' && (
        <g stroke={`url(#effect-rainbow-${id})`} strokeLinecap="round">
          <path d="M11 46C18 10 76 2 86 42" strokeWidth="7" />
          <path d="M17 47C24 18 70 11 80 43" strokeWidth="4" opacity=".72" />
          <circle cx="10" cy="47" r="3.5" fill="#FF7B93" stroke="none" />
          <circle cx="87" cy="43" r="3.5" fill="#6D5EFC" stroke="none" />
        </g>
      )}

      {visual === 'fireflies' && (
        <g>
          <path d="M14 51C18 18 68 4 83 43C91 65 68 84 46 84" stroke="#3ED9A0" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 8" opacity=".55" />
          {[[15, 50], [28, 17], [69, 18], [82, 48], [68, 78], [28, 78]].map(([cx, cy], index) => (
            <g key={`${cx}-${cy}`}>
              <circle cx={cx} cy={cy} r={index % 2 ? 8 : 6} fill="#FEF08A" opacity=".2" />
              <circle cx={cx} cy={cy} r={index % 2 ? 3.2 : 2.7} fill="#FFC94A" />
            </g>
          ))}
        </g>
      )}

      {visual === 'bubbles' && (
        <g stroke="#6D5EFC" strokeWidth="1.5">
          {[[17, 57, 10], [36, 15, 9], [77, 38, 10], [68, 78, 7]].map(([cx, cy, r]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={`url(#effect-bubble-${id})`} />
          ))}
        </g>
      )}
    </svg>
  )
}

/** Calm profile treatment: a thin perimeter layer that never covers the face. */
export function ProfileRewardEffect({
  rewardId,
  className,
}: {
  rewardId?: string
  className?: string
}) {
  const visual = effectVisualForReward(rewardId)
  const id = useId().replace(/:/g, '')
  const ringId = `profile-effect-ring-${id}`

  return (
    <svg
      viewBox="0 0 112 112"
      className={className ?? 'h-full w-full'}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={ringId} x1="14" y1="20" x2="96" y2="92" gradientUnits="userSpaceOnUse">
          <stop stopColor={visual === 'fireflies' ? '#3ED9A0' : '#3DBFFF'} />
          <stop offset=".52" stopColor={visual === 'stardust' ? '#FFC94A' : '#6D5EFC'} />
          <stop offset="1" stopColor={visual === 'bubbles' ? '#FF7B93' : '#FFC94A'} />
        </linearGradient>
      </defs>
      <circle
        cx="56"
        cy="56"
        r="51"
        stroke={`url(#${ringId})`}
        strokeWidth={visual === 'rainbow' ? 2.5 : 2}
        strokeLinecap="round"
        strokeDasharray={visual === 'fireflies' ? '2 12' : undefined}
        opacity=".62"
      />
      {visual === 'stardust' && (
        <g fill="#FFC94A">
          <path d="M24 21l1.8 5.2L31 28l-5.2 1.8L24 35l-1.8-5.2L17 28l5.2-1.8L24 21z" />
          <path d="M92 56l1.4 4.1 4.1 1.4-4.1 1.4L92 67l-1.4-4.1-4.1-1.4 4.1-1.4L92 56z" />
          <circle cx="34" cy="96" r="2.2" />
        </g>
      )}
      {visual === 'fireflies' && (
        <g fill="#FFC94A">
          {[[24, 24], [88, 33], [92, 74], [38, 99]].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.4" />
          ))}
        </g>
      )}
      {visual === 'bubbles' && (
        <g stroke="#6D5EFC" strokeWidth="1.6" fill="white" fillOpacity=".3">
          <circle cx="21" cy="28" r="5" />
          <circle cx="94" cy="44" r="4" />
          <circle cx="79" cy="94" r="5.5" />
        </g>
      )}
    </svg>
  )
}
