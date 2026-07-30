import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { BattleMathGame } from './BattleMathGame'
import { BlocklyMazeGame } from './BlocklyMazeGame'
import { EdukizGame } from './EdukizGame'
import { MathKidsGame } from './MathKidsGame'
import type { EngineGameProps } from './types'

const baseProps: EngineGameProps = {
  difficulty: 'gentle',
  instruction: '',
  onComplete: vi.fn(),
}

describe('AI-first game engines', () => {
  it.each([
    [BlocklyMazeGame, 'Đội Cứu Hộ Dữ Liệu'],
    [MathKidsGame, 'Khỉ Leo Cây Dữ Liệu'],
    [BattleMathGame, 'Pháo Đài Kiểm Chứng'],
    [EdukizGame, 'Xưởng Huấn Luyện AI'],
  ] as const)('server-renders %s without runtime-only failures', (Engine, heading) => {
    const html = renderToStaticMarkup(<Engine {...baseProps} />)
    expect(html).toContain(heading)
    expect(html).toContain('/assets/game-engines/ai-worlds.jpg')
    expect(html).not.toContain('dangerouslySetInnerHTML')
  })

  it('renders four bounded visual choices for the AI verification round', () => {
    const html = renderToStaticMarkup(<BattleMathGame {...baseProps} />)
    expect(html.match(/Ảnh [1-4]/g)).toHaveLength(8)
    expect(html).toContain('/assets/game-engines/ai-picture-check.jpg')
    expect(html).toContain('Prompt:')
  })
})
