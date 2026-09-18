import React from 'react'
import { BookMarked } from 'lucide-react'
import { GAME_DIFFICULTIES, type LectureDraft } from '../../lib/authoring'
import { GameSelector } from '../GameSelector'
import { QuizQuestionBuilder, type EditableQuestion } from '../QuizQuestionBuilder'
import { CatalogGameBuilder } from '../CatalogGameBuilder'

export interface LectureDrawerGameTabProps {
  readOnly?: boolean
  draft: LectureDraft
  quizQuestions: EditableQuestion[]
  onChangeDraft: <K extends keyof LectureDraft>(key: K, value: LectureDraft[K]) => void
  onChangeQuizQuestions: (questions: EditableQuestion[]) => void
  onOpenBankPicker: () => void
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  border: '1.5px solid #e2e8f0',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  color: '#0f172a',
  background: '#fff',
  outline: 'none',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical',
  lineHeight: 1.5,
  fontFamily: 'inherit',
}

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '0.5rem',
}

function FormRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>
        {label}
        {hint && <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#94a3b8', marginLeft: '0.5rem' }}>{hint}</span>}
      </label>
      {children}
    </div>
  )
}

export function LectureDrawerGameTab({
  readOnly = false,
  draft,
  quizQuestions,
  onChangeDraft,
  onChangeQuizQuestions,
  onOpenBankPicker,
}: LectureDrawerGameTabProps) {
  const needsQuizConfig = draft.gameType === 'math-kids'
  const needsCatalogConfig = draft.gameType === 'data-runner' || draft.gameType === 'truth-patrol'
  const catalogGameType = draft.gameType === 'data-runner' || draft.gameType === 'truth-patrol' ? draft.gameType : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Game selector */}
      <div>
        <div style={sectionLabelStyle}>Chọn hoạt động Thử cùng Mee</div>
        <GameSelector
          disabled={readOnly}
          gameType={draft.gameType}
          gameMode={draft.gameMode}
          gameAllowedTypes={draft.gameAllowedTypes}
          onChangeGameType={(t) => onChangeDraft('gameType', t)}
          onChangeGameMode={(m) => onChangeDraft('gameMode', m)}
          onChangeAllowedTypes={(types) => onChangeDraft('gameAllowedTypes', types)}
        />
      </div>

      {/* Difficulty */}
      <FormRow label="Độ khó">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {GAME_DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              type="button"
              disabled={readOnly}
              onClick={() => onChangeDraft('gameDifficulty', d.id as 'gentle' | 'steady' | 'challenge')}
              style={{
                flex: 1,
                padding: '0.5rem 0.25rem',
                borderRadius: '0.625rem',
                cursor: readOnly ? 'default' : 'pointer',
                transition: 'all 0.2s',
                background: draft.gameDifficulty === d.id ? '#ede9fe' : '#fff',
                color: draft.gameDifficulty === d.id ? '#6d28d9' : '#64748b',
                fontSize: '0.8125rem',
                fontWeight: draft.gameDifficulty === d.id ? 700 : 500,
                border: draft.gameDifficulty === d.id ? '1.5px solid #8b5cf6' : '1.5px solid #e2e8f0',
              }}
            >
              <div>{d.label}</div>
              <div style={{ fontSize: '0.6875rem', opacity: 0.7 }}>{d.description}</div>
            </button>
          ))}
        </div>
      </FormRow>

      {/* Hướng dẫn và mục tiêu */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <FormRow label="Hướng dẫn chơi *">
          <textarea
            readOnly={readOnly}
            value={draft.gameInstruction}
            onChange={(e) => onChangeDraft('gameInstruction', e.target.value)}
            placeholder="Học sinh cần làm gì trong game?"
            rows={3}
            style={textareaStyle}
          />
        </FormRow>
        <FormRow label="Mục tiêu game *">
          <textarea
            readOnly={readOnly}
            value={draft.gameOutcome}
            onChange={(e) => onChangeDraft('gameOutcome', e.target.value)}
            placeholder="Học sinh đạt được gì khi chơi?"
            rows={3}
            style={textareaStyle}
          />
        </FormRow>
      </div>

      {/* ── Math-kids: question count + quiz builder ── */}
      {needsQuizConfig && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={sectionLabelStyle}>Câu hỏi trắc nghiệm (AI Quiz)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                Số câu:
                <input
                  type="number"
                  readOnly={readOnly}
                  min={1}
                  max={30}
                  value={draft.questionCount}
                  onChange={(e) => onChangeDraft('questionCount', Math.max(1, Math.min(30, parseInt(e.target.value) || 6)))}
                  style={{
                    width: '4rem',
                    padding: '0.25rem 0.5rem',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    background: '#fff',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                />
              </label>
              {!readOnly && (
                <button
                  type="button"
                  onClick={onOpenBankPicker}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.375rem 0.875rem',
                    borderRadius: '0.5rem',
                    background: '#ede9fe',
                    color: '#6d28d9',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid #c4b5fd',
                  }}
                >
                  <BookMarked size={13} /> Chọn từ ngân hàng
                </button>
              )}
            </div>
          </div>
          <QuizQuestionBuilder
            readOnly={readOnly}
            questions={quizQuestions}
            onChange={onChangeQuizQuestions}
          />
        </div>
      )}

      {/* ── Catalog game config ── */}
      {needsCatalogConfig && catalogGameType && (
        <div>
          <div style={sectionLabelStyle}>
            Cấu hình {catalogGameType === 'data-runner' ? '🏃 Data Runner' : '🚀 Truth Patrol'}
          </div>
          <CatalogGameBuilder
            readOnly={readOnly}
            gameType={catalogGameType}
            value={draft.gameStructuredText}
            onChange={(raw) => onChangeDraft('gameStructuredText', raw)}
          />
        </div>
      )}
    </div>
  )
}
