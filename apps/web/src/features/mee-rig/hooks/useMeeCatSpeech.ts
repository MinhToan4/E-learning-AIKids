import { useState, useEffect, useRef } from 'react'

export type Viseme = 'closed' | 'open' | 'round' | 'smile' | 'half'
export type Gesture = 'auto' | 'explain' | 'point-left' | 'point-right' | 'enthusiastic' | 'idle'

export interface UseMeeCatSpeechOptions {
  text?: string
  isSpeaking?: boolean
  gesture?: Gesture
  onSpeechEnd?: () => void
}

/**
 * Xác định 1 Khẩu hình Trọng tâm (Dominant Viseme) chuẩn xác theo nguyên âm tiếng Việt:
 * - A / Ă / Â -> 'open' (Mở cong hạt đậu tròn duyên dáng)
 * - O / Ô / Ơ / U / Ư / Qu -> 'round' (Chu tròn nhỏ nhắn Ooh)
 * - E / Ê / I / Y -> 'smile' (Cười cong trăng khuyết ngọt ngào)
 * - Phụ âm nhẹ / lướt -> 'half' (Mấp máy nhỏ)
 * - Ngắt nhịp / khoảng lặng -> 'closed' (Ngậm chúm chím :3)
 */
export function getDominantViseme(word: string): Viseme {
  const clean = word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  if (!clean) return 'closed'

  // Common high-frequency Vietnamese words dictionary
  if (['chao', 'ban', 'bai', 'toan', 'lam', 'qua', 'ta', 'nha', 'bac', 'cac', 'cam', 'nam', 'tam', 'lang', 'nao', 'sao', 'tay', 'vang'].includes(clean)) return 'open'
  if (['meo', 'mee', 'be', 'di', 'nhin', 'ket', 'gi', 'nhe', 'thich', 'biet', 'tiep', 'hien', 'tien', 'em', 'khen', 'ngoi'].includes(clean)) return 'smile'
  if (['nho', 'co', 'chu', 'dung', 'hoc', 'mot', 'con', 'vui', 'thu', 'luc', 'cung', 'khong', 'so', 'tro', 'giang', 'chuc'].includes(clean)) return 'round'

  // Vowel Regex Matching
  if (/[aăâ]/.test(clean)) return 'open'
  if (/[oôơuư]/.test(clean)) return 'round'
  if (/[eêiy]/.test(clean)) return 'smile'
  if (/^[bcdđghklmnpqrstvx]/.test(clean)) return 'half'

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
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const gestureTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isBoundaryActiveRef = useRef<boolean>(false)
  const lastBoundaryTimeRef = useRef<number>(0)

  useEffect(() => {
    if (gesture !== 'auto') {
      setActiveGesture(gesture)
    }
  }, [gesture])

  // Kích hoạt một nhịp mở khẩu hình khớp với từ đang đọc
  const triggerWordViseme = (word: string, durationMs: number = 340) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)

    const clean = word.replace(/[.,!?;:"'()]/g, '').trim()
    if (!clean) {
      setViseme('closed')
      return
    }

    const dominant = getDominantViseme(clean)
    setViseme(dominant)

    // Khẩu hình mở trong 65% thời lượng từ, sau đó khép về closed trước từ kế tiếp
    const openHoldMs = Math.max(140, Math.min(260, Math.round(durationMs * 0.65)))
    closeTimerRef.current = setTimeout(() => {
      setViseme('closed')
    }, openHoldMs)
  }

  useEffect(() => {
    // Dọn dẹp toàn bộ khi dừng nói hoặc text rỗng
    if (!isSpeaking || !text.trim()) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      if (gestureTimerRef.current) clearInterval(gestureTimerRef.current)
      isBoundaryActiveRef.current = false
      setViseme('closed')
      setCurrentWord('')
      return
    }

    const words = text.trim().split(/\s+/)
    let wordIdx = 0
    isBoundaryActiveRef.current = false
    lastBoundaryTimeRef.current = 0

    // Cử chỉ tay chân chuyển đổi nhịp nhàng theo câu
    if (gesture === 'auto') {
      const gesturePool: Gesture[] = ['explain', 'point-left', 'explain', 'point-right', 'enthusiastic']
      let gIdx = 0
      setActiveGesture(gesturePool[0])
      gestureTimerRef.current = setInterval(() => {
        gIdx = (gIdx + 1) % gesturePool.length
        setActiveGesture(gesturePool[gIdx])
      }, 2400)
    }

    // Fallback timer (chỉ chạy khi trình duyệt không hỗ trợ onboundary hoặc gặp lỗi)
    const runFallbackTimer = (paceMs: number = 380) => {
      if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current)
      wordIdx = 0
      fallbackTimerRef.current = setInterval(() => {
        // Nếu onboundary của TTS đã tiếp quản thì dừng ngay fallback timer
        if (isBoundaryActiveRef.current) {
          if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current)
          return
        }

        if (wordIdx < words.length) {
          const w = words[wordIdx]
          setCurrentWord(w)
          triggerWordViseme(w, paceMs)
          wordIdx++
        } else {
          if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current)
          setViseme('closed')
          setCurrentWord('')
          if (onSpeechEnd) onSpeechEnd()
        }
      }, paceMs)
    }

    const hasSpeechSynth = typeof window !== 'undefined' && 'speechSynthesis' in window

    if (hasSpeechSynth) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.98
      utterance.pitch = 1.15

      const voices = window.speechSynthesis.getVoices()
      const viVoice = voices.find((v) => v.lang.includes('vi') || v.name.includes('Vietnamese'))
      if (viVoice) utterance.voice = viVoice

      // LẮNG NGHE CHÍNH XÁC TỪNG TỪ ĐƯỢC PHÁT RA TỪ GIỌNG ĐỌC TTS
      utterance.onboundary = (event) => {
        isBoundaryActiveRef.current = true
        // Tắt ngay fallback timer nếu đang chạy
        if (fallbackTimerRef.current) {
          clearInterval(fallbackTimerRef.current)
          fallbackTimerRef.current = null
        }

        const now = performance.now()
        // Debounce chống duplicate micro events (< 160ms)
        if (now - lastBoundaryTimeRef.current < 160) return
        lastBoundaryTimeRef.current = now

        if (event.name === 'word' || event.charIndex !== undefined) {
          const substring = text.slice(event.charIndex)
          const matchedWord = substring.split(/\s+/)[0] || ''
          if (matchedWord) {
            setCurrentWord(matchedWord)
            triggerWordViseme(matchedWord, 360)
          }
        }
      }

      utterance.onstart = () => {
        // Dự phòng fallback sau 400ms nếu onboundary không phát
        setTimeout(() => {
          if (!isBoundaryActiveRef.current && isSpeaking) {
            runFallbackTimer(380)
          }
        }, 400)
      }

      utterance.onend = () => {
        if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current)
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
        if (gestureTimerRef.current) clearInterval(gestureTimerRef.current)
        isBoundaryActiveRef.current = false
        setViseme('closed')
        setCurrentWord('')
        if (onSpeechEnd) onSpeechEnd()
      }

      utterance.onerror = () => {
        runFallbackTimer(380)
      }

      try {
        window.speechSynthesis.speak(utterance)
      } catch {
        runFallbackTimer(380)
      }
    } else {
      runFallbackTimer(380)
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      if (gestureTimerRef.current) clearInterval(gestureTimerRef.current)
      isBoundaryActiveRef.current = false
    }
  }, [isSpeaking, text, gesture, onSpeechEnd])

  return { viseme, activeGesture, currentWord }
}
