/**
 * QuestionBankPicker — Chọn câu hỏi từ ngân hàng câu hỏi để thêm vào bài học.
 *
 * WHY: Giáo viên không cần tạo mới từ đầu — có thể chọn từ 40+ câu có sẵn
 * hoặc từ câu hỏi của chính họ đã tạo trước.
 *
 * Giao diện: Modal/drawer với filter theo bank, tag, difficulty + grid preview.
 */
import { useState, useEffect, useCallback } from 'react'
import { Search, X, Check, BookOpen, RefreshCw } from 'lucide-react'
import { api } from '@/shared/lib/api'
import { QUESTION_BANK_TAGS } from '../lib/authoring'
import type { QuestionBankBank, QuestionBankItem } from '../lib/authoring'
import type { EditableQuestion } from './QuizQuestionBuilder'

type Props = {
  selectedIds: string[]
  onSelect: (questions: EditableQuestion[]) => void
  onClose: () => void
}

const DIFFICULTY_CONFIG = {
  gentle: { label: 'Nhẹ nhàng', emoji: '🌱', color: '#34d399' },
  steady: { label: 'Vừa sức', emoji: '⚡', color: '#60a5fa' },
  challenge: { label: 'Nâng cao', emoji: '🔥', color: '#f97316' },
} as const

export function QuestionBankPicker({ selectedIds, onSelect, onClose }: Props) {
  const [banks, setBanks] = useState<QuestionBankBank[]>([])
  const [activeBankId, setActiveBankId] = useState<string | null>(null)
  const [items, setItems] = useState<QuestionBankItem[]>([])
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set(selectedIds))
  const [searchText, setSearchText] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [activeDifficulty, setActiveDifficulty] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load banks on mount
  useEffect(() => {
    void loadBanks()
  }, [])

  async function loadBanks() {
    setLoading(true)
    try {
      const data = await api<{ banks: QuestionBankBank[] }>('/api/teacher/question-banks')
      setBanks(data.banks ?? [])
      if (data.banks?.[0]) {
        setActiveBankId(data.banks[0].id)
      }
    } catch {
      setError('Không thể tải ngân hàng câu hỏi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // Load items when bank changes
  useEffect(() => {
    if (!activeBankId) return
    void loadItems(activeBankId)
  }, [activeBankId])

  const loadItems = useCallback(async (bankId: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeTag) params.set('tags', activeTag)
      if (activeDifficulty) params.set('difficulty', activeDifficulty)
      const query = params.toString()
      const data = await api<{ items: QuestionBankItem[] }>(`/api/teacher/question-banks/${bankId}/items${query ? `?${query}` : ''}`)
      setItems(data.items ?? [])
    } catch {
      setError('Không thể tải câu hỏi.')
    } finally {
      setLoading(false)
    }
  }, [activeTag, activeDifficulty])

  // Reload items when filters change
  useEffect(() => {
    if (activeBankId) void loadItems(activeBankId)
  }, [activeTag, activeDifficulty, activeBankId, loadItems])

  const toggleItem = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleApply = () => {
    const selected = items.filter((item) => checkedIds.has(item.id))
    const editableQuestions: EditableQuestion[] = selected.map((item) => ({
      id: `qb-${item.id}-${Date.now()}`,
      prompt: item.prompt,
      options: item.options,
      answer: item.answer,
      explanation: item.explanation,
      imageUrl: item.imageUrl,
      tags: item.tags,
      ageMin: item.ageMin,
      ageMax: item.ageMax,
      difficulty: item.difficulty,
    }))
    onSelect(editableQuestions)
    onClose()
  }

  const filteredItems = items.filter((item) => {
    if (searchText.trim()) {
      const q = searchText.toLowerCase()
      return item.prompt.toLowerCase().includes(q)
        || item.explanation.toLowerCase().includes(q)
    }
    return true
  })

  const activeBank = banks.find((b) => b.id === activeBankId)
  const checkedCount = checkedIds.size

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'flex-end',
      background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        width: '100%', maxWidth: '840px', margin: '0 auto',
        maxHeight: '90vh', borderRadius: '1.25rem 1.25rem 0 0',
        background: '#fff',
        border: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 -12px 40px rgba(15,23,42,0.15)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0',
          flexShrink: 0, background: '#f8fafc',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2rem', height: '2rem', borderRadius: '0.625rem',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookOpen size={14} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Ngân hàng câu hỏi</div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                {checkedCount > 0 ? `Đã chọn ${checkedCount} câu` : 'Chọn câu hỏi để thêm vào bài học'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {checkedCount > 0 && (
              <button
                type="button"
                onClick={handleApply}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 1.25rem', borderRadius: '0.625rem', border: 'none',
                  background: '#6366f1', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                <Check size={14} /> Thêm {checkedCount} câu
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '0.5rem', border: '1px solid #e2e8f0', background: '#fff', borderRadius: '0.5rem', color: '#64748b', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Bank tabs */}
        {banks.length > 1 && (
          <div style={{
            display: 'flex', gap: '0', padding: '0 1.5rem',
            borderBottom: '1px solid #e2e8f0', flexShrink: 0, overflowX: 'auto',
          }}>
            {banks.map((bank) => (
              <button
                key={bank.id}
                type="button"
                onClick={() => setActiveBankId(bank.id)}
                style={{
                  padding: '0.75rem 1rem', border: 'none', background: 'transparent',
                  color: activeBankId === bank.id ? '#8b5cf6' : '#64748b',
                  fontSize: '0.875rem', fontWeight: activeBankId === bank.id ? 700 : 500,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  borderBottom: activeBankId === bank.id ? '2px solid #6366f1' : '2px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                {bank.isSystem ? '🏛️ ' : '📚 '}{bank.title}
                <span style={{ marginLeft: '0.375rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                  ({bank.itemCount})
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Filter bar */}
        <div style={{
          display: 'flex', gap: '0.75rem', padding: '0.875rem 1.5rem',
          borderBottom: '1px solid #e2e8f0', flexShrink: 0,
          flexWrap: 'wrap', alignItems: 'center',
          background: '#f8fafc',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '160px' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm câu hỏi..."
              style={{
                width: '100%', paddingLeft: '2.25rem', paddingRight: '0.75rem',
                paddingTop: '0.5rem', paddingBottom: '0.5rem',
                borderRadius: '0.625rem', border: '1.5px solid #e2e8f0',
                background: '#fff', color: '#0f172a',
                fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Tag filter */}
          <select
            value={activeTag ?? ''}
            onChange={(e) => setActiveTag(e.target.value || null)}
            style={{
              padding: '0.5rem 0.75rem', borderRadius: '0.625rem',
              border: '1.5px solid #e2e8f0', background: '#fff',
              color: '#0f172a', fontSize: '0.875rem', outline: 'none',
            }}
          >
            <option value="">🏷️ Tất cả chủ đề</option>
            {QUESTION_BANK_TAGS.map((tag) => (
              <option key={tag.id} value={tag.id}>{tag.emoji} {tag.label}</option>
            ))}
          </select>

          {/* Difficulty filter */}
          <select
            value={activeDifficulty ?? ''}
            onChange={(e) => setActiveDifficulty(e.target.value || null)}
            style={{
              padding: '0.5rem 0.75rem', borderRadius: '0.625rem',
              border: '1.5px solid #e2e8f0', background: '#fff',
              color: '#0f172a', fontSize: '0.875rem', outline: 'none',
            }}
          >
            <option value="">⚡ Tất cả độ khó</option>
            <option value="gentle">🌱 Nhẹ nhàng</option>
            <option value="steady">⚡ Vừa sức</option>
            <option value="challenge">🔥 Nâng cao</option>
          </select>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '3rem', color: '#64748b' }}>
              <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Đang tải...</span>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#e11d48' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚠️</div>
              <div>{error}</div>
              <button
                type="button"
                onClick={() => activeBankId && void loadItems(activeBankId)}
                style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1.5px solid rgba(225,29,72,0.3)', background: 'transparent', color: '#e11d48', cursor: 'pointer' }}
              >
                Thử lại
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📭</div>
              <div>Không tìm thấy câu hỏi phù hợp.</div>
              {(activeTag || activeDifficulty || searchText) && (
                <button
                  type="button"
                  onClick={() => { setActiveTag(null); setActiveDifficulty(null); setSearchText('') }}
                  style={{ marginTop: '0.75rem', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', border: 'none', background: '#ede9fe', color: '#8b5cf6', cursor: 'pointer', fontSize: '0.875rem' }}
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <div style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '0.25rem' }}>
                {filteredItems.length} câu hỏi • {activeBank?.title}
                {!activeBank?.isSystem && (
                  <span style={{ marginLeft: '0.5rem', color: '#6366f1' }}>
                    (ngân hàng của bạn)
                  </span>
                )}
              </div>
              {filteredItems.map((item) => {
                const checked = checkedIds.has(item.id)
                const diff = DIFFICULTY_CONFIG[item.difficulty]
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    style={{
                      display: 'flex', gap: '1rem', padding: '0.875rem 1rem',
                      borderRadius: '0.75rem', cursor: 'pointer',
                      border: checked ? '1.5px solid #6366f1' : '1.5px solid #e2e8f0',
                      background: checked ? '#ede9fe' : '#fff',
                      transition: 'all 0.15s',
                    }}
                  >
                    {/* Checkbox */}
                    <div style={{
                      width: '1.25rem', height: '1.25rem', borderRadius: '0.375rem', flexShrink: 0,
                      border: checked ? '2px solid #6366f1' : '2px solid #cbd5e1',
                      background: checked ? '#6366f1' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {checked && <Check size={10} color="#fff" />}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.5, marginBottom: '0.375rem' }}>
                        {item.prompt}
                      </div>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '2rem',
                          background: diff.color + '22', color: diff.color,
                          border: `1px solid ${diff.color}44`, fontWeight: 600,
                        }}>
                          {diff.emoji} {diff.label}
                        </span>
                        {item.tags.slice(0, 2).map((tag) => {
                          const tagDef = QUESTION_BANK_TAGS.find((t) => t.id === tag)
                          return tagDef ? (
                            <span key={tag} style={{
                              fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '2rem',
                              background: '#ede9fe', color: '#8b5cf6',
                              border: '1px solid #ddd6fe',
                            }}>
                              {tagDef.emoji} {tagDef.label}
                            </span>
                          ) : null
                        })}
                        <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                          {item.ageMin}–{item.ageMax} tuổi
                        </span>
                      </div>
                      {/* Options preview */}
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginTop: '0.375rem' }}>
                        {item.options.map((opt, i) => (
                          <span key={i} style={{
                            fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '0.375rem',
                            background: i === item.answer ? '#dcfce7' : '#f1f5f9',
                            color: i === item.answer ? '#16a34a' : '#64748b',
                            border: `1px solid ${i === item.answer ? '#bbf7d0' : '#e2e8f0'}`,
                            fontWeight: i === item.answer ? 600 : 400,
                          }}>
                            {String.fromCharCode(65 + i)}. {opt.length > 30 ? `${opt.slice(0, 30)}…` : opt}
                            {i === item.answer && ' ✓'}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Image thumbnail if present */}
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt="Minh họa"
                        style={{ width: '3rem', height: '3rem', objectFit: 'cover', borderRadius: '0.5rem', flexShrink: 0, opacity: 0.85 }}
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {checkedCount > 0 && (
          <div style={{
            padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0, background: '#fff',
          }}>
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Đã chọn <strong style={{ color: '#6366f1' }}>{checkedCount}</strong> câu hỏi
            </span>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setCheckedIds(new Set())}
                style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Bỏ chọn tất cả
              </button>
              <button
                type="button"
                onClick={handleApply}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
                }}
              >
                <Check size={14} /> Thêm {checkedCount} câu vào bài học
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CSS animation for spinner */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
