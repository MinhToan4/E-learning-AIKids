import { describe, expect, it } from 'vitest'
import { buildCreativePrompt } from './creative-prompts.js'

describe('buildCreativePrompt', () => {
  it('keeps each workshop workflow distinct and server-framed', () => {
    expect(buildCreativePrompt('character', 'May', 'mot ban meo', { appearance: 'mu do' })).toContain('Character appearance: mu do')
    expect(buildCreativePrompt('art', 'Tranh', 'mot khu vuon', { styleId: 'paper-cut' })).toContain('paper-cut')
    const comic = buildCreativePrompt('comic', 'Chuyen di', 'tim hat giong', {
      panelCount: 6,
      panels: [{ action: 'Mo dau' }, { action: 'Ket thuc', dialogue: 'Vui mung' }],
    })
    expect(comic).toContain('6-panel')
    expect(comic).toContain('Panel 2: Ket thuc; mood or dialogue: Vui mung')
    expect(buildCreativePrompt('video', 'Canh mo dau', 'mot chiec thuyen', { motion: 'luot nhe' })).toContain('Motion: luot nhe')
  })
})
