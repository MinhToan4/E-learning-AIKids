import { describe, expect, it } from 'vitest'
import { storyToPanelHints } from './story.js'

describe('storyToPanelHints', () => {
  it('maps 3 beats to 4 panels', () => {
    const panels = storyToPanelHints({
      title: 'Cầu vồng',
      opening: 'Sáng trên kẹo',
      problem: 'Máy hỏng',
      ending: 'Sửa xong',
    })
    expect(panels).toHaveLength(4)
    expect(panels[0].beat).toBe('Sáng trên kẹo')
    expect(panels[1].beat).toBe('Máy hỏng')
    expect(panels[2].beat).toContain('Máy hỏng')
    expect(panels[3].beat).toBe('Sửa xong')
  })
})
