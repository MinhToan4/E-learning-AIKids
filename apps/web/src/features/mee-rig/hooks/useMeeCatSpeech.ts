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
 * - A / Ă / Â -> 'open' (Mở cong hạt dẻ to thoáng)
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

  const wordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const gestureTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (gesture !== 'auto') {
      setActiveGesture(gesture)
    }
  }, [gesture])

  // Kích hoạt một nhịp mở khẩu hình khớp với từ đang đọc
  const triggerWordViseme = (word: string, paceMs: number = 320) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)

    const clean = word.replace(/[.,!?;:"'()]/g, '').trim()
    if (!clean) {
      setViseme('closed')
      return
    }

    const dominant = getDominantViseme(clean)
    setViseme(dominant)

    // Khẩu hình mở trong 70% thời lượng từ, sau đó tự khép về closed trước từ kế tiếp
    const openHoldMs = Math.max(160, Math.min(260, Math.round(paceMs * 0.7)))
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
      if (wordTimerRef.current) clearInterval(wordTimerRef.current)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      if (gestureTimerRef.current) clearInterval(gestureTimerRef.current)
      setViseme('closed')
      setCurrentWord('')
      return
    }

    const words = text.trim().split(/\s+/).filter(Boolean)
    if (words.length === 0) return

    let wordIdx = 0
    const paceMs = 320 // 320ms mỗi từ tương ứng tốc độ đọc chuẩn ~190 wpm

    // 1. Kích hoạt ngay lập tức từ đầu tiên
    setCurrentWord(words[0])
    triggerWordViseme(words[0], paceMs)
    wordIdx = 1

    // 2. Chạy bộ timer nhịp điệu luân chuyển từng từ (Cadence Loop)
    if (wordTimerRef.current) clearInterval(wordTimerRef.current)
    wordTimerRef.current = setInterval(() => {
      if (wordIdx < words.length) {
        const w = words[wordIdx]
        setCurrentWord(w)
        triggerWordViseme(w, paceMs)
        wordIdx++
      } else {
        if (wordTimerRef.current) clearInterval(wordTimerRef.current)
        setViseme('closed')
        setCurrentWord('')
        if (onSpeechEnd) onSpeechEnd()
      }
    }, paceMs)

    // 3. Tự động luân chuyển cử chỉ khi để chế độ auto
    if (gesture === 'auto') {
      const gesturePool: Gesture[] = ['point-left', 'explain', 'point-left', 'enthusiastic']
      let gIdx = 0
      setActiveGesture(gesturePool[0])
      gestureTimerRef.current = setInterval(() => {
        gIdx = (gIdx + 1) % gesturePool.length
        setActiveGesture(gesturePool[gIdx])
      }, 2000)
    }

    // 4. Phát âm thanh qua Web SpeechSynthesis (nếu trình duyệt hỗ trợ)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.95
        utterance.pitch = 1.1

        const voices = window.speechSynthesis.getVoices()
        const viVoice = voices.find((v) => v.lang.includes('vi') || v.name.includes('Vietnamese'))
        if (viVoice) utterance.voice = viVoice

        utterance.onboundary = (event) => {
          if (event.name === 'word' || event.charIndex !== undefined) {
            const substring = text.slice(event.charIndex)
            const matchedWord = substring.split(/\s+/)[0] || ''
            if (matchedWord) {
              setCurrentWord(matchedWord)
              triggerWordViseme(matchedWord, paceMs)
            }
          }
        }

        utterance.onend = () => {
          if (wordTimerRef.current) clearInterval(wordTimerRef.current)
          if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
          if (gestureTimerRef.current) clearInterval(gestureTimerRef.current)
          setViseme('closed')
          setCurrentWord('')
          if (onSpeechEnd) onSpeechEnd()
        }

        utterance.onerror = () => {
          // Vẫn để wordTimer tiếp tục chạy hết câu thoại
        }

        window.speechSynthesis.speak(utterance)
      } catch {
        // Fallback tự động chạy qua wordTimer
      }
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      if (wordTimerRef.current) clearInterval(wordTimerRef.current)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      if (gestureTimerRef.current) clearInterval(gestureTimerRef.current)
    }
  }, [isSpeaking, text, gesture, onSpeechEnd])

  return { viseme, activeGesture, currentWord }
}
