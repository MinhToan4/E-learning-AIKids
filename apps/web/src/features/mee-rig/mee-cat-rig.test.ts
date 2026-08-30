import { describe, it, expect } from 'vitest'
import manifest from '../../../public/assets/mee/mee-cat-rig-v1-manifest.json'
import { getDominantViseme } from './hooks/useMeeCatSpeech'

describe('AIKI Cat Rig System', () => {
  it('should have valid artboard dimensions and baseline in manifest', () => {
    expect(manifest.artboard.width).toBe(1420)
    expect(manifest.artboard.height).toBe(1935)
    expect(manifest.artboard.baseline).toBe(1691)
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

    expect(manifest.pivots.head).toEqual([555, 450])
    expect(manifest.pivots.leftEar).toEqual([280, 328])
    expect(manifest.pivots.rightEar).toEqual([842, 328])
  })

  it('should declare all animation timeline durations', () => {
    expect(manifest.timelines).toHaveProperty('idle')
    expect(manifest.timelines).toHaveProperty('hint')
    expect(manifest.timelines).toHaveProperty('celebrate')
    expect(manifest.timelines).toHaveProperty('eat')
    expect(manifest.timelines).toHaveProperty('sleepy')
    expect(manifest.timelines).toHaveProperty('talk')
  })

  describe('Lip-sync & Cute Chibi Viseme Engine', () => {
    it('maps Vietnamese and English words into natural cute dominant visemes', () => {
      expect(getDominantViseme('Chào')).toBe('open')
      expect(getDominantViseme('bạn')).toBe('open')
      expect(getDominantViseme('Mèo')).toBe('smile')
      expect(getDominantViseme('Mee')).toBe('smile')
      expect(getDominantViseme('nhỏ')).toBe('round')
      expect(getDominantViseme('Toán')).toBe('open')
      expect(getDominantViseme('Vui')).toBe('round')
      expect(getDominantViseme('Đi')).toBe('smile')
      expect(getDominantViseme('')).toBe('closed')
    })
  })
})
