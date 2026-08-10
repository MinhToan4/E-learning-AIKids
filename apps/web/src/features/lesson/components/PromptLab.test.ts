import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { EMPTY_PROMPT_LAB, promptLabError, strongPrompt } from './PromptLab'
import { PromptLab } from './PromptLab'

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

  it('renders four accessible assembly stations without free-form strong-prompt textareas', () => {
    const markup = renderToStaticMarkup(
      createElement(PromptLab, {
        value: EMPTY_PROMPT_LAB,
        onChange: () => undefined,
      }),
    )
    expect(markup).toContain('Lắp prompt tốt · đủ 4 mảnh')
    expect(markup).toContain('0/4 mảnh')
    expect(markup).toContain('aria-pressed="false"')
    expect((markup.match(/<textarea/g) ?? [])).toHaveLength(1)
  })

  it('renders live blur preview image with dynamic blur levels based on completed parts', () => {
    const emptyMarkup = renderToStaticMarkup(
      createElement(PromptLab, {
        value: EMPTY_PROMPT_LAB,
        onChange: () => undefined,
      }),
    )
    expect(emptyMarkup).toContain('alt="Live preview"')
    expect(emptyMarkup).toContain('blur-2xl grayscale')

    const partialMarkup = renderToStaticMarkup(
      createElement(PromptLab, {
        value: {
          ...EMPTY_PROMPT_LAB,
          role: 'Hãy đóng vai họa sĩ',
          task: 'Vẽ mèo cam',
        },
        onChange: () => undefined,
      }),
    )
    expect(partialMarkup).toContain('2/4 mảnh')
    expect(partialMarkup).toContain('blur-md grayscale-[25%]')

    const fullMarkup = renderToStaticMarkup(
      createElement(PromptLab, {
        value: {
          ...EMPTY_PROMPT_LAB,
          role: 'Hãy đóng vai họa sĩ',
          task: 'Vẽ mèo cam',
          context: 'Trong vườn',
          format: 'Tranh màu nước',
        },
        onChange: () => undefined,
      }),
    )
    expect(fullMarkup).toContain('blur-none grayscale-0')
    expect(fullMarkup).toContain('animate-in zoom-in-95')
  })
})

