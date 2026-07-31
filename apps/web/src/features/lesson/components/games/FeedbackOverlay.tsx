import { useEffect, useRef, useState } from 'react'

// WHY: FeedbackOverlay là hệ thống dopamine tập trung — thay vì mỗi game tự
// implement khen/phạt riêng, tất cả 6 game dùng cùng 1 component để:
// 1. Đồng nhất UX (cùng timing, cùng animation)
// 2. Dễ A/B test sau này
// 3. Pool khen/phạt được review bởi content team 1 lần

// ── Praise pool (6–11 tuổi, vui + phụ huynh xem được) ─────────────────────
const PRAISE_MESSAGES = [
  { icon: '🎉', text: 'Tuyệt vời quá! Con giỏi thật sự!' },
  { icon: '⭐', text: 'Wow, con thông minh thật đó!' },
  { icon: '🚀', text: 'Xuất sắc! Con đã làm được rồi!' },
  { icon: '🏆', text: 'Chính xác! Con là nhà khoa học nhí rồi!' },
  { icon: '🎯', text: 'Đúng rồi! AI cũng phải học từ con đó!' },
  { icon: '🌟', text: 'Con làm được rồi! Tự hào quá đi thôi!' },
  { icon: '🎊', text: 'Hoàn hảo! Con thông minh như giáo sư vậy!' },
  { icon: '🦁', text: 'Dũng cảm và đúng nữa! Sư tử con đó!' },
  { icon: '🎸', text: 'Rock star! Trả lời đỉnh lắm luôn!' },
  { icon: '🐬', text: 'Cá heo thông minh cũng thua con rồi!' },
  { icon: '🌈', text: 'Câu trả lời đẹp như cầu vồng ấy!' },
  { icon: '🔑', text: 'Chìa khóa vàng! Con mở được bí mật rồi!' },
  { icon: '🧩', text: 'Đúng rồi! Mảnh ghép cuối cùng khớp luôn!' },
  { icon: '🐧', text: 'Chim cánh cụt đang nhảy mừng cho con đây!' },
  { icon: '🎩', text: 'Phép thuật! Con trả lời đúng như pháp sư vậy!' },
  { icon: '💡', text: 'Bóng đèn sáng bùng! Ý tưởng siêu đẳng!' },
  { icon: '🌻', text: 'Ấm áp và chính xác — giống tia nắng mặt trời!' },
  { icon: '🎁', text: 'Phần thưởng xứng đáng cho bộ não siêu việt!' },
  { icon: '🦊', text: 'Cáo thông minh gật đầu khen con rồi!' },
  { icon: '🌠', text: 'Sao sáng! Câu trả lời chính xác như vậy đó!' },
]

// ── Encouragement pool (hài hước nhẹ, khích lệ) ───────────────────────────
const WRONG_MESSAGES = [
  { icon: '😅', main: 'Ôi suýt rồi!', sub: 'Thử lại nào bạn ơi!' },
  { icon: '🤔', main: 'Hmm, chưa đúng rồi!', sub: 'Nhưng con dũng cảm thử rồi!' },
  { icon: '💪', main: 'Không sao!', sub: 'Siêu anh hùng cũng cần thử nhiều lần!' },
  { icon: '🌱', main: 'Hạt giống cần tưới thêm!', sub: 'Đọc lại rồi thử nhé!' },
  { icon: '🐢', main: 'Rùa chậm mà chắc!', sub: 'Thử lại con nhé!' },
  { icon: '😄', main: 'Gần đúng lắm rồi!', sub: 'Cố thêm chút nữa thôi!' },
  { icon: '🎮', main: 'Level khó thật đó!', sub: 'Nhưng con làm được mà!' },
  { icon: '🔍', main: 'Thám tử nhí ơi!', sub: 'Tìm thêm manh mối rồi thử lại nhé!' },
  { icon: '🌊', main: 'Sóng to nhưng thuyền vẫn vững!', sub: 'Cố lên nào!' },
  { icon: '🦋', main: 'Bướm đẹp cũng cần thời gian!', sub: 'Thử lại một lần nữa nhé!' },
  { icon: '🍭', main: 'Kẹo ngọt chờ con!', sub: 'Ở câu đúng tiếp theo đó!' },
  { icon: '🎪', main: 'Vui là chính!', sub: 'Thử lại một lần nữa nhé!' },
]

// ── Streak messages ────────────────────────────────────────────────────────
const STREAK_LABELS: Record<number, { icon: string, text: string }> = {
  3: { icon: '🔥', text: 'Ba lần liên tiếp! Con đang bốc lắm!' },
  5: { icon: '⚡', text: 'Năm lần liên tiếp! Không thể tin nổi!' },
  7: { icon: '🌠', text: 'Bảy lần đúng liên tiếp — siêu anh hùng!' },
  10: { icon: '👑', text: 'Mười lần! Vua/Hoàng hậu câu trả lời đúng!' },
}

// Lấy random từ mảng, seed bằng attempt count để tránh lặp
function pickRandom<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed * 2654435761) % arr.length]!
}

export type FeedbackType = 'correct' | 'wrong'

type Props = {
  type: FeedbackType
  streak: number
  attempt: number
  onDismiss: () => void
}

export function FeedbackOverlay({ type, streak, attempt, onDismiss }: Props) {
  const [visible, setVisible] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isCorrect = type === 'correct'
  // Thời gian hiển thị (giảm 0.5s theo yêu cầu)
  const dismissMs = isCorrect ? 2000 : 3000

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setVisible(false)
      onDismiss()
    }, dismissMs)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  if (!visible) return null

  const praise = pickRandom(PRAISE_MESSAGES, attempt)
  const wrong = pickRandom(WRONG_MESSAGES, attempt)
  const streakLabel = STREAK_LABELS[streak] ?? null

  // WHY: Đổi từ fixed sang absolute để popup căn giữa theo game container (không bị lệch bởi sidebar).
  // Chỉnh top-10 để không bị sát mép trên.
  // Xóa viền 4px dày (nhựa/AI-like), thay bằng shadow-clay + backdrop-blur-md chuẩn thiết kế premium.
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-10 z-[100] w-11/12 max-w-md -translate-x-1/2 sm:top-14"
      role="alert"
      aria-live="assertive"
    >
      {isCorrect ? (
        // ── Correct: Premium Toast ──────────────────────────────────────────
        <div className="relative z-10 flex items-center gap-4 rounded-2xl border border-emerald-100 bg-white/90 px-5 py-3 shadow-clay backdrop-blur-md animate-[feedback-pop_0.25s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
          {/* Confetti emojis (nhẹ nhàng hơn) */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden="true">
            {['🎊', '⭐', '✨'].map((emoji, i) => (
              <span
                key={i}
                className="absolute text-base opacity-70"
                style={{
                  left: `${20 + i * 30}%`,
                  top: '-10%',
                  animation: `feedback-confetti-${i % 3} 1.2s ease-out ${i * 0.1}s forwards`,
                }}
              >
                {emoji}
              </span>
            ))}
          </div>

          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600 shadow-sm">
            {praise.icon}
          </div>
          <div className="flex-1">
            <p className="font-display text-lg font-extrabold leading-tight text-emerald-800">{praise.text}</p>
            {streakLabel && (
              <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-800">
                <span>{streakLabel.icon}</span>
                <span>{streakLabel.text}</span>
              </p>
            )}
          </div>
        </div>
      ) : (
        // ── Wrong: Premium Toast ───────────────────────────────────────
        <div className="relative z-10 flex items-center gap-4 rounded-2xl border border-red-100 bg-white/90 px-5 py-3 shadow-clay backdrop-blur-md animate-[feedback-shake_0.4s_ease-out_forwards]">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-2xl text-red-600 shadow-sm">
            {wrong.icon}
          </div>
          <div className="flex-1">
            <p className="font-display text-lg font-extrabold leading-tight text-red-700">{wrong.main}</p>
            <p className="text-sm font-semibold text-slate-600">{wrong.sub}</p>
            {streak > 2 && (
              <p className="mt-1 inline-block rounded-full bg-red-100 px-3 py-0.5 text-xs font-bold text-red-700">
                💔 Streak ×{streak} bị phá rồi!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
