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

  const granted = user[cap]

  // Gate logic:
  // allowAiCreate, allowPhoto: true = bật, false/undefined = tắt → block if !granted
  // allowExport: allowExport=false in DB = sharing HIDDEN → block if !granted (i.e. user[cap]===false)
  if (granted) return <>{children}</>

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
          color: '#6d5efc',
          background: '#f0eeff',
          border: '1px solid #ddd9ff',
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

  // mode === 'overlay' — full page lock screen
  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 320,
        gap: 16,
        padding: '40px 24px',
        textAlign: 'center',
      }}
    >
      <div style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #f0eeff 0%, #e2dcff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(109,94,252,0.15)',
      }}>
        <Lock size={30} color="#6d5efc" aria-hidden="true" />
      </div>

      <div>
        <p style={{ fontWeight: 800, fontSize: 16, color: '#2d2558', marginBottom: 6 }}>
          {label.name} chưa được bật
        </p>
        <p style={{ fontSize: 13.5, color: '#7a6ea8', lineHeight: 1.55, maxWidth: 300 }}>
          {label.desc}
        </p>
      </div>

      <p style={{
        fontSize: 12,
        color: '#a09bc4',
        background: '#fafafe',
        border: '1px solid #ede9ff',
        borderRadius: 10,
        padding: '8px 14px',
        lineHeight: 1.5,
      }}>
        📱 Nhờ <strong style={{ color: '#6d5efc' }}>Ba / Mẹ</strong> vào{' '}
        <em>Góc Phụ Huynh → Con của tôi → Quyền an toàn của con</em>{' '}
        để bật tính năng này.
      </p>
    </div>
  )
}
