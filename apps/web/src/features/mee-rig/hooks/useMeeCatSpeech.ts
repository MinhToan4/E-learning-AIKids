import { useState, useEffect, useRef } from 'react'

export type Viseme = 'closed' | 'open' | 'round' | 'smile' | 'half'

export type Gesture =
  | 'auto'
  | 'point-left'
  | 'point-high-left'
  | 'point-low-left'
  | 'point-right'
  | 'point-high-right'
  | 'point-low-right'
  | 'think'
  | 'idea'
  | 'explain'
  | 'presentation'
  | 'celebrate'
  | 'celebrate-1'
  | 'celebrate-2'
  | 'clap'
  | 'enthusiastic'
  | 'idle'

export interface UseMeeCatSpeechOptions {
  text?: string
  isSpeaking?: boolean
  gesture?: Gesture
  onSpeechEnd?: () => void
}

/**
 * Phân tích âm vị & nguyên âm tiếng Việt để trả về khẩu hình mèo chuẩn xác nhất:
 * 1. OPEN (A, Ă, Â): Mở to thoáng hạt dẻ (chào, bạn, năm, bậc, đào, tạo, ngành, bản, bài, toán, làm, quà, ta, v.v.)
 * 2. SMILE (E, Ê, I, Y): Cười dẹt trăng khuyết hé răng (mèo, mee, hình, chuyên, tín, chỉ, tiên, quyết, trình, phiên, bé, v.v.)
 * 3. ROUND (O, Ô, Ơ, U, Ư): Chu tròn chúm (học, nhỏ, vui, khóa, loại, khung, so, cùng, đúng, con, cô, một, v.v.)
 * 4. HALF: Mấp máy nhẹ với phụ âm lướt
 * 5. CLOSED: Ngậm chúm chím :3
 */
export function getDominantViseme(word: string): Viseme {
  const raw = word.toLowerCase().trim()
  if (!raw) return 'closed'

  const normalized = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,!?;:"'()/\\-]/g, '')
    .trim()

  if (!normalized) return 'closed'

  // 1. Âm đuôi 'eo' (mèo, khéo, kẹo) -> SMILE
  if (/eo/.test(normalized)) return 'smile'

  // 2. Vần có nguyên âm chính 'a' (chào, bạn, năm, bậc, đào, tạo, ngành, bản, bài, toán...) -> OPEN
  if (/(ao|au|ay|ai|ang|anh|ach|am|an|ap|at|ak|a|ă|â)/.test(normalized)) {
    return 'open'
  }

  // 3. Vần 'oan', 'oat', 'oang', 'oam' (toán, đoàn, hoan) -> OPEN
  if (/oa[ntmkgc]/.test(normalized)) {
    return 'open'
  }

  // 4. Vần có nguyên âm chính 'o', 'ô', 'ơ', 'u', 'ư' (học, nhỏ, vui, khóa, loại, khung, so, cùng...) -> ROUND
  if (/(ui|uy|uo|ươ|uô|oai|oay|ong|ung|ông|ương|uông|oc|uc|ôc|ơ|u|ư|o|ô)/.test(normalized)) {
    return 'round'
  }

  // 5. Vần có nguyên âm chính 'e', 'ê', 'i', 'y' (mee, hình, tín, chỉ, đi, tiên, quyết, trình...) -> SMILE
  if (/(i[eê]|y[eê]|uy[eê]n|uy[eê]t|inh|ich|i[ntmp]|e[ntmp]|ê[ntmp]|ec|et|ee|i|e|ê|y)/.test(normalized)) {
    return 'smile'
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
  const [activeGesture, setActiveGesture] = useState<Gesture>(gesture === 'auto' ? 'point-left' : gesture)
  const [currentWord, setCurrentWord] = useState<string>('')

  const wordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const gestureTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const boundaryFiredRef = useRef<boolean>(false)

  useEffect(() => {
    setActiveGesture(gesture === 'auto' ? 'point-left' : gesture)
  }, [gesture])

  // Kích hoạt một nhịp mở - đóng khẩu hình chuẩn xác cho từng từ
  const triggerWordViseme = (word: string, paceMs: number = 300) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)

    const clean = word.replace(/[.,!?;:"'()/\\-]/g, '').trim()
    if (!clean) {
      setViseme('closed')
      return
    }

    const dominant = getDominantViseme(clean)
    setViseme(dominant)

    // Khẩu hình mở trong 75% thời lượng từ, sau đó tự khép nhẹ về closed
    const openHoldMs = Math.max(160, Math.min(260, Math.round(paceMs * 0.75)))
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
      setActiveGesture(gesture === 'auto' ? 'point-left' : gesture)
      boundaryFiredRef.current = false
      return
    }

    const words = text
      .trim()
      .split(/[\s,.;:!?/\\-]+/)
      .filter(Boolean)

    if (words.length === 0) return

    boundaryFiredRef.current = false

    // Auto gesture cycling for lecture presentation using official artist poses
    if (gesture === 'auto') {
      const lectureGesturePool: Gesture[] = [
        'point-left',
        'explain',
        'point-high-left',
        'idea',
        'think',
        'presentation',
        'celebrate-1',
      ]
      let gIdx = 0
      setActiveGesture(lectureGesturePool[0])
      gestureTimerRef.current = setInterval(() => {
        gIdx = (gIdx + 1) % lectureGesturePool.length
        setActiveGesture(lectureGesturePool[gIdx])
      }, 3200)
    }

    // 1. Tích hợp Web SpeechSynthesis API
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.pitch = 1.25

      const voices = window.speechSynthesis.getVoices()
      const viVoice = voices.find((v) => v.lang.startsWith('vi') || v.name.toLowerCase().includes('vietnam'))
      if (viVoice) {
        utterance.voice = viVoice
      }

      // Khi phát âm từng từ, bắt chính xác event 'boundary' của Web Speech API
      utterance.onboundary = (e) => {
        if (e.name === 'word') {
          boundaryFiredRef.current = true
          const charIndex = e.charIndex
          const remainingText = text.slice(charIndex)
          const match = remainingText.match(/^[\w\u00C0-\u1EF9]+/)
          const currentWordSpoken = match ? match[0] : ''
          if (currentWordSpoken) {
            setCurrentWord(currentWordSpoken)
            triggerWordViseme(currentWordSpoken, 280)
          }
        }
      }

      utterance.onend = () => {
        setViseme('closed')
        setCurrentWord('')
        if (onSpeechEnd) onSpeechEnd()
      }

      utterance.onerror = () => {
        setViseme('closed')
        setCurrentWord('')
        if (onSpeechEnd) onSpeechEnd()
      }

      window.speechSynthesis.speak(utterance)

      // 2. Fallback Cadence Engine nếu onboundary không bắn (một số trình duyệt không phát event boundary)
      const estimatedPaceMs = Math.max(240, Math.min(420, Math.round(3000 / Math.max(1, words.length))))
      let wordIdx = 0

      wordTimerRef.current = setInterval(() => {
        if (!boundaryFiredRef.current && wordIdx < words.length) {
          const w = words[wordIdx]
          setCurrentWord(w)
          triggerWordViseme(w, estimatedPaceMs)
          wordIdx++
        } else if (wordIdx >= words.length && !window.speechSynthesis.speaking) {
          setViseme('closed')
          setCurrentWord('')
        }
      }, estimatedPaceMs)
    } else {
      // Khi môi trường không có Web Speech (hoặc SSR/Mock), chạy cadence nhả chữ
      let wordIdx = 0
      const paceMs = 300
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
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      if (wordTimerRef.current) clearInterval(wordTimerRef.current)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      if (gestureTimerRef.current) clearInterval(gestureTimerRef.current)
    }
  }, [text, isSpeaking, gesture, onSpeechEnd])

  return {
    viseme,
    activeGesture,
    currentWord,
  }
}
