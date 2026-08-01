/**
 * GameSelector — Chọn game cho bài học với card UI trực quan.
 *
 * WHY: Thay thế dropdown khó hiểu bằng card grid đẹp, có hình minh họa,
 * mô tả ngắn và badge. Giáo viên click để chọn 1 game cụ thể hoặc cho
 * phép học sinh chọn từ nhiều game.
 *
 * Mode:
 *   - 'required': Giáo viên chọn đúng 1 game (required)
 *   - 'student_choice': Giáo viên tick nhiều game, học sinh chọn khi vào bài
 */
import { useState } from 'react'
import { Check, Users, Lock, Puzzle } from 'lucide-react'
import { GAME_OPTIONS, type LectureDraft } from '../lib/authoring'

type GameMode = 'required' | 'student_choice'

type Props = {
  gameType: string
  gameMode: GameMode
  gameAllowedTypes: string[]
  onChangeGameType: (type: string) => void
  onChangeGameMode: (mode: GameMode) => void
  onChangeAllowedTypes: (types: string[]) => void
  disabled?: boolean
}

const GAME_ICONS: Record<string, string> = {
  'data-runner': '🏃',
  'truth-patrol': '🚀',
  'battle-math': '⚔️',
  'math-kids': '⚽',
  'edukiz': '🏭',
  'blockly': '🧩',
}

const GAME_BADGES: Record<string, { label: string; color: string }> = {
  'data-runner': { label: 'Tùy chỉnh', color: '#6366f1' },
  'truth-patrol': { label: 'Tùy chỉnh', color: '#6366f1' },
  'battle-math': { label: 'Tự vận hành', color: '#10b981' },
  'math-kids': { label: 'Tự vận hành', color: '#10b981' },
  'edukiz': { label: 'Tự vận hành', color: '#10b981' },
  'blockly': { label: 'Tự vận hành', color: '#10b981' },
}

export function GameSelector({ gameType, gameMode, gameAllowedTypes, onChangeGameType, onChangeGameMode, onChangeAllowedTypes, disabled = false }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const isStudentChoice = gameMode === 'student_choice'

  const handleCardClick = (id: string) => {
    if (isStudentChoice) {
      // Toggle in allowed list
      if (gameAllowedTypes.includes(id)) {
        if (gameAllowedTypes.length <= 1) return // Tối thiểu 1 game
        onChangeAllowedTypes(gameAllowedTypes.filter((t) => t !== id))
      } else {
        onChangeAllowedTypes([...gameAllowedTypes, id])
        if (!gameType) onChangeGameType(id)
      }
    } else {
      // Single select
      onChangeGameType(id)
      onChangeAllowedTypes([id])
    }
  }

  const isSelected = (id: string) => {
    if (isStudentChoice) return gameAllowedTypes.includes(id)
    return gameType === id
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Mode toggle */}
      <div style={{
        display: 'flex', gap: '0.5rem', padding: '0.25rem',
        background: '#f1f5f9', borderRadius: '0.75rem',
        border: '1px solid #e2e8f0',
      }}>
        <ModeButton
          active={!isStudentChoice}
          icon={<Lock size={14} />}
          label="Giáo viên chọn"
          sublabel="1 game cố định"
          onClick={() => {
            onChangeGameMode('required')
            if (gameAllowedTypes.length > 0) onChangeGameType(gameAllowedTypes[0])
            else if (gameType) onChangeAllowedTypes([gameType])
          }}
        />
        <ModeButton
          active={isStudentChoice}
          icon={<Users size={14} />}
          label="Học sinh chọn"
          sublabel="Nhiều game để chọn"
          onClick={() => {
            onChangeGameMode('student_choice')
            if (!gameAllowedTypes.includes(gameType) && gameType) {
              onChangeAllowedTypes([gameType])
            }
          }}
        />
      </div>

      {/* Info */}
      <div style={{
        padding: '0.625rem 0.875rem', borderRadius: '0.625rem',
        background: '#ede9fe', border: '1px solid #ddd6fe',
        fontSize: '0.8125rem', color: '#6366f1',
      }}>
        {isStudentChoice
          ? '👆 Tick nhiều game — học sinh sẽ thấy menu chọn game khi vào bài học.'
          : '👆 Chọn đúng 1 game — học sinh sẽ vào thẳng game này mà không cần chọn.'}
      </div>

      {/* Game cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
        {GAME_OPTIONS.map((game) => {
          const selected = isSelected(game.id)
          const badge = GAME_BADGES[game.id]
          const icon = GAME_ICONS[game.id]
          const hovered = hoveredId === game.id
          const needsConfig = !game.selfContained // Cần JSON config

          return (
            <div
              key={game.id}
              onClick={() => handleCardClick(game.id)}
              onMouseEnter={() => setHoveredId(game.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                position: 'relative', padding: '1rem', borderRadius: '0.875rem',
                cursor: 'pointer',
                border: selected
                  ? '2px solid #6366f1'
                  : hovered
                    ? '2px solid rgba(99,102,241,0.4)'
                    : '2px solid #e2e8f0',
                background: selected
                  ? '#ede9fe'
                  : hovered
                    ? '#f5f3ff'
                    : '#fff',
                transition: 'all 0.2s',
                userSelect: 'none',
              }}
            >
              {/* Check indicator */}
              <div style={{
                position: 'absolute', top: '0.5rem', right: '0.5rem',
                width: '1.25rem', height: '1.25rem', borderRadius: isStudentChoice ? '0.25rem' : '50%',
                border: selected ? '2px solid #6366f1' : '2px solid #cbd5e1',
                background: selected ? '#6366f1' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                {selected && <Check size={10} color="#fff" />}
              </div>

              {/* Icon */}
              <div style={{ fontSize: '2rem', marginBottom: '0.625rem', lineHeight: 1 }}>
                {icon}
              </div>

              {/* Badge */}
              {badge && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0.125rem 0.5rem', borderRadius: '2rem',
                  background: badge.color + '22', color: badge.color,
                  fontSize: '0.6875rem', fontWeight: 700, marginBottom: '0.375rem',
                  border: `1px solid ${badge.color}44`,
                }}>
                  {badge.label}
                </div>
              )}

              {/* Name */}
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.375rem', lineHeight: 1.3 }}>
                {game.label}
              </div>

              {/* Description */}
              <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
                {game.description}
              </div>

              {/* Config required indicator */}
              {needsConfig && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  marginTop: '0.5rem', fontSize: '0.6875rem', color: '#f97316',
                }}>
                  <Puzzle size={11} />
                  <span>Cần cài đặt dữ liệu game</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      {isStudentChoice && gameAllowedTypes.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 0.875rem', borderRadius: '0.625rem',
          background: '#dcfce7', border: '1px solid #bbf7d0',
          fontSize: '0.8125rem', color: '#16a34a',
        }}>
          <Check size={14} />
          <span>
            Học sinh có thể chọn {gameAllowedTypes.length} game:&nbsp;
            <strong>
              {gameAllowedTypes
                .map((id) => GAME_OPTIONS.find((g) => g.id === id)?.label ?? id)
                .join(', ')}
            </strong>
          </span>
        </div>
      )}

      {!isStudentChoice && gameType && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 0.875rem', borderRadius: '0.625rem',
          background: '#ede9fe', border: '1px solid #ddd6fe',
          fontSize: '0.8125rem', color: '#6366f1',
        }}>
          <Lock size={14} />
          <span>
            Bài học này sẽ dùng game:&nbsp;
            <strong>{GAME_OPTIONS.find((g) => g.id === gameType)?.label ?? gameType}</strong>
          </span>
        </div>
      )}
    </div>
  )
}

function ModeButton({
  active, icon, label, sublabel, onClick,
}: {
  active: boolean
  icon: React.ReactNode
  label: string
  sublabel: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.625rem 0.875rem', borderRadius: '0.5rem', border: 'none',
        background: active ? '#6366f1' : 'transparent',
        color: active ? '#fff' : '#64748b',
        cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
      }}
    >
      <span style={{ opacity: active ? 1 : 0.7 }}>{icon}</span>
      <div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: '0.6875rem', opacity: 0.7 }}>{sublabel}</div>
      </div>
    </button>
  )
}
