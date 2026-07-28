import { describe, expect, it } from 'vitest'
import { moveRow, nextRowId } from './QuestionContentEditor'

describe('guided question authoring helpers', () => {
  it('creates a stable unused row id', () => {
    expect(nextRowId('option', ['option-1', 'option-2'])).toBe('option-3')
    expect(nextRowId('option', ['option-1', 'option-3'])).toBe('option-4')
  })

  it('moves an ordering row without mutating the original list', () => {
    const source = ['first', 'second', 'third']
    expect(moveRow(source, 1, -1)).toEqual(['second', 'first', 'third'])
    expect(moveRow(source, 2, 1)).toBe(source)
    expect(source).toEqual(['first', 'second', 'third'])
  })
})
