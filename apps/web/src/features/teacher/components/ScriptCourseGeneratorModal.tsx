/**
 * ScriptCourseGeneratorModal.tsx
 * AI Script-to-Course Studio Wizard
 *
 * Wizard 3 bước:
 * - Bước 1: Nhập/Upload kịch bản (Textarea + File upload .txt, .docx, .md + nút 'Phân tích kịch bản bằng AI')
 * - Bước 2: Review Thực thể (2 cột: Nhân vật quen thuộc vs mới; Bối cảnh quen thuộc vs mới)
 * - Bước 3: Xem trước các Trạm học được tự động sinh (4 pha AIKids, LearnCards, CheckQuestions, Scenes)
 *
 * Khi hoàn tất, gọi callback `onApplyGeneratedCourse(result)` để thêm vào danh sách khóa học.
 */

import React, { useState, useRef } from 'react'
import {
  X,
  Sparkles,
  Upload,
  FileText,
  UserCheck,
  UserPlus,
  Compass,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Tv,
  HelpCircle,
  Gamepad2,
  BookOpen,
  ArrowRight,
  AlertCircle,
  Copy,
  Check,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react'
import { unzipSync, strFromU8 } from 'fflate'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import {
  analyzeLessonScript,
  PRESET_CHARACTERS,
  type ScriptAnalysisResult,
  type ScriptEntity,
  type ScriptBackground,
  type GeneratedStationDraft,
} from '../lib/script-analyzer'

interface ScriptCourseGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyGeneratedCourse: (result: ScriptAnalysisResult) => void
}

const SAMPLE_SCRIPT = `Trạm 1: Cuộc Gặp Gỡ Với Mèo AIKI Và Robot Pi
Bối cảnh: Lớp học AI
Mèo AIKI: Xin chào các bạn nhỏ, tớ là AIKI! Chào mừng các bạn đến với học viện AIKids!
Bé Bo: Chào Mèo AIKI! Tớ muốn học cách dùng máy tính bảng để sáng tạo tranh vẽ!
Robot Pi: Tớ là Pi, trợ lý robot mới đến từ Trạm vũ trụ AI. Tớ có thể đồng hành cùng các bạn trên laptop bạc!
Mèo AIKI: Quy tắc Vàng số 1: Luôn kiểm tra kỹ thông tin và hỏi ý kiến thầy cô trước khi chia sẻ dữ liệu nhé!

Trạm 2: Bí Kíp Hiệp Sĩ An Toàn Trên Không Gian Mạng
Bối cảnh: Thư viện thần tiên
Robot Pi: Các bạn có biết máy tính bảng và mạng internet kết nối thế giới như thế nào không?
Cô Sonet: Sonet lưu ý các bạn nhỏ không bao giờ được chia sẻ mật khẩu riêng tư cho người lạ.
Bé Bo: Đố các bạn biết khi gặp thông tin lạ nghi ngờ là fake news, chúng mình nên làm gì?
Mèo AIKI: Chúng ta sẽ nhờ người lớn hỗ trợ và quét sự thật cùng Truth Patrol!`

export function ScriptCourseGeneratorModal({
  isOpen,
  onClose,
  onApplyGeneratedCourse,
}: ScriptCourseGeneratorModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [scriptText, setScriptText] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<ScriptAnalysisResult | null>(null)
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const styleInputRef = useRef<HTMLInputElement>(null)
  const [selectedPresetCharIds, setSelectedPresetCharIds] = useState<string[]>(['char-aki'])
  const [styleReferenceImages, setStyleReferenceImages] = useState<Array<{ id: string; name: string; url: string }>>([])

  if (!isOpen) return null

  // Đọc file .txt, .md hoặc .docx
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setErrorMessage(null)

    try {
      if (file.name.endsWith('.docx')) {
        // Unzip file docx và đọc word/document.xml
        const arrayBuffer = await file.arrayBuffer()
        const unzipped = unzipSync(new Uint8Array(arrayBuffer))
        const documentXmlBytes = unzipped['word/document.xml']

        if (documentXmlBytes) {
          const xmlContent = strFromU8(documentXmlBytes)
          // Trích xuất text từ các thẻ <w:t>...</w:t>
          const matches = xmlContent.match(/<w:t[^>]*>([^<]+)<\/w:t>/g)
          if (matches) {
            const extracted = matches
              .map((tag) => tag.replace(/<[^>]+>/g, ''))
              .join(' ')
            setScriptText(extracted.replace(/\s+/g, ' ').trim())
          } else {
            setScriptText('Không tìm thấy nội dung văn bản trong file docx.')
          }
        } else {
          setScriptText('File docx không chứa word/document.xml hợp lệ.')
        }
      } else {
        // File văn bản thuần .txt, .md
        const text = await file.text()
        setScriptText(text)
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Không thể đọc nội dung file.')
    }
  }

  // Tải lên ảnh style/mẫu đính kèm ở Bước 1
  const handleStyleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setStyleReferenceImages((prev) => [
            ...prev,
            {
              id: `ref-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              name: file.name,
              url: reader.result as string,
            },
          ])
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  // Cập nhật ảnh đại diện nhân vật ở Bước 2
  const handleUpdateCharacterAvatar = (charId: string, isKnown: boolean, file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const dataUrl = reader.result
        setAnalysisResult((prev) => {
          if (!prev) return prev
          if (isKnown) {
            return {
              ...prev,
              knownCharacters: prev.knownCharacters.map((c) =>
                c.id === charId ? { ...c, avatarUrl: dataUrl } : c
              ),
            }
          } else {
            return {
              ...prev,
              newCharacters: prev.newCharacters.map((c) =>
                c.id === charId ? { ...c, avatarUrl: dataUrl, status: 'ready' } : c
              ),
            }
          }
        })
      }
    }
    reader.readAsDataURL(file)
  }

  // Cập nhật ảnh bối cảnh ở Bước 2
  const handleUpdateBackgroundImg = (bgId: string, isKnown: boolean, file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const dataUrl = reader.result
        setAnalysisResult((prev) => {
          if (!prev) return prev
          if (isKnown) {
            return {
              ...prev,
              knownBackgrounds: prev.knownBackgrounds.map((bg) =>
                bg.id === bgId ? { ...bg, imageUrl: dataUrl } : bg
              ),
            }
          } else {
            return {
              ...prev,
              newBackgrounds: prev.newBackgrounds.map((bg) =>
                bg.id === bgId ? { ...bg, imageUrl: dataUrl, status: 'ready' } : bg
              ),
            }
          }
        })
      }
    }
    reader.readAsDataURL(file)
  }

  // Thực hiện phân tích AI
  const handleAnalyze = () => {
    if (!scriptText.trim()) {
      setErrorMessage('Vui lòng nhập hoặc tải file kịch bản trước khi phân tích.')
      return
    }

    setAnalyzing(true)
    setErrorMessage(null)

    try {
      const result = analyzeLessonScript(scriptText, {
        selectedCharacterIds: selectedPresetCharIds,
      })
      setAnalysisResult(result)
      setStep(2)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Lỗi phân tích kịch bản.')
    } finally {
      setAnalyzing(false)
    }
  }

  // Copy prompt
  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedPromptId(id)
    setTimeout(() => setCopiedPromptId(null), 2000)
  }

  // Hoàn tất và apply
  const handleComplete = () => {
    if (!analysisResult) return
    onApplyGeneratedCourse(analysisResult)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="script-studio-title"
    >
      <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-3xl border-2 border-border bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border/80 bg-gradient-to-r from-sky-50 via-brand-50/50 to-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-xs">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <h2 id="script-studio-title" className="font-display text-xl font-black text-text">
                AI Script-to-Course Studio
              </h2>
              <p className="text-xs text-muted font-medium">
                Tự động bẻ kịch bản thành Trạm học chuẩn 4 pha & sinh prompt Soft Clay
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 text-muted hover:text-text transition cursor-pointer"
            aria-label="Đóng cửa sổ"
          >
            <X size={18} />
          </button>
        </div>

        {/* Wizard Stepper */}
        <div className="flex items-center border-b border-border/60 bg-slate-50/70 px-6 py-3">
          <div className="flex items-center gap-2 text-xs font-black">
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full transition-all',
                step === 1 ? 'bg-brand-500 text-white shadow-xs' : 'bg-brand-100 text-brand-700'
              )}
            >
              1
            </span>
            <span className={step === 1 ? 'text-brand-700 font-bold' : 'text-muted'}>
              Nhập kịch bản
            </span>
          </div>

          <ChevronRight size={14} className="mx-3 text-muted" />

          <div className="flex items-center gap-2 text-xs font-black">
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full transition-all',
                step === 2
                  ? 'bg-brand-500 text-white shadow-xs'
                  : step > 2
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-slate-200 text-slate-500'
              )}
            >
              2
            </span>
            <span className={step === 2 ? 'text-brand-700 font-bold' : 'text-muted'}>
              Review Thực thể
            </span>
          </div>

          <ChevronRight size={14} className="mx-3 text-muted" />

          <div className="flex items-center gap-2 text-xs font-black">
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full transition-all',
                step === 3 ? 'bg-brand-500 text-white shadow-xs' : 'bg-slate-200 text-slate-500'
              )}
            >
              3
            </span>
            <span className={step === 3 ? 'text-brand-700 font-bold' : 'text-muted'}>
              Xem trước Lộ trình
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {errorMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Upload / Input */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="script-textarea" className="text-sm font-extrabold text-text">
                  Dán kịch bản bài học hoặc phân cảnh:
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="!min-h-8 !text-xs font-bold text-brand-600 hover:bg-brand-50"
                    onClick={() => setScriptText(SAMPLE_SCRIPT)}
                  >
                    💡 Dùng kịch bản mẫu AIKids
                  </Button>
                </div>
              </div>

              <textarea
                id="script-textarea"
                rows={10}
                className="w-full rounded-2xl border-2 border-border p-4 font-mono text-sm leading-relaxed outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                placeholder="Ví dụ:
Trạm 1: Khám phá AI
Mèo AIKI: Xin chào các bạn nhỏ!
Bé Bo: Chào Mèo AIKI, hôm nay chúng mình học gì thế?
Mèo AIKI: Quy tắc Vàng: Luôn kiểm tra kỹ thông tin..."
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
              />

              {/* Upload box */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/40 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-2xs border border-sky-100">
                    <Upload size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text">
                      Hoặc tải file kịch bản lên (.txt, .docx, .md)
                    </p>
                    {fileName && (
                      <p className="text-[11px] font-bold text-brand-600">Đã chọn: {fileName}</p>
                    )}
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.md,.docx"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="!min-h-9 text-xs font-extrabold cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileText size={14} />
                  <span>Chọn tệp tin</span>
                </Button>
              </div>

              {/* Mục: Nhân vật tham gia kịch bản */}
              <div className="flex flex-col gap-2 rounded-2xl border-2 border-border/80 bg-slate-50/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <span>🎭</span> Nhân vật tham gia kịch bản (chọn từ thư viện):
                  </span>
                  <span className="text-[11px] font-bold text-muted">
                    Click để chọn/bỏ chọn nhân vật xuất hiện
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-1">
                  {PRESET_CHARACTERS.map((char) => {
                    const isSelected = selectedPresetCharIds.includes(char.id)
                    return (
                      <button
                        key={char.id}
                        type="button"
                        onClick={() => {
                          setSelectedPresetCharIds((prev) =>
                            isSelected ? prev.filter((id) => id !== char.id) : [...prev, char.id]
                          )
                        }}
                        className={cn(
                          "flex items-center gap-2.5 rounded-xl border-2 p-2.5 text-left transition cursor-pointer",
                          isSelected
                            ? "border-brand-500 bg-brand-50/80 shadow-xs"
                            : "border-slate-200 bg-white hover:border-slate-300 opacity-75"
                        )}
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-2xs border border-border/60">
                          {char.id === 'char-aki' ? '🐱' : char.id === 'char-zico' ? '👦' : '🧒'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-black text-slate-900 truncate">{char.name}</span>
                            {isSelected && (
                              <span className="text-[9px] font-black rounded-full bg-brand-500 text-white px-1.5 py-0.2 shrink-0">
                                ✓ Đã chọn
                              </span>
                            )}
                          </div>
                          <span className="block text-[10px] text-muted truncate mt-0.5">{char.role}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Mục: Tải lên ảnh mẫu / Style đính kèm */}
              <div className="flex flex-col gap-2 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/40 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-black text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                      <span>🎨</span> Tải lên ảnh mẫu / Style đính kèm (tùy chọn)
                    </p>
                    <p className="text-[11px] text-amber-800/80 font-medium mt-0.5">
                      Đính kèm ảnh tham chiếu nhân vật hoặc bối cảnh để AI bám sát phong cách visual
                    </p>
                  </div>

                  <input
                    type="file"
                    ref={styleInputRef}
                    onChange={handleStyleImageUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="!min-h-9 text-xs font-extrabold cursor-pointer shrink-0 border-amber-300 bg-white hover:bg-amber-100 text-amber-900"
                    onClick={() => styleInputRef.current?.click()}
                  >
                    <Upload size={14} />
                    <span>📤 Tải lên ảnh nhân vật / bối cảnh mẫu</span>
                  </Button>
                </div>

                {styleReferenceImages.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2.5">
                    {styleReferenceImages.map((img) => (
                      <div key={img.id} className="relative group size-16 rounded-xl border border-amber-300 bg-white overflow-hidden shadow-2xs">
                        <img src={img.url} alt={img.name} className="size-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setStyleReferenceImages((prev) => prev.filter((i) => i.id !== img.id))}
                          className="absolute top-1 right-1 size-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer hover:bg-rose-600"
                          title="Gỡ ảnh này"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-2 flex justify-end">
                <Button
                  type="button"
                  className="gap-2 px-6 font-extrabold shadow-sm cursor-pointer"
                  disabled={analyzing || !scriptText.trim()}
                  onClick={handleAnalyze}
                >
                  <Sparkles size={16} />
                  <span>{analyzing ? 'Đang phân tích kịch bản...' : 'Phân tích kịch bản bằng AI'}</span>
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Review Entities */}
          {step === 2 && analysisResult && (
            <div className="flex flex-col gap-6">
              <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
                <h3 className="font-display text-base font-extrabold text-sky-950">
                  {analysisResult.courseTitle}
                </h3>
                <p className="text-xs text-sky-800/90 mt-0.5">{analysisResult.rawScriptSummary}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Cột 1: Nhân vật */}
                <div className="flex flex-col gap-3 rounded-2xl border border-border p-4 bg-slate-50/40">
                  <div className="flex items-center justify-between">
                    <h4 className="flex items-center gap-1.5 font-display text-sm font-black text-text">
                      <UserCheck size={16} className="text-brand-600" />
                      <span>Nhân vật ({analysisResult.knownCharacters.length + analysisResult.newCharacters.length})</span>
                    </h4>
                    <span className="text-[11px] font-bold text-muted">
                      {analysisResult.knownCharacters.length} sẵn có · {analysisResult.newCharacters.length} mới
                    </span>
                  </div>

                  {/* Quen thuộc */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted">
                      Nhân vật quen thuộc (Sẵn asset)
                    </p>
                    {analysisResult.knownCharacters.map((char) => (
                      <div
                        key={char.id}
                        className="flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="size-10 shrink-0 overflow-hidden rounded-xl border border-emerald-300 bg-white flex items-center justify-center shadow-2xs">
                              {char.avatarUrl ? (
                                <img
                                  src={char.avatarUrl}
                                  alt={char.name}
                                  className="size-full object-cover"
                                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                                />
                              ) : (
                                <span className="text-xl">
                                  {char.id === 'char-aki' ? '🐱' : char.id === 'char-zico' ? '👦' : '🧒'}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-black text-emerald-950 truncate block">{char.name}</span>
                              <span className="block text-[10px] text-emerald-700 truncate">{char.role}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <label className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2 py-1 text-[10px] font-extrabold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer shadow-2xs">
                              <Upload size={11} />
                              <span>{char.avatarUrl ? 'Thay ảnh' : 'Tải ảnh lên'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0]
                                  if (f) handleUpdateCharacterAvatar(char.id, true, f)
                                  e.target.value = ''
                                }}
                              />
                            </label>
                            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-emerald-700 border border-emerald-200">
                              Sẵn có
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mới */}
                  <div className="space-y-2 mt-2">
                    <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted">
                      Nhân vật mới (Cần tạo hình Soft Clay)
                    </p>
                    {analysisResult.newCharacters.length === 0 ? (
                      <p className="text-xs italic text-muted">Không có nhân vật mới nào.</p>
                    ) : (
                      analysisResult.newCharacters.map((char) => (
                        <div
                          key={char.id}
                          className="flex flex-col gap-2.5 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="size-12 shrink-0 overflow-hidden rounded-xl border-2 border-amber-300 bg-white flex items-center justify-center shadow-2xs">
                                {char.avatarUrl ? (
                                  <img
                                    src={char.avatarUrl}
                                    alt={char.name}
                                    className="size-full object-cover"
                                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                                  />
                                ) : (
                                  <span className="text-2xl">🎨</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="font-black text-amber-950 text-sm block truncate">{char.name}</span>
                                <span className="text-[10px] text-amber-800 font-bold block">
                                  {char.avatarUrl ? '✅ Đã nạp ảnh nhân vật' : 'Cần tạo hình Soft Clay'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <label className="inline-flex items-center gap-1 rounded-lg border border-amber-400 bg-white px-2.5 py-1 text-[11px] font-extrabold text-amber-900 hover:bg-amber-100 transition cursor-pointer shadow-2xs">
                                <Upload size={12} />
                                <span>{char.avatarUrl ? 'Thay ảnh' : 'Tải ảnh lên'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0]
                                    if (f) handleUpdateCharacterAvatar(char.id, false, f)
                                    e.target.value = ''
                                  }}
                                />
                              </label>
                              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-amber-800 border border-amber-300">
                                Mới
                              </span>
                            </div>
                          </div>

                          {char.promptVi && (
                            <div className="rounded-lg bg-white p-2 text-[11px] text-slate-700 border border-amber-200/60 font-medium leading-relaxed relative">
                              <p className="line-clamp-3">{char.promptVi}</p>
                              <button
                                type="button"
                                onClick={() => handleCopyPrompt(char.id, char.promptVi!)}
                                className="mt-1 flex items-center gap-1 text-[10px] font-bold text-brand-600 hover:text-brand-800 cursor-pointer"
                              >
                                {copiedPromptId === char.id ? (
                                  <>
                                    <Check size={11} className="text-emerald-600" />
                                    <span>Đã sao chép prompt</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={11} />
                                    <span>Sao chép Prompt 2D Soft Clay</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Cột 2: Bối cảnh */}
                <div className="flex flex-col gap-3 rounded-2xl border border-border p-4 bg-slate-50/40">
                  <div className="flex items-center justify-between">
                    <h4 className="flex items-center gap-1.5 font-display text-sm font-black text-text">
                      <Compass size={16} className="text-sky-600" />
                      <span>Bối cảnh ({analysisResult.knownBackgrounds.length + analysisResult.newBackgrounds.length})</span>
                    </h4>
                    <span className="text-[11px] font-bold text-muted">
                      {analysisResult.knownBackgrounds.length} sẵn có · {analysisResult.newBackgrounds.length} mới
                    </span>
                  </div>

                  {/* Bối cảnh quen thuộc */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted">
                      Bối cảnh quen thuộc
                    </p>
                    {analysisResult.knownBackgrounds.map((bg) => (
                      <div
                        key={bg.id}
                        className="flex flex-col gap-2 rounded-xl border border-sky-200 bg-sky-50/60 p-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sm">
                              🏫
                            </span>
                            <span className="font-bold text-sky-950">{bg.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <label className="inline-flex items-center gap-1 rounded-lg border border-sky-300 bg-white px-2 py-1 text-[10px] font-extrabold text-sky-800 hover:bg-sky-100 transition cursor-pointer shadow-2xs">
                              <Upload size={11} />
                              <span>{bg.imageUrl ? 'Thay ảnh' : 'Tải ảnh lên'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0]
                                  if (f) handleUpdateBackgroundImg(bg.id, true, f)
                                  e.target.value = ''
                                }}
                              />
                            </label>
                            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-sky-700 border border-sky-200">
                              Sẵn có
                            </span>
                          </div>
                        </div>

                        {bg.imageUrl && (
                          <div className="overflow-hidden rounded-lg aspect-video max-h-24 w-full border border-sky-200 bg-slate-100">
                            <img src={bg.imageUrl} alt={bg.name} className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Bối cảnh mới */}
                  <div className="space-y-2 mt-2">
                    <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted">
                      Bối cảnh mới (Gom cụm góc rộng)
                    </p>
                    {analysisResult.newBackgrounds.length === 0 ? (
                      <p className="text-xs italic text-muted">Sử dụng toàn bộ bối cảnh sẵn có.</p>
                    ) : (
                      analysisResult.newBackgrounds.map((bg) => (
                        <div
                          key={bg.id}
                          className="flex flex-col gap-2.5 rounded-xl border border-purple-200 bg-purple-50/60 p-3 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-200/80 text-sm">
                                🌄
                              </span>
                              <div>
                                <span className="font-bold text-purple-950 block">{bg.name}</span>
                                <span className="text-[10px] text-purple-800 font-bold block">
                                  {bg.imageUrl ? '✅ Đã có ảnh góc rộng' : 'Góc rộng mới'}
                                </span>
                              </div>
                            </div>
                            <label className="inline-flex items-center gap-1 rounded-lg border border-purple-300 bg-white px-2.5 py-1 text-[11px] font-extrabold text-purple-900 hover:bg-purple-100 transition cursor-pointer shadow-2xs">
                              <Upload size={12} />
                              <span>{bg.imageUrl ? 'Thay ảnh bối cảnh' : 'Tải ảnh bối cảnh'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0]
                                  if (f) handleUpdateBackgroundImg(bg.id, false, f)
                                  e.target.value = ''
                                }}
                              />
                            </label>
                          </div>

                          {/* Hiển thị preview góc rộng */}
                          {bg.imageUrl ? (
                            <div className="overflow-hidden rounded-xl aspect-[21/9] w-full border border-purple-200 bg-slate-100">
                              <img src={bg.imageUrl} alt={bg.name} className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                            </div>
                          ) : (
                            <div className="aspect-[21/9] w-full rounded-xl border border-dashed border-purple-300 bg-purple-100/50 flex items-center justify-center text-purple-700 text-xs font-bold">
                              🌄 Khung hình bối cảnh góc rộng (chưa có ảnh)
                            </div>
                          )}

                          {bg.promptVi && (
                            <div className="rounded-lg bg-white p-2 text-[11px] text-slate-700 border border-purple-200/60 font-medium leading-relaxed relative">
                              <p className="line-clamp-3">{bg.promptVi}</p>
                              <button
                                type="button"
                                onClick={() => handleCopyPrompt(bg.id, bg.promptVi!)}
                                className="mt-1 flex items-center gap-1 text-[10px] font-bold text-brand-600 hover:text-brand-800 cursor-pointer"
                              >
                                {copiedPromptId === bg.id ? (
                                  <>
                                    <Check size={11} className="text-emerald-600" />
                                    <span>Đã sao chép prompt</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={11} />
                                    <span>Sao chép Prompt Bối cảnh</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-2 flex items-center justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  className="gap-2 cursor-pointer"
                  onClick={() => setStep(1)}
                >
                  <ChevronLeft size={16} />
                  <span>Quay lại</span>
                </Button>
                <Button
                  type="button"
                  className="gap-2 font-extrabold cursor-pointer"
                  onClick={() => setStep(3)}
                >
                  <span>Xem trước các Trạm học</span>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Preview Generated Stations */}
          {step === 3 && analysisResult && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between rounded-2xl border border-brand-200 bg-brand-50/50 p-4">
                <div>
                  <h3 className="font-display text-base font-extrabold text-brand-950">
                    Lộ trình chuẩn 4 pha đã sẵn sàng ({analysisResult.stations.length} trạm)
                  </h3>
                  <p className="text-xs text-brand-800">
                    Khám phá (5 bước AIKI) · Trò chơi tương tác · Sáng tạo · Thử tài đánh giá
                  </p>
                </div>
              </div>

              {/* Station previews */}
              <div className="space-y-4">
                {analysisResult.stations.map((st, idx) => (
                  <div
                    key={st.id}
                    className="rounded-2xl border-2 border-border bg-white p-4 shadow-2xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-xs font-black text-brand-800">
                          {idx + 1}
                        </span>
                        <h4 className="font-display text-base font-bold text-text">
                          {st.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-black text-sky-800">
                          🎮 {st.gameType}
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-black text-emerald-800">
                          ⏱️ {st.duration}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 text-xs">
                      <div>
                        <p className="font-extrabold text-slate-700 uppercase text-[10px] tracking-wide mb-1.5">
                          5 Chặng Khám Phá (Chuẩn AIKI)
                        </p>
                        <ol className="space-y-1 text-muted font-medium">
                          {st.learnCards.map((card, cIdx) => (
                            <li key={card.id} className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-brand-400 shrink-0" />
                              <span className="truncate">{card.title}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div>
                        <p className="font-extrabold text-slate-700 uppercase text-[10px] tracking-wide mb-1.5">
                          Phân cảnh Video & Trọng tâm
                        </p>
                        <ul className="space-y-1.5 font-medium">
                          {st.scenes.slice(0, 3).map((sc) => (
                            <li
                              key={sc.id}
                              className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1 text-[11px]"
                            >
                              <span className="truncate max-w-[200px]">{sc.name}</span>
                              <div className="flex items-center gap-1">
                                {sc.skipGeneration && (
                                  <span className="rounded bg-sky-100 px-1 py-0 text-[9px] font-bold text-sky-700">
                                    Intro có sẵn
                                  </span>
                                )}
                                {sc.hasTextPlaceholder && (
                                  <span className="rounded bg-amber-100 px-1 py-0 text-[9px] font-bold text-amber-800">
                                    Chừa ô text
                                  </span>
                                )}
                                {sc.techDevice !== 'none' && sc.techDevice && (
                                  <span className="rounded bg-purple-100 px-1 py-0 text-[9px] font-bold text-purple-700">
                                    {sc.techDevice === 'tablet_pastel_blue' ? 'Tablet' : 'Laptop'}
                                  </span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="mt-2 flex items-center justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  className="gap-2 cursor-pointer"
                  onClick={() => setStep(2)}
                >
                  <ChevronLeft size={16} />
                  <span>Quay lại</span>
                </Button>

                <Button
                  type="button"
                  className="gap-2 font-extrabold shadow-md cursor-pointer px-6"
                  onClick={handleComplete}
                >
                  <CheckCircle2 size={16} />
                  <span>Tạo lộ trình & Chuyển sang soạn trạm</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
