import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import {
  buildNarrativeLine,
  buildNarrativeScript,
  findVietnameseVoice,
  useAikiSituationNarrator,
} from './useAikiSituationNarrator'
import type { ParsedDialogue } from '@/features/teacher/lib/authoring'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

class MockSpeechSynthesisUtterance {
  text: string
  lang: string = ''
  rate: number = 1
  pitch: number = 1
  voice: SpeechSynthesisVoice | null = null
  onboundary: ((e: any) => void) | null = null
  onend: (() => void) | null = null
  onerror: (() => void) | null = null

  constructor(text: string = '') {
    this.text = text
  }
}

function testRenderHook<T>(hookFn: () => T) {
  const result = { current: null as unknown as T }
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  function TestComponent() {
    result.current = hookFn()
    return null
  }

  act(() => {
    root.render(React.createElement(TestComponent))
  })

  return {
    result,
    unmount: () => {
      act(() => {
        root.unmount()
      })
      container.remove()
    },
  }
}

describe('useAikiSituationNarrator', () => {
  const sampleDialogues: ParsedDialogue[] = [
    { id: 'd-1', speaker: 'zico', speakerName: 'Zico (áo cam)', text: 'Của tớ đẹp hơn!' },
    { id: 'd-2', speaker: 'sonet', speakerName: 'Sonet (áo xanh)', text: 'Không, của tớ đúng hơn!' },
    { id: 'd-3', speaker: 'aki', speakerName: 'Mèo AKI', text: 'DỪNG LẠIIII...! Các cậu ơi, hãy giúp tớ vụ này!' },
  ]

  describe('buildNarrativeLine', () => {
    it('creates expressive storytelling leads for Zico, Sonet, and AKI', () => {
      expect(buildNarrativeLine(sampleDialogues[0], 0)).toBe('Zico nói: Của tớ đẹp hơn!')
      expect(buildNarrativeLine(sampleDialogues[1], 1)).toBe('Sonet cãi: Không, của tớ đúng hơn!')
      expect(buildNarrativeLine(sampleDialogues[2], 2)).toBe('Mèo AKI hô to: DỪNG LẠIIII...! Các cậu ơi, hãy giúp tớ vụ này!')
    })

    it('cleans duplicate speaker prefix in text', () => {
      const dialogueWithPrefix: ParsedDialogue = {
        id: 'd-test',
        speaker: 'zico',
        speakerName: 'Zico',
        text: 'Zico: Mình vẽ đẹp nhất trần đời!',
      }
      expect(buildNarrativeLine(dialogueWithPrefix, 0)).toBe('Zico nói: Mình vẽ đẹp nhất trần đời!')
    })

    it('handles teacher speaker', () => {
      const teacherDialogue: ParsedDialogue = {
        id: 'd-teacher',
        speaker: 'teacher',
        speakerName: 'Cô giáo Thảo',
        text: 'Cả hai con đều rất chăm chỉ.',
      }
      expect(buildNarrativeLine(teacherDialogue, 0)).toBe('Cô giáo nhắc: Cả hai con đều rất chăm chỉ.')
    })
  })

  describe('buildNarrativeScript', () => {
    it('builds a cohesive story with character offsets', () => {
      const script = buildNarrativeScript(sampleDialogues)
      expect(script.fullStory).toContain('Zico nói: Của tớ đẹp hơn!')
      expect(script.fullStory).toContain('Sonet cãi: Không, của tớ đúng hơn!')
      expect(script.fullStory).toContain('Mèo AKI hô to: DỪNG LẠIIII...!')
      expect(script.lines).toHaveLength(3)
      expect(script.lines[0].start).toBe(0)
      expect(script.lines[0].end).toBeGreaterThan(0)
      expect(script.lines[1].start).toBeGreaterThan(script.lines[0].end)
    })

    it('uses fallback text when dialogues are empty', () => {
      const script = buildNarrativeScript([], 'Tình huống khởi động nhé!')
      expect(script.fullStory).toBe('Tình huống khởi động nhé!')
      expect(script.lines).toHaveLength(1)
      expect(script.lines[0].speaker).toBe('aki')
    })
  })

  describe('findVietnameseVoice', () => {
    it('filters for Vietnamese voices by lang or keyword', () => {
      const mockSynth = {
        getVoices: () => [
          { name: 'Alex', lang: 'en-US' } as SpeechSynthesisVoice,
          { name: 'Linh (Vietnamese)', lang: 'vi-VN' } as SpeechSynthesisVoice,
        ],
      } as unknown as SpeechSynthesis

      const voice = findVietnameseVoice(mockSynth)
      expect(voice).toBeDefined()
      expect(voice?.lang).toBe('vi-VN')
      expect(voice?.name).toContain('Linh')
    })

    it('returns null when no matching voice is found', () => {
      const mockSynth = {
        getVoices: () => [{ name: 'Samantha', lang: 'en-US' } as SpeechSynthesisVoice],
      } as unknown as SpeechSynthesis

      expect(findVietnameseVoice(mockSynth)).toBeNull()
    })
  })

  describe('useAikiSituationNarrator Hook State and Lifecycle', () => {
    let originalSpeechSynthesis: typeof window.speechSynthesis
    let originalUtterance: any
    let mockSpeak: any
    let mockCancel: any
    let mockResume: any

    beforeEach(() => {
      originalSpeechSynthesis = window.speechSynthesis
      originalUtterance = (globalThis as any).SpeechSynthesisUtterance
      ;(globalThis as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance

      mockSpeak = vi.fn()
      mockCancel = vi.fn()
      mockResume = vi.fn()

      // Mock window.speechSynthesis
      Object.defineProperty(window, 'speechSynthesis', {
        value: {
          speak: mockSpeak,
          cancel: mockCancel,
          resume: mockResume,
          pause: vi.fn(),
          paused: false,
          speaking: true,
          getVoices: () => [{ name: 'Mai', lang: 'vi-VN' }],
        },
        writable: true,
        configurable: true,
      })
    })

    afterEach(() => {
      Object.defineProperty(window, 'speechSynthesis', {
        value: originalSpeechSynthesis,
        writable: true,
        configurable: true,
      })
      ;(globalThis as any).SpeechSynthesisUtterance = originalUtterance
      vi.restoreAllMocks()
    })

    it('starts with initial idle state', () => {
      const { result, unmount } = testRenderHook(() => useAikiSituationNarrator())
      expect(result.current.isPlaying).toBe(false)
      expect(result.current.activeSpeaker).toBe('')
      expect(result.current.speakingLineIndex).toBe(-1)
      unmount()
    })

    it('activates playback, sets speaker to first character, and invokes Web Speech directly', () => {
      const { result, unmount } = testRenderHook(() => useAikiSituationNarrator())

      act(() => {
        result.current.playSituation(sampleDialogues)
      })

      expect(result.current.isPlaying).toBe(true)
      expect(result.current.speakingLineIndex).toBe(0)
      expect(result.current.activeSpeaker).toBe('zico')
      expect(mockCancel).toHaveBeenCalled()
      expect(mockSpeak).toHaveBeenCalledTimes(1)

      const utterance = mockSpeak.mock.calls[0][0] as MockSpeechSynthesisUtterance
      expect(utterance.lang).toBe('vi-VN')
      expect(utterance.text).toContain('Zico nói:')
      unmount()
    })

    it('stops playback and resets state upon stop() call', () => {
      const { result, unmount } = testRenderHook(() => useAikiSituationNarrator())

      act(() => {
        result.current.playSituation(sampleDialogues)
      })
      expect(result.current.isPlaying).toBe(true)

      act(() => {
        result.current.stop()
      })

      expect(result.current.isPlaying).toBe(false)
      expect(result.current.speakingLineIndex).toBe(-1)
      expect(result.current.activeSpeaker).toBe('')
      expect(mockCancel).toHaveBeenCalled()
      unmount()
    })
  })
})
