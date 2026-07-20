import { describe, expect, it } from 'vitest'
import {
  ART_STYLES,
  assertArtStyleId,
  buildCharacterLabel,
  isArtStyleId,
  isCharacterShapeId,
  CreativeError,
} from './creative.js'

describe('creative catalogs (AIkid core)', () => {
  it('exposes full art style set including clay and comic', () => {
    expect(ART_STYLES.length).toBeGreaterThanOrEqual(12)
    expect(isArtStyleId('clay')).toBe(true)
    expect(isArtStyleId('comic')).toBe(true)
    expect(isArtStyleId('neon-plastic')).toBe(false)
  })

  it('assertArtStyleId throws CreativeError on bad id', () => {
    expect(() => assertArtStyleId('plastic-neon')).toThrow(CreativeError)
    expect(assertArtStyleId('watercolor')).toBe('watercolor')
  })

  it('buildCharacterLabel combines safe parts', () => {
    expect(
      buildCharacterLabel({
        name: 'Mèo Sao',
        shapeId: 'animal',
        vibeId: 'curious',
      }),
    ).toContain('Mèo Sao')
    expect(isCharacterShapeId('robot')).toBe(true)
  })
})
