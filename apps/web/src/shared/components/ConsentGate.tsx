import type { ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { useAuth } from '@/shared/store/auth'

// ── ConsentGate ────────────────────────────────────────────────────────────
// Dùng để block tính năng bị tắt bởi phụ huynh trên màn hình học sinh.
// Khi tính năng bị tắt → hiển thị overlay thông báo thay vì nội dung thật.
// WHY: Tách enforcement ra component riêng thay vì scatter if/else khắp nơi.
//      Mọi tính năng cần consent chỉ cần bọc bằng <ConsentGate cap="..."/>.

type ConsentCap = 'allowAiCreate' | 'allowPhoto' | 'allowExport'

const CAP_LABELS: Record<ConsentCap, { name: string; desc: string }> = {
  allowAiCreate: {
    name: 'Phòng sáng tạo AI',
    desc: 'Ba / Mẹ chưa bật quyền sử dụng Studio AI cho con.',
  },
  allowPhoto: {
    name: 'Dùng ảnh từ thiết bị',
    desc: 'Ba / Mẹ chưa bật quyền dùng camera và thư viện ảnh cho con.',
  },
  allowExport: {
    name: 'Chia sẻ tác phẩm',
    desc: 'Ba / Mẹ đã tắt tính năng chia sẻ ra ngoài ứng dụng.',
  },
}

type Props = {
  /** Consent capability key on User */
  cap: ConsentCap
  /** Content to show when the cap is granted */
  children: ReactNode
  /** Display mode: 'overlay' = full-screen lock (default), 'inline' = small banner */
  mode?: 'overlay' | 'inline'
}

export function ConsentGate({ cap, children, mode = 'overlay' }: Props) {
  const user = useAuth((s) => s.user)

  // Non-child sessions (parent/teacher/admin) → always allow
  if (!user || user.role !== 'student') return <>{children}</>

  // Gate logic:
  // Only block when parent explicitly turned it off (user[cap] === false).
  // If true or undefined (default allowed for student), allow through.
  const isBlocked = user[cap] === false
  if (!isBlocked) return <>{children}</>

  const label = CAP_LABELS[cap]

  if (mode === 'inline') {
    return (
      <span
        role="alert"
        aria-live="polite"
        title={label.desc}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: '#d97706',
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: 8,
          padding: '4px 10px',
          cursor: 'default',
        }}
      >
        <Lock size={12} aria-hidden="true" />
        Đã bị tắt bởi Ba / Mẹ
      </span>
    )
  }

  // mode === 'overlay' — full page lock screen with Soft Clay card
  return (
    <div className="w-full flex-1 flex items-center justify-center p-4">
      <div
        role="alert"
        aria-live="polite"
        className="aikid-flat-panel mx-auto my-auto flex max-w-lg flex-col items-center justify-center gap-4 rounded-3xl border-2 border-orange-200/80 bg-white/95 p-8 text-center shadow-clay backdrop-blur-md"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-100 to-orange-100 border border-orange-200 shadow-soft flex items-center justify-center">
          <Lock size={28} className="text-orange-500" aria-hidden="true" />
        </div>

        <div>
          <h2 className="font-display font-black text-xl text-slate-800 mb-1">
            {label.name} chưa được bật
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-600 max-w-xs leading-relaxed">
            {label.desc}
          </p>
        </div>

        <p className="text-xs font-semibold text-slate-500 bg-orange-50/80 border border-orange-200/90 rounded-2xl p-3 leading-relaxed">
          📱 Nhờ <strong className="text-orange-600 font-black">Ba / Mẹ</strong> vào{' '}
          <em>Góc Phụ Huynh → Con của tôi → Quyền an toàn của con</em>{' '}
          để bật tính năng này nhé!
        </p>
      </div>
    </div>
  )
}
