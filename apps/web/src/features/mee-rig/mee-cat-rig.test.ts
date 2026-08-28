import { describe, it, expect } from 'vitest'
import manifest from '../../../public/assets/mee/mee-cat-rig-v1-manifest.json'
import { getVisemeFromWord } from './hooks/useMeeCatSpeech'

describe('Mee Cat Rig System', () => {
  it('should have valid artboard dimensions and baseline in manifest', () => {
    expect(manifest.artboard.width).toBe(834)
    expect(manifest.artboard.height).toBe(711)
    expect(manifest.artboard.baseline).toBe(650)
  })

  it('should declare the correct state machine name and inputs', () => {
    expect(manifest.stateMachine).toBe('MeeCatController')
    const inputNames = manifest.inputs.map((i) => i.name)
    expect(inputNames).toContain('state')
    expect(inputNames).toContain('blink')
    expect(inputNames).toContain('lookX')
    expect(inputNames).toContain('lookY')
    expect(inputNames).toContain('earWiggle')
  })

  it('should declare all required pivot points for hierarchical bones', () => {
    expect(manifest.pivots).toHaveProperty('root')
    expect(manifest.pivots).toHaveProperty('head')
    expect(manifest.pivots).toHaveProperty('leftEar')
    expect(manifest.pivots).toHaveProperty('rightEar')
    expect(manifest.pivots).toHaveProperty('leftPaw')
    expect(manifest.pivots).toHaveProperty('rightPaw')

    expect(manifest.pivots.head).toEqual([417, 355])
    expect(manifest.pivots.leftEar).toEqual([172, 152])
    expect(manifest.pivots.rightEar).toEqual([660, 152])
  })

  it('should declare all animation timeline durations', () => {
    expect(manifest.timelines).toHaveProperty('idle')
    expect(manifest.timelines).toHaveProperty('hint')
    expect(manifest.timelines).toHaveProperty('celebrate')
    expect(manifest.timelines).toHaveProperty('eat')
    expect(manifest.timelines).toHaveProperty('sleepy')
  })

  describe('Lip-sync & Viseme Mapping Engine', () => {
    it('maps Vietnamese and English vowels correctly to visemes', () => {
      expect(getVisemeFromWord('Chào')).toBe('wide')
      expect(getVisemeFromWord('bạn')).toBe('closed')
      expect(getVisemeFromWord('nhỏ')).toBe('round')
      expect(getVisemeFromWord('Mèo')).toBe('closed')
      expect(getVisemeFromWord('Mee')).toBe('closed')
      expect(getVisemeFromWord('Em')).toBe('smile')
      expect(getVisemeFromWord('Uống')).toBe('round')
      expect(getVisemeFromWord('Ăn')).toBe('wide')
      expect(getVisemeFromWord('Đi')).toBe('smile')
    })
  })
})
