import { describe, expect, it } from 'vitest'
import { EMPTY_PROMPT_LAB, promptLabError, strongPrompt } from './PromptLab'

describe('PromptLab', () => {
  it('requires all three prompt levels and the four-part strong prompt', () => {
    expect(promptLabError(EMPTY_PROMPT_LAB)).toBeTruthy()
    const complete = {
      weak: 'Vẽ mèo',
      medium: 'Vẽ một chú mèo cam đang chơi.',
      role: 'Hãy đóng vai họa sĩ',
      task: 'Vẽ mèo cam chơi bóng',
      context: 'Trong vườn đầy hoa',
      format: 'Tranh màu nước khung vuông',
      explanation: 'Prompt này rõ đối tượng, bối cảnh và kết quả cần nhận.',
    }
    expect(promptLabError(complete)).toBeNull()
    expect(strongPrompt(complete)).toContain('Trong vườn đầy hoa')
  })
})
