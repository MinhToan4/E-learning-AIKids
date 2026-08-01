/**
 * ImageAssetPicker — Chọn ảnh từ thư mục /assets/ local.
 *
 * WHY: Chưa có cloud storage, ảnh được lưu và phục vụ từ /public/assets/ của FE.
 * Component này hiển thị danh sách preset + cho phép nhập đường dẫn thủ công.
 * Khi có cloud storage, chỉ cần thay implementation này, không đổi API.
 */
import { useState } from 'react'
import { X, ExternalLink } from 'lucide-react'

type Props = {
  value: string | null
  onChange: (url: string | null) => void
  onClose: () => void
}

// Preset assets có sẵn trong /public/assets/
const PRESET_ASSETS: { url: string; label: string; category: string }[] = [
  // Game backgrounds
  { url: '/assets/game/idea-island-map.webp', label: 'Bản đồ Ý Tưởng', category: 'game' },
  { url: '/assets/game/idea-island-map-960.webp', label: 'Bản đồ Ý Tưởng (960px)', category: 'game' },
  { url: '/assets/game/mii-game-coach.webp', label: 'Game Coach Mii', category: 'game' },
]

export function ImageAssetPicker({ value, onChange, onClose }: Props) {
  const [customUrl, setCustomUrl] = useState(value ?? '')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const categories = ['all', ...Array.from(new Set(PRESET_ASSETS.map((a) => a.category)))]

  const filtered = activeCategory === 'all'
    ? PRESET_ASSETS
    : PRESET_ASSETS.filter((a) => a.category === activeCategory)

  const handleSelect = (url: string) => {
    setCustomUrl(url)
    setPreviewUrl(url)
  }

  const handleApply = () => {
    const url = customUrl.trim() || null
    onChange(url)
    onClose()
  }

  return (
    <div style={{
      borderRadius: '1rem', border: '1.5px solid #e2e8f0',
      background: '#fff', overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(15,23,42,0.08)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9',
      }}>
        <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>
          🖼️ Chọn hình ảnh
        </span>
        <button
          type="button"
          onClick={onClose}
          style={{ padding: '0.25rem', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Category filter */}
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.25rem 0.75rem', borderRadius: '2rem', border: 'none',
                background: activeCategory === cat ? '#6366f1' : '#f1f5f9',
                color: activeCategory === cat ? '#fff' : '#64748b',
                fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 500,
                textTransform: 'capitalize',
              }}
            >
              {cat === 'all' ? '🌐 Tất cả' : cat === 'game' ? '🎮 Game' : cat}
            </button>
          ))}
        </div>

        {/* Preset grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
          {filtered.map((asset) => (
            <button
              key={asset.url}
              type="button"
              onClick={() => handleSelect(asset.url)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem',
                padding: '0.5rem', borderRadius: '0.75rem', cursor: 'pointer',
                border: customUrl === asset.url ? '2px solid #6366f1' : '1.5px solid #e2e8f0',
                background: customUrl === asset.url ? '#ede9fe' : '#f8fafc',
                transition: 'all 0.2s',
              }}
            >
              <img
                src={asset.url}
                alt={asset.label}
                style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '0.375rem' }}
                onError={(e) => { e.currentTarget.style.opacity = '0.3' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', lineHeight: 1.3 }}>{asset.label}</span>
            </button>
          ))}

          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#475569', padding: '1.5rem', fontSize: '0.875rem' }}>
              Không có ảnh trong thư mục này.
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>hoặc nhập URL thủ công</span>
          <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
        </div>

        {/* Custom URL input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={customUrl}
              onChange={(e) => { setCustomUrl(e.target.value); setPreviewUrl(e.target.value || null) }}
              placeholder="/assets/... hoặc https://..."
              style={{
                flex: 1, padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
                border: '1.5px solid #e2e8f0', background: '#fff',
                color: '#0f172a', fontSize: '0.875rem', outline: 'none',
              }}
            />
            {customUrl && (
              <a
                href={customUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', padding: '0.5rem', color: '#94a3b8' }}
                title="Xem trước"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>

          {/* Preview */}
          {previewUrl && (
            <div style={{ borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e2e8f0', height: '120px' }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextSibling instanceof HTMLElement && (e.currentTarget.nextSibling.style.display = 'flex')
                }}
              />
              <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', fontSize: '0.875rem' }}>
                Không thể tải ảnh
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
          <button
            type="button"
            onClick={() => { onChange(null); onClose() }}
            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', background: 'transparent', color: '#64748b', fontSize: '0.875rem', cursor: 'pointer' }}
          >
            Xóa ảnh
          </button>
          <button
            type="button"
            onClick={handleApply}
            style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', background: '#6366f1', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  )
}
