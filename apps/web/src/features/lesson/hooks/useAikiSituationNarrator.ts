import { useCallback, useEffect, useRef, useState } from 'react'
import type { ParsedDialogue } from '@/features/teacher/lib/authoring'

export interface NarrativeLine {
  index: number
  speaker: string
  speakerName?: string
  text: string
  narrativeText: string
  start: number
  end: number
  estimatedDurationMs: number
}

export interface NarrativeScript {
  fullStory: string
  lines: NarrativeLine[]
}

export function cleanDialogueText(text: string): string {
  return text.replace(/^[A-Za-z0-9_\u00C0-\u024F\u1EA0-\u1EF9\s]+[:：]\s*/, '').trim()
}

export function buildNarrativeLine(d: ParsedDialogue, _index: number): string {
  const name = (d.speakerName || '').trim()
  const lowerName = name.toLowerCase()
  const speaker = (d.speaker || '').toLowerCase()
  const text = cleanDialogueText(d.text)

  if (speaker === 'zico' || lowerName.includes('zico') || lowerName.includes('cam')) {
    return `Zico nói: ${text}`
  }
  if (speaker === 'sonet' || lowerName.includes('sonet') || lowerName.includes('xanh')) {
    return `Sonet cãi: ${text}`
  }
  if (speaker === 'aki' || lowerName.includes('aki') || lowerName.includes('mèo')) {
    return `Mèo AIKI hô to: ${text}`
  }
  if (speaker === 'teacher' || lowerName.includes('cô') || lowerName.includes('giáo')) {
    return `Cô giáo nhắc: ${text}`
  }
  if (name) {
    return `${name} nói: ${text}`
  }
  return text
}

export function buildNarrativeScript(
  dialogues: ParsedDialogue[],
  fallbackText?: string
): NarrativeScript {
  if (!dialogues || dialogues.length === 0) {
    const defaultText = (fallbackText || 'Các cậu ơi, cùng lắng nghe tình huống này nhé!').trim()
    return {
      fullStory: defaultText,
      lines: [
        {
          index: 0,
          speaker: 'aki',
          speakerName: 'Mèo AIKI',
          text: defaultText,
          narrativeText: defaultText,
          start: 0,
          end: defaultText.length,
          estimatedDurationMs: Math.max(2000, defaultText.split(/\s+/).filter(Boolean).length * 320),
        },
      ],
    }
  }

  let currentOffset = 0
  const lines: NarrativeLine[] = []
  const separator = '. '

  dialogues.forEach((d, index) => {
    const narrativeText = buildNarrativeLine(d, index)
    const start = currentOffset
    const end = currentOffset + narrativeText.length
    const wordCount = narrativeText.split(/\s+/).filter(Boolean).length
    const estimatedDurationMs = Math.max(1800, wordCount * 300 + 600)

    lines.push({
      index,
      speaker: d.speaker,
      speakerName: d.speakerName,
      text: d.text,
      narrativeText,
      start,
      end,
      estimatedDurationMs,
    })

    currentOffset = end + separator.length
  })

  const fullStory = lines.map((l) => l.narrativeText).join(separator)

  return {
    fullStory,
    lines,
  }
}

export function findVietnameseVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  try {
    const voices = synth.getVoices?.() || []
    if (!voices || voices.length === 0) return null
    return (
      voices.find((v) => {
        const l = (v.lang || '').toLowerCase()
        const n = (v.name || '').toLowerCase()
        return (
          l.startsWith('vi') ||
          l.includes('vn') ||
          n.includes('vietnam') ||
          n.includes('vietnamese') ||
          /\blinh\b/i.test(n) ||
          /\ban\b/i.test(n)
        )
      }) || null
    )
  } catch {
    return null
  }
}

export interface UseAikiSituationNarratorReturn {
  isPlaying: boolean
  activeSpeaker: string
  speakingLineIndex: number
  playSituation: (dialogues: ParsedDialogue[], fallbackText?: string) => void
  stop: () => void
}

export function useAikiSituationNarrator(): UseAikiSituationNarratorReturn {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeSpeaker, setActiveSpeaker] = useState<string>('')
  const [speakingLineIndex, setSpeakingLineIndex] = useState<number>(-1)

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const cadenceTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const chromeKeepAliveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const boundaryFiredRef = useRef<boolean>(false)

  const clearAllTimers = useCallback(() => {
    cadenceTimersRef.current.forEach((timer) => clearTimeout(timer))
    cadenceTimersRef.current = []
    if (chromeKeepAliveTimerRef.current) {
      clearInterval(chromeKeepAliveTimerRef.current)
      chromeKeepAliveTimerRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    clearAllTimers()
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel()
      } catch {}
      utteranceRef.current = null
    }
    setIsPlaying(false)
    setActiveSpeaker('')
    setSpeakingLineIndex(-1)
    boundaryFiredRef.current = false
  }, [clearAllTimers])

  const playSituation = useCallback(
    (dialogues: ParsedDialogue[], fallbackText?: string) => {
      // 1. Dọn dẹp trạng thái cũ
      clearAllTimers()
      boundaryFiredRef.current = false

      const script = buildNarrativeScript(dialogues, fallbackText)
      if (!script.fullStory) return

      // 2. Kích hoạt state ban đầu ngay lập tức
      setIsPlaying(true)
      setSpeakingLineIndex(0)
      setActiveSpeaker(script.lines[0]?.speaker || 'aki')

      // 3. Xử lý Web Speech API trực tiếp trong event handler
      const hasSpeechSynth =
        typeof window !== 'undefined' &&
        'speechSynthesis' in window &&
        typeof window.speechSynthesis?.speak === 'function' &&
        typeof SpeechSynthesisUtterance !== 'undefined'

      if (hasSpeechSynth) {
        try {
          // Xử lý Chromium TTS bug: Resume trước và sau khi speak
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume()
          }
          window.speechSynthesis.cancel()

          const utterance = new SpeechSynthesisUtterance(script.fullStory)
          utteranceRef.current = utterance
          utterance.lang = 'vi-VN'
          utterance.rate = 0.95
          utterance.pitch = 1.05

          const viVoice = findVietnameseVoice(window.speechSynthesis)
          if (viVoice) {
            utterance.voice = viVoice
          }

          // Bắt event 'boundary' để chuyển đổi speaker và line index theo vị trí ký tự
          utterance.onboundary = (e) => {
            if (e.name === 'word' || e.name === 'sentence') {
              boundaryFiredRef.current = true
              const charIndex = e.charIndex
              const foundLine = script.lines.find(
                (line) => charIndex >= line.start && charIndex <= line.end
              )
              if (foundLine) {
                setSpeakingLineIndex(foundLine.index)
                setActiveSpeaker(foundLine.speaker)
              }
            }
          }

          utterance.onend = () => {
            stop()
          }

          utterance.onerror = () => {
            stop()
          }

          // KÍCH HOẠT TRỰC TIẾP để giữ User Gesture Token
          window.speechSynthesis.speak(utterance)

          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume()
          }

          // Chromium Bug: ngắt sau 15 giây nếu không ping resume
          chromeKeepAliveTimerRef.current = setInterval(() => {
            if (typeof window !== 'undefined' && window.speechSynthesis?.speaking && !window.speechSynthesis?.paused) {
              window.speechSynthesis.pause()
              window.speechSynthesis.resume()
            }
          }, 10000)

          // Fallback Cadence Engine: chuyển đổi câu tự động nếu browser không phát event boundary
          let cumulativeMs = 0
          script.lines.forEach((line, idx) => {
            if (idx > 0) {
              cumulativeMs += script.lines[idx - 1].estimatedDurationMs
              const timer = setTimeout(() => {
                // Chỉ nhả nhịp nếu boundary của browser chưa kịp cập nhật câu này
                setSpeakingLineIndex((current) => {
                  if (current < idx) {
                    setActiveSpeaker(line.speaker)
                    return idx
                  }
                  return current
                })
              }, cumulativeMs)
              cadenceTimersRef.current.push(timer)
            }
          })
        } catch (err) {
          console.warn('[useAikiSituationNarrator] Web Speech API error, falling back to timer simulation:', err)
          // Fallback timer simulation nếu có lỗi Web Speech
          simulateCadencePlay(script.lines)
        }
      } else {
        // Môi trường không có Web Speech (SSR / Vitest / headless browser)
        simulateCadencePlay(script.lines)
      }

      function simulateCadencePlay(lines: NarrativeLine[]) {
        let cumulativeMs = 0
        lines.forEach((line, idx) => {
          if (idx > 0) {
            cumulativeMs += lines[idx - 1].estimatedDurationMs
            const timer = setTimeout(() => {
              setSpeakingLineIndex(idx)
              setActiveSpeaker(line.speaker)
            }, cumulativeMs)
            cadenceTimersRef.current.push(timer)
          }
        })
        const totalDuration = cumulativeMs + (lines[lines.length - 1]?.estimatedDurationMs || 2000)
        const endTimer = setTimeout(() => {
          stop()
        }, totalDuration)
        cadenceTimersRef.current.push(endTimer)
      }
    },
    [clearAllTimers, stop]
  )

  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  return {
    isPlaying,
    activeSpeaker,
    speakingLineIndex,
    playSituation,
    stop,
  }
}
