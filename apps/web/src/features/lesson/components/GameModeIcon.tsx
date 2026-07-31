import type { CurriculumGameType } from '@/features/lesson/lib/curriculum-game'

type Props = { type: CurriculumGameType; className?: string; size?: number }

// WHY: Mỗi game type có icon riêng để học sinh nhận diện nhanh trong lobby.
// SVG paths được thiết kế 48x48 viewBox, stroke-based để scale đẹp ở mọi kích thước.
export function GameModeIcon({ type, className, size = 30 }: Props) {
  return (
    <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 48 48" fill="none">
      <g stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        {/* DataRunner: runner leaping over obstacles on a track */}
        {type === 'data-runner' && (
          <>
            <path d="M7 34h11l5-9 6 8h12" />
            <path d="M10 18h10v10H10zM29 9h10v10H29z" />
            <path d="m15 23 4-4m15-5 4-4" />
          </>
        )}
        {/* TruthPatrol: shield with scan beam */}
        {type === 'truth-patrol' && (
          <>
            <path d="m24 7 8 13-3 17-5 4-5-4-3-17 8-13Z" />
            <path d="m16 22-8 7 10 2m14-9 8 7-10 2" />
            <circle cx="24" cy="22" r="4" />
          </>
        )}
        {/* BattleMath: swords crossed over a shield — verification battle */}
        {type === 'battle-math' && (
          <>
            <path d="M10 10 L22 22 M14 10 L10 14" />
            <path d="M38 10 L26 22 M34 10 L38 14" />
            <path d="M22 22 L20 38 L24 34 L28 38 L26 22" />
            <path d="M18 28 L30 28" />
            <circle cx="24" cy="18" r="5" fill="none" />
          </>
        )}
        {/* BlocklyMaze: grid with arrow path — programming blocks */}
        {type === 'blockly' && (
          <>
            <rect x="8" y="8" width="32" height="32" rx="4" />
            <line x1="8" y1="19" x2="40" y2="19" />
            <line x1="8" y1="30" x2="40" y2="30" />
            <line x1="19" y1="8" x2="19" y2="40" />
            <line x1="30" y1="8" x2="30" y2="40" />
            {/* Arrow path on grid */}
            <path d="M13 35 L13 24 L24 24 L24 13" strokeWidth="3.8" />
            <path d="M20 9 L24 13 L28 9" />
          </>
        )}
        {/* Edukiz: two matching cards with sparkle — memory match */}
        {type === 'edukiz' && (
          <>
            <rect x="6" y="12" width="16" height="22" rx="4" />
            <rect x="26" y="12" width="16" height="22" rx="4" />
            {/* Sparkle between cards */}
            <path d="M24 18 L24 14 M24 26 L24 30 M20 22 L16 22 M28 22 L32 22" strokeWidth="2.5" />
            <circle cx="24" cy="22" r="3" />
          </>
        )}
        {/* MathKids: planet with orbit ring + number operator */}
        {type === 'math-kids' && (
          <>
            <circle cx="24" cy="24" r="10" />
            {/* Saturn ring */}
            <ellipse cx="24" cy="24" rx="18" ry="6" />
            {/* Plus sign on planet */}
            <path d="M24 19 L24 29 M19 24 L29 24" strokeWidth="2.8" />
            {/* Stars */}
            <circle cx="8" cy="10" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="40" cy="12" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="12" cy="38" r="1.5" fill="currentColor" stroke="none" />
          </>
        )}
      </g>
    </svg>
  )
}
