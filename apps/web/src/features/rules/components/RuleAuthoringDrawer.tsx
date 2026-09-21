import { useState, useEffect } from 'react'
import { X, CheckCircle2, Video, HelpCircle, Award, Save, Sparkles, Mic } from 'lucide-react'
import type { AikiRule, RuleQuestion } from '../types'
import { Button } from '@/shared/components/ui/Button'
import { useToast } from '@/shared/hooks/useToast'

type Props = {
  rule: AikiRule | null
  isOpen: boolean
  onClose: () => void
  onSave?: (updatedRule: AikiRule) => void
}

export function RuleAuthoringDrawer({ rule, isOpen, onClose, onSave }: Props) {
  const { showToast } = useToast()
  const [formData, setFormData] = useState<AikiRule | null>(rule)
  const [activeTab, setActiveTab] = useState<'video' | 'questions' | 'poster'>('video')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setFormData(rule)
  }, [rule])

  if (!isOpen || !formData) return null

  const handleFieldChange = <K extends keyof AikiRule>(field: K, val: AikiRule[K]) => {
    setFormData((prev) => (prev ? { ...prev, [field]: val } : null))
  }

  const handleQuestionChange = (
    qIndex: 0 | 1,
    field: keyof RuleQuestion,
    val: unknown,
  ) => {
    setFormData((prev) => {
      if (!prev) return null
      const updatedQuestions = [...prev.questions] as [RuleQuestion, RuleQuestion]
      updatedQuestions[qIndex] = {
        ...updatedQuestions[qIndex],
        [field]: val,
      }
      return {
        ...prev,
        questions: updatedQuestions,
      }
    })
  }

  const handleOptionChange = (qIndex: 0 | 1, optIndex: 0 | 1 | 2, val: string) => {
    setFormData((prev) => {
      if (!prev) return null
      const updatedQuestions = [...prev.questions] as [RuleQuestion, RuleQuestion]
      const currentOptions = [...updatedQuestions[qIndex].options] as [string, string, string]
      currentOptions[optIndex] = val
      updatedQuestions[qIndex] = {
        ...updatedQuestions[qIndex],
        options: currentOptions,
      }
      return {
        ...prev,
        questions: updatedQuestions,
      }
    })
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      if (onSave && formData) {
        onSave(formData)
      }
      showToast(`✅ Đã lưu nội dung Quy tắc ${formData.id}: ${formData.shortTitle}`, 'success')
      onClose()
    }, 400)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-100 border border-amber-300 px-2 py-0.5 text-xs font-black text-amber-900">
                🛡️ CMS Soạn Thảo Quy Tắc Vàng
              </span>
              <span className="text-xs font-bold text-slate-500">{formData.code}</span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-slate-900 line-clamp-1">
              Quy tắc {formData.id}: {formData.shortTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-extrabold transition-all ${
              activeTab === 'video'
                ? 'border-brand-500 text-brand-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Video size={16} />
            <span>1. Video & Giọng Đọc</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-extrabold transition-all ${
              activeTab === 'questions'
                ? 'border-brand-500 text-brand-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <HelpCircle size={16} />
            <span>2. Bộ Câu Hỏi Ôn Tập (2 câu)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('poster')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-extrabold transition-all ${
              activeTab === 'poster'
                ? 'border-brand-500 text-brand-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Award size={16} />
            <span>3. Poster Vàng Thưởng</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: VIDEO & GIỌNG ĐỌC */}
          {activeTab === 'video' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề lớn của Quy tắc
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold focus:border-brand-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên rút gọn
                </label>
                <input
                  type="text"
                  value={formData.shortTitle}
                  onChange={(e) => handleFieldChange('shortTitle', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold focus:border-brand-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL Video bài giảng (MP4/YouTube)
                  </label>
                  <input
                    type="text"
                    placeholder="https://... hoặc đường dẫn file .mp4"
                    value={formData.videoUrl ?? ''}
                    onChange={(e) => handleFieldChange('videoUrl', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono focus:border-brand-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thời lượng ước tính (giây)
                  </label>
                  <input
                    type="number"
                    value={formData.durationSec}
                    onChange={(e) => handleFieldChange('durationSec', parseInt(e.target.value, 10) || 45)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold focus:border-brand-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  🎙️ Nội dung AIKI đọc diễn cảm (Audio Text)
                </label>
                <textarea
                  rows={2}
                  value={formData.audioVoiceText}
                  onChange={(e) => handleFieldChange('audioVoiceText', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs leading-relaxed focus:border-brand-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  🐱 AIKI mách nhỏ (Aiki Tip)
                </label>
                <textarea
                  rows={2}
                  value={formData.akiTip}
                  onChange={(e) => handleFieldChange('akiTip', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs leading-relaxed focus:border-brand-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB 2: BỘ CÂU HỎI ÔN TẬP */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              {[0, 1].map((qIdx) => {
                const question = formData.questions[qIdx as 0 | 1]
                return (
                  <div
                    key={question.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-purple-100 border border-purple-200 px-2.5 py-0.5 text-xs font-black text-purple-800">
                        Câu {qIdx + 1} / 2
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">3 Lựa chọn (A, B, C)</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Câu hỏi trắc nghiệm
                      </label>
                      <input
                        type="text"
                        value={question.prompt}
                        onChange={(e) => handleQuestionChange(qIdx as 0 | 1, 'prompt', e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold focus:border-brand-500 focus:outline-hidden"
                      />
                    </div>

                    {/* 3 Options */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">
                        Các đáp án (Tích chọn đáp án đúng):
                      </label>
                      {[0, 1, 2].map((optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-answer-${qIdx}`}
                            checked={question.correctIndex === optIdx}
                            onChange={() => handleQuestionChange(qIdx as 0 | 1, 'correctIndex', optIdx as 0 | 1 | 2)}
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                            title="Chọn làm đáp án đúng"
                          />
                          <input
                            type="text"
                            value={question.options[optIdx as 0 | 1 | 2]}
                            onChange={(e) => handleOptionChange(qIdx as 0 | 1, optIdx as 0 | 1 | 2, e.target.value)}
                            className={`w-full rounded-lg border px-3 py-1.5 text-xs ${
                              question.correctIndex === optIdx
                                ? 'border-emerald-400 bg-emerald-50 text-emerald-950 font-bold'
                                : 'border-slate-300 bg-white'
                            }`}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Hints & Feedback */}
                    <div className="grid grid-cols-1 gap-2 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-purple-700">
                          🐱 Gợi ý mách nhỏ của AIKI:
                        </label>
                        <input
                          type="text"
                          value={question.hint}
                          onChange={(e) => handleQuestionChange(qIdx as 0 | 1, 'hint', e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-emerald-700">
                          🎉 Lời chúc mừng khi chọn Đúng:
                        </label>
                        <input
                          type="text"
                          value={question.successFeedback}
                          onChange={(e) => handleQuestionChange(qIdx as 0 | 1, 'successFeedback', e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-rose-700">
                          🐱 Lời nhắc khích lệ khi chọn Sai:
                        </label>
                        <input
                          type="text"
                          value={question.retryFeedback}
                          onChange={(e) => handleQuestionChange(qIdx as 0 | 1, 'retryFeedback', e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* TAB 3: POSTER VÀNG */}
          {activeTab === 'poster' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Đường dẫn Poster Vàng (Poster Image Path)
                </label>
                <input
                  type="text"
                  value={formData.posterImage}
                  onChange={(e) => handleFieldChange('posterImage', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono focus:border-brand-500 focus:outline-hidden"
                />
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 flex flex-col items-center justify-center">
                <p className="text-xs font-bold text-amber-900 mb-2">Xem trước Poster số {formData.id}:</p>
                <img
                  src={formData.posterImage}
                  alt={formData.title}
                  className="max-h-60 rounded-xl border border-amber-300 shadow-md object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Hủy bỏ
          </button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="gap-2 cursor-pointer"
          >
            <Save size={15} />
            <span>{saving ? 'Đang lưu...' : 'Lưu Quy Tắc Vàng'}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
