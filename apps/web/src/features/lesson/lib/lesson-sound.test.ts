import { beforeEach, describe, expect, it, vi } from 'vitest'
import { closeAudioContext, getAudioContext, playInstantSound } from './lesson-sound'

describe('lesson-sound Web Audio helper', () => {
  let mockOscillator: any
  let mockGain: any
  let mockContext: any

  beforeEach(() => {
    closeAudioContext()
    vi.restoreAllMocks()

    mockOscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }

    mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    }

    mockContext = {
      state: 'running',
      currentTime: 0,
      destination: {},
      createOscillator: vi.fn().mockReturnValue(mockOscillator),
      createGain: vi.fn().mockReturnValue(mockGain),
      resume: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    }

    vi.stubGlobal('AudioContext', vi.fn().mockImplementation(() => mockContext))
  })

  it('initializes and returns AudioContext', () => {
    const ctx = getAudioContext()
    expect(ctx).toBeDefined()
  })

  it('resumes AudioContext if suspended', () => {
    mockContext.state = 'suspended'
    getAudioContext()
    expect(mockContext.resume).toHaveBeenCalled()
  })

  it('plays correct sound effect', () => {
    playInstantSound('correct')
    expect(mockContext.createOscillator).toHaveBeenCalled()
    expect(mockOscillator.type).toBe('sine')
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(523.25, 0)
    expect(mockOscillator.start).toHaveBeenCalled()
    expect(mockOscillator.stop).toHaveBeenCalled()
  })

  it('plays wrong sound effect', () => {
    playInstantSound('wrong')
    expect(mockContext.createOscillator).toHaveBeenCalled()
    expect(mockOscillator.type).toBe('triangle')
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(320, 0)
  })

  it('plays star sound effect', () => {
    playInstantSound('star')
    expect(mockContext.createOscillator).toHaveBeenCalled()
    expect(mockOscillator.type).toBe('sine')
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(659.25, 0)
  })

  it('plays click sound effect', () => {
    playInstantSound('click')
    expect(mockContext.createOscillator).toHaveBeenCalled()
    expect(mockOscillator.type).toBe('sine')
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(440, 0)
  })

  it('closes AudioContext on cleanup', () => {
    getAudioContext()
    closeAudioContext()
    expect(mockContext.close).toHaveBeenCalled()
  })

  it('handles environment without AudioContext gracefully without throwing', () => {
    vi.stubGlobal('AudioContext', undefined)
    expect(() => playInstantSound('click')).not.toThrow()
  })
})
