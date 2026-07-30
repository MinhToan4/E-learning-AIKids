import type { CurriculumGameType } from '@/features/lesson/lib/curriculum-game'

type Props = { type: CurriculumGameType; className?: string; size?: number }

export function GameModeIcon({ type, className, size = 30 }: Props) {
  return (
    <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 48 48" fill="none">
      <g stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        {type === 'blockly' && <><path d="M7 10h14v9h8v-9h12v13h-8v8h8v10H26v-8h-9v8H7V27h9v-8H7V10Z" /><path d="m20 23 5 5 8-10" /></>}
        {type === 'math-kids' && <><circle cx="24" cy="24" r="18" /><path d="M15 18h10m-5-5v10M29 31h8M12 32l8-8m-8 0 8 8" /></>}
        {type === 'battle-math' && <><path d="m9 8 30 32M39 8 9 40M15 8l-7 7m25-7 7 7M17 38l-5 5m19-5 5 5" /><path d="M18 19h12M24 13v12" /></>}
        {type === 'edukiz' && <><path d="M24 42V21M24 27c-8 0-14-5-14-13 8 0 14 5 14 13Zm0-6c7 0 12-4 12-11-7 0-12 4-12 11Z" /><path d="M14 42h20M10 32c5 0 9 4 9 9M38 30c-5 0-9 4-9 11" /></>}
      </g>
    </svg>
  )
}
