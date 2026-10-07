import React from 'react'
import { Plus, Volume2, Trash2 } from 'lucide-react'
import type { DialogueLine } from '../../lib/authoring'
import type { StageBlockEditorBaseProps } from './types'

export interface DialogueBlockEditorProps extends StageBlockEditorBaseProps {
  speakTextPreview: (text: string) => void
}

export function DialogueBlockEditor({
  stageIndex,
  card,
  readOnly,
  updateLearnCard,
  speakTextPreview,
  textareaStyle,
}: DialogueBlockEditorProps) {
  return (
    <div className="mt-3.5 rounded-2xl border-2 border-orange-300 bg-orange-50/70 p-4 shadow-xs">
      <div className="flex items-center justify-end mb-3">
        {!readOnly && (
          <button
            type="button"
            onClick={() => {
              const currentList = card.dialogueLines || []
              const nextLine: DialogueLine = {
                id: `d-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                speaker: 'zico',
                role: currentList.length % 2 === 0 ? 'left' : 'right',
                text: '',
              }
              updateLearnCard(stageIndex, { dialogueLines: [...currentList, nextLine] })
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-orange-300 bg-white px-2.5 py-1 text-[11px] font-extrabold text-orange-800 hover:bg-orange-100 transition cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Plus size={13} className="shrink-0" /> Thêm câu thoại
          </button>
        )}
      </div>

      {(!card.dialogueLines || card.dialogueLines.length === 0) ? (
        <div className="rounded-xl border border-dashed border-orange-300 bg-white/70 p-4 text-center text-xs font-bold text-orange-800">
          Chưa có câu thoại nào. Bấm "+ Thêm câu thoại" để tạo kịch bản comic đối thoại.
        </div>
      ) : (
        <div className="space-y-2.5">
          {card.dialogueLines.map((line, lineIdx) => (
            <div key={line.id || lineIdx} className="rounded-xl border border-orange-200 bg-white p-3 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-orange-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted shrink-0">#{lineIdx + 1}</span>
                  <label className="text-[11px] font-bold text-text flex items-center gap-1 shrink-0">
                    Nhân vật:
                    <select
                      disabled={readOnly}
                      value={line.speaker}
                      onChange={(e) => {
                        const nextList = [...(card.dialogueLines || [])]
                        const sp = e.target.value
                        const autoRole = sp === 'zico' ? 'left' : sp === 'sonet' ? 'right' : 'center'
                        nextList[lineIdx] = { ...line, speaker: sp, role: autoRole }
                        updateLearnCard(stageIndex, { dialogueLines: nextList })
                      }}
                      className="rounded-lg border border-border px-2 py-1 text-xs font-bold text-text bg-white"
                    >
                      <option value="zico">👦 Zico (áo cam)</option>
                      <option value="sonet">🧒 Sonet (áo xanh)</option>
                      <option value="aki">🐱 Mèo AIKI</option>
                      <option value="teacher">👩‍🏫 Cô giáo</option>
                      <option value="other">Tùy chọn khác</option>
                    </select>
                  </label>
                  <label className="text-[11px] font-bold text-text flex items-center gap-1 shrink-0">
                    Vị trí:
                    <select
                      disabled={readOnly}
                      value={line.role}
                      onChange={(e) => {
                        const nextList = [...(card.dialogueLines || [])]
                        nextList[lineIdx] = { ...line, role: e.target.value as 'left' | 'right' | 'center' }
                        updateLearnCard(stageIndex, { dialogueLines: nextList })
                      }}
                      className="rounded-lg border border-border px-2 py-1 text-xs font-bold text-text bg-white"
                    >
                      <option value="left">Trái (Left)</option>
                      <option value="right">Phải (Right)</option>
                      <option value="center">Ở giữa (Center)</option>
                    </select>
                  </label>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => speakTextPreview(line.text)}
                    className="inline-flex items-center gap-1 rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-[11px] font-bold text-orange-900 hover:bg-orange-100 cursor-pointer shrink-0 whitespace-nowrap"
                    title="Nghe máy đọc thử câu này"
                  >
                    <Volume2 size={13} className="shrink-0" /> Nghe thử
                  </button>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextList = card.dialogueLines?.filter((_, i) => i !== lineIdx) || []
                        updateLearnCard(stageIndex, { dialogueLines: nextList })
                      }}
                      className="rounded-md p-1 text-coral-600 hover:bg-coral-50 cursor-pointer shrink-0"
                      title="Xóa câu thoại này"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              <label className="mt-2 block text-[11px] font-extrabold text-muted">
                Lời thoại của nhân vật
                <textarea
                  readOnly={readOnly}
                  value={line.text}
                  onChange={(e) => {
                    const nextList = [...(card.dialogueLines || [])]
                    nextList[lineIdx] = { ...line, text: e.target.value }
                    updateLearnCard(stageIndex, { dialogueLines: nextList })
                  }}
                  rows={2}
                  style={{ ...textareaStyle, marginTop: '0.2rem', minHeight: '3rem' }}
                  placeholder="Nhập câu thoại của nhân vật..."
                />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
