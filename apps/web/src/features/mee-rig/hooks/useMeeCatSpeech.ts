import { useState, useEffect, useRef } from 'react'

export type Viseme = 'closed' | 'open_mid' | 'aa' | 'oh' | 'oo' | 'ee' | 'fv' | 'th' | 'ch'
export type Gesture = 'auto' | 'explain' | 'point-left' | 'point-right' | 'enthusiastic' | 'idle'

export interface UseMeeCatSpeechOptions {
  text?: string
  isSpeaking?: boolean
  gesture?: Gesture
  onSpeechEnd?: () => void
}

export interface VisemeRatio {
  viseme: Viseme
  ratio: number
}

/**
 * Thuật toán phân rã 3 pha âm tiết Tiếng Việt / Anh ra 9 khẩu hình hoạt hình (Preston Blair Matrix):
 * - Phase 1: Phụ âm đầu (Attack: ch, tr, th, ph, v, m, b, p, l, n...)
 * - Phase 2: Nguyên âm chính (Peak / Vowel: aa, oh, oo, ee, open_mid...)
 * - Phase 3: Phụ âm đuôi / Đóng âm (Release: m, p, n, t, ng, ch, i, u...)
 */
export function decomposeWordToVisemes(word: string): VisemeRatio[] {
  const clean = word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (!clean) return [{ viseme: 'closed', ratio: 1 }]

  // Common high-frequency words special mapping
  if (clean === 'chao') return [{ viseme: 'ch', ratio: 0.2 }, { viseme: 'aa', ratio: 0.55 }, { viseme: 'oh', ratio: 0.25 }]
  if (clean === 'meo') return [{ viseme: 'closed', ratio: 0.25 }, { viseme: 'ee', ratio: 0.5 }, { viseme: 'oh', ratio: 0.25 }]
  if (clean === 'mee') return [{ viseme: 'closed', ratio: 0.25 }, { viseme: 'ee', ratio: 0.75 }]
  if (clean === 'ban') return [{ viseme: 'closed', ratio: 0.25 }, { viseme: 'aa', ratio: 0.5 }, { viseme: 'closed', ratio: 0.25 }]
  if (clean === 'nho') return [{ viseme: 'ch', ratio: 0.25 }, { viseme: 'oh', ratio: 0.75 }]
  if (clean === 'toan') return [{ viseme: 'th', ratio: 0.2 }, { viseme: 'oo', ratio: 0.25 }, { viseme: 'aa', ratio: 0.4 }, { viseme: 'closed', ratio: 0.15 }]
  if (clean === 'vui') return [{ viseme: 'fv', ratio: 0.25 }, { viseme: 'oo', ratio: 0.45 }, { viseme: 'ee', ratio: 0.3 }]

  let currentWord = clean
  let startViseme: Viseme | null = null
  let startRatio = 0.25

  // Phase 1: Phụ âm đầu
  if (currentWord.match(/^(ch|tr|gi|nh)/)) {
    startViseme = 'ch'
    currentWord = currentWord.replace(/^(ch|tr|gi|nh)/, '')
  } else if (currentWord.startsWith('th')) {
    startViseme = 'th'
    startRatio = 0.2
    currentWord = currentWord.substring(2)
  } else if (currentWord.match(/^(ph|v|f)/)) {
    startViseme = 'fv'
    currentWord = currentWord.replace(/^(ph|v|f)/, '')
  } else if (currentWord.match(/^(m|b|p)/)) {
    startViseme = 'closed'
    currentWord = currentWord.replace(/^(m|b|p)/, '')
  } else if (currentWord.match(/^[lndtcgkqsrx]/)) {
    startViseme = 'th'
    startRatio = 0.2
    currentWord = currentWord.substring(1)
  }

  // Phase 3: Phụ âm đuôi
  let endViseme: Viseme | null = null
  let endRatio = 0.25

  if (currentWord.match(/(nh|ch)$/)) {
    endViseme = 'ch'
    endRatio = 0.15
    currentWord = currentWord.replace(/(nh|ch)$/, '')
  } else if (currentWord.match(/(ng|c)$/)) {
    endViseme = 'open_mid'
    endRatio = 0.15
    currentWord = currentWord.replace(/(ng|c)$/, '')
  } else if (currentWord.match(/(m|p)$/)) {
    endViseme = 'closed'
    endRatio = 0.15
    currentWord = currentWord.replace(/(m|p)$/, '')
  } else if (currentWord.match(/(n|t)$/)) {
    endViseme = 'th'
    endRatio = 0.15
    currentWord = currentWord.replace(/(n|t)$/, '')
  } else if (currentWord.endsWith('o') || currentWord.endsWith('u')) {
    endViseme = 'oh'
    endRatio = 0.25
    currentWord = currentWord.substring(0, currentWord.length - 1)
  } else if (currentWord.endsWith('i') || currentWord.endsWith('y')) {
    endViseme = 'ee'
    endRatio = 0.25
    currentWord = currentWord.substring(0, currentWord.length - 1)
  }

  // Phase 2: Nguyên âm chính
  let midVisemes: VisemeRatio[] = []
  for (const char of currentWord) {
    if ('a'.includes(char)) midVisemes.push({ viseme: 'aa', ratio: 1 })
    else if ('ou'.includes(char)) midVisemes.push({ viseme: 'oo', ratio: 1 })
    else if ('eiy'.includes(char)) midVisemes.push({ viseme: 'ee', ratio: 1 })
  }

  if (midVisemes.length === 0) {
    midVisemes.push({ viseme: 'open_mid', ratio: 1 })
  }

  let remainingRatio = 1.0
  if (startViseme) remainingRatio -= startRatio
  if (endViseme) remainingRatio -= endRatio
  if (remainingRatio < 0.1) remainingRatio = 0.1

  const midRatioPerItem = remainingRatio / midVisemes.length
  midVisemes = midVisemes.map((v) => ({ viseme: v.viseme, ratio: midRatioPerItem }))

  const result: VisemeRatio[] = []
  if (startViseme) result.push({ viseme: startViseme, ratio: startRatio })
  result.push(...midVisemes)
  if (endViseme) result.push({ viseme: endViseme, ratio: endRatio })

  return result
}

export function useMeeCatSpeech({
  text = '',
  isSpeaking = false,
  gesture = 'auto',
  onSpeechEnd,
}: UseMeeCatSpeechOptions) {
  const [viseme, setViseme] = useState<Viseme>('closed')
  const [activeGesture, setActiveGesture] = useState<Gesture>(gesture)
  const [currentWord, setCurrentWord] = useState<string>('')

  const wordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const gestureTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const visemeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (gesture !== 'auto') {
      setActiveGesture(gesture)
    }
  }, [gesture])

  // Chạy chuỗi vi khẩu hình (Micro-visemes) mượt mà cho 1 từ
  const playWordVisemes = (word: string, durationMs: number = 280) => {
    if (visemeTimerRef.current) clearTimeout(visemeTimerRef.current)
    const sequence = decomposeWordToVisemes(word)
    let currentIdx = 0

    const playNext = () => {
      if (currentIdx >= sequence.length) return
      const step = sequence[currentIdx]
      setViseme(step.viseme)
      const stepMs = Math.max(35, step.ratio * durationMs)

      currentIdx++
      if (currentIdx < sequence.length) {
        visemeTimerRef.current = setTimeout(playNext, stepMs)
      } else {
        visemeTimerRef.current = setTimeout(() => setViseme('closed'), stepMs)
      }
    }

    playNext()
  }

  useEffect(() => {
    if (!isSpeaking || !text.trim()) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      if (wordTimerRef.current) clearInterval(wordTimerRef.current)
      if (gestureTimerRef.current) clearInterval(gestureTimerRef.current)
      if (visemeTimerRef.current) clearTimeout(visemeTimerRef.current)
      setViseme('closed')
      setCurrentWord('')
      return
    }

    const words = text.trim().split(/\s+/)
    let wordIdx = 0

    if (gesture === 'auto') {
      const gesturePool: Gesture[] = ['explain', 'point-left', 'explain', 'point-right', 'enthusiastic']
      let gIdx = 0
      setActiveGesture(gesturePool[0])
      gestureTimerRef.current = setInterval(() => {
        gIdx = (gIdx + 1) % gesturePool.length
        setActiveGesture(gesturePool[gIdx])
      }, 1800)
    }

    const startFallbackSyllables = () => {
      if (wordTimerRef.current) clearInterval(wordTimerRef.current)
      wordTimerRef.current = setInterval(() => {
        if (wordIdx < words.length) {
          const w = words[wordIdx]
          setCurrentWord(w)
          playWordVisemes(w, 280)
          wordIdx++
        } else {
          if (wordTimerRef.current) clearInterval(wordTimerRef.current)
          setViseme('closed')
          setCurrentWord('')
          if (onSpeechEnd) onSpeechEnd()
        }
      }, 300)
    }

    const hasSpeechSynth = typeof window !== 'undefined' && 'speechSynthesis' in window

    if (hasSpeechSynth) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.05
      utterance.pitch = 1.25

      const voices = window.speechSynthesis.getVoices()
      const viVoice = voices.find((v) => v.lang.includes('vi') || v.name.includes('Vietnamese'))
      if (viVoice) utterance.voice = viVoice

      utterance.onboundary = (event) => {
        if (event.name === 'word' || event.charIndex !== undefined) {
          const substring = text.slice(event.charIndex)
          const matchedWord = substring.split(/\s+/)[0] || ''
          setCurrentWord(matchedWord)
          playWordVisemes(matchedWord, 280)
        }
      }

      utterance.onstart = () => {
        // Fallback timer keeps pace if onboundary is unavailable
        startFallbackSyllables()
      }

      utterance.onend = () => {
        if (wordTimerRef.current) clearInterval(wordTimerRef.current)
        if (gestureTimerRef.current) clearInterval(gestureTimerRef.current)
        if (visemeTimerRef.current) clearTimeout(visemeTimerRef.current)
        setViseme('closed')
        setCurrentWord('')
        if (onSpeechEnd) onSpeechEnd()
      }

      utterance.onerror = () => {
        startFallbackSyllables()
      }

      try {
        window.speechSynthesis.speak(utterance)
      } catch {
        startFallbackSyllables()
      }
    } else {
      startFallbackSyllables()
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      if (wordTimerRef.current) clearInterval(wordTimerRef.current)
      if (gestureTimerRef.current) clearInterval(gestureTimerRef.current)
      if (visemeTimerRef.current) clearTimeout(visemeTimerRef.current)
    }
  }, [isSpeaking, text, gesture, onSpeechEnd])

  return { viseme, activeGesture, currentWord }
}
