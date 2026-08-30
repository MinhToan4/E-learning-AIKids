import { useState, useEffect, useRef } from 'react'

export type Viseme = 'closed' | 'open' | 'round' | 'smile' | 'half'

export type Gesture =
  | 'auto'
  | 'point-left'
  | 'point-right'
  | 'explain'
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
  const [activeGesture, setActiveGesture] = useState<Gesture>(gesture)
  const [currentWord, setCurrentWord] = useState<string>('')

  const wordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const gestureTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const boundaryFiredRef = useRef<boolean>(false)

  useEffect(() => {
    setActiveGesture(gesture)
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
      boundaryFiredRef.current = false
      return
    }

    const words = text
      .trim()
      .split(/[\s,.;:!?/\\-]+/)
      .filter(Boolean)

    if (words.length === 0) return

    boundaryFiredRef.current = false

    // Auto gesture cycling for lecture presentation
    if (gesture === 'auto') {
      const lectureGesturePool: Gesture[] = [
        'point-left',
        'explain',
        'point-left',
        'explain',
      ]
      let gIdx = 0
      setActiveGesture(lectureGesturePool[0])
      gestureTimerRef.current = setInterval(() => {
        gIdx = (gIdx + 1) % lectureGesturePool.length
        setActiveGesture(lectureGesturePool[gIdx])
      }, 3000)
    }

    // Function to start cadence timer fallback if onboundary is not supported
    const startFallbackWordTimer = () => {
      if (wordTimerRef.current) return
      let wordIdx = 0
      const paceMs = 300
      wordTimerRef.current = setInterval(() => {
        if (boundaryFiredRef.current) {
          if (wordTimerRef.current) {
            clearInterval(wordTimerRef.current)
            wordTimerRef.current = null
          }
          return
        }
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

    // WEB SPEECH SYNTHESIS WITH ONSTART & ONBOUNDARY REAL-TIME SYNC
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.95
        utterance.pitch = 1.1

        const voices = window.speechSynthesis.getVoices()
        const viVoice = voices.find((v) => v.lang.includes('vi') || v.name.includes('Vietnamese') || v.lang.includes('VI'))
        if (viVoice) utterance.voice = viVoice

        // Khi âm thanh THỰC SỰ phát ra từ loa
        utterance.onstart = () => {
          if (words.length > 0) {
            setCurrentWord(words[0])
            triggerWordViseme(words[0], 280)
          }

          setTimeout(() => {
            if (!boundaryFiredRef.current && isSpeaking) {
              startFallbackWordTimer()
            }
          }, 380)
        }

        // Bắt chính xác từng từ khi voice đọc đến ký tự tương ứng
        utterance.onboundary = (event) => {
          if (event.name === 'word' || event.name === 'sentence' || !event.name) {
            boundaryFiredRef.current = true
            const charIdx = event.charIndex ?? 0
            const remaining = text.slice(charIdx).trim()
            const currentToken = remaining.split(/[\s,.;:!?/\\-]+/)[0]
            if (currentToken) {
              setCurrentWord(currentToken)
              triggerWordViseme(currentToken, 280)
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
          startFallbackWordTimer()
        }

        window.speechSynthesis.speak(utterance)
      } catch {
        startFallbackWordTimer()
      }
    } else {
      startFallbackWordTimer()
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
