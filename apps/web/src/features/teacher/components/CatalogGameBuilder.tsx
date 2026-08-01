/**
 * CatalogGameBuilder — Visual builder cho data-runner và truth-patrol game config.
 *
 * Dual mode:
 *   - UI mode: Wizard trực quan (lobby → catalog → levels/waves)
 *   - JSON mode: Raw JSON editor với validation và syntax highlight
 *
 * WHY: JSON textarea quá khó dùng cho giáo viên không biết kỹ thuật.
 * Builder này hướng dẫn từng bước, validate realtime và sync với JSON.
 */
import { useState, useCallback } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, Code2, LayoutList, AlertTriangle, CheckCircle2 } from 'lucide-react'
import {
  type RunnerGameConfig, type PatrolGameConfig,
  type RunnerLevel, type RunnerItem,
  type PatrolWave, type PatrolTarget,
  parseRunnerConfig, parsePatrolConfig,
  serializeRunnerConfig, newRunnerLevel, newPatrolWave,
} from '../lib/authoring'
import { ImageAssetPicker } from './ImageAssetPicker'

type Props = {
  gameType: 'data-runner' | 'truth-patrol'
  value: string  // JSON string (gameStructuredText)
  onChange: (raw: string) => void
  readOnly?: boolean
}

export function CatalogGameBuilder({ gameType, value, onChange, readOnly = false }: Props) {
  const [mode, setMode] = useState<'ui' | 'json'>('ui')
  const [jsonText, setJsonText] = useState(value)
  const [jsonError, setJsonError] = useState<string | null>(null)

  const isRunner = gameType === 'data-runner'
  const configLabel = isRunner ? 'data-runner' : 'truth-patrol'

  // Get current parsed config or default
  const runnerConfig = isRunner ? (parseRunnerConfig(value) ?? defaultRunnerConfig()) : null
  const patrolConfig = !isRunner ? (parsePatrolConfig(value) ?? defaultPatrolConfig()) : null

  function updateRunner(config: RunnerGameConfig) {
    const raw = serializeRunnerConfig(config)
    onChange(raw)
  }

  function updatePatrol(config: PatrolGameConfig) {
    onChange(JSON.stringify(config, null, 2))
  }

  const switchToJson = () => {
    setJsonText(value || '{}')
    setJsonError(null)
    setMode('json')
  }

  const applyJson = () => {
    const parsed = isRunner ? parseRunnerConfig(jsonText) : parsePatrolConfig(jsonText)
    if (!parsed) {
      try {
        JSON.parse(jsonText)
        setJsonError(`Thiếu trường bắt buộc: lobby, catalog, ${isRunner ? 'runnerLevels' : 'patrolWaves'}`)
      } catch (e) {
        setJsonError(`JSON lỗi cú pháp: ${(e as Error).message}`)
      }
      return
    }
    onChange(jsonText)
    setJsonError(null)
    setMode('ui')
  }

  const handleJsonChange = (raw: string) => {
    setJsonText(raw)
    try {
      const parsed = JSON.parse(raw) as unknown
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        setJsonError('Phải là một JSON object {}')
        return
      }
      const c = parsed as Record<string, unknown>
      const missingFields = []
      if (!c.lobby) missingFields.push('lobby')
      if (!Array.isArray(c.catalog)) missingFields.push('catalog')
      if (isRunner && !Array.isArray(c.runnerLevels)) missingFields.push('runnerLevels')
      if (!isRunner && !Array.isArray(c.patrolWaves)) missingFields.push('patrolWaves')
      setJsonError(missingFields.length > 0 ? `Thiếu trường: ${missingFields.join(', ')}` : null)
    } catch (e) {
      setJsonError(`JSON lỗi cú pháp: ${(e as Error).message}`)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Mode toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
        <button type="button" onClick={() => mode === 'json' ? applyJson() : undefined}
          style={modeBtn(mode === 'ui')}
        >
          <LayoutList size={13} /> UI
        </button>
        <button type="button" onClick={() => mode === 'ui' ? switchToJson() : undefined}
          style={modeBtn(mode === 'json')}
        >
          <Code2 size={13} /> JSON
        </button>
      </div>

      {/* ── UI MODE ── */}
      {mode === 'ui' && (
        <>
          {isRunner && runnerConfig && (
            <RunnerBuilder config={runnerConfig} onChange={updateRunner} />
          )}
          {!isRunner && patrolConfig && (
            <PatrolBuilder config={patrolConfig} onChange={updatePatrol} />
          )}
        </>
      )}

      {/* ── JSON MODE ── */}
      {mode === 'json' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{
            padding: '0.75rem 1rem', borderRadius: '0.75rem',
            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
            fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.6,
          }}>
            💡 <strong style={{ color: '#a78bfa' }}>JSON {configLabel}</strong> — Cấu trúc cần:{' '}
            <code style={{ color: '#e2e8f0', background: 'rgba(0,0,0,0.3)', padding: '0.1em 0.3em', borderRadius: '0.25em' }}>
              {isRunner ? '{ lobby, catalog, runnerLevels }' : '{ lobby, catalog, patrolWaves }'}
            </code>
          </div>
          <textarea
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            spellCheck={false}
            style={{
              width: '100%', minHeight: '360px', fontFamily: 'monospace', fontSize: '0.8125rem',
              padding: '1rem', borderRadius: '0.75rem', resize: 'vertical',
              background: '#0f172a', color: '#e2e8f0',
              border: jsonError ? '2px solid #f97316' : '2px solid rgba(99,102,241,0.3)',
              outline: 'none', lineHeight: 1.7, boxSizing: 'border-box',
            }}
          />
          {jsonError && (
            <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316', fontSize: '0.8125rem' }}>
              <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              {jsonError}
            </div>
          )}
          {!jsonError && jsonText.trim() && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.8125rem' }}>
              <CheckCircle2 size={14} /> JSON hợp lệ
            </div>
          )}
          <button
            type="button"
            onClick={applyJson}
            disabled={!!jsonError}
            style={{
              padding: '0.625rem 1.25rem', borderRadius: '0.625rem', border: 'none', alignSelf: 'flex-start',
              background: jsonError ? 'rgba(99,102,241,0.3)' : '#6366f1',
              color: jsonError ? '#94a3b8' : '#fff', fontSize: '0.875rem', fontWeight: 600,
              cursor: jsonError ? 'not-allowed' : 'pointer',
            }}
          >
            ✅ Áp dụng JSON
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Runner Builder ────────────────────────────────────────────────────────────
function RunnerBuilder({ config, onChange }: { config: RunnerGameConfig; onChange: (c: RunnerGameConfig) => void }) {
  const [expandedSection, setExpandedSection] = useState<'lobby' | 'catalog' | string>('lobby')
  const [showImagePicker, setShowImagePicker] = useState<string | null>(null)

  const updateLobby = (patch: Partial<RunnerGameConfig['lobby']>) =>
    onChange({ ...config, lobby: { ...config.lobby, ...patch } })

  const addLevel = () => {
    const level = newRunnerLevel(config.runnerLevels.length)
    onChange({ ...config, runnerLevels: [...config.runnerLevels, level] })
    setExpandedSection(level.id)
  }

  const removeLevel = (id: string) =>
    onChange({ ...config, runnerLevels: config.runnerLevels.filter((l) => l.id !== id) })

  const updateLevel = (id: string, patch: Partial<RunnerLevel>) =>
    onChange({ ...config, runnerLevels: config.runnerLevels.map((l) => l.id === id ? { ...l, ...patch } : l) })

  const addItem = (levelId: string) => {
    const item: RunnerItem = {
      id: `item-${Date.now()}`, label: '', imageUrl: '', type: 'collect',
    }
    updateLevel(levelId, {
      items: [...(config.runnerLevels.find((l) => l.id === levelId)?.items ?? []), item],
    })
  }

  const updateItem = (levelId: string, itemId: string, patch: Partial<RunnerItem>) => {
    const level = config.runnerLevels.find((l) => l.id === levelId)
    if (!level) return
    updateLevel(levelId, {
      items: level.items.map((it) => it.id === itemId ? { ...it, ...patch } : it),
    })
  }

  const removeItem = (levelId: string, itemId: string) => {
    const level = config.runnerLevels.find((l) => l.id === levelId)
    if (!level) return
    updateLevel(levelId, { items: level.items.filter((it) => it.id !== itemId) })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Lobby section */}
      <Section
        title="🏠 Màn hình Lobby"
        expanded={expandedSection === 'lobby'}
        onToggle={() => setExpandedSection(expandedSection === 'lobby' ? '' : 'lobby')}
        status={config.lobby.title && config.lobby.description ? 'complete' : 'incomplete'}
      >
        <FieldGroup>
          <Field label="Tiêu đề Lobby *">
            <input type="text" value={config.lobby.title} onChange={(e) => updateLobby({ title: e.target.value })} placeholder="VD: Đường Đua Dữ Liệu" style={inputStyle} />
          </Field>
          <Field label="Mô tả Lobby *">
            <textarea value={config.lobby.description} onChange={(e) => updateLobby({ description: e.target.value })} placeholder="Giới thiệu ngắn về nhiệm vụ..." rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </Field>
          <Field label="Ảnh Lobby">
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="text" value={config.lobby.imageUrl} onChange={(e) => updateLobby({ imageUrl: e.target.value })} placeholder="/assets/..." style={{ ...inputStyle, flex: 1 }} />
              <button type="button" onClick={() => setShowImagePicker('lobby')} style={smallBtnStyle}>🖼️</button>
            </div>
            {showImagePicker === 'lobby' && (
              <div style={{ marginTop: '0.5rem' }}>
                <ImageAssetPicker value={config.lobby.imageUrl} onChange={(url) => { updateLobby({ imageUrl: url ?? '' }); setShowImagePicker(null) }} onClose={() => setShowImagePicker(null)} />
              </div>
            )}
          </Field>
        </FieldGroup>
      </Section>

      {/* Levels */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8' }}>
            🏁 Màn chơi ({config.runnerLevels.length})
          </span>
          <button type="button" onClick={addLevel} style={{ ...smallBtnStyle, display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem' }}>
            <Plus size={12} /> Thêm màn
          </button>
        </div>

        {config.runnerLevels.length === 0 && (
          <div style={emptyStyle}>Chưa có màn chơi. Nhấn <strong>Thêm màn</strong> để bắt đầu.</div>
        )}

        {config.runnerLevels.map((level, li) => (
          <Section
            key={level.id}
            title={`Màn ${li + 1}: ${level.title || 'Chưa đặt tên'}`}
            expanded={expandedSection === level.id}
            onToggle={() => setExpandedSection(expandedSection === level.id ? '' : level.id)}
            status={level.title && level.mission && level.items.length > 0 ? 'complete' : 'incomplete'}
            onRemove={() => removeLevel(level.id)}
          >
            <FieldGroup>
              <Field label="Tên màn chơi *">
                <input type="text" value={level.title} onChange={(e) => updateLevel(level.id, { title: e.target.value })} placeholder="VD: Màn 1 — Thu thập hình ảnh mèo" style={inputStyle} />
              </Field>
              <Field label="Nhiệm vụ *">
                <input type="text" value={level.mission} onChange={(e) => updateLevel(level.id, { mission: e.target.value })} placeholder="VD: Chọn ảnh mèo thật!" style={inputStyle} />
              </Field>
              <Field label="Ảnh nền">
                <input type="text" value={level.backgroundUrl} onChange={(e) => updateLevel(level.id, { backgroundUrl: e.target.value })} placeholder="/assets/..." style={inputStyle} />
              </Field>
              <Field label="Tốc độ (1–10)">
                <input type="number" min={1} max={10} value={level.speed ?? 5} onChange={(e) => updateLevel(level.id, { speed: parseInt(e.target.value) || 5 })} style={{ ...inputStyle, width: '6rem' }} />
              </Field>
            </FieldGroup>

            {/* Items */}
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8' }}>Vật phẩm ({level.items.length})</span>
                <button type="button" onClick={() => addItem(level.id)} style={{ ...smallBtnStyle, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Plus size={11} /> Thêm
                </button>
              </div>
              {level.items.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.375rem', alignItems: 'center' }}>
                  <select
                    value={item.type}
                    onChange={(e) => updateItem(level.id, item.id, { type: e.target.value as 'collect' | 'avoid' })}
                    style={{ ...inputStyle, width: '7.5rem', padding: '0.375rem 0.5rem' }}
                  >
                    <option value="collect">✅ Thu thập</option>
                    <option value="avoid">❌ Né tránh</option>
                  </select>
                  <input type="text" value={item.label} onChange={(e) => updateItem(level.id, item.id, { label: e.target.value })} placeholder="Nhãn vật phẩm..." style={{ ...inputStyle, flex: 1 }} />
                  <input type="text" value={item.imageUrl} onChange={(e) => updateItem(level.id, item.id, { imageUrl: e.target.value })} placeholder="/assets/..." style={{ ...inputStyle, flex: 1 }} />
                  <button type="button" onClick={() => removeItem(level.id, item.id)} style={{ padding: '0.375rem', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: '0.375rem', cursor: 'pointer' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </Section>
        ))}
      </div>
    </div>
  )
}

// ─── Patrol Builder ────────────────────────────────────────────────────────────
function PatrolBuilder({ config, onChange }: { config: PatrolGameConfig; onChange: (c: PatrolGameConfig) => void }) {
  const [expandedSection, setExpandedSection] = useState<string>('lobby')

  const updateLobby = (patch: Partial<PatrolGameConfig['lobby']>) =>
    onChange({ ...config, lobby: { ...config.lobby, ...patch } })

  const addWave = () => {
    const wave = newPatrolWave(config.patrolWaves.length)
    onChange({ ...config, patrolWaves: [...config.patrolWaves, wave] })
    setExpandedSection(wave.id)
  }

  const removeWave = (id: string) =>
    onChange({ ...config, patrolWaves: config.patrolWaves.filter((w) => w.id !== id) })

  const updateWave = (id: string, patch: Partial<PatrolWave>) =>
    onChange({ ...config, patrolWaves: config.patrolWaves.map((w) => w.id === id ? { ...w, ...patch } : w) })

  const addTarget = (waveId: string) => {
    const target: PatrolTarget = { id: `t-${Date.now()}`, text: '', label: 'fact' }
    const wave = config.patrolWaves.find((w) => w.id === waveId)
    if (!wave) return
    updateWave(waveId, { targets: [...wave.targets, target] })
  }

  const updateTarget = (waveId: string, targetId: string, patch: Partial<PatrolTarget>) => {
    const wave = config.patrolWaves.find((w) => w.id === waveId)
    if (!wave) return
    updateWave(waveId, { targets: wave.targets.map((t) => t.id === targetId ? { ...t, ...patch } : t) })
  }

  const removeTarget = (waveId: string, targetId: string) => {
    const wave = config.patrolWaves.find((w) => w.id === waveId)
    if (!wave) return
    updateWave(waveId, { targets: wave.targets.filter((t) => t.id !== targetId) })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Section title="🛸 Màn hình Lobby" expanded={expandedSection === 'lobby'} onToggle={() => setExpandedSection(expandedSection === 'lobby' ? '' : 'lobby')} status={config.lobby.title ? 'complete' : 'incomplete'}>
        <FieldGroup>
          <Field label="Tiêu đề"><input type="text" value={config.lobby.title} onChange={(e) => updateLobby({ title: e.target.value })} placeholder="VD: Biệt Đội Kiểm Chứng" style={inputStyle} /></Field>
          <Field label="Mô tả"><textarea value={config.lobby.description} onChange={(e) => updateLobby({ description: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></Field>
        </FieldGroup>
      </Section>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8' }}>🌊 Đợt ({config.patrolWaves.length})</span>
        <button type="button" onClick={addWave} style={{ ...smallBtnStyle, display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem' }}><Plus size={12} /> Thêm đợt</button>
      </div>

      {config.patrolWaves.map((wave, wi) => (
        <Section key={wave.id} title={`Đợt ${wi + 1}: ${wave.title}`} expanded={expandedSection === wave.id} onToggle={() => setExpandedSection(expandedSection === wave.id ? '' : wave.id)} status={wave.title && wave.targets.length > 0 ? 'complete' : 'incomplete'} onRemove={() => removeWave(wave.id)}>
          <FieldGroup>
            <Field label="Tên đợt *"><input type="text" value={wave.title} onChange={(e) => updateWave(wave.id, { title: e.target.value })} style={inputStyle} /></Field>
          </FieldGroup>
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8' }}>Mục tiêu ({wave.targets.length})</span>
              <button type="button" onClick={() => addTarget(wave.id)} style={{ ...smallBtnStyle, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Plus size={11} /> Thêm</button>
            </div>
            {wave.targets.map((target) => (
              <div key={target.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.375rem', alignItems: 'center' }}>
                <select value={target.label} onChange={(e) => updateTarget(wave.id, target.id, { label: e.target.value })} style={{ ...inputStyle, width: '9rem', padding: '0.375rem 0.5rem' }}>
                  <option value="fact">✅ Sự thật</option>
                  <option value="opinion">💭 Quan điểm</option>
                  <option value="fake">❌ Tin giả</option>
                  <option value="ai-generated">🤖 AI tạo ra</option>
                </select>
                <input type="text" value={target.text} onChange={(e) => updateTarget(wave.id, target.id, { text: e.target.value })} placeholder="Nội dung cần kiểm chứng..." style={{ ...inputStyle, flex: 1 }} />
                <button type="button" onClick={() => removeTarget(wave.id, target.id)} style={{ padding: '0.375rem', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '0.375rem', cursor: 'pointer' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </Section>
      ))}
    </div>
  )
}

// ─── Helper Components ─────────────────────────────────────────────────────────
function Section({ title, expanded, onToggle, status, onRemove, children }: {
  title: string; expanded: boolean; onToggle: () => void
  status: 'complete' | 'incomplete'; onRemove?: () => void; children: React.ReactNode
}) {
  return (
    <div style={{ borderRadius: '0.75rem', border: `1.5px solid ${status === 'complete' ? '#bbf7d0' : '#e2e8f0'}`, background: '#fff', overflow: 'hidden' }}>
      <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', cursor: 'pointer', background: expanded ? '#f5f3ff' : '#fafafa' }}>
        <span style={{ fontSize: '0.75rem' }}>{status === 'complete' ? '✅' : '○'}</span>
        <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{title}</span>
        {onRemove && (
          <button type="button" onClick={(e) => { e.stopPropagation(); onRemove() }} style={{ padding: '0.25rem', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '0.375rem', cursor: 'pointer' }}>
            <Trash2 size={12} />
          </button>
        )}
        {expanded ? <ChevronUp size={14} color="#64748b" /> : <ChevronDown size={14} color="#64748b" />}
      </div>
      {expanded && (
        <div style={{ padding: '0.75rem 1rem 1rem', borderTop: '1px solid #f1f5f9' }}>
          {children}
        </div>
      )}
    </div>
  )
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>{children}</div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>{label}</span>
      {children}
    </label>
  )
}

// ─── Default configs ───────────────────────────────────────────────────────────
function defaultRunnerConfig(): RunnerGameConfig {
  return {
    lobby: { title: '', description: '', imageUrl: '' },
    catalog: [],
    runnerLevels: [],
  }
}

function defaultPatrolConfig(): PatrolGameConfig {
  return {
    lobby: { title: '', description: '', imageUrl: '' },
    catalog: [],
    patrolWaves: [],
  }
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.5rem 0.625rem', borderRadius: '0.5rem',
  border: '1.5px solid #e2e8f0', background: '#fff',
  color: '#0f172a', fontSize: '0.8125rem', outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box',
}
const smallBtnStyle: React.CSSProperties = {
  padding: '0.375rem 0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(99,102,241,0.3)',
  background: 'rgba(99,102,241,0.1)', color: '#a78bfa', fontSize: '0.8125rem', cursor: 'pointer',
}
const emptyStyle: React.CSSProperties = {
  textAlign: 'center', padding: '1.25rem', borderRadius: '0.75rem',
  border: '2px dashed rgba(99,102,241,0.2)', color: '#64748b', fontSize: '0.8125rem',
}
function modeBtn(active: boolean): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: '0.375rem',
    padding: '0.375rem 0.75rem', borderRadius: '0.5rem', border: 'none',
    fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
    background: active ? '#6366f1' : '#f1f5f9',
    color: active ? '#fff' : '#64748b', transition: 'all 0.2s',
  }
}
