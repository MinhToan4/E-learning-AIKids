import { useState, useEffect, useRef } from 'react'

export type Viseme = 'closed' | 'open' | 'wide' | 'round' | 'smile'
export type Gesture = 'auto' | 'explain' | 'point-left' | 'point-right' | 'enthusiastic' | 'idle'

export interface UseMeeCatSpeechOptions {
  text?: string
  isSpeaking?: boolean
  gesture?: Gesture
  onSpeechEnd?: () => void
}

/**
 * Phoneme/Vowel to Viseme mapper for Vietnamese & English:
 * - open: a, ă, â (mở miệng vừa vặn, không há to)
 * - round: u, ư, ô, o, oo, w (tròn môi)
 * - smile: e, ê, i, y (miệng bẹt mỉm cười)
 * - closed: m, b, p (ngậm môi chúm chím)
 */
export function getVisemeFromWord(word: string): Viseme {
  const clean = word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (!clean) return 'closed'

  // Check prominent vowels & consonants
  for (const char of clean) {
    if ('ouo'.includes(char)) return 'round'
    if ('ei'.includes(char)) return 'smile'
    if ('a'.includes(char)) return 'open'
    if ('mbp'.includes(char)) return 'closed'
  }
  return 'open'
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
  const fallbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const gestureTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (gesture !== 'auto') {
      setActiveGesture(gesture)
    }
  }, [gesture])

  useEffect(() => {
    if (!isSpeaking || !text.trim()) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current)
      if (gestureTimerRef.current) clearInterval(gestureTimerRef.current)
      setViseme('closed')
      setCurrentWord('')
      return
    }

    const words = text.trim().split(/\s+/)
    let wordIdx = 0

    // Auto gesture sequence during speech
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
      if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current)
      fallbackTimerRef.current = setInterval(() => {
        if (wordIdx < words.length) {
          const w = words[wordIdx]
          setCurrentWord(w)
          setViseme(getVisemeFromWord(w))
          wordIdx++
        } else {
          // Finished speaking
          if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current)
          setViseme('closed')
          setCurrentWord('')
          if (onSpeechEnd) onSpeechEnd()
        }
      }, 260)
    }

    const hasSpeechSynth = typeof window !== 'undefined' && 'speechSynthesis' in window

    if (hasSpeechSynth) {
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.05
      utterance.pitch = 1.25 // Cheerful friendly pitch for mascot cat

      // Pick Vietnamese voice if available
      const voices = window.speechSynthesis.getVoices()
      const viVoice = voices.find((v) => v.lang.includes('vi') || v.name.includes('Vietnamese'))
      if (viVoice) {
        utterance.voice = viVoice
      }

      utterance.onboundary = (event) => {
        if (event.name === 'word' || event.charIndex !== undefined) {
          const substring = text.slice(event.charIndex)
          const matchedWord = substring.split(/\s+/)[0] || ''
          setCurrentWord(matchedWord)
          setViseme(getVisemeFromWord(matchedWord))
        }
      }

      utterance.onstart = () => {
        // Run syllable timer as smooth viseme transition loop
        startFallbackSyllables()
      }

      utterance.onend = () => {
        if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current)
        if (gestureTimerRef.current) clearInterval(gestureTimerRef.current)
        setViseme('closed')
        setCurrentWord('')
        if (onSpeechEnd) onSpeechEnd()
      }

      utterance.onerror = () => {
        // If TTS errors or blocked, fallback to timer
        startFallbackSyllables()
      }

      try {
        window.speechSynthesis.speak(utterance)
      } catch {
        startFallbackSyllables()
      }
    } else {
      // Fallback for SSR / headless test env
      startFallbackSyllables()
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current)
      if (gestureTimerRef.current) clearInterval(gestureTimerRef.current)
    }
  }, [isSpeaking, text, gesture, onSpeechEnd])

  return {
    viseme,
    activeGesture,
    currentWord,
  }
}
