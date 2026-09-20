import { Info } from 'lucide-react'

// ── ConsentTooltip — card có cấu trúc, không phải đoạn văn ──────────
// badge   : dòng tóm tắt quan trọng nhất (in đậm, màu brand)
// on/off  : trạng thái ngắn gọn — màu xanh / đỏ để phân biệt nhanh
// WHY: Phụ huynh không đọc đoạn văn. Card 3 dòng scan được trong 2 giây.
export type ConsentTipProps = {
  badge: string
  on: string
  off: string
  onLabel?: string
  offLabel?: string
}

export function ConsentTooltip({ badge, on, off, onLabel = 'BẬT', offLabel = 'TẮT' }: ConsentTipProps) {
  return (
    <span className="consent-tip-wrap" style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle' }}>
      <span
        role="img"
        aria-label="Giải thích tính năng"
        className="consent-tip-icon"
        style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help', color: '#6d5efc', opacity: 0.5, transition: 'opacity 0.15s' }}
      >
        <Info size={13} aria-hidden="true" />
      </span>
      <span
        role="tooltip"
        className="consent-tip-bubble"
        style={{
          position: 'absolute',
          bottom: 'calc(100% + 10px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '252px',
          background: '#fff',
          border: '1px solid #ebe8ff',
          borderRadius: '14px',
          padding: '12px 13px 10px',
          boxShadow: '0 8px 28px rgba(109,94,252,0.14)',
          pointerEvents: 'none',
          zIndex: 50,
          opacity: 0,
          visibility: 'hidden' as const,
          transition: 'opacity 0.18s, visibility 0.18s',
        }}
      >
        {/* Badge — thông tin quan trọng nhất */}
        <span style={{
          display: 'block',
          fontWeight: 700,
          fontSize: 11,
          color: '#5646e8',
          background: '#f0eeff',
          borderRadius: 8,
          padding: '4px 8px',
          marginBottom: 9,
          letterSpacing: '0.01em',
        }}>
          {badge}
        </span>
        {/* Trạng thái BẬT */}
        <span style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 6 }}>
          <span style={{
            flexShrink: 0,
            fontWeight: 700,
            fontSize: 10,
            color: '#fff',
            background: '#178a5c',
            borderRadius: 5,
            padding: '1px 5px',
            marginTop: 1,
            lineHeight: '14px',
          }}>✓ {onLabel}</span>
          <span style={{ fontSize: 11.5, color: '#2d2558', lineHeight: '1.5' }}>{on}</span>
        </span>
        {/* Trạng thái TẮT */}
        <span style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
          <span style={{
            flexShrink: 0,
            fontWeight: 700,
            fontSize: 10,
            color: '#fff',
            background: '#b0342a',
            borderRadius: 5,
            padding: '1px 5px',
            marginTop: 1,
            lineHeight: '14px',
          }}>✕ {offLabel}</span>
          <span style={{ fontSize: 11.5, color: '#5c5272', lineHeight: '1.5' }}>{off}</span>
        </span>
        {/* Arrow */}
        <span style={{
          position: 'absolute', bottom: -7, left: '50%', transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '7px solid transparent',
          borderRight: '7px solid transparent',
          borderTop: '7px solid #fff',
        }} aria-hidden="true" />
      </span>
    </span>
  )
}
